// #/connections/<saint>: how tradition relates them, their poems that name him, his texts that name them.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty } from '../../assets/js/components.js';
import { SAINTS } from './pre.js';
import { saintName, crumbs, shell, ruleNote, certMark, epLabel, slugOf } from './common.js';
import { term } from '../../assets/js/mr-terms.js';

const PAGE = 40;
const rk = (k) => (k.startsWith('DW') ? +k.slice(2) : 100 + ['AMR', 'HP', 'CP'].indexOf(k));

export async function render(ctx, name) {
  const slug = slugOf(name);
  const narr = SAINTS.narrated[name];
  const [life, named] = await Promise.all([getJSON('life.json'), import(`./pre-named-${slug}.js`).then((m) => m.NAMED)]);
  const rels = life.relationships.filter((r) => r.object_slug === slug);
  const disputes = name === 'Namdev' ? life.disputes.filter((d) => /Namdev/.test(d.question)) : [];
  const list = ctx.query.get('list');

  const relHtml = rels.length ? `<ul class="rel">${rels.map((r) => `<li id="${esc(r.relationship_id)}" title="${esc(r.relationship_id)}">
      <div class="who" lang="en">${esc(r.relation)}</div>
      ${r.note ? `<p class="note-text" lang="en">${esc(r.note)}</p>` : ''}
      ${honesty(r)}</li>`).join('')}</ul>` : `<p class="muted">${esc(t('cn.rel.none'))}</p>`;
  const disHtml = disputes.length ? `<h3>${esc(t('cn.dis.title'))}</h3>
      <div class="side">${disputes.map((d) => `<div class="pos" title="${esc(d.dispute_id)}">
        <p lang="${term(d.position).lang}"><strong>${esc(term(d.position).text)}</strong></p>
        ${d.proponents ? `<p class="small muted" lang="en">${esc(d.proponents)}</p>` : ''}
        ${d.evidence_against ? `<p class="small" lang="en">${esc(d.evidence_against)}</p>` : ''}
        ${honesty(d)}</div>`).join('')}</div>` : '';

  ctx.el.innerHTML = shell(`
    ${crumbs(['#/connections', t('g.connections')], [null, saintName(name)])}
    <h1 tabindex="-1">${esc(saintName(name))}</h1>
    ${ruleNote()}
    <h2>${esc(t('cn.rel.title'))}</h2>
    ${rels.length && lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    ${relHtml}${disHtml}
    <section id="in" aria-labelledby="in-h">
      <h2 id="in-h">${esc(t('cn.in.title'))}</h2>
      ${narr ? `<p class="muted">${esc(t('cn.in.lead'))}</p>${lang() === 'mr' && name !== 'Namdev' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}<div id="inbox"></div>` : `<p class="muted">${esc(t('cn.tbl.none'))}</p>`}
    </section>
    <section id="out" aria-labelledby="out-h">
      <h2 id="out-h">${esc(t('cn.out.title'))}</h2>
      <div id="outbox"></div>
    </section>
    <p><a href="#/connections">${esc(t('cn.back'))}</a>${name === 'Changdev' ? ` · <a href="${href('connections/dialogues/DNYC-DLG01')}">${esc(t('cn.dl.DNYC-DLG01'))}</a>` : ''}</p>`);
  if (list) { ctx.manageScroll = true; ctx.after = () => { document.getElementById(list === 'out' ? 'out' : 'in')?.scrollIntoView(); document.getElementById(list === 'out' ? 'out-h' : 'in-h')?.focus?.({ preventScroll: true }); }; }
  if (narr) await inList(ctx, name, narr);
  outList(ctx, name, named);
}

// ---------------------------------------------------------------- their poems that name him
async function inList(ctx, name, narr) {
  const box = ctx.el.querySelector('#inbox');
  const st = { ep: ctx.query.get('ep') || '', c: ctx.query.get('c') || '', shown: PAGE };
  const eps = Object.entries(narr.episodes).sort((a, b) => b[1] - a[1]);
  const certs = Object.entries(narr.certainty);
  box.innerHTML = `<p class="small"><strong>${esc(t('cn.in.count', { n: num(narr.n) }))}</strong></p>
    <div class="filters" role="group" aria-label="${esc(t('cn.in.certainty'))}">
      <button type="button" class="seg" data-c="" aria-pressed="${!st.c}">${esc(t('all'))}</button>
      ${certs.map(([c, n]) => `<button type="button" class="seg" data-c="${esc(c)}" aria-pressed="${st.c === c}">${esc(t('cn.cert.' + c))} (${esc(num(n))})</button>`).join('')}</div>
    ${eps.length > 1 ? `<div class="filters" role="group" aria-label="${esc(t('cn.in.episode'))}">
      <button type="button" class="seg" data-ep="" aria-pressed="${!st.ep}">${esc(t('all'))}</button>
      ${eps.map(([e, n]) => `<button type="button" class="seg" data-ep="${esc(e || '-')}" aria-pressed="${st.ep === (e || '-')}">${esc(epLabel(e))} (${esc(num(n))})</button>`).join('')}</div>` : ''}
    <p class="small faint" id="incount" role="status" aria-live="polite"></p>
    <ul class="rows" id="inrows"></ul>
    <div class="loadmore"><button type="button" class="btn" id="inmore" hidden>${esc(t('more'))}</button></div>`;
  const rowsEl = box.querySelector('#inrows'), more = box.querySelector('#inmore'), cnt = box.querySelector('#incount');
  let all = [], loadedFiles = new Set();
  const load = async (every) => {
    const files = every ? narr.files : [narr.files[0]];
    for (const k of files) {
      if (loadedFiles.has(k)) continue;
      loadedFiles.add(k);
      const rows = await getJSON(`connections/narrated_by_others-${k}.json`);
      all.push(...rows.filter((r) => r.saint === name));
    }
    all.sort((a, b) => a.narrated_id.localeCompare(b.narrated_id));
  };
  const row = (r) => `<li title="${esc(r.narrated_id)}">
      <span class="fl" lang="mr">${esc(r.incipit)}</span>
      <div class="meta">${certMark(r.certainty)}
        <span>${esc(t('cn.matched'))}: <span lang="mr">${esc((r.names_matched || []).join(', '))}</span></span>
        ${r.episode ? `<span>${esc(epLabel(r.episode))}</span>` : ''}
        ${r.package_section ? `<span lang="${/[\u0904-\u0939]/.test(r.package_section) ? 'mr' : 'en'}">${esc(r.package_section)}</span>` : ''}</div>
      ${r.certainty === 'medium' ? `<p class="small faint">${esc(t('cn.cert.medium.why'))}</p>` : ''}
      ${honesty(r)}</li>`;
  const paint = async (upd) => {
    const needAll = st.ep || st.c || st.shown > all.length;
    if (needAll && loadedFiles.size < narr.files.length) { cnt.textContent = t('loading'); await load(true); }
    else if (!loadedFiles.size) await load(false);
    const f = all.filter((r) => (!st.c || r.certainty === st.c) && (!st.ep || (r.episode || '-') === st.ep));
    cnt.textContent = t('cn.in.shown', { a: num(f.length), b: num(Math.min(st.shown, f.length)) });
    rowsEl.innerHTML = f.slice(0, st.shown).map(row).join('');
    more.hidden = f.length <= st.shown && loadedFiles.size >= narr.files.length;
    if (upd) { const qs = new URLSearchParams(Object.entries({ list: 'in', ep: st.ep, c: st.c }).filter(([, v]) => v)); history.replaceState(null, '', '#/connections/' + slugOf(name) + '?' + qs); }
  };
  box.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { st.c = b.dataset.c; st.shown = PAGE; box.querySelectorAll('[data-c]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.c === st.c))); paint(true); }));
  box.querySelectorAll('[data-ep]').forEach((b) => b.addEventListener('click', () => { st.ep = b.dataset.ep; st.shown = PAGE; box.querySelectorAll('[data-ep]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.ep === st.ep))); paint(true); }));
  more.addEventListener('click', () => { st.shown += PAGE; paint(true); });
  await paint();
}

// ---------------------------------------------------------------- his texts that name them
function outList(ctx, name, named) {
  const box = ctx.el.querySelector('#outbox');
  const items = named.items;
  if (!items.length) { box.innerHTML = `<p class="muted">${esc(t('cn.out.none'))}</p>`; return; }
  const certs = ['high', 'medium', 'low'].map((c) => [c, items.filter((i) => i[1] === c).length]).filter(([, n]) => n);
  let cf = '';
  const paint = () => {
    const f = items.filter((i) => !cf || i[1] === cf);
    const gat = f.filter((i) => i[3] === 'G');
    const byWork = {};
    f.filter((i) => i[3] !== 'G').forEach((i) => { const k = i[3] === 'DW' ? 'DW' + i[4] : i[3]; (byWork[k] ||= []).push(i); });
    const shortLabel = (i) => esc(num(String(i[3] === 'DW' ? i[5] : i[4])) + (i[6] > 1 ? ' ×' + num(i[6]) : ''));
    const chip = (i) => `<a class="chip cert-${i[1]}" href="${esc(href(i[2]))}" title="${esc(i[0] + ' · ' + t('cn.cert.' + i[1]))}">${shortLabel(i)}</a>`;
    const groups = Object.keys(byWork).sort((a, b) => (rk(a) - rk(b)));
    box.querySelector('#outlist').innerHTML =
      groups.map((k) => `<h3>${esc(k.startsWith('DW') ? t('cn.seg.dwch', { ch: num(k.slice(2)) }) : t('cn.work.' + k))} <span class="small faint">(${esc(num(byWork[k].length))})</span></h3>
        <div class="chunks">${byWork[k].map(chip).join('')}</div>`).join('') +
      (gat.length ? `<h3>${esc(t('cn.work.G'))} <span class="small faint">(${esc(num(gat.length))})</span></h3><ul class="rows">${gat.map((i) => `<li title="${esc(i[0])}"><a class="fl" href="${esc(href(i[2]))}" lang="mr">${esc(i[4])}</a><div class="meta">${certMark(i[1])}${i[6] > 1 ? `<span>${esc(t('cn.out.mentions', { n: num(i[6]) }))}</span>` : ''}</div></li>`).join('')}</ul>` : '');
  };
  box.innerHTML = `<p class="muted">${esc(t('cn.out.lead'))}</p>
    <p class="small"><strong>${esc(t('cn.out.count', { n: num(named.count), m: num(new Set(items.map((i) => i[0])).size) }))}</strong> · ${esc(t('cn.forms'))}: <span lang="mr">${esc(named.forms.join(', '))}</span></p>
    ${name === 'Nivruttinath' ? `<p class="note doubt">${esc(t('cn.out.dagger'))} <a href="${href('connections/lineage')}">${esc(t('cn.ln.title'))}</a></p>` : ''}
    <div class="filters" role="group" aria-label="${esc(t('cn.in.certainty'))}">
      <button type="button" class="seg" data-oc="" aria-pressed="true">${esc(t('all'))} (${esc(num(items.length))})</button>
      ${certs.map(([c, n]) => `<button type="button" class="seg" data-oc="${c}" aria-pressed="false">${esc(t('cn.cert.' + c))} (${esc(num(n))})</button>`).join('')}</div>
    <div id="outlist"></div>`;
  box.querySelectorAll('[data-oc]').forEach((b) => b.addEventListener('click', () => { cf = b.dataset.oc; box.querySelectorAll('[data-oc]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.oc === cf))); paint(); }));
  paint();
}
