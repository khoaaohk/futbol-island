// Ride ground contact (owner, Oct 23 2026: "looks like it's going into the ground too much"): builds each ground ride as the town does
// (lib/graphics/vehicle.ts at the 1.12 ride scale, every variant) with the rider, then poses it like components/Town.tsx for the idle ride,
// every 1/60 s frame of the 15 ride emotes (lib/town/rideEmotes.ts sampleRideTrick + trickRootOffset) and every frame of the ride tricks
// (lib/town/rideTricks.ts createRideTricks, both actions, every variant), on flat ground at y = 0. It reports the lowest world y of the
// tyres (Box3 over the visible wheel / tyre torus meshes) per ride: negative = into the ground. `node scripts/check-ride-ground.cjs` prints the
// table; tests/ride-ground.cjs requires measure().
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),req=require('node:module').createRequire(ROOT+'/package.json'),cache=new Map();
function load(file){
 const full=path.resolve(ROOT,file);if(cache.has(full))return cache.get(full);const mod={exports:{}};cache.set(full,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {exports:mod.exports,module:mod,Math,console,Float32Array,Number,Array,Object,Map,Set,WeakMap,
   require:id=>{if(id.startsWith('.')||id.startsWith('@/')){const p=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(full),id);return load(fs.existsSync(p+'.ts')?p+'.ts':p+'.tsx');}return req(id);}});
 cache.set(full,mod.exports);return mod.exports;
}
function measure(){
 const T=req('three'),{createVehicle}=load('lib/graphics/vehicle.ts'),{createPlayer}=load('lib/graphics/player.ts'),{DEFAULT_CUSTOMIZATION:D}=load('lib/town/customization.ts');
 const R=load('lib/town/rideEmotes.ts'),{createRideTricks,GROUND_SIGNATURES}=load('lib/town/rideTricks.ts');
 const vehicle=createVehicle(),player=createPlayer('ride-ground','home'),box=new T.Box3(),buf=new Float32Array(R.RT_CH),off={x:0,y:0,z:0};
 const VARIANTS={scooter:['classic','mint','stunt','comet'],bike:['classic','bmx','road','mountain'],moped:['classic','retro','delivery','sport']};
 const tyres=[];vehicle.root.traverse(o=>{const g=o.geometry;if(g&&g.type==='TorusGeometry'&&Math.abs(g.parameters.arc-Math.PI*2)<1e-6&&!o.name)tyres.push(o);});
 const visible=o=>{for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;};
 // Lowest visible tyre point and lowest rider point (world y; the ground is y = 0).
 const low=()=>{vehicle.root.updateMatrixWorld(true);player.root.updateMatrixWorld(true);let y=Infinity;
  for(const t of tyres)if(visible(t)){box.setFromObject(t,true);y=Math.min(y,box.min.y);}return y;};
 // Town: vehicle.update, then root y = ground, order YXZ, scale 1.12, then the trick / emote offsets.
 const pose=(mode,variant,{lift=0,pitch=0,yaw=0,roll=0,vyaw=0,x=0,z=0}={})=>{
  vehicle.setCustomization({...D,[mode]:variant});vehicle.update(mode,0,0,0,1/60,0);
  const r=vehicle.root;r.rotation.order='YXZ';r.scale.setScalar(1.12);r.position.set(x,lift,z);r.rotation.set(pitch,yaw+vyaw,roll,'YXZ');
  player.update(0,0,1/60,0,true,{travelMode:mode});player.root.rotation.order='YXZ';player.root.position.set(x,lift,z);player.root.rotation.set(pitch,yaw,roll,'YXZ');
  return low();
 };
 const rows=[];
 for(const mode of ['scooter','bike','moped'])for(const variant of VARIANTS[mode]){
  rows.push({mode,variant,what:'idle',frame:0,y:pose(mode,variant)});
  for(const sc of R.rideScriptsFor(mode))for(let i=0,a=0;a<=sc.seconds+1e-9;i++,a=i/60){
   const p=R.sampleRideTrick(sc.emote,a,buf);R.trickRootOffset(p,0,off);
   rows.push({mode,variant,what:'emote '+sc.label,frame:i,y:pose(mode,variant,{lift:off.y,x:off.x,z:off.z,pitch:p[R.RT.PITCH],roll:p[R.RT.ROLL],yaw:p[R.RT.YAW],vyaw:p[R.RT.VYAW]})});
  }
  for(const action of [0,1]){const tr=createRideTricks();tr.start(mode,action);
   for(let i=0;i<400&&tr.state.active;i++){const q=tr.update(1/60,mode,false,variant,false);rows.push({mode,variant,what:'trick '+action,frame:i,y:pose(mode,variant,q)});}}
 }
 vehicle.dispose();player.dispose&&player.dispose();return rows;
}
module.exports={measure,load};
if(require.main===module){
 const rows=measure(),worst={};
 for(const r of rows){const k=r.mode+' '+r.what;if(!worst[k]||r.y<worst[k].y)worst[k]=r;}
 const byMode={};for(const r of rows)if(!byMode[r.mode]||r.y<byMode[r.mode].y)byMode[r.mode]=r;
 for(const k of Object.keys(worst)){const r=worst[k];console.log(`${k.padEnd(34)} ${(r.y*100).toFixed(1).padStart(7)} cm  (${r.variant}, frame ${r.frame})`);}
 console.log('WORST:',Object.values(byMode).map(r=>`${r.mode} ${(r.y*100).toFixed(1)} cm (${r.variant} ${r.what} f${r.frame})`).join('; '));
}
