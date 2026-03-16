/**
 * ============================================================
 * SIMGK DEIYAI — Shared Layout Builder v8.0 — FINAL
 * ============================================================
 *
 * DIAGNOSIS LENGKAP — semua versi sebelumnya gagal karena:
 *
 * v4-v6: buildLayout() menulis innerHTML ke .app-layout
 *   → Menghapus dan membuat ulang node main.page-content
 *   → Alpine kehilangan binding pada x-for, x-text, :class
 *     di dalam page-content → ReferenceError: l/n is not defined
 *   → MutationObserver Alpine terus re-evaluate expression
 *     pada node baru yang tidak punya scope valid
 *
 * v7: mencoba innerHTML + simpan pageContent string
 *   → Masalah sama: innerHTML string dari node yang sudah
 *     di-mount Alpine tidak menyimpan Alpine state/binding
 *   → Node baru hasil innerHTML tidak punya scope Alpine
 *
 * SOLUSI v8 — DOM SURGERY: createElement + insertBefore
 * ─────────────────────────────────────────────────────
 * 1. JANGAN sentuh .main-area atau main.page-content sama sekali
 * 2. Buat <aside> baru via createElement → insertBefore .main-area
 * 3. Buat <header> baru via createElement → insertBefore main.page-content
 * 4. Gunakan element.innerHTML hanya untuk elemen BARU yang belum
 *    pernah di-mount Alpine → tidak ada binding yang rusak
 *
 * Hasilnya:
 *   .app-layout
 *     ├── <aside>  ← BARU, diinsert sebelum .main-area
 *     └── .main-area  ← TIDAK DISENTUH
 *          ├── <header>  ← BARU, diinsert sebelum page-content
 *          └── main.page-content  ← TIDAK DISENTUH, Alpine OK
 */

var MENU_ACCESS = {
  'Super Admin': ['dashboard', 'statistik', 'notifikasi', 'pengumuman', 'kelasis', 'gereja', 'jemaat', 'kegiatan', 'laporan', 'dokumen', 'export', 'users', 'actlog', 'pengaturan'],
  'Admin Kelasis': ['dashboard', 'statistik', 'notifikasi', 'pengumuman', 'kelasis', 'gereja', 'jemaat', 'kegiatan', 'laporan', 'dokumen', 'export'],
  'Operator Gereja': ['dashboard', 'notifikasi', 'pengumuman', 'gereja', 'jemaat', 'kegiatan', 'dokumen'],
};

var NAV_SECTIONS = [
  {
    section: 'Utama', items: [
      { id: 'dashboard', icon: '&#128202;', label: 'Dashboard', href: 'dashboard.html' },
      { id: 'statistik', icon: '&#128200;', label: 'Statistik', href: 'statistik.html' },
      { id: 'notifikasi', icon: '&#128276;', label: 'Notifikasi', href: 'notifikasi.html', badge: true },
      { id: 'pengumuman', icon: '&#128226;', label: 'Pengumuman', href: 'pengumuman.html' },
    ]
  },
  {
    section: 'Manajemen', items: [
      { id: 'kelasis', icon: '&#127963;', label: 'Kelasis', href: 'kelasis.html' },
      { id: 'gereja', icon: '&#9962;', label: 'Gereja', href: 'gereja.html' },
      { id: 'jemaat', icon: '&#128101;', label: 'Jemaat', href: 'jemaat.html' },
      { id: 'kegiatan', icon: '&#128197;', label: 'Kegiatan', href: 'kegiatan.html' },
    ]
  },
  {
    section: 'Laporan', items: [
      { id: 'laporan', icon: '&#128203;', label: 'Laporan Pelayanan', href: 'laporan.html' },
      { id: 'dokumen', icon: '&#128193;', label: 'Dokumen', href: 'dokumen.html' },
      { id: 'export', icon: '&#11015;', label: 'Export Data', href: 'export.html' },
    ]
  },
  {
    section: 'Sistem', items: [
      { id: 'users', icon: '&#128100;', label: 'Pengguna', href: 'users.html' },
      { id: 'actlog', icon: '&#128220;', label: 'Activity Log', href: 'actlog.html' },
      { id: 'pengaturan', icon: '&#9881;', label: 'Pengaturan', href: 'pengaturan.html' },
    ]
  },
];

function getCurrentRole() {
  try {
    var u = JSON.parse(localStorage.getItem('simgk_user') || 'null');
    return u ? (u.role || null) : null;
  } catch (e) { return null; }
}

function _getUser() {
  try { return JSON.parse(localStorage.getItem('simgk_user') || 'null'); }
  catch (e) { return null; }
}

function _doLogout() {
  localStorage.removeItem('simgk_user');
  var inPages = window.location.pathname.indexOf('/pages/') >= 0;
  window.location.href = inPages ? '../index.html' : 'index.html';
}

function _checkResponsive() {
  var btn = document.getElementById('simgk-menu-btn');
  if (btn) btn.style.display = window.innerWidth <= 900 ? 'flex' : 'none';
}
window.addEventListener('resize', _checkResponsive);

/* ── Buat elemen <aside> sidebar via DOM API ── */
function _createSidebar(activePage, role, user) {
  var allowed = MENU_ACCESS[role] || [];
  var initials = 'SA';
  var userName = '—';
  var userRole = '—';

  if (user) {
    userName = user.name || '—';
    userRole = user.role || '—';
    if (user.initials) {
      initials = user.initials;
    } else if (user.name) {
      initials = user.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }
  }

  /* Bangun nav HTML */
  var navHTML = '';
  NAV_SECTIONS.forEach(function (sec) {
    var items = sec.items.filter(function (i) { return allowed.indexOf(i.id) >= 0; });
    if (!items.length) return;
    navHTML += '<div class="nav-section"><span class="nav-label">' + sec.section + '</span>';
    items.forEach(function (item) {
      var cls = item.id === activePage ? ' active' : '';
      var badge = item.badge
        ? '<span id="simgk-notif-badge" class="nav-badge" style="display:none">0</span>'
        : '';
      navHTML += '<a href="' + item.href + '" class="nav-item' + cls + '">'
        + '<span class="nav-icon">' + item.icon + '</span>'
        + item.label + badge + '</a>';
    });
    navHTML += '</div>';
  });

  /* Buat elemen dengan createElement — BUKAN innerHTML pada node Alpine */
  var aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.id = 'simgk-sidebar';

  aside.innerHTML =
    '<a href="dashboard.html" class="sidebar-logo">'
    + '<div class="logo-mark">&#9962;</div>'
    + '<div class="logo-text"><h1>Sistem Monitoring </h1><p>Koordinator Deiyai - Papua Tengah</p></div>'
    + '</a>'
    + '<nav class="sidebar-nav">' + navHTML + '</nav>'
    + '<div class="sidebar-footer">'
    + '<div class="sidebar-user">'
    + '<div class="user-avatar">' + initials + '</div>'
    + '<div>'
    + '<div class="user-name">' + userName + '</div>'
    + '<div class="user-role">' + userRole + '</div>'
    + '</div>'
    + '<button class="logout-btn" id="simgk-logout-sidebar" title="Logout">&#128682;</button>'
    + '</div></div>';

  return aside;
}

/* ── Buat elemen <header> topbar via DOM API ── */
function _createTopbar(pageTitle, crumb) {
  var header = document.createElement('header');
  header.className = 'topbar';
  header.id = 'simgk-topbar';

  header.innerHTML =
    '<div class="topbar-left">'
    + '<button class="topbar-btn" id="simgk-menu-btn" style="display:none" title="Menu">&#9776;</button>'
    + '<div>'
    + '<div class="topbar-page-title">' + pageTitle + '</div>'
    + '<div class="topbar-breadcrumb"><span>Sistem Monitoring Koordinator Deiyai</span><span>&rsaquo;</span><span>' + crumb + '</span></div>'
    + '</div></div>'
    + '<div class="topbar-right">'
    + '<div class="topbar-search">'
    + '<span class="s-icon">&#128269;</span>'
    + '<input type="text" placeholder="Cari data...">'
    + '</div>'
    + '<a href="notifikasi.html" class="topbar-btn" style="position:relative">'
    + '&#128276;'
    + '<span id="simgk-notif-dot" class="notif-dot" style="display:none"></span>'
    + '</a>'
    + '<button class="topbar-btn" id="simgk-logout-topbar" title="Logout">&#128682;</button>'
    + '</div>';

  return header;
}

/* ── Event listeners: logout + hamburger ── */
function _bindEvents() {
  function logout() {
    if (window.Swal) {
      Swal.fire({
        title: 'Keluar dari Sistem?',
        text: 'Anda akan logout dari SIMGK Deiyai.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#c8a020',
        cancelButtonColor: '#1a2438',
        background: '#0d1828',
        color: '#dce5f2'
      }).then(function (r) { if (r.isConfirmed) _doLogout(); });
    } else {
      if (confirm('Yakin logout?')) _doLogout();
    }
  }

  var logoutBtns = [
    document.getElementById('simgk-logout-sidebar'),
    document.getElementById('simgk-logout-topbar'),
  ];
  logoutBtns.forEach(function (btn) { if (btn) btn.addEventListener('click', logout); });

  /* Hamburger */
  var menuBtn = document.getElementById('simgk-menu-btn');
  var sidebar = document.getElementById('simgk-sidebar');
  var overlay = document.getElementById('simgk-overlay');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }
  if (overlay && sidebar) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

/* ── Sinkronisasi notif badge setelah Alpine siap ── */
function _syncNotifBadge() {
  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    if (attempts > 40) { clearInterval(timer); return; }
    try {
      if (!window.Alpine) return;
      var store = Alpine.store('notif');
      if (!store) return;
      clearInterval(timer);

      function update() {
        var count = store.items ? store.items.filter(function (n) { return !n.read; }).length : 0;
        var badge = document.getElementById('simgk-notif-badge');
        var dot = document.getElementById('simgk-notif-dot');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? '' : 'none'; }
        if (dot) { dot.style.display = count > 0 ? '' : 'none'; }
      }

      update();
      Alpine.effect(function () {
        if (store.items) { var _ = store.items.length; }
        update();
      });
    } catch (e) { }
  }, 300);
}

/* ══════════════════════════════════════════════════════════
   buildLayout(activePage, pageTitle, pageCrumb?)
   ── FUNGSI PUBLIK ──

   KUNCI: createElement + insertBefore
   → <aside> dan <header> adalah elemen BARU
   → .main-area dan main.page-content TIDAK DISENTUH
   → Alpine binding pada page-content tetap valid 100%
   → Tidak ada innerHTML overwrite pada node Alpine
══════════════════════════════════════════════════════════ */
function buildLayout(activePage, pageTitle, pageCrumb) {
  var role = getCurrentRole();
  if (!role) {
    var inPages = window.location.pathname.indexOf('/pages/') >= 0;
    window.location.href = inPages ? '../index.html' : 'index.html';
    return;
  }

  var user = _getUser();
  var crumb = pageCrumb || pageTitle;

  /* Cari .app-layout */
  var appLayout = document.querySelector('.app-layout');
  if (!appLayout) { console.warn('[SIMGK] .app-layout tidak ditemukan'); return; }

  /* Cari .main-area */
  var mainArea = appLayout.querySelector('.main-area');
  if (!mainArea) { console.warn('[SIMGK] .main-area tidak ditemukan'); return; }

  /* Cari main.page-content di dalam .main-area */
  var pageContent = mainArea.querySelector('.page-content');

  /* ── 1. Insert <aside> sebelum .main-area ── */
  /* Hapus sidebar lama jika sudah ada (prevent double-inject) */
  var oldSidebar = document.getElementById('simgk-sidebar');
  if (oldSidebar) oldSidebar.remove();

  var sidebar = _createSidebar(activePage, role, user);
  appLayout.insertBefore(sidebar, mainArea);
  /* appLayout sekarang: <aside> | .main-area */

  /* ── 2. Insert <header> sebelum .page-content ── */
  /* Hapus topbar lama jika sudah ada */
  var oldTopbar = document.getElementById('simgk-topbar');
  if (oldTopbar) oldTopbar.remove();

  var topbar = _createTopbar(pageTitle, crumb);
  if (pageContent) {
    mainArea.insertBefore(topbar, pageContent);
  } else {
    mainArea.insertAdjacentElement('afterbegin', topbar);
  }
  /* mainArea sekarang: <header> | main.page-content */

  /* ── 3. Bind events dan responsive ── */
  _bindEvents();
  _checkResponsive();

  /* ── 4. Sync notif badge ── */
  _syncNotifBadge();
}