"use client";
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  // 👇 UPDATED: BRIGHTER, HIGH-RELIABILITY IMAGES
  const heroImages = [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070", // Bright Warehouse/Logistics
    "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=2072", // Cement Plant
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071", // Sugar/Foods
  ];

  useEffect(() => {
    setMounted(true);
    const imageTimer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const dataTimer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 3000);

    return () => {
      clearInterval(imageTimer);
      clearInterval(dataTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen font-sans bg-[#020202] text-white selection:bg-[#B51339] selection:text-white overflow-x-hidden">
      <Navbar />

      <style jsx global>{`
        @keyframes slow-pan {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-pan {
          animation: slow-pan 10s ease-in-out infinite alternate;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .text-glow {
          text-shadow: 0 0 40px rgba(181, 19, 57, 0.6);
        }
        .gold-glow {
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* BACKGROUND IMAGES */}
        <div className="absolute inset-0 z-0">
            {heroImages.map((img, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                        index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <img 
                        src={img} 
                        className="w-full h-full object-cover animate-slow-pan brightness-[0.5]" 
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                </div>
            ))}
            
            {/* EXPENSIVE GLOW EFFECTS */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#B51339] rounded-full filter blur-[180px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-600 rounded-full filter blur-[150px] opacity-10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center mt-16">
            
            {/* LEFT TEXT */}
            <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel border-white/10">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-green-400 tracking-[0.2em] uppercase">System Online: v3.1</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter">
                    AFRICA <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-red-600 gold-glow">
                        UNLOCKED.
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl border-l-4 border-[#B51339] pl-6">
                    The <strong>₦17 Trillion</strong> infrastructure backbone connecting the continent. 
                    Orchestrating Supply Chain from a single <span className="text-white font-bold">Quantum Core.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link href="/marketplace" className="group relative px-10 py-5 bg-[#B51339] rounded-none overflow-hidden transition-all hover:scale-105">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative font-bold text-white text-lg tracking-widest uppercase flex items-center gap-3">
                           Initialize Portal <span className="text-2xl">→</span>
                        </span>
                    </Link>
                    <Link href="/orders" className="group px-10 py-5 glass-panel hover:bg-white/10 transition-all flex items-center gap-3 font-bold text-lg tracking-widest uppercase border-l-2 border-white/20 hover:border-[#B51339]">
                        <span>📡</span> Live Sat-Nav
                    </Link>
                </div>
            </div>

            {/* RIGHT DASHBOARD VISUALIZER */}
            <div className="lg:col-span-5 relative hidden lg:block">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#B51339] to-yellow-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                <div className="relative glass-panel rounded-3xl p-8 transform transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 tracking-widest">SECURE_LINK_ESTABLISHED</div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Real-Time Inventory", value: "14.5M Units", trend: "+12%", color: "text-blue-400" },
                            { title: "Active Fleet Tracking", value: "842 Trucks", trend: "98% On-Time", color: "text-green-400" },
                            { title: "Revenue Velocity", value: "₦4.2B / Wk", trend: "▲ Optimal", color: "text-yellow-400" },
                        ].map((stat, i) => (
                            <div key={i} className={`p-5 rounded-xl border-l-4 transition-all duration-500 ${activeTab === i ? "bg-white/10 border-[#B51339]" : "bg-transparent border-transparent opacity-50"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                        <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
                                    </div>
                                    <div className={`text-sm font-bold ${stat.color}`}>{stat.trend}</div>
                                </div>
                                {activeTab === i && (
                                    <div className="w-full bg-gray-800 h-0.5 mt-3 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#B51339] to-yellow-500 w-3/4 animate-[load-bar_2s_ease-out]"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. THE ECOSYSTEM */}
      <section className="py-32 relative z-10 bg-[#020202]">
          <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">INTEGRATED <span className="text-[#B51339]">ECOSYSTEM</span></h2>
                    <p className="text-gray-400 text-lg">Hover over a division to access the Neural Link. Real-time telemetry enabled.</p>
                  </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                  {/* CEMENT */}
                  <Link href="/marketplace?cat=cement" className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 hover:border-[#B51339] transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=2072" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75" alt="Cement" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-[#B51339] font-mono text-xs tracking-widest uppercase mb-2 block">Infrastructure</span>
                          <h3 className="text-3xl font-bold text-white mb-2">BUA Cement</h3>
                          <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">11M MTPA Capacity</p>
                      </div>
                  </Link>

                  {/* FOODS */}
                  <Link href="/marketplace?cat=foods" className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 hover:border-yellow-500 transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75" alt="Foods" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-yellow-500 font-mono text-xs tracking-widest uppercase mb-2 block">FMCG</span>
                          <h3 className="text-3xl font-bold text-white mb-2">BUA Foods</h3>
                          <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">Feeding the Continent</p>
                      </div>
                  </Link>

                  {/* 👇 FIXED LOGISTICS CARD (Brighter Image + Stronger Visibility) */}
                  <Link href="/orders" className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500 transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-90" alt="Logistics" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-blue-500 font-mono text-xs tracking-widest uppercase mb-2 block">Supply Chain</span>
                          <h3 className="text-3xl font-bold text-white mb-2">Logistics Core</h3>
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                             <p className="text-gray-300">1,240 Active Trips</p>
                          </div>
                      </div>
                  </Link>
              </div>
          </div>
      </section>

      {/* 3. AI SECTION (FIXED TEXT) */}
      <section className="py-32 bg-gradient-to-b from-[#020202] to-[#111] relative overflow-hidden">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-[#B51339] rounded-full filter blur-[200px] opacity-10 animate-pulse"></div>

          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
              <div>
                  <h2 className="text-5xl font-bold mb-8 leading-tight">Meet the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-[#B51339]">BUA Neural Assistant.</span></h2>
                  <p className="text-gray-400 text-xl mb-10 leading-relaxed font-light">
                      Supply chain questions answered instantly. A custom AI model trained on BUA's inventory data.
                  </p>
                  
                  {/* 👇 FIXED BUTTON TEXT (No more "Demo") */}
                  <Link href="/chat" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      Launch AI System <span className="text-[#B51339]">→</span>
                  </Link>
              </div>
              
              <div className="relative flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B51339] to-yellow-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                  <div className="relative glass-panel w-full max-w-md aspect-square rounded-[3rem] flex items-center justify-center border border-white/10">
                      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-1/2 h-1/2 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-slow-pan" alt="AI Icon" />
                  </div>
              </div>
          </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-black py-20 border-t border-white/5 text-sm font-mono text-gray-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <h3 className="text-2xl font-black text-white tracking-tighter mb-2">BUA<span className="text-[#B51339]">Group</span></h3>
                <p>Foods & Infrastructure Ltd.</p>
            </div>
            <div className="flex gap-10 font-bold text-gray-400">
                <Link href="/marketplace" className="hover:text-white transition">MARKETPLACE</Link>
                <Link href="/orders" className="hover:text-white transition">LOGISTICS</Link>
                <Link href="/vendor" className="hover:text-white transition">VENDOR</Link>
            </div>
            <p className="text-xs opacity-50">ENCRYPTED // SYSTEM V3.1</p>
        </div>
      </footer>
    </main>
  );
}