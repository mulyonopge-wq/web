import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDesc || undefined,
  };
}

export default async function DynamicCustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Don't intercept specific paths
  const reserved = ['company', 'products', 'categories', 'contact', 'cart', 'checkout', 'order', 'blog', 'admin', 'search'];
  if (reserved.includes(slug)) {
    notFound();
  }

  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="border-b border-slate-200/80 pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        <p className="text-xs text-slate-400">
          Terakhir diperbarui: {new Date(page.updatedAt).toLocaleDateString('id-ID')}
        </p>
      </div>

      {page.featuredImage && (
        <div className="rounded-3xl overflow-hidden shadow-lg aspect-16/9 bg-slate-100">
          <img src={page.featuredImage} alt={page.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Render HTML content safely */}
      <div
        className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
