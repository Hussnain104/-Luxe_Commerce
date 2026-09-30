import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll } from 'motion/react';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { BlogPost } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

const FALLBACK_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    Promise.all([
      apiRequest<BlogPost>(`/cms/blogs/${slug}`),
      apiRequest<BlogPost[]>('/cms/blogs'),
    ]).then(([blogRes, allRes]) => {
      if (blogRes.success && blogRes.data) {
        setBlog(blogRes.data);
      }
      if (allRes.success && allRes.data) {
        setAllBlogs(allRes.data);
      }
      setLoading(false);
    });
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Chronicle link copied to clipboard', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] space-y-4">
        <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
          Retrieving Archival Chronicle...
        </span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#faf8f5]">
        <BookOpen className="w-12 h-12 text-amber-700/60 mb-3" />
        <h2 className="text-2xl font-bold font-serif-luxury text-neutral-900">
          Chronicle Not Located
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          The manuscript requested may have been archived or revised under our private library protocol.
        </p>
        <Link
          to="/blog"
          className="mt-6 px-6 py-3 rounded-xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-md"
        >
          Return to Journal Archive
        </Link>
      </div>
    );
  }

  // Related chronicles (excluding current)
  const relatedPosts = allBlogs.filter((b) => b.id !== blog.id).slice(0, 3);

  return (
    <article className="min-h-screen bg-[#faf8f5] text-neutral-900 selection:bg-amber-200">
      {/* Scroll Reading Progress Bar */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 inset-x-0 h-[3px] ui-gradient-gold z-50 pointer-events-none shadow-sm shadow-amber-500/50"
      />

      {/* Header Breadcrumb & Category Bar */}
      <div className="border-b border-amber-900/10 bg-white/70 backdrop-blur-md sticky top-16 z-20 py-3 transition">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-amber-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Archive Index</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-500">
              {blog.category}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-amber-400 bg-white text-[11px] font-semibold text-neutral-700 hover:text-neutral-950 transition cursor-pointer shadow-xs"
            >
              <Share2 className="w-3 h-3 text-amber-600" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-10">
        {/* Title & Masthead Header */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500">
            <span className="px-3 py-1 rounded-full ui-gradient-gold text-neutral-950 font-bold uppercase tracking-wider text-[10px] shadow-xs">
              {blog.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              {new Date(blog.published_at || Date.now()).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              {blog.reading_time || '6 min read'}
            </span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.15] tracking-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed border-l-4 border-amber-600 pl-5 italic bg-amber-50/50 py-3 rounded-r-xl">
            {blog.excerpt}
          </p>

          {/* Author Byline Ribbon */}
          <div className="flex items-center gap-3.5 pt-2">
            <img
              src={
                blog.author_avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
              }
              alt={blog.author_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
            />
            <div>
              <span className="text-sm font-bold text-neutral-900 block font-serif-luxury">
                {blog.author_name}
              </span>
              <span className="text-xs text-neutral-500 font-mono block">
                {blog.author_role || 'Atelier Special Contributor'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Featured Hero Photograph */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-200">
          <div className="aspect-16/9 w-full">
            <img
              src={blog.image_url || blog.featured_image || FALLBACK_BLOG_IMAGE}
              alt={blog.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_BLOG_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs font-mono flex items-center justify-between">
            <span>Official Atelier Archives • High Resolution Documentation</span>
            <span className="opacity-75">Curated Edition</span>
          </div>
        </div>

        {/* Key Takeaways Bento Card */}
        {blog.key_takeaways && blog.key_takeaways.length > 0 && (
          <div className="rounded-2xl p-6 sm:p-8 bg-white border border-amber-500/30 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Curator's Key Observations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {blog.key_takeaways.map((takeaway, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-700">0{idx + 1}</span>
                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                    {takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm space-y-8">
          {/* Main Narrative Split */}
          <div className="prose prose-neutral max-w-none text-neutral-800 text-base leading-relaxed space-y-6">
            {blog.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={index}
                    className="font-serif-luxury text-2xl font-bold text-neutral-900 pt-6 pb-2 border-b border-amber-100 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-6 rounded-full ui-gradient-gold inline-block" />
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return (
                <p
                  key={index}
                  className={`text-neutral-700 leading-relaxed ${
                    index === 0
                      ? 'first-letter:font-serif-luxury first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-800'
                      : ''
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Secondary Inset Artwork & Technical Photo */}
          {blog.secondary_image && (
            <div className="my-8 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
              <div className="aspect-16/9 w-full">
                <img
                  src={blog.secondary_image}
                  alt="Craftsmanship inspection"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              {blog.secondary_caption && (
                <div className="p-4 text-center bg-neutral-100/70 border-t border-neutral-200">
                  <p className="text-xs font-mono text-neutral-600 italic">
                    Figure A.1: {blog.secondary_caption}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Luxury Atelier Pull-Quote */}
          <blockquote className="my-10 p-8 rounded-2xl bg-neutral-950 text-white relative overflow-hidden border border-amber-500/20">
            <div className="absolute top-2 right-4 text-7xl font-serif text-amber-500/10 select-none">
              “
            </div>
            <p className="font-serif-luxury text-xl sm:text-2xl font-light italic leading-relaxed text-amber-100 relative z-10">
              “True luxury is not defined by excess, but by the irrefutable presence of human devotion in every millimeter.”
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-amber-400">
              <Award className="w-4 h-4" />
              <span>Chronique de Haute Manufacture • Geneva Protocols</span>
            </div>
          </blockquote>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase text-neutral-400 flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5" />
                Index Tags:
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-mono font-medium hover:bg-amber-100 hover:text-amber-900 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Curator Author Card */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-200 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={
              blog.author_avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
            }
            alt={blog.author_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
          />
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="font-serif-luxury text-xl font-bold text-neutral-900">
                {blog.author_name}
              </h4>
              <span className="px-2 py-0.5 rounded-full ui-gradient-gold text-neutral-950 text-[10px] font-mono font-bold uppercase">
                Verified Scholar
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-600">
              {blog.author_role || 'Senior Atelier Contributor and Horological Historian.'}
            </p>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Contributing monographs on heritage manufacturing, metallurgical thermodynamics, and the cultural
              preservation of European artisan guilds.
            </p>
          </div>
        </div>

        {/* Concierge Inquiry & Shop Acquisition CTA */}
        <div className="rounded-3xl p-8 sm:p-10 bg-neutral-950 text-white border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Atelier Acquisition</span>
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold">
              Explore Artifacts Featured in this Chronicle
            </h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Review certified limited releases, perpetual timepieces, and hand-finished calfskin luggage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/shop"
              className="px-6 py-3.5 rounded-2xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-amber-500/20"
            >
              Access Vault
            </Link>
            <button
              onClick={handleShare}
              className="px-5 py-3.5 rounded-2xl border border-white/20 hover:border-white text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
            >
              Share Article
            </button>
          </div>
        </div>

        {/* Related Chronicles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 space-y-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900">
                Continuing Chronicles
              </h3>
              <Link
                to="/blog"
                className="text-xs font-bold text-amber-800 hover:text-amber-900 uppercase tracking-wider flex items-center gap-1"
              >
                <span>Complete Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="aspect-16/10 w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      src={related.image_url || related.featured_image || FALLBACK_BLOG_IMAGE}
                      alt={related.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full ui-gradient-gold text-neutral-950 text-[9px] font-mono font-bold uppercase">
                      {related.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 block">
                        {new Date(related.published_at || Date.now()).toLocaleDateString()}
                      </span>
                      <h4 className="font-serif-luxury text-sm font-bold text-neutral-900 group-hover:text-amber-800 transition line-clamp-2 mt-1">
                        {related.title}
                      </h4>
                    </div>
                    <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:translate-x-1 transition">
                      <span>Read Chronicle</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
