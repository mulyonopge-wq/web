import type { Metadata } from 'next';
import './globals.css';
import prisma from '@/lib/prisma';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/ui/Toast';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!site) {
      return {
        title: 'Jangkriknet - Official Store & Company Profile',
        description: 'Pusat belanja produk berkualitas dan company profile terpercaya.',
      };
    }
    return {
      title: site.metaTitle || `${site.companyName} - ${site.tagline}`,
      description: site.metaDescription || site.shortDescription,
      keywords: site.metaKeywords,
      icons: site.faviconUrl ? [{ url: site.faviconUrl }] : undefined,
      openGraph: {
        title: site.metaTitle || site.companyName,
        description: site.metaDescription || site.shortDescription,
        images: site.ogImageUrl ? [{ url: site.ogImageUrl }] : undefined,
      },
    };
  } catch {
    return {
      title: 'Jangkriknet - Official Store & Company Profile',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let theme = {
    primaryColor: '#1d4ed8',
    secondaryColor: '#475569',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 'rounded-lg',
    buttonStyle: 'solid',
    layout: 'full',
    headerStyle: 'modern',
  };

  try {
    const dbTheme = await prisma.themeSetting.findUnique({ where: { id: 'default' } });
    if (dbTheme) {
      theme = {
        primaryColor: dbTheme.primaryColor,
        secondaryColor: dbTheme.secondaryColor,
        accentColor: dbTheme.accentColor,
        backgroundColor: dbTheme.backgroundColor,
        textColor: dbTheme.textColor,
        headingFont: dbTheme.headingFont,
        bodyFont: dbTheme.bodyFont,
        borderRadius: dbTheme.borderRadius,
        buttonStyle: dbTheme.buttonStyle,
        layout: dbTheme.layout,
        headerStyle: dbTheme.headerStyle,
      };
    }
  } catch (e) {
    console.warn('Using default fallback theme:', e);
  }

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CartProvider>
            <ToastProvider>{children}</ToastProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
