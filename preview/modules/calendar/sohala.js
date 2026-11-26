// Sanjeevan Samadhi Sohala 2026: the dates with their confirmation. The countdown is one quiet number, days in Asia/Kolkata.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href, todayIST } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, confirmation, claimBadge, sourceChips, loading } from '../../assets/js/components.js';
import { loadCal, crumbs, calCrumb, enNote, cssLink, en, kv, dayLong, rowId, ids, confKey, daysTo } from './common.js';

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}${loading()}</div>`;
  const [C, ev] = await Promise.all([loadCal(), getJSON('evidence/evidence.json')]);
  const main = C.observances.find((o) => o.observance_id === 'DNYP-OB-01');
  const wd = C.observances.find((o) => o.observance_id === 'DNYP-OB-02');
  const rows = C.observances.filter((o) => o.gregorian_date_2026 && o.observance_id.startsWith('DNYG-P-OB')).sort((a, b) => a.gregorian_date_2026.localeCompare(b.gregorian_date_2026));
  const samadhi = rows.find((o) => o.observance_id === 'DNYG-P-OB02');
  const cv = (ev.coverage || []).find((r) => r.gap_id === 'DNYG-P-CV10');
  const n = samadhi ? daysTo(samadhi.gregorian_date_2026, todayIST()) : null;
  const count = n === null ? '' : n > 0 ? `<p class="count" role="status">${esc(t('cal.sh.days', { n: '@@' })).replace('@@', `<b>${esc(num(n))}</b>`)}</p>` : n === 0 ? `<p class="count" role="status">${esc(t('cal.sh.today'))}</p>` : `<p class="count faint" role="status">${esc(t('cal.sh.past'))}</p>`;
  const card = (o) => `<article class="card conf-${confKey(o.confirmation)}" title="${esc(o.observance_id)}">
    <p class="bigdate">${esc(dayLong(o.gregorian_date_2026))}</p>
    <h3 lang="en">${esc(o.name)}</h3>
    <div class="badges">${confirmation(o.confirmation, o.confirmed_by)}${claimBadge(o.claim_status)}</div>
    ${kv([[t('cal.o.tithi'), en(o.tithi)], [t('cal.o.rit'), en(o.rituals)]])}
    <p class="small" style="margin-top:.5rem"><span class="faint">${esc(t('cal.cf.by'))} (${num(ids(o.confirmed_by).length)}):</span> ${sourceChips(ids(o.confirmed_by).join('; '))}</p>
    ${honesty({ provisional: o.provisional })}${rowId(o.observance_id)}</article>`;
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}
    ${crumbs(calCrumb())}
    <h1 tabindex="-1">${esc(t('cal.sh.title'))}</h1>
    <p class="muted">${esc(t('cal.sh.lead'))}</p>
    ${count}
    <ul class="legend3" aria-label="${esc(t('cal.cf.title'))}">
      <li>${confirmation('confirmed', '')}</li><li>${confirmation('two sources', '')}</li><li>${confirmation('single source', '')}</li></ul>
    <div class="note"><p style="margin:0 0 .4rem">${esc(t('cal.cf.cv10'))}</p>
      ${cv ? `<p class="small" style="margin:0"><span class="chip plain" title="${esc(cv.gap_id)}">${esc(t('cal.cf.cv10.src', { id: cv.gap_id }))}</span></p>${enNote()}<p class="small" lang="en" style="margin:.3rem 0 0">${esc(cv.found)}</p>` : ''}</div>
    <h2>${esc(t('cal.sh.rows'))}</h2>
    <div class="cards auto">${rows.map(card).join('')}</div>
    <p class="small muted">${esc(t('cal.sh.sources'))}</p>
    ${main ? `<h2>${esc(t('cal.sh.programme'))}</h2>${enNote()}<p lang="en">${esc(main.programme_2026 || '')}</p>${honesty({ claim_status: main.claim_status, provisional: main.provisional, source_id: main.source_id })}${rowId(main.observance_id)}
      <h2>${esc(t('cal.sh.festival'))}</h2><p class="muted">${esc(t('cal.sh.festival.d'))}</p>
      <div class="card"><p class="small faint">${esc(t('cal.o.tithi'))}</p><p lang="en">${esc(main.tithi)}</p>
        <p class="small faint">${esc(t('cal.sh.notes'))}</p><p class="small" lang="en">${esc(main.notes || '')}</p>${honesty(main)}</div>` : ''}
    ${wd ? `<h2>${esc(t('cal.sh.weekday'))}</h2><div class="card" title="${esc(wd.observance_id)}"><h3 lang="en">${esc(wd.name)}</h3>${honesty(wd)}
      ${kv([[t('cal.o.tithi'), en(wd.tithi)], [t('cal.o.window'), en(wd.usual_gregorian_window)]])}<p class="small muted" lang="en">${esc(wd.notes || '')}</p>${rowId(wd.observance_id)}</div>` : ''}
    <p><a class="btn" href="#/calendar/sky">${esc(t('cal.sh.sky'))}</a></p>
  </div>`;
}
