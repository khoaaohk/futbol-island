// Bean skin (lane A, docs/bean-characters/CONTRACT.md): API parity in both styles, identical motion, batch draw
// budget, limb endpoints on the joints, noodle continuity in extreme bends/folds, face atlas cells, shirt numbers,
// the costume fallback, and (when Chrome is available) real renderer.info draw calls and GPU/CPU limb parity.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const CS=load('lib/graphics/characterStyle.ts'),{createPlayer}=load('lib/graphics/player.ts'),{playerBatch}=load('lib/graphics/playerBatch.ts');
const B=load('lib/graphics/beanSkin.ts'),L=load('lib/graphics/beanLook.ts'),{DEFAULT_CUSTOMIZATION}=load('lib/town/customization.ts');
const make=(style,id='p',team='home',merge=true)=>{CS.setCharacterStyle(style);const r=createPlayer(id,team,merge);CS.setCharacterStyle(undefined);return r;};
const V=(x,y,z)=>new T.Vector3(x,y,z);

// ---- Style switch: default 'bean', headless Node keeps classic unless opted in.
{
 assert.equal(CS.CHARACTER_STYLE,'bean');assert.equal(CS.characterStyle(),'classic','headless default keeps the classic fixtures');
 CS.setCharacterStyle('bean');assert.equal(CS.characterStyle(),'bean');CS.setCharacterStyle(undefined);
 console.log('STYLE_PASS');
}

// ---- API parity: identical PlayerRig surface in both styles; classic has no bean meshes, bean hides classic ones.
{
 const c=make('classic','api'),b=make('bean','api');
 const shape=r=>Object.keys(r).sort().map(k=>{const d=Object.getOwnPropertyDescriptor(r,k);return k+':'+(d.get?'get':typeof d.value);});
 assert.deepEqual(shape(b),shape(c),'same keys, getters and member types');
 for(const k of ['setBeanLook','setExpression','setAppearance','setShirtNumber','setProfile','update','dispose','handPositions','ballContact','dribbleContact'])assert.equal(typeof b[k],'function',k);
 const beanNames=['bean-body','bean-limbs','bean-hair','bean-hat'];
 const names=r=>{const out=[];r.root.traverse(o=>{if(o.isMesh)out.push(o.name);});return out;};
 assert(!names(c).some(n=>beanNames.includes(n)),'classic: no bean meshes');
 c.setBeanLook(L.DEFAULT_BEAN_LOOK,L.DEFAULT_HOME_KIT);c.setExpression('happy');assert(!names(c).some(n=>beanNames.includes(n)),'classic: setBeanLook/setExpression are no-ops');
 const visible=r=>{const out=[];r.root.traverseVisible(o=>{if(o.isMesh)out.push(o.name);});return out;};
 assert.deepEqual(visible(b).filter(n=>n.startsWith('bean-')).sort(),['bean-body','bean-hair','bean-limbs'].filter(n=>visible(b).includes(n)).sort());
 assert(visible(b).every(n=>n.startsWith('bean-')),'bean: every visible mesh is part of the skin');
 assert(visible(c).length>10&&visible(c).every(n=>!n.startsWith('bean-')));
 assert.equal(b.root.getObjectByName('armor-torso')?.type,'Group');for(const n of ['player-chest','player-head','left-hand','right-ankle','left-shoulder','right-knee'])assert(b.root.getObjectByName(n),n);
 assert(B.beanSkinOf(b)&&!B.beanSkinOf(c));
 c.dispose();b.dispose();
 console.log('API_PARITY_PASS');
}

// ---- The solver is untouched: the same motion sequence gives identical joints, contacts and hands in both styles
// (lane B's ground guard uses the round bean body while diving/jumping/sliding/lying and a bean stands higher on a
// moped saddle, so those frames differ by design).
const MOTIONS=[
 ...Array.from({length:30},(_,i)=>({x:i*.12,z:0,m:{runIntensity:.7}})),
 ...Array.from({length:20},(_,i)=>({x:3.6,z:0,m:{kick:i/19,actionKind:'shot',facing:0}})),
 ...Array.from({length:16},(_,i)=>({x:3.6,z:0,m:{reaction:'slide',reactionProgress:i/15,kickSide:1}})),
 ...Array.from({length:16},(_,i)=>({x:3.6,z:0,m:{called:1,lookX:5,lookZ:2}})),
 ...Array.from({length:24},(_,i)=>({x:3.6,z:0,m:{dive:{progress:i/23,dir:i%2?1:-1,height:.6},keeper:1}})),
 ...Array.from({length:16},(_,i)=>({x:3.6,z:0,m:{jump:{progress:i/15,height:.5}}})),
 ...Array.from({length:12},(_,i)=>({x:3.6+i*.3,z:0,m:{travelMode:'jetpack',flight:{phase:'cruise',progress:1,pitch:.6,thrust:1.4,compression:0}}})),
 ...Array.from({length:8},(_,i)=>({x:8,z:i*.4,m:{travelMode:'moped',mopedStand:i/7}})),
 ...Array.from({length:8},(_,i)=>({x:8,z:4,m:{travelMode:'jetpack',parachute:true,parachuteSpin:.6}})),
 ...Array.from({length:6},(_,i)=>({x:8,z:4,m:{stunAge:i*.3}})),
];
const JOINTS=['player-pelvis','armor-torso','player-lumbar','player-chest','player-head','left-hip','right-hip','left-knee','right-knee','left-ankle','right-ankle','left-shoulder','right-shoulder','left-elbow','right-elbow','left-hand','right-hand'];
// Lane B also lifts a bean standing on a moped saddle (feet on the saddle), so those frames differ by design too.
const GUARDED=s=>s.m.dive||s.m.jump||s.m.reaction||s.m.stunAge!==undefined||s.m.mopedStand>0;
const SAME=MOTIONS.filter(s=>!GUARDED(s));
function play(rig,visit,list=MOTIONS){let t=0;for(const s of list){t+=1/30;rig.update(s.x,s.z,1/30,t,false,s.m);rig.root.updateMatrixWorld(true);visit?.(rig,s);}}
{
 const c=make('classic','twin'),b=make('bean','twin'),snap=[],lh=V(0,0,0),rh=V(0,0,0),ball=V(0,0,0);
 play(c,r=>{const row=JOINTS.map(n=>r.root.getObjectByName(n).matrixWorld.elements.slice());r.handPositions(lh,rh);row.push(lh.toArray(),rh.toArray(),r.ballContact(1,ball).toArray());snap.push(row);},SAME);
 let i=0;play(b,(r,s)=>{const want=snap[i++];JOINTS.forEach((n,k)=>{const got=r.root.getObjectByName(n).matrixWorld.elements;for(let e=0;e<16;e++)assert(Math.abs(got[e]-want[k][e])<1e-9,`${n} matches classic (frame ${i-1}, ${JSON.stringify(s.m).slice(0,80)}, ${got[e]} vs ${want[k][e]})`);});
  r.handPositions(lh,rh);assert.deepEqual(lh.toArray(),want[JOINTS.length]);assert.deepEqual(rh.toArray(),want[JOINTS.length+1]);assert.deepEqual(r.ballContact(1,ball).toArray(),want[JOINTS.length+2]);},SAME);
 c.dispose();b.dispose();
 console.log('MOTION_IDENTICAL_PASS',SAME.length,'frames');
}

// ---- Limb endpoints sit on the joints (tube tips, mittens, boots), through every motion above.
const ROW=B.BD;
function limbTip(data,k,sec,t){const out=V(0,0,0);B.evalLimbVertex(data,[k,sec,t,0],V(0,0,0),out);return out;}
function curveOf(data,k){const tx=i=>V(data[i*4],data[i*4+1],data[i*4+2]),base=ROW.limbs+4*k,spec=k<2?B.LIMB_ARM:B.LIMB_LEG;return B.beanLimbCurve(tx(base),tx(base+1),tx(base+2),tx(base+3),data[(base+3)*4+3],spec.K,spec.RHO);}
{
 const r=make('bean','ends','home',false),skin=B.beanSkinOf(r),inv=new T.Matrix4(),p=V(0,0,0),c=V(0,0,0),tn=V(0,0,0);let worst=0,frames=0;
 play(r,rig=>{skin.sync();inv.copy(rig.root.matrixWorld).invert();frames++;
  const ends=[['left-hand',0],['right-hand',1],['left-ankle',2],['right-ankle',3]];
  for(const [name,k] of ends){
   const joint=rig.root.getObjectByName(name);p.setFromMatrixPosition(joint.matrixWorld).applyMatrix4(inv);
   const L=curveOf(skin.data,k);B.beanLimbAt(L,3,1,c,tn);worst=Math.max(worst,c.distanceTo(p));
   // Rigid end part: its frame origin is the joint.
   const f=ROW.frames+3*k,o=V(skin.data[f*4+3],skin.data[(f+1)*4+3],skin.data[(f+2)*4+3]);worst=Math.max(worst,o.distanceTo(p));
   const mid=rig.root.getObjectByName(k<2?(k?'right-elbow':'left-elbow'):(k===2?'left-knee':'right-knee'));p.setFromMatrixPosition(mid.matrixWorld).applyMatrix4(inv);
   assert(V(skin.data[(ROW.limbs+4*k+1)*4],skin.data[(ROW.limbs+4*k+1)*4+1],skin.data[(ROW.limbs+4*k+1)*4+2]).distanceTo(p)<1e-6,'P1 is the elbow/knee');
  }
 });
 assert(worst<1e-5,`limb tips and end frames on the joints (worst ${worst})`);
 // Boot sole reaches down to the ankle's ground contact, mittens stay round the hand.
 r.dispose();
 console.log('LIMB_ENDPOINTS_PASS',frames,'frames, worst',worst.toExponential(1));
}

// ---- Noodle continuity: no ring flips, no sliding rings, no cusps, no gaps, whatever the joints do.
function checkLimb(P0,P1,P2,h,sgn,spec,label,opts={}){
 const L=B.beanLimbCurve(P0,P1,P2,h,sgn,spec.K,spec.RHO),c=V(0,0,0),tn=V(0,0,0),N=V(0,0,0),Bf=V(0,0,0);
 assert(L.P0.distanceTo(P0)<1e-9&&(()=>{B.beanLimbAt(L,3,1,c,tn);return c.distanceTo(P2)<1e-6;})(),`${label}: exact endpoints`);
 let prev=null,maxTurn=0,maxTwist=0,maxJump=0,minR=Infinity,cusps=0,sPrev=-1;
 const steps=[];for(const sec of [1,2,3])for(let i=0;i<=60;i++)steps.push([sec,i/60]);
 for(const [sec,t] of steps){
  const s=B.beanLimbAt(L,sec,t,c,tn);B.beanRingFrame(L.h,tn,N,Bf);
  for(const v of [c,tn,N,Bf])assert(Number.isFinite(v.x+v.y+v.z),`${label}: finite`);
  assert(Math.abs(tn.length()-1)<1e-6&&Math.abs(N.length()-1)<1e-6&&Math.abs(Bf.length()-1)<1e-6&&Math.abs(N.dot(tn))<1e-6&&Math.abs(Bf.dot(tn))<1e-6,`${label}: orthonormal ring frame`);
  const r=B.beanLimbRadius(spec.r0,spec.r1,spec.bulge,s/L.S);minR=Math.min(minR,r);
  assert(s>=sPrev-1e-9,`${label}: arc length advances`);sPrev=s;
  if(prev){
   maxTurn=Math.max(maxTurn,prev.tn.angleTo(tn));maxTwist=Math.max(maxTwist,prev.B.angleTo(Bf));
   const step=c.distanceTo(prev.c);maxJump=Math.max(maxJump,step-(s-prev.s));
   if(prev.tn.dot(tn)<Math.cos(35*Math.PI/180))cusps++;
  }
  prev={c:c.clone(),tn:tn.clone(),B:Bf.clone(),s};
 }
 assert.equal(cusps,0,`${label}: no cusp (tangent never snaps > 35° between samples)`);
 assert(maxTurn<(opts.turn??.2),`${label}: smooth tangent (max step ${(maxTurn*180/Math.PI).toFixed(1)}°)`);
 assert(maxTwist<(opts.twist??.2),`${label}: ring frame never flips (max twist step ${(maxTwist*180/Math.PI).toFixed(1)}°)`);
 assert(maxJump<1e-6,`${label}: centre line is continuous (jump ${maxJump})`);
 assert(minR>=.015,`${label}: radius never collapses`);
 // Geometry rings: neighbouring rings of the actual tube stay attached (vertex offsets rotate < 30° ring to ring).
 const rings=B.LIMB_RINGS.map(([sec,t])=>{const s=sec<.5?B.beanLimbAt(L,1,0,c,tn):sec>3.5?B.beanLimbAt(L,3,1,c,tn):B.beanLimbAt(L,sec,t,c,tn);B.beanRingFrame(L.h,tn,N,Bf);return {c:c.clone(),N:N.clone(),B:Bf.clone(),s};});
 for(let i=1;i<rings.length;i++){const a=rings[i-1],b=rings[i];const d=Math.max(a.N.angleTo(b.N),a.B.angleTo(b.B));assert(d<(opts.ring??Math.PI/6),`${label}: ring ${i} stays attached (${(d*180/Math.PI).toFixed(1)}°)`);}
 return {maxTurn,maxTwist,minR,S:L.S,th:L.th};
}
{
 const A=B.LIMB_ARM,G=B.LIMB_LEG,X=V(1,0,0),rot=(v,ax,a)=>v.clone().applyAxisAngle(ax,a);
 const knee=deg=>{const thigh=V(0,-.43,0),shin=rot(V(0,-.4,0),X,deg*Math.PI/180);const P0=V(.07,.95,0),P1=P0.clone().add(thigh);return [P0,P1,P1.clone().add(shin)];};
 const elbow=deg=>{const up=V(0,-.3,0),fore=rot(V(0,-.265,0),X,-deg*Math.PI/180);const P0=V(.13,1.25,0),P1=P0.clone().add(up);return [P0,P1,P1.clone().add(fore)];};
 const cases=[
  ['knee 150°',...knee(150),X,1,G],['knee 179.5° fold',...knee(179.5),X,1,G],['knee 180° exact fold',...knee(180),X,1,G],['knee 90°',...knee(90),X,1,G],
  ['elbow 160°',...elbow(160),X,-1,A],['elbow 178°',...elbow(178),X,-1,A],
  ['straight leg',V(0,.95,0),V(0,.52,0),V(0,.12,0),X,1,G],
  ['limb pointing straight up (old flip case)',V(0,1.2,0),V(0,1.5,0),V(0,1.78,0),X,-1,A],
  ['limb pointing straight down',V(0,1.2,0),V(0,.9,0),V(0,.6,0),X,-1,A],
  ['up with a slight bend',V(0,1.2,0),V(0,1.5,0),V(.01,1.78,.03),X,-1,A],
  ['hinge along the limb',V(0,1.2,0),V(0,.9,0),V(0,.6,.1),V(0,1,0),-1,A],
  ['hyperextended knee',...knee(-25),X,1,G],
  ['very short shin',V(0,.95,0),V(0,.5,0),V(0,.4999,.0001),X,1,G],
  ['zero-length thigh',V(0,.95,0),V(0,.95,0),V(0,.5,.1),X,1,G],
  ['all joints coincide',V(0,.9,0),V(0,.9,0),V(0,.9,0),X,1,G],
  ['folded back past the hip (dive)',V(0,.9,0),V(0,.5,.3),V(0,.95,-.05),X,1,G],
  ['shin into the ground (dive spike case)',V(0,.35,0),V(.4,.1,0),V(.05,-.05,0),V(0,0,1),1,G],
  ['knee far away',V(0,.9,0),V(3,-2,1),V(0,.1,0),X,1,G],
 ];
 const report=[];
 for(const [label,P0,P1,P2,h,sgn,spec] of cases){const r=checkLimb(P0,P1,P2,h,sgn,spec,label);report.push(`${label} ${(r.th*180/Math.PI).toFixed(0)}°`);}
 // Random joints (including non-perpendicular hinges): always finite, round, continuous and exact at the ends.
 let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dir=()=>V(rnd()*2-1,rnd()*2-1,rnd()*2-1).normalize();
 for(let i=0;i<1500;i++){const P0=V(rnd(),rnd()+.5,rnd()),P1=P0.clone().addScaledVector(dir(),rnd()*.6),P2=P1.clone().addScaledVector(dir(),rnd()*.6);checkLimb(P0,P1,P2,dir(),rnd()<.5?1:-1,rnd()<.5?A:G,'random '+i,{turn:.5,twist:.6,ring:Math.PI/3});}
 console.log('LIMB_CONTINUITY_PASS',cases.length,'extreme cases + 1500 random:',report.join(' | '));
}
// ... and through the rig's own motion (runs, strikes, slides, dives, jumps, flight, rides).
{
 const r=make('bean','cont','home',false),skin=B.beanSkinOf(r);let n=0;
 play(r,()=>{skin.sync();for(let k=0;k<4;k++){const tx=i=>V(skin.data[i*4],skin.data[i*4+1],skin.data[i*4+2]),base=ROW.limbs+4*k;checkLimb(tx(base),tx(base+1),tx(base+2),tx(base+3),skin.data[(base+3)*4+3],k<2?B.LIMB_ARM:B.LIMB_LEG,`rig limb ${k}`);n++;}});
 r.dispose();console.log('RIG_LIMB_CONTINUITY_PASS',n,'limb poses');
}

// ---- No colour-band seams in the geometry: bands are shaded from arc length, rings never duplicate at a band edge.
{
 const g=B.beanGeometries().limbs,limb=g.getAttribute('beanLimb');const perTube=B.LIMB_RINGS.length*11;
 for(let k=0;k<4;k++){const keys=new Set();for(let i=0;i<perTube;i+=11){const idx=k*perTube+i;keys.add(limb.getY(idx)+':'+limb.getZ(idx));}assert.equal(keys.size,B.LIMB_RINGS.length,'every ring is distinct (no duplicated seam rings)');}
 const src=fs.readFileSync('lib/graphics/beanSkin.ts','utf8');assert(/ft<\.42\?bt\(/.test(src)&&/fb<\.64\?bt\(/.test(src),'band colours come from arc length in the fragment shader');
 console.log('NO_SEAM_RINGS_PASS');
}

// ---- Face atlas: one shared texture, per-instance cell; expressions switch cells and come back to the kid's own face.
{
 const cells=new Set();for(const e of L.BEAN_EYES)for(const m of L.BEAN_MOUTHS)cells.add(B.faceCell(e,m,'neutral'));
 for(const x of L.BEAN_EXPRESSIONS)if(x!=='neutral')cells.add(B.faceCell('dots','smile',x));
 assert.equal(cells.size,26);assert(Math.max(...cells)<B.FACE_COLS*B.FACE_ROWS);
 const r=make('bean','face'),skin=B.beanSkinOf(r),cellOf=()=>skin.data[ROW.skin*4+3];
 r.setBeanLook({...L.DEFAULT_BEAN_LOOK,eyes:'ovals',mouth:'grin'},L.DEFAULT_HOME_KIT);const own=cellOf();assert.equal(own,B.faceCell('ovals','grin','neutral'));
 const seen=new Set([own]);for(const x of L.BEAN_EXPRESSIONS){r.setExpression(x);assert.equal(cellOf(),B.faceCell('ovals','grin',x),x);assert.equal(skin.faceCell,cellOf());seen.add(cellOf());}
 assert.equal(seen.size,7,'seven distinct expression cells');r.setExpression('neutral');assert.equal(cellOf(),own,'neutral returns to the kid\'s own eyes and mouth');
 const r2=make('bean','face2');assert.equal(B.beanFaceAtlas(),B.beanFaceAtlas(),'one shared atlas');
 const mats=[r,r2].map(x=>B.beanSkinOf(x).meshes[0].material);assert.equal(mats[0].beanUniforms.beanFace.value,mats[1].beanUniforms.beanFace.value,'rigs share the atlas texture');
 assert.equal(mats[0].customProgramCacheKey(),mats[1].customProgramCacheKey(),'rigs share programs');
 r.dispose();r2.dispose();console.log('FACE_ATLAS_PASS');
}

// ---- Looks, kits and numbers: a team's kit is identical on every player (only body/face/hair vary).
{
 const kit={kind:'kit',shirt:'#ffc83d',shirt2:'#23315e',shorts:'#23315e',socks:'#ffc83d',socks2:'#23315e',boots:'#23315e'};
 const rigs=Array.from({length:11},(_,i)=>{const r=make('bean','k'+i);r.setBeanLook(L.defaultBeanLookFor('k'+i),{...kit,number:i+1});return r;});
 const KIT=[ROW.shirt,ROW.shirt2,ROW.shorts,ROW.socks,ROW.socks2,ROW.boots];
 const kitOf=r=>KIT.map(k=>Array.from(B.beanSkinOf(r).data.slice(k*4,k*4+3)).join());
 for(const r of rigs)assert.deepEqual(kitOf(r),kitOf(rigs[0]),'identical team kit');
 rigs.forEach((r,i)=>assert.equal(B.beanSkinOf(r).data[ROW.hat2*4+3],i+1,'number in the data row'));
 rigs[3].setShirtNumber(null);assert.equal(B.beanSkinOf(rigs[3]).data[ROW.hat2*4+3],0);rigs[3].setShirtNumber(23);assert.equal(B.beanSkinOf(rigs[3]).data[ROW.hat2*4+3],23);
 assert.equal(B.beanSkinOf(rigs[0]).data[ROW.shirt*4+3],0,'dark ink on a light shirt');
 const dark=make('bean','dk');dark.setBeanLook(L.DEFAULT_BEAN_LOOK,{...kit,shirt:'#23315e',number:9});assert.equal(B.beanSkinOf(dark).data[ROW.shirt*4+3],1,'white ink on a dark shirt');
 const num=dark.root.getObjectByName('player-shirt-number');assert(num&&!num.visible,'classic number panel stays hidden in bean style');
 // Hair under covering hats; keepers get gloves.
 const k=make('bean','gk');k.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'crop',color:'#222'},headwear:'keeper',gloves:'#e8f04a'},{...kit,number:1});
 const ks=B.beanSkinOf(k);assert.equal(ks.data[ROW.hair*4+3],0,'short hair hidden under a keeper cap');assert.equal(ks.data[ROW.hat1*4+3],B.HAT_IDS.keeper);assert.equal(ks.data[ROW.hands*4+3],Math.fround(1.45),'keeper gloves');
 assert(!k.root.getObjectByName('bean-hair').visible&&k.root.getObjectByName('bean-hat').visible);
 for(const b of L.BEAN_BUILDS){const d=B.beanBodyDims(b);assert(d.H>.7&&d.W>.2&&d.radius(.5)>.2&&d.point(d.faceU,0).z>0,b);}
 assert.equal(k.root.userData.beanBody.build,'regular');
 [...rigs,dark,k].forEach(r=>r.dispose());console.log('LOOKS_KITS_NUMBERS_PASS');
}

// ---- Costume fallback (lane A's hook on its own: lane E fits most club costumes onto the bean on top of it): a
// classic costume renders the classic body exactly; removing it brings the bean back.
const jointsOf=r=>{const n=x=>r.root.getObjectByName(x);return {root:r.root,pelvis:n('player-pelvis'),torso:n('armor-torso'),lumbar:n('player-lumbar'),chest:n('player-chest'),head:n('player-head'),
 arms:['left','right'].map(s=>({shoulder:n(s+'-shoulder'),elbow:n(s+'-elbow'),hand:n(s+'-hand')})),legs:['left','right'].map(s=>({hip:n(s+'-hip'),knee:n(s+'-knee'),ankle:n(s+'-ankle')}))};};
{
 const costume=load('lib/town/costumes.ts').CLUB_COSTUMES[0].id;
 const raw=make('classic','cos'),b=B.attachBeanSkin(raw,jointsOf(raw),'cos','home',true,'bean'),c=make('classic','cos'),vis=r=>{const out=[];r.root.traverse(o=>{if(o.isMesh)out.push(o.name+':'+o.visible);});return out.filter(x=>!x.startsWith('bean-'));};
 for(const r of [b,c]){r.setShirtNumber(7);r.setAppearance({...DEFAULT_CUSTOMIZATION,character:'female',costume});}
 assert.deepEqual(vis(b),vis(c),'costume: classic meshes (incl. the costume) show exactly as in classic style');
 assert(B.beanSkinOf(b).meshes.every(m=>!m.visible),'costume: bean skin sleeps');assert.equal(b.root.userData.beanBody,undefined,'no beanBody while a classic costume shows');
 const scene=new T.Scene(),batch=playerBatch(scene,16);batch.begin();b.update(0,0,.03,1,false);batch.draw(b.root);batch.end();
 assert(!scene.children.some(o=>o.isInstancedMesh&&o.visible&&o.geometry.name.startsWith('bean-')),'batch draws no bean parts under a costume');
 for(const r of [b,c])r.setAppearance({...DEFAULT_CUSTOMIZATION,character:'female',costume:'none'});
 assert(vis(b).every(x=>x.endsWith(':false')),'costume off: classic hidden again');assert(B.beanSkinOf(b).meshes[0].visible&&b.root.userData.beanBody);
 // The remembered classic visibility is exact after the round trip.
 for(const r of [b,c])r.setAppearance({...DEFAULT_CUSTOMIZATION,character:'male',costume});assert.deepEqual(vis(b),vis(c),'second costume round trip');
 batch.dispose();b.dispose();c.dispose();console.log('COSTUME_FALLBACK_PASS');
}

// ---- Batch budget: 22 players + 10 NPC-style rigs in one batch are four instanced draws; rows match each rig.
{
 const scene=new T.Scene(),batch=playerBatch(scene),rigs=[];
 for(let i=0;i<32;i++){const r=make('bean','b'+i,i<11?'home':'away',false);const look=L.defaultBeanLookFor('b'+i);r.setBeanLook({...look,headwear:i>=22?'cap':i%11===0?'keeper':'none'},{...(i<11?L.DEFAULT_HOME_KIT:i<22?L.DEFAULT_AWAY_KIT:L.DEFAULT_CASUAL_OUTFIT),number:i<22?i%11+1:null});rigs.push(r);}
 const frame=t=>{batch.begin();rigs.forEach((r,i)=>{r.update(i*.9,Math.sin(t+i),1/30,t,false,{runIntensity:.6});batch.draw(r.root);});batch.end();};
 frame(0);frame(1/30);
 const groups=scene.children.filter(o=>o.isInstancedMesh&&o.visible);
 assert.deepEqual([...new Set(groups.map(o=>o.geometry.name))].sort(),['bean-body','bean-hair','bean-hat','bean-limbs'].filter(n=>groups.some(o=>o.geometry.name===n)).sort());
 // Budget pass (Sep 27 2026): hair/hat batches are split by style and draw only that style's index range (not every style collapsed).
 const styleOf=(r,texel)=>Math.round(B.beanSkinOf(r).data[texel*4+3]);
 const hairStyles=new Set(rigs.map(r=>styleOf(r,10)).filter(s=>s>0)),hatStyles=new Set(rigs.map(r=>styleOf(r,11)).filter(s=>s>0));
 assert(groups.length<=2+hairStyles.size+hatStyles.size,`32 characters in ${groups.length} instanced draws (${hairStyles.size} hair + ${hatStyles.size} hat styles)`);
 for(const g of groups.filter(o=>/bean-(hair|hat)/.test(o.geometry.name))){const full=g.geometry.index.count,dr=g.geometry.drawRange,anchor=g.geometry.getAttribute('beanAnchor'),idx=g.geometry.index;
  assert(dr.count<full,`${g.geometry.name}: draws ${dr.count} of ${full} indices`);const st=new Set();for(let i=dr.start;i<dr.start+dr.count;i++)st.add(Math.round(anchor.getW(idx.getX(i))));assert.equal(st.size,1,'one style per batch range');
  let outside=0;const s0=[...st][0];for(let i=0;i<full;i++)if((i<dr.start||i>=dr.start+dr.count)&&Math.round(anchor.getW(idx.getX(i)))===s0)outside++;assert.equal(outside,0,'the whole style is inside the range');}
 const limbs=groups.find(o=>o.geometry.name==='bean-limbs');assert.equal(limbs.count,32);
 const rows=limbs.material.beanUniforms.beanData.value,pose=limbs.material.beanUniforms.beanDyn.value,fw=rows.image.width,pw=pose.image.width;
 assert.equal(fw,ROW.lumbar,'static texels in their own texture');assert.equal(fw+pw,ROW.size,'pose texels in the other');
 rigs.forEach((r,i)=>{const src=B.beanSkinOf(r).data;for(let k=0;k<fw*4;k++)assert.equal(rows.image.data[i*fw*4+k],Math.fround(src[k]),`row ${i} texel ${k}`);for(let k=0;k<pw*4;k++)assert.equal(pose.image.data[i*pw*4+k],Math.fround(src[fw*4+k]),`row ${i} pose texel ${k}`);});
 assert(limbs.customDepthMaterial&&limbs.customDepthMaterial.beanUniforms.beanData.value===rows&&limbs.customDepthMaterial.beanUniforms.beanDyn.value===pose,'shadow pass reads the same rows');
 assert(rows.image.height>=32&&rows.image.height<=64,'rows grow in powers of two');
 // A new pose re-uploads only the small pose textures; appearance rows stay put.
 const body=groups.find(o=>o.geometry.name==='bean-body'),v0=body.material.beanUniforms.beanData.value.version,p0=body.material.beanUniforms.beanDyn.value.version;frame(2/30);
 assert.equal(body.material.beanUniforms.beanData.value.version,v0,'appearance rows do not re-upload while players move');assert(body.material.beanUniforms.beanDyn.value.version>p0,'pose rows upload');
 const p1=body.material.beanUniforms.beanDyn.value.version;batch.begin();rigs.forEach(r=>batch.draw(r.root));batch.end();assert.equal(body.material.beanUniforms.beanDyn.value.version,p1,'no upload when nothing changed');
 assert.equal(body.material.beanUniforms.beanDyn.value.image.width*4*4*32+body.material.beanUniforms.beanData.value.image.width*0,2*16*32,'body pose upload: 2 texels per player');
 const classic=new T.Scene(),cb=playerBatch(classic),cr=Array.from({length:32},(_,i)=>make('classic','c'+i,i%2?'away':'home',false));cb.begin();cr.forEach(r=>{r.update(0,0,.03,1,false);r.setShirtNumber(5);cb.draw(r.root);});cb.end();
 const classicDraws=classic.children.filter(o=>o.isInstancedMesh&&o.visible).length;assert(classicDraws>groups.length);
 batch.dispose();cb.dispose();rigs.forEach(r=>r.dispose());cr.forEach(r=>r.dispose());
 console.log('BATCH_BUDGET_PASS',groups.length,'bean draws vs',classicDraws,'classic for 32 characters');
}

// ---- Browser: real renderer.info draw calls and GPU = CPU limb shape (skipped without Chrome/Playwright).
(async()=>{
 const PW='/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright',CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
 if(!fs.existsSync(PW)||!fs.existsSync(CHROME)||process.env.BEAN_SKIP_BROWSER){console.log('BROWSER_SKIPPED (no Chrome/Playwright)');return;}
 const http=require('node:http'),root=process.cwd();
 const page=`<!doctype html><meta charset=utf-8><body style=margin:0><script type=importmap>{"imports":{"three":"/node_modules/three/build/three.module.js","three/examples/jsm/":"/node_modules/three/examples/jsm/"}}</script><script type=module>
import * as T from 'three';import {setCharacterStyle} from '/lib/graphics/characterStyle';
const {createPlayer}=await import('/lib/graphics/player');const {playerBatch}=await import('/lib/graphics/playerBatch');const B=await import('/lib/graphics/beanSkin');
const renderer=new T.WebGLRenderer({antialias:false});renderer.setSize(400,400);renderer.shadowMap.enabled=true;document.body.appendChild(renderer.domElement);
const sceneFor=()=>{const s=new T.Scene();s.add(new T.HemisphereLight('#fff','#888',2));const sun=new T.DirectionalLight('#fff',2);sun.position.set(-5,9,4);sun.castShadow=true;s.add(sun);return s;};
const cam=new T.PerspectiveCamera(40,1,.1,200);cam.position.set(0,24,28);cam.lookAt(0,0,0);
const out={};
for(const style of ['bean','classic']){setCharacterStyle(style);const scene=sceneFor(),batch=playerBatch(scene),rigs=Array.from({length:32},(_,i)=>{const r=createPlayer('r'+i,i%2?'away':'home',false);r.setShirtNumber(i%11+1);return r;});
 for(let f=0;f<3;f++){batch.begin();rigs.forEach((r,i)=>{r.update((i%8-4)*2,(Math.floor(i/8)-2)*2,1/30,f/30,false,{runIntensity:.6});batch.draw(r.root);});batch.end();renderer.render(scene,cam);}
 renderer.info.autoReset=false;renderer.info.reset();renderer.render(scene,cam);out[style]={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};renderer.info.autoReset=true;
 batch.dispose();rigs.forEach(r=>r.dispose());}
// GPU/CPU parity: one bent rig's limbs drawn by the shader vs the CPU mirror, compared as masks.
setCharacterStyle('bean');const rig=createPlayer('parity','home',false),skin=B.beanSkinOf(rig);rig.update(0,0,0,1,false,{facing:Math.PI/2});
const J=n=>rig.root.getObjectByName(n);J('left-hip').rotation.set(-1.6,0,0);J('left-knee').rotation.x=2.62;J('right-shoulder').rotation.set(-2.9,0,.4);J('right-elbow').rotation.x=-2.75;J('left-shoulder').rotation.set(.4,0,-.3);J('left-elbow').rotation.x=-1.4;
rig.root.updateMatrixWorld(true);skin.sync();
const limbs=skin.meshes[1],geo=limbs.geometry,pos=geo.getAttribute('position'),limbAttr=geo.getAttribute('beanLimb'),local=geo.getAttribute('beanLocal'),cpu=new Float32Array(pos.count*3),v=new T.Vector3(),l=new T.Vector3();
for(let i=0;i<pos.count;i++){B.evalLimbVertex(skin.data,[limbAttr.getX(i),limbAttr.getY(i),limbAttr.getZ(i),limbAttr.getW(i)],l.set(local.getX(i),local.getY(i),local.getZ(i)),v);cpu.set([v.x,v.y,v.z],i*3);}
const cg=new T.BufferGeometry();cg.setAttribute('position',new T.BufferAttribute(cpu,3));cg.setIndex(geo.index);
const flat=new T.MeshBasicMaterial({color:'#fff'});const cam2=new T.OrthographicCamera(-1.1,1.1,1.1,-1.1,.1,20);cam2.position.set(6,.9,0);cam2.lookAt(0,.9,0);
const mask=scene=>{renderer.setClearColor('#000');renderer.render(scene,cam2);const gl=renderer.getContext(),px=new Uint8Array(400*400*4);gl.readPixels(0,0,400,400,gl.RGBA,gl.UNSIGNED_BYTE,px);const m=new Uint8Array(400*400);for(let i=0;i<m.length;i++)m[i]=px[i*4]+px[i*4+1]+px[i*4+2]>30?1:0;return m;};
const s1=new T.Scene();s1.add(new T.AmbientLight('#fff',3));for(const m of skin.meshes)if(m!==limbs)m.visible=false;s1.add(rig.root);const gpuMask=mask(s1);
const s2=new T.Scene();const cm=new T.Mesh(cg,flat);cm.matrixAutoUpdate=false;cm.matrix.copy(rig.root.matrixWorld);s2.add(cm);const cpuMask=mask(s2);
let both=0,either=0;for(let i=0;i<gpuMask.length;i++){if(gpuMask[i]&&cpuMask[i])both++;if(gpuMask[i]||cpuMask[i])either++;}
out.parity={both,either,iou:both/Math.max(1,either)};window.__out=out;
</script>`;
 const server=http.createServer((req,res)=>{const url=decodeURIComponent(req.url.split('?')[0]);try{
  if(url==='/')return res.writeHead(200,{'content-type':'text/html'}),res.end(page);
  if(url.startsWith('/node_modules/'))return res.writeHead(200,{'content-type':'text/javascript'}),res.end(fs.readFileSync(path.join(root,url)));
  let f=path.join(root,url);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())for(const ext of ['.ts','.tsx'])if(fs.existsSync(f+ext)){f+=ext;break;}
  const src=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '@\/(.*?)'/g,"from '/$1'");
  res.writeHead(200,{'content-type':'text/javascript'});res.end(src);}catch(e){res.writeHead(404);res.end(String(e));}});
 await new Promise(r=>server.listen(0,r));
 const {chromium}=require(PW),browser=await chromium.launch({headless:true,executablePath:CHROME,args:['--use-angle=metal','--ignore-gpu-blocklist']});
 try{
  const tab=await browser.newPage({viewport:{width:400,height:400}}),errors=[];tab.on('pageerror',e=>errors.push(e.message));tab.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await tab.goto(`http://localhost:${server.address().port}/`);await tab.waitForFunction(()=>window.__out,null,{timeout:90000});
  const out=await tab.evaluate(()=>window.__out);
  assert.deepEqual(errors.filter(e=>!/favicon|404/.test(e)),[],'no shader or page errors');
  // Colour + shadow passes: bean = 4 parts × 2 passes plus one batch per hair/hat style in use (budget pass Sep 27 2026: each style
  // batch draws only its own index range, far fewer vertices than every style collapsed); classic ≥ 10 batches × 2.
  assert(out.bean.calls<=14,`bean: ${out.bean.calls} draw calls for 32 characters`);assert(out.classic.calls>out.bean.calls*1.5,`classic ${out.classic.calls}`);
  assert(out.parity.iou>.97,`GPU limbs match the CPU mirror (IoU ${out.parity.iou.toFixed(3)})`);
  console.log('BROWSER_PASS renderer.info 32 characters: bean',JSON.stringify(out.bean),'classic',JSON.stringify(out.classic),'limb GPU/CPU IoU',out.parity.iou.toFixed(4));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
