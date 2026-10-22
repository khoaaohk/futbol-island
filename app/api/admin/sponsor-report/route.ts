import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadPlayers} from '@/lib/analytics/dayAdmin';
import {addDays,pacificDay} from '@/lib/analytics/day';
import {loadSources} from '@/lib/analytics/liveAdmin';
import {loadRangeMerged} from '@/lib/analytics/report';
import {getStore} from '@/lib/analytics/store';
import {loadRelayStats} from '@/lib/analytics/relayStatsAdmin';
import {buildSponsorWeekly,isoWeekOf,validWeek,weekRange} from '@/lib/analytics/sponsorReport';
import {sponsorLabels} from '@/lib/analytics/sponsorLabels';

/**
 * GET /api/admin/sponsor-report?week=YYYY-Www: the weekly Sponsor report (app/admin/SponsorReport.tsx; lib/analytics/sponsorReport.ts).
 * Admin session only. Combined totals only, groups under 10 withheld and reach rounded on the server: the player list behind the
 * reach number never leaves this route (only its size). Internal draft until the privacy policy wording is approved.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,raw=q.get('week'),now=new Date(),today=pacificDay(now.getTime());
 const week=raw===null||raw===''?isoWeekOf(today):raw;
 if(!validWeek(week))return Response.json({error:'week'},{status:400,headers});
 const r=weekRange(week)!,p=weekRange(isoWeekOf(addDays(r.from,-7)))!,oldestRaw=addDays(today,-13);
 try{
  const store=getStore();
  const [cur,prev]=await Promise.all([loadRangeMerged(store,r.from,r.to,now),loadRangeMerged(store,p.from,p.to,now)]);
  // Reach and return rate come from the raw rows (14 days): only for a week that starts inside them.
  const count=async(from:string,to:string)=>{if(from<oldestRaw)return null;const pl=await loadPlayers(from,to);return pl.status==='ok'?pl.players:null;};
  const [players,prevPlayers]=await Promise.all([count(r.from,r.to),count(p.from,p.to)]);
  let returning:{share:number|null;sessions:number}|null=null;
  if(r.from>=oldestRaw){const s=await loadSources(r.from,r.to);const rt=s.returning;
   if(s.status==='ok'&&rt.new!==null&&rt.returning!==null){const n=rt.new+rt.returning;returning={share:n?rt.returning/n:null,sessions:n};}}
  const relay=await loadRelayStats(r.from,r.to);
  return Response.json(buildSponsorWeekly({week,now,merged:cur.merged,prev:prev.merged,players,prevPlayers,returning,
   relay:relay.status==='ok'?relay.totals:null,emoteLabel:sponsorLabels.emote}),{headers});
 }catch{return Response.json({error:'store-unavailable'},{status:502,headers});}
}
