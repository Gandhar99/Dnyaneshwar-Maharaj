// Shell: header, bottom bar, sections sheet, language and theme, hash router.
// Routes: '#/<group>/<rest...>?<query>'. Each group is a module at modules/<group>/index.js that exports
//   render(ctx) -> Promise<void>   where ctx = { el, path: [...rest], query: URLSearchParams, group }
// and optionally title(ctx) -> string. The router owns <main>; a module writes only inside ctx.el.
import { t, lang, setLang, onLang } from './i18n.js';
import { esc, SITE_ROOT } from './util.js';
import { icon, initComponents, errorBox, loading } from './components.js';

// The research archive (version 1): every route still works; these pages now sit behind the workshop door.
export const GROUPS = ['texts', 'life', 'calendar', 'connections', 'discover', 'words', 'evidence', 'doors'];
// The experience layer (pass 2). A to D are built by the experience director; E to M by the agents of EXPERIENCES.md.
export const EXPERIENCES = ['read', 'samadhi', 'journey', 'alandi', 'wari', 'saints', 'garden', 'sky', 'ways', 'editions', 'seva', 'card'];
const ARCHIVE = new Set([...GROUPS, 'search']);
const MODULES = new Set(['home', 'workshop', ...ARCHIVE, ...EXPERIENCES]);

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
  const cur = (x) => (x === g || (x === 'workshop' && ARCHIVE.has(g)) ? ' aria-current="page"' : '');
  const themeBtn = `<button type="button" class="tbtn icon" data-act="theme" aria-label="${esc(t('theme.label'))}">${currentTheme() === 'dark' ? icon.sun : icon.moon}</button>`;
  const otherLang = lang() === 'mr' ? 'en' : 'mr';
  header.innerHTML =
    `<a class="brand" href="#/" aria-label="${esc(t('site.full'))}">${icon.pataka}<span lang="mr">${esc(t('site.name'))}</span></a>` +
    `<nav class="top-nav" aria-label="${esc(t('nav.sections'))}">` +
    ['read', 'samadhi', 'journey', 'wari', 'saints'].map((x) => `<a class="tbtn"${cur(x)} href="#/${x}">${esc(t('x.' + x + '.nav'))}</a>`).join('') +
    `<a class="tbtn quiet"${cur('workshop')} href="#/workshop">${esc(t('x.workshop'))}</a>` +
    `</nav><span class="spacer"></span>` +
    `<a class="tbtn icon"${cur('search')} href="#/search" aria-label="${esc(t('nav.search'))}">${icon.search}</a>` +
    `<button type="button" class="tbtn" data-act="lang" lang="${otherLang}" aria-label="${esc(t('lang.switch.label'))}">${esc(t('lang.switch'))}</button>` +
    `${themeBtn}<button type="button" class="tbtn icon" data-act="menu" aria-label="${esc(t('nav.menu'))}" aria-expanded="false" aria-controls="sheet">${icon.sections}</button>`;
  // thumb bar: the four ways most readers take, and "more"
  bar.innerHTML =
    `<a href="#/"${cur('home')}>${icon.pataka}<span>${esc(t('nav.mauli'))}</span></a>` +
    `<a href="#/read"${cur('read')}>${icon.book}<span>${esc(t('x.read.nav'))}</span></a>` +
    `<a href="#/samadhi"${cur('samadhi')}>${icon.lamp}<span>${esc(t('x.samadhi.nav'))}</span></a>` +
    `<a href="#/journey"${cur('journey')}>${icon.river}<span>${esc(t('x.journey.nav'))}</span></a>` +
    `<button type="button" data-act="menu" aria-expanded="false" aria-controls="sheet">${icon.sections}<span>${esc(t('nav.more'))}</span></button>`;
  const xl = (x) => `<li><a href="#/${x}"${cur(x)}><span class="mark">${icon.pataka}</span><span class="t">${esc(t('x.' + x))}</span><span></span><span class="d">${esc(t('x.' + x + '.d'))}</span></a></li>`;
  sheet.querySelector('.panel').innerHTML =
    `<div class="grip" aria-hidden="true"></div>` +
    `<div class="row"><h2 id="sheet-title" style="margin:0">${esc(t('nav.menu'))}</h2>` +
    `<button type="button" class="tbtn icon" data-act="close" aria-label="${esc(t('nav.close'))}">${icon.close}</button></div>` +
    `<ul class="doors">${EXPERIENCES.map(xl).join('')}</ul>` +
    `<ul class="doors" style="margin-top:var(--sp-4)"><li><a href="#/search"${cur('search')}><span class="mark">${icon.search}</span><span class="t">${esc(t('nav.search'))}</span><span></span><span class="d">${esc(t('home.search'))}</span></a></li>` +
    `<li><a href="#/workshop"${cur('workshop')}><span class="mark">${icon.sections}</span><span class="t">${esc(t('x.workshop'))}</span><span></span><span class="d">${esc(t('x.workshop.d'))}</span></a></li></ul>` +
    `<div class="row" style="margin-top:var(--sp-4)">` +
    `<button type="button" class="btn" data-act="lang" lang="${otherLang}">${esc(t('lang.switch'))}</button>` +
    `<button type="button" class="btn" data-act="theme">${currentTheme() === 'dark' ? icon.sun : icon.moon}${esc(currentTheme() === 'dark' ? t('theme.light') : t('theme.dark'))}</button></div>`;
  document.getElementById('skip').textContent = t('skip');
  document.getElementById('foot').innerHTML =
    `<p>${esc(t('foot.honest'))} <a href="#/workshop">${esc(t('x.workshop.how'))}</a></p><p>${esc(t('foot.ws'))} (<a href="https://mr.wikisource.org/" rel="noopener">mr.wikisource.org</a>), <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">CC BY-SA 4.0</a></p><p><a href="#/workshop/credits">${esc(t('x.credits'))}</a> · <a href="${new URL('data/manifest.json', SITE_ROOT).href}">${esc(t('foot.data'))}</a> · ` +
    `<a href="${new URL('fonts/README.txt', SITE_ROOT).href}">${esc(t('foot.fonts'))}</a></p>`;
}

/** Archive pages carry a slim band: you are in the workshop; the way back to the experience. */
// version 1 preview pages whose idea is now a working experience: the band points to it
const NOW = { 'doors/wari': 'wari', 'doors/proofreading': 'seva', 'connections/shared': 'saints/lines' };
function workshopBand(group, path = []) {
  if (!ARCHIVE.has(group)) return null;
  const d = document.createElement('div');
  d.className = 'wband';
  const to = NOW[group + '/' + (path[0] || '')];
  const back = to ? `<span>${esc(t('wb.now'))} <a href="#/${to}"><b>${esc(t('x.' + to.split('/')[0]))}</b></a></span>`
    : group === 'texts' ? `<a href="#/read">${esc(t('wb.read'))}</a>` : `<a href="#/">${esc(t('wb.home'))}</a>`;
  d.innerHTML = `<span><a href="#/workshop"><b>${esc(t('x.workshop'))}</b></a> ${esc(t('wb.what'))}</span>${back}`;
  return d;
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
    const band = workshopBand(r.group, r.path);
    main.replaceChildren(...(band ? [band, el] : [el]));
    document.title = (mod.title?.(ctx) ? mod.title(ctx) + ' · ' : '') + t('site.full');
    if (ctx.after) ctx.after();
    if (!keepScroll && !sameView && !ctx.manageScroll) window.scrollTo(0, 0);
    if (!sameView) (main.querySelector('h1') || main).focus({ preventScroll: true });
  } catch (e) {
    console.error(e);
    if (id === renderId && !navigator.onLine) { main.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('offline.title'))}</h1><p>${esc(t('offline.body'))}</p><p><a class="btn" href="#/">${esc(t('back.home'))}</a></p></div>`; return; }
    if (id === renderId) main.innerHTML = `<div class="page">${errorBox(e)}<p><button class="btn" type="button" onclick="location.reload()">${esc(t('retry'))}</button></p></div>`;
  }
}
function notFound() {
  document.title = t('notfound.title') + ' · ' + t('site.full');
  main.innerHTML = `<div class="page"><h1 tabindex="-1">${esc(t('notfound.title'))}</h1><p>${esc(t('notfound.body'))}</p><p><a class="btn" href="#/">${esc(t('back.home'))}</a></p></div>`;
}

window.addEventListener('hashchange', () => { closeSheet(); render(); });
onLang(() => render({ keepScroll: true }));
document.documentElement.lang = lang();
initComponents();
render();

// installable: offline for pages already visited (network first, so a published update is always taken when online)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || /[?&]sw=1/.test(location.search))) {
  addEventListener('load', () => navigator.serviceWorker.register(new URL('sw.js', SITE_ROOT)).catch(() => {}));
}
