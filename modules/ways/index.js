// K. Doors. Routes: #/ways (three doors), #/ways/children (four story cards), #/ways/kirtan[?t=T07] (a working helper that makes a printable
// sheet for a theme), #/ways/students[?walk=birth|dating] (questions the evidence can and cannot answer; two disputes walked as two paths).
// Data: life.json (events DNYL-V005, V006, V011, V012; disputes), evidence.json (coverage rows), gatha/index.json + pre-themes.js (via module garden),
// links/topics.json + Dnyaneshwari chapter files (supporting ovis), words/material_culture.json + discover/pre-things.js (everyday images).
// One file: labels, CSS and code. The print rules are inside the style block (@media print).
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, gathaIndex } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, pager, door, journey, attachJourney, reducedMotion } from '../../assets/js/experience.js';
import { TOPICS, themePool, loadPoem, aiEv } from '../garden/index.js';
import { LABELS as DC_LABELS } from '../discover/labels.js';
registerLabels('dc', DC_LABELS);

registerLabels('wy', {
  mr: {
    'lead': 'तीन वाटा: मुलांसाठी गोष्टी, कीर्तनकारांसाठी पत्रक, विद्यार्थ्यांसाठी प्रश्न.',
    'c.t': 'मुलांसाठी', 'c.l': 'चार गोष्टी, चित्रांसह; परंपरेतल्या.',
    'k.t': 'कीर्तनकारांसाठी', 'k.l': 'विषय निवडा; अभंग, ओव्या आणि रोजच्या वस्तूंचे छापता येणारे पत्रक मिळवा.',
    's.t': 'विद्यार्थ्यांसाठी', 's.l': 'पुरावा कशाचे उत्तर देतो आणि कशाचे नाही; एक वाद दोन वाटांनी.',
    'c.sub': 'या गोष्टी परंपरेत सांगितल्या जातात. चित्रांत माऊली काढलेले नाहीत.', 'c.pager': 'गोष्टी', 'c.what': 'ही गोष्ट कोठे सांगितली आहे',
    'c.end': 'गोष्टी येथे संपल्या. मोठ्यांसाठी माऊलींचा जीवनप्रवास वाचा.', 'c.more': 'प्रवास', 'c.more.l': 'गोदावरीकाठापासून इंद्रायणीपर्यंत',
    'c.read': 'पासष्टी वाचा',
    'k.sub': 'विषय निवडा. अभंग, आधाराच्या ओव्या आणि रोजच्या वस्तू एका पत्रकात जमतील; ते छापा किंवा मजकूर म्हणून उचला.',
    'k.theme': 'विषय', 'k.pick': 'विषय निवडा', 'k.count': 'अभंग', 'k.make': 'पत्रक बनवा', 'k.again': 'दुसरे सुचवा', 'k.print': 'छापा', 'k.copy': 'मजकूर कॉपी करा',
    'k.copied': 'कॉपी झाले.', 'k.copyfail': 'कॉपी करता आले नाही; खालील मजकूर निवडून कॉपी करा.', 'k.text': 'मजकूर म्हणून',
    'k.title': 'कीर्तन-पत्रक', 'k.sh.ab': 'अभंग', 'k.sh.ov': 'आधाराच्या ओव्या', 'k.sh.im': 'या ओळींतील रोजच्या वस्तू',
    'k.ab.what': 'या अभंगांची निवड', 'k.ov.what': 'या ओव्यांची निवड', 'k.im.what': 'वस्तू कशा शोधल्या',
    'k.scan': 'स्कॅन-पाठ; गाण्यापूर्वी तपासा', 'k.ab.src': 'गाथापंचक (साखरे, १९०८), अभंग {n}', 'k.ab.src0': 'गाथापंचक (साखरे, १९०८)',
    'k.ov.src': 'ज्ञानेश्वरी, अध्याय {ch}, ओवी {n}', 'k.keep': 'पत्रकात ठेवा',
    'k.none.ab': 'या विषयाचा दाखवता येईल असा अभंग मिळाला नाही.', 'k.none.ov': 'या विषयाच्या ओव्या मिळाल्या नाहीत.', 'k.none.im': 'या ओळींत मोजलेल्या वस्तूंची नावे आढळली नाहीत.',
    'k.loading': 'पत्रक जमवत आहे…', 'k.noprint': 'या ब्राउझरमध्ये छापता येत नाही; खालील मजकूर कॉपी करा.',
    'k.foot.ab': 'अभंग: गाथापंचक (साखरे, १९०८). विषयांची जुळणी एका संगणकी वाचनाची आहे; माणसाने तपासलेली नाही.',
    'k.foot.ov': 'ओव्या: मराठी विकिस्रोत (CC BY-SA 4.0). ओव्यांची विषयाशी जुळणी शब्दशोधाच्या नियमाने केली आहे; ती चुकीची असू शकते. प्रत्येक अध्यायातून एक ओवी.',
    'k.foot.im': 'वस्तू: संशोधनात मोजलेल्या ८२ शब्दांपैकी, वरील ओळींत आढळलेले.', 'k.foot.site': 'संत ज्ञानेश्वर महाराज: संकेतस्थळ',
    'k.tag.abh': 'अभंग', 'k.tag.ovi': 'ओवी', 'k.found': 'आढळले: {where}', 'k.dev': 'पत्रकातील निवड फक्त या उपकरणावर बनते; काहीही साठवले जात नाही.',
    's.sub': 'काही प्रश्नांचे उत्तर पुरावा देतो, काहींचे देत नाही. येथे दोन्ही सांगितले आहे.', 's.pager': 'प्रश्न',
    's.says': 'पुरावा काय सांगतो', 's.cannot': 'पुरावा काय सांगत नाही', 's.walk': 'हा वाद दोन वाटांनी चाला', 's.full': 'पूर्ण नोंद कार्यशाळेत', 's.sky': 'तारखांची गणिते',
    's.v.open': 'वाद मिटलेला नाही', 's.v.part': 'काही भाग सांगता येतो', 's.v.trad': 'ही परंपरेची नोंद आहे; निवाडा येथे केलेला नाही',
    's.what.says': 'या विधानाचे स्रोत', 's.what.cannot': 'ही मर्यादा', 's.back': 'प्रश्नांकडे परत', 's.end': 'प्रश्न येथे संपले.',
    's.walk.q': 'प्रश्न', 's.walk.have': 'आपल्याकडे काय आहे', 's.walk.fork': 'येथे वाट दुभंगते', 's.walk.end': 'हे येथे अनिर्णित राहते', 's.pathA': 'पहिली वाट', 's.pathB': 'दुसरी वाट',
  },
  en: {
    'lead': 'Three ways in: stories for children, a sheet for kirtankars, questions for students.',
    'c.t': 'For children', 'c.l': 'Four stories with pictures, from tradition.',
    'k.t': 'For kirtankars', 'k.l': 'Choose a theme; get a printable sheet of abhangas, ovis and everyday things.',
    's.t': 'For students', 's.l': 'What the evidence can and cannot answer; one dispute walked as two paths.',
    'c.sub': 'These stories are told in tradition. The saint is not drawn in the pictures.', 'c.pager': 'Stories', 'c.what': 'where this story is told',
    'c.end': 'The stories end here. For grown-ups, read his life as a journey.', 'c.more': 'The journey', 'c.more.l': 'From the Godavari to the Indrayani',
    'c.read': 'Read the Pasashti',
    'k.sub': 'Choose a theme. Abhangas, supporting ovis and everyday things gather into one sheet; print it or take it as text.',
    'k.theme': 'Theme', 'k.pick': 'Choose a theme', 'k.count': 'Abhangas', 'k.make': 'Make the sheet', 'k.again': 'Suggest others', 'k.print': 'Print', 'k.copy': 'Copy as text',
    'k.copied': 'Copied.', 'k.copyfail': 'Could not copy; select the text below and copy it.', 'k.text': 'As text',
    'k.title': 'Kirtan sheet', 'k.sh.ab': 'Abhangas', 'k.sh.ov': 'Supporting ovis', 'k.sh.im': 'Everyday things in these lines',
    'k.ab.what': 'how these abhangas were chosen', 'k.ov.what': 'how these ovis were chosen', 'k.im.what': 'how the things were found',
    'k.scan': 'Scan text: check before singing', 'k.ab.src': 'Gathapanchak (Sakhare, 1908), abhanga {n}', 'k.ab.src0': 'Gathapanchak (Sakhare, 1908)',
    'k.ov.src': 'Dnyaneshwari, chapter {ch}, ovi {n}', 'k.keep': 'Keep in the sheet',
    'k.none.ab': 'No abhanga that may be shown was found for this theme.', 'k.none.ov': 'No ovis were found for this theme.', 'k.none.im': 'No counted things were found named in these lines.',
    'k.loading': 'Gathering the sheet…', 'k.noprint': 'Printing is not available in this browser; copy the text below.',
    'k.foot.ab': 'Abhangas: Gathapanchak (Sakhare, 1908). The match to themes is one computer reading; no person has checked it.',
    'k.foot.ov': 'Ovis: Marathi Wikisource (CC BY-SA 4.0). The match of ovis to a theme is by word-search rules and may be wrong. One ovi from each chapter.',
    'k.foot.im': 'Things: from the 82 words counted by the research, those found in the lines above.', 'k.foot.site': 'Sant Dnyaneshwar Maharaj: the website',
    'k.tag.abh': 'Abhanga', 'k.tag.ovi': 'Ovi', 'k.found': 'found in: {where}', 'k.dev': 'The choices stay on this device; nothing is stored.',
    's.sub': 'Some questions the evidence answers; some it does not. Both are said here.', 's.pager': 'Questions',
    's.says': 'What the evidence says', 's.cannot': 'What it does not say', 's.walk': 'Walk this dispute as two paths', 's.full': 'The full record in the workshop', 's.sky': 'The date computations',
    's.v.open': 'The dispute is not settled', 's.v.part': 'Part of it can be said', 's.v.trad': 'A record of tradition; no verdict here',
    's.what.says': 'sources of this statement', 's.what.cannot': 'this limit', 's.back': 'Back to the questions', 's.end': 'The questions end here.',
    's.walk.q': 'The question', 's.walk.have': 'What we have', 's.walk.fork': 'The path divides here', 's.walk.end': 'Where it stays open', 's.pathA': 'First path', 's.pathB': 'Second path',
  },
});
const w = (k, v) => t('wy.' + k, v);
const L2 = (o) => (lang() === 'en' ? o.en : o.mr);

const CSS = `
.x-ways { max-width: 40rem; margin: 0 auto; padding: var(--sp-4) var(--sp-4) var(--sp-6); }
.x-ways h1 { font-size: var(--s-3); margin: 0 0 var(--sp-1); line-height: 1.25; }
.x-ways .sub { color: var(--ink-2); margin: 0 0 var(--sp-4); line-height: 1.6; }
.x-ways svg.dr { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; display: block; width: 100%; height: auto; color: var(--maroon); }
.x-ways .dr .a { stroke: var(--saffron); } .x-ways .dr .f { fill: var(--saffron-soft); stroke: none; } .x-ways .dr .g { stroke: var(--ink-3); opacity: .6; }
.x-ways .three { display: grid; gap: var(--sp-4); margin-top: var(--sp-4); }
.x-ways .wdoor { display: grid; grid-template-columns: 5.2rem 1fr; gap: var(--sp-4); align-items: center; padding: var(--sp-4); text-decoration: none; color: var(--ink);
  border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--paper-3); box-shadow: var(--shadow); }
.x-ways .wdoor:hover { border-color: var(--maroon); } .x-ways .wdoor:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.x-ways .wdoor svg { width: 5.2rem; height: 5.2rem; fill: none; stroke: var(--maroon); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.x-ways .wdoor .a { stroke: var(--saffron); } .x-ways .wdoor .wt { font-family: var(--f-text); font-size: var(--s-2); display: block; }
.x-ways .wdoor .wl { color: var(--ink-2); font-size: var(--s--1); line-height: 1.5; display: block; margin-top: .2rem; }
/* children */
.x-ways .story { padding: var(--sp-2) 0 var(--sp-3); }
.x-ways .story .pic svg { max-height: 12.5rem; }
.x-ways .story .pic { border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--paper-3); padding: var(--sp-2); }
.x-ways .story h2 { font-family: var(--f-text); font-size: var(--s-2); font-weight: 400; margin: var(--sp-4) 0 var(--sp-2); line-height: 1.3; }
.x-ways .story p.tx { font-family: var(--f-text); font-size: clamp(1.15rem, 4.6vw, 1.4rem); line-height: 1.85; margin: 0 0 var(--sp-3); }
.x-ways .wall-move { animation: wy-wall 3.2s .5s cubic-bezier(.4, 0, .2, 1) both; }
@keyframes wy-wall { from { transform: translateX(-26px); } to { transform: translateX(0); } }
.x-ways .end { padding: var(--sp-5) 0; }
/* kirtan */
.x-ways .ctl { display: grid; gap: var(--sp-3); margin: var(--sp-4) 0; }
.x-ways .ctl label { font-size: var(--s--1); color: var(--ink-2); display: grid; gap: .25rem; }
.x-ways .ctl select { font: inherit; font-size: var(--s-0); padding: .7rem .6rem; min-height: 2.9rem; border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--paper-3); color: var(--ink); width: 100%; }
.x-ways .seg3 { display: flex; gap: var(--sp-2); }
.x-ways .seg3 button { flex: 1; min-height: 2.75rem; border: 1px solid var(--rule); background: var(--paper-3); color: var(--ink); border-radius: var(--r-2); font: inherit; cursor: pointer; }
.x-ways .seg3 button[aria-pressed="true"] { border-color: var(--maroon); background: var(--maroon-soft); color: var(--maroon); }
.x-ways .acts { display: flex; flex-wrap: wrap; gap: var(--sp-2) var(--sp-3); margin: var(--sp-3) 0; }
.x-ways .ksheet { background: var(--paper-3); border: 1px solid var(--rule); border-radius: var(--r-2); padding: var(--sp-4); box-shadow: var(--shadow); margin-top: var(--sp-4); }
.x-ways .ksheet h2 { font-family: var(--f-text); font-size: var(--s-3); font-weight: 400; margin: 0; }
.x-ways .ksheet .kt { color: var(--ink-3); font-size: var(--s--1); margin: .1rem 0 var(--sp-3); }
.x-ways .ksheet h3 { font-size: var(--s-1); margin: var(--sp-5) 0 var(--sp-2); border-bottom: 1px solid var(--rule); padding-bottom: .2rem; }
.x-ways .kitem { margin: 0 0 var(--sp-4); }
.x-ways .kitem .kvs { font-family: var(--f-text); font-size: 1.2rem; line-height: 1.8; margin: 0; }
.x-ways .kitem .kvs span.ln { display: block; white-space: normal; overflow-wrap: anywhere; }
.x-ways .ksheet, .x-ways .kitem { min-width: 0; }
.x-ways .kitem .ks { font-size: var(--s--1); color: var(--ink-3); margin: .15rem 0 0; }
.x-ways .kitem .ks .warn { color: var(--warn); }
.x-ways .kitem label.keep { font-size: var(--s--1); color: var(--ink-2); display: inline-flex; gap: .4rem; align-items: center; min-height: 2rem; }
.x-ways .kitem.off .kvs, .x-ways .kitem.off .ks { opacity: .4; text-decoration: line-through; }
.x-ways .kimg { margin: 0 0 var(--sp-2); font-size: var(--s-0); }
.x-ways .kfoot { font-size: .8rem; color: var(--ink-2); line-height: 1.55; border-top: 1px solid var(--rule); margin-top: var(--sp-5); padding-top: var(--sp-3); }
.x-ways textarea.ktext { width: 100%; min-height: 12rem; font: inherit; font-size: var(--s--1); padding: var(--sp-3); border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--paper); color: var(--ink); }
/* students */
.x-ways .qs { min-height: calc(var(--screen-h) - 10rem); padding: var(--sp-3) 0; display: flex; flex-direction: column; justify-content: center; }
.x-ways .qs .q { font-family: var(--f-text); font-size: var(--s-3); line-height: 1.35; margin: 0 0 var(--sp-4); }
.x-ways .qs .blk { border-left: 3px solid var(--rule); padding: .1rem 0 .1rem var(--sp-3); margin: 0 0 var(--sp-3); }
.x-ways .qs .blk.says { border-color: var(--ok); } .x-ways .qs .blk.cannot { border-color: var(--doubt); }
.x-ways .qs .blk h3 { font-size: var(--s--1); margin: 0 0 .2rem; color: var(--ink-3); font-weight: 600; }
.x-ways .qs .blk p { margin: 0; line-height: 1.7; }
.x-ways .qs .verdict { font-family: var(--f-text); color: var(--maroon); font-size: var(--s-1); margin: var(--sp-2) 0; }
.x-ways .wk .vq { font-family: var(--f-text); font-size: var(--s-2); margin: var(--sp-3) 0; }
.x-ways .wk .xbig { font-size: clamp(1.15rem, 4.8vw, 1.5rem); margin: var(--sp-3) 0; }
.x-ways .wk p { line-height: 1.7; }
@media print {
  @page { margin: 14mm; }
  :root, html, body { color-scheme: light !important; background: #fff !important; color: #000 !important; }
  body > :not(main), .wband { display: none !important; }
  main .x-ways *:not(.ksheet):not(.ksheet *):not(:has(.ksheet)) { display: none !important; }
  main, .x-ways { padding: 0 !important; margin: 0 !important; min-height: 0 !important; max-width: none !important; }
  .x-ways .ksheet { position: static; width: 100%; box-sizing: border-box; border: 0; box-shadow: none; background: #fff; color: #000; padding: 0; margin: 0; }
  .x-ways .ksheet * { color: #000 !important; background: transparent !important; }
  .x-ways .ksheet .noprint, .x-ways .ksheet .evm, .x-ways .ksheet label.keep { display: none !important; visibility: hidden; }
  .x-ways .kitem.off { display: none; }
  .x-ways .kitem { break-inside: avoid; }
  .x-ways .ksheet h3 { color: #000; border-color: #000; } .x-ways .ksheet .ks, .x-ways .ksheet .kt, .x-ways .ksheet .kfoot { color: #222; }
}
@media (prefers-reduced-motion: reduce) { .x-ways .wall-move { animation: none; } }
`;
const page = (inner) => `<style>${CSS}</style><div class="x-ways">${inner}</div>`;
const dr = (inner, vb = '0 0 200 150', label = '') => `<svg class="dr" viewBox="${vb}" role="img" aria-label="${esc(label)}">${inner}</svg>`;

// ---------- drawn pictures (no person is drawn) ----------
const PIC = {
  wall: dr('<path class="g" d="M0 128H200M10 134h40M140 136h50"/><g class="wall-move"><path d="M42 128V78h116v50M42 78h116M42 98h116M42 118h116M70 78v20M100 98v20M130 78v20M85 98v20M115 78v20M145 98v20M58 98v20M72 118v10"/><path class="a" d="M52 70h96" stroke-dasharray="2 6"/></g><path class="a" d="M168 100l18 0M178 92l8 8-8 8"/><path class="a" d="M166 118l18 0" opacity=".5"/><path class="g" d="M30 128c-6 0-8-8-2-10M18 128c-5 0-6-6-1-8"/>', '0 0 200 150', 'a wall'),
  tiger: dr('<path class="g" d="M0 128H200"/><path d="M40 106c0-18 14-30 40-30h42c14 0 24 8 26 22l8 6-8 4c-2 10-8 16-16 18l-4 8H112l-2-10H86l-2 10H66l-2-12c-12-2-24-6-24-16z"/><path class="a" d="M70 78l4 22M88 76l2 26M108 76l2 24M126 80l-2 18M52 96l12 2"/><path d="M150 86l8-10 4 10M156 98l6 2M40 106c-10 0-16 8-16 18"/><circle class="a" cx="100" cy="56" r="6"/><path class="a" d="M92 76c0-8 4-14 8-14s8 6 8 14z"/><path class="g" d="M170 40v30M162 50h16" opacity=".6"/>', '0 0 200 150', 'a tiger with a rider seen from behind'),
  buffalo: dr('<path class="g" d="M0 128H200"/><path d="M52 112c-2-22 10-38 34-38h46c14 0 22 8 22 22v16M52 112c0 8 4 14 10 14l2 10H78l2-10M126 112l2 10 2 14H146l-2-14"/><path d="M154 92c10 0 18 4 20 12M168 96c8 4 10 10 6 16M154 84c-10-14-24-14-30-4"/><path class="a" d="M130 80c-6-10-2-22 8-28M140 78c-2-10 6-22 18-26"/><path d="M52 104c-12 0-18 10-14 22"/><path class="a" d="M30 56h30M30 66h22M30 76h26" opacity=".7"/>', '0 0 200 150', 'a buffalo'),
  bread: dr('<path class="g" d="M0 134H200"/><ellipse cx="100" cy="72" rx="62" ry="14"/><path d="M38 72v6c0 8 28 14 62 14s62-6 62-14v-6"/><ellipse class="a" cx="100" cy="68" rx="40" ry="8"/><path d="M168 76h26"/><path class="a" d="M70 100c-4 10 4 14 0 24M100 102c-4 10 4 14 0 24M130 100c-4 10 4 14 0 24"/><path class="a" d="M88 56c-3-6 3-10 0-16M112 56c-3-6 3-10 0-16" opacity=".7"/>', '0 0 200 150', 'a griddle over a fire with a round bread'),
};
const EMB = {
  c: '<path d="M8 40h40M10 40V24h36v16M10 32h36M20 24v8M30 32v8M40 24v8"/><path class="a" d="M16 18h24M34 12l6 6-6 6"/>',
  k: '<circle cx="20" cy="34" r="11"/><circle cx="36" cy="34" r="11"/><circle class="a" cx="20" cy="34" r="2.6"/><circle class="a" cx="36" cy="34" r="2.6"/><path d="M20 23C20 6 36 6 36 23"/>',
  s: '<path d="M8 38h40M8 38V22c8-4 14-4 20 0 6-4 12-4 20 0v16M28 22v16"/><path class="a" d="M28 20c-5-5-2-10 0-16 2 6 5 11 0 16z"/>',
};

export const title = (ctx) => ({ children: w('c.t'), kirtan: w('k.t'), students: w('s.t') }[ctx.path[0]] || t('x.ways'));
export async function render(ctx) {
  const [a] = ctx.path;
  if (!a) return home(ctx);
  if (a === 'children') return children(ctx);
  if (a === 'kirtan') return kirtan(ctx);
  if (a === 'students') return students(ctx);
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(t('x.ways'))}</h1><p><a href="#/ways">${esc(t('x.ways'))}</a></p>`);
}
function home(ctx) {
  const d = (r, k) => `<a class="wdoor" href="${href('ways/' + r)}"><svg viewBox="0 0 56 56" aria-hidden="true">${EMB[k]}</svg><span><span class="wt">${esc(w(k + '.t'))}</span><span class="wl">${esc(w(k + '.l'))}</span></span></a>`;
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(t('x.ways'))}</h1><p class="sub">${esc(w('lead'))}</p><div class="three">${d('children', 'c')}${d('kirtan', 'k')}${d('students', 's')}</div>`);
}

// ---------- children ----------
const STORIES = [
  { ev: 'DNYL-V005', also: 'DNYL-V006', pic: 'buffalo',
    mr: { h: 'वेद बोलणारा रेडा', s: ['परंपरा सांगते, पैठणच्या पंडितांसमोर एका रेड्याच्या मुखातून वेदाचे शब्द आले.', 'महिपतींनी सांगितलेल्या कथेत, एक माणूस त्या रेड्याला मारत होता. माऊलींनी त्याला थांबवले आणि रेड्याच्या डोक्यावर हात ठेवला.', 'रेड्याचे वेद ऐकून पंडित थक्क झाले.', 'पुढे आळंदीच्या वाटेवरच्या एका रानात त्या रेड्याने देह ठेवला, आणि तेथे त्याची समाधी आहे, असेही सांगितले जाते.'] },
    en: { h: 'The buffalo who spoke the Veda', s: ['Tradition holds that before the scholars of Paithan, words of the Veda came from the mouth of a buffalo.', 'In Mahipati\'s telling, a man was beating the buffalo. Mauli stopped him and touched the buffalo\'s head.', 'The scholars were astonished to hear the buffalo recite.', 'Later, it is also said, the buffalo died in a forest on the road to Alandi, and it has a samadhi there.'] },
    note: 'A buffalo (named Dnyana in Namdev\'s account, per the entry) is made to speak Vedic words, convincing the Paithan scholars; Mahipati\'s retelling has Dnyaneshwar object to a man beating a buffalo, then touch its head. Its end: said to have died in a forest on the way to Alandi and to have a samadhi (entry citing no text by name). "Stopped him" renders "object to".' },
  { ev: 'DNYL-V011', pic: 'tiger', go: ['texts/changdev-pasashti', 'c.read'],
    mr: { h: 'वाघावर बसून आलेले चांगदेव', s: ['परंपरा सांगते, चांगदेव नावाचे एक खूप वयस्कर योगी होते.', 'त्यांनी आधी माऊलींना एक कोरे पत्र पाठवले.', 'मग ते वाघावर बसून माऊलींकडे आले, असे सांगितले जाते.', 'माऊलींनी त्या कोऱ्या पत्राला पासष्ट ओव्यांत उत्तर दिले. ती चांगदेव पासष्टी आजही वाचता येते.'] },
    en: { h: 'Changdev on the tiger', s: ['Tradition holds that Changdev was a very old yogi.', 'First he sent Mauli a blank letter.', 'Then, it is said, he came to Mauli riding a tiger.', 'Mauli answered the blank letter in sixty-five ovis. That answer, the Changdev Pasashti, can still be read today.'] },
    note: 'Changdev came on a tiger after sending a blank letter; Dnyaneshwar replied in sixty-five ovis (the Changdev Pasashti, which is on this site). The tiger is not in the Pasashti text; it comes from Mahipati as cited by the entry.' },
  { ev: 'DNYL-V011', pic: 'wall',
    mr: { h: 'चालणारी भिंत', s: ['परंपरा सांगते, चांगदेव आले तेव्हा माऊली आणि त्यांची भावंडे एका भिंतीवर बसली होती.', 'आणि काय आश्चर्य! ती भिंत हळूहळू पुढे चालू लागली.', 'हे पाहून चांगदेव नम्र झाले.', 'त्यांनी मुक्ताबाईंकडून उपदेश घेतला.'] },
    en: { h: 'The wall that moved', s: ['Tradition holds that when Changdev came, Mauli and his brothers and sister were sitting on a wall.', 'And what a wonder: the wall began to move slowly forward.', 'Seeing this, Changdev yielded.', 'He took instruction from Muktabai.'] },
    note: 'The wall and the tiger are not in the Pasashti text itself; the entry takes them from Mahipati (1762-1774), and the earliest narrator is not identified. Changdev yielded and took initiation from Muktabai (as the entry has it).' },
  { ev: 'DNYL-V012', pic: 'bread',
    mr: { h: 'पाठीवरचे मांडे', s: ['परंपरा सांगते, आळंदीच्या विसोबा चाटी यांनी कुंभारांना भांडी देऊ नका, असे सांगून ठेवले होते.', 'एके दिवशी निवृत्तीनाथांना मांडे खावेसे वाटले.', 'तेव्हा माऊलींनी आपली पाठ तापवली, आणि मुक्ताबाईंनी त्यांच्या पाठीवर मांडे भाजले.', 'हे पाहून विसोबांना पश्चात्ताप झाला. पुढे ते विसोबा खेचर म्हणून ओळखले गेले, आणि नामदेवांचे गुरू झाले.'] },
    en: { h: 'Mande baked on his back', s: ['Tradition holds that Visoba Chati of Alandi had told the potters to give no vessels.', 'One day Nivruttinath wished for mande, the thin bread of the story.', 'Then Mauli heated his back, and Muktabai baked the mande on it.', 'Seeing this, Visoba repented. He came to be known as Visoba Khechar, and later became Namdev\'s guru.'] },
    note: 'A Brahmin of Alandi, Visoba Chati, made the potters refuse vessels. When Nivruttinath wanted bread, Dnyaneshwar heated his back and Muktabai baked it. Visoba repented and was called Khechar; he later became Namdev\'s guru. Earliest narrator not identified. (The entry says "bread"; मांडे is the word by which the Marathi tradition tells this story. The word is not in the entry.)' },
];
async function children(ctx) {
  const L = await getJSON('life.json');
  const ev = new Map(L.events.map((e) => [e.event_id, e]));
  const evOf = (s) => {
    const ids = [s.ev, s.also].filter(Boolean), rows = ids.map((i) => ev.get(i)).filter(Boolean);
    return { cs: 'devotional tradition', src: [...new Set(rows.map((r) => r.source_id))], rows: ids, note: [...rows.map((r) => `${r.title}: ${r.summary}`), s.note], link: 'life/events/' + s.ev };
  };
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(w('c.t'))}</h1><p class="sub">${esc(w('c.sub'))}</p><div id="wy-pager"></div>`);
  ctx.after = () => pager(ctx.el.querySelector('#wy-pager'), {
    count: STORIES.length + 1, label: w('c.pager'),
    render: (i) => {
      if (i >= STORIES.length) return `<div class="end"><p class="tx" style="font-family:var(--f-text);font-size:1.2rem;line-height:1.8">${esc(w('c.end'))}</p><div class="xdoors">${door('journey', w('c.more'), w('c.more.l'))}</div></div>`;
      const s = STORIES[i], x = L2(s);
      const go = s.go ? `<p class="xrow"><a href="${href(s.go[0])}">${esc(w(s.go[1]))}</a></p>` : '';
      return `<article class="story"><div class="pic">${PIC[s.pic]}</div><h2>${esc(x.h)}</h2>` +
        x.s.map((l, k) => `<p class="tx">${esc(l)}${k === x.s.length - 1 ? mark(evOf(s), { what: w('c.what') }) : ''}</p>`).join('') + go + `</article>`;
    },
  });
}

// ---------- kirtankars ----------
const DEV = /[ऀ-ॿ]/;
let dwIndex = null;
async function dwPart(seg) {
  dwIndex ||= await getJSON('texts/dnyaneshwari/index.json');
  const ch = +seg.slice(3, 5);
  const c = dwIndex.chapters.find((x) => x.chapter === ch);
  const p = c?.parts.find((q) => seg >= q.first && seg <= q.last);
  return p ? { ch, file: p.file } : null;
}
async function pickOvis(T, shuffle, k = 5) {
  const lt = await getJSON('links/topics.json');
  const ids = (lt[T] || []).filter((x) => /^DNY\d\d_/.test(x) && !/^DNY07/.test(x));   // chapter 7 is held back to first lines
  const byCh = new Map();
  ids.forEach((x) => { const c = x.slice(3, 5); (byCh.get(c) || byCh.set(c, []).get(c)).push(x); });
  let chs = [...byCh.keys()].sort();
  if (chs.length > k) chs = Array.from({ length: k }, (_, i) => chs[Math.floor(i * chs.length / k)]);
  const out = [];
  for (const c of chs) {
    const list = byCh.get(c).slice();
    const start = shuffle ? Math.floor(Math.random() * list.length) : 0;
    for (let j = 0; j < list.length && j < 6; j++) {
      const seg = list[(start + j) % list.length];
      const pt = await dwPart(seg); if (!pt) continue;
      const it = (await getJSON(pt.file)).items.find((q) => q.id === seg);
      if (it && it.k === 'o' && it.t) { out.push({ seg, ch: pt.ch, n: it.n, text: it.t }); break; }
    }
  }
  return { out, total: ids.length };
}
const termRe = (term) => new RegExp(`(?<![\\u0900-\\u097F])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\u0915-\\u0939\\u094D])`);
const flat = (s) => s.replace(/\s+/g, ' ');
const skhNo = (wit) => { const m = /SKH1908:([^|]+)/.exec(wit || ''); return m ? m[1] : ''; };

async function kirtan(ctx) {
  const ix = await gathaIndex();
  const st = { T: TOPICS.includes(ctx.query.get('t')) ? ctx.query.get('t') : '', n: 5, model: null, off: new Set() };
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(w('k.t'))}</h1><p class="sub">${esc(w('k.sub'))}</p>
    <div class="ctl"><label>${esc(w('k.theme'))}<select id="ky-t"><option value="">${esc(w('k.pick'))}</option>${TOPICS.map((T) => `<option value="${T}"${T === st.T ? ' selected' : ''}>${esc(t(T))}</option>`).join('')}</select></label>
      <div><span class="xsmall">${esc(w('k.count'))}</span><div class="seg3" id="ky-n">${[3, 5, 7].map((n) => `<button type="button" data-n="${n}" aria-pressed="${n === st.n}">${esc(num(n))}</button>`).join('')}</div></div></div>
    <div id="ky-out" aria-live="polite"></div><p class="xnote">${esc(w('k.dev'))}</p>`);
  const out = ctx.el.querySelector('#ky-out');
  const sel = ctx.el.querySelector('#ky-t');
  let token = 0;
  async function build(shuffle) {
    if (!st.T) { out.innerHTML = ''; return; }
    const my = ++token;
    out.innerHTML = `<p class="loading" role="status">${esc(w('k.loading'))}</p>`;
    const pool = themePool(ix, st.T);
    let cands = pool.list.slice(0, 40);
    if (shuffle) cands = cands.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const pick = cands.slice(0, st.n);
    const abh = await Promise.all(pick.map(async (r) => ({ r, p: await loadPoem(r) })));
    const ov = await pickOvis(st.T, shuffle);
    if (my !== token) return;
    // everyday things named in the chosen lines (whole-word match on the counted terms)
    const mats = await getJSON('words/material_culture.json');
    const places = [
      ...abh.map((a, i) => ({ where: `${w('k.tag.abh')} ${num(i + 1)}`, text: flat(a.p.text || '') })),
      ...ov.out.map((o, i) => ({ where: `${w('k.tag.ovi')} ${num(i + 1)}`, text: flat(o.text) })),
    ];
    const imgs = [];
    for (const m of mats) { const re = termRe(m.term); const hit = places.filter((p) => re.test(p.text)).map((p) => p.where); if (hit.length) imgs.push({ m, where: hit.join(', ') }); }
    st.model = { T: st.T, abh, ov, imgs: imgs.slice(0, 8), pool, ovTotal: ov.total };
    st.off = new Set();
    paint();
  }
  function paint() {
    const M = st.model; if (!M) return;
    const abEv = aiEv(M.T, [`The sheet takes the first ${st.n} abhangas of this bed in the order described, or a random set when "suggest others" is used. Only abhangas whose text may be shown (1908 edition) are used.`]);
    abEv.link = 'discover/themes/' + M.T;
    const ovEv = { cs: 'reconstruction', src: 'DNYC-S06', rows: [M.T, ...M.ov.out.map((o) => o.seg)], link: 'discover/themes/' + M.T,
      note: [`Ovis are matched to themes by a word-search rule over the text (links/topics.json): ${M.ovTotal} ovis (chapter 7 left out) carry this theme. The rule is noisy and often wrong.`, 'The sheet takes one ovi from each of up to five chapters spread along the work (a random one in each when "suggest others" is used).', 'Text: Marathi Wikisource, CC BY-SA 4.0.'] };
    const imEv = { cs: 'reconstruction', src: 'DNYC-S06', rows: M.imgs.map((i) => i.m.material_id), link: 'discover/things',
      note: ['Everyday things are the 82 terms counted by the research (words/material_culture.json), found in the lines above by whole-word match. Inflected forms may be missed.', 'Counts of these terms include figurative use.'] };
    const abHtml = M.abh.length ? M.abh.map(({ r, p }, i) => {
      const scan = p.q === 'C' || p.q === 'D', no = skhNo(p.witnesses), key = 'a' + i;
      return `<div class="kitem${st.off.has(key) ? ' off' : ''}" data-k="${key}"><p class="kvs" lang="mr">${lines(p.text).map((l) => `<span class="ln">${esc(keepDandas(l.replace(/\s*[०-९0-9]+\s*[।|]\s*$/, ' ।')))}</span>`).join('')}</p>` +
        `<p class="ks">${esc(no ? w('k.ab.src', { n: no }) : w('k.ab.src0'))}${r.conf === 'm' ? ' · ' + esc(t('gd.probable')) : ''}${scan ? ` · <span class="warn">${esc(w('k.scan'))}</span>` : ''}</p>` +
        `<label class="keep noprint"><input type="checkbox" data-keep="${key}"${st.off.has(key) ? '' : ' checked'}> ${esc(w('k.keep'))}</label></div>`;
    }).join('') : `<p class="xnote">${esc(w('k.none.ab'))}</p>`;
    const ovHtml = M.ov.out.length ? M.ov.out.map((o, i) => {
      const key = 'o' + i;
      return `<div class="kitem${st.off.has(key) ? ' off' : ''}" data-k="${key}"><p class="kvs" lang="mr">${lines(o.text).map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('')}</p>` +
        `<p class="ks">${esc(w('k.ov.src', { ch: num(o.ch), n: num(o.n) }))}</p><label class="keep noprint"><input type="checkbox" data-keep="${key}"${st.off.has(key) ? '' : ' checked'}> ${esc(w('k.keep'))}</label></div>`;
    }).join('') : `<p class="xnote">${esc(w('k.none.ov'))}</p>`;
    const imHtml = M.imgs.length ? M.imgs.map((i) => `<p class="kimg"><span lang="mr"><b>${esc(i.m.term)}</b></span> · ${esc(lang() === 'en' ? i.m.gloss : t('dc.cat.' + i.m.category))} <span class="xsmall">(${esc(w('k.found', { where: i.where }))})</span></p>`).join('') : `<p class="xnote">${esc(w('k.none.im'))}</p>`;
    out.innerHTML = `<div class="acts"><button type="button" class="btn" id="ky-again">${esc(w('k.again'))}</button>${typeof window.print === 'function' ? `<button type="button" class="btn" id="ky-print">${esc(w('k.print'))}</button>` : ''}<button type="button" class="btn" id="ky-copy">${esc(w('k.copy'))}</button></div><p class="xnote" id="ky-msg" role="status"></p>
      <article class="ksheet"><h2>${esc(w('k.title'))}: ${esc(t(M.T))}</h2><p class="kt">${esc(w('k.foot.site'))}</p>
      <h3>${esc(w('k.sh.ab'))}${mark(abEv, { what: w('k.ab.what') })}</h3>${abHtml}
      <h3>${esc(w('k.sh.ov'))}${mark(ovEv, { what: w('k.ov.what') })}</h3>${ovHtml}
      <h3>${esc(w('k.sh.im'))}${mark(imEv, { what: w('k.im.what') })}</h3>${imHtml}
      <div class="kfoot"><p>${esc(w('k.foot.ab'))}</p><p>${esc(w('k.foot.ov'))}</p><p>${esc(w('k.foot.im'))}</p></div></article>
      <h2 class="xsmall" style="margin-top:1.5rem">${esc(w('k.text'))}</h2><textarea class="ktext" id="ky-text" readonly lang="mr">${esc(sheetText())}</textarea>`;
  }
  const lines = (s) => String(s || '').split('\n').map((l) => l.trim()).filter(Boolean);
  function sheetText() {
    const M = st.model, o = [`${w('k.title')}: ${t(M.T)}`, ''];
    o.push(w('k.sh.ab').toUpperCase());
    M.abh.forEach(({ r, p }, i) => { if (st.off.has('a' + i)) return; const no = skhNo(p.witnesses); o.push(lines(p.text).join('\n'), `(${no ? w('k.ab.src', { n: no }) : w('k.ab.src0')}${p.q === 'C' ? '; ' + w('k.scan') : ''})`, ''); });
    o.push(w('k.sh.ov').toUpperCase());
    M.ov.out.forEach((x, i) => { if (st.off.has('o' + i)) return; o.push(lines(x.text).join('\n'), `(${w('k.ov.src', { ch: x.ch, n: x.n })})`, ''); });
    o.push(w('k.sh.im').toUpperCase());
    M.imgs.forEach((i) => o.push(`${i.m.term}: ${lang() === 'en' ? i.m.gloss : t('dc.cat.' + i.m.category)} (${w('k.found', { where: i.where })})`));
    o.push('', w('k.foot.ab'), w('k.foot.ov'), w('k.foot.im'));
    return o.join('\n');
  }
  sel.addEventListener('change', () => { st.T = sel.value; history.replaceState(null, '', href('ways/kirtan', st.T ? { t: st.T } : undefined)); build(false); });
  ctx.el.querySelector('#ky-n').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-n]'); if (!b) return;
    st.n = +b.dataset.n; ctx.el.querySelectorAll('#ky-n button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); build(false);
  });
  out.addEventListener('change', (e) => {
    const c = e.target.closest('[data-keep]'); if (!c) return;
    if (c.checked) st.off.delete(c.dataset.keep); else st.off.add(c.dataset.keep);
    c.closest('.kitem').classList.toggle('off', !c.checked);
    out.querySelector('#ky-text').value = sheetText();
  });
  out.addEventListener('click', async (e) => {
    const id = e.target.closest('button')?.id;
    if (id === 'ky-again') build(true);
    else if (id === 'ky-print') { try { window.print(); } catch { out.querySelector('#ky-msg').textContent = w('k.noprint'); } }
    else if (id === 'ky-copy') {
      const ta = out.querySelector('#ky-text'), msg = out.querySelector('#ky-msg');
      try { await navigator.clipboard.writeText(ta.value); msg.textContent = w('k.copied'); }
      catch { ta.focus(); ta.select(); msg.textContent = w('k.copyfail'); }
    }
  });
  if (st.T) build(false);
}

// ---------- students ----------
let LIFE = null;
const disp = (ids) => LIFE.disputes.filter((d) => ids.includes(d.dispute_id));
const evD = (ids, extra = []) => { const rows = disp(ids); return { cs: 'disagreement', src: [...new Set(rows.map((r) => r.source_id))], rows: ids,
  note: [...rows.map((d) => `${d.question}: ${d.position}. Proponents: ${d.proponents}.${d.current_view_if_stated ? ' ' + d.current_view_if_stated + '.' : ''}`), ...extra], link: 'evidence/disputes' }; };
const evG = (ids, ...extra) => ({ cs: 'editorial testimony', rows: ids, note: extra, link: 'evidence/coverage' });
const QS = [
  { id: 'birth', walk: 'birth', v: 'open', ids: ['DNYL-Q001', 'DNYL-Q002'],
    mr: { q: 'माऊलींचा जन्म कोणत्या वर्षी झाला?', says: 'मराठी विश्वकोश १२७१ आणि १२७५ ही दोन्ही वर्षे देतो. मराठी विकिपीडिया १२७५ (शके ११९७) सांगते.', cannot: 'या दोन वर्षांतून एक निवडणारा पुरावा आमच्याकडे नाही; विश्वकोशाची नोंदही निवड करत नाही.' },
    en: { q: 'In which year was he born?', says: 'The Marathi Vishwakosh gives both 1271 and 1275. Marathi Wikipedia says 1275 (Shaka 1197).', cannot: 'We hold no evidence that chooses between the two years; the Vishwakosh entry itself does not choose.' } },
  { id: 'place', v: 'open', ids: ['DNYL-Q003', 'DNYL-Q004'],
    mr: { q: 'त्यांचा जन्म कोठे झाला: आपेगाव की आळंदी?', says: 'विश्वकोश आणि विकिपीडिया आपेगाव (पैठण तालुका) हे कुटुंबाचे घर आणि जन्मस्थान मानतात; ब्रिटानिका आळंदी म्हणते.', cannot: 'विश्वकोश स्वतःच म्हणतो की उपलब्ध पाठ जन्मस्थान सांगत नाही. म्हणून हा प्रश्न येथे सुटत नाही.' },
    en: { q: 'Where was he born: Apegaon or Alandi?', says: 'The Vishwakosh and Wikipedia take Apegaon (Paithan taluka) as the family home and birthplace; Britannica says Alandi.', cannot: 'The Vishwakosh itself says the received text does not name his birthplace. So the question is not settled here.' } },
  { id: 'dating', walk: 'dating', v: 'open', ids: ['DNYL-Q008', 'DNYL-Q009'],
    mr: { q: 'ज्ञानेश्वरी कधी लिहिली गेली?', says: 'शेवटच्या अध्यायात ‘शके बाराशतें बारोत्तरें’ ही ओळ आहे. काही अभ्यासक ती माऊलींचीच मानतात; दुसऱ्या मते ती सोळाव्या शतकात एकनाथांनी घातली.', cannot: 'ती ओळ कोणाची, हे ठरवणारा निर्णायक पुरावा आमच्याकडे नाही. एकनाथांपूर्वीची भरवशाची प्रत माहीत नाही, असे विश्वकोश म्हणतो.' },
    en: { q: 'When was the Dnyaneshwari composed?', says: 'The last chapter has the line "Shaka twelve hundred and twelve". Some scholars take it as his own; another view is that Eknath added it in the sixteenth century.', cannot: 'We hold no decisive evidence on whose line it is. The Vishwakosh says no reliable manuscript earlier than Eknath is known.' } },
  { id: 'abhanga', v: 'part', ids: ['DNYL-Q005', 'DNYL-Q006'],
    mr: { q: 'सर्व अभंग त्यांचेच आहेत का?', says: 'मराठी विश्वकोश म्हणतो की बरेच अभंग त्यांचे नसावेत; योगविषयक अभंग, गौळणी, विराण्या आणि हरिपाठ त्यांच्या शैलीशी जोडले जातात.', cannot: 'संपूर्ण अभंग-गाथेची सत्यता आम्ही तपासलेली नाही; ती येथे गृहीतही धरलेली नाही.' },
    en: { q: 'Are all the abhangas his?', says: 'The Marathi Vishwakosh says many abhangas are probably not his; the yoga abhangas, gaulan, virani and the Haripath are linked to his style.', cannot: 'We have not authenticated the whole abhanga gatha, and do not assume it.' }, g: ['G06'] },
  { id: 'samadhi', v: 'open', ids: ['DNYL-Q017'], sky: true,
    mr: { q: 'समाधी कोणत्या वर्षी आणि कोणत्या वारी झाली?', says: 'शके १२१८ (विश्वकोश, मराठी विकिपीडियाचा मजकूर) की १२१७ (विकिपीडियाची माहितीपेटी), आणि गुरुवार की रविवार, यावर स्रोतांत मतभेद आहे.', cannot: 'कोणत्याही स्रोताने आपली तारीख पंचांगाशी ताडून दिलेली नाही. या संकेतस्थळाचे खगोलगणित (आकाश आणि तिथी) दोन पद्धतींनी दोन वेगळे दिवस देते, आणि कोणत्याही पद्धतीत त्रयोदशी गुरुवारी येत नाही. ते गणित आहे, निवाडा नव्हे.' },
    en: { q: 'In which year, and on which weekday, was the samadhi?', says: 'Sources differ: Shaka 1218 (Vishwakosh, body of Marathi Wikipedia) or 1217 (its infobox), and Thursday or Sunday.', cannot: 'No source gives its date as checked against an almanac. This site\'s computation (Sky and dates) gives two different days under two methods, and in neither does the Trayodashi fall on a Thursday. That is a computation, not a verdict.' } },
  { id: 'miracle', v: 'trad', ids: ['DNYL-Q018'], g: ['G11'],
    mr: { q: 'रेडा, भिंत आणि पुनरुज्जीवन या कथा खऱ्या घडल्या का?', says: 'विश्वकोश या कथांना संतचरित्रातील कथा मानतो; Dallmayr यांचे वाचन प्रतीकात्मक आहे: पैठणमध्ये भावंडांनी आपल्या वर्तनाने आणि शिकवणीने पंडितांना पटवले.', cannot: 'चमत्कारांचा निवाडा करणे या संशोधनाचे काम नव्हते. म्हणून या कथा येथे परंपरा म्हणून सांगितल्या आहेत.' },
    en: { q: 'Did the buffalo, the wall and the revival really happen?', says: 'The Vishwakosh treats these as stories of a saint\'s life (hagiography); Dallmayr reads them symbolically: at Paithan the siblings persuaded the scholars by conduct and teaching.', cannot: 'Judging miracles was not the work of this research. So the stories are told here as tradition.' } },
  { id: 'namdev', v: 'open', ids: ['DNYL-Q013'],
    mr: { q: 'नामदेवांनी माऊलींचे चरित्र प्रत्यक्ष पाहून लिहिले का?', says: 'ब्रिटानिका म्हणते की नामदेवांचे अभंग माऊलींच्या जीवनाची सर्वात जुनी कथा देतात. वारकरी परंपरा नामदेवांचा काळ १२७२ ते १३५० मानते.', cannot: 'पण अनेक अभ्यासक म्हणतात की नामदेव माऊलींचे समकालीन असू शकत नव्हते; समाधी-आख्यानाची सर्वात जुनी हस्तलिखित प्रत १५८१ ची आहे.' },
    en: { q: 'Did Namdev write of him as an eyewitness?', says: 'Britannica says Namdev\'s poems give the oldest account of his life. The Varkari tradition dates Namdev 1272 to 1350.', cannot: 'But many scholars hold that Namdev could not have overlapped with Dnyaneshwar; the oldest manuscript of the samadhi cycle is dated 1581.' } },
];
async function students(ctx) {
  LIFE ||= await getJSON('life.json');
  const walk = ctx.query.get('walk');
  if (walk === 'birth' || walk === 'dating') return walkPage(ctx, walk);
  const cov = (await getJSON('evidence/evidence.json')).coverage;
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(w('s.t'))}</h1><p class="sub">${esc(w('s.sub'))}</p><div id="wy-pager"></div>`);
  ctx.after = () => pager(ctx.el.querySelector('#wy-pager'), {
    count: QS.length + 1, label: w('s.pager'),
    render: (i) => {
      if (i >= QS.length) return `<div class="end"><p class="xsmall">${esc(w('s.end'))}</p><div class="xdoors">${door('evidence/disputes', w('s.full'), '')}${door('sky', w('s.sky'), t('x.sky.d'))}</div></div>`;
      const q = QS[i], x = L2(q);
      const gs = (q.g || []).map((id) => cov.find((c) => c.gap_id === id)).filter(Boolean);
      const evS = evD(q.ids), evC = gs.length ? evG(gs.map((c) => c.gap_id), ...gs.map((c) => `${c.area}: ${c.limitation}. Next step: ${c.next_step}`)) : evD(q.ids, ['What it cannot say is a limit of the sources listed: none settles the question.']);
      return `<article class="qs"><h2 class="q">${esc(x.q)}</h2>
        <div class="blk says"><h3>${esc(w('s.says'))}</h3><p>${esc(x.says)}${mark(evS, { what: w('s.what.says') })}</p></div>
        <div class="blk cannot"><h3>${esc(w('s.cannot'))}</h3><p>${esc(x.cannot)}${mark(evC, { what: w('s.what.cannot') })}</p></div>
        <p class="verdict">${esc(w('s.v.' + q.v))}</p>
        <p class="xrow">${q.walk ? `<a class="btn" href="${href('ways/students', { walk: q.walk })}">${esc(w('s.walk'))}</a>` : ''}${q.sky ? `<a href="#/sky">${esc(w('s.sky'))}</a>` : ''}<a href="#/evidence/disputes">${esc(w('s.full'))}</a></p></article>`;
    },
  });
}

// one dispute as a journey with a fork: two paths
const LICENCE = `<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>`;
async function walkPage(ctx, key) {
  const q = QS.find((x) => x.id === key), x = L2(q), en = lang() === 'en';
  let st;
  if (key === 'birth') {
    st = [
      { id: 'q', title: w('s.walk.q'), body: `<p class="vq">${esc(x.q)}</p>` },
      { id: 'have', title: w('s.walk.have'), mark: mark(evD(['DNYL-Q001', 'DNYL-Q002']), { what: w('s.what.says') }),
        body: `<p>${esc(en ? 'We have no document of his own that gives a birth year. What we have are reference works, and they give two years.' : 'माऊलींच्या स्वतःच्या कोणत्याही लेखात जन्मवर्ष मिळत नाही. आपल्याकडे संदर्भग्रंथ आहेत, आणि ते दोन वर्षे देतात.')}</p>` },
      { id: 'fork', title: w('s.walk.fork'),
        fork: { note: en ? 'Two years, two sets of backers.' : 'दोन वर्षे, दोन बाजू.', paths: [
          { title: '१२७५ (शके ११९७)', mark: mark(evD(['DNYL-Q001']), { what: w('s.what.says') }), body: `<p>${esc(en ? 'Ranade (1933, as cited), Marathi Wikipedia and the Vishwakosh list it. English Wikipedia calls it the more accepted tradition. Marathi Wikipedia\'s infobox adds a day: 22 August 1275.' : 'रानडे (१९३३, संदर्भानुसार), मराठी विकिपीडिया आणि विश्वकोश हे वर्ष देतात. इंग्रजी विकिपीडिया याला अधिक मान्य परंपरा म्हणते. मराठी विकिपीडियाची माहितीपेटी दिवसही देते: २२ ऑगस्ट १२७५.')}</p>` },
          { title: '१२७१', mark: mark(evD(['DNYL-Q002']), { what: w('s.what.says') }), body: `<p>${esc(en ? 'Pradhan and Lambert (1987) and Ranade pp. 31-32, as cited in English Wikipedia; the Vishwakosh lists it too.' : 'प्रधान आणि लॅम्बर्ट (१९८७) आणि रानडे (पृ. ३१-३२), इंग्रजी विकिपीडियातील संदर्भानुसार; विश्वकोशही हे वर्ष देतो.')}</p>` },
        ] } },
      { id: 'open', title: w('s.walk.end'), body: `<p>${esc(x.cannot)}</p><p><a href="#/life/dates">${esc(w('s.full'))}</a></p>` },
    ];
  } else {
    st = [
      { id: 'q', title: w('s.walk.q'), body: `<p class="vq">${esc(x.q)}</p>` },
      { id: 'have', title: w('s.walk.have'), mark: mark({ cs: 'editorial testimony', rows: ['DNY18_1890', 'DNY18_1891'], src: 'S084', lic: LICENCE, note: ['Marathi Wikisource, Dnyaneshwari chapter 18, closing verses: the verse naming Shaka 1212 (ovi 1811) and the colophon in which Eknath says he made the Gita-Dnyaneshwari pure again in Shaka 1506.'], link: 'texts/dnyaneshwari/18?seg=DNY18_1890' }, { what: w('s.what.says') }),
        body: `<p>${esc(en ? 'Two closing lines of the Dnyaneshwari are on the page. The first names Shaka 1212; the second is Eknath\'s own colophon (Shaka 1506).' : 'ज्ञानेश्वरीच्या शेवटच्या अध्यायात दोन ओळी आहेत. पहिली शके १२१२ सांगते; दुसरी एकनाथांची स्वतःची समाप्ती-ओळ (शके १५०६) आहे.')}</p>
          <p class="xbig" lang="mr"><span class="ln"><span class="h">शके बाराशतें बारोत्तरें । तैं टीका केली ज्ञानेश्वरें ।</span></span><span class="ln"><span class="h">सच्चिदानंदबाबा आदरें । लेखकु जाहला ॥ १८११ ॥</span></span></p>
          <p class="xbig" lang="mr"><span class="ln"><span class="h">श्रीशके पंधराशें साहोत्तरीं । तारणनामसंवत्सरीं ।</span></span><span class="ln"><span class="h">एकाजनार्दनें अत्यादरीं । गीता-ज्ञानेश्वरी प्रतिशुद्ध केली ॥</span></span></p>
          <p class="xsmall">${esc(en ? 'Text: Marathi Wikisource, ' : 'पाठ: मराठी विकिस्रोत, ')}${LICENCE}</p>` },
      { id: 'fork', title: w('s.walk.fork'),
        fork: { note: en ? 'Whose line is the Shaka 1212 verse?' : 'शके १२१२ ची ओळ कोणाची?', paths: [
          { title: en ? 'His own' : 'माऊलींचीच', mark: mark(evD(['DNYL-Q008']), { what: w('s.what.says') }), body: `<p>${esc(en ? 'Doderet (1927) took the verse as his own and drew the year 1290 from it. English Wikipedia says the date is undisputed.' : 'Doderet (१९२७) यांनी ती ओळ माऊलींचीच मानून तिच्यावरून १२९० हे वर्ष काढले. इंग्रजी विकिपीडिया म्हणते की ही तारीख वादातीत आहे.')}</p>` },
          { title: en ? 'Added by Eknath' : 'एकनाथांनी घातली', mark: mark(evD(['DNYL-Q009']), { what: w('s.what.says') }), body: `<p>${esc(en ? 'Kiehnle (as reported by McLaughlin) argues the verse was added by Eknath in the sixteenth century; even so, the text still falls in the reign of Ramachandra (1271-1309). This is not a settled view.' : 'Kiehnle (McLaughlin यांच्या वृत्तानुसार) म्हणतात की ती ओळ सोळाव्या शतकात एकनाथांनी घातली. तरीही ग्रंथ रामचंद्रदेवाच्या राजवटीत (१२७१-१३०९) येतो. हे मत निर्णायक नाही.')}</p>` },
        ] } },
      { id: 'open', title: w('s.walk.end'), mark: mark(evD(['DNYL-Q011'], ['A Marathi Manuscript Centre record labels one manuscript Shaka 1212; that is the cataloguer\'s label.']), { what: w('s.what.cannot') }),
        body: `<p>${esc(x.cannot)}</p><p>${esc(en ? 'A manuscript catalogue labels one copy Shaka 1212 and notes that it lacks Eknath\'s closing verses; that is the cataloguer\'s view, not a dated colophon.' : 'एका हस्तलिखित-सूचीत एक प्रत शके १२१२ ची म्हटली आहे आणि तिच्यात एकनाथांच्या शेवटच्या ओव्या नाहीत असे नोंदवले आहे; ते सूचीकाराचे मत आहे, तारीख असलेली समाप्ती नव्हे.')}</p><p><a href="#/evidence/disputes">${esc(w('s.full'))}</a></p>` },
    ];
  }
  ctx.el.innerHTML = page(`<h1 tabindex="-1">${esc(x.q)}</h1><div class="wk">${journey(st, { label: x.q })}</div><p class="xrow" style="margin-top:2rem"><a href="${href('ways/students')}">${esc(w('s.back'))}</a></p>`);
  ctx.after = () => { attachJourney(ctx.el); ctx.el.querySelectorAll('.st-h').forEach((b) => b.click()); };
}
