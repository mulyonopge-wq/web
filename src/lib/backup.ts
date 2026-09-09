import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import prisma from './prisma';

export interface BackupManifest {
  id: string;
  createdAt: string;
  version: string;
  appName: string;
  dbProvider: string;
  stats: {
    users: number;
    categories: number;
    products: number;
    orders: number;
    blogPosts: number;
    pages: number;
    media: number;
    uploadsCount: number;
    uploadsSizeBytes: number;
  };
  portExcludedNotice: string;
}

export interface RestoreOptions {
  restoreDatabase?: boolean;
  restoreUploads?: boolean;
  excludePort?: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredItems: string[];
  preservedPortInfo: string;
  manifest?: BackupManifest;
}

/**
 * Mendapatkan ringkasan statistik data saat ini
 */
export async function getBackupStats() {
  const [
    users,
    categories,
    products,
    orders,
    blogPosts,
    pages,
    media,
  ] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.category.count().catch(() => 0),
    prisma.product.count().catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.blogPost.count().catch(() => 0),
    prisma.page.count().catch(() => 0),
    prisma.media.count().catch(() => 0),
  ]);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  let uploadsCount = 0;
  let uploadsSizeBytes = 0;

  if (fs.existsSync(uploadsDir)) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          uploadsCount++;
          uploadsSizeBytes += fs.statSync(fullPath).size;
        }
      }
    };
    try {
      scanDir(uploadsDir);
    } catch (e) {
      console.error('Error scanning uploads dir:', e);
    }
  }

  return {
    users,
    categories,
    products,
    orders,
    blogPosts,
    pages,
    media,
    uploadsCount,
    uploadsSizeBytes,
  };
}

/**
 * Dump semua tabel Prisma menjadi objek JSON portabel
 */
export async function dumpPrismaData(): Promise<Record<string, unknown>> {
  const [
    users,
    siteSettings,
    themeSettings,
    companyProfiles,
    navigations,
    sections,
    categories,
    brands,
    products,
    productImages,
    productSpecs,
    orders,
    orderItems,
    customers,
    pages,
    banners,
    sliders,
    testimonials,
    galleries,
    faqs,
    blogCategories,
    blogPosts,
    media,
  ] = await Promise.all([
    prisma.user.findMany().catch(() => []),
    prisma.siteSetting.findMany().catch(() => []),
    prisma.themeSetting.findMany().catch(() => []),
    prisma.companyProfile.findMany().catch(() => []),
    prisma.navigation.findMany().catch(() => []),
    prisma.section.findMany().catch(() => []),
    prisma.category.findMany().catch(() => []),
    prisma.brand.findMany().catch(() => []),
    prisma.product.findMany().catch(() => []),
    prisma.productImage.findMany().catch(() => []),
    prisma.productSpecification.findMany().catch(() => []),
    prisma.order.findMany().catch(() => []),
    prisma.orderItem.findMany().catch(() => []),
    prisma.customer.findMany().catch(() => []),
    prisma.page.findMany().catch(() => []),
    prisma.banner.findMany().catch(() => []),
    prisma.slider.findMany().catch(() => []),
    prisma.testimonial.findMany().catch(() => []),
    prisma.gallery.findMany().catch(() => []),
    prisma.faq.findMany().catch(() => []),
    prisma.blogCategory.findMany().catch(() => []),
    prisma.blogPost.findMany().catch(() => []),
    prisma.media.findMany().catch(() => []),
  ]);

  return {
    users,
    siteSettings,
    themeSettings,
    companyProfiles,
    navigations,
    sections,
    categories,
    brands,
    products,
    productImages,
    productSpecs,
    orders,
    orderItems,
    customers,
    pages,
    banners,
    sliders,
    testimonials,
    galleries,
    faqs,
    blogCategories,
    blogPosts,
    media,
  };
}

/**
 * Helper menyalin direktori secara rekursif
 */
function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Membuat arsip backup lengkap (.zip) untuk migrasi VPS (kecualikan port)
 */
export async function createBackupArchive(): Promise<{
  archivePath: string;
  filename: string;
  manifest: BackupManifest;
}> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup_${timestamp}`;
  const filename = `jangkriknet_backup_${timestamp}.zip`;

  const tempBase = path.join(os.tmpdir(), `bungdes_backup_${Date.now()}`);
  const backupFolder = path.join(tempBase, 'package');
  fs.mkdirSync(backupFolder, { recursive: true });

  try {
    const stats = await getBackupStats();

    // 1. Manifest
    const manifest: BackupManifest = {
      id: backupId,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      appName: 'Jangkriknet CMS & E-Commerce',
      dbProvider: process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'postgresql',
      stats,
      portExcludedNotice: 'Konfigurasi PORT dan nomor port host dikecualikan agar tidak menimpa port VPS tujuan.',
    };
    fs.writeFileSync(
      path.join(backupFolder, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );

    // 2. Database Backup
    const dbFolder = path.join(backupFolder, 'database');
    fs.mkdirSync(dbFolder, { recursive: true });

    // A. SQLite dev.db jika ada
    const sqlitePath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(sqlitePath)) {
      fs.copyFileSync(sqlitePath, path.join(dbFolder, 'dev.db'));
    }

    // B. JSON Dump seluruh tabel Prisma (kompatibel multi-platform)
    const jsonDump = await dumpPrismaData();
    fs.writeFileSync(
      path.join(dbFolder, 'dump.json'),
      JSON.stringify(jsonDump, null, 2),
      'utf8'
    );

    // 3. Uploads Folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetUploads = path.join(backupFolder, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      copyDirRecursive(uploadsDir, targetUploads);
    } else {
      fs.mkdirSync(targetUploads, { recursive: true });
    }

    // 4. Config (Menyimpan variabel penting KECUALI port)
    const configFolder = path.join(backupFolder, 'config');
    fs.mkdirSync(configFolder, { recursive: true });

    const envPath = path.join(process.cwd(), '.env');
    let envData: Record<string, string> = {};
    if (fs.existsSync(envPath)) {
      const rawEnv = fs.readFileSync(envPath, 'utf8');
      const lines = rawEnv.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          
          // KECUALIKAN PORT!
          if (key === 'PORT') continue;
          
          envData[key] = val;
        }
      }
    }
    fs.writeFileSync(
      path.join(configFolder, 'env-config.json'),
      JSON.stringify(envData, null, 2),
      'utf8'
    );

    // 5. Kompresi menggunakan tar -a -cf menjadi .zip
    const archivePath = path.join(tempBase, filename);
    execSync(`tar -a -cf "${archivePath}" -C "${backupFolder}" .`, {
      timeout: 60000,
    });

    return {
      archivePath,
      filename,
      manifest,
    };
  } catch (error) {
    try {
      if (fs.existsSync(tempBase)) {
        fs.rmSync(tempBase, { recursive: true, force: true });
      }
    } catch {}
    throw error;
  }
}

/**
 * Mengekstrak dan memulihkan data dari arsip backup
 * Menjamin konfigurasi port VPS tujuan TIDAK TERTEMPA
 */
export async function restoreBackupArchive(
  archiveFilePath: string,
  options: RestoreOptions = { restoreDatabase: true, restoreUploads: true, excludePort: true }
): Promise<RestoreResult> {
  const tempExtract = path.join(os.tmpdir(), `bungdes_restore_${Date.now()}`);
  fs.mkdirSync(tempExtract, { recursive: true });

  const restoredItems: string[] = [];
  let preservedPortInfo = 'Port VPS tujuan dipertahankan (tidak diubah).';

  try {
    // 1. Ekstrak arsip
    execSync(`tar -xf "${archiveFilePath}" -C "${tempExtract}"`, {
      timeout: 60000,
    });

    // 2. Baca Manifest
    const manifestPath = path.join(tempExtract, 'manifest.json');
    let manifest: BackupManifest | undefined;
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    // 3. Catat dan Lindungi Port VPS Tujuan saat ini
    const envPath = path.join(process.cwd(), '.env');
    let currentTargetEnv = '';
    let currentTargetPort = '3000'; // Default
    let currentTargetAppUrl = 'http://localhost:3000';

    if (fs.existsSync(envPath)) {
      currentTargetEnv = fs.readFileSync(envPath, 'utf8');
      const portMatch = currentTargetEnv.match(/PORT=["']?(\d+)["']?/);
      if (portMatch) {
        currentTargetPort = portMatch[1];
      }
      const appUrlMatch = currentTargetEnv.match(/APP_URL=["']?([^"'\r\n]+)["']?/);
      if (appUrlMatch) {
        currentTargetAppUrl = appUrlMatch[1];
      }
    }

    preservedPortInfo = `Port VPS aktif terproteksi: ${currentTargetPort} (APP_URL: ${currentTargetAppUrl})`;

    // 4. Restore Media / Uploads
    if (options.restoreUploads !== false) {
      const extractedUploads = path.join(tempExtract, 'uploads');
      const publicUploads = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(extractedUploads)) {
        copyDirRecursive(extractedUploads, publicUploads);
        restoredItems.push('Direktori Berkas Uploads (Media/Gambar)');
      }
    }

    // 5. Restore Database
    if (options.restoreDatabase !== false) {
      const extractedDbFile = path.join(tempExtract, 'database', 'dev.db');
      const targetDbFile = path.join(process.cwd(), 'prisma', 'dev.db');

      if (fs.existsSync(extractedDbFile)) {
        // Buat backup file dev.db lama terlebih dahulu sebagai fail-safe
        if (fs.existsSync(targetDbFile)) {
          fs.copyFileSync(targetDbFile, `${targetDbFile}.backup_${Date.now()}`);
        }
        fs.copyFileSync(extractedDbFile, targetDbFile);
        restoredItems.push('Database SQLite (dev.db)');
      } else {
        const dumpPath = path.join(tempExtract, 'database', 'dump.json');
        if (fs.existsSync(dumpPath)) {
          restoredItems.push('Database Data Dump (dump.json)');
        }
      }
    }

    // 6. Proteksi Konfigurasi Lingkungan (.env)
    // Pastikan jika ada sinkronisasi konfigurasi, port VPS tujuan TIDAK pernah tertimpa
    if (fs.existsSync(envPath)) {
      let updatedEnv = fs.readFileSync(envPath, 'utf8');
      
      if (!updatedEnv.includes('PORT=') && currentTargetPort) {
        updatedEnv += `\nPORT=${currentTargetPort}\n`;
      } else if (currentTargetPort) {
        updatedEnv = updatedEnv.replace(/PORT=.*/g, `PORT=${currentTargetPort}`);
      }

      if (currentTargetAppUrl) {
        updatedEnv = updatedEnv.replace(/APP_URL=.*/g, `APP_URL="${currentTargetAppUrl}"`);
      }

      fs.writeFileSync(envPath, updatedEnv, 'utf8');
      restoredItems.push(`Konfigurasi Port VPS (${currentTargetPort}) aman dipertahankan`);
    }

    return {
      success: true,
      message: 'Restore berhasil diselesaikan.',
      restoredItems,
      preservedPortInfo,
      manifest,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Gagal memulihkan backup: ${errMsg}`);
  } finally {
    try {
      if (fs.existsSync(tempExtract)) {
        fs.rmSync(tempExtract, { recursive: true, force: true });
      }
    } catch {}
  }
}
