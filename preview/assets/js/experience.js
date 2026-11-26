// Experience kit (pass 2). Shared pieces for the experience layer: every experience module builds from these.
// Documented in EXPERIENCES.md ("The kit"). Pieces:
//   keep            one reader's conveniences on this device (localStorage with try/catch; never other people's data)
//   openSheet       a bottom sheet (side panel on wide screens) for any content; Escape and the scrim close it
//   mark(ev)        the quiet-honesty mark: one small dot in the status colour; tap opens the evidence sheet
//   pager           one screen per item: swipe, arrow keys, buttons, a progress thread; optional URL sync
//   reveal / revealLines   slow reveal on scroll, or line by line on arrival; reduced motion shows at once
//   journey         a vertical journey of stations that open in place, with forks for disputed points
//   voices          two voices facing each other (dialogues, what one saint says of another)
//   scene           a drawn SVG with tap targets that open a sheet
//   photo(slot)     a picture slot filled only by media/credits.json; a drawn placeholder until then
//   drawCard / shareCanvas   the abhanga card on a canvas (1080 x 1350), shared or saved
import { t, lang, registerLabels } from './i18n.js';
import { esc, num, href } from './util.js';
import { source, getJSON } from './data.js';
import { SITE_ROOT } from './util.js';

registerLabels('xk', {
  mr: {
    'how': 'हे आपल्याला कसे कळते', 'close': 'बंद करा', 'status': 'स्थिती', 'conf': 'पुष्टी', 'sources': 'स्रोत', 'rows': 'नोंदींचे क्रमांक',
    'prov': 'संशोधन चालू आहे; ही नोंद बदलू शकते.', 'workshop': 'कार्यशाळेत संपूर्ण नोंद पाहा', 'note': 'संशोधकांची टीप (इंग्रजीत)',
    'tier': 'दर्जा', 'read': 'प्रत्यक्ष काय वाचले', 'open': 'मूळ स्रोत उघडा', 'rights': 'हक्क',
    'prev': 'मागचे', 'next': 'पुढचे', 'of': '{i} / {n}', 'swipe': 'पुढे जाण्यासाठी डावीकडे सरकवा',
    'photo.wait': 'छायाचित्र लवकरच', 'photo.by': 'छायाचित्र:', 'open.station': 'उघडा', 'fork': 'येथे वाट दुभंगते: स्रोत एकमत नाहीत',
    'card.save': 'कार्ड जतन करा', 'card.share': 'कार्ड पाठवा', 'mark.label': 'या विधानाचा आधार पाहा',
  },
  en: {
    'how': 'How we know this', 'close': 'Close', 'status': 'Status', 'conf': 'Confirmation', 'sources': 'Sources', 'rows': 'Record ids',
    'prov': 'Research is ongoing; this record may change.', 'workshop': 'See the full record in the workshop', 'note': "Researchers' note",
    'tier': 'Tier', 'read': 'What was actually read', 'open': 'Open the source', 'rights': 'Rights',
    'prev': 'Previous', 'next': 'Next', 'of': '{i} of {n}', 'swipe': 'Swipe left to go on',
    'photo.wait': 'Photograph to come', 'photo.by': 'Photo:', 'open.station': 'Open', 'fork': 'The path forks here: the sources disagree',
    'card.save': 'Save the card', 'card.share': 'Send the card', 'mark.label': 'See what this rests on',
  },
});

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- keep: one reader's conveniences, on this device only ----------
export const keep = {
  get(k, d = null) { try { const v = localStorage.getItem('dny.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('dny.' + k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem('dny.' + k); } catch { /* private mode */ } },
};

// ---------- sheet ----------
let sheetEl, lastFocus, onCloseCb;
function ensureSheet() {
  if (sheetEl) return sheetEl;
  sheetEl = document.createElement('div');
  sheetEl.className = 'xsheet';
  sheetEl.innerHTML = '<div class="scrim" data-xclose></div><div class="panel" role="dialog" aria-modal="true" aria-labelledby="xsheet-t" tabindex="-1"></div>';
  document.body.appendChild(sheetEl);
  sheetEl.addEventListener('click', (e) => { if (e.target.closest('[data-xclose]')) closeSheet(); });
  document.addEventListener('keydown', (e) => {
    if (!sheetEl.classList.contains('open')) return;
    if (e.key === 'Escape') { e.stopPropagation(); closeSheet(); }
    if (e.key === 'Tab') {
      const f = [...sheetEl.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
  window.addEventListener('hashchange', () => closeSheet(false));
  return sheetEl;
}
/** Open a sheet. title: plain text; html: body (already escaped). Returns the panel element. */
export function openSheet({ title = '', html = '', titleLang, onClose } = {}) {
  const s = ensureSheet();
  lastFocus = document.activeElement;
  onCloseCb = onClose;
  const p = s.querySelector('.panel');
  p.innerHTML = `<div class="grip" aria-hidden="true"></div><div class="xs-head"><h2 id="xsheet-t"${titleLang ? ` lang="${titleLang}"` : ''}>${esc(title)}</h2>` +
    `<button type="button" class="tbtn icon" data-xclose aria-label="${esc(t('xk.close'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>` +
    `<div class="xs-body">${html}</div>`;
  s.classList.add('open');
  document.documentElement.classList.add('xsheet-open');
  p.scrollTop = 0;
  p.focus({ preventScroll: true });
  return p;
}
export function closeSheet(refocus = true) {
  if (!sheetEl || !sheetEl.classList.contains('open')) return;
  sheetEl.classList.remove('open');
  document.documentElement.classList.remove('xsheet-open');
  if (refocus && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  const cb = onCloseCb; onCloseCb = null; cb?.();
}

// ---------- quiet honesty: the mark and the evidence sheet ----------
// ev = { cs, conf, by:[ids], prov, src:'S043; S052' | [ids], srcObjs:[{id,title,url,tier,read,rights}], rows:[ids],
//        note:'English research prose', noteMr:'hand-written Marathi gloss (optional)', lic:'html line', link:'route', what:'short label' }
const evReg = new Map();
let evSeq = 0;
window.addEventListener('hashchange', () => evReg.clear());
const csKey = (cs) => 'cs-' + String(cs || 'none').toLowerCase().replace(/\s+/g, '-');

/** The mark: one small button after a statement. `what` names the statement for screen readers. */
export function mark(ev, { what } = {}) {
  const id = 'e' + (++evSeq);
  evReg.set(id, ev);
  const label = `${t('xk.mark.label')}${what || ev.what ? ': ' + (what || ev.what) : ''}${ev.cs ? ' (' + t('cs.' + ev.cs) + ')' : ''}`;
  return `<button type="button" class="evm ${csKey(ev.cs)}" data-ev="${id}" aria-haspopup="dialog" aria-label="${esc(label)}"><i aria-hidden="true"></i></button>`;
}

async function evidenceHtml(ev) {
  const parts = [];
  if (ev.cs) {
    parts.push(`<div class="ev-row"><span class="ev-dot ${csKey(ev.cs)}" aria-hidden="true"></span><div><p class="ev-k">${esc(t('xk.status'))}</p>` +
      `<p class="ev-v">${esc(t('cs.' + ev.cs))}</p><p class="ev-d">${esc(t('cs.title.' + ev.cs))}</p></div></div>`);
  }
  if (ev.conf) {
    const n = ev.conf === 'confirmed' ? 3 : ev.conf === 'two sources' ? 2 : 1;
    parts.push(`<div class="ev-row"><span class="ev-conf" aria-hidden="true">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>` +
      `<div><p class="ev-k">${esc(t('xk.conf'))}</p><p class="ev-v">${esc(t('conf.' + ev.conf))}</p>` +
      (ev.by?.length ? `<p class="ev-d">${ev.by.map((b) => `<button type="button" class="chip" data-src="${esc(b)}">${esc(b)}</button>`).join(' ')}</p>` : '') + `</div></div>`);
  }
  if (ev.noteMr) parts.push(`<p class="ev-mr" lang="mr">${esc(ev.noteMr)}</p>`);
  const ids = Array.isArray(ev.src) ? ev.src : String(ev.src || '').split(/[;,]\s*/).map((s) => s.trim()).filter(Boolean);
  const srcs = [];
  for (const id of ids) {
    const s = await source(id).catch(() => null);
    srcs.push(s ? { id, title: s.title, url: s.url, tier: s.quality_tier || s.baseline_tier, read: s.read_depth || s.review_depth, author: s.author, year: s.year } : { id });
  }
  for (const s of ev.srcObjs || []) srcs.push(s);
  if (srcs.length) {
    parts.push(`<h3 class="ev-h">${esc(t('xk.sources'))}</h3><ul class="ev-src">` + srcs.map((s) =>
      `<li><p class="ev-st" lang="${/[ऀ-ॿ]/.test(s.title || '') ? 'mr' : 'en'}">${esc(s.title || s.id)}</p>` +
      `<p class="ev-d">${esc(s.id)}${s.author ? ', ' + esc(s.author) : ''}${s.year ? ', ' + esc(s.year) : ''}${s.tier ? `; ${esc(t('xk.tier'))} ${esc(s.tier)}` : ''}</p>` +
      (s.read ? `<p class="ev-d"><span>${esc(t('xk.read'))}:</span> <span lang="en">${esc(s.read)}</span></p>` : '') +
      (s.rights ? `<p class="ev-d"><span>${esc(t('xk.rights'))}:</span> <span lang="en">${esc(s.rights)}</span></p>` : '') +
      (s.url ? `<p class="ev-d"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('xk.open'))}</a></p>` : '') + `</li>`).join('') + `</ul>`);
  }
  if (ev.lic) parts.push(`<p class="ev-d">${ev.lic}</p>`);
  if (ev.note) {
    const notes = Array.isArray(ev.note) ? ev.note : [ev.note];
    parts.push(`<h3 class="ev-h">${esc(t('xk.note'))}</h3>` + notes.map((n) => `<p class="ev-note" lang="en">${esc(n)}</p>`).join(''));
  }
  if (ev.prov !== false) parts.push(`<p class="ev-d ev-prov">${esc(t('xk.prov'))}</p>`);
  if (ev.rows?.length) parts.push(`<p class="ev-d">${esc(t('xk.rows'))}: <span class="ev-ids">${ev.rows.map((r) => `<code>${esc(r)}</code>`).join(' ')}</span></p>`);
  if (ev.link) parts.push(`<p><a class="btn" href="${esc(ev.link.startsWith('#') ? ev.link : '#/' + ev.link)}">${esc(t('xk.workshop'))}</a></p>`);
  return parts.join('');
}
/** Open the evidence sheet for an ev object directly (also used by scene targets). */
export async function openEvidence(ev) {
  openSheet({ title: t('xk.how'), html: `<p class="loading">${esc(t('loading'))}</p>` });
  const html = await evidenceHtml(ev);
  const p = sheetEl.querySelector('.xs-body');
  if (p) p.innerHTML = html;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ev]');
  if (!b) return;
  const ev = evReg.get(b.dataset.ev);
  if (ev) { e.preventDefault(); openEvidence(ev); }
});

// ---------- pager ----------
/**
 * pager(host, { count, render(i) -> html, start, onChange(i), label, keys: 'page'|'focus', swipe: true })
 * One screen at a time. Next: swipe left, →, PageDown, the next button. Returns { go(i), index, el }.
 * render(i) may return a Promise. The host is emptied. Screens get class "pg-screen"; a thin thread shows progress.
 */
export function pager(host, opts) {
  const o = { start: 0, keys: 'page', swipe: true, ...opts };
  let i = Math.max(0, Math.min(o.count - 1, o.start | 0));
  host.innerHTML = `<section class="pg" aria-roledescription="carousel" aria-label="${esc(o.label || '')}">` +
    `<div class="pg-thread" aria-hidden="true"><i></i></div><div class="pg-stage" aria-live="polite"></div>` +
    `<div class="pg-nav"><button type="button" class="pg-b prev" aria-label="${esc(t('xk.prev'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` +
    `<span class="pg-of"></span><button type="button" class="pg-b next" aria-label="${esc(t('xk.next'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></section>`;
  const root = host.querySelector('.pg'), stage = root.querySelector('.pg-stage');
  const of = root.querySelector('.pg-of'), bar = root.querySelector('.pg-thread i');
  const prevB = root.querySelector('.prev'), nextB = root.querySelector('.next');
  let busy = 0;
  async function show(k, dir = 0) {
    const my = ++busy;
    const html = await o.render(k);
    if (my !== busy) return;
    const sc = document.createElement('div');
    sc.className = 'pg-screen';
    sc.setAttribute('role', 'group');
    sc.setAttribute('aria-roledescription', 'slide');
    sc.setAttribute('aria-label', t('xk.of', { i: num(k + 1), n: num(o.count) }));
    sc.innerHTML = html;
    if (dir && !reducedMotion()) sc.classList.add(dir > 0 ? 'in-r' : 'in-l');
    stage.replaceChildren(sc);
    // after a turn, the new screen starts at its top (long poems otherwise leave the reader mid-page)
    if (dir && root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    i = k;
    of.textContent = t('xk.of', { i: num(k + 1), n: num(o.count) });
    bar.style.setProperty('--p', o.count > 1 ? (k / (o.count - 1)) : 1);
    prevB.disabled = k === 0 && !o.onBefore;
    nextB.disabled = k === o.count - 1 && !o.onAfter;
    o.onChange?.(k, sc);
  }
  const go = (k) => {
    if (k < 0) { if (o.onBefore) o.onBefore(); return; }
    if (k >= o.count) { if (o.onAfter) o.onAfter(); return; }
    if (k !== i) show(k, k > i ? 1 : -1);
  };
  prevB.addEventListener('click', () => go(i - 1));
  nextB.addEventListener('click', () => go(i + 1));
  if (o.swipe) {
    let x0 = null, y0 = 0, id = null;
    stage.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; id = e.pointerId; });
    stage.addEventListener('pointerup', (e) => {
      if (x0 === null || e.pointerId !== id) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > 1.4 * Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => { x0 = null; });
  }
  const onKey = (e) => {
    if (!root.isConnected) { document.removeEventListener('keydown', onKey); return; }
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.documentElement.classList.contains('xsheet-open') || document.getElementById('sheet')?.classList.contains('open')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (o.keys === 'focus' && !root.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1); }
  };
  if (o.keys) document.addEventListener('keydown', onKey);
  show(i);
  return { go, get index() { return i; }, el: root, refresh: () => show(i) };
}

// ---------- slow reveal ----------
/** Elements matching sel inside root fade in as they scroll into view (class "in"). */
export function reveal(root, sel = '.rv') {
  const els = [...root.querySelectorAll(sel)];
  if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
    { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}
/** Lines (sel) inside el appear one after another; a tap or key shows the rest at once. Resolves when all are shown. */
export function revealLines(el, { sel = '.rl', first = 350, gap = 900 } = {}) {
  const ls = [...el.querySelectorAll(sel)];
  return new Promise((res) => {
    if (reducedMotion()) { ls.forEach((l) => l.classList.add('in')); res(); return; }
    let k = 0, timer;
    const all = () => { clearTimeout(timer); ls.forEach((l) => l.classList.add('in')); el.removeEventListener('click', all); res(); };
    const step = () => { if (k >= ls.length) { all(); return; } ls[k++].classList.add('in'); timer = setTimeout(step, gap); };
    el.addEventListener('click', all);
    timer = setTimeout(step, first);
  });
}

// ---------- journey ----------
/**
 * journey(stations, { label }) -> html. Each station: { id, title, when, mark (html from mark()), body (html),
 *   fork: { note, paths:[{ title, body, mark }] } }. A fork draws the path splitting in two for a disputed point.
 * Call attachJourney(root) after render: opens stations in place and draws the path as the reader scrolls.
 */
export function journey(stations, { label = '' } = {}) {
  return `<ol class="jr" aria-label="${esc(label)}"><svg class="jr-line" aria-hidden="true" preserveAspectRatio="none"><path/></svg>` +
    stations.map((s) => `<li class="st${s.fork ? ' fork' : ''}" id="st-${esc(s.id)}">` +
      `<button type="button" class="st-h" aria-expanded="false" aria-controls="stb-${esc(s.id)}"><span class="st-dot" aria-hidden="true"></span>` +
      `<span class="st-t">${s.title}</span>${s.when ? `<span class="st-w">${s.when}</span>` : ''}</button>${s.mark || ''}` +
      `<div class="st-b" id="stb-${esc(s.id)}" hidden>${s.body || ''}` +
      (s.fork ? `<p class="st-fk">${esc(s.fork.note || t('xk.fork'))}</p><div class="st-paths">${s.fork.paths.map((p) =>
        `<div class="st-path"><p class="st-pt">${p.title}${p.mark || ''}</p>${p.body || ''}</div>`).join('')}</div>` : '') +
      `</div></li>`).join('') + `</ol>`;
}
export function attachJourney(root, { onOpen } = {}) {
  root.querySelectorAll('.jr').forEach((jr) => {
    jr.addEventListener('click', (e) => {
      const h = e.target.closest('.st-h');
      if (!h || !jr.contains(h)) return;
      const open = h.getAttribute('aria-expanded') !== 'true';
      h.setAttribute('aria-expanded', String(open));
      const b = document.getElementById(h.getAttribute('aria-controls'));
      b.hidden = !open;
      h.closest('.st').classList.toggle('open', open);
      if (open) onOpen?.(h.closest('.st').id.slice(3), b);
      draw();
    });
    const svg = jr.querySelector('.jr-line'), path = svg.querySelector('path');
    function draw() {
      const r = jr.getBoundingClientRect();
      const dots = [...jr.querySelectorAll(':scope > .st > .st-h .st-dot')].map((d) => { const q = d.getBoundingClientRect(); return [q.left + q.width / 2 - r.left, q.top + q.height / 2 - r.top]; });
      if (!dots.length) return;
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      svg.style.height = r.height + 'px';
      let d = `M${dots[0][0]} 0`;
      dots.forEach(([x, y], k) => { const py = k ? dots[k - 1][1] : 0; const my = (py + y) / 2; d += ` C${x + 14} ${my} ${x - 14} ${my} ${x} ${y}`; });
      d += ` L${dots.at(-1)[0]} ${r.height}`;
      path.setAttribute('d', d);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      progress();
    }
    function progress() {
      const r = jr.getBoundingClientRect();
      const seen = Math.max(0, Math.min(1, (innerHeight * 0.8 - r.top) / r.height));
      const len = parseFloat(path.style.strokeDasharray) || 0;
      path.style.strokeDashoffset = reducedMotion() ? 0 : len * (1 - seen);
    }
    requestAnimationFrame(draw);
    addEventListener('resize', draw, { passive: true });
    addEventListener('scroll', progress, { passive: true });
  });
}

// ---------- facing voices ----------
/** items: [{ who, side: 'a'|'b', html, mark, lang }] -> two voices answering each other. */
export function voices(items, { label = '' } = {}) {
  return `<div class="vx" role="list" aria-label="${esc(label)}">` + items.map((v) =>
    `<div class="v ${v.side === 'b' ? 'b' : 'a'}" role="listitem"><p class="who">${esc(v.who)}${v.mark || ''}</p>` +
    `<div class="say" lang="${v.lang || 'mr'}">${v.html}</div></div>`).join('') + `</div>`;
}

// ---------- scene with tap targets ----------
/**
 * scene({ svg, targets:[{ id, x, y, label }], label }) -> html; x and y are percentages of the drawing.
 * attachScene(root, open) : open(id) -> Promise<{ title, html }> shown in a sheet.
 */
export function scene({ svg, targets, label = '', ratio = '4 / 5' }) {
  return `<figure class="scn" style="aspect-ratio:${ratio}" aria-label="${esc(label)}">${svg}` +
    targets.map((g) => `<button type="button" class="scn-t" data-scn="${esc(g.id)}" style="left:${g.x}%;top:${g.y}%"><span class="scn-d" aria-hidden="true"></span><span class="scn-l">${esc(g.label)}</span></button>`).join('') +
    `</figure>`;
}
export function attachScene(root, open) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-scn]');
    if (!b) return;
    const r = await open(b.dataset.scn);
    if (r) openSheet({ title: r.title, html: r.html, titleLang: r.lang });
  });
}

// ---------- photo slots ----------
// A slot is filled only by media/photos.json (placed by the lead): one object per photo with slot, file (1280 px),
// small (560 px), w, h, caption_mr, caption_en, author, licence, licence_url, source_page, changes. Every picture shows
// its caption and the credit "author, licence" under it, linked to the Commons page (CC BY and CC BY-SA require it).
// A slot that photos.json does not know shows a drawn placeholder: no photograph is invented. Never a picture of the saint.
const DRAWN = {
  river: '<path d="M0 70 C40 62 70 78 110 70 S170 60 200 68" /><path d="M0 82 C40 76 80 90 120 82 S175 74 200 80" opacity=".6"/><path d="M20 58 l10 -22 10 22 M28 36 v-6 l8 3 -8 3" />',
  temple: '<path d="M70 86 V56 h60 v30 M80 56 l20 -26 20 26 M100 30 v-8 l10 4 -10 4" /><path d="M0 86 H200" /><path d="M0 94 C50 90 120 98 200 92" opacity=".6"/>',
  tree: '<path d="M100 88 V52 M100 60 C80 54 70 40 76 30 M100 56 C120 50 132 38 124 28 M100 52 C96 38 104 26 100 16" /><path d="M60 30 C70 12 130 12 140 30 C160 34 150 54 130 52 C120 60 80 60 70 52 C50 54 42 34 60 30Z" opacity=".55"/><path d="M0 88 H200" />',
  road: '<path d="M60 96 L96 40 M140 96 L104 40" /><path d="M100 90 v-6 M100 76 v-6 M100 62 v-5 M100 50 v-4" opacity=".6"/><path d="M0 40 H200" opacity=".5"/><path d="M150 40 v-16 l10 4 -10 4" />',
};
let photosP = null, photoMap = null;
const bare = (f) => (f ? String(f).replace(/^(\.\/)?media\//, '') : f);
/** Load media/photos.json once (started at import, so most pages render pictures in their first paint). */
export function photosReady() {
  return (photosP ||= fetch(new URL('media/photos.json', SITE_ROOT)).then((r) => (r.ok ? r.json() : [])).catch(() => [])
    .then((list) => (photoMap = new Map((Array.isArray(list) ? list : []).map((p) => [p.slot,
      { ...p, file: bare(p.file), small: bare(p.small) }])))));   // paths may be given as media/x.jpg or x.jpg
}
photosReady();
export const photoMeta = (slot) => photoMap?.get(slot) || null;
/** The credit line for a photo: author, licence; linked to its Commons page and licence. */
export function photoCredit(m) {
  return `<span class="ph-credit"><a href="${esc(m.source_page)}" target="_blank" rel="noopener">${esc(m.author)}</a>, ` +
    `<a href="${esc(m.licence_url)}" target="_blank" rel="noopener">${esc(m.licence)}</a></span>`;
}
/**
 * photo(slot, { ratio, draw, caption, eager, sizes, cls }) -> <figure>. With a known slot: the small file first
 * (srcset lets wide screens take the large one), lazy, with width and height so nothing shifts; caption and credit under it.
 */
export function photo(slot, { ratio = '3 / 2', draw = 'river', caption = '', eager = false, sizes = '(min-width: 46rem) 40rem, 100vw', cls = '' } = {}) {
  const m = photoMeta(slot);
  if (m && (m.small || m.file)) {
    const cap = caption || (lang() === 'mr' ? m.caption_mr : m.caption_en) || m.caption_en || '';
    const srcset = [m.small ? `media/${m.small} 560w` : '', m.file ? `media/${m.file} ${m.w || 1280}w` : ''].filter(Boolean).join(', ');
    return `<figure class="photo filled ${cls}" data-slot="${esc(slot)}">` +
      `<img src="media/${esc(m.small || m.file)}" srcset="${esc(srcset)}" sizes="${esc(sizes)}" width="${m.w || 1280}" height="${m.h || 853}"` +
      ` alt="${esc(cap)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` +
      `<figcaption><span class="ph-cap"${lang() === 'mr' && m.caption_mr ? ' lang="mr"' : ' lang="en"'}>${esc(cap)}</span> ${photoCredit(m)}</figcaption></figure>`;
  }
  return `<figure class="photo ${cls}" data-slot="${esc(slot)}" style="aspect-ratio:${ratio}"><div class="ph-draw" role="img" aria-label="${esc(caption)}">` +
    `<svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${DRAWN[draw] || DRAWN.river}</g></svg>` +
    `<span class="ph-wait">${esc(t('xk.photo.wait'))}</span></div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}
/** Fill placeholders rendered before photos.json arrived. */
export async function fillPhotos(root) {
  await photosReady();
  root.querySelectorAll('figure.photo:not(.filled)[data-slot]').forEach((f) => {
    if (!photoMeta(f.dataset.slot)) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = photo(f.dataset.slot, { cls: [...f.classList].filter((c) => c !== 'photo').join(' ') });
    f.replaceWith(tmp.firstElementChild);
  });
}
/** All photos (for the credits page). */
export async function allPhotos() { await photosReady(); return [...photoMap.values()]; }

// ---------- share card ----------
/** May a gatha poem become a card? Cards travel on WhatsApp under the owner's name, so only text that agrees word for word
 *  across the editions (text quality A) goes on one. Wikisource ovis (Dnyaneshwari, Amritanubhav ch. 1, Changdev Pasashti)
 *  are always allowed; nothing else is (no B or C gatha text, no Namdev scan text). Offer the card link only when this is true. */
export const gathaCardOK = (q) => q === 'A';
export const CARD_W = 1080, CARD_H = 1350;
export const CARD_DESIGNS = ['leaf', 'lamp', 'river'];
const PAL = {
  leaf: { bg: '#F1E7D0', bg2: '#E9DCBF', ink: '#23190F', soft: '#6B5A45', acc: '#C8650A', rule: '#7C1D2A' },
  lamp: { bg: '#1B140E', bg2: '#231B14', ink: '#F2E6CC', soft: '#B8A684', acc: '#E89A3C', rule: '#5A4630' },
  river: { bg: '#EEF0E6', bg2: '#DCE3D6', ink: '#1E2A26', soft: '#4F625B', acc: '#C8650A', rule: '#3F6B6A' },
};
const FONT_T = '"Tiro Devanagari Marathi", "Noto Serif Devanagari", serif';
const FONT_U = 'Mukta, "Noto Sans Devanagari", sans-serif';

function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/), out = [];
  let cur = '';
  for (const w of words) {
    const tryS = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryS).width > maxW && cur) { out.push(cur); cur = w; } else cur = tryS;
  }
  if (cur) out.push(cur);
  return out;
}
/**
 * drawCard(canvas, { lines:[verse lines], head:'small line above', source:'line under', credit:'licence line', design })
 * Lines are set one charan per row where they fit; the size shrinks until everything fits the card.
 */
export async function drawCard(canvas, { lines, head = '', source = '', credit = '', design = 'leaf' }) {
  canvas.width = CARD_W; canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  try { await Promise.all([document.fonts.load(`64px ${FONT_T}`), document.fonts.load(`32px ${FONT_U}`), document.fonts.load(`600 32px ${FONT_U}`)]); } catch { /* fallback fonts */ }
  const P = PAL[design] || PAL.leaf;
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, CARD_W, CARD_H);
  const M = 110;
  // ornament per design (drawn here: no pictures of the saint)
  ctx.save();
  if (design === 'leaf') {
    ctx.fillStyle = P.bg2; roundRect(ctx, 54, 54, CARD_W - 108, CARD_H - 108, 26); ctx.fill();
    ctx.strokeStyle = P.rule; ctx.globalAlpha = .55; ctx.lineWidth = 2; roundRect(ctx, 76, 76, CARD_W - 152, CARD_H - 152, 16); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = P.bg; ctx.beginPath(); ctx.arc(CARD_W / 2, 112, 11, 0, 7); ctx.fill();
    ctx.strokeStyle = P.rule; ctx.globalAlpha = .5; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (design === 'lamp') {
    const g = ctx.createRadialGradient(CARD_W / 2, 210, 10, CARD_W / 2, 210, 520);
    g.addColorStop(0, 'rgba(232,154,60,.22)'); g.addColorStop(1, 'rgba(232,154,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CARD_W, CARD_H);
    // a samai's flame and bowl
    ctx.translate(CARD_W / 2, 210);
    ctx.fillStyle = P.acc; ctx.beginPath(); ctx.moveTo(0, -62); ctx.bezierCurveTo(26, -26, 22, 4, 0, 10); ctx.bezierCurveTo(-22, 4, -26, -26, 0, -62); ctx.fill();
    ctx.fillStyle = '#F6D79A'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(10, -12, 9, 2, 0, 6); ctx.bezierCurveTo(-9, 2, -10, -12, 0, -30); ctx.fill();
    ctx.strokeStyle = P.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-70, 22); ctx.quadraticCurveTo(0, 62, 70, 22); ctx.stroke();
  } else {
    ctx.strokeStyle = P.rule; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      ctx.globalAlpha = .55 - k * .1; ctx.beginPath();
      const y = CARD_H - 250 + k * 34;
      ctx.moveTo(M - 30, y);
      for (let x = M - 30; x <= CARD_W - M + 30; x += 90) ctx.quadraticCurveTo(x + 22, y - 12 + (k % 2) * 6, x + 45, y), ctx.quadraticCurveTo(x + 68, y + 12, x + 90, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = P.acc; ctx.fillRect(M, 150, 6, 64);
  }
  ctx.restore();
  // pataka mark at the foot
  const flag = (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.strokeStyle = P.soft; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46 * s); ctx.stroke();
    ctx.fillStyle = P.acc; ctx.beginPath(); ctx.moveTo(2, 2); ctx.lineTo(30 * s, 11 * s); ctx.lineTo(2, 20 * s); ctx.closePath(); ctx.fill(); ctx.restore(); };
  // verse: one charan per row when it fits
  const rows = [];
  for (const l of lines) {
    const halves = l.split(/(?<=[।|])\s+/).map((h) => h.trim()).filter(Boolean);
    halves.forEach((h, k) => rows.push({ s: h.replace(/\s+([।॥|])/g, ' $1'), cont: k > 0 }));
    rows.push({ gap: true });
  }
  rows.pop();
  const topY = design === 'lamp' ? 330 : design === 'leaf' ? 190 : 270;
  const footH = 300;
  const availH = CARD_H - topY - footH - (head ? 70 : 0);
  const left = design === 'river' ? M : M + 10;
  const maxW = CARD_W - left - M - (design === 'river' ? 0 : 10);
  let size = 76, laid;
  for (; size >= 30; size -= 2) {
    ctx.font = `${size}px ${FONT_T}`;
    laid = [];
    for (const r of rows) {
      if (r.gap) { laid.push({ gap: true }); continue; }
      const parts = wrap(ctx, r.s, maxW - (r.cont ? size * 1.1 : 0));
      parts.forEach((p, k) => laid.push({ s: p, ind: r.cont || k > 0 }));
    }
    const h = laid.reduce((a, r) => a + (r.gap ? size * .7 : size * 1.62), 0);
    if (h <= availH) break;
  }
  ctx.textBaseline = 'alphabetic';
  let y = topY + (head ? 70 : 0);
  if (head) { ctx.font = `600 30px ${FONT_U}`; ctx.fillStyle = P.soft; ctx.textAlign = design === 'river' ? 'left' : 'center'; ctx.fillText(head, design === 'river' ? left : CARD_W / 2, topY + 10); }
  const totalH = laid.reduce((a, r) => a + (r.gap ? size * .7 : size * 1.62), 0);
  y += Math.max(0, (availH - totalH) / 2) + size;
  ctx.font = `${size}px ${FONT_T}`; ctx.fillStyle = P.ink; ctx.textAlign = 'left';
  const centre = design !== 'river';
  // a stanza is one left-aligned block; on centred designs the block as a whole is centred
  const blockW = Math.max(...laid.filter((r) => !r.gap).map((r) => ctx.measureText(r.s).width + (r.ind ? size * 1.1 : 0)));
  const x0 = centre ? Math.max(left, (CARD_W - blockW) / 2) : left;
  for (const r of laid) {
    if (r.gap) { y += size * .7; continue; }
    const x = x0 + (r.ind ? size * 1.1 : 0);
    ctx.fillText(r.s, x, y);
    y += size * 1.62;
  }
  // foot: the pataka, then source (up to two lines) and credit (one line)
  const centre2 = design !== 'river';
  flag(centre2 ? CARD_W / 2 - 12 : left, CARD_H - footH + 12, .9);
  const fy = CARD_H - footH + 112;
  ctx.textAlign = centre2 ? 'center' : 'left';
  const fx = centre2 ? CARD_W / 2 : left;
  ctx.fillStyle = P.soft; ctx.font = `32px ${FONT_U}`;
  wrap(ctx, source, CARD_W - 2 * M - 20).slice(0, 2).forEach((s, k) => ctx.fillText(s, fx, fy + k * 40));
  ctx.font = `26px ${FONT_U}`; ctx.globalAlpha = .85;
  ctx.fillText(wrap(ctx, credit, CARD_W - 2 * M - 20)[0] || '', fx, fy + 84);
  ctx.globalAlpha = 1;
  return canvas;
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/** Share the canvas as a PNG (Web Share with files) or download it. Returns 'shared' | 'saved' | 'cancelled'. */
export async function shareCanvas(canvas, { name = 'abhanga.png', text = '', prefer = 'share' } = {}) {
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], name, { type: 'image/png' });
  if (prefer === 'share' && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return 'shared'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'saved';
}
export const canShareFiles = () => { try { return !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }); } catch { return false; } };

// ---------- small helpers for experience pages ----------
/** Days from today (Asia/Kolkata) to an ISO date. */
export function daysTo(iso, todayIso) {
  return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(todayIso + 'T00:00:00Z')) / 86400000);
}
/** A link that reads as a quiet door: title and one line. */
export const door = (route, title, line, { cls = '' } = {}) =>
  `<a class="xdoor ${cls}" href="${esc(route.startsWith('#') ? route : href(route))}"><span class="xd-t">${esc(title)}</span><span class="xd-l">${esc(line)}</span></a>`;

/** Placeholder for an experience not yet built (replaced by its agent): says so and opens the archive page instead. */
export function soonPage(ctx, x, archive) {
  ctx.el.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('x.' + x))}</h1><p class="muted">${esc(t('x.' + x + '.d'))}</p>` +
    `<div class="stub"><strong>${esc(t('x.soon'))}</strong><p>${esc(t('x.soon.body'))}</p><p><a class="btn" href="#/${archive}">${esc(t('x.soon.go'))}</a></p></div></div>`;
}
