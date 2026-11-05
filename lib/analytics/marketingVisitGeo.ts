/**
 * Where and when for /marketing visits (Nov 5 2026; the browser half is lib/analytics/marketingVisit.ts). SERVER ONLY: called
 * by the ingest (ingest.ts handleIngest) on every beat, after the counts are clamped to the allowlist. When the beat carries
 * mm:view it adds, from Vercel's geo headers (x-vercel-ip-country, x-vercel-ip-country-region) and the beat's arrival time:
 *   mm:g_<geo>          visits from that place
 *   mm:h_<d>_<hh>       visits in that Pacific weekday (0 = Sunday … 6) and hour (00–23), the same clock as /admin's days
 * and when it carries stay seconds (mm:min / mm:sec10 / mm:sec1) it adds them to the place as
 *   mm:gm_<geo> + mm:gx_<geo>   whole minutes + tens of seconds (0–5, this beat's remainder rounded): within ±5 s per beat.
 *
 * <geo> is a coarse, FIXED set: us_<state> for the 50 states and DC (us_ca, us_tx …), us (United States, state unknown),
 * o_<country> for anywhere else (o_de, o_gb …; ISO 3166-1 alpha-2), other (no or unknown country header). Never an IP, a city,
 * a postcode or coordinates; the headers are read here and dropped. The browser cannot send these ids (they are not on the
 * client allowlist, so clampCounts drops them first). A beat already at MAX_BEAT_COUNTS ids gets none added.
 * The hour is when the visit's first beat arrived (the tab's next beat after the page loaded: a hide, a close or the ≤3.6 min
 * safety beat), so it is the visit's hour to within a few minutes.
 */
import {PACIFIC_TZ,sanitizeCountry,sanitizeRegion} from './core';
import {MAX_BEAT_COUNTS,MAX_COUNT_VALUE} from './countIds';

export const US_STATES=['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO',
 'MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'] as const;
const STATES=new Set<string>(US_STATES);
export const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;
/** A place id is one of these shapes (and a us_<state> is a real state). */
export const GEO_RE=/^(us_[a-z]{2}|us|o_[a-z]{2}|other)$/;
export const isGeo=(g:string)=>GEO_RE.test(g)&&(!g.startsWith('us_')||STATES.has(g.slice(3).toUpperCase()));

/** The coarse place of a request from its two Vercel geo headers. Missing or malformed → 'other' (or 'us' without a state). */
export function geoOf(country:string|null|undefined,region:string|null|undefined):string{
 const c=sanitizeCountry(country);if(!c)return 'other';
 if(c!=='US')return 'o_'+c.toLowerCase();
 const r=sanitizeRegion(region);return r&&STATES.has(r)?'us_'+r.toLowerCase():'us';
}

let fmt:Intl.DateTimeFormat|null=null;
/** Pacific weekday (0 = Sunday) and hour (0–23) of an instant. */
export function pacificSlot(ms:number):{dow:number;hour:number}{
 fmt??=new Intl.DateTimeFormat('en-US',{timeZone:PACIFIC_TZ,weekday:'short',hour:'2-digit',hourCycle:'h23'});
 let dow=0,hour=0;for(const p of fmt.formatToParts(new Date(ms))){if(p.type==='weekday')dow=Math.max(0,WEEKDAYS.indexOf(p.value as typeof WEEKDAYS[number]));if(p.type==='hour')hour=Number(p.value)%24;}
 return {dow,hour};
}
export const hourId=(dow:number,hour:number)=>`mm:h_${dow}_${String(hour).padStart(2,'0')}`;

/** The beat's counts with the server-side place / hour ids added (a new object; the input is not changed). */
export function addVisitGeo(counts:Record<string,number>,h:{country:string|null|undefined;region:string|null|undefined},now:Date):Record<string,number>{
 const views=counts['mm:view']||0,secs=60*(counts['mm:min']||0)+10*(counts['mm:sec10']||0)+(counts['mm:sec1']||0);
 if(!views&&!secs)return counts;
 const out={...counts},geo=geoOf(h.country,h.region);
 const add=(id:string,n:number)=>{if(n<1)return;if(!(id in out)&&Object.keys(out).length>=MAX_BEAT_COUNTS)return;out[id]=Math.min(MAX_COUNT_VALUE,(out[id]||0)+n);};
 if(views){const {dow,hour}=pacificSlot(now.getTime());add('mm:g_'+geo,views);add(hourId(dow,hour),views);}
 if(secs){let m=Math.floor(secs/60),x=Math.round(secs%60/10);if(x===6){m++;x=0;}add('mm:gm_'+geo,m);add('mm:gx_'+geo,x);}
 return out;
}
