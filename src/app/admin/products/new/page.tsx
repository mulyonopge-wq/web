'use client';

import React from 'react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Tambah Produk Baru
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Lengkapi data barang, harga promo, spesifikasi teknis dan stok produk
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
