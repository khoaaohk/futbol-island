// Ball Blaster (Nov 17 2026, docs/arcade-aaa/ballblaster-direction.md): the seeded football gallery shooter. Determinism per seed,
// frame-rate independence (fixed 1/120 s steps), the kick (aim, power, curl), ricochets, chains, shields, the ramp only gets harder,
// bots prove later waves are harder and every run ends, medals sit on bot data, the daily seed, the device save, the wiring and the sound.
//   node tests/ballblaster-core.cjs [--bots]   (--bots prints the bot numbers the medals and the board rate come from)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/ballblaster/core.ts'),{BB,K,SPEC,rampAt,halfW}=C,STEP=BB.step,BOTS=process.argv.includes('--bots');
const read=p=>fs.readFileSync(p,'utf8');
let n=0;const MAIN=require.main===module,ok=(name,fn)=>{if(!MAIN)return;const t0=Date.now();fn();n++;if(BOTS)console.log(`  ${name} (${Date.now()-t0} ms)`);};

/* ---- bots ---- */
/** skill: react = seconds between shots, noise = aim error in metres at 20 m, lead = how well it leads a moving target (0..1). */
const KID={react:1.3,noise:2.3,lead:.2,curl:false},GOOD={react:.62,noise:.55,lead:.85,curl:true},ACE={react:.4,noise:0,lead:1,curl:true};
function playBot(opts,skill,{seed=7,maxWaves=1e9,maxSecs=60*60}={}){
 const g=C.createBallBlaster(opts),s=g.state;let r=seed>>>0||1;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;},gauss=()=>(rnd()+rnd()+rnd()-1.5)*1.4;
 let wait=0,lastWave=0;const leakKinds={};const perWave=[];let leaksIn=0;
 while(!s.over&&s.t<maxSecs&&s.wave<=maxWaves){
  if(s.wave!==lastWave){if(lastWave)perWave.push({wave:lastWave,leaks:leaksIn});lastWave=s.wave;leaksIn=0;}
  wait-=STEP;
  if(wait<=0&&s.rack>0&&(s.mode==='fight'||s.mode==='bonus')){
   // the machine nearest the goal line; in target practice, the target that has been up longest
   let t=null;for(const e of s.ents)if(e.on&&C.isMachine(e.kind)&&e.z>BB.spawnZ+2&&(!t||e.z>t.z))t=e;
   if(!t&&s.mode==='bonus')for(const e of s.ents)if(e.on&&e.kind===K.target&&(!t||e.t>t.t))t=e;
   if(t){const d=Math.hypot(t.x-BB.kx,t.z-BB.kz),pw=d>14?1:.7,v=Math.max(BB.vMin,Math.min(BB.vMax,(BB.vMin+(BB.vMax-BB.vMin)*pw)*(.55+.45*Math.min(1,d/28)))),T=d/v;
    const slow=s.slowT>0?.4:1,ez=t.z+(t.v??t.speed)*slow*T*skill.lead,ex=t.x+(t.tx-t.x)*.5*skill.lead,e=skill.noise*Math.max(.4,d/20);
    const ty=t.kind===K.drone?t.y+.25:t.kind===K.dummy?.8:Math.min(1.1,t.h*.55);
    const curl=t.kind===K.shield&&skill.curl?(t.x>0?-1:1):0;
    g.shoot(ex+gauss()*e,ty,ez+gauss()*e*.6,pw,curl);wait=skill.react*(.8+rnd()*.4);}}
  g.advance(STEP);g.drain(ev=>{if(ev.type==='leak'){leaksIn++;leakKinds[ev.kind]=(leakKinds[ev.kind]||0)+1;}});
 }
 if(lastWave)perWave.push({wave:lastWave,leaks:leaksIn});
 return {g,s,perWave,secs:s.t,leakKinds};
}
module.exports={playBot,KID,GOOD,ACE,C};
const med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
const SEEDS=Array.from({length:16},(_,i)=>11+i*13);

/* ---- checks ---- */
ok('same seed, same run; another seed, another run; the daily seed is one per day for everyone',()=>{
 const run=seed=>{const b=playBot({seed},GOOD,{seed:3,maxSecs:120});return [b.s.score,b.s.wave,b.s.stats.shots,b.s.stats.breaks,b.s.hearts].join();};
 assert.equal(run(42),run(42));assert.ok([43,44,45].some(x=>run(x)!==run(42)));
 assert.equal(C.ballblasterDailySeed('2026-11-17'),C.ballblasterDailySeed('2026-11-17'));assert.notEqual(C.ballblasterDailySeed('2026-11-17'),C.ballblasterDailySeed('2026-11-18'));
});
ok('frame-rate independence: 30, 60 and 144 fps with the same shots give the same run',()=>{
 const shots=[[2.0,0,1,-20,.5,0],[2.6,-3,1,-26,1,.8],[3.1,2,1,-18,.2,-1],[4.4,0,.8,-30,.9,0],[5.0,1,1,-15,.6,.3]];
 const run=fps=>{const g=C.createBallBlaster({seed:9});let i=0;for(let f=1;f<=8*fps;f++){const end=f/fps;while(i<shots.length&&shots[i][0]<end){g.advance(shots[i][0]-g.clock);g.shoot(...shots[i].slice(1));i++;}g.advance(end-g.clock);g.drain(()=>{});}
  const s=g.state;return [s.t.toFixed(4),s.score,s.stats.hits,s.ents.filter(e=>e.on).map(e=>e.z.toFixed(4)).join('|'),s.balls.filter(b=>b.on).map(b=>b.x.toFixed(4)).join('|')].join();};
 const a=run(30),b=run(60),c=run(144);assert.equal(a,b);assert.equal(b,c);
});
/** an empty pitch with one thing placed */
function lab(kind,x,z,extra={}){const g=C.createBallBlaster({seed:5});g.advance(1.3);g.drain(()=>{});const s=g.state;for(const e of s.ents)e.on=false;s.spawnI=s.spawnN;s.mode="break";s.modeT=1e9;
 const e=s.ents[0];Object.assign(e,{on:true,dead:false,kind,id:999,x,y:kind===K.drone?2.1:0,z,r:SPEC[kind].r,h:SPEC[kind].h,hp:SPEC[kind].hp,max:SPEC[kind].hp,t:0,ph:0,tx:x,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,phase:0},extra);return {g,s,e};}
const fly=(g,secs,ev=[])=>{for(let i=0;i<secs/STEP;i++){g.advance(STEP);g.drain(e=>ev.push({...e}));}return ev;};
ok('the kick: a shot lands on the aim point; more charge is faster and flatter; a curl bends in from the side and still arrives',()=>{
 const g=C.createBallBlaster({seed:1}),L=[],out=new Float32Array(300);
 for(const p of [0,.5,1]){g.launch(2,.7,-20,p,0,L);const v=Math.hypot(L[3],L[5]);const T=Math.hypot(2-BB.kx,-20-BB.kz)/v;const x=L[0]+L[3]*T,z=L[2]+L[5]*T,y=L[1]+L[4]*T-.5*BB.g*T*T;assert.ok(Math.abs(x-2)<1e-6&&Math.abs(z+20)<1e-6&&Math.abs(y-.7)<1e-6,'lands on the aim at power '+p);}
 const soft=[],hard=[];g.launch(0,.7,-20,0,0,soft);g.launch(0,.7,-20,1,0,hard);assert.ok(Math.abs(hard[5])>Math.abs(soft[5])*1.6&&hard[4]<soft[4],'charge = faster, flatter');
 const c=[];g.launch(0,.7,-20,.5,1,c);assert.ok(c[3]<-2,'a right curl starts out left');assert.ok(c[6]>0,'and bends right');
 const k=g.predict(0,.7,-20,.5,1,out,100);assert.ok(k>20,'the aim arc has points');
 {const {g,s,e}=lab(K.robot,0,-20);g.shoot(0,.7,-20,.5,1);const ev=fly(g,2);assert.ok(ev.some(x=>x.type==='break'&&x.kind===K.robot),'the curl still hits what you aimed at');}
});
ok('hits: a robot breaks and pays, armour takes two, a power shot breaks armour at once, glass lets the ball through',()=>{
 {const {g,s}=lab(K.robot,0,-15);g.shoot(0,.7,-15,.5,0);const ev=fly(g,2);const b=ev.find(x=>x.type==='break');assert.ok(b&&b.points===100);assert.equal(s.score,100);assert.equal(s.stats.machines,1);}
 {const {g,s,e}=lab(K.armour,0,-15);g.shoot(0,.8,-15,.4,0);let ev=fly(g,2);assert.ok(ev.some(x=>x.type==='hit')&&e.on,'armour survives one');g.shoot(0,.8,-15,.4,0);ev=fly(g,2);assert.ok(!e.on);}
 {const {g,e}=lab(K.armour,0,-15);g.shoot(0,.8,-15,1,0);fly(g,2);assert.ok(!e.on,'a full-charge shot breaks armour');}
 {const {g,s}=lab(K.glass,0,-12);const r2=s.ents[1];Object.assign(r2,{on:true,dead:false,kind:K.robot,id:1000,x:0,y:0,z:-18,r:.48,h:1.5,hp:1,max:1,t:0,ph:0,tx:0,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,phase:0});
  g.shoot(0,.7,-18,1,0);const ev=fly(g,2);assert.equal(ev.filter(x=>x.type==='break').length,2,'glass, then the robot behind it');const t=ev.find(x=>x.type==='trick');assert.ok(t&&t.a===2&&t.points===BB.trickBonus,'one ball, two breaks: a trick bonus');}
});
ok('shields: a straight shot bounces off; a curl gets round; so does a ricochet off the side board',()=>{
 {const {g,s,e}=lab(K.shield,0,-16);g.shoot(0,.8,-16,.6,0);const ev=fly(g,2);assert.ok(ev.some(x=>x.type==='block')&&e.on,'blocked');assert.equal(s.stats.blocks,1);}
 {const {g,e}=lab(K.shield,0,-16);g.shoot(0,.8,-16,.6,1);fly(g,2);assert.ok(!e.on,'the curl beats the shield');}
 {const {g,s,e}=lab(K.shield,1.5,-22);const w=halfW(-12)+C.BOARD_OUT;g.shoot(w+1,.8,-12,1,0);const ev=fly(g,3);assert.ok(ev.some(x=>x.type==='bounce'&&x.kind===1),'off the board');}
});
ok('chains: a barrel bursts and breaks what stands near it; a toppled tower knocks over the robot behind it',()=>{
 {const {g,s}=lab(K.barrel,0,-16);for(const [i,dx] of [[1,1.4],[2,-1.6]])Object.assign(s.ents[i],{on:true,dead:false,kind:K.robot,id:1000+i,x:dx,y:0,z:-16.5,r:.48,h:1.5,hp:1,max:1,t:0,ph:0,tx:dx,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,phase:0});
  g.shoot(0,.6,-16,.5,0);const ev=fly(g,2);assert.ok(ev.some(x=>x.type==='boom'));assert.equal(ev.filter(x=>x.type==='break').length,3,'barrel + two robots');assert.ok(ev.some(x=>x.type==='trick'&&x.a===3));assert.ok(ev.filter(x=>x.type==='break').pop().a>=3,'the combo climbs');}
 {const {g,s}=lab(K.tower,0,-14);Object.assign(s.ents[1],{on:true,dead:false,kind:K.robot,id:1001,x:0,y:0,z:-16,r:.48,h:1.5,hp:1,max:1,t:0,ph:0,tx:0,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,phase:0});
  g.shoot(0,1.2,-14,.9,0);const ev=fly(g,2);assert.ok(ev.some(x=>x.type==='topple'));assert.equal(ev.filter(x=>x.type==='break').length,2,'tower + robot');}
});
ok('power-ups: a gold crate gives one; multi-ball fires three balls for one from the rack; slow-mo slows the march',()=>{
 const {g,s,e}=lab(K.crate,0,-12,{gold:true});g.shoot(0,.5,-12,.5,0);const ev=fly(g,2);const p=ev.find(x=>x.type==='power');assert.ok(p&&p.a>=1&&p.a<=4);assert.equal(s.stats.powers,1);
 s.power=C.P.multi;s.powerN=4;const rack=s.rack;g.shoot(0,1,-20,.5,0);assert.equal(s.balls.filter(b=>b.on).length,3);assert.equal(s.rack,rack-1);
 {const a=lab(K.robot,0,-30,{speed:2}),b=lab(K.robot,0,-30,{speed:2});b.s.slowT=5;fly(a.g,1);fly(b.g,1);assert.ok(b.e.z-(-30)<(a.e.z-(-30))*.5,'slow-mo');}
});
ok('the rack: six balls, an empty rack says so, one ball rolls back in about every 0.7 s',()=>{
 const g=C.createBallBlaster({seed:3}),s=g.state;assert.equal(s.rack,6);for(let i=0;i<6;i++)assert.ok(g.shoot(0,1,-20,.5,0));assert.equal(g.shoot(0,1,-20,.5,0),false);const ev=[];g.drain(e=>ev.push(e.type));assert.ok(ev.includes('empty'));
 g.advance(BB.refill*3+.01);assert.equal(s.rack,3);
});
ok('the ramp only gets harder: more machines, shorter gaps, faster, more groups; it keeps creeping after the caps',()=>{
 let prev=rampAt(1);for(let w=2;w<=80;w++){const r=rampAt(w);assert.ok(r.count>=prev.count&&r.gap<=prev.gap&&r.speed>prev.speed&&r.group>=prev.group,`wave ${w}`);prev=r;}
 assert.ok(rampAt(40).speed>rampAt(20).speed&&rampAt(40).count>rampAt(20).count,'still creeping late');
 const waves=C.UNLOCK.map(u=>u.wave);assert.equal(new Set(waves).size,waves.length,'one new machine at a time');assert.ok(C.isBossWave(5)&&C.isBossWave(10)&&!C.isBossWave(6));
});
ok('the boss: Mega Mannequin on every fifth wave, three phases, and it calls cone-bots in phase two',()=>{
 const {g,s,e}=lab(K.boss,0,-30,{hp:12,max:12,speed:.01});const ev=[];for(let i=0;i<5;i++){e.lastBall=-1;e.hp-=1;}
 g.shoot(0,1.5,-30,1,0);fly(g,2,ev);assert.ok(ev.some(x=>x.type==='boss'&&x.a===1),'phase two');fly(g,5,ev);assert.ok(s.ents.some(x=>x.on&&x.kind===K.cone),'helpers');
 const w=C.createBallBlaster({seed:4,startWave:5});w.advance(2);assert.ok(w.state.ents.some(x=>x.on&&x.kind===K.boss),'a boss wave');
});
/* ---- AAA pass (Nov 18 2026): rocket-bots, the super shot, set pieces, target practice, close calls, the run-on ---- */
const put=(s,i,kind,x,z,extra={})=>Object.assign(s.ents[i],{on:true,dead:false,kind,id:2000+i,x,y:0,z,r:SPEC[kind].r,h:SPEC[kind].h,hp:SPEC[kind].hp,max:SPEC[kind].hp,t:0,ph:0,tx:x,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,v:0,phase:0},extra);
ok('rocket-bots: a readable tell (it stands still for about a second), then a dash, then a walk; stopping it in the tell pays extra',()=>{
 {const {g,e}=lab(K.rocket,0,-26,{speed:3});let ev=fly(g,.5);assert.ok(ev.some(x=>x.type==='tell'),'the tell');assert.equal(e.v,0,'it stands while it winds up');const z0=e.z;fly(g,.9);assert.ok(Math.abs(e.z-z0)<1e-9,'still standing');
  ev=fly(g,.4);assert.ok(ev.some(x=>x.type==='dash'),'the dash');assert.equal(e.v,9.5);fly(g,1.2);assert.ok(e.z>z0+9&&e.z<z0+13,'about eleven metres');assert.equal(e.phase,3);assert.equal(e.v,3,'then it walks');assert.ok(e.z<-8,'the dash ends well short of the goal line');}
 {const {g,s,e}=lab(K.rocket,0,-24.9,{speed:3});fly(g,.05);assert.equal(e.phase,1);g.shoot(0,.7,e.z,1,0);const ev=fly(g,1);assert.ok(!e.on,'stopped');const sh=ev.find(x=>x.type==='shout');assert.ok(sh&&sh.word==='STOPPED!'&&sh.points===BB.stopBonus);assert.equal(s.score,SPEC[K.rocket].pts+BB.stopBonus);}
 assert.ok(C.UNLOCK.some(u=>u.k===K.rocket&&u.wave===9),'they join on wave 9');
});
ok('the super shot: breaks fill the meter (faster with a combo), a soft kick keeps it, a full-power kick goes through everything and bursts what it breaks',()=>{
 {const {g,s}=lab(K.robot,0,-15);g.shoot(0,.7,-15,.5,0);fly(g,2);assert.ok(Math.abs(s.sup-(BB.supMachine+BB.supCombo))<1e-9,'one break, one step');}
 {const {g,s}=lab(K.robot,0,-15);s.sup=.99;g.shoot(0,.7,-15,.5,0);const ev=fly(g,2);assert.ok(s.supReady&&s.sup===1);assert.equal(ev.filter(x=>x.type==='super'&&x.a===0).length,1,'ready is called once');}
 {const {g,s}=lab(K.shield,0,-15);put(s,1,K.armour,0,-19);put(s,2,K.robot,1.3,-19.2);s.sup=1;s.supReady=true;
  g.shoot(0,.8,-15,.5,0);assert.ok(s.supReady,'a soft kick does not spend it');fly(g,2);assert.ok(s.ents[0].on,'and the shield still blocks it');
  g.shoot(0,.8,-15,1,0);const ev=[];g.drain(e=>ev.push({...e}));assert.ok(ev.some(x=>x.type==='super'&&x.a===1)&&ev.some(x=>x.type==='shot'&&x.kind===4));assert.ok(!s.supReady&&s.sup===0);assert.equal(s.stats.supers,1);
  fly(g,2,ev);assert.ok(!s.ents[0].on&&!s.ents[1].on,'through the shield and the armour behind it');assert.ok(ev.some(x=>x.type==='boom'&&x.a===1),'a burst');assert.ok(!s.ents[2].on,'the burst takes the robot beside them');}
});
ok('set pieces and the run-on: from wave 3 every wave that is not a boss wave has one set piece, in time order; machines hurry on from the far end',()=>{
 for(let w=1;w<=14;w++)for(const seed of [3,8,21]){const g=C.createBallBlaster({seed,startWave:w});g.advance(1.3);const sp=g.state.spawns.slice(0,g.state.spawnN),said=sp.filter(x=>x.say>0);
  assert.equal(said.length,w>=3&&!C.isBossWave(w)?1:0,`wave ${w}`);for(let i=1;i<sp.length;i++)assert.ok(sp[i].t>=sp[i-1].t-1e-9,'spawn times in order');if(said[0])assert.ok(C.SET_WORD[said[0].say].length>3);}
 {const far=lab(K.robot,0,-40,{speed:1.8}),near=lab(K.robot,0,-20,{speed:1.8});fly(far.g,1);fly(near.g,1);assert.ok(far.e.z>-40+BB.runOn*.99,'it runs on');assert.ok(Math.abs(near.e.z-(-20+1.8))<.02,'then marches');assert.equal(near.e.v,1.8);}
});
ok('target practice: after wave 3 and after every boss, no heart can be lost, twelve targets, the gold one gives a heart back; a close call pays',()=>{
 const g=C.createBallBlaster({seed:6,startWave:3}),s=g.state;g.advance(1.3);for(const e of s.ents)if(C.isMachine(e.kind))e.on=false;s.spawnI=s.spawnN;const ev=[];fly(g,.1,ev);assert.ok(ev.some(x=>x.type==='clear'));assert.ok(s.bonusDue);
 fly(g,2.7,ev);assert.equal(s.mode,'bonus');assert.ok(ev.some(x=>x.type==='bonus'&&x.a===1&&x.word==='TARGET PRACTICE!'));s.hearts=2;let shot=false,seen=0;
 for(let i=0;i<12/STEP&&s.mode==='bonus';i++){const gold=s.ents.find(e=>e.on&&e.kind===K.target&&e.gold);seen=Math.max(seen,s.ents.filter(e=>e.on&&e.kind===K.target).length);if(gold&&!shot&&gold.t>.1){shot=true;g.shoot(gold.x,1.1,gold.z,.7,0);}g.advance(STEP);g.drain(e=>ev.push({...e}));
  assert.ok(!s.ents.some(e=>e.on&&C.isMachine(e.kind)),'no machine walks during target practice');}
 assert.equal(s.bonusI,BB.bonusN);assert.ok(seen>=2&&seen<=5,'a few targets up at a time');assert.ok(ev.some(x=>x.type==='heart'),'the gold target');assert.equal(s.hearts,3);assert.equal(s.stats.heartsBack,1);assert.equal(s.stats.leaks,0);
 assert.ok(ev.some(x=>x.type==='bonus'&&x.a===0&&x.b>=1),'it ends with a count');fly(g,2);assert.equal(s.wave,4,'then the next wave');assert.ok(!s.ents.some(e=>e.on&&e.kind===K.target));
 {const b=C.createBallBlaster({seed:6,startWave:5}),t=b.state;b.advance(1.3);for(const e of t.ents)if(C.isMachine(e.kind))e.on=false;t.spawnI=t.spawnN;b.advance(.1);assert.ok(t.bonusDue,'after a boss too');}
 {const c=C.createBallBlaster({seed:6,startWave:2}),t=c.state;c.advance(1.3);for(const e of t.ents)if(C.isMachine(e.kind))e.on=false;t.spawnI=t.spawnN;c.advance(.1);assert.ok(!t.bonusDue,'not after other waves');}
 {const {g,s}=lab(K.robot,0,-3.5);g.shoot(0,.7,-3.5,.5,0);const e2=fly(g,1);assert.ok(e2.some(x=>x.type==='shout'&&x.word==='CLOSE CALL!'));assert.equal(s.score,100+BB.closeBonus);assert.equal(s.stats.close,1);}
});
ok('AAA wiring: super meter, danger tape, kick buffer and points that fly in the shell; crowd one-shots and the pause hush in the sound; light bands, boss dusk and shock rings in the view',()=>{
 const shell=read('components/games/BallBlasterGame.tsx'),css=read('components/games/BallBlasterGame.module.css'),a=read('lib/arcade/ballblaster/audio.ts'),v=read('lib/arcade/ballblaster/view.ts');
 assert.match(shell,/data-ballblaster-super=/);assert.match(shell,/data-ballblaster-danger/);assert.match(shell,/KICK_BUFFER=320/);assert.match(shell,/'--bb-fx'/);assert.match(shell,/audio\.current\?\.hush\(true\);change\('paused'\)/,'pause silences every tail');
 assert.match(css,/@keyframes bbFly/);assert.match(css,/\.super\[data-ready\]/);assert.match(css,/\.super\[data-ready\],\.alarm,\.heartsWrap\[data-hit\]\{animation:none\}/,'reduced motion');
 for(const cue of ['ready','superReady','tell','dash','danger','close','setPiece','bonus','heart','crowd','cheer','groan','hush'])assert.match(a,new RegExp(`\\b${cue}\\(`),'cue '+cue);assert.match(a,/src\.start\(t,0,d\)/,'the crowd is a one-shot, never a loop');
 assert.match(v,/ink\.uInkBand\.value\.x=\.24\*p\.band/,'the light bands follow the time of day (the kicker reads at night)');assert.match(v,/s\.wave%BB\.bossEvery===0\?3:/,'boss dusk');assert.match(v,/function ringAt\(/);assert.match(v,/function confetti\(/);assert.match(v,/case K\.rocket:/);assert.match(v,/case K\.target:/);
});
ok('bots: later waves are harder (more goals let in), every run ends, the medals sit on bot runs, the board rate holds',()=>{
 // the same good bot dropped into wave 2 and wave 12: it lets in more on the later wave
 const leaks=w=>SEEDS.map((seed,i)=>{const b=playBot({seed,startWave:w},GOOD,{seed:i+1,maxWaves:w});return b.perWave.find(p=>p.wave===w)?.leaks??3;}).reduce((a,b)=>a+b,0);
 const early=leaks(2),late=leaks(12);if(BOTS)console.log(JSON.stringify({leaksWave2:early,leaksWave12:late}));assert.ok(late>early,`later is harder (${early} -> ${late})`);
 const kid=SEEDS.map((seed,i)=>playBot({seed},KID,{seed:i+1})),good=SEEDS.map((seed,i)=>playBot({seed},GOOD,{seed:i+31})),ace=SEEDS.slice(0,6).map((seed,i)=>playBot({seed},ACE,{seed:i+61}));
 for(const b of [...kid,...good,...ace])assert.ok(b.s.over,`every run ends (wave ${b.s.wave}, ${b.secs.toFixed(0)} s)`);
 const ks=kid.map(b=>b.s.score),gs=good.map(b=>b.s.score),as=ace.map(b=>b.s.score);
 if(BOTS)console.log(JSON.stringify({kidMedian:med(ks),kidMax:Math.max(...ks),kidWave:med(kid.map(b=>b.s.wave)),kidSecs:Math.round(med(kid.map(b=>b.secs))),goodMedian:med(gs),goodMax:Math.max(...gs),goodWave:med(good.map(b=>b.s.wave)),goodSecs:Math.round(med(good.map(b=>b.secs))),
  aceMedian:med(as),aceMax:Math.max(...as),aceWave:med(ace.map(b=>b.s.wave)),aceSecs:Math.round(med(ace.map(b=>b.secs))),rate:Math.max(...[...kid,...good,...ace].map(b=>b.s.score/b.secs)).toFixed(1),medals:BB.medals}));
 assert.ok(ks.filter(x=>x>=BB.medals[0]).length>=ks.length*.3,'Bronze is reachable for a first-time child in a few tries');assert.ok(med(ks)<BB.medals[1],'Silver is not a kid run');
 assert.ok(med(gs)>=BB.medals[1],'a good player is past Silver');assert.ok(gs.filter(x=>x>=BB.medals[2]).length<=gs.length*.6,'Gold is a stretch');assert.ok(Math.max(...gs,...as)>=BB.medals[2],'but reachable');
 const L=require('../lib/arcade/leaderboard.ts'),R=L.BOARD_RULES.ballblaster;if(R)for(const b of [...kid,...good,...ace])assert.ok(b.s.score<=R.base+R.perSecond*b.secs,`board rate holds (${b.s.score} in ${b.secs.toFixed(0)} s)`);
});
ok('device save: best, medal, daily claim and day streak, near-miss and coach lines',()=>{
 const S=require('../lib/arcade/ballblaster/save.ts'),stats={shots:40,hits:30,breaks:30,machines:22,props:8,tricks:2,bestTrick:3,bestCombo:4,waves:4,bosses:0,powers:1,leaks:3,curls:2,blocks:1};
 let st=S.settleBallblaster(S.emptyBallblasterSave(),{score:9000,daily:false,day:'2026-11-17',wave:5,stats});assert.ok(st.newBest&&st.newMedal);assert.equal(st.save.best,9000);assert.equal(st.save.medal,1);assert.equal(st.save.wave,5);
 st=S.settleBallblaster(st.save,{score:500,daily:true,day:'2026-11-17',wave:2,stats});assert.ok(st.dailyFirst);assert.equal(st.save.best,9000,'a daily run does not touch the endless best');assert.equal(st.streak,1);
 const again=S.settleBallblaster(st.save,{score:900,daily:true,day:'2026-11-17',wave:3,stats});assert.equal(again.dailyFirst,false);assert.equal(again.dailyBest,900);
 const next=S.settleBallblaster(again.save,{score:10,daily:true,day:'2026-11-18',wave:1,stats});assert.equal(next.streak,2);assert.equal(S.liveStreak(next.save,'2026-11-20'),0);
 assert.equal(S.sanitizeBallblasterSave({best:-5,medal:99}).best,0);assert.equal(S.sanitizeBallblasterSave({medal:99}).medal,3);
 assert.match(S.nearMissLine({score:7500,best:0,newBest:true,daily:false,stats}),/500 points from Bronze/);assert.match(S.nearMissLine({score:9000,best:9300,newBest:false,daily:false,stats}),/300 points from your best/);
 for(const k of [K.robot,K.cone,K.dummy,K.drone,K.shield,K.dodger,K.armour,K.boss,0])assert.ok(S.coachLine(stats,k).length>10);assert.ok(S.BALLBLASTER_TIPS.length>=5);
});
ok('arcade wiring: last in the back row, board, coins, save key, last score, room route, analytics, SQL',()=>{
 const L=require('../lib/arcade/leaderboard.ts'),{arcadeCabinets,ARCADE_ROW}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
 const {isSyncKey}=require('../lib/saves/snapshot.ts'),{LAST_SCORE_GAMES}=require('../lib/arcade/lastScore.ts');
 const cab=arcadeCabinets.find(c=>c.id==='ballblaster');assert.ok(cab,'a cabinet');assert.equal(ARCADE_ROW[ARCADE_ROW.length-1],'ballblaster','last in the row (Nov 18 2026: the retired side-scroller\'s place)');assert.equal(ARCADE_ROW[ARCADE_ROW.length-2],'rollball');assert.equal(cab.lesson,'Pick your target. Strike through the ball.');
 assert.ok(L.BOARD_GAMES.includes('ballblaster')&&L.HALL_MACHINES.includes('ballblaster'),'one all-time board, in the Hall');assert.equal(L.BOARD_TIER_TABS.ballblaster,undefined,'no second (daily) board');
 assert.equal(arcadeCoinTarget('ballblaster',{points:8000}),4);assert.equal(arcadeCoinTarget('ballblaster',{points:1e7}),ARCADE_COIN_CAPS.ballblaster);assert.equal(C.ballblasterCoins(8000),4);
 assert.ok(isSyncKey('fi2-ballblaster-v1'),'the save travels with the player');assert.ok(LAST_SCORE_GAMES.includes('ballblaster')&&LAST_SCORE_GAMES.includes('ballblaster_daily'));
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/import\('\.\/games\/BallBlasterGame'\)/);assert.match(room,/game==='ballblaster'\?<BallBlaster onExit=\{back\}\/>/);
 assert.match(read('lib/analytics/islandIds.ts'),/'rollball','ballblaster'/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_ballblaster','Arcade: Ball Blaster'\]/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'ballblaster'/,'results-first high-score strip');assert.match(read('components/games/skins/index.ts'),/ballblaster:ballblaster\.skin/);
 const own=read('docs/arcade-aaa/ballblaster-supabase.sql'),list=/check \(game in \(([^)]*)\)\)/.exec(own.replace(/--.*$/gm,''))[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES].filter(g=>list.includes(g)).length===list.length?list:[],'the owner file names known boards');
 for(const g of L.BOARD_GAMES.filter(g=>g!=='rollball'&&g!=='keepyuppy'&&g!=='holdtheline'&&g!=='footgolf'&&g!=='flickit'&&g!=='popup'/* Nov 21 2026: Pop-Up Shot's board comes in docs/arcade-aaa/new-games-nov22-supabase.sql */))assert.ok(list.includes(g),'the owner file names '+g);
 assert.match(own,/'arcade_streetdash','arcade_ballblaster'/);assert.match(own,/prosrc like '%arcade_ballblaster%'/);assert.match(own,/OK, Ball Blaster installed/);
 assert.match(read('supabase/migrations/20261204_analytics_ballblaster.sql'),/'arcade_streetdash','arcade_rollball','arcade_ballblaster'/);{const mig=read('supabase/migrations/20261203_ballblaster_boards.sql');for(const g of L.BOARD_GAMES.filter(g=>g!=='rollball'&&g!=='keepyuppy'&&g!=='holdtheline'&&g!=='footgolf'&&g!=='flickit'&&g!=='popup'))assert.ok(mig.includes(`'${g}'`),'migration names '+g);}
 const shell=read('components/games/BallBlasterGame.tsx');assert.match(shell,/beginBoardSession\('ballblaster'\)/);assert.match(shell,/!r\.daily\|\|settled\.dailyFirst/,'only the first daily run posts');assert.match(shell,/data-ballblaster-daily/,'the daily run is offered on the start card');
 assert.match(read('scripts/check-arcade-audio.cjs'),/game==='ballblaster'/);assert.match(read('scripts/check-arcade-load.cjs'),/'rollball','ballblaster'/);
});
ok('sound: one limiter wired to the output only; made on the first tap; no loops',()=>{
 const a=read('lib/arcade/ballblaster/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);assert.match(read('components/games/BallBlasterGame.tsx'),/\(audio\.current\?\?=createBallblasterAudio\(\)\)\.unlock\(\)/);
});
ok('heat: one canvas, the loop only while playing, pixel ratio cap, low-power GL, one shadow light, instancing, pooled pieces, full disposal',()=>{
 const shell=read('components/games/BallBlasterGame.tsx'),view=read('lib/arcade/ballblaster/view.ts');
 assert.equal((shell.match(/<canvas /g)||[]).length,0);assert.equal((view.match(/document\.createElement\('canvas'\)/g)||[]).length,2,'one GL canvas (made per mount) + one texture canvas helper');assert.match(view,/canvas\.remove\(\)/);assert.match(shell,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/,'the loop stops off the pitch');assert.match(shell,/Math\.min\(\.1,\(now-last\.current\)\/1000\)/,'a long frame is clamped');
 assert.match(view,/powerPreference:'low-power'/);assert.match(view,/mobile\?1\.5:2/);assert.equal((view.match(/new T\.DirectionalLight/g)||[]).length,1,'one sun');assert.match(view,/InstancedMesh/);assert.doesNotMatch(view,/EffectComposer|postprocessing/);
 assert.match(view,/const PIECES=\d+/,'pooled pieces');assert.match(view,/forceContextLoss\(\)/);assert.match(view,/dispose\(\)\{/);
 // the kicker is the player's own island bean (shared arcade rig), kicked from the rig's contact phase, and freed with the view
 assert.match(view,/createIslandArcadePlayer\(/);assert.match(view,/useMainAppearance\(\)/);assert.match(view,/kicker\.pose\(/);assert.match(view,/kicker\.dispose\(\)/);assert.equal((view.match(/createIslandArcadePlayer\(/g)||[]).length,1,'one bean');assert.match(shell,/prefers-reduced-motion/);
});
if(MAIN)console.log(`ballblaster-core: ${n} checks passed`);
