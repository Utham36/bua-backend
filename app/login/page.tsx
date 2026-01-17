"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://bua-backend.onrender.com/api/users/login/', formData);
      
      // Store Tokens
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', formData.username);

      // 👇 THE FIX IS HERE
      // Instead of forcing everyone to '/vendor', we send them to Home ('/')
      // We use window.location.href to force the Navbar to update immediately.
      window.location.href = '/'; 

    } catch (err) {
      console.error("Login Error", err);
      setError('Access Denied: Invalid ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      
      {/* BACKGROUND IMAGE - Industrial Theme */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" 
            alt="BUA Industrial Background" 
            className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#500000] to-black opacity-80"></div>
      </div>

      {/* LOGIN CARD */}
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md relative z-10 border-t-8 border-[#8B0000]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8B0000] text-white text-3xl mb-4 shadow-lg ring-4 ring-red-100">
            🌐
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            BUA <span className="text-[#8B0000]">Access</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-widest">Corporate Portal Login</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-[#8B0000] text-red-700 px-4 py-3 rounded mb-6 text-sm font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Corporate ID / Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none transition bg-gray-50"
              placeholder="e.g. BUA_Logistics"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none transition bg-gray-50"
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-white uppercase tracking-wider shadow-lg transition-all transform active:scale-95 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#600000]'
            }`}
          >
            {loading ? 'Authenticating...' : 'Secure Login 🔒'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-sm">
          New Distributor?{' '}
          <Link href="/signup" className="text-[#8B0000] font-bold hover:underline hover:text-yellow-600 transition">
            Apply for Access
          </Link>
        </p>
      </div>
      
      <div className="absolute bottom-6 text-white/40 text-[10px] text-center w-full z-10 uppercase tracking-widest">
        Authorized Personnel Only • BUA Group Infrastructure
      </div>
    </div>
  );
}