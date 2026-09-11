import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@example.com',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Site Settings
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Jangkriknet',
      tagline: 'Solusi Digital, Jaringan & Produk Unggulan Indonesia',
      logoUrl: '',
      faviconUrl: '',
      shortDescription: 'Perusahaan terdepan penyedia perangkat jaringan, IoT, dan teknologi komunikasi berkualitas tinggi.',
      aboutText: 'Jangkriknet berdiri untuk menghadirkan konektivitas andal dan produk teknologi terbaik bagi perorangan, UMKM, hingga enterprise di seluruh Indonesia.',
      address: 'Jl. Merdeka Raya No. 45, Jakarta Pusat 10110',
      city: 'Jakarta Pusat',
      phone: '+62 21 555 1234',
      whatsappNumber: '6281234567890',
      whatsappTemplate: `Halo [NAMA TOKO],

Saya ingin melakukan pemesanan:

Produk:
[PRODUK]

Total: [TOTAL]
Nama: [NAMA]
Alamat: [ALAMAT]
Catatan: [CATATAN]`,
      email: 'info@jangkriknet.com',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d11183.824047264172!2d112.66743809096525!3d-7.674665806657092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1789089343231!5m2!1sid!2sid',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com/jangkriknet',
      tiktokUrl: 'https://tiktok.com/@jangkriknet',
      youtubeUrl: 'https://youtube.com/@jangkriknet',
      linkedinUrl: 'https://linkedin.com/company/jangkriknet',
      footerText: 'Mitra andal kebutuhan perangkat jaringan dan teknologi masa depan Anda.',
      copyrightText: '© 2026 Jangkriknet. All Rights Reserved.',
      metaTitle: 'Jangkriknet - Official Company Profile & Toko Online',
      metaDescription: 'Pusat belanja perangkat jaringan, IoT, dan aksesoris teknologi terpercaya dengan pengiriman ke seluruh nusantara.',
      metaKeywords: 'jangkriknet, toko jaringan, router wifi, cctv iot, kabel lan, company profile indonesia',
    },
  });
  console.log('✅ Site settings seeded');

  // 3. Theme Setting
  await prisma.themeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      primaryColor: '#1d4ed8',
      secondaryColor: '#475569',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      borderRadius: 'rounded-lg',
      buttonStyle: 'solid',
      layout: 'full',
      headerStyle: 'modern',
    },
  });
  console.log('✅ Theme settings seeded');

  // 4. Company Profile
  await prisma.companyProfile.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      history: 'Didirikan pada tahun 2018 di Jakarta, Jangkriknet berawal dari komitmen sekelompok insinyur jaringan untuk memberikan solusi konektivitas yang stabil dan terjangkau bagi UMKM. Seiring berjalannya waktu, kami berkembang menjadi distributor resmi perangkat jaringan, solusi keamanan IoT, dan infrastruktur kabel fiber optik yang melayani ribuan klien di lebih dari 50 kota di Indonesia.',
      vision: 'Menjadi pemimpin pasar dalam solusi perangkat keras jaringan dan IoT yang dipercaya oleh masyarakat dan pelaku bisnis di seluruh Indonesia.',
      mission: '1. Menyediakan produk teknologi dan jaringan orisinal berkualitas tinggi bergaransi resmi.\n2. Memberikan layanan konsultasi dan dukungan teknis purna jual yang responsif dan ramah.\n3. Membangun kemitraan strategis dengan distributor global dan teknisi lokal di seluruh Indonesia.',
      valuesJson: JSON.stringify([
        { title: 'Integritas Tinggi', desc: 'Selalu transparan dan mengutamakan kejujuran dalam setiap transaksi dan kemitraan.' },
        { title: 'Kualitas Orisinal', desc: 'Seluruh barang 100% bergaransi resmi dan lolos pengujian mutu ketat.' },
        { title: 'Inovasi Cepat', desc: 'Terus mengadopsi standar teknologi terbaru untuk kecepatan dan keandalan maksimal.' },
        { title: 'Fokus Pelanggan', desc: 'Kepuasan dan kelancaran operasional pelanggan adalah prioritas nomor satu kami.' },
      ]),
      advantagesJson: JSON.stringify([
        { title: 'Produk 100% Orisinal', desc: 'Garansi resmi distributor dan jaminan uang kembali jika barang tidak asli.' },
        { title: 'Pengiriman Kilat & Aman', desc: 'Bekerja sama dengan ekspedisi terpercaya dengan asuransi pengiriman penuh.' },
        { title: 'Konsultasi Teknis Gratis', desc: 'Bantuan pemilihan spesifikasi perangkat oleh tim teknisi bersertifikat.' },
        { title: 'Metode Pembayaran Fleksibel', desc: 'Dukungan transfer bank otomatis, COD, dan pesanan langsung via WhatsApp.' },
      ]),
      teamJson: JSON.stringify([
        { name: 'Bambang Sudarmo, S.T.', role: 'Chief Executive Officer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
        { name: 'Rina Anggraini, M.M.', role: 'Head of Operations & Logistics', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
        { name: 'Fajar Nugroho', role: 'Lead Technical Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
      ]),
      certificationsJson: JSON.stringify([
        'Sertifikasi ISO 9001:2015 Sistem Manajemen Mutu',
        'Sertifikat Resmi DJPPI Kominfo Postel Indonesia',
        'Authorized Distributor Partnership 2026',
      ]),
      legalitiesJson: JSON.stringify([
        { label: 'Nomor Induk Berusaha (NIB)', value: '9120304912001' },
        { label: 'NPWP Perusahaan', value: '01.890.123.4-012.000' },
        { label: 'SK Pengesahan Kemenkumham', value: 'AHU-0038921.AH.01.01.2018' },
        { label: 'Izin Usaha Perdagangan Elektronik', value: 'SIUP-EL/2021/JKT-04' },
      ]),
    },
  });
  console.log('✅ Company profile seeded');

  // 5. Navigation Items
  const navItems = [
    { label: 'Beranda', url: '/', order: 1 },
    { label: 'Profil Perusahaan', url: '/company', order: 2 },
    { label: 'Katalog Produk', url: '/products', order: 3 },
    { label: 'Artikel & Berita', url: '/blog', order: 4 },
    { label: 'Hubungi Kami', url: '/contact', order: 5 },
  ];

  await prisma.navigation.deleteMany({});
  for (const item of navItems) {
    await prisma.navigation.create({ data: item });
  }
  console.log('✅ Navigation items seeded');

  // 6. Homepage Sections (Visual Builder)
  const sections = [
    {
      type: 'HERO',
      title: 'Konektivitas Cepat & Produk Digital Terpercaya',
      subtitle: 'Tingkatkan produktivitas bisnis dan kenyamanan rumah Anda dengan perangkat jaringan mutakhir bergaransi resmi dari Jangkriknet.',
      content: JSON.stringify({
        primaryBtnText: 'Belanja Sekarang',
        primaryBtnLink: '/products',
        secondaryBtnText: 'Tentang Kami',
        secondaryBtnLink: '/company',
        badgeText: 'Diskon Spesial Musim Ini Hingga 30%',
        heroImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',
      }),
      order: 1,
      isActive: true,
    },
    {
      type: 'ABOUT',
      title: 'Membangun Ekosistem Digital Indonesia',
      subtitle: 'Kenali lebih dekat komitmen dan dedikasi Jangkriknet',
      content: JSON.stringify({
        description: 'Kami berdedikasi menghadirkan perlengkapan teknologi terdepan dengan harga bersahabat dan jaminan purna jual terpercaya. Dari kebutuhan router rumah hingga perangkat infrastruktur skala kantor.',
        buttonText: 'Pelajari Profil Lengkap',
        buttonLink: '/company',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      }),
      order: 2,
      isActive: true,
    },
    {
      type: 'ADVANTAGES',
      title: 'Mengapa Memilih Jangkriknet?',
      subtitle: 'Standar keunggulan yang membedakan kami dari yang lain',
      content: JSON.stringify({
        items: [
          { icon: 'ShieldCheck', title: '100% Produk Asli', desc: 'Produk asli dengan garansi resmi dan kemudahan klaim garansi.' },
          { icon: 'Truck', title: 'Pengiriman Aman & Cepat', desc: 'Packing kayu & bubble wrap tebal dengan asuransi pengiriman terjamin.' },
          { icon: 'Headphones', title: 'Bantuan Teknis Siaga', desc: 'Dukungan ramah oleh teknisi berpengalaman siap melayani kebutuhan Anda.' },
          { icon: 'Wallet', title: 'Harga Kompetitif', desc: 'Penawaran harga terbaik untuk pembelian eceran maupun kuantitas besar.' },
        ],
      }),
      order: 3,
      isActive: true,
    },
    {
      type: 'CATEGORIES',
      title: 'Jelajahi Kategori Produk',
      subtitle: 'Temukan berbagai perlengkapan sesuai kebutuhan spesifik Anda',
      content: JSON.stringify({
        buttonText: 'Lihat Semua Kategori',
        buttonLink: '/products',
      }),
      order: 4,
      isActive: true,
    },
    {
      type: 'FEATURED_PRODUCTS',
      title: 'Produk Pilihan & Terlaris',
      subtitle: 'Koleksi perlengkapan jaringan terfavorit pilihan pelanggan kami',
      content: JSON.stringify({
        limit: 8,
        buttonText: 'Lihat Semua Produk',
        buttonLink: '/products',
      }),
      order: 5,
      isActive: true,
    },
    {
      type: 'PROMO_BANNER',
      title: 'Upgrade Jaringan Kantor Anda Sekarang',
      subtitle: 'Dapatkan potongan harga khusus untuk pembelian paket Switch & Router Enterprise bulan ini.',
      content: JSON.stringify({
        buttonText: 'Konsultasi Penawaran',
        buttonLink: '/contact',
        badge: 'PENAWARAN TERBATAS',
        bgGradient: 'from-blue-700 to-indigo-900',
      }),
      order: 6,
      isActive: true,
    },
    {
      type: 'STATS',
      title: 'Pencapaian & Kepercayaan Pelanggan',
      subtitle: 'Angka nyata bukti dedikasi kami melayani pelanggan',
      content: JSON.stringify({
        stats: [
          { number: '15.000+', label: 'Produk Terjual' },
          { number: '1.200+', label: 'Mitra & Perusahaan' },
          { number: '99.4%', label: 'Tingkat Kepuasan' },
          { number: '50+', label: 'Kota Terjangkau' },
        ],
      }),
      order: 7,
      isActive: true,
    },
    {
      type: 'TESTIMONIALS',
      title: 'Apa Kata Pelanggan Kami?',
      subtitle: 'Ulasan asli dari mitra dan pelanggan yang telah mempercayakan peralatannya kepada kami',
      content: JSON.stringify({}),
      order: 8,
      isActive: true,
    },
    {
      type: 'FAQ',
      title: 'Pertanyaan yang Sering Diajukan',
      subtitle: 'Temukan jawaban cepat untuk pertanyaan seputar produk dan pemesanan',
      content: JSON.stringify({}),
      order: 9,
      isActive: true,
    },
    {
      type: 'CTA',
      title: 'Siap Mengoptimalkan Koneksi Anda?',
      subtitle: 'Hubungi tim kami sekarang melalui WhatsApp untuk konsultasi produk atau pemesanan cepat.',
      content: JSON.stringify({
        primaryBtnText: 'Hubungi via WhatsApp',
        primaryBtnLink: 'https://wa.me/6281234567890',
        secondaryBtnText: 'Kunjungi Toko Online',
        secondaryBtnLink: '/products',
      }),
      order: 10,
      isActive: true,
    },
  ];

  await prisma.section.deleteMany({});
  for (const sec of sections) {
    await prisma.section.create({ data: sec });
  }
  console.log('✅ Homepage sections seeded');

  // 7. Categories
  const categoriesData = [
    {
      name: 'Perangkat Jaringan',
      slug: 'perangkat-jaringan',
      description: 'Router, Access Point, Switch, dan Modem berperforma tinggi.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80',
      order: 1,
    },
    {
      name: 'Kamera CCTV & IoT',
      slug: 'kamera-cctv-iot',
      description: 'Perangkat pintar keamanan rumah dan kantor berbasis cloud.',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80',
      order: 2,
    },
    {
      name: 'Kabel & Konektor',
      slug: 'kabel-konektor',
      description: 'Kabel UTP Cat6, Fiber Optic patch cord, dan konektor RJ45 berkualitas tinggi.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80',
      order: 3,
    },
    {
      name: 'Aksesoris & Power',
      slug: 'aksesoris-power',
      description: 'Mini UPS, Adaptor PoE, Rack Server, dan perlengkapan instalasi.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
      order: 4,
    },
  ];

  await prisma.category.deleteMany({});
  const createdCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = c.id;
  }
  console.log('✅ Categories seeded');

  // 8. Sample Products
  const productsData = [
    {
      sku: 'JK-RTR-01',
      name: 'Dual Band Gigabit WiFi 6 Router AX3000',
      slug: 'dual-band-gigabit-wifi-6-router-ax3000',
      shortDesc: 'Router berkecepatan tinggi hingga 3000 Mbps dengan jangkauan sinyal stabil untuk rumah & kantor.',
      longDesc: `Router WiFi 6 AX3000 dirancang khusus untuk memenuhi kebutuhan streaming 4K tanpa buffering, gaming online minim latensi, dan koneksi simultan hingga 60 perangkat pintar.

Fitur Unggulan:
- Kecepatan WiFi 6 hingga 2402 Mbps pada frekuensi 5 GHz dan 574 Mbps pada 2.4 GHz.
- 4 antena eksternal gain tinggi dengan teknologi Beamforming.
- Dukungan OFDMA dan MU-MIMO untuk efisiensi transfer data multi-perangkat.
- Port Gigabit WAN/LAN penuh untuk koneksi kabel maksimal.
- Pengaturan mudah lewat aplikasi smartphone berbahasa Indonesia.`,
      price: 680000,
      discountPrice: 599000,
      stock: 35,
      weight: 650,
      dimensions: '26 x 13 x 4 cm',
      categoryId: createdCategories['perangkat-jaringan'],
      isFeatured: true,
      mainImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
      specs: [
        { key: 'Standar WiFi', value: 'IEEE 802.11ax/ac/n/a 5 GHz, IEEE 802.11ax/n/b/g 2.4 GHz' },
        { key: 'Kecepatan', value: 'Hingga 3000 Mbps' },
        { key: 'Port', value: '1x Gigabit WAN, 3x Gigabit LAN' },
        { key: 'Garansi', value: '1 Tahun Garansi Resmi' },
      ],
    },
    {
      sku: 'JK-SW-08P',
      name: '8-Port Gigabit Smart Managed PoE+ Switch',
      slug: '8-port-gigabit-smart-managed-poe-switch',
      shortDesc: 'Switch manajemen jaringan 8 port PoE+ dengan daya total 120W, ideal untuk IP Camera dan Access Point.',
      longDesc: `Switch profesional dengan 8 port RJ45 Gigabit yang mendukung Power over Ethernet (PoE+ 802.3at/af). Memberikan daya dan data sekaligus dalam satu kabel jaringan untuk kamera pengawas atau pemancar WiFi. Dilengkapi bodi metal kokoh dan sistem pendingin tanpa kipas yang senyap.`,
      price: 1150000,
      discountPrice: 995000,
      stock: 20,
      weight: 1200,
      dimensions: '28 x 18 x 4.5 cm',
      categoryId: createdCategories['perangkat-jaringan'],
      isFeatured: true,
      mainImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
      specs: [
        { key: 'Jumlah Port', value: '8 Port Gigabit PoE+' },
        { key: 'Kapasitas PoE', value: 'Total 120W (Max 30W per port)' },
        { key: 'Bahan Casing', value: 'Metal Steel Industri' },
        { key: 'Garansi', value: '2 Tahun Garansi Resmi' },
      ],
    },
    {
      sku: 'JK-CAM-360',
      name: 'Smart Outdoor PTZ Security Camera 2K QHD',
      slug: 'smart-outdoor-ptz-security-camera-2k-qhd',
      shortDesc: 'Kamera CCTV tahan cuaca IP66 dengan resolusi 2K, fitur putar 360 derajat, dan Color Night Vision.',
      longDesc: `Pantau keamanan lingkungan kantor atau rumah Anda setiap saat dalam resolusi kristal 2K. Dilengkapi sensor inframerah dan lampu sorot LED untuk penglihatan malam berwarna (Full Color Night Vision). Terkoneksi langsung ke WiFi dan dapat diakses dari mana saja melalui smartphone.`,
      price: 490000,
      discountPrice: 425000,
      stock: 50,
      weight: 550,
      dimensions: '16 x 12 x 10 cm',
      categoryId: createdCategories['kamera-cctv-iot'],
      isFeatured: true,
      mainImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80',
      specs: [
        { key: 'Resolusi', value: '2K QHD (2304 x 1296 piksel)' },
        { key: 'Fitur Gerak', value: 'Pan 360°, Tilt 130°, Auto Tracking' },
        { key: 'Tahan Air', value: 'IP66 Weatherproof' },
        { key: 'Penyimpanan', value: 'MicroSD hingga 256GB / Cloud Storage' },
      ],
    },
    {
      sku: 'JK-KBL-C6',
      name: 'Kabel Jaringan UTP Cat6 Pure Copper 305 Meter',
      slug: 'kabel-jaringan-utp-cat6-pure-copper-305m',
      shortDesc: 'Roll kabel LAN Cat6 tembaga murni 24 AWG kecepatan hingga 1 Gbps / 10 Gbps untuk instalasi profesional.',
      longDesc: `Kabel roll 1 roll (305 meter / 1000 feet) Cat6 unshielded twisted pair dengan konduktor 100% tembaga murni (Oxygen-Free Copper). Menjamin transfer data kecepatan tinggi tanpa packet loss bahkan pada jarak jauh. Sangat cocok untuk instalasi gedung, data center, dan jaringan kantor.`,
      price: 1350000,
      discountPrice: null,
      stock: 18,
      weight: 13500,
      dimensions: '35 x 35 x 22 cm',
      categoryId: createdCategories['kabel-konektor'],
      isFeatured: false,
      mainImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
      specs: [
        { key: 'Kategori Kabel', value: 'UTP Category 6 (Cat6)' },
        { key: 'Material Inti', value: '100% Tembaga Murni (Bare Copper) 24 AWG' },
        { key: 'Panjang', value: '305 Meter / Roll' },
        { key: 'Bandwidth', value: 'Hingga 500 MHz' },
      ],
    },
    {
      sku: 'JK-UPS-MINI',
      name: 'Mini DC UPS Backup Battery 12V 2A Router & Modem',
      slug: 'mini-dc-ups-backup-battery-12v-router-modem',
      shortDesc: 'Catu daya cadangan darurat otomatis saat mati lampu, menjaga WiFi dan CCTV tetap online hingga 4 jam.',
      longDesc: `Solusi tepat agar internet Anda tidak terputus saat pemadaman listrik PLN tiba-tiba. Menggunakan baterai lithium grade A berkapasitas 8800 mAh dengan proteksi overcharge dan overdischarge cerdas. Otomatis beralih ke baterai tanpa jeda (0 ms transfer time).`,
      price: 240000,
      discountPrice: 195000,
      stock: 75,
      weight: 400,
      dimensions: '16 x 10 x 3.5 cm',
      categoryId: createdCategories['aksesoris-power'],
      isFeatured: true,
      mainImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
      specs: [
        { key: 'Kapasitas Baterai', value: '8800 mAh Lithium-ion' },
        { key: 'Tegangan Output', value: '9V / 12V DC (Bisa Dipilih), USB 5V' },
        { key: 'Daya Tahan', value: '3 - 5 Jam (Tergantung konsumsi router)' },
        { key: 'Fitur', value: 'Zero Switch Time (Otomatis tanpa restart modem)' },
      ],
    },
    {
      sku: 'JK-WIFI-AC',
      name: 'Wireless AC1300 Dual Band High Gain USB Adapter',
      slug: 'wireless-ac1300-dual-band-usb-adapter',
      shortDesc: 'Dongle WiFi USB 3.0 dengan antena ganda penerima sinyal kuat untuk PC desktop dan laptop.',
      longDesc: `Tingkatkan kecepatan koneksi nirkabel PC atau laptop lama Anda dengan USB Dongle WiFi AC1300. Port USB 3.0 berkecepatan 10x lebih kencang dari USB 2.0 konvensional. Dilengkapi 2 antena luar fleksibel yang dapat diatur sudutnya untuk penangkapan sinyal maksimal.`,
      price: 185000,
      discountPrice: 149000,
      stock: 90,
      weight: 150,
      dimensions: '12 x 4 x 2 cm',
      categoryId: createdCategories['perangkat-jaringan'],
      isFeatured: true,
      mainImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
      specs: [
        { key: 'Kecepatan', value: '867 Mbps (5 GHz) + 400 Mbps (2.4 GHz)' },
        { key: 'Antarmuka', value: 'USB 3.0 SuperSpeed' },
        { key: 'Kompatibilitas', value: 'Windows 11/10/8/7, macOS, Linux' },
      ],
    },
  ];

  await prisma.product.deleteMany({});
  for (const prod of productsData) {
    const { specs, ...pData } = prod;
    const createdProduct = await prisma.product.create({
      data: {
        ...pData,
        images: {
          create: [
            { imageUrl: prod.mainImage, isPrimary: true, order: 1 },
            { imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80', isPrimary: false, order: 2 },
          ],
        },
        specs: {
          create: specs,
        },
      },
    });
  }
  console.log('✅ Products & specifications seeded');

  // 9. Testimonials
  const testimonials = [
    {
      name: 'Rudi Hermawan',
      role: 'IT Manager',
      company: 'PT Maju Bersama Logistik',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content: 'Pengiriman sangat cepat dan barangnya 100% original. Switch PoE Jangkriknet sudah beroperasi 6 bulan non-stop di gudang kami tanpa kendala sedikit pun.',
      rating: 5,
      order: 1,
    },
    {
      name: 'Dewi Lestari',
      role: 'Pemilik Usaha Kafe',
      company: 'Kopi Kenangan Senja',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      content: 'Order via WhatsApp responnya kilat banget. Dikasih rekomendasi router WiFi 6 yang pas banget buat pengunjung kafe kami. Pelanggan senang internetan lancar.',
      rating: 5,
      order: 2,
    },
    {
      name: 'Hendro Wijaya',
      role: 'Teknisi Jaringan Lepas',
      company: 'Freelance Network Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      content: 'Harga kabel Cat6 dan konektor di Jangkriknet paling bersaing dibanding toko lain. Kualitas tembaga murninya terbukti tahan banting untuk proyek instalasi outdoor.',
      rating: 5,
      order: 3,
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('✅ Testimonials seeded');

  // 10. FAQ
  const faqs = [
    {
      question: 'Apakah semua produk yang dijual bergaransi resmi?',
      answer: 'Ya, seluruh produk yang kami sediakan dijamin 100% orisinal dan memiliki garansi resmi distributor antara 1 hingga 2 tahun sesuai kategori produk.',
      order: 1,
    },
    {
      question: 'Bagaimana cara melakukan pemesanan melalui WhatsApp?',
      answer: 'Cukup pilih produk yang Anda inginkan, klik tombol "Pesan via WhatsApp", atau selesaikan di halaman Checkout dengan opsi WhatsApp. Anda akan otomatis diarahkan ke chat WhatsApp dengan rincian pesanan yang rapi.',
      order: 2,
    },
    {
      question: 'Berapa lama estimasi waktu pengiriman barang?',
      answer: 'Untuk wilayah Jabodetabek pesanan diproses dalam 1-2 hari kerja. Untuk pengiriman luar pulau Jawa biasanya membutuhkan 3-5 hari kerja menggunakan ekspedisi rekanan kami.',
      order: 3,
    },
    {
      question: 'Apakah melayani pembelian dalam jumlah besar untuk proyek pengadaan?',
      answer: 'Tentu saja! Kami sering melayani pengadaan perlengkapan jaringan untuk instansi, kantor, dan sekolah. Hubungi tim kami untuk mendapatkan penawaran harga khusus (quotation).',
      order: 4,
    },
  ];

  await prisma.faq.deleteMany({});
  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }
  console.log('✅ FAQs seeded');

  // 11. Dynamic Pages (Privacy Policy & Terms)
  await prisma.page.deleteMany({});
  await prisma.page.create({
    data: {
      title: 'Kebijakan Privasi',
      slug: 'privacy',
      content: `<h2>Kebijakan Privasi Jangkriknet</h2>
<p>Privasi pengunjung website kami adalah prioritas utama. Dokumen Kebijakan Privasi ini menguraikan jenis informasi pribadi yang dikumpulkan dan dicatat oleh Jangkriknet serta cara kami menggunakannya.</p>
<h3>Informasi yang Kami Kumpulkan</h3>
<p>Ketika Anda memesan produk atau menghubungi kami, kami dapat meminta informasi seperti nama, nomor telepon/WhatsApp, alamat email, dan alamat lengkap pengiriman.</p>
<h3>Keamanan Informasi</h3>
<p>Kami menerapkan standar keamanan enkripsi dan teknologi terkini untuk melindungi data pribadi pelanggan dari akses yang tidak sah.</p>`,
      seoTitle: 'Kebijakan Privasi - Jangkriknet',
      seoDesc: 'Kebijakan privasi resmi Jangkriknet mengenai penggunaan dan perlindungan data pelanggan.',
      isPublished: true,
    },
  });

  await prisma.page.create({
    data: {
      title: 'Syarat & Ketentuan',
      slug: 'terms',
      content: `<h2>Syarat dan Ketentuan Layanan</h2>
<p>Selamat datang di situs resmi Jangkriknet. Dengan mengakses dan menggunakan situs ini, Anda setuju untuk mematuhi dan terikat oleh syarat dan ketentuan berikut.</p>
<h3>Pemesanan & Pembayaran</h3>
<p>Pesanan Anda akan diproses setelah bukti pembayaran diverifikasi (untuk metode Transfer Bank) atau setelah konfirmasi pesanan disepakati via WhatsApp.</p>
<h3>Garansi & Retur Barang</h3>
<p>Klaim garansi dapat dilakukan dengan menyertakan nota pembelian serta video unboxing kemasan barang tanpa jeda.</p>`,
      seoTitle: 'Syarat & Ketentuan - Jangkriknet',
      seoDesc: 'Syarat dan ketentuan pembelian dan layanan garansi di Jangkriknet.',
      isPublished: true,
    },
  });
  console.log('✅ Pages (Privacy & Terms) seeded');

  // 12. Blog Article Sample
  await prisma.blogCategory.deleteMany({});
  const techCategory = await prisma.blogCategory.create({
    data: {
      name: 'Tips Jaringan & Panduan',
      slug: 'tips-jaringan',
    },
  });

  await prisma.blogPost.deleteMany({});
  await prisma.blogPost.create({
    data: {
      title: '5 Cara Mudah Memperkuat Sinyal WiFi di Rumah dan Kantor',
      slug: '5-cara-memperkuat-sinyal-wifi',
      summary: 'Koneksi internet sering lemot atau terputus? Simak tips praktis menempatkan router dan memilih frekuensi yang tepat.',
      content: `Memiliki koneksi internet yang kencang namun sinyal WiFi tidak merata di sudut ruangan seringkali menjadi kendala utama saat bekerja dari rumah (WFH). Berikut adalah 5 tips sederhana namun efektif untuk mengatasi masalah tersebut:

1. **Posisikan Router di Titik Pusat (Central)**: Jangan letakkan router di lantai atau di dalam lemari tertutup.
2. **Gunakan Frekuensi 5 GHz untuk Kecepatan Tinggi**: Frekuensi 5 GHz lebih tahan terhadap interferensi gelombang elektronik lainnya.
3. **Perbarui Firmware Router**: Pembaruan sistem seringkali membawa peningkatan stabilitas radio dan keamanan jaringan.
4. **Manfaatkan Fitur WiFi 6 (OFDMA)**: Mengurangi antrean data saat banyak perangkat terhubung secara bersamaan.
5. **Gunakan Range Extender atau Mesh WiFi**: Untuk rumah bertingkat atau kantor berpartisi tembok tebal.`,
      featuredImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      categoryId: techCategory.id,
      isPublished: true,
    },
  });
  console.log('✅ Blog sample seeded');

  // 13. Sample Initial Order (for Admin Dashboard statistics)
  await prisma.order.deleteMany({});
  await prisma.order.create({
    data: {
      orderNumber: 'JK-ORD-20260901-001',
      customerName: 'Budi Santoso',
      customerPhone: '081298765432',
      customerEmail: 'budi@gmail.com',
      shippingAddress: 'Jl. Melati No. 12, Kel. Menteng',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postalCode: '10310',
      customerNotes: 'Tolong packing ekstra bubble wrap ya min.',
      paymentMethod: 'WHATSAPP',
      status: 'PROCESSING',
      subtotal: 599000,
      total: 599000,
      items: {
        create: [
          {
            productName: 'Dual Band Gigabit WiFi 6 Router AX3000',
            price: 599000,
            quantity: 1,
            subtotal: 599000,
          },
        ],
      },
    },
  });
  console.log('✅ Sample initial order seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
