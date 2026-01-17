"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar'; 
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function EditProduct() {
  const params = useParams(); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // 1. Separate state for file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    let url = path.startsWith("http") ? path : `https://bua-backend.onrender.com${path}`;
    // Cache buster
    return `${url}?t=${new Date().getTime()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { window.location.href = '/login'; return; }

      try {
        const catRes = await axios.get('https://bua-backend.onrender.com/api/products/categories/');
        setCategories(catRes.data);

        const prodRes = await axios.get(`https://bua-backend.onrender.com/api/products/${params.id}/`);
        const p = prodRes.data;

        setFormData({
            name: p.name,
            category: p.category || '', 
            price: p.price,
            description: p.description || '',
        });
        
        if (p.images && p.images.length > 0) setCurrentImage(getImageUrl(p.images[0].image));
        else if (p.image) setCurrentImage(getImageUrl(p.image));

      } catch (error) {
        window.location.href = '/vendor';
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchData();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCurrentImage(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('access_token');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (formData.category) data.append('category', formData.category);
    
    // 2. Send image under BOTH keys to be safe
    if (selectedFile) {
        data.append('image', selectedFile);
        data.append('uploaded_images', selectedFile); 
    }

    try {
      await axios.patch(`https://bua-backend.onrender.com/api/products/${params.id}/`, data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("Inventory Record Updated! ✅");
      // 3. Force hard reload
      window.location.href = '/vendor'; 

    } catch (error) {
      alert("Failed to update product.");
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000]"></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="container mx-auto py-10 px-4 mt-16 flex justify-center">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center border-b-4 border-[#8B0000]">
                <h1 className="text-xl font-bold uppercase tracking-wider">Update Inventory</h1>
                <button onClick={() => window.location.href = '/vendor'} className="text-gray-400 hover:text-white text-sm uppercase font-bold">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden mb-4 relative flex items-center justify-center">
                        {currentImage ? (
                            <img src={currentImage} className="w-full h-full object-contain p-2" alt="Product" />
                        ) : (
                            <span className="text-4xl opacity-20">📦</span>
                        )}
                    </div>
                    <label className="w-full cursor-pointer bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition text-center uppercase tracking-wide">
                        Change Photo <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="md:col-span-2 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item Name</label>
                        <input name="name" type="text" required value={formData.name} onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none font-bold text-gray-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                                <option value="">-- Select --</option>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price (₦)</label>
                            <input name="price" type="number" required value={formData.price} onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg text-[#8B0000] font-black" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] outline-none" />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                         <button type="submit" disabled={saving}
                            className={`w-full py-4 rounded-lg font-bold text-white uppercase tracking-widest text-sm shadow-lg ${saving ? 'bg-gray-400' : 'bg-[#8B0000] hover:bg-[#600000]'}`}>
                            {saving ? "Saving..." : "Update Item 💾"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </main>
  );
}