// Traditional dates laid out for astronomical checking. States claims; computes and decides nothing.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { honesty, claimBadge, sourceChips, loading } from '../../assets/js/components.js';
import { loadCal, crumbs, calCrumb, enNote, cssLink, en, txt, rowId, dayDate } from './common.js';
import { getJSON } from '../../assets/js/data.js';

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}${loading()}</div>`;
  const [C, L] = await Promise.all([loadCal(), getJSON('life.json')]);
  const claims = L.date_claims.filter((d) => d.tithi || d.weekday || d.ce_date_in_source);
  const subjects = [...new Set(claims.map((d) => d.subject))];
  const era = (d) => [d.era, d.era_year].filter(Boolean).join(' ');
  const claimRows = subjects.map((s) => `<tr class="subj"><td colspan="9"><span lang="en">${esc(s)}</span></td></tr>` + claims.filter((d) => d.subject === s).map((d) => `<tr title="${esc(d.date_claim_id)}">
    <td class="w">${txt(d.date_phrase)}</td><td>${en(era(d))}</td><td>${en(d.month)}</td><td>${en(d.paksha)}</td><td>${en(d.tithi)}</td><td>${en(d.weekday)}</td><td>${txt(d.ce_date_in_source)}</td>
    <td>${claimBadge(d.claim_status)}</td><td>${sourceChips(d.source_id)}<span class="rowid faint">${esc(d.date_claim_id)}</span></td></tr>`).join('')).join('');
  const k = L.date_claims.length;
  const cnt = (f) => L.date_claims.filter((d) => d[f]).length;
  const obsRows = C.observances.map((o) => `<tr title="${esc(o.observance_id)}"><td class="w"><span lang="en">${esc(o.name)}</span></td>
    <td class="w">${en([o.month, o.paksha].filter(Boolean).join(', '))}<br>${en(o.tithi)}</td>
    <td class="w">${o.gregorian_date_2026 ? `<strong>${esc(dayDate(o.gregorian_date_2026))}</strong><br>` : ''}${en(o.usual_gregorian_window)}</td>
    <td>${claimBadge(o.claim_status)}</td><td>${sourceChips(o.confirmed_by ? o.confirmed_by.join('; ') : o.source_id)}<span class="rowid faint">${esc(o.observance_id)}</span></td></tr>`).join('');
  const withTithi = C.palkhi_stages.filter((s) => s.tithi);
  const stRows = withTithi.map((s) => `<tr title="${esc(s.stage_id)}"><td>${esc(dayDate(s.date))}</td><td class="w"><span lang="en">${esc(s.from_place_name)} → ${esc(s.to_place_name)}</span></td><td class="w">${en(s.tithi)}</td>
    <td>${claimBadge(s.claim_status)}</td><td><a href="${href('calendar/palkhi/' + s.stage_id)}">${esc(s.stage_id)}</a></td></tr>`).join('');
  const th = (...k) => k.map((x) => `<th>${esc(t('cal.sk.col.' + x))}</th>`).join('');
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}
    ${crumbs(calCrumb())}
    <h1 tabindex="-1">${esc(t('cal.sk.title'))}</h1>
    <p class="muted">${esc(t('cal.sk.lead'))}</p>
    <div class="state" role="note"><p><strong>${esc(t('cal.sk.state'))}</strong></p></div>
    <p class="small muted">${esc(t('cal.sk.need'))}</p>${enNote()}
    <h2>${esc(t('cal.sk.a'))}</h2><p class="muted">${esc(t('cal.sk.a.d'))}</p>
    <p class="small faint">${esc(t('cal.sk.gaps'))}: ${esc(t('cal.sk.gaps.n', { k: num(k), m: num(cnt('month')), p: num(cnt('paksha')), w: num(cnt('weekday')) }))}</p>
    <div class="scroll-x"><table class="tbl"><thead><tr>${th('phrase', 'era', 'month', 'paksha', 'tithi', 'weekday', 'ce', 'status')}<th></th></tr></thead><tbody>${claimRows}</tbody></table></div>
    <h2>${esc(t('cal.sk.b'))}</h2><p class="muted">${esc(t('cal.sk.b.d'))}</p>
    <div class="scroll-x"><table class="tbl"><thead><tr>${th('obs')}<th>${esc(t('cal.o.tithi'))}</th>${th('dates', 'status')}<th></th></tr></thead><tbody>${obsRows}</tbody></table></div>
    <h2>${esc(t('cal.sk.c'))}</h2><p class="muted">${esc(t('cal.sk.c.d'))}</p>
    <div class="scroll-x"><table class="tbl"><thead><tr>${th('date', 'stage')}<th>${esc(t('cal.o.tithi'))}</th>${th('status')}<th></th></tr></thead><tbody>${stRows}</tbody></table></div>
  </div>`;
}
