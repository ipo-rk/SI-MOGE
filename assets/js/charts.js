/**
 * ============================================================
 * SIMGK DEIYAI — Chart.js Configuration & Init
 * Sistem Monitoring Gereja Koordinator Deiyai, Papua
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

const PALLETE = [C.gold, C.blue2, C.teal, C.violet, C.rose, C.lime];
const PALLETE_DIM = [
  'rgba(200,160,32,0.75)',
  'rgba(90,155,240,0.75)',
  'rgba(22,184,154,0.75)',
  'rgba(138,108,240,0.75)',
  'rgba(221,85,102,0.75)',
  'rgba(61,207,110,0.75)',
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

/* ─────────────────────────────────────────────────
   DASHBOARD CHARTS
───────────────────────────────────────────────── */
window.initDashboardCharts = function() {
  const el1 = document.getElementById('chart-kegiatan');
  const el2 = document.getElementById('chart-kelasis-donut');
  if (!el1 || !el2) return;

  /* Destroy existing if any */
  Chart.getChart(el1)?.destroy();
  Chart.getChart(el2)?.destroy();

  /* 1) Kegiatan per Bulan — Line */
  new Chart(el1.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'],
      datasets: [{
        label: 'Total Kegiatan 2024',
        data: [14, 18, 22, 16, 20, 24, 28, 19, 21, 26, 30, 14],
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

  /* 2) Gereja per Kelasis — Doughnut */
  new Chart(el2.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'],
      datasets: [{
        data: [9, 8, 7, 8, 9, 7],
        backgroundColor: PALLETE,
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
};

/* ─────────────────────────────────────────────────
   STATISTIK PAGE CHARTS
───────────────────────────────────────────────── */
window.initStatCharts = function() {
  const ids = ['chart-growth','chart-pie-jemaat','chart-bar-kelasis'];
  ids.forEach(id => Chart.getChart(document.getElementById(id))?.destroy());

  /* 3) Pertumbuhan Jemaat — Multi-line */
  const elG = document.getElementById('chart-growth');
  if (elG) {
    new Chart(elG.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['2020','2021','2022','2023','2024'],
        datasets: [
          { label:'Tigi',       data:[600,640,680,710,724], borderColor:C.gold,   backgroundColor:'rgba(200,160,32,0.05)', borderWidth:2.5, tension:0.4, fill:true,  pointBackgroundColor:C.gold,   pointRadius:5, pointBorderColor:C.bg2, pointBorderWidth:2 },
          { label:'Tigi Barat', data:[520,560,580,600,612], borderColor:C.blue2,  backgroundColor:'rgba(90,155,240,0.05)', borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.blue2,  pointRadius:4 },
          { label:'Wagamo',     data:[600,620,645,665,684], borderColor:C.violet, backgroundColor:'transparent',           borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.violet, pointRadius:4 },
          { label:'Tigi Utara', data:[620,655,675,690,701], borderColor:C.rose,   backgroundColor:'transparent',           borderWidth:2,   tension:0.4, fill:false, pointBackgroundColor:C.rose,   pointRadius:4 },
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
        labels: ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'],
        datasets: [{
          data: [724, 612, 543, 684, 701, 583],
          backgroundColor: PALLETE,
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
    new Chart(elB.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'],
        datasets: [
          {
            label: 'Ibadah',
            data: [22, 18, 15, 20, 24, 12],
            backgroundColor: 'rgba(200,160,32,0.75)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Kegiatan Lain',
            data: [14, 12, 10, 16, 14, 8],
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
    Chart.getChart(elD)?.destroy();
    new Chart(elD.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'],
        datasets: [{
          data: [724, 612, 543, 684, 701, 583],
          backgroundColor: PALLETE_DIM,
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

  new Chart(el.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Tigi','Tigi Barat','Yatamo','Wagamo','Tigi Utara','Debey'],
      datasets: [
        {
          label: 'Jumlah Jemaat',
          data: [724, 612, 543, 684, 701, 583],
          backgroundColor: PALLETE_DIM,
          borderColor: PALLETE,
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
