"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Props {
  reviews: Review[];
  productId: number;
}

export default function ReviewsSection({ reviews, productId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is logged in (client-side only)
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('access_token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
        alert("Please login to leave a review! 🔒");
        router.push('/login');
        return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('https://bua-backend.onrender.com/api/reviews/create/', 
        {
          product_id: productId,
          rating: rating,
          comment: comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Review Posted Successfully! 🎉");
      window.location.reload(); // Refresh page to see the new review

    } catch (error) {
      console.error(error);
      alert("Failed to post review. You might have already reviewed this item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        Client Reviews <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">{reviews.length}</span>
      </h3>

      {/* 1. REVIEW LIST */}
      <div className="space-y-6 mb-10">
        {reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
            </div>
        ) : (
            reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#8B0000] text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                {review.username.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 capitalize text-sm">{review.username}</p>
                                <div className="flex text-yellow-400 text-xs">
                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm pl-10">{review.comment}</p>
                </div>
            ))
        )}
      </div>

      {/* 2. ADD REVIEW FORM */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Write a Review ✍️</h4>
        
        {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Your Experience</label>
                    <textarea 
                        rows={3}
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what you liked..."
                        className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-[#8B0000] outline-none text-sm"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-[#8B0000] text-white px-6 py-3 rounded font-bold hover:bg-[#600000] transition disabled:opacity-50 text-sm uppercase tracking-wider w-full sm:w-auto"
                >
                    {submitting ? "Posting..." : "Submit Review"}
                </button>
            </form>
        ) : (
            <div className="text-center py-6">
                <p className="text-gray-500 mb-4 text-sm">Please login to write a review.</p>
                <button 
                    onClick={() => router.push('/login')}
                    className="text-[#8B0000] font-bold border-2 border-[#8B0000] px-6 py-2 rounded hover:bg-[#8B0000] hover:text-white transition uppercase text-xs tracking-widest"
                >
                    Login Now
                </button>
            </div>
        )}
      </div>
    </div>
  );
}