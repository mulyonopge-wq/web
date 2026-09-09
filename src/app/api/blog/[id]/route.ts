import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: { category: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug ? slugify(body.slug) : undefined,
        summary: body.summary,
        content: body.content,
        featuredImage: body.featuredImage,
        author: body.author,
        categoryId: body.categoryId,
        isPublished: body.isPublished,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Blog PUT error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug artikel sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui artikel' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus artikel' }, { status: 500 });
  }
}
