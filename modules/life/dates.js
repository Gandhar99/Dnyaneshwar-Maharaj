// Date claims grouped by subject, side by side, exactly as the sources give them. Nothing is converted or computed.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { honesty, loading } from '../../assets/js/components.js';
import { loadLife, crumbs, lifeCrumb, enNote, cssLink, txt, en, kv, eraLabel, disputeCard, rowId } from './common.js';
import { termHtml } from '../../assets/js/mr-terms.js';

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}${loading()}</div>`;
  const L = await loadLife();
  const only = ctx.query.get('s') || '';
  const subjects = [...new Set(L.date_claims.map((d) => d.subject))];
  const shown = only && subjects.includes(only) ? [only] : subjects;
  const card = (d) => `<article class="card" title="${esc(d.date_claim_id)}">
    ${kv([[t('life.dt.era'), d.era ? esc(eraLabel(d.era)) : ''], [t('life.dt.year'), d.era_year ? en(d.era_year) : ''], [t('life.dt.sam'), en(d.samvatsara)],
      [t('life.dt.month'), en(d.month)], [t('life.dt.paksha'), en(d.paksha)], [t('life.dt.tithi'), en(d.tithi)], [t('life.dt.weekday'), en(d.weekday)],
      [t('life.dt.time'), txt(d.time_of_day)], [t('life.dt.ce'), txt(d.ce_date_in_source)]])}
    <p class="small" style="margin-top:.5rem"><span class="faint">${esc(t('life.dt.phrase'))}:</span> ${txt(d.date_phrase)}</p>
    ${d.note ? `<p class="small muted" lang="en">${esc(d.note)}</p>` : ''}
    ${honesty(d)}${rowId(d.date_claim_id)}</article>`;
  const groups = shown.map((s) => {
    const rows = L.date_claims.filter((d) => d.subject === s);
    return `<section aria-labelledby="s-${esc(rows[0].date_claim_id)}"><h3 id="s-${esc(rows[0].date_claim_id)}">${termHtml(s)} <small class="faint">${esc(t(rows.length === 1 ? 'life.dt.claim1' : 'life.dt.claims', { n: num(rows.length) }))}</small></h3>
      <div class="cards auto">${rows.map(card).join('')}</div></section>`;
  }).join('');
  const questions = [...new Set(L.disputes.map((d) => d.question))];
  const disputes = `<h2>${esc(t('life.dt.disputes'))}</h2><p class="muted">${esc(t('life.dt.disputes.d'))}</p>` + questions.map((q) => `<h3>${termHtml(q)}</h3><div class="cards auto">${L.disputes.filter((d) => d.question === q).map(disputeCard).join('')}</div>`).join('');
  ctx.el.innerHTML = `<div class="page wide m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.dt.title'))}</h1>
    <p class="muted">${esc(t('life.dt.lead'))}</p><p class="small faint">${esc(t('life.dt.fewfields'))}</p>${enNote()}
    ${only ? `<p><a class="btn" href="${href('life/dates')}">${esc(t('life.dt.showall'))}</a></p>` : ''}
    ${groups}${only ? '' : disputes}
  </div>`;
}
