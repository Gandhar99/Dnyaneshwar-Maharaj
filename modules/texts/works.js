// The three shorter works. Routes:
//   #/texts/amritanubhav                 chapter list;  #/texts/amritanubhav/<ch>  one chapter (?seg=<id> to jump)
//   #/texts/changdev-pasashti            full text (Wikisource)
//   #/texts/haripath                     29 abhangas: first lines, with the 1908 gatha text where the same abhanga was found
import { t } from '../../assets/js/i18n.js';
import { esc, num, href, splitLines } from '../../assets/js/util.js';
import { getJSON, glossaryMap } from '../../assets/js/data.js';
import { claimBadge, provisional, keepDandas, verseBlock, quality } from '../../assets/js/components.js';

const isWikisource = (url) => /wikisource\.org/.test(url || '');
const LICENCE = 'https://creativecommons.org/licenses/by-sa/4.0/';

/** Source line under a text: Wikisource attribution (CC BY-SA) or the held-back note with a link. */
export function sourceLine(doc) {
  if (!doc) return '';
  const title = num(String(doc.title || '').replace(/\s*\([A-Za-z][^)]*\)\s*$/, ''), 'mr');   // drop English catalogue notes; the title is Marathi, so Devanagari digits
  if (isWikisource(doc.source_url)) {
    return `<p class="small faint">${esc(t('tx.ws.attr', { title }))} ` +
      `<a href="${esc(doc.source_url)}" target="_blank" rel="noopener">${esc(t('tx.dw.source'))}</a> · ` +
      `<a href="${LICENCE}" target="_blank" rel="noopener">${esc(t('tx.ws.license'))}</a></p>`;
  }
  return `<p class="small faint">${esc(t('tx.dw.source'))}: <a href="${esc(doc.source_url || '#')}" target="_blank" rel="noopener">${esc(title || doc.source_url || '')}</a></p>`;
}
export const heldNote = (doc, key = 'tx.held.note') =>
  `<p class="note">${esc(t(key))} <a href="${esc(doc.source_url || '#')}" target="_blank" rel="noopener">${esc(t('tx.held.source'))}</a></p>`;

/** One unit (ovi / verse) as a reader paragraph; held-back units show their first line only. */
function unit(it) {
  const lines = it.t ? splitLines(it.t) : [it.inc || ''];
  return `<p class="ovi" id="${esc(it.id)}" lang="mr"${it.h ? ` style="color:var(--ink-2)" title="${esc(t('tx.held.mark'))}"` : ''}>` +
    lines.map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('') + '</p>';
}

const crumbs = (extra = '') => `<p class="crumbs"><a href="#/texts">${esc(t('g.texts'))}</a>${extra}</p>`;

function scrollTo(ctx) {
  ctx.manageScroll = true;
  ctx.after = () => {
    const el = ctx.query.get('seg') && document.getElementById(ctx.query.get('seg'));
    if (el) { el.classList.add('target'); el.scrollIntoView({ block: 'center' }); } else window.scrollTo(0, 0);
  };
}

// ---------------------------------------------------------------- Amritanubhav
export async function amritanubhav(ctx) {
  const [main, ws] = await Promise.all([getJSON('texts/amritanubhav.json'), getJSON('texts/amritanubhav-amrw01.json')]);
  const chapters = new Map();
  const colophon = (it) => /^\s*\|*\s*इति/.test(it.t || it.inc || '');
  for (const it of main.items) {
    let c = it.ch ?? 0;
    // the source numbers each chapter's closing colophon as verse 1 of the next chapter: keep it with the chapter it closes
    if (colophon(it) && chapters.has(c - 1) && !chapters.has(c)) c -= 1;
    if (!chapters.has(c)) chapters.set(c, []);
    chapters.get(c).push(it);
  }
  const wsCh = new Set(ws.items.map((i) => i.ch ?? 1));
  let ch = ctx.path[1] != null ? parseInt(ctx.path[1], 10) : null;
  const seg = ctx.query.get('seg');
  if (ch == null && seg) ch = (ws.items.find((i) => i.id === seg)?.ch) ?? main.items.find((i) => i.id === seg)?.ch ?? null;
  const name = (c) => (c === 0 ? t('tx.amr.ch0') : t('tx.amr.ch', { n: num(c) }));

  if (ch == null || !chapters.has(ch)) {
    ctx.el.innerHTML = `<div class="page">${crumbs()}
      <h1 tabindex="-1" lang="mr">अमृतानुभव</h1><p class="muted">${esc(t('tx.amr.lead'))}</p>
      <div class="badges">${claimBadge('editorial testimony')}${provisional()}</div>
      <ol class="chlist">${[...chapters.keys()].sort((a, b) => a - b).map((c) => {
        const full = wsCh.has(c);
        const pool = full ? ws.items.filter((i) => (i.ch ?? 1) === c) : chapters.get(c);
        const first = pool.find((i) => !/^\s*\|*\s*इति/.test(i.t || i.inc || '')) || pool[0];   // skip the previous chapter's colophon
        const n = full ? ws.items.filter((i) => (i.ch ?? 1) === c).length : chapters.get(c).length;
        return `<li><a href="${href('texts/amritanubhav/' + c)}"><span class="no" aria-hidden="true">${esc(num(c, 'mr'))}</span>
          <span><span class="vh">${esc(name(c))}: </span><span class="fl" lang="mr">${esc(splitLines(first.t || first.inc)[0] || '')}</span>
          <span class="meta">${esc(name(c))}, ${esc(t('tx.amr.units', { n: num(n) }))}, ${esc(full ? t('tx.amr.full') : t('tx.amr.first'))}</span></span></a></li>`;
      }).join('')}</ol>
      ${heldNote(main)}${sourceLine(ws)}</div>`;
    return;
  }
  const full = wsCh.has(ch);
  const items = full ? ws.items.filter((i) => (i.ch ?? 1) === ch) : chapters.get(ch);
  const doc = full ? ws : main;
  const keys = [...chapters.keys()].sort((a, b) => a - b), k = keys.indexOf(ch);
  ctx.el.innerHTML = `<article class="page"><header>
      ${crumbs(` / <a href="#/texts/amritanubhav">${esc(t('tx.amr.title'))}</a>`)}
      <h1 tabindex="-1">${esc(t('tx.amr.title'))}: ${esc(name(ch))}</h1>
      <div class="badges">${claimBadge('editorial testimony')}${provisional()}${doc.quality_tier ? `<span class="badge prov">${esc(t('source.tier'))} ${esc(doc.quality_tier)}</span>` : ''}</div>
      ${full ? `<p class="small faint">${esc(t('tx.amr.other'))}</p>` : heldNote(main)}
    </header>
    <div class="ovis">${items.map(unit).join('')}</div>
    <footer>${sourceLine(doc)}
      <nav class="pager">${k > 0 ? `<a href="${href('texts/amritanubhav/' + keys[k - 1])}" rel="prev">${esc(name(keys[k - 1]))}</a>` : '<span></span>'}
        <a href="#/texts/amritanubhav">${esc(t('tx.amr.all'))}</a>
        ${k < keys.length - 1 ? `<a href="${href('texts/amritanubhav/' + keys[k + 1])}" rel="next">${esc(name(keys[k + 1]))}</a>` : '<span></span>'}</nav>
    </footer></article>`;
  scrollTo(ctx);
}

// ---------------------------------------------------------------- Changdev Pasashti
export async function pasashti(ctx) {
  const doc = await getJSON('texts/changdev-pasashti.json');
  ctx.el.innerHTML = `<article class="page"><header>
      ${crumbs()}<h1 tabindex="-1" lang="mr">चांगदेव पासष्टी</h1>
      <p class="muted">${esc(t('tx.cp.lead'))}</p>
      <div class="badges">${claimBadge('devotional tradition')}${provisional()}${doc.quality_tier ? `<span class="badge prov">${esc(t('source.tier'))} ${esc(doc.quality_tier)}</span>` : ''}</div>
    </header>
    <div class="ovis">${doc.items.map(unit).join('')}</div>
    <footer>${sourceLine(doc)}</footer></article>`;
  scrollTo(ctx);
}

// ---------------------------------------------------------------- Haripath
export async function haripath(ctx) {
  const [doc, gmap] = await Promise.all([getJSON('texts/haripath.json'), glossaryMap()]);
  const n = doc.items.length;
  const item = (it) => {
    const m = it.match;
    const extra = it.id === 'HP_0029' ? ` <span class="badge prov">${esc(t('tx.hp.extra'))}</span>` : '';
    let body;
    if (m?.reading_text) {
      body = `<p class="small" style="margin:.4rem 0"><strong>${esc(t(m.kind === 'matched' ? 'tx.hp.matched' : 'tx.hp.probable'))}</strong> ·
          <a href="${href('texts/gatha/' + m.composition_id)}">${esc(t('tx.hp.open'))}</a></p>
        ${m.text_quality === 'C'
          ? `<details><summary>${esc(t('tx.poem.reading'))} ${quality('C')}</summary><div class="leaf">${verseBlock(m.reading_text, { glossary: gmap })}</div></details>`
          : `<div class="leaf">${verseBlock(m.reading_text, { glossary: gmap })}</div><div class="badges">${quality(m.text_quality)}</div>`}`;
    } else if (m) {
      body = `<p class="small" style="margin:.4rem 0">${esc(t('tx.hp.other'))} · <a href="${href('texts/gatha/' + m.composition_id)}">${esc(t('tx.hp.open'))}</a></p>`;
    } else {
      body = `<p class="small faint" style="margin:.4rem 0">${esc(t('tx.hp.none'))}</p>`;
    }
    return `<section class="blk" id="${esc(it.id)}" style="display:block;padding:var(--sp-4) 0">
      <h2 style="margin:0 0 .3rem;font-size:var(--s-1)"><span class="faint" style="font-family:var(--f-ui);font-size:var(--s--1)">${esc(num(String(it.n)))}</span>
        <span lang="mr">${esc(keepDandas(it.inc || ''))}</span>${extra}</h2>${body}</section>`;
  };
  ctx.el.innerHTML = `<article class="page">${crumbs()}
    <h1 tabindex="-1" lang="mr">हरिपाठ</h1>
    <p class="muted">${esc(t('tx.hp.lead', { n: num(n) }))}</p>
    <div class="badges">${claimBadge('editorial testimony')}${provisional()}</div>
    ${heldNote(doc, 'tx.hp.note')}
    <p class="small faint">${esc(t('tx.hp.rule'))}</p>
    ${doc.items.map(item).join('')}
    ${sourceLine(doc)}</article>`;
  scrollTo(ctx);
}
