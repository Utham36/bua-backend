"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. STATE TO HOLD USER INPUTS 📝
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    instructions: ''
  });

  // Calculate Total
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);

  // Handle Typing in the Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Please login to place an order");
        router.push('/login');
        return;
      }

      // 2. PREPARE THE REAL DATA 📦
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        // Send the form data to the backend! 👇
        phone: formData.phone,
        address: `${formData.address} (${formData.firstName} ${formData.lastName}) - Note: ${formData.instructions}`
      };

      await axios.post('https://bua-backend.onrender.com/api/orders/create/', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Logistics Request Confirmed! 🚚");
      clearCart(); 
      router.push('/orders'); 

    } catch (error) {
      console.error("Order Failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="container mx-auto py-10 px-4 mt-16">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-l-8 border-[#8B0000] pl-4 uppercase tracking-tight">
          Logistics Details 🚚
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT: Shipping Form */}
          <div className="flex-grow bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Dispatch Information</h2>
                <p className="text-gray-500 text-sm">Please provide accurate details for delivery.</p>
            </div>
            
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                        <input required name="firstName" onChange={handleChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                        <input required name="lastName" onChange={handleChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none transition" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (For Driver)</label>
                    <input required name="phone" onChange={handleChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none transition" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address / Warehouse Location</label>
                    <input required name="address" onChange={handleChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none transition" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Special Handling Instructions (Optional)</label>
                    <textarea name="instructions" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#8B0000] outline-none transition"></textarea>
                </div>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full md:w-96">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#8B0000] sticky top-24">
                <h3 className="text-xl font-bold mb-6 text-gray-800 uppercase border-b pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between font-black text-xl text-[#8B0000] border-t pt-4">
                    <span>Total</span>
                    <span>₦{totalPrice.toLocaleString()}</span>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className={`mt-8 w-full py-4 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#600000]'}`}
                >
                    {loading ? "Processing Request..." : "Confirm Logistics Order 🚚"}
                </button>
                
                <p className="mt-4 text-xs text-center text-gray-400">
                    By clicking confirm, you agree to BUA logistics terms.
                </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}