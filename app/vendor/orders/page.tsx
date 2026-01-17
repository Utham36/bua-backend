"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null); // For the Modal
  const router = useRouter();

  // 1. FETCH ORDERS (Vendor Specific)
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      // 👇 IMPORTANT: We fetch "vendor-orders", not "all"
      const response = await axios.get('https://bua-backend.onrender.com/api/orders/vendor-orders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching logistics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. UPDATE STATUS FUNCTION
  const updateStatus = async (orderId: number, newStatus: string) => {
    if (!confirm(`Confirm status update to: ${newStatus}?`)) return;
    
    try {
      const token = localStorage.getItem('access_token');
      // We send a PATCH request to update the status
      await axios.patch(`https://bua-backend.onrender.com/api/orders/update/${orderId}/`, 
        { status: newStatus }, // sending the new status
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Logistics Status Updated: ${newStatus} ✅`);
      setSelectedOrder(null); // Close modal
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Status Update Failed. Check authorization.");
    }
  };

  // Helper for Colors
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-bold border border-yellow-300 uppercase tracking-wide">⏳ Awaiting Action</span>;
      case 'SHIPPED': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold border border-blue-300 uppercase tracking-wide">🚚 In Transit</span>;
      case 'DELIVERED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold border border-green-300 uppercase tracking-wide">✅ Delivered</span>;
      case 'RETURNED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-bold border border-red-300 uppercase tracking-wide">❌ Returned</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold border border-gray-300 uppercase tracking-wide">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans relative">
      <Navbar />
      <div className="container mx-auto py-10 px-4 mt-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-l-8 border-[#8B0000] pl-4 uppercase tracking-tight">
          Logistics Control Center 📋
        </h1>

        {loading ? (
             <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000] mx-auto mb-4"></div>
                <p className="text-[#8B0000] font-bold">Loading Manifests...</p>
             </div>
        ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                <span className="text-6xl block mb-4 grayscale opacity-30">🚛</span>
                <h3 className="text-xl font-bold text-gray-700">No Active Orders</h3>
                <p className="text-gray-500">Logistics queue is currently empty.</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4 border-b">Waybill ID</th>
                    <th className="p-4 border-b">Timestamp</th>
                    <th className="p-4 border-b">Client</th>
                    <th className="p-4 border-b">Manifest</th>
                    <th className="p-4 border-b">Value</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Control</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-red-50/20 border-b border-gray-100 transition">
                      <td className="p-4 font-mono font-bold text-gray-500">#{order.id}</td>
                      <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold uppercase">{order.user}</td>
                      <td className="p-4">
                        {order.items.map((item: any, i:number) => (
                          <div key={i} className="truncate max-w-[200px]">• {item.product_name || item.product} (x{item.quantity})</div>
                        ))}
                      </td>
                      <td className="p-4 font-black text-[#8B0000]">₦{Number(order.total_price).toLocaleString()}</td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#8B0000] shadow-md transition uppercase tracking-wide"
                        >
                          Manage ⚙️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
        )}
      </div>

      {/* 👇 THE MODAL (Popup) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-0 rounded-xl shadow-2xl max-w-lg w-full transform transition-all scale-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#8B0000] p-6 flex justify-between items-center text-white">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider">Waybill #{selectedOrder.id}</h2>
                    <p className="text-red-200 text-xs">Logistics Management Console</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-white/70 hover:text-white text-2xl transition">✖</button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <p className="mb-2"><strong className="text-gray-900 uppercase text-xs">Client:</strong> {selectedOrder.user}</p>
                <p className="mb-2"><strong className="text-gray-900 uppercase text-xs">Dispatch Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <strong className="text-gray-900 uppercase text-xs block mb-2">Manifest Items:</strong>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    {selectedOrder.items.map((item: any, i: number) => (
                        <li key={i}>{item.quantity}x <span className="font-semibold text-gray-800">{item.product_name}</span></li>
                    ))}
                    </ul>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-bold mb-4 text-gray-400 uppercase text-[10px] tracking-[0.2em]">Update Logistics Status</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => updateStatus(selectedOrder.id, 'SHIPPED')}
                        className="bg-blue-50 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition border border-blue-200 text-sm"
                    >
                        Mark In Transit 🚚
                    </button>
                    <button 
                        onClick={() => updateStatus(selectedOrder.id, 'DELIVERED')}
                        className="bg-green-50 text-green-700 py-3 rounded-lg font-bold hover:bg-green-600 hover:text-white transition border border-green-200 text-sm"
                    >
                        Mark Delivered ✅
                    </button>
                    <button 
                        onClick={() => updateStatus(selectedOrder.id, 'RETURNED')}
                        className="bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-600 hover:text-white transition border border-red-200 col-span-2 text-sm"
                    >
                        Mark Returned / Failed ❌
                    </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}