// Search across all texts: #/search?q=<text>&s=gatha,short,dw01
// Tolerant of anusvara and vowel length (see assets/js/search-norm.js). Shards load on demand and are cached.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href, debounce } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { findHits, norm } from '../../assets/js/search-norm.js';
import { highlight, icon, wsCredit } from '../../assets/js/components.js';

const GROUPS = ['gatha', 'short', 'dw01'];
const MAX_PER_GROUP = 40;
const shardCache = new Map();   // file -> rows with normalised text

export const title = () => t('search.title');

export async function render(ctx) {
  const q = ctx.query.get('q') || '';
  const scopes = (ctx.query.get('s') || 'gatha,short').split(',').filter((x) => GROUPS.includes(x));
  ctx.el.innerHTML = `<div class="page">
    <h1 tabindex="-1">${esc(t('search.title'))}</h1>
    <form class="field" role="search" id="sform">${icon.search}<label class="vh" for="sq">${esc(t('search.label'))}</label>
      <input id="sq" name="q" type="search" lang="mr" value="${esc(q)}" placeholder="${esc(t('search.placeholder'))}" enterkeyhint="search" autocomplete="off"></form>
    <p class="small faint">${esc(t('search.hint'))}</p>
    <div class="filters" role="group" aria-label="${esc(t('search.scope'))}">
      ${GROUPS.map((g) => `<button type="button" class="seg" data-s="${g}" aria-pressed="${scopes.includes(g)}">${esc(t('search.scope.' + g))}</button>`).join('')}
    </div>
    <p class="small faint" id="snote">${scopes.includes('dw01') ? esc(t('search.dw01.note')) : ''}</p>
    <p class="small" id="sstatus" role="status" aria-live="polite"></p>
    <p><button type="button" class="btn" id="sstop" hidden>${esc(t('search.stop'))}</button></p>
    <div id="sresults"></div><div id="scredit"></div>
  </div>`;
  const $ = (s) => ctx.el.querySelector(s);
  const input = $('#sq'), status = $('#sstatus'), results = $('#sresults'), note = $('#snote'), stop = $('#sstop');
  const idx = await getJSON('search/index.json');
  const dwBytes = idx.shards.filter((x) => x.group === 'dw01').reduce((a, x) => a + (x.bytes || 0), 0);
  const dwNote = () => t('search.dw01.lazy', { mb: num((dwBytes / 1e6).toFixed(1)) });
  if (scopes.includes('dw01')) note.textContent = dwNote();
  let stopped = false;
  stop.addEventListener('click', () => { stopped = true; });
  const btns = [...ctx.el.querySelectorAll('[data-s]')];
  let run = 0;

  const go = async () => {
    const my = ++run;
    const query = input.value.trim();
    const sc = btns.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.s);
    history.replaceState(null, '', href('search', { q: query, s: sc.join(',') }));
    note.textContent = sc.includes('dw01') ? dwNote() : '';
    if (norm(query).replace(/\s/g, '').length < 2) { status.textContent = query ? t('search.short') : ''; results.innerHTML = ''; return; }
    const shards = idx.shards.filter((x) => sc.includes(x.group));
    const found = Object.fromEntries(GROUPS.map((g) => [g, []]));
    const nq = norm(query);
    const dwChapters = [...new Set(shards.filter((x) => x.group === 'dw01').map((x) => x.chapter))];
    const doneCh = new Set();
    stopped = false;
    stop.hidden = !sc.includes('dw01');
    let done = 0;
    for (const sh of shards) {
      if (my !== run) return;
      if (stopped) break;
      status.textContent = sh.group === 'dw01'
        ? t('search.dw01.progress', { done: num(doneCh.size), total: num(dwChapters.length) })
        : t('search.loading', { done: num(done), total: num(shards.length) });
      let rows = shardCache.get(sh.file);
      if (!rows) {
        rows = (await getJSON(sh.file)).map(([route, id, text, firstLineOnly]) => ({ route, id, text, fl: !!firstLineOnly, n: norm(text) }));
        shardCache.set(sh.file, rows);
      }
      if (my !== run) return;
      for (const r of rows) if (r.n.includes(nq)) found[sh.group].push(r);
      done++;
      if (sh.group === 'dw01' && !shards.some((x, i) => i >= done && x.chapter === sh.chapter)) doneCh.add(sh.chapter);
      paint(found, query, sc);
    }
    stop.hidden = true;
    if (my !== run) return;
    const total = Object.values(found).reduce((a, b) => a + b.length, 0);
    const partial = sc.includes('dw01') && doneCh.size < dwChapters.length
      ? ' ' + t('search.stopped', { list: [...doneCh].map((c) => num(c)).join(', ') || '–' }) : '';
    status.textContent = (total ? t('search.count', { n: num(total) }) : t('search.none')) + partial;
  };

  const paint = (found, query, sc) => {
    results.innerHTML = sc.map((g) => {
      const list = found[g];
      if (!list.length) return '';
      return `<section><h2>${esc(t('search.scope.' + g))} <small class="faint">(${num(list.length)})</small></h2><ul class="plist">${
        list.slice(0, MAX_PER_GROUP).map((r) => resultItem(r, query)).join('')}</ul>${
        list.length > MAX_PER_GROUP ? `<p class="small faint">${esc(t('search.count', { n: num(list.length) }))}; ${num(MAX_PER_GROUP)} ${esc(t('of'))}…</p>` : ''}</section>`;
    }).join('');
    const ids = sc.flatMap((g) => found[g].slice(0, MAX_PER_GROUP).map((r) => r.id));
    wsCredit(ids).then((h) => { const c = document.getElementById('scredit'); if (c) c.innerHTML = h; });
  };

  $('#sform').addEventListener('submit', (e) => { e.preventDefault(); go(); });
  input.addEventListener('input', debounce(go, 350));
  btns.forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); go(); }));
  ctx.after = () => { if (q) go(); else input.focus(); };
}

function resultItem(r, q) {
  const lines = r.text.split('\n');
  // show the line that holds the first hit, plus the next one
  let k = lines.findIndex((l) => findHits(l, q, 1).length);
  if (k < 0) k = 0;
  const snippet = lines.slice(k, k + 2).join('\n');
  const hits = findHits(snippet, q, 5);
  const [kind, a, b] = r.route.split('/');
  let label;
  if (kind === 'dw01') label = `${t('work.DW01')} ${num(a)}.${num(b)}`;
  else if (kind === 'gatha') label = t('work.DW05');
  else {
    const w = { amritanubhav: 'DW02', 'changdev-pasashti': 'DW03', haripath: 'DW04' }[kind.split('?')[0]];
    label = w ? `${t('work.' + w)} ${num(String(a || '').split('?')[0])}` : r.id;
  }
  const to = kind === 'dw01' ? href(`texts/dnyaneshwari/${a}`, { seg: r.id })
    : kind === 'gatha' ? href('texts/gatha/' + a) : href('texts/' + r.route.split('?')[0].split('/')[0], { seg: r.id });
  return `<li><a class="pcard" href="${to}"><span class="fl" lang="mr" style="white-space:pre-line">${highlight(snippet, hits)}</span>` +
    `<span class="meta">${esc(label)}${r.fl ? ` · <span title="${esc(t('search.firstline'))}">${esc(t('search.incipit'))}</span>` : ''}</span></a></li>`;
}
