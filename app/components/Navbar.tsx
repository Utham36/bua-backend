"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { cart } = useCart();
  const [user, setUser] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('access_token');
    if (username && token) setUser(username);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
    router.push('/login');
  };

  const startAIChat = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    try {
        const res = await axios.post('https://bua-backend.onrender.com/api/chat/start-ai-chat/', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        router.push(`/chat?id=${res.data.conversation_id}`);
    } catch (err) { alert("Could not start AI Assistant."); }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out font-sans border-b ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-gray-200' 
        : 'bg-white/90 backdrop-blur-sm border-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* 1. BRANDING: Points to Landing Page (/) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#8B0000] p-2 rounded-lg group-hover:bg-[#A00000] transition-colors shadow-sm">
             {/* Globe Icon matching BUA Logo */}
            <span className="text-2xl text-white">🌐</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#8B0000] tracking-tighter leading-none">
              BUA <span className="text-yellow-600">Group</span>
            </span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              Foods & Infrastructure
            </span>
          </div>
        </Link>

        {/* 2. NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1.5 rounded-full border border-gray-200">
          
          {/* 👇 UPDATED: Points to /marketplace now */}
          <NavLink href="/marketplace" current={pathname} label="Marketplace" icon="🏭" />
          
          <NavLink href="/sell" current={pathname} label="Supply Chain" icon="🚚" />

          {user && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <NavLink href="/orders" current={pathname} label="Orders" icon="📋" />
              <NavLink href="/chat" current={pathname} label="AI Logistics" icon="💬" />
            </>
          )}
        </div>

        {/* 3. RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          
          {user && (
            <div className="hidden lg:flex items-center gap-3">
                {/* AI Button - Gold/Yellow Theme */}
                <button 
                    onClick={startAIChat}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#8B0000] bg-yellow-100 rounded-full hover:bg-yellow-400 transition-all border border-yellow-200"
                >
                    <span>🤖</span> <span>BUA Assistant</span>
                </button>

                {/* Vendor Panel - Red Theme */}
                <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#8B0000] rounded-full hover:bg-[#600000] shadow-md transition-all">
                    <span>👨‍💼</span> <span>Vendor Portal</span>
                </Link>
            </div>
          )}

          {/* Cart - Red Accent */}
          <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-[#8B0000] hover:bg-red-50 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#8B0000] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Account</p>
                    <p className="text-sm font-bold text-[#8B0000] leading-none">{user}</p>
                  </div>
                  <div className="h-10 w-10 bg-[#8B0000] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white group-hover:ring-yellow-400 transition-all">
                    {user.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="Logout">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </>
            ) : (
              <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-white bg-[#8B0000] hover:bg-[#600000] rounded-full shadow-lg transition-all">
                Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, label, icon }: any) {
  const isActive = current === href;
  return (
    <Link href={href} className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all text-sm ${isActive ? 'bg-white text-[#8B0000] font-bold shadow-sm' : 'text-gray-500 hover:text-[#8B0000]'}`}>
      <span>{icon}</span><span>{label}</span>
    </Link>
  );
}