// Small shared helpers. No dependencies.
import { lang } from './i18n.js';

export const SITE_ROOT = new URL('../../', import.meta.url);   // works from any sub-path

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const DEV = '०१२३४५६७८९';
/** Number in the reader's numerals: Devanagari digits in Marathi mode. */
export function num(n, l = lang()) {
  const s = typeof n === 'number' ? n.toLocaleString(l === 'mr' ? 'en-IN' : 'en-IN') : String(n ?? '');
  return l === 'mr' ? s.replace(/[0-9]/g, (d) => DEV[d]) : s.replace(/[०-९]/g, (d) => String(DEV.indexOf(d)));
}
export const toAsciiDigits = (s) => String(s ?? '').replace(/[०-९]/g, (d) => String(DEV.indexOf(d)));

/** FNV-1a 32-bit hash (used for the daily abhanga; same result for everyone on a date). */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (const ch of new TextEncoder().encode(str)) { h ^= ch; h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/** Today's date as YYYY-MM-DD in India (Asia/Kolkata). */
export function todayIST(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function formatDate(iso, l = lang(), opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) {
  const d = new Date(iso + 'T12:00:00+05:30');
  const s = new Intl.DateTimeFormat(l === 'mr' ? 'mr-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', ...opts }).format(d);
  return l === 'mr' ? num(s, 'mr') : s;
}

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

/** Build query string for hash routes: href('texts/gatha', {q: 'x'}) -> '#/texts/gatha?q=x' */
export function href(path, query) {
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== '' && v != null)).toString() : '';
  return '#/' + path.replace(/^\/+/, '') + (qs ? '?' + qs : '');
}

/** Split received text into display lines (keeps dandas and inline numbers untouched). */
export function splitLines(text) {
  return String(text ?? '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
}

export function debounce(fn, ms = 200) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function slug(s) { return String(s ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
