// Devanagari normalisation for tolerant search. Ignores: anusvara and chandrabindu, a nasal consonant + virama
// before another consonant (सन्त = संत = सत), vowel length (ि/ी, ु/ू, इ/ई, उ/ऊ), nukta, ZWJ/ZWNJ, dandas, digits and
// punctuation, and ऱ/र. Returns the normalised string and, for each of its characters, the index in the input,
// so hits can be highlighted in the original text.

const DROP = new Set(['ं', 'ँ', '़', '‌', '‍', 'ः']);  // anusvara, chandrabindu, nukta, ZWNJ, ZWJ, visarga
const MAP = { 'ी': 'ि', 'ू': 'ु', 'ई': 'इ', 'ऊ': 'उ', 'ऱ': 'र',
  'ॠ': 'ऋ', 'ॄ': 'ृ', 'ऑ': 'ओ', 'ॉ': 'ो', 'ॅ': 'े', 'ऍ': 'ए' };
const NASAL = new Set(['ङ', 'ञ', 'ण', 'न', 'म']);           // ङ ञ ण न म
const isCons = (c) => c >= 'क' && c <= 'ह';
const isSkip = (c) => /[\s।॥|\-–—,.;:!?'"“”‘’()\[\]{}0-9०-९_*/\\]/.test(c);

export function normalize(input) {
  const s = String(input ?? '').normalize('NFC');
  let out = '';
  const map = [];
  let lastSpace = true;
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    if (DROP.has(c)) continue;
    // nasal consonant + virama before a consonant behaves like an anusvara: drop both
    if (NASAL.has(c) && s[i + 1] === '्' && isCons(s[i + 2] || '')) { i++; continue; }
    if (isSkip(c)) {
      if (!lastSpace) { out += ' '; map.push(i); lastSpace = true; }
      continue;
    }
    c = MAP[c] || c.toLowerCase();
    out += c; map.push(i); lastSpace = false;
  }
  if (out.endsWith(' ')) { out = out.slice(0, -1); map.pop(); }
  return { s: out, map };
}
export const norm = (x) => normalize(x).s;

/** Find all hits of normalised query q in text; returns [[start, end] in original indices]. */
export function findHits(text, q, max = 20) {
  const { s, map } = normalize(text);
  const nq = norm(q);
  if (!nq) return [];
  const hits = [];
  let from = 0;
  while (hits.length < max) {
    const k = s.indexOf(nq, from);
    if (k < 0) break;
    const a = map[k];
    let b = map[k + nq.length - 1] + 1;
    // extend to include following combining marks (matras, anusvara, virama)
    while (b < text.length && /[ऀ-ःऺ-ॏ॑-ॗॢॣ]/.test(text[b])) b++;
    hits.push([a, b]);
    from = k + nq.length;
  }
  return hits;
}
