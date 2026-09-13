'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  Save,
  Loader2,
  Plus,
  Trash2,
  Users,
  Award,
  ShieldCheck,
  Target,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
  MapPin,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { CompanyTitlesConfig, defaultCompanyTitles } from '@/lib/companyTitlesTypes';

export default function CompanyProfileCmsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content form
  const [form, setForm] = useState({
    history: '',
    vision: '',
    mission: '',
    values: [] as { title: string; desc: string }[],
    advantages: [] as { title: string; desc: string }[],
    team: [] as { name: string; role: string; avatar: string }[],
    certifications: [] as string[],
    legalities: [] as { label: string; value: string }[],
  });

  // Card & Section Titles configuration
  const [cardTitles, setCardTitles] = useState<CompanyTitlesConfig>(defaultCompanyTitles);

  // Media picker target: 'team-{idx}' | 'historyImage' | null
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setForm({
            history: data.profile.history || '',
            vision: data.profile.vision || '',
            mission: data.profile.mission || '',
            values: data.profile.valuesJson ? JSON.parse(data.profile.valuesJson) : [],
            advantages: data.profile.advantagesJson ? JSON.parse(data.profile.advantagesJson) : [],
            team: data.profile.teamJson ? JSON.parse(data.profile.teamJson) : [],
            certifications: data.profile.certificationsJson ? JSON.parse(data.profile.certificationsJson) : [],
            legalities: data.profile.legalitiesJson ? JSON.parse(data.profile.legalitiesJson) : [],
          });
        }
        if (data.cardTitles) {
          setCardTitles({
            ...defaultCompanyTitles,
            ...data.cardTitles,
          });
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error('Gagal memuat profil perusahaan');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: form.history,
          vision: form.vision,
          mission: form.mission,
          valuesJson: form.values,
          advantagesJson: form.advantages,
          teamJson: form.team,
          certificationsJson: form.certifications,
          legalitiesJson: form.legalities,
          cardTitles,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Profil perusahaan dan judul card berhasil disimpan!');
      } else {
        toast.error(data.error || 'Gagal menyimpan profil');
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
        <span>Memuat profil perusahaan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-6 h-6 text-blue-600" />
            <span>CMS Profil Perusahaan</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola judul card, badge, narasi sejarah, visi misi, foto, tim pimpinan, dan legalitas pada{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/company</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/company"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Halaman Publik</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: HEADER BANNER CARD (Official Company Profile) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              1. Header Banner Atas (Official Company Profile)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teks Badge Atas
              </label>
              <input
                type="text"
                value={cardTitles.headerBadge}
                onChange={(e) => setCardTitles({ ...cardTitles, headerBadge: e.target.value })}
                placeholder="Official Company Profile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Badge kuning di bagian atas banner.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Banner (Opsional)
              </label>
              <input
                type="text"
                value={cardTitles.headerTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, headerTitle: e.target.value })}
                placeholder="Kosongkan jika pakai nama toko/perusahaan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Jika dikosongkan, memakai Nama Perusahaan.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtitle Banner (Opsional)
              </label>
              <input
                type="text"
                value={cardTitles.headerSubtitle}
                onChange={(e) => setCardTitles({ ...cardTitles, headerSubtitle: e.target.value })}
                placeholder="Kosongkan jika pakai tagline profil"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Jika dikosongkan, memakai Tagline Perusahaan.</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: SEJARAH PERUSAHAAN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              2. Card Sejarah Perusahaan & Foto
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Badge Sejarah
              </label>
              <input
                type="text"
                value={cardTitles.historyBadge}
                onChange={(e) => setCardTitles({ ...cardTitles, historyBadge: e.target.value })}
                placeholder="Sejarah Perusahaan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Utama Card Sejarah
              </label>
              <input
                type="text"
                value={cardTitles.historyTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, historyTitle: e.target.value })}
                placeholder="Tumbuh dan Berinovasi Bersama Mitra di Seluruh Indonesia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Narasi / Cerita Sejarah
            </label>
            <textarea
              rows={4}
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              placeholder="Ceritakan latar belakang pendirian, tonggak pencapaian, dan perjalanan perusahaan..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Foto Sejarah / Kantor */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Foto Sejarah / Gedung Kantor
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-32 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                <img
                  src={cardTitles.historyImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'}
                  alt="Preview Sejarah"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cardTitles.historyImage}
                    onChange={(e) => setCardTitles({ ...cardTitles, historyImage: e.target.value })}
                    placeholder="/uploads/... atau URL gambar"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget('historyImage')}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Pilih Foto</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Foto yang tampil di samping narasi sejarah perusahaan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: VISI & MISI CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Target className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">3. Card Visi Perusahaan</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Card Visi
              </label>
              <input
                type="text"
                value={cardTitles.visionTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, visionTitle: e.target.value })}
                placeholder="Visi Kami"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Isi Teks Visi
              </label>
              <textarea
                rows={4}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                placeholder="Tuliskan visi jangka panjang..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Misi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">4. Card Misi Perusahaan</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Card Misi
              </label>
              <input
                type="text"
                value={cardTitles.missionTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, missionTitle: e.target.value })}
                placeholder="Misi Kami"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Isi Teks Misi
              </label>
              <textarea
                rows={4}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                placeholder="1. Memberikan kepuasan maksimal...\n2. Mengedepankan integritas..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: NILAI-NILAI UTAMA PERUSAHAAN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-sm">5. Nilai-Nilai Utama Perusahaan</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  values: [...form.values, { title: '', desc: '' }],
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Nilai</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Section Nilai
              </label>
              <input
                type="text"
                value={cardTitles.valuesTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, valuesTitle: e.target.value })}
                placeholder="Nilai-Nilai Utama Perusahaan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtitle Section Nilai
              </label>
              <input
                type="text"
                value={cardTitles.valuesSubtitle}
                onChange={(e) => setCardTitles({ ...cardTitles, valuesSubtitle: e.target.value })}
                placeholder="Fondasi dasar integritas dan keunggulan pelayanan kami..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* List Nilai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {form.values.map((val, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.values.filter((_, i) => i !== idx);
                    setForm({ ...form, values: updated });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  placeholder="Judul Nilai (misal: Integritas)"
                  value={typeof val === 'string' ? val : val.title}
                  onChange={(e) => {
                    const updated = [...form.values];
                    if (typeof updated[idx] === 'string') {
                      updated[idx] = { title: e.target.value, desc: '' };
                    } else {
                      updated[idx].title = e.target.value;
                    }
                    setForm({ ...form, values: updated });
                  }}
                  className="w-5/6 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Deskripsi singkat (opsional)"
                  value={typeof val === 'string' ? '' : val.desc || ''}
                  onChange={(e) => {
                    const updated = [...form.values];
                    if (typeof updated[idx] === 'string') {
                      updated[idx] = { title: updated[idx] as any, desc: e.target.value };
                    } else {
                      updated[idx].desc = e.target.value;
                    }
                    setForm({ ...form, values: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: TIM MANAJEMEN & PIMPINAN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">6. Tim Manajemen & Pimpinan</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  team: [...form.team, { name: '', role: '', avatar: '' }],
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anggota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Section Tim
              </label>
              <input
                type="text"
                value={cardTitles.teamTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, teamTitle: e.target.value })}
                placeholder="Tim Manajemen & Pimpinan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtitle Section Tim
              </label>
              <input
                type="text"
                value={cardTitles.teamSubtitle}
                onChange={(e) => setCardTitles({ ...cardTitles, teamSubtitle: e.target.value })}
                placeholder="Profesional berdedikasi tinggi di balik perkembangan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {form.team.map((member, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.team.filter((_, i) => i !== idx);
                    setForm({ ...form, team: updated });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...form.team];
                      updated[idx].name = e.target.value;
                      setForm({ ...form, team: updated });
                    }}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jabatan / Posisi</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => {
                      const updated = [...form.team];
                      updated[idx].role = e.target.value;
                      setForm({ ...form, team: updated });
                    }}
                    placeholder="Contoh: Direktur Utama"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Foto Avatar</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={member.avatar}
                      onChange={(e) => {
                        const updated = [...form.team];
                        updated[idx].avatar = e.target.value;
                        setForm({ ...form, team: updated });
                      }}
                      placeholder="URL Foto"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget(`team-${idx}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 bg-white"
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 6: SERTIFIKASI & LEGALITAS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sertifikasi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">7. Sertifikasi & Mutu</h3>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, certifications: [...form.certifications, ''] })}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                + Tambah
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Badge Sertifikasi</label>
              <input
                type="text"
                value={cardTitles.certBadge}
                onChange={(e) => setCardTitles({ ...cardTitles, certBadge: e.target.value })}
                placeholder="Sertifikasi & Standar Mutu"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs mb-3"
              />

              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Judul Sertifikasi</label>
              <input
                type="text"
                value={cardTitles.certTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, certTitle: e.target.value })}
                placeholder="Jaminan Kualitas Bertaraf Nasional"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-2 pt-2">
              {form.certifications.map((cert, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => {
                      const updated = [...form.certifications];
                      updated[idx] = e.target.value;
                      setForm({ ...form, certifications: updated });
                    }}
                    placeholder="Nama sertifikat / standar mutu"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.certifications.filter((_, i) => i !== idx);
                      setForm({ ...form, certifications: updated });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Legalitas */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">8. Legalitas Perusahaan</h3>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, legalities: [...form.legalities, { label: '', value: '' }] })}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                + Tambah
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Badge Legalitas</label>
              <input
                type="text"
                value={cardTitles.legalBadge}
                onChange={(e) => setCardTitles({ ...cardTitles, legalBadge: e.target.value })}
                placeholder="Legalitas Resmi Perusahaan"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs mb-3"
              />

              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Judul Legalitas</label>
              <input
                type="text"
                value={cardTitles.legalTitle}
                onChange={(e) => setCardTitles({ ...cardTitles, legalTitle: e.target.value })}
                placeholder="Terdaftar Resmi Berpayung Hukum"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-2 pt-2">
              {form.legalities.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label (NIB, NPWP)"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...form.legalities];
                      updated[idx].label = e.target.value;
                      setForm({ ...form, legalities: updated });
                    }}
                    className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nomor SK / Izin"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...form.legalities];
                      updated[idx].value = e.target.value;
                      setForm({ ...form, legalities: updated });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.legalities.filter((_, i) => i !== idx);
                      setForm({ ...form, legalities: updated });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 7: LOKASI KANTOR */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-sm">9. Card Lokasi Kantor & Maps</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Card Lokasi
            </label>
            <input
              type="text"
              value={cardTitles.locationTitle}
              onChange={(e) => setCardTitles({ ...cardTitles, locationTitle: e.target.value })}
              placeholder="Lokasi Kantor & Pusat Operasional"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Alamat fisik, nomor telepon, dan embed Google Maps dapat diedit di menu <strong>Pengaturan Umum Website</strong>.
            </p>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan Profil'}</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(url) => {
          if (mediaPickerTarget === 'historyImage') {
            setCardTitles({ ...cardTitles, historyImage: url });
          } else if (mediaPickerTarget && mediaPickerTarget.startsWith('team-')) {
            const idx = parseInt(mediaPickerTarget.replace('team-', ''), 10);
            if (!isNaN(idx) && form.team[idx]) {
              const updated = [...form.team];
              updated[idx].avatar = url;
              setForm({ ...form, team: updated });
            }
          }
        }}
        title="Pilih Gambar dari Media Library"
      />
    </div>
  );
}
