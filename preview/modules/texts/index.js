// Group 1, Texts. Reference features built in stage 2: the gatha (list + poem page) and the Dnyaneshwari reader.
// Stage 3 adds the three shorter works here (routes texts/amritanubhav, texts/changdev-pasashti, texts/haripath).
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { LABELS } from './labels.js';

registerLabels('tx', LABELS);

export function title(ctx) {
  const [w, x] = ctx.path;
  if (w === 'dnyaneshwari') return x ? `${t('work.DW01')} ${num(x)}` : t('work.DW01');
  if (w === 'gatha') return t('work.DW05');
  if (w === 'amritanubhav') return t('work.DW02');
  if (w === 'changdev-pasashti') return t('work.DW03');
  if (w === 'haripath') return t('work.DW04');
  return t('g.texts');
}

export async function render(ctx) {
  const [w] = ctx.path;
  if (w === 'gatha') return (await import('./gatha.js')).render(ctx);
  if (w === 'dnyaneshwari') return (await import('./dnyaneshwari.js')).render(ctx);
  if (w === 'amritanubhav') return (await import('./works.js')).amritanubhav(ctx);
  if (w === 'changdev-pasashti') return (await import('./works.js')).pasashti(ctx);
  if (w === 'haripath') return (await import('./works.js')).haripath(ctx);
  return landing(ctx);
}

async function landing(ctx) {
  const [home, dw] = await Promise.all([getJSON('home.json'), getJSON('texts/dnyaneshwari/index.json')]);
  const c = home.counts;
  const item = (hrefTo, title, desc) => `<li><a href="${hrefTo}"><span class="mark" aria-hidden="true"></span><span class="t" lang="mr">${esc(title)}</span><span></span><span class="d">${desc}</span></a></li>`;
  const sw = (slug) => home.short_works.find((s) => s.slug === slug && s.role === 'main');
  ctx.el.innerHTML = `<div class="page">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a></p>
    <h1 tabindex="-1">${esc(t('g.texts'))}</h1>
    <p class="muted">${esc(t('tx.intro'))}</p>
    <ul class="doors">
      ${item('#/texts/dnyaneshwari', 'ज्ञानेश्वरी', esc(t('tx.dw01.d', { ch: num(dw.chapters.length), n: num(c.dnyaneshwari_ovi) })))}
      ${item('#/texts/gatha', 'अभंगांची गाथा', esc(t('tx.gatha.d', { n: num(c.gatha_compositions), k: num(c.gatha_with_text) })))}
      ${item('#/texts/amritanubhav', 'अमृतानुभव', esc(t('tx.amr.lead')))}
      ${item('#/texts/changdev-pasashti', 'चांगदेव पासष्टी', esc(t('tx.n.units', { n: num(sw('changdev-pasashti')?.n || 0) })))}
      ${item('#/texts/haripath', 'हरिपाठ', esc(t('tx.hp.lead', { n: num(sw('haripath')?.n || 0) })))}
    </ul>
    <p class="note">${esc(t('tx.rights'))}</p>
  </div>`;
}
