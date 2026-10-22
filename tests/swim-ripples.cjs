// Swim ripples (Oct 19 2026, lib/graphics/swimRipples.ts + ballEffects.swimRipple): the static foot ring is hidden in the sea and
// thin rings spread from the hands per arm entry. Run: node tests/swim-ripples.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const R=load('lib/graphics/swimRipples.ts'),T=require('three');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const mk=()=>{const calls=[];const r=R.createSwimRipples({spawn:(...a)=>calls.push(a)});const s={on:true,kind:'crawl',phase:Math.PI*3,effort:1,fast:0,under:0,x:5,z:7,yaw:0,mode:0};return {calls,r,s};};
/** Advance the stroke clock at `rate` rad/s for `sec` seconds at 60 Hz. */
const run=(t,rate,sec)=>{for(let i=0;i<sec*60;i++){t.s.phase=(t.s.phase+rate/60)%(Math.PI*2*6);t.r.update(1/60,t.s);}};

ok('one ripple per arm entry (every π of the stroke clock), at the entering hand, alternating sides',()=>{
 const t=mk();t.r.update(1/60,t.s);assert.equal(t.calls.length,0,'the first frame only latches the stroke index');
 run(t,5.5,2);const strokes=Math.floor(5.5*2/Math.PI);assert(Math.abs(t.calls.length-strokes)<=1,t.calls.length+' vs '+strokes);
 const xs=new Set(t.calls.map(c=>Math.sign(c[0]-5)));assert(xs.has(1)&&xs.has(-1),'both hands');
 assert(t.calls.every(c=>Math.abs(c[1]-7-.5)<1e-9),'a half metre ahead of the swimmer (yaw 0 faces +z)');
 const full=mk();run(full,9,3);assert(full.calls.filter(c=>c[5]===1).length/3>=2,'2-3 a second at full effort');});
ok('ripple spec: reach ≤ 1.6 m, opacity ≤ .35, finite life; standing still stops the stroke ripples',()=>{
 const t=mk();run(t,5.5,3);for(const c of t.calls){assert(c[2]<=1.6+1e-9&&c[2]>=1,'reach '+c[2]);assert(c[4]<=.35+1e-9);assert(c[3]>.5&&c[3]<2);}
 const n=t.calls.length;run(t,0,2);assert.equal(t.calls.length,n,'a frozen clock spawns nothing');});
ok('treading every .8 s, floating slower, diving / not swimming / other poses nothing',()=>{
 const t=mk();t.s.kind='tread';run(t,0,4);assert(t.calls.length>=4&&t.calls.length<=6,'tread '+t.calls.length);
 const f=mk();f.s.kind='float';run(f,0,4);assert(f.calls.length>=2&&f.calls.length<=3&&f.calls[0][4]<t.calls[0][4],'float faint');
 for(const edit of [s=>{s.under=.5;},s=>{s.on=false;},s=>{s.kind='entry';},s=>{s.kind='hold';}]){const q=mk();edit(q.s);q.s.kind==='crawl'&&(q.s.kind='tread');run(q,5,3);assert.equal(q.calls.length,0);}});
ok('Swim fast adds a stretched V behind the swimmer (two rings), only when fast',()=>{
 const t=mk();t.s.fast=1;run(t,9,3);const v=t.calls.filter(c=>c[5]>1);assert(v.length>=10&&v.length%2===0,'V pairs '+v.length);
 assert(v.every(c=>c[1]<7-.5),'behind (yaw 0: -z)');const l=v.filter(c=>c[0]<5).length,r=v.length-l;assert.equal(l,r);
 assert(v[0][6]!==v[1][6],'the two arms point different ways');
 const n=mk();run(n,5.5,3);assert.equal(n.calls.filter(c=>c[5]>1).length,0);});
ok('heat: lite = one slow ripple every 2 s (never overlapping), reduced motion = a static faint ring, no strokes',()=>{
 const t=mk();t.s.mode=1;run(t,9,6);assert(t.calls.length>=2&&t.calls.length<=3);assert(t.calls.every(c=>c[3]<=R.SWIM_RIPPLE.lite&&c[7]===0));
 const q=mk();q.s.mode=2;run(q,0,5);assert(q.calls.length>=1&&q.calls.every(c=>c[7]===1&&c[4]<=.2));});
ok('the pool caps at 6 live ripples, grows in world space, fades, and nothing allocates in the loops',()=>{
 const fx=load('lib/graphics/ballEffects.ts').createBallEffects(),cam=new T.PerspectiveCamera(),p={x:0,y:1,z:0};
 const pool=()=>fx.root.children.filter(o=>o.name==='swim-ripple');assert.equal(pool().length,R.SWIM_RIPPLE_CAP);assert.equal(R.SWIM_RIPPLE_CAP,6);
 for(let i=0;i<20;i++)fx.swimRipple(i,0,0,1.6,1,.35);fx.update(.016,p,false,false,cam);assert.equal(pool().filter(o=>o.visible).length,6,'never more than six live');
 const m=pool().find(o=>o.visible);assert(m.material.opacity<=.35&&m.renderOrder>=1&&m.material.depthWrite===false);
 const r0=m.scale.x;fx.update(.3,p,false,false,cam);const w=pool().find(o=>o.visible);assert(w.scale.x>0);
 fx.update(2,p,false,false,cam);assert.equal(pool().filter(o=>o.visible).length,0,'all gone after their life');
 fx.swimRipple(3,0,4,1.6,1,.3);const q=pool().find(o=>o.position.x===3);fx.update(.5,p,false,false,cam);const x=q.position.x,z=q.position.z;fx.update(.2,{x:99,y:1,z:99},false,false,cam);assert.equal(q.position.x,x);assert.equal(q.position.z,z,'world space: the swimmer moving does not drag it');
 fx.swimRipple(0,0,0,1,1,.3,1,0,1);fx.update(.5,p,false,false,cam);const st=pool().find(o=>o.visible),s1=st.scale.x;fx.update(.2,p,false,false,cam);assert(Math.abs(st.scale.x-s1)<.12,'still ring holds its size');
 const src=fs.readFileSync('lib/graphics/swimRipples.ts','utf8');const body=src.split('export function createSwimRipples')[1];
 assert(!/new T\.|new Array|\.map\(|\.filter\(|\[\.\.\.|\{\.\.\./.test(body.replace(/const reset=.*/,'')),'the scheduler allocates nothing per frame');
 const fxSrc=fs.readFileSync('lib/graphics/ballEffects.ts','utf8');const loop=fxSrc.split('for(const r of swimRipples)')[1].split('for(const ring of rings)')[0];assert(!/new |\.map\(/.test(loop));fx.dispose();});
ok('Town wiring: foot ring hidden while swimming, scheduler fed from the pose + tier gate, old arm splash / wake pair gone',()=>{
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/ring\.visible=!fieldMenu\.current&&!vendingHide&&rideRef\.current!=='jetpack'&&(?:!party\?\.meRing&&)?!\(water\.inWater&&water\.state\.phase==='swim'\)/);
 assert.match(town,/swimRipples\.update\(dt,si\)/);assert.match(town,/si\.mode=reduced\?2:waterFxOn\(\)\?0:1/);assert.match(town,/si\.phase=p\.phase/);
 assert(!/if\(ev\.stroke\)ballEffects\.ripple/.test(town));
 const doc=fs.readFileSync('docs/performance-guide.md','utf8');assert(/Swim ripples/.test(doc));});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('swim ripples ok');
