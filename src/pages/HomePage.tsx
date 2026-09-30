import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Clock, ShieldCheck, Award, Star, Compass, Gem } from 'lucide-react';
import { Product, Category, Banner, BlogPost } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { QuickViewModal } from '../components/common/QuickViewModal.tsx';

const MANUFACTURE_BRANDS = [
  'PATEK PHILIPPE GENÈVE',
  'AUDEMARS PIGUET LE BRASSUS',
  'VACHERON CONSTANTIN 1755',
  'A. LANGE & SÖHNE GLASHÜTTE',
  'ROLEX OYSTER PERPETUAL',
  'JAEGER-LECOULTRE',
  'BOTTEGA VENETA VICENZA',
  'BANG & OLUFSEN STRUER',
];

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    // Load dynamic data from CMS endpoints
    apiRequest<Banner[]>('/cms/banners').then((res) => {
      if (res.success && res.data) setBanners(res.data);
    });

    apiRequest<{ products: Product[] }>('/products?limit=8').then((res) => {
      if (res.success && res.data) {
        setFeaturedProducts(res.data.products);
      }
    });

    apiRequest<{ products: Product[] }>('/products?onSale=true&limit=4').then((res) => {
      if (res.success && res.data) {
        setFlashProducts(res.data.products);
      }
    });

    apiRequest<Category[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });

    apiRequest<BlogPost[]>('/cms/blogs').then((res) => {
      if (res.success && res.data) setBlogs(res.data.slice(0, 3));
    });

    // Countdown timer tick
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Banner auto-advance
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const defaultBanner: Banner = {
    id: 1,
    title: 'The Haute Horlogerie Collection',
    subtitle: 'Exceptional Tourbillons & Mechanical Complications Crafted by Swiss Master Artisans',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&q=85',
    link_url: '/shop?category=horology-watches',
    button_text: 'Explore Timepieces',
    position: 'hero_slide',
    display_order: 1,
    is_active: true,
  };

  const currentBanner = banners[activeBannerIdx] || defaultBanner;

  return (
    <div className="min-h-screen bg-white selection:bg-amber-200 selection:text-neutral-900">
      {/* 1. Hero Showcase Carousel with Motion */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-neutral-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || activeBannerIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40" />
          </motion.div>
        </AnimatePresence>

        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white z-10">
          <motion.div
            key={activeBannerIdx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            {/* Ambient Floating Badge */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs tracking-widest uppercase font-mono shadow-lg shadow-amber-950/20 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Private Allocation Edition 2026</span>
            </motion.div>

            <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              {currentBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-xl">
              {currentBanner.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to={currentBanner.link_url}
                  className="ui-gradient-gold text-neutral-950 hover:brightness-110 px-8 py-4 rounded-2xl text-xs font-bold tracking-widest uppercase flex items-center gap-2.5 shadow-2xl shadow-amber-500/25 transition group"
                >
                  <span>{currentBanner.button_text || 'Discover Collection'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/shop"
                  className="border border-amber-400/40 hover:border-amber-300 text-amber-200 px-8 py-4 rounded-2xl text-xs font-semibold tracking-widest uppercase transition backdrop-blur-md hover:bg-amber-400/10"
                >
                  Explore Complete Vault
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Carousel Indicators & Animated Progress Line */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBannerIdx(i)}
                className={`relative h-2 rounded-full transition-all duration-500 cursor-pointer overflow-hidden ${
                  activeBannerIdx === i ? 'w-12 bg-amber-400/40' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Slide ${i + 1}`}
              >
                {activeBannerIdx === i && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. Prestigious Manufacture Houses Marquee */}
      <div className="bg-neutral-950 border-b border-neutral-900 py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-mono tracking-widest text-neutral-400 uppercase">
          {[...MANUFACTURE_BRANDS, ...MANUFACTURE_BRANDS].map((brand, idx) => (
            <span key={idx} className="flex items-center gap-6 hover:text-amber-300 transition cursor-default">
              <span>{brand}</span>
              <span className="text-amber-500/50 text-[10px]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Curated Disciplines & Category Showcase with Stagger Reveal */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-bold">
              Department Ateliers
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
              Curated Disciplines
            </h2>
          </motion.div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-neutral-900 hover:text-amber-800 flex items-center gap-1.5 transition group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative h-88 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <Link to={`/shop?category=${category.slug}`} className="block w-full h-full">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-6 inset-x-6 text-white">
                  <span className="text-[10px] uppercase font-mono tracking-widest ui-gradient-gold text-neutral-950 font-bold inline-block px-2.5 py-0.5 rounded-full mb-2 shadow-sm">
                    {category.item_count || 0} Artifacts
                  </span>
                  <h3 className="font-serif-luxury text-xl font-bold group-hover:text-amber-200 transition">
                    {category.name}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-1 mt-1 font-light leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Flash Sale / Private Archive Countdown with uiGradients */}
      {flashProducts.length > 0 && (
        <section className="ui-gradient-obsidian text-white py-20 border-y border-amber-500/20 relative overflow-hidden">
          {/* Ambient radial lighting in background */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-rose-600/10 blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-10 border-b border-neutral-800 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs uppercase tracking-widest font-mono font-bold shadow-md">
                  <Clock className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                  <span>Limited Private Allocation Window</span>
                </div>
                <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold mt-3">
                  Capsule Flash Allocation
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg font-light leading-relaxed">
                  Privileged acquisitions with guaranteed next-flight white-glove armored transit.
                </p>
              </div>

              {/* Countdown Flip Clocks with spring animations and uiGradients */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center bg-neutral-900/90 border border-amber-500/30 rounded-2xl px-5 py-3 min-w-[76px] shadow-xl backdrop-blur-md">
                  <span className="text-3xl font-bold font-mono text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono mt-1 font-semibold">Hours</span>
                </div>
                <span className="text-amber-500/60 font-bold text-xl">:</span>
                <div className="flex flex-col items-center bg-neutral-900/90 border border-amber-500/30 rounded-2xl px-5 py-3 min-w-[76px] shadow-xl backdrop-blur-md">
                  <span className="text-3xl font-bold font-mono text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono mt-1 font-semibold">Mins</span>
                </div>
                <span className="text-amber-500/60 font-bold text-xl">:</span>
                <div className="flex flex-col items-center bg-neutral-900/90 border border-amber-500/30 rounded-2xl px-5 py-3 min-w-[76px] shadow-xl backdrop-blur-md">
                  <motion.span
                    key={timeLeft.seconds}
                    initial={{ y: -4, opacity: 0.8 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-bold font-mono ui-gradient-text-gold"
                  >
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </motion.span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono mt-1 font-semibold">Secs</span>
                </div>
              </div>
            </div>

            {/* Flash Sale Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
              {flashProducts.map((p) => (
                <div key={p.id} className="text-neutral-900">
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Featured Masterpieces Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-bold">
            Handcrafted Mastery
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-neutral-900 mt-2">
            The Permanent Collection
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-3 leading-relaxed">
            Numbered production runs, bespoke materials, and lifetime manufacture guarantees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>

        <div className="text-center mt-14">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 bg-neutral-950 hover:bg-black text-white px-9 py-4 rounded-xl text-xs font-bold tracking-widest uppercase shadow-xl transition"
            >
              <span>Explore All Masterpieces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 6. Editorial Maison Story Banner */}
      <section className="py-20 bg-neutral-100 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <span className="text-xs uppercase tracking-widest font-mono text-amber-800 font-semibold">
              Maison Heritage & Philosophy
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Where Ancient Artisanship Meets Modern Acoustic & Chronometric Precision.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Every creation in the LuxeCommerce archive is commissioned from heritage European ateliers.
              From Geneva-regulated tourbillons beating at 28,800 vibrations per hour, to full-grain
              Tuscan vegetable-tanned hides treated with natural bark extracts, our standard is
              uncompromising permanence.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-neutral-200 text-center">
              <div>
                <span className="block font-serif-luxury text-2xl font-bold text-neutral-900">100%</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Provenance Verified</span>
              </div>
              <div>
                <span className="block font-serif-luxury text-2xl font-bold text-neutral-900">30-Day</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Concierge Returns</span>
              </div>
              <div>
                <span className="block font-serif-luxury text-2xl font-bold text-neutral-900">Lifetime</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Atelier Warranty</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1200&q=80"
              alt="Atelier Workshop"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* 7. Editorial Journal Highlights */}
      {blogs.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-bold">
                The Horology & Luxury Journal
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-neutral-900 mt-1">
                Editorial Chronicles
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-amber-800 flex items-center gap-1.5 transition group"
            >
              <span>Read Full Journal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-amber-400/50 hover:shadow-2xl transition duration-400"
              >
                <Link to={`/blog/${b.slug}`} className="flex flex-col h-full">
                  <div className="aspect-16/10 w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      src={b.featured_image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-700 font-bold">
                        {b.author_name} • {new Date(b.created_at).toLocaleDateString()}
                      </span>
                      <h3 className="font-serif-luxury text-base font-bold text-neutral-900 group-hover:text-amber-800 transition mt-2">
                        {b.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                        {b.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mt-5 group-hover:translate-x-1.5 transition">
                      <span>Read Chronicle</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};
