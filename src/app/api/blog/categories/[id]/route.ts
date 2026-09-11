import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const name = body.name.trim();
    let slug = body.slug?.trim() ? slugify(body.slug.trim()) : slugify(name);

    if (!slug) {
      slug = `kategori-${Date.now()}`;
    }

    // Check if slug is already taken by another category
    const existing = await prisma.blogCategory.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Blog category PUT error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kategori blog' }, { status: 500 });
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

    await prisma.blogCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Blog category DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus kategori blog' }, { status: 500 });
  }
}
