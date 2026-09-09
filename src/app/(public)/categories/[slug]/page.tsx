import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/public/ProductCard';
import { ArrowLeft, Package } from 'lucide-react';

export const revalidate = 0;

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [category, site] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.siteSetting.findUnique({ where: { id: 'default' } }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Produk</span>
        </Link>
      </div>

      {/* Category Hero */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Kategori Produk
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-slate-300">{category.description}</p>
          )}
        </div>

        <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0">
          <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {category.products.length}
          </span>
          <span className="text-xs text-slate-300 font-medium">Item Ditemukan</span>
        </div>
      </div>

      {/* Products Grid */}
      {category.products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
          <Package className="w-12 h-12 mx-auto opacity-30" />
          <h3 className="font-bold text-slate-700 text-base">Belum ada produk di kategori ini</h3>
          <p className="text-xs max-w-sm mx-auto">
            Silakan kembali ke katalog utama untuk melihat produk lainnya.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold"
          >
            Lihat Semua Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              whatsappNumber={site?.whatsappNumber || '6281234567890'}
              companyName={site?.companyName || 'Jangkriknet'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
