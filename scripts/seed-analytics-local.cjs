#!/usr/bin/env node
/*
 * Fills a local analytics file with FAKE sessions so the /admin dashboard can be previewed without Supabase.
 *   node scripts/seed-analytics-local.cjs <file.json> [days=35]
 *   ANALYTICS_LOCAL_FILE=<file.json> ADMIN_PASSWORD=<12+ chars> npx next start -p 8093
 * ANALYTICS_LOCAL_FILE is ignored on Vercel (lib/analytics/store.ts). Nothing here is real visitor data.
 */
'use strict';
const fs=require('fs'),crypto=require('crypto');
const file=process.argv[2];if(!file){console.error('usage: seed-analytics-local.cjs <file.json> [days]');process.exit(1);}
const DAYS=Number(process.argv[3]||35);
let seed=7;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
const pick=list=>{const total=list.reduce((a,[,w])=>a+w,0);let r=rnd()*total;for(const [v,w] of list){if((r-=w)<0)return v;}return list[0][0];};
const id=()=>crypto.randomBytes(16).toString('base64url').slice(0,22);
const countries=[[['US','CA'],22],[['US','TX'],12],[['US','NY'],9],[['GB','ENG'],16],[['GB','SCT'],3],[['CA','ON'],6],[['AU','NSW'],5],[['IE','D'],3],[['MX','CMX'],4],[['ES','MD'],3],[['DE','BE'],2],[['BR','SP'],3],[['JP','13'],2],[['NG','LA'],2],[[null,null],1]];
const sources=[[['direct',null,null],46],[['search','google.com',null],22],[['search','duckduckgo.com',null],3],[['search','bing.com',null],2],[['social','youtube.com',null],7],[['social','instagram.com',null],4],[['social','facebook.com',null],3],[['referral','myclubschool.org',null],4],[['referral','coachesforum.net',null],2],[['campaign',null,['newsletter','email','autumn-term']],5],[['campaign',null,['club-flyer','qr','u10-league']],3]];
const devices=[['phone',48],['tablet',30],['desktop',22]];
const entries=[['/',82],['/arcade',8],['/museum',5],['/konbini',2],['/controller',3]];
const lengths=[[[2,9],18],[[10,30],10],[[30,60],9],[[60,180],15],[[180,600],22],[[600,1800],19],[[1800,3600],5],[[3600,5400],2]];
const now=Date.now(),data={salts:{},starts:{},beats:[],rollups:{}};
for(let d=DAYS-1;d>=0;d--){
 const dayStart=Date.UTC(new Date(now).getUTCFullYear(),new Date(now).getUTCMonth(),new Date(now).getUTCDate())-d*86_400_000;
 const day=new Date(dayStart).toISOString().slice(0,10),dow=new Date(dayStart).getUTCDay();
 const base=(dow===0||dow===6?95:60)+Math.round((DAYS-d)*1.4);
 const n=Math.round(base*(0.8+rnd()*0.4)),visitors=[];
 for(let i=0;i<n;i++){
  const hour=pick([[7,2],[8,3],[9,2],[12,3],[15,6],[16,9],[17,10],[18,9],[19,8],[20,5],[21,2],[1,2],[3,1]]);
  const start=dayStart+hour*3_600_000+Math.floor(rnd()*3_600_000);if(start>now)continue;
  const hash=visitors.length&&rnd()<0.22?visitors[Math.floor(rnd()*visitors.length)]:crypto.randomBytes(16).toString('hex');visitors.push(hash);
  const [country,region]=pick(countries),[source,ref,utm]=pick(sources),[lo,hi]=pick(lengths);
  const engaged=Math.round((lo+rnd()*(hi-lo))*1000),entry=pick(entries);
  const pages=engaged<10_000?1:1+Math.floor(rnd()*Math.min(5,engaged/120_000));
  const sid=id(),areaMs={};let left=engaged;
  for(const [area,share] of [[entry==='/'?'island':entry.slice(1),0.55],['paths',0.15],['arcade',0.15],['museum',0.1],['konbini',0.05]]){const ms=Math.round(engaged*share*(0.6+rnd()*0.8));const v=Math.min(left,ms);if(v>0){areaMs[area==='controller'?'controller':area]=(areaMs[area]||0)+v;left-=v;}}
  if(left>0)areaMs.island=(areaMs.island||0)+left;
  data.starts[sid]={id:sid,day,visitorHash:hash,startedAt:new Date(start).toISOString(),entryPath:entry,
   country,region:country?region:null,device:pick(devices),source,referrerHost:ref,utmSource:utm?utm[0]:null,utmMedium:utm?utm[1]:null,utmCampaign:utm?utm[2]:null};
  // Beats as the tracker sends them: a safety beat every ~3 min, then the hide beat; page views ride along.
  let t=start,e=engaged,pv=pages-1;const share=Object.entries(areaMs);
  while(e>0){const step=Math.min(e,180_000);t+=step;if(t>now)break;const a={};for(const [k,v] of share)a[k]=Math.round(v*step/engaged);
   data.beats.push({sessionId:sid,ts:new Date(t).toISOString(),engagedMs:step,pageviews:pv,areaMs:a});pv=0;e-=step;}
 }
}
// A few tabs "on now".
for(let i=0;i<4;i++){const s=Object.values(data.starts).slice(-1-i)[0];if(s)data.beats.push({sessionId:s.id,ts:new Date(now-45_000*i).toISOString(),engagedMs:30_000,pageviews:0,areaMs:{island:30_000}});}
fs.writeFileSync(file,JSON.stringify(data));
console.log(`seeded ${Object.keys(data.starts).length} fake sessions over ${DAYS} days → ${file}`);
