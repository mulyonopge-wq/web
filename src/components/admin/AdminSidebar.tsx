'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Palette,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
  Store,
  Layers,
  KeyRound,
  Settings,
  User as UserIcon,
  Server,
  Database,
  GitBranch,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch((e) => console.error(e));
  }, [pathname]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    website: true,
    appearance: false,
    content: false,
    products: true,
    orders: true,
    system: true,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isLinkActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">
                ADMIN PANEL
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block">
                Visual CMS & Store
              </span>
            </div>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Lihat Website Publik"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar text-sm">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isLinkActive('/admin') && pathname === '/admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* Group 1: Website CMS */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('website')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Website CMS
              </span>
              {openGroups.website ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.website && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/website"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/website'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Pengaturan Umum & SEO
                </Link>
                <Link
                  href="/admin/builder"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/builder'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>Homepage Builder</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                    Visual
                  </span>
                </Link>
                <Link
                  href="/admin/navigation"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/navigation'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Header & Menu Navigasi
                </Link>
                <Link
                  href="/admin/company"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/company'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Profil Perusahaan
                </Link>
              </div>
            )}
          </div>

          {/* Group 2: Appearance & Theme Customizer */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('appearance')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Appearance
              </span>
              {openGroups.appearance ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.appearance && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/appearance"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/appearance'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Theme & Colors
                </Link>
              </div>
            )}
          </div>

          {/* Group 3: Products & Toko Online */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('products')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                Katalog Produk
              </span>
              {openGroups.products ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.products && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/products"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/products'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Semua Produk
                </Link>
                <Link
                  href="/admin/products/new"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/products/new'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  + Tambah Produk
                </Link>
                <Link
                  href="/admin/categories"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/categories'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Kategori Produk
                </Link>
                <Link
                  href="/admin/products/banner"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/products/banner'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>Edit Card Katalog</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Card
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Group 4: Orders & Transactions */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('orders')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-rose-400" />
                Pesanan & Transaksi
              </span>
              {openGroups.orders ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.orders && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/orders"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/orders'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Daftar Pesanan
                </Link>
              </div>
            )}
          </div>

          {/* Group 5: Content & Marketing */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('content')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Konten & Halaman
              </span>
              {openGroups.content ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.content && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/pages"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/pages'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Halaman Statis (Page Builder)
                </Link>
                <Link
                  href="/admin/content/testimonials"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/content/testimonials'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Testimoni Pelanggan
                </Link>
                <Link
                  href="/admin/content/faqs"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/content/faqs'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  FAQ Tanya Jawab
                </Link>
                <Link
                  href="/admin/blog"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/blog'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Blog & Artikel
                </Link>
                <Link
                  href="/admin/blog/categories"
                  className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/blog/categories'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Kategori Blog
                </Link>
              </div>
            )}
          </div>

          {/* Group 6: Sistem & Server */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('system')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-teal-400" />
                Sistem & Server
              </span>
              {openGroups.system ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openGroups.system && (
              <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-800 ml-3">
                <Link
                  href="/admin/system/backup"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/system/backup'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    Backup & Restore
                  </span>
                </Link>
                <Link
                  href="/admin/system/update"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/system/update'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-orange-400" />
                    Update dari GitHub
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Media Library */}
          <div className="pt-2">
            <Link
              href="/admin/media"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                pathname === '/admin/media'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Media Library</span>
            </Link>
          </div>

          {/* Pengaturan Akun & Password */}
          <div className="pt-2">
            <Link
              href="/admin/profile"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                pathname === '/admin/profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Akun & Password</span>
            </Link>
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 group overflow-hidden flex-1 mr-2"
              title="Edit Username & Password Admin"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center font-bold text-white text-xs transition-colors flex-shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white group-hover:text-blue-400 truncate transition-colors">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@example.com'}
                </p>
              </div>
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin/login';
              }}
              title="Keluar / Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
