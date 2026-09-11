import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Blog categories GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil kategori blog' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const name = body.name.trim();
    let slug = body.slug?.trim() ? slugify(body.slug.trim()) : slugify(name);

    if (!slug) {
      slug = `kategori-${Date.now()}`;
    }

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.blogCategory.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug: finalSlug,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Blog category POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat kategori blog' }, { status: 500 });
  }
}
