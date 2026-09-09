'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  RotateCcw,
  Save,
  Check,
  Eye,
  Type,
  Layout,
  Sliders,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const DEFAULT_THEME = {
  primaryColor: '#1d4ed8',
  secondaryColor: '#475569',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  borderRadius: 'rounded-lg',
  buttonStyle: 'solid',
  layout: 'full',
  headerStyle: 'modern',
};

const PRESET_PALETTES = [
  { name: 'Corporate Blue', primary: '#1d4ed8', secondary: '#475569', accent: '#f59e0b' },
  { name: 'Emerald Forest', primary: '#059669', secondary: '#334155', accent: '#d97706' },
  { name: 'Royal Indigo', primary: '#4f46e5', secondary: '#475569', accent: '#ec4899' },
  { name: 'Crimson Modern', primary: '#e11d48', secondary: '#1e293b', accent: '#f97316' },
  { name: 'Deep Midnight', primary: '#0f172a', secondary: '#64748b', accent: '#3b82f6' },
];

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Plus Jakarta Sans',
  'Outfit',
  'Montserrat',
  'Open Sans',
];

const RADIUS_OPTIONS = [
  { label: 'Square (0px)', value: 'rounded-none' },
  { label: 'Small (2px)', value: 'rounded-sm' },
  { label: 'Medium (6px)', value: 'rounded-md' },
  { label: 'Large (8px)', value: 'rounded-lg' },
  { label: 'Full / Pill', value: 'rounded-full' },
];

export default function ThemeCustomizerPage() {
  const toast = useToast();
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.theme) {
          setTheme({
            primaryColor: data.theme.primaryColor || DEFAULT_THEME.primaryColor,
            secondaryColor: data.theme.secondaryColor || DEFAULT_THEME.secondaryColor,
            accentColor: data.theme.accentColor || DEFAULT_THEME.accentColor,
            backgroundColor: data.theme.backgroundColor || DEFAULT_THEME.backgroundColor,
            textColor: data.theme.textColor || DEFAULT_THEME.textColor,
            headingFont: data.theme.headingFont || DEFAULT_THEME.headingFont,
            bodyFont: data.theme.bodyFont || DEFAULT_THEME.bodyFont,
            borderRadius: data.theme.borderRadius || DEFAULT_THEME.borderRadius,
            buttonStyle: data.theme.buttonStyle || DEFAULT_THEME.buttonStyle,
            layout: data.theme.layout || DEFAULT_THEME.layout,
            headerStyle: data.theme.headerStyle || DEFAULT_THEME.headerStyle,
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Tema berhasil disimpan dan diterapkan ke seluruh website!');
      } else {
        toast.error('Gagal menyimpan tema');
      }
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan tema ke pengaturan awal default?')) {
      setTheme(DEFAULT_THEME);
      toast.info('Tema dikembalikan ke default. Klik [Simpan Perubahan] untuk menerapkan.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span>Memuat tema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Theme Customizer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sesuaikan palet warna, tipografi, gaya tombol, dan tata letak dengan Live Preview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Theme</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Palettes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Preset Palet Warna Siap Pakai
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setTheme({
                      ...theme,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent,
                    })
                  }
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 text-left transition-all hover:shadow-xs group"
                >
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 mb-2 truncate">
                    {preset.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Kustomisasi Warna (Color Palette)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Color (Warna Utama & Tombol)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Secondary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Secondary Color (Warna Pendukung)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Accent */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accent Color (Warna Aksen / Diskon)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Shape */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Tipografi, Border Radius & Tombol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Heading Font
                </label>
                <select
                  value={theme.headingFont}
                  onChange={(e) => setTheme({ ...theme, headingFont: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Body Font
                </label>
                <select
                  value={theme.bodyFont}
                  onChange={(e) => setTheme({ ...theme, bodyFont: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Border Radius Sudut (Corner Radius)
                </label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gaya Tombol (Button Style)
                </label>
                <select
                  value={theme.buttonStyle}
                  onChange={(e) => setTheme({ ...theme, buttonStyle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  <option value="solid">Solid (Warna Penuh)</option>
                  <option value="outline">Outline (Garis Tepi)</option>
                  <option value="rounded">Rounded Pill</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: LIVE PREVIEW WIDGET */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">Live Preview Real-time</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Live
              </span>
            </div>

            {/* Simulated mini page card */}
            <div
              className="p-5 border rounded-2xl transition-all shadow-inner space-y-4"
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: `'${theme.bodyFont}', sans-serif`,
              }}
            >
              {/* Header preview */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    J
                  </div>
                  <span
                    className="font-bold text-sm tracking-tight"
                    style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    Jangkriknet
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium opacity-75">
                  <span>Beranda</span>
                  <span>Produk</span>
                  <span>Kontak</span>
                </div>
              </div>

              {/* Hero Banner preview */}
              <div
                className="p-4 rounded-xl text-white space-y-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white inline-block"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Spesial Promo
                </span>
                <h4
                  className="text-base font-bold"
                  style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
                >
                  Konektivitas Cepat & Andal
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Perangkat jaringan orisinal terlengkap bergaransi resmi.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold ${theme.borderRadius} text-white shadow-xs`}
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Beli Sekarang
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold ${theme.borderRadius} bg-white/20 hover:bg-white/30 text-white`}
                  >
                    Pelajari
                  </button>
                </div>
              </div>

              {/* Sample Product Card preview */}
              <div className={`p-3 border rounded-xl bg-white text-slate-800 space-y-2.5 ${theme.borderRadius}`}>
                <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Foto Produk
                </div>
                <div>
                  <h5
                    className="text-xs font-bold truncate"
                    style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    WiFi 6 Dual Band Gigabit Router
                  </h5>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>
                      Rp 599.000
                    </span>
                    <span className="text-[10px] line-through text-slate-400">
                      Rp 680.000
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`w-full py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 ${theme.borderRadius}`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              Seluruh perubahan tema disimpan langsung ke database dan diterapkan otomatis pada pengunjung website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
