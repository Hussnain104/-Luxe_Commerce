import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { Product, InventoryTransaction } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(1);
  const [adjustmentReason, setAdjustmentReason] = useState('Manual Stock Audit');
  const [actionType, setActionType] = useState<'increase' | 'decrease'>('increase');
  const { showToast } = useToast();

  const fetchInventory = async () => {
    setLoading(true);
    const res = await apiRequest<{ products: Product[]; transactions: InventoryTransaction[] }>(
      '/admin/inventory'
    );
    if (res.success && res.data) {
      setProducts(res.data.products || []);
      setTransactions(res.data.transactions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const finalChange = actionType === 'increase' ? Math.abs(adjustmentQuantity) : -Math.abs(adjustmentQuantity);
    const res = await apiRequest('/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({
        productId: selectedProduct.id,
        quantityChange: finalChange,
        reason: adjustmentReason,
      }),
    });

    if (res.success) {
      showToast(`Stock for ${selectedProduct.title} adjusted by ${finalChange}.`, 'success');
      setSelectedProduct(null);
      fetchInventory();
    } else {
      showToast(res.message || 'Adjustment failed.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Vault Logistical Control
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
          Inventory Audit & Ledger Records
        </h1>
      </div>

      {/* Stock Level Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-serif-luxury text-base font-bold text-white">
            Current Physical Allocations
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            {products.length} registered SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Artifact</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Reserves</th>
                <th className="py-3 px-4">Alert Limit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {products.map((p) => {
                const isLow = p.stock_quantity <= p.low_stock_threshold;
                return (
                  <tr key={p.id} className="hover:bg-neutral-900/40 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.images[0]?.image_url}
                        alt=""
                        className="w-10 h-10 object-cover rounded bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                      <span className="font-semibold text-white truncate max-w-xs">{p.title}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">{p.sku}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {p.stock_quantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">{p.low_stock_threshold}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isLow
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isLow ? 'Critical Reserve' : 'Satisfactory'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Adjust Count
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-serif-luxury text-base font-bold text-white">
                Adjust Stock: {selectedProduct.title}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <p className="text-neutral-400">
                Current Vault Inventory: <strong className="text-white font-mono">{selectedProduct.stock_quantity}</strong>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('increase')}
                  className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionType === 'increase'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Receive Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('decrease')}
                  className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionType === 'decrease'
                      ? 'bg-rose-700 text-white'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Deplete / Write-off</span>
                </button>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Units to Alter</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Audit Justification</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Confirm Ledger Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Ledger Audit Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md p-5 space-y-4">
        <h3 className="font-serif-luxury text-base font-bold text-white">
          Immutable Inventory Transaction Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Product ID</th>
                <th className="py-2.5 px-4">Delta Units</th>
                <th className="py-2.5 px-4">Justification</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="py-2.5 px-4 font-mono text-neutral-500">#{t.id}</td>
                  <td className="py-2.5 px-4 font-mono text-white">Prod #{t.product_id}</td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    <span className={t.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-400">{t.reason}</td>
                  <td className="py-2.5 px-4 font-mono text-neutral-500">
                    {new Date(t.created_at).toLocaleString()}
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
