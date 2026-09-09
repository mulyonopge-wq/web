import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Pages GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil halaman' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Judul halaman wajib diisi' }, { status: 400 });
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const page = await prisma.page.create({
      data: {
        title: body.title,
        slug,
        content: body.content || '',
        featuredImage: body.featuredImage || '',
        seoTitle: body.seoTitle || body.title,
        seoDesc: body.seoDesc || '',
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Page POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug halaman sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal membuat halaman' }, { status: 500 });
  }
}
