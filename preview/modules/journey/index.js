// E. Life as a river journey. Route: #/journey (optional ?s=<station id>, e.g. DNYL-V015, birthplace, birthyear).
// Data: life.json (events, disputes), connections/narrated_by_others-1.json (incipits, loaded when a station opens),
// samadhi.json (opening lines of Namdev's samadhi cycle, loaded when the samadhi station opens),
// texts/dnyaneshwari/ch18-4.json and texts/changdev-pasashti.json (Wikisource lines, loaded on demand).
// The path is the river: four reaches (Godavari, Nevasa, Bhima at Pandharpur, Indrayani at Alandi) and a last one
// for the later centuries. One station opens at a time in place; the disputed points are forks, both paths can be walked.
// The Marathi tellings and titles are written by hand from the event rows, each exactly as strong as its row.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, journey, attachJourney, voices, photo, photosReady, door, reveal, reducedMotion } from '../../assets/js/experience.js';

registerLabels('jr', {
  mr: {
    'title': 'गोदावरी ते इंद्रायणी',
    'sub': 'माऊलींचे जीवन एका नदीप्रवासासारखे वाचा: गोदावरीकाठचे आपेगाव आणि पैठण, नेवासे, भीमाकाठचे पंढरपूर, आणि इंद्रायणीकाठची आळंदी. प्रत्येक थांब्यावर थांबा; तो उघडून त्यातील कथा आणि अभंग पाहा.',
    'sub2': 'यातील बहुतेक कथा भक्तपरंपरेच्या आहेत. थांब्यावरील ठिपका ती कोणत्या प्रकारची नोंद आहे हे सांगतो; तो दाबला की स्रोत दिसतात.',
    'order.what': 'थांब्यांचा क्रम', 'ov.what': 'या आकृतीतील ठिकाणे आणि नद्या',
    'ov': 'प्रवासाची रेखा', 'ov.label': 'प्रवासाची योजनाबद्ध रेखा; थांब्याकडे जा',
    'born': 'जन्म: निवडलेल्या वाटेनुसार',
    'p1': 'आपेगाव · पैठण', 'p2': 'नेवासे', 'p3': 'पंढरपूर', 'p4': 'आळंदी',
    'r.godavari': 'गोदावरी', 'r.godavari.s': 'आपेगाव आणि पैठण',
    'r.nevasa': 'नेवासे', 'r.nevasa.s': 'ज्ञानेश्वरीची कथा, आणि आळंदीच्या वाटेवर',
    'r.bhima': 'भीमा (चंद्रभागा)', 'r.bhima.s': 'पंढरपूर',
    'r.indrayani': 'इंद्रायणी', 'r.indrayani.s': 'आळंदी',
    'r.later': 'पुन्हा गोदावरी, पुन्हा इंद्रायणी', 'r.later.s': 'नंतरच्या शतकांत ग्रंथाचा प्रवास',
    'next': 'पुढचा थांबा', 'walk': 'या वाटेने चाला', 'walk.open': 'या वाटेवर',
    'fork': 'येथे वाट दुभंगते. दोन्ही वाटा चालून पाहा.',
    'poems': 'या प्रसंगावरील अभंग', 'poems.what': 'या अभंगांची जोडणी',
    'poems.none': 'या प्रसंगावर जुळवलेला कोणताही अभंग आमच्या नोंदीत नाही.',
    'poems.more': 'या संतांचे सर्व अभंग कार्यशाळेत',
    'own': 'माऊलींच्या स्वतःच्या ओळी', 'own.read': 'वाचनकक्षात वाचा', 'own.text': 'पूर्ण पाठ वाचा', 'own.what': 'या ओळींचा पाठ',
    'ws': 'पाठ: मराठी विकिस्रोत,', 'ws.page': 'पान', 'loading': 'उघडत आहे…',
    'full': 'या प्रसंगाची पूर्ण नोंद, कार्यशाळेत',
    'end': 'प्रवास येथे थांबतो', 'end.l': 'नदी वाहत राहते; ग्रंथ आणि अभंग वाचनात राहतात.',
    'd.sam': 'समाधीचे आख्यान', 'd.sam.l': 'सोहळ्याच्या आठ दिवसांत, नामदेवांच्या अभंगांतून',
    'd.alandi': 'आळंदीतून फेरफटका', 'd.alandi.l': 'इंद्रायणी, समाधी मंदिर, अजानवृक्ष आणि भिंत',
    'd.ws': 'सर्व घटना कार्यशाळेत', 'd.ws.l': 'एकोणीस घटना, स्रोतांसह',
    'who.Namdev': 'नामदेव', 'who.Nivruttinath': 'निवृत्तिनाथ', 'who.Muktabai': 'मुक्ताबाई', 'who.Sopandev': 'सोपानदेव',
    'ep.Nivruttinath samadhi': 'निवृत्तिनाथांच्या समाधी-विभागातून', 'ep.Muktabai samadhi': 'मुक्ताबाईंच्या समाधी-विभागातून',
    'ep.Sopandev samadhi': 'सोपानदेवांच्या समाधी-विभागातून', 'ep.adi': 'आदि-आख्यानातून', 'ep.tirthavali': 'तीर्थावळीतून',
    'ep.Dnyaneshwar samadhi': 'समाधी-आख्यानातून',
    'quote': 'ओवी',
  },
  en: {
    'title': 'From the Godavari to the Indrayani',
    'sub': "Read his life as a river journey: Apegaon and Paithan on the Godavari, Nevasa, Pandharpur on the Bhima, and Alandi on the Indrayani. Stop at each station; open it to see its story and its poems.",
    'sub2': 'Most of these stories belong to devotional tradition. The dot on a station says what kind of record it is; press it to see the sources.',
    'order.what': 'the order of the stations', 'ov.what': 'the places and rivers in this drawing',
    'ov': 'The line of the journey', 'ov.label': 'Schematic line of the journey; jump to a stop',
    'born': 'Birth: on the path you chose',
    'p1': 'Apegaon · Paithan', 'p2': 'Nevasa', 'p3': 'Pandharpur', 'p4': 'Alandi',
    'r.godavari': 'The Godavari', 'r.godavari.s': 'Apegaon and Paithan',
    'r.nevasa': 'Nevasa', 'r.nevasa.s': 'The making of the Dnyaneshwari, and the road to Alandi',
    'r.bhima': 'The Bhima (Chandrabhaga)', 'r.bhima.s': 'Pandharpur',
    'r.indrayani': 'The Indrayani', 'r.indrayani.s': 'Alandi',
    'r.later': 'The Godavari again, the Indrayani again', 'r.later.s': 'The book travels, in later centuries',
    'next': 'Next stop', 'walk': 'Walk this path', 'walk.open': 'On this path',
    'fork': 'The path divides here. Walk both.',
    'poems': 'Poems that tell this', 'poems.what': 'how these poems were matched',
    'poems.none': 'No poem in our records has been matched to this episode.',
    'poems.more': "All poems by these saints, in the workshop",
    'own': 'His own lines', 'own.read': 'Read in the reading room', 'own.text': 'Read the full text', 'own.what': 'the text of these lines',
    'ws': 'Text: Marathi Wikisource,', 'ws.page': 'page', 'loading': 'Opening…',
    'full': 'The full record of this episode, in the workshop',
    'end': 'The journey rests here', 'end.l': 'The river flows on; the book and the poems stay to be read.',
    'd.sam': "The samadhi, as Namdev tells it", 'd.sam.l': "Over the eight days of the sohala, from Namdev's poems",
    'd.alandi': 'Walk Alandi', 'd.alandi.l': 'The Indrayani, the samadhi temple, the ajan tree and the wall',
    'd.ws': 'All events in the workshop', 'd.ws.l': 'Nineteen events, with their sources',
    'who.Namdev': 'Namdev', 'who.Nivruttinath': 'Nivruttinath', 'who.Muktabai': 'Muktabai', 'who.Sopandev': 'Sopandev',
    'ep.Nivruttinath samadhi': "from the section on Nivruttinath's samadhi", 'ep.Muktabai samadhi': "from the section on Muktabai's samadhi",
    'ep.Sopandev samadhi': "from the section on Sopandev's samadhi", 'ep.adi': 'from the Adi cycle', 'ep.tirthavali': 'from the Tirthavali',
    'ep.Dnyaneshwar samadhi': 'from the samadhi cycle',
    'quote': 'ovi',
  },
});

export const title = () => t('x.journey');

const WS = 'https://creativecommons.org/licenses/by-sa/4.0/';
const CH18 = { file: 'texts/dnyaneshwari/ch18-4.json', name: { mr: 'ज्ञानेश्वरी, अध्याय १८', en: 'Dnyaneshwari, chapter 18' }, doc: 'DNY18',
  url: 'https://mr.wikisource.org/wiki/%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%BE%E0%A4%A8%E0%A5%87%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%B0%E0%A5%80/%E0%A4%85%E0%A4%A7%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%AF%20%E0%A4%85%E0%A4%A0%E0%A4%B0%E0%A4%BE%E0%A4%B5%E0%A4%BE' };
const CP = { file: 'texts/changdev-pasashti.json', name: { mr: 'चांगदेव पासष्टी', en: 'Changdev Pasashti' }, doc: 'CP',
  url: 'https://mr.wikisource.org/wiki/%E0%A4%9A%E0%A4%BE%E0%A4%82%E0%A4%97%E0%A4%A6%E0%A5%87%E0%A4%B5%20%E0%A4%AA%E0%A4%BE%E0%A4%B8%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%80' };

// ---- the stations. Marathi and English tellings are written by hand from the event rows (id = event id).
// reach: 1 Godavari, 2 Nevasa, 3 Bhima/Pandharpur, 4 Indrayani/Alandi, 5 later. poems: narrated_by_others ids;
// own: lines of his own (CH18 or CP); aside: a second statement from other rows; links: [route, mr, en].
const ST = [
  { id: 'birthplace', reach: 1, fork: 'place', q: ['DNYL-Q003', 'DNYL-Q004'],
    place: { mr: 'आपेगाव · आळंदी', en: 'Apegaon · Alandi' }, title: { mr: 'जन्म: कोणत्या गावी?', en: 'Birth: in which village?' },
    tell: { mr: 'माऊलींचा जन्म कुठे झाला, यावर स्रोतांत एकमत नाही. विश्वकोश सांगतो की ज्ञानेश्वरीचा उपलब्ध पाठ त्यांचे जन्मस्थान सांगत नाही.',
      en: 'Sources do not agree on where he was born. The Vishwakosh notes that the received text of the Dnyaneshwari does not name his birthplace.' },
    paths: [
      { born: 'apegaon', title: { mr: 'आपेगाव', en: 'Apegaon' }, q: ['DNYL-Q003'], place: 'DNYP-PL-02',
        body: { mr: 'पैठण तालुक्यातील, गोदावरीकाठचे हे गाव कुलकर्णी घराण्याचे पूर्वापार गाव आणि प्रचलित चरित्रातील जन्मस्थान. विश्वकोश आणि विकिपीडिया असे सांगतात.',
          en: "Apegaon, in Paithan taluka on the Godavari: the Kulkarni family's ancestral village and the birthplace in the received biography. The Vishwakosh and Wikipedia say so." },
        walk: { mr: 'या वाटेने प्रवास गोदावरीकाठी जन्माने सुरू होतो आणि इंद्रायणीकाठी समाधीने थांबतो.',
          en: 'On this path the journey begins with his birth on the Godavari and rests, at the samadhi, on the Indrayani.' } },
      { born: 'alandi', title: { mr: 'आळंदी', en: 'Alandi' }, q: ['DNYL-Q004'], place: 'DNYP-PL-01',
        body: { mr: 'ब्रिटानिका आणि मराठी विकिपीडियातील ‘काही अभ्यासक’ भावंडांचा जन्म आळंदीत झाला असे मानतात.',
          en: 'Britannica, and the "some scholars" of Marathi Wikipedia, hold that the siblings were born at Alandi.' },
        walk: { mr: 'या वाटेने जन्मस्थान आणि समाधीस्थान एकच, आळंदी; गोदावरीकाठची पैठण आणि नेवासे ही प्रवासातील ठिकाणे ठरतात.',
          en: 'On this path his birthplace and his samadhi are the same place, Alandi, and Paithan and Nevasa on the Godavari become places on the way.' } },
    ] },
  { id: 'birthyear', reach: 1, fork: 'year', q: ['DNYL-Q001', 'DNYL-Q002'],
    place: { mr: 'जन्मवर्ष', en: 'The year' }, title: { mr: 'जन्म: कोणत्या वर्षी?', en: 'Birth: in which year?' },
    tell: { mr: 'जन्मवर्ष दोन प्रकारे सांगितले जाते. विश्वकोश दोन्ही वर्षे देतो आणि निवड करत नाही.',
      en: 'Two years are given for his birth. The Vishwakosh lists both and does not choose.' },
    paths: [
      { title: { mr: '१२७५ (शके ११९७)', en: '1275 (Shaka 1197)' }, q: ['DNYL-Q001'],
        body: { mr: 'रानडे (१९३३) यांच्या हवाल्याने मराठी विकिपीडियात ही नोंद आहे; इंग्रजी विकिपीडिया हिला अधिक मान्य परंपरा म्हणते.',
          en: 'Marathi Wikipedia gives it, citing Ranade (1933); English Wikipedia calls it the more accepted tradition.' },
        walk: { mr: 'समाधी शके १२१८ (१२९६) मानल्यास तेव्हा त्यांचे वय सुमारे २१ वर्षे. (समाधीचे वर्षही वादग्रस्त आहे.)',
          en: 'If the samadhi is Shaka 1218 (1296), he was about 21 then. (The year of the samadhi is itself disputed.)' } },
      { title: { mr: '१२७१', en: '1271' }, q: ['DNYL-Q002'],
        body: { mr: 'प्रधान–लॅम्बर्ट (१९८७) आणि रानडे (पृ. ३१–३२) यांच्या हवाल्याने इंग्रजी विकिपीडिया हे वर्ष देते; विश्वकोशात तेही नोंदवलेले आहे.',
          en: 'English Wikipedia gives it, citing Pradhan-Lambert (1987) and Ranade (pp. 31-32); the Vishwakosh lists it too.' },
        walk: { mr: 'समाधी १२९६ मानल्यास तेव्हा त्यांचे वय सुमारे २५ वर्षे.', en: 'If the samadhi is 1296, he was about 25 then.' } },
    ] },

  { id: 'DNYL-V001', reach: 1, place: { mr: 'आपेगाव · आळंदी · काशी', en: 'Apegaon · Alandi · Kashi' }, when: { mr: 'मुलांच्या जन्माआधी', en: 'before the children were born' },
    title: { mr: 'वडिलांचा संन्यास', en: "The father's sannyasa" },
    tell: { mr: 'भक्तपरंपरा सांगते की विठ्ठलपंत काशीला जाऊन चैतन्याश्रम नावाने संन्यासी झाले. गुरूंनी त्यांना गृहस्थाश्रमात परतण्यास सांगितले; परतल्यावर ब्राह्मणांनी कुटुंबाला वाळीत टाकले. सुमारे बारा वर्षांनी ते तपश्चर्येसाठी कुटुंब सोडून गेले.',
      en: 'Tradition holds that Vitthalpant went to Kashi and took sannyasa as Chaitanyashram. His guru told him to return to householder life; on his return the Brahmins cast the family out. After about twelve years he left them for penance.' },
    poems: ['DNYC-NB00009'],
    aside: { q: ['DNYL-Q014', 'DNYL-Q015', 'DNYL-Q016'],
      mr: 'काशीतील गुरूंचे नाव कथनांनुसार बदलते: नृसिंहाश्रम, रामानंद किंवा रामाश्रम; नामदेवांच्या अभंगांत केवळ ‘श्रीपाद’ असल्याचे विश्वकोश सांगतो.',
      en: 'The name of his guru at Kashi changes with the telling: Nrisimhashram, Ramanand or Ramashram; the Vishwakosh says Namdev names only "Shripad".' } },
  { id: 'DNYL-V002', reach: 1, place: { mr: 'आळंदी', en: 'Alandi' }, title: { mr: 'आईवडिलांचा अंत', en: "The parents' end" },
    tell: { mr: 'या प्रसंगाबद्दल कथने जुळत नाहीत. इंग्रजी विकिपीडिया (बहिरट २००६ आणि Glushkova २०१४ यांच्या हवाल्याने) सांगते की आईवडिलांनी इंद्रायणीत देहत्याग केला; काही कथनांत विठ्ठलपंतांचा अंत गंगेत सांगितला आहे; विश्वकोश फक्त तपासाठी गृहत्याग नोंदवतो.',
      en: 'The tellings do not agree. English Wikipedia (citing Bahirat 2006 and Glushkova 2014) reports that the parents gave up their lives in the Indrayani; other versions place Vitthalpant\'s end in the Ganges; the Vishwakosh records only that he left for penance.' } },
  { id: 'DNYL-V003', reach: 1, place: { mr: 'नाशिकजवळ (गुहेचे नाव नाही)', en: 'Near Nashik (the cave is not named)' },
    title: { mr: 'निवृत्तिनाथ आणि गहिनीनाथ', en: 'Nivruttinath and Gahininath' },
    tell: { mr: 'परंपरा सांगते की नाशिकजवळ वाघाच्या भीतीने कुटुंब पळत असताना निवृत्तिनाथ एका गुहेत लपले; तेथे गहिनीनाथांनी त्यांना दीक्षा दिली, आणि पुढे निवृत्तिनाथांनी माऊलींना दीक्षा दिली. ही दुय्यम नोंद आहे (इंग्रजी विकिपीडिया); मूळ स्रोत आम्ही वाचलेले नाहीत.',
      en: 'Tradition holds that while the family fled a tiger near Nashik, Nivruttinath hid in a cave and was initiated there by Gahininath, and later initiated Dnyaneshwar. This is a secondary report (English Wikipedia); we have not read the original sources.' } },
  { id: 'DNYL-V004', reach: 1, place: { mr: 'पैठण', en: 'Paithan' }, title: { mr: 'शुद्धिपत्र', en: 'The certificate' },
    tell: { mr: 'नोंदींनुसार भावंडे पैठणला गेली; तेथील ब्राह्मणसभेने आईवडिलांच्या स्थितीविषयी प्रमाणपत्र (शुद्धिपत्र) दिले आणि प्रायश्चित्ताऐवजी भक्तीचा मार्ग सांगितला. नामदेवांच्या एका अभंगात पैठणातील या वादाचा उल्लेख आहे; ब्रिटानिकाही प्रमाणपत्राचा उल्लेख करते.',
      en: "The children went to Paithan, where the assembly of Brahmins gave a certificate about their parents' status and prescribed devotion in place of penance. A poem under Namdev's name mentions the Paithan debate; Britannica also reports the certificate." },
    poems: ['DNYC-NB00010', 'DNYC-NB00012', 'DNYC-NB00017'] },
  { id: 'DNYL-V005', reach: 1, place: { mr: 'पैठण', en: 'Paithan' }, title: { mr: 'रेड्याच्या मुखी वेद', en: 'The buffalo speaks the Veda' },
    tell: { mr: 'परंपरा सांगते की पैठणच्या विद्वानांना पटवण्यासाठी एका रेड्याच्या मुखातून वेदवाणी वदवली गेली; नामदेवांच्या अभंगात त्याला ‘म्हैसीपुत्र’ म्हटले आहे. महिपतींच्या कथनात माऊली एका माणसाला रेड्याला मारताना पाहून आक्षेप घेतात आणि त्याच्या मस्तकाला स्पर्श करतात.',
      en: "Tradition holds that a buffalo was made to speak Vedic words before the Paithan scholars, convincing them; a poem under Namdev's name calls him \"son of a she-buffalo\". In Mahipati's retelling, Dnyaneshwar objects to a man beating a buffalo and touches its head." },
    poems: ['DNYC-NB00013', 'DNYC-NB00014'],
    aside: { q: ['DNYL-Q018'], mr: 'विश्वकोश या कथांना चरित्रकथा मानतो; Dallmayr त्यांचा प्रतीकात्मक अर्थ लावतात, आणि पैठणच्या प्रसंगात भावंडांनी वागणुकीने आणि शिकवणीने विद्वानांना पटवले असे पाहतात.',
      en: 'The Vishwakosh treats these stories as hagiography; Dallmayr reads them symbolically, and sees the siblings persuading the scholars by conduct and teaching.' } },

  { id: 'DNYL-V007', reach: 2, place: { mr: 'नेवासे', en: 'Nevasa' }, title: { mr: 'सच्चिदानंद', en: 'Sachchidanand' },
    tell: { mr: 'परंपरा सांगते की नेवाशातील कुलकर्णी सच्चिदानंद मृत झाला होता; त्याला पुन्हा जिवंत केले गेले आणि त्याने ज्ञानेश्वरी लिहून घेतली. ग्रंथाच्या शेवटच्या ओव्यांत लेखक म्हणून त्याचे नाव खरेच आहे.',
      en: 'Tradition holds that Sachchidanand, a Kulkarni of Nevasa, had died and was revived, and then wrote down the Dnyaneshwari. The closing verses of the book do name him as its scribe.' },
    own: { src: CH18, ids: ['DNY18_1890'] } },
  { id: 'DNYL-V008', reach: 2, fork: 'compose', q: ['DNYL-Q010'], place: { mr: 'नेवासे · गोदावरीकाठ', en: 'Nevasa · the Godavari bank' },
    when: { mr: 'शके १२१२ (ओवीनुसार)', en: 'Shaka 1212 (by the verse)' }, title: { mr: 'ज्ञानेश्वरी कुठे सिद्ध झाली?', en: 'Where was the Dnyaneshwari made?' },
    tell: { mr: 'ओवीनुसार ग्रंथ शके १२१२ मध्ये पूर्ण झाला; अनेक स्रोत हे वर्ष इ.स. १२९० असे मानतात. एका अभ्यासकाच्या मते ही वर्षाची ओवी एकनाथांनी नंतर घातली. स्थानाबद्दल दोन वाटा आहेत.',
      en: 'By its own verse the book was completed in Shaka 1212; several sources take this as 1290 CE. One scholar holds that this dating verse was added later by Eknath. On the place there are two paths.' },
    tellQ: ['DNYL-Q008', 'DNYL-Q009'],
    paths: [
      { title: { mr: 'नेवासे', en: 'Nevasa' }, q: ['DNYL-Q010'], place: 'DNYP-PL-04',
        body: { mr: 'विश्वकोश आणि नंतरची परंपरा नेवासे सांगतात; जिल्ह्याच्या संकेतस्थळानुसार पैस खांबाशेजारी बसून ग्रंथ लिहिला गेला, आणि तो खांब अजून तेथे आहे.',
          en: 'The Vishwakosh and later tradition say Nevasa; a district page says he composed it beside the pais khamb, a pillar still standing there.' },
        walk: { mr: 'या वाटेने नेवासे हे ग्रंथाचे जन्मस्थान आणि सच्चिदानंदाचे गाव एकच.', en: 'On this path Nevasa is both the place of the book and the home of Sachchidanand.' },
        link: ['alandi?spot=DNYP-MS-05', 'पैस खांब (आळंदीच्या पलीकडील स्थाने)', 'The pais khamb (places beyond Alandi)'] },
      { title: { mr: 'गोदावरीचा काठ, ‘महालय’', en: 'The Godavari bank, "Mahalaya"' }, q: ['DNYL-Q010'],
        body: { mr: 'आमच्या वाचनात शेवटच्या ओव्या स्थान असे सांगतात: गोदावरीच्या काठी, श्रीमहालय, राजा रामचंद्र. त्यात ‘नेवासे’ हे नाव येत नाही. महालय म्हणजे नेवासे का, हे आम्ही तपासलेले नाही.',
          en: 'In our reading the closing verses give the place as the bank of the Godavari, Mahalaya, King Ramachandra; the name "Nevasa" does not occur. We have not checked whether Mahalaya is Nevasa.' },
        walk: { mr: 'या वाटेने ग्रंथाचे स्थान त्याच्या स्वतःच्या ओव्यांतून वाचले जाते, नंतरच्या परंपरेतून नव्हे. त्या ओव्या:',
          en: 'On this path the place is read from the book\'s own verses, not from later tradition. The verses:' },
        own: { src: CH18, ids: ['DNY18_1882', 'DNY18_1883', 'DNY18_1884'] } },
    ] },
  { id: 'DNYL-V009', reach: 2, place: { mr: 'ज्ञानेश्वरीचा शेवट', en: 'The close of the Dnyaneshwari' }, title: { mr: 'पसायदान', en: 'The Pasaydan' },
    tell: { mr: 'अठराव्या अध्यायाच्या शेवटी माऊली विश्वात्मक देवाकडे पसायदान मागतात; ‘श्रीविश्वेशरावो’ वर देतो आणि त्या वराने ज्ञानदेव सुखी होतो.',
      en: 'At the end of the eighteenth chapter he asks the all-pervading God for the Pasaydan; the deity he calls Vishweshwarao grants the boon, and the poet is glad.' },
    own: { src: CH18, ids: ['DNY18_1873', 'DNY18_1881'] } },
  { id: 'DNYL-V010', reach: 2, place: { mr: 'ज्ञानेश्वरीनंतर', en: 'After the Dnyaneshwari' }, title: { mr: 'अमृतानुभव', en: 'The Amritanubhava' },
    tell: { mr: 'विश्वकोशातील नोंदीनुसार निवृत्तिनाथांच्या आज्ञेने गीतेवरील भाष्यानंतर सुमारे आठशे ओव्यांचा अमृतानुभव रचला गेला. हा एकाच स्रोताचा दावा आहे.',
      en: "According to the Vishwakosh entry, the Amritanubhava, of about eight hundred ovis, was written after the Gita commentary at Nivruttinath's command. This rests on a single source." },
    links: [['texts/amritanubhav', 'अमृतानुभव ग्रंथ, कार्यशाळेत', 'The Amritanubhava, in the workshop']] },
  { id: 'DNYL-V006', reach: 2, place: { mr: 'आळंदीच्या वाटेवर · आळ्याचे वन', en: 'On the road to Alandi · the Alya forest' }, when: { mr: 'नेवाशानंतर', en: 'after Nevasa' },
    title: { mr: 'रेड्याची समाधी', en: "The buffalo's samadhi" },
    tell: { mr: 'परंपरा सांगते की नेवाशानंतर आळंदीकडे जाताना आळ्याच्या वनात तो रेडा मरण पावला आणि तेथे त्याची समाधी आहे. हे वन आजच्या कोणत्या गावाशी जुळते, हे कोणत्याही नोंदीत नाही.',
      en: 'Tradition holds that after Nevasa, on the way to Alandi, the buffalo died in the Alya forest and has a samadhi there. No record identifies this forest with any village today.' },
    links: [['alandi?spot=DNYP-MS-07', 'आळंदीच्या पलीकडील स्थाने', 'Places beyond Alandi']] },

  { id: 'DNYL-V013', reach: 3, place: { mr: 'पंढरपूर · चंद्रभागा', en: 'Pandharpur · the Chandrabhaga' }, title: { mr: 'नामदेवांची भेट', en: 'Meeting Namdev' },
    photo: 'chandrabhaga-ghats',
    tell: { mr: 'परंपरा सांगते की भावंडे संत नामदेवांना भेटायला पंढरपुरी गेली; विठ्ठलाने जाण्याची अनुज्ञा दिली. नामदेवांच्या अभंगांत ज्ञानदेवांचे येणे, नामदेवांचे लोटांगण आणि विठ्ठलासमोरील संवाद वर्णिला आहे.',
      en: "Tradition holds that the siblings went to Pandharpur to meet Namdev, and Vitthal gave them leave. Namdev's poems describe Dnyandev coming, Namdev bowing, and a conversation before Vitthal." },
    voices: [{ id: 'DNYC-NB00153', side: 'a', who: { mr: 'नामदेवांच्या अभंगात: कथन', en: "In Namdev's poem: the telling" } },
      { id: 'DNYC-NB00154', side: 'b', who: { mr: 'नामदेवांच्या अभंगात: ज्ञानदेव बोलतात', en: "In Namdev's poem: Dnyandev speaks" } }],
    aside: { q: ['DNYL-Q013'], mr: 'ही भेट नामदेवांच्याच अभंगांवर आधारलेली आहे. नामदेव आणि माऊली समकालीन असू शकत नाहीत असे अनेक अभ्यासक मानतात; वारकरी परंपरा नामदेवांचा काळ १२७२ ते १३५० असा सांगते.',
      en: 'The meeting rests on poems under Namdev\'s name. Many scholars hold that Namdev could not have overlapped with Dnyaneshwar; Varkari tradition dates Namdev 1272 to 1350.' } },
  { id: 'DNYL-V014', reach: 3, place: { mr: 'तीर्थयात्रा', en: 'The pilgrimage' }, when: { mr: '१२९६ पूर्वी (प्रचलित कथनात)', en: 'before 1296 in the usual telling' },
    title: { mr: 'नामदेवांसोबत तीर्थयात्रा', en: 'Pilgrimage with Namdev' },
    tell: { mr: 'परंपरा सांगते की चोखामेळा, सावता माळी, नरहरी सोनार, परिसा भागवत आणि विसोबा खेचर यांच्यासह ते नामदेवांबरोबर कऱ्हाड (तेथे एका राजपुत्राला जिवंत केले), मारवाड (नामदेवांच्या प्रार्थनेने पाणी), प्रभास, द्वारका, गिरनार, अयोध्या, प्रयाग, काशी आणि गया येथे गेले. तीर्थावळीच्या १५८१ आणि १७३१ च्या पाठांत फरक असल्याची नोंद आहे.',
      en: "Tradition holds that with Chokhamela, Sanvata Mali, Narahari Sonar, Parisa Bhagwat and Visoba Khechar he went with Namdev to Karad (where a king's son was revived), Marwar (water, by Namdev's prayer), Prabhas, Dwarka, Girnar, Ayodhya, Prayag, Kashi and Gaya. The 1581 and 1731 versions of the Tirthavali are recorded as differing." },
    poems: ['DNYC-NB00160', 'DNYC-NB00170'] },

  { id: 'DNYL-V011', reach: 4, place: { mr: 'आळंदी परिसर', en: 'Around Alandi' }, title: { mr: 'चांगदेव आणि चालती भिंत', en: 'Changdev and the moving wall' },
    tell: { mr: 'माऊलींनी चांगदेवांना पासष्ट ओव्यांचे उत्तर पाठवले, असे पासष्टीचा पाठ सांगतो. भिंत आणि वाघ त्या पाठात नाहीत; परंपरा सांगते की चांगदेव वाघावर बसून आले, भावंडे बसलेली भिंत त्यांच्या स्वागताला पुढे चालू लागली, आणि चांगदेवांनी हार मानून मुक्ताबाईंकडून दीक्षा घेतली. हे महिपतींच्या (१७६२–१७७४) कथनातून येते.',
      en: 'The text of the Pasashti says Dnyaneshwar replied to Changdev in sixty-five ovis. The wall and the tiger are not in that text; tradition holds that Changdev came on a tiger, the wall the siblings sat on moved forward to greet him, and Changdev yielded and took initiation from Muktabai. This comes from Mahipati (1762 to 1774).' },
    own: { src: CP, ids: ['CP_0037'] },
    links: [['alandi?spot=DNYP-MS-04', 'आळंदीतील ‘भिंत’', 'The wall, at Alandi']] },
  { id: 'DNYL-V012', reach: 4, place: { mr: 'आळंदी', en: 'Alandi' }, title: { mr: 'विसोबा चाटी आणि मांडे', en: 'Visoba Chati and the mande' },
    tell: { mr: 'परंपरा सांगते की आळंदीतील विसोबा चाटी याने कुंभारांना भांडी देण्यास मनाई केली. निवृत्तिनाथांना मांडे हवे होते, तेव्हा माऊलींनी आपली पाठ तापवली आणि मुक्ताबाईंनी त्यांच्या पाठीवर मांडे भाजले. विसोबांना पश्चात्ताप झाला; ते ‘खेचर’ म्हणून ओळखले गेले आणि पुढे नामदेवांचे गुरू झाले.',
      en: 'Tradition holds that Visoba Chati, a Brahmin of Alandi, made the potters refuse vessels. When Nivruttinath wanted mande (the thin bread the Marathi tradition names), Dnyaneshwar heated his back and Muktabai baked them on it. Visoba repented, was called Khechar, and later became Namdev\'s guru.' } },
  { id: 'DNYL-V015', reach: 4, fork: 'samadhi', q: ['DNYL-Q017'], place: { mr: 'आळंदी · इंद्रायणी', en: 'Alandi · the Indrayani' },
    when: { mr: 'कार्तिक वद्य त्रयोदशी', en: 'Kartik Vadya Trayodashi' }, title: { mr: 'संजीवन समाधी', en: 'The sanjivan samadhi' },
    photo: 'alandi-ghat',
    tell: { mr: 'परंपरा सांगते की एकादशीचा जागर आणि द्वादशीचे पारणे झाल्यावर त्रयोदशीला माऊली सिद्धेश्वर मंदिराजवळील खड्ड्यात संजीवन समाधीसाठी उतरले. नामदेवांचे अभंग विठ्ठलाने समाधी दिल्याचे आणि उपस्थित संतांचे वर्णन करतात.',
      en: "Tradition holds that after a vigil on Ekadashi and a feast on Dvadashi, he entered a pit beside the Siddheshwar temple on Trayodashi for the sanjivan samadhi. Namdev's poems describe Vitthal granting the samadhi and the saints who were present." },
    samadhiPoems: [43, 45, 67],
    links: [['samadhi', 'समाधीचे आख्यान, आठ दिवसांत वाचा', 'Read the telling over eight days'], ['alandi', 'आळंदीतून फेरफटका', 'Walk Alandi']],
    paths: [
      { title: { mr: 'शके १२१८ (इ.स. १२९६)', en: 'Shaka 1218 (1296 CE)' }, q: ['DNYL-Q017'],
        body: { mr: 'विश्वकोश आणि मराठी विकिपीडियाचा मुख्य मजकूर हे वर्ष देतात.', en: 'The Vishwakosh and the body of the Marathi Wikipedia article give this year.' },
        walk: { mr: 'या वाटेने समाधी १२९६ मध्ये; वारही गुरुवार की रविवार, यावर नोंदींत फरक आहे.', en: 'On this path the samadhi is in 1296; the records also differ on whether the day was a Thursday or a Sunday.' } },
      { title: { mr: 'शके १२१७', en: 'Shaka 1217' }, q: ['DNYL-Q017'],
        body: { mr: 'मराठी विकिपीडियाच्या माहितीचौकटीत हे वर्ष आहे.', en: 'The infobox of the Marathi Wikipedia article gives this year.' },
        walk: { mr: 'या वाटेने समाधी १२९५ मध्ये. कोणत्याही स्रोताची पंचांगाशी पडताळणी झालेली नाही.', en: 'On this path the samadhi falls a year earlier, in 1295. No source has been checked against an almanac.' } },
    ] },
  { id: 'DNYL-V016', reach: 4, place: { mr: 'आळंदी', en: 'Alandi' }, title: { mr: 'नामदेवांची प्रार्थना', en: "Namdev's prayer" },
    tell: { mr: 'परंपरा सांगते की नामदेवांनी विठ्ठलाकडे प्रार्थना केली आणि माऊली काही काळ परत आले. ही कथा आम्हाला फक्त दुय्यम स्रोतातून मिळाली आहे (Dallmayr २००७, इंग्रजी विकिपीडियाच्या हवाल्याने).',
      en: 'Tradition holds that Namdev prayed to Vitthal and Dnyaneshwar returned for a time. We have this story only from a secondary source (Dallmayr 2007, as cited by English Wikipedia).' },
    voices: [{ id: 'DNYC-NB00030', side: 'a', who: { mr: 'नामदेवांच्या अभंगात: नामदेव', en: "In Namdev's poem: Namdev" } },
      { id: 'DNYC-NB00034', side: 'b', who: { mr: 'नामदेवांच्या अभंगात: देव उत्तर देतो', en: "In Namdev's poem: God answers" } }],
    poems: ['DNYC-NB00040', 'DNYC-NB00041'], poemsNote: 'pair' },
  { id: 'DNYL-V017', reach: 4, place: { mr: 'त्यानंतर', en: 'Afterwards' }, when: { mr: '१२९६–९७ (नोंदीनुसार)', en: '1296-97 as the entry implies' },
    title: { mr: 'भावंडे वर्षभरात', en: 'The siblings follow' },
    tell: { mr: 'विश्वकोशातील नोंदीनुसार (हा एकाच स्रोताचा दावा आहे) सोपानदेव, मुक्ताबाई आणि निवृत्तिनाथ माऊलींच्या समाधीनंतर वर्षभरात समाधिस्थ झाले.',
      en: "According to the Vishwakosh entry (a single source), Sopandev, Muktabai and Nivruttinath died within a year of his samadhi." },
    poems: ['DNYC-NB00026', 'DNYC-NB00020', 'DNYC-NB00151'] },

  { id: 'DNYL-V018', reach: 5, place: { mr: 'पैठण · गोदावरीतीर', en: 'Paithan · the Godavari bank' }, when: { mr: 'शके १५०६, तारण संवत्सर', en: 'Shaka 1506, Tarana samvatsara' },
    title: { mr: 'एकनाथांची शुद्ध प्रत', en: "Eknath's corrected copy" },
    tell: { mr: 'एकनाथ (एका जनार्दन) ग्रंथाच्या शेवटच्या ओव्यांत सांगतात की ज्ञानेश्वरी मुळात शुद्ध होती पण पाठभेदांनी बिघडली; त्यांनी शोधून शुद्ध प्रत केली आणि ती भाद्रपदात, प्रतिष्ठानी (पैठण) गोदातटी पूर्ण झाली.',
      en: 'In the closing verses Eknath, signing as Eka-Janardana, says the Dnyaneshwari was pure in its origin but corrupted by variant readings, and that he made a corrected copy, finished at Pratishthan (Paithan) on the Godavari bank in Bhadrapad.' },
    own: { src: CH18, ids: ['DNY18_1891', 'DNY18_1892'], last: true },
    aside: { q: ['DNYL-Q011', 'DNYL-Q012'], mr: 'यापेक्षा आधीच्या विश्वसनीय हस्तलिखितांबद्दल विश्वकोश अनभिज्ञ आहे; एका हस्तलिखित-केंद्राच्या नोंदीत मात्र एका प्रतीला ‘शके १२१२’ असे लेबल आहे (सूचिकाराचे मत). हा मतभेद मिटलेला नाही.',
      en: 'The Vishwakosh knows of no reliable earlier manuscript; a Marathi Manuscript Centre record, however, labels one manuscript "Shaka 1212" (the cataloguer\'s view). The disagreement is unsettled.' } },
  { id: 'DNYL-V019', reach: 5, place: { mr: 'आळंदी', en: 'Alandi' }, when: { mr: 'सोळाव्या शतकाचा उत्तरार्ध', en: 'late 16th century' },
    title: { mr: 'एकनाथ आणि अजानवृक्षाचे मूळ', en: "Eknath and the ajan tree's root" },
    tell: { mr: 'परंपरा सांगते की एकनाथांना स्वप्नात दिसले की माऊलींचा श्वास गुदमरत आहे; ते झाडाझुडपांनी वेढलेल्या आळंदीत आले, गुहा शोधली, माऊलींच्या गळ्याभोवती गुंडाळलेले मूळ काढले आणि त्यांच्या चरणांजवळून ज्ञानेश्वरीची प्रत घेतली. त्या झाडाला अजानवृक्ष म्हणतात.',
      en: "Tradition holds that Eknath dreamed Dnyaneshwari was choking, came to overgrown Alandi, found the cave, removed a root wound around the saint's neck, and took a copy of the Dnyaneshwari from his feet; the tree is called the ajan tree." },
    links: [['alandi?spot=DNYP-MS-03', 'अजानवृक्ष, आळंदीत', 'The ajan tree, at Alandi']] },
];

const REACHES = [
  { k: 'godavari', n: 1, icon: 'bank' }, { k: 'nevasa', n: 2, icon: 'pillar' }, { k: 'bhima', n: 3, icon: 'bend' },
  { k: 'indrayani', n: 4, icon: 'temple' }, { k: 'later', n: 5, icon: 'leaf' },
];
const ICON = {
  bank: '<path d="M4 30 C20 22 34 26 52 20"/><path d="M4 36 H56" opacity=".5"/><path d="M40 20 v-8 M34 22 v-5 M46 18 v-6" />',
  pillar: '<path d="M30 6 v26 M24 6 h12 M22 32 h16"/><path d="M4 38 H56" opacity=".5"/>',
  bend: '<path d="M10 8 C48 8 54 34 18 38"/><path d="M16 14 C42 14 46 30 22 32" opacity=".55"/>',
  temple: '<path d="M18 34 V20 h24 v14 M22 20 l8 -12 8 12 M30 8 v-4"/><path d="M4 38 H56" opacity=".5"/>',
  leaf: '<path d="M30 36 C14 30 14 12 30 6 C46 12 46 30 30 36Z"/><path d="M30 36 V12" opacity=".6"/>',
};
const wave = (w, y, amp, step = 20) => { let d = `M0 ${y} Q ${step / 2} ${y - amp} ${step} ${y}`; for (let x = step * 2; x <= w; x += step) d += ` T ${x} ${y}`; return d; };
const L = (o) => (o && (o[lang()] ?? o.mr)) || '';
const uniq = (a) => [...new Set(a)];
const idsIn = (s) => [...String(s || '').matchAll(/\b(?:DNYL-|DNYP-|DNYG-P-)?S\d{2,3}\b/g)].map((m) => m[0]);
const csClass = (cs) => 'cs-' + String(cs || 'none').toLowerCase().replace(/\s+/g, '-');

let narr = null;
const loadNarr = () => (narr ||= getJSON('connections/narrated_by_others-1.json').then((rows) => new Map(rows.map((r) => [r.narrated_id, r]))));

export async function render(ctx) {
  const [life] = await Promise.all([getJSON('life.json'), photosReady()]);
  const ev = new Map(life.events.map((e) => [e.event_id, e]));
  const disp = new Map(life.disputes.map((d) => [d.dispute_id, d]));
  const evOf = (id) => {
    const r = ev.get(id);
    return { cs: r.claim_status, src: r.source_id, rows: [id], link: 'life/events/' + id,
      note: [r.summary, r.earliest_source_status && 'Earliest source: ' + r.earliest_source_status, r.narrated_in && 'Narrated in: ' + r.narrated_in, r.date_or_period && 'Date or period: ' + r.date_or_period].filter(Boolean) };
  };
  const evQ = (qs, extra = []) => {
    const rs = qs.map((q) => disp.get(q)).filter(Boolean);
    return { cs: 'disagreement', rows: qs, src: uniq(rs.flatMap((r) => [r.source_id, ...idsIn(r.evidence_for), ...idsIn(r.evidence_against)])),
      link: 'life/events',
      note: [...rs.map((r) => `${r.question}: ${r.position}. Held by: ${r.proponents}.${r.evidence_against ? ' Against: ' + r.evidence_against + '.' : ''}${r.current_view_if_stated ? ' ' + r.current_view_if_stated + '.' : ''}`), ...extra] };
  };
  const orderEv = { cs: 'reconstruction', rows: ['life.json: events'], link: 'life/events',
    note: ['The order of the stations is this site\'s. Where an event carries a date or period it follows it (V008 Shaka 1212; V014 before 1296; V015 Kartik Vadya Trayodashi; V017 1296-1297; V018 Shaka 1506; V019 late 16th century). The data gives no date for most events, so these are placed along the route named in the plan (Godavari, Nevasa, Pandharpur, Alandi) and by their place: V011 (the wall) and V012 (Visoba Chati) are placed at Alandi, V006 after Nevasa as its row says. Other orders are possible.'] };
  const ovEv = { cs: 'editorial testimony', src: ['DNYP-S01', 'DNYP-S04', 'DNYP-S05', 'DNYP-S03', 'DNYP-S23'], rows: ['DNYP-PL-01', 'DNYP-PL-02', 'DNYP-PL-03', 'DNYP-PL-04', 'DNYP-PL-05'], link: 'life/map',
    note: ['The rivers are those given in the places table: Apegaon and Paithan on the Godavari, Pandharpur on the Bhima (Chandrabhaga), Alandi on the Indrayani. Nevasa has no river recorded.',
      'The drawing is a schematic line of the journey, not a map: distances and bends are not to scale, and no river course is drawn from data.'] };

  const pathMark = (p, extraNote) => mark(evQ(p.q, extraNote ? [extraNote] : []), { what: L(p.title) });
  const forkOf = (s) => ({ note: t('jr.fork'), paths: s.paths.map((p) => ({
    title: `<span lang="${/[ऀ-ॿ]/.test(L(p.title)) ? 'mr' : 'en'}">${esc(L(p.title))}</span>`, mark: pathMark(p),
    body: `<p class="pb">${esc(L(p.body))}</p>` +
      `<button type="button" class="xlink walkb" data-walk${p.born ? ` data-born="${p.born}"` : ''} aria-expanded="false">${esc(t('jr.walk'))}</button>` +
      `<div class="walk" hidden><p class="wk">${esc(L(p.walk))}${mark(evQ(p.q, ['This line states what follows from taking this answer; the reasoning is this site\'s, not a source\'s.']), { what: t('jr.walk.open') })}</p>` +
      (p.own ? `<div class="lz" data-own="${esc(JSON.stringify({ k: p.own.src === CP ? 'CP' : 'CH18', ids: p.own.ids }))}"><p class="xsmall">${esc(t('jr.loading'))}</p></div>` : '') +
      (p.link ? `<p class="lk"><a href="#/${esc(p.link[0])}">${esc(lang() === 'mr' ? p.link[1] : p.link[2])}</a></p>` : '') + `</div>`,
  })) });

  const stations = ST.map((s) => {
    const isEv = ev.has(s.id);
    const cs = isEv ? ev.get(s.id).claim_status : 'disagreement';
    let e0 = isEv ? evOf(s.id) : evQ(s.q);
    if (s.tellQ) { const q = evQ(s.tellQ); e0 = { ...e0, cs: 'disagreement', rows: [...e0.rows, ...s.tellQ], note: [...e0.note, ...q.note], src: uniq([...(Array.isArray(e0.src) ? e0.src : [e0.src]), ...q.src]) }; }
    const evMark = mark(e0, { what: L(s.title) });
    const mr = lang() === 'mr';
    let body = '';
    if (s.photo) body += photo(s.photo, { draw: 'river' });
    body += `<p class="tell">${esc(L(s.tell))}${evMark}</p>`;
    if (s.aside) body += `<p class="aside">${esc(L(s.aside))}${mark(evQ(s.aside.q), { what: L(s.title) })}</p>`;
    if (s.voices || s.poems || s.samadhiPoems || s.own) body += `<div class="lz" data-st="${esc(s.id)}"><p class="xsmall">${esc(t('jr.loading'))}</p></div>`;
    else if (isEv && !s.links) body += `<p class="xsmall none">${esc(t('jr.poems.none'))}</p>`;
    if (s.links) body += `<p class="lks xrow">${s.links.map((l) => `<a href="#/${esc(l[0])}">${esc(mr ? l[1] : l[2])}</a>`).join('')}</p>`;
    if (isEv) body += `<p class="lks xrow"><a href="${href('life/events/' + s.id)}" class="ws">${esc(t('jr.full'))}</a></p>`;
    return { id: s.id, reach: s.reach,
      title: `<span class="eb"><span class="pip ${csClass(cs)}" aria-hidden="true"></span>${esc(L(s.place))}</span><span class="tt">${esc(L(s.title))}</span>`,
      when: s.when ? esc(L(s.when)) : '', body,
      fork: s.paths ? forkOf(s) : null };
  });

  const byReach = REACHES.map((r) => ({ ...r, st: stations.filter((x) => x.reach === r.n) }));
  const reachHtml = byReach.map((r, i) => `<section class="reach-wrap" aria-labelledby="rh-${r.n}">
    <header class="reach rv" id="reach-${r.n}">
      <svg class="wv" viewBox="0 0 360 40" preserveAspectRatio="none" aria-hidden="true"><path d="${wave(360, 14, 5)}"/><path d="${wave(360, 24, 4, 30)}" opacity=".55"/></svg>
      <div class="rh"><svg class="ic" viewBox="0 0 60 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[r.icon]}</svg>
        <div><h2 id="rh-${r.n}" lang="${mr0() ? 'mr' : 'en'}">${esc(t('jr.r.' + r.k))}</h2><p class="xsmall">${esc(t('jr.r.' + r.k + '.s'))}</p></div></div>
    </header>
    ${journey(r.st, { label: t('jr.r.' + r.k) })}</section>`).join('');
  function mr0() { return lang() === 'mr'; }

  const ovX = [13, 38, 64, 89];
  const strip = `<div class="ov" data-born="" role="group" aria-label="${esc(t('jr.ov.label'))}">
    <p class="xsmall ovh">${esc(t('jr.ov'))}${mark(ovEv, { what: t('jr.ov.what') })}</p>
    <div class="ovb"><svg viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden="true"><path d="${wave(320, 36, 6, 16)}"/><path d="${wave(320, 46, 4, 24)}" opacity=".5"/></svg>
    <span class="rv-n" style="left:${ovX[0]}%">${esc(t('jr.r.godavari'))}</span><span class="rv-n" style="left:${ovX[2]}%">${esc(lang() === 'mr' ? 'भीमा' : 'Bhima')}</span><span class="rv-n" style="left:${ovX[3]}%">${esc(t('jr.r.indrayani'))}</span>
    ${[1, 2, 3, 4].map((n, k) => `<button type="button" class="ovd" data-go="${k === 3 ? 4 : k + 1}" style="left:${ovX[k]}%" data-k="${n}"><span class="d" aria-hidden="true"></span><span class="l">${esc(t('jr.p' + n))}</span></button>`).join('')}
    </div><p class="xsmall bornl" hidden>${esc(t('jr.born'))}</p></div>`;

  ctx.el.innerHTML = `<div class="x-journey">${STYLE}
    <h1 tabindex="-1">${esc(t('jr.title'))}</h1>
    <p class="sub">${esc(t('jr.sub'))}</p>
    <p class="xsmall sub2">${esc(t('jr.sub2'))}${mark(orderEv, { what: t('jr.order.what') })}</p>
    ${strip}
    ${reachHtml}
    <section class="end rv"><h2 class="vh">${esc(t('jr.end'))}</h2><p class="lead">${esc(t('jr.end'))}</p><p class="xsmall">${esc(t('jr.end.l'))}</p>
      <div class="xdoors">${door('samadhi', t('jr.d.sam'), t('jr.d.sam.l'))}${door('alandi', t('jr.d.alandi'), t('jr.d.alandi.l'))}${door('life/events', t('jr.d.ws'), t('jr.d.ws.l'))}</div></section>
  </div>`;

  const root = ctx.el.querySelector('.x-journey');
  const smooth = () => (reducedMotion() ? 'auto' : 'smooth');
  const redraw = () => window.dispatchEvent(new Event('resize'));

  // ---- lazy contents of an opened station
  const lzDone = new Set();
  async function fillLines(host, which, ids) {
    const src = which === 'CP' ? CP : CH18;
    const doc = await getJSON(src.file);
    const items = ids.map((id) => doc.items.find((x) => x.id === id)).filter(Boolean);
    const cp = which === 'CP';
    const lines = items.map((it) => {
      let tx = it.t || it.inc || '';
      if (it.id === 'DNY18_1891') tx = tx.split(/\n\s*\n/).pop();
      const ls = tx.split('\n').map((x) => x.trim()).filter(Boolean);
      const route = cp ? `texts/changdev-pasashti?seg=${it.id}` : `read/18?seg=${it.id}`;
      return `<div class="vs-i"><p class="vs" lang="mr">${ls.map((l) => `<span class="h">${esc(keepDandas(l.replace(/\\-/g, '-')))}</span>`).join('')}</p>` +
        `<p class="xsmall vl"><a href="#/${route}">${esc(cp ? t('jr.own.text') : t('jr.own.read'))}</a></p></div>`;
    }).join('');
    const e = { cs: 'editorial testimony', rows: items.map((i) => i.id), noteMr: lang() === 'mr' ? 'पाठ मराठी विकिस्रोतावरून आहे; ओव्यांचे क्रमांक तेथे छापल्याप्रमाणे आहेत.' : '',
      srcObjs: [{ id: src.doc, title: src.name.mr, url: src.url, rights: 'CC BY-SA 4.0 (Marathi Wikisource)' }],
      lic: `<a href="${WS}" target="_blank" rel="noopener">CC BY-SA 4.0</a>`, note: ['Marathi Wikisource transcription; shown as printed there, not proofread by this site.'],
      link: cp ? 'texts/changdev-pasashti' : 'texts/dnyaneshwari/18' };
    host.innerHTML = `<h3 class="lzh">${esc(t('jr.own'))}${mark(e, { what: t('jr.own.what') })}</h3>${lines}` +
      `<p class="xsmall ws">${esc(t('jr.ws'))} <a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.name[lang()] || src.name.mr)}</a>, <a href="${WS}" target="_blank" rel="noopener">CC BY-SA 4.0</a></p>`;
  }
  async function fillStation(id, body) {
    const s = ST.find((x) => x.id === id);
    const host = body.querySelector('.lz[data-st]');
    if (host && s && !lzDone.has(id)) {
      lzDone.add(id);
      try {
        let html = '';
        const nm = (r) => `<span class="pmw">${esc(t('jr.who.' + r.saint) === 'jr.who.' + r.saint ? r.saint : t('jr.who.' + r.saint))}</span>`;
        const poemEv = (rows) => ({ cs: 'reconstruction', rows: rows.map((r) => r.narrated_id),
          srcObjs: uniq(rows.map((r) => r.source_id)).map((sid) => { const r = rows.find((x) => x.source_id === sid); return { id: sid, title: r.source_title }; }),
          link: 'connections/namdev',
          noteMr: lang() === 'mr' ? 'अभंगांची या प्रसंगाशी जोडणी या संकेतस्थळाने पहिल्या ओळी वाचून केली आहे; ती विद्वानांची निश्चिती नाही. येथे फक्त पहिली ओळ दिली आहे.' : '',
          note: ['Each poem is matched to this episode by this site, by reading its incipit against the event row; it is not a scholar\'s assignment. Only the first line (incipit) is shown, as the text is held by TransLiteral.',
            ...rows.map((r) => `${r.narrated_id}: ${r.saint}, ${r.package_section}; episode label "${r.episode || 'none'}"; names matched ${(r.names_matched || []).join(', ')}.`)] });
        if (s.voices || s.poems) {
          const m = await loadNarr();
          const vrows = (s.voices || []).map((v) => m.get(v.id)).filter(Boolean);
          const prows = (s.poems || []).map((p) => m.get(p)).filter(Boolean);
          if (vrows.length) {
            html += voices(s.voices.map((v, k) => ({ who: L(v.who), side: v.side, html: esc(keepDandas(vrows[k].incipit.replace(/\s*॥[०-९]+॥\s*$/, ' ॥'))), lang: 'mr', mark: mark(poemEv([vrows[k]]), { what: L(v.who) }) })), { label: t('jr.poems') });
          }
          if (prows.length) {
            html += `<h3 class="lzh">${esc(t('jr.poems'))}${mark(poemEv(prows), { what: t('jr.poems.what') })}</h3><ul class="pm">` +
              prows.map((r) => `<li><span class="in" lang="mr">${esc(keepDandas(r.incipit.replace(/\s*॥\s*[०-९0-9]+\s*॥?\s*$/, ' ॥')))}</span> ${nm(r)}` +
                `${r.episode && /samadhi|adi|tirthavali/.test(r.episode) ? ` <span class="xsmall ep">${esc(t('jr.ep.' + r.episode))}</span>` : ''}</li>`).join('') + `</ul>` +
              `<p class="xsmall"><a href="#/connections/namdev">${esc(t('jr.poems.more'))}</a></p>`;
          }
          if (!vrows.length && !prows.length) html += `<p class="xsmall">${esc(t('jr.poems.none'))}</p>`;
        }
        if (s.samadhiPoems) {
          const sm = await getJSON('samadhi.json');
          const ps = s.samadhiPoems.map((n) => sm.poems.find((p) => p.n === n)).filter(Boolean);
          const e = { cs: 'devotional tradition', rows: ps.flatMap((p) => [p.seg, p.narrated_id]).filter(Boolean), link: 'connections/namdev',
            srcObjs: Object.entries(sm.sources).map(([i, x]) => ({ id: i, title: x.title, url: x.url, rights: x.rights })),
            note: [`Opening lines of poems ${s.samadhiPoems.join(', ')} of the cycle "${sm.cycle}" (TransLiteral first lines). The full text of most poems of the cycle is read, one at a time, in the samadhi telling.`] };
          html += `<h3 class="lzh">${esc(t('jr.poems'))}${mark(e, { what: t('jr.poems.what') })}</h3><ul class="pm">` +
            ps.map((p) => `<li><span class="in" lang="mr">${esc(keepDandas(p.inc.replace(/\s*॥[०-९]+॥\s*$/, ' ॥')))}</span> <span class="pmw">${esc(t('jr.who.Namdev'))}</span> <span class="xsmall ep"><a href="#/samadhi">${esc(t('jr.ep.Dnyaneshwar samadhi'))}</a></span></li>`).join('') + `</ul>`;
        }
        if (s.own) {
          const o = document.createElement('div'); o.className = 'own';
          await fillLines(o, s.own.src === CP ? 'CP' : 'CH18', s.own.ids);
          html += o.outerHTML;
        }
        host.outerHTML = `<div class="lzd">${html}</div>`;
      } catch (e) { host.innerHTML = `<p class="xsmall">${esc(t('error.load'))}</p>`; lzDone.delete(id); }
    }
    for (const h of body.querySelectorAll('.lz[data-own]')) {
      if (h.dataset.done) continue; h.dataset.done = '1';
      const o = JSON.parse(h.dataset.own);
      try { await fillLines(h, o.k, o.ids); } catch { h.innerHTML = ''; }
    }
    redraw();
  }

  // ---- behaviour
  ctx.after = () => {
    root.querySelectorAll('.st-b').forEach((b) => b.insertAdjacentHTML('beforeend', `<p class="nx"><button type="button" class="xlink" data-next>${esc(t('jr.next'))} <span aria-hidden="true">↓</span></button></p>`));
    attachJourney(root, { onOpen: (id, body) => {
      history.replaceState(null, '', `#/journey?s=${encodeURIComponent(id)}`);
      fillStation(id, body);
    } });
    reveal(root, '.rv');
    root.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]');
      if (go) { document.getElementById('reach-' + go.dataset.go)?.scrollIntoView({ behavior: smooth(), block: 'start' }); return; }
      const w = e.target.closest('[data-walk]');
      if (w) {
        const open = w.getAttribute('aria-expanded') !== 'true';
        w.setAttribute('aria-expanded', String(open));
        w.nextElementSibling.hidden = !open;
        w.closest('.st-path').classList.toggle('walking', open);
        const born = w.dataset.born, ov = root.querySelector('.ov');
        if (born) {
          const on = [...root.querySelectorAll('[data-born]')].filter((x) => x.matches('[data-walk]') && x.getAttribute('aria-expanded') === 'true').map((x) => x.dataset.born);
          ov.dataset.born = on.join(' ');
          root.querySelector('.bornl').hidden = !on.length;
        }
        redraw();
        return;
      }
      const n = e.target.closest('[data-next]');
      if (n) {
        const cur = n.closest('.st'), hs = [...root.querySelectorAll('.st-h')], ch = cur.querySelector('.st-h');
        const nh = hs[hs.indexOf(ch) + 1];
        if (!nh) { root.querySelector('.end').scrollIntoView({ behavior: smooth(), block: 'start' }); return; }
        ch.click();
        if (nh.getAttribute('aria-expanded') !== 'true') nh.click();
        const nst = nh.closest('.st'), first = !nst.previousElementSibling || nst.previousElementSibling.tagName === 'svg';
        (first ? nst.closest('.reach-wrap').querySelector('.reach') : nst).scrollIntoView({ behavior: smooth(), block: 'start' });
        nh.focus({ preventScroll: true });
      }
    });
    const want = ctx.query.get('s');
    const h = want && root.querySelector(`#st-${CSS.escape(want)} .st-h`);
    if (h) { h.click(); setTimeout(() => h.closest('.st').scrollIntoView({ block: 'start' }), 60); }
    // the born-markers of the strip follow the birthplace paths
  };
  ctx.manageScroll = !!ctx.query.get('s');
}

const STYLE = `<style>
.x-journey { max-width: 40rem; margin: 0 auto; padding: var(--sp-4) var(--sp-4) var(--sp-6); }
.x-journey h1 { font-size: var(--s-3); margin: 0 0 var(--sp-2); }
.x-journey .sub { font-size: var(--s-0); line-height: var(--lh-prose); color: var(--ink-2); margin: var(--sp-2) 0; max-width: var(--measure); }
.x-journey .sub2 { max-width: var(--measure); margin: 0 0 var(--sp-4); }
.x-journey .ov { margin: var(--sp-4) 0 var(--sp-2); }
.x-journey .ovh { margin: 0 0 .2rem; }
.x-journey .ovb { position: relative; height: 6.2rem; color: var(--ink-3); }
.x-journey .ovb > svg { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: 3.6rem; overflow: visible; }
.x-journey .ovb path { fill: none; stroke: var(--saffron); stroke-width: 1.6; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.x-journey .rv-n { position: absolute; top: 0; transform: translateX(-50%); font-size: .74rem; color: var(--ink-3); white-space: nowrap; font-family: var(--f-text); }
.x-journey .rv-n:last-of-type { transform: translateX(-70%); }
.x-journey .ovd { position: absolute; top: 1.35rem; transform: translateX(-50%); appearance: none; border: 0; background: none; cursor: pointer; display: grid; justify-items: center; gap: .2rem; padding: .25rem .1rem; color: var(--ink); min-width: 44px; min-height: 44px; }
.x-journey .ovd .d { width: .9rem; height: .9rem; border-radius: 50%; border: 2px solid var(--saffron); background: var(--paper); margin-top: .35rem; }
.x-journey .ovd:hover .d, .x-journey .ovd:focus-visible .d { background: var(--saffron); }
.x-journey .ovd .l { font-size: .74rem; line-height: 1.2; text-align: center; max-width: 5.6rem; }
.x-journey .ov[data-born~="apegaon"] .ovd[data-k="1"] .d, .x-journey .ov[data-born~="alandi"] .ovd[data-k="4"] .d { box-shadow: 0 0 0 4px color-mix(in srgb, var(--saffron) 35%, transparent); background: var(--saffron); }
.x-journey .ovd[data-k="4"] { transform: translateX(-58%); }
.x-journey .bornl { margin: 0; color: var(--saffron-ink); }
.x-journey .reach-wrap { margin-top: var(--sp-6); }
.x-journey .reach { scroll-margin-top: calc(var(--head-h) + .5rem); margin-bottom: var(--sp-3); color: var(--ink-3); }
.x-journey .reach .wv { width: 100%; height: 1.8rem; display: block; overflow: visible; }
.x-journey .reach .wv path { fill: none; stroke: var(--saffron); stroke-width: 1.4; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: .75; }
.x-journey .rh { display: flex; gap: var(--sp-3); align-items: center; margin-top: var(--sp-2); }
.x-journey .rh .ic { width: 3.2rem; height: 2.4rem; flex: none; color: var(--maroon); }
.x-journey .rh h2 { font-family: var(--f-text); font-size: var(--s-3); line-height: 1.2; margin: 0; color: var(--ink); font-weight: 400; }
.x-journey .rh p { margin: .1rem 0 0; }
.x-journey .st { scroll-margin-top: calc(var(--head-h) + .5rem); padding-bottom: var(--sp-5); }
.x-journey .st-h { padding: .5rem 0 .5rem 2.6rem; min-height: 3.4rem; width: 100%; }
.x-journey .st-t { display: block; }
.x-journey .eb { display: flex; align-items: center; gap: .45rem; font-size: var(--s--1); color: var(--saffron-ink); margin-bottom: .1rem; }
.x-journey .tt { display: block; font-family: var(--f-text); font-size: var(--s-1); line-height: 1.35; }
.x-journey .st-w { display: block; margin-top: .1rem; }
.x-journey .pip { width: .5rem; height: .5rem; border-radius: 50%; background: var(--ink-3); flex: none; }
.x-journey .pip.cs-broadly-supported { background: var(--ok); } .x-journey .pip.cs-reconstruction { background: var(--warn); }
.x-journey .pip.cs-devotional-tradition { background: var(--saffron); }
.x-journey .pip.cs-disagreement { background: none; box-shadow: inset 0 0 0 2px var(--doubt); transform: rotate(45deg); border-radius: 1px; }
.x-journey .st-b { padding: var(--sp-2) 0 0 2.6rem; max-width: calc(var(--measure) + 2.6rem); }
.x-journey .tell { font-family: var(--f-text); font-size: var(--s-0); line-height: 1.85; margin: 0 0 var(--sp-3); }
.x-journey .tq { margin: 0 0 var(--sp-2); }
.x-journey .aside { font-size: var(--s--1); line-height: 1.7; color: var(--ink-2); border-left: 2px solid var(--rule); padding-left: var(--sp-3); margin: var(--sp-3) 0; }
.x-journey .st-fk { font-size: var(--s--1); color: var(--doubt); margin: var(--sp-3) 0 var(--sp-2); }
.x-journey .st-paths { grid-template-columns: 1fr; gap: var(--sp-4); }
@media (min-width: 46rem) { .x-journey .st-paths { grid-template-columns: 1fr 1fr; } }
.x-journey .st-path { font-size: var(--s-0); padding-top: var(--sp-2); }
.x-journey .st-path.walking { border-top-color: var(--saffron); }
.x-journey .st-pt { font-size: var(--s-1); }
.x-journey .pb { margin: 0 0 var(--sp-2); line-height: 1.75; }
.x-journey .walkb { display: inline-flex; align-items: center; gap: .4rem; min-height: 44px; }
.x-journey .walkb::after { content: "→"; transition: transform .2s; }
.x-journey .walkb[aria-expanded="true"]::after { transform: rotate(90deg); }
.x-journey .walk { margin-top: var(--sp-2); padding-left: var(--sp-3); border-left: 2px solid var(--saffron); }
.x-journey .wk { margin: 0 0 var(--sp-2); line-height: 1.75; }
.x-journey .lzh { font-family: var(--f-ui); font-size: var(--s--1); font-weight: 600; color: var(--ink-3); margin: var(--sp-4) 0 var(--sp-2); }
.x-journey .pm { list-style: none; margin: 0 0 var(--sp-2); padding: 0; }
.x-journey .pm li { margin: 0 0 var(--sp-3); line-height: 1.7; }
.x-journey .pm .in { font-family: var(--f-text); font-size: var(--s-0); display: block; }
.x-journey .pmw { font-size: var(--s--1); color: var(--maroon); }
.x-journey .ep { color: var(--ink-3); }
.x-journey .vs-i { margin: 0 0 var(--sp-3); }
.x-journey .vs { font-family: var(--f-text); font-size: var(--s-1); line-height: 1.8; margin: 0; }
.x-journey .vs .h { display: block; padding-left: 1.4em; text-indent: -.9em; }
.x-journey .vs .h:first-child { padding-left: .7em; }
.x-journey .vl, .x-journey .ws { margin: .1rem 0 0; }
.x-journey .lks { margin: var(--sp-3) 0 0; font-size: var(--s--1); }
.x-journey .lks a { color: var(--maroon); }
.x-journey .lk { margin: var(--sp-2) 0 0; font-size: var(--s--1); }
.x-journey .nx { margin: var(--sp-3) 0 0; }
.x-journey .nx .xlink { min-height: 44px; }
.x-journey .st-b .photo { margin: 0 0 var(--sp-3); }
.x-journey .vx { margin: var(--sp-3) 0; gap: var(--sp-4); }
.x-journey .end { margin-top: var(--sp-6); padding-top: var(--sp-4); border-top: 1px solid var(--rule); }
.x-journey .end .lead { font-family: var(--f-text); font-size: var(--s-2); margin: 0 0 .2rem; }
.x-journey .st-h:focus-visible, .x-journey .ovd:focus-visible, .x-journey .walkb:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .x-journey .walkb::after { transition: none; } }
</style>`;
