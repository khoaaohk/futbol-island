// Live match mechanics (Nov 7 2026; lib/town/match/liveMechanics.ts): tackle wind-up + result variety, through balls, near / far-post
// crosses, the 11v11 kid / adult mode and assists. Every behaviour change is gated on a human being joined: the AI-only fixture stays
// byte-identical and the sim stays seeded. Before/after numbers (64 seeds x 3 real min per format, scripted kid; controlled duels
// 1600 a format) are in the comments below and in lib/town/match/liveMechanics.ts; this file keeps cheap guards + small seeded bands.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const HD=load('lib/town/match/humanDefence.ts'),LM=load('lib/town/match/liveMechanics.ts'),NET=load('lib/town/match/matchNet.ts');
const DT=1/30;
const outfield=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
const put=(sim,id,x,y,vx=0,vy=0)=>{const p=sim.players[id];p.x=x;p.y=y;p.vx=vx;p.vy=vy;};
const clear=sim=>{for(const id of sim.ids){const p=sim.players[id];if(p.isGK)continue;put(sim,id,p.team==='gold'?250:20,p.team==='gold'?380:20);}};
const give=(sim,id,x,y)=>{sim.restart=null;sim.goalHold=0;sim.windup=null;put(sim,id,x,y);Object.assign(sim.ball,{owner:id,target:null,intBy:null,x,y,vx:0,vy:0,height:0});sim.possession=sim.players[id].team;sim.protect=0;sim.passCd=1;};
const {settlePace}=load('lib/town/match/matchMotion.ts');
const fresh=(f='7v7',seed=311)=>{const s=new MatchSim(seed,f);s.receiveSettle=settlePace(s.goalVenue.width,s.windupScale);for(let i=0;i<60;i++)s.step(DT);return s;};// as fieldRuntime sets it

// ---- 1. AI-only: fixture md5 + byte-identical matches; none of the new hooks fire without a human ----
{assert.equal(crypto.createHash('md5').update(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'))).digest('hex'),'ca9034feb4dd50e75c85dc2c7e07151d','fixture untouched');
 const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 assert.deepEqual(S.all(MatchSim),expected,'AI-only matches stay byte-identical');
 for(const f of ['9v9','11v11','beach']){const s=new MatchSim(7,f);for(let i=0;i<1800;i++)s.step(DT);
  assert.equal(s.tackleFx.serial+s.lastThrough.serial+s.crossPost.serial,0,f+': no telegraph / through / post cross without a human');assert.equal(s.tackleWindup,null);}
 // the mode never touches an AI-only match
 const a=new MatchSim(62,'11v11'),b=new MatchSim(62,'11v11');b.setElevenMode('adult');for(let i=0;i<900;i++){a.step(DT);b.step(DT);}
 assert.deepEqual([a.ball.x,a.ball.y,a.score.gold,a.score.blue,a.touchSerial],[b.ball.x,b.ball.y,b.score.gold,b.score.blue,b.touchSerial],'adult mode: AI-only 11v11 identical');}

// ---- 2. Tackle wind-up: a press in reach SETS first (the telegraph), the carrier keeps it until the set is over ----
{const sim=fresh();sim.windupScale=.32;clear(sim);const [me]=outfield(sim,'gold'),[foe]=outfield(sim,'blue');sim.lockHuman(me);
 give(sim,foe,140,200);put(sim,me,140,207);const s0=sim.tackleFx.serial;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);
 assert.equal(sim.tackleFx.kind,'windup','telegraph first');assert.equal(sim.tackleFx.serial,s0+1);assert.equal(sim.tackleFx.by,me);assert.equal(sim.tackleFx.on,foe);
 assert.equal(sim.ball.owner,foe,'the carrier still has it during the set');assert(sim.tackleWindupOf(me)>0);
 const w=sim.tackleWindup;assert(w&&w.on===foe&&w.by===me&&w.t>0&&w.t<=1,'sim.tackleWindup {on, by, t} for the HUD cue');
 let steps=1;while(sim.tackleWindupOf(me)>0&&steps<20){sim.humanInput(me,{mx:0,my:0});sim.step(DT);steps++;}
 const real=steps*DT/sim.windupScale;assert(real>=LM.TACKLE_FX.wind-.01&&real<=LM.TACKLE_FX.wind+.25,'a short readable set: '+real.toFixed(2)+' real s');
 assert.notEqual(sim.tackleFx.kind,'windup','then it resolves ('+sim.tackleFx.kind+')');
 assert(LM.TACKLE_FX.wind>=.15&&LM.TACKLE_FX.wind<=.3&&LM.TACKLE_FX.stumble<=.2,'short set, quick recovery');
 // AI defender on a HUMAN carrier: sets too (aiTackleSet) before his roll can land
 const t2=fresh();t2.windupScale=.32;clear(t2);const [h2]=outfield(t2,'gold'),[d2]=outfield(t2,'blue');t2.lockHuman(h2);give(t2,h2,135,250);Object.assign(t2.humans.get(h2),{guard:0,hadBall:true});
 const rng=t2.rng;t2.rng=()=>0;put(t2,d2,135,247);t2.humanInput(h2,{mx:0,my:0});t2.step(DT);assert.equal(t2.ball.owner,h2,'no instant AI steal');assert.equal(t2.aiTackleSet,d2);assert.equal(t2.tackleWindup.on,h2,'the cue is on the human carrier');
 for(let i=0;i<6&&t2.ball.owner===h2;i++){put(t2,d2,t2.players[h2].x,t2.players[h2].y-3);t2.humanInput(h2,{mx:0,my:0});t2.step(DT);}t2.rng=rng;assert.notEqual(t2.ball.owner,h2,'after the set he can still win it');}

// ---- 3. Result variety (same one roll): clean steal, deflection, poke, stumble from behind; never a foul ----
{const kinds={};const run=(gap,roll)=>{const sim=fresh();sim.windupScale=.32;clear(sim);const [me]=outfield(sim,'gold'),[foe]=outfield(sim,'blue');sim.lockHuman(me);
  give(sim,foe,140,200);put(sim,me,140,200+gap);sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);const rng=sim.rng;sim.rng=()=>roll;
  for(let i=0;i<12&&sim.tackleWindupOf(me)>0;i++){put(sim,foe,140,200);sim.ball.x=140;sim.ball.y=200;put(sim,me,140,200+gap);sim.humanInput(me,{mx:0,my:0});sim.step(DT);}sim.rng=rng;
  kinds[sim.tackleFx.kind]=(kinds[sim.tackleFx.kind]||0)+1;return {sim,me,foe,kind:sim.tackleFx.kind};};
 const T=LM.TACKLE_TUNE['7v7'],H=load('lib/town/match/humanInputs.ts').TACKLE_ASSIST;
 let r=run(7,.1);assert.equal(r.kind,'steal');assert.equal(r.sim.ball.owner,r.me,'clean steal');
 r=run(7,H.front-T.deflect/2);assert.equal(r.kind,'deflect');assert.equal(r.sim.ball.owner,null,'deflection: a loose ball');assert.equal(r.sim.msg,'Deflected!');
 r=run(7,.995);assert.equal(r.kind,'deflect','a failed front roll is still a poke-away, not a miss');
 r=run(-7,.995);assert.equal(r.kind,'stumble');assert.equal(r.sim.ball.owner,r.foe);assert(r.sim.humans.get(r.me).tackleRec>0&&r.sim.humans.get(r.me).tackleRec<=LM.TACKLE_FX.stumble,'stumble: a quick recovery');
 for(const f of Object.keys(LM.TACKLE_TUNE)){const t=LM.TACKLE_TUNE[f];assert(t.behind>=H.chanceAway&&t.behind<=.9&&t.deflect<=.3,f+': tune bounded');}
 assert.equal(LM.TACKLE_KINDS.slice(0,3).join(),'steal,deflect,stumble');}

// ---- 4. Win-rate band: controlled duels (kid placed 5..11 u from an AI carrier, presses as he closes) stay where they were ----
// Measured (1600 duels a format, before -> after): 7v7 98.8 -> 98.8, futsal 99.2 -> 99.6, beach 91.5 -> 93.8, 9v9 92.0 -> 91.4, 11v11 91.0 -> 91.2 %.
function duels(format,seeds,per){let won=0,n=0;const SP=format==='futsal'||format==='beach'?.48:.32;
 for(const seed of seeds){const sim=new MatchSim(500+seed*37,format);sim.windupScale=SP;const me=sim.ids.find(id=>sim.players[id].team==='gold'&&sim.players[id].role==='mid');sim.lockHuman(me);
  let r=seed*7919+3;const rnd=()=>{r=(r*1103515245+12345)>>>0;return r/4294967296;};let k=0,cool=2,duel=null,guard=0;
  while(k<per&&guard++<30000){const o=sim.ball.owner;
   if(!duel){cool-=DT;sim.humanInput(me,{mx:0,my:0});if(cool<=0&&o&&sim.players[o].team==='blue'&&!sim.players[o].isGK&&!sim.restart&&sim.goalHold<=0){const c=sim.players[o],a=rnd()*Math.PI*2,d=5+rnd()*6;sim.placePlayer(me,Math.max(12,Math.min(258,c.x+Math.cos(a)*d)),Math.max(12,Math.min(388,c.y+Math.sin(a)*d)));duel={c:o,t:0,next:0};}}
   if(duel){const p=sim.players[me],c=sim.players[duel.c],L=Math.hypot(c.x-p.x,c.y-p.y)||1,f={mx:(c.x-p.x)/L,my:(c.y-p.y)/L};if(duel.t>=duel.next){duel.next+=.35;if(L<22)f.tackle=true;}sim.humanInput(me,f);}
   sim.step(DT*SP);
   if(duel){duel.t+=DT;const ow=sim.ball.owner;if(ow&&sim.players[ow].team==='gold'){won++;n++;k++;duel=null;cool=2;}else if(duel.t>1.5||sim.restart||(ow&&ow!==duel.c)){n++;k++;duel=null;cool=2;}}}}
 return won/Math.max(1,n);}
{const b={'7v7':[.94,1],'11v11':[.82,1]};for(const f in b){const w=duels(f,[1,2,3],15);if(process.env.V)console.log(f,'duel win',w.toFixed(2));assert(w>=b[f][0]&&w<=b[f][1],f+': tackle duels '+(w*100).toFixed(0)+'%');}}

// ---- 5. Through balls: Pass with the stick pushed forward past a runner leads him into space; an AI team-mate leads a running human ----
{const sim=fresh();sim.windupScale=.32;clear(sim);const [me,mate]=outfield(sim,'gold');sim.lockHuman(me);
 give(sim,me,135,290);put(sim,mate,150,190,0,-70);const s0=sim.lastThrough.serial;sim.humanInput(me,{mx:.2,my:-1,pass:true});sim.step(DT);
 assert.equal(sim.lastThrough.serial,s0+1,'a through ball');assert.equal(sim.lastThrough.to,mate);assert(sim.lastThrough.y<sim.players[mate].y-4,'led into the space ahead of his run');
 let got=false;for(let i=0;i<60&&!got;i++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);got=sim.ball.owner===mate||(sim.lastFrom===mate&&sim.msg==='Heavy touch!');}assert(got,'the runner meets it (in-game completion: 87-98 % a format, see the report)');
 // standing team-mate: the plain pass (no through ball)
 give(sim,me,135,260);put(sim,mate,150,200);const s1=sim.lastThrough.serial;sim.humanInput(me,{mx:.2,my:-1,pass:true});sim.step(DT);assert.equal(sim.lastThrough.serial,s1,'no run, no through ball');
 // AI team-mate -> a HUMAN running forward with a clear lane
 const t=fresh();t.windupScale=.32;clear(t);const [h,ai]=outfield(t,'gold');t.lockHuman(h);give(t,ai,135,280);put(t,h,120,220,0,-80);const s2=t.lastThrough.serial;
 t.doPass(ai,h,1);assert.equal(t.lastThrough.serial,s2+1,'the AI plays him in');assert.equal(t.lastThrough.to,h);assert(t.lastThrough.y<220-4);
 // not on sand / the futsal court
 const bch=fresh('beach');clear(bch);const [bh,bai]=outfield(bch,'gold');bch.lockHuman(bh);give(bch,bai,135,280);put(bch,bh,120,220,0,-80);bch.doPass(bai,bh,1);assert.equal(bch.lastThrough.serial,0,'beach: to his feet');
 assert(LM.THROUGH.space<=16&&LM.THROUGH.feedSpace<=12,'modest leads (pass completion near the human stays >= 88%)');}

// ---- 6. Near / far-post crosses: to a human receiver, the landing is a post spot he can reach first; AI-to-AI only on 9v9 / 11v11 ----
{const sim=fresh('9v9');sim.windupScale=.32;clear(sim);const g=outfield(sim,'gold'),[from,to,ai]=g;sim.lockHuman(to);
 const gk9=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK);put(sim,gk9,135,10);// on his line (a keeper off it would claim a post ball first: then no post spot)
 give(sim,from,240,70);put(sim,to,140,60);sim.doLoft(from,to,'cross');const c=sim.crossPost;
 assert.equal(c.active,true,'a post cross');assert(['near','far'].includes(c.side));assert.equal(c.to,to);
 const spot={x:0,y:0};LM.postSpot(c.side==='far',240,8,-1,spot);assert.deepEqual([c.x,c.y],[spot.x,spot.y],'lands on the '+c.side+'-post spot');
 assert(Math.abs(c.x-135)<=LM.POST_CROSS.farX&&c.y-8>=LM.POST_CROSS.nearD-1,'in front of the goal, out of the keeper\'s six');
 // AI-to-AI on the 9v9 with a human joined: also; on the 7v7 not
 put(sim,gk9,135,10);give(sim,from,240,70);put(sim,ai,148,46);sim.doLoft(from,ai,'cross');assert.equal(sim.crossPost.to,ai,'9v9 AI-to-AI with a human joined');
 const s7=fresh('7v7');s7.windupScale=.32;clear(s7);const [f7,t7,a7]=outfield(s7,'gold');s7.lockHuman(t7);give(s7,f7,240,70);put(s7,a7,140,60);s7.doLoft(f7,a7,'cross');assert.equal(s7.crossPost.serial,0,'7v7 AI-to-AI unchanged');
 // the AI receiver runs into the spot while it is in the air
 put(sim,gk9,135,10);give(sim,from,240,70);put(sim,ai,120,70);sim.doLoft(from,ai,'cross');const cp={...sim.crossPost};let best=Infinity;for(let i=0;i<20&&sim.ball.owner!==ai;i++){sim.step(DT);const p=sim.players[ai];best=Math.min(best,Math.hypot(p.x-cp.x,p.y-cp.y));}
 if(cp.active)assert(best<10||sim.ball.owner===ai,'he runs into the '+cp.side+' post');}

// ---- 7. Kid / adult 11v11: adult = the original numbers ----
{const s=new MatchSim(17,'11v11');assert.equal(s.elevenMode,'kid');assert.deepEqual({...s.humanDefence},{...HD.HUMAN_DEFENCE['11v11']});assert.equal(s.humanPace,HD.HUMAN_SIDE['11v11'].pace);
 s.setElevenMode('adult');assert.deepEqual({...s.humanDefence},{intercept:2.4,lane:1.8,read:1.7,tackle:1.2,attack:1.5,keeper:1.15,ramp:30,start:.8,margin:0,sag:1,tight:1},'adult: the original HUMAN_DEFENCE 11v11 row');
 assert.deepEqual({...s.humanSide},{pace:1,finish:1,shoot:1,crossWide:0},'adult: no HUMAN_SIDE boosts');assert.equal(s.humanPace,1);assert.equal(s.humanSprintBoost,1.3);assert.equal(s.humanLungeCap,false);
 s.setElevenMode('kid');assert.deepEqual({...s.humanDefence},{...HD.HUMAN_DEFENCE['11v11']});assert(Math.abs(s.humanPace*s.humanSprintBoost-1.3)<1e-9);
 const n=new MatchSim(17,'9v9'),d0={...n.humanDefence};n.setElevenMode('adult');assert.deepEqual({...n.humanDefence},d0,'other formats ignore it');
 const snap=fs.readFileSync('lib/saves/snapshot.ts','utf8'),docs=fs.readFileSync('docs/accounts-design.md','utf8'),ui=fs.readFileSync('components/IslandSettings.tsx','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 assert.match(snap,/DEVICE_KEYS[^\n]*'fi2-match-11-mode-v1'/,'a device setting');assert.match(docs,/fi2-match-11-mode-v1/);
 assert.match(ui,/data-match-11-mode onClick=\{\(\)=>setElevenMode\(adult11\?'kid':'adult'\)\}/,'Island settings toggle');
 assert.match(fr,/if\(!sim\.humans\.size\)sim\.setElevenMode\(elevenMode\(\)\);/,'the owner\'s device applies it at the first join');}

// ---- 8. Assist: the team-mate whose pass the scorer received within ASSIST.window real s; cosmetic ----
{const sim=fresh();sim.windupScale=.32;clear(sim);const [me,mate]=outfield(sim,'gold'),gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK);sim.lockHuman(me);
 give(sim,mate,135,120);put(sim,me,135,80);sim.doPass(mate,me,1);for(let i=0;i<40&&sim.ball.owner!==me;i++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}assert.equal(sim.ball.owner,me,'received');
 const g0=sim.lastGoal.serial,goals=sim.score.gold;sim.humanInput(me,{mx:0,my:-1,shoot:true,shootPower:1,aimX:.6,aimH:.5});
 for(let i=0;i<80&&sim.score.gold===goals;i++){put(sim,gk,30,20);sim.step(DT);}assert.equal(sim.score.gold,goals+1,'goal');
 assert.equal(sim.lastGoal.serial,g0+1);assert.equal(sim.lastGoal.scorer,me);assert.equal(sim.lastGoal.assist,mate,'the assist');assert.equal(sim.lastGoal.assistSlot,sim.ids.indexOf(mate));
 const e=sim.touches[(sim.touchSerial-1)%sim.touches.length];assert.equal(e.kind,'goal');assert.equal(e.assistSlot,sim.ids.indexOf(mate),'on the goal event');assert.match(sim.msg,/Assist/,'feed line caption');
 // too long after the pass: no assist
 const t=fresh();t.windupScale=.32;clear(t);const [a,b]=outfield(t,'gold'),k=t.ids.find(id=>t.players[id].team==='blue'&&t.players[id].isGK);t.lockHuman(a);
 give(t,b,135,160);put(t,a,135,120);t.doPass(b,a,1);for(let i=0;i<40&&t.ball.owner!==a;i++){t.humanInput(a,{mx:0,my:0});t.step(DT);}
 for(let i=0;i<40;i++){t.humanInput(a,{mx:0,my:0});t.step(DT);}// ~4 real s on the ball
 const g1=t.score.gold;give(t,a,135,80);t.pendPass&&0;t.humanInput(a,{mx:0,my:-1,shoot:true,shootPower:1,aimX:.6,aimH:.5});for(let i=0;i<80&&t.score.gold===g1;i++){put(t,k,30,20);t.step(DT);}
 if(t.score.gold>g1)assert.equal(t.lastGoal.assist,null,'no assist after the window');
 // no coins / quests / goal counts read it (cosmetic): only the sim, its tests and the HUD's phrase reader name it
 for(const f of ['lib/town/economy.ts','lib/town/quests.ts'])if(fs.existsSync(f))assert(!/assistSlot|lastGoal/.test(fs.readFileSync(f,'utf8')),f);}

// ---- 9. Snapshot: a friend's puppet sees the human tackler's set and result, values stay inside the relay's integer check ----
{const sim=fresh();sim.windupScale=.32;clear(sim);const [me]=outfield(sim,'gold'),[foe]=outfield(sim,'blue');sim.lockHuman(me);
 give(sim,foe,140,200);put(sim,me,140,207);sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);
 const out=[];NET.encodeSnap(sim,0,1,0,out);assert(JSON.stringify(out).length<=NET.SNAP_MAX_BYTES);for(const v of out)assert(Math.abs(v)<100000,'relay integer check');
 assert(sim.tackleNetBits(me,true)&NET.SNAP_TACKLE.winding,'winding bit');
 const pup=fresh();pup.lockHuman(me);const buf=NET.createSnapBuffer();buf.push(out,3,1000);buf.sample(pup,1000,-1,.001);
 assert(pup.tackleWindupOf(me)>0,'the puppet shows his set');
 while(sim.tackleWindupOf(me)>0){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}const k=sim.tackleFx.kind;const out2=[];NET.encodeSnap(sim,0,2,0,out2);const s0=pup.tackleFx.serial;buf.push(out2,3,1083);buf.sample(pup,1300,-1,.001);
 assert.equal(pup.tackleWindupOf(me),0);assert.equal(pup.tackleFx.serial,s0+1,'the result arrives once');assert.equal(pup.tackleFx.kind,k);}

// ---- 10. Determinism: a scripted human match replays exactly (friends' synced sims stay identical) ----
{const run=()=>{const s=new MatchSim(91,'9v9');s.windupScale=.32;const me=outfield(s,'gold')[3];s.lockHuman(me);let r=5;const rnd=()=>{r=(r*1103515245+12345)>>>0;return r/4294967296;};
  for(let i=0;i<2400;i++){const p=s.players[me],o=s.ball.owner;const f={mx:Math.cos(i*.05),my:-.6};if(o&&s.players[o].team==='blue'&&Math.hypot(s.players[o].x-p.x,s.players[o].y-p.y)<20&&rnd()<.3)f.tackle=true;if(o===me&&rnd()<.05)f.pass=true;s.humanInput(me,f);s.step(DT*.32);}
  return [s.ball.x,s.ball.y,s.score.gold,s.score.blue,s.touchSerial,s.tackleFx.serial,s.lastThrough.serial,s.crossPost.serial,s.lastGoal.serial].join(',');};
 assert.equal(run(),run(),'seeded: same inputs, same match');}

console.log('PASS live mechanics: AI-only unchanged, tackle wind-up + variety + duel band, through balls, post crosses, 11v11 kid/adult, assists, snapshot bits, determinism');
