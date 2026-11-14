/**
 * Which page a live session is on (Nov 13 2026; owner: the "On now" cards should say WHERE an off-island visitor is, "Marketing
 * page", "Learn: 9v9 formations", not "other page"). A fixed allowlist of route keys: the ingest (lib/analytics/ingest.ts) turns
 * each beat's path into the counter `pg:<key>` = 1 (no migration: the SQL accepts any id of COUNT_KEY_RE's shape, like `pm:`),
 * and the live panel reads the newest beat's key (lib/analytics/liveAdmin.ts). Only the route family is kept: never the full
 * URL, a query, a slug below the families listed here, or anything a visitor typed; an unknown route is `other` ("Other page").
 * Ingest-only (not on countIds.ts FIXED), so a tab cannot send a `pg:` in `k`. Pure and client-safe (the admin bundle uses the labels).
 */
/** The /learn sections (app/(site)/learn/*): a sub-page (/learn/soccer-drills/rondo) keeps its section only. */
const LEARN:Record<string,string>={'11v11-soccer-formations':'11v11 formations','7v7-9v9-11v11':'7v7, 9v9 and 11v11','7v7-soccer-formations':'7v7 formations',
 '9v9-soccer-formations':'9v9 formations','football-rules-for-kids':'Football rules for kids','futsal-for-kids':'Futsal for kids',lessons:'Lessons',
 'passing-and-support':'Passing and support','soccer-age-groups':'Age groups','soccer-ball-size-by-age':'Ball size by age',
 'soccer-drills':'Drills','soccer-field-size-by-age':'Field size by age','soccer-formations':'Formations','soccer-positions':'Positions',
 'soccer-practice-plans':'Practice plans','soccer-quiz-for-kids':'Quiz for kids','soccer-rules':'Rules','soccer-terms':'Terms'};
/** Top-level routes (a sub-route keeps its top segment: /cards/12 is cards, /marketing/overview is marketing). */
const TOP:Record<string,[key:string,label:string]>={'':['home','Home'],play:['play','Island'],'island-return':['play','Island'],arcade:['arcade','Arcade'],
 museum:['museum','Museum'],konbini:['konbini','Konbini'],shop:['shop','Kit shop'],controller:['controller','Phone controller'],coffee:['coffee','Support page'],
 start:['start','Start page'],plan:['plan','Football plan'],privacy:['privacy','Privacy'],about:['about','About'],cards:['cards','Cards'],exhibits:['exhibits','Exhibits'],
 fish:['fish','Fish guide'],games:['games','Games'],tools:['tools','Coach tools'],marketing:['marketing','Marketing page'],
 'safe-football-game-for-kids':['parents','Parents’ guide'],learn:['learn','Learn']};
const learnKey=(slug:string)=>'learn_'+slug.replace(/-/g,'_');
/** Every key, with its admin label ("Other page" for anything not listed). */
export const PAGE_LABEL:Record<string,string>={...Object.fromEntries(Object.values(TOP)),...Object.fromEntries(Object.entries(LEARN).map(([s,l])=>[learnKey(s),'Learn: '+l])),other:'Other page'};
export const PAGE_KEYS=Object.keys(PAGE_LABEL);
/** A raw path (the beat's `p`) → its key. Lower-cased, query and hash dropped; anything off the list is `other`. */
export function pageKeyOf(raw:unknown):string{
 if(typeof raw!=='string'||!raw.startsWith('/'))return 'other';
 const seg=raw.split(/[?#]/)[0].toLowerCase().split('/').filter(Boolean),top=seg[0]||'';
 if(top==='learn'&&seg[1])return Object.prototype.hasOwnProperty.call(LEARN,seg[1])?learnKey(seg[1]):'learn';
 return Object.prototype.hasOwnProperty.call(TOP,top)?TOP[top][0]:'other';
}
export const PAGE_PREFIX='pg:';
export const pageCountId=(key:string)=>PAGE_PREFIX+key;
/** The page a beat's counters carry (null when none: an older beat, a count-only drain beat); an unlisted key reads `other`. */
export function pageKeyIn(counts:unknown):string|null{
 if(!counts||typeof counts!=='object'||Array.isArray(counts))return null;
 for(const [k,v] of Object.entries(counts as Record<string,unknown>))if(k.startsWith(PAGE_PREFIX)&&Number(v)>0){const key=k.slice(PAGE_PREFIX.length);return PAGE_LABEL[key]?key:'other';}
 return null;
}
export const pageLabel=(key:string|null|undefined)=>key&&PAGE_LABEL[key]?PAGE_LABEL[key]:PAGE_LABEL.other;
/** A start's stored entry path (core.ts sanitizePath: '/', '/play', '/arcade', … or '/other') → its key, for a session with no beat yet. */
export const entryPageKey=(entryPath:string|null|undefined)=>entryPath==null?null:pageKeyOf(entryPath);
