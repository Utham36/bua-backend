"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function VendorSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form Data State
  const [formData, setFormData] = useState({
    store_name: '',
    phone_number: '',
    address: '',
    description: '',
    logo: null as File | null,
  });

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://bua-backend.onrender.com${path}`;
  };

  // 1. Load existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      try {
        const res = await axios.get('https://bua-backend.onrender.com/api/users/vendor/settings/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data;
        setFormData({
            store_name: data.store_name || '',
            phone_number: data.phone_number || '',
            address: data.address || '',
            description: data.description || '',
            logo: null
        });

        if (data.logo) {
            setImagePreview(getImageUrl(data.logo));
        }

      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // 2. Handle Text Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle File Selection (Logo)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  // 4. Save Changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('access_token');

    try {
      const data = new FormData();
      data.append('store_name', formData.store_name);
      data.append('phone_number', formData.phone_number);
      data.append('address', formData.address);
      data.append('description', formData.description);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      await axios.put('https://bua-backend.onrender.com/api/users/vendor/settings/', data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });

      alert("Distributor Profile Updated Successfully! 🏭");
      router.push('/vendor'); 

    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="container mx-auto py-10 px-4 mt-16">
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header - BUA Red */}
            <div className="bg-[#8B0000] p-6 text-white flex justify-between items-center border-b-4 border-yellow-500">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider">Distributor Configuration</h1>
                    <p className="text-red-100 text-xs font-mono">Manage Public Corporate Profile</p>
                </div>
                <button 
                    onClick={() => router.back()} 
                    className="text-red-200 hover:text-white text-sm font-bold uppercase tracking-wide border border-red-800 px-3 py-1 rounded hover:bg-[#600000] transition"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT: Logo Upload */}
                <div className="md:col-span-1 flex flex-col items-center border-r border-gray-100 pr-0 md:pr-8">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden mb-4 relative flex items-center justify-center">
                        {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-contain p-2" alt="Store Logo" />
                        ) : (
                            <div className="text-center">
                                <span className="text-4xl block opacity-30">🏭</span>
                                <span className="text-xs text-gray-400 font-bold uppercase mt-2">No Logo Set</span>
                            </div>
                        )}
                    </div>
                    <label className="w-full cursor-pointer bg-gray-800 text-white px-4 py-3 rounded-lg text-xs font-bold hover:bg-[#8B0000] transition text-center uppercase tracking-wide shadow-md">
                        Upload Insignia 📤
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-3 text-center uppercase font-bold">
                        Format: JPG/PNG • Max: 2MB
                    </p>
                </div>

                {/* RIGHT: Store Details */}
                <div className="md:col-span-2 space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Business / Store Name</label>
                        <input 
                            type="text" 
                            name="store_name"
                            value={formData.store_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B0000] outline-none text-gray-900 font-bold bg-gray-50 transition"
                            placeholder="e.g. BUA Cement Logistics Ltd"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Official Contact</label>
                            <input 
                                type="text" 
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B0000] outline-none text-gray-900 bg-gray-50 transition"
                                placeholder="+234..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HQ Address</label>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B0000] outline-none text-gray-900 bg-gray-50 transition"
                                placeholder="Warehouse Location..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company Profile / Bio</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B0000] outline-none text-gray-900 bg-gray-50 transition"
                            placeholder="Describe your distribution capabilities..."
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className={`w-full py-4 rounded-lg font-bold text-white text-sm uppercase tracking-widest shadow-lg transition transform active:scale-95 border border-[#600000] ${
                                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#600000]'
                            }`}
                        >
                            {saving ? 'Processing Update...' : 'Save Configuration 💾'}
                        </button>
                    </div>

                </div>
            </form>
        </div>

      </div>
    </main>
  );
}