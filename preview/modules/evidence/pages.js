// #/evidence/standard, #/evidence/how-made, #/evidence/downloads
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, formatDate } from '../../assets/js/util.js';
import { getJSON } from '../../assets/js/data.js';
import { SITE_ROOT } from '../../assets/js/util.js';
import { claimBadge, confirmation, quality, provisional } from '../../assets/js/components.js';
import { CSS, crumbs } from './common.js';
import { HOWMADE } from './labels.js';

export async function render(ctx, which) {
  if (which === 'standard') return standard(ctx);
  if (which === 'how-made') return howMade(ctx);
  return downloads(ctx);
}

async function standard(ctx) {
  const ev = await getJSON('evidence/evidence.json');
  const CS = ['broadly supported', 'editorial testimony', 'reconstruction', 'disagreement', 'devotional tradition', 'unproven hypothesis'];
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.st.title'))}</h1><p class="muted">${esc(t('ev.st.lead'))}</p>
    <h2 class="h3">${esc(t('ev.st.claim'))}</h2>
    <div class="defs">${CS.map((c) => `<div><div>${claimBadge(c)}</div><p>${esc(t('cs.title.' + c))}</p></div>`).join('')}</div>
    <h2 class="h3">${esc(t('ev.st.prov'))}</h2>
    <div class="defs"><div><div>${provisional()}</div><p>${esc(t('ev.st.prov.b'))}</p></div></div>
    <h2 class="h3">${esc(t('ev.st.conf'))}</h2>
    <div class="defs">${['single source', 'two sources', 'confirmed'].map((c) => `<div><div>${confirmation(c)}</div><p></p></div>`).join('')}</div>
    <p class="small">${esc(t('ev.st.conf.b'))}</p>
    <h2 class="h3">${esc(t('ev.st.tier'))}</h2>
    ${lang() === 'mr' ? `<div class="enonly" lang="mr">${esc(t('en.only'))}</div>` : ''}
    <div class="defs">${ev.quality.map((x) => `<div><div><span class="tier">${esc(x.tier)}</span> <span lang="en">${esc(x.label)}</span></div><p lang="en">${esc(x.meaning)}</p></div>`).join('')}</div>
    <p class="small">${esc(t('ev.st.depth'))}</p>
    <h2 class="h3">${esc(t('ev.st.text'))}</h2>
    <div class="defs">${['A', 'B', 'C'].map((q) => `<div><div>${quality(q)}</div><p></p></div>`).join('')}</div>
    <h2 class="h3">${esc(t('ev.st.rights'))}</h2><p>${esc(t('ev.st.rights.b'))}</p></div>`;
}

async function howMade(ctx) {
  const [home, m] = await Promise.all([getJSON('home.json'), getJSON('manifest.json')]);
  const c = home.counts, b = c.gatha_basis || {}, tk = c.gatha_tokens || {}, q = c.gatha_quality || {}, gb = c.glossary_basis || {};
  const pick = (re) => Object.entries(b).filter(([k]) => re.test(k)).reduce((s, [, v]) => s + v, 0);
  const n = (x) => num(x ?? '–');
  const V = { total: n(c.gatha_compositions), withtext: n(c.gatha_with_text), b3: n(pick(/^three/)), b2: n(pick(/^two/)), b1: n(pick(/^single/)),
    tok: n(tk.token_count), unr: n(tk.unresolved_count), unc: n(tk.uncovered_count),
    pct: n(tk.token_count ? Math.round(100 * ((tk.unresolved_count || 0) + (tk.uncovered_count || 0)) / tk.token_count) : '–'),
    qa: n(q.A), qb: n(q.B), qc: n(q.C), gdict: n((c.glossary || 0) - (gb.reconstruction || 0)), gctx: n(gb.reconstruction) };
  const fill = (p) => p.replace(/\{(\w+)\}/g, (_, k) => V[k] ?? '');
  const secs = HOWMADE[lang()] || HOWMADE.en;
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.hm.title'))}</h1><p class="muted">${esc(t('ev.hm.lead'))}</p>
    <div class="badges">${provisional()}</div>
    <p class="small faint">${esc(t('ev.hm.asof', { d: formatDate((m.export_date || '').slice(0, 10)) }))}</p>
    <div class="prose">${secs.map(([h, ps]) => `<h2 class="h3">${esc(h)}</h2>${ps.map((p) => `<p>${esc(fill(p))}</p>`).join('')}`).join('')}</div>
    <p><a href="#/evidence/sources">${esc(t('ev.d.sources'))}</a> · <a href="#/evidence/editions">${esc(t('ev.d.editions'))}</a> · <a href="#/evidence/downloads">${esc(t('ev.d.downloads'))}</a></p></div>`;
}

const kb = (b) => (b >= 1e6 ? num((b / 1e6).toFixed(1)) + ' MB' : num(Math.max(1, Math.round(b / 1e3))) + ' KB');
async function downloads(ctx) {
  const m = await getJSON('manifest.json');
  const url = (p) => new URL('data/' + p, SITE_ROOT).href;
  const groups = new Map();
  for (const [p, v] of Object.entries(m.files)) { const d = p.includes('/') ? p.split('/')[0] : ''; if (!groups.has(d)) groups.set(d, []); groups.get(d).push([p, v]); }
  const order = ['', ...[...groups.keys()].filter(Boolean).sort()];
  ctx.el.innerHTML = `${CSS}<div class="page m-evidence dl">${crumbs()}
    <h1 tabindex="-1">${esc(t('ev.dl.title'))}</h1><p class="muted">${esc(t('ev.dl.lead'))}</p>
    <div class="badges">${provisional()}</div>
    <p class="stat"><span>${esc(t('ev.dl.exported'))}: ${esc(num((m.export_date || '').slice(0, 10)))}</span><span>${esc(t('ev.dl.total'))}: ${esc(kb(m.total_bytes || 0))}</span><span>${esc(t('ev.dl.files', { n: num(Object.keys(m.files).length) }))}</span></p>
    <p class="note">${esc(t('ev.dl.licence'))}</p>
    <p class="note">${esc(t('ev.st.rights.b'))}</p>
    <p><a href="${esc(url('manifest.json'))}" download>manifest.json</a> <span class="faint small">· ${esc(t('ev.dl.manifest'))}</span></p>
    ${order.filter((d) => groups.has(d)).map((d) => {
      const list = groups.get(d);
      return `<details${d === '' ? ' open' : ''}><summary>${esc(d || t('ev.dl.root'))} · ${esc(t('ev.dl.files', { n: num(list.length) }))}</summary>
      <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('ev.dl.file'))}</th><th class="nw">${esc(t('ev.dl.rows', { n: '' }).trim())}</th><th class="nw">${esc(t('ev.dl.size'))}</th></tr></thead><tbody>
      ${list.map(([p, v]) => `<tr><td><a href="${esc(url(p))}" download>${esc(p)}</a></td><td class="nw">${v.rows != null ? esc(num(v.rows)) : ''}</td><td class="nw">${esc(kb(v.bytes || 0))}</td></tr>`).join('')}
      </tbody></table></div></details>`;
    }).join('')}</div>`;
}
