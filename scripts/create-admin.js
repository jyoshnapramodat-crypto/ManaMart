#!/usr/bin/env node
/**
 * ManaMart - Secure Root Administrator Account Creator
 *
 * Usage:
 *   node scripts/create-admin.js --email admin@manamart.in --password "AdminPass123!" --name "System Admin"
 *
 * Requirements:
 *   - Strong password validation: min 8 chars, uppercase, lowercase, digit, special character
 *   - Inserts record into User model with role: 'ADMIN' and status: 'ACTIVE'
 *   - Never relies on public sign-up routes
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.resolve(rootDir, 'server');
const serverRequire = createRequire(path.resolve(serverDir, 'dummy.js'));

const dotenv = serverRequire('dotenv');
const mongoose = serverRequire('mongoose');
const bcrypt = serverRequire('bcryptjs');

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(serverDir, '.env') });

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      let val = null;
      if (parts.length > 1) {
        val = parts.slice(1).join('=');
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        val = args[++i];
      }
      result[key] = val;
    }
  }
  return result;
}

const args = parseArgs();
const email = args.email || args.Email;
const password = args.password || args.Password;
const name = args.name || args.Name || 'Root Administrator';
const phone = args.phone || args.Phone;

console.log('\n======================================================');
console.log('🛡️  MANAMART SECURE ADMIN ACCOUNT PROVISIONING');
console.log('======================================================\n');

if (!email || !password) {
  console.error('❌ Error: Missing required arguments.');
  console.log('\nUsage:');
  console.log('  node scripts/create-admin.js --email <email> --password <password> --name <name>');
  console.log('\nExample:');
  console.log('  node scripts/create-admin.js --email superadmin@manamart.in --password "ManaMart#2026" --name "Super Admin"\n');
  process.exit(1);
}

// 1. Validate Email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email.trim())) {
  console.error(`❌ Error: Invalid email format "${email}".`);
  process.exit(1);
}

// 2. Validate Strong Password
// Min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
if (!strongPasswordRegex.test(password)) {
  console.error('❌ Error: Password does not meet security criteria:');
  console.error('   • Minimum 8 characters in length');
  console.error('   • At least one uppercase letter (A-Z)');
  console.error('   • At least one lowercase letter (a-z)');
  console.error('   • At least one numeric digit (0-9)');
  console.error('   • At least one special symbol (!@#$%^&*...)');
  process.exit(1);
}

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localloop_manamart';
  const cleanEmail = email.trim().toLowerCase();
  const adminName = name.trim();

  console.log(`Connecting to database...`);
  let dbConnected = false;
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 15000,
    });
    dbConnected = true;
    console.log(`✅ Connected to MongoDB.`);
  } catch (err) {
    console.warn(`⚠️ Warning: Direct MongoDB connection unavailable (${err.message}).`);
    console.warn(`Admin credentials will be generated and validated for configuration.\n`);
  }

  // Hash Password
  console.log('Hashing password securely using bcrypt...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if (dbConnected) {
    try {
      // Dynamic import of User model or schema
      const userSchema = new mongoose.Schema(
        {
          name: { type: String, required: true },
          email: { type: String, required: true, lowercase: true, index: true },
          phone: { type: String, sparse: true },
          password: { type: String, required: true },
          role: { type: String, uppercase: true, default: 'ADMIN' },
          status: { type: String, uppercase: true, default: 'ACTIVE' },
          isEmailVerified: { type: Boolean, default: true },
          isPhoneVerified: { type: Boolean, default: true },
        },
        { timestamps: true }
      );

      const User = mongoose.models.User || mongoose.model('User', userSchema);

      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        existing.name = adminName;
        existing.password = hashedPassword;
        existing.role = 'ADMIN';
        existing.status = 'ACTIVE';
        if (phone) existing.phone = phone;
        existing.isEmailVerified = true;
        await existing.save();
        console.log(`\n🎉 Administrator user UPDATED successfully!`);
      } else {
        await User.create({
          name: adminName,
          email: cleanEmail,
          phone: phone || `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          isEmailVerified: true,
          isPhoneVerified: true,
        });
        console.log(`\n🎉 Administrator user CREATED successfully!`);
      }

      console.log('------------------------------------------------------');
      console.log(`👤 Name   : ${adminName}`);
      console.log(`📧 Email  : ${cleanEmail}`);
      console.log(`🔑 Role   : ADMIN`);
      console.log(`⚡ Status : ACTIVE`);
      console.log('------------------------------------------------------');
      console.log('Login portal: Select "Administrator" tab at /login\n');
    } catch (saveError) {
      console.error('❌ Failed to save user in MongoDB:', saveError.message);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    console.log(`\n✅ Administrator Account Definition Ready:`);
    console.log('------------------------------------------------------');
    console.log(`👤 Name           : ${adminName}`);
    console.log(`📧 Email          : ${cleanEmail}`);
    console.log(`🔑 Role           : ADMIN`);
    console.log(`⚡ Status         : ACTIVE`);
    console.log(`🔒 Hashed Password: ${hashedPassword.slice(0, 15)}...`);
    console.log('------------------------------------------------------\n');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
