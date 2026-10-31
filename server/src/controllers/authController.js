import { setOTP, verifyOTP, generateOTP } from '../utils/otpGenerator.js';
import { signAccessToken, signRefreshToken } from '../config/jwt.js';
import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

export async function sendOtp(req, res) {
  try {
    const { phone, email, purpose = 'login' } = req.body;
    const identifier = phone || email;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required.' });
    }

    const otp = generateOTP(4);
    setOTP(identifier, otp, purpose);

    // In production, integrate SMS / Email provider (Nodemailer / MSG91)
    console.log(`[AUTH-OTP] Sent OTP ${otp} to ${identifier}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      demoHint: `Use OTP: ${otp} or '1234'`,
      otp, // included for seamless local development
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, email, otp, name, role = 'customer' } = req.body;
    const identifier = phone || email;

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Phone/email and OTP are required.' });
    }

    const verification = verifyOTP(identifier, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Check if user exists
    let user = mockDb.users.find((u) => u.phone === identifier || u.email === identifier);

    if (!user) {
      user = {
        id: `user-${uuidv4().slice(0, 8)}`,
        name: name || (phone ? `User ${phone.slice(-4)}` : 'ManaMart Member'),
        phone: phone || '',
        email: email || '',
        role: role,
        status: 'active',
        language: 'en',
        addresses: [
          {
            id: 'addr-default',
            label: 'Home',
            street: '100 Feet Road, Ayyappa Society',
            locality: 'Madhapur',
            city: 'Hyderabad',
            pincode: '500081',
            lat: 17.4480,
            lng: 78.3910,
            isDefault: true,
          },
        ],
      };
      mockDb.users.push(user);
    }

    const tokenPayload = { id: user.id, role: user.role, phone: user.phone, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.json({
      success: true,
      message: 'Login successful!',
      token: accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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
    const { name, email, language } = req.body;
    const user = mockDb.users.find((u) => u.id === req.user.id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (language) user.language = language;
    }
    return res.json({ success: true, user: user || req.user });
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
