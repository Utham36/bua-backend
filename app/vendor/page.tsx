"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `https://bua-backend.onrender.com${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      try {
        const statsRes = await axios.get('https://bua-backend.onrender.com/api/orders/vendor-stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        const prodRes = await axios.get('https://bua-backend.onrender.com/api/products/my-products/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prodRes.data);

      } catch (error) {
        console.error("Error loading dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this item from inventory?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://bua-backend.onrender.com/api/products/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      alert("Item Removed from Inventory. 🗑️");
    } catch (error) {
      alert("Error deleting product.");
    }
  };

  // PROFESSIONAL CALCULATION LOGIC 🧮
  const totalTransactionValue = stats?.recent_transactions?.reduce((sum: number, t: any) => {
      if (t.status === 'DELIVERED') {
          return sum + Number(t.price);
      }
      return sum;
  }, 0) || 0;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="container mx-auto py-10 px-4 mt-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800 border-l-8 border-[#8B0000] pl-4 uppercase tracking-tight">
               Distributor Dashboard 🏭
            </h1>
            <div className="flex gap-3">
                {/* SETTINGS */}
                <Link href="/vendor/settings" className="bg-gray-800 text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-900 transition shadow-md flex items-center gap-2">
                    ⚙️ Settings
                </Link>

                {/* ADD PRODUCT - BUA RED */}
                <Link href="/sell" className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#600000] transition shadow-md border border-[#600000]">
                    + Add Inventory
                </Link>
                
                {/* MANAGE ORDERS - BUA GOLD */}
                <Link href="/vendor/orders" className="bg-yellow-500 text-[#8B0000] px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md border border-yellow-600">
                    Manage Logistics
                </Link>
            </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000] mx-auto mb-4"></div>
             <p className="text-[#8B0000] font-bold">Loading Logistics Data...</p>
          </div>
        ) : (
          <>
            {/* 1. STATS CARDS */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* REVENUE - RED ACCENT */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#8B0000]">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Revenue (Verified)</h3>
                        <p className="text-3xl font-black text-[#8B0000] mt-2">₦{stats.total_sales?.toLocaleString() || 0}</p>
                    </div>
                    {/* ORDERS - GOLD ACCENT */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Units Sold</h3>
                        <p className="text-3xl font-black text-gray-800 mt-2">{stats.total_orders || 0}</p>
                    </div>
                    {/* PENDING - GRAY ACCENT */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-500">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Pending Dispatch</h3>
                        <p className="text-3xl font-black text-gray-800 mt-2">{stats.pending_orders || 0}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                
                {/* 2. PRO AREA CHART - RED THEME 📈 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">Sales Analytics (Monthly)</h2>
                    <div className="h-64 w-full">
                        {stats && stats.chart_data && stats.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chart_data}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B0000" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#6b7280'}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₦${value}`} fontSize={12} tick={{fill: '#6b7280'}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#8B0000", border: "none", borderRadius: "8px", color: "#fff" }}
                                        formatter={(value) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#8B0000" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                Data will appear here after first sale.
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. TRANSACTION SHEET 🧾 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 uppercase text-sm tracking-wider">Recent Transactions</h2>
                        <span className="text-xs bg-[#8B0000] text-white px-2 py-1 rounded font-bold">Live Feed</span>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-100 border-b sticky top-0">
                                <tr>
                                    <th className="p-3 font-bold text-gray-600">ID</th>
                                    <th className="p-3 font-bold text-gray-600">Product</th>
                                    <th className="p-3 font-bold text-gray-600">Amt</th>
                                    <th className="p-3 font-bold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats && stats.recent_transactions?.map((t: any, index: number) => (
                                    <tr key={index} className="border-b hover:bg-red-50 transition">
                                        <td className="p-3 text-gray-500 text-xs">#{t.id}</td>
                                        <td className="p-3 font-medium text-gray-800 truncate max-w-[120px]">{t.product__name}</td>
                                        <td className={`p-3 font-bold ${t.status === 'DELIVERED' ? 'text-[#8B0000]' : 'text-gray-400'}`}>
                                            ₦{Number(t.price).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                                                t.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                                t.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                                                t.status === 'RETURNED' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats || !stats.recent_transactions || stats.recent_transactions.length === 0) && (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No transactions recorded.</td></tr>
                                )}
                            </tbody>
                            
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={2} className="p-3 font-bold text-gray-800 text-right uppercase text-xs">Total Realized:</td>
                                    <td className="p-3 font-extrabold text-[#8B0000]">₦{totalTransactionValue.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>
                </div>
            </div>

            {/* 4. INVENTORY TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">📦 Active Inventory ({products.length})</h2>
                </div>
                
                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Inventory is empty.</p>
                        <Link href="/sell" className="text-[#8B0000] font-bold hover:underline">Add First Item</Link>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4 font-bold text-gray-600">Product</th>
                                <th className="p-4 font-bold text-gray-600">Price</th>
                                <th className="p-4 font-bold text-gray-600 hidden md:table-cell">Category</th>
                                <th className="p-4 font-bold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => {
                                let imgPath = "";
                                if (p.images && p.images.length > 0) imgPath = p.images[0].image;
                                else if (p.image) imgPath = p.image;

                                return (
                                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {imgPath ? (
                                                    <img src={getImageUrl(imgPath)} className="w-full h-full object-contain" />
                                                ) : <span>📦</span>}
                                            </div>
                                            <Link href={`/product/${p.id}`} className="font-bold text-gray-800 hover:text-[#8B0000] line-clamp-1">
                                                {p.name}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-[#8B0000] font-bold whitespace-nowrap">₦{Number(p.price).toLocaleString()}</td>
                                        <td className="p-4 text-gray-500 text-sm hidden md:table-cell">
                                            <span className="bg-gray-200 px-2 py-1 rounded text-xs uppercase font-bold text-gray-700">
                                                {p.category_name || "Stock"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            {/* Edit - Gold */}
                                            <Link href={`/vendor/edit/${p.id}`} className="text-yellow-700 hover:text-yellow-800 font-semibold text-sm bg-yellow-100 px-4 py-1.5 rounded hover:bg-yellow-200 transition inline-block">
                                                Edit
                                            </Link>
                                            {/* Delete - Red */}
                                            <button onClick={() => handleDelete(p.id)} className="text-white hover:bg-[#600000] font-semibold text-sm bg-[#8B0000] px-4 py-1.5 rounded transition shadow-sm">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
          </>
        )}

      </div>
    </main>
  );
}