// #/connections/lineage: the guru lineage as the tradition gives it, and how often his own texts name Nivruttinath.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty } from '../../assets/js/components.js';
import { SAINTS } from './pre.js';
import { crumbs, shell, ruleNote } from './common.js';

export async function render(ctx) {
  const [life, nv] = await Promise.all([getJSON('life.json'), import('./pre-named-nivruttinath.js').then((m) => m.NAMED)]);
  const prof = life.profile.filter((p) => p.field === 'guru_lineage' || p.field === 'guru');
  const main = prof.find((p) => p.field === 'guru_lineage' && p.value_mr);
  const same = prof.filter((p) => p.field === 'guru_lineage' && p !== main);
  const guru = prof.find((p) => p.field === 'guru');
  const rels = life.relationships.filter((r) => ['DNYL-R004', 'DNYL-R007', 'DNYL-R008'].includes(r.relationship_id));

  const mr = lang() === 'mr';
  const names = main ? (mr ? main.value_mr : main.value).split(/,\s*/).filter(Boolean) : [];
  const chainNames = mr ? names : names.filter((n) => !/^Dnyandev$/i.test(n));
  const chain = `<ol class="chain" aria-label="${esc(t('cn.ln.chain'))}">${chainNames.map((n) => `<li${mr ? ' lang="mr"' : ' lang="en"'}>${esc(n)}</li>`).join('')}
    <li class="he">${esc(t('cn.ln.he'))}</li></ol>`;

  const cert = ['high', 'medium', 'low'].map((c) => [c, nv.items.filter((i) => i[1] === c).length]);
  const works = {};
  nv.items.forEach((i) => { works[i[3]] = (works[i[3]] || 0) + 1; });
  const total = SAINTS.named.Nivruttinath;

  ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')], [null, t('cn.ln.title')])}
    <h1 tabindex="-1">${esc(t('cn.ln.title'))}</h1>
    <p class="muted">${esc(t('cn.ln.lead'))}</p>
    ${main ? `<h2>${esc(t('cn.ln.chain'))}</h2>${chain}${honesty(main)}
      ${main.variant_note ? (mr ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : '')+`<p class="note" lang="en">${esc(main.variant_note)}</p>` : ''}
      <p><a class="btn" href="${href('texts/dnyaneshwari/18', { seg: 'DNY18_1836' })}">${esc(t('cn.ln.gahini'))}: ${esc(t('cn.ln.open'))}</a></p>` : `<p class="muted">${esc(t('cn.rel.none'))}</p>`}
    ${same.length ? `<h3>${esc(t('cn.ln.compare'))}</h3>${same.map((p) => `<p lang="en">${esc(p.value)}</p>${honesty(p)}`).join('')}` : ''}
    ${rels.length || guru ? `<h2>${esc(t('cn.ln.other'))}</h2><ul class="rel">
      ${guru ? `<li title="${esc(guru.profile_id)}"><div class="who" lang="${mr ? 'mr' : 'en'}">${esc(mr ? (guru.value_mr || guru.value) : guru.value)}</div>${guru.variant_note ? `<p class="note-text" lang="en">${esc(guru.variant_note)}</p>` : ''}${honesty(guru)}</li>` : ''}
      ${rels.map((r) => `<li title="${esc(r.relationship_id)}"><div class="who" lang="en">${esc(r.relation)}: ${esc(r.object)}</div>${r.note ? `<p class="note-text" lang="en">${esc(r.note)}</p>` : ''}${honesty(r)}</li>`).join('')}</ul>` : ''}
    <h2>${esc(t('cn.ln.named'))}</h2>
    <p class="muted">${esc(t('cn.ln.named.lead'))}</p>
    ${ruleNote()}
    <p class="note doubt">${esc(t('cn.ln.noise'))}</p>
    <h3>${esc(t('cn.ln.by'))}</h3>
    <ul class="stats" style="list-style:none;padding:0">${cert.map(([c, n]) => `<li><span class="cert cert-${c}">${esc(t('cn.cert.' + c))}</span> <strong>${esc(num(n))}</strong></li>`).join('')}</ul>
    <h3>${esc(t('cn.ln.where'))}</h3>
    <ul class="stats" style="list-style:none;padding:0">${Object.entries(works).map(([k, n]) => `<li>${esc(t('cn.work.' + k))} <strong>${esc(num(n))}</strong></li>`).join('')}</ul>
    <p class="small faint">${esc(t('cn.out.count', { n: num(total.count), m: num(total.segments) }))}</p>
    <p><a class="btn" href="${href('connections/nivruttinath', { list: 'out' })}">${esc(t('cn.gotolist'))}</a></p>`);
}
