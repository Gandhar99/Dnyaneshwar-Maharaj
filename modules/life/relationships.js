// Relationships of the saint: family, guru line, fellow saints. Each row with its claim status and source.
import { t } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { honesty, loading } from '../../assets/js/components.js';
import { loadLife, crumbs, lifeCrumb, enNote, cssLink, en, relLabel, rowId } from './common.js';

const FAMILY = /^(father|mother|grandfather|elder brother|younger brother|younger sister)/;
const LINEAGE = /guru|lineage/;
const CIRCLE = /companion|saint|follower|devotee|editor|opponent|addressee|hagiographer|scribe|yogi/;

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page m-life">${cssLink()}${loading()}</div>`;
  const L = await loadLife();
  const sec = (r) => (FAMILY.test(r.relation) ? 'family' : LINEAGE.test(r.relation) ? 'lineage' : CIRCLE.test(r.relation) ? 'circle' : 'other');
  const groups = ['family', 'lineage', 'circle', 'other'].map((k) => [k, L.relationships.filter((r) => sec(r) === k)]).filter(([, rows]) => rows.length);
  const item = (r) => `<li title="${esc(r.relationship_id)}"><div><strong class="rel">${relLabel(r.relation)}</strong>: <span lang="en">${esc(r.object)}</span></div>
    ${r.note ? `<div class="small muted" lang="en">${esc(r.note)}</div>` : ''}${honesty(r)}${rowId(r.relationship_id)}</li>`;
  ctx.el.innerHTML = `<div class="page m-life">${cssLink()}
    ${crumbs(lifeCrumb())}
    <h1 tabindex="-1">${esc(t('life.rl.title'))}</h1>
    <p class="muted">${esc(t('life.rl.lead'))}</p>${enNote()}
    ${groups.map(([k, rows]) => `<h2>${esc(t('life.rl.' + k))} <small class="faint">${num(rows.length)}</small></h2><ul class="plain-list">${rows.map(item).join('')}</ul>`).join('')}
  </div>`;
}
