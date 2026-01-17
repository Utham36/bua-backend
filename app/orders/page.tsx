"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      try {
        const res = await axios.get('https://bua-backend.onrender.com/api/orders/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching shipments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  // 👇 NEW: Secure PDF Download Function
  const handlePrintWaybill = async (orderId: number) => {
    try {
        const token = localStorage.getItem('access_token');
        // We request the file as a 'blob' (Binary Large Object)
        const response = await axios.get(`https://bua-backend.onrender.com/api/orders/print-waybill/${orderId}/`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob', 
        });

        // Create a temporary URL for the downloaded blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Waybill_BUA_${orderId}.pdf`); // Set the filename
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        if (link.parentNode) link.parentNode.removeChild(link);
    } catch (error) {
        console.error("Download failed:", error);
        alert("Could not download Waybill. Please try again.");
    }
  };

  // INDUSTRIAL STATUS BADGES 🏷️
  const getStatusBadge = (status: string) => {
    const s = status ? status.toUpperCase() : "PENDING";
    
    switch (s) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-bold border border-yellow-300 uppercase tracking-wide">⏳ Awaiting Dispatch</span>;
      case 'SHIPPED': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold border border-blue-300 uppercase tracking-wide">🚚 In Transit</span>;
      case 'DELIVERED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold border border-green-300 uppercase tracking-wide">✅ Delivered</span>;
      case 'RETURNED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-bold border border-red-300 uppercase tracking-wide">❌ Returned to Depot</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold border border-gray-300 uppercase tracking-wide">{s}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-10 mt-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-l-8 border-[#8B0000] pl-4 uppercase tracking-tight">
            Logistics Tracker 🗺️
        </h1>

        {loading ? (
             <div className="text-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000] mx-auto mb-4"></div>
                <p className="text-[#8B0000] font-bold">Retrieving Manifests...</p>
             </div>
        ) : orders.length === 0 ? (
            <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-200 border-dashed text-center">
                <div className="text-6xl mb-6 grayscale opacity-30">🚛</div>
                <p className="text-gray-500 mb-6 text-lg">No active shipments found on your account.</p>
                <Link href="/" className="bg-[#8B0000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#600000] transition shadow-md">
                    Initiate New Order
                </Link>
            </div>
        ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 group">
                  
                  {/* Waybill Header */}
                  <div className="bg-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
                    <div>
                        <span className="font-black text-gray-800 text-sm uppercase tracking-wider block">Waybill #{order.id}</span>
                        <span className="text-gray-500 text-xs font-bold">{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-right mt-2 md:mt-0">
                         <span className="block text-xs text-gray-500 font-bold uppercase">Total Value</span>
                         <span className="text-xl font-black text-[#8B0000]">₦{Number(order.total_price).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Shipment Content */}
                  <div className="p-6">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition px-2 -mx-2 rounded">
                        <div className="flex items-center flex-1 w-full md:w-auto">
                            <span className="bg-gray-200 text-gray-700 font-bold px-3 py-1 rounded mr-4 text-xs whitespace-nowrap border border-gray-300">
                                {item.quantity} UNITS
                            </span>
                            
                            <div className="flex flex-col md:flex-row md:items-center w-full">
                                {/* Product Name */}
                                <Link href={`/product/${item.product}`} className="font-bold text-gray-800 hover:text-[#8B0000] transition text-lg mr-4">
                                    {item.product_name || "Industrial Item"}
                                </Link>
                                
                                {/* Status Badge */}
                                <div className="mt-2 md:mt-0">
                                    {getStatusBadge(item.status)} 
                                </div>
                            </div>
                        </div>
                        <div className="text-gray-500 font-mono mt-2 md:mt-0 md:pl-12 font-bold self-end md:self-center">
                            ₦{Number(item.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-gray-500 gap-2">
                      <div className="flex items-start gap-2 max-w-2xl">
                          <span className="text-lg">📍</span> 
                          <div>
                              <span className="font-bold uppercase text-gray-700">Destination:</span> <br/>
                              {order.address || "Standard Depot Delivery"}
                          </div>
                      </div>
                      
                      {/* 👇 UPDATED: SECURE BUTTON */}
                      <button 
                        onClick={() => handlePrintWaybill(order.id)}
                        className="text-[#8B0000] font-bold hover:underline flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded transition"
                      >
                          📄 Print Waybill
                      </button>
                  </div>

                </div>
              ))}
            </div>
        )}
      </div>
    </main>
  );
}