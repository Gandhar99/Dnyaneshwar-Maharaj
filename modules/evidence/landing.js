import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { provisional } from '../../assets/js/components.js';
import { CSS, crumbs, slugOf } from './common.js';

export async function render(ctx) {
  const [life, cov, log, srcs, home] = await Promise.all([getJSON('life.json'), getJSON('evidence/evidence.json'), getJSON('evidence/search_log.json'), getJSON('evidence/sources.json'), getJSON('home.json')]);
  const nq = new Set(life.disputes.map((d) => slugOf(d.question))).size;
  let issues = null;
  try { const ix = await getJSON('evidence/text_issues_index.json'); issues = ix.files.length; } catch { /* optional */ }
  const item = (to, k, d) => `<li><a href="${to}"><span class="mark" aria-hidden="true"></span><span class="t">${esc(t('ev.d.' + k))}</span><span></span><span class="d">${esc(d)}</span></a></li>`;
  const mi = (await getJSON('manifest.json').catch(() => null))?.table_counts?.text_issues;
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('g.evidence'))}</h1>
    <p class="muted">${esc(t('ev.intro'))}</p>
    <div class="badges">${provisional()}</div>
    <ul class="doors">
      ${item(href('evidence/disputes'), 'disputes', t('ev.d.disputes.d', { n: num(life.disputes.length), q: num(nq) }))}
      ${item(href('evidence/sources'), 'sources', t('ev.d.sources.d', { n: num(srcs.length) }))}
      ${item(href('evidence/coverage'), 'coverage', t('ev.d.coverage.d', { n: num(cov.coverage.length), s: num(log.length) }))}
      ${item(href('evidence/text-issues'), 'issues', t('ev.d.issues.d', { n: num(mi || home.counts.text_issues || '') }))}
      ${item(href('evidence/editions'), 'editions', t('ev.d.editions.d'))}
      ${item(href('evidence/standard'), 'standard', t('ev.d.standard.d'))}
      ${item(href('evidence/how-made'), 'how', t('ev.d.how.d'))}
      ${item(href('evidence/downloads'), 'downloads', t('ev.d.downloads.d'))}
    </ul></div>`;
}
