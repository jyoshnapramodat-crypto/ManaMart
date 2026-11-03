import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { MerchantApplication } from '../models/MerchantApplication.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Post } from '../models/Post.js';
import { Promotion } from '../models/Promotion.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { isConnectedToMongo } from '../config/db.js';

// Helper to resolve the authenticated merchant's Store
async function getMerchantStore(user) {
  const userId = String(user.id || user._id);
  
  if (isConnectedToMongo) {
    try {
      let store = await Store.findOne({ userId });
      if (!store && user.merchantId) {
        store = await Store.findOne({ storeId: user.merchantId });
      }
      if (store) return store;
    } catch (err) {
      console.warn('Mongo store lookup error:', err.message);
    }
  }

  // Memory store fallback
  let memStore = mockDb.merchants.find((m) => m.userId === userId || (user.merchantId && m.id === user.merchantId));
  if (!memStore && user.isDemo) {
    memStore = mockDb.merchants[0];
  }
  return memStore;
}

// 1. Get Application Status & Document History
export async function getMyApplicationStatus(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);

    let appRecord = null;
    if (isConnectedToMongo) {
      try {
        appRecord = await MerchantApplication.findOne({ userId });
      } catch (err) {
        console.warn('Mongo app fetch error:', err.message);
      }
    }

    if (!appRecord) {
      appRecord = mockDb.pendingMerchants.find((m) => m.userId === userId || m.phone === req.user.phone);
    }

    const store = await getMerchantStore(req.user);

    return res.json({
      success: true,
      hasApplied: Boolean(appRecord || store),
      status: appRecord ? appRecord.status : (store ? store.verificationStatus : 'not_submitted'),
      application: appRecord || {
        businessName: store?.businessName || '',
        category: store?.category || 'grocery',
        status: store?.verificationStatus || 'not_submitted',
        documents: {},
        reviewHistory: [],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Submit Initial Merchant Onboarding Application with Real Documents
export async function submitMerchantApplication(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const {
      businessName,
      category,
      ownerName,
      phone,
      email,
      street,
      locality,
      city,
      pincode,
      openTime,
      closeTime,
      bankAccount,
      bankIfsc,
      bankName,
      documents = {},
    } = req.body;

    if (!businessName || !category || !street || !locality || !city) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory business and address details.' });
    }

    // Category-specific mandatory document validations
    if (['food', 'restaurant', 'bakery'].includes(category)) {
      if (!documents.fssai || !documents.fssai.number) {
        return res.status(400).json({ success: false, message: 'FSSAI License registration number is mandatory for Food and Restaurant businesses.' });
      }
    }

    if (category === 'pharmacy') {
      if (!documents.drugLicense || !documents.drugLicense.number) {
        return res.status(400).json({ success: false, message: 'Drug License number is mandatory for Pharmacies.' });
      }
    }

    const applicationData = {
      applicationId: `app-m-${uuidv4().slice(0, 8)}`,
      userId,
      businessName: businessName.trim(),
      category,
      ownerName: (ownerName || req.user.name).trim(),
      phone: (phone || req.user.phone).trim(),
      email: (email || req.user.email || '').trim().toLowerCase(),
      address: {
        street: street.trim(),
        locality: locality.trim(),
        city: city.trim(),
        pincode: pincode ? pincode.trim() : '500081',
        lat: 17.4480,
        lng: 78.3910,
      },
      openingHours: {
        openTime: openTime || '08:00 AM',
        closeTime: closeTime || '10:00 PM',
      },
      bankDetails: {
        accountNumber: bankAccount,
        ifscCode: bankIfsc,
        bankName,
      },
      documents: {
        ownerId: documents.ownerId,
        tradeLicense: documents.tradeLicense,
        panCard: documents.panCard,
        bankProof: documents.bankProof,
        fssai: documents.fssai,
        drugLicense: documents.drugLicense,
        gstin: documents.gstin,
      },
      status: 'pending_verification',
      reviewHistory: [],
    };

    let savedApp = null;
    if (isConnectedToMongo) {
      try {
        savedApp = await MerchantApplication.findOneAndUpdate(
          { userId },
          applicationData,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Mongo merchant app save error:', err.message);
      }
    }

    const existingIndex = mockDb.pendingMerchants.findIndex((m) => m.userId === userId);
    if (existingIndex !== -1) {
      mockDb.pendingMerchants[existingIndex] = applicationData;
    } else {
      mockDb.pendingMerchants.push(applicationData);
    }

    return res.status(201).json({
      success: true,
      message: 'Onboarding application and verified documents submitted successfully for administrative review.',
      application: savedApp || applicationData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Resubmit Corrected Documents (when changes requested or rejected)
export async function resubmitMerchantApplication(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const { documents, notes } = req.body;

    let app = null;
    if (isConnectedToMongo) {
      app = await MerchantApplication.findOne({ userId });
    }

    if (!app) {
      app = mockDb.pendingMerchants.find((m) => m.userId === userId);
    }

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    // Merge updated documents while preserving historical documents
    if (documents) {
      app.documents = { ...app.documents, ...documents };
    }

    app.status = 'pending_verification';
    app.resubmittedAt = new Date();
    if (notes) {
      app.reviewHistory.push({
        status: 'resubmitted',
        reviewedBy: req.user.name || 'Merchant',
        reviewedAt: new Date(),
        remarks: `Merchant resubmission note: ${notes}`,
      });
    }

    if (isConnectedToMongo && app.save) {
      await app.save();
    }

    return res.json({
      success: true,
      message: 'Updated documents resubmitted successfully. Your application is now queued for administrator review.',
      application: app,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Get Merchant Store Details & Live Metrics
export async function getMyStore(req, res) {
  try {
    const store = await getMerchantStore(req.user);

    if (!store) {
      return res.status(404).json({
        success: false,
        noStore: true,
        message: 'No store profile linked to your merchant account. Please complete onboarding.',
      });
    }

    const storeId = store.storeId || store.id;

    let totalOrders = 0;
    let todayRevenue = 0;
    let activeOrdersCount = 0;

    if (isConnectedToMongo) {
      try {
        const storeOrders = await Order.find({ storeId });
        totalOrders = storeOrders.length;
        todayRevenue = storeOrders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        activeOrdersCount = storeOrders.filter(
          (o) => !['Delivered', 'Cancelled'].includes(o.orderStatus)
        ).length;
      } catch (err) {
        console.warn('Mongo order stats fetch error:', err.message);
      }
    }

    if (totalOrders === 0) {
      const memoryOrders = mockDb.orders.filter((o) => o.merchantId === storeId || o.storeId === storeId);
      totalOrders = memoryOrders.length;
      todayRevenue = memoryOrders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || o.subtotal || 0), 0);
      activeOrdersCount = memoryOrders.filter(
        (o) => !['delivered', 'Delivered', 'cancelled', 'Cancelled'].includes(o.orderStatus)
      ).length;
    }

    return res.json({
      success: true,
      store,
      analytics: {
        todayRevenue,
        totalOrders,
        activeOrders: activeOrdersCount,
        followersCount: store.followersCount || 0,
        rating: store.rating || 4.8,
        isOpen: store.isOpen,
        isVerified: store.isVerified || store.verificationStatus === 'verified',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Update Store Operational Status (Open/Closed, Hours)
export async function updateStoreStatus(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store profile not found.' });
    }

    const storeId = store.storeId || store.id;
    const { isOpen, openTime, closeTime, businessName, category, description } = req.body;

    const updates = {};
    if (isOpen !== undefined) updates.isOpen = Boolean(isOpen);
    if (openTime) updates['openingHours.openTime'] = openTime;
    if (closeTime) updates['openingHours.closeTime'] = closeTime;
    if (businessName) updates.businessName = businessName;
    if (category) updates.category = category;

    if (isConnectedToMongo) {
      try {
        await Store.findOneAndUpdate({ storeId }, updates, { new: true });
      } catch (err) {
        console.warn('Mongo store update error:', err.message);
      }
    }

    if (isOpen !== undefined) store.isOpen = Boolean(isOpen);
    if (openTime) store.openTime = openTime;
    if (closeTime) store.closeTime = closeTime;

    return res.json({
      success: true,
      message: 'Store settings updated successfully.',
      store,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Products Management (List, Add, Edit, Delete, Toggle Stock)
export async function getStoreProducts(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) {
      return res.json({ success: true, count: 0, products: [] });
    }

    const storeId = store.storeId || store.id;
    let prods = [];

    if (isConnectedToMongo) {
      try {
        prods = await Product.find({ $or: [{ storeId }, { merchantId: storeId }] }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo products fetch error:', err.message);
      }
    }

    if (prods.length === 0) {
      prods = mockDb.products.filter((p) => p.merchantId === storeId || p.storeId === storeId);
    }

    return res.json({ success: true, count: prods.length, products: prods });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) {
      return res.status(403).json({ success: false, message: 'Please complete store onboarding before adding products.' });
    }

    const storeId = store.storeId || store.id;
    const { name, nameTelugu, category, price, mrp, isVeg, unit, description, image, tags, stockCount } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const newProd = {
      productId: `prod-${uuidv4().slice(0, 8)}`,
      storeId,
      merchantId: storeId,
      name: name.trim(),
      nameTelugu: nameTelugu ? nameTelugu.trim() : '',
      category: category || 'General Essentials',
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price),
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      inStock: true,
      stockCount: stockCount ? Number(stockCount) : 50,
      unit: unit || '1 unit',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      tags: tags || ['Fresh'],
      rating: 5.0,
      reviewCount: 0,
    };

    if (isConnectedToMongo) {
      try {
        await Product.create(newProd);
      } catch (err) {
        console.warn('Mongo product create error:', err.message);
      }
    }

    mockDb.products.unshift(newProd);

    return res.status(201).json({
      success: true,
      message: `Product "${newProd.name}" added to catalog.`,
      product: newProd,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, nameTelugu, category, price, mrp, isVeg, unit, description, inStock, stockCount, image } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (nameTelugu !== undefined) updates.nameTelugu = nameTelugu;
    if (category) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (mrp !== undefined) updates.mrp = Number(mrp);
    if (isVeg !== undefined) updates.isVeg = Boolean(isVeg);
    if (unit) updates.unit = unit;
    if (description !== undefined) updates.description = description;
    if (inStock !== undefined) updates.inStock = Boolean(inStock);
    if (stockCount !== undefined) updates.stockCount = Number(stockCount);
    if (image) updates.image = image;

    let updatedProd = null;
    if (isConnectedToMongo) {
      try {
        updatedProd = await Product.findOneAndUpdate(
          { $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
          updates,
          { new: true }
        );
      } catch (err) {
        console.warn('Mongo product update error:', err.message);
      }
    }

    const memoryProd = mockDb.products.find((p) => p.id === id || p.productId === id);
    if (memoryProd) {
      Object.assign(memoryProd, updates);
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProd || memoryProd,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      try {
        await Product.findOneAndDelete({
          $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });
      } catch (err) {
        console.warn('Mongo product delete error:', err.message);
      }
    }

    const idx = mockDb.products.findIndex((p) => p.id === id || p.productId === id);
    if (idx !== -1) {
      mockDb.products.splice(idx, 1);
    }

    return res.json({ success: true, message: 'Product removed from store catalog.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Posts & Updates Publishing System
export async function getStorePosts(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.json({ success: true, posts: [] });

    const storeId = store.storeId || store.id;
    let posts = [];

    if (isConnectedToMongo) {
      try {
        posts = await Post.find({ $or: [{ merchantId: storeId }, { storeId }] }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo posts fetch error:', err.message);
      }
    }

    if (posts.length === 0) {
      posts = mockDb.posts?.filter((p) => p.merchantId === storeId || p.storeId === storeId) || [];
    }

    return res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPost(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) {
      return res.status(403).json({ success: false, message: 'Please complete store onboarding before posting.' });
    }

    const storeId = store.storeId || store.id;
    const { caption, content, title, type = 'general', tag = 'daily_special', discountCode, images = [], imageUrl, isDraft = false } = req.body;
    const finalCaption = (caption || content || (title ? `${title}: ${content || ''}` : '') || '').trim();
    const finalImages = Array.isArray(images) && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);

    if (!finalCaption) {
      return res.status(400).json({ success: false, message: 'Post caption or headline is required.' });
    }

    const newPost = {
      id: `post-${uuidv4().slice(0, 8)}`,
      postId: `post-${uuidv4().slice(0, 8)}`,
      merchantId: storeId,
      storeId,
      storeName: store.businessName,
      merchantName: store.businessName,
      storeLogo: store.logo,
      merchantLogo: store.logo,
      storeLocality: store.address?.locality || 'Madhapur',
      storeCity: store.address?.city || 'Hyderabad',
      title: title || finalCaption.slice(0, 50),
      caption: finalCaption,
      content: finalCaption,
      images: finalImages,
      imageUrl: finalImages[0] || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      type,
      tag: tag || type,
      discountCode: discountCode ? discountCode.trim().toUpperCase() : '',
      likes: [],
      likesCount: 0,
      createdAt: new Date().toISOString(),
      isDraft: Boolean(isDraft),
    };

    if (isConnectedToMongo) {
      try {
        await Post.create(newPost);
      } catch (err) {
        console.warn('Mongo post create error:', err.message);
      }
    }

    if (!mockDb.posts) mockDb.posts = [];
    mockDb.posts.unshift(newPost);

    // Real-time broadcast to customers via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('merchant:post:new', newPost);
    }

    return res.status(201).json({
      success: true,
      message: 'Update published successfully to the neighborhood feed!',
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      await Post.findOneAndDelete({ postId: id });
    }

    if (mockDb.posts) {
      const idx = mockDb.posts.findIndex((p) => p.postId === id || p.id === id);
      if (idx !== -1) mockDb.posts.splice(idx, 1);
    }

    return res.json({ success: true, message: 'Post removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Promotions & Coupons Management
export async function getStorePromotions(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.json({ success: true, promotions: [] });

    const storeId = store.storeId || store.id;
    let promos = [];

    if (isConnectedToMongo) {
      try {
        promos = await Promotion.find({ $or: [{ merchantId: storeId }, { storeId }] }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo promotions fetch error:', err.message);
      }
    }

    return res.json({ success: true, count: promos.length, promotions: promos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPromotion(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.status(403).json({ success: false, message: 'Store not found.' });

    const storeId = store.storeId || store.id;
    const { code, description, discountType = 'percentage', discountValue, minOrderAmount = 0, maxDiscount = 100, endDate } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();

    const newPromo = {
      promoId: `promo-${uuidv4().slice(0, 8)}`,
      merchantId: storeId,
      storeId,
      code: cleanCode,
      description: description || `${discountValue}% OFF on orders over ₹${minOrderAmount}`,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: Number(maxDiscount),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true,
      usageCount: 0,
    };

    if (isConnectedToMongo) {
      try {
        await Promotion.create(newPromo);
      } catch (err) {
        console.warn('Mongo promo create error:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Coupon code "${cleanCode}" created successfully.`,
      promotion: newPromo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Customer Followers List
export async function getStoreFollowers(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.json({ success: true, count: 0, followers: [] });

    const storeId = store.storeId || store.id;
    const followers = mockDb.follows?.filter((f) => f.merchantId === storeId) || [];

    return res.json({
      success: true,
      count: followers.length,
      followers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Store Orders & Dine-In Reservations
export async function getStoreOrders(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.json({ success: true, count: 0, orders: [] });

    const storeId = store.storeId || store.id;
    let ordersList = [];

    if (isConnectedToMongo) {
      try {
        ordersList = await Order.find({ storeId }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo store orders error:', err.message);
      }
    }

    if (ordersList.length === 0) {
      ordersList = mockDb.orders.filter((o) => o.merchantId === storeId || o.storeId === storeId);
    }

    return res.json({ success: true, count: ordersList.length, orders: ordersList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReservations(req, res) {
  try {
    const store = await getMerchantStore(req.user);
    if (!store) return res.json({ success: true, reservations: [] });

    const storeId = store.storeId || store.id;
    let reservationsList = [];

    if (isConnectedToMongo) {
      try {
        reservationsList = await Reservation.find({ merchantId: storeId }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo reservations error:', err.message);
      }
    }

    if (reservationsList.length === 0) {
      reservationsList = mockDb.reservations.filter((r) => r.merchantId === storeId);
    }

    return res.json({ success: true, reservations: reservationsList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
