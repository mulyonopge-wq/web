'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save,
  RotateCcw,
  ExternalLink,
  Loader2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { defaultCatalogBanner, CatalogBannerConfig } from '@/lib/catalogBannerTypes';

export default function CatalogBannerEditorPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [form, setForm] = useState<CatalogBannerConfig>(defaultCatalogBanner);

  useEffect(() => {
    fetch('/api/catalog-banner')
      .then((res) => res.json())
      .then((data) => {
        if (data.banner) {
          setForm(data.banner);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error('Gagal memuat pengaturan card katalog');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/catalog-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Card header katalog berhasil disimpan!');
      } else {
        toast.error(data.error || 'Gagal menyimpan perubahan');
      }
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan teks dan tampilan card ke pengaturan default?')) {
      setForm(defaultCatalogBanner);
    }
  };

  // Background style helper for preview
  const getBgStyle = () => {
    switch (form.bgType) {
      case 'navy':
        return 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-blue-900/50';
      case 'emerald':
        return 'bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border-emerald-900/50';
      case 'purple':
        return 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border-purple-900/50';
      case 'custom':
        return 'bg-slate-900 relative border-slate-800 overflow-hidden';
      case 'dark':
      default:
        return 'bg-slate-900 border-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Memuat editor card katalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Produk</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-600" />
            <span>Editor Card Header Katalog</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kustomisasi badge, judul utama, deskripsi, dan latar card pada halaman{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/products</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/products"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Halaman Publik</span>
          </a>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Live Preview Tampilan Publik</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Perubahan teks dan gaya langsung terlihat di bawah ini
          </span>
        </div>

        <div className="p-4 sm:p-6 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
          <div
            className={`rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border transition-all duration-300 ${getBgStyle()}`}
          >
            {form.bgType === 'custom' && form.bgImageUrl && (
              <>
                <img
                  src={form.bgImageUrl}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent pointer-events-none" />
              </>
            )}

            <div className="space-y-2 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 inline-block">
                {form.badge || 'KATALOG PRODUK & TOKO ONLINE'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {form.title || 'Peralatan & Aksesoris Terlengkap'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {form.subtitle ||
                  'Temukan router, switch PoE, CCTV, kabel Cat8, dan berbagai perangkat mutakhir bergaransi resmi.'}
              </p>
            </div>

            {form.showCounter && (
              <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0 relative z-10">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  12
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {form.counterLabel || 'Produk Tersedia'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pengaturan Konten & Teks Card</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Teks Badge (Kecil di Atas)
            </label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="Contoh: KATALOG PRODUK & TOKO ONLINE"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Teks badge berwarna kuning di bagian paling atas card.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Judul Utama Card
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Peralatan & Aksesoris Terlengkap"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Judul berukuran besar yang menjadi fokus utama pengunjung.
            </p>
          </div>
        </div>

        {/* Subtitle / Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Deskripsi / Subtitle
          </label>
          <textarea
            rows={3}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Tuliskan deskripsi penawaran, jaminan mutu produk, atau instruksi untuk pembeli..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Penjelasan singkat di bawah judul. Disarankan 1-2 kalimat ringkas.
          </p>
        </div>

        {/* Counter Settings */}
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Pengaturan Counter Produk</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.showCounter}
                onChange={(e) => setForm({ ...form, showCounter: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Tampilkan Kotak Counter Total Produk di Sisi Kanan
              </span>
            </label>

            {form.showCounter && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Label Teks di Bawah Angka
                </label>
                <input
                  type="text"
                  value={form.counterLabel}
                  onChange={(e) => setForm({ ...form, counterLabel: e.target.value })}
                  placeholder="Contoh: Produk Tersedia"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Theme & Background Styles */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Tema Warna & Latar Card</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'dark', label: 'Dark Slate', class: 'bg-slate-900 border-slate-700' },
              { id: 'navy', label: 'Navy Blue', class: 'bg-gradient-to-r from-slate-950 to-blue-900 border-blue-800' },
              { id: 'emerald', label: 'Forest Emerald', class: 'bg-gradient-to-r from-slate-950 to-emerald-900 border-emerald-800' },
              { id: 'purple', label: 'Royal Violet', class: 'bg-gradient-to-r from-slate-950 to-purple-900 border-purple-800' },
              { id: 'custom', label: 'Custom Image', class: 'bg-slate-800 border-slate-600' },
            ].map((t) => {
              const isSelected = form.bgType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, bgType: t.id as any })}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    isSelected ? 'ring-2 ring-blue-600 border-transparent shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-10 rounded-xl ${t.class} flex items-center justify-center text-white text-xs`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {form.bgType === 'custom' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gambar Latar (Background Image)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.bgImageUrl || ''}
                  onChange={(e) => setForm({ ...form, bgImageUrl: e.target.value })}
                  placeholder="/uploads/nama-gambar.jpg atau URL gambar"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Pilih dari Media</span>
                </button>
                {form.bgImageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bgImageUrl: '' })}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus gambar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Default</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Perubahan Card</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setForm({ ...form, bgImageUrl: url })}
        title="Pilih Gambar Latar Card"
      />
    </div>
  );
}
