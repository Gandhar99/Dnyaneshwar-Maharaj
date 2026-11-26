// Glossary list (#/words) and one entry (#/words/glossary/<id>).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, debounce } from '../../assets/js/util.js';
import { getJSON, routeForSegment } from '../../assets/js/data.js';
import { norm } from '../../assets/js/search-norm.js';
import { claimBadge, provisional, sourceChips, honesty, enText } from '../../assets/js/components.js';

export const basisKey = (s) => {
  s = String(s || '');
  if (/^not found/.test(s)) return 'ctx';
  if (/not resolved|reverse/.test(s)) return 'split';
  if (/sense chosen by context/.test(s)) return 'dictctx';
  if (/matches context/.test(s)) return 'dict';
  return 'other';
};
const KEYS = ['dict', 'dictctx', 'ctx', 'split'];
const crumbs = (extra = '') => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/words">${esc(t('g.words'))}</a>${extra}</p>`;

/** Meaning block: Marathi first in Marathi mode, English first in English mode. */
function meanings(mr, en, big) {
  const m = mr ? `<p class="mn" lang="mr">${esc(mr)}</p>` : '';
  const e = en ? `<p class="mn en${big ? '' : ' sm'}" lang="en">${esc(en)}</p>` : '';
  return lang() === 'mr' ? m + e : e + m;
}

export async function list(ctx) {
  const rows = (await getJSON('words/glossary_terms.json')).map(([id, word, headword, mr, en, basis, cs]) =>
    ({ id, word, headword, mr, en, basis, cs, k: basisKey(basis), n: norm(`${word} ${headword || ''} ${mr || ''}`), e: String(en || '').toLowerCase() }));
  const count = (k) => rows.filter((r) => r.k === k).length;
  const ctxN = count('ctx');
  const q0 = ctx.query;
  const st = { q: q0.get('q') || '', b: KEYS.includes(q0.get('b')) ? q0.get('b') : '' };

  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/words/style.css"><div class="page m-words">
    ${crumbs()}
    <h1 tabindex="-1">${esc(t('g.words'))}</h1>
    <p class="muted">${esc(t('wd.intro'))}</p>
    <div class="badges">${claimBadge('broadly supported')}${claimBadge('reconstruction')}${provisional()}${sourceChips('DNYG-G-S01')}</div>
    <p class="note">${esc(t('wd.summary', { n: num(rows.length), d: num(rows.length - ctxN), c: num(ctxN) }))} ${esc(t('wd.dictonly'))}</p>
    <p class="wlinks"><a class="seg" href="${href('words/old-forms')}">${esc(t('wd.links'))}</a> <a class="seg" href="${href('words/check')}">${esc(t('wd.links.check'))}</a></p>
    <div class="field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>
      <label class="vh" for="wq">${esc(t('wd.find'))}</label>
      <input id="wq" type="search" placeholder="${esc(t('wd.find'))}" value="${esc(st.q)}" autocomplete="off"></div>
    <div class="filters" role="group" aria-label="${esc(t('wd.filter'))}">
      <button type="button" class="seg" data-b="" aria-pressed="${st.b === ''}">${esc(t('wd.b.all'))} ${esc(num(rows.length))}</button>
      ${KEYS.map((k) => `<button type="button" class="seg" data-b="${k}" aria-pressed="${st.b === k}">${esc(t('wd.b.' + k))} ${esc(num(count(k)))}</button>`).join('')}
    </div>
    <p class="small faint" id="wcount" role="status" aria-live="polite"></p>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <ul class="wlist" id="wlist"></ul>
  </div>`;

  const root = ctx.el.querySelector('.page');
  const $ = (s) => root.querySelector(s);
  const apply = () => {
    const nq = norm(st.q), lq = st.q.trim().toLowerCase();
    const sel = rows.filter((r) => (!st.b || r.k === st.b) && (!st.q.trim() || (nq && r.n.includes(nq)) || (lq.length > 1 && r.e.includes(lq))));
    $('#wcount').textContent = t('wd.count', { n: num(sel.length) });
    $('#wlist').innerHTML = sel.length ? sel.map(card).join('') : `<li class="stub">${esc(t('wd.none'))} <a href="#/words">${esc(t('wd.reset'))}</a></li>`;
    const qs = new URLSearchParams(Object.entries({ q: st.q.trim(), b: st.b }).filter(([, v]) => v)).toString();
    history.replaceState(null, '', '#/words' + (qs ? '?' + qs : ''));
  };
  apply();
  $('#wq').addEventListener('input', debounce((e) => { st.q = e.target.value; apply(); }, 160));
  root.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => {
    st.b = b.dataset.b;
    root.querySelectorAll('[data-b]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.b === st.b)));
    apply();
  }));
}

function card(r) {
  return `<li class="wcard"><a href="${href('words/glossary/' + r.id)}" title="${esc(r.id)}">
    <span class="w"><span class="wd" lang="mr">${esc(r.word)}</span>${r.headword && r.headword !== r.word ? `<small class="faint" lang="mr"> (${esc(r.headword)})</small>` : ''}</span>
    ${meanings(r.mr, r.en, false)}
    <span class="badges">${claimBadge(r.cs)}<span class="badge prov bl" lang="${lang()}">${esc(t('wd.bl.' + r.k))}</span></span></a></li>`;
}

export async function entry(ctx, id) {
  const all = await getJSON('words/glossary.json');
  const r = all.find((x) => x.glossary_id === id);
  if (!r) {
    ctx.el.innerHTML = `<div class="page m-words">${crumbs()}<h1 tabindex="-1">${esc(t('wd.notfound'))}</h1><p><a href="#/words">${esc(t('wd.back'))}</a></p></div>`;
    return;
  }
  const k = basisKey(r.meaning_basis);
  const m = /^(.*?);\s*(https?:\/\/\S+)$/.exec(r.dictionary_cited || '');
  const cite = m ? m[1] : r.dictionary_cited, url = m ? m[2] : '';
  const route = r.example_segment_id ? await routeForSegment(r.example_segment_id).catch(() => null) : null;
  const pair = k === 'split' ? all.find((x) => x.glossary_id !== id && basisKey(x.meaning_basis) === 'split' && x.example_segment_id === r.example_segment_id) : null;
  const noteLines = [r.note, r.revision_note].filter(Boolean);

  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/words/style.css"><div class="page m-words">
    ${crumbs(` / <span lang="mr">${esc(r.word)}</span>`)}
    <h1 tabindex="-1" lang="mr" class="bigword">${esc(r.word)}</h1>
    ${honesty(r)}
    <div class="mbox">${meanings(r.meaning_modern_marathi, r.meaning_english, true)}</div>
    ${lang() === 'mr' && r.meaning_english ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    ${k === 'ctx' ? `<div class="note doubt"><strong>${esc(t('wd.recon.t'))}</strong><br>${esc(t('wd.recon.b'))}</div>` : ''}
    ${k === 'split' ? `<div class="note doubt"><strong>${esc(t('wd.split.t'))}</strong><br>${esc(t('wd.split.b'))}</div>` : ''}
    <dl class="kv wkv">
      ${r.headword && r.headword !== r.word ? `<dt>${esc(t('wd.asWritten'))}</dt><dd lang="mr">${esc(r.word)}</dd><dt>${esc(t('wd.headword'))}</dt><dd lang="mr">${esc(r.headword)}</dd>` : ''}
      <dt>${esc(t('wd.basis'))}</dt><dd><span lang="${lang()}">${esc(t('wd.bl.' + k))}</span>${lang() === 'mr' ? `<br><small class="faint" lang="en">${esc(r.meaning_basis)}</small>` : ''}</dd>
      <dt>${esc(t('wd.dictionary'))}</dt><dd><span lang="en">${esc(cite)}</span>${url ? `<br><a href="${esc(url)}" target="_blank" rel="noopener">${esc(t('wd.dict.open'))}</a>` : ''}</dd>
      ${r.frequency_in_corpus ? `<dt>${esc(t('wd.freq'))}</dt><dd>${esc(t('wd.freq.v', { n: num(r.frequency_in_corpus) }))}</dd>` : ''}
      ${r.example_segment_id ? `<dt>${esc(t('wd.example'))}</dt><dd>${route ? `<a href="#/${esc(route)}">${esc(t('wd.example.open'))}</a> ` : ''}<small class="faint">${esc(r.example_segment_id)}</small></dd>` : ''}
      ${pair ? `<dt>${esc(t('wd.related'))}</dt><dd><a href="${href('words/glossary/' + pair.glossary_id)}" lang="mr">${esc(pair.word)}</a></dd>` : ''}
      <dt>${esc(t('wd.revised'))}</dt><dd><span lang="en">${esc(r.revised || '')}</span> <small class="faint">${esc(r.glossary_id)}</small></dd>
    </dl>
    ${noteLines.length ? `<h2 class="h3">${esc(t('wd.note'))}</h2>${noteLines.map((x) => enText(x, { note: false })).join('')}` : ''}
    <p><a href="#/words">${esc(t('wd.back'))}</a></p>
  </div>`;
}
