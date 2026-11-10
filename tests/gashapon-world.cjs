// Gashapon round 2 (Nov 8 2026, docs/gashapon-design.md): the 14 machines in the 3D world (12 on the island inside buildTown's
// static batches, 2 in the Arcade room), their colliders and walk-up clearance, the draw-call budget (the island's solid pieces
// add no batch; the globes add at most one draw per 50 m cell), the Coral Cay Konbini making room, the browser store wiring
// (fi2-gashapon-v1, the arcade wallet, no double charge) and the prompt/panel wiring in Town and the Arcade.
// usage: node tests/gashapon-world.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),storage=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,structuredClone,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent(){},matchMedia:()=>({matches:false})},CustomEvent:class{constructor(t,o){this.type=t;this.detail=o&&o.detail;}},Event:class{constructor(t){this.type=t;}},navigator:{locks:{request:(_k,fn)=>Promise.resolve().then(fn)}},crypto:{randomUUID:()=>'id-'+Math.random().toString(36).slice(2)},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
/** Deep equality across the vm realm (plain JSON data). */
const same=(a,b,m)=>assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};


const M=load('lib/gashapon/machines.ts'),G=load('lib/graphics/gashaponMesh.ts'),CC=load('lib/town/coralCay.ts');
const all=M.GASHAPON_MACHINES,island=M.islandGashaponMachines(),arcade=all.filter(m=>m.zone==='arcade');
const meshes=root=>{const out=[];root.traverse(o=>{if(o.isMesh)out.push(o);});return out;};
const build=()=>{const scene=new T.Scene(),world=load('lib/town/world.ts').buildTown(scene);return {scene,world};};
const worldFile=path.resolve(base,'lib/town/world.ts'),gashaFile=path.resolve(base,'lib/town/gashaponWorld.ts');

const withG=build();
// The same town with the gashapon build stubbed out: the difference is what the machines cost.
cache.delete(worldFile);const realGasha=cache.get(gashaFile);cache.set(gashaFile,{buildGashaponProps:()=>({machines:0})});
const without=build();cache.set(gashaFile,realGasha);cache.delete(worldFile);

await ok('the shared machine: one glass globe, capsules, crank, coin slot, tray and a themed topper; a small vertex budget',()=>{
 const b=G.gashaponBases();
 for(const [i,m] of all.entries()){const p=G.gashaponPieces(m,i,b),st=M.gashaStyleOf(m),globes=G.GASHA_STYLE_GLOBES[st];assert.equal(p.filter(x=>x.glass).length,globes,m.id+': its style globes (Nov 10 2026: double / twin have two)');
  const verts=p.reduce((n,x)=>n+x.geometry.getAttribute('position').count,0);assert(verts<(globes>1?6000:4000),`${m.id}: ${verts} vertices (< 4000, two globes < 6000)`);
  const colors=new Set(p.map(x=>x.color.toLowerCase()));assert(colors.has(m.color.toLowerCase())&&colors.has(m.accent.toLowerCase()),m.id+': its own cabinet + accent colours');
  const top=Math.max(...p.map(x=>{x.geometry.computeBoundingBox();return x.geometry.boundingBox.max.y;}));assert(Math.abs(top-G.GASHA_STYLE_DIMS[st].top)<.13&&top<2.3,m.id+': its style height ('+top.toFixed(2)+' m)');
  p.forEach(x=>x.geometry.dispose());}
 G.disposeBases(b);
 const src=read('lib/graphics/gashaponMesh.ts')+read('lib/town/gashaponWorld.ts');assert(!/Light\(|CanvasTexture|requestAnimationFrame|setInterval/.test(src),'no lights, textures or loops');
});

await ok('island: 12 machines built, each a collider; solid pieces join the paint batches, globes 1 draw per 50 m cell, ≤ 2 draws per site',()=>{
 const foot=withG.world.obstacles.filter(o=>island.some(m=>Math.abs(m.x-o.x)<.01&&Math.abs(m.z-o.z)<.01));assert.equal(foot.length,12,'12 footprints');
 for(const o of foot){const m=island.find(m=>Math.abs(m.x-o.x)<.01&&Math.abs(m.z-o.z)<.01);{const q=Math.abs(Math.sin(m.yaw))>.7,/* Nov 10 2026: the summit machine faces east (quarter turn), so its footprint's w and d swap */S=M.GASHA_STYLE_SIZE[M.gashaStyleOf(m)]/* Nov 10 2026: each body style its own size */,cw=q?S.d:S.w,cd=q?S.w:S.d;assert(o.w>=cw&&o.d>=cd&&o.w<1.6&&o.d<1.6,m.id+' footprint covers the cabinet');}}
 const a=meshes(withG.scene),b=meshes(without.scene);
 const glass=a.filter(x=>x.material&&x.material.name==='gashapon-glass');
 const cells=new Set(island.map(m=>`${Math.floor(m.x/50)}:${Math.floor(m.z/50)}`));
 assert.equal(glass.length,cells.size,`globe draws = cells with machines (${glass.length} vs ${cells.size})`);
 const sq=island.filter(m=>m.zone==='konbini-square'),cay=island.filter(m=>m.zone==='konbini-cay');
 for(const pair of [sq,cay])assert.equal(new Set(pair.map(m=>`${Math.floor(m.x/50)}:${Math.floor(m.z/50)}`)).size,1,'a Konbini pair shares one cell (one globe draw)');
 const extra=a.length-b.length;{const tally=list=>{const t=new Map();for(const x of list){const k=(x.name||'?').replace(/[0-9a-f]{8}-[0-9a-f-]{27}/,'')+'|'+(x.material?.name||x.material?.type)+'|'+!!x.material?.vertexColors;t.set(k,(t.get(k)??0)+1);}return t;};
  const ta=tally(a),tb=tally(b),diff=[...ta].filter(([k,n])=>n>(tb.get(k)??0)).map(([k,n])=>k+' +'+(n-(tb.get(k)??0)));if(process.env.GASHA_DEBUG)console.log('     new:',diff.join(' '));}
 console.log(`     island meshes: ${b.length} without machines, ${a.length} with (+${extra}; globes ${glass.length})`);
 // Each cell gains its globe batch, plus a paint batch only where the cell had no shadow-casting paint yet (Eleven Park's).
 assert(extra<=2*cells.size&&extra<=glass.length+2,`globes + at most a couple of new paint batches (+${extra} meshes, ${glass.length} globe batches)`);
 // Draw budget per machine: ≤ 3 at worst (solid 0 extra + 1 globe draw shared by the machines in that cell).
 assert(extra/island.length<=3,'≤ 3 draws per machine');
});

await ok('walk-up spots are clear: 0.9 m in front of each glass, no collider; the Konbini doors stay open',()=>{
 const own=o=>all.some(m=>Math.abs(m.x-o.x)<.01&&Math.abs(m.z-o.z)<.01);
 const solid=[...withG.world.obstacles.filter(o=>!own(o)),...withG.world.buildings];
 for(const m of island){const fx=m.x+Math.sin(m.yaw)*.9,fz=m.z+Math.cos(m.yaw)*.9;
  for(const o of solid)assert(!(Math.abs(fx-o.x)<o.w/2+.25&&Math.abs(fz-o.z)<o.d/2+.25),`${m.id}: walk-up spot clear of the collider at (${o.x.toFixed(2)}, ${o.z.toFixed(2)})`);}
 // Doorway: 1.2 m either side of each Konbini door centre line, 3 m out from the front, holds no gashapon footprint.
 for(const [doorX,front] of [[M.SQUARE_DOOR_X,load('lib/town/vendingPlaces.ts').ISLAND_SQUARE_KONBINI.front],[M.CAY_DOOR_X,CC.CAY_KONBINI.front]])
  for(const m of island){const f=G.gashaponFootprint(m);assert(!(Math.abs(f.x-doorX)<f.w/2+1.2&&f.z-f.d/2<front+3&&f.z+f.d/2>front),`${m.id} keeps the door at x ${doorX} clear`);}
});

await ok('Coral Cay Konbini made room: no west potted plant, the bench moved 2 m west, no exemption left in the data test',()=>{
 const K=CC.CAY_KONBINI,door=CC.CAY_KONBINI_DOOR.x;
 assert(!withG.world.obstacles.some(o=>Math.abs(o.x-(door-2.25))<.05&&Math.abs(o.z-(K.front+.6))<.05),'the west planter is gone');
 assert(withG.world.obstacles.some(o=>Math.abs(o.x-(K.x-5.4))<.05&&Math.abs(o.z-(K.front+2.2))<.05&&o.w===2.2),'the bench stands at x − 5.4');
 assert(!/GASHAPON_MAKE_ROOM/.test(read('tests/gashapon-data.cjs')+read('lib/gashapon/machines.ts')),'the make-room exemption is removed');
});

await ok('arcade room: the pair is one solid + one glass mesh (2 draws), with colliders, and the room reports the nearest machine',()=>{
 const src=read('lib/arcade/arcadeRoomProps.ts');
 assert(/mergedGashapon\(gashaMachines\)/.test(src)&&/gashaMachines\.map\(m=>\(\{x:m\.x,z:m\.z,halfX/.test(src),'merged pair + colliders');
 const g=G.mergedGashapon(arcade);assert(g.solid.getAttribute('color')&&g.solid.getAttribute('position').count>0&&g.glass.getAttribute('position').count>0,'solid (vertex colours) + glass');
 const box=new T.Box3().setFromBufferAttribute(g.solid.getAttribute('position'));assert(box.min.z> -10.7&&box.max.y<2.1,'inside the room, under 2.1 m');g.solid.dispose();g.glass.dispose();
 assert(/onGashaponNear\?:\(id:string\|null\)=>void/.test(read('lib/arcade/arcadeRoomScene.ts'))&&/props\.gashapon/.test(read('lib/arcade/arcadeRoomScene.ts')),'proximity in the room scene');
 const room=read('components/ArcadeRoom.tsx');assert(/setSocialNear,setGashaNear\)/.test(room)&&/gashaponPanel\.open\(gashaNear\)/.test(room)&&/<GashaponPanel\/>/.test(room),'ArcadeRoom shows the prompt and the panel');
});

await ok('island prompt: nearest machine within reach on foot, HUD-stack key, hidden while the panel is open',()=>{
 const P=load('lib/graphics/gashaponPrompt.ts'),pr=P.createGashaponPrompt(),m=island[0],cam=new T.PerspectiveCamera(50,1,.1,500);
 cam.position.set(m.x+10,15,m.z+20);cam.lookAt(m.x,1,m.z);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 const el={dataset:{},hidden:true,setAttribute(k,v){this[k]=v;}};let placed=null;
 const base0={x:m.x+Math.sin(m.yaw)*1.2,z:m.z+Math.cos(m.yaw)*1.2,groundY:m.y,onFoot:true,canEnter:true,focusKey:P.GASHAPON_FOCUS_KEY,panelOpen:false,camera:cam,width:800,height:600,ui:()=>el,place:(_e,x,y)=>{placed={x,y};},hide:(e,h)=>{e.hidden=h;}};
 const w=pr.update(base0);assert(w&&w.key==='gashapon'&&w.distance<P.GASHAPON_REACH,'wants the slot near the glass');assert.equal(el.hidden,false);assert.equal(el.dataset.gashaponGo,m.id);assert(placed);
 assert.equal(pr.update({...base0,panelOpen:true}),null,'not while the panel is open');assert.equal(el.hidden,true);
 assert.equal(pr.update({...base0,onFoot:false}),null,'not flying / riding a truck');
 assert.equal(pr.update({...base0,x:m.x+30}),null,'not from afar');
 pr.update({...base0,focusKey:'other'});assert.equal(el.hidden,true,'hidden when another prompt holds the slot');
 const town=read('components/Town.tsx');
 assert(/gashaPrompt\.update\(\{/.test(town)&&/if\(gashaWant\)cands\.push\(\{kind:'enter',key:gashaWant\.key/.test(town)&&/<GashaponHud\/>/.test(town),'wired in Town (update, HUD stack, HUD)');
});

await ok('Nov 9: desktop hover glows the machine and wins over the Konbini; opening zooms onto the glass, then the panel; closing zooms out',()=>{
 const P=load('lib/graphics/gashaponPrompt.ts'),scene=new T.Scene(),pr=P.createGashaponPrompt(scene),m=island.find(x=>x.id==='gs-square-snacks'),cam=new T.PerspectiveCamera(50,1.6,.1,500);
 assert(scene.getObjectByName('gashapon-selection'),'one shared glow root');
 const ray=new T.Raycaster(new T.Vector3(m.x,m.y+1,m.z+12),new T.Vector3(0,0,-1));
 assert.equal(pr.hover(ray,1000)?.id,m.id,'the ray hits its box');assert(pr.hoverDistance<12);
 const el={dataset:{},hidden:true,matches:()=>false,setAttribute(k,v){this[k]=v;}};
 cam.position.set(m.x+16,24,m.z+33);cam.lookAt(m.x,1,m.z);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 const far={x:m.x+40,z:m.z+40,groundY:0,onFoot:true,canEnter:true,focusKey:P.GASHAPON_FOCUS_KEY,panelOpen:false,camera:cam,width:800,height:600,ui:()=>el,place:()=>{},hide:(e,h)=>{e.hidden=h;},dt:.016,reduced:false};
 const w=pr.update(far);assert(w&&w.distance===-1,'hover = explicit intent (-1), from afar');assert.equal(el.dataset.gashaponGo,m.id);
 assert(scene.getObjectByName('building-outline-glow').visible,'the green glow shows');
 const miss=new T.Raycaster(new T.Vector3(m.x,m.y+30,m.z+12),new T.Vector3(0,0,-1));
 assert.equal(pr.hover(miss,1300)?.id,m.id,'held for the trip up to the button');assert.equal(pr.hover(miss,1000+P.HOVER_GRACE+1),null,'then released');
 assert.equal(pr.holdHover(m.id,5000)?.id,m.id,'the pointer on the button keeps it');pr.hover(null);
 // Reduced motion (round 5): the camera cuts to the machine on the next frame (no travel), then the controls open.
 let opened=0;pr.focus(m.id,()=>opened++,true);assert.equal(opened,0);pr.applyCamera(cam,.016,true);assert.equal(opened,1,'reduced: open after one cut');
 pr.update({...far,panelOpen:false});pr.applyCamera(cam,.016,true);assert.equal(pr.focused,null,'reduced: the cut back');
 pr.focus(m.id,()=>opened++,false);pr.focus(m.id,()=>opened++,false);assert(pr.zooming&&pr.focused===m.id);
 for(let i=0;i<80&&opened<2;i++){cam.position.set(m.x+16,24,m.z+33);cam.lookAt(m.x,1,m.z);pr.applyCamera(cam,.05,false);}
 assert.equal(opened,2,'the panel opens once on arrival (no double open)');assert(!pr.zooming&&cam.position.distanceTo(new T.Vector3(m.x,1,m.z))<6,'the camera framed the machine');
 assert.equal(pr.update({...far,panelOpen:true}),null,'no button while open');
 pr.update({...far,panelOpen:false});assert(pr.zooming,'closing the panel zooms back out');
 for(let i=0;i<80&&pr.focused;i++)pr.applyCamera(cam,.05,false);assert.equal(pr.focused,null,'back on the follow camera');
 // Escape during the zoom-in: tested by the browser check; here release() mid-zoom never opens the panel.
 pr.focus(m.id,()=>opened++,false);pr.applyCamera(cam,.05,false);pr.release();for(let i=0;i<80&&pr.focused;i++)pr.applyCamera(cam,.05,false);assert.equal(opened,2,'backing out mid-zoom opens nothing');
 pr.dispose();assert(!scene.getObjectByName('gashapon-selection'));
 const town=read('components/Town.tsx'),hud=read('components/GashaponHud.tsx');
 assert(/gashaPrompt\.hover\(hoverPoint&&canEnter/.test(town)&&/gashaPrompt\.holdHover\(btn\.dataset\.gashaponGo,now\)/.test(town),'Town: hover + held on the button');
 assert(/overMuseum=!!\(hoverPoint&&canEnter&&!overGasha&&/.test(town)&&/buildingHover=!!hoverPoint&&canEnter&&!overGasha/.test(town),'a hovered machine suppresses the building hover');
 assert(/gashaPrompt\.applyCamera\(camera,dt,reduced\)/.test(town)&&/gashaponOpener\.set\(id=>gashaPrompt\.focus\(id,\(\)=>gashaponPanel\.open\(id\)\)\)/.test(town)&&/gashaPrompt\.pick\(characterRay\)/.test(town),'Town: zoom camera, opener, tap on a machine');
 assert(/gashaponOpener\.open\(id\)/.test(hud),'the button goes through the opener');
 assert(/gashaponPanel\.open\(gashaNear\)/.test(read('components/ArcadeRoom.tsx')),'the arcade pair still opens straight away');
});

await ok('round 5: the open machine is its own interface: static copy folded out, a live animated copy (≤ 7 draws, only while open), anchors for the controls, no modal on the island',()=>{
 const S=withG.world.gashaponStatic,m=island.find(x=>x.id==='gs-square-snacks');assert(S&&S.has(m.id),'world.ts knows the machine\'s vertex runs');
 // hide folds every vertex run of that machine to one point; show restores the exact positions.
 const chunks=meshes(withG.scene).filter(x=>/^island-chunk-/.test(x.name));const before=chunks.map(x=>Float32Array.from(x.geometry.getAttribute('position').array));
 S.hide(m.id);const changed=chunks.filter((x,i)=>{const a=x.geometry.getAttribute('position').array;for(let j=0;j<a.length;j++)if(a[j]!==before[i][j])return true;return false;});
 assert(changed.length>=1&&changed.length<=2,`one solid chunk (+ its globe chunk) changed (${changed.length})`);
 S.show(m.id);chunks.forEach((x,i)=>assert.deepEqual(Array.from(x.geometry.getAttribute('position').array),Array.from(before[i]),'restored'));
 // The prompt swaps in the live copy when a zoom starts and disposes it when it ends.
 const P=load('lib/graphics/gashaponPrompt.ts'),Face=load('lib/gashapon/gashaponFace.ts'),scene=new T.Scene(),calls=[];
 const pr=P.createGashaponPrompt(scene,{hide:id=>calls.push('hide:'+id),show:id=>calls.push('show:'+id)}),cam=new T.PerspectiveCamera(50,1.6,.1,500);
 let anchors=null;const off=Face.gashaponFace.watch(a=>{anchors=a;});
 pr.focus(m.id,()=>{},false);const live=scene.getObjectByName('gashapon-live');assert(live,'live copy built on focus');same(calls,['hide:'+m.id]);
 const draws=[];live.traverse(o=>{if(o.isMesh)draws.push(o);});assert(draws.length<=7,`live copy: ${draws.length} meshes (≤ 7)`);
 assert.equal(new Set(draws.filter(x=>!x.material.transparent).map(x=>x.material)).size,1,'one shared solid material');
 assert(draws.every(x=>!x.castShadow),'no shadow casting');
 for(let i=0;i<80;i++){cam.position.set(m.x+16,24,m.z+33);cam.lookAt(m.x,1,m.z);pr.applyCamera(cam,.05,false);}
 assert(anchors&&anchors.id===m.id&&Math.abs(anchors.knob.x)<1&&Math.abs(anchors.tray.y)<1,'the knob and tray project on screen');
 assert(anchors.knob.x<anchors.tray.x&&anchors.coin.y<anchors.knob.y,'knob left of the tray; the coin plate under the knob');
 // A spin: the knob turns, then (once paid) the capsule drops into the tray and reports it once.
 const L=pr.live;let landed=0;assert(Face.gashaponFx.spin(m.id,()=>landed++),'the face drives the live machine');
 const crank=live.children.find(c=>c.children[0]?.name==='gashapon-live-crank');
 for(let i=0;i<6;i++)pr.applyCamera(cam,.05,false);assert(Math.abs(crank.rotation.z)>.3,'the knob turns');assert(Face.gashaponFx.drop(m.id));
 for(let i=0;i<60;i++)pr.applyCamera(cam,.05,false);assert.equal(landed,1,'the capsule lands once');assert.equal(L.phase,'tray');
 assert(Face.gashaponFx.crack(m.id),'tap opens it');for(let i=0;i<20;i++)pr.applyCamera(cam,.05,false);assert.equal(L.phase,'idle');
 assert.equal(Face.gashaponFx.crack(m.id),false,'nothing to crack once opened');
 pr.release();for(let i=0;i<80&&pr.focused;i++)pr.applyCamera(cam,.05,false);
 assert(!scene.getObjectByName('gashapon-live'),'live copy disposed after zooming out');same(calls,['hide:'+m.id,'show:'+m.id]);assert.equal(anchors,null,'anchors cleared');
 off();pr.dispose();
 const hud=read('components/GashaponHud.tsx'),src=read('lib/graphics/gashaponLive.ts');
 assert(/<GashaponMachineFace\/>/.test(hud)&&!/import\(['"]\.\/GashaponPanel/.test(hud),'the island mounts the machine face, not the modal panel');
 assert(!/role="dialog"|aria-modal/.test(read('components/GashaponMachineFace.tsx')),'no dialog on the island');
 assert(!/Light\(|CanvasTexture|requestAnimationFrame|setInterval/.test(src),'live copy: no lights, textures or loops of its own');
 assert(/createGashaponPrompt\(scene,world\.gashaponStatic\)/.test(read('components/Town.tsx')),'Town passes the static copies');
});

await ok('QA Nov 9: a Konbini pair\'s left-hand neighbour moves the knob label and tag onto the machine; no summit hiker inside a machine',()=>{
 // The label (left of the knob) and the coins / cap tag sat over the neighbouring cabinet: a machine with a neighbour on its
 // left (seen from the front) puts them above the knob / under the coin plate (components/GashaponMachineFace.tsx hasLeftNeighbour).
 const left=island.filter(m=>island.some(o=>o.id!==m.id&&Math.hypot(o.x-m.x,o.z-m.z)<1.6&&((o.x-m.x)*Math.cos(m.yaw)-(o.z-m.z)*Math.sin(m.yaw))<0)).map(m=>m.id).sort();
 same(left,['gs-cay-sweets','gs-square-snacks'],'the east machine of each Konbini pair has its neighbour on the left');
 const face=read('components/GashaponMachineFace.tsx'),css=read('components/GashaponMachineFace.module.css');
 assert(/export function hasLeftNeighbour/.test(face)&&/data-neighbour=\{hasLeftNeighbour\(machine\)/.test(face),'the face marks a left-hand neighbour');
 assert(/\[data-neighbour=left\] \.knobLabel\{[^}]*bottom:calc\(100% \+/.test(css)&&/\[data-neighbour=left\] \.tag\{[^}]*left:var\(--cx\)/.test(css),'label above the knob, tag under the plate');
 // A phone tap leaves the Gashapon button :hover (sticky): it must not hold the last machine hovered (the next machine's
 // button opened the previous one, from anywhere).
 assert(/gashaCanHover=\(\(\)=>\{try\{return matchMedia\('\(hover: hover\)'\)/.test(read('components/Town.tsx'))&&/gashaCanHover&&btn\.matches\(':hover'\)\)gashaPrompt\.holdHover/.test(read('components/Town.tsx')),'holdHover only on hover-capable pointers');
 // The summit stand moved behind the east goal (summitSnackSpot) with the gashapon at x − 1.97, where Hamish used to sit.
 for(const n of load('lib/town/summitIsleNpcs.ts').SUMMIT_ISLE_NPCS)for(const m of island)assert(Math.hypot(n.x-m.x,n.z-m.z)>=1.5,`${n.id} is clear of ${m.id} (${Math.hypot(n.x-m.x,n.z-m.z).toFixed(2)} m)`);
});

await ok('Nov 9: the island map shows the gashapon (one capsule mark per spot, Konbini pairs merged), clear of V / F, with a key entry',()=>{
 const MM=load('lib/town/mapMarkers.ts'),V=load('lib/town/vendingCatalog.ts').VENDING_MACHINES,F=load('lib/town/fishing/fishCatalog.ts').FISH_SPOTS;
 const vm_=V.reduce((l,m)=>{const n=l.find(o=>Math.hypot(o.x-m.x,o.z-m.z)<6);if(!n)l.push({x:m.x,z:m.z});return l;},[]);
 const marks=MM.placeGashaponMarkers(island,[...vm_,...F]);
 assert.equal(marks.length,10,'12 machines, the two Konbini pairs share a mark');
 assert.equal(marks.reduce((n,g)=>n+g.ids.length,0),12,'every island machine exactly once');assert(!marks.some(g=>g.ids.some(id=>id.startsWith('gs-arcade'))),'the Arcade pair is indoors');
 for(const g of marks){for(const id of g.ids){const m=island.find(x=>x.id===id);assert(Math.hypot(g.x-m.x,g.z-m.z)<25,id+': near its machine');}
  for(const o of [...vm_,...F])assert(Math.hypot(g.x-o.x,g.z-o.z)>=19.9,g.id+': clear of a V/F mark');}
 const o=read('components/IslandOverview.tsx'),i=o.indexOf('className="map-gashapon-markers"');
 assert(i>0&&/pointerEvents="none"/.test(o.slice(i,i+60))&&!/role=|tabIndex/.test(o.slice(i,o.indexOf(')}</g>',i))),'plain marks, not buttons');
 assert(/placeGashaponMarkers\(islandGashaponMachines\(\)/.test(o)&&/\.\.\.GASHA_MARKERS\]/.test(o),'from the machine data; J marks keep clear of them');
 assert(MM.mapLegend(false).some(l=>l.label==='Gashapon'&&l.tip==='gashapon'),'key entry');assert.match(MM.legendTipText('gashapon'),/^Gashapon: /);
});

await ok('browser store: fi2-gashapon-v1 saved, 20 coins once per spin id from the arcade wallet, a failed save retried without a second charge',async()=>{
 storage.clear();
 const W=load('lib/arcade/arcadeWallet.ts'),B=load('lib/gashapon/gashaponBrowser.ts'),St=load('lib/gashapon/store.ts');
 // Seed 50 coins through a learning credit (once-only id): the wallet is real, nothing is bought.
 assert.equal(await W.creditOnce('learn:test:gashapon-seed','learn',30,'test'),30);await W.creditOnce('learn:test:gashapon-seed-2','learn',20,'test');
 const before=W.readArcadeWallet().balance;assert(before>=40,'seeded ('+before+')');
 const id=B.newSpinId(),r=await B.gashapon.spin('gs-square-snacks',id);assert(r.ok,'spun: '+(r.message||''));
 assert.equal(W.readArcadeWallet().balance,before-St.GASHAPON_PRICE,'20 coins');const saved=JSON.parse(storage.get(St.GASHAPON_KEY));assert(saved.owned[r.toy.id],'saved under fi2-gashapon-v1');
 const again=await B.gashapon.spin('gs-square-snacks',id);assert(again.ok&&again.repeat,'same id: same result');assert.equal(W.readArcadeWallet().balance,before-St.GASHAPON_PRICE,'no second charge');
 // Storage refuses the write: an honest 'save' failure; the retry with the same id finishes without a new charge.
 const realSet=localStorage.setItem;const id2=B.newSpinId();const now=Date.now;context.Date.now=()=>now()+5000;
 localStorage.setItem=(k,v)=>{if(k===St.GASHAPON_KEY)throw new Error('full');return realSet(k,v);};
 const f=await B.gashapon.spin('gs-square-snacks',id2);assert(!f.ok&&f.reason==='save',f.reason);const charged=W.readArcadeWallet().balance;
 localStorage.setItem=realSet;const fix=await B.gashapon.spin('gs-square-snacks',id2);assert(fix.ok,'retry finished: '+(fix.message||''));
 assert.equal(W.readArcadeWallet().balance,charged+(fix.duplicate?fix.refund:0),'the retry charged nothing new');context.Date.now=now;
 const panel=read('components/useGashaponSpin.ts')+read('components/GashaponMachineFace.tsx');
 assert(/pending\.current\?\?=newSpinId\(\)/.test(panel)&&/if\(r\.reason==='save'\)unsavedSpin\.set\(machine\.id,spinId\);else\{pending\.current=null;/.test(panel),'the panel keeps the spin id for a save retry');
 assert(/openToyViewer\(shown\.toy\.id,'result'\)/.test(panel)&&/openToyShelf\(\)/.test(panel)&&/export function openToyViewer\(toyId:string,source:ToyViewSource='result'\)/.test(read('lib/gashapon/gashaponBrowser.ts')),'round-3A viewer + Toy Shelf hooks');
 // Owner, Nov 10 2026 ("simplify this to fit between Toy Shelf and Done btn on mobile"): ONE status pill from lib/gashapon/statusLine.ts
 // (its texts: tests/gashapon-status.cjs), between Toy Shelf and Done in one row.
 assert(/gashaponStatus\(\{found,total:toys\.length,left,blocked\}\)/.test(panel)&&/aria-label=\{status\.label\}/.test(panel)&&/data-gashapon-shelf>Toy Shelf<\/button>\s*<p className=\{styles\.status\}[\s\S]*?<\/p>\s*<div className=\{styles\.done\}>/.test(panel),'one status pill between Toy Shelf and Done');
 for(const f of ['components/GashaponPanel.module.css','components/GashaponMachineFace.module.css'])assert(!/IslandBrush/.test(read(f).replace(/\/\*[\s\S]*?\*\//g,'')),f+': no IslandBrush on the buttons');
 // Owner, Nov 8 2026: spins are counted once from the panel through lib/analytics/gashaponEvents.ts (tests/gashapon-viewer.cjs); the store stays analytics-free.
 assert(!/analytics/.test(read('lib/gashapon/gashaponBrowser.ts'))&&(panel.match(/countGashaponSpin\(/g)||[]).length===1,'one spin count in the panel, none in the store');
});

await ok('QA Nov 8: a failed save survives closing the panel (no lost 20 coins); a "busy" double press never drops the id; Tab moves once',async()=>{
 storage.clear();
 const W=load('lib/arcade/arcadeWallet.ts'),B=load('lib/gashapon/gashaponBrowser.ts'),St=load('lib/gashapon/store.ts');
 await W.creditOnce('learn:test:gashapon-qa-seed','learn',30,'test');await W.creditOnce('learn:test:gashapon-qa-seed-2','learn',30,'test');
 const before=W.readArcadeWallet().balance;
 // The panel's flow: a save failure records the id per machine; a reopened panel starts from it and the retry charges nothing.
 const realSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===St.GASHAPON_KEY)throw new Error('full');return realSet(k,v);};
 const id=B.newSpinId(),f=await B.gashapon.spin('gs-cay-bento',id);localStorage.setItem=realSet;assert(!f.ok&&f.reason==='save');
 B.unsavedSpin.set('gs-cay-bento',id);assert.equal(B.unsavedSpin.get('gs-cay-bento'),id);assert.equal(B.unsavedSpin.get('gs-cay-sweets'),null,'per machine');
 const charged=W.readArcadeWallet().balance;assert.equal(charged,before-St.GASHAPON_PRICE);
 const fix=await B.gashapon.spin('gs-cay-bento',B.unsavedSpin.get('gs-cay-bento'));assert(fix.ok,'finished after reopening');
 assert.equal(W.readArcadeWallet().balance,charged+(fix.duplicate?fix.refund:0),'no second charge');B.unsavedSpin.clear('gs-cay-bento');assert.equal(B.unsavedSpin.get('gs-cay-bento'),null);
 const panel=read('components/useGashaponSpin.ts');
 assert(/useRef<string\|null>\(unsavedSpin\.get\(machine\.id\)\)/.test(panel),'a reopened panel resumes the unsaved spin id');
 assert(/if\(r\.reason==='busy'\)return true;/.test(panel),"a 'busy' answer (a second press of the same spin) never clears the id or shows an error over the result");
 assert(/if\(e\.key==='Tab'\)\{if\(e\.type!=='keydown'\)/.test(panel),'Tab moves focus on keydown only (the keyup moved it a second time)');
 assert(/\(phase==='idle'\|\|phase==='reveal'\)&&!root\.current\?\.contains\(document\.activeElement\)/.test(panel),'focus goes back to Spin (the knob) after the drop');
});

await ok('Audit Nov 10: Spin cannot start without enough coins or after the daily cap, and the controls say why',async()=>{
 const hook=read('components/useGashaponSpin.ts'),panel=read('components/GashaponPanel.tsx'),face=read('components/GashaponMachineFace.tsx');
 assert(/const blocked:'cap'\|'coins'\|null=busy\|\|phase==='tray'\?null:left<=0\?'cap':!pending\.current&&wallet\.balance<GASHAPON_PRICE\?'coins':null;/.test(hook),'the hook works out why a spin is blocked (an unsaved spin can still be retried)');
 assert(/disabled=\{busy\|\|!!blocked\} data-gashapon-spin/.test(panel)&&/blocked==='coins'\?'Earn coins to spin'/.test(panel),'arcade panel: Spin disabled and labelled');
 assert(/disabled=\{busy\|\|phase==='tray'\|\|!!blocked\} data-gashapon-spin/.test(face)&&/disabled=\{!!blocked\} data-gashapon-again/.test(face),'island face: knob and Spin again disabled');
 assert(/const tagKind=error\?\.kind\?\?blocked;/.test(face),'island face: the coins / cap tag shows before the knob is pressed');
});

console.log(failed?`${failed} FAILED`:'PASS gashapon world: 14 machines in 3D, colliders, draw budget, Coral Cay room, browser store, prompt + panel wiring');
process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
