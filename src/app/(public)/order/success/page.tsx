import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, ArrowRight, Home } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber || '';
  const method = resolvedParams.method || '';

  const site = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  const waNumber = site?.whatsappNumber.replace(/[^0-9]/g, '') || '6281234567890';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Pesanan Berhasil Dicatat
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terima Kasih Atas Pesanan Anda!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Pesanan Anda telah masuk ke sistem kami dan sedang disiapkan oleh tim logistik.
        </p>
      </div>

      {orderNumber && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Nomor Referensi Pesanan:</span>
          <p className="font-mono font-bold text-lg text-slate-800 tracking-wide">{orderNumber}</p>
        </div>
      )}

      {method === 'BANK_TRANSFER' && (
        <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-100 max-w-lg mx-auto text-left space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Instruksi Pembayaran Transfer Bank:</h3>
          <p className="text-slate-600">
            Silakan lakukan transfer ke rekening resmi {site?.companyName || 'Jangkriknet'}:
          </p>
          <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1 font-mono">
            <p className="font-bold text-slate-900">BCA: 123-456-7890</p>
            <p className="text-slate-500">A/N: PT Jangkriknet Indonesia</p>
          </div>
          <p className="text-slate-500">
            Setelah transfer, kirimkan bukti transfer Anda melalui WhatsApp untuk proses verifikasi kilat.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Halo ${site?.companyName || 'Jangkriknet'}, saya ingin konfirmasi pesanan dengan nomor: ${orderNumber}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Konfirmasi Pesanan via WhatsApp</span>
          </a>
        )}

        <Link
          href="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>Lanjut Belanja</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
