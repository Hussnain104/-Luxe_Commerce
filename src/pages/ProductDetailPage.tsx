import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Check,
  ShoppingBag,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Variant & Purchase State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'heritage' | 'shipping' | 'care'>('specs');
  const [adding, setAdding] = useState(false);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedImageIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    apiRequest<{ product: Product; related: Product[]; reviews: Review[] }>(`/products/${slug}`)
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.related || []);
          setReviews(res.data.reviews || []);
          if (res.data.product.variants.length > 0) {
            setSelectedVariant(res.data.product.variants[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-2 border-neutral-900 border-t-amber-500 rounded-full"
          />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            Unlocking Archive Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white p-6 text-center">
        <h2 className="text-2xl font-bold font-serif-luxury text-neutral-900">
          Archival Artifact Not Located
        </h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6">
          This piece may have been acquired by a private collector or rotated to our historical vault.
        </p>
        <Link
          to="/shop"
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider"
        >
          Return to Collections
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentPrice = selectedVariant?.price_override ?? product.price;
  const inStock = (selectedVariant?.stock_quantity ?? product.stock_quantity) > 0;
  const stockCount = selectedVariant?.stock_quantity ?? product.stock_quantity;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, selectedVariant?.id || null, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    setAdding(true);
    await addToCart(product.id, selectedVariant?.id || null, quantity);
    setAdding(false);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Artifact link copied to clipboard', 'info');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please provide both a title and review body.', 'error');
      return;
    }
    setSubmittingReview(true);
    const res = await apiRequest<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        customerName: reviewerName.trim() || 'Verified Connoisseur',
      }),
    });
    setSubmittingReview(false);

    if (res.success && res.data) {
      setReviews([res.data, ...reviews]);
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      showToast('Thank you. Your assessment has been recorded.', 'success');
    }
  };

  const activeImage = product.images[selectedImageIdx]?.image_url || product.images[0]?.image_url;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Breadcrumb Bar */}
      <div className="border-b border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link to="/" className="hover:text-black transition">Maison</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to="/shop" className="hover:text-black transition">Collections</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to={`/shop?category=${product.category_slug}`} className="hover:text-black transition">
            {product.category_name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.title}</span>
        </div>
      </div>

      {/* 2. Main Product Showcase Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="relative aspect-square w-full rounded-3xl overflow-hidden bg-neutral-50 border border-neutral-100 group cursor-zoom-in shadow-sm"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.5, scale: 1.02 }}
                animate={{ opacity: 1, scale: isZoomed ? 1.45 : 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.4 }}
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
              <span className="bg-neutral-950 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full tracking-wider uppercase shadow-md font-mono">
                Vault Certified
              </span>
              {product.compare_at_price && (
                <span className="bg-rose-950 text-rose-200 border border-rose-800 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase shadow-md font-mono">
                  Privilege Saving
                </span>
              )}
            </div>

            {/* Share and Wishlist quick icons */}
            <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition cursor-pointer ${
                  isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-neutral-700 hover:text-black'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-600' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="p-3 rounded-full bg-white/90 shadow-lg text-neutral-700 hover:text-black transition cursor-pointer"
                aria-label="Share artifact"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={img.id}
                  onClick={() => {
                    setSelectedImageIdx(i);
                    setIsZoomed(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImageIdx === i ? 'border-neutral-950 shadow-md ring-2 ring-neutral-950' : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications, Variants & Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mb-2">
              <span className="uppercase tracking-widest text-amber-800 font-bold">
                {product.brand_name}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-neutral-800 font-mono">{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400">•</span>
              <a href="#reviews-section" className="text-neutral-600 underline hover:text-black">
                {reviews.length} Client Assessments
              </a>
            </div>
          </div>

          {/* Price & Savings */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-neutral-900">
                ${currentPrice.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-neutral-400 line-through font-mono">
                  ${product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              Complimentary insured global transit • Import taxes & duties calculated at checkout
            </p>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                <span>Select Specification</span>
                <span className="font-normal text-neutral-500 lowercase">
                  {selectedVariant?.title}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => {
                  const isSelected = (selectedVariant?.id || product.variants[0]?.id) === v.id;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.title}</div>
                      <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                        ${(v.price_override || product.price).toLocaleString()}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Scarcity Counter */}
          <div className="flex items-center gap-2 text-xs py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stockCount <= product.low_stock_threshold ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="font-medium text-neutral-700">
              {stockCount <= product.low_stock_threshold
                ? `Only ${stockCount} allocation units remain in European Vault`
                : 'Allocated & Ready for Immediate White-Glove Transit'}
            </span>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 rounded-2xl bg-white overflow-hidden shadow-xs">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-neutral-700 hover:bg-neutral-100 font-bold transition cursor-pointer"
                >
                  -
                </motion.button>
                <span className="px-5 py-3 text-xs font-bold text-neutral-900 font-mono">{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-neutral-700 hover:bg-neutral-100 font-bold transition cursor-pointer"
                >
                  +
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={adding || !inStock}
                className="flex-1 bg-neutral-950 hover:bg-black text-white py-4 px-6 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl transition disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{adding ? 'Securing...' : 'Add to Shopping Bag'}</span>
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={adding || !inStock}
              className="w-full ui-gradient-gold hover:brightness-110 text-neutral-950 py-4 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Instant Express Checkout</span>
            </motion.button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4 text-xs text-neutral-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full Authenticity & Caliber Certification</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Insured White-Glove Hand Courier</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-sky-700 shrink-0" />
              <span>30-Day Complimentary Returns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Lifetime Atelier Craft Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Technical Specifications & Tabs */}
      <section className="bg-neutral-50/70 border-y border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Headers */}
          <div className="flex border-b border-neutral-200 gap-8 overflow-x-auto pb-px">
            {[
              { id: 'specs', label: 'Technical Dossier' },
              { id: 'heritage', label: 'Artisanal Provenance' },
              { id: 'shipping', label: 'Transit & Insurance' },
              { id: 'care', label: 'Care & Servicing' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-4 text-xs font-bold uppercase tracking-widest transition cursor-pointer shrink-0 ${
                  activeTab === tab.id ? 'text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-neutral-950"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Panels with Motion */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'specs' && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {product.specs.map((spec, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold block">
                        {spec.name}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 mt-1 block">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'heritage' && (
                <motion.div
                  key="heritage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl space-y-4 text-xs text-neutral-700 leading-relaxed"
                >
                  <p>
                    Manufactured in strictly limited, individually numbered iterations. Every individual component
                    is shaped by master artisans holding generational pedigree in Haute Horlogerie or leathercraft.
                  </p>
                  <p>
                    Each piece undergoes a rigorous 480-hour chronometric and structural stress test within
                    our Swiss-regulated verification lab prior to release into the private catalogue.
                  </p>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl space-y-3 text-xs text-neutral-700 leading-relaxed"
                >
                  <p>
                    <strong>Complimentary Insured Courier:</strong> All domestic and international orders exceeding $250
                    are dispatched with armoured, tamper-evident courier protection.
                  </p>
                  <p>
                    <strong>30-Day Privilege Return:</strong> You may request a concierge home pickup within 30 days
                    of delivery. Items must remain in unworn condition with intact security tags.
                  </p>
                </motion.div>
              )}

              {activeTab === 'care' && (
                <motion.div
                  key="care"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl space-y-3 text-xs text-neutral-700 leading-relaxed"
                >
                  <p>
                    Clean with the included microfiber polishing mitt. Store in the temperature and humidity controlled
                    bespoke travel casket provided with your order.
                  </p>
                  <p>
                    Complete atelier maintenance overhaul is recommended every five years to refresh synthetic
                    lubricants and inspect waterproof gaskets.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. Client Assessments & Reviews Section */}
      <section id="reviews-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-neutral-200 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-bold">
              Verified Provenance
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
              Client Assessments ({reviews.length})
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-neutral-950 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer shadow-md"
          >
            {showReviewForm ? 'Cancel Review' : 'Write an Assessment'}
          </motion.button>
        </div>

        {/* Review Form Drawer/Modal */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReviewSubmit}
              className="bg-neutral-50 p-6 sm:p-8 rounded-3xl border border-neutral-200 mt-8 space-y-4 max-w-2xl shadow-xs"
            >
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
                Submit Client Assessment
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewRating(r)}
                      className="p-1 text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${r <= reviewRating ? 'fill-current' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Jean-Luc R."
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summary of craftsmanship and experience"
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe fit, finish, acoustics, and handling..."
                  rows={4}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-neutral-950 text-white px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition cursor-pointer shadow-md"
              >
                {submittingReview ? 'Submitting...' : 'Post Assessment'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reviews List */}
        <div className="mt-8 divide-y divide-neutral-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">
              No assessments recorded yet. Be the first collector to review this artifact.
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{rev.customer_name}</span>
                    {rev.is_verified_purchase && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                        Verified Collector
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>

                <h4 className="text-xs font-bold text-neutral-900">{rev.title}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Related Archival Masterpieces */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-neutral-50/50 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-bold">
                Department Archive
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900 mt-1">
                Complementary Curations
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
