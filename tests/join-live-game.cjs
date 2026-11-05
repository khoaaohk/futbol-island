// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md): walk onto the live 7v7 with your ball and play.
// Covers the pure logic (format switch, walk-on countdown, team + slot assignment for N humans, the replaced NPC's walk
// to the touchline and cheer rhythm, the multi-human input map), the passing assist (cone choice, blocked lane,
// hysteresis, lead + pace, shot aim), off-ball runs (run selection, onside-safe forward target), the MatchSim
// integration (locked control, N humans, pass/forward/shoot/tackle/call, release to the AI, AI-only matches unchanged
// in cost) and the bibs (colour-blind-safe pair, keepers that clash with neither).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const J=load('lib/town/liveJoin.ts'),H=load('lib/town/match/humanInputs.ts'),A=load('lib/town/match/passAssist.ts'),R=load('lib/town/match/offBallRuns.ts'),B=load('lib/town/beanLooks.ts');
const {MatchSim}=load('lib/town/match/matchSim.ts');
const DT=1/30;
const outfieldIds=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);

// ---- 1. Format switch: the 7v7 opened first; futsal + 9v9 joined it (slice 3), the 11v11 (adult-tuned) on Nov 5 2026 ----
for(const f of ['7v7','futsal','9v9','11v11'])assert.equal(J.joinableFormat(f),true,f+' is joinable');
assert.equal(J.LIVE_JOIN_FORMATS['11v11'].maxHumansPerTeam,11,'11v11: the whole side, keeper included');
assert.equal(J.LIVE_JOIN_FORMATS.futsal.maxHumansPerTeam,5);assert.equal(J.LIVE_JOIN_FORMATS['9v9'].maxHumansPerTeam,9);
assert.equal(J.joinableFormat('beach'),true,'the Sharks Beach court is joinable (a Play-only bar: no beach lesson)');assert.equal(J.LIVE_JOIN_FORMATS.beach.maxHumansPerTeam,5,'beach: 5 a side, keeper included');
assert.equal(J.LIVE_JOIN_FORMATS['7v7'].maxHumansPerTeam,7,'7v7: the whole side, keeper included (human keepers)');
assert.equal(J.LIVE_JOIN_FORMATS['11v11'].humanSpeedCap,null,'11v11: adult pace, no speed cap (the sprint is held under the relay limit in MatchSim.humanSprintBoost)');

// ---- 2. Play from the pitch bar (owner decisions Nov 4 2026): no auto-join; Play → picker → Start; rides / flying land first ----
{const s=J.createJoinState(),on={onPitch:true,canOffer:true,canJoin:true,play:false,start:false,dismiss:false,leave:false},off={...on,onPitch:false};
 assert.equal(J.JOIN_COUNTDOWN,undefined,'no countdown any more');
 for(let i=0;i<600;i++)assert.equal(J.stepJoin(s,on),null,'standing on the pitch never joins by itself');
 assert.equal(J.stepJoin(s,{...off,play:true}),null,'Play only on a joinable pitch');
 assert.equal(J.stepJoin(s,{...on,canOffer:false,play:true}),null,'…and only when nothing else owns the player');
 assert.equal(J.stepJoin(s,{...on,play:true}),'pick');assert.equal(s.phase,'pick');
 for(let i=0;i<300;i++)assert.equal(J.stepJoin(s,on),null,'the picker waits for Start');
 assert.equal(J.stepJoin(s,off),'cancel','stepping off the pitch closes the picker');assert.equal(s.phase,'idle');
 J.stepJoin(s,{...on,play:true});assert.equal(J.stepJoin(s,{...on,dismiss:true}),'dismiss','Back / Esc');
 J.stepJoin(s,{...on,play:true});assert.equal(J.stepJoin(s,{...on,start:true}),'join','Start joins');assert.equal(s.phase,'joined');
 for(let i=0;i<60;i++)assert.equal(J.stepJoin(s,off),null,'chasing the ball over the line does not leave');
 assert.equal(J.stepJoin(s,{...on,leave:true}),'leave');assert.equal(s.phase,'idle');
 // riding or flying: the bar works (canOffer), Play opens the picker, Start waits until grounded + on foot (canJoin)
 const air={...on,canJoin:false};
 assert.equal(J.stepJoin(s,{...air,play:true}),'pick','Play while flying / riding opens the picker');
 assert.equal(J.stepJoin(s,{...air,start:true}),null,'Start waits while the jetpack lands / the ride stops');assert.equal(s.startPending,true);
 for(let i=0;i<20;i++)assert.equal(J.stepJoin(s,air),null);
 assert.equal(J.stepJoin(s,on),'join','grounded and on foot: the pending Start joins');
 J.stepJoin(s,{...on,leave:true});J.stepJoin(s,{...air,play:true});J.stepJoin(s,{...air,start:true});
 assert.equal(J.stepJoin(s,{...air,onPitch:false}),'cancel','flying off the pitch drops the pending Start');assert.equal(s.startPending,false);
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/const canOffer=!busy&&[^;]*;/,'the bar offers Play while riding or flying');assert(!/const canOffer=[^;]*rideRef\.current==='walk'/.test(town),'rides and flying are allowed for the bar');
 assert.match(town,/const canJoin=canOffer&&rideRef\.current==='walk'&&!pendingRide\.current&&!animalRides\.riding/,'the join itself waits for feet on the ground');
 assert.match(town,/liveJoin\.ground=\(\)=>\{if\(animalRides\.riding\)animalRides\.letGo\('off'\);if\(rideRef\.current!=='walk'&&pendingRide\.current!=='walk'\)selectRide\('walk'\);\}/,'Play / Learn reuse the existing dismount and jetpack landing');
 assert.match(town,/onLaunch=\{\(\)=>\{setHint\(false\);liveJoinRef\.current\?\.ground\(\);\}\} onPlay=\{\(\)=>liveJoinRef\.current\?\.press\('play',true\)\}/,'Learn lands too; Play feeds the picker');
 const card=fs.readFileSync('components/FieldPathCard.tsx','utf8');
 assert.match(card,/data-live-bar=""/);assert.match(card,/className="field-go" data-field-learn="" onClick=\{launch\}[^>]*>Learn<\/button>/,'Learn, no arrow');
 assert.match(card,/\{say&&<button/,'no lesson: Play alone');assert.match(card,/className="field-play" data-join-play=""[^>]*>Play<\/button>/);}

// ---- 3. Team choice: fewer humans; tie → the side you walked into; party preference ready ----
{const P=J.pickJoinTeam;
 assert.equal(P({gold:0,blue:0},330,6),'gold','tie, stepped on near y 392 (gold\'s own goal): gold');
 assert.equal(P({gold:0,blue:0},60,6),'blue','tie, stepped on near y 8 (blue\'s own goal): blue');
 assert.equal(P({gold:2,blue:1},330,6),'blue','fewer humans wins over the entry side');
 assert.equal(P({gold:6,blue:3},330,6),'blue');assert.equal(P({gold:6,blue:6},330,6),null,'match full');
 assert.equal(P({gold:1,blue:1},330,6,'blue'),'blue','friends preference when it keeps teams even');
 assert.equal(P({gold:1,blue:2},330,6,'blue'),'gold','preference never makes teams more uneven');}

// ---- 4. Slot: nearest outfield NPC, never the keeper, never another human, the carrier only as a last resort ----
{const players=[{id:'gk',team:'gold',isGK:true,x:135,y:385},{id:'a',team:'gold',isGK:false,x:100,y:300},{id:'b',team:'gold',isGK:false,x:200,y:320},{id:'c',team:'blue',isGK:false,x:120,y:310}];
 assert.equal(J.pickSlot(players,'gold',125,380,new Set()),'a','nearest outfield of the team; the keeper is skipped');
 assert.equal(J.pickSlot(players,'gold',125,380,new Set(['a'])),'b','a human\'s slot is taken');
 assert.equal(J.pickSlot(players,'gold',105,300,new Set(),new Set(['a'])),'b','the ball carrier is avoided');
 assert.equal(J.pickSlot(players,'gold',105,300,new Set(['b']),new Set(['a'])),'a','…unless nobody else is left');
 assert.equal(J.pickSlot(players,'gold',0,0,new Set(['a','b'])),null);}
// ---- 4b. Side + position pick (the card's step 2; slice 2 feeds friends through the same path) ----
{const players=[{id:'gk',team:'gold',isGK:true,x:135,y:385,role:'gk'},{id:'d1',team:'gold',isGK:false,x:95,y:330,role:'def'},{id:'m1',team:'gold',isGK:false,x:60,y:250,role:'mid'},{id:'m2',team:'gold',isGK:false,x:210,y:250,role:'mid'},{id:'f1',team:'gold',isGK:false,x:135,y:160,role:'fwd'}];
 assert.equal(J.pickSlot(players,'gold',100,340,new Set(),undefined,'fwd'),'f1','picked Forward: the forward, however far');
 assert.equal(J.pickSlot(players,'gold',200,260,new Set(),undefined,'mid'),'m2','nearest free player in the role');
 assert.equal(J.pickSlot(players,'gold',200,260,new Set(['m2']),undefined,'mid'),'m1','a human holds m2: the other midfielder');
 assert.equal(J.pickSlot(players,'gold',100,340,new Set(['f1']),undefined,'fwd'),'d1','role all taken: fall back to the nearest slot');
 assert.equal(J.pickSlot(players,'gold',140,165,new Set(),new Set(['f1']),'fwd'),'f1','the chosen role beats the carrier avoidance');
 assert.equal(J.chooseJoinTeam({gold:2,blue:0},330,6,'gold'),'gold','his side even when it has more humans (playing with friends)');
 assert.equal(J.chooseJoinTeam({gold:6,blue:0},330,6,'gold'),'blue','a full side falls back to the open one');
 assert.equal(J.chooseJoinTeam({gold:0,blue:0},60,6,null),'blue','no choice: pickJoinTeam');
 assert.deepEqual([...J.JOIN_ROLES],['def','mid','fwd'],'outfield only (no human keeper)');
 const sim=new MatchSim(7,'7v7'),roles=new Set(outfieldIds(sim,'gold').map(id=>sim.players[id].role));for(const r of J.JOIN_ROLES)assert(roles.has(r),'7v7 has a '+J.JOIN_ROLE_NAME[r]);
 for(const r of J.JOIN_ROLES)assert(J.JOIN_ROLE_TIP[r].length<60,'one-line position lesson');
 // the position dropdown names every slot of the side from the sim's own slot ids
 const names=sim.ids.filter(id=>sim.players[id].team==='gold').map(id=>J.slotName(id,'gold',sim.players[id].role));
 assert.equal(JSON.stringify(names.slice().sort()),JSON.stringify(['Centre Mid','Goalkeeper','Left Centre Back','Left Mid','Right Centre Back','Right Mid','Striker']),'7v7 gold: '+names.join(', '));
 assert.equal(J.slotName('dst','blue','fwd'),'Striker');assert.deepEqual(['cb','lm','rm','st'].map(i=>J.slotName(i,'gold','mid','futsal')),['Fixo','Left Ala','Right Ala','Pivot'],'futsal position names');assert.equal(J.slotName('dst','blue','fwd','futsal'),'Pivot');assert.equal(J.slotName('dlb','blue','def'),'Left Back');assert.equal(J.slotName('zz','gold','mid'),'Midfield','role fallback');
 for(const f of ['9v9','11v11','futsal']){const m=new MatchSim(3,f);for(const id of m.ids)assert(!/Player|Defender|Midfield|Forward/.test(J.slotName(id,m.players[id].team,m.players[id].role)),f+' '+id+' has a real name');}
 assert.equal(sim.humanKeepers,true,'the Goalkeeper is a pickable position (human keepers, Nov 4 2026)');}

// ---- 5. The replaced NPC walks to the touchline, then cheers (no pop) ----
{const o={x:0,y:0};J.touchlineSpot(200,150,0,o);assert(o.x>260,'right touchline, outside the lines');assert.equal(o.y,150);
 J.touchlineSpot(60,150,0,o);assert(o.x<10,'left touchline');J.touchlineSpot(60,150,1,o);assert.equal(o.y,164,'a second one sits next to him');
 const w={id:'a',phase:'off',x:200,y:150,tx:270,ty:150,age:0};let changed=0,t=0;for(;t<10&&w.phase==='off';t+=DT)changed+=J.stepBench(w,DT)?1:0;
 assert.equal(w.phase,'cheer');assert.equal(changed,1);assert(t>70/J.BENCH_SPEED-.1,'he walks there, no teleport');
 assert.equal(J.cheerAge(1),1);assert.equal(J.cheerAge(5),-1,'rests between cheers');assert.equal(J.cheerAge(7.5),.5);}

// ---- 6. Multi-human input map ----
{const h=H.createHumanInput('m1','gold');H.writeHumanInput(h,{mx:0,my:-1,pass:true,sprint:true});
 assert.equal(h.mag,1);assert.equal(h.faceY,-1);assert(h.pass>0);assert.equal(h.sprint,true);
 H.writeHumanInput(h,{mx:0,my:0});assert.equal(h.faceY,-1,'aim remembered after the stick is released');assert.equal(h.sprint,false);
 H.tickHumanInput(h,.1,false);assert(h.pass>0,'buffered for a moment');H.tickHumanInput(h,.1,false);assert.equal(h.pass,0);
 H.writeHumanInput(h,{mx:0,my:0,shoot:true});for(let i=0;i<30;i++)H.tickHumanInput(h,DT,true);assert(h.shoot>0,'on the ball nothing expires');
 H.writeHumanInput(h,{mx:0,my:0,call:true});assert.equal(h.call,H.CALL_HEARD);
 assert.deepEqual({...H.humanCounts([{team:'gold'},{team:'blue'},{team:'gold'}])},{gold:2,blue:1});}

// ---- 7. Pass assist ----
{const P=(id,team,x,y,vx=0,vy=0,isGK=false)=>({id,team,x,y,vx,vy,isGK});
 const players={me:P('me','gold',135,250),left:P('left','gold',70,200),right:P('right','gold',200,200),back:P('back','gold',135,320),gk:P('gk','gold',135,385,0,0,true),d1:P('d1','blue',150,150),d2:P('d2','blue',100,120)};
 const ids=Object.keys(players),ctx=(aimX,aimY,mode='short',extra={})=>({from:players.me,aimX,aimY,dirY:-1,ids,players,mode,offsideY:null,...extra});
 assert.equal(A.pickPassTarget(ctx(-1,-.8)),'left','aim up-left → the left teammate');
 assert.equal(A.pickPassTarget(ctx(1,-.8)),'right','aim up-right → the right teammate');
 assert.equal(A.pickPassTarget(ctx(0,1)),'back','aim back → the support behind');
 assert.notEqual(A.pickPassTarget(ctx(0,0)),'back','no stick: the open teammate AHEAD, not backwards');
 assert.equal(A.scorePassTarget(ctx(0,-1),'gk'),-Infinity,'never the keeper');
 // blocked lane: a defender standing on the line to the right teammate
 const blocked={...players,d3:P('d3','blue',168,225)},ib=Object.keys(blocked);
 const open=A.scorePassTarget({...ctx(1,-.8),players:blocked,ids:ib},'left'),shut=A.scorePassTarget({...ctx(1,-.8),players:blocked,ids:ib},'right'),clear=A.scorePassTarget(ctx(1,-.8),'right');
 assert(shut<clear-30,'a defender in the lane costs the pass a lot ('+shut.toFixed(1)+' vs '+clear.toFixed(1)+')');
 assert.equal(A.pickPassTarget({...ctx(0,-1),players:blocked,ids:ib}),'left','a near-tie goes to the open lane');void open;
 // hysteresis: a marginally better pick does not steal the marker; a clearly better one does after minHold
 const st={id:'left',age:0};A.stickyTarget(st,.1,'right',50,45);assert.equal(st.id,'left','small margin: keep');
 A.stickyTarget(st,.1,'right',80,45);assert.equal(st.id,'left','big margin but inside minHold: keep');
 A.stickyTarget(st,.3,'right',80,45);assert.equal(st.id,'right','big margin after minHold: switch');
 A.stickyTarget(st,.01,'left',10,-Infinity);assert.equal(st.id,'left','an invalid shown target switches at once');
 // lead + pace
 const out={x:0,y:0};A.leadPoint(135,250,{x:135,y:150,vx:0,vy:-40},out);assert(out.y<150-10&&out.y>150-A.PASS_ASSIST.maxLead-1,'a runner is led into his run ('+out.y.toFixed(1)+')');
 A.leadPoint(135,250,{x:135,y:150,vx:0,vy:0},out);assert.equal(out.y,150,'a standing receiver gets it to feet');
 A.leadPoint(135,250,{x:135,y:150,vx:0,vy:-40},out,A.PASS_ASSIST.throughSpace);assert(out.y<150-25,'a forward pass goes further into space');
 for(const d of [20,60,120,170]){const v=A.passSpeedFor(d),k=A.PASS_ASSIST.friction,arrive=v-k*d;assert(arrive>=A.PASS_ASSIST.arriveSpeed-1e-9||v===A.PASS_ASSIST.minSpeed||v===A.PASS_ASSIST.maxSpeed&&arrive>40,'arrives with pace at '+d);assert(Number.isFinite(A.rollTime(d,v)),'reaches '+d);}
 assert(A.passSpeedFor(400)===A.PASS_ASSIST.maxSpeed,'capped');
 // offside-safe forward pass
 const fwd={...players,run:P('run','gold',150,140,0,-50)},fi=Object.keys(fwd);
 assert.equal(A.pickPassTarget({...ctx(0,-1,'forward'),players:fwd,ids:fi,offsideY:130,runners:new Set(['run'])}),'run','forward pass finds the runner');
 assert.equal(A.scorePassTarget({...ctx(0,-1,'forward'),players:fwd,ids:fi,offsideY:150},'run'),-Infinity,'never to a receiver standing offside');
 assert.equal(A.scorePassTarget(ctx(0,1,'forward'),'back'),-Infinity,'a forward pass goes forward');
 // shot aim assist
 const aim=A.shotAim(135,140,19);assert(aim<135&&aim>135-19,'keeper leaning right: the shot bends left, inside the post');
 assert(Math.abs(A.shotAim(160,135,19)-(135+19*A.PASS_ASSIST.shotPostInset))<1e-9,'a wide aim is kept inside the post');
 assert(Math.abs(A.shotAim(120,150,19)-120)<=A.PASS_ASSIST.shotMaxNudge,'small nudge only');}

// ---- 8. Off-ball runs ----
{const c=R.createRunContext(),o={x:0,y:0};
 Object.assign(c,{px:150,py:180,hx:150,role:'fwd',dirY:-1,carrierX:140,carrierY:250,carrierTime:20,supportNear:1});
 assert.equal(R.pickOffBallRun(c,.1,o),R.RUN.Beyond,'a forward ahead of a carrier with time runs in behind');assert(o.y<-20);
 assert.equal(R.pickOffBallRun(c,.99,o),R.RUN.Hold);
 Object.assign(c,{carrierTime:4});assert.notEqual(R.pickOffBallRun(c,.1,o),R.RUN.Beyond,'no run in behind when the carrier is pressed');
 Object.assign(c,{px:145,py:245,carrierTime:20});assert.equal(R.pickOffBallRun(c,.1,o),R.RUN.Space,'too close to the carrier: make space');assert(Math.hypot(o.x,o.y)>5);
 Object.assign(c,{px:100,py:300,hx:100,role:'mid',carrierX:140,carrierY:150,humanX:NaN,supportNear:0});assert.equal(R.pickOffBallRun(c,.9,o),R.RUN.Check,'far away, nobody near the ball: check toward it');assert(o.y<0);
 Object.assign(c,{supportNear:2,px:30,hx:30,py:160});assert.equal(R.pickOffBallRun(c,.9,o),R.RUN.Wide,'a wide player holds the touchline');
 Object.assign(c,{px:150,py:200,hx:150,role:'mid',carrierX:60,carrierY:200,humanX:160,humanY:205,supportNear:1});assert.equal(R.pickOffBallRun(c,.9,o),R.RUN.Space,'peel off a human teammate to give him room');
 Object.assign(c,{role:'gk'});assert.equal(R.pickOffBallRun(c,.1,o),R.RUN.Hold);
 Object.assign(c,{role:'fwd',px:150,py:150,hx:150,carrierX:140,carrierY:300,humanX:NaN,carrierTime:20});R.pickOffBallRun(c,0,o);assert(Math.hypot(o.x,o.y)<=R.RUNS.maxOffset+1e-9,'bounded offsets');}

// ---- 9. MatchSim: humans locked to their slots, N per match, assist, call, release ----
const outfield=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
{const sim=new MatchSim(270+41,'7v7');sim.windupScale=.32;
 for(let i=0;i<60;i++)sim.step(DT);
 const [a]=outfield(sim,'gold'),[b]=outfield(sim,'blue');
 assert.equal(sim.lockHuman('nobody'),false,'unknown slot');
 assert(sim.lockHuman(a)&&sim.lockHuman(b),'two humans, one per team');assert.equal(sim.humans.size,2);assert.deepEqual({...sim.humanOn},{gold:1,blue:1});
 // locked: whoever has the ball, the humans stay on their slots; idle humans hold still
 sim.placePlayer(a,135,300);const start={x:sim.players[a].x,y:sim.players[a].y};
 for(let i=0;i<240;i++){sim.humanInput(a,{mx:0,my:0});sim.humanInput(b,{mx:0,my:0});sim.step(DT);}
 assert(sim.humans.has(a)&&sim.humans.has(b),'control never jumps');
 const moved=Math.hypot(sim.players[a].x-start.x,sim.players[a].y-start.y);
 // (a pass played to him is still met, so allow a little)
 assert(moved<40||sim.ball.target===a||sim.ball.owner===a,'an idle human holds his spot ('+moved.toFixed(1)+')');
 // the stick moves him
 const y0=sim.players[a].y;for(let i=0;i<30;i++){sim.humanInput(a,{mx:0,my:-1});sim.step(DT);}assert(sim.players[a].y<y0-10,'stick up runs him up the pitch');
 // give him the ball: the assist shows a target, a Pass reaches a teammate, led and weighted
 sim.ball.owner=a;sim.possession='gold';sim.ball.x=sim.players[a].x;sim.ball.y=sim.players[a].y;sim.ball.vx=sim.ball.vy=0;
 sim.humanInput(a,{mx:0,my:-1});sim.step(DT);
 const shown=sim.humanTarget(a,'short');assert(shown&&sim.players[shown].team==='gold'&&!sim.players[shown].isGK,'Pass target shown');assert.equal(sim.passTargetId,shown);
 let flips=0,last=shown;for(let i=0;i<30;i++){sim.ball.owner=a;sim.humanInput(a,{mx:.05*Math.sin(i),my:-1});sim.step(DT);const t=sim.humanTarget(a,'short');if(t!==last){flips++;last=t;}}
 assert(flips<=1,'the marker does not flicker under a wobbly stick ('+flips+' changes)');
 sim.ball.owner=a;sim.humanInput(a,{mx:0,my:-1,pass:true});sim.step(DT);
 assert.notEqual(sim.ball.owner,a,'the pass leaves his foot');assert(sim.ball.target||sim.ball.intBy,'played to a player');
 const sp=Math.hypot(sim.ball.vx,sim.ball.vy);assert(sp>=180&&sp<=420*1.3+1,'weighted pace ('+sp.toFixed(0)+')');
 // shoot
 for(let i=0;i<20;i++)sim.step(DT);
 sim.restart=null;sim.ball.owner=a;sim.possession='gold';sim.placePlayer(a,135,90);sim.ball.x=135;sim.ball.y=90;sim.humanInput(a,{mx:0,my:-1,shoot:true,shootPower:1});const shots=sim.stats.shots;sim.step(DT);
 assert.equal(sim.stats.shots,shots+1,'Shoot strikes at goal');assert(sim.ball.vy<0,'toward the goal he attacks');assert(Math.abs(sim.lastKick.aimX-135)<19,'aimed inside the posts');
 // release: the AI takes the slot back from the same spot
 sim.releaseHuman(b);assert.equal(sim.humans.has(b),false);assert.deepEqual({...sim.humanOn},{gold:1,blue:0});assert.equal(sim.userId,a);
 sim.releaseHuman(a);assert.equal(sim.userId,null);assert.equal(sim.humans.size,0);}

// tackle (with the mild reach assist) and call for the ball
{const sim=new MatchSim(270+41,'7v7');sim.windupScale=.32;for(let i=0;i<90;i++)sim.step(DT);
 const me=outfield(sim,'gold')[1],foe=outfield(sim,'blue')[1];sim.lockHuman(me);
 let won=0;for(let k=0;k<20;k++){sim.restart=null;sim.ball.owner=foe;sim.possession='blue';sim.protect=0;sim.placePlayer(foe,140,200);sim.placePlayer(me,140,200+4.2+2.8);sim.ball.x=140;sim.ball.y=200;
  sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);if(sim.ball.owner===me)won++;}
 assert(won>=8,'a well-timed tackle (just outside the old reach) usually wins it ('+won+'/20)');
 // Call: an AI teammate on the ball with an open lane plays it to the caller
 const mate=outfield(sim,'gold').find(id=>id!==me);let answered=0;
 for(let k=0;k<10;k++){sim.restart=null;sim.ball.owner=mate;sim.possession='gold';sim.passCd=0;sim.protect=0;sim.placePlayer(mate,135,250);sim.ball.x=135;sim.ball.y=250;sim.placePlayer(me,175,215);
  for(const id of outfield(sim,'blue'))sim.placePlayer(id,30+outfield(sim,'blue').indexOf(id)*8,60);
  sim.humanInput(me,{mx:0,my:0,call:true});for(let i=0;i<20;i++){sim.step(DT);if(sim.ball.target===me||sim.ball.owner===me){answered++;break;}}}
 assert(answered>=8,'the carrier answers an open call ('+answered+'/10)');assert(sim.lastCall&&sim.lastCall.id===me);}

// Position dropdown regression (owner bug Nov 4: "Choose" + an empty list): rows and a default for each side, also after toggling
{const sim=new MatchSim(7,'7v7');for(let i=0;i<30;i++)sim.step(DT);let pick=null;
 for(const team of ['gold','blue','gold']){const rows=J.slotOptions(sim,team);assert.equal(rows.length,7,team+': every slot listed');
  pick=J.defaultSlot(sim,team,pick,135,team==='gold'?330:70);const row=rows.find(r=>r.value===pick);assert(row&&!row.disabled,team+': a default is selected right away ('+pick+')');
  assert.equal(sim.players[pick].team,team,'toggling the side re-picks on that side');assert(!sim.players[pick].isGK,'default is outfield');
  assert.equal(rows[0].label,'Goalkeeper','keeper first');assert.equal(rows[0].disabled,!sim.humanKeepers);}
 const me=outfieldIds(sim,'blue')[0];sim.lockHuman(me);const rows=J.slotOptions(sim,'blue');assert.equal(rows.find(r=>r.value===me).disabled,true,'a human\'s slot is greyed');
 assert.notEqual(J.defaultSlot(sim,'blue',me,135,70),me,'…and never the default');sim.releaseHuman(me);
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');assert.match(rt,/__fi2JoinSlots\?\?=/,'one store per page (a hot reload never empties the list)');
 assert.match(rt,/publishSlots\(slotOptions\(sim,pickTeam(,friends)?(,pickFormat)?\),pickId\?\?''\)/,'fresh rows on every pick render');}

// Sprint (owner, Nov 4 2026): a held button gives a stable, clearly faster run, eased in and out (no snap, no flicker)
{const sim=new MatchSim(311,'7v7');sim.windupScale=.32;const me=outfieldIds(sim,'gold')[0];sim.lockHuman(me);const p=sim.players[me],sp=[];
 for(let i=0;i<100;i++){p.x=20;p.y=200;sim.humanInput(me,{mx:0,my:-1,sprint:i>=20&&i<80});sim.step(DT);sp.push(sim.restart||sim.goalHold>0?NaN:Math.hypot(p.vx,p.vy));}
 const run=sp[19],held=sp.slice(36,80).filter(Number.isFinite);assert(held.length>=30,'a clean sprint window');
 const lo=Math.min(...held),hi=Math.max(...held);assert(hi-lo<1.5,'stable while held ('+lo.toFixed(1)+'..'+hi.toFixed(1)+')');
 assert(lo/run>=1.35&&hi/run<=1.5,'clearly faster than the run: x'+(lo/run).toFixed(2));
 assert(sp[21]<run*1.08&&sp[26]>sp[21]&&sp[26]<lo,'short ease-in, not instant');
 for(let i=81;i<100;i++)if(Number.isFinite(sp[i])&&Number.isFinite(sp[i-1]))assert(sp[i]<=sp[i-1]+.5&&sp[i]>=run*.97,'release eases back to the run ('+i+')');
 assert(Math.abs(sp[99]-run)<2,'back to the plain run');
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
 assert(!/liveJoin\.steer\([^;]*Math\.hypot/.test(town),'sprint is never the stick magnitude (it flickered near full push)');
 assert.match(rt,/sprint:sprint\|\|held\.s/,'the HUD Sprint button is a held state');}
// Hold-to-charge Pass: a tap keeps the assisted pace, a full hold plays it up to PASS_POWER_MAX x, same target
{const pace=power=>{const sim=new MatchSim(270+41,'7v7');sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(DT);const a=outfieldIds(sim,'gold')[1];sim.lockHuman(a);
  sim.restart=null;sim.ball.owner=a;sim.possession='gold';sim.placePlayer(a,135,260);sim.ball.x=135;sim.ball.y=260;sim.ball.vx=sim.ball.vy=0;
  sim.humanInput(a,{mx:0,my:-1});sim.step(DT);sim.ball.owner=a;sim.humanInput(a,{mx:0,my:-1,pass:true,passPower:power});sim.step(DT);
  return {sp:Math.hypot(sim.ball.vx,sim.ball.vy),to:sim.ball.target||sim.ball.intBy};};
 const tap=pace(0),full=pace(1),half=pace(.5);assert(tap.sp>0&&full.sp>0,'both passes leave the foot');assert.equal(full.to,tap.to,'charging never changes the assisted target');
 const k=full.sp/tap.sp;assert(Math.abs(k-H.PASS_POWER_MAX)<.12,'full hold x'+k.toFixed(2));assert(half.sp>tap.sp&&half.sp<full.sp,'power grows with the hold');
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');assert.match(rt,/passNow=aUp&&\(aMode==='pass'\|\|aMode==='throw'\)&&mode\.a===aMode/,'Pass (and a keeper\'s Throw) strikes on RELEASE (charge first)');}

// AI-only matches pay nothing for the human code (no pass-assist work when nobody is human)
{const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');
 assert.match(src,/if \(this\.humans\.size\) \{\n\s*const owner = this\.ball\.owner, h = owner \? this\.humans\.get\(owner\) : undefined;/,'pass assist only with humans');
 assert.match(src,/if \(this\.humans\.size\) this\.applyHumanTargets\(\);/);
 assert(!/updateUserPlayer|dirSwitchTarget/.test(src),'no FIFA-style auto-switching left');}

// ---- 9b. Human keeper (owner, Nov 4 2026: "you can even play as goalie now") ----
// Gold's keeper 'gk' defends y 392. A scripted shot from the edge of the box: a corner beats a keeper who stays put,
// Save (A, aimed by the assist at the shot line, buffered so an early press counts) stops it; Throw / Kick distribute;
// past six seconds the AI plays it for him; on leave the AI keeper walks back into goal.
{const HK=load('lib/town/match/matchSim.ts').HUMAN_KEEPER,DTL=DT*.32;
 const fresh=()=>{const sim=new MatchSim(311,'7v7');sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(DT);return sim;};
 const striker=sim=>sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].role==='fwd');
 const shoot=(sim,from,aimx,speed=330)=>{const b=sim.ball;sim.placePlayer(from,150,330);sim.restart=null;sim.windup=null;sim.passRelease=null;
  Object.assign(b,{owner:null,target:null,intBy:null,x:150,y:333,height:0,lofted:false});const dx=aimx-b.x,dy=392-b.y,L=Math.hypot(dx,dy);b.vx=dx/L*speed;b.vy=dy/L*speed;
  Object.assign(sim,{ballIsShot:true,shotIsGoal:false,ballFlight:0,lastFrom:from,possession:'blue',saveRoll:.5});sim.lastKick.shotHeight=0;};
 const trial=(aimx,press)=>{const sim=fresh();assert(sim.lockHuman('gk'),'a human takes the keeper slot');sim.placePlayer('gk',135,384);const before=sim.score.blue;
  for(let i=0;i<5;i++){sim.humanInput('gk',{mx:0,my:0});sim.step(DTL);}
  if(press==='early')sim.humanInput('gk',{mx:0,my:0,save:true});// pressed just before the strike: buffered
  shoot(sim,striker(sim),aimx);
  for(let i=0;i<120;i++){sim.humanInput('gk',{mx:-1,my:0,save:press==='now'&&i===1});sim.step(DTL);if(sim.ball.owner==='gk'||sim.score.blue>before)break;}
  return {sim,goal:sim.score.blue>before,caught:sim.ball.owner==='gk'};};
 {const sim=fresh();assert(sim.lockHuman('gk'));assert.deepEqual({...sim.humanOn},{gold:1,blue:0});assert.equal(sim.userId,'gk');}
 assert(trial(153,null).goal,'a corner beats a keeper who stays on the spot');
 for(const aim of [153,118]){const t=trial(aim,'now');assert(!t.goal&&t.caught,'Save dives at the shot line (stick pointing the other way) and catches it: '+aim);}
 assert(trial(150,'early').caught,'a press just before the strike still saves (input buffer)');
 assert(trial(135,null).caught,'a shot at him is caught without a press');
 // stick: moves him, clamped to his box (the area the AI keeper uses); no sprint in goal
 {const sim=fresh();sim.lockHuman('gk');for(let i=0;i<900;i++){sim.humanInput('gk',{mx:.6,my:-.8,sprint:true});sim.step(DTL);}const g=sim.players.gk;
  assert(g.x<=135+HK.boxHalf+1.5&&g.y>=392-HK.boxDepth-1.5,'kept in his box: '+g.x.toFixed(1)+','+g.y.toFixed(1));assert(g.y<392-HK.boxDepth+6,'but he does come off his line');}
 // distribution: Throw (A) to a teammate, Kick (B) long; holding it past six seconds, the AI plays it
 const caught=()=>{const t=trial(135,null);assert(t.caught&&t.sim.keeperHands,'in his hands');return t.sim;};
 for(const kind of ['pass','shoot','none']){const sim=caught();let real=0;const y0=sim.ball.y;
  for(let i=0;i<1200&&sim.ball.owner==='gk';i++){sim.humanInput('gk',{mx:0,my:-.3,pass:kind==='pass'&&i===20,shoot:kind==='shoot'&&i===20,passPower:1});sim.step(DTL);real+=DT;}
  assert.notEqual(sim.ball.owner,'gk',kind+': the ball leaves his hands');const to=sim.ball.target||sim.ball.owner;assert(to&&sim.players[to].team==='gold',kind+': to a teammate');
  if(kind==='none')assert(real>HK.holdSeconds-.2&&real<HK.holdSeconds+1,'six-second rule: the AI distributes after '+real.toFixed(2)+' s');else assert(real<1.2,kind+' plays at once');}
 // on leave: the AI keeper walks back into goal from the touchline (fieldRuntime places him at his bench spot)
 {const sim=fresh();sim.lockHuman('gk');sim.placePlayer('gk',268,300);sim.releaseHuman('gk');assert.equal(sim.humans.size,0);for(let i=0;i<300;i++)sim.step(DT);
  const g=sim.players.gk;assert(Math.abs(g.x-135)<30&&g.y>350,'the AI keeper is back in goal: '+g.x.toFixed(0)+','+g.y.toFixed(0));}
 // the AI never pre-decides a goal against a human keeper (he decides it); AI-only matches are byte-identical (fixture)
 const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');assert.match(src,/this\.shotIsGoal = roll < xg && !humanGk;/);
 {const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
  for(const e of expected.filter(e=>e.format==='7v7'))assert.deepEqual(S.summary(MatchSim,'7v7',e.seed),e,'AI-only 7v7 unchanged (seed '+e.seed+')');}
 // HUD: Save / Throw / Kick on the existing buttons, one keeper lesson, the dropdown's Goalkeeper enabled, keeper kit on join
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 assert.match(rt,/save:'Save',throw:'Throw',kick:'Kick'/);assert.match(rt,/save:'Stay on your line, dive at the shot\.'/);assert(!rt.includes("(soon)"),'no "(soon)" in the position dropdown');
 assert.match(fr,/dressFor\(team==='gold',kits,p\.isGK\)/,'the keeper kit + gloves in the join dress path');assert.match(fs.readFileSync('components/Town.tsx','utf8'),/matchPlayerDress\('you',home\?'home':'away',!!keeper,/);}

// ---- 10. Bibs: bright, colour-blind-safe pair; keepers clash with neither; no new materials ----
{const k=B.LIVE_BIB_KITS['7v7'];assert.equal(k.home.shirt,'#ffd23f');assert.equal(k.away.shirt,'#2459e0');
 assert(B.colourDistance(k.home.shirt,k.away.shirt)>140,'ΔE yellow vs royal');
 for(const f of Object.keys(B.LIVE_BIB_KITS)){const m=B.LIVE_BIB_KITS[f];assert(!B.kitsClash(m.home,m.away),f);for(const kp of [m.homeKeeper,m.awayKeeper])assert(!B.kitsClash(kp,m.home)&&!B.kitsClash(kp,m.away),f+' keeper');assert(!B.kitsClash(m.homeKeeper,m.awayKeeper),f+' keepers');}
 assert.notEqual(k.homeKeeper.shirt,'#d9ec3a','the volt keeper is skipped next to yellow');
 assert.equal(B.liveMatchKits('7v7',false,true),k);assert.equal(B.liveMatchKits('7v7',false,false),undefined,'a non-joinable pitch keeps its kits');assert.equal(B.liveMatchKits('beach',true,true),B.BEACH_MATCH_KITS);
 assert.equal(B.bibColour('7v7',true),'#ffd23f');
 const fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');assert.match(fr,/liveMatchKits\(v\.id,!!v\.sand,joinableFormat\(v\.id\)\)/,'per-instance kit data through the existing batch');}

// ---- 11. Town wiring (the Rooftop Knockout pattern) + heat ----
{const town=fs.readFileSync('components/Town.tsx','utf8'),rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 assert.match(town,/const at=liveJoin\.position\(joinPoint\);if\(at\)\{location\.x=at\.x;location\.z=at\.z;/,'the camera and minimap follow your slot');
 assert.match(town,/fieldBumpCtx\.disabled=[^;]*liveJoin\.joined;/,'no field bumps while joined');
 assert.match(town,/const walkingBall=[^;]*!liveJoin\.joined;/,'the walk ball goes to the kit bag');
 assert.match(town,/if\(liveJoin\.joined\)ball\.visible=false;/);
 assert.match(town,/player\.root\.visible=[^;]*!liveJoin\.joined;/,'the slot rig is you; the avatar is hidden');
 for(const gate of ['liveKnockout.joined||liveJoin.joined||animalRides','moveUiOpen.current||liveKnockout.joined||liveJoin.joined'])assert(town.includes(gate),'gate: '+gate);
 assert.match(town,/inspectEnabled=[^;]*!liveJoin\.joined;/,'hovering a player never pauses the match you play in');
 assert.match(town,/<LiveJoinStack onPress=/);assert.match(town,/<LiveJoinActions onPress=/);
 assert.match(rt,/if\(!v&&state\.phase==='idle'\)\{pressed\.play=false;if\(pickFormat\)/,'far from a joinable pitch: one rectangle test, no DOM work');
 const hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8');assert(!/data-join-count|join-progress/.test(hud+rt),'no countdown ring');
 for(const k of ['data-join-side','data-join-slot','data-join-start','data-join-back','BackButton immediate','data-join-modal','party.dialog'])assert(hud.includes(k),'picker: '+k);assert(!/data-join-arrow|data-join-role/.test(hud),'no arrows on the sides, a dropdown for positions');
 assert.match(rt,/dlg\.animate\(\[growFrame\(playRect,dlg\),growFrame\(null,dlg\)\]/,'the picker grows out of Play (the party modal morph)');assert.match(fs.readFileSync('components/party/PartyHost.tsx','utf8'),/from '@\/lib\/ui\/growFrame'/,'one shared grow');assert(!/data-join-lesson|Take Lesson|data-join-step1/.test(hud),'no separate Play / Learn card');
 assert.match(rt,/pick=\{team:pickTeam,slot:pickId\}[\s\S]{0,300}?shrink\(reduced,\(\)=>\{[^\n]*games\.joinMatch\(f,ME,x,z,dressFor,null,pick\)/,'Start: shrink back into Play, then the slot is taken');assert.match(rt,/function shrink\(reduced:boolean,after\?:\(\)=>void\)/);assert.match(rt,/\.field-learn-card:not\(\[hidden\]\) \[data-join-play\]'\)\?\.getBoundingClientRect\(\);if\(live&&live\.width>0\)playRect=live/,'shrinks into the bar\'s Play where it is now');assert(!/data-live-pick\] \.field-learn-card/.test(fs.readFileSync('app/globals.css','utf8')),'the bar stays up under the picker');
 const hudSrc=fs.readFileSync('components/LiveJoinHud.tsx','utf8');assert.match(hudSrc,/<IslandSelect label="Position"/,'the island dropdown, not the native select');assert(!/<select/.test(hudSrc));assert.match(hudSrc,/<footer className=\{styles\.foot\}>\s*<BackButton[^>]*data-join-back[\s\S]*?data-join-start/,'Back bottom-left, Start right');
 assert.match(rt,/e\.key==='Escape'[^}]*press\('dismiss',true\)/,'Esc dismisses the card');assert.match(rt,/e\.key==='Enter'&&!e\.repeat&&venueAt\(lastX,lastZ,JOIN_PITCH_MARGIN\)\)\{[^}]*press\('play',true\)/,'Enter = Play on the pitch');assert.match(rt,/e\.key==='Enter'\|\|e\.key===' '\)\{[^}]*press\('start',true\)/,'Enter / Space = Start in the picker');
 assert.match(fr,/a joined field is never dormant: the joiner stands on it/,'the joined field never sleeps (the player is on it)');
 assert.match(fr,/e\.humans\.size>0;/,'and is never throttled');
 const tips=[...rt.slice(rt.indexOf('JOIN_TIPS={'),rt.indexOf('} as const;')).matchAll(/:'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]);assert(tips.length>=8,'a lesson for every action');for(const t of tips)assert(t.length<80,'one-line lesson: '+t);
 assert(/pass into the space where they are running/i.test(rt)&&/open player/i.test(rt),'the assist captions name the idea');}

// ---- Camera angle button (owner, Nov 4 2026): Broadcast → Behind you → Wide → Close, eased, controls screen-relative ----
{const C=load('lib/town/liveJoinCamera.ts'),V=load('lib/town/venues.ts'),v=V.liveVenueById('7v7');
 assert.deepEqual([...C.JOIN_CAM_ANGLES],['broadcast','side','behind','wide','close'],'five angles, Broadcast (today\'s view) first, then Side');assert.equal(C.JOIN_CAM_LABEL.side,'Side');
 assert.equal(C.nextJoinCamAngle('close'),'broadcast','the button cycles back round');for(const a of C.JOIN_CAM_ANGLES)assert(C.JOIN_CAM_LABEL[a].length<=12,'a short toast: '+a);
 assert.equal(C.isJoinCamAngle('wide'),true);assert.equal(C.isJoinCamAngle('drone'),false);assert.equal(C.isJoinCamAngle(null),false);
 const pitch={x:v.x,z:v.z,width:v.width,length:v.length,yaw:v.yaw??0,ground:0},f=C.createJoinCamFrame(),deg=r=>r*180/Math.PI;
 const attack=t=>{const y=V.liveWorldYaw(v,0,t==='gold'?-1:1);return {x:Math.sin(y),z:Math.cos(y)};};
 assert.equal(C.joinCamFrame('broadcast',v.x,v.z,0,-1,pitch,1.6,43,f),false,'Broadcast leaves Town\'s camera alone');
 // Close: the broadcast direction, nearer (same screen directions as Broadcast)
 assert(C.joinCamFrame('close',v.x+3,v.z+5,0,-1,pitch,1.6,43.3,f));{const ex=f.ex-f.lx,ey=f.ey-f.ly,ez=f.ez-f.lz,d=Math.hypot(ex,ey,ez);
  assert(Math.abs(ex/d-16/43.3)<.01&&Math.abs(ez/d-33/43.3)<.01,'close keeps the view direction');assert(d<26&&d>18,'close is ~55% of the follow distance: '+d.toFixed(1));}
 for(const t of ['gold','blue'])for(const aspect of [.46,1.6]){const a=attack(t),px=v.x+4,pz=v.z+(t==='gold'?8:-8);
  // Behind you: behind the player on the attack axis, looking at the goal you attack (never your facing)
  C.joinCamFrame('behind',px,pz,a.x,a.z,pitch,aspect,43,f);const fx=f.lx-f.ex,fz=f.lz-f.ez,fl=Math.hypot(fx,fz);
  assert(Math.abs(fx/fl-a.x)<1e-6&&Math.abs(fz/fl-a.z)<1e-6,t+': behind looks down the attack axis');assert(f.ey>4&&f.ey<12,'a low chase height');
  assert(((px-f.ex)*a.x+(pz-f.ez)*a.z)>8,'the eye sits behind you');
  // Wide: high, from behind your own goal, the whole pitch length in the vertical fov (teammate spacing)
  C.joinCamFrame('wide',px,pz,a.x,a.z,pitch,aspect,43,f);const wx=f.lx-f.ex,wy=f.ly-f.ey,wz=f.lz-f.ez,wl=Math.hypot(wx,wy,wz);
  assert(deg(Math.asin(-wy/wl))>50,'wide looks steeply down');assert(Math.abs(Math.hypot(wx,wz)/Math.hypot(wx,wz)*(wx*a.x+wz*a.z)/Math.hypot(wx,wz)-1)<1e-6,'wide faces the attack');
  for(const end of [-1,1]){const gx=v.x+a.x*end*v.length/2,gz=v.z+a.z*end*v.length/2,dx=gx-f.ex,dy=-f.ey,dz=gz-f.ez,dl=Math.hypot(dx,dy,dz);
   const ang=deg(Math.acos((dx*wx+dy*wy+dz*wz)/(dl*wl)));assert(ang<20.5,`${t} ${aspect}: both goal lines inside the 40° fov (${ang.toFixed(1)}°)`);}
  {const dx=px-f.ex,dy=-f.ey,dz=pz-f.ez,dl=Math.hypot(dx,dy,dz);assert(deg(Math.acos((dx*wx+dy*wy+dz*wz)/(dl*wl)))<20,'you stay in the wide frame');}}
 // Side (owner, Nov 4 2026, the FIFA TV view): from the touchline looking ACROSS, the goal you attack on the RIGHT of the screen,
 // tracking you along the length, the pitch width in frame (a portrait phone zooms out), stick screen-relative + held on switch
 for(const t of ['gold','blue'])for(const aspect of [.46,1.6]){const a=attack(t);
  C.joinCamFrame('side',v.x+3,v.z+10*(t==='gold'?1:-1),a.x,a.z,pitch,aspect,43,f);const fx=f.lx-f.ex,fy=f.ly-f.ey,fz=f.lz-f.ez,fl=Math.hypot(fx,fz),fd=Math.hypot(fx,fy,fz);
  assert(Math.abs(fx*a.x+fz*a.z)<1e-6,t+': side looks across the pitch (perpendicular to the attack)');
  assert(Math.abs(-fz/fl-a.x)<1e-6&&Math.abs(fx/fl-a.z)<1e-6,t+': screen-right = the attack direction (goal you attack on the right)');
  const pitchDeg=deg(Math.asin(-fy/fd));assert(pitchDeg>25&&pitchDeg<35,'a moderate height: '+pitchDeg.toFixed(1));
  const c0=(f.lx-v.x)*a.z-(f.lz-v.z)*a.x;for(const s of [-1,1]){const k=s*v.width/2-c0,gx=f.lx+a.z*k-f.ex,gy=-f.ey,gz=f.lz-a.x*k-f.ez,gl=Math.hypot(gx,gy,gz);
   assert(deg(Math.acos((gx*fx+gy*fy+gz*fz)/(gl*fd)))<20.5,`${t} ${aspect}: both touchlines in frame`);}
  const hw=fd*Math.tan(20*Math.PI/180)*aspect;assert(hw>11,`${aspect}: at least ~22 m of length across the screen (${(2*hw).toFixed(0)} m)`);}
 {const a=attack('gold'),f1=C.createJoinCamFrame(),f2=C.createJoinCamFrame();C.joinCamFrame('side',v.x,v.z-5,a.x,a.z,pitch,1.6,43,f1);C.joinCamFrame('side',v.x,v.z-15,a.x,a.z,pitch,1.6,43,f2);
  assert(Math.abs((f2.lx-f1.lx)*a.x+(f2.lz-f1.lz)*a.z-10)<1e-6,'side tracks you along the length');
  C.joinCamFrame('side',v.x,v.z-v.length,a.x,a.z,pitch,1.6,43,f2);assert((f2.lx-v.x)*a.x+(f2.lz-v.z)*a.z<v.length/2,'and stops short of the far end');
  const c=C.createJoinCamera(),out=C.createJoinCamFrame();C.joinCamFrame('side',v.x,v.z,a.x,a.z,pitch,1.6,43,f1);c.set('side',0);c.step(1,true,f1);const d=c.blend(v.x+16,23,v.z+33,out);
  const right=C.turnStick(.857,-.515,c.control(1/60,d,1),{x:0,z:0});assert(right.x*a.x+right.z*a.z>.98,'side: stick right = toward the goal you attack');
  const h=C.createJoinCamera();h.control(1/60,0,1);h.set('side',1);assert.equal(h.control(1/60,d,1),0,'switching INTO Side with the stick pushed holds the old direction');assert.equal(h.control(1/60,d,0),d,'until released');
  h.set('broadcast',1);assert.equal(h.control(1/60,0,1),d,'and OUT of Side too');}
 // The controller: eased weight (no cuts), reduced motion instant, Broadcast = Town's camera exactly
 {const c=C.createJoinCamera(),out=C.createJoinCamFrame(),g=C.createJoinCamFrame();C.joinCamFrame('behind',v.x,v.z,0,-1,pitch,1.6,43,g);
  c.step(1/60,false,g);assert.equal(c.w,0,'Broadcast: weight 0');assert.equal(c.blend(10,20,30,out),0,'no turn on Broadcast');assert.deepEqual([out.ex,out.ey,out.ez,out.lx,out.ly,out.lz],[10,20,30,-6,-3,-3],'Broadcast writes Town\'s own eye and look');
  c.set('behind',0);let prev=0,steps=0;while(c.w<1&&steps<200){c.step(1/60,false,g);assert(c.w>=prev,'monotonic ease');assert(c.w-prev<.06,'no cut: '+(c.w-prev));prev=c.w;steps++;}
  assert(steps>=30&&steps<=40,'about 0.6 s to settle: '+steps);
  const d=c.blend(v.x+16,23,v.z+33,out);assert(Math.abs(out.ex-g.ex)<1e-9&&Math.abs(out.lz-g.lz)<1e-9,'settled on the angle');
  // Controls: screen-up on the stick runs at the goal you attack in Behind you (Town's fixed screen → world map, then turned)
  const up=C.turnStick(-.515,-.857,c.control(1/60,d,1),{x:0,z:0}),err=deg(Math.abs(Math.atan2(up.x,up.z)-Math.atan2(0,-1)+(Math.atan2(up.x,up.z)<0?2*Math.PI:0)));
  assert(Math.min(err,360-err)<8,'stick up = attack direction in Behind you ('+err.toFixed(1)+'°)');
  const r=C.createJoinCamera();r.set('wide',0);r.step(1/60,true,g);assert.equal(r.w,1,'reduced motion: instant');
  c.set('broadcast',0);for(let i=0;i<60;i++)c.step(1/60,false,null);assert.equal(c.w,0,'leaving: eases back to Broadcast with the eye frozen');}
 // Blue attacks the other way: Behind you turns the camera ~180° and the stick turns with it (up the screen = their goal)
 {const c=C.createJoinCamera(),g=C.createJoinCamFrame(),out=C.createJoinCamFrame(),a=attack('blue');C.joinCamFrame('behind',v.x,v.z,a.x,a.z,pitch,1.6,43,g);c.set('behind',0);c.step(1,true,g);
  const d=c.blend(v.x+16,23,v.z+33,out),up=C.turnStick(-.515,-.857,c.control(1/60,d,1),{x:0,z:0});assert(up.x*a.x+up.z*a.z>.99,'blue: stick up = the goal blue attacks');}
 // Never confusing when the camera turns: an angle change while the stick is pushed keeps the old mapping until release
 {const c=C.createJoinCamera();c.control(1/60,0,1);c.set('behind',1);assert.equal(c.control(1/60,2.8,1),0,'held through the turn');assert.equal(c.control(1/60,2.8,.9),0);
  assert.equal(c.control(1/60,2.8,0),2.8,'released: screen-relative again');c.set('wide',1);let t=0;while(t<4){c.control(.1,-1,1);t+=.1;}assert(Math.abs(c.ctrlDelta+1)<.05,'a 3 s hold then eases over');
  const o={x:0,z:0};assert.equal(C.turnStick(.3,.4,0,o),o);assert.deepEqual(o,{x:.3,z:.4},'no turn on Broadcast: today\'s mapping exactly');}
 // Wiring: the button, the runtime and Town's hook
 const hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(hud,/data-join-cam [^>]*onClick=\{\(\)=>onPress\('camera',true\)\} title="Change camera · C" aria-label="Camera angle" hidden>/,'the icon-only camera button');
 assert.match(css,/\.cam\{position:absolute;[^}]*top:var\(--island-hud-row-top[^}]*left:calc\(var\(--island-hud-edge[^}]*width:var\(--btn-icon,44px\)[^}]*border-radius:50%/,'top-left, the 44px top-row circle');
 assert.match(rt,/hide\(el\('\[data-join-cam\]'\),!joined\)/,'only while joined');assert.match(rt,/sessionStorage\.setItem\(CAM_KEY,a\)/,'remembered for the session');
 assert.match(rt,/stickLen=Math\.hypot\(ix,iz\);turnStick\(ix,iz,camCtl\.control\(/,'the stick turns with the camera');
 assert.match(rt,/if\(!goal&&camCtl\.w<=0\)\{camDelta=0;return;\}/,'free on Broadcast at rest');
 const iR=town.indexOf('liveJoin.cameraRestore(camera)'),iL=town.indexOf('camera.position.lerp(camTarget'),iA=town.indexOf('liveJoin.cameraApply(camera');
 assert(iR>0&&iR<iL&&iL<iA,'Town: restore before the follow lerp, apply after its lookAt');
 assert(!/new T\.|\{x:0/.test(rt.slice(rt.indexOf('cameraApply('),rt.indexOf('dispose(){markers'))),'no per-frame allocation in cameraApply');}

// ---- Trick, Press, easier tackling, long ball, snappier controls (owner, Nov 4 2026) ----
{const {TRICK,PRESS,TACKLE,LONG_BALL,HUMAN_FEEL}=H,outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
 const fresh=()=>{const sim=new MatchSim(270+41,'7v7');sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(DT);return sim;};
 const give=(sim,id,x,y)=>{sim.restart=null;sim.placePlayer(id,x,y);sim.ball.owner=id;sim.possession=sim.players[id].team;sim.ball.x=x;sim.ball.y=y;sim.ball.vx=sim.ball.vy=0;sim.protect=0;sim.passCd=1;};
 const away=(sim,team,y)=>{outf(sim,team).forEach((id,i)=>sim.placePlayer(id,20+i*10,y));};
 // Trick: stepover → La Croqueta → drag-back on repeated taps, stick back = drag-back; a protected window, cooldown, burst
 {const sim=fresh(),me=outf(sim,'gold')[1],foe=outf(sim,'blue')[1],h=sim.humans;sim.lockHuman(me);const hu=h.get(me);
  away(sim,'blue',40);give(sim,me,135,250);sim.placePlayer(foe,135,246);
  sim.humanInput(me,{mx:0,my:-1,trick:true});sim.step(DT);
  assert.equal(hu.trickSerial,1,'Trick plays a move');assert.equal(hu.trickKind,'stepover','first tap: the stepover');assert(hu.trick>0&&hu.trickCd>TRICK.window,'protected window + cooldown');assert(hu.trickBoost>0,'a burst after the move');
  assert(sim.dazed.has(foe),'the defender on him is bamboozled');assert.equal(sim.ball.owner,me,'the ball stays at his feet');
  const rng=sim.rng;sim.rng=()=>0;// every steal roll would win…
  let kept=0;for(let i=0;i<3;i++){sim.placePlayer(foe,sim.players[me].x,sim.players[me].y-3);sim.humanInput(me,{mx:0,my:-1});sim.step(DT);if(sim.ball.owner===me)kept++;}
  assert.equal(kept,3,'…but nobody can steal it during the trick');
  sim.humanInput(me,{mx:0,my:-1,trick:true});sim.step(DT);assert.equal(hu.trickSerial,1,'cooldown: a second tap too soon does nothing');
  for(let i=0;i<20&&hu.trick>0;i++){sim.humanInput(me,{mx:0,my:-1});sim.step(DT);}
  hu.guard=0;/* the receive guard (HUMAN_GUARD) has its own section */sim.placePlayer(foe,sim.players[me].x,sim.players[me].y-3);sim.humanInput(me,{mx:0,my:-1});sim.step(DT);assert.notEqual(sim.ball.owner,me,'after the window a defender on him can win it again');sim.rng=rng;
  assert.equal(sim.dazed.size,0,'the bamboozled defender recovers');
  give(sim,me,135,250);for(let i=0;i<20&&hu.trickCd>0;i++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
  sim.humanInput(me,{mx:0,my:0,trick:true});sim.step(DT);assert.equal(hu.trickKind,'croqueta','next tap: La Croqueta');
  for(let i=0;i<20&&hu.trickCd>0;i++){sim.ball.owner=me;sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
  sim.ball.owner=me;sim.players[me].vx=0;sim.players[me].vy=-30;sim.humanInput(me,{mx:0,my:1,trick:true});sim.step(DT);assert.equal(hu.trickKind,'dragBack','stick pulled back: the drag-back');
  // the burst: +15% pace while it lasts
  const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');assert.match(src,/hu!\.trickBoost > 0\) maxV \*= TRICK\.burstPace/);}
 // Press together: two NPC teammates (never the human or the keeper), cooldown, then back to their roles; more steals
 {const sim=fresh(),me=outf(sim,'gold')[0],carrier=outf(sim,'blue')[2];sim.lockHuman(me);const hu=sim.humans.get(me);
  give(sim,carrier,135,200);sim.placePlayer(me,30,330);
  sim.humanInput(me,{mx:0,my:0,press:true});sim.step(DT);
  assert(hu.pressA&&hu.pressB&&hu.pressA!==hu.pressB,'two pressers assigned');
  for(const id of [hu.pressA,hu.pressB]){assert.equal(sim.players[id].team,'gold');assert(!sim.players[id].isGK&&id!==me,'NPC outfielders only');}
  assert.equal(sim.pressSet.size,2);assert(hu.pressCd>PRESS.seconds&&hu.pressCd<=PRESS.cooldown,'cooldown running');
  const serial=hu.pressSerial;sim.humanInput(me,{mx:0,my:0,press:true});sim.step(DT);assert.equal(hu.pressSerial,serial,'Press on cooldown');
  sim.ball.owner=me;sim.possession='gold';sim.step(DT);assert.equal(sim.pressSet.size,0,'won it back: the press ends, they resume their roles');
  // scripted: a blue carrier with two gold teammates 22 units off; how often is the ball won within 2.5 s, with and without Press
  const trial=(seed,press)=>{const s=new MatchSim(seed,'7v7');s.windupScale=.32;for(let i=0;i<30;i++)s.step(DT);const m=outf(s,'gold')[0],c=outf(s,'blue')[2];s.lockHuman(m);
   outf(s,'blue').forEach((id,i)=>{if(id!==c)s.placePlayer(id,20+i*50,120);});outf(s,'gold').forEach((id,i)=>{if(id!==m)s.placePlayer(id,i%2?60:210,330);});
   give(s,c,135,200);s.passCd=3;const g=outf(s,'gold').filter(id=>id!==m);s.placePlayer(g[0],120,222);s.placePlayer(g[1],152,222);s.placePlayer(m,30,360);
   s.humanInput(m,{mx:0,my:0,press});for(let i=0;i<72;i++){s.humanInput(m,{mx:0,my:0});s.step(DT);if(s.possession==='gold')return 1;}return 0;};
  let base=0,pressed=0;for(let k=0;k<40;k++){base+=trial(100+k,false);pressed+=trial(100+k,true);}
  console.log('  press steals: '+pressed+'/40 with Press, '+base+'/40 without');assert(pressed>base,'pressing together wins the ball more often ('+pressed+' vs '+base+')');}
 // Easier tackling: reach × 1.4, ~85% when in reach, a short recovery after a miss, never from range
 {const sim=fresh(),me=outf(sim,'gold')[1],foe=outf(sim,'blue')[1];sim.lockHuman(me);const hu=sim.humans.get(me);
  const reach=(4.2+A.PASS_ASSIST.tackleReach)*TACKLE.reachMul;
  const go=(gap,face)=>{let won=0;for(let k=0;k<40;k++){give(sim,foe,140,200);sim.placePlayer(me,140,200+gap);hu.tackleRec=0;hu.faceX=0;hu.faceY=face;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);if(sim.ball.owner===me)won++;}return won;};
  const near=go(9,-1),far=go(reach+3,-1);console.log('  tackles won: '+near+'/40 at 9 units (old reach 7.6), '+far+'/40 out of reach');
  assert(near>=28,'a tackle just outside the old reach now usually wins it ('+near+'/40)');assert.equal(far,0,'no free steals from range');
  give(sim,foe,140,200);sim.placePlayer(me,140,206);const rng=sim.rng;sim.rng=()=>.99;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);sim.rng=rng;
  assert(hu.tackleRec>0&&hu.tackleRec<=TACKLE.recover,'a miss: a short recovery ('+hu.tackleRec.toFixed(2)+' s)');}
 // Long ball: tap = the ground pass, hold = lofted over the defenders to a teammate at the distance the hold asks for
 {const sim=fresh(),me=outf(sim,'gold')[1];sim.lockHuman(me);const g=outf(sim,'gold').filter(id=>id!==me);
  const setUp=()=>{away(sim,'blue',380);give(sim,me,135,320);g.forEach((id,i)=>sim.placePlayer(id,[135,95,175,60,210,240][i]??135,[290,240,160,330,340,345][i]??340));sim.players[me].vx=sim.players[me].vy=0;};
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true});sim.step(DT);assert.equal(sim.ball.lofted,false,'a tap stays a ground pass');const tapTo=sim.ball.target;
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true,long:.05});sim.step(DT);assert(sim.ball.lofted,'held: lofted');const nearTo=sim.ball.target;
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true,long:1});sim.step(DT);assert(sim.ball.lofted&&sim.loftPeak>=LONG_BALL.peak1-.01,'full hold: the highest loft');const farTo=sim.ball.target;
  const d=id=>Math.hypot(sim.players[id].x-135,sim.players[id].y-320);
  console.log('  long ball: tap → '+d(tapTo).toFixed(0)+' u, short hold → '+d(nearTo).toFixed(0)+' u, full hold → '+d(farTo).toFixed(0)+' u');
  assert(d(farTo)>d(nearTo)&&d(farTo)>120,'the longer the hold, the longer the ball');void tapTo;assert(sim.loftDur>0,'timed to land at his run');
  assert.match(fs.readFileSync('lib/town/matchEffects.ts','utf8'),/sim\.ball\.lofted\?'#b877ff'/,'its trail is the lofted ball\'s purple');}
 // Snappier controls (humans only): time to 90% pace from a standstill, at the live 0.32 game speed and 60 fps
 {const sim=fresh(),me=outf(sim,'gold')[1];sim.lockHuman(me);sim.placePlayer(me,135,300);const p=sim.players[me];p.vx=p.vy=0;let t=0,top=0;
  for(let i=0;i<120;i++){sim.humanInput(me,{mx:1,my:0});sim.step(.32/60);top=Math.max(top,Math.hypot(p.vx,p.vy));}
  sim.placePlayer(me,135,300);p.vx=p.vy=0;for(let i=0;i<120;i++){sim.humanInput(me,{mx:1,my:0});sim.step(.32/60);if(Math.hypot(p.vx,p.vy)>=.9*top){t=(i+1)/60;break;}}
  const before=Math.log(10)/12/.32;console.log('  snappier stick: 90% pace in '+t.toFixed(2)+' s real (was ~'+before.toFixed(2)+' s at P.accel 12)');
  assert(t>0&&t<before*.8,'the human reaches his pace sooner');assert.equal(HUMAN_FEEL.accel,18);assert(HUMAN_FEEL.looseMul<.45&&HUMAN_FEEL.dribbleTau<.05&&HUMAN_FEEL.trapTau<.11);}
 // HUD: Trick only with the ball, Press only on defense, one slot, keys L / P, the cooldown ring, the toast word, slow motion off in reduced motion
 {const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
  assert.match(rt,/case 'mine':return \{a:'pass',b:'shoot',c:'trick'\}/);assert.match(rt,/case 'opp':return \{a:'tackle',b:'stay',c:'press'\}/);assert.match(rt,/case 'team':return \{a:'call',b:'',c:''\}/);
  assert.match(rt,/view\.keeper\)return[^\n]*c:''\}[^\n]*c:''\}[^\n]*c:''\}/,'a keeper has neither');assert.match(rt,/hide\(t,!m\.c\)/,'the button only shows with a mode');
  assert.match(rt,/trick:'L',press:'P'/);assert.match(rt,/kl=keys\.has\('l'\),kp=keys\.has\('p'\)/);
  assert.match(rt,/press:'Press together: two defenders win the ball back\.'/);assert.match(rt,/long:'Hold Pass for a long ball over the defenders\.'/);assert.match(rt,/trick:'Fake out the defender/);
  assert.match(hud,/data-join-t data-mode="trick"[^>]*hidden><i className=\{styles\.cool\}/);assert.match(hud,/data-join-pop/);
  assert.match(css,/\.cool\{[^}]*opacity:calc\(var\(--cool,0\)[^}]*transform:scale/,'cooldown ring: transform + opacity');assert.match(css,/\.t\[data-mode="press"\]\{background:/);
  assert.match(css,/\.a\[data-long\] \.charge\{border-color:#8a4fd6\}/,'the long-ball ring turns purple');
  assert.match(rt,/if\(fxAge>=0&&state\.phase==='joined'&&!reduced\)/,'reduced motion: no slow motion or zoom');assert.match(town,/games\.update\(active\?dt\*liveJoin\.timeScale:0/,'slow motion is local to the field runtime');
  // five buttons in the arc on a 390 px phone: ≥ 44 px targets, no overlaps, inside the cluster box
  const box=+css.match(/\.actions\{[^}]*width:(\d+)px/)[1],btn=cls=>{const m=css.match(new RegExp('\\.'+cls+'\\{right:(\\d+)px;bottom:(\\d+)px;width:(\\d+)px'));return {r:+m[1],b:+m[2],w:+m[3]};};
  const all=[{r:0,b:0,w:88},...['b','t','f','s'].map(btn)];for(const q of all){assert(q.w>=44);assert(q.r>=0&&q.b>=0&&q.r+q.w<=box&&q.b+q.w<=box,'inside the cluster');}
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],c=all[j],d=Math.hypot(a.r+a.w/2-c.r-c.w/2,a.b+a.w/2-c.b-c.w/2);assert(d>=(a.w+c.w)/2+6,'no overlap ('+i+','+j+': '+d.toFixed(0)+')');}
  assert(390-14-box>=160,'on a 390 px phone the cluster leaves the left 160 px to the joystick');}
 // AI-only matches unchanged (the fixture) with all of the above in the code
 {const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
  for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged (seed '+e.seed+')');}}

// ---- Shooting for kids, shot slow motion, passing help, hard to be tackled (owner, Nov 4 2026) ----
{const {AIM_MARKS,SHOT_AIM,POWER_SHOT,SHOT_FX,HUMAN_GUARD,PASS_HELP,pickAimMark,shotPace}=H,outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
 const fresh=()=>{const sim=new MatchSim(270+41,'7v7');sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(DT);return sim;};
 const give=(sim,id,x,y)=>{sim.restart=null;sim.placePlayer(id,x,y);sim.ball.owner=id;sim.possession=sim.players[id].team;sim.ball.x=x;sim.ball.y=y;sim.ball.vx=sim.ball.vy=0;sim.protect=0;sim.passCd=1;};
 // Corner picking by stick, judged on screen against where the marks are drawn (lateral axis → mark x = +1, up axis)
 const pick=(sx,sy,l=[1,0],v=[0,1])=>pickAimMark(sx,sy,l[0],l[1],v[0],v[1]);
 assert.equal(pick(0,0),-1,'no push: the auto-aim');assert.equal(pick(.2,.1),-1,'a tiny push: still auto');
 assert.equal(pick(1,0),3,'right = low right (shoot low)');assert.equal(pick(-1,0),2,'left = low left');
 assert.equal(pick(.7,.7),1,'up-right = top right');assert.equal(pick(-.7,.7),0,'up-left = top left');
 assert.equal(pick(0,1),4,'straight up = centre');assert.equal(pick(0,-1),4,'pulled back = centre');
 assert.equal(pick(1,0,[-1,0]),2,'goal seen from the other end (lateral axis flipped): screen-right is the mark on the right of the screen');
 assert.equal(pick(0,1,[.2,1]),1,'side view (goal mouth runs up the screen): up = the far post, high');assert.equal(pick(0,-1,[.2,1]),2,'down = the near post, low');
 assert.equal(JSON.stringify(AIM_MARKS.map(m=>[m.x,m.h])),'[[-1,1],[1,1],[-1,0],[1,0],[0,0.5]]');assert.equal(SHOT_AIM.goalHalf,19,'= matchSim GHALF');
 assert.match(fs.readFileSync('lib/town/match/matchSim.ts','utf8'),/const GHALF = 19;/);
 // The sim fires at the picked corner, always inside the posts (forgiveness), tighter with charge; a tap keeps the auto-aim
 {const sim=fresh(),me=outf(sim,'gold')[2];sim.lockHuman(me);const hu=sim.humans.get(me);
  const shoot=(aimX,aimH,pw)=>{give(sim,me,150,95);sim.humanInput(me,{mx:0,my:-1,shoot:true,shootPower:pw,aimX,aimH});sim.step(DT);return {x:sim.lastKick.aimX,h:sim.lastKick.shotHeight};};
  const tr=shoot(1,1,1),ll=shoot(-1,0,.7),c=shoot(0,.5,.85),auto=shoot(NaN,NaN,.7);
  assert(Math.abs(tr.x-(135+19*SHOT_AIM.inFull))<.01&&tr.h===SHOT_AIM.high,'top right at full charge: right into the corner, high');
  assert(ll.x<135-19*.6&&ll.x>135-19*.82&&ll.h===SHOT_AIM.low,'low left, a little safer at low charge, inside the post');
  assert(Math.abs(c.x-135)<.01&&c.h===SHOT_AIM.mid,'centre');
  for(const k of [tr,ll,c,auto])assert(Math.abs(k.x-135)<=19*.82+.01,'never wide of the posts');
  assert.equal(hu.shotAimed,false,'the tap is the auto-aimed shot');assert(Number.isNaN(hu.aimX),'the aim is used once');
  console.log('  aimed shots: top-right x '+tr.x.toFixed(1)+' h '+tr.h+', low-left x '+ll.x.toFixed(1)+' h '+ll.h+', centre, tap auto x '+auto.x.toFixed(1));
  // Power curve: monotonic, the full charge is the power shot (a pace jump, the flame trail flag, a serial for the view)
  let prev=0;for(let p=0;p<=1.0001;p+=.05){const v=shotPace(p);assert(v>=prev,'pace grows with the charge');prev=v;}
  assert(shotPace(1)/shotPace(.94)>1.08,'full charge: a visible jump');
  const n0=hu.shotSerial;shoot(NaN,NaN,1);assert.equal(sim.powerShot,true,'power shot flag');const sp1=Math.hypot(sim.ball.vx,sim.ball.vy);
  shoot(NaN,NaN,.8);assert.equal(sim.powerShot,false);const sp2=Math.hypot(sim.ball.vx,sim.ball.vy);assert(sp1>sp2*1.12,'the power shot is clearly faster ('+sp1.toFixed(0)+' vs '+sp2.toFixed(0)+')');
  assert.equal(hu.shotSerial,n0+2,'one serial per shot');
  for(let i=0;i<5;i++)sim.step(DT);give(sim,me,135,200);sim.humanInput(me,{mx:0,my:-1,pass:true});sim.step(DT);assert.equal(sim.powerShot,false,'any new kick clears it');
  const fx=fs.readFileSync('lib/town/matchEffects.ts','utf8');assert.match(fx,/powerFlight\?'#ff7a2e'/);assert.match(fx,/powerFlight\?'solar':'classic'/,'flame trail = the pooled trail in solar style');
  assert.match(fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),/h\.shotPw>=POWER_SHOT\.full\)\{if\(hear\)\{ballSoundPlay\?\.\('kick',1\)/,'a louder strike layered on the kick');}
 // Shot slow motion: only from a human's shot (serial), only in the zone, power or aimed, never with reduced motion; skippable
 {const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');
  assert.match(rt,/if\(!reduced&&view\.inShotRange&&\(view\.shotAimed\|\|view\.shotPw>=SHOT_FX\.minCharge\)\)\{shotAge=0/,'human shot from the zone, power or aimed; reduced motion skips it');
  assert.match(rt,/shotSkip\|\|shotAge>\.15&&sim&&\(sim\.ball\.owner!==null\|\|sim\.goalHold>0\)/,'a tap, a save or a goal ends it');assert.match(rt,/function onTap\(\)\{if\(shotAge>\.12\)shotSkip=true;\}/);
  assert.match(rt,/timeScale=Math\.min\(timeScale,SHOT_FX\.scale/,'one Town timeScale: the min of the trick and the shot');
  assert(SHOT_FX.scale<=.35&&SHOT_FX.hold>=1&&SHOT_FX.hold<=1.4,'~0.3x for ~1.2 s');
  const sim=fresh();let serial=0,power=0;for(let i=0;i<3000;i++){sim.step(DT);if(sim.powerShot)power++;}
  assert(sim.stats.shots>0,'the AI shoots');assert.equal(power,0,'AI shots are never power shots (no flame, no slow motion)');void serial;
  const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
  for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged (seed '+e.seed+')');}
 // Pass target rule: a sloppy stick still finds a sensible teammate (wide cone, then the most open ahead)
 {const sim=fresh(),me=outf(sim,'gold')[2];sim.lockHuman(me);give(sim,me,135,250);
  for(let i=0;i<3;i++){sim.ball.owner=me;sim.humanInput(me,{mx:0,my:1});sim.step(DT);}// stick straight back at his own keeper
  const t=sim.humanTarget(me,'short');assert(t&&sim.players[t].team==='gold'&&!sim.players[t].isGK,'a target even with the stick at nobody ('+t+')');
  const c={from:{id:'a',team:'g',isGK:false,x:100,y:200,vx:0,vy:0},aimX:0,aimY:1,dirY:-1,ids:['a','b'],players:{a:{id:'a',team:'g',isGK:false,x:100,y:200,vx:0,vy:0},b:{id:'b',team:'g',isGK:false,x:140,y:170,vx:0,vy:0}},mode:'short',offsideY:null};
  assert.equal(A.pickPassTarget(c),null,'the strict cone finds nobody behind');c.coneCos=PASS_HELP.looseCone;assert.equal(A.pickPassTarget(c),null,'nor the wide one (he is ahead)');
  c.aimX=.6;c.aimY=1;c.coneCos=undefined;assert.equal(A.pickPassTarget(c),null,'stick ~95° off him: the strict cone finds nobody…');c.coneCos=PASS_HELP.looseCone;assert.equal(A.pickPassTarget(c),'b','…the wide cone finds him');}
 // Passes to the highlighted target are cut out half as often: one roll between the two rates
 {const sim=fresh(),me=outf(sim,'gold')[2],mates=outf(sim,'gold').filter(id=>id!==me),foes=outf(sim,'blue');sim.lockHuman(me);
  foes.forEach((id,i)=>sim.placePlayer(id,20+i*8,30));give(sim,me,135,260);const to=mates[0];sim.placePlayer(to,135,200);mates.slice(1).forEach((id,i)=>sim.placePlayer(id,250,330+i*8));
  sim.placePlayer(foes[0],135.5,230);// right in the lane
  for(let i=0;i<4;i++){sim.ball.owner=me;sim.humanInput(me,{mx:0,my:-1});sim.step(DT);}assert.equal(sim.humanTarget(me,'short'),to,'he is the highlighted target');
  const rng=sim.rng;sim.rng=()=>.15;sim.ball.owner=me;sim.humanInput(me,{mx:0,my:-1,pass:true});sim.step(DT);sim.rng=rng;
  assert(!sim.ball.intBy&&sim.ball.target===to,'the roll that cuts out a normal pass does not cut out his ('+sim.ball.intBy+')');
  const sim2=fresh(),a=outf(sim2,'gold')[2],b=outf(sim2,'gold')[0],f2=outf(sim2,'blue');f2.forEach((id,i)=>sim2.placePlayer(id,20+i*8,30));give(sim2,a,135,260);sim2.placePlayer(b,135,200);sim2.placePlayer(f2[0],135.5,230);
  sim2.rng=()=>.15;sim2.doPass(a,b,1);assert.equal(sim2.ball.intBy,f2[0],'the same roll cuts out an AI pass');assert.equal(PASS_HELP.interceptMul,.5);}
 // Teammates make themselves available: out of a blocked lane, into passing range
 {const R2=load('lib/town/match/offBallRuns.ts'),o={x:0,y:0};
  R2.supportOffset(135,200,135,260,134,230,1,o);assert(Math.abs(o.x)>=4,'a blocked lane: he steps sideways ('+o.x.toFixed(1)+')');assert(o.x>0,'away from the blocker');
  R2.supportOffset(135,140,135,260,0,0,99,o);assert(o.y>0&&Math.hypot(o.x,o.y)<=PASS_HELP.step+.01,'far away: he comes toward the carrier');
  R2.supportOffset(135,250,135,260,0,0,99,o);assert(o.y<0,'too close: he makes room');
  const sim=fresh(),me=outf(sim,'gold')[2];sim.lockHuman(me);give(sim,me,135,260);let near=0;for(let i=0;i<60;i++){sim.ball.owner=me;sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
  for(const id of outf(sim,'gold'))if(id!==me){const d=Math.hypot(sim.players[id].x-135,sim.players[id].y-260);if(d<=PASS_HELP.far+12)near++;}
  assert(near>=2,'at least two teammates within passing range of the human carrier ('+near+')');}
 // Hard to be tackled: AI tackles on a human carrier succeed about a third as often, near misses say "Slipped away!",
 // and he is safe for HUMAN_GUARD.receive real seconds after getting the ball
 {const trial=(mul,seed)=>{const sim=fresh();let s=seed>>>0;sim.rng=()=>((s=Math.imul(s^s>>>15,2246822507)+1013904223>>>0)/4294967296);const me=outf(sim,'gold')[2],foe=outf(sim,'blue')[1],hu=(sim.lockHuman(me),sim.humans.get(me));
   outf(sim,'blue').forEach((id,i)=>sim.placePlayer(id,20+i*8,30));give(sim,me,135,260);hu.hadBall=true;hu.guard=0;const old=HUMAN_GUARD.tackleMul;HUMAN_GUARD.tackleMul=mul;let lost=0;
   for(let i=0;i<40;i++){sim.placePlayer(foe,sim.players[me].x+2,sim.players[me].y-2);sim.humanInput(me,{mx:0,my:0});sim.step(DT);if(sim.ball.owner!==me){lost=1;break;}}
   HUMAN_GUARD.tackleMul=old;return {lost,slips:hu.slipSerial};};
  let now=0,before=0,slips=0;for(let k=0;k<60;k++){const a=trial(HUMAN_GUARD.tackleMul,k+1),b=trial(1,k+1);now+=a.lost;before+=b.lost;slips+=a.slips;}
  console.log('  AI tackles on a human carrier: '+now+'/60 lost now vs '+before+'/60 at the old rate; '+slips+' "slipped away" near misses');
  assert(before>=12&&now<=before*.55,'about a third as often (scripted, same rolls)');assert(slips>0,'near misses show "Slipped away!"');
  const sim=fresh(),me=outf(sim,'gold')[2],foe=outf(sim,'blue')[1];sim.lockHuman(me);outf(sim,'blue').forEach((id,i)=>sim.placePlayer(id,20+i*8,30));give(sim,me,135,260);
  const rng=sim.rng;sim.rng=()=>0;let t=0,safe=0;while(t<HUMAN_GUARD.receive-.15){sim.placePlayer(foe,sim.players[me].x+2,sim.players[me].y-2);sim.humanInput(me,{mx:0,my:0});sim.step(DT);t+=DT/.32;if(sim.ball.owner===me)safe++;else break;}
  assert(safe>=5&&sim.ball.owner===me,'nobody wins it in the first '+HUMAN_GUARD.receive+' s after he gets it');
  for(let i=0;i<6;i++){sim.placePlayer(foe,sim.players[me].x+2,sim.players[me].y-2);sim.humanInput(me,{mx:0,my:0});sim.step(DT);}sim.rng=rng;assert.notEqual(sim.ball.owner,me,'after the window a defender can still win it');
  assert.match(fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),/popWord\('Slipped away!'\)/);}
 // HUD: the aim marks (one instanced draw), the full-charge ring, tap-and-drag
 {const mk=fs.readFileSync('lib/graphics/joinMarkers.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8');
  assert.match(mk,/new T\.InstancedMesh\(aimGeo,aimMat,5\)/,'five marks, one draw call');assert.match(mk,/haloMat/,'the pass target\'s soft halo');
  assert.match(hud,/onPointerMove=\{shootMove\}/,'tap-and-drag on Shoot');assert.match(css,/\.b\[data-full\] \.charge\{border-color:#ff7a2e/);assert.match(css,/prefers-reduced-motion:reduce\)\{\.b\[data-full\] \.charge\{animation:none\}/);}
}

console.log('PASS join-live-game: aimed corners + power shots, shot slow motion (human only), passing help, hard to be tackled, Trick (stepover / La Croqueta / drag-back, protected window, cooldown, burst), Press together (two pressers, cooldown, more steals), easier tackling, long ball, snappier controls, camera angles (Broadcast / Behind you / Wide / Close, eased, stick screen-relative), format switch, pitch-bar Play (no countdown; rides / flying land first), side + position pick, sprint ease, pass charge, team + slot for N humans, sit-out walker, input map, pass assist (cone, lane, hysteresis, lead, pace, shot aim), off-ball runs, locked sim control (pass/shoot/tackle/call/release), bibs');

// ---- Futsal + 9v9 rollout (slice 3, Nov 4 2026): the same join on the rooftop futsal court and the Club Grounds 9v9 ----
// Same scenarios as the 7v7 at each format's live speed (windupScale = liveGameSpeed: futsal .48, 9v9 .32): slots + names,
// side + position pick, locked control, pass / shoot / tackle / call / trick / press, the human keeper, aim marks, slow
// motion human-only; plus what differs: the rooftop (elevation 6) height test, the touchline spot in metres, the futsal
// human pass cap, the 9v9 pace vs the pose relay, the camera fit, and the AI-only fixtures byte-identical.
{const V=load('lib/town/venues.ts'),C=load('lib/town/liveJoinCamera.ts'),HK=load('lib/town/match/matchSim.ts').HUMAN_KEEPER,{TRICK,PRESS,SHOT_AIM,PASS_POWER_MAX}=H;
 const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 const SLOTS={futsal:['gk','cb','lm','rm','st'],'9v9':['gk','lcb','cb','rcb','lcm','rcm','lw','st','rw'],'11v11':['gk','lb','lcb','rcb','rb','lcm','cm','rcm','lw','st','rw']},WS={futsal:.48,'9v9':.32,'11v11':.32};
 const outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
 const give=(sim,id,x,y)=>{sim.restart=null;sim.placePlayer(id,x,y);sim.ball.owner=id;sim.possession=sim.players[id].team;sim.ball.x=x;sim.ball.y=y;sim.ball.vx=sim.ball.vy=0;sim.protect=0;sim.passCd=1;};
 const walkMax=+fs.readFileSync('multiplayer/protocol/limits.ts','utf8').match(/\[Mode\.Walk\]: ([\d.]+) \* ([\d.]+)/).slice(1,3).reduce((a,b)=>a*b);
 const relay=walkMax*1.5,POSE_SAFE=+fs.readFileSync('lib/multiplayer/presence.ts','utf8').match(/POSE_SAFE = ([\d.]+)/)[1];
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),town=fs.readFileSync('components/Town.tsx','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 for(const F of ['futsal','9v9','11v11']){const v=V.liveVenueById(F),ws=WS[F],mX=v.width/250,mY=v.length/380,tag=F+': ';
  const fresh=(seed=311)=>{const sim=new MatchSim(seed,F);assert.equal(sim.windupScale,ws,tag+'live speed');for(let i=0;i<60;i++)sim.step(DT);return sim;};
  assert.equal(J.joinableFormat(F),true);assert(B.LIVE_BIB_KITS[F],tag+'bibs');assert.equal(B.liveMatchKits(F,false,true),B.LIVE_BIB_KITS[F],tag+'bibs on join');
  // slots, names, the dropdown (keeper first and enabled), a full side of humans
  {const sim=fresh();assert.equal(sim.ids.filter(id=>sim.players[id].team==='gold').sort().join(),[...SLOTS[F]].sort().join(),tag+'slot ids');
   for(const team of ['gold','blue']){for(const id of sim.ids.filter(id=>sim.players[id].team===team))assert.notEqual(J.slotName(id,team,sim.players[id].role),'Player',tag+id+' has a name');
    const rows=J.slotOptions(sim,team);assert.equal(rows.length,SLOTS[F].length,tag+'every slot listed');assert.equal(rows[0].label,'Goalkeeper');assert.equal(rows[0].disabled,false,tag+'keeper pickable');
    const d=J.defaultSlot(sim,team,null,135,team==='gold'?330:70);assert(d&&sim.players[d].team===team&&!sim.players[d].isGK,tag+team+' default outfield');}
   for(const id of sim.ids.filter(id=>sim.players[id].team==='blue'))assert(sim.lockHuman(id),tag+'human '+id);
   assert.equal(sim.humanOn.blue,J.LIVE_JOIN_FORMATS[F].maxHumansPerTeam,tag+'a whole side of humans, keeper included');
   assert.equal(J.pickJoinTeam(sim.humanOn,70,J.LIVE_JOIN_FORMATS[F].maxHumansPerTeam),'gold','a full side sends the next one to the other');}
  // locked control: idle holds, stick runs, Pass reaches a teammate, Shoot aims inside the posts, release
  {const sim=fresh(),[a]=outf(sim,'gold'),[b]=outf(sim,'blue');assert(sim.lockHuman(a)&&sim.lockHuman(b));
   sim.placePlayer(a,135,300);const s0={x:sim.players[a].x,y:sim.players[a].y},g0=sim.score.gold+sim.score.blue;
   for(let i=0;i<240;i++){sim.humanInput(a,{mx:0,my:0});sim.humanInput(b,{mx:0,my:0});sim.step(DT);}
   const moved=Math.hypot(sim.players[a].x-s0.x,sim.players[a].y-s0.y);assert(moved<40||sim.ball.target===a||sim.ball.owner===a||sim.score.gold+sim.score.blue>g0/* a goal walks everyone back for the kick-off */,tag+'idle human holds ('+moved.toFixed(1)+')');
   const y0=sim.players[a].y;for(let i=0;i<30;i++){sim.humanInput(a,{mx:0,my:-1});sim.step(DT);}assert(sim.players[a].y<y0-10,tag+'stick up runs him up');
   give(sim,a,135,260);sim.humanInput(a,{mx:0,my:-1});sim.step(DT);const shown=sim.humanTarget(a,'short');assert(shown&&sim.players[shown].team==='gold'&&!sim.players[shown].isGK,tag+'Pass target shown');
   sim.ball.owner=a;sim.humanInput(a,{mx:0,my:-1,pass:true});sim.step(DT);assert.notEqual(sim.ball.owner,a,tag+'the pass leaves');assert(sim.ball.target||sim.ball.intBy,tag+'to a player');
   for(let i=0;i<20;i++)sim.step(DT);give(sim,a,135,90);const shots=sim.stats.shots;sim.humanInput(a,{mx:0,my:-1,shoot:true,shootPower:1});sim.step(DT);
   assert.equal(sim.stats.shots,shots+1,tag+'Shoot');assert(sim.ball.vy<0&&Math.abs(sim.lastKick.aimX-135)<19,tag+'at goal, inside the posts');assert.equal(sim.powerShot,true,tag+'full charge = power shot');
   sim.releaseHuman(b);sim.releaseHuman(a);assert.equal(sim.humans.size,0);
   // rejoin the same slot, then score: a human shot past a keeper out of position goes in (and the kick-off follows)
   assert(sim.lockHuman(a),tag+'rejoin');const gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK),g1=sim.score.gold;
   give(sim,a,135,70);sim.placePlayer(gk,30,20);sim.humanInput(a,{mx:0,my:-1,shoot:true,shootPower:.6});
   for(let i=0;i<150&&sim.score.gold===g1;i++){sim.placePlayer(gk,30,20);sim.step(DT);}assert.equal(sim.score.gold,g1+1,tag+'a human goal');
   sim.releaseHuman(a);assert.equal(sim.humans.size,0,tag+'leave again');}
  // tackle + call
  {const sim=fresh(),me=outf(sim,'gold')[1],foe=outf(sim,'blue')[1];sim.lockHuman(me);let won=0;
   for(let k=0;k<20;k++){give(sim,foe,140,200);sim.placePlayer(me,140,207);sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);if(sim.ball.owner===me)won++;}
   assert(won>=8,tag+'a well-timed tackle usually wins it ('+won+'/20)');
   const mate=outf(sim,'gold').find(id=>id!==me);let answered=0;
   for(let k=0;k<10;k++){sim.restart=null;sim.ball.owner=mate;sim.possession='gold';sim.passCd=0;sim.protect=0;sim.placePlayer(mate,135,250);sim.ball.x=135;sim.ball.y=250;sim.placePlayer(me,175,215);
    outf(sim,'blue').forEach((id,i)=>sim.placePlayer(id,30+i*8,60));sim.humanInput(me,{mx:0,my:0,call:true});for(let i=0;i<20;i++){sim.step(DT);if(sim.ball.target===me||sim.ball.owner===me){answered++;break;}}}
   assert(answered>=8,tag+'the carrier answers an open call ('+answered+'/10)');}
  // Trick (protected stepover) and Press (two NPC pressers)
  {const sim=fresh(),me=outf(sim,'gold')[1],foe=outf(sim,'blue')[1];sim.lockHuman(me);const hu=sim.humans.get(me);
   outf(sim,'blue').forEach((id,i)=>sim.placePlayer(id,20+i*10,40));give(sim,me,135,250);sim.placePlayer(foe,135,246);
   sim.humanInput(me,{mx:0,my:-1,trick:true});sim.step(DT);assert.equal(hu.trickKind,'stepover',tag+'Trick');assert(sim.dazed.has(foe)&&sim.ball.owner===me,tag+'defender bamboozled, ball kept');
   const rng=sim.rng;sim.rng=()=>0;let kept=0;for(let i=0;i<3;i++){sim.placePlayer(foe,sim.players[me].x,sim.players[me].y-3);sim.humanInput(me,{mx:0,my:-1});sim.step(DT);if(sim.ball.owner===me)kept++;}sim.rng=rng;
   assert.equal(kept,3,tag+'protected window');assert(hu.trickCd>0&&hu.trickCd<=TRICK.cooldown+1e-9,tag+'cooldown');}
  {const sim=fresh(),me=outf(sim,'gold')[0],carrier=outf(sim,'blue')[2];sim.lockHuman(me);const hu=sim.humans.get(me);give(sim,carrier,135,200);sim.placePlayer(me,30,330);
   sim.humanInput(me,{mx:0,my:0,press:true});sim.step(DT);assert(hu.pressA&&hu.pressB&&hu.pressA!==hu.pressB,tag+'two pressers');
   for(const id of [hu.pressA,hu.pressB])assert(sim.players[id].team==='gold'&&!sim.players[id].isGK&&id!==me,tag+'NPC outfielders');assert(hu.pressCd>PRESS.seconds,tag+'press cooldown');}
  // aim marks: the picked corner, inside the posts
  {const sim=fresh(),me=outf(sim,'gold')[2];sim.lockHuman(me);give(sim,me,150,95);sim.humanInput(me,{mx:0,my:-1,shoot:true,shootPower:1,aimX:1,aimH:1});sim.step(DT);
   assert(Math.abs(sim.lastKick.aimX-(135+19*SHOT_AIM.inFull))<.01&&sim.lastKick.shotHeight===SHOT_AIM.high,tag+'top-right mark');}
  // the human keeper: saves at the shot line, kept in his box (futsal 6 m arc / 9v9 13 m box: the 44 × 46 unit box fits both)
  {const DTL=DT*ws,striker=sim=>sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].role==='fwd');
   const shoot=(sim,from,aimx,speed=330)=>{const b=sim.ball;sim.placePlayer(from,150,330);sim.restart=null;sim.windup=null;sim.passRelease=null;
    Object.assign(b,{owner:null,target:null,intBy:null,x:150,y:333,height:0,lofted:false});const dx=aimx-b.x,dy=392-b.y,L=Math.hypot(dx,dy);b.vx=dx/L*speed;b.vy=dy/L*speed;
    Object.assign(sim,{ballIsShot:true,shotIsGoal:false,ballFlight:0,lastFrom:from,possession:'blue',saveRoll:.5});sim.lastKick.shotHeight=0;};
   const trial=(aimx,press)=>{const sim=fresh();assert(sim.lockHuman('gk'),tag+'human keeper');sim.placePlayer('gk',135,384);const before=sim.score.blue;
    for(let i=0;i<5;i++){sim.humanInput('gk',{mx:0,my:0});sim.step(DTL);}shoot(sim,striker(sim),aimx);
    for(let i=0;i<120;i++){sim.humanInput('gk',{mx:-1,my:0,save:press&&i===1});sim.step(DTL);if(sim.ball.owner==='gk'||sim.score.blue>before)break;}
    return {goal:sim.score.blue>before,caught:sim.ball.owner==='gk'};};
   assert(trial(153,false).goal,tag+'a corner beats a keeper who stays put');for(const aim of [153,118]){const t=trial(aim,true);assert(!t.goal&&t.caught,tag+'Save at '+aim);}
   const sim=fresh();sim.lockHuman('gk');for(let i=0;i<900;i++){sim.humanInput('gk',{mx:.6,my:-.8,sprint:true});sim.step(DTL);}const g=sim.players.gk;
   assert(g.x<=135+HK.boxHalf+1.5&&g.y>=392-HK.boxDepth-1.5,tag+'kept in his box');
   const box={half:HK.boxHalf*mX,depth:HK.boxDepth*mY};console.log(`  ${F} keeper box: ${(2*box.half).toFixed(1)} × ${box.depth.toFixed(1)} m`);
   if(F==='futsal')assert(box.half<4.6&&box.depth<=6.1,'inside the 6 m futsal area');else if(F==='9v9')assert(box.half<14.5&&box.depth<13,'inside the 9v9 penalty box');
   else assert(box.half<20.15&&box.depth<16.5&&2*box.half>v.goalWidth*2,'11v11: inside the 40.3 × 16.5 m penalty box, wide of the 7.32 m goal');}
  // slow motion stays human-only: AI shots are never power shots
  {const sim=fresh();let power=0;for(let i=0;i<3000;i++){sim.step(DT);if(sim.powerShot)power++;}assert(sim.stats.shots>0&&power===0,tag+'AI shots never power shots');}
  // pace: run + sprint in m/s against the pose relay (MAX_SPEED_MS walk × 1.5; the client governor keeps × POSE_SAFE + 1 m slack)
  {const sim=fresh(),me=outf(sim,'gold')[0];sim.lockHuman(me);const p=sim.players[me],sp=[];
   for(let i=0;i<100;i++){p.x=20;p.y=200;sim.humanInput(me,{mx:0,my:-1,sprint:i>=20&&i<80});sim.step(DT);sp.push(sim.restart||sim.goalHold>0?NaN:Math.hypot(p.vx,p.vy));}
   const run=sp[19]*mY*ws,held=sp.slice(36,80).filter(Number.isFinite),sprint=Math.max(...held)*mY*ws;
   console.log(`  ${F} pace: run ${run.toFixed(2)} m/s, sprint ${sprint.toFixed(2)} m/s (relay ${relay.toFixed(2)}, client governor ${(walkMax*1.5*POSE_SAFE).toFixed(2)} + 1 m per pose)`);
   assert(sprint<relay,tag+'the sprinting slot never trips the relay speed check');
   // the pace ladder (owner Nov 5 2026): 9v9 90 %, futsal 80 % of the 11v11 human (run 6.91, sprint 8.99 m/s); beach 70 % in its own block
   if(F==='9v9')assert(Math.abs(run-6.22)<.15&&Math.abs(sprint-8.09)<.2,'9v9: ~6.2 m/s, sprint ~8.1 m/s (90 % of the 11v11)');
   if(F==='futsal')assert(Math.abs(run-5.53)<.15&&Math.abs(sprint-7.19)<.2,'futsal: ~5.5 m/s, sprint ~7.2 m/s (80 % of the 11v11)');
   // 11v11 = the adult-tuned format (owner Nov 5 2026): full-size pace, the sprint ~9 m/s (a real adult sprint) under the relay
   if(F==='11v11')assert(Math.abs(run-7)<.4&&sprint>8.6&&sprint<relay-.2,'11v11: ~7 m/s, sprint ~9 m/s under the relay');}
  // adult tuning: AI chasers on a human carrier run at full pace on the 11v11 (the kids' × 0.82 stays on the other formats); AI never reads it
  {const sim=fresh();assert.equal(sim.humanChaseMul,1,tag+'chaser pace on a human carrier (full speed)');assert.equal(sim.humanSprintBoost,1.3,tag+'sprint boost');
   assert.equal(sim.humanPace,{futsal:1.4,'9v9':1.29,'11v11':1}[F],tag+'pace ladder');const k=new MatchSim(311,'7v7');assert.equal(k.humanChaseMul,.82);assert.equal(k.humanSprintBoost,H.SPRINT_BOOST);assert.equal(k.humanPace,1);assert.equal(k.humanBallPace,1,'7v7 keeps the kid tuning');}
  // pass pace: the 9v9 keeps the full charge; the 18.5 m futsal court caps the human multiplier at 1.6 (AI passes untouched)
  {const pace=power=>{const sim=fresh();const a=outf(sim,'gold')[1];sim.lockHuman(a);give(sim,a,135,260);sim.humanInput(a,{mx:0,my:-1});sim.step(DT);sim.ball.owner=a;
    sim.humanInput(a,{mx:0,my:-1,pass:true,passPower:power});sim.step(DT);return {sp:Math.hypot(sim.ball.vx,sim.ball.vy),cap:sim.humanPassCap};};
   const tap=pace(0),full=pace(1);console.log(`  ${F} human pass: tap ${tap.sp.toFixed(0)} u/s, full charge ${full.sp.toFixed(0)} u/s, rolls ≤ ${(full.sp/2.2*mY).toFixed(1)} m of a ${v.length.toFixed(1)} m pitch`);
   if(F==='futsal'){assert.equal(full.cap,1.6);assert(full.sp<=420*1.6+1,'futsal: capped');assert(full.sp/2.2<380,'futsal: a full charge never rolls the length of the court');}
   else{assert.equal(full.cap,F==='9v9'?1.3*PASS_POWER_MAX:Infinity);if(F==='9v9')assert(full.sp/2.2*mY<v.length&&full.sp>tap.sp*1.1,'9v9: the quicker tap still charges, and a full charge never rolls the length of the pitch');if(F!=='9v9')assert(Math.abs(full.sp/tap.sp-PASS_POWER_MAX)<.12||full.sp>=tap.sp*1.3,F+': the full charge');}
   if(F==='11v11')assert(full.sp/2.2*mY>=.6*v.length,'11v11: a full charge still crosses most of the 100 m pitch (pace scales with the pitch)');}
  // the sitting-out player: ~1.4 m off the touchline in METRES on every pitch, on the runoff; on the roof for futsal
  {const o={x:0,y:0},m=J.benchMargin(v.width);J.touchlineSpot(200,150,0,o,m);const off=(o.x-260)*mX,wx=v.x+(o.x-135)*mX;
   assert(Math.abs(off-J.BENCH_METRES)<1e-9,tag+'1.37 m off the line ('+off.toFixed(2)+')');assert(Math.abs(wx-v.x)<v.width/2+3,tag+'on the 3 m runoff');
   J.touchlineSpot(60,150,0,o,m);const wl=v.x+(o.x-135)*mX;assert(Math.abs(wl-v.x)<v.width/2+3);
   if(F==='futsal')for(const x of [wx,wl])for(const z of [v.z-v.length/2,v.z+v.length/2])assert.equal(V.parkingSurfaceHeight(x,z),6,'futsal: the bench spot is on the garage roof, clear of its edge');}
  // the camera: Side keeps both touchlines, Wide both goal lines (portrait phone too, ≤ 95 m), Close dollies; ground = the pitch level
  {const pitch={x:v.x,z:v.z,width:v.width,length:v.length,yaw:v.yaw??0,ground:v.elevation??0},f=C.createJoinCamFrame(),deg=r=>r*180/Math.PI;
   const attack=t=>{const y=V.liveWorldYaw(v,0,t==='gold'?-1:1);return {x:Math.sin(y),z:Math.cos(y)};};
   for(const t of ['gold','blue'])for(const aspect of [.46,1.6]){const a=attack(t),px=v.x+3,pz=v.z+(t==='gold'?8:-8);
    C.joinCamFrame('wide',px,pz,a.x,a.z,pitch,aspect,43,f);const wx=f.lx-f.ex,wy=f.ly-f.ey,wz=f.lz-f.ez,wl=Math.hypot(wx,wy,wz);assert(wl<=(F==='11v11'?150:95)+1e-6,tag+'wide ≤ 95 m (11v11: ≤ 150 m, the 100 m pitch)');
    assert(f.ly===pitch.ground,tag+'looks at the pitch level');
    for(const end of [-1,1]){const gx=v.x+a.x*end*v.length/2,gz=v.z+a.z*end*v.length/2,dx=gx-f.ex,dy=pitch.ground-f.ey,dz=gz-f.ez,dl=Math.hypot(dx,dy,dz);
     const ang=deg(Math.acos((dx*wx+dy*wy+dz*wz)/(dl*wl)));assert(ang<20.5,`${tag}${t} ${aspect}: wide keeps both goal lines (${ang.toFixed(1)}°)`);}
    {const dx=px-f.ex,dy=pitch.ground-f.ey,dz=pz-f.ez,dl=Math.hypot(dx,dy,dz);assert(deg(Math.acos((dx*wx+dy*wy+dz*wz)/(dl*wl)))<20,tag+'you stay in the wide frame');}
    C.joinCamFrame('side',v.x+3,v.z+(t==='gold'?10:-10),a.x,a.z,pitch,aspect,43,f);const fx=f.lx-f.ex,fy=f.ly-f.ey,fz=f.lz-f.ez,fd=Math.hypot(fx,fy,fz);
    const c0=(f.lx-v.x)*a.z-(f.lz-v.z)*a.x;for(const s of [-1,1]){const k=s*v.width/2-c0,gx=f.lx+a.z*k-f.ex,gy=pitch.ground-f.ey,gz=f.lz-a.x*k-f.ez,gl=Math.hypot(gx,gy,gz);
     assert(deg(Math.acos((gx*fx+gy*fy+gz*fz)/(gl*fd)))<20.5,`${tag}${t} ${aspect}: side keeps both touchlines`);}
    assert(C.joinCamFrame('close',px,pz,0,-1,pitch,aspect,43.3,f)&&f.ly>pitch.ground&&Math.hypot(f.ex-f.lx,f.ey-f.ly,f.ez-f.lz)<26,tag+'close');
    C.joinCamFrame('behind',px,pz,a.x,a.z,pitch,aspect,43,f);assert(f.ey>pitch.ground+4&&f.ey<pitch.ground+12,tag+'behind: a low chase above the pitch level');}}
  // AI-only matches byte-identical
  for(const e of expected.filter(e=>e.format===F))assert.deepEqual(S.summary(MatchSim,F,e.seed),e,'AI-only '+F+' unchanged (seed '+e.seed+')');}
 // the rooftop: the join check and the pitch bar need the player ON the roof level (not on the street under it), flying over is fine
 {const v=V.liveVenueById('futsal');assert.equal(v.elevation,6);
  for(const sx of [-1,1])for(const sz of [-1,1])assert.equal(V.parkingSurfaceHeight(v.x+sx*(v.width/2+J.JOIN_PITCH_MARGIN),v.z+sz*(v.length/2+J.JOIN_PITCH_MARGIN)),6,'the join margin stays on the roof');
  assert.match(rt,/&&feetY>\(v\.elevation\?\?0\)-1\)return v;/,'venueAt: a raised pitch only from its own level or above');assert.match(rt,/set feet\(y:number\)\{feetY=y;\}/);
  assert.match(town,/liveJoin\.feet=groundY;[^\n]*\n\s*const left=liveJoin\.update\(/,'Town writes the feet height before the join update');
  assert.match(town,/v\.length\/2\+3\)continue;\n[^\n]*\n\s*if\(player\.root\.position\.y<\(v\.elevation\?\?0\)-1\)continue;/,'the pitch bar: same height test');
  assert.match(fr,/touchlineSpot\(p\.x,p\.y,e\.humans\.size,benchPoint,benchMargin\(v\.width\)\)/,'the bench spot in metres per pitch');
  assert(Math.abs(J.benchMargin(V.liveVenueById('7v7').width)-J.BENCH_MARGIN)<.01,'the 7v7 spot is unchanged');
  for(const id of ['futsal','9v9','11v11'])assert(V.VENUES.some(u=>u.id===id),id+' has the island pitch bar (FieldPathCard: Learn + Play when joinable)');
  assert.equal(V.VENUES.filter(u=>u.id==='11v11').length,1,'one 11v11 pitch (Eleven Park)');assert.equal(B.LIVE_BIB_KITS['11v11'].home.shirt,'#22c3e6');
  assert.match(rt,/'11v11':\{gold:'Cyan',blue:'Orange'\}/,'the 11v11 picker reads Cyan / Orange (its bibs)');
  // the side names follow the bibs: the 9v9 picker reads Orange / Purple (futsal keeps the 7v7's yellow / royal)
  assert.equal(B.LIVE_BIB_KITS['9v9'].home.shirt,'#ff8a1f');assert.equal(B.LIVE_BIB_KITS.futsal.home.shirt,'#ffd23f');
  assert.match(rt,/TEAM_NAMES:[^\n]*'9v9':\{gold:'Orange',blue:'Purple'\}/);assert.match(rt,/text\(el\(`\[data-join-side-name="\$\{t\}"\]`\),teamName\(v\.id,t\)\)/);
  assert.match(fs.readFileSync('components/LiveJoinHud.tsx','utf8'),/<span data-join-side-name=\{t\}>/);}}
console.log('PASS join-live-game (futsal + 9v9 + 11v11): slots + names, pick, locked control, pass/shoot/tackle/call/trick/press, human keeper, aim marks, slow motion human-only, rooftop height test, bench spot in metres, futsal pass cap, 9v9 pace vs relay, camera fit, AI fixtures unchanged');

// ---- Beach (Sharks Beach court, Nov 4 2026): Play-only bar, barefoot kits + bib colours, sand passes, shot pace, aim marks on the
// drawn 5.5 m goal, 4 s kick-ins / kick-offs for a human taker, full time + penalties with a human in, bench spot clear of the flags,
// and the camera angles on the quarter-turned court ----
{const V=load('lib/town/venues.ts'),C=load('lib/town/liveJoinCamera.ts'),SM=load('lib/town/match/matchSim.ts'),SP=load('lib/town/shotPlacement.ts'),{SHOT_AIM}=H;
 const bv=V.liveVenueById('beach');
 // the switch + the Play-only bar (no beach lesson: no Learn, no Plays catalogue)
 assert.equal(J.joinableFormat('beach'),true);assert(!V.VENUES.some(v=>v.id==='beach'),'still a live venue only');
 const town=fs.readFileSync('components/Town.tsx','utf8'),card=fs.readFileSync('components/FieldPathCard.tsx','utf8'),rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 assert.match(town,/const BEACH_BAR:readonly LiveVenue\[\]=joinableFormat\('beach'\)\?\[\{\.\.\.BEACH_VENUE,width:2\*liveHalfX\(BEACH_VENUE\),length:2\*liveHalfZ\(BEACH_VENUE\),yaw:0\}\]:\[\];/,'the bar box in world axes');
 assert.match(town,/\{BEACH_BAR\.map\(v=><FieldPathCard key=\{v\.id\} venue=\{v\} onPlays=\{\(\)=>\{\}\}[^\n]*onPlay=\{\(\)=>liveJoinRef\.current\?\.press\('play',true\)\}\/>\)\}/,'a Play-only beach bar');
 // a joined match hides the townsfolk name tag over the court (Lua sat above the beach court) and the NPC chatter; Leave restores both
 assert.match(town,/islandNpcs\.update\([^\n]*keepUpBusy\.current\|\|liveJoin\.joined[^\n]*\);fieldBump\.applyNpcNudges\(\);/,'joined: no NPC name tag over the pitch');
 assert.match(town,/chatIn\.blocked=[^\n]*\|\|liveJoin\.joined\|\|/,'joined: no NPC chatter bubbles over the pitch');
 assert.match(rt,/set\(app,'data-live-join',joined\?'':null\)/,'the flag the tags follow is set while joined and cleared on Leave');
 assert.match(town,/for\(const v of BEACH_BAR\)\{if\(Math\.abs\(player\.root\.position\.x-v\.x\)>v\.width\/2\+3/,'shown while standing in the court');
 assert.match(town,/for\(const v of PITCH_BARS\)\{const button=uiElement/,'hidden / shown with the island bars');
 assert.match(card,/const path=venue\.id==='beach'\?null:venue\.id;/,'no lesson path on the beach');assert.match(card,/venue\.id==='beach'\?'Beach soccer'/);
 {const b=[{...bv,width:2*V.liveHalfX(bv),length:2*V.liveHalfZ(bv)}][0];assert.equal(b.width,bv.length);assert.equal(b.length,bv.width,'east–west court: x spans its length');}
 // bibs: the HUD chip / ring / pills take the barefoot kits' shirts; the kits stay BEACH_MATCH_KITS (no bibs on sand)
 assert.equal(B.bibColour('beach',true),B.BEACH_KITS.home.shirt);assert.equal(B.bibColour('beach',false),B.BEACH_KITS.away.shirt);assert.equal(B.bibColour('beach',true),'#f29a1c');
 assert.equal(B.liveMatchKits('beach',true,true),B.BEACH_MATCH_KITS);assert(!('beach' in B.LIVE_BIB_KITS),'no bib kit for the sand');
 assert.match(rt,/beach:\{gold:'Orange',blue:'Blue'\}/,'picker names match the orange / blue shirts');
 // the joined avatar: own character, the slot's shirt, barefoot on sand (own body colour), costume kept; boots stay on grass
 {const own={...B.matchPlayerDress('me','home',false).look,body:'#6fcfb4'},outfit={kind:'casual',shirt:'#111111',shirt2:'#222222',shorts:'#333333',socks:'#444444',socks2:'#555555',boots:'#666666',number:9};
  for(const keeper of [false,true]){const slot=B.matchPlayerDress('you','home',keeper,null,B.BEACH_MATCH_KITS);assert(B.isBarefootDress(slot),'beach slot kit is barefoot');
   const d=B.ownKitLook(own,slot,outfit,'flamingo');assert.equal(d.outfit.shirt,slot.outfit.shirt);assert.equal(d.outfit.boots,own.body);assert.equal(d.outfit.socks,own.body);assert.equal(d.outfit.socks2,own.body);
   assert.equal(d.outfit.shorts,'#333333','own shorts');assert.equal(d.look.body,own.body,'own body colour');assert.equal(d.costume,'flamingo','costume kept');}
  const g=B.ownKitLook(own,B.matchPlayerDress('you','home',false,null,B.LIVE_BIB_KITS['7v7']),outfit,null);assert.equal(g.outfit.boots,'#666666','boots on grass');assert(!B.isBarefootDress(B.matchPlayerDress('you','home',false,null,B.LIVE_BIB_KITS['7v7'])));}
 // slots: keeper + four outfield, real names, the picker's options
 {const sim=new MatchSim(311,'beach');assert.equal(sim.ids.filter(id=>sim.players[id].team==='gold').join(),'gk,cb,lm,rm,st');assert.equal(J.slotOptions(sim,'blue').length,5);
  for(const id of sim.ids)assert(!/Player|Defender|Midfield|Forward/.test(J.slotName(id,sim.players[id].team,sim.players[id].role)),'beach '+id);}
 // sand: a human's ground pass gets the extra roll loss back (arrives like on grass); a short pass stays on the ground
 {const sim=new MatchSim(5,'beach');for(let i=0;i<60;i++)sim.step(DT);sim.lockHuman('cb');sim.restart=null;sim.possession='gold';
  sim.placePlayer('cb',135,250);sim.placePlayer('lm',135,215);sim.placePlayer('rm',60,330);sim.placePlayer('st',210,330);for(const id of sim.ids)if(sim.players[id].team==='blue')sim.placePlayer(id,30,60);
  sim.ball.owner='cb';sim.ball.x=135;sim.ball.y=250;sim.humanInput('cb',{mx:0,my:-1});sim.step(DT);sim.ball.owner='cb';sim.humanInput('cb',{mx:0,my:-1,pass:true});sim.step(DT);
  assert.equal(sim.ball.target,'lm','the open teammate ahead');const v0=Math.hypot(sim.ball.vx,sim.ball.vy),d=Math.hypot(sim.ball.x-sim.players.lm.x,sim.ball.y-sim.players.lm.y);assert.equal(sim.ball.lofted,false,'a short pass stays on the sand');
  assert(v0-sim.groundFriction*d>A.PASS_ASSIST.arriveSpeed,'it still arrives firm on sand ('+v0.toFixed(0)+' u/s over '+d.toFixed(0)+' u)');
  assert.match(fs.readFileSync('lib/town/match/matchSim.ts','utf8'),/this\.humanPassCap\) \+ \(this\.groundFriction - P\.friction\) \* d, charge \}/,'the sand compensation (0 on grass)');}
 // hold-to-charge on sand (QA Nov 5 2026: a full charge left at ~330 u/s, the same as a tap, because the sand lifts any pass over ~5 m and
 // the lift used the AI's fixed loft pace): measured like the other formats, the full charge is clearly faster than a tap and still lands in the court
 {const outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
  const pace=power=>{const sim=new MatchSim(311,'beach');for(let i=0;i<60;i++)sim.step(DT);const a=outf(sim,'gold')[1];sim.lockHuman(a);
   sim.restart=null;sim.placePlayer(a,135,260);sim.ball.owner=a;sim.possession='gold';sim.ball.x=135;sim.ball.y=260;sim.ball.vx=sim.ball.vy=0;sim.protect=0;sim.passCd=1;
   sim.humanInput(a,{mx:0,my:-1});sim.step(DT);sim.ball.owner=a;sim.humanInput(a,{mx:0,my:-1,pass:true,passPower:power});sim.step(DT);
   const sp=Math.hypot(sim.ball.vx,sim.ball.vy);let out=false;for(let i=0;i<240&&!sim.ball.owner&&!sim.restart;i++){sim.step(DT);if(sim.restart&&sim.restart.kind!=='kickoff')out=true;}return {sp,out};};
  const tap=pace(0),full=pace(1);console.log(`  beach human pass: tap ${tap.sp.toFixed(0)} u/s, full charge ${full.sp.toFixed(0)} u/s`);
  assert(full.sp>=tap.sp*1.3,'beach: the full charge is clearly faster than a tap ('+full.sp.toFixed(0)+' vs '+tap.sp.toFixed(0)+')');assert(!full.out,'beach: a full charge stays in the court');}
 // the pace ladder (owner Nov 5 2026): the beach human runs 70 % of the 11v11 (run 6.91, sprint 8.99 m/s) on sand; chasers at full speed
 {const outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK),sim=new MatchSim(311,'beach');for(let i=0;i<60;i++)sim.step(DT);
  const me=outf(sim,'gold')[0],p=sim.players[me],sp=[],k=bv.length/380*sim.windupScale;sim.lockHuman(me);
  for(let i=0;i<100;i++){p.x=20;p.y=200;sim.humanInput(me,{mx:0,my:-1,sprint:i>=20&&i<80});sim.step(DT);sp.push(sim.restart||sim.goalHold>0?NaN:Math.hypot(p.vx,p.vy));}
  const run=sp[19]*k,sprint=Math.max(...sp.slice(36,80).filter(Number.isFinite))*k;console.log(`  beach pace: run ${run.toFixed(2)} m/s, sprint ${sprint.toFixed(2)} m/s`);
  assert(Math.abs(run-4.84)<.15&&Math.abs(sprint-6.29)<.2,'beach: ~4.8 m/s, sprint ~6.3 m/s (70 % of the 11v11)');assert.equal(sim.humanChaseMul,1);assert.equal(sim.humanSprintBoost,1.3);}
 // shot pace ×1.2 on the beach (the AI's beach strikes snap the same); aim marks sit where the shot is drawn landing
 {const pace=f=>{const s=new MatchSim(11,f);for(let i=0;i<30;i++)s.step(DT);const a=s.ids.find(id=>s.players[id].team==='gold'&&s.players[id].role==='fwd');s.lockHuman(a);s.restart=null;s.possession='gold';s.placePlayer(a,135,90);s.ball.owner=a;s.ball.x=135;s.ball.y=90;s.humanInput(a,{mx:0,my:-1,shoot:true,shootPower:.5});s.step(DT);return Math.hypot(s.ball.vx,s.ball.vy);};
  const r=pace('beach')/pace('7v7');assert(Math.abs(r-1.2*1.08)<.03,'beach human shot ×1.2 × the pace ladder 1.08: '+r.toFixed(3));
  const half=(bv.goalWidth/2-.27)/bv.width*250,mark=half*SHOT_AIM.inFull*bv.width/250,land=SP.shotOffsetAt({aimX:135+SHOT_AIM.goalHalf*SHOT_AIM.inFull},1,bv.goalWidth,bv.width)+SHOT_AIM.goalHalf*SHOT_AIM.inFull*bv.width/250;
  assert(Math.abs(mark-land)<1e-9,'the corner mark = where the full-aim shot is drawn ('+mark.toFixed(2)+' m)');assert(mark<bv.goalWidth/2-.19,'inside the drawn post');
  assert.match(rt,/half=shotMouthX\(135\+SHOT_AIM\.goalHalf,fv\.goalWidth\)\/fv\.width\*250/,'beach marks on the drawn 5.5 m goal (now the same mapping on every venue, see the aim-marks block)');}
 // a human kick-in: the toast, the 4 s (real) rule, and a goal straight from it ruled out with a toast
 {const sim=new MatchSim(311,'beach');for(let i=0;i<60;i++)sim.step(DT);sim.lockHuman('st');
  sim.restart={kind:'kickin',t:0,x:16,y:200,taker:'st'};sim.placePlayer('st',16,200);let t=0;while(sim.ball.owner!=='st'&&t<200){sim.humanInput('st',{mx:0,my:0});sim.step(DT);t++;}
  assert.equal(sim.ball.owner,'st','he takes the kick-in');assert.equal(sim.humanNote.id,'st');assert.equal(sim.humanNote.text,SM.BEACH_HUMAN_NOTES.kickin);
  let k=0;while(sim.ball.owner==='st'&&k<300){sim.humanInput('st',{mx:.3,my:-.3});sim.step(DT);k++;}const real=k*DT/sim.windupScale;
  assert(real>SM.BEACH_HUMAN_RESTART_S-.2&&real<SM.BEACH_HUMAN_RESTART_S+.4,'played for him after ~4 real s: '+real.toFixed(2));assert.equal(sim.humanNote.text,SM.BEACH_HUMAN_NOTES.late);assert(sim.ball.target,'to a teammate');
  for(let i=0;i<30;i++)sim.step(DT);
  sim.restart={kind:'kickin',t:0,x:30,y:60,taker:'st'};sim.placePlayer('st',30,60);t=0;while(sim.ball.owner!=='st'&&t<200){sim.humanInput('st',{mx:0,my:0});sim.step(DT);t++;}
  sim.placePlayer('st',135,60);sim.ball.x=135;sim.ball.y=60;const g=sim.score.gold,n=sim.humanNote.serial;sim.humanInput('st',{mx:0,my:-1,shoot:true,shootPower:1,aimX:.6,aimH:.5});sim.step(DT);
  for(let i=0;i<40;i++){sim.placePlayer('dgk',40,20);sim.step(DT);}assert.equal(sim.score.gold,g,'no goal straight from a kick-in');assert(sim.humanNote.serial>n);assert.equal(sim.humanNote.text,SM.BEACH_HUMAN_NOTES.noGoal);
  // an AI taker gets no toast
  const m=sim.humanNote.serial;sim.restart={kind:'kickin',t:0,x:16,y:300,taker:'cb'};for(let i=0;i<60;i++)sim.step(DT);assert.equal(sim.humanNote.serial,m,'toasts are for the human only');
  for(const s of Object.values(SM.BEACH_HUMAN_NOTES))assert(s.length<80,'a one-line toast: '+s);}
 // full time with a human in: level → extra time → penalties (simulated: humans cannot take them), the beat walks everyone to their half, then a new game he keeps playing
 {const sim=new MatchSim(311,'beach');for(let i=0;i<60;i++)sim.step(DT);sim.lockHuman('st');
  sim.score.gold=sim.score.blue=2;sim.period=3;sim.periodEnd=sim.clock;sim.restart=null;sim.goalHold=0;sim.ballIsShot=false;
  const r0=sim.results.length;let s=0;while(sim.results.length===r0&&s<400){sim.humanInput('st',{mx:1,my:0});sim.step(DT);s++;}
  const res=sim.results.at(-1);assert(res&&res.pens&&res.pens.gold!==res.pens.blue,'a shoot-out decided it');assert.equal(sim.period,5);
  s=0;while(sim.period!==1&&s<600){sim.humanInput('st',{mx:0,my:0});sim.step(DT);s++;}assert.equal(sim.period,1,'a new game');assert(sim.humans.has('st'),'still his slot');
  const x0=sim.players.st.x;for(let i=0;i<20;i++){sim.humanInput('st',{mx:-1,my:0});sim.step(DT);}assert(sim.players.st.x<x0-3,'and the stick moves him again');
  assert.match(rt,/popWord\(r\.pens\?'Penalties!':'Full time!'\)/,'the Penalties! / Full time! pop');assert.match(rt,/Shoot-outs are played for you/);
  assert.match(rt,/if\(n\.id===e\.humans\.get\(ME\)\?\.slot\)\{tip=n\.text;tipT=3\.2;\}/,'the sim\'s toasts for my slot');}
 // the sitting-out player's spot keeps clear of the touchline flags (halfway + 9 m), 1.37 m off the line
 {assert.deepEqual([...V.BEACH_TOUCHLINE_FLAGS_Y].map(Math.round),[105,200,295]);const K=load('lib/town/coralCay.ts').BEACH_COURT,o={x:0,y:0},mg=J.benchMargin(bv.width);
  assert.match(fr,/if\(v\.sand\)benchPoint\.y=clearOfFlags\(benchPoint\.y,BEACH_TOUCHLINE_FLAGS_Y\)/);
  const flags=[];for(const sz of [-1,1]){flags.push([K.x,K.z+sz*(K.width/2+1)]);for(const sx of [-1,1])flags.push([K.x+sx*(K.length/2-K.penalty),K.z+sz*(K.width/2+1)]);}
  let worst=Infinity;for(let y=40;y<=360;y+=2)for(const x of [60,210])for(const i of [0,1]){J.touchlineSpot(x,y,i,o,mg);o.y=J.clearOfFlags(o.y,V.BEACH_TOUCHLINE_FLAGS_Y);
   const wx=V.liveWorldX(bv,o.x,o.y),wz=V.liveWorldZ(bv,o.x,o.y);for(const [fx,fz] of flags)worst=Math.min(worst,Math.hypot(wx-fx,wz-fz));
   assert(Math.abs(Math.abs(wz-K.z)-(K.width/2+1.37))<.01,'1.37 m off the touchline');assert(Math.abs(wz-K.z)<K.width/2+3.4-.5,'in front of the benches');}
  assert(worst>1,'clear of every flag pole: '+worst.toFixed(2)+' m');assert.equal(J.clearOfFlags(150,V.BEACH_TOUCHLINE_FLAGS_Y),150,'elsewhere unchanged');}
 // camera angles on the quarter-turned court: gold attacks west (liveWorldYaw(v,0,-1)), never "north is up"
 {const pitch={x:bv.x,z:bv.z,width:bv.width,length:bv.length,yaw:bv.yaw,ground:0},f=C.createJoinCamFrame(),deg=r=>r*180/Math.PI;
  const attack=t=>{const y=V.liveWorldYaw(bv,0,t==='gold'?-1:1);return {x:Math.sin(y),z:Math.cos(y)};};assert(attack('gold').x<-.99,'gold attacks west');assert(attack('blue').x>.99,'blue attacks east');
  for(const t of ['gold','blue'])for(const aspect of [.46,1.6]){const a=attack(t),px=bv.x-a.x*6,pz=bv.z+3;
   C.joinCamFrame('behind',px,pz,a.x,a.z,pitch,aspect,43,f);const fx=f.lx-f.ex,fz=f.lz-f.ez,fl=Math.hypot(fx,fz);assert(Math.abs(fx/fl-a.x)<1e-6&&Math.abs(fz/fl-a.z)<1e-6,t+': behind looks at the goal you attack');
   C.joinCamFrame('wide',px,pz,a.x,a.z,pitch,aspect,43,f);const wx=f.lx-f.ex,wy=f.ly-f.ey,wz=f.lz-f.ez,wl=Math.hypot(wx,wy,wz);
   for(const end of [-1,1]){const gx=bv.x+a.x*end*bv.length/2,gz=bv.z+a.z*end*bv.length/2,dx=gx-f.ex,dy=-f.ey,dz=gz-f.ez,dl=Math.hypot(dx,dy,dz);assert(deg(Math.acos((dx*wx+dy*wy+dz*wz)/(dl*wl)))<20.5,t+' '+aspect+': wide frames both beach goals');}
   C.joinCamFrame('side',px,pz,a.x,a.z,pitch,aspect,43,f);const sx=f.lx-f.ex,sz=f.lz-f.ez,sl=Math.hypot(sx,sz);assert(Math.abs(-sz/sl-a.x)<1e-6&&Math.abs(sx/sl-a.z)<1e-6,t+': side, the goal you attack on the right');
   const f1=C.createJoinCamFrame(),f2=C.createJoinCamFrame();C.joinCamFrame('side',bv.x-2,bv.z,a.x,a.z,pitch,aspect,43,f1);C.joinCamFrame('side',bv.x-6,bv.z,a.x,a.z,pitch,aspect,43,f2);assert(Math.abs(Math.abs(f2.lx-f1.lx)-4)<1e-6&&Math.abs(f2.lz-f1.lz)<1e-6,'side tracks along the east–west length');}
  for(const t of ['gold','blue']){const a=attack(t),c=C.createJoinCamera(),g=C.createJoinCamFrame(),out=C.createJoinCamFrame();C.joinCamFrame('behind',bv.x,bv.z,a.x,a.z,pitch,1.6,43,g);c.set('behind',0);c.step(1,true,g);
   const d=c.blend(bv.x+16,23,bv.z+33,out),up=C.turnStick(-.515,-.857,c.control(1/60,d,1),{x:0,z:0});assert(up.x*a.x+up.z*a.z>.99,t+': behind you, stick up = the beach goal you attack');}
  // the world stick → sim mapping turns with the court: pushing toward the west goal is sim −y for gold
  assert.match(fr,/sx=\(wx\*c-wz\*s\)\*250\/v\.width,sy=\(wx\*s\+wz\*c\)\*380\/v\.length/);{const c=Math.cos(bv.yaw),s=Math.sin(bv.yaw),wx=-1,wz=0;assert((wx*s+wz*c)<-.99,'west = up the sim pitch (gold attacks sim y 8)');}}
console.log('PASS join-live-game (beach): Play-only bar, barefoot kits + bib colours, sand passes, shot ×1.2, aim marks on the drawn goal, 4 s kick-ins + no direct goal toast, full time + penalties with a human, bench clear of the flags, camera on the turned court');}

// ---- Aim marks = where the shot lands, on every live venue (Nov 4 2026: on the island pitches the marks sat ~0.3 m wide,
// drawn at the sim's GHALF scaled by pitch width while shotPlacement draws the ball crossing inside the real posts) ----
{const V=load('lib/town/venues.ts'),P=load('lib/town/liveBallPhysics.ts'),SP=load('lib/town/shotPlacement.ts'),{SHOT_AIM}=H,rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');
 assert.match(rt,/half=shotMouthX\(135\+SHOT_AIM\.goalHalf,fv\.goalWidth\)\/fv\.width\*250;/,'pickCorner maps the marks with shotPlacement on every venue');
 assert.match(rt,/x=135\+m\.x\*half\*SHOT_AIM\.inFull;aimPts\[i\*3\]=liveWorldX\(fv,x,gy\)/);
 const rows=[];
 for(const v of V.LIVE_VENUES)for(const ax of [1,-1]){
  const sim=new MatchSim(311,v.id);sim.windupScale=.32;for(let i=0;i<60;i++)sim.step(DT);
  const me=outfieldIds(sim,'gold')[1],gk=sim.ids.find(id=>sim.players[id].team!=='gold'&&sim.players[id].isGK);sim.lockHuman(me);
  const phys=P.createLiveBallPhysics(1,v);sim.restart=null;sim.placePlayer(me,150,95);Object.assign(sim.ball,{owner:me,x:150,y:95,vx:0,vy:0});sim.possession='gold';sim.protect=0;sim.passCd=1;
  sim.humanInput(me,{mx:0,my:-1,shoot:true,shootPower:1,aimX:ax,aimH:1});
  let best=null;for(let i=0;i<960;i++){if(gk)sim.placePlayer(gk,ax>0?60:210,30);sim.step(DT/8);phys.step(sim,DT/8,true);const p=SP.shotProgress(sim.lastKick,sim.ball.y);if(sim.shotActive&&(!best||p>best.p))best={x:sim.ball.x,y:sim.ball.y,off:phys.shotOffset,p};}
  assert(best&&best.p>.97,v.id+': the shot reaches the goal line');
  const yaw=v.yaw??0,lx=V.liveWorldX(v,best.x,best.y)+best.off*Math.cos(yaw),lz=V.liveWorldZ(v,best.x,best.y)-best.off*Math.sin(yaw);
  const half=SP.shotMouthX(135+SHOT_AIM.goalHalf,v.goalWidth)/v.width*250,mx=135+ax*half*SHOT_AIM.inFull,d=Math.hypot(V.liveWorldX(v,mx,best.y)-lx,V.liveWorldZ(v,mx,best.y)-lz);
  assert(d<.1,v.id+' '+(ax>0?'right':'left')+': mark within 0.1 m of the landing ('+d.toFixed(3)+' m)');rows.push(v.id+' '+d.toFixed(2));}
 console.log('  aim mark vs landing (m): '+rows.join(', '));}
console.log('PASS join-live-game (aim marks): marks and shot landing agree within 0.1 m on all live venues');
