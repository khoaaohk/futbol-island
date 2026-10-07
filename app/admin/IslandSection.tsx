'use client';
/**
 * "Where on the island" (Oct 8 2026): places ranked by total time and by average time per session, activities ranked by
 * time, and the heat map over the island. All from the report's daily totals (lib/analytics/core.ts mergeRollups); the
 * date-range picker above scopes it like every other card. Same cards, bars, tooltips and Table twins as the rest.
 */
import type {Report} from '@/lib/analytics/core';
import {ACTIVITY_LABEL,GRID,PLACE_LABEL,cellCenter} from '@/lib/analytics/islandIds';
import {BarList,ChartCard,fmtDuration,fmtInt,fmtPct} from './charts';
import IslandHeatmap,{cellPlace} from './IslandHeatmap';
import styles from './admin.module.css';

const NO_DATA='No island time in this range yet. Places, activities and the heat map start with the Oct 8 2026 release.';
const mins=(ms:number)=>Math.round(ms/6000)/10;

export default function IslandSection({report}:{report:Report}){
 const places=report.places,placeTotal=places.reduce((n,p)=>n+p.ms,0);
 const avg=places.filter(p=>p.sessions>0).map(p=>({...p,avg:p.ms/p.sessions})).sort((a,b)=>b.avg-a.avg);
 const idle=report.activities.find(a=>a.activity==='idle')?.ms??0;
 const acts=report.activities.filter(a=>a.activity!=='idle'),actTotal=acts.reduce((n,a)=>n+a.ms,0);
 const cellTotal=report.cells.reduce((n,[,s])=>n+s,0);
 const noPlaces=!places.length,noActs=!report.activities.length,noCells=!report.cells.length;
 return <section className={styles.island} aria-labelledby="island-heading">
  <div className={styles.sectionHead}>
   <h2 id="island-heading">Where on the island</h2>
   <p>Foreground play time by place, activity and 20 m square. Menus and idle time (no input for a minute) are left out of places and the map.</p>
  </div>

  <ChartCard wide title="Heat map" subtitle="Where players spend their time, per 20 m square. Darker means more time." empty={noCells} emptyText={NO_DATA}
   table={{columns:['Square (x, z m)','Place','Minutes','Share'],rows:[...report.cells].sort((a,b)=>b[1]-a[1]).map(([i,s])=>{const c=cellCenter(i);return [`${c.x-GRID.size/2}, ${c.z-GRID.size/2}`,cellPlace(i),mins(s*1000),cellTotal?fmtPct(s/cellTotal):'0%'];})}}>
   <IslandHeatmap cells={report.cells}/>
  </ChartCard>

  <div className={styles.grid}>
   <ChartCard title="Places by total time" subtitle="Foreground minutes spent in each place" empty={noPlaces} emptyText={NO_DATA}
    table={{columns:['Place','Minutes','Sessions','Avg per session','Share'],rows:places.map(p=>[PLACE_LABEL[p.place]||p.place,mins(p.ms),p.sessions,fmtDuration(p.sessions?p.ms/p.sessions:0),placeTotal?fmtPct(p.ms/placeTotal):'0%'])}}>
    <BarList rows={places.map(p=>({key:p.place,label:PLACE_LABEL[p.place]||p.place,value:p.ms,detail:`${fmtInt(p.sessions)} sessions`}))} format={fmtDuration} unit="in total"/>
   </ChartCard>

   <ChartCard title="Places by time per visit" subtitle="Average per session that went there" empty={noPlaces} emptyText={NO_DATA}
    table={{columns:['Place','Avg per session','Sessions','Minutes'],rows:avg.map(p=>[PLACE_LABEL[p.place]||p.place,fmtDuration(p.avg),p.sessions,mins(p.ms)])}}>
    <BarList rows={avg.map(p=>({key:p.place,label:PLACE_LABEL[p.place]||p.place,value:p.avg,detail:`${fmtInt(p.sessions)} sessions`}))} format={fmtDuration} unit="per session" share={false}/>
   </ChartCard>

   <ChartCard wide title="Activities" subtitle="Foreground minutes by what players were doing, across the island, arcade and museum" empty={noActs} emptyText={NO_DATA}
    table={{columns:['Activity','Minutes','Share'],rows:[...acts.map(a=>[ACTIVITY_LABEL[a.activity]||a.activity,mins(a.ms),actTotal?fmtPct(a.ms/actTotal):'0%']),...(idle?[[ACTIVITY_LABEL.idle+' · not counted as play',mins(idle),'—']]:[])]}}>
    <BarList rows={acts.map(a=>({key:a.activity,label:ACTIVITY_LABEL[a.activity]||a.activity,value:a.ms}))} format={fmtDuration} unit="of play" limit={12}/>
    {idle>0&&<p className={styles.note}>Plus {fmtDuration(idle)} idle (no touch, key or movement for a minute), not counted as play.</p>}
   </ChartCard>
  </div>
 </section>;
}
