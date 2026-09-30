import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShieldCheck, Truck, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../../types.ts';
import { useCart } from '../../context/CartContext.tsx';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const currentPrice = selectedVariant?.price_override ?? product.price;
  const inStock = (selectedVariant?.stock_quantity ?? product.stock_quantity) > 0;

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, selectedVariant?.id || null, quantity);
    setAdding(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition z-20 cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Left Column: Image Preview Gallery */}
          <div className="p-6 bg-neutral-50 flex flex-col justify-between">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-100 relative">
              <motion.img
                key={selectedImageIdx}
                initial={{ opacity: 0.6, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImageIdx]?.image_url || product.images[0]?.image_url}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={img.id}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      selectedImageIdx === idx
                        ? 'border-amber-600 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono uppercase tracking-widest text-[10px] text-amber-800 font-bold">
                  {product.brand_name}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-neutral-800 text-xs">{product.rating.toFixed(1)}</span>
                  <span className="text-neutral-400 text-[10px]">({product.review_count})</span>
                </div>
              </div>

              <h3 className="text-xl font-bold font-serif-luxury text-neutral-900 leading-tight">
                {product.title}
              </h3>

              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">SKU: {product.sku}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold text-neutral-900 font-mono">
                  ${currentPrice.toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-neutral-400 line-through font-mono">
                    ${product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                {product.short_description}
              </p>

              {/* Variants Selector */}
              {product.variants.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <label className="block text-[11px] font-mono font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Configuration Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition cursor-pointer ${
                          (selectedVariant?.id || product.variants[0]?.id) === v.id
                            ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {v.title}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition cursor-pointer"
                  >
                    -
                  </motion.button>
                  <span className="px-4 py-2 text-xs font-bold font-mono">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition cursor-pointer"
                  >
                    +
                  </motion.button>
                </div>

                <span className={`text-xs font-medium ${inStock ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                  {inStock ? 'Vault Ready — Immediate Armored Dispatch' : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={adding || !inStock}
                className="w-full bg-neutral-950 hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{adding ? 'Reserving...' : 'Add to Shopping Bag'}</span>
              </motion.button>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full text-center text-xs text-neutral-600 hover:text-black py-2 font-medium flex items-center justify-center gap-1 transition"
              >
                <span>View Comprehensive Atelier Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
