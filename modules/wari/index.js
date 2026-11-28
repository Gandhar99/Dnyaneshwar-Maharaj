// G. Wari companion. Route: #/wari (opens on today's day in the season, else on the opening), #/wari?d=<YYYY-MM-DD of a day>.
// Data: calendar.json (palkhi_stages, 2026), places.json (coordinates). The map is drawn here from those coordinates
// (schematic, no tiles); a halt without coordinates is named and not placed. Every fact carries its mark.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, todayIST, formatDate } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { mark, pager, voices, daysTo, photo, photoMeta, photosReady, openSheet, closeSheet, door } from '../../assets/js/experience.js';

registerLabels('wari', {
  mr: {
    'sub': 'आळंदी ते पंढरपूर, आणि परत; एका वेळी एक दिवस.',
    'year': '२०२६ ची वारी', 'in.season': 'आज वारीचा दिवस आहे.',
    'before': 'वारी सुरू होण्यास {n} दिवस आहेत; प्रस्थान ८ जुलैला.',
    'replay': 'वारीचा हंगाम नाही; येथे २०२६ ची वारी पुन्हा दाखवली आहे. इतर वर्षांचे वेळापत्रक आमच्याकडे नाही.',
    'out': 'आळंदी ते पंढरपूर', 'ret': 'पंढरपूर ते आळंदी', 'days': 'वारीचे दिवस',
    'pager': 'वारीचे दिवस',
    'day.out': 'दिवस {n} / {of}', 'day.ret': 'परतीचा दिवस {n} / {of}', 'today': 'आज',
    'stay': 'या दिवसाचे ठिकाण', 'start': 'पहिला दिवस', 'what.day': 'या दिवसाचे ठिकाण',
    'ringan.what': 'रिंगणाची नोंद', 'nira.what': 'नीरा स्नानाची नोंद', 'dist.what': 'अंतराची नोंद',
    'ringan.q': 'रिंगण म्हणजे काय?', 'ringan.t': 'रिंगण',
    'n.1': 'पहिले', 'n.2': 'दुसरे', 'n.3': 'तिसरे', 'n.4': 'चौथे', 'k.ubha': 'उभे', 'k.gol': 'गोल',
    'k.ubha.l': 'उभे रिंगण', 'k.gol.l': 'गोल रिंगण', 'nira.l': 'नीरा स्नान',
    'dist': 'सुमारे {km} किमी; एकाच स्रोतानुसार.',
    'ret.note': 'परतीचा प्रवास: फक्त दोन स्रोत, आणि ते मे महिन्यातील कार्यक्रमाचे वृत्त आहे. प्रत्यक्ष दिवसाचे वृत्त सापडले नाही.',
    'ret.note.what': 'परतीच्या वाटेचा आधार', 'ret.band': 'परतीची वाट',
    'unplaced': '{p}: नकाशावर या ठिकाणाचे स्थान दिलेले नाही.',
    'map.note': 'सूचक नकाशा, मापाचा नाही. खुणा त्या दिवसाच्या वाटेवर आहेत; नेमकी जागा दाखवलेली नाही.',
    'map.label': 'वारीचा मार्ग',
    'two': 'दोन आवाज', 'adopted': 'यापैकी पहिला स्वीकारला आहे; दुसरा मतभेद म्हणून दाखवला आहे.',
    'src.n': '{n} स्रोत', 'src.1': 'एक स्रोत',
    'open.lead': 'आळंदीहून निघालेली पालखी पंढरपूर गाठते आणि परत येते. वाट काढत जा; प्रत्येक दिवस वेगळा.',
    'open.photo': 'या पानावरील छायाचित्रे वेगवेगळ्या वर्षांच्या वारींची आहेत; त्या त्या छायाचित्राखाली वर्ष दिले आहे.',
    'end.t': 'वारी येथे पूर्ण होते.', 'end.l': 'ही २०२६ च्या वेळापत्रकानुसारची वाट आहे; प्रत्यक्ष वारीत कधी कधी बदल होतात.',
    'end.d1': 'आळंदीतील सोहळा', 'end.d1.l': 'कार्तिकी वारी आणि संजीवन समाधी सोहळा, १ ते ८ डिसेंबर',
    'end.d2': 'पूर्ण नोंद', 'end.d2.l': 'कार्यशाळेत: प्रत्येक दिवसाचे सर्व स्रोत',
    'rs.1': 'रिंगण हा पालखीच्या वाटेवरचा एक विशेष थांबा आहे. आमच्या नोंदींत त्याचे दोन प्रकार येतात: उभे रिंगण आणि गोल रिंगण. नावांचा अर्थ साधाच: उभे म्हणजे उभे राहिलेले, गोल म्हणजे वर्तुळाकार.',
    'rs.2': '२०२६ च्या वाटेवर सात रिंगणे नोंदली आहेत: तीन उभी आणि चार गोल. वाखरीतील बाजीरावाच्या विहिरीजवळ एकाच ठिकाणी एक उभे आणि एक गोल रिंगण आहे.',
    'rs.3': 'रिंगणात प्रत्यक्ष काय घडते याचे वर्णन आमच्या नोंदींत नाही, म्हणून ते येथे लिहिलेले नाही. तपासलेले इतकेच: कोणत्या दिवशी, कोणत्या ठिकाणी, कोणते रिंगण.',
    'rs.photo': 'खालील दिवसांची छायाचित्रे गोल रिंगणाची आहेत.',
    'rs.days': 'रिंगणाचे दिवस', 'rs.what': 'रिंगणाची नोंद',
    'ev.sheet': 'या दिवसाचा आधार',
  },
  en: {
    'sub': 'Alandi to Pandharpur and back, one day at a time.',
    'year': 'The wari of 2026', 'in.season': 'The wari is on the road today.',
    'before': 'The wari sets out in {n} days, on 8 July.',
    'replay': 'It is not wari season. This replays the wari of 2026; we have no schedule for any other year.',
    'out': 'Alandi to Pandharpur', 'ret': 'Pandharpur to Alandi', 'days': 'Days of the wari',
    'pager': 'Days of the wari',
    'day.out': 'Day {n} of {of}', 'day.ret': 'Return, day {n} of {of}', 'today': 'today',
    'stay': 'Place for the day', 'start': 'First day', 'what.day': "the day's place",
    'ringan.what': 'the ringan record', 'nira.what': 'the Nira bath record', 'dist.what': 'the distance record',
    'ringan.q': 'What is a ringan?', 'ringan.t': 'Ringan',
    'n.1': 'First', 'n.2': 'Second', 'n.3': 'Third', 'n.4': 'Fourth', 'k.ubha': 'ubha (standing)', 'k.gol': 'gol (round)',
    'k.ubha.l': 'ubha ringan', 'k.gol.l': 'gol ringan', 'nira.l': 'Nira snan',
    'dist': 'About {km} km, from one source.',
    'ret.note': 'The return leg rests on two sources only, both programme reports from May. No report from the day itself was found.',
    'ret.note.what': 'what the return leg rests on', 'ret.band': 'The way back',
    'unplaced': '{p}: this place has no location in our data, so it is named and not placed on the map.',
    'map.note': 'A schematic map, not to scale. The signs sit on that day\'s leg; the exact spot is not shown.',
    'map.label': 'The route of the wari',
    'two': 'Two voices', 'adopted': 'The first is adopted; the second is shown as a disagreement.',
    'src.n': '{n} sources', 'src.1': 'One source',
    'open.lead': 'The palkhi leaves Alandi, reaches Pandharpur and comes back. Swipe on; every day is different.',
    'open.photo': 'The photographs on this page come from wari of different years; each carries its year.',
    'end.t': 'The wari ends here.', 'end.l': 'This is the route as scheduled for 2026; on the road itself plans sometimes change.',
    'end.d1': 'At Alandi', 'end.d1.l': 'The Kartiki wari and the samadhi sohala, 1 to 8 December',
    'end.d2': 'The full record', 'end.d2.l': 'In the workshop: every source for every day',
    'rs.1': 'A ringan is a special halt on the palkhi\'s road. Our records give two kinds: ubha ringan and gol ringan. The names are plain words: ubha is standing, gol is round.',
    'rs.2': 'The road of 2026 has seven ringans on record: three ubha and four gol. At the Bajirao Well in Wakhri one ubha and one gol ringan are at the same place.',
    'rs.3': 'Our records do not describe what happens at a ringan, so it is not written here. What is checked is only this: which day, which place, which ringan.',
    'rs.photo': 'The photographs on those days show a gol ringan.',
    'rs.days': 'The days of the ringans', 'rs.what': 'the ringan record',
    'ev.sheet': "this day's basis",
  },
});

export const title = () => t('x.wari');

// ---------- small helpers ----------
const ids = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? (v.match(/DNY[A-Z0-9-]+/g) || []) : []);
const jparse = (v) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; } };
const confOf = (n) => (n >= 3 ? 'confirmed' : n === 2 ? 'two sources' : 'single source');
const ORD = { first: 1, second: 2, third: 3, fourth: 4 };
// Marathi spellings of the ringan sites named in the rows (written by hand from the row text)
const SITE = {
  'Chandoba Limb': 'चांदोबाचा लिंब', 'Purandawade': 'पुरंदावडे', 'Khudus Phata': 'खुडूस फाटा',
  'Thakurbuva Samadhi': 'ठाकूरबुवांची समाधी', 'Bajirao Well': 'बाजीरावाची विहीर', 'near Paduka, Wakhri': 'वाखरी, पादुकांजवळ',
};
const OTHER_MR = { Purandawade: 'पुरंदावडे' };   // variant halts that have no place row
// Photograph for a day's first screen (only where the caption does not claim anything the day does not hold)
const PHOTO = {
  'DNYP-PS-01': ['palkhi-alandi', 'river'], 'DNYP-PS-02': ['palkhi-rath', 'road'], 'DNYP-PS-05': ['palkhi-saswad', 'road'],
  'DNYP-PS-06': ['dindi-flags', 'road'], 'DNYP-PS-13': ['ashva-road', 'road'], 'DNYP-PS-14': ['ringan-horse', 'road'],
  'DNYP-PS-15': ['ringan-crowd', 'road'], 'DNYP-PS-17': ['wari-flags', 'road'],
  'DNYP-PS-R1': ['chandrabhaga-ghats', 'river'], 'DNYP-PS-R11': ['palkhi-petals', 'road'],
};
// Hand-written lines for the days the rows describe (each exactly as strong as its row; the row is in the mark)
const HAND = {
  'DNYP-PS-01': { mr: 'आळंदीतील समाधी मंदिरातून पालखीचे प्रस्थान.', en: 'The palkhi sets out from the samadhi temple at Alandi.' },
  'DNYP-PS-02': { mr: 'पुण्यात भवानी पेठेतील पालखी विठोबा मंदिरात विसावा.', en: 'The halt in Pune is at the Palkhi Vithoba temple, Bhavani Peth.' },
  'DNYP-PS-03': { mr: 'पुण्यातच दुसरा दिवस; भवानी पेठ.', en: 'A second day in Pune, at Bhavani Peth.' },
  'DNYP-PS-05': { mr: 'सासवडातच दुसरा दिवस. सासवड हे संत सोपानदेवांच्या समाधीचे गाव.', en: 'A second day at Saswad, the seat of the samadhi of Sant Sopandev.' },
  'DNYP-PS-17': { mr: 'वाखरीहून पंढरपूरला आगमन; पादुकांजवळ आरती.', en: 'Arrival at Pandharpur from Wakhri; aarti near the paduka.' },
  'DNYP-PS-18': { mr: 'पंढरपुरात आषाढी एकादशीचा सोहळा.', en: 'The Ashadhi Ekadashi celebration at Pandharpur.' },
  'DNYP-PS-R1': { mr: 'चंद्रभागा स्नान, गोपाळपूरचा काला, विठ्ठल-रुक्मिणींची भेट; येथून परतीचा प्रवास सुरू.', en: 'Chandrabhaga snan, the Gopalpur kala and the meeting with Vitthal and Rukmini; the return begins.' },
  'DNYP-PS-R12': { mr: 'आळंदीची नगरप्रदक्षिणा, समारोपाची.', en: 'The concluding nagar pradakshina of Alandi.' },
};
const TUKA = {
  'DNYP-PS-02': { mr: 'संत तुकाराम महाराजांची पालखीही ९ जुलैला पुण्यात आली; निवडुंगा विठ्ठल मंदिर, नाना पेठ येथे विसावा. दोन पालख्यांच्या भेटीचे वर्णन कोणत्याही स्रोतात नाही.', en: 'The palkhi of Sant Tukaram Maharaj also reached Pune on 9 July, halting at the Nivdung Vitthal temple, Nana Peth. No source describes a meeting of the two.' },
  'DNYP-PS-03': { mr: 'संत तुकाराम महाराजांची पालखीही याच दिवसांत पुण्यात, नाना पेठेत. भेटीचे वर्णन नाही.', en: 'The palkhi of Sant Tukaram Maharaj is also in Pune these days, at Nana Peth. No meeting is described.' },
  'DNYP-PS-16': { mr: 'त्याच रात्री संत तुकाराम महाराजांची पालखीही वाखरीत (बाजीरावाची विहीर). भेटीचे वर्णन नाही.', en: 'The palkhi of Sant Tukaram Maharaj is also at Wakhri that night, at the Bajirao Well. No meeting is described.' },
  'DNYP-PS-R1': { mr: 'त्या रात्री संत तुकाराम महाराजांची पालखीही वाखरीत. भेटीचे वर्णन नाही.', en: 'The palkhi of Sant Tukaram Maharaj is also at Wakhri that night. No meeting is described.' },
  'DNYP-PS-R9': { mr: 'संत तुकाराम महाराजांची पालखी ६-७ ऑगस्टला पुण्यात नवी पेठेत; आपली पालखी भवानी पेठेत. भेटीचे वर्णन नाही.', en: 'The palkhi of Sant Tukaram Maharaj halts at Navi Peth, Pune, on 6-7 August; this palkhi is at Bhavani Peth. No meeting is described.' },
};

// ---------- the map: drawn from coordinates, schematic ----------
const VW = 340, VH = 250, PX = 38, PY = 26;
function makeProject(pts) {
  const lats = pts.map((p) => p[0]), lons = pts.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const c = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
  const w = (maxLon - minLon) * c, h = maxLat - minLat;
  const k = Math.min((VW - 2 * PX) / w, (VH - 2 * PY) / h);
  const ox = (VW - w * k) / 2, oy = (VH - h * k) / 2;
  return (lat, lon) => [ox + (lon - minLon) * c * k, oy + (maxLat - lat) * k];
}
const f1 = (n) => Math.round(n * 10) / 10;
function curve(a, b, bow) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return `M${f1(a[0])} ${f1(a[1])}Q${f1(mx - dy * bow)} ${f1(my + dx * bow)} ${f1(b[0])} ${f1(b[1])}`;
}
// label offsets [dx, dy, anchor] for places that need one (default: to the right, or to the left on the right edge)
const LAB = { 'DNYP-PL-10': [-7, 13, 'start'], 'DNYG-P-PL11': [-5, 15, 'end'], 'DNYP-PL-05': [0, -10, 'middle'], 'DNYG-P-PL13': [8, 12, 'start'],
  'DNYG-P-PL09': [-6, 14, 'end'], 'DNYP-PL-06': [8, 4, 'start'], 'DNYG-P-PL07': [-4, 15, 'end'], 'DNYG-P-PL05': [-6, 14, 'end'], 'DNYG-P-PL08': [3, -11, 'middle'],
  'DNYG-P-PL03': [10, -3, 'start'] };

function glyph(kind, x, y, on) {
  const cls = on ? ' on' : '';
  if (kind === 'gol') return `<g class="gl gol${cls}" transform="translate(${f1(x)} ${f1(y)})"><circle r="5.6"/><circle class="c" r="1.7"/></g>`;
  if (kind === 'ubha') return `<g class="gl ubha${cls}" transform="translate(${f1(x)} ${f1(y)})"><circle r="6"/><path d="M-3.6 3.6V-3.2M0 3.6V-4.4M3.6 3.6V-3.2"/></g>`;
  return `<g class="gl nira${cls}" transform="translate(${f1(x)} ${f1(y)})"><circle r="6"/><path d="M-4.2 -1q1.05-2 2.1 0t2.1 0 2.1 0 2.1 0M-4.2 2q1.05-2 2.1 0t2.1 0 2.1 0 2.1 0"/></g>`;
}

class Routes {
  constructor(places, out, ret) {
    this.pl = new Map(places.map((p) => [p.place_id, p]));
    const seqOf = (rows) => { const s = []; for (const r of rows) for (const id of [r.from_place_id, r.to_place_id]) if (id && s.at(-1) !== id) s.push(id); return s; };
    this.out = { seq: seqOf(out) }; this.ret = { seq: seqOf(ret) };
    const pts = [...new Set([...this.out.seq, ...this.ret.seq])].map((id) => this.pl.get(id)).filter((p) => p && p.latitude != null).map((p) => [p.latitude, p.longitude]);
    const P = makeProject(pts);
    this.xy = (id) => { const p = this.pl.get(id); return p && p.latitude != null ? P(p.latitude, p.longitude) : null; };
    for (const R of [this.out, this.ret]) {
      R.pts = R.seq.map((id, i) => ({ id, i, xy: this.xy(id) })).filter((p) => p.xy);
      R.segs = R.pts.slice(1).map((p, k) => ({ a: R.pts[k], b: p }));
    }
  }
  idx(R, id) { return R.seq.indexOf(id); }
  // a day's leg in stop-index space: [a, b]
  leg(R, row) { return [this.idx(R, row.from_place_id), this.idx(R, row.to_place_id)]; }
  segHtml(R, cls, st, bow) {
    return R.segs.map((s) => {
      const gap = s.b.i - s.a.i > 1;
      return `<path class="sg ${cls} ${st(s)}${gap ? ' gap' : ''}" d="${curve(s.a.xy, s.b.xy, bow)}"/>`;
    }).join('');
  }
  // where on the map a sign for a leg sits (on the leg, schematic)
  signPoint(R, a, b) {
    const A = R.pts.find((p) => p.i === a), B = R.pts.find((p) => p.i === b);
    let p0, p1, f;
    if (A && B) { p0 = A.xy; p1 = B.xy; f = 0.5; }
    else if (A) { const nx = R.pts.find((p) => p.i > a); if (!nx) return A.xy; p0 = A.xy; p1 = nx.xy; f = 0.28; }
    else if (B) { const pv = [...R.pts].reverse().find((p) => p.i < b); if (!pv) return B.xy; p0 = pv.xy; p1 = B.xy; f = 0.72; }
    else return null;
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], bow = BOW;
    const cx = mx - dy * bow, cy = my + dx * bow;
    const q = (u) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * cx + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * cy + u * u * p1[1]];
    return q(f);
  }
  /** Full map. cur = { kind:'out'|'ret', row } or null (the opening). */
  svg({ cur, signs, labels, animate }) {
    const L = lang();
    const nm = (id) => { const p = this.pl.get(id); return L === 'mr' ? (p.name_mr || p.name).replace(/\s*\(.*\)/, '') : p.name.replace(/\s*\(.*\)/, ''); };
    let a = -1, b = -1;
    const R = cur ? (cur.kind === 'out' ? this.out : this.ret) : null;
    if (cur) [a, b] = this.leg(R, cur.row);
    const stOut = cur ? (cur.kind === 'ret' ? () => 'done' : (s) => (s.b.i <= a ? 'done' : s.a.i < b && s.b.i > a ? 'cur' : 'fut')) : () => 'all';
    const stRet = cur ? (cur.kind === 'out' ? () => 'ghost' : (s) => (s.b.i <= a ? 'done' : s.a.i < b && s.b.i > a ? 'cur' : 'fut')) : () => 'all';
    const dots = new Map();
    for (const R2 of [this.out, this.ret]) for (const p of R2.pts) dots.set(p.id, p.xy);
    const labelIds = new Set(labels);
    let at = null;
    if (cur) {
      const ids2 = [cur.row.from_place_id, cur.row.to_place_id];
      ids2.forEach((id) => labelIds.add(id));
      const toXY = this.xy(cur.row.to_place_id);
      if (toXY) at = toXY;
    }
    const lbl = [...labelIds].filter((id) => this.xy(id)).map((id) => {
      const [x, y] = this.xy(id);
      const o = LAB[id] || (x > VW * 0.62 ? [-7, 4, 'end'] : [7, 4, 'start']);
      return `<text class="lb${cur && (id === cur.row.to_place_id) ? ' now' : ''}" lang="${L}" x="${f1(x + o[0])}" y="${f1(y + o[1])}" text-anchor="${o[2]}">${esc(nm(id))}</text>`;
    }).join('');
    const dotsHtml = [...dots].map(([id, xy]) => `<circle class="st${cur && (id === cur.row.from_place_id || id === cur.row.to_place_id) ? ' now' : ''}" cx="${f1(xy[0])}" cy="${f1(xy[1])}" r="2.6"/>`).join('');
    const sg = signs.map((s) => glyph(s.kind, s.xy[0], s.xy[1], s.on)).join('');
    const pal = at ? `<g class="pal" transform="translate(${f1(at[0])} ${f1(at[1])})"><circle r="9" class="halo"/><circle r="5.2"/><circle r="1.8" class="c"/></g>` : '';
    return `<svg viewBox="0 0 ${VW} ${VH}" class="rmap${animate ? ' draw' : ''}" role="img" aria-label="${esc(t('wari.map.label'))}">` +
      this.segHtml(this.out, 'o', stOut, BOW) + this.segHtml(this.ret, 'r', stRet, BOW) + dotsHtml + lbl + sg + pal + `</svg>`;
  }
}
const BOW = 0.07;
const srcN = (n) => (n === 1 ? t('wari.src.1') : t('wari.src.n', { n: num(n) }));

// ---------- evidence ----------
const NOTE = (r, extra = []) => [...extra, r.uncertainty, r.revision_note].filter(Boolean);
function rowEv(r, o = {}) {
  const by = o.by || ids(r.confirmed_by);
  return { cs: o.cs || r.claim_status, conf: o.conf || r.confirmation, by, src: by, rows: [r.stage_id, ...(o.rows || [])],
    note: o.note || NOTE(r), noteMr: o.noteMr, link: 'calendar/palkhi' };
}

// ---------- render ----------
export async function render(ctx) {
  const [cal, pdata] = await Promise.all([getJSON('calendar.json'), getJSON('places.json'), photosReady()]);
  const L = lang();
  const all = cal.palkhi_stages.filter((r) => String(r.year) === '2026');
  const variants = new Map();
  all.filter((r) => r.variant_of).forEach((r) => { (variants.get(r.variant_of) || variants.set(r.variant_of, []).get(r.variant_of)).push(r); });
  const base = all.filter((r) => !r.variant_of);
  const out = base.filter((r) => r.day_number != null).sort((x, y) => x.day_number - y.day_number);
  const ret = base.filter((r) => r.day_number == null).sort((x, y) => x.date.localeCompare(y.date));
  const days = [...out.map((row, i) => ({ kind: 'out', n: i + 1, of: out.length, row })), ...ret.map((row, i) => ({ kind: 'ret', n: i + 1, of: ret.length, row }))];
  const RT = new Routes(pdata.places, out, ret);
  const pname = (id, fallback) => {
    const p = RT.pl.get(id);
    if (p) return `<span lang="${L}">${esc(L === 'mr' ? (p.name_mr || p.name).replace(/\s*\(.*\)/, '') : p.name.replace(/\s*\(.*\)/, ''))}</span>`;
    const clean = String(fallback || '').replace(/\s*\(.*\)/, '');
    return L === 'mr' && OTHER_MR[clean] ? `<span lang="mr">${esc(OTHER_MR[clean])}</span>` : `<span lang="en">${esc(clean)}</span>`;
  };
  const siteName = (r) => { const s = String(r.ringan_site || '').split(' (')[0]; return L === 'mr' && SITE[s] ? `<span lang="mr">${esc(SITE[s])}</span>` : `<span lang="en">${esc(s)}</span>`; };
  const ringansOf = (r) => { const o = []; for (const m of String(r.ringan_site || '').matchAll(/(first|second|third|fourth) (ubha|gol)/g)) o.push({ n: ORD[m[1]], kind: m[2] }); return o; };
  const all7 = days.flatMap((d) => ringansOf(d.row).map((g) => ({ ...g, d })));

  const today = todayIST();
  const firstDate = days[0].date ?? days[0].row.date, lastDate = days.at(-1).row.date;
  const inSeason = today >= firstDate && today <= lastDate;
  const status = inSeason ? t('wari.in.season') : today < firstDate ? t('wari.before', { n: num(daysTo(firstDate, today)) }) : t('wari.replay');
  const dayIdx = (iso) => days.findIndex((d) => d.row.date === iso);

  // signs on the whole map
  const signsFor = (R, kind, curRow) => {
    const o = [];
    for (const d of days.filter((x) => x.kind === kind)) {
      const [a, b] = RT.leg(R, d.row);
      const rg = ringansOf(d.row);
      const p = RT.signPoint(R, a, b);
      if (!p) continue;
      rg.forEach((g, k) => o.push({ kind: g.kind, xy: [p[0] + (k - (rg.length - 1) / 2) * 13, p[1]], on: curRow === d.row }));
      if (d.row.nira_snan) {
        const q = RT.xy(d.row.to_place_id) ? [RT.xy(d.row.to_place_id)[0], RT.xy(d.row.to_place_id)[1] - 12] : p;
        o.push({ kind: 'nira', xy: q, on: curRow === d.row });
      }
    }
    return o;
  };
  const legend = `<p class="legend xsmall"><span>${glyph0('gol')}${esc(t('wari.k.gol.l'))}</span><span>${glyph0('ubha')}${esc(t('wari.k.ubha.l'))}</span><span>${glyph0('nira')}${esc(t('wari.nira.l'))}</span></p>`;
  function glyph0(k) { return `<svg class="lg" viewBox="-8 -8 16 16" aria-hidden="true">${glyph(k, 0, 0, false)}</svg>`; }

  const mapFor = (d) => {
    return `<figure class="mapbox">${RT.svg({ cur: d, signs: [...signsFor(RT.out, 'out', d.row), ...signsFor(RT.ret, 'ret', d.row)], labels: ['DNYP-PL-01', 'DNYP-PL-05'], animate: false })}${legend}<figcaption class="xsmall">${esc(t('wari.map.note'))}</figcaption></figure>`;
  };

  // ---------- the screens ----------
  const dayLabel = (d) => t(d.kind === 'out' ? 'wari.day.out' : 'wari.day.ret', { n: num(d.n), of: num(d.of) });

  function openingHtml() {
    const o = out[0], pand = out.find((r) => r.stage_id === 'DNYP-PS-17'), eka = out.find((r) => r.stage_id === 'DNYP-PS-18'), r1 = ret[0], rend = ret.at(-1);
    const dm = (iso) => formatDate(iso, L, { day: 'numeric', month: 'long' });
    const E = (r) => mark(rowEv(r), { what: t('wari.what.day') });
    const line = L === 'mr'
      ? `<p class="beats" lang="mr">${esc(dm(o.date))}ला आळंदीहून पालखीचे प्रस्थान${E(o)}; ${esc(dm(pand.date))}ला पंढरपुरात आगमन${E(pand)}; ${esc(dm(eka.date))}ला आषाढी एकादशी${E(eka)}. ${esc(dm(r1.date))}ला परतीचा प्रवास सुरू होऊन ${esc(dm(rend.date))}ला आळंदीत वारी पूर्ण होते${E(rend)}.</p>`
      : `<p class="beats">The palkhi leaves Alandi on ${esc(dm(o.date))}${E(o)}, reaches Pandharpur on ${esc(dm(pand.date))}${E(pand)}, and Ashadhi Ekadashi is on ${esc(dm(eka.date))}${E(eka)}. The return begins on ${esc(dm(r1.date))} and the wari ends at Alandi on ${esc(dm(rend.date))}${E(rend)}.</p>`;
    const retEv = rowEv(r1, { note: [r1.revision_note, 'Return leg, rows DNYP-PS-R1 to R12: two sources each (R10 one); the only sources are two programme articles of 14 May and, for R1, one Pudhari line.'], noteMr: 'परतीचा मार्ग फक्त मे महिन्यातील दोन कार्यक्रम-वृत्तांत आहे; प्रत्यक्ष दिवसाचे वृत्त किंवा मराठी वृत्तपत्रातील नोंद सापडली नाही.' });
    return `<div class="open">${RT.svg({ cur: null, signs: [...signsFor(RT.out, 'out', null), ...signsFor(RT.ret, 'ret', null)], labels: ['DNYP-PL-01', 'DNYP-PL-10', 'DNYP-PL-06', 'DNYG-P-PL03', 'DNYG-P-PL05', 'DNYG-P-PL07', 'DNYG-P-PL09', 'DNYP-PL-05'], animate: true })}
      ${legend}
      <p class="lead">${esc(t('wari.open.lead'))}</p>
      ${line}
      <p class="retnote xnote">${esc(t('wari.ret.note'))}${mark(retEv, { what: t('wari.ret.note.what') })}</p>
      <p class="acts xrow"><button type="button" class="btn" data-go="1">${esc(t('wari.start'))}</button><button type="button" class="xlink" data-ringan>${esc(t('wari.ringan.q'))}</button></p>
      <p class="xsmall">${esc(t('wari.open.photo'))}</p></div>`;
  }

  function dayHtml(d) {
    const r = d.row, vs = variants.get(r.stage_id) || [];
    const isToday = r.date === today;
    const from = pname(r.from_place_id, r.from_place_name), to = pname(r.to_place_id, r.to_place_name);
    const same = r.from_place_id === r.to_place_id;
    const facts = [];
    const E = (o, what) => mark(rowEv(r, o), { what: what || t('wari.what.day') });
    // 1. the place of the day
    facts.push(`<p class="place">${esc(t('wari.stay'))}: <b>${to}</b>${E()}</p>`);
    // 2. what the rows say happened
    if (HAND[r.stage_id]) facts.push(`<p class="fact" lang="${L}">${esc(HAND[r.stage_id][L])}${E()}</p>`);
    if (r.stage_id === 'DNYP-PS-01') {
      const h = ids(r.halt_type_source_ids);
      facts.push(`<p class="fact">${esc(L === 'mr' ? 'पहिली रात्र आळंदीतच, गांधीवाड्यात.' : 'The first night is spent inside Alandi, at Gandhiwada.')}${mark(rowEv(r, { conf: r.halt_type_confirmation, by: h }), { what: t('wari.what.day') })}</p>`);
    }
    // 3. Nira snan
    if (r.nira_snan) {
      const nv = ids(r.nira_snan_source_ids);
      const txt = r.stage_id === 'DNYP-PS-08' ? (L === 'mr' ? 'नीरा स्नान लोणंदला; पुढारीनुसार दुपारी.' : 'Nira snan at Lonand; in the afternoon, per Pudhari.')
        : (L === 'mr' ? 'नीरा स्नान परतीच्या वाटेवर, वाल्हे येथे.' : 'Nira snan on the way back, at Valhe.');
      facts.push(`<p class="mk nirab"><svg class="lg" viewBox="-8 -8 16 16" aria-hidden="true">${glyph('nira', 0, 0, true)}</svg><span>${esc(txt)}${mark(rowEv(r, { conf: r.nira_snan_confirmation, by: nv }), { what: t('wari.nira.what') })}</span></p>`);
    }
    // 4. ringan
    const rg = ringansOf(r);
    if (rg.length) {
      const rv = ids(r.ringan_source_ids);
      const rEv = rowEv(r, { conf: r.ringan_confirmation, by: rv, noteMr: 'रिंगणाचे ठिकाण व प्रकार लोकमत टाइम्स आणि फ्री प्रेस जर्नल या दोन स्रोतांत; इतर वृत्ते रिंगणाची ठिकाणे देत नाहीत.' });
      facts.push(`<div class="ringan">${rg.map((g) => `<p class="mk"><svg class="lg" viewBox="-8 -8 16 16" aria-hidden="true">${glyph(g.kind, 0, 0, true)}</svg><span><b>${esc(L === 'mr' ? `${t('wari.n.' + g.n)} ${t('wari.k.' + g.kind)} रिंगण` : `${t('wari.n.' + g.n)} ${g.kind} ringan`)}</b>: ${siteName(r)}${mark(rEv, { what: t('wari.ringan.what') })}</span></p>`).join('')}` +
        `<button type="button" class="xlink" data-ringan>${esc(t('wari.ringan.q'))}</button></div>`);
    }
    // 5. Sopandev meeting (single source)
    if (r.sopandev_meeting_confirmation) {
      facts.push(`<p class="fact">${esc(L === 'mr' ? 'संत सोपानदेवांच्या पालखीची पहिली भेट भंडीशेगावी; ही नोंद एकाच स्रोताची.' : 'The first meeting with the palkhi of Sant Sopandev, at Bhandishegaon; one source only.')}${mark(rowEv(r, { conf: r.sopandev_meeting_confirmation, by: ids(r.sopandev_meeting_source_ids) }), { what: t('wari.what.day') })}</p>`);
    }
    // 6. the other palkhi
    if (TUKA[r.stage_id] && r.tukaram_palkhi_note) {
      const tv = ids(r.tukaram_palkhi_note_source_ids);
      facts.push(`<p class="fact side" lang="${L}">${esc(TUKA[r.stage_id][L])}${mark(rowEv(r, { conf: confOf(tv.length), by: tv, note: [r.tukaram_palkhi_note] }), { what: t('wari.what.day') })}</p>`);
    }
    // 7. distance
    if (r.distance_km != null) facts.push(`<p class="xsmall dist">${esc(t('wari.dist', { km: num(Math.round(r.distance_km)) }))}${mark(rowEv(r, { conf: r.distance_confirmation, by: ids(r.distance_source_ids), note: [r.distance_note] }), { what: t('wari.dist.what') })}</p>`);
    // 8. places the map cannot show
    const unp = [r.from_place_id, r.to_place_id].filter((id, i, a) => id && a.indexOf(id) === i && !RT.xy(id));
    if (unp.length) facts.push(`<p class="xsmall">${unp.map((id) => esc(t('wari.unplaced', { p: (L === 'mr' ? RT.pl.get(id).name_mr : RT.pl.get(id).name).replace(/\s*\(.*\)/, '') }))).join(' ')}</p>`);
    // 9. voices: disputes beside their row
    let vx = '';
    if (r.stage_id === 'DNYP-PS-01' && r.departure_time) {
      const dt = jparse(r.departure_time) || {};
      const mk = (k, side) => { const v = ids(dt[k]); return { who: (v.length === 1 ? t('wari.src.1') : t('wari.src.n', { n: num(v.length) })), side, lang: L,
        html: esc(L === 'mr' ? `प्रस्थान दुपारी ${num(parseInt(k, 10))} वाजता` : `Departure at ${k}`),
        mark: mark(rowEv(r, { cs: 'disagreement', conf: confOf(v.length), by: v, note: [`Departure time, "${k}": ${v.length} source(s). The rows keep both readings.`] }), { what: L === 'mr' ? 'प्रस्थानाची वेळ' : 'the departure time' }) }; };
      const ks = Object.keys(dt).sort((x, y) => ids(dt[y]).length - ids(dt[x]).length);
      vx = voices(ks.slice(0, 2).map((k, i) => mk(k, i ? 'b' : 'a')), { label: t('wari.two') });
    }
    if (vs.length) {
      const v = vs[0];
      const vEv = (rr) => rowEv(rr, { cs: 'disagreement', note: NOTE(rr), by: ids(rr.confirmed_by), conf: rr.confirmation });
      let a, b;
      if (v.stage_id === 'DNYG-P-PS03') {
        a = { who: srcN(ids(r.confirmed_by).length), html: esc(L === 'mr' ? `आगमन ${formatDate(r.date, L, { day: 'numeric', month: 'long' })}` : `Arrival on ${formatDate(r.date, L, { day: 'numeric', month: 'long' })}`) };
        b = { who: srcN(ids(v.confirmed_by).length), html: esc(L === 'mr' ? `आगमन ${formatDate(v.date, L, { day: 'numeric', month: 'long' })}` : `Arrival on ${formatDate(v.date, L, { day: 'numeric', month: 'long' })}`) };
      } else {
        a = { who: srcN(ids(r.confirmed_by).length), html: pname(r.to_place_id, r.to_place_name) };
        b = { who: srcN(ids(v.confirmed_by).length), html: pname(v.to_place_id, v.to_place_name) };
      }
      vx = voices([{ ...a, side: 'a', lang: L, mark: mark(vEv(r)) }, { ...b, side: 'b', lang: L, mark: mark(vEv(v)) }], { label: t('wari.two') }) + `<p class="xsmall">${esc(t('wari.adopted'))}</p>`;
    }
    if (d.kind === 'ret') {
      facts.push(`<p class="xnote retnote">${esc(t('wari.ret.note'))}${mark(rowEv(r, { noteMr: 'परतीचा मार्ग फक्त मे महिन्यातील दोन कार्यक्रम-वृत्तांत आहे; प्रत्यक्ष दिवसाचे वृत्त किंवा मराठी वृत्तपत्रातील नोंद सापडली नाही.' }), { what: t('wari.ret.note.what') })}</p>`);
    }
    // 10. a photograph where it serves
    let ph = '';
    const pk = PHOTO[r.stage_id];
    if (pk && photoMeta(pk[0])) {
      const m = photoMeta(pk[0]), yr = String(m.date || '').slice(0, 4);
      const cap = (L === 'mr' ? m.caption_mr : m.caption_en) || m.caption_en;
      ph = photo(pk[0], { draw: pk[1], caption: yr ? `${cap} (${num(yr)})` : cap, cls: m.h > m.w ? 'tall' : '' });
    }
    const dm = formatDate(r.date, L, { weekday: 'long', day: 'numeric', month: 'long' });
    return `<article class="day ${d.kind}">
      <div class="dmap">${mapFor(d)}</div>
      <div class="dtxt">
        ${d.kind === 'ret' ? `<p class="band">${esc(t('wari.ret.band'))}</p>` : ''}
        <p class="xsmall dline">${esc(dayLabel(d))} · ${esc(dm)}${isToday ? ` <b class="tod">${esc(t('wari.today'))}</b>` : ''}</p>
        <h2 class="leg">${same ? to : `${from} <i aria-hidden="true">→</i> ${to}`}</h2>
        ${facts.join('')}${vx}${ph}
      </div></article>`;
  }

  function endHtml() {
    return `<div class="end"><p class="lead">${esc(t('wari.end.t'))}</p><p class="xnote">${esc(t('wari.end.l'))}</p>
      <div class="xdoors">${door('samadhi', t('wari.end.d1'), t('wari.end.d1.l'))}${door('calendar/palkhi', t('wari.end.d2'), t('wari.end.d2.l'))}</div></div>`;
  }

  // ---------- the page ----------
  const nOut = out.length;
  ctx.el.innerHTML = `${CSS}<div class="x-wari">
    <h1 tabindex="-1">${esc(t('x.wari'))}</h1>
    <p class="sub">${esc(t('wari.year'))}. ${esc(t('wari.sub'))}</p>
    <p class="status xsmall">${esc(status)}</p>
    <nav class="tabs" aria-label="${esc(t('wari.days'))}"><button type="button" data-go="1">${esc(t('wari.out'))}</button><button type="button" data-go="${nOut + 1}">${esc(t('wari.ret'))}</button></nav>
    <div id="wr-pager"></div></div>`;

  const total = days.length + 2;
  const askD = ctx.query.get('d');
  const askI = askD ? dayIdx(askD) : -1;
  const startI = askI >= 0 ? askI + 1 : inSeason && dayIdx(today) >= 0 ? dayIdx(today) + 1 : 0;
  ctx.after = () => {
    const host = ctx.el.querySelector('#wr-pager');
    const tabs = [...ctx.el.querySelectorAll('.tabs button')];
    const pg = pager(host, {
      count: total, start: startI, label: t('wari.pager'),
      render: (k) => (k === 0 ? openingHtml() : k === total - 1 ? endHtml() : dayHtml(days[k - 1])),
      onChange: (k, el) => {
        const want = k >= 1 && k <= days.length ? `#/wari?d=${days[k - 1].row.date}` : '#/wari';
        if (location.hash !== want) history.replaceState(null, '', want);
        tabs.forEach((b, i) => b.setAttribute('aria-current', String(k >= 1 && k <= days.length && ((i === 0) === (days[k - 1].kind === 'out')))));
        el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => pg.go(+b.dataset.go)));
        el.querySelectorAll('[data-ringan]').forEach((b) => b.addEventListener('click', () => ringanSheet(pg)));
      },
    });
    tabs.forEach((b) => b.addEventListener('click', () => pg.go(+b.dataset.go)));
  };
  ctx.manageScroll = !!askD;

  function ringanSheet(pg) {
    const D = (iso) => formatDate(iso, L, { day: 'numeric', month: 'long' });
    const rows = all7.map((g) => `<li><button type="button" class="xlink" data-jump="${days.indexOf(g.d) + 1}">${esc(D(g.d.row.date))}: ${esc(L === 'mr' ? `${t('wari.n.' + g.n)} ${t('wari.k.' + g.kind)} रिंगण` : `${t('wari.n.' + g.n)} ${g.kind} ringan`)}, ${siteName(g.d.row)}</button></li>`).join('');
    const ev = { cs: 'editorial testimony', rows: all7.map((g) => g.d.row.stage_id).filter((x, i, a) => a.indexOf(x) === i), src: ['DNYP-S11', 'DNYP-S12'], conf: 'two sources', by: ['DNYP-S11', 'DNYP-S12'],
      note: ['The rows give the kind (ubha or gol), an ordinal and the site of each ringan, confirmed by Lokmat Times and Free Press Journal; Pudhari, Punekar News and the aggregators do not list ringan sites.', 'No row describes what happens at a ringan. The two photographs (Commons) are labelled by their authors "2nd" and "3rd Circular ringan" near Khudus Phata and Thakur buva samadhi, 2017.'], link: 'calendar/palkhi' };
    const p = openSheet({ title: t('wari.ringan.t'), html: `<div class="x-wari ringsheet"><svg class="rs-draw" viewBox="0 0 220 80" aria-hidden="true"><g class="rd"><circle cx="48" cy="40" r="26" stroke-dasharray="2 5"/><circle cx="48" cy="40" r="3"/><path d="M110 64V18M126 64V14M142 64V18M158 64V14M174 64V18M190 64V14"/></g></svg>` +
      `<p lang="${L}">${esc(t('wari.rs.1'))}${mark(ev, { what: t('wari.rs.what') })}</p><p lang="${L}">${esc(t('wari.rs.2'))}${mark(ev, { what: t('wari.rs.what') })}</p><p lang="${L}">${esc(t('wari.rs.3'))}</p>` +
      `<h3 class="rs-h">${esc(t('wari.rs.days'))}</h3><ul class="rs-days">${rows}</ul></div>` });
    p.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => { closeSheet(false); pg.go(+b.dataset.jump); }));
  }
}

const CSS = `<style>
.x-wari{max-width:56rem;margin:0 auto;padding:var(--sp-4) var(--sp-4) var(--sp-6)}
.x-wari h1{font-size:var(--s-3);margin:0 0 var(--sp-1)}
.x-wari .sub{color:var(--ink-2);margin:0;font-size:var(--s--1)}
.x-wari .status{margin:.2rem 0 var(--sp-3)}
.x-wari .tabs{display:flex;gap:var(--sp-2);margin:0 0 var(--sp-3);border-bottom:1px solid var(--rule)}
.x-wari .tabs button{appearance:none;background:none;border:0;border-bottom:2px solid transparent;padding:.5rem .2rem;margin-right:var(--sp-4);font:inherit;font-size:var(--s--1);color:var(--ink-2);cursor:pointer;min-height:40px}
.x-wari .tabs button[aria-current="true"]{border-bottom-color:var(--saffron);color:var(--ink)}
.x-wari .rmap{width:100%;height:auto;display:block;overflow:visible}
.x-wari .sg{fill:none;stroke-linecap:round}
.x-wari .sg.o.all,.x-wari .sg.o.done{stroke:var(--saffron);stroke-width:2.2;opacity:.8}
.x-wari .sg.o.cur{stroke:var(--saffron);stroke-width:4.6;opacity:1}
.x-wari .sg.o.fut{stroke:var(--rule);stroke-width:2;stroke-dasharray:2 5}
.x-wari .sg.r.all,.x-wari .sg.r.done{stroke:var(--maroon);stroke-width:1.8;stroke-dasharray:5 4;opacity:.8}
.x-wari .sg.r.cur{stroke:var(--maroon);stroke-width:4.2;stroke-dasharray:none}
.x-wari .sg.r.fut{stroke:var(--rule);stroke-width:1.6;stroke-dasharray:2 5;opacity:.7}
.x-wari .sg.r.ghost{stroke:var(--rule);stroke-width:1.2;stroke-dasharray:1 6;opacity:.6}
.x-wari .sg.gap.cur,.x-wari .sg.gap.done{stroke-dasharray:1 6}
.x-wari .st{fill:var(--paper-3);stroke:var(--ink-3);stroke-width:1.2}
.x-wari .st.now{fill:var(--saffron);stroke:var(--saffron)}
.x-wari .lb{font-family:var(--f-text);font-size:11.5px;fill:var(--ink-2);paint-order:stroke;stroke:var(--paper);stroke-width:3px;stroke-linejoin:round}
.x-wari .lb.now{fill:var(--ink);font-size:13px}
.x-wari .pal circle{fill:var(--saffron);stroke:var(--paper);stroke-width:1.6}
.x-wari .pal .halo{fill:var(--saffron);opacity:.22;stroke:none}
.x-wari .pal .c{fill:var(--paper);stroke:none}
.x-wari .gl circle:first-child{fill:var(--paper-3);stroke:var(--ink-3);stroke-width:1.2}
.x-wari .gl .c{fill:var(--ink-3);stroke:none}
.x-wari .gl path{fill:none;stroke:var(--ink-3);stroke-width:1.5;stroke-linecap:round}
.x-wari .gl.on circle:first-child{stroke:var(--maroon);stroke-width:1.8}
.x-wari .gl.on .c{fill:var(--maroon)}
.x-wari .gl.on path{stroke:var(--maroon);stroke-width:1.8}
.x-wari .legend{display:flex;flex-wrap:wrap;gap:.2rem var(--sp-4);margin:var(--sp-2) 0 0}
.x-wari .legend span{display:inline-flex;align-items:center;gap:.3rem}
.x-wari .lg{width:1.15rem;height:1.15rem;flex:none}
.x-wari .mapbox{margin:0}
.x-wari .mapbox figcaption{margin-top:.25rem;font-size:.74rem}
.x-wari .open{padding:var(--sp-2) 0}
.x-wari .lead{font-family:var(--f-text);font-size:var(--s-1);line-height:1.65;margin:var(--sp-4) 0 var(--sp-3)}
.x-wari .beats{font-family:var(--f-text);font-size:var(--s-0);line-height:1.8;margin:0 0 var(--sp-3);color:var(--ink)}
.x-wari .retnote{border-left:2px solid var(--maroon);padding-left:var(--sp-3)}
.x-wari .acts{margin:var(--sp-4) 0}
.x-wari .acts .btn{min-height:44px}
.x-wari .day{display:block}
.x-wari .dmap{margin:0 0 var(--sp-3)}
.x-wari .band{display:inline-block;margin:0 0 .2rem;font-size:.78rem;color:var(--maroon);border-bottom:1px solid var(--maroon)}
.x-wari .dline{margin:0}
.x-wari .tod{color:var(--maroon)}
.x-wari .leg{font-family:var(--f-text);font-weight:400;font-size:var(--s-2);line-height:1.3;margin:.15rem 0 var(--sp-3)}
.x-wari .leg i{font-style:normal;color:var(--saffron);margin:0 .15em}
.x-wari .place{margin:0 0 var(--sp-2);font-size:var(--s-0)}
.x-wari .place b{font-family:var(--f-text);font-weight:400;font-size:var(--s-1)}
.x-wari .fact{margin:0 0 var(--sp-2);line-height:1.7}
.x-wari .fact.side{font-size:var(--s--1);color:var(--ink-2);border-left:2px solid var(--rule);padding-left:var(--sp-3)}
.x-wari .mk{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 var(--sp-2);line-height:1.6}
.x-wari .mk .lg{width:1.5rem;height:1.5rem;margin-top:.1rem}
.x-wari .ringan{margin:var(--sp-3) 0;padding:var(--sp-3);background:var(--paper-2);border-radius:var(--r-2)}
.x-wari .ringan .xlink{padding-left:2.05rem}
.x-wari .dist{margin:var(--sp-2) 0}
.x-wari .day .vx{margin:var(--sp-4) 0 var(--sp-2);gap:var(--sp-3)}
.x-wari .day .v{max-width:94%}
.x-wari .day .v .say{font-size:var(--s-0);line-height:1.6}
.x-wari .photo{margin:var(--sp-4) 0}
.x-wari .photo.tall img{max-height:26rem;object-fit:cover}
.x-wari .end{padding:var(--sp-5) 0}
.x-wari .ringsheet{font-size:var(--s-0);line-height:1.7}
.x-wari .rs-draw{width:100%;max-width:16rem;color:var(--maroon);display:block;margin:0 0 var(--sp-3)}
.x-wari .rs-draw .rd{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.x-wari .rs-h{font-size:var(--s--1);color:var(--ink-2);margin:var(--sp-4) 0 var(--sp-2)}
.x-wari .rs-days{list-style:none;margin:0;padding:0}
.x-wari .rs-days li{border-bottom:1px solid var(--rule)}
.x-wari .open .rmap.draw .sg.o{stroke-dasharray:1;stroke-dashoffset:1;animation:wr-draw 3.6s ease-out .3s forwards}
.x-wari .open .rmap.draw .sg.r{opacity:0;animation:wr-fade 1.6s ease-out 3.4s forwards}
@keyframes wr-draw{to{stroke-dashoffset:0}}
@keyframes wr-fade{to{opacity:.8}}
@media (prefers-reduced-motion:reduce){.x-wari .open .rmap.draw .sg.o{animation:none;stroke-dasharray:none;stroke-dashoffset:0}.x-wari .open .rmap.draw .sg.r{animation:none;opacity:.8}}
@media (min-width:46rem){
 .x-wari .day{display:grid;grid-template-columns:minmax(20rem,26rem) 1fr;gap:var(--sp-6);align-items:start}
 .x-wari .dmap{position:sticky;top:calc(var(--head-h) + var(--sp-3))}
 .x-wari .open{display:grid;grid-template-columns:minmax(20rem,28rem) 1fr;gap:0 var(--sp-6);align-items:start}
 .x-wari .open>.rmap{grid-row:1 / span 6}
 .x-wari .open>.legend{grid-column:1}
}
</style>`;
