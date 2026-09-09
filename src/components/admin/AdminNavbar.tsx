'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, Bell, KeyRound } from 'lucide-react';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export default function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();

  // Generate friendly breadcrumb from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Admin', href: '/admin' }];

    let currentHref = '';
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      currentHref += `/${seg}`;
      const labelMap: Record<string, string> = {
        website: 'Website CMS',
        appearance: 'Appearance & Tema',
        builder: 'Visual Builder',
        navigation: 'Menu Navigasi',
        company: 'Profil Perusahaan',
        products: 'Produk',
        new: 'Tambah Baru',
        categories: 'Kategori',
        orders: 'Pesanan',
        pages: 'Halaman',
        content: 'Konten',
        testimonials: 'Testimoni',
        faqs: 'FAQ',
        blog: 'Blog & Artikel',
        media: 'Media Library',
        profile: 'Pengaturan Akun & Password',
      };
      crumbs.push({
        label: labelMap[seg] || seg,
        href: `/admin${currentHref}`,
      });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              <Link
                href={crumb.href}
                className={
                  idx === breadcrumbs.length - 1
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-700 transition-colors'
                }
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/profile"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span>Ganti Password</span>
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
        >
          <span>Lihat Toko Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}
