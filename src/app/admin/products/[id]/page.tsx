'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) setProduct(data.product);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span>Memuat data produk...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="font-semibold text-lg">Produk tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Edit Produk: {product.name}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Perbarui rincian produk, harga diskon, stok dan galeri foto
        </p>
      </div>

      <ProductForm initialData={product} productId={id} />
    </div>
  );
}
