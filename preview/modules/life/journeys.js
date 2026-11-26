// Journeys: the three itineraries. The two pilgrimage lists disagree and are shown side by side.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { honesty, claimBadge, loading } from '../../assets/js/components.js';
import { loadPlaces, crumbs, lifeCrumb, enNote, cssLink, txt, en, kv, placeMap, pname, certLabel, rowId } from './common.js';
import { drawMap } from './geo.js';

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}${loading()}</div>`;
  const P = await loadPlaces();
  const its = P.itineraries.filter((i) => i.row_type === 'itinerary');
  const stopsOf = (id) => P.itineraries.filter((i) => i.row_type === 'stop' && i.itinerary_id === id).sort((a, b) => a.stop_order - b.stop_order);
  const pm = placeMap(P.places);
  const id = ctx.path[1];

  const stopList = (stops) => `<ol class="stoplist">${stops.map((s) => {
    const pl = s.place_id && pm.get(s.place_id);
    const has = pl && pl.latitude != null;
    return `<li data-n="${num(String(s.stop_order))}" class="${has ? 'loc' : ''}" title="${esc(s.itinerary_id)} #${esc(s.stop_order)}"><span lang="en">${esc(s.place_name_in_text)}</span>
      ${pl ? ` <a class="chip" href="#/life/places/${esc(pl.place_id)}">${pname(pl)}</a>` : ''}
      <div class="small faint">${esc(certLabel(s.identification_certainty))} · ${s.date_or_period === 'undated' ? esc(t('life.jr.undated')) : en(s.date_or_period)}</div>
      ${s.note ? `<div class="small muted" lang="en">${esc(s.note)}</div>` : ''}${claimBadge(s.claim_status)}</li>`;
  }).join('')}</ol>`;

  const head = (it) => `<h2 lang="en" style="margin-top:0">${esc(it.name)}</h2>${honesty(it)}${kv([[t('life.jr.travellers'), en(it.travellers)], [t('life.jr.source'), en(it.work_and_segment_ids)]])}
    ${it.note ? `<p class="small muted" lang="en">${esc(it.note)}</p>` : ''}${rowId(it.itinerary_id)}`;

  if (id) {
    const it = its.find((x) => x.itinerary_id === id);
    if (!it) { ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${crumbs(lifeCrumb())}<h1 tabindex="-1">${esc(t('life.jr.notfound'))}</h1><p><a href="#/life/journeys">${esc(t('life.jr.title'))}</a></p></div>`; return; }
    const stops = stopsOf(id);
    const marks = new Map();
    stops.forEach((s) => { const pl = s.place_id && pm.get(s.place_id); if (pl && pl.latitude != null) marks.set(pl.place_id, [...(marks.get(pl.place_id) || []), s.stop_order]); });
    const others = its.filter((x) => x !== it && ['DNYP-IT-01', 'DNYP-IT-02'].includes(id) && ['DNYP-IT-01', 'DNYP-IT-02'].includes(x.itinerary_id));
    ctx.el.innerHTML = `<article class="page wide m-life">${cssLink()}
      ${crumbs(lifeCrumb(), `<a href="#/life/journeys">${esc(t('life.jr.title'))}</a>`)}
      <h1 tabindex="-1" lang="en">${esc(it.name)}</h1>${enNote()}
      ${honesty(it)}${kv([[t('life.jr.travellers'), en(it.travellers)], [t('life.jr.source'), en(it.work_and_segment_ids)]])}${it.note ? `<p class="small muted" lang="en">${esc(it.note)}</p>` : ''}${rowId(it.itinerary_id)}
      ${others.length ? `<p class="note doubt">${esc(t('life.jr.disagree'))} <a href="#/life/journeys">${esc(t('life.jr.compare'))}</a></p>` : ''}
      <div class="maprow"><div>
        <h2 style="margin-top:0">${esc(t('life.jr.stops', { n: num(stops.length) }))}</h2>${stopList(stops)}</div>
        <div><div class="mapbox">${drawMap(P.places.filter((p) => marks.has(p.place_id)), { view: 'all', marks, aria: t('life.mp.aria') })}</div>
        <p class="small muted">${esc(t('life.jr.located', { n: num(marks.size), k: num(stops.length) }))}. ${esc(t('life.jr.map'))}</p></div></div>
    </article>`;
    return;
  }
  const pil = its.filter((x) => ['DNYP-IT-01', 'DNYP-IT-02'].includes(x.itinerary_id));
  const rest = its.filter((x) => !pil.includes(x));
  const col = (it) => `<section class="card" aria-label="${esc(it.name)}">${head(it)}<h3>${esc(t('life.jr.stops', { n: num(stopsOf(it.itinerary_id).length) }))}</h3>${stopList(stopsOf(it.itinerary_id))}
    <p><a class="btn" href="${href('life/journeys/' + it.itinerary_id)}">${esc(t('life.jr.open'))}</a></p></section>`;
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.jr.title'))}</h1>
    <p class="muted">${esc(t('life.jr.lead'))}</p>${enNote()}
    <h2>${esc(t('life.jr.compare'))}</h2><p class="note doubt">${esc(t('life.jr.disagree'))}</p>
    <div class="twocol">${pil.map(col).join('')}</div>
    ${rest.map((it) => `<h2 style="margin-top:var(--sp-6)"></h2><div class="twocol">${col(it)}</div>`).join('')}
  </div>`;
}
