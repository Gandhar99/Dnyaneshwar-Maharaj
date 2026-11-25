// #/connections: the sant-mela ring (SVG) and the same information as a plain table.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { SAINTS } from './pre.js';
import { ORDER, slugOf, saintName, crumbs, shell, ruleNote } from './common.js';

const W = 360, H = 412, CX = 180, CY = 206, RX = 126, RY = 162;
// angles (degrees, 0 = right, clockwise): top, upper right, lower right, lower left, upper left
const ANGLES = { Nivruttinath: -90, Sopandev: -18, Muktabai: 54, Namdev: 126, Changdev: 198 };

function counts(name) {
  const inn = SAINTS.narrated[name]?.n ?? null;               // saint's poems that name him
  const out = SAINTS.named[name]?.segments ?? null;           // distinct lines of his texts that name the saint
  return { inn, out };
}
const sw = (n) => (n == null ? 1.2 : Math.min(7, 1.4 + Math.sqrt(n) / 4.5));
const fmt = (n) => (n == null ? '–' : num(n));

function ringSvg() {
  const parts = [];
  const nodes = ORDER.map((name) => {
    const a = ANGLES[name] * Math.PI / 180;
    return { name, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a };
  });
  const defs = `<defs>
    <marker id="cn-ai" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path class="arrow-in" d="M0 0 10 5 0 10z"/></marker>
    <marker id="cn-ao" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path class="arrow-out" d="M0 0 10 5 0 10z"/></marker></defs>`;
  // spokes first, so the nodes sit on top
  for (const n of nodes) {
    const { inn, out } = counts(n.name);
    const dx = n.x - CX, dy = n.y - CY, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
    const hw = 50, hh = 34;
    const clip = Math.min(hw / Math.max(Math.abs(ux), 1e-6), hh / Math.max(Math.abs(uy), 1e-6)) + 5;
    const a0 = 40, a1 = len - clip, off = 6;
    const line = (cls, from, to, o, w, mk) => `<line class="${cls}" x1="${(CX + ux * from + px * o).toFixed(1)}" y1="${(CY + uy * from + py * o).toFixed(1)}" x2="${(CX + ux * to + px * o).toFixed(1)}" y2="${(CY + uy * to + py * o).toFixed(1)}" stroke-width="${w}" ${mk ? `marker-end="url(#${mk})"` : ''}/>`;
    if (inn != null) parts.push(line('spoke-in', a1, a0, off, sw(inn), 'cn-ai'));            // from the saint to him
    if (out != null) parts.push(line('spoke-out', a0, a1, -off, sw(out), 'cn-ao'));         // from him to the saint
  }
  parts.push(`<circle class="centre" cx="${CX}" cy="${CY}" r="38"/><text class="centre-t" x="${CX}" y="${CY + 5}">${esc(saintName('Dnyaneshwar'))}</text>`);
  for (const n of nodes) {
    const { inn, out } = counts(n.name);
    const to = href('connections/' + slugOf(n.name));
    const x = n.x - 50, y = n.y - 34;
    parts.push(`<a href="${to}" tabindex="-1" aria-hidden="true">
      <rect class="node" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="100" height="68" rx="10"/>
      <text class="name" x="${n.x.toFixed(1)}" y="${(n.y - 8).toFixed(1)}"${/[ऀ-ॿ]/.test(saintName(n.name)) ? ' lang="mr"' : ''}>${esc(saintName(n.name))}</text>
      <rect class="pill-in" x="${(n.x - 47).toFixed(1)}" y="${(n.y + 6).toFixed(1)}" width="44" height="22" rx="11"/>
      <text class="num-in" x="${(n.x - 25).toFixed(1)}" y="${(n.y + 21.5).toFixed(1)}">${esc(fmt(inn))}</text>
      <rect class="pill-out" x="${(n.x + 3).toFixed(1)}" y="${(n.y + 6).toFixed(1)}" width="44" height="22" rx="11"/>
      <text class="num-out" x="${(n.x + 25).toFixed(1)}" y="${(n.y + 21.5).toFixed(1)}">${esc(fmt(out))}${n.name === 'Nivruttinath' ? '†' : ''}</text></a>`);
  }
  return `<svg class="ring" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('cn.ring.alt'))}" focusable="false">${defs}${parts.join('')}</svg>`;
}

export async function render(ctx) {
  const rows = ORDER.map((name) => {
    const { inn, out } = counts(name);
    const page = href('connections/' + slugOf(name));
    const cell = (n, list) => (n == null ? `<span class="faint">${esc(t('cn.tbl.none'))}</span>` : `<a class="cnt" href="${href('connections/' + slugOf(name), { list })}">${esc(num(n))}</a>${list === 'out' && name === 'Nivruttinath' ? ' †' : ''}`);
    return `<tr><th scope="row" class="s"><a href="${page}">${esc(saintName(name))}</a></th>
      <td class="n">${cell(inn, 'in')}</td><td class="n">${cell(out, 'out')}</td></tr>`;
  }).join('');
  const lg = (cls, d, key) => `<li><svg viewBox="0 0 38 12" aria-hidden="true"><line class="${cls}" x1="1" y1="6" x2="30" y2="6" stroke-width="3"/><path class="${cls === 'spoke-in' ? 'arrow-in' : 'arrow-out'}" d="M29 1.5 37 6 29 10.5z"/></svg><span>${esc(t(key))}</span></li>`;
  ctx.el.innerHTML = shell(`
    ${crumbs()}
    <h1 tabindex="-1">${esc(t('g.connections'))}</h1>
    <p class="muted">${esc(t('cn.lead'))}</p>
    ${ruleNote()}
    <p class="note">${esc(t('cn.ring.note'))}</p>
    <div class="ring-wrap">${ringSvg()}</div>
    <ul class="legend">${lg('spoke-in', '', 'cn.ring.legend.in')}${lg('spoke-out', '', 'cn.ring.legend.out')}</ul>
    <h2>${esc(t('cn.ring.title'))}</h2>
    <p class="small muted">${esc(t('cn.tbl.cap'))}</p>
    <div class="scroll-x"><table class="tbl cn-tbl"><thead><tr><th scope="col">${esc(t('cn.tbl.saint'))}</th><th scope="col" class="n">${esc(t('cn.tbl.in'))}</th><th scope="col" class="n">${esc(t('cn.tbl.out'))}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small faint">${esc(t('cn.tbl.units'))}</p>
    <p class="small faint">${esc(t('cn.dagger'))}</p>
    <h2>${esc(t('cn.more.pages'))}</h2>
    <ul class="doors">
      ${['dialogues', 'lineage', 'shared'].map((p) => `<li><a href="${href('connections/' + p)}"><span class="mark" aria-hidden="true"></span><span class="t">${esc(t('cn.p.' + p))}</span><span></span><span class="d">${esc(t('cn.p.' + p + '.d'))}</span></a></li>`).join('')}
    </ul>`);
}
