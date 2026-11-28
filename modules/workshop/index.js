// The workshop (कार्यशाळा): the one door to the research archive of version 1. Routes: #/workshop, #/workshop/credits.
// The archive pages keep their own routes (#/life/..., #/evidence/..., etc.) and now carry a slim workshop band.
import { t, registerLabels } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { icon } from '../../assets/js/components.js';
import { allPhotos } from '../../assets/js/experience.js';
import { lang } from '../../assets/js/i18n.js';
import { GROUPS } from '../../assets/js/app.js';

registerLabels('ws', {
  mr: {
    'lead': 'येथे प्रत्येक विधानामागचे काम आहे: स्रोत आणि त्यांचा दर्जा, मतभेद शेजारी शेजारी, काय शोधले आणि काय सापडले नाही, संपूर्ण याद्या आणि माहितीच्या फायली. सर्व माहिती तात्पुरती आहे; संशोधन चालू आहे.',
    'rooms': 'दालने', 'search': 'शोध', 'search.d': 'सर्व ग्रंथांत एखादी ओळ किंवा शब्द शोधा',
    'credits': 'श्रेय आणि परवाने', 'credits.d': 'मजकूर, टंक आणि छायाचित्रे कोठून आली आणि कोणत्या परवान्याने',
    'cr.texts': 'मजकूर', 'cr.fonts': 'टंक', 'cr.photos': 'छायाचित्रे', 'cr.photos.none': 'अजून एकही छायाचित्र लावलेले नाही. प्रत्येक छायाचित्र मुक्त परवान्याचे (विकिमीडिया कॉमन्स) असेल आणि त्याचे श्रेय येथे व छायाचित्राखाली दिसेल. माऊलींचे चित्र किंवा चेहरा कोठेही दाखवलेला नाही.',
    'cr.ws': 'ज्ञानेश्वरी (अध्याय ७ सोडून), अमृतानुभवाचे पहिले प्रकरण आणि चांगदेव पासष्टी: मराठी विकिस्रोत, CC BY-SA 4.0. प्रत्येक पानाचा दुवा त्या मजकुराखाली आहे.',
    'cr.sd': 'ज्ञानेश्वरी अध्याय ७, अमृतानुभवाची इतर प्रकरणे आणि हरिपाठ: Sanskrit Documents. तेथील अटी केवळ वैयक्तिक अभ्यासाला परवानगी देतात, म्हणून येथे फक्त पहिल्या ओळी.',
    'cr.gatha': 'अभंगांची गाथा: गाथापंचक (साखरे, १९०८) या प्रताधिकारमुक्त आवृत्तीचा पाठ; इतर दोन आवृत्त्यांच्या (संतवाणी, तेलंग १९५४) फक्त पहिल्या ओळी.',
    'cr.es': 'नामदेवांचे समाधीचे अभंग: ई-साहित्य प्रतिष्ठानची ‘संत नामदेवांची अभंगगाथा’, जिला प्रकाशक प्रताधिकारमुक्त म्हणतात आणि मुक्तपणे वाटण्यास परवानगी देतात. स्कॅन-पाठ, तपासलेला नाही.',
    'cr.tl': 'ट्रान्सलिटरल (TransLiteral) वरील नामदेवांच्या अभंगांच्या फक्त पहिल्या ओळी: तेथील परवाना-सूचना आणि संकेतस्थळाच्या अटी परस्परविरोधी आहेत.',
    'cr.fonts.t': 'Tiro Devanagari Marathi आणि Mukta: SIL Open Font License.',
    'cr.data.r': 'या संकेतस्थळावरील संशोधन-माहिती (नोंदी, तारखा, जुळण्या, विषय): सर्व हक्क सध्या राखीव. वाचन आणि अभ्यासापलीकडे वापर करायचा असल्यास आधी विचारा.',
    'cr.data': 'माहितीच्या सर्व फायली आणि त्यांचे आकार',
    'cr.photos.lead': 'सर्व {n} छायाचित्रे विकिमीडिया कॉमन्सवरील, मुक्त परवान्याची. प्रत्येक छायाचित्राखाली त्याचे श्रेय आहे. माऊलींचे चित्र किंवा चेहरा कोठेही दाखवलेला नाही.',
    'cr.by': 'छायाचित्र:', 'cr.commons': 'कॉमन्सवरील मूळ पान', 'cr.changes': 'येथे आकार लहान केला आणि पुन्हा संकुचित केले; इतर बदल नाहीत.',
  },
  en: {
    'lead': 'Here is the work behind every statement: the sources and their tiers, disagreements side by side, what was searched and not found, the full lists and the data files. All of it is provisional; the research is ongoing.',
    'rooms': 'Rooms', 'search': 'Search', 'search.d': 'Search all the texts for a line or a word',
    'credits': 'Credits and licences', 'credits.d': 'Where the texts, fonts and photographs come from, and under which licence',
    'cr.texts': 'Texts', 'cr.fonts': 'Fonts', 'cr.photos': 'Photographs', 'cr.photos.none': 'No photograph has been placed yet. Each will carry a free licence (Wikimedia Commons), credited here and under the picture. No picture or face of the saint is shown anywhere.',
    'cr.ws': 'Dnyaneshwari (except chapter 7), Amritanubhav chapter 1 and Changdev Pasashti: Marathi Wikisource, CC BY-SA 4.0; the page link is given under each text.',
    'cr.sd': 'Dnyaneshwari chapter 7, the other chapters of the Amritanubhav and the Haripath: Sanskrit Documents, whose terms allow personal study only, so only first lines are shown.',
    'cr.gatha': 'The gatha: the text of the out-of-copyright Gathapanchak (Sakhare, 1908); first lines only of the other two editions (Santavani, Telang 1954).',
    'cr.es': "Namdev's samadhi abhangas: e-Sahitya Pratishthan's Sant Namdev Abhang Gatha, which the publisher calls copyright-free and allows to be shared. Scan text, unchecked.",
    'cr.tl': "TransLiteral: first lines only of Namdev's abhangas; its licence notice and its site terms conflict.",
    'cr.fonts.t': 'Tiro Devanagari Marathi and Mukta: SIL Open Font License.',
    'cr.data.r': 'The research data on this site (records, dates, matches, themes): all rights reserved for now. Please ask before using it beyond reading and study.',
    'cr.data': 'Every data file and its size',
    'cr.photos.lead': 'All {n} photographs are from Wikimedia Commons under free licences, credited under each picture. No picture or face of the saint is shown anywhere.',
    'cr.by': 'Photo:', 'cr.commons': 'original page on Commons', 'cr.changes': 'Resized and recompressed here; no other changes.',
  },
});

export const title = (ctx) => (ctx.path[0] === 'credits' ? t('ws.credits') : t('x.workshop'));

export async function render(ctx) {
  if (ctx.path[0] === 'credits') return credits(ctx);
  const li = (route, title, d, ic = icon.pataka) => `<li><a href="#/${route}"><span class="mark">${ic}</span><span class="t">${esc(title)}</span><span></span><span class="d">${esc(d)}</span></a></li>`;
  ctx.el.innerHTML = `<div class="page wide">
    <h1 tabindex="-1">${esc(t('x.workshop'))}</h1>
    <p class="muted" style="max-width:var(--measure)">${esc(t('ws.lead'))}</p>
    <h2>${esc(t('ws.rooms'))}</h2>
    <ul class="doors two">${GROUPS.map((g) => li(g, t('g.' + g), t('g.' + g + '.d'))).join('')}
      ${li('search', t('ws.search'), t('ws.search.d'), icon.search)}${li('workshop/credits', t('ws.credits'), t('ws.credits.d'))}</ul>
  </div>`;
}

async function credits(ctx) {
  const photos = await allPhotos();
  const m = await getJSON('manifest.json').catch(() => null);
  const L = lang();
  ctx.el.innerHTML = `<div class="page">
    <p class="crumbs"><a href="#/workshop">${esc(t('x.workshop'))}</a></p>
    <h1 tabindex="-1">${esc(t('ws.credits'))}</h1>
    <h2>${esc(t('ws.cr.texts'))}</h2>
    <ul class="honest"><li>${esc(t('ws.cr.ws'))}</li><li>${esc(t('ws.cr.sd'))}</li><li>${esc(t('ws.cr.gatha'))}</li><li>${esc(t('ws.cr.es'))}</li><li>${esc(t('ws.cr.tl'))}</li><li>${esc(t('ws.cr.data.r'))}</li></ul>
    <h2>${esc(t('ws.cr.photos'))}</h2>
    <p class="muted">${esc(t('ws.cr.photos.lead', { n: num(photos.length) }))}</p>
    ${photos.length ? `<ul class="ph-credits">${photos.map((p) => `<li>
      <img src="media/${esc(p.small || p.file)}" alt="" width="${p.w}" height="${p.h}" loading="lazy" decoding="async">
      <div><p class="t"${L === 'mr' ? ' lang="mr"' : ''}>${esc(L === 'mr' ? p.caption_mr : p.caption_en)}</p>
      <p class="small">${esc(t('ws.cr.by'))} ${esc(p.author)}; <a href="${esc(p.licence_url)}" rel="noopener">${esc(p.licence)}</a>;
        <a href="${esc(p.source_page)}" rel="noopener">${esc(t('ws.cr.commons'))}</a></p>
      <p class="small faint"><span lang="en">${esc(p.commons_title || '')}</span>${p.date ? `, ${esc(String(p.date).slice(0, 10))}` : ''}. ${esc(t('ws.cr.changes'))}</p></div></li>`).join('')}</ul>`
      : `<p class="muted">${esc(t('ws.cr.photos.none'))}</p>`}
    <h2>${esc(t('ws.cr.fonts'))}</h2>
    <p>${esc(t('ws.cr.fonts.t'))}</p>
    ${m ? `<p class="small"><a href="#/evidence/downloads">${esc(t('ws.cr.data'))}</a> (${esc(num(Object.keys(m.files).length))})</p>` : ''}
  </div>`;
}
