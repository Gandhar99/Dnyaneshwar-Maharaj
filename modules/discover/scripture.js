// #/discover/scripture: references to the Vedas, Puranas, Upanishads, the Gita and so on, plus the carefully assessed comparisons.
import { t, lang, has } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty } from '../../assets/js/components.js';
import { SCR } from './pre-scripture.js';
import { shell, crumbs, lineLabel } from './common.js';

const PAGE = 30;
const groupName = (g) => (has('dc.scr.' + g) ? esc(t('dc.scr.' + g)) : `<span lang="en">${esc(g.replace(/ \[.*\]$/, ''))}</span>`);
const certText = (c) => (c === 'as assessed in package' ? t('dc.sc.cert.pkg') : t('dc.cert.' + c));
const lineLink = (seg) => {
  const [route, kind, a, b] = SCR[seg] || [];
  const lab = lineLabel(kind || '?', a ?? seg, b);
  return route ? `<a href="${esc(href(route))}" title="${esc(seg)}">${lab}</a>` : `<span title="${esc(seg)}">${lab}</span>`;
};

export async function render(ctx) {
  const [rows, cross] = await Promise.all([getJSON('links/scripture_other.json'), getJSON('connections/cross_references.json')]);
  const groups = {};
  rows.forEach((r) => { (groups[r.cited_text] ||= []).push(r); });
  const keys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const certSum = (arr) => ['high', 'medium', 'low', 'as assessed in package'].map((c) => [c, arr.filter((r) => r.certainty === c).length]).filter(([, n]) => n);

  ctx.el.innerHTML = shell(`${crumbs([null, t('dc.sc.title')])}
    <h1 tabindex="-1">${esc(t('dc.sc.title'))}</h1>
    <p class="muted">${esc(t('dc.sc.lead'))}</p>
    <p class="note">${esc(t('dc.sc.note'))}</p>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <h2>${esc(t('dc.sc.groups'))}</h2>
    ${keys.map((k, gi) => `<details class="grp" data-gi="${gi}"><summary><span>${groupName(k)}</span><span class="small faint">${esc(t('dc.sc.n', { n: num(groups[k].length) }))} · ${certSum(groups[k]).map(([c, n]) => esc(certText(c) + ' ' + num(n))).join(', ')}</span></summary><div class="gbody"></div></details>`).join('')}
    <h2>${esc(t('dc.sc.cross'))}</h2>
    <p class="muted">${esc(t('dc.sc.cross.lead'))}</p>
    <ul class="xcards">${cross.map((x) => {
      const [mrPart, enPart] = String(x.topic).split(/\s+\/\s+/);
      const segs = String(x.segment_ids).split(/[;,]\s*/).filter(Boolean);
      return `<li title="${esc(x.cross_id)}"><h3>${enPart ? `<span lang="mr">${esc(mrPart)}</span> <span class="faint" lang="en">/ ${esc(enPart)}</span>` : `<span lang="en">${esc(x.topic)}</span>`}</h3>
        <div class="badges"><span class="badge" title="${esc(t('dc.sc.nostatus.t'))}">${esc(t('dc.sc.nostatus'))}</span><span class="chip" lang="en" title="${esc(x.relationship_type)}">${esc(x.relationship_type)}</span></div>
        <dl class="kv"><dt>${esc(t('dc.sc.classical'))}</dt><dd lang="en">${esc(x.classical_title.replace(/ \[.*\]$/, ''))}</dd>
          <dt>${esc(t('dc.sc.locus'))}</dt><dd lang="en">${esc(x.classical_locus)}</dd>
          <dt>${esc(t('dc.sc.lines'))}</dt><dd>${segs.map(lineLink).join(' · ')}</dd></dl>
        <p lang="en"><strong>${esc(t('dc.sc.assess'))}:</strong> ${esc(x.assessment)}</p>
        ${x.caution ? `<p class="note doubt" lang="en"><strong>${esc(t('dc.sc.caution'))}:</strong> ${esc(x.caution)}</p>` : ''}
        ${x.classical_source ? `<p class="small"><a href="${esc(x.classical_source)}" target="_blank" rel="noopener">${esc(t('dc.sc.link'))}</a></p>` : ''}</li>`;
    }).join('')}</ul>
    <p><a href="#/discover">${esc(t('dc.back'))}</a></p>`);

  ctx.el.querySelectorAll('details.grp').forEach((d) => {
    const arr = groups[keys[+d.dataset.gi]];
    let shown = 0;
    const body = d.querySelector('.gbody');
    const row = (r) => `<div class="srow" title="${esc(r.scripture_ref_id || '')}">
      <p>${lineLink(r.segment_id)} <span class="cert cert-${r.certainty === 'as assessed in package' ? 'high' : esc(r.certainty)}">${esc(certText(r.certainty))}</span> <span class="small faint" lang="en">${esc(r.kind)}</span></p>
      ${r.note ? `<p class="muted" lang="en">${esc(r.note)}</p>` : ''}${honesty(r)}</div>`;
    const more = () => {
      const next = arr.slice(shown, shown + PAGE);
      body.querySelector('.loadmore')?.remove();
      body.insertAdjacentHTML('beforeend', next.map(row).join(''));
      shown += next.length;
      if (shown < arr.length) { body.insertAdjacentHTML('beforeend', `<div class="loadmore"><button type="button" class="btn">${esc(t('more'))} (${esc(num(arr.length - shown))})</button></div>`); body.querySelector('.loadmore button').addEventListener('click', more); }
    };
    d.addEventListener('toggle', () => { if (d.open && !shown) more(); });
  });
}
