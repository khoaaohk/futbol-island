'use client';
/**
 * "Fishing" (Oct 15 2026, the spin reel; the funnel Nov 6 2026): what players do at the water. The funnel and every counter come
 * from report.fishingFunnel (lib/analytics/fishingFunnel.ts: the fi: counters in lib/analytics/countIds.ts FISHING_COUNT_EVENTS,
 * EXACT counts, owner rule Nov 5 2026 "dont show <5, show exact"; report.overview.fishing is the fallback for an older report),
 * plus fights per fishing session from report.fishing (lib/analytics/fishingAdminMetrics.ts: supabase/migrations/
 * 20261106_analytics_fishing_sessions.sql, which also counts the sessions that never hooked a fish, or the Oct 17 summary; a banner
 * names the migration until it has run). Time spent fishing is already the "fishing" activity in "Where on the island". Totals only:
 * never which fish, which spot or a size.
 */
import type {Report} from '@/lib/analytics/core';
import type {FunnelStep} from '@/lib/analytics/fishingFunnel';
import {FIGHT_BUCKETS,FISHING_MIGRATION,FISHING_OK_ROW,FISHING_SESSIONS_MIGRATION,FISHING_SESSIONS_OK_ROW} from '@/lib/analytics/fishingAdminMetrics';
import {BarList,ChartCard,fmtInt,fmtPct,type BarRow} from './charts';
import styles from './admin.module.css';

const EMPTY='No fishing in this range yet. A visit’s numbers arrive after the player leaves the tab, or every few minutes while they play.';
type Row={id:string;label:string;value:number|null};
const show=(c:number|null|undefined)=>c===null?'<5':fmtInt(c??0);
const rowsOf=(rows:Row[]):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined}));
/** The share of a over a+b as a percentage string, or "—" while either is unknown or both are zero. */
function share(a:number|null|undefined,b:number|null|undefined){if(a===null||b===null||a===undefined||b===undefined||!(a+b))return '—';return `${Math.round(100*a/(a+b))}%`;}
/** Drop-off between two funnel steps (sessions): "−12 (40% drop)". */
const drop=(prev:FunnelStep|undefined,step:FunnelStep)=>!prev||!prev.sessions?'—':`−${fmtInt(Math.max(0,prev.sessions-step.sessions))} (${fmtPct(Math.max(0,1-step.sessions/prev.sessions))} drop)`;

function CountCard({title,subtitle,rows,unit='times'}:{title:string;subtitle:string;rows:Row[];unit?:string}){
 const bars=rowsOf(rows),empty=bars.every(b=>!b.value&&!b.text);
 return <ChartCard title={title} subtitle={subtitle} empty={empty} emptyText={EMPTY}
  table={{columns:['Event',unit==='fights'?'Fights':'Count'],rows:rows.map(r=>[r.label,show(r.value)])}}>
  <BarList rows={bars} unit={unit} share={false} limit={bars.length}/>
 </ChartCard>;
}

export default function FishingSection({report}:{report:Report}){
 const fn=report.fishingFunnel,f=report.fishing;
 const rows:Row[]=fn?.rows??report.overview?.fishing??[];
 const v=(id:string)=>rows.find(r=>r.id==='fi:'+id)?.value;
 const spin=v('hook_spin'),land=v('land'),escape=v('escape'),stopped=v('run_stopped'),spun=v('run_spun');
 const missEarly=v('miss_early'),missLate=v('miss_late'),missOld=v('miss');
 const lures=rows.filter(r=>r.id.startsWith('fi:lure_')),slips=rows.filter(r=>r.id.startsWith('fi:slips_')),runs=rows.filter(r=>r.id.startsWith('fi:run_')),rate=rows.filter(r=>r.id.startsWith('fi:spin_'));
 const rarity:Row[]=fn?.rarity??rows.filter(r=>/^fi:land_/.test(r.id));// short rarity words (they fit a phone)
 const island=rows.filter(r=>['fi:request','fi:clue','fi:legend','fi:book','fi:new_species','fi:basket_full','fi:sold'].includes(r.id));
 const misses=rows.filter(r=>['fi:miss_early','fi:miss_late','fi:miss'].includes(r.id));
 const tutorial=rows.filter(r=>['fi:tutorial_done','fi:tutorial_skip'].includes(r.id));
 const bucketRows:BarRow[]=f?.buckets?FIGHT_BUCKETS.filter(k=>k in f.buckets!).map(k=>({key:k,label:k==='0'?'Fished, never hooked':`${k} fight${k==='1'?'':'s'}`,value:f.buckets![k]??0})):[];// exact counts (fishingAdminMetrics num()): never null
 const steps=fn?.steps??[];
 return <section className={styles.island} aria-labelledby="fishing-heading">
  <div className={styles.sectionHead}>
   <h2 id="fishing-heading">Fishing</h2>
   <p>The funnel from tapping Fish to landing a catch, misses too early vs too late, what rarity players land, the spin-reel fight
    (slips, runs: the moment to stop spinning, spin rate), lures, the first-time tutorial and fish sold. Every number is exact.
    Totals only, never a fish, a spot or a size. Time spent fishing is the “fishing” activity above.</p>
  </div>
  {f?.status==='needs-migration'&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="fishing-update">
   <h2 id="fishing-update">Fishing session metrics need a database update</h2>
   The fishing counters below already work; “fights per fishing session” needs one new function. In the Supabase SQL editor, paste the <b>whole</b> of <code>{FISHING_MIGRATION}</code> and
   run it. Its last result must be one row reading <code>{FISHING_OK_ROW}</code>; running the whole file again is safe.
  </section>}
  {f?.status==='ok'&&f.sessionsStatus==='needs-migration'&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="fishing-sessions-update">
   <h2 id="fishing-sessions-update">Count the sessions that never hooked a fish</h2>
   “Fights per fishing session” only sees sessions that fought. To add the ones that tapped Fish or cast but never hooked anything, paste the <b>whole</b> of <code>{FISHING_SESSIONS_MIGRATION}</code> into the Supabase SQL editor and
   run it. Its last result must be one row reading <code>{FISHING_SESSIONS_OK_ROW}</code>; it only adds a function and is safe to run again.
  </section>}

  {fn&&fn.status!=='not_yet'&&<>
   {fn.partial&&<p className={styles.note}>The funnel counters started on {fn.since}: earlier days in this range have no “Fish tapped”, “Cast” or “Bite”.</p>}
   <div className={styles.fiFunnel} aria-label="Fishing funnel" data-fishing-funnel>
    {steps.map((s,i)=><FunnelBox key={s.id} step={s} prev={steps[i-1]}/>)}
   </div>
  </>}

  <div className={styles.startTiles} aria-label="Fishing outcomes">
   <div><span>Misses: too early vs too late</span><b>{show(missEarly)} · {show(missLate)}</b><small>{share(missLate,missEarly)} too late{missOld?` · ${show(missOld)} before the split`:''}</small></div>
   <div><span>Landed vs got away</span><b>{show(land)} · {show(escape)}</b><small>{share(land,escape)} landed after a hook · {show(spin)} fights started</small></div>
   <div><span>Runs: stopped vs spun through</span><b>{show(stopped)} · {show(spun)}</b><small>{share(stopped,spun)} stopped spinning in time (the teaching moment)</small></div>
   <div><span>Tutorial finished</span><b>{fn?.tutorial.rate==null?'—':fmtPct(fn.tutorial.rate)}</b><small>{show(v('tutorial_done'))} finished on the first catch · {show(v('tutorial_skip'))} skipped</small></div>
   <div><span>Basket full</span><b>{show(v('basket_full'))}</b><small>catches that found the basket full · {show(v('sold'))} fish sold</small></div>
   <div><span>Fishing sessions</span><b>{f?.status==='ok'?show(f.fished??f.sessions):'—'}</b><small>{f?.status==='ok'?`${f.neverHooked!=null?`${show(f.neverHooked)} never hooked a fish · `:''}${show(f.fights)} fights, ${show(f.landed)} landed · raw beats, last ${f.windowDays} days`:f?.status==='needs-migration'?'needs the fishing migration':f?.status==='not-configured'?'needs the analytics database':'could not be read'}</small></div>
  </div>

  <div className={styles.grid}>
   <CountCard title="Rarity mix" subtitle="Landings by rarity word (never the species or the spot)" rows={rarity}/>
   <CountCard title="Misses" subtitle="Bites missed: too early (tapped on a nibble: the reel reads Wait… now) or too late (the float went back up)" rows={misses}/>
   <CountCard title="Lure on the line" subtitle="Which football-technique lure players put on (Panenka, Knuckleball, Rabona, Nutmeg), or took off" rows={lures}/>
   <CountCard title="Slips per spin fight" subtitle="Fights that ended with 0, 1, 2 or 3+ slips (too much tension: back one notch, never lost)" rows={slips} unit="fights"/>
   <CountCard title="Runs" subtitle="Each run: did the player stop spinning and let it tire, or spin through it (a slip)?" rows={runs}/>
   <CountCard title="Average spin rate" subtitle="Per spin fight: slow (under 0.45 of a full spin), medium, or full (0.8 and over)" rows={rate} unit="fights"/>
   <ChartCard title="Fights per fishing session" subtitle={`Sessions by how many fights they started, including those that never hooked (raw beats, last ${f?.windowDays??14} days)`} empty={!bucketRows.some(b=>b.value||b.text)} emptyText={f?.status==='needs-migration'?`Run ${FISHING_SESSIONS_MIGRATION} first.`:EMPTY}
    table={{columns:['Fights in the session','Sessions'],rows:bucketRows.map(r=>[r.label,r.text??r.value])}}>
    <BarList rows={bucketRows} unit="sessions" share={false} limit={bucketRows.length}/>
   </ChartCard>
   <CountCard title="First-time tutorial" subtitle="Finished on the first catch’s “Got it”, or skipped" rows={tutorial}/>
   <CountCard title="Requests, legends, the Fishbook and selling" subtitle="Islander requests finished, legend clues, legends released, Fishbook opens, new species, basket full, fish sold" rows={island}/>
  </div>
 </section>;
}

function FunnelBox({step,prev}:{step:FunnelStep;prev?:FunnelStep}){
 return <>
  {prev&&<p className={styles.fiDrop}>{drop(prev,step)}</p>}
  <div data-k={step.id}><span>{step.label}</span><b>{fmtInt(step.sessions)}</b><small>sessions · {fmtInt(step.total)} in total{step.kept!==null?` · ${fmtPct(step.kept)} of the step before`:''}</small></div>
 </>;
}
