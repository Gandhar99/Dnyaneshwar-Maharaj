// Map page (#/life/map) and place pages (#/life/places/<id>).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, formatDate } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, claimBadge, loading } from '../../assets/js/components.js';
import { loadLife, loadPlaces, crumbs, lifeCrumb, enNote, cssLink, txt, en, kv, pname, placeMap, matchPlaces, precLabel, fmtCoord, disputeCard, traditionLine, rowId } from './common.js';
import { drawMap, legendSvg, isHalt } from './geo.js';

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}${loading()}</div>`;
  if (ctx.path[0] === 'places' && ctx.path[1]) return placePage(ctx, ctx.path[1]);
  return mapPage(ctx);
}

async function mapPage(ctx) {
  const P = await loadPlaces();
  const view = ctx.query.get('v') === 'route' ? 'route' : 'all';
  const hl = ctx.query.get('p') || '';
  const located = P.places.filter((p) => p.latitude != null && p.longitude != null);
  const missing = P.places.filter((p) => !(p.latitude != null && p.longitude != null));
  const item = (p) => `<li title="${esc(p.place_id)}"><a href="#/life/places/${esc(p.place_id)}">${pname(p)}</a> <span class="small faint">${p.coordinate_precision ? esc(precLabel(p.coordinate_precision)) : ''}</span>
    ${p.identification_disputed ? `<span class="chip plain">${esc(t('life.pl.disputed'))}</span>` : ''}<div class="badges">${claimBadge(p.claim_status)}</div></li>`;
  const draw = (v) => drawMap(P.places, { view: v, highlight: hl, aria: t('life.mp.aria') });
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.mp.title'))}</h1>
    <p class="muted">${esc(t('life.mp.lead'))}</p>
    <div class="maprow">
      <div>
        <div class="filters" role="group">
          ${['all', 'route'].map((v) => `<button type="button" class="seg" data-view="${v}" aria-pressed="${v === view}">${esc(t('life.mp.view.' + v))}</button>`).join('')}
        </div>
        <div class="mapbox" id="mapbox">${draw(view)}</div>
        <p class="small"><strong>${esc(t('life.mp.schematic'))}.</strong> <span class="muted">${esc(t('life.mp.schematic.d'))}</span></p>
        <ul class="legend" aria-label="${esc(t('life.mp.legend'))}">
          <li>${legendSvg.exact}${esc(t('life.mp.l.exact'))}</li><li>${legendSvg.approx}${esc(t('life.mp.l.approx'))}</li>
          <li>${legendSvg.halt}${esc(t('life.mp.l.halt'))}</li><li>${legendSvg.river}${esc(t('life.mp.l.river'))}</li><li>${legendSvg.ridge}${esc(t('life.mp.l.ridge'))}</li></ul>
      </div>
      <aside>
        <h2 style="margin-top:0">${esc(t('life.mp.nocoord'))} (${num(missing.length)})</h2>
        <p class="small muted">${esc(t('life.mp.nocoord.d'))}</p>
        <ul class="plain-list">${missing.map(item).join('')}</ul>
        <h2>${esc(t('life.mp.all'))} (${num(P.places.length)})</h2>
        <ul class="plain-list">${located.map(item).join('')}</ul>
      </aside>
    </div></div>`;
  const box = ctx.el.querySelector('#mapbox');
  ctx.el.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    box.innerHTML = draw(b.dataset.view);
    ctx.el.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    history.replaceState(null, '', href('life/map', b.dataset.view === 'route' ? { v: 'route', p: hl } : { p: hl }));
  }));
}

async function placePage(ctx, id) {
  const [P, L, C] = await Promise.all([loadPlaces(), loadLife(), getJSON('calendar.json')]);
  const p = P.places.find((x) => x.place_id === id);
  if (!p) { ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${crumbs(lifeCrumb())}<h1 tabindex="-1">${esc(t('life.pl.notfound'))}</h1><p><a href="#/life/map">${esc(t('life.pl.back'))}</a></p></div>`; return; }
  const spots = P.memorial_spots.filter((s) => s.place_id === id);
  const events = L.events.filter((e) => matchPlaces(e.place_id, [p]).some((m) => m.place));
  const stops = P.itineraries.filter((i) => i.row_type === 'stop' && i.place_id === id);
  const journeys = [...new Set(stops.map((s) => s.itinerary_id))].map((j) => P.itineraries.find((i) => i.itinerary_id === j && i.row_type === 'itinerary')).filter(Boolean);
  const stages = C.palkhi_stages.filter((s) => !s.variant_of && (s.to_place_id === id || s.from_place_id === id));
  const disp = /Apegaon|Alandi/.test(p.name) ? L.disputes.filter((d) => d.question === 'Birthplace') : [];
  const hasCoord = p.latitude != null && p.longitude != null;
  ctx.el.innerHTML = `<article class="page m-life">${cssLink()}
    ${crumbs(lifeCrumb(), `<a href="#/life/map">${esc(t('life.pl.back'))}</a>`)}
    <h1 tabindex="-1">${pname(p)}</h1>
    ${lang() === 'mr' ? '' : `<p class="muted" lang="mr">${esc(p.name_mr)}</p>`}${enNote()}
    ${honesty(p)}${traditionLine(p)}
    ${p.identification_disputed ? `<p class="note doubt">${esc(t('life.pl.disputed'))}</p>` : ''}
    ${kv([[t('life.pl.role'), en(p.role)], [t('life.pl.village'), en(p.modern_village)], [t('life.pl.taluka'), en(p.taluka)], [t('life.pl.district'), en(p.district)], [t('life.pl.river'), en(p.river)],
      [t('life.mp.coord'), hasCoord ? `<span class="sw">${esc(fmtCoord(p.latitude, p.longitude))}</span> <span class="faint">(${esc(precLabel(p.coordinate_precision))})</span> <a href="${href('life/map', { p: p.place_id })}">${esc(t('life.pl.back'))}</a>` : `<span class="faint">${esc(t('life.mp.none'))}</span>`],
      [t('life.pl.src'), hasCoord ? en(p.coordinate_source) : '']])}
    ${p.note ? `<p lang="en" style="margin-top:var(--sp-3)">${esc(p.note)}</p>` : ''}
    ${p.revision_note ? `<p class="small faint" lang="en">${esc(p.revision_note)}</p>` : ''}${rowId(p.place_id)}
    ${disp.length ? `<h2>${esc(t('life.pl.dispute'))}</h2><div class="cards cols2">${disp.map(disputeCard).join('')}</div>` : ''}
    ${spots.length ? `<h2>${esc(t('life.pl.spots'))}</h2><ul class="plain-list">${spots.map((s) => `<li title="${esc(s.spot_id)}"><a href="#/life/memorials">${lang() === 'mr' ? `<span lang="mr">${esc(s.name_mr)}</span>` : `<span lang="en">${esc(s.name)}</span>`}</a>${honesty(s)}</li>`).join('')}</ul>` : ''}
    ${events.length ? `<h2>${esc(t('life.pl.events'))}</h2><ul class="plain-list">${events.map((e) => `<li title="${esc(e.event_id)}"><a href="${href('life/events/' + e.event_id)}" lang="en">${esc(e.title)}</a><div class="badges">${claimBadge(e.claim_status)}</div></li>`).join('')}</ul>` : ''}
    ${journeys.length ? `<h2>${esc(t('life.pl.journeys'))}</h2><ul class="plain-list">${journeys.map((j) => `<li><a href="${href('life/journeys/' + j.itinerary_id)}" lang="en">${esc(j.name)}</a></li>`).join('')}</ul>` : ''}
    ${stages.length ? `<h2>${esc(t('life.pl.palkhi'))}</h2><ul class="plain-list">${stages.map((s) => `<li><a href="${href('calendar/palkhi/' + s.stage_id)}">${esc(formatDate(s.date, undefined, { day: 'numeric', month: 'long', year: 'numeric' }))}</a> <span lang="en" class="small muted">${esc(s.from_place_name)} → ${esc(s.to_place_name)}</span></li>`).join('')}</ul>` : ''}
  </article>`;
}
