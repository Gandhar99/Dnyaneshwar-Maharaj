// #/evidence/sources (list, filter) and #/evidence/sources/<id>
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, debounce } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { norm } from '../../assets/js/search-norm.js';
import { honesty, enText } from '../../assets/js/components.js';
import { CSS, crumbs } from './common.js';
import { term } from '../../assets/js/mr-terms.js';

const tier = (s) => s.quality_tier || s.baseline_tier || '';
const depth = (s) => s.read_depth || s.review_depth || '';
const isMr = (s) => /[ऀ-ॿ]/.test(s) ? 'mr' : 'en';
const PAGE = 60;

export async function render(ctx) {
  const [rows, ev] = await Promise.all([getJSON('evidence/sources.json'), getJSON('evidence/evidence.json')]);
  const id = ctx.path[1];
  if (id) return detail(ctx, rows, ev, id);
  const q0 = ctx.query;
  const tiers = ev.quality.map((x) => x.tier);
  const st = { q: q0.get('q') || '', tier: tiers.includes(q0.get('tier')) ? q0.get('tier') : '', shown: PAGE };
  const tierOrder = (r) => tier(r) || 'Z';
  const list = [...rows].sort((a, b) => tierOrder(a).localeCompare(tierOrder(b)) || a.source_id.localeCompare(b.source_id, 'en', { numeric: true }));
  list.forEach((r) => { r._n = (r.source_id + ' ' + r.title + ' ' + (r.author || '') + ' ' + (r.host || '')).toLowerCase(); r._m = norm(r.title); });
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.so.title'))}</h1>
    <p class="muted">${esc(t('ev.so.lead'))}</p>
    <div class="badges"><span class="badge prov">${esc(t('provisional'))}</span></div>
    <details><summary>${esc(t('ev.so.tier.help'))}</summary><div class="defs">${ev.quality.map((x) => `<div><div><span class="tier">${esc(x.tier)}</span> <span lang="en">${esc(x.label)}</span></div><p lang="en">${esc(x.meaning)}</p></div>`).join('')}</div></details>
    <div class="field"><label class="vh" for="sq">${esc(t('ev.so.find'))}</label><input id="sq" type="search" placeholder="${esc(t('ev.so.find'))}" value="${esc(st.q)}" autocomplete="off"></div>
    <div class="filters" role="group" aria-label="${esc(t('ev.so.tier'))}">
      <button type="button" class="seg" data-t="" aria-pressed="${st.tier === ''}">${esc(t('all'))}</button>
      ${tiers.map((x) => `<button type="button" class="seg" data-t="${x}" aria-pressed="${st.tier === x}">${esc(x)}</button>`).join('')}</div>
    <p class="small faint" id="scount" role="status" aria-live="polite"></p>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <ul class="slist" id="slist"></ul>
    <div class="loadmore"><button type="button" class="btn" id="smore" hidden>${esc(t('more'))}</button></div></div>`;
  const root = ctx.el.querySelector('.page');
  const $ = (s) => root.querySelector(s);
  const apply = (reset = true) => {
    if (reset) st.shown = PAGE;
    const lq = st.q.trim().toLowerCase(), nq = norm(st.q);
    const sel = list.filter((r) => (!st.tier || tier(r) === st.tier) && (!lq || r._n.includes(lq) || (nq && r._m.includes(nq))));
    $('#scount').textContent = t('ev.so.count', { n: num(sel.length) });
    $('#slist').innerHTML = sel.length ? sel.slice(0, st.shown).map((r) => `<li><a href="${href('evidence/sources/' + r.source_id)}">
      <span class="st" lang="${isMr(r.title)}">${esc(r.title)}</span>
      <span class="meta"><span class="tier" title="${esc(t('ev.so.tier'))}">${esc(tier(r) || '–')}</span><span>${esc(r.source_id)}</span>${r.year ? `<span lang="en">${esc(r.year)}</span>` : ''}</span>
      <span class="meta" lang="en">${esc(depth(r) || t('ev.so.nodepth'))}</span></a></li>`).join('') : `<li class="stub">${esc(t('ev.so.none'))}</li>`;
    $('#smore').hidden = sel.length <= st.shown;
    const qs = new URLSearchParams(Object.entries({ q: st.q.trim(), tier: st.tier }).filter(([, v]) => v)).toString();
    history.replaceState(null, '', '#/evidence/sources' + (qs ? '?' + qs : ''));
  };
  apply();
  $('#sq').addEventListener('input', debounce((e) => { st.q = e.target.value; apply(); }, 160));
  root.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
    st.tier = b.dataset.t; root.querySelectorAll('[data-t]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.t === st.tier))); apply();
  }));
  $('#smore').addEventListener('click', () => { st.shown += PAGE; apply(false); });
}

async function detail(ctx, rows, ev, id) {
  const s = rows.find((r) => r.source_id === id);
  const back = `<a href="#/evidence/sources">${esc(t('ev.so.title'))}</a>`;
  if (!s) { ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs(back)}<h1 tabindex="-1">${esc(t('ev.notfound'))}</h1></div>`; return; }
  const life = await getJSON('life.json');
  const re = new RegExp('(^|[^A-Za-z0-9-])' + id.replace(/[-]/g, '\\-') + '(?![0-9])');
  const used = life.disputes.filter((d) => [d.evidence_for, d.evidence_against, d.source_id].some((f) => f && re.test(f)));
  const qt = ev.quality.find((x) => x.tier === tier(s));
  const kv = (k, v) => (v ? `<dt>${esc(t(k))}</dt><dd>${v}</dd>` : '');
  const en = (v) => (v ? `<span lang="en">${esc(v)}</span>` : '');
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs(back, esc(id))}
    <h1 tabindex="-1" lang="${isMr(s.title)}" class="st1">${esc(s.title)}</h1>
    ${honesty({ ...s, source_id: '' })}
    <p><span class="tier">${esc(tier(s) || '–')}</span> ${qt ? `<span lang="en">${esc(qt.label)}</span>` : ''}</p>
    ${qt ? enText(qt.meaning, { note: false }) : ''}
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <dl class="kv" style="grid-template-columns:1fr;gap:.1rem">
      ${kv('ev.so.read', en(depth(s)) || esc(t('ev.so.nodepth')))}
      ${kv('ev.so.caution', en(s.caution))}${kv('ev.so.rights', en(s.rights_note))}${kv('ev.so.author', en(s.author))}
      ${kv('ev.so.year', en(s.year))}${kv('ev.so.host', esc(s.host))}${kv('ev.so.checked', esc(s.checked_on))}${kv('ev.so.prev', esc(s.previous_id))}
      ${used.length ? kv('ev.so.cited', used.map((d) => `<a href="${href('evidence/disputes/' + (d.question || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}" lang="${term(d.question).lang}">${esc(term(d.question).text)}</a>`).filter((v, i, a) => a.indexOf(v) === i).join(' · ')) : ''}
    </dl>
    ${s.url ? `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('ev.so.open'))}</a></p>` : ''}
    <p class="faint small">${esc(id)}</p>
  </div>`;
}
