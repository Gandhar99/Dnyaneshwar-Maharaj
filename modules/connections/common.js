// Helpers shared by the pages of the connections group.
import { t, has } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { claimBadge, provisional } from '../../assets/js/components.js';

export const SLUG = { namdev: 'Namdev', nivruttinath: 'Nivruttinath', muktabai: 'Muktabai', sopandev: 'Sopandev', changdev: 'Changdev' };
export const slugOf = (name) => name.toLowerCase();
export const SAINT_PAGES = ['Namdev', 'Nivruttinath', 'Muktabai', 'Sopandev'];
export const ORDER = ['Nivruttinath', 'Sopandev', 'Muktabai', 'Namdev', 'Changdev'];

export const saintName = (n) => t('cn.saint.' + n);
export const crumbs = (...parts) => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a>${parts.map(([h, l]) => ` / ${h ? `<a href="${h}">${esc(l)}</a>` : esc(l)}`).join('')}</p>`;

/** A line of the texts as a label: [kind, a, b] from the generated lists. */
export function segLabel(kind, a, b, id) {
  if (kind === 'DW') return esc(t('cn.seg.dw', { ch: num(String(a)), n: num(String(b || '–')) }));
  if (kind === 'AMR') return esc(t('cn.seg.amr', { n: num(String(a || '–')) }));
  if (kind === 'HP') return esc(t('cn.seg.hp', { n: num(String(a || '–')) }));
  if (kind === 'CP') return esc(t('cn.seg.cp', { n: num(String(a || '–')) }));
  if (kind === 'G') return `<span lang="mr">${esc(a)}</span>`;
  return esc(t('cn.seg.unknown', { id }));
}

/** Certainty of a name match, with the plain reason where the data gives one. */
export function certMark(c) {
  if (!c) return '';
  return `<span class="cert cert-${esc(c)}" title="${esc(c === 'medium' ? t('cn.cert.medium.why') : t('cn.cert.' + c))}">${esc(t('cn.cert.' + c))}</span>`;
}

/** One block saying once that these counts are found by rule. */
export const ruleNote = () => `<p class="small">${claimBadge('reconstruction')} ${provisional()} <span class="muted">${esc(t('cn.method.note'))}</span></p>`;

export const epLabel = (e) => (e ? (has('cn.ep.' + e) ? t('cn.ep.' + e) : e) : t('cn.in.noepisode'));

/** Wraps a page: scoped stylesheet link (relative URL) plus the page container. */
export const shell = (inner, wide = false) => `<link rel="stylesheet" href="modules/connections/style.css"><div class="page${wide ? ' wide' : ''} m-connections">${inner}</div>`;
