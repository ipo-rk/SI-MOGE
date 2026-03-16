# SIMGK Deiyai
## Sistem Monitoring Gereja Koordinator Deiyai, Papua Tengah

---

## 📁 Struktur File

```
simgk-deiyai/
├── index.html                    ← Halaman Login
├── assets/
│   ├── css/
│   │   └── style.css             ← Global CSS (variabel, layout, komponen)
│   ├── js/
│   │   ├── app.js                ← Alpine.js — semua komponen & store
│   │   ├── charts.js             ← Chart.js — konfigurasi & init semua grafik
│   │   └── layout.js             ← Layout helper (opsional, referensi)
│   └── layout.snippet.html       ← Referensi snippet sidebar+topbar
└── pages/
    ├── dashboard.html            ← Dashboard utama
    ├── kelasis.html              ← Manajemen Kelasis
    ├── gereja.html               ← Manajemen Gereja
    ├── jemaat.html               ← Manajemen Jemaat
    ├── kegiatan.html             ← Monitoring Kegiatan
    ├── laporan.html              ← Laporan Pelayanan
    ├── statistik.html            ← Statistik & Grafik
    ├── notifikasi.html           ← Notifikasi Sistem
    ├── pengumuman.html           ← Pengumuman
    ├── dokumen.html              ← Manajemen Dokumen
    ├── export.html               ← Export Data
    ├── users.html                ← Manajemen Pengguna
    ├── actlog.html               ← Activity Log
    └── pengaturan.html           ← Pengaturan Sistem
```

---

## 🚀 Cara Penggunaan

1. **Buka `index.html`** di browser (atau host di web server)
2. **Pilih role**, masukkan email & password
3. **Login** → diarahkan ke `pages/dashboard.html`
4. Navigasi menggunakan sidebar

> **Catatan:** Karena file menggunakan ES modules dan `localStorage`,
> buka melalui server lokal (bukan langsung `file://`):
> ```
> npx serve .
> # atau
> python3 -m http.server 8080
> ```

---

## 🛠️ Teknologi

| Library    | Versi  | CDN                                              |
|------------|--------|--------------------------------------------------|
| Alpine.js  | 3.x    | `cdn.jsdelivr.net/npm/alpinejs@3.x.x`            |
| Chart.js   | 4.4.0  | `cdn.jsdelivr.net/npm/chart.js@4.4.0`            |
| Google Fonts | —    | Playfair Display, DM Sans, JetBrains Mono        |

---

## 👤 Role Pengguna

| Role             | Akses                              |
|------------------|------------------------------------|
| Super Admin      | Semua fitur                        |
| Admin Kelasis    | Read, Create, Edit, Laporan        |
| Operator Gereja  | Read, Create                       |

---

## 📦 Fitur Lengkap (25 Modul)

- ✅ Login / Logout / Role Management
- ✅ Dashboard dengan statistik real-time
- ✅ Grafik Chart.js (Line, Doughnut, Pie, Bar)
- ✅ Manajemen 6 Kelasis (Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey)
- ✅ Manajemen Gereja (CRUD + filter + pagination)
- ✅ Manajemen Jemaat (CRUD + filter multi-kolom)
- ✅ Monitoring Kegiatan (9 jenis kegiatan)
- ✅ Laporan Pelayanan (4 jenis laporan)
- ✅ Statistik dengan 5 grafik interaktif
- ✅ Manajemen Pengguna + role badge
- ✅ Notifikasi sistem real-time (Alpine store)
- ✅ Pengumuman (buat, hapus, kirim ke kelasis)
- ✅ Manajemen Dokumen (upload/download/arsip)
- ✅ Export Data (PDF/Excel/CSV)
- ✅ Activity Log (CREATE/UPDATE/DELETE/LOGIN)
- ✅ Pengaturan Sistem + toggle keamanan + backup
- ✅ Responsive (laptop, tablet, HP)
- ✅ Dark theme profesional dengan aksen emas

---

## 🎨 Design System

- **Background:** `#09111f` (deep navy)
- **Accent:** `#c8a020` (sacred gold)
- **Font Display:** Playfair Display (serif, elegan)
- **Font Body:** DM Sans (bersih, readable)
- **Font Code:** JetBrains Mono (data/angka)

---

© 2024 SIMGK — Gereja Koordinator Deiyai · Papua Tengah
