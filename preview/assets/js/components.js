// Shared components. Each returns an HTML string (safe: every value is escaped) unless noted.
// Interactive parts (source chips, glossary words) work through one delegated click handler: initComponents().
import { t, lang } from './i18n.js';
import { esc, num, splitLines, href } from './util.js';
import { source, glossaryMap, getJSON } from './data.js';

// ---------- icons ----------
export const icon = {
  pataka: '<svg viewBox="0 0 16 26" aria-hidden="true"><line x1="2" y1="1" x2="2" y2="25.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.7 1.8 15 6.6 2.7 11.4Z" fill="var(--saffron)"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 11 12 4l8 7v9h-5v-5H9v5H4z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5c3-1 6-1 9 1 3-2 6-2 9-1v11c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 8.5v11"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>',
  sections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h9"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
  lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5c2 2.6 2.4 4.6 0 6.3-2.4-1.7-2-3.7 0-6.3z"/><path d="M5 13.5h14c-1 3-3.8 4.6-7 4.6s-6-1.6-7-4.6z"/><path d="M12 18v2.5M9 20.5h6"/></svg>',
  river: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 8c3-2 5 2 9 0s6 2 9 0"/><path d="M3 13c3-2 5 2 9 0s6 2 9 0"/><path d="M3 18c3-2 5 2 9 0s6 2 9 0"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
};

// ---------- honesty components ----------
const csClass = (cs) => 'cs-' + String(cs || '').toLowerCase().replace(/\s+/g, '-');

/** Claim-status badge. cs is one of the six statuses of the data standard. */
export function claimBadge(cs) {
  if (!cs) return '';
  return `<span class="badge ${csClass(cs)}" title="${esc(t('cs.title.' + cs))}">${esc(t('cs.' + cs))}</span>`;
}
/** "Provisional" marker; shown once per page or block, not on every line. */
export const provisional = (p = true) => (p ? `<span class="badge prov" title="${esc(t('provisional.title'))}">${esc(t('provisional'))}</span>` : '');

/** Confirmation mark for current facts: 'confirmed' | 'two sources' | 'single source'. */
export function confirmation(c, confirmedBy) {
  if (!c) return '';
  const n = c === 'confirmed' ? 3 : c === 'two sources' ? 2 : 1;
  const dots = [1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('');
  const by = Array.isArray(confirmedBy) ? confirmedBy.join(', ') : (confirmedBy || '');
  return `<span class="conf ${c === 'confirmed' ? 'confirmed' : ''}" title="${esc(by)}">${dots}<span>${esc(t('conf.' + c))}</span></span>`;
}

/** Text quality label A/B/C (from the gatha collation). */
export function quality(q, { long = true } = {}) {
  if (!q) return '';
  return `<span class="q q${esc(q)}" title="${esc(t('q.' + q))}"><b aria-hidden="true">${esc(t('q.letter.' + q))}</b>` +
    `<span>${long ? esc(t('q.' + q)) : `<span class="vh">${esc(t('q.label'))}: </span>${esc(t('q.' + q))}`}</span></span>`;
}

/** Source chip: tap to see the source's title, tier and read depth. Accepts "S043; DNYL-S01" too. */
export function sourceChips(ids) {
  const list = String(ids || '').split(/[;,]\s*/).map((s) => s.trim()).filter(Boolean);
  return list.map((id) => `<button type="button" class="chip" data-src="${esc(id)}" aria-haspopup="dialog">${esc(id)}</button>`).join(' ');
}

/** Badges row for any data row: claim status, provisional, confirmation, sources. */
export function honesty(row, { sources = true } = {}) {
  if (!row) return '';
  return `<div class="badges">${claimBadge(row.claim_status)}${row.confirmation ? confirmation(row.confirmation, row.confirmed_by) : ''}` +
    `${row.provisional ? provisional() : ''}${sources && row.source_id ? sourceChips(row.source_id) : ''}</div>`;
}

/** Wrap English-only data prose: marks lang="en" and, in Marathi mode, says so once per block. */
export function enText(text, { note = true, tag = 'p' } = {}) {
  if (!text) return '';
  const n = note && lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : '';
  return `${n}<${tag} lang="en">${esc(text)}</${tag}>`;
}

// ---------- verse block ----------
/** Render received text as verse lines. opts.glossary: Map from glossaryMap(), to underline known words.
 *  opts.size: '' | 'big' | 'small'. opts.hits: [[a,b]] ranges to highlight. opts.lang: 'mr' (default) or 'sa'. */
export function verseBlock(text, opts = {}) {
  const cls = ['verse', opts.size || ''].join(' ').trim();
  const body = splitLines(text).map((line) => {
    // one charan per line on phones, two on wide screens: break after a single danda, keep dandas with their word
    const halves = (opts.halves === false ? [line] : line.split(/(?<=।)\s+/)).map((h) => {
      const v = keepDandas(h);
      return `<span class="h">${opts.glossary ? glossed(v, opts.glossary) : esc(v)}</span>`;
    });
    const out = [];
    for (let i = 0; i < halves.length; i += 2) out.push(`<span class="ln${i ? ' cont' : ''}">${halves.slice(i, i + 2).join(' ')}</span>`);
    return out.join('');
  }).join('');
  return `<p class="${cls}" lang="${opts.lang || 'mr'}">${body}</p>`;
}

/** Non-breaking space before dandas, so a line never starts with । or ॥. */
export const keepDandas = (s) => String(s).replace(/\s+([।॥|])/g, '\u00A0$1');

function glossed(line, gmap) {
  // tokens are runs of Devanagari letters and marks; everything else is kept as is
  return line.split(/([ऀ-ॣॱ-ॿ‌‍]+)/).map((tok, i) => {
    if (i % 2 === 0) return esc(tok);
    const g = gmap.get(tok);
    return g ? `<button type="button" class="gl" data-gl="${esc(tok)}" aria-haspopup="dialog">${esc(tok)}</button>` : esc(tok);
  }).join('');
}

/** Highlight [[a,b]] ranges in plain text (escaped). */
export function highlight(text, hits) {
  let out = '', at = 0;
  for (const [a, b] of hits) { out += esc(text.slice(at, a)) + '<mark class="hit">' + esc(text.slice(a, b)) + '</mark>'; at = b; }
  return out + esc(text.slice(at));
}

// ---------- poem card (gatha list item) ----------
/** row: an item from gathaIndex().rows */
export function poemCard(row) {
  const wits = row.witnesses.map(([w, n]) => `${t('w.short.' + w)} ${num(n)}`).join(' · ');
  return `<li><a class="pcard" href="${href('texts/gatha/' + row.id)}">` +
    `<span class="fl" lang="mr">${esc(row.first_line)}</span>` +
    `<span class="meta">${quality(row.q, { long: false })}<span>${esc(wits)}</span>` +
    `${row.has_text ? '' : `<span>${esc(t('search.incipit'))}</span>`}</span></a></li>`;
}

// ---------- states ----------
/** Attribution for Wikisource lines shown outside the readers (CC BY-SA 4.0 asks for the page and the licence).
 *  segIds: the segment ids shown on the page. Returns '' when none of them comes from Wikisource. */
export async function wsCredit(segIds) {
  const docs = new Set();
  for (const id of segIds || []) {
    const m = /^(DNY\d\d)_/.exec(id) || /^(AMRW01|CP)_/.exec(id);
    if (m) docs.add(m[1]);
  }
  if (!docs.size) return '';
  const urls = new Map();
  const ix = await getJSON('texts/dnyaneshwari/index.json').catch(() => null);
  ix?.chapters.forEach((c) => c.documents.forEach((d) => urls.set(d.document_id, d)));
  if (docs.has('CP') || docs.has('AMRW01')) {
    const w = await getJSON('texts/works.json').catch(() => null);
    w?.documents.forEach((d) => { if (!urls.has(d.document_id)) urls.set(d.document_id, d); });
  }
  const links = [...docs].sort().map((id) => urls.get(id)).filter((d) => d && /wikisource\.org/.test(d.source_url || ''))
    .map((d) => `<a href="${esc(d.source_url)}" target="_blank" rel="noopener" lang="mr">${esc(String(d.title || d.document_id).replace(/\s*\([A-Za-z][^)]*\)\s*$/, ''))}</a>`);
  if (!links.length) return '';
  return `<p class="small faint">${esc(t('ws.credit'))} ${links.join(', ')} · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a></p>`;
}

export const loading = () => `<p class="loading" role="status">${esc(t('loading'))}</p>`;
export const errorBox = (e) => `<p class="err" role="alert">${esc(t('error.load'))} <small class="faint">${esc(e?.message || '')}</small></p>`;

/** Stub page used by groups not yet built. */
export function stubPage(group, extra = '') {
  return `<div class="page"><p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a></p>` +
    `<h1 tabindex="-1">${esc(t('g.' + group))}</h1><p class="muted">${esc(t('g.' + group + '.d'))}</p>` +
    `<div class="stub"><strong>${esc(t('stub.title'))}</strong><p>${esc(t('stub.body'))}</p></div>${extra}</div>`;
}

// ---------- popover (source chips, glossary words) ----------
let pop;
let popAnchor = null;
function closePop(refocus = false) { if (pop) { if (refocus && popAnchor?.isConnected) popAnchor.focus(); popAnchor = null; pop.remove(); pop = null; document.querySelectorAll('[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false')); } }
function openPop(anchor, html) {
  closePop();
  pop = document.createElement('div');
  pop.className = 'pop'; pop.setAttribute('role', 'dialog'); pop.tabIndex = -1;
  pop.innerHTML = html;
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - w - 8));
  pop.style.left = left + 'px';
  pop.style.top = (window.scrollY + r.bottom + 6) + 'px';
  anchor.setAttribute('aria-expanded', 'true');
  popAnchor = anchor;
  pop.focus({ preventScroll: true });
}

export function initComponents() {
  document.addEventListener('click', async (e) => {
    const src = e.target.closest('[data-src]');
    const gl = e.target.closest('[data-gl]');
    if (!src && !gl) { if (pop && !pop.contains(e.target)) closePop(); return; }
    e.preventDefault();
    if (src) {
      const s = await source(src.dataset.src).catch(() => null);
      openPop(src, s ? `<h4 lang="${/[ऀ-ॿ]/.test(s.title) ? 'mr' : 'en'}">${esc(s.title)}</h4>` +
        `<p class="faint">${esc(src.dataset.src)}${s.author ? ' · ' + esc(s.author) : ''}${s.year ? ' · ' + esc(s.year) : ''}</p>` +
        `<p>${esc(t('source.tier'))}: ${esc(s.quality_tier || s.baseline_tier || '–')}</p>` +
        (s.read_depth || s.review_depth ? `<p><span class="faint">${esc(t('source.read'))}:</span> <span lang="en">${esc(s.read_depth || s.review_depth)}</span></p>` : '') +
        (s.url ? `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('source.open'))}</a></p>` : '')
        : `<p>${esc(t('source.unknown'))}</p>`);
    } else {
      const g = (await glossaryMap()).get(gl.dataset.gl);
      if (!g) return;
      openPop(gl, `<h4 lang="mr">${esc(g.word)}${g.headword && g.headword !== g.word ? ` <small class="faint">(${esc(g.headword)})</small>` : ''}</h4>` +
        (g.mr ? `<p lang="mr">${esc(g.mr)}</p>` : '') + (g.en ? `<p lang="en" class="muted">${esc(g.en)}</p>` : '') +
        `<div class="badges">${claimBadge(g.cs)}</div><p class="faint" lang="en">${esc(g.basis || '')}</p>` +
        `<p><a href="${href('words/glossary/' + g.id)}">${esc(t('g.words'))}</a></p>`);
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(true); });
  window.addEventListener('hashchange', () => closePop());
}
