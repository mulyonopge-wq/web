import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getCompanyTitles, saveCompanyTitles } from '@/lib/companyTitles';

export async function GET() {
  try {
    const [profile, cardTitles] = await Promise.all([
      prisma.companyProfile.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
      getCompanyTitles(),
    ]);
    return NextResponse.json({ profile, cardTitles });
  } catch (error) {
    console.error('Company Profile GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    let advantagesPayload = '';
    if (body.cardTitles) {
      const mergedTitles = await saveCompanyTitles(body.cardTitles);
      const items = Array.isArray(body.advantagesJson) ? body.advantagesJson : [];
      advantagesPayload = JSON.stringify({
        ...mergedTitles,
        items,
      });
    } else {
      advantagesPayload = typeof body.advantagesJson === 'object' ? JSON.stringify(body.advantagesJson) : (body.advantagesJson || '[]');
    }

    const valuesStr = typeof body.valuesJson === 'object' ? JSON.stringify(body.valuesJson) : (body.valuesJson || '[]');
    const teamStr = typeof body.teamJson === 'object' ? JSON.stringify(body.teamJson) : (body.teamJson || '[]');
    const certsStr = typeof body.certificationsJson === 'object' ? JSON.stringify(body.certificationsJson) : (body.certificationsJson || '[]');
    const legalitiesStr = typeof body.legalitiesJson === 'object' ? JSON.stringify(body.legalitiesJson) : (body.legalitiesJson || '[]');

    const updateData = {
      history: typeof body.history === 'string' ? body.history : '',
      vision: typeof body.vision === 'string' ? body.vision : '',
      mission: typeof body.mission === 'string' ? body.mission : '',
      valuesJson: valuesStr,
      advantagesJson: advantagesPayload,
      teamJson: teamStr,
      certificationsJson: certsStr,
      legalitiesJson: legalitiesStr,
    };

    const profile = await prisma.companyProfile.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    // Otomatis bersihkan aboutText dummy jangkriknet di siteSetting jika masih ada
    try {
      const site = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      if (site && site.aboutText && site.aboutText.toLowerCase().includes('jangkriknet')) {
        await prisma.siteSetting.update({
          where: { id: 'default' },
          data: { aboutText: '' },
        });
      }
    } catch {
      // ignore
    }

    const updatedTitles = await getCompanyTitles();
    return NextResponse.json({ success: true, profile, cardTitles: updatedTitles });
  } catch (error: any) {
    console.error('Company Profile PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Gagal menyimpan profil perusahaan' }, { status: 500 });
  }
}
