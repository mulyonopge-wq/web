'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Package,
} from 'lucide-react';
import { formatRupiah } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    city: '',
    district: '',
    postalCode: '',
    customerNotes: '',
    paymentMethod: 'WHATSAPP', // WHATSAPP, BANK_TRANSFER, COD
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Keranjang belanja Anda kosong');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        toast.success('Pesanan berhasil dibuat!');

        // If WhatsApp checkout, open WhatsApp directly
        if (form.paymentMethod === 'WHATSAPP' && data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }

        // Navigate to order success page
        router.push(`/order/success?orderNumber=${data.order.orderNumber}&method=${form.paymentMethod}`);
      } else {
        toast.error(data.error || 'Gagal memproses checkout');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Keranjang Belanja Kosong</h2>
        <p className="text-xs text-slate-500">Silakan pilih produk terlebih dahulu sebelum melakukan checkout.</p>
        <Link href="/products" className="inline-block px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Formulir Pemesanan & Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data penerima dan pilih metode pembayaran yang diinginkan
        </p>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Customer & Address Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">
              1. Informasi Kontak Pembeli
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap Penerima *
              </label>
              <input
                type="text"
                name="customerName"
                required
                value={form.customerName}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="text"
                  name="customerPhone"
                  required
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="budi@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">
              2. Alamat Tujuan Pengiriman
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Jalan & Nomor Rumah/Gedung *
              </label>
              <textarea
                rows={2}
                name="shippingAddress"
                required
                value={form.shippingAddress}
                onChange={handleChange}
                placeholder="Jl. Melati No. 12 RT 01 / RW 05"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Jakarta Pusat"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kecamatan
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Menteng"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="10310"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Tambahan untuk Penjual / Kurir
              </label>
              <input
                type="text"
                name="customerNotes"
                value={form.customerNotes}
                onChange={handleChange}
                placeholder="Contoh: Titipkan di pos satpam bila rumah kosong"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">
              3. Pilih Metode Pembayaran
            </h3>

            <div className="space-y-3">
              {/* Option 1: WhatsApp Checkout */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  form.paymentMethod === 'WHATSAPP'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WHATSAPP"
                  checked={form.paymentMethod === 'WHATSAPP'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Pesanan via WhatsApp (Rekomendasi)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Cepat & Mudah
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pesanan otomatis terhubung ke WhatsApp toko kami untuk konfirmasi stok, negosiasi ongkir, dan pembayaran instan.
                  </p>
                </div>
              </label>

              {/* Option 2: Bank Transfer */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  form.paymentMethod === 'BANK_TRANSFER'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={form.paymentMethod === 'BANK_TRANSFER'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Transfer Bank Manual</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Transfer ke rekening resmi perusahaan (BCA, Mandiri, BRI, BNI). Instruksi rekening akan diberikan setelah konfirmasi.
                  </p>
                </div>
              </label>

              {/* Option 3: COD */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  form.paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={form.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">COD (Bayar di Tempat)</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Bayar langsung ke kurir saat barang tiba di alamat pengiriman Anda (wilayah tertentu).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Items Review & Place Order Button */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b pb-3">
            Ringkasan Produk Dipesan
          </h3>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-slate-400">
                    {formatRupiah(item.price)} x {item.quantity} unit
                  </p>
                </div>
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Qty:</span>
              <span className="font-bold">{totalItems} barang</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Total Bayar:</span>
              <span className="text-2xl font-black text-theme-primary">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-sm shadow-xl shadow-theme-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-102 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses Pesanan...</span>
              </>
            ) : form.paymentMethod === 'WHATSAPP' ? (
              <>
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>Kirim Pesanan via WhatsApp</span>
              </>
            ) : (
              <span>Selesaikan Pemesanan</span>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Dengan mengklik tombol di atas, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi toko kami.
          </p>
        </div>
      </form>
    </div>
  );
}
