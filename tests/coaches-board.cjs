#!/usr/bin/env node
/*
 * Coaches Board → Tactics board (Oct 9 2026): play schema and versioning, add/move/delete, arrows following chips,
 * sequence playback maths, undo/redo, share-link round trip, the built-in plays, chip physics, the plays library, and the
 * heat rule (the stage requests animation frames only while something moves: 0 at rest).
 *
 * Usage: node tests/coaches-board.cjs
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
const cache=new Map();
/** Loads a TS module (and the TS modules it imports) into one shared sandbox with the given globals. */
function makeLoader(globals={}){
 const ctx=vm.createContext({console,Date,Math,JSON,TextEncoder,TextDecoder,Uint8Array,Blob,Response,CompressionStream:globalThis.CompressionStream,DecompressionStream:globalThis.DecompressionStream,
  btoa,atob,String,Number,Array,Object,Set,Map,RegExp,Error,Promise,performance:{now:()=>0},...globals});
 const mods=new Map();
 const load=file=>{
  const abs=path.resolve(ROOT,file);if(mods.has(abs))return mods.get(abs).exports;
  const m={exports:{}};mods.set(abs,m);
  let src=cache.get(abs);if(!src){src=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText;cache.set(abs,src);}
  const req=id=>{if(id.startsWith('@/'))id=path.join(ROOT,id.slice(2));else if(id.startsWith('.'))id=path.resolve(path.dirname(abs),id);else return require(id);
   for(const ext of ['.ts','.tsx',''])if(fs.existsSync(id+ext)&&fs.statSync(id+ext).isFile())return load(id+ext);throw new Error('cannot resolve '+id);};
  vm.runInContext(`(function(module,exports,require){${src}\n})`,ctx)(m,m.exports,req);return m.exports;
 };
 return {load,ctx};
}
const {load}=makeLoader();
const T=load('lib/coaches/board/types.ts'),PL=load('lib/coaches/board/play.ts'),PI=load('lib/coaches/board/pitch.ts'),H=load('lib/coaches/board/history.ts');
const SH=load('lib/coaches/board/share.ts'),EX=load('lib/coaches/board/examples.ts'),PH=load('lib/coaches/board/physics.ts'),ST=load('lib/coaches/board/storage.ts');
const R=load('lib/coaches/board/render.ts'),V=load('lib/coaches/board/view.ts');
const near=(a,b,e=1e-6,msg)=>assert.ok(Math.abs(a-b)<=e,`${msg??''} ${a} ≈ ${b}`);
const plain=x=>x===undefined?x:JSON.parse(JSON.stringify(x));
// Values made in the vm sandbox have another realm's prototypes: compare them as plain JSON.
const deq=(a,b,m)=>assert.deepEqual(plain(a),plain(b),m),ndeq=(a,b,m)=>assert.notDeepEqual(plain(a),plain(b),m);
let groups=0;const group=(name,f)=>{try{f();groups++;}catch(e){console.error('FAIL '+name);throw e;}};
const agroup=async(name,f)=>{try{await f();groups++;}catch(e){console.error('FAIL '+name);throw e;}};

(async()=>{
group('schema and versioning',()=>{
 const p=PL.newPlay('9v9','Test');assert.equal(p.v,T.PLAY_VERSION);assert.equal(p.steps.length,1);
 deq(plain(PL.sanitizePlay(plain(p))),plain(p),'a clean play survives sanitising unchanged');
 for(const bad of [null,42,'x',{},{v:2,format:'7v7'},{v:1,format:'5v5'},{...plain(p),v:99}])assert.equal(PL.sanitizePlay(bad),null);
 // v0 prototype shape (frames) migrates.
 const old={format:'7v7',name:'Old',chips:[{id:'a',team:'home',label:'7'}],frames:[{pos:{a:[.2,.3]},arrows:[],ink:[]}]};
 const up=PL.sanitizePlay(old);assert.ok(up&&up.v===1&&up.steps.length===1);deq(plain(up.steps[0].pos.a),[.2,.3]);
 // Cleaning: labels, caps, unknown chips, positions filled forward, out-of-range coordinates clamped.
 const dirty=PL.sanitizePlay({v:1,format:'7v7',name:'  x'.padEnd(80,'y'),chips:[{id:'a',team:'home',label:'<b>1234'},{id:'a',team:'away',label:'2'},{id:'b',team:'ball',label:'zz',gk:true},{id:'bad id!',team:'home'}],
  steps:[{pos:{a:[9,-9]},arrows:[{id:'r',kind:'run',a:{c:'a'},b:{c:'nope'},bend:0},{id:'q',kind:'pass',a:{c:'a'},b:{p:[.5,.5]},bend:5,ink:9}],ink:[{id:'k',kind:'zone',pts:[[.1,.1]]}]},{pos:{}}]});
 assert.equal(dirty.chips.length,2);assert.equal(dirty.chips[0].label,'b12');assert.equal(dirty.chips[1].label,'');assert.equal(dirty.chips[1].gk,undefined);
 assert.equal(dirty.name.length,T.MAX_NAME);deq(plain(dirty.steps[0].pos.a),[1.2,-.2]);deq(plain(dirty.steps[1].pos.a),[1.2,-.2],'missing positions carry forward');
 assert.equal(dirty.steps[0].arrows.length,1,'an arrow to a missing chip is dropped');assert.equal(dirty.steps[0].arrows[0].bend,.8);assert.equal(dirty.steps[0].arrows[0].ink,T.INKS.length-1);
 assert.equal(dirty.steps[0].ink.length,0,'a one-point zone is dropped');
 const many=PL.sanitizePlay({v:1,format:'11v11',chips:Array.from({length:60},(_,i)=>({id:'c'+i,team:'home',label:String(i)})),steps:Array.from({length:40},()=>({pos:{}}))});
 assert.equal(many.chips.length,T.MAX_CHIPS);assert.equal(many.steps.length,T.MAX_STEPS);
});

group('pitch formats and shapes',()=>{
 for(const f of T.FORMATS){const s=PI.PITCHES[f];assert.ok(s.length>s.width);const m=PI.pitchMarkings(s);assert.ok(m.d.length>50&&!/NaN/.test(m.d),f);
  const shapes=PI.formationsFor(f);assert.ok(shapes.length>=2,f);
  for(const sh of shapes){const slots=PI.formationSlots(sh);assert.equal(slots.length,s.players,`${sh.id} has ${s.players} players`);
   assert.equal(new Set(slots.map(x=>x.label)).size,slots.length,`${sh.id} unique numbers`);for(const x of slots)assert.ok(x.at[0]>0&&x.at[0]<.5&&x.at[1]>0&&x.at[1]<1,'set up in the home half');}}
 near(PI.PITCHES['11v11'].length/PI.PITCHES['11v11'].width,105/68,1e-9,'11v11 proportions');near(PI.PITCHES.futsal.length/PI.PITCHES.futsal.width,2,1e-9,'futsal 40×20');
 assert.equal(PI.zoneName([.9,.95]),'right wing, attacking third');assert.equal(PI.zoneName([.9,.95],'away'),'left wing, defensive third');
 // Views: a portrait box stands the pitch up, a landscape box lays it across; screen ↔ pitch round trip.
 const r=PI.viewRect(PI.PITCHES['11v11'],'full');assert.equal(V.bestView(r,350,560).orient,'v');assert.equal(V.bestView(r,800,500).orient,'h');
 for(const o of ['h','v']){const v=V.fitView(r,500,500,o),m=[30,12],back=V.toModel(v,V.toScreen(v,m));near(back[0],30,1e-9);near(back[1],12,1e-9);}
});

group('add, move, delete',()=>{
 let p=PL.newPlay('7v7');let r=PL.addChip(p,'home');p=r.play;const a=r.id;
 r=PL.addChip(p,'home');p=r.play;const b=r.id;r=PL.addChip(p,'home',undefined,{gk:true});p=r.play;const k=r.id;r=PL.addChip(p,'ball');p=r.play;const ball=r.id;
 deq(p.chips.map(c=>c.label),['2','3','1',''],'next free shirt numbers; keepers wear 1');
 assert.ok(p.chips.find(c=>c.id===k).gk);
 const sa=p.steps[0].pos[a],sb=p.steps[0].pos[b];assert.ok(Math.hypot(sa[0]-sb[0],sa[1]-sb[1])>.02,'new chips do not land on each other');
 p=PL.addStep(p,0).play;assert.equal(p.steps.length,2);for(const s of p.steps)assert.ok(s.pos[a]&&s.pos[ball],'every chip is in every step');
 r=PL.addChip(p,'away');p=r.play;for(const s of p.steps)assert.ok(s.pos[r.id],'a chip added later appears in every step');
 p=PL.moveChips(p,1,{[a]:[.6,.4]});deq(plain(p.steps[1].pos[a]),[.6,.4]);ndeq(plain(p.steps[0].pos[a]),[.6,.4],'only that step moves');
 p=PL.updateChip(p,a,{label:'10!',team:'away',gk:true});const ca=p.chips.find(c=>c.id===a);assert.equal(ca.label,'10');assert.equal(ca.team,'away');assert.equal(ca.gk,true);
 p=PL.addArrow(p,1,{id:'x1',kind:'run',a:{c:a},b:{p:[.7,.4]},bend:0,ink:0});p=PL.addArrow(p,1,{id:'x2',kind:'pass',a:{c:b},b:{c:k},bend:0,ink:0});
 p=PL.removeChips(p,[a]);assert.ok(!p.chips.some(c=>c.id===a));for(const s of p.steps)assert.ok(!(a in s.pos));
 deq(p.steps[1].arrows.map(x=>x.id),['x2'],'arrows attached to a deleted chip go with it');
 p=PL.removeMarks(p,1,['x2']);assert.equal(p.steps[1].arrows.length,0);
 const full=PL.loadFormation(PL.newPlay('11v11'),'11v11-433','both');assert.equal(full.chips.filter(c=>c.team==='home').length,11);assert.equal(full.chips.filter(c=>c.team==='away').length,11);assert.equal(full.chips.filter(c=>c.team==='ball').length,1);
 const reload=PL.loadFormation(full,'11v11-442','home');assert.equal(reload.chips.filter(c=>c.team==='home').length,11);assert.equal(reload.chips.length,23,'loading one side replaces only that side');
 let cap=PL.newPlay('7v7');for(let i=0;i<40;i++)cap=PL.addChip(cap,'home').play;assert.equal(cap.chips.length,T.MAX_CHIPS);assert.equal(PL.addChip(cap,'home').id,null);
});

group('arrows follow chips',()=>{
 const spec=PI.PITCHES['7v7'];let p=PL.newPlay('7v7');let r=PL.addChip(p,'home',[.3,.5]);p=r.play;const a=r.id;r=PL.addChip(p,'home',[.6,.5]);p=r.play;const b=r.id;
 p=PL.addArrow(p,0,{id:'pz',kind:'pass',a:{c:a},b:{c:b},bend:.2,ink:0});
 let cv=PL.arrowCurve(p.steps[0].arrows[0],p.steps[0].pos,spec);near(cv.p0[0],.3*spec.length,1e-6);near(cv.p2[0],.6*spec.length,1e-6);
 p=PL.moveChips(p,0,{[b]:[.7,.2]});cv=PL.arrowCurve(p.steps[0].arrows[0],p.steps[0].pos,spec);
 near(cv.p2[0],.7*spec.length,1e-6,'the end follows the receiver');near(cv.p2[1],.2*spec.width,1e-6);
 // The bend keeps its shape relative to the chord (same fraction of the length, same side).
 const len=Math.hypot(cv.p2[0]-cv.p0[0],cv.p2[1]-cv.p0[1]),mid=[(cv.p0[0]+cv.p2[0])/2,(cv.p0[1]+cv.p2[1])/2];near(Math.hypot(cv.c[0]-mid[0],cv.c[1]-mid[1])/len,.2,1e-9);
 // Hand-drawn input → a smooth curve: a stroke bulging sideways gives that bend; a straight one gives 0.
 const arc=Array.from({length:21},(_,i)=>{const t=i/20;return [t*20,Math.sin(t*Math.PI)*4];});const bend=PL.fitBend(arc);assert.ok(bend>.35&&bend<.45,'bend '+bend);
 const apex=PL.quad([0,0],PL.control([0,0],[20,0],bend),[20,0],.5);near(apex[1],4,.1,'the fitted curve passes through the stroke\'s middle');
 assert.equal(PL.fitBend([[0,0],[5,0],[10,0]]),0);
 // Trimming to the chip edges keeps the start/end on the curve; the marker path has no NaN and is stable for one id.
 const q=R.trimQuad([0,0],[50,40],[100,0],10,12);assert.ok(Math.hypot(q[0][0],q[0][1])>9&&Math.hypot(q[0][0],q[0][1])<11.5);
 for(const kind of T.ARROW_KINDS){const d1=R.arrowPaths(kind,[0,0],[50,30],[120,10],'abc',3),d2=R.arrowPaths(kind,[0,0],[50,30],[120,10],'abc',3);
  assert.equal(d1.body,d2.body,'same arrow, same wobble');assert.ok(!/NaN/.test(d1.body+d1.head));assert.equal(!!d1.dash,kind==='run');}
});

group('sequence playback maths',()=>{
 const spec=PI.PITCHES['7v7'];let p=PL.newPlay('7v7');let r=PL.addChip(p,'home',[.4,.5]);p=r.play;const a=r.id;r=PL.addChip(p,'home',[.6,.3]);p=r.play;const b=r.id;r=PL.addChip(p,'ball',[.41,.5]);p=r.play;const ball=r.id;
 p=PL.addArrow(p,0,{id:'p1',kind:'pass',a:{c:a},b:{c:b},bend:0,ink:0});p=PL.addArrow(p,0,{id:'r1',kind:'run',a:{c:a},b:{p:[.7,.6]},bend:.3,ink:0});
 const s=PL.addStep(p,0);p=s.play;assert.equal(s.index,1);
 deq(plain(p.steps[1].pos[a]),[.7,.6],'the run moves its player to the arrow end');
 {const bm=PL.toM(spec,p.steps[1].pos[ball]),rm=PL.toM(spec,p.steps[1].pos[b]),d=Math.hypot(bm[0]-rm[0],bm[1]-rm[1]);assert.ok(d>.5&&d<2.6,'the pass moves the ball to the receiver\'s feet: '+d);
  assert.ok(bm[0]<rm[0],'on the side the pass came from');}
 assert.equal(p.steps[1].arrows.length,0,'the new step starts with no arrows');
 const t0=PL.positionsAt(p,0),t1=PL.positionsAt(p,1),mid=PL.positionsAt(p,.5);
 near(t0[a][0],.4*spec.length,1e-9);near(t1[a][0],.7*spec.length,1e-9);near(mid[b][0],t0[b][0],1e-9,'a still player stays still');
 // Halfway in time is halfway along the curve (ease in-out is symmetric); the bent run leaves the straight line.
 const from=t0[a],to=t1[a],c=PL.control(from,to,.3),q=PL.quad(from,c,to,.5);near(mid[a][0],q[0],1e-9);near(mid[a][1],q[1],1e-9);
 const straight=[(from[0]+to[0])/2,(from[1]+to[1])/2];assert.ok(Math.hypot(mid[a][0]-straight[0],mid[a][1]-straight[1])>1,'follows the curved run');
 // Positions move continuously and monotonically in time between the steps.
 let prev=PL.positionsAt(p,0)[ball][0];for(let k=1;k<=20;k++){const x=PL.positionsAt(p,k/20)[ball][0];assert.ok(x>=prev-1e-9);prev=x;}
 // The readable hold at each step: nothing moves in the first HOLD of the step during playback.
 near(PL.positionsAt(p,PL.HOLD*.9,true)[a][0],t0[a][0],1e-9);assert.ok(PL.positionsAt(p,.6,true)[a][0]>t0[a][0]);
 deq(PL.positionsAt(p,5),PL.positionsAt(p,1),'past the end shows the last step');
 const mv=PL.movesBetween(p,0);assert.equal(mv[ball].kind,'pass');assert.equal(mv[a].kind,'run');assert.ok(!mv[b]);
 // Reorder and delete steps.
 const three=PL.addStep(p,1).play;assert.equal(three.steps.length,3);const swapped=PL.moveStep(three,0,2);deq(plain(swapped.steps[2]),plain(three.steps[0]));
 assert.equal(PL.removeStep(three,1).steps.length,2);assert.equal(PL.removeStep(PL.newPlay(),0).steps.length,1,'the last step cannot be deleted');
});

group('undo and redo',()=>{
 let h=H.startHistory(PL.newPlay());const p0=h.now,p1=PL.addChip(p0,'home').play,p2=PL.addChip(p1,'away').play;
 h=H.commit(h,p1);h=H.commit(h,p2);assert.equal(h.past.length,2);h=H.undo(h);assert.equal(h.now,p1);h=H.undo(h);assert.equal(h.now,p0);assert.equal(H.undo(h),h,'nothing more to undo');
 h=H.redo(h);assert.equal(h.now,p1);h=H.commit(h,p2);assert.equal(h.future.length,0,'a new edit clears redo');
 let k=H.startHistory(p0);k=H.commit(k,p1,'key:a',1000);k=H.commit(k,p2,'key:a',1500);assert.equal(k.past.length,1,'arrow-key nudges merge');k=H.commit(k,p1,'key:a',4000);assert.equal(k.past.length,2,'…but not after a pause');
 let big=H.startHistory(p0);for(let i=0;i<100;i++)big=H.commit(big,{...p0,updated:i});assert.equal(big.past.length,H.HISTORY_LIMIT);
});

await agroup('share link round trip',async()=>{
 for(const ex of EX.EXAMPLE_PLAYS){const code=await SH.encodePlay(ex);assert.match(code,/^[zj][A-Za-z0-9_-]+$/);assert.ok(code.length<1600,`${ex.name}: ${code.length} chars`);
  const back=await SH.decodePlay(code);assert.ok(back,ex.name);assert.equal(back.name,ex.name);assert.equal(back.format,ex.format);assert.equal(back.note,ex.note);assert.equal(back.view,ex.view);
  assert.equal(back.chips.length,ex.chips.length);assert.equal(back.steps.length,ex.steps.length);
  for(let i=0;i<ex.steps.length;i++){for(const [j,c] of ex.chips.entries()){const v0=ex.steps[i].pos[c.id],v1=back.steps[i].pos[back.chips[j].id];near(v0[0],v1[0],.0006);near(v0[1],v1[1],.0006);}
   deq(back.steps[i].arrows.map(a=>[a.kind,a.bend]),ex.steps[i].arrows.map(a=>[a.kind,Math.round(a.bend*100)/100]));}}
 const withInk=PL.addInk(EX.EXAMPLE_PLAYS[0],0,{id:'k1',kind:'zone',pts:[[.5,.5],[.6,.5],[.6,.6]],ink:1});
 const back=await SH.decodePlay(await SH.encodePlay(withInk));assert.equal(back.steps[0].ink[0].kind,'zone');assert.equal(back.steps[0].ink[0].pts.length,3);
 for(const bad of ['','z','x123','z!!!!','zAAAA','j'+Buffer.from('[2]').toString('base64url'),'j'+Buffer.from('{"v":1}').toString('base64url')])assert.equal(await SH.decodePlay(bad),null,bad);
 assert.equal(SH.readShareHash('#play=zAbc_-9'),'zAbc_-9');assert.equal(SH.readShareHash('#save=abc'),null);
 assert.equal(SH.shareUrl('zX','https://example.org/?a=1#x'),'https://example.org/#play=zX');
});

group('built-in example plays',()=>{
 deq(EX.EXAMPLE_PLAYS.map(p=>p.name),['Give-and-go (one-two)','Overlap down the wing','Pressing a goal kick','Corner: near-post flick-on']);
 for(const ex of EX.EXAMPLE_PLAYS){
  deq(plain(PL.sanitizePlay(plain(ex))),plain(ex),`${ex.name} is a valid play`);
  assert.ok(ex.note&&ex.note.length>30&&ex.note.length<=T.MAX_NOTE,`${ex.name} has a one-line coaching point`);
  assert.ok(ex.steps.length>=3,`${ex.name} plays through in steps`);assert.ok(ex.steps.some(s=>s.arrows.some(a=>a.kind==='pass')),'has a pass');
  const ball=ex.chips.find(c=>c.team==='ball');assert.ok(ball,'has a ball');
  const spec=PI.PITCHES[ex.format],b=PI.chipBounds(spec);
  for(const s of ex.steps)for(const c of ex.chips){const [x,y]=PL.toM(spec,s.pos[c.id]);assert.ok(x>=b.x0-1e-6&&x<=b.x1+1e-6&&y>=b.y0-1e-6&&y<=b.y1+1e-6,`${ex.name}: ${c.id} on the board`);}
  // The ball travels on a pass in at least one step, and the final step puts it in the goal it attacks.
  assert.ok(ex.steps.slice(0,-1).some((_,i)=>PL.movesBetween(ex,i)[ball.id]?.kind==='pass'),`${ex.name}: the ball moves on a pass`);
  const last=ex.steps[ex.steps.length-1].pos[ball.id];assert.ok(last[0]>1&&Math.abs(last[1]-.5)<.06,`${ex.name} ends with a goal`);
  // Players do not sit on top of each other.
  for(const s of ex.steps){const ps=ex.chips.filter(c=>c.team!=='ball').map(c=>PL.toM(spec,s.pos[c.id]));for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)assert.ok(Math.hypot(ps[i][0]-ps[j][0],ps[i][1]-ps[j][1])>.8,`${ex.name}: two players overlap`);}
 }
});

group('chip physics',()=>{
 // A critically damped glide toward p + v/ω is exactly friction: it never overshoots and ends where projected.
 const b={x:0,y:0,vx:10,vy:0,tx:PH.projectRest(0,10,{omega:8,zeta:1}),ty:0,spring:{omega:8,zeta:1}};let max=0,n=0;
 while(!PH.stepBody(b,1/60)&&n<600){max=Math.max(max,b.x);n++;}assert.ok(n<120,'settles within 2 s');near(b.x,10/8,1e-9);assert.ok(max<=10/8+1e-9,'no overshoot');
 // The glide spring (ζ<1) overshoots a little, then settles exactly; frame-rate independent.
 const g=dt=>{const o={x:0,y:0,vx:0,vy:0,tx:1,ty:0,spring:PH.GLIDE};const steps=Math.round(.5/dt);for(let i=0;i<steps;i++)PH.stepBody(o,dt);return o.x;};near(g(1/60),g(1/120),1e-9,'same position at 60 and 120 Hz');
 const o={x:0,y:0,vx:0,vy:0,tx:1,ty:0,spring:PH.GLIDE};let peak=0;for(let i=0;i<300;i++){if(PH.stepBody(o,1/60))break;peak=Math.max(peak,o.x);}assert.ok(peak>1&&peak<1.05,'a soft settle '+peak);assert.equal(o.x,1);
 assert.equal(PH.rubber(5,0,10,2),5);const out=PH.rubber(1000,0,10,2);assert.ok(out>10&&out<12,'rubber band never passes its limit');assert.ok(PH.rubber(11,0,10,2)<11,'resists past the edge');
 const vt=new PH.VelocityTracker();vt.add(0,0,0);vt.add(16,10,0);vt.add(32,20,0);const [vx]=vt.velocity(40);near(vx,625,1);deq(vt.velocity(200),[0,0],'a finger that stopped has no momentum');
 vt.reset();vt.add(0,0,0);vt.add(10,1000,0);assert.ok(Math.hypot(...vt.velocity(12))<=PH.MAX_RELEASE_SPEED+1e-6);
 const bounds={x0:0,y0:0,x1:100,y1:60},sep=PH.separate([50,30],[{x:50,y:30,min:3}],bounds);near(Math.hypot(sep[0]-50,sep[1]-30),3,1e-9,'two chips on one spot are nudged apart');
 deq(PH.separate([10,10],[{x:50,y:30,min:3}],bounds),[10,10]);
 deq(PH.snapGrid([7.4,2.6],5),[5,5]);deq(PH.snapSlots([10,10],[[11,10],[40,40]],3),[11,10]);
});

group('plays library',()=>{
 const values=new Map(),store={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(ST.PLAYS_KEY,'fi2-coach-plays-v1');
 let lib=ST.loadLibrary(store);deq(plain(lib),plain(ST.emptyLibrary()));
 const p=PL.loadFormation(PL.newPlay('9v9','Build-up'),'9v9-323','both');lib=ST.upsertPlay(lib,p);lib={...lib,open:p.id};assert.ok(ST.saveLibrary(lib,store));
 const back=ST.loadLibrary(store);assert.equal(back.plays.length,1);assert.equal(back.open,p.id);deq(plain(back.plays[0]),plain(p),'reopens exactly');
 const d=ST.duplicatePlay(back,p.id);assert.equal(d.lib.plays.length,2);assert.notEqual(d.copy.id,p.id);assert.match(d.copy.name,/\(copy\)$/);
 const del=ST.deletePlay(d.lib,p.id);assert.equal(del.plays.length,1);assert.equal(del.open,null);
 assert.equal(ST.renamePlay(del,d.copy.id,'  ').plays[0].name,'My play');
 for(const raw of ['{broken','null','{"v":7,"plays":[]}'])values.set(ST.PLAYS_KEY,raw),assert.equal(ST.loadLibrary(store).plays.length,0);
 let many=ST.emptyLibrary();for(let i=0;i<60;i++)many=ST.upsertPlay(many,{...p,id:'p'+i});assert.equal(many.plays.length,ST.MAX_PLAYS);
 assert.ok(JSON.stringify(many).length<ST.MAX_LIBRARY_BYTES,'a full library of 9v9 boards fits the cap');
 const ex=ST.copyOf(EX.EXAMPLE_PLAYS[0]);assert.notEqual(ex.id,EX.EXAMPLE_PLAYS[0].id);assert.equal(ex.note,EX.EXAMPLE_PLAYS[0].note);
 // Plays stay on the device (user, Oct 9 2026): listed in DEVICE_KEYS, never in SYNC_KEYS.
 const snap=fs.readFileSync(path.join(ROOT,'lib/saves/snapshot.ts'),'utf8');
 const syncBlock=snap.slice(snap.indexOf('SYNC_KEYS'),snap.indexOf('DEVICE_KEYS')),deviceBlock=snap.slice(snap.indexOf('DEVICE_KEYS'),snap.indexOf('SAVE_CODE_KEY'));
 assert.doesNotMatch(syncBlock,/'fi2-coach-plays-v1'/,'plays never sync');assert.match(deviceBlock,/'fi2-coach-plays-v1'/,'plays are a device key');
});

group('IDP link (docs/idp/BOARD-LINK.md)',()=>{
 const events=[];const win={addEventListener:(n,f)=>events.push([n,f]),removeEventListener:()=>{},dispatchEvent:()=>true};
 const vals=new Map();const {load:L2}=makeLoader({window:win,localStorage:{getItem:k=>vals.get(k)??null,setItem:(k,v)=>vals.set(k,v)},CustomEvent:class{constructor(n,o){this.type=n;this.detail=o?.detail;}}});
 const LK=L2('lib/coaches/board/link.ts'),IDB=L2('lib/coaches/idp/board.ts'),PL2=L2('lib/coaches/board/play.ts'),ST2=L2('lib/coaches/board/storage.ts');
 const mine=PL2.newPlay('9v9','Our press');ST2.saveLibrary({...ST2.emptyLibrary(),plays:[mine]});
 const refs=LK.boardPlayRefs();for(const r of refs)assert.ok(IDB.isBoardPlayId(r.id),r.id);
 deq(refs.slice(0,4).map(r=>[r.id,r.skill]),[['exgiveandgo','pass'],['exoverlap','space'],['express','recover'],['excorner','runs']]);assert.equal(refs[4].title,'Our press');
 let opened=null;const off=LK.registerBoardLink(id=>{opened=id;});assert.equal(typeof win[IDB.BOARD_PLAYS_GLOBAL],'function');
 const handler=events.find(([n])=>n===IDB.BOARD_OPEN_PLAY)[1];handler({detail:{id:'NOT VALID'}});assert.equal(opened,null);
 handler({detail:{id:'excorner'}});assert.equal(opened,'excorner');assert.equal(LK.takePendingPlay(),'excorner');assert.equal(LK.takePendingPlay(),null,'taken once');off();
});

group('heat: frames only while something moves',()=>{
 let pending=[];let id=0;
 const {load:loadS}=makeLoader({requestAnimationFrame:f=>{pending.push(f);return ++id;},cancelAnimationFrame:()=>{pending=[];},performance:{now:()=>0}});
 const {Stage}=loadS('components/coaches-board/stage.ts'),PLs=loadS('lib/coaches/board/play.ts'),PIs=loadS('lib/coaches/board/pitch.ts'),Vs=loadS('lib/coaches/board/view.ts');
 const play=PLs.loadFormation(PLs.newPlay('7v7'),'7v7-231','both'),spec=PIs.PITCHES['7v7'],view=Vs.bestView(PIs.viewRect(spec,'full'),360,520);
 const stage=new Stage(),scene={play,step:0,spec,view,r:12,ballR:7,snap:'off',slots:[]};
 let now=0;const run=(ms)=>{let frames=0;const end=now+ms;while(pending.length&&now<end){now+=16;const f=pending;pending=[];f.forEach(fn=>fn(now));frames+=f.length;}return frames;};
 stage.sync(scene,true);assert.equal(pending.length,0,'0 frames at rest after the first paint');
 const id0=play.chips[0].id,[x,y]=stage.at(id0);
 stage.dragStart([id0],[x,y],0);assert.equal(pending.length,1,'a drag starts the loop');
 stage.dragMove([x+5,y+2],16);stage.dragMove([x+10,y+4],32);run(48);const t=stage.dragEnd(48);assert.ok(t&&t[id0],'release returns the resting point');
 assert.ok(t[id0][0]>x+10,'the flick carries the chip on (momentum)');
 const frames=run(5000);assert.ok(frames>5&&frames<200,'the glide runs, then stops: '+frames);assert.equal(pending.length,0,'0 frames once settled');
 near(stage.at(id0)[0],t[id0][0],1e-9,'settles exactly on the resting point (no jitter)');
 // A step change glides; playback runs; both stop by themselves.
 const two=PLs.moveChips(PLs.addStep(play,0).play,1,{[id0]:[.45,.5]});stage.sync({...scene,play:two,step:1});assert.equal(pending.length,1);run(3000);assert.equal(pending.length,0);
 stage.playFrom(0,2,false);run(10000);assert.equal(pending.length,0,'playback stops at the last step');assert.equal(stage.playing,false);
 // A React commit inside a frame (the step label changing) must not start a second loop.
 stage.setHooks({onStep:i=>stage.sync({...scene,play:two,step:i})});stage.playFrom(0,1,false);let most=0;
 for(let k=0;k<400&&pending.length;k++){now+=16;const f=pending;pending=[];f.forEach(fn=>fn(now));most=Math.max(most,pending.length);}
 assert.equal(most,1,'one frame request per frame while playing');stage.setHooks({});
 stage.playFrom(0,2,true);run(3000);assert.equal(pending.length,1,'looping keeps going…');stage.stopPlay();run(100);assert.equal(pending.length,0,'…until stopped');
 // Static guards: lazy-loaded with the centre, no backdrop blur, stage is the only rAF user on the board.
 const centre=fs.readFileSync(path.join(ROOT,'components/CoachesCentre.tsx'),'utf8');assert.match(centre,/dynamicImport\(\(\)=>import\('\.\/CoachesBoard'\),\{ssr:false\}\)/);
 for(const f of fs.readdirSync(path.join(ROOT,'components/coaches-board'))){const src=fs.readFileSync(path.join(ROOT,'components/coaches-board',f),'utf8');
  assert.ok(!/backdrop-filter\s*:\s*(?!none)/.test(src),f+': no backdrop blur');
  const raf=(src.match(/requestAnimationFrame\(/g)||[]).length;
  if(f==='TacticsBoard.tsx')assert.equal(raf,1,'the board itself asks for one frame only, to start playback');else if(f!=='stage.ts')assert.equal(raf,0,f+': the stage is the only loop');}
 assert.ok(!/setInterval/.test(fs.readFileSync(path.join(ROOT,'components/coaches-board/TacticsBoard.tsx'),'utf8')),'no polling');
});

console.log(`coaches-board: ${groups} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
