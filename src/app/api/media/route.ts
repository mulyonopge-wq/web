import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { filename: { contains: search } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data media' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID media tidak ditemukan' }, { status: 400 });

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 });

    // Try to delete physical file
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', media.filename);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (e) {
      console.warn('Physical file delete warning:', e);
    }

    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Media berhasil dihapus' });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus media' }, { status: 500 });
  }
}
