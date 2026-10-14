// Summit Isle lookout telescope (Oct 12 2026). Run: node tests/telescope.cjs
//  1. the landmarks list: the main island, Coral Cay, the KIT SHOP sign, the museum, the arcade, a stadium pitch, the East Jetty,
//     each placed from its own module, each with a line that teaches the way there, all in sight and inside the far plane
//  2. the stand: next to the summit lookout, walkable, outside the pitch fence (found from summitIsle.ts at call time)
//  3. aiming: centring picks the right landmark / glint; drag and stick pan the right way; pitch is clamped
//  4. the glint hunt: 3–5 glints, each collectable on foot; spot → saved and on the map → walk there → collected once (coins)
//  5. the 3D runtime: idle = no rAF/timers/meshes; the eyepiece narrows the same camera's FOV and restores it; glints exist only
//     while looking; the stick pans and the player stays put; spotting and collecting through the real save
//  6. wiring: SYNC_KEYS, the map marks, Town, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader,runtime,browser}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const TS=load('lib/town/telescope.ts'),SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),CC=load('lib/town/coralCay.ts'),SH=load('lib/shop/shopDoors.ts'),MU=load('lib/museum/museumDoors.ts'),EP=load('lib/town/eastPier.ts'),LM=load('lib/town/landmass.ts');
const D=Math.PI/180;
/** Is the straight line from the eye to p clear of Summit Isle's mountain (the only terrain that could hide it)? */
const clearSight=(eye,p)=>{const n=200;for(let i=4;i<n;i++){const t=i/n,x=eye.x+(p.x-eye.x)*t,z=eye.z+(p.z-eye.z)*t,y=eye.y+(p.y-eye.y)*t;if(SI.summitGround(x,z)>y+.2)return false;}return true;};

(async()=>{
const spot=TS.telescopeSpot();
await ok('landmarks: the places, from their own modules, with a line each',()=>{
 const ids=TS.TELESCOPE_LANDMARKS.map(l=>l.id);
 for(const id of ['main-island','coral-cay','kit-shop','museum','arcade','stadium','east-jetty'])assert(ids.includes(id),'has '+id);
 assert.equal(new Set(ids).size,ids.length,'unique ids');
 const by=id=>TS.TELESCOPE_LANDMARKS.find(l=>l.id===id);
 assert.deepEqual([by('coral-cay').x,by('coral-cay').z],[CC.CORAL_CAY_ARRIVAL.x,CC.CORAL_CAY_ARRIVAL.z]);
 assert.deepEqual([by('kit-shop').x,by('kit-shop').z],[SH.KIT_SHOP.x,SH.KIT_SHOP_FRONT]);assert(by('kit-shop').y>SH.KIT_SHOP.h,'the rooftop sign, above the roof');
 assert.deepEqual([by('museum').x,by('museum').z],[MU.MUSEUM_DOOR.x,MU.MUSEUM_DOOR.front]);
 assert.deepEqual([by('east-jetty').x,by('east-jetty').z],[EP.EAST_PIER.cx,EP.EAST_PIER.cz]);
 const st=by('stadium');assert(V.VENUES.some(v=>v.x===st.x&&v.z===st.z),'a stadium pitch');
 assert.match(by('coral-cay').line,/That’s Coral Cay\. Walk the Summit Sandbar to get there!/);
 for(const l of TS.TELESCOPE_LANDMARKS){assert(l.name&&l.line.length>20&&l.line.length<160,'a short line for '+l.id);
  const d=Math.hypot(l.x-spot.eye.x,l.y-spot.eye.y,l.z-spot.eye.z);assert(d<TS.SCOPE.far-50,`${l.id} within the far plane (${d.toFixed(0)} m)`);
  assert(clearSight(spot.eye,l),`${l.id} is not hidden behind the mountain`);}
});

await ok('the stand: by the summit lookout, walkable, outside the fence',()=>{
 const L=SI.SUMMIT_LANDMARKS.lookout,P=SI.SUMMIT_PITCH,F=SI.SUMMIT_FENCE;
 assert(Math.hypot(spot.x-L.x,spot.z-L.z)<=4.5,'next to the cairn');assert(SI.onSummitIsle(spot.x,spot.z),'walkable');
 assert(!(Math.abs(spot.x-P.x)<F.halfX&&Math.abs(spot.z-P.z)<F.halfZ),'outside the pitch fence');
 assert(Math.abs(spot.ground-SI.summitGround(spot.x,spot.z))<1e-9&&Math.abs(spot.eye.y-spot.ground-TS.SCOPE.eye)<1e-9,'eye height from the ground');
 assert(spot.ground>SI.SUMMIT_HEIGHT*.6,'high up: a lookout');
 const src=read('lib/town/telescope.ts');assert(/SUMMIT_LANDMARKS\.lookout/.test(src)&&/summitGround/.test(src),'derived from summitIsle.ts');
});

await ok('aiming: centring, pan directions, clamps',()=>{
 for(const l of TS.TELESCOPE_LANDMARKS){const a=TS.aimAt(spot.eye,l);assert.equal(TS.centredLandmark(spot.eye,a.yaw,a.pitch,20)?.id,l.id,'centred '+l.id);}
 const cay=TS.TELESCOPE_LANDMARKS.find(l=>l.id==='coral-cay'),a=TS.aimAt(spot.eye,cay);
 assert.equal(TS.centredLandmark(spot.eye,a.yaw+30*D,a.pitch,20),null,'nothing when looking at open sea');
 assert(Math.abs(TS.offAxis(spot.eye,a.yaw,a.pitch,cay))<1e-6);
 const v={yaw:0,pitch:0};
 assert(TS.panByDrag(v,100,0,20).yaw>0,'drag right: the view turns left (the scene follows the finger)');
 assert(TS.panByDrag(v,0,100,20).pitch>0,'drag down: look up');
 assert(TS.panByStick(v,1,0,1,20).yaw<0,'stick right: look right');assert(TS.panByStick(v,0,-1,1,20).pitch>0,'stick up: look up');
 assert(Math.abs(TS.panByDrag(v,100,0,9).yaw)<Math.abs(TS.panByDrag(v,100,0,20).yaw),'zoomed in pans finer');
 assert.equal(TS.panByDrag(v,0,1e5,20).pitch,TS.SCOPE.pitchMax*D);assert.equal(TS.panByDrag(v,0,-1e5,20).pitch,TS.SCOPE.pitchMin*D);
 const w=TS.clampView({yaw:7,pitch:0}).yaw;assert(w>-Math.PI&&w<=Math.PI);
 // Looking forward from the stand's start yaw sees the main island.
 const d=TS.viewDir(spot.yaw,0);assert(d.x<0,'starts looking west, to the main island');
});

await ok('glint hunt: 3–5 glints, spot → map → walk there → collected once',()=>{
 assert(TS.GLINT_COUNT>=3&&TS.GLINT_COUNT<=5);
 for(const g of TS.TELESCOPE_GLINTS){
  assert(LM.onLand(g.at.x,g.at.z),`${g.id}: you can walk to it`);assert(Math.hypot(g.x-g.at.x,g.z-g.at.z)<8,`${g.id}: the sparkle is where you collect it`);
  assert(clearSight(spot.eye,g),`${g.id} can be seen from the stand`);assert(g.clue.length>10);
  const a=TS.aimAt(spot.eye,g);assert.equal(TS.centredGlint(spot.eye,a.yaw,a.pitch,9,new Set())?.id,g.id,'centred '+g.id);
  assert.equal(TS.centredGlint(spot.eye,a.yaw,a.pitch,9,new Set([g.id])),null,'a spotted glint is not spotted again');}
 assert(TS.TELESCOPE_GLINTS.some(g=>g.id==='kit-shop'),'one on the KIT SHOP sign');
 let s=TS.emptyTelescopeSave();
 assert.equal(TS.collectGlint(s,'museum'),s,'cannot collect before spotting it');
 assert.equal(TS.glintAt(s,TS.TELESCOPE_GLINTS[0].at.x,TS.TELESCOPE_GLINTS[0].at.z),null);
 s=TS.spotGlint(s,'museum');assert.deepEqual(s.spotted,['museum']);assert.equal(TS.spotGlint(s,'museum'),s,'once');assert.equal(TS.spotGlint(s,'nope'),s);
 assert.deepEqual(TS.pendingGlints(s).map(g=>g.id),['museum'],'on the map');
 const m=TS.TELESCOPE_GLINTS.find(g=>g.id==='museum');
 assert.equal(TS.glintAt(s,m.at.x+TS.COLLECT_RADIUS+.5,m.at.z),null,'not from too far');assert.equal(TS.glintAt(s,m.at.x+1,m.at.z)?.id,'museum');
 s=TS.collectGlint(s,'museum');assert.deepEqual(s.collected,['museum']);assert.equal(TS.collectGlint(s,'museum'),s,'collected once');
 assert.deepEqual(TS.pendingGlints(s),[],'off the map once collected');
 assert.equal(TS.glintRewardId('museum'),'telescope-museum');
 // Repair: junk dropped, collected implies spotted, landmarks remembered.
 assert.deepEqual(TS.sanitizeTelescope({spotted:['jetty','x',5,'museum','museum'],collected:['sandbar'],seen:['coral-cay','zzz']}),{version:1,spotted:['museum','sandbar'],collected:['sandbar'],seen:['coral-cay']});
 assert.deepEqual(TS.sanitizeTelescope('junk'),TS.emptyTelescopeSave());
});

await ok('3D runtime: the eyepiece on the same camera, glints only while looking, no loops',async()=>{
 const {env,T,mod,paid,load:rl}=await runtime();
 const store=rl('lib/town/summitStore.ts'),TT=rl('lib/town/telescope.ts');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,1,500);camera.position.set(spot.x+18,spot.ground+23,spot.z+30);camera.lookAt(spot.x,spot.ground,spot.z);camera.updateMatrixWorld();
 const fun=mod.createSummitActivities(scene,{teleport:()=>{},impact:()=>{}});const before=scene.children.length;
 const el=()=>({hidden:true,dataset:{},style:{}});const kickBtn=el(),scopeBtn=el();
 const ctx=(x,z,extra={})=>({now:0,dt:1/30,elapsed:0,reduced:false,camera,width:390,height:844,x,z,onFoot:true,onGround:true,canEnter:true,sunset:true,focusKey:null,ui:s=>s.includes('summit-kick')?kickBtn:scopeBtn,place(){},hide(e,h){e.hidden=h;},...extra});
 await env.watchTimers(async()=>{for(let i=0;i<100;i++){fun.update(ctx(120,40));fun.applyCamera(camera,1/30,false);}});
 assert.equal(env.counts.raf+env.counts.timeout+env.counts.interval,0,'idle: no rAF or timers');assert.equal(scene.children.length,before,'idle: no glints in the scene');
 assert.equal(fun.update(ctx(spot.x+1,spot.z))?.key,'telescope','the stand wants the focus nearby');
 assert.equal(fun.update(ctx(spot.x+1,spot.z,{onFoot:false,onGround:true}))?.key,'telescope','…from a bike, scooter or moped too (user, Oct 14)');
 assert.equal(fun.update(ctx(spot.x+1,spot.z,{onFoot:false,onGround:false})),null,'…but not while flying');
 fun.update(ctx(spot.x+1,spot.z,{focusKey:'telescope'}));assert.equal(scopeBtn.hidden,false,'Look through the telescope');
 store.summitActions.openScope();assert(store.scopeStore.get().active);
 const glints=scene.getObjectByName('telescope-glints');assert(glints&&glints.children.length===TT.GLINT_COUNT,'glint sprites only now');
 await env.watchTimers(async()=>{for(let i=0;i<40;i++){fun.applyCamera(camera,1/30,false);fun.update(ctx(spot.x+1,spot.z));}});
 assert.equal(env.counts.raf+env.counts.timeout+env.counts.interval,0,'looking: still no loops of its own');
 assert(Math.abs(camera.fov-TT.SCOPE.fov[0])<.5,`narrow FOV (${camera.fov.toFixed(1)})`);assert.equal(camera.far,TT.SCOPE.far);
 assert(camera.position.distanceTo(new T.Vector3(spot.eye.x,spot.eye.y,spot.eye.z))<1e-6,'at the eyepiece');
 assert.equal(store.scopeStore.get().label?.id,'main-island','starts on the main island, named');
 // The stick pans; the player stays put (kick cleared, movement skipped).
 const input={x:1,z:0,kick:true,juggle:true,shotPower:.5};const yaw0=camera.rotation.y;
 assert.equal(fun.holdPlayer(input,new Set(),1/60),true);assert.equal(input.kick,false);assert.equal(input.shotPower,0);
 for(let i=0;i<30;i++)fun.holdPlayer({x:1,z:0,kick:false,juggle:false},new Set(),1/60);fun.applyCamera(camera,1/30,false);assert.notEqual(camera.rotation.y,yaw0,'the view turned');
 // Zoom, then centre the KIT SHOP glint and hold: spotted, saved, on the map.
 store.summitActions.zoom();for(let i=0;i<30;i++)fun.applyCamera(camera,1/30,false);assert(Math.abs(camera.fov-TT.SCOPE.fov[1])<.3,'zoomed');
 const g=TT.TELESCOPE_GLINTS.find(x=>x.id==='kit-shop'),aim=TT.aimAt(spot.eye,g);
 const saved=()=>JSON.parse(env.store.get('fi2-telescope-v1')??'{"spotted":[],"collected":[]}');
 // Steer with pan() (the HUD's drag command): the drag that turns the starting view onto the glint.
 const D2=TT.SCOPE.dragDegPerPx*TT.SCOPE.fov[1]/TT.SCOPE.fov[0]*D,start=TT.aimAt(spot.eye,TT.TELESCOPE_LANDMARKS[0]);
 // Reset to a known view: exit and reopen (starts on the main island, wide), zoom in, then drag onto the glint.
 store.summitActions.exitScope();assert.equal(scene.getObjectByName('telescope-glints'),undefined,'glints gone on exit');
 fun.applyCamera(camera,1/30,false);assert.equal(camera.fov,40,'the normal FOV is back');assert.equal(camera.far,500,'and the far plane');
 store.summitActions.openScope();store.summitActions.zoom();
 let dyaw=aim.yaw-start.yaw;dyaw=Math.atan2(Math.sin(dyaw),Math.cos(dyaw));store.summitActions.pan(dyaw/D2,(aim.pitch-start.pitch)/D2);
 for(let i=0;i<20;i++){fun.applyCamera(camera,1/30,false);fun.update(ctx(spot.x+1,spot.z,{dt:1/30}));}
 assert(!saved().spotted.includes('kit-shop'),'not before the eyepiece arrives and the hold fills');assert(store.scopeStore.get().spotting?.id==='kit-shop','the ring fills');
 for(let i=0;i<40;i++){fun.applyCamera(camera,1/30,false);fun.update(ctx(spot.x+1,spot.z,{dt:1/30}));}
 assert(saved().spotted.includes('kit-shop'),'held in the centre: spotted and saved');
 assert.match(store.scopeStore.get().note,/Glint spotted!/);assert.equal(store.scopeStore.get().found,1);
 assert(env.counts.events.some(e=>e==='fi2-vending-cue:equip'),'a cheer');
 store.summitActions.exitScope();fun.applyCamera(camera,1/30,false);
 // Walk to the KIT SHOP door: collected once, 5 learning coins.
 fun.update(ctx(g.at.x+20,g.at.z));assert(!saved().collected.includes('kit-shop'),'not from far away');
 fun.update(ctx(g.at.x+.5,g.at.z,{onFoot:false,onGround:false}));assert(!saved().collected.includes('kit-shop'),'not while flying over');
 fun.update(ctx(g.at.x+.5,g.at.z));fun.update(ctx(g.at.x+.5,g.at.z));await new Promise(r=>setImmediate(r));
 assert(saved().collected.includes('kit-shop'),'collected on foot');
 assert.deepEqual(paid.filter(p=>p.id==='learn:explore:telescope-kit-shop').map(p=>p.amount),[5],'paid once, 5 coins');
 assert(env.counts.events.some(e=>e.startsWith('fi2-learn-coins-earned')),'the island coin toast');
 fun.dispose();assert.equal(scene.children.length,before,'nothing left behind');
});

await ok('wiring: saves, map marks, Town, npm test',()=>{
 const S=load('lib/saves/snapshot.ts');assert(S.SYNC_KEYS.includes(TS.TELESCOPE_SAVE_KEY),'found glints sync with the save code');
 assert(/TelescopeGlintMarks/.test(read('components/IslandOverview.tsx'))&&/pendingGlints/.test(read('components/TelescopeGlintMarks.tsx')),'spotted glints on the maps');
 const town=read('components/Town.tsx');assert(/<TelescopeView\/>/.test(town)&&/summitFun\.holdPlayer\(input\.current,keys,dt\)/.test(town));
 const view=read('components/TelescopeView.tsx').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');assert(!/requestAnimationFrame|setInterval|setTimeout/.test(view),'the eyepiece HUD runs no loop');
 assert(/data-telescope-open/.test(view)&&/Look through the telescope/.test(view));
 assert(/node tests\/telescope\.cjs/.test(read('package.json')));
});
console.log(failed?`\ntelescope: ${failed} failed`:'\ntelescope: all passed');process.exit(failed?1:0);
})();
