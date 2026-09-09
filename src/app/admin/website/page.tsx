'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Globe,
  Phone,
  MessageSquare,
  Share2,
  Search,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function WebsiteSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'whatsapp' | 'social' | 'footer' | 'seo'>('general');

  // Media picker states
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | 'ogImage' | null>(null);

  const [form, setForm] = useState({
    companyName: '',
    tagline: '',
    logoUrl: '',
    faviconUrl: '',
    shortDescription: '',
    aboutText: '',
    address: '',
    city: '',
    phone: '',
    whatsappNumber: '',
    whatsappTemplate: '',
    email: '',
    mapsEmbedUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    footerText: '',
    copyrightText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImageUrl: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.site) {
          setForm({
            companyName: data.site.companyName || '',
            tagline: data.site.tagline || '',
            logoUrl: data.site.logoUrl || '',
            faviconUrl: data.site.faviconUrl || '',
            shortDescription: data.site.shortDescription || '',
            aboutText: data.site.aboutText || '',
            address: data.site.address || '',
            city: data.site.city || '',
            phone: data.site.phone || '',
            whatsappNumber: data.site.whatsappNumber || '',
            whatsappTemplate: data.site.whatsappTemplate || '',
            email: data.site.email || '',
            mapsEmbedUrl: data.site.mapsEmbedUrl || '',
            facebookUrl: data.site.facebookUrl || '',
            instagramUrl: data.site.instagramUrl || '',
            tiktokUrl: data.site.tiktokUrl || '',
            youtubeUrl: data.site.youtubeUrl || '',
            linkedinUrl: data.site.linkedinUrl || '',
            footerText: data.site.footerText || '',
            copyrightText: data.site.copyrightText || '',
            metaTitle: data.site.metaTitle || '',
            metaDescription: data.site.metaDescription || '',
            metaKeywords: data.site.metaKeywords || '',
            ogImageUrl: data.site.ogImageUrl || '',
          });
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error('Gagal memuat pengaturan');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: form }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Pengaturan website berhasil disimpan!');
      } else {
        toast.error(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span>Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Pengaturan Website & Identitas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ubah nama perusahaan, kontak, template WhatsApp, footer, dan SEO secara real-time
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-xs">
        {[
          { key: 'general', label: 'Umum & Identitas', icon: Building2 },
          { key: 'contact', label: 'Kontak & Alamat', icon: Phone },
          { key: 'whatsapp', label: 'Template WhatsApp', icon: MessageSquare },
          { key: 'social', label: 'Sosial Media', icon: Share2 },
          { key: 'footer', label: 'Footer & Legalitas', icon: Globe },
          { key: 'seo', label: 'SEO & Meta Tag', icon: Search },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Identitas Perusahaan / Toko</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Perusahaan / Toko *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Jangkriknet"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nama ini akan otomatis tampil di seluruh header, judul website, footer, dan pesan WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tagline / Slogan
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="Solusi Jaringan & Produk Digital Terpercaya"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Logo Website
                </label>
                <div className="flex items-center gap-4">
                  {form.logoUrl ? (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-center">
                      <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      name="logoUrl"
                      value={form.logoUrl}
                      onChange={handleChange}
                      placeholder="URL Logo atau Pilih Media"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('logo')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Pilih dari Media Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Favicon URL
                </label>
                <div className="flex items-center gap-4">
                  {form.faviconUrl ? (
                    <div className="w-12 h-12 rounded-xl border border-slate-200 p-1.5 bg-slate-50 flex items-center justify-center">
                      <img src={form.faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5 opacity-40" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      name="faviconUrl"
                      value={form.faviconUrl}
                      onChange={handleChange}
                      placeholder="URL Icon Tab Browser (PNG/ICO)"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('favicon')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Pilih dari Media Library
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Deskripsi Singkat Perusahaan
              </label>
              <textarea
                name="shortDescription"
                rows={3}
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Deskripsi singkat yang tampil di header / profil singkat"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Informasi Kontak & Lokasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor WhatsApp Utama *
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  required
                  placeholder="6281234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Format angka internasional tanpa tanda tambah atau spasi (contoh: 6281234567890).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@perusahaan.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor Telepon Kantor
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+62 21 555 1234"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kota / Wilayah
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Jakarta Pusat"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Alamat Kantor Lengkap
              </label>
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Jl. Merdeka Raya No. 45, Jakarta Pusat"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Google Maps Embed URL (iframe src)
              </label>
              <input
                type="text"
                name="mapsEmbedUrl"
                value={form.mapsEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Template */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 border-b pb-3">
                Kustomisasi Pesan Order WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Atur susunan pesan yang otomatis dibuat ketika pelanggan melakukan checkout WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Template Format Pesan
              </label>
              <textarea
                name="whatsappTemplate"
                rows={10}
                value={form.whatsappTemplate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="mt-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                <p className="font-semibold">Tag Variabel yang Tersedia:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <span><code>[NAMA TOKO]</code> = Nama Perusahaan</span>
                  <span><code>[PRODUK]</code> = Daftar item & qty</span>
                  <span><code>[TOTAL]</code> = Total harga Rupiah</span>
                  <span><code>[NAMA]</code> = Nama pembeli</span>
                  <span><code>[ALAMAT]</code> = Alamat pengiriman</span>
                  <span><code>[CATATAN]</code> = Catatan pembeli</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Social Media */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Akun Sosial Media Perusahaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={form.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  name="tiktokUrl"
                  value={form.tiktokUrl}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Facebook Page
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={form.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/page"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  YouTube Channel
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={form.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@channel"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/nama"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Footer */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Footer Website</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Teks Ringkasan Footer
              </label>
              <textarea
                name="footerText"
                rows={3}
                value={form.footerText}
                onChange={handleChange}
                placeholder="Teks ringkasan di bawah logo footer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Teks Hak Cipta (Copyright)
              </label>
              <input
                type="text"
                name="copyrightText"
                value={form.copyrightText}
                onChange={handleChange}
                placeholder="© 2026 Jangkriknet. All Rights Reserved."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 6: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">Pengaturan SEO Global</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Meta Title (Judul Tab Browser Default)
              </label>
              <input
                type="text"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                placeholder="Jangkriknet - Toko Jaringan & Official Company Profile"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                rows={3}
                value={form.metaDescription}
                onChange={handleChange}
                placeholder="Deskripsi untuk mesin pencari Google..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={form.metaKeywords}
                onChange={handleChange}
                placeholder="toko online, router wifi, cctv, switch, jakarta"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Open Graph Social Share Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="ogImageUrl"
                  value={form.ogImageUrl}
                  onChange={handleChange}
                  placeholder="URL gambar yang muncul saat link website dibagikan ke WhatsApp / Facebook"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget('ogImage')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Pilih Media
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Submit */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(url) => {
          if (pickerTarget === 'logo') setForm({ ...form, logoUrl: url });
          if (pickerTarget === 'favicon') setForm({ ...form, faviconUrl: url });
          if (pickerTarget === 'ogImage') setForm({ ...form, ogImageUrl: url });
        }}
      />
    </div>
  );
}
