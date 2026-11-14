// Gashapon, owner requests of Nov 10 2026:
//  1. "Simplify this to fit between Toy Shelf and Done btn on mobile": ONE status pill (lib/gashapon/statusLine.ts) on the top row;
//  2. "allow the player to manually spin the gashapon machine as well as the btn": the knob turns by hand (lib/gashapon/knobTurn.ts),
//     the same spin as the button, one in-flight guard, springs back if let go early;
//  3. "make the gashapon machines look different in variety and size": six body styles (lib/gashapon/machines.ts GASHA_LOOK,
//     lib/graphics/gashaponMesh.ts), sized colliders, the live close-up built in the same style, the draw budget unchanged.
// usage: node tests/gashapon-styles.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map();
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('exports','module','require',code)(mod.exports,mod,id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id));
 cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const St=load('lib/gashapon/statusLine.ts'),K=load('lib/gashapon/knobTurn.ts'),M=load('lib/gashapon/machines.ts'),G=load('lib/graphics/gashaponMesh.ts');

await ok('status pill: "2/6" plus one short fact per state, a full sentence for screen readers',()=>{
 const s=(left,blocked,found=2)=>St.gashaponStatus({found,total:6,left,blocked});
 assert.deepEqual({...s(0,'cap')},{count:'2/6',fact:'None left',kind:'cap',label:'2 of 6 toys collected from this machine. No spins left today.'});
 assert.deepEqual({...s(0,null)},{...s(0,'cap')},'0 left reads as none left even before the hook blocks');
 assert.deepEqual({...s(8,'coins')},{count:'2/6',fact:'Need coins',kind:'coins',label:'2 of 6 toys collected from this machine. Not enough coins for a spin.'});
 assert.deepEqual({...s(3,null)},{count:'2/6',fact:'3 left',kind:'few',label:'2 of 6 toys collected from this machine. 3 spins left today.'});
 assert.equal(s(1,null).label,'2 of 6 toys collected from this machine. 1 spin left today.');assert.equal(s(1,null).fact,'1 left');
 assert.deepEqual({...s(12,null,6)},{count:'6/6',fact:null,kind:null,label:'6 of 6 toys collected from this machine.'},'plenty left: just the count');
 for(const x of [s(0,'cap'),s(8,'coins'),s(3,null)])assert(x.count.length+x.fact.length<=14,'short enough for 320 px: '+x.count+' '+x.fact);
});

await ok('status pill sits in ONE row between Toy Shelf and Done; the dots drop on phones; no wrapping',()=>{
 const face=read('components/GashaponMachineFace.tsx'),css=read('components/GashaponMachineFace.module.css');
 assert(/<div className=\{styles\.bar\}>\s*<button type="button" className=\{styles\.shelf\}[^\n]*Toy Shelf<\/button>\s*<p className=\{styles\.status\}[\s\S]*?<\/p>\s*<div className=\{styles\.done\}><DoneButton/.test(face),'Shelf, status, Done in one bar');
 assert(!/None left today|Toys \{found\}/.test(face),'the two old chips are gone');
 assert(/\.bar\{[^}]*display:flex;align-items:center;justify-content:space-between/.test(css),'one flex row');
 assert(/\.status\{[^}]*min-width:0[^}]*white-space:nowrap;overflow:hidden/.test(css)&&/\.shelf\{[^}]*flex:none;white-space:nowrap/.test(css),'nothing wraps');
 assert(/\.face\[data-room=false\] \.dots\{display:none\}/.test(css)&&/@media\(max-width:520px\)\{[^@]*\.dots\{display:none\}/.test(css),'six dots only with room');
 assert(/\.shelf\{[^}]*min-height:44px/.test(css),'Toy Shelf keeps a 44 px target (Done is the shared 44 px DoneButton)');
 assert(!/IslandBrush/.test(css.replace(/\/\*[\s\S]*?\*\//g,'')),'no IslandBrush');
});

await ok('knob turn: three quarters of a circle commits ONCE; early release springs back; a swipe across counts; one pointer only',()=>{
 const cx=100,cy=100,r=40;
 // A clockwise circle on screen (y down: atan2 rising) at the knob's rim, in 10° steps.
 const circle=(t,from,to,id=1)=>{let commits=0,last=null;for(let d=from;d<=to;d+=10){const a=d*Math.PI/180,res=t.move(id,cx+Math.cos(a)*r,cy+Math.sin(a)*r);if(res){last=res;if(res.commit)commits++;}}return {commits,last};};
 let t=K.createKnobTurn();assert(t.down(1,cx+r,cy,cx,cy,r));let c=circle(t,0,260);assert.equal(c.commits,0,'260°: not yet');assert(Math.abs(c.last.angle-260*Math.PI/180)<.01,'1:1 with the finger');
 c=circle(t,270,400);assert.equal(c.commits,1,'commits once at 270°');assert(t.moved);assert.equal(t.up(1),'committed');
 t=K.createKnobTurn();t.down(1,cx+r,cy,cx,cy,r);c=circle(t,0,180);assert.equal(c.commits,0);assert.equal(t.up(1),'spring','let go at half a turn: springs back');assert.equal(t.angle,0);
 t=K.createKnobTurn();t.down(1,cx,cy+r,cx,cy,r);c={commits:0};for(let d=90;d>=-200;d-=10){const a=d*Math.PI/180,res=t.move(1,cx+Math.cos(a)*r,cy+Math.sin(a)*r);if(res.commit)c.commits++;}
 assert.equal(c.commits,1,'anticlockwise works too');assert(t.angle<0);t.up(1);
 // A plain horizontal swipe across the knob (left edge to right edge): small fingers.
 t=K.createKnobTurn();t.down(1,cx-r,cy+5,cx,cy,r);let sw=0;for(let x=cx-r;x<=cx+r+2;x+=4){const res=t.move(1,x,cy+5);if(res.commit)sw++;}assert.equal(sw,1,'a swipe across commits once');t.up(1);
 t=K.createKnobTurn();t.down(1,cx-10,cy,cx,cy,r);for(let x=cx-10;x<=cx+10;x+=2)t.move(1,x,cy);assert(!t.moved||Math.abs(t.angle)<K.KNOB_COMMIT,'a tiny wiggle never commits');assert.equal(t.up(1),'spring');
 // Multi-touch: a second pointer is ignored while the first turns.
 t=K.createKnobTurn();assert(t.down(1,cx+r,cy,cx,cy,r));assert.equal(t.down(2,cx,cy-r,cx,cy,r),false,'second finger ignored');assert.equal(t.move(2,cx-r,cy),null);assert.equal(t.up(2),null);assert.equal(t.up(1),'spring');
 assert(Math.abs(K.KNOB_COMMIT-Math.PI*1.5)<1e-9,'three quarters of a turn');
});

await ok('the hand turn runs the SAME spin as the button: one in-flight guard, blocked states respected, no double charge',()=>{
 const face=read('components/GashaponMachineFace.tsx'),hook=read('components/useGashaponSpin.ts'),css=read('components/GashaponMachineFace.module.css');
 assert(/const spinOnce=\(\)=>\{[^}]*\}?[^\n]*void spin\(\);\};/.test(face),'one entry: spinOnce → spin()');
 assert(/onClick=\{\(\)=>\{if\(dragged\.current\)\{dragged\.current=false;return;\}spinOnce\(\);\}\}/.test(face),'the click that ends a drag never spins again');
 assert(/if\(r\.commit\)\{[^\n]*if\(el\.disabled\)gashaponFx\.release\(machine\.id,reducedMotion\(\)\);else spinOnce\(\);\}/.test(face),'commit → the same spin; a disabled knob springs back');
 assert(/const knobDown=[^\n]*el\.disabled\|\|!e\.isPrimary/.test(face),'no drag while disabled (Need coins / Tomorrow / turning / in the tray) or for a second finger');
 assert(/setPointerCapture\(e\.pointerId\)/.test(face)&&/onPointerCancel=\{knobUp\}/.test(face),'pointer capture; cancel springs back');
 assert(/if\(busy\|\|phase==='tray'\|\|inFlight\.current\)return false;/.test(hook)&&/inFlight\.current=true;gashaponSound\.unlock\(\)/.test(hook),'the in-flight ref is set before the first await');
 const guard=hook.indexOf('inFlight.current=true'),wait=hook.indexOf('await gashapon.spin');assert(guard>0&&guard<wait,'guard before the store call');
 assert(/pending\.current\?\?=newSpinId\(\)/.test(hook),'still one spin id per press (the store refuses a second charge for it)');
 assert(/\.knob\{touch-action:none;/.test(css),'touch-action none on the knob');
 assert(/\.knob\[data-turning\] \.ring\{animation:none;rotate:var\(--turn,0rad\)\}/.test(css),'the ring turns with the finger only while dragged');
 // The hint: one time, the toy viewer's device key.
 assert(/HINTS_KEY='fi2-toy-hints-v1',KNOB_HINT='knob'/.test(face)&&/<b>Turn the knob<\/b> or tap Spin/.test(face),'one-time hint in the existing hint store');
 assert(/'fi2-toy-hints-v1'/.test(read('lib/saves/snapshot.ts')),'a device key (not synced)');
 assert(!/setInterval|requestAnimationFrame|setTimeout/.test(read('lib/gashapon/knobTurn.ts')+face),'no timers or loops for the drag');
});

await ok('the live 3D knob follows the hand, springs back, and the spin carries on from where the hand let go; idle = no work',()=>{
 const L=load('lib/graphics/gashaponLive.ts'),scene=new T.Scene();
 for(const m of M.islandGashaponMachines()){const live=L.createGashaponLive(scene);live.show(m,0);const root=scene.getObjectByName('gashapon-live');
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});assert(meshes.length<=7,m.id+': ≤ 7 live meshes');
  const crank=root.children.find(c=>c.children[0]?.name==='gashapon-live-crank');
  live.hold(2);live.update(.016,false);assert(Math.abs(crank.rotation.z+2)<1e-6,m.id+': the knob turns 1:1');
  live.letGo(false);let n=0;while(live.update(.016,false)&&n<100)n++;assert(n>3&&n<40,m.id+': springs back in a few frames ('+n+')');assert(Math.abs(crank.rotation.z)<1e-6);
  assert.equal(live.update(.016,false),false,'idle: nothing per frame');
  live.hold(1);live.update(.016,true);live.letGo(true);live.update(.016,true);assert(Math.abs(crank.rotation.z)<1e-9,'reduced motion: jumps back');
  live.hold(4.8);live.spin(()=>{});live.update(.016,false);assert(crank.rotation.z<-4.7,'a committed hand turn carries on from the hand');
  live.dispose();}
});

await ok('six body styles: every machine has one, pairs differ, sizes vary, summit is a shallow non-twin',()=>{
 const all=M.GASHAPON_MACHINES;assert.equal(all.length,18);
 for(const m of all)assert(M.GASHA_STYLES.includes(M.GASHA_LOOK[m.id].style)&&/^#[0-9a-f]{6}$/i.test(M.GASHA_LOOK[m.id].trim),m.id+' has a style + trim');
 assert.equal(new Set(all.map(m=>M.gashaStyleOf(m))).size,6,'all six styles used');
 for(const zone of ['konbini-square','konbini-cay','arcade']){const p=all.filter(m=>m.zone===zone);assert.notEqual(M.gashaStyleOf(p[0]),M.gashaStyleOf(p[1]),zone+': the pair differs');}
 for(const a of all)for(const b of all)if(a!==b&&Math.hypot(a.x-b.x,a.z-b.z)<3&&a.zone===b.zone)assert.notEqual(M.gashaStyleOf(a),M.gashaStyleOf(b),`neighbours ${a.id} / ${b.id} differ`);
 const counts={};for(const m of all)counts[M.gashaStyleOf(m)]=(counts[M.gashaStyleOf(m)]??0)+1;assert(Math.max(...Object.values(counts))<=4,'no style more than 4 times (18 machines since the stadium four, Nov 13 2026)');
 const sum=all.find(m=>m.id==='gs-summit'),st=M.gashaStyleOf(sum);assert.notEqual(st,'twin','summit: never the wide twin');
 const SI=load('lib/town/summitIsle.ts'),fence=SI.SUMMIT_PITCH.x+SI.SUMMIT_FENCE.halfX;
 const b=G.gashaponBases(),p=G.gashaponPieces(sum,0,b),box=new T.Box3();for(const x of p){x.geometry.computeBoundingBox();box.union(x.geometry.boundingBox);x.geometry.dispose();}G.disposeBases(b);
 const back=sum.x+box.min.z;/* yaw π/2: local −z is world −x, toward the fence */assert(Math.abs(sum.yaw-Math.PI/2)<.01,'faces east');
 assert(back-fence>=.15,`summit: back ≥ 15 cm off the fence (${(back-fence).toFixed(2)} m)`);
 const tops=new Set(Object.values(G.GASHA_STYLE_DIMS).map(d=>d.top.toFixed(1)));assert(tops.size>=4,'heights differ');
 const widths=new Set(Object.values(G.GASHA_STYLE_DIMS).map(d=>d.w.toFixed(1)));assert(widths.size>=4,'widths differ');
});

await ok('each style: geometry inside its collider, its height as declared, glass count, the live front on its cabinet',()=>{
 const b=G.gashaponBases();
 for(const [i,m] of M.GASHAPON_MACHINES.entries()){const st=M.gashaStyleOf(m),S=M.GASHA_STYLE_SIZE[st],D=G.GASHA_STYLE_DIMS[st],f=G.gashaponFootprint({...m,yaw:0});
  assert(Math.abs(f.w-(S.w+.06))<.011&&Math.abs(f.d-(S.d+.06))<.011,m.id+': collider = style size + 3 cm a side');
  const p=G.gashaponPieces(m,i,b),body=new T.Box3(),all=new T.Box3();
  for(const x of p){x.geometry.computeBoundingBox();const bb=x.geometry.boundingBox;all.union(bb);if(!x.glass&&bb.max.y<D.cabinetTop+.02&&bb.min.y<.3)body.union(bb);}
  assert(body.max.x-body.min.x<=f.w+.05,`${m.id}: the base fits its collider width (${(body.max.x-body.min.x).toFixed(2)} vs ${f.w})`);
  assert(Math.abs(all.max.y-D.top)<.13,`${m.id}: top ${all.max.y.toFixed(2)} ≈ ${D.top}`);
  assert.equal(p.filter(x=>x.glass).length,G.GASHA_STYLE_GLOBES[st],m.id+': globes');
  assert(new Set(p.filter(x=>x.part!=='body').map(x=>x.part)).size===4,m.id+': one live set of crank / pool / next / flap');
  const F=G.gashaFace(m);assert(Math.abs(F.knob.x)<F.halfW&&F.knob.y>.3&&F.knob.y<D.cabinetTop&&F.tray.y<F.knob.y&&F.globe.y>D.cabinetTop,m.id+': knob on the front, globe above the cabinet');
  p.forEach(x=>x.geometry.dispose());}
 G.disposeBases(b);
 const src=read('lib/graphics/gashaponMesh.ts');assert(!/Light\(|CanvasTexture|TextureLoader|requestAnimationFrame|setInterval/.test(src),'no lights, textures or loops');
 assert.equal((src.match(/new T\.\w*Material\(/g)||[]).length,1,'one material made here: the shared glass');
});

await ok('close-up and prompt follow the style: anchors, framing, hover box and bubble per machine',()=>{
 const P=read('lib/graphics/gashaponPrompt.ts');
 assert(/const F=gashaFace\(m\);/.test(P)&&/crown:pt\(m,camera,0,F\.top\+\.04,0\)/.test(P),'anchors from the machine style');
 assert(/const D=gashaStyleDims\(m\),tall=D\.top\/2,wide=Math\.max\(1,D\.w\/\.86\*\.8\)/.test(P),'the zoom frames each style');
 assert(/gashaStyleDims\(near\)\.top\+\.27/.test(P)&&/glowRoot\.scale\.copy\(sc\)/.test(P),'bubble over its top; the one glow scaled to it');
 assert(/F=gashaFace\(m\);aim\(\)/.test(read('lib/graphics/gashaponLive.ts')),'the live copy animates its own style');
});

if(failed){console.log(failed+' FAILED');process.exit(1);}
console.log('PASS gashapon styles, status pill and hand-turned knob');
})();
