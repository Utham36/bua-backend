"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define what a Cart Item looks like
type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Load Cart from LocalStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem('halaal_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. Save Cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('halaal_cart', JSON.stringify(cart));
  }, [cart]);

  // ADD TO CART (or increase quantity)
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // REMOVE FROM CART (The Fix!) 🗑️
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === id);
      if (existing && existing.quantity > 1) {
         // If more than 1, just decrease
         return prevCart.map((item) => 
           item.id === id ? { ...item, quantity: item.quantity - 1 } : item
         );
      } else {
         // If it's 1, remove it entirely
         return prevCart.filter((item) => item.id !== id);
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}