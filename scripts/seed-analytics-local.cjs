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
const countries=[[['US','CA'],22],[['US','TX'],12],[['US','NY'],9],[['US','FL'],6],[['US','WA'],4],[['US','IL'],3],[['US','MA'],2],[['US','CO'],2],[['CA','BC'],3],[['CA','QC'],2],[['GB','WLS'],2],[['AU','VIC'],3],[['GB','ENG'],16],[['GB','SCT'],3],[['CA','ON'],6],[['AU','NSW'],5],[['IE','D'],3],[['MX','CMX'],4],[['ES','MD'],3],[['DE','BE'],2],[['BR','SP'],3],[['JP','13'],2],[['NG','LA'],2],[[null,null],1]];
const sources=[[['direct',null,null],46],[['search','google.com',null],22],[['search','duckduckgo.com',null],3],[['search','bing.com',null],2],[['social','youtube.com',null],7],[['social','instagram.com',null],4],[['social','facebook.com',null],3],[['referral','myclubschool.org',null],4],[['referral','coachesforum.net',null],2],[['campaign',null,['newsletter','email','autumn-term']],5],[['campaign',null,['club-flyer','qr','u10-league']],3]];
const devices=[['phone',48],['tablet',30],['desktop',22]];
// The title screen is at `/` since Oct 9 2026 (/start was removed): about a third of `/` entries are title-screen sessions.
const entries=[['/',122],['/arcade',8],['/museum',5],['/konbini',2],['/controller',3]];
const lengths=[[[2,9],18],[[10,30],10],[[30,60],9],[[60,180],15],[[180,600],22],[[600,1800],19],[[1800,3600],5],[[3600,5400],2]];
const now=Date.now(),data={salts:{},starts:{},beats:[],rollups:{}};
// Learning (Oct 9 2026): FAKE lesson funnels, first-try answers, walkthrough steps, Paths, warm-ups and start flags, using the
// real lesson ids and question/option counts (so the dashboard can show real question text). Nothing here is real player data.
const LESSONS=[];for(const f of ['7v7','9v9','11v11','futsal'])JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','public/lessons',f+'.json'),'utf8')).forEach((l,i)=>LESSONS.push({f,id:l.id,i,qs:l.questions.map(q=>({n:q.options.length,c:q.correct}))}));
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
const STEPS=['welcome','paths','balls','earn','learn'];
function learningCounts(){
 const k={},add=(id,n=1)=>{k[id]=(k[id]||0)+n;};
 if(rnd()<0.22){let at=0;for(;at<STEPS.length;at++){add('ob:seen:'+STEPS[at]);if(rnd()<[0.18,0.12,0.1,0.08,0.05][at]){add('ob:skip:'+STEPS[at]);break;}}if(at===STEPS.length){add('ob:explore');if(rnd()<0.55)add('ob:lesson');}}
 const nLessons=rnd()<0.45?0:1+Math.floor(rnd()*3);
 for(let j=0;j<nLessons;j++){
  const f=pick([['7v7',40],['9v9',22],['11v11',18],['futsal',20]]),pool=LESSONS.filter(l=>l.f===f),l=pool[Math.min(pool.length-1,Math.floor(Math.pow(rnd(),1.8)*pool.length))];
  if(rnd()<0.5)add('pf:'+f);add('lo:'+l.id);const ease=0.45+(hash(l.id)%40)/100;
  if(rnd()>0.35+(hash(l.id)%25)/100)continue;add('le:'+l.id);if(rnd()<0.25)continue;add('ls:'+l.id);
  let clean=true,quit=false;l.qs.forEach((q,qi)=>{if(quit)return;const p=Math.min(0.97,Math.max(0.12,ease+((hash(l.id+qi)%60)-30)/100));add(`q:${l.id}:${qi}`);
   let o=q.c;if(rnd()>p){clean=false;const w=Array.from({length:q.n},(_,i)=>[i,i===q.c?0:1+(hash(l.id+qi+i)%5)*(hash(l.id+qi+i)%3)]).filter(([,x])=>x>0);o=w.length?pick(w):q.c;}add(`o:${l.id}:${qi}:${o}`);if(rnd()<0.04)quit=true;});
  if(!quit){add('lf:'+l.id);if(clean)add('la:'+l.id);}
 }
 if(rnd()<0.12){const n=1+Math.floor(rnd()*3);add('rv:q',n);const ok=Math.floor(n*(0.5+rnd()*0.5));if(ok)add('rv:ok',ok);if(rnd()<0.8)add('rv:done');}
 if(rnd()<0.02)add('gr:'+pick([['7v7',5],['9v9',2],['11v11',1],['futsal',2]]));if(rnd()<0.003)add('gr:finale');
 return k;
}
// Start page (Oct 9 2026): FAKE title-screen taps (lib/analytics/startIds.ts) for sessions that saw /start.
function startCounts(k){
 const add=id=>{k[id]=(k[id]||0)+1;},p=x=>rnd()<x;add('st:view');
 if(p(0.6)){add('st:start');if(p(0.9)){add('st:created');if(p(0.85)){add('st:word');if(p(0.78))add('st:word_ok');}if(p(0.8)){add('st:saved');if(p(0.93))add('st:play_ready');}}}
 else if(p(0.4)){add('st:have');if(p(0.3))add('st:restore_fail');if(p(0.7)){add('st:restored');if(p(0.95))add('st:play_restored');}}
 else if(p(0.6)){add('st:returning');if(p(0.9))add('st:play_returning');else if(p(0.5))add('st:other_code');}
 else{add('st:break');if(p(0.85))add('st:play_break');}
 if(p(0.05))add('st:tilt');
 if(p(0.16)){add('sg:open');for(const [id,x] of [['wsv',0.18],['instagram',0.12],['fc_yap',0.08],['street_soccer_san_diego',0.07],['ronin_futsal',0.06],['privacy',0.1]])if(p(x))add('sg:'+id);
  if(p(0.3)){add('sg:donate');if(p(0.7)){add('sg:gate_ok');if(p(0.5)){add('sg:amt_'+pick([[5,4],[10,5],[15,2],[25,2]]));if(p(0.45))add('sg:paid');}}else add('sg:gate_no');}}
 if(p(0.07)||k['sg:privacy']){if(!k['sg:privacy'])add('sp:open');for(const [id,x] of [['short',0.4],['codes',0.25],['visits',0.3],['retention',0.15],['rights',0.12],['contact',0.08],['never',0.1]])if(p(x))add('sp:'+id);}
 return k;
}
const startFlags=()=>({p:pick([[0,45],[1,28],[2,18],[3,9]]),g:pick([[0,80],[1,12],[2,5],[3,2],[4,1]]),s:(rnd()<0.18?1:0)|(rnd()<0.35?2:0)|(rnd()<0.14?4:0)|(rnd()<0.06?8:0),v:pick([[0,62],[1,16],[2,14],[3,8]])});
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
   country,region:country?region:null,device:pick(devices),source,referrerHost:ref,utmSource:utm?utm[0]:null,utmMedium:utm?utm[1]:null,utmCampaign:utm?utm[2]:null,flags:startFlags()};
  const lc=learningCounts();if((entry==='/'&&rnd()<0.33)||rnd()<0.05)startCounts(lc);
  // Where on the island (Oct 8 2026): FAKE place / activity / heat-map splits for the island share of each beat.
const GRID={x0:-160,z0:-320,size:20,cols:52,rows:31};
const SPOTS=[['island_square',85,-35,18,14],['arcade',103,-48,6,6],['konbini',71,-55,6,5],['field_11v11',135,100,28,13],['field_7v7',11,-80,16,8],['field_9v9',160,-110,20,7],
 ['field_futsal',11,18,9,5],['east_jetty',330,75,22,7],['farmers_market',228,60,10,6],['north_beach',60,-215,60,6],['coaches',160,-30,12,4],['school',120,160,30,4],
 ['palm_coast',20,70,25,4],['old_town',-20,-110,20,4],['causeway',380,-160,80,6],['sandbars',342,-222,10,2],['cay_town',560,-160,25,6],['beach_court',680,-161,15,7],
 ['farm',640,-110,25,4],['sharks_beach',660,-210,15,3],['hostel',560,-108,12,2],['deep_sea_boat',283,-92,6,3],['south_pier',110,200,40,4],['ferry_dock',225,200,10,2],
 ['community_hall',181,-177,8,2],['library_square',80,-110,12,2],['town',150,-60,60,5],['sea',300,0,60,2],['coral_cay',650,-150,40,2],['west_side',-60,70,20,2],
 ['club_grounds',150,-150,30,2],['community_garden',205,0,15,2],['museum',160,186,6,3],['cay_konbini',524,-176,5,1],['community_park',10,-45,15,1]];
const ACTS=[['walk',30],['ride',14],['fly',10],['fishing',7],['job',5],['lesson',5],['watch',4],['quiz',3],['vending',3],['book',2],['cards',2],['films',2],['talk',2],['menu',6],['paths',3],['boat',1],['coaches',1],['idle',8]];
const gauss=()=>(rnd()+rnd()+rnd()-1.5)/1.5;
function islandSplit(ms){
 const pl={},ac={},c={};if(ms<1000)return {pl,ac,c};
 const n=1+Math.floor(rnd()*3),picks=[];for(let i=0;i<n;i++)picks.push(pick(SPOTS.map(s=>[s,s[4]])));
 let idle=0;for(const [a] of [[pick(ACTS)],[pick(ACTS)]]){const v=Math.round(ms*(.3+rnd()*.3));if(a==='idle')idle+=v;ac[a]=(ac[a]||0)+v;}
 const actSum=Object.values(ac).reduce((x,y)=>x+y,0);if(actSum<ms)ac.walk=(ac.walk||0)+ms-actSum;else{const k=ms/actSum;for(const a in ac)ac[a]=Math.floor(ac[a]*k);idle=Math.floor(idle*k);}
 const play=ms-idle;let left=play;
 picks.forEach((s,i)=>{const v=i===picks.length-1?left:Math.round(play/picks.length);left-=v;if(v<=0)return;pl[s[0]]=(pl[s[0]]||0)+v;
  let secs=Math.floor(v/1000);const k=1+Math.floor(rnd()*3);for(let j=0;j<k&&secs>0;j++){const x=s[1]+gauss()*s[3],z=s[2]+gauss()*s[3]*.7;
   const col=Math.floor((x-GRID.x0)/GRID.size),row=Math.floor((z-GRID.z0)/GRID.size);if(col<0||row<0||col>=GRID.cols||row>=GRID.rows)continue;const cell=row*GRID.cols+col,t=j===k-1?secs:Math.floor(secs/k);secs-=t;if(t>0)c[cell]=(c[cell]||0)+t;}});
 return {pl,ac,c};
}
// Beats as the tracker sends them: a safety beat every ~3 min, then the hide beat; page views ride along.
  let t=start,e=engaged,pv=pages-1;const share=Object.entries(areaMs);
  while(e>0){const step=Math.min(e,180_000);t+=step;if(t>now)break;const a={};for(const [k,v] of share)a[k]=Math.round(v*step/engaged);
   const sp=islandSplit(a.island||0);
   data.beats.push({sessionId:sid,ts:new Date(t).toISOString(),engagedMs:step,pageviews:pv,areaMs:a,placeMs:sp.pl,activityMs:sp.ac,cells:sp.c,counts:e<=180_000?lc:{}});pv=0;e-=step;}
 }
}
// A few tabs "on now".
for(let i=0;i<4;i++){const s=Object.values(data.starts).slice(-1-i)[0];if(s)data.beats.push({sessionId:s.id,ts:new Date(now-45_000*i).toISOString(),engagedMs:30_000,pageviews:0,areaMs:{island:30_000}});}
fs.writeFileSync(file,JSON.stringify(data));
console.log(`seeded ${Object.keys(data.starts).length} fake sessions over ${DAYS} days → ${file}`);
