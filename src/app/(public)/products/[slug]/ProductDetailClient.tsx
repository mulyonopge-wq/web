'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  MessageCircle,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Check,
  FileText,
  Package,
  Film,
  Play,
} from 'lucide-react';
import { formatRupiah } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { isVideoUrl } from '@/lib/media';

interface ProductDetailClientProps {
  product: any;
  whatsappNumber: string;
  companyName: string;
}

export default function ProductDetailClient({
  product,
  whatsappNumber,
  companyName,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(
    product.mainImage || (product.images?.[0]?.imageUrl ?? '')
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        price: finalPrice,
        image: product.mainImage || undefined,
        stock: product.stock,
      },
      quantity
    );
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleWhatsAppOrder = () => {
    const totalAmount = finalPrice * quantity;
    const msg = `Halo ${companyName},\n\nSaya ingin memesan produk:\n- ${product.name} (SKU: ${product.sku}) x ${quantity} unit\nTotal Harga: ${formatRupiah(totalAmount)}\n\nApakah stok masih tersedia dan bisa dikirim hari ini?`;
    const url = generateWhatsAppUrl(whatsappNumber, msg);
    window.open(url, '_blank');
  };

  // Compile all images (mainImage + gallery)
  const allImages = [
    ...(product.mainImage ? [{ imageUrl: product.mainImage }] : []),
    ...(product.images || []),
  ].filter(
    (img, idx, arr) => arr.findIndex((x) => x.imageUrl === img.imageUrl) === idx
  );

  const isMainVideo = isVideoUrl(selectedImage);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left 6 Cols: Photo & Video Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950/5 border border-slate-200/80 shadow-xs flex items-center justify-center">
            {selectedImage ? (
              isMainVideo ? (
                <video
                  src={selectedImage}
                  controls
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-contain bg-black rounded-3xl"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Package className="w-16 h-16 opacity-30" />
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md z-10">
                DISKON {discountPercent}%
              </span>
            )}
            {isMainVideo && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md flex items-center gap-1.5 z-10">
                <Film className="w-3.5 h-3.5" />
                Video Demo
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => {
                const isVid = isVideoUrl(img.imageUrl);
                const isSelected = selectedImage === img.imageUrl;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-slate-100 transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-theme-primary ring-2 ring-theme-primary/20 scale-102'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isVid ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        <video
                          src={img.imageUrl}
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-6 h-6 text-white drop-shadow fill-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[8px] font-black bg-purple-600 text-white rounded">
                          VID
                        </span>
                      </div>
                    ) : (
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 6 Cols: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              SKU: {product.sku}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-xs font-semibold text-theme-primary mt-2">
                Kategori: {product.category.name}
              </p>
            )}
          </div>

          {/* Price Tag */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-theme-primary">
              {formatRupiah(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through font-medium">
                {formatRupiah(product.price)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDesc && (
            <p className="text-sm text-slate-600 leading-relaxed">{product.shortDesc}</p>
          )}

          {/* Stock Info */}
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-slate-500">Ketersediaan:</span>
            {product.stock > 0 ? (
              <span className="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Stok Tersedia ({product.stock} unit)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-800">
                Stok Habis
              </span>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-semibold text-slate-700">Jumlah:</span>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold font-mono">{quantity}</span>
              <button
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-2.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification when added to cart */}
          {addedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Berhasil ditambahkan ke keranjang belanja!</span>
            </div>
          )}

          {/* Action Buttons: Add to Cart & Direct WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah ke Keranjang</span>
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Pesan Cepat via WA</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-theme-primary" />
              <span>Garansi Resmi 100% Asli</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-theme-primary" />
              <span>Packing Kayu & Bubble Wrap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Specifications & Long Description */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b pb-4 mb-4">
            Rincian Lengkap Produk
          </h3>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.longDesc || product.shortDesc || 'Tidak ada deskripsi detail'}
          </div>
        </div>

        {/* Specs Table */}
        {product.specs && product.specs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b pb-4 mb-4">
              Spesifikasi Teknis
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-w-2xl">
              {product.specs.map((s: any, idx: number) => (
                <div key={idx} className="flex text-xs">
                  <div className="w-1/3 p-3.5 bg-slate-50 font-semibold text-slate-700">
                    {s.key}
                  </div>
                  <div className="w-2/3 p-3.5 text-slate-800 font-medium">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
