/**
 * The admin SEO tab's Search Console snapshot (Nov 15 2026): data/seo/snapshot.json, written by the daily Search Console
 * browser run (docs/seo-snapshot.md), never by a Google API. Plain JavaScript so the same checks run in the app
 * (lib/seo/snapshot.ts), in scripts/seo-snapshot.mjs (before the daily run pushes) and in tests/admin-seo.cjs.
 *
 * validateSnapshot(x) → {errors, warnings}: errors make the tab show its empty state and the CLI exit 1; warnings are shown
 * small and do not block. summarize(snapshot) → the 2-3 plain-English "What's happening" lines.
 */

export const SCHEMA_VERSION = 1;
export const MAX_WORKLOG = 30;
export const QUICK_WIN = { from: 5, to: 20 };

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isDay = v => typeof v === 'string' && DAY.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z'));
const isCount = v => Number.isInteger(v) && v >= 0;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isPos = v => isNum(v) && v >= 1;
const isRatio = v => isNum(v) && v >= 0 && v <= 1;
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const isPath = v => typeof v === 'string' && v.startsWith('/');

export const isQuickWin = position => isNum(position) && position >= QUICK_WIN.from && position <= QUICK_WIN.to;

function checkWindow(w, at, errors) {
  if (!isObj(w)) { errors.push(`${at}: an object or null`); return; }
  if (!isCount(w.clicks)) errors.push(`${at}.clicks: a whole number ≥ 0`);
  if (!isCount(w.impressions)) errors.push(`${at}.impressions: a whole number ≥ 0`);
  if (!isRatio(w.ctr)) errors.push(`${at}.ctr: a fraction 0-1 (4.7% is 0.047)`);
  if (!(w.position === null || isPos(w.position))) errors.push(`${at}.position: a number ≥ 1 or null`);
  if (isCount(w.clicks) && isCount(w.impressions) && w.clicks > w.impressions) errors.push(`${at}: more clicks than impressions`);
}

/** @returns {{errors:string[],warnings:string[]}} */
export function validateSnapshot(s) {
  const errors = [], warnings = [];
  if (!isObj(s)) return { errors: ['the file is not a JSON object'], warnings };
  if (s.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion: ${SCHEMA_VERSION}`);
  if (!isDay(s.asOf)) errors.push('asOf: YYYY-MM-DD');
  if (!isDay(s.gscDataThrough)) errors.push('gscDataThrough: YYYY-MM-DD');
  else if (isDay(s.asOf) && s.gscDataThrough > s.asOf) errors.push('gscDataThrough is after asOf');

  if (!isObj(s.windows)) errors.push('windows: {d7, d28}');
  else for (const k of ['d7', 'd28']) {
    const w = s.windows[k];
    if (w === null) continue;
    if (w === undefined) { errors.push(`windows.${k}: an object or null`); continue; }
    checkWindow(w, `windows.${k}`, errors);
    if (isObj(w) && w.prev !== undefined && w.prev !== null) checkWindow(w.prev, `windows.${k}.prev`, errors);
  }
  if (isObj(s.windows) && !s.windows.d7 && !s.windows.d28) warnings.push('windows: neither d7 nor d28 is filled in');

  const list = (key, each) => {
    const a = s[key];
    if (!Array.isArray(a)) { errors.push(`${key}: an array`); return; }
    a.forEach((r, i) => { if (!isObj(r)) errors.push(`${key}[${i}]: an object`); else each(r, `${key}[${i}]`); });
  };
  list('daily', (r, at) => {
    if (!isDay(r.day)) errors.push(`${at}.day: YYYY-MM-DD`);
    if (!isCount(r.clicks)) errors.push(`${at}.clicks: a whole number ≥ 0`);
    if (!isCount(r.impressions)) errors.push(`${at}.impressions: a whole number ≥ 0`);
  });
  const row = (nameKey, nameOk, nameMsg) => (r, at) => {
    if (!nameOk(r[nameKey])) errors.push(`${at}.${nameKey}: ${nameMsg}`);
    if (!(r.clicks === null || isCount(r.clicks))) errors.push(`${at}.clicks: a whole number or null (not shown)`);
    if (!isCount(r.impressions)) errors.push(`${at}.impressions: a whole number ≥ 0`);
    if (!isPos(r.position)) errors.push(`${at}.position: a number ≥ 1`);
  };
  list('topQueries', row('query', v => typeof v === 'string' && v.trim().length > 0, 'the search words'));
  list('topPages', row('path', isPath, 'a path starting with /'));

  const ix = s.index;
  if (!isObj(ix)) errors.push('index: {asOf, indexed, notIndexed, reasons}');
  else {
    if (!isDay(ix.asOf)) errors.push('index.asOf: YYYY-MM-DD (the date Google shows on the Pages report)');
    if (!isCount(ix.indexed)) errors.push('index.indexed: a whole number ≥ 0');
    if (!isCount(ix.notIndexed)) errors.push('index.notIndexed: a whole number ≥ 0');
    if (ix.previous !== undefined && ix.previous !== null) {
      if (!isObj(ix.previous) || !isDay(ix.previous.asOf) || !isCount(ix.previous.indexed) || !isCount(ix.previous.notIndexed))
        errors.push('index.previous: {asOf, indexed, notIndexed} or null');
    }
    if (!Array.isArray(ix.reasons)) errors.push('index.reasons: an array');
    else {
      ix.reasons.forEach((r, i) => {
        const at = `index.reasons[${i}]`;
        if (!isObj(r)) { errors.push(`${at}: an object`); return; }
        if (typeof r.reason !== 'string' || !r.reason) errors.push(`${at}.reason: Google's wording`);
        if (!isCount(r.pages)) errors.push(`${at}.pages: a whole number ≥ 0`);
        if (!(r.validation === null || typeof r.validation === 'string')) errors.push(`${at}.validation: text or null`);
        if (r.examples !== undefined && !(Array.isArray(r.examples) && r.examples.every(isPath))) errors.push(`${at}.examples: paths starting with /`);
      });
      const sum = ix.reasons.reduce((a, r) => a + (isObj(r) && isCount(r.pages) ? r.pages : 0), 0);
      if (isCount(ix.notIndexed) && sum !== ix.notIndexed) warnings.push(`index: the reasons add up to ${sum}, notIndexed says ${ix.notIndexed}`);
    }
  }

  list('sitemaps', (r, at) => {
    if (!isPath(r.path)) errors.push(`${at}.path: a path starting with /`);
    if (!(r.lastRead === null || isDay(r.lastRead))) errors.push(`${at}.lastRead: YYYY-MM-DD or null`);
    if (typeof r.status !== 'string' || !r.status) errors.push(`${at}.status: Google's status text`);
    if (!isCount(r.discovered)) errors.push(`${at}.discovered: a whole number ≥ 0`);
  });

  list('workLog', (r, at) => {
    if (!isDay(r.day)) errors.push(`${at}.day: YYYY-MM-DD`);
    if (!(Array.isArray(r.requested) && r.requested.every(isPath))) errors.push(`${at}.requested: paths starting with /`);
    if (!isCount(r.alreadyIndexed)) errors.push(`${at}.alreadyIndexed: a whole number ≥ 0`);
    if (r.note !== undefined && typeof r.note !== 'string') errors.push(`${at}.note: text`);
  });
  if (Array.isArray(s.workLog)) {
    if (s.workLog.length > MAX_WORKLOG) errors.push(`workLog: keep the last ${MAX_WORKLOG} entries (has ${s.workLog.length})`);
    for (let i = 1; i < s.workLog.length; i++) if (isObj(s.workLog[i]) && isObj(s.workLog[i - 1]) && s.workLog[i].day < s.workLog[i - 1].day) { errors.push('workLog: oldest first'); break; }
  }

  list('history', (r, at) => {
    if (!isDay(r.day)) errors.push(`${at}.day: YYYY-MM-DD`);
    if (!isCount(r.clicks)) errors.push(`${at}.clicks: a whole number ≥ 0`);
    if (!isCount(r.impressions)) errors.push(`${at}.impressions: a whole number ≥ 0`);
    if (!(r.position === null || isPos(r.position))) errors.push(`${at}.position: a number ≥ 1 or null`);
    if (r.ctr !== undefined && r.ctr !== null && !isRatio(r.ctr)) errors.push(`${at}.ctr: a fraction 0-1`);
    if (r.indexed !== undefined && r.indexed !== null && !isCount(r.indexed)) errors.push(`${at}.indexed: a whole number or null`);
  });
  if (Array.isArray(s.history)) {
    for (let i = 1; i < s.history.length; i++) if (isObj(s.history[i]) && isObj(s.history[i - 1]) && !(s.history[i].day > s.history[i - 1].day)) { errors.push('history: one row per day, oldest first'); break; }
    const last = s.history[s.history.length - 1];
    if (isObj(last) && isDay(s.asOf) && last.day > s.asOf) errors.push('history: the last row is after asOf');
    if (isObj(last) && isDay(s.asOf) && last.day !== s.asOf) warnings.push(`history: no row for asOf (${s.asOf}); append one`);
  }
  return { errors, warnings };
}

const fmt = n => new Intl.NumberFormat('en').format(n);
const dayName = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
function change(word, a, b, span) {
  const sp = span ? ' ' + span : '';
  if (a === b) return `${word} flat at ${fmt(b)}${sp}`;
  if (a > 0 && b / a >= 2) return `${word} up ${Math.round(b / a)}x${sp} (${fmt(a)} → ${fmt(b)})`;
  if (a > 0) return `${word} ${b > a ? 'up' : 'down'} ${Math.round(Math.abs(b - a) / a * 100)}%${sp} (${fmt(a)} → ${fmt(b)})`;
  return `${word} ${fmt(a)} → ${fmt(b)}${sp}`;
}

/** The "What's happening" lines: change over the history rows, the index, then quick wins. Valid snapshots only. */
export function summarize(s) {
  const lines = [];
  const h = s.history || [];
  if (h.length >= 2) {
    const a = h[h.length - 2], b = h[h.length - 1], n = daysBetween(a.day, b.day);
    const span = `in ${n} ${n === 1 ? 'day' : 'days'}`;
    let line = `${change('Impressions', a.impressions, b.impressions, span)}; ${change('clicks', a.clicks, b.clicks, '')}.`;
    if (a.position !== null && b.position !== null && a.position !== undefined && b.position !== undefined && Math.abs(b.position - a.position) >= 1)
      line += ` Average position ${a.position} → ${b.position}${b.position > a.position ? ' (lower is better: new searches start far down the results)' : ' (better)'}.`;
    lines.push(line);
  } else {
    const w = s.windows && (s.windows.d28 || s.windows.d7);
    if (w) lines.push(`${fmt(w.clicks)} clicks from ${fmt(w.impressions)} Google impressions in the last ${s.windows.d28 ? 28 : 7} days; more snapshot days will show the change.`);
  }
  const ix = s.index;
  if (ix) {
    let line = `${fmt(ix.indexed)} pages indexed`;
    if (ix.previous) { const d = ix.indexed - ix.previous.indexed; line += ` (${d >= 0 ? '+' : '−'}${fmt(Math.abs(d))} since ${dayName(ix.previous.asOf)})`; }
    const crawled = ix.reasons.find(r => /^crawled/i.test(r.reason)), found = ix.reasons.find(r => /^discovered/i.test(r.reason));
    const bits = [];
    if (crawled && crawled.pages) bits.push(`${fmt(crawled.pages)} crawled but not indexed`);
    if (found && found.pages) bits.push(`${fmt(found.pages)} found but not crawled yet`);
    lines.push(line + (bits.length ? `; ${bits.join(', ')}` : '') + '.');
  }
  const wq = (s.topQueries || []).filter(q => isQuickWin(q.position)).length, wp = (s.topPages || []).filter(p => isQuickWin(p.position)).length;
  if (wq || wp) {
    const best = (s.topPages || []).filter(p => isQuickWin(p.position)).sort((a, b) => b.impressions - a.impressions)[0];
    lines.push(`Quick wins: ${wq} ${wq === 1 ? 'search' : 'searches'} and ${wp} ${wp === 1 ? 'page' : 'pages'} sit at position ${QUICK_WIN.from}-${QUICK_WIN.to}, close to the top of Google${best ? `; the biggest is ${best.path} (${fmt(best.impressions)} impressions at ${best.position})` : ''}.`);
  }
  return lines;
}
