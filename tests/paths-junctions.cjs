// Paths, junctions, stairs (owner shots 173-181, Nov 27 2026; branch paths-junctions). Builds the real island (world.ts) with every
// ground layer on (the shipped state) and checks:
//  1. road joints: where another road's asphalt carries on from a junction (the Coral Cay causeway at x 200) the height every mover
//     reads steps < 1 cm along the joint, the drawn top surface too, and a car crossing it never dips;
//  2. stairs: every stair / ramp foot and head lands on a path, a pavement or the park's paving (not on the grass);
//  3. grass slivers: no strip of lawn narrower than 1.5 m is trapped between two paved / path surfaces on the main island;
//  4. handrails: the knockout stair's handrails clear the building's facade (no rail through the wall).
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const base=process.cwd(),T=require('three'),ts=require('typescript');
const insidePoly=(poly,x,z)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
const inRect=(r,x,z,m=0)=>Math.abs(x-r.x)<r.w/2+m&&Math.abs(z-r.z)<r.d/2+m;
(async()=>{
 const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,console,Math,performance,Float32Array,window:{matchMedia:()=>({matches:false})},document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
 const EL=load(base+'/lib/town/elevation.ts'),D=load(base+'/lib/town/townDepth.ts'),SE=load(base+'/lib/town/surfaceEdges.ts');
 EL.setElevation(true);D.setTownDepth(true);SE.setSurfaces(true);
 let input=null;const sd=D.setDepthStreets;D.setDepthStreets=i=>{input=i;return sd(i);};
 const scene=new T.Scene(),world=load(base+'/lib/town/world.ts').buildTown(scene);scene.updateMatrixWorld(true);
 assert.ok(input,'the streets are registered');const report=[];
 const H=(x,z)=>EL.groundLift?EL.groundLift(x,z):D.depthLift(x,z);
 const meshes=[];scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.visible)meshes.push(o);});
 const rc=new T.Raycaster(),down=new T.Vector3(0,-1,0),top=(x,z)=>{rc.set(new T.Vector3(x,3,z),down);const h=rc.intersectObjects(meshes,false).find(h=>h.point.y<.3);return h?h.point.y:null;};
 // 1. road joints
 const C=load(base+'/lib/town/coralCay.ts'),joins=input.joins??[];
 assert.ok(joins.some(p=>p.x===C.CAUSEWAY.roadStart&&p.z===C.CAUSEWAY.z),'the causeway joint is registered');
 let worst=0,drawn=0,dip=0;
 for(const p of joins)for(let a=-3.6;a<=3.6;a+=.4){let prev=null,prevTop=null;for(let u=-10;u<=6;u+=.1){const x=p.x+u,z=p.z+a,h=H(x,z);if(prev!==null)worst=Math.max(worst,Math.abs(h-prev));prev=h;
   if(u>-1.5&&u<1.5){const t=top(x,z);if(t!==null&&prevTop!==null)drawn=Math.max(drawn,Math.abs(t-prevTop));prevTop=t;}}}
 // a car (2.6 m wheelbase) driving east along each lane across the joint: its body height (mean of the axles) never drops below both ends' by > 1 cm on the way
 for(const p of joins)for(const lane of [-2,2]){const hs=[];for(let u=-14;u<=10;u+=.25){const z=p.z+lane;hs.push((H(p.x+u-1.3,z)+H(p.x+u+1.3,z))/2);}
  for(let i=1;i<hs.length-1;i++){const lo=Math.min(Math.max(...hs.slice(0,i)),Math.max(...hs.slice(i)));dip=Math.max(dip,lo-hs[i]>0&&hs[i]<Math.min(hs[0],hs[hs.length-1])?Math.min(hs[0],hs[hs.length-1])-hs[i]:0);}}
 assert.ok(worst<.01,'height step along a road joint '+(worst*100).toFixed(1)+' cm (< 1 cm)');
 assert.ok(drawn<.012,'drawn top surface step across a road joint '+(drawn*100).toFixed(1)+' cm');
 assert.ok(dip<.005,'a car crossing a road joint dips '+(dip*100).toFixed(1)+' cm');
 report.push(`joints ${joins.length}: step ${(worst*1000).toFixed(1)} mm, drawn ${(drawn*1000).toFixed(1)} mm, car dip ${(dip*1000).toFixed(1)} mm`);
 // 2. stairs: feet and heads on paving
 const hard=input.hard.filter(h=>h.kind!=='garden'),foot=[...input.roads.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d})),...input.junctions.map(j=>({x:j.x,z:j.z,w:12,d:12}))];
 const L=load(base+'/lib/town/westParkLayout.ts'),WE=load(base+'/lib/town/westElevation.ts'),K=load(base+'/lib/games/rooftopKnockout.ts');
 const paved=(x,z)=>hard.some(r=>inRect(r,x,z,-.05))||foot.some(r=>inRect(r,x,z,-.05))||L.onParkPaving(x,z,-.3);
 const ends=[];
 for(const s of WE.WEST_STAIRS){let len=s.len;for(let d=s.inset+.25;d<s.len;d+=.25)if(WE.WEST.terrace-s.slope*d<=WE.westNatural(s.x+s.dx*d,s.z+s.dz*d)+.02){len=d;break;}
  for(const a of [-1.5,0,1.5]){/* a 4.5 m trail meets the flight's middle */const px=-s.dz,pz=s.dx;ends.push([`${s.id} foot`,s.x+s.dx*(len+.8)+px*a,s.z+s.dz*(len+.8)+pz*a],[`${s.id} head`,s.x-s.dx*.8+px*a,s.z-s.dz*.8+pz*a]);}}
 // the school's two ground flights (local x 365 +- 37.5, foot at local z -53.5: the group stands at -230, +80), the museum's south-east
 // flight (local x 441.5, foot z 84), the knockout's south stair (foot x 73, between its rails), the futsal ramp (x 31, foot z 45)
 for(const x of [97.5,172.5])for(const a of [-.9,0,.9])ends.push(['school foot',x+a,27]);
 for(const a of [-1,0,1])ends.push(['museum foot',211.5+a,164.6],['knockout foot',73.6,179+a*1.3],['futsal ramp foot',31+a*2,45.6]);
 const off=ends.filter(([,x,z])=>!paved(x,z)).map(([k,x,z])=>`${k} (${x.toFixed(1)}, ${z.toFixed(1)})`);
 assert.deepEqual(off,[],'stair / ramp ends on the grass');report.push(`stair ends on paving: ${ends.length}`);
 // Leftovers A2 (paths NOTE 174): the station flight's foot is paved: from above, the first surface hit 0.4-2 m out from its last tread
 // across the flight is the apron (6 cm over the natural ground), never a lawn standing over it
 {const st=WE.WEST_STAIRS.find(s=>s.id==='station'),EL2=load(base+'/lib/town/elevation.ts');let len=st.len;for(let d=st.inset+.25;d<st.len;d+=.25)if(WE.WEST.terrace-st.slope*d<=WE.westNatural(st.x+st.dx*d,st.z+st.dz*d)+.02){len=d;break;}
  if(EL2.elevationOn&&EL2.elevationOn()){const rc2=new T.Raycaster(),dn=new T.Vector3(0,-1,0),bad=[];let n=0;
   for(const d of [.4,1.2,2])for(const a of [-3.5,0,3.5]){const x=st.x+st.dx*(len+d)-st.dz*a,z=st.z+st.dz*(len+d)+st.dx*a,g=WE.westNatural(x,z);rc2.set(new T.Vector3(x,g+8,z),dn);
    const h=rc2.intersectObjects(meshes,false).find(h=>h.point.y<g+1.5);n++;if(!h||Math.abs(h.point.y-(g+.06))>.03)bad.push(`(${x.toFixed(1)}, ${z.toFixed(1)}) ${h?(h.point.y-g).toFixed(3):'none'}`);}
   assert.deepEqual(bad,[],'station stair foot: the apron is the top surface');report.push(`station foot apron: ${n} points`);}}
 // 3. grass slivers on the main island's lawn
 const S=load(base+'/lib/town/shoreline.ts'),surf=[...foot,...hard.filter(h=>['path','sand','plaza','patio'].includes(h.kind))/* paving and paths (a pitch's or a court's run-off is turf / a fenced slab) */];
 const surfAt=(x,z)=>surf.some(r=>inRect(r,x,z));let sx0=Infinity,sx1=-Infinity,sz0=Infinity,sz1=-Infinity;for(const p of S.INTERIOR_GRASS){sx0=Math.min(sx0,p.x);sx1=Math.max(sx1,p.x);sz0=Math.min(sz0,p.z);sz1=Math.max(sz1,p.z);}
 const slivers=new Map();
 for(let x=Math.ceil(sx0);x<sx1;x+=.5)for(let z=Math.ceil(sz0);z<sz1;z+=.5){if(!insidePoly(S.INTERIOR_GRASS,x,z)||surfAt(x,z)||EL.regionLift(x,z)>.004)continue;
  for(const [dx,dz] of [[1,0],[0,1]]){let a=0,b=0;while(a<1.6&&!surfAt(x-dx*a,z-dz*a))a+=.1;while(b<1.6&&!surfAt(x+dx*b,z+dz*b))b+=.1;
   if(a+b<1.5&&a+b>=.6){/* narrower than 60 cm the lips and the verge (20-48 cm and 10-32 cm from each side) cover it */const k=`${Math.round(x/4)*4},${Math.round(z/4)*4}`;if(!slivers.has(k))slivers.set(k,`(${x}, ${z}) ${(a+b).toFixed(1)} m ${dx?'along x':'along z'}`);}}}
 assert.deepEqual([...slivers.values()],[],'grass slivers < 1.5 m between paved / path surfaces');
 // the causeway's lawn edge follows its pavement (owner shot 177: the area was 12 m wide under the 14 m deck, a grass lip ran across the pavement)
 for(let x=C.CAUSEWAY.roadStart+.25;x<C.CAUSEWAY.roadStart+37;x+=.5){const t=Math.min(1,Math.max(0,(x-C.CAUSEWAY.roadStart-2)/12)),half=6+(C.CAUSEWAY.deckHalf-6)*t*t*(3-2*t);
  for(const s of [-1,1]){const z=C.CAUSEWAY.z+s*(half-.3);assert.ok(hard.some(r=>r.kind==='path'&&inRect(r,x,z)),`the causeway's pavement at (${x}, ${z.toFixed(2)}) lies inside its path area`);
   assert.ok(!hard.some(r=>r.kind==='path'&&inRect(r,x,C.CAUSEWAY.z+s*(half+.3))),`the causeway's path area reaches > 30 cm past its pavement at x ${x}`);}}report.push('grass slivers: 0');
 // 4. handrails clear the facade
 const face=K.KNOCKOUT_ROOF.z+K.KNOCKOUT_ROOF.d/2;for(const z of K.KNOCKOUT_STAIR_RAILS)assert.ok(z-face>=.25,'knockout handrail at z '+z+' is '+(z-face).toFixed(2)+' m off the wall');
 assert.ok(/KNOCKOUT_STAIR_RAILS\)\{box\(/.test(fs.readFileSync(base+'/lib/town/world.ts','utf8')),'the drawn rails read KNOCKOUT_STAIR_RAILS');report.push('handrails clear the wall');
 console.log('paths-junctions: '+report.join('; '));process.exit(0);
})().catch(e=>{console.error(e.message.slice(0,3000));process.exit(1);});
