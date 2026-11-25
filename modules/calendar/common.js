// Helpers of the Calendar group.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, formatDate } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';

export const loadCal = () => getJSON('calendar.json');
export const loadPlaces = () => getJSON('places.json');
export const en = (s) => (s ? `<span lang="en">${esc(s)}</span>` : '');
export const isDev = (s) => { const x = String(s ?? ''); return /[\u0900-\u097F]/.test(x) && !/[A-Za-z]{3,}/.test(x); };
export const txt = (s) => (s ? `<span lang="${isDev(s) ? 'mr' : 'en'}">${esc(s)}</span>` : '');
export const enNote = () => (lang() === 'mr' ? `<p class="enonly" lang="mr">${esc(t('en.only'))}</p>` : '');
export const calCrumb = () => `<a href="#/calendar">${esc(t('g.calendar'))}</a>`;
export const crumbs = (...parts) => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / ${parts.join(' / ')}</p>`;
export const cssLink = () => '<link rel="stylesheet" href="modules/calendar/style.css">';
export const rowId = (id) => `<span class="rowid faint" title="${esc(t('cal.rowid'))}">${esc(id)}</span>`;
export const dayLong = (iso) => formatDate(iso);
export const dayShort = (iso) => formatDate(iso, lang(), { weekday: 'short', day: 'numeric', month: 'short' });
export const dayDate = (iso) => formatDate(iso, lang(), { day: 'numeric', month: 'long', year: 'numeric' });

export function kv(pairs) {
  const rows = pairs.filter(([, v]) => v !== undefined && v !== null && v !== '');
  return rows.length ? `<dl class="kv">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>` : '';
}
/** Fields stored as JSON text ('["A","B"]') or as arrays or as "A; B". */
export function ids(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (typeof x === 'string' && x.trim().startsWith('[')) { try { return JSON.parse(x); } catch { /* fall through */ } }
  return String(x).split(/[;,]\s*/).filter(Boolean);
}
export function placeMap(places) { return new Map(places.map((p) => [p.place_id, p])); }
/** Place name for a stage row: Marathi name when known, else the English name as data. */
export function stageName(pm, id, fallback) {
  const p = id && pm.get(id);
  if (lang() === 'mr' && p?.name_mr) return `<span lang="mr">${esc(p.name_mr.replace(/\s*\(.*$/, ''))}</span>`;
  return `<span lang="en">${esc(fallback || p?.name || '')}</span>`;
}
const MONTH = [['jyeshtha', /jyeshtha|ashadha/i], ['shravan', /shravan/i], ['kartik', /kartik/i]];
export const monthKey = (o) => (MONTH.find(([, r]) => r.test(o.month || '')) || ['other'])[0];
export const confKey = (c) => (c === 'confirmed' ? 'confirmed' : c === 'two sources' ? 'two' : 'single');
export const daysTo = (iso, today) => Math.round((Date.parse(iso + 'T00:00:00+05:30') - Date.parse(today + 'T00:00:00+05:30')) / 86400000);
