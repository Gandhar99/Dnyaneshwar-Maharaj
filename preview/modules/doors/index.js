// Group 8, Doors (Ways in): curated paths through material that exists on the site, four labelled previews, one placeholder.
// No new facts: see paths.js for how every sentence is tied to data rows.
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { LABELS } from './labels.js';
import { JOURNEYS } from './paths.js';

registerLabels('dr', LABELS);

const READERS = ['students', 'children', 'kirtankars'];
const PREVIEWS = { recitation: 'recitation', chaal: 'chaal', proofreading: 'proofreading', wari: 'wari' };

export function title(ctx) {
  const [a, b] = ctx.path;
  if (READERS.includes(a)) return t('dr.d.' + a);
  if (a === 'journeys' && JOURNEYS[b]) return t('dr.j.' + b);
  if (PREVIEWS[a]) return t('dr.p.' + a);
  if (a === 'ringan-piece') return t('dr.p.ringan');
  return t('g.doors');
}

export async function render(ctx) {
  const [a, b] = ctx.path;
  if (!a) return (await import('./pathview.js')).landing(ctx);
  if (READERS.includes(a)) return (await import('./pathview.js')).door(ctx, a);
  if (a === 'journeys') return (await import('./pathview.js')).journey(ctx, b);
  if (PREVIEWS[a]) return (await import('./previews.js'))[a](ctx);
  if (a === 'ringan-piece') return (await import('./previews.js')).ringan(ctx);
  ctx.el.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('dr.notfound'))}</h1><p><a href="#/doors">${esc(t('dr.allpaths'))}</a></p></div>`;
}
