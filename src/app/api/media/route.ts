import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { isYouTubeUrl, getYouTubeVideoId, isVideoUrl } from '@/lib/media';

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

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { url, title } = body;
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL wajib diisi' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const isYt = isYouTubeUrl(trimmedUrl);
    const isVid = isVideoUrl(trimmedUrl);
    const ytId = getYouTubeVideoId(trimmedUrl);

    const mimeType = isYt ? 'video/youtube' : isVid ? 'video/mp4' : 'image/jpeg';
    const originalName = title || (isYt ? `YouTube: ${ytId}` : path.basename(trimmedUrl.split('?')[0]) || 'External Media');
    const filename = isYt ? `yt_${ytId}` : `url_${Date.now()}`;

    // Check if already exists
    const existing = await prisma.media.findFirst({
      where: { url: trimmedUrl },
    });

    if (existing) {
      return NextResponse.json({ success: true, media: existing });
    }

    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        url: trimmedUrl,
        mimeType,
        size: 0,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Media POST error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan media URL' }, { status: 500 });
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

    // Try to delete physical file if not external / youtube
    if (!media.url.startsWith('http://') && !media.url.startsWith('https://')) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', media.filename);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (e) {
        console.warn('Physical file delete warning:', e);
      }
    }

    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Media berhasil dihapus' });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus media' }, { status: 500 });
  }
}
