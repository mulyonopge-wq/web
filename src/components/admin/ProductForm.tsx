'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  Star,
  Film,
  CheckCircle2,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { isVideoUrl } from '@/lib/media';

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Media picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery'>('main');

  const [form, setForm] = useState({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDesc: initialData?.shortDesc || '',
    longDesc: initialData?.longDesc || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    stock: initialData?.stock !== undefined ? initialData.stock : 10,
    weight: initialData?.weight || 500,
    dimensions: initialData?.dimensions || '',
    categoryId: initialData?.categoryId || '',
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    mainImage: initialData?.mainImage || '',
    seoTitle: initialData?.seoTitle || '',
    seoDesc: initialData?.seoDesc || '',
    specs: (initialData?.specs || []) as { key: string; value: string }[],
    images: (initialData?.images || []) as { imageUrl: string; isPrimary?: boolean; order?: number }[],
  });

  const [newMediaInput, setNewMediaInput] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (name: string, checked: boolean) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const addSpec = () => {
    setForm((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: '', value: '' }],
    }));
  };

  const updateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...form.specs];
    updated[idx][field] = val;
    setForm((prev) => ({ ...prev, specs: updated }));
  };

  const removeSpec = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== idx),
    }));
  };

  // Media gallery methods
  const addMediaUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const alreadyExists = prev.images.some((img) => img.imageUrl === trimmed);
      if (alreadyExists) return prev;
      const newImages = [...prev.images, { imageUrl: trimmed, order: prev.images.length + 1 }];
      // If no main image yet, set as main
      const newMain = !prev.mainImage ? trimmed : prev.mainImage;
      return {
        ...prev,
        images: newImages,
        mainImage: newMain,
      };
    });
    setNewMediaInput('');
  };

  const removeMedia = (index: number) => {
    setForm((prev) => {
      const removedItem = prev.images[index];
      const filtered = prev.images.filter((_, i) => i !== index);
      let newMain = prev.mainImage;
      if (removedItem.imageUrl === prev.mainImage) {
        newMain = filtered.length > 0 ? filtered[0].imageUrl : '';
      }
      return {
        ...prev,
        images: filtered,
        mainImage: newMain,
      };
    });
  };

  const setAsMainMedia = (url: string) => {
    setForm((prev) => ({
      ...prev,
      mainImage: url,
    }));
  };

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.images.length) return prev;
      const updated = [...prev.images];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return {
        ...prev,
        images: updated,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price) {
      toast.error('Nama, SKU, dan Harga wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.product)) {
        toast.success(productId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(data.error || 'Gagal menyimpan produk');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Produk</span>
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Produk'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info & Descriptions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Informasi Utama Produk</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nama Produk *
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Router WiFi 6 Gigabit AX3000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  SKU / Kode Barang *
                </label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="JK-RTR-01"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Slug URL (Otomatis jika kosong)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="router-wifi-6-ax3000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Deskripsi Singkat (Ringkasan di katalog)
              </label>
              <textarea
                name="shortDesc"
                rows={2}
                value={form.shortDesc}
                onChange={handleChange}
                placeholder="Deskripsi 1-2 kalimat untuk preview produk..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Deskripsi Lengkap & Keunggulan
              </label>
              <textarea
                name="longDesc"
                rows={7}
                value={form.longDesc}
                onChange={handleChange}
                placeholder="Rincian fitur lengkap, keunggulan teknis, dan kelengkapan box..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Specifications Builder */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Spesifikasi Teknis</h3>
              <button
                type="button"
                onClick={addSpec}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Spesifikasi</span>
              </button>
            </div>

            {form.specs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada spesifikasi. Klik tombol di atas untuk menambah rincian (misal: Garansi, Daya, Kecepatan).
              </p>
            ) : (
              <div className="space-y-3">
                {form.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nama Spek (mis: Garansi)"
                      value={spec.key}
                      onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                      className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Nilai Spek (mis: 1 Tahun Resmi)"
                      value={spec.value}
                      onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Pricing, Stock, Category & Media */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Harga & Stok</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Harga Normal (Rp) *
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={form.price}
                onChange={handleChange}
                placeholder="680000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Harga Diskon / Promo (Rp)
              </label>
              <input
                type="number"
                name="discountPrice"
                min={0}
                value={form.discountPrice}
                onChange={handleChange}
                placeholder="599000 (Kosongkan jika tidak promo)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-amber-600 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Stok</label>
                <input
                  type="number"
                  name="stock"
                  min={0}
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Berat (Gram)</label>
                <input
                  type="number"
                  name="weight"
                  min={0}
                  value={form.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Kategori & Visibilitas</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Kategori Produk
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => handleCheckbox('isFeatured', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  Jadikan Produk Unggulan di Homepage
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleCheckbox('isActive', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Status Aktif (Tampilkan di Katalog Publik)
                </span>
              </label>
            </div>
          </div>

          {/* Multi-Media Gallery (Foto & Video) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Media Produk (Foto & Video)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Dukung banyak foto & file video (.mp4, .webm)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerTarget('gallery');
                  setPickerOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pilih Media</span>
              </button>
            </div>

            {/* Quick URL Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMediaInput}
                onChange={(e) => setNewMediaInput(e.target.value)}
                placeholder="Tempel URL Foto atau Video..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMediaUrl(newMediaInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addMediaUrl(newMediaInput)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Tambah
              </button>
            </div>

            {/* Media Items List */}
            {form.images.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <div className="flex justify-center gap-2 text-slate-300">
                  <ImageIcon className="w-8 h-8" />
                  <VideoIcon className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Belum ada foto atau video produk</p>
                <p className="text-[11px] text-slate-400">
                  Klik "Pilih Media" untuk mengunggah dari komputer atau masukkan link URL
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.images.map((media, idx) => {
                  const isVid = isVideoUrl(media.imageUrl);
                  const isMain = form.mainImage === media.imageUrl;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        isMain
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Thumbnail / Video preview */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 relative border border-slate-200">
                        {isVid ? (
                          <div className="w-full h-full flex flex-col items-center justify-center relative">
                            <video
                              src={media.imageUrl}
                              className="w-full h-full object-cover opacity-75"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Film className="w-5 h-5 text-white drop-shadow" />
                            </div>
                            <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 text-[9px] font-bold bg-purple-600 text-white rounded">
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <img
                            src={media.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info & URL */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-bold text-slate-700 truncate">
                            {isVid ? 'File Video' : 'File Foto'} #{idx + 1}
                          </span>
                          {isMain && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Media Utama
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{media.imageUrl}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => setAsMainMedia(media.imageUrl)}
                            title="Jadikan Media Utama"
                            className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100/60 rounded-lg cursor-pointer transition-colors"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveMedia(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                            title="Geser Naik"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === form.images.length - 1}
                            onClick={() => moveMedia(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                            title="Geser Turun"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus media ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>

    {/* Media Picker Modal - Placed outside <form> so modal actions never trigger form submission */}
    <MediaPickerModal
      isOpen={pickerOpen}
      onClose={() => setPickerOpen(false)}
      onSelect={(url) => {
        addMediaUrl(url);
      }}
    />
  </>
);
}
