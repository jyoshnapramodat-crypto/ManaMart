import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../models/Post.js';
import { Store } from '../models/Store.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { isConnectedToMongo } from '../config/db.js';

// Follow a local merchant store
export async function followMerchant(req, res) {
  try {
    const { merchantId } = req.params;
    const userId = String(req.user.id || req.user._id);

    let merchant = null;
    if (isConnectedToMongo) {
      merchant = await Store.findOne({ storeId: merchantId });
    }
    if (!merchant) {
      merchant = mockDb.merchants.find((m) => m.id === merchantId || m.storeId === merchantId);
    }

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant store not found.' });
    }

    const existingFollow = mockDb.follows.find((f) => f.userId === userId && f.merchantId === merchantId);
    if (existingFollow) {
      return res.json({ success: true, message: 'Already following this store.', following: true });
    }

    const followRecord = {
      id: `f-${uuidv4().slice(0, 8)}`,
      userId,
      merchantId,
      createdAt: new Date().toISOString(),
    };

    mockDb.follows.push(followRecord);

    if (isConnectedToMongo) {
      await Store.findOneAndUpdate({ storeId: merchantId }, { $inc: { followersCount: 1 } });
    }
    merchant.followersCount = (merchant.followersCount || 0) + 1;

    // Send in-app notification
    const followNotif = {
      notificationId: `notif-${Date.now()}`,
      userId,
      role: 'customer',
      title: `Subscribed to ${merchant.businessName} 🔔`,
      message: `You will now receive flash offers, new arrivals, and restock alerts from ${merchant.businessName}.`,
      type: 'post',
      link: `/store/${merchantId}`,
      isRead: false,
    };

    if (isConnectedToMongo) {
      try {
        await Notification.create(followNotif);
      } catch (_) {}
    }
    mockDb.notifications.unshift(followNotif);

    const io = req.app.get('io');
    if (io) io.emit('notification:new', followNotif);

    return res.json({
      success: true,
      message: `You are now following ${merchant.businessName}!`,
      following: true,
      followersCount: merchant.followersCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Unfollow a merchant store
export async function unfollowMerchant(req, res) {
  try {
    const { merchantId } = req.params;
    const userId = String(req.user.id || req.user._id);

    const index = mockDb.follows.findIndex((f) => f.userId === userId && f.merchantId === merchantId);
    if (index === -1) {
      return res.json({ success: true, message: 'Not following this store.', following: false });
    }

    mockDb.follows.splice(index, 1);

    let merchant = null;
    if (isConnectedToMongo) {
      merchant = await Store.findOneAndUpdate({ storeId: merchantId }, { $inc: { followersCount: -1 } }, { new: true });
    }
    if (!merchant) {
      merchant = mockDb.merchants.find((m) => m.id === merchantId || m.storeId === merchantId);
      if (merchant && merchant.followersCount > 0) merchant.followersCount -= 1;
    }

    return res.json({
      success: true,
      message: 'Unfollowed business successfully.',
      following: false,
      followersCount: merchant ? merchant.followersCount : 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Followed Shops
export async function getMyFollowedShops(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const myFollows = mockDb.follows.filter((f) => f.userId === userId);
    const merchantIds = myFollows.map((f) => f.merchantId);

    let followedStores = [];
    if (isConnectedToMongo && merchantIds.length > 0) {
      try {
        followedStores = await Store.find({ storeId: { $in: merchantIds } });
      } catch (_) {}
    }

    if (followedStores.length === 0) {
      followedStores = mockDb.merchants.filter((m) => merchantIds.includes(m.id) || merchantIds.includes(m.storeId));
    }

    return res.json({
      success: true,
      count: followedStores.length,
      merchants: followedStores.map((s) => ({ ...s, isFollowed: true })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Social-Commerce Feed with Stories and Dynamic Filters
export async function getSocialFeed(req, res) {
  try {
    const { filter = 'all' } = req.query; // 'all' | 'following' | 'nearby' | 'new_arrivals' | 'offers' | 'restocked'
    const userId = req.user ? String(req.user.id || req.user._id) : null;

    let feedPosts = [];

    if (isConnectedToMongo) {
      try {
        const query = { isDraft: false };

        if (filter === 'new_arrivals') query.type = 'new_arrival';
        else if (filter === 'offers') query.type = 'offer';
        else if (filter === 'restocked') query.type = 'restock';
        else if (filter === 'following' && userId) {
          const userFollows = mockDb.follows.filter((f) => f.userId === userId).map((f) => f.merchantId);
          query.merchantId = { $in: userFollows };
        }

        feedPosts = await Post.find(query).sort({ createdAt: -1 }).limit(50);
      } catch (err) {
        console.warn('Mongo feed query error:', err.message);
      }
    }

    if (feedPosts.length === 0) {
      const allPosts = mockDb.posts || mockDb.merchantPosts || [];
      feedPosts = allPosts.filter((p) => {
        if (filter === 'all') return true;
        if (filter === 'new_arrivals') return p.type === 'new_arrival' || p.tag === 'new_arrival';
        if (filter === 'offers') return p.type === 'offer' || p.tag === 'offer';
        if (filter === 'restocked') return p.type === 'restock' || p.tag === 'stock_update';
        if (filter === 'following' && userId) {
          const userFollows = mockDb.follows.filter((f) => f.userId === userId).map((f) => f.merchantId);
          return userFollows.includes(p.merchantId || p.storeId);
        }
        return true;
      });
    }

    // Horizontal Stories Bar featuring active & followed stores
    const stories = [
      {
        id: 'story-swagath',
        storeId: 'store-swagath',
        storeName: 'Swagath Grand',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
        hasUnseen: true,
        tag: 'Dine-In Special',
      },
      {
        id: 'story-annapurna',
        storeId: 'store-annapurna',
        storeName: 'Annapurna Kirana',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
        hasUnseen: true,
        tag: 'Fresh Sona Masoori',
      },
      {
        id: 'story-niloufer',
        storeId: 'store-niloufer',
        storeName: 'Niloufer Cafe',
        logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80',
        hasUnseen: false,
        tag: 'Osmania Biscuits',
      },
      {
        id: 'story-apollo',
        storeId: 'store-apollo',
        storeName: 'Apollo Pharmacy',
        logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=120&auto=format&fit=crop&q=80',
        hasUnseen: false,
        tag: 'Wellness Week',
      },
    ];

    return res.json({
      success: true,
      count: feedPosts.length,
      stories,
      posts: feedPosts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Like / Unlike Post
export async function likePost(req, res) {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);

    let post = null;
    if (isConnectedToMongo) {
      try {
        post = await Post.findOne({ postId: id });
        if (post) {
          const index = post.likes.indexOf(userId);
          if (index === -1) {
            post.likes.push(userId);
            post.likesCount += 1;
          } else {
            post.likes.splice(index, 1);
            post.likesCount = Math.max(0, post.likesCount - 1);
          }
          await post.save();
          return res.json({ success: true, likesCount: post.likesCount, isLiked: post.likes.includes(userId) });
        }
      } catch (_) {}
    }

    const memoryPost = (mockDb.posts || mockDb.merchantPosts)?.find((p) => p.id === id || p.postId === id);
    if (memoryPost) {
      memoryPost.likesCount = (memoryPost.likesCount || 0) + 1;
      return res.json({ success: true, likesCount: memoryPost.likesCount, isLiked: true });
    }

    return res.status(404).json({ success: false, message: 'Post not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
