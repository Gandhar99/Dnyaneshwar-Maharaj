// I. Find by feeling and image. Routes: #/garden (the garden of twenty themes), #/garden/<T01..T20> (a bed: its abhangas one at a time),
// #/garden/things (the cabinet of everyday things), #/garden/things/<material id> (an object and the lines that name it),
// #/garden/words (his most-used words as a typographic portrait).
// Data: gatha/index.json via gathaIndex() + modules/discover/pre-themes.js (themes and confidence, one unchecked model reading),
// gatha/daily-N.json and gatha/pNNN.json (poem text), words/material_culture.json + modules/discover/pre-things.js (example lines),
// modules/discover/pre-portrait.js (word counts), words/glossary_terms.json (meanings). One file: labels, CSS and code.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, gathaIndex, gathaPoem, glossaryMap } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, pager, door, openSheet, reveal, gathaCardOK } from '../../assets/js/experience.js';
import { THEME_CONF } from '../discover/pre-themes.js';
import { LABELS as DC_LABELS } from '../discover/labels.js';
registerLabels('dc', DC_LABELS);   // category names of the everyday things

export const TOPICS = Array.from({ length: 20 }, (_, i) => 'T' + String(i + 1).padStart(2, '0'));

registerLabels('gd', {
  mr: {
    'lead': 'वीस विषयांची एक बाग. एखाद्या वाफ्यात शिरा आणि तेथील अभंग एका वेळी एक वाचा.',
    'ai': 'कोणता अभंग कोणत्या विषयाचा, हे एका संगणकी वाचनाने ठरवले आहे; माणसाने ते तपासलेले नाही.', 'ai.what': 'विषय कसे ठरले',
    'wander': 'कुठेही फिरा', 'garden': 'बाग', 'bed.n': '{n} अभंग', 'bed.aria': '{name}: {n} अभंग',
    'th.sum': 'या विषयात {h} अभंग खात्रीने आणि {m} संभाव्य म्हणून वाचले गेले. पहिले {k} येथे आहेत.',
    'th.sum1': 'या विषयात फक्त {n} अभंग मिळाले; ते सर्व येथे आहेत.', 'th.none': 'या विषयात सध्या एकही अभंग मिळालेला नाही.',
    'th.what': 'या विषयाचे अभंग कसे निवडले', 'poem.what': 'या अभंगाचा विषय, पाठ आणि स्रोत',
    'probable': 'संभाव्य', 'probable.d': 'या विषयाचा असण्याची शक्यता; वाचनात खात्री कमी होती.',
    'scan': 'स्कॅन-पाठ; शुद्धलेखन तपासलेले नाही', 'checked': 'दोन-तीन प्रतींवरून जुळवलेला पाठ',
    'full': 'संपूर्ण अभंग', 'card': 'कार्ड बनवा', 'cut': '… अभंग पुढे चालू',
    'end': 'या वाफ्यातील अभंग येथे संपले.', 'end.more': 'या विषयाचे आणखी अभंग कार्यशाळेत', 'next': 'पुढचा वाफा', 'back': 'बागेत परत',
    'pager': 'या विषयाचे अभंग', 'theme.of': 'वाफा {i} / २०',
    'things': 'रोजच्या वस्तूंचे कपाट', 'things.l': 'दिवा, घट, कमळ, वेणु: ज्यांची नावे ओव्यांत येतात अशा रोजच्या गोष्टी.',
    'things.lead': 'ओव्यांत ज्यांची नावे येतात अशा रोजच्या वस्तू. एक वस्तू उघडा; तिचे नाव असलेल्या ओळी वाचा.',
    'things.what': 'वस्तूंची मोजणी', 'things.n': '{n} ओळी',
    'things.gap': 'कपाटात फक्त त्याच वस्तू आहेत ज्यांची संशोधनात मोजणी झाली. जाते, विहीर आणि माग यांची मोजणी झालेली नाही, म्हणून ते येथे नाहीत.',
    'obj.count': 'ही गोष्ट {n} ओळींत येते.', 'obj.count.what': 'ही मोजणी कशी झाली', 'obj.simile': 'यांत उपमांचा वापरही मोजलेला आहे.',
    'obj.first': 'या अभंगाची येथे फक्त पहिली ओळ.', 'obj.pager': 'या वस्तूच्या ओळी', 'obj.line.what': 'या ओळीचा पाठ आणि स्रोत',
    'obj.dw': 'ज्ञानेश्वरी, अध्याय {ch}, ओवी {n}', 'obj.cp': 'चांगदेव पासष्टी, ओवी {n}', 'obj.gatha': 'अभंग-गाथा',
    'obj.read': 'संदर्भासह वाचा', 'obj.end': 'या वस्तूच्या ओळी येथे संपल्या.', 'obj.none': 'या वस्तूच्या दाखवता येतील अशा ओळी नाहीत.',
    'obj.next': 'पुढची वस्तू', 'cab': 'कपाटाकडे',
    'words': 'त्यांचे शब्द', 'words.l': 'ज्ञानेश्वरीत सर्वाधिक येणारे शब्द; आकार म्हणजे मोजणी.',
    'words.lead': 'ज्ञानेश्वरीत सर्वाधिक वेळा येणारे शब्द. शब्दाचे क्षेत्रफळ त्याच्या मोजणीइतके; वरून खाली क्रमाने. शब्दावर टिचकी मारा.',
    'words.what': 'ही मोजणी कशी केली', 'words.tap': 'शब्द उघडा', 'words.n': '{n} वेळा', 'words.search': 'हा शब्द ज्ञानेश्वरीत शोधा',
    'words.mean': 'अर्थ', 'words.rest': 'सर्व यादी, आणि वगळलेले जोडशब्द', 'words.close': 'बंद करा',
    'words.times': 'ज्ञानेश्वरीच्या मजकुरात {n} वेळा',
  },
  en: {
    'lead': 'A garden of twenty themes. Step into a bed and read its abhangas, one at a time.',
    'ai': 'Which abhanga belongs to which theme was decided by one computer reading; no person has checked it.', 'ai.what': 'how the themes were decided',
    'wander': 'Wander anywhere', 'garden': 'The garden', 'bed.n': '{n} abhangas', 'bed.aria': '{name}: {n} abhangas',
    'th.sum': 'In this theme {h} abhangas were read with confidence and {m} as probable. The first {k} are here.',
    'th.sum1': 'Only {n} abhangas were found in this theme; all are here.', 'th.none': 'No abhanga has been found in this theme yet.',
    'th.what': 'how this theme\'s abhangas were chosen', 'poem.what': "this abhanga's theme, text and source",
    'probable': 'probable', 'probable.d': 'Possibly of this theme; the reading was less sure.',
    'scan': 'Scan text; spelling not checked', 'checked': 'Text collated from two or three prints',
    'full': 'The whole abhanga', 'card': 'Make a card', 'cut': '… the abhanga continues',
    'end': 'The abhangas of this bed end here.', 'end.more': 'More abhangas of this theme in the workshop', 'next': 'Next bed', 'back': 'Back to the garden',
    'pager': "This theme's abhangas", 'theme.of': 'Bed {i} of 20',
    'things': 'The cabinet of everyday things', 'things.l': 'Lamp, pot, lotus, flute: ordinary things whose names are in the verses.',
    'things.lead': 'Everyday things named in the verses. Open one and read the lines that name it.',
    'things.what': 'the counting of things', 'things.n': '{n} lines',
    'things.gap': 'The cabinet holds only the things the research counted. The grindstone, the well and the loom were not counted, so they are not here.',
    'obj.count': 'This thing is named in {n} lines.', 'obj.count.what': 'how this was counted', 'obj.simile': 'Its use in similes is counted too.',
    'obj.first': 'Only the first line of this abhanga is shown here.', 'obj.pager': "This thing's lines", 'obj.line.what': "this line's text and source",
    'obj.dw': 'Dnyaneshwari, chapter {ch}, ovi {n}', 'obj.cp': 'Changdev Pasashti, ovi {n}', 'obj.gatha': 'Abhanga gatha',
    'obj.read': 'Read it in place', 'obj.end': "This thing's lines end here.", 'obj.none': 'There are no lines of this thing that may be shown.',
    'obj.next': 'Next thing', 'cab': 'To the cabinet',
    'words': 'His words', 'words.l': 'The words the Dnyaneshwari uses most; size is the count.',
    'words.lead': "The words that come most often in the Dnyaneshwari. A word's area follows its count; the order runs from the top down. Tap a word.",
    'words.what': 'how this was counted', 'words.tap': 'Open the word', 'words.n': '{n} times', 'words.search': 'Search this word in the Dnyaneshwari',
    'words.mean': 'Meaning', 'words.rest': 'The full list, and the small words left out', 'words.close': 'Close',
    'words.times': '{n} times in the text of the Dnyaneshwari',
  },
});
const g = (k, v) => t('gd.' + k, v);

// ---------- drawn things: plain strokes, 48 x 48, currentColor with saffron (.a) accents ----------
const GL = {
  T01: '<circle cx="24" cy="20" r="14" stroke-dasharray=".1 7.32" stroke-width="4.2"/><path class="a" d="M24 34v5"/><circle class="a" cx="24" cy="42" r="1.6"/>',
  T02: '<path d="M13 44V33h22v11M11 33h26M24 33V14"/><path class="a" d="M24 28c-6 0-9-4-9-8 5 0 9 3 9 8zM24 24c6 0 9-4 9-8-5 0-9 3-9 8zM24 18c-4-1-6-4-5-8 4 1 6 4 5 8z"/>',
  T03: '<path d="M5 26C5 12 14 7 24 7s19 5 19 19z"/><path d="M24 26v18M15 26v12M33 26v12"/><path class="a" d="M9 44h30"/>',
  T04: '<path d="M12 44V30M24 44V20M36 44V28M12 38l-4-3M24 34l5-4M36 38l-4-3M24 40l-5-3"/><circle class="a" cx="12" cy="27" r="3.2"/><circle class="a" cx="24" cy="17" r="3.8"/><circle class="a" cx="36" cy="25" r="3.2"/>',
  T05: '<path class="a" d="M33 7a9 9 0 1 0 8 13 7 7 0 0 1-8-13z"/><path d="M14 44C12 32 16 22 26 16M15 36c-5 0-6-4-5-7 4 0 6 3 5 7zM18 28c4-2 7 0 8 3-4 2-7 0-8-3z"/>',
  T06: '<rect x="9" y="37" width="30" height="7" rx="1"/><ellipse class="a" cx="18" cy="28" rx="4" ry="8"/><ellipse class="a" cx="30" cy="28" rx="4" ry="8"/>',
  T07: '<path d="M24 40C16 40 9 34 8 26c7 0 13 4 16 10 3-6 9-10 16-10-1 8-8 14-16 14zM6 44h36"/><path class="a" d="M24 36C17 30 17 18 24 8c7 10 7 22 0 28z"/>',
  T08: '<path d="M12 44C26 38 8 30 22 22 34 15 22 10 30 4M16 33l-6-2M26 17l7-1"/><circle class="a" cx="31" cy="6" r="2.2"/>',
  T09: '<path d="M16 12c10-4 22 2 22 14-10 4-22-2-22-14zM16 12l20 14"/><path class="a" d="M10 40c4 0 6-2 8-4M24 42c4 0 8-1 11-3"/><path d="M6 46h36" opacity=".5"/>',
  T10: '<path d="M7 24L24 9l17 15M11 21v22h26V21"/><path class="a" d="M20 43V32h8v11"/>',
  T11: '<path d="M5 42V18M15 42V18M33 42V18M43 42V18M3 25h14M31 25h14M3 35h14M31 35h14"/><path class="a" d="M24 42V32" stroke-dasharray="1 4"/>',
  T12: '<circle cx="19" cy="26" r="11"/><circle cx="29" cy="26" r="11"/><circle cx="19" cy="26" r="7.5" opacity=".5"/><circle cx="29" cy="26" r="7.5" opacity=".5"/><circle class="a" cx="24" cy="26" r="1.2"/>',
  T13: '<path d="M6 40C16 36 28 26 42 8M14 37l-2-7M21 33l-1-8M28 27l1-8M34 20l5-5M18 35l5 4M26 30l6 4"/><path class="a" d="M40 12l4-4"/>',
  T14: '<path d="M24 5c7 10 12 16 12 24a12 12 0 0 1-24 0c0-8 5-14 12-24z"/><path class="a" d="M18 30c0 4 3 7 7 7"/>',
  T15: '<path d="M13 5v39M8 44h14"/><path class="a" d="M13 8l24 5-8 6 8 6-24 3z"/>',
  T16: '<path d="M5 41L43 9" stroke-width="3.2"/><circle class="f" cx="15" cy="32.5" r="1.3"/><circle class="f" cx="21" cy="27.5" r="1.3"/><circle class="f" cx="27" cy="22.5" r="1.3"/><ellipse class="a" cx="36" cy="35" rx="4.5" ry="7" transform="rotate(30 36 35)"/><circle class="a" cx="36" cy="35" r="1.6"/>',
  T17: '<path d="M5 12Q24 44 43 12" stroke-dasharray=".1 6.1" stroke-width="4.2"/><path class="a" d="M24 33v8"/><circle class="a" cx="24" cy="43.5" r="1.6"/>',
  T18: '<path d="M9 32h30c-2 8-8 11-15 11S11 40 9 32z"/><path class="a" d="M24 29c-6-7-3-13 0-20 3 7 6 13 0 20z"/>',
  T19: '<path d="M24 24c2 0 3 2 2 3.5s-4 2-5.5-.5S20 21 24 20s8 2 8 7-5 9-10 8-11-6-10-13 8-14 16-13 15 8 14 16"/><path class="a" d="M10 44h28"/>',
  T20: '<circle class="a" cx="14" cy="14" r="5.5"/><path class="a" d="M14 4v2M4 14h2M7 7l1.5 1.5M21 7l-1.5 1.5"/><path d="M4 44c8-14 22-14 40 0z"/><path d="M33 34c-1-5 1-8 4-10 1 4 0 8-4 10z"/>',
};
// the cabinet: shelf by shelf; key = the numeric end of the material id
const SHELVES = [['042', '041', '045'], ['046', '040', '043'], ['044', '039', '054'], ['061', '049', '001'], ['063', '064', '067'], ['020', '018', '023'], ['022', '015', '016'], ['075', '024', '030']];
const OB = {
  '042': '<path d="M9 30h30c-2 8-8 11-15 11S11 38 9 30zM9 30L4 27M24 41v3M16 45h16"/><path class="a" d="M24 27c-6-7-3-12 0-19 3 7 6 12 0 19z"/>',
  '041': '<circle cx="24" cy="18" r="13"/><circle cx="24" cy="18" r="9.5" opacity=".5"/><path d="M24 31v13M19 44h10"/><path class="a" d="M18 12c2-2 4-3 7-3"/>',
  '045': '<path d="M19 9h10M20 9c0 5-9 9-9 19 0 10 6 16 13 16s13-6 13-16c0-10-9-14-9-19"/><path class="a" d="M12 27h24M12 32c4 2 20 2 24 0"/>',
  '046': '<path d="M15 26h18M16 26c-3 10 2 18 8 18s11-8 8-18M17 26c-4-8-1-14 7-13M31 26c4-8 1-14-7-13"/><circle class="a" cx="24" cy="12" r="4.5"/>',
  '040': '<ellipse cx="24" cy="33" rx="17" ry="8"/><ellipse cx="24" cy="30" rx="11" ry="5"/><ellipse cx="24" cy="28" rx="5" ry="2.2"/><path class="a" d="M41 33c4-8 1-16-4-22"/>',
  '043': '<path d="M10 42L36 8"/><ellipse transform="rotate(37 36 10)" cx="36" cy="10" rx="1.4" ry="3.6"/><path class="a" d="M37 7c9-3 9 11-4 14S14 31 12 38"/>',
  '044': '<circle cx="20" cy="22" r="14"/><circle cx="20" cy="22" r="2.2"/><path d="M20 8v28M6 22h28M10 12l20 20M30 12L10 32" opacity=".7"/><path d="M20 36l-8 8M20 36l8 8M8 44h24"/><path class="a" d="M36 22h9M34 18l6 4-6 4"/>',
  '039': '<path d="M4 14l30 19M33 33l9-21M33 33l6 9H27z"/><path class="a" d="M2 45h44"/>',
  '054': '<path d="M5 12h38v24H5zM9 36v5M15 36v5M21 36v5M27 36v5M33 36v5M39 36v5"/><path class="a" d="M5 19h38M5 29h38"/>',
  '061': GL.T12, '049': '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="11.5" opacity=".5"/><path class="a" d="M24 15v18M15 24h18"/>',
  '001': '<path d="M7 22h34c0 12-8 20-17 20S7 34 7 22z"/><path class="a" d="M12 28c4 2 8-2 12 0s8-2 12 0"/><path d="M24 4c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/>',
  '063': '<path d="M5 41L43 9" stroke-width="3.4"/><circle class="f" cx="15" cy="32.5" r="1.4"/><circle class="f" cx="21" cy="27.5" r="1.4"/><circle class="f" cx="27" cy="22.5" r="1.4"/><path class="a" d="M33 18c4-6 9-6 12-4"/>',
  '064': '<circle cx="15" cy="30" r="10.5"/><circle cx="33" cy="30" r="10.5"/><circle class="a" cx="15" cy="30" r="2.5"/><circle class="a" cx="33" cy="30" r="2.5"/><path d="M15 19.5C15 5 33 5 33 19.5"/>',
  '067': '<path d="M8 30c0-12 12-20 24-16 9 4 9 16 3 23-6 6-19 6-24-1-2-2-3-4-3-6zM35 37l7 7"/><path class="a" d="M30 18c-8-2-12 6-8 11 4 4 10 1 10-4 0-3-3-5-5-4"/>',
  '020': GL.T07, '018': GL.T02, '022': GL.T03,
  '023': '<path d="M24 42v-8M24 34C12 34 6 22 18 14l6-9 6 9c12 8 6 20-6 20z"/><path class="a" d="M24 34V14"/>',
  '015': '<path d="M24 44V26M8 44h32M24 31C13 31 10 21 13 16c9 0 13 6 11 15z"/><path class="a" d="M24 26c9 0 13-7 11-13-8 0-13 5-11 13z"/>',
  '016': '<path d="M3 21h42M3 44L16 21M15 44l5-23M28 44V21M41 44L36 21M46 40L42 21" opacity=".8"/><path class="a" d="M10 30v-4M22 30v-4M34 30v-4M18 40v-5M30 40v-5"/>',
  '075': GL.T10,
  '024': '<path d="M13 17h20c5 0 8 4 8 9v6H11v-6c0-5 0-9 2-9zM14 32v11M21 32v11M29 32v11M36 32v11M13 17L8 12 4 19l5 9"/><path class="a" d="M41 22c3 2 4 6 3 10"/><circle class="f" cx="9" cy="20" r="1"/>',
  '030': '<path d="M5 24C13 12 29 12 37 24 29 36 13 36 5 24zM37 24l8-8v16z"/><circle class="f" cx="13" cy="22" r="1.4"/><path class="a" d="M19 18c3 4 3 8 0 12M25 17c3 4 3 10 0 14"/>',
};
const svg = (inner, cls = '') => `<svg class="gl ${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${inner}</svg>`;
const mid = (n) => 'DNYC-MC' + n;

const CSS = `
.x-garden { max-width: 40rem; margin: 0 auto; padding: var(--sp-4) var(--sp-4) var(--sp-6); }
.x-garden h1 { font-size: var(--s-3); margin: 0 0 var(--sp-1); line-height: 1.25; }
.x-garden .sub { color: var(--ink-2); font-size: var(--s-0); margin: 0 0 var(--sp-3); line-height: 1.6; }
.x-garden .ai { color: var(--ink-3); font-size: var(--s--1); margin: 0 0 var(--sp-4); }
.x-garden svg.gl { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; display: block; }
.x-garden .gl .a { stroke: var(--saffron); } .x-garden .gl .f { fill: currentColor; stroke: none; }
.x-garden .gl .m { stroke: var(--maroon); }
/* the garden */
.x-garden .plot { position: relative; max-width: 30rem; margin: var(--sp-4) auto 0; }
.x-garden .plot > svg { width: 100%; height: auto; display: block; }
.x-garden .plot .way { fill: none; stroke: var(--saffron); stroke-width: 1.6; stroke-dasharray: 1 7; stroke-linecap: round; opacity: .75; }
.x-garden .plot .tuft { fill: none; stroke: var(--ink-3); stroke-width: 1; stroke-linecap: round; opacity: .55; }
.x-garden .bed { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: .15rem; text-decoration: none; color: var(--maroon);
  width: 7.6rem; text-align: center; padding: .2rem; border-radius: 12px; -webkit-tap-highlight-color: transparent; }
.x-garden .bed .soil { position: relative; display: grid; place-items: center; }
.x-garden .bed .soil::after { content: ""; position: absolute; left: 50%; bottom: -.15rem; width: 125%; height: .7rem; transform: translateX(-50%);
  background: var(--saffron-soft); border-radius: 50%; opacity: .55; z-index: -1; }
.x-garden .bed .gl { transition: transform .35s cubic-bezier(.2, .7, .2, 1); transform-origin: 50% 100%; }
.x-garden .bed:hover .gl, .x-garden .bed:focus-visible .gl { transform: scale(1.09) rotate(-2deg); }
.x-garden .bed:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.x-garden .bed .bn { font-family: var(--f-text); font-size: .98rem; line-height: 1.3; color: var(--ink); margin-top: .35rem; }
.x-garden .bed:hover .bn { color: var(--maroon); }
.x-garden .bed .bc { font-size: var(--s--1); color: var(--ink-3); font-variant-numeric: tabular-nums; }
.x-garden .gate { display: flex; flex-wrap: wrap; gap: var(--sp-2) var(--sp-4); align-items: center; margin: var(--sp-4) 0 0; }
.x-garden .xdoors { margin-top: var(--sp-6); }
/* a bed */
.x-garden .bedhead { display: grid; grid-template-columns: auto 1fr; gap: var(--sp-3); align-items: center; padding: var(--sp-3) 0 var(--sp-3); border-bottom: 1px solid var(--rule); }
.x-garden .bedhead svg { width: 3.6rem; height: 3.6rem; color: var(--maroon); }
.x-garden .bedhead h1 { margin: 0; font-size: var(--s-2); }
.x-garden .bedsum { color: var(--ink-2); font-size: var(--s--1); line-height: 1.6; margin: var(--sp-3) 0 var(--sp-3); }
.x-garden .poem { min-height: calc(var(--screen-h) - 13rem); display: flex; flex-direction: column; justify-content: center; padding: var(--sp-3) 0; }
.x-garden .poem .tags { display: flex; flex-wrap: wrap; gap: .2rem .8rem; align-items: center; margin: 0 0 var(--sp-3); font-size: var(--s--1); color: var(--ink-3); }
.x-garden .tag-p { color: var(--saffron-ink); border-bottom: 1px dotted var(--saffron); }
.x-garden .poem .xbig { font-size: clamp(1.25rem, 5.2vw, 1.75rem); }
.x-garden .poem.scan .xbig { font-size: clamp(1.1rem, 4.4vw, 1.4rem); color: var(--ink-2); }
.x-garden .poem .acts { margin-top: var(--sp-4); }
.x-garden .poem .cut { color: var(--ink-3); font-size: var(--s--1); margin: var(--sp-2) 0 0; }
.x-garden .poem .fl-only { font-family: var(--f-text); font-size: var(--verse-x); line-height: 1.7; margin: 0; }
.x-garden .end { padding: var(--sp-5) 0; } .x-garden .end p { margin: 0 0 var(--sp-3); }
/* the cabinet */
.x-garden .cab { margin: var(--sp-4) auto 0; max-width: 30rem; border: 3px solid var(--maroon); border-radius: 22px 22px 6px 6px; background: var(--paper-2);
  box-shadow: var(--shadow); padding: 0 .35rem .35rem; position: relative; }
.x-garden .cab .crown { display: block; width: 100%; height: 2.6rem; color: var(--maroon); }
.x-garden .shelf { display: grid; grid-template-columns: repeat(3, 1fr); align-items: end; border-bottom: 6px solid var(--maroon-soft); box-shadow: 0 2px 0 var(--maroon); margin-bottom: 4px; background: linear-gradient(var(--paper-3), var(--paper-2)); }
@media (min-width: 46rem) { .x-garden .cab { max-width: 34rem; } }
.x-garden .obj { display: flex; flex-direction: column; align-items: center; gap: .1rem; padding: .7rem .2rem .55rem; text-decoration: none; color: var(--ink); text-align: center; border-radius: 8px; -webkit-tap-highlight-color: transparent; }
.x-garden .obj svg { width: 3.6rem; height: 3.6rem; color: var(--maroon); transition: transform .3s cubic-bezier(.2, .7, .2, 1); }
.x-garden .obj:hover svg, .x-garden .obj:focus-visible svg { transform: translateY(-4px); }
.x-garden .obj:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.x-garden .obj .on { font-family: var(--f-text); font-size: 1.12rem; line-height: 1.3; }
.x-garden .obj .og { font-size: .78rem; color: var(--ink-3); line-height: 1.2; }
.x-garden .gap { margin: var(--sp-4) auto 0; max-width: 30rem; }
.x-garden .objhead { display: grid; grid-template-columns: auto 1fr; gap: var(--sp-4); align-items: center; padding: var(--sp-3) 0; border-bottom: 1px solid var(--rule); }
.x-garden .objhead svg { width: 5.4rem; height: 5.4rem; color: var(--maroon); }
.x-garden .objhead h1 { margin: 0; font-family: var(--f-text); font-size: var(--s-4); font-weight: 400; line-height: 1.15; }
.x-garden .objhead .gloss { margin: .2rem 0 0; color: var(--ink-2); font-size: var(--s-0); }
/* the portrait */
.x-garden .port { margin: var(--sp-5) 0 var(--sp-4); }
.x-garden .prow { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0 .9rem; padding: .1rem 0; }
.x-garden .pw { appearance: none; background: none; border: 0; padding: 0 .1rem; cursor: pointer; font-family: var(--f-text); line-height: 1.12; color: var(--ink); white-space: nowrap;
  border-radius: 6px; transition: color .25s; }
.x-garden .pw:hover, .x-garden .pw:focus-visible { color: var(--maroon); }
.x-garden .pw:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.x-garden .pw.c1 { color: var(--maroon); } .x-garden .pw.c2 { color: var(--saffron-ink); } .x-garden .pw.c3 { color: var(--ink-2); }
.x-garden .port-foot { text-align: center; margin: var(--sp-4) 0 0; }
.x-garden .pw-sheet .big { font-family: var(--f-text); font-size: 2.6rem; line-height: 1.2; margin: 0; }
.x-garden .pw-sheet p { margin: .4rem 0; }
.x-garden .skip { font-family: var(--f-text); color: var(--ink-3); line-height: 1.9; }
@media (prefers-reduced-motion: reduce) { .x-garden * { transition: none !important; } }
`;
const page = (inner) => `<style>${CSS}</style><div class="x-garden">${inner}</div>`;
const lines = (s) => String(s || '').split('\n').map((l) => l.trim()).filter(Boolean);
const halves = (l) => {
  const clean = l.replace(/\s*[।|]?\s*[०-९0-9]+\s*[।|]\s*$/, ' ।').replace(/\s+/g, ' ').trim();
  const h = clean.split(/(?<=[।|])\s+/).filter(Boolean);
  return `<span class="ln">${h.map((x, k) => `<span class="h">${esc(keepDandas(x))}</span>${k < h.length - 1 ? ' ' : ''}`).join('')}</span>`;
};
const verse = (arr) => `<p class="xbig" lang="mr">${arr.map(halves).join('')}</p>`;

// ---------- themes: the pool for one bed (also used by the kirtan sheet in module ways) ----------
const AI_NOTE = ['Themes: each abhanga was read once by a language model (AI) from the raw scan text of its best witness (long poems cut in the middle). No person has checked the readings.',
  'Each reading carries a confidence, high or medium. High ones are shown as belonging to the theme; medium ones are marked "probable". Low-confidence readings are not shown anywhere.',
  'The poems shown first are those with the best text (quality A or B), then those from raw scan text (quality C); within each group, in the order of the edition.'];
export const aiEv = (T, extra = []) => ({ cs: 'reconstruction', src: 'DNYC-S06', rows: [T], noteMr: g('ai'), note: [...AI_NOTE, ...extra], link: 'discover/themes/' + T });

/** Poems of theme T that may be shown with text: {hi, md, list} (list: high first, A/B before C; each {id, first_line, q, conf}). Totals count all readings. */
export function themePool(ix, T) {
  const hi = [], md = [];
  let tHi = 0, tMd = 0;
  for (const r of ix.rows) {
    const i = r.themes.indexOf(T);
    if (i < 0) continue;
    const cf = (THEME_CONF[r.id] || '')[i];
    if (cf === 'h') tHi++; else if (cf === 'm') tMd++;
    if (!r.has_text) continue;
    if (cf === 'h') hi.push({ ...r, conf: 'h' }); else if (cf === 'm') md.push({ ...r, conf: 'm' });
  }
  const ord = (a) => a.sort((x, y) => (x.q <= 'B' ? 0 : 1) - (y.q <= 'B' ? 0 : 1) || (x.id < y.id ? -1 : 1));
  return { tHi, tMd, list: [...ord(hi), ...ord(md)] };
}
/** The poem's text and details: from the small daily files when it is there (quality A/B), else from its chunk. */
let dailyMap = null;
async function daily() {
  if (!dailyMap) {
    const [a, b] = await Promise.all([getJSON('gatha/daily-1.json'), getJSON('gatha/daily-2.json')]);
    dailyMap = new Map([...a, ...b].map((p) => [p.id, p]));
  }
  return dailyMap;
}
export async function loadPoem(r) {
  if (r.q <= 'B') { const d = (await daily()).get(r.id); if (d) return { id: r.id, text: d.text, q: d.text_quality, basis: d.reading_basis, cs: d.claim_status, seg: null, witnesses: d.witnesses }; }
  const x = await gathaPoem(r.id);
  const p = x?.poem;
  return { id: r.id, text: p?.text?.reading_text || '', q: p?.text?.text_quality || r.q, basis: p?.text?.reading_basis, cs: p?.claim_status, seg: p?.text?.segment_id, witnesses: (p?.witnesses || []).map((w) => w.witness + ':' + w.source_label).join('|') };
}
const CAP = 24;

// ---------- the router ----------
export const title = (ctx) => {
  const [a, b] = ctx.path;
  if (a === 'things') return b ? t('x.garden') : g('things');
  if (a === 'words') return g('words');
  if (TOPICS.includes(a)) return t(a);
  return t('x.garden');
};
export async function render(ctx) {
  const [a, b] = ctx.path;
  if (!a) return home(ctx);
  if (a === 'things') return b ? thing(ctx, b) : cabinet(ctx);
  if (a === 'words') return words(ctx);
  if (TOPICS.includes(a)) return bed(ctx, a);
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(t('x.garden'))}</h1><p><a href="#/garden">${esc(g('back'))}</a></p>`);
}

// ---------- the garden ----------
async function home(ctx) {
  const ix = await gathaIndex();
  const tally = Object.fromEntries(TOPICS.map((T) => [T, 0]));
  for (const r of ix.rows) r.themes.forEach((T, i) => { if ((THEME_CONF[r.id] || '')[i] === 'h') tally[T]++; });
  const maxH = Math.max(...Object.values(tally), 1);
  const step = 104, W = 400, H = 150 + step * 19 + 90;
  const xs = [28, 72, 36, 74, 30, 66, 40, 72, 28, 62, 38, 76, 32, 68, 26, 72, 36, 66, 30, 70];
  const pts = TOPICS.map((T, i) => [xs[i] / 100 * W, 110 + step * i]);
  let d = `M${W / 2} 8 C${W / 2} 40 ${pts[0][0]} 60 ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const my = (pts[i - 1][1] + pts[i][1]) / 2; d += ` C${pts[i - 1][0]} ${my} ${pts[i][0]} ${my} ${pts[i][0]} ${pts[i][1]}`; }
  d += ` C${pts[19][0]} ${pts[19][1] + 50} ${W / 2} ${H - 40} ${W / 2} ${H - 8}`;
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const tufts = Array.from({ length: 46 }, () => { const x = 14 + rnd() * (W - 28), y = 30 + rnd() * (H - 60); return `M${x.toFixed(0)} ${y.toFixed(0)}l-2-5M${x.toFixed(0)} ${y.toFixed(0)}l0-6M${x.toFixed(0)} ${y.toFixed(0)}l2-5`; }).join('');
  const beds = TOPICS.map((T, i) => {
    const size = 3.1 + 2.3 * Math.sqrt(tally[T] / maxH);
    return `<a class="bed" href="${href('garden/' + T)}" style="left:${xs[i]}%;top:${(pts[i][1] / H * 100).toFixed(2)}%" aria-label="${esc(g('bed.aria', { name: t(T), n: num(tally[T]) }))}">` +
      `<span class="soil" style="width:${size.toFixed(2)}rem;height:${size.toFixed(2)}rem">${svg(GL[T], '')}</span><span class="bn">${esc(t(T))}</span><span class="bc">${esc(g('bed.n', { n: num(tally[T]) }))}</span></a>`;
  }).join('');
  const ev = aiEv('T01', ['Counts under each bed: abhangas read with high confidence for that theme (the "probable" ones are not counted here).']);
  ev.rows = ['gatha/index.json', 'modules/discover/pre-themes.js'];
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(t('x.garden'))}</h1>
    <p class="sub">${esc(g('lead'))}</p>
    <p class="ai">${esc(g('ai'))}${mark(ev, { what: g('ai.what') })}</p>
    <div class="gate xrow"><a class="btn" href="${href('garden/' + TOPICS[Math.floor(Math.random() * 20)])}">${esc(g('wander'))}</a></div>
    <div class="plot" style="aspect-ratio:${W} / ${H}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="tuft" d="${tufts}"/><path class="way" d="${d}"/></svg>${beds}</div>
    <div class="xdoors">${door('garden/things', g('things'), g('things.l'))}${door('garden/words', g('words'), g('words.l'))}</div>`);
}

// ---------- one bed: a theme's abhangas, one at a time ----------
async function bed(ctx, T) {
  const ix = await gathaIndex();
  const { tHi, tMd, list } = themePool(ix, T);
  const items = list.slice(0, CAP);
  const k = TOPICS.indexOf(T), nextT = TOPICS[(k + 1) % 20];
  const sum = items.length === 0 ? g('th.none') : (tHi + tMd <= items.length ? g('th.sum1', { n: num(tHi + tMd) }) : g('th.sum', { h: num(tHi), m: num(tMd), k: num(items.length) }));
  ctx.el.innerHTML = page(`<header class="bedhead">${svg(GL[T])}<div><p class="xsmall">${esc(g('theme.of', { i: num(k + 1) }))}</p><h1 tabindex="-1">${esc(t(T))}</h1></div></header>
    <p class="bedsum">${esc(sum)}${mark(aiEv(T), { what: g('th.what') })}</p><div id="gd-pager"></div>`);
  if (!items.length) { ctx.el.querySelector('#gd-pager').innerHTML = endScreen(T, nextT, 0); return; }
  const first = items.slice(0, 6);
  if (first.some((r) => r.q <= 'B')) await daily();
  const screens = items.length + 1;
  const startP = Math.max(0, Math.min(screens - 1, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  ctx.after = () => {
    pager(ctx.el.querySelector('#gd-pager'), {
      count: screens, start: startP, label: g('pager'),
      render: async (i) => {
        if (i >= items.length) return endScreen(T, nextT, tHi + tMd - items.length);
        const html = poemScreen(T, items[i], await loadPoem(items[i]));
        const nx = items[i + 1]; if (nx) loadPoem(nx).catch(() => {});
        return html;
      },
      onChange: (i) => { const want = href('garden/' + T) + (i ? `?p=${i + 1}` : ''); if (location.hash !== want && !location.hash.startsWith(want + '&')) history.replaceState(null, '', want); },
    });
  };
}
function poemScreen(T, r, p) {
  const scan = p.q === 'C' || p.q === 'D';
  const all = lines(p.text), shown = all.slice(0, 8);
  const ev = aiEv(T, [`Poem ${r.id}: reading confidence for this theme: ${r.conf === 'h' ? 'high' : 'medium (shown as probable)'}.`,
    `Text: the 1908 edition (SKH1908), quality ${p.q}${p.basis ? ': ' + p.basis : ''}. ${scan ? 'Raw scan text (OCR): spelling not checked and may contain misreadings.' : 'Collated from more than one print, agreements only.'}`,
    p.witnesses ? `Printed in: ${p.witnesses.replace(/\|/g, '; ')}.` : '']);
  ev.rows = [r.id, p.seg].filter(Boolean); ev.link = 'texts/gatha/' + r.id; ev.cs = p.cs || 'reconstruction'; ev.src = 'DNYC-S06';
  ev.noteMr = g('ai') + (r.conf === 'm' ? ' ' + g('probable.d') : '');
  return `<article class="poem${scan ? ' scan' : ''}"><p class="tags">${r.conf === 'm' ? `<span class="tag-p">${esc(g('probable'))}</span>` : ''}` +
    `<span>${esc(scan ? g('scan') : g('checked'))}</span>${mark(ev, { what: g('poem.what') })}</p>` +
    verse(shown) + (all.length > shown.length ? `<p class="cut">${esc(g('cut'))}</p>` : '') +
    `<p class="acts xrow">${gathaCardOK(p.q) ? `<a href="${href('card', { g: r.id })}">${esc(g('card'))}</a>` : ''}<a href="${href('texts/gatha/' + r.id)}">${esc(g('full'))}</a></p></article>`;
}
function endScreen(T, nextT, more) {
  return `<div class="end poem"><p class="xsmall">${esc(g('end'))}</p>` +
    (more > 0 ? `<p class="xnote"><a href="${href('discover/themes/' + T)}">${esc(g('end.more'))}</a> (${esc(num(more))})</p>` : '') +
    `<div class="xdoors">${door('garden/' + nextT, g('next'), t(nextT))}${door('garden', g('back'), g('lead'))}</div></div>`;
}

// ---------- the cabinet ----------
let matRows = null;
async function mats() { return (matRows ||= await getJSON('words/material_culture.json')); }
const TOOL_NOTE = ['Counts are of lines (segments) in which the term occurs, and include figurative use: most uses in the Dnyaneshwari are similes.',
  'The terms come from a rule-based extraction by the corpus agent (82 terms, 15 categories); the list is not a complete inventory of what the verses name.'];
async function cabinet(ctx) {
  const rows = await mats();
  const by = new Map(rows.map((r) => [r.material_id, r]));
  const L = lang();
  const shelves = SHELVES.map((s) => `<div class="shelf">${s.map((n) => {
    const r = by.get(mid(n));
    return r ? `<a class="obj" href="${href('garden/things/' + r.material_id)}" aria-label="${esc(r.term + ', ' + r.gloss + ', ' + g('things.n', { n: num(r.segment_count) }))}">${svg(OB[n])}<span class="on" lang="mr">${esc(r.term)}</span>` +
      `<span class="og">${esc(L === 'en' ? r.gloss : g('things.n', { n: num(r.segment_count) }))}</span></a>` : '<span></span>';
  }).join('')}</div>`).join('');
  const ev = { cs: 'reconstruction', src: 'DNYC-S06', rows: ['words/material_culture.json'], note: TOOL_NOTE, link: 'discover/things' };
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(g('things'))}</h1><p class="sub">${esc(g('things.lead'))}${mark(ev, { what: g('things.what') })}</p>
    <div class="cab"><svg class="crown gl" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path d="M4 38C20 12 70 4 150 4s130 8 146 34" /><path class="a" d="M150 4V0" /></svg>${shelves}</div>
    <p class="xnote gap">${esc(g('things.gap'))}</p>
    <div class="xdoors">${door('garden', t('x.garden'), g('lead'))}${door('garden/words', g('words'), g('words.l'))}</div>`);
}
const dwSrc = async (ch) => {
  const ix = await getJSON('texts/dnyaneshwari/index.json');
  const d = ix.chapters.find((c) => c.chapter === +ch)?.documents?.[0];
  return d ? { id: d.document_id, title: d.title, url: d.source_url, tier: d.quality_tier, rights: d.rights } : { id: 'DNY' + ch };
};
async function thing(ctx, id) {
  const [rows, mod] = await Promise.all([mats(), import('../discover/pre-things.js').catch(() => ({ EX: {} }))]);
  const r = rows.find((x) => x.material_id === id);
  if (!r) { ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(g('things'))}</h1><p><a href="#/garden/things">${esc(g('cab'))}</a></p>`); return; }
  const n = id.slice(-3), L = lang();
  // rights: Dnyaneshwari chapter 7 and the Amritanubhav (not chapter 1) are first-line-only texts, so their lines are not shown;
  // abhanga lines come from the raw scan text, so only the first lines are shown
  const ex = Object.entries(mod.EX[id] || {}).filter(([, a]) => !(a[1] === 'DW' && +a[2] === 7) && a[1] !== 'AMR').map(([sid, a]) => ({ sid, a }));
  const evC = { cs: r.claim_status || 'reconstruction', src: r.source_id, rows: [r.material_id], note: [...TOOL_NOTE, r.note || ''].filter(Boolean), link: 'discover/things/' + id };
  const order = SHELVES.flat(), pos = order.indexOf(n), nx = order[(pos + 1) % order.length];
  const srcCache = {};
  const lic = `<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>`;
  ctx.el.innerHTML = page(`<header class="objhead">${svg(OB[n] || '')}<div><h1 tabindex="-1" lang="mr">${esc(r.term)}</h1>` +
    `<p class="gloss">${esc(L === 'en' ? r.gloss : t('dc.cat.' + r.category))}</p>` +
    `<p class="xsmall">${esc(g('obj.count', { n: num(r.segment_count) }))}${mark(evC, { what: g('obj.count.what') })}</p></div></header><div id="gd-pager"></div>`);
  if (!ex.length) { ctx.el.querySelector('#gd-pager').innerHTML = `<div class="end"><p class="xnote">${esc(g('obj.none'))}</p><div class="xdoors">${door('garden/things', g('cab'), g('things.lead'))}</div></div>`; return; }
  const fin = `<div class="end poem"><p class="xsmall">${esc(g('obj.end'))}</p><div class="xdoors">${r && OB[nx] ? door('garden/things/' + mid(nx), g('obj.next'), (rows.find((x) => x.material_id === mid(nx)) || {}).term || '') : ''}${door('garden/things', g('cab'), g('things.lead'))}</div></div>`;
  const screen = async (i) => {
    if (i >= ex.length) return fin;
    const { sid, a } = ex[i];
    const kind = a[1];
    let ev, who, body, acts;
    if (kind === 'DW' || kind === 'CP') {
      const s = kind === 'DW' ? (srcCache[a[2]] ||= await dwSrc(a[2])) : { id: 'CP', title: 'Changdev Pasashti (Wikisource)', url: 'https://mr.wikisource.org/', rights: 'Wikisource, CC BY-SA 4.0' };
      ev = { cs: 'editorial testimony', rows: [sid, r.material_id], srcObjs: [s], lic, note: ['Marathi Wikisource transcription; the line was found by the rule-based extraction of everyday things (it is chosen as an example of the term, not as its best use).'], link: kind === 'DW' ? `texts/dnyaneshwari/${a[2]}?seg=${sid}` : `texts/changdev-pasashti?seg=${sid}` };
      who = kind === 'DW' ? g('obj.dw', { ch: num(a[2]), n: num(a[3]) }) : g('obj.cp', { n: num(a[3] || a[2]) });
      body = verse(lines(a[4]));
      acts = `<a href="${kind === 'DW' ? `#/read/${a[2]}?seg=${sid}` : href('texts/changdev-pasashti', { seg: sid })}">${esc(g('obj.read'))}</a><a href="${href('card', { seg: sid })}">${esc(g('card'))}</a>`;
    } else {
      const comp = String(a[0]).split('/').pop();
      const full = /SKH1908/.test(sid);
      const ls = full ? lines(a[4]).slice(0, 4) : [a[2]];
      ev = { cs: 'reconstruction', rows: [sid, r.material_id], src: 'DNYC-S06', note: [`A line of an abhanga (${comp}) found by the extraction of everyday things. ${full ? 'The text is the raw scan text (OCR) of the 1908 edition, first lines only; its spelling is not checked.' : 'Only the first line is shown: this edition is not shown in full.'}`], link: 'texts/gatha/' + comp };
      who = g('obj.gatha') + (full ? ' · ' + g('scan') : ' · ' + g('obj.first'));
      body = verse(ls);
      acts = `<a href="${href('texts/gatha/' + comp)}">${esc(g('full'))}</a>`;   // raw scan text: no card (see gathaCardOK)
    }
    return `<article class="poem${kind === 'G' ? ' scan' : ''}"><p class="tags"><span>${esc(who)}</span>${mark(ev, { what: g('obj.line.what') })}</p>${body}<p class="acts xrow">${acts}</p></article>`;
  };
  ctx.after = () => pager(ctx.el.querySelector('#gd-pager'), { count: ex.length + 1, label: g('obj.pager'), render: screen });
}

// ---------- the portrait of his words ----------
// small connecting words left out: the workshop's list (version 1) plus pronouns, conjunctions and particles that top the raw count
const STOP = ('न तरी तो कां तें हें आणि जें जे ते मग परी जो गा मी तैसें हे ऐसें असे तेथ तेथें तेथे हा नाहीं नाही तया आतां म्हणौनि म्हणोनि जैसा जैसें जैसी तैसा तैसी होय म्हणे ह्मणे पैं कीं काय आहे तंव ना परि जरी ऐसा ऐसी तूं एक मज या जया जेथ जी करी तेणें एथ तैं जेवीं पां असो कांहीं जेणें तेंचि तोचि तुज येणें ठायीं होती ये होये जैं नाना नोहे नव्हे मातें होऊनि कीजे दिसे केलें आघवें माझें माझा माझी तुझा तुझें त्या वो गे ' +
  'तिये जंव कीर आथी एऱ्हवीं तेवीं यया नातरी इये तैसे काई अगा एवं तेचि वरी अथवा येथ तयां एकें इया तिहीं जिये मियां तरि पुढती तियें जैसे हन तुवां पाठीं किंबहुना तेया जया जिया जियें तुम्हीं तेणे जेणे ऐसे तिया ऐसियां तैसियां तया तयाचें').split(/\s+/);
const SET = new Set(STOP);
const aksharas = (w) => (w.match(/[\u0904-\u0939\u0958-\u095F]/g) || []).length;
async function words(ctx) {
  const { PORTRAIT } = await import('../discover/pre-portrait.js');
  const p = PORTRAIT.dw;
  const top = p.top.filter(([w]) => !SET.has(w) && aksharas(w) > 1).slice(0, 36);
  const rowsN = [1, 2, 3, 3, 4, 5, 5, 6, 7];
  const cmax = top[0][1], cmin = top.at(-1)[1];
  const fs = (c) => (1.2 + 2.1 * (Math.sqrt(c) - Math.sqrt(cmin)) / (Math.sqrt(cmax) - Math.sqrt(cmin) || 1)).toFixed(2);
  let k = 0;
  const rowsHtml = rowsN.map((n) => `<div class="prow">${top.slice(k, (k += n)).map(([w, c], j) => {
    const rank = k - n + j;
    return `<button type="button" class="pw ${rank < 3 ? 'c1' : rank < 9 ? 'c2' : ''}" data-w="${esc(w)}" data-c="${c}" lang="mr" style="font-size:${fs(c)}rem" aria-label="${esc(w + ', ' + g('words.n', { n: num(c) }))}">${esc(w)}</button>`;
  }).join('')}</div>`).join('');
  const ev = { cs: 'reconstruction', src: 'DNYC-S06', rows: ['modules/discover/pre-portrait.js'],
    noteMr: `मोजणी ज्ञानेश्वरीच्या विकिस्रोतावरील मजकुराची (${num(p.units)} एकके, ${num(p.tokens)} शब्द) आहे; ७ वा अध्याय वगळला. शब्द लिहिल्याप्रमाणे मोजले; वेगळ्या रूपांचे आकडे वेगळे राहिले आहेत. लहान जोडशब्द (सर्वनामे, अव्यये) वगळले. शब्दाचे क्षेत्रफळ मोजणीइतके.`,
    note: [`Counts of word forms as written, over the Wikisource text of the Dnyaneshwari (${p.units} text units, ${p.tokens} words, ${p.distinct} distinct forms; chapter 7 is not included; ${p.skipped} units skipped).`,
      'Spelling variants and inflected forms are counted separately. Small connecting words (pronouns, conjunctions, particles) are left out of this picture by a list; the first 36 remaining words are shown. The area of a word follows its count (font size grows with the square root of the count).',
      'These are counts only; they say nothing about which words matter most to him.'], link: 'discover/words-portrait' };
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(g('words'))}</h1><p class="sub">${esc(g('words.lead'))}${mark(ev, { what: g('words.what') })}</p>
    <div class="port" role="group" aria-label="${esc(g('words'))}">${rowsHtml}</div>
    <p class="xnote port-foot"><a href="#/discover/words-portrait">${esc(g('words.rest'))}</a></p>
    <div class="xdoors">${door('garden', t('x.garden'), g('lead'))}${door('garden/things', g('things'), g('things.l'))}</div>`);
  let gm = null;
  ctx.el.querySelector('.port').addEventListener('click', async (e) => {
    const b = e.target.closest('.pw'); if (!b) return;
    const w = b.dataset.w, c = +b.dataset.c;
    gm ||= await glossaryMap().catch(() => new Map());
    const m = gm.get(w);
    const mean = m ? `<p class="xsmall">${esc(g('words.mean'))}</p><p lang="mr">${esc(m.mr || '')}</p>${lang() === 'en' && m.en ? `<p lang="en">${esc(m.en)}</p>` : ''}` : '';
    openSheet({ title: w, titleLang: 'mr', html: `<div class="x-garden"><div class="pw-sheet"><p class="big" lang="mr">${esc(w)}</p><p>${esc(g('words.times', { n: num(c) }))}${mark(ev, { what: g('words.what') })}</p>${mean}` +
      `<p><a class="btn" href="${href('search', { q: w })}">${esc(g('words.search'))}</a></p></div></div>` });
  });
}
