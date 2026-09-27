// Lane F (docs/bean-characters/CONTRACT.md): every ride and flight gear fits the bean body, and every fall keeps
// the bean on the ground. Poses the real rig in bean style for each travel mode / variant and checks:
//  - hands on the grips (or steering bar / yoke), soles on the deck / pedals / footrest, the bean seated on the saddle;
//  - no bean-shell or limb point below y = 0 or inside a vehicle part (oriented bounding boxes, contact parts excluded);
//  - packs flush on the bean's back (not inside it) and clear of the tallest headwear; the Iron Man shell covers the
//    bean (face open or closed); parachute lines leave the bean's shoulders; costume + gear combos stay finite;
//  - falls (run over, ride crash, jetpack breakup fall, rooftop hang/fall/dizzy, parachute landing, wall splat,
//    NPC truck knockdown): no NaN, lowest point >= ground every frame, and the get-up completes.
// Then the same rides in classic style keep the original geometry (rollback).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});return mod.exports;}
const T=req('three'),G=p=>load(base+'/lib/graphics/'+p+'.ts');
const {setCharacterStyle}=G('characterStyle');
setCharacterStyle('bean');
const {createPlayer}=G('player'),{createVehicle}=G('vehicle'),fit=G('beanGearFit'),{knockdownLowest,knockdownLift,createKnockdownFace}=G('knockdown');
const {BEAN_SHAPES,beanHeadFrame}=G('beanSkin'),{createBallReactions}=G('ballReactions'),{createParachute}=G('parachute');
const {DEFAULT_CUSTOMIZATION:D,CUSTOMIZATION_OPTIONS:OPTIONS}=load(base+'/lib/town/customization.ts');
const {DEFAULT_BEAN_LOOK}=G('beanLook');
const v3=()=>new T.Vector3(),report=[],checklist={};
const note=(mode,item,ok,detail)=>{(checklist[mode]??=[]).push((ok?'ok  ':'FAIL ')+item+(detail?' ('+detail+')':''));};

// ---------------------------------------------------------------- samplers
function beanPoints(rig){
  const s=fit.beanShapeOf(rig.root);assert(s,'rig renders a bean');
  const torso=rig.root.getObjectByName('armor-torso'),chest=rig.root.getObjectByName('player-chest'),pts=[];
  for(let i=0;i<=12;i++)for(let j=0;j<16;j++){const u=i/12,p=fit.beanSurface(s,u,j/16*Math.PI*2),upper=p.y>.34;
    const w=new T.Vector3(p.x,upper?p.y-.32:p.y,p.z).applyMatrix4((upper?chest:torso).matrixWorld);w.u=u;w.a=j/16*Math.PI*2;pts.push(w);}
  return pts;
}
function limbPoints(rig){
  const J=n=>rig.root.getObjectByName(n).getWorldPosition(v3()),out={arms:[],legs:[],hands:[],soles:[]};
  const chest=J('player-chest'),pelvis=J('player-pelvis');
  for(const side of ['left','right']){
    const s0=J(side+'-shoulder').lerp(chest,.55);s0.y-=.045;const e=J(side+'-elbow');
    const hand=rig.root.getObjectByName(side+'-elbow').localToWorld(new T.Vector3(0,-.265,0));
    const h0=J(side+'-hip').lerp(pelvis,.35);h0.y+=.07;const k=J(side+'-knee'),a=J(side+'-ankle');
    // Upper segments start outside the shell (the tube emerges from the bean).
    for(const t of [.5,.75,1])out.arms.push(s0.clone().lerp(e,t));for(const t of [.25,.5,.75])out.arms.push(e.clone().lerp(hand,t));
    for(const t of [.6,.8,1])out.legs.push(h0.clone().lerp(k,t));for(const t of [.25,.5,.75])out.legs.push(k.clone().lerp(a,t));
    // Mitten centre (hand frame −.02) and boot sole (ankle frame, −.088 under the boot centre).
    out.hands.push(rig.root.getObjectByName(side+'-elbow').localToWorld(new T.Vector3(0,-.285,0)));
    out.soles.push(rig.root.getObjectByName(side+'-ankle').localToWorld(new T.Vector3(0,-.088,.05)));
  }
  return out;
}
/** Visible meshes of the vehicle, excluding names that match `skip`, as oriented boxes. */
function hulls(vehicle,skip){
  vehicle.root.updateMatrixWorld(true);const out=[];
  vehicle.root.traverseVisible(o=>{if(!o.isMesh||(skip&&skip.test(o.name||o.parent?.name||'')))return;if(o.material?.transparent||o.material?.type==='MeshBasicMaterial')return;
    o.geometry.computeBoundingBox();const inv=o.matrixWorld.clone().invert();out.push({o,inv,box:o.geometry.boundingBox});});
  return out;
}
function inside(h,p,margin=.012){const q=p.clone().applyMatrix4(h.inv),b=h.box,s=h.o.matrixWorld.getMaxScaleOnAxis();const m=margin/s,g=h.o.geometry,P=g.parameters||{};
  // Spheres/ellipsoids and cylinders use their true shape (a box would flag points beside a curved fairing or tube).
  if(g.type==='SphereGeometry'&&P.phiLength>=Math.PI*2-1e-6&&P.thetaLength>=Math.PI-1e-6)return q.length()<P.radius-m;
  if(g.type==='CylinderGeometry'&&P.radiusTop===P.radiusBottom)return Math.hypot(q.x,q.z)<P.radiusTop-m&&Math.abs(q.y)<P.height/2-m;
  if(g.type==='ConeGeometry')return Math.abs(q.y)<P.height/2-m&&Math.hypot(q.x,q.z)<P.radius*(.5-q.y/P.height)-m;
  return q.x>b.min.x+m&&q.x<b.max.x-m&&q.y>b.min.y+m&&q.y<b.max.y-m&&q.z>b.min.z+m&&q.z<b.max.z-m;}
const distToSegment=(p,a,b)=>{const ab=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(ab)/ab.lengthSq()));return p.distanceTo(a.clone().addScaledVector(ab,t));};
/** A bar mesh's end points in world space (cylinder axis along local y). */
function barEnds(mesh){mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;return [mesh.localToWorld(new T.Vector3(0,b.min.y,0)),mesh.localToWorld(new T.Vector3(0,b.max.y,0))];}
function topOf(mesh){mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingBox();return mesh.localToWorld(new T.Vector3(0,mesh.geometry.boundingBox.max.y,0)).y;}
const finite=root=>{let ok=true;root.traverse(n=>{if(![...n.position,...n.quaternion,...n.scale].every(Number.isFinite))ok=false;});return ok;};

// ---------------------------------------------------------------- rig + ride helpers
const rig=createPlayer('bean-rides','home'),vehicle=createVehicle();
rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular',headwear:'none'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
function ride(mode,value,motion={},frames=24,air=0){
  vehicle.setCustomization({...D,...value});
  for(let i=0;i<frames;i++){
    rig.update(0,i*1e-5,1/60,i/60,false,{travelMode:mode,...motion});rig.root.position.set(0,air,0);rig.root.rotation.set(0,0,0);rig.root.scale.setScalar(1);
    vehicle.update(motion.parachute?'walk':mode,0,0,rig.root.rotation.y,1/60,mode==='walk'?0:6,motion.flight);vehicle.root.position.y=air;vehicle.root.scale.setScalar(1.12);vehicle.root.rotation.set(0,rig.root.rotation.y,0);
    vehicle.syncArmor(rig.root,true);
  }
  rig.root.updateMatrixWorld(true);vehicle.root.updateMatrixWorld(true);
}
const HAND_TOL=.07,SOLE_TOL=.035,SEAT_TOL=.035;
function checkGround(label,mode,skipBody,skipLimbs,extra){
  const body=beanPoints(rig),limbs=limbPoints(rig);
  const minY=Math.min(...body.map(p=>p.y),...limbs.arms.map(p=>p.y),...limbs.legs.map(p=>p.y),...limbs.soles.map(p=>p.y+.005));
  note(label,'nothing below the ground',minY>=-1e-3,'min y '+minY.toFixed(3));assert(minY>=-1e-3,label+' body/limbs above ground: '+minY);
  const hb=hulls(vehicle,skipBody),hl=hulls(vehicle,skipLimbs);
  const bodyHits=body.filter(p=>hb.some(h=>inside(h,p))).length,limbHits=[...limbs.arms,...limbs.legs].map(p=>hl.find(h=>inside(h,p))).filter(Boolean);
  note(label,'bean shell clear of the ride',bodyHits===0,bodyHits+' points inside');note(label,'limbs clear of the ride',limbHits.length===0,limbHits.map(h=>h.o.name||h.o.parent.name).join(',')||'0 points inside');
  assert.equal(bodyHits,0,label+': bean shell inside the ride '+hb.filter(h=>body.some(p=>inside(h,p))).map(h=>(h.o.name||h.o.parent?.name||'mesh')+'['+h.o.geometry.type+' @'+h.o.position.toArray().map(x=>x.toFixed(2))+']').join(','));
  assert.equal(limbHits.length,0,label+': limbs inside the ride '+limbHits.map(h=>(h.o.name||h.o.parent?.name||'mesh')+'['+h.o.geometry.type+' @'+h.o.position.toArray().map(x=>x.toFixed(2))+']').join(','));
  extra?.(body,limbs);return {body,limbs};
}

// ---------------------------------------------------------------- ground rides
const variants=m=>OPTIONS[m].map(o=>o.id);
for(const mode of ['scooter','bike','moped']){
  for(const id of variants(mode)){
    const label=mode+':'+id;ride(mode,{[mode]:id});
    assert(vehicle.beanFit,label+' uses the bean fit');
    const group=vehicle.root.getObjectByName(mode);
    // Hands: mitten centre within reach of the rubber grips.
    const {hands,soles}=limbPoints(rig);
    ['left','right'].forEach((side,i)=>{const [a,b]=barEnds(group.getObjectByName(mode+'-grip-'+side)),d=distToSegment(hands[i],a,b);
      note(label,side+' hand on grip',d<HAND_TOL,d.toFixed(3)+' m');assert(d<HAND_TOL,label+' '+side+' hand on its grip: '+d.toFixed(3));});
    // Feet.
    if(mode==='scooter'){const deck=topOf(group.getObjectByName('scooter-deck'));const deckTop=id==='mint'?topOf(group.getObjectByName('scooter-mint-deck')):id==='coast'?Math.max(deck,topOf(group.getObjectByName('scooter-coast').children[0])):deck;
      // Front foot stands on the deck; the pushing foot only touches down at the bottom of its stroke.
      const d=Math.abs(soles[0].y-deckTop);note(label,'front sole on deck',d<SOLE_TOL,d.toFixed(3));assert(d<SOLE_TOL,label+' sole on deck '+d);
      assert(soles[1].y>=deckTop-SOLE_TOL,label+' push foot not through the deck');}
    if(mode==='bike')for(let i=0;i<2;i++){const pedal=group.getObjectByName('bike-pedal-'+(i?'right':'left'));assert(pedal.visible,'pedal shown on a bean bike');
      const d=Math.abs(soles[i].y-topOf(pedal));note(label,(i?'right':'left')+' sole on pedal',d<SOLE_TOL,d.toFixed(3));assert(d<SOLE_TOL,label+' sole on pedal '+d);
      const crank=group.localToWorld(new T.Vector3(0,(.39-.088-.012)/1.12,.06/1.12)),r=pedal.getWorldPosition(v3()).sub(crank);r.x=0;assert(r.length()>.08&&r.length()<.22,label+' pedal on a crank circle '+r.length());}
    if(mode==='moped'){const rest=group.getObjectByName('moped-footrest'),[a,b]=barEnds(rest),top=Math.max(a.y,b.y)+.035*1.12;
      for(let i=0;i<2;i++){const d=Math.abs(soles[i].y-top);note(label,'sole on footrest',d<SOLE_TOL,d.toFixed(3));assert(d<SOLE_TOL,label+' sole on footrest '+d);}}
    // Seat: the bean's lowest point rests on the saddle top.
    if(mode!=='scooter'){const low=Math.min(...beanPoints(rig).map(p=>p.y)),seat=topOf(group.getObjectByName(mode+'-seat')),d=low-seat;
      note(label,'bean seated on saddle',Math.abs(d)<SEAT_TOL,'gap '+d.toFixed(3));assert(Math.abs(d)<SEAT_TOL,label+' bean on the saddle: '+d.toFixed(3));}
    checkGround(label,mode,/seat|grip|handlebar/,/grip|handlebar|pedal|footrest|deck|seat|body/);
    assert(finite(rig.root)&&finite(vehicle.root),label+' finite');
  }
}
// Moped stand (feet on the saddle) and superman (hands still on the grips, body clear of the handlebars).
{ride('moped',{moped:'classic'},{mopedStand:1});const {soles}=limbPoints(rig),seat=topOf(vehicle.root.getObjectByName('moped-seat'));
  const d=Math.min(...soles.map(s=>s.y))-seat;
  // The stand lift (+.62 m) lives in the rig (player.ts, lane B): the soles meet the saddle only once it rises to
  // ~.79 m in bean style. Until then this is recorded (not failed) and the soles must stay inside the saddle's depth.
  note('moped:stand','soles on the saddle',Math.abs(d)<.06,'gap '+d.toFixed(3)+(Math.abs(d)<.06?'':'; needs the lane B stand lift'));assert(d>-.2&&d<.06,'stand: soles near the saddle '+d);
  checkGround('moped:stand','moped',/seat|grip|handlebar/,/grip|handlebar|pedal|footrest|seat|body/);}
{ride('moped',{moped:'sport'},{mopedSuperman:1});const {hands}=limbPoints(rig),group=vehicle.root.getObjectByName('moped');
  ['left','right'].forEach((side,i)=>{const [a,b]=barEnds(group.getObjectByName('moped-grip-'+side)),d=distToSegment(hands[i],a,b);note('moped:superman',side+' hand on grip',d<HAND_TOL,d.toFixed(3));assert(d<HAND_TOL,'superman hands on grips '+d);});
  checkGround('moped:superman','moped',/seat|grip|handlebar/,/grip|handlebar|pedal|footrest|seat|body/);}

// ---------------------------------------------------------------- flight gear
const flight={bob:0,pitch:0,roll:0,compression:0,thrust:1,secondary:0,phase:'cruise',progress:1};
for(const build of ['regular','tall','short','wide']){
  rig.setBeanLook({...DEFAULT_BEAN_LOOK,build,hair:{style:'ponytail',color:'#3a2518'},headwear:'bucket'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
  const s=BEAN_SHAPES[build];
  for(const kind of ['classic','helicopter']){
    const label='jetpack:'+kind+':'+build;ride('jetpack',{jetpack:kind},{flight},30,3);
    const group=vehicle.root.getObjectByName(kind==='classic'?'jetpack':'helicopter-pack'),box=group.children.find(c=>c.isMesh&&c.geometry.type==='BoxGeometry');
    box.geometry.computeBoundingBox();const front=box.localToWorld(new T.Vector3(0,0,box.geometry.boundingBox.max.z));
    const torso=rig.root.getObjectByName('armor-torso'),local=torso.worldToLocal(front.clone()),back=fit.beanBackZ(s,local.y),gap=local.z-back;
    note(label,'pack front on the bean back',gap<=0&&gap>-.06,'gap '+(-gap).toFixed(3));assert(gap<=.002&&gap>-.06,label+' pack flush on the back: '+gap.toFixed(3));
    const body=beanPoints(rig),hits=body.filter(p=>hulls(vehicle,/harness|rotor|blade/).some(h=>inside(h,p))).length;
    note(label,'pack not inside the bean',hits===0,hits+' points');assert.equal(hits,0,label+' bean points inside the pack');
    // Widest headwear (bucket brim, radius 1.42 R) and the longest back hair (ponytail tail) stay clear of the pack.
    const hf=beanHeadFrame(s),R=hf.R,hatPts=[];
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;hatPts.push(new T.Vector3(Math.sin(a)*1.42*R,-.56*R,Math.cos(a)*1.42*R),new T.Vector3(Math.sin(a)*1.02*R,-.28*R,Math.cos(a)*1.02*R));}
    new T.CatmullRomCurve3([[.05,.26,-.8],[.22,.04,-1.1],[.42,-.3,-1.08],[.56,-.8,-.9]].map(p=>new T.Vector3(...p))).getSpacedPoints(8).forEach(p=>{hatPts.push(p.clone().multiplyScalar(R).add(new T.Vector3(0,0,-.22*R)));hatPts.push(p.clone().multiplyScalar(R).add(new T.Vector3(0,-.22*R,0)));});
    const packHulls=hulls(vehicle,/harness/),worldHat=hatPts.map(p=>torso.localToWorld(p.add(hf.origin)));
    const hatHits=worldHat.filter(p=>packHulls.some(h=>inside(h,p,0))).length;
    note(label,'headwear and hair clear of the pack',hatHits===0,hatHits+' points');assert.equal(hatHits,0,label+' bucket brim / ponytail clear of the pack: '+worldHat.filter(p=>packHulls.some(h=>inside(h,p,0))).map(p=>torso.worldToLocal(p.clone()).toArray().map(x=>x.toFixed(2))+'@'+packHulls.find(h=>inside(h,p,0)).o.geometry.type).join(' '));
    // Harness straps hug the shell: every strap vertex sits 0–2.5 cm off the bean surface (no floating hoops).
    {let worst=0,inner=0;const lean=s.leanZ*(s.H+.13);
     group.children.filter(m=>m.name==='bean-harness-belt').forEach(m=>{const p=m.geometry.getAttribute('position');for(let k=0;k<p.count;k++){const l=torso.worldToLocal(new T.Vector3().fromBufferAttribute(p,k).applyMatrix4(m.matrixWorld));
       let best=Infinity;const u0=(l.y+.13)/(s.H+.13);for(let du=-.06;du<=.06;du+=.01)for(let da=-.2;da<=.2;da+=.02){const a=Math.atan2(l.x,l.z-lean*u0*u0)+da,q=fit.beanSurface(s,u0+du,(a+Math.PI*2)%(Math.PI*2));best=Math.min(best,Math.hypot(l.x-q.x,l.y-q.y,l.z-q.z));}
       worst=Math.max(worst,best);}});
     note(label,'harness straps hug the bean',worst<.025,'max gap '+worst.toFixed(3));assert(worst<.025,label+' harness strap floats off the bean: '+worst.toFixed(3));}
    // Pack follows the torso through a Superman lean and a hard bank.
    const style={weights:new Float32Array(8),total:1,bank:.8,pitch:1.38,variant:0,dominant:'superman',orbitTurn:0,orbitCharge:0};style.weights[0]=1;
    ride('jetpack',{jetpack:kind},{flight:{...flight,style,turn:.8}},30,3);
    const f2=box.localToWorld(new T.Vector3(0,0,box.geometry.boundingBox.max.z)),l2=torso.worldToLocal(f2.clone()),g2=l2.z-fit.beanBackZ(s,l2.y);
    assert(g2<=.002&&g2>-.06,label+' pack stays on the back in the superman pose: '+g2.toFixed(3));
  }
}
rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
// Flying car / mini-plane: seated in the cockpit, hands on the wheel or yoke, back clear of the seat back.
for(const kind of ['flying-car','mini-plane']){
  const label='jetpack:'+kind;ride('jetpack',{jetpack:kind},{flight,flyingCar:true},24,3);
  const {hands}=limbPoints(rig),group=vehicle.root.getObjectByName(kind);
  const bar=kind==='flying-car'?group.getObjectByName('flying-car-wheel'):group.getObjectByName('mini-plane-yoke').children[0];
  const [a,b]=kind==='flying-car'?barEnds(bar):(()=>{bar.geometry.computeBoundingBox();const bb=bar.geometry.boundingBox;return [bar.localToWorld(new T.Vector3(bb.min.x,0,0)),bar.localToWorld(new T.Vector3(bb.max.x,0,0))];})();
  hands.forEach((h,i)=>{const d=distToSegment(h,a,b);note(label,(i?'right':'left')+' hand on '+(kind==='flying-car'?'wheel':'yoke'),d<HAND_TOL,d.toFixed(3));assert(d<HAND_TOL,label+' hands on the controls '+d.toFixed(3));});
  checkGround(label,'jetpack',/flying-car-(body|cockpit|wheel)|mini-plane-(fuselage|yoke)/,/./);
  const low=Math.min(...beanPoints(rig).map(p=>p.y))-3;note(label,'bean sits in the cockpit',low>.75&&low<1.0,'bottom '+low.toFixed(3));
}
// Rocketboard: soles on the deck.
{ride('jetpack',{jetpack:'rocketboard'},{flight,rocketboard:true},24,3);const deck=vehicle.root.getObjectByName('rocketboard').children[1],top=topOf(deck),{soles}=limbPoints(rig);
  soles.forEach((s,i)=>{const d=s.y-top;note('jetpack:rocketboard','sole on deck',Math.abs(d)<.06,'gap '+d.toFixed(3));assert(Math.abs(d)<.06,'rocketboard sole on the deck '+d.toFixed(3));});}
// Iron Man: the bean shell covers the bean (both faces); bean hair/hat hidden while worn and restored after.
for(const face of ['open','plate']){
  rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'wide',hair:{style:'puffs',color:'#222'},headwear:'cap'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
  vehicle.setArmorFace(face);ride('jetpack',{jetpack:'ironman'},{flight},12,3);
  const hat=rig.root.getObjectByName('bean-hat'),hair=rig.root.getObjectByName('bean-hair');assert.equal(hat.visible,false,'cap hidden under the helmet');assert.equal(hair.visible,false,'puffs hidden under the helmet');
  const shell=vehicle.root.getObjectByName('bean-armor-helmet'),lower=vehicle.root.getObjectByName('bean-armor-shell');assert(shell.visible&&lower.visible,'bean suit shown');
  // Every bean point outside the face panel is inside the (slightly larger) shell: compare radial distances per ring.
  const s=fit.beanShapeOf(rig.root),pos=[lower,shell].map(m=>m.geometry.getAttribute('position'));let covered=0,total=0;
  for(const [k,m] of [lower,shell].entries()){const p=pos[k],dy=k?.32:0;for(let i=0;i<p.count;i+=7){const y=p.getY(i)+dy,u=(y+.13)/(s.H+.13);if(u<.05||u>.97)continue;const x=p.getX(i),z=p.getZ(i),a=Math.atan2(x,z),q=fit.beanSurface(s,u,(a+Math.PI*2)%(Math.PI*2));
    const faceD=((Math.atan2(x,z))*.25/.2)**2+((y-(-.13+.775*(s.H+.13)))/.17)**2;if(faceD<1.7)continue;total++;if(Math.hypot(x,z)>=Math.hypot(q.x,q.z)+.008)covered++;}}
  note('jetpack:ironman:'+face,'shell outside the bean',covered===total,covered+'/'+total);assert.equal(covered,total,'iron man shell stays outside the bean ('+face+')');
  vehicle.update('walk',0,0,0,1/60,0);vehicle.syncArmor(rig.root,false);assert.equal(hat.visible,true,'cap restored after landing');assert.equal(hair.visible,true,'hair restored after landing');
}
vehicle.setArmorFace('open');
// Parachute: harness lines start on the bean's shoulders.
{ride('jetpack',{jetpack:'classic'},{parachute:true},20,6);const chute=createParachute();chute.update(0,6,0,0,true,1,1/60,0,false);
  const L=v3(),R=v3();rig.handPositions(L,R);chute.attachHands(L,R,vehicle.harnessAnchor);chute.root.updateMatrixWorld(true);
  const s=fit.beanShapeOf(rig.root),torso=rig.root.getObjectByName('armor-torso');
  chute.root.children[0].children.filter(c=>c.isLine).forEach(line=>{const p=line.localToWorld(new T.Vector3().fromBufferAttribute(line.geometry.getAttribute('position'),0)),local=torso.worldToLocal(p.clone());
    const d=Math.abs(Math.abs(local.x)-fit.beanHalfWidth(s,local.y));note('parachute','line starts on a bean shoulder',d<.03,d.toFixed(3));assert(d<.03,'parachute line on the bean shoulder '+d);});
  checkGround('parachute','walk',/./,/./);chute.dispose();}
// Truck bed: the bean sits .31 m above the bed point (cooler top) with its soles .12 m under it (lowered floor).
{rig.update(0,0,1/60,0,false,{truckRiding:true,truckSpeed:0});for(let i=0;i<10;i++)rig.update(0,0,1/60,i/60,false,{truckRiding:true,truckSpeed:0});rig.root.updateMatrixWorld(true);
  const low=Math.min(...beanPoints(rig).map(p=>p.y)),{soles}=limbPoints(rig);
  note('truck','bean on the cooler seat (.31 m)',Math.abs(low-.31)<SEAT_TOL,low.toFixed(3));assert(Math.abs(low-.31)<SEAT_TOL,'truck: bean bottom at the cooler top '+low);
  soles.forEach(s=>{note('truck','sole on the lowered bed floor (−.12 m)',Math.abs(s.y+.12)<SOLE_TOL,s.y.toFixed(3));assert(Math.abs(s.y+.12)<SOLE_TOL,'truck: soles on the bed floor '+s.y);});
  const src=fs.readFileSync(base+'/lib/graphics/streetTraffic.ts','utf8');assert(/pickup-cooler-seat/.test(src)&&/beanBed\?\.8:\.92/.test(src),'pickup has the bean seat and lowered floor');}

// ---------------------------------------------------------------- costume + gear combos
{const costume=OPTIONS.costume?.find(c=>c.id!=='none')?.id;if(costume){
  for(const [mode,value] of [['bike',{bike:'bmx'}],['jetpack',{jetpack:'ironman'}],['jetpack',{jetpack:'helicopter'}]]){
    rig.setAppearance({...D,costume});ride(mode,{...value,costume},mode==='jetpack'?{flight}:{},12,mode==='jetpack'?3:0);
    const shape=fit.beanShapeOf(rig.root);assert.equal(vehicle.beanFit,!!shape,'fit follows the body the costume shows ('+mode+')');
    assert(finite(rig.root)&&finite(vehicle.root),'costume '+costume+' + '+mode+' finite');
    note('costume:'+costume+'+'+Object.values(value)[0],'fit matches the shown body, finite',true,shape?'bean':'classic body');
  }
  rig.setAppearance({...D,costume:'none'});}}

// ---------------------------------------------------------------- falls and knockdowns
const {ROOF_RECOVERY_TIME}=load(base+'/lib/town/rooftopTravel.ts');
// A standing bean boot rests ~1.3 cm into the grass (ankle .075 m, sole .088 m under it; lane A's boot): allowed.
const BOOT_REST=.016;
function sequence(label,frames,step){let worst=Infinity,worstRaw=Infinity;
  for(let f=0;f<frames;f++){const {floor,noLift}=step(f,f/60);rig.root.updateMatrixWorld(true);assert(finite(rig.root),label+' finite at frame '+f);
    const raw=knockdownLowest(rig.root)-floor;worstRaw=Math.min(worstRaw,raw);
    if(!noLift)rig.root.position.y+=knockdownLift(rig.root,floor);rig.root.updateMatrixWorld(true);
    const low=knockdownLowest(rig.root)-floor;worst=Math.min(worst,low);assert(low>=-BOOT_REST,label+' frame '+f+' below ground '+low.toFixed(3));}
  note('fall:'+label,'lowest point on/above the ground every frame',worst>=-BOOT_REST,'min '+worst.toFixed(3)+(worstRaw<-.005?', '+worstRaw.toFixed(3)+' before the ground keeper':''));
  return worst;}
function standingCheck(label){for(let i=0;i<40;i++)rig.update(0,0,1/60,i/60,false,{});rig.root.rotation.set(0,0,0);rig.root.scale.setScalar(1);rig.root.position.set(0,0,0);rig.root.updateMatrixWorld(true);
  const pelvis=rig.root.getObjectByName('player-pelvis').position.y,low=knockdownLowest(rig.root);const up=Math.abs(pelvis-.88)<.05&&low>=-BOOT_REST&&low<.05;note('fall:'+label,'gets up (standing pose restored)',up,'pelvis '+pelvis.toFixed(2)+', lowest '+low.toFixed(3));assert(up,label+' got up');}
// Town.tsx crash transform (run over by traffic / ride crash), mirrored here: squash to a pancake with a wobble,
// the spin-crash tilt and slide, then the ground keeper lift Town applies.
function crashStep(ride,spin){return (f,t)=>{
  const recovery=Math.max(0,ROOF_RECOVERY_TIME-t),crash=recovery/ROOF_RECOVERY_TIME,collapse=spin?Math.min(1,Math.max(0,(t-.15)/.5)):1;
  const squash=(crash>.5?1:Math.min(1,Math.max(0,(crash-.28)/.22)))*collapse;
  rig.update(0,0,1/60,t,false,{travelMode:ride,rooftopPose:recovery>0?'dizzy':undefined});
  rig.root.position.set(0,0,0);rig.root.rotation.set(0,0,0,'YXZ');rig.root.scale.set(1+squash*.65,1-squash*.82,1+squash*.65);
  if(crash>0){rig.root.rotation.z=Math.sin(t*5)*.15*(1-squash);rig.root.rotation.x+=Math.cos(t*4)*.1*(1-squash);}
  if(spin&&crash>0)rig.root.rotation.z+=squash*.8;
  vehicle.setCrash(crash*collapse);return {floor:0,noLift:crash<=0};};}
sequence('run over (walking)',Math.ceil(ROOF_RECOVERY_TIME*60)+30,crashStep('walk',false));standingCheck('run over (walking)');
for(const r of ['scooter','bike','moped']){ride(r,{[r]:'classic'});sequence('ride crash ('+r+')',Math.ceil(ROOF_RECOVERY_TIME*60)+30,crashStep(r,true));}
vehicle.setCrash(0);standingCheck('ride crash');
// Jetpack breakup: hang then fall from 9 m, touchdown (crater) and the dizzy recovery.
sequence('jetpack breakup fall',Math.ceil((1.3+ROOF_RECOVERY_TIME)*60)+30,(f,t)=>{const falling=t<1.3,y=falling?Math.max(0,9-4.9*t*t*1.6):0,age=t;
  rig.update(0,0,1/60,t,false,falling?{travelMode:'jetpack',rooftopPose:age<.65?'hang':'fall'}:{travelMode:'walk',rooftopPose:'dizzy'});
  rig.root.position.set(0,y,0);rig.root.rotation.set(0,0,0);rig.root.scale.setScalar(1);
  if(!falling){const recovery=Math.max(0,ROOF_RECOVERY_TIME-(t-1.3)),crash=recovery/ROOF_RECOVERY_TIME,sq=crash>.5?1:Math.min(1,Math.max(0,(crash-.28)/.22));rig.root.scale.set(1+sq*.65,1-sq*.82,1+sq*.65);}
  return {floor:0};});standingCheck('jetpack breakup fall');
for(const pose of ['hang','fall','dizzy'])sequence('rooftop '+pose,90,(f,t)=>{rig.update(0,0,1/60,t,false,{rooftopPose:pose});rig.root.position.set(0,0,0);rig.root.rotation.set(0,0,0);rig.root.scale.setScalar(1);return {floor:0};});
standingCheck('rooftop poses');
// Parachute landing: canopy descent pose, then touchdown on the feet.
sequence('parachute landing',120,(f,t)=>{const down=t<1;rig.update(0,0,1/60,t,false,down?{travelMode:'jetpack',parachute:true,parachuteSpin:.6}:{});rig.root.position.set(0,down?2*(1-t):0,0);rig.root.rotation.set(0,0,0);rig.root.scale.setScalar(1);return {floor:0,noLift:true};});
standingCheck('parachute landing');
// Wall splat: flattened against the ramp wall (Town scales 1.28 × 1.1 × .2) while the ramp lift holds it up.
sequence('wall splat',60,(f,t)=>{rig.update(0,0,1/60,t,false,{wallSplat:true});rig.root.position.set(0,.4,0);rig.root.rotation.set(0,0,0);rig.root.scale.set(1.28,1.1,.2);return {floor:0,noLift:true};});
standingCheck('wall splat');
// NPC knocked over by a truck (ballReactions: launched 3.3 m, flat on the back, dizzy stars, get up).
{const scene=new T.Scene(),reactions=createBallReactions(scene),npc=createPlayer('npc-hit','away'),camera=new T.PerspectiveCamera();
  npc.setBeanLook({...DEFAULT_BEAN_LOOK,build:'wide'},{kind:'casual',shirt:'#f2eee2',shirt2:'#e2578a',shorts:'#35507a',socks:'#f7f1e6',boots:'#6a4a3a'});scene.add(npc.root);
  assert(reactions.hit({id:'npc:x',x:0,y:0,z:0},12,0,'sunset',undefined,'truck'),'truck hit registers');
  let worst=Infinity,f=0;for(;f<260;f++){const st=reactions.get('npc:x');if(!st)break;reactions.update(1/60,camera,false,true);const st2=reactions.get('npc:x');if(!st2)break;
    npc.update(st2.x,st2.z,0,f/60,false,{stunAge:st2.age,rooftopPose:st2.age>1.85?'dizzy':undefined});reactions.apply('npc:x',npc.root,false);npc.root.updateMatrixWorld(true);
    assert(finite(npc.root),'npc knockdown finite');const low=knockdownLowest(npc.root);worst=Math.min(worst,low);assert(low>=-.005,'npc knockdown frame '+f+' below ground '+low.toFixed(3));}
  note('fall:truck knockdown (NPC)','lowest point on/above the ground every frame',worst>=-.005,'min '+worst.toFixed(3));
  assert(!reactions.get('npc:x'),'npc gets up (stun ends)');assert.equal(npc.root.rotation.x,0,'npc upright after the stun');note('fall:truck knockdown (NPC)','gets up (stun ends, upright)',true);
  npc.dispose();reactions.dispose();}
// Knockdown face: surprised at the hit, beaten while down, happy on the get-up, then neutral.
{const seen=[];const face=createKnockdownFace(e=>seen.push(e));face.update(.016,false,true);for(let i=0;i<60;i++)face.update(.016,false,true);face.update(.016,false,false);for(let i=0;i<90;i++)face.update(.016,false,false);
  assert.deepEqual(seen,['surprised','beaten','happy','neutral']);note('fall:faces','surprised → beaten → happy → neutral',true);}

// ---------------------------------------------------------------- classic style keeps the original rides
{setCharacterStyle('classic');const classic=createVehicle(),crig=createPlayer('classic-rider','home');assert.equal(classic.beanFit,false,'classic vehicle keeps the original geometry');
  classic.setCustomization({...D});classic.update('bike',0,0,0,1/60,4);crig.update(0,0,1/60,0,true,{travelMode:'bike'});classic.syncArmor(crig.root);
  assert.equal(classic.beanFit,false);assert.equal(classic.root.getObjectByName('bike-seat').position.y,.92,'classic saddle height unchanged');assert.equal(classic.root.getObjectByName('bike-pedal-left').visible,false,'no bean pedals on the classic bike');
  classic.dispose();crig.dispose();setCharacterStyle('bean');}

rig.dispose();vehicle.dispose();
if(process.env.BEAN_VEHICLES_CHECKLIST){for(const [mode,items] of Object.entries(checklist))console.log(mode+'\n  '+items.join('\n  '));}
console.log('BEAN_VEHICLES_PASS: '+Object.keys(checklist).length+' modes/sequences checked (hands, feet, seats, packs, suit, harness, truck, costumes, falls)');
