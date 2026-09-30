import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ChevronDown,
  Award,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  PhoneCall,
  Mail,
  Lock,
  RotateCcw
} from 'lucide-react';

const FALLBACK_ATELIER_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80';

export const CMSContentPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>('general');

  const faqs = [
    {
      category: 'authentication',
      q: 'How does LuxeCommerce authenticate archival timepieces and rare artifacts?',
      a: 'Every piece consigned or acquired undergoes rigorous forensic inspection by certified master horologists, gemologists, or master leather artisans. Each item is issued with an encrypted NFC passport and cryptographic hash recorded in our immutable provenance ledger.',
    },
    {
      category: 'shipping',
      q: 'What does the White-Glove Armored Courier protocol include?',
      a: 'White-glove delivery includes climate-controlled armored transport, continuous satellite GPS tracking, biometric chain-of-custody verification, and scheduled private courier appointment. Unboxing, documentation inspection, and wrist fitting are provided upon handover.',
    },
    {
      category: 'returns',
      q: 'What is your private allocation return policy?',
      a: 'We extend a 30-day trial period from the date of physical receipt. A bonded luxury courier will collect the artifact directly from your residence or office at zero charge. Items must retain intact tamper-evident security seals with full original presentation boxes and manufacture papers.',
    },
    {
      category: 'bespoke',
      q: 'Can I request custom strap tailoring or horological case engraving?',
      a: 'Yes. Our private concierge coordinates directly with manufacture ateliers for complimentary bracelet micro-adjustment, hand-stitched alligator or calfskin tailoring, and traditional hand-pantograph caseback engraving.',
    },
    {
      category: 'insurance',
      q: 'Are artifacts insured during transit and vault custody?',
      a: 'All items in our custody and throughout active transit are 100% insured up to declared valuation by Lloyd’s of London syndicate underwriters, covering theft, accidental damage, and transit delay.',
    },
  ];

  if (path === '/faq') {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-neutral-900 py-16 selection:bg-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ui-gradient-gold text-neutral-950 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Patron Advisory Protocol</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-tight">
              Frequently Addressed Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto font-light leading-relaxed">
              Essential guidance regarding provenance authentication, armored transit protocols, vault reserves, and bespoke services.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIdx === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-100 overflow-hidden transition-colors duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif-luxury font-bold text-base text-neutral-900 hover:text-amber-800 transition cursor-pointer bg-neutral-50/50 hover:bg-neutral-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 shrink-0 text-amber-700 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-2 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed bg-white border-t border-neutral-100"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Concierge Desk Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-neutral-950 text-white border border-amber-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <h3 className="font-serif-luxury text-2xl font-bold">
              Require Dedicated Concierge Advisory?
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Our Senior Curators and Horological Officers remain on 24-hour confidential standby for private acquisitions.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <a
                href="tel:+18005893266"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>+1 (800) 589-3266</span>
              </a>
              <a
                href="mailto:concierge@luxegroup.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ui-gradient-gold text-neutral-950 font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>concierge@luxegroup.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shipping & Returns Page
  if (path === '/shipping' || path === '/returns') {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-neutral-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ui-gradient-gold text-neutral-950 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <Truck className="w-3.5 h-3.5" />
              <span>Logistics & Custody Protocols</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-tight">
              Armored Transit & Sovereign Returns
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto font-light leading-relaxed">
              Every parcel moves under insured custody with temperature controls and biometric delivery confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl ui-gradient-gold flex items-center justify-center text-neutral-950 font-bold shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif-luxury font-bold text-base text-neutral-900">White-Glove Courier</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                Appointment-based handover with physical package inspection and verification of factory seals.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl ui-gradient-gold flex items-center justify-center text-neutral-950 font-bold shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-serif-luxury font-bold text-base text-neutral-900">Lloyd’s Underwriting</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                100% full-value insurance indemnity covering every consignment from vault dispatch to doorstep.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl ui-gradient-gold flex items-center justify-center text-neutral-950 font-bold shadow-sm">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-serif-luxury font-bold text-base text-neutral-900">30-Day Privilege Return</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                Complimentary courier retrieval with full refund or exchange credited upon vault inspection.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default About / Maison Heritage Page
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 py-16 selection:bg-amber-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ui-gradient-gold text-neutral-950 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>Maison Provenance & Heritage</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900">
            The Philosophy of <span className="italic font-light text-amber-700">Permanence</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
            Founded across Geneva, Florence, and New York, LuxeCommerce was established as an uncompromising
            haven for collectors who revere generational craftsmanship over ephemeral luxury.
          </p>
        </div>

        {/* Hero Atelier Visual */}
        <div className="relative aspect-16/9 rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-200">
          <img
            src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80"
            alt="Maison Horological Ateliers"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_ATELIER_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
            <div className="text-white space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block">
                Atelier Vallée de Joux, Switzerland
              </span>
              <h3 className="font-serif-luxury text-xl font-bold">
                Where Hand Micro-Finishing Meets Perpetual Astronomy
              </h3>
            </div>
          </div>
        </div>

        {/* Narrative Manifesto */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm space-y-6">
          <div className="prose prose-neutral max-w-none text-neutral-800 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="first-letter:font-serif-luxury first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-800">
              We curate limited archival allocations directly from independent manufactures that reject
              mass automation. Every creation in our vault is an embodiment of human patience — from titanium
              bridge chamfering with wild gentian pegs to Florentine calfskin tanned with river oak for two full moons.
            </p>
            <p>
              Our patrons do not merely acquire objects; they assume custody of physical art designed
              to outlive their own horizons. When you acquire a timepiece or leather artifact through our
              vault, you receive cryptographic provenance and a lifetime manufacture warrantee.
            </p>
          </div>

          <blockquote className="my-6 p-6 rounded-2xl bg-amber-50/60 border-l-4 border-amber-600 text-amber-950 font-serif-luxury text-base sm:text-lg italic">
            “True distinction is quiet. It speaks through tolerances measured in thousandths of a millimeter.”
          </blockquote>
        </div>

        {/* 3 Pillars of Distinction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl ui-gradient-gold flex items-center justify-center mx-auto text-neutral-950 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury font-bold text-lg text-neutral-900">Immutable Provenance</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Cryptographic NFC passport linked to master workshop production logs.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl ui-gradient-gold flex items-center justify-center mx-auto text-neutral-950 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury font-bold text-lg text-neutral-900">Armored Custody</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Global temperature-regulated armored transport and bonded couriers.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl ui-gradient-gold flex items-center justify-center mx-auto text-neutral-950 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif-luxury font-bold text-lg text-neutral-900">Lifetime Pedigree</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Full workshop warranty and complimentary annual caliber diagnostics.
            </p>
          </div>
        </div>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:brightness-110 transition"
          >
            <span>Explore Current Vault Allocations</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
