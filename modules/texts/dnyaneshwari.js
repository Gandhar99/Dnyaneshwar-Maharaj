// Dnyaneshwari reader. Routes:
//   #/texts/dnyaneshwari                 chapter list
//   #/texts/dnyaneshwari/<ch>            chapter (loads part 1; later parts on demand)
//   #/texts/dnyaneshwari/<ch>?o=<ovi>    jump to an ovi number;  ?seg=<segment_id> jump to a segment
import { t } from '../../assets/js/i18n.js';
import { esc, num, href, splitLines, toAsciiDigits } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { claimBadge, provisional, keepDandas } from '../../assets/js/components.js';
import { sourceLine } from './works.js';

export async function render(ctx) {
  const ix = await getJSON('texts/dnyaneshwari/index.json');
  const ch = parseInt(ctx.path[1], 10);
  if (!ch) return chapterList(ctx, ix);
  const meta = ix.chapters.find((c) => c.chapter === ch);
  if (!meta) { ctx.el.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p><a href="#/texts/dnyaneshwari">${esc(t('tx.dw.all'))}</a></p></div>`; return; }
  return chapter(ctx, ix, meta);
}

function chapterList(ctx, ix) {
  ctx.el.innerHTML = `<div class="page">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/texts">${esc(t('g.texts'))}</a></p>
    <h1 tabindex="-1" lang="mr">ज्ञानेश्वरी</h1>
    <p class="muted">${esc(t('tx.dw.lead'))}</p>
    <div class="badges">${claimBadge('editorial testimony')}${provisional()}</div>
    <ol class="chlist">${ix.chapters.map((c) => `<li><a href="${href('texts/dnyaneshwari/' + c.chapter)}">
      <span class="no" aria-hidden="true">${esc(num(c.chapter, 'mr'))}</span>
      <span><span class="vh">${esc(t('tx.dw.chapter', { n: num(c.chapter) }))}: </span><span class="fl" lang="mr">${esc(c.first_line)}</span>
      <span class="meta">${esc(t('tx.dw.ovis', { n: num(c.n_ovi) }))}, ${esc(t('tx.dw.verses', { n: num(c.n_verse) }))}</span></span></a></li>`).join('')}</ol>
    <p class="note">${esc(t('tx.dw.note.gita'))}</p>
  </div>`;
}

/** Which part holds the target (segment id or ovi number)? Returns a 0-based part index. */
function targetPart(meta, q) {
  const seg = q.get('seg'), o = q.get('o');
  if (seg) {
    const k = meta.parts.findIndex((p) => seg >= p.first && seg <= p.last);
    return k < 0 ? 0 : k;
  }
  if (o) {
    const n = parseInt(toAsciiDigits(o), 10);
    const k = meta.parts.findIndex((p) => p.ovi_to != null && n <= parseInt(toAsciiDigits(p.ovi_to), 10));
    return k < 0 ? meta.parts.length - 1 : k;
  }
  return 0;
}

async function chapter(ctx, ix, meta) {
  const ch = meta.chapter;
  const want = targetPart(meta, ctx.query);
  const parts = await Promise.all(meta.parts.slice(0, want + 1).map((p) => getJSON(p.file)));
  let loaded = parts.length;
  const prev = ix.chapters.find((c) => c.chapter === ch - 1), next = ix.chapters.find((c) => c.chapter === ch + 1);
  const doc = meta.documents[0] || {};

  ctx.el.innerHTML = `<article class="reader">
    <header class="ch-head">
      <p class="crumbs"><a href="#/texts">${esc(t('g.texts'))}</a> / <a href="#/texts/dnyaneshwari">${esc(t('tx.dw.title'))}</a></p>
      <h1 tabindex="-1">${esc(t('tx.dw.title'))}: ${esc(t('tx.dw.chapter', { n: num(ch) }))}</h1>
      <p class="small muted">${esc(t('tx.dw.ovis', { n: num(meta.n_ovi) }))}, ${esc(t('tx.dw.verses', { n: num(meta.n_verse) }))}</p>
      <div class="badges">${claimBadge('editorial testimony')}${provisional()}${doc.quality_tier ? `<span class="badge prov">${esc(t('source.tier'))} ${esc(doc.quality_tier)}</span>` : ''}</div>
      ${meta.held_back ? `<p class="note doubt">${esc(t('tx.dw.ch7.held'))}
        <a href="${esc(doc.source_url || '#')}" target="_blank" rel="noopener">${esc(t('tx.held.source'))}</a>${meta.wikisource_page ? ` · <a href="${esc(meta.wikisource_page.source_url)}" target="_blank" rel="noopener">${esc(t('tx.dw.ch7.ws'))}</a>` : ''}</p>`
        : meta.quarantined ? `<p class="note doubt">${esc(t('tx.dw.ch7'))}</p>` : ''}
      <p class="note">${esc(t('tx.dw.note.gita'))}</p>
    </header>
    <div id="dw-body"></div>
    <div class="loadmore"><button type="button" class="btn" id="dw-more" hidden>${esc(t('tx.dw.next.part'))}</button></div>
    <footer class="ch-head">
      ${sourceLine(doc)}
      <nav class="pager">
        ${prev ? `<a href="${href('texts/dnyaneshwari/' + prev.chapter)}" rel="prev">${esc(t('tx.dw.prevch'))}: ${esc(num(prev.chapter))}</a>` : '<span></span>'}
        <a href="#/texts/dnyaneshwari">${esc(t('tx.dw.all'))}</a>
        ${next ? `<a href="${href('texts/dnyaneshwari/' + next.chapter)}" rel="next">${esc(t('tx.dw.nextch'))}: ${esc(num(next.chapter))}</a>` : '<span></span>'}
      </nav>
    </footer>
  </article>`;

  const body = ctx.el.querySelector('#dw-body');
  const more = ctx.el.querySelector('#dw-more');
  let carry = null;                      // block left open at the end of a part
  const append = (part) => {
    const { html, open } = blocks(part.items, carry);
    carry = open;
    body.insertAdjacentHTML('beforeend', html);
  };
  parts.forEach(append);
  const updateMore = () => { more.hidden = loaded >= meta.parts.length; };
  updateMore();
  const loadNext = async () => {
    if (loaded >= meta.parts.length || more.disabled) return;
    more.disabled = true;
    const p = await getJSON(meta.parts[loaded].file);
    loaded++; append(p); more.disabled = false; updateMore();
  };
  more.addEventListener('click', loadNext);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('button.more');
    if (b) { const gv = b.closest('.gv'); const s = gv.classList.toggle('short'); b.setAttribute('aria-expanded', String(!s)); }
  });

  ctx.manageScroll = true;
  ctx.after = () => {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) loadNext(); }, { rootMargin: '800px 0px' });
      io.observe(more.parentElement);
    }
    const seg = ctx.query.get('seg');
    const o = ctx.query.get('o');
    let el = seg ? document.getElementById(seg) : null;
    if (!el && o) el = [...document.querySelectorAll('.ovi[data-n]')].find((x) => toAsciiDigits(x.dataset.n) === toAsciiDigits(o));
    if (el) {
      const gv = el.closest('.gv');                // a Gita verse: open its box so the verse is visible
      if (gv) { gv.classList.remove('short'); gv.querySelector('button.more')?.setAttribute('aria-expanded', 'true'); }
      el.classList.add('target'); el.scrollIntoView({ block: 'center' });
    } else window.scrollTo(0, 0);
  };
}

const linkKey = (gc) => ({ high: 'high', medium: 'medium', low: 'low', chapter: 'chapter' }[gc] || 'medium');

/** Group items into blocks: one or more Gita verses followed by the ovis that comment on them. */
function blocks(items, carry) {
  const out = [];
  let cur = carry && items[0]?.k !== 'v' ? { verses: carry.verses, ovis: [] } : null;
  for (const it of items) {
    if (it.k === 'v') {
      if (!cur || cur.ovis.length) { if (cur) out.push(cur); cur = { verses: [], ovis: [] }; }
      cur.verses.push(it);
    } else {
      if (!cur) cur = { verses: [], ovis: [] };
      cur.ovis.push(it);
    }
  }
  if (cur) out.push(cur);
  const last = out[out.length - 1];
  return { html: out.map(blockHtml).join(''), open: last && last.verses.length ? { verses: last.verses } : null };
}

function blockHtml(b) {
  const gc = b.ovis.find((o) => o.gc)?.gc;
  const loc = b.verses.map((v) => v.g).filter(Boolean);
  const locLabel = loc.length ? (loc.length > 1 ? `${loc[0]}–${loc[loc.length - 1].split('.').pop()}` : loc[0]) : (b.ovis[0]?.g || '');
  const gv = b.verses.length ? `<aside class="gv short" aria-label="${esc(t('tx.dw.gita', { loc: num(locLabel) }))}">
      <span class="loc"><b>${esc(t('tx.dw.gita', { loc: num(locLabel) }))}</b>${gc ? ' · ' + esc(t('tx.dw.link.' + linkKey(gc))) : ''}</span>
      <span class="vt" lang="sa">${b.verses.map((v) => `<span id="${esc(v.id)}">${esc(keepDandas((v.t || v.inc || '').replace(/[ \t]+/g, ' ').trim()))}</span>`).join('\n')}</span>
      <button type="button" class="more" aria-expanded="false">${esc(t('tx.dw.more'))}</button></aside>` : '';
  const ovis = b.ovis.map((o) => `<p class="ovi${o.k === 'c' ? ' colophon' : ''}" id="${esc(o.id)}" data-n="${esc(o.n ?? '')}" lang="mr"${o.h ? ` style="color:var(--ink-2)" title="${esc(t('tx.held.mark'))}"` : ''}>` +
    (o.k === 'c' ? `<span class="fl">${esc(t(/dating/i.test(o.f || '') ? 'tx.dw.dating' : 'tx.dw.colophon'))}</span>` : '') +
    splitLines(o.t || o.inc).map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('') + '</p>').join('');
  return `<section class="blk${gv ? '' : ' nogv'}">${gv}<div class="ovis">${ovis}</div></section>`;
}
