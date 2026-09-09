'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Copy,
  Plus,
  Save,
  Loader2,
  Sparkles,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

interface SectionItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  order: number;
  isActive: boolean;
}

const SECTION_TYPE_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  HERO: { label: 'Hero / Banner Utama', desc: 'Slider banner paling atas dengan tombol aksi CTA', icon: '🎯' },
  ABOUT: { label: 'Tentang Perusahaan', desc: 'Ringkasan profil dan misi perusahaan di beranda', icon: '🏢' },
  ADVANTAGES: { label: 'Keunggulan Perusahaan', desc: 'Kartu fitur keunggulan (kualitas, pengiriman, dll)', icon: '⭐' },
  FEATURED_PRODUCTS: { label: 'Produk Unggulan', desc: 'Grid katalog produk terlaris', icon: '🛍️' },
  CATEGORIES: { label: 'Kategori Pilihan', desc: 'Grid kategori produk dengan gambar', icon: '📂' },
  PROMO_BANNER: { label: 'Banner Promosi', desc: 'Banner promo lebar dengan penawaran khusus', icon: '🏷️' },
  STATS: { label: 'Statistik Pencapaian', desc: 'Angka statistik jumlah pelanggan & kepuasan', icon: '📊' },
  TESTIMONIALS: { label: 'Testimoni Pelanggan', desc: 'Ulasan asli dari pembeli & mitra', icon: '💬' },
  GALLERY: { label: 'Galeri Foto', desc: 'Foto dokumentasi kegiatan dan produk', icon: '🖼️' },
  FAQ: { label: 'FAQ Tanya Jawab', desc: 'Daftar pertanyaan dan jawaban umum', icon: '❓' },
  CTA: { label: 'Call to Action (CTA)', desc: 'Tombol ajakan konsultasi WhatsApp langsung', icon: '🚀' },
  CONTACT: { label: 'Info Kontak & Maps', desc: 'Lokasi Google Maps dan alamat kantor', icon: '📍' },
};

export default function HomepageBuilderPage() {
  const toast = useToast();
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit modal states
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    subtitle: string;
    contentObj: any;
  }>({ title: '', subtitle: '', contentObj: {} });

  // Media Picker state for image editing inside sections
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTargetKey, setMediaPickerTargetKey] = useState<string>('');

  // Add new section dropdown state
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat sections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, isActive: !currentStatus } : s
    );
    setSections(updated);

    try {
      await fetch('/api/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      toast.success(
        !currentStatus ? 'Section diaktifkan di homepage' : 'Section dinonaktifkan'
      );
    } catch (e) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);

    // Re-assign order indices
    const reordered = list.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setSections(reordered);

    try {
      await fetch('/api/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: reordered.map((s) => ({ id: s.id, order: s.order })),
        }),
      });
      toast.success('Urutan section berhasil diubah!');
    } catch (e) {
      toast.error('Gagal menyimpan urutan baru');
    }
  };

  const openEditModal = (sec: SectionItem) => {
    setEditingSection(sec);
    let parsed = {};
    try {
      parsed = sec.content ? JSON.parse(sec.content) : {};
    } catch (e) {
      parsed = {};
    }
    setEditForm({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      contentObj: parsed,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSection) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          title: editForm.title,
          subtitle: editForm.subtitle,
          content: editForm.contentObj,
        }),
      });
      if (res.ok) {
        toast.success('Section berhasil diperbarui!');
        setEditingSection(null);
        await fetchSections();
      } else {
        toast.error('Gagal memperbarui section');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (sec: SectionItem) => {
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sec.type,
          title: `${sec.title || 'Section'} (Duplikat)`,
          subtitle: sec.subtitle,
          content: sec.content,
          order: sections.length + 1,
          isActive: true,
        }),
      });
      if (res.ok) {
        toast.success('Section berhasil diduplikat!');
        await fetchSections();
      }
    } catch (e) {
      toast.error('Gagal menduplikasi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus section ini?')) return;
    try {
      const res = await fetch(`/api/sections?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Section berhasil dihapus!');
        await fetchSections();
      }
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const handleAddNew = async (type: string) => {
    setShowAddModal(false);
    const info = SECTION_TYPE_LABELS[type] || { label: 'Section Baru' };
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: info.label,
          subtitle: 'Keterangan section',
          content: {},
          order: sections.length + 1,
          isActive: true,
        }),
      });
      if (res.ok) {
        toast.success(`Section ${info.label} berhasil ditambahkan!`);
        await fetchSections();
      }
    } catch (e) {
      toast.error('Gagal menambahkan section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span>Memuat Homepage Builder...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Homepage Visual Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              CMS Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Atur urutan, aktifkan/nonaktifkan, dan ubah isi section halaman utama tanpa koding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Lihat Hasil Live</span>
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Section</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const typeMeta = SECTION_TYPE_LABELS[sec.type] || {
            label: sec.type,
            desc: '',
            icon: '📦',
          };
          return (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                sec.isActive
                  ? 'border-slate-200 hover:border-blue-300'
                  : 'border-slate-200/60 bg-slate-50/70 opacity-60'
              }`}
            >
              {/* Left: Reorder buttons & Icon & Info */}
              <div className="flex items-center gap-4">
                {/* Up/Down buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    title="Pindahkan Ke Atas"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    title="Pindahkan Ke Bawah"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Section icon badge */}
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  {typeMeta.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {sec.title || typeMeta.label}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {sec.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {sec.subtitle || typeMeta.desc}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(sec.id, sec.isActive)}
                  title={sec.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    sec.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {sec.isActive ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Nonaktif</span>
                    </>
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(sec)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  title="Edit Konten Section"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => handleDuplicate(sec)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  title="Duplikat Section"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(sec.id)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Edit Konten: {SECTION_TYPE_LABELS[editingSection.type]?.label || editingSection.type}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ubah judul, teks, gambar, dan tombol</p>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Judul Section (Heading)
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Sub-Judul / Keterangan Pendukung
                </label>
                <textarea
                  rows={2}
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic properties based on section type */}
              {editingSection.type === 'HERO' && (
                <div className="space-y-4 pt-3 border-t">
                  <h4 className="font-bold text-xs uppercase text-slate-500">Pengaturan Tombol & Media Hero</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Teks Tombol Utama</label>
                      <input
                        type="text"
                        value={editForm.contentObj.primaryBtnText || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, primaryBtnText: e.target.value },
                          })
                        }
                        placeholder="Belanja Sekarang"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Link Tombol Utama</label>
                      <input
                        type="text"
                        value={editForm.contentObj.primaryBtnLink || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, primaryBtnLink: e.target.value },
                          })
                        }
                        placeholder="/products"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Gambar Hero Banner</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editForm.contentObj.heroImageUrl || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, heroImageUrl: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTargetKey('heroImageUrl');
                          setMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50"
                      >
                        Pilih Media
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editingSection.type === 'ABOUT' && (
                <div className="space-y-4 pt-3 border-t">
                  <h4 className="font-bold text-xs uppercase text-slate-500">Teks & Tombol Halaman Profil</h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Deskripsi Narasi</label>
                    <textarea
                      rows={3}
                      value={editForm.contentObj.description || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contentObj: { ...editForm.contentObj, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Foto Ilustrasi</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editForm.contentObj.imageUrl || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, imageUrl: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTargetKey('imageUrl');
                          setMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50"
                      >
                        Pilih Media
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editingSection.type === 'CTA' && (
                <div className="space-y-4 pt-3 border-t">
                  <h4 className="font-bold text-xs uppercase text-slate-500">Tombol Aksi Call to Action</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Teks Tombol</label>
                      <input
                        type="text"
                        value={editForm.contentObj.primaryBtnText || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, primaryBtnText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Link WhatsApp / URL</label>
                      <input
                        type="text"
                        value={editForm.contentObj.primaryBtnLink || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contentObj: { ...editForm.contentObj, primaryBtnLink: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-bold text-slate-800 text-base">Pilih Tipe Section Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(SECTION_TYPE_LABELS).map(([typeKey, meta]) => (
                <button
                  key={typeKey}
                  onClick={() => handleAddNew(typeKey)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all group flex items-start gap-3"
                >
                  <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600">
                      {meta.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {meta.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal for section images */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          if (mediaPickerTargetKey) {
            setEditForm({
              ...editForm,
              contentObj: { ...editForm.contentObj, [mediaPickerTargetKey]: url },
            });
          }
        }}
      />
    </div>
  );
}
