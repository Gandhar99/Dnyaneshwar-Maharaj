// H. Circle of saints. Routes: #/saints (the ring), #/saints/<nivruttinath|sopandev|muktabai|namdev|changdev> (what they say of him
// and what he says of them, facing voices, one exchange to a screen), #/saints/letter (the Changdev Pasashti read as a letter),
// #/saints/gita (Arjuna and Krishna in the Gita verses, with the ovis that follow), #/saints/lines (lines that travel).
// Data: lines.js (written by tools/build_saints.py from site/data and the packages: shared phrases, the curated voices of each
// saint, the Gita staging), texts/changdev-pasashti.json, life.json. One file: labels, styles and code together.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, routeForSegment } from '../../assets/js/data.js';
import { keepDandas, highlight, wsCredit } from '../../assets/js/components.js';
import { findHits } from '../../assets/js/search-norm.js';
import { mark, pager, voices, door, revealLines, photosReady, photo } from '../../assets/js/experience.js';

const KEYS = ['nivruttinath', 'sopandev', 'muktabai', 'namdev', 'changdev'];
const CS = 'reconstruction';

registerLabels('sa', {
  mr: {
    'n.nivruttinath': 'निवृत्तिनाथ', 'n.sopandev': 'सोपानदेव', 'n.muktabai': 'मुक्ताबाई', 'n.namdev': 'नामदेव', 'n.changdev': 'चांगदेव',
    'full.nivruttinath': 'संत निवृत्तिनाथ', 'full.sopandev': 'संत सोपानदेव', 'full.muktabai': 'संत मुक्ताबाई', 'full.namdev': 'संत नामदेव', 'full.changdev': 'योगी चांगदेव',
    'mauli': 'माऊली',
    'ring.label': 'संतांचे वर्तुळ, मध्यभागी माऊली',
    'ring.hint': 'एका संताला स्पर्श करा. ते माऊलींविषयी काय म्हणतात आणि माऊली त्यांच्याविषयी काय म्हणतात, ते समोरासमोर वाचा.',
    'door.letter': 'चांगदेवांना पत्र', 'door.letter.d': 'चांगदेव पासष्टी, ओवी ओवीने, पत्र वाचावे तसे',
    'door.gita': 'अर्जुनाचे प्रश्न, श्रीकृष्णाची उत्तरे', 'door.gita.d': 'गीतेचे श्लोक आणि त्यांच्यामागून येणाऱ्या माऊलींच्या ओव्या',
    'door.lines': 'ओळी ज्या प्रवास करतात', 'door.lines.d': 'माऊलींच्या आणि इतर संतांच्या रचनांत एकसारख्या सापडलेल्या ओळी: एका स्क्रिप्टचा शोध',
    'circle': 'संतमेळा', 'back': 'वर्तुळाकडे',
    'who.they': '{n} यांच्या रचनेत', 'who.he': 'माऊलींच्या शब्दांत',
    'quiet.his': 'आमच्या पाठांत, यापेक्षा अधिक ठिकाणी माऊली हे नाव घेतात असे आढळले नाही.',
    'quiet.their': 'या संतांच्या स्वतःच्या रचना आमच्या संग्रहात नाहीत; म्हणून त्यांची बाजू येथे रिकामी आहे.',
    'quiet.what': 'हे शोधण्याची पद्धत',
    'ocr': 'स्कॅनवरून यंत्राने वाचलेला पाठ; शुद्धलेखन तपासलेले नाही',
    'firstonly': 'येथे फक्त पहिली ओळ; पूर्ण रचना नाही.',
    'ep.samadhi': 'समाधीविषयीचा अभंग',
    'read.in': 'वाचनकक्षात उघडा', 'letter.open': 'पत्र म्हणून वाचा', 'gatha.open': 'अभंगाचे पान',
    'their.what': 'या ओळीचा स्रोत आणि जुळणीचा नियम', 'his.what': 'हा पाठ आणि नाव कसे जुळले',
    'rel.what': 'नात्याची नोंद', 'rel2.what': 'ओव्यांतील संबोधनाची नोंद',
    'rel.nivruttinath': 'थोरले बंधू आणि गुरू; ग्रंथात ‘निवृत्तिदासु’ अशी स्वाक्षरी येते.',
    'rel.sopandev': 'धाकटे बंधू, असे एकाच साक्षीतून सांगितले जाते.',
    'rel.muktabai': 'धाकटी बहीण, असे एकाच साक्षीतून सांगितले जाते.',
    'rel.namdev': 'परंपरा सांगते, नामदेव माऊलींचे समकालीन संत होते आणि त्यांच्यासोबत तीर्थयात्रेला गेले. काही अभ्यासक या कालगणनेवर शंका घेतात.',
    'rel.changdev': 'परंपरा सांगते, चांगदेव वाघावर बसून आले आणि चालत्या भिंतीच्या प्रसंगानंतर शरण आले.',
    'rel2.changdev': 'पासष्टीच्या चार ओव्या त्यांना ‘चांगया’ किंवा ‘चांगदेवा’ अशी हाक मारतात.',
    'intro.go': 'पुढे: त्यांचे शब्द आणि माऊलींचे शब्द, एकमेकांसमोर.',
    'pager': 'या संताचे आणि माऊलींचे शब्द',
    'end.title': 'येथे थांबू',
    'end.counts': 'नियमांनी जुळवलेल्या {n} नोंदींत माऊलींचे नाव येते; येथे त्यांतील निवडक वाचल्या. ही जुळणी यंत्राची आहे, संशोधकांनी तपासलेली नाही.',
    'end.counts.what': 'नोंदींची संख्या आणि जुळणीचा नियम',
    'end.noisy': 'आणखी {n} नोंदींत नाव फक्त ‘ज्ञान’ यांसारख्या सामान्य शब्दरूपांवर जुळले आहे. ते संशयास्पद आहे, म्हणून येथे घेतले नाही.',
    'end.noisy.what': 'वगळलेल्या नोंदी',
    'end.all': 'सर्व नोंदी, कार्यशाळेत', 'end.next': 'पुढचा संत',
    'end.samvad': 'निवृत्तिनाथ आणि माऊली यांचा संवाद', 'end.samvad.d': 'गाथेतील ८४ अभंग संवाद म्हणून मांडले आहेत; कोण बोलतो ते सांगितलेले नाही. कार्यशाळेत वाचा.',
    'end.letter': 'चांगदेवांना पत्र', 'end.letter.d': 'पासष्टी पत्र म्हणून, ओवी ओवीने',
    'end.lines': 'ओळी ज्या प्रवास करतात', 'end.lines.d': 'एकसारख्या सापडलेल्या ओळी',
    // letter
    'lt.title': 'चांगदेवांना पत्र',
    'lt.intro': 'परंपरेनुसार हे माऊलींनी चांगदेवांना लिहिलेले पत्र आहे. ग्रंथाची रचनाच पत्रासारखी आहे; पण प्रत्येक ओवी कोण कोणाला म्हणते, हे आमच्या नोंदींत ओवी-ओवीने ठरवलेले नाही.',
    'lt.intro.what': 'पासष्टी आणि पत्राची चौकट',
    'lt.read': 'ओवी एकेक करून उलगडतात; स्पर्श केल्यास सर्व दिसतात.',
    'lt.text.what': 'या ओव्यांचा पाठ आणि स्रोत',
    'lt.addr': 'या ओवीत संबोधन: चांगया', 'lt.pager': 'पत्र, ओवी ओवीने',
    'lt.end': 'पत्र येथे संपते.',
    // gita
    'gt.title': 'अर्जुनाचे प्रश्न, श्रीकृष्णाची उत्तरे',
    'gt.intro': 'ज्ञानेश्वरीत प्रत्येक अध्यायाच्या आत गीतेचे संस्कृत श्लोक आहेत, आणि त्यांच्या मागून माऊलींच्या ओव्या. जेथे श्लोकासमोर ‘अर्जुन उवाच’ किंवा ‘श्रीभगवानुवाच’ असे छापलेले आहे, तेथे येथे दोन बाजू मांडल्या आहेत: श्लोक आणि त्यानंतरच्या ओव्या.',
    'gt.intro.what': 'वक्त्याचे नाव कोठून घेतले',
    'gt.note': 'श्लोकाच्या मागून येणाऱ्या ओव्या. कोणती ओवी कोणाचे बोलणे सांगते हे ओवी-ओवीने ठरवलेले नाही; ओव्या श्लोकाच्या क्रमाने जोडल्या आहेत.',
    'gt.note.what': 'ओव्या श्लोकाशी कशा जोडल्या',
    'gt.ch': 'अध्याय {n}, श्लोक {g}', 'gt.held': 'या अध्यायाचा पूर्ण पाठ येथे दाखवत नाही; फक्त पहिली ओळ.',
    'gt.then': 'त्यामागच्या ओव्या', 'gt.pager': 'गीतेतील संवाद',
    'gt.Arjuna': 'अर्जुन', 'gt.Krishna': 'श्रीकृष्ण', 'gt.Dhritarashtra': 'धृतराष्ट्र', 'gt.Sanjaya': 'संजय',
    'gt.end': 'येथे थांबू. सर्व श्लोक आणि ओव्या वाचनकक्षात क्रमाने वाचता येतात.', 'gt.end.go': 'वाचनकक्षात',
    // lines
    'ln.title': 'ओळी ज्या प्रवास करतात',
    'ln.intro': 'एका संगणकी स्क्रिप्टने माऊलींच्या रचनांत आणि नामदेव, निवृत्तिनाथ, मुक्ताबाई, सोपानदेव यांच्या रचनांत एकसारख्या सापडलेल्या ओळी. हा त्या स्क्रिप्टचा निकाल आहे. कोणी कोणाकडून घेतले, किंवा कोणावर कोणाचा प्रभाव पडला, हे यातून सिद्ध होत नाही.',
    'ln.method': 'पद्धत: शब्द जुळवण्याच्या शोधाचेच नियम (अनुस्वार, र्‍हस्व-दीर्घ आणि विरामचिन्हे दुर्लक्षित); किमान {n} शब्द एकापाठोपाठ एक दोन्हीकडे; नेहमीच्या स्वाक्षरी-ओळी आणि खूप वेळा येणारी कडवी वेगळी ठेवली.',
    'ln.method.what': 'स्क्रिप्टची पूर्ण पद्धत आणि तिच्या मर्यादा',
    'ln.found': '{k} ठिकाणी जुळणी सापडली: नामदेव {a}, निवृत्तिनाथ {b}, मुक्ताबाई {c}, सोपानदेव {d}. एकेका पानावर एक.',
    'ln.phrase': 'दोन्हीकडे सापडलेले शब्द', 'ln.poem': 'दोन्ही संग्रहांत जवळजवळ एकच रचना दिसते; ती कोणाची, याचा निर्णय येथे केलेला नाही.',
    'ln.his': 'माऊलींच्या संग्रहात', 'ln.their': '{n} यांच्या संग्रहात, पहिली ओळ',
    'ln.what': 'ही जुळणी, तिचे दोन्ही पाठ आणि शोधाची पद्धत',
    'ln.first1': 'माऊलींच्या या पाठाचे हक्क स्पष्ट नसल्याने येथे फक्त पहिली ओळ.',
    'ln.pager': 'सापडलेल्या ओळी', 'ln.open': 'पानावर उघडा',
    'ln.end': 'येथे थांबू. {n} जुळणी वेगळ्या ठेवल्या आहेत: त्या बहुतेक स्वाक्षरी-ओळी आहेत (उदा. “{ex}”). त्या येथे दाखवल्या नाहीत.',
    'ln.end.what': 'वेगळ्या ठेवलेल्या ओळी',
    'ln.limits': 'मर्यादा: स्कॅनमधील चुका, मथळे आणि संपादकांचे शब्द यांमुळे काही जुळणी अर्थहीन असू शकतात. शब्दांची रूपे भिन्न असतील (उदा. ह्मणे आणि म्हणे) तर स्क्रिप्टला जुळणी दिसत नाही; म्हणून खरे साम्य यापेक्षा जास्त असू शकते.',
    'ln.back': 'वर्तुळाकडे परत',
  },
  en: {
    'n.nivruttinath': 'Nivruttinath', 'n.sopandev': 'Sopandev', 'n.muktabai': 'Muktabai', 'n.namdev': 'Namdev', 'n.changdev': 'Changdev',
    'full.nivruttinath': 'Sant Nivruttinath', 'full.sopandev': 'Sant Sopandev', 'full.muktabai': 'Sant Muktabai', 'full.namdev': 'Sant Namdev', 'full.changdev': 'The yogi Changdev',
    'mauli': 'Mauli',
    'ring.label': 'The circle of saints, with Mauli at the centre',
    'ring.hint': 'Touch a saint. Read, face to face, what they say of him and what he says of them.',
    'door.letter': 'A letter to Changdev', 'door.letter.d': 'The Changdev Pasashti, an ovi at a time, as a letter is read',
    'door.gita': "Arjuna's questions, Krishna's answers", 'door.gita.d': 'Verses of the Gita and the ovis that follow them',
    'door.lines': 'Lines that travel', 'door.lines.d': "Lines found in both his poems and other saints': what a script found",
    'circle': 'The circle of saints', 'back': 'To the circle',
    'who.they': 'In {n}', 'who.he': 'In his own words',
    'quiet.his': 'We find no further place in our texts where he names them.',
    'quiet.their': 'None of their own poems are in our collection, so their side stays empty.',
    'quiet.what': 'how this was looked for',
    'ocr': 'Scan text read by machine; spelling not checked',
    'firstonly': 'Only the first line is shown here, not the poem.',
    'ep.samadhi': 'A poem on the samadhi',
    'read.in': 'Open in the reading room', 'letter.open': 'Read it as a letter', 'gatha.open': 'The abhanga page',
    'their.what': "this line's source and the matching rule", 'his.what': 'this text and how the name was matched',
    'rel.what': 'the relationship record', 'rel2.what': 'the record of the address in the ovis',
    'rel.nivruttinath': 'Elder brother and guru; the text signs "निवृत्तिदासु".',
    'rel.sopandev': 'Younger brother, as one source states.',
    'rel.muktabai': 'Younger sister, as one source states.',
    'rel.namdev': 'Tradition holds that Namdev was a contemporary saint and went on pilgrimage with him. Some scholars question the chronology.',
    'rel.changdev': 'Tradition holds that Changdev arrived on a tiger and surrendered after the episode of the moving wall.',
    'rel2.changdev': 'Four ovis of the Pasashti address him as "Changya" or "Changdeva".',
    'intro.go': 'Next: their words and his, facing each other.',
    'pager': 'This saint and Mauli, in their own words',
    'end.title': 'Here we pause',
    'end.counts': 'By rule, {n} records name him. We read a few here. The matching is by machine, not checked by a scholar.',
    'end.counts.what': 'the number of records and the matching rule',
    'end.noisy': '{n} more records matched the name only on common short forms such as "ज्ञान" (knowledge). That is doubtful, so they are left out.',
    'end.noisy.what': 'the records left out',
    'end.all': 'All the records, in the workshop', 'end.next': 'Next saint',
    'end.samvad': 'The dialogue of Nivruttinath and Mauli', 'end.samvad.d': 'The gatha sets 84 abhangas as a dialogue without saying who speaks. Read them in the workshop.',
    'end.letter': 'A letter to Changdev', 'end.letter.d': 'The Pasashti as a letter, an ovi at a time',
    'end.lines': 'Lines that travel', 'end.lines.d': 'Lines found in both',
    'lt.title': 'A letter to Changdev',
    'lt.intro': 'Tradition holds that this is the letter Mauli wrote to Changdev. The work is shaped like a letter, but our records do not settle, ovi by ovi, who speaks to whom.',
    'lt.intro.what': 'the Pasashti and the letter frame',
    'lt.read': 'The ovis unfold one by one; touch the page to see them all.',
    'lt.text.what': 'the text of these ovis and its source',
    'lt.addr': 'This ovi addresses "Changya"', 'lt.pager': 'The letter, an ovi at a time',
    'lt.end': 'The letter ends here.',
    'gt.title': "Arjuna's questions, Krishna's answers",
    'gt.intro': 'The Dnyaneshwari holds the Sanskrit verses of the Gita inside each chapter, with his ovis after them. Where the printed verse carries "Arjuna uvacha" or "Shri Bhagavan uvacha", the two sides are set facing here: the verse, then the ovis that follow.',
    'gt.intro.what': 'where the speaker comes from',
    'gt.note': 'The ovis that follow the verse. The data does not assign each ovi to a speaker; the ovis are joined to the verse by their order.',
    'gt.note.what': 'how the ovis are joined to the verse',
    'gt.ch': 'Chapter {n}, verse {g}', 'gt.held': 'The full text of this chapter is not shown here; only the first line.',
    'gt.then': 'The ovis that follow', 'gt.pager': 'The dialogue of the Gita',
    'gt.Arjuna': 'Arjuna', 'gt.Krishna': 'Krishna', 'gt.Dhritarashtra': 'Dhritarashtra', 'gt.Sanjaya': 'Sanjaya',
    'gt.end': 'Here we pause. All the verses and ovis can be read in order in the reading room.', 'gt.end.go': 'The reading room',
    'ln.title': 'Lines that travel',
    'ln.intro': "Lines that a computer script found alike in his poems and in the poems of Namdev, Nivruttinath, Muktabai and Sopandev. This is the script's result. It does not show who took from whom, or who influenced whom.",
    'ln.method': 'Method: the same rules as the site search (nasal dots, vowel length and punctuation ignored); at least {n} words in a row on both sides; the usual signature lines and very frequent refrains kept apart.',
    'ln.method.what': "the script's full method and its limits",
    'ln.found': '{k} matches found: Namdev {a}, Nivruttinath {b}, Muktabai {c}, Sopandev {d}. One to a page.',
    'ln.phrase': 'The words found on both sides', 'ln.poem': 'The two collections seem to hold nearly the same poem; whose it is, is not decided here.',
    'ln.his': 'In his collection', 'ln.their': "In {n}'s collection, first line",
    'ln.what': 'this match, both texts and the method',
    'ln.first1': 'The rights of this text of his are unclear, so only its first line is shown.',
    'ln.pager': 'The lines found', 'ln.open': 'Open the page',
    'ln.end': 'Here we pause. {n} matches were kept apart: mostly signature lines (for example "{ex}"). They are not shown.',
    'ln.end.what': 'the matches kept apart',
    'ln.limits': 'Limits: scan errors, headings and editors\' words can make some matches meaningless. Where the spelling differs (for example ह्मणे and म्हणे) the script sees no match, so the true likeness may be greater.',
    'ln.back': 'Back to the circle',
  },
});

const tx = (o) => (o && (o[lang()] ?? o.mr)) || '';
export const title = (ctx) => {
  const a = ctx.path[0];
  if (KEYS.includes(a)) return t('sa.full.' + a);
  if (a === 'letter') return t('sa.lt.title');
  if (a === 'gita') return t('sa.gt.title');
  if (a === 'lines') return t('sa.ln.title');
  return t('x.saints');
};

let LINES;
const loadLines = async () => (LINES ||= (await import('./lines.js')).default);

const CSS = `<style>
.x-saints { max-width: 40rem; margin: 0 auto; padding: var(--sp-4) var(--sp-4) var(--sp-6); }
.x-saints h1 { font-family: var(--f-text); font-weight: 400; font-size: var(--s-3); line-height: 1.25; margin: var(--sp-3) 0 var(--sp-2); }
.x-saints .sub { color: var(--ink-2); font-size: var(--s-0); line-height: 1.6; margin: 0 0 var(--sp-3); }
.x-saints .lead { font-family: var(--f-text); font-size: var(--s-1); line-height: 1.8; margin: var(--sp-3) 0; }
.x-saints .ringbox { position: relative; width: min(100%, 25rem); aspect-ratio: 1; margin: var(--sp-3) auto var(--sp-4); }
.x-saints .ringbox > svg { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--ink-3); overflow: visible; }
.x-saints .ringbox .flame { color: var(--saffron); }
.x-saints .node { position: absolute; transform: translate(-50%, -50%); display: grid; place-items: center; min-width: 5.2rem; min-height: 2.9rem; padding: .25rem .7rem;
  border-radius: 999px; border: 1px solid var(--rule); background: var(--paper-3); color: var(--ink); text-decoration: none; font-family: var(--f-text); font-size: 1.12rem; line-height: 1.2;
  box-shadow: var(--shadow); transition: background .25s, border-color .25s, transform .25s; text-align: center; }
.x-saints .node:hover, .x-saints .node:focus-visible { border-color: var(--saffron); background: color-mix(in srgb, var(--saffron-soft) 45%, var(--paper-3)); transform: translate(-50%, -50%) scale(1.04); }
.x-saints .node[aria-current] { border-color: var(--maroon); }
.x-saints .glow { animation: sa-glow 5s ease-in-out infinite; transform-origin: 50px 44px; }
@keyframes sa-glow { 0%, 100% { opacity: .85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
@media (prefers-reduced-motion: reduce) { .x-saints .glow { animation: none; } }
.x-saints .hint { text-align: center; color: var(--ink-2); font-size: var(--s-0); line-height: 1.6; max-width: 28rem; margin: 0 auto var(--sp-4); }
.x-saints .strip { display: flex; gap: .2rem; margin: 0 0 var(--sp-3); overflow-x: auto; scrollbar-width: none; }
.x-saints .strip a { flex: 1 0 auto; text-align: center; padding: .45rem .6rem .5rem; text-decoration: none; color: var(--ink-2); border-bottom: 2px solid transparent; font-family: var(--f-text); font-size: var(--s-0); min-height: 2.75rem; }
.x-saints .strip a[aria-current] { color: var(--maroon); border-bottom-color: var(--maroon); }
.x-saints .strip a.home { font-family: var(--f-ui); font-size: var(--s--1); color: var(--ink-3); }
.x-saints .rel { font-family: var(--f-text); font-size: var(--s-1); line-height: 1.8; margin: var(--sp-5) 0 var(--sp-3); }
.x-saints .rel + .rel { margin-top: var(--sp-3); }
.x-saints .go { color: var(--ink-3); font-size: var(--s--1); margin-top: var(--sp-5); }
.x-saints .vx { margin: var(--sp-3) 0; }
.x-saints .v { max-width: 94%; }
.x-saints .v .say { font-size: 1.12rem; line-height: 1.75; }
.x-saints .v .say .ln { display: block; padding-left: 1.1em; text-indent: -1.1em; }
.x-saints .v .cap { display: block; font-family: var(--f-ui); font-size: var(--s--1); color: var(--ink-3); margin-top: .4rem; line-height: 1.5; text-indent: 0; padding-left: 0; }
.x-saints .v .cap a { color: var(--maroon); }
.x-saints .v.quiet .say { background: none; border: 1px dashed var(--rule); color: var(--ink-3); font-family: var(--f-ui); font-size: var(--s--1); line-height: 1.55; }
.x-saints .v .say.sa { font-size: 1.02rem; color: var(--ink-2); }
.x-saints .sub2 { color: var(--ink-3); font-size: var(--s--1); margin: var(--sp-2) 0 0; }
.x-saints mark.hit { background: color-mix(in srgb, var(--saffron) 30%, transparent); color: inherit; border-radius: 2px; padding: 0 .08em; }
.x-saints .phrase { font-family: var(--f-text); font-size: clamp(1.35rem, 5.8vw, 1.9rem); line-height: 1.55; margin: var(--sp-3) 0 var(--sp-4); color: var(--ink); }
.x-saints .kind { font-size: var(--s--1); color: var(--saffron-ink); margin: var(--sp-4) 0 0; }
.x-saints .letter { background: var(--paper-3); border: 1px solid var(--rule); border-radius: 3px; padding: var(--sp-5) var(--sp-4) var(--sp-4); margin: var(--sp-3) 0 var(--sp-4); position: relative; box-shadow: var(--shadow); }
.x-saints .letter::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--maroon), var(--saffron)); opacity: .7; }
.x-saints .ovi { margin: 0 0 var(--sp-4); }
.x-saints .ovi .xbig { font-size: clamp(1.2rem, 5vw, 1.55rem); }
.x-saints .ovi .xbig .ln { display: block; padding-left: 1.4em; text-indent: -1.4em; }
.x-saints .ovi.addr .xbig { border-left: 2px solid var(--saffron); padding-left: .7rem; margin-left: -.2rem; }
.x-saints .ovi .addrc { font-size: var(--s--1); color: var(--saffron-ink); margin: .1rem 0 0; }
.x-saints .letter .seal { display: block; width: 2.6rem; height: 2.6rem; margin: var(--sp-3) 0 0 auto; color: var(--maroon); opacity: .8; }
.x-saints .gh { font-size: var(--s--1); color: var(--ink-3); margin: var(--sp-3) 0 0; }
.x-saints .ex { margin-top: var(--sp-5); }
.x-saints .credit { margin-top: var(--sp-5); font-size: var(--s--1); color: var(--ink-3); }
.x-saints .credit p { margin: 0; }
.x-saints .end p { font-family: var(--f-text); font-size: var(--s-1); line-height: 1.8; }
.x-saints .end .xnote { font-family: var(--f-ui); font-size: var(--s--1); }
.x-saints .wide { max-width: 40rem; }
@media (min-width: 60rem) { .x-saints .ringbox { width: 28rem; } }
</style>`;

const nm = (k) => t('sa.n.' + k);
const strip = (cur) => `<nav class="strip" aria-label="${esc(t('sa.circle'))}"><a class="home" href="#/saints">${esc(t('sa.circle'))}</a>` +
  KEYS.map((k) => `<a href="#/saints/${k}"${k === cur ? ' aria-current="page"' : ''}>${esc(nm(k))}</a>`).join('') + `</nav>`;

// ---------- the ring ----------
function ringPage(ctx) {
  const pos = KEYS.map((k, i) => { const a = (-90 + i * 72) * Math.PI / 180; return { k, x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
  const spokes = pos.map((p) => `<line x1="50" y1="50" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`).join('');
  const svg = `<svg viewBox="0 0 100 100" role="img" aria-label="${esc(t('sa.ring.label'))}" fill="none" stroke="currentColor" stroke-width=".5" stroke-linecap="round" stroke-linejoin="round">` +
    `<circle cx="50" cy="50" r="36" stroke-dasharray="1.2 2.2"/><g opacity=".45">${spokes}</g>` +
    `<g class="glow" stroke-width=".8"><path d="M41 52.5h18c0 5-4 8.2-9 8.2s-9-3.2-9-8.2z" stroke="currentColor"/><path d="M45 61.5h10" stroke="currentColor"/>` +
    `<path class="flame" stroke="var(--saffron)" d="M50 38.5c-3 3.6-3.6 6.2-.9 9.2.4.5.9.5 1.8 0 2.7-3 2.1-5.6-.9-9.2z"/></g></svg>`;
  const nodes = pos.map((p) => `<a class="node" href="#/saints/${p.k}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%">${esc(nm(p.k))}</a>`).join('');
  ctx.el.innerHTML = `${CSS}<div class="x-saints">
    <h1 tabindex="-1">${esc(t('x.saints'))}</h1>
    <p class="sub">${esc(t('x.saints.d'))}</p>
    <div class="ringbox">${svg}${nodes}</div>
    <p class="hint">${esc(t('sa.ring.hint'))}</p>
    <div class="xdoors">${door('saints/letter', t('sa.door.letter'), t('sa.door.letter.d'))}${door('saints/gita', t('sa.door.gita'), t('sa.door.gita.d'))}${door('saints/lines', t('sa.door.lines'), t('sa.door.lines.d'))}</div>
  </div>`;
}

// ---------- one saint ----------
async function saintPage(ctx, key, life) {
  const data = await loadLines();
  const S = data.saints[key];
  const rel = life.relationships;
  const R = (id) => rel.find((r) => r.relationship_id === id);
  const relEv = (ids, extra) => {
    const rows = ids.map(R).filter(Boolean);
    return { cs: rows[0]?.claim_status, src: [...new Set(rows.map((r) => r.source_id))], rows: ids,
      note: [...rows.map((r) => `${r.relationship_id}: ${r.subject} / ${r.relation} / ${r.object}. ${r.note || ''}`.trim()), ...(extra || [])], link: 'life' };
  };
  const RELS = {
    nivruttinath: [{ s: t('sa.rel.nivruttinath'), ev: relEv(['DNYL-R004']) }],
    sopandev: [{ s: t('sa.rel.sopandev'), ev: relEv(['DNYL-R005']) }],
    muktabai: [{ s: t('sa.rel.muktabai'), ev: relEv(['DNYL-R006']) }],
    namdev: [{ s: t('sa.rel.namdev'), ev: relEv(['DNYL-R009', 'DNYL-R010'], ['Chronological overlap questioned by some: see the disputes in the workshop.']) }],
    changdev: [{ s: t('sa.rel.changdev'), ev: relEv(['DNYL-R011']) }, { s: t('sa.rel2.changdev'), ev: relEv(['DNYL-R012']), what: t('sa.rel2.what') }],
  }[key];

  const their = S.their || [];
  const his = S.his || [];
  const n = Math.max(their.length, his.length, 1);
  const ruleNote = (r) => `Rule-based match (${(r.rules || []).join(', ')}), certainty ${r.cert}. The poem names him as: ${(r.forms || []).join(', ')}. The name may lie beyond the first line shown.`;

  const theirVoice = (r) => ({
    who: t('sa.who.they', { n: nm(key) }), side: 'a',
    html: `<span class="ln">${esc(keepDandas(r.t))}</span><span class="cap">${esc(t('sa.firstonly'))}${r.ep === 'Dnyaneshwar samadhi' ? ' ' + esc(t('sa.ep.samadhi')) + '.' : ''}</span>`,
    mark: mark({ cs: CS, rows: [r.id, r.seg], src: [], note: [ruleNote(r), `Source ${r.src}; incipit only (rights). Episode label in the data: ${r.ep || 'none'}.`], link: 'connections/' + key }, { what: t('sa.their.what') }),
  });
  const hisVoice = (h) => {
    const scan = h.kind === 'gatha' && h.q !== 'A';
    const link = h.kind === 'ovi' ? `<a href="#/read/${h.ch}?seg=${h.id}">${esc(t('sa.read.in'))}</a>` : h.kind === 'cp' ? `<a href="#/saints/letter">${esc(t('sa.letter.open'))}</a>` : `<a href="${href('texts/gatha/' + h.cid)}">${esc(t('sa.gatha.open'))}</a>`;
    return {
      who: t('sa.who.he'), side: 'b',
      html: h.lines.map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('') + `<span class="cap">${scan ? esc(t('sa.ocr')) + ' · ' : ''}${link}</span>`,
      mark: mark({ cs: CS, rows: [h.id], src: h.kind === 'gatha' ? ['DNYC-S01'] : [], prov: true,
        lic: h.kind === 'gatha' ? '' : `Text: Marathi Wikisource, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.`,
        note: [`The name is found by the people table (links/people.json), certainty ${h.cert}${h.kind === 'gatha' ? '; for the gatha only poems carrying his own signature are used, and only the line holding the name is shown' : ''}.`,
          h.kind === 'gatha' ? `Text of the 1908 edition, quality ${h.q || 'unknown'}${scan ? ' (raw scan text: spelling not checked)' : ''}.` : 'Text of the Wikisource page.'], link: 'connections/' + key }, { what: t('sa.his.what') }),
    };
  };
  const quietHis = { who: t('sa.who.he'), side: 'b', quiet: true,
    mark: mark({ cs: CS, rows: ['links/people.json'], note: ['Looked for with the people table (links/people.json): his Dnyaneshwari ovis (certainty high only), the Pasashti, and gatha poems carrying his own signature. Short forms that are also common words (for example सोपान, a stair) are not counted.'], link: 'connections/' + key }, { what: t('sa.quiet.what') }) };
  const quietTheirs = { who: t('sa.who.they', { n: nm(key) }), side: 'a', quiet: true,
    mark: mark({ cs: CS, rows: ['connections/index.json'], note: ['The packages hold poems of Namdev, Nivruttinath, Muktabai and Sopandev. No package of Changdev exists in this library.'], link: 'connections/changdev' }, { what: t('sa.quiet.what') }) };
  const quiet = (q, text) => ({ who: q.who, side: q.side, html: esc(text), mark: q.mark, quiet: true });

  const screens = [];
  screens.push({ type: 'intro' });
  for (let i = 0; i < n; i++) screens.push({ type: 'ex', i });
  screens.push({ type: 'end' });

  const ids = KEYS, ix = ids.indexOf(key), nextK = ids[(ix + 1) % ids.length];
  ctx.el.innerHTML = `${CSS}<div class="x-saints">
    ${strip(key)}
    <h1 tabindex="-1">${esc(t('sa.full.' + key))}</h1>
    <div id="sa-pager"></div></div>`;

  const startP = Math.max(0, Math.min(screens.length - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  const exScreen = async (i) => {
    const items = [];
    const a = their[i], b = his[i];
    if (a) items.push(theirVoice(a)); else if (!their.length) items.push(quiet(quietTheirs, t('sa.quiet.their')));
    if (b) items.push(hisVoice(b)); else if (i >= his.length && (a || his.length)) items.push(quiet(quietHis, t('sa.quiet.his')));
    const credit = b && b.kind !== 'gatha' ? await wsCredit([b.id]) : '';
    return `<div class="ex">${voices(items.map((v) => v.quiet ? { ...v, html: v.html } : v), { label: t('sa.pager') })}${credit ? `<div class="credit">${credit}</div>` : ''}</div>`;
  };
  const endScreen = () => {
    const rows = [S.total ? `<p>${esc(t('sa.end.counts', { n: num(S.total) }))}${mark({ cs: CS, rows: ['connections/narrated_by_others-*.json'],
      note: [`${S.total} rows for ${key} (certainty high ${S.high}, medium ${S.medium}). Rule-based name matching (rules N1 to N3) on the whole poem, so the name need not be in the first line. Counts of the episode labels: ${JSON.stringify(S.episodes)}.`], link: 'connections/' + key }, { what: t('sa.end.counts.what') })}</p>` : '',
    S.noisy ? `<p>${esc(t('sa.end.noisy', { n: num(S.noisy) }))}${mark({ cs: CS, rows: ['connections/narrated_by_others-*.json'], note: [`Rows whose only matched forms are: ${S.noisy_forms.join(', ')}. These are common words or the name of the book, so the rows are flagged and left out here; they remain in the workshop list.`], link: 'connections/' + key }, { what: t('sa.end.noisy.what') })}</p>` : ''].join('');
    const doors = [];
    if (key === 'changdev') doors.push(door('saints/letter', t('sa.end.letter'), t('sa.end.letter.d')));
    if (key === 'nivruttinath') doors.push(door('connections/dialogues', t('sa.end.samvad'), t('sa.end.samvad.d')));
    doors.push(door('saints/' + nextK, t('sa.end.next') + ': ' + nm(nextK), tx({ mr: t('sa.rel.' + nextK).split(/[.;]/)[0], en: t('sa.rel.' + nextK).split(/[.;]/)[0] })));
    doors.push(door('saints/lines', t('sa.end.lines'), t('sa.end.lines.d')));
    return `<div class="end"><p class="xsmall">${esc(t('sa.end.title'))}</p>${rows}<p class="xnote"><a href="#/connections/${key}">${esc(t('sa.end.all'))}</a></p><div class="xdoors">${doors.join('')}</div></div>`;
  };
  ctx.after = () => {
    pager(ctx.el.querySelector('#sa-pager'), {
      count: screens.length, start: startP, label: t('sa.pager'),
      render: (k) => {
        const s = screens[k];
        if (s.type === 'intro') return `<div class="intro">${RELS.map((r) => `<p class="rel">${esc(r.s)}${mark(r.ev, { what: r.what || t('sa.rel.what') })}</p>`).join('')}<p class="go">${esc(t('sa.intro.go'))}</p></div>`;
        if (s.type === 'ex') return exScreen(s.i);
        return endScreen();
      },
      onChange: (k) => { const want = `#/saints/${key}${k ? '?p=' + (k + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want); },
    });
  };
  ctx.manageScroll = !!ctx.query.get('p');
}

// ---------- the Pasashti as a letter ----------
async function letterPage(ctx) {
  const cp = await getJSON('texts/changdev-pasashti.json');
  const items = cp.items;
  const per = 3, count = Math.ceil(items.length / per) + 1;
  const ADDR = new Set(['CP_0037', 'CP_0045', 'CP_0060', 'CP_0061']);
  const frame = { cs: 'devotional tradition', src: ['DNYC-S04'], rows: ['DNYC-DLG01', 'CP_0001'],
    note: ['The whole work is structurally an epistle addressed to Changdev (traditional framing); speaker and addressee are work-level, not read per ovi (attribution note of dialogue DNYC-DLG01).',
      'The Pasashti is addressed to "चांगया"; Changdev arrived on a tiger and surrendered after the moving-wall episode (tradition, life record DNYL-R011).'], link: 'connections/dialogues' };
  const seal = `<svg class="seal" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="20" cy="20" r="16"/><path d="M12 24h16c0 4-3.4 6.4-8 6.4S12 28 12 24z"/><path d="M20 10c-2.8 3.3-3 5.6-.6 8.2.4.4.8.4 1.2 0 2.4-2.6 2.2-4.9-.6-8.2z"/></svg>`;
  ctx.el.innerHTML = `${CSS}<div class="x-saints">${strip('changdev')}
    <h1 tabindex="-1">${esc(t('sa.lt.title'))}</h1>
    <div id="sa-pager"></div>
    <div class="credit" id="sa-credit"></div></div>`;
  const startP = Math.max(0, Math.min(count - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  ctx.after = () => {
    ctx.el.querySelector('#sa-credit').innerHTML = '';
    wsCredit(['CP_0001']).then((h) => { const c = ctx.el.querySelector('#sa-credit'); if (c) c.innerHTML = h; });
    pager(ctx.el.querySelector('#sa-pager'), {
      count, start: startP, label: t('sa.lt.pager'),
      render: (k) => {
        if (k === 0) return `<div class="intro"><p class="rel">${esc(t('sa.lt.intro'))}${mark(frame, { what: t('sa.lt.intro.what') })}</p><p class="go">${esc(t('sa.lt.read'))}</p></div>`;
        const chunk = items.slice((k - 1) * per, k * per);
        const ev = { cs: 'editorial testimony', src: ['DNYC-S04'], rows: chunk.map((c) => c.id), prov: true,
          lic: `Text: Marathi Wikisource, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.`,
          note: [`Changdev Pasashti, ovis ${chunk[0].n} to ${chunk.at(-1).n}, text of the Wikisource page (quality tier ${cp.quality_tier}).`, 'Speaker and addressee are work-level in the data, not read per ovi.'], link: 'texts/changdev-pasashti' };
        const body = chunk.map((it) => {
          const lines = it.t.split('\n').map((l) => l.trim()).filter(Boolean);
          const a = ADDR.has(it.id);
          return `<div class="ovi rl${a ? ' addr' : ''}"><p class="xbig" lang="mr">${lines.map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('')}</p>${a ? `<p class="addrc">${esc(t('sa.lt.addr'))}</p>` : ''}</div>`;
        }).join('');
        const last = k === count - 1;
        return `<div class="letter" data-letter>${body}${last ? '' : ''}${last ? seal : ''}${mark(ev, { what: t('sa.lt.text.what') })}</div>${last ? `<p class="xsmall">${esc(t('sa.lt.end'))}</p><div class="xdoors">${door('saints/changdev', t('sa.n.changdev'), t('sa.rel.changdev').split('.')[0] + '.')}${door('saints/gita', t('sa.door.gita'), t('sa.door.gita.d'))}</div>` : ''}`;
      },
      onChange: (k, el) => {
        const want = `#/saints/letter${k ? '?p=' + (k + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want);
        const L = el.querySelector('[data-letter]'); if (L) revealLines(L, { sel: '.rl', first: 250, gap: 1100 });
      },
    });
  };
  ctx.manageScroll = !!ctx.query.get('p');
}

// ---------- the Gita dialogue ----------
async function gitaPage(ctx) {
  const data = await loadLines();
  const G = data.gita;
  const screens = G.screens;
  const count = screens.length + 1;
  const frame = { cs: 'reconstruction', src: ['DNYC-S04'], rows: ['DNYC-DLG02'], note: [`Dialogue DNYC-DLG02: Bhagavad Gita dialogue as embedded in the Dnyaneshwari, verses with an explicit speaker label only (${G.rows} rows, ${screens.length} screens here). The Wikisource page repeating chapter 6 under the number 7 is not used. The narrator's verses (Sanjaya) are left out except in the first exchange.`], link: 'connections/dialogues' };
  const joined = { cs: 'reconstruction', src: ['DNYC-S04'], rows: ['DNYC-DLG02'], note: ['Attribution note in the data: speaker from the label printed with the verse; ovi commentary not assigned a speaker. The two ovis shown are the ones that follow the verse in the text, before the next verse (link certainty gc is high, medium or chapter, by position).'], link: 'connections/dialogues' };
  ctx.el.innerHTML = `${CSS}<div class="x-saints">${strip('')}
    <h1 tabindex="-1">${esc(t('sa.gt.title'))}</h1>
    <div id="sa-pager"></div><div class="credit" id="sa-credit"></div></div>`;
  const startP = Math.max(0, Math.min(count - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  const voiceOf = (v, side) => {
    const verse = v.verse.t.split('\n').map((l) => l.replace(/\s{2,}/g, ' ').trim()).filter(Boolean);
    const ov = v.ovis.map((o) => `<span class="ln">${esc(keepDandas(o.t.split('\n').map((x) => x.trim()).filter(Boolean).join(' ')))}</span>`).join('');
    const held = v.verse.f || v.ovis.some((o) => o.f);
    return { who: t('sa.gt.' + v.who), side,
      html: `<span class="say sa" lang="sa" style="display:block;background:none;padding:0">${verse.map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('')}</span>` +
        (ov ? `<span class="cap" style="margin:.6rem 0 .2rem">${esc(t('sa.gt.then'))}${mark(joined, { what: t('sa.gt.note.what') })}</span>${ov}` : '') +
        `<span class="cap">${held ? esc(t('sa.gt.held')) + ' · ' : ''}<a href="#/read/${v.ch}?seg=${v.id}">${esc(t('sa.read.in'))}</a></span>`,
      mark: mark({ cs: 'editorial testimony', src: ['DNYC-S04'], rows: [v.id, ...v.ovis.map((o) => o.id)], prov: true, noteMr: '',
        lic: held ? '' : `Text: Marathi Wikisource, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.`,
        note: [`Gita ${v.g || ''}; speaker label from the printed verse: ${v.who}. ${v.note}`], link: 'connections/dialogues' }, { what: t('sa.his.what') }) };
  };
  ctx.after = () => {
    wsCredit(screens.flatMap((s) => s.map((v) => v.id)).filter((i) => !/^DNY07/.test(i)).slice(0, 1)).then(() => {});
    pager(ctx.el.querySelector('#sa-pager'), {
      count, start: startP, label: t('sa.gt.pager'),
      render: async (k) => {
        if (k === 0) return `<div class="intro"><p class="rel">${esc(t('sa.gt.intro'))}${mark(frame, { what: t('sa.gt.intro.what') })}</p><p class="go">${esc(t('sa.gt.note'))}</p></div>`;
        if (k === count - 1) return `<div class="end"><p>${esc(t('sa.gt.end'))}</p><div class="xdoors">${door('read', t('sa.gt.end.go'), '')}${door('saints', t('x.saints'), t('x.saints.d'))}</div></div>`;
        const sc = screens[k - 1];
        const ch = sc[0].ch;
        const items = sc.map((v, i) => voiceOf(v, i ? 'b' : 'a'));
        const credit = ch === 7 ? '' : await wsCredit([sc[0].id]);
        return `<p class="gh">${esc(t('sa.gt.ch', { n: num(ch), g: sc[0].g || '' }))}</p>${voices(items, { label: t('sa.gt.pager') })}${credit ? `<div class="credit">${credit}</div>` : ''}`;
      },
      onChange: (k) => { const want = `#/saints/gita${k ? '?p=' + (k + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want); },
    });
  };
  ctx.manageScroll = !!ctx.query.get('p');
}

// ---------- lines that travel ----------
async function linesPage(ctx) {
  const data = await loadLines();
  const M = data.meta, hits = data.hits;
  const by = (k) => hits.filter((h) => h.k === k).length;
  const stockN = Object.values(M.stock).reduce((a, s) => a + s.n, 0);
  const stockEx = Object.values(M.stock).flatMap((s) => s.top).filter((x) => x.length < 40)[0] || '';
  const method = { cs: CS, rows: ['tools/build_saints.py', 'modules/saints/lines.js'], prov: true,
    note: [
      `Written by tools/build_saints.py on ${M.built}; re-runnable, no network. His texts (${M.his_texts} units): Dnyaneshwari, Amritanubhav, Changdev Pasashti, Haripath and three gatha editions (SKH1908 whole text, SSV and TEL1954 first lines only). Theirs: every Devanagari unit in the Namdev (${M.saints.namdev.texts}), Nivruttinath (${M.saints.nivruttinath.texts}), Muktabai (${M.saints.muktabai.texts}) and Sopandev (${M.saints.sopandev.texts}) packages, all witnesses.`,
      `Normalisation: the site's search rules (anusvara, chandrabindu, nukta, visarga dropped; nasal+virama before a consonant dropped; long vowels folded; ऱ to र; dandas, digits and punctuation are word breaks). Phrase: a run of at least ${M.n_min} consecutive normalised words found in a text of his and in a text of the other saint, with at least ${M.min_chars} letters and two words of three letters or more; overlapping runs are merged into the longest one.`,
      `Kept apart as formulas: runs that are a signature line (a name with "says", or ${'रखुमादेविवरु'}), runs found in ${M.stock_d} or more of his texts, or in ${M.stock_s} or more different poems of the other saint. Findings are grouped by his text: one page is one text of his and what it shares with that saint. Where the shared runs of one pair of texts together reach ${M.same_len} words and ${Math.round(M.same_cov * 100)} per cent of the shorter one, the page says the two collections seem to hold nearly the same poem.`,
      'Rights: the other saints\' lines are shown as the shared words and a first line only. His text is shown whole only where it may be (Wikisource, 1908 edition); otherwise the first line.',
      'Checked by eye before use: 20 findings, all 20 truly present in both texts as printed; 15 were meaningful shared lines or poems, 5 were common idioms or doctrinal lists of words (for example the five elements) that two poets could use independently. Headings and editors\' words of the scans can also match. The result is a finding of a script, not a statement of influence, borrowing or authorship.'] };
  const stockEv = { cs: CS, rows: ['modules/saints/lines.js'], note: [`Kept apart: ${stockN} runs. Examples per saint: ${JSON.stringify(M.stock)}.`] };
  ctx.el.innerHTML = `${CSS}<div class="x-saints">${strip('')}
    <h1 tabindex="-1">${esc(t('sa.ln.title'))}</h1>
    <div id="sa-pager"></div></div>`;
  const count = hits.length + 2;
  const startP = Math.max(0, Math.min(count - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  const lineHtml = (txt, phrase) => {
    const hs = findHits(txt, phrase);
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).length > 1 ? hlLines(txt, phrase) : `<span class="ln">${hs.length ? highlight(keepDandas(txt), findHits(keepDandas(txt), phrase)) : esc(keepDandas(txt))}</span>`;
  };
  const hlLines = (txt, phrase) => txt.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const k = keepDandas(l); const hs = findHits(k, phrase);
    return `<span class="ln">${hs.length ? highlight(k, hs) : esc(k)}</span>`;
  }).join('');
  ctx.after = () => {
    pager(ctx.el.querySelector('#sa-pager'), {
      count, start: startP, label: t('sa.ln.pager'),
      render: async (k) => {
        if (k === 0) return `<div class="intro"><p class="rel">${esc(t('sa.ln.intro'))}</p><p class="rel" style="font-size:var(--s-0)">${esc(t('sa.ln.method', { n: num(M.n_min) }))}${mark(method, { what: t('sa.ln.method.what') })}</p>` +
          `<p class="go">${esc(t('sa.ln.found', { k: num(hits.length), a: num(by('namdev')), b: num(by('nivruttinath')), c: num(by('muktabai')), d: num(by('sopandev')) }))}</p></div>`;
        if (k === count - 1) return `<div class="end"><p>${esc(t('sa.ln.end', { n: num(stockN), ex: stockEx }))}${mark(stockEv, { what: t('sa.ln.end.what') })}</p><p class="xnote">${esc(t('sa.ln.limits'))}</p><div class="xdoors">${door('saints', t('sa.ln.back'), t('x.saints.d'))}</div></div>`;
        const h = hits[k - 1];
        const d = h.d[0];
        const route = await routeForSegment(d.id).catch(() => null);
        const ev = { cs: CS, rows: [...h.d.map((x) => x.id), ...h.s.map((x) => x.id)], prov: true,
          note: [`Found by tools/build_saints.py (class: ${h.c}). Shared words: ${h.ph.map((p) => p.p).join(' / ')}. Found in ${h.nS} text(s) of ${h.k} and in this text of his (${h.ph.length} run(s), ${h.nW} words in all).`,
            'A finding of a script, not a statement of influence, borrowing or authorship. His text and theirs may be the same poem received under two names, a common idiom, or an editor\'s heading.',
            `Their segment ids (first lines only shown): ${h.s.map((x) => x.id + ' [' + x.src + ']').join('; ')}.`], link: 'connections/shared' };
        const hisBlock = d.f ? `<span class="ln">${esc(keepDandas(d.t))}</span><span class="cap">${esc(t('sa.ln.first1'))}</span>` : hlLines(d.t, h.ph[0].p) + (d.q && d.q !== 'A' ? `<span class="cap">${esc(t('sa.ocr'))}</span>` : '');
        const link = route ? `<span class="cap"><a href="#/${esc(route)}">${esc(t('sa.ln.open'))}</a></span>` : '';
        const credit = !d.f && /^DNY\d\d_/.test(d.id) ? await wsCredit([d.id]) : '';
        const theirs = h.s.slice(0, 1).map((x) => `<span class="ln">${esc(keepDandas(x.t))}</span>`).join('');
        const items = [
          { who: t('sa.ln.their', { n: nm(h.k) }), side: 'a', html: theirs + `<span class="cap">${esc(t('sa.firstonly'))}</span>`, mark: mark(ev, { what: t('sa.ln.what') }) },
          { who: t('sa.ln.his'), side: 'b', html: hisBlock + link },
        ];
        return `<p class="kind">${esc(h.c === 'poem' ? t('sa.ln.poem') : t('sa.ln.phrase'))}</p><p class="phrase" lang="mr">${esc(h.ph[0].p)}</p>${voices(items, { label: t('sa.ln.pager') })}${credit ? `<div class="credit">${credit}</div>` : ''}`;
      },
      onChange: (k) => { const want = `#/saints/lines${k ? '?p=' + (k + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want); },
    });
  };
  ctx.manageScroll = !!ctx.query.get('p');
}

export async function render(ctx) {
  const a = ctx.path[0];
  if (!a) return ringPage(ctx);
  if (a === 'lines') return linesPage(ctx);
  if (a === 'letter') return letterPage(ctx);
  if (a === 'gita') return gitaPage(ctx);
  if (KEYS.includes(a)) { const life = await getJSON('life.json'); return saintPage(ctx, a, life); }
  ctx.el.innerHTML = `<div class="x-saints"><h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p><a href="#/saints">${esc(t('sa.back'))}</a></p></div>`;
}
