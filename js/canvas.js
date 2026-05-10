/* ═══════════════════════════════════════════════════
   canvas.js — DC / AC solar circuit diagrams
   Draws on #circuitCanvas with labeled arrows
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const COLORS = {
    panel:  '#EF9F27',   /* amber */
    battery:'#1D9E75',   /* teal  */
    load:   '#185FA5',   /* blue  */
    wire:   '#555555',
    arrow:  '#555555',
    label:  '#111111',
    subLabel:'#999999',
    ac:     '#854F0B',
  };

  /* ── Helpers ──────────────────────────────────────── */
  function box(ctx, x, y, w, h, color, label, subLabel) {
    /* Shadow */
    ctx.shadowColor   = 'rgba(0,0,0,.10)';
    ctx.shadowBlur    = 6;
    ctx.shadowOffsetY = 2;

    /* Filled rect */
    ctx.fillStyle   = color + '22';   /* 13% opacity bg */
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    /* Label */
    ctx.fillStyle  = COLORS.label;
    ctx.font       = "500 13px system-ui, sans-serif";
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 - (subLabel ? 7 : 0));

    if (subLabel) {
      ctx.fillStyle  = COLORS.subLabel;
      ctx.font       = "400 10px system-ui, sans-serif";
      ctx.fillText(subLabel, x + w / 2, y + h / 2 + 9);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function arrow(ctx, x1, y1, x2, y2, label) {
    const headLen = 9;
    const angle   = Math.atan2(y2 - y1, x2 - x1);

    ctx.strokeStyle = COLORS.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    /* Arrowhead */
    ctx.fillStyle = COLORS.arrow;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    /* Wire label */
    if (label) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - 10;
      ctx.fillStyle    = COLORS.subLabel;
      ctx.font         = "400 10px system-ui, sans-serif";
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, mx, my);
    }
  }

  /* ── DC circuit ───────────────────────────────────── */
  function drawDC(canvas) {
    canvas = canvas || document.getElementById('circuitCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W   = canvas.offsetWidth  || canvas.width;
    const H   = canvas.offsetHeight || canvas.height;
    canvas.width  = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    const bw = 130, bh = 70;
    const gap = (W - bw * 3) / 4;
    const by  = (H - bh) / 2;

    const p1x = gap;
    const p2x = gap * 2 + bw;
    const p3x = gap * 3 + bw * 2;

    /* Boxes */
    box(ctx, p1x, by, bw, bh, COLORS.panel,   'Solar panel', '12V · 100W');
    box(ctx, p2x, by, bw, bh, COLORS.battery, 'Battery',     '12V · 100Ah');
    box(ctx, p3x, by, bw, bh, COLORS.load,    'Load',        '12V · 60W');

    /* Arrows */
    const cy = by + bh / 2;
    arrow(ctx, p1x + bw, cy, p2x, cy, 'DC current');
    arrow(ctx, p2x + bw, cy, p3x, cy, 'DC output');

    /* Ground rails (top & bottom) */
    const top = by - 24, bot = by + bh + 24;
    const lx  = p1x + bw / 2, rx = p3x + bw / 2;

    ctx.strokeStyle = COLORS.wire;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(lx, by);    ctx.lineTo(lx, top);
    ctx.lineTo(rx, top);   ctx.lineTo(rx, by);
    ctx.moveTo(lx, by + bh); ctx.lineTo(lx, bot);
    ctx.lineTo(rx, bot);   ctx.lineTo(rx, by + bh);
    ctx.stroke();
    ctx.setLineDash([]);

    /* + / − labels */
    ctx.fillStyle    = COLORS.panel;
    ctx.font         = "500 11px system-ui, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', lx, top - 10);
    ctx.fillStyle = COLORS.subLabel;
    ctx.fillText('−', lx, bot + 10);
  }

  /* ── AC / inverter diagram ────────────────────────── */
  function drawAC(canvas) {
    canvas = canvas || document.getElementById('circuitCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W   = canvas.offsetWidth  || canvas.width;
    const H   = canvas.offsetHeight || canvas.height;
    canvas.width  = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    const bw = 110, bh = 70;
    const gap = (W - bw * 4) / 5;
    const by  = (H - bh) / 2;

    const positions = [
      { x: gap,             color: COLORS.panel,   label: 'Solar panel', sub: 'DC 12V' },
      { x: gap*2 + bw,     color: COLORS.battery, label: 'Battery',     sub: 'DC 12V' },
      { x: gap*3 + bw*2,   color: COLORS.load,    label: 'Inverter',    sub: 'DC→AC' },
      { x: gap*4 + bw*3,   color: '#854F0B',      label: 'AC load',     sub: '120/240V' },
    ];

    positions.forEach(p => box(ctx, p.x, by, bw, bh, p.color, p.label, p.sub));

    const cy = by + bh / 2;
    const labels = ['DC charge', 'DC in', 'AC out'];
    for (let i = 0; i < positions.length - 1; i++) {
      arrow(ctx,
        positions[i].x + bw, cy,
        positions[i + 1].x, cy,
        labels[i]
      );
    }

    /* AC sine wave hint */
    const wx = positions[3].x + bw / 2;
    const wy = by + bh + 18;
    ctx.strokeStyle = '#854F0B';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    for (let t = -40; t <= 40; t++) {
      const sx = wx + t;
      const sy = wy + Math.sin(t * 0.16) * 8;
      t === -40 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  /* ── Canvas controls wiring ───────────────────────── */
  function init() {
    const canvas   = document.getElementById('circuitCanvas');
    if (!canvas) return;

    /* Initial draw */
    drawDC(canvas);

    /* Handle responsive resize */
    const ro = new ResizeObserver(() => drawDC(canvas));
    ro.observe(canvas.parentElement);

    document.getElementById('canvasDC')?.addEventListener('click', () => {
      document.getElementById('canvasDC')?.classList.add('btn--amber');
      document.getElementById('canvasAC')?.classList.remove('btn--amber');
      drawDC(canvas);
    });

    document.getElementById('canvasAC')?.addEventListener('click', () => {
      document.getElementById('canvasAC')?.classList.add('btn--amber');
      document.getElementById('canvasDC')?.classList.remove('btn--amber');
      drawAC(canvas);
    });

    document.getElementById('canvasClear')?.addEventListener('click', () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('canvasDC')?.classList.remove('btn--amber');
      document.getElementById('canvasAC')?.classList.remove('btn--amber');
    });
  }

  /* Expose for app.js */
  window.drawDC = drawDC;
  window.drawAC = drawAC;

  document.addEventListener('DOMContentLoaded', init);
})();
