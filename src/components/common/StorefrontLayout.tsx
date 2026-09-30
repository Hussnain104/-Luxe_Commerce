import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, useScroll } from 'motion/react';
import { Navbar } from './Navbar.tsx';
import { Footer } from './Footer.tsx';
import { CartDrawer } from './CartDrawer.tsx';
import { QuickViewModal } from './QuickViewModal.tsx';
import { Product } from '../../types.ts';

export const StorefrontLayout: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-amber-200 selection:text-neutral-900 overflow-x-hidden">
      {/* Top Scroll Progress Bar with uiGradient */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 inset-x-0 h-[2.5px] ui-gradient-gold z-50 pointer-events-none shadow-sm shadow-amber-500/50"
      />

      {/* Subtle Atmospheric Ambient Background Orbs */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-200/20 blur-[130px] pointer-events-none -z-10 animate-ambient-pulse" />
      <div className="fixed bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-orange-200/15 blur-[120px] pointer-events-none -z-10 animate-ambient-pulse" style={{ animationDelay: '3s' }} />

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet context={{ openQuickView: setQuickViewProduct }} />
      </main>

      <Footer />
      <CartDrawer />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
