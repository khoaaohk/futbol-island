// Futbol Pinball action camera (Oct 26 2026, docs/ARCADE_PINBALL_UPGRADE2_OCT26.md, lib/games/soccerPinballCamera.ts):
// the home framing fills portrait phones (wall to wall, HUD to the pads), pushes in at the flippers / goal without
// sliding the flippers under the pads, follows multiball wide, starts each ball on the plunger lane, eases at capped
// rates, sleeps once settled on the plunger, is fixed under reduced motion, and allocates nothing per frame.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{Math,Number,console,Map,Array,Object,String,Float32Array,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const P=load('lib/games/soccerPinball.ts'),C=load('lib/games/soccerPinballCamera.ts');
const wx=x=>(x-180)/30,wz=y=>(y-310)/30;
function rig(w,h,mobile,reduced=false){const camera=new T.PerspectiveCamera(38,w/h,.1,180),cam=C.createPinballCamera(camera,mobile,reduced);cam.fit(w,h);
 const v=new T.Vector3(),scr=(x,y,z)=>{v.set(x,y,z).project(camera);return{x:(v.x+1)/2*w,y:(1-v.y)/2*h};};return{camera,cam,scr,layout:C.pinballCameraLayout(w,h,mobile)};}
function playing(x=180,y=300,vx=0,vy=0){const s=P.createPinballState();s.phase='playing';Object.assign(s.ball,{x,y,vx,vy});return s;}
const run=(cam,s,seconds,each)=>{for(let t=0;t<seconds;t+=1/60){cam.update(1/60,s);each&&each();}};

// 1. Home framing per size class: goal under the HUD, flipper tips just above the pads, rails on screen, table fills.
for(const [w,h,mobile,fill] of [[390,844,true,true],[360,740,true,true],[430,932,true,true],[390,664,true,true],[820,1180,true,false],[844,390,true,false],[1440,900,false,false]]){
 const {cam,scr,layout}=rig(w,h,mobile),s=playing(180,300);s.phase='lost';cam.snap(s);
 const goal=scr(0,2.1,-8.8),tips=scr(0,.3,8.9),left=scr(-5.33,0,4.8),right=scr(6.2,0,8.5),topLeft=scr(-5.33,0,-10.4);
 const tag=`${w}x${h}`;
 assert.ok(goal.y>=layout.top-3,`${tag}: goal clears the HUD (${goal.y.toFixed(0)} vs ${layout.top})`);
 assert.ok(tips.y<=layout.flip+3,`${tag}: flipper tips sit above the pads (${tips.y.toFixed(0)} vs ${layout.flip})`);
 assert.ok(left.x>=0&&right.x<=w&&topLeft.x>=0,`${tag}: playfield rails stay on screen`);
 // AAA pass 3 (Nov 10 2026): phones under 740 px now lean the camera back under the full-width display (a machine perspective instead of
 // the old flat top-down view), so the near rails span a little less of the width there: 88% is the floor, was 90%.
 if(fill){assert.ok(right.x-left.x>=w*(h<740?.88:.9),`${tag}: table fills the width (${(right.x-left.x).toFixed(0)}/${w})`);// Comic pass (owner, Nov 10 2026: "see more of the bottom of the pinball machine and less of the sign at the top"): the display band is gone, the
  // table starts under the top bar's foot (72 px) and the frame is solved on the drain mouth, so the flippers have clear room below them and the
  // outlanes and drain are in view above the pads. Was: flipper tips pinned just above the pads (tips - goal >= 80% of the band).
  const drain=scr(0,.1,9.87),apron=scr(0,.5,10.5);assert.equal(layout.top,72,`${tag}: the top line is the top bar's foot`);assert.ok(goal.y<=layout.top+(h>=740?h*.06:8),`${tag}: the goal sits right under the top bar (${goal.y.toFixed(0)})`);
  assert.ok(drain.y<=layout.flip+3,`${tag}: the drain mouth is in view above the pads (${drain.y.toFixed(0)} vs ${layout.flip})`);assert.ok(layout.flip-tips.y>=h*.035,`${tag}: clear room under the flipper tips (${(layout.flip-tips.y).toFixed(0)} px)`);if(h>=740)assert.ok(apron.y<=layout.flip+3,`${tag}: tall phones show the apron's foot too (${apron.y.toFixed(0)})`);
  assert.ok(drain.y-goal.y>=(layout.flip-layout.top)*.72,`${tag}: table fills the height (goal to drain; the rest of the band is the apron and the coast)`);}
 else{const band=cam.info().layout;assert.ok(tips.y-goal.y>=(band.flip-band.top)*.9,`${tag}: height-limited screens use the band`);
  // Comic pass: the desktop backbox / backglass is no longer framed (the score is a top-bar chip); the goal sits under the top bar plus 4% of the height
  // kept for the coast, so the table is as large as the screen allows. Was: the whole backbox in frame above the goal.
  if(!mobile){assert.equal(band.backbox,undefined,'no backbox framing');assert.equal(band.top,72+Math.round(h*.04));assert.ok(goal.y<=band.top+6,`${tag}: goal right under the top line (${goal.y.toFixed(0)} vs ${band.top})`);}}
 if(w===1440){const l=scr(wx(99),0,wz(535)),r=scr(wx(261),0,wz(535));assert.ok(l.x>16+260&&r.x<w-16-260,'desktop: flippers sit between the corner pads (max 260 px)');}
}
// Pads band in CSS (120 px + 12 px gap on phones) and the solver agree.
assert.ok(C.pinballCameraLayout(390,844,true).flip<=844-12-120-6,'flipper line above the 120 px pads');

// 2. Push in at the flippers: the flippers stay above the pads and on screen; the ball stays visible.
{const {cam,scr,layout}=rig(390,844,true),s=playing(150,420,40,560);cam.snap(s);let maxStep=0,prevK=cam.info().k;
 run(cam,s,1.2,()=>{const k=cam.info().k;maxStep=Math.max(maxStep,Math.abs(k-prevK));prevK=k;s.ball.y=Math.min(500,s.ball.y+560/60);
  const b=scr(wx(s.ball.x),.25,wz(s.ball.y));assert.ok(b.y<=layout.safeBottom+2&&b.y>=0&&b.x>=0&&b.x<=390,'ball visible above the pads');});
 assert.equal(cam.shot(),'flippers');assert.ok(cam.info().k>.08,'pushed in toward the flippers');
 for(const x of[99,261]){const p=scr(wx(x),0,wz(535));assert.ok(p.y<layout.safeBottom&&p.x>0&&p.x<390,'flipper pivots stay visible above the pads');}
 assert.ok(maxStep<=.62/60+1e-6,'zoom rate is capped (no lurch)');}
// 3. Goal mouth push, multiball pulls wide, goal celebration then settle.
{const {cam}=rig(390,844,true),s=playing(180,120,0,-500);cam.snap(s);run(cam,s,1);assert.equal(cam.shot(),'goal');assert.ok(cam.info().k>.05);
 s.extraLive=true;Object.assign(s.extra,{x:300,y:450,vx:0,vy:0});run(cam,s,1.5);assert.equal(cam.shot(),'multiball');assert.ok(cam.info().k<.01,'multiball is wide');
 s.extraLive=false;s.phase='goal';s.timer=1.5;cam.update(1/60,s);assert.equal(cam.shot(),'celebrate');run(cam,s,.5);
 // AAA pass 3: the goal push no longer takes the flippers out of frame. It leans in as far as BOTH lines allow (was a free k > .1 push
 // that slid the flipper tips ~80 px under the pads on a phone): crossbar under the display, tips above the pads, on every size.
 assert.ok(cam.info().k>.05,'goal push (as far as the frame lines allow)');
 for(const [w,h,mobile] of [[390,844,true],[375,667,true],[360,640,true],[900,510,true],[1440,900,false],[1920,1080,false]]){const r=rig(w,h,mobile),g=playing(180,120,0,-500);r.cam.snap(g);run(r.cam,g,1);g.phase='goal';g.timer=1.5;
  run(r.cam,g,.9,()=>{const L=r.cam.info().layout,tips=r.scr(0,.3,8.9),bar=r.scr(0,2.1,-8.8);assert.ok(tips.y<=L.safeBottom+2,`${w}x${h}: flipper tips stay above the controls through the goal push (${tips.y.toFixed(0)} vs ${L.safeBottom})`);assert.ok(bar.y>=L.safeTop-2,`${w}x${h}: crossbar stays under the display through the goal push (${bar.y.toFixed(0)} vs ${L.safeTop})`);});
  const rdy=P.createPinballState();r.cam.snap(rdy);const bar=r.scr(0,2.1,-8.8),ballY=r.scr(wx(rdy.ball.x),.25,wz(rdy.ball.y)),L=r.cam.info().layout;assert.ok(bar.y>=L.safeTop-2&&ballY.y<=L.safeBottom+2,`${w}x${h}: the waiting table shows the goal under the display and the ball on the plunger`);}
 s.timer=.4;run(cam,s,1.2);assert.equal(cam.shot(),'wide');assert.ok(cam.info().k<.02,'settles wide');}
// 4. Launch camera: each new ball starts on the plunger lane (ball above the pads), and a waiting table sleeps.
{const {cam,scr,layout}=rig(390,664,true),s=P.createPinballState();cam.snap(s);assert.equal(cam.shot(),'launch');
 const b=scr(wx(s.ball.x),.25,wz(s.ball.y));assert.ok(b.y<=layout.safeBottom+2&&b.x<=390,'ball on the plunger is above the pads');
 cam.update(1/60,s);cam.update(1/60,s);assert.equal(cam.moving(),false,'settled launch camera lets the ready table sleep');
 P.launchPinball(s);cam.update(1/60,s);assert.equal(cam.moving(),true,'launch eases to the table');
 run(cam,s,.8,()=>{s.ball.y=Math.max(160,s.ball.y-900/60);const t=scr(0,.3,8.9);assert.ok(t.y<=layout.safeBottom+2,'flippers stay above the pads while the camera follows the lane');});}
// 5. Reduced motion: one fixed framing in every phase.
{const {cam,camera}=rig(390,844,true,true),s=P.createPinballState();cam.snap(s);const home=camera.position.clone();
 for(const st of[playing(150,480,0,600),playing(180,100,0,-600)]){run(cam,st,.6);assert.ok(camera.position.distanceTo(home)<1e-6,'reduced motion keeps the home framing');assert.equal(cam.info().k,0);}}
// 6. No per-frame allocation in update/compose/safety.
{const src=fs.readFileSync('lib/games/soccerPinballCamera.ts','utf8'),body=src.slice(src.indexOf(' function compose()'),src.indexOf(' /** Jump straight'));
 assert.ok(body.length>200);assert.doesNotMatch(body,/new |\.clone\(|\{\.\.\.|\[\]|=>\s*\(\{/,'update path allocates nothing');}
console.log('PASS pinball camera: fill framing ×7 sizes, flipper/goal pushes keep flippers above pads, capped zoom rate, multiball wide, goal push+settle, launch cam + sleep, reduced fixed, no per-frame alloc');
