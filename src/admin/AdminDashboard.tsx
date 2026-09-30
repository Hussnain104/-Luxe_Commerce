import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Package,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { AnalyticsSummary, Order, Product } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<AnalyticsSummary>('/admin/analytics'),
      apiRequest<Order[]>('/admin/orders'),
      apiRequest<{ lowStockProducts: Product[] }>('/admin/inventory'),
    ]).then(([analyticsRes, ordersRes, invRes]) => {
      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (ordersRes.success && ordersRes.data) setRecentOrders(ordersRes.data.slice(0, 5));
      if (invRes.success && invRes.data) setLowStockProducts(invRes.data.lowStockProducts || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Gross Vault Revenue',
      value: `$${(analytics?.totalRevenue || 489200).toLocaleString()}`,
      change: '+18.4% vs last month',
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Consignments Placed',
      value: (analytics?.totalOrders || 142).toString(),
      change: '+12 new today',
      icon: ShoppingBag,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      title: 'VIP Client Directory',
      value: (analytics?.totalCustomers || 88).toString(),
      change: '+9.2% membership',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Vault Scarcity Alerts',
      value: (analytics?.lowStockCount || lowStockProducts.length).toString(),
      change: 'Below threshold',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
    },
  ];

  const chartData = [42, 65, 80, 50, 95, 110, 85, 140, 120, 160, 135, 180, 145, 190, 220, 175, 210, 260, 240, 290, 310, 280, 340, 310, 360, 420];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            Executive Command Suite
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-white mt-1">
            Maison Operations & Consignment Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/admin/products"
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg inline-block"
            >
              + Add Masterpiece
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Cards Grid with Staggered Reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, borderColor: 'rgba(217, 119, 6, 0.4)' }}
              className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-3 relative overflow-hidden transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
                  {kpi.title}
                </span>
                <div className={`p-2.5 rounded-xl border border-neutral-800 ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-mono text-3xl font-bold text-white">
                {kpi.value}
              </p>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{kpi.change}</span>
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Sales Chart Visualization with animated bars */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-850 gap-2">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-white">
              Revenue Cadence (Past 30 Days)
            </h3>
            <p className="text-xs text-neutral-400">Consolidated high horology and artisanal acquisitions</p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-neutral-900 px-3.5 py-1.5 rounded-xl border border-neutral-800 font-bold self-start sm:self-auto">
            Avg Ticket: $3,445.00
          </span>
        </div>

        {/* Visual Animated Bar Graphic */}
        <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2">
          {chartData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(val / 420) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-linear-to-t from-amber-700/60 to-amber-500 rounded-t-md hover:to-amber-300 transition-all duration-300 cursor-pointer shadow-xs"
              />
              <span className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-neutral-800 text-[10px] text-amber-300 px-2 py-1 rounded-md font-mono transition shadow-lg z-20 pointer-events-none">
                ${val * 100}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] font-mono text-neutral-500 pt-3 border-t border-neutral-850">
          <span>Day 1 (Fiscal Open)</span>
          <span>Day 15 (Mid Cycle)</span>
          <span className="text-amber-400 font-bold">Today (Peak Allocation)</span>
        </div>
      </motion.div>

      {/* Bottom Grid: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-7 bg-neutral-950 p-6 sm:p-7 rounded-3xl border border-neutral-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Recent Consignment Orders
            </h3>
            <Link to="/admin/orders" className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold">
              View All Orders →
            </Link>
          </div>

          <div className="divide-y divide-neutral-850">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-neutral-900/40 px-2 rounded-xl transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{ord.order_number}</span>
                    <span className="text-[10px] uppercase font-bold bg-neutral-900 text-amber-300 border border-neutral-800 px-2.5 py-0.5 rounded-full font-mono">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {ord.customer_name} • {ord.items.length} items
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-white block">
                    ${ord.grand_total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alerts (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-5 bg-neutral-950 p-6 sm:p-7 rounded-3xl border border-neutral-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <h3 className="font-serif-luxury text-base font-bold text-white">
                Scarcity Warnings
              </h3>
            </div>
            <Link to="/admin/inventory" className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold">
              Adjust Stock →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">
              All vault allocations meet baseline reserves.
            </p>
          ) : (
            <div className="divide-y divide-neutral-850">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-900/40 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images[0]?.image_url}
                      alt={p.title}
                      className="w-11 h-11 object-cover rounded-xl bg-neutral-900 shrink-0 border border-neutral-800"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{p.title}</h4>
                      <span className="text-[10px] font-mono text-neutral-400">SKU: {p.sku}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono font-bold shrink-0">
                    Only {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
