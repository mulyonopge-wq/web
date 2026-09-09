import React from 'react';
import prisma from '@/lib/prisma';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteSettings, navigationItems] = await Promise.all([
    prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    }),
    prisma.navigation.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header siteSettings={siteSettings} navigationItems={navigationItems} />
      <main className="flex-1">{children}</main>
      <Footer siteSettings={siteSettings} navigationItems={navigationItems} />
    </div>
  );
}
