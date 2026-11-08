// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md): walk onto the live 7v7 with your ball and play.
// Covers the pure logic (format switch, walk-on countdown, team + slot assignment for N humans, the replaced NPC's walk
// to the touchline and cheer rhythm, the multi-human input map), the passing assist (cone choice, blocked lane,
// hysteresis, lead + pace, shot aim), off-ball runs (run selection, onside-safe forward target), the MatchSim
// integration (locked control, N humans, pass/forward/shoot/tackle/call, release to the AI, AI-only matches unchanged
// in cost) and the bibs (colour-blind-safe pair, keepers that clash with neither).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
// Tackle wind-up (Nov 7 2026, liveMechanics TACKLE_FX): a press in reach SETS first; step through the set to its result.
const TK=(sim,me)=>{for(let i=0;i<12&&sim.tackleWindupOf(me)>0;i++){sim.humanInput(me,{mx:0,my:0});sim.step(1/30);}};
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
 let flips=0,quick=0,lastAt=-99,last=shown,prev=null;for(let i=0;i<30;i++){sim.ball.owner=a;sim.humanInput(a,{mx:.05*Math.sin(i),my:-1});sim.step(DT);const t=sim.humanTarget(a,'short');if(t!==last){flips++;if(i-lastAt<8&&t===prev)quick++;lastAt=i;prev=last;last=t;}}
 // he runs ~120 u up the pitch in this second, so the best man may honestly change as he passes players (Tier 1, Nov 7 2026:
 // idle-human cover moves the AI differently); a flicker is a change straight back within 8 frames (A -> B -> A; Tier 2, Nov 7:
 // the contest heavy touches move the AI again, and he now runs past three men into the box: st -> lm -> rm -> st, no flicker)
 assert(flips<=3&&quick===0,'the marker does not flicker under a wobbly stick ('+flips+' changes, '+quick+' quick)');
 sim.ball.owner=a;sim.humanInput(a,{mx:0,my:-1,pass:true});sim.step(DT);
 assert.notEqual(sim.ball.owner,a,'the pass leaves his foot');assert(sim.ball.target||sim.ball.intBy,'played to a player');
 const sp=Math.hypot(sim.ball.vx,sim.ball.vy);assert.equal(sim.humanBallPace,1.5,'7v7 ball pace (owner Nov 5 2026: match the 9v9)');assert(sp>=180&&sp<=420*1.3*sim.humanBallPace+1,'weighted pace ('+sp.toFixed(0)+')');
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
  sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);if(sim.ball.owner===me)won++;}
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
 assert(lo/run>=1.27&&hi/run<=1.5,'clearly faster than the run (7v7 sprint boost 1.3 since Nov 5 2026): x'+(lo/run).toFixed(2));
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
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');assert.match(rt,/passNow=aUp&&\(aMode==='pass'\|\|aMode==='throw'\)&&\(mode\.a===aMode\|\|graceA/,'Pass (and a keeper\'s Throw) strikes on RELEASE (charge first)');}

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
 const trial=(aimx,press,mx=-1)=>{const sim=fresh();assert(sim.lockHuman('gk'),'a human takes the keeper slot');sim.placePlayer('gk',135,384);const before=sim.score.blue;
  for(let i=0;i<5;i++){sim.humanInput('gk',{mx:0,my:0});sim.step(DTL);}
  if(press==='early')sim.humanInput('gk',{mx:0,my:0,save:true});// pressed just before the strike: buffered
  shoot(sim,striker(sim),aimx);
  for(let i=0;i<120;i++){sim.humanInput('gk',{mx,my:0,save:press==='now'&&i===1});sim.step(DTL);if(sim.ball.owner==='gk'||sim.score.blue>before||!sim.ballIsShot)break;}
  const h=sim.humans.get('gk');return {sim,goal:sim.score.blue>before,caught:sim.ball.owner==='gk',saved:h.saveSerial>0,kind:h.saveKind,big:h.saveBig,dives:h.diveSerial};};
 {const sim=fresh();assert(sim.lockHuman('gk'));assert.deepEqual({...sim.humanOn},{gold:1,blue:0});assert.equal(sim.userId,'gk');}
 assert(trial(153,null).goal,'a corner beats a keeper who stays on the spot');
 for(const aim of [153,118]){const t=trial(aim,'now',0);assert(!t.goal&&t.saved&&t.dives===1,'Dive (stick idle) dives at the shot line and saves it: '+aim);assert(t.kind===0?t.caught:!t.caught,'catch = in his hands, parry / tip = knocked away');}
 // Stick + Dive (Nov 5 2026): a stick leaning the shot's way is a read (saved); a deliberate push the OTHER way dives that way (beaten)
 {const t=trial(153,'now',1);assert(!t.goal&&t.saved,'stick toward the shot side + Dive: saved');}
 {const t=trial(153,'now',-1);assert(t.goal&&!t.saved&&t.dives===1,'stick pushed the other way + Dive: he dives the wrong way and is beaten');}
 // a real dive, not a teleport: the push-off holds him (HK.diveLag), then he flies at HK.diveSpeed × the court's diveBy (no faster)
 {const sim=fresh();sim.lockHuman('gk');sim.placePlayer('gk',135,384);for(let i=0;i<5;i++){sim.humanInput('gk',{mx:0,my:0});sim.step(DTL);}
  sim.humanInput('gk',{mx:1,my:0,save:true});sim.step(DTL);const x0=sim.players.gk.x;let lag=0;while(Math.abs(sim.players.gk.x-x0)<1e-6&&lag<1){sim.humanInput('gk',{mx:1,my:0});sim.step(DTL);lag+=DT;}
  assert(lag>=HK.diveLag-DT*1.5&&lag<=HK.diveLag+DT*1.5,'push-off '+lag.toFixed(3)+' s');let run=0;const x1=sim.players.gk.x;for(let i=0;i<6;i++){sim.humanInput('gk',{mx:1,my:0});sim.step(DTL);run+=DT;}
  const v=(sim.players.gk.x-x1)/run;assert(v>0&&v<=HK.diveSpeed*(HK.diveBy['7v7']??1)*1.05,'dive speed '+v.toFixed(1)+' u/real s');}
 // a corner beats a late dive; the AI places more shots in the corner away from a human keeper (positioning matters)
 {const t=trial(152,null,0);assert(t.goal,'a corner beats a keeper who never dives');}
 assert.equal(HK.cornerShare>0&&HK.awaySide>.5,true);
 {const t=trial(150,'early',0);assert(!t.goal&&t.saved,'a press just before the strike still saves (input buffer)');}
 assert(trial(135,null,0).caught,'a shot at him is caught without a press (stick idle: at the 7v7 pace since Nov 5 a held stick runs him off the line)');
 // stick: moves him, clamped to his box (the area the AI keeper uses); no sprint in goal
 {const sim=fresh();sim.lockHuman('gk');for(let i=0;i<900;i++){sim.humanInput('gk',{mx:.6,my:-.8,sprint:true});sim.step(DTL);}const g=sim.players.gk;
  assert(g.x<=135+HK.boxHalf+1.5&&g.y>=392-HK.boxDepth-1.5,'kept in his box: '+g.x.toFixed(1)+','+g.y.toFixed(1));assert(g.y<392-HK.boxDepth+6,'but he does come off his line');}
 // distribution: Throw (A) to a teammate, Kick (B) long; holding it past six seconds, the AI plays it
 const caught=()=>{const t=trial(135,null,0);assert(t.caught&&t.sim.keeperHands,'in his hands');return t.sim;};
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
 assert.match(rt,/save:'Dive',throw:'Throw',kick:'Kick'/);assert.match(rt,/m\.a==='save'&&view\.catchable\?'Catch'/,'Dive becomes Catch when the shot comes at his body');assert.match(rt,/save:'Stay on your line, dive at the shot\.'/);assert(!rt.includes("(soon)"),'no "(soon)" in the position dropdown');
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
 assert.match(rt,/if\(!goal&&camCtl\.w<=0\)\{camDelta=0;lookAhead\(camera,dt,reduced\);return;\}/,'Broadcast at rest: only the big pitches\' ball lookahead');assert.match(rt,/if\(lookX===0&&lookZ===0&&lookT\.x===0&&lookT\.z===0\)return;/,'no work once eased to 0');
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
  hu.guard=0;/* the receive guard (HUMAN_GUARD) has its own section; TACKLE_FX.aiWind: the defender sets first */for(let i=0;i<4&&sim.ball.owner===me;i++){sim.placePlayer(foe,sim.players[me].x,sim.players[me].y-3);sim.humanInput(me,{mx:0,my:-1});sim.step(DT);}assert.notEqual(sim.ball.owner,me,'after the window a defender on him can win it again');sim.rng=rng;
  assert.equal(sim.dazed.size,0,'the bamboozled defender recovers');
  give(sim,me,135,250);for(let i=0;i<20&&hu.trickCd>0;i++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
  sim.humanInput(me,{mx:0,my:0,trick:true});sim.step(DT);assert.equal(hu.trickKind,'croqueta','next tap: La Croqueta');
  for(let i=0;i<20&&hu.trickCd>0;i++){sim.ball.owner=me;sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
  sim.ball.owner=me;sim.players[me].vx=0;sim.players[me].vy=-30;sim.humanInput(me,{mx:0,my:1,trick:true});sim.step(DT);assert.equal(hu.trickKind,'dragBack','stick pulled back: the drag-back');
  // the burst: +15% pace while it lasts, never past his own full sprint (the pose limit, Nov 5 2026)
  const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');assert.match(src,/hu!\.trickBoost > 0\) maxV = Math\.min\(maxV \* TRICK\.burstPace, Math\.max\(maxV, P\.runSpeed \* rm\.speed \* this\.humanSprintBoost\)\)/);}
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
  const go=(gap,face)=>{let won=0;for(let k=0;k<40;k++){give(sim,foe,140,200);sim.placePlayer(me,140,200+gap);hu.tackleRec=0;hu.faceX=0;hu.faceY=face;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);if(sim.ball.owner===me)won++;}return won;};
  const near=go(9,-1),far=go(reach+3,-1);console.log('  tackles won: '+near+'/40 at 9 units (old reach 7.6), '+far+'/40 out of reach');
  assert(near>=28,'a tackle just outside the old reach now usually wins it ('+near+'/40)');assert.equal(far,0,'no free steals from range');
  // Tackle assist (Nov 5 2026): a failed roll from the FRONT (blue attacks +y) pokes it loose instead of missing; from behind a short-recovery miss he can retry
  const TA=H.TACKLE_ASSIST;
  give(sim,foe,140,200);sim.placePlayer(me,140,206);const rng=sim.rng;sim.rng=()=>.99;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);sim.rng=rng;
  assert(sim.ball.owner!==foe&&hu.tackleRec===0,'front: no miss, the ball is poked away from the carrier ('+sim.msg+')');
  give(sim,foe,140,200);sim.placePlayer(me,140,194);hu.tackleRec=0;sim.rng=()=>.99;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);sim.rng=rng;
  assert(sim.ball.owner===foe&&hu.tackleRec>0&&hu.tackleRec<=TA.recover&&TA.recover<TACKLE.recover,'behind: a miss with a shorter recovery ('+hu.tackleRec.toFixed(2)+' s, was '+TACKLE.recover+')');
  let f=0;while(hu.tackleRec>0&&f<30){give(sim,foe,140,200);sim.placePlayer(me,140,194);sim.humanInput(me,{mx:0,my:0});sim.step(DT);f++;}
  assert(f<=8,'the retry is ready within '+f+' frames');let retry=0;
  for(let k=0;k<20;k++){give(sim,foe,140,200);sim.placePlayer(me,140,194);hu.tackleRec=0;sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);if(sim.ball.owner===me)retry++;}
  assert(retry>=12,'the retry from behind usually wins it ('+retry+'/20)');}
 // Long ball: tap = the ground pass, hold = lofted over the defenders to a teammate at the distance the hold asks for
 {const sim=fresh(),me=outf(sim,'gold')[1];sim.lockHuman(me);const g=outf(sim,'gold').filter(id=>id!==me);
  const setUp=()=>{away(sim,'blue',380);give(sim,me,135,320);g.forEach((id,i)=>sim.placePlayer(id,[135,95,175,60,210,240][i]??135,[290,240,160,330,340,345][i]??340));sim.players[me].vx=sim.players[me].vy=0;};
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true});sim.step(DT);assert.equal(sim.ball.lofted,false,'a tap stays a ground pass');const tapTo=sim.ball.target;
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true,long:.05});sim.step(DT);assert(sim.ball.lofted,'held: lofted');const nearTo=sim.ball.target;
  setUp();sim.humanInput(me,{mx:0,my:-1,pass:true,long:1});sim.step(DT);assert(sim.ball.lofted&&sim.loftPeak>=LONG_BALL.peak1-.01,'full hold: the highest loft');const farTo=sim.ball.target;
  const d=id=>Math.hypot(sim.players[id].x-135,sim.players[id].y-320);
  console.log('  long ball: tap → '+d(tapTo).toFixed(0)+' u, short hold → '+d(nearTo).toFixed(0)+' u, full hold → '+d(farTo).toFixed(0)+' u');
  assert(d(farTo)>d(nearTo)&&d(farTo)>120,'the longer the hold, the longer the ball');void tapTo;assert(sim.loftDur>0,'timed to land at his run');
  assert.match(fs.readFileSync('lib/town/kickFx.ts','utf8'),/sim\.ball\.lofted\?'#b877ff'/,'its trail is the lofted ball\'s purple (kick effects, Nov 5 2026: lib/town/kickFx.ts colour)');}
 // Snappier controls (humans only): time to 90% pace from a standstill, at the live 0.32 game speed and 60 fps
 {const sim=fresh(),me=outf(sim,'gold')[1];sim.lockHuman(me);sim.placePlayer(me,135,300);const p=sim.players[me];p.vx=p.vy=0;let t=0,top=0;
  for(let i=0;i<120;i++){sim.humanInput(me,{mx:1,my:0});sim.step(.32/60);top=Math.max(top,Math.hypot(p.vx,p.vy));}
  sim.placePlayer(me,135,300);p.vx=p.vy=0;for(let i=0;i<120;i++){sim.humanInput(me,{mx:1,my:0});sim.step(.32/60);if(Math.hypot(p.vx,p.vy)>=.9*top){t=(i+1)/60;break;}}
  const before=Math.log(10)/12/.32;console.log('  snappier stick: 90% pace in '+t.toFixed(2)+' s real (was ~'+before.toFixed(2)+' s at P.accel 12)');
  assert(t>0&&t<before*.8,'the human reaches his pace sooner');assert.equal(HUMAN_FEEL.accel,18);assert(HUMAN_FEEL.looseMul<.45&&HUMAN_FEEL.dribbleTau<.05&&HUMAN_FEEL.trapTau<.11);}
 // HUD: Trick only with the ball, Press only on defense, one slot, keys L / P, the cooldown ring, the toast word, slow motion off in reduced motion
 {const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
  assert.match(rt,/function modes\(\):JoinModes\{return joinModes\(view,rangeL,nearL,modeOut\);\}/,'the buttons come from liveControls.joinModes (tested per state below)');
  assert.match(rt,/hide\(t,!m\.c\)/,'the small button only shows with a mode');
  assert.match(rt,/trick:'L',press:'P'/);assert.match(rt,/kl=keys\.has\('l'\),kp=keys\.has\('p'\)/);
  assert.match(rt,/press:'Press together: two defenders win the ball back\.'/);assert.match(rt,/long:'Hold Pass for a long ball over the defenders\.'/);assert.match(rt,/trick:'Fake out the defender/);
  assert.match(hud,/data-join-t data-mode="trick"[^>]*hidden><i className=\{styles\.cool\}/);assert.match(hud,/data-join-pop/);
  assert.match(css,/\.cool\{[^}]*opacity:calc\(var\(--cool,0\)[^}]*transform:scale/,'cooldown ring: transform + opacity');assert.match(css,/\.a\[data-mode="press"\]\{background:/);
  assert.match(css,/\.a\[data-long\] \.charge\{border-color:#8a4fd6\}/,'the long-ball ring turns purple');
  assert.match(rt,/if\(fxAge>=0&&state\.phase==='joined'&&!reduced\)/,'reduced motion: no slow motion or zoom');assert.match(town,/games\.update\(active\?dt\*liveJoin\.timeScale:0/,'slow motion is local to the field runtime');
  // the cluster geometry (every state, mirrored too) is checked in the easier-controls section below
  void css;}
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
  const fx=fs.readFileSync('lib/town/matchEffects.ts','utf8')+fs.readFileSync('lib/town/kickFx.ts','utf8');assert.match(fx,/shot&&power\?'#ff7a2e'/,'the power shot keeps its flame trail (kickFx colour)');assert.match(fx,/powerFlight\?'solar':'classic'/,'flame trail = the pooled trail in solar style');
  assert.match(fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),/h\.shotPw>=POWER_SHOT\.full\)\{if\(hear\)\{ballSoundPlay\?\.\('kick',1\)/,'a louder strike layered on the kick');}
 // Shot slow motion: only from a human's shot (serial), only in the zone, power or aimed, never with reduced motion; skippable
 {const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');
  assert.match(rt,/if\(!reduced&&view\.inShotRange&&\(view\.shotAimed\|\|view\.shotPw>=SHOT_FX\.minCharge\)\)\{shotAge=0/,'human shot from the zone, power or aimed; reduced motion skips it');
  assert.match(rt,/shotSkip\|\|shotAge>\.15&&sim&&\(sim\.ball\.owner!==null\|\|sim\.goalHold>0\)/,'a tap, a save or a goal ends it');assert.match(rt,/function onTap\(\)\{if\(shotAge>\.12\)shotSkip=true;/);
  assert.match(rt,/timeScale=Math\.min\(timeScale,slowMoScale\(shotAge,SHOT_FX\.scale/,'one Town timeScale: the min of the trick and the shot (eased curves, Nov 5 2026)');
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

// ---- Tackle assist (owner Nov 5 2026: "make it easier to tackle and get the ball back"), all five formats ----
{const TA=H.TACKLE_ASSIST,outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
 const setup=(F,seed,ox,oy,protect=0)=>{const sim=new MatchSim(seed,F);for(let i=0;i<30;i++)sim.step(DT);const me=outf(sim,'gold')[1],c=outf(sim,'blue')[1];sim.lockHuman(me);
  outf(sim,'gold').forEach((id,i)=>{if(id!==me)sim.placePlayer(id,20+i*30,30);});outf(sim,'blue').forEach((id,i)=>{if(id!==c)sim.placePlayer(id,20+i*30,60);});
  sim.restart=null;sim.windup=null;sim.placePlayer(c,135,200);Object.assign(sim.ball,{owner:c,target:null,intBy:null,x:135,y:200,vx:0,vy:0,height:0});sim.possession='blue';sim.protect=protect;sim.passCd=3;sim.placePlayer(me,135+ox,200+oy);return {sim,me,c,hu:sim.humans.get(me)};};
 const at=(sim,me,c)=>{const p=sim.players[me],o=sim.players[c],dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1;return {mx:dx/d,my:dy/d,d};};
 // a normal approach: stick on the carrier from 30 units, ONE tap of Tackle when he is within D units; won within 1 s, never a restart (no fouls)
 const approach=(F,seed,ox,oy,D)=>{const {sim,me,c}=setup(F,seed,ox,oy);let pressed=-1;
  for(let i=0;i<75;i++){const s=at(sim,me,c),t=pressed<0&&s.d<D;if(t)pressed=i;sim.humanInput(me,{mx:s.mx,my:s.my,tackle:t});sim.step(DT);
   assert(!sim.restart||sim.restart.type==='kickoff',F+': a human tackle never gives a foul / free kick');if(sim.ball.owner===me)return 1;if(pressed>=0&&i-pressed>30)return 0;}return 0;};
 // get it back: an AI tackle just took it (protection running, the back window open); one tap at 0.2 s
 const getBack=(F,seed,open)=>{const {sim,me,c,hu}=setup(F,seed,0,-7,.55);hu.backT=open?TA.back:0;
  for(let i=0;i<45;i++){const s=at(sim,me,c);sim.humanInput(me,{mx:s.mx,my:s.my,tackle:i===6});sim.step(DT);if(sim.ball.owner===me)return i+1;}return 0;};
 const N=16,rows=[];
 for(const F of ['7v7','futsal','9v9','11v11','beach']){let won=0,n=0;
  for(let k=0;k<N;k++)for(const [ox,oy] of [[0,30],[30,8],[0,-30]])for(const D of [12,16]){won+=approach(F,500+k,ox,oy,D);n++;}
  let back=0,closed=0,tb=0,tc=0;for(let k=0;k<N;k++){const a=getBack(F,700+k,true),b=getBack(F,700+k,false);back+=a>0;closed+=b>0;tb+=a;tc+=b;}tb/=Math.max(1,back);tc/=Math.max(1,closed);
  rows.push(F+' '+won+'/'+n+', get-back '+back+'/'+N+' in '+tb.toFixed(1)+' frames (window shut '+closed+'/'+N+' in '+tc.toFixed(1)+')');
  assert(won>=n*.85,F+': a normal approach wins the ball from an AI carrier in most tries ('+won+'/'+n+')');assert(won<n||F!=='never','not an auto-win');
  assert(back>=N*.9&&back>=closed&&tb<tc,F+': just after losing it, the next tackle gets it back at once ('+back+'/'+N+' in '+tb.toFixed(1)+' frames vs '+closed+' in '+tc.toFixed(1)+' without the window)');}
 console.log('  tackle assist (one tap, normal approach): '+rows.join('; '));
 // the lunge: a tap out of reach but within assistR moves him at the carrier faster than his run, press armed
 {const reach=(4.2+A.PASS_ASSIST.tackleReach)*H.TACKLE.reachMul;assert(20>reach&&20<TA.assistR);
  const lunge=(seed,R)=>{const old=TA.assistR;TA.assistR=R;const {sim,me,c,hu}=setup('7v7',seed,20,0);sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);const started=hu.lunge>0;let min=Infinity;
   for(let i=0;i<20&&sim.ball.owner===c;i++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);const p=sim.players[me],o=sim.players[c];min=Math.min(min,Math.hypot(p.x-o.x,p.y-o.y));}TA.assistR=old;return {started,reached:min<reach||sim.ball.owner!==c};};
  let started=0,reached=0,without=0;for(let k=0;k<10;k++){const r=lunge(511+k,TA.assistR);started+=r.started;reached+=r.reached;without+=lunge(511+k,0).reached;}
  assert.equal(started,10,'a tap at 20 units (outside the reach) starts the assisted lunge');
  assert(reached>=8&&without<=1,'the lunge carries him into reach with the press armed, no stick ('+reached+'/10; without the assist '+without+'/10)');
  const far=setup('7v7',511,0,TA.assistR+6);far.sim.humanInput(far.me,{mx:0,my:0,tackle:true});far.sim.step(DT);assert.equal(far.hu.lunge,0,'no lunge from long range');}
 // loose balls: a ball at rest 8.5 units from an idle human (outside the AI's 5.5 reach) is his within half a second
 {const {sim,me,c}=setup('7v7',512,0,40);const p=sim.players[me];Object.assign(sim.ball,{owner:null,target:null,intBy:null,x:p.x+8.5,y:p.y,vx:0,vy:0});sim.lastFrom=c;sim.placePlayer(c,20,20);
  let i=0;while(sim.ball.owner!==me&&i<15){sim.humanInput(me,{mx:0,my:0});sim.step(DT);i++;}assert.equal(sim.ball.owner,me,'loose-ball magnet + pickup reach ('+i+' frames)');}
 // AI tackles on a human still open the window; AI-only matches never read any of it (fixtures checked below)
 const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');assert.match(src,/hu\.backT = TACKLE_ASSIST\.back/);assert.match(src,/const hb = this\.humans\.size && /);}

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
   for(let k=0;k<20;k++){give(sim,foe,140,200);sim.placePlayer(me,140,207);sim.humanInput(me,{mx:0,my:0,tackle:true});sim.step(DT);TK(sim,me);if(sim.ball.owner===me)won++;}
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
    for(let i=0;i<120;i++){sim.humanInput('gk',{mx:press==='wrong'?-1:0,my:0,save:!!press&&i===1});sim.step(DTL);if(sim.ball.owner==='gk'||sim.score.blue>before||!sim.ballIsShot)break;}
    const h=sim.humans.get('gk');return {goal:sim.score.blue>before,caught:sim.ball.owner==='gk',saved:h.saveSerial>0,kind:h.saveKind};};
   assert(trial(153,false).goal,tag+'a corner beats a keeper who stays put');for(const aim of [153,118]){const t=trial(aim,true);assert(!t.goal&&t.saved,tag+'Dive at '+aim);}
   assert(trial(153,'wrong').goal,tag+'a dive the wrong way (stick pushed away from the shot) is beaten');
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
   // Tier 2 (Nov 7 2026, HUMAN_SIDE.pace 1.15): the 11v11 run ~8 m/s, the sprint top unchanged (boost 1.3 / 1.15)
   if(F==='11v11')assert(Math.abs(run-7*1.15)<.4&&sprint>8.6&&sprint<relay-.2,'11v11: ~8 m/s, sprint ~9 m/s under the relay');}
  // adult tuning: AI chasers on a human carrier run at full pace on the 11v11 (the kids' × 0.82 stays on the other formats); AI never reads it
  {const sim=fresh();assert.equal(sim.humanChaseMul,1,tag+'chaser pace on a human carrier (full speed)');assert(Math.abs(sim.humanSprintBoost*sim.humanPace/(F==='11v11'?1:sim.humanPace)-1.3)<1e-9,tag+'sprint boost (11v11: the sprint top stays 1.3 x the old run)');
   assert.equal(sim.humanPace,{futsal:1.4,'9v9':1.29,'11v11':1.15}[F],tag+'pace ladder');const k=new MatchSim(311,'7v7');assert.equal(k.humanChaseMul,1,'7v7 chasers at full pace (Nov 5 2026)');assert.equal(k.humanSprintBoost,1.3);assert.equal(k.humanPace,1.72);assert.equal(k.humanBallPace,1.5,'7v7 matches the 9v9 speeds (owner Nov 5 2026)');}
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
  assert.match(fs.readFileSync('lib/town/match/matchSim.ts','utf8'),/paceMul = Math\.min\(this\.passMul \* 1\.3 \* charge \* this\.humanBallPace, this\.humanPassCap\)[\s\S]*\* paceMul \+ \(this\.groundFriction - P\.friction\) \* d, charge \}/,'the sand compensation (0 on grass)');}
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
  const r=pace('beach')/pace('7v7'),k7=new MatchSim(11,'7v7').humanBallPace;assert(Math.abs(r-1.2*1.08/k7)<.03,'beach human shot ×1.2 × the pace ladder 1.08 (vs the 7v7 human at ×'+k7+'): '+r.toFixed(3));
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
  Object.assign(sim.ball,{owner:null,target:null,intBy:null,x:30,y:60,vx:0,vy:0});/* the ball may be back at his feet by now (seeded play differs with the Nov 7 mechanics): a real kick-in */sim.restart={kind:'kickin',t:0,x:30,y:60,taker:'st'};sim.placePlayer('st',30,60);t=0;while(sim.ball.owner!=='st'&&t<200){sim.humanInput('st',{mx:0,my:0});sim.step(DT);t++;}
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

// ---- Quick goal reset (owner Nov 5 2026: "have the ball fade and show up in the center so the game can quickly be restarted"): with a
// human joined, the scored ball hides in the net, lands on the centre spot (goalReset.serial: the view's blue arrival) and the conceding
// side kicks off within GOAL_RESET of the celebration, nobody fetching it. AI-only matches keep the fetch-and-carry (fixture unchanged).
{const SM=load('lib/town/match/matchSim.ts'),G=SM.GOAL_RESET,S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 const score=(sim,human)=>{const gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK);sim.restart=null;Object.assign(sim.ball,{owner:null,target:null,intBy:null,x:135,y:40,vx:0,vy:-250,height:0});
  const g=sim.score.gold;for(let t=0;sim.score.gold===g&&t<60;t++){sim.placePlayer(gk,40,20);if(human)sim.humanInput(human,{mx:0,my:0});sim.step(DT);}assert.equal(sim.score.gold,g+1,'the test shot goes in');};
 const rows=[];
 for(const f of ['7v7','futsal','9v9','11v11','beach']){
  // a gold human scores: blue (the conceding side, AI) kicks off quickly from the spot
  {const sim=new MatchSim(311,f);sim.windupScale=f==="futsal"||f==="beach"?.48:.32;for(let i=0;i<60;i++)sim.step(DT);const me=outfieldIds(sim,'gold')[0];sim.lockHuman(me);score(sim,me);
   const s0=sim.goalReset.serial;let k=0,hid=-1,land=-1,take=-1;
   for(;k<600;k++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);const real=(k+1)*DT/sim.windupScale;
    if(hid<0&&sim.goalReset.hidden){hid=real;assert(sim.ball.y<20,f+': hidden where it went in');}
    if(land<0&&sim.goalReset.serial>s0){land=real;assert.equal(sim.goalReset.hidden,false);assert(sim.isRestart&&sim.restartKind==='kickoff',f+': a kick-off restart (the "Restart: get ready" bar)');}
    if(land>=0&&sim.isRestart){assert.equal(sim.ball.x,135);assert.equal(sim.ball.y,200,f+': the ball waits ON the centre spot (no fetch)');}
    if(land>=0&&!sim.isRestart){take=real;break;}}
   assert(Math.abs(hid-G.fadeAt)<.1,f+': fades '+hid.toFixed(2)+' s after the goal');assert(Math.abs(land-G.hold)<.1,f+': on the spot after the celebration ('+land.toFixed(2)+' s)');
   assert(take>0&&take-land<=1.5,f+': kicked off within 1.5 s of landing ('+(take-land).toFixed(2)+' s)');assert(sim.ball.owner&&sim.players[sim.ball.owner].team==='blue','the conceding side kicks off');
   assert.equal(sim.goalReset.serial,s0+1,'one landing a goal');rows.push(f+' '+take.toFixed(2)+'s');}
  // the human is on the conceding side and nearest the spot: he is the taker, the ball is his, and Pass works at once
  {const sim=new MatchSim(311,f);sim.windupScale=f==="futsal"||f==="beach"?.48:.32;for(let i=0;i<60;i++)sim.step(DT);const me=outfieldIds(sim,'blue')[0],src=outfieldIds(sim,'gold')[0];sim.lockHuman(me);sim.placePlayer(me,135,192);score(sim,me);
   for(let k=0;k<200&&sim.goalHold>0;k++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
   let k=0;for(;k<200&&sim.ball.owner!==me;k++){sim.humanInput(me,{mx:0,my:0});sim.step(DT);}
   assert.equal(sim.ball.owner,me,f+': the human taker has the ball');assert(k*DT/sim.windupScale<=1.5,f+': within 1.5 s of landing ('+(k*DT/sim.windupScale).toFixed(2)+' s)');assert.equal(sim.isRestart,false,'restart over: the bar clears');
   sim.humanInput(me,{mx:0,my:0,pass:true,passPower:.5});for(let i=0;i<3;i++)sim.step(DT);assert(sim.ball.owner!==me,f+': Pass plays it at once');void src;}
  // AI-only: the old fetch-and-carry kick-off, no quick reset
  {const sim=new MatchSim(311,f);for(let i=0;i<60;i++)sim.step(DT);score(sim,null);for(let i=0;i<200&&sim.goalHold>0;i++)sim.step(DT);
   assert.equal(sim.goalReset.serial,0,f+': AI-only never takes the quick reset');assert.equal(sim.goalReset.hidden,false);assert(sim.isRestart&&sim.ball.y<20,f+': AI-only: the ball still lies in the net for the fetch');}
 }
 for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged (seed '+e.seed+')');
 // the view: the character arrival reused (scaled, shortened), transform / opacity only, reduced motion = a plain fade
 const br=fs.readFileSync('lib/town/ballReset.ts','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');
 assert.match(br,/createCharacterArrival\(root,BALL_ARRIVAL\.duration\)/);assert.match(br,/if\(reduced\|\|!fx\)/,'reduced motion: fade only');assert.match(fr,/e\.ballReset\.update\(e\.sim,/);
 console.log('  goal → kick-off (real s, human in): '+rows.join(', '));}
console.log('PASS join-live-game (quick goal reset): fade in the net, arrival on the centre spot, quick kick-off on all 5 formats, human taker passes at once, AI-only unchanged');

// ---- Goal replays (owner Nov 5 2026: "do the replays for scores"; lib/town/goalReplay.ts): a preallocated ring of the last ~4 s of
// ball + players (the snapshot fields), a goal arms a slowed replay after the ball-flies-in beat; solo the sim holds, shared it runs on
// and the replay cuts back at the kick-off; Skip ends it; the live state, score and quick reset are untouched. Every format.
{const GR=load('lib/town/goalReplay.ts'),C=GR.GOAL_REPLAY,FRAMES=Math.ceil(C.keep*C.hz)+2;
 const liveOf=sim=>JSON.stringify([sim.ball.x,sim.ball.y,sim.ball.vx,sim.ball.vy,sim.ball.height,sim.ball.owner,sim.ball.lofted,sim.ids.map(id=>{const p=sim.players[id];return [p.x,p.y,p.vx,p.vy,p.kick];}),sim.score,sim.stats.time,sim.goalHold,sim.goalReset]);
 const rows=[];
 for(const f of ['7v7','futsal','9v9','11v11','beach'])for(const mode of ['solo','skip','shared','off']){
  const sim=new MatchSim(311,f);sim.windupScale=f==='futsal'||f==='beach'?.48:.32;const real=DT/sim.windupScale,me=outfieldIds(sim,'gold')[0];sim.lockHuman(me);
  const rr=GR.createGoalReplay(sim.ids.length),shared=mode==='shared',enabled=mode!=='off';let held=0,stepped=0,maxOff=0,lastBallY=NaN;
  // one field-runtime frame: step the replay, step the sim unless a solo replay holds it, record + watch, then the draw (apply/restore)
  const frame=(prep)=>{const playing=rr.step(real,shared,false,sim.goalHold,sim.isRestart);
   if(playing&&rr.holdSim){held++;rr.record(sim,0,sim.ball.height,0);}else{prep?.();sim.humanInput(me,{mx:0,my:0});sim.step(DT);stepped++;rr.record(sim,real,sim.ball.height,0);}
   rr.watch(sim,enabled,real);
   if(rr.active){const before=liveOf(sim),bx=sim.ball.x,by=sim.ball.y;assert.equal(rr.apply(sim),true);maxOff=Math.max(maxOff,Math.hypot(sim.ball.x-bx,sim.ball.y-by));lastBallY=sim.ball.y;
    assert(sim.ids.every(id=>Number.isFinite(sim.players[id].x)&&Number.isFinite(sim.players[id].y)),'replay positions are numbers');rr.restore(sim);assert.equal(liveOf(sim),before,f+': restore puts the live state back exactly');}
   return playing;};
  for(let i=0;i<190;i++)frame();
  for(let i=0;i<600&&(rr.phase!=='idle'||sim.goalHold>0||sim.isRestart);i++)frame();// an AI goal in the warm-up replays too: let it finish
  const serial0=rr.serial;
  assert.equal(rr.frames,FRAMES,f+': the ring fills and stays at its fixed size');assert(rr.history>=4,f+': ~4 s kept ('+rr.history.toFixed(2)+')');
  // the test shot (as in the quick-reset check), stepped through the runtime frame
  const gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK),g0=sim.score.gold,s0=sim.goalReset.serial;sim.restart=null;sim.directBan=false;/* (QA round 2: a warm-up keeper throw / kick-in must not ban the synthetic shot) */Object.assign(sim.ball,{owner:null,target:null,intBy:null,x:135,y:40,vx:0,vy:-250,height:0});
  for(let t=0;sim.score.gold===g0&&t<60;t++)frame(()=>sim.placePlayer(gk,40,20));assert.equal(sim.score.gold,g0+1,f+': the test shot goes in');
  if(mode==='off'){for(let i=0;i<120;i++)frame();assert.equal(rr.serial,serial0,f+': replays off: none');continue;}
  assert.equal(rr.phase,'pending',f+': a goal arms the replay');assert.equal(rr.scorer,'gold');
  let k=0;for(;k<60&&!rr.active;k++)frame();assert(rr.active,f+': it starts');assert(Math.abs((k+1)*real-C.delay)<=real*1.5,f+': after the ball-flies-in beat ('+((k+1)*real).toFixed(2)+' s)');
  assert.equal(sim.goalReset.hidden,false,f+': it starts before the scored ball fades');
  const score=JSON.stringify(sim.score),t0=sim.stats.time,st0=stepped;
  if(mode==='skip'){assert.equal(rr.skip(),false,'a tap in the first moment is the shot, not a skip');for(let i=0;i<8;i++)frame();assert.equal(rr.skip(),true,f+': Skip ends it');assert.equal(rr.active,false);assert.equal(rr.skipped,1);}
  let n=0;while(rr.active&&n<400){frame();n++;}
  assert.equal(rr.active,false,f+': it ends');assert.equal(JSON.stringify(sim.score),score,f+': the score is untouched');
  if(mode==='solo'){assert(Math.abs(rr.dur-(C.clip/C.rate))<.35,f+': ~3 s of slow motion ('+rr.dur.toFixed(2)+' s)');assert(sim.stats.time-t0<=DT+1e-9,f+': solo: the sim held (one step: the frame it ended)');assert(stepped-st0<=1&&held>=n,'no sim steps while it plays');
   assert(maxOff>8,f+': the build-up is drawn (the ball away from the net: '+maxOff.toFixed(1)+')');assert(lastBallY<26,f+': it ends with the ball in the net');}
  if(mode==='shared'){assert(rr.dur<=C.sharedMax+1e-6,f+': shared: fits the reset beat');assert(sim.stats.time>t0,f+': shared: the match ran on underneath');assert.equal(held,0,'shared: never held');}
  // the quick goal reset still happens after it: the ball lands on the spot, the kick-off is taken
  let land=false,take=false;for(let i=0;i<400&&!take;i++){frame();if(sim.goalReset.serial>s0)land=true;if(land&&!sim.isRestart)take=true;}
  assert(land&&take,f+' '+mode+': the reset (spot + kick-off) still happens');assert.equal(sim.goalReset.serial,s0+1);assert.equal(rr.serial,serial0+1,f+' '+mode+': one replay a goal');
  if(mode==='solo')rows.push(f+' '+rr.dur.toFixed(1)+'s');
 }
 // the view wiring: recorded only on the field I am on (AI-only matches untouched), the sim held through the clock, the live state put
 // back after the draw, the reset view paused (not skipped) while it plays; no allocation in the per-frame paths; HUD tag + Skip.
 const fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),gr=fs.readFileSync('lib/town/goalReplay.ts','utf8');
 assert.match(fr,/if\(!teaching&&e\.humans\.has\(OWN\)\)\{const rr=e\.replay\?\?=createGoalReplay\(e\.sim\.ids\.length\);rr\.record\(/,'recorded only with me on the field');
 assert.match(fr,/e\.clock\.take\(dtIn,immediate,active&&!teaching&&!isPaused\(v\.id\)&&!rp\?\.holdSim\)/,'solo: the clock holds the sim');
 assert.match(fr,/const replaying=!!rp&&rp\.apply\(e\.sim\);[\s\S]*if\(replaying\)e\.ballReset\.show\(\);else e\.ballReset\.update\([\s\S]*if\(replaying\)rp!\.restore\(e\.sim\);\n \}/,'apply → draw → restore');
 assert.match(fr,/const dt=rp\?dtIn\*rp\.rate:dtIn;/,'the rigs animate at the replay rate (real slow motion)');
 const hot=gr.slice(gr.indexOf('record(sim'),gr.indexOf('return r;'));assert(!/\bnew [A-Z]|=>|\[\]|\{[a-z]+:/.test(hot),'no allocation in record / watch / step / apply / restore');
 // Nov 6 2026 (deliberate): the three skip paths go through skipRep(), which calls games.skipReplay and books a real skip for the admin analytics.
 assert.match(rt,/function skipRep\(f:LiveFormat\)\{if\(games\.skipReplay\(f\)\)api\.onMatch\?\.\(\{type:'replay',skipped:true\}\);\}/,'skipRep skips the replay');
 assert.match(rt,/if\(b==='skip'\)\{if\(down&&format\)skipRep\(format\);return;\}/);assert.match(rt,/function onTap\(\)\{[^\n]*skipRep\(format\)/,'a tap anywhere skips');assert.match(rt,/!e\.repeat\)skipRep\(format\)/,'a key skips');
 assert.match(rt,/replayCamFrame\(repShot,camera\.aspect,cut\?want:repTight,repGoal\)/,'the replay camera frames goal + ball + shooter');assert.match(rt,/cut=reduced\|\|!!rep\?\.calm/,'reduced motion: the camera cuts');
 assert.match(rt,/if\(!cut\|\|fresh\|\|want!==repCutTight\)/,'reduced motion: held shots, recomputed only on a cut (no easing)');
 // the live goal overlays are off while it plays: the field's GOAL! card / light / rings (ended, not back after), the pop, tip, goal badge, aim marks; the controls fade
 const fxs=fs.readFileSync('lib/town/matchEffects.ts','utf8');assert.match(fxs,/function quiet\(\)\{celebration=9;badge\.visible=light\.visible=false;rings\[0\]\.visible=rings\[1\]\.visible=false;\}/,'quiet(): the GOAL! card, burst and rings hidden');
 assert.match(fr,/e\.effects\.update\([^\n]*\);if\(rp\)e\.effects\.quiet\(\);/,'the field runtime quiets the GOAL! card on every replay frame (after update)');
 assert.match(rt,/function replayHud\(on:boolean,goldScored:boolean\)\{[\s\S]{0,400}?tipT=0;popT=0;set\(el\('\[data-join-pop\]'\),'data-show',null\);hide\(el\('\[data-join-badge\]'\),true\)/,'replay start: pop, tip and goal badge off');
 assert.match(rt,/off=!replaying&&\(behind/,'no goal badge during a replay');assert.match(rt,/aiming&&view\.onBall&&!replaying\?aimPts/,'no aim marks during a replay');
 assert.match(css,/\.actions\[data-replaying\]\{opacity:0;/,'the action buttons fade (opacity) during a replay');assert.match(rt,/tc\.style\.opacity=on\?'0':''/,'the stick fades too (inline: it is Town\'s)');
 assert.match(css,/\.replaySkip\{min-height:44px;/,'Skip: a 44 px touch target');
 assert.match(hud,/data-join-replay className=\{styles\.replay\}[\s\S]*data-join-replay-skip[^>]*onClick=\{\(\)=>onPress\('skip',true\)\}[^>]*>Skip<\/button>/,'REPLAY tag + Skip');
 assert.match(css,/\.replay\{[^}]*top:var\(--tip-top/,'under the score bar (the pop\'s spot)');assert.match(css,/\.replaySkip\{[^}]*font:800 14px\/1 var\(--btn-font,Arial\)/,'Skip: the regular UI sans');assert(!/\.replay[^{]*\{[^}]*IslandBrush/.test(css),'no IslandBrush on the replay HUD');
 assert.match(fs.readFileSync('components/IslandSettings.tsx','utf8'),/aria-label="Goal replays" aria-pressed=\{replays\}/,'the settings toggle');assert.equal(GR.replaysEnabled(),true,'default on');
 console.log('  solo replay length: '+rows.join(', '));
 // The replay camera (Nov 5 2026 review: on a phone the goal was cut off and the ball a dot): a natural goal (I dribble in and shoot,
 // the keeper drawn away), then every replay frame's camera target (portrait phone, landscape phone, desktop) must hold the ball and
 // the whole goal mouth (posts + bar) inside the frame, and the eased camera (60 fps, as the runtime eases it) must keep the ball on
 // screen and end with the goal mouth in frame. The scorer is found (the ring) and is me. Every format (beach turned a quarter, futsal raised).
 {const V=load('lib/town/venues.ts'),CAM=load('lib/town/liveJoinCamera.ts'),TANV=Math.tan(20*Math.PI/180),camRows=[];
  const proj=(f,aspect,x,y,z)=>{let fx=f.lx-f.ex,fy=f.ly-f.ey,fz=f.lz-f.ez;const l=Math.hypot(fx,fy,fz);fx/=l;fy/=l;fz/=l;const rl=Math.hypot(fz,fx),rx=-fz/rl,rz=fx/rl,ux=-rz*fy,uy=rz*fx-rx*fz,uz=rx*fy;
   const dx=x-f.ex,dy=y-f.ey,dz=z-f.ez,df=dx*fx+dy*fy+dz*fz;return df<=0?[9,9]:[(dx*rx+dz*rz)/df/(TANV*aspect),(dx*ux+dy*uy+dz*uz)/df/TANV];};
  for(const f of ['7v7','futsal','9v9','11v11','beach']){
   const v=V.liveVenueById(f),g=v.elevation??0,sim=new MatchSim(311,f);sim.windupScale=f==='futsal'||f==='beach'?.48:.32;const real=DT/sim.windupScale,me=outfieldIds(sim,'gold')[0];sim.lockHuman(me);
   const gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK),rr=GR.createGoalReplay(sim.ids.length);
   const step=(inp)=>{const playing=rr.step(real,false,false,sim.goalHold,sim.isRestart);if(playing&&rr.holdSim)rr.record(sim,0,sim.ball.height,0);else{sim.humanInput(me,inp??{mx:0,my:0});sim.step(DT);rr.record(sim,real,sim.ball.height,0);}rr.watch(sim,true,real);return playing;};
   for(let i=0;i<190;i++)step();for(let i=0;i<600&&(rr.phase!=='idle'||sim.goalHold>0||sim.isRestart);i++)step();
   // the build-up: the ball at my feet in the attacking half, a run at goal, a shot from the edge of the box
   const g0=sim.score.gold;sim.restart=null;sim.placePlayer(me,175,190);Object.assign(sim.ball,{owner:me,target:null,intBy:null,x:175,y:190,vx:0,vy:0,height:0});sim.possession='gold';sim.protect=2;sim.passCd=1;
   let shot=false;for(let t=0;t<240&&sim.score.gold===g0;t++){sim.placePlayer(gk,40,20);if(sim.ball.owner===me)sim.protect=Math.max(sim.protect,.5);
    const p=sim.players[me],fire=!shot&&sim.ball.owner===me&&p.y<120;if(fire)shot=true;step(fire?{mx:-.3,my:-1,shoot:true,shootPower:.8}:{mx:-.2,my:-1});}
   assert(shot,f+': my run reached the box with the ball');assert.equal(sim.score.gold,g0+1,f+': my shot goes in');
   let k=0;for(;k<60&&!rr.active;k++)step();assert(rr.active,f+': the replay starts');
   assert(rr.shotT>=0&&rr.shotT>rr.playhead,f+': the shot is found inside the clip (the build-up comes before it)');
   const goal={x:V.liveWorldX(v,135,10),z:V.liveWorldZ(v,135,10)},ay=V.liveWorldYaw(v,0,-1),ax=Math.sin(ay),az=Math.cos(ay),hw=v.goalWidth/2;
   const corners=[[1,0],[-1,0],[1,1],[-1,1]].map(([s2,h])=>[goal.x-az*hw*s2,g+h*v.goalHeight,goal.z+ax*hw*s2]);
   const shotIn=CAM.createReplayCamShot(),tgt=CAM.createJoinCamFrame(),eye={x:0,y:0,z:0,lx:0,ly:0,lz:0};let worst=0,worstEase=0,tight=0,first=true,endFrame=null,meScorer=true,frames=0,dMin=1e9,dMax=0;
   const ASPECTS=[390/844,844/390,1280/800];
   while(rr.active&&frames<400){frames++;const playing=step();if(!playing)break;rr.apply(sim);
    const bx=V.liveWorldX(v,sim.ball.x,sim.ball.y),bz=V.liveWorldZ(v,sim.ball.x,sim.ball.y),by=g+.3+rr.ballH;
    if(rr.shooterX<0||Math.abs(sim.players[me].x-rr.shooterX)>1e-3||Math.abs(sim.players[me].y-rr.shooterY)>1e-3)meScorer=false;
    Object.assign(shotIn,{bx,by,bz,sx:V.liveWorldX(v,rr.shooterX,rr.shooterY),sz:V.liveWorldZ(v,rr.shooterX,rr.shooterY),gx:goal.x,gz:goal.z,ax,az,goalWidth:v.goalWidth,goalHeight:v.goalHeight,ground:g});
    const want=rr.age>.5&&(rr.shotT>=0&&rr.playhead>=rr.shotT||rr.dur-rr.age<1.1)?1:0;tight=first?0:tight+(want-tight)*Math.min(1,real*2.2);
    for(const a of ASPECTS){CAM.replayCamFrame(shotIn,a,tight,tgt);for(const P of [[bx,by,bz],...corners]){const [px,py]=proj(tgt,a,...P);worst=Math.max(worst,Math.abs(px),Math.abs(py));}
     const d=Math.hypot(tgt.ex-tgt.lx,tgt.ey-tgt.ly,tgt.ez-tgt.lz);dMin=Math.min(dMin,d);dMax=Math.max(dMax,d);}
    // the eased camera on the portrait phone (the runtime's follow: cut on the first frame, then 1 − e^(−3.2 dt))
    CAM.replayCamFrame(shotIn,ASPECTS[0],tight,tgt);const kk=first?1:1-Math.exp(-real*3.2);first=false;
    for(const [a,b] of [['x','ex'],['y','ey'],['z','ez']])eye[a]+=(tgt[b]-eye[a])*kk;for(const c of ['lx','ly','lz'])eye[c]+=(tgt[c]-eye[c])*kk;
    const ef={ex:eye.x,ey:eye.y,ez:eye.z,lx:eye.lx,ly:eye.ly,lz:eye.lz},[ex2,ey2]=proj(ef,ASPECTS[0],bx,by,bz);worstEase=Math.max(worstEase,Math.abs(ex2),Math.abs(ey2));endFrame=ef;
    rr.restore(sim);}
   assert(meScorer,f+': the ringed shooter is me (the replayed position)');
   assert(worst<=.95,f+': every target frame holds the ball and the whole goal mouth (worst |ndc| '+worst.toFixed(2)+')');
   assert(worstEase<=1,f+': the eased portrait camera keeps the ball on screen (worst |ndc| '+worstEase.toFixed(2)+')');
   const endWorst=Math.max(...corners.map(P=>Math.max(...proj(endFrame,ASPECTS[0],...P).map(Math.abs))));assert(endWorst<=1,f+': it ends with the goal mouth in frame (portrait, '+endWorst.toFixed(2)+')');
   assert(dMin>=10&&dMax<=75,f+': a sane eye distance ('+dMin.toFixed(0)+'–'+dMax.toFixed(0)+' m)');
   camRows.push(f+' '+worst.toFixed(2)+'/'+worstEase.toFixed(2)+' '+dMin.toFixed(0)+'–'+dMax.toFixed(0)+'m');}
  console.log('  replay camera (worst target |ndc| / eased portrait, eye distance): '+camRows.join(', '));}
}
console.log('PASS join-live-game (goal replays): ring fills, a goal replays on all 5 formats (solo holds, shared runs on and fits the reset), Skip, score + live state + quick reset untouched, setting off');

// Phone pass (Nov 5 2026): the trick pop sits outside the HUD stack, so its --tip-top is measured from its own offsetParent (it landed on the score bar)
assert.match(fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),/pe\?\.style\.setProperty\('--tip-top',Math\.round\(wr\.bottom-\(pe\.offsetParent\?\.getBoundingClientRect\(\)\.top\?\?0\)\+14\)\+'px'\)/,'the pop sits under the score bar');

// ---- Easier controls (owner Nov 5 2026: kids first; lib/town/liveControls.ts): contextual buttons, the big defence button,
// push the stick to sprint, tap to shoot. Auto-switching players on defence was REJECTED: your slot is always you. ----
{const LC=load('lib/town/liveControls.ts'),W=load('lib/town/walkControl.ts'),{AIM_MARKS,SHOT_AIM,TACKLE_ASSIST:TA,TACKLE}=H,NET=load('lib/town/match/matchNet.ts');
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),g=fs.readFileSync('app/globals.css','utf8'),town=fs.readFileSync('components/Town.tsx','utf8'),set=fs.readFileSync('components/IslandSettings.tsx','utf8');
 const FORMATS=['7v7','futsal','9v9','11v11','beach'],out={a:'',b:'',c:''};
 const M=(possession,o={})=>{const r=LC.joinModes({possession,keeper:false,hands:false,restart:false,onBall:possession==='mine',...o},o.inRange??true,o.near??false,out);return [r.a,r.b,r.c].join('|');};
 // A. button visibility per state (the same rules in every format; checked against each format's own tackle reach below)
 assert.equal(M('mine'),'pass|shoot|trick','on the ball in range: Pass + Shoot + the small Trick');
 assert.equal(M('mine',{inRange:false}),'pass|forward|trick','out of range: the second button is Forward (the through ball), never a hopeless Shoot');
 assert.equal(M('opp',{near:true}),'tackle|stay|','defending, in reach: ONE big Tackle (+ the small Stay)');
 assert.equal(M('opp',{near:false}),'press|stay|','defending, further: the same big button is Press');
 assert.equal(M('team'),'call||','a teammate has it: Call only (no tackle button)');assert.equal(M('loose'),'go||','loose: Go!');
 assert.equal(M('opp',{restart:true}),'||','a restart: nothing');
 assert.equal(M('mine',{keeper:true,hands:true}),'throw|kick|','keeper in his hands: Throw + Kick, no trick');assert.equal(M('mine',{keeper:true}),'pass|kick|');
 assert.equal(M('opp',{keeper:true,near:true}),'save||','keeper defending: Save only (never a lunge out of goal)');assert.equal(M('team',{keeper:true}),'call||');
 for(const p of ['mine','team','opp','loose'])for(const k of [false,true])for(const r of [false,true])assert(M(p,{keeper:k,inRange:r,near:r}).split('|').filter(Boolean).length<=3,'at most three buttons at once (+ Sprint only with the setting off)');
 // Tackle / Press by distance, with hysteresis; Tackle shows wherever an in-reach tackle is possible
 assert.equal(LC.tackleNear(false,TA.assistR-.1),true);assert.equal(LC.tackleNear(false,TA.assistR+.1),false);assert.equal(LC.tackleNear(true,TA.assistR*1.1),true,'hysteresis: no flicker at the edge');
 assert.equal(LC.tackleNear(true,TA.assistR*1.2),false);assert.equal(LC.tackleNear(true,NaN),false,'nobody on the ball: not near');
 assert((4.2+A.PASS_ASSIST.tackleReach)*TACKLE.reachMul<LC.TACKLE_NEAR.on,'the tackle reach is inside the Tackle label zone');
 // the big button in the sim, every format: in reach → the assisted lunge; far → the press together + you run at him (held), tackling once in reach
 {const outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK),rows=[];
  const setup=(F,seed,oy)=>{const sim=new MatchSim(seed,F);for(let i=0;i<30;i++)sim.step(DT);const me=outf(sim,'gold')[1],c=outf(sim,'blue')[1];sim.lockHuman(me);
   outf(sim,'gold').forEach((id,i)=>{if(id!==me)sim.placePlayer(id,20+i*30,30);});outf(sim,'blue').forEach((id,i)=>{if(id!==c)sim.placePlayer(id,20+i*30,60);});
   sim.restart=null;sim.windup=null;sim.placePlayer(c,135,200);Object.assign(sim.ball,{owner:c,target:null,intBy:null,x:135,y:200,vx:0,vy:0,height:0});sim.possession='blue';sim.protect=0;sim.passCd=3;sim.placePlayer(me,135,200+oy);return {sim,me,c,hu:sim.humans.get(me)};};
  // the runtime's frame for the big button held from frame 0 (stick idle: steered at the carrier while chasing)
  const hold=(F,seed,oy)=>{const {sim,me,c,hu}=setup(F,seed,oy);let near=false,chase=false,tackled=-1,pressed=false,lunged=false;
   for(let i=0;i<90;i++){const p=sim.players[me],o=sim.players[c];if(sim.ball.owner!==c)break;const d=Math.hypot(o.x-p.x,o.y-p.y);near=LC.tackleNear(near,d);
    const mode=LC.joinModes({possession:'opp',keeper:false,hands:false,restart:false,onBall:false},true,near,out).a,down=i===0;
    const pressTap=down&&mode==='press';if(pressTap)chase=true;const chaseTackle=chase&&near;if(chaseTackle){chase=false;tackled=i;}
    const mx=chase?(o.x-p.x)/d:0,my=chase?(o.y-p.y)/d:0;sim.humanInput(me,{mx,my,tackle:down&&mode==='tackle'||chaseTackle,press:pressTap,sprint:chase});sim.step(DT);if(hu.pressT>0)pressed=true;if(hu.lunge>0)lunged=true;}
   return {won:sim.ball.owner===me||!!sim.ball.owner&&sim.players[sim.ball.owner].team==='gold',pressed,tackled,lunge:lunged};};
  for(const F of FORMATS){let far=0,near=0,pressN=0;const N=8;
   for(let k=0;k<N;k++){const a=hold(F,900+k,60);far+=a.won||a.tackled>=0;pressN+=a.pressed;const b=hold(F,900+k,16);near+=b.won||b.lunge;}
   assert.equal(pressN,N,F+': far: the big button is Press (the press together starts)');assert(far>=N*.75,F+': …and held he runs at the carrier and tackles in reach ('+far+'/'+N+')');
   assert(near>=N*.75,F+': in reach: Tackle (the assisted lunge / the win) ('+near+'/'+N+')');rows.push(F+' far '+far+'/'+N+' near '+near+'/'+N);}
  console.log('  big defence button (press+chase / tackle): '+rows.join(', '));}
 // B. push the stick to sprint: thresholds, hysteresis, normal running never sprints, full run pace before the ring
 {let on=false;for(let r=0;r<=.85;r+=.01){on=LC.stickSprint(on,r);assert.equal(on,false,'running up to 0.85 never sprints ('+r.toFixed(2)+')');}
  on=LC.stickSprint(on,1);assert.equal(on,true,'the knob on the ring sprints');assert.equal(LC.stickSprint(true,.9),true,'hysteresis');assert.equal(LC.stickSprint(true,.87),false);
  assert.equal(LC.stickSprint(false,.94),false);assert.equal(LC.stickSprint(true,0),false,'released: off');
  let flips=0,prev=false;for(let i=0;i<600;i++){const r=.95+.025*Math.sin(i*1.7);const n=LC.stickSprint(prev,r);if(n!==prev)flips++;prev=n;}assert(flips<=1,'a thumb trembling on the rim does not flicker ('+flips+')');
  const sh=r=>{const o={x:0,z:0};W.shapeStick(r,0,o);return Math.hypot(o.x,o.z);};
  assert(Math.abs(LC.runEffort(sh(.85))-1)<1e-9,'the full run pace by 0.85');assert.equal(LC.runEffort(sh(1)),1,'capped');assert(LC.runEffort(sh(.5))<.8,'a half push is still a jog');
  assert.equal(LC.stickSprintEnabled(),true,'default on');LC.setStickSprintEnabled(false);assert.equal(LC.stickSprintEnabled(),false,'off');LC.setStickSprintEnabled(true);
  assert.match(rt,/const edgeOn=stickSprintEnabled\(\)&&stickRaw>0;edgeSprint=edgeOn&&stickSprint\(edgeSprint,stickRaw\);/,'touch stick only (keys keep Shift)');
  assert.match(rt,/sprint:sprint\|\|held\.s\|\|held\.a&&mode\.a==='go'\|\|edgeSprint\|\|chase,/,'Shift / Sprint button still work');
  assert.match(rt,/hide\(el\('\[data-join-s\]'\),stickSprintEnabled\(\)\)/,'setting on: no Sprint button; off: today\'s layout');
  assert.match(rt,/set\(el\('\.touch-controls \.joystick'\),'data-sprint',edgeSprint\?'':null\)/,'the ring visual, written on change only');
  assert.match(g,/\.joystick\[data-sprint\]::after\{opacity:\.95;transform:scale\(1\)\}/);assert(!/\.joystick::after\{[^}]*(box-shadow|filter|animation)/.test(g),'transform + opacity only, no glow');
  assert.match(town,/stickRaw\.current=Math\.hypot\(v\.x,v\.y\)/);assert.match(town,/liveJoin\.steer\(ix,iz,keys,keys\.has\('shift'\),stickRaw\.current\)/);
  assert.match(set,/aria-label="Push stick to sprint" aria-pressed=\{stickSprint\}/,'Island settings → Live matches');
  assert.match(fs.readFileSync('lib/saves/snapshot.ts','utf8'),/'fi2-stick-sprint-v1'/,'a device preference');assert.match(fs.readFileSync('docs/accounts-design.md','utf8'),/`fi2-stick-sprint-v1`/);
  // pace unchanged: the boost is the same sprint (SPRINT_BOOST); the stick only decides when (pose limit 9.34 m/s checked by the pace tests above)
  assert.equal(H.SPRINT_BOOST,1.42);}
 // C. tap to shoot: the low corner away from the keeper; hold keeps the charge + aim + slow motion
 assert.equal(LC.tapShotCorner(150,140),2,'keeper on the right: low left');assert.equal(LC.tapShotCorner(120,128),3,'keeper on the left: low right');
 assert.equal(LC.tapShotCorner(150,135),2,'keeper central: the far post from a shooter on the right');assert.equal(LC.tapShotCorner(120,NaN),3,'no keeper: the far post');
 assert.equal(AIM_MARKS[2].h,0);assert.equal(AIM_MARKS[3].h,0);assert.equal(SHOT_AIM.minHoldMs,180,'tap = released before 0.18 s');
 {const outf=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK),rows=[];
  for(const F of FORMATS){const sim=new MatchSim(333,F),tx={};for(let i=0;i<40;i++)sim.step(DT);const me=outf(sim,'gold')[2],gk=sim.ids.find(id=>sim.players[id].team==='blue'&&sim.players[id].isGK);sim.lockHuman(me);
   for(const kx of [141,129]){sim.restart=null;sim.windup=null;sim.placePlayer(me,150,95);sim.placePlayer(gk,kx,12);Object.assign(sim.ball,{owner:me,target:null,intBy:null,x:150,y:95,vx:0,vy:0,height:0});sim.possession='gold';sim.protect=0;sim.passCd=1;
    // Nov 7 2026: the HUD tap sends NO aim mark (NaN): the sim's own auto-aim picks the far corner away from the keeper.
    sim.humanInput(me,{mx:0,my:-1,shoot:true,shootPower:.76,aimX:NaN,aimH:NaN});sim.step(DT);
    const x=sim.lastKick.aimX;assert(Math.abs(x-135)<=19+.01,F+': inside the posts');assert.equal(sim.humans.get(me).shotAimed,false,F+': not an aimed shot (no keeper reach bonus)');tx[kx]=x;rows.push(F+' '+x.toFixed(0));}
   assert(tx[141]<tx[129],F+': the auto-aim leans away from the keeper ('+tx[141].toFixed(1)+' vs '+tx[129].toFixed(1)+')');}
  console.log('  tap shot x (keeper right / left): '+rows.join(', '));}
 assert.match(rt,/const aimMark=bUp&&mb==='shoot'&&bHoldMs>=SHOT_AIM\.minHoldMs&&aimSel>=0\?AIM_MARKS\[aimSel\]:null;/,'a hold keeps the picked corner; a tap sends no mark (the sim\'s far-corner auto-aim)');assert(!/tapShotCorner\(/.test(rt),'the HUD no longer turns a tap into an aim mark');
 assert.match(rt,/aiming=mb==='shoot'&&bHoldMs>=SHOT_AIM\.minHoldMs/,'the hold still shows the marks + aim');assert.match(rt,/bMode=modes\(\)\.b/,'Shoot latched at the press (the label may settle meanwhile)');
 // multiplayer: the tap's corner rides the frame's existing aim fields (no protocol change)
 {const a=NET.createInAccum(),o=[],f={};NET.accumulateIn(a,{mx:0,my:-1,shoot:true,shootPower:.72,aimX:-1,aimH:0});NET.encodeIn(a,7,o);assert.equal(o.length,11,'C.Match In unchanged: 11 values');NET.decodeIn(o,2,f);assert.equal(f.shoot,true);assert.equal(f.aimX,-1);assert.equal(f.aimH,0);}
 // layout: every state ≥ 44 px, inside the cluster, no overlap; the mirrored layout uses the same offsets from the left; room for the stick
 {const box=+css.match(/\.actions\{[^}]*width:(\d+)px/)[1],B=sel=>{const m=css.match(new RegExp(sel.replace(/[.[\]"=]/g,'\\$&')+'\\{--x:(\\d+)px;--y:(\\d+)px;width:(\\d+)px'));assert(m,sel);return {r:+m[1],b:+m[2],w:+m[3]};};
  const A0=B('.a'),Sh=B('.b'),St=B('.b[data-mode="stay"]'),Sp=B('.s'),Tr=B('.t');assert.equal(A0.w,88,'the big button');assert(Sh.w>Tr.w&&Tr.w>=44&&St.w>=44,'Shoot bigger than the small Trick / Stay');
  const states={ball:[A0,Sh,Tr],defence:[A0,St],keeper:[A0,Sh]};
  for(const [k,list] of Object.entries(states))for(const all of [list,[...list,Sp]]){for(const q of all){assert(q.w>=44);assert(q.r>=0&&q.b>=0&&q.r+q.w<=box&&q.b+q.w<=box,k+': inside the cluster');}
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],c=all[j],d=Math.hypot(a.r+a.w/2-c.r-c.w/2,a.b+a.w/2-c.b-c.w/2);assert(d>=(a.w+c.w)/2+8,k+': ≥ 8 px apart ('+i+','+j+': '+(d-(a.w+c.w)/2).toFixed(0)+')');}}
  const ang=q=>{const d=Math.atan2(q.b+q.w/2-44,-(q.r+q.w/2-44))*180/Math.PI;return d<0?d+360:d;},steps=[ang(Tr),ang(Sh),ang(Sp)];assert(Math.abs((steps[0]-steps[1])-(steps[1]-steps[2]))<3,'evenly spaced on the arc ('+steps.map(a=>a.toFixed(0)).join('°, ')+'°)');
  for(const vw of [360,375,390]){const stick=22+Math.min(160,Math.max(110,vw-242)),left=vw-14-Math.max(...[Sh,Tr,St].map(q=>q.r+q.w));assert(left-stick>=24,vw+' px: room between the stick\'s rest ring and the buttons ('+(left-stick)+' px, was 11)');}
  assert.match(css,/:global\(\.controls-flipped\) \.actions>\*\{right:auto;left:var\(--x\)\}/,'flip controls: mirrored offsets');assert.match(g,/\.town-app\.controls-flipped \[data-join-actions\]\{right:auto;left:calc\(14px \+ env\(safe-area-inset-left,0px\)\)\}/,'mirrored cluster, same edge gap');
  assert(!/data-join-f/.test(hud),'no separate Forward button (it is the second button out of range)');assert(!/\{[^}]*IslandBrush/.test(css),'regular sans on the buttons');}
 // AI-only matches unchanged
 {const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged');}
 console.log('PASS join-live-game (easier controls): buttons per state (ball / defence / keeper / restart), Tackle vs Press by distance on all 5 formats, push-stick sprint + setting, tap shot away from the keeper on all 5, mirrored layout, fixture unchanged');}

// ---- Kick effects (owner Nov 5 2026: "improve the tackling, passing, shooting … trails, effects … more premium"; docs/join-live-game-design.md "Kick effects") ----
{const SM=load('lib/town/slowMo.ts'),KF=load('lib/town/kickFx.ts'),BE=load('lib/graphics/ballEffects.ts'),V=load('lib/town/venues.ts'),FS=load('lib/town/matchFxSetting.ts'),LS=load('lib/town/liveBallSound.ts'),BL=load('lib/town/beanLooks.ts'),T=require('three');
 // 1. slow motion: eases in (no hard snap), holds at its scale, eases out and ends at EXACTLY 1; the shot freezes first
 const W=SM.SLOW_MO;
 for(const [name,scale,hold,out,freeze] of [['trick',.3,.55,.18,0],['shot',H.SHOT_FX.scale,H.SHOT_FX.hold,W.out,W.freeze]]){
  let prev=SM.slowMoScale(0,scale,hold,out,freeze),jump=0;assert.equal(prev,freeze?0:1,name+': starts at 1 (a shot: the contact freeze)');
  for(let t=1/60;t<hold+out+.2;t+=1/60){const v=SM.slowMoScale(t,scale,hold,out,freeze);if(t>freeze+1e-9)jump=Math.max(jump,Math.abs(v-prev));prev=v;assert(v>=0&&v<=1);}
  assert(jump<.2,name+': no hard snap (largest 60 fps step '+jump.toFixed(3)+', the old snap was '+(1-scale).toFixed(2)+')');
  assert(Math.abs(SM.slowMoScale(freeze+W.in+.01,scale,hold,out,freeze)-scale)<1e-9,name+': holds at its scale');
  assert.equal(SM.slowMoScale(hold+out,scale,hold,out,freeze),1,name+': exactly 1 when over');assert.equal(SM.slowMoScale(hold+out+5,scale,hold,out,freeze),1);assert.equal(SM.slowMoDone(hold+out,hold,out),true);}
 assert.equal(SM.slowMoScale(W.freeze*.5,.3,1.2,W.out,W.freeze),0,'the shot\'s 1-2 frame freeze at contact');assert(W.freeze<=.04&&W.in>=.1&&W.in<=.14&&W.out>=.16&&W.out<=.2,'~120 ms in, ~180 ms out');
 assert.equal(SM.punchWeight(-1),0);assert.equal(SM.punchWeight(W.punchIn+W.punchOut),0);assert(SM.punchWeight(W.punchIn)>.99,'the hard-shot camera punch');
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8');
 assert.match(rt,/timeScale=slowMoScale\(fxAge,fx\.scale,fx\.hold,fx\.ease\)/,'the trick uses the eased curve');assert.match(rt,/slowMoScale\(shotAge,SHOT_FX\.scale,SHOT_FX\.hold,SLOW_MO\.out,SLOW_MO\.freeze\)/,'the shot too');
 assert.match(rt,/get timeScale\(\)\{return format&&games\.shared\(format\)\?1:sideways\?\.matches&&state\.phase==='joined'\?0:timeScale;\}/,'a shared match never slows (friends\' sims keep real time)');
 assert.match(rt,/const fxOn=state\.phase==='joined'&&!reduced;if\(!fxOn\)\{pauseT=shakeT=0;punchAge=-1;\}/,'reduced motion: no hit pause, shake or punch');
 assert.deepEqual({...H.TACKLE_ASSIST},{assistR:24,lunge:1.2,lungePace:1.3,front:.95,chanceAway:.75,behindCos:-.45,recover:.15,pokeSpeed:48,back:2.5,backChance:.97,pickup:3.5,magnetR:20,magnetCos:.55,idleR:9},'TACKLE_ASSIST unchanged (tuned)');
 // 2. every format: kicks, passes, receptions, tackles (AI, and a human's clean win + poke-away) and goals spawn their effects;
 //    reduced motion and Light trim them; the trail takes the kicker's colour (purple lofted); the ring pool never grows.
 const lift=(f,home)=>'#'+new T.Color(BL.bibColour(f,home)).lerp(new T.Color('#fff7df'),.32).getHexString();
 const run=(f,reduced,level)=>{FS.setMatchFxLevel(level);const venue=V.LIVE_VENUES.find(v=>v.id===f),sim=new MatchSim(271,f),be=BE.createBallEffects(),fx=KF.createKickFx(new T.Group(),venue,be),ball=new T.Vector3(),at=(id,o)=>{const p=sim.players[id];if(!p)return false;o.set(p.x/10,0,p.y/10);return true;};
  let colours={team:0,purple:0,wrong:0},ribbon=0,ghosts=0;
  for(let i=0;i<60*75;i++){sim.step(1/60*.32);fx.consume(sim,true,reduced);ball.set(sim.ball.x/10,.3+(sim.ball.height??0),sim.ball.y/10);const flying=!sim.ball.owner&&Math.hypot(sim.ball.vx,sim.ball.vy)>2;
   if(flying&&!sim.shotActive){const c=fx.colour(sim,false,false);if(sim.ball.lofted)c==='#b877ff'?colours.purple++:colours.wrong++;else if(c===lift(f,true)||c===lift(f,false))colours.team++;else colours.wrong++;}
   fx.draw(sim,ball,1/60,flying,at);if(flying){ribbon=Math.max(ribbon,be.shape.ribbon);ghosts=Math.max(ghosts,be.shape.ghosts);}
   assert(fx.rings.mesh.count<=12);}
  FS.setMatchFxLevel('full');return {sim,fx,colours,ribbon,ghosts};};
 const sum=[];
 for(const f of ['7v7','futsal','9v9','11v11','beach']){
  const full=run(f,false,'full'),calm=run(f,true,'full'),light=run(f,false,'light'),s=full.fx.stats;
  assert(s.kicks>0&&s.flares>0&&s.receives>0,f+': kicks flare, receptions ring ('+JSON.stringify(s)+')');
  assert(full.fx.rings.stats.spawned>calm.fx.rings.stats.spawned&&calm.fx.stats.flares===0&&light.fx.stats.flares===0,f+': reduced motion and Light drop the kick flares');
  assert(full.ribbon>0&&full.ghosts>0&&light.ribbon===0&&light.ghosts===0,f+': Full = a power-scaled ribbon + ghosts; Light = the thin line');
  assert(full.colours.team>0&&full.colours.wrong===0,f+': ground balls in the kicker\'s team colour, lofted ones purple ('+JSON.stringify(full.colours)+')');
  assert(full.fx.rings.mesh.instanceMatrix.count===12&&full.fx.rings.stats.maxLive<=12,f+': a fixed pool of 12 rings (one draw call)');
  // a human's tackle: the clean win (impact + dust) and the poke-away (a small ring at the ball), and the HUD serials
  const {sim,fx}=full,me=sim.ids.find(id=>sim.players[id].team==='gold'&&!sim.players[id].isGK),opp=sim.ids.find(id=>sim.players[id].team==='blue'&&!sim.players[id].isGK);
  const ring=(kind,id,other)=>{const e=sim.touches[sim.touchSerial%8];sim.touchSerial++;Object.assign(e,{serial:sim.touchSerial,kind,id,other,team:sim.players[id].team,height:0,speed:30,heavy:false,time:sim.stats.time});};
  const n0=fx.rings.stats.spawned,t0=fx.view.tackleSerial;sim.ball.owner=me;ring('tackle',me,opp);fx.consume(sim,true,false);fx.draw(sim,new T.Vector3(),1/60,false,(id,o)=>{o.set(1,0,1);return true;});
  assert.equal(fx.view.tackleSerial,t0+1);assert.equal(fx.view.tackleClean,true);assert.equal(fx.view.tackleFrom,opp);assert.equal(fx.rings.stats.spawned,n0+2,f+': a clean win = impact + dust');
  sim.ball.owner=null;ring('tackle',me,opp);fx.consume(sim,true,false);fx.draw(sim,new T.Vector3(),1/60,false,null);assert.equal(fx.view.tackleClean,false,f+': poke-away');assert.equal(fx.rings.stats.spawned,n0+3,f+': a poke = one sharp ring');
  let net=0;fx.netHit=()=>{net++;};ring('goal',me,null);fx.consume(sim,true,false);fx.draw(sim,new T.Vector3(),1/60,false,null);assert.equal(net,1,f+': a goal billows the net');
  // not drawn (off screen): consumed, nothing queued, nothing late
  const n1=fx.rings.stats.spawned;ring('kick',me,null);fx.consume(sim,false,false);fx.consume(sim,true,false);fx.draw(sim,new T.Vector3(),1/60,true,null);assert.equal(fx.rings.stats.spawned,n1,f+': an off-screen kick never flares late');
  sum.push(f+' '+s.kicks+'k/'+s.receives+'r/'+s.tackles+'t/'+s.flares+'f');}
 // 3. sounds: layered one-shots on the same touch ring (kick thump by power / pass tick, tackle thud vs poke, net swish + crowd)
 {const sim=new MatchSim(271,'9v9'),snd=LS.createLiveBallSound({width:60,length:90},.32),heard={};snd.update(sim,0,null);
  for(let i=0;i<60*60;i++){sim.step(1/60*.32);snd.update(sim,0,(k,g)=>{assert(g>0&&g<=1,'modest gains');heard[k]=(heard[k]||0)+1;});}
  assert(heard.kick>0&&(heard.tick>0||heard.thump>0),'kicks layer a tick / thump ('+JSON.stringify(heard)+')');
  assert(heard.thud||heard.poke||heard.kick,'tackles thud / poke');assert.match(fs.readFileSync('lib/town/liveBallSound.ts','utf8'),/const layered=!\(globalThis as \{__fi2FxOff\?:boolean\}\)\.__fi2FxOff;/,'the heat-run off switch drops the layers');
  const isl=fs.readFileSync('lib/audio/islandSound.ts','utf8');for(const k of ['thump','tick','thud','poke','swish','crowd','slow'])assert.match(isl,new RegExp("case '"+k+"':"),'islandSound.match '+k);}
 // 4. the setting: Island settings → Live matches → Match effects (Full default / Light), a device key
 assert.equal(FS.matchFxLevel(),'full','Full by default');
 assert.match(fs.readFileSync('lib/saves/snapshot.ts','utf8'),/'fi2-match-fx-v1'/,'a device preference');assert.match(fs.readFileSync('docs/accounts-design.md','utf8'),/fi2-match-fx-v1/);
 assert.match(fs.readFileSync('components/IslandSettings.tsx','utf8'),/data-match-fx/,'the Match effects toggle');
 const css=fs.readFileSync('components/LiveJoinHud.module.css','utf8');assert.match(css,/\.vignette\{[^}]*pointer-events:none;opacity:0;/,'the slow-motion vignette: a CSS opacity overlay');
 console.log('PASS join-live-game (kick effects): eased slow motion back to exactly 1, shot freeze, effects per kick / pass / tackle / goal on all 5 ('+sum.join(', ')+'), reduced + Light trims, team-coloured trails, fixed ring pool, layered sounds, setting');}

// ---- Match focus (owner, Nov 5 2026: "pause everything else on the island while playing the game to not draw additional heat";
// lib/town/matchFocus.ts, docs/join-live-game-design.md "Match focus"): one flag from liveJoin.joined, set on join and cleared on every
// leave route in all 5 formats, held systems take dt 0 while joined and a clamped dt on resume, and Town's gates read it. ----
{const MF=load('lib/town/matchFocus.ts');
 const FORMATS=['7v7','futsal','9v9','11v11','beach'],on={onPitch:true,canOffer:true,canJoin:true,play:false,start:false,dismiss:false,leave:false};
 // the runtime's getter: joined = phase 'joined' with a slot (format set by the Start callback; a failed join resets the phase)
 const joinedOf=(s,format)=>s.phase==='joined'&&format!==null;
 const routes={button:s=>J.stepJoin(s,{...on,leave:true}),/* Leave */forced:s=>J.stepJoin(s,{...on,leave:true}),/* a lesson / menu / ride: Town passes forceLeave into the same signal */
  disconnect:s=>J.stepJoin(s,{...on,leave:true}),/* matchLink: the relay left me out → d.join.press('leave') */failed:s=>{s.phase='idle';return 'join-failed';}};
 const seen=[];
 for(const f of FORMATS)for(const [route,leave] of Object.entries(routes)){
  const focus=MF.createMatchFocus(true),s=J.createJoinState();let format=null;
  const frame=(dt=1/30)=>focus.step(joinedOf(s,format),format,dt);
  for(let i=0;i<30;i++){assert.equal(frame(),null);assert.equal(focus.active,false,f+': walking on the pitch is not a match');assert.equal(focus.dt,1/30,'the island runs at full dt');}
  J.stepJoin(s,{...on,play:true});for(let i=0;i<10;i++)assert.equal(frame(),null,f+': the picker is not joined');
  assert.equal(J.stepJoin(s,{...on,start:true}),'join');assert.equal(frame(),null,f+': not joined until the slot is taken (the shrink callback)');
  format=f;assert.equal(frame(),'enter',f+': focus on the first frame joined');assert.equal(focus.active,true);assert.equal(focus.stats.format,f);
  for(let i=0;i<90;i++){assert.equal(frame(1/15),null);assert.equal(focus.dt,0,f+': held systems take dt 0 while joined');}
  assert.equal(focus.stats.heldFrames,91);
  leave(s);if(route!=='failed')format=null;
  assert.equal(frame(1/15),'exit',f+' '+route+': focus clears the frame after the leave');assert.equal(focus.active,false);
  assert.equal(focus.dt,MF.MATCH_FOCUS_RESUME_DT,f+': the resume frame is clamped (a long leave frame never becomes a catch-up step)');
  for(let i=1;i<MF.MATCH_FOCUS_RESUME_FRAMES;i++){frame(1/15);assert.equal(focus.dt,MF.MATCH_FOCUS_RESUME_DT,'clamped for the first resume frames');}
  frame(1/15);assert.equal(focus.dt,1/15,'then the island takes its real dt again (Town already caps it at FRAME_DT_MAX)');
  frame(1/60);assert.equal(focus.dt,1/60,'a short frame is never stretched');
  assert.equal(focus.stats.enters,1);assert.equal(focus.stats.exits,1);seen.push(f+'/'+route);}
 // a dt under the clamp on resume passes through untouched; ?matchfocus=0 never holds anything; nothing allocates in step()
 {const focus=MF.createMatchFocus(true);focus.step(true,'7v7',1/30);focus.step(false,null,1/60);assert.equal(focus.dt,1/60);}
 {const focus=MF.createMatchFocus(false);for(let i=0;i<10;i++){assert.equal(focus.step(true,'9v9',1/30),null);assert.equal(focus.active,false);assert.equal(focus.dt,1/30,'?matchfocus=0: A/B off');}}
 const mfSrc=fs.readFileSync('lib/town/matchFocus.ts','utf8'),stepSrc=mfSrc.slice(mfSrc.indexOf('step(joined'),mfSrc.indexOf('return ev;'));
 assert(!/new |\[\]|\{\s*[a-z]+:/.test(stepSrc),'step() allocates nothing');
 assert.deepEqual({...MF.MATCH_FOCUS_LIVE},{games:true,traffic:false,volleyball:false,coaches:false},'only the matches stay live (the joined one; the others are dormant off screen)');
 // Town wiring: one flag from liveJoin.joined, decided before the held systems, read by each of them; restored by the same flag
 const town=fs.readFileSync('components/Town.tsx','utf8'),order=k=>{const i=town.indexOf(k);assert(i>0,'Town: '+k);return i;};
 assert.match(town,/matchFocus\.step\(liveJoin\.joined,liveJoin\.format,active\?dt:0\)/,'the flag comes from liveJoin.joined only (every leave route clears it)');
 assert(order('matchFocus.step(')<order('coinHunt.update(heldDt'),'decided before the first held system');
 assert.match(town,/const backgroundFrozen=focus\.active\|\|matchFocus\.active,live=matchFocus\.active\?MATCH_FOCUS_LIVE:focusLive,heldDt=matchFocus\.dt;/,'the fishing focus gates, reused');
 assert.match(town,/if\(mf==='enter'\)\{MATCH_HOLD\.x=location\.x;MATCH_HOLD\.z=location\.z;islandNpcs\.setFocus\(MATCH_HOLD\);\}else if\(mf==='exit'&&!focus\.active\)islandNpcs\.setFocus\(null\);/,'townsfolk held on enter, released on exit');
 assert.match(town,/const MATCH_HOLD=\{x:0,z:0,r:-1,still:true\};/,'everyone held, still (one pass, then the update returns)');
 for(const [name,re] of [['traffic',/if\(streetTraffic\.root\.visible&&\(!backgroundFrozen\|\|live\.traffic\)\)streetTraffic\.update\(active\?heldDt:0,/],['townsfolk',/islandNpcs\.update\(active\?heldDt:0,/],
  ['ball hunt (coins never count in a match)',/coinHunt\.update\(heldDt,[^;]*active&&!fieldMenu\.current&&!lessonRef\.current&&!matchFocus\.active/],['coaches',/if\(!backgroundFrozen\|\|live\.coaches\)coachPractice\.update\(active\?heldDt:0,/],
  ['volleyball',/if\(!backgroundFrozen\|\|live\.volleyball\)volleyballGame\.update\(active\?heldDt:0,/],['ferry',/world\.updateFerry\(active&&!learning&&!backgroundFrozen\?heldDt:0,/],['lighthouse',/world\.updateLighthouse\(active&&!learning&&!backgroundFrozen\?heldDt:0,/],
  ['sharks + mantas',/world\.updateSharks\(active&&!learning\?heldDt:0,/],['whales + rays',/openSea\.update\(active&&!learning\?heldDt:0,/],['bugs',/wildBugs\.update\(\{dt:active&&!backgroundFrozen\?heldDt:0,/],
  ['fruit trees + beach finds',/frozen:backgroundFrozen,[\s\S]*const beachWant=beach\.update\(\{[^\n]*frozen:backgroundFrozen,/],['the matches stay live',/if\(!backgroundFrozen\|\|live\.games\)games\.update\(/]])assert.match(town,re,'match focus holds / keeps: '+name);
 // kept: shadows every frame (the players move), the pixel ratio, the water clock, the party / matchLink, the arrival
 assert(!/matchFocus[^\n]{0,80}heat\.setFocus|heat\.setFocus\([^)]*matchFocus/.test(town),'no half-rate shadows for a match (heat.setFocus is the fishing focus only)');
 assert(!/matchFocus[^\n]{0,120}setPixelRatio/.test(town),'the pitch keeps its pixel ratio');
 assert.match(town,/world\.updateWater\(active&&!learning\?dt:0,/,'the water keeps its clock');assert.match(town,/party\?\.update\(active\?dt:0,/,'presence / friends keep updating');assert.match(town,/matchLink\?\.update\(\);/);
 const npcs=fs.readFileSync('lib/graphics/islandNpcs.ts','utf8');
 assert.match(npcs,/if\(focusAt&&focusAt\.still&&focusAt\.r<0\)\{if\(stillPasses>0\)\{stats\.moving=0;return;\}stillPasses\+\+;\}/,'still focus: one held pass, then the townsfolk update returns at once');
 assert.match(npcs,/setFocus\(f:\{x:number;z:number;r:number;still\?:boolean\}\|null\)\{focusAt=f;stillPasses=0;\}/,'a new focus (or none) re-arms the pass');
 assert.match(fs.readFileSync('lib/multiplayer/matchLink.ts','utf8'),/d\.join\.press\('leave', true\)/,'a friend-match drop leaves through the same Leave signal');
 console.log('PASS join-live-game (match focus): set on join / cleared on Leave, forced leave, disconnect and a failed join in all 5 formats ('+seen.length+' runs), dt 0 while joined, clamped resume dt, ?matchfocus=0 A/B, Town gates (townsfolk, traffic, coins, groups, ferry, lighthouse, sea life, bugs, fruit, finds), shadows / pixel ratio / water / presence kept');}

// ---- Bot fill + teammates call for the ball (owner Nov 5 2026; docs/join-live-game-design.md "Bot fill + teammates call") ----
// Solo start in all 5 formats (the AI fills every other slot), a slot handed over and back with and without the ball (no teleport,
// role + spot + ball kept), leave / re-join, the picker's Bot notes, AI teammates calling for a human carrier (onside, open lane,
// space; never in AI-only matches), the arm-up pose + head ping hooks, the assist preferring a caller on a near tie, a human's pass
// led for its real pace and received (the keep-out), and the AI-only fixture unchanged.
{const SM=load('lib/town/match/matchSim.ts'),CH=load('lib/town/match/choreo.ts'),TC=R.TEAM_CALL,RDT=1/30,WS={futsal:.48,beach:.48,'7v7':.32,'9v9':.32,'11v11':.32};
 const FMTS=['7v7','futsal','9v9','11v11','beach'],line=[];
 const mk=(f,seed=77)=>{const s=new SM.MatchSim(seed,f);s.windupScale=WS[f];for(let i=0;i<30;i++)s.step(RDT*WS[f]);return s;};
 const mid=(s,team='gold')=>s.ids.find(id=>s.players[id].team===team&&s.players[id].role==='mid')||s.ids.find(id=>s.players[id].team===team&&!s.players[id].isGK);
 const give=(s,id)=>{const p=s.players[id];s.restart=null;s.goalHold=0;s.windup=null;Object.assign(s.ball,{owner:id,target:null,intBy:null,x:p.x,y:p.y,vx:0,vy:0,height:0,lofted:false});s.possession=p.team;};
 for(const f of FMTS){
  // solo: Start with zero friends -> one human, the AI holds every other slot, the match plays at once
  const s=mk(f),me=mid(s);assert(s.lockHuman(me),f+': solo join');assert.deepEqual({...s.humanOn},{gold:1,blue:0});
  assert.equal(s.ids.filter(id=>!s.humans.has(id)).length,s.ids.length-1,f+': the AI fills every other slot');
  const p0=s.stats.passes;let moved=0,bx=s.ball.x,by=s.ball.y;for(let i=0;i<600;i++){s.humanInput(me,{mx:0,my:0});s.step(RDT*WS[f]);moved+=Math.hypot(s.ball.x-bx,s.ball.y-by);bx=s.ball.x;by=s.ball.y;}
  assert(s.stats.passes>p0&&moved>200,f+': the bots play on round a solo human ('+(s.stats.passes-p0)+' passes)');
  // handover WITH the ball: the bot on the ball -> a human takes the slot (spot, role, home, ball kept), then back to a bot in place
  const h=mk(f,91),bot=mid(h);give(h,bot);const q=h.players[bot],at={x:q.x,y:q.y,role:q.role,hx:q.hx};
  assert(h.lockHuman(bot));assert.equal(h.ball.owner,bot,f+': the ball stays at his feet when a human takes the slot');assert.deepEqual({x:q.x,y:q.y,role:q.role,hx:q.hx},at,f+': no teleport, same role + shape spot');
  for(let i=0;i<20;i++){h.humanInput(bot,{mx:0,my:-1});h.step(RDT*WS[f]);}
  const had=h.ball.owner===bot,bx2=q.x,by2=q.y;J.handBack(h,bot,null);
  assert(!h.humans.has(bot)&&h.humanOn.gold===0,f+': the slot is a bot again');assert.equal(h.ball.owner===bot,had,f+': a friend leaving in place keeps the ball with the bot');assert.equal(q.x,bx2);assert.equal(q.y,by2);
  let jump=0,lx=q.x,ly=q.y;for(let i=0;i<90;i++){h.step(RDT*WS[f]);jump=Math.max(jump,Math.hypot(q.x-lx,q.y-ly));lx=q.x;ly=q.y;}
  assert(jump<12,f+': the bot plays on from that spot (largest step '+jump.toFixed(1)+' u)');
  // handover WITHOUT the ball + leave / re-join; my own exit (a bench spot) drops the ball on the grass and walks the NPC on
  const n=mk(f,93),ids=outfieldIds(n,'blue'),b2=ids[1],nq=n.players[b2],np={x:nq.x,y:nq.y};assert(n.lockHuman(b2));assert.deepEqual({x:nq.x,y:nq.y},np);
  J.handBack(n,b2,null);assert.deepEqual({x:nq.x,y:nq.y},np,f+': handed back in place');assert(n.lockHuman(b2)&&n.humanOn.blue===1,f+': re-join the same slot');
  give(n,b2);J.handBack(n,b2,{x:2,y:150});assert.equal(n.ball.owner,null,f+': my exit leaves the ball on the grass');assert.equal(nq.x,4);
  // the picker: bots and humans told apart
  const opts=J.slotOptions(s,'gold',new Map([[ids.length?outfieldIds(s,'gold').find(id=>id!==me):'',{name:'Ana',team:'gold'}]]),f);
  assert.equal(opts.find(o=>o.value===me).note,'Taken');assert(opts.some(o=>o.note==='Ana'&&o.disabled));
  assert(opts.filter(o=>o.note===J.SLOT_BOT_NOTE&&!o.disabled).length>=1,f+': free slots read Bot');
  // teammates call for the ball while the human has it
  const c=mk(f,95),cm=mid(c);c.lockHuman(cm);give(c,cm);let seen=0,maxW=0,firstAt=-1,bad=0,onFrames=0;const choreo=CH.createChoreo(),motion={};
  for(let i=0;i<240;i++){if(c.ball.owner!==cm)give(c,cm);c.humanInput(cm,{mx:0,my:0});c.step(RDT*WS[f]);choreo.consume(c,RDT);
   for(const id of c.teamCallers){const r=c.players[id];if(c.humans.has(id)||r.team!=='gold'||r.isGK)bad++;seen++;if(firstAt<0)firstAt=i;const w=c.callWeight(id);maxW=Math.max(maxW,w);if(w>0){choreo.apply(id,motion,0);if(motion.called>0)onFrames++;}}}
  assert(seen>0&&firstAt>=0&&firstAt*RDT<=1,f+': an open teammate calls within 1 s ('+(firstAt*RDT).toFixed(2)+' s)');assert.equal(bad,0,'only AI outfield teammates call');
  assert(maxW>0.99&&maxW<=1,f+': call weight reaches 1');assert(onFrames>0,f+': the caller raises an arm (choreo called pose)');
  assert(c.teamCallers.size<=TC.max);
  {const w=mk(f,95),wm=mid(w);w.lockHuman(wm);give(w,wm);w.teamCalls=false;for(let i=0;i<60;i++){give(w,wm);w.step(RDT*WS[f]);}assert.equal(w.teamCallers.size,0,'teamCalls off: nobody calls');}
  // an AI carrier (even with a human on the pitch) and an AI-only match never call
  {const a=mk(f,97);for(let i=0;i<900;i++){a.step(RDT*WS[f]);assert.equal(a.teamCallers.size,0);}const hm=mk(f,97),x=mid(hm,'blue');hm.lockHuman(x);for(let i=0;i<300;i++){if(hm.ball.owner!==x&&hm.teamCallers.size)throw new Error(f+': a call with no human carrier');hm.step(RDT*WS[f]);}}
  line.push(f+' first call '+(firstAt*RDT).toFixed(2)+'s');
 }
 // the assist: two mirror-image teammates, equally open; the caller wins the tie, and a much better option still beats a caller
 {const pl={me:{id:'me',team:'gold',isGK:false,x:135,y:250,vx:0,vy:0},a:{id:'a',team:'gold',isGK:false,x:95,y:200,vx:0,vy:0},b:{id:'b',team:'gold',isGK:false,x:175,y:200,vx:0,vy:0},f1:{id:'f1',team:'blue',isGK:false,x:135,y:120,vx:0,vy:0}};
  const ctx=(callers)=>({from:pl.me,aimX:0,aimY:0,dirY:-1,ids:['me','a','b','f1'],players:pl,mode:'short',offsideY:null,callers});
  assert.equal(A.pickPassTarget(ctx(new Set(['a']))),'a');assert.equal(A.pickPassTarget(ctx(new Set(['b']))),'b','a caller wins a near tie');
  pl.f1.x=97;pl.f1.y=203;assert.equal(A.pickPassTarget(ctx(new Set(['a']))),'b','…but never a marked caller over an open teammate');}
 // a human's pass to a runner is led for its real pace (a quicker ball needs less lead) and is taken, not run past him
 {const r={x:135,y:150,vx:60,vy:0},o1={x:0,y:0},o2={x:0,y:0};A.leadPoint(135,250,r,o1,0,1);A.leadPoint(135,250,r,o2,0,1.5);assert(o2.x<o1.x,'real pace: a shorter lead');
  for(const f of FMTS){let got=0;for(let k=0;k<6;k++){const s=mk(f,120+k),me=mid(s),mates=outfieldIds(s,'gold').filter(id=>id!==me),to=mates[k%mates.length];s.lockHuman(me);give(s,me);
   for(const id of s.ids){const p=s.players[id];if(p.team==='blue'&&!p.isGK){s.placePlayer(id,20+(id.length*13)%40,30);}}
   const p=s.players[me];s.placePlayer(to,p.x+(k%2?-34:34),p.y-24);for(let i=0;i<6;i++){give(s,me);s.step(RDT*WS[f]);}
   s.humanTargets.get(me).pass.id=to;s.humanInput(me,{mx:(s.players[to].x-p.x),my:(s.players[to].y-p.y),pass:true,passPower:.3});
   for(let i=0;i<60;i++){s.step(RDT*WS[f]);if(s.ball.owner&&s.ball.owner!==me)break;}if(s.ball.owner===to)got++;}
   assert(got>=5,f+': a short pass to an open teammate is received ('+got+'/6)');line.push(f+' short pass '+got+'/6');}}
 const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged');
 assert.match(fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),/leaveMatch\(format,humanId,netOut,true\)/,'a friend leaving hands the slot to the bot in place');
 console.log('PASS join-live-game (bot fill + calls): solo start + bots in all 5, handover with / without the ball (no teleport), leave / re-join, Bot notes, calls ('+line.join(', ')+'), assist tie to a caller, real-pace lead, fixture unchanged');}

// ---- Goalkeeper feel + body moves (owner Nov 5 2026; docs/join-live-game-design.md "Goalkeeper feel + body moves") ----
// Keeper in each format: the indicator data, a real dive (push-off, flight, stick side), catch / parry / tip, throw-out, the six-second
// hand-back. Body moves: Trick + stick direction picks the move, the nearest defender stumbles (a probability), the speed cap, the
// shield / shoulder / cut, a friend's screen sees it all (matchNet SNAP_BODY), the view plays it (liveBodyFx), mirrored controls.
{const SM=load('lib/town/match/matchSim.ts'),HK=SM.HUMAN_KEEPER,BF=load('lib/town/liveBodyFx.ts'),N=load('lib/town/match/matchNet.ts'),V=load('lib/town/venues.ts');
 const venue=F=>V.liveVenueById(F),line=[];
 for(const F of ['7v7','futsal','9v9','11v11','beach']){
  const tag=F+' keeper: ',fresh=()=>{const sim=new MatchSim(311,F);for(let i=0;i<60;i++)sim.step(DT);return sim;},ws=new MatchSim(1,F).windupScale,DTL=DT*ws;
  const gkOf=sim=>sim.ids.find(id=>sim.players[id].team==='gold'&&sim.players[id].isGK),foe=sim=>sim.ids.find(id=>sim.players[id].team==='blue'&&!sim.players[id].isGK);
  const shoot=(sim,fx,aimx,height=0,speed=330,fy=333)=>{const b=sim.ball,from=foe(sim);sim.placePlayer(from,fx,fy-3);sim.restart=null;sim.windup=null;sim.passRelease=null;
   Object.assign(b,{owner:null,target:null,intBy:null,x:fx,y:fy,height:0,lofted:false});const dx=aimx-b.x,dy=392-b.y,L=Math.hypot(dx,dy);b.vx=dx/L*speed;b.vy=dy/L*speed;
   Object.assign(sim,{ballIsShot:true,shotIsGoal:false,ballFlight:0,lastFrom:from,possession:'blue',saveRoll:.5});sim.lastKick.shotHeight=height;};
  const trial=(o)=>{const sim=fresh(),gk=gkOf(sim);assert(sim.lockHuman(gk),tag+'human keeper');sim.placePlayer(gk,o.gx??135,384);const before=sim.score.blue;
   for(let i=0;i<5;i++){sim.humanInput(gk,{mx:0,my:0});sim.step(DTL);}shoot(sim,o.fx??135,o.aim,o.h??0);const mv=BF.createMoveView();BF.fillMoveView(mv,sim,venue(F),gk,'gold',undefined);
   for(let i=0;i<150;i++){sim.humanInput(gk,{mx:o.mx??0,my:0,save:o.press!==undefined&&i===o.press});sim.step(DTL);if(sim.ball.owner===gk||sim.score.blue>before||!sim.ballIsShot)break;}
   const h=sim.humans.get(gk);return {sim,gk,mv,goal:sim.score.blue>before,caught:sim.ball.owner===gk,saved:h.saveSerial>0,kind:h.saveKind,big:h.saveBig,dives:h.diveSerial,side:h.diveSide};};
  // the indicator data (the ring / glove / goal-mouth glow / dive arc read it): a shot at my goal, catchable at my body, the threat, the reach
  {const t=trial({aim:135});assert(t.mv.shotIn&&t.mv.catchable&&t.mv.threat===1,tag+'a shot at his body: shotIn, catchable (the button says Catch), threat');
   assert(Number.isFinite(t.mv.ownGoalX)&&t.mv.reachM>1&&t.mv.goalWidth===venue(F).goalWidth,tag+'goal + reach for the markers');
   // catch: at his body, no press, the ball in his hands
   assert(t.caught&&t.saved&&t.kind===0&&!t.big&&t.sim.keeperHands,tag+'a shot at him is CAUGHT (kind 0, in his hands)');
   // throw-out with aim: stick at a teammate + Throw (a pass to a gold teammate); the six-second hand-back is unchanged
   const sim=t.sim,gk=t.gk;let real=0;for(let i=0;i<60&&sim.ball.owner===gk;i++){sim.humanInput(gk,{mx:0,my:-.4,pass:i===10,passPower:.6});sim.step(DTL);real+=DT;}
   const to=sim.ball.target||sim.ball.owner;assert(to&&sim.players[to].team==='gold'&&real<1.2,tag+'Throw plays it to a teammate at once');}
  {const t=trial({aim:135}),sim=t.sim,gk=t.gk;let real=0;for(let i=0;i<1200&&sim.ball.owner===gk;i++){sim.humanInput(gk,{mx:0,my:0});sim.step(DTL);real+=DT;}
   assert(real>HK.holdSeconds-.2&&real<HK.holdSeconds+1,tag+'six seconds then the AI distributes ('+real.toFixed(2)+' s)');}
  // parry: the ball passes beyond catchR of his body but inside his reach → knocked away wide (kind 1); high → tipped over (kind 2)
  {const t=trial({aim:135,gx:135-8.6});assert(t.saved&&!t.caught&&t.kind===1&&!t.goal,tag+'a ball 8.6 units off his body is PARRIED');}
  {const t=trial({aim:135,gx:135-8.6,h:1});assert(t.saved&&t.kind===2&&!t.goal,tag+'a high one is TIPPED over');}
  // the dive: Dive (stick idle) goes to the shot's line and saves a corner a standing keeper concedes; the wrong way is beaten
  {const t=trial({fx:150,aim:152});assert(t.goal&&t.dives===0,tag+'no dive: the corner goes in');}
  {const t=trial({fx:150,aim:152,press:1});assert(!t.goal&&t.saved&&t.dives===1&&t.side===1,tag+'Dive saves the corner (dives to +x)');}
  {const t=trial({fx:150,aim:152,press:1,mx:-1});assert(t.goal&&t.dives===1&&t.side===-1,tag+'stick pushed the other way + Dive: the wrong way, beaten');}
  {const t=trial({fx:150,aim:152,press:12});line.push(F+' late dive '+(t.goal?'beaten':'saved'));}
 }
 console.log('  keeper (press at +0.4 s on a near corner): '+line.join(', '));
 // the saves' AI side: against a human keeper more shots go for the corner away from him; AI-only matches keep cp === xg (fixture below)
 assert(HK.cornerShare>=.3&&HK.awaySide>.5&&HK.diveSpeed>0&&HK.diveLag>HK.readLag);
 // ---- body moves: Trick + stick direction (against the attacking direction) ----
 const carry=(F,seed=500)=>{const sim=new MatchSim(seed,F);for(let i=0;i<20;i++)sim.step(DT*sim.windupScale);const me=sim.ids.find(id=>sim.players[id].team==='gold'&&sim.players[id].role==='mid');sim.lockHuman(me);
  const def=sim.ids.find(id=>sim.players[id].team==='blue'&&!sim.players[id].isGK);sim.placePlayer(me,135,230);sim.placePlayer(def,135,221);sim.restart=null;Object.assign(sim.ball,{owner:me,x:135,y:228,vx:0,vy:0,target:null,intBy:null});sim.possession='gold';sim.humans.get(me).guard=0;return {sim,me,def,h:sim.humans.get(me)};};
 const moveOf=(F,f,seed)=>{const c=carry(F,seed);for(let i=0;i<3;i++){c.sim.humanInput(c.me,{...f,trick:false});c.sim.step(DT*c.sim.windupScale);}c.sim.humanInput(c.me,{...f,trick:true});c.sim.step(DT*c.sim.windupScale);return c;};
 for(const F of ['7v7','futsal','9v9','11v11','beach']){
  assert.equal(moveOf(F,{mx:0,my:1}).h.trickKind,'dragBack',F+': stick back (toward his own goal) = drag-back');
  {const c=moveOf(F,{mx:1,my:0});assert.equal(c.h.trickKind,'roulette',F+': stick to the side = spin turn');assert.equal(c.h.trickSide,-c.sim.dirY('gold'),F+': spin to the stick side (gold attacks -y: stick +x = side +1)');}
  assert.equal(moveOf(F,{mx:0,my:-1,sprint:true}).h.trickKind,'flick',F+': Sprint held = flick-up');
  {const c=moveOf(F,{mx:0,my:-1});assert.equal(c.h.trickKind,'stepover',F+': forward / neutral = step-over');c.h.trickCd=0;c.sim.humanInput(c.me,{mx:0,my:-1,trick:true});c.sim.step(DT*c.sim.windupScale);assert.equal(c.h.trickKind,'croqueta',F+': the next tap = La Croqueta');}
  // the beaten defender: the nearest one stumbles (TRICK_BEAT.stumble real s at TRICK_BEAT.slow pace) with TRICK_MOVES[kind].beat
  let beat=0,slowOk=0;const n=40;
  for(let k=0;k<n;k++){const c=moveOf(F,{mx:0,my:-1},700+k*7);if(!c.h.trickBeat)continue;beat++;assert.equal(c.h.trickBeat,c.def,F+': the nearest defender');assert(c.sim.stumbled.has(c.def));
   const d=c.sim.players[c.def],x0=d.x,y0=d.y;for(let i=0;i<6;i++){c.sim.humanInput(c.me,{mx:0,my:-1});c.sim.step(DT*c.sim.windupScale);}
   const v=Math.hypot(d.x-x0,d.y-y0)/(6*DT);if(v<20)slowOk++;let t=0;while(c.sim.stumbled.has(c.def)&&t<2){c.sim.step(DT*c.sim.windupScale);t+=DT;}assert(t<H.TRICK_BEAT.stumble,F+': the stumble ends ('+t.toFixed(2)+' s)');}
  assert(beat/n>.3&&beat/n<.9,F+': a move beats his man often, not always ('+beat+'/'+n+')');assert(slowOk>=beat*.8,F+': a beaten defender loses his step');line.push(F+' beat '+beat+'/'+n);
  // speed cap: a move's burst never adds top speed (pose limit: client 9.34 / server 9.44 m/s)
  {const v=venue(F),sx=v.width/250,sy=v.length/380;let vmax=0;const c=carry(F);let px=c.sim.players[c.me].x,py=c.sim.players[c.me].y;
   for(let i=0;i<70;i++){c.sim.humanInput(c.me,{mx:0,my:-1,sprint:true,trick:i===30});c.sim.step(DT*c.sim.windupScale);const p=c.sim.players[c.me];vmax=Math.max(vmax,Math.hypot((p.x-px)*sx,(p.y-py)*sy)/DT);px=p.x;py=p.y;}
   assert(vmax<9.34,F+': sprint + flick-up stays under the pose limit ('+vmax.toFixed(2)+' m/s)');}
 }
 console.log('  body moves: '+line.slice(5).join(', '));
 // shield: back turned to a close defender → AI tackles on him at HUMAN_BODY.shieldMul; shoulder: Stay + stick at an AI carrier
 {const c=carry('9v9');c.sim.placePlayer(c.def,135,236);for(let i=0;i<3;i++){c.sim.humanInput(c.me,{mx:0,my:-1});c.sim.step(DT*.32);}assert(c.h.shield,'defender behind him: shielding');
  assert.equal(c.sim.bodyTackleMul(c.h),H.HUMAN_BODY.shieldMul*(1+(H.HUMAN_BODY.sprintLoose-1)*c.h.sprintE*c.h.sprintE));assert(H.shieldOn(0,0,0,-1,0,5)&&!H.shieldOn(0,0,0,-1,0,-5),'pure shield read');}
 {let pokes=0,steps=0;for(let k=0;k<30;k++){const sim=new MatchSim(900+k,'9v9');for(let i=0;i<20;i++)sim.step(DT*.32);const me=sim.ids.find(id=>sim.players[id].team==='gold'&&sim.players[id].role==='mid');sim.lockHuman(me);
   const ai=sim.ids.find(id=>sim.players[id].team==='blue'&&!sim.players[id].isGK);sim.placePlayer(me,135,220);sim.placePlayer(ai,139,220);sim.restart=null;Object.assign(sim.ball,{owner:ai,x:139,y:218,vx:0,vy:0,target:null,intBy:null});sim.possession='blue';sim.protect=0;
   const h=sim.humans.get(me);sim.humanInput(me,{mx:1,my:0,jockey:true});sim.step(DT*.32);assert.equal(h.shoulderSerial,1,'Stay held + stick at the carrier in reach: a shoulder challenge');assert(h.shoulderCd>0);
   if(sim.ball.owner!==ai)pokes++;else if(sim.stumbled.has(ai))steps++;}
  assert(pokes>3&&pokes<20&&pokes+steps===30,'shoulder: knocked loose sometimes ('+pokes+'/30), else he loses a step ('+steps+')');}
 // momentum: a sharp cut at speed opens the tight window (AI tackles × cutTight); a full sprint runs it looser
 {const c=carry('9v9');c.sim.placePlayer(c.def,60,60);for(let i=0;i<30;i++){c.sim.humanInput(c.me,{mx:0,my:-1,sprint:true});c.sim.step(DT*.32);}assert(c.sim.bodyTackleMul(c.h)>1,'sprinting: looser');
  for(let i=0;i<8&&c.h.cut<=0;i++){c.sim.humanInput(c.me,{mx:1,my:.4});c.sim.step(DT*.32);}assert(c.h.cut>0,'a sharp cut: the tight window');}
 // a friend's screen: the move, the beaten defender, the keeper's dive + save and the shield travel in the snapshot (SNAP_BODY)
 {const own=new MatchSim(311,'9v9'),pup=new MatchSim(311,'9v9');for(let i=0;i<20;i++){own.step(DT*.32);}const gk=own.ids.find(id=>own.players[id].team==='gold'&&own.players[id].isGK);
  const me=own.ids.find(id=>own.players[id].team==='blue'&&own.players[id].role==='mid');for(const s of [own,pup]){s.lockHuman(gk);s.lockHuman(me);}pup.enterPuppet();const buf=N.createSnapBuffer(),out=[];let t=0,seq=0;
  const send=()=>{N.encodeSnap(own,2,seq++,0,out);assert(out.every(v=>Math.abs(v)<=100000&&Number.isInteger(v)),'every number inside the relay check');buf.push(out,3,t+=83);buf.sample(pup,t+200,-1,.32/1000);};
  send();const ho=own.humans.get(me),hk=own.humans.get(gk);Object.assign(ho,{trickSerial:ho.trickSerial+1,trickKind:'flick',trickSide:-1,trickBeat:own.ids.find(id=>own.players[id].team==='gold'&&!own.players[id].isGK),shield:true});
  Object.assign(hk,{diveSerial:2,diveSide:-1,saveSerial:1,saveKind:1,saveBig:true});own.ball.owner=me;send();
  const p=pup.humans.get(me),q=pup.humans.get(gk);assert.equal(p.trickKind,'flick','friend: the flick-up (kind 4 via the high bit)');assert(p.trickBeat&&pup.players[p.trickBeat].team==='gold','friend: a beaten defender to stumble');
  assert.equal(p.trickSide,-1);assert(p.shield,'friend: shielding');assert.equal(q.diveSerial,2,'friend: the dive');assert.equal(q.diveSide,-1);assert.deepEqual([q.saveSerial,q.saveKind,q.saveBig],[1,1,true],'friend: the big parry');
  const old=out.slice(0,out.length-own.humans.size);buf.clear();buf.push(old,3,t+=83);assert(buf.sample(pup,t+200,-1,.32/1000),'an older owner (no body values) still samples');}
 // the view (liveBodyFx): the move's pose (combos / choreo flick), the beaten defender's stumble, the rings trimmed by reduced motion only
 {const calls=[],e={sim:new MatchSim(311,'9v9'),venue:venue('9v9'),ball:{position:{x:0,y:0,z:0}},rigs:new Map(),choreo:{clock:0,stumble:id=>calls.push('stumble '+id),flick:(id,s)=>calls.push('flick '+s),dive:(id,c,s)=>calls.push('dive '+s)},
   comboView:{trick:(id,k,s,sec)=>calls.push('trick '+k+' '+sec),body:(id,t)=>calls.push('body '+t)},effects:{kick:{burst:k=>calls.push('burst '+k)}}};
  const fx=BF.createBodyFx(),me=e.sim.ids[3],dv=e.sim.ids.find(id=>e.sim.players[id].team!==e.sim.players[me].team&&!e.sim.players[id].isGK);e.sim.lockHuman(me);const h=e.sim.humans.get(me);
  Object.assign(h,{trickSerial:1,trickKind:'roulette',trickSide:1,trickBeat:dv});fx.trick(e,me,h,false);Object.assign(h,{trickSerial:2,trickKind:'flick',trickBeat:null});fx.trick(e,me,h,true);
  Object.assign(h,{trickSerial:3,trickKind:'stepover',trickBeat:dv});fx.trick(e,me,h,true);
  assert.deepEqual(calls,['trick roulette '+H.TRICK_MOVES.roulette.anim,'stumble '+dv,'burst beat','flick 1','trick stepover '+H.TRICK_MOVES.stepover.anim,'stumble '+dv],'poses + stumble always; the ring only without reduced motion');
  assert.equal(fx.seen(me).beats,2,'the HUD\'s "Got past!" serial');}
 // HUD + markers wiring: banner, glove ring / zone / arc, Dive / Catch / Throw, one-time tips, the picker's keeper line, mirrored controls
 {const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),km=fs.readFileSync('lib/graphics/keeperMarkers.ts','utf8');
  assert.match(hud,/data-join-keeper/);assert.match(hud,/You&rsquo;re the keeper/);assert.match(hud,/data-join-pick-keeper/);assert.match(rt,/if\(view\.keeper\)bannerT=KEEPER_FX\.banner/,'banner on join in goal');assert.match(rt,/bannerOwed=true/,'and at the kick-off after a goal');
  assert.match(rt,/if\(view\.keeper\)\{markers\.hideYou\(\);keeperMarks\.show\(/,'the keeper ring replaces the attack compass');assert.match(rt,/showTip\(view\.keeper\?'keeper':'join',false\)/);assert.match(rt,/showTip\('throw'\)/);
  assert.match(css,/\.keeper\[data-show\]\{opacity:1;transform:/,'banner: transform + opacity only');assert(!/IslandBrush/.test(css.slice(css.indexOf('.keeper{'))),'regular sans on the banner');
  assert.match(css,/:global\(\.controls-flipped\) \.actions>\*\{right:auto;left:var\(--x\)\}/,'left-handed flip mirrors Dive / Catch / Throw like every action button');
  assert.match(css,/\.keeper\{position:absolute;z-index:12;left:50%/,'the banner is centred (the same for the flipped layout)');assert.match(km,/no allocation per frame/);}
 const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged');
 console.log('PASS join-live-game (keeper feel + body moves): keeper in all 5 (indicator data, catch / parry / tip, dive + push-off + wrong way, throw-out, six seconds), moves by stick (drag-back / spin / flick / step-over / croqueta) on all 5, beaten defender stumble, speed cap, shield, shoulder, cut, friend sees it (SNAP_BODY), view poses, HUD wiring, mirrored controls, fixture unchanged');}
// ---- QA round 1 (solo, Nov 5 2026): a kid parked on a dead ball never freezes the restart ----
// Found by a scripted kid chasing the ball in every format: at the half-time / new-period kick-off he stood on the centre spot and
// the kick-off (which waits for everyone in their half and the other side out of the circle, with no failsafe) never came (145 s
// in 3 min of futsal); on a throw-in / corner / goal kick he stood on the spot and the taker could not reach it until the 4 s
// failsafe (12.5 real s at the 7v7's live speed). Now his stick is kept in his half (and out of the circle on their kick-off),
// he gives the taker room, and a human match's kick-off goes after a short beat however he stands.
{const WS={futsal:.48,beach:.48,'7v7':.32,'9v9':.32,'11v11':.32},RDT=1/30,res=[];
 for(const F of ['7v7','futsal','9v9','11v11','beach']){
  // kick-off: the gold human stands on the centre spot pushing his stick at the ball, blue kicks off
  {const s=new MatchSim(11,F);s.windupScale=WS[F];for(let i=0;i<30;i++)s.step(RDT*WS[F]);const me=outfieldIds(s,'gold')[1];s.lockHuman(me);
   Object.assign(s.ball,{owner:null,target:null,intBy:null,x:135,y:200,vx:0,vy:0,height:0});s.placePlayer(me,135,200);s.stageKickoff('blue');
   let t=0;for(;t<20&&s.isRestart;t+=RDT){const p=s.players[me],dx=s.ball.x-p.x,dy=s.ball.y-p.y,d=Math.hypot(dx,dy);s.humanInput(me,d>.5?{mx:dx/d,my:dy/d}:{mx:0,my:-1});s.step(RDT*WS[F]);}
   assert(!s.isRestart,F+': the kick-off is taken with a kid on the spot (was: frozen for good)');assert(t<9,F+': kick-off taken in '+t.toFixed(1)+' real s');
   const p=s.players[me];assert(p.y>=200,F+': his stick kept him in his own half');res.push(F+' kick-off '+t.toFixed(1)+'s');}
  // throw-in: the human stands still on the spot; the opposing taker walks over and takes it well before the failsafe
  {const s=new MatchSim(12,F);s.windupScale=WS[F];for(let i=0;i<30;i++)s.step(RDT*WS[F]);const me=outfieldIds(s,'gold')[1];s.lockHuman(me);
   const tk=outfieldIds(s,'blue').map(id=>[id,Math.hypot(s.players[id].x-250,s.players[id].y-250)]).sort((a,b)=>a[1]-b[1])[0][0];
   s.placePlayer(tk,240,262);s.placePlayer(me,255,250);Object.assign(s.ball,{owner:null,target:null,intBy:null,x:256,y:250,vx:0,vy:0,height:0});s.restart={kind:'kickin',t:1,x:256,y:250,taker:tk};
   let t=0,far=0;for(;t<20&&s.isRestart;t+=RDT){s.humanInput(me,{mx:0,my:0});s.step(RDT*WS[F]);far=Math.max(far,Math.hypot(s.players[me].x-256,s.players[me].y-250));}
   assert(!s.isRestart&&s.ball.owner===tk,F+': the taker took the throw-in');assert(t*WS[F]<3,F+': before the 4 s failsafe ('+(t*WS[F]).toFixed(2)+' sim s)');assert(far>=12,F+': he stepped off the spot ('+far.toFixed(1)+')');
   res.push(F+' throw-in '+t.toFixed(1)+'s');}}
 const ms=fs.readFileSync('lib/town/match/matchSim.ts','utf8');assert.match(ms,/this\.humans\.size > 0 && r\.t < -1\.5 \* this\.wsReal\(\)/,'the human-match kick-off failsafe');
 const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 for(const e of expected)assert.deepEqual(S.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged');
 console.log('PASS join-live-game (QA round 1 solo): dead balls with a kid on the spot: '+res.join(', ')+'; fixture unchanged');}

// ---- QA round 2 (robustness + soak, Nov 6 2026; docs/join-live-game-design.md "QA round 2 (robustness + soak)") ----
{const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),lock=fs.readFileSync('components/RotateLock.tsx','utf8');
 // 1. A held Sprint / Pass / Shoot whose release never arrives (tab switch, phone call, page hide) is let go WITHOUT firing: Sprint
 //    stayed on after resume in headless Chrome (visibilitychange hidden + blur, no touchend). release() clears the holds AND the press
 //    times, so the next steer sees no release edge (no stray pass / shot) and no held jockey / sprint.
 const rel=rt.match(/release\(\)\{([^}]*)\}/);assert(rel,'liveJoin.release()');
 for(const p of [/held\.a=held\.b=held\.s=false/,/aDownAt=bDownAt=0/,/aMode=bMode=''/,/chase=false/,/joinAim\.on=false/])assert.match(rel[1],p,'release clears '+p.source);
 assert.match(rt,/window\.addEventListener\('blur',api\.release\);window\.addEventListener\('pagehide',api\.release\);document\.addEventListener\('visibilitychange',onHidden\);/,'released on blur, pagehide and a hidden page');
 assert.match(rt,/function onHidden\(\)\{if\(document\.hidden\)api\.release\(\);\}/);
 for(const p of [/removeEventListener\('blur',api\.release\)/,/removeEventListener\('pagehide',api\.release\)/,/removeEventListener\('visibilitychange',onHidden\)/])assert.match(rt,p,'dispose removes '+p.source);
 // Pass and Shoot also let go on a lost pointer capture (as Sprint always did): an iOS capture lost without pointerup / pointercancel.
 for(const k of ['a','b','s'])assert.match(hud.match(new RegExp('<button type="button" data-join-'+k+' [^>]*>'))[0],/onLostPointerCapture=/,k+': lost capture releases');
 // 2. The "Turn your phone upright" card: the game waits behind it. A solo match kept playing (the AI scored on a kid who could not
 //    see); timeScale is 0 while the card's own query matches (solo only: a friend's match keeps real time).
 const O=load('lib/town/orientationMode.ts'.replace('town/',''));assert.equal(O.wrongOrientationQuery('portrait'),O.PORTRAIT_ONLY_QUERY,'the island card query');
 assert.match(lock,/ROTATE_LOCK_QUERY = PORTRAIT_ONLY_QUERY/);
 assert.match(rt,/sideways=typeof matchMedia==='function'\?matchMedia\(wrongOrientationQuery\('portrait'\)\):null/,'one MediaQueryList, made once');
 assert.match(rt,/get timeScale\(\)\{return format&&games\.shared\(format\)\?1:sideways\?\.matches&&state\.phase==='joined'\?0:timeScale;\}/,'solo: 0 behind the card, shared: 1');
 console.log('PASS join-live-game (QA round 2 robustness): held buttons let go on hide, solo match waits behind the rotate card');}

// ---- QA round 2 (balance, Nov 6 2026; docs/join-live-game-design.md "QA round 2 (balance)"): how hard the AI defends a HUMAN side ----
// Scripted idle / kid / average / skilled humans, 20 seeds x 3 real min per format: the 11v11 human's passes completed 84-96 %, a
// skilled bot beat the 7v7 2.3-0.1 and scored 65-80 % of his aimed futsal / 9v9 shots. lib/town/match/humanDefence.ts: per-format
// knobs, read only with a human joined (ramped in from the join, a 3-goal rubber band on the kids' formats). Ranges, not exact numbers.
{const HD=load('lib/town/match/humanDefence.ts'),T=HD.HUMAN_DEFENCE,N=HD.HUMAN_DEFENCE_NEUTRAL,S=HD.defenceStrength,F5=['7v7','futsal','9v9','11v11','beach'];
 for(const f of F5){const d=T[f];
  for(const k of ['intercept','lane','read','tackle','attack','keeper'])assert(d[k]>=1&&d[k]<=2.5,f+' '+k+' is a gentle multiplier (never easier than before): '+d[k]);
  assert(d.tackle<=1.25&&d.keeper<=1.4,f+': tackling a human and the keeper stay close to the owner\'s "hard to be tackled" / aimed-shot tuning');
  assert(S(d,0,0,false)<=S(d,600,0,false)&&Math.abs(S(d,600,0,false)-1)<1e-9,f+': ramps in from the join to full strength');
  {assert(d.margin===3&&d.sag<1&&d.tight>1&&d.tight<=1.4,f+': mild rubber band at 3 goals');
   assert(S(d,600,-3,false)<S(d,600,-2,false)&&S(d,600,2,false)<S(d,600,3,false),f+': sags 3 behind, tightens 3 ahead, nothing in between');
   assert.equal(S(d,600,-4,true),S(d,600,0,true),f+': friends on both sides: no rubber band');}
  if(f!=='11v11')for(const k of ['intercept','lane'])assert(T['11v11'][k]>=d[k],'11v11 (adults) reads the lanes hardest: '+k);}
 assert(T['7v7'].start<=0.5&&T['7v7'].ramp>=180,'7v7: no pressure spike at kick-off, a little more resistance late');
 // Tier 2 (Nov 7 2026): the 11v11 row eased toward the 9v9 shape (it was intercept 2.4, lane 1.8, read 1.7, attack 1.5, ramp 30 from .8, no band)
 {const e=T['11v11'];assert(e.ramp>=120&&e.start<=.5&&e.margin===3&&e.read<=1.25&&e.attack<=1.15&&e.intercept<=1.8&&e.lane<=1.4,'11v11: eased toward the 9v9 (ramp '+e.ramp+', read '+e.read+', attack '+e.attack+')');}
 assert.deepEqual(Object.keys(N).sort(),Object.keys(T['7v7']).sort(),'one neutral value per knob');
 // a human's pass past a defender 3.5 u off the lane (200 seeds): the 11v11 reads it far more often, the 7v7 hardly more at the join
 const trial=(F,seed)=>{const s=new MatchSim(seed,F);s.windupScale=.32;for(let i=0;i<10;i++)s.step(DT*.32);
  const gold=outfieldIds(s,'gold'),blue=outfieldIds(s,'blue'),me=gold[0],mate=gold[1],def=blue[0];s.lockHuman(me);
  gold.slice(2).forEach((id,i)=>s.placePlayer(id,20+i*12,390));blue.slice(1).forEach((id,i)=>s.placePlayer(id,20+i*12,15));
  s.placePlayer(me,135,260);s.placePlayer(mate,135,200);Object.assign(s.ball,{owner:me,target:null,intBy:null,x:135,y:258,vx:0,vy:0,height:0});s.possession='gold';
  for(let i=0;i<4;i++){s.placePlayer(def,138.5,230);s.humanInput(me,{mx:0,my:-1});s.step(DT*.32);}
  s.placePlayer(def,138.5,230);s.humanInput(me,{mx:0,my:-1,pass:true,passPower:0});for(let i=0;i<3&&s.ball.owner===me;i++)s.step(DT*.32);
  return s.ball.owner!==me&&!!s.ball.intBy;};
 const count=F=>{let n=0;for(let k=0;k<200;k++)if(trial(F,500+k))n++;return n;};
 const on={e:count('11v11'),s:count('7v7')},keep=Object.fromEntries(F5.map(f=>[f,{...T[f]}]));for(const f of F5)Object.assign(T[f],N);
 const off={e:count('11v11'),s:count('7v7')};for(const f of F5)Object.assign(T[f],keep[f]);
 const st0=T['11v11'].start;T['11v11'].start=1;const full=count('11v11');T['11v11'].start=st0; // Tier 2: the 11v11 ramps in from .5 like the 9v9
 assert(on.e>=off.e&&full>=off.e*1.4&&full>=14&&full<=70,'11v11: a defender in the lane cuts out a human\'s pass more often once ramped in ('+off.e+' -> '+on.e+' at the join, '+full+' full, of 200)');
 assert(on.s<=off.s*1.6+4,'7v7 at the join: no spike ('+off.s+' -> '+on.s+' of 200)');
 const ms=fs.readFileSync('lib/town/match/matchSim.ts','utf8');
 assert.match(ms,/this\.humans\.size > 0 && !!nf && this\.humans\.has\(nf\.p\.id\) && pressure < P\.pressDist \* this\.humanDefenceMul\("read"/,'an AI carrier reads a closing human (humans only)');
 assert.match(ms,/const keeperMul = shooter && shooter\.shotAimed \?/,'the keeper knob only meets an aimed human shot (the kids\' 1-tap shot is unchanged)');
 assert.match(ms,/const humanTeam = assisted \? from\.team : null;/,'the lane knobs only read a human\'s own assisted pass');
 const Sm=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 for(const e of expected)assert.deepEqual(Sm.summary(MatchSim,e.format,e.seed),e,'AI-only '+e.format+' unchanged');
 console.log('PASS join-live-game (QA round 2 balance): per-format AI defence vs a human side, ramped + 3-goal band on the kids\' formats; lane reads 11v11 '+off.e+' -> '+on.e+', 7v7 at join '+off.s+' -> '+on.s+' of 200; fixture unchanged');}

// ---- Control feel (Nov 7 2026): tap shot without an aim mark, per-format shooting zone, ball cue + lookahead, input buffering,
// button emphasis, receiver arrow, charge haptics. ----
{const LC=load('lib/town/liveControls.ts'),CAM=load('lib/town/liveJoinCamera.ts');
 const rt=fs.readFileSync('lib/town/liveJoinRuntime.ts','utf8'),fr=fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),hud=fs.readFileSync('components/LiveJoinHud.tsx','utf8'),css=fs.readFileSync('components/LiveJoinHud.module.css','utf8'),mk=fs.readFileSync('lib/graphics/joinMarkers.ts','utf8'),set=fs.readFileSync('components/IslandSettings.tsx','utf8');
 // shooting zone per format: 11v11 ~23 m, the rest keep 120 u
 assert.equal(LC.shotRangeU('11v11'),85);for(const f of ['9v9','7v7','futsal','beach'])assert.equal(LC.shotRangeU(f),120,f);
 assert.match(fr,/out\.inShotRange=Math\.abs\(p\.y-gy\)<shotRangeU\(v\.id\);/,'the zone reads the format');
 // input buffering: early press upgrades within 150 ms (never from Call), a pass just after losing it is still latched
 assert.equal(LC.PRESS_BUFFER.ms,150);
 assert.equal(LC.bufferedA('go','pass',100),'pass');assert.equal(LC.bufferedA('go','tackle',140),'tackle');assert.equal(LC.bufferedA('','throw',50),'throw');
 assert.equal(LC.bufferedA('go','pass',200),'go','too early: stays Go!');assert.equal(LC.bufferedA('call','pass',50),'call','a call never turns into a pass back');assert.equal(LC.bufferedA('pass','tackle',50),'pass');
 assert.equal(LC.graceA('pass','go',80),'pass');assert.equal(LC.graceA('pass','go',300),'go');assert.equal(LC.graceA('pass','tackle',20),'tackle','a new action wins');assert.equal(LC.graceA('go','pass',10),'pass');
 assert.match(rt,/tackle:aDown&&mode\.a==='tackle'\|\|chaseTackle\|\|bufTackle,/);assert.match(rt,/\|\|bufPass;/);assert.match(rt,/aMode=latchA\(aDownAt\)/);
 // emphasis: one hot button
 const m=(a,b)=>({a,b,c:''});
 assert.equal(LC.hotButton(m('pass','shoot'),true),'b','in range: Shoot');assert.equal(LC.hotButton(m('pass','forward'),true),'a','open teammate: Pass');
 assert.equal(LC.hotButton(m('pass','forward'),false),'');assert.equal(LC.hotButton(m('tackle','stay'),false),'a');assert.equal(LC.hotButton(m('press','stay'),false),'');
 assert.match(css,/\.actions\[data-calm\] \[data-hot\]::after\{animation:none\}/,'Match effects Light: still ring');assert.match(css,/prefers-reduced-motion:reduce\)\{\.a\[data-hot\]::after,\.b\[data-hot\]::after\{animation:none\}/);
 assert.match(rt,/const calm=matchFxLevel\(\)==='light'/);
 // haptics: guarded, behind a setting, the row only where vibrate exists
 assert.match(rt,/hapticTick\(/);assert.match(set,/\{canVibrate&&<button[^>]*data-match-haptics/);assert.equal(LC.hapticsSupported(),false,'no navigator here: unsupported, no throw');LC.hapticTick();
 assert.match(fs.readFileSync('lib/saves/snapshot.ts','utf8'),/'fi2-match-haptics-v1'/,'a device preference');
 // ball cue + lookahead
 assert.match(hud,/data-join-ballcue/);assert.match(css,/\.ballCue\{position:fixed;[^}]*pointer-events:none;opacity:0;/);assert(!/\.ballCue[^{]*\{[^}]*(left|top):calc/.test(css));
 assert.match(rt,/cue\.style\.transform='translate\('/,'transform only');
 const o={x:0,z:0};CAM.ballLookTarget('7v7',30,0,o);assert.equal(o.x,0,'small pitches: none');
 CAM.ballLookTarget('11v11',40,0,o);assert.equal(o.x,7,'capped');CAM.ballLookTarget('11v11',10,0,o);assert(Math.abs(o.x-3.2)<1e-9);CAM.ballLookTarget('9v9',0,30,o);assert.equal(o.z,4);CAM.ballLookTarget('11v11',40,0,o,390/844);assert(Math.abs(o.x-2.8)<1e-9,'portrait phone: 40% of the cap');
 assert.match(rt,/lookAhead\(camera,dt,reduced\);return;/);
 // receiver arrow: shares the ring's material, built once
 assert.match(mk,/arrow=new T\.Mesh\(arrowGeo,passMat\)/);assert.match(rt,/markers\.passTarget\(view\.onBall\?view\.passX:NaN,y,view\.passZ,time,reduced,view\.x,view\.z\)/);
 console.log('PASS join-live-game (control feel): tap shot unaimed, 11v11 zone 85 u, buffering, emphasis, ball cue + lookahead, haptics');}
