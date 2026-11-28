// A. Opening. The home page opens on his own words: the Pasaydan (Dnyaneshwari 18.1794-1802, Marathi Wikisource,
// CC BY-SA 4.0) revealed line by line; then today's ovi (texts/daily-ovi.json, Wikisource) and a quiet link to today's
// abhanga on its own poem page (no gatha text here: most of it is not proofread); then the days to the samadhi sohala; then four ways in.
// No explanatory paragraph above the fold. Every statement carries one quiet mark (assets/js/experience.js).
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, fnv1a, todayIST, formatDate, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, revealLines, reveal, door, daysTo, photo, photosReady } from '../../assets/js/experience.js';
import { sohalaDay } from '../samadhi/index.js';

registerLabels('home', {
  mr: {
    'pasaydan': 'पसायदान', 'pasaydan.src': 'ज्ञानेश्वरी, अध्याय १८', 'pasaydan.what': 'पसायदान, ज्ञानेश्वरीचा शेवट',
    'pasaydan.read': 'ज्ञानेश्वरीच्या शेवटच्या अध्यायात वाचा',
    'pasaydan.mr': 'ज्ञानेश्वरी पूर्ण झाल्यावर माऊली विश्वात्मक देवाकडे हे प्रसाद-दान मागतात. ओव्या १७९४ ते १८०२; पाठ मराठी विकिस्रोतावरून.',
    'ovi': 'ओवी {n}', 'today': 'आजची ओवी', 'today.same': 'आज सर्वांसाठी हीच ओवी', 'today.open': 'वाचनकक्षात पुढे वाचा', 'today.card': 'कार्ड बनवा',
    'today.what': 'आजच्या ओवीचा पाठ आणि स्रोत', 'today.src': 'ज्ञानेश्वरी, अध्याय {ch}, ओवी {n}', 'today.abh': 'आजचा अभंग गाथेत वाचा',
    'cd.days': 'दिवस', 'cd.title': 'संजीवन समाधी सोहळा, आळंदी', 'cd.line': 'कार्तिक वद्य त्रयोदशी, {date}. समाधीची कथा नामदेवांच्या अभंगांत, सोहळ्याच्या दिवसागणिक.',
    'cd.today': 'आज समाधी दिन', 'cd.on': 'सोहळ्याचा दिवस {n}', 'cd.on.line': 'आजचे अभंग आणि आळंदीतील आजचा कार्यक्रम.',
    'cd.soon': 'समाधी दिन {n} दिवसांनी.', 'cd.soon1': 'उद्या समाधी दिन.',
    'cd.past': 'सोहळा पार पडला', 'cd.past.line': 'नामदेवांनी सांगितलेली समाधीची कथा, आठ दिवसांत, पुन्हा वाचता येते.',
    'cd.what': 'समाधी दिनाची तारीख', 'cd.basis': 'या तारखेचा आधार',
    'ways': 'आत जाण्याच्या वाटा',
    'w.read': 'वाचा', 'w.read.l': 'एका वेळी एक ओवी; रोजच्या पारायणाची सोबत',
    'w.life': 'जीवनप्रवास', 'w.life.l': 'गोदावरीकाठच्या आपेगावापासून इंद्रायणीकाठच्या आळंदीपर्यंत',
    'w.wari': 'वारी', 'w.wari.l': 'आळंदी ते पंढरपूर, मुक्कामागणिक',
    'w.saints': 'संतमेळा', 'w.saints.l': 'नामदेव, निवृत्तिनाथ, मुक्ताबाई, सोपानदेव काय म्हणतात',
    'work': 'प्रत्येक विधानापुढील छोटा ठिपका टॅप करा: ते आपल्याला कसे कळते, ते दिसेल. संपूर्ण संशोधन आणि सर्व याद्या',
    'work.link': 'कार्यशाळेत',
  },
  en: {
    'pasaydan': 'Pasaydan', 'pasaydan.src': 'Dnyaneshwari, chapter 18', 'pasaydan.what': 'the Pasaydan, the close of the Dnyaneshwari',
    'pasaydan.read': 'Read it in the last chapter of the Dnyaneshwari',
    'pasaydan.mr': '',
    'ovi': 'ovi {n}', 'today': "Today's ovi", 'today.same': 'The same ovi for everyone today', 'today.open': 'Read on in the reading room', 'today.card': 'Make a card',
    'today.what': "today's ovi: its text and source", 'today.src': 'Dnyaneshwari, chapter {ch}, ovi {n}', 'today.abh': "Read today's abhanga in the gatha",
    'cd.days': 'days', 'cd.title': 'Sanjeevan Samadhi Sohala, Alandi', 'cd.line': 'Kartik Vadya Trayodashi, {date}. The samadhi as Namdev tells it, day by day through the sohala.',
    'cd.today': 'Today is the samadhi day', 'cd.on': 'Day {n} of the sohala', 'cd.on.line': "Today's abhangas and today's programme at Alandi.",
    'cd.soon': 'The samadhi day is in {n} days.', 'cd.soon1': 'Tomorrow is the samadhi day.',
    'cd.past': 'The sohala is over', 'cd.past.line': 'The samadhi as Namdev tells it, in eight days, can still be read.',
    'cd.what': 'the date of the samadhi day', 'cd.basis': 'What this date rests on',
    'ways': 'Ways in',
    'w.read': 'Read', 'w.read.l': 'One ovi at a time; a companion for daily parayan',
    'w.life': 'His journey', 'w.life.l': 'From Apegaon on the Godavari to Alandi on the Indrayani',
    'w.wari': 'The wari', 'w.wari.l': 'Alandi to Pandharpur, halt by halt',
    'w.saints': 'Circle of saints', 'w.saints.l': 'What Namdev, Nivruttinath, Muktabai and Sopandev say',
    'work': 'Tap the small dot after a statement to see how we know it. All the research and every list is',
    'work.link': 'in the workshop',
  },
});

// The Pasaydan: ovis DNY18_1873 to DNY18_1881 (printed 1794-1802), event DNYL-V009.
const PASAYDAN = { file: 'texts/dnyaneshwari/ch18-4.json', from: 'DNY18_1873', to: 'DNY18_1881' };

export const title = () => '';

export async function render(ctx) {
  const [home, part, ix] = await Promise.all([getJSON('home.json'), getJSON(PASAYDAN.file), getJSON('texts/dnyaneshwari/index.json'), photosReady()]);
  const ovis = part.items.filter((it) => it.id >= PASAYDAN.from && it.id <= PASAYDAN.to && it.t);
  const doc = ix.chapters[17].documents[0];
  const evP = {
    cs: 'broadly supported', src: 'S084', rows: ['DNYL-V009', `${PASAYDAN.from} – ${PASAYDAN.to}`],
    noteMr: t('home.pasaydan.mr') || '',
    note: 'Event DNYL-V009: in the closing prayer the deity addressed as Vishwesvarao grants the boon and the poet is pleased (line DNY18_1881). Text: Marathi Wikisource, chapter 18 (quality tier Q3: a community transcription, not checked against a printed edition here).',
    lic: `<a href="${esc(doc.source_url)}" target="_blank" rel="noopener" lang="mr">मराठी विकिस्रोत: ज्ञानेश्वरी अध्याय १८</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>`,
    link: `texts/dnyaneshwari/18?seg=${PASAYDAN.from}`,
  };
  const ovi = (it, k) => {
    const lines = it.t.replace(/॥\s*[०-९0-9]+\s*॥\s*$/, '॥').split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
    const charans = lines.split(/(?<=।)\s+/).map((c) => keepDandas(c.trim()));
    const cls = k < 2 ? 'rl' : 'rv';
    const nEl = `<span class="n" aria-label="${esc(t('home.ovi', { n: num(it.n) }))}">${esc(num(it.n, 'mr'))}</span>`;
    return `<li class="${k < 2 ? '' : 'rv'}">${charans.map((c, j) => `<span class="c ${k < 2 ? cls : ''}">${esc(c)}${j === charans.length - 1 ? nEl : ''}</span>`).join('')}</li>`;
  };

  ctx.el.innerHTML = `<div class="x-home">
    <section class="open" aria-labelledby="h-pas">
      <h1 id="h-pas" class="who" tabindex="-1"><span lang="mr">${esc(t('home.pasaydan'))}</span>&ensp;${esc(t('home.pasaydan.src'))}${mark(evP, { what: t('home.pasaydan.what') })}</h1>
      <ol class="pasay" lang="mr">${ovis.map(ovi).join('')}</ol>
      <p class="pasay-more rv"><a href="${href('read/18', { o: ovis[0]?.n })}">${esc(t('home.pasaydan.read'))}</a></p>
      <span class="scroll-cue" aria-hidden="true"></span>
    </section>
    <section class="band pic rv" aria-hidden="false">${photo('indrayani-dusk', { draw: 'river' })}</section>
    <section class="band today" aria-labelledby="h-today">
      <h2 id="h-today">${esc(t('home.today'))} <span class="xsmall">${esc(t('home.today.same'))}</span></h2>
      <div class="leaf" id="daily-body" style="min-height:14rem"><p class="loading">${esc(t('loading'))}</p></div>
    </section>
    <section class="band pic">${photo('alandi-temple', { draw: 'temple' })}</section>
    ${countdown(home)}
    <section class="band ways" aria-labelledby="h-ways">
      <h2 id="h-ways">${esc(t('home.ways'))}</h2>
      <div class="xdoors">
        ${door('read', t('home.w.read'), t('home.w.read.l'))}
        ${door('journey', t('home.w.life'), t('home.w.life.l'))}
        ${door('wari', t('home.w.wari'), t('home.w.wari.l'))}
        ${door('saints', t('home.w.saints'), t('home.w.saints.l'))}
      </div>
    </section>
    <p class="work">${esc(t('home.work'))} <a href="#/workshop">${esc(t('home.work.link'))}</a>.</p>
  </div>`;

  ctx.after = () => {
    const open = ctx.el.querySelector('.open');
    revealLines(open, { sel: '.rl', first: 250, gap: 620 });
    reveal(ctx.el, '.rv');
    daily(home).catch(() => { const b = document.getElementById('daily-body'); if (b) b.innerHTML = `<p class="err">${esc(t('error.load'))}</p>`; });
  };
}

function countdown(home) {
  const ob = (home.sohala || []).find((o) => o.observance_id === 'DNYG-P-OB02') || (home.sohala || []).find((o) => /Trayodashi/i.test(o.name || '') && o.gregorian_date_2026);
  if (!ob) return '';
  const today = todayIST();
  const n = daysTo(ob.gregorian_date_2026, today);
  const day = sohalaDay(today);
  const ev = { cs: ob.claim_status, conf: ob.confirmation, by: ob.confirmed_by, src: ob.source_id, rows: [ob.observance_id],
    note: [ob.name + ': ' + (ob.tithi || ''), ob.rituals || ''].filter(Boolean), link: 'calendar/sohala' };
  let big, t1, t2;
  if (n > 0 && !day) { big = `${esc(num(n))}<small>${esc(t('home.cd.days'))}</small>`; t1 = t('home.cd.title'); t2 = t('home.cd.line', { date: formatDate(ob.gregorian_date_2026) }); }
  else if (n === 0) { big = `${esc(num(day || 6))}<small>/ ${esc(num(8))}</small>`; t1 = t('home.cd.today'); t2 = t('home.cd.on.line'); }
  else if (day) { big = `${esc(num(day))}<small>/ ${esc(num(8))}</small>`; t1 = t('home.cd.on', { n: num(day) }); t2 = t('home.cd.on.line') + (n > 0 ? ' ' + (n === 1 ? t('home.cd.soon1') : t('home.cd.soon', { n: num(n) })) : ''); }
  else { big = `<small>${esc(num('2026'))}</small>`; t1 = t('home.cd.past'); t2 = t('home.cd.past.line'); }
  return `<div class="countdown-wrap"><a class="countdown" href="#/samadhi"><span class="big">${big}</span><span><p class="t1">${esc(t1)}</p><p class="t2">${esc(t2)}</p></span></a>` +
    `<p class="xsmall" style="max-width:40rem;margin:.3rem auto 0;padding:0 var(--sp-4)">${esc(t('home.cd.basis'))}${mark(ev, { what: t('home.cd.what') })}</p></div>`;
}

async function daily(home) {
  const box = document.getElementById('daily-body');
  const d = home.daily_ovi;
  if (!box || !d?.size) return;
  const file = await getJSON(d.file);
  // the index-th ovi counting through the chapter groups (rule stated in home.json)
  let k = fnv1a(todayIST()) % d.size, grp = null;
  for (const g of file.chapters) { if (k < g.items.length) { grp = g; break; } k -= g.items.length; }
  if (!grp) return;
  const [id, n, text] = grp.items[k], ch = grp.chapter;
  const ev = { cs: 'editorial testimony', src: 'S084', rows: [id], link: `texts/dnyaneshwari/${ch}?seg=${id}`,
    note: `Dnyaneshwari chapter ${ch}, ovi ${n}: Marathi Wikisource text (a community transcription, not checked here against a printed edition). Chosen for today by the rule in home.json from ${d.size} ovis spread over chapters 1-18 (chapter 7 left out).`,
    lic: `<a href="${esc(grp.page)}" target="_blank" rel="noopener" lang="mr">मराठी विकिस्रोत: ज्ञानेश्वरी, अध्याय ${esc(num(ch, 'mr'))}</a>, <a href="${esc(file.licence_url)}" target="_blank" rel="noopener">CC BY-SA 4.0</a>` };
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  box.innerHTML = `<p class="xbig" lang="mr" style="font-size:var(--s-2)">${lines.map((l, i) => {
    const h = l.split(/(?<=।)\s+/);
    return `<span class="ln">${h.map((x, j) => `<span class="h">${esc(keepDandas(x))}${i === lines.length - 1 && j === h.length - 1 ? ` ॥ ${esc(num(n, 'mr'))} ॥` : ''}</span>${j < h.length - 1 ? ' ' : ''}`).join('')}</span>`;
  }).join('')}</p>` +
    `<p class="xrow" style="margin:var(--sp-4) 0 0"><span class="xsmall" lang="${lang()}">${esc(t('home.today.src', { ch: num(ch), n: num(n) }))}${mark(ev, { what: t('home.today.what') })}</span>` +
    `<a href="${href('read/' + ch, { seg: id })}">${esc(t('home.today.open'))}</a><a href="${href('card', { seg: id })}">${esc(t('home.today.card'))}</a></p>` +
    abhangaLink(home);
}

/** One quiet line: today's abhanga on its own poem page, by the old daily rule; no gatha text on the home page. */
function abhangaLink(home) {
  const d = home.daily;
  if (!d?.ids?.length) return '';
  const id = d.ids[fnv1a(todayIST()) % d.size];
  return id ? `<p class="xsmall" style="margin:var(--sp-3) 0 0"><a href="${href('texts/gatha/' + id)}">${esc(t('home.today.abh'))}</a></p>` : '';
}
