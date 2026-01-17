"use client";
import React from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function Cart() {
  const { cart, removeFromCart, addToCart, decreaseQuantity } = useCart();

  // Calculate Total Price
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://bua-backend.onrender.com${path}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="container mx-auto py-12 px-4 mt-16">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-l-8 border-[#8B0000] pl-4 uppercase tracking-tight">
          Procurement List 📋
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
            <div className="text-6xl mb-6 grayscale opacity-50">🏗️</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Your requisition list is empty</h2>
            <p className="text-gray-400 mb-8">Add items from the industrial marketplace to proceed.</p>
            <Link href="/" className="bg-[#8B0000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#600000] transition shadow-md">
              Browse Inventory
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT: Cart Items List */}
            <div className="flex-grow">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between">
                    <span className="font-bold text-gray-600 text-sm uppercase">Item Details</span>
                    <span className="font-bold text-gray-600 text-sm uppercase hidden md:block">Quantity & Subtotal</span>
                </div>
                
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 p-6 border-b border-gray-100 last:border-0 hover:bg-red-50/30 transition">
                    
                    {/* IMAGE */}
                    <div className="h-24 w-24 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                        {item.image ? (
                          <img 
                            src={getImageUrl(item.image) || "/placeholder.png"} 
                            alt={item.name} 
                            className="h-full w-full object-contain p-2 mix-blend-multiply" 
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">Unit Cost: ₦{Number(item.price).toLocaleString()}</p>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex flex-col items-center md:items-end gap-3 min-w-[150px]">
                        
                        {/* QTY Buttons */}
                        <div className="flex items-center gap-0 bg-white border border-gray-300 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-10 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200"
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-800 w-12 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-10 h-9 flex items-center justify-center hover:bg-gray-100 text-[#8B0000] font-bold border-l border-gray-200"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-xl font-black text-[#8B0000]">₦{(item.price * item.quantity).toLocaleString()}</div>
                        
                        <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-bold flex items-center gap-1"
                        >
                            <span>🗑️</span> Remove Item
                        </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Order Summary (Invoice Style) */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#8B0000] p-8 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider border-b pb-4">Proforma Invoice</h3>
                
                <div className="flex justify-between mb-4 text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-4 text-gray-600 font-medium">
                  <span>Logistics Fee</span>
                  <span className="text-green-600 font-bold">₦0.00 (Standard)</span>
                </div>
                <div className="flex justify-between mb-4 text-gray-600 font-medium">
                  <span>VAT (7.5%)</span>
                  <span>Included</span>
                </div>
                
                <div className="border-t-2 border-dashed border-gray-200 my-6"></div>
                
                <div className="flex justify-between mb-8 text-2xl font-black text-[#8B0000]">
                  <span>Total Due</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block w-full bg-[#8B0000] text-white text-center py-4 rounded-lg font-bold text-lg hover:bg-[#600000] transition shadow-lg hover:shadow-xl transform active:scale-95 border border-[#600000]">
                  Process Order 💳
                </Link>

                <div className="mt-6 text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                  🔒 Secured by <span className="font-bold text-gray-600">BUA Secure Gateway</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}