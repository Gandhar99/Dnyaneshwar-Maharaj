// C. Reading room. Routes: #/read (the parayan keeper and the chapters), #/read/<ch>?seg=<segment id> or ?o=<printed ovi no.>
// One ovi per screen (kit pager: swipe, keys, buttons); the Gita verse a tap away; glossary words on tap (shared popover);
// a parayan keeper that remembers the place and offers a daily portion. Stored on this device only (keep, with try/catch).
// "Full page" mode is the version 1 reader: #/texts/dnyaneshwari/<ch>.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, todayIST, href, splitLines } from '../../assets/js/util.js';
import { getJSON, glossaryMap } from '../../assets/js/data.js';
import { verseBlock } from '../../assets/js/components.js';
import { mark, pager, keep, openSheet, photo, photosReady } from '../../assets/js/experience.js';

registerLabels('rd', {
  mr: {
    'title': 'वाचनकक्ष', 'lead': 'ज्ञानेश्वरी, एका वेळी एक ओवी. डावीकडे सरकवा किंवा पुढचे बटण दाबा; अधोरेखित शब्दावर टॅप केल्यास अर्थ दिसतो.',
    'keeper': 'पारायण', 'where': 'तुम्ही येथे थांबला होतात', 'continue': 'पुढे वाचा', 'begin': 'पहिल्या अध्यायापासून सुरू करा',
    'none': 'अजून वाचन सुरू केलेले नाही.',
    'plan': 'रोजचा भाग', 'plan.none': 'ठरवलेला नाही', 'plan.n': 'रोज {n} ओव्या', 'plan.ch': 'रोज एक अध्याय',
    'today': 'आजचा भाग: {done} / {n} ओव्या', 'today.ch': 'आज: अध्याय {ch}', 'today.done': 'आजचा भाग पूर्ण झाला.',
    'device': 'ही नोंद फक्त याच उपकरणावर, तुमच्या ब्राउझरमध्ये राहते; ती आम्हाला दिसत नाही आणि कोठेही पाठवली जात नाही.',
    'device.no': 'या ब्राउझरमध्ये नोंद ठेवता येत नाही (खाजगी मोड?). वाचन चालेल, पण जागा लक्षात राहणार नाही.',
    'forget': 'नोंद पुसा', 'forgotten': 'नोंद पुसली.',
    'chapters': 'अध्याय', 'chapter': 'अध्याय {n}', 'ovi': 'ओवी {n}', 'colophon': 'समारोप',
    'full': 'पूर्ण पान', 'gita': 'गीता {g}', 'gita.title': 'भगवद्गीता {g}', 'gita.low': 'हा श्लोक आणि ओवी यांची जोडणी नियमाने केलेली आहे; ती कच्ची असू शकते.',
    'card': 'कार्ड बनवा', 'text.what': 'या ओवीचा पाठ आणि स्रोत',
    'text.mr': 'पाठ मराठी विकिस्रोतावरून (समुदायाने टंकलेला); तो येथे कोणत्याही छापील प्रतीशी ताडून पाहिलेला नाही.',
    'held': 'अध्याय ७ चा पूर्ण पाठ येथे देता येत नाही. आमच्याकडील पाठ Sanskrit Documents या संकेतस्थळावरचा आहे, आणि तेथील अटी केवळ वैयक्तिक अभ्यासाला परवानगी देतात.',
    'held.src': 'तो अध्याय तेथे वाचा', 'held.next': 'अध्याय ८ कडे',
    'next.ch': 'अध्याय {n} कडे', 'ch.done': 'अध्याय {n} पूर्ण झाला.', 'end': 'ज्ञानेश्वरी येथे पूर्ण होते.',
    'pager': 'ओव्या', 'gl.how': 'हा अर्थ कोठून आला',
  },
  en: {
    'title': 'Reading room', 'lead': 'The Dnyaneshwari, one ovi at a time. Swipe left or press next; tap an underlined word for its meaning.',
    'keeper': 'Parayan', 'where': 'You stopped here', 'continue': 'Read on', 'begin': 'Begin with chapter 1',
    'none': 'You have not started reading yet.',
    'plan': 'Daily portion', 'plan.none': 'Not set', 'plan.n': '{n} ovis a day', 'plan.ch': 'A chapter a day',
    'today': "Today's portion: {done} of {n} ovis", 'today.ch': 'Today: chapter {ch}', 'today.done': "Today's portion is complete.",
    'device': 'This record stays only on this device, in your browser; we cannot see it and it is sent nowhere.',
    'device.no': 'This browser cannot keep the record (private mode?). Reading works, but your place will not be remembered.',
    'forget': 'Forget my place', 'forgotten': 'Forgotten.',
    'chapters': 'Chapters', 'chapter': 'Chapter {n}', 'ovi': 'Ovi {n}', 'colophon': 'Colophon',
    'full': 'Full page', 'gita': 'Gita {g}', 'gita.title': 'Bhagavad Gita {g}', 'gita.low': 'This verse is linked to the ovi by rule; the link may be loose.',
    'card': 'Make a card', 'text.what': "this ovi's text and source",
    'text.mr': '',
    'held': 'The full text of chapter 7 cannot be given here. The text we have is from Sanskrit Documents, whose terms allow personal study only.',
    'held.src': 'Read the chapter there', 'held.next': 'On to chapter 8',
    'next.ch': 'On to chapter {n}', 'ch.done': 'Chapter {n} is complete.', 'end': 'The Dnyaneshwari ends here.',
    'pager': 'Ovis', 'gl.how': 'Where this meaning comes from',
  },
});

const KEY = 'parayan';
export const title = (ctx) => (ctx.path[0] ? t('rd.chapter', { n: num(ctx.path[0]) }) + ', ' : '') + t('rd.title');

export async function render(ctx) {
  const ix = await getJSON('texts/dnyaneshwari/index.json');
  const ch = parseInt(ctx.path[0], 10);
  if (!ch) return landing(ctx, ix);
  const meta = ix.chapters.find((c) => c.chapter === ch);
  if (!meta) { location.hash = '#/read'; return; }
  return reader(ctx, ix, meta);
}

// ---------- the keeper's record ----------
function state() {
  const s = keep.get(KEY, {}) || {};
  const today = todayIST();
  if (s.day !== today) { s.day = today; s.done = 0; s.startCh = s.ch; }
  return s;
}
const save = (s) => keep.set(KEY, s);

async function landing(ctx, ix) {
  await photosReady();
  const s = state();
  const canKeep = keep.set('probe', 1); keep.del('probe');
  const plan = s.plan || 0;
  const meta = s.ch ? ix.chapters.find((c) => c.chapter === s.ch) : null;
  const portion = plan === 'ch' ? `<p class="todayp">${esc(t('rd.today.ch', { ch: num(s.startCh || s.ch || 1) }))}</p>`
    : plan ? `<div class="portion" style="--p:${Math.min(1, (s.done || 0) / plan)}"><i></i></div><p class="todayp">${esc((s.done || 0) >= plan ? t('rd.today.done') : t('rd.today', { done: num(s.done || 0), n: num(plan) }))}</p>` : '';
  ctx.el.innerHTML = `<div class="x-read">
    <h1 tabindex="-1">${esc(t('rd.title'))}</h1>
    <p class="muted">${esc(t('rd.lead'))}</p>
    <section class="keeper" aria-labelledby="h-keep">
      <h2 id="h-keep">${esc(t('rd.keeper'))}</h2>
      ${meta ? `<p class="xsmall">${esc(t('rd.where'))}: ${esc(t('rd.chapter', { n: num(s.ch) }))}, ${esc(t('rd.ovi', { n: num(s.n || '') }))}</p>
        <p class="where" lang="mr">${esc(s.line || '')}</p>${portion}
        <p><a class="btn" href="${href('read/' + s.ch, { seg: s.seg })}">${esc(t('rd.continue'))}</a></p>`
      : `<p class="xsmall">${esc(t('rd.none'))}</p><p><a class="btn" href="#/read/1">${esc(t('rd.begin'))}</a></p>`}
      <p class="xsmall" style="margin:var(--sp-3) 0 .2rem">${esc(t('rd.plan'))}</p>
      <div class="plans" role="group" aria-label="${esc(t('rd.plan'))}">
        ${[0, 25, 50, 108, 'ch'].map((p) => `<button type="button" class="seg" data-plan="${p}" aria-pressed="${String(p) === String(plan)}">${esc(p === 0 ? t('rd.plan.none') : p === 'ch' ? t('rd.plan.ch') : t('rd.plan.n', { n: num(p) }))}</button>`).join('')}
      </div>
      <p class="xsmall" style="margin-top:var(--sp-3)">${esc(canKeep ? t('rd.device') : t('rd.device.no'))}</p>
      ${meta ? `<button type="button" class="xlink" data-forget>${esc(t('rd.forget'))}</button><span class="xsmall" role="status" id="rd-st"></span>` : ''}
    </section>
    ${photo('manuscript-1843', { draw: 'tree' })}
    <h2>${esc(t('rd.chapters'))}</h2>
    <nav class="chs" aria-label="${esc(t('rd.chapters'))}">${ix.chapters.map((c) =>
      `<a href="#/read/${c.chapter}"${c.chapter === s.ch ? ' class="cur" aria-current="true"' : ''} aria-label="${esc(t('rd.chapter', { n: num(c.chapter) }))}">${esc(num(c.chapter))}</a>`).join('')}</nav>
    <p class="xsmall"><a href="#/texts/dnyaneshwari">${esc(t('rd.full'))}</a></p>
  </div>`;
  ctx.el.querySelector('.plans').addEventListener('click', (e) => {
    const b = e.target.closest('[data-plan]'); if (!b) return;
    const st = state(); st.plan = b.dataset.plan === 'ch' ? 'ch' : +b.dataset.plan; save(st);
    ctx.rerender();
  });
  ctx.el.querySelector('[data-forget]')?.addEventListener('click', () => { keep.del(KEY); ctx.el.querySelector('#rd-st').textContent = t('rd.forgotten'); setTimeout(() => ctx.rerender(), 600); });
}

// ---------- the one-ovi reader ----------
async function reader(ctx, ix, meta) {
  const ch = meta.chapter;
  if (meta.held_back) return heldChapter(ctx, ix, meta);
  const seg = ctx.query.get('seg'), o = ctx.query.get('o');
  // which part holds the target? by segment id range, else by printed number range, else the first
  let pi = 0;
  if (seg) pi = Math.max(0, meta.parts.findIndex((p) => seg >= p.first && seg <= p.last));
  else if (o) pi = Math.max(0, meta.parts.findIndex((p) => +o >= +p.ovi_from && +o <= +p.ovi_to));
  await photosReady();
  let part = await getJSON(meta.parts[pi].file);
  let screens = part.items.filter((it) => it.k !== 'v');
  let start = seg ? screens.findIndex((it) => it.id === seg) : o ? screens.findIndex((it) => String(it.n) === String(o) && it.k === 'o') : 0;
  if (start < 0 && o && !seg) {          // the printed number may sit in another part
    for (let k = 0; k < meta.parts.length && start < 0; k++) {
      if (k === pi) continue;
      const p2 = await getJSON(meta.parts[k].file);
      const sc2 = p2.items.filter((it) => it.k !== 'v');
      const j = sc2.findIndex((it) => String(it.n) === String(o) && it.k === 'o');
      if (j >= 0) { pi = k; part = p2; screens = sc2; start = j; }
    }
  }
  start = Math.max(0, start);
  const gmap = await glossaryMap().catch(() => null);
  const verses = new Map(part.items.filter((it) => it.k === 'v').map((v) => [v.g, v]));
  const doc = meta.documents[0];
  const s0 = state();
  const plan = s0.plan || 0;
  const evText = { cs: 'editorial testimony', src: [], rows: [], noteMr: t('rd.text.mr'),
    srcObjs: [{ id: doc.document_id, title: doc.title, url: doc.source_url, tier: doc.quality_tier, rights: doc.rights }],
    lic: `<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>`,
    note: 'Marathi Wikisource transcription, chapter by chapter; ovi numbers as printed there (numbering anomalies are noted in the full-page reader, not fixed). Gita verses are linked to ovis by rule (certainty high, medium, low or chapter).' };
  const nextCh = ix.chapters.find((c) => c.chapter === ch + 1);

  ctx.el.innerHTML = `<div class="x-read">
    <h1 class="vh" tabindex="-1">${esc(t('rd.title'))}: ${esc(t('rd.chapter', { n: num(ch) }))}</h1>
    <div id="rd-today"></div>
    <div id="rd-pager"></div>
  </div>`;
  const todayLine = () => {
    const s = state();
    const el = ctx.el.querySelector('#rd-today'); if (!el) return;
    if (!s.plan || s.plan === 'ch') { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="portion" style="--p:${Math.min(1, (s.done || 0) / s.plan)}" aria-hidden="true"><i></i></div>` +
      `<p class="todayp" role="status">${esc((s.done || 0) >= s.plan ? t('rd.today.done') : t('rd.today', { done: num(s.done || 0), n: num(s.plan) }))}</p>`;
  };

  let last = start;
  const lastPart = pi === meta.parts.length - 1;
  const rest = () => `<article class="ovi1 rest"><p class="xsmall">${esc(t('rd.ch.done', { n: num(ch) }))}</p>` +
    photo(ch % 2 ? 'manuscript-1843' : 'dnyaneshwari-mandir', { draw: 'tree' }) +
    (nextCh ? `<a class="xdoor" href="#/read/${nextCh.chapter}"><span class="xd-t">${esc(t('rd.next.ch', { n: num(nextCh.chapter) }))}</span><span class="xd-l" lang="mr">${esc(nextCh.first_line)}</span></a>`
      : `<p class="lead">${esc(t('rd.end'))}</p>`) + `</article>`;
  const screen = (k) => {
    if (k >= screens.length) return rest();
    const it = screens[k];
    const v = it.g ? (verses.get(it.g) || verses.get(String(it.g).split(/[-–]/)[0])) : null;
    const body = it.t ? verseBlock(it.t, { glossary: gmap || undefined, halves: true }).replace('class="verse', 'class="xbig') : `<p class="xbig" lang="mr">${esc(it.inc || '')}</p>`;
    return `<article class="ovi1${it.k === 'c' ? ' colophon' : ''}" data-id="${esc(it.id)}">` +
      `<div class="rtop"><span>${esc(t('rd.chapter', { n: num(ch) }))}, ${esc(it.k === 'c' ? t('rd.colophon') : t('rd.ovi', { n: num(it.n) }))}` +
      `${mark({ ...evText, rows: [it.id] }, { what: t('rd.text.what') })}</span><a href="${href('texts/dnyaneshwari/' + ch, { seg: it.id })}">${esc(t('rd.full'))}</a></div>` +
      body +
      `<p class="tools xrow">${it.g ? `<button type="button" class="xlink" data-gita="${esc(it.g)}">${esc(t('rd.gita', { g: num(it.g) }))}</button>` : ''}` +
      `${it.t ? `<a href="${href('card', { seg: it.id })}">${esc(t('rd.card'))}</a>` : ''}</p></article>`;
  };
  const host = ctx.el.querySelector('#rd-pager');
  // glossary words: the meaning in the reader's language; the basis (English research note) only behind the mark
  host.addEventListener('click', (e) => {
    const w = e.target.closest('[data-gl]'); if (!w || !gmap) return;
    e.preventDefault(); e.stopPropagation();
    const g = gmap.get(w.dataset.gl); if (!g) return;
    const L = lang();
    openSheet({ title: g.word, titleLang: 'mr', html:
      (g.headword && g.headword !== g.word ? `<p class="xsmall" lang="mr">${esc(g.headword)}</p>` : '') +
      (L === 'mr' ? (g.mr ? `<p lang="mr" style="font-size:var(--s-1)">${esc(g.mr)}</p>` : `<p lang="en">${esc(g.en || '')}</p>`)
        : (g.en ? `<p lang="en" style="font-size:var(--s-1)">${esc(g.en)}</p>` : '') + (g.mr ? `<p lang="mr">${esc(g.mr)}</p>` : '')) +
      `<p class="xsmall">${esc(t('rd.gl.how'))}${mark({ cs: g.cs, rows: [g.id], note: g.basis, link: 'words/glossary/' + g.id }, { what: g.word })}</p>` });
  }, true);
  host.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-gita]'); if (!b) return;
    const g = b.dataset.gita;
    let v = verses.get(g) || verses.get(g.split(/[-–]/)[0]);
    if (!v) {          // the verse may be in an earlier part of the chapter
      for (const p of meta.parts) { const pj = await getJSON(p.file); v = pj.items.find((x) => x.k === 'v' && (x.g === g || x.g === g.split(/[-–]/)[0])); if (v) break; }
    }
    const it = screens.find((x) => x.g === g);
    openSheet({ title: t('rd.gita.title', { g: num(g) }), html: v ? `<p class="gita" lang="sa" style="font-family:var(--f-text);color:var(--maroon);font-size:var(--s-1);line-height:1.8;white-space:pre-line">${esc(splitLines(v.t).join('\n'))}</p>` +
      (it && /low|chapter/.test(it.gc || '') ? `<p class="xsmall">${esc(t('rd.gita.low'))}</p>` : '') : `<p>${esc(t('error.load'))}</p>` });
  });
  ctx.after = () => {
    todayLine();
    pager(host, {
      count: screens.length + (lastPart ? 1 : 0), start, label: t('rd.pager'),
      render: screen,
      onChange: (k) => {
        if (k >= screens.length) return;          // the rest screen
        const it = screens[k];
        const want = `#/read/${ch}?seg=${it.id}`;
        if (location.hash !== want) history.replaceState(null, '', want);
        const s = state();
        if (k > last) s.done = (s.done || 0) + (k - last);
        last = k;
        Object.assign(s, { ch, seg: it.id, n: it.n, line: (it.t || it.inc || '').split('\n')[0].replace(/\s+/g, ' ').trim() });
        save(s); todayLine();
      },
      onBefore: pi > 0 ? () => { location.hash = `#/read/${ch}?seg=${meta.parts[pi - 1].last}`; }
        : ch > 1 ? () => { const pc = ix.chapters.find((c) => c.chapter === ch - 1); location.hash = `#/read/${ch - 1}` + (pc.parts?.length ? `?seg=${pc.parts.at(-1).last}` : ''); } : null,
      onAfter: pi < meta.parts.length - 1 ? () => { location.hash = `#/read/${ch}?seg=${meta.parts[pi + 1].first}`; }
        : null,
    });
  };
  ctx.manageScroll = false;
  void lang;
}

function heldChapter(ctx, ix, meta) {
  const doc = meta.documents[0];
  ctx.el.innerHTML = `<div class="x-read">
    <h1 tabindex="-1">${esc(t('rd.chapter', { n: num(meta.chapter) }))}</h1>
    <p class="xbig" lang="mr" style="margin:var(--sp-5) 0">${esc(meta.first_line)}</p>
    <p class="held">${esc(t('rd.held'))} <a href="${esc(doc.source_url)}" target="_blank" rel="noopener">${esc(t('rd.held.src'))}</a>.${mark({ cs: 'editorial testimony', srcObjs: [{ id: doc.document_id, title: doc.title, url: doc.source_url, tier: doc.quality_tier, rights: doc.rights }], note: meta.held_back_reason, rows: [doc.document_id] })}</p>
    <p><a class="btn" href="#/read/${meta.chapter + 1}">${esc(t('rd.held.next'))}</a></p>
  </div>`;
}
