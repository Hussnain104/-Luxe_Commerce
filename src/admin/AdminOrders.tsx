import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  X,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<any>('');
  const [newTracking, setNewTracking] = useState('');
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiRequest<Order[]>('/admin/orders');
    if (res.success && res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setNewTracking(ord.tracking_number || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const res = await apiRequest(`/admin/orders/${selectedOrder.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: newStatus,
        trackingNumber: newTracking,
      }),
    });

    if (res.success) {
      showToast(`Order ${selectedOrder.order_number} transitioned to ${newStatus}.`, 'success');
      setSelectedOrder(null);
      fetchOrders();
    } else {
      showToast(res.message || 'Status update failed.', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Fulfillment Operations
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
          Consignment Fulfillment Registry ({orders.length})
        </h1>
      </div>

      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by consignment docket, client name, or email..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-neutral-300 uppercase font-mono"
        >
          <option value="all">All Consignment Stages</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing (Vault)</option>
          <option value="shipped">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Docket #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Artifacts</th>
                <th className="py-3.5 px-4">Settlement</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-900/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {o.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{o.customer_name}</span>
                    <span className="text-[10px] text-neutral-500">{o.customer_email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 font-mono">
                    {o.items.length} piece{o.items.length > 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${o.grand_total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                        o.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : o.status === 'shipped'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : o.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500 font-mono">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openOrderDetails(o)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 transition cursor-pointer"
                      title="Inspect & transition docket"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white">
                  Consignment Docket: {selectedOrder.order_number}
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  Recorded on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transition Controls */}
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Transition Fulfillment Protocol
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Status Progression</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white uppercase font-mono"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing (Inspection)</option>
                    <option value="shipped">In Transit (Armored Dispatch)</option>
                    <option value="delivered">Delivered (Handover Signed)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Courier Tracking Code</label>
                  <input
                    type="text"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    placeholder="TRK-VAULT-..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  Commit Status Update
                </button>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Custody Consignment Contents
              </h4>
              <div className="divide-y divide-neutral-850 border border-neutral-850 rounded-xl p-3 bg-neutral-900/40">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product_image}
                        alt=""
                        className="w-10 h-10 object-cover rounded bg-neutral-900 border border-neutral-800"
                      />
                      <div>
                        <span className="font-semibold text-white block">{item.product_title}</span>
                        {item.variant_name && (
                          <span className="text-[10px] text-neutral-400">{item.variant_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">
                        ${(item.unit_price * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-850 space-y-1">
                <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px] block font-bold">
                  Client Coordinates
                </span>
                <p className="text-white font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-neutral-400">{selectedOrder.customer_email}</p>
                <p className="text-neutral-400">{selectedOrder.customer_phone}</p>
              </div>

              <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-850 space-y-1">
                <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px] block font-bold">
                  Destination
                </span>
                <p className="text-neutral-300">{selectedOrder.shipping_address?.street_address}</p>
                <p className="text-neutral-300">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}{' '}
                  {selectedOrder.shipping_address?.postal_code}
                </p>
                <p className="text-neutral-300">{selectedOrder.shipping_address?.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
