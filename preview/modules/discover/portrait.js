// #/discover/words-portrait: a count of his most-used words and names. Counts only; no interpretation.
import { t } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { claimBadge, provisional } from '../../assets/js/components.js';
import { PORTRAIT } from './pre-portrait.js';
import { NAMES } from './pre-names.js';
import { shell, crumbs, nameOf } from './common.js';

// Small connecting words (pronouns, particles, conjunctions, forms of "to be", "to say"): left out of the second list, and shown on the page.
const STOP = 'न तरी तो कां तें हें आणि जें जे ते मग परी जो गा मी तैसें हे ऐसें असे तेथ तेथें तेथे हा नाहीं नाही तया आतां म्हणौनि म्हणोनि जैसा जैसें जैसी तैसा तैसी होय म्हणे ह्मणे पैं कीं काय आहे तंव ना परि जरी ऐसा ऐसी तूं एक मज या जया जेथ जी करी तेणें एथ तैं जेवीं पां असो कांहीं जेणें तेंचि तोचि तुज येणें ठायीं होती ये होये जैं नाना नोहे नव्हे मातें होऊनि कीजे दिसे केलें आघवें माझें माझा माझी तुझा तुझें त्या वो गे'.split(' ');
const STOPSET = new Set(STOP);
const aksharas = (w) => (w.match(/[ऄ-हक़-य़]/g) || []).length;
const FLAGGED = new Set(['Ram', 'Hari', 'Shiva', 'Ganga river', 'Kashi (Varanasi)']);

export async function render(ctx) {
  const st = { c: ctx.query.get('c') === 'gatha' ? 'gatha' : 'dw' };
  const names = [];
  for (const kind of ['divine', 'people', 'places']) for (const [n, s] of Object.entries(NAMES[kind])) names.push({ n, kind, count: s.count, route: kind === 'divine' ? 'god' : kind });
  names.sort((a, b) => b.count - a.count);

  ctx.el.innerHTML = shell(`${crumbs([null, t('dc.pt.title')])}
    <h1 tabindex="-1">${esc(t('dc.pt.title'))}</h1>
    <p class="muted">${esc(t('dc.pt.lead'))}</p>
    <p class="note">${esc(t('dc.pt.note')).replace(/(हरि|हरी)/g, '<span lang="mr">$1</span>')}</p>
    <div class="filters" role="group" aria-label="${esc(t('dc.pt.tabs'))}">
      <button type="button" class="seg" data-c="dw" aria-pressed="${st.c === 'dw'}">${esc(t('dc.pt.dw'))}</button>
      <button type="button" class="seg" data-c="gatha" aria-pressed="${st.c === 'gatha'}">${esc(t('dc.pt.gatha'))}</button></div>
    <div id="corpus"></div>
    <h2>${esc(t('dc.pt.names'))}</h2>
    <p class="small">${claimBadge('reconstruction')} ${provisional()} <span class="muted">${esc(t('dc.pt.names.d'))}</span></p>
    ${ladder(names.slice(0, 14).map((x) => ({ html: `<a href="${href('discover/' + x.route + '/' + x.n)}">${esc(nameOf(x.n))}</a><span class="tag">${esc(t('dc.pt.cat.' + x.kind))}${FLAGGED.has(x.n) ? ' · ' + esc(t('dc.names.flag').split(':')[0]) : ''}</span>`, count: x.count, lang: false })))}
    <p><a href="#/discover">${esc(t('dc.back'))}</a></p>`);

  const box = ctx.el.querySelector('#corpus');
  const paint = () => {
    const p = PORTRAIT[st.c];
    const small = p.top.slice(0, 12);
    const content = p.top.filter(([w]) => !STOPSET.has(w) && aksharas(w) > 1).slice(0, 30);
    const row = ([w, c]) => ({ html: `<a href="${href('search', { q: w })}" title="${esc(t('dc.pt.search', { w }))}">${esc(w)}</a>`, count: c, lang: true });
    box.innerHTML = `<p class="small muted">${esc(st.c === 'dw' ? t('dc.pt.basis.dw', { n: num(p.units), w: num(p.tokens), s: num(p.skipped) }) : t('dc.pt.basis.gatha', { n: num(p.units), w: num(p.tokens) }))} ${esc(t('dc.pt.distinct', { n: num(p.distinct) }))}</p>
      <h2>${esc(t('dc.pt.content'))}</h2><p class="small muted">${esc(t('dc.pt.content.d'))}</p>
      ${ladder(content.map(row))}
      <h2>${esc(t('dc.pt.small'))}</h2><p class="small muted">${esc(t('dc.pt.small.d'))}</p>
      ${ladder(small.map(row))}
      <details><summary>${esc(t('dc.pt.skipped'))} (${esc(num(STOP.length))})</summary><p class="skip-words" lang="mr">${STOP.map(esc).join(' · ')}</p></details>`;
  };
  ctx.el.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
    st.c = b.dataset.c;
    ctx.el.querySelectorAll('[data-c]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.c === st.c)));
    history.replaceState(null, '', href('discover/words-portrait', { c: st.c === 'gatha' ? 'gatha' : '' }));
    paint();
  }));
  paint();
}

function ladder(items) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return `<ol class="ladder">${items.map((i, k) => `<li><span class="r">${esc(num(k + 1))}</span><span class="w"${i.lang ? ' lang="mr"' : ''}>${i.html}</span>
    <span class="track" aria-hidden="true"><i style="--w:${(100 * i.count / max).toFixed(1)}%"></i></span><span class="c"><span class="vh">${esc(t('dc.pt.times', { n: num(i.count) }))}</span><span aria-hidden="true">${esc(num(i.count))}</span></span></li>`).join('')}</ol>`;
}
