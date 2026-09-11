import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { cleanMapsInput } from '@/lib/maps';

export async function GET() {
  try {
    const [site, theme] = await Promise.all([
      prisma.siteSetting.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
      prisma.themeSetting.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
    ]);

    return NextResponse.json({ site, theme });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { site, theme } = body;

    let updatedSite = null;
    let updatedTheme = null;

    if (site) {
      let cleanMapsEmbedUrl = cleanMapsInput(site.mapsEmbedUrl || '');

      updatedSite = await prisma.siteSetting.upsert({
        where: { id: 'default' },
        update: {
          companyName: site.companyName,
          tagline: site.tagline,
          logoUrl: site.logoUrl,
          faviconUrl: site.faviconUrl,
          shortDescription: site.shortDescription,
          aboutText: site.aboutText,
          address: site.address,
          city: site.city,
          phone: site.phone,
          whatsappNumber: site.whatsappNumber,
          whatsappTemplate: site.whatsappTemplate,
          email: site.email,
          mapsEmbedUrl: cleanMapsEmbedUrl,
          facebookUrl: site.facebookUrl,
          instagramUrl: site.instagramUrl,
          tiktokUrl: site.tiktokUrl,
          youtubeUrl: site.youtubeUrl,
          linkedinUrl: site.linkedinUrl,
          footerText: site.footerText,
          copyrightText: site.copyrightText,
          metaTitle: site.metaTitle,
          metaDescription: site.metaDescription,
          metaKeywords: site.metaKeywords,
          ogImageUrl: site.ogImageUrl,
        },
        create: {
          id: 'default',
          ...site,
        },
      });
    }

    if (theme) {
      updatedTheme = await prisma.themeSetting.upsert({
        where: { id: 'default' },
        update: {
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          backgroundColor: theme.backgroundColor,
          textColor: theme.textColor,
          headingFont: theme.headingFont,
          bodyFont: theme.bodyFont,
          borderRadius: theme.borderRadius,
          buttonStyle: theme.buttonStyle,
          layout: theme.layout,
          headerStyle: theme.headerStyle,
        },
        create: {
          id: 'default',
          ...theme,
        },
      });
    }

    return NextResponse.json({
      success: true,
      site: updatedSite,
      theme: updatedTheme,
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengaturan' },
      { status: 500 }
    );
  }
}
