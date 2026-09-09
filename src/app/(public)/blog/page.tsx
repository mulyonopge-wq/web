import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Calendar, User, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-primary px-3 py-1 rounded-full bg-theme-primary/10 inline-block">
          Blog & Wawasan Teknologi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Artikel, Tips & Informasi Terkini
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Dapatkan panduan seputar konfigurasi jaringan, teknologi nirkabel, dan perangkat mutakhir
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-3xl border border-slate-200/80 hover:border-theme-primary/40 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <Link href={`/blog/${post.slug}`} className="block aspect-video bg-slate-100 overflow-hidden relative">
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-10 h-10 opacity-40" />
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 text-theme-primary backdrop-blur-xs shadow-xs">
                    {post.category.name}
                  </span>
                )}
              </Link>

              <div className="p-6">
                <div className="flex items-center gap-3 text-slate-400 text-[11px] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`} className="group-hover:text-theme-primary transition-colors block">
                  <h2 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug mb-2">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {post.summary || post.content}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-primary hover:underline"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
