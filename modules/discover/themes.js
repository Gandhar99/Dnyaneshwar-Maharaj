// #/discover/themes (the twenty themes) and #/discover/themes/<T01..T20>
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, gathaIndex, routeForSegment } from '../../assets/js/data.js';
import { poemCard, honesty } from '../../assets/js/components.js';
import { THEME_CONF } from './pre-themes.js';
import { shell, crumbs, TOPICS, aiNote } from './common.js';

const PAGE = 40;

export async function render(ctx) {
  const id = ctx.path[1];
  if (!id) return list(ctx);
  if (!TOPICS.includes(id)) { ctx.el.innerHTML = shell(`${crumbs(['#/discover/themes', t('dc.th.title')])}<h1 tabindex="-1">${esc(t('dc.th.notfound'))}</h1>`); return; }
  return page(ctx, id);
}

function tally() {
  const c = Object.fromEntries(TOPICS.map((x) => [x, { h: 0, m: 0 }]));
  // THEME_CONF holds the confidences by rank; the theme ids come from the gatha index, so read both lazily on the page
  return c;
}

async function list(ctx) {
  const ix = await gathaIndex();
  const c = tally();
  ix.rows.forEach((r) => { const cf = THEME_CONF[r.id] || ''; r.themes.forEach((th, i) => { if (cf[i] === 'h') c[th].h++; else if (cf[i] === 'm') c[th].m++; }); });
  ctx.el.innerHTML = shell(`${crumbs([null, t('dc.th.title')])}
    <h1 tabindex="-1">${esc(t('dc.th.title'))}</h1>
    <p class="muted">${esc(t('dc.th.lead'))}</p>
    ${aiNote('dc.th.note')}
    <ul class="tgrid">${TOPICS.map((x) => `<li><a href="${href('discover/themes/' + x)}"><span class="t">${esc(t(x))}</span><span class="d">${esc(t('dc.th.counts', { h: num(c[x].h), m: num(c[x].m) }))}</span></a></li>`).join('')}</ul>`);
}

async function page(ctx, id) {
  const [ix, topics] = await Promise.all([gathaIndex(), getJSON('topics.json')]);
  const row = topics.find((x) => x.topic_id === id);
  const hi = [], md = [];
  ix.rows.forEach((r) => { const i = r.themes.indexOf(id); if (i < 0) return; const cf = (THEME_CONF[r.id] || '')[i]; if (cf === 'h') hi.push(r); else if (cf === 'm') md.push(r); });
  const k = TOPICS.indexOf(id);
  const st = { h: PAGE, m: PAGE };
  const block = (key, rows, headKey) => `<section aria-labelledby="h-${key}"><h2 id="h-${key}">${key === 'm' ? '<span class="pmark">' + esc(t('dc.th.medium')) + '</span>' : ''}${esc(t(headKey))} <span class="small faint">(${esc(num(rows.length))})</span></h2>
      ${rows.length ? `<ul class="plist" id="l-${key}"></ul><p class="small faint" id="c-${key}"></p><div class="loadmore"><button type="button" class="btn" id="m-${key}" hidden>${esc(t('more'))}</button></div>` : `<p class="muted">${esc(t('dc.th.none'))}</p>`}</section>`;

  ctx.el.innerHTML = shell(`${crumbs(['#/discover/themes', t('dc.th.title')], [null, t(id)])}
    <h1 tabindex="-1">${esc(t(id))}</h1>
    ${aiNote('dc.th.note')}
    ${block('h', hi, 'dc.th.high.h')}
    ${block('m', md, 'dc.th.medium.h')}
    <details id="rule"><summary>${esc(t('dc.th.rule'))}</summary>
      <div id="rulebox"><p class="loading" role="status">${esc(t('loading'))}</p></div></details>
    <nav class="pager" aria-label="${esc(t('dc.th.all'))}">
      ${k > 0 ? `<a href="${href('discover/themes/' + TOPICS[k - 1])}" rel="prev"><span class="small faint">${esc(t('dc.th.prev'))}</span><br>${esc(t(TOPICS[k - 1]))}</a>` : '<span></span>'}
      ${k < 19 ? `<a href="${href('discover/themes/' + TOPICS[k + 1])}" rel="next" style="text-align:right"><span class="small faint">${esc(t('dc.th.next'))}</span><br>${esc(t(TOPICS[k + 1]))}</a>` : ''}
    </nav>
    <p><a href="#/discover/themes">${esc(t('dc.th.all'))}</a></p>`);

  for (const [key, rows] of [['h', hi], ['m', md]]) {
    if (!rows.length) continue;
    const ul = ctx.el.querySelector('#l-' + key), cnt = ctx.el.querySelector('#c-' + key), more = ctx.el.querySelector('#m-' + key);
    const paint = () => {
      ul.innerHTML = rows.slice(0, st[key]).map(poemCard).join('');
      cnt.textContent = t('dc.th.shown', { a: num(Math.min(st[key], rows.length)), b: num(rows.length) });
      more.hidden = rows.length <= st[key];
    };
    more.addEventListener('click', () => { st[key] += PAGE; paint(); });
    paint();
  }
  const det = ctx.el.querySelector('#rule');
  det.addEventListener('toggle', async () => {
    if (!det.open || det.dataset.done) return;
    det.dataset.done = '1';
    const lt = await getJSON('links/topics.json');
    const ids = lt[id] || [];
    const comps = ids.filter((x) => /^DNYC-COMP/.test(x)).map((x) => ix.byId.get(x)).filter(Boolean);
    const others = await Promise.all(ids.filter((x) => !/^DNYC-COMP/.test(x)).map(async (x) => [x, await routeForSegment(x)]));
    const chip = ([sid, r]) => (r ? `<a class="chip" href="${esc(href(r))}" title="${esc(sid)}">${esc(label(sid))}</a>` : `<span class="chip" title="${esc(sid)}">${esc(label(sid))}</span>`);
    det.querySelector('#rulebox').innerHTML = `${row ? honesty(row) : ''}<p class="note doubt">${esc(t('dc.th.rule.note'))}</p>
      <p class="small"><strong>${esc(t('dc.th.rule.count', { n: num(ids.length) }))}</strong></p>
      ${comps.length ? `<h3>${esc(t('dc.th.rule.poems'))} (${esc(num(comps.length))})</h3><ul class="plist">${comps.slice(0, 60).map(poemCard).join('')}</ul>${comps.length > 60 ? `<p class="small faint">${esc(t('dc.th.shown', { a: num(60), b: num(comps.length) }))} <a href="${href('texts/gatha', { th: id })}">${esc(t('g.texts'))}</a></p>` : ''}` : ''}
      ${others.length ? `<h3>${esc(t('dc.th.rule.other'))} (${esc(num(others.length))})</h3><div class="chunks">${others.map(chip).join('')}</div>` : ''}`;
  });
}

function label(sid) {
  let m;
  if ((m = /^DNY(\d\d)S?_0*(\d+)/.exec(sid))) return `${+m[1]}·${num(m[2])}`;
  if ((m = /^(AMR|AMRW01|HP|CP)_0*(\d+)/.exec(sid))) return `${m[1]} ${num(m[2])}`;
  return sid;
}
