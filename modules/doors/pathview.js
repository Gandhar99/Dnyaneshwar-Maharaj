// Doors: landing page, the three reader doors and the guided journeys.
import { t, lang, has } from '../../assets/js/i18n.js';
import { esc, num } from '../../assets/js/util.js';
import { icon } from '../../assets/js/components.js';
import { DOORS, JOURNEYS } from './paths.js';
import { loadBundle, refBlock } from './rows.js';

const crumbs = (extra = '') => `<p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a> / <a href="#/doors">${esc(t('g.doors'))}</a>${extra}</p>`;

export async function landing(ctx) {
  const item = (to, name, d, tag = '') => `<li><a href="#/${to}"><span class="mark" aria-hidden="true">${icon.pataka}</span><span class="t">${esc(name)}</span>${tag ? `<span class="tag">${esc(tag)}</span>` : '<span></span>'}<span class="d">${esc(d)}</span></a></li>`;
  const readers = ['students', 'children', 'kirtankars'].map((k) => item('doors/' + k, t('dr.d.' + k), t('dr.d.' + k + '.d')));
  const journeys = Object.keys(JOURNEYS).map((k) => item('doors/journeys/' + k, t('dr.j.' + k), t('dr.j.' + k + '.d')));
  const previews = ['recitation', 'chaal', 'proofreading', 'wari'].map((k) => item('doors/' + k, t('dr.p.' + k), t('dr.p.' + k + '.d'), t('dr.tag_preview')));
  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/doors/style.css"><div class="page m-doors">
    <p class="crumbs"><a href="#/">${esc(t('nav.home'))}</a></p>
    <h1 tabindex="-1">${esc(t('g.doors'))}</h1>
    <p class="muted">${esc(t('dr.intro'))}</p>
    <h2>${esc(t('dr.h.readers'))}</h2><ul class="doors">${readers.join('')}</ul>
    <h2>${esc(t('dr.h.journeys'))}</h2><ul class="doors">${journeys.join('')}</ul>
    <h2>${esc(t('dr.h.previews'))}</h2><p class="small muted">${esc(t('dr.previews_note'))}</p>
    <ul class="doors">${previews.join('')}</ul>
    <h2>${esc(t('dr.h.piece'))}</h2>
    <ul class="doors">${item('doors/ringan-piece', t('dr.p.ringan'), t('dr.p.ringan.d'), t('dr.tag_piece'))}</ul>
  </div>`;
}

function stepHtml(D, step, i, scope) {
  const blocks = (step.refs || []).map((r) => refBlock(D, r));
  const vars = step.vars ? step.vars(D) : {};
  const nKey = `dr.${scope}.${step.id}.n`, sKey = `dr.${scope}.${step.id}.s`;
  const hasName = !step.headFromRef;
  const head = hasName ? esc(t(nKey)) : (blocks[0]?.head || esc(step.id));
  const sentence = hasText(sKey) ? `<p class="say">${esc(t(sKey, vars))}</p>` : '';
  return `<li class="step">
    <h2 class="sh"><span class="no" aria-hidden="true">${esc(num(String(i + 1)))}</span><span class="vh">${esc(t('dr.step', { n: num(String(i + 1)) }))}: </span><span class="st">${head}</span></h2>
    ${sentence}
    ${blocks.map((b) => b.body).join('')}
    <p><a class="btn" href="#/${esc(step.to)}">${esc(t('dr.open'))}</a></p>
  </li>`;
}
const hasText = (k) => has(k);

const poemIdsOf = (steps) => steps.flatMap((s) => (s.refs || []).filter((r) => r[0] === 'poem').map((r) => r[1]));
const typesOf = (steps) => [...new Set(steps.flatMap((s) => (s.refs || []).map((r) => (r[0] === 'eventfull' ? 'event' : r[0]))))];

function shell(ctx, { title, lead, steps, D, scope, cls = '', tradition = false }) {
  const enNote = lang() === 'mr' ? `<p class="enonly" lang="mr">${esc(t('en.only'))}</p>` : '';
  ctx.el.innerHTML = `<link rel="stylesheet" href="modules/doors/style.css"><div class="page m-doors ${cls}">
    ${crumbs()}
    <h1 tabindex="-1">${esc(title)}</h1>
    <p class="muted lead">${esc(lead)}</p>
    <p class="small faint">${esc(t('dr.pathnote'))}</p>
    ${enNote}
    <ol class="steps">${steps.map((s, i) => stepHtml(D, s, i, scope)).join('')}</ol>
    <p><a href="#/doors">${esc(t('dr.allpaths'))}</a></p>
  </div>`;
}

export async function door(ctx, key) {
  const steps = DOORS[key];
  const D = await loadBundle(typesOf(steps), poemIdsOf(steps));
  shell(ctx, { title: t('dr.d.' + key), lead: t('dr.' + key + '.lead'), steps, D, scope: 'st.' + key, cls: key === 'children' ? 'kids' : '' });
}

export async function journey(ctx, id) {
  const j = JOURNEYS[id];
  if (!j) {
    ctx.el.innerHTML = `<link rel="stylesheet" href="modules/doors/style.css"><div class="page m-doors">${crumbs()}<h1 tabindex="-1">${esc(t('dr.notfound'))}</h1><p><a href="#/doors">${esc(t('dr.allpaths'))}</a></p></div>`;
    return;
  }
  const D = await loadBundle(j.types, j.poems || []);
  const steps = j.build(D);
  shell(ctx, { title: t('dr.j.' + id), lead: t('dr.jn.' + id + '.lead'), steps, D, scope: 'jn.' + id });
}
