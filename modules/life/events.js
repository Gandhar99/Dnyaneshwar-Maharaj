// Events list and event pages. Poems that narrate an episode are loaded only when the reader asks (about 800 KB).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, routeForSegment } from '../../assets/js/data.js';
import { honesty, claimBadge, loading } from '../../assets/js/components.js';
import { loadLife, loadPlaces, crumbs, lifeCrumb, enNote, cssLink, txt, en, kv, traditionLine, placeChips, splitSegs, certLabel, rowId } from './common.js';
import { termHtml } from '../../assets/js/mr-terms.js';

// Which package episode labels belong to which event. The labels are the package's own. Where the event row itself names
// that cycle (narrated_in) the pairing rests on the data; the others (OWN) are this site's grouping and say so on the page.
const OWN = new Set(['DNYL-V001', 'DNYL-V017']);
const EPISODES = {
  'DNYL-V001': ['adi'], 'DNYL-V014': ['tirthavali'], 'DNYL-V015': ['Dnyaneshwar samadhi', 'samadhi'],
  'DNYL-V017': ['Nivruttinath samadhi', 'Sopandev samadhi', 'Muktabai samadhi'],
};
// Event -> subject prefix in date_claims (exact words of the subjects).
const DATE_SUBJECT = { 'DNYL-V008': 'composition of the Dnyaneshwari', 'DNYL-V015': 'sanjivan samadhi', 'DNYL-V018': 'Eknath recension' };

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${loading()}</div>`;
  const [L, P] = await Promise.all([loadLife(), loadPlaces()]);
  const id = ctx.path[1];
  return id ? eventPage(ctx, L, P, id) : listPage(ctx, L, P);
}

function listPage(ctx, L, P) {
  const f = ['tradition', 'other'].includes(ctx.query.get('s')) ? ctx.query.get('s') : '';
  const rows = L.events.filter((e) => !f || (f === 'tradition') === (e.claim_status === 'devotional tradition'));
  const seg = (k) => `<a class="seg" role="button" aria-pressed="${f === (k === 'all' ? '' : k)}" href="${href('life/events', k === 'all' ? null : { s: k })}">${esc(t('life.ev.f.' + k))}</a>`;
  ctx.el.innerHTML = `<div class="page m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.ev.title'))}</h1>
    <p class="muted">${esc(t('life.ev.lead', { n: num(L.events.length) }))}</p>${enNote()}
    <div class="filters" role="group" aria-label="${esc(t('life.ev.filter'))}">${seg('all')}${seg('tradition')}${seg('other')}</div>
    <ul class="evlist">${rows.map((e) => `<li title="${esc(e.event_id)}">
      <a class="t" lang="en" href="${href('life/events/' + e.event_id)}">${esc(e.title)}</a>
      <div class="when">${e.date_or_period ? en(e.date_or_period) : `<span class="faint">${esc(t('life.ev.nodate'))}</span>`}</div>
      <div class="badges">${claimBadge(e.claim_status)}${e.place_id ? placeChips(e.place_id, P.places) : ''}</div>
      ${traditionLine(e)}</li>`).join('')}</ul>
  </div>`;
}

async function eventPage(ctx, L, P, id) {
  const e = L.events.find((x) => x.event_id === id);
  if (!e) { ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${crumbs(lifeCrumb())}<h1 tabindex="-1">${esc(t('life.ev.notfound'))}</h1><p><a href="#/life/events">${esc(t('life.ev.back'))}</a></p></div>`; return; }
  const segs = splitSegs(e.segment_ids);
  const segLinks = await Promise.all(segs.map(async (s) => {
    const first = s.split('-')[0];
    const r = /^DNY|^AMR|^CP_|^HP_/.test(first) ? await routeForSegment(first).catch(() => null) : null;
    return r ? `<a class="chip" href="#/${esc(r)}" lang="en">${esc(s)}</a>` : `<span class="chip plain" lang="en" data-seg="${esc(first)}">${esc(s)}</span>`;
  }));
  const hasNar = segs.some((s) => /^NM/.test(s)) || EPISODES[id];
  const subj = DATE_SUBJECT[id];
  const claims = subj ? L.date_claims.filter((d) => d.subject.toLowerCase().startsWith(subj.toLowerCase())) : [];
  const i = L.events.indexOf(e);
  const prev = L.events[i - 1], next = L.events[i + 1];
  ctx.el.innerHTML = `<article class="page m-life">${cssLink()}
    ${crumbs(lifeCrumb(), `<a href="#/life/events">${esc(t('life.ev.title'))}</a>`)}
    <h1 tabindex="-1" lang="en">${esc(e.title)}</h1>${enNote()}
    ${honesty(e)}${traditionLine(e)}
    <p lang="en">${esc(e.summary)}</p>
    ${kv([[t('life.ev.when'), en(e.date_or_period)], [t('life.ev.where'), e.place_id ? placeChips(e.place_id, P.places) : ''], [t('life.ev.who'), en(e.people_involved)],
      [t('life.ev.narrated'), en(e.narrated_in)], [t('life.ev.earliest'), en(e.earliest_source_status)]])}
    ${rowId(e.event_id)}
    ${segs.length ? `<h2>${esc(t('life.ev.segs'))}</h2><p class="chips">${segLinks.join(' ')}</p><p class="small faint">${esc(t('life.ev.segs.note'))}</p>` : ''}
    ${claims.length ? `<h2>${esc(t('life.ev.dates'))}</h2><p><a class="btn" href="${href('life/dates', { s: claims[0].subject })}">${esc(t('life.ev.dates.open'))} (${termHtml(claims[0].subject)})</a></p>` : ''}
    ${hasNar ? `<h2>${esc(t('life.ev.poems'))}</h2><div id="poems"><button type="button" class="btn" id="loadp">${esc(t('life.ev.poems.load'))}</button></div>` : ''}
    <nav class="pager" aria-label="${esc(t('next'))}">
      ${prev ? `<a href="${href('life/events/' + prev.event_id)}" rel="prev"><span class="small faint">${esc(t('prev'))}</span><br><span lang="en">${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a href="${href('life/events/' + next.event_id)}" rel="next" style="text-align:right"><span class="small faint">${esc(t('next'))}</span><br><span lang="en">${esc(next.title)}</span></a>` : ''}
    </nav></article>`;
  const btn = ctx.el.querySelector('#loadp');
  if (btn) btn.addEventListener('click', async () => {
    const box = ctx.el.querySelector('#poems');
    box.innerHTML = loading();
    const rows = (await Promise.all([1, 2, 3, 4, 5].map((n) => getJSON(`connections/narrated_by_others-${n}.json`)))).flat();
    box.innerHTML = poems(rows, e, segs);
    wireMore(box);
  });
}

const row = (r) => `<li title="${esc(r.narrated_id)}"><span class="fl" lang="mr">${esc(r.incipit)}</span>
  <div class="small faint"><span lang="en">${esc(r.saint)}</span> · <span lang="mr">${esc((r.package_section || '').split(' > ').slice(-1)[0])}</span></div>
  <div class="badges">${claimBadge(r.claim_status)}<span class="chip plain">${esc(r.certainty ? t('life.mcert.' + r.certainty) : '')}</span><span class="chip plain" lang="en">${esc(r.segment_id)}</span></div></li>`;

function poems(rows, e, segs) {
  const eps = EPISODES[e.event_id] || [];
  const named = segs.filter((s) => /^NM/.test(s.split('-')[0])).map((s) => ({ s, r: rows.find((x) => x.segment_id === s.split('-')[0]) }));
  const byEp = eps.length ? rows.filter((r) => eps.includes(r.episode)) : [];
  const namedHtml = named.length ? `<h3>${esc(t('life.ev.poems.named'))}</h3><ul class="plain-list">${named.map(({ s, r }) => r ? row(r) : `<li lang="en">${esc(s)}: <span class="faint" lang="${lang()}">${esc(t('life.ev.poems.notfound'))}</span></li>`).join('')}</ul>` : '';
  const shown = 30;
  const epHtml = eps.length ? `<h3>${esc(t('life.ev.poems'))} (${num(byEp.length)})</h3><p class="small muted">${esc(t('life.ev.poems.d', { n: num(byEp.length) }))} ${esc(t('life.ev.poems.episode', { e: eps.join(' / ') }))}</p>
    ${OWN.has(e.event_id) ? `<p class="note doubt">${esc(t('life.ev.poems.own'))}</p>` : ''}
    ${byEp.length ? `<ul class="plain-list" id="eplist">${byEp.slice(0, shown).map(row).join('')}</ul>${byEp.length > shown ? `<p><button type="button" class="btn" id="epmore" data-n="${shown}">${esc(t('more'))}</button></p>` : ''}` : `<p class="faint">${esc(t('life.ev.poems.none'))}</p>`}` : '';
  const box = document.createElement('div');
  box._rows = byEp; box._row = row;
  poems._last = { byEp, row };
  return namedHtml + epHtml + `<p class="small faint">${esc(t('life.ev.segs.note'))}</p>`;
}

function wireMore(box) {
  const b = box.querySelector('#epmore');
  if (!b) return;
  const { byEp, row: rf } = poems._last;
  b.addEventListener('click', () => {
    const n = Number(b.dataset.n) + 30;
    box.querySelector('#eplist').innerHTML = byEp.slice(0, n).map(rf).join('');
    b.dataset.n = n;
    if (n >= byEp.length) b.remove();
  });
}
