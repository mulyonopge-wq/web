'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function FaqsAdminPage() {
  const toast = useToast();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/content/faqs');
      const data = await res.json();
      if (data.items) setFaqs(data.items);
    } catch (e) {
      toast.error('Gagal memuat FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, order: faqs.length + 1 }),
      });
      if (res.ok) {
        toast.success('Pertanyaan FAQ berhasil ditambahkan!');
        setModalOpen(false);
        setForm({ question: '', answer: '' });
        await fetchFaqs();
      }
    } catch (e) {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pertanyaan ini?')) return;
    try {
      const res = await fetch(`/api/content/faqs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('FAQ dihapus!');
        await fetchFaqs();
      }
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            FAQ (Pertanyaan & Jawaban)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar tanya jawab umum untuk membantu calon pembeli
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pertanyaan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {faqs.map((f) => (
          <div key={f.id} className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1.5 pr-4">
              <h4 className="font-bold text-slate-800 text-sm">{f.question}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{f.answer}</p>
            </div>
            <button
              onClick={() => handleDelete(f.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 text-base mb-4">Tambah Tanya Jawab (FAQ)</h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Pertanyaan *</label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Apakah produk memiliki garansi resmi?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Jawaban *</label>
                <textarea
                  rows={4}
                  required
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Ya, seluruh produk bergaransi resmi 1-2 tahun..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Simpan FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
