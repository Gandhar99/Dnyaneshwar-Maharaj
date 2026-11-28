// Marathi for the short English-only fields of life.json that work as headings: the dispute questions, the dispute
// positions and the subjects of the date claims. Translated by hand for the site (27 Nov 2026), awaiting the owner's
// review; the data keep their English. Keyed by the exact English text, so a changed or new row simply shows its English.
// Longer data prose (proponents, current views, evidence notes) stays English and keeps its "English only" note.
import { lang } from './i18n.js';
import { esc } from './util.js';

const MR = {
  // dispute questions
  'Birth year': 'जन्मवर्ष',
  'Birthplace': 'जन्मस्थान',
  'Same person or two Dnyandevs': 'एकच व्यक्ती की दोन ज्ञानदेव?',
  'Authorship of the abhanga gatha': 'अभंगगाथेचे कर्तृत्व',
  'Attributed minor works': 'नावावर चालणाऱ्या इतर लहान रचना',
  'Dating verse of the Dnyaneshwari': 'ज्ञानेश्वरीतील कालनिर्देशक ओवी',
  'Place of composition': 'ज्ञानेश्वरीच्या रचनेचे स्थान',
  "Textual history and Eknath's recension": 'पाठाचा इतिहास आणि एकनाथांची प्रत',
  'Eknath recension': 'एकनाथांनी तयार केलेली शुद्ध प्रत',
  "Reliability of Namdev's biographical cycles": 'नामदेवांच्या चरित्रपर आख्यानांची विश्वसनीयता',
  "Vitthalpant's Kashi guru": 'विठ्ठलपंतांचे काशीतील गुरू',
  'Samadhi Shaka year and weekday': 'समाधीचे शकवर्ष आणि वार',
  'Historicity of miracles': 'चमत्कारकथांची ऐतिहासिकता',
  // dispute positions
  '1275 (Shaka 1197)': 'इ.स. १२७५ (शके ११९७)',
  '1271': 'इ.स. १२७१',
  'Apegaon (Paithan taluka) as family home and place of birth': 'आपेगाव (पैठण तालुका): कुटुंबाचे मूळ गाव आणि जन्मस्थान',
  'Alandi': 'आळंदी',
  'Dnyaneshwari, Amritanubhava and Pasashti are by one Dnyandev, and the simpler abhangas by a later poet of the same name':
    'ज्ञानेश्वरी, अमृतानुभव आणि पासष्टी एका ज्ञानदेवांच्या; साधे अभंग त्याच नावाच्या नंतरच्या कवीचे',
  'Many abhangas are probably not his; yoga-theme abhangas, gaulan, virani and Haripath linked to his style; some interpolated':
    'बरेच अभंग बहुधा त्यांचे नाहीत; योगपर अभंग, गवळणी, विराण्या आणि हरिपाठ यांचा संबंध त्यांच्या शैलीशी जोडला जातो; काही प्रक्षिप्त',
  'About twenty-five works credited to him, including Uttargeeta, Prakritageeta, Panchikaran, Shukashtak, Yogavasistha, are not his by internal evidence':
    'उत्तरगीता, प्राकृतगीता, पंचीकरण, शुकाष्टक, योगवासिष्ठ यांसह त्यांच्या नावावर चालणाऱ्या सुमारे पंचवीस रचना अंतर्गत पुराव्यानुसार त्यांच्या नाहीत',
  'The "Shaka 1212" verse is Dnyaneshwar\'s own': '"शके १२१२" ची ओवी माऊलींची स्वतःचीच आहे',
  'The verse was added by Eknath in the 16th century; the text still falls within the reign of Ramachandra (1271-1309)':
    'ही ओवी एकनाथांनी सोळाव्या शतकात जोडली; तरीही ग्रंथ रामचंद्र (रामदेवराय) यादवांच्या कारकिर्दीतीलच (१२७१–१३०९) ठरतो',
  'Nevasa': 'नेवासे',
  'Interpolation and variants crept in; Eknath prepared a corrected copy in 1584 and no reliable earlier manuscript is known':
    'पाठात प्रक्षेप आणि पाठभेद शिरले; एकनाथांनी १५८४ मध्ये शुद्ध प्रत तयार केली; त्याआधीचे विश्वसनीय हस्तलिखित माहीत नाही',
  'Eknath only corrected an already pure text (his own closing verses)': 'एकनाथांनी आधीच शुद्ध असलेला पाठ फक्त तपासला (त्यांच्याच शेवटच्या ओव्यांनुसार)',
  'Adi, Tirthavali and Samadhi are by the contemporary Namdev and are the main source':
    'आदि, तीर्थावळी आणि समाधी ही आख्याने समकालीन नामदेवांचीच; तीच मुख्य स्रोत',
  'Nrisimhashram': 'नृसिंहाश्रम',
  'Ramanand (not the Kabir-era figure)': 'रामानंद (कबीरकालीन रामानंद नव्हेत)',
  'Ramashram, according to Namdev abhangas': 'रामाश्रम, नामदेवांच्या अभंगांनुसार',
  'Shaka 1218 (Vishwakosh; Marathi Wikipedia body), Shaka 1217 (Marathi Wikipedia infobox); Thursday vs Sunday':
    'शके १२१८ (विश्वकोश; मराठी विकिपीडियाचा मजकूर), शके १२१७ (मराठी विकिपीडियाची माहितीचौकट); गुरुवार की रविवार',
  'Buffalo, wall and revival stories are hagiography; the Paithan episode shows siblings persuading scholars by conduct and teaching':
    'रेडा, भिंत आणि पुन्हा जिवंत करण्याच्या कथा भक्तिपर चरित्रकथा आहेत; पैठणच्या प्रसंगात भावंडे आपल्या आचरणाने आणि शिकवणीने पंडितांचे मन वळवतात',
  // date-claim subjects
  'birth': 'जन्म',
  'birth of Muktabai': 'मुक्ताबाईंचा जन्म',
  'birth of Nivruttinath': 'निवृत्तिनाथांचा जन्म',
  'birth of Sopandev': 'सोपानदेवांचा जन्म',
  'birth of siblings (Alandi alternative)': 'भावंडांचा जन्म (आळंदीचा पर्याय)',
  'composition of the Dnyaneshwari': 'ज्ञानेश्वरीची रचना',
  'sanjivan samadhi': 'संजीवन समाधी',
  'sanjivan samadhi (Namdev account)': 'संजीवन समाधी (नामदेवांच्या कथनानुसार)',
  'Eknath recension of the Dnyaneshwari': 'ज्ञानेश्वरीची एकनाथी प्रत',
  'Eknath recension, writing completed': 'एकनाथी प्रत: लेखन पूर्ण',
  'Eknath visit to the samadhi': 'एकनाथांची समाधीभेट',
  'Mahipati Bhaktalilamrita': 'महीपतींचे भक्तलीलामृत',
  'Mahipati Bhaktavijaya': 'महीपतींचे भक्तविजय',
  'Namdev Samadhi cycle, oldest manuscript': 'नामदेवांचे समाधी-आख्यान: सर्वात जुने हस्तलिखित',
  'Wikisource gatha edition (Avate)': 'विकिस्रोतावरील गाथेची आवृत्ती (आवटे)',
};

/** Is there Marathi for this English field? */
export const hasMr = (en) => Object.prototype.hasOwnProperty.call(MR, String(en ?? '').trim());
/** The field in the reader's language where we have it: { text, lang }. */
export function term(en) {
  const k = String(en ?? '').trim();
  return lang() === 'mr' && hasMr(k) ? { text: MR[k], lang: 'mr' } : { text: k, lang: 'en' };
}
/** The field as HTML inside a tag that carries its language (default span). */
export function termHtml(en, tag = 'span', attrs = '') {
  const x = term(en);
  return `<${tag}${attrs ? ' ' + attrs : ''} lang="${x.lang}">${esc(x.text)}</${tag}>`;
}
