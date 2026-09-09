import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  ArrowUpRight,
} from 'lucide-react';

interface FooterProps {
  siteSettings: {
    companyName: string;
    tagline: string;
    logoUrl?: string | null;
    address: string;
    city: string;
    phone: string;
    email: string;
    whatsappNumber: string;
    footerText: string;
    copyrightText: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
  };
  navigationItems: {
    id: string;
    label: string;
    url: string;
  }[];
}

export default function Footer({ siteSettings, navigationItems }: FooterProps) {
  const waNumber = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {siteSettings.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.companyName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-theme-primary text-white flex items-center justify-center font-bold text-lg">
                  {siteSettings.companyName.charAt(0)}
                </div>
              )}
              <span className="font-extrabold text-white text-xl tracking-tight">
                {siteSettings.companyName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {siteSettings.footerText || siteSettings.tagline}
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-2">
              {siteSettings.instagramUrl && (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-theme-primary text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.facebookUrl && (
                <a
                  href={siteSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-theme-primary text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {siteSettings.youtubeUrl && (
                <a
                  href={siteSettings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-theme-primary text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {siteSettings.linkedinUrl && (
                <a
                  href={siteSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-theme-primary text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-xs">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" className="text-slate-400 hover:text-white transition-colors">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-blue-400 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Legal */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Informasi & Kebijakan
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/company" className="hover:text-white transition-colors">
                  Tentang Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Pusat Bantuan & Lokasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span>{siteSettings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span>{siteSettings.email}</span>
              </li>
              {waNumber && (
                <li className="pt-1">
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp: +{waNumber}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{siteSettings.copyrightText}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
