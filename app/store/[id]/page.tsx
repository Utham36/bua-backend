"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function PublicStore() {
  const params = useParams(); 
  const router = useRouter(); 
  
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `https://bua-backend.onrender.com${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;
      const vendorId = params.id; 

      try {
        // 1. Get Profile
        const profileRes = await axios.get(`https://bua-backend.onrender.com/api/users/vendor/public/${vendorId}/`);
        setProfile(profileRes.data);

        // 2. Get Products
        const prodRes = await axios.get(`https://bua-backend.onrender.com/api/products/`);
        
        const vendorProducts = prodRes.data.filter((p: any) => {
            const ownerID = p.seller || p.vendor || p.user; 
            return Number(ownerID) === Number(vendorId);
        });

        setProducts(vendorProducts);

      } catch (error) {
        console.error("Error fetching store", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleMessageSeller = async () => {
    setChatLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        
        if (!token) { 
            alert("Please login to message this distributor.");
            router.push('/login'); 
            return; 
        }

        const myUsername = localStorage.getItem('username');
        if (profile.username === myUsername) {
            alert("You cannot chat with yourself!");
            return;
        }

        const res = await axios.post('https://bua-backend.onrender.com/api/chat/start/', 
            { recipient_id: params.id }, 
            { headers: { Authorization: 'Bearer ' + token } }
        );

        if (res.data.conversation_id) {
            router.push(`/chat?id=${res.data.conversation_id}`);
        } else {
            router.push('/chat');
        }

    } catch (error) {
        console.error("Chat Error:", error);
        alert("Could not start chat. Try again later.");
    } finally {
        setChatLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000]"></div></div>;
  
  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-400">Distributor Not Found 🏭</h1>
        <Link href="/" className="text-[#8B0000] mt-4 hover:underline">Return to Hub</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="container mx-auto py-10 px-4 mt-16">
        
        {/* BANNER - BUA RED GRADIENT */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10 relative border border-gray-200">
            {/* Gradient Background */}
            <div className="bg-gradient-to-r from-[#500000] to-[#8B0000] h-32 md:h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Industrial Pattern Overlay (CSS Trick) */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            </div>
            
            <div className="px-6 pb-6 flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16">
                {/* Logo Box */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0 z-10 flex items-center justify-center">
                    {profile.logo ? (
                         <img src={getImageUrl(profile.logo)} className="w-full h-full object-cover" alt="Store Logo" />
                    ) : (
                        <span className="text-4xl">🏭</span>
                    )}
                </div>
                
                <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1 pb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">{profile.store_name}</h1>
                    <p className="text-[#8B0000] font-bold flex items-center justify-center md:justify-start gap-1 mt-1 text-sm uppercase tracking-wider">
                        📍 {profile.address || "Authorized Distributor Hub"}
                    </p>
                </div>
                
                {/* ACTION BUTTONS - BUA THEMED */}
                <div className="mt-4 md:mt-0 pb-4 z-10 flex flex-wrap gap-3 justify-center md:justify-end">
                    
                    {/* 1. Chat Button - Red */}
                    <button 
                        onClick={handleMessageSeller}
                        disabled={chatLoading}
                        className="bg-[#8B0000] text-white px-6 py-2.5 rounded-lg font-bold shadow hover:bg-[#600000] transition flex items-center gap-2 border border-[#600000]"
                    >
                        {chatLoading ? "Connecting..." : "💬 Message Distributor"}
                    </button>

                    {profile.phone_number && (
                        <>
                            {/* 2. WhatsApp Button - Standard Green (Keep for recognition) */}
                            <a 
                                href={`https://wa.me/${profile.phone_number.replace(/\D/g,'')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="bg-[#25D366] text-white px-6 py-2.5 rounded-lg font-bold shadow hover:bg-[#128C7E] transition flex items-center gap-2"
                            >
                                📱 WhatsApp
                            </a>
                            
                            {/* 3. Call Button - BUA Gold */}
                            <a href={`tel:${profile.phone_number}`} className="bg-yellow-400 text-[#8B0000] px-6 py-2.5 rounded-lg font-bold shadow hover:bg-yellow-500 transition flex items-center gap-2 border border-yellow-500">
                                📞 Call Office
                            </a>
                        </>
                    )}
                </div>
            </div>
            
            <div className="px-8 pb-8 pt-6 border-t border-gray-100 mt-2 bg-gray-50/50">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-[0.2em] mb-3">Distributor Profile</h3>
                <p className="text-gray-700 leading-relaxed max-w-4xl text-lg font-medium">
                    {profile.description || "Authorized BUA Group Distributor. Providing wholesale supply of food and infrastructure materials."}
                </p>
            </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-[#8B0000] pl-3">Current Inventory ({products.length})</h2>
        </div>

        {products.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200 border-dashed">
                <span className="text-6xl block mb-4 grayscale opacity-50">🏗️</span>
                <p className="text-gray-500 text-lg font-bold">Inventory is currently empty.</p>
                <p className="text-gray-400 text-sm">Please check back later for stock updates.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                    let imgPath = "";
                    if (product.images && product.images.length > 0) imgPath = product.images[0].image;
                    else if (product.image) imgPath = product.image;

                    return (
                        <Link key={product.id} href={`/product/${product.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition duration-300 overflow-hidden group border border-gray-200 block">
                            <div className="h-52 bg-gray-100 relative overflow-hidden flex items-center justify-center p-6">
                                {imgPath ? (
                                    <img src={getImageUrl(imgPath)} className="h-full w-full object-contain group-hover:scale-110 transition duration-500 mix-blend-multiply" alt={product.name} />
                                ) : (
                                    <div className="text-gray-300 text-6xl">📦</div>
                                )}
                                {/* Category Tag */}
                                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    {product.category_name || "Stock"}
                                </span>
                            </div>
                            <div className="p-5 border-t border-gray-100">
                                <h3 className="font-bold text-gray-900 group-hover:text-[#8B0000] transition truncate text-lg">{product.name}</h3>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-[#8B0000] font-black text-xl">₦{Number(product.price).toLocaleString()}</p>
                                </div>
                                <button className="w-full mt-4 py-2 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm group-hover:bg-[#8B0000] group-hover:text-white transition">
                                    View Details →
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>
        )}

      </div>
    </main>
  );
}