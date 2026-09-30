import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Award, X } from 'lucide-react';
import { Category, Brand } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminTaxonomy: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'brands'>('categories');

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Brand Modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('Geneva, Switzerland');

  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [catRes, brandRes] = await Promise.all([
      apiRequest<Category[]>('/categories'),
      apiRequest<Brand[]>('/brands'),
    ]);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (brandRes.success && brandRes.data) setBrands(brandRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDesc,
        image_url: catImage,
      }),
    });
    if (res.success) {
      showToast('Category created.', 'success');
      setCatModalOpen(false);
      setCatName('');
      setCatDesc('');
      fetchData();
    } else {
      showToast(res.message || 'Failed', 'error');
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/brands', {
      method: 'POST',
      body: JSON.stringify({
        name: brandName,
        slug: brandSlug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: brandDesc,
        origin_country: brandOrigin,
      }),
    });
    if (res.success) {
      showToast('Brand registered.', 'success');
      setBrandModalOpen(false);
      setBrandName('');
      setBrandDesc('');
      fetchData();
    } else {
      showToast(res.message || 'Failed', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Purge category taxonomy node?')) return;
    const res = await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Category removed.', 'info');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
            Structural Taxonomy
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Categories & Manufacture Houses
          </h1>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'categories' ? (
            <button
              onClick={() => setCatModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              + Add Category
            </button>
          ) : (
            <button
              onClick={() => setBrandModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              + Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
            activeSubTab === 'categories'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab('brands')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
            activeSubTab === 'brands'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Manufacture Brands ({brands.length})
        </button>
      </div>

      {/* Categories Grid */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-md group"
            >
              <div className="aspect-16/10 overflow-hidden bg-neutral-900 relative">
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded">
                  {c.product_count} pieces
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{c.name}</h4>
                  <span className="text-[10px] text-neutral-500 font-mono">/{c.slug}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brands Grid */}
      {activeSubTab === 'brands' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-md space-y-2"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-serif-luxury font-bold text-base text-white">{b.name}</h4>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-amber-300 px-2 py-0.5 rounded font-mono">
                  {b.origin_country}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Category */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-serif-luxury text-base font-bold text-white">Add New Category</h3>
              <button onClick={() => setCatModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Category Image URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Brand */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-serif-luxury text-base font-bold text-white">Register Manufacture Brand</h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Brand / Atelier Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Country of Provenance</label>
                <input
                  type="text"
                  value={brandOrigin}
                  onChange={(e) => setBrandOrigin(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Atelier Overview</label>
                <textarea
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Register Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
