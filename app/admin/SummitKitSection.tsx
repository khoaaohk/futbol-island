'use client';
/**
 * "Kit Shop, Sandbar & Summit Isle" (Oct 15 2026): the three newest areas. Time there already shows in "Where they spend
 * time" (the Kit Shop's own area, AnalyticsDashboard.tsx) and "Where on the island" (the Sandbar and Summit Isle places,
 * IslandSection.tsx) once supabase/migrations/20261015_analytics_summit_kit.sql has run; this section is everything else:
 * discrete actions, from report.overview (lib/analytics/overview.ts, small-number suppressed like the rest of /admin) plus
 * Summit Kick's plays and best score, read straight off the public arcade leaderboard (report.summitKick,
 * lib/arcade/kickAdminMetrics.ts — no new migration needed for that one).
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {CountRow} from '@/lib/analytics/overview';
import {BarList,ChartCard,fmtInt,type BarRow} from './charts';
import styles from './admin.module.css';

/** The Summit Isle pastimes shown together (lib/analytics/countIds.ts SUMMIT_COUNT_EVENTS); the rest have their own tile or card. */
const SUMMIT_FUN=['su:ball_find','su:easel_open','su:easel_save','su:cannon_sit','su:cannon_hit','su:bug_catch','su:bug_squad','su:firefly_catch','su:firefly_shift','su:bugbook_open','su:bugbook_complete','su:wild_flutter'];
const EMPTY='No activity in this range yet. It starts once supabase/migrations/20261015_analytics_summit_kit.sql has run, and a visit’s numbers arrive after the player leaves the tab, or every few minutes while they play.';
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const rowsOf=(rows:CountRow[]):BarRow[]=>rows.map(r=>({key:r.id,label:r.label,value:r.value??0,text:r.value===null?'<5':undefined,detail:r.value===null?'fewer than 5 sessions':undefined}));

function CountCard({title,subtitle,rows,unit='times'}:{title:string;subtitle:string;rows:CountRow[];unit?:string}){
 const bars=rowsOf(rows),empty=bars.every(b=>!b.value&&!b.text);
 return <ChartCard title={title} subtitle={subtitle} empty={empty} emptyText={EMPTY}
  table={{columns:['Event',unit==='coins'?'Coins':'Count'],rows:rows.map(r=>[r.label,show(r.value)])}}>
  <BarList rows={bars} unit={unit} share={false} limit={bars.length}/>
 </ChartCard>;
}

export default function SummitKitSection({report}:{report:Report}){
 const o=report.overview,k=report.summitKick;
 const shopRows=o?.shop??[],sandbarRows=o?.sandbar??[],summitRows=o?.summit??[],beachRows=o?.beach??[],fruit=o?.fruit??[];
 const spend=shopRows.find(r=>r.id==='sh:spend'),kioskCoin=summitRows.find(r=>r.id==='su:kiosk_coin');
 const fruitRows:BarRow[]=fruit.flatMap(f=>[{key:f.kind+':hand',label:`${f.label} (by hand)`,value:f.hand??0,text:f.hand===null?'<5':undefined},
  {key:f.kind+':ball',label:`${f.label} (kicked ball)`,value:f.ball??0,text:f.ball===null?'<5':undefined}]);
 const fruitEmpty=fruitRows.every(r=>!r.value&&!r.text);
 return <section className={styles.island} aria-labelledby="summit-kit-heading">
  <div className={styles.sectionHead}>
   <h2 id="summit-kit-heading">Kit Shop, Sandbar &amp; Summit Isle</h2>
   <p>The newest areas. Time spent there is in “Where they spend time” (Kit Shop) and “Where on the island” (the Sandbar and
    Summit Isle) above; this is what players DID there — totals only, never a design, a route or which item.</p>
  </div>

  <div className={styles.startTiles} aria-label="Summit Kick">
   <div><span>Summit Kick rounds played</span><b>{show(summitRows.find(r=>r.id==='su:kick_play')?.value??0)}</b><small>rounds started</small></div>
   <div><span>Summit Kick best score</span><b>{k?.status==='ok'&&k.best!==null?fmtInt(k.best):'—'}</b><small>{k?.status==='ok'?`of ${k.plays!==null?fmtInt(k.plays):'—'} plays on the public board, this range`:k?.status==='not-configured'?'needs the arcade leaderboard migrations':'could not be read'}</small></div>
   <div><span>Zipline rides</span><b>{show(summitRows.find(r=>r.id==='su:zipline_ride')?.value??0)}</b><small>Summit Isle → Coral Cay Hostel roof</small></div>
   <div><span>Sandbar crossed</span><b>{show(sandbarRows.find(r=>r.id==='sb:cross')?.value??0)}</b><small>walking or riding across</small></div>
   <div><span>Arrived on Summit Isle</span><b>{show(summitRows.find(r=>r.id==='su:arrive_walk')?.value??0)} Sandbar · {show(summitRows.find(r=>r.id==='su:arrive_fly')?.value??0)} flying</b><small>on foot/riding vs jetpack or parachute</small></div>
  </div>

  <div className={styles.grid}>
   <CountCard title="Kit Shop" subtitle="Studio opens, designs saved, purchases and My kit opens" rows={shopRows.filter(r=>r.id!=='sh:spend')}/>
   <ChartCard title="Kit Shop coins spent" subtitle="Coins charged on real purchases (not re-picking an owned design)" empty={!spend||!spend.value} emptyText={EMPTY}
    table={{columns:['Coins spent'],rows:[[show(spend?.value??0)]]}}>
    <p className={styles.note}><b>{show(spend?.value??0)}</b> coins spent in the Kit Shop in this range.</p>
   </ChartCard>
   <CountCard title="Summit kiosk" subtitle="Purchases at the summit vending machine" rows={summitRows.filter(r=>r.id==='su:kiosk_buy')}/>
   <ChartCard title="Summit kiosk coins spent" subtitle="Coins charged at the summit kiosk" empty={!kioskCoin||!kioskCoin.value} emptyText={EMPTY}
    table={{columns:['Coins spent'],rows:[[show(kioskCoin?.value??0)]]}}>
    <p className={styles.note}><b>{show(kioskCoin?.value??0)}</b> coins spent at the summit kiosk in this range.</p>
   </ChartCard>
   <CountCard title="Summit Isle fishing" subtitle="Catches at Boulder Cove, Palm Point, Lookout Rocks and Drop-off Ledge" rows={summitRows.filter(r=>r.id.startsWith('su:fish_'))}/>
   <ChartCard wide title="Fruit shaken" subtitle="By kind, by hand or by a kicked ball (lib/graphics/fruitTrees.ts)" empty={fruitEmpty} emptyText={EMPTY}
    table={{columns:['Fruit · method','Count'],rows:fruitRows.map(r=>[r.label,r.text??r.value])}}>
    <BarList rows={fruitRows} unit="times shaken" share={false} limit={fruitRows.length}/>
   </ChartCard>
   <CountCard title="Summit Isle hidden balls, easel, cannon and bugs" subtitle="Hidden balls found on Summit Isle, the painting easel (sat down, saved), the Ball Cannon (sat down, discs knocked out) and the bug jobs (Bug squad by day, Firefly floodlights at night: catches and finished shifts)"
    rows={summitRows.filter(r=>SUMMIT_FUN.includes(r.id))}/>
   <CountCard title="Beach finds picked up" subtitle="Beachcombing by island (totals only, never which find or where)" rows={beachRows}/>
  </div>
 </section>;
}
