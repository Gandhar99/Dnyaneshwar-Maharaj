// #/evidence/text-issues: parts load on demand (about 200 KB each)
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { provisional } from '../../assets/js/components.js';
import { CSS, crumbs } from './common.js';

const SHOW = 100;
export async function render(ctx) {
  const ix = await getJSON('evidence/text_issues_index.json');
  const files = ix.files || [];
  const rows = [];
  let loaded = 0, shown = SHOW, type = ctx.query.get('type') || '';
  const loadNext = async () => { if (loaded < files.length) { rows.push(...(await getJSON(files[loaded++]))); } };
  await loadNext();
  ctx.el.innerHTML = `${CSS}<div class="page wide m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.ti.title'))}</h1>
    <p class="muted">${esc(t('ev.ti.lead'))}</p>
    <div class="badges">${provisional()}</div>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <div class="filters" id="tf" role="group" aria-label="${esc(t('ev.ti.type'))}"></div>
    <p class="small faint" id="tc" role="status" aria-live="polite"></p>
    <div class="scroll-x"><table class="tbl"><thead><tr><th class="nw">${esc(t('ev.ti.doc'))}</th><th>${esc(t('ev.ti.type'))}</th><th>${esc(t('ev.ti.detail'))}</th><th>${esc(t('ev.ti.action'))}</th></tr></thead><tbody id="tb"></tbody></table></div>
    <div class="loadmore"><button type="button" class="btn" id="tm" hidden>${esc(t('more'))}</button> <button type="button" class="btn" id="tl" hidden>${esc(t('ev.ti.load'))}</button>
      <p class="small faint" id="tn"></p></div></div>`;
  const root = ctx.el.querySelector('.page');
  const $ = (s) => root.querySelector(s);
  const draw = () => {
    const types = [...new Set(rows.map((r) => r.issue_type))];
    $('#tf').innerHTML = `<button type="button" class="seg" data-ty="" aria-pressed="${type === ''}">${esc(t('ev.ti.all'))}</button>` +
      types.map((x) => `<button type="button" class="seg" data-ty="${esc(x)}" aria-pressed="${type === x}" lang="en">${esc(x)}</button>`).join('');
    $('#tf').querySelectorAll('[data-ty]').forEach((b) => b.addEventListener('click', () => { type = b.dataset.ty; shown = SHOW; draw(); }));
    const sel = rows.filter((r) => !type || r.issue_type === type);
    $('#tc').textContent = t('ev.ti.count', { n: num(sel.length) });
    $('#tb').innerHTML = sel.slice(0, shown).map((r) => `<tr title="${esc(r.issue_id)}"><td class="nw">${esc(r.document_id || '')}<br><small class="faint">${esc(r.issue_id)}</small></td>
      <td lang="en">${esc(r.issue_type || '')}</td><td lang="en">${esc(r.detail || '')}</td><td lang="en">${esc(r.action || '')}</td></tr>`).join('');
    $('#tm').hidden = sel.length <= shown;
    $('#tl').hidden = loaded >= files.length;
    $('#tn').textContent = files.length > 1 ? t('ev.ti.loaded', { a: num(rows.length ? files.length : 0), b: num(loaded) }).replace(/^/, '') + ' · ' + t('ev.ti.size') : '';
  };
  draw();
  $('#tm').addEventListener('click', () => { shown += SHOW; draw(); });
  $('#tl').addEventListener('click', async (e) => { e.target.disabled = true; await loadNext(); e.target.disabled = false; draw(); });
}
