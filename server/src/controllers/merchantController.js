import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { MerchantApplication } from '../models/MerchantApplication.js';
import { isConnectedToMongo } from '../config/db.js';

export async function getMyApplicationStatus(req, res) {
  try {
    const userId = req.user.id || req.user._id;

    // Check MongoDB
    let appRecord = null;
    if (isConnectedToMongo) {
      try {
        appRecord = await MerchantApplication.findOne({ userId });
      } catch (err) {
        console.warn('Mongo app fetch error:', err.message);
      }
    }

    // Check memory store
    if (!appRecord) {
      appRecord = mockDb.pendingMerchants.find((m) => m.userId === userId || m.phone === req.user.phone);
    }

    // If merchant is already active and verified in mockDb.merchants
    const activeMerchant = mockDb.merchants.find((m) => m.userId === userId || m.phone === req.user.phone);

    return res.json({
      success: true,
      hasApplied: Boolean(appRecord || activeMerchant),
      status: activeMerchant ? activeMerchant.verificationStatus : (appRecord?.status || 'not_applied'),
      application: appRecord || activeMerchant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitMerchantApplication(req, res) {
  try {
    const userId = req.user.id || req.user._id;
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
      fssaiLicense,
      drugLicense,
      panNumber,
      gstin,
    } = req.body;

    if (!businessName || !category || !street || !locality || !city) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory store details.' });
    }

    // Food category MUST submit FSSAI
    if (category === 'food' && !fssaiLicense) {
      return res.status(400).json({ success: false, message: 'FSSAI License registration number is mandatory for Food and Restaurant businesses.' });
    }

    // Pharmacy category MUST submit Drug License
    if (category === 'pharmacy' && !drugLicense) {
      return res.status(400).json({ success: false, message: 'Drug License number is mandatory for Pharmacies.' });
    }

    const applicationData = {
      id: `pm-${Date.now()}`,
      userId,
      businessName,
      category,
      ownerName: ownerName || req.user.name,
      phone: phone || req.user.phone,
      email: email || req.user.email,
      address: {
        street,
        locality,
        city,
        pincode: pincode || '500081',
        lat: 17.4480,
        lng: 78.3910,
      },
      city,
      locality,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      documents: {
        fssai: fssaiLicense || '',
        fssaiDoc: fssaiLicense ? 'fssai_cert_uploaded.pdf' : '',
        drugLicense: drugLicense || '',
        pan: panNumber || 'APXPR1294K',
        tradeLicense: gstin || '36AAACR1234F1Z8',
      },
    };

    if (isConnectedToMongo) {
      try {
        await MerchantApplication.findOneAndUpdate(
          { userId },
          applicationData,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Mongo app save fallback:', err.message);
      }
    }

    // Update in-memory queue
    const existingIndex = mockDb.pendingMerchants.findIndex((m) => m.userId === userId);
    if (existingIndex !== -1) {
      mockDb.pendingMerchants[existingIndex] = applicationData;
    } else {
      mockDb.pendingMerchants.push(applicationData);
    }

    // Update user role to merchant with pending status
    req.user.role = 'merchant';
    req.user.status = 'pending';

    return res.status(201).json({
      success: true,
      message: 'Merchant application submitted successfully! It is now pending Administrator review.',
      application: applicationData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStore(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[0];

    // Compute live analytics
    const storeOrders = mockDb.orders.filter((o) => o.merchantId === merchant.id);
    const todayRevenue = storeOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);

    const activeOrdersCount = storeOrders.filter(
      (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    ).length;

    return res.json({
      success: true,
      store: merchant,
      analytics: {
        todayRevenue,
        totalOrders: storeOrders.length,
        activeOrders: activeOrdersCount,
        followersCount: merchant.followersCount || 0,
        rating: merchant.rating,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStoreStatus(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[0];

    const { isOpen, openTime, closeTime, description, tagline } = req.body;

    if (isOpen !== undefined) merchant.isOpen = Boolean(isOpen);
    if (openTime) merchant.openTime = openTime;
    if (closeTime) merchant.closeTime = closeTime;
    if (description) merchant.description = description;
    if (tagline) merchant.tagline = tagline;

    return res.json({
      success: true,
      message: 'Store settings updated successfully.',
      store: merchant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStoreProducts(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const products = mockDb.products.filter((p) => p.merchantId === merchantId);
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const { name, teluguName, category, price, mrp, isVeg, unit, description, image, tags } = req.body;

    const newProduct = {
      id: `p-${uuidv4().slice(0, 8)}`,
      merchantId,
      name,
      teluguName: teluguName || name,
      category: category || 'General',
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      inStock: true,
      unit: unit || 'item',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      rating: 4.8,
      tags: tags || ['Fresh'],
    };

    mockDb.products.unshift(newProduct);
    return res.status(201).json({ success: true, message: 'Product added to store catalog.', product: newProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { price, inStock, name, category, isVeg } = req.body;

    const product = mockDb.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (price !== undefined) product.price = Number(price);
    if (inStock !== undefined) product.inStock = Boolean(inStock);
    if (name) product.name = name;
    if (category) product.category = category;
    if (isVeg !== undefined) product.isVeg = Boolean(isVeg);

    return res.json({ success: true, message: 'Product updated.', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStoreOrders(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const orders = mockDb.orders.filter((o) => o.merchantId === merchantId);
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function uploadDocuments(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const { fssaiLicense, drugLicense, panNumber, gstin } = req.body;

    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[0];
    if (fssaiLicense) merchant.fssaiLicense = fssaiLicense;
    if (drugLicense) merchant.drugLicense = drugLicense;

    merchant.verificationStatus = 'pending';

    return res.json({
      success: true,
      message: 'Compliance documents submitted for administrative verification.',
      verificationStatus: 'pending',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReservations(req, res) {
  try {
    const merchantId = req.user.merchantId || 'm-1';
    const reservations = mockDb.reservations.filter((r) => r.merchantId === merchantId);
    return res.json({ success: true, reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
