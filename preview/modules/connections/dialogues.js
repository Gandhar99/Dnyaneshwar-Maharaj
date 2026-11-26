// #/connections/dialogues and #/connections/dialogues/<dialogue_id>
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty, verseBlock, claimBadge, provisional, sourceChips , wsCredit } from '../../assets/js/components.js';
import { crumbs, shell } from './common.js';

const PAGE = 25;
const IDS = ['DNYC-DLG01', 'DNYC-DLG02', 'DNYC-DLG03-SKH1908', 'DNYC-DLG03-TEL1954'];
const who = (s) => (s ? (/^[A-Z]/.test(s) ? t('cn.who.' + s) : s) : t('cn.who.unknown'));
const quoted = (name) => (/["“]([^"”]+)["”]/.exec(name) || [])[1] || '';

export async function render(ctx) {
  const rows = await getJSON('connections/dialogues.json');
  const id = ctx.path[1];
  if (!id) return list(ctx, rows);
  const mine = rows.filter((r) => r.dialogue_id === id).sort((a, b) => a.unit_order - b.unit_order);
  if (!mine.length) {
    ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')], ['#/connections/dialogues', t('cn.dl.title')])}<h1 tabindex="-1">${esc(t('cn.dl.notfound'))}</h1>`);
    return;
  }
  return detail(ctx, id, mine);
}

function list(ctx, rows) {
  const items = IDS.map((id) => {
    const r = rows.filter((x) => x.dialogue_id === id);
    return r.length ? `<li><a href="${href('connections/dialogues/' + id)}"><span class="t">${esc(t('cn.dl.' + id))}</span>
      <span class="d">${esc(t('cn.dl.d.' + id))}</span>
      <span class="d">${esc(t('cn.dl.units', { n: num(r.length) }))} · ${esc(t('cn.dl.participants'))}: ${esc(participants(r[0]))}</span></a>
      ${honesty(r[0], { sources: false })}</li>` : '';
  }).join('');
  ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')], [null, t('cn.dl.title')])}
    <h1 tabindex="-1">${esc(t('cn.dl.title'))}</h1>
    <p class="muted">${esc(t('cn.dl.lead'))}</p>
    <ul class="dcards">${items}</ul>`);
}

function participants(r) {
  const p = (r.participants || '').split(/;\s*/).filter(Boolean);
  if (!p.length || p[0] === 'unknown') return t('cn.who.unknown');
  return p.map((x) => { const k = x[0].toUpperCase() + x.slice(1); return /^[A-Z]/.test(k) && /^(Dnyaneshwar|Changdev|Krishna|Arjuna|Sanjaya|Dhritarashtra|Nivruttinath)$/.test(k) ? t('cn.who.' + k) : x; }).join(', ');
}

async function detail(ctx, id, mine) {
  const dt = await import('./pre-dlg.js');
  const { texts, gatha } = dt.DLG_TEXT;
  const groups = [];
  mine.forEach((r) => { let g = groups.find((x) => x.name === r.name); if (!g) groups.push(g = { name: r.name, rows: [] }); g.rows.push(r); });
  const notes = [...new Set(mine.map((r) => r.attribution_note).filter(Boolean))];
  const speakers = new Set(mine.map((r) => r.speaker).filter(Boolean));
  const twoVoices = speakers.size > 1;

  const routeOf = (seg) => {
    let m;
    if ((m = /^DNY(\d\d)S?_/.exec(seg))) return `texts/dnyaneshwari/${+m[1]}?seg=${seg}`;
    if (/^CP_/.test(seg)) return `texts/changdev-pasashti?seg=${seg}`;
    return gatha[seg] ? 'texts/gatha/' + gatha[seg] : '';
  };
  const unitName = (seg) => {
    let m;
    if ((m = /^DNY(\d\d)S?_/.exec(seg))) return t('cn.seg.dwch', { ch: num(String(+m[1])) });
    if ((m = /^CP_0*(\d+)/.exec(seg))) return t('cn.seg.cp', { n: num(m[1]) });
    return '';
  };
  const textOf = (r) => {
    const tx = texts[r.segment_id];
    if (!tx) return `<p class="small faint">${esc(/^DNY07_/.test(r.segment_id) ? t('cn.dl.ch7') : t('cn.dl.notext'))}</p>`;
    const sa = twoVoices && r.dialogue_id === 'DNYC-DLG02';
    return verseBlock(tx, { size: 'small', lang: sa ? 'sa' : 'mr', halves: false });
  };
  const open = (r) => { const h = routeOf(r.segment_id); return h ? `<a class="open" href="${esc(href(h))}">${esc(t('cn.dl.open'))}</a>` : ''; };
  const side = (s) => (s === 'Krishna' ? 'right' : s === 'Arjuna' ? 'left' : 'mid');
  const unit = (r) => {
    if (twoVoices) {
      return `<li class="voice ${side(r.speaker)}" title="${esc(r.segment_id)}"><div class="sp"><span>${esc(who(r.speaker))}${r.addressee ? ` <span class="faint">→ ${esc(who(r.addressee))}</span>` : ''} · ${esc(unitName(r.segment_id))}</span>${open(r)}</div>${textOf(r)}</li>`;
    }
    return `<li class="voice left" title="${esc(r.segment_id)}"><div class="sp"><span>${esc(unitName(r.segment_id) || t('cn.dl.incipit'))}</span>${open(r)}</div>${textOf(r)}</li>`;
  };

  const groupHtml = (g, gi) => {
    const q = quoted(g.name);
    return `<section aria-labelledby="g${gi}">
      ${groups.length > 1 || q ? `<h2 id="g${gi}">${q ? `${esc(t('cn.dl.heading'))}: <span lang="mr">${esc(q)}</span>` : esc(t('cn.dl.units', { n: num(g.rows.length) }))}</h2>` : `<h2 id="g${gi}">${esc(t('cn.dl.units', { n: num(g.rows.length) }))}</h2>`}
      <ol class="voices" id="v${gi}" start="1" style="list-style:none"></ol>
      <div class="loadmore"><button type="button" class="btn" data-more="${gi}" hidden>${esc(t('more'))}</button></div></section>`;
  };

  const oneVoiceNote = id === 'DNYC-DLG01' ? `<p class="note">${esc(t('cn.dl.one.note'))}</p>` : '';
  const noSpeaker = !speakers.size ? `<p class="note">${esc(t('cn.dl.nospeaker.note'))}</p>` : '';
  const isTel = /TEL/.test(id);
  ctx.el.innerHTML = shell(`${crumbs(['#/connections', t('g.connections')], ['#/connections/dialogues', t('cn.dl.title')], [null, t('cn.dl.' + id)])}
    <h1 tabindex="-1">${esc(t('cn.dl.' + id))}</h1>
    <p class="muted">${esc(t('cn.dl.d.' + id))}</p>
    ${honesty(mine[0])}
    <dl class="kv"><dt>${esc(t('cn.dl.participants'))}</dt><dd>${esc(participants(mine[0]))}</dd>
      ${speakers.size ? '' : `<dt>${esc(t('cn.dl.speaker'))}</dt><dd>${esc(t('cn.dl.undetermined'))}</dd>`}</dl>
    ${notes.length === 1 ? (lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : '') + `<p class="note" lang="en">${esc(notes[0])}</p>` : ''}
    ${notes.length > 1 ? `<details><summary>${esc(t('cn.dl.notes'))} (${esc(num(notes.length))})</summary>${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}${notes.map((n) => `<p class="note" lang="en">${esc(n)}</p>`).join('')}</details>` : ''}
    ${oneVoiceNote}${noSpeaker}${isTel ? `<p class="note">${esc(t('cn.dl.incipit'))}</p>` : ''}
    ${groups.map(groupHtml).join('')}
    ${await wsCredit(mine.map((r) => r.segment_id))}
    <p><a href="#/connections/dialogues">${esc(t('cn.dl.title'))}</a></p>`);

  ctx.after = () => {
    groups.forEach((g, gi) => {
      let shown = 0;
      const ol = ctx.el.querySelector('#v' + gi) || document.getElementById('v' + gi);
      const btn = (ctx.el.querySelector(`[data-more="${gi}"]`) || document.querySelector(`[data-more="${gi}"]`));
      const step = () => {
        const next = g.rows.slice(shown, shown + (twoVoices ? 100 : PAGE));
        ol.insertAdjacentHTML('beforeend', next.map(unit).join(''));
        shown += next.length; btn.hidden = shown >= g.rows.length;
      };
      step(); btn.addEventListener('click', step);
    });
  };
}
