import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validate mime type (images and videos)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Hanya file gambar (JPG, PNG, WebP) atau video (MP4, WebM) yang diperbolehkan' },
        { status: 400 }
      );
    }

    // Max file size: 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal adalah 50MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Target upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate clean filename
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}-${cleanName}${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);
    const publicUrl = `/uploads/${uniqueFilename}`;

    // Record in database Media model
    const media = await prisma.media.create({
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        url: publicUrl,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengunggah file' },
      { status: 500 }
    );
  }
}
