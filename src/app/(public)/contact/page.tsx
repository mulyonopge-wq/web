import React from 'react';
import prisma from '@/lib/prisma';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';

export const revalidate = 0;

export default async function ContactPage() {
  const site = await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });

  const waNumber = site.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-white/10 inline-block">
            Pusat Informasi & Bantuan
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Hubungi Tim {site.companyName}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Kami siap melayani kebutuhan pengadaan, konsultasi teknis, dan dukungan purna jual Anda.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left 5 Cols: Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Saluran Komunikasi Resmi</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan hubungi kami melalui saluran berikut atau kunjungi langsung kantor pusat kami pada jam operasional kerja.
              </p>
            </div>

            <div className="space-y-5 text-sm">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Alamat Kantor</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">{site.address}, {site.city}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">WhatsApp Customer Service</h4>
                  <p className="text-slate-600 text-xs mt-1 font-mono">+{waNumber}</p>
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo ' + site.companyName + ', saya ingin bertanya mengenai layanan dan produk.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:underline mt-1.5 inline-block"
                    >
                      Buka Chat WhatsApp →
                    </a>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Telepon Kantor</h4>
                  <p className="text-slate-600 text-xs mt-1">{site.phone}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Resmi</h4>
                  <p className="text-slate-600 text-xs mt-1">{site.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Google Maps & Contact Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Map Frame */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Peta Lokasi Google Maps</h3>
                <span className="text-[11px] text-slate-400">{site.city}</span>
              </div>
              <div className="w-full h-96 bg-slate-100">
                <iframe
                  src={site.mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
