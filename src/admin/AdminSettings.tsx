import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, CreditCard, DollarSign } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState('LuxeCommerce Global Archive');
  const [contactEmail, setContactEmail] = useState('concierge@luxecommerce.com');
  const [currency, setCurrency] = useState('USD');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(250);
  const [taxRate, setTaxRate] = useState(8.5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [stripeLive, setStripeLive] = useState(true);
  const [paypalLive, setPaypalLive] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    apiRequest<Record<string, any>>('/admin/settings').then((res) => {
      if (res.success && res.data) {
        if (res.data.store_name) setStoreName(res.data.store_name);
        if (res.data.contact_email) setContactEmail(res.data.contact_email);
        if (res.data.currency) setCurrency(res.data.currency);
        if (res.data.free_shipping_threshold)
          setFreeShippingThreshold(Number(res.data.free_shipping_threshold));
        if (res.data.tax_rate) setTaxRate(Number(res.data.tax_rate));
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/settings', {
      method: 'POST',
      body: JSON.stringify({
        store_name: storeName,
        contact_email: contactEmail,
        currency,
        free_shipping_threshold: Number(freeShippingThreshold),
        tax_rate: Number(taxRate),
      }),
    });

    if (res.success) {
      showToast('Storefront configurations committed to database.', 'success');
    } else {
      showToast(res.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Platform Parameters
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
          Storefront & Gateway Configuration
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-white pb-2 border-b border-neutral-800">
            Maison General Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Maison Store Title</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Official Concierge Inbound Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
              >
                <option value="USD">USD ($ United States)</option>
                <option value="EUR">EUR (€ European Union)</option>
                <option value="CHF">CHF (₣ Switzerland)</option>
                <option value="GBP">GBP (£ United Kingdom)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Complimentary Courier Min ($)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Standard Sales Tax (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-white pb-2 border-b border-neutral-800">
            Payment Gateways & Financial Settlement
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white">Stripe PCI-DSS Vault Integration</h4>
                  <p className="text-[11px] text-neutral-400">
                    Accept Visa, Mastercard, and American Express with 3D Secure 2.0 authentication.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={stripeLive}
                onChange={(e) => setStripeLive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <div>
                  <h4 className="font-bold text-white">PayPal Express Checkout Protocol</h4>
                  <p className="text-[11px] text-neutral-400">
                    One-touch authentication with buyer protection and instant fraud screening.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={paypalLive}
                onChange={(e) => setPaypalLive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold uppercase tracking-wider text-xs shadow-lg transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Persist Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
