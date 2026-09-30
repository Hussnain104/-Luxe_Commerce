import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Gem,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';
import { motion } from 'motion/react';

const ATELIERS = [
  { city: 'Geneva', country: 'Switzerland', timeZone: 'Europe/Zurich', label: 'Horology HQ' },
  { city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', label: 'Bond St Concierge' },
  { city: 'New York', country: 'United States', timeZone: 'America/New_York', label: 'Madison Ave Vault' },
  { city: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', label: 'Ginza Salon' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time ticking atelier clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatAtelierTime = (timeZone: string) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(currentTime);
    } catch {
      return '12:00:00';
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Privilege subscription confirmed. Welcome to the Sovereign Circle.', 'success');
  };

  return (
    <footer className="relative ui-gradient-obsidian text-neutral-300 border-t border-amber-500/20 overflow-hidden">
      {/* Animated continuous sliding gradient beam at the very top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none z-20">
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-400 via-yellow-200 to-transparent animate-beam" />
      </div>

      {/* Atmospheric radial ambient light orbs in background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-orange-600/10 blur-[140px] pointer-events-none" />

      {/* 1. Value Proposition Pillars with uiGradients */}
      <div className="relative border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/90 transition-all duration-300 shadow-xl group backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-xl ui-gradient-gold p-0.5 mb-4 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide font-serif-luxury">
              White-Glove Armored Courier
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Complimentary armored transit with door-to-door insurance on all consignments exceeding $250.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/90 transition-all duration-300 shadow-xl group backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-xl ui-gradient-gold p-0.5 mb-4 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide font-serif-luxury">
              Certified Provenance
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              100% authenticated directly from registered Swiss manufactures and master artisanal maisons.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/90 transition-all duration-300 shadow-xl group backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-xl ui-gradient-gold p-0.5 mb-4 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide font-serif-luxury">
              Bespoke 30-Day Return Privilege
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Private home inspection collection with immediate disbursement following gemological inspection.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/90 transition-all duration-300 shadow-xl group backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-xl ui-gradient-gold p-0.5 mb-4 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Headphones className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide font-serif-luxury">
              24/7 Sovereign Concierge
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Dedicated horologists and client advisors accessible via encrypted line, video, or private salon.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 2. World Atelier Clocks (High-End Horology Section) */}
      <div className="border-b border-neutral-850/80 bg-black/40 backdrop-blur-md py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-neutral-400">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '30s' }} />
            <span className="font-serif-luxury text-white font-semibold tracking-wider uppercase text-[11px]">
              Global Manufacture Time:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto">
            {ATELIERS.map((a) => (
              <div
                key={a.city}
                className="flex flex-col items-center md:items-start px-3 py-1.5 rounded-xl bg-neutral-900/50 border border-neutral-800/60"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">{a.city}</span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-400 mt-0.5">
                  {formatAtelierTime(a.timeZone)}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Footer Navigation & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
        {/* Brand & VIP Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl ui-gradient-gold p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="font-serif-luxury text-2xl font-bold tracking-widest text-white group-hover:text-amber-300 transition">
                LUXE<span className="font-light text-amber-400">COMMERCE</span>
              </span>
              <span className="block text-[8px] font-mono tracking-[0.25em] text-neutral-400 uppercase -mt-1 font-semibold">
                Sovereign Heritage Since 1886
              </span>
            </div>
          </Link>

          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-light">
            Curators of high horology, bespoke leathergoods, and audiophile acoustic systems.
            Crafted for connoisseurs who demand extraordinary craftsmanship, certifiable provenance, and timeless distinction.
          </p>

          {/* Newsletter Box with uiGradients */}
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-amber-500/25 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Ambient gold glow in corner */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <h5 className="text-xs font-bold text-white tracking-widest uppercase font-serif-luxury">
                  Privilege Inner Circle
                </h5>
              </div>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-light">
                Receive confidential preview notices to private vault allocations, tourbillon releases, and private invitations.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 p-3.5 rounded-2xl font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Your subscription is authenticated. Welcome to the Maison Inner Circle.</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your VIP email address"
                    className="flex-1 bg-neutral-950/90 border border-neutral-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition font-medium"
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="ui-gradient-gold text-neutral-950 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 hover:brightness-110 shrink-0"
                  >
                    <span>Request Access</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h5 className="text-xs font-bold text-white tracking-widest uppercase mb-5 font-serif-luxury flex items-center gap-2">
            <span>Ateliers</span>
            <span className="w-6 h-px bg-amber-500/40" />
          </h5>
          <ul className="space-y-3 text-xs text-neutral-400 font-light">
            <li>
              <Link to="/shop?category=horology-watches" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Haute Horlogerie</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=leather-goods" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Artisanal Leather</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=audiophile-sound" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Audiophile Acoustics</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=optical-eyewear" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Titanium Eyewear</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=fine-fragrance" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Rare Parfumerie</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?sale=true" className="text-rose-400 hover:text-rose-300 transition font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Privilege Archive Sale</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Client Protocol */}
        <div>
          <h5 className="text-xs font-bold text-white tracking-widest uppercase mb-5 font-serif-luxury flex items-center gap-2">
            <span>Client Protocol</span>
            <span className="w-6 h-px bg-amber-500/40" />
          </h5>
          <ul className="space-y-3 text-xs text-neutral-400 font-light">
            <li>
              <Link to="/account" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Private Client Dossier</span>
              </Link>
            </li>
            <li>
              <Link to="/account/orders" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Consignment Track & Trace</span>
              </Link>
            </li>
            <li>
              <Link to="/account/wishlist" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Curated Private Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>The Maison Heritage</span>
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-amber-400 transition" />
                <span>Editorial Journal</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Governance & Authenticity */}
        <div>
          <h5 className="text-xs font-bold text-white tracking-widest uppercase mb-5 font-serif-luxury flex items-center gap-2">
            <span>Governance</span>
            <span className="w-6 h-px bg-amber-500/40" />
          </h5>
          <ul className="space-y-3 text-xs text-neutral-400 font-light">
            <li>
              <Link to="/privacy" className="hover:text-white transition">
                Privacy Protection & GDPR
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition">
                Terms of Sovereign Trade
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-white transition">
                International Customs & Duties
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-semibold transition flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Management CMS Portal</span>
              </Link>
            </li>
            <li className="pt-2">
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-amber-500/30 text-[10px] text-amber-300 font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>SSL 256-BIT ENCRYPTION</span>
                </div>
                <p className="text-neutral-400 text-[9px] font-sans">
                  Geneva Financial Security Certified
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Bottom Bar with Payment and Copyright */}
      <div className="border-t border-neutral-900/80 bg-black/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p className="font-light">
            © {new Date().getFullYear()} LuxeCommerce International S.A. All rights reserved. Registered under Geneva Trade Registry No. CH-660-128.
          </p>

          <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono">
            {['VISA SIGNATURE', 'MASTERCARD BLACK', 'AMEX CENTURION', 'APPLE PAY', 'BITCOIN VAULT'].map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
