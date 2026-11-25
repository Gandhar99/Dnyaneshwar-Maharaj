// Shell: header, bottom bar, sections sheet, language and theme, hash router.
// Routes: '#/<group>/<rest...>?<query>'. Each group is a module at modules/<group>/index.js that exports
//   render(ctx) -> Promise<void>   where ctx = { el, path: [...rest], query: URLSearchParams, group }
// and optionally title(ctx) -> string. The router owns <main>; a module writes only inside ctx.el.
import { t, lang, setLang, onLang } from './i18n.js';
import { esc, SITE_ROOT } from './util.js';
import { icon, initComponents, errorBox, loading } from './components.js';

export const GROUPS = ['texts', 'life', 'calendar', 'connections', 'discover', 'words', 'evidence', 'doors'];
const MODULES = new Set(['home', 'search', ...GROUPS]);

const main = document.getElementById('main');
const header = document.getElementById('top');
const bar = document.getElementById('bar');
const sheet = document.getElementById('sheet');

// ---------- theme ----------
const THEME_KEY = 'dny.theme';
function applyTheme(th) {
  if (th) document.documentElement.dataset.theme = th; else delete document.documentElement.dataset.theme;
}
function currentTheme() {
  return document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
  renderChrome();
}
try { applyTheme(localStorage.getItem(THEME_KEY)); } catch { /* ignore */ }

// ---------- chrome ----------
function renderChrome() {
  const g = route().group;
  const cur = (x) => (x === g ? ' aria-current="page"' : '');
  const themeBtn = `<button type="button" class="tbtn icon" data-act="theme" aria-label="${esc(t('theme.label'))}">${currentTheme() === 'dark' ? icon.sun : icon.moon}</button>`;
  const otherLang = lang() === 'mr' ? 'en' : 'mr';
  header.innerHTML =
    `<a class="brand" href="#/" aria-label="${esc(t('site.full'))}">${icon.pataka}<span lang="mr">${esc(t('site.name'))}</span></a>` +
    `<nav class="top-nav" aria-label="${esc(t('nav.sections'))}">` +
    `<a class="tbtn"${cur('texts')} href="#/texts">${esc(t('nav.texts'))}</a>` +
    ['life', 'calendar', 'connections', 'evidence'].map((x) => `<a class="tbtn"${cur(x)} href="#/${x}">${esc(t('g.' + x))}</a>`).join('') +
    `</nav><span class="spacer"></span>` +
    `<a class="tbtn icon"${cur('search')} href="#/search" aria-label="${esc(t('nav.search'))}">${icon.search}</a>` +
    `<button type="button" class="tbtn" data-act="lang" lang="${otherLang}" aria-label="${esc(t('lang.switch.label'))}">${esc(t('lang.switch'))}</button>` +
    `${themeBtn}<button type="button" class="tbtn icon" data-act="menu" aria-label="${esc(t('nav.menu'))}" aria-expanded="false" aria-controls="sheet">${icon.sections}</button>`;
  bar.innerHTML =
    `<a href="#/"${cur('home')}>${icon.home}<span>${esc(t('nav.home'))}</span></a>` +
    `<a href="#/texts"${cur('texts')}>${icon.book}<span>${esc(t('nav.texts'))}</span></a>` +
    `<a href="#/search"${cur('search')}>${icon.search}<span>${esc(t('nav.search'))}</span></a>` +
    `<button type="button" data-act="menu" aria-expanded="false" aria-controls="sheet">${icon.sections}<span>${esc(t('nav.sections'))}</span></button>`;
  sheet.querySelector('.panel').innerHTML =
    `<div class="grip" aria-hidden="true"></div>` +
    `<div class="row"><h2 id="sheet-title" style="margin:0">${esc(t('nav.menu'))}</h2>` +
    `<button type="button" class="tbtn icon" data-act="close" aria-label="${esc(t('nav.close'))}">${icon.close}</button></div>` +
    `<ul class="doors">${GROUPS.map((x) => `<li><a href="#/${x}"${cur(x)}><span class="mark">${icon.pataka}</span>` +
      `<span class="t">${esc(t('g.' + x))}</span><span></span><span class="d">${esc(t('g.' + x + '.d'))}</span></a></li>`).join('')}</ul>` +
    `<div class="row" style="margin-top:var(--sp-4)">` +
    `<button type="button" class="btn" data-act="lang" lang="${otherLang}">${esc(t('lang.switch'))}</button>` +
    `<button type="button" class="btn" data-act="theme">${currentTheme() === 'dark' ? icon.sun : icon.moon}${esc(currentTheme() === 'dark' ? t('theme.light') : t('theme.dark'))}</button></div>`;
  document.getElementById('skip').textContent = t('skip');
  document.getElementById('foot').innerHTML =
    `<p>${esc(t('foot.honest'))}</p><p>${esc(t('foot.ws'))} <a href="https://mr.wikisource.org/" rel="noopener">mr.wikisource.org</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">CC BY-SA 4.0</a></p><p><a href="${new URL('data/manifest.json', SITE_ROOT).href}">${esc(t('foot.data'))}</a> · ` +
    `<a href="${new URL('fonts/OFL-Mukta.txt', SITE_ROOT).href}">${esc(t('foot.fonts'))}</a></p>`;
}

let lastFocus;
function openSheet() {
  lastFocus = document.activeElement;
  sheet.classList.add('open');
  document.querySelectorAll('[data-act="menu"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  sheet.querySelector('[data-act="close"]').focus();
}
function closeSheet() {
  if (!sheet.classList.contains('open')) return;
  sheet.classList.remove('open');
  document.querySelectorAll('[data-act="menu"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  lastFocus?.focus?.();
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (a) {
    const act = a.dataset.act;
    if (act === 'menu') openSheet();
    else if (act === 'close') closeSheet();
    else if (act === 'lang') { setLang(lang() === 'mr' ? 'en' : 'mr'); }
    else if (act === 'theme') toggleTheme();
    return;
  }
  if (e.target.classList.contains('scrim')) closeSheet();
  if (e.target.closest('#sheet a')) closeSheet();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSheet();
  if (e.key === 'Tab' && sheet.classList.contains('open')) {   // keep focus inside the sheet
    const f = [...sheet.querySelectorAll('a, button')];
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});

// ---------- router ----------
export function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [p, qs = ''] = raw.split('?');
  const parts = p.split('/').filter(Boolean).map(decodeURIComponent);
  const group = parts[0] || 'home';
  return { group, path: parts.slice(1), query: new URLSearchParams(qs) };
}

let renderId = 0;
let lastKey = '';
async function render({ keepScroll = false } = {}) {
  const id = ++renderId;
  const r = route();
  renderChrome();
  const key = r.group + '/' + r.path.join('/');
  const sameView = key === lastKey;
  lastKey = key;
  if (!MODULES.has(r.group)) { notFound(); return; }
  if (!sameView) main.innerHTML = `<div class="page">${loading()}</div>`;
  try {
    const mod = await import(new URL(`modules/${r.group}/index.js`, SITE_ROOT).href);
    if (id !== renderId) return;
    const el = document.createElement('div');
    const ctx = { el, group: r.group, path: r.path, query: r.query, rerender: () => render({ keepScroll: true }), isCurrent: () => id === renderId };
    await mod.render(ctx);
    if (id !== renderId) return;
    // ctx.el itself goes into <main> (display: contents), so lookups through ctx.el keep working in event handlers
    el.style.display = 'contents';
    main.replaceChildren(el);
    document.title = (mod.title?.(ctx) ? mod.title(ctx) + ' · ' : '') + t('site.full');
    if (ctx.after) ctx.after();
    if (!keepScroll && !sameView && !ctx.manageScroll) window.scrollTo(0, 0);
    if (!sameView) (main.querySelector('h1') || main).focus({ preventScroll: true });
  } catch (e) {
    console.error(e);
    if (id === renderId) main.innerHTML = `<div class="page">${errorBox(e)}<p><button class="btn" type="button" onclick="location.reload()">${esc(t('retry'))}</button></p></div>`;
  }
}
function notFound() {
  main.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p>${esc(t('notfound.body'))}</p><p><a class="btn" href="#/">${esc(t('back.home'))}</a></p></div>`;
}

window.addEventListener('hashchange', () => { closeSheet(); render(); });
onLang(() => render({ keepScroll: true }));
document.documentElement.lang = lang();
initComponents();
render();
