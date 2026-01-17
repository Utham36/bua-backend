"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
// 👇 IMPORT THE NEW REVIEWS COMPONENT
import ReviewsSection from '../../components/ReviewsSection';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  // 1. DATA STATES
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>(""); 
  const [loading, setLoading] = useState(true);
  
  // 2. UI STATES
  const [activeTab, setActiveTab] = useState('details');
  const [chatLoading, setChatLoading] = useState(false);
  
  // (Removed manual review states: rating, reviewComment, submitting - now handled in ReviewsSection)

  // 👇 HELPER: Fixes Image Links
  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png"; 
    if (path.startsWith("http")) return path; 
    return `https://bua-backend.onrender.com${path}`;
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://bua-backend.onrender.com/api/products/${id}/`);
        setProduct(res.data);
        
        if (res.data.images && res.data.images.length > 0) {
            setActiveImage(res.data.images[0].image); 
        } else {
            setActiveImage(res.data.image || ""); 
        }

        const allRes = await axios.get('https://bua-backend.onrender.com/api/products/');
        const others = allRes.data.filter((p: any) => p.id !== Number(id));
        setRelatedProducts(others.slice(0, 3));
      } catch (error) {
        console.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // --- CHAT LOGIC ---
  const handleMessageSeller = async () => {
    setChatLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }

        if (token && product.seller_username === localStorage.getItem('username')) {
            alert("You cannot chat with yourself!");
            return;
        }

        const res = await axios.post('https://bua-backend.onrender.com/api/chat/start/', 
            { recipient_id: product.seller }, 
            { headers: { Authorization: 'Bearer ' + token } }
        );

        router.push(res.data.conversation_id ? `/chat?id=${res.data.conversation_id}` : '/chat');

    } catch (error) {
        console.error(error);
        alert("Could not start chat.");
    } finally {
        setChatLoading(false);
    }
  };

  // --- AI LOGIC ---
  const handleAskAI = async () => {
    setChatLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }

        const res = await axios.post('https://bua-backend.onrender.com/api/chat/start-ai-chat/', {}, {
            headers: { Authorization: 'Bearer ' + token }
        });

        if (res.data.conversation_id) {
            router.push(`/chat?id=${res.data.conversation_id}`);
        }
    } catch (error) {
        console.error(error);
        alert("Could not connect to AI.");
    } finally {
        setChatLoading(false);
    }
  };

  if (loading || !product) return <div className="p-10 text-center mt-20 text-[#8B0000] font-bold">Loading Inventory... 🏭</div>;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4 mt-16">
        
        {/* 1. TOP SECTION (Gallery + Info) */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8 border border-gray-200">
            
            {/* 📸 LEFT: IMAGE GALLERY */}
            <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-100">
                <div className="w-full h-96 flex items-center justify-center bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-200 p-4">
                    {activeImage ? (
                        <img 
                            src={getImageUrl(activeImage)} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                    ) : (
                        <span className="text-8xl">📦</span>
                    )}
                </div>

                <div className="flex gap-3 overflow-x-auto w-full pb-2 px-1">
                    {product.images && product.images.map((img: any) => (
                        <button 
                            key={img.id} 
                            onClick={() => setActiveImage(img.image)}
                            className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 bg-white transition-all ${activeImage === img.image ? 'border-[#8B0000] ring-2 ring-red-100 scale-105' : 'border-gray-300 hover:border-red-400 opacity-80 hover:opacity-100'}`}
                        >
                            <img src={getImageUrl(img.image)} className="w-full h-full object-contain" />
                        </button>
                    ))}
                </div>
            </div>

            {/* 📝 RIGHT: PRODUCT INFO */}
            <div className="md:w-1/2 p-8 flex flex-col">
                <div className="mb-auto">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Industrial Supply</p>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                    
                    <div className="flex items-center gap-2 mb-6 text-yellow-500">
                        <span className="text-2xl">{'★'.repeat(Math.round(product.average_rating || 0))}</span>
                        <span className="text-gray-400 text-sm font-bold">({product.review_count || 0} Reviews)</span>
                    </div>

                    <p className="text-4xl font-black text-[#8B0000] mb-8">₦{Number(product.price).toLocaleString()}</p>
                    
                    {/* Seller Box - Red Theme */}
                    <div className="bg-red-50 p-6 rounded-xl mb-8 border border-red-100 shadow-sm">
                        <p className="font-bold text-[#8B0000] mb-1 text-xs uppercase tracking-wider">Distributor / Supplier</p>
                        <p className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                            🏢 {product.seller_username || product.seller_name || "Verified Supplier"}
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={handleMessageSeller}
                                disabled={chatLoading}
                                className="flex-1 bg-[#8B0000] text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-[#600000] transition flex items-center justify-center gap-2 shadow hover:shadow-lg"
                            >
                                💬 Contact Supplier
                            </button>

                            <button 
                                onClick={handleAskAI}
                                className="flex-1 bg-yellow-400 text-[#8B0000] px-4 py-3 rounded-lg text-sm font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2 shadow hover:shadow-lg border border-yellow-500"
                            >
                                🤖 Ask BUA Assistant
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: getImageUrl(activeImage)
                        });
                        alert("Added to Logistics Queue! 🚚");
                    }} 
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-xl hover:bg-[#8B0000] transition-all shadow-xl transform active:scale-95 flex justify-center items-center gap-2"
                >
                   <span>🛒</span> Add to Order
                </button>
            </div>
        </div>

        {/* 2. TABS SECTION */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 border border-gray-200">
            <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 font-bold text-center transition ${activeTab === 'details' ? 'border-b-4 border-[#8B0000] text-[#8B0000] bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}>Specifications</button>
                <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-4 font-bold text-center transition ${activeTab === 'reviews' ? 'border-b-4 border-[#8B0000] text-[#8B0000] bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}>Client Reviews ({product.review_count})</button>
            </div>
            
            <div className="p-8 min-h-[200px]">
                {activeTab === 'details' ? (
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Product Overview</h3>
                        <p>{product.description || "No description provided."}</p>
                    </div>
                ) : (
                    // 👇 THIS IS THE NEW PART: Using the modular Reviews Component
                    <ReviewsSection reviews={product.reviews || []} productId={product.id} />
                )}
            </div>
        </div>

        {/* 3. RELATED PRODUCTS */}
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-8 border-[#8B0000] pl-4">Similar Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg shadow-sm hover:shadow-xl transition overflow-hidden border border-gray-100 group">
                        <Link href={`/product/${p.id}`} className="block">
                            <div className="h-48 bg-gray-50 flex items-center justify-center p-4 group-hover:bg-red-50 transition">
                                {p.images && p.images.length > 0 ? (
                                    <img src={getImageUrl(p.images[0].image)} className="h-full w-full object-contain mix-blend-multiply" />
                                ) : (
                                    <span className="text-4xl">📦</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 truncate group-hover:text-[#8B0000] transition">{p.name}</h3>
                                <p className="text-[#8B0000] font-bold mt-1">₦{Number(p.price).toLocaleString()}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}