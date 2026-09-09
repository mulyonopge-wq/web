'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah } from '@/lib/currency';
import { useCart } from '@/context/CartContext';

export default function ShoppingCartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10 opacity-30" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Keranjang Belanja Kosong</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Anda belum menambahkan produk ke keranjang. Jelajahi katalog produk kami untuk memulai pemesanan.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-theme-primary text-white font-bold text-xs shadow-lg shadow-theme-primary/25 hover:scale-102 transition-transform"
        >
          <span>Mulai Belanja Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Keranjang Belanja Anda
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Periksa kembali rincian produk sebelum melanjutkan ke pembayaran
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                      SKU: {item.sku}
                    </span>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-bold text-slate-800 text-sm hover:text-theme-primary transition-colors block line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="font-bold text-theme-primary text-xs">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 self-end sm:self-center">
                  {/* Quantity control */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-24">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Lanjut Berbelanja</span>
            </Link>
            <button
              onClick={clearCart}
              className="font-semibold text-rose-600 hover:underline"
            >
              Kosongkan Keranjang
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b pb-3">
            Ringkasan Pesanan
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Item:</span>
              <span className="font-bold">{totalItems} barang</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimasi Ongkir:</span>
              <span className="text-slate-400">Dihitung saat checkout</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Belanja:</span>
              <span className="text-xl font-black text-theme-primary">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-6 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-theme-primary/30 transition-all hover:scale-102"
          >
            <span>Lanjut ke Pembayaran / Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Transaksi aman terenkripsi. Dukungan Transfer Bank, COD, dan Pemesanan Langsung via WhatsApp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
