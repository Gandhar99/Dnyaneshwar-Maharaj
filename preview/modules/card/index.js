// D. Abhanga card. Routes: #/card?g=<gatha composition id> | ?seg=<Dnyaneshwari or Changdev Pasashti segment id> |
// ?nm=<poem number in Namdev's samadhi cycle>; #/card alone uses today's abhanga.
// A 1080 x 1350 canvas in three quiet designs, with the verse, the signature line and the source, to send (Web Share)
// or save. Only proofread-quality text: Wikisource ovis (Dnyaneshwari, Changdev Pasashti) and gatha poems of text quality A.
// Namdev's poems (unchecked e-Sahitya scan text) and B or C gatha text are refused: cards travel under the owner's name.
// #/card alone opens on an ovi of the Pasaydan (the same each day for everyone).
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, todayIST, fnv1a, href, splitLines } from '../../assets/js/util.js';
import { getJSON, gathaPoem } from '../../assets/js/data.js';
import { drawCard, shareCanvas, canShareFiles, CARD_DESIGNS, keep, mark, gathaCardOK } from '../../assets/js/experience.js';

registerLabels('cd', {
  mr: {
    'title': 'अभंग कार्ड', 'lead': 'ओळी निवडा, रूप निवडा, आणि कार्ड पाठवा किंवा जतन करा. कार्डावर स्रोत आणि परवाना आपोआप छापला जातो.',
    'd.leaf': 'पोथी', 'd.lamp': 'समई', 'd.river': 'इंद्रायणी', 'design': 'कार्डाचे रूप', 'lines': 'कार्डावरील ओळी',
    'share': 'कार्ड पाठवा', 'save': 'चित्र जतन करा', 'shared': 'पाठवले.', 'saved': 'चित्र उतरवले.', 'cancel': '',
    'many': 'ओळी खूप झाल्या; अक्षरे लहान होतील. आठ-दहा ओळी पुरेशा.', 'pick': 'किमान एक ओळ निवडा.',
    'no.text': 'या अभंगाचा पूर्ण पाठ येथे दाखवता येत नाही, म्हणून त्याचे कार्ड बनत नाही.',
    'no.c': 'या अभंगाचा पाठ अजून पूर्ण तपासलेला नाही, म्हणून त्याचे कार्ड बनत नाही.',
    'no.held': 'या ओवीचा पूर्ण पाठ हक्कांमुळे येथे देता येत नाही, म्हणून कार्ड बनत नाही.',
    'notfound': 'हा अभंग सापडला नाही.', 'back': 'मूळ पानावर परत',
    'head.dny': 'संत ज्ञानेश्वर महाराज', 'head.nam': 'संत नामदेव',
    'src.gatha': 'गाथापंचक (साखरे, १९०८), अभंग {n}', 'src.dw': 'ज्ञानेश्वरी, अध्याय {ch}, ओवी {n}', 'src.cp': 'चांगदेव पासष्टी, ओवी {n}',
    'src.nm': 'नामदेव, ‘श्रीज्ञानेश्वरांची समाधी’, अभंग {n}',
    'cr.gatha': 'पाठ: १९०८ ची आवृत्ती, इतर आवृत्त्यांशी जुळवलेला; अजून छापील पानांशी ताडलेला नाही',
    'cr.ws': 'मजकूर: मराठी विकिस्रोत, CC BY-SA 4.0',
    'cr.nm': 'पाठ: ई-साहित्य प्रतिष्ठानची मुक्त प्रत; स्कॅन-पाठ, तपासलेला नाही',
    'what': 'कार्डावरील पाठाचा आधार', 'from': 'कोठून',
    'device': 'कार्ड तुमच्याच फोनवर/संगणकावर बनते; ते कोठेही पाठवले जात नाही, तुम्ही स्वतः पाठवेपर्यंत.',
  },
  en: {
    'title': 'Abhanga card', 'lead': 'Choose the lines and a design, then send or save the card. The source and licence are printed on it.',
    'd.leaf': 'Pothi', 'd.lamp': 'Samai', 'd.river': 'Indrayani', 'design': 'Design', 'lines': 'Lines on the card',
    'share': 'Send the card', 'save': 'Save the picture', 'shared': 'Sent.', 'saved': 'Picture saved.', 'cancel': '',
    'many': 'That is many lines; the letters will be small. Eight to ten lines are enough.', 'pick': 'Choose at least one line.',
    'no.text': 'The full text of this poem cannot be shown here, so it cannot be made into a card.',
    'no.c': 'The text of this poem is not yet fully checked, so no card is made from it.',
    'no.held': 'The full text of this ovi is held back for rights, so it cannot be made into a card.',
    'notfound': 'This poem was not found.', 'back': 'Back to the page',
    'head.dny': 'संत ज्ञानेश्वर महाराज', 'head.nam': 'संत नामदेव',
    'src.gatha': 'गाथापंचक (साखरे, १९०८), अभंग {n}', 'src.dw': 'ज्ञानेश्वरी, अध्याय {ch}, ओवी {n}', 'src.cp': 'चांगदेव पासष्टी, ओवी {n}',
    'src.nm': 'नामदेव, ‘श्रीज्ञानेश्वरांची समाधी’, अभंग {n}',
    'cr.gatha': 'पाठ: १९०८ ची आवृत्ती, इतर आवृत्त्यांशी जुळवलेला; अजून छापील पानांशी ताडलेला नाही',
    'cr.ws': 'मजकूर: मराठी विकिस्रोत, CC BY-SA 4.0',
    'cr.nm': 'पाठ: ई-साहित्य प्रतिष्ठानची मुक्त प्रत; स्कॅन-पाठ, तपासलेला नाही',
    'what': "what the card's text rests on", 'from': 'From',
    'device': 'The card is made on your own phone or computer; nothing is sent anywhere until you send it yourself.',
  },
});
// The card itself is printed in Marathi in both modes (it travels on Marathi WhatsApp groups), hence the same strings.
const mrNum = (n) => num(n, 'mr');

export const title = () => t('cd.title');

/** Resolve the request to { lines, head, source, credit, back, ev } or { refuse }. */
async function resolve(q) {
  // Namdev's samadhi poems: the only full text is the e-Sahitya scan text, not proofread, so no card is made from it
  if (q.get('nm')) return { refuse: t('cd.no.c'), back: '#/samadhi' };
  const seg = q.get('seg');
  if (seg && /^DNY\d\d/.test(seg)) {
    const ix = await getJSON('texts/dnyaneshwari/index.json');
    const ch = +seg.slice(3, 5);
    const meta = ix.chapters.find((c) => c.chapter === ch);
    if (!meta) return { refuse: t('cd.notfound') };
    const part = meta.parts.find((p) => seg >= p.first && seg <= p.last) || meta.parts[0];
    const it = (await getJSON(part.file)).items.find((x) => x.id === seg);
    if (!it) return { refuse: t('cd.notfound') };
    if (!it.t) return { refuse: t('cd.no.held'), back: `#/read/${ch}?seg=${seg}` };
    const doc = meta.documents[0];
    return { lines: splitLines(it.t).map((l) => l.replace(/\s+/g, ' ')), head: t('cd.head.dny'), source: t('cd.src.dw', { ch: mrNum(ch), n: mrNum(it.n) }), credit: t('cd.cr.ws'),
      back: `#/read/${ch}?seg=${seg}`, ev: { cs: 'editorial testimony', rows: [seg], srcObjs: [{ id: doc.document_id, title: doc.title, url: doc.source_url, tier: doc.quality_tier, rights: doc.rights }] } };
  }
  if (seg && /^CP_/.test(seg)) {
    const w = await getJSON('texts/changdev-pasashti.json');
    const it = w.items.find((x) => x.id === seg);
    if (!it) return { refuse: t('cd.notfound') };
    if (!it.t) return { refuse: t('cd.no.held') };
    return { lines: splitLines(it.t), head: t('cd.head.dny'), source: t('cd.src.cp', { n: mrNum(it.n) }), credit: t('cd.cr.ws'), back: `#/texts/changdev-pasashti?seg=${seg}`,
      ev: { cs: 'editorial testimony', rows: [seg], srcObjs: [{ id: w.document_id, title: w.title, url: w.source_url, rights: w.rights }] } };
  }
  const id = q.get('g');
  if (!id) {          // no poem asked for: an ovi of the Pasaydan, chosen by the day (most gatha text is not card quality)
    const n = 1873 + (fnv1a(todayIST()) % 9);
    return resolve(new URLSearchParams({ seg: 'DNY18_' + n }));
  }
  const r = id ? await gathaPoem(id) : null;
  if (!r?.poem) return { refuse: t('cd.notfound') };
  const p = r.poem;
  if (!p.text?.reading_text) return { refuse: t('cd.no.text'), back: `#/texts/gatha/${id}` };
  if (!gathaCardOK(p.text.text_quality)) return { refuse: t('cd.no.c'), back: `#/texts/gatha/${id}` };
  const w = p.witnesses.find((x) => x.witness === 'SKH1908');
  return { lines: splitLines(p.text.reading_text), head: t('cd.head.dny'), source: t('cd.src.gatha', { n: mrNum(w?.source_label || '') }), credit: t('cd.cr.gatha'),
    back: `#/texts/gatha/${id}`, ev: { cs: p.claim_status, rows: [p.id, p.text.segment_id], src: p.source_id, link: `texts/gatha/${id}`,
      note: `Text quality ${p.text.text_quality}: ${p.text.reading_basis || ''}. ${p.text.unresolved_count || 0} unresolved and ${p.text.uncovered_count || 0} uncovered words of ${p.text.token_count || '?'}.` } };
}

export async function render(ctx) {
  const r = await resolve(ctx.query);
  if (r.refuse) {
    ctx.el.innerHTML = `<div class="x-card"><h1 tabindex="-1">${esc(t('cd.title'))}</h1><p class="note">${esc(r.refuse)}</p>` +
      (r.back ? `<p><a class="btn" href="${esc(r.back)}">${esc(t('cd.back'))}</a></p>` : '') + `</div>`;
    return;
  }
  const n = r.lines.length;
  // default: the whole poem up to five lines; else the first two and the last two (the signature line is the last), so the card stays legible on a phone
  const chosen = new Set(n <= 5 ? r.lines.map((_, i) => i) : [0, 1, n - 2, n - 1]);
  let design = keep.get('card.design', 'leaf');
  if (!CARD_DESIGNS.includes(design)) design = 'leaf';
  const sharing = canShareFiles();
  ctx.el.innerHTML = `<div class="x-card">
    <h1 tabindex="-1">${esc(t('cd.title'))}</h1>
    <p class="muted">${esc(t('cd.lead'))}</p>
    <div class="cardwrap">
      <div><canvas width="1080" height="1350" role="img" aria-label="${esc(r.lines[0])}"></canvas></div>
      <div>
        <p class="xsmall">${esc(t('cd.from'))}: <span lang="mr">${esc(r.source)}</span>${mark(r.ev, { what: t('cd.what') })} <a href="${esc(r.back)}">${esc(t('cd.back'))}</a></p>
        <p class="xsmall" id="cd-design-l">${esc(t('cd.design'))}</p>
        <div class="designs" role="group" aria-labelledby="cd-design-l">${CARD_DESIGNS.map((d) =>
          `<button type="button" data-d="${d}" aria-pressed="${d === design}"><i style="background:${d === 'leaf' ? '#E9DCBF' : d === 'lamp' ? '#1B140E' : '#DCE3D6'}"></i>${esc(t('cd.d.' + d))}</button>`).join('')}</div>
        <div class="acts">
          ${sharing ? `<button type="button" class="btn primary" data-act-share>${esc(t('cd.share'))}</button>` : ''}
          <button type="button" class="btn${sharing ? '' : ' primary'}" data-act-save>${esc(t('cd.save'))}</button>
        </div>
        <p class="done" role="status" id="cd-st"></p>
        <p class="xsmall" id="cd-lines-l">${esc(t('cd.lines'))}</p>
        <ul class="lines" aria-labelledby="cd-lines-l" lang="mr">${r.lines.map((l, i) =>
          `<li><label><input type="checkbox" data-i="${i}"${chosen.has(i) ? ' checked' : ''}><span>${esc(l)}</span></label></li>`).join('')}</ul>
        <p class="xsmall">${esc(t('cd.device'))}</p>
      </div>
    </div></div>`;
  const cv = ctx.el.querySelector('canvas'), st = ctx.el.querySelector('#cd-st');
  const draw = async () => {
    const lines = r.lines.filter((_, i) => chosen.has(i));
    st.textContent = !lines.length ? t('cd.pick') : lines.length > 10 ? t('cd.many') : '';
    st.style.color = lines.length && lines.length <= 10 ? '' : 'var(--doubt)';
    await drawCard(cv, { lines: lines.length ? lines : [r.lines[0]], head: r.head, source: r.source, credit: r.credit, design });
  };
  ctx.el.querySelector('.designs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    design = b.dataset.d; keep.set('card.design', design);
    ctx.el.querySelectorAll('.designs [data-d]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  ctx.el.querySelector('.lines').addEventListener('change', (e) => {
    const i = +e.target.dataset.i;
    if (e.target.checked) chosen.add(i); else chosen.delete(i);
    draw();
  });
  const name = () => 'abhang-' + (r.ev?.rows?.[0] || 'card') + '.png';
  const text = () => `${r.source}. ${location.href.split('#')[0]}`;
  ctx.el.querySelector('[data-act-share]')?.addEventListener('click', async () => {
    const res = await shareCanvas(cv, { name: name(), text: text(), prefer: 'share' });
    st.textContent = res === 'cancelled' ? '' : t('cd.' + res);
  });
  ctx.el.querySelector('[data-act-save]').addEventListener('click', async () => {
    const res = await shareCanvas(cv, { name: name(), prefer: 'save' });
    st.textContent = t('cd.' + res);
  });
  ctx.after = () => draw();
  void lang; void href;
}
