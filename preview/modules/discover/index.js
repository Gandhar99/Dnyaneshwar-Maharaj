// Group 5, Discover: themes, names of God, people, places, things of daily life, scripture references, words portrait.
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { LABELS } from './labels.js';
import { shell, crumbs, nameOf } from './common.js';

registerLabels('dc', LABELS);

export function title(ctx) {
  const [a, b] = ctx.path;
  if (a === 'themes') return b ? t(b) : t('dc.th.title');
  if (a === 'god' || a === 'people' || a === 'places') return b ? nameOf(b) : t(`dc.${a}.title`);
  if (a === 'things') return t('dc.tg.title');
  if (a === 'scripture') return t('dc.sc.title');
  if (a === 'words-portrait') return t('dc.pt.title');
  return t('g.discover');
}

export async function render(ctx) {
  const [a] = ctx.path;
  if (!a) return (await import('./landing.js')).render(ctx);
  if (a === 'themes') return (await import('./themes.js')).render(ctx);
  if (a === 'god' || a === 'people' || a === 'places') return (await import('./names.js')).render(ctx, a);
  if (a === 'things') return (await import('./things.js')).render(ctx);
  if (a === 'scripture') return (await import('./scripture.js')).render(ctx);
  if (a === 'words-portrait') return (await import('./portrait.js')).render(ctx);
  ctx.el.innerHTML = shell(`${crumbs()}<h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p>${esc(t('notfound.body'))}</p>`);
}
