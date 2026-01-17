"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });

  // 👇 MULTIPLE FILES STATE
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    // Fetch Categories
    axios.get('https://bua-backend.onrender.com/api/products/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("Session expired. Please login.");
        router.push('/login');
        return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (formData.category) data.append('category', formData.category);

    // 👇 LOOPING THROUGH MULTIPLE FILES
    if (files) {
      for (let i = 0; i < files.length; i++) {
        data.append('uploaded_images', files[i]);
      }
    }

    try {
      await axios.post('https://bua-backend.onrender.com/api/products/create/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
      });
      alert("Inventory Updated Successfully! 🏭");
      router.push('/vendor'); // Redirect to Dashboard
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to add product. Ensure you are a registered distributor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4 mt-16 flex justify-center">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border-t-8 border-[#8B0000] p-8">
            
            <div className="mb-8 border-b pb-4">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    Add Inventory Item
                </h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                    BUA Supply Chain Database
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Item Name / SKU</label>
                    <input 
                        name="name"
                        type="text" 
                        required
                        onChange={handleChange}
                        placeholder="e.g. BUA Cement (50kg Bag)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none transition bg-gray-50"
                    />
                </div>

                {/* Category & Price Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Category</label>
                        <select 
                            name="category"
                            required
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none bg-white"
                        >
                            <option value="">-- Select Sector --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Unit Price (₦)</label>
                        <input 
                            name="price"
                            type="number" 
                            required
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none transition bg-gray-50"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Technical Specifications</label>
                    <textarea 
                        name="description"
                        required
                        onChange={handleChange}
                        placeholder="Detailed product description, weight, and usage..."
                        className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-[#8B0000] outline-none transition bg-gray-50"
                    ></textarea>
                </div>

                {/* Image Upload (Multiple) */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Product Images (Multi-Select)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#8B0000] transition bg-gray-50 cursor-pointer relative">
                        <input 
                            type="file" 
                            multiple // 👈 Allows multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span className="text-4xl block mb-2 opacity-50">📷</span>
                        <p className="text-sm font-bold text-gray-600">
                            {files && files.length > 0 ? `Selected ${files.length} file(s)` : "Click or Drag Photos Here"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Hold CTRL to select multiple images.</p>
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-white uppercase tracking-wider shadow-lg transition-all transform active:scale-95 border border-[#600000] ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#600000]'
                    }`}
                >
                    {loading ? "Processing..." : "Upload to Inventory 🚀"}
                </button>

            </form>
        </div>
      </div>
    </main>
  );
}