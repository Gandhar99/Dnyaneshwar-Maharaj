// Group 6, Words. Routes: #/words, #/words/glossary/<id>, #/words/old-forms, #/words/check
import { t, registerLabels } from '../../assets/js/i18n.js';
import { LABELS } from './labels.js';

registerLabels('wd', LABELS);

export function title(ctx) {
  const [a] = ctx.path;
  if (a === 'old-forms') return t('wd.of.title');
  if (a === 'check') return t('wd.ck.title');
  return t('g.words');
}

export async function render(ctx) {
  const [a] = ctx.path;
  if (a === 'glossary' && ctx.path[1]) return (await import('./glossary.js')).entry(ctx, ctx.path[1]);
  if (a === 'old-forms') return (await import('./oldforms.js')).render(ctx);
  if (a === 'check') return (await import('./check.js')).render(ctx);
  return (await import('./glossary.js')).list(ctx);
}
