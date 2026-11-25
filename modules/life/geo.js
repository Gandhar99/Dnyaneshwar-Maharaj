// The map is drawn here as SVG from the recorded coordinates. Rivers and the Sahyadri line are hand-drawn, schematic and approximate.
import { lang } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';

export const BOUNDS = {
  all: { latMin: 17.4, latMax: 21.3, lonMin: 73.2, lonMax: 76.4 },
  route: { latMin: 17.5, latMax: 18.95, lonMin: 73.65, lonMax: 75.5 },
};
// [lat, lon] points, rough, from public general knowledge; labelled "schematic" wherever shown.
const RIVERS = [
  { id: 'godavari', mr: 'गोदावरी', en: 'Godavari', pts: [[19.93, 73.53], [20.0, 73.79], [19.95, 74.1], [19.9, 74.45], [19.75, 74.7], [19.55, 75.0], [19.48, 75.38], [19.4, 75.7], [19.15, 76.2], [19.0, 76.4]], at: 4 },
  { id: 'bhima', mr: 'भीमा', en: 'Bhima', pts: [[19.07, 73.55], [18.95, 73.8], [18.65, 74.06], [18.46, 74.58], [18.2, 75.0], [17.95, 75.2], [17.68, 75.33], [17.45, 75.8], [17.3, 76.3]], at: 5 },
  { id: 'indrayani', mr: 'इंद्रायणी', en: 'Indrayani', pts: [[18.75, 73.4], [18.73, 73.6], [18.72, 73.77], [18.677, 73.897], [18.67, 74.03]], at: 1 },
  { id: 'krishna', mr: 'कृष्णा', en: 'Krishna', pts: [[17.92, 73.65], [17.95, 73.85], [17.8, 74.0], [17.5, 74.15], [17.4, 74.2]], at: 2 },
];
const RIDGE = [[21.0, 73.7], [20.5, 73.65], [19.93, 73.5], [19.5, 73.6], [19.07, 73.55], [18.5, 73.5], [17.92, 73.65], [17.4, 73.7]];
const C = Math.cos(19.4 * Math.PI / 180);
const W = 460;

export function projector(b) {
  const k = W / ((b.lonMax - b.lonMin) * C);
  const H = Math.round((b.latMax - b.latMin) * k);
  return { W, H, x: (lon) => +((lon - b.lonMin) * C * k).toFixed(1), y: (lat) => +((b.latMax - lat) * k).toFixed(1) };
}
export const isHalt = (p) => /palkhi (return )?halt/i.test(p.role || '');

/** places: rows with latitude/longitude. opts: {view, marks: Map(place_id -> number), highlight, links, halts} */
export function drawMap(places, opts = {}) {
  const b = BOUNDS[opts.view || 'all'];
  const P = projector(b);
  const inside = (p) => p.latitude != null && p.longitude != null && p.latitude >= b.latMin && p.latitude <= b.latMax && p.longitude >= b.lonMin && p.longitude <= b.lonMax;
  const pts = places.filter(inside).map((p) => ({ p, x: P.x(p.longitude), y: P.y(p.latitude) }));
  const poly = (arr) => arr.map(([la, lo]) => `${P.x(lo)},${P.y(la)}`).join(' ');
  const mr = lang() === 'mr';
  const rivers = RIVERS.map((r) => {
    const [la, lo] = r.pts[r.at];
    return `<polyline class="river" points="${poly(r.pts)}"/><text class="rname" x="${P.x(lo) + 5}" y="${P.y(la) - 4}" lang="${mr ? 'mr' : 'en'}">${esc(mr ? r.mr : r.en)}</text>`;
  }).join('');
  // label placement: first free candidate around each point; larger points first
  const placed = [];
  const hit = (a, c) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;
  const order = [...pts].sort((a, c) => (isHalt(a.p) ? 1 : 0) - (isHalt(c.p) ? 1 : 0));
  pts.forEach((q) => placed.push({ x: q.x - 9, y: q.y - 9, w: 18, h: 18 }));
  const labels = new Map();
  order.forEach((q) => {
    const halt = isHalt(q.p);
    const fs = halt ? 12.5 : 14;
    const name = mr ? (q.p.name_mr || q.p.name) : q.p.name.replace(/\s*\(.*$/, '');
    const short = mr ? name.replace(/\s*\(.*$/, '') : name;
    const w = short.length * fs * (mr ? 0.62 : 0.55) + 4, h = fs + 3;
    const cands = [[10, 4, 'start'], [-10, 4, 'end'], [0, -11, 'middle'], [0, 20, 'middle'], [10, -9, 'start'], [-10, -9, 'end'], [10, 16, 'start'], [-10, 16, 'end'], [14, 4, 'start']];
    let best = null;
    for (const [dx, dy, a] of cands) {
      const bx = a === 'start' ? q.x + dx : a === 'end' ? q.x + dx - w : q.x - w / 2;
      const r = { x: bx, y: q.y + dy - h + 3, w, h };
      if (r.x < 2 || r.x + r.w > P.W - 2 || r.y < 2 || r.y + r.h > P.H - 2) continue;
      if (!placed.some((c) => hit(r, c))) { best = { dx, dy, a, r }; break; }
    }
    best ||= { dx: 10, dy: 4, a: 'start', r: { x: q.x + 10, y: q.y - 8, w, h } };
    placed.push(best.r);
    labels.set(q.p.place_id, { ...best, short, halt });
  });
  const marks = opts.marks || new Map();
  const dots = pts.map((q) => {
    const p = q.p, halt = isHalt(p) && !marks.size, ring = p.coordinate_precision === 'approximate';
    const L = labels.get(p.place_id);
    const r = marks.size ? 9 : halt ? 4.6 : 6.6;
    const nm = mr ? p.name_mr : p.name;
    const n = marks.get(p.place_id);
    const body = `<circle cx="${q.x}" cy="${q.y}" r="${r}" class="pt${ring ? ' ring' : ''}${halt ? ' halt' : ''}"/>` +
      (n ? `<text class="num" x="${q.x}" y="${q.y + 3.8}">${esc(String(n.join ? n.join(',') : n))}</text>` : '') +
      (opts.highlight === p.place_id ? `<circle cx="${q.x}" cy="${q.y}" r="${r + 6}" fill="none" stroke="var(--ink)" stroke-width="2"/>` : '');
    const lab = `<text class="lbl${halt ? ' halt' : ''}" x="${q.x + L.dx}" y="${q.y + L.dy}" text-anchor="${L.a}" lang="${mr ? 'mr' : 'en'}">${esc(L.short)}</text>`;
    const hitc = `<circle cx="${q.x}" cy="${q.y}" r="15" fill="transparent"/>`;
    return opts.links === false ? body + lab : `<a href="#/life/places/${esc(p.place_id)}" aria-label="${esc(nm)}"><title>${esc(nm)} · ${esc(p.place_id)}</title>${hitc}${body}${lab}</a>`;
  }).join('');
  const clip = `c${Math.random().toString(36).slice(2, 7)}`;
  // scale bar (one degree of latitude is about 111 km; x and y share one scale, so distances are true to scale) and north
  const km = opts.view === 'route' ? 25 : 50, sb = km / 111 * (P.H / (b.latMax - b.latMin));
  const scale = `<g class="scale" aria-hidden="true"><line x1="12" y1="${P.H - 14}" x2="${(12 + sb).toFixed(1)}" y2="${P.H - 14}" stroke="var(--ink-2)" stroke-width="2"/>` +
    `<line x1="12" y1="${P.H - 18}" x2="12" y2="${P.H - 10}" stroke="var(--ink-2)"/><line x1="${(12 + sb).toFixed(1)}" y1="${P.H - 18}" x2="${(12 + sb).toFixed(1)}" y2="${P.H - 10}" stroke="var(--ink-2)"/>` +
    `<text x="${(16 + sb).toFixed(1)}" y="${P.H - 10}" font-size="12" fill="var(--ink-2)">${mr ? km.toLocaleString('mr-IN') + ' कि.मी.' : km + ' km'}</text>` +
    `<text x="${P.W - 14}" y="20" font-size="13" text-anchor="middle" fill="var(--ink-2)">${mr ? 'उ' : 'N'}</text><path d="M${P.W - 14} 24 l-4 9 h8 z" fill="var(--ink-2)"/></g>`;
  return `<svg viewBox="0 0 ${P.W} ${P.H}" role="img" aria-label="${esc(opts.aria || '')}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${clip}"><rect width="${P.W}" height="${P.H}"/></clipPath></defs>
    <rect class="land" width="${P.W}" height="${P.H}"/>
    <g clip-path="url(#${clip})"><polyline class="ridge" points="${poly(RIDGE)}"/>${rivers}</g>
 ${scale}
    ${dots}<rect class="frame" width="${P.W}" height="${P.H}"/></svg>`;
}

export const legendSvg = {
  exact: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" class="pt" fill="var(--maroon)"/></svg>',
  approx: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="var(--paper-3)" stroke="var(--maroon)" stroke-width="2" stroke-dasharray="3 2"/></svg>',
  halt: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="var(--saffron)"/></svg>',
  river: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 11C5 3 9 14 15 5" fill="none" stroke="var(--focus)" stroke-width="2" opacity=".6"/></svg>',
  ridge: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8H15" stroke="var(--ink-3)" stroke-width="1.5" stroke-dasharray="2 4"/></svg>',
};
