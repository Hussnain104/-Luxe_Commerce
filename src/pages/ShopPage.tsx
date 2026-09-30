import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Product, Category, Brand } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { QuickViewModal } from '../components/common/QuickViewModal.tsx';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const saleParam = searchParams.get('sale') === 'true';
  const inStockParam = searchParams.get('inStock') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    // Fetch filter facets
    apiRequest<Category[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
    apiRequest<Brand[]>('/brands').then((res) => {
      if (res.success && res.data) setBrands(res.data);
    });
  }, []);

  useEffect(() => {
    fetchFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, brandParam, searchParam, sortParam, saleParam, inStockParam, minPriceParam, maxPriceParam, pageParam]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (categoryParam) query.set('category', categoryParam);
    if (brandParam) query.set('brand', brandParam);
    if (searchParam) query.set('search', searchParam);
    if (sortParam) query.set('sort', sortParam);
    if (saleParam) query.set('onSale', 'true');
    if (inStockParam) query.set('inStock', 'true');
    if (minPriceParam) query.set('minPrice', minPriceParam);
    if (maxPriceParam) query.set('maxPrice', maxPriceParam);
    query.set('page', String(pageParam));
    query.set('limit', '12');

    const res = await apiRequest<{ products: Product[]; total: number; totalPages: number }>(`/products?${query.toString()}`);
    if (res.success && res.data) {
      setProducts(res.data.products);
      setTotalCount(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setLoading(false);
  };

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    categoryParam || brandParam || searchParam || saleParam || inStockParam || minPriceParam || maxPriceParam
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title with Entry Motion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-wider mb-2 font-mono">
            <span>Maison Archive</span>
            <span>/</span>
            <span className="text-neutral-900 font-bold">Catalog</span>
            {categoryParam && (
              <>
                <span>/</span>
                <span className="text-amber-800 font-bold">{categoryParam}</span>
              </>
            )}
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-neutral-900">
            {categoryParam
              ? categories.find((c) => c.slug === categoryParam)?.name || 'Department Catalog'
              : searchParam
              ? `Artifacts matching "${searchParam}"`
              : saleParam
              ? 'Private Archive Flash Allocations'
              : 'All Masterpiece Collections'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-mono">
            Displaying {products.length} of {totalCount} authentic consignments
          </p>
        </motion.div>

        {/* Action Bar (Filter trigger, Active Tags, View Switcher, Sort Dropdown) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Mobile Filter Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-md"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Filters ({[categoryParam, brandParam, saleParam, inStockParam].filter(Boolean).length})</span>
            </motion.button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1.5 font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </motion.button>
            )}
          </div>

          {/* Right Controls: Sort & Grid/List View */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-semibold font-mono">Sequence:</span>
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-medium text-neutral-800 text-xs focus:outline-none focus:border-neutral-900 shadow-xs"
              >
                <option value="featured">Featured Curations</option>
                <option value="newest">Latest Acquisitions</option>
                <option value="price_asc">Valuation: Lowest First</option>
                <option value="price_desc">Valuation: Highest First</option>
                <option value="rating">Patron Acclaim</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                aria-label="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                aria-label="List layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {categoryParam && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-900 text-white px-3.5 py-1.5 rounded-full shadow-xs">
                  <span>Category: {categories.find((c) => c.slug === categoryParam)?.name || categoryParam}</span>
                  <button onClick={() => updateFilter('category', null)} className="hover:text-amber-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {brandParam && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-900 text-white px-3.5 py-1.5 rounded-full shadow-xs">
                  <span>House: {brands.find((b) => b.slug === brandParam)?.name || brandParam}</span>
                  <button onClick={() => updateFilter('brand', null)} className="hover:text-amber-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {saleParam && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-rose-950 text-rose-200 border border-rose-800 px-3.5 py-1.5 rounded-full shadow-xs">
                  <span>Privilege Sale Only</span>
                  <button onClick={() => updateFilter('sale', null)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockParam && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-950 text-emerald-200 border border-emerald-800 px-3.5 py-1.5 rounded-full shadow-xs">
                  <span>Ready for Dispatch</span>
                  <button onClick={() => updateFilter('inStock', null)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Shop Body: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3 font-mono">
                  Disciplines
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('category', null)}
                    className={`w-full text-left text-xs py-2 px-3 rounded-xl flex justify-between transition cursor-pointer ${
                      !categoryParam ? 'bg-neutral-950 text-white font-bold shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className="font-mono text-[11px] opacity-80">{totalCount}</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateFilter('category', c.slug === categoryParam ? null : c.slug)}
                      className={`w-full text-left text-xs py-2 px-3 rounded-xl flex justify-between transition cursor-pointer ${
                        categoryParam === c.slug
                          ? 'bg-neutral-950 text-white font-bold shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-[11px] opacity-70">({c.item_count || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="pt-5 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3 font-mono">
                  Manufacture Houses
                </h3>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateFilter('brand', b.slug === brandParam ? null : b.slug)}
                      className={`w-full text-left text-xs py-2 px-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        brandParam === b.slug
                          ? 'bg-neutral-950 text-white font-bold shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{b.name}</span>
                      {brandParam === b.slug && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-5 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3 font-mono">
                  Valuation Range
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={minPriceParam}
                      onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                      className="w-1/2 bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs font-mono"
                    />
                    <span className="text-neutral-400">-</span>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={maxPriceParam}
                      onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                      className="w-1/2 bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Availability & Sale Toggles */}
              <div className="pt-5 border-t border-neutral-100 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer w-4 h-4 accent-neutral-900"
                  />
                  <span className="font-medium">Ready for Dispatch Only</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saleParam}
                    onChange={(e) => updateFilter('sale', e.target.checked ? 'true' : null)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer w-4 h-4 accent-rose-700"
                  />
                  <span className="text-rose-700 font-bold">Privilege Allocations</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area with Motion */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200 animate-pulse space-y-4 shadow-xs">
                    <div className="aspect-square bg-neutral-200 rounded-xl" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                    <div className="h-5 bg-neutral-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-neutral-200 p-16 text-center shadow-xs"
              >
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-xl font-bold text-neutral-900">
                  No masterpieces match your criteria
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 mb-6 leading-relaxed">
                  Try adjusting your price range or filter selections to uncover available archival inventory.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-neutral-950 text-white px-7 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition cursor-pointer shadow-md"
                >
                  Reset All Criteria
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* List View Mode with Motion */
              <div className="space-y-4">
                {products.map((p) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={p.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-5 flex flex-col sm:flex-row gap-6 items-center shadow-xs hover:shadow-xl transition duration-300"
                  >
                    <img
                      src={p.images[0]?.image_url}
                      alt={p.title}
                      className="w-full sm:w-44 h-44 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold">
                        {p.brand_name}
                      </span>
                      <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                        {p.title}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                      <div className="flex items-baseline gap-3 pt-2">
                        <span className="text-base font-bold text-neutral-900 font-mono">
                          ${p.price.toLocaleString()}
                        </span>
                        {p.compare_at_price && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            ${p.compare_at_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full sm:w-auto flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setQuickViewProduct(p)}
                        className="flex-1 sm:flex-none bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Preview
                      </button>
                      <a
                        href={`/product/${p.slug}`}
                        className="flex-1 sm:flex-none bg-neutral-950 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl text-center transition shadow-xs"
                      >
                        Inspect
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateFilter('page', String(Math.max(1, pageParam - 1)))}
                  disabled={pageParam <= 1}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateFilter('page', String(pNum))}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition cursor-pointer font-mono ${
                        pageParam === pNum
                          ? 'bg-neutral-950 text-white shadow-md'
                          : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => updateFilter('page', String(Math.min(totalPages, pageParam + 1)))}
                  disabled={pageParam >= totalPages}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-screen max-w-xs bg-white shadow-2xl p-6 overflow-y-auto space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="text-base font-bold font-serif-luxury">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-neutral-500 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 font-mono">Disciplines</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateFilter('category', null);
                        setMobileFiltersOpen(false);
                      }}
                      className={`block w-full text-left text-xs py-2 px-3 rounded-xl ${!categoryParam ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-700'}`}
                    >
                      All Collections
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateFilter('category', c.slug === categoryParam ? null : c.slug);
                          setMobileFiltersOpen(false);
                        }}
                        className={`block w-full text-left text-xs py-2 px-3 rounded-xl ${categoryParam === c.slug ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-700'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile brands */}
                <div className="pt-4 border-t border-neutral-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 font-mono">Manufacture House</h4>
                  <div className="space-y-1">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          updateFilter('brand', b.slug === brandParam ? null : b.slug);
                          setMobileFiltersOpen(false);
                        }}
                        className={`block w-full text-left text-xs py-2 px-3 rounded-xl ${brandParam === b.slug ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-700'}`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full bg-neutral-950 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
                  >
                    Apply Criteria
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};
