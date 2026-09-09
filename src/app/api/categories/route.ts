import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const count = await prisma.category.count();

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        imageUrl: body.imageUrl || '',
        order: body.order ?? count + 1,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Category POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug kategori sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 });
  }
}
