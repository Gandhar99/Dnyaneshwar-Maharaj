// Interface labels in Marathi (default) and English. The saint's own words are never translated.
// Feature modules add their own labels with registerLabels('<group>', {mr:{...}, en:{...}}) and must not edit this file.

const KEY = 'dny.lang';
let current = (() => { try { return localStorage.getItem(KEY) || 'mr'; } catch { return 'mr'; } })();
const listeners = new Set();

export const lang = () => current;
export function setLang(l) {
  current = l === 'en' ? 'en' : 'mr';
  try { localStorage.setItem(KEY, current); } catch { /* private mode */ }
  document.documentElement.lang = current;
  listeners.forEach((f) => f(current));
}
export const onLang = (f) => listeners.add(f);

const D = {
  mr: {
    'site.name': 'संत ज्ञानेश्वर',
    'site.full': 'संत ज्ञानेश्वर महाराज',
    'site.tag': 'ग्रंथ, अभंग, चरित्र आणि पुरावे',
    'skip': 'मुख्य मजकुराकडे जा',
    'nav.home': 'मुखपृष्ठ', 'nav.texts': 'ग्रंथ', 'nav.search': 'शोध', 'nav.sections': 'विभाग',
    'nav.menu': 'सर्व विभाग', 'nav.close': 'बंद करा',
    'lang.switch': 'English', 'lang.switch.label': 'Read in English',
    'theme.dark': 'गडद रंगसंगती', 'theme.light': 'फिकट रंगसंगती', 'theme.label': 'रंगसंगती बदला',
    'loading': 'उघडत आहे…', 'error.load': 'हा भाग उघडला नाही. पुन्हा प्रयत्न करा.', 'retry': 'पुन्हा प्रयत्न करा',
    'notfound.title': 'हे पान सापडले नाही', 'notfound.body': 'पत्ता चुकला असावा. मुखपृष्ठावरून पुन्हा सुरुवात करा.',
    'back.home': 'मुखपृष्ठ',
    'en.only': 'ही माहिती सध्या फक्त इंग्रजीत आहे.',
    'provisional': 'तात्पुरती माहिती', 'provisional.title': 'संशोधन चालू आहे; ही नोंद बदलू शकते',
    'source': 'स्रोत', 'sources': 'स्रोत', 'source.open': 'मूळ स्रोत उघडा', 'source.tier': 'दर्जा', 'source.read': 'प्रत्यक्ष काय वाचले',
    'source.unknown': 'या स्रोताची नोंद सापडली नाही.',
    'more': 'आणखी दाखवा', 'less': 'कमी दाखवा', 'all': 'सर्व', 'of': 'पैकी', 'next': 'पुढे', 'prev': 'मागे',
    'stub.title': 'हा विभाग तयार होत आहे',
    'stub.body': 'या विभागाची रचना ठरली आहे; मजकूर लवकरच येईल. तोपर्यंत ग्रंथ आणि अभंग वाचता येतील.',
    'mock': 'नमुना', 'mock.body': 'हा केवळ नमुना आहे: यासाठी लागणारी माहिती किंवा सेवा अजून उपलब्ध नाही.',
    'ws.credit': 'ज्ञानेश्वरी, अमृतानुभव (प्रकरण १) आणि चांगदेव पासष्टी यांच्या ओळी: मराठी विकिस्रोत, CC BY-SA 4.0 परवान्याखाली. पाने:',
    'foot.honest': 'येथील सर्व माहिती तात्पुरती आहे. मतभेद असतील तिथे सर्व मते शेजारी दाखवली आहेत; परंपरा परंपरा म्हणूनच सांगितली आहे.',
    'foot.data': 'माहिती निर्यात', 'foot.ws': 'ज्ञानेश्वरी, अमृतानुभव (प्रकरण १) आणि चांगदेव पासष्टी यांचा मजकूर: मराठी विकिस्रोत, CC BY-SA 4.0.', 'foot.fonts': 'टंक: Tiro Devanagari Marathi, Mukta (SIL OFL)',

    // claim status
    'cs.broadly supported': 'बहुमान्य', 'cs.editorial testimony': 'संपादकीय साक्ष', 'cs.reconstruction': 'पुनर्रचना',
    'cs.disagreement': 'मतभेद', 'cs.devotional tradition': 'भक्तपरंपरा', 'cs.unproven hypothesis': 'अप्रमाणित तर्क',
    'cs.title.broadly supported': 'अनेक स्वतंत्र स्रोत एकच सांगतात', 'cs.title.editorial testimony': 'एखाद्या संपादकाने किंवा ग्रंथाने दिलेली माहिती',
    'cs.title.reconstruction': 'नियम किंवा संगणकीय तुलनेने रचलेली माहिती; व्यक्तीने तपासलेली नाही',
    'cs.title.disagreement': 'स्रोतांमध्ये मतभेद आहेत; सर्व मते दाखवली आहेत',
    'cs.title.devotional tradition': 'भक्तपरंपरेतील कथा किंवा श्रद्धा; ऐतिहासिक दावा नव्हे',
    'cs.title.unproven hypothesis': 'तर्क किंवा अंदाज; पुरावा अपुरा',
    // confirmation
    'conf.confirmed': 'तीन किंवा अधिक स्रोतांत पुष्टी', 'conf.two sources': 'दोन स्रोत', 'conf.single source': 'एकच स्रोत',
    // text quality
    'q.label': 'पाठाचा दर्जा',
    'q.A': 'सर्व शब्द इतर आवृत्त्यांशी जुळतात', 'q.B': 'दहापैकी नऊहून अधिक शब्द जुळतात', 'q.C': 'कच्चा स्कॅन-पाठ; शुद्धलेखन तपासलेले नाही',
    'q.letter.A': 'अ', 'q.letter.B': 'ब', 'q.letter.C': 'क',
    'q.nocheck': 'कोणताही पाठ अजून छापील पानांच्या प्रतिमांशी ताडून पाहिलेला नाही.',
    // witnesses
    'w.SKH1908': 'गाथापंचक (साखरे, १९०८)', 'w.SSV': 'श्रीसकलसंतवाणी (प्रकाशनवर्ष नाही)', 'w.TEL1954': 'सकल संत गाथा (तेलंग, १९५४)',
    'w.short.SKH1908': '१९०८', 'w.short.SSV': 'संतवाणी', 'w.short.TEL1954': '१९५४',
    // groups
    'g.texts': 'ग्रंथ आणि अभंग', 'g.texts.d': 'ज्ञानेश्वरी, अमृतानुभव, चांगदेव पासष्टी, हरिपाठ आणि अभंगांची गाथा',
    'g.life': 'चरित्र आणि स्थळे', 'g.life.d': 'जीवनातील प्रसंग, तिथी, नाती, नकाशा आणि यात्रा',
    'g.calendar': 'तिथी आणि वारी', 'g.calendar.d': 'उत्सवांची तिथी, २०२६ ची पालखी आणि समाधी सोहळा',
    'g.connections': 'संतमेळा', 'g.connections.d': 'कोणता संत कोणाचे नाव घेतो, संवाद आणि गुरुपरंपरा',
    'g.discover': 'विषयवार शोध', 'g.discover.d': 'विषय, देवाची नावे, व्यक्ती, स्थळे आणि रोजच्या जीवनातील वस्तू',
    'g.words': 'शब्द आणि अर्थ', 'g.words.d': 'जुने शब्द, त्यांचे अर्थ आणि "ही ओळ खरोखर माऊलींची आहे का?"',
    'g.evidence': 'पुरावे आणि स्रोत', 'g.evidence.d': 'मतभेद, स्रोतांचा दर्जा, काय शोधले आणि काय सापडले नाही',
    'g.doors': 'वाचकांच्या वाटा', 'g.doors.d': 'विद्यार्थी, मुले आणि कीर्तनकार यांच्यासाठी मार्ग; काही नमुने',
    // home
    'home.mauli': 'माऊली',
    'home.who': 'थोडक्यात',
    'home.lede': 'संत ज्ञानेश्वर महाराजांच्या संजीवन समाधी सोहळ्यानिमित्त आदरपूर्वक अर्पण. येथे ज्ञानेश्वरी, अभंग आणि इतर ग्रंथ मूळ शब्दांत वाचता येतात, आणि त्यांचे चरित्र, स्थळे व वारी पाहता येते; प्रत्येक माहितीसोबत तिचा स्रोत आणि ती किती पक्की आहे हे दिले आहे.',
    'home.honest.note': 'खुणांवर टॅप केल्यास स्रोत दिसतो.',
    'home.daily': 'आजचा अभंग', 'home.daily.same': 'आज सर्वांसाठी हाच अभंग',
    'home.daily.open': 'पूर्ण अभंग आणि माहिती',
    'home.sohala': 'संजीवन समाधी सोहळा, आळंदी',
    'home.sohala.days': '{n} दिवस', 'home.sohala.today': 'आज', 'home.sohala.past': 'या वर्षीचा सोहळा पार पडला',
    'home.sohala.left': 'उरले', 'home.sohala.open': 'सोहळ्याचा कार्यक्रम',
    'home.doors': 'विभाग',
    'home.search': 'ओळ, शब्द किंवा अभंग शोधा',
    // topics (shared themes)
    'T01': 'नामस्मरण', 'T02': 'विठ्ठल आणि पंढरपूर', 'T03': 'गुरू आणि परंपरा', 'T04': 'संतसंग', 'T05': 'विरह आणि ओढ',
    'T06': 'शरणागती आणि कृपा', 'T07': 'आत्मज्ञान आणि अद्वैत', 'T08': 'मन आणि मनोनिग्रह', 'T09': 'देह, मृत्यू आणि क्षणभंगुरता',
    'T10': 'संसार, काम आणि रोजचे जीवन', 'T11': 'जात, सोवळे आणि समाजटीका', 'T12': 'स्त्रीचा स्वर आणि नाती',
    'T13': 'दांभिकता आणि खोटा धर्म', 'T14': 'करुणा आणि नीती', 'T15': 'तीर्थयात्रा आणि वारी', 'T16': 'कृष्णाचे बालपण आणि लीला',
    'T17': 'इतर संतांची स्तुती', 'T18': 'उपदेश', 'T19': 'योग आणि अंतःसाधना', 'T20': 'निसर्ग, ऋतू आणि भूमी',
    // works
    'work.DW01': 'ज्ञानेश्वरी', 'work.DW02': 'अमृतानुभव', 'work.DW03': 'चांगदेव पासष्टी', 'work.DW04': 'हरिपाठ', 'work.DW05': 'अभंगांची गाथा',
    // search
    'search.title': 'शोध', 'search.placeholder': 'उदा. रूप पाहतां लोचनीं', 'search.label': 'शोधायची ओळ किंवा शब्द',
    'search.hint': 'अनुस्वार आणि ऱ्हस्व-दीर्घ यांतील फरक दुर्लक्षित केला जातो: "रुप" शोधल्यास "रूप"ही सापडेल.',
    'search.scope': 'कुठे शोधायचे', 'search.scope.gatha': 'गाथा', 'search.scope.short': 'इतर ग्रंथ', 'search.scope.dw01': 'ज्ञानेश्वरी',
    'search.none': 'काहीही सापडले नाही. शब्द थोडा लहान करून पाहा.', 'search.count': '{n} ठिकाणी सापडले',
    'search.loading': 'ग्रंथ उघडत आहोत: {done} / {total}', 'search.short': 'किमान दोन अक्षरे लिहा.',
    'search.dw01.note': 'ज्ञानेश्वरी मोठी आहे: पहिल्यांदा शोधताना सुमारे २.५ MB माहिती उतरते.',
    'search.incipit': 'फक्त पहिली ओळ (हक्कांमुळे)',
    'search.dw01.lazy': 'ज्ञानेश्वरी अध्यायानुसार उतरते (एकूण सुमारे {mb} MB; एकदा उतरल्यावर पुन्हा लागत नाही).',
    'search.dw01.progress': 'ज्ञानेश्वरी: {done} / {total} अध्याय शोधले', 'search.stop': 'थांबवा',
    'search.stopped': 'शोध थांबवला: ज्ञानेश्वरीचे अध्याय {list} शोधले, बाकीचे नाहीत.',
    'search.firstline': 'या एककाची फक्त पहिली ओळ शोधली (पूर्ण पाठ हक्कांमुळे दाखवलेला नाही).',
  },
  en: {
    'site.name': 'Sant Dnyaneshwar',
    'site.full': 'Sant Dnyaneshwar Maharaj',
    'site.tag': 'Texts, poems, life and evidence',
    'skip': 'Skip to main content',
    'nav.home': 'Home', 'nav.texts': 'Texts', 'nav.search': 'Search', 'nav.sections': 'Sections',
    'nav.menu': 'All sections', 'nav.close': 'Close',
    'lang.switch': 'मराठी', 'lang.switch.label': 'मराठीत वाचा',
    'theme.dark': 'Dark', 'theme.light': 'Light', 'theme.label': 'Change colour scheme',
    'loading': 'Loading…', 'error.load': 'This part did not load. Please try again.', 'retry': 'Try again',
    'notfound.title': 'Page not found', 'notfound.body': 'The address may be wrong. Start again from the home page.',
    'back.home': 'Home',
    'en.only': '',
    'provisional': 'Provisional', 'provisional.title': 'Research in progress; this record may change',
    'source': 'Source', 'sources': 'Sources', 'source.open': 'Open the source', 'source.tier': 'Quality tier', 'source.read': 'What was actually read',
    'source.unknown': 'No record for this source.',
    'more': 'Show more', 'less': 'Show less', 'all': 'All', 'of': 'of', 'next': 'Next', 'prev': 'Previous',
    'stub.title': 'This section is being built',
    'stub.body': 'Its plan is settled and its content is coming. Meanwhile the texts and poems are open to read.',
    'mock': 'Preview', 'mock.body': 'This is only a preview: the data or service it needs does not exist yet.',
    'ws.credit': 'Lines of the Dnyaneshwari, Amritanubhav (chapter 1) and Changdev Pasashti: Marathi Wikisource, under CC BY-SA 4.0. Pages:',
    'foot.honest': 'Everything here is provisional. Where sources disagree, every position is shown side by side; tradition is labelled as tradition.',
    'foot.data': 'Data export', 'foot.ws': 'Text of the Dnyaneshwari, Amritanubhav (chapter 1) and Changdev Pasashti: Marathi Wikisource, CC BY-SA 4.0.', 'foot.fonts': 'Fonts: Tiro Devanagari Marathi, Mukta (SIL OFL)',

    'cs.broadly supported': 'Broadly supported', 'cs.editorial testimony': 'Editorial testimony', 'cs.reconstruction': 'Reconstruction',
    'cs.disagreement': 'Disagreement', 'cs.devotional tradition': 'Devotional tradition', 'cs.unproven hypothesis': 'Unproven hypothesis',
    'cs.title.broadly supported': 'Several independent sources agree', 'cs.title.editorial testimony': 'Stated by one editor or work',
    'cs.title.reconstruction': 'Built by rule or machine comparison; not checked by a person',
    'cs.title.disagreement': 'Sources disagree; every position is shown',
    'cs.title.devotional tradition': 'A story or belief of the devotional tradition, not a historical claim',
    'cs.title.unproven hypothesis': 'A conjecture; evidence is insufficient',
    'conf.confirmed': 'Confirmed by three or more sources', 'conf.two sources': 'Two sources', 'conf.single source': 'Single source',
    'q.label': 'Text quality',
    'q.A': 'Every word agrees with the other editions', 'q.B': 'More than nine words in ten agree', 'q.C': 'Raw scan text, not proofread',
    'q.letter.A': 'A', 'q.letter.B': 'B', 'q.letter.C': 'C',
    'q.nocheck': 'No text has yet been checked against images of the printed pages.',
    'w.SKH1908': 'Gathapanchak (Sakhare, 1908)', 'w.SSV': 'Sakalsantvani (undated)', 'w.TEL1954': 'Sakal Sant Gatha (Telang, 1954)',
    'w.short.SKH1908': '1908', 'w.short.SSV': 'Santvani', 'w.short.TEL1954': '1954',
    'g.texts': 'Texts', 'g.texts.d': 'Dnyaneshwari, Amritanubhav, Changdev Pasashti, Haripath and the gatha of abhangas',
    'g.life': 'Life and places', 'g.life.d': 'Episodes, dates, relationships, a map and journeys',
    'g.calendar': 'Calendar and wari', 'g.calendar.d': 'Observance tithis, the 2026 palkhi and the samadhi sohala',
    'g.connections': 'Circle of saints', 'g.connections.d': 'Who names whom, dialogues and the guru lineage',
    'g.discover': 'Discover', 'g.discover.d': 'Themes, names of God, people, places and things of daily life',
    'g.words': 'Words', 'g.words.d': 'Old words, their meanings, and "is this line really his?"',
    'g.evidence': 'Evidence', 'g.evidence.d': 'Disputes, source quality, what was searched and not found',
    'g.doors': 'Ways in', 'g.doors.d': 'Paths for students, children and kirtankars; some previews',
    'home.mauli': 'Mauli',
    'home.who': 'In brief',
    'home.lede': 'Offered with reverence for the Sanjeevan Samadhi Sohala of Sant Dnyaneshwar Maharaj. Read the Dnyaneshwari, the abhangas and his other works in their own words, and see his life, his places and the wari; every fact comes with its source and how firm it is.',
    'home.honest.note': 'Tap a mark to see its source.',
    'home.daily': "Today's abhanga", 'home.daily.same': 'The same abhanga for everyone today',
    'home.daily.open': 'Full poem and details',
    'home.sohala': 'Sanjeevan Samadhi Sohala, Alandi',
    'home.sohala.days': '{n} days', 'home.sohala.today': 'Today', 'home.sohala.past': "This year's sohala is over",
    'home.sohala.left': 'to go', 'home.sohala.open': 'The sohala programme',
    'home.doors': 'Sections',
    'home.search': 'Search a line, word or poem',
    'T01': 'The Name of God', 'T02': 'Vitthal and Pandharpur', 'T03': 'Guru and lineage', 'T04': 'Company of saints',
    'T05': 'Longing and separation', 'T06': 'Surrender and grace', 'T07': 'Self-knowledge and non-duality',
    'T08': 'The mind and its discipline', 'T09': 'Body, death and impermanence', 'T10': 'Household, work and daily life',
    'T11': 'Caste, purity and social critique', "T12": "Women's voice and kinship", 'T13': 'Hypocrisy and false religion',
    'T14': 'Compassion and ethics', 'T15': 'Pilgrimage and the wari', "T16": "Krishna's childhood and play",
    'T17': 'Praise of other saints', 'T18': 'Instruction and counsel', 'T19': 'Yoga and inner practice', 'T20': 'Nature, seasons and the land',
    'work.DW01': 'Dnyaneshwari', 'work.DW02': 'Amritanubhav', 'work.DW03': 'Changdev Pasashti', 'work.DW04': 'Haripath', 'work.DW05': 'Gatha of abhangas',
    'search.title': 'Search', 'search.placeholder': 'e.g. रूप पाहतां लोचनीं', 'search.label': 'Line or word to search',
    'search.hint': 'Anusvara and short/long vowel differences are ignored: रुप also finds रूप. Type in Devanagari.',
    'search.scope': 'Where to search', 'search.scope.gatha': 'Gatha', 'search.scope.short': 'Other works', 'search.scope.dw01': 'Dnyaneshwari',
    'search.none': 'Nothing found. Try a shorter word.', 'search.count': 'Found in {n} places',
    'search.loading': 'Opening texts: {done} / {total}', 'search.short': 'Type at least two letters.',
    'search.dw01.note': 'The Dnyaneshwari is large: the first search downloads about 2.5 MB.',
    'search.incipit': 'First line only (rights)',
    'search.dw01.lazy': 'The Dnyaneshwari downloads chapter by chapter (about {mb} MB in all; only once).',
    'search.dw01.progress': 'Dnyaneshwari: {done} of {total} chapters searched', 'search.stop': 'Stop',
    'search.stopped': 'Search stopped: Dnyaneshwari chapters {list} searched, the rest not.',
    'search.firstline': 'Only the first line of this unit was searched (full text held back for rights).',
  },
};

/** Translate a key. Missing Marathi falls back to English and is logged once (so it can be fixed). */
const missing = new Set();
export function t(key, vars) {
  let s = D[current][key];
  if (s === undefined) {
    s = D.en[key];
    if (!missing.has(key)) { missing.add(key); console.warn('[i18n] missing', current, key); }
  }
  if (s === undefined) s = key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  return s;
}
export const has = (key) => D[current][key] !== undefined;

/** Feature modules register their own labels under a namespace: t('life.title'). */
export function registerLabels(ns, dict) {
  for (const l of ['mr', 'en']) for (const [k, v] of Object.entries(dict[l] || {})) D[l][`${ns}.${k}`] = v;
}
export const missingKeys = () => [...missing];
