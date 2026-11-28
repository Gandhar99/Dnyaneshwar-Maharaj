// Helpers shared by the pages of the Life group.
import { t, lang, has } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { honesty } from '../../assets/js/components.js';
import { termHtml } from '../../assets/js/mr-terms.js';

export const loadLife = () => getJSON('life.json');
export const loadPlaces = () => getJSON('places.json');

export const isDev = (s) => { const x = String(s ?? ''); return /[\u0900-\u097F]/.test(x) && !/[A-Za-z]{3,}/.test(x); };
/** Data text: Devanagari keeps lang=mr, anything else is English data. */
export const txt = (s) => (s ? `<span lang="${isDev(s) ? 'mr' : 'en'}">${esc(s)}</span>` : '');
export const en = (s) => (s ? `<span lang="en">${esc(s)}</span>` : '');
/** One note per page (Marathi mode) that the data prose below is English for now. */
export const enNote = () => (lang() === 'mr' ? `<p class="enonly" lang="mr">${esc(t('en.only'))}</p>` : '');
export const crumbs = (...parts) => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / ${parts.join(' / ')}</p>`;
export const lifeCrumb = () => `<a href="#/life">${esc(t('g.life'))}</a>`;
export const cssLink = () => '<link rel="stylesheet" href="modules/life/style.css">';
export const pname = (p) => (lang() === 'mr' ? `<span lang="mr">${esc(p.name_mr || p.name)}</span>` : `<span lang="en">${esc(p.name)}</span>`);
export const rowId = (id) => `<span class="rowid faint" title="${esc(t('life.rowid'))}">${esc(id)}</span>`;

/** [[label, htmlValue], ...] -> definition list; empty values are skipped. */
export function kv(pairs) {
  const rows = pairs.filter(([, v]) => v !== undefined && v !== null && v !== '');
  return rows.length ? `<dl class="kv">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>` : '';
}

/** The tradition line for devotional-tradition rows. */
export const traditionLine = (row) => (row.claim_status === 'devotional tradition' ? `<p class="note trad">${esc(t('life.tradition'))}</p>` : '');

export function placeMap(places) { return new Map(places.map((p) => [p.place_id, p])); }

const clean = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
/** events.place_id holds names separated by ';'. Match each to a place row only when the name (without any note in
 *  brackets) is that place's name; a note in brackets such as "(tradition)" stays visible beside the link. */
export function matchPlaces(str, places) {
  return String(str || '').split(';').map((raw) => raw.trim()).filter(Boolean).map((raw) => {
    const c = clean(raw);
    const hit = places.find((p) => [p.name, p.modern_village].filter(Boolean)
      .flatMap((n) => [clean(n), ...String(n).split(/[\/(]/).map(clean)]).some((n) => n && n === c));
    const note = (raw.match(/\(([^)]*)\)/) || [])[1] || '';
    return { raw, place: hit, note };
  });
}
export function placeChips(str, places) {
  return matchPlaces(str, places).map(({ raw, place, note }) => place
    ? `<a class="chip" href="#/life/places/${esc(place.place_id)}" title="${esc(place.place_id + ' · ' + raw)}">${pname(place)}</a>` +
      (note && !String(place.name).includes(note) ? ` <span class="small faint">(${note === 'tradition' ? esc(t('life.ev.bytrad')) : `<span lang="en">${esc(note)}</span>`})</span>` : '')
    : `<span class="chip plain" lang="en">${esc(raw)}</span>`).join(' ');
}

export function eraLabel(e) { return e ? (has('life.era.' + e) ? t('life.era.' + e) : e) : ''; }
export function relLabel(r) { return lang() === 'mr' && has('life.rl.' + r) ? esc(t('life.rl.' + r)) : en(r); }
export const certLabel = (c) => (c ? t('life.cert.' + c) : '');
export const precLabel = (p) => (p && has('life.prec.' + p) ? t('life.prec.' + p) : p || '');

/** Parse "A, B, DNY18_1882-1885" style segment lists. */
export function splitSegs(s) { return String(s || '').split(/,\s*/).map((x) => x.trim()).filter(Boolean); }

export const fmtCoord = (lat, lon) => `${num(Number(lat).toFixed(4))}° N, ${num(Number(lon).toFixed(4))}° E`;

/** A disputes row as a card. */
export function disputeCard(d) {
  return `<article class="card" data-id="${esc(d.dispute_id)}" title="${esc(d.dispute_id)}">
    <h4 class="small faint">${esc(t('life.dt.position'))}</h4>
    ${termHtml(d.position, 'p', 'class="pos"')}
    ${kv([[t('life.dt.proponents'), en(d.proponents)], [t('life.dt.for'), en(d.evidence_for)], [t('life.dt.against'), en(d.evidence_against)], [t('life.dt.view'), en(d.current_view_if_stated)]])}
    ${honesty(d)}${rowId(d.dispute_id)}</article>`;
}
