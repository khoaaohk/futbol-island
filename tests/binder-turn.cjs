// Binder page-turn gesture maths (components/binderTurn.ts): the tap/drag threshold, drag-follow, velocity and flick
// thresholds, cancel, the settle curve and the rubber band at the first and last pages. Also pins, in the source, that a
// drag never sets React state per pointer move, poses from the newest pointer position at most once a frame, settles on the
// compositor, keeps no loop at rest and has a reduced-motion path.
// usage: node tests/binder-turn.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');

const src=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/binderTurn.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};vm.runInNewContext(src,{exports:mod.exports,module:mod,Math});
const T=mod.exports;
const near=(a,b,eps=1e-6,msg)=>assert.ok(Math.abs(a-b)<=eps,`${msg??''} ${a} ≈ ${b}`);

// ── Gesture threshold: card taps are never stolen.
assert.equal(T.dragIntent(0,0),'wait');
assert.equal(T.dragIntent(5,2),'wait','under the slop it is still a tap');
assert.equal(T.dragIntent(-7.9,0),'wait');
assert.equal(T.dragIntent(9,3),'drag','sideways past the slop is a page drag');
assert.equal(T.dragIntent(-12,-11),'drag');
assert.equal(T.dragIntent(3,20),'none','a vertical move is not a page drag');
assert.equal(T.dragIntent(9,14),'none');

// ── Drag-follow.
const P=300,base={side:'right',back:false,x0:600,hinge:400,grab:680,pageW:P};
near(T.followPose({...base,x:680}),0,1e-9,'the grabbed point under the finger: flat');
near(T.followPose({...base,x:400}),.5,1e-9,'finger over the hinge: the sheet stands on edge');
near(T.followPose({...base,x:120}),1,1e-9,'mirrored past the hinge: turned over');
near(T.followPose({...base,x:900}),0,1e-9,'past the grab point it stays flat (clamped)');
// The grabbed point stays under the finger: the sheet's edge at reach·cos(πp) from the hinge.
for(const x of [650,560,470,300,200]){const p=T.followPose({...base,x});near(400+280*Math.cos(Math.PI*p),x,1e-6,`edge follows finger at ${x}`);}
let prev=-1;for(let x=700;x>=100;x-=10){const p=T.followPose({...base,x});assert.ok(p>=prev-1e-12,'monotone as the finger moves towards the far side');prev=p;}
// The left page mirrors the right one.
near(T.followPose({side:'left',back:false,x0:200,hinge:400,grab:120,pageW:P,x:400}),.5,1e-9);
near(T.followPose({side:'left',back:false,x0:200,hinge:400,grab:120,pageW:P,x:120}),0,1e-9);
// A grab right next to the hinge still has a sensible reach (35 % of the page), so a tiny move doesn't flip the sheet.
assert.ok(T.followPose({...base,grab:410,x0:410,x:400})<.55);
// A phone's back turn follows the drag distance.
const single={side:'single',back:true,x0:20,hinge:0,grab:20,pageW:P};
near(T.followPose({...single,x:20}),0);near(T.followPose({...single,x:20+P*.95/2}),.5);near(T.followPose({...single,x:20+P}),1,1e-9,'clamped to 1');

// ── Velocity: a least-squares slope over the newest 100 ms; a resting finger has none.
const s=[];for(let i=0;i<=10;i++)T.addSample(s,i*16,500-i*16*.8);
assert.ok(s.length<=8,'history is capped');
near(T.velocity(s,160),-.8,1e-9,'steady 0.8 px/ms leftwards');
assert.equal(T.velocity(s,160+T.VELOCITY_STALE+1),0,'a finger that stopped before lifting is not a flick');
const jitter=[];[0,16,32,48,64].forEach((t,i)=>T.addSample(jitter,t,500-i*8));T.addSample(jitter,66,520);
assert.ok(T.velocity(jitter,66)<0,'one jittery last event does not reverse a steady swipe');
assert.equal(T.velocity([{t:0,x:5}],0),0,'one sample: no velocity');

// ── Flick thresholds and cancel.
assert.equal(T.releaseCompletes(.6,0),true,'past halfway, slow: completes');
assert.equal(T.releaseCompletes(.4,0),false,'short of halfway, slow: falls back (cancel)');
assert.equal(T.releaseCompletes(.41,0,.4),true,'a phone forward turn completes past .4');
assert.equal(T.releaseCompletes(.1,T.FLICK_SPEED),true,'a flick forward completes early');
assert.equal(T.releaseCompletes(.1,T.FLICK_SPEED-.01),false,'just under the flick speed does not');
assert.equal(T.releaseCompletes(.02,1),false,'a flick needs the sheet to have moved a little');
assert.equal(T.releaseCompletes(.8,-T.FLICK_SPEED),false,'a flick back cancels even past halfway');
assert.equal(T.releaseCompletes(.8,-.2),true,'a slow drift back past halfway still completes');

// ── Settle: leaves at the finger's speed, lands at rest, never overshoots, quicker after a flick.
for(const [from,to,v] of [[.3,1,0],[.3,1,.004],[.7,0,-.01],[.6,0,.01],[.45,1,1],[.9,1,.002],[.2,0,0]]){
 const c=T.settleCurve(from,to,v);near(c.at(0),from,1e-9,'starts where released');near(c.at(1),to,1e-9,'lands on the target');
 assert.ok(c.duration>=180&&c.duration<=460,`duration ${c.duration}`);
 let last=from;for(let q=0;q<=1.0001;q+=.01){const p=c.at(q);assert.ok(Math.min(from,to)-1e-9<=p&&p<=Math.max(from,to)+1e-9,`no overshoot (${from}→${to}, v ${v}): ${p}`);
  assert.ok(to>from?p>=last-1e-9:p<=last+1e-9,'monotone');last=p;}
 // Lands with zero speed.
 near((c.at(1)-c.at(.999))/.001,0,.02,'lands softly');
}
const slow=T.settleCurve(.3,1,0),fast=T.settleCurve(.3,1,.006);
assert.ok(fast.duration<slow.duration,'a flick settles faster');
near((fast.at(.001)-fast.at(0))/.001/fast.duration,.006,.0006,'leaves at the release speed (p/ms)');
near((slow.at(.001)-slow.at(0))/.001,0,.01,'from rest it eases out');
assert.ok(T.settleCurve(.95,1,0).duration<T.settleCurve(.1,1,0).duration,'a short hop is quicker than a long way');

// ── Rubber band.
assert.equal(T.rubberBand(0,100),0);
near(T.rubberBand(100,100),100*(1-1/1.55),1e-9);
assert.ok(T.rubberBand(10,150)<10,'gives less than the pull');
assert.ok(T.rubberBand(10000,150)<150,'never passes the limit');
assert.ok(T.rubberBand(200,150)>T.rubberBand(100,150),'more pull, more give');
assert.equal(T.rubberBand(-50,150),-T.rubberBand(50,150),'symmetric');
const g1=T.edgeGive(40,P),g2=T.edgeGive(400,P),g3=T.edgeGive(5000,P);
assert.ok(g1.deg>0&&g1.deg<g2.deg&&g2.deg<=g3.deg&&g3.deg<=12,'the end page lifts a little more with more pull, up to 12°');
assert.ok(g3.px<P*.25,'a slide gives at most a quarter page');
{const z=T.edgeGive(-30,P);assert.ok(z.deg===0&&z.px===0,'no give for a push the other way');}
console.log('Binder turn maths: tap threshold, drag-follow, velocity, flick and cancel, settle and rubber band passed.');

// ── Source pins: no React render per pointer move, a coalesced rAF pose, a compositor settle, nothing at rest, reduced motion.
const cc=fs.readFileSync(path.join(__dirname,'../components/CardCollection.tsx'),'utf8');
const body=(name)=>{const i=cc.indexOf(` const ${name}=`);assert.ok(i>=0,name);const j=cc.indexOf('\n const ',i+5);return cc.slice(i,j);};
const move=body('onMove'),paint=body('paintDrag'),up=body('onUp');
assert.equal((move.match(/\bset(?!PointerCapture)[A-Z]\w*\(/g)||[]).length,1,'onMove sets React state once (setTurn when the drag starts), never per move');
assert.match(move,/if\(!d\.started\)\{[\s\S]*setTurn\(ready\(to,true\)\)/,'setTurn is inside the drag-start branch');
assert.match(move,/if\(!raf\.current\)raf\.current=requestAnimationFrame\(paintDrag\)/,'at most one frame request per frame');
assert.match(paint,/const d=dragging\.current/,'the frame reads the newest pointer position (coalesced moves)');
assert.doesNotMatch(paint,/\bset[A-Z]\w*\(/,'no React state in the drag frame');
assert.doesNotMatch(move+paint,/getBoundingClientRect/,'no layout read per move (the hinge is measured on press)');
assert.match(body('settleDrag'),/handle\.play\(/,'a released drag settles on the compositor');
assert.match(up,/cancelAnimationFrame\(raf\.current\)/,'the drag frame is cancelled on release');
assert.match(up,/reducedMotion\(\)\)\{finish\(complete\)/,'reduced motion: a released drag lands at once');
assert.match(cc,/if\(reducedMotion\(\)\)\{fade\.current=true;setPage\(to\);return;\}/,'reduced motion: tap turns swap the page (with a short fade)');
assert.match(move,/reducedMotion\(\)\)d\.swipe=to/,'reduced motion: no sheet follows the finger');
assert.doesNotMatch(cc,/setInterval\(/,'no interval timers');
console.log('Binder turn source: one render per drag, coalesced rAF pose, compositor settle, reduced motion passed.');
