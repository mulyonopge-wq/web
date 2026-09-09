import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const where: any = { isPublished: true };
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const categories = await prisma.blogCategory.findMany({
      include: { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ posts, categories });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil blog' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Judul artikel wajib diisi' }, { status: 400 });
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        summary: body.summary || '',
        content: body.content || '',
        featuredImage: body.featuredImage || '',
        author: body.author || 'Admin',
        categoryId: body.categoryId || null,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Blog POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug artikel sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal membuat artikel' }, { status: 500 });
  }
}
