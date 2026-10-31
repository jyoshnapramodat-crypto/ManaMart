import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

export async function followMerchant(req, res) {
  try {
    const { merchantId } = req.params;
    const userId = req.user.id;

    const merchant = mockDb.merchants.find((m) => m.id === merchantId);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found.' });
    }

    const existing = mockDb.follows.find((f) => f.userId === userId && f.merchantId === merchantId);
    if (existing) {
      return res.json({ success: true, message: 'Already following this business.', following: true });
    }

    const followRecord = {
      id: `f-${uuidv4().slice(0, 8)}`,
      userId,
      merchantId,
      notifyOnPost: true,
      notifyOnOffer: true,
      createdAt: new Date().toISOString(),
    };

    mockDb.follows.push(followRecord);
    merchant.followersCount = (merchant.followersCount || 0) + 1;

    // Add notification
    mockDb.notifications.push({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId,
      title: `Subscribed to ${merchant.businessName} 🔔`,
      message: `You will now receive flash offers and new stock alerts from ${merchant.businessName}.`,
      type: 'post',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Now following ${merchant.businessName}`,
      following: true,
      followersCount: merchant.followersCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function unfollowMerchant(req, res) {
  try {
    const { merchantId } = req.params;
    const userId = req.user.id;

    const index = mockDb.follows.findIndex((f) => f.userId === userId && f.merchantId === merchantId);
    if (index === -1) {
      return res.json({ success: true, message: 'Not following this business.', following: false });
    }

    mockDb.follows.splice(index, 1);
    const merchant = mockDb.merchants.find((m) => m.id === merchantId);
    if (merchant && merchant.followersCount > 0) {
      merchant.followersCount -= 1;
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

export async function getMyFollowedShops(req, res) {
  try {
    const userId = req.user.id;
    const myFollows = mockDb.follows.filter((f) => f.userId === userId);
    const merchantIds = myFollows.map((f) => f.merchantId);

    const followedMerchants = mockDb.merchants
      .filter((m) => merchantIds.includes(m.id))
      .map((m) => ({ ...m, isFollowed: true }));

    return res.json({
      success: true,
      count: followedMerchants.length,
      merchants: followedMerchants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSocialFeed(req, res) {
  try {
    // Return all latest posts with merchant metadata
    const posts = mockDb.merchantPosts.map((post) => {
      const merchant = mockDb.merchants.find((m) => m.id === post.merchantId);
      return {
        ...post,
        merchantName: merchant ? merchant.businessName : post.merchantName,
        merchantLogo: merchant ? merchant.logo : post.merchantLogo,
        category: merchant ? merchant.category : 'General',
      };
    });

    // Sort newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function likePost(req, res) {
  try {
    const { id } = req.params;
    const post = mockDb.merchantPosts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.likesCount = (post.likesCount || 0) + 1;
    return res.json({ success: true, likesCount: post.likesCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPost(req, res) {
  try {
    const { title, content, imageUrl, tag, discountCode } = req.body;
    let merchantId = req.user.merchantId;

    if (!merchantId) {
      // Find or assign merchant
      const merchant = mockDb.merchants[0];
      merchantId = merchant.id;
    }

    const merchant = mockDb.merchants.find((m) => m.id === merchantId);

    const newPost = {
      id: `post-${uuidv4().slice(0, 8)}`,
      merchantId,
      merchantName: merchant ? merchant.businessName : 'Verified Local Merchant',
      merchantLogo: merchant ? merchant.logo : '',
      title,
      content,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      tag: tag || 'announcement',
      discountCode: discountCode || null,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    mockDb.merchantPosts.unshift(newPost);

    // Notify all followers
    const followers = mockDb.follows.filter((f) => f.merchantId === merchantId);
    followers.forEach((f) => {
      mockDb.notifications.push({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: f.userId,
        title: `New update from ${merchant ? merchant.businessName : 'Shop'} 📢`,
        message: title,
        type: 'post',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Post published to followers!',
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

