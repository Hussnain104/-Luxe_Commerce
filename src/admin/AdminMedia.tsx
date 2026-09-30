import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Copy, Check, Plus, ExternalLink } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AdminMedia: React.FC = () => {
  const [media, setMedia] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchMedia = async () => {
    const res = await apiRequest<any[]>('/admin/media');
    if (res.success && res.data) setMedia(res.data);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopy = (url: string, id: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('Asset URL copied to clipboard.', 'info');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify({
        url: uploadUrl,
        filename: fileName || 'artifact_capture.jpg',
      }),
    });
    if (res.success) {
      showToast('Media registered in digital atelier.', 'success');
      setModalOpen(false);
      setUploadUrl('');
      setFileName('');
      fetchMedia();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
            Digital Atelier
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Media Assets & Product Imagery ({media.length})
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          + Register Image Asset
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden group relative flex flex-col justify-between"
          >
            <div className="aspect-square bg-neutral-900 overflow-hidden relative">
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <button
                onClick={() => handleCopy(item.url, item.id)}
                className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-md backdrop-blur-xs transition cursor-pointer"
                title="Copy URL"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-mono text-neutral-300 truncate">{item.filename}</p>
              <span className="text-[10px] text-neutral-500 font-mono">
                {(item.size_bytes / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Catalogue External Image Asset
            </h3>
            <form onSubmit={handleAddMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Image URL</label>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Asset File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. tourbillon_macro_01.jpg"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wider"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
