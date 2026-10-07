/**
 * Region names for the dashboard's per-country breakdown (Oct 8 2026). Vercel's x-vercel-ip-country-region header is the
 * ISO 3166-2 subdivision code without the country prefix ("CA", "ENG", "NSW"); we store "<country>-<code>" (core.ts dimKeys)
 * and only ever at region level: never a city or coordinates. Server-only (report.ts): the ~95 KB table never reaches the
 * browser; the report carries just the names it needs. A code the table doesn't know falls back to the code itself.
 */
import names from './regionNames.json';

const TABLE=names as unknown as Record<string,Record<string,string>|string>;
/** English names where the ISO list uses the local one for well-known regions. */
const OVERRIDES:Record<string,string>={'IE-D':'Dublin','JP-13':'Tokyo','JP-27':'Osaka','JP-01':'Hokkaido','JP-26':'Kyoto','JP-14':'Kanagawa','BE-BRU':'Brussels','IT-RM':'Rome','IT-MI':'Milan','PT-11':'Lisbon','AT-9':'Vienna','DE-BY':'Bavaria','DE-NW':'North Rhine-Westphalia'};

/** "California" for ("US","CA"); the code itself when unknown. */
export function regionName(country:string,code:string):string{
 const c=(country||'').toUpperCase(),r=(code||'').toUpperCase();
 const o=OVERRIDES[`${c}-${r}`];if(o)return o;
 const t=TABLE[c];return t&&typeof t==='object'&&t[r]?t[r]:r;
}

/** Names for a list of stored region keys ("US-CA"). */
export function regionNamesFor(keys:readonly string[]):Record<string,string>{
 const out:Record<string,string>={};
 for(const k of keys){const m=/^([A-Z]{2})-([A-Z0-9]{1,3})$/.exec(k);if(m)out[k]=regionName(m[1],m[2]);}
 return out;
}
