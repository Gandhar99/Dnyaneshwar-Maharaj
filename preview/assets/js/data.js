// Data access. Every file lives under data/ and is listed in data/manifest.json (see DATA_CONTRACT.md).
// Paths are relative to the site root, so the site works from any sub-path.
import { SITE_ROOT } from './util.js';

const cache = new Map();

/** Load a JSON file from data/, e.g. getJSON('gatha/index.json'). Cached for the session. */
export function getJSON(rel) {
  if (!cache.has(rel)) {
    const url = new URL('data/' + rel, SITE_ROOT);
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${rel}`);
      return r.json();
    });
    p.catch(() => cache.delete(rel));
    cache.set(rel, p);
  }
  return cache.get(rel);
}

/** Load several files at once. */
export const getAll = (rels) => Promise.all(rels.map(getJSON));

// ---------- convenience accessors used by more than one group ----------
let sourcesById;
export async function source(id) {
  if (!sourcesById) {
    const rows = await getJSON('evidence/sources.json');
    sourcesById = new Map(rows.map((r) => [r.source_id, r]));
  }
  return sourcesById.get(id);
}

let glossary;
/** Glossary terms as a Map: word -> {id, word, headword, mr, en, basis, cs}. */
export async function glossaryMap() {
  if (!glossary) {
    const rows = await getJSON('words/glossary_terms.json');
    glossary = new Map(rows.map(([id, word, headword, mr, en, basis, cs]) => [word, { id, word, headword, mr, en, basis, cs }]));
  }
  return glossary;
}

let gindex;
/** Gatha index rows as objects: {id, first_line, q, has_text, witnesses:[[w, no]], themes:[], chunk}. */
export async function gathaIndex() {
  if (!gindex) {
    const ix = await getJSON('gatha/index.json');
    gindex = {
      editions: ix.witness_editions,
      rows: ix.rows.map(([id, first_line, q, has_text, w, th, chunk]) => ({
        id, first_line, q, has_text: !!has_text,
        witnesses: w ? w.split('|').map((x) => { const k = x.indexOf(':'); return [x.slice(0, k), x.slice(k + 1)]; }) : [],
        themes: th ? th.split(' ') : [], chunk,
      })),
    };
    gindex.byId = new Map(gindex.rows.map((r, i) => [r.id, { ...r, i }]));
  }
  return gindex;
}

/** One gatha composition with full detail, plus its neighbours in edition order.
 *  Uses the small gatha/lookup.json, not the list index, so a poem page loads little. */
export async function gathaPoem(id) {
  const lk = await getJSON('gatha/lookup.json');
  const i = lk.ids.indexOf(id);
  if (i < 0) return null;
  const file = (n) => `gatha/p${String(n).padStart(3, '0')}.json`;
  const chunk = await getJSON(file(lk.chunks[i]));
  const poem = chunk.find((p) => p.id === id);
  const near = async (j) => {
    if (j < 0 || j >= lk.ids.length) return null;
    const c = lk.chunks[j] === lk.chunks[i] ? chunk : null;   // first line only when already loaded
    const p = c?.find((x) => x.id === lk.ids[j]);
    return { id: lk.ids[j], first_line: p?.first_line_display || '' };
  };
  return { poem, prev: await near(i - 1), next: await near(i + 1), editions: lk.witness_editions };
}

/** Segment id -> route for any text (DW01 via id, short works via id, gatha via links/gatha_segments.json). */
export async function routeForSegment(segId) {
  let m;
  if ((m = /^DNY(\d\d)S?_/.exec(segId))) return `texts/dnyaneshwari/${+m[1]}?seg=${segId}`;
  if (/^AMRW01_/.test(segId)) return `texts/amritanubhav?doc=AMRW01&seg=${segId}`;
  if (/^AMR_/.test(segId)) return `texts/amritanubhav?seg=${segId}`;
  if (/^CP_/.test(segId)) return `texts/changdev-pasashti?seg=${segId}`;
  if (/^HP_/.test(segId)) return `texts/haripath?seg=${segId}`;
  const g = await getJSON('links/gatha_segments.json');
  if (g[segId]) return `texts/gatha/${g[segId]}`;
  return null;
}
