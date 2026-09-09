'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
  Search,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  siteSettings: {
    companyName: string;
    tagline: string;
    logoUrl?: string | null;
    whatsappNumber: string;
  };
  navigationItems: {
    id: string;
    label: string;
    url: string;
    target: string;
  }[];
}

export default function Header({ siteSettings, navigationItems }: HeaderProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean WhatsApp number
  const waNumber = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Company Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.companyName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-theme-primary text-white flex items-center justify-center font-bold text-lg shadow-md shadow-theme-primary/20 group-hover:scale-105 transition-transform">
                {siteSettings.companyName.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-theme-primary transition-colors">
                {siteSettings.companyName}
              </span>
              {siteSettings.tagline && (
                <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-1 hidden sm:block truncate max-w-xs">
                  {siteSettings.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-theme-primary bg-theme-primary/10 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search link */}
            <Link
              href="/products"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Cari Produk"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Shopping Cart with Badge */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-600 hover:text-theme-primary hover:bg-slate-100 rounded-xl transition-colors"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-theme-primary text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* WhatsApp Contact Button */}
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo ' + siteSettings.companyName + ', saya ingin bertanya mengenai produk dan layanan.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat WhatsApp</span>
              </a>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-theme-primary/10 text-theme-primary'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              );
            })}
          </nav>

          {waNumber && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi Cepat via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
