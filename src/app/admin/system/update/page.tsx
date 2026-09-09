'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitPullRequest,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ArrowDownCircle,
  ExternalLink,
  Terminal,
  Clock,
  User,
  ShieldCheck,
  Loader2,
  FolderGit2,
  Check,
  Copy,
} from 'lucide-react';

interface GitStatus {
  gitInstalled: boolean;
  gitVersion?: string;
  isGitRepo: boolean;
  branch?: string;
  hashShort?: string;
  hashFull?: string;
  commitMsg?: string;
  commitAuthor?: string;
  commitDate?: string;
  remoteUrl?: string;
  hasLocalChanges?: boolean;
  localChangesPreview?: string;
  message?: string;
}

interface LogEntry {
  step: string;
  output: string;
  success: boolean;
}

export default function GitUpdatePage() {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Form input remote url (jika belum git repo)
  const [remoteUrlInput, setRemoteUrlInput] = useState('');

  // Update check result
  const [updateInfo, setUpdateInfo] = useState<{
    checked: boolean;
    isUpToDate: boolean;
    behindCount: number;
    incomingCommits: string[];
    error?: string;
  } | null>(null);

  // Options
  const [runPrismaGenerate, setRunPrismaGenerate] = useState(true);
  const [runPrismaDbPush, setRunPrismaDbPush] = useState(true);
  const [runBuild, setRunBuild] = useState(false);

  // Console Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/system/git');
      const data = await res.json();
      setStatus(data);
      if (data.remoteUrl) {
        setRemoteUrlInput(data.remoteUrl);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal memuat status Git.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Periksa Pembaruan (git fetch)
  const handleCheckUpdates = async () => {
    setChecking(true);
    setErrorMessage(null);
    setUpdateInfo(null);
    try {
      const res = await fetch('/api/system/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', branch: status?.branch || 'main' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memeriksa pembaruan dari GitHub.');
      }
      setUpdateInfo({
        checked: true,
        isUpToDate: data.isUpToDate,
        behindCount: data.behindCount,
        incomingCommits: data.incomingCommits || [],
      });
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan saat memeriksa update.');
    } finally {
      setChecking(false);
    }
  };

  // Inisialisasi Git Remote
  const handleInitGit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrlInput.trim()) {
      alert('Masukkan URL Repository GitHub terlebih dahulu.');
      return;
    }

    setInitializing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/system/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', remoteUrl: remoteUrlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghubungkan repository.');
      }
      if (data.logs) {
        setLogs(data.logs);
      }
      await fetchStatus();
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan saat menghubungkan Git.');
    } finally {
      setInitializing(false);
    }
  };

  // Eksekusi Pull Update
  const handlePullUpdates = async () => {
    const confirmMsg =
      'PERHATIAN: Aplikasi akan menarik kode terbaru dari GitHub dan memperbarui sistem.\n\n' +
      `Branch: ${status?.branch || 'main'}\n` +
      `Prisma Generate: ${runPrismaGenerate ? 'Ya' : 'Tidak'}\n` +
      `Prisma DB Push: ${runPrismaDbPush ? 'Ya' : 'Tidak'}\n` +
      `Build Produksi: ${runBuild ? 'Ya' : 'Tidak'}\n\n` +
      'Apakah Anda yakin ingin memulai pembaruan sekarang?';

    if (!window.confirm(confirmMsg)) return;

    setPulling(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/system/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pull',
          branch: status?.branch || 'main',
          runPrismaGenerate,
          runPrismaDbPush,
          runBuild,
        }),
      });

      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Gagal melakukan pembaruan.');
      }

      // Reset update info and refresh status
      setUpdateInfo(null);
      await fetchStatus();
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan saat memperbarui aplikasi.');
    } finally {
      setPulling(false);
    }
  };

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.step}]\n${l.output}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <GitBranch className="w-4 h-4" />
            <span>Pembaruan Perangkat Lunak</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Update dari GitHub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tarik pembaruan kode resmi dari repository GitHub langsung dari panel admin tanpa login terminal VPS.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Terjadi Kendala</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Jika Git Belum Diinstal di Server */}
      {status && !status.gitInstalled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-base">Git CLI Belum Terpasang di VPS</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Perintah <code>git</code> tidak ditemukan di server ini. Silakan jalankan perintah berikut pada terminal SSH VPS Anda:
          </p>
          <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono">
            sudo apt update && sudo apt install -y git
          </pre>
        </div>
      )}

      {/* Jika Belum Terkoneksi ke Repository GitHub */}
      {status && status.gitInstalled && !status.isGitRepo && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Hubungkan Proyek ke Repository GitHub
              </h3>
              <p className="text-xs text-slate-500">
                Folder ini belum diinisialisasi sebagai repository Git atau belum memiliki remote origin.
              </p>
            </div>
          </div>

          <form onSubmit={handleInitGit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                URL Repository GitHub (HTTPS / SSH)
              </label>
              <input
                type="text"
                value={remoteUrlInput}
                onChange={(e) => setRemoteUrlInput(e.target.value)}
                placeholder="https://github.com/username/jangkriknet.git"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Contoh: https://github.com/akunanda/nama-repo.git
              </span>
            </div>

            <button
              type="submit"
              disabled={initializing}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderGit2 className="w-4 h-4" />}
              <span>{initializing ? 'Menghubungkan...' : 'Inisialisasi & Hubungkan ke GitHub'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Jika Git Repo Terhubung */}
      {status && status.isGitRepo && (
        <>
          {/* Status Bar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Versi Saat Ini */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Branch Aktif
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  {status.branch || 'main'}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Commit Terakhir</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {status.hashShort || 'HEAD'}
                  </code>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-2">
                  "{status.commitMsg || 'Tidak ada pesan commit'}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Author: {status.commitAuthor || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Waktu: {status.commitDate ? new Date(status.commitDate).toLocaleString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Remote Repository Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Remote GitHub Origin
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                  Connected
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">URL Sumber Kode</p>
                <div className="mt-1 overflow-hidden text-ellipsis">
                  {status.remoteUrl ? (
                    <a
                      href={status.remoteUrl.replace(/\.git$/, '')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <span>{status.remoteUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Remote URL belum disetel</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {status.hasLocalChanges ? (
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Ada perubahan file lokal yang belum di-commit. Disarankan membuat backup sebelum pull.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Direktori kerja bersih (tidak ada uncommitted changes).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Status Pembaruan & Tombol Aksi */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Pemeriksaan Update
                </span>

                {updateInfo ? (
                  updateInfo.isUpToDate ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Aplikasi Sudah Versi Terbaru</p>
                        <p className="text-[11px] text-emerald-700">
                          Tidak ada commit baru di remote repository.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2.5 text-orange-800">
                      <ArrowDownCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">
                          {updateInfo.behindCount} Pembaruan Baru Tersedia!
                        </p>
                        <ul className="mt-1 space-y-0.5 text-[11px] text-orange-700">
                          {updateInfo.incomingCommits.slice(0, 3).map((cmt, idx) => (
                            <li key={idx} className="truncate">• {cmt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-slate-500">
                    Klik tombol di bawah untuk memeriksa apakah ada rilis atau pembaruan baru dari GitHub.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCheckUpdates}
                  disabled={checking || pulling}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Memeriksa GitHub...' : 'Periksa Pembaruan'}</span>
                </button>

                <button
                  onClick={handlePullUpdates}
                  disabled={pulling}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {pulling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sedang Memperbarui (Git Pull)...</span>
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Perbarui Sekarang (Git Pull)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Opsi Otomatisasi Pasca Update */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Opsi Tindakan Pasca-Pull Otomatis:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runPrismaGenerate}
                  onChange={(e) => setRunPrismaGenerate(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>Jalankan `npx prisma generate`</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runPrismaDbPush}
                  onChange={(e) => setRunPrismaDbPush(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>Jalankan `npx prisma db push` (Migrasi skema)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runBuild}
                  onChange={(e) => setRunBuild(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>Jalankan `npm run build`</span>
              </label>
            </div>
          </div>

          {/* Console / Terminal Log Output */}
          {logs.length > 0 && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span>Output Terminal Pembaruan:</span>
                </div>
                <button
                  onClick={copyLogs}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Log'}</span>
                </button>
              </div>

              <div className="p-5 font-mono text-xs space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={log.success ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.success ? '✔' : '✖'}
                      </span>
                      <span className="text-amber-300 font-bold">$ {log.step}</span>
                    </div>
                    {log.output && (
                      <pre className="text-slate-300 pl-4 whitespace-pre-wrap leading-relaxed text-[11px]">
                        {log.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keamanan & Tips */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">Keamanan & Integritas Data Server</p>
              <p className="text-blue-800">
                Pembaruan dari GitHub hanya menyinkronkan berkas kode program. Berkas <code>.env</code>, database SQLite (<code>dev.db</code>), dan media uploads di server VPS Anda tidak akan tersentuh atau hilang selama proses pembaruan.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
