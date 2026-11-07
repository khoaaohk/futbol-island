/**
 * The "Investor page visits" section of /admin's Marketing tab (Nov 5 2026): where /marketing's visitors were (US state, else
 * country), when they came (Pacific hour, weekday × hour, day) and how long they stayed. Built on the SERVER from the range's
 * merged counters and its daily rollups (ids: lib/analytics/marketingVisit.ts, marketingVisitGeo.ts). EXACT counts (owner,
 * Nov 4 2026: no small-number suppression on the Marketing tab). Average stay is exact to the second (60·min + 10·sec10 +
 * sec1 over views); the median is estimated inside its band (straight-line between the band's edges); per place the stay is
 * exact to ±5 s per beat (mm:gm_ + mm:gx_). Pure: tests/admin-analytics-marketing-visits.cjs drives it directly.
 */
import type {DailyRollup,Merged} from './core';
import {MM_BANDS} from './marketingVisit';
import {WEEKDAYS,hourId,isGeo} from './marketingVisitGeo';
import {regionName} from './regions';

export type MvPlace={geo:string;label:string;code:string;visits:number;share:number|null;seconds:number;avgSec:number|null};
export type MvBand={id:string;label:string;visits:number;share:number|null};
export type MarketingVisitReport={
 hasData:boolean;
 views:number;seconds:number;avgSec:number|null;medianSec:number|null;medianBand:string|null;
 /** Share of banded visits under 10 s; null without a banded visit. */bounceRate:number|null;bounced:number;banded:number;
 places:MvPlace[];bands:MvBand[];
 /** 24 Pacific hours (0 = midnight) and 7 × 24 weekday (0 = Sunday) × hour; `timed` = visits with an hour. */
 hours:number[];grid:number[][];timed:number;
 daily:{day:string;views:number}[];
 weekdays:readonly string[];timeZone:'Pacific';
};

let names:Intl.DisplayNames|null=null;
function countryLabel(cc:string):string{try{names??=new Intl.DisplayNames(['en'],{type:'region'});return names.of(cc)||cc;}catch{return cc;}}
/** "California" / "United States (state unknown)" / "Germany" / "Unknown place". */
export function placeLabel(geo:string):{label:string;code:string}{
 if(geo==='other')return {label:'Unknown place',code:'—'};
 if(geo==='us')return {label:'United States (state unknown)',code:'US'};
 if(geo.startsWith('us_')){const s=geo.slice(3).toUpperCase();return {label:regionName('US',s),code:'US-'+s};}
 const c=geo.slice(2).toUpperCase();return {label:countryLabel(c),code:c};
}

/** The median of banded counts, straight-line inside the band that holds the middle visit; null without visits. */
export function bandMedianSec(counts:readonly number[]):number|null{
 const total=counts.reduce((a,n)=>a+n,0);if(!total)return null;
 const half=total/2;let run=0;
 for(let i=0;i<MM_BANDS.length;i++){const n=counts[i]||0;if(n&&run+n>=half){const [,,lo,hi]=MM_BANDS[i];return Math.round(lo+(hi-lo)*(half-run)/n);}run+=n;}
 return MM_BANDS[MM_BANDS.length-1][2];
}

/** Stay seconds on /marketing (60·mm:min + 10·mm:sec10 + mm:sec1): the one rule for this section and the daily layer (daily.ts). */
export const mmSeconds=(c:Record<string,number>)=>60*(c['mm:min']||0)+10*(c['mm:sec10']||0)+(c['mm:sec1']||0);

export function buildMarketingVisits(m:Pick<Merged,'counts'>,rollups:Pick<DailyRollup,'day'|'counts'>[]):MarketingVisitReport{
 const c=m.counts||{},n=(id:string)=>c[id]||0;
 const views=n('mm:view'),seconds=mmSeconds(c);
 const bandCounts=MM_BANDS.map(b=>n('mm:t_'+b[0])),banded=bandCounts.reduce((a,x)=>a+x,0),bounced=bandCounts[0];
 const medianSec=bandMedianSec(bandCounts);
 let medianBand:string|null=null;if(banded){let run=0;for(let i=0;i<MM_BANDS.length;i++){run+=bandCounts[i];if(run*2>=banded){medianBand=MM_BANDS[i][1];break;}}}
 const places:MvPlace[]=[];
 for(const id of Object.keys(c)){const g=/^mm:g_(.+)$/.exec(id)?.[1];if(!g||!isGeo(g))continue;
  const visits=c[id],secs=60*n('mm:gm_'+g)+10*n('mm:gx_'+g),{label,code}=placeLabel(g);
  places.push({geo:g,label,code,visits,share:views?Math.min(1,visits/views):null,seconds:secs,avgSec:visits?Math.round(secs/visits):null});}
 places.sort((a,b)=>b.visits-a.visits||b.seconds-a.seconds||(a.label<b.label?-1:1));
 const grid=WEEKDAYS.map((_,d)=>Array.from({length:24},(_,h)=>n(hourId(d,h))));
 const hours=Array.from({length:24},(_,h)=>grid.reduce((a,row)=>a+row[h],0)),timed=hours.reduce((a,x)=>a+x,0);
 return {
  hasData:views>0,views,seconds,avgSec:views?Math.round(seconds/views):null,medianSec,medianBand,
  bounceRate:banded?bounced/banded:null,bounced,banded,
  places,bands:MM_BANDS.map((b,i)=>({id:b[0],label:b[1],visits:bandCounts[i],share:banded?bandCounts[i]/banded:null})),
  hours,grid,timed,daily:rollups.map(r=>({day:r.day,views:r.counts?.['mm:view']||0})),weekdays:WEEKDAYS,timeZone:'Pacific',
 };
}
