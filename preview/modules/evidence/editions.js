// #/evidence/editions: how the gatha differs across the three printed editions
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, enText, provisional } from '../../assets/js/components.js';
import { CSS, crumbs } from './common.js';

const MISS = /Missing numbers: \[([^\]]*?)(?:\s*\.\.\.)?\]/;
export async function render(ctx) {
  const [w, gi] = await Promise.all([getJSON('texts/works.json'), getJSON('gatha/index.json')]);
  const gath = w.editions.filter((e) => e.work_id === 'DW05' && /^DNYC-E/.test(e.edition_id));
  const other = w.editions.filter((e) => !gath.includes(e));
  const census = (w.corpus_census || []).filter((c) => c.edition_id);
  const wcode = { 'DNYC-E01': 'SKH1908', 'DNYC-E02': 'SSV', 'DNYC-E03': 'TEL1954' };
  // witness-count distribution from the list index
  const combos = new Map();
  for (const r of gi.rows) {
    const k = (r[4] ? r[4].split('|').map((x) => x.split(':')[0]) : []).sort().join('+');
    combos.set(k, (combos.get(k) || 0) + 1);
  }
  const byK = [3, 2, 1].map((k) => [k, [...combos].filter(([c]) => c.split('+').filter(Boolean).length === k)]);
  const total = gi.rows.length, max = Math.max(...combos.values());
  const wn = (c) => c.split('+').map((x) => t('w.' + x)).join(' + ');
  const en = (v) => (v ? `<span lang="en">${esc(v)}</span>` : '–');
  const col = (e) => {
    const c = census.find((x) => x.edition_id === e.edition_id) || {};
    const miss = (MISS.exec(c.shortfall_reason || '') || [])[1];
    return `<article class="pos" title="${esc(e.edition_id)}"><h3>${esc(t('w.' + wcode[e.edition_id]))}</h3>${honesty(e)}
      <div class="lbl">${esc(t('ev.ed.year'))}</div><p>${e.year ? esc(String(e.year)) : '–'}</p>${e.year_note ? enText(e.year_note, { note: false }).replace('<p ', '<p class="small faint" ') : ''}
      <div class="lbl">${esc(t('ev.ed.editor'))}</div>${en(e.editor)}
      <div class="lbl">${esc(t('ev.ed.press'))}</div>${en(e.publisher_press_place)}
      <div class="lbl">${esc(t('ev.ed.highest'))}</div><p>${esc(num(String(e.poems_for_this_saint || '–')))}</p>
      <div class="lbl">${esc(t('ev.ed.found'))}</div><p>${c.units_found ? esc(num(String(c.units_found))) : '–'}</p>
      <div class="lbl">${esc(t('ev.ed.missing'))}</div><p>${c.numbers_not_found != null ? esc(num(String(c.numbers_not_found))) : '–'}</p>
      <div class="lbl">${esc(t('ev.ed.basis'))}</div>${en(e.base_manuscripts_claimed)}
      <div class="lbl">${esc(t('ev.ed.rel'))}</div>${en(e.relation_to_other_editions)}
      <div class="lbl">${esc(t('ev.ed.text'))}</div><p>${esc(c.text_imported && /full/.test(c.text_imported) ? t('ev.ed.full') : t('ev.ed.incipit'))}</p>
      <div class="lbl">${esc(t('ev.ed.rights'))}</div>${en(e.rights)}
      ${e.digitised_url ? `<p class="small"><a href="${esc(e.digitised_url)}" target="_blank" rel="noopener">${esc(t('ev.ed.scan'))}</a></p>` : ''}
      ${miss ? '' : ''}</article>`;
  };
  ctx.el.innerHTML = `${CSS}<div class="page wide m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.ed.title'))}</h1>
    <p class="muted">${esc(t('ev.ed.lead'))}</p>
    <div class="badges">${provisional()}</div>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <div class="sbs">${gath.map(col).join('')}</div>
    <p class="note">${esc(t('ev.ed.note'))}</p>
    <h2 class="h2">${esc(t('ev.ed.wit'))}</h2>
    <p class="muted">${esc(t('ev.ed.wit.d', { n: num(total) }))}</p>
    ${byK.map(([k, list]) => `<h3 class="h3">${esc(t('ev.ed.wit.k', { k: num(k), n: num(list.reduce((s, [, n]) => s + n, 0)) }))}</h3>
      ${list.sort((a, b) => b[1] - a[1]).map(([c, n]) => `<div class="hbar"><span class="k">${esc(wn(c))}</span><i style="width:${Math.max(2, Math.round(n / max * 45))}%"></i><span>${esc(num(n))}</span></div>`).join('')}`).join('')}
    ${other.length ? `<h2 class="h2">${esc(t('ev.ed.other'))}</h2><p class="muted">${esc(t('ev.ed.other.d'))}</p>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('ev.ed.work'))}</th><th>${esc(t('ev.ed.year'))}</th><th></th></tr></thead><tbody>
      ${other.map((e) => `<tr title="${esc(e.edition_id)}"><td class="nw">${esc(t('work.' + e.work_id))}<br><small class="faint">${esc(e.edition_id)}</small></td><td>${en(e.year != null ? String(e.year) : e.year_note)}</td><td>${honesty(e)}</td></tr>`).join('')}
    </tbody></table></div>` : ''}</div>`;
}
