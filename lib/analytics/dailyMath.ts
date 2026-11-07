/**
 * The daily data layer's arithmetic (Nov 6 2026), split out of daily.ts so the /admin dashboard can run the SAME rules in the
 * browser without bundling the layer's catalog (countIds, sponsor definitions, lesson text). daily.ts re-exports all of it,
 * so the export (exportCsv.ts) and the charts share one implementation: a span's total, an honest previous period, weeks and
 * weekdays. Pure, no imports.
 */

/** How a series rolls up over several days: `sum` (add the days), `ratio` (Σ numerator ÷ Σ denominator) or `avg` (the mean
 *  of complete days, e.g. players per day: unique visitors cannot be added across days, the salt changes every night). */
export type Agg='sum'|'ratio'|'avg';
/** One day. `value` null = not tracked that day. `num`/`den` (ratio series) let any span recompute the ratio exactly. */
export type DailyPoint={day:string;value:number|null;partial?:true;utcDay?:true;num?:number;den?:number};
/** The fields the helpers below read (a full DailySeries in daily.ts, or the dashboard's compact series rebuilt). */
export type SeriesCore={agg:Agg;scale?:number;trackedSince:string|null;points:DailyPoint[];prior:DailyPoint[]};

const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*86_400_000).toISOString().slice(0,10);
function dayList(from:string,to:string):string[]{const out:string[]=[];for(let d=from;d<=to&&out.length<400;d=addDays(d,1))out.push(d);return out;}
const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;
/** A day carries data: a value, or (ratio) a numerator and a denominator. */
export const isTracked=(p:DailyPoint)=>p.value!==null||(p.den!==undefined&&p.num!==undefined);
const pointsIn=(s:Pick<SeriesCore,'points'|'prior'>,from:string,to:string)=>[...s.prior,...s.points].filter(p=>p.day>=from&&p.day<=to);

/** A span's value: sums add tracked days (today so far included); ratios divide the sums; averages use complete days only
 *  (today left out unless it is the only day). null when no day of the span is tracked. */
export function aggregate(s:{agg:Agg;scale?:number},points:DailyPoint[]):{value:number|null;days:number;tracked:number}{
 const t=points.filter(isTracked);
 if(!t.length)return {value:null,days:points.length,tracked:0};
 if(s.agg==='sum')return {value:t.reduce((a,p)=>a+(p.value as number),0),days:points.length,tracked:t.length};
 if(s.agg==='ratio'){const n=t.reduce((a,p)=>a+(p.num??0),0),d=t.reduce((a,p)=>a+(p.den??0),0);
  return {value:d?n/d*(s.scale??1):null,days:points.length,tracked:t.length};}
 const complete=t.length>1?t.filter(p=>!p.partial):t;
 return {value:complete.length?complete.reduce((a,p)=>a+(p.value as number),0)/complete.length:null,days:points.length,tracked:complete.length};
}
/** The range (or any loaded span) total of a series. */
export const totalOf=(s:SeriesCore,from?:string,to?:string)=>aggregate(s,from&&to?pointsIn(s,from,to):s.points);

/**
 * The period before, same number of COMPLETE days. When the range ends today the comparison uses the complete days only
 * (today is left out of both sides). 'not-tracked' when any of the previous days is before trackedSince or not tracked;
 * 'not-loaded' when the loaded days do not reach back far enough.
 */
export type PrevPeriod={status:'ok';from:string;to:string;value:number|null;current:number|null;curFrom:string;curTo:string;change:number|null}
 |{status:'not-tracked'|'not-loaded'|'none';from:string;to:string;trackedSince:string|null};
export function previousPeriod(s:SeriesCore,from:string,to:string,today:string):PrevPeriod{
 let curTo=to;if(to===today&&from<to)curTo=addDays(to,-1);
 const n=dayList(from,curTo).length,pFrom=addDays(from,-n),pTo=addDays(from,-1);
 const pts=pointsIn(s,pFrom,pTo);
 if(!s.trackedSince)return {status:'none',from:pFrom,to:pTo,trackedSince:null};
 if(pFrom<s.trackedSince)return {status:'not-tracked',from:pFrom,to:pTo,trackedSince:s.trackedSince};
 if(pts.length<n)return {status:'not-loaded',from:pFrom,to:pTo,trackedSince:s.trackedSince};
 if(pts.some(p=>!isTracked(p)))return {status:'not-tracked',from:pFrom,to:pTo,trackedSince:s.trackedSince};
 const prev=aggregate(s,pts).value,cur=aggregate(s,pointsIn(s,from,curTo)).value;
 return {status:'ok',from:pFrom,to:pTo,value:prev,current:cur,curFrom:from,curTo,change:prev===null||cur===null||prev===0?null:(cur-prev)/prev};
}

/** Monday-to-Sunday weeks overlapping the range: `complete` = all 7 days inside the range, tracked and not partial. */
export type WeekRow={week:string;from:string;to:string;days:number;value:number|null;complete:boolean;partial:boolean};
const dow=(day:string)=>new Date(day+'T12:00:00Z').getUTCDay();
export function weekly(s:{agg:Agg;scale?:number;points:DailyPoint[]}):WeekRow[]{
 const out=new Map<string,DailyPoint[]>();
 for(const p of s.points){const wk=addDays(p.day,-((dow(p.day)+6)%7));(out.get(wk)??out.set(wk,[]).get(wk)!).push(p);}
 return [...out.entries()].map(([week,pts])=>({week,from:pts[0].day,to:pts[pts.length-1].day,days:pts.length,value:aggregate(s,pts).value,
  complete:pts.length===7&&pts.every(p=>!p.partial&&isTracked(p)),partial:pts.some(p=>!!p.partial)}));
}
/** Day of week (0 = Sunday): sums and averages → the mean of complete tracked days; ratios → Σ num ÷ Σ den. */
export function byWeekday(s:{agg:Agg;scale?:number;points:DailyPoint[]}):{weekday:number;label:string;days:number;value:number|null}[]{
 return WEEKDAYS.map((label,w)=>{const pts=s.points.filter(p=>dow(p.day)===w&&!p.partial&&isTracked(p));
  const v=s.agg==='ratio'?aggregate(s,pts).value:pts.length?pts.reduce((a,p)=>a+(p.value as number),0)/pts.length:null;
  return {weekday:w,label,days:pts.length,value:v};});
}
