import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Clock,
  Trash2,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { apiRequest } from '../services/api.ts';
import { Order } from '../types.ts';

export const CustomerAccountPage: React.FC = () => {
  const { user, logout, switchDemoRole, isAdmin } = useAuth();
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Addresses mock state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Primary Residence',
      street: '740 Park Avenue, Apt 14B',
      city: 'New York',
      state: 'NY',
      zip: '10021',
      country: 'United States',
      isDefault: true,
    },
    {
      id: 2,
      title: 'Geneva Pied-à-Terre',
      street: 'Rue du Rhône 42',
      city: 'Geneva',
      state: 'GE',
      zip: '1204',
      country: 'Switzerland',
      isDefault: false,
    },
  ]);

  // Profile form
  const [profileName, setProfileName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
  const [profilePhone, setProfilePhone] = useState('+1 (555) 234-8900');

  useEffect(() => {
    apiRequest<Order[]>('/orders/my-orders').then((res) => {
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setLoadingOrders(false);
    });
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.grand_total, 0);

  const handleCancelOrder = async (orderNumber: string) => {
    const res = await apiRequest(`/orders/${orderNumber}/cancel`, { method: 'POST' });
    if (res.success) {
      showToast('Consignment cancellation processed.', 'info');
      setOrders(orders.map((o) => (o.order_number === orderNumber ? { ...o, status: 'cancelled' } : o)));
    } else {
      showToast(res.message || 'Could not cancel order.', 'error');
    }
  };

  const handleMoveToCart = async (product: any) => {
    await addToCart(product.id, null, 1);
    await toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Hero Greeting & Tier Badge */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 text-amber-300 font-serif-luxury text-2xl font-bold flex items-center justify-center shadow-md">
              {user?.first_name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-2xl font-bold text-neutral-900">
                  {user ? `${user.first_name} ${user.last_name}` : 'Maison Client Dossier'}
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Inner Circle Connoisseur
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {user?.email || 'collector@luxegroup.com'} • Member since 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Open Admin CMS</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-neutral-200 gap-6 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Vault Overview', icon: Sparkles },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
            { id: 'addresses', label: 'Bespoke Destinations', icon: MapPin },
            { id: 'profile', label: 'Security & Protocol', icon: UserIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border-b-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Total Acquired Value
                </span>
                <p className="font-serif-luxury text-3xl font-bold text-neutral-900 mt-2">
                  ${totalSpent.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Insured in Private Custody
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Consignments Handled
                </span>
                <p className="font-serif-luxury text-3xl font-bold text-neutral-900 mt-2">
                  {orders.length} Deliveries
                </p>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  100% White-Glove Handover Record
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Privilege Standing
                </span>
                <p className="font-serif-luxury text-3xl font-bold text-amber-800 mt-2">
                  Tier 1 Vault
                </p>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Private concierge priority response &lt; 5 mins
                </span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
                  Recent Consignment Dispatches
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
                >
                  View All Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">No orders on record.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            {ord.order_number}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {ord.items.length} artifacts • Placed on {new Date(ord.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs font-bold text-neutral-900">
                          ${ord.grand_total.toLocaleString()}
                        </span>
                        <Link
                          to={`/order-confirmed/${ord.order_number}`}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          View Docket
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Consignment History Archive
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-xs text-neutral-500">No consignment history on file.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-neutral-900">
                              {ord.order_number}
                            </span>
                            <span className="text-[10px] uppercase font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            Dispatched: {new Date(ord.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/order-confirmed/${ord.order_number}`}
                            className="bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition"
                          >
                            Live Tracking
                          </Link>
                          {(ord.status === 'pending' || ord.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelOrder(ord.order_number)}
                              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
                            >
                              Cancel Allocation
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-neutral-100">
                        {ord.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="w-12 h-12 object-cover rounded-md bg-white border border-neutral-200"
                              />
                              <div>
                                <h4 className="text-xs font-semibold text-neutral-900">
                                  {item.product_title}
                                </h4>
                                {item.variant_name && (
                                  <span className="text-[10px] text-neutral-500">
                                    {item.variant_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-neutral-900 block">
                                ${(item.unit_price * item.quantity).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-neutral-400">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-neutral-200 flex justify-between text-xs font-bold text-neutral-900">
                        <span>Total Custody Settlement</span>
                        <span className="font-mono text-sm">${ord.grand_total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Curated Private Wishlist ({wishlistItems.length})
              </h3>

              {wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-xs text-neutral-500 mb-4">Your private wishlist is empty.</p>
                  <Link
                    to="/shop"
                    className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <img
                          src={item.product.images[0]?.image_url}
                          alt={item.product.title}
                          className="w-full aspect-square object-cover rounded-lg bg-white mb-3"
                        />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                          {item.product.brand_name}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 mt-0.5">
                          {item.product.title}
                        </h4>
                        <p className="text-xs font-bold text-neutral-900 font-mono mt-1">
                          ${item.product.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(item.product)}
                          className="flex-1 bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(item.product)}
                          className="p-2 border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
                  Approved Consignment Addresses
                </h3>
                <button
                  onClick={() => showToast('Address addition modal enabled in live production profile.', 'info')}
                  className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Add Destination
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2 relative"
                  >
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                        Primary Vault
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-neutral-900">{addr.title}</h4>
                    <p className="text-xs text-neutral-600">{addr.street}</p>
                    <p className="text-xs text-neutral-600">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-xs text-neutral-600">{addr.country}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. PROFILE & PROTOCOL TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs max-w-2xl space-y-6">
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Client Credentials & Identity
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={user?.email || 'collector@luxegroup.com'}
                    disabled
                    className="w-full bg-neutral-100 border border-neutral-200 rounded-lg p-3 text-xs text-neutral-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Private Telephony</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast('Client credentials successfully updated in vault registry.', 'success')}
                    className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
