'use client';
/**
 * "Fishing" (Oct 15 2026, the spin reel): what players do at the water, from report.overview.fishing (lib/analytics/overview.ts,
 * the fi: counters in lib/analytics/countIds.ts FISHING_COUNT_EVENTS, small-number suppressed like the rest of /admin) plus
 * fights per fishing session from report.fishing (lib/analytics/fishingAdminMetrics.ts, which needs
 * supabase/migrations/20261017_analytics_fishing.sql: a banner says so until it has run). Time spent fishing is already the
 * "fishing" activity in "Where on the island". Totals only: never which fish, which spot or a size.
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {CountRow} from '@/lib/analytics/overview';
import {FIGHT_BUCKETS,FISHING_MIGRATION,FISHING_OK_ROW} from '@/lib/analytics/fishingAdminMetrics';
import {BarList,ChartCard,fmtInt,type BarRow} from './charts';
import styles from './admin.module.css';

const EMPTY='No fishing in this range yet. A visit’s numbers arrive after the player leaves the tab, or every few minutes while they play.';
const show=(c:Cell|undefined)=>c===null?'<5':fmtInt(c??0);
const rowsOf=(rows:CountRow[]):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}));
/** The share of a over a+b as a percentage string, or "—" while either is suppressed or both are zero. */
function share(a:Cell|undefined,b:Cell|undefined){if(a===null||b===null||a===undefined||b===undefined||!(a+b))return '—';return `${Math.round(100*a/(a+b))}%`;}

function CountCard({title,subtitle,rows,unit='times'}:{title:string;subtitle:string;rows:CountRow[];unit?:string}){
 const bars=rowsOf(rows),empty=bars.every(b=>!b.value&&!b.text);
 return <ChartCard title={title} subtitle={subtitle} empty={empty} emptyText={EMPTY}
  table={{columns:['Event',unit==='fights'?'Fights':'Count'],rows:rows.map(r=>[r.label,show(r.value)])}}>
  <BarList rows={bars} unit={unit} share={false} limit={bars.length}/>
 </ChartCard>;
}

export default function FishingSection({report}:{report:Report}){
 const rows=report.overview?.fishing??[],f=report.fishing;
 const v=(id:string)=>rows.find(r=>r.id==='fi:'+id)?.value;
 const spin=v('hook_spin'),land=v('land'),escape=v('escape'),miss=v('miss'),stopped=v('run_stopped'),spun=v('run_spun');
 const lures=rows.filter(r=>r.id.startsWith('fi:lure_')),slips=rows.filter(r=>r.id.startsWith('fi:slips_')),runs=rows.filter(r=>r.id.startsWith('fi:run_')),rate=rows.filter(r=>r.id.startsWith('fi:spin_'));
 const island=rows.filter(r=>['fi:request','fi:clue','fi:legend','fi:book'].includes(r.id));
 const bucketRows:BarRow[]=f?.buckets?FIGHT_BUCKETS.map(k=>({key:k,label:`${k} fight${k==='1'?'':'s'}`,value:f.buckets![k]??0,text:f.buckets![k]===null?'<5':undefined})):[];
 return <section className={styles.island} aria-labelledby="fishing-heading">
  <div className={styles.sectionHead}>
   <h2 id="fishing-heading">Fishing</h2>
   <p>The spin reel (15 Oct 2026): fights started with the spin reel, how they ended, slips and runs (a run is
    the moment to stop spinning), the average spin rate, which football-technique lure is on, and the islander requests and
    Island Legends. Totals only, never a fish, a spot or a size. Time spent fishing is the “fishing” activity above.</p>
  </div>
  {f?.status==='needs-migration'&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="fishing-update">
   <h2 id="fishing-update">Fishing session metrics need a database update</h2>
   The fishing counters below already work; “fights per fishing session” needs one new function. In the Supabase SQL editor, paste the <b>whole</b> of <code>{FISHING_MIGRATION}</code> and
   run it. Its last result must be one row reading <code>{FISHING_OK_ROW}</code>; running the whole file again is safe.
  </section>}

  <div className={styles.startTiles} aria-label="Fishing fights">
   <div><span>Fights started</span><b>{show(spin)}</b><small>spin reel fights (the only reel now)</small></div>
   <div><span>Landed vs got away</span><b>{show(land)} · {show(escape)}</b><small>{share(land,escape)} landed after a hook · {show(miss)} bites missed</small></div>
   <div><span>Runs: stopped vs spun through</span><b>{show(stopped)} · {show(spun)}</b><small>{share(stopped,spun)} stopped spinning in time (the teaching moment)</small></div>
   <div><span>Fishbook opened</span><b>{show(v('book'))}</b><small>from the HUD’s bottom-left button</small></div>
   <div><span>Fishing sessions</span><b>{f?.status==='ok'?show(f.sessions):'—'}</b><small>{f?.status==='ok'?`${show(f.fights)} fights, ${show(f.landed)} landed · raw beats, last ${f.windowDays} days`:f?.status==='needs-migration'?'needs the fishing migration':f?.status==='not-configured'?'needs the analytics database':'could not be read'}</small></div>
  </div>

  <div className={styles.grid}>
   <CountCard title="Lure on the line" subtitle="Which football-technique lure players put on (Panenka, Knuckleball, Rabona, Nutmeg), or took off" rows={lures}/>
   <CountCard title="Slips per spin fight" subtitle="Fights that ended with 0, 1, 2 or 3+ slips (too much tension: back one notch, never lost)" rows={slips} unit="fights"/>
   <CountCard title="Runs" subtitle="Each run: did the player stop spinning and let it tire, or spin through it (a slip)?" rows={runs}/>
   <CountCard title="Average spin rate" subtitle="Per spin fight: slow (under 0.45 of a full spin), medium, or full (0.8 and over)" rows={rate} unit="fights"/>
   <ChartCard title="Fights per fishing session" subtitle={`Sessions by how many fights they started (raw beats, last ${f?.windowDays??14} days)`} empty={!bucketRows.some(b=>b.value||b.text)} emptyText={f?.status==='needs-migration'?`Run ${FISHING_MIGRATION} first.`:EMPTY}
    table={{columns:['Fights in the session','Sessions'],rows:bucketRows.map(r=>[r.label,r.text??r.value])}}>
    <BarList rows={bucketRows} unit="sessions" share={false} limit={bucketRows.length}/>
   </ChartCard>
   <CountCard title="Requests, legends and the Fishbook" subtitle="Islander requests finished, legend clues found, legends caught and released, Fishbook opens" rows={island}/>
  </div>
 </section>;
}
