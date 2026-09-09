import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSessionUser } from '@/lib/auth';
import {
  getBackupStats,
  createBackupArchive,
  restoreBackupArchive,
} from '@/lib/backup';

export const dynamic = 'force-dynamic';

// GET: Ambil statistik backup atau unduh file backup .zip lengkap
export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Akses admin diperlukan.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'stats') {
    try {
      const stats = await getBackupStats();
      return NextResponse.json({ success: true, stats });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Unduh file backup
  try {
    const { archivePath, filename, manifest } = await createBackupArchive();
    const fileBuffer = fs.readFileSync(archivePath);

    // Hapus file arsip sementara setelah dibaca
    try {
      fs.unlinkSync(archivePath);
    } catch {}

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Id': manifest.id,
      },
    });
  } catch (error: any) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      { error: `Gagal membuat backup: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST: Upload dan jalankan restore dari file backup .zip
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Akses admin diperlukan.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const restoreDatabase = formData.get('restoreDatabase') !== 'false';
    const restoreUploads = formData.get('restoreUploads') !== 'false';
    const excludePort = formData.get('excludePort') !== 'false';

    if (!file) {
      return NextResponse.json(
        { error: 'File backup (.zip) wajib diunggah.' },
        { status: 400 }
      );
    }

    // Simpan file sementara
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join(os.tmpdir(), `upload_restore_${Date.now()}.zip`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      const result = await restoreBackupArchive(tempFilePath, {
        restoreDatabase,
        restoreUploads,
        excludePort,
      });

      return NextResponse.json(result);
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {}
    }
  } catch (error: any) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memulihkan backup' },
      { status: 500 }
    );
  }
}
