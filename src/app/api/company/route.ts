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

    if (body.cardTitles) {
      await saveCompanyTitles(body.cardTitles);
    }

    const profile = await prisma.companyProfile.upsert({
      where: { id: 'default' },
      update: {
        history: body.history,
        vision: body.vision,
        mission: body.mission,
        valuesJson: typeof body.valuesJson === 'object' ? JSON.stringify(body.valuesJson) : body.valuesJson,
        advantagesJson: body.cardTitles ? undefined : (typeof body.advantagesJson === 'object' ? JSON.stringify(body.advantagesJson) : body.advantagesJson),
        teamJson: typeof body.teamJson === 'object' ? JSON.stringify(body.teamJson) : body.teamJson,
        certificationsJson: typeof body.certificationsJson === 'object' ? JSON.stringify(body.certificationsJson) : body.certificationsJson,
        legalitiesJson: typeof body.legalitiesJson === 'object' ? JSON.stringify(body.legalitiesJson) : body.legalitiesJson,
      },
      create: {
        id: 'default',
        ...body,
      },
    });

    const updatedTitles = await getCompanyTitles();
    return NextResponse.json({ success: true, profile, cardTitles: updatedTitles });
  } catch (error) {
    console.error('Company Profile PUT error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan profil perusahaan' }, { status: 500 });
  }
}
