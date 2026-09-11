import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getCatalogBanner, saveCatalogBanner, CatalogBannerConfig } from '@/lib/catalogBanner';

export async function GET() {
  try {
    const banner = await getCatalogBanner();
    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Catalog banner GET error:', error);
    return NextResponse.json({ error: 'Gagal memuat konfigurasi banner' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const banner = await saveCatalogBanner(body as CatalogBannerConfig);

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Catalog banner PUT error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan konfigurasi banner' }, { status: 500 });
  }
}
