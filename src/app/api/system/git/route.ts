import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function runCmd(cmd: string, cwd = process.cwd(), timeout = 60000): { success: boolean; output: string } {
  try {
    const stdout = execSync(cmd, {
      cwd,
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    return { success: true, output: stdout.trim() };
  } catch (error: any) {
    const errOutput = (error.stderr ? error.stderr.toString() : '') +
      (error.stdout ? '\n' + error.stdout.toString() : '') ||
      error.message;
    return { success: false, output: errOutput.trim() };
  }
}

// GET: Dapatkan status git repository saat ini
export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Akses admin diperlukan.' }, { status: 401 });
  }

  // 1. Cek apakah Git terpasang di sistem
  const gitVersion = runCmd('git --version');
  if (!gitVersion.success) {
    return NextResponse.json({
      gitInstalled: false,
      isGitRepo: false,
      message: 'Git CLI tidak terdeteksi pada server. Pastikan Git sudah diinstal di VPS.',
    });
  }

  // 2. Cek apakah direktori ini adalah Git repository
  const isRepo = runCmd('git rev-parse --is-inside-work-tree');
  if (!isRepo.success) {
    return NextResponse.json({
      gitInstalled: true,
      gitVersion: gitVersion.output,
      isGitRepo: false,
      message: 'Proyek ini belum diinisialisasi sebagai Git repository.',
    });
  }

  // 3. Ambil informasi branch & commit
  const branchRes = runCmd('git branch --show-current');
  const branch = branchRes.output || 'main';

  const hashShort = runCmd('git rev-parse --short HEAD').output;
  const hashFull = runCmd('git rev-parse HEAD').output;
  const commitMsg = runCmd('git log -1 --pretty=%B').output;
  const commitAuthor = runCmd('git log -1 --pretty=%an').output;
  const commitDate = runCmd('git log -1 --pretty=%ad --date=iso').output;
  const remoteUrlRes = runCmd('git config --get remote.origin.url');

  // Status perubahan lokal (uncommitted changes)
  const statusRes = runCmd('git status --porcelain');
  const hasLocalChanges = !!statusRes.output;

  return NextResponse.json({
    gitInstalled: true,
    gitVersion: gitVersion.output,
    isGitRepo: true,
    branch,
    hashShort,
    hashFull,
    commitMsg,
    commitAuthor,
    commitDate,
    remoteUrl: remoteUrlRes.output || '',
    hasLocalChanges,
    localChangesPreview: statusRes.output.slice(0, 500),
  });
}

// POST: Jalankan aksi periksa pembaruan, pull dari GitHub, atau inisialisasi git
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Akses admin diperlukan.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action || 'check';

    // AKSI 1: Inisialisasi Git dan Hubungkan ke Remote URL
    if (action === 'init') {
      const remoteUrl = (body.remoteUrl || '').trim();
      if (!remoteUrl) {
        return NextResponse.json(
          { error: 'URL Remote GitHub (misal: https://github.com/user/repo.git) wajib diisi.' },
          { status: 400 }
        );
      }

      const logs: Array<{ step: string; output: string; success: boolean }> = [];

      // Git init jika belum
      const isRepo = runCmd('git rev-parse --is-inside-work-tree');
      if (!isRepo.success) {
        const initRes = runCmd('git init');
        logs.push({ step: 'git init', output: initRes.output, success: initRes.success });
      }

      // Atur atau ganti remote origin
      const currentRemote = runCmd('git config --get remote.origin.url');
      if (currentRemote.success && currentRemote.output) {
        const setUrlRes = runCmd(`git remote set-url origin "${remoteUrl}"`);
        logs.push({ step: 'git remote set-url origin', output: setUrlRes.output || 'Remote URL berhasil diperbarui', success: setUrlRes.success });
      } else {
        const addRemoteRes = runCmd(`git remote add origin "${remoteUrl}"`);
        logs.push({ step: 'git remote add origin', output: addRemoteRes.output || 'Remote origin berhasil ditambahkan', success: addRemoteRes.success });
      }

      return NextResponse.json({
        success: logs.every((l) => l.success),
        message: 'Koneksi ke GitHub repository berhasil dikonfigurasi.',
        logs,
      });
    }

    // AKSI 2: Periksa Pembaruan dari GitHub (git fetch)
    if (action === 'check') {
      const branchRes = runCmd('git branch --show-current');
      const branch = body.branch || branchRes.output || 'main';

      const fetchRes = runCmd('git fetch origin');
      if (!fetchRes.success) {
        return NextResponse.json({
          success: false,
          error: `Gagal terhubung ke remote GitHub: ${fetchRes.output}`,
        });
      }

      // Cek jumlah commit yang belum ditarik
      const countRes = runCmd(`git rev-list HEAD..origin/${branch} --count`);
      const behindCount = parseInt(countRes.output, 10) || 0;

      let incomingCommits: string[] = [];
      if (behindCount > 0) {
        const logRes = runCmd(`git log HEAD..origin/${branch} --oneline -n 10`);
        incomingCommits = logRes.output ? logRes.output.split('\n') : [];
      }

      return NextResponse.json({
        success: true,
        isUpToDate: behindCount === 0,
        behindCount,
        incomingCommits,
        branch,
      });
    }

    // AKSI 3: Tarik Pembaruan (git pull) & Jalankan Tugas Sinkronisasi
    if (action === 'pull') {
      const branchRes = runCmd('git branch --show-current');
      const branch = body.branch || branchRes.output || 'main';
      const runPrismaGenerate = body.runPrismaGenerate !== false;
      const runPrismaDbPush = body.runPrismaDbPush !== false;
      const runBuild = !!body.runBuild;
      const forcePull = !!body.forcePull;

      const logs: Array<{ step: string; output: string; success: boolean }> = [];

      // 0. Jika forcePull aktif atau ada konflik lokal, jalankan git reset --hard
      if (forcePull) {
        const resetRes = runCmd('git reset --hard HEAD');
        logs.push({
          step: 'git reset --hard HEAD (Bersihkan file lokal sebelum pull)',
          output: resetRes.output || 'Reset selesai',
          success: resetRes.success,
        });
      }

      // 1. Git pull
      const pullRes = runCmd(`git pull origin ${branch}`);
      logs.push({
        step: `git pull origin ${branch}`,
        output: pullRes.output || 'Pull selesai',
        success: pullRes.success,
      });

      if (!pullRes.success) {
        return NextResponse.json({
          success: false,
          message: 'Gagal melakukan git pull. Periksa log detail berikut.',
          logs,
        });
      }

      // 2. Prisma generate
      if (runPrismaGenerate) {
        const prismaGenRes = runCmd('npx prisma generate');
        logs.push({
          step: 'npx prisma generate',
          output: prismaGenRes.output,
          success: prismaGenRes.success,
        });
      }

      // 3. Prisma db push (sinkronisasi skema database)
      if (runPrismaDbPush) {
        const prismaPushRes = runCmd('npx prisma db push --accept-data-loss');
        logs.push({
          step: 'npx prisma db push',
          output: prismaPushRes.output,
          success: prismaPushRes.success,
        });
      }

      // 4. Build aplikasi (opsional)
      if (runBuild) {
        const buildRes = runCmd('npm run build', process.cwd(), 120000);
        logs.push({
          step: 'npm run build',
          output: buildRes.output,
          success: buildRes.success,
        });
      }

      const allSuccess = logs.every((l) => l.success);

      return NextResponse.json({
        success: allSuccess,
        message: allSuccess
          ? 'Pembaruan aplikasi dari GitHub berhasil diterapkan!'
          : 'Pembaruan selesai dengan beberapa catatan atau peringatan.',
        logs,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Git action error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
