// Sharks circle the swimmer (water P1a, Oct 15 2026; lib/town/water/sharks.ts, the hook in lib/graphics/caySharks.ts):
// the trigger distance, at most three sharks, the staggered ring kept in the water, following the swimmer, the peel-off
// timer, the shore / take-off release, the cooldown, no new meshes or materials, reduced motion still circles, the bubble
// text and the Town wiring (the 10 Hz tick, the sting, the once-per-device lesson, the analytics ids).
// Run: node tests/water-sharks.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();
function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const req=s=>{if(s==='three')return T;if(s.startsWith('.')||s.startsWith('@/')){const r=s.startsWith('@/')?path.join(base,s.slice(2)):path.resolve(path.dirname(file),s);for(const e of ['.ts','.tsx','/index.ts'])if(fs.existsSync(r+e))return load(r+e);}return require(s);};
 vm.runInNewContext(out,{module:mod,exports:mod.exports,require:req,console,Math,Date,performance,setTimeout,clearTimeout,Float32Array,Int8Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Set,Map,Object,Number,String,JSON,Error,Symbol,window:undefined,document:undefined,localStorage:undefined});
 loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/water/sharks.ts'),{createCaySharks}=load('lib/graphics/caySharks.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// A fake school: one region of six sharks on a line z=0, x = 0, 3, 6, 9, 12, 15; land north of z=-40.
const school=(xs,awake=true)=>({count:1,region:()=>({active:xs.length,awake}),at:(r,i,o)=>{o.x=xs[i];o.z=0;}});
const land=(x,z)=>z< -40;
const sw=(x,z,o={})=>({x,z,swimming:true,distanceToLand:30,...o});
const run=(c,t,swimmer,sch,dt=1/60)=>{const raised=[];for(let s=0;s<t;s+=dt){const e=c.tick(dt,swimmer,sch);if(e.started)raised.push('started');if(e.ended)raised.push(e.ended);c.frame(dt);}return raised;};

ok('the line, the bubble time and the lesson are constants (kid-safe "Uh oh!", football hook)',()=>{
 assert.equal(S.SHARK_LINE,'Uh oh!');assert.equal(S.SHARK_BUBBLE_S,1.5);
 assert.match(S.SHARK_LESSON.text,/head up/);assert.match(S.SHARK_LESSON.text,/open side/);assert.match(S.SHARK_LESSON.title,/Defenders closing in/);
 assert.equal(S.SHARK_LESSON_KEY,'fi2-shark-lesson-v1');});

ok('trigger: nothing beyond 14 m, a start inside it; only while swimming; the region must be awake',()=>{
 const far=S.createSharkCircle(land);assert.deepEqual(run(far,2,sw(0,S.SHARK_TRIGGER+.5),school([0,3,6,9,12,15])),[]);
 const wade=S.createSharkCircle(land);assert.deepEqual(run(wade,2,sw(6,4,{swimming:false}),school([0,3,6,9,12,15])),[]);
 const asleep=S.createSharkCircle(land);assert.deepEqual(run(asleep,2,sw(6,4),school([0,3,6,9,12,15],false)),[]);
 const c=S.createSharkCircle(land);const r=run(c,.25,sw(0,S.SHARK_TRIGGER-.5),school([0,3,6,9,12,15]));
 assert.deepEqual(r,['started']);assert.equal(c.state.active,true);});

ok('at most three sharks, the nearest ones, each in its own staggered slot',()=>{
 const c=S.createSharkCircle(land);run(c,.2,sw(7,3),school([0,3,6,9,12,15]));
 assert.equal(c.state.n,S.SHARK_MAX);assert.equal(S.SHARK_MAX,3);
 const ids=[...c.ids].sort();assert.deepEqual(ids,[1,2,3],'the three nearest to x=7 (x 3, 6, 9)');
 assert.equal(new Set(c.slot).size,3,'one slot each');
 const offsets=S.SHARK_SLOTS.map(s=>s[0]);const gaps=[offsets[1]-offsets[0],offsets[2]-offsets[1],Math.PI*2-offsets[2]];
 assert(gaps.every(g=>g>1.5&&g<2.6)&&new Set(gaps.map(g=>g.toFixed(2))).size===3,'staggered, not evenly spaced: '+gaps);});

ok('ring geometry: radius ~4.6 m, slots staggered in radius, turning at ~1.2 m/s, following the swimmer',()=>{
 const c=S.createSharkCircle(land);const sch=school([0,3,6,9,12,15]);run(c,.2,sw(7,3),sch);
 assert(c.state.radius>=4&&c.state.radius<=5,'radius '+c.state.radius);
 run(c,S.SHARK_JOIN+.2,sw(7,3),sch);const p={x:0,z:0};
 for(let m=0;m<c.state.n;m++){c.ringPoint(m,p);const d=Math.hypot(p.x-7,p.z-3);assert(d>=S.SHARK_RING_MIN*.85&&d<=S.SHARK_RING*1.15,`slot ${m} at ${d.toFixed(2)} m`);}
 const a0=c.state.angle;run(c,1,sw(7,3),sch);const da=((c.state.angle-a0)+Math.PI*2)%(Math.PI*2);
 assert(Math.abs(da*c.state.radius-S.SHARK_SPEED)<.05,'arc speed '+(da*c.state.radius).toFixed(2)+' m/s');
 assert(S.SHARK_SPEED>=1&&S.SHARK_SPEED<=1.4);
 // The swimmer moves 6 m: the ring centre follows.
 run(c,3,sw(13,3),sch);assert(Math.hypot(c.state.cx-13,c.state.cz-3)<.5,'the ring follows: '+c.state.cx.toFixed(2));
 // place(): fully blended, the shark sits on its ring slot, heading along the tangent.
 const pos={x:0,z:0,yaw:0};assert.equal(c.place(0,c.ids[0],pos),true);c.ringPoint(0,p);assert(Math.hypot(pos.x-p.x,pos.z-p.z)<1e-6);
 assert.equal(c.place(0,0,{x:0,z:0,yaw:0}),false,'a shark not in the circle is untouched');assert.equal(c.place(1,c.ids[0],{x:0,z:0,yaw:0}),false,'another region is untouched');});

ok('the ring stays in the water: shrinks near land, never below the minimum; a shark whose path crosses land is skipped',()=>{
 const c=S.createSharkCircle(land);run(c,.2,sw(7,3,{distanceToLand:3.4}),school([0,3,6,9,12,15]));
 assert(c.state.radius*S.SHARK_SLOTS[1][1]<=3.4-S.SHARK_SHORE_GAP+1e-6,'the widest slot stays off the bank: '+c.state.radius);
 const d=S.createSharkCircle(land);run(d,.2,sw(7,3,{distanceToLand:.5}),school([0,3,6,9,12,15]));assert.equal(d.state.radius,S.SHARK_RING_MIN);
 // A bank (a wall x 4..5) between the swimmer and sharks on the far side: those are not picked.
 const wall=(x,z)=>x>4&&x<5;const e=S.createSharkCircle(wall);run(e,.2,sw(9,0),school([0,1,2,10,11,12]));
 assert([...e.ids].filter(i=>i>=0).every(i=>i>=3),'only sharks on the swimmer\'s side: '+[...e.ids]);});

ok('peel-off timer: they lose interest after 12 s, blend back to the loop, then cool down',()=>{
 const c=S.createSharkCircle(land);const sch=school([0,3,6,9,12,15]);
 const r=run(c,S.SHARK_HOLD+.3,sw(7,3),sch);assert.deepEqual(r,['started','bored']);assert.equal(S.SHARK_HOLD,12);
 assert.equal(c.state.active,false);assert.equal(c.busy,true,'still peeling off');
 run(c,S.SHARK_LEAVE+.2,sw(7,3),sch);assert.equal(c.busy,false,'back on their loops');assert.equal(c.state.n,0);
 assert.deepEqual(run(c,5,sw(7,3),sch),[],'cooldown: not again at once');
 assert.deepEqual(run(c,S.SHARK_COOLDOWN,sw(7,3),sch).slice(0,1),['started'],'again after the cooldown');});

ok('shore release: wading depth or a take-off ends it at once (release)',()=>{
 const c=S.createSharkCircle(land);const sch=school([0,3,6,9,12,15]);run(c,1,sw(7,3),sch);
 assert.deepEqual(run(c,.1,sw(7,3,{swimming:false}),sch),['shore']);
 const d=S.createSharkCircle(land);run(d,1,sw(7,3),sch);assert.equal(d.release().ended,'shore');assert.equal(d.state.active,false);
 assert.equal(d.release().ended,'','a second release raises nothing');});

ok('the proximity test runs at the probe rate (10 Hz), not per frame',()=>{
 let reads=0;const sch={count:1,region:()=>({active:6,awake:true}),at:(r,i,o)=>{reads++;o.x=100+i;o.z=0;}};
 const c=S.createSharkCircle(land);for(let i=0;i<60;i++)c.tick(1/60,sw(0,0),sch);
 assert(reads<=6*11,'≈ 10 samples × 6 sharks in a second: '+reads);assert.equal(S.SHARK_TICK,.1);});

ok('the real caySharks: same instances, 0 new meshes or materials; the ring moves the fins; reduced motion still circles',()=>{
 const scene=new T.Scene(),sharks=createCaySharks(scene,{phone:true});
 const count=()=>{let meshes=0;const mats=new Set();scene.traverse(o=>{if(o.isMesh){meshes++;mats.add(o.material);}});return {meshes,mats:mats.size};};
 const before=count();const c=S.createSharkCircle(()=>false);sharks.attend(c);
 const cam=new T.PerspectiveCamera(60,1,.1,1000);
 const r=sharks.regions.findIndex(g=>g.region==='causeway');const reg=sharks.regions[r];const p={x:0,z:0};
 // Look at the causeway sharks from just above shark 0.
 sharks.schools.region(r);sharks.update(0,false,cam,{x:0,z:0});
 reg.placed=false;const t0=reg.tracks[0].loop.points[0];
 cam.position.set(t0.x,40,t0.z+1);cam.lookAt(t0.x,0,t0.z);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 sharks.update(1/60,false,cam,t0);sharks.schools.at(r,0,p);
 const swimmer={x:p.x+4,z:p.z+3,swimming:true,distanceToLand:30};
 for(let i=0;i<20;i++){c.tick(1/60,swimmer,sharks.schools);sharks.update(1/60,false,cam,swimmer);}
 assert.equal(c.state.active,true,'started from the real fin positions');assert.equal(c.state.region,r);
 for(let i=0;i<200;i++){c.tick(1/60,swimmer,sharks.schools);sharks.update(1/60,false,cam,swimmer);}
 for(let m=0;m<c.state.n;m++){sharks.schools.at(r,c.ids[m],p);const d=Math.hypot(p.x-swimmer.x,p.z-swimmer.z);assert(d<S.SHARK_RING*1.2,`shark ${c.ids[m]} circles at ${d.toFixed(2)} m`);}
 // Reduced motion: the loops hold still, but the circling sharks keep turning.
 sharks.schools.at(r,c.ids[0],p);const x0=p.x,z0=p.z;for(let i=0;i<30;i++){c.tick(1/60,swimmer,sharks.schools);sharks.update(1/60,true,cam,swimmer);}
 sharks.schools.at(r,c.ids[0],p);assert(Math.hypot(p.x-x0,p.z-z0)>.2,'reduced motion: still circling');
 const after=count();assert.deepEqual(after,before,'no new meshes or materials');
 sharks.attend(null);sharks.dispose();});

ok('source: no timers, loops, audio contexts, meshes or materials in sharks.ts; caySharks place/update allocate nothing',()=>{
 const src=read('lib/town/water/sharks.ts');
 for(const bad of ['requestAnimationFrame','setInterval','setTimeout','AudioContext','Material','InstancedMesh','from \'three\'','document.'])assert(!src.includes(bad),'sharks.ts has no '+bad);
 const cay=read('lib/graphics/caySharks.ts');assert.equal((cay.match(/new T\.Mesh\w*Material/g)||[]).length,2,'still the two shark materials');assert.equal((cay.match(/new T\.InstancedMesh/g)||[]).length,2,'still two instanced meshes per region');
 const body=name=>{const i=cay.indexOf('function '+name+'(');let depth=0,j=cay.indexOf('{',i);const s=j;for(;j<cay.length;j++){if(cay[j]==='{')depth++;else if(cay[j]==='}'&&--depth===0)break;}return cay.slice(s,j);};
 for(const n of ['place','update'])assert(!/\bnew\s|\[\s*\]|\.map\(|\.filter\(/.test(body(n)),n+' allocates nothing');
 const tick=src.slice(src.indexOf('tick(dt'),src.indexOf('release()'));assert(!/\bnew\s|\[\s*\]|\.map\(|\.filter\(/.test(tick),'tick allocates nothing');});

ok('Town wiring: the tick in the water step, the bubble, the sting, the lesson toast, analytics ids in the Water section',()=>{
 const town=read('components/Town.tsx');
 assert.match(town,/createSharkCircle\(onLand\)/);assert.match(town,/world\.sharks\.attend\(sharkCircle\)/);assert.match(town,/world\.sharks\.attend\(null\)/);
 assert.match(town,/sharkCircle\.tick\(dt,\{x:location\.x,z:location\.z,swimming:water\.state\.phase==='swim'[^}]*distanceToLand:waterProbe\.d\},world\.sharks\.schools\)/);
 assert.match(town,/sharkCircle\.release\(\)/);assert.match(town,/data-shark-bubble hidden role="status">\{SHARK_LINE\}/);
 assert.match(town,/playCues\(\[\['fi2-job-cue','sting',0\]\]\)/);assert.match(town,/if\(!reduced\)water\.state\.shake=BELLY_SHAKE_TIME/,'the camera nudge is skipped with reduced motion');
 assert.match(town,/<SwimLessonToast blocked=\{toastBlocked\} which="shark"\/>/);
 assert.match(read('lib/audio/islandSound.ts'),/case 'sting':tone\(110,[^;]+;tone\(116\.5,/,'a two-note synthesized sting');
 const ids=read('lib/analytics/countIds.ts');assert.match(ids,/\['sharks_circle',/);assert.match(ids,/\['sharks_escape',/);
 const ev=read('lib/analytics/waterEvents.ts');assert.match(ev,/count\('wa:sharks_circle'\)/);assert.match(ev,/count\('wa:sharks_escape'\)/);
 const admin=read('app/admin/WaterSection.tsx');assert.match(admin,/wa:sharks_circle/);assert.match(admin,/wa:sharks_escape/);
 assert.match(read('package.json'),/node tests\/water-swim\.cjs && node tests\/water-sharks\.cjs/);});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}console.log('\nwater sharks: all passed');
