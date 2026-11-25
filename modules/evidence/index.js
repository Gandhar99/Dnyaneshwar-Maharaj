// Group 7, Evidence. Routes: #/evidence, disputes[/<question>], sources[/<id>], coverage, text-issues, editions, standard, how-made, downloads
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { LABELS } from './labels.js';

registerLabels('ev', LABELS);

const PAGES = { disputes: 'ds.title', sources: 'so.title', coverage: 'co.title', 'text-issues': 'ti.title', editions: 'ed.title', standard: 'st.title', 'how-made': 'hm.title', downloads: 'dl.title' };

export function title(ctx) {
  const a = ctx.path[0];
  return PAGES[a] ? t('ev.' + PAGES[a]) : t('g.evidence');
}

export async function render(ctx) {
  const [a] = ctx.path;
  try {
    if (!a) return (await import('./landing.js')).render(ctx);
    if (a === 'disputes') return (await import('./disputes.js')).render(ctx);
    if (a === 'sources') return (await import('./sources.js')).render(ctx);
    if (a === 'coverage') return (await import('./coverage.js')).render(ctx);
    if (a === 'text-issues') return (await import('./issues.js')).render(ctx);
    if (a === 'editions') return (await import('./editions.js')).render(ctx);
    if (['standard', 'how-made', 'downloads'].includes(a)) return (await import('./pages.js')).render(ctx, a);
  } catch (e) {
    const { errorBox } = await import('../../assets/js/components.js');
    ctx.el.innerHTML = `<div class="page m-evidence">${errorBox(e)}</div>`;
    return;
  }
  ctx.el.innerHTML = `<div class="page m-evidence"><h1 tabindex="-1">${esc(t('ev.notfound'))}</h1><p><a href="#/evidence">${esc(t('ev.back'))}</a></p></div>`;
}
