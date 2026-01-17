"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import axios from 'axios';

// 👇 1. THIS IS YOUR MAIN LOGIC COMPONENT (Renamed)
function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesRef = useRef<any[]>([]); 

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // A. LOAD CONVERSATIONS & USER
  useEffect(() => {
    const fetchConversations = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('access_token');
      if (!token) return; 

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bua-backend.onrender.com';
        const userRes = await axios.get(`${apiUrl}/api/users/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);

        const res = await axios.get(`${apiUrl}/api/chat/conversations/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [router]);

  // B. LOAD MESSAGES
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async (isPolling = false) => {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bua-backend.onrender.com';
      try {
        const res = await axios.get(`${apiUrl}/api/chat/conversations/${activeChatId}/messages/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const newMessages = res.data;
        const currentLastId = messagesRef.current.length > 0 ? messagesRef.current[messagesRef.current.length - 1].id : 0;
        const newLastId = newMessages.length > 0 ? newMessages[newMessages.length - 1].id : 0;

        if (!isPolling || newLastId !== currentLastId) {
            setMessages(newMessages);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error("Could not load messages");
      }
    };

    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);

  }, [activeChatId]);

  // C. SEND MESSAGE
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    try {
        const token = localStorage.getItem('access_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bua-backend.onrender.com';
        await axios.post(`${apiUrl}/api/chat/send/`, {
            conversation_id: activeChatId,
            body: newMessage
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const optimisticMsg = {
            id: Date.now(),
            body: newMessage,
            sender: currentUser?.id,
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    } catch (err) {
        alert("Failed to send message");
    }
  };

  // D. START AI CHAT
  const startAIChat = async () => {
    try {
        const token = localStorage.getItem('access_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bua-backend.onrender.com';
        const res = await axios.post(`${apiUrl}/api/chat/start-ai-chat/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        router.push(`/chat?id=${res.data.conversation_id}`);
    } catch (err) {
        alert("Could not start AI Chat");
    }
  };

  const getPartnerName = (participants: any[]) => {
    if (!currentUser) return "Loading...";
    const partner = participants.find((p: any) => p.id !== currentUser.id);
    if (!partner) return "Halaal AI"; 
    return partner.username;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden container mx-auto my-4 bg-white rounded-xl shadow-xl border border-gray-200 mt-20">
        
        {/* LEFT SIDEBAR */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <span className="text-[#8B0000]">💬</span> Comm Link
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">Logistics Channels</p>
                </div>
                <button 
                    onClick={startAIChat}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-full shadow transition flex items-center gap-1 font-bold"
                >
                    <span>🤖</span> AI Assistant
                </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
                {loading ? <p className="p-4 text-center text-gray-400">Loading channels...</p> : (
                    conversations.map((conv) => {
                        const partnerName = getPartnerName(conv.participants);
                        const isAI = partnerName === "Halaal_Support" || partnerName === "Halaal AI";
                        const isActive = Number(activeChatId) === conv.id;

                        return (
                            <div 
                                key={conv.id}
                                onClick={() => router.push(`/chat?id=${conv.id}`)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-red-50 transition flex items-center gap-3 ${isActive ? 'bg-red-50 border-l-4 border-l-[#8B0000]' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow ${isAI ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                                    {isAI ? '🤖' : partnerName[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-1 text-sm">
                                        {partnerName} 
                                        {isAI && <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-300">BOT</span>}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate w-40">
                                        {conv.last_message ? conv.last_message.body : "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* RIGHT SIDE: CHAT AREA */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
            {activeChatId ? (
                <>
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                        <div className="flex items-center gap-3">
                             <button onClick={() => router.push('/chat')} className="md:hidden text-gray-500 font-bold text-xl">←</button>
                             <div>
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    Secure Connection
                                </h3>
                                <p className="text-xs text-green-600 font-bold flex items-center gap-1">● Encrypted Channel</p>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
                        {messages.map((msg) => {
                            const isMe = msg.sender === currentUser?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-5 py-3 rounded-xl shadow-sm text-sm leading-relaxed ${
                                        isMe 
                                        ? 'bg-[#8B0000] text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                    }`}>
                                            <p className="whitespace-pre-wrap">{msg.body}</p>
                                            <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-red-100' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type secure message..." 
                            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition bg-gray-50"
                        />
                        <button type="submit" className="bg-[#8B0000] hover:bg-[#600000] text-white px-6 rounded-lg transition shadow-lg font-bold">
                            ➤
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <span className="text-6xl mb-4 opacity-20">📡</span>
                    <p className="text-xl font-bold text-gray-600">Select a Logistics Channel</p>
                    <p className="text-sm">Secure communications encrypted.</p>
                    <button onClick={startAIChat} className="mt-6 bg-yellow-500 text-white px-6 py-2 rounded-full shadow hover:bg-yellow-600 transition font-bold flex items-center gap-2">
                        <span>🤖</span> Start AI Support
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

// 👇 2. THIS IS THE WRAPPER THAT FIXES THE ERROR
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-gray-500">Initializing Secure Link...</div>}>
      <ChatContent />
    </Suspense>
  );
}