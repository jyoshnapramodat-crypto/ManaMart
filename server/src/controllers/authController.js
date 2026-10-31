import { setOTP, verifyOTP, generateOTP } from '../utils/otpGenerator.js';
import { signAccessToken, signRefreshToken } from '../config/jwt.js';
import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to check phone and email uniqueness
export function checkDuplicateUser(phone, email, excludeUserId = null) {
  const normalizedPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  for (const user of mockDb.users) {
    if (excludeUserId && user.id === excludeUserId) continue;

    if (normalizedPhone && user.phone) {
      const userPhone = user.phone.replace(/\D/g, '').slice(-10);
      if (userPhone === normalizedPhone) {
        return { isDuplicate: true, field: 'phone', message: `Phone number (${phone}) is already registered with an account.` };
      }
    }

    if (normalizedEmail && user.email) {
      if (user.email.trim().toLowerCase() === normalizedEmail) {
        return { isDuplicate: true, field: 'email', message: `Email address (${email}) is already registered with an account.` };
      }
    }
  }

  return { isDuplicate: false };
}

// Real-time availability check for phone or email
export async function checkAvailability(req, res) {
  try {
    const { phone, email } = req.query;
    const check = checkDuplicateUser(phone, email);
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

// Send OTP with strict registration / login separation
export async function sendOtp(req, res) {
  try {
    const { phone, email, purpose = 'login' } = req.body;
    const identifier = (phone || email || '').trim();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required.' });
    }

    const normalizedPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Check if user already exists
    const existingUser = mockDb.users.find((u) => {
      if (normalizedPhone && u.phone) {
        if (u.phone.replace(/\D/g, '').slice(-10) === normalizedPhone) return true;
      }
      if (normalizedEmail && u.email) {
        if (u.email.trim().toLowerCase() === normalizedEmail) return true;
      }
      return false;
    });

    // Enforce: NO DUPLICATE registration allowed
    if (purpose === 'register' && existingUser) {
      return res.status(409).json({
        success: false,
        isRegistered: true,
        message: `This ${phone ? 'phone number' : 'email'} is already registered with a ${existingUser.role.toUpperCase()} account (${existingUser.name}). Please sign in instead.`,
      });
    }

    // Enforce: Must exist if logging in
    if (purpose === 'login' && !existingUser) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No account found with ${identifier}. Please register a new account first.`,
      });
    }

    const otp = generateOTP(4);
    setOTP(identifier, otp, purpose);

    console.log(`[AUTH-OTP] Sent OTP ${otp} to ${identifier} for purpose: ${purpose}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      demoHint: `Use OTP: ${otp} or '1234'`,
      otp, // included for smooth local testing
      registeredUserRole: existingUser?.role || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Register new unique user (Customer, Merchant, Rider Partner)
export async function register(req, res) {
  try {
    const { name, phone, email, role = 'customer', otp, businessName, vehicleType } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ success: false, message: 'Name and at least phone or email are required.' });
    }

    // Verify OTP first
    const identifier = (phone || email).trim();
    if (otp) {
      const verification = verifyOTP(identifier, otp, 'register');
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
    }

    // Check uniqueness strictly: No phone or email duplicate allowed
    const dupCheck = checkDuplicateUser(phone, email);
    if (dupCheck.isDuplicate) {
      return res.status(409).json({ success: false, message: dupCheck.message });
    }

    const newUserId = `user-${uuidv4().slice(0, 8)}`;
    const userRole = ['customer', 'merchant', 'rider', 'admin'].includes(role) ? role : 'customer';

    const newUser = {
      id: newUserId,
      name: name.trim(),
      phone: phone ? phone.trim().replace(/\D/g, '').slice(-10) : '',
      email: email ? email.trim().toLowerCase() : '',
      role: userRole,
      status: 'active',
      language: 'en',
      createdAt: new Date().toISOString(),
      addresses: [
        {
          id: 'addr-default',
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

    // If registered as Merchant, create corresponding store
    if (userRole === 'merchant') {
      const merchantId = `m-${uuidv4().slice(0, 6)}`;
      newUser.merchantId = merchantId;
      mockDb.merchants.push({
        id: merchantId,
        userId: newUserId,
        businessName: businessName || `${newUser.name}'s Shop`,
        teluguName: businessName || `${newUser.name} దుకాణం`,
        tagline: 'Fresh neighborhood store',
        category: 'kirana',
        description: `Owned by ${newUser.name}. Serving the local community with quality products.`,
        phone: newUser.phone,
        email: newUser.email,
        address: {
          street: 'Main Road',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          lat: 17.4480,
          lng: 78.3910,
        },
        rating: 5.0,
        totalRatings: 0,
        isOpen: true,
        openTime: '08:00 AM',
        closeTime: '10:00 PM',
        avgPriceForTwo: 300,
        deliveryTimeMin: 15,
        deliveryTimeMax: 30,
        deliveryRadiusKm: 6,
        pureVeg: false,
        followersCount: 0,
        verificationStatus: 'verified',
        bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      });
    }

    // If registered as Rider, create corresponding rider partner
    if (userRole === 'rider') {
      const riderId = `r-${uuidv4().slice(0, 6)}`;
      newUser.riderId = riderId;
      mockDb.riders.push({
        id: riderId,
        userId: newUserId,
        name: newUser.name,
        phone: newUser.phone,
        vehicleType: vehicleType || 'bike',
        vehicleName: 'Motorcycle',
        vehicleNumber: `TS 09 ${Math.floor(1000 + Math.random() * 9000)}`,
        isOnline: true,
        currentLocation: { lat: 17.4480, lng: 78.3910 },
        rating: 5.0,
        todayDeliveries: 0,
        todayEarnings: 0,
        totalDeliveries: 0,
        verificationStatus: 'verified',
        drivingLicenseNumber: `DL-TS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    }

    mockDb.users.push(newUser);

    const tokenPayload = { id: newUser.id, role: newUser.role, phone: newUser.phone, email: newUser.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome to ManaMart, ${newUser.name}.`,
      token: accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Log in existing user with phone or email + OTP
export async function login(req, res) {
  try {
    const { phone, email, otp } = req.body;
    const identifier = (phone || email || '').trim();

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Phone/email and OTP are required.' });
    }

    const verification = verifyOTP(identifier, otp, 'login');
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const normalizedPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : null;
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    const user = mockDb.users.find((u) => {
      if (normalizedPhone && u.phone) {
        if (u.phone.replace(/\D/g, '').slice(-10) === normalizedPhone) return true;
      }
      if (normalizedEmail && u.email) {
        if (u.email.trim().toLowerCase() === normalizedEmail) return true;
      }
      return false;
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: 'No registered account found with this phone number or email. Please register first.',
      });
    }

    const tokenPayload = { id: user.id, role: user.role, phone: user.phone, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}! Logged in as ${user.role.toUpperCase()}.`,
      token: accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Legacy OTP verifier (routes directly to login)
export async function verifyOtp(req, res) {
  return login(req, res);
}

// Quick Switch Login for frictionless evaluation and testing
export async function quickLogin(req, res) {
  try {
    const { role = 'customer', id } = req.body;
    let user;

    if (id) {
      user = mockDb.users.find((u) => u.id === id);
    }
    if (!user) {
      user = mockDb.users.find((u) => u.role === role) || mockDb.users[0];
    }

    const tokenPayload = { id: user.id, role: user.role, phone: user.phone, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.json({
      success: true,
      message: `Signed in instantly as ${user.role.toUpperCase()}: ${user.name}`,
      token: accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email, phone, language } = req.body;
    const user = mockDb.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check duplicate if email or phone is changing
    if (email && email !== user.email) {
      const dup = checkDuplicateUser(null, email, user.id);
      if (dup.isDuplicate) return res.status(409).json({ success: false, message: dup.message });
      user.email = email.trim().toLowerCase();
    }

    if (phone && phone !== user.phone) {
      const dup = checkDuplicateUser(phone, null, user.id);
      if (dup.isDuplicate) return res.status(409).json({ success: false, message: dup.message });
      user.phone = phone.trim().replace(/\D/g, '').slice(-10);
    }

    if (name) user.name = name.trim();
    if (language) user.language = language;

    return res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addAddress(req, res) {
  try {
    const { label, street, locality, city, pincode, lat, lng } = req.body;
    const user = mockDb.users.find((u) => u.id === req.user.id);
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
    if (user) {
      if (!user.addresses) user.addresses = [];
      user.addresses.push(newAddress);
    }
    return res.json({ success: true, address: newAddress, addresses: user ? user.addresses : [newAddress] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
