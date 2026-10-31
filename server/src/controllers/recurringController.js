import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { generateOTP } from '../utils/otpGenerator.js';

export async function createRecurringList(req, res) {
  try {
    const { title, merchantId, frequency = 'monthly', scheduledDay = 1, scheduledTime = '10:00 AM', items, deliveryAddress } = req.body;
    const customerId = req.user.id;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Shopping list must contain at least one item.' });
    }

    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[1];

    let estimatedTotal = 0;
    const formattedItems = items.map((item) => {
      const prod = mockDb.products.find((p) => p.id === item.productId);
      const price = prod ? prod.price : item.price || 100;
      const qty = item.quantity || 1;
      estimatedTotal += price * qty;
      return {
        productId: item.productId,
        name: prod ? prod.name : item.name,
        price,
        quantity: qty,
        unit: prod ? prod.unit : item.unit || 'unit',
      };
    });

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(Number(scheduledDay) || 1);

    const newList = {
      id: `rec-${uuidv4().slice(0, 8)}`,
      customerId,
      title: title || 'Monthly Essentials List',
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      frequency,
      scheduledDay: Number(scheduledDay) || 1,
      scheduledTime,
      status: 'active',
      customerApprovalRequired: true,
      nextScheduledDate: nextDate.toISOString().split('T')[0],
      items: formattedItems,
      estimatedTotal,
      deliveryAddress: deliveryAddress || (req.user.addresses && req.user.addresses[0]) || {
        street: '100 Feet Road',
        locality: 'Madhapur',
        city: 'Hyderabad',
      },
      lastExecutionDate: null,
      history: [],
      createdAt: new Date().toISOString(),
    };

    mockDb.recurringLists.push(newList);

    return res.status(201).json({
      success: true,
      message: 'Monthly recurring shopping list created successfully!',
      list: newList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyRecurringLists(req, res) {
  try {
    const customerId = req.user.id;
    const lists = mockDb.recurringLists.filter((l) => l.customerId === customerId);
    return res.json({
      success: true,
      count: lists.length,
      lists,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function pauseRecurringList(req, res) {
  try {
    const { id } = req.params;
    const list = mockDb.recurringLists.find((l) => l.id === id);
    if (!list) {
      return res.status(404).json({ success: false, message: 'Recurring list not found.' });
    }
    list.status = 'paused';
    return res.json({ success: true, message: 'Recurring list paused.', list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resumeRecurringList(req, res) {
  try {
    const { id } = req.params;
    const list = mockDb.recurringLists.find((l) => l.id === id);
    if (!list) {
      return res.status(404).json({ success: false, message: 'Recurring list not found.' });
    }
    list.status = 'active';
    return res.json({ success: true, message: 'Recurring list resumed.', list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Monthly Execution Workflow
export async function executeRecurringOrder(req, res) {
  try {
    const { id } = req.params;
    const list = mockDb.recurringLists.find((l) => l.id === id);
    if (!list) {
      return res.status(404).json({ success: false, message: 'Recurring list not found.' });
    }

    // Check merchant availability
    const merchant = mockDb.merchants.find((m) => m.id === list.merchantId);
    if (!merchant || !merchant.isOpen) {
      return res.status(400).json({
        success: false,
        message: `Merchant ${merchant ? merchant.businessName : ''} is currently closed. Order will retry next operating window.`,
      });
    }

    // Verify stock and calculate final verified pricing
    let subtotal = 0;
    const verifiedItems = list.items.map((item) => {
      const prod = mockDb.products.find((p) => p.id === item.productId);
      const inStock = prod ? prod.inStock : true;
      const price = prod ? prod.price : item.price;
      if (inStock) {
        subtotal += price * item.quantity;
      }
      return {
        ...item,
        price,
        inStock,
        available: inStock,
      };
    });

    const deliveryFee = 30;
    const taxesAndCharges = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + taxesAndCharges;
    const otp = generateOTP(4);

    // Convert into a live order
    const orderNumber = `MM-REC-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      id: `ord-${uuidv4().slice(0, 8)}`,
      orderNumber,
      customerId: list.customerId,
      customerName: req.user.name || 'Valued Customer',
      customerPhone: req.user.phone || '9876543210',
      merchantId: list.merchantId,
      merchantName: list.merchantName,
      merchantAddress: merchant.address.street,
      merchantCoordinates: { lat: merchant.address.lat, lng: merchant.address.lng },
      riderId: 'r-1',
      riderName: 'Suresh Varma (Assigned Partner)',
      riderPhone: '9123456780',
      items: verifiedItems,
      subtotal,
      deliveryFee,
      taxesAndCharges,
      discount: 0,
      totalAmount,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      deliveryOtp: otp,
      deliveryAddress: list.deliveryAddress,
      isRecurringOrder: true,
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'Monthly Subscription Triggered', time: 'Just now', note: 'Automated recurring execution initiated' },
        { status: 'Merchant Stock Confirmed', time: 'Just now', note: `${verifiedItems.length} items verified in stock` },
        { status: 'Confirmed & Scheduled', time: 'Just now', note: 'Payment settled via preferred UPI mandate' },
      ],
    };

    mockDb.orders.unshift(newOrder);

    // Update list execution record
    list.lastExecutionDate = new Date().toISOString().split('T')[0];
    list.history.unshift({
      executionDate: list.lastExecutionDate,
      orderId: newOrder.id,
      orderNumber,
      status: 'Order Placed & Confirmed',
      amount: totalAmount,
    });

    // Notify customer
    mockDb.notifications.unshift({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: list.customerId,
      title: `Monthly Order ${orderNumber} Dispatched! 📦`,
      message: `Your monthly list "${list.title}" from ${list.merchantName} is confirmed for ₹${totalAmount}.`,
      type: 'recurring',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'Monthly order dispatched successfully!',
      order: newOrder,
      list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteRecurringList(req, res) {
  try {
    const { id } = req.params;
    const index = mockDb.recurringLists.findIndex((l) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Recurring list not found.' });
    }
    mockDb.recurringLists.splice(index, 1);
    return res.json({ success: true, message: 'Recurring list deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

