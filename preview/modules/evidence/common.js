import { t } from '../../assets/js/i18n.js';
import { esc } from '../../assets/js/util.js';
import { sourceChips, enText } from '../../assets/js/components.js';

export const CSS = '<link rel="stylesheet" href="modules/evidence/style.css">';
export const crumbs = (...more) => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/evidence">${esc(t('ev.crumb'))}</a>${more.map((m) => ' / ' + m).join('')}</p>`;
export const slugOf = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ID = /\b(?:DNY[A-Z]-(?:[A-Z]-)?S\d+|S\d{3})\b/g;
/** Source ids in a free-text evidence field become chips; any other words are kept (English) next to them. */
export function evCell(text) {
  if (!text) return `<p class="faint small">${esc(t('ev.ds.none'))}</p>`;
  const ids = [...new Set(String(text).match(ID) || [])];
  const rest = String(text).replace(ID, '').replace(/[;,\s]+/g, ' ').trim();
  return `<div>${ids.length ? sourceChips(ids.join('; ')) : ''}</div>${rest ? enText(String(text), { note: false }).replace('<p ', '<p class="small" ') : ''}`;
}
