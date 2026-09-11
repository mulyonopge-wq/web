import React from 'react';
import prisma from '@/lib/prisma';
import {
  Target,
  Sparkles,
  ShieldCheck,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
} from 'lucide-react';

import { getCompanyTitles } from '@/lib/companyTitles';
import { getValidMapsUrl } from '@/lib/maps';

export const revalidate = 0;

export default async function CompanyProfilePage() {
  const [site, profile, titles] = await Promise.all([
    prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    }),
    prisma.companyProfile.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    }),
    getCompanyTitles(),
  ]);

  let values: any[] = [];
  let advantages: any[] = [];
  let team: any[] = [];
  let certifications: string[] = [];
  let legalities: any[] = [];

  try {
    values = JSON.parse(profile.valuesJson || '[]');
    advantages = JSON.parse(profile.advantagesJson || '[]');
    team = JSON.parse(profile.teamJson || '[]');
    certifications = JSON.parse(profile.certificationsJson || '[]');
    legalities = JSON.parse(profile.legalitiesJson || '[]');
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-white/10 inline-block">
            {titles.headerBadge || 'Official Company Profile'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {titles.headerTitle || site.companyName}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {titles.headerSubtitle || site.tagline}
          </p>
        </div>
      </section>

      {/* History & Bio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-theme-primary font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>{titles.historyBadge || 'Sejarah Perusahaan'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {titles.historyTitle || 'Tumbuh dan Berinovasi Bersama Mitra di Seluruh Indonesia'}
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed space-y-4">
              <p>{profile.history}</p>
              <p>{site.aboutText}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-4/3 bg-slate-100">
              <img
                src={
                  titles.historyImage ||
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'
                }
                alt="Kantor Kami"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {titles.visionTitle || 'Visi Kami'}
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">{profile.vision}</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {titles.missionTitle || 'Misi Kami'}
            </h3>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {profile.mission}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Values */}
      {values.length > 0 && (
        <section className="bg-slate-50 py-16 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {titles.valuesTitle || 'Nilai-Nilai Utama Perusahaan'}
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                {titles.valuesSubtitle ||
                  'Fondasi dasar integritas dan keunggulan pelayanan kami kepada masyarakat'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-theme-primary/10 text-theme-primary font-bold flex items-center justify-center text-sm mb-4">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1.5">
                    {typeof v === 'string' ? v : v.title}
                  </h4>
                  {v.desc && <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Leadership */}
      {team.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {titles.teamTitle || 'Tim Manajemen & Pimpinan'}
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              {titles.teamSubtitle ||
                'Profesional berdedikasi tinggi di balik perkembangan dan kualitas produk kami'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((m: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={m.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-bold text-slate-900 text-base">{m.name}</h4>
                  <p className="text-xs text-theme-primary font-semibold mt-1">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Legalities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Certifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>{titles.certBadge || 'Sertifikasi & Standar Mutu'}</span>
              </div>
              <h3 className="text-2xl font-extrabold">
                {titles.certTitle || 'Jaminan Kualitas Bertaraf Nasional'}
              </h3>
              <ul className="space-y-3 pt-2">
                {certifications.map((cert: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legalities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{titles.legalBadge || 'Legalitas Resmi Perusahaan'}</span>
              </div>
              <h3 className="text-2xl font-extrabold">
                {titles.legalTitle || 'Terdaftar Resmi Berpayung Hukum'}
              </h3>
              <div className="space-y-3 pt-2">
                {legalities.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Embed & Office Location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-xs bg-white">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {titles.locationTitle || 'Lokasi Kantor & Pusat Operasional'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{site.address}, {site.city}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{site.phone}</span>
              </a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 text-slate-600 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>{site.email}</span>
              </a>
            </div>
          </div>

          <div className="w-full h-80 bg-slate-100">
            <iframe
              src={getValidMapsUrl(site.mapsEmbedUrl, site.address, site.city)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
