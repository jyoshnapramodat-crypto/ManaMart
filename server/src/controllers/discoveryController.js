import { mockDb } from '../utils/mockDbStore.js';
import { calculateDistanceKm, estimateDeliveryTime, calculateDeliveryFee } from '../utils/haversine.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Post } from '../models/Post.js';
import { isConnectedToMongo } from '../config/db.js';

export async function getCities(req, res) {
  try {
    return res.json({
      success: true,
      cities: mockDb.cities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = [
      { id: 'all', name: 'All Neighborhood', icon: 'Sparkles', count: 45 },
      { id: 'food', name: 'Food & Restaurants', teluguName: 'రెస్టారెంట్లు & ఫుడ్', icon: 'Utensils', count: 14 },
      { id: 'kirana', name: 'Kirana & Provisions', teluguName: 'కిరాణా & నిత్యావసరాలు', icon: 'ShoppingBag', count: 18 },
      { id: 'pharmacy', name: '24x7 Medicines', teluguName: 'మందుల దుకాణం', icon: 'Pill', count: 8 },
      { id: 'bakery', name: 'Bakeries & Sweets', teluguName: 'బేకరీ & మిఠాయిలు', icon: 'Cake', count: 7 },
      { id: 'flowers', name: 'Flowers & Pooja', teluguName: 'పూలు & పూజా సామగ్రి', icon: 'Flower2', count: 5 },
      { id: 'parcel', name: 'Hyperlocal Parcel', teluguName: 'పార్శిల్ డెలివరీ', icon: 'Package', count: 'Instant' },
      { id: 'services', name: 'Home Services', teluguName: 'హోమ్ సర్వీసెస్', icon: 'Wrench', count: 9 },
    ];
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getNearbyMerchants(req, res) {
  try {
    const { lat, lng, category, search } = req.query;
    const userLat = Number(lat) || 17.4480;
    const userLng = Number(lng) || 78.3910;

    let storeList = [];

    if (isConnectedToMongo) {
      try {
        const query = { $or: [{ isVerified: true }, { verificationStatus: 'verified' }] };
        if (category && category !== 'all') {
          query.category = category;
        }
        if (search) {
          const reg = new RegExp(search.trim(), 'i');
          query.$or = [{ businessName: reg }, { category: reg }, { 'address.locality': reg }];
        }
        storeList = await Store.find(query);
      } catch (err) {
        console.warn('Mongo nearby stores fetch error:', err.message);
      }
    }

    if (storeList.length === 0) {
      storeList = [...mockDb.merchants];
      if (category && category !== 'all') {
        storeList = storeList.filter((m) => m.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        storeList = storeList.filter(
          (m) =>
            m.businessName.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q))
        );
      }
    }

    // Attach real distance, ETA, and follow status
    const merchantsWithDistance = storeList.map((m) => {
      const storeObj = m.toObject ? m.toObject() : m;
      const sLat = storeObj.address?.lat || storeObj.address?.location?.coordinates?.[1] || 17.4480;
      const sLng = storeObj.address?.lng || storeObj.address?.location?.coordinates?.[0] || 78.3910;

      const distance = calculateDistanceKm(userLat, userLng, sLat, sLng);
      const eta = estimateDeliveryTime(distance, storeObj.deliveryTimeMin || 15);
      const deliveryFee = calculateDeliveryFee(distance);

      let isFollowed = false;
      if (req.user) {
        const userId = String(req.user.id || req.user._id);
        isFollowed = mockDb.follows.some((f) => f.userId === userId && (f.merchantId === storeObj.storeId || f.merchantId === storeObj.id));
      }

      return {
        ...storeObj,
        id: storeObj.storeId || storeObj._id || storeObj.id,
        distanceKm: distance,
        estimatedDeliveryTime: eta.formatted,
        deliveryFee,
        isFollowed,
      };
    });

    merchantsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      count: merchantsWithDistance.length,
      merchants: merchantsWithDistance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMerchantDetails(req, res) {
  try {
    const { id } = req.params;
    let merchant = null;
    let products = [];
    let posts = [];

    if (isConnectedToMongo) {
      try {
        merchant = await Store.findOne({
          $or: [{ storeId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });
        if (merchant) {
          const storeId = merchant.storeId;
          products = await Product.find({ $or: [{ storeId }, { merchantId: storeId }] });
          posts = await Post.find({ $or: [{ storeId }, { merchantId: storeId }] }).sort({ createdAt: -1 });
        }
      } catch (err) {
        console.warn('Mongo store details fetch error:', err.message);
      }
    }

    if (!merchant) {
      merchant = mockDb.merchants.find((m) => m.id === id || m.storeId === id) || mockDb.merchants[0];
      const storeId = merchant.storeId || merchant.id;
      products = mockDb.products.filter((p) => p.merchantId === storeId || p.storeId === storeId);
      posts = mockDb.posts?.filter((p) => p.merchantId === storeId || p.storeId === storeId) || [];
    }

    // Group products by category
    const menuCategories = {};
    products.forEach((p) => {
      const prod = p.toObject ? p.toObject() : p;
      const cat = prod.category || 'General';
      if (!menuCategories[cat]) menuCategories[cat] = [];
      menuCategories[cat].push({
        ...prod,
        id: prod.productId || prod._id || prod.id,
      });
    });

    let isFollowed = false;
    if (req.user) {
      const userId = String(req.user.id || req.user._id);
      isFollowed = mockDb.follows.some((f) => f.userId === userId && (f.merchantId === id || f.merchantId === merchant.storeId));
    }

    const merchantSafe = merchant.toObject ? merchant.toObject() : merchant;

    return res.json({
      success: true,
      merchant: {
        ...merchantSafe,
        id: merchantSafe.storeId || merchantSafe.id,
        isFollowed,
        productsCount: products.length,
      },
      menuCategories,
      products: products.map((p) => (p.toObject ? { ...p.toObject(), id: p.productId || p._id } : p)),
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Multi-store Search across Stores & Products
export async function searchAll(req, res) {
  try {
    const { q, category, isVeg, maxPrice, inStockOnly } = req.query;
    if (!q && !category) {
      return res.json({ success: true, merchants: [], products: [] });
    }

    let matchedMerchants = [];
    let matchedProducts = [];

    if (isConnectedToMongo) {
      try {
        const storeQuery = {};
        if (q) {
          const reg = new RegExp(q.trim(), 'i');
          storeQuery.$or = [{ businessName: reg }, { category: reg }, { 'address.locality': reg }];
        }
        if (category && category !== 'all') storeQuery.category = category;

        matchedMerchants = await Store.find(storeQuery).limit(20);

        const prodQuery = {};
        if (q) {
          const reg = new RegExp(q.trim(), 'i');
          prodQuery.$or = [{ name: reg }, { nameTelugu: reg }, { category: reg }, { tags: reg }];
        }
        if (category && category !== 'all') prodQuery.category = category;
        if (isVeg === 'true') prodQuery.isVeg = true;
        if (inStockOnly === 'true') prodQuery.inStock = true;
        if (maxPrice) prodQuery.price = { $lte: Number(maxPrice) };

        matchedProducts = await Product.find(prodQuery).limit(40);
      } catch (err) {
        console.warn('Mongo search query error:', err.message);
      }
    }

    if (matchedMerchants.length === 0 && matchedProducts.length === 0) {
      const query = (q || '').toLowerCase();

      matchedMerchants = mockDb.merchants.filter((m) => {
        if (category && category !== 'all' && m.category !== category) return false;
        if (!query) return true;
        return (
          m.businessName.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query) ||
          (m.address?.locality && m.address.locality.toLowerCase().includes(query))
        );
      });

      matchedProducts = mockDb.products.filter((p) => {
        if (category && category !== 'all' && p.category !== category) return false;
        if (isVeg === 'true' && !p.isVeg) return false;
        if (inStockOnly === 'true' && !p.inStock) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          (p.nameTelugu && p.nameTelugu.includes(query)) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
        );
      });
    }

    return res.json({
      success: true,
      merchants: matchedMerchants.map((m) => (m.toObject ? { ...m.toObject(), id: m.storeId || m.id } : m)),
      products: matchedProducts.map((p) => (p.toObject ? { ...p.toObject(), id: p.productId || p.id } : p)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
