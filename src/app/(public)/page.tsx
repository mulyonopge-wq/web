import React from 'react';
import prisma from '@/lib/prisma';
import SectionRenderer from '@/components/public/SectionRenderer';

export const revalidate = 0; // Dynamic server rendering to always reflect CMS edits

export default async function HomePage() {
  const [
    siteSettings,
    sections,
    categories,
    featuredProducts,
    testimonials,
    faqs,
  ] = await Promise.all([
    prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    }),
    prisma.section.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 6,
    }),
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 8,
    }),
  ]);

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          siteSettings={siteSettings}
          categories={categories}
          featuredProducts={featuredProducts}
          testimonials={testimonials}
          faqs={faqs}
        />
      ))}
    </div>
  );
}
