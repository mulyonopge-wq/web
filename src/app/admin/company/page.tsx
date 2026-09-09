'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function CompanyProfileCmsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null);

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
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

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
        }),
      });
      if (res.ok) {
        toast.success('Profil perusahaan berhasil disimpan!');
      } else {
        toast.error('Gagal menyimpan profil');
      }
    } catch (e) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            CMS Profil Perusahaan (Company Profile)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola narasi sejarah, visi, misi, nilai perusahaan, pimpinan tim, dan legalitas resmi
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Sejarah & Narasi */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Sejarah Singkat & Perjalanan Bisnis</h3>
          </div>
          <textarea
            rows={4}
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
            placeholder="Ceritakan latar belakang pendirian perusahaan..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Section 2: Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b pb-3">
              <Target className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Visi Perusahaan</h3>
            </div>
            <textarea
              rows={3}
              value={form.vision}
              onChange={(e) => setForm({ ...form, vision: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">Misi Perusahaan</h3>
            </div>
            <textarea
              rows={3}
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Tim Pimpinan */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Tim Manajemen / Pimpinan</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.team.map((member, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
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
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
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
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
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
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setActivePickerIdx(idx)}
                      className="px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Legalitas & Izin Usaha */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Legalitas & Dokumen Resmi</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  legalities: [...form.legalities, { label: '', value: '' }],
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Legalitas</span>
            </button>
          </div>

          <div className="space-y-3">
            {form.legalities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Label Dokumen (contoh: NIB)"
                  value={item.label}
                  onChange={(e) => {
                    const updated = [...form.legalities];
                    updated[idx].label = e.target.value;
                    setForm({ ...form, legalities: updated });
                  }}
                  className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Nomor Izin / SK"
                  value={item.value}
                  onChange={(e) => {
                    const updated = [...form.legalities];
                    updated[idx].value = e.target.value;
                    setForm({ ...form, legalities: updated });
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.legalities.filter((_, i) => i !== idx);
                    setForm({ ...form, legalities: updated });
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>

      {/* Media picker for team avatar */}
      <MediaPickerModal
        isOpen={activePickerIdx !== null}
        onClose={() => setActivePickerIdx(null)}
        onSelect={(url) => {
          if (activePickerIdx !== null) {
            const updated = [...form.team];
            updated[activePickerIdx].avatar = url;
            setForm({ ...form, team: updated });
          }
        }}
      />
    </div>
  );
}
