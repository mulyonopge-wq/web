'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Image as ImageIcon, Loader2, Film, Play } from 'lucide-react';
import { isVideoUrl } from '@/lib/media';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Pilih atau Upload Gambar',
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media?limit=30');
      const data = await res.json();
      if (data.media) setMediaList(data.media);
    } catch (e) {
      console.error('Failed to load media', e);
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
      if (data.success && data.url) {
        setSelectedUrl(data.url);
        await fetchMedia();
        setActiveTab('library');
      } else {
        alert(data.error || 'Gagal mengunggah file');
      }
    } catch (e) {
      console.error('Upload error', e);
      alert('Terjadi kesalahan saat mengunggah');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'url' && customUrl) {
      onSelect(customUrl);
    } else if (selectedUrl) {
      onSelect(selectedUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('library');
            }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('upload');
            }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload Baru
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('url');
            }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            URL Gambar
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'library' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm">Memuat media library...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-slate-600">Belum ada media</p>
                  <p className="text-sm mt-1">Upload gambar baru untuk mulai menggunakannya.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaList.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    const isVideo = isVideoUrl(item.url) || item.mimeType?.startsWith('video/');
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer aspect-square bg-slate-900 transition-all ${
                          isSelected
                            ? 'border-blue-600 ring-4 ring-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isVideo ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover opacity-80"
                              muted
                              playsInline
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-1">
                              <Film className="w-3 h-3 text-amber-400" />
                              <span>VIDEO</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.originalName}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                            <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate">{item.originalName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="modal-upload"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="modal-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  {uploading ? 'Mengunggah file...' : 'Klik untuk memilih Foto atau Video'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Format yang didukung: JPG, PNG, WebP, MP4, WebM (Maks. 50MB).
                </p>
              </label>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Masukkan URL Gambar Langsung
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/gambar.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {customUrl && (
                <div className="mt-4 rounded-xl border border-slate-100 p-3 bg-slate-50 inline-block">
                  <p className="text-xs text-slate-500 mb-2 font-medium">Preview:</p>
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain"
                    onError={() => {}}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400 truncate max-w-xs">
            {activeTab === 'url'
              ? customUrl || 'Belum ada URL'
              : selectedUrl || 'Belum ada gambar yang dipilih'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={activeTab === 'url' ? !customUrl : !selectedUrl}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Pilih Gambar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
