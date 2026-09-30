import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Search,
  Filter,
  Bookmark,
  Share2,
  Calendar,
  CheckCircle,
  Compass
} from 'lucide-react';
import { BlogPost } from '../types.ts';
import { apiRequest } from '../services/api.ts';

const FALLBACK_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80';

export const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    apiRequest<BlogPost[]>('/cms/blogs').then((res) => {
      if (res.success && res.data) setBlogs(res.data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat =
        selectedCategory === 'All' ||
        b.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const featuredPost = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const remainingPosts = filteredBlogs.length > 0 ? filteredBlogs.slice(1) : [];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedEmail) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setSubscribedEmail('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 pb-24 selection:bg-amber-200">
      {/* 1. Atelier Editorial Masthead & Volume Header */}
      <section className="relative pt-12 pb-14 border-b border-amber-900/10 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-[#faf8f5]">
        {/* Subtle decorative luxury lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#d97706_0.75px,transparent_0.75px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ui-gradient-gold text-neutral-950 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
              <span>Gazette des Métiers d'Art • Vol. IX</span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              The Haute <span className="italic font-light text-amber-700">Chronicle</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 font-light max-w-2xl leading-relaxed">
              Curated dissertations on micro-mechanical horology, bespoke Florentine leathercraft,
              sub-micron planar acoustics, and sovereign lapidary arts.
            </p>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-neutral-500 uppercase tracking-wider">
              <span>Geneva</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Florence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Paris</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>London</span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wider whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'ui-gradient-gold text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/80 hover:bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search chronicles, crafts, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/90 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-14">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
              Opening The Archives...
            </span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-lg mx-auto shadow-sm">
            <BookOpen className="w-10 h-10 mx-auto text-amber-600/60 mb-3" />
            <h3 className="font-serif-luxury text-xl font-bold text-neutral-900">
              No Chronicles Match Your Query
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your category filter or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Reset Archive Filters
            </button>
          </div>
        ) : (
          <>
            {/* 3. Featured Cover Story (Large Headline Spotlight) */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                  {/* Left Column: Cover Imagery */}
                  <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden bg-neutral-900">
                    <img
                      src={featuredPost.image_url || featuredPost.featured_image || FALLBACK_BLOG_IMAGE}
                      alt={featuredPost.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent" />
                    
                    {/* Category & Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full ui-gradient-gold text-neutral-950 text-[10px] font-mono font-bold tracking-widest uppercase shadow-md">
                        {featuredPost.category || 'Featured Cover Story'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-200 border border-white/10 text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {featuredPost.reading_time || '6 min read'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Narrative & Meta */}
                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 relative z-10 bg-gradient-to-br from-neutral-950 to-neutral-900">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 text-xs text-amber-400 font-mono tracking-wider uppercase">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {new Date(featuredPost.published_at || Date.now()).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold leading-snug group-hover:text-amber-300 transition-colors">
                        <Link to={`/blog/${featuredPost.slug}`}>
                          {featuredPost.title}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed line-clamp-4">
                        {featuredPost.excerpt}
                      </p>

                      {/* Key Highlights Pill */}
                      {featuredPost.key_takeaways && featuredPost.key_takeaways.length > 0 && (
                        <div className="pt-2 border-t border-neutral-800/80">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block mb-1">
                            Atelier Takeaway
                          </span>
                          <p className="text-xs text-neutral-400 italic">
                            "{featuredPost.key_takeaways[0]}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Author & Action */}
                    <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            featuredPost.author_avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                          }
                          alt={featuredPost.author_name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shadow-sm"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {featuredPost.author_name}
                          </span>
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            {featuredPost.author_role || 'Atelier Contributor'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 group-hover:brightness-110 transition"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Complete Editorial Archive Grid */}
            {remainingPosts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-neutral-900">
                      Chronicle Archives & Monographs
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    {remainingPosts.length} Editions Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-neutral-200/90 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        {/* Image Preview with Aspect Ratio */}
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
                          <img
                            src={post.image_url || post.featured_image || FALLBACK_BLOG_IMAGE}
                            alt={post.title}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Category Tag on top of image */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded-full ui-gradient-gold text-neutral-950 text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm">
                              {post.category}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {post.reading_time || '5 min read'}
                          </div>
                        </div>

                        {/* Article Text Content */}
                        <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-[11px] text-amber-800 font-mono font-bold tracking-wider uppercase">
                              <span>{post.author_name}</span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-neutral-500 font-normal">
                                {new Date(post.published_at || Date.now()).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="font-serif-luxury text-lg font-bold text-neutral-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug">
                              {post.title}
                            </h4>

                            <p className="text-xs text-neutral-600 font-light line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>

                          {/* Tags & Action Link */}
                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {post.tags && post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 group-hover:text-amber-700 transition">
                              <span>Read</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 5. Gazette Subscription & Printed Monograph Digest */}
        <section className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/60 text-white border border-amber-500/25 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Privilege Monograph Subscription</span>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold tracking-tight">
              Receive the Quarterly Printed Journal
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-xl mx-auto">
              Bound in heavy rag cotton paper with tipped-in lithographs of master movements.
              Delivered directly to registered collectors four times per annum.
            </p>

            {isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>You are subscribed to the Maison Gazette. Welcome to the Inner Circle.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter private client email..."
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/15 transition shadow-inner"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl ui-gradient-gold text-neutral-950 text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-xl hover:brightness-110 transition cursor-pointer"
                >
                  Enroll
                </button>
              </form>
            )}

            <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-neutral-400 uppercase tracking-wider pt-2">
              <span>Complimentary Delivery</span>
              <span>•</span>
              <span>Zero Advertising</span>
              <span>•</span>
              <span>Strict Privacy</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
