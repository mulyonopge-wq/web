# Jangkriknet - Modern Full-Stack Company Profile, E-Commerce & Visual CMS

Aplikasi web modern full-stack yang mengintegrasikan **Company Profile Perusahaan**, **Katalog & Toko Online (E-Commerce & WhatsApp Order)**, serta **Visual CMS / Admin Panel** lengkap.

Seluruh tampilan dan konten pada halaman publik (nama perusahaan, logo, tema warna, font, border-radius, section homepage, menu navigasi, produk, harga promo, stok, informasi kontak, hingga SEO) dikontrol secara dinamis dari database melalui Admin Panel **tanpa perlu menyentuh source code**.

---

## 🚀 Fitur Utama

### 1. Halaman Publik (Storefront & Company Profile)
- **Homepage Dinamis**: Disusun oleh sistem Visual Section Builder (Hero, About, Keunggulan, Kategori, Produk Unggulan, Promo Banner, Statistik, Testimoni, FAQ, CTA, Kontak).
- **Profil Perusahaan Profesional (`/company`)**: Sejarah, Visi, Misi, Nilai-nilai perusahaan, Tim pimpinan, Sertifikasi, Legalitas usaha (NIB, NPWP, SK Kemenkumham), dan Google Maps interaktif.
- **Katalog Produk & Toko Online (`/products`)**: Filter kategori, pencarian real-time, sorting harga/terbaru, indikator stok, diskon promo.
- **Detail Produk (`/products/[slug]`)**: Galeri foto, spesifikasi teknis, tombol *Tambah ke Keranjang*, dan tombol *Pesan Cepat via WhatsApp*.
- **Keranjang Belanja (`/cart`)**: LocalStorage persistence, update kuantitas, validasi stok otomatis.
- **Checkout Modular (`/checkout`)**: Form pemesanan alamat Indonesia lengkap dengan pilihan metode pembayaran:
  - **Pesan via WhatsApp (WhatsApp Order)**: Otomatis menyusun template pesan rapi sesuai pengaturan CMS dan membuka chat WhatsApp toko.
  - **Transfer Bank**: Rekening resmi perusahaan beserta konfirmasi pembayaran.
  - **COD**: Bayar di tempat saat kurir tiba.
- **Halaman Sukses (`/order/success`)**: Ringkasan nomor pesanan dan tombol konfirmasi instan.
- **Blog & Artikel (`/blog`)**: Konten tips & edukasi seputar teknologi jaringan.
- **Dynamic Page Builder (`/[slug]`)**: Halaman kustom CMS seperti `/privacy`, `/terms`, `/karir`, dll.

### 2. Admin Panel & CMS (`/admin`)
- **Dashboard Analitik**: Total omset penjualan, total pesanan, pesanan baru masuk, total produk & kategori, stok habis, produk terlaris.
- **Website Settings CMS (`/admin/website`)**:
  - Ganti Nama Perusahaan, Tagline, Logo, Favicon, Deskripsi.
  - Ubah Kontak, Alamat, No. WhatsApp Toko, Email, dan Embed Google Maps.
  - Kustomisasi Template Pesan WhatsApp Checkout dengan tag variabel (`[NAMA TOKO]`, `[PRODUK]`, `[TOTAL]`, `[NAMA]`, `[ALAMAT]`, `[CATATAN]`).
  - Pengaturan Akun Sosial Media (Instagram, TikTok, Facebook, YouTube, LinkedIn).
  - Pengaturan Teks Footer & Hak Cipta.
  - Pengaturan SEO Global (Meta Title, Description, Keywords, OG Image).
- **Appearance & Theme Customizer (`/admin/appearance`)**:
  - Ubah warna primer (Primary), sekunder (Secondary), aksen (Accent), background, dan teks.
  - Preset palet warna siap pakai (*Corporate Blue, Emerald Forest, Royal Indigo, Crimson Modern, Deep Midnight*).
  - Pilihan font heading & body (Inter, Roboto, Poppins, Plus Jakarta Sans, dll).
  - Pilihan sudut (Border Radius): Square, Small, Medium, Large, Rounded Pill.
  - Gaya tombol: Solid, Outline, Rounded.
  - **Live Preview Real-time** sebelum menyimpan perubahan.
  - Tombol **[Save Changes]** dan **[Reset Theme]**.
- **Homepage Visual Builder (`/admin/builder`)**:
  - Drag & Drop / Geser urutan section naik/turun.
  - Aktifkan / Nonaktifkan section dalam satu klik.
  - Edit judul, sub-judul, teks tombol, link, dan foto latar belakang.
  - Duplikasi dan Hapus section.
- **Header & Menu Navigasi CMS (`/admin/navigation`)**:
  - Tambah, edit, ubah urutan menu bar header, dan target tautan (`_self` / `_blank`).
- **Company Profile CMS (`/admin/company`)**:
  - Edit narasi sejarah, visi, misi, nilai perusahaan, tim pimpinan, sertifikasi, dan legalitas.
- **Katalog & Kategori Produk CMS (`/admin/products`, `/admin/categories`)**:
  - Tambah / Edit produk lengkap dengan SKU, harga normal, harga promo, stok, berat, dimensi, spesifikasi teknis dinamis, dan galeri foto.
- **Manajemen Pesanan (`/admin/orders`)**:
  - Pemantauan pesanan masuk, filter status (*NEW, PROCESSING, SHIPPED, COMPLETED, CANCELLED*), detail pesanan, dan tombol langsung **Chat WhatsApp Pembeli**.
- **Media Library (`/admin/media`)**:
  - Upload file foto/banner, copy URL gambar, preview ukuran & resolusi, hapus file.
- **Page Builder (`/admin/pages`)**:
  - Buat halaman publik baru dengan URL slug khusus dan status Publish/Draft.
- **Testimoni & FAQ CMS (`/admin/content/testimonials`, `/admin/content/faqs`)**:
  - Kelola testimoni pembeli dan pertanyaan tanya jawab.
- **Blog CMS (`/admin/blog`)**:
  - Tulis artikel tips & panduan dengan gambar sampul dan kategori.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **Styling Engine**: Dynamic CSS Variables (`--theme-primary`, `--theme-radius`, dll.) disuntikkan secara dinamis dari database.
- **Backend & API**: Next.js Route Handlers (REST API), TypeScript
- **Database & ORM**: PostgreSQL / SQLite (Dual Driver support) dengan Prisma ORM
- **Autentikasi**: Custom JWT Session HTTP-only Cookie dengan enkripsi `bcryptjs`
- **File Storage**: Local Disk Server Storage (`/public/uploads`) dengan sanitasi nama dan MIME type.

---

## 📋 Kebutuhan Sistem

- **Node.js**: Versi 18.18.0 atau lebih tinggi (disarankan v20 / v22 / v24)
- **NPM**: Versi 9 atau lebih tinggi
- **PostgreSQL** (opsional untuk production/Docker, atau gunakan SQLite bawaan untuk dev lokal instan)

---

## ⚙️ Instalasi & Konfigurasi

### 1. Clone atau Buka Folder Project
```bash
cd d:\bungdes
```

### 2. Konfigurasi Environment Variable (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi `.env`:
```env
# Database Configuration
# Untuk pengujian lokal instan tanpa server postgres:
DATABASE_URL="file:./dev.db"

# Atau jika menggunakan PostgreSQL:
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/jangkriknet?schema=public"

JWT_SECRET="jangkriknet-super-secure-jwt-secret-key-2026-very-long"
APP_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
WHATSAPP_NUMBER="6281234567890"
NODE_ENV="development"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database & Migrasi
Jika menggunakan SQLite untuk pengujian cepat lokal:
```bash
npm run db:switch:sqlite
npm run prisma:push
```

Jika ingin beralih ke PostgreSQL:
```bash
npm run db:switch:postgres
npm run prisma:push
```

### 5. Seed Data Awal (Perusahaan "Jangkriknet")
Jalankan seeder untuk mengisi data dummy awal:
```bash
npm run prisma:seed
```

---

## 🚀 Menjalankan Aplikasi

### Mode Development
```bash
npm run dev
```
Buka browser di:
- **Website Publik**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Build & Run Production
```bash
npm run build
npm run start
```

---

## 🔐 Akun Demo Admin

Sistem telah dilengkapi akun administrator bawaan:
- **URL Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

> [!WARNING]
> **Peringatan Keamanan**:
> Password ini adalah kredensial demo default. Anda **wajib** mengubah kata sandi setelah melakukan deployment ke lingkungan produksi.

---

## 🐳 Dukungan Docker & Docker Compose

Untuk menjalankan aplikasi lengkap beserta database PostgreSQL dalam container Docker:

```bash
docker-compose up -d --build
```
Layanan yang dijalankan:
1. **PostgreSQL 16**: Port 5432
2. **Next.js Full-Stack App**: Port 3000

---

## 📖 Panduan Penggunaan CMS untuk Admin

1. **Mengubah Nama Perusahaan & Logo**:
   - Masuk ke Admin Panel > **Website CMS** > **Pengaturan Umum & SEO**.
   - Ubah kolom *Nama Perusahaan / Toko* dan pilih Logo baru.
   - Klik **[Simpan Perubahan]**. Nama dan logo otomatis berubah di seluruh halaman website.

2. **Mengubah Warna & Desain Tema**:
   - Masuk ke **Appearance** > **Theme & Colors**.
   - Pilih preset warna atau sesuaikan warna primer melalui Color Picker.
   - Amati perubahan langsung pada kotak **Live Preview Real-time**.
   - Klik **[Save Changes]**.

3. **Mengatur Urutan Section Homepage**:
   - Masuk ke **Website CMS** > **Homepage Builder**.
   - Gunakan tombol panah atas/bawah untuk mengubah posisi section.
   - Klik tombol **Aktif/Nonaktif** untuk menyembunyikan atau menampilkan section.
   - Klik icon pensil untuk mengedit teks judul, subtitle, tombol, dan gambar latar.

4. **Menambah & Menjual Produk**:
   - Masuk ke **Katalog Produk** > **+ Tambah Produk**.
   - Masukkan Nama, SKU, Harga normal, Harga diskon (opsional), Stok, dan Kategori.
   - Tambahkan foto produk dan spesifikasi teknis.
   - Centang opsi *Jadikan Produk Unggulan di Homepage* jika ingin ditampilkan di beranda.
   - Klik **[Simpan Produk]**.

5. **Memproses Pesanan & Chat WhatsApp**:
   - Masuk ke **Pesanan & Transaksi**.
   - Klik tombol **Detail** pada pesanan masuk.
   - Klik tombol hijau **[Chat WhatsApp Pembeli]** untuk langsung menghubungi pembeli di WhatsApp.
   - Ubah status pesanan menjadi *DIPROSES*, *DIKIRIM*, atau *SELESAI*.

---

## 💾 Backup & Pemeliharaan Database

- **SQLite**: File database disimpan di `d:\bungdes\dev.db`. Cukup salin file tersebut untuk mencadangkan seluruh data website.
- **PostgreSQL**: Jalankan perintah `pg_dump`:
  ```bash
  pg_dump -U postgres -d jangkriknet > backup_jangkriknet.sql
  ```

---

## 📄 Lisensi
Hak Cipta © 2026 Jangkriknet. Dikembangkan sebagai sistem web modular siap produksi.
