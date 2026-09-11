'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  FolderTree,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function BlogAdminPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    isPublished: true,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      toast.error('Gagal memuat artikel blog');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      summary: '',
      content: '',
      featuredImage: '',
      categoryId: categories[0]?.id || '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      summary: p.summary || '',
      content: p.content,
      featuredImage: p.featuredImage || '',
      categoryId: p.categoryId || '',
      isPublished: p.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/blog/${editingId}` : '/api/blog';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? 'Artikel diperbarui!' : 'Artikel baru berhasil diterbitkan!');
        setModalOpen(false);
        await fetchPosts();
      } else {
        toast.error(data.error || 'Gagal menyimpan');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Artikel berhasil dihapus!');
        await fetchPosts();
      }
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const handleQuickAddCategory = async () => {
    const name = window.prompt('Masukkan nama kategori baru:');
    if (!name || !name.trim()) return;
    try {
      const res = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.category) {
        toast.success(`Kategori "${data.category.name}" berhasil ditambahkan!`);
        setCategories((prev) => [...prev, data.category]);
        setForm((prev) => ({ ...prev, categoryId: data.category.id }));
      } else {
        toast.error(data.error || 'Gagal menambahkan kategori');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Blog & Artikel
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Publikasikan tips teknologi, berita perusahaan, dan panduan untuk pengunjung
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/blog/categories"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-purple-600" />
            <span>Kelola Kategori</span>
            {categories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                {categories.length}
              </span>
            )}
          </Link>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="aspect-video bg-slate-100 relative">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-blue-700 backdrop-blur-xs">
                    {post.category.name}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {post.summary || post.content}
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {new Date(post.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => openEdit(post)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingId ? 'Edit Artikel' : 'Tulis Artikel Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="5 Tips Memilih Router WiFi untuk Kantor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Slug URL</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="tips-memilih-router"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider">Kategori</label>
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      + Kategori Baru
                    </button>
                  </div>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Ringkasan Singkat</label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Ringkasan singkat yang tampil di kartu blog..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Konten Lengkap</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tulis artikel lengkap di sini..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Foto Sampul (Featured Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.featuredImage}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                    placeholder="URL Gambar atau pilih dari Media"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-xl border border-slate-200 font-medium hover:bg-slate-50"
                  >
                    Pilih Media
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Simpan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setForm({ ...form, featuredImage: url })}
      />
    </div>
  );
}
