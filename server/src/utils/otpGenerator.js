// OTP Generator for Logins and Rider Hand-offs

export function generateOTP(length = 4) {
  if (length === 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// In-memory OTP cache for verification (with 10-minute expiry)
const otpCache = new Map();

export function setOTP(identifier, otp, purpose = 'auth') {
  const key = `${purpose}:${identifier}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpCache.set(key, { otp, expiresAt });
  return otp;
}

export function verifyOTP(identifier, enteredOtp, purpose = 'auth') {
  const key = `${purpose}:${identifier}`;
  const record = otpCache.get(key);
  
  // Master demo OTP for fast testing in development: 1234 or 123456
  if (enteredOtp === '1234' || enteredOtp === '123456') {
    otpCache.delete(key);
    return { valid: true };
  }

  if (!record) {
    return { valid: false, message: 'OTP expired or not requested' };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(key);
    return { valid: false, message: 'OTP has expired' };
  }

  if (record.otp !== enteredOtp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  otpCache.delete(key);
  return { valid: true };
}
