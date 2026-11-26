// #/discover/things and #/discover/things/<material_id>
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, enText, verseBlock, claimBadge, provisional, wsCredit } from '../../assets/js/components.js';
import { shell, crumbs, lineLabel } from './common.js';

export async function render(ctx) {
  const rows = await getJSON('words/material_culture.json');
  const id = ctx.path[1];
  if (!id) return list(ctx, rows);
  const r = rows.find((x) => x.material_id === id);
  if (!r) { ctx.el.innerHTML = shell(`${crumbs(['#/discover/things', t('dc.tg.title')])}<h1 tabindex="-1">${esc(t('dc.tg.notfound'))}</h1>`); return; }
  return detail(ctx, r);
}

const catLabel = (c) => t('dc.cat.' + c);

function list(ctx, rows) {
  const cats = [...new Set(rows.map((r) => r.category))].sort((a, b) => rows.filter((r) => r.category === b).length - rows.filter((r) => r.category === a).length);
  const st = { cat: ctx.query.get('cat') || '' };
  ctx.el.innerHTML = shell(`${crumbs([null, t('dc.tg.title')])}
    <h1 tabindex="-1">${esc(t('dc.tg.title'))}</h1>
    <p class="muted">${esc(t('dc.tg.lead'))}</p>
    <p class="small">${claimBadge('reconstruction')} ${provisional()}</p>
    <p class="note">${esc(t('dc.tg.note'))}</p>
    <div class="filters" role="group" aria-label="${esc(t('dc.tg.cats'))}">
      <button type="button" class="seg" data-cat="" aria-pressed="${!st.cat}">${esc(t('all'))} (${esc(num(rows.length))})</button>
      ${cats.map((c) => `<button type="button" class="seg" data-cat="${esc(c)}" aria-pressed="${st.cat === c}">${esc(catLabel(c))} (${esc(num(rows.filter((r) => r.category === c).length))})</button>`).join('')}</div>
    <p class="small faint" id="tcount" role="status" aria-live="polite"></p>
    <ul class="nlist" id="tlist"></ul>`);
  const ul = ctx.el.querySelector('#tlist'), cnt = ctx.el.querySelector('#tcount');
  const paint = () => {
    const f = rows.filter((r) => !st.cat || r.category === st.cat).sort((a, b) => b.segment_count - a.segment_count);
    cnt.textContent = t('dc.tg.terms', { n: num(f.length) });
    ul.innerHTML = f.map((r) => `<li title="${esc(r.material_id)}"><a href="${href('discover/things/' + r.material_id)}"><span class="t" lang="mr">${esc(r.term)}</span><span class="n">${esc(num(r.segment_count))}</span>
      <span class="d"><span lang="en">${esc(r.gloss)}</span> · ${esc(catLabel(r.category))} · ${esc(t('dc.tg.count', { n: num(r.segment_count) }))}</span>
      <span class="d">${claimBadge(r.claim_status)}</span></a></li>`).join('');
  };
  ctx.el.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => {
    st.cat = b.dataset.cat;
    ctx.el.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === st.cat)));
    history.replaceState(null, '', href('discover/things', { cat: st.cat }));
    paint();
  }));
  paint();
}

async function detail(ctx, r) {
  const mod = await import('./pre-things.js').catch(() => ({ EX: {} }));
  const ex = Object.entries(mod.EX[r.material_id] || {});
  ctx.el.innerHTML = shell(`${crumbs(['#/discover/things', t('dc.tg.title')], [null, r.term, 'mr'])}
    <h1 tabindex="-1" lang="mr">${esc(r.term)}</h1>
    ${honesty(r)}
    <dl class="kv"><dt>${esc(t('dc.tg.gloss'))}</dt><dd lang="en">${esc(r.gloss)}</dd>
      <dt>${esc(t('dc.tg.cats'))}</dt><dd>${esc(catLabel(r.category))}</dd>
      <dt>${esc(t('dc.tg.counth'))}</dt><dd>${esc(t('dc.tg.count', { n: num(r.segment_count) }))}</dd></dl>
    ${r.note ? `<div class="note">${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}<span lang="en">${esc(r.note)}</span></div>` : ''}
    <p class="note">${esc(t('dc.tg.note'))}</p>
    <h2>${esc(t('dc.tg.examples'))}</h2>
    <p class="small faint">${esc(t('dc.tg.shownex', { n: num(r.segment_count) }))}</p>
    ${ex.map(([seg, [route, kind, a, b, text]]) => `<div class="ex" title="${esc(seg)}">
      <div class="sp"><span>${lineLabel(kind, a, b)}</span>${route ? `<a href="${esc(href(route))}">${esc(t('dc.tg.open'))}</a>` : ''}</div>
      ${text ? verseBlock(text, { size: 'small', halves: false }) : ''}</div>`).join('')}
    ${await wsCredit(ex.map(([seg]) => seg))}
    <p><a href="#/discover/things">${esc(t('dc.tg.back'))}</a></p>`);
}
