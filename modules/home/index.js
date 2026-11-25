// Home: who he is (three honest lines), the sohala countdown, today's abhanga, the doors into the eight groups.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, fnv1a, todayIST, formatDate, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { icon, claimBadge, sourceChips, verseBlock, quality, provisional } from '../../assets/js/components.js';
import { GROUPS } from '../../assets/js/app.js';

// The three lines are written by hand from these rows only (profile, date_claims, disputes). Each line lists the
// rows it rests on; stage 4 checks them against the database. Disputed points are stated as disputed.
const INTRO = [
  {
    mr: 'स्वतःला ते ‘ज्ञानदेव’ म्हणवतात; भक्त त्यांना ‘माऊली’ म्हणतात. नाथपरंपरेतील हे तेराव्या शतकातील मराठी कवी; थोरले बंधू निवृत्तिनाथ हे त्यांचे गुरू.',
    en: 'He calls himself Dnyandev; devotees call him Mauli, “mother”. A Marathi poet of the thirteenth century in the Nath lineage; his elder brother Nivruttinath was his guru.',
    cs: 'broadly supported', src: 'S043; S052; S084',
    rows: ['profile:name_devanagari', 'profile:alias Mauli', 'profile:sampradaya', 'profile:guru', 'profile:active_period'],
  },
  {
    mr: 'गीतेवरील त्यांची मराठी टीका म्हणजे ज्ञानेश्वरी. तिच्या अखेरच्या एका ओवीत ‘शके बाराशतें बारोत्तरें’ (शके १२१२, इ.स. १२९०) असा काळ येतो; ती ओवी त्यांचीच की एकनाथांनी नंतर जोडली, यावर अभ्यासकांत मतभेद आहे.',
    en: 'The Dnyaneshwari is his Marathi commentary on the Gita. A verse near its end gives the date Shaka 1212 (1290 CE); scholars disagree whether that verse is his own or was added later by Eknath.',
    cs: 'disagreement', src: 'S084; S052; S025',
    rows: ['date_claims:composition of the Dnyaneshwari', 'disputes:DNYL-Q008', 'disputes:DNYL-Q009'],
  },
  {
    mr: 'जन्म इ.स. १२७१ की १२७५, आपेगावी की आळंदीत, याबाबत स्रोतांत एकमत नाही. परंपरेनुसार कार्तिक वद्य त्रयोदशीला आळंदीत इंद्रायणीकाठी त्यांनी संजीवन समाधी घेतली; वर्ष इ.स. १२९६ सांगितले जाते, पण शके १२१७ की १२१८ यावरही मतभेद आहे.',
    en: 'Born in 1271 or 1275, at Apegaon or at Alandi: the sources disagree. Tradition holds that he entered sanjeevan samadhi at Alandi, on the Indrayani, on Kartik Vadya Trayodashi; the year is given as 1296 CE, but even the Shaka year (1217 or 1218) is disputed.',
    cs: 'disagreement', src: 'S043; DNYL-S01; DNYL-S05; S052',
    rows: ['disputes:DNYL-Q001..Q004', 'profile:samadhi_date', 'profile:samadhi_place', 'disputes:DNYL-Q017'],
  },
];

export const title = () => '';

export async function render(ctx) {
  const home = await getJSON('home.json');
  const L = lang();
  const intro = INTRO.map((x) => `<li>${esc(x[L])} <span class="chips">${claimBadge(x.cs)}${sourceChips(x.src)}</span></li>`).join('');

  ctx.el.innerHTML = `<div class="page">
    <section class="hero" aria-labelledby="h-name">
      <h1 id="h-name" class="name" tabindex="-1" lang="${L}">${esc(t('site.full'))}<small lang="mr">ज्ञानदेव · माऊली</small></h1>
      <p class="lede">${esc(t('home.lede'))}</p>
      ${sohala(home)}
      <h2 class="vh">${esc(t('home.who'))}</h2>
      <ul class="honest">${intro}</ul>
      <p class="small faint">${provisional()} ${esc(t('home.honest.note'))}</p>
    </section>
    <section class="daily" aria-labelledby="h-daily" id="daily">
      <div class="head"><h2 id="h-daily">${esc(t('home.daily'))}</h2><span class="small faint">${esc(t('home.daily.same'))}</span></div>
      <div class="leaf" id="daily-body"><p class="loading">${esc(t('loading'))}</p></div>
    </section>
    <form class="field" role="search" id="home-search" action="#/search">
      ${icon.search}<label class="vh" for="hq">${esc(t('home.search'))}</label>
      <input id="hq" name="q" type="search" lang="mr" placeholder="${esc(t('home.search'))}" enterkeyhint="search" autocomplete="off">
    </form>
    <h2>${esc(t('home.doors'))}</h2>
    <ul class="doors two">${GROUPS.map((g) => `<li><a href="#/${g}"><span class="mark">${icon.pataka}</span><span class="t">${esc(t('g.' + g))}</span><span></span><span class="d">${esc(t('g.' + g + '.d'))}</span></a></li>`).join('')}</ul>
  </div>`;

  ctx.el.querySelector('#home-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    location.hash = href('search', { q });
  });
  // today's abhanga loads after first paint; its box keeps a fixed minimum height, so nothing shifts much
  ctx.after = () => daily(home).catch((e) => { const b = document.getElementById('daily-body'); if (b) b.innerHTML = `<p class="err">${esc(t('error.load'))}</p>`; });
}

function sohala(home) {
  const rows = home.sohala || [];
  const day = rows.find((o) => /Trayodashi/i.test(o.name || '') && o.gregorian_date_2026);
  if (!day) return '';
  const today = todayIST();
  const diff = Math.round((Date.parse(day.gregorian_date_2026) - Date.parse(today)) / 86400000);
  const when = diff > 0 ? `<span class="days">${esc(t('home.sohala.days', { n: num(diff) }))}</span> <span class="small muted">${esc(t('home.sohala.left'))}</span>`
    : diff === 0 ? `<span class="days">${esc(t('home.sohala.today'))}</span>` : `<span class="small muted">${esc(t('home.sohala.past'))}</span>`;
  const tithi = lang() === 'mr' ? 'कार्तिक वद्य त्रयोदशी' : 'Kartik Vadya Trayodashi';
  return `<section class="sohala" aria-labelledby="h-sohala">${icon.pataka}<div>
    <h2 id="h-sohala" class="small" style="margin:0;font-family:var(--f-ui);font-size:var(--s--1);color:var(--ink-2)">${esc(t('home.sohala'))}</h2>
    <div>${when}</div>
    <p>${esc(tithi)}, ${esc(formatDate(day.gregorian_date_2026))}</p>
    <div class="badges" style="margin:.3rem 0 0">${day.confirmation ? `<a class="small" href="#/calendar/sohala">${esc(t('home.sohala.open'))}</a>` : ''}</div>
  </div></section>`;
}

async function daily(home) {
  const d = home.daily;
  if (!d?.size) return;
  const i = fnv1a(todayIST()) % d.size;
  const file = d.file.replace('{n}', Math.floor(i / d.per_file) + 1);
  const rows = await getJSON(file);
  const p = rows[i % d.per_file];
  const box = document.getElementById('daily-body');
  if (!box || !p) return;
  const wits = p.witnesses.split('|').map((x) => [x.slice(0, x.indexOf(':')), x.slice(x.indexOf(':') + 1)]).map(([w, n]) => `${t('w.short.' + w)} ${num(n)}`).join(', ');
  box.innerHTML = verseBlock(p.text) +
    `<div class="badges">${quality(p.text_quality)}${claimBadge(p.claim_status)}</div>` +
    `<p class="small faint" style="margin:0">${esc(wits)}</p>` +
    `<p style="margin:.5rem 0 0"><a href="${href('texts/gatha/' + p.id)}">${esc(t('home.daily.open'))}</a></p>`;
}
