"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User Data State
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    bio: '',
    is_staff: false,
    date_joined: '',
    id: 0
  });

  // 1. Fetch Profile & CLEAN DATA 🧹
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      
      // Safety Check 1: No token? Go to login.
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await axios.get('https://bua-backend.onrender.com/api/users/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Populate data (converting nulls to strings to prevent React errors)
        setUserData({
            ...res.data,
            phone: res.data.phone || '',
            address: res.data.address || '',
            bio: res.data.bio || '',
            first_name: res.data.first_name || '',
            last_name: res.data.last_name || '',
        });

      } catch (error: any) {
        console.error("Failed to load profile", error);
        
        // Safety Check 2: If session expired (401), clear storage and redirect
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            router.push('/login');
        } else {
            // Other errors
            router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // 2. Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // 3. Save Changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
        const token = localStorage.getItem('access_token');
        await axios.patch('https://bua-backend.onrender.com/api/users/profile/', userData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("Personnel Record Updated Successfully! 📇");
        setIsEditing(false); 
    } catch (error) {
        alert("Failed to update profile.");
    } finally {
        setIsSaving(false);
    }
  };

  // 4. Delete Account
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
        "WARNING: TERMINATION PROTOCOL ⚠️\n\nThis will permanently delete your authorized account, inventory, and transaction history. Confirm?"
    );

    if (confirmDelete) {
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete('https://bua-backend.onrender.com/api/users/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.clear();
            alert("Account Terminated. Access Revoked. 🚫");
            window.location.href = '/signup';
        } catch (error) {
            alert("Failed to delete account.");
        }
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000]"></div>
      </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4 mt-16 flex justify-center">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl w-full border border-gray-200">
          
          {/* Header Card Style - BUA Red Theme */}
          <div className="bg-[#8B0000] p-6 text-white text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10"></div>
             
             <div className="relative z-10">
                <div className="w-24 h-24 bg-white text-[#8B0000] rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-4 border-4 border-yellow-500 shadow-lg">
                    {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-wider">{userData.username}</h1>
                <p className="text-white/70 text-sm font-mono mt-1">ID: #{userData.id} • {new Date(userData.date_joined).toLocaleDateString()}</p>
                
                <div className="mt-4">
                    {userData.is_staff ? (
                        <span className="bg-yellow-500 text-[#8B0000] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                            Distributor Access
                        </span>
                    ) : (
                        <span className="bg-white/20 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                            Authorized Personnel
                        </span>
                    )}
                </div>
             </div>
          </div>

          {/* EDIT FORM */}
          <div className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name</label>
                    <input 
                        type="text" name="first_name" 
                        value={userData.first_name} onChange={handleChange} disabled={!isEditing}
                        className={`w-full p-3 border rounded-lg transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name</label>
                    <input 
                        type="text" name="last_name" 
                        value={userData.last_name} onChange={handleChange} disabled={!isEditing}
                        className={`w-full p-3 border rounded-lg transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Corporate Email</label>
                <input 
                    type="email" name="email" 
                    value={userData.email} onChange={handleChange} disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Number</label>
                <input 
                    type="text" name="phone" placeholder="+234..."
                    value={userData.phone} onChange={handleChange} disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Office / Depot Address</label>
                <textarea 
                    name="address" placeholder="Enter official address..."
                    value={userData.address} onChange={handleChange} disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg h-24 transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Profile / Bio</label>
                <textarea 
                    name="bio" placeholder="Company description or role..."
                    value={userData.bio} onChange={handleChange} disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg transition outline-none focus:ring-2 focus:ring-[#8B0000] ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'}`}
                />
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="px-8 pb-8 pt-4 flex gap-4 border-t border-gray-100 bg-gray-50">
             {isEditing ? (
                 <>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#8B0000] text-white py-3 rounded-lg font-bold hover:bg-[#600000] transition shadow-lg uppercase tracking-wider text-sm">
                        {isSaving ? "Updating Record..." : "Save Changes 💾"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-white text-gray-600 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-100 transition uppercase tracking-wider text-sm">
                        Cancel ❌
                    </button>
                 </>
             ) : (
                <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition shadow-md uppercase tracking-wider text-sm">
                        Edit Record ✏️
                    </button>
                    <button onClick={handleDelete} className="flex-1 bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 transition border border-red-200 uppercase tracking-wider text-sm">
                        Delete Profile 🗑️
                    </button>
                </>
             )}
          </div>

        </div>
      </div>
    </main>
  );
}