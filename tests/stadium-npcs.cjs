// DRIP FC Stadium islanders (Nov 13 2026, lib/town/stadiumNpcs.ts, lib/graphics/stadiumMedia.ts): greeters, guides, fans, coaches,
// score fans, the broadcast crew, photographers and public viewing. Counts per heat tier; every NPC has a football concept and
// lines; every walking leg is on paving, off the pitch and clear of props; fixed spots never take a seat or a stair; score
// lines come only from verified news data with a fallback; nothing new fetches. usage: node tests/stadium-npcs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false}),location:{search:""}},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.join(base,f),'utf8');
const N=load('lib/town/stadiumNpcs.ts'),L=load('lib/town/westParkLayout.ts'),Q=load('lib/town/stadiumSeats.ts'),sim=load('lib/town/simulation.ts'),V=load('lib/town/venues.ts');
const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts'),{STADIUM:S}=L;
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const cast=N.STADIUM_NPCS,ids=cast.map(n=>n.id),info=N.STADIUM_NPC_INFO;
// 1. The cast: in NPC_DIALOGUES (the shared runtime builds them), unique, one entry in STADIUM_NPC_INFO each, ranks 0..n-1.
assert.equal(cast.length,30,'30 stadium islanders');
for(const n of cast)assert(NPC_DIALOGUES.includes(n),n.id+' is an islander');
assert.deepEqual(Object.keys(info).sort(),[...ids].sort(),'every islander has place + concept, nothing extra');
assert.deepEqual(cast.map(n=>n.heatRank).sort((a,b)=>a-b),cast.map((_,i)=>i),'heat ranks 0..n-1');
const groups={};for(const id of ids)groups[info[id].group]=(groups[info[id].group]||0)+1;
assert(groups.greeter>=2&&groups.guide>=2&&groups.score>=3&&groups.coach>=3&&groups.crew===4&&groups.photographer>=2&&groups.photographer<=4&&groups.viewer>=1&&groups.mascot===1&&groups.bench===4&&groups.official===3,'groups '+JSON.stringify(groups));
// 2. Counts per tier: desktop 22 / phone 13 at tier 0, fewer on every hotter tier, phones never above desktop; first ranks keep a greeter, a guide, a score fan and a coach.
const tiers=[0,1,2,3,4],cap=(p,t)=>N.stadiumNpcBudget(p,t);
assert.equal(cap(false,0),30);assert.equal(cap(true,0),16);assert.equal(cap(false,4),4);
for(const p of [false,true])for(const t of tiers){assert(cap(p,t)<=cast.length&&(t===0||cap(p,t)<=cap(p,t-1)),'budget falls with heat');assert(cap(true,t)<=cap(false,t),'phone <= desktop');
 assert(N.viewingExtras(p,t)<=N.VIEWING_EXTRAS.length&&(t===0||N.viewingExtras(p,t)<=N.viewingExtras(p,t-1))&&N.viewingExtras(true,t)<=N.viewingExtras(false,t),'viewing extras fall with heat');}
assert.equal(N.viewingExtras(false,4),0,'no viewing extras on Battery saver');
const first=k=>cast.filter(n=>n.heatRank<k).map(n=>info[n.id].group);
for(const g of ['greeter','guide','score','coach','mascot'])assert(first(6).includes(g),'the first six (tier 3) keep a '+g);
const table=tiers.map(t=>`t${t} ${cap(false,t)}+${N.viewingExtras(false,t)}/${cap(true,t)}+${N.viewingExtras(true,t)}`).join(', ');
// 3. Football concept and lines: a concept, a greeting, 3+ openers, 1+ topics with a follow-up, short phone-friendly text, kid-safe.
const BANNED=/\b(bet|betting|beer|stupid|dumb|hate|kill|idiot)\b/i;
for(const n of cast){const c=info[n.id];assert(c.concept.length>=4&&c.place.length>2,n.id+' concept');
 assert(n.greeting.length<=140&&/stadium|match|screen|pitch|score|goal|camera|photo|ball|team|trail|press|call|corner|keeper|line|back line|tour|commentary|result|league|walk|run|lens|news|scor|mascot|coach|referee|official|board|flag|signal/i.test(n.greeting),n.id+' greeting is short and about football: '+n.greeting);
 assert(n.lines.length>=3&&n.lines.every(l=>l.length<=60),n.id+' 3+ short openers');
 assert(n.topics.length>=1&&n.topics.every(t=>t.question&&t.answer.length<=260&&t.followUp&&t.followUp.answer.length<=260),n.id+' topics with follow-ups');
 for(const s of [n.greeting,...n.lines,...n.topics.flatMap(t=>[t.question,t.answer,t.followUp.question,t.followUp.answer])])assert(!BANNED.test(s),n.id+' kid-safe: '+s);}
assert(cast.some(n=>/Welcome to DRIP FC Stadium/.test(n.greeting)),'a greeter says Welcome to DRIP FC Stadium');
// 4. Routes: every leg sampled every 0.25 m is on park paving (plaza, apron, ring, trails), off the pitch (+2 m), not in the bowl
//    except the gate mouth's apron, clear of every prop and stand piece (sim.blocked, 0.32 m) and on even ground.
const pitch=(x,z,m)=>Math.abs(x-S.x)<S.pitchW/2+m&&Math.abs(z-S.z)<S.pitchL/2+m;
let legs=0;
for(const [id,route] of Object.entries(N.STADIUM_NPC_ROUTES)){assert(ids.includes(id),id+' route belongs to a stadium islander');
 const pts=route.length>1?[...route,route[0]]:route;
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[Math.min(i+1,pts.length-1)],len=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(len/.25));let h=V.fieldSurfaceHeight(a.x,a.z);legs++;
  for(let k=0;k<=steps;k++){const x=a.x+(b.x-a.x)*k/steps,z=a.z+(b.z-a.z)*k/steps,at=`${id} leg ${i} at (${x.toFixed(1)}, ${z.toFixed(1)})`;
   if(id==='stadium-mascot-drip'){assert(L.inStadiumFootprint(x,z)&&!pitch(x,z,5),at+' on the pitch-side ring, 5 m+ off the pitch');for(const p of N.PHOTO_SPOTS)assert(Math.hypot(x-p.x,z-p.z)>1.3,at+' passes the photographers');}
   else{assert(L.onParkPaving(x,z),at+' on paving');assert(!pitch(x,z,2),at+' off the pitch');}assert(!sim.blocked(x,z,world.obstacles,.32),at+' clear of props');
   const y=V.fieldSurfaceHeight(x,z);assert(Math.abs(y-h)<.15,at+' even ground');h=y;}}}
// 5. Fixed spots (floor): aisle fans on an aisle tread (never a seat), concourse fans on the concourse, the crew on the gantry deck,
//    photographers outside the pitch markings and the goal, clear of the stands and stairs; nothing stands on a stair.
const seatsNear=(x,z,h)=>Q.nearestSeat(x,z,h,undefined,.25);
for(const n of cast.filter(n=>n.floor)){const y=n.floor(),c=info[n.id];
 assert(!seatsNear(n.x,n.z,y),n.id+' does not take a seat');
 for(const s of Q.STANDS){const {d,a}=Q.standLocal(s,n.x,n.z);for(const c0 of s.stairs)assert(!(d>Q.standBack(s)-.1&&d<Q.stairEnd(s)+1&&Math.abs(a-c0)<Q.STAIR_WIDTH/2+.5),n.id+' off the stairs');}
 if(c.group==='photographer'){assert(!pitch(n.x,n.z,1.5),n.id+' 1.5 m+ outside the pitch markings');assert(!L.inStadiumFootprint(n.x,n.z,-1)||Math.abs(n.x-S.x)<40&&Math.abs(n.z-S.z)<57.5-1,n.id+' in front of the stands');assert.equal(n.pose,'sit',n.id+' sits');
  const boards=Q.boardColliders(Q.stadiumSponsorLayout());assert(!boards.some(b=>Math.abs(n.x-b.x)<b.w/2+.8&&Math.abs(n.z-b.z)<b.d/2+.8),n.id+' clear of the sponsor boards');
  assert(Math.abs(n.x-S.x)>V.STADIUM_VENUE.goalWidth/2+3||Math.abs(n.z-S.z)<S.pitchL/2,n.id+' beside the goal, not behind its net');}
 else if(c.group==='bench'||c.group==='official'){assert(!pitch(n.x,n.z,.8)&&pitch(n.x,n.z,3),n.id+' at the edge of the pitch, outside the lines');assert.equal(y,V.STADIUM_PITCH_Y);
  if(c.group==='bench')assert(N.TECH_AREAS.some(a=>n.x>a.x0&&n.x<a.x1&&n.z>Math.min(a.z0,a.z1)&&n.z<Math.max(a.z0,a.z1)),n.id+' inside a technical area');
  const t=N.AR_TRACKS[n.id];if(t){assert(t.min<t.max&&(t.max<=S.z||t.min>=S.z)&&n.z>=t.min&&n.z<=t.max,n.id+' runs one half');assert(Math.abs(Math.abs(n.x-S.x)-S.pitchW/2-1)<.01,n.id+' 1 m outside the touchline');
   for(const a of N.TECH_AREAS)assert(t.min>Math.max(a.z0,a.z1)||t.max<Math.min(a.z0,a.z1)||Math.sign(n.x-S.x)>0,n.id+' track clear of the technical areas');}}
 else if(c.group==='crew'){const W=Q.STANDS.find(q=>q.id==='west'),{d,a}=Q.standLocal(W,n.x,n.z);assert(d>=N.GANTRY.d0&&d<=N.GANTRY.d1&&a>=N.GANTRY.a0&&a<=N.GANTRY.a1&&y===N.GANTRY_FLOOR,n.id+' on the gantry deck');}
 else{const s=Q.STANDS.find(q=>{const {d,a}=Q.standLocal(q,n.x,n.z);return d>q.inner&&d<Q.standBack(q)&&a>q.from&&a<q.to;});assert(s,n.id+' in a stand');
  const {d,a}=Q.standLocal(s,n.x,n.z);if(d>s.inner+Q.ROWS*Q.ROW_DEPTH){assert.equal(y,Q.CONCOURSE_HEIGHT,n.id+' on the concourse');}
  else{assert(s.aisles.some(x=>Math.abs(a-x)<Q.AISLE_WIDTH/2-.2),n.id+' in an aisle');const row=Math.floor((d-s.inner)/Q.ROW_DEPTH);assert.equal(y,Q.rowHeight(row),n.id+' on its tread');}}}
assert.equal(cast.filter(n=>!n.floor&&!N.STADIUM_NPC_ROUTES[n.id]).length,0,'every islander either walks an authored route or stands on a floor');
// The gantry leaves the concourse's front half clear (a walkway) and the camera heads sit on their tripods.
{const W=Q.STANDS.find(q=>q.id==='west');assert(N.GANTRY.d0-(W.inner+Q.ROWS*Q.ROW_DEPTH)>=1.6,'1.6 m+ concourse walkway in front of the gantry');assert.equal(N.GANTRY_CAMERAS.length,2);}
// Mascot, gestures, officials: one costumed mascot on an authored lap; the bench + fourth official gesture; no referee on the pitch.
{const m=cast.find(n=>info[n.id].group==='mascot');assert.equal(m.costume,'drip');assert(N.STADIUM_NPC_ROUTES[m.id].length>=16,'mascot laps the ring');
 assert.equal(JSON.stringify([...N.STADIUM_GESTURERS].sort()),JSON.stringify(cast.filter(n=>['bench'].includes(info[n.id].group)||n.id==='stadium-ref-wanjiru').map(n=>n.id).sort()),'bench + fourth official gesture');
 assert.equal(Object.keys(N.AR_TRACKS).length,2);assert(!cast.some(n=>pitch(n.x,n.z,0)),'nobody stands on the field of play');
 for(const d of N.DUGOUTS)assert(Math.abs(d.x-S.x)+d.w/2<=40&&Math.abs(d.x-S.x)-d.w/2>35.7,'dugout between the boards and the stand front');}
// 6. Public viewing: the extras and the viewing fans stand on the apron behind the south stand facing the screen's back face, clear of
//    the ring path (the walkway) and the screen posts.
{const ring=L.ringPoints(),ringD=(x,z)=>L.segDistance(x,z,ring);
 for(const p of [...N.VIEWING_EXTRAS,...cast.filter(n=>info[n.id].group==='viewer')]){assert(L.onApron(p.x,p.z)&&p.z>S.z+Q.standBack(Q.STANDS[3])+3&&p.z>N.SCREEN_BACK_Z+3,'viewer on the apron behind the screen');
  assert(ringD(p.x,p.z)>L.BOWL_RING.width/2+.8,'viewers keep the ring path clear');assert(!sim.blocked(p.x,p.z,world.obstacles,.4),'viewer clear of props');}
 for(const n of cast.filter(n=>info[n.id].group==='viewer'))assert.equal(n.workYaw,Math.PI,n.id+' faces the screen');}
// 7. Scores: only from verified news data, with a fallback; score fans use the island's match desks; no new fetches.
{const now=Date.parse('2026-11-13T12:00:00Z'),item=(league,state,h,a,t)=>({league,id:league+h+a,title:'',url:'',source:'x',publishedAt:t,detail:'',match:{home:'Reds',away:'Blues',homeScore:h,awayScore:a,state,completed:state==='post',goals:[],goalsComplete:true}});
 const feed={kind:'scores',fetchedAt:'',items:[item('eng.1','post','2','1','2026-11-12T20:00:00Z'),item('eng.1','in','0','0','2026-11-13T11:00:00Z')],unavailable:false,partial:false};
 assert.equal(N.scoreFanBubble(feed,'eng.1',0,now),'Full time: Reds 2-1 Blues!','a verified result');
 assert.equal(N.scoreFanBubble(feed,'esp.1',0,now),null,'no data for a league: no line');assert.equal(N.scoreFanBubble(null,'eng.1',0,now),null);
 assert.equal(N.scoreFanBubble({...feed,items:[item('eng.1','in','3','0','2026-11-13T11:00:00Z')]},'eng.1',0,now),null,'a live (unfinished) game is never shared');
 assert.equal(N.scoreFanBubble({...feed,unavailable:true},'eng.1',0,now),null,'unavailable feed: no line');
 assert(N.SCORE_FAN_FALLBACK.length<=48&&!/\d/.test(N.SCORE_FAN_FALLBACK),'fallback has no score');
 const fans=cast.filter(n=>info[n.id].group==='score');for(const n of fans){assert(n.matchStory&&n.news==='scores'&&n.newsLeague&&N.SCORE_FAN_LEAGUE[n.id]===n.newsLeague,n.id+' uses the match desk');
  for(const s of [n.greeting,...n.lines,...n.topics.flatMap(t=>[t.answer,t.followUp.answer])])assert(!/\d+\s*[-–]\s*\d+/.test(s),n.id+' never states a score: '+s);}
 const B=load('lib/town/stadiumScoreBubbles.ts'),book={byNpc:Object.fromEntries(fans.map(n=>[n.id,{near:['Hello!'],idle:['Hm.']}])),byArea:{},banter:[]},wrapped=B.withScoreFanBubbles(book);
 for(const n of fans)assert(wrapped.byNpc[n.id].near.includes(N.SCORE_FAN_FALLBACK),n.id+' bubble falls back with no cached news');
 for(const f of ['lib/town/stadiumNpcs.ts','lib/town/stadiumScoreBubbles.ts','lib/graphics/stadiumMedia.ts'])assert(!/\bfetch\s*\(|XMLHttpRequest|loadIslandNews|EventSource|WebSocket/.test(src(f)),f+' makes no request');
 assert.equal((src('lib/town/newsClient.ts').match(/fetch\(/g)||[]).length,1,'newsClient still has its one cached request');}
// 8. Wiring: the runtime applies routes and the heat budget; Town updates the media near the stadium; the cast joins the dialogue list.
{const r=src('lib/graphics/islandNpcs.ts'),t=src('components/Town.tsx');assert(/AR_TRACKS\[e\.id\]/.test(r)&&/dressDripMascot\(rig\)/.test(r)&&/islandNpcs\.react\(STADIUM_MASCOT_ID,EMOTE\.Dance/.test(t)&&/STADIUM_NPC_ROUTES\[definition\.id\]/.test(r)&&/stadiumCap=stadiumNpcBudget\(!desktop,effectiveTier\(\)\)/.test(r),'islandNpcs routes + budget');
 assert(/createStadiumMedia\(scene,quality\.phone\)/.test(t)&&/stadiumMedia\.update\(/.test(t)&&/withScoreFanBubbles\(THOUGHTS\)/.test(t),'Town wiring');
 const m=src('lib/graphics/stadiumMedia.ts');assert(/const FAR=150/.test(m)&&/!reduced&&tier<3/.test(m),'media sleeps far away; no glints with reduced motion or at tier 3+');}
console.log(`PASS stadium-npcs: ${cast.length} islanders (${Object.entries(groups).map(([g,k])=>g+' '+k).join(', ')}), ${legs} route legs on paving or the pitch-side ring, budget desktop+extras/phone+extras ${table}`);
})().catch(e=>{console.error(e);process.exit(1);});
