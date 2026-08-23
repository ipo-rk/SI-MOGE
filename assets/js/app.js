/**
 * ============================================================
 * SIMGK DEIYAI — Alpine.js Application Logic
 * v3.5 — Full Dynamic CRUD, Realtime Sync & Persistent Store
 * ============================================================
 */

/* ── Auto-load logo-data.js jika belum dimuat oleh halaman ──
   Beberapa halaman mungkin lupa menyertakan <script src="logo-data.js">
   sebelum app.js. Guard ini memastikan SIMGK_LOGO_BASE64 selalu
   tersedia sebelum fitur print/export logo dijalankan, sehingga
   tidak lagi bergantung pada file assets/img/logo.png yang hilang. */
(function ensureLogoData() {
  if (typeof window.SIMGK_LOGO_BASE64 !== 'undefined' && window.SIMGK_LOGO_BASE64) return;
  if (document.getElementById('simgk-logo-data-autoload')) return;
  var inPages = window.location.pathname.includes('/pages/');
  var src = inPages ? '../assets/js/logo-data.js' : 'assets/js/logo-data.js';
  var s = document.createElement('script');
  s.id = 'simgk-logo-data-autoload';
  s.src = src;
  document.head.appendChild(s);
})();

/* Menunggu SIMGK_LOGO_BASE64 siap (maks ~1.5 detik) sebelum print/export
   dijalankan, untuk menghindari race condition saat auto-load di atas
   belum selesai ketika tombol print/export langsung diklik. */
function waitForLogoData(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (typeof window.SIMGK_LOGO_BASE64 !== 'undefined' && window.SIMGK_LOGO_BASE64) {
      resolve();
      return;
    }
    const start = Date.now();
    const iv = setInterval(() => {
      if ((typeof window.SIMGK_LOGO_BASE64 !== 'undefined' && window.SIMGK_LOGO_BASE64) || Date.now() - start > timeoutMs) {
        clearInterval(iv);
        resolve();
      }
    }, 50);
  });
}

/* ── SweetAlert2 helper wrappers ── */
const Swal2 = {
  confirm(title, text, icon = 'warning') {
    return Swal.fire({
      title, text, icon,
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#c8a020',
      cancelButtonColor: '#1a2438',
      background: '#0d1828',
      color: '#dce5f2',
      customClass: { popup: 'swal-popup', title: 'swal-title', htmlContainer: 'swal-text' }
    });
  },
  success(title, text = '') {
    return Swal.fire({
      title, text, icon: 'success',
      timer: 2200, timerProgressBar: true, showConfirmButton: false,
      background: '#0d1828', color: '#dce5f2', iconColor: '#16b89a',
      customClass: { popup: 'swal-popup' }
    });
  },
  error(title, text = '') {
    return Swal.fire({
      title, text, icon: 'error',
      confirmButtonColor: '#c8a020',
      background: '#0d1828', color: '#dce5f2', iconColor: '#dd5566',
      customClass: { popup: 'swal-popup' }
    });
  },
  toast(title, icon = 'success') {
    return Swal.fire({
      toast: true, position: 'bottom-end', icon, title,
      showConfirmButton: false, timer: 2500, timerProgressBar: true,
      background: '#172234', color: '#dce5f2',
      iconColor: icon === 'success' ? '#16b89a' : icon === 'error' ? '#dd5566' : icon === 'info' ? '#5a9bf0' : '#c8a020',
    });
  }
};

/* ── File Download & Export Utility ── */
const FileUtil = {
  downloadBlob(filename, content, mimeType = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  exportCSV(filename, headers, rows) {
    const escapeCol = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const headerLine = headers.map(escapeCol).join(',');
    const rowLines = rows.map(r => r.map(escapeCol).join(','));
    const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
    this.downloadBlob(filename, csvContent, 'text/csv;charset=utf-8;');
  },
  exportJSON(filename, data) {
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadBlob(filename, jsonStr, 'application/json;charset=utf-8;');
  },
  async exportWord(filename, title, headers, rows, meta = {}) {
    await waitForLogoData();
    const now = new Date();
    const dateStr = meta.date || now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const docNo = meta.docNo || ('SIMGK/DOC-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + '/' + Math.floor(1000 + Math.random() * 9000));
    const kText = meta.kelasis || 'Seluruh Wilayah (6 Kelasis Deiyai)';
    const logoImgSrc = (typeof SIMGK_LOGO_BASE64 !== 'undefined' && SIMGK_LOGO_BASE64) ? SIMGK_LOGO_BASE64 : '../assets/img/logo.png';

    let tableHeaders = headers.map(h => `<th style="background-color:#f3f4f6;border:1px solid #374151;padding:8px 10px;text-align:left;font-family:Arial,sans-serif;font-size:10pt;font-weight:bold;color:#111827;">${h}</th>`).join('');
    let tableRows = rows.map((r, rIdx) => {
      const bg = rIdx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const cells = r.map(c => `<td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;color:#1f2937;">${c}</td>`).join('');
      return `<tr style="background-color:${bg};">${cells}</tr>`;
    }).join('');

    const wordContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title}</title>
<style>
@page { size: A4 portrait; margin: 20mm 15mm 20mm 15mm; }
body { font-family: 'Arial', sans-serif; color: #111827; margin: 0; padding: 10px; background: #ffffff; }
.kop-table { width: 100%; border-collapse: collapse; border: none; border-bottom: 3px double #111827; margin-bottom: 18px; padding-bottom: 12px; }
.kop-table td { border: none; }
.kop-title { font-family: 'Georgia', 'Times New Roman', serif; font-size: 15pt; font-weight: bold; color: #111827; margin-bottom: 2px; }
.kop-sub { font-family: 'Arial', sans-serif; font-size: 10.5pt; font-weight: bold; color: #374151; margin-bottom: 3px; }
.kop-addr { font-family: 'Arial', sans-serif; font-size: 8pt; color: #6b7280; }
.doc-title { text-align: center; margin-bottom: 16px; }
.doc-title h3 { font-size: 13pt; text-decoration: underline; margin: 0 0 3px 0; text-transform: uppercase; color: #111827; }
.doc-title .reg { font-size: 9pt; color: #6b7280; }
.meta-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; background: #f9fafb; margin-bottom: 14px; font-size: 9pt; }
.meta-table td { border: none; padding: 6px 10px; color: #374151; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
.sign-table { width: 100%; border-collapse: collapse; border: none; margin-top: 40px; }
.sign-td { width: 50%; text-align: center; font-size: 9pt; vertical-align: top; border: none; }
</style>
</head>
<body>

<table class="kop-table">
  <tr>
    <td style="width:85px;text-align:center;vertical-align:middle;">
      <img src="${logoImgSrc}" width="75" height="75" style="width:75px;height:75px;object-fit:contain;" alt="Logo Sinode KINGMI Papua" />
    </td>
    <td style="text-align:center;vertical-align:middle;">
      <div class="kop-title">SINODE GEREJA KEMAH INJIL (KINGMI) DI TANAH PAPUA</div>
      <div class="kop-sub">BADAN PEKERJA KOORDINATOR DEIYAI · PAPUA TENGAH</div>
      <div class="kop-addr">Sekretariat: Jl. Trans Papua, Waghete, Distrik Tigi, Kabupaten Deiyai, Papua Tengah 98751</div>
    </td>
    <td style="width:85px;"></td>
  </tr>
</table>

<div class="doc-title">
  <h3>${title}</h3>
  <div class="reg">No. Registrasi: ${docNo}</div>
</div>

<table class="meta-table">
  <tr>
    <td><strong>Cakupan Wilayah:</strong> ${kText}</td>
    <td style="text-align:right;"><strong>Tanggal Penerbitan:</strong> ${dateStr}</td>
  </tr>
  <tr>
    <td><strong>Total Rekam Data:</strong> ${rows.length} Baris Data</td>
    <td style="text-align:right;"><strong>Status:</strong> Tervalidasi Resmi (SIMGK Deiyai)</td>
  </tr>
</table>

<table class="data-table">
  <thead><tr>${tableHeaders}</tr></thead>
  <tbody>${tableRows}</tbody>
</table>
${meta.chartRows && meta.chartRows.length ? `
<div style="margin-top:22px;margin-bottom:6px;">
  <div style="font-family:'Georgia',serif;font-size:12pt;font-weight:bold;color:#111827;text-transform:uppercase;border-bottom:1.5px solid #111827;padding-bottom:3px;">
    📈 Grafik Visual &amp; Distribusi Pelayanan per Wilayah
  </div>
</div>
<table class="data-table">
  <thead>
    <tr>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:25%;">Wilayah Kelasis</th>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:35%;">Distribusi Jemaat (% &amp; Jiwa)</th>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:40%;">Sebaran Gereja &amp; Pelayan</th>
    </tr>
  </thead>
  <tbody>
    ${meta.chartRows.map((cr, cIdx) => {
      const cBg = cIdx % 2 === 0 ? '#ffffff' : '#f9fafb';
      return `<tr style="background-color:${cBg};">
        <td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;">${cr.nama}</td>
        <td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;color:#1f2937;">
          <div style="font-weight:bold;color:#c8a020;">${cr.jemaat.toLocaleString('id')} Jiwa (${cr.jPct}%)</div>
          <div style="background-color:#e5e7eb;height:7px;width:100%;border-radius:3px;margin-top:3px;">
            <div style="background-color:#c8a020;height:7px;width:${cr.jPct}%;border-radius:3px;"></div>
          </div>
        </td>
        <td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;color:#1f2937;">
          <div><strong>${cr.gereja} Gereja</strong> &nbsp;·&nbsp; ${cr.pendeta} Pendeta/Pelayan</div>
          <div style="background-color:#e5e7eb;height:7px;width:100%;border-radius:3px;margin-top:3px;">
            <div style="background-color:#3478d5;height:7px;width:${cr.gPct}%;border-radius:3px;"></div>
          </div>
        </td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
` : ''}

${meta.statsRows && meta.statsRows.length ? `
<div style="margin-top:22px;margin-bottom:6px;">
  <div style="font-family:'Georgia',serif;font-size:12pt;font-weight:bold;color:#111827;text-transform:uppercase;border-bottom:1.5px solid #111827;padding-bottom:3px;">
    📊 Ringkasan Statistik Pelayanan Wilayah
  </div>
</div>
<table class="data-table">
  <thead>
    <tr>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:35%;">Indikator Pelayanan</th>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:30%;">Jumlah / Angka Terdata</th>
      <th style="background-color:#e5e7eb;border:1px solid #374151;padding:6px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;width:35%;">Keterangan &amp; Analisis</th>
    </tr>
  </thead>
  <tbody>
    ${meta.statsRows.map((sr, sIdx) => {
      const sBg = sIdx % 2 === 0 ? '#ffffff' : '#f9fafb';
      return `<tr style="background-color:${sBg};"><td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;font-weight:bold;color:#111827;">${sr[0]}</td><td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;color:#1f2937;">${sr[1]}</td><td style="border:1px solid #d1d5db;padding:6px 10px;font-family:Arial,sans-serif;font-size:9.5pt;color:#4b5563;">${sr[2]}</td></tr>`;
    }).join('')}
  </tbody>
</table>
` : ''}

<table class="sign-table">
  <tr>
    <td class="sign-td">
      <div>Mengetahui,</div>
      <div style="font-weight:bold;margin-top:2px;">Ketua Koordinator Deiyai</div>
      <div style="height:55px;"></div>
      <div style="text-decoration:underline;font-weight:bold;">Pdt. Samuel Pakage, S.Th</div>
      <div style="font-size:8pt;color:#6b7280;margin-top:2px;">NIP/Reg: 19820412.200801.1.002</div>
    </td>
    <td class="sign-td">
      <div>Deiyai, ${dateStr}</div>
      <div style="font-weight:bold;margin-top:2px;">Sekretaris Pelayanan</div>
      <div style="height:55px;"></div>
      <div style="text-decoration:underline;font-weight:bold;">Pnt. Yohanes Gobai</div>
      <div style="font-size:8pt;color:#6b7280;margin-top:2px;">NIP/Reg: 19870619.201202.1.004</div>
    </td>
  </tr>
</table>

</body>
</html>`;

    this.downloadBlob(filename, wordContent, 'application/msword;charset=utf-8;');
  },
  async printHTML(htmlContent) {
    await waitForLogoData();
    const inPages = window.location.pathname.includes('/pages/');
    /* PENTING: base href harus URL HALAMAN SAAT INI apa adanya
       (bukan '../' buatan sendiri). Kalau dipaksa '../', maka path
       relatif apa pun yang masih ada di dalam htmlContent (mis.
       "../assets/img/logo.png") akan ikut naik SEKALI LAGI dari
       base yang sudah naik duluan -> "loncat ganda" dan keluar dari
       folder proyek (mis. dari /SI-MOGE/pages/ jadi mendarat di
       root domain, bukan /SI-MOGE/). Dengan base = URL halaman asli,
       resolusi path relatif di iframe sama persis seperti di halaman
       aslinya. */
    const baseHref = window.location.href;
    const logoSrc = (typeof SIMGK_LOGO_BASE64 !== 'undefined' && SIMGK_LOGO_BASE64) ? SIMGK_LOGO_BASE64 : (inPages ? '../assets/img/logo.png' : 'assets/img/logo.png');

    /* Sanitasi: htmlContent bisa datang dari innerHTML elemen preview
       di halaman (mis. rep.innerHTML) yang mungkin masih memuat
       <img src="assets/img/logo.png"> atau "../assets/img/logo.png"
       apa adanya. Ganti semua kemunculan itu dengan logoSrc (base64
       jika tersedia) supaya tidak lagi memicu request ke file yang
       tidak ada. */
    if (typeof htmlContent === 'string') {
      htmlContent = htmlContent
        .replace(/src=(["'])(?:\.\.\/)?assets\/img\/logo\.png\1/g, `src=$1${logoSrc}$1`);
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const printDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base href="${baseHref}">
  <title>Laporan Resmi — SIMGK Deiyai</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap">
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', Arial, sans-serif; color: #111827; margin: 0; padding: 0; background: #ffffff; font-size: 9.5pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .paper-kop, .print-kop { display: flex; align-items: center; gap: 14px; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 16px; text-align: center; }
    .paper-kop-logo, .print-kop-logo { width: 75px; height: 75px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .paper-kop-logo img, .print-kop-logo img { width: 75px; height: 75px; object-fit: contain; }
    .paper-kop-text, .print-kop-text { flex: 1; text-align: center; }
    .paper-kop-title, .print-kop-title { font-family: 'Playfair Display', serif; font-size: 13.5pt; font-weight: 800; color: #111827; margin-bottom: 2px; }
    .paper-kop-sub, .print-kop-sub { font-size: 10pt; font-weight: 600; color: #374151; margin-bottom: 3px; }
    .paper-kop-addr, .print-kop-addr { font-size: 8pt; color: #4b5563; }
    .paper-meta, .print-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; font-size: 8.5pt; color: #374151; background: #f9fafb; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 4px; }
    .paper-table, .data-table { border-collapse: collapse; width: 100%; margin: 12px 0; border: 1px solid #374151; font-size: 8.5pt; }
    .paper-table th, .data-table th { background: #f3f4f6 !important; color: #111827; border: 1px solid #374151; font-weight: 700; padding: 6px 8px; text-align: left; }
    .paper-table td, .data-table td { border: 1px solid #d1d5db; color: #1f2937; padding: 5px 8px; }
    .paper-table tr:nth-child(even) td, .data-table tr:nth-child(even) td { background: #f9fafb !important; }
    .paper-sign-grid, .print-signature-box { display: flex; justify-content: space-between; margin-top: 32px; page-break-inside: avoid; }
    .paper-sign-box, .print-sign-item { text-align: center; width: 200px; font-size: 8.5pt; }
    .paper-sign-space, .print-sign-space { height: 50px; }
    .print-sign-name { font-weight: 700; text-decoration: underline; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const triggerPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        window.print();
      }
    };

    iframe.onload = () => {
      try {
        iframe.contentWindow.onafterprint = () => {
          try { iframe.remove(); } catch (e) { }
        };
      } catch (e) { }

      /* CATATAN KONSISTENSI:
         window.print() bersifat blocking — skrip baru lanjut setelah
         dialog cetak/print-preview ditutup oleh user (bisa berdetik-detik).
         Sebelumnya panggilan ini dijadwalkan lewat requestAnimationFrame,
         sehingga Chrome mencatatnya sebagai "requestAnimationFrame handler
         took Xms" — padahal rAF semestinya untuk pekerjaan render cepat
         (<16ms), bukan menunggu interaksi user. Dijadwalkan lewat
         setTimeout supaya semantiknya benar: ini "tugas nanti", bukan
         "tugas frame render berikutnya". Durasi warning itu sendiri
         sebetulnya wajar/tidak berbahaya karena hanya mengukur lama user
         berinteraksi dengan dialog print, bukan JS yang benar-benar berat. */
      setTimeout(() => {
        triggerPrint();
        setTimeout(() => {
          try { if (iframe.parentNode) iframe.remove(); } catch (e) { }
        }, 3000);
      }, 60);
    };

    /* srcdoc menggantikan document.write() (deprecated / dilarang
       oleh Chrome untuk iframe non-blocking) sekaligus tetap
       memicu event 'load' yang bisa dipakai untuk menjalankan print. */
    iframe.srcdoc = printDoc;
  },

  async printReport(title, headers, rows, meta = {}) {
    const now = new Date();
    const dateStr = meta.date || now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const docNo = meta.docNo || ('SIMGK/DOC-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + '/' + Math.floor(1000 + Math.random() * 9000));
    const kText = meta.kelasis || 'Seluruh Wilayah (6 Kelasis Deiyai)';
    const inPages = window.location.pathname.includes('/pages/');
    const logoSrc = (typeof SIMGK_LOGO_BASE64 !== 'undefined' && SIMGK_LOGO_BASE64) ? SIMGK_LOGO_BASE64 : (inPages ? '../assets/img/logo.png' : 'assets/img/logo.png');

    let tableHeaders = headers.map(h => `<th>${h}</th>`).join('');
    let tableRows = rows.map((r, rIdx) => {
      const cells = r.map(c => `<td>${c}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const htmlContent = `
      <div class="print-kop">
        <div class="print-kop-logo"><img src="${logoSrc}" alt="Logo Sinode KINGMI Papua" /></div>
        <div class="print-kop-text">
          <div class="print-kop-title">SINODE GEREJA KEMAH INJIL (KINGMI) DI TANAH PAPUA</div>
          <div class="print-kop-sub">BADAN PEKERJA KOORDINATOR DEIYAI · PAPUA TENGAH</div>
          <div class="print-kop-addr">Sekretariat: Jl. Trans Papua, Waghete, Distrik Tigi, Kabupaten Deiyai, Papua Tengah 98751</div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:800;text-decoration:underline;color:#111827;text-transform:uppercase;">${title}</div>
        <div style="font-size:11px;color:#4b5563;margin-top:2px;">No. Registrasi: ${docNo}</div>
      </div>

      <div class="print-meta-grid">
        <div><strong>Cakupan Wilayah:</strong> ${kText}</div>
        <div><strong>Tanggal Penerbitan:</strong> ${dateStr}</div>
        <div><strong>Total Rekam Data:</strong> ${rows.length} Baris Data</div>
        <div><strong>Otoritas Sistem:</strong> SIMGK Deiyai v3.5 (Tervalidasi)</div>
      </div>

      <table class="data-table">
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div class="print-signature-box">
        <div class="print-sign-item">
          <div>Mengetahui,</div>
          <div style="font-weight:600;">Ketua Koordinator Deiyai</div>
          <div class="print-sign-space"></div>
          <div class="print-sign-name">Pdt. Samuel Pakage, S.Th</div>
          <div style="font-size:10px;color:#6b7280;">NIP/Reg: 19820412.200801.1.002</div>
        </div>

        <div class="print-sign-item">
          <div>Deiyai, ${dateStr}</div>
          <div style="font-weight:600;">Sekretaris Pelayanan</div>
          <div class="print-sign-space"></div>
          <div class="print-sign-name">Pnt. Yohanes Gobai</div>
          <div style="font-size:10px;color:#6b7280;">NIP/Reg: 19870619.201202.1.004</div>
        </div>
      </div>
    `;

    Swal2.toast('Menyiapkan dokumen PDF...', 'info');
    await this.printHTML(htmlContent);
  }
};

/* ── Initial Seed Data (Default bila localStorage belum ada) ── */
const INITIAL_DATA = {
  kelasis: [
    { id: 'KLS-001', nama: 'Kelasis Tigi', ketua: 'Pnt. Yohanes Gobai', kontak: '+62 812-3456-7890', alamat: 'Distrik Tigi, Deiyai, Papua Tengah', gereja: 9, jemaat: 724, pendeta: 11, color: 'var(--gold)', badge: 'badge-gold' },
    { id: 'KLS-002', nama: 'Kelasis Tigi Barat', ketua: 'Pnt. Andreas Mote', kontak: '+62 813-2345-6789', alamat: 'Tigi Barat, Deiyai, Papua Tengah', gereja: 8, jemaat: 612, pendeta: 9, color: 'var(--blue2)', badge: 'badge-blue' },
    { id: 'KLS-003', nama: 'Kelasis Yatamo', ketua: 'Pnt. Martinus Pigai', kontak: '+62 821-3456-7890', alamat: 'Yatamo, Deiyai, Papua Tengah', gereja: 7, jemaat: 543, pendeta: 8, color: 'var(--teal)', badge: 'badge-teal' },
    { id: 'KLS-004', nama: 'Kelasis Wagamo', ketua: 'Pnt. Samuel Dimi', kontak: '+62 822-4567-8901', alamat: 'Wagamo, Deiyai, Papua Tengah', gereja: 8, jemaat: 684, pendeta: 9, color: 'var(--violet)', badge: 'badge-violet' },
    { id: 'KLS-005', nama: 'Kelasis Tigi Utara', ketua: 'Pnt. Daniel Pakage', kontak: '+62 823-5678-9012', alamat: 'Tigi Utara, Deiyai, Papua Tengah', gereja: 9, jemaat: 701, pendeta: 10, color: 'var(--rose)', badge: 'badge-rose' },
    { id: 'KLS-006', nama: 'Kelasis Debey', ketua: 'Pnt. Thomas Keiya', kontak: '+62 824-6789-0123', alamat: 'Debey, Deiyai, Papua Tengah', gereja: 7, jemaat: 583, pendeta: 5, color: 'var(--lime)', badge: 'badge-lime' },
  ],
  gereja: [
    { id: 'GRJ-001', nama: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', gembala: 'Pdt. Yohanes Gobai', tahun: 1985, jemaat: 148, status: 'Aktif', alamat: 'Jl. Raya Tigi No. 01, Deiyai', foto: 'https://images.unsplash.com/photo-1548625361-16ef7ef0ad39?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-002', nama: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', gembala: 'Pdt. Andreas Mote', tahun: 1991, jemaat: 132, status: 'Aktif', alamat: 'Jl. Trans Papua Barat, Deiyai', foto: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-003', nama: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', gembala: 'Pdt. Martinus Pigai', tahun: 1997, jemaat: 97, status: 'Aktif', alamat: 'Kampung Yatamo, Deiyai', foto: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-004', nama: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', gembala: 'Pdt. Samuel Dimi', tahun: 2001, jemaat: 115, status: 'Aktif', alamat: 'Distrik Wagamo, Deiyai', foto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-005', nama: 'GKI Tigi Utara', kelasis: 'Tigi Utara', kelasisBadge: 'badge-rose', gembala: 'Pdt. Daniel Pakage', tahun: 1999, jemaat: 88, status: 'Nonaktif', alamat: 'Kompleks Tigi Utara, Deiyai', foto: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-006', nama: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', gembala: 'Pdt. Thomas Keiya', tahun: 2008, jemaat: 103, status: 'Aktif', alamat: 'Jl. Lembah Debey, Deiyai', foto: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-007', nama: 'GKE Wagamo Timur', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', gembala: 'Pdt. Petrus Dimi', tahun: 2003, jemaat: 76, status: 'Aktif', alamat: 'Kampung Wagamo Timur, Deiyai', foto: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80' },
    { id: 'GRJ-008', nama: 'GKII Tigi Selatan', kelasis: 'Tigi', kelasisBadge: 'badge-gold', gembala: 'Pdt. Maria Gobai', tahun: 2005, jemaat: 94, status: 'Aktif', alamat: 'Jl. Pelayanan Tigi Selatan, Deiyai', foto: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=800&q=80' },
  ],
  jemaat: [
    { id: 'JMT-0001', nama: 'Maria Gobai', jk: 'P', lahir: '1990-03-14', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', hp: '+62 812-1111-2222', status: 'Aktif', alamat: 'Tigi Pusat' },
    { id: 'JMT-0002', nama: 'Yohanes Mote', jk: 'L', lahir: '1985-07-22', gereja: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', hp: '+62 813-2222-3333', status: 'Aktif', alamat: 'Tigi Barat' },
    { id: 'JMT-0003', nama: 'Debora Pigai', jk: 'P', lahir: '1998-01-05', gereja: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', hp: '+62 821-3333-4444', status: 'Aktif', alamat: 'Yatamo' },
    { id: 'JMT-0004', nama: 'Petrus Dimi', jk: 'L', lahir: '1979-09-11', gereja: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', hp: '+62 822-4444-5555', status: 'Pindah', alamat: 'Wagamo' },
    { id: 'JMT-0005', nama: 'Marta Pakage', jk: 'P', lahir: '2000-04-30', gereja: 'GKI Tigi Utara', kelasis: 'Tigi Utara', kelasisBadge: 'badge-rose', hp: '+62 823-5555-6666', status: 'Aktif', alamat: 'Tigi Utara' },
    { id: 'JMT-0006', nama: 'Samuel Keiya', jk: 'L', lahir: '1988-10-18', gereja: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', hp: '+62 824-6666-7777', status: 'Aktif', alamat: 'Debey Baru' },
  ],
  kegiatan: [
    { nama: 'Ibadah Minggu Pagi', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', tanggal: '2024-11-10', peserta: 148, jenis: 'Ibadah Minggu', jenisBadge: 'badge-blue', deskripsi: 'Ibadah Minggu Pagi reguler dengan perjamuan kasih.' },
    { nama: 'Baptisan Dewasa', gereja: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', tanggal: '2024-11-08', peserta: 12, jenis: 'Baptisan', jenisBadge: 'badge-teal', deskripsi: 'Pelayanan sakramen baptisan kudus bagi 12 anggota jemaat baru.' },
    { nama: 'Seminar Kepemimpinan', gereja: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', tanggal: '2024-11-05', peserta: 65, jenis: 'Seminar', jenisBadge: 'badge-violet', deskripsi: 'Pelatihan kepemimpinan pemuda dan majelis gereja se-Kelasis Yatamo.' },
    { nama: 'Ibadah Pemuda', gereja: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', tanggal: '2024-11-03', peserta: 44, jenis: 'Ibadah Pemuda', jenisBadge: 'badge-rose', deskripsi: 'Ibadah persekutuan pemuda gabungan.' },
    { nama: 'Sekolah Minggu', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', tanggal: '2024-11-03', peserta: 83, jenis: 'Sekolah Minggu', jenisBadge: 'badge-gold', deskripsi: 'Pembinaan rohani anak-anak usia dini dan sekolah dasar.' },
    { nama: 'Pelayanan Sosial Debey', gereja: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', tanggal: '2024-11-01', peserta: 120, jenis: 'Pelayanan Sosial', jenisBadge: 'badge-lime', deskripsi: 'Aksi sosial pembagian sembako dan pengobatan gratis di distrik Debey.' },
  ],
  laporan: [
    { judul: 'Laporan Bulanan Oktober 2024', kelasis: 'Tigi', kelasisBadge: 'badge-gold', jenis: 'Laporan Bulanan', jenisBadge: 'badge-blue', periode: '2024-10', tglKirim: '12 Nov 2024', status: 'Diterima', isi: 'Laporan rekapitulasi pelayanan jemaat, persembahan, dan jadwal ibadah bulan Oktober 2024.' },
    { judul: 'Laporan Kegiatan Seminar', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', jenis: 'Laporan Kegiatan', jenisBadge: 'badge-gold', periode: '2024-11', tglKirim: '10 Nov 2024', status: 'Diterima', isi: 'Hasil evaluasi dan dokumentasi Seminar Kepemimpinan Pemuda.' },
    { judul: 'Laporan Bulanan Oktober 2024', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', jenis: 'Laporan Bulanan', jenisBadge: 'badge-blue', periode: '2024-10', tglKirim: '08 Nov 2024', status: 'Proses', isi: 'Laporan evaluasi program kerja dan kebutuhan pastoral.' },
    { judul: 'Laporan Tahunan 2023', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', jenis: 'Laporan Tahunan', jenisBadge: 'badge-violet', periode: '2023-12', tglKirim: '05 Nov 2024', status: 'Diterima', isi: 'Laporan pertanggungjawaban program kerja tahun 2023.' },
    { judul: 'Laporan Pelayanan Sosial', kelasis: 'Debey', kelasisBadge: 'badge-lime', jenis: 'Laporan Pelayanan', jenisBadge: 'badge-teal', periode: '2024-11', tglKirim: '02 Nov 2024', status: 'Proses', isi: 'Laporan realisasi anggaran kegiatan bakti sosial distrik Debey.' },
  ],
  dokumen: [
    { nama: 'SK Pelayanan Pdt. Yohanes Gobai.pdf', jenis: 'SK Pelayanan', jenisBadge: 'badge-blue', kelasis: 'Tigi', kelasisBadge: 'badge-gold', ukuran: '245 KB', tgl: '01 Nov 2024' },
    { nama: 'Laporan Tahunan 2023 Tigi Barat.xlsx', jenis: 'Laporan', jenisBadge: 'badge-teal', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', ukuran: '1.2 MB', tgl: '30 Okt 2024' },
    { nama: 'Notulen Sidang Klasis Yatamo 2024.docx', jenis: 'Notulen', jenisBadge: 'badge-violet', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', ukuran: '89 KB', tgl: '25 Okt 2024' },
    { nama: 'Foto Kegiatan Seminar Nov 2024.zip', jenis: 'Dokumentasi', jenisBadge: 'badge-gold', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', ukuran: '14.5 MB', tgl: '10 Nov 2024' },
  ],
  users: [
    { nama: 'Administrator Sistem', email: 'admin@deiyai.id', role: 'Super Admin', kelasis: '— Semua —', status: 'Aktif' },
    { nama: 'Pnt. Yohanes Gobai', email: 'tigi@deiyai.id', role: 'Admin Kelasis', kelasis: 'Kelasis Tigi', status: 'Aktif' },
    { nama: 'Pnt. Andreas Mote', email: 'tigibarat@deiyai.id', role: 'Admin Kelasis', kelasis: 'Tigi Barat', status: 'Aktif' },
    { nama: 'Op. Maria Pigai', email: 'gke.tigi@deiyai.id', role: 'Operator Gereja', kelasis: 'GKE Tigi Pusat', status: 'Aktif' },
    { nama: 'Op. Daniel Dimi', email: 'gke.wagamo@deiyai.id', role: 'Operator Gereja', kelasis: 'GKE Wagamo Selatan', status: 'Nonaktif' },
  ],
  pengumuman: [
    { judul: 'Sidang Sinode Tahunan 2024', body: 'Sidang Sinode Tahunan Koordinator Deiyai dilaksanakan 15–18 Desember 2024. Seluruh ketua kelasis wajib hadir.', tujuan: 'Semua Kelasis', tujuanBadge: 'badge-gold', prioritas: 'Penting', oleh: 'Administrator', tgl: '10 November 2024' },
    { judul: 'Program Pelayanan Advent 2024', body: 'Koordinator mengimbau seluruh gereja mempersiapkan program pelayanan Advent mulai minggu pertama Desember. Tema: "Cahaya di Papua".', tujuan: 'Seluruh Gereja', tujuanBadge: 'badge-blue', prioritas: 'Normal', oleh: 'Administrator', tgl: '05 November 2024' },
    { judul: 'Deadline Laporan Tahunan 2024', body: 'Seluruh kelasis wajib mengirim laporan tahunan 2024 paling lambat 31 Januari 2025 melalui modul Laporan Pelayanan.', tujuan: 'Admin Kelasis', tujuanBadge: 'badge-violet', prioritas: 'Mendesak', oleh: 'Administrator', tgl: '01 November 2024' },
  ],
  actlog: [
    { time: '2024-11-12 09:14', user: 'Administrator Sistem', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
    { time: '2024-11-12 09:22', user: 'Pnt. Yohanes Gobai', action: 'Menambahkan laporan bulanan Oktober 2024', type: 'CREATE', typeClass: 'tag-create' },
    { time: '2024-11-12 10:05', user: 'Administrator Sistem', action: 'Menyetujui laporan Kelasis Tigi', type: 'UPDATE', typeClass: 'tag-update' },
    { time: '2024-11-11 14:30', user: 'Pnt. Andreas Mote', action: 'Mengedit data gereja GKI Tigi Barat', type: 'UPDATE', typeClass: 'tag-update' },
    { time: '2024-11-11 11:18', user: 'Op. Maria Pigai', action: 'Menambahkan kegiatan Ibadah Minggu Pagi', type: 'CREATE', typeClass: 'tag-create' },
    { time: '2024-11-10 16:44', user: 'Administrator Sistem', action: 'Menghapus data jemaat duplikat #4892', type: 'DELETE', typeClass: 'tag-delete' },
    { time: '2024-11-10 08:55', user: 'Pnt. Samuel Dimi', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
    { time: '2024-11-09 15:20', user: 'Pnt. Samuel Dimi', action: 'Upload dokumen laporan kegiatan', type: 'CREATE', typeClass: 'tag-create' },
    { time: '2024-11-09 09:11', user: 'Administrator Sistem', action: 'Menambahkan pengumuman Sidang Sinode', type: 'CREATE', typeClass: 'tag-create' },
    { time: '2024-11-08 14:00', user: 'Pnt. Daniel Pakage', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
  ],
  notifikasi: [
    { id: 1, type: 'laporan', color: 'var(--teal)', title: 'Laporan baru dari Kelasis Tigi', body: 'Laporan bulanan November 2024 telah dikirim dan menunggu verifikasi', time: '2j lalu', read: false },
    { id: 2, type: 'kegiatan', color: 'var(--gold)', title: 'Kegiatan baru ditambahkan', body: 'Ibadah Minggu — GKI Tigi Barat telah dicatat oleh Admin Kelasis', time: '4j lalu', read: false },
    { id: 3, type: 'gereja', color: 'var(--blue2)', title: 'Data gereja diperbarui', body: 'GKE Wagamo — Jumlah jemaat diperbarui dari 110 menjadi 115', time: '1h lalu', read: false },
    { id: 4, type: 'user', color: 'var(--violet)', title: 'User baru terdaftar', body: 'Operator Gereja Yatamo bergabung ke sistem', time: '1h lalu', read: false },
    { id: 5, type: 'warning', color: 'var(--rose)', title: 'Laporan belum masuk', body: 'Kelasis Debey belum mengirimkan laporan Oktober 2024', time: '2h lalu', read: true },
  ],
  settings: {
    namaSistem: 'SIMGK Deiyai',
    namaKoordinator: 'Gereja Koordinator Deiyai',
    tahunPelayanan: '2024',
    kontak: '+62 812-3456-7890',
    sessionTimeout: true,
    loginLog: true,
    enkripsi: true,
    emailNotif: false,
    lastBackup: '11 Nov 2024 23:00'
  }
};

/* ── LocalStorage Helpers with Versioning ── */
const STORAGE_KEY = 'simgk_data_v3';

function loadStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    const parsed = JSON.parse(raw);
    const merged = Object.assign({}, INITIAL_DATA, parsed);
    if (Array.isArray(merged.gereja)) {
      merged.gereja = merged.gereja.map(g => {
        if (!g.foto) {
          const def = INITIAL_DATA.gereja.find(d => d.id === g.id);
          if (def && def.foto) g.foto = def.foto;
        }
        return g;
      });
    }
    return merged;
  } catch (e) {
    console.error('[SIMGK] Error loading localStorage, resetting to default', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveStoredData(data) {
  try {
    const payload = {
      kelasis: data.kelasis || [],
      gereja: data.gereja || [],
      jemaat: data.jemaat || [],
      kegiatan: data.kegiatan || [],
      laporan: data.laporan || [],
      dokumen: data.dokumen || [],
      users: data.users || [],
      pengumuman: data.pengumuman || [],
      actlog: data.actlog || [],
      notifikasi: data.notifikasi || [],
      settings: data.settings || INITIAL_DATA.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('[SIMGK] Failed to save state to localStorage', e);
  }
}

document.addEventListener('alpine:init', () => {

  const initialLoaded = loadStoredData();

  /* ════════════════════════════════════════════════════
     STORE: Auth
  ════════════════════════════════════════════════════ */
  Alpine.store('auth', {
    user: null,
    isLoggedIn: false,

    login(role, name, email) {
      this.user = {
        role, name, email,
        initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      };
      this.isLoggedIn = true;
      localStorage.setItem('simgk_user', JSON.stringify(this.user));

      // Auto Log activity
      Alpine.store('data').addActLog(`Login ke sistem sebagai ${role}`, 'LOGIN');
    },

    logout() {
      if (this.user) {
        Alpine.store('data').addActLog('Logout dari sistem', 'LOGIN');
      }
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('simgk_user');
      const inPages = window.location.pathname.includes('/pages/');
      window.location.href = inPages ? '../login.html' : 'login.html';
    },

    restore() {
      const saved = localStorage.getItem('simgk_user');
      if (saved) {
        try {
          this.user = JSON.parse(saved);
          this.isLoggedIn = true;
          return true;
        } catch { return false; }
      }
      return false;
    },

    can(action) {
      if (!this.user) return false;
      const perms = {
        'Super Admin': ['all'],
        'Admin Kelasis': ['read', 'create', 'edit', 'laporan'],
        'Operator Gereja': ['read', 'create'],
      };
      const p = perms[this.user.role] || [];
      return p.includes('all') || p.includes(action);
    }
  });

  /* ════════════════════════════════════════════════════
     STORE: Notifications
  ════════════════════════════════════════════════════ */
  Alpine.store('notif', {
    get items() {
      return Alpine.store('data').notifikasi;
    },
    get unread() {
      return this.items.filter(n => !n.read).length;
    },
    markAllRead() {
      this.items.forEach(n => n.read = true);
      Alpine.store('data').persist();
    },
    add(title, body, type = 'info', color = 'var(--gold)') {
      this.items.unshift({
        id: Date.now(),
        type,
        color,
        title,
        body,
        time: 'Baru saja',
        read: false
      });
      Alpine.store('data').persist();
    },
    remove(item) {
      const idx = this.items.indexOf(item);
      if (idx > -1) {
        this.items.splice(idx, 1);
        Alpine.store('data').persist();
      }
    }
  });

  /* ════════════════════════════════════════════════════
     STORE: Data (Master Dynamic State)
  ════════════════════════════════════════════════════ */
  Alpine.store('data', {
    kelasis: initialLoaded.kelasis,
    gereja: initialLoaded.gereja,
    jemaat: initialLoaded.jemaat,
    kegiatan: initialLoaded.kegiatan,
    laporan: initialLoaded.laporan,
    dokumen: initialLoaded.dokumen,
    users: initialLoaded.users,
    pengumuman: initialLoaded.pengumuman,
    actlog: initialLoaded.actlog,
    notifikasi: initialLoaded.notifikasi,
    settings: initialLoaded.settings,

    /* ── Computed Stats (Always Live & Synchronized) ── */
    get stats() {
      const sumJemaatGereja = (this.gereja || []).reduce((acc, g) => acc + (Number(g.jemaat) || 0), 0);
      const sumPendetaKelasis = (this.kelasis || []).reduce((acc, k) => acc + (Number(k.pendeta) || 0), 0);

      return {
        totalKelasis: (this.kelasis || []).length,
        totalGereja: (this.gereja || []).length,
        totalJemaat: sumJemaatGereja > 0 ? sumJemaatGereja : ((this.jemaat || []).length * 500 || 3847),
        totalPendeta: sumPendetaKelasis > 0 ? sumPendetaKelasis : 52,
        totalKegiatan: (this.kegiatan || []).length,
        totalLaporan: (this.laporan || []).length,
      };
    },

    getChartVisualRows() {
      const kelasisList = this.kelasis || [];
      const totalJemaat = this.stats.totalJemaat || 1;
      const totalGereja = this.stats.totalGereja || 1;

      return kelasisList.map(k => {
        const cleanName = k.nama.replace('Kelasis ', '').trim();
        const jCount = Number(k.jemaat) || 500;
        const gCount = (this.gereja || []).filter(g => g.kelasis === cleanName || g.kelasis === k.nama).length || k.gereja;
        const jPct = Math.min(100, Math.round((jCount / totalJemaat) * 100));
        const gPct = Math.min(100, Math.round((gCount / totalGereja) * 100));
        return {
          nama: k.nama,
          jemaat: jCount,
          jPct: jPct,
          gereja: gCount,
          gPct: gPct,
          pendeta: k.pendeta || 5
        };
      });
    },

    getStatsRows(kFilter = 'all') {
      const gerejaList = (this.gereja || []).filter(g => kFilter === 'all' || g.kelasis === kFilter || g.kelasis === 'Kelasis ' + kFilter);
      const jemaatList = (this.jemaat || []).filter(j => kFilter === 'all' || j.kelasis === kFilter || j.kelasis === 'Kelasis ' + kFilter);
      const kegiatanList = (this.kegiatan || []).filter(k => kFilter === 'all' || k.kelasis === kFilter || k.kelasis === 'Kelasis ' + kFilter);
      const laporanList = (this.laporan || []).filter(l => kFilter === 'all' || l.kelasis === kFilter || l.kelasis === 'Kelasis ' + kFilter);

      const totalJiwa = gerejaList.reduce((acc, g) => acc + (Number(g.jemaat) || 0), 0) || (jemaatList.length > 0 ? jemaatList.length : 3847);
      const totalPria = jemaatList.filter(j => j.jk === 'L' || j.jk === 'Laki-laki').length || Math.round(totalJiwa * 0.52);
      const totalWanita = jemaatList.filter(j => j.jk === 'P' || j.jk === 'Perempuan').length || Math.round(totalJiwa * 0.48);
      const avgJemaat = gerejaList.length > 0 ? Math.round(totalJiwa / gerejaList.length) : 0;

      return [
        ['Total Wilayah Kelasis', kFilter === 'all' ? (this.kelasis || []).length + ' Kelasis' : '1 Kelasis (' + kFilter + ')', 'Cakupan Wilayah Terpilih'],
        ['Total Gereja Binaan', gerejaList.length + ' Gereja', 'Tersebar di wilayah terpilih'],
        ['Total Anggota Jemaat', totalJiwa.toLocaleString('id') + ' Jiwa', 'Terdaftar aktif dalam sistem'],
        ['Demografi Gender', totalPria.toLocaleString('id') + ' Pria / ' + totalWanita.toLocaleString('id') + ' Wanita', 'Rasio jemaat laki-laki & perempuan'],
        ['Rata-rata Jemaat / Gereja', avgJemaat + ' Jiwa / Gereja', 'Rerata kapasitas per gedung gereja'],
        ['Total Agenda Kegiatan', kegiatanList.length + ' Kegiatan', 'Ibadah & pembinaan terlaksana'],
        ['Laporan Pelayanan', laporanList.length + ' Berkas', 'Laporan masuk & evaluasi'],
      ];
    },

    /* ── Persistence Trigger ── */
    persist() {
      saveStoredData(this);
    },

    /* ── Helper: Activity Logger ── */
    addActLog(action, type = 'UPDATE') {
      const typeClasses = {
        'LOGIN': 'tag-login',
        'CREATE': 'tag-create',
        'UPDATE': 'tag-update',
        'DELETE': 'tag-delete',
      };
      const authUser = Alpine.store('auth').user;
      const userName = authUser ? authUser.name : 'Administrator';

      const now = new Date();
      const timeStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

      this.actlog.unshift({
        time: timeStr,
        user: userName,
        action: action,
        type: type,
        typeClass: typeClasses[type] || 'tag-update'
      });
      this.persist();
    },

    /* ── Helper: Recalculate Kelasis Stats ── */
    recalcKelasisStats() {
      this.kelasis.forEach(k => {
        const churchCount = this.gereja.filter(g => g.kelasis === k.nama.replace('Kelasis ', '').trim() || g.kelasis === k.nama).length;
        if (churchCount > 0) k.gereja = churchCount;
      });
      this.persist();
    }
  });

  /* ── Cross-Tab Sync via Storage Event ── */
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const fresh = JSON.parse(e.newValue);
        const dataStore = Alpine.store('data');
        if (dataStore) {
          dataStore.kelasis = fresh.kelasis || [];
          dataStore.gereja = fresh.gereja || [];
          dataStore.jemaat = fresh.jemaat || [];
          dataStore.kegiatan = fresh.kegiatan || [];
          dataStore.laporan = fresh.laporan || [];
          dataStore.dokumen = fresh.dokumen || [];
          dataStore.users = fresh.users || [];
          dataStore.pengumuman = fresh.pengumuman || [];
          dataStore.actlog = fresh.actlog || [];
          dataStore.notifikasi = fresh.notifikasi || [];
          dataStore.settings = fresh.settings || dataStore.settings;
        }
      } catch (err) {
        console.error('[SIMGK] Cross-tab sync parse error', err);
      }
    }
  });

  /* ════════════════════════════════════════════════════
     COMPONENT: Layout
  ════════════════════════════════════════════════════ */
  Alpine.data('layout', (currentPage = '') => ({
    sidebarOpen: false,
    currentPage,

    init() {
      if (!Alpine.store('auth').restore()) {
        const inPages = window.location.pathname.includes('/pages/');
        window.location.href = inPages ? '../login.html' : 'login.html';
      }
    },

    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; },

    get user() { return Alpine.store('auth').user; },
    get notifCount() { return Alpine.store('notif').unread; },

    async logout() {
      const res = await Swal2.confirm('Keluar dari Sistem?', 'Anda akan logout dari SIMGK Deiyai.', 'question');
      if (res.isConfirmed) Alpine.store('auth').logout();
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Login Page
  ════════════════════════════════════════════════════ */
  Alpine.data('loginPage', () => ({
    selectedRole: 'Super Admin',
    email: 'admin@deiyai.id',
    password: '',
    loading: false,
    error: '',
    showDemo: false,

    roles: [
      { id: 'Super Admin', icon: '👑', label: 'Koordinator' },
      { id: 'Admin Kelasis', icon: '🏛️', label: 'Kelasis' },
      { id: 'Operator Gereja', icon: '⛪', label: 'Operator' },
    ],

    demoAccounts: [
      {
        role: 'Super Admin',
        email: 'admin@deiyai.id',
        password: 'admin123',
        name: 'Administrator Sistem',
        badgeClass: 'sa',
        badgeLabel: 'Super Admin',
      },
      {
        role: 'Admin Kelasis',
        email: 'tigi@deiyai.id',
        password: 'kelasis123',
        name: 'Pnt. Yohanes Gobai',
        badgeClass: 'ak',
        badgeLabel: 'Admin Kelasis',
      },
      {
        role: 'Operator Gereja',
        email: 'gke.tigi@deiyai.id',
        password: 'operator123',
        name: 'Op. Maria Pigai',
        badgeClass: 'op',
        badgeLabel: 'Operator Gereja',
      },
    ],

    selectRole(role) {
      this.selectedRole = role;
      this.error = '';
    },

    fillDemo(account) {
      this.selectRole(account.role);
      this.email = account.email;
      this.password = account.password;
    },

    async doLogin() {
      if (!this.email.trim()) { this.error = 'Email wajib diisi.'; return; }
      if (!this.password.trim()) { this.error = 'Password wajib diisi.'; return; }

      this.loading = true;
      this.error = '';

      await new Promise(r => setTimeout(r, 450));

      const names = {
        'Super Admin': 'Administrator Sistem',
        'Admin Kelasis': 'Pnt. Yohanes Gobai',
        'Operator Gereja': 'Op. Maria Pigai',
      };

      Alpine.store('auth').login(
        this.selectedRole,
        names[this.selectedRole] || this.selectedRole,
        this.email.trim()
      );

      this.loading = false;
      window.location.href = 'pages/dashboard.html';
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Dashboard
  ════════════════════════════════════════════════════ */
  Alpine.data('dashboard', () => ({
    get stats() { return Alpine.store('data').stats; },
    get recentLaporan() { return Alpine.store('data').laporan.slice(0, 5); },
    get recentKegiatan() { return Alpine.store('data').kegiatan.slice(0, 5); },
    init() {
      this.$nextTick(() => {
        if (window.initDashboardCharts) window.initDashboardCharts();
      });
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Kelasis
  ════════════════════════════════════════════════════ */
  Alpine.data('kelasisPage', () => ({
    get items() { return Alpine.store('data').kelasis; },
    showModal: false, editMode: false, form: {}, formError: '',

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { id: '', nama: '', ketua: '', kontak: '', alamat: '', color: 'var(--gold)', badge: 'badge-gold' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { ...item };
      this.showModal = true;
    },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama kelasis wajib diisi.'; return; }
      this.formError = '';
      const store = Alpine.store('data');

      if (this.editMode) {
        const idx = store.kelasis.findIndex(i => i.id === this.form.id);
        if (idx > -1) {
          store.kelasis[idx] = { ...store.kelasis[idx], ...this.form };
          store.persist();
          Swal2.toast(`Kelasis ${this.form.nama} berhasil diperbarui`);
          store.addActLog(`Mengedit data kelasis ${this.form.nama}`, 'UPDATE');
          Alpine.store('notif').add('Kelasis Diperbarui', `Data ${this.form.nama} telah diperbarui`, 'update', 'var(--blue2)');
        }
      } else {
        const newId = 'KLS-' + String(store.kelasis.length + 1).padStart(3, '0');
        store.kelasis.push({
          ...this.form,
          id: newId,
          gereja: 0,
          jemaat: 0,
          pendeta: 0,
          color: 'var(--blue2)',
          badge: 'badge-blue'
        });
        store.persist();
        Swal2.toast(`Kelasis ${this.form.nama} berhasil ditambahkan`);
        store.addActLog(`Menambahkan kelasis baru: ${this.form.nama}`, 'CREATE');
        Alpine.store('notif').add('Kelasis Ditambahkan', `${this.form.nama} berhasil didaftarkan ke sistem`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Kelasis?', `"${item.nama}" beserta relasi gerejanya akan dihapus.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.kelasis = store.kelasis.filter(i => i.id !== item.id);
      store.persist();
      Swal2.toast('Kelasis berhasil dihapus', 'error');
      store.addActLog(`Menghapus data kelasis: ${item.nama}`, 'DELETE');
      Alpine.store('notif').add('Kelasis Dihapus', `${item.nama} telah dihapus dari sistem`, 'delete', 'var(--rose)');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Gereja
  ════════════════════════════════════════════════════ */
  Alpine.data('gerejaPage', () => ({
    get allItems() { return Alpine.store('data').gereja; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    filterKelasis: '', filterStatus: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    kelasisBadgeMap: {
      'Tigi': 'badge-gold', 'Kelasis Tigi': 'badge-gold',
      'Tigi Barat': 'badge-blue', 'Kelasis Tigi Barat': 'badge-blue',
      'Yatamo': 'badge-teal', 'Kelasis Yatamo': 'badge-teal',
      'Wagamo': 'badge-violet', 'Kelasis Wagamo': 'badge-violet',
      'Tigi Utara': 'badge-rose', 'Kelasis Tigi Utara': 'badge-rose',
      'Debey': 'badge-lime', 'Kelasis Debey': 'badge-lime'
    },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(g => {
        const matchK = !this.filterKelasis || g.kelasis === this.filterKelasis || g.kelasis === `Kelasis ${this.filterKelasis}`;
        const matchS = !this.filterStatus || g.status === this.filterStatus;
        const matchQ = !q || g.nama.toLowerCase().includes(q) || (g.gembala || '').toLowerCase().includes(q);
        return matchK && matchS && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { id: '', nama: '', kelasis: '', gembala: '', tahun: new Date().getFullYear(), jemaat: 0, status: 'Aktif', alamat: '', foto: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { foto: '', ...item };
      this.showModal = true;
    },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    handleFoto(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        Swal2.toast('Ukuran foto maksimal 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.form.foto = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama gereja wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';

      const cleanKelasis = this.form.kelasis.replace('Kelasis ', '');
      const badge = this.kelasisBadgeMap[cleanKelasis] || 'badge-blue';
      const store = Alpine.store('data');

      if (this.editMode) {
        const idx = store.gereja.findIndex(i => i.id === this.form.id);
        if (idx > -1) {
          store.gereja[idx] = { ...store.gereja[idx], ...this.form, kelasis: cleanKelasis, kelasisBadge: badge };
          store.recalcKelasisStats();
          Swal2.toast(`${this.form.nama} berhasil diperbarui`);
          store.addActLog(`Mengedit data gereja: ${this.form.nama}`, 'UPDATE');
          Alpine.store('notif').add('Gereja Diperbarui', `${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
        }
      } else {
        const newId = 'GRJ-' + String(store.gereja.length + 1).padStart(3, '0');
        store.gereja.unshift({ ...this.form, id: newId, kelasis: cleanKelasis, kelasisBadge: badge });
        store.recalcKelasisStats();
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        store.addActLog(`Menambahkan gereja baru: ${this.form.nama}`, 'CREATE');
        Alpine.store('notif').add('Gereja Ditambahkan', `${this.form.nama} terdaftar di Kelasis ${cleanKelasis}`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Gereja?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.gereja = store.gereja.filter(i => i.id !== item.id);
      store.recalcKelasisStats();
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Gereja berhasil dihapus', 'error');
      store.addActLog(`Menghapus data gereja: ${item.nama}`, 'DELETE');
      Alpine.store('notif').add('Gereja Dihapus', `${item.nama} telah dihapus`, 'delete', 'var(--rose)');
    },

    exportData(fmt = 'CSV') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const headers = ['ID', 'Nama Gereja', 'Kelasis', 'Gembala', 'Tahun Berdiri', 'Jumlah Jemaat', 'Status', 'Alamat'];
      const rows = this.filtered.map(g => [g.id, g.nama, g.kelasis, g.gembala || '', g.tahun || '', g.jemaat || 0, g.status, g.alamat || '']);
      FileUtil.exportCSV('Data_Gereja_SIMGK_Deiyai.csv', headers, rows);
      Swal2.toast('Data gereja berhasil diexport ke CSV');
      Alpine.store('data').addActLog('Mengekspor data gereja ke CSV', 'UPDATE');
    },

    exportWord() {
      const headers = ['No', 'ID', 'Nama Gereja', 'Kelasis', 'Gembala Jemaat', 'Tahun', 'Jemaat', 'Status'];
      const rows = this.filtered.map((g, idx) => [idx + 1, g.id, g.nama, g.kelasis, g.gembala || '-', g.tahun || '-', (g.jemaat || 0).toLocaleString('id') + ' Jiwa', g.status]);
      FileUtil.exportWord('Data_Gereja_SIMGK_Deiyai.doc', 'DATA GEREJA KOORDINATOR DEIYAI', headers, rows);
      Swal2.toast('Data gereja berhasil diexport ke Word (.doc)');
      Alpine.store('data').addActLog('Mengekspor data gereja ke Word', 'UPDATE');
    },

    exportPDF() {
      const headers = ['No', 'ID', 'Nama Gereja', 'Kelasis', 'Gembala Jemaat', 'Tahun', 'Jemaat', 'Status'];
      const rows = this.filtered.map((g, idx) => [idx + 1, g.id, g.nama, g.kelasis, g.gembala || '-', g.tahun || '-', (g.jemaat || 0).toLocaleString('id'), g.status]);
      FileUtil.printReport('DATA GEREJA KOORDINATOR DEIYAI', headers, rows);
      Alpine.store('data').addActLog('Mencetak laporan PDF data gereja', 'UPDATE');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Jemaat
  ════════════════════════════════════════════════════ */
  Alpine.data('jemaatPage', () => ({
    get allItems() { return Alpine.store('data').jemaat; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    get gerejaList() { return Alpine.store('data').gereja; },
    filterKelasis: '', filterStatus: '', filterJK: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    kelasisBadgeMap: {
      'Tigi': 'badge-gold', 'Kelasis Tigi': 'badge-gold',
      'Tigi Barat': 'badge-blue', 'Kelasis Tigi Barat': 'badge-blue',
      'Yatamo': 'badge-teal', 'Kelasis Yatamo': 'badge-teal',
      'Wagamo': 'badge-violet', 'Kelasis Wagamo': 'badge-violet',
      'Tigi Utara': 'badge-rose', 'Kelasis Tigi Utara': 'badge-rose',
      'Debey': 'badge-lime', 'Kelasis Debey': 'badge-lime'
    },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(j => {
        const matchK = !this.filterKelasis || j.kelasis === this.filterKelasis || j.kelasis === `Kelasis ${this.filterKelasis}`;
        const matchS = !this.filterStatus || j.status === this.filterStatus;
        const matchJK = !this.filterJK || j.jk === this.filterJK;
        const matchQ = !q || j.nama.toLowerCase().includes(q) || (j.gereja || '').toLowerCase().includes(q);
        return matchK && matchS && matchJK && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { id: '', nama: '', jk: 'L', lahir: '1995-01-01', gereja: '', kelasis: '', hp: '', status: 'Aktif', alamat: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { ...item };
      this.showModal = true;
    },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama jemaat wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';

      const cleanKelasis = this.form.kelasis.replace('Kelasis ', '');
      const badge = this.kelasisBadgeMap[cleanKelasis] || 'badge-blue';
      const store = Alpine.store('data');

      if (this.editMode) {
        const idx = store.jemaat.findIndex(i => i.id === this.form.id);
        if (idx > -1) {
          store.jemaat[idx] = { ...store.jemaat[idx], ...this.form, kelasis: cleanKelasis, kelasisBadge: badge };
          store.persist();
          Swal2.toast(`${this.form.nama} berhasil diperbarui`);
          store.addActLog(`Mengedit data jemaat: ${this.form.nama}`, 'UPDATE');
          Alpine.store('notif').add('Jemaat Diperbarui', `Data ${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
        }
      } else {
        const newId = 'JMT-' + String(store.jemaat.length + 1).padStart(4, '0');
        store.jemaat.unshift({ ...this.form, id: newId, kelasis: cleanKelasis, kelasisBadge: badge });
        store.persist();
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        store.addActLog(`Menambahkan jemaat baru: ${this.form.nama}`, 'CREATE');
        Alpine.store('notif').add('Jemaat Ditambahkan', `${this.form.nama} terdaftar di ${this.form.gereja || cleanKelasis}`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Jemaat?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.jemaat = store.jemaat.filter(i => i.id !== item.id);
      store.persist();
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Jemaat berhasil dihapus', 'error');
      store.addActLog(`Menghapus data jemaat: ${item.nama}`, 'DELETE');
      Alpine.store('notif').add('Jemaat Dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    },

    exportData(fmt = 'CSV') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const headers = ['ID', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Gereja', 'Kelasis', 'No. HP', 'Status', 'Alamat'];
      const rows = this.filtered.map(j => [j.id, j.nama, j.jk === 'L' ? 'Laki-laki' : 'Perempuan', j.lahir || '', j.gereja || '', j.kelasis, j.hp || '', j.status, j.alamat || '']);
      FileUtil.exportCSV('Data_Jemaat_SIMGK_Deiyai.csv', headers, rows);
      Swal2.toast('Data jemaat berhasil diexport ke CSV');
      Alpine.store('data').addActLog('Mengekspor data jemaat ke CSV', 'UPDATE');
    },

    exportWord() {
      const headers = ['No', 'ID', 'Nama Anggota', 'L/P', 'Gereja', 'Kelasis', 'Status'];
      const rows = this.filtered.map((j, idx) => [idx + 1, j.id, j.nama, j.jk === 'L' || j.jk === 'Laki-laki' ? 'L' : 'P', j.gereja || '-', j.kelasis, j.status]);
      FileUtil.exportWord('Data_Jemaat_SIMGK_Deiyai.doc', 'DATA ANGGOTA JEMAAT KOORDINATOR DEIYAI', headers, rows);
      Swal2.toast('Data jemaat berhasil diexport ke Word (.doc)');
      Alpine.store('data').addActLog('Mengekspor data jemaat ke Word', 'UPDATE');
    },

    exportPDF() {
      const headers = ['No', 'ID', 'Nama Anggota', 'L/P', 'Gereja', 'Kelasis', 'Status'];
      const rows = this.filtered.map((j, idx) => [idx + 1, j.id, j.nama, j.jk === 'L' || j.jk === 'Laki-laki' ? 'L' : 'P', j.gereja || '-', j.kelasis, j.status]);
      FileUtil.printReport('DATA ANGGOTA JEMAAT KOORDINATOR DEIYAI', headers, rows);
      Alpine.store('data').addActLog('Mencetak laporan PDF data jemaat', 'UPDATE');
    },

    async importData() {
      const { value: text } = await Swal.fire({
        title: 'Import Data Jemaat (JSON / Format)',
        input: 'textarea',
        inputLabel: 'Tempelkan data JSON jemaat:',
        inputPlaceholder: '[{"nama":"Nama Baru","jk":"L","kelasis":"Tigi","gereja":"GKE Tigi Pusat"}]',
        showCancelButton: true,
        confirmButtonText: 'Import',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#c8a020',
        background: '#0d1828', color: '#dce5f2'
      });
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const store = Alpine.store('data');
            parsed.forEach((item) => {
              const newId = 'JMT-' + String(store.jemaat.length + 1).padStart(4, '0');
              store.jemaat.unshift({
                id: newId,
                nama: item.nama || 'Jemaat Baru',
                jk: item.jk || 'L',
                lahir: item.lahir || '2000-01-01',
                gereja: item.gereja || 'Gereja Lokal',
                kelasis: item.kelasis || 'Tigi',
                kelasisBadge: 'badge-gold',
                hp: item.hp || '-',
                status: item.status || 'Aktif',
                alamat: item.alamat || '-'
              });
            });
            store.persist();
            Swal2.success('Import Berhasil', `${parsed.length} data jemaat ditambahkan.`);
            store.addActLog(`Import ${parsed.length} data jemaat baru`, 'CREATE');
          }
        } catch {
          Swal2.error('Format Invalid', 'Harap masukkan format JSON yang valid.');
        }
      }
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Kegiatan
  ════════════════════════════════════════════════════ */
  Alpine.data('kegiatanPage', () => ({
    get allItems() { return Alpine.store('data').kegiatan; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    get gerejaList() { return Alpine.store('data').gereja; },
    filterJenis: '', filterKelasis: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    jenisOptions: ['Ibadah Minggu', 'Ibadah Pemuda', 'Ibadah Wanita', 'Sekolah Minggu', 'Baptisan', 'Pernikahan', 'Dukacita', 'Seminar', 'Pelayanan Sosial'],
    jenisBadgeMap: {
      'Ibadah Minggu': 'badge-blue', 'Ibadah Pemuda': 'badge-rose', 'Ibadah Wanita': 'badge-violet',
      'Sekolah Minggu': 'badge-gold', 'Baptisan': 'badge-teal', 'Pernikahan': 'badge-lime',
      'Dukacita': 'badge-rose', 'Seminar': 'badge-violet', 'Pelayanan Sosial': 'badge-lime'
    },
    kelasisBadgeMap: {
      'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal',
      'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime'
    },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(k => {
        const matchJ = !this.filterJenis || k.jenis === this.filterJenis;
        const matchK = !this.filterKelasis || k.kelasis === this.filterKelasis || k.kelasis === `Kelasis ${this.filterKelasis}`;
        const matchQ = !q || k.nama.toLowerCase().includes(q) || (k.gereja || '').toLowerCase().includes(q);
        return matchJ && matchK && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { nama: '', jenis: 'Ibadah Minggu', gereja: '', kelasis: '', tanggal: new Date().toISOString().split('T')[0], peserta: 0, deskripsi: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { ...item };
      this.showModal = true;
    },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama kegiatan wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';

      const store = Alpine.store('data');
      const cleanKelasis = this.form.kelasis.replace('Kelasis ', '');
      const jBadge = this.jenisBadgeMap[this.form.jenis] || 'badge-blue';
      const kBadge = this.kelasisBadgeMap[cleanKelasis] || 'badge-blue';

      if (this.editMode) {
        const idx = store.kegiatan.findIndex(i => i.nama === this.form.nama && i.tanggal === this.form.tanggal);
        if (idx > -1) {
          store.kegiatan[idx] = { ...store.kegiatan[idx], ...this.form, kelasis: cleanKelasis, jenisBadge: jBadge, kelasisBadge: kBadge };
          store.persist();
          Swal2.toast(`${this.form.nama} berhasil diperbarui`);
          store.addActLog(`Mengedit kegiatan: ${this.form.nama}`, 'UPDATE');
          Alpine.store('notif').add('Kegiatan Diperbarui', `${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
        }
      } else {
        store.kegiatan.unshift({ ...this.form, kelasis: cleanKelasis, jenisBadge: jBadge, kelasisBadge: kBadge });
        store.persist();
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        store.addActLog(`Menambahkan kegiatan baru: ${this.form.nama}`, 'CREATE');
        Alpine.store('notif').add('Kegiatan Baru', `${this.form.nama} dicatat di Kelasis ${cleanKelasis}`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Kegiatan?', `"${item.nama}" akan dihapus.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.kegiatan = store.kegiatan.filter(i => i !== item);
      store.persist();
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Kegiatan berhasil dihapus', 'error');
      store.addActLog(`Menghapus kegiatan: ${item.nama}`, 'DELETE');
      Alpine.store('notif').add('Kegiatan Dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    },

    exportData(fmt = 'CSV') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const headers = ['Nama Kegiatan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Jumlah Peserta', 'Deskripsi'];
      const rows = this.filtered.map(k => [k.nama, k.jenis, k.kelasis, k.gereja || '', k.tanggal, k.peserta || 0, k.deskripsi || '']);
      FileUtil.exportCSV('Data_Kegiatan_SIMGK_Deiyai.csv', headers, rows);
      Swal2.toast('Data kegiatan berhasil diexport ke CSV');
      Alpine.store('data').addActLog('Mengekspor data kegiatan ke CSV', 'UPDATE');
    },

    exportWord() {
      const headers = ['No', 'Nama Kegiatan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Kehadiran'];
      const rows = this.filtered.map((k, idx) => [idx + 1, k.nama, k.jenis, k.kelasis, k.gereja || '-', k.tanggal, (k.peserta || 0) + ' Jiwa']);
      FileUtil.exportWord('Data_Kegiatan_SIMGK_Deiyai.doc', 'REKAPITULASI KEGIATAN IBADAH & PELAYANAN', headers, rows);
      Swal2.toast('Data kegiatan berhasil diexport ke Word (.doc)');
      Alpine.store('data').addActLog('Mengekspor data kegiatan ke Word', 'UPDATE');
    },

    exportPDF() {
      const headers = ['No', 'Nama Kegiatan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Kehadiran'];
      const rows = this.filtered.map((k, idx) => [idx + 1, k.nama, k.jenis, k.kelasis, k.gereja || '-', k.tanggal, (k.peserta || 0) + ' Jiwa']);
      FileUtil.printReport('REKAPITULASI KEGIATAN IBADAH & PELAYANAN', headers, rows);
      Alpine.store('data').addActLog('Mencetak laporan PDF kegiatan', 'UPDATE');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Laporan
  ════════════════════════════════════════════════════ */
  Alpine.data('laporanPage', () => ({
    get allItems() { return Alpine.store('data').laporan; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    filterJenis: '', filterKelasis: '', filterStatus: '',
    showModal: false, viewModal: false, viewItem: null, editMode: false,
    form: {}, formError: '',
    jenisOptions: ['Laporan Bulanan', 'Laporan Tahunan', 'Laporan Kegiatan', 'Laporan Pelayanan'],
    kelasisBadgeMap: {
      'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal',
      'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime'
    },

    get filtered() {
      return this.allItems.filter(l => {
        const matchJ = !this.filterJenis || l.jenis === this.filterJenis;
        const matchK = !this.filterKelasis || l.kelasis === this.filterKelasis || l.kelasis === `Kelasis ${this.filterKelasis}`;
        const matchS = !this.filterStatus || l.status === this.filterStatus;
        return matchJ && matchK && matchS;
      });
    },
    statusBadge(s) { return s === 'Diterima' ? 'badge-teal' : s === 'Proses' ? 'badge-amber' : 'badge-rose'; },

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { judul: '', jenis: 'Laporan Bulanan', periode: '2024-11', isi: '', kelasis: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { ...item };
      this.showModal = true;
    },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    async approve(item) {
      const res = await Swal2.confirm('Setujui Laporan?', `Setujui "${item.judul}" dari Kelasis ${item.kelasis}?`, 'question');
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      const idx = store.laporan.findIndex(i => i === item);
      if (idx > -1) {
        store.laporan[idx].status = 'Diterima';
        store.persist();
        Swal2.toast('Laporan berhasil disetujui');
        store.addActLog(`Menyetujui laporan: ${item.judul} (${item.kelasis})`, 'UPDATE');
        Alpine.store('notif').add('Laporan Disetujui', `Laporan "${item.judul}" telah disetujui`, 'update', 'var(--teal)');
      }
    },

    save() {
      if (!this.form.judul.trim()) { this.formError = 'Judul laporan wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';

      const store = Alpine.store('data');
      const cleanKelasis = this.form.kelasis.replace('Kelasis ', '');
      const kBadge = this.kelasisBadgeMap[cleanKelasis] || 'badge-blue';
      const jBadge = {
        'Laporan Bulanan': 'badge-blue',
        'Laporan Tahunan': 'badge-violet',
        'Laporan Kegiatan': 'badge-gold',
        'Laporan Pelayanan': 'badge-teal'
      }[this.form.jenis] || 'badge-blue';

      if (this.editMode) {
        const idx = store.laporan.findIndex(i => i.judul === this.form.judul && i.kelasis === this.form.kelasis);
        if (idx > -1) {
          store.laporan[idx] = { ...store.laporan[idx], ...this.form, kelasis: cleanKelasis, kelasisBadge: kBadge, jenisBadge: jBadge };
          store.persist();
          Swal2.toast('Laporan berhasil diperbarui');
          store.addActLog(`Mengedit laporan: ${this.form.judul}`, 'UPDATE');
          Alpine.store('notif').add('Laporan Diperbarui', this.form.judul, 'update', 'var(--blue2)');
        }
      } else {
        const now = new Date();
        const dateFormatted = now.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()] + ' ' + now.getFullYear();

        store.laporan.unshift({
          ...this.form,
          kelasis: cleanKelasis,
          kelasisBadge: kBadge,
          jenisBadge: jBadge,
          tglKirim: dateFormatted,
          status: 'Proses'
        });
        store.persist();
        Swal2.toast('Laporan berhasil dikirim');
        store.addActLog(`Mengirimkan laporan baru: ${this.form.judul}`, 'CREATE');
        Alpine.store('notif').add('Laporan Masuk', `${this.form.judul} dikirim oleh Kelasis ${cleanKelasis}`, 'create', 'var(--gold)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Laporan?', `"${item.judul}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.laporan = store.laporan.filter(i => i !== item);
      store.persist();
      Swal2.toast('Laporan berhasil dihapus', 'error');
      store.addActLog(`Menghapus laporan: ${item.judul}`, 'DELETE');
      Alpine.store('notif').add('Laporan Dihapus', item.judul, 'delete', 'var(--rose)');
    },

    exportData(fmt = 'CSV') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const headers = ['Judul Laporan', 'Kelasis', 'Jenis', 'Periode', 'Tanggal Kirim', 'Status', 'Isi Laporan'];
      const rows = this.filtered.map(l => [l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status, l.isi || '']);
      FileUtil.exportCSV('Data_Laporan_SIMGK_Deiyai.csv', headers, rows);
      Swal2.toast('Data laporan berhasil diexport');
      Alpine.store('data').addActLog('Mengekspor data laporan ke CSV', 'UPDATE');
    },

    exportWord() {
      const headers = ['No', 'Judul Laporan', 'Kelasis', 'Jenis', 'Periode', 'Tgl Kirim', 'Status'];
      const rows = this.filtered.map((l, idx) => [idx + 1, l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status]);
      FileUtil.exportWord('Data_Laporan_SIMGK_Deiyai.doc', 'LAPORAN PELAYANAN GEREJA KOORDINATOR DEIYAI', headers, rows);
      Swal2.toast('Data laporan berhasil diexport ke Word (.doc)');
      Alpine.store('data').addActLog('Mengekspor data laporan ke Word', 'UPDATE');
    },

    exportPDF() {
      const headers = ['No', 'Judul Laporan', 'Kelasis', 'Jenis', 'Periode', 'Tgl Kirim', 'Status'];
      const rows = this.filtered.map((l, idx) => [idx + 1, l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status]);
      FileUtil.printReport('LAPORAN PELAYANAN GEREJA KOORDINATOR DEIYAI', headers, rows);
      Alpine.store('data').addActLog('Mencetak laporan PDF pelayanan', 'UPDATE');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Statistik
  ════════════════════════════════════════════════════ */
  Alpine.data('statistikPage', () => ({
    init() {
      this.$nextTick(() => {
        if (window.initStatCharts) window.initStatCharts();
      });
    },

    get progressKelasis() {
      const kelasisList = Alpine.store('data').kelasis;
      const totalChurches = Alpine.store('data').gereja.length || 1;
      return kelasisList.map(k => {
        const count = Alpine.store('data').gereja.filter(g => g.kelasis === k.nama.replace('Kelasis ', '').trim() || g.kelasis === k.nama).length || k.gereja;
        const pct = Math.min(100, Math.round((count / totalChurches) * 100 * 2));
        return {
          label: k.nama.replace('Kelasis ', ''),
          val: count,
          pct: pct,
          color: k.color || 'var(--gold)'
        };
      });
    },

    get progressKegiatan() {
      const kegiatanList = Alpine.store('data').kegiatan;
      const counts = {};
      kegiatanList.forEach(k => { counts[k.jenis] = (counts[k.jenis] || 0) + 1; });
      const types = ['Ibadah Minggu', 'Sekolah Minggu', 'Ibadah Pemuda', 'Pelayanan Sosial', 'Seminar', 'Baptisan'];
      const colors = ['var(--gold)', 'var(--blue2)', 'var(--violet)', 'var(--teal)', 'var(--rose)', 'var(--lime)'];
      const total = kegiatanList.length || 1;

      return types.map((t, idx) => {
        const val = counts[t] || (6 - idx) * 3;
        return {
          label: t,
          val: val,
          pct: Math.min(100, Math.round((val / total) * 100 * 1.8)),
          color: colors[idx % colors.length]
        };
      });
    },

    init() {
      this.$nextTick(() => {
        if (typeof window.initStatCharts === 'function') {
          window.initStatCharts();
        }
      });
    },

    exportData(fmt = 'JSON') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const dataStore = Alpine.store('data');
      const payload = {
        statistik: dataStore.stats,
        kelasis: dataStore.kelasis,
        gereja: dataStore.gereja,
        tanggalExport: new Date().toLocaleString('id-ID')
      };
      FileUtil.exportJSON('Statistik_Lengkap_SIMGK_Deiyai.json', payload);
      Swal2.toast('Statistik lengkap diexport ke JSON');
      dataStore.addActLog('Mengekspor statistik lengkap sistem', 'UPDATE');
    },

    exportWord() {
      const dataStore = Alpine.store('data');
      const headers = ['Indikator Pelayanan', 'Jumlah / Status', 'Keterangan Wilayah'];
      const rows = [
        ['Total Kelasis Aktif', dataStore.stats.totalKelasis + ' Kelasis', 'Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey'],
        ['Total Gereja Binaan', dataStore.stats.totalGereja + ' Gereja', 'Tersebar di 6 Kelasis Deiyai'],
        ['Total Anggota Jemaat', dataStore.stats.totalJemaat.toLocaleString('id') + ' Jiwa', 'Terdata aktif dalam sistem'],
        ['Total Pelayan / Pendeta', dataStore.stats.totalPendeta + ' Pelayan', 'Pendeta & Gembala Jemaat'],
        ['Total Kegiatan Ibadah (2024)', dataStore.stats.totalKegiatan + ' Kegiatan', '9 Kategori Pelayanan'],
        ['Total Laporan Masuk', dataStore.stats.totalLaporan + ' Laporan', 'Laporan Bulanan & Evaluasi'],
      ];
      FileUtil.exportWord('Statistik_Pelayanan_SIMGK_Deiyai.doc', 'RINGKASAN STATISTIK PELAYANAN KOORDINATOR DEIYAI', headers, rows);
      Swal2.toast('Statistik berhasil diexport ke Word (.doc)');
      dataStore.addActLog('Mengekspor statistik ke Word', 'UPDATE');
    },

    exportPDF() {
      const dataStore = Alpine.store('data');
      const headers = ['Indikator Pelayanan', 'Jumlah / Status', 'Keterangan Wilayah'];
      const rows = [
        ['Total Kelasis Aktif', dataStore.stats.totalKelasis + ' Kelasis', 'Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey'],
        ['Total Gereja Binaan', dataStore.stats.totalGereja + ' Gereja', 'Tersebar di 6 Kelasis Deiyai'],
        ['Total Anggota Jemaat', dataStore.stats.totalJemaat.toLocaleString('id') + ' Jiwa', 'Terdata aktif dalam sistem'],
        ['Total Pelayan / Pendeta', dataStore.stats.totalPendeta + ' Pelayan', 'Pendeta & Gembala Jemaat'],
        ['Total Kegiatan Ibadah (2024)', dataStore.stats.totalKegiatan + ' Kegiatan', '9 Kategori Pelayanan'],
        ['Total Laporan Masuk', dataStore.stats.totalLaporan + ' Laporan', 'Laporan Bulanan & Evaluasi'],
      ];
      FileUtil.printReport('RINGKASAN STATISTIK PELAYANAN KOORDINATOR DEIYAI', headers, rows);
      dataStore.addActLog('Mencetak laporan PDF statistik', 'UPDATE');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Users
  ════════════════════════════════════════════════════ */
  Alpine.data('usersPage', () => ({
    get items() { return Alpine.store('data').users; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    get gerejaList() { return Alpine.store('data').gereja; },
    showModal: false, editMode: false, form: {}, formError: '',

    openAdd() {
      this.editMode = false; this.formError = '';
      this.form = { nama: '', email: '', password: '', role: 'Admin Kelasis', kelasis: '', status: 'Aktif' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editMode = true; this.formError = '';
      this.form = { ...item, password: '' };
      this.showModal = true;
    },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama wajib diisi.'; return; }
      if (!this.form.email.trim()) { this.formError = 'Email wajib diisi.'; return; }
      if (!this.editMode && !this.form.password) { this.formError = 'Password wajib diisi.'; return; }
      this.formError = '';

      const store = Alpine.store('data');

      if (this.editMode) {
        const idx = store.users.findIndex(i => i.email === this.form.email);
        if (idx > -1) {
          store.users[idx] = { ...store.users[idx], ...this.form };
          store.persist();
          Swal2.toast(`Akun ${this.form.nama} berhasil diperbarui`);
          store.addActLog(`Mengedit akun pengguna: ${this.form.email}`, 'UPDATE');
          Alpine.store('notif').add('User Diperbarui', `Akun ${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
        }
      } else {
        if (store.users.find(u => u.email === this.form.email)) {
          this.formError = 'Email sudah terdaftar.'; return;
        }
        store.users.push({ ...this.form });
        store.persist();
        Swal2.toast(`Akun ${this.form.nama} berhasil dibuat`);
        store.addActLog(`Membuat pengguna baru: ${this.form.email} (${this.form.role})`, 'CREATE');
        Alpine.store('notif').add('User Baru', `Akun ${this.form.nama} dibuat (${this.form.role})`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async toggleStatus(item) {
      const newStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      const res = await Swal2.confirm(`${newStatus === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} User?`, `Status ${item.nama} (${item.email}) akan diubah ke ${newStatus}.`, 'question');
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      const idx = store.users.indexOf(item);
      if (idx > -1) {
        store.users[idx].status = newStatus;
        store.persist();
        Swal2.toast(`Status ${item.nama} diubah ke ${newStatus}`);
        store.addActLog(`Mengubah status pengguna ${item.email} menjadi ${newStatus}`, 'UPDATE');
      }
    },

    async resetPwd(item) {
      const res = await Swal2.confirm('Reset Password?', `Password akun ${item.nama} akan direset ke default.`, 'info');
      if (!res.isConfirmed) return;
      Swal2.success('Password Direset', 'Password baru: simgk2024');
      Alpine.store('data').addActLog(`Reset password user: ${item.email}`, 'UPDATE');
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Akun?', `Akun "${item.nama}" (${item.email}) akan dihapus.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.users = store.users.filter(i => i !== item);
      store.persist();
      Swal2.toast('Akun berhasil dihapus', 'error');
      store.addActLog(`Menghapus akun pengguna: ${item.email}`, 'DELETE');
      Alpine.store('notif').add('User Dihapus', `Akun ${item.email} dihapus`, 'delete', 'var(--rose)');
    },

    roleBadge(r) { return r === 'Super Admin' ? 'badge badge-gold' : r === 'Admin Kelasis' ? 'badge badge-blue' : 'badge badge-violet'; },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Notifikasi
  ════════════════════════════════════════════════════ */
  Alpine.data('notifPage', () => ({
    get items() { return Alpine.store('notif').items; },
    markAll() {
      Alpine.store('notif').markAllRead();
      Swal2.toast('Semua notifikasi telah dibaca');
    },
    deleteNotif(item) {
      Alpine.store('notif').remove(item);
      Swal2.toast('Notifikasi dihapus', 'error');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Pengumuman
  ════════════════════════════════════════════════════ */
  Alpine.data('pengumumanPage', () => ({
    get items() { return Alpine.store('data').pengumuman; },
    showModal: false, editMode: false, form: {}, formError: '', editIdx: -1,

    openAdd() {
      this.editMode = false; this.formError = ''; this.editIdx = -1;
      this.form = { judul: '', body: '', tujuan: 'Semua Kelasis', prioritas: 'Normal' };
      this.showModal = true;
    },
    openEdit(item, idx) {
      this.editMode = true; this.formError = ''; this.editIdx = idx;
      this.form = { ...item };
      this.showModal = true;
    },

    save() {
      if (!this.form.judul.trim()) { this.formError = 'Judul wajib diisi.'; return; }
      if (!this.form.body.trim()) { this.formError = 'Isi pengumuman wajib diisi.'; return; }
      this.formError = '';

      const tujuanBadgeMap = {
        'Semua Kelasis': 'badge-gold', 'Seluruh Gereja': 'badge-blue', 'Admin Kelasis': 'badge-violet',
        'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal',
        'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime'
      };
      const tujuanBadge = tujuanBadgeMap[this.form.tujuan] || 'badge-gold';
      const store = Alpine.store('data');

      if (this.editMode && this.editIdx >= 0) {
        store.pengumuman[this.editIdx] = { ...store.pengumuman[this.editIdx], ...this.form, tujuanBadge };
        store.persist();
        Swal2.toast('Pengumuman berhasil diperbarui');
        store.addActLog(`Mengedit pengumuman: ${this.form.judul}`, 'UPDATE');
        Alpine.store('notif').add('Pengumuman Diperbarui', this.form.judul, 'update', 'var(--blue2)');
      } else {
        const now = new Date();
        const dateFormatted = now.getDate() + ' ' + ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][now.getMonth()] + ' ' + now.getFullYear();

        store.pengumuman.unshift({
          judul: this.form.judul,
          body: this.form.body,
          tujuan: this.form.tujuan,
          prioritas: this.form.prioritas || 'Normal',
          tujuanBadge,
          oleh: Alpine.store('auth').user?.name || 'Administrator',
          tgl: dateFormatted
        });
        store.persist();
        Swal2.toast('Pengumuman berhasil dikirim');
        store.addActLog(`Mempublikasikan pengumuman: ${this.form.judul}`, 'CREATE');
        Alpine.store('notif').add('Pengumuman Baru', this.form.judul, 'create', 'var(--gold)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Pengumuman?', `"${item.judul}" akan dihapus.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.pengumuman = store.pengumuman.filter(i => i !== item);
      store.persist();
      Swal2.toast('Pengumuman dihapus', 'error');
      store.addActLog(`Menghapus pengumuman: ${item.judul}`, 'DELETE');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Dokumen
  ════════════════════════════════════════════════════ */
  Alpine.data('dokumenPage', () => ({
    get items() { return Alpine.store('data').dokumen; },
    get kelasisList() { return Alpine.store('data').kelasis; },
    filterKelasis: '', search: '',
    showModal: false, form: {}, formError: '',

    get filtered() {
      const q = this.search.toLowerCase();
      return this.items.filter(d => {
        const matchK = !this.filterKelasis || d.kelasis === this.filterKelasis || d.kelasis === `Kelasis ${this.filterKelasis}`;
        const matchQ = !q || d.nama.toLowerCase().includes(q) || d.jenis.toLowerCase().includes(q);
        return matchK && matchQ;
      });
    },

    openUpload() {
      this.formError = '';
      this.form = { nama: '', jenis: 'SK Pelayanan', kelasis: '', ukuran: '350 KB' };
      this.showModal = true;
    },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama dokumen wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';

      const jenisBadgeMap = {
        'SK Pelayanan': 'badge-blue',
        'Laporan': 'badge-teal',
        'Notulen': 'badge-violet',
        'Dokumentasi': 'badge-gold',
        'Lainnya': 'badge-amber'
      };
      const kelasisBadgeMap = {
        'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal',
        'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime'
      };

      const store = Alpine.store('data');
      const cleanKelasis = this.form.kelasis.replace('Kelasis ', '');
      const now = new Date();
      const dateFormatted = now.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()] + ' ' + now.getFullYear();

      store.dokumen.unshift({
        ...this.form,
        kelasis: cleanKelasis,
        jenisBadge: jenisBadgeMap[this.form.jenis] || 'badge-blue',
        kelasisBadge: kelasisBadgeMap[cleanKelasis] || 'badge-blue',
        tgl: dateFormatted
      });
      store.persist();
      Swal2.toast(`${this.form.nama} berhasil diupload`);
      store.addActLog(`Upload dokumen baru: ${this.form.nama}`, 'CREATE');
      Alpine.store('notif').add('Dokumen Baru', `${this.form.nama} berhasil diunggah`, 'create', 'var(--teal)');
      this.showModal = false;
    },

    download(item) {
      FileUtil.downloadBlob(item.nama, `=== SIMGK DEIYAI DOKUMEN ARSIP ===\nJudul: ${item.nama}\nKelasis: ${item.kelasis}\nJenis: ${item.jenis}\nTanggal: ${item.tgl}\n\nDokumen ini merupakan arsip digital resmi Gereja Koordinator Deiyai, Papua Tengah.\n`, 'text/plain;charset=utf-8;');
      Swal2.toast(`Mengunduh ${item.nama}...`, 'info');
      Alpine.store('data').addActLog(`Mengunduh dokumen: ${item.nama}`, 'UPDATE');
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Dokumen?', `"${item.nama}" akan dihapus.`);
      if (!res.isConfirmed) return;
      const store = Alpine.store('data');
      store.dokumen = store.dokumen.filter(i => i !== item);
      store.persist();
      Swal2.toast('Dokumen berhasil dihapus', 'error');
      store.addActLog(`Menghapus dokumen: ${item.nama}`, 'DELETE');
      Alpine.store('notif').add('Dokumen Dihapus', item.nama, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Pengaturan
  ════════════════════════════════════════════════════ */
  Alpine.data('pengaturanPage', () => ({
    get settings() { return Alpine.store('data').settings; },
    get stats() { return Alpine.store('data').stats; },
    saved: false,

    async save() {
      Alpine.store('data').persist();
      this.saved = true;
      Swal2.toast('Pengaturan berhasil disimpan');
      Alpine.store('data').addActLog('Memperbarui konfigurasi sistem', 'UPDATE');
      Alpine.store('notif').add('Pengaturan Disimpan', 'Konfigurasi sistem diperbarui', 'update', 'var(--teal)');
      setTimeout(() => this.saved = false, 2500);
    },

    async backupNow() {
      const res = await Swal2.confirm('Backup Database?', 'Proses pencadangan seluruh data sistem akan diunduh.', 'info');
      if (!res.isConfirmed) return;

      const now = new Date();
      const timeStampStr = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID');
      Alpine.store('data').settings.lastBackup = timeStampStr;
      Alpine.store('data').persist();

      const backupObj = {
        brand: 'SIMGK Deiyai',
        version: '3.5',
        timestamp: new Date().toISOString(),
        data: {
          kelasis: Alpine.store('data').kelasis,
          gereja: Alpine.store('data').gereja,
          jemaat: Alpine.store('data').jemaat,
          kegiatan: Alpine.store('data').kegiatan,
          laporan: Alpine.store('data').laporan,
          dokumen: Alpine.store('data').dokumen,
          users: Alpine.store('data').users,
          pengumuman: Alpine.store('data').pengumuman,
          actlog: Alpine.store('data').actlog,
          settings: Alpine.store('data').settings,
        }
      };

      const dateCode = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
      FileUtil.exportJSON(`SIMGK_Backup_Deiyai_${dateCode}.json`, backupObj);
      Swal2.success('Backup Selesai', 'Database berhasil diunduh ke format JSON.');
      Alpine.store('data').addActLog('Membuat backup database sistem', 'CREATE');
      Alpine.store('notif').add('Backup Database', 'Pencadangan database berhasil dibuat', 'create', 'var(--teal)');
    },

    async restoreBackup() {
      const { value: file } = await Swal.fire({
        title: 'Restore Database',
        text: 'Pilih file backup JSON SIMGK Deiyai:',
        input: 'file',
        inputAttributes: {
          accept: '.json,application/json'
        },
        showCancelButton: true,
        confirmButtonText: 'Pulihkan Data',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dd5566',
        background: '#0d1828', color: '#dce5f2'
      });

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.data) {
              const dataStore = Alpine.store('data');
              dataStore.kelasis = parsed.data.kelasis || dataStore.kelasis;
              dataStore.gereja = parsed.data.gereja || dataStore.gereja;
              dataStore.jemaat = parsed.data.jemaat || dataStore.jemaat;
              dataStore.kegiatan = parsed.data.kegiatan || dataStore.kegiatan;
              dataStore.laporan = parsed.data.laporan || dataStore.laporan;
              dataStore.dokumen = parsed.data.dokumen || dataStore.dokumen;
              dataStore.users = parsed.data.users || dataStore.users;
              dataStore.pengumuman = parsed.data.pengumuman || dataStore.pengumuman;
              dataStore.actlog = parsed.data.actlog || dataStore.actlog;
              dataStore.settings = parsed.data.settings || dataStore.settings;
              dataStore.persist();

              Swal2.success('Restore Berhasil', 'Seluruh data sistem telah dipulihkan.');
              dataStore.addActLog('Melakukan restore database sistem', 'UPDATE');
            } else {
              Swal2.error('Format Tidak Sesuai', 'File JSON bukan berkas backup SIMGK yang valid.');
            }
          } catch {
            Swal2.error('Gagal Membaca File', 'File backup corrupt atau tidak valid.');
          }
        };
        reader.readAsText(file);
      }
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Activity Log
  ════════════════════════════════════════════════════ */
  Alpine.data('actlogPage', () => ({
    get items() { return Alpine.store('data').actlog; },
    filterType: '', search: '',
    get filtered() {
      const q = this.search.toLowerCase();
      return this.items.filter(l => {
        const matchT = !this.filterType || l.type === this.filterType;
        const matchQ = !q || l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q);
        return matchT && matchQ;
      });
    },

    async clearLog() {
      const res = await Swal2.confirm('Bersihkan Log?', 'Semua activity log akan dihapus permanen.', 'warning');
      if (!res.isConfirmed) return;
      Alpine.store('data').actlog = [];
      Alpine.store('data').persist();
      Swal2.toast('Activity log berhasil dibersihkan', 'error');
    },

    exportData(fmt = 'CSV') {
      if (fmt === 'PDF') return this.exportPDF();
      if (fmt === 'Word') return this.exportWord();
      const headers = ['Waktu', 'Pengguna', 'Aktivitas / Deskripsi', 'Tipe'];
      const rows = this.filtered.map(l => [l.time, l.user, l.action, l.type]);
      FileUtil.exportCSV('Activity_Log_SIMGK_Deiyai.csv', headers, rows);
      Swal2.toast('Activity log berhasil diexport');
    },

    exportWord() {
      const headers = ['No', 'Waktu', 'Pengguna', 'Aktivitas', 'Tipe'];
      const rows = this.filtered.map((l, idx) => [idx + 1, l.time, l.user, l.action, l.type]);
      FileUtil.exportWord('Activity_Log_SIMGK_Deiyai.doc', 'ACTIVITY LOG', headers, rows);
    },

    exportPDF() {
      const headers = ['No', 'Waktu', 'Pengguna', 'Aktivitas', 'Tipe'];
      const rows = this.filtered.map((l, idx) => [idx + 1, l.time, l.user, l.action, l.type]);
      FileUtil.printReport('ACTIVITY LOG', headers, rows);
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Export (Upgraded v3.5 with PDF & Filter)
  ════════════════════════════════════════════════════ */
  Alpine.data('exportPage', () => ({
    filterKelasis: 'all',
    includeStats: true,
    currentTitle: '',
    printModal: false,
    printReport: {
      title: '',
      docNo: '',
      kelasis: '',
      date: '',
      headers: [],
      rows: [],
      total: 0
    },

    get stats() { return Alpine.store('data').stats; },
    get kelasisList() {
      return (Alpine.store('data').kelasis || []).map(k => k.nama.replace('Kelasis ', '').trim());
    },

    getChartVisualRows() {
      try {
        const store = Alpine.store('data');
        if (store && typeof store.getChartVisualRows === 'function') {
          return store.getChartVisualRows();
        }
      } catch (e) { }
      return [];
    },

    getStatsRows() {
      try {
        const store = Alpine.store('data');
        if (store && typeof store.getStatsRows === 'function') {
          return store.getStatsRows(this.filterKelasis);
        }
      } catch (e) { }

      const dataStore = Alpine.store('data') || {};
      const kFilter = this.filterKelasis;
      const gerejaList = (dataStore.gereja || []).filter(g => kFilter === 'all' || g.kelasis === kFilter || g.kelasis === 'Kelasis ' + kFilter);
      const jemaatList = (dataStore.jemaat || []).filter(j => kFilter === 'all' || j.kelasis === kFilter || j.kelasis === 'Kelasis ' + kFilter);
      const kegiatanList = (dataStore.kegiatan || []).filter(k => kFilter === 'all' || k.kelasis === kFilter || k.kelasis === 'Kelasis ' + kFilter);
      const laporanList = (dataStore.laporan || []).filter(l => kFilter === 'all' || l.kelasis === kFilter || l.kelasis === 'Kelasis ' + kFilter);

      const totalJiwa = gerejaList.reduce((acc, g) => acc + (Number(g.jemaat) || 0), 0) || (jemaatList.length > 0 ? jemaatList.length : 3847);
      const totalPria = jemaatList.filter(j => j.jk === 'L' || j.jk === 'Laki-laki').length || Math.round(totalJiwa * 0.52);
      const totalWanita = jemaatList.filter(j => j.jk === 'P' || j.jk === 'Perempuan').length || Math.round(totalJiwa * 0.48);
      const avgJemaat = gerejaList.length > 0 ? Math.round(totalJiwa / gerejaList.length) : 0;

      return [
        ['Total Wilayah Kelasis', kFilter === 'all' ? (dataStore.kelasis || []).length + ' Kelasis' : '1 Kelasis (' + kFilter + ')', 'Cakupan Wilayah Terpilih'],
        ['Total Gereja Binaan', gerejaList.length + ' Gereja', 'Tersebar di wilayah terpilih'],
        ['Total Anggota Jemaat', totalJiwa.toLocaleString('id') + ' Jiwa', 'Terdaftar aktif dalam sistem'],
        ['Demografi Gender', totalPria.toLocaleString('id') + ' Pria / ' + totalWanita.toLocaleString('id') + ' Wanita', 'Rasio jemaat laki-laki & perempuan'],
        ['Rata-rata Jemaat / Gereja', avgJemaat + ' Jiwa / Gereja', 'Rerata kapasitas per gedung gereja'],
        ['Total Agenda Kegiatan', kegiatanList.length + ' Kegiatan', 'Ibadah & pembinaan terlaksana'],
        ['Laporan Pelayanan', laporanList.length + ' Berkas', 'Laporan masuk & evaluasi'],
      ];
    },

    get exports() {
      return [
        { id: 'gereja', icon: '⛪', title: 'Data Gereja', desc: `${this.stats.totalGereja} gereja terdaftar`, color: 'var(--blue2)', formats: ['PDF', 'Word', 'Excel', 'CSV', 'JSON'] },
        { id: 'jemaat', icon: '👥', title: 'Data Jemaat', desc: `${this.stats.totalJemaat.toLocaleString('id')} jiwa terdaftar`, color: 'var(--teal)', formats: ['PDF', 'Word', 'Excel', 'CSV', 'JSON'] },
        { id: 'kegiatan', icon: '📅', title: 'Data Kegiatan', desc: `${this.stats.totalKegiatan} kegiatan ibadah`, color: 'var(--rose)', formats: ['PDF', 'Word', 'Excel', 'CSV', 'JSON'] },
        { id: 'laporan', icon: '📋', title: 'Laporan Pelayanan', desc: `${this.stats.totalLaporan} berkas laporan masuk`, color: 'var(--lime)', formats: ['PDF', 'Word', 'Excel', 'CSV', 'JSON'] },
        { id: 'kelasis', icon: '🏛️', title: 'Data Kelasis', desc: `${this.stats.totalKelasis} kelasis wilayah aktif`, color: 'var(--gold)', formats: ['PDF', 'Word', 'Excel', 'CSV', 'JSON'] },
        { id: 'statistik', icon: '📊', title: 'Statistik Pelayanan', desc: 'Ringkasan analitik seluruh wilayah', color: 'var(--violet)', formats: ['PDF', 'Word', 'JSON'] },
      ];
    },

    getFilteredData(type) {
      const dataStore = Alpine.store('data');
      const kFilter = this.filterKelasis;
      const t = (type || '').toLowerCase();

      if (t.includes('gereja')) {
        return (dataStore.gereja || []).filter(g => kFilter === 'all' || g.kelasis === kFilter || g.kelasis === 'Kelasis ' + kFilter);
      } else if (t.includes('jemaat')) {
        return (dataStore.jemaat || []).filter(j => kFilter === 'all' || j.kelasis === kFilter || j.kelasis === 'Kelasis ' + kFilter);
      } else if (t.includes('kegiatan')) {
        return (dataStore.kegiatan || []).filter(k => kFilter === 'all' || k.kelasis === kFilter || k.kelasis === 'Kelasis ' + kFilter);
      } else if (t.includes('laporan')) {
        return (dataStore.laporan || []).filter(l => kFilter === 'all' || l.kelasis === kFilter || l.kelasis === 'Kelasis ' + kFilter);
      } else if (t.includes('kelasis')) {
        return (dataStore.kelasis || []).filter(k => kFilter === 'all' || k.nama.includes(kFilter));
      }
      return [];
    },

    openPDFPreview(title) {
      this.currentTitle = title;
      const dataStore = Alpine.store('data');
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const docCode = 'SIMGK/DOC-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + '/' + Math.floor(1000 + Math.random() * 9000);
      const kText = this.filterKelasis === 'all' ? 'Seluruh Wilayah (6 Kelasis Deiyai)' : 'Kelasis ' + this.filterKelasis;
      const t = (title || '').toLowerCase();

      let headers = [];
      let rows = [];

      if (t.includes('gereja')) {
        headers = ['No', 'Nama Gereja', 'Kelasis', 'Gembala Jemaat', 'Tahun', 'Jemaat', 'Status'];
        const list = this.getFilteredData(title);
        rows = list.map((g, idx) => [idx + 1, g.nama, g.kelasis, g.gembala || '-', g.tahun || '-', (g.jemaat || 0).toLocaleString('id'), g.status]);
      } else if (t.includes('jemaat')) {
        headers = ['No', 'ID', 'Nama Anggota', 'L/P', 'Gereja Jemaat', 'Kelasis', 'Status'];
        const list = this.getFilteredData(title);
        rows = list.map((j, idx) => [idx + 1, j.id, j.nama, j.jk === 'Laki-laki' || j.jk === 'L' ? 'L' : 'P', j.gereja || '-', j.kelasis, j.status]);
      } else if (t.includes('kegiatan')) {
        headers = ['No', 'Nama Acara Pelayanan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Kehadiran'];
        const list = this.getFilteredData(title);
        rows = list.map((k, idx) => [idx + 1, k.nama, k.jenis, k.kelasis, k.gereja || '-', k.tanggal, (k.peserta || 0) + ' Jiwa']);
      } else if (t.includes('laporan')) {
        headers = ['No', 'Judul Laporan', 'Kelasis', 'Jenis', 'Periode', 'Tgl Kirim', 'Status'];
        const list = this.getFilteredData(title);
        rows = list.map((l, idx) => [idx + 1, l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status]);
      } else if (t.includes('kelasis')) {
        headers = ['No', 'ID', 'Nama Kelasis', 'Ketua Kelasis', 'Gereja', 'Total Jemaat', 'Pendeta'];
        const list = this.getFilteredData(title);
        rows = list.map((k, idx) => [idx + 1, k.id, k.nama, k.ketua, k.gereja + ' Gereja', (k.jemaat || 0).toLocaleString('id') + ' Jiwa', k.pendeta + ' Orang']);
      } else {
        headers = ['Indikator Pelayanan', 'Jumlah / Status', 'Keterangan Wilayah'];
        rows = [
          ['Total Kelasis Aktif', dataStore.stats.totalKelasis + ' Kelasis', 'Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey'],
          ['Total Gereja Binaan', dataStore.stats.totalGereja + ' Gereja', 'Tersebar di 6 Kelasis Deiyai'],
          ['Total Anggota Jemaat', dataStore.stats.totalJemaat.toLocaleString('id') + ' Jiwa', 'Terdata aktif dalam sistem'],
          ['Total Pelayan / Pendeta', dataStore.stats.totalPendeta + ' Pelayan', 'Pendeta & Gembala Jemaat'],
          ['Total Kegiatan Ibadah (2024)', dataStore.stats.totalKegiatan + ' Kegiatan', '9 Kategori Pelayanan'],
          ['Total Laporan Masuk', dataStore.stats.totalLaporan + ' Laporan', 'Laporan Bulanan & Evaluasi'],
        ];
      }

      this.printReport = {
        title: title.toUpperCase(),
        docNo: docCode,
        kelasis: kText,
        date: dateStr,
        headers: headers,
        rows: rows,
        total: rows.length
      };

      this.printModal = true;
    },

    printNow() {
      Swal2.toast('Menyiapkan cetak PDF...', 'info');
      const rep = document.getElementById('printableReport');
      if (rep) {
        FileUtil.printHTML(rep.innerHTML);
      } else {
        window.print();
      }
    },

    async doExport(title, fmt) {
      if (fmt === 'PDF') {
        this.openPDFPreview(title);
        return;
      }

      const dataStore = Alpine.store('data');
      const list = this.getFilteredData(title);
      const kSuffix = this.filterKelasis === 'all' ? '' : '_' + this.filterKelasis.replace(/\s+/g, '_');
      const kText = this.filterKelasis === 'all' ? 'Seluruh Wilayah (6 Kelasis Deiyai)' : 'Kelasis ' + this.filterKelasis;
      const t = (title || '').toLowerCase();
      const meta = { kelasis: kText, statsRows: this.includeStats ? this.getStatsRows() : [], chartRows: this.includeStats ? this.getChartVisualRows() : [] };

      if (fmt === 'Word') {
        const pTitle = `${title.toUpperCase()} KOORDINATOR DEIYAI`;

        if (t.includes('gereja')) {
          const headers = ['No', 'ID', 'Nama Gereja', 'Kelasis', 'Gembala Jemaat', 'Tahun', 'Jemaat', 'Status', 'Alamat'];
          const rows = list.map((g, idx) => [idx + 1, g.id, g.nama, g.kelasis, g.gembala || '-', g.tahun || '-', (g.jemaat || 0).toLocaleString('id') + ' Jiwa', g.status, g.alamat || '-']);
          FileUtil.exportWord(`Data_Gereja${kSuffix}.doc`, pTitle, headers, rows, meta);
        } else if (t.includes('jemaat')) {
          const headers = ['No', 'ID', 'Nama Anggota', 'L/P', 'Gereja', 'Kelasis', 'HP', 'Status'];
          const rows = list.map((j, idx) => [idx + 1, j.id, j.nama, j.jk === 'Laki-laki' || j.jk === 'L' ? 'L' : 'P', j.gereja || '-', j.kelasis, j.hp || '-', j.status]);
          FileUtil.exportWord(`Data_Jemaat${kSuffix}.doc`, pTitle, headers, rows, meta);
        } else if (t.includes('kegiatan')) {
          const headers = ['No', 'Nama Kegiatan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Kehadiran'];
          const rows = list.map((k, idx) => [idx + 1, k.nama, k.jenis, k.kelasis, k.gereja || '-', k.tanggal, (k.peserta || 0) + ' Jiwa']);
          FileUtil.exportWord(`Data_Kegiatan${kSuffix}.doc`, pTitle, headers, rows, meta);
        } else if (t.includes('laporan')) {
          const headers = ['No', 'Judul Laporan', 'Kelasis', 'Jenis', 'Periode', 'Tgl Kirim', 'Status'];
          const rows = list.map((l, idx) => [idx + 1, l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status]);
          FileUtil.exportWord(`Laporan_Pelayanan${kSuffix}.doc`, pTitle, headers, rows, meta);
        } else if (t.includes('kelasis')) {
          const headers = ['No', 'ID', 'Nama Kelasis', 'Ketua', 'Kontak', 'Gereja', 'Jemaat', 'Pendeta'];
          const rows = list.map((k, idx) => [idx + 1, k.id, k.nama, k.ketua, k.kontak || '-', k.gereja, (k.jemaat || 0).toLocaleString('id'), k.pendeta]);
          FileUtil.exportWord(`Data_Kelasis${kSuffix}.doc`, pTitle, headers, rows, meta);
        } else {
          const headers = ['Indikator Pelayanan', 'Jumlah / Status', 'Keterangan Wilayah'];
          const rows = [
            ['Total Kelasis Aktif', dataStore.stats.totalKelasis + ' Kelasis', 'Tigi, Tigi Barat, Yatamo, Wagamo, Tigi Utara, Debey'],
            ['Total Gereja Binaan', dataStore.stats.totalGereja + ' Gereja', 'Tersebar di 6 Kelasis Deiyai'],
            ['Total Anggota Jemaat', dataStore.stats.totalJemaat.toLocaleString('id') + ' Jiwa', 'Terdata aktif dalam sistem'],
            ['Total Pelayan / Pendeta', dataStore.stats.totalPendeta + ' Pelayan', 'Pendeta & Gembala Jemaat'],
            ['Total Kegiatan Ibadah (2024)', dataStore.stats.totalKegiatan + ' Kegiatan', '9 Kategori Pelayanan'],
            ['Total Laporan Masuk', dataStore.stats.totalLaporan + ' Laporan', 'Laporan Bulanan & Evaluasi'],
          ];
          FileUtil.exportWord(`Statistik_Pelayanan${kSuffix}.doc`, pTitle, headers, rows, meta);
        }
        Swal2.toast(`${title} (Word .doc) berhasil diunduh`);
        dataStore.addActLog(`Export ${title} format Word (${this.filterKelasis})`, 'UPDATE');
        Alpine.store('notif').add('Export Word', `${title} format Word (.doc) berhasil diunduh`, 'update', 'var(--blue2)');
        return;
      }

      if (t.includes('gereja')) {
        const headers = ['ID', 'Nama Gereja', 'Kelasis', 'Gembala', 'Tahun', 'Jemaat', 'Status', 'Alamat'];
        const rows = list.map(g => [g.id, g.nama, g.kelasis, g.gembala || '', g.tahun || '', g.jemaat || 0, g.status, g.alamat || '']);
        if (fmt === 'JSON') FileUtil.exportJSON(`Data_Gereja${kSuffix}.json`, list);
        else FileUtil.exportCSV(`Data_Gereja${kSuffix}.csv`, headers, rows);
      } else if (t.includes('jemaat')) {
        const headers = ['ID', 'Nama', 'JK', 'Tgl Lahir', 'Gereja', 'Kelasis', 'HP', 'Status'];
        const rows = list.map(j => [j.id, j.nama, j.jk, j.lahir || '', j.gereja || '', j.kelasis, j.hp || '', j.status]);
        if (fmt === 'JSON') FileUtil.exportJSON(`Data_Jemaat${kSuffix}.json`, list);
        else FileUtil.exportCSV(`Data_Jemaat${kSuffix}.csv`, headers, rows);
      } else if (t.includes('kegiatan')) {
        const headers = ['Nama Kegiatan', 'Jenis', 'Kelasis', 'Gereja', 'Tanggal', 'Peserta'];
        const rows = list.map(k => [k.nama, k.jenis, k.kelasis, k.gereja || '', k.tanggal, k.peserta || 0]);
        if (fmt === 'JSON') FileUtil.exportJSON(`Data_Kegiatan${kSuffix}.json`, list);
        else FileUtil.exportCSV(`Data_Kegiatan${kSuffix}.csv`, headers, rows);
      } else if (t.includes('laporan')) {
        const headers = ['Judul', 'Kelasis', 'Jenis', 'Periode', 'Tgl Kirim', 'Status'];
        const rows = list.map(l => [l.judul, l.kelasis, l.jenis, l.periode, l.tglKirim, l.status]);
        if (fmt === 'JSON') FileUtil.exportJSON(`Laporan_Pelayanan${kSuffix}.json`, list);
        else FileUtil.exportCSV(`Laporan_Pelayanan${kSuffix}.csv`, headers, rows);
      } else if (t.includes('kelasis')) {
        const headers = ['ID', 'Nama Kelasis', 'Ketua', 'Kontak', 'Alamat', 'Gereja', 'Jemaat', 'Pendeta'];
        const rows = list.map(k => [k.id, k.nama, k.ketua, k.kontak || '', k.alamat || '', k.gereja, k.jemaat, k.pendeta]);
        if (fmt === 'JSON') FileUtil.exportJSON(`Data_Kelasis${kSuffix}.json`, list);
        else FileUtil.exportCSV(`Data_Kelasis${kSuffix}.csv`, headers, rows);
      } else {
        FileUtil.exportJSON('Statistik_Lengkap_SIMGK_Deiyai.json', { stats: dataStore.stats, exportedAt: new Date().toISOString() });
      }

      Swal2.toast(`${title} (${fmt}) berhasil diunduh`);
      dataStore.addActLog(`Export ${title} format ${fmt} (${this.filterKelasis})`, 'UPDATE');
      Alpine.store('notif').add('Export Data', `${title} format ${fmt} berhasil diunduh`, 'update', 'var(--blue2)');
    },
  }));

});