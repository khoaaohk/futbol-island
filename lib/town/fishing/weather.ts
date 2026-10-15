import type {FishSpecies} from './fishCatalog';

/**
 * C4 (docs/fishing-research.md): a simple island-wide weather state, one per local day (the same all day, on every device, with
 * no clock or timer: it is derived from the date), and it can be switched off (Fishbook → "Weather", a per-device choice,
 * `fi2-fish-weather-v1`). Weather changes two things only:
 *  1. the fish MIX (never the rarity, never the value: fishingOdds.ts familyMix keeps each rarity's share and the mean catch within
 *     ±2.5 %, like the lures) — "fish bite better in the rain" is a hint word, never odds;
 *  2. the fishing water's look, through shader UNIFORMS only (waterMood.ts: tint, clarity), plus on light rain a handful of
 *     instanced streaks near the fishing camera on heat tiers 0–1 only (rainStreaks.ts, one draw while fishing in the rain, none
 *     otherwise). No particle storms, no new passes, nothing at rest.
 */
export type Weather='clear'|'breezy'|'overcast'|'rain';
export const WEATHERS:readonly Weather[]=['clear','breezy','overcast','rain'];
export const WEATHER_LABEL:Record<Weather,string>={clear:'Clear skies',breezy:'Breezy',overcast:'Cloudy',rain:'Light rain'};
/** One short hint per weather (kid words, never odds). */
export const WEATHER_HINT:Record<Weather,string>={
 clear:'A calm, clear day for fishing.',
 breezy:'A breezy day: quick, slim fish like the choppy water.',
 overcast:'A grey day: big hunters swim closer under the clouds.',
 rain:'Light rain: crabs, eels and rays bite better in the rain.',
};
/** Which animals the weather favours (inside each rarity). Clear favours nobody. */
export const WEATHER_FAVORS:Record<Weather,((f:Pick<FishSpecies,'group'|'shape'|'shadow'>)=>boolean)|null>={
 clear:null,
 breezy:f=>f.shape==='slim'||f.shape==='long',
 overcast:f=>f.group==='shark'||f.group==='octopus'||f.group==='squid',
 rain:f=>f.group==='crab'||f.group==='eel'||f.group==='ray'||f.group==='lobster'||f.group==='shellfish',
};
/** Local day key (YYYY-MM-DD) for a timestamp. */
export const dayKey=(now:number)=>{const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
/** A small stable hash of a string (FNV-1a plus a final mix), 0..1. */
export function hash01(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 // A final avalanche (murmur3's), so nearby keys (consecutive days) spread evenly.
 h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;h^=h>>>16;return (h>>>0)/2**32;}
/** The day's weather: clear 40 %, breezy 25 %, cloudy 20 %, light rain 15 % of days (internal; the player only sees the day's word). */
export function weatherForDay(day:string):Weather{
 const r=hash01('weather:'+day);return r<.4?'clear':r<.65?'breezy':r<.85?'overcast':'rain';
}
/** The per-device weather on/off choice (DEVICE key, lib/saves/snapshot.ts). */
export const WEATHER_PREF_KEY='fi2-fish-weather-v1';
/** The island's time-of-day setting (Town.tsx `fi2-time-of-day`, default sunset). Safe anywhere (no window: sunset). */
export function readTimeOfDay():'day'|'sunset'|'night'{try{const t=localStorage.getItem('fi2-time-of-day');if(t==='day'||t==='sunset'||t==='night')return t;}catch{/* no storage */}return 'sunset';}
export function readWeatherOn(){try{return localStorage.getItem(WEATHER_PREF_KEY)!=='off';}catch{return true;}}
/** Today's weather as the player sees it (clear when switched off). */
export const readWeather=(now=Date.now()):Weather=>readWeatherOn()?weatherForDay(dayKey(now)):'clear';
