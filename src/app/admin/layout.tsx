'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [siteName, setSiteName] = useState('BUMDES');

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Load site settings to set browser title and favicon
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.site?.companyName) {
          setSiteName(data.site.companyName);
        }
        if (data.site?.faviconUrl) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.site.faviconUrl;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const pageMap: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/website': 'Pengaturan Website & SEO',
      '/admin/builder': 'Homepage Builder',
      '/admin/navigation': 'Menu Navigasi',
      '/admin/company': 'Profil Perusahaan',
      '/admin/appearance': 'Theme & Colors',
      '/admin/products': 'Katalog Semua Produk',
      '/admin/products/new': 'Tambah Produk Baru',
      '/admin/products/banner': 'Editor Card Katalog',
      '/admin/categories': 'Kategori Produk',
      '/admin/orders': 'Daftar Pesanan',
      '/admin/pages': 'Halaman Dinamis',
      '/admin/blog': 'Artikel & Berita',
      '/admin/blog/categories': 'Kategori Blog',
      '/admin/content/testimonials': 'Testimoni',
      '/admin/content/faqs': 'FAQ Tanya Jawab',
      '/admin/media': 'Media Library',
      '/admin/profile': 'Profil Akun',
      '/admin/system/backup': 'Backup & Restore',
      '/admin/system/update': 'Update Sistem',
    };

    const sectionName = pageMap[pathname] || 'Admin Panel';
    document.title = `${sectionName} | ${siteName}`;
  }, [pathname, siteName]);

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    // Verify session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
