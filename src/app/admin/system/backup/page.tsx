'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileArchive,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  Package,
  ShieldCheck,
  Info,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface BackupStats {
  users: number;
  categories: number;
  products: number;
  orders: number;
  blogPosts: number;
  pages: number;
  media: number;
  uploadsCount: number;
  uploadsSizeBytes: number;
}

export default function BackupRestorePage() {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Restore options
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreDatabase, setRestoreDatabase] = useState(true);
  const [restoreUploads, setRestoreUploads] = useState(true);
  const [excludePort, setExcludePort] = useState(true);

  // Restore result
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    restoredItems?: string[];
    preservedPortInfo?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/system/backup?action=stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/system/backup');
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengunduh berkas backup.');
      }

      // Ambil nama file dari header jika ada
      const disposition = response.headers.get('Content-Disposition');
      let filename = `backup_site_${new Date().toISOString().slice(0, 10)}.zip`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat mengunduh.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setRestoreResult(null);
      setErrorMessage(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      alert('Pilih file backup (.zip) terlebih dahulu.');
      return;
    }

    const confirmMsg =
      'PERINGATAN: Proses restore akan menimpa data yang dipilih dengan data dari file backup.\n\n' +
      (excludePort
        ? '✓ Konfigurasi PORT VPS tujuan aman dan TIDAK AKAN ditimpa.\n\n'
        : '⚠️ Port VPS tujuan mungkin akan disesuaikan.\n\n') +
      'Apakah Anda yakin ingin melanjutkan proses restore?';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setRestoring(true);
    setRestoreResult(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('restoreDatabase', restoreDatabase ? 'true' : 'false');
    formData.append('restoreUploads', restoreUploads ? 'true' : 'false');
    formData.append('excludePort', excludePort ? 'true' : 'false');

    try {
      const res = await fetch('/api/system/backup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memulihkan backup.');
      }

      setRestoreResult(data);
      // Refresh stats
      fetchStats();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat melakukan restore.');
    } finally {
      setRestoring(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Server className="w-4 h-4" />
            <span>Sistem & Pemeliharaan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Backup & Restore (Migrasi VPS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ekspor dan pulihkan seluruh basis data serta berkas media saat berpindah server VPS tanpa menimpa port aktif.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loadingStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Alert Error jika ada */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Ringkasan Data Saat Ini */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Katalog Produk</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-2">
            {loadingStats ? '-' : stats?.products ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {loadingStats ? '...' : `${stats?.categories ?? 0} Kategori`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pesanan</span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-2">
            {loadingStats ? '-' : stats?.orders ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total Transaksi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Berkas Media</span>
            <ImageIcon className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-2">
            {loadingStats ? '-' : stats?.uploadsCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {loadingStats ? '...' : formatBytes(stats?.uploadsSizeBytes ?? 0)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Halaman & Artikel</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-2">
            {loadingStats ? '-' : (stats?.pages ?? 0) + (stats?.blogPosts ?? 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Konten CMS</span>
        </div>
      </div>

      {/* Grid: 2 Kolom (Download Backup & Restore) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom 1: Buat & Download Backup */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  1. Unduh Paket Backup Lengkap
                </h3>
                <p className="text-xs text-slate-500">
                  Format arsip portabel (.zip) siap dipindahkan ke VPS baru
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Salinan Database SQLite (`dev.db`) & JSON Data Dump</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Seluruh berkas upload gambar/media (`public/uploads`)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pengaturan tema, profil perusahaan, navigasi, dan pengguna</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50/60 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Pengaturan PORT dikecualikan secara otomatis agar tidak merusak port server VPS tujuan.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengemas dan Mengunduh Backup (.zip)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Backup Lengkap (.zip)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Proses kompresi mungkin membutuhkan beberapa detik tergantung jumlah media.
            </p>
          </div>
        </div>

        {/* Kolom 2: Restore / Pulihkan Backup */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  2. Pulihkan Data di VPS Tujuan
                </h3>
                <p className="text-xs text-slate-500">
                  Unggah file arsip (.zip) yang telah dibuat dari server lama
                </p>
              </div>
            </div>

            {/* Input File Box */}
            <div className="pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".zip,.tar.gz"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
              >
                <FileArchive className="w-8 h-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedFile ? selectedFile.name : 'Klik untuk memilih file backup (.zip)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedFile
                      ? `Ukuran: ${formatBytes(selectedFile.size)}`
                      : 'Mendukung format .zip (arsip backup Jangkriknet)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Opsi Restore */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreDatabase}
                  onChange={(e) => setRestoreDatabase(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Pulihkan Basis Data & Konten CMS (`dev.db` / tables)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreUploads}
                  onChange={(e) => setRestoreUploads(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Pulihkan Direktori Berkas Media (`public/uploads`)</span>
              </label>

              {/* Opsi Proteksi Port */}
              <label className="flex items-start gap-2.5 text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludePort}
                  onChange={(e) => setExcludePort(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span>Pertahankan Port & Host VPS Tujuan (Kecualikan Port)</span>
                  <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
                    Port server VPS aktif (misal 3000 atau reverse proxy) tetap utuh dan tidak akan tertimpa konfigurasi lama.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRestore}
              disabled={restoring || !selectedFile}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sedang Mengekstrak dan Memulihkan Data...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Jalankan Restore Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hasil Restore Jika Sukses */}
      {restoreResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-900">
                {restoreResult.message}
              </h4>
              <p className="text-xs text-emerald-700">
                {restoreResult.preservedPortInfo}
              </p>
            </div>
          </div>

          {restoreResult.restoredItems && restoreResult.restoredItems.length > 0 && (
            <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/50 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Komponen Yang Berhasil Dipulihkan:
              </span>
              <ul className="space-y-1">
                {restoreResult.restoredItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-emerald-800">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Panduan Langkah Migrasi VPS */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>Panduan Praktis Migrasi VPS Baru</span>
        </div>
        <h3 className="text-lg font-bold text-white">
          Langkah Mudah Memindahkan Website ke VPS Lain:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h5 className="font-bold text-white text-sm">Download di VPS Lama</h5>
            <p className="text-slate-400 leading-relaxed">
              Buka menu ini di VPS lama, klik tombol <strong>"Download Backup Lengkap (.zip)"</strong> dan simpan file di komputer Anda.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h5 className="font-bold text-white text-sm">Deploy di VPS Baru</h5>
            <p className="text-slate-400 leading-relaxed">
              Siapkan VPS baru, tentukan port yang Anda inginkan (misal port 3000 atau port custom lain), lalu jalankan aplikasi.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h5 className="font-bold text-white text-sm">Restore & Port Terjaga</h5>
            <p className="text-slate-400 leading-relaxed">
              Login ke admin di VPS baru, pilih file backup, pastikan opsi <strong>"Kecualikan Port"</strong> aktif, lalu klik Restore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
