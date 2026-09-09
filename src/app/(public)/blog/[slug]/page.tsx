import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

export const revalidate = 0;

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Artikel</span>
        </Link>

        {post.category && (
          <span className="text-xs font-bold uppercase tracking-wider text-theme-primary px-3 py-1 rounded-full bg-theme-primary/10 inline-block mb-3">
            {post.category.name}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 pb-6 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Ditulis oleh {post.author}
          </span>
        </div>
      </div>

      {post.featuredImage && (
        <div className="rounded-3xl overflow-hidden shadow-lg aspect-16/9 bg-slate-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
