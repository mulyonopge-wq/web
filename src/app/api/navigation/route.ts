import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const items = await prisma.navigation.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Navigation GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil navigasi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const count = await prisma.navigation.count();

    const item = await prisma.navigation.create({
      data: {
        label: body.label,
        url: body.url,
        order: body.order ?? count + 1,
        parentId: body.parentId || null,
        target: body.target || '_self',
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Navigation POST error:', error);
    return NextResponse.json({ error: 'Gagal menambah item menu' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Bulk update orders
    if (Array.isArray(body.items)) {
      await Promise.all(
        body.items.map((item: { id: string; order: number; isActive?: boolean; label?: string; url?: string }) =>
          prisma.navigation.update({
            where: { id: item.id },
            data: {
              order: item.order,
              ...(typeof item.isActive === 'boolean' ? { isActive: item.isActive } : {}),
              ...(item.label ? { label: item.label } : {}),
              ...(item.url ? { url: item.url } : {}),
            },
          })
        )
      );
      const items = await prisma.navigation.findMany({ orderBy: { order: 'asc' } });
      return NextResponse.json({ success: true, items });
    }

    if (body.id) {
      const item = await prisma.navigation.update({
        where: { id: body.id },
        data: {
          label: body.label,
          url: body.url,
          order: body.order,
          parentId: body.parentId || null,
          target: body.target,
          isActive: body.isActive,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Navigation PUT error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui menu' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.navigation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (error) {
    console.error('Navigation DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus menu' }, { status: 500 });
  }
}
