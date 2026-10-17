'use client';
/**
 * "Water" (Oct 15 2026): wading, swimming and splash-downs on the island (lib/town/water, docs/swimming-research.md "P0
 * implemented"). Time in the sea shows in "What they're doing" (the 'swim' activity) once
 * supabase/migrations/20261017_analytics_water.sql has run; this section is the discrete actions, from report.overview.water
 * (lib/analytics/overview.ts, lib/analytics/countIds.ts WATER_COUNT_EVENTS, small-number suppressed like the rest of /admin).
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {CountRow} from '@/lib/analytics/overview';
import {BarList,ChartCard,fmtInt,type BarRow} from './charts';
import styles from './admin.module.css';

const EMPTY='No water activity in this range yet. Counters arrive after the player leaves the tab, or every few minutes while they play; swimming TIME needs supabase/migrations/20261017_analytics_water.sql.';
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const rowsOf=(rows:CountRow[]):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}));
const value=(rows:CountRow[],id:string)=>rows.find(r=>r.id===id)?.value??0;

function CountCard({title,subtitle,rows,unit='times'}:{title:string;subtitle:string;rows:CountRow[];unit?:string}){
 const bars=rowsOf(rows),empty=bars.every(b=>!b.value&&!b.text);
 return <ChartCard title={title} subtitle={subtitle} empty={empty} emptyText={EMPTY}
  table={{columns:['Event',unit==='swims'?'Swims':'Count'],rows:rows.map(r=>[r.label,show(r.value)])}}>
  <BarList rows={bars} unit={unit} share={false} limit={bars.length}/>
 </ChartCard>;
}

export default function WaterSection({report}:{report:Report}){
 const rows=report.overview?.water??[];
 return <section className={styles.island} aria-labelledby="water-heading">
  <div className={styles.sectionHead}>
   <h2 id="water-heading">Water</h2>
   <p>Wading, swimming and splash-downs into the sea (Oct 2026). Time in the water is in “What they’re doing” above as
    “In the sea”; this is what players DID — totals only, never a beach, a position or a route.</p>
  </div>
  <div className={styles.startTiles} aria-label="Water headline">
   <div><span>Swims started</span><b>{show(value(rows,'wa:swim_start'))}</b><small>wading in past the waist, or surfacing after a splash</small></div>
   <div><span>First swim (devices)</span><b>{show(value(rows,'wa:first_swim'))}</b><small>{show(value(rows,'wa:first_wade'))} devices waded for the first time</small></div>
   <div><span>Back to shore</span><b>{show(value(rows,'wa:shore'))}</b><small>auto-swim to the nearest beach</small></div>
   <div><span>Idle at 20 fps</span><b>{show(value(rows,'wa:idle_cap'))}</b><small>treading water with no input for 4 s</small></div>
   <div><span>Swim lesson shown</span><b>{show(value(rows,'wa:lesson'))}</b><small>once per device</small></div>
   <div><span>Island friend rides</span><b>{show(value(rows,'wa:ride_manta')+value(rows,'wa:ride_whale'))}</b><small>{show(value(rows,'wa:ride_manta'))} manta · {show(value(rows,'wa:ride_whale'))} whale shark · {show(value(rows,'wa:ride_lap'))} full laps · {show(value(rows,'wa:ride_off'))} let go</small></div>
   <div><span>Dives</span><b>{show(value(rows,'wa:dive_start'))}</b><small>{show(value(rows,'wa:dive_surface'))} surfaced · {show(value(rows,'wa:dive_breath_out'))} breath ran out · {show(value(rows,'wa:dive_find'))} finds · {show(value(rows,'wa:dive_lesson'))} breath lessons</small></div>
   <div><span>Sharks circled</span><b>{show(value(rows,'wa:sharks_circle'))}</b><small>{show(value(rows,'wa:sharks_escape'))} escapes (shore, take-off or the sharks lost interest)</small></div>
  </div>
  <div className={styles.grid}>
   <CountCard title="Splash-downs" subtitle="Water landings by where they came from (a fall or cut parachute, a rooftop jump, a ride launch, the jetpack “Drop in”)" rows={rows.filter(r=>r.id.startsWith('wa:splash_'))}/>
   <CountCard title="Water actions" subtitle="Swim fast (hold), Float (toggle) and Back to shore" rows={rows.filter(r=>['wa:fast','wa:float','wa:shore'].includes(r.id))}/>
   <CountCard title="Time in a swim" subtitle="How long each swim lasted, bucketed (the swim ends when the feet are back on sand)" rows={rows.filter(r=>r.id.startsWith('wa:time_'))} unit="swims"/>
  </div>
 </section>;
}
