// M. Seva: proofreading. Routes: #/seva (what this is and where to begin), #/seva/<composition id>?p=<screen>.
// A poem's collated 1908 text beside its raw scan text, one verse per screen; words the collation changed are marked from the
// data (substitutions). The reader taps a word, types the reading they believe is right and where they read it, and the page
// prepares a message to copy. Nothing is sent by the site; the draft stays on this device. No page images are linked yet.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href, toAsciiDigits } from '../../assets/js/util.js';
import { gathaIndex, gathaPoem } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, pager, openSheet, keep } from '../../assets/js/experience.js';

registerLabels('sv', {
  mr: {
    'lead': 'गाथेचा पाठ छापील पानांवरून यंत्राने वाचलेला आहे; त्यात चुका राहिल्या आहेत. जाणकार वाचक त्या दुरुस्त करू शकतात. पाठ आणि स्कॅन शेजारी पाहा, चुकलेला शब्द दाबा, योग्य वाचन लिहा.',
    'h.honest': 'हे काय आहे आणि काय नाही',
    'nocheck': 'अजून कोणताही पाठ छापील पानांच्या प्रतिमांशी ताडून पाहिलेला नाही.',
    'noimg': 'स्कॅन पानांच्या प्रतिमा येथे अजून जोडलेल्या नाहीत; फक्त छापील पानाचा अंदाजे क्रमांक आणि मूळ स्कॅनचा दुवा आहे.',
    'nosend': 'हे संकेतस्थळ काहीही पाठवत नाही. ते फक्त संदेश तयार करते; तो तुम्ही कॉपी करून स्वतः ई-मेलने पाठवायचा. तुमचा मसुदा याच उपकरणावर राहतो.',
    'evl': 'पाठ-सेवेची मर्यादा', 'start': 'एक अभंग घ्या', 'another': 'दुसरा अभंग', 'byno': '१९०८ च्या आवृत्तीतील क्रमांकाने शोधा',
    'byno.go': 'उघडा', 'byno.none': 'हा क्रमांक सापडला नाही.', 'byno.ph': 'उदा. २५१',
    'why': 'आधी ज्यांचा पाठ कच्चा स्कॅन-पाठ आहे असे अभंग येतात, कारण तेथे मदत सर्वांत जास्त उपयोगी आहे.',
    'p.title': 'एक अभंग, स्कॅनशी ताडून', 'back': 'सेवेचे मुख्य पान', 'pager': 'या अभंगाच्या ओळी',
    'intro.src': 'स्कॅन: {ed}, क्रमांक {no}, छापील पान सुमारे {pg}.', 'intro.open': 'मूळ स्कॅन (archive.org)',
    'counts': '{t} शब्दांपैकी {s} शब्द इतर आवृत्त्यांशी जुळवण्यासाठी बदलले; {u} अनिश्चित; {c} शब्दांना दुसरा साक्षीदार नाही. बदललेले शब्द खाली खुणावले आहेत; अनिश्चित शब्द नेमके कोणते हे नोंदीत सांगितलेले नाही, फक्त संख्या.',
    'single': 'हा अभंग फक्त एकाच आवृत्तीत सापडला; म्हणून पाठ आणि स्कॅन-पाठ सारखेच आहेत आणि सर्व शब्द पडताळण्यासारखे आहेत.',
    'q.C': 'कच्चा स्कॅन-पाठ; शुद्धलेखन तपासलेले नाही.', 'q.B': 'बहुतेक शब्द जुळतात; तरी शुद्धलेखन तपासलेले नाही.', 'q.A': 'सर्व शब्द जुळतात; तरी छापील पानाशी ताडलेले नाही.',
    'basis.what': 'पाठ कसा बनला',
    'line': 'ओळ {i} / {n}', 'col': 'जुळवलेला पाठ', 'scan': 'स्कॅन-पाठ (कच्चा)', 'legend': 'ठिपक्यांची रेघ: जुळवताना बदललेला शब्द. कोणताही शब्द दाबून दुरुस्ती सुचवता येते.',
    'chg': 'स्कॅनमध्ये “{a}”; जुळवलेल्या पाठात “{b}” ({w}).', 'ins': 'जुळवलेल्या पाठात “{b}” हा शब्द जोडला आहे ({w}).',
    'prop.t': 'दुरुस्ती सुचवा', 'prop.word': 'पाठातील शब्द', 'prop.scan': 'स्कॅनमधील शब्द', 'prop.new': 'तुमच्या मते योग्य वाचन', 'prop.where': 'कुठे वाचले?',
    'w.page': 'छापील पुस्तकाचे पान (पान क्रमांक लिहा)', 'w.ms': 'हस्तलिखित', 'w.ed': 'दुसरी आवृत्ती', 'w.other': 'इतर', 'prop.detail': 'पान, ओळ किंवा आवृत्तीचे नाव', 'prop.note': 'टीप (ऐच्छिक)',
    'prop.add': 'माझ्या संदेशात जोडा', 'prop.added': 'जोडले. संदेशात आता {n} सूचना आहेत.', 'prop.need': 'सुचवलेले वाचन आणि ते कुठे वाचले ते लिहा.',
    'addr': 'सूचना किंवा दुरुस्ती संकेतस्थळाच्या संपादकांपर्यंत पोहोचवण्यासाठी ई-मेल पत्ता:', 'msg.make': 'संदेश तयार करा ({n})', 'msg.t': 'तुमचा संदेश', 'msg.empty': 'अजून एकही सूचना जोडलेली नाही.',
    'msg.to': 'ही सूचना संकेतस्थळाच्या संपादकांपर्यंत पोहोचवण्यासाठी संदेश कॉपी करा आणि या पत्त्यावर ई-मेलने पाठवा:',
    'msg.copy': 'कॉपी करा', 'msg.copied': 'कॉपी झाले.', 'msg.sel': 'वरील मजकूर निवडला आहे; तो कॉपी करा.', 'msg.clear': 'मसुदा पुसा', 'msg.stay': 'मसुदा फक्त या उपकरणावर राहतो.',
    'end.t': 'या अभंगाच्या ओळी येथे संपल्या.', 'end.l': 'तुम्ही जोडलेल्या सूचना तयार संदेशात आहेत.',
    'nf': 'हा अभंग सापडला नाही.', 'notext': 'या अभंगाचा पाठ आमच्याकडे नाही; तो १९०८ च्या आवृत्तीत सापडला नाही.',
    'msg.subj': 'संत ज्ञानेश्वर गाथा: पाठ-दुरुस्तीची सूचना', 'm.poem': 'अभंग', 'm.first': 'पहिली ओळ', 'm.scan': 'स्कॅन', 'm.item': 'सूचना', 'm.line': 'ओळ', 'm.rw': 'जुळवलेल्या पाठातील शब्द क्र.',
    'm.sw': 'स्कॅन-पाठातील शब्द क्र.', 'm.pos': 'नोंदीतील स्थान', 'm.cur': 'सध्याचे वाचन', 'm.scanw': 'स्कॅनमधील वाचन', 'm.new': 'सुचवलेले वाचन', 'm.where': 'कुठे वाचले', 'm.note': 'टीप',
    'm.foot': 'हा मजकूर सेवा-पानावरून तयार केला आहे; संकेतस्थळाने तो कोठेही पाठवलेला नाही. शब्द क्रमांक या पानाने मोजले आहेत (फक्त शब्द; दंड, क्रमांक वगळून).',
  },
  en: {
    'lead': 'The text of the gatha was read from printed pages by machine, and mistakes remain. A knowledgeable reader can correct them. See the text beside the scan, tap a word that is wrong, and type the right reading.',
    'h.honest': 'What this is, and what it is not',
    'nocheck': 'No text has yet been checked against images of the printed pages.',
    'noimg': 'Images of the scanned pages are not linked here yet; there is only the approximate printed page number and a link to the original scan.',
    'nosend': 'This site sends nothing. It only prepares a message, which you copy and send yourself by email. Your draft stays on this device.',
    'evl': 'the limits of this seva', 'start': 'Take a poem', 'another': 'Another poem', 'byno': 'Find by its number in the 1908 edition',
    'byno.go': 'Open', 'byno.none': 'That number was not found.', 'byno.ph': 'e.g. 251',
    'why': 'Poems whose text is raw scan text come first, because help is most useful there.',
    'p.title': 'One abhanga, against its scan', 'back': 'Seva home', 'pager': "This poem's lines",
    'intro.src': 'Scan: {ed}, number {no}, printed page about {pg}.', 'intro.open': 'The original scan (archive.org)',
    'counts': 'Of {t} words, {s} were changed to agree with the other editions, {u} are unresolved and {c} have no second witness. Changed words are marked below; which words are unresolved is not recorded, only how many.',
    'single': 'This poem was found in one edition only, so the text and the scan text are the same and every word is open to checking.',
    'q.C': 'Raw scan text; spelling not checked.', 'q.B': 'Most words agree; spelling still not checked.', 'q.A': 'Every word agrees; not yet checked against the printed page.',
    'basis.what': 'how the text was built',
    'line': 'Line {i} of {n}', 'col': 'Collated text', 'scan': 'Scan text (raw)', 'legend': 'Dotted underline: a word changed in collation. Tap any word to suggest a correction.',
    'chg': 'Scan: "{a}"; collated text: "{b}" ({w}).', 'ins': 'The collated text adds the word "{b}" ({w}).',
    'prop.t': 'Suggest a correction', 'prop.word': 'Word in the text', 'prop.scan': 'Word in the scan', 'prop.new': 'The reading you believe is right', 'prop.where': 'Where did you read it?',
    'w.page': 'A printed book (give the page)', 'w.ms': 'A manuscript', 'w.ed': 'Another edition', 'w.other': 'Other', 'prop.detail': 'Page, line or name of the edition', 'prop.note': 'Note (optional)',
    'prop.add': 'Add to my message', 'prop.added': 'Added. Your message now holds {n} suggestions.', 'prop.need': 'Type the reading and where you read it.',
    'addr': 'To bring a suggestion or correction to the editor of this site, the email address is:', 'msg.make': 'Prepare the message ({n})', 'msg.t': 'Your message', 'msg.empty': 'No suggestion added yet.',
    'msg.to': 'To bring your suggestion to the editor of this site, copy the message and send it by email to:',
    'msg.copy': 'Copy', 'msg.copied': 'Copied.', 'msg.sel': 'The text above is selected; copy it.', 'msg.clear': 'Clear the draft', 'msg.stay': 'The draft stays on this device only.',
    'end.t': "This poem's lines end here.", 'end.l': 'The suggestions you added are in the prepared message.',
    'nf': 'This poem was not found.', 'notext': 'We hold no text of this poem; it was not found in the 1908 edition.',
    'msg.subj': 'Sant Dnyaneshwar gatha: text correction', 'm.poem': 'Poem', 'm.first': 'First line', 'm.scan': 'Scan', 'm.item': 'Suggestion', 'm.line': 'Line', 'm.rw': 'Word no. in the collated text',
    'm.sw': 'Word no. in the scan text', 'm.pos': 'position in the data', 'm.cur': 'Current reading', 'm.scanw': 'Scan reading', 'm.new': 'Proposed reading', 'm.where': 'Where read', 'm.note': 'Note',
    'm.foot': 'Prepared on the seva page; the site has sent it nowhere. Word numbers are counted by this page (words only; danda and verse numbers left out).',
  },
});

export const title = () => t('x.seva');

// ---------- words ----------
const WORD = /[ऀ-ॣॱ-ॿ‌‍]+/g;
const cf = (w) => String(w || '').normalize('NFC').replace(/[‌‍़]/g, '');
function tokens(raw) {
  const ms = [...raw.matchAll(WORD)], out = [];
  for (let i = 0; i < ms.length; i++) {
    let w = ms[i][0], s = ms[i].index, e = s + w.length;
    while (i + 1 < ms.length) {
      const gap = raw.slice(e, ms[i + 1].index);
      if (gap.includes('-') && gap.includes('\n') && !/[।॥|०-९0-9]/.test(gap) && gap.length < 8) { i++; w += ms[i][0]; e = ms[i].index + ms[i][0].length; } else break;
    }
    out.push({ w, s, e });
  }
  return out;
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const sim = (a, b) => { a = cf(a); b = cf(b); return a === b ? 0 : Math.min(1, 0.35 + lev(a, b) / Math.max(a.length, b.length)); };
/** align reading tokens R to scan tokens S: returns r2s[i] = j or -1 */
function align(R, S) {
  const n = R.length, m = S.length, r2s = new Array(n).fill(-1);
  if (!n || !m) return r2s;
  if (n * m > 400000) { for (let i = 0; i < Math.min(n, m); i++) r2s[i] = i; return r2s; }
  const G = 0.9, D = Array.from({ length: n + 1 }, () => new Float32Array(m + 1)), B = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { D[i][0] = i * G; B[i][0] = 1; }
  for (let j = 1; j <= m; j++) { D[0][j] = j * G; B[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const d = D[i - 1][j - 1] + sim(R[i - 1].w, S[j - 1].w), u = D[i - 1][j] + G, l = D[i][j - 1] + G;
    if (d <= u && d <= l) { D[i][j] = d; B[i][j] = 0; } else if (u <= l) { D[i][j] = u; B[i][j] = 1; } else { D[i][j] = l; B[i][j] = 2; }
  }
  let i = n, j = m;
  while (i > 0 || j > 0) { const b = B[i][j]; if (i > 0 && j > 0 && b === 0) { r2s[i - 1] = j - 1; i--; j--; } else if (i > 0 && (b === 1 || j === 0)) i--; else j--; }
  return r2s;
}
/** html of a text where each word is a button; extra(i) -> class, base = index of the first word */
function wordsHtml(text, toks, base, side, cls) {
  let html = '', at = 0;
  toks.forEach((k, n) => {
    html += esc(text.slice(at, k.s).replace(/\s*\n\s*/g, ' '));
    html += `<button type="button" class="w ${cls(base + n) || ''}" data-side="${side}" data-i="${base + n}">${esc(k.w)}</button>`;
    at = k.e;
  });
  return html + esc(text.slice(at).replace(/\s*\n\s*/g, ' '));
}

export async function render(ctx) {
  const id = ctx.path[0];
  const gi = await gathaIndex();
  const pool = gi.rows.filter((r) => r.q === 'C' && r.has_text);
  if (!id) return landing(ctx, gi, pool);
  const res = await gathaPoem(id);
  if (!res?.poem?.text) {
    ctx.el.innerHTML = `${CSS}<div class="x-seva"><h1 tabindex="-1">${esc(t('sv.p.title'))}</h1><p>${esc(res?.poem ? t('sv.notext') : t('sv.nf'))}</p><p><a class="btn" href="#/seva">${esc(t('sv.back'))}</a></p></div>`;
    return;
  }
  keep.set('seva.last', id);
  const L = lang(), p = res.poem, tx = p.text;
  const skh = p.witnesses.find((w) => w.witness === 'SKH1908') || {};
  const S = tokens(tx.ocr_text);
  const lines = tx.reading_text.split('\n').filter((l) => l.trim());
  const R = [], lineOf = [], starts = [];
  lines.forEach((ln, li) => { starts.push(R.length); tokens(ln).forEach((k) => { R.push({ ...k, ln: li }); lineOf.push(li); }); });
  const r2s = align(R, S);
  const s2r = new Array(S.length).fill(-1);
  r2s.forEach((j, i) => { if (j >= 0) s2r[j] = i; });
  // changed words, from the data's substitutions (position counts scan words from 0; matched by word, nearest first)
  const subR = new Map(), subS = new Map(), subInfo = [];
  const usedR = new Set(), usedS = new Set();
  const near = (arr, word, pos, used) => { let best = -1, bd = 99; arr.forEach((k, i) => { const d = Math.abs(i - pos); if (!used.has(i) && cf(k.w) === cf(word) && d < bd && d <= 10) { bd = d; best = i; } }); return best; };
  for (const s of tx.substitutions || []) {
    let sj = s.skh ? near(S, s.skh, s.position, usedS) : -1;
    let ri = sj >= 0 && s2r[sj] >= 0 ? s2r[sj] : (s.adopted ? near(R, s.adopted, s.position, usedR) : -1);
    if (sj >= 0) { usedS.add(sj); subS.set(sj, s); }
    if (ri >= 0) { usedR.add(ri); subR.set(ri, s); }
    subInfo.push(s);
  }
  const nameOf = (c) => t('w.' + c);
  const ev = { cs: p.claim_status || 'reconstruction', rows: [tx.segment_id, p.id], src: ['DNYC-S01'], link: `texts/gatha/${p.id}`,
    note: [`Collated text: ${tx.reading_basis}; quality ${tx.text_quality}; ${tx.token_count} words, ${(tx.substitutions || []).length} substituted, ${tx.unresolved_count} unresolved, ${tx.uncovered_count} uncovered.`,
      'Substitution positions count words of the scan text from 0. Positions of unresolved and uncovered words are not in the data.'], noteMr: 'हा जुळवलेला पाठ यंत्राने तीन आवृत्त्यांच्या तुलनेतून रचलेला आहे; कोणी तपासलेला नाही.' };
  const single = /^single/.test(tx.reading_basis);

  const screens = [];
  // intro
  const srcLine = t('sv.intro.src', { ed: nameOf('SKH1908'), no: num(String(skh.source_label ?? '–')), pg: num(String(skh.printed_page ?? '–')) });
  screens.push(`<article class="sv"><p class="fl" lang="mr">${esc(keepDandas(p.first_line_display))}</p>
    <p class="xnote">${esc(srcLine)} <a href="https://archive.org/details/${esc(gi.editions?.SKH1908?.scan_item || 'sakalsantgatha')}" target="_blank" rel="noopener">${esc(t('sv.intro.open'))}</a></p>
    <p class="xnote">${esc(t('sv.q.' + tx.text_quality))}${mark(ev, { what: t('sv.basis.what') })}</p>
    <p class="xnote">${single ? esc(t('sv.single')) : esc(t('sv.counts', { t: num(tx.token_count), s: num((tx.substitutions || []).length), u: num(tx.unresolved_count || 0), c: num(tx.uncovered_count || 0) }))}</p>
    <p class="xnote strong">${esc(t('sv.nocheck'))} ${esc(t('sv.noimg'))}</p></article>`);
  // one verse per screen
  lines.forEach((ln, li) => {
    const rt = R.filter((k) => k.ln === li), r0 = starts[li];
    const js = rt.map((_, n) => r2s[r0 + n]).filter((j) => j >= 0);
    let scanHtml;
    if (js.length) {
      const j0 = Math.min(...js), j1 = Math.max(...js), a = S[j0].s;
      let b = S[j1].e; const nx = S[j1 + 1] ? S[j1 + 1].s : tx.ocr_text.length; const tail = tx.ocr_text.slice(b, nx);
      if (/^[\s।॥|०-९0-9\]\[.,]{0,14}$/.test(tail)) b = nx;
      scanHtml = wordsHtml(tx.ocr_text.slice(a, b), S.slice(j0, j1 + 1).map((k) => ({ ...k, s: k.s - a, e: k.e - a })), j0, 's', (i) => (subS.has(i) ? 'sub' : ''));
    } else scanHtml = '<span class="xsmall">–</span>';
    const rr = R.map((k, i) => k).slice(r0, r0 + rt.length).map((k) => ({ ...k, s: k.s, e: k.e }));
    const textHtml = wordsHtml(ln, rr.map((k) => ({ w: k.w, s: k.s, e: k.e })), r0, 'r', (i) => (subR.has(i) ? 'sub' : ''));
    const subs = [...new Set(rt.map((_, n) => r0 + n))].filter((i) => subR.has(i)).map((i) => subR.get(i));
    const cap = subs.map((s) => `<span lang="mr">${esc(s.skh ? t('sv.chg', { a: s.skh, b: s.adopted ?? '–', w: s.from }) : t('sv.ins', { b: s.adopted, w: s.from }))}</span>`).join(' ');
    screens.push(`<article class="sv"><p class="xsmall">${esc(t('sv.line', { i: num(li + 1), n: num(lines.length) }))}</p>
      <p class="col">${esc(t('sv.col'))}${mark(ev, { what: t('sv.basis.what') })}</p><p class="line" lang="mr">${textHtml}</p>
      <p class="col">${esc(t('sv.scan'))}</p><p class="line raw" lang="mr">${scanHtml}</p>
      ${cap ? `<p class="xsmall cap">${cap}</p>` : ''}<p class="xsmall">${esc(t('sv.legend'))}</p></article>`);
  });
  screens.push(`<article class="sv"><p class="fl">${esc(t('sv.end.t'))}</p><p class="xnote">${esc(t('sv.end.l'))}</p>
    <p class="xrow"><button type="button" class="btn" data-msg>${esc(t('sv.msg.make', { n: num(draft().length) }))}</button><a href="${nextHref(pool, id)}">${esc(t('sv.another'))}</a></p></article>`);

  ctx.el.innerHTML = `${CSS}<div class="x-seva"><p class="xsmall"><a href="#/seva">${esc(t('sv.back'))}</a></p><h1 tabindex="-1">${esc(t('sv.p.title'))}</h1>
    <div id="sv-pager"></div><div id="sv-panel" class="panel" aria-live="polite"></div>
    <p class="xrow"><button type="button" class="xlink" data-msg>${esc(t('sv.msg.make', { n: '' }).replace(/\s*\(\s*\)/, ''))}<span class="dn"></span></button></p></div>`;

  ctx.after = () => {
    const root = ctx.el.querySelector('.x-seva'), panel = root.querySelector('#sv-panel');
    const refreshN = () => root.querySelectorAll('.dn').forEach((e) => { e.textContent = draft().length ? ` (${num(draft().length)})` : ''; });
    refreshN();
    const pg = pager(root.querySelector('#sv-pager'), {
      count: screens.length, label: t('sv.pager'), render: (i) => screens[i],
      start: Math.max(0, Math.min(screens.length - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1)),
      onChange: (i, el) => {
        panel.innerHTML = '';
        const want = `#/seva/${id}${i ? '?p=' + (i + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want);
        el.addEventListener('click', (e) => { const b = e.target.closest('.w'); if (b) pickWord(b); });
        el.querySelectorAll('[data-msg]').forEach((b) => b.addEventListener('click', openMessage));
      },
    });
    root.querySelectorAll(':scope > .xrow [data-msg]').forEach((b) => b.addEventListener('click', openMessage));

    function pickWord(b) {
      const side = b.dataset.side, i = +b.dataset.i;
      let ri, sj;
      if (side === 'r') { ri = i; sj = r2s[i]; } else { sj = i; ri = s2r[i]; }
      const rw = ri >= 0 ? R[ri].w : '', sw = sj >= 0 ? S[sj].w : '';
      const info = subR.get(ri) || subS.get(sj);
      panel.innerHTML = `<form class="prop" novalidate><h2>${esc(t('sv.prop.t'))}</h2>
        <p><span class="k">${esc(t('sv.prop.word'))}</span> <b lang="mr">${esc(rw || '–')}</b>${ri >= 0 ? ` <span class="xsmall">(${esc(num(ri + 1))})</span>` : ''}</p>
        <p><span class="k">${esc(t('sv.prop.scan'))}</span> <b lang="mr">${esc(sw || '–')}</b>${sj >= 0 ? ` <span class="xsmall">(${esc(num(sj + 1))})</span>` : ''}</p>
        <label>${esc(t('sv.prop.new'))}<input name="new" lang="mr" autocomplete="off" value="${esc(rw)}"></label>
        <label>${esc(t('sv.prop.where'))}<select name="kind"><option value="page">${esc(t('sv.w.page'))}</option><option value="ms">${esc(t('sv.w.ms'))}</option><option value="ed">${esc(t('sv.w.ed'))}</option><option value="other">${esc(t('sv.w.other'))}</option></select></label>
        <label>${esc(t('sv.prop.detail'))}<input name="detail" autocomplete="off"></label>
        <label>${esc(t('sv.prop.note'))}<input name="note" autocomplete="off"></label>
        <p class="xrow"><button type="submit" class="btn">${esc(t('sv.prop.add'))}</button></p><p class="xsmall msg" role="status"></p></form>`;
      const f = panel.querySelector('form');
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(f));
        const say = panel.querySelector('.msg');
        if (!v.new.trim() || !(v.detail.trim() || v.kind)) { say.textContent = t('sv.prop.need'); return; }
        if (!v.detail.trim() && v.kind === 'page') { say.textContent = t('sv.prop.need'); return; }
        const d = draft();
        d.push({ poem: p.id, first: p.first_line_display, line: ri >= 0 ? R[ri].ln + 1 : (lineOf[r2s.indexOf(sj)] ?? 0) + 1, rno: ri >= 0 ? ri + 1 : null, sno: sj >= 0 ? sj + 1 : null,
          pos: info ? info.position : null, cur: rw, scan: sw, now: v.new.trim(), kind: v.kind, detail: v.detail.trim(), note: v.note.trim(),
          ed: nameOf('SKH1908'), edno: skh.source_label, pg: skh.printed_page });
        keep.set('seva.draft', d);
        say.textContent = t('sv.prop.added', { n: num(d.length) }); refreshN();
      });
      f.querySelector('input[name=new]').focus();
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    root.addEventListener('keydown', () => {});
  };
}

const draft = () => { const d = keep.get('seva.draft', []); return Array.isArray(d) ? d : []; };
const nextHref = (pool, id) => { const i = pool.findIndex((r) => r.id === id); return href('seva/' + pool[(i + 1 + pool.length) % pool.length].id); };

function messageText() {
  const d = draft(), W = Object.fromEntries(['page', 'ms', 'ed', 'other'].map((k) => [k, t('sv.w.' + k).replace(/\s*\([^)]*\)\s*$/, '')]));   // without the form's hint
  const out = [`${t('sv.msg.subj')}`, ''];
  const byPoem = new Map(); d.forEach((x) => (byPoem.get(x.poem) || byPoem.set(x.poem, []).get(x.poem)).push(x));
  for (const [poem, xs] of byPoem) {
    const a = xs[0];
    out.push(`${t('sv.m.poem')}: ${poem}`, `${t('sv.m.first')}: ${a.first}`, `${t('sv.m.scan')}: ${a.ed}, ${a.edno ?? '–'}${a.pg ? ', ~' + a.pg : ''}`, '');
    xs.forEach((x, k) => {
      const N = (v) => (v == null ? '–' : num(String(v)));
      out.push(`${N(k + 1)}) ${t('sv.m.line')} ${N(x.line)}; ${t('sv.m.rw')} ${N(x.rno)}; ${t('sv.m.sw')} ${N(x.sno)}${x.pos != null ? `; ${t('sv.m.pos')} ${N(x.pos)}` : ''}`,
        `   ${t('sv.m.cur')}: ${x.cur || '–'}`, `   ${t('sv.m.scanw')}: ${x.scan || '–'}`, `   ${t('sv.m.new')}: ${x.now}`,
        `   ${t('sv.m.where')}: ${W[x.kind] || x.kind}${x.detail ? ', ' + x.detail : ''}`);
      if (x.note) out.push(`   ${t('sv.m.note')}: ${x.note}`);
    });
    out.push('');
  }
  out.push('--', t('sv.m.foot'));
  return out.join('\n');
}

const MAIL = `<a href="mailto:gandharnewasar@outlook.com" lang="en" translate="no">gandharnewasar@outlook.com</a>`;
function openMessage() {
  const d = draft();
  const panel = openSheet({ title: t('sv.msg.t'), html: d.length
    ? `<p class="xsmall">${esc(t('sv.msg.to'))} <a href="mailto:gandharnewasar@outlook.com?subject=${encodeURIComponent(t('sv.msg.subj'))}" lang="en" translate="no">gandharnewasar@outlook.com</a></p><textarea rows="14" readonly style="display:block;width:100%;box-sizing:border-box;min-height:14rem;margin:.5rem 0;padding:.6rem;font:inherit;font-size:.9rem;line-height:1.5;color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:6px" aria-label="${esc(t('sv.msg.t'))}">${esc(messageText())}</textarea>
       <p class="xrow"><button type="button" class="btn" data-copy>${esc(t('sv.msg.copy'))}</button><button type="button" class="xlink" data-clear>${esc(t('sv.msg.clear'))}</button></p><p class="xsmall" data-say role="status"></p><p class="xsmall">${esc(t('sv.msg.stay'))}</p>`
    : `<p>${esc(t('sv.msg.empty'))}</p><p class="xsmall">${esc(t('sv.addr'))} ${MAIL}</p>` });
  const ta = panel.querySelector('textarea'), say = panel.querySelector('[data-say]');
  panel.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(ta.value); say.textContent = t('sv.msg.copied'); }
    catch { ta.focus(); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* none */ } say.textContent = ok ? t('sv.msg.copied') : t('sv.msg.sel'); }
  });
  panel.querySelector('[data-clear]')?.addEventListener('click', () => { keep.del('seva.draft'); ta.value = ''; say.textContent = ''; document.querySelectorAll('.x-seva .dn').forEach((e) => { e.textContent = ''; }); });
}

function landing(ctx, gi, pool) {
  const last = keep.get('seva.last');
  const first = pool.find((r) => r.id === last) ? pool[(pool.findIndex((r) => r.id === last) + 1) % pool.length] : pool[0];
  const ev = { cs: 'reconstruction', rows: ['gatha/index.json'], link: 'evidence/standard', note: [`${pool.length} poems with a 1908 text of quality C (raw scan text) are offered first; ${gi.rows.filter((r) => r.has_text).length} poems have a 1908 text in all.`, 'scan_leaf (the page image reference) is empty for every poem in the data.'], noteMr: t('sv.noimg') };
  ctx.el.innerHTML = `${CSS}<div class="x-seva"><h1 tabindex="-1">${esc(t('x.seva'))}</h1>
    <p class="lead">${esc(t('sv.lead'))}</p>
    <p class="xrow"><a class="btn" href="${href('seva/' + first.id)}">${esc(t(last ? 'sv.another' : 'sv.start'))}</a></p>
    <p class="xsmall">${esc(t('sv.why'))}</p>
    <h2 class="h2">${esc(t('sv.h.honest'))}</h2>
    <p class="xnote strong">${esc(t('sv.nocheck'))}</p><p class="xnote">${esc(t('sv.noimg'))}${mark(ev, { what: t('sv.evl') })}</p><p class="xnote">${esc(t('sv.nosend'))}</p><p class="xnote">${esc(t('sv.addr'))} ${MAIL}</p>
    <form class="byno" novalidate><label>${esc(t('sv.byno'))}<input name="n" inputmode="numeric" placeholder="${esc(t('sv.byno.ph'))}" autocomplete="off"></label><button type="submit" class="btn">${esc(t('sv.byno.go'))}</button><p class="xsmall msg" role="status"></p></form></div>`;
  ctx.after = () => {
    const f = ctx.el.querySelector('.byno');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = toAsciiDigits(f.n.value.trim()); const say = f.querySelector('.msg');
      const row = gi.rows.find((r) => r.has_text && r.witnesses.some(([w, no]) => w === 'SKH1908' && toAsciiDigits(no) === n));
      if (row) location.hash = `#/seva/${row.id}`; else say.textContent = t('sv.byno.none');
    });
  };
}

const CSS = `<style>
.x-seva{max-width:44rem;margin:0 auto;padding:var(--sp-4) var(--sp-4) var(--sp-6)}
.x-seva h1{font-size:var(--s-3);margin:0 0 var(--sp-2)}
.x-seva .lead{font-family:var(--f-text);font-size:var(--s-1);line-height:1.7;margin:var(--sp-3) 0}
.x-seva .h2{font-size:var(--s-1);margin:var(--sp-5) 0 var(--sp-2)}
.x-seva .strong{color:var(--ink);border-left:2px solid var(--maroon);padding-left:var(--sp-3)}
.x-seva .fl{font-family:var(--f-text);font-size:var(--s-2);line-height:1.6;margin:var(--sp-2) 0}
.x-seva .col{font-size:.78rem;color:var(--ink-3);margin:var(--sp-4) 0 .1rem}
.x-seva .line{font-family:var(--f-text);font-size:1.3rem;line-height:1.9;margin:0}
.x-seva .line.raw{font-size:1.05rem;color:var(--ink-2);line-height:1.8;border-top:1px dashed var(--rule);padding-top:var(--sp-2)}
.x-seva .w{appearance:none;background:none;border:0;padding:0 .05em;margin:0;font:inherit;color:inherit;cursor:pointer;border-radius:3px}
.x-seva .w:hover{background:var(--paper-2)}
.x-seva .w.sub{text-decoration:underline dotted var(--saffron);text-decoration-thickness:2px;text-underline-offset:.3em}
.x-seva .cap{margin-top:var(--sp-2)}
.x-seva .panel:not(:empty){margin:var(--sp-4) 0;padding:var(--sp-4);border:1px solid var(--rule);border-radius:var(--r-2);background:var(--paper-3)}
.x-seva .prop h2{font-size:var(--s-1);margin:0 0 var(--sp-2)}
.x-seva .prop p{margin:.2rem 0}
.x-seva .k{color:var(--ink-3);font-size:.8rem}
.x-seva label{display:block;font-size:var(--s--1);color:var(--ink-2);margin:var(--sp-2) 0}
.x-seva input,.x-seva select,.x-seva .zz{display:block;width:100%;box-sizing:border-box;margin-top:.2rem;padding:.55rem .6rem;font:inherit;font-size:1rem;color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:6px;min-height:44px}
.x-seva .byno{margin-top:var(--sp-5);border-top:1px solid var(--rule);padding-top:var(--sp-4)}
.x-seva .byno .btn{margin-top:var(--sp-2)}
</style>`;
