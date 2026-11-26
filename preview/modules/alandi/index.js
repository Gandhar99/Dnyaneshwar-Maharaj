// F. Walk Alandi. Route: #/alandi (optional ?spot=<spot id>, e.g. DNYP-MS-03).
// Data: places.json (memorial_spots, building_phases, places: the Alandi row), life.json (events V011, V015, V019).
// The drawing is a picture, not a map. The data gives the river (Indrayani) and one shared point for the whole temple
// complex; it gives no position inside it. So the four spots of the complex (samadhi, Siddheshwar, ajan tree, the wall)
// stand side by side on one ground, like a frieze, in an order that means nothing, and the page says so. The river and
// its ghat are drawn in front only to make the view; their distance and direction are not from data. Spots outside Alandi
// (Nevasa pillar, Apegaon, the buffalo's samadhi) stand in a small strip beyond the town, not in the drawing.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { mark, scene, attachScene, voices, photo, photosReady, door, openSheet } from '../../assets/js/experience.js';

registerLabels('al', {
  mr: {
    'title': 'आळंदीतून फेरफटका',
    'sub': 'इंद्रायणीकाठचे गाव. ठिकाणावर बोट ठेवा; प्रत्येक ठिकाण आपली कथा सांगेल.',
    'sch': 'हे चित्र आहे, नकाशा नाही. मंदिर परिसरात ही चार ठिकाणे नेमकी कुठे आहेत, हे कोणत्याही नोंदीत नाही; म्हणून ती एकाच जमिनीवर शेजारी शेजारी काढली आहेत. त्यांचा क्रम काही सांगत नाही.',
    'sch.what': 'या आकृतीचे स्वरूप',
    'court': 'मंदिर परिसर: आतील जागा नोंदलेली नाही', 'river': 'इंद्रायणी', 'pics': 'आळंदीची छायाचित्रे',
    'beyond': 'आळंदीच्या पलीकडे', 'beyond.l': 'ही ठिकाणे आळंदीत नाहीत; त्यांची जागा या आकृतीत दाखवलेली नाही.',
    'where': 'जागा', 'pos.none': 'नोंदलेली नाही', 'status': 'नोंदीचा प्रकार',
    'when.q': 'मंदिर कधी बांधले?', 'when.l': 'दोन नोंदी दोन काळ सांगतात. दोन्ही ऐका.',
    'later': 'नंतरची भर', 'journey': 'प्रवासातील या प्रसंगाकडे', 'ws': 'कार्यशाळेत पूर्ण नोंद',
    'text.what': 'या ठिकाणाची कथा', 'phase.what': 'मंदिराच्या बांधणीची नोंद', 'later.what': 'नंतरच्या भरीच्या नोंदी',
    'd.j': 'गोदावरी ते इंद्रायणी', 'd.j.l': 'माऊलींच्या जीवनाचा नदीप्रवास', 'd.s': 'समाधीचे आख्यान', 'd.s.l': 'सोहळ्याचे आठ दिवस, नामदेवांच्या शब्दांत',
    'ph.a': 'सुमारे १५८०–१६००', 'ph.b': 'सुमारे १७५०',
    'src.wiki': 'विकिपीडिया आणि हेरिटेज टेम्पल्स', 'src.ht': 'हेरिटेज टेम्पल्स (संकेतस्थळ)',
  },
  en: {
    'title': 'Walk Alandi',
    'sub': 'The town on the bank of the Indrayani. Touch a place; each tells its own story.',
    'sch': 'This is a picture, not a map. No record says where these four spots stand inside the temple complex, so they are drawn side by side on one ground; their order says nothing.',
    'sch.what': 'what this drawing is',
    'court': 'The temple complex: positions inside not recorded', 'river': 'The Indrayani', 'pics': 'Alandi in photographs',
    'beyond': 'Beyond Alandi', 'beyond.l': 'These places are not at Alandi; their position is not drawn here.',
    'where': 'Where', 'pos.none': 'not recorded', 'status': 'Kind of record',
    'when.q': 'When was the temple built?', 'when.l': 'Two records give two periods. Hear both.',
    'later': 'Later additions', 'journey': 'See this episode on the journey', 'ws': 'The full record, in the workshop',
    'text.what': 'the story of this place', 'phase.what': 'the record of the temple building', 'later.what': 'the records of later additions',
    'd.j': 'From the Godavari to the Indrayani', 'd.j.l': 'His life as a river journey', 'd.s': 'The samadhi, as Namdev tells it', 'd.s.l': 'The eight days of the sohala, in Namdev\'s words',
    'ph.a': 'c. 1580-1600', 'ph.b': 'c. 1750',
    'src.wiki': 'Wikipedia and Heritage Temples', 'src.ht': 'Heritage Temples (website)',
  },
});
export const title = () => t('x.alandi');

const L = (o) => o[lang()] ?? o.mr;
// Marathi and English tellings, written by hand from each spot's `story` (each exactly as strong as its row).
const S = {
  'DNYP-MS-01': { photo: 'alandi-temple', ev: 'DNYL-V015', jr: 'DNYL-V015',
    mr: 'परंपरा सांगते की येथे कार्तिक वद्य त्रयोदशीला, शके १२१८ (इ.स. १२९६) मध्ये, माऊलींनी संजीवन समाधी घेतली. विश्वकोश सांगतो की त्यानंतर नऊ दिवस कीर्तन झाले.',
    en: 'Tradition holds that here, on Kartik Vadya Trayodashi in Shaka 1218 (1296 CE), he entered the sanjivan samadhi. The Vishwakosh says nine days of kirtan followed.',
    where: { mr: 'मंदिर परिसराच्या गाभाऱ्यात, सिद्धेश्वर मंदिराच्या शेजारी', en: 'The inner sanctum (gabhara) of the temple complex, beside the Siddheshwar temple' } },
  'DNYP-MS-02': {
    mr: 'हे जुने शिवमंदिर आहे; त्याच्या शेजारी समाधी आहे. बांधणीचा काळ आम्ही पाहिलेल्या स्रोतांत दिलेला नाही.',
    en: 'An old Shiva shrine beside which the samadhi lies. The sources we opened give no date of construction.',
    where: { mr: 'परिसरातील सर्वात जुनी वास्तू, समाधीशेजारी', en: 'The oldest structure of the complex, adjacent to the samadhi' } },
  'DNYP-MS-03': { ev: 'DNYL-V019', jr: 'DNYL-V019',
    mr: 'विश्वकोश सांगतो की समाधीची तयार केलेली जागा अजानवृक्षाखाली होती. एका मंदिर-संकेतस्थळावर कथा आहे की एकनाथांनी (संतांनंतर सुमारे तीनशे वर्षांनी) संतांना त्रास देणारे झाड काढले; ते हेच झाड, असे ती कथा सांगत नाही.',
    en: 'The Vishwakosh puts the prepared samadhi site under an ajan tree. A temple website tells a legend that Eknath, about three centuries later, removed a tree that was harming the saint; the legend does not say it was this tree.',
    where: { mr: 'मंदिर परिसरात, समाधीजवळ', en: 'Inside the temple complex, near the samadhi' } },
  'DNYP-MS-04': { ev: 'DNYL-V011', jr: 'DNYL-V011',
    mr: 'परंपरा सांगते की भावंडे बसलेली भिंत चांगदेवांच्या स्वागताला पुढे सरकली; चांगदेव वाघावर बसून आले होते आणि त्यांनी हार मानली. ही कथा १७५० मध्ये बांधलेल्या तटाबद्दल नाही; तो वेगळा आहे.',
    en: 'Tradition holds that the wall the siblings sat on moved forward to greet Changdev, who came on a tiger, and that he yielded. This is not the fortifying wall of 1750, which is a different thing.',
    where: { mr: 'मंदिर परिसरात; नेमकी जागा आमच्या स्रोतांत सांगितलेली नाही', en: 'Inside the complex; the exact spot is not stated by the sources we opened' } },
  'DNYP-MS-05': { beyond: true,
    mr: 'परंपरेनुसार ज्या खांबाशेजारी माऊलींनी ज्ञानेश्वरी रचली किंवा सांगितली तो खांब; जिल्ह्याच्या संकेतस्थळानुसार तो अजून तेथे आहे.',
    en: 'The pillar beside which, by tradition, he composed or recited the Dnyaneshwari; the district page says it is still there.',
    where: { mr: 'नेवासे येथील मंदिरात (मोहिनीराज मंदिर असल्याची खात्री कोणत्याही नोंदीत नाही); जागा गावाच्या मध्यबिंदूने दिली आहे, खांबाची नव्हे', en: 'In the temple at Nevasa (no page confirms it is the Mohiniraj temple); the coordinates are the town centre, not the pillar' },
    jr: 'DNYL-V008' },
  'DNYP-MS-06': { beyond: true,
    mr: 'परंपरा ज्या गावाला जन्मस्थान म्हणते, तेथील हे मंदिर. स्मारक आहे का किंवा त्याचे स्वरूप काय, हे आम्ही पाहिलेल्या पानात नाही; म्हणून स्मारक असल्याचे आम्ही मानत नाही.',
    en: 'The temple at the village that tradition names as his birthplace. The page we opened does not mention a memorial or its shape, so we do not take it as confirmed.',
    where: { mr: 'पैठण–शहागड रस्त्यावर, आपेगाव; निर्देशांक नोंदलेले नाहीत', en: 'On the Paithan-Shahagad road, Apegaon; no coordinates recorded' },
    jr: 'birthplace' },
  'DNYP-MS-07': { beyond: true,
    mr: 'विश्वकोशानुसार तो रेडा, जो वेद म्हणाला होता, भावंडांच्या परतीच्या वाटेवर आळ्याच्या वनात मरण पावला; तेथे सिंदूर वाहून पूजा होणारी समाधी उभी राहिली.',
    en: 'Per the Vishwakosh, the buffalo that recited the Veda died in the Alya forest on the siblings\' return, and a samadhi with vermilion worship arose there.',
    where: { mr: 'नेवासे आणि आळंदी यांच्यामध्ये; जागा ओळखलेली नाही', en: 'Between Nevasa and Alandi; the site is not identified' },
    jr: 'DNYL-V006' },
};
// Where each spot's tap target sits on the drawing (percent of width and height): on the drawn object, not on a plan.
const COURT = [['DNYP-MS-01', 22, 50.5], ['DNYP-MS-02', 46, 50.5], ['DNYP-MS-03', 68, 50.5], ['DNYP-MS-04', 87.5, 50.5]];

// The view (viewBox 100 x 125): on one plinth, side by side, the samadhi temple's spire with its pataka, the small
// Siddheshwar shrine, the ajan tree and a low stone wall; in front, ghat steps going down into the Indrayani, with the
// spire's reflection in the water. Strokes in currentColor, saffron and maroon, in the restraint of the rest of the site.
function townSvg(courtLabel) {
  const wave = (y, a, x0 = 0) => { let d = `M${x0} ${y} Q ${x0 + 5} ${y - a} ${x0 + 10} ${y}`; for (let x = x0 + 20; x <= 100; x += 10) d += ` T ${x} ${y}`; return d; };
  // ghat: long stone steps going down to the water, their joints staggered like laid stone
  const steps = [71.5, 75.5, 79.5, 83.5, 87.5, 91].map((y, i) => `<path d="M4 ${y} H96"/>` +
    (i < 5 ? [0, 1, 2, 3, 4, 5, 6].map((k) => `<path d="M${9 + k * 13 + (i % 2) * 6.5} ${y} v4" opacity=".55"/>`).join('') : '')).join('');
  const ribs = [24, 30, 36, 42].map((y) => { const w = 2.2 + (y - 18) * 0.21; return `<path d="M${22 - w} ${y} Q 22 ${y - 1.2} ${22 + w} ${y}" opacity=".55"/>`; }).join('');
  const bricks = [58, 61.5, 65].map((y, i) => `<path d="M80 ${y} H95"/>` + [0, 1, 2, 3].map((k) => `<path d="M${81.5 + k * 4 + (i % 2) * 2} ${y - 3.5} v3.5"/>`).join('')).join('');
  return `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none" stroke="currentColor" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round">
    <text x="95" y="6.5" text-anchor="end" font-size="3" fill="currentColor" stroke="none" opacity=".75" font-family="var(--f-ui)">${esc(courtLabel)}</text>
    <circle cx="80" cy="16" r="5.5" stroke="var(--saffron)" opacity=".45"/>
    <g stroke="var(--maroon)">
      <path d="M22 3.5 V12"/><path d="M22 3.8 L28.5 5.6 L22 7.6" fill="var(--saffron)" stroke="var(--saffron)"/>
      <path d="M20.6 14.6 Q22 11.6 23.4 14.6 Z"/><ellipse cx="22" cy="16" rx="3" ry="1.2"/>
      <path d="M19 17.4 C 17.5 28 14.5 40 13 50 H31 C 29.5 40 26.5 28 25 17.4 Z" fill="var(--paper-3)"/>${ribs}
      <path d="M11 50 H33 V66 H11 Z" fill="var(--paper-3)"/><path d="M11 53 H33" opacity=".5"/>
      <path d="M18.5 66 V59 Q22 54.5 25.5 59 V66"/>
      <path d="M41 56 H51 V66 H41 Z" fill="var(--paper-3)"/><path d="M40 56 L46 46 L52 56 Z" fill="var(--paper-3)"/><path d="M42.6 51.5 H49.4" opacity=".5"/>
      <path d="M46 46 V43.5 M45 43.5 H47"/><path d="M44.3 66 V61 Q46 59 47.7 61 V66"/>
    </g>
    <g stroke="currentColor" opacity=".85">
      <path d="M68 66 V50 M68 55 C64 52 61 49 60 45 M68 52 C72 49 75 46 76 42 M68 50 C67 46 69 42 68 38"/>
      <path d="M57 44 C52 43 52 35 58 34 C57 27 65 24 69 28 C72 23 81 25 80 31 C86 31 87 39 82 41 C83 46 76 48 72 45 C69 48 61 48 57 44 Z" fill="color-mix(in srgb, var(--ok) 14%, transparent)"/>
    </g>
    <g stroke="var(--maroon)" opacity=".9">${bricks}<path d="M80 54.5 H95 V66 H80 Z"/></g>
    <path d="M5 66 H96 M6 68.5 H95" />
    <g opacity=".7">${steps}</g>
    <g stroke="var(--saffron)" stroke-width=".9"><path d="${wave(96, 2.4)}" opacity=".95"/><path d="${wave(103, 2)}" opacity=".7"/><path d="${wave(110, 2.4)}" opacity=".5"/><path d="${wave(117, 1.8)}" opacity=".35"/></g>
    <g stroke="var(--maroon)" opacity=".2"><path d="M13 97 C 14.5 104 18 110 22 115 C 26 110 29.5 104 31 97"/><path d="M22 115 V119"/></g>
  </svg>`;
}
const csOf = (r) => r.claim_status;

export async function render(ctx) {
  const [pl, life] = await Promise.all([getJSON('places.json'), getJSON('life.json'), photosReady()]);
  const spots = new Map(pl.memorial_spots.map((s) => [s.spot_id, s]));
  const phases = new Map(pl.building_phases.map((p) => [p.phase_id, p]));
  const ev = new Map(life.events.map((e) => [e.event_id, e]));
  const alandi = pl.places.find((p) => p.place_id === 'DNYP-PL-01');
  const mr = lang() === 'mr';
  const SHORT = { 'DNYP-MS-01': 'Samadhi', 'DNYP-MS-02': 'Siddheshwar', 'DNYP-MS-03': 'Ajan tree', 'DNYP-MS-04': 'The wall' };
  const nameOf = (s) => (mr ? s.name_mr : s.name);
  const tgt = (s) => (mr ? s.name_mr : SHORT[s.spot_id] || s.name);

  const spotEv = (s) => ({ cs: csOf(s), src: s.source_id, rows: [s.spot_id], link: 'life/memorials',
    note: [s.story, `Where within the site: ${s.where_within_site}`, s.coordinate_precision ? `Coordinate precision: ${s.coordinate_precision}.` : 'No coordinates recorded.',
      s.revision_note || ''].filter(Boolean) });
  const schEv = { cs: 'reconstruction', rows: ['places.json: memorial_spots'], src: ['DNYP-S01', 'DNYP-S02'], link: 'life/memorials',
    note: ['The scene is drawn by this site as a schematic. From the data it takes: the river (Alandi row, river Indrayani; the Vishwakosh and Wikipedia put the samadhi on the Indrayani) and the existence of the four spots inside the temple complex.',
      'DNYP-MS-01 to MS-04 all carry one and the same coordinate, that of the whole complex (18.6769834 N, 73.8966973 E, from one temple page\'s map embed: a single weak source); no source places the Siddheshwar temple, the ajan tree or the wall inside it. So the four are drawn side by side on one ground, as a frieze, and their order and spacing mean nothing. The river and the ghat steps are drawn in front of them to make a view (photographs show ghats on the Indrayani at Alandi); the distance and direction between the river and the complex are not drawn from data.'] };

  const svg = townSvg(t('al.court'));
  const targets = [...COURT.map(([id, x, y]) => ({ id, x, y, label: tgt(spots.get(id)) })), { id: 'river', x: 50, y: 84, label: t('al.river') }];
  const beyond = ['DNYP-MS-05', 'DNYP-MS-06', 'DNYP-MS-07'].map((id) => spots.get(id));

  ctx.el.innerHTML = `<div class="x-alandi">${STYLE}
    <h1 tabindex="-1">${esc(t('al.title'))}</h1>
    <p class="sub">${esc(t('al.sub'))}</p>
    ${photo('alandi-ghat', { draw: 'temple', eager: true })}
    ${scene({ svg, targets, ratio: '4 / 5', label: t('al.title') })}
    <p class="xsmall sch">${esc(t('al.sch'))}${mark(schEv, { what: t('al.sch.what') })}</p>
    <section class="pics"><h2>${esc(t('al.pics'))}</h2>${photo('alandi-temple', { draw: 'temple' })}${photo('indrayani-weir', { draw: 'river' })}${photo('dnyaneshwari-mandir', { draw: 'temple' })}</section>
    <section class="beyond"><h2>${esc(t('al.beyond'))}</h2><p class="xsmall">${esc(t('al.beyond.l'))}</p>
      <div class="bl">${beyond.map((s) => `<button type="button" class="bt" data-scn="${esc(s.spot_id)}"><span class="bn" lang="${mr ? 'mr' : 'en'}">${esc(nameOf(s))}</span><span class="bw">${esc(L(S[s.spot_id].where).split(';')[0].split('(')[0])}</span></button>`).join('')}</div></section>
    <div class="xdoors">${door('journey', t('al.d.j'), t('al.d.j.l'))}${door('samadhi', t('al.d.s'), t('al.d.s.l'))}</div>
  </div>`;

  const sheet = async (id) => {
    if (id === 'river') {
      const e = { cs: csOf(alandi), src: alandi.source_id, rows: [alandi.place_id], link: 'life/map', note: [alandi.note, `River: ${alandi.river}.`] };
      const txt = mr ? 'आळंदी इंद्रायणीच्या काठी आहे. विश्वकोश आणि विकिपीडिया सांगतात की माऊलींची समाधी सिद्धेश्वर मंदिराशेजारी, इंद्रायणीकाठी आहे.'
        : 'Alandi lies on the Indrayani. The Vishwakosh and Wikipedia put the samadhi beside the Siddheshwar temple, on the Indrayani.';
      return { title: t('al.river'), html: `<p class="al-t">${esc(txt)}${mark(e, { what: t('al.text.what') })}</p>${photo('indrayani-weir', { draw: 'river' })}${photo('alandi-ghat', { draw: 'river' })}` };
    }
    const s = spots.get(id); if (!s) return null;
    const d = S[id];
    const stat = `<p class="xsmall al-st">${esc(t('al.status'))}: ${esc(t('cs.' + csOf(s)))}</p>`;
    const where = `<p class="al-w"><span class="xsmall">${esc(t('al.where'))}:</span> ${esc(L(d.where))}${s.latitude ? '' : ` <span class="xsmall">(${esc(t('al.pos.none'))})</span>`}</p>`;
    let html = (d.photo ? photo(d.photo, { draw: 'temple' }) : '') + `<p class="al-t">${esc(L(d))}${mark(spotEv(s), { what: t('al.text.what') })}</p>` + stat + where;
    if (id === 'DNYP-MS-01') {
      const a = phases.get('DNYP-BP-01'), b = phases.get('DNYP-BP-02');
      const pe = (p) => ({ cs: csOf(p), src: p.source_id, rows: [p.phase_id], link: 'life/memorials', note: [`${p.period_or_year}: ${p.work_done}; ${p.patron_or_builder}. Evidence type: ${p.evidence_type}.`] });
      html += `<h3 class="al-h">${esc(t('al.when.q'))}</h3><p class="xsmall">${esc(t('al.when.l'))}</p>` + voices([
        { who: t('al.ph.a') + ' · ' + t('al.src.wiki'), side: 'a', lang: mr ? 'mr' : 'en', mark: mark(pe(a), { what: t('al.phase.what') }),
          html: mr ? 'आंबेकर देशपांडे (पुरंदर–सासवडचे घराणे) यांनी समाधीवर मंदिर बांधले.' : 'The Ambekar Deshpande family (of Purandar and Saswad) built the temple over the samadhi.' },
        { who: t('al.ph.b') + ' · ' + t('al.src.ht'), side: 'b', lang: mr ? 'mr' : 'en', mark: mark(pe(b), { what: t('al.phase.what') }),
          html: mr ? 'तेच आंबेकर देशपांडे; पण हा काळ सुमारे १७५० किंवा ‘सुमारे तीनशे वर्षांपूर्वी’. गाभारा त्यांनी समाधीवर बांधला.' : 'The same Ambekar Deshpande family, but the period is about 1750, or "around 300 years ago". They built the gabhara over the samadhi.' },
      ], { label: t('al.when.q') });
      const later = ['DNYP-BP-03', 'DNYP-BP-04', 'DNYP-BP-05', 'DNYP-BP-07', 'DNYP-BP-08'].map((i) => phases.get(i)).filter(Boolean);
      html += `<p class="al-t al-l"><b>${esc(t('al.later'))}:</b> ` + (mr
        ? 'वीणा मंडप (१७०७, असे एका नोंदीत; तारीख आणि आश्रयदाता यांचा मेळ बसत नाही, म्हणून तपासलेले नाही); १७५० मध्ये पेशव्यांचा तट आणि पणा दरवाजा; १७५९ मध्ये करंजा मंडप; १७७८ पासून सुमारे दोन दशके शिंदे घराण्याकडून नूतनीकरण; १८२० च्या दशकात हैबतबाबांनी पालखी-व्यवस्था सुरू केली.'
        : 'the Veena Mandap (1707, per one record; its date and patron do not fit, so it is unchecked); in 1750 the Peshwa\'s fortifying wall and the Pana Darwaja gate; in 1759 the Karanja Mandap; from 1778, for about two decades, renovation by the Shinde family; in the 1820s Haibatbaba began the modern palkhi arrangement.') +
        mark({ cs: 'editorial testimony', src: [...new Set(later.map((p) => p.source_id))], rows: later.map((p) => p.phase_id), link: 'life/memorials',
          note: later.map((p) => `${p.period_or_year}: ${p.work_done} (${p.patron_or_builder}). Status: ${p.claim_status}.${p.damage_or_restoration ? ' ' + p.damage_or_restoration + '.' : ''}`) }, { what: t('al.later.what') }) + `</p>`;
    }
    const links = [];
    if (d.jr) links.push(`<a href="#/journey?s=${esc(d.jr)}">${esc(t('al.journey'))}</a>`);
    html += `<p class="xrow al-l2">${links.join('')}<a href="#/life/memorials">${esc(t('al.ws'))}</a></p>`;
    return { title: nameOf(s), html, lang: mr ? 'mr' : 'en' };
  };
  attachScene(ctx.el, sheet);
  ctx.after = async () => {
    const q = ctx.query.get('spot');
    if (q) { const r = await sheet(q); if (r) openSheet({ title: r.title, html: r.html, titleLang: r.lang }); }
  };
}

const STYLE = `<style>
.x-alandi { max-width: 40rem; margin: 0 auto; padding: var(--sp-4) var(--sp-4) var(--sp-6); }
.x-alandi h1 { font-size: var(--s-3); margin: 0 0 var(--sp-2); }
.x-alandi .sub { color: var(--ink-2); margin: 0 0 var(--sp-3); line-height: var(--lh-prose); }
.x-alandi .scn { color: var(--ink-3); background: color-mix(in srgb, var(--paper-2) 60%, transparent); border-radius: var(--r-2); }
.x-alandi .scn-t { min-width: 44px; min-height: 44px; }
.x-alandi .scn-l { font-size: .8rem; white-space: normal; max-width: 6.2rem; text-align: center; }
.x-alandi .sch { margin: var(--sp-2) 0 var(--sp-5); line-height: 1.6; }
.x-alandi .scn { color: var(--ink-2); }
.x-alandi .scn-l { max-width: 5.2rem; }
.x-alandi .pics h2 { font-size: var(--s-1); margin: var(--sp-5) 0 var(--sp-2); font-weight: 400; font-family: var(--f-text); }
@media (min-width: 46rem) { .x-alandi .pics { display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--sp-4); } .x-alandi .pics h2 { grid-column: 1 / -1; } }
.x-alandi .beyond h2 { font-size: var(--s-1); margin: 0 0 .2rem; font-weight: 400; font-family: var(--f-text); }
.x-alandi .bl { display: grid; gap: var(--sp-2); margin: var(--sp-3) 0 var(--sp-5); }
.x-alandi .bt { appearance: none; text-align: left; background: var(--paper-3); border: 1px solid var(--rule); border-radius: var(--r-2); padding: var(--sp-3); cursor: pointer; color: var(--ink); display: grid; gap: .1rem; min-height: 44px; font: inherit; }
.x-alandi .bt:hover, .x-alandi .bt:focus-visible { border-color: var(--saffron); outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--saffron) 30%, transparent); }
.x-alandi .bn { font-family: var(--f-text); font-size: var(--s-0); }
.x-alandi .bw { font-size: var(--s--1); color: var(--ink-3); }
.xs-body .al-t { font-family: var(--f-text); line-height: 1.85; margin: var(--sp-3) 0; }
.xs-body .al-l { font-size: var(--s--1); line-height: 1.75; }
.xs-body .al-h { font-family: var(--f-text); font-size: var(--s-1); font-weight: 400; margin: var(--sp-4) 0 .2rem; }
.xs-body .al-st, .xs-body .al-w { margin: .2rem 0; }
.xs-body .al-l2 { margin-top: var(--sp-4); }
.xs-body .al-l2 a { color: var(--maroon); }
</style>`;
