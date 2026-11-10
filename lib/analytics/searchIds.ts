/**
 * Search arrivals (Nov 10 2026, the Search Console substitute on /admin's Marketing tab; report: searchReport.ts). When a tab's
 * FIRST page view came from a search engine or an AI assistant, the tracker counts ONE fixed-shape id on the existing beat
 * (`k:{id:n}`, tracker.ts → /api/visit → daily rollups, like every other counter):
 *   se:<landing>:<engine>     e.g. se:C45:google, se:HfootballDrulesDforDkids:chatgpt, se:home:bing
 * <engine> is one of ENGINES below: the NAME of the engine, worked out in the browser from the referring site's host (the same
 * host the session start already sends) or, without a referrer, from a link's utm_source (ChatGPT tags its links). <landing>
 * is the PATH of the public page the visitor arrived on, written with capitals for the separators so it fits the counter
 * shape and reads back exactly (landingKey / landingPath).
 *
 * Privacy (a kids' game): a total per (page, engine) per day and nothing else. Never the search words (search engines do not
 * send them, and nothing here reads a query string), never the full referring URL, never an id of anyone, no new cookie or
 * storage. Only public reading and landing pages are named (PUBLIC_SECTIONS); any other path counts as "other". Nothing is
 * sent under Do-Not-Track / GPC, to bots, in previews, on localhost or from an admin tab (the tracker is off there).
 * What is new compared with before: the landing PAGE of a search arrival. Until now a session kept its referrer host and a
 * coarse entry path (lib/analytics/core.ts KNOWN_PATHS: every reading page was "/other"). No database change: these ids ride
 * the existing counter columns (the id shape is the one COUNT_KEY_RE and the SQL already accept).
 * Pure, no imports: countIds.ts (the allowlist), tracker.ts (the browser) and searchReport.ts (the admin) all read it.
 */
export const SEARCH_SINCE='2026-11-10';
export type EngineKind='search'|'ai';
/** [id (≤ 12 letters), label, kind, hosts]. Order matters: Gemini and Copilot sit on google.com / bing.com style hosts. */
export const ENGINES:readonly (readonly [string,string,EngineKind,readonly RegExp[]])[]=[
 ['gemini','Gemini','ai',[/^gemini\.google\.com$/,/^bard\.google\.com$/]],
 ['copilot','Copilot','ai',[/^copilot\.microsoft\.com$/,/^copilot\.com$/,/(^|\.)copilot\.cloud\.microsoft$/]],
 ['chatgpt','ChatGPT','ai',[/(^|\.)chatgpt\.com$/,/(^|\.)openai\.com$/]],
 ['perplexity','Perplexity','ai',[/(^|\.)perplexity\.ai$/]],
 ['claude','Claude','ai',[/(^|\.)claude\.ai$/,/(^|\.)anthropic\.com$/]],
 ['google','Google','search',[/(^|\.)google\.[a-z.]+$/]],
 ['bing','Bing','search',[/(^|\.)bing\.com$/]],
 ['duckduckgo','DuckDuckGo','search',[/(^|\.)duckduckgo\.com$/]],
 ['yahoo','Yahoo','search',[/(^|\.)yahoo\.[a-z.]+$/]],
 ['ecosia','Ecosia','search',[/(^|\.)ecosia\.org$/]],
 ['brave','Brave Search','search',[/^search\.brave\.com$/]],
 ['yandex','Yandex','search',[/(^|\.)yandex\.[a-z.]+$/,/^ya\.ru$/]],
 ['baidu','Baidu','search',[/(^|\.)baidu\.com$/]],
 ['othersearch','Other search engines','search',[/(^|\.)kagi\.com$/,/(^|\.)startpage\.com$/,/(^|\.)naver\.com$/,/(^|\.)qwant\.com$/,/(^|\.)kiddle\.co$/,/(^|\.)seznam\.cz$/]],
];
const BY_ID=new Map(ENGINES.map(e=>[e[0],e]));
export const engineLabel=(id:string)=>BY_ID.get(id)?.[1]??id;
export const engineKind=(id:string):EngineKind|null=>BY_ID.get(id)?.[2]??null;
/** The engine a host (or a utm_source such as "chatgpt.com" / "perplexity") names; null for anything else. */
export function engineOf(host:string|null|undefined):string|null{
 if(typeof host!=='string'||!host||host.length>253)return null;
 const h=host.trim().toLowerCase().replace(/^www\./,'');
 if(BY_ID.has(h)&&h!=='othersearch')return h;
 for(const [id,,,res] of ENGINES)if(res.some(re=>re.test(h)))return id;
 return null;
}
/** The public sections whose pages are named; anything else is "other". */
export const PUBLIC_SECTIONS=['play','about','privacy','marketing','cards','fish','exhibits','learn','safe-football-game-for-kids','tools'/* the free coach tools (lib/site/tools/registry.ts): the landing page only, never anything typed into a tool */] as const;
const PATH_RE=/^\/[a-z0-9_.-]+(\/[a-z0-9_.-]+){0,2}$/;
/** Short codes for the busy sections (a key that starts with a capital names one), so long page ids still fit. */
const PREFIX:readonly (readonly [string,string])[]=[['learn/lessons/','L'],['learn/','H'],['cards/','C'],['fish/','F'],['exhibits/','X'],['tools/soccer-field-diagrams/','G'],['tools/','T']];
/** "/cards/45" → "C45", "/learn/futsal-for-kids" → "HfutsalDforDkids", "/" → "home": lower-case letters, digits and _ stay; "/" is S,
 *  "-" is D, "." is P. At most 52 characters (40 in the id's first part + 12 in its last), else "other". */
export function landingKey(pathname:string):string{
 if(typeof pathname!=='string')return 'other';
 const p=pathname.split(/[?#]/)[0].replace(/\/+$/,'')||'/';
 if(p==='/')return 'home';
 if(!PATH_RE.test(p)||!(PUBLIC_SECTIONS as readonly string[]).includes(p.split('/')[1]))return 'other';
 let rest=p.slice(1),code='';
 for(const [pre,c] of PREFIX)if(rest.startsWith(pre)&&rest.length>pre.length){code=c;rest=rest.slice(pre.length);break;}
 const k=code+rest.replace(/\//g,'S').replace(/-/g,'D').replace(/\./g,'P');
 return k.length<=52?k:'other';
}
/** The path a key stands for ("other" → "(other pages)"). */
export function landingPath(key:string):string{
 if(key==='home')return '/';if(key==='other')return '(other pages)';
 const pre=PREFIX.find(([,c])=>key[0]===c),body=(pre?key.slice(1):key).replace(/S/g,'/').replace(/D/g,'-').replace(/P/g,'.');
 return '/'+(pre?pre[0]:'')+body;
}
/** se:<key, first 40>:<engine>[:<key, the rest>] */
export const SEARCH_ID_RE=/^se:([A-Za-z0-9_]{1,40}):([a-z]{2,12})(?::([A-Za-z0-9_]{1,12}))?$/;
export const searchId=(pathname:string,engine:string)=>{const k=landingKey(pathname);return `se:${k.slice(0,40)}:${engine}${k.length>40?':'+k.slice(40):''}`;};
export const parseSearchId=(id:string):{key:string;engine:string}|null=>{const m=SEARCH_ID_RE.exec(id);return m&&BY_ID.has(m[2])&&(!m[3]||m[1].length===40)?{key:m[1]+(m[3]||''),engine:m[2]}:null;};
/** True for a well-formed search-arrival id naming a known engine (countIds.ts isCountId). */
export const isSearchId=(id:string):boolean=>parseSearchId(id)!==null;
