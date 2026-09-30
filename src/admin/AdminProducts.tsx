import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Upload,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Product, Category, Brand } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(1000);
  const [comparePrice, setComparePrice] = useState(1200);
  const [stockQuantity, setStockQuantity] = useState(5);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [categoryId, setCategoryId] = useState(1);
  const [brandId, setBrandId] = useState(1);
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await apiRequest<Product[]>('/admin/products');
    if (res.success && res.data) setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    apiRequest<Category[]>('/categories').then((r) => r.success && setCategories(r.data || []));
    apiRequest<Brand[]>('/brands').then((r) => r.success && setBrands(r.data || []));
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setSku(`LX-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice(2500);
    setComparePrice(2800);
    setStockQuantity(5);
    setLowStockThreshold(2);
    setCategoryId(categories[0]?.id || 1);
    setBrandId(brands[0]?.id || 1);
    setShortDesc('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80');
    setIsFeatured(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSlug(p.slug);
    setSku(p.sku);
    setPrice(p.price);
    setComparePrice(p.compare_at_price || p.price);
    setStockQuantity(p.stock_quantity);
    setLowStockThreshold(p.low_stock_threshold);
    setCategoryId(p.category_id);
    setBrandId(p.brand_id);
    setShortDesc(p.short_description);
    setDescription(p.description);
    setImageUrl(p.images[0]?.image_url || '');
    setIsFeatured(p.is_featured);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sku.trim()) {
      showToast('Title and SKU are required.', 'error');
      return;
    }

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku,
      price: Number(price),
      compare_at_price: comparePrice ? Number(comparePrice) : null,
      stock_quantity: Number(stockQuantity),
      low_stock_threshold: Number(lowStockThreshold),
      category_id: Number(categoryId),
      brand_id: Number(brandId),
      short_description: shortDesc,
      description,
      is_featured: isFeatured,
      images: imageUrl
        ? [{ id: 1, image_url: imageUrl, alt_text: title, is_primary: true, display_order: 1 }]
        : [],
      specs: [
        { name: 'Origin', value: 'Geneva Atelier' },
        { name: 'Warranty', value: 'Lifetime Manufacture Guarantee' },
      ],
    };

    if (editingProduct) {
      const res = await apiRequest(`/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        showToast('Masterpiece specification updated.', 'success');
        setModalOpen(false);
        fetchProducts();
      } else {
        showToast(res.message || 'Update failed', 'error');
      }
    } else {
      const res = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        showToast('New artifact catalogued successfully.', 'success');
        setModalOpen(false);
        fetchProducts();
      } else {
        showToast(res.message || 'Creation failed', 'error');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you certain you wish to purge this artifact from the Maison archive?')) return;
    const res = await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Product purged from database.', 'info');
      fetchProducts();
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
            Catalogue CMS
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Masterpiece Product Directory ({products.length})
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Masterpiece</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, SKU, or department..."
          className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Artifact</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-900/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]?.image_url}
                        alt=""
                        className="w-11 h-11 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate block">{p.title}</span>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">
                          {p.brand_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-400">{p.sku}</td>
                  <td className="py-3.5 px-4 text-neutral-300">{p.category_name}</td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${p.price.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        p.stock_quantity <= p.low_stock_threshold
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-amber-400 font-mono">
                    ★ {p.rating.toFixed(1)} ({p.review_count})
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <a
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block p-1.5 text-neutral-400 hover:text-white transition"
                      title="View live page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 transition cursor-pointer"
                      title="Edit product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif-luxury text-lg font-bold text-white">
                {editingProduct ? `Edit Masterpiece: ${editingProduct.title}` : 'Catalogue New Masterpiece'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Artifact Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Inventory SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Manufacture Brand</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Vault Stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Low Alert Limit</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Primary Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Short Summary</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Full Technical Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Commit Masterpiece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
