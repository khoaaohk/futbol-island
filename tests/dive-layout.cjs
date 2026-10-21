// One shared layout per dive zone (Oct 20 2026; user: "the dive spots don't look like the area from above"; lib/town/water/diveLayout.ts):
// the reef room (diveRoom.ts), the island's shoal preview (divePreview.ts), the far shoal decals and the above-water pieces
// (diveWreckTop.ts) all read the same deterministic layout, each zone has its own signature props and surface tell, nothing breaks
// the surface except the tells, the buoy column and the come-up point stay clear, and the costs stay capped.
// Run: node tests/dive-layout.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt,Infinity,NaN};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const D=load('lib/town/water/diveSpots.ts'),LY=load('lib/town/water/diveLayout.ts'),R=load('lib/graphics/diveRoom.ts'),P=load('lib/graphics/divePreview.ts'),WT=load('lib/graphics/diveWreckTop.ts');
const TK=load('lib/graphics/waterTokens.ts'),WD=load('lib/town/water/waterDepth.ts'),UW=load('lib/town/fishing/underwater.ts'),WS=load('lib/graphics/waterSurface.ts'),SE=load('lib/town/water/diveSession.ts');
const Z=D.DIVE_SPOTS,isl=(s,x,z)=>LY.diveLayoutToIsland(s,x,z);

ok('deterministic: the same layout every build, from the zone alone (no Math.random)',()=>{
 for(const s of Z)assert.equal(JSON.stringify(LY.buildLayout(s)),JSON.stringify(LY.diveLayout(s)),s.id);
 assert(!/Math\.random/.test(read('lib/town/water/diveLayout.ts')));
 assert.equal(LY.DIVE_LAYOUT_START.x,SE.DIVE_START.x);assert.equal(LY.DIVE_LAYOUT_START.z,SE.DIVE_START.z);
});
ok('every zone has its own signature prop set and surface tell; the layout parts the brief lists are there',()=>{
 const sets=Z.map(s=>LY.diveLayout(s).props.slice().sort().join(',')),tells=Z.map(s=>LY.diveLayout(s).tell.kind);
 assert.equal(new Set(sets).size,7,sets.join(' | '));assert.equal(new Set(tells).size,7,tells.join(' '));
 for(const s of Z){const L=LY.diveLayout(s);assert(L.props.length>=1&&L.outline.length===LY.DIVE_LAYOUT.outlineN&&L.crest.length>4&&L.slope.length>4,'footprint and contours '+s.id);
  assert(L.clusters.length>=5&&L.rocks.length>=4&&L.grass.length>=3&&L.lanes.length>=1,'clusters / rocks / grass / lanes '+s.id+' '+[L.clusters.length,L.rocks.length,L.grass.length,L.lanes.length]);
  assert(L.tell.pts.length>=1,'the tell has a place '+s.id);if(s.theme.wreck)assert(L.wreck&&L.props.includes('wreck-'+s.theme.wreck.style));}
 const by=id=>LY.diveLayout(D.diveSpotById(id));
 assert(by('pauls-grotto').pitch&&by('moon-arch').arches.length===1&&by('ball-crate').crates.length>=6&&by('ball-crate').tell.pts.length>=3&&by('turtle-pool').bowl&&by('ray-meadow').raySpots.length===3);
 assert(by('kelp-trawler').kelp.filter(k=>k.h>3).length>=5,'a kelp forest of tall stands');assert(by('ray-meadow').grass.length>=9,'a seagrass meadow');
 assert(by('captains-cup').clusters.length>by('ray-meadow').clusters.length,'the coral garden has more heads');
});
ok('nothing breaks the surface but the tells; the buoy column, the start / come-up point and the lanes stay clear; all inside the footprint',()=>{
 for(const s of Z){const L=LY.diveLayout(s),f=s.floor;
  for(const c of L.clusters){assert(D.diveFloor(c.x,c.z,f)+c.h<D.DIVE_SURFACE_Y-.5,'coral under the surface '+s.id);
   assert(Math.hypot(c.x,c.z)>LY.DIVE_LAYOUT.buoyGap+c.r*.5&&Math.hypot(c.x-L.start.x,c.z-L.start.z)>LY.DIVE_LAYOUT.startGap+c.r*.5,'clear of the buoy and the start '+s.id);
   for(const l of L.lanes)assert(LY.laneDist(l.pts,c.x,c.z)>l.w/2,'off the sand lanes '+s.id);
   assert(Math.hypot(c.x,c.z)*L.scale<=D.diveBlobR(s,Math.atan2(c.z,c.x))*LY.DIVE_LAYOUT.keepIn+1e-6,'inside the footprint '+s.id);}
  for(const k of L.kelp)assert(D.diveFloor(k.x,k.z,f)+k.h<D.DIVE_SURFACE_Y-.5,'kelp tops under the surface');
  for(const p of [...L.rocks,...L.kelp,...L.crates])assert(Math.hypot(p.x,p.z)>LY.DIVE_LAYOUT.buoyGap&&Math.hypot(p.x-L.start.x,p.z-L.start.z)>LY.DIVE_LAYOUT.startGap,'buoy / start '+s.id);
  // The room: no reef triangle near a cluster pokes out of the water (the wreck and the arch crown are the only things that do).
  const room=R.createDiveRoom(s,{phone:false,reduced:false,found:[]}),pos=room.scene.getObjectByName('dive-reef').geometry.getAttribute('position');
  const nearCluster=(x,z)=>L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.5),onTell=(x,z)=>(L.wreck&&Math.hypot(x-L.wreck.x,z-L.wreck.z)<L.wreck.half+2)||L.arches.some(a=>Math.hypot(x-a.x,z-a.z)<a.R+2);
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);if(nearCluster(x,z)&&!onTell(x,z))assert(pos.getY(i)<D.DIVE_SURFACE_Y-.3,'coral under the room surface '+s.id);}
  room.dispose();}
});
ok('the room and the preview read the SAME layout: coral where the clusters are (both), the wreck, kelp, pitch, arch and tells at the same places',()=>{
 for(const s of Z){const L=LY.diveLayout(s),sc=L.scale;
  const room=R.createDiveRoom(s,{phone:true,reduced:false,found:[]}),rp=room.scene.getObjectByName('dive-reef').geometry.getAttribute('position');
  const g=P.buildDivePreview(s),pp=g.getAttribute('position');
  for(const c of L.clusters){let nr=0;for(let i=0;i<rp.count;i++)if(Math.hypot(rp.getX(i)-c.x,rp.getZ(i)-c.z)<c.r&&rp.getY(i)>D.diveFloor(rp.getX(i),rp.getZ(i),s.floor)+.15)nr++;
   assert(nr>=30,'room coral on cluster '+s.id+' '+nr);
   const I=isl(s,c.x,c.z);let np=0;for(let i=0;i<pp.count;i++)if(Math.hypot(pp.getX(i)-I.x,pp.getZ(i)-I.z)<Math.max(1,c.r*sc))np++;
   assert(np>=12,'preview coral on cluster '+s.id+' '+np);}
  // The room's kelp stands, the preview's dark tops (kelp zone): the same stands.
  if(L.tell.kind==='kelp'){const sw=room.scene.getObjectByName('dive-sway').geometry.getAttribute('position');
   for(const k of L.kelp.filter(k=>k.h>3)){let hi=0;for(let i=0;i<sw.count;i++)if(Math.hypot(sw.getX(i)-k.x,sw.getZ(i)-k.z)<2.4&&sw.getY(i)>D.DIVE_SURFACE_Y-1.6)hi++;assert(hi>=6,'tall kelp at the stand '+hi);
    const I=isl(s,k.x,k.z);let top=0;for(let i=0;i<pp.count;i++)if(Math.hypot(pp.getX(i)-I.x,pp.getZ(i)-I.z)<1.6&&pp.getY(i)>UW.UW_SURFACE-.5)top++;assert(top>=6,'a kelp top seen from above '+top);}}
  if(L.wreck){const w=D.diveWreckPose(s.theme.wreck,s.floor);assert(Math.abs(w.x-L.wreck.x)<1e-9&&Math.abs(w.z-L.wreck.z)<1e-9,'the same wreck pose');}
  if(L.pitch){const I=isl(s,L.pitch.cx,L.pitch.cz);let pale=0;for(let i=0;i<pp.count;i++)if(Math.hypot(pp.getX(i)-I.x,pp.getZ(i)-I.z)<(L.pitch.circle+.6)*sc&&g.getAttribute('color').getX(i)>.8)pale++;assert(pale>=40,'pale pitch lines seen from above '+pale);}
  const t=P.buildDiveTells(s),tp=t.getAttribute('position');
  if(['balls','turtle','ray'].includes(L.tell.kind)){assert(tp.count>0,'a moving tell '+s.id);const at=t.getAttribute('aTell');
   for(const p of L.tell.pts){const I=isl(s,p.x,p.z);let near=0;for(let i=0;i<tp.count;i++){const cx=at.getZ(i)||I.x,cz=at.getW(i)||I.z;if(L.tell.kind==='ray'?Math.hypot(cx-I.x,cz-I.z)<.01:Math.hypot(tp.getX(i)-I.x,tp.getZ(i)-I.z)<2)near++;}assert(near>=6,'the tell at its layout point '+s.id);}}
  else assert.equal(tp.count,0,'static tells are diveWreckTop pieces or preview props '+s.id);
  t.dispose();g.dispose();room.dispose();}
 // Moon Arch: the room's arch crown is the island's rock out of the water, at the layout's arch, clear of the buoy.
 const ma=D.diveSpotById('moon-arch'),a=LY.diveLayout(ma).arches[0],top=WT.diveTopGeometry(ma);assert(top,'an arch crown piece');
 assert(top.boundingBox.max.y>TK.WATER_Y+.4,'the crown breaks the surface '+(top.boundingBox.max.y-TK.WATER_Y).toFixed(2));
 const I=isl(ma,a.x,a.z),c=new T.Vector3();top.boundingBox.getCenter(c);assert(Math.hypot(c.x-I.x,c.z-I.z)<2,'over the arch');assert(Math.hypot(c.x-ma.x,c.z-ma.z)>=5,'clear of the buoy '+Math.hypot(c.x-ma.x,c.z-ma.z).toFixed(2));
 assert.equal(WT.wreckTopGeometry(ma),null,'wreckTopGeometry stays wreck-only');top.dispose();
});
ok('caps: preview + tells under the per-zone cap; one decal draw for every zone, small; tells off at tier 3-4 with the preview',()=>{
 const rows=[];for(const s of Z){const g=P.buildDivePreview(s),t=P.buildDiveTells(s),n=(g.getAttribute('position').count+t.getAttribute('position').count)/3;
  assert(n<=P.DIVE_PREVIEW.maxTris,'cap '+s.id+' '+n);rows.push(s.id+':'+n);g.dispose();t.dispose();}
 const dg=P.buildShoalDecals(Z),dt=dg.getAttribute('position').count/3;assert(dt<=7*P.DIVE_DECAL.rings*P.DIVE_DECAL.segs*2,'decal triangles '+dt);
 let top=-Infinity;for(let i=0;i<dg.getAttribute('position').count;i++)top=Math.max(top,dg.getAttribute('position').getY(i));assert(Math.abs(top-(TK.WATER_Y+P.DIVE_DECAL.lift))<1e-6,'flat on the water');dg.dispose();
 console.log('     preview+tells triangles: '+rows.join(' ')+'; decals (all zones): '+dt);
 const scene=new T.Scene(),ocean=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial());ocean.name='surrounding-ocean';scene.add(ocean);
 const cup=D.diveSpotById('ball-crate'),near=[];D.nearestDiveSpots(cup.x,cup.z,near);WS.setDiveSpots(near);
 const pv=P.createDivePreview(scene);pv.update(1,cup.x,cup.z,0);pv.update(1,cup.x,cup.z,0);assert(pv.stats.tells>=1,'the ball tell shows with the preview '+JSON.stringify(pv.stats)+near.map(s=>s.id));
 pv.update(1,cup.x,cup.z,3);pv.update(1,cup.x,cup.z,3);assert.equal(pv.stats.tells,0,'tier 3: no tells');pv.update(1,cup.x,cup.z,4);assert.equal(pv.stats.tells,0,'Battery saver');
 // Decals: from Captain's Cup (slots: the two nearest), Paul's Grotto is slotted; a zone 250 m+ away is not; diving hides all.
 const c2=D.diveSpotById('captains-cup');D.nearestDiveSpots(c2.x,c2.z,near);WS.setDiveSpots(near);for(let i=0;i<5;i++)pv.update(1,c2.x+60,c2.z,3);
 assert(pv.decal.visible===(pv.stats.decals>0));
 for(let i=0;i<5;i++)pv.update(1,c2.x+60,c2.z,0,false);assert.equal(pv.stats.decals,0,'diving: no decals');assert.equal(pv.decal.visible,false);
 // Somewhere between three zones (east): the far ones get a decal while the two slotted ones do not.
 const mid={x:790,z:-60};D.nearestDiveSpots(mid.x,mid.z,near);WS.setDiveSpots(near);for(let i=0;i<5;i++)pv.update(1,mid.x,mid.z,3);
 const within=Z.filter(s=>!near.includes(s)&&Math.hypot(s.x-mid.x,s.z-mid.z)<P.DIVE_DECAL.far).length;assert(within>=1&&pv.stats.decals>=within,'decals for the zones past the slots '+pv.stats.decals+'/'+within);
 pv.dispose();assert.equal(scene.children.length,1,'dispose clean');
});
ok('tokens: one water line; the dive files use them (no duplicated literals)',()=>{
 assert.equal(TK.WATER_Y,WD.WATER_LEVEL);assert.equal(TK.UNDER_SURFACE_Y,UW.UW_SURFACE);
 assert(!read('lib/graphics/diveRoom.ts').includes("'#bfeef5'")&&read('lib/graphics/diveRoom.ts').includes('ROOM_WINDOW')&&read('lib/graphics/diveRoom.ts').includes('ROOM_SHALLOW'));
 assert(!/WATER_LEVEL|-\.43\b/.test(read('lib/graphics/diveWreckTop.ts'))&&!/UW_SURFACE|-\.42\b|setRGB\(\.2,\.5,\.52\)/.test(read('lib/graphics/divePreview.ts')));
 assert(read('lib/graphics/waterSurface.ts').includes('heart:SHOAL_HEART_D'));
});
if(failed){console.log(failed+' failed');process.exit(1);}
