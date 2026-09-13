'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Wallet,
  ArrowRight,
  MessageCircle,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import ProductCard from './ProductCard';

interface SectionRendererProps {
  section: {
    id: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
  };
  siteSettings: any;
  categories: any[];
  featuredProducts: any[];
  testimonials: any[];
  faqs: any[];
}

export default function SectionRenderer({
  section,
  siteSettings,
  categories,
  featuredProducts,
  testimonials,
  faqs,
}: SectionRendererProps) {
  let content: any = {};
  try {
    content = section.content ? JSON.parse(section.content) : {};
  } catch (e) {
    content = {};
  }

  const { type, title, subtitle } = section;
  const waNumber = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  // 1. HERO SECTION
  if (type === 'HERO') {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white py-20 lg:py-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-theme-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {content.badgeText && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{content.badgeText}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {title || 'Solusi Digital & Peralatan Terlengkap'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {subtitle || 'Tingkatkan produktivitas bisnis Anda dengan produk berkualitas tinggi.'}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={content.primaryBtnLink || '/products'}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-sm shadow-xl shadow-theme-primary/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <span>{content.primaryBtnText || 'Mulai Belanja'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={content.secondaryBtnLink || '/company'}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
                >
                  <span>{content.secondaryBtnText || 'Profil Perusahaan'}</span>
                </Link>
              </div>


            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-4/3 bg-slate-800">
                <img
                  src={
                    content.heroImageUrl ||
                    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&q=80'
                  }
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                  <p className="font-bold text-sm truncate">{siteSettings.companyName}</p>
                  <p className="text-xs text-slate-300 truncate">{siteSettings.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. ABOUT SECTION
  if (type === 'ABOUT') {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-4/3 bg-slate-100">
                <img
                  src={
                    content.imageUrl ||
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
                  }
                  alt="About Us"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-primary px-3 py-1 rounded-full bg-theme-primary/10 inline-block">
                Tentang Kami
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {title || 'Dedikasi Terbaik untuk Indonesia'}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {content.description ||
                  subtitle ||
                  (siteSettings.aboutText && !siteSettings.aboutText.toLowerCase().includes('jangkriknet') ? siteSettings.aboutText : null) ||
                  siteSettings.shortDescription}
              </p>

              <div className="pt-2">
                <Link
                  href={content.buttonLink || '/company'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>{content.buttonText || 'Pelajari Selengkapnya'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. ADVANTAGES SECTION
  if (type === 'ADVANTAGES') {
    const iconMap: Record<string, any> = {
      ShieldCheck: ShieldCheck,
      Truck: Truck,
      Headphones: Headphones,
      Wallet: Wallet,
    };

    const items = content.items || [
      { icon: 'ShieldCheck', title: '100% Produk Asli', desc: 'Produk dengan garansi resmi dan kemudahan klaim.' },
      { icon: 'Truck', title: 'Pengiriman Cepat & Aman', desc: 'Packing rapi dan asuransi pengiriman terjamin.' },
      { icon: 'Headphones', title: 'Dukungan Siaga 24/7', desc: 'Dukungan customer service responsif via WhatsApp.' },
      { icon: 'Wallet', title: 'Harga Kompetitif', desc: 'Penawaran harga terbaik untuk eceran maupun instansi.' },
    ];

    return (
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || 'Keunggulan Kami'}
            </h2>
            {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item: any, idx: number) => {
              const IconComp = iconMap[item.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center mb-5">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 4. CATEGORIES SECTION
  if (type === 'CATEGORIES') {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {title || 'Kategori Produk'}
              </h2>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              <span>{content.buttonText || 'Lihat Semua Kategori'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
                    {cat.description || 'Jelajahi produk'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 5. FEATURED PRODUCTS SECTION
  if (type === 'FEATURED_PRODUCTS') {
    return (
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Paling Diminati</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {title || 'Produk Unggulan'}
              </h2>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              <span>{content.buttonText || 'Lihat Semua Produk'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                whatsappNumber={siteSettings.whatsappNumber}
                companyName={siteSettings.companyName}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 6. PROMO BANNER SECTION
  if (type === 'PROMO_BANNER') {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl bg-gradient-to-r ${
              content.bgGradient || 'from-blue-700 to-indigo-900'
            }`}
          >
            <div className="max-w-xl relative z-10 space-y-4">
              {content.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider inline-block">
                  {content.badge}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {title || 'Penawaran Spesial Terbatas'}
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {subtitle || 'Dapatkan potongan harga khusus untuk pembelian paket bulan ini.'}
              </p>
              <div className="pt-2">
                <Link
                  href={content.buttonLink || '/products'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md transition-colors"
                >
                  <span>{content.buttonText || 'Beli Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 7. STATS SECTION
  if (type === 'STATS') {
    const statsList = content.stats || [
      { number: '15.000+', label: 'Produk Terjual' },
      { number: '1.200+', label: 'Mitra & Perusahaan' },
      { number: '99.4%', label: 'Tingkat Kepuasan' },
      { number: '50+', label: 'Kota Terjangkau' },
    ];

    return (
      <section className="py-20 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {title || 'Pencapaian Nyata'}
            </h2>
            {subtitle && <p className="text-sm text-slate-400 mt-2">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {statsList.map((st: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-2 font-mono">
                  {st.number}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 8. TESTIMONIALS SECTION
  if (type === 'TESTIMONIALS') {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || 'Apa Kata Pelanggan Kami?'}
            </h2>
            {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{t.content}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {t.role} {t.company ? `• ${t.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 9. FAQ SECTION
  if (type === 'FAQ') {
    return (
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || 'Pertanyaan yang Sering Diajukan'}
            </h2>
            {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
          </div>

          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 open:shadow-xs transition-all"
              >
                <summary className="font-bold text-slate-900 text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>{f.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 10. CTA SECTION
  if (type === 'CTA') {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {title || 'Siap Mengoptimalkan Koneksi Anda?'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {subtitle || 'Konsultasikan kebutuhan Anda sekarang dengan tim spesialis kami.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {waNumber && (
              <a
                href={
                  content.primaryBtnLink ||
                  `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo ' + siteSettings.companyName + ', saya ingin bertanya mengenai pemesanan produk.')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{content.primaryBtnText || 'Hubungi via WhatsApp'}</span>
              </a>
            )}

            <Link
              href={content.secondaryBtnLink || '/products'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
            >
              <span>{content.secondaryBtnText || 'Lihat Katalog Produk'}</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Default fallback
  return null;
}
