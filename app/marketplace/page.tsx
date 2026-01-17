"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();

  const getImageUrl = (product: any) => {
    let path = "";
    if (product.images && product.images.length > 0) path = product.images[0].image;
    else if (product.image) path = product.image;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://bua-backend.onrender.com${path}`;
  };

  const getRating = (p: any) => {
    if (!p.reviews || p.reviews.length === 0) return 0;
    const total = p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    return Math.round(total / p.reviews.length);
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const prodRes = await axios.get('https://bua-backend.onrender.com/api/products/');
            setProducts(prodRes.data);
            const catRes = await axios.get('https://bua-backend.onrender.com/api/products/categories/');
            setCategories([{id: 'all', name: 'All'}, ...catRes.data]);
            setLoading(false);
        } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory || p.category === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // BUA Theme Colors: Red (#8B0000), Gold (#FFD700), White
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      {/* 1. HERO SECTION - BUA CORPORATE RED THEME */}
      {/* Gradient goes from Dark Burgundy to Corporate Red */}
      <div className="relative bg-gradient-to-br from-[#500000] via-[#8B0000] to-[#A52A2A] text-white py-24 md:py-32 mt-16 overflow-hidden">
        
        {/* Background Effects (Gold & Red) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF4500] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Text Content */}
            <div className="text-left">
                <span className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md text-xs md:text-sm font-bold mb-6 text-yellow-400 uppercase tracking-widest shadow-lg">
                    🏗️ Industrial Scale & Infrastructure
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg">
                    BUA <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Foods</span> & <br/>
                    Infrastructure
                </h1>
                <p className="text-lg text-gray-200 mb-10 font-medium max-w-xl leading-relaxed opacity-90">
                    Unlocking opportunities in food production and logistics. Directly from our industrial hubs to your business.
                </p>
                
                {/* Search Bar - BUA Style */}
                <div className="max-w-xl relative group">
                    <div className="relative flex items-center bg-white rounded-full shadow-2xl p-1.5 md:p-2">
                        <span className="pl-4 text-2xl text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search Sugar, Cement, Flour..." 
                            className="w-full p-3 md:p-4 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none text-base md:text-lg"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                        {/* Button is BUA Red */}
                        <button className="bg-[#8B0000] hover:bg-[#600000] text-white px-6 md:px-8 py-3 rounded-full font-bold transition-all shadow-lg text-sm md:text-base">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Image - FIXED LINK */}
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-500/20 group">
                <img 
                    /* 👇 UPDATED LINK: Reliable Logistics/Warehouse Image */
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" 
                    alt="BUA Logistics & Infrastructure" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#500000]/60 to-transparent"></div>
            </div>

        </div>
      </div>

      {/* 2. CATEGORY TABS (Red Active State) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex space-x-3 py-4 min-w-max">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id || (selectedCategory === 'All' && cat.name === 'All');
                    return (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name === 'All' ? 'All' : cat.id)}
                            className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 border ${
                                isActive 
                                ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-md transform scale-105' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:border-red-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* 3. PRODUCTS GRID */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {selectedCategory === 'All' ? "Product Inventory" : `${selectedCategory}`}
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Wholesale & Industrial supply.</p>
            </div>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-32">
                 <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8B0000]"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map((product) => {
                    const imgUrl = getImageUrl(product);
                    const rating = getRating(product);

                    return (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col group h-full overflow-hidden">
                            <Link href={`/product/${product.id}`} className="block relative h-64 bg-gray-50 overflow-hidden">
                                {imgUrl ? (
                                    <img src={imgUrl} alt={product.name} className="h-full w-full object-contain p-6 group-hover:scale-110 transition duration-500 mix-blend-multiply" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-300"><span className="text-6xl">📦</span></div>
                                )}
                                {/* BUA Red Price Tag */}
                                <span className="absolute bottom-3 right-3 bg-[#8B0000] text-white text-sm font-bold px-3 py-1.5 rounded shadow-sm">
                                    ₦{Number(product.price).toLocaleString()}
                                </span>
                            </Link>
                            <div className="p-5 flex-1 flex flex-col">
                                <Link href={`/product/${product.id}`} className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#8B0000] transition-colors line-clamp-2">{product.name}</h3>
                                </Link>
                                <div className="flex justify-between items-center mt-2 mb-4">
                                     {/* 👇 UPDATED: Removed the "Source" line and replaced with clean Description */}
                                     <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={product.description}>
                                        {product.description || "No description provided."}
                                     </p>
                                     {rating > 0 && <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded">⭐ {rating}</span>}
                                </div>
                                <button 
                                    onClick={() => {
                                        addToCart({ id: product.id, name: product.name, price: product.price, image: imgUrl || "/placeholder.png" });
                                        alert("Added to Logistics Queue 🚚");
                                    }}
                                    className="mt-auto w-full bg-gray-100 hover:bg-[#8B0000] text-gray-800 hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* FOOTER - BUA RED */}
      <section className="py-20 bg-[#8B0000] text-white text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Partner with BUA Group</h2>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">Join our distribution network. Reliable supply, consistent quality.</p>
          <Link href="/sell" className="bg-white text-[#8B0000] px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-50 transition shadow-lg inline-block">
              Become a Distributor 🚛
          </Link>
      </section>

    </main>
  );
}