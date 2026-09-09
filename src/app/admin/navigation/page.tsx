'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Loader2,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parentId: string | null;
  target: string;
  isActive: boolean;
}

export default function NavigationCmsPage() {
  const toast = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    url: '',
    target: '_self',
    isActive: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/navigation');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat menu navigasi');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ label: '', url: '/', target: '_self', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (item: NavItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      target: item.target,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch('/api/navigation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (res.ok) {
          toast.success('Menu navigasi diperbarui!');
        }
      } else {
        const res = await fetch('/api/navigation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, order: items.length + 1 }),
        });
        if (res.ok) {
          toast.success('Menu baru berhasil ditambahkan!');
        }
      }
      setModalOpen(false);
      await fetchItems();
    } catch (e) {
      toast.error('Gagal menyimpan menu');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    const list = [...items];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);

    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);

    try {
      await fetch('/api/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((i) => ({ id: i.id, order: i.order })),
        }),
      });
      toast.success('Urutan menu berhasil diubah!');
    } catch (e) {
      toast.error('Gagal menyimpan urutan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item menu ini dari header & navigasi?')) return;
    try {
      const res = await fetch(`/api/navigation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Menu berhasil dihapus!');
        await fetchItems();
      }
    } catch (e) {
      toast.error('Gagal menghapus menu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span>Memuat menu navigasi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Header & Menu Navigasi CMS
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Atur tautan menu header publik, urutan susunan, dan target link
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded disabled:opacity-20"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === items.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded disabled:opacity-20"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                  <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {item.url}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Urutan #{item.order}</span>
                  <span>•</span>
                  <span>Target: {item.target === '_blank' ? 'Tab Baru (_blank)' : 'Sama (_self)'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="Edit Menu"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus Menu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-slate-800 text-base mb-4">
              {editingId ? 'Edit Menu Navigasi' : 'Tambah Menu Navigasi Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Menu (Label) *
                </label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Contoh: Promo Spesial"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  URL Tujuan *
                </label>
                <input
                  type="text"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="/products atau https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Tautan
                </label>
                <select
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  <option value="_self">Buka di Halaman yang Sama (_self)</option>
                  <option value="_blank">Buka di Tab Baru (_blank)</option>
                </select>
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
                  {saving ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
