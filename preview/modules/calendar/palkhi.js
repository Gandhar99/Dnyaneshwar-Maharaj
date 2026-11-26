// The 2026 palkhi: all halts (#/calendar/palkhi) and one halt (#/calendar/palkhi/<stage_id>). Every fact shows its confirmation.
import { t, lang } from '../../assets/js/i18n.js';
import { esc, num, href } from '../../assets/js/util.js';
import { honesty, confirmation, claimBadge, sourceChips, loading } from '../../assets/js/components.js';
import { loadCal, loadPlaces, crumbs, calCrumb, enNote, cssLink, en, kv, placeMap, stageName, dayShort, dayLong, dayDate, rowId, ids, confKey } from './common.js';

const dots = (c) => { const n = c === 'confirmed' ? 3 : c === 'two sources' ? 2 : 1; return [1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join(''); };
const dayLabel = (s) => (s.day_number ? t('cal.pk.day', { n: num(s.day_number) }) : t('cal.pk.rday', { n: num(Number(/R(\d+)$/.exec(s.stage_id)?.[1] || 0)) }));
const shortDay = (s) => (s.day_number ? num(s.day_number) : 'R' + num(Number(/R(\d+)$/.exec(s.stage_id)?.[1] || 0)));

export async function render(ctx) {
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}${loading()}</div>`;
  const [C, P] = await Promise.all([loadCal(), loadPlaces()]);
  const pm = placeMap(P.places);
  const all = C.palkhi_stages.filter((s) => s.year === '2026');
  const main = all.filter((s) => !s.variant_of).sort((a, b) => a.date.localeCompare(b.date) || (a.day_number || 99) - (b.day_number || 99));
  return ctx.path[1] ? stagePage(ctx, all, main, pm, ctx.path[1]) : listPage(ctx, all, main, pm);
}

const route = (s, pm) => `${stageName(pm, s.from_place_id, s.from_place_name)} → ${stageName(pm, s.to_place_id, s.to_place_name)}`;

function listPage(ctx, all, main, pm) {
  const out = main.filter((s) => s.day_number), back = main.filter((s) => !s.day_number);
  const variants = (id) => all.filter((v) => v.variant_of === id);
  const strip = (rows) => rows.map((s) => `<li><a class="conf-${confKey(s.confirmation)}" href="${href('calendar/palkhi/' + s.stage_id)}" title="${esc(s.stage_id)} · ${esc(s.confirmation)}">
    <span class="n">${esc(shortDay(s))}</span><span class="d" aria-hidden="true">${dots(s.confirmation)}</span><span class="vh">${esc(dayLabel(s))}: ${esc(t('conf.' + s.confirmation))}</span></a></li>`).join('');
  const rowHtml = (s) => `<li class="stage conf-${confKey(s.confirmation)}" id="${esc(s.stage_id)}" title="${esc(s.stage_id)}">
    <a class="hd" href="${href('calendar/palkhi/' + s.stage_id)}"><span class="dn">${esc(dayLabel(s))}</span>
      <span><span class="dt">${esc(dayShort(s.date))}</span><span class="rt">${route(s, pm)}</span></span></a>
    <div class="badges">${confirmation(s.confirmation, s.confirmed_by)}${claimBadge(s.claim_status)}
      ${s.ringan_kind ? `<span class="chip plain">${esc(t('cal.pk.ringan'))}: ${esc(ringanText(s))}</span>` : ''}${s.nira_snan ? `<span class="chip plain">${esc(t('cal.pk.nira'))}</span>` : ''}${sourceChips(s.source_id)}</div>
    ${variants(s.stage_id).map((v) => `<div class="variant" title="${esc(v.stage_id)}"><span class="vl">${esc(t('cal.pk.variant'))}</span>
      <a href="${href('calendar/palkhi/' + v.stage_id)}">${esc(dayShort(v.date))}: ${route(v, pm)}</a>
      <div class="badges" style="margin:.3rem 0 0">${claimBadge(v.claim_status)}${confirmation(v.confirmation, v.confirmed_by)}${sourceChips(v.source_id)}</div></div>`).join('')}</li>`;
  const outC = out.filter((s) => s.confirmation === 'confirmed').length;
  const backSingle = back.filter((s) => s.confirmation === 'single source').length;
  const weakText = (back.find((s) => /Return leg:/.test(s.revision_note || '')) || {}).revision_note?.match(/Return leg:[^.]*\./)?.[0] || '';
  const lastOut = out.at(-1), firstBack = back[0];
  const gap = lastOut && firstBack && (Date.parse(firstBack.date) - Date.parse(lastOut.date)) / 86400000 > 1
    ? t('cal.pk.gap', { a: dayShort(new Date(Date.parse(lastOut.date) + 86400000).toISOString().slice(0, 10)), b: dayShort(new Date(Date.parse(firstBack.date) - 86400000).toISOString().slice(0, 10)) }) : '';
  ctx.el.innerHTML = `<div class="page wide m-calendar">${cssLink()}
    ${crumbs(calCrumb())}
    <h1 tabindex="-1">${esc(t('cal.pk.title'))}</h1>
    <p class="muted">${esc(t('cal.pk.lead'))}</p>${enNote()}
    <p>${honesty({ provisional: true })}</p>
    <ul class="legend3"><li>${confirmation('confirmed', '')}</li><li>${confirmation('two sources', '')}</li><li>${confirmation('single source', '')}</li></ul>
    <p class="note">${esc(t('cal.cf.cv10'))}</p>
    <h2>${esc(t('cal.pk.glance'))}</h2><p class="small muted">${esc(t('cal.pk.glance.d'))}</p>
    <ul class="strip" aria-label="${esc(t('cal.pk.out'))}">${strip(out)}</ul>
    <ul class="strip" aria-label="${esc(t('cal.pk.back'))}">${strip(back)}</ul>
    <h2>${esc(t('cal.pk.weak'))}</h2>
    <p>${esc(t('cal.pk.weak.n', { k: num(back.length), s: num(backSingle), c: num(outC) }))}</p>${weakText ? `<p class="small muted" lang="en">${esc(weakText)}</p>` : ''}
    <h2>${esc(t('cal.pk.out'))} <small class="faint">${esc(t('cal.pk.sum.out', { n: num(out.length) }))}</small></h2>
    <ul class="stages">${out.map(rowHtml).join('')}</ul>
    ${gap ? `<p class="note">${esc(gap)}</p>` : ''}
    <h2>${esc(t('cal.pk.back'))} <small class="faint">${esc(t('cal.pk.sum.back', { n: num(back.length) }))}</small></h2>
    <ul class="stages">${back.map(rowHtml).join('')}</ul>
  </div>`;
}
const ringanText = (s) => `${s.ringan_kind === 'ubha+gol' ? `${t('cal.pk.ringan.ubha')} + ${t('cal.pk.ringan.gol')}` : t('cal.pk.ringan.' + s.ringan_kind)}`;

function stagePage(ctx, all, main, pm, id) {
  const s = all.find((x) => x.stage_id === id);
  if (!s) { ctx.el.innerHTML = `<div class="page m-calendar">${cssLink()}${crumbs(calCrumb())}<h1 tabindex="-1">${esc(t('cal.pk.notfound'))}</h1><p><a href="#/calendar/palkhi">${esc(t('cal.pk.all'))}</a></p></div>`; return; }
  const base = s.variant_of ? all.find((x) => x.stage_id === s.variant_of) : null;
  const vars = all.filter((v) => v.variant_of === s.stage_id);
  const i = main.findIndex((x) => x.stage_id === (base || s).stage_id);
  const prev = main[i - 1], next = main[i + 1];
  const fact = (label, value, conf, srcs) => value ? `<tr><td>${esc(label)}</td><td>${value}</td><td>${conf ? confirmation(conf, ids(srcs)) : `<span class="faint small">${esc(t('cal.pk.nofact'))}</span>`}</td><td>${conf ? sourceChips(ids(srcs).join('; ')) : ''}</td></tr>` : '';
  let dep = '';
  if (s.departure_time) {
    let d = s.departure_time; try { d = typeof d === 'string' ? JSON.parse(d) : d; } catch { d = null; }
    if (d && typeof d === 'object') dep = `<div class="twocol">${Object.entries(d).map(([k, v]) => `<div class="card"><p class="bigdate" lang="en" style="font-size:var(--s-1)">${esc(k)}</p><p class="small faint">${esc(t('cal.pk.src'))} (${num(ids(v).length)})</p>${sourceChips(ids(v).join('; '))}</div>`).join('')}</div><p class="small muted">${esc(t('cal.pk.dep.d'))}</p>`;
    else dep = en(String(s.departure_time));
  }
  const facts = [
    fact(t('cal.pk.halt'), en(s.halt_type), s.halt_type_confirmation, s.halt_type_source_ids),
    fact(t('cal.pk.ringan'), s.ringan_kind ? `${esc(ringanText(s))}: <span lang="en">${esc(s.ringan_site || '')}</span>` : '', s.ringan_confirmation, s.ringan_source_ids),
    fact(t('cal.pk.nira'), en(s.nira_snan), s.nira_snan_confirmation, s.nira_snan_source_ids),
    fact(t('cal.pk.dist'), s.distance_km != null ? esc(num(String(s.distance_km))) : '', s.distance_confirmation, s.distance_source_ids),
    fact(t('cal.pk.dindi'), en(s.dindi_count), s.dindi_count_confirmation, s.dindi_count_source_ids),
    fact(t('cal.pk.sop'), s.sopandev_meeting_confirmation ? '✓' : '', s.sopandev_meeting_confirmation, s.sopandev_meeting_source_ids),
  ].join('');
  ctx.el.innerHTML = `<article class="page wide m-calendar">${cssLink()}
    ${crumbs(calCrumb(), `<a href="#/calendar/palkhi">${esc(t('cal.pk.title'))}</a>`)}
    <p class="small faint">${esc(dayLabel(s))}</p>
    <h1 tabindex="-1">${route(s, pm)}</h1>
    <p class="bigdate">${esc(dayLong(s.date))}</p>${enNote()}
    ${base ? `<p class="note doubt">${esc(t('cal.pk.variant'))}. ${esc(t('cal.pk.variant.d'))} <a href="${href('calendar/palkhi/' + base.stage_id)}">${esc(dayShort(base.date))}: ${route(base, pm)}</a></p>` : ''}
    <div class="badges">${claimBadge(s.claim_status)}${confirmation(s.confirmation, s.confirmed_by)}${s.provisional ? honesty({ provisional: true }).replace(/<\/?div[^>]*>/g, '') : ''}</div>
    <p class="small"><span class="faint">${esc(t('cal.cf.by'))} (${num(ids(s.confirmed_by).length)}):</span> ${sourceChips(ids(s.confirmed_by).join('; '))}</p>
    <p class="small faint">${esc(t('cal.pk.agree', { n: num(s.agreeing_source_count ?? 0), m: num(s.agreeing_non_aggregator_count ?? 0) }))}</p>
    ${kv([[t('cal.pk.listed'), en(s.place_listed_for_date)], [t('cal.pk.taluka'), en(s.taluka)], [t('cal.pk.district'), en(s.district)], [t('cal.pk.org'), en(s.organising_body)], [t('cal.pk.tithi'), en(s.tithi)]])}
    ${s.rituals ? `<h2>${esc(t('cal.pk.rit'))}</h2><p lang="en">${esc(s.rituals)}</p>` : ''}
    ${dep ? `<h2>${esc(t('cal.pk.dep'))}</h2>${dep}` : ''}
    ${facts ? `<h2>${esc(t('cal.pk.facts'))}</h2><div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(t('cal.pk.fact'))}</th><th></th><th>${esc(t('cal.pk.confirmation'))}</th><th>${esc(t('cal.pk.src'))}</th></tr></thead><tbody>${facts}</tbody></table></div>` : ''}
    ${s.distance_note ? `<p class="small muted" lang="en">${esc(s.distance_note)}</p>` : ''}
    ${s.uncertainty ? `<h2>${esc(t('cal.pk.unc'))}</h2><p lang="en">${esc(s.uncertainty)}</p>` : ''}
    ${s.tukaram_palkhi_note ? `<h3>${esc(t('cal.pk.tuka'))}</h3><p class="small" lang="en">${esc(s.tukaram_palkhi_note)}</p>${sourceChips(ids(s.tukaram_palkhi_note_source_ids).join('; '))}` : ''}
    ${s.dissenting_source_ids ? `<h3>${esc(t('cal.pk.diss'))}</h3><p>${sourceChips(ids(s.dissenting_source_ids).join('; '))}</p>` : ''}
    ${vars.length ? `<h2>${esc(t('cal.pk.variant'))}</h2>${vars.map((v) => `<div class="variant" style="margin-left:0"><a href="${href('calendar/palkhi/' + v.stage_id)}">${esc(dayShort(v.date))}: ${route(v, pm)}</a><div class="badges">${claimBadge(v.claim_status)}${confirmation(v.confirmation, v.confirmed_by)}${sourceChips(v.source_id)}</div><p class="small muted" lang="en">${esc(v.uncertainty || '')}</p></div>`).join('')}` : ''}
    ${s.revision_note ? `<p class="small faint" lang="en">${esc(t('cal.pk.rev'))}: ${esc(s.revision_note)}</p>` : ''}
    <p class="small">${[s.from_place_id, s.to_place_id].filter(Boolean).map((p) => pm.get(p) ? `<a href="#/life/places/${esc(p)}">${esc(t('cal.pk.place'))}: ${stageName(pm, p)}</a>` : '').filter(Boolean).join(' · ')}</p>${rowId(s.stage_id)}
    <nav class="pager" aria-label="${esc(t('next'))}">
      ${prev ? `<a href="${href('calendar/palkhi/' + prev.stage_id)}" rel="prev"><span class="small faint">${esc(t('prev'))}</span><br>${esc(dayShort(prev.date))}</a>` : '<span></span>'}
      ${next ? `<a href="${href('calendar/palkhi/' + next.stage_id)}" rel="next" style="text-align:right"><span class="small faint">${esc(t('next'))}</span><br>${esc(dayShort(next.date))}</a>` : ''}
    </nav></article>`;
}
