import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Reservation from '../models/Reservation.js';
import Order from '../models/Order.js';
import MerchantApplication from '../models/MerchantApplication.js';
import RiderApplication from '../models/RiderApplication.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localloop_manamart';

async function seedDatabase() {
  console.log('🔄 Connecting to MongoDB at:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully!');

    // 1. Clear previous sample records
    console.log('🧹 Cleaning previous seed records...');
    await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Product.deleteMany({}),
      Reservation.deleteMany({}),
      Order.deleteMany({}),
      MerchantApplication.deleteMany({}),
      RiderApplication.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash('ManaMart@123', 10);

    // 2. Insert Sample Users
    console.log('👤 Seeding Users across roles...');
    const users = await User.insertMany([
      {
        name: 'Super Admin',
        email: 'admin@manamart.in',
        phone: '9848011111',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      {
        name: 'Ravi Kumar (Customer)',
        email: 'ravi.kumar@gmail.com',
        phone: '9848022222',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
        addresses: [
          {
            label: 'Home',
            street: 'Flat 402, Sai Residency, Ayyappa Society',
            locality: 'Madhapur',
            city: 'Hyderabad',
            pincode: '500081',
            lat: 17.4485,
            lng: 78.3908,
            isDefault: true,
          },
        ],
      },
      {
        name: 'Ramesh Goud (Kirana Merchant)',
        email: 'ramesh@srilakshmikirana.in',
        phone: '9848033333',
        password: hashedPassword,
        role: 'merchant',
        merchantId: 'm-1',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      {
        name: 'Swagath Grand Manager (Restaurant)',
        email: 'manager@swagathgrand.in',
        phone: '9848044444',
        password: hashedPassword,
        role: 'merchant',
        merchantId: 'm-2',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      {
        name: 'Naresh Rider (Delivery Hero)',
        email: 'naresh.rider@manamart.in',
        phone: '9848055555',
        password: hashedPassword,
        role: 'rider',
        riderId: 'r-1',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    ]);

    // 3. Insert Sample Stores
    console.log('🏪 Seeding Verified Hyperlocal Stores & Restaurants...');
    const stores = await Store.insertMany([
      {
        storeId: 'm-1',
        businessName: 'Sri Lakshmi Kirana & General Stores',
        category: 'kirana',
        subCategories: ['Staples', 'Rice', 'Dals', 'Daily Ghee', 'Spices'],
        ownerName: 'Ramesh Goud',
        phone: '9848033333',
        email: 'ramesh@srilakshmikirana.in',
        rating: 4.9,
        reviewCount: 320,
        eta: '⚡ 15-20 MINS',
        isVerified: true,
        isRestaurant: false,
        hasTableBooking: false,
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
        address: {
          street: 'Main Road, Near Ayyappa Temple',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          location: { type: 'Point', coordinates: [78.3915, 17.4482] },
        },
        activeOffers: [{ code: 'MANAKIRANA', description: 'Flat ₹50 OFF on ₹299', discountPercentage: 15 }],
      },
      {
        storeId: 'm-2',
        businessName: 'Swagath Grand Kitchen & Dining',
        category: 'food',
        subCategories: ['Hyderabadi Biryani', 'North Indian', 'Tandoor', 'Dine-In'],
        ownerName: 'K. V. Subba Rao',
        phone: '9848044444',
        email: 'manager@swagathgrand.in',
        rating: 4.8,
        reviewCount: 890,
        eta: '⚡ 25-30 MINS',
        isVerified: true,
        isRestaurant: true,
        hasTableBooking: true,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
        address: {
          street: 'Plot 14, Hitech City Main Rd',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          location: { type: 'Point', coordinates: [78.3882, 17.4495] },
        },
        activeOffers: [{ code: 'SWAGATH20', description: '20% OFF on Family Handi Biryani', discountPercentage: 20 }],
      },
      {
        storeId: 'm-3',
        businessName: 'Niloufer Cafe & Irani Chai',
        category: 'bakery',
        subCategories: ['Irani Dum Chai', 'Osmania Biscuits', 'Tie Biscuits', 'Maska Bun'],
        ownerName: 'Mohd. Siraj',
        phone: '9848066666',
        email: 'info@niloufercafe.in',
        rating: 4.9,
        reviewCount: 1420,
        eta: '⚡ 15 MINS',
        isVerified: true,
        isRestaurant: true,
        hasTableBooking: true,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        address: {
          street: 'Beside Cyber Towers',
          locality: 'Hitech City',
          city: 'Hyderabad',
          pincode: '500081',
          location: { type: 'Point', coordinates: [78.3792, 17.4504] },
        },
      },
      {
        storeId: 'm-4',
        businessName: 'MedPlus 24x7 Neighborhood Pharmacy',
        category: 'pharmacy',
        subCategories: ['Medicines', 'Health Diagnostics', 'Baby Care', 'First Aid'],
        ownerName: 'Dr. Srinivas',
        phone: '9848077777',
        email: 'medplus.hyd@gmail.com',
        rating: 4.7,
        reviewCount: 410,
        eta: '⚡ 15 MINS',
        isVerified: true,
        isRestaurant: false,
        hasTableBooking: false,
        image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
        address: {
          street: 'Near Metro Station',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          location: { type: 'Point', coordinates: [78.3920, 17.4475] },
        },
      },
    ]);

    // 4. Insert Sample Products
    console.log('📦 Seeding Products with Rupee Pricing & Stock...');
    const products = await Product.insertMany([
      {
        productId: 'p-1',
        storeId: 'm-1',
        name: 'Sona Masoori Raw Rice (5kg Bag)',
        nameTelugu: 'సోనా మసూరి బియ్యం (5 కేజీలు)',
        category: 'Staples & Grains',
        description: 'Aged 12-month pure Kurnool Sona Masoori raw rice. Fluffy, non-sticky grains.',
        price: 340,
        mrp: 380,
        unit: '5 kg Bag',
        inStock: true,
        stockCount: 80,
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
        tags: ['rice', 'staples', 'kirana', 'kurnool'],
      },
      {
        productId: 'p-2',
        storeId: 'm-1',
        name: 'Heritage Fresh Buffalo Curd (Pouch)',
        nameTelugu: 'హెరిటేజ్ తాజా పెరుగు',
        category: 'Dairy & Milk',
        description: 'Thick, creamy, set buffalo milk curd delivered chilled.',
        price: 42,
        mrp: 45,
        unit: '500g pouch',
        inStock: true,
        stockCount: 40,
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80',
        tags: ['curd', 'dairy', 'milk', 'heritage'],
      },
      {
        productId: 'p-3',
        storeId: 'm-2',
        name: 'Special Handi Chicken Dum Biryani',
        nameTelugu: 'స్పెషల్ హాండీ చికెన్ దమ్ బిర్యానీ',
        category: 'Hyderabadi Biryani',
        description: 'Slow-cooked in clay pot with pure ghee, saffron rice, and tender marinated chicken.',
        price: 360,
        mrp: 420,
        unit: '1 Handi (Serves 2)',
        inStock: true,
        stockCount: 50,
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        tags: ['biryani', 'dum biryani', 'swagath', 'chicken'],
      },
      {
        productId: 'p-4',
        storeId: 'm-3',
        name: 'Irani Dum Chai Flask + Osmania Box Combo',
        nameTelugu: 'ఇరానీ దమ్ చాయ్ + ఉస్మానియా బిస్కెట్లు',
        category: 'Tea & Snacks',
        description: 'Hot 500ml thermal flask of signature Niloufer Irani Dum Chai + 250g box of melting Osmania biscuits.',
        price: 180,
        mrp: 210,
        unit: '1 Flask + 1 Box',
        inStock: true,
        stockCount: 65,
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
        tags: ['tea', 'chai', 'osmania', 'niloufer'],
      },
      {
        productId: 'p-5',
        storeId: 'm-4',
        name: 'Dolo 650mg Paracetamol Tablets',
        nameTelugu: 'డోలో 650 టాబ్లెట్లు',
        category: 'Pharmacy',
        description: 'Effective fever and body ache relief strip of 15 tablets.',
        price: 32,
        mrp: 35,
        unit: '1 Strip (15 tabs)',
        inStock: true,
        stockCount: 150,
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        tags: ['medicine', 'dolo', 'paracetamol', 'fever'],
      },
    ]);

    // 5. Insert Sample Dine-In Table Reservations
    console.log('🍽️ Seeding Sample Restaurant Table Reservations...');
    const reservations = await Reservation.insertMany([
      {
        bookingId: 'RES-9482',
        restaurantId: 'm-2',
        restaurantName: 'Swagath Grand Kitchen & Dining',
        guestName: 'Ravi Kumar',
        guestEmail: 'ravi.kumar@gmail.com',
        guestPhone: '9848022222',
        date: 'Today, 24 Oct 2026',
        timeSlot: '08:00 PM',
        guestsCount: 4,
        seatingArea: 'Main AC Dining Hall',
        tableNumber: 'Table #4',
        specialRequests: 'Near window if possible. 1 high-chair for toddler.',
        status: 'Confirmed',
        isOtpVerified: true,
        qrEntryCode: 'MANA-PASS-9482-SWAGATH',
      },
      {
        bookingId: 'RES-8821',
        restaurantId: 'm-3',
        restaurantName: 'Niloufer Cafe & Irani Chai',
        guestName: 'Ananya Sharma',
        guestEmail: 'ananya.s@outlook.com',
        guestPhone: '9848088888',
        date: 'Tomorrow, 25 Oct 2026',
        timeSlot: '05:30 PM',
        guestsCount: 2,
        seatingArea: 'Rooftop Garden Seating',
        tableNumber: 'Table #R2',
        specialRequests: 'Evening tea batch with hot Osmania biscuits.',
        status: 'Confirmed',
        isOtpVerified: true,
        qrEntryCode: 'MANA-PASS-8821-NILOUFER',
      },
    ]);

    // 6. Insert Sample Live Orders
    console.log('🛍️ Seeding Sample Orders & Live Deliveries...');
    const orders = await Order.insertMany([
      {
        orderId: 'ORD-8942',
        customerId: users[1]._id.toString(),
        customerName: 'Ravi Kumar',
        customerPhone: '9848022222',
        deliveryAddress: {
          street: 'Flat 402, Sai Residency',
          locality: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
        },
        items: [
          {
            productId: 'p-1',
            name: 'Sona Masoori Raw Rice (5kg Bag)',
            price: 340,
            quantity: 2,
            storeId: 'm-1',
            storeName: 'Sri Lakshmi Kirana & General Stores',
          },
        ],
        subtotal: 680,
        deliveryFee: 20,
        totalAmount: 700,
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        orderStatus: 'OutForDelivery',
        deliveryOtp: '5849',
        assignedRider: {
          riderId: 'r-1',
          name: 'Naresh Rider',
          phone: '9848055555',
        },
        eta: '10 mins',
      },
    ]);

    // 7. Summary
    console.log('\n=============================================');
    console.log('🎉 MONGODB SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log(`• Users Inserted:         ${users.length}`);
    console.log(`• Stores Inserted:        ${stores.length}`);
    console.log(`• Products Inserted:      ${products.length}`);
    console.log(`• Reservations Inserted:  ${reservations.length}`);
    console.log(`• Orders Inserted:        ${orders.length}`);
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
