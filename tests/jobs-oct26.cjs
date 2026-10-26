// Jobs polish (Oct 26 2026, owner): a gentle work-camera ease-in while a job action is held; the first job's "Pick a card" shows
// before the payday card; the leaf piles lie off the 7v7 pitch (also checked on the real town by tests/job-boards.cjs).
// Run: node tests/jobs-oct26.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
// 1. Work camera: eases in gently (no jump on the first frame), reaches the dolly, lingers between holds, eases out, never with
// reduced motion or while another shot camera is busy.
const W=load('lib/town/jobs/workCamera.ts'),dt=1/60,s=W.newWorkCam();
const run=(sec,o)=>{let a=0;for(let t=0;t<sec;t+=dt)a=W.stepWorkCam(s,dt,{active:true,holding:false,busy:false,reduced:false,...o});return a;};
const first=W.stepWorkCam(s,dt,{active:true,holding:true,busy:false,reduced:false});
assert.ok(first>0&&first<.001,`first frame barely moves (${first})`);
const half=run(.5,{holding:true});assert.ok(half>.03&&half<W.WORK_DOLLY*.6,`gentle after 0.5 s (${half.toFixed(3)})`);
const full=run(3,{holding:true});assert.ok(Math.abs(full-W.WORK_DOLLY)<.01,'fully in while holding');
const gap=run(.8,{holding:false});assert.ok(gap>W.WORK_DOLLY*.98,'stays in through a short gap between holds');
const out=run(4,{holding:false});assert.equal(out,0,'eases back out after the action');
run(3,{holding:true});assert.equal(run(3,{holding:true,busy:true}),0,'gives way to a shot camera');
assert.equal(W.stepWorkCam(W.newWorkCam(),dt,{active:true,holding:true,busy:false,reduced:true}),0,'reduced motion: no dolly');
assert.equal(run(1,{active:false,holding:true}),0,'no job, no dolly');
const scene=read('lib/town/jobs/jobScene.ts'),town=read('components/Town.tsx');
assert.ok(scene.includes('stepWorkCam(workCam,dt,{active:!!run,holding:!!run?.holding,busy,reduced})')&&scene.includes('restoreCamera:(camera:T.PerspectiveCamera)=>{if(workApplied){camera.position.sub(workOffset);'));
assert.ok(town.includes('moveNudge.restore(camera);emoteCam.restore(camera);jobs.restoreCamera(camera);'),'Town undoes the dolly before its follow lerp');
// 2. Pick a card first: the payday card (and the toast) wait while a card offer is open.
const jobs=read('components/IslandJobs.tsx');
assert.ok(jobs.includes('pickSurface({card:!!bugCard,payday:!!payday&&!cardOfferOpen,'),'payday waits behind the card offer');
assert.ok(town.includes('cardOfferOpen={cardOfferOpen}'),'Town passes the card offer state');
// 3. Leaf piles off the 7v7 pitch (≥ 1.5 m outside its rectangle).
const cat=read('lib/town/jobs/jobCatalog.ts'),leaves=JSON.parse(cat.match(/const LEAVES:JobPoint\[\]=(\[\[[^;]*?\]\])\.map/)[1]);
const v=read('lib/town/venues.ts').match(/\{id:'7v7',name:'Old Town Ground',x:([-\d.]+),z:([-\d.]+),width:([^,]+),length:([^,]+),/);
const [x,z,w,l]=[v[1],v[2],v[3],v[4]].map(e=>Function('return '+e)());
assert.equal(leaves.length,12);for(const [px,pz] of leaves)assert.ok(Math.abs(px-x)>w/2+1.5||Math.abs(pz-z)>l/2+1.5,`leaf pile (${px}, ${pz}) is off the pitch`);
console.log('jobs-oct26 ok');
