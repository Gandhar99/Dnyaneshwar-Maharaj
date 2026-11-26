// Doors: the four clearly labelled previews and the ringan placeholder. Real rows are used; what does not exist is said plainly.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href, formatDate } from '../../assets/js/util.js';
import { getJSON, gathaPoem, glossaryMap } from '../../assets/js/data.js';
import { honesty, enText, verseBlock, quality, claimBadge, provisional, sourceChips } from '../../assets/js/components.js';
import { loadBundle, stageHead, stageBody, rid } from './rows.js';
import { RINGAN_IMAGE } from './paths.js';

const CSS = '<link rel="stylesheet" href="modules/doors/style.css">';
const POEM = 'DNYC-COMP0908';
const crumbs = () => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/doors">${esc(t('g.doors'))}</a></p>`;
const missingBox = (keys) => `<div class="stub"><strong>${esc(t('dr.mock.missing'))}</strong><ul>${keys.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul></div>`;
const page = (title, lead, inner) => `${CSS}<div class="page wide m-doors">${crumbs()}<h1 tabindex="-1">${esc(title)}</h1>
  <p class="muted lead">${esc(lead)}</p>
  <div class="mock" data-label="${esc(t('mock'))}"><p class="small">${esc(t('mock.body'))}</p><p class="small faint">${esc(t('dr.mock.real'))}</p>${inner}</div>
  <p><a href="#/doors">${esc(t('dr.allpaths'))}</a></p></div>`;

// ---------------------------------------------------------------- recitation
export async function recitation(ctx) {
  const [res, gmap] = await Promise.all([gathaPoem(POEM), glossaryMap()]);
  const p = res?.poem;
  if (!p?.text) { ctx.el.innerHTML = page(t('dr.p.recitation'), t('dr.rc.lead'), missingBox(['dr.rc.m1'])); return; }
  const tokens = [...new Set(p.text.reading_text.match(/[ऀ-ॣॱ-ॿ]+/g) || [])].filter((w) => gmap.has(w));
  const themes = p.reading?.themes || [];
  const layers = [1, 2, 3, 4].map((n) => `<button type="button" class="seg" data-layer="${n}" aria-pressed="${n < 4}">${esc(t('dr.rc.l' + n))}</button>`).join('');
  const inner = `
    <h2>${esc(t('dr.rc.poem'))}</h2>
    <div class="badges">${claimBadge(p.claim_status)}${p.provisional ? provisional() : ''}${sourceChips(p.source_id)}${quality(p.text.text_quality)}${rid(p.id)}</div>
    <div class="filters" role="group" aria-label="${esc(t('dr.rc.layers'))}">${layers}</div>
    <section data-panel="1"><div class="leaf">${verseBlock(p.text.reading_text, { glossary: gmap })}</div>
      <p class="small faint">${esc(t('dr.rc.basis'))}</p></section>
    <section data-panel="2"><h3>${esc(t('dr.rc.l2'))}</h3>
      ${tokens.length ? `<dl class="mean">${tokens.map((w) => { const g = gmap.get(w); return `<dt lang="mr">${esc(w)}</dt><dd>${g.mr ? `<span lang="mr">${esc(g.mr)}</span>` : ''}${g.en ? ` <span class="muted" lang="en">${esc(g.en)}</span>` : ''}
        <span class="small faint" lang="en">${esc(g.basis || '')}</span> ${claimBadge(g.cs)} ${rid(g.id)}</dd>`; }).join('')}</dl>` : `<p class="small">${esc(t('dr.rc.words.none'))}</p>`}</section>
    <section data-panel="3"><h3>${esc(t('dr.rc.theme'))}</h3>
      ${themes.length ? `<p>${themes.map((x) => `<a class="chip" href="${href('discover/themes/' + x.topic_id)}">${esc(t(x.topic_id))}</a> <span class="small faint" lang="en">${esc(x.confidence || '')}</span>`).join(' ')}</p>${p.reading?.method ? enText(p.reading.method).replace('<p ', '<p class="small faint" ') : ''}` : `<p class="small">${esc(t('dr.rc.theme.none'))}</p>`}</section>
    <section data-panel="4" hidden><div class="slot audio" role="img" aria-label="${esc(t('dr.rc.audio'))}"><span>${esc(t('dr.rc.audio'))}</span></div></section>
    <p><button type="button" class="btn" id="recbtn">${esc(t('dr.rc.rec'))}</button></p>
    <div id="recout" aria-live="polite"></div>
    ${missingBox(['dr.rc.m1', 'dr.rc.m2', 'dr.rc.m3'])}
    <p class="small"><a href="${href('texts/gatha/' + p.id)}">${esc(p.first_line_display)}</a></p>`;
  ctx.el.innerHTML = page(t('dr.p.recitation'), t('dr.rc.lead'), inner);
  ctx.after = () => {
    const root = ctx.el.isConnected ? ctx.el : document;
    const btns = [...document.querySelectorAll('.m-doors [data-layer]')];
    const sync = () => btns.forEach((b) => { const on = b.getAttribute('aria-pressed') === 'true'; document.querySelector(`.m-doors [data-panel="${b.dataset.layer}"]`).hidden = !on; });
    btns.forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); sync(); }));
    sync();
    void root;
    document.getElementById('recbtn')?.addEventListener('click', async (e) => {
      e.currentTarget.disabled = true;
      const w = await getJSON('texts/works.json');
      const rows = w.recordings || [];
      document.getElementById('recout').innerHTML = rows.length ? rows.map((r) => `<div class="rowbox"><p class="rt" lang="en">${esc(r.performer)}: ${esc(r.album_film_or_programme)}${r.year ? ' (' + esc(r.year) + ')' : ''}</p>
        ${r.note ? enText(r.note, { note: false }).replace('<p ', '<p class="small" ') : ''}${r.link ? `<p class="small"><a href="${esc(r.link)}" target="_blank" rel="noopener">${esc(t('source.open'))}</a></p>` : ''}${honesty(r)}${rid(r.row_id)}</div>`).join('')
        : `<p class="small">${esc(t('dr.rc.rec.none'))}</p>`;
    });
  };
}

// ---------------------------------------------------------------- chaal
export async function chaal(ctx) {
  const res = await gathaPoem(POEM);
  const p = res?.poem;
  const inner = `
    ${p ? `<p>${esc(t('dr.ch.example'))} <a href="${href('texts/gatha/' + p.id)}" lang="mr">${esc(p.first_line_display)}</a>.
      ${esc(t('dr.ch.col.form'))}: <span lang="en">${esc(p.form || '–')}</span>. ${esc(t('dr.ch.col.chaal'))}: ${esc(t('dr.ch.none'))}.</p>` : ''}
    ${p ? `<div class="badges">${claimBadge(p.claim_status)}${p.provisional ? provisional() : ''}${sourceChips(p.source_id)}${rid(p.id)}</div>` : ''}
    ${missingBox(['dr.ch.m1', 'dr.ch.m2', 'dr.ch.m3'])}
    <h2>${esc(t('dr.ch.need'))}</h2>
    <ul><li>${esc(t('dr.ch.need1'))}</li><li>${esc(t('dr.ch.need2'))}</li><li>${esc(t('dr.ch.need3'))}</li></ul>`;
  ctx.el.innerHTML = page(t('dr.p.chaal'), t('dr.ch.lead'), inner);
}

// ---------------------------------------------------------------- proofreading
export async function proofreading(ctx) {
  const res = await gathaPoem(POEM);
  const p = res?.poem;
  const tx = p?.text;
  if (!tx) { ctx.el.innerHTML = page(t('dr.p.proofreading'), t('dr.pf.lead'), missingBox(['dr.pf.m1'])); return; }
  const ed = res.editions?.SKH1908 || {};
  const skh = p.witnesses.find((w) => w.witness === 'SKH1908') || {};
  const sub = (tx.substitutions || [])[0];
  const ocr = String(tx.ocr_text).replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const h = sub?.skh && l.includes(sub.skh) ? esc(l).split(esc(sub.skh)).join(`<mark class="hit">${esc(sub.skh)}</mark>`) : esc(l);
    return `<span class="ocl">${h}</span>`;
  }).join('');
  const kv = [['dr.pf.file', ed.scan_file], ['dr.pf.edition', t('w.SKH1908')], ['dr.pf.page', skh.printed_page && num(String(skh.printed_page))],
    ['dr.pf.line', skh.ocr_line_start && num(String(skh.ocr_line_start))], ['dr.pf.section', skh.source_section]].filter(([, v]) => v);
  const inner = `
    <div class="badges">${claimBadge(p.claim_status)}${p.provisional ? provisional() : ''}${sourceChips(p.source_id)}${quality(tx.text_quality)}${rid(p.id)}</div>
    <div class="side">
      <section><h2>${esc(t('dr.pf.scan'))}</h2><div class="leaf ocr"><p class="verse small" lang="mr">${ocr}</p></div></section>
      <section><h2>${esc(t('dr.pf.reading'))}</h2><div class="leaf">${verseBlock(tx.reading_text, { size: 'small' })}</div></section>
    </div>
    <h2>${esc(t('dr.pf.ref'))}</h2>
    <dl class="kv">${kv.map(([k, v]) => `<dt>${esc(t(k))}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${ed.scan_item ? `<p class="small"><a href="https://archive.org/details/${esc(ed.scan_item)}" target="_blank" rel="noopener">${esc(t('dr.pf.openscan'))}</a></p>` : ''}
    <h2>${esc(t('dr.pf.sample'))}</h2>
    <p class="note">${esc(t('dr.pf.sample.note'))}</p>
    ${sub ? `<p class="rowbox" lang="${lang()}">${esc(t('dr.pf.sample.row', { p: num(String(sub.position)), a: sub.skh, b: sub.adopted, f: sub.from }))}</p>` : `<p class="small">${esc(t('dr.pf.sample.none'))}</p>`}
    ${missingBox(['dr.pf.m1', 'dr.pf.m2', 'dr.pf.m3'])}
    <p class="small"><a href="${href('texts/gatha/' + p.id, { v: 'ocr' })}">${esc(p.first_line_display)}</a></p>`;
  ctx.el.innerHTML = page(t('dr.p.proofreading'), t('dr.pf.lead'), inner);
}

// ---------------------------------------------------------------- wari companion
export async function wari(ctx) {
  const D = await loadBundle(['stage']);
  const main = D.stages.filter((s) => !s.variant_of);
  const out = main.filter((s) => s.day_number != null), back = main.filter((s) => s.day_number == null);
  const opt = (s) => `<option value="${esc(s.stage_id)}">${esc(stageHead(s))}: ${esc(s.date ? formatDate(s.date, lang(), { day: 'numeric', month: 'long' }) : '')}</option>`;
  const inner = `
    <div class="field"><label for="wsel">${esc(t('dr.wr.pick'))}</label>
      <select class="seg" id="wsel"><optgroup label="${esc(t('dr.wr.out'))}">${out.map(opt).join('')}</optgroup>
      <optgroup label="${esc(t('dr.wr.back'))}">${back.map(opt).join('')}</optgroup></select></div>
    <div id="wcard" aria-live="polite"></div>
    ${missingBox(['dr.wr.m1', 'dr.wr.m2', 'dr.wr.m3'])}`;
  ctx.el.innerHTML = page(t('dr.p.wari'), t('dr.wr.lead'), inner);
  ctx.after = () => {
    const sel = document.getElementById('wsel'), card = document.getElementById('wcard');
    const show = () => {
      const s = D.stage.get(sel.value);
      card.innerHTML = `<h2>${esc(stageHead(s))}</h2>${stageBody(D, s)}<p><a class="btn" href="${href('calendar/palkhi/' + s.stage_id)}">${esc(t('dr.wr.open'))}</a></p>`;
    };
    sel.addEventListener('change', show); show();
  };
}

// ---------------------------------------------------------------- ringan placeholder
export async function ringan(ctx) {
  const D = await loadBundle(['stage']);
  const rows = D.stages.filter((s) => !s.variant_of && s.ringan_kind);
  const img = RINGAN_IMAGE
    ? `<figure class="slot"><img src="${esc(RINGAN_IMAGE)}" alt="" loading="lazy"></figure>`
    : `<figure class="slot" role="img" aria-label="${esc(t('dr.rg.alt'))}"><span>${esc(t('dr.rg.slot'))}</span></figure>`;
  ctx.el.innerHTML = `${CSS}<div class="page m-doors">${crumbs()}
    <h1 tabindex="-1">${esc(t('dr.p.ringan'))}</h1>
    ${img}
    <p>${esc(t('dr.rg.s1'))}</p>
    <p>${esc(t('dr.rg.s2', { n: num(rows.length) }))} <a href="${href('calendar/palkhi')}">${esc(t('g.calendar'))}</a></p>
    <p class="small faint">${esc(t('dr.rg.rows'))} ${rows.map((r) => rid(r.stage_id)).join(' ')}</p>
    <p><a href="#/doors">${esc(t('dr.allpaths'))}</a></p></div>`;
}
