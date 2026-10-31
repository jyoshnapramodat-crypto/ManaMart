import { mockDb } from '../utils/mockDbStore.js';
import { calculateDistanceKm, estimateDeliveryTime, calculateDeliveryFee } from '../utils/haversine.js';

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
      { id: 'all', name: 'All Neighborhood', icon: 'Sparkles', count: mockDb.merchants.length },
      { id: 'food', name: 'Food & Restaurants', teluguName: 'రెస్టారెంట్లు & ఫుడ్', icon: 'Utensils', count: 12 },
      { id: 'kirana', name: 'Kirana & Provisions', teluguName: 'కిరాణా & నిత్యావసరాలు', icon: 'ShoppingBag', count: 15 },
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
    const { lat, lng, category, search, city } = req.query;
    const userLat = Number(lat) || 17.4480; // Default Madhapur, Hyderabad
    const userLng = Number(lng) || 78.3910;

    let filtered = [...mockDb.merchants];

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter((m) => m.category === category);
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.businessName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.teluguName && m.teluguName.includes(q))
      );
    }

    // Calculate real-time distance and delivery ETA for each merchant
    const merchantsWithDistance = filtered.map((merchant) => {
      const distance = calculateDistanceKm(userLat, userLng, merchant.address.lat, merchant.address.lng);
      const eta = estimateDeliveryTime(distance, merchant.deliveryTimeMin || 15);
      const deliveryFee = calculateDeliveryFee(distance);
      
      // Determine if customer is following this merchant
      let isFollowed = false;
      if (req.user) {
        isFollowed = mockDb.follows.some((f) => f.userId === req.user.id && f.merchantId === merchant.id);
      }

      return {
        ...merchant,
        distanceKm: distance,
        estimatedDeliveryTime: eta.formatted,
        deliveryFee: deliveryFee,
        isFollowed,
      };
    });

    // Sort by proximity
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
    const merchant = mockDb.merchants.find((m) => m.id === id);

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found.' });
    }

    // Products of this merchant
    const products = mockDb.products.filter((p) => p.merchantId === id);

    // Group products by menu category
    const menuCategories = {};
    products.forEach((p) => {
      const cat = p.category || 'General';
      if (!menuCategories[cat]) menuCategories[cat] = [];
      menuCategories[cat].push(p);
    });

    // Following status
    let isFollowed = false;
    if (req.user) {
      isFollowed = mockDb.follows.some((f) => f.userId === req.user.id && f.merchantId === id);
    }

    // Recent posts from this merchant
    const posts = mockDb.merchantPosts.filter((post) => post.merchantId === id);

    return res.json({
      success: true,
      merchant: {
        ...merchant,
        isFollowed,
        productsCount: products.length,
      },
      menuCategories,
      products,
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function searchAll(req, res) {
  try {
    const { q, lat, lng } = req.query;
    if (!q) {
      return res.json({ success: true, merchants: [], products: [] });
    }

    const query = q.toLowerCase();
    const matchedMerchants = mockDb.merchants.filter(
      (m) =>
        m.businessName.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        (m.teluguName && m.teluguName.includes(query))
    );

    const matchedProducts = mockDb.products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.teluguName && p.teluguName.includes(query)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
    );

    return res.json({
      success: true,
      merchants: matchedMerchants,
      products: matchedProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
