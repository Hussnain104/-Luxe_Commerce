import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { apiRequest } from '../services/api.ts';
import { Order } from '../types.ts';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Multi-step index: 1: Information, 2: Courier, 3: Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = useState(user?.email || 'collector@luxegroup.com');
  const [firstName, setFirstName] = useState(user?.first_name || 'Alexander');
  const [lastName, setLastName] = useState(user?.last_name || 'Vanderbilt');
  const [phone, setPhone] = useState('+1 (555) 234-8900');

  // Address
  const [street, setStreet] = useState('740 Park Avenue, Apt 14B');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [postalCode, setPostalCode] = useState('10021');
  const [country, setCountry] = useState('United States');

  // Delivery Courier Choice
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'vault'>('standard');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'wire'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [orderNotes, setOrderNotes] = useState('Please ring private concierge desk upon arrival.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4"
        >
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </motion.div>
        <h2 className="text-2xl font-bold font-serif-luxury text-neutral-900">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6 max-w-sm">
          Select horological timepieces or bespoke leathercraft before proceeding to private checkout.
        </p>
        <Link
          to="/shop"
          className="bg-neutral-950 hover:bg-black text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition"
        >
          Discover Collections
        </Link>
      </div>
    );
  }

  // Calculate courier fees
  const courierCost = shippingMethod === 'vault' ? 75 : shippingMethod === 'express' ? 35 : (cart.subtotal > 250 ? 0 : 25);
  const calculatedGrandTotal = cart.subtotal - cart.discount + courierCost + (cart.tax_total || 0);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          first_name: firstName,
          last_name: lastName,
          street_address: street,
          city,
          state,
          postal_code: postalCode,
          country,
        },
        billingAddress: {
          first_name: firstName,
          last_name: lastName,
          street_address: street,
          city,
          state,
          postal_code: postalCode,
          country,
        },
        shippingMethod,
        paymentMethod,
        items: cart.items,
        couponCode: cart.applied_coupon,
        orderNotes,
      };

      const res = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (res.success && res.data) {
        // Trigger celebratory gold confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d97706', '#f59e0b', '#171717', '#ffffff'],
        });

        await clearCart();
        showToast('Consignment acquisition authorized successfully.', 'success');
        navigate(`/order-confirmed/${res.data.order_number}`);
      } else {
        showToast(res.message || 'Payment authorization failed.', 'error');
      }
    } catch {
      showToast('Checkout transaction interrupted. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Secure Badges */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-neutral-200 gap-4 mb-8"
        >
          <div>
            <Link to="/" className="font-serif-luxury text-2xl font-bold tracking-widest text-neutral-900">
              LUXE<span className="font-light">COMMERCE</span>
            </Link>
            <span className="block text-xs font-mono uppercase tracking-widest text-amber-800 font-bold mt-1">
              Encrypted Private Custody Checkout Protocol
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px] font-semibold">256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono text-[11px] font-semibold">Armoured Vault Guarantee</span>
            </div>
          </div>
        </motion.div>

        {/* Steps Breadcrumb */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10 text-xs font-bold uppercase tracking-wider font-mono">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 cursor-pointer transition ${
              step >= 1 ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${
              step >= 1 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>1</span>
            <span>Client & Address</span>
          </button>
          <span className="text-neutral-300">———</span>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 cursor-pointer transition ${
              step >= 2 ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${
              step >= 2 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>2</span>
            <span>White-Glove Courier</span>
          </button>
          <span className="text-neutral-300">———</span>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 cursor-pointer transition ${
              step >= 3 ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${
              step >= 3 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>3</span>
            <span>Settlement Authorization</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Identification & Shipping Address */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-serif-luxury text-neutral-900">
                      1. Consignment Destination & Client Identity
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      Provide the verified residential or private vault address for white-glove courier handover.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">VIP Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">Private Telephone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">State / Region</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-neutral-950 hover:bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
                    >
                      <span>Proceed to Courier Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Delivery Courier Method */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-serif-luxury text-neutral-900">
                      2. Courier Protocol & Transit Class
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      All deliveries are tamper-evident, GPS monitored, and insured up to $500,000.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShippingMethod('standard')}
                      className={`block p-4 sm:p-5 rounded-2xl border transition cursor-pointer ${
                        shippingMethod === 'standard'
                          ? 'border-neutral-950 bg-neutral-50 shadow-md ring-2 ring-neutral-950'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                            <Truck className="w-5 h-5 text-neutral-800" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 font-serif-luxury">
                              Standard Armored Transit (3-4 Business Days)
                            </h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Temperature-controlled secure packaging with signature verification.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {cart.subtotal > 250 ? 'Complimentary' : '$25.00'}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShippingMethod('express')}
                      className={`block p-4 sm:p-5 rounded-2xl border transition cursor-pointer ${
                        shippingMethod === 'express'
                          ? 'border-amber-600 bg-amber-50/40 shadow-md ring-2 ring-amber-600'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 font-serif-luxury">
                              White-Glove Hand Courier (1-2 Business Days)
                            </h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Hand-carried by bonded luxury courier agent with appointment booking.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-900">$35.00</span>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShippingMethod('vault')}
                      className={`block p-4 sm:p-5 rounded-2xl border transition cursor-pointer ${
                        shippingMethod === 'vault'
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-600'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-xs">
                            <ShieldCheck className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 font-serif-luxury">
                              Overnight Vault Direct Priority (Next Day by 10:30 AM)
                            </h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Armored vehicle dispatch from regional Swiss/US bullion depository.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-900">$75.00</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Address</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-neutral-950 hover:bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
                    >
                      <span>Proceed to Settlement</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment & Final Authorization */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-serif-luxury text-neutral-900">
                      3. Settlement & Payment Authorization
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      Select your preferred private settlement gateway.
                    </p>
                  </div>

                  {/* Gateway Tabs */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'stripe'
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'paypal'
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>PayPal Vault</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wire')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'wire'
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Bank Wire / COD</span>
                    </button>
                  </div>

                  {/* Stripe Simulator Card Inputs */}
                  {paymentMethod === 'stripe' && (
                    <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">
                            Expiration (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">
                            CVC / CVV
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 font-mono uppercase text-[10px]">
                      Special Concierge & Armored Handover Instructions
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Courier</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-9 py-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl transition disabled:opacity-50 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>
                        {isSubmitting
                          ? 'Authorizing Transaction...'
                          : `Authorize $${calculatedGrandTotal.toLocaleString()}`}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold font-serif-luxury text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>Consignment Summary</span>
                <span className="font-mono text-xs font-normal text-neutral-500">
                  {cart.items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </h3>

              <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3.5 flex gap-3.5">
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-14 h-14 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.product_title}
                      </h4>
                      {item.variant_name && (
                        <p className="text-[10px] text-neutral-500 font-mono">{item.variant_name}</p>
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

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-900 font-semibold">${cart.subtotal.toLocaleString()}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Privilege Promo ({cart.applied_coupon})</span>
                    <span className="font-mono">-${cart.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Selected Courier</span>
                  <span className="font-mono text-neutral-900 font-semibold">
                    {courierCost === 0 ? 'Complimentary' : `$${courierCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Vault & Sales Tax</span>
                  <span className="font-mono text-neutral-900 font-semibold">
                    ${(cart.tax_total || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Grand Total</span>
                  <span className="font-mono text-xl font-bold text-neutral-950">
                    ${calculatedGrandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 text-white p-6 rounded-3xl space-y-3 shadow-lg border border-neutral-900">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Privilege Custody Protection</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                Your consignment is protected by our global transit indemnity. Each piece includes an NFC-chipped
                Certificate of Authenticity directly verifiable through our Geneva manufacture registry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
