import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/public/ProductCard';
import ProductFilterBar from '@/components/public/ProductFilterBar';
import { Filter, Package } from 'lucide-react';

export const revalidate = 0;

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const categorySlug = resolvedParams.category || '';
  const sort = resolvedParams.sort || 'latest';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build filter query
  const where: any = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { shortDesc: { contains: search } },
      { sku: { contains: search } },
    ];
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

  const [site, categories, products, totalProducts] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { order: 'asc' },
    }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Katalog Produk & Toko Online
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Peralatan & Aksesoris Terlengkap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Temukan router, switch PoE, CCTV, kabel Cat6, dan berbagai perangkat mutakhir bergaransi resmi.
          </p>
        </div>

        {/* Live Counter */}
        <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0">
          <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {totalProducts}
          </span>
          <span className="text-xs text-slate-300 font-medium">Produk Tersedia</span>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <ProductFilterBar
        initialSearch={search}
        initialSort={sort}
        categorySlug={categorySlug}
      />

      {/* Main Content Layout (Sidebar Categories + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Categories */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-theme-primary" />
              <span>Kategori Produk</span>
            </h3>

            <div className="space-y-1 text-xs">
              <Link
                href={`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                  !categorySlug
                    ? 'bg-theme-primary text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Semua Kategori</span>
                <span className="text-[11px] opacity-75">{totalProducts}</span>
              </Link>

              {categories.map((cat) => {
                const isSelected = categorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                      isSelected
                        ? 'bg-theme-primary text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] opacity-75">{cat._count?.products || 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-9 space-y-8">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
              <Package className="w-12 h-12 mx-auto opacity-30" />
              <h3 className="font-bold text-slate-700 text-base">Tidak ada produk ditemukan</h3>
              <p className="text-xs max-w-sm mx-auto">
                Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold"
              >
                Reset Filter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  whatsappNumber={site?.whatsappNumber || '6281234567890'}
                  companyName={site?.companyName || 'Jangkriknet'}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === page;
                return (
                  <Link
                    key={pageNum}
                    href={`/products?page=${pageNum}${categorySlug ? `&category=${categorySlug}` : ''}${search ? `&search=${search}` : ''}${sort ? `&sort=${sort}` : ''}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/30'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
