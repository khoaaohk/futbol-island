// Summit Kick (Summit Isle's sunset kick challenge, Oct 12 2026). Run: node tests/summit-kick.cjs
//  1. layout follows the island: hoops in the Summit 5s goal mouth (read from summitIsle.ts), the spot and post walkable
//  2. hoop hit detection: segment vs ring (through, outside, wrong way, along the plane, a fast ball's long step)
//  3. a round: 8 balls, the chalk line, popped hoops count once, ends on 5/5, out of balls, time, or leaving
//  4. scoring and its ceiling; coins, the metered payout and the daily caps (the real wallet)
//  5. the leaderboard registration and bounds (rules, plausibility for a real 5/5, the API accepts a round, the SQL migration)
//  6. the 3D runtime: idle costs nothing (no rAF, timers or meshes), a round builds 5 hoops and disposes them, the board token
//  7. wiring: Town, world, SYNC_KEYS, the HUD, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader,runtime}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const K=load('lib/town/summitKick.ts'),SI=load('lib/town/summitIsle.ts'),L=load('lib/arcade/leaderboard.ts');

(async()=>{
await ok('layout: hoops in the Summit 5s goal, the spot and the post walkable',()=>{
 const lay=K.kickLayout(),P=SI.SUMMIT_PITCH;
 assert.equal(lay.hoops.length,5);assert.equal(K.HOOP_COUNT,5);
 assert.equal(lay.goalX,P.x+lay.side*P.length/2,'the goal line comes from SUMMIT_PITCH');
 assert(Math.abs(lay.ground-SI.summitGround(P.x,P.z))<1e-9,'the pitch height comes from summitGround');
 for(const h of lay.hoops){
  assert(Math.abs(h.z-P.z)+h.r<=P.goalWidth/2+.01,`${h.id} inside the posts`);
  assert(h.y-h.r>=lay.ground+.05&&h.y+h.r<=lay.ground+P.goalHeight+.01,`${h.id} under the bar, off the ground`);
  assert(Math.abs(h.x-lay.goalX)<.5,`${h.id} in the goal mouth`);
  assert.equal(h.nx,-lay.side,'facing the kicker');}
 const ids=new Set(lay.hoops.map(h=>h.id));assert(ids.has('low-left')&&ids.has('top-right')&&ids.has('top-middle'));
 assert(new Set(lay.hoops.map(h=>h.y.toFixed(2))).size>=3,'different heights');
 assert(SI.onSummitIsle(lay.spot.x,lay.spot.z),'the kick spot is walkable');assert(K.behindLine(lay,lay.spot.x),'the spot is behind the chalk line');
 assert(K.onKickPitch(lay,lay.spot.x,lay.spot.z));
 assert(SI.onSummitIsle(lay.post.x,lay.post.z),'the start post stands on walkable ground');
 assert.equal(Math.abs(lay.goalX-lay.lineX),K.KICK_RULES.minDistance);
 const facing={x:Math.sin(lay.spot.yaw),z:Math.cos(lay.spot.yaw)};assert(facing.x*lay.side>.99,'the spot faces the goal');
 // Nothing hard-coded: the module reads the pitch, not numbers of its own.
 const src=read('lib/town/summitKick.ts');assert(!/\b6[0-9]{2}(\.\d+)?\s*,\s*z\s*:/.test(src)&&/SUMMIT_PITCH/.test(src)&&/summitGround/.test(src));
});

await ok('hoop hit detection: segment vs ring',()=>{
 const h={id:'t',label:'T',x:10,y:1,z:0,r:.45,nx:1,nz:0};
 const seg=(ax,ay,az,bx,by,bz)=>K.throughHoop({x:ax,y:ay,z:az},{x:bx,y:by,z:bz},h);
 assert.equal(seg(12,1,0,9,1,0),true,'straight through the centre');
 assert.equal(seg(11,1.3,.2,9.5,1.3,.2),true,'through near the rim (0.36 m off centre)');
 assert.equal(seg(11,1.5,0,9,1.5,0),false,'over the top (0.5 m above)');
 assert.equal(seg(11,1,.6,9,1,.6),false,'beside it');
 assert.equal(seg(9,1,0,12,1,0),false,'the wrong way (out of the goal)');
 assert.equal(seg(10.5,1,0,10.2,1,0),false,'not yet at the plane');
 assert.equal(seg(10,1,-1,10,1,1),false,'along the plane: no crossing');
 assert.equal(seg(16,.2,0,4,1.8,0),true,'a fast ball crossing in one long step (interpolated at the plane)');
 assert.equal(seg(16,.2,0,4,3.8,0),false,'a rising ball that is too high at the plane');
 // Any facing (normal along z).
 assert.equal(K.throughHoop({x:0,y:1,z:2},{x:0,y:1,z:-1},{id:'z',label:'Z',x:0,y:1,z:0,r:.45,nx:0,nz:1}),true);
});

await ok('a round: balls, chalk line, pops once, ends',()=>{
 const lay=K.kickLayout(),hoop=lay.hoops[0],front=d=>({x:hoop.x-lay.side*d,y:hoop.y,z:hoop.z});
 let r=K.createKickRound(lay,0);
 assert.equal(r.kick(lay.goalX-lay.side*5),'close','too close: the shot does not count');assert.equal(r.state.kicks,0);
 assert.equal(r.ball(front(.5),front(-.5)),null,'a shot from too close pops nothing');
 assert.equal(r.kick(lay.spot.x),'counted');assert.equal(r.state.kicks,1);
 assert.equal(r.ball(front(.5),front(-.5))?.id,hoop.id,'through the hoop');assert.equal(r.state.hits,1);
 r.shotOver();assert.equal(r.kick(lay.spot.x),'counted');
 assert.equal(r.ball(front(.5),front(-.5)),null,'a popped hoop counts once');
 for(const h of lay.hoops.slice(1)){r.shotOver();r.kick(lay.spot.x);assert.equal(r.ball({x:h.x-lay.side,y:h.y,z:h.z},{x:h.x+lay.side,y:h.y,z:h.z})?.id,h.id);}
 assert.equal(r.state.phase,'done');assert.equal(r.state.end,'perfect');assert.equal(r.state.hits,5);
 // Out of balls: the 8th kick, then the ball comes back.
 r=K.createKickRound(lay,0);for(let i=0;i<K.KICK_RULES.kicks;i++){r.kick(lay.spot.x);r.shotOver();}
 assert.equal(r.state.phase,'done');assert.equal(r.state.end,'kicks');assert.equal(r.kick(lay.spot.x),'none');
 // The last ball still flying: the round waits KICK_RULES.settle, then ends.
 r=K.createKickRound(lay,0);for(let i=0;i<K.KICK_RULES.kicks;i++)r.kick(lay.spot.x);r.step(1);assert.equal(r.state.phase,'playing');r.step(K.KICK_RULES.settle);assert.equal(r.state.end,'kicks');
 // Time.
 r=K.createKickRound(lay,0);for(let i=0;i<91;i++)r.step(1);assert.equal(r.state.end,'time');assert.equal(r.timeLeft,0);
 r=K.createKickRound(lay,0);r.leave();assert.equal(r.state.end,'left');r=K.createKickRound(lay,0);r.quit();assert.equal(r.state.end,'quit');
});

await ok('scoring and its ceiling',()=>{
 assert.deepEqual(K.kickScore({hits:0,kicks:8,seconds:30}),{total:0,hoops:0,accuracy:0,speed:0});
 assert.equal(K.kickScore({hits:3,kicks:6,seconds:40}).total,300+50,'hoops + accuracy');
 assert.equal(K.kickScore({hits:5,kicks:5,seconds:20}).total,500+100+120,'5/5: accuracy and speed');
 assert.equal(K.kickScore({hits:5,kicks:5,seconds:0}).total,K.KICK_MAX_SCORE);assert.equal(K.KICK_MAX_SCORE,780);
 assert.equal(K.kickScore({hits:5,kicks:8,seconds:90}).speed,0,'no speed bonus after a minute');
 assert.equal(K.kickScore({hits:9,kicks:2,seconds:-5}).total,K.KICK_MAX_SCORE,'junk is clamped');
 assert.equal(K.kickScore({hits:NaN,kicks:NaN,seconds:NaN}).total,0);
 for(let h=0;h<=5;h++)for(let k=h;k<=8;k++)for(const s of [1,10,45,90]){const t=K.kickScore({hits:h,kicks:k,seconds:s}).total;assert(t>=0&&t<=K.KICK_MAX_SCORE&&Number.isInteger(t));}
 // The device record.
 let save=K.sanitizeKickSave({best:99999,rounds:-3,perfect:'x',bestHits:12});assert.deepEqual(save,{version:1,best:780,rounds:0,perfect:0,bestHits:5});
 save=K.emptyKickSave();let r=K.recordKickRound(save,{hits:3,score:350});assert(r.newBest);r=K.recordKickRound(r.save,{hits:5,score:300});assert(!r.newBest);
 assert.deepEqual(r.save,{version:1,best:350,rounds:2,perfect:1,bestHits:5});
 assert.match(K.kickEndLine('perfect',5),/Five out of five/);assert.match(K.kickEndLine('kicks',0),/Tap Kick/);
});

await ok('coins: 2 a hoop + 4 for 5/5, metered training, capped',async()=>{
 assert.deepEqual([0,1,2,3,4,5].map(K.kickCoins),[0,2,4,6,8,14]);assert.equal(K.kickCoins(99),14);assert.equal(K.kickCoins(-1),0);
 const DM=load('lib/town/dailyMeter.ts'),W=load('lib/arcade/arcadeWalletCore.ts');
 assert(DM.isTrainingRun(K.KICK_RUN_PREFIX+'abc','island'),'Summit Kick rounds count toward the daily Training meter');
 assert(!DM.isTrainingRun('learn:explore:'+K.KICK_PERFECT_REWARD,'learn'),'the one-off 5/5 reward is a learning coin');
 assert(K.kickCoins(5)<=W.ARCADE_COIN_CAPS.island,'a round fits the island run cap');
 // The real wallet with the real meter: rounds pay in full, then half, then a 1-coin tip once today's training is high.
 let saved=null,clock=Date.parse('2026-10-12T15:00:00');
 const wallet=W.createArcadeWallet({meter:DM.isTrainingRun,read:()=>saved,write:v=>{saved=JSON.parse(JSON.stringify(v));},lock:fn=>Promise.resolve().then(fn),valid:new Set(),grant:()=>true,notify:()=>{},now:()=>clock,id:()=>'x',random:()=>.5});
 let total=0;const pays=[];for(let i=0;i<14;i++){const p=await wallet.creditRun(`${K.KICK_RUN_PREFIX}r${i}`,'island',K.kickCoins(5),'Summit Kick');pays.push(p);total+=p;clock+=60_000;}
 assert.equal(pays[0],14,'full pay at first');assert(pays.some(p=>p===7),'then half pay');assert.equal(pays[pays.length-1],1,'then the tip');
 assert(total<=DM.TRAINING_HALF_COINS+14,`a day of rounds stays near the meter (${total})`);
 assert.equal(await wallet.creditRun(`${K.KICK_RUN_PREFIX}r0`,'island',14,'again'),0,'a round id pays once');
 assert.equal(await wallet.creditRun(`${K.KICK_RUN_PREFIX}huge`,'island',999,'cheat'),1,'over the cap: clamped to the island cap, then metered');
});

await ok('leaderboard: registered with a sane ceiling, rate and min play time',async()=>{
 assert(L.BOARD_GAMES.includes('kick')&&L.isBoardGame('kick'));
 const r=L.BOARD_RULES.kick;assert.equal(r.name,'Summit Kick');
 assert(r.max>=K.KICK_MAX_SCORE&&r.max<=2000,'ceiling above the best real round, not absurd');
 assert(L.scoreInBounds('kick',K.KICK_MAX_SCORE)&&!L.scoreInBounds('kick',r.max+1)&&!L.scoreInBounds('kick',0));
 assert(r.minSeconds>=5&&r.minSeconds<=10,'a real round, not a scripted post');
 // A real fast 5/5 (5 kicks ~7 s) is plausible; a max score posted after the minimum time is not.
 assert.equal(L.scorePlausible('kick',K.kickScore({hits:5,kicks:5,seconds:7}).total,7000),'ok');
 assert.equal(L.scorePlausible('kick',r.max,r.minSeconds*1000),'fast');
 assert.equal(L.scorePlausible('kick',100,3000),'short');
 assert.equal(L.scorePlausible('kick',K.kickScore({hits:3,kicks:8,seconds:90}).total,90_000),'ok');
 // The API takes a round with a token from start.
 const SV=load('lib/arcade/leaderboardServer.ts'),ST=load('lib/arcade/leaderboardStore.ts');
 let c=Date.parse('2026-10-14T10:00:00Z');const store=ST.createMemoryBoardStore(),d={store,secret:'k'.repeat(40),now:()=>new Date(c)};
 const h={get:k=>({host:'futbol.test','x-forwarded-for':'203.0.113.9'})[k.toLowerCase()]??null};
 const t=(await SV.handleBoard('start',{body:'{"game":"kick"}',headers:h},d)).body.token;assert.match(t,/^v1\.kick\./);
 c+=20_000;const ok1=await SV.handleBoard('submit',{body:JSON.stringify({token:t,score:650,initials:'ZOE',icon:'ball'}),headers:h},d);assert.equal(ok1.body.ok,true,JSON.stringify(ok1.body));
 const t2=(await SV.handleBoard('start',{body:'{"game":"kick"}',headers:h},d)).body.token;c+=20_000;
 assert.equal((await SV.handleBoard('submit',{body:JSON.stringify({token:t2,score:1001,initials:'ZOE',icon:''}),headers:h},d)).body.reason,'score','over the ceiling');
 assert.deepEqual((await store.top('kick','2026-10-12')).all.map(x=>x.score),[650]);
 // The SQL allow-list: an additive migration after the boards one, ending with its OK row.
 const files=fs.readdirSync(path.join(ROOT,'supabase/migrations')).sort(),f=files.find(x=>/_summit_kick_board\.sql$/.test(x));assert(f,'migration present');
 assert(files.indexOf(f)>files.indexOf('20261013_arcade_leaderboards.sql'));
 const sql=read('supabase/migrations/'+f);for(const g of L.BOARD_GAMES)assert(sql.includes(`'${g}'`),'SQL allows '+g);
 assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/);assert(/'OK, summit kick board installed'/.test(sql));
 assert(!/\bdrop\s+(table|function|column)|truncate|delete from/i.test(sql.replace(/--.*$/gm,'')),'additive: only the check is widened');
});

await ok('3D runtime: idle costs nothing, a round builds 5 hoops and disposes them',async()=>{
 const {env,T,mod,paid,sessions,load:rl}=await runtime();
 const store=rl('lib/town/summitStore.ts'),lay=rl('lib/town/summitKick.ts').kickLayout();
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,1,500);camera.position.set(0,30,30);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const moved=[];const fun=mod.createSummitActivities(scene,{teleport:(x,z,yaw)=>moved.push({x,z,yaw}),impact:()=>{}});
 const el=()=>({hidden:true,dataset:{},style:{setProperty(){},getPropertyValue(){return '';}}});const kickBtn=el(),scopeBtn=el();
 const ctx=(x,z,extra={})=>({now:0,dt:1/30,elapsed:0,reduced:false,camera,width:390,height:844,x,z,onFoot:true,canEnter:true,sunset:true,focusKey:null,ui:s=>s.includes('summit-kick')?kickBtn:scopeBtn,place(){},hide(e,h){e.hidden=h;},...extra});
 const before=scene.children.length;
 await env.watchTimers(async()=>{
  for(let i=0;i<200;i++){assert.equal(fun.update(ctx(100,-20)),null);fun.ball({mode:'shot',x:1,y:1,z:1},{x:0,z:0});assert.equal(fun.aim({x:0,z:0},0),null);assert.equal(fun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/60),false);fun.applyCamera(camera,1/30,false);}
 });
 assert.equal(env.counts.raf,0,'no rAF');assert.equal(env.counts.timeout+env.counts.interval,0,'no timers');assert.equal(scene.children.length,before,'no meshes while idle');
 assert.equal(camera.fov,40,'the camera is untouched');
 // Near the post: the prompt wants the focus; shown only once the arbiter gives it.
 const want=fun.update(ctx(lay.post.x+1,lay.post.z));assert.equal(want?.key,'summit-kick');assert.equal(kickBtn.hidden,true);
 camera.position.set(lay.post.x+18,lay.ground+23,lay.post.z+30);camera.lookAt(lay.post.x,lay.ground,lay.post.z);camera.updateMatrixWorld();
 fun.update(ctx(lay.post.x+1,lay.post.z,{focusKey:'summit-kick'}));assert.equal(kickBtn.hidden,false,'the Start prompt shows');assert.equal(scopeBtn.hidden,true,'one prompt at a time');
 // Start → intro card → round.
 store.summitActions.startKick();assert.equal(store.kickStore.get().phase,'intro');assert.equal(scene.children.length,before,'no hoops until the round starts');
 store.summitActions.beginRound();assert.deepEqual(sessions,['kick'],'the board token is requested as the round starts');
 const hoops=scene.getObjectByName('summit-kick-hoops');assert(hoops);assert.equal(hoops.children.filter(m=>m.name.startsWith('summit-kick-hoop-')).length,5,'5 hoop meshes');
 assert.equal(new Set(hoops.children.filter(m=>m.isMesh&&m.name.startsWith('summit-kick-hoop-')).map(m=>m.geometry)).size,1,'one shared geometry');
 fun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/60);assert.deepEqual(moved[0],lay.spot,'moved to the kick spot');
 const S=lay.spot;fun.update(ctx(S.x,S.z));
 // Kick 1: through the low-left hoop.
 const h=lay.hoops[0],at=(d)=>({mode:'shot',x:h.x-lay.side*d,y:h.y,z:h.z});
 fun.ball({mode:'attached',x:S.x,y:lay.ground+.2,z:S.z},S);fun.ball(at(1),S);fun.ball(at(-.4),S);
 assert.equal(store.kickStore.get().hits,1);assert.equal(store.kickStore.get().kicks,1);
 assert(env.counts.events.some(e=>e==='fi2-vending-cue:pop'),'a pop sound');
 // The other four, one kick each.
 for(const g of lay.hoops.slice(1)){fun.ball({mode:'return',x:S.x,y:1,z:S.z},S);fun.ball({mode:'attached',x:S.x,y:1,z:S.z},S);fun.ball({mode:'shot',x:g.x-lay.side,y:g.y,z:g.z},S);fun.ball({mode:'shot',x:g.x+lay.side*.3,y:g.y,z:g.z},S);}
 fun.update(ctx(S.x,S.z));const v=store.kickStore.get();
 assert.equal(v.phase,'done');assert.equal(v.result.hits,5);assert.equal(v.result.end,'perfect');assert(v.result.score>=600);
 await new Promise(r=>setImmediate(r));
 assert(paid.some(p=>p.kind==='run'&&p.id.startsWith('summit-kick:')&&p.amount===14&&p.game==='island'),'the round pays 14 through the wallet');
 assert(paid.some(p=>p.kind==='once'&&p.id==='learn:explore:summit-kick-perfect'),'and the one-off 5/5 learning reward');
 assert.equal(JSON.parse(env.store.get('fi2-summit-kick-v1')).best,v.result.score,'best saved');
 // Exit: everything built for the round is gone.
 store.summitActions.exitKick();assert.equal(scene.children.length,before,'hoops disposed on exit');assert.equal(store.kickStore.get().phase,'idle');
 // Leaving the pitch mid-round ends it.
 store.summitActions.startKick();store.summitActions.beginRound();fun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/60);fun.update(ctx(S.x,S.z));fun.update(ctx(S.x+200,S.z));
 assert.equal(store.kickStore.get().result.end,'left');store.summitActions.exitKick();
 fun.dispose();assert.equal(scene.children.length,before);
 assert.equal(env.counts.raf,0,'still no rAF');
});

await ok('wiring: Town, world, saves, HUD, npm test',()=>{
 const town=read('components/Town.tsx'),world=read('lib/town/world.ts');
 assert(/createSummitActivities\(scene/.test(town)&&/summitFun\.holdPlayer\(/.test(town)&&/summitFun\.ball\(walkBall\.state,ballPlayer\)/.test(town)&&/summitFun\.applyCamera\(/.test(town)&&/summitFun\.update\(/.test(town)&&/summitFun\.dispose\(\)/.test(town));
 assert(/<SummitKickHud\/>/.test(town)&&/buildSummitActivityProps\(/.test(world));
 const S=load('lib/saves/snapshot.ts');assert(S.SYNC_KEYS.includes(K.KICK_SAVE_KEY),'the best score syncs with the save code');
 const hud=read('components/SummitKickHud.tsx');assert(/HighScoreEntry/.test(hud)&&/dynamic\(/.test(hud)&&/game="kick"/.test(hud),'the initials picker, lazy');
 assert(/data-summit-kick-start/.test(hud)&&/Start the Summit Kick/.test(hud));
 const rt=read('lib/graphics/summitActivities.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');assert(!/requestAnimationFrame|setInterval|setTimeout/.test(rt),'no loops or timers in the runtime');
 assert(/node tests\/summit-kick\.cjs/.test(read('package.json')));
});

console.log(failed?`\nsummit-kick: ${failed} failed`:'\nsummit-kick: all passed');process.exit(failed?1:0);
})();
