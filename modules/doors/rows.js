// Doors: data loading and the small renderers that show one data row with its honesty marks.
// Paths add no facts: every row below is read from the exported data and shown through the shared components.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, formatDate } from '../../assets/js/util.js';
import { getJSON, gathaPoem } from '../../assets/js/data.js';
import { honesty, enText, claimBadge, provisional, verseBlock, quality, confirmation, sourceChips } from '../../assets/js/components.js';

// Gatha poems used in curated paths: the small "daily" files hold their reading text. Which file holds a poem changes
// with every export, so all daily files named by home.json are read (about 220 KB in all) and, failing that, the poem page data.

const TYPE_FILES = {
  event: ['life.json'], profile: ['life.json'], dispute: ['life.json'],
  stage: ['calendar.json', 'places.json'], obs: ['calendar.json'], lit: ['texts/works.json'],
  gloss: ['words/glossary_terms.json'], counts: ['home.json'], topics: ['topics.json'], spot: ['places.json'],
};

/** Load only the files the given row types need; return lookup maps. */
export async function loadBundle(types, poemIds = []) {
  const files = new Set();
  types.forEach((x) => (TYPE_FILES[x] || []).forEach((f) => files.add(f)));
  if (poemIds.length) { files.add('gatha/lookup.json'); files.add('home.json'); }
  const names = [...files];
  const loaded = await Promise.all(names.map((f) => getJSON(f)));
  let daily = [];
  if (poemIds.length) {
    const d = loaded[names.indexOf('home.json')].daily;
    const n = d?.size ? Math.ceil(d.size / d.per_file) : 0;
    daily = (await Promise.all(Array.from({ length: n }, (_, i) => getJSON(d.file.replace('{n}', i + 1))))).flat();
    for (const id of poemIds) {
      if (daily.some((p) => p.id === id)) continue;
      const r = await gathaPoem(id).catch(() => null);
      const p = r?.poem;
      if (p?.text) daily.push({ id, first_line: p.first_line_display, text: p.text.reading_text, text_quality: p.text.text_quality,
        reading_basis: p.text.reading_basis, witnesses: p.witnesses.map((w) => `${w.witness}:${w.source_label || '?'}`).join('|'),
        claim_status: p.claim_status, provisional: p.provisional });
    }
  }
  const F = Object.fromEntries(names.map((f, i) => [f, loaded[i]]));
  const by = (rows, key) => new Map((rows || []).map((r) => [r[key], r]));
  const D = {
    home: F['home.json'], topics: F['topics.json'],
    event: by(F['life.json']?.events, 'event_id'), profile: by(F['life.json']?.profile, 'profile_id'),
    disputes: F['life.json']?.disputes || [],
    stages: F['calendar.json']?.palkhi_stages || [], obs: by(F['calendar.json']?.observances, 'observance_id'),
    places: by(F['places.json']?.places, 'place_id'), spot: by(F['places.json']?.memorial_spots, 'spot_id'),
    lit: by(F['texts/works.json']?.liturgical_use, 'row_id'),
    gloss: new Map((F['words/glossary_terms.json'] || []).map(([id, word, headword, mr, en, basis, cs]) => [id, { id, word, headword, mr, en, basis, cs }])),
    poem: new Map(daily.map((p) => [p.id, p])),
    editions: F['gatha/lookup.json']?.witness_editions,
  };
  D.stage = by(D.stages, 'stage_id');
  return D;
}

/** Chip showing the data row id (traceability). */
export const rid = (id) => `<span class="chip rid" title="${esc(t('dr.rowid'))}: ${esc(id)}">${esc(id)}</span>`;

const E = (s) => enText(s, { note: false });
const parseJSON = (s) => { if (s && typeof s === 'object') return s; try { return JSON.parse(s); } catch { return null; } };

/** Name of a place for the interface: Marathi name where the places table has one. */
export function placeName(D, id, fallback) {
  const p = D.places?.get(id);
  if (lang() === 'mr' && p?.name_mr) return `<span lang="mr">${esc(p.name_mr)}</span>`;
  return `<span lang="en">${esc(fallback || p?.name || id || '')}</span>`;
}

// ---------------------------------------------------------------- stage (palkhi 2026)
export function stageHead(row) {
  return row.day_number != null
    ? t('dr.stage.day', { n: num(row.day_number) })
    : t('dr.stage.return');
}

export function stageBody(D, row, { rituals = true } = {}) {
  const same = row.from_place_id && row.from_place_id === row.to_place_id;
  const route = same
    ? `${placeName(D, row.from_place_id, row.from_place_name)} <span class="faint">(${esc(t('dr.stage.same'))})</span>`
    : `${placeName(D, row.from_place_id, row.from_place_name)} <span aria-hidden="true">→</span><span class="vh"> ${esc(t('dr.stage.to'))} </span> ${placeName(D, row.to_place_id, row.to_place_name)}`;
  const dep = parseJSON(row.departure_time);
  const depHtml = dep && typeof dep === 'object' && !Array.isArray(dep)
    ? Object.entries(dep).map(([k, ids]) => `<span class="dep"><b lang="en">${esc(k)}</b> ${sourceChips((ids || []).join('; '))}</span>`).join(' <span class="faint">/</span> ')
    : (row.departure_time ? E(row.departure_time) : '');
  const kv = [
    ['dr.stage.date', row.date ? esc(formatDate(row.date, lang(), { weekday: 'long', day: 'numeric', month: 'long' })) : ''],
    ['dr.stage.dep', depHtml],
    ['dr.stage.ringan', row.ringan_kind ? `<span lang="en">${esc(row.ringan_kind)}${row.ringan_site ? ': ' + esc(row.ringan_site) : ''}</span>` : ''],
    ['dr.stage.nira', row.nira_snan ? `<span lang="en">${esc(row.nira_snan)}</span>` : ''],
  ].filter(([, v]) => v);
  const variants = D.stages.filter((v) => v.variant_of === row.stage_id);
  return `<div class="rowbox">
    <p class="route">${route}</p>
    <dl class="kv">${kv.map(([k, v]) => `<dt>${esc(t(k))}</dt><dd>${v}</dd>`).join('')}</dl>
    ${rituals && row.rituals ? E(row.rituals).replace('<p ', '<p class="small" ') : ''}
    ${honesty(row)}${rid(row.stage_id)}
  </div>${variants.map((v) => `<div class="rowbox variant"><p class="small faint">${esc(t('dr.stage.variant'))}</p>
    <p class="route">${placeName(D, v.from_place_id, v.from_place_name)} <span aria-hidden="true">→</span> ${placeName(D, v.to_place_id, v.to_place_name)}</p>
    ${honesty(v)}${rid(v.stage_id)}</div>`).join('')}`;
}

// ---------------------------------------------------------------- generic refs
/** Render one reference [type, id] as {head, body}. head is the heading when a step has no label of its own. */
export function refBlock(D, [type, id]) {
  switch (type) {
    case 'event': {
      const r = D.event.get(id); if (!r) return missing(id);
      return { head: E(r.title).replace(/^<p/, '<span').replace(/<\/p>$/, '</span>'),
        body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.title)}</p>${honesty(r)}${rid(id)}</div>` };
    }
    case 'eventfull': {
      const r = D.event.get(id); if (!r) return missing(id);
      return { head: `<span lang="en">${esc(r.title)}</span>`,
        body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.title)}</p>${r.date_or_period ? `<p class="small faint" lang="en">${esc(r.date_or_period)}</p>` : ''}${E(r.summary).replace('<p ', '<p class="small" ')}${honesty(r)}${rid(id)}</div>` };
    }
    case 'profile': {
      const r = D.profile.get(id); if (!r) return missing(id);
      return { body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.value)}</p>${r.variant_note ? E(r.variant_note) : ''}${honesty(r)}${rid(id)}</div>` };
    }
    case 'lit': {
      const r = D.lit.get(id); if (!r) return missing(id);
      return { body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.work)}: ${esc(r.occasion)}</p>
        <p class="small faint" lang="en">${esc(r.place || '')}</p>${r.note ? E(r.note).replace('<p ', '<p class="small" ') : ''}${honesty(r)}${rid(id)}</div>` };
    }
    case 'obs': {
      const r = D.obs.get(id); if (!r) return missing(id);
      const d = r.gregorian_date_2026 ? esc(formatDate(r.gregorian_date_2026)) : '';
      return { head: d || `<span lang="en">${esc(r.name)}</span>`,
        body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.name)}</p>${d ? `<p class="small">${d}</p>` : ''}${honesty(r)}${rid(id)}</div>` };
    }
    case 'spot': {
      const r = D.spot.get(id); if (!r) return missing(id);
      return { body: `<div class="rowbox"><p class="rt" lang="en">${esc(r.name)}</p>${honesty(r)}${rid(id)}</div>` };
    }
    case 'stage': {
      const r = D.stage.get(id); if (!r) return missing(id);
      return { head: `${esc(stageHead(r))} <span class="faint">· ${esc(r.date ? formatDate(r.date, lang(), { day: 'numeric', month: 'long' }) : '')}</span>`, body: stageBody(D, r) };
    }
    case 'gloss': {
      const g = D.gloss.get(id); if (!g) return missing(id);
      return { body: `<div class="rowbox"><p class="rt"><span lang="mr">${esc(g.word)}</span>${g.headword && g.headword !== g.word ? ` <small class="faint">(<span lang="mr">${esc(g.headword)}</span>)</small>` : ''}</p>
        ${g.mr ? `<p lang="mr">${esc(g.mr)}</p>` : ''}${g.en ? `<p class="muted" lang="en">${esc(g.en)}</p>` : ''}
        <p class="small faint" lang="en">${esc(g.basis || '')}</p><div class="badges">${claimBadge(g.cs)}${provisional()}${rid(id)}</div></div>` };
    }
    case 'poem': {
      const p = D.poem.get(id); if (!p) return missing(id);
      const ed = D.editions?.SKH1908;
      return { body: `<div class="rowbox"><div class="leaf">${verseBlock(p.text, { size: 'small' })}</div>
        <div class="badges">${quality(p.text_quality)}</div>
        ${honesty({ ...p, source_id: ed?.source_id })}${rid(id)}</div>` };
    }
    case 'counts':
      return { body: `<p class="small faint">${esc(t('dr.counts'))} <span class="chip rid" title="${esc(t('dr.rowid'))}">home.json › counts</span></p>` };
    case 'topics': {
      const rows = D.topics || [];
      const first = rows[0];
      return { body: `<div class="rowbox"><p class="chips">${rows.map((x) => `<a class="chip" href="#/discover/themes/${esc(x.topic_id)}">${esc(t(x.topic_id))}</a>`).join(' ')}</p>
        ${first ? `<div class="badges">${claimBadge(first.claim_status)}${first.provisional ? provisional() : ''}${sourceChips(first.source_id)}${rid('topics.json')}</div>` : ''}</div>` };
    }
    case 'dispute': {   // id = question text: all positions of one question
      const rows = D.disputes.filter((r) => r.question === id);
      if (!rows.length) return missing(id);
      const statuses = [...new Set(rows.map((r) => r.claim_status).filter(Boolean))];
      return { head: `<span lang="en">${esc(id)}</span>`,
        body: `<div class="rowbox"><p class="small">${esc(t('dr.disp.n', { n: num(rows.length) }))}</p>
          <div class="badges">${statuses.map(claimBadge).join('')}${rows.some((r) => r.provisional) ? provisional() : ''}${rows.map((r) => rid(r.dispute_id)).join(' ')}</div></div>` };
    }
    default: return missing(id);
  }
}
const missing = (id) => ({ body: `<p class="small faint">${esc(t('dr.norow'))} ${esc(id)}</p>` });
