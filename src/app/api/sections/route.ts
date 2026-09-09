import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// GET all sections ordered by `order`
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Sections GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data section' }, { status: 500 });
  }
}

// POST create new section
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const count = await prisma.section.count();

    const section = await prisma.section.create({
      data: {
        type: body.type || 'HERO',
        title: body.title || 'Section Baru',
        subtitle: body.subtitle || '',
        content: typeof body.content === 'string' ? body.content : JSON.stringify(body.content || {}),
        order: body.order ?? count + 1,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Section POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat section' }, { status: 500 });
  }
}

// PUT handles both bulk reorder and single section update
export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Case 1: Bulk reorder array of { id, order, isActive }
    if (Array.isArray(body.sections)) {
      await Promise.all(
        body.sections.map((item: { id: string; order: number; isActive?: boolean }) =>
          prisma.section.update({
            where: { id: item.id },
            data: {
              order: item.order,
              ...(typeof item.isActive === 'boolean' ? { isActive: item.isActive } : {}),
            },
          })
        )
      );
      const updated = await prisma.section.findMany({ orderBy: { order: 'asc' } });
      return NextResponse.json({ success: true, sections: updated });
    }

    // Case 2: Single section update
    if (body.id) {
      const updated = await prisma.section.update({
        where: { id: body.id },
        data: {
          title: body.title,
          subtitle: body.subtitle,
          content: typeof body.content === 'object' ? JSON.stringify(body.content) : body.content,
          isActive: body.isActive,
          order: body.order,
        },
      });
      return NextResponse.json({ success: true, section: updated });
    }

    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Section PUT error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui section' }, { status: 500 });
  }
}

// DELETE section
export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.section.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Section berhasil dihapus' });
  } catch (error) {
    console.error('Section DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus section' }, { status: 500 });
  }
}
