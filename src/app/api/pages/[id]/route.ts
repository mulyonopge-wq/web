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
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Page GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil halaman' }, { status: 500 });
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

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug ? slugify(body.slug) : undefined,
        content: body.content,
        featuredImage: body.featuredImage,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Page PUT error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug halaman sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui halaman' }, { status: 500 });
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
    await prisma.page.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Halaman berhasil dihapus' });
  } catch (error) {
    console.error('Page DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus halaman' }, { status: 500 });
  }
}
