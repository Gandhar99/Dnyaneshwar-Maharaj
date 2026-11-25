// Memorial spots (#/life/memorials) and the temple's building phases (#/life/temple).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { honesty, claimBadge, loading } from '../../assets/js/components.js';
import { loadPlaces, crumbs, lifeCrumb, enNote, cssLink, en, kv, placeMap, pname, fmtCoord, precLabel, traditionLine, rowId } from './common.js';

export async function renderMemorials(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}${loading()}</div>`;
  const P = await loadPlaces();
  const pm = placeMap(P.places);
  const card = (s) => {
    const pl = pm.get(s.place_id);
    const has = s.latitude != null && s.longitude != null;
    return `<article class="card" title="${esc(s.spot_id)}">
      <h3>${lang() === 'mr' ? `<span lang="mr">${esc(s.name_mr)}</span>` : `<span lang="en">${esc(s.name)}</span>`}</h3>
      ${lang() === 'mr' ? '' : `<p class="small muted" lang="mr">${esc(s.name_mr)}</p>`}
      ${honesty(s)}${traditionLine(s)}
      ${kv([[t('life.mm.kind'), en(s.kind)], [t('life.mm.place'), pl ? `<a href="#/life/places/${esc(pl.place_id)}">${pname(pl)}</a>` : ''], [t('life.mm.within'), en(s.where_within_site)],
        [t('life.mp.coord'), has ? `<span class="sw">${esc(fmtCoord(s.latitude, s.longitude))}</span><br><span class="faint" lang="en">${esc(s.coordinate_precision || '')}</span>` : `<span class="faint">${esc(t('life.mm.nocoord'))}</span>`],
        [t('life.mm.custodian'), en(s.custodian)]])}
      ${s.story ? `<p class="small" lang="en" style="margin-top:.5rem">${esc(s.story)}</p>` : ''}
      ${s.coordinate_source ? `<details><summary class="small">${esc(t('life.pl.src'))}</summary><p class="small muted" lang="en">${esc(s.coordinate_source)}</p></details>` : ''}${rowId(s.spot_id)}</article>`;
  };
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.mm.title'))}</h1>
    <p class="muted">${esc(t('life.mm.lead'))}</p><p class="note">${esc(t('life.mm.coordnote'))}</p>${enNote()}
    <div class="cards auto">${P.memorial_spots.map(card).join('')}</div></div>`;
}

export async function renderTemple(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}${loading()}</div>`;
  const P = await loadPlaces();
  const inst = P.institutions[0];
  const phase = (b) => `<article class="card" title="${esc(b.phase_id)}">
    <h3 lang="en">${esc(b.period_or_year)}</h3>${honesty(b)}
    ${kv([[t('life.tp.what'), en(b.work_done)], [t('life.tp.who'), en(b.patron_or_builder)], [t('life.tp.style'), en(b.style_and_materials)], [t('life.tp.evidence'), en(b.evidence_type)],
      [t('life.tp.prot'), en(b.protection_status)], [t('life.tp.damage'), en(b.damage_or_restoration)]])}${rowId(b.phase_id)}</article>`;
  const first = P.building_phases.filter((b) => b.claim_status === 'disagreement');
  const later = P.building_phases.filter((b) => b.claim_status !== 'disagreement');
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.tp.title'))}</h1>
    <p class="muted">${esc(t('life.tp.lead'))}</p>${enNote()}
    <h2>${esc(t('life.tp.disagree'))}</h2><div class="cards cols2">${first.map(phase).join('')}</div>
    <h2>${esc(t('life.tp.later'))}</h2><div class="cards auto">${later.map(phase).join('')}</div>
    ${inst ? `<h2>${esc(t('life.tp.inst'))}</h2><article class="card" title="${esc(inst.institution_id)}"><h3>${lang() === 'mr' ? `<span lang="mr">${esc(inst.name_mr)}</span>` : `<span lang="en">${esc(inst.name)}</span>`}</h3>${honesty(inst)}
      ${kv([[t('life.tp.inst.web'), en(inst.website_note)], [t('life.tp.inst.pub'), en(inst.publishes)], [t('life.tp.inst.notes'), en(inst.notes)]])}${rowId(inst.institution_id)}</article>` : ''}
  </div>`;
}
