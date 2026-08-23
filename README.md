<div align="center">

# ⛪ SIMGK Deiyai

### Sistem Monitoring Gereja Koordinator Deiyai

**Papua Tengah · Indonesia**

---

![Versi](https://img.shields.io/badge/versi-3.5%20Final-c8a020?style=flat-square&labelColor=0d1828)
![Status](https://img.shields.io/badge/status-stable%20%26%20synced-16b89a?style=flat-square&labelColor=0d1828)
![Alpine](https://img.shields.io/badge/Alpine.js-3.x-5a9bf0?style=flat-square&labelColor=0d1828)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-dd5566?style=flat-square&labelColor=0d1828)
![Storage](https://img.shields.io/badge/Storage-Persistent%20LocalStorage-8a6cf0?style=flat-square&labelColor=0d1828)
![License](https://img.shields.io/badge/license-MIT-3dcf6e?style=flat-square&labelColor=0d1828)

<br>

> Platform digital terpadu untuk memantau dan mengelola seluruh data pelayanan gereja  
> di bawah Koordinator Deiyai — kelasis, gereja, jemaat, kegiatan, dokumen, hingga laporan pelayanan.  
> Dilengkapi **Galeri Foto Gereja**, **LocalStorage Persistent Store**, **Auto Activity Logging**,  
> **Cross-Tab Realtime Synchronization**, serta utilitas **Backup & Restore Database**.

<br>

[🚀 Cara Menjalankan](#-cara-menjalankan) &nbsp;·&nbsp;
[🔑 Akun Demo](#-akun-demo) &nbsp;·&nbsp;
[📖 Panduan Penggunaan](#-panduan-penggunaan-lengkap) &nbsp;·&nbsp;
[📦 Fitur Lengkap](#-fitur-lengkap) &nbsp;·&nbsp;
[🏗️ Arsitektur Teknis](#️-arsitektur-teknis)

</div>

---

## 📋 Daftar Isi

1. [Tentang Aplikasi](#-tentang-aplikasi)
2. [Struktur Berkas Proyek](#-struktur-berkas-proyek)
3. [Akun Demo & Hak Akses](#-akun-demo--hak-akses)
4. [Cara Menjalankan](#-cara-menjalankan)
5. [Panduan Penggunaan Lengkap](#-panduan-penggunaan-lengkap)
   - 5.1 [Login & Akses Sistem](#51-login--akses-sistem)
   - 5.2 [Dashboard & Monitoring Real-time](#52-dashboard--monitoring-real-time)
   - 5.3 [Manajemen Gereja & Galeri / Foto Gereja](#53-manajemen-gereja--foto-gereja)
   - 5.4 [Manajemen Jemaat & Impor/Ekspor Data](#54-manajemen-jemaat--imporekspor-data)
   - 5.5 [Manajemen Kelasis & Rekapitulasi Wilayah](#55-manajemen-kelasis--rekapitulasi-wilayah)
   - 5.6 [Monitoring Kegiatan & Pencatatan Ibadah](#56-monitoring-kegiatan--pencatatan-ibadah)
   - 5.7 [Laporan Pelayanan & Alur Persetujuan (Approval)](#57-laporan-pelayanan--alur-persetujuan-approval)
   - 5.8 [Manajemen & Pengunduhan Dokumen](#58-manajemen--pengunduhan-dokumen)
   - 5.9 [Notifikasi Sistem & Pengumuman](#59-notifikasi-sistem--pengumuman)
   - 5.10 [Ekspor Data Terpadu (PDF, Excel, CSV)](#510-ekspor-data-terpadu-pdf-excel-csv)
   - 5.11 [Manajemen Pengguna & Keamanan Akun](#511-manajemen-pengguna--keamanan-akun)
   - 5.12 [Activity Log & Audit Trail](#512-activity-log--audit-trail)
   - 5.13 [Pengaturan Sistem, Backup & Restore Database](#513-pengaturan-sistem-backup--restore-database)
6. [Teknologi & Dependensi](#️-teknologi--dependensi)
7. [Design System & UI Guidelines](#-design-system--ui-guidelines)
8. [Arsitektur Teknis & Sinkronisasi](#️-arsitektur-teknis--sinkronisasi)
9. [FAQ & Troubleshooting](#-faq--troubleshooting)
10. [Lisensi & Kredit](#-lisensi--kredit)

---

## 📖 Tentang Aplikasi

**SIMGK Deiyai** _(Sistem Monitoring Gereja Koordinator Deiyai)_ adalah aplikasi web terpadu yang dirancang khusus untuk memodernisasi administrasi dan pemantauan pelayanan gereja di seluruh wilayah Koordinator Deiyai, Papua Tengah.

Sistem ini melayani **6 Kelasis**, **48 Gereja**, dan **3.847+ Anggota Jemaat** dengan dukungan penuh untuk:

- Penyimpanan persisten otomatis tanpa kehilangan data saat refresh.
- Pembaruan lintas tab peramban secara langsung (_real-time cross-tab sync_).
- Tampilan detail gereja interaktif dengan **penampil foto gereja (showcase banner)**.
- Otomatisasi pencatatan audit log untuk setiap perubahan data.
- Ekspor laporan dan data dalam format CSV, JSON, serta cetak PDF.

### Ringkasan Data Pokok

| Parameter Pelayanan          | Jumlah / Status       |
| :--------------------------- | :-------------------- |
| **Kelasis Aktif**            | 6 Kelasis             |
| **Gereja Terdaftar**         | 48 Gereja             |
| **Total Anggota Jemaat**     | 3.847 Jiwa            |
| **Total Pendeta / Gembala**  | 52 Pelayan            |
| **Kegiatan Tercatat (2024)** | 186 Kegiatan          |
| **Laporan Pelayanan**        | 34 Dokumen Masuk      |
| **Total Modul Sistem**       | 14 Modul Terintegrasi |

### Wilayah 6 Kelasis Deiyai

| ID Kelasis | Nama Kelasis           | Ketua Kelasis       | Wilayah Pusat |
| :--------- | :--------------------- | :------------------ | :------------ |
| `KLS-001`  | **Kelasis Tigi**       | Pnt. Yohanes Gobai  | Distrik Tigi  |
| `KLS-002`  | **Kelasis Tigi Barat** | Pnt. Andreas Mote   | Tigi Barat    |
| `KLS-003`  | **Kelasis Yatamo**     | Pnt. Martinus Pigai | Yatamo        |
| `KLS-004`  | **Kelasis Wagamo**     | Pnt. Samuel Dimi    | Wagamo        |
| `KLS-005`  | **Kelasis Tigi Utara** | Pnt. Daniel Pakage  | Tigi Utara    |
| `KLS-006`  | **Kelasis Debey**      | Pnt. Thomas Keiya   | Distrik Debey |

---

## 📁 Struktur Berkas Proyek

```
SI-MOGE/
│
├── 🌐 index.html                 ← Landing Page / Portal Informasi Publik
├── 📖 panduan.html               ← Panduan Penggunaan Publik (Akses Standalone dari Landing Page)
├── 🔐 login.html                 ← Halaman Login Autentikasi & Akun Demo
├── 📖 README.md                  ← Dokumentasi Resmi & Referensi Teknis
│
├── assets/
│   ├── css/
│   │   ├── style.css             ← Global Theme CSS (Dark Theme, Layout, Components)
│   │   └── landing.css           ← CSS Khusus Landing Page Publik
│   ├── js/
│   │   ├── app.js                ← Core Alpine.js v3.5 Store & State Management
│   │   ├── charts.js             ← Chart.js v4.4.0 Live Dynamic Data Visualizer
│   │   └── layout.js             ← Dynamic Role-Based Sidebar & Topbar Builder
│   └── layout.snippet.html       ← Referensi Snippet Layout Bersama
│
└── pages/
    ├── dashboard.html            ← Dashboard Statistik & Ringkasan Pelayanan
    ├── statistik.html            ← Grafik Analitik Pertumbuhan & Distribusi Jemaat
    ├── kelasis.html              ← Manajemen Data 6 Kelasis Wilayah
    ├── gereja.html               ← Manajemen Gereja + Galeri / Foto Gereja
    ├── jemaat.html               ← Data Anggota Jemaat + Impor/Ekspor JSON & CSV
    ├── kegiatan.html             ← Pencatatan & Monitoring 9 Jenis Kegiatan Ibadah
    ├── laporan.html              ← Pengiriman Laporan & Approval Workflow Koordinator
    ├── dokumen.html              ← Arsip Surat Keputusan, Notulen & Unduh File
    ├── pengumuman.html           ← Publikasi Warta / Pengumuman Terarah
    ├── notifikasi.html           ← Feed Notifikasi Real-time & Tandai Dibaca
    ├── export.html               ← Pusat Ekspor Data (CSV, JSON, Cetak PDF)
    ├── panduan.html              ← Panduan Penggunaan Interaktif Dashboard (In-App)
    ├── users.html                ← Manajemen Akun Pengguna [Super Admin]
    ├── actlog.html               ← Audit Trail Log Aktivitas [Super Admin]
    └── pengaturan.html           ← Konfigurasi Sistem, Backup & Restore JSON [Super Admin]
```

---

## 🔑 Akun Demo & Hak Akses

Sistem menggunakan kontrol akses berbasis peran (**Role-Based Access Control / RBAC**). Pada halaman login (`login.html`), klik pada kotak **🔑 Akun Demo** untuk mengisi formulir login secara otomatis:

| Role Pengguna          | Alamat Email         | Kata Sandi    | Cakupan Akses                                                                                                                     |
| :--------------------- | :------------------- | :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| 👑 **Super Admin**     | `admin@deiyai.id`    | `admin123`    | **Semua Modul Penuh** (CRUD semua data, manajemen pengguna, log audit, backup database)                                           |
| 🏛️ **Admin Kelasis**   | `tigi@deiyai.id`     | `kelasis123`  | **12 Modul** (Dashboard, Statistik, Kelasis, Gereja, Jemaat, Kegiatan, Laporan, Dokumen, Pengumuman, Notifikasi, Ekspor, Panduan) |
| ⛪ **Operator Gereja** | `gke.tigi@deiyai.id` | `operator123` | **8 Modul** (Dashboard Gereja, Gereja, Jemaat, Kegiatan, Dokumen, Pengumuman, Notifikasi, Panduan)                                |

### Matriks Izin Modul

| Modul Menu                   | Super Admin | Admin Kelasis |      Operator Gereja      |
| :--------------------------- | :---------: | :-----------: | :-----------------------: |
| Dashboard                    |  ✅ Penuh   |   ✅ Penuh    | ✅ Tampilan Khusus Gereja |
| Statistik Pelayanan          |     ✅      |      ✅       |            ❌             |
| Manajemen Kelasis            |     ✅      |      ✅       |            ❌             |
| Manajemen Gereja & Foto      |     ✅      |      ✅       |            ✅             |
| Data Jemaat                  |     ✅      |      ✅       |            ✅             |
| Monitoring Kegiatan          |     ✅      |      ✅       |            ✅             |
| Laporan Pelayanan & Approval |     ✅      |      ✅       |            ❌             |
| Manajemen Dokumen            |     ✅      |      ✅       |            ✅             |
| Pengumuman & Warta           |     ✅      |      ✅       |            ✅             |
| Notifikasi Sistem            |     ✅      |      ✅       |            ✅             |
| Export Data Terpusat         |     ✅      |      ✅       |            ❌             |
| Panduan Penggunaan           |     ✅      |      ✅       |            ✅             |
| Manajemen Pengguna           |     ✅      |      ❌       |            ❌             |
| Activity Log                 |     ✅      |      ❌       |            ❌             |
| Pengaturan & Backup/Restore  |     ✅      |      ❌       |            ❌             |

---

## 🚀 Cara Menjalankan

Aplikasi dibangun sebagai **Static Web Application** modern tanpa dependensi build pipeline yang rumit.

> 💡 **Rekomendasi**: Jalankan aplikasi melalui Web Server lokal (HTTP/HTTPS) agar fitur `localStorage`, `FileReader`, dan pembacaan resource CDN berjalan optimal.

### Opsi 1: VS Code Live Server ⭐

1. Buka folder proyek di Visual Studio Code.
2. Klik kanan pada berkas `index.html`.
3. Pilih **"Open with Live Server"**.
4. Peramban akan otomatis membuka alamat `http://localhost:5500`.

### Opsi 2: Node.js Serve

```bash
npx serve .
# Buka http://localhost:3000
```

### Opsi 3: Python HTTP Server

```bash
# Python 3.x
python -m http.server 8080
# Buka http://localhost:8080
```

### Opsi 4: PHP Built-in Server

```bash
php -S localhost:8080
# Buka http://localhost:8080
```

---

## 📖 Panduan Penggunaan Lengkap

### 5.1 Login & Akses Sistem

1. Akses halaman login melalui tombol **"Masuk ke Sistem"** di landing page atau langsung buka `login.html`.
2. Pilih peran yang diinginkan pada tombol pemilih peran atau klik salah satu **Akun Demo**.
3. Klik **"Masuk ke Sistem →"**. Sistem akan memverifikasi kredensial dan mengarahkan Anda ke Dashboard.
4. Untuk keluar dari sesi, klik tombol icon pintu keluar **🚪** di topbar atau footer sidebar.

---

### 5.2 Dashboard & Monitoring Real-time

1. Dashboard menampilkan ringkasan kartu statistik (Kelasis, Gereja, Jemaat, Pendeta, Kegiatan, Laporan).
2. **Grafik Live**: Grafik garis kegiatan bulanan dan diagram donat distribusi gereja merespons data aktual secara otomatis.
3. **Laporan Terbaru**: Menampilkan 5 laporan terakhir yang masuk dari kelasis.
4. **Feed Notifikasi**: Memuat 4 warta/notifikasi aktivitas terbaru.

---

### 5.3 Manajemen Gereja & Foto Gereja

1. Buka menu **Gereja** (`pages/gereja.html`).
2. **Melihat Detail & Foto Gereja**:
   - Klik tombol mata 👁️ pada salah satu baris gereja.
   - Modal detail akan terbuka menampilkan **Banner Foto Gereja** beresolusi tinggi, nama gereja, badge kelasis, status, dan rincian lengkap (gembala, tahun berdiri, jumlah jemaat, alamat).
3. **Menambah Gereja Baru**:
   - Klik tombol **"＋ Tambah Gereja"**.
   - Masukkan Nama Gereja, Kelasis, Nama Gembala, Tahun Berdiri, Jumlah Jemaat, dan Alamat.
   - Pada kolom **Foto Gereja**, pilih berkas gambar (`.jpg`, `.png`, `.webp` maks 2MB). Pratinjau gambar akan langsung muncul.
   - Klik **"Tambah Gereja"** untuk menyimpan.
4. **Mengubah / Menghapus Foto Gereja**:
   - Klik tombol pensil ✏️ untuk mengedit. Anda dapat mengganti foto baru atau menekan tombol silang ✕ pada pratinjau untuk menghapus foto lama.
5. **Ekspor Data Gereja**: Klik tombol **"⬇ Export CSV"** di toolbar atas untuk mengunduh seluruh data gereja dalam format spreadsheet.

---

### 5.4 Manajemen Jemaat & Impor/Ekspor Data

1. Buka menu **Jemaat** (`pages/jemaat.html`).
2. **Filter & Pencarian**: Gunakan dropdown Kelasis, Status (Aktif, Pindah, Meninggal), Jenis Kelamin, serta kolom pencarian nama/gereja.
3. **Tambah/Edit Jemaat**: Klik **"＋ Tambah Jemaat"**, lengkapi form dan simpan. ID jemaat (`JMT-XXXX`) dibuat secara otomatis.
4. **Ekspor CSV**: Klik tombol **"⬇ Export CSV"** untuk mengunduh daftar jemaat terfilter.
5. **Impor Data Jemaat (JSON)**:
   - Klik tombol **"⬆ Import Data"**.
   - Pilih berkas `.json` yang berisi array data jemaat. Data akan divalidasi dan langsung masuk ke database persisten.

---

### 5.5 Manajemen Kelasis & Rekapitulasi Wilayah

1. Buka menu **Kelasis** (`pages/kelasis.html`).
2. Menampilkan 6 kartu kelasis dengan warna aksen khas wilayah.
3. Setiap kartu menampilkan jumlah gereja aktif, total anggota jemaat, dan jumlah pendeta yang dihitung otomatis.
4. Klik **"✏️ Edit"** untuk memperbarui nama ketua kelasis, nomor kontak, atau alamat sekretariat kelasis.

---

### 5.6 Monitoring Kegiatan & Pencatatan Ibadah

1. Buka menu **Kegiatan** (`pages/kegiatan.html`).
2. Sistem mendukung **9 Kategori Kegiatan**: _Ibadah Minggu, Ibadah Pemuda, Ibadah Wanita, Sekolah Minggu, Baptisan, Pernikahan, Dukacita, Seminar, Pelayanan Sosial_.
3. Klik **"＋ Tambah Kegiatan"** untuk mencatat tanggal, nama kegiatan, kelasis, gereja penyelenggara, jumlah kehadiran peserta, dan deskripsi acara.
4. Klik tombol **"⬇ Export CSV"** untuk mengunduh rekapitulasi kegiatan tahunan.

---

### 5.7 Laporan Pelayanan & Alur Persetujuan (Approval)

1. Buka menu **Laporan Pelayanan** (`pages/laporan.html`).
2. **Kirim Laporan**: Admin Kelasis klik **"＋ Buat Laporan"**, masukkan judul, jenis laporan (Bulanan, Tahunan, Kegiatan, Pelayanan), periode bulan, dan uraian isi. Status awal adalah `Proses`.
3. **Approval Workflow**:
   - Super Admin dapat memeriksa isi laporan via tombol 👁️.
   - Klik tombol centang hijau **✓** pada tabel untuk menyetujui laporan. Status laporan otomatis berubah menjadi `Diterima`.
4. Tombol **"⬇ Export CSV"** tersedia untuk mencetak rekap laporan.

---

### 5.8 Manajemen & Pengunduhan Dokumen

1. Buka menu **Dokumen** (`pages/dokumen.html`).
2. Menyimpan arsip berkas: _SK Pelayanan, Laporan Resmi, Notulen Sidang, Dokumentasi Acara, dan Lainnya_.
3. Klik **"⬆ Upload Dokumen"** untuk mendaftarkan dokumen baru beserta metadata ukuran dan kelasis.
4. Klik tombol unduh ⬇ pada tabel untuk mengunduh berkas digital secara langsung.

---

### 5.9 Notifikasi Sistem & Pengumuman

1. **Notifikasi (`pages/notifikasi.html`)**:
   - Menampilkan notifikasi otomatis saat terjadi penambahan jemaat, gereja, laporan, atau kegiatan baru.
   - Klik pada salah satu notifikasi atau klik **"✓ Tandai Semua Dibaca"** untuk mereset badge angka notifikasi.
2. **Pengumuman (`pages/pengumuman.html`)**:
   - Koordinator dapat menerbitkan warta dengan target tertentu (_Semua Kelasis, Seluruh Gereja, Admin Kelasis, atau Kelasis Spesifik_) dengan tingkat urgensi _Normal, Penting, atau Mendesak_.

---

### 5.10 Ekspor Data Terpadu (PDF, Word, Excel, CSV, JSON)

1. **Akses Cepat di Setiap Modul**: Seluruh halaman utama (_Gereja, Jemaat, Kegiatan, Laporan Pelayanan, Statistik, dan Activity Log_) kini dilengkapi tombol ekspor instan:
   - **📄 PDF**: Menyiapkan format cetak resmi ber-Kop Surat untuk langsung dicetak atau disimpan ke file PDF.
   - **📝 Word**: Mengunduh berkas Microsoft Word (`.doc`) lengkap dengan Kop Surat resmi, tabel terformat, dan kolom tanda tangan.
   - **⬇ CSV / JSON**: Mengunduh data spreadsheet atau format pertukaran data JSON.
2. **Pusat Ekspor Terpadu (`pages/export.html`)**:
   - **Filter Wilayah Kelasis**: Mengatur cakupan ekspor data untuk seluruh wilayah atau kelasis tertentu (_Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey_).
   - **Pratinjau Dokumen PDF & Word**: Menampilkan preview dokumen fisik sebelum dicetak atau diunduh ke Microsoft Word.
   - **Dukungan 5 Format**: _PDF, Word (.doc), Excel (.csv UTF-8), CSV standar, dan JSON_.

---

### 5.11 Manajemen Pengguna & Keamanan Akun

1. Buka menu **Pengguna** (`pages/users.html`) _(Khusus Super Admin)_.
2. **Tambah Pengguna**: Masukkan nama, email resmi, password awal, role, dan kelasis binaan.
3. **Ubah Status**: Klik tombol ⏸ / ▶ untuk menonaktifkan atau mengaktifkan kembali akun pengguna.
4. **Reset Password**: Klik tombol kunci 🔑 untuk mereset password akun pengguna ke sandi standar (`simgk2024`).

---

### 5.12 Activity Log & Audit Trail

1. Buka menu **Activity Log** (`pages/actlog.html`) _(Khusus Super Admin)_.
2. Setiap operasi sistem (`LOGIN`, `CREATE`, `UPDATE`, `DELETE`) terekam otomatis beserta timestamp dan nama pengguna.
3. Gunakan filter tipe aksi atau kolom pencarian untuk melacak riwayat perubahan.
4. Klik **"⬇ Export CSV"** untuk menyimpan catatan log atau **"🗑 Bersihkan Log"** untuk mereset riwayat.

---

### 5.13 Pengaturan Sistem, Backup & Restore Database

1. Buka menu **Pengaturan** (`pages/pengaturan.html`) _(Khusus Super Admin)_.
2. **Pengaturan Umum**: Konfigurasi nama sistem, nama koordinator, kontak, dan tahun pelayanan.
3. **Keamanan**: Aktifkan fitur _Session Timeout, Login Log, Enkripsi Password, dan Notifikasi Email_.
4. **Cadangan Data (Backup)**:
   - Klik **"🔄 Backup Sekarang"** untuk mengunduh seluruh database aplikasi dalam format file `Backup_SIMGK_Deiyai_YYYY-MM-DD.json`.
5. **Pemulihan Data (Restore)**:
   - Klik **"♻️ Restore Backup"**, pilih file JSON cadangan Anda.
   - Sistem akan memvalidasi struktur data dan memulihkan seluruh kelasis, gereja, foto, jemaat, kegiatan, laporan, dan akun secara instan.

---

## 🛠️ Teknologi & Dependensi

Seluruh pustaka antarmuka dimuat secara efisien melalui CDN berkecepatan tinggi:

| Pustaka          | Versi | Peran & Fungsionalitas                                                                      |
| :--------------- | :---: | :------------------------------------------------------------------------------------------ |
| **Alpine.js**    |  3.x  | Reactive UI, global data store, component binding, dan persistence logic                    |
| **Chart.js**     | 4.4.0 | Rendering visualisasi grafik garis, donat, batang, dan pie secara interaktif                |
| **SweetAlert2**  | 11.x  | Modal konfirmasi interaktif, dialog konfirmasi hapus, dan toast notifikasi                  |
| **Google Fonts** |  CDN  | Tipografi elegan: _Playfair Display_ (Header), _DM Sans_ (Body), _JetBrains Mono_ (Kode/ID) |

### Urutan Pemuatan Skrip (Wajib Konsisten)

```html
<!-- 1. SweetAlert2 Library -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<!-- 2. Core Application Logic & Stores -->
<script src="../assets/js/app.js"></script>

<!-- 3. Layout Builder -->
<script src="../assets/js/layout.js"></script>

<!-- 4. Chart Engine (Hanya di Dashboard & Statistik) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="../assets/js/charts.js"></script>

<!-- 5. Alpine.js (Selalu menggunakan atribut defer) -->
<script
  src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
  defer
></script>
```

---

## 🎨 Design System & UI Guidelines

### Palet Warna Resmi

```css
/* Background & Surface */
--bg: #09111f; /* Deep Navy (Latar Belakang Utama) */
--bg2: #0d1828; /* Sidebar, Topbar, Modal Card */
--surface: #172234; /* Elevated Card & Input Area */

/* Accent & Sacred Gold */
--gold: #c8a020; /* Sacred Gold Primer */
--gold2: #e6bb3c; /* Light Gold Accent */
--gold-dim: rgba(200, 160, 32, 0.13);

/* Semantic Indicators */
--teal: #16b89a; /* Sukses / Status Aktif */
--blue2: #5a9bf0; /* Informasi / Tigi Barat */
--rose: #dd5566; /* Bahaya / Hapus / Nonaktif */
--violet: #8a6cf0; /* Wagamo / Operator */
--lime: #3dcf6e; /* Debey / Laporan Masuk */
```

### Tipografi

- **Playfair Display**: Digunakan untuk identitas utama, judul modul, nama sistem, dan header kartu.
- **DM Sans**: Digunakan untuk body text, label formulir, tabel data, dan tombol aksi.
- **JetBrains Mono**: Digunakan untuk kode identitas (`GRJ-001`, `JMT-0001`), angka counter, dan timestamp log.

---

## 🏗️ Arsitektur Teknis & Sinkronisasi

### Siklus Data & LocalStorage

```
Pengguna (CRUD Aksi)
       │
       ▼
Alpine.store('data')  ──(Auto Save)──►  localStorage ('simgk_data_v3')
       │                                            │
       ├─► Recalc Computed Stats                    ├─► Event Listener 'storage'
       ├─► Auto Dispatch ActLog                     │   (Sinkron ke tab peramban lain)
       ├─► Auto Dispatch Notification               │
       └─► Re-render Charts & UI View ◄─────────────┘
```

---

## ❓ FAQ & Troubleshooting

**Q: Mengapa data yang saya ubah tetap ada setelah halaman direfresh?**  
_A: Sistem telah dilengkapi dengan LocalStorage Persistent Storage v3.5. Semua perubahan (tambah, ubah, hapus) disimpan secara lokal di peramban Anda._

**Q: Bagaimana cara mengembalikan data ke kondisi awal demo?**  
_A: Buka Pengaturan (`pages/pengaturan.html`) lalu lakukan pembersihan data, atau buka DevTools peramban (F12) > Application > Local Storage > Hapus kunci `simgk_data_v3`._

**Q: Berapa batas maksimal ukuran foto gereja yang dapat diunggah?**  
_A: Ukuran maksimal yang disarankan adalah 2MB per gambar untuk menjaga performa penyimpanan lokal peramban tetap optimal._

---

## 📄 Lisensi & Kredit

Aplikasi ini dirilis di bawah lisensi **MIT License** — bebas digunakan dan dikembangkan untuk keperluan pelayanan gerejawi.

<div align="center">

<br>

⛪ **SIMGK Deiyai**  
_Sistem Monitoring Gereja Koordinator Deiyai · Papua Tengah_

Dibangun dengan penuh integritas oleh **©Devp_Rick11**  
_© 2026 Gereja Koordinator Deiyai · Papua Tengah_

<br>

**_Soli Deo Gloria_** 🙏

</div>
