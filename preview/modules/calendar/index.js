// Group 3, Calendar and wari. Routes: #/calendar, sohala, palkhi[/<stage_id>], sky.
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { honesty, confirmation, claimBadge, sourceChips, loading, errorBox } from '../../assets/js/components.js';
import { LABELS } from './labels.js';
import { loadCal, loadPlaces, crumbs, calCrumb, enNote, cssLink, en, kv, monthKey, dayDate, rowId, ids } from './common.js';

registerLabels('cal', LABELS);

export function title(ctx) {
  const [s] = ctx.path;
  const k = { sohala: 'sh.title', palkhi: 'pk.title', sky: 'sk.title' }[s];
  return k ? `${t('cal.' + k)} · ${t('g.calendar')}` : t('g.calendar');
}

export async function render(ctx) {
  const [s] = ctx.path;
  try {
    if (s === 'sohala') return (await import('./sohala.js')).render(ctx);
    if (s === 'palkhi') return (await import('./palkhi.js')).render(ctx);
    if (s === 'sky') return (await import('./sky.js')).render(ctx);
    return await calendar(ctx);
  } catch (e) {
    console.error(e);
    ctx.el.innerHTML = `<div class="page m-calendar">${crumbs(calCrumb())}<h1 tabindex="-1">${esc(t('g.calendar'))}</h1>${errorBox(e)}</div>`;
  }
}

async function calendar(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}${loading()}</div>`;
  const [C, P] = await Promise.all([loadCal(), loadPlaces()]);
  const door = (to, k) => `<li><a href="#/calendar/${to}"><span class="mark" aria-hidden="true"></span><span class="t">${esc(t('cal.door.' + k))}</span><span></span><span class="d">${esc(t('cal.door.' + k + '.d'))}</span></a></li>`;
  const base = C.observances.filter((o) => !o.gregorian_date_2026);
  const y26 = C.observances.filter((o) => o.gregorian_date_2026).sort((a, b) => a.gregorian_date_2026.localeCompare(b.gregorian_date_2026));
  const card = (o) => `<article class="card" title="${esc(o.observance_id)}">
    <h3 lang="en">${esc(o.name)}</h3>${honesty(o)}
    ${kv([[t('cal.o.month'), en(o.month)], [t('cal.o.paksha'), en(o.paksha)], [t('cal.o.tithi'), en(o.tithi)], [t('cal.o.window'), en(o.usual_gregorian_window)],
      [t('cal.o.org'), en(o.organiser === '-' ? '' : o.organiser)], [t('cal.o.rit'), en(o.rituals === '-' ? '' : o.rituals)]])}
    ${o.notes ? `<p class="small muted" lang="en" style="margin-top:.5rem">${esc(o.notes)}</p>` : ''}
    ${o.revision_note ? `<p class="small faint" lang="en">${esc(o.revision_note)}</p>` : ''}${rowId(o.observance_id)}</article>`;
  const order = ['jyeshtha', 'shravan', 'kartik', 'other'];
  const groups = order.map((k) => [k, base.filter((o) => monthKey(o) === k)]).filter(([, r]) => r.length);
  const y26row = (o) => `<li title="${esc(o.observance_id)}"><div class="bigdate" style="font-size:var(--s-1)">${esc(dayDate(o.gregorian_date_2026))}</div>
    <div lang="en">${esc(o.name)}</div><div class="badges">${confirmation(o.confirmation, o.confirmed_by)}${claimBadge(o.claim_status)}${sourceChips(o.source_id)}</div></li>`;
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}
    ${crumbs(esc(t('g.calendar')))}
    <h1 tabindex="-1">${esc(t('g.calendar'))}</h1>
    <p class="muted">${esc(t('cal.intro'))}</p>${enNote()}
    <ul class="doors two">${door('sohala', 'sohala')}${door('palkhi', 'palkhi')}${door('sky', 'sky')}</ul>
    <h2>${esc(t('cal.cal.title'))}</h2><p class="muted">${esc(t('cal.cal.lead'))}</p>
    ${groups.map(([k, rows]) => `<h3>${esc(t('cal.m.' + k))}</h3><div class="cards auto">${rows.map(card).join('')}</div>`).join('')}
    <h2>${esc(t('cal.y2026'))}</h2><p class="muted">${esc(t('cal.y2026.d'))} <a href="#/calendar/sohala">${esc(t('cal.more'))}</a></p>
    <ul class="plain-list">${y26.map(y26row).join('')}</ul>
  </div>`;
}
