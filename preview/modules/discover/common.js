// Helpers shared by the pages of the discover group.
import { t, has } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { claimBadge, provisional } from '../../assets/js/components.js';

export const shell = (inner, wide = false) => `<link rel="stylesheet" href="modules/discover/style.css"><div class="page${wide ? ' wide' : ''} m-discover">${inner}</div>`;
export const crumbs = (...parts) => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/discover">${esc(t('dc.crumb'))}</a>${parts.map(([h, l, lg]) => ` / ${h ? `<a href="${h}">${esc(l)}</a>` : (lg ? `<span lang="${lg}">${esc(l)}</span>` : esc(l))}`).join('')}</p>`;
export const TOPICS = Array.from({ length: 20 }, (_, i) => 'T' + String(i + 1).padStart(2, '0'));
export const nameOf = (n) => (has('dc.nm.' + n) ? t('dc.nm.' + n) : n);
export const KINDS = { god: 'divine', people: 'people', places: 'places' };
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Marks used for the rule-based name lists. */
export const certMark = (c) => (c ? `<span class="cert cert-${esc(c)}" title="${esc(t('dc.cert.' + c + '.t'))}">${esc(t('dc.cert.' + c))}</span>` : '');
export const ruleNote = () => `<p class="small">${claimBadge('reconstruction')} ${provisional()} <span class="muted">${esc(t('dc.method.rule.note'))}</span></p>`;
export const aiNote = (key) => `<p class="small">${claimBadge('reconstruction')} ${provisional()} <strong class="ai">${esc(t('dc.method.ai'))}</strong></p><p class="note">${esc(t(key))}</p>`;

/** Short label for a line of the texts: [kind, a, b] as written by build_data.py. */
export function lineLabel(kind, a, b) {
  if (kind === 'DW') return esc(t('dc.seg.dw', { ch: num(String(a)), n: num(String(b || '–')) }));
  if (kind === 'AMR') return esc(t('dc.seg.amr1', { n: num(String(a || '–')) }));
  if (kind === 'HP') return esc(t('dc.seg.hp1', { n: num(String(a || '–')) }));
  if (kind === 'CP') return esc(t('dc.seg.cp1', { n: num(String(a || '–')) }));
  if (kind === 'G') return `<span lang="mr">${esc(a)}</span>`;
  return esc(String(a));
}
export const workTitle = (k) => (k.startsWith('DW') ? t('dc.seg.dwch', { ch: num(k.slice(2)) }) : t('dc.seg.' + (k === 'G' ? 'G' : k.toLowerCase())));
