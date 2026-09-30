import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  Printer,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Order } from '../types.ts';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    apiRequest<Order>(`/orders/${orderNumber}`).then((res) => {
      if (res.success && res.data) {
        setOrder(res.data);
      }
      setLoading(false);
    });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold font-serif-luxury text-neutral-900">
          Order Dossier Not Found
        </h2>
        <Link to="/" className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-800 underline">
          Return to Maison
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'confirmed', label: 'Order Authorized', date: new Date(order.created_at).toLocaleDateString() },
    { key: 'processing', label: 'Vault Allocation & Inspection', date: 'In Progress' },
    { key: 'shipped', label: 'Armoured Transit Dispatch', date: 'Expected 24-48 Hrs' },
    { key: 'delivered', label: 'White-Glove Handover', date: 'Pending Courier' },
  ];

  const currentStepIdx =
    order.status === 'delivered'
      ? 3
      : order.status === 'shipped'
      ? 2
      : order.status === 'confirmed' || order.status === 'processing'
      ? 1
      : 0;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Success Badge */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-semibold">
            Consignment Allocation Confirmed
          </span>

          <h1 className="font-serif-luxury text-3xl font-bold text-neutral-900">
            Thank You for Your Patronage
          </h1>

          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
            Your acquisition has been logged into the Maison Archive under consignment docket{' '}
            <strong className="font-mono text-neutral-900">{order.order_number}</strong>.
            A formal certificate of ownership has been dispatched to {order.customer_email}.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Invoice</span>
            </button>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
            >
              <span>View in Client Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Delivery Progress Tracker */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
            <div>
              <h3 className="text-sm font-bold font-serif-luxury text-neutral-900">
                Consignment Status: <span className="uppercase text-amber-800">{order.status}</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Armored Courier Tracking:{' '}
                <span className="font-mono font-bold text-neutral-800">
                  {order.tracking_number || 'TRK-VAULT-992014'}
                </span>
              </p>
            </div>
            <span className="text-xs font-mono bg-neutral-100 px-3 py-1 rounded-md text-neutral-700">
              Courier: {order.shipping_carrier || 'LuxeVault Global Express'}
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {steps.map((st, i) => (
              <div key={st.key} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center w-full mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i <= currentStepIdx
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`hidden sm:block flex-1 h-0.5 ml-2 ${
                        i < currentStepIdx ? 'bg-neutral-900' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{st.label}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{st.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Docket & Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Purchased Items */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-serif-luxury text-neutral-900 pb-2 border-b border-neutral-100">
              Allocated Artifacts
            </h3>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <img
                    src={item.product_image}
                    alt={item.product_title}
                    className="w-14 h-14 object-cover rounded-lg bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      {item.product_title}
                    </h4>
                    {item.variant_name && (
                      <p className="text-[11px] text-neutral-500">{item.variant_name}</p>
                    )}
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-neutral-500">Qty: {item.quantity}</span>
                      <span className="font-bold text-neutral-900 font-mono">
                        ${(item.unit_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-neutral-900">${order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Allowance</span>
                  <span className="font-mono">-${order.discount_total.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Armored Courier</span>
                <span className="font-mono text-neutral-900">${order.shipping_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total Authorized</span>
                <span className="font-serif-luxury font-bold text-base">
                  ${order.grand_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Consignment Address and Provenance */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-serif-luxury text-neutral-900 pb-2 border-b border-neutral-100">
              Consignment Credentials
            </h3>
            <div className="text-xs text-neutral-600 space-y-1">
              <span className="font-bold text-neutral-900 block">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </span>
              <p>{order.shipping_address.street_address}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
              <p className="pt-2 text-neutral-500">Authorized Phone: {order.customer_phone}</p>
            </div>

            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Payment Verification
              </h4>
              <p className="text-xs text-neutral-500">
                Method: <span className="uppercase font-semibold text-neutral-800">{order.payment_method}</span>
              </p>
              <p className="text-xs text-neutral-500">
                Status: <span className="font-semibold text-emerald-700">Settlement Verified</span>
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>NFC Authenticity Tag & Handover Pin dispatched to recipient telephone.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
