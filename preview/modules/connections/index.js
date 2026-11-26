// Group 4, Circle of saints: the ring, one page per saint, dialogues, guru lineage, shared lines.
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { LABELS } from './labels.js';
import { SLUG, saintName, crumbs, shell } from './common.js';

registerLabels('cn', LABELS);

export function title(ctx) {
  const [a] = ctx.path;
  if (a === 'dialogues') return t('cn.dl.title');
  if (a === 'lineage') return t('cn.ln.title');
  if (a === 'shared') return t('cn.sh.title');
  if (SLUG[a]) return saintName(SLUG[a]);
  return t('g.connections');
}

export async function render(ctx) {
  const [a] = ctx.path;
  if (!a) return (await import('./ring.js')).render(ctx);
  if (a === 'dialogues') return (await import('./dialogues.js')).render(ctx);
  if (a === 'lineage') return (await import('./lineage.js')).render(ctx);
  if (a === 'shared') return (await import('./shared.js')).render(ctx);
  if (SLUG[a]) return (await import('./saint.js')).render(ctx, SLUG[a]);
  ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')])}<h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p>${esc(t('notfound.body'))}</p>`);
}
