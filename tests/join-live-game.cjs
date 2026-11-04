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

// ---- 1. Format switch: the 7v7 opens first; the others are config, not code ----
assert.equal(J.joinableFormat('7v7'),true);
for(const f of ['futsal','9v9','11v11','beach'])assert.equal(J.joinableFormat(f),false,f+' waits for its rollout slice');
assert.equal(J.LIVE_JOIN_FORMATS['7v7'].maxHumansPerTeam,6,'7v7: six outfield slots per team (no human keeper)');
assert(J.LIVE_JOIN_FORMATS['11v11'].humanSpeedCap<1,'11v11 carries the speed caveat (7.1 m/s sim pace vs a 3.7 m/s walk)');

// ---- 2. Walk-on countdown: auto-join after 2 s, step back cancels, tap skips, walking off is NOT leaving ----
{const s=J.createJoinState(),on={inField:true,eligible:true,skip:false,leave:false},off={...on,inField:false};
 assert.equal(J.stepJoin(s,off,DT),null);assert.equal(s.phase,'idle');
 assert.equal(J.stepJoin(s,on,DT),'start');assert.equal(s.phase,'countdown');
 let ev=null;for(let t=0;t<1.5;t+=DT)ev=J.stepJoin(s,on,DT)??ev;assert.equal(ev,null,'still counting at 1.5 s');assert(J.joinProgress(s)>.7&&J.joinProgress(s)<1);
 assert.equal(J.stepJoin(s,off,DT),'cancel','stepping back off the pitch cancels');assert.equal(s.phase,'idle');
 assert.equal(J.stepJoin(s,on,DT),'start');assert.equal(J.stepJoin(s,{...on,skip:true},DT),'join','"Join now" skips the wait');
 assert.equal(s.phase,'joined');assert.equal(J.joinProgress(s),1);
 for(let i=0;i<60;i++)assert.equal(J.stepJoin(s,off,DT),null,'chasing the ball over the line does not leave');
 assert.equal(J.stepJoin(s,{...on,leave:true},DT),'leave');assert.equal(s.phase,'idle');
 assert.equal(J.stepJoin(s,on,DT),null,'after leaving on the pitch, no instant re-join');
 J.stepJoin(s,off,DT);assert.equal(J.stepJoin(s,on,DT),'start','step off and back on: the countdown runs again');
 assert.equal(J.stepJoin(s,{...on,eligible:false},DT),'cancel','losing the ball / taking a ride cancels');
 const full=J.createJoinState();J.stepJoin(full,on,DT);let joined=false;for(let t=0;t<2.2;t+=DT)joined=J.stepJoin(full,on,DT)==='join'||joined;assert(joined,'auto-join after ~2 s');}

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
 assert.equal(sim.lockHuman(sim.ids.find(id=>sim.players[id].isGK)),false,'no human keeper');
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
 const sp=Math.hypot(sim.ball.vx,sim.ball.vy);assert(sp>=180&&sp<=420,'weighted pace ('+sp.toFixed(0)+')');
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

// AI-only matches pay nothing for the human code (no pass-assist work when nobody is human)
{const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');
 assert.match(src,/if \(this\.humans\.size\) \{\n\s*const owner = this\.ball\.owner, h = owner \? this\.humans\.get\(owner\) : undefined;/,'pass assist only with humans');
 assert.match(src,/if \(this\.humans\.size\) this\.applyHumanTargets\(\);/);
 assert(!/updateUserPlayer|dirSwitchTarget/.test(src),'no FIFA-style auto-switching left');}

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
 assert.match(rt,/if\(!v&&state\.phase==='idle'&&!state\.needExit\)\{if\(countdownFormat\)/,'far from a joinable pitch: one rectangle test, no DOM work');
 assert.match(fr,/a joined field is never dormant: the joiner stands on it/,'the joined field never sleeps (the player is on it)');
 assert.match(fr,/e\.humans\.size>0;/,'and is never throttled');
 const tips=[...rt.slice(rt.indexOf('JOIN_TIPS={'),rt.indexOf('} as const;')).matchAll(/:'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]);assert(tips.length>=8,'a lesson for every action');for(const t of tips)assert(t.length<80,'one-line lesson: '+t);
 assert(/pass into the space where they are running/i.test(rt)&&/open player/i.test(rt),'the assist captions name the idea');}

console.log('PASS join-live-game: format switch, countdown, team + slot for N humans, sit-out walker, input map, pass assist (cone, lane, hysteresis, lead, pace, shot aim), off-ball runs, locked sim control (pass/shoot/tackle/call/release), bibs');
