// #/connections/shared: shared lines. The data has no such table, so this page says so and says what would be needed.
import { t } from '../../assets/js/i18n.js';
import { esc, href } from '../../assets/js/util.js';
import { crumbs, shell } from './common.js';

export async function render(ctx) {
  ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')], [null, t('cn.sh.title')])}
    <h1 tabindex="-1">${esc(t('cn.sh.title'))}</h1>
    <p class="muted">${esc(t('cn.sh.lead'))}</p>
    <div class="stub"><strong>${esc(t('cn.sh.stub.title'))}</strong><p>${esc(t('cn.sh.stub.body'))}</p></div>
    <h2>${esc(t('cn.sh.near'))}</h2>
    <ul>
      <li>${esc(t('cn.sh.near.1'))} <a href="${href('discover/scripture')}">${esc(t('cn.sh.link.scripture'))}</a></li>
      <li>${esc(t('cn.sh.near.2'))} <a href="#/connections">${esc(t('cn.sh.link.ring'))}</a></li>
    </ul>`);
}
