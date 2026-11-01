import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // 1. Persist cart items across browser sessions, guest mode, and auth login
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('manamart_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('manamart_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Substitution policy: 'replace_similar' | 'contact_me' | 'refund_unavailable'
  const [substitutionPolicy, setSubstitutionPolicy] = useState(() => {
    return localStorage.getItem('manamart_substitution_policy') || 'replace_similar';
  });

  // Delivery slot preference: standard | express | scheduled
  const [deliverySlot, setDeliverySlot] = useState(() => {
    try {
      const saved = localStorage.getItem('manamart_delivery_slot');
      return saved
        ? JSON.parse(saved)
        : {
            type: 'standard', // 'standard' | 'express' | 'scheduled'
            title: 'Standard Delivery',
            eta: '25-35 mins',
            fee: 35,
            date: 'Today',
            timeSlot: 'Earliest Available (25-35 mins)',
          };
    } catch (e) {
      return {
        type: 'standard',
        title: 'Standard Delivery',
        eta: '25-35 mins',
        fee: 35,
        date: 'Today',
        timeSlot: 'Earliest Available (25-35 mins)',
      };
    }
  });

  // Track product stock alerts ('notify-me' subscriptions)
  const [stockAlerts, setStockAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('manamart_stock_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('manamart_cart_v2', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not save cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('manamart_substitution_policy', substitutionPolicy);
    } catch (e) {}
  }, [substitutionPolicy]);

  useEffect(() => {
    try {
      localStorage.setItem('manamart_delivery_slot', JSON.stringify(deliverySlot));
    } catch (e) {}
  }, [deliverySlot]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('manamart_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('manamart_coupon');
      }
    } catch (e) {}
  }, [coupon]);

  useEffect(() => {
    try {
      localStorage.setItem('manamart_stock_alerts', JSON.stringify(stockAlerts));
    } catch (e) {}
  }, [stockAlerts]);

  // Multi-Store Add Item: Support multiple merchants smoothly without wiping cart!
  const addItem = (product, store) => {
    const storeObj = {
      id: store?.id || product?.merchantId || 'default-store',
      businessName: store?.businessName || store?.name || 'Local Neighborhood Store',
      deliveryFee: store?.deliveryFee ?? 35,
      deliveryEta: store?.deliveryEta || '25-35 mins',
      operatingHours: store?.operatingHours || '8:00 AM - 10:30 PM',
      rating: store?.rating || 4.6,
      image: store?.image || store?.bannerImage,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit || 'unit',
          image: product.image,
          isVeg: product.isVeg !== false,
          inStock: product.inStock !== false,
          stockCount: product.stockCount ?? 15,
          quantity: 1,
          store: storeObj,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Remove all items belonging to a specific store
  const removeStore = (storeId) => {
    setCartItems((prev) => prev.filter((item) => item.store?.id !== storeId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('manamart_cart_v2');
    localStorage.removeItem('manamart_coupon');
  };

  // Subscribe to out-of-stock item alert
  const notifyWhenAvailable = (product) => {
    if (!stockAlerts.includes(product.id)) {
      setStockAlerts((prev) => [...prev, product.id]);
    }
    return true;
  };

  // Group cart items by store for Multi-Store Cart view
  const storeGroups = Object.values(
    cartItems.reduce((acc, item) => {
      const sId = item.store?.id || 'default-store';
      if (!acc[sId]) {
        acc[sId] = {
          store: item.store || {
            id: sId,
            businessName: 'Local Store',
            deliveryFee: 35,
            deliveryEta: '25-35 mins',
            operatingHours: '8:00 AM - 10:30 PM',
          },
          items: [],
          subtotal: 0,
          deliveryFee: 0,
        };
      }
      acc[sId].items.push(item);
      acc[sId].subtotal += item.price * item.quantity;
      return acc;
    }, {})
  ).map((group) => {
    // Delivery fee per store: ₹35, or ₹0 if store order > ₹400
    group.deliveryFee = group.subtotal > 400 ? 0 : (group.store.deliveryFee ?? 35);
    return group;
  });

  // Combined Financials
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Store-wise delivery charges combined
  const baseDeliveryTotal = storeGroups.reduce((acc, g) => acc + g.deliveryFee, 0);
  const expressSurcharge = deliverySlot.type === 'express' ? 20 : 0;
  const deliveryFee = cartItems.length > 0 ? baseDeliveryTotal + expressSurcharge : 0;

  // Platform fee (Transparent ₹5 neighborhood infrastructure fee)
  const platformFee = cartItems.length > 0 ? 5 : 0;

  // Taxes (5% GST for local restaurant / hypermart goods)
  const taxes = Math.round(subtotal * 0.05);

  // Discounts
  let discount = 0;
  if (coupon) {
    if (coupon.code === 'WELCOME50' || coupon.code === 'SWAGATHFREE' || coupon.code === 'LOCAL50') {
      discount = Math.min(50, Math.round(subtotal * 0.2));
    } else if (coupon.code === 'KIRANA10') {
      discount = Math.round(subtotal * 0.1);
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + platformFee + taxes - discount);

  const applyCouponCode = (code) => {
    const clean = code.trim().toUpperCase();
    if (['WELCOME50', 'SWAGATHFREE', 'LOCAL50', 'KIRANA10'].includes(clean)) {
      setCoupon({ code: clean, applied: true });
      return { success: true, message: `Coupon "${clean}" applied successfully!` };
    }
    return { success: false, message: 'Invalid coupon code. Try WELCOME50, SWAGATHFREE, or KIRANA10' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Compatibility helper: return primary or first merchant
  const merchant = storeGroups.length > 0 ? storeGroups[0].store : null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        merchant,
        storeGroups,
        coupon,
        isCartOpen,
        totalItemCount,
        subtotal,
        deliveryFee,
        baseDeliveryTotal,
        expressSurcharge,
        platformFee,
        taxes,
        discount,
        total,
        substitutionPolicy,
        deliverySlot,
        stockAlerts,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        removeStore,
        clearCart,
        applyCouponCode,
        removeCoupon,
        setSubstitutionPolicy,
        setDeliverySlot,
        notifyWhenAvailable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
