/**
 * ============================================================
 * SIMGK DEIYAI — Alpine.js Application Logic
 * v3.0 — Full CRUD + Demo Accounts + Role-Based Access
 * ============================================================
 */

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
      timer: 2000, timerProgressBar: true, showConfirmButton: false,
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
      iconColor: icon === 'success' ? '#16b89a' : icon === 'error' ? '#dd5566' : '#c8a020',
    });
  }
};

document.addEventListener('alpine:init', () => {

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
    },

    logout() {
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('simgk_user');
      const inPages = window.location.pathname.includes('/pages/');
      window.location.href = inPages ? '../login.html' : 'login.html';
    },

    restore() {
      const saved = localStorage.getItem('simgk_user');
      if (saved) {
        try { this.user = JSON.parse(saved); this.isLoggedIn = true; return true; }
        catch { return false; }
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
    items: [
      { id: 1, type: 'laporan', color: 'var(--teal)', title: 'Laporan baru dari Kelasis Tigi', body: 'Laporan bulanan November 2024 telah dikirim dan menunggu verifikasi', time: '2j lalu', read: false },
      { id: 2, type: 'kegiatan', color: 'var(--gold)', title: 'Kegiatan baru ditambahkan', body: 'Ibadah Minggu — GKI Tigi Barat telah dicatat oleh Admin Kelasis', time: '4j lalu', read: false },
      { id: 3, type: 'gereja', color: 'var(--blue2)', title: 'Data gereja diperbarui', body: 'GKE Wagamo — Jumlah jemaat diperbarui dari 110 menjadi 115', time: '1h lalu', read: false },
      { id: 4, type: 'user', color: 'var(--violet)', title: 'User baru terdaftar', body: 'Operator Gereja Yatamo bergabung ke sistem', time: '1h lalu', read: false },
      { id: 5, type: 'warning', color: 'var(--rose)', title: 'Laporan belum masuk', body: 'Kelasis Debey belum mengirimkan laporan Oktober 2024', time: '2h lalu', read: true },
    ],
    get unread() { return this.items.filter(n => !n.read).length; },
    markAllRead() { this.items.forEach(n => n.read = true); },
    add(title, body, type = 'info', color = 'var(--gold)') {
      this.items.unshift({ id: Date.now(), type, color, title, body, time: 'Baru saja', read: false });
    }
  });

  /* ════════════════════════════════════════════════════
     STORE: Data (mock datasets)
  ════════════════════════════════════════════════════ */
  Alpine.store('data', {
    kelasis: [
      { id: 'KLS-001', nama: 'Kelasis Tigi', ketua: 'Pnt. Yohanes Gobai', kontak: '+62 812-3456-7890', alamat: 'Distrik Tigi, Deiyai, Papua', gereja: 9, jemaat: 724, pendeta: 11, color: 'var(--gold)', badge: 'badge-gold' },
      { id: 'KLS-002', nama: 'Kelasis Tigi Barat', ketua: 'Pnt. Andreas Mote', kontak: '+62 813-2345-6789', alamat: 'Tigi Barat, Deiyai, Papua', gereja: 8, jemaat: 612, pendeta: 9, color: 'var(--blue2)', badge: 'badge-blue' },
      { id: 'KLS-003', nama: 'Kelasis Yatamo', ketua: 'Pnt. Martinus Pigai', kontak: '+62 821-3456-7890', alamat: 'Yatamo, Deiyai, Papua', gereja: 7, jemaat: 543, pendeta: 8, color: 'var(--teal)', badge: 'badge-teal' },
      { id: 'KLS-004', nama: 'Kelasis Wagamo', ketua: 'Pnt. Samuel Dimi', kontak: '+62 822-4567-8901', alamat: 'Wagamo, Deiyai, Papua', gereja: 8, jemaat: 684, pendeta: 9, color: 'var(--violet)', badge: 'badge-violet' },
      { id: 'KLS-005', nama: 'Kelasis Tigi Utara', ketua: 'Pnt. Daniel Pakage', kontak: '+62 823-5678-9012', alamat: 'Tigi Utara, Deiyai, Papua', gereja: 9, jemaat: 701, pendeta: 10, color: 'var(--rose)', badge: 'badge-rose' },
      { id: 'KLS-006', nama: 'Kelasis Debey', ketua: 'Pnt. Thomas Keiya', kontak: '+62 824-6789-0123', alamat: 'Debey, Deiyai, Papua', gereja: 7, jemaat: 583, pendeta: 5, color: 'var(--lime)', badge: 'badge-lime' },
    ],
    gereja: [
      { id: 'GRJ-001', nama: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', gembala: 'Pdt. Yohanes Gobai', tahun: 1985, jemaat: 148, status: 'Aktif' },
      { id: 'GRJ-002', nama: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', gembala: 'Pdt. Andreas Mote', tahun: 1991, jemaat: 132, status: 'Aktif' },
      { id: 'GRJ-003', nama: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', gembala: 'Pdt. Martinus Pigai', tahun: 1997, jemaat: 97, status: 'Aktif' },
      { id: 'GRJ-004', nama: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', gembala: 'Pdt. Samuel Dimi', tahun: 2001, jemaat: 115, status: 'Aktif' },
      { id: 'GRJ-005', nama: 'GKI Tigi Utara', kelasis: 'Tigi Utara', kelasisBadge: 'badge-rose', gembala: 'Pdt. Daniel Pakage', tahun: 1999, jemaat: 88, status: 'Nonaktif' },
      { id: 'GRJ-006', nama: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', gembala: 'Pdt. Thomas Keiya', tahun: 2008, jemaat: 103, status: 'Aktif' },
      { id: 'GRJ-007', nama: 'GKE Wagamo Timur', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', gembala: 'Pdt. Petrus Dimi', tahun: 2003, jemaat: 76, status: 'Aktif' },
      { id: 'GRJ-008', nama: 'GKII Tigi Selatan', kelasis: 'Tigi', kelasisBadge: 'badge-gold', gembala: 'Pdt. Maria Gobai', tahun: 2005, jemaat: 94, status: 'Aktif' },
    ],
    jemaat: [
      { id: 'JMT-0001', nama: 'Maria Gobai', jk: 'P', lahir: '14 Mar 1990', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', hp: '+62 812-1111-2222', status: 'Aktif' },
      { id: 'JMT-0002', nama: 'Yohanes Mote', jk: 'L', lahir: '22 Jul 1985', gereja: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', hp: '+62 813-2222-3333', status: 'Aktif' },
      { id: 'JMT-0003', nama: 'Debora Pigai', jk: 'P', lahir: '05 Jan 1998', gereja: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', hp: '+62 821-3333-4444', status: 'Aktif' },
      { id: 'JMT-0004', nama: 'Petrus Dimi', jk: 'L', lahir: '11 Sep 1979', gereja: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', hp: '+62 822-4444-5555', status: 'Pindah' },
      { id: 'JMT-0005', nama: 'Marta Pakage', jk: 'P', lahir: '30 Apr 2000', gereja: 'GKI Tigi Utara', kelasis: 'Tigi Utara', kelasisBadge: 'badge-rose', hp: '+62 823-5555-6666', status: 'Aktif' },
      { id: 'JMT-0006', nama: 'Samuel Keiya', jk: 'L', lahir: '18 Okt 1988', gereja: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', hp: '+62 824-6666-7777', status: 'Aktif' },
    ],
    kegiatan: [
      { nama: 'Ibadah Minggu Pagi', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', tanggal: '10 Nov 2024', peserta: 148, jenis: 'Ibadah Minggu', jenisBadge: 'badge-blue' },
      { nama: 'Baptisan Dewasa', gereja: 'GKI Tigi Barat', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', tanggal: '08 Nov 2024', peserta: 12, jenis: 'Baptisan', jenisBadge: 'badge-teal' },
      { nama: 'Seminar Kepemimpinan', gereja: 'GKII Yatamo', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', tanggal: '05 Nov 2024', peserta: 65, jenis: 'Seminar', jenisBadge: 'badge-violet' },
      { nama: 'Ibadah Pemuda', gereja: 'GKE Wagamo Selatan', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', tanggal: '03 Nov 2024', peserta: 44, jenis: 'Ibadah Pemuda', jenisBadge: 'badge-rose' },
      { nama: 'Sekolah Minggu', gereja: 'GKE Tigi Pusat', kelasis: 'Tigi', kelasisBadge: 'badge-gold', tanggal: '03 Nov 2024', peserta: 83, jenis: 'Sekolah Minggu', jenisBadge: 'badge-gold' },
      { nama: 'Pelayanan Sosial Debey', gereja: 'GKE Debey Baru', kelasis: 'Debey', kelasisBadge: 'badge-lime', tanggal: '01 Nov 2024', peserta: 120, jenis: 'Pelayanan Sosial', jenisBadge: 'badge-lime' },
    ],
    laporan: [
      { judul: 'Laporan Bulanan Oktober 2024', kelasis: 'Tigi', kelasisBadge: 'badge-gold', jenis: 'Bulanan', jenisBadge: 'badge-blue', periode: 'Oktober 2024', tglKirim: '12 Nov 2024', status: 'Diterima' },
      { judul: 'Laporan Kegiatan Seminar', kelasis: 'Yatamo', kelasisBadge: 'badge-teal', jenis: 'Kegiatan', jenisBadge: 'badge-gold', periode: 'Nov 2024', tglKirim: '10 Nov 2024', status: 'Diterima' },
      { judul: 'Laporan Bulanan Oktober 2024', kelasis: 'Wagamo', kelasisBadge: 'badge-violet', jenis: 'Bulanan', jenisBadge: 'badge-blue', periode: 'Oktober 2024', tglKirim: '08 Nov 2024', status: 'Proses' },
      { judul: 'Laporan Tahunan 2023', kelasis: 'Tigi Barat', kelasisBadge: 'badge-blue', jenis: 'Tahunan', jenisBadge: 'badge-violet', periode: '2023', tglKirim: '05 Nov 2024', status: 'Diterima' },
      { judul: 'Laporan Pelayanan Sosial', kelasis: 'Debey', kelasisBadge: 'badge-lime', jenis: 'Pelayanan', jenisBadge: 'badge-teal', periode: 'Nov 2024', tglKirim: '02 Nov 2024', status: 'Proses' },
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
      { nama: 'Op. Maria Pigai', email: 'gke.tigi@deiyai.id', role: 'Operator Gereja', kelasis: 'GKE Tigi', status: 'Aktif' },
      { nama: 'Op. Daniel Dimi', email: 'gke.wagamo@deiyai.id', role: 'Operator Gereja', kelasis: 'GKE Wagamo', status: 'Nonaktif' },
    ],
    actlog: [
      { time: '2024-11-12 09:14', user: 'Admin', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
      { time: '2024-11-12 09:22', user: 'Yohanes (Tigi)', action: 'Menambahkan laporan bulanan Oktober 2024', type: 'CREATE', typeClass: 'tag-create' },
      { time: '2024-11-12 10:05', user: 'Admin', action: 'Menyetujui laporan Kelasis Tigi', type: 'UPDATE', typeClass: 'tag-update' },
      { time: '2024-11-11 14:30', user: 'Andreas (Tigi Barat)', action: 'Mengedit data gereja GKI Tigi Barat', type: 'UPDATE', typeClass: 'tag-update' },
      { time: '2024-11-11 11:18', user: 'Maria (Op)', action: 'Menambahkan kegiatan Ibadah Minggu', type: 'CREATE', typeClass: 'tag-create' },
      { time: '2024-11-10 16:44', user: 'Admin', action: 'Menghapus data jemaat duplikat #4892', type: 'DELETE', typeClass: 'tag-delete' },
      { time: '2024-11-10 08:55', user: 'Samuel (Wagamo)', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
      { time: '2024-11-09 15:20', user: 'Samuel (Wagamo)', action: 'Upload dokumen laporan kegiatan', type: 'CREATE', typeClass: 'tag-create' },
      { time: '2024-11-09 09:11', user: 'Admin', action: 'Menambahkan pengumuman Sidang Sinode', type: 'CREATE', typeClass: 'tag-create' },
      { time: '2024-11-08 14:00', user: 'Daniel (Tigi Utara)', action: 'Login ke sistem', type: 'LOGIN', typeClass: 'tag-login' },
    ],
    stats: {
      totalKelasis: 6,
      totalGereja: 48,
      totalJemaat: 3847,
      totalPendeta: 52,
      totalKegiatan: 186,
      totalLaporan: 34,
    }
  });

  /* ════════════════════════════════════════════════════
     COMPONENT: Layout
     (dipakai oleh halaman dalam pages/ via x-data="layout('...')")
  ════════════════════════════════════════════════════ */
  Alpine.data('layout', (currentPage = '') => ({
    sidebarOpen: false,
    currentPage,

    init() {
      /* Redirect ke login jika belum login */
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
     ─────────────────────────────────────────────────
     Fitur:
     - Pilih role via card klik
     - Demo accounts: klik untuk isi form otomatis
     - doLogin(): validasi mock (password apapun diterima)
     - showDemo toggle box akun demo
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

    /* Akun demo — ditampilkan di box bawah form */
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
        name: 'Admin Kelasis Tigi',
        badgeClass: 'ak',
        badgeLabel: 'Admin Kelasis',
      },
      {
        role: 'Operator Gereja',
        email: 'gke.tigi@deiyai.id',
        password: 'operator123',
        name: 'Operator GKE Tigi',
        badgeClass: 'op',
        badgeLabel: 'Operator Gereja',
      },
    ],

    selectRole(role) {
      this.selectedRole = role;
      this.error = '';
    },

    /* Isi form dari klik akun demo */
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

      /* Simulasi network delay */
      await new Promise(r => setTimeout(r, 600));

      /*
       * Mock authentication:
       * - Cari akun berdasarkan email di demoAccounts atau users store
       * - Password apapun diterima (mock/demo)
       * - Role diambil dari selectedRole (pilihan user)
       */
      const names = {
        'Super Admin': 'Administrator Sistem',
        'Admin Kelasis': 'Admin Kelasis Tigi',
        'Operator Gereja': 'Operator GKE Tigi',
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
    init() {
      this.$nextTick(() => { if (window.initDashboardCharts) window.initDashboardCharts(); });
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
      this.form = { id: '', nama: '', ketua: '', kontak: '', alamat: '' };
      this.showModal = true;
    },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item }; this.showModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama kelasis wajib diisi.'; return; }
      this.formError = '';
      const store = Alpine.store('data');
      if (this.editMode) {
        const idx = store.kelasis.findIndex(i => i.id === this.form.id);
        if (idx > -1) store.kelasis[idx] = { ...store.kelasis[idx], ...this.form };
        Swal2.toast(`Kelasis ${this.form.nama} berhasil diperbarui`);
        Alpine.store('notif').add('Kelasis diperbarui', `Data ${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
      } else {
        const newId = 'KLS-' + String(store.kelasis.length + 1).padStart(3, '0');
        store.kelasis.push({ ...this.form, id: newId, gereja: 0, jemaat: 0, pendeta: 0, color: 'var(--text3)', badge: 'badge-blue' });
        store.stats.totalKelasis++;
        Swal2.toast(`Kelasis ${this.form.nama} berhasil ditambahkan`);
        Alpine.store('notif').add('Kelasis ditambahkan', `${this.form.nama} ditambahkan`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Kelasis?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').kelasis = Alpine.store('data').kelasis.filter(i => i.id !== item.id);
      Alpine.store('data').stats.totalKelasis = Math.max(0, Alpine.store('data').stats.totalKelasis - 1);
      Swal2.toast('Kelasis berhasil dihapus', 'error');
      Alpine.store('notif').add('Kelasis dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    }
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Gereja
  ════════════════════════════════════════════════════ */
  Alpine.data('gerejaPage', () => ({
    get allItems() { return Alpine.store('data').gereja; },
    filterKelasis: '', filterStatus: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    kelasisBadgeMap: { 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(g => {
        const matchK = !this.filterKelasis || g.kelasis === this.filterKelasis;
        const matchS = !this.filterStatus || g.status === this.filterStatus;
        const matchQ = !q || g.nama.toLowerCase().includes(q) || (g.gembala || '').toLowerCase().includes(q);
        return matchK && matchS && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() { this.editMode = false; this.formError = ''; this.form = { id: '', nama: '', kelasis: '', gembala: '', tahun: '', jemaat: 0, status: 'Aktif', alamat: '' }; this.showModal = true; },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item }; this.showModal = true; },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama gereja wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';
      const badge = this.kelasisBadgeMap[this.form.kelasis] || 'badge-blue';
      const store = Alpine.store('data');
      if (this.editMode) {
        const idx = store.gereja.findIndex(i => i.id === this.form.id);
        if (idx > -1) store.gereja[idx] = { ...store.gereja[idx], ...this.form, kelasisBadge: badge };
        Swal2.toast(`${this.form.nama} berhasil diperbarui`);
        Alpine.store('notif').add('Gereja diperbarui', `${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
      } else {
        const newId = 'GRJ-' + String(store.gereja.length + 1).padStart(3, '0');
        store.gereja.push({ ...this.form, id: newId, kelasisBadge: badge });
        store.stats.totalGereja++;
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        Alpine.store('notif').add('Gereja ditambahkan', `${this.form.nama} ditambahkan`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Gereja?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').gereja = Alpine.store('data').gereja.filter(i => i.id !== item.id);
      if (Alpine.store('data').stats.totalGereja > 0) Alpine.store('data').stats.totalGereja--;
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Gereja berhasil dihapus', 'error');
      Alpine.store('notif').add('Gereja dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Jemaat
  ════════════════════════════════════════════════════ */
  Alpine.data('jemaatPage', () => ({
    get allItems() { return Alpine.store('data').jemaat; },
    filterKelasis: '', filterStatus: '', filterJK: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    kelasisBadgeMap: { 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(j => {
        const matchK = !this.filterKelasis || j.kelasis === this.filterKelasis;
        const matchS = !this.filterStatus || j.status === this.filterStatus;
        const matchJK = !this.filterJK || j.jk === this.filterJK;
        const matchQ = !q || j.nama.toLowerCase().includes(q);
        return matchK && matchS && matchJK && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() { this.editMode = false; this.formError = ''; this.form = { id: '', nama: '', jk: 'L', lahir: '', gereja: '', kelasis: '', hp: '', status: 'Aktif', alamat: '' }; this.showModal = true; },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item }; this.showModal = true; },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama jemaat wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';
      const badge = this.kelasisBadgeMap[this.form.kelasis] || 'badge-blue';
      const store = Alpine.store('data');
      if (this.editMode) {
        const idx = store.jemaat.findIndex(i => i.id === this.form.id);
        if (idx > -1) store.jemaat[idx] = { ...store.jemaat[idx], ...this.form, kelasisBadge: badge };
        Swal2.toast(`${this.form.nama} berhasil diperbarui`);
        Alpine.store('notif').add('Jemaat diperbarui', `${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
      } else {
        const newId = 'JMT-' + String(store.jemaat.length + 1).padStart(4, '0');
        store.jemaat.push({ ...this.form, id: newId, kelasisBadge: badge });
        store.stats.totalJemaat++;
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        Alpine.store('notif').add('Jemaat ditambahkan', `${this.form.nama} ditambahkan`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Jemaat?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').jemaat = Alpine.store('data').jemaat.filter(i => i.id !== item.id);
      if (Alpine.store('data').stats.totalJemaat > 0) Alpine.store('data').stats.totalJemaat--;
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Jemaat berhasil dihapus', 'error');
      Alpine.store('notif').add('Jemaat dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Kegiatan
  ════════════════════════════════════════════════════ */
  Alpine.data('kegiatanPage', () => ({
    get allItems() { return Alpine.store('data').kegiatan; },
    filterJenis: '', filterKelasis: '', search: '',
    currentPage: 1, perPage: 8,
    showModal: false, viewModal: false, editMode: false, viewItem: null,
    form: {}, formError: '',
    jenisOptions: ['Ibadah Minggu', 'Ibadah Pemuda', 'Ibadah Wanita', 'Sekolah Minggu', 'Baptisan', 'Pernikahan', 'Dukacita', 'Seminar', 'Pelayanan Sosial'],
    jenisBadgeMap: { 'Ibadah Minggu': 'badge-blue', 'Ibadah Pemuda': 'badge-rose', 'Ibadah Wanita': 'badge-violet', 'Sekolah Minggu': 'badge-gold', 'Baptisan': 'badge-teal', 'Pernikahan': 'badge-lime', 'Dukacita': 'badge-rose', 'Seminar': 'badge-violet', 'Pelayanan Sosial': 'badge-lime' },
    kelasisBadgeMap: { 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' },

    get filtered() {
      const q = this.search.toLowerCase();
      return this.allItems.filter(k => {
        const matchJ = !this.filterJenis || k.jenis === this.filterJenis;
        const matchK = !this.filterKelasis || k.kelasis === this.filterKelasis;
        const matchQ = !q || k.nama.toLowerCase().includes(q);
        return matchJ && matchK && matchQ;
      });
    },
    get paginated() { const s = (this.currentPage - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    resetPage() { this.currentPage = 1; },

    openAdd() { this.editMode = false; this.formError = ''; this.form = { nama: '', jenis: 'Ibadah Minggu', gereja: '', kelasis: '', tanggal: '', peserta: 0, deskripsi: '' }; this.showModal = true; },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item }; this.showModal = true; },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama kegiatan wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';
      const store = Alpine.store('data');
      const jBadge = this.jenisBadgeMap[this.form.jenis] || 'badge-blue';
      const kBadge = this.kelasisBadgeMap[this.form.kelasis] || 'badge-blue';
      if (this.editMode) {
        const idx = store.kegiatan.findIndex(i => i.nama === this.form.nama && i.tanggal === this.form.tanggal);
        if (idx > -1) store.kegiatan[idx] = { ...store.kegiatan[idx], ...this.form, jenisBadge: jBadge, kelasisBadge: kBadge };
        Swal2.toast(`${this.form.nama} berhasil diperbarui`);
        Alpine.store('notif').add('Kegiatan diperbarui', `${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
      } else {
        store.kegiatan.unshift({ ...this.form, jenisBadge: jBadge, kelasisBadge: kBadge });
        store.stats.totalKegiatan++;
        Swal2.toast(`${this.form.nama} berhasil ditambahkan`);
        Alpine.store('notif').add('Kegiatan ditambahkan', `${this.form.nama} ditambahkan`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Kegiatan?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').kegiatan = Alpine.store('data').kegiatan.filter(i => i !== item);
      if (Alpine.store('data').stats.totalKegiatan > 0) Alpine.store('data').stats.totalKegiatan--;
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      Swal2.toast('Kegiatan berhasil dihapus', 'error');
      Alpine.store('notif').add('Kegiatan dihapus', `${item.nama} dihapus`, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Laporan
  ════════════════════════════════════════════════════ */
  Alpine.data('laporanPage', () => ({
    get allItems() { return Alpine.store('data').laporan; },
    filterJenis: '', filterKelasis: '', filterStatus: '',
    showModal: false, viewModal: false, viewItem: null, editMode: false,
    form: {}, formError: '',
    jenisOptions: ['Laporan Bulanan', 'Laporan Tahunan', 'Laporan Kegiatan', 'Laporan Pelayanan'],
    kelasisBadgeMap: { 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' },

    get filtered() {
      return this.allItems.filter(l => {
        const matchJ = !this.filterJenis || l.jenis === this.filterJenis;
        const matchK = !this.filterKelasis || l.kelasis === this.filterKelasis;
        const matchS = !this.filterStatus || l.status === this.filterStatus;
        return matchJ && matchK && matchS;
      });
    },
    statusBadge(s) { return s === 'Diterima' ? 'badge-teal' : s === 'Proses' ? 'badge-amber' : 'badge-rose'; },

    openAdd() { this.editMode = false; this.formError = ''; this.form = { judul: '', jenis: 'Laporan Bulanan', periode: '', isi: '', kelasis: '' }; this.showModal = true; },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item }; this.showModal = true; },
    openView(item) { this.viewItem = { ...item }; this.viewModal = true; },

    async approve(item) {
      const res = await Swal2.confirm('Setujui Laporan?', `Setujui "${item.judul}"?`, 'question');
      if (!res.isConfirmed) return;
      const idx = Alpine.store('data').laporan.findIndex(i => i === item);
      if (idx > -1) Alpine.store('data').laporan[idx].status = 'Diterima';
      Swal2.toast('Laporan berhasil disetujui');
      Alpine.store('notif').add('Laporan disetujui', item.judul, 'update', 'var(--teal)');
    },

    save() {
      if (!this.form.judul.trim()) { this.formError = 'Judul laporan wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';
      const store = Alpine.store('data');
      const kBadge = this.kelasisBadgeMap[this.form.kelasis] || 'badge-blue';
      const jBadge = { 'Laporan Bulanan': 'badge-blue', 'Laporan Tahunan': 'badge-violet', 'Laporan Kegiatan': 'badge-gold', 'Laporan Pelayanan': 'badge-teal' }[this.form.jenis] || 'badge-blue';
      if (this.editMode) {
        const idx = store.laporan.findIndex(i => i.judul === this.form.judul && i.kelasis === this.form.kelasis);
        if (idx > -1) store.laporan[idx] = { ...store.laporan[idx], ...this.form, kelasisBadge: kBadge, jenisBadge: jBadge };
        Swal2.toast('Laporan berhasil diperbarui');
        Alpine.store('notif').add('Laporan diperbarui', this.form.judul, 'update', 'var(--blue2)');
      } else {
        store.laporan.unshift({
          ...this.form, kelasisBadge: kBadge, jenisBadge: jBadge,
          tglKirim: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Proses'
        });
        store.stats.totalLaporan++;
        Swal2.toast('Laporan berhasil dikirim');
        Alpine.store('notif').add('Laporan dikirim', this.form.judul, 'create', 'var(--gold)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Laporan?', `"${item.judul}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').laporan = Alpine.store('data').laporan.filter(i => i !== item);
      if (Alpine.store('data').stats.totalLaporan > 0) Alpine.store('data').stats.totalLaporan--;
      Swal2.toast('Laporan berhasil dihapus', 'error');
      Alpine.store('notif').add('Laporan dihapus', item.judul, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Statistik
  ════════════════════════════════════════════════════ */
  Alpine.data('statistikPage', () => ({
    init() { this.$nextTick(() => { if (window.initStatCharts) window.initStatCharts(); }); },
    progressKelasis: [
      { label: 'Tigi', val: 9, pct: 90, color: 'var(--gold)' }, { label: 'Tigi Utara', val: 9, pct: 90, color: 'var(--rose)' },
      { label: 'Tigi Barat', val: 8, pct: 80, color: 'var(--blue2)' }, { label: 'Wagamo', val: 8, pct: 80, color: 'var(--violet)' },
      { label: 'Yatamo', val: 7, pct: 70, color: 'var(--teal)' }, { label: 'Debey', val: 7, pct: 70, color: 'var(--lime)' },
    ],
    progressKegiatan: [
      { label: 'Ibadah Minggu', val: 62, pct: 92, color: 'var(--gold)' }, { label: 'Sekolah Minggu', val: 48, pct: 71, color: 'var(--blue2)' },
      { label: 'Ibadah Pemuda', val: 32, pct: 48, color: 'var(--violet)' }, { label: 'Pelayanan Sosial', val: 22, pct: 33, color: 'var(--teal)' },
      { label: 'Seminar', val: 14, pct: 21, color: 'var(--rose)' }, { label: 'Baptisan', val: 8, pct: 12, color: 'var(--lime)' },
    ],
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Users
  ════════════════════════════════════════════════════ */
  Alpine.data('usersPage', () => ({
    get items() { return Alpine.store('data').users; },
    showModal: false, editMode: false, form: {}, formError: '',

    openAdd() { this.editMode = false; this.formError = ''; this.form = { nama: '', email: '', password: '', role: 'Admin Kelasis', kelasis: '', status: 'Aktif' }; this.showModal = true; },
    openEdit(item) { this.editMode = true; this.formError = ''; this.form = { ...item, password: '' }; this.showModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama wajib diisi.'; return; }
      if (!this.form.email.trim()) { this.formError = 'Email wajib diisi.'; return; }
      if (!this.editMode && !this.form.password) { this.formError = 'Password wajib diisi.'; return; }
      this.formError = '';
      const store = Alpine.store('data');
      if (this.editMode) {
        const idx = store.users.findIndex(i => i.email === this.form.email);
        if (idx > -1) store.users[idx] = { ...store.users[idx], ...this.form };
        Swal2.toast(`Akun ${this.form.nama} berhasil diperbarui`);
        Alpine.store('notif').add('User diperbarui', `Akun ${this.form.nama} diperbarui`, 'update', 'var(--blue2)');
      } else {
        if (store.users.find(u => u.email === this.form.email)) { this.formError = 'Email sudah terdaftar.'; return; }
        store.users.push({ ...this.form });
        Swal2.toast(`Akun ${this.form.nama} berhasil dibuat`);
        Alpine.store('notif').add('User dibuat', `Akun ${this.form.nama} dibuat`, 'create', 'var(--teal)');
      }
      this.showModal = false;
    },

    async toggleStatus(item) {
      const newStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      const res = await Swal2.confirm(`${newStatus === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} User?`, `Status ${item.nama} akan diubah.`, 'question');
      if (!res.isConfirmed) return;
      const idx = Alpine.store('data').users.indexOf(item);
      if (idx > -1) Alpine.store('data').users[idx].status = newStatus;
      Swal2.toast(`Status ${item.nama} diubah ke ${newStatus}`);
    },

    async resetPwd(item) {
      const res = await Swal2.confirm('Reset Password?', `Password ${item.nama} akan direset ke default.`, 'info');
      if (!res.isConfirmed) return;
      Swal2.success('Password Direset', 'Password baru: simgk2024');
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Akun?', `Akun "${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').users = Alpine.store('data').users.filter(i => i !== item);
      Swal2.toast('Akun berhasil dihapus', 'error');
      Alpine.store('notif').add('User dihapus', `Akun ${item.nama} dihapus`, 'delete', 'var(--rose)');
    },

    roleBadge(r) { return r === 'Super Admin' ? 'role-super' : r === 'Admin Kelasis' ? 'role-kelasis' : 'role-operator'; },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Notifikasi
  ════════════════════════════════════════════════════ */
  Alpine.data('notifPage', () => ({
    get items() { return Alpine.store('notif').items; },
    markAll() { Alpine.store('notif').markAllRead(); Swal2.toast('Semua notifikasi telah dibaca'); },
    async deleteNotif(item) {
      const store = Alpine.store('notif');
      store.items = store.items.filter(i => i.id !== item.id);
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Pengumuman
  ════════════════════════════════════════════════════ */
  Alpine.data('pengumumanPage', () => ({
    items: [
      { judul: 'Sidang Sinode Tahunan 2024', body: 'Sidang Sinode Tahunan Koordinator Deiyai dilaksanakan 15–18 Desember 2024. Seluruh ketua kelasis wajib hadir.', tujuan: 'Semua Kelasis', tujuanBadge: 'badge-gold', oleh: 'Administrator', tgl: '10 November 2024' },
      { judul: 'Program Pelayanan Advent 2024', body: 'Koordinator mengimbau seluruh gereja mempersiapkan program pelayanan Advent mulai minggu pertama Desember. Tema: "Cahaya di Papua".', tujuan: 'Seluruh Gereja', tujuanBadge: 'badge-blue', oleh: 'Administrator', tgl: '05 November 2024' },
      { judul: 'Deadline Laporan Tahunan 2024', body: 'Seluruh kelasis wajib mengirim laporan tahunan 2024 paling lambat 31 Januari 2025 melalui modul Laporan Pelayanan.', tujuan: 'Admin Kelasis', tujuanBadge: 'badge-violet', oleh: 'Administrator', tgl: '01 November 2024' },
    ],
    showModal: false, editMode: false, form: {}, formError: '', editIdx: -1,

    openAdd() { this.editMode = false; this.formError = ''; this.editIdx = -1; this.form = { judul: '', body: '', tujuan: 'Semua Kelasis', prioritas: 'Normal' }; this.showModal = true; },
    openEdit(item, idx) { this.editMode = true; this.formError = ''; this.editIdx = idx; this.form = { ...item }; this.showModal = true; },

    save() {
      if (!this.form.judul.trim()) { this.formError = 'Judul wajib diisi.'; return; }
      if (!this.form.body.trim()) { this.formError = 'Isi pengumuman wajib diisi.'; return; }
      this.formError = '';
      const tujuanBadgeMap = { 'Semua Kelasis': 'badge-gold', 'Seluruh Gereja': 'badge-blue', 'Admin Kelasis': 'badge-violet', 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' };
      const tujuanBadge = tujuanBadgeMap[this.form.tujuan] || 'badge-gold';
      if (this.editMode && this.editIdx >= 0) {
        this.items[this.editIdx] = { ...this.items[this.editIdx], ...this.form, tujuanBadge };
        Swal2.toast('Pengumuman berhasil diperbarui');
        Alpine.store('notif').add('Pengumuman diperbarui', this.form.judul, 'update', 'var(--blue2)');
      } else {
        this.items.unshift({ judul: this.form.judul, body: this.form.body, tujuan: this.form.tujuan, tujuanBadge, oleh: 'Administrator', tgl: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) });
        Swal2.toast('Pengumuman berhasil dikirim');
        Alpine.store('notif').add('Pengumuman dikirim', this.form.judul, 'create', 'var(--gold)');
      }
      this.showModal = false;
    },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Pengumuman?', `"${item.judul}" akan dihapus.`);
      if (!res.isConfirmed) return;
      this.items = this.items.filter(i => i !== item);
      Swal2.toast('Pengumuman dihapus', 'error');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Dokumen
  ════════════════════════════════════════════════════ */
  Alpine.data('dokumenPage', () => ({
    get items() { return Alpine.store('data').dokumen; },
    filterKelasis: '', search: '',
    showModal: false, form: {}, formError: '',

    get filtered() {
      const q = this.search.toLowerCase();
      return this.items.filter(d => {
        const matchK = !this.filterKelasis || d.kelasis === this.filterKelasis;
        const matchQ = !q || d.nama.toLowerCase().includes(q);
        return matchK && matchQ;
      });
    },

    openUpload() { this.formError = ''; this.form = { nama: '', jenis: 'SK Pelayanan', kelasis: '', ukuran: '—' }; this.showModal = true; },

    save() {
      if (!this.form.nama.trim()) { this.formError = 'Nama dokumen wajib diisi.'; return; }
      if (!this.form.kelasis) { this.formError = 'Kelasis wajib dipilih.'; return; }
      this.formError = '';
      const jenisBadgeMap = { 'SK Pelayanan': 'badge-blue', 'Laporan': 'badge-teal', 'Notulen': 'badge-violet', 'Dokumentasi': 'badge-gold', 'Lainnya': 'badge-amber' };
      const kelasisBadgeMap = { 'Tigi': 'badge-gold', 'Tigi Barat': 'badge-blue', 'Yatamo': 'badge-teal', 'Wagamo': 'badge-violet', 'Tigi Utara': 'badge-rose', 'Debey': 'badge-lime' };
      Alpine.store('data').dokumen.unshift({
        ...this.form,
        jenisBadge: jenisBadgeMap[this.form.jenis] || 'badge-blue',
        kelasisBadge: kelasisBadgeMap[this.form.kelasis] || 'badge-blue',
        tgl: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      Swal2.toast(`${this.form.nama} berhasil diupload`);
      Alpine.store('notif').add('Dokumen diupload', this.form.nama, 'create', 'var(--teal)');
      this.showModal = false;
    },

    download(item) { Swal2.toast(`Mengunduh ${item.nama}...`, 'info'); },

    async remove(item) {
      const res = await Swal2.confirm('Hapus Dokumen?', `"${item.nama}" akan dihapus permanen.`);
      if (!res.isConfirmed) return;
      Alpine.store('data').dokumen = Alpine.store('data').dokumen.filter(i => i !== item);
      Swal2.toast('Dokumen berhasil dihapus', 'error');
      Alpine.store('notif').add('Dokumen dihapus', item.nama, 'delete', 'var(--rose)');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Pengaturan
  ════════════════════════════════════════════════════ */
  Alpine.data('pengaturanPage', () => ({
    settings: { namaSistem: 'SIMGK Deiyai', namaKoordinator: 'Gereja Koordinator Deiyai', tahunPelayanan: '2024', kontak: '+62 XXX-XXXX-XXXX' },
    security: { sessionTimeout: true, loginLog: true, enkripsi: true, emailNotif: false },
    saved: false,

    async save() {
      this.saved = true;
      Swal2.toast('Pengaturan berhasil disimpan');
      Alpine.store('notif').add('Pengaturan disimpan', 'Konfigurasi sistem diperbarui', 'update', 'var(--teal)');
      setTimeout(() => this.saved = false, 3000);
    },

    async backupNow() {
      const res = await Swal2.confirm('Backup Database?', 'Proses backup akan dimulai sekarang.', 'info');
      if (!res.isConfirmed) return;
      Swal2.success('Backup Berhasil', 'Database berhasil dibackup pada ' + new Date().toLocaleString('id-ID'));
      Alpine.store('notif').add('Backup selesai', 'Database berhasil dibackup', 'update', 'var(--teal)');
    },
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
      const res = await Swal2.confirm('Bersihkan Log?', 'Semua activity log akan dihapus.', 'warning');
      if (!res.isConfirmed) return;
      Alpine.store('data').actlog = [];
      Swal2.toast('Activity log berhasil dibersihkan', 'error');
    },
  }));

  /* ════════════════════════════════════════════════════
     COMPONENT: Export
  ════════════════════════════════════════════════════ */
  Alpine.data('exportPage', () => ({
    exports: [
      { icon: '⛪', title: 'Data Gereja', desc: '48 gereja terdaftar', formats: ['PDF', 'Excel', 'CSV'] },
      { icon: '👥', title: 'Data Jemaat', desc: '3.847 jemaat terdaftar', formats: ['PDF', 'Excel', 'CSV'] },
      { icon: '📅', title: 'Data Kegiatan', desc: '186 kegiatan tercatat', formats: ['PDF', 'Excel', 'CSV'] },
      { icon: '📋', title: 'Laporan Pelayanan', desc: '34 laporan masuk', formats: ['PDF', 'Excel', 'CSV'] },
      { icon: '🏛️', title: 'Data Kelasis', desc: '6 kelasis aktif', formats: ['PDF', 'Excel'] },
      { icon: '📊', title: 'Statistik Lengkap', desc: 'Semua data statistik', formats: ['PDF Report'] },
    ],
    async doExport(title, fmt) {
      const res = await Swal2.confirm(`Export ${title}?`, `Download format ${fmt}?`, 'info');
      if (!res.isConfirmed) return;
      Swal2.toast(`Mengunduh ${title} (${fmt})...`, 'info');
      Alpine.store('notif').add('Export data', `${title} format ${fmt} sedang diunduh`, 'update', 'var(--blue2)');
    },
  }));

});