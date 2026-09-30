import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  Gem,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { apiRequest } from '../../services/api.ts';
import { Category } from '../../types.ts';

const ANNOUNCEMENTS = [
  {
    icon: ShieldCheck,
    text: 'Complimentary White-Glove Armored Global Delivery Over $250',
    badge: 'INSURED TRANSIT',
    code: 'FREESHIP',
  },
  {
    icon: Sparkles,
    text: 'Private Geneva Haute Horlogerie & Vault Allocations Now Accessible',
    badge: 'NEW CAPSULE',
    code: 'VAULT2026',
  },
  {
    icon: Gem,
    text: 'Swiss Chronometer Certified Masterpieces with Lifetime Atelier Guarantee',
    badge: 'HERITAGE',
    code: 'PRIVILEGE',
  },
];

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole, isAdmin } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Announcement bar carousel
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{
    products: any[];
    categories: any[];
    brands: any[];
    popular: string[];
  }>({ products: [], categories: [], brands: [], popular: [] });

  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Rotate announcement ticker every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    apiRequest<Category[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Live search debounced query
  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => {
      apiRequest<any>(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`).then((res) => {
        if (res.success && res.data) {
          setSearchSuggestions(res.data);
        }
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showToast(`Privilege code ${code} copied to clipboard`, 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const currentAnnouncement = ANNOUNCEMENTS[announcementIdx];
  const AnnouncementIcon = currentAnnouncement.icon;

  return (
    <>
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* 1. ADVANCED ANIMATED TOPPER (Announcement Bar with uiGradients) */}
      {/* <div className="relative ui-gradient-topper text-neutral-200 text-xs py-2.5 px-4 overflow-hidden border-b border-amber-500/20 shadow-lg">
        {/* Animated continuous sliding light beam */}
        {/* <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden pointer-events-none">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-300 via-yellow-200 to-transparent animate-beam" />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Real-time Vault Status */}
          {/* <div className="hidden lg:flex items-center gap-2.5 text-neutral-300 font-mono text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-neutral-200">Geneva Vault: Active</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">Insured Custody</span>
          </div> */} 

          {/* Center: Animated Rotating Announcement */}
          {/* <div className="mx-auto flex items-center justify-center min-h-[22px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center gap-2 text-center text-[11px] sm:text-xs"
              >
                <div className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                  <AnnouncementIcon className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="font-medium text-neutral-100 drop-shadow-xs">
                  {currentAnnouncement.text}
                </span>

                <span className="hidden sm:inline-block text-amber-500/60">•</span>

                {/* Interactive promo code badge */}
                {/* <button
                  onClick={() => handleCopyCode(currentAnnouncement.code)}
                  title="Click to copy privilege code"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900/80 border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 hover:border-amber-300 transition cursor-pointer font-mono font-bold text-[10px] shadow-xs group"
                >
                  <span>{currentAnnouncement.code}</span>
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-400 group-hover:text-amber-200" />
                  )}
                </button>
              </motion.div>
            </AnimatePresence>
          </div> */} 

          {/* Right: Role Switcher & Concierge */}
          {/* <div className="flex items-center gap-3">
            <span className="hidden xl:inline text-neutral-400 text-[11px] font-mono">
              Concierge: +1 (800) 589-LUXE
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchDemoRole(isAdmin ? 'customer' : 'super_admin')}
              className="text-[10px] ui-gradient-gold text-neutral-950 font-bold px-3 py-1 rounded-full shadow-md shadow-amber-500/20 hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer font-mono tracking-wider uppercase"
            >
              <Sparkles className="w-3 h-3 fill-current text-neutral-950" />
              <span>{isAdmin ? 'Super Admin' : 'VIP Client'}</span>
            </motion.button>
          </div>
        </div> */}

        {/* Ambient bottom golden gradient border line */}
        {/* <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      </div> */}


      {/* 2. MAIN NAVIGATION BAR (Frosted Luxury Glass with uiGradients) */}
      <div className="relative bg-white/92 backdrop-blur-2xl border-b border-neutral-200/80 transition-all shadow-xs">
        {/* Shimmering iridescent underline */}
        <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 via-yellow-400/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition focus:outline-none cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Luxury Brand Logo with Radiant uiGradient Styling */}
          <Link to="/" className="flex items-center gap-3 text-left group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-2xl ui-gradient-gold p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center"
            >
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </motion.div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-luxury text-2xl font-black tracking-wider ui-gradient-text-gold">
                  LUXE
                </span>
                <span className="font-serif-luxury text-2xl font-light tracking-widest text-neutral-900 group-hover:text-amber-800 transition">
                  COMMERCE
                </span>
              </div>
              <span className="block text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase -mt-1 font-semibold">
                Haute Horlogerie & Ateliers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-neutral-700">
            <Link
              to="/shop"
              className="relative py-2 px-1 hover:text-black transition group"
            >
              <span className="relative z-10">All Collections</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>

            {/* Mega Menu Category Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 hover:text-black py-4 transition cursor-pointer relative group">
                <span className="relative z-10">Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-amber-600' : 'text-neutral-400'
                  }`}
                />
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-300 group-hover:w-full rounded-full" />
              </button>

              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute top-full -left-28 w-[740px] bg-white/95 rounded-3xl shadow-2xl border border-amber-500/20 p-6 grid grid-cols-3 gap-6 backdrop-blur-2xl z-50 overflow-hidden"
                  >
                    {/* Atmospheric subtle gradient backdrop orb */}
                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none -z-10" />

                    <div className="col-span-2 grid grid-cols-2 gap-3.5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="group flex gap-3.5 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-orange-50/40 border border-transparent hover:border-amber-200/60 transition duration-200 shadow-xs"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-neutral-200 shadow-xs">
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-800 transition truncate">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                              {cat.description}
                            </p>
                            <span className="text-[10px] font-mono text-amber-700 font-semibold mt-1 block">
                              {cat.item_count || 0} Rare Pieces →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Featured Mega Menu Card with Royal uiGradient */}
                    <div className="col-span-1 ui-gradient-obsidian text-white p-6 rounded-2xl flex flex-col justify-between border border-amber-500/30 relative overflow-hidden shadow-xl">
                      {/* Gradient glow spotlight */}
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

                      <div className="relative z-10 space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[9px] font-bold uppercase tracking-widest">
                          <Gem className="w-3 h-3" />
                          <span>Haute Atelier</span>
                        </span>
                        <h3 className="font-serif-luxury text-base font-bold text-white mt-1 leading-snug">
                          Swiss Tourbillons & Mechanicals
                        </h3>
                        <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed font-light">
                          Individually numbered master complications certified by Geneva chronometric standards.
                        </p>
                      </div>

                      <Link
                        to="/shop?category=horology-watches"
                        onClick={() => setMegaMenuOpen(false)}
                        className="relative z-10 mt-6 ui-gradient-gold text-neutral-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-lg hover:brightness-110 transition group/btn"
                      >
                        <span>Explore Gallery</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Flash / Privilege Sale with Ruby uiGradient */}
            <Link
              to="/shop?sale=true"
              className="relative py-2 px-1 text-rose-700 hover:text-rose-800 font-semibold transition flex items-center gap-1.5 group"
            >
              <span className="relative z-10">Privilege Sale</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-600 to-amber-600 transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>

            <Link
              to="/blog"
              className="relative py-2 px-1 hover:text-black transition group"
            >
              <span className="relative z-10">Journal</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>

            <Link
              to="/about"
              className="relative py-2 px-1 hover:text-black transition group"
            >
              <span className="relative z-10">Maison</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          </nav>

          {/* Right Actions: Search, Wishlist, Cart, Account, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Trigger */}
            <div ref={searchRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                id="search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-amber-50/80 text-neutral-700 hover:text-amber-800 transition cursor-pointer"
                aria-label="Search store"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 rounded-3xl shadow-2xl border border-amber-500/30 p-5 z-50 backdrop-blur-2xl"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search watches, leathercraft, acoustics..."
                        autoFocus
                        className="w-full bg-neutral-100/80 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium border border-neutral-200"
                      />
                      <Search className="w-4 h-4 text-amber-600 absolute left-4 top-3.5" />
                    </form>

                    {/* Suggestions list */}
                    <div className="mt-3 divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
                      {searchSuggestions.products.length > 0 && (
                        <div className="py-2 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider font-mono">
                            Artifacts Found
                          </span>
                          {searchSuggestions.products.map((p) => (
                            <Link
                              key={p.id}
                              to={`/product/${p.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 p-2 hover:bg-amber-50/50 rounded-xl transition group"
                            >
                              <img src={p.image} alt={p.title} className="w-10 h-10 object-cover rounded-lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-neutral-900 group-hover:text-amber-800 transition truncate">
                                  {p.title}
                                </p>
                                <p className="text-[11px] font-mono text-amber-700 font-bold">
                                  ${p.price.toLocaleString()}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="py-2.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-mono block mb-2">
                          Popular Inquiries
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {searchSuggestions.popular.map((term) => (
                            <button
                              key={term}
                              onClick={() => {
                                navigate(`/shop?search=${encodeURIComponent(term)}`);
                                setSearchOpen(false);
                              }}
                              className="text-xs bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 px-3 py-1 rounded-full text-neutral-700 transition cursor-pointer font-medium"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link with Ruby uiGradient Badge */}
            <Link
              id="wishlist-nav-link"
              to="/account/wishlist"
              className="relative p-2.5 rounded-full hover:bg-rose-50 text-neutral-700 hover:text-rose-600 transition"
              aria-label="View Wishlist"
            >
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <Heart className="w-5 h-5" />
              </motion.div>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 ui-gradient-ruby text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono shadow-md shadow-rose-900/30"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart Drawer Trigger with Gold uiGradient Badge */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              id="cart-trigger-btn"
              onClick={openDrawer}
              className="relative p-2.5 rounded-full hover:bg-amber-50 text-neutral-700 hover:text-amber-800 transition cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 ui-gradient-gold text-neutral-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono shadow-md shadow-amber-500/40"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Account Popover with VIP Gradient Accents */}
            <div ref={accountRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                id="account-btn"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="p-2.5 rounded-full hover:bg-amber-50 text-neutral-700 hover:text-amber-800 transition flex items-center gap-1 cursor-pointer"
                aria-label="User Account"
              >
                <UserIcon className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="absolute right-0 top-full mt-3 w-72 bg-white/95 rounded-3xl shadow-2xl border border-amber-500/20 p-4 z-50 text-xs backdrop-blur-2xl"
                  >
                    {user ? (
                      <>
                        <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50/50 to-neutral-50 rounded-2xl border border-amber-200/60 mb-2">
                          <p className="font-bold text-neutral-900 font-serif-luxury text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                          <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold ui-gradient-gold text-neutral-950 px-2.5 py-0.5 rounded-full font-mono shadow-xs">
                            {user.role_slug === 'super_admin' ? 'Sovereign Administrator' : 'Privilege Collector'}
                          </span>
                        </div>

                        <div className="py-1 space-y-1">
                          <Link
                            to="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition font-medium"
                          >
                            Client Dossier
                          </Link>
                          <Link
                            to="/account/orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition font-medium"
                          >
                            Consignment History
                          </Link>
                          <Link
                            to="/account/wishlist"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition font-medium"
                          >
                            Private Wishlist
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl ui-gradient-gold text-neutral-950 font-bold transition shadow-sm mt-1"
                            >
                              <span>Admin CMS Operations</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>

                        <div className="pt-2 mt-2 border-t border-neutral-100">
                          <button
                            onClick={() => {
                              logout();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 transition cursor-pointer font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2 space-y-3">
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          Sign in for consignment tracking, private allocations, and bespoke concierge access.
                        </p>
                        <Link
                          to="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full text-center ui-gradient-gold text-neutral-950 font-bold py-3 rounded-xl hover:brightness-110 transition text-xs uppercase tracking-wider shadow-md"
                        >
                          Sign In / Register
                        </Link>

                        {/* Quick Demo Switcher */}
                        <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                          <span className="block font-semibold text-neutral-700 mb-1.5 font-mono text-[10px] uppercase">
                            Instant Protocol Demo:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                switchDemoRole('super_admin');
                                setAccountMenuOpen(false);
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              Super Admin
                            </button>
                            <button
                              onClick={() => {
                                switchDemoRole('customer');
                                setAccountMenuOpen(false);
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              VIP Client
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden xl:flex items-center gap-1.5 text-xs ui-gradient-gold text-neutral-950 hover:brightness-110 px-4 py-2.5 rounded-xl font-bold tracking-wider transition shadow-md shadow-amber-500/20"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>CMS</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. MOBILE NAVIGATION DRAWER with uiGradients */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-neutral-200 px-6 py-6 space-y-5 overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-3 text-sm font-semibold text-neutral-800">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-800 transition"
              >
                All Collections
              </Link>
              <div className="pl-3 border-l-2 border-amber-400/60 space-y-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
                  Categories
                </span>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-neutral-600 hover:text-black py-1"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <Link
                to="/shop?sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="text-rose-700 py-1 font-bold flex items-center gap-2"
              >
                <span>Privilege Archive Sale</span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-800 transition"
              >
                Editorial Journal
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-800 transition"
              >
                About Maison
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ui-gradient-gold text-neutral-950 font-bold py-2 px-3 rounded-xl inline-block shadow-md"
                >
                  Admin CMS Panel
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
};
