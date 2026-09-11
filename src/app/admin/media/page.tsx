'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  Check,
  Film,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { isVideoUrl } from '@/lib/media';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaLibraryAdminPage() {
  const toast = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const fetchMedia = async (targetId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '40');

      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
        if (data.media.length > 0) {
          if (targetId) {
            setSelectedId(targetId);
          } else if (!selectedId || !data.media.some((m: MediaItem) => m.id === selectedId)) {
            // Auto select latest image by default
            setSelectedId(data.media[0].id);
          }
        }
      }
    } catch (e) {
      toast.error('Gagal memuat media library');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('File berhasil diunggah dan otomatis terpilih!');
        await fetchMedia(data.mediaId || undefined);
      } else {
        toast.error(data.error || 'Gagal mengunggah');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat mengunggah');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus file media ini dari server?')) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Media berhasil dihapus!');
        if (selectedId === id) setSelectedId(null);
        await fetchMedia();
      } else {
        toast.error('Gagal menghapus media');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    toast.success('URL gambar disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const selectedMedia = mediaList.find((m) => m.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Media Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pusat penyimpanan foto, icon, dan banner aset website tanpa coding
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="media-page-upload"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="media-page-upload"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer inline-flex"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Media Baru</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Search Bar & Selected Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs max-w-sm w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari file berdasarkan nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {selectedMedia && (
          <div className="bg-blue-50/80 border border-blue-200/70 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs text-blue-900 shadow-xs">
            <div className="flex items-center gap-1.5 font-medium truncate max-w-xs sm:max-w-md">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">
                Terpilih: <strong>{selectedMedia.originalName}</strong>
                {mediaList[0]?.id === selectedMedia.id && ' (Terbaru)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => copyUrl(selectedMedia.id, selectedMedia.url)}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedId === selectedMedia.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Salin URL</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span>Memuat media library...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto opacity-25" />
          <h3 className="font-bold text-slate-700 text-base">Media Library Kosong</h3>
          <p className="text-xs max-w-sm mx-auto">
            Klik tombol "Upload Media Baru" di kanan atas untuk mengunggah aset gambar pertama Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((m, idx) => {
            const isVideo = isVideoUrl(m.url) || m.mimeType?.startsWith('video/');
            const isSelected = selectedId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 ring-4 ring-blue-50'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-sm z-10">
                    Terbaru
                  </div>
                )}

                <div className="aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                      <video
                        src={m.url}
                        className="w-full h-full object-cover opacity-80"
                        muted
                        playsInline
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 z-10">
                        <Film className="w-3 h-3 text-amber-400" />
                        <span>VIDEO</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={m.url}
                      alt={m.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(m.id, m.url);
                    }}
                    title="Salin URL Gambar"
                    className="p-2 bg-white text-slate-800 rounded-xl hover:bg-slate-100 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Buka Gambar Asli"
                    className="p-2 bg-white text-slate-800 rounded-xl hover:bg-slate-100 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(m.id);
                    }}
                    title="Hapus File"
                    className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-50 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 border-t border-slate-100 text-xs bg-white">
                  <p className="font-semibold text-slate-800 truncate" title={m.originalName}>
                    {m.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{formatFileSize(m.size)}</span>
                    <span>{m.mimeType.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
