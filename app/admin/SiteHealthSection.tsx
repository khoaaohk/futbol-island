'use client';
/**
 * Site health on /admin's "Live now" tab (Nov 10 2026, security audit): the top 20 error beacons and CSP reports of the last
 * 7 days (GET /api/admin/site-health; daily counts only, lib/siteReports.ts) and the arcade boards with "Remove row" / "Restore"
 * (GET/POST /api/admin/board; soft delete, supabase/migrations/20261111_board_hidden_rows.sql). Loads once when the tab opens
 * and again on demand: no polling. Reuses the admin card, table and button styles.
 */
import {useCallback,useEffect,useState} from 'react';
import {BOARD_RULES,BOARD_TAB_ORDER,type BoardGame} from '@/lib/arcade/leaderboard';
import {fmtInt} from './charts';
import styles from './admin.module.css';

type Top={status:'ok'|'memory'|'needs-migration'|'error';rows:{key:string;label:string;n:number;last:string}[]};
type Health={days:number;err:Top;csp:Top};
type Row={id:number;initials:string;icon:string;score:number;day:string;hidden:boolean};
type Board={ok:boolean;game:string;hidable:boolean;rows:Row[]};

const statusNote=(s:Top['status'])=>s==='needs-migration'?'Needs supabase/migrations/20261111_site_reports.sql: showing this server instance only.':s==='memory'?'No database here: this server instance only.':s==='error'?'The database did not answer.':null;

function TopTable({title,sub,top,cols}:{title:string;sub:string;top:Top|null;cols:[string,(r:Top['rows'][number])=>string][]}){
 const note=top?statusNote(top.status):null;
 return <div className={styles.card}>
  <div className={styles.cardHead}><div><h2>{title}</h2><p>{sub}</p></div></div>
  {note&&<p className={styles.note}>{note}</p>}
  {!top?<p className={styles.note}>Loading…</p>:!top.rows.length?<p className={styles.note}>Nothing reported in this period.</p>:
   <div className={styles.tableScroll}><table className={styles.table}>
    <thead><tr>{cols.map(([h])=><th key={h} scope="col">{h}</th>)}<th scope="col">Count</th><th scope="col">Last day</th></tr></thead>
    <tbody>{top.rows.map(r=><tr key={r.key}>{cols.map(([h,f])=><td key={h} style={{textAlign:'left',wordBreak:'break-word'}}>{f(r)}</td>)}<td>{fmtInt(r.n)}</td><td>{r.last}</td></tr>)}</tbody>
   </table></div>}
 </div>;
}

export default function SiteHealthSection(){
 const [health,setHealth]=useState<Health|null>(null),[game,setGame]=useState<BoardGame>('runner'),[board,setBoard]=useState<Board|null>(null),[msg,setMsg]=useState('');
 const loadHealth=useCallback(()=>{fetch('/api/admin/site-health?days=7',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(setHealth).catch(()=>setHealth(null));},[]);
 const loadBoard=useCallback((g:BoardGame)=>{setBoard(null);fetch('/api/admin/board?game='+g,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(setBoard).catch(()=>setBoard(null));},[]);
 useEffect(loadHealth,[loadHealth]);
 useEffect(()=>loadBoard(game),[game,loadBoard]);
 const hide=async(r:Row)=>{
  if(!r.hidden&&!window.confirm(`Remove ${r.initials} (${fmtInt(r.score)}) from ${BOARD_RULES[game].name}? It can be restored until the nightly clean-up.`))return;
  const res=await fetch('/api/admin/board',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:r.id,hidden:!r.hidden})}).catch(()=>null);
  const b=res?await res.json().catch(()=>null):null;
  setMsg(res?.status===409?'Run supabase/migrations/20261111_board_hidden_rows.sql first.':b?.ok?(r.hidden?'Row restored.':'Row removed from the board.'):'That did not work. Try again.');
  if(b?.ok)loadBoard(game);
 };
 const logoutAll=async()=>{if(!window.confirm('Sign out every /admin session on every device, including this one?'))return;
  const r=await fetch('/api/admin/signout-all',{method:'POST'}).catch(()=>null);
  if(r?.status===409){setMsg('Run supabase/migrations/20261111_admin_session_epoch.sql first.');return;}
  if(!r?.ok){setMsg('Signing out everywhere did not work. Try again.');return;}window.location.reload();};
 const [route,file]=[(r:Top['rows'][number])=>r.key.split('|')[1]??'',(r:Top['rows'][number])=>r.label];
 return <section className={styles.island} aria-labelledby="sec-health-site">
  <div className={styles.sectionHead}><h2 id="sec-health-site">Site health and arcade boards</h2>
   <p>Errors and blocked loads from the last 7 days, counted per kind of problem and page (no addresses, no browsers, no players). Below: remove a faked score from an island board.</p></div>
  <TopTable title="Top errors" sub="From the in-game error beacon (at most 3 a tab)." top={health?.err??null} cols={[['Error and where',file],['Page',route]]}/>
  <TopTable title="Content-Security-Policy reports" sub="Report-only: nothing is blocked yet. A new host here may need adding to the policy." top={health?.csp??null}
   cols={[['Directive',r=>r.key.split('|')[0]],['Blocked',r=>r.key.split('|')[1]??''],['Page',r=>r.key.split('|')[2]??'']]}/>
  <div className={styles.card}>
   <div className={styles.cardHead}><div><h2>Arcade boards</h2><p>The best 30 rows. A removed row is hidden from the board and from ranking at once.</p></div>
    <label style={{display:'grid',gap:4,fontSize:13}}>Board
     <select value={game} onChange={e=>setGame(e.target.value as BoardGame)} style={{minHeight:40,fontSize:15}}>
      {BOARD_TAB_ORDER.map(g=><option key={g} value={g}>{BOARD_RULES[g].name}</option>)}</select></label></div>
   {msg&&<p className={styles.note} role="status">{msg}</p>}
   {board&&!board.hidable&&<p className={styles.note}>Removing needs supabase/migrations/20261111_board_hidden_rows.sql (the list below is the current top 10).</p>}
   {!board?<p className={styles.note}>Loading…</p>:!board.rows.length?<p className={styles.note}>No rows on this board.</p>:
    <div className={styles.tableScroll}><table className={styles.table}>
     <thead><tr><th scope="col">Letters</th><th scope="col">Score</th><th scope="col">Day</th><th scope="col" aria-label="Action"/></tr></thead>
     <tbody>{board.rows.map(r=><tr key={r.id} style={r.hidden?{opacity:.55}:undefined}>
      <td>{r.initials}{r.hidden?' (removed)':''}</td><td>{fmtInt(r.score)}</td><td>{r.day}</td>
      <td><button type="button" className={styles.tableToggle} disabled={!board.hidable} onClick={()=>hide(r)}>{r.hidden?'Restore':'Remove row'}</button></td></tr>)}</tbody>
    </table></div>}
  </div>
  <div className={styles.card}>
   <div className={styles.cardHead}><div><h2>Admin sessions</h2><p>Signs out every /admin session on every device, this one included (within 15 seconds on every server).</p></div>
    <button type="button" className={styles.secondary} onClick={logoutAll}>Sign out everywhere</button></div>
  </div>
 </section>;
}
