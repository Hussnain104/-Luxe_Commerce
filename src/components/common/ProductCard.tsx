import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Eye, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
import { Product } from '../../types.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const primaryImg =
    product.images[0]?.image_url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  const secondaryImg = product.images[1]?.image_url || primaryImg;

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const success = await addToCart(product.id, null, 1);
    setAdding(false);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/70 hover:border-amber-400/60 shadow-xs hover:shadow-2xl hover:shadow-amber-950/10 transition-all duration-400"
    >
      {/* 1. Image Canvas & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug}`} className="block w-full h-full relative">
          <motion.img
            src={primaryImg}
            alt={product.title}
            animate={{ scale: isHovered ? 1.07 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          {product.images.length > 1 && (
            <motion.img
              src={secondaryImg}
              alt={product.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.07 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          )}
          {/* Subtle gradient veil on hover */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badges Container with uiGradients */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent && (
            <span className="ui-gradient-ruby text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-md backdrop-blur-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Save {discountPercent}%</span>
            </span>
          )}
          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
            <span className="ui-gradient-gold text-neutral-950 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-xs">
              Only {product.stock_quantity} Left
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="bg-neutral-900/90 text-neutral-300 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-md">
              Vault Reserved
            </span>
          )}
        </div>

        {/* Wishlist Heart Button with Spring Burst */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          whileHover={{ scale: 1.15 }}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-colors duration-200 z-10 cursor-pointer ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/85 text-neutral-700 hover:bg-white hover:text-black border border-neutral-200/50'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <motion.div
            animate={isFavorited ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </motion.div>
        </motion.button>

        {/* Action Overlay on Hover with AnimatePresence */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="absolute bottom-3 inset-x-3 flex gap-2 z-10"
            >
              {onQuickView && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                  className="flex-1 bg-white/95 hover:bg-white text-neutral-900 font-semibold text-xs py-2.5 px-3 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition cursor-pointer border border-neutral-200/60"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Inspect</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickAdd}
                disabled={adding || product.stock_quantity === 0}
                className={`flex-1 font-bold text-xs py-2.5 px-3 rounded-xl shadow-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'ui-gradient-gold text-neutral-950 hover:brightness-110 shadow-amber-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>In Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Quick Add</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono uppercase tracking-widest text-[10px] text-amber-800/90 font-semibold">
              {product.brand_name}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-neutral-800 text-[11px] font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400 text-[10px]">({product.review_count})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-semibold text-neutral-900 hover:text-amber-800 transition line-clamp-1"
          >
            {product.title}
          </Link>

          <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-100">
          <span className="text-sm font-bold text-neutral-900 font-mono">
            ${product.price.toLocaleString()}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-neutral-400 line-through font-mono">
              ${product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
