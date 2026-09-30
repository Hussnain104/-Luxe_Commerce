import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 250;
  const subtotal = cart?.subtotal || 0;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    setCouponCode('');
  };

  const handleProceedCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with motion fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer container with spring physics */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-800">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-serif-luxury tracking-wide text-neutral-900">
                      Private Bag
                    </h2>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {cart?.items.reduce((s, i) => s + i.quantity, 0) || 0} Artifacts Allocated
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeDrawer}
                  className="p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-neutral-50/80 px-6 py-3.5 border-b border-neutral-100">
                <div className="flex items-center justify-between text-xs mb-2 font-medium">
                  {remainingForFree > 0 ? (
                    <span className="text-neutral-700">
                      Add <strong className="text-neutral-900 font-bold font-mono">${remainingForFree.toFixed(2)}</strong> for complimentary courier
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Complimentary White-Glove Transit Unlocked
                    </span>
                  )}
                  <span className="text-neutral-600 font-mono text-[11px] font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
                {!cart || cart.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4"
                    >
                      <ShoppingBag className="w-10 h-10 stroke-1" />
                    </motion.div>
                    <h3 className="text-base font-serif-luxury font-bold text-neutral-900">
                      Your Vault Bag is Empty
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xs mt-1.5 mb-6 leading-relaxed">
                      Discover our horology timepieces, artisanal leathercraft, and collector artifacts.
                    </p>
                    <Link
                      to="/shop"
                      onClick={closeDrawer}
                      className="bg-neutral-950 hover:bg-black text-white px-7 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow-lg"
                    >
                      Explore Haute Collections
                    </Link>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {cart.items.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="py-4 flex gap-4"
                      >
                        <img
                          src={item.product_image}
                          alt={item.product_title}
                          className="w-20 h-20 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100 shadow-xs"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/product/${item.product_slug}`}
                                onClick={closeDrawer}
                                className="text-xs font-semibold text-neutral-900 hover:text-amber-800 transition line-clamp-1"
                              >
                                {item.product_title}
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.id)}
                                className="text-neutral-400 hover:text-rose-600 transition p-1 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>

                            {item.variant_name && (
                              <p className="text-[11px] text-neutral-500 mt-0.5">{item.variant_name}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200 transition font-bold"
                              >
                                -
                              </motion.button>
                              <span className="px-2.5 py-1 text-xs font-bold text-neutral-900 font-mono">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200 transition font-bold"
                              >
                                +
                              </motion.button>
                            </div>

                            <span className="text-xs font-bold text-neutral-900 font-mono">
                              ${(item.unit_price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer with Coupon, Totals and Actions */}
              {cart && cart.items.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50/80 space-y-4">
                  {/* Coupon Code Entry */}
                  {cart.applied_coupon ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Privilege Token: <strong>{cart.applied_coupon}</strong> (-${cart.discount.toLocaleString()})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-emerald-900 text-xs underline cursor-pointer font-semibold"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Voucher token (e.g. LUXE10)"
                        className="flex-1 bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-neutral-900 font-mono"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                      >
                        Apply
                      </motion.button>
                    </form>
                  )}

                  {/* Price Calculations */}
                  <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-200/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-neutral-900">${cart.subtotal.toLocaleString()}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Privilege Credit</span>
                        <span className="font-mono">-${cart.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Transit</span>
                      <span className="font-mono text-neutral-900">
                        {cart.shipping_total === 0 ? 'Complimentary' : `$${cart.shipping_total}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>Estimated Total</span>
                      <span className="font-mono text-lg text-amber-900">${cart.grand_total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProceedCheckout}
                      className="w-full ui-gradient-gold hover:brightness-110 text-neutral-950 py-4 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition cursor-pointer"
                    >
                      <span>Proceed to Private Checkout</span>
                      <ArrowRight className="w-4 h-4 text-neutral-950" />
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-Bit Encrypted Protocol & Insured Transit</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
