'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Loader2,
  FileText,
  Tag,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { slugify } from '@/lib/utils';

interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    posts: number;
  };
}

export default function BlogCategoriesAdminPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      toast.error('Gagal memuat kategori blog');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: '', slug: '' });
    setModalOpen(true);
  };

  const openEditModal = (cat: BlogCategoryItem) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
    });
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingId) {
      setForm({ name, slug: slugify(name) });
    } else {
      setForm((prev) => ({ ...prev, name }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/blog/categories/${editingId}` : '/api/blog/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil dibuat!');
        setModalOpen(false);
        await fetchCategories();
      } else {
        toast.error(data.error || 'Gagal menyimpan kategori');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string, postCount: number) => {
    const warningText = postCount > 0 
      ? `Terdapat ${postCount} artikel dalam kategori "${name}".\nJika dihapus, artikel-artikel tersebut tidak akan memiliki kategori (tidak ikut terhapus).\n\nYakin ingin menghapus?`
      : `Apakah Anda yakin ingin menghapus kategori "${name}"?`;

    const confirmed = window.confirm(warningText);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Kategori berhasil dihapus');
        await fetchCategories();
      } else {
        toast.error(data.error || 'Gagal menghapus kategori');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan saat menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/blog"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              title="Kembali ke Daftar Artikel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Kategori Blog & Artikel
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Kelola topik dan kategori untuk mengelompokkan artikel, berita desa, dan panduan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/blog"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Semua Artikel</span>
          </Link>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kategori atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Nama Kategori</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Jumlah Artikel</th>
                <th className="py-3.5 px-4">Tanggal Dibuat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Memuat kategori...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {search ? 'Tidak ada kategori yang cocok dengan pencarian' : 'Belum ada kategori blog dibuat'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const postCount = c._count?.posts || 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <code className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          {c.slug}
                        </code>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {postCount} Artikel
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name, postCount)}
                            disabled={deletingId === c.id}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus Kategori"
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingId ? 'Edit Kategori Blog' : 'Tambah Kategori Blog Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Contoh: Berita Desa, Tips Pertanian, Pengumuman"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Slug URL
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="berita-desa"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Format slug otomatis dari nama (hanya huruf kecil dan tanda minus).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-blue-500/20"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
