"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://bua-backend.onrender.com/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        const errorMessage = typeof data === 'object' 
          ? Object.values(data).flat().join(', ') 
          : 'Registration failed';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Connection failed. Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2072&auto=format&fit=crop" 
            alt="BUA Factory" 
            className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#8B0000]/50 to-black opacity-90"></div>
      </div>

      {/* SIGNUP CARD */}
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-xl shadow-2xl w-full max-w-md relative z-10 border-t-8 border-yellow-500">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            Distributor <span className="text-yellow-600">App</span>
          </h1>
          <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest">Join the BUA Supply Chain</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 text-sm font-bold">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Business Name / ID
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-gray-50"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. DangoteEnterprises"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-gray-50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Set Access Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-gray-50"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-[#8B0000] uppercase tracking-wider shadow-lg transition-all transform active:scale-95 border-2 border-yellow-500 ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'
            }`}
          >
            {loading ? 'Processing...' : 'Submit Application 📋'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-sm">
          Already a partner?{' '}
          <Link href="/login" className="text-[#8B0000] font-bold hover:underline">
            Login to Portal
          </Link>
        </p>
      </div>
    </div>
  );
}