import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [merchant, setMerchant] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Add item with store boundary check (prompt if different store)
  const addItem = (product, store) => {
    if (merchant && merchant.id !== store.id && cartItems.length > 0) {
      if (window.confirm(`Your cart already contains items from ${merchant.businessName}. Reset cart to add items from ${store.businessName}?`)) {
        setMerchant(store);
        setCartItems([{ ...product, quantity: 1 }]);
        setIsCartOpen(true);
      }
      return;
    }

    setMerchant(store);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const clearCart = () => {
    setCartItems([]);
    setMerchant(null);
    setCoupon(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? (subtotal > 500 ? 0 : 35) : 0;
  const taxes = Math.round(subtotal * 0.05);

  let discount = 0;
  if (coupon) {
    if (coupon.code === 'WELCOME50' || coupon.code === 'SWAGATHFREE' || coupon.code === 'LOCAL50') {
      discount = Math.min(50, Math.round(subtotal * 0.2));
    } else if (coupon.code === 'KIRANA10') {
      discount = Math.round(subtotal * 0.1);
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + taxes - discount);

  const applyCouponCode = (code) => {
    const clean = code.trim().toUpperCase();
    if (['WELCOME50', 'SWAGATHFREE', 'LOCAL50', 'KIRANA10'].includes(clean)) {
      setCoupon({ code: clean, applied: true });
      return { success: true, message: `Coupon ${clean} applied successfully!` };
    }
    return { success: false, message: 'Invalid coupon code. Try WELCOME50 or SWAGATHFREE' };
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        merchant,
        coupon,
        isCartOpen,
        totalItemCount,
        subtotal,
        deliveryFee,
        taxes,
        discount,
        total,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCouponCode,
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
