// Gatha: list with filters (#/texts/gatha?q=&qa=&w=&th=&txt=1) and one page per poem (#/texts/gatha/<composition_id>).
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, debounce } from '../../assets/js/util.js';
import { gathaIndex, gathaPoem, glossaryMap } from '../../assets/js/data.js';
import { norm } from '../../assets/js/search-norm.js';
import { poemCard, verseBlock, quality, claimBadge, provisional, sourceChips, icon } from '../../assets/js/components.js';

const WITNESSES = ['SKH1908', 'SSV', 'TEL1954'];
const TOPICS = Array.from({ length: 20 }, (_, i) => 'T' + String(i + 1).padStart(2, '0'));
const PAGE = 60;

export async function render(ctx) {
  if (ctx.path[1]) return poemPage(ctx, ctx.path[1]);
  return listPage(ctx);
}

// ---------------------------------------------------------------- list
async function listPage(ctx) {
  const ix = await gathaIndex();
  const q = ctx.query;
  const st = { q: q.get('q') || '', qa: q.get('qa') || '', w: q.get('w') || '', th: q.get('th') || '', txt: q.get('txt') === '1', shown: PAGE };
  ix.rows.forEach((r) => { r._n ??= norm(r.first_line); });

  ctx.el.innerHTML = `<div class="page">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/texts">${esc(t('g.texts'))}</a></p>
    <h1 tabindex="-1" lang="mr">अभंगांची गाथा</h1>
    <p class="muted">${esc(t('tx.gatha.lead', { n: num(ix.rows.length) }))}</p>
    <p class="small">${claimBadge('editorial testimony')} ${provisional()}</p>
    <div class="field">${icon.search}<label class="vh" for="gq">${esc(t('tx.gatha.find'))}</label>
      <input id="gq" type="search" lang="mr" placeholder="${esc(t('tx.gatha.find'))}" value="${esc(st.q)}" autocomplete="off"></div>
    <div class="filters" role="group" aria-label="${esc(t('tx.gatha.quality'))}">
      ${['A', 'B', 'C'].map((x) => `<button type="button" class="seg" data-qa="${x}" aria-pressed="${st.qa === x}">${esc(t('q.letter.' + x))} <span class="vh">${esc(t('q.' + x))}</span></button>`).join('')}
      <button type="button" class="seg" data-txt aria-pressed="${st.txt}">${esc(t('tx.gatha.withtext'))}</button>
    </div>
    <div class="filters">
      <label class="vh" for="gw">${esc(t('tx.gatha.edition'))}</label>
      <select class="seg" id="gw"><option value="">${esc(t('tx.gatha.edition'))}: ${esc(t('all'))}</option>
        ${WITNESSES.map((w) => `<option value="${w}"${st.w === w ? ' selected' : ''}>${esc(t('w.' + w))}</option>`).join('')}</select>
      <label class="vh" for="gth">${esc(t('tx.gatha.theme'))}</label>
      <select class="seg" id="gth"><option value="">${esc(t('tx.gatha.anytheme'))}</option>
        ${TOPICS.map((x) => `<option value="${x}"${st.th === x ? ' selected' : ''}>${esc(t(x))}</option>`).join('')}</select>
    </div>
    <p class="small faint" id="gcount" role="status" aria-live="polite"></p>
    <ul class="plist" id="glist"></ul>
    <div class="loadmore"><button type="button" class="btn" id="gmore" hidden>${esc(t('more'))}</button></div>
  </div>`;

  const $ = (s) => ctx.el.querySelector(s);
  const list = $('#glist'), count = $('#gcount'), more = $('#gmore'), qaBtns = [...ctx.el.querySelectorAll('[data-qa]')];
  let rows = [];
  const apply = (resetShown = true) => {
    if (resetShown) st.shown = PAGE;
    const nq = norm(st.q);
    rows = ix.rows.filter((r) => (!nq || r._n.includes(nq)) && (!st.qa || r.q === st.qa) && (!st.txt || r.has_text)
      && (!st.w || r.witnesses.some(([w]) => w === st.w)) && (!st.th || r.themes.includes(st.th)));
    count.textContent = t('tx.gatha.shown', { n: num(rows.length) });
    list.innerHTML = rows.length ? rows.slice(0, st.shown).map(poemCard).join('')
      : `<li class="stub">${esc(t('tx.gatha.none'))} <a href="#/texts/gatha">${esc(t('tx.gatha.reset'))}</a></li>`;
    more.hidden = rows.length <= st.shown;
    const qs = new URLSearchParams(Object.entries({ q: st.q, qa: st.qa, w: st.w, th: st.th, txt: st.txt ? '1' : '' }).filter(([, v]) => v)).toString();
    history.replaceState(null, '', '#/texts/gatha' + (qs ? '?' + qs : ''));
  };
  apply();
  $('#gq').addEventListener('input', debounce((e) => { st.q = e.target.value.trim(); apply(); }, 180));
  qaBtns.forEach((b) => b.addEventListener('click', () => {
    st.qa = st.qa === b.dataset.qa ? '' : b.dataset.qa;
    qaBtns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.qa === st.qa)));
    apply();
  }));
  $('[data-txt]').addEventListener('click', (e) => { st.txt = !st.txt; e.currentTarget.setAttribute('aria-pressed', String(st.txt)); apply(); });
  $('#gw').addEventListener('change', (e) => { st.w = e.target.value; apply(); });
  $('#gth').addEventListener('change', (e) => { st.th = e.target.value; apply(); });
  more.addEventListener('click', () => { st.shown += PAGE; apply(false); });
}

// ---------------------------------------------------------------- poem
async function poemPage(ctx, id) {
  const [res, gmap] = await Promise.all([gathaPoem(id), glossaryMap()]);
  if (!res?.poem) {
    ctx.el.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('tx.poem.notfound'))}</h1><p><a href="#/texts/gatha">${esc(t('tx.poem.back'))}</a></p></div>`;
    return;
  }
  const { poem: p, prev, next, editions } = res;
  const tx = p.text;
  const view = ctx.query.get('v') === 'ocr' ? 'ocr' : 'reading';
  const basisKey = !tx ? '' : /^three/.test(tx.reading_basis) ? 'three' : /^two/.test(tx.reading_basis) ? 'two' : 'single';

  let textHtml;
  if (tx) {
    const shown = view === 'ocr' ? tx.ocr_text : tx.reading_text;
    textHtml = `<div class="filters" role="group">
        <a class="seg" role="button" aria-pressed="${view === 'reading'}" href="${href('texts/gatha/' + id)}">${esc(t('tx.poem.reading'))}</a>
        <a class="seg" role="button" aria-pressed="${view === 'ocr'}" href="${href('texts/gatha/' + id, { v: 'ocr' })}">${esc(t('tx.poem.ocr'))}</a></div>
      <div class="leaf">${verseBlock(shown, { glossary: view === 'reading' ? gmap : null })}</div>
      <div class="badges">${quality(tx.text_quality)}</div>
      <p class="small muted">${esc(t('tx.poem.basis.' + basisKey))}. ${basisKey !== 'single' ? esc(t('tx.poem.counts', { t: num(tx.token_count ?? 0), s: num(tx.substitution_count ?? (tx.substitutions || []).length), u: num(tx.unresolved_count ?? 0), c: num(tx.uncovered_count ?? 0) })) : ''}</p>
      ${tx.reading_scope ? `<p class="note" lang="en">${esc(tx.reading_scope)}</p>` : ''}
      <p class="small faint">${esc(t('q.nocheck'))} ${view === 'reading' ? esc(t('tx.poem.glossary')) : ''}</p>
      ${tx.substitutions?.length ? `<details><summary>${esc(t('tx.poem.subs'))} (${num(tx.substitutions.length)})</summary>
        <ul class="small" lang="mr">${tx.substitutions.map((s) => `<li>${esc(t('tx.poem.subs.row', { a: s.skh ?? '–', b: s.adopted ?? '–' }))} <span class="faint">(${esc(s.from || '')})</span></li>`).join('')}</ul></details>` : ''}`;
  } else {
    textHtml = `<p class="note">${esc(t('tx.poem.noread'))}</p>`;
  }

  const wrow = (w) => `<tr><td>${esc(t('w.' + w.witness))}</td><td>${esc(num(w.source_label ?? '–'))}</td>
    <td>${w.printed_page ? esc(num(w.printed_page)) : '–'}</td><td lang="mr">${esc(w.incipit || '')}</td>
    <td>${esc(t('tx.match.' + w.match_type) || w.match_type || '')}${w.text_quality ? ' ' + quality(w.text_quality, { long: false }) : ''}</td></tr>`;
  const themes = (p.reading?.themes || []).map((x) => `<a class="chip" href="${href('texts/gatha', { th: x.topic_id })}">${esc(t(x.topic_id))}</a>`).join(' ');
  const listOf = (arr, f) => arr?.length ? `<ul class="small">${arr.map(f).join('')}</ul>` : '';
  const ed = editions?.SKH1908 || {};
  const skh = p.witnesses.find((w) => w.witness === 'SKH1908');

  ctx.el.innerHTML = `<article class="page">
    <p class="crumbs"><a href="#/texts">${esc(t('g.texts'))}</a> / <a href="#/texts/gatha">${esc(t('tx.poem.back'))}</a></p>
    <h1 tabindex="-1" lang="mr">${esc(p.first_line_display)}</h1>
    <div class="badges">${claimBadge(p.claim_status)}${p.provisional ? provisional() : ''}${sourceChips(p.source_id)}</div>
    ${textHtml}

    <h2>${esc(t('tx.poem.editions'))}</h2>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('tx.gatha.edition'))}</th><th>${esc(t('tx.poem.no'))}</th><th>${esc(t('tx.poem.page'))}</th><th>${esc(t('tx.poem.firstline'))}</th><th>${esc(t('tx.poem.match'))}</th></tr></thead>
      <tbody>${p.witnesses.map(wrow).join('')}</tbody></table></div>

    ${themes ? `<h2>${esc(t('tx.poem.themes'))}</h2><p>${themes}</p><p class="small faint">${esc(t('tx.poem.themes.note'))}</p>` : ''}
    ${p.people?.length ? `<h3>${esc(t('tx.poem.people'))}</h3>${listOf(p.people, (x) => `<li><span lang="mr">${esc(x.name_as_written)}</span> <span class="faint"><span lang="en">${esc(x.person || '')}</span>, ${esc(t('tx.role.' + x.role))}</span></li>`)}` : ''}
    ${p.divine_names?.length ? `<h3>${esc(t('tx.poem.divine'))}</h3><p lang="mr">${p.divine_names.map((x) => `<span class="chip" title="${esc(x.normalised_name)}">${esc(x.name_as_written)}</span>`).join(' ')}</p>` : ''}
    ${p.places?.length ? `<h3>${esc(t('tx.poem.places'))}</h3><p lang="mr">${p.places.map((x) => `<span class="chip">${esc(x.name_as_written)}</span>`).join(' ')}</p>` : ''}
    ${p.text_issues?.length ? `<h3>${esc(t('tx.poem.issues'))}</h3>${listOf(p.text_issues, (x) => `<li lang="en">${esc(x.issue_type.replace(/_/g, ' '))}: ${esc(x.detail || '')}</li>`)}` : ''}

    ${skh ? `<h3>${esc(t('tx.poem.scan'))}</h3><dl class="kv">
      <dt>${esc(t('tx.poem.scan.file'))}</dt><dd>${esc(ed.scan_file || '')}</dd>
      ${skh.printed_page ? `<dt>${esc(t('tx.poem.page'))}</dt><dd>${esc(num(String(skh.printed_page)))}</dd>` : ''}
      ${skh.ocr_line_start ? `<dt>${esc(t('tx.poem.scan.line'))}</dt><dd>${esc(num(String(skh.ocr_line_start)))}</dd>` : ''}
      ${skh.source_section ? `<dt>${esc(t('tx.poem.section'))}</dt><dd lang="mr">${esc(skh.source_section)}</dd>` : ''}
    </dl>${ed.scan_item ? `<p class="small"><a href="https://archive.org/details/${esc(ed.scan_item)}" target="_blank" rel="noopener">${esc(t('tx.poem.scan.open'))}</a></p>` : ''}` : ''}

    <nav class="pager" aria-label="${esc(t('next'))}">
      ${prev ? `<a href="${href('texts/gatha/' + prev.id)}" rel="prev"><span class="small faint">${esc(t('prev'))}</span><br><span lang="mr">${esc(prev.first_line)}</span></a>` : '<span></span>'}
      ${next ? `<a href="${href('texts/gatha/' + next.id)}" rel="next" style="text-align:right"><span class="small faint">${esc(t('next'))}</span><br><span lang="mr">${esc(next.first_line)}</span></a>` : ''}
    </nav>
  </article>`;
}
