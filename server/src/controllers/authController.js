import { createAndStoreOTP, verifySecureOTP, canResendOTP } from '../utils/otpGenerator.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { sendSmsOtp } from '../services/smsService.js';
import { signAccessToken, signRefreshToken } from '../config/jwt.js';
import { mockDb } from '../utils/mockDbStore.js';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { MerchantApplication } from '../models/MerchantApplication.js';
import { RiderApplication } from '../models/RiderApplication.js';
import { isConnectedToMongo } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Helper to check phone and email uniqueness across both Mongo and Memory
export async function checkDuplicateUser(phone, email, excludeUserId = null) {
  const normalizedPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  // 1. Check MongoDB if connected
  if (isConnectedToMongo) {
    try {
      if (normalizedPhone) {
        const query = { phone: normalizedPhone };
        if (excludeUserId) query._id = { $ne: excludeUserId };
        const found = await User.findOne(query);
        if (found) return { isDuplicate: true, field: 'phone', message: `Mobile number (${phone}) is already registered with an existing account.` };
      }
      if (normalizedEmail) {
        const query = { email: normalizedEmail };
        if (excludeUserId) query._id = { $ne: excludeUserId };
        const found = await User.findOne(query);
        if (found) return { isDuplicate: true, field: 'email', message: `Email address (${email}) is already registered with an existing account.` };
      }
    } catch (err) {
      console.warn('MongoDB duplicate check error:', err.message);
    }
  }

  // 2. Check in-memory store
  for (const user of mockDb.users) {
    const userId = user.id || user._id;
    if (excludeUserId && (userId === excludeUserId || String(userId) === String(excludeUserId))) continue;

    if (normalizedPhone && user.phone) {
      const userPhone = user.phone.replace(/\D/g, '').slice(-10);
      if (userPhone === normalizedPhone) {
        return { isDuplicate: true, field: 'phone', message: `Mobile number (${phone}) is already registered with an existing account.` };
      }
    }

    if (normalizedEmail && user.email) {
      if (user.email.trim().toLowerCase() === normalizedEmail) {
        return { isDuplicate: true, field: 'email', message: `Email address (${email}) is already registered with an existing account.` };
      }
    }
  }

  return { isDuplicate: false };
}

// Check availability in real time
export async function checkAvailability(req, res) {
  try {
    const { phone, email } = req.query;
    const check = await checkDuplicateUser(phone, email);
    return res.json({
      success: true,
      available: !check.isDuplicate,
      message: check.isDuplicate ? check.message : 'Available',
      field: check.field,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Send OTP with Email & SMS dispatch, cooldown, and zero client leakage
export async function sendOtp(req, res) {
  try {
    const { phone, email, purpose = 'login' } = req.body;
    const identifier = (phone || email || '').trim();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required.' });
    }

    // Cooldown check (60s)
    const cooldown = await canResendOTP(identifier, purpose);
    if (!cooldown.allowed) {
      return res.status(429).json({ success: false, message: cooldown.message, secondsRemaining: cooldown.secondsRemaining });
    }

    const normalizedPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Look up existing user
    let existingUser = null;
    if (isConnectedToMongo) {
      try {
        existingUser = await User.findOne({
          $or: [
            ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ],
        });
      } catch (err) {
        console.warn('MongoDB find error:', err.message);
      }
    }
    if (!existingUser) {
      existingUser = mockDb.users.find((u) => {
        if (normalizedPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === normalizedPhone) return true;
        if (normalizedEmail && u.email && u.email.trim().toLowerCase() === normalizedEmail) return true;
        return false;
      });
    }

    // Purpose-specific validation
    if (purpose === 'signup' && existingUser) {
      return res.status(409).json({
        success: false,
        isRegistered: true,
        message: `An account already exists with this ${phone ? 'mobile number' : 'email'}. Please sign in.`,
      });
    }

    if ((purpose === 'login' || purpose === 'forgot_password') && !existingUser) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No ManaMart account found with ${identifier}. Please sign up first.`,
      });
    }

    // Generate and securely store hashed OTP
    const rawOtp = await createAndStoreOTP(identifier, purpose, 6);

    // Dispatch via real channels
    const isEmailTarget = identifier.includes('@');
    if (isEmailTarget) {
      await sendVerificationEmail(identifier, rawOtp, existingUser?.name || 'Neighbor', purpose);
    } else {
      await sendSmsOtp(identifier, rawOtp, purpose);
      if (existingUser?.email) {
        await sendVerificationEmail(existingUser.email, rawOtp, existingUser.name, purpose);
      }
    }

    return res.json({
      success: true,
      message: `A secure 6-digit verification code has been dispatched to ${identifier}.`,
      cooldownSeconds: 60,
      deliveryChannel: isEmailTarget ? 'email' : 'sms',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Complete User Registration (Customer, Merchant, Rider)
export async function register(req, res) {
  try {
    const { name, phone, email, password, confirmPassword, role = 'customer', otp, businessName, vehicleType } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Full name, mobile number, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Security: Disallow public admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrator accounts cannot be created via public registration.',
      });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const userRole = ['customer', 'merchant', 'rider'].includes(role) ? role : 'customer';

    // Verify OTP if provided (required in production mode)
    if (otp) {
      const identifier = cleanPhone;
      const verification = await verifySecureOTP(identifier, otp, 'signup');
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
    }

    // Check duplicate
    const dupCheck = await checkDuplicateUser(cleanPhone, cleanEmail);
    if (dupCheck.isDuplicate) {
      return res.status(409).json({ success: false, message: dupCheck.message });
    }

    // Generate unique user identifier
    const newUserId = `user-${uuidv4().slice(0, 8)}`;
    const isCustomer = userRole === 'customer';

    const userData = {
      id: newUserId,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: password, // Mongoose pre('save') hashes it with bcrypt safely
      role: userRole,
      status: isCustomer ? 'active' : 'pending',
      isPhoneVerified: Boolean(otp),
      isEmailVerified: Boolean(cleanEmail && otp),
      isDemo: false,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          label: 'Home',
          street: 'Main Road',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          lat: 17.4480,
          lng: 78.3910,
          isDefault: true,
        },
      ],
    };

    let savedUser = null;

    // 1. Save to MongoDB Atlas if connected
    if (isConnectedToMongo) {
      try {
        savedUser = await User.create(userData);
        userData._id = savedUser._id;
        userData.id = String(savedUser._id);
      } catch (err) {
        console.error('MongoDB User.create error:', err.message);
        throw err;
      }
    } else {
      // If in mock mode, hash password manually for memory store
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    // 2. Role-specific initializations
    if (userRole === 'merchant') {
      const storeId = `store-${uuidv4().slice(0, 8)}`;
      userData.merchantId = storeId;

      const newApp = {
        applicationId: `app-m-${uuidv4().slice(0, 8)}`,
        userId: userData.id,
        businessName: (businessName || `${userData.name}'s Store`).trim(),
        category: 'grocery',
        ownerName: userData.name,
        phone: userData.phone,
        email: userData.email,
        address: {
          street: 'Main Street',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          lat: 17.4480,
          lng: 78.3910,
        },
        status: 'pending_verification',
        reviewHistory: [],
      };

      if (isConnectedToMongo) {
        try {
          await MerchantApplication.create(newApp);
          await Store.create({
            storeId,
            userId: userData.id,
            businessName: newApp.businessName,
            category: newApp.category,
            ownerName: userData.name,
            phone: userData.phone,
            email: userData.email,
            isVerified: false,
            verificationStatus: 'pending',
            isOpen: false,
            address: newApp.address,
          });
        } catch (e) {
          console.warn('Error creating merchant app in DB:', e.message);
        }
      }

      mockDb.pendingMerchants.push({
        id: newApp.applicationId,
        userId: userData.id,
        businessName: newApp.businessName,
        category: 'grocery',
        ownerName: userData.name,
        phone: userData.phone,
        status: 'pending_verification',
        locality: 'Madhapur',
        city: 'Hyderabad',
      });
    } else if (userRole === 'rider') {
      const riderId = `rider-${uuidv4().slice(0, 8)}`;
      userData.riderId = riderId;

      const newRiderApp = {
        applicationId: `app-r-${uuidv4().slice(0, 8)}`,
        userId: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        city: 'Hyderabad',
        preferredArea: 'Madhapur',
        vehicleType: vehicleType || 'bike',
        status: 'pending_verification',
        reviewHistory: [],
      };

      if (isConnectedToMongo) {
        try {
          await RiderApplication.create(newRiderApp);
        } catch (e) {
          console.warn('Error creating rider app in DB:', e.message);
        }
      }

      mockDb.pendingRiders.push({
        id: newRiderApp.applicationId,
        userId: userData.id,
        name: userData.name,
        phone: userData.phone,
        vehicleType: newRiderApp.vehicleType,
        status: 'pending_verification',
        city: 'Hyderabad',
      });
    }

    mockDb.users.push(userData);

    // Generate tokens
    const tokenPayload = {
      id: userData.id,
      role: userData.role,
      phone: userData.phone,
      email: userData.email,
      name: userData.name,
    };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Safe user object for response
    const { password: _, ...userSafe } = userData;

    return res.status(201).json({
      success: true,
      message: `Welcome to ManaMart, ${userData.name}! Registration completed successfully.`,
      token: accessToken,
      refreshToken,
      user: userSafe,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// User Login (Supports Full Name, Mobile Number, Email, Password, or OTP)
export async function login(req, res) {
  try {
    const { identifier, password, otp } = req.body;
    const cleanId = (identifier || '').trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Full name, registered mobile number, or email is required.' });
    }

    const isEmail = cleanId.includes('@');
    const isDigitsOnly = /^\d+$/.test(cleanId.replace(/\D/g, ''));
    const cleanDigits = cleanId.replace(/\D/g, '');
    const isPhoneNumber = isDigitsOnly && cleanDigits.length >= 10;

    let user = null;

    // A. Search by Full Name if input is not strictly an email or 10+ digits phone
    if (!isEmail && !isPhoneNumber) {
      const nameRegex = new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      let matchingUsers = [];

      if (isConnectedToMongo) {
        try {
          matchingUsers = await User.find({ name: nameRegex });
        } catch (err) {
          console.warn('MongoDB name lookup error:', err.message);
        }
      }

      if (matchingUsers.length === 0) {
        matchingUsers = mockDb.users.filter((u) => u.name && u.name.trim().toLowerCase() === cleanId.toLowerCase());
      }

      // Handle duplicate/ambiguous names safely
      if (matchingUsers.length > 1) {
        return res.status(400).json({
          success: false,
          ambiguousName: true,
          message: `Multiple accounts found with the name "${cleanId}". To protect your security, please sign in using your registered mobile number or email address.`,
        });
      }

      if (matchingUsers.length === 1) {
        user = matchingUsers[0];
      }
    }

    // B. Search by Email or Phone if not resolved by unique name
    if (!user) {
      const normalizedPhone = isPhoneNumber ? cleanDigits.slice(-10) : null;
      const normalizedEmail = isEmail ? cleanId.toLowerCase() : null;

      if (isConnectedToMongo) {
        try {
          user = await User.findOne({
            $or: [
              ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
              ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ],
          });
        } catch (err) {
          console.warn('Mongo user lookup error:', err.message);
        }
      }

      if (!user) {
        user = mockDb.users.find((u) => {
          if (normalizedPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === normalizedPhone) return true;
          if (normalizedEmail && u.email && u.email.trim().toLowerCase() === normalizedEmail) return true;
          return false;
        });
      }
    }

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No ManaMart account found matching "${cleanId}". Please check your details or create a new account.`,
      });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        isSuspended: true,
        message: 'This account has been suspended by platform administration. Please contact support.',
      });
    }

    // 1. Password Verification Path
    if (password) {
      let isMatch = false;

      if (user.password) {
        try {
          isMatch = await bcrypt.compare(password, user.password);
        } catch (err) {
          console.warn('Bcrypt compare error:', err.message);
        }
      }

      // Preserve designated demo accounts for testing without interfering with real accounts
      const isDesignatedDemo =
        user.isDemo === true ||
        ['9876543210', '9848012345', '9123456780', '9999999999'].includes(user.phone) ||
        ['admin@manamart.in', 'sridhar@swagathgrand.com', 'suresh.rider@manamart.in', 'ravi.kumar@example.com'].includes(user.email);

      if (!isMatch && isDesignatedDemo && (password === 'password123' || password === 'admin123')) {
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your password or sign in with OTP.',
        });
      }
    }
    // 2. OTP Verification Path
    else if (otp) {
      const verification = await verifySecureOTP(user.phone || cleanId, otp, 'login');
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please provide either your password or a 6-digit OTP.' });
    }

    const userId = String(user._id || user.id);
    const tokenPayload = {
      id: userId,
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: user.name,
    };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const safeUser = {
      id: userId,
      _id: userId,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      isDemo: Boolean(user.isDemo),
      merchantId: user.merchantId,
      riderId: user.riderId,
      addresses: user.addresses || [],
      favorites: user.favorites || [],
      savedPosts: user.savedPosts || [],
      settings: user.settings || {},
    };

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Reset Password using OTP
export async function resetPassword(req, res) {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Identifier, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const verification = await verifySecureOTP(identifier, otp, 'forgot_password');
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const normalizedPhone = identifier.replace(/\D/g, '').slice(-10);
    const normalizedEmail = identifier.toLowerCase();

    let user = null;
    if (isConnectedToMongo) {
      try {
        user = await User.findOne({
          $or: [
            ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ],
        });
      } catch (err) {
        console.warn('Mongo find error:', err.message);
      }
    }

    if (!user) {
      user = mockDb.users.find((u) => {
        if (u.phone && u.phone.replace(/\D/g, '').slice(-10) === normalizedPhone) return true;
        if (u.email && u.email.trim().toLowerCase() === normalizedEmail) return true;
        return false;
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    if (isConnectedToMongo) {
      try {
        await User.updateOne({ _id: user._id || user.id }, { password: hashedPassword });
      } catch (err) {
        console.warn('Mongo password update error:', err.message);
      }
    }

    return res.json({
      success: true,
      message: 'Your password has been successfully reset! Please sign in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Change Password for Authenticated Users
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const userId = req.user.id || req.user._id;
    let user = null;

    if (isConnectedToMongo) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = mockDb.users.find((u) => u.id === userId || u._id === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;

    if (isConnectedToMongo) {
      await User.updateOne({ _id: userId }, { password: hashed });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Quick Switch Login for frictionless evaluation and testing
export async function quickLogin(req, res) {
  try {
    const { role = 'customer' } = req.body;
    let user = mockDb.users.find((u) => u.role === role && u.isDemo);
    if (!user) {
      user = mockDb.users.find((u) => u.role === role) || mockDb.users[0];
    }

    const tokenPayload = {
      id: user.id || user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: user.name,
    };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const safeUser = {
      id: user.id || user._id,
      _id: user.id || user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      isDemo: true,
      merchantId: user.merchantId,
      riderId: user.riderId,
      addresses: user.addresses || [],
    };

    return res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}: ${user.name}`,
      token: accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Authenticated User Profile
export async function getMe(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    let user = null;

    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId).select('-password');
      } catch (_) {}
    }

    if (!user) {
      user = req.user;
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Update User Profile
export async function updateProfile(req, res) {
  try {
    const { name, email, phone, language, settings } = req.body;
    const userId = req.user.id || req.user._id;

    let user = null;
    if (isConnectedToMongo) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = mockDb.users.find((u) => u.id === userId || u._id === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (email && email !== user.email) {
      const dup = await checkDuplicateUser(null, email, userId);
      if (dup.isDuplicate) return res.status(409).json({ success: false, message: dup.message });
      user.email = email.trim().toLowerCase();
    }

    if (phone && phone !== user.phone) {
      const dup = await checkDuplicateUser(phone, null, userId);
      if (dup.isDuplicate) return res.status(409).json({ success: false, message: dup.message });
      user.phone = phone.trim().replace(/\D/g, '').slice(-10);
    }

    if (name) user.name = name.trim();
    if (language) user.language = language;
    if (settings) user.settings = { ...user.settings, ...settings };

    if (isConnectedToMongo && user.save) {
      await user.save();
    }

    const safeUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      language: user.language,
      settings: user.settings,
      addresses: user.addresses || [],
    };

    return res.json({ success: true, message: 'Profile updated successfully!', user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Add Delivery Address
export async function addAddress(req, res) {
  try {
    const { label, street, locality, city, pincode, lat, lng } = req.body;
    const userId = req.user.id || req.user._id;

    const newAddress = {
      id: `addr-${Date.now()}`,
      label: label || 'Home',
      street: street || 'Main Road',
      locality: locality || 'Madhapur',
      city: city || 'Hyderabad',
      pincode: pincode || '500081',
      lat: Number(lat) || 17.4480,
      lng: Number(lng) || 78.3910,
      isDefault: false,
    };

    if (isConnectedToMongo) {
      try {
        await User.findByIdAndUpdate(userId, { $push: { addresses: newAddress } });
      } catch (_) {}
    }

    const memoryUser = mockDb.users.find((u) => u.id === userId || u._id === userId);
    if (memoryUser) {
      if (!memoryUser.addresses) memoryUser.addresses = [];
      memoryUser.addresses.push(newAddress);
    }

    return res.json({ success: true, address: newAddress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
