// #/discover/god, /people, /places (lists) and #/discover/<kind>/<name> (one name, with every line it was found in).
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { NAMES } from './pre-names.js';
import { shell, crumbs, KINDS, nameOf, certMark, ruleNote, aiNote, lineLabel, workTitle } from './common.js';

const PAGE = 40;
const rk = (k) => (k.startsWith('DW') ? +k.slice(2) : 100 + ['AMR', 'HP', 'CP'].indexOf(k));
// Words that the rule cannot tell from the same word used in another sense (named in FEATURES.md): flagged on their pages.
const FLAGGED = new Set(['Ram', 'Hari', 'Shiva', 'Ganga river', 'Kashi (Varanasi)']);

function bar(cert, total) {
  return `<span class="bar3" role="img" aria-label="${esc(['high', 'medium', 'low'].filter((c) => cert[c]).map((c) => t('dc.cert.' + c) + ' ' + num(cert[c])).join(', '))}">${['high', 'medium', 'low'].map((c) => (cert[c] ? `<i class="b-${c}" style="width:${(100 * cert[c] / total).toFixed(1)}%"></i>` : '')).join('')}</span>`;
}

export async function render(ctx, route) {
  const kind = KINDS[route];
  const name = ctx.path[1];
  if (!name) return list(ctx, route, kind);
  const sum = NAMES[kind][name];
  if (!sum) {
    ctx.el.innerHTML = shell(`${crumbs([`#/discover/${route}`, t(`dc.${route}.title`)])}<h1 tabindex="-1">${esc(t('dc.names.nodata'))}</h1><p><a href="#/discover/${route}">${esc(t('dc.names.back'))}</a></p>`);
    return;
  }
  return one(ctx, route, kind, name, sum);
}

function list(ctx, route, kind) {
  const entries = Object.entries(NAMES[kind]);
  ctx.el.innerHTML = shell(`${crumbs([null, t(`dc.${route}.title`)])}
    <h1 tabindex="-1">${esc(t(`dc.${route}.title`))}</h1>
    <p class="muted">${esc(t(`dc.${route}.lead`))}</p>
    ${ruleNote()}
    <p class="small faint">${esc(t('dc.names.rule'))}</p>
    <ul class="nlist">${entries.map(([n, s]) => `<li><a href="${href(`discover/${route}/${n}`)}"><span class="t">${esc(nameOf(n))}</span><span class="n">${esc(num(s.count))}</span>
      <span class="d">${s.forms.slice(0, 4).map((f) => `<span lang="mr">${esc(f)}</span>`).join(' · ')}${FLAGGED.has(n) ? ` <span class="pmark">${esc(t('dc.names.flag').split(':')[0])}</span>` : ''}</span>${bar(s.cert, Object.values(s.cert).reduce((a, b) => a + b, 0) || 1)}</a></li>`).join('')}</ul>
    <p class="small faint">${esc(t('dc.cert.high'))}: <span class="cert cert-high">▮</span> · ${esc(t('dc.cert.medium'))}: <span class="cert cert-medium">▮</span> · ${esc(t('dc.cert.low'))}: <span class="cert cert-low">▮</span></p>`);
}

async function one(ctx, route, kind, name, sum) {
  const mod = await import(`./names/${sum.file}.js`);
  const items = mod.DATA[name].I, uses = mod.DATA[name].U || {};
  const st = { c: ctx.query.get('c') || '', g: PAGE };
  const total = Object.values(sum.cert).reduce((a, b) => a + b, 0) || 1;
  const weak = (sum.cert.high || 0) / total < 0.5;
  const roleKeys = ['self', 'guru', 'person', 'unclear', 'noun'].filter((r) => uses[r]);
  const usesHtml = kind === 'people' ? `<h2>${esc(t('dc.uses.title'))}</h2>${aiNote('dc.uses.note')}
    ${roleKeys.length ? roleKeys.map((r) => `<h3>${esc(t('dc.role.' + r))} <span class="small faint">(${esc(num(uses[r].length))})</span></h3>
      <ul class="rows">${uses[r].slice(0, 15).map(([cid, fl, form]) => `<li><a class="fl" href="${href('texts/gatha/' + cid)}" lang="mr">${esc(fl)}</a><div class="meta"><span lang="mr">${esc(form)}</span></div></li>`).join('')}</ul>
      ${uses[r].length > 15 ? `<p class="small faint">${esc(t('dc.th.shown', { a: num(15), b: num(uses[r].length) }))}</p>` : ''}`).join('') : `<p class="muted">${esc(t('dc.uses.none'))}</p>`}` : '';

  ctx.el.innerHTML = shell(`${crumbs([`#/discover/${route}`, t(`dc.${route}.title`)], [null, nameOf(name)])}
    <h1 tabindex="-1">${esc(nameOf(name))}</h1>
    ${ruleNote()}
    <p><strong>${esc(t('dc.names.count', { n: num(sum.count), m: num(sum.segments) }))}</strong></p>
    <p class="small">${esc(t('dc.names.forms'))}: ${sum.forms.map((f) => `<span class="chip" lang="mr">${esc(f)}</span>`).join(' ')}</p>
    ${FLAGGED.has(name) ? `<p class="note doubt">${esc(t('dc.names.flag'))}</p>` : ''}
    ${weak && !FLAGGED.has(name) ? `<p class="note doubt">${esc(t('dc.names.weak'))}</p>` : ''}
    <div class="filters" role="group" aria-label="${esc(t('dc.names.filter'))}">
      <button type="button" class="seg" data-c="" aria-pressed="${!st.c}">${esc(t('all'))} (${esc(num(items.length))})</button>
      ${['high', 'medium', 'low'].filter((c) => sum.cert[c]).map((c) => `<button type="button" class="seg" data-c="${c}" aria-pressed="${st.c === c}" title="${esc(t('dc.cert.' + c + '.t'))}">${esc(t('dc.cert.' + c))} (${esc(num(sum.cert[c]))})</button>`).join('')}</div>
    <div id="occ"></div>
    ${usesHtml}
    <p><a href="#/discover/${route}">${esc(t('dc.names.back'))}</a></p>`);

  const occ = ctx.el.querySelector('#occ');
  const paint = () => {
    const f = items.filter((i) => !st.c || i[1] === st.c);
    const gat = f.filter((i) => i[3] === 'G');
    const by = {};
    f.filter((i) => i[3] !== 'G').forEach((i) => { const k = i[3] === 'DW' ? 'DW' + i[4] : i[3]; (by[k] ||= []).push(i); });
    const keys = Object.keys(by).sort((a, b) => (rk(a) - rk(b)));
    const short = (i) => esc(num(String(i[3] === 'DW' ? i[5] : i[4] || '–')) + (i[6] > 1 ? ' ×' + num(i[6]) : ''));
    const chip = (i) => `<a class="chip cert-${i[1]}" href="${esc(href(i[2]))}" title="${esc(i[0] + ' · ' + t('dc.cert.' + i[1] + '.t'))}">${short(i)}</a>`;
    occ.innerHTML = keys.map((k) => `<h2>${esc(workTitle(k))} <span class="small faint">(${esc(num(by[k].length))})</span></h2><div class="chunks">${by[k].map(chip).join('')}</div>`).join('') +
      (gat.length ? `<h2>${esc(t('dc.seg.G'))} <span class="small faint">(${esc(num(gat.length))})</span></h2>
        <ul class="rows">${gat.slice(0, st.g).map((i) => `<li title="${esc(i[0])}"><a class="fl" href="${esc(href(i[2]))}" lang="mr">${esc(i[4])}</a><div class="meta">${certMark(i[1])}${i[6] > 1 ? `<span>${esc(t('dc.names.mentions', { n: num(i[6]) }))}</span>` : ''}</div></li>`).join('')}</ul>
        <p class="small faint">${esc(t('dc.th.shown', { a: num(Math.min(st.g, gat.length)), b: num(gat.length) }))}</p>
        ${gat.length > st.g ? `<div class="loadmore"><button type="button" class="btn" id="gmore">${esc(t('more'))}</button></div>` : ''}` : '');
    occ.querySelector('#gmore')?.addEventListener('click', () => { st.g += PAGE; paint(); });
  };
  ctx.el.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
    st.c = b.dataset.c; st.g = PAGE;
    ctx.el.querySelectorAll('[data-c]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.c === st.c)));
    history.replaceState(null, '', href(`discover/${route}/${name}`, { c: st.c }));
    paint();
  }));
  paint();
}
