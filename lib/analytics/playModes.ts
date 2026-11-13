/**
 * How the island is played, per day and over a range (Nov 13 2026; owner: the admin day view and the Players tab split by mode).
 * Pure and client-safe: the shapes and parsing of public.analytics_play_modes (supabase/migrations/20261120_analytics_play_modes.sql),
 * which sums the beats' pm:<s|w|p> counter (lib/analytics/countIds.ts PLAY_MODES; stored since Nov 13 2026, no ingest change).
 * The daily rollups do not carry pm: (their counts are a fixed list), so this is over the kept raw rows (14 days).
 * Server side: lib/analytics/playModesAdmin.ts; UI: app/admin/LivePanel.tsx (day view "Mode" strip) and app/admin/PlayModesCard.tsx.
 * Aggregates only: sessions, foreground seconds, distinct players and returning sessions per mode. Never an id.
 */
import {LIVE_MODES,LIVE_MODE_LABEL,arr,num,obj,str,type LiveMode} from './live';

export const MODES_MIGRATION='supabase/migrations/20261120_analytics_play_modes.sql',MODES_OK_ROW='OK, play modes installed';
/** The first Pacific day any beat carried a play mode (the beat's `m` shipped Nov 13 2026). Days before it have no mode data. */
export const MODE_DATA_SINCE='2026-11-13';
export const MODE_SINCE_TEXT='No mode data before Nov 13';
export type ModesStatus='ok'|'not-configured'|'needs-migration'|'error';
export type ModeStat={sessions:number;seconds:number;players:number;returning:number};
export type ModeSplit={sessions:number;withMode:number;modes:Record<LiveMode,ModeStat>};
export type ModeDay=ModeSplit&{day:string};
export type PlayModes={status:ModesStatus;from:string;to:string;oldestDay:string;days:ModeDay[];totals:ModeSplit};

const zero=():ModeStat=>({sessions:0,seconds:0,players:0,returning:0});
const split=(v:unknown):ModeSplit=>{const o=obj(v),m=obj(o.modes);
 return {sessions:num(o.sessions),withMode:num(o.with_mode),modes:Object.fromEntries(LIVE_MODES.map(k=>{const q=obj(m[k]);
  return [k,{sessions:num(q.sessions),seconds:num(q.seconds),players:num(q.players),returning:num(q.returning)}];})) as Record<LiveMode,ModeStat>};};
export const emptyModes=(status:ModesStatus,from='',to=''):PlayModes=>({status,from,to,oldestDay:'',days:[],
 totals:{sessions:0,withMode:0,modes:{w:zero(),s:zero(),p:zero()}}});
export function shapeModes(raw:unknown):PlayModes{
 const r=obj(raw);
 return {status:'ok',from:str(r.from)||'',to:str(r.to)||'',oldestDay:str(r.oldest_day)||'',
  days:arr(r.days).map(d=>({...split(d),day:str(obj(d).day)||''})).filter(d=>d.day),totals:split(r.totals)};
}
/** The range has days before mode data existed: 'none' = all of it, 'some' = it starts earlier, 'all' = every day can have it. */
export const modeCoverage=(from:string,to:string):'none'|'some'|'all'=>to<MODE_DATA_SINCE?'none':from<MODE_DATA_SINCE?'some':'all';
/** Display rows (Public, Just me, Party order), modes nobody played left out. */
export function modeRows(s:ModeSplit){
 return LIVE_MODES.filter(k=>s.modes[k].sessions>0).map(k=>{const m=s.modes[k];
  return {key:k,label:LIVE_MODE_LABEL[k],...m,returningShare:m.sessions?m.returning/m.sessions:null};});
}
