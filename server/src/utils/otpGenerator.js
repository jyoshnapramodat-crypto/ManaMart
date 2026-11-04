import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Otp } from '../models/Otp.js';
import { isConnectedToMongo } from '../config/db.js';

// Secure In-Memory Store Fallback for OTPs
const inMemoryOtpCache = new Map();

// Generate cryptographically secure numeric OTP (default 6 digits)
export function generateSecureOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

// Backward-compatible alias for order delivery verification OTPs
export const generateOTP = (length = 4) => generateSecureOTP(length);

// Store secure hashed OTP with cooldown and 5-minute expiry
export async function createAndStoreOTP(identifier, purpose = 'login', length = 6) {
  const rawOtp = generateSecureOTP(length);
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(rawOtp, salt);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes validity
  const resendAvailableAt = new Date(now.getTime() + 60 * 1000); // 60 seconds cooldown

  const cleanIdentifier = identifier.trim().toLowerCase();

  // 1. Try MongoDB if connected
  if (isConnectedToMongo) {
    try {
      // Invalidate any previous pending OTP for this identifier and purpose
      await Otp.deleteMany({ identifier: cleanIdentifier, purpose });
      await Otp.create({
        identifier: cleanIdentifier,
        otpHash,
        purpose,
        attempts: 0,
        maxAttempts: 5,
        resendAvailableAt,
        expiresAt,
        isVerified: false,
      });
    } catch (err) {
      console.warn('MongoDB OTP write fallback:', err.message);
    }
  }

  // 2. Also keep in-memory cache for high availability
  const key = `${purpose}:${cleanIdentifier}`;
  inMemoryOtpCache.set(key, {
    otpHash,
    attempts: 0,
    maxAttempts: 5,
    resendAvailableAt: resendAvailableAt.getTime(),
    expiresAt: expiresAt.getTime(),
    isVerified: false,
  });

  // Return the rawOtp ONLY for email/SMS dispatch service. Never expose to client!
  return rawOtp;
}

// Check if resend is currently allowed (cooldown check)
export async function canResendOTP(identifier, purpose = 'login') {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const key = `${purpose}:${cleanIdentifier}`;
  const now = Date.now();

  const record = inMemoryOtpCache.get(key);
  if (record && now < record.resendAvailableAt) {
    const secondsRemaining = Math.ceil((record.resendAvailableAt - now) / 1000);
    return {
      allowed: false,
      secondsRemaining,
      message: `Please wait ${secondsRemaining}s before requesting a new OTP.`,
    };
  }

  return { allowed: true };
}

// Verify entered OTP securely
export async function verifySecureOTP(identifier, enteredOtp, purpose = 'login') {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const key = `${purpose}:${cleanIdentifier}`;
  const now = Date.now();

  // Master development override for testing in sandbox: '123456', '1234', or prototype code '482915'
  if (process.env.NODE_ENV !== 'production' && (enteredOtp === '123456' || enteredOtp === '1234' || enteredOtp === '482915')) {
    inMemoryOtpCache.delete(key);
    return { valid: true };
  }

  let record = inMemoryOtpCache.get(key);

  if (isConnectedToMongo) {
    try {
      const dbRecord = await Otp.findOne({ identifier: cleanIdentifier, purpose, isVerified: false });
      if (dbRecord) {
        record = {
          otpHash: dbRecord.otpHash,
          attempts: dbRecord.attempts,
          maxAttempts: dbRecord.maxAttempts,
          expiresAt: dbRecord.expiresAt.getTime(),
          dbInstance: dbRecord,
        };
      }
    } catch (err) {
      console.warn('MongoDB OTP read fallback:', err.message);
    }
  }

  if (!record) {
    return { valid: false, message: 'OTP has expired or was not requested. Please request a new code.' };
  }

  if (now > record.expiresAt) {
    inMemoryOtpCache.delete(key);
    if (record.dbInstance) await Otp.deleteOne({ _id: record.dbInstance._id });
    return { valid: false, message: 'OTP has expired (validity is 5 minutes). Please request a new code.' };
  }

  if (record.attempts >= record.maxAttempts) {
    inMemoryOtpCache.delete(key);
    if (record.dbInstance) await Otp.deleteOne({ _id: record.dbInstance._id });
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  // Compare bcrypt hash
  const isMatch = await bcrypt.compare(enteredOtp.trim(), record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    if (record.dbInstance) {
      record.dbInstance.attempts += 1;
      await record.dbInstance.save();
    }
    const remaining = record.maxAttempts - record.attempts;
    return {
      valid: false,
      message: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Valid! Delete so it cannot be reused
  inMemoryOtpCache.delete(key);
  if (record.dbInstance) {
    await Otp.deleteOne({ _id: record.dbInstance._id });
  }

  return { valid: true };
}
