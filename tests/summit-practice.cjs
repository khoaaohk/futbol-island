// Summit 5s practice area (owner, Nov 24 2026). Run: node tests/summit-practice.cjs
//  1. drills: real football drills with a coaching tip, every prop inside the pitch and out of the goal mouths, 6-10 balls
//  2. the drill persists until Shuffle (first visit random), Shuffle picks another and drops the old drill's edit
//  3. edit ops: drag snaps to 0.5 m and stays in the pitch, rotate / colour, remove, add (caps, free spot), reset, save sanitize
//  4. ball physics: fence and netting bounce, over the fence → home, goals count, cones topple, mannequins wobble and settle, sleep
//  5. the runtime: idle costs nothing; entering builds ≤ +3 draws (≤ +5 editing), hides the HUD (data-practice), stows a ride;
//     a touched ball is taken (your ball stays on the pitch), exit restores walking + your own ball; the editor holds the player,
//     drags / adds / removes / resets and persists per drill; leaving disposes everything; no rAF, timers or network
//  6. wiring: Town, the HUD, globals.css, SYNC_KEYS, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader,browser}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const SP=load('lib/town/summitPractice.ts'),SI=load('lib/town/summitIsle.ts');
const P=SI.SUMMIT_PITCH,G=SI.PITCH_HEIGHT;
const seq=(...v)=>{let i=0;return()=>v[i++%v.length];};

(async()=>{
await ok('drills: six real drills, tips, props inside the pitch, 6-10 balls, caps',()=>{
 assert.equal(SP.DRILLS.length,6);assert.equal(new Set(SP.DRILL_IDS).size,6);
 for(const d of SP.DRILLS){
  assert(d.tip.length>30&&d.tip.includes(':'),`${d.id}: a coaching point`);
  assert(SP.layoutInBounds(d.props),`${d.id}: inside the pitch and out of the goal mouths`);
  const n=k=>SP.countKind(d.props,k);
  assert(n('ball')>=6&&n('ball')<=10,`${d.id}: 6-10 balls (${n('ball')})`);
  assert(n('cone')>=4&&n('cone')<=SP.PRACTICE_LIMITS.cone,`${d.id}: cones`);assert(n('man')<=SP.PRACTICE_LIMITS.man);
  for(const p of d.props){const w=SP.toWorld(p.u,p.v);assert(SP.insidePracticeFence(w.x,w.z,.5),`${d.id}: ${p.k} inside the fence`);}}
 assert(SP.DRILLS.some(d=>SP.countKind(d.props,'man')>=4),'a free-kick wall of mannequins');
 assert.match(SP.drillById('slalom').tip,/both feet/);assert.match(SP.drillById('wall').tip,/curl it round|dink/);
});

await ok('persistence: first visit random and saved; same drill again; Shuffle picks another and drops the old edit',()=>{
 let s=SP.emptyPracticeSave();const a=SP.enterDrill(s,seq(.5));s=a.save;assert(SP.DRILL_IDS.includes(a.drill));assert.equal(s.drill,a.drill);
 for(let i=0;i<5;i++)assert.equal(SP.enterDrill(s,Math.random).drill,a.drill,'same drill until Shuffle');
 const edited=SP.layoutFor(s,a.drill);SP.moveProp(edited,0,1,1);s=SP.saveLayout(s,a.drill,edited);
 assert.deepEqual(SP.layoutFor(s,a.drill),edited,'the edit is the layout on the pitch');
 const round=SP.sanitizePracticeSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(round,s,'save round-trips');
 for(let i=0;i<20;i++){const b=SP.shuffleDrill(s,Math.random);assert.notEqual(b.drill,a.drill,'another drill');assert.equal(b.save.layouts[a.drill],undefined,'old edit dropped');}
 assert.deepEqual(SP.sanitizePracticeSave({drill:'nope',layouts:{slalom:[{k:'cone',u:999,v:NaN},{k:'x'},{k:'man',u:0,v:0,yaw:'a'}]}}),{v:1,drill:'',layouts:{slalom:[{k:'man',u:0,v:0,yaw:0}]}});
 assert.deepEqual(SP.sanitizePracticeSave('garbage'),SP.emptyPracticeSave());
});

await ok('edit ops: snap, clamp, goal mouths, rotate, colour, remove, add caps, reset',()=>{
 const ps=SP.layoutFor(SP.emptyPracticeSave(),'wall');const mi=ps.findIndex(p=>p.k==='man'),ci=ps.findIndex(p=>p.k==='cone');
 SP.moveProp(ps,ci,2.26,-3.74);assert.deepEqual([ps[ci].u,ps[ci].v],[2.5,-3.5],'snapped to 0.5 m');
 SP.moveProp(ps,ci,99,-99);assert(Math.abs(ps[ci].u)<=SP.HALF_U&&Math.abs(ps[ci].v)<=SP.HALF_V,'inside the pitch');
 SP.moveProp(ps,ci,P.length/2,0);assert(ps[ci].u<=P.length/2-1.2,'kept out of the goal mouth');
 const y0=ps[mi].yaw;SP.rotateProp(ps,mi);assert(Math.abs(((ps[mi].yaw-y0)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI/4)<1e-6,'mannequin turns 45°');
 const c0=ps[ci].c;SP.rotateProp(ps,ci);assert.notEqual(ps[ci].c,c0,'cone colour');
 const n=ps.length;SP.removeProp(ps,ci);assert.equal(ps.length,n-1);
 const i=SP.addProp(ps,'ball',5,0);assert(i>=0);assert(ps.every((p,j)=>j===i||Math.hypot(p.u-ps[i].u,p.v-ps[i].v)>=.9),'added on a free spot');
 while(SP.countKind(ps,'man')<SP.PRACTICE_LIMITS.man)assert(SP.addProp(ps,'man',0,0)>=0);
 assert.equal(SP.addProp(ps,'man',0,0),-1,'mannequin cap');assert(SP.layoutInBounds(ps));
 let s=SP.saveLayout({v:1,drill:'wall',layouts:{}},'wall',ps);s=SP.resetLayout(s,'wall');assert.deepEqual(SP.layoutFor(s,'wall'),SP.drillById('wall').props,'reset = default');
 assert.equal(SP.pickProp(ps,ps[i].u+.2,ps[i].v,.55),i);assert.equal(SP.pickProp(ps,30,30,.55),-1);
});

const run=(w,sec,out=SP.createPracticeStep())=>{let goals=0,knocks=0,wobbles=0;for(let t=0;t<sec;t+=1/60){SP.stepPractice(w,1/60,out);goals+=out.goals;knocks+=out.knocks;wobbles+=out.wobbles;}return {goals,knocks,wobbles,out};};
await ok('physics: fence bounce, over the fence → home, goals, cones, mannequins, sleep',()=>{
 const one=(u,v,props=[])=>SP.buildPracticeWorld([...props,{k:'ball',u,v}]);
 let w=one(0,0);SP.kickBall(w.balls[0],0,0,25);run(w,12);assert(SP.ballsInBounds(w),'bounced off the rail');assert(!w.balls[0].awake,'asleep after rolling');
 w=one(0,0);SP.kickBall(w.balls[0],0,9,14);let out=SP.createPracticeStep(),gone=false;for(let t=0;t<3;t+=1/60){SP.stepPractice(w,1/60,out);if(!SP.insidePracticeFence(w.balls[0].x,w.balls[0].z,-.3))gone=true;}
 assert(gone,'chipped over the rail');run(w,3);assert(Math.hypot(w.balls[0].x-w.balls[0].hx,w.balls[0].z-w.balls[0].hz)<1e-9,'back on its spot');
 w=one(12,0);SP.kickBall(w.balls[0],18,1.5,0);let r=run(w,2);assert.equal(r.goals,1,'one goal in the east net');assert(SP.ballsInBounds(w),'stopped by the net');
 w=one(-12,.5);SP.kickBall(w.balls[0],-18,1,0);assert.equal(run(w,2).goals,1,'west goal too');
 w=one(14,4.5);SP.kickBall(w.balls[0],14,1,0);assert.equal(run(w,2).goals,0,'wide of the post: no goal');
 w=one(0,0,[{k:'cone',u:4,v:0,c:'orange'}]);SP.kickBall(w.balls[0],8,0,0);r=run(w,1);assert.equal(r.knocks,1);assert.equal(w.cones[0].down,1);assert.equal(w.cones[0].fall,1,'toppled');
 w=one(0,0,[{k:'man',u:5,v:0,yaw:0}]);SP.kickBall(w.balls[0],10,0,0);r=run(w,.8);assert(r.wobbles>=1,'wobbles');assert(w.balls[0].vx<0||w.balls[0].x<5,'bounced back');run(w,4);assert.equal(w.men[0].tilt,0,'springs back upright');
 w=SP.buildPracticeWorld([{k:'ball',u:0,v:0},{k:'ball',u:3,v:0}]);SP.kickBall(w.balls[0],6,0,0);run(w,.8);assert(w.balls[1].x>P.x+3.01,'ball knocks ball');
 const s=SP.createPracticeStep();SP.stepPractice(SP.buildPracticeWorld(SP.drillById('rondo').props),1/60,s);assert.equal(s.moving,false,'a resting drill does no work');
});

// ---- the runtime on real three.js
const env=browser();const T=await import('three'),BGU=await import('three/examples/jsm/utils/BufferGeometryUtils.js');
const L2=createLoader({'three':T,'three/examples/jsm/utils/BufferGeometryUtils.js':BGU});
const R=L2('lib/graphics/summitPractice.ts'),ST=L2('lib/town/summitPracticeStore.ts'),SP2=L2('lib/town/summitPractice.ts');
globalThis.sessionStorage={getItem:()=>null,setItem(){}};
const attrs=new Set();const rootEl={setAttribute:k=>attrs.add(k),removeAttribute:k=>attrs.delete(k)};
function rig(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1.6,.1,500);camera.position.set(500,60,200);camera.lookAt(480,30,170);camera.updateMatrixWorld();
 const me={x:300,y:0,z:0,yaw:0,vx:0,vz:0},log={style:[],stow:0,place:[],goal:0,resets:0};
 const walkBall={state:{x:0,y:0,z:0,vx:0,vy:0,vz:0,mode:'attached'},reset(p){log.resets++;Object.assign(this.state,{x:p.x+Math.sin(p.yaw)*.5,y:p.y+.2,z:p.z+Math.cos(p.yaw)*.5,vx:0,vy:0,vz:0,mode:'attached'});}};
 const rt=R.createSummitPractice(scene,{canvas:()=>null,root:()=>rootEl,walkBall,player:()=>me,place:(x,z,yaw)=>{log.place.push([x,z]);me.x=x;me.z=z;walkBall.reset({...me,yaw});},nudge:(x,z)=>{me.x=x;me.z=z;},
  stowRide:()=>log.stow++,setBallStyle:s=>log.style.push(s),ownBallTint:()=>'#eee4c4',impact(){},goal:()=>log.goal++,wake(){}});
 const frame=(n=1,allowed=true)=>{for(let i=0;i<n;i++){rt.update({dt:1/60,reduced:false,camera,allowed});rt.cameraRestore(camera);rt.cameraApply(camera,1/60,false);}};
 const draws=()=>{let n=0;scene.traverse(o=>{if((o.isMesh||o.isLine)&&o.visible)n++;});return n;};
 return {scene,camera,me,walkBall,rt,frame,draws,log};
}
await ok('runtime: idle is free; entering lays out the saved drill (+3 draws), hides the HUD, stows the ride',async()=>{
 const counts=env.counts;const raf0=counts.raf;
 const {rt,frame,draws,me,log,scene}=rig();
 await env.watchTimers(async()=>{frame(30);});assert.equal(scene.children.length,0,'nothing built off the pitch');assert.equal(rt.active,false);
 me.x=P.x+SI.SUMMIT_FENCE.halfX+3;me.z=P.z;frame(5);assert.equal(rt.active,false,'outside the fence: off');
 me.x=P.x-5;me.z=P.z+2;await env.watchTimers(async()=>frame(1));
 assert.equal(rt.active,true,'on the pitch: practice');assert(attrs.has('data-practice'),'HUD hidden via data-practice');assert.equal(log.stow,1,'ride stowed');
 assert(draws()<=3,`≤ +3 draws (${draws()})`);const v=ST.practiceStore.get();assert.equal(v.mode,'play');assert(v.tip.length>20);assert.equal(v.hello,1);
 const saved=JSON.parse(env.store.get(SP2.PRACTICE_SAVE_KEY));assert.equal(saved.drill,rt.drill,'drill persisted');
 assert.equal(rt.world.balls.length,SP2.countKind(SP2.drillById(rt.drill).props,'ball'));
 assert.equal(counts.raf,raf0,'no rAF');assert.equal(counts.timeout+counts.interval,0,'no timers');
 // Leave by walking off: back to normal; the same drill next time.
 const drill=rt.drill;me.z=P.z+SI.SUMMIT_FENCE.halfZ+2;frame(1);assert.equal(rt.active,false);assert(!attrs.has('data-practice'),'HUD back');assert.equal(scene.children.length,0,'disposed');
 me.x=P.x;me.z=P.z;frame(1);assert.equal(rt.drill,drill,'same drill on return');
 ST.practiceActions.shuffle();assert.notEqual(rt.drill,drill,'Shuffle: another drill');assert.equal(JSON.parse(env.store.get(SP2.PRACTICE_SAVE_KEY)).drill,rt.drill);
 rt.dispose();assert.equal(scene.children.length,0);
});
await ok('runtime: take a touched ball, your own ball stays on the pitch; Exit steps out with your own ball',()=>{
 env.store.clear();ST.practiceStore.reset();attrs.clear();
 const {rt,frame,me,walkBall,log}=rig();me.x=P.x;me.z=P.z;frame(1);assert(rt.active);
 // Your ball is out on a shot; walk onto a loose ball.
 const b=rt.world.balls[2],style=b.style;Object.assign(walkBall.state,{mode:'shot',x:P.x+8,y:G+1,z:P.z,vx:10,vy:2,vz:0});
 me.x=b.x;me.z=b.z-.25;me.yaw=0;frame(1);
 assert.equal(walkBall.state.mode,'attached','the touched ball is at your feet');assert.equal(rt.heldStyle,style,'in its design');
 assert.equal(log.style.at(-1),SP2.PRACTICE_BALL_STYLES[style]);assert.equal(b.style,-1,'your own ball became a loose ball');assert(b.awake&&b.vx>0,'still flying');
 // Dribbling into a ball knocks it on.
 const c=rt.world.balls.find(x=>!x.awake&&x!==b);me.x=c.x;me.z=c.z-.3;me.vz=4;frame(1);assert(c.awake&&c.vz>0,'knocked on');me.vz=0;
 ST.practiceActions.exit();assert.equal(rt.active,false);assert.equal(log.style.at(-1),null,'own ball look restored');assert(!attrs.has('data-practice'));
 assert(log.place.length===1&&!SP2.insidePracticeFence(me.x,me.z,-.35),'stepped out of the gate');assert.equal(walkBall.state.mode,'attached','ball at the feet');
 frame(3);assert.equal(rt.active,false,'no instant re-entry');
 me.x=P.x+10;me.z=P.z;frame(1);assert.equal(rt.active,true,'walk back in: practice again');rt.dispose();
});
await ok('runtime: the editor holds you, drags / adds / removes / resets, persists per drill, ≤ +5 draws',()=>{
 env.store.clear();ST.practiceStore.reset();
 const {rt,frame,me,draws}=rig();me.x=P.x;me.z=P.z;frame(1);const drill=rt.drill;
 ST.practiceActions.edit();assert.equal(rt.editing,true);assert(rt.holdPlayer(),'player held');assert(attrs.has('data-practice-edit'));assert.equal(rt.cameraAngle,'wide','tactical view');
 frame(2);assert(draws()<=5,`≤ +5 draws editing (${draws()})`);
 const before=rt.world.balls.map(b=>[b.x,b.z]);frame(20);assert.deepEqual(rt.world.balls.map(b=>[b.x,b.z]),before,'balls frozen');
 const n=rt.layout.length;ST.practiceActions.add('cone','blue');assert.equal(rt.layout.length,n+1);assert.equal(ST.practiceStore.get().selected,'cone');
 ST.practiceActions.rotate();assert.equal(rt.layout.at(-1).c,'orange','tap action: colour');ST.practiceActions.remove();assert.equal(rt.layout.length,n);
 ST.practiceActions.add('man');assert(ST.practiceStore.get().edited);
 let saved=JSON.parse(env.store.get(SP2.PRACTICE_SAVE_KEY));assert.equal(saved.layouts[drill].length,n+1,'edit saved for this drill');
 ST.practiceActions.done();assert.equal(rt.editing,false);assert.equal(rt.holdPlayer(),false);assert(!attrs.has('data-practice-edit'));
 // Leave and come back: the edited layout is still there.
 me.z=P.z+30;frame(1);me.z=P.z;frame(1);assert.equal(rt.layout.length,n+1,'remembered');
 ST.practiceActions.edit();ST.practiceActions.reset();assert.equal(rt.layout.length,n,'Reset drill');saved=JSON.parse(env.store.get(SP2.PRACTICE_SAVE_KEY));assert.equal(saved.layouts[drill],undefined);
 ST.practiceActions.done();rt.dispose();
});
await ok('runtime: not allowed (jetpack, live match, Summit Kick) → no practice; leaving mid-flight keeps the ball',()=>{
 const {rt,frame,me,log}=rig();me.x=P.x;me.z=P.z;frame(3,false);assert.equal(rt.active,false);
 frame(1,true);assert(rt.active);const r0=log.resets;frame(1,false);assert.equal(rt.active,false);assert.equal(log.resets,r0,'no ball reset while not allowed');rt.dispose();
});

await ok('wiring: Town, HUD, CSS, saves, npm test',()=>{
 const town=read('components/Town.tsx');
 for(const s of ['createSummitPractice(scene','__fi2={summitFun,practice,','practice.holdPlayer()','practice.steer(ix,iz,dt)','practice.cameraRestore(camera)','practice.cameraApply(camera','practice.update({','!practice.busy','<SummitPracticeHud/>','practice.dispose()',"summitFun.kickPhase==='idle'&&!liveJoin.joined"])assert(town.includes(s),s);
 const css=read('app/globals.css');assert(css.includes('.town-app[data-practice] :is(nav[data-hud-triggers]'),'paths / settings hidden');assert(css.includes('.town-app[data-practice-edit]'));
 const hud=read('components/SummitPracticeHud.tsx');for(const s of ['data-practice-cam','data-practice-exit','data-practice-shuffle','data-practice-edit','data-practice-reset','data-practice-done','registerBackCloser'])assert(hud.includes(s),s);
 assert(read('lib/saves/snapshot.ts').includes("'fi2-summit-practice-v1'"),'SYNC_KEYS');
 assert(read('package.json').includes('node tests/summit-practice.cjs'));
 const rt=read('lib/graphics/summitPractice.ts');assert(!/fetch\(|WebSocket|requestAnimationFrame|setInterval|setTimeout/.test(rt),'no network, loops or timers');
 assert(!/\.forEach\(/.test(rt.slice(rt.indexOf('update(f:PracticeFrame)'),rt.indexOf('cameraRestore('))),'no closures in the frame');
});

console.log(failed?`\n${failed} failed`:'\nall passed');process.exit(failed?1:0);
})();
