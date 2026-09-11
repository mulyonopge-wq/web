export interface CatalogBannerConfig {
  badge: string;
  title: string;
  subtitle: string;
  counterLabel: string;
  showCounter: boolean;
  bgType: 'dark' | 'navy' | 'emerald' | 'purple' | 'custom';
  bgImageUrl?: string;
}

export const defaultCatalogBanner: CatalogBannerConfig = {
  badge: 'Katalog Produk & Toko Online',
  title: 'Peralatan & Aksesoris Terlengkap',
  subtitle: 'Temukan router, switch PoE, CCTV, kabel Cat8, dan berbagai perangkat mutakhir bergaransi resmi.',
  counterLabel: 'Produk Tersedia',
  showCounter: true,
  bgType: 'dark',
  bgImageUrl: '',
};
