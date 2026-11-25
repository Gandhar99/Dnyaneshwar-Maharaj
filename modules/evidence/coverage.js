// #/evidence/coverage: what was searched and what is left
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, provisional } from '../../assets/js/components.js';
import { CSS, crumbs, evCell } from './common.js';

export async function render(ctx) {
  const [ev, log] = await Promise.all([getJSON('evidence/evidence.json'), getJSON('evidence/search_log.json')]);
  const en = (v) => (v ? `<span lang="en">${esc(v)}</span>` : '');
  ctx.el.innerHTML = `${CSS}<div class="page wide m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.co.title'))}</h1>
    <p class="muted">${esc(t('ev.co.lead'))}</p>
    <div class="badges">${provisional()}</div>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <h2 class="h2">${esc(t('ev.co.gaps'))} · ${esc(num(ev.coverage.length))}</h2>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('ev.co.area'))}</th><th>${esc(t('ev.co.included'))}</th><th>${esc(t('ev.co.limit'))}</th><th>${esc(t('ev.co.next'))}</th></tr></thead><tbody>
      ${ev.coverage.map((g) => `<tr title="${esc(g.gap_id)}"><td>${en(g.area)}<br><small class="faint">${esc(g.gap_id)}</small></td><td>${en(g.included)}</td><td>${en(g.limitation)}</td><td>${en(g.next_step)}</td></tr>`).join('')}
    </tbody></table></div>
    <h2 class="h2">${esc(t('ev.co.log'))} · ${esc(num(log.length))}</h2>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('ev.co.where'))}</th><th>${esc(t('ev.co.query'))}</th><th>${esc(t('ev.co.result'))}</th><th class="nw">${esc(t('ev.co.date'))}</th><th></th></tr></thead><tbody>
      ${log.map((l) => `<tr title="${esc(l.search_id)}"><td>${en(l.where)}</td><td>${en(l.query)}</td><td>${en(l.result)}</td><td class="nw">${esc(l.date || '')}</td>
        <td>${honesty({ claim_status: l.claim_status, provisional: false, source_id: l.source_id })}</td></tr>`).join('')}
    </tbody></table></div>
    <h2 class="h2">${esc(t('ev.co.excl'))} · ${esc(num(ev.exclusions.length))}</h2>
    <p class="muted">${esc(t('ev.co.excl.d'))}</p>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>Item</th><th>${esc(t('ev.co.reason'))}</th></tr></thead><tbody>
      ${ev.exclusions.map((x) => `<tr title="${esc(x.exclusion_id)}"><td>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener" lang="${/[ऀ-ॿ]/.test(x.title) ? 'mr' : 'en'}">${esc(x.title)}</a>` : esc(x.title)}</td><td>${en(x.reason)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}
