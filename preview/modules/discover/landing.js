// #/discover
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { NAMES } from './pre-names.js';
import { shell, crumbs } from './common.js';

export async function render(ctx) {
  const [mc] = await Promise.all([getJSON('words/material_culture.json')]);
  const cats = new Set(mc.map((r) => r.category)).size;
  const door = (to, key, vars) => `<li><a href="${href(to)}"><span class="mark" aria-hidden="true"></span><span class="t">${esc(t('dc.door.' + key))}</span><span></span><span class="d">${esc(t('dc.door.' + key + '.d', vars))}</span></a></li>`;
  ctx.el.innerHTML = shell(`${crumbs()}
    <h1 tabindex="-1">${esc(t('g.discover'))}</h1>
    <p class="muted">${esc(t('dc.lead'))}</p>
    <ul class="doors">
      ${door('discover/themes', 'themes', { n: num(20) })}
      ${door('discover/god', 'god', { n: num(Object.keys(NAMES.divine).length) })}
      ${door('discover/people', 'people', { n: num(Object.keys(NAMES.people).length) })}
      ${door('discover/places', 'places', { n: num(Object.keys(NAMES.places).length) })}
      ${door('discover/things', 'things', { n: num(mc.length), c: num(cats) })}
      ${door('discover/scripture', 'scripture')}
      ${door('discover/words-portrait', 'portrait')}
    </ul>
    <p class="note">${esc(t('dc.method.rule.note'))}</p>`);
}
