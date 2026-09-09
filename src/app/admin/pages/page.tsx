'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  isPublished: boolean;
  updatedAt: string;
}

export default function PagesAdminPage() {
  const toast = useToast();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    featuredImage: '',
    seoTitle: '',
    seoDesc: '',
    isPublished: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.pages) setPages(data.pages);
    } catch (e) {
      toast.error('Gagal memuat halaman statis');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      featuredImage: '',
      seoTitle: '',
      seoDesc: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (p: PageItem) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content,
      featuredImage: p.featuredImage || '',
      seoTitle: p.seoTitle || '',
      seoDesc: p.seoDesc || '',
      isPublished: p.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/pages/${editingId}` : '/api/pages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? 'Halaman berhasil diperbarui!' : 'Halaman baru berhasil dibuat!');
        setModalOpen(false);
        await fetchPages();
      } else {
        toast.error(data.error || 'Gagal menyimpan halaman');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus halaman "${title}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Halaman berhasil dihapus!');
        await fetchPages();
      }
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Page Builder (Halaman Statis CMS)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Buat halaman baru tanpa coding seperti /promo, /layanan, /karir, /syarat-ketentuan
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Halaman Baru</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Memuat daftar halaman...
          </div>
        ) : pages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            Belum ada halaman kustom. Buat satu sekarang!
          </div>
        ) : (
          pages.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{p.title}</h3>
                  <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    /{p.slug}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isPublished
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.isPublished ? 'Terbit' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Terakhir diperbarui: {new Date(p.updatedAt).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Lihat Halaman Publik"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                  title="Edit Halaman"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Hapus Halaman"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Page Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingId ? 'Edit Halaman' : 'Buat Halaman Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Judul Halaman *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Lowongan Karir"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Slug URL (otomatis jika kosong)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="lowongan-karir"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Konten Halaman (HTML / Markdown didukung)
                </label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tuliskan isi informasi halaman di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    placeholder="Judul untuk Google Search"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    value={form.seoDesc}
                    onChange={(e) => setForm({ ...form, seoDesc: e.target.value })}
                    placeholder="Deskripsi cuplikan di Google"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Publikasikan Halaman (Dapat diakses publik)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Halaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
