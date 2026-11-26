// Old forms (#/words/old-forms): only what the glossary states (headword differs from the written form).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, debounce } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { norm } from '../../assets/js/search-norm.js';
import { claimBadge, provisional, sourceChips } from '../../assets/js/components.js';

export async function render(ctx) {
  const rows = (await getJSON('words/glossary_terms.json')).filter(([, w, h]) => h && h !== w)
    .map(([id, word, headword, mr, en, basis, cs]) => ({ id, word, headword, mr, en, cs, n: norm(word + ' ' + headword) }));
  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/words/style.css"><div class="page m-words">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/words">${esc(t('g.words'))}</a></p>
    <h1 tabindex="-1">${esc(t('wd.of.title'))}</h1>
    <p class="muted">${esc(t('wd.of.lead'))}</p>
    <div class="badges">${claimBadge('broadly supported')}${provisional()}${sourceChips('DNYG-G-S01')}</div>
    <div class="note doubt">${esc(t('wd.of.todo'))}</div>
    <div class="field"><label class="vh" for="oq">${esc(t('wd.find'))}</label>
      <input id="oq" type="search" lang="mr" placeholder="${esc(t('wd.find'))}" autocomplete="off"></div>
    <p class="small faint" id="ocount" role="status" aria-live="polite"></p>
    <div class="scroll-x"><table class="tbl otbl"><thead><tr><th scope="col">${esc(t('wd.of.written'))}</th><th scope="col">${esc(t('wd.of.head'))}</th>
      <th scope="col">${esc(t('wd.mr'))}</th></tr></thead><tbody id="obody"></tbody></table></div>
  </div>`;
  const root = ctx.el.querySelector('.page');
  const body = root.querySelector('#obody'), cnt = root.querySelector('#ocount');
  const show = (q) => {
    const nq = norm(q);
    const sel = rows.filter((r) => !nq || r.n.includes(nq));
    cnt.textContent = t('wd.of.n', { n: num(sel.length) });
    body.innerHTML = sel.map((r) => `<tr><td lang="mr" class="wd"><a href="${href('words/glossary/' + r.id)}">${esc(r.word)}</a></td><td lang="mr" class="wd">${esc(r.headword)}</td>
      <td lang="${lang() === 'mr' ? 'mr' : 'en'}">${esc(lang() === 'mr' ? r.mr : (r.en || r.mr))}</td></tr>`).join('');
  };
  show('');
  root.querySelector('#oq').addEventListener('input', debounce((e) => show(e.target.value), 160));
}
