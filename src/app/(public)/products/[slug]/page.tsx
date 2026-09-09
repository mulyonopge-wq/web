import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import ProductCard from '@/components/public/ProductCard';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { order: 'asc' } },
      specs: { orderBy: { order: 'asc' } },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch related products from same category
  const [site, relatedProducts] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 'default' } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        categoryId: product.categoryId,
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
      take: 4,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb / Back */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Produk</span>
        </Link>
      </div>

      {/* Main Product Info (Client Component for interactive gallery and quantity) */}
      <ProductDetailClient
        product={product}
        whatsappNumber={site?.whatsappNumber || '6281234567890'}
        companyName={site?.companyName || 'Jangkriknet'}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Produk Terkait Lainnya
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Koleksi perlengkapan sejenis dari kategori {product.category?.name}
              </p>
            </div>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-bold text-theme-primary hover:underline"
            >
              Lihat Selengkapnya →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                whatsappNumber={site?.whatsappNumber || '6281234567890'}
                companyName={site?.companyName || 'Jangkriknet'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
