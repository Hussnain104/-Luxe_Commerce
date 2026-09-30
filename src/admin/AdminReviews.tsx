import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Trash2, Star } from 'lucide-react';
import { Review } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    const res = await apiRequest<Review[]>('/admin/reviews');
    if (res.success && res.data) setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const res = await apiRequest(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      showToast(`Review #${id} ${status}.`, 'success');
      fetchReviews();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Reputation & Testimonials
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
          Client Review Moderation Desk ({reviews.length})
        </h1>
      </div>

      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Patron & Product</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-900/40">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{r.user_name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Target SKU #{r.product_id}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{r.rating}/5</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-semibold text-white">{r.title}</p>
                    <p className="text-neutral-400 text-[11px] line-clamp-2 mt-0.5">{r.comment}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                        r.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="p-1.5 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 rounded transition cursor-pointer"
                        title="Approve review"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        className="p-1.5 bg-rose-900/50 hover:bg-rose-800 text-rose-200 rounded transition cursor-pointer"
                        title="Reject / Hide review"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
