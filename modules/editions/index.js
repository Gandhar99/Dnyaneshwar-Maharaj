// L. How the gatha grew. Routes: #/editions (the picture; ?r=<region>&p=<n>), #/editions/<composition id> (one poem across the editions).
// Data: gatha/index.json (witness strings per poem), texts/works.json (editions, census), gatha/pNNN.json (via gathaPoem).
// The picture is computed from the index: three circles, seven regions, counts. Full text only from the 1908 edition.
import { t, lang, registerLabels } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON, gathaIndex, gathaPoem } from '../../assets/js/data.js';
import { keepDandas } from '../../assets/js/components.js';
import { mark, pager, openEvidence, door, gathaCardOK } from '../../assets/js/experience.js';

registerLabels('edn', {
  mr: {
    'sub': 'संत ज्ञानेश्वर महाराजांची गाथा तीन छापील आवृत्त्यांत आहे. एकच अभंग प्रत्येकीत वेगळ्या क्रमांकाने भेटतो.',
    'pic': 'तीन आवृत्त्यांचे आकृती-चित्र', 'pic.note': 'वर्तुळांचा आकार मोजमापाचा नाही; आकडे अभंगांची मोजणी आहेत. एखाद्या भागाला स्पर्श करा.',
    'all': 'तिन्ही आवृत्त्यांत', 'only': 'फक्त {a}', 'two': '{a} आणि {b}',
    'region.n': '{n} अभंग', 'region.what': 'या भागातील अभंगांची संख्या',
    'diff': 'दोन आवृत्त्यांत असलेल्या {n} जोड्यांपैकी फक्त {k} जोड्यांत क्रमांक सारखा आहे. प्रत्येक आवृत्तीने स्वतःच्या क्रमाने अभंग छापले आहेत.',
    'diff.what': 'क्रमांकांतील फरक', 'pager': 'या भागातील अभंग', 'of.poem': 'अभंग {i} / {n}',
    'no': 'क्रमांक', 'page': 'छापील पान सुमारे {n}', 'absent': 'या आवृत्तीत सापडला नाही',
    'open': 'तिन्ही आवृत्त्यांत उघडा', 'carries': 'ही आवृत्ती काय देते',
    'high': 'छापलेला सर्वात मोठा क्रमांक {n}; येथे {m} अभंग जुळले.',
    'full': 'पूर्ण पाठ या संकेतस्थळावर आहे.', 'incipit': 'येथे फक्त पहिल्या ओळी; पूर्ण पाठ नाही.',
    'sheet.t': 'आवृत्तीची नोंद',
    'p.title': 'एक अभंग, तीन आवृत्त्या', 'p.back': 'सर्व आवृत्त्या', 'p.screens': 'या अभंगाची तीन आवृत्त्यांतील स्थाने',
    'p.text': 'पाठ', 'p.match': 'ओळख कशी पटली',
    'p.only1908': 'पूर्ण पाठ फक्त १९०८ च्या आवृत्तीचा येथे दाखवला आहे; इतर दोन आवृत्त्यांच्या पहिल्या ओळी.',
    'p.notext': 'या अभंगाचा पूर्ण पाठ आमच्याकडे नाही: तो १९०८ च्या आवृत्तीत सापडला नाही, आणि इतर दोन आवृत्त्यांचा पूर्ण पाठ येथे दाखवत नाही.',
    'p.q.C': 'हा कच्चा स्कॅन-पाठ आहे; शुद्धलेखन तपासलेले नाही.', 'p.q.B': 'दहापैकी नऊहून अधिक शब्द इतर आवृत्त्यांशी जुळतात; तरी शुद्धलेखन तपासलेले नाही.',
    'p.q.A': 'सर्व शब्द इतर आवृत्त्यांशी जुळतात; तरी छापील पानाशी ताडलेले नाही.',
    'p.seva': 'हा पाठ स्कॅनशी ताडून पाहा', 'p.card': 'कार्ड बनवा',
    'p.sim': 'संगणकाने केलेल्या तुलनेचा गुणांक {s} (१ म्हणजे पूर्ण जुळणी).', 'p.sim.what': 'ही जुळणी कशी ठरली',
    'p.nf': 'हा अभंग सापडला नाही.',
  },
  en: {
    'sub': "Sant Dnyaneshwar Maharaj's gatha survives in three printed editions. The same abhanga carries a different number in each.",
    'pic': 'The three editions as a diagram', 'pic.note': 'The circles are not to scale; the figures are counts of poems. Touch a region.',
    'all': 'In all three', 'only': '{a} only', 'two': '{a} and {b}',
    'region.n': '{n} abhangas', 'region.what': 'the number of poems in this region',
    'diff': 'Of {n} pairings where a poem is in two editions, only {k} carry the same number. Each edition ordered its poems its own way.',
    'diff.what': 'the differing numbers', 'pager': 'Poems in this region', 'of.poem': 'Poem {i} of {n}',
    'no': 'No.', 'page': 'printed page about {n}', 'absent': 'not found in this edition',
    'open': 'Open across all three', 'carries': 'What this edition carries',
    'high': 'Highest printed number {n}; {m} poems matched here.',
    'full': 'Its full text is on this site.', 'incipit': 'Only first lines here, no full text.',
    'sheet.t': 'The edition on record',
    'p.title': 'One abhanga, three editions', 'p.back': 'All editions', 'p.screens': "This poem's place in the three editions",
    'p.text': 'Text', 'p.match': 'How it was recognised',
    'p.only1908': 'Only the 1908 edition is shown in full here; the other two by first line.',
    'p.notext': 'We hold no full text of this poem: it was not found in the 1908 edition, and the full text of the other two is not shown here.',
    'p.q.C': 'This is raw scan text; its spelling is not checked.', 'p.q.B': 'More than nine words in ten agree with the other editions; spelling still not checked.',
    'p.q.A': 'Every word agrees with the other editions; not yet checked against the printed page.',
    'p.seva': 'Check this text against its scan', 'p.card': 'Make a card',
    'p.sim': "The machine comparison's score is {s} (1 is a perfect match).", 'p.sim.what': 'how this match was made',
    'p.nf': 'This poem was not found.',
  },
});

export const title = () => t('x.editions');

const CODES = ['SKH1908', 'SSV', 'TEL1954'];
const LET = { SKH1908: 'S', SSV: 'V', TEL1954: 'T' };
const SRC = { SKH1908: 'DNYC-S01', SSV: 'DNYC-S02', TEL1954: 'DNYC-S03' };
const EDID = { SKH1908: 'DNYC-E01', SSV: 'DNYC-E02', TEL1954: 'DNYC-E03' };
const CENTRE = { S: [120, 115], T: [220, 115], V: [170, 195] };
// where each region's count sits, in viewBox units (340 x 292)
const SPOT = { SVT: [170, 138], ST: [170, 86], SV: [126, 168], VT: [214, 168], S: [88, 108], T: [252, 108], V: [170, 238] };
const W = 340, H = 292;
const ORDER = ['SVT', 'ST', 'SV', 'VT', 'S', 'V', 'T'];
const sortKey = (k) => [...k].sort((a, b) => 'SVT'.indexOf(a) - 'SVT'.indexOf(b)).join('');

export async function render(ctx) {
  const id = ctx.path[0];
  if (id) return poemPage(ctx, id);
  const [gi, works] = await Promise.all([gathaIndex(), getJSON('texts/works.json')]);
  const L = lang();
  const regions = Object.fromEntries(ORDER.map((k) => [k, []]));
  let pairs = 0, same = 0;
  for (const r of gi.rows) {
    if (!r.witnesses.length) continue;
    regions[sortKey(r.witnesses.map(([w]) => LET[w]).join(''))].push(r);
    const n = Object.fromEntries(r.witnesses);
    for (let i = 0; i < CODES.length; i++) for (let j = i + 1; j < CODES.length; j++) if (n[CODES[i]] != null && n[CODES[j]] != null) { pairs++; if (n[CODES[i]] === n[CODES[j]]) same++; }
  }
  const total = Object.fromEntries(CODES.map((c) => [c, gi.rows.filter((r) => r.witnesses.some(([w]) => w === c)).length]));
  const rad = Object.fromEntries(CODES.map((c) => [LET[c], 78 * Math.sqrt(total[c] / total.TEL1954)]));
  const ed = (c) => works.editions.find((e) => e.edition_id === EDID[c]);
  const cen = (c) => (works.corpus_census || []).find((x) => x.edition_id === EDID[c]) || {};
  const nm = (c) => t('w.short.' + c);
  const regionName = (k) => (k === 'SVT' ? t('edn.all') : k.length === 1 ? t('edn.only', { a: nm(CODES.find((c) => LET[c] === k)) })
    : t('edn.two', { a: nm(CODES.find((c) => LET[c] === k[0])), b: nm(CODES.find((c) => LET[c] === k[1])) }));

  const countsEv = { cs: 'reconstruction', rows: ['gatha/index.json'], link: 'evidence/editions',
    note: [`Counts from the list index of ${gi.rows.length} compositions: ` + ORDER.map((k) => `${k}=${regions[k].length}`).join(', ') + ' (S=SKH1908, V=SSV, T=TEL1954).',
      'A poem is placed in a region by the editions in which a matching segment was found; the matching is by machine and not checked by a person.'],
    noteMr: 'हे आकडे यंत्राने केलेल्या जुळणीतून मोजलेले आहेत; कोणी तपासलेले नाहीत.' };
  const diffEv = { cs: 'reconstruction', rows: ['gatha/index.json'], link: 'evidence/editions',
    note: [`Counted over the ${pairs} pairs (poem, two editions) in the index; ${same} pairs have the same printed number.`] };

  // ---------- picture ----------
  const circ = (c) => `<circle cx="${CENTRE[LET[c]][0]}" cy="${CENTRE[LET[c]][1]}" r="${rad[LET[c]].toFixed(1)}"/>`;
  const clipDefs = CODES.map((c) => `<clipPath id="ed-c${LET[c]}">${circ(c)}</clipPath>`).join('') +
    ORDER.map((k) => `<mask id="ed-m${k}"><rect width="${W}" height="${H}" fill="#fff"/>${[...'SVT'].filter((x) => !k.includes(x)).map((x) => `<circle cx="${CENTRE[x][0]}" cy="${CENTRE[x][1]}" r="${rad[x].toFixed(1)}" fill="#000"/>`).join('')}</mask>`).join('');
  const nest = (k, inner) => [...k].reduceRight((acc, x) => `<g clip-path="url(#ed-c${x})">${acc}</g>`, inner);
  const hit = [...ORDER].reverse().map((k) => nest(k, `<rect class="hit" data-r="${k}" width="${W}" height="${H}"/>`)).join('');
  const fillOf = (k) => `<g mask="url(#ed-m${k})">${nest(k, `<rect class="selfill" width="${W}" height="${H}"/>`)}</g>`;
  const pic = `<div class="venn" role="group" aria-label="${esc(t('edn.pic'))}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${clipDefs}</defs>
      <g id="edn-sel"></g><g class="rings">${CODES.map(circ).join('')}</g>${hit}</svg>
      ${ORDER.map((k) => `<button type="button" class="cnt" data-r="${k}" style="left:${(SPOT[k][0] / W * 100).toFixed(1)}%;top:${(SPOT[k][1] / H * 100).toFixed(1)}%" aria-label="${esc(regionName(k) + ': ' + t('edn.region.n', { n: num(regions[k].length) }))}"><b>${esc(num(regions[k].length))}</b></button>`).join('')}
      <button type="button" class="en e1" data-ed="SKH1908"><b>${esc(nm('SKH1908'))}</b></button>
      <button type="button" class="en e2" data-ed="TEL1954"><b>${esc(nm('TEL1954'))}</b></button>
      <button type="button" class="en e3" data-ed="SSV"><b>${esc(nm('SSV'))}</b></button></div>`;

  ctx.el.innerHTML = `${CSS}<div class="x-editions">
    <h1 tabindex="-1">${esc(t('x.editions'))}</h1>
    <p class="sub">${esc(t('edn.sub'))}${mark(countsEv, { what: t('edn.region.what') })}</p>
    ${pic}
    <p class="xsmall pn">${esc(t('edn.pic.note'))}</p>
    <p class="diff">${esc(t('edn.diff', { n: num(pairs), k: num(same) }))}${mark(diffEv, { what: t('edn.diff.what') })}</p>
    <h2 class="rname" id="edn-rname" aria-live="polite"></h2>
    <div id="edn-pager"></div>
  </div>`;

  const sel = ORDER.includes(ctx.query.get('r')) ? ctx.query.get('r') : 'SVT';
  ctx.after = () => {
    const root = ctx.el.querySelector('.x-editions');
    let cur = sel;
    const open = (k, p = 0) => {
      cur = k;
      root.querySelector('#edn-sel').innerHTML = fillOf(k);
      root.querySelectorAll('.cnt').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === k)));
      const list = regions[k];
      root.querySelector('#edn-rname').textContent = `${regionName(k)}: ${t('edn.region.n', { n: num(list.length) })}`;
      pager(root.querySelector('#edn-pager'), {
        count: list.length, start: p, label: t('edn.pager'), keys: 'focus',
        render: (i) => regionScreen(list[i], i, list.length),
        onChange: (i) => { const want = `#/editions?r=${k}${i ? '&p=' + (i + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want); },
      });
    };
    root.addEventListener('click', (e) => {
      const r = e.target.closest('[data-r]'), d = e.target.closest('[data-ed]');
      if (d) { editionSheet(d.dataset.ed); return; }
      if (r && r.dataset.r !== cur) open(r.dataset.r);
    });
    open(sel, Math.max(0, (parseInt(ctx.query.get('p'), 10) || 1) - 1));
  };

  function regionScreen(r, i, n) {
    const by = Object.fromEntries(r.witnesses);
    const cells = CODES.map((c) => `<div class="cell${by[c] != null ? '' : ' none'}"><p class="ec">${esc(nm(c))}</p>${by[c] != null ? `<p class="no" lang="${L}">${esc(num(String(by[c])))}</p>` : `<p class="xsmall">–</p>`}</div>`).join('');
    return `<article class="rs"><p class="xsmall">${esc(t('edn.of.poem', { i: num(i + 1), n: num(n) }))}</p>
      <p class="fl" lang="mr">${esc(keepDandas(r.first_line))}</p>
      <div class="cells" aria-label="${esc(t('edn.no'))}">${cells}</div>
      <p><a class="btn" href="${href('editions/' + r.id)}">${esc(t('edn.open'))}</a></p></article>`;
  }

  function editionSheet(c) {
    const e = ed(c) || {}, k = cen(c);
    const text = c === 'SKH1908';
    openEvidence({ cs: e.claim_status || 'editorial testimony', src: [SRC[c]], rows: [EDID[c], k.census_id].filter(Boolean), link: 'evidence/editions',
      noteMr: `${t('w.' + c)}. ${t('edn.high', { n: num(String(e.poems_for_this_saint || '–')), m: num(total[c]) })} ${text ? t('edn.full') : t('edn.incipit')}`,
      note: [e.year_note, e.editor && `Editor: ${e.editor}`, e.publisher_press_place && `Publisher and press: ${e.publisher_press_place}`,
        e.base_manuscripts_claimed && `Basis claimed: ${e.base_manuscripts_claimed}`, e.relation_to_other_editions && `Relation to the others: ${e.relation_to_other_editions}`,
        k.units_found && `Units found in the scan: ${k.units_found}; numbers not recovered: ${k.numbers_not_found}.`, e.rights && `Rights: ${e.rights}`].filter(Boolean) });
  }
}

// ---------- one poem across the three editions ----------
async function poemPage(ctx, id) {
  const res = await gathaPoem(id);
  const L = lang();
  if (!res?.poem) { ctx.el.innerHTML = `${CSS}<div class="x-editions"><h1 tabindex="-1">${esc(t('edn.p.title'))}</h1><p>${esc(t('edn.p.nf'))}</p><p><a class="btn" href="#/editions">${esc(t('edn.p.back'))}</a></p></div>`; return; }
  const p = res.poem, tx = p.text;
  const wit = Object.fromEntries(p.witnesses.map((w) => [w.witness, w]));
  const wev = (w) => ({ cs: p.claim_status, rows: [w.segment_id, p.id], src: [SRC[w.witness]], link: `texts/gatha/${p.id}`,
    note: [`Edition ${w.witness}: printed number ${w.source_label}${w.printed_page ? `, printed page about ${w.printed_page}` : ' (this edition gives no page in our data)'}${w.source_section ? `, section "${w.source_section}"` : ''}.`,
      `Match: ${w.match_type}, similarity ${w.similarity}. ${w.flags || ''}`] });
  const shelves = CODES.map((c) => { const w = wit[c];
    return `<div class="shelf${w ? '' : ' none'}"><p class="ec">${esc(t('w.' + c))}</p>` + (w
      ? `<p class="no" lang="${L}">${esc(t('edn.no'))} ${esc(num(String(w.source_label)))}${mark(wev(w), { what: t('w.' + c) })}</p>${w.printed_page ? `<p class="xsmall">${esc(t('edn.page', { n: num(w.printed_page) }))}</p>` : ''}<p class="fl" lang="mr">${esc(keepDandas(w.incipit || ''))}</p>`
      : `<p class="xsmall">${esc(t('edn.absent'))}</p>`) + `</div>`; }).join('');
  const q = tx?.text_quality;
  const textHtml = tx
    ? `<p class="xsmall">${esc(t('edn.p.' + 'q.' + q))} ${esc(t('q.nocheck'))}</p><div class="txt${q === 'C' ? ' raw' : ''}" lang="mr">${tx.reading_text.split('\n').map((l) => `<span class="ln">${esc(keepDandas(l))}</span>`).join('')}</div>
       <p class="xrow"><a href="${href('seva/' + p.id)}">${esc(t('edn.p.seva'))}</a>${gathaCardOK(q) ? `<a href="${href('card', { g: p.id })}">${esc(t('edn.p.card'))}</a>` : ''}</p>`
    : `<p class="xnote">${esc(t('edn.p.notext'))}</p>`;
  const matchHtml = `<div class="mt">${p.witnesses.map((w) => `<p>${esc(t('w.' + w.witness))}: ${esc(t('edn.p.sim', { s: num(String(w.similarity)) }))}${mark({ cs: 'reconstruction', rows: [w.segment_id], link: `texts/gatha/${p.id}`, note: [`Match type: ${w.match_type}; similarity ${w.similarity}; ${w.alignment_verdict || 'no alignment verdict'}.`], noteMr: 'जुळणी संगणकाने केली; कोणी तपासलेली नाही.' }, { what: t('edn.p.sim.what') })}</p>`).join('')}</div>`;
  const screens = [
    `<article class="ps"><p class="fl big" lang="mr">${esc(keepDandas(p.first_line_display))}</p><div class="shelves">${shelves}</div><p class="xsmall">${esc(t('edn.p.only1908'))}</p></article>`,
    `<article class="ps"><h2 class="h2">${esc(t('edn.p.text'))}</h2>${textHtml}</article>`,
    `<article class="ps"><h2 class="h2">${esc(t('edn.p.match'))}</h2>${matchHtml}<div class="xdoors">${door('editions', t('edn.p.back'), t('edn.sub'))}</div></article>`,
  ];
  ctx.el.innerHTML = `${CSS}<div class="x-editions"><p class="xsmall"><a href="#/editions">${esc(t('edn.p.back'))}</a></p><h1 tabindex="-1">${esc(t('edn.p.title'))}</h1><div id="edn-pp"></div></div>`;
  ctx.after = () => pager(ctx.el.querySelector('#edn-pp'), { count: screens.length, label: t('edn.p.screens'), render: (i) => screens[i],
    start: Math.max(0, Math.min(2, (parseInt(ctx.query.get('p'), 10) || 1) - 1)),
    onChange: (i) => { const want = `#/editions/${id}${i ? '?p=' + (i + 1) : ''}`; if (location.hash !== want) history.replaceState(null, '', want); } });
}

const CSS = `<style>
.x-editions{max-width:44rem;margin:0 auto;padding:var(--sp-4) var(--sp-4) var(--sp-6)}
.x-editions h1{font-size:var(--s-3);margin:0 0 var(--sp-1)}
.x-editions .sub{color:var(--ink-2);font-size:var(--s--1);margin:0 0 var(--sp-3)}
.x-editions .venn{position:relative;max-width:26rem;margin:0 auto;aspect-ratio:340/292}
.x-editions .venn svg{position:absolute;inset:0;width:100%;height:100%}
.x-editions .rings circle{fill:color-mix(in srgb,var(--paper-2) 60%,transparent);stroke:var(--ink-3);stroke-width:1.3}
.x-editions .hit{fill:transparent;cursor:pointer}
.x-editions .selfill{fill:var(--saffron-soft);opacity:.85}
.x-editions .cnt{position:absolute;transform:translate(-50%,-50%);min-width:44px;min-height:44px;border:0;background:none;color:var(--ink);cursor:pointer;display:grid;place-items:center;border-radius:50%}
.x-editions .cnt b{font-family:var(--f-text);font-weight:400;font-size:1.15rem}
.x-editions .cnt[aria-pressed="true"] b{color:var(--maroon);font-size:1.3rem}
.x-editions .en{position:absolute;border:0;background:none;color:var(--maroon);cursor:pointer;padding:.3rem .2rem;min-height:40px;font:inherit}
.x-editions .en b{font-weight:600;font-size:.95rem;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.x-editions .e1{left:0;top:0}.x-editions .e2{right:0;top:0}.x-editions .e3{left:62%;bottom:0}
.x-editions .pn{text-align:center;margin:.3rem 0 var(--sp-3)}
.x-editions .diff{margin:var(--sp-3) 0;border-left:2px solid var(--maroon);padding-left:var(--sp-3);line-height:1.65}
.x-editions .rname{font-family:var(--f-text);font-weight:400;font-size:var(--s-1);margin:var(--sp-4) 0 var(--sp-2);border-top:1px solid var(--rule);padding-top:var(--sp-4)}
.x-editions .fl{font-family:var(--f-text);font-size:var(--s-1);line-height:1.7;margin:var(--sp-2) 0}
.x-editions .fl.big{font-size:var(--verse-x)}
.x-editions .cells,.x-editions .shelves{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-2);margin:var(--sp-3) 0}
.x-editions .cell{border-top:2px solid var(--saffron);padding-top:var(--sp-2)}
.x-editions .cell.none,.x-editions .shelf.none{border-color:var(--rule);color:var(--ink-3)}
.x-editions .ec{font-size:.78rem;color:var(--ink-3);margin:0}
.x-editions .cell .no{font-family:var(--f-text);font-size:var(--s-2);margin:0}
.x-editions .shelf{border-top:2px solid var(--saffron);padding-top:var(--sp-2)}
.x-editions .shelf .no{font-family:var(--f-text);font-size:var(--s-1);margin:.2rem 0}
.x-editions .shelf .fl{font-size:var(--s-0)}
@media (max-width:40rem){.x-editions .shelves{grid-template-columns:1fr}.x-editions .shelf{border-top:0;border-left:2px solid var(--saffron);padding:0 0 0 var(--sp-3)}.x-editions .shelf.none{border-left-color:var(--rule)}}
.x-editions .txt .ln{display:block;font-family:var(--f-text);font-size:var(--s-1);line-height:1.8;margin:.2rem 0}
.x-editions .txt.raw .ln{font-size:var(--s-0);color:var(--ink-2)}
.x-editions .h2{font-size:var(--s-1);margin:0 0 var(--sp-2)}
.x-editions .mt p{margin:0 0 var(--sp-2)}
</style>`;
