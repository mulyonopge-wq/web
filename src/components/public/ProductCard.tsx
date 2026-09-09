'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, MessageCircle, Star, Image as ImageIcon, Film } from 'lucide-react';
import { formatRupiah } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { isVideoUrl } from '@/lib/media';

interface ProductCardProps {
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    mainImage?: string | null;
    category?: { name: string; slug: string } | null;
  };
  whatsappNumber?: string;
  companyName?: string;
}

export default function ProductCard({
  product,
  whatsappNumber = '6281234567890',
  companyName = 'Jangkriknet',
}: ProductCardProps) {
  const { addItem } = useCart();

  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isVideo = isVideoUrl(product.mainImage);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      price: finalPrice,
      image: product.mainImage || undefined,
      stock: product.stock,
    });
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const msg = `Halo ${companyName},\n\nSaya ingin memesan produk:\n- ${product.name} (SKU: ${product.sku})\nHarga: ${formatRupiah(finalPrice)}\n\nApakah stok masih tersedia?`;
    const url = generateWhatsAppUrl(whatsappNumber, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-theme-primary/50 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image / Video Container */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
          {product.mainImage ? (
            isVideo ? (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                <video
                  src={product.mainImage}
                  muted
                  playsInline
                  autoPlay
                  loop
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-600/90 backdrop-blur-xs text-white flex items-center gap-1 shadow-md">
                  <Film className="w-3 h-3" />
                  VIDEO
                </span>
              </div>
            ) : (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon className="w-12 h-12 opacity-40" />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-md shadow-rose-600/30 tracking-wide z-10">
              HEMAT {discountPercent}%
            </span>
          )}

          {/* Stock badge if out of stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
              <span className="px-3 py-1 bg-white text-rose-600 rounded-full font-bold text-xs uppercase tracking-wider shadow-md">
                Stok Habis
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-[11px] font-bold text-slate-400 hover:text-theme-primary uppercase tracking-wider transition-colors mb-1.5 inline-block"
            >
              {product.category.name}
            </Link>
          )}

          <Link href={`/products/${product.slug}`} className="block group-hover:text-theme-primary transition-colors">
            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-theme-primary">
              {formatRupiah(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatRupiah(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0 grid grid-cols-2 gap-2 border-t border-slate-100 mt-2">
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          title="Tambah ke Keranjang"
          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Keranjang</span>
        </button>

        <button
          onClick={handleWhatsAppOrder}
          title="Pesan via WhatsApp"
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Beli via WA</span>
        </button>
      </div>
    </div>
  );
}
