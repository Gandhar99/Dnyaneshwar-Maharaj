// B. The samadhi, as Namdev tells it. Routes: #/samadhi (opens on today's day of the sohala, else day 1),
// #/samadhi/<1-8>?p=<poem on that day, 1-based>. Data: data/samadhi.json (Namdev's cycle, exporter), home.json (sohala rows).
// One poem per screen (kit pager); each day opens with its date, tithi where the data states it, and Alandi that day.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, todayIST, formatDate, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, pager, daysTo, photo, photosReady } from '../../assets/js/experience.js';

// The eight days of the Sanjeevan Samadhi Sohala 2026 and the part of Namdev's cycle "श्रीज्ञानेश्वरांची समाधी" read on
// each. The division is this site's own (it is marked so on the page). It follows the cycle's own order and lets the days
// the poems name fall on the matching days of the sohala: the plan of the days (poem 27), the Dashami round and the vigil
// on Haridin (43) on Ekadashi, the Dwadashi meal at the pimpal-par (45) on Dwadashi, the samadhi (67, 68) on Trayodashi.
// Headings are words of the day's own poems (verified against the e-Sahitya text shown). "Alandi today" lines are
// written by hand from the observance rows named in `obs`; `photo` names a slot of media/photos.json shown on the
// day's first screen (modest captions: what is seen, not a claim that it shows this day); their sources open from the mark. Days without a row say so.
export const SOHALA = [
  { d: 1, date: '2026-12-01', from: 1, to: 10, photo: 'alandi-ghat', quote: 'धन्य इंद्रायणी पिंपळाचा पार', quoteN: 8, obs: 'DNYG-P-OB03',
    mr: 'देऊळवाड्यात गुरू हैबतबाबांच्या पायरीपूजनाने सोहळा सुरू होतो. एका वृत्तपत्रानुसार अखंड हरिनाम सप्ताह २९ नोव्हेंबरपासून चालू आहे.',
    en: 'The sohala opens with the step-worship of Guru Haibatbaba at the Deulwada. One newspaper adds that an Akhand Harinam Saptah has been running since 29 November.' },
  { d: 2, date: '2026-12-02', from: 11, to: 20, photo: 'indrayani-weir', quote: 'येथेंची समाधि ज्ञानदेवा', quoteN: 15 },
  { d: 3, date: '2026-12-03', from: 21, to: 30, quote: 'मुहूर्त देवापाशीं विचारिला', quoteN: 27 },
  { d: 4, date: '2026-12-04', from: 31, to: 43, quote: 'हरिदिनीं थोर कृष्णपक्षीं', quoteN: 43, obs: 'DNYG-P-OB01', peak: true,
    tithi: { mr: 'कार्तिक वद्य एकादशी', en: 'Kartik Vadya Ekadashi' },
    mr: 'पहाटे बारा ब्रह्मवृंदांच्या वेदघोषात समाधीची मुख्य पूजा; दिवसभर दर्शन. पुढारीनुसार दुपारी एक वाजता पालखी देऊळवाड्यातून गावप्रदक्षिणेला निघते आणि रात्री नऊच्या सुमारास परतते.',
    en: 'Before dawn, the main puja at the samadhi with Vedic chanting by twelve priests; darshan all day. Per Pudhari, the palkhi leaves the Deulwada at 1 pm for a circuit of the town and returns at about 9 pm.' },
  { d: 5, date: '2026-12-05', from: 44, to: 50, quote: 'पिंपळाचे पारी बैसविल्या पंक्ती', quoteN: 45, obs: 'DNYG-P-OB05',
    tithi: { mr: 'द्वादशी', en: 'Dwadashi' },
    mr: 'पहाटे साडेतीनच्या सुमारास शासकीय पूजा; दुपारी चार वाजता पालखी पारंपरिक रथोत्सवासाठी निघते. ही नोंद फक्त पुढारीत आहे.',
    en: 'A government puja at about 3:30 am; at 4 pm the palkhi leaves for the traditional rathotsav. Only Pudhari reports this.' },
  { d: 6, date: '2026-12-06', from: 51, to: 68, photo: 'alandi-temple', quote: 'बाप ज्ञानेश्वर समाधिस्थ', quoteN: 67, obs: 'DNYG-P-OB02', peak: true, samadhi: true,
    tithi: { mr: 'कार्तिक वद्य त्रयोदशी: समाधी दिन', en: 'Kartik Vadya Trayodashi: the samadhi day' },
    mr: 'पहाटे तीन ते चार प्रमुख विश्वस्तांच्या हस्ते पवमान अभिषेक आणि दुधारती; सकाळी चल पादुकांवर भाविकांची पूजा; महाद्वारात आणि वीणा मंडपात कीर्तने; सकाळी नऊ ते दुपारी बारा नामदेवांच्या वंशजांचे समाधी प्रसंगावर कीर्तन; दुपारी बारा वाजता समाधी सोहळा.',
    en: "From 3 to 4 am the chief trustee performs the pavamaan abhishek and the milk aarti; devotees' puja on the chal paduka in the morning; kirtans at the Mahadwar and the Veena Mandap; from 9 am to noon a kirtan on the samadhi by Namdev's descendants; the samadhi observance at noon." },
  { d: 7, date: '2026-12-07', from: 69, to: 71, quote: 'नव दिवस संत समाधिजवळी', quoteN: 70 },
  { d: 8, date: '2026-12-08', from: 72, to: 72, photo: 'palkhi-alandi', quote: 'यात्रा परिपूर्ण झाली म्हणती', quoteN: 72, obs: 'DNYG-P-OB04',
    tithi: { mr: 'अमावास्या (एका पंचांग पानानुसार)', en: 'Amavasya (per one calendar page)' },
    mr: 'रात्री पालखीची नगरप्रदक्षिणा आणि छबिना मिरवणूक; कार्तिकी वारीची सांगता.',
    en: 'At night the palkhi goes round the town and the Chhabina procession is held; the Kartiki wari ends.' },
];

/** Which day of the 2026 sohala is this date (YYYY-MM-DD, Asia/Kolkata)? 1-8, or 0 outside it. */
export function sohalaDay(iso) {
  const k = SOHALA.findIndex((x) => x.date === iso);
  return k < 0 ? 0 : k + 1;
}

registerLabels('sam', {
  mr: {
    'title': 'समाधी सोहळा, नामदेवांच्या शब्दांत',
    'sub': 'नामदेवांचे ‘श्रीज्ञानेश्वरांची समाधी’ हे आख्यान, सोहळ्याच्या आठ दिवसांत; रोज काही अभंग, एका वेळी एक.',
    'tradition': 'परंपरा सांगते, कार्तिक वद्य त्रयोदशीला आळंदीत इंद्रायणीकाठी माऊलींनी संजीवन समाधी घेतली. ती कथा नामदेवांच्या नावाने चालत आलेल्या या अभंगांत आहे.',
    'tradition.what': 'समाधीची परंपरा', 'arr.what': 'अभंगांची दिवसवार मांडणी',
    'arr.mr': 'अभंगांचा क्रम नामदेवांचाच आहे. तो आठ दिवसांत वाटण्याचे काम या संकेतस्थळाचे आहे: अभंगांत जे दिवस येतात (दशमीची प्रदक्षिणा, हरिदिनीचा जागर, द्वादशीचे पारणे, त्रयोदशी) ते सोहळ्याच्या त्याच दिवशी येतील, अशी ही मांडणी आहे.',
    'before': 'सोहळा {n} दिवसांनी सुरू होईल. तोपर्यंत आख्यान पहिल्या दिवसापासून वाचता येते.',
    'before1': 'सोहळा उद्या सुरू होईल. आख्यान आजही पहिल्या दिवसापासून वाचता येते.',
    'after': 'हे २०२६ च्या सोहळ्याचे आख्यान आहे; ते केव्हाही वाचता येते.',
    'today': 'आज', 'day': 'दिवस {n}', 'alandi': 'आळंदीत आज', 'alandi.what': 'आळंदीतील या दिवसाचा कार्यक्रम',
    'alandi.none': 'या दिवसाच्या कार्यक्रमाची नोंद आमच्याकडे नाही.',
    'poem.no': 'अभंग {n}, बहात्तरांपैकी', 'poem.what': 'या अभंगाचा पाठ आणि स्रोत',
    'ocr': 'पाठ: ई-साहित्य प्रतिष्ठानची प्रत · स्कॅन-पाठ; शुद्धलेखन तपासलेले नाही', 'card': 'कार्ड बनवा', 'firstline': 'या अभंगाची येथे फक्त पहिली ओळ.',
    'firstline.why': 'त्याचा पूर्ण पाठ आमच्याकडे फक्त ट्रान्सलिटरल संकेतस्थळावरून आहे; तेथील अटी पुनर्प्रकाशनाला परवानगी देत नाहीत. पूर्ण अभंग',
    'firstline.link': 'त्या पानावर वाचा',
    'text.mr': 'पाठ: ई-साहित्य प्रतिष्ठानची प्रत, जी प्रकाशक मुक्तपणे वाटण्यास परवानगी देतात. हा पाठ स्कॅनवरून यंत्राने वाचलेला आहे; त्याचे शुद्धलेखन तपासलेले नाही. पानांवरील शीर्षके, पृष्ठांक, कडव्यांचे क्रमांक आणि संपादकांची टीप वगळली; शब्द जसेच्या तसे. अभंगांचा क्रम ट्रान्सलिटरलवरील आख्यानानुसार.',
    'fl.mr': 'हा अभंग ई-साहित्यच्या प्रतीत जुळला नाही. पहिली ओळ ट्रान्सलिटरलवरून; त्यांच्या पाठाचे हक्क स्पष्ट नसल्याने पूर्ण पाठ दिला नाही.',
    'next.day': 'पुढच्या दिवसाचे अभंग', 'next.day.l': '{date}: {quote}', 'end': 'आख्यान येथे पूर्ण होते.',
    'end.more': 'नामदेवांच्या ‘समाधी महिमा’ या दुसऱ्या आख्यानाच्या पहिल्या ओळी आणि इतर संतांचे अभंग',
    'end.more.link': 'कार्यशाळेत',
    'days': 'सोहळ्याचे दिवस', 'pager': 'या दिवसाचे अभंग',
    'day.end': 'या दिवसाचे अभंग येथे संपले.',
  },
  en: {
    'title': 'The samadhi, as Namdev tells it',
    'sub': "Namdev's cycle on the samadhi of Dnyaneshwar, read over the eight days of the sohala: a few abhangas each day, one at a time.",
    'tradition': 'Tradition holds that on Kartik Vadya Trayodashi he entered sanjeevan samadhi at Alandi, on the Indrayani. The story is told in these abhangas, received under Namdev\'s name.',
    'tradition.what': 'the samadhi tradition', 'arr.what': 'how the poems are spread over the days',
    'arr.mr': '',
    'before': 'The sohala begins in {n} days. Until then the cycle can be read from the first day.',
    'before1': 'The sohala begins tomorrow. The cycle can already be read from the first day.',
    'after': 'This is the telling for the 2026 sohala; it can be read at any time.',
    'today': 'today', 'day': 'Day {n}', 'alandi': 'At Alandi today', 'alandi.what': "this day's programme at Alandi",
    'alandi.none': 'We have no record of the programme for this day.',
    'poem.no': 'Abhanga {n} of 72', 'poem.what': "this poem's text and source",
    'ocr': 'Text: e-Sahitya Pratishthan edition · scan text; spelling not checked', 'card': 'Make a card', 'firstline': 'Only the first line of this abhanga is shown here.',
    'firstline.why': "Its full text is available to us only from the TransLiteral site, whose terms do not allow republishing. Read the whole abhanga",
    'firstline.link': 'on that page',
    'text.mr': '',
    'fl.mr': '',
    'next.day': "The next day's abhangas", 'next.day.l': '{date}: {quote}', 'end': 'The telling ends here.',
    'end.more': "The first lines of Namdev's second cycle, the Samadhi Mahima, and other saints' poems are",
    'end.more.link': 'in the workshop',
    'days': 'Days of the sohala', 'pager': "This day's abhangas",
    'day.end': "This day's abhangas end here.",
  },
});

export const title = () => t('sam.title');

export async function render(ctx) {
  const [data, home] = await Promise.all([getJSON('samadhi.json'), getJSON('home.json'), photosReady()]);
  const today = todayIST();
  const todayN = sohalaDay(today);
  const asked = parseInt(ctx.path[0], 10);
  const dN = asked >= 1 && asked <= 8 ? asked : (todayN || 1);
  const day = SOHALA[dN - 1];
  const poems = data.poems.filter((p) => p.n >= day.from && p.n <= day.to);
  const obs = new Map((home.sohala || []).map((o) => [o.observance_id, o]));
  const L = lang();
  const short = (iso) => formatDate(iso, L, { day: 'numeric', month: 'short' });

  const start = daysTo(SOHALA[0].date, today);
  const status = todayN ? '' : start === 1 ? t('sam.before1') : start > 0 ? t('sam.before', { n: num(start) }) : t('sam.after');
  const v015 = { cs: 'devotional tradition', src: 'S043', rows: ['DNYL-V015', 'DNYL-Q017'], link: 'life/events/DNYL-V015',
    note: ['Event DNYL-V015: after a vigil on Ekadashi and a feast on Dvadashi, he entered a pit beside the Siddheshwar temple on Trayodashi; Namdev poems describe Vitthal granting the samadhi and the saints present.',
      'The oldest manuscript of the Samadhi section is dated 1581 (McLaughlin). The year of the samadhi is itself disputed (Shaka 1217 or 1218): see the disputes in the workshop.',
      'Attribution of these poems: received under Namdev/Nama; later-name mixtures unresolved (package attribution_status).'] };
  const arr = { cs: 'reconstruction', rows: ['samadhi.json', 'modules/samadhi/days.js'], noteMr: t('sam.arr.mr'),
    note: [`The cycle "${data.cycle}" (${data.n_in_package} abhangas in the Namdev package; 72 by its own numbering) is read in its own order. ${data.rule}`,
      'The division into eight days is the site\'s, not tradition\'s and not Namdev\'s.'],
    srcObjs: Object.entries(data.sources).map(([id, s]) => ({ id, title: s.title, url: s.url, tier: s.quality_tier, rights: s.rights })) };

  const ob = day.obs ? obs.get(day.obs) : null;
  const obEv = ob ? { cs: ob.claim_status, conf: ob.confirmation, by: ob.confirmed_by, src: ob.source_id, rows: [ob.observance_id], link: 'calendar/sohala',
    note: [ob.name, ob.tithi ? 'Tithi: ' + ob.tithi : '', ob.rituals || ''].filter(Boolean) } : null;

  const strip = SOHALA.map((x) => `<a href="#/samadhi/${x.d}"${x.d === dN ? ' aria-current="true"' : ''} class="${x.d === todayN ? 'today' : ''}${x.peak ? ' peak' : ''}"` +
    ` aria-label="${esc(t('sam.day', { n: num(x.d) }) + ', ' + formatDate(x.date) + (x.d === todayN ? ', ' + t('sam.today') : ''))}">` +
    `<b>${esc(num(+x.date.slice(8)))}</b><span>${esc(formatDate(x.date, L, { month: 'short' }))}</span></a>`).join('');

  const next = SOHALA[dN];
  ctx.el.innerHTML = `<div class="x-samadhi">
    <h1 tabindex="-1">${esc(t('sam.title'))}</h1>
    <p class="sub">${esc(t('sam.sub'))}${mark(arr, { what: t('sam.arr.what') })}${status ? ` ${esc(status)}` : ''}</p>
    <nav class="days" aria-label="${esc(t('sam.days'))}">${strip}</nav>
    <header class="dayhead">
      <p class="xsmall">${esc(t('sam.day', { n: num(dN) }))}, ${esc(formatDate(day.date))}${dN === todayN ? ` <b>${esc(t('sam.today'))}</b>` : ''}</p>
      <h2 class="d" lang="mr">${esc(day.quote)}</h2>
      ${day.tithi ? `<p class="tithi">${esc(day.tithi[L])}</p>` : ''}
      <p class="alandi${ob ? '' : ' none'}">${ob ? `<span class="xsmall">${esc(t('sam.alandi'))}:</span> ${esc(day[L])}${mark(obEv, { what: t('sam.alandi.what') })}` : esc(t('sam.alandi.none'))}</p>
    </header>
    <div id="sam-pager"></div>
  </div>`;

  // day 1 opens with one screen of tradition before the first poem
  const opening = dN === 1 || day.photo ? `<div class="opening">${day.photo ? photo(day.photo, { draw: 'river', eager: true }) : ''}` +
    (dN === 1 ? `<p class="lead">${esc(t('sam.tradition'))}${mark(v015, { what: t('sam.tradition.what') })}</p>` : '') + `</div>` : null;
  const off = opening ? 1 : 0;
  const screens = poems.length + 1 + off;
  const startP = Math.max(0, Math.min(screens - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  ctx.after = () => {
    pager(ctx.el.querySelector('#sam-pager'), {
      count: screens, start: startP, label: t('sam.pager'),
      render: (k) => (k < off ? opening : k - off < poems.length ? poemScreen(poems[k - off], data) : endScreen(dN, next)),
      onChange: (k) => {
        const q = k ? `?p=${k + 1}` : '';
        const want = `#/samadhi/${dN}${q}`;
        if (location.hash !== want) history.replaceState(null, '', want);
      },
      onAfter: next ? () => { location.hash = `#/samadhi/${next.d}`; } : null,
    });
    if (ctx.query.get('p')) ctx.el.querySelector('#sam-pager').scrollIntoView({ block: 'start' });
  };
  ctx.manageScroll = !!ctx.query.get('p');
}

function poemScreen(p, data) {
  const src = (id) => { const s = data.sources[id]; return s ? { id, title: s.title, url: s.url, tier: s.quality_tier, rights: s.rights } : { id }; };
  const ev = {
    cs: p.claim_status, rows: [p.seg, p.text?.seg, p.narrated_id].filter(Boolean),
    noteMr: p.text ? t('sam.text.mr') : t('sam.fl.mr'),
    note: [`Attribution: ${p.attribution || 'received'}.`,
      p.text ? `Text: ${p.text.source_id} no. ${p.text.number} (${p.text.status}); matched to the cycle's poem ${p.n} by whole text, similarity ${p.text.ratio}. ${p.text.dropped_lines ? p.text.dropped_lines + ' non-verse OCR lines (page heads, numbers, editorial prose) not shown.' : ''} Stanza numbers, inconsistent in the OCR, are not shown.`
        : 'No permitted full text matched this poem; the first line comes from the TransLiteral page.',
      p.names_matched ? `Names him as: ${p.names_matched.join(', ')} (rule-based match, connections table).` : 'This poem does not name him; it belongs to the same cycle.'],
    srcObjs: [src(p.source_id), ...(p.text ? [src(p.text.source_id)] : [])],
    link: 'connections/namdev',
  };
  const head = `<p class="no">${esc(t('sam.poem.no', { n: num(p.n) }))}${mark(ev, { what: t('sam.poem.what') })}</p>`;
  if (p.text) {
    const body = p.text.lines.map((l) => {
      const clean = l.replace(/\s*[।|]?\s*[०-९0-9]+\s*[।|]\s*$/, ' ।').replace(/\s+/g, ' ').trim();
      const h = clean.split(/(?<=[।|])\s+/).filter(Boolean);
      return `<span class="ln">${h.map((x, k) => `<span class="h">${esc(keepDandas(x))}</span>${k < h.length - 1 ? ' ' : ''}`).join('')}</span>`;
    }).join('');
    return `<article class="poem">${head}<p class="xbig" lang="mr">${body}</p>` +
      `<p class="acts xrow"><span class="ocr">${esc(t('sam.ocr'))}</span></p></article>`;
  }
  return `<article class="poem">${head}<p class="fl-only" lang="mr">${esc(keepDandas(p.inc))}</p>` +
    `<p class="held">${esc(t('sam.firstline'))} ${esc(t('sam.firstline.why'))} <a href="${esc(p.page_url)}" target="_blank" rel="noopener">${esc(t('sam.firstline.link'))}</a>.</p></article>`;
}

function endScreen(dN, next) {
  if (next) {
    return `<div class="poem end"><p class="xsmall">${esc(t('sam.day.end'))}</p>` +
      `<a class="xdoor" href="#/samadhi/${next.d}"><span class="xd-t">${esc(t('sam.next.day'))}</span>` +
      `<span class="xd-l">${esc(t('sam.next.day.l', { date: formatDate(next.date, lang(), { day: 'numeric', month: 'long' }), quote: '' }).replace(/:\s*$/, ''))}: <span lang="mr">${esc(next.quote)}</span></span></a></div>`;
  }
  return `<div class="poem end"><p class="lead">${esc(t('sam.end'))}</p>` +
    `<p class="xnote">${esc(t('sam.end.more'))} <a href="#/connections/namdev">${esc(t('sam.end.more.link'))}</a>.</p></div>`;
}
