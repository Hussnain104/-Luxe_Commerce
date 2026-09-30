import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { Coupon } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(500);
  const [usageLimit, setUsageLimit] = useState(100);

  const { showToast } = useToast();

  const fetchCoupons = async () => {
    const res = await apiRequest<Coupon[]>('/admin/coupons');
    if (res.success && res.data) setCoupons(res.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_spend: Number(minSpend),
        usage_limit: Number(usageLimit),
        is_active: true,
      }),
    });
    if (res.success) {
      showToast(`Privilege token ${code.toUpperCase()} minted.`, 'success');
      setModalOpen(false);
      setCode('');
      fetchCoupons();
    } else {
      showToast(res.message || 'Failed to create coupon.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
            Privilege Allocation
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Privilege Vouchers & Promotion Tokens ({coupons.length})
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          + Mint Privilege Token
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3 px-4">Privilege Code</th>
              <th className="py-3 px-4">Benefit</th>
              <th className="py-3 px-4">Threshold</th>
              <th className="py-3 px-4">Redemptions</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-850 text-neutral-300">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-900/40">
                <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">
                  {c.code}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {c.discount_type === 'percentage'
                    ? `${c.discount_value}% Off`
                    : `$${c.discount_value} Direct Credit`}
                </td>
                <td className="py-3 px-4 font-mono text-neutral-400">
                  Min ${c.min_spend.toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono text-neutral-400">
                  {c.usage_count} / {c.usage_limit || '∞'}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-serif-luxury text-base font-bold text-white">Mint Privilege Token</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Promotion Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. VIPSUMMER15"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Benefit Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Benefit Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Minimum Spend ($)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Usage Cap</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
