// Live beach soccer on Coral Cay (Sep 29 2026): the 'beach' format of lib/town/match/matchSim.ts on the Sharks Beach court
// (lib/town/venues.ts BEACH_VENUE), its view glue (fieldRuntime, choreo, combos) and its heat behaviour.
// Covers: seeded determinism, beach rules (no offside, no direct goal from a keeper's throw / kick-in, periods, extra time,
// penalties), the balance targets, barefoot kits, the turned court's world mapping, the far-match pause, and a snapshot
// proving the island's four formats still play the exact same matches (fixtures/live-match-summary.json, generated
// from the sim before the beach format existed).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const cache=new Map(),ctx=new Proxy({measureText:text=>({width:text.length*20}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={innerHeight:800,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Math,Number,document,window,console,performance,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {MatchSim,BEACH_PERIOD,BEACH_EXTRA}=load('lib/town/match/matchSim.ts');
const V=load('lib/town/venues.ts'),{BEACH_COURT}=load('lib/town/coralCay.ts');
const DT=1/30,run=(sim,seconds)=>{for(let i=Math.round(seconds/DT);i>0;i--)sim.step(DT);return sim;};

// ---- 1. The court: BEACH_VENUE is the cay's court, turned east–west, and the sim maps onto it ----
{const v=V.BEACH_VENUE;
 assert.equal(v.id,'beach');assert.equal(v.x,BEACH_COURT.x);assert.equal(v.z,BEACH_COURT.z);assert.equal(v.length,BEACH_COURT.length);assert.equal(v.width,BEACH_COURT.width);
 assert.equal(v.goalWidth,5.5);assert.equal(v.goalHeight,2.2);assert.equal(v.players,5);
 assert(!V.VENUES.some(x=>x.id==='beach'),'the beach court is a live venue only: no island pitch mesh, goal barriers, lessons or quests');
 assert.equal(V.LIVE_VENUES.length,V.VENUES.length+1);assert.equal(V.liveVenueById('beach'),v);
 // Everything is relative to the court anchors (the court may move): goal line centres (sim y 10 / 390 = ± length/2)
 // land on the cay's goals at x ± length/2; the width axis runs along z.
 const near=(a,b,e=1e-6)=>Math.abs(a-b)<e,hl=BEACH_COURT.length/2,hw=BEACH_COURT.width/2;
 assert(near(V.liveWorldX(v,135,10),BEACH_COURT.x-hl)&&near(V.liveWorldZ(v,135,10),BEACH_COURT.z),'gold attacks the west goal');
 assert(near(V.liveWorldX(v,135,390),BEACH_COURT.x+hl)&&near(V.liveWorldZ(v,135,390),BEACH_COURT.z),'blue attacks the east goal');
 assert(near(V.liveWorldX(v,10,200),BEACH_COURT.x)&&near(Math.abs(V.liveWorldZ(v,10,200)-BEACH_COURT.z),hw),'touchlines ± width/2');
 assert(near(V.liveWorldYaw(v,0,-1),-Math.PI/2)||near(V.liveWorldYaw(v,0,-1),3*Math.PI/2),'facing up the sim pitch faces west');
 assert.equal(V.liveHalfX(v),BEACH_COURT.length/2);assert.equal(V.liveHalfZ(v),BEACH_COURT.width/2);
 // unturned venues keep their exact old expressions
 // Knockback (code review finding 3): a knocked-over beach player moves only the knockback step, not across the court.
 {const sim={x:135,y:300},wx=V.liveWorldX(v,sim.x,sim.y),wz=V.liveWorldZ(v,sim.x,sim.y),nx=wx+.12*Math.cos(.7),nz=wz+.12*Math.sin(.7);
  const f=V.liveFieldPoint(v,nx,nz),moved=Math.hypot(V.liveWorldX(v,f.x,f.y)-wx,V.liveWorldZ(v,f.x,f.y)-wz);
  assert(Math.abs(moved-.12)<1e-9,'a 0.12 m knockback moves the player 0.12 m ('+moved.toFixed(3)+' m)');assert(Math.hypot(f.x-sim.x,f.y-sim.y)<2,'a short sim step too');
  const old={x:135+(nx-v.x)/v.width*250,y:200+(nz-v.z)/v.length*380};assert(Math.hypot(V.liveWorldX(v,old.x,old.y)-wx,V.liveWorldZ(v,old.x,old.y)-wz)>5,'(the old north–south mapping teleported it)');
  for(const [x,y] of [[10,10],[260,390],[77,311]]){const q=V.liveFieldPoint(v,V.liveWorldX(v,x,y),V.liveWorldZ(v,x,y));assert(Math.abs(q.x-x)<1e-9&&Math.abs(q.y-y)<1e-9,'round trip');}
  for(const u of V.VENUES){const q=V.liveFieldPoint(u,u.x+3,u.z-4);assert(Math.abs(q.x-(135+3/u.width*250))<1e-9&&Math.abs(q.y-(200-4/u.length*380))<1e-9,'unturned venues: the old mapping');}
  assert(/const f=liveFieldPoint\(field\.venue,nx,nz\);actor\.x=f\.x;actor\.y=f\.y;/.test(fs.readFileSync('components/Town.tsx','utf8')),'Town writes knockback back through the inverse');}
 for(const u of V.VENUES){assert.equal(V.liveWorldX(u,77,311),u.x+(77-135)/250*u.width);assert.equal(V.liveWorldZ(u,77,311),u.z+(311-200)/380*u.length);assert.equal(V.liveWorldYaw(u,3,-4),Math.atan2(3*u.width/250,-4*u.length/380));}}

// ---- 2. The island's four formats are unchanged: identical seeded matches to the pre-beach sim ----
{const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 assert.deepEqual(S.all(MatchSim),expected,'futsal / 7v7 / 9v9 / 11v11 play byte-identical seeded matches');}

// ---- 3. The beach format runs, seeded and deterministic, inside the court ----
{const a=run(new MatchSim(29,'beach'),60),b=run(new MatchSim(29,'beach'),60);
 assert.deepEqual(a.score,b.score);assert.equal(a.kicks,b.kicks);assert.equal(a.ball.x,b.ball.x);
 assert.equal(a.ids.length,10,'five a side including the keepers');assert.equal(a.ids.filter(id=>a.players[id].isGK).length,2);
 assert(a.isBeach&&!a.useOffside&&a.allowLoft,'no offside, lofted play allowed');assert.equal(a.windupScale,.48);
 assert(a.groundFriction>2.2,'sand slows a rolling ball');
 for(const id of a.ids){const p=a.players[id];assert(Number.isFinite(p.x+p.y)&&p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396,id);}}

// ---- 4. Beach rules ----
{// No offside is ever applied (the filter and the whistle), yet attackers do receive beyond the last defender.
 let beyond=0;
 for(let i=0;i<6;i++){const sim=new MatchSim(11+i*17,'beach');
  for(let t=0;t<180/DT;t++){sim.step(DT);if(t%15===0)for(const team of ['gold','blue'])for(const id of sim.ids)assert.equal(sim.isOffside(team,sim.players[id].y),false);}
  assert.equal(sim.stats.offsideCalls,0,'no offside called');beyond+=sim.stats.beachOnside;}
 assert(beyond>0,'receivers beyond the last defender play on (the "No offside on sand" teaching moment)');}
{// A keeper's throw that goes straight into the other goal is a goal clearance, not a goal (Law 12).
 const sim=new MatchSim(5,'beach');sim.restart=null;sim.goalHold=0;sim.windupScale=0;
 const gk=sim.players.gk;Object.assign(gk,{x:135,y:60});for(const id of sim.blueIds){const p=sim.players[id];Object.assign(p,{x:250,y:380,vx:0,vy:0});}
 sim.ball.owner='gk';sim.possession='gold';sim.launch('gk',135,0,320,.3,null);
 let scored=false;for(let t=0;t<90&&!sim.restart;t++){sim.step(DT);if(sim.score.gold)scored=true;}
 assert(!scored,'no goal straight from the keeper’s hands');assert.equal(sim.restart?.kind,'goalkick');assert.equal(sim.players[sim.restart.taker].team,'blue','a goal clearance for the other side');
 // …while the same strike from an outfield player counts.
 const s2=new MatchSim(5,'beach');s2.restart=null;s2.goalHold=0;s2.windupScale=0;const st=s2.players.st;Object.assign(st,{x:135,y:60});for(const id of s2.blueIds)Object.assign(s2.players[id],{x:250,y:380,vx:0,vy:0});
 s2.ball.owner='st';s2.possession='gold';s2.launch('st',135,0,320,.3,null);let g=false;for(let t=0;t<90&&!g;t++){s2.step(DT);g=s2.score.gold===1;}assert(g,'an outfield strike scores');}
{// Periods: three 60 s periods, then full time (or extra time when level), then a new game from 0-0.
 const sim=new MatchSim(11,'beach');run(sim,BEACH_PERIOD+2);assert(sim.period===2,'period 2 after 60 s');run(sim,BEACH_PERIOD);assert(sim.period===3);
 run(sim,BEACH_PERIOD+BEACH_EXTRA+6);assert(sim.results.length===1,'one game finished');const r=sim.results[0];
 if(r.gold===r.blue)assert(r.extra&&r.pens&&r.pens.gold!==r.pens.blue,'a level game goes to extra time and a shoot-out: always a winner');
 run(sim,4);assert.equal(sim.period,1,'a new game kicks off');
 let pens=0,extra=0;for(let i=0;i<5;i++){const s=run(new MatchSim(11+i*17,'beach'),400);for(const x of s.results){if(x.extra)extra++;if(x.pens){pens++;assert(x.pens.gold>=3||x.pens.blue>=3||x.pens.gold+x.pens.blue>=5);}}assert(s.results.length>=2);}
 assert(extra>0,'some games go to extra time');}

// ---- 5. Balance targets (24 seeds × 3 min; the full 480-seed report is in docs/performance-guide.md) ----
const seen=new Set();
{let goals=0,gold=0,blue=0,switches=0,oneSided=0,margin=0,first=0;const SEEDS=24,MIN=3;
 for(let i=0;i<SEEDS;i++){const sim=new MatchSim(11+i*17,'beach');let prev=sim.possession,n=0;
  for(let t=0;t<MIN*60/DT;t++){sim.step(DT);if(sim.possession!==prev){switches++;prev=sim.possession;}if(sim.note.serial!==n){n=sim.note.serial;seen.add(sim.note.text.replace(/\d+/g,'#'));}}
  goals+=sim.score.gold+sim.score.blue;gold+=sim.score.gold;blue+=sim.score.blue;margin+=Math.abs(sim.score.gold-sim.score.blue);if(Math.abs(sim.score.gold-sim.score.blue)>=3)oneSided++;first+=sim.stats.firstTime;}
 const gpg=goals/SEEDS,spm=switches/(SEEDS*MIN);
 assert(gpg>=2&&gpg<=4.3,`goals per 3-minute game ${gpg}`);assert(spm>=9&&spm<=17,`possession switches per minute ${spm}`);
 assert(oneSided<=SEEDS*.25,`one-sided games ${oneSided}/${SEEDS}`);assert(margin/SEEDS<=1.8,`mean margin ${margin/SEEDS}`);
 assert(Math.abs(gold-blue)/SEEDS<.8,`no side bias (gold ${gold}, blue ${blue})`);assert(first>0,'first-time volleys / overhead kicks happen');}

// ---- 6. Barefoot kits: identical per team, socks and boots in the team's leg colour ----
{const B=load('lib/town/beanLooks.ts'),K=B.BEACH_MATCH_KITS;
 for(const kit of [K.home,K.away,K.homeKeeper,K.awayKeeper]){const body=B.teamBodyColour(kit);assert.equal(kit.socks,body);assert.equal(kit.boots,body);assert.equal(kit.socks2,body);}
 assert(!B.kitsClash(K.home,K.away));
 const a=B.fieldTokenDress('beach',{id:'lm',home:true},11,false,K),b=B.fieldTokenDress('beach',{id:'st',home:true},9,false,K);
 assert.deepEqual({...a.outfit,number:0},{...b.outfit,number:0},'every player of a team wears the identical kit');}

// ---- 7. Heat: the beach match is fully paused (dormant) when far / off screen, and resumes where it stopped ----
{const {createFieldRuntime,liveGameSpeed}=load('lib/town/fieldRuntime.ts');assert.equal(liveGameSpeed('beach'),.48);
 const scene=new T.Scene(),rt=createFieldRuntime(scene),e=rt.entries.find(x=>x.venue.id==='beach'),camera=new T.PerspectiveCamera(55,1,.1,1000);
 const look=(x,y,z,tx,tz)=>{camera.position.set(x,y,z);camera.lookAt(tx,0,tz);camera.updateMatrixWorld();};
 assert.equal(rt.entries.length,5);assert.equal(e.rigs.size,0,'no rigs before the court is ever seen');
 look(95,40,5,95,-35);for(let i=0;i<10;i++)rt.update(1/30,i/30,camera,null,true);
 assert.equal(e.dormant,true,'dormant from the main island');assert.equal(e.sim.stats.time,0,'no sim time while dormant');assert.equal(e.root.visible,false);assert.equal(e.rigs.size,0);
 look(BEACH_COURT.x+18,24,BEACH_COURT.z+30,BEACH_COURT.x,BEACH_COURT.z);for(let i=0;i<30;i++)rt.update(1/30,i/30,camera,null,true);
 assert.equal(e.dormant,false);assert(e.sim.stats.time>.4,'the match plays at the court');assert.equal(e.rigs.size,10,'ten pooled rigs');assert(rt.stats.visiblePlayers>=8);
 const frozen=e.sim.stats.time;look(95,40,5,95,-35);for(let i=0;i<60;i++)rt.update(1/30,i/30,camera,null,true);
 assert.equal(e.dormant,true);assert.equal(e.sim.stats.time,frozen,'flying back to the main island freezes it exactly');
 // Off screen but near (QA Sep 29 2026: the cay plaza side, looking west away from the court, inside the old distance zone): asleep, not just when far.
 look(BEACH_COURT.x+18,24,BEACH_COURT.z+30,BEACH_COURT.x,BEACH_COURT.z);for(let i=0;i<5;i++)rt.update(1/30,i/30,camera,null,true);
 assert.equal(e.dormant,false,'awake again as soon as the court is in view');const seen=e.sim.stats.time;assert(seen>=frozen,'resumes from where it paused');
 look(640,24,-140,600,-160);assert(camera.position.distanceTo(new T.Vector3(BEACH_COURT.x,1,BEACH_COURT.z))<60,"inside the old distance wake zone");for(let i=0;i<60;i++)rt.update(1/30,i/30,camera,null,true);
 assert.equal(e.dormant,true,'off screen from the cay plaza: dormant');assert.equal(e.root.visible,false);assert.equal(e.sim.stats.time,seen,'no sim time off screen');
 look(BEACH_COURT.x+18,24,BEACH_COURT.z+30,BEACH_COURT.x,BEACH_COURT.z);rt.update(1/30,0,camera,null,true);
 assert.equal(e.dormant,false,'wakes the first frame it is seen');assert(e.sim.stats.time-seen<.2,'resumes seamlessly (no catch-up burst)');
 // the four island pitches are unaffected by the extra venue (same per-venue seeds)
 assert.deepEqual(rt.entries.slice(0,4).map(x=>x.venue.id),V.VENUES.map(v=>v.id));
 // and the picker offers the beach position guide for a live player
 look(BEACH_COURT.x+18,24,BEACH_COURT.z+30,BEACH_COURT.x,BEACH_COURT.z);rt.update(1/30,0,camera,null,true);
 const {positionInfo,positionLabel}=load('lib/town/playerPositions.ts');
 for(const id of e.sim.ids){const info=positionInfo({format:'beach',label:positionLabel('beach',id)});assert(info&&info.name.startsWith('Beach '),id);}}

// ---- 8. No Learn card at the court (user request, Sep 29): the four island pitches keep theirs; nothing is registered for the beach ----
{const town=fs.readFileSync('components/Town.tsx','utf8');
 assert(!/data-field="beach"|BeachMatchGuide|LIVE_VENUES/.test(town),'no beach learn card, guide or prompt in Town');
 // Oct 4 2026 (clear path): the island pitch cards moved into components/FieldPathCard.tsx (one per VENUES pitch, beach excluded).
 assert.match(town,/\{VENUES\.map\(v=><FieldPathCard key=\{v\.id\} venue=\{v\}/,'island pitch learn cards: one per island pitch');
 assert.match(fs.readFileSync('components/FieldPathCard.tsx','utf8'),/data-tour="plays" data-field=\{venue\.id\}[^>]*className="meet-coach field-learn-card"/,'the card keeps its HUD hooks');
 assert.match(town,/for\(const v of VENUES\)\{\n\s*\/\/ Clip the actual pitch polygon/,'visible-pitch scan covers the island pitches only');}
// ---- 9. Teaching moments reach the live feed ----
{const src=fs.readFileSync('lib/town/matchEffects.ts','utf8');assert.match(src,/const note=sim\.note;if\(note\.serial!==lastNote\)/);
 {const {sentence}=load('lib/town/matchEffects.ts');assert.equal(`${sentence('Overhead kick!')} ${sentence('Beach laws allow it')}`,'Overhead kick! Beach laws allow it.','no "!." in the feed');assert.equal(sentence('Kick-in'),'Kick-in.');assert.equal(sentence('Why?'),'Why?');}
 for(const text of ["Keeper's throw",'No offside on sand','End of period # of #'])assert(seen.has(text),text);
 assert([...seen].some(t=>t.startsWith('Kick-in for ')),'kick-in choice');
 const choreo=fs.readFileSync('lib/town/match/choreo.ts','utf8');assert.match(choreo,/sim\.isBeach&&\(kind==='bicycle'\|\|kind==='scissor'\)\)sim\.teach\(kind==='bicycle'\?'Overhead kick!':'Scissor kick!'/);}
console.log('PASS beach match: court mapping, four formats byte-identical, seeded beach sim, no offside, no direct goal from the hands, periods/extra time/penalties, balance, barefoot kits, far-match pause, position guide, teaching feed');
