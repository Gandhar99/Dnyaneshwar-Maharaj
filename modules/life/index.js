// Group 2, Life and places. Routes: #/life, events[/<id>], dates, relationships, map, places/<id>, journeys[/<id>], memorials, temple.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { honesty, loading, errorBox } from '../../assets/js/components.js';
import { LABELS } from './labels.js';
import { loadLife, loadPlaces, crumbs, enNote, cssLink, txt, en, disputeCard, rowId } from './common.js';

registerLabels('life', LABELS);

const SUB = { events: 'events', dates: 'dates', relationships: 'relationships', map: 'map', places: 'map', journeys: 'map', memorials: 'memorials', temple: 'memorials' };
const NAMES = { events: 'ev.title', dates: 'dt.title', relationships: 'rl.title', map: 'mp.title', places: 'pl.back', journeys: 'jr.title', memorials: 'mm.title', temple: 'tp.title' };

export function title(ctx) {
  const [s] = ctx.path;
  return NAMES[s] ? `${t('life.' + NAMES[s])} · ${t('g.life')}` : t('g.life');
}

export async function render(ctx) {
  const [s] = ctx.path;
  try {
    if (!s) return await overview(ctx);
    if (s === 'events') return (await import('./events.js')).render(ctx);
    if (s === 'dates') return (await import('./dates.js')).render(ctx);
    if (s === 'relationships') return (await import('./relationships.js')).render(ctx);
    if (s === 'map' || s === 'places') return (await import('./map.js')).render(ctx);
    if (s === 'journeys') return (await import('./journeys.js')).render(ctx);
    if (s === 'memorials') return (await import('./memorials.js')).renderMemorials(ctx);
    if (s === 'temple') return (await import('./memorials.js')).renderTemple(ctx);
    ctx.el.innerHTML = `<div class="page m-life">${cssLink()}<h1 tabindex="-1">${esc(t('life.ev.notfound'))}</h1><p><a href="#/life">${esc(t('g.life'))}</a></p></div>`;
  } catch (e) {
    console.error(e);
    ctx.el.innerHTML = `<div class="page m-life">${crumbs(`<a href="#/life">${esc(t('g.life'))}</a>`)}<h1 tabindex="-1">${esc(t('g.life'))}</h1>${errorBox(e)}</div>`;
  }
}

async function overview(ctx) {
  ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${loading()}</div>`;
  const [L, P] = await Promise.all([loadLife(), loadPlaces()]);
  const door = (to, k, n) => `<li><a href="#/life/${to}"><span class="mark" aria-hidden="true"></span><span class="t">${esc(t('life.door.' + k))}</span><span></span><span class="d">${esc(t('life.door.' + k + '.d', { n: n != null ? num(n) : '' }))}</span></a></li>`;
  const birth = L.disputes.filter((d) => d.question === 'Birthplace');
  const byKind = {};
  L.reception.forEach((r) => (byKind[r.kind] ||= []).push(r));
  const profRow = (p) => {
    const mr = lang() === 'mr' && p.value_mr;
    return `<tr title="${esc(p.profile_id)}"><td>${esc(t('life.pf.' + p.field))}</td><td>${mr ? `<span lang="mr">${esc(p.value_mr)}</span>` : txt(p.value)}${p.variant_note ? `<br><span class="small faint" lang="en">${esc(p.variant_note)}</span>` : ''}</td><td>${honesty(p)}${rowId(p.profile_id)}</td></tr>`;
  };
  const prof = `<details><summary>${esc(t('life.profile'))} (${num(L.profile.length)})</summary>
      <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('life.prof.field'))}</th><th>${esc(t('life.prof.value'))}</th><th></th></tr></thead><tbody>${L.profile.map(profRow).join('')}</tbody></table></div></details>`;
  const icon = `<details><summary>${esc(t('life.icon'))} (${num(L.iconography.length)})</summary><p class="muted small">${esc(t('life.icon.d'))}</p>
      <div class="cards auto">${L.iconography.map((i) => `<article class="card" title="${esc(i.iconography_id)}"><p lang="en">${esc(i.description)}</p>
        <p class="small faint" lang="en">${esc([i.posture, i.companions, i.emblem_objects].filter(Boolean).join(' · '))}</p>
        ${i.note ? `<p class="small muted" lang="en">${esc(i.note)}</p>` : ''}${honesty(i)}${rowId(i.iconography_id)}</article>`).join('')}</div></details>`;
  const rec = `<details><summary>${esc(t('life.reception'))} (${num(L.reception.length)})</summary>
      ${Object.entries(byKind).map(([k, rows]) => `<h3>${esc(t('life.rec.kind.' + k))}</h3><div class="cards auto">${rows.map((r) => `<article class="card" title="${esc(r.reception_id)}">
        <p class="small faint"><span lang="en">${esc(r.who)}</span></p><p lang="en">${esc(r.summary)}</p>${r.note ? `<p class="small faint" lang="en">${esc(r.note)}</p>` : ''}${honesty(r)}${rowId(r.reception_id)}</article>`).join('')}</div>`).join('')}</details>`;

  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(esc(t('g.life')))}
    <h1 tabindex="-1">${esc(t('g.life'))}</h1>
    <p class="muted">${esc(t('life.intro'))}</p>
    ${enNote()}
    <ul class="doors two">
      ${door('events', 'events', L.events.length)}${door('dates', 'dates')}${door('relationships', 'rel')}
      ${door('map', 'map', P.places.length)}${door('journeys', 'journeys')}${door('memorials', 'memorials')}${door('temple', 'temple')}
    </ul>
    <h2>${esc(t('life.birthplace'))}</h2><p class="muted">${esc(t('life.birthplace.d'))}</p>
    <div class="cards cols2">${birth.map(disputeCard).join('')}</div>
    <p class="small"><a href="#/life/places/DNYP-PL-02">${esc(lang() === 'mr' ? 'आपेगाव' : 'Apegaon')}</a> · <a href="#/life/places/DNYP-PL-01">${esc(lang() === 'mr' ? 'आळंदी' : 'Alandi')}</a> · <a href="#/life/dates">${esc(t('life.dt.disputes'))}</a></p>
    <h2>${esc(t('life.profile'))}</h2>
    ${prof}${icon}${rec}
  </div>`;
}
