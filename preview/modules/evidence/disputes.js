// #/evidence/disputes (questions) and #/evidence/disputes/<question-slug> (positions side by side)
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, claimBadge, provisional, enText } from '../../assets/js/components.js';
import { CSS, crumbs, slugOf, evCell } from './common.js';

export async function render(ctx) {
  const rows = (await getJSON('life.json')).disputes || [];
  const groups = new Map();
  for (const r of rows) { const k = slugOf(r.question); if (!groups.has(k)) groups.set(k, { q: r.question, rows: [] }); groups.get(k).rows.push(r); }
  const slug = ctx.path[1];
  if (slug) return one(ctx, groups, slug);
  const enNote = lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : '';
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.ds.title'))}</h1>
    <p class="muted">${esc(t('ev.ds.lead'))}</p>
    <div class="badges">${claimBadge('disagreement')}${provisional()}</div>
    ${enNote}
    <ul class="qlist">${[...groups].map(([k, g]) => `<li><a href="${href('evidence/disputes/' + k)}"><b lang="en">${esc(g.q)}</b>
      <small>${esc(t('ev.ds.positions', { n: num(g.rows.length) }))}${g.rows.some((r) => r.claim_status === 'devotional tradition') ? ' · ' + esc(t('cs.devotional tradition')) : ''}</small></a></li>`).join('')}</ul></div>`;
}

function one(ctx, groups, slug) {
  const g = groups.get(slug);
  if (!g) { ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}<h1 tabindex="-1">${esc(t('ev.notfound'))}</h1><p><a href="#/evidence/disputes">${esc(t('ev.ds.all'))}</a></p></div>`; return; }
  const hasView = g.rows.some((r) => r.current_view_if_stated);
  ctx.el.innerHTML = `${CSS}<div class="page wide m-evidence">${crumbs(`<a href="#/evidence/disputes">${esc(t('ev.ds.title'))}</a>`)}
    <h1 tabindex="-1" lang="en">${esc(g.q)}</h1>
    <p class="muted">${esc(t('ev.ds.positions', { n: num(g.rows.length) }))}</p>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <div class="sbs">${g.rows.map((r, i) => `<article class="pos" aria-labelledby="p${i}" title="${esc(r.dispute_id)}">
      <h3 id="p${i}" lang="en"><span class="faint small">${esc(t('ev.ds.position'))} ${esc(num(i + 1))}</span><br>${esc(r.position)}</h3>
      ${honesty({ ...r, source_id: '' })}
      ${r.proponents ? `<div class="lbl">${esc(t('ev.ds.proponents'))}</div>${enText(r.proponents, { note: false })}` : ''}
      <div class="lbl">${esc(t('ev.ds.for'))}</div>${evCell(r.evidence_for)}
      <div class="lbl">${esc(t('ev.ds.against'))}</div>${evCell(r.evidence_against)}
      ${r.current_view_if_stated ? `<div class="view"><div class="lbl">${esc(t('ev.ds.view'))}</div>${enText(r.current_view_if_stated, { note: false })}<p class="faint small">${esc(t('ev.ds.view.note'))}</p></div>` : ''}
      <p class="faint small">${esc(r.dispute_id)}</p>
    </article>`).join('')}</div>
    ${hasView ? '' : ''}<p class="note">${esc(t('ev.ds.nochoice'))}</p>
    <p><a href="#/evidence/disputes">${esc(t('ev.ds.all'))}</a></p></div>`;
}
