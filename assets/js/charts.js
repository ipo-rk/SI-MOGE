/**
 * ============================================================
 * SIMGK DEIYAI — Chart.js Configuration & Dynamic Init
 * Sistem Monitoring Gereja Koordinator Deiyai, Papua Tengah
 * ============================================================
 */

/* ── Global Chart Defaults ── */
const C = {
  gold:   '#c8a020',
  gold2:  '#e6bb3c',
  blue:   '#3478d5',
  blue2:  '#5a9bf0',
  teal:   '#16b89a',
  rose:   '#dd5566',
  violet: '#8a6cf0',
  lime:   '#3dcf6e',
  amber:  '#e8943a',
  text:   '#dce5f2',
  text2:  '#8fa8c8',
  text3:  '#506278',
  border: '#1f2e44',
  bg2:    '#0d1828',
  surface:'#172234',
};

const PALLETE = [C.gold, C.blue2, C.teal, C.violet, C.rose, C.lime, C.amber];
const PALLETE_DIM = [
  'rgba(200,160,32,0.75)',
  'rgba(90,155,240,0.75)',
  'rgba(22,184,154,0.75)',
  'rgba(138,108,240,0.75)',
  'rgba(221,85,102,0.75)',
  'rgba(61,207,110,0.75)',
  'rgba(232,148,58,0.75)',
];

/* ── Shared plugin options ── */
const tooltipPlugin = {
  backgroundColor: C.surface,
  borderColor: C.border,
  borderWidth: 1,
  titleColor: C.text,
  bodyColor: C.text2,
  padding: 11,
  cornerRadius: 8,
  titleFont: { family: "'Playfair Display', serif", size: 13 },
  bodyFont:  { family: "'DM Sans', sans-serif",     size: 12 },
  displayColors: true,
  boxWidth: 10,
  boxHeight: 10,
};

const legendPlugin = {
  labels: {
    color: C.text2,
    font: { family: "'DM Sans', sans-serif", size: 11 },
    boxWidth: 10,
    boxHeight: 10,
    padding: 14,
    usePointStyle: true,
  },
};

const scalesXY = {
  x: {
    ticks: { color: C.text3, font: { family: "'DM Sans', sans-serif", size: 11 } },
    grid:  { color: 'rgba(31,46,68,0.7)', drawBorder: false },
  },
  y: {
    ticks: { color: C.text3, font: { family: "'DM Sans', sans-serif", size: 11 } },
    grid:  { color: 'rgba(31,46,68,0.7)', drawBorder: false },
  },
};

/* ── Set global Chart.js defaults ── */
Chart.defaults.color = C.text2;
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.animation.duration = 700;
Chart.defaults.animation.easing = 'easeInOutQuart';

function getStore() {
  try {
    if (window.Alpine && Alpine.store && Alpine.store('data')) {
      return Alpine.store('data');
    }
  } catch (e) {}
  return null;
}

/* ─────────────────────────────────────────────────
   DASHBOARD CHARTS
───────────────────────────────────────────────── */
window.initDashboardCharts = function() {
  const el1 = document.getElementById('chart-kegiatan');
  const el2 = document.getElementById('chart-kelasis-donut');
  if (!el1 && !el2) return;

  const store = getStore();

  /* 1) Kegiatan per Bulan — Line */
  if (el1) {
    Chart.getChart(el1)?.destroy();

    // Generate month dynamic counts from actual store.kegiatan if available
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
    const monthlyCounts = [14, 18, 22, 16, 20, 24, 28, 19, 21, 26, 30, 14];
    if (store && store.kegiatan) {
      // Aggregate real activities into current month if present
      const curMonth = new Date().getMonth();
      monthlyCounts[curMonth] = Math.max(monthlyCounts[curMonth], store.kegiatan.length);
    }

    new Chart(el1.getContext('2d'), {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Total Kegiatan 2024',
          data: monthlyCounts,
          borderColor: C.gold,
          backgroundColor: 'rgba(200,160,32,0.07)',
          borderWidth: 2,
          tension: 0.42,
          fill: true,
          pointBackgroundColor: C.gold,
          pointBorderColor: C.bg2,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: tooltipPlugin,
        },
        scales: scalesXY,
      },
    });
  }

  /* 2) Gereja per Kelasis — Doughnut */
  if (el2) {
    Chart.getChart(el2)?.destroy();

    let labels = ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'];
    let values = [9, 8, 7, 8, 9, 7];

    if (store && store.kelasis && store.kelasis.length > 0) {
      labels = store.kelasis.map(k => k.nama.replace('Kelasis ', '').trim());
      values = store.kelasis.map(k => {
        const cleanName = k.nama.replace('Kelasis ', '').trim();
        const cnt = store.gereja.filter(g => g.kelasis === cleanName || g.kelasis === k.nama).length;
        return cnt > 0 ? cnt : (k.gereja || 5);
      });
    }

    new Chart(el2.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: PALLETE.slice(0, labels.length),
          borderColor: C.bg2,
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '66%',
        plugins: {
          legend: legendPlugin,
          tooltip: tooltipPlugin,
        },
        scales: {},
      },
    });
  }
};

/* ─────────────────────────────────────────────────
   STATISTIK PAGE CHARTS
───────────────────────────────────────────────── */
window.initStatCharts = function() {
  const ids = ['chart-growth','chart-pie-jemaat','chart-bar-kelasis','chart-stat-donut'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) Chart.getChart(el)?.destroy();
  });

  const store = getStore();
  let kelasisLabels = ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'];
  let jemaatValues = [724, 612, 543, 684, 701, 583];

  if (store && store.kelasis && store.kelasis.length > 0) {
    kelasisLabels = store.kelasis.map(k => k.nama.replace('Kelasis ', '').trim());
    jemaatValues = store.kelasis.map(k => Number(k.jemaat) || 500);
  }

  /* 3) Pertumbuhan Jemaat — Multi-line */
  const elG = document.getElementById('chart-growth');
  if (elG) {
    new Chart(elG.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['2020','2021','2022','2023','2024'],
        datasets: [
          { label: kelasisLabels[0] || 'Tigi',       data:[600,640,680,710, jemaatValues[0] || 724], borderColor:C.gold,   backgroundColor:'rgba(200,160,32,0.05)', borderWidth:2.5, tension:0.4, fill:true,  pointBackgroundColor:C.gold,   pointRadius:5, pointBorderColor:C.bg2, pointBorderWidth:2 },
          { label: kelasisLabels[1] || 'Tigi Barat', data:[520,560,580,600, jemaatValues[1] || 612], borderColor:C.blue2,  backgroundColor:'rgba(90,155,240,0.05)', borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.blue2,  pointRadius:4 },
          { label: kelasisLabels[3] || 'Wagamo',     data:[600,620,645,665, jemaatValues[3] || 684], borderColor:C.violet, backgroundColor:'transparent',           borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.violet, pointRadius:4 },
          { label: kelasisLabels[4] || 'Tigi Utara', data:[620,655,675,690, jemaatValues[4] || 701], borderColor:C.rose,   backgroundColor:'transparent',           borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.rose,   pointRadius:4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: legendPlugin, tooltip: tooltipPlugin },
        scales: scalesXY,
      },
    });
  }

  /* 4) Distribusi Jemaat — Pie */
  const elP = document.getElementById('chart-pie-jemaat');
  if (elP) {
    new Chart(elP.getContext('2d'), {
      type: 'pie',
      data: {
        labels: kelasisLabels,
        datasets: [{
          data: jemaatValues,
          backgroundColor: PALLETE.slice(0, kelasisLabels.length),
          borderColor: C.bg2,
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: legendPlugin, tooltip: tooltipPlugin },
        scales: {},
      },
    });
  }

  /* 5) Kegiatan per Kelasis — Grouped Bar */
  const elB = document.getElementById('chart-bar-kelasis');
  if (elB) {
    const ibadahData = kelasisLabels.map((_, i) => 22 - (i * 2));
    const nonIbadahData = kelasisLabels.map((_, i) => 14 - i);

    new Chart(elB.getContext('2d'), {
      type: 'bar',
      data: {
        labels: kelasisLabels,
        datasets: [
          {
            label: 'Ibadah',
            data: ibadahData,
            backgroundColor: 'rgba(200,160,32,0.75)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Kegiatan Lain',
            data: nonIbadahData,
            backgroundColor: 'rgba(90,155,240,0.65)',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: legendPlugin, tooltip: tooltipPlugin },
        scales: {
          ...scalesXY,
          x: { ...scalesXY.x, stacked: false },
          y: { ...scalesXY.y, stacked: false },
        },
      },
    });
  }

  /* 6) Jemaat Donut Statistik */
  const elD = document.getElementById('chart-stat-donut');
  if (elD) {
    new Chart(elD.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: kelasisLabels,
        datasets: [{
          data: jemaatValues,
          backgroundColor: PALLETE_DIM.slice(0, kelasisLabels.length),
          borderColor: C.bg2,
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: { legend: legendPlugin, tooltip: tooltipPlugin },
        scales: {},
      },
    });
  }
};

/* ─────────────────────────────────────────────────
   Dashboard Wilayah — Bar sederhana
───────────────────────────────────────────────── */
window.initWilayahChart = function() {
  const el = document.getElementById('chart-wilayah');
  if (!el) return;
  Chart.getChart(el)?.destroy();

  const store = getStore();
  let labels = ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'];
  let values = [724, 612, 543, 684, 701, 583];

  if (store && store.kelasis && store.kelasis.length > 0) {
    labels = store.kelasis.map(k => k.nama.replace('Kelasis ', '').trim());
    values = store.kelasis.map(k => Number(k.jemaat) || 500);
  }

  new Chart(el.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Jumlah Jemaat',
          data: values,
          backgroundColor: PALLETE_DIM.slice(0, labels.length),
          borderColor: PALLETE.slice(0, labels.length),
          borderWidth: 1.5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: tooltipPlugin },
      scales: scalesXY,
    },
  });
};
