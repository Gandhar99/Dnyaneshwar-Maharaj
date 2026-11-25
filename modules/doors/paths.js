// Doors: curated paths. A path is a sequence of steps; each step points at an existing route of another group
// and at the data rows that support its one connecting sentence. No facts live here: sentences are in labels.js
// (keys dr.st.<door>.<step>.n / .s) and every sentence is tied to the rows listed in `refs`.
import { num } from '../../assets/js/util.js';
import { formatDate } from '../../assets/js/util.js';

/** Owner: set to a relative image path (e.g. 'modules/doors/ringan.jpg') to fill the ringan image slot. */
export const RINGAN_IMAGE = '';

// the evidence group's route for one dispute question (same rule as modules/evidence/common.js slugOf)
const slugOf = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const S = (id, to, o = {}) => ({ id, to, ...o });
const fd = (iso) => formatDate(iso, undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export const DOORS = {
  students: [
    S('poem', 'texts/gatha/DNYC-COMP0908', { refs: [['poem', 'DNYC-COMP0908']] }),
    S('word', 'words/glossary/DNYC-GL046', { refs: [['gloss', 'DNYC-GL046']] }),
    S('dw', 'texts/dnyaneshwari', { refs: [['counts']], vars: (D) => ({ ch: num(D.home.counts.dnyaneshwari_chapters), n: num(D.home.counts.dnyaneshwari_ovi) }) }),
    S('disp', 'evidence/disputes', { refs: [['counts']], vars: (D) => ({ n: num(D.home.counts.disputes) }) }),
    S('src', 'evidence/sources', { refs: [['counts']], vars: (D) => ({ n: num(D.home.counts.sources) }) }),
    S('check', 'words/check'),
    S('std', 'evidence/standard'),
    S('dl', 'evidence/downloads'),
  ],
  children: [
    S('who', 'life', { refs: [['profile', 'DNYL-P007'], ['profile', 'DNYL-P023']] }),
    S('sibs', 'connections', { refs: [['profile', 'DNYL-P034']] }),
    S('poem', 'texts/gatha/DNYC-COMP0617', { refs: [['poem', 'DNYC-COMP0617']] }),
    S('buffalo', 'life/events/DNYL-V005', { refs: [['event', 'DNYL-V005']] }),
    S('wall', 'life/events/DNYL-V011', { refs: [['event', 'DNYL-V011']] }),
    S('haripath', 'texts/haripath', { refs: [['lit', 'DNYP-LU-01']] }),
    S('pasaydan', 'texts/dnyaneshwari/18?seg=DNY18_1873', { refs: [['event', 'DNYL-V009']] }),
    S('palkhi', 'calendar/palkhi', {
      refs: [['stage', 'DNYP-PS-01'], ['stage', 'DNYP-PS-17']],
      vars: (D) => ({ a: fd(D.stage.get('DNYP-PS-01')?.date), b: fd(D.stage.get('DNYP-PS-17')?.date) }),
    }),
    S('word', 'words/glossary/DNYC-GL060', { refs: [['gloss', 'DNYC-GL060']] }),
  ],
  kirtankars: [
    S('haripath', 'texts/haripath', { refs: [['lit', 'DNYP-LU-01'], ['lit', 'DNYP-LU-02']] }),
    S('pasaydan', 'texts/dnyaneshwari/18?seg=DNY18_1873', { refs: [['event', 'DNYL-V009'], ['lit', 'DNYP-LU-03']] }),
    S('themes', 'discover/themes', { refs: [['topics']], vars: (D) => ({ n: num(D.topics.length) }) }),
    S('words', 'words', { refs: [['counts']], vars: (D) => ({ n: num(D.home.counts.glossary) }) }),
    S('mudra', 'texts/gatha', { refs: [['profile', 'DNYL-P025'], ['profile', 'DNYL-P024']] }),
    S('stories', 'life', { refs: [['event', 'DNYL-V013'], ['event', 'DNYL-V015'], ['event', 'DNYL-V016']] }),
    S('festival', 'calendar/sohala', { refs: [['lit', 'DNYP-LU-04']] }),
    S('others', 'connections/namdev', { refs: [['counts']], vars: (D) => ({ n: num(D.home.counts.narrated_by_others) }) }),
    S('chaal', 'doors/chaal'),
    S('recitation', 'doors/recitation'),
  ],
};

/** Guided journeys. `build(D)` returns the steps once the data is loaded. `types` lists the row kinds it reads. */
export const JOURNEYS = {
  life: {
    types: ['event'],
    build: (D) => [...D.event.keys()].map((id) => S(id, 'life/events/' + id, { refs: [['eventfull', id]], headFromRef: true })),
  },
  'sohala-2026': {
    types: ['obs', 'event', 'spot'],
    build: (D) => [
      ...[...D.obs.values()].filter((o) => o.gregorian_date_2026).sort((a, b) => a.gregorian_date_2026.localeCompare(b.gregorian_date_2026))
        .map((o) => S(o.observance_id, 'calendar/sohala', { refs: [['obs', o.observance_id]], headFromRef: true })),
      S('tithi', 'calendar/sky', { refs: [['obs', 'DNYP-OB-02']] }),
      S('samadhi', 'life/events/DNYL-V015', { refs: [['event', 'DNYL-V015']] }),
      S('spot', 'life/memorials', { refs: [['spot', 'DNYP-MS-01'], ['spot', 'DNYP-MS-03']] }),
    ],
  },
  'wari-2026': {
    types: ['stage'],
    build: () => ['DNYP-PS-01', 'DNYP-PS-02', 'DNYP-PS-08', 'DNYP-PS-09', 'DNYP-PS-13', 'DNYP-PS-16', 'DNYP-PS-17', 'DNYP-PS-18', 'DNYP-PS-R6', 'DNYP-PS-R12']
      .map((id) => S(id, 'calendar/palkhi/' + id, { refs: [['stage', id]], headFromRef: true })),
  },
  'his-words': {
    types: ['event', 'lit'], poems: ['DNYC-COMP0617'],
    build: () => [
      S('poem', 'texts/gatha/DNYC-COMP0617', { refs: [['poem', 'DNYC-COMP0617']] }),
      S('haripath', 'texts/haripath', { refs: [['lit', 'DNYP-LU-01']] }),
      S('cp', 'texts/changdev-pasashti', { refs: [['event', 'DNYL-V011']] }),
      S('amr', 'texts/amritanubhav', { refs: [['event', 'DNYL-V010']] }),
      S('dw', 'texts/dnyaneshwari', { refs: [['event', 'DNYL-V008']] }),
      S('pasaydan', 'texts/dnyaneshwari/18?seg=DNY18_1873', { refs: [['event', 'DNYL-V009']] }),
    ],
  },
  disputes: {
    types: ['dispute'],
    build: (D) => [...new Set(D.disputes.map((d) => d.question))]
      .map((q, i) => S('q' + (i + 1), 'evidence/disputes/' + slugOf(q), { refs: [['dispute', q]], headFromRef: true })),
  },
};
