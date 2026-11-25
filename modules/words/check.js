// "Is this line in our collection?" (#/words/check). Answers only: found / close match / not found in this collection.
// Never says a line is or is not genuine.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { norm, findHits } from '../../assets/js/search-norm.js';
import { highlight, wsCredit } from '../../assets/js/components.js';

const shardCache = new Map();           // file -> rows [{route,id,text,n}]
const GROUPS = ['gatha', 'short', 'dw01'];
const tick = () => new Promise((r) => setTimeout(r, 0));

export async function render(ctx) {
  const [manifest, home] = await Promise.all([getJSON('manifest.json'), getJSON('home.json')]);
  const bytes = (g) => Object.entries(manifest.files).filter(([p]) => p.startsWith(`search/${g}-`)).reduce((s, [, v]) => s + (v.bytes || 0), 0);
  const sel = new Set(GROUPS);
  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/words/style.css"><div class="page m-words">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/words">${esc(t('g.words'))}</a></p>
    <h1 tabindex="-1">${esc(t('wd.ck.title'))}</h1>
    <p class="muted">${esc(t('wd.ck.lead'))}</p>
    <div class="note doubt"><strong>${esc(t('wd.ck.caveat.t'))}</strong><br>${esc(t('wd.ck.caveat', { pct: pctUnconfirmed(home) }))}</div>
    <form id="ckf" novalidate>
      <label for="ckt" class="small faint">${esc(t('wd.ck.input'))}</label>
      <textarea id="ckt" class="ck-ta" lang="mr" rows="3" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
      <fieldset class="ck-scope"><legend>${esc(t('wd.ck.scope'))}</legend>
        ${GROUPS.map((g) => `<label><input type="checkbox" name="g" value="${g}" checked> ${esc(t('wd.ck.scope.' + g))}</label>`).join('')}
      </fieldset>
      <p class="small faint" id="cksize"></p>
      <div class="ck-row"><button type="submit" class="btn">${esc(t('wd.ck.go'))}</button><button type="button" class="btn" id="ckclear">${esc(t('wd.ck.clear'))}</button></div>
    </form>
    <div id="ckout" aria-live="polite"></div>
    <details><summary>${esc(t('wd.ck.how.t'))}</summary><p class="small">${esc(t('wd.ck.how'))}</p></details>
  </div>`;
  const root = ctx.el.querySelector('.page');
  const $ = (s) => root.querySelector(s);
  const out = $('#ckout'), ta = $('#ckt');
  const size = () => {
    const need = [...sel].filter((g) => !shardCache.has(`search/${g}-1.json`));
    const b = need.reduce((s, g) => s + bytes(g), 0);
    $('#cksize').textContent = b ? t('wd.ck.size', { mb: num((b / 1e6).toFixed(1)) }) : '';
  };
  size();
  root.querySelectorAll('input[name=g]').forEach((c) => c.addEventListener('change', () => { c.checked ? sel.add(c.value) : sel.delete(c.value); size(); }));
  $('#ckclear').addEventListener('click', () => { ta.value = ''; out.innerHTML = ''; ta.focus(); });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#ckf').requestSubmit(); } });
  $('#ckf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = ta.value.trim();
    if (norm(raw).split(' ').filter(Boolean).length < 3) { out.innerHTML = `<p class="note doubt" role="alert">${esc(t('wd.ck.short'))}</p>`; return; }
    if (!sel.size) { out.innerHTML = `<p class="note doubt" role="alert">${esc(t('wd.ck.noscope'))}</p>`; return; }
    try { await run(raw, [...sel], out); size(); } catch (err) { out.innerHTML = `<p class="err" role="alert">${esc(t('error.load'))} <small class="faint">${esc(err.message)}</small></p>`; }
  });
}

async function loadRows(groups, out) {
  const ix = await getJSON('search/index.json');
  const shards = ix.shards.filter((s) => groups.includes(s.group));
  let done = 0;
  const rows = [];
  for (const sh of shards) {
    out.innerHTML = `<p class="ck-prog" role="status">${esc(t('wd.ck.loading', { done: num(done), total: num(shards.length) }))}</p>`;
    let r = shardCache.get(sh.file);
    if (!r) {
      r = (await getJSON(sh.file)).map(([route, id, text]) => ({ route, id, text, n: norm(text), g: sh.group }));
      shardCache.set(sh.file, r);
      await tick();
    }
    rows.push(...r);
    done++;
  }
  return rows;
}

/** Share of gatha words not confirmed by a second edition, from the export (home.json counts). */
const pctUnconfirmed = (home) => { const k = home?.counts?.gatha_tokens; return k?.token_count ? num(Math.round(100 * (k.unresolved_count + k.uncovered_count) / k.token_count)) : '–'; };

function within1(a, b) {                       // edit distance <= 1
  if (a === b) return true;
  const d = a.length - b.length;
  if (d > 1 || d < -1) return false;
  let i = 0, j = 0, miss = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++miss > 1) return false;
    if (d > 0) i++; else if (d < 0) j++; else { i++; j++; }
  }
  return miss + (a.length - i) + (b.length - j) <= 1;
}

function near(rows, q, qLines) {
  const qt = [...new Set(q.split(' ').filter(Boolean))];
  const need = Math.max(3, Math.ceil(qt.length * 0.7)), pre = Math.ceil(qt.length * 0.4);
  const sizes = [Math.min(4, Math.max(1, qLines)), Math.min(5, Math.max(1, qLines) + 1)];
  const res = [];
  for (const r of rows) {
    const lines = (r._l ??= r.text.split('\n').map((x) => ({ x, tk: norm(x).split(' ').filter(Boolean) })));
    let best = null;
    for (const sz of new Set(sizes)) {
      for (let i = 0; i < lines.length; i++) {
        const win = lines.slice(i, i + sz);
        const set = new Set(win.flatMap((l) => l.tk));
        let m = 0;
        const rest = [];
        for (const w of qt) set.has(w) ? m++ : rest.push(w);
        if (m < pre) continue;
        if (rest.length && m + rest.length >= need) {
          const toks = [...set];
          for (const w of rest) if (w.length >= 4 && toks.some((x) => within1(w, x))) m++;
        }
        if (m >= need && (!best || m > best.m)) best = { m, i, sz };
      }
    }
    if (best) res.push({ r, ...best, nq: qt.length });
  }
  return res.sort((a, b) => b.m - a.m || a.sz - b.sz).slice(0, 5);
}

const where = (r) => {
  const [kind, a, b] = r.route.split('/');
  if (kind === 'dw01') return { label: t('wd.ck.in.dw', { a: num(a), b: num(b) }), to: href(`texts/dnyaneshwari/${a}`, { seg: r.id }) };
  if (kind === 'gatha') return { label: `${t('wd.ck.in.gatha')} (${r.id.replace(/^DNYC-/, '')})`, to: href('texts/gatha/' + a) };
  const k = kind.split('?')[0];
  const w = { amritanubhav: 'DW02', 'changdev-pasashti': 'DW03', haripath: 'DW04' }[k];
  return { label: `${w ? t('work.' + w) : k} ${num(String(a || '').split('?')[0])}`, to: href('texts/' + k, { seg: r.id }) };
};

function hitHtml(r, snippet, hits) {
  const w = where(r);
  return `<a class="ck-hit" href="${w.to}"><span class="fl" lang="mr">${hits ? highlight(snippet, hits) : esc(snippet)}</span><span class="meta">${esc(w.label)} · ${esc(t('wd.ck.open'))}</span></a>`;
}

async function run(raw, groups, out) {
  const rows = await loadRows(groups, out);
  const q = norm(raw);
  const qLines = raw.split('\n').filter((l) => l.trim()).length;
  const home = await getJSON('home.json');

  const exact = rows.filter((r) => r.n.includes(q));
  let shown = [];
  let html = '', cls = 'nf', head = t('wd.ck.nf'), lead = t('wd.ck.nf.d');
  if (exact.length) {
    cls = 'found'; head = t('wd.ck.found'); lead = t('wd.ck.found.d', { n: num(exact.length) });
    shown = exact.slice(0, 10).map((r) => r.id);
    html = exact.slice(0, 10).map((r) => {
      const lines = r.text.split('\n');
      const h0 = findHits(r.text, raw, 1)[0];
      const at = h0 ? r.text.slice(0, h0[0]).split('\n').length - 1 : 0;
      const snip = lines.slice(at, at + Math.max(2, qLines)).join('\n');
      return hitHtml(r, snip, findHits(snip, raw, 6));
    }).join('') + (exact.length > 10 ? `<p class="small faint">${esc(t('wd.ck.more', { n: num(exact.length - 10) }))}</p>` : '');
  } else {
    await tick();
    const nr = near(rows, q, qLines);
    if (nr.length) {
      cls = 'near'; head = t('wd.ck.near'); lead = t('wd.ck.near.d'); shown = nr.map((x) => x.r.id);
      html = nr.map((x) => {
        const lines = x.r._l.slice(x.i, x.i + x.sz).map((l) => l.x);
        return `<div>${hitHtml(x.r, lines.join('\n'), null)}<p class="small faint">${esc(t('wd.ck.words', { a: num(x.nq), b: num(x.m) }))}</p></div>`;
      }).join('');
    }
  }
  const count = (g) => rows.filter((r) => r.g === g).length;
  const cov = [
    groups.includes('gatha') && t('wd.ck.cov.gatha', { n: num(count('gatha')), k: num(home.counts.gatha_with_text) }),
    groups.includes('short') && t('wd.ck.cov.short', { n: num(count('short')) }),
    groups.includes('dw01') && t('wd.ck.cov.dw01', { n: num(count('dw01')) }),
  ].filter(Boolean);
  const gathaHit = html.includes('texts/gatha');
  const credit = await wsCredit(shown);
  out.innerHTML = `<section class="ck-res ${cls}" aria-labelledby="ckh"><h2 id="ckh" tabindex="-1">${esc(head)}</h2><p>${esc(lead)}</p>${html}
      ${gathaHit ? `<p class="small faint">${esc(t('wd.ck.gatha.note'))}</p>` : ''}${credit}</section>
    <div class="note doubt"><strong>${esc(t('wd.ck.caveat.t'))}</strong><br>${esc(t('wd.ck.caveat', { pct: pctUnconfirmed(home) }))}</div>
    <h2 class="h3">${esc(t('wd.ck.covered'))}</h2><ul class="small">${cov.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="small faint">${esc(t('wd.ck.notcovered'))}</p>`;
  out.querySelector('#ckh').focus({ preventScroll: false });
}
