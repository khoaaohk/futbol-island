/**
 * Toy kinds at play (round 3B, Nov 9 2026; docs/gashapon-design.md "Round 3B"). The viewer (lib/gashapon/toyViewer.ts) makes one
 * runtime per HD toy (lib/gashapon/toyKit.ts `hd`) and calls it every frame AFTER the reaction animator has put the parts back to
 * rest, so everything here is an offset on top of the rest pose and never drifts. Pure three.js, no DOM, no clock of its own.
 *
 *  soft body   every mesh of the toy is deformed on the CPU in model space by a few damped spring MODES: a volume-preserving
 *              squash (driven by the viewer's squeeze pressure, which springs back with an overshoot on let-go), a jelly sway that
 *              grows with height (kicked by spins, taps, rubs and steps), a vertical jiggle, and up to 4 dents at touch points.
 *              Normals follow the squash. When every mode is still, the rest positions are copied back once and it sleeps.
 *  springs     bobble heads, top knots, charms: an angular spring per part (x / z), kicked by bumps, spins and steps.
 *  puzzle      pieces tug, pop free, follow the finger on a camera-facing plane, drop onto the turntable "tray" with a bounce and
 *              slide to their own slot; near their socket a glow ring shows; let go close and they snap in with a click. All back
 *              after taking one off: confetti and a chime. Order rules: `after` (what must be off first).
 *  wind-up     drag the key (or hold) to wind (a ratchet click every eighth of a turn); let go and it walks a figure-eight on the
 *              table, legs and arms swinging, the key unwinding, then creeps home and settles.
 *  spin        a fast flick on the toy spins it about itself; friction slows it, a wobble grows, then it settles.
 *  capsule     the rare comes in a second little capsule: twist the top (drag sideways) past ~110° and it pops, the halves land on
 *              the tray and the toy springs up with sparkles. Tap a half to pack it back.
 *
 *
 * Round 3C (Nov 9 2026; docs/gashapon-design.md "Round 3C"), declared through the kit (lib/gashapon/toyKit.ts `extras`):
 *  working parts  k.hinge / k.lever / k.slider / k.crank / k.wheels: a 1-D joint per part on a physical spring. Drag maps the
 *              finger onto the part's own motion on screen (the tangent of the grab point about the hinge, the slide axis, a circle
 *              round the crank hub, the roll direction); detents tick and hold, end stops click and bounce, a hinge let go near
 *              shut snaps shut with a clack, levers / plungers spring back, cranks and wheels coast (wheels roll home). `drives`
 *              turn other parts by a gear ratio; `fires` pops a part up (a flag, a net bulge) past a point of the travel.
 *  ball chains  k.chain: a verlet chain (≤ 12 links, distance constraints, gravity, damping) of instanced beads. 'hang': the toy
 *              hangs from it under a key ring you grab and swing (the ring springs home on let-go, the toy swings and settles; it
 *              sleeps exactly at rest); 'dangle': a short chain + tag hanging off a part. A rare tinkle.
 *  poses       k.pose: drag or tap an arm / the head to blend (eased) into the next pose that moves it; a Star pose action, a
 *              one-time victory idle, a kid-friendly "ta-da" per pose.
 *  slow foam   soft {slow:true}: the squash holds ~0.2 s after let-go, then rises slowly (≈ 2 s), no overshoot, no wobble.
 *
 * Grab targets (pieces, the key, the capsule, working parts, the chain) use enlarged hit spheres: never under 22 px radius on
 * screen (a 44 px target).
 */
import * as T from 'three';
import type {Axis,ChainSpec,KindSpec,MechSpec,PoseSpec,PuzzlePiece,ToyRig,V3} from './toyKit';

export type KindEvent='squeeze'|'dent'|'pull'|'pop'|'snap'|'drop'|'complete'|'ratchet'|'run'|'stop'|'spin'|'twist'|'reveal'|'close'|'blocked'
 /* round 3C */|'open'|'shut'|'detent'|'push'|'fire'|'roll'|'swing'|'tinkle'|'pose';
export type KindFx='confetti'|'sparkle'|'puff'|'crumb';
export type KindHooks={reduced:boolean;emit:(e:KindEvent,detail?:string)=>void;fx:(k:KindFx,at?:T.Vector3)=>void;startOpen?:boolean;
 /** Speak kind voice refs (a pose's own "ta-da"). */
 say?:(refs:readonly string[])=>void};
export type GrabKind='piece'|'key'|'capsule'|'spin'|'mech'|'chain'|'pose'|null;
/** `project`: a world point to client px (round 3C drags map the finger onto a part's motion on screen). */
export type View={ray:T.Ray;x:number;y:number;camera:T.Camera;wpp:(p:T.Vector3)=>number;project?:(p:T.Vector3)=>{x:number;y:number}};

const v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3(),plane=new T.Plane();
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const easeOut=(t:number)=>1-(1-t)**3;
const easeInOut=(t:number)=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-(-2*t+2)**3/2;};
const axisV=(a:Axis)=>a==='x'?new T.Vector3(1,0,0):a==='y'?new T.Vector3(0,1,0):a==='z'?new T.Vector3(0,0,1):new T.Vector3(a[0],a[1],a[2]).normalize();
const qa=new T.Quaternion(),q2=new T.Quaternion(),m4=new T.Matrix4(),DOWN=new T.Vector3(0,-1,0);

/* ---------------------------------------------------------------- soft body */
type SoftMesh={mesh:T.Mesh;rp:Float32Array;rn:Float32Array;pivot:T.Vector3;part:string;dirty:boolean};
type Dent={p:T.Vector3;n:T.Vector3;d:number;v:number;r:number};
function createSoftBody(rig:ToyRig,soft:number,jelly:boolean,slow=false,bodyH?:number){
 const H=Math.max(.3,bodyH??rig.height),meshes:SoftMesh[]=[];const A=.16+.24*clamp(soft,0,1);
 const pivotOf=(o:T.Object3D)=>{const p=new T.Vector3();let g:T.Object3D|null=o.parent;while(g&&g!==rig.root){p.add(g.position);g=g.parent;}return p;};
 for(const m of rig.meshes){const pos=m.geometry.getAttribute('position') as T.BufferAttribute,nor=m.geometry.getAttribute('normal') as T.BufferAttribute;
  meshes.push({mesh:m,rp:Float32Array.from(pos.array as Float32Array),rn:Float32Array.from(nor.array as Float32Array),pivot:pivotOf(m),part:String(m.userData.part),dirty:false});}
 const k=slow?{sway:110,swayC:24,jig:220,jigC:40,dent:40,dentC:26}:{sway:jelly?70:110,swayC:jelly?2.2:5.5,jig:220,jigC:jelly?5:9,dent:150,dentC:11};
 // Slow-rising foam: the squash follows the finger down at once, holds ~0.2 s after let-go, then rises on a slow curve (no overshoot).
 let wx=0,wxv=0,wz=0,wzv=0,b=0,bv=0,squash=0,foam=0,foamHold=0;const dents:Dent[]=[];let awake=false;
 // The current squash (sy, rad) for `point`: identity at rest.
 let curSy=1,curRad=1;
 return {
  A,
  kick(x:number,z:number){wxv+=x;wzv+=z;awake=true;},
  /** Finger motion during a hold (QA Nov 9 2026): a small capped nudge per move, so dragging off the toy mid-squeeze (one big jump
   *  of hundreds of px) no longer sets a jelly swaying for seconds after the let-go. */
  rub(x:number,z:number){const c=.03,cap=.45;if(Math.abs(wxv)<cap)wxv+=clamp(x,-c,c);if(Math.abs(wzv)<cap)wzv+=clamp(z,-c,c);awake=true;},
  jiggle(v:number){bv+=v;awake=true;},
  dent(p:T.Vector3,n:T.Vector3,depth:number){if(dents.length>=4)dents.shift();dents.push({p:p.clone(),n:n.clone().normalize(),d:0,v:depth*22,r:.11+.06*soft});awake=true;},
  /** pressure: the viewer's squeeze spring (−0.4 … 1). skip: parts not to deform (pieces on the tray, capsule halves). */
  update(dt:number,pressure:number,skip:(part:string)=>boolean){
   wxv+=(-k.sway*wx-k.swayC*wxv)*dt;wx+=wxv*dt;wzv+=(-k.sway*wz-k.swayC*wzv)*dt;wz+=wzv*dt;bv+=(-k.jig*b-k.jigC*bv)*dt;b+=bv*dt;
   for(let i=dents.length-1;i>=0;i--){const d=dents[i];d.v+=(-k.dent*d.d-k.dentC*d.v)*dt;d.d+=d.v*dt;if(Math.abs(d.d)<.0005&&Math.abs(d.v)<.01)dents.splice(i,1);}
   if(slow){if(pressure>=foam-.001){foam=Math.max(0,pressure);foamHold=.2;}else if(foamHold>0)foamHold-=dt;else{foam*=Math.exp(-dt/.34);if(foam<.002)foam=0;}squash=foam;}
   else squash=pressure;
   const still=Math.abs(squash)<.002&&Math.abs(wx)+Math.abs(wz)+Math.abs(b)<.0008&&Math.abs(wxv)+Math.abs(wzv)+Math.abs(bv)<.01&&!dents.length;
   if(still){curSy=curRad=1;if(awake){wx=wz=wxv=wzv=b=bv=0;for(const s of meshes)restore(s);awake=false;}return false;}
   awake=true;
   const sy=1-A*squash+b,rad=1/Math.sqrt(Math.max(.35,sy));
   curSy=sy;curRad=rad;
   for(const s of meshes){if(skip(s.part)){restore(s);continue;}
    const pa=s.mesh.geometry.getAttribute('position') as T.BufferAttribute,na=s.mesh.geometry.getAttribute('normal') as T.BufferAttribute,P=pa.array as Float32Array,N=na.array as Float32Array,{rp,rn,pivot}=s;
    for(let i=0;i<rp.length;i+=3){let x=rp[i]+pivot.x,y=rp[i+1]+pivot.y,z=rp[i+2]+pivot.z;const h=clamp(y/H,0,1.2),bul=1+(rad-1)*(.55+.9*Math.sin(Math.PI*Math.min(1,h)));
     x*=bul;z*=bul;y*=sy;const hh=h*h*H;x+=wx*hh;z+=wz*hh;y-=(wx*wx+wz*wz)*hh*.5;
     for(const d of dents){const dx=x-d.p.x,dy=y-d.p.y,dz=z-d.p.z,w=Math.exp(-(dx*dx+dy*dy+dz*dz)/(d.r*d.r))*d.d;x-=d.n.x*w;y-=d.n.y*w;z-=d.n.z*w;}
     P[i]=x-pivot.x;P[i+1]=y-pivot.y;P[i+2]=z-pivot.z;
     let nx=rn[i]/bul,ny=rn[i+1]/sy,nz=rn[i+2]/bul;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;N[i]=nx;N[i+1]=ny;N[i+2]=nz;}
    pa.needsUpdate=true;na.needsUpdate=true;s.dirty=true;}
   return true;},
  /** QA Nov 9 2026: move a root-local point the way the squash / sway moves the body there (dents left out), so a dangle chain's
   *  anchor rides the squashed body instead of floating where the rest pose had it. */
  point(p:T.Vector3){if(curSy===1&&!wx&&!wz)return p;const h=clamp(p.y/H,0,1.2),bul=1+(curRad-1)*(.55+.9*Math.sin(Math.PI*Math.min(1,h))),hh=h*h*H;
   p.x=p.x*bul+wx*hh;p.z=p.z*bul+wz*hh;p.y=p.y*curSy-(wx*wx+wz*wz)*hh*.5;return p;},
  energy:()=>Math.abs(squash)+Math.abs(wx)+Math.abs(wz)+Math.abs(b)+dents.reduce((n,d)=>n+Math.abs(d.d),0),
  slow,
  rest(){wx=wz=wxv=wzv=b=bv=0;foam=0;foamHold=0;dents.length=0;for(const s of meshes)restore(s);awake=false;},
 };
 function restore(s:SoftMesh){if(!s.dirty)return;const pa=s.mesh.geometry.getAttribute('position') as T.BufferAttribute,na=s.mesh.geometry.getAttribute('normal') as T.BufferAttribute;
  (pa.array as Float32Array).set(s.rp);(na.array as Float32Array).set(s.rn);pa.needsUpdate=true;na.needsUpdate=true;s.dirty=false;}
}

/* ---------------------------------------------------------------- springs */
type Spring={o:T.Object3D;k:number;c:number;amp:number;ax:number;az:number;vx:number;vz:number};

/* ---------------------------------------------------------------- the runtime */
export function createKindRuntime(rig:ToyRig,hooks:KindHooks){
 const b=rig.behaviour,spec:KindSpec|null=b.kind??null,root=rig.root,reduced=hooks.reduced,amp=reduced?.35:1;
 const softSpec=b.soft??(spec&&(spec.kind==='squish'||spec.kind==='jelly')?{jelly:spec.kind==='jelly'}:null);
 const ex=rig.extras??{mechs:[],chains:[],poses:[]},hang=ex.chains.find(c=>c.mode==='hang')??null;
 const soft=softSpec?createSoftBody(rig,softSpec.soft??.6,!!softSpec.jelly,!!softSpec.slow,hang?hang.attach[1]:undefined):null;
 const springs:Spring[]=(b.springs??[]).flatMap(s=>{const o=rig.parts.get(s.part);return o?[{o,k:s.k??70,c:s.c??3.2,amp:s.amp??1,ax:0,az:0,vx:0,vz:0}]:[];});
 if(spec?.kind==='bobble'){const o=rig.parts.get(spec.head);if(o&&!springs.some(s=>s.o===o))springs.push({o,k:55,c:2.6,amp:1.2,ax:0,az:0,vx:0,vz:0});}
 if(spec?.kind==='charm'&&spec.chain){const o=rig.parts.get(spec.chain);if(o)springs.push({o,k:18,c:1.1,amp:1.4,ax:0,az:0,vx:0,vz:0});}
 const kickSprings=(x:number,z:number)=>{for(const s of springs){s.vx+=x*s.amp*amp;s.vz+=z*s.amp*amp;}};
 const partOf=(name:string)=>rig.parts.get(name);
 const isUnder=(name:string,top:string)=>{let o:T.Object3D|null|undefined=partOf(name);while(o&&o!==root){if(o.name===top)return true;o=o.parent;}return false;};
 /** Rest-space (root-local) box of a part and its children. */
 const restBox=(name:string)=>{const o=partOf(name)!,box=new T.Box3();root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert();
  o.traverse(m=>{if((m as T.Mesh).isMesh&&!m.userData.proxy){const g=(m as T.Mesh).geometry;if(!g.boundingBox)g.computeBoundingBox();box.union(g.boundingBox!.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld)));}});return box;};

 /* ---- puzzle */
 type Piece={spec:PuzzlePiece;o:T.Object3D;st:'in'|'tug'|'held'|'out'|'snap'|'home';off:T.Vector3;vel:T.Vector3;center:T.Vector3;r:number;bottom:number;slot:T.Vector3;t:number;from:T.Vector3;spin:number;spinV:number;freed:boolean};
 const pieces:Piece[]=[];let hadApart=false,ring:T.Mesh|null=null;
 if(spec?.kind==='puzzle'){
  const R=Math.max(.32,rig.radius);
  spec.pieces.forEach((p,i)=>{const o=partOf(p.part);if(!o)return;const box=restBox(p.part),c=box.getCenter(new T.Vector3()),sz=box.getSize(new T.Vector3());
   // Tray slots: a fan in front of the toy, alternating left / right and opening wider (seen slightly from above, so every
   // piece is in view and none hides another).
   // the third piece (usually the smallest, the innermost) goes front and centre
   const side=i%2?1:-1,ang=i===2?0:side*(.72+Math.floor(i/2)*.5),rr=R+Math.max(sz.x,sz.z)*.5+(i===2?.2:.12);
   pieces.push({spec:p,o,st:'in',off:new T.Vector3(),vel:new T.Vector3(),center:c,r:Math.max(.08,sz.length()*.5),bottom:box.min.y,slot:new T.Vector3(Math.sin(ang)*rr-c.x,0,Math.cos(ang)*rr*(i===2?.75:.8)-c.z),t:0,from:new T.Vector3(),spin:0,spinV:0,freed:false});});
  ring=new T.Mesh(new T.TorusGeometry(1,.06,10,48),new T.MeshBasicMaterial({color:'#ffd447',transparent:true,opacity:0,depthWrite:false,toneMapped:false}));ring.rotation.x=Math.PI/2;ring.visible=false;ring.renderOrder=4;root.add(ring);}
 const pieceOf=(part:string)=>pieces.find(p=>p.spec.part===part||isUnder(part,p.spec.part))??null;
 const removable=(p:Piece)=>(p.spec.after??[]).every(a=>pieces.find(q=>q.spec.part===a)?.st!=='in');
 /** P can go back in once everything that sits UNDER it (pieces listing P in `after`) is in. */
 const canSnap=(p:Piece)=>pieces.every(q=>!(q.spec.after??[]).includes(p.spec.part)||q.st==='in');
 const SNAP_R=.16,TUG_D=.07;
 const piecesIn=()=>pieces.filter(p=>p.st==='in').length;
 const status=()=>{const left=pieces.filter(p=>p.st!=='in').length;return left?`${left} piece${left>1?'s':''} off`:'All together';};

 /* ---- wind-up */
 let wind=0,windHold=false,keyAngle=0,running=false,theta=0,speed=0,phase=0,lastTick=0,creep=false,settle=0;
 const MAX_WIND=3,PATH_R=.3;
 /* ---- spin */
 let spinW=0,spinA=0,tiltA=0,tiltPhase=0,spinning=false,settleT=0;
 /* ---- capsule */
 type Half={o:T.Object3D;off:T.Vector3;vel:T.Vector3;rot:number;slot:T.Vector3;floor:number;center:T.Vector3};
 let cap:{top:Half;bottom:Half;inner:T.Object3D;state:'closed'|'open'|'closing';twist:number;lastClick:number;pop:number;t:number}|null=null;
 if(spec?.kind==='capsule'){const mk=(name:string,side:number):Half|null=>{const o=partOf(name);if(!o)return null;const box=restBox(name);const c=box.getCenter(new T.Vector3());
   // Round 3C (owner QA): the halves land the right way up and sit flat on the tray (the dome on its rim, the cup on its foot), a
   // little tumble in flight; `floor` lifts the half's lowest point onto the tray.
   return {o,off:new T.Vector3(),vel:new T.Vector3(),rot:0,slot:new T.Vector3(side*(Math.max(.4,rig.radius)+.32)-c.x,0,-.12-c.z),floor:-box.min.y+.002,center:c};};
  const top=mk(spec.top,-1),bottom=mk(spec.bottom,1),inner=partOf(spec.inner);
  if(top&&bottom&&inner)cap={top,bottom,inner,state:hooks.startOpen?'open':'closed',twist:0,lastClick:0,pop:hooks.startOpen?1:0,t:0};
  if(cap&&hooks.startOpen){cap.t=9;for(const h of [cap.top,cap.bottom]){h.off.copy(h.slot);h.off.y=h.floor;h.rot=0;}}}
 const capOpen=()=>!cap||cap.state==='open';

 /* ---- working parts (round 3C): a 1-D joint per declared part */
 type Fire={o:T.Object3D;at:number;lift:T.Vector3|null;scale:number;hidden:boolean;hold:number;f:number;fv:number;t:number;armed:boolean};
 type Mech={spec:MechSpec;o:T.Object3D;axis:T.Vector3;rest:number;q:number;v:number;target:number;held:boolean;auto:{to:number;release:boolean}|null;shutting:boolean;
  fire:Fire|null;drives:{o:T.Object3D;axis:T.Vector3;slide:T.Vector3|null;ratio:number}[];wheels:T.Object3D[];dir:T.Vector3;lastEv:number;turn:number;grabLocal:T.Vector3;lastAng:number|null};
 let clock=0;
 const mechs:Mech[]=ex.mechs.flatMap(m=>{const o=partOf(m.part);if(!o)return [];
  const fo=m.fires?partOf(m.fires.part):null,f=m.fires;
  const fire:Fire|null=fo&&f?{o:fo,at:f.at??.8,lift:f.lift?new T.Vector3(...f.lift):null,scale:f.scale??1,hidden:!!f.hidden,hold:f.hold??1.4,f:0,fv:0,t:0,armed:true}:null;
  if(fire?.hidden)fire.o.visible=false;
  return [{spec:m,o,axis:axisV(m.axis),rest:clamp(0,m.min,m.max),q:clamp(0,m.min,m.max),v:0,target:0,held:false,auto:null,shutting:false,fire,
   drives:m.drives.flatMap(d=>{const p=partOf(d.part);return p?[{o:p,axis:axisV(d.axis??m.axis),slide:d.slide?new T.Vector3(...d.slide):null,ratio:d.ratio}]:[];}),
   wheels:(m.wheels??[]).flatMap(w=>{const p=partOf(w);return p?[p]:[];}),dir:new T.Vector3(...(m.dir??[0,0,1])).normalize(),lastEv:-9,turn:0,grabLocal:new T.Vector3(),lastAng:null}];});
 const mechOf=(part:string)=>mechs.find(m=>isUnder(part,m.spec.part)||m.wheels.some(w=>isUnder(part,w.name)))??null;
 const mechEv=(m:Mech,e:KindEvent,gap=.09)=>{if(clock-m.lastEv<gap)return;m.lastEv=clock;hooks.emit(e,m.spec.label);};
 const mechOpen=(m:Mech)=>m.spec.type==='crank'?false:Math.abs(m.q-m.rest)>(m.spec.max-m.spec.min)*.3;
 function mechRelease(m:Mech){m.held=false;m.lastAng=null;const s=m.spec;if(s.type==='hinge'&&s.release==='stay'&&Math.abs(m.q-m.rest)<s.shut)m.shutting=true;}
 /** Finger motion (px) → joint travel: along the part's own motion on screen. */
 function mechDrag(m:Mech,view:View,dx:number,dy:number){const s=m.spec,pr=view.project;if(!pr)return;root.updateMatrixWorld(true);
  const sDir=(a:T.Vector3,b:T.Vector3,eps:number)=>{const p0=pr(a),p1=pr(b);return {x:(p1.x-p0.x)/eps,y:(p1.y-p0.y)/eps};};
  const along=(sv:{x:number;y:number},min:number)=>(dx*sv.x+dy*sv.y)/Math.max(sv.x*sv.x+sv.y*sv.y,min*min);
  if(s.type==='crank'){const P=m.o.getWorldPosition(v1),c=pr(P),ang=Math.atan2(view.y-c.y,view.x-c.x),r=Math.hypot(view.x-c.x,view.y-c.y);
   if(r>14&&m.lastAng!==null){let d=ang-m.lastAng;d=Math.atan2(Math.sin(d),Math.cos(d));const aW=v2.copy(m.axis).transformDirection(m.o.matrixWorld),toCam=v3.copy(view.camera.position).sub(P);
    m.target+=aW.dot(toCam)>0?-d:d;}m.lastAng=r>14?ang:null;return;}
  if(s.type==='slider'||s.type==='wheels'){const base=s.type==='wheels'?root.getWorldPosition(v1):m.o.getWorldPosition(v1),dW=v2.copy(s.type==='wheels'?m.dir:m.axis).transformDirection((s.type==='wheels'?root.parent:m.o.parent)?.matrixWorld??root.matrixWorld);
   m.target=clamp(m.target+along(sDir(base,v3.copy(base).addScaledVector(dW,.1),.1),s.type==='wheels'?120:160),s.min-.02,s.max+.02);return;}
  // Hinge / lever: the grab point's direction of travel on screen, taken at the REST pose (so "up opens a lid" holds all the way: past
  // 90° the tip moves in depth and a live tangent would flip). Px per radian = the lever arm on screen.
  const P=m.o.getWorldPosition(v1).clone(),aW=v3.copy(m.axis).transformDirection(m.o.matrixWorld).clone(),G=m.o.localToWorld(v2.copy(m.grabLocal)).sub(P).applyAxisAngle(aW,-(m.q-m.rest)).add(P),t=aW.clone().cross(G.clone().sub(P));
  // QA Nov 9 2026: a part whose tip moves straight at / away from the camera (Golden Boot Gus's heel loop seen from the front) has
  // almost no travel on screen, so no drag could pull it: then a drag up works it.
  let sv=sDir(G,G.clone().addScaledVector(t,.05),.05);if(Math.hypot(sv.x,sv.y)<30)sv={x:0,y:-70};
  m.target=clamp(m.target+along(sv,70),s.min-.14,s.max+.14);}
 function mechUpdate(m:Mech,dt:number){const s=m.spec,goal=m.held?m.target:m.auto?m.auto.to:null;let moving=m.held||!!m.auto;
  if(goal!==null)m.v+=(420*(goal-m.q)-38*m.v)*dt;
  else if(m.shutting)m.v+=(-320*(m.q-m.rest)-9*m.v)*dt;
  else if(s.release==='return')m.v+=(-230*(m.q-m.rest)-24*m.v)*dt;
  else if(s.type==='wheels')m.v+=(-9*m.q-2.6*m.v)*dt;// it rolls out, slows, rolls home
  else if(s.release==='stay'){m.v*=Math.exp(-dt*9);let d:number|null=null;for(const x of s.detents)if(d===null||Math.abs(x-m.q)<Math.abs(d-m.q))d=x;if(d!==null&&Math.abs(d-m.q)<.3)m.v+=140*(d-m.q)*dt;}
  else m.v*=Math.exp(-dt*1.4);// a crank coasts like a little flywheel
  const before=m.q;m.q+=m.v*dt;
  const hard=Math.min(.5,(s.max-s.min)*3);// a "hit": travel units per second (a 3.5 cm plunger is not a 1.9 rad lid)
  for(const [lim,low] of [[s.min,true],[s.max,false]] as const)if(low?m.q<lim:m.q>lim){m.q=lim;const sp=Math.abs(m.v);
   if(sp>hard)mechEv(m,s.type==='wheels'?'drop':lim===m.rest?(s.type==='slider'?'push':'shut'):s.type==='slider'?'push':'open');m.v=sp>hard?-m.v*.22:0;}
  for(const d of s.detents)if(d!==m.rest&&(before-d)*(m.q-d)<0)mechEv(m,'detent',.05);
  // An action's drive is done when it arrives (at the end stop, when it aimed past it).
  if(m.auto){const g=clamp(m.auto.to,s.min,s.max);if(g!==m.auto.to?m.q===g:Math.abs(g-m.q)<Math.min(.01,(s.max-s.min)*.05)&&Math.abs(m.v)<.6){const rel=m.auto.release;m.auto=null;if(rel)mechRelease(m);}}
  if(s.type==='crank'){const turn=Math.floor(m.q/(Math.PI/4));if(turn!==m.turn){m.turn=turn;hooks.emit('ratchet');}}
  if(s.type==='wheels'&&Math.abs(m.v)>.6&&Math.abs(before)<.02&&Math.abs(m.q)>=.02)mechEv(m,'roll',.6);
  if(m.fire){const F=m.fire,at=s.min+(s.max-s.min)*F.at;
   if(F.armed&&m.q>=at){F.armed=false;F.t=F.hold;mechEv(m,'fire',0);hooks.fx('sparkle',F.o.getWorldPosition(new T.Vector3()));kickSprings(1,.5);}
   if(!F.armed&&F.t<=0&&m.q<at-(s.max-s.min)*.2)F.armed=true;
   if(F.t>0)F.t-=dt;const g=F.t>0?1:0;F.fv+=(260*(g-F.f)-(g?11:22)*F.fv)*dt;F.f+=F.fv*dt;if(!g&&F.f<.002&&Math.abs(F.fv)<.02){F.f=0;F.fv=0;}else moving=true;}
  const still=!m.held&&!m.auto&&Math.abs(m.v)<.006;
  if(still){const homeward=m.shutting||s.release==='return'||s.type==='wheels';if(homeward){if(Math.abs(m.q-m.rest)<.0015){m.q=m.rest;m.v=0;m.shutting=false;}else moving=true;}else m.v=0;}else moving=true;
  // Apply on top of the rest pose.
  const q=m.q;
  if(s.type==='slider')m.o.position.addScaledVector(m.axis,q);
  else if(s.type==='wheels'){root.position.addScaledVector(m.dir,q);for(const w of m.wheels)w.quaternion.multiply(qa.setFromAxisAngle(m.axis,q/Math.max(.02,s.radius??.1)));}
  else m.o.quaternion.multiply(qa.setFromAxisAngle(m.axis,q));
  for(const d of m.drives){if(d.slide)d.o.position.addScaledVector(d.slide,q*d.ratio);else d.o.quaternion.multiply(qa.setFromAxisAngle(d.axis,q*d.ratio));}
  if(m.fire){const F=m.fire,f=F.f;if(F.lift)F.o.position.addScaledVector(F.lift,f);if(F.scale!==1)F.o.scale.multiplyScalar(Math.max(.01,1+(F.scale-1)*f));
   if(F.hidden){F.o.visible=f>.01;F.o.scale.multiplyScalar(Math.max(.001,f));}}
  return moving;}
 /** M / a button: work the part the way a child would (open / close a lid, pull a lever, press, crank a turn, push the wheels). */
 function mechWork(m:Mech):string{const s=m.spec,L=cap1(s.label);m.shutting=false;
  // Aim a little past the end stop, so it arrives with a click like a real flick.
  const past=s.max+(s.max-s.min)*.25;
  const pl=/[^s]s$/.test(s.label);// "Wing cases open.", "Pedals turn." (QA Nov 9 2026)
  if(s.type==='hinge'){if(mechOpen(m)){m.auto={to:m.rest,release:true};m.shutting=true;return `${L} ${pl?'close':'closes'}.`;}m.auto={to:past,release:true};return `${L} ${pl?'open':'opens'}.`;}
  if(s.type==='lever'||s.type==='slider'){m.auto={to:past,release:true};return s.type==='lever'?`${L} pulled.`:`${L} pushed.`;}
  if(s.type==='crank'){m.v+=Math.PI*2*1.4;return `${L} ${pl?'turn':'turns'}.`;}
  m.v=2.2;mechEv(m,'roll',0);return 'It rolls away, then rolls back.';}
 let workIdx=0;

 /* ---- ball chains (round 3C): a verlet pendulum (120 Hz steps) whose rod is the chain; the beads (≤ 12 links, 2 beads per link)
  * are laid along it with a sag that follows the swing. A heavy keychain toy keeps its chain taut, so the toy itself swings as a
  * pendulum on it (first tried: a full N-link verlet chain; the light links whipped and curled round the heavy toy). */
 type Chain={spec:ChainSpec;n:number;p:T.Vector3[];o:T.Vector3[];rest:T.Vector3[];len:number;bodyD:number;anchor:T.Vector3;anchorV:T.Vector3;home:T.Vector3;
  held:boolean;want:T.Vector3;sleep:boolean;vmax?:number;off?:number;sag:T.Vector3;beads:T.InstancedMesh;acc:number;lastTinkle:number;fast:boolean;tag:T.Object3D|null;from:T.Object3D|null;fromLocal:T.Vector3;ring:T.Object3D|null};
 const rootRest=root.position.clone(),rootRestQ=root.quaternion.clone();
 const space=()=>root.parent??root;
 const chains:Chain[]=ex.chains.map(c=>{const n=c.links+1,A=new T.Vector3(...c.attach),hangs=c.mode==='hang';
  const from=hangs?null:partOf(c.from)??null,pv=rig.pivots.get(c.from)??[0,0,0] as V3,fromLocal=A.clone().sub(new T.Vector3(...pv));
  const bodyD=hangs?A.y*.5:0,anchor=hangs?rootRest.clone().add(A).add(new T.Vector3(0,c.length,0)):rootRest.clone().add(A);
  // p[0] the anchor (the ring / the point on the part), p[1] the weight: the toy's centre (hang) or the tag (dangle).
  const rest=[anchor.clone(),anchor.clone().add(new T.Vector3(0,-(c.length+bodyD),0))];
  const br=Math.min(.02,c.length/(n-1)*.32),geo=c.bead==='ring'?new T.TorusGeometry(br*1.2,br*.32,6,12):new T.SphereGeometry(br,10,8);
  const mat=new T.MeshPhysicalMaterial({color:c.color,metalness:.85,roughness:.3,clearcoat:.4,name:'toy-chain'});
  const beads=new T.InstancedMesh(geo,mat,2*(n-1));beads.castShadow=true;beads.frustumCulled=false;beads.name='chain-beads';beads.userData.chain=true;root.add(beads);
  return {spec:c,n,p:rest.map(v=>v.clone()),o:rest.map(v=>v.clone()),rest,len:c.length+bodyD,bodyD,anchor:anchor.clone(),anchorV:new T.Vector3(),home:anchor.clone(),held:false,want:new T.Vector3(),
   sleep:false,sag:new T.Vector3(),beads,acc:0,lastTinkle:-9,fast:false,tag:c.tag?partOf(c.tag)??null:null,from,fromLocal,ring:hangs?partOf('ring')??null:null};});
 const hangChain=chains.find(c=>c.spec.mode==='hang')??null;
 function chainStep(c:Chain,h:number){const g=-9.8*h*h,damp=reduced?.975:.9935,cap=2.4*h,p=c.p[1],o=c.o[1];
  let vx=(p.x-o.x)*damp,vy=(p.y-o.y)*damp,vz=(p.z-o.z)*damp;const sp=Math.hypot(vx,vy,vz);if(sp>cap){const k=cap/sp;vx*=k;vy*=k;vz*=k;}o.copy(p);p.x+=vx;p.y+=vy+g;p.z+=vz;
  c.p[0].copy(c.anchor);c.o[0].copy(c.anchor);const d=v1.copy(p).sub(c.anchor),l=d.length()||1e-6;p.copy(c.anchor).addScaledVector(d,c.len/l);// the taut chain
  // The sag: the beads lag the weight's sideways speed a little (a soft curve while it swings, straight at rest).
  c.sag.lerp(v2.set(-vx/h,0,-vz/h).multiplyScalar(.03),.15);}
 function chainUpdate(c:Chain,dt:number,yawAcc:number):boolean{
  if(c.from){root.updateMatrixWorld(true);c.from.localToWorld(v2.copy(c.fromLocal));
   // The anchor follows the squashed body (QA Nov 9 2026: Firefly's chain stayed put while its body squashed under it).
   if(soft){root.worldToLocal(v2);soft.point(v2);root.localToWorld(v2);}
   c.anchor.copy(space().worldToLocal(v2));if(c.anchor.distanceToSquared(c.p[0])>1e-9)c.sleep=false;}
  else if(c.held){c.anchor.lerp(c.want,Math.min(1,dt*9));c.anchorV.set(0,0,0);c.sleep=false;}
  else if(c.anchor.distanceToSquared(c.home)>1e-10||c.anchorV.lengthSq()>1e-8){c.anchorV.addScaledVector(v1.copy(c.anchor).sub(c.home),-120*dt).multiplyScalar(Math.exp(-dt*18));c.anchor.addScaledVector(c.anchorV,dt);c.sleep=false;}
  else c.anchor.copy(c.home);
  if(Math.abs(yawAcc)>.5){const side=v1.set(1,0,0).applyQuaternion(space().getWorldQuaternion(q2).invert()),dv=clamp(-yawAcc*.0016,-.5,.5)/120;c.o[1].addScaledVector(side,dv);c.sleep=false;}
  if(c.sleep)return false;
  c.acc=Math.min(c.acc+dt,.05);while(c.acc>=1/120){c.acc-=1/120;chainStep(c,1/120);}
  const vmax=c.p[1].distanceTo(c.o[1])*120,off=c.p[1].distanceTo(c.rest[1]);c.vmax=vmax;c.off=off;
  // A rare tinkle when it swings hard (≤ 1 per 1.5 s, about a third of the big swings).
  if(vmax>1.1&&!c.fast){c.fast=true;if(clock-c.lastTinkle>1.5&&Math.random()<.35){c.lastTinkle=clock;hooks.emit('tinkle');}}else if(vmax<.5)c.fast=false;
  if(!c.held&&!c.from&&vmax<.004&&off<.004&&c.anchor.distanceTo(c.home)<1e-4){for(let i=0;i<2;i++){c.p[i].copy(c.rest[i]);c.o[i].copy(c.rest[i]);}c.sag.set(0,0,0);c.anchor.copy(c.home);c.anchorV.set(0,0,0);c.sleep=true;}
  else if(c.from&&vmax<.003){c.o[1].copy(c.p[1]);c.sag.set(0,0,0);c.sleep=true;}// a dangle sleeps where it hangs (its anchor may have moved)
  return !c.sleep;}
 /** Pose the toy on its chain (hang), the tag on its chain (dangle), and lay the beads (root-local, so they follow the toy's frame). */
 function chainApply(c:Chain){const a=c.p[0],dir=v3.copy(c.p[1]).sub(a).normalize(),end=a.clone().addScaledVector(dir,c.spec.length);
  if(c.spec.mode==='hang'&&!c.sleep){const A=new T.Vector3(...c.spec.attach),delta=root.position.clone().sub(rootRest);qa.setFromUnitVectors(DOWN,dir);
   root.quaternion.premultiply(qa);root.position.copy(end).sub(A.applyQuaternion(root.quaternion)).add(delta);}
  root.updateMatrix();root.updateMatrixWorld(true);m4.copy(root.matrix).invert();
  if(c.ring&&!c.sleep){c.ring.position.copy(a).add(v1.set(0,.06,0)).applyMatrix4(m4);c.ring.quaternion.copy(root.quaternion).invert().multiply(rootRestQ);}
  if(c.tag&&c.tag.parent){const pw=space().localToWorld(end.clone());c.tag.position.copy(c.tag.parent.worldToLocal(pw));
   const dw=space().localToWorld(v1.copy(a).add(dir)).sub(space().localToWorld(v2.copy(a))).normalize().applyQuaternion(c.tag.parent.getWorldQuaternion(q2).invert());
   if(dw.lengthSq()>.5)c.tag.quaternion.premultiply(qa.setFromUnitVectors(DOWN,dw));}
  const mm=new T.Matrix4(),pos=new T.Vector3(),qq=new T.Quaternion(),one=new T.Vector3(1,1,1),N=2*(c.n-1),qInv=q2.copy(root.quaternion).invert().clone();
  for(let k=0;k<N;k++){const t=(k+.5)/N,bow=Math.sin(Math.PI*t);pos.copy(a).addScaledVector(dir,c.spec.length*t).addScaledVector(c.sag,bow);
   qq.setFromUnitVectors(DOWN,dir);if(c.spec.bead==='ring'&&k%2)qq.multiply(qa.setFromAxisAngle(DOWN,Math.PI/2));qq.premultiply(qInv);mm.compose(pos.applyMatrix4(m4),qq,one);c.beads.setMatrixAt(k,mm);}
  c.beads.instanceMatrix.needsUpdate=true;}
 for(const c of chains)chainApply(c);// the beads at rest

 /* ---- poses (round 3C) */
 type PoseOff=Record<string,{rot?:V3;at?:V3}>;
 const restPose:PoseSpec=ex.poses.find(p=>p.name==='rest')??{name:'rest',label:'Rest',parts:{},voice:null,grab:[]};
 const poseList:PoseSpec[]=ex.poses.length?[restPose,...ex.poses.filter(p=>p!==restPose)]:[];
 let poseCur=restPose,poseFrom:PoseOff={},poseTo:PoseSpec=restPose,poseT=1,poseDur=.36,poseDrag:{to:PoseSpec;back:PoseSpec;moved:number}|null=null,poseIdle=0,victoryDone=false,victoryHold=0,justPosed=false;
 const poseNow=():PoseOff=>{const w=easeInOut(poseT),out:PoseOff={};for(const k of new Set([...Object.keys(poseFrom),...Object.keys(poseTo.parts)])){const a=poseFrom[k],b=poseTo.parts[k];
  const L=(x?:V3,y?:V3)=>x||y?[0,1,2].map(i=>(x?.[i]??0)*(1-w)+(y?.[i]??0)*w) as unknown as V3:undefined;out[k]={rot:L(a?.rot,b?.rot),at:L(a?.at,b?.at)};}return out;};
 function goPose(p:PoseSpec,dur=.36,from?:PoseOff){poseFrom=from??poseNow();poseTo=p;poseT=0;poseDur=reduced?.2:dur;}
 const nextPoseFor=(part:string|null)=>{if(!poseList.length)return null;const idx=poseList.indexOf(poseCur);
  for(let j=1;j<=poseList.length;j++){const p=poseList[(idx+j)%poseList.length];if(p===poseCur)continue;if(part===null||p.grab.some(g=>isUnder(part,g))||(p===restPose&&poseCur.grab.some(g=>isUnder(part,g))))return p;}return null;};
 const posePart=(part:string)=>poseList.some(p=>p.grab.some(g=>isUnder(part,g)));
 function poseArrive(){const p=poseTo;poseCur=p;poseIdle=0;const i=poseList.indexOf(p);hooks.emit('pose',p.label);
  hooks.say?.(p.voice?[p.voice]:[`k_pose:${p===restPose?.85:[1,1.12,1.26,1.5][(i-1+4)%4]}`]);if(p.name==='star'||p.name==='victory')hooks.fx('sparkle');kickSprings(.8,.3);soft?.jiggle(.15);
  if(p.name==='victory'&&victoryHold<0)victoryHold=.9;}
 function poseUpdate(dt:number):boolean{if(!poseList.length)return false;let moving=false;
  if(!poseDrag&&poseT<1){poseT=Math.min(1,poseT+dt/poseDur);if(poseT>=1)poseArrive();moving=true;}
  if(poseDrag)moving=true;
  if(victoryHold>0){victoryHold-=dt;if(victoryHold<=0){victoryHold=0;goPose(restPose,.5);}moving=true;}
  poseIdle+=dt;const vic=poseList.find(p=>p.name==='victory');
  if(!capOpen())poseIdle=0;// QA Nov 9 2026: Torii Tomo cheered inside the shut capsule (loop awake, the cheer used up unseen)
  if(vic&&!victoryDone&&!reduced&&poseCur===restPose&&poseT>=1&&!poseDrag&&poseIdle>3.2){victoryDone=true;victoryHold=-1;goPose(vic,.42);moving=true;}
  const off=poseNow();for(const [k,o] of Object.entries(off)){const part=partOf(k);if(!part)continue;if(o.rot){part.rotation.x+=o.rot[0];part.rotation.y+=o.rot[1];part.rotation.z+=o.rot[2];}if(o.at){part.position.x+=o.at[0];part.position.y+=o.at[1];part.position.z+=o.at[2];}}
  return moving;}

 /* ---- grabbing */
 let grab:{kind:GrabKind;piece?:Piece;mech?:Mech;chain?:Chain;offset:T.Vector3;lastX:number;lastY:number;moved:number;normal:T.Vector3;q0?:number}|null=null;
 /** Grab targets with their world centre and radius (pieces, the key, the capsule). */
 function targets(withPoses=false):{kind:GrabKind;part:string;c:T.Vector3;r:number}[]{
  const out:{kind:GrabKind;part:string;c:T.Vector3;r:number}[]=[];root.updateMatrixWorld(true);
  for(const p of pieces){if(p.st!=='in'&&p.st!=='out')continue;if(p.st==='in'&&!removable(p))continue;out.push({kind:'piece',part:p.spec.part,c:root.localToWorld(v1.copy(p.center).add(p.off)).clone(),r:p.r*.8});}
  if(spec?.kind==='windup'){const o=partOf(spec.key);if(o){const box=restBox(spec.key);out.push({kind:'key',part:spec.key,c:root.localToWorld(box.getCenter(v1)).clone(),r:Math.max(.08,box.getSize(v2).length()*.5)});}}
  if(cap&&cap.state==='closed'){const box=restBox(cap.top.o.name).union(restBox(cap.bottom.o.name));out.push({kind:'capsule',part:'capsule',c:root.localToWorld(box.getCenter(v1)).clone(),r:box.getSize(v2).length()*.5});}
  for(const m of mechs)for(const name of m.spec.type==='wheels'?m.wheels.map(w=>w.name):[m.spec.part]){const box=restBox(name);if(box.isEmpty())continue;out.push({kind:'mech',part:name,c:root.localToWorld(box.getCenter(v1)).clone(),r:Math.max(.06,box.getSize(v2).length()*.42)});}
  if(hangChain){const sp=space(),hc=hangChain,dir=v3.copy(hc.p[1]).sub(hc.p[0]).normalize().clone();for(let i=0;i<=4;i++)out.push({kind:'chain',part:'chain',c:sp.localToWorld(hc.p[0].clone().addScaledVector(dir,hc.spec.length*i/4)),r:.05});
   if(hangChain.ring)out.push({kind:'chain',part:'ring',c:hangChain.ring.getWorldPosition(new T.Vector3()),r:.1});}
  // Posable parts (arms, head) only when the touch missed the toy's surface, so a squeeze on the body stays a squeeze.
  if(withPoses)for(const name of new Set(poseList.flatMap(p=>p.grab))){if(!partOf(name))continue;const box=restBox(name);if(box.isEmpty())continue;out.push({kind:'pose',part:name,c:root.localToWorld(box.getCenter(v1)).clone(),r:Math.max(.05,box.getSize(v2).length()*.4)});}
  return out;}
 /** The nearest grab target the ray passes through (its radius at least 22 screen px). */
 function pickTarget(view:View,meshPart:string|null){
  if(meshPart){const p=pieceOf(meshPart);if(p&&(p.st==='out'||(p.st==='in'&&removable(p))))return {kind:'piece' as GrabKind,piece:p};
   if(spec?.kind==='windup'&&isUnder(meshPart,spec.key))return {kind:'key' as GrabKind};
   if(cap&&cap.state==='closed'&&(isUnder(meshPart,cap.top.o.name)||isUnder(meshPart,cap.bottom.o.name)))return {kind:'capsule' as GrabKind};
   if(hangChain&&isUnder(meshPart,'ring'))return {kind:'chain' as GrabKind};
   const m=mechOf(meshPart);if(m)return {kind:'mech' as GrabKind,mech:m};
   if(posePart(meshPart))return {kind:'pose' as GrabKind,part:meshPart};}
  let best:{kind:GrabKind;part:string;d:number}|null=null;
  for(const t of targets(!meshPart)){const r=meshPart&&t.kind==='mech'?t.r:Math.max(t.r,22*view.wpp(t.c));/* a flat toy (Dorayaki Doug) would otherwise be all lid: a direct hit on another part squeezes it (Nov 9) */const d=view.ray.distanceSqToPoint(t.c);if(d<=r*r&&(!best||d<best.d))best={kind:t.kind,part:t.part,d};}
  if(!best)return null;const bp=best.part;return {kind:best.kind,piece:best.kind==='piece'?pieces.find(p=>p.spec.part===bp):undefined,mech:best.kind==='mech'?mechOf(bp)??undefined:undefined,part:best.kind==='pose'?bp:undefined};}

 function planeHit(view:View,through:T.Vector3,normal:T.Vector3,out:T.Vector3){plane.setFromNormalAndCoplanarPoint(normal,through);return view.ray.intersectPlane(plane,out);}

 const api={
  spec,soft,
  /** Hold on the toy: the wind-up kind winds instead of squeezing. */
  holdWinds:()=>spec?.kind==='windup'&&!running,
  /** True when a hold should squeeze the soft body (the capsule must be open first). */
  squeezable:()=>!!soft&&capOpen(),
  /** Pointer down: start a grab if it is on a piece / key / capsule (returns its kind), else null (the viewer turns the table). */
  down(view:View,meshPart:string|null,hit?:T.Vector3):GrabKind{
   const t=pickTarget(view,meshPart) as {kind:GrabKind;piece?:Piece;mech?:Mech;part?:string}|null;if(!t)return null;
   const cam=v3.set(0,0,-1).applyQuaternion(view.camera.quaternion).negate().clone();
   if(t.kind==='mech'&&t.mech){const m=t.mech;root.updateMatrixWorld(true);const g=hit?hit.clone():restBox(m.spec.part).getCenter(new T.Vector3()).applyMatrix4(root.matrixWorld);
    // A grab right on the hinge line has no lever arm: use the far side of the part instead.
    if(g.distanceTo(m.o.getWorldPosition(v1))<.06){const box=restBox(m.spec.part);box.getCenter(g).applyMatrix4(root.matrixWorld);
     // Still on the pivot (a dial / flower turning about its own centre, e.g. Flip-flop Flo): grab a virtual rim point whose motion
     // on screen is "up", so a drag up turns it (Nov 9).
     if(m.spec.type!=='slider'&&m.spec.type!=='wheels'&&g.distanceTo(v1)<.06){const P=v1.clone(),aW=v2.copy(m.axis).transformDirection(m.o.matrixWorld).normalize().clone();
      const perp=(d:T.Vector3)=>d.clone().addScaledVector(aW,-aW.dot(d)),up=perp(new T.Vector3(0,1,0).applyQuaternion(view.camera.quaternion)),t=up.length()>.3?up:perp(new T.Vector3(1,0,0).applyQuaternion(view.camera.quaternion));
      g.copy(P).addScaledVector(t.normalize().cross(aW),Math.max(.06,box.getSize(v3).length()*.35*root.scale.x));}}
    m.grabLocal.copy(m.o.worldToLocal(g.clone()));m.held=true;m.auto=null;m.shutting=false;m.target=m.q;m.lastAng=null;
    grab={kind:'mech',mech:m,offset:new T.Vector3(),lastX:view.x,lastY:view.y,moved:0,normal:cam,q0:m.q};return 'mech';}
   if(t.kind==='chain'&&hangChain){const c=hangChain,aw=space().localToWorld(c.anchor.clone()),h=planeHit(view,aw,cam,v2)??aw.clone();c.held=true;c.sleep=false;c.want.copy(c.anchor);
    grab={kind:'chain',chain:c,offset:h.clone().sub(aw),lastX:view.x,lastY:view.y,moved:0,normal:cam};return 'chain';}
   if(t.kind==='pose'&&t.part){const to=nextPoseFor(t.part);if(!to)return null;poseDrag={to,back:poseCur,moved:0};poseFrom=poseNow();poseTo=to;poseT=0;
    grab={kind:'pose',offset:new T.Vector3(),lastX:view.x,lastY:view.y,moved:0,normal:cam};return 'pose';}
   if(t.kind==='piece'&&t.piece){const p=t.piece;const c=root.localToWorld(v1.copy(p.center).add(p.off)).clone(),hit=planeHit(view,c,cam,v2)??c.clone();
    grab={kind:'piece',piece:p,offset:hit.clone().sub(c),lastX:view.x,lastY:view.y,moved:0,normal:cam};p.st=p.st==='in'?'tug':'held';p.vel.set(0,0,0);if(p.st==='held')hooks.emit('pull',p.spec.name);return 'piece';}
   grab={kind:t.kind,offset:new T.Vector3(),lastX:view.x,lastY:view.y,moved:0,normal:cam};
   if(t.kind==='capsule')hooks.emit('twist');
   return t.kind;},
  move(view:View){if(!grab)return;const dx=view.x-grab.lastX,dy=view.y-grab.lastY;grab.lastX=view.x;grab.lastY=view.y;grab.moved+=Math.hypot(dx,dy);
   if(grab.kind==='piece'&&grab.piece){const p=grab.piece,c=root.localToWorld(v1.copy(p.center).add(p.off)).clone(),hit=planeHit(view,c,grab.normal,v2);if(!hit)return;
    const want=root.worldToLocal(hit.sub(grab.offset)).sub(p.center);want.y=Math.max(want.y,-p.bottom+.005);
    if(p.st==='tug'){const d=want.length();if(d>TUG_D*2.2){p.st='held';p.freed=true;hadApart=true;hooks.emit('pop',p.spec.name);hooks.fx('crumb',root.localToWorld(p.center.clone()));kickSprings(.6,0);soft?.kick((Math.random()-.5)*.6,.4);}
     else{p.off.copy(want).multiplyScalar(.32);return;}}
    p.vel.copy(want).sub(p.off).multiplyScalar(30);p.off.lerp(want,.6);return;}
   if(grab.kind==='key'){const turns=Math.hypot(dx,dy)/240;addWind(turns);return;}
   if(grab.kind==='mech'&&grab.mech){mechDrag(grab.mech,view,dx,dy);return;}
   if(grab.kind==='chain'&&grab.chain){const c=grab.chain,aw=space().localToWorld(c.anchor.clone()),h=planeHit(view,aw,grab.normal,v2);if(!h)return;
    const w=space().worldToLocal(h.sub(grab.offset));const d=w.clone().sub(c.home);d.y=Math.max(d.y,-.08);if(d.length()>.42)d.setLength(.42);c.want.copy(c.home).add(d);return;}// a hand's swing, not a throw: the chain stays taut
   if(grab.kind==='pose'&&poseDrag){poseDrag.moved+=Math.hypot(dx,dy);poseT=clamp(poseDrag.moved/120,0,1);return;}
   if(grab.kind==='capsule'&&cap){cap.twist+=dx*.012;if(Math.abs(cap.twist-cap.lastClick)>.35){cap.lastClick=cap.twist;hooks.emit('ratchet');}if(Math.abs(cap.twist)>1.9)openCapsule();}},
  up(){if(!grab)return false;const g=grab;grab=null;
   if(g.kind==='piece'&&g.piece){const p=g.piece;
    if(p.st==='tug'){p.st='snap';p.t=0;p.from.copy(p.off);return true;}// never pulled free: it springs back in, no click
    const d=p.off.length();
    if(d<SNAP_R*(p.freed?1.4:1)&&canSnap(p)){p.st='snap';p.t=0;p.from.copy(p.off);return true;}
    if(d<SNAP_R*1.6&&!canSnap(p))hooks.emit('blocked',p.spec.name);
    p.st='out';p.freed=true;hadApart=true;p.spinV=(Math.random()-.5)*4;return true;}
   if(g.kind==='key'){if(wind>.05)startRun();return true;}
   if(g.kind==='mech'&&g.mech){mechRelease(g.mech);if(g.moved<=9&&g.mech.spec.type!=='crank'){mechWork(g.mech);justPosed=true;}return true;}
   if(g.kind==='chain'&&g.chain){g.chain.held=false;hooks.emit('swing');if(g.moved<=9){g.chain.o[1].add(v1.set(-1.2,0,0).multiplyScalar(1/120));g.chain.sleep=false;}justPosed=g.moved<=9;return true;}
   if(g.kind==='pose'&&poseDrag){const d=poseDrag;poseDrag=null;justPosed=g.moved<=9;
    if(g.moved<=9||poseT>.4)poseDur=reduced?.2:.36;// carry on into the pose
    else{const from=poseNow();goPose(d.back,.28,from);}return true;}
   if(g.kind==='capsule'&&cap&&cap.state==='closed'){cap.twist*=.0;}// not far enough: it twists back
   return true;},
  grabbing:()=>!!grab,
  /** Drop a working-part grab WITHOUT working it (a still press-and-hold on a lid becomes a squeeze, Nov 9): the part springs back to
   *  where it was when the finger went down, and lets go. Any other grab: the same as `up`. */
  cancel(){if(!grab)return false;if(grab.kind!=='mech'||!grab.mech)return api.up();const m=grab.mech,q0=grab.q0??m.q;grab=null;
   m.held=false;m.lastAng=null;m.target=q0;m.shutting=false;m.auto=Math.abs(m.q-q0)>1e-4?{to:q0,release:true}:null;if(!m.auto)mechRelease(m);return true;},
  holdStart(){if(spec?.kind==='windup'&&!running)windHold=true;},
  holdEnd(){if(windHold){windHold=false;if(wind>.05)startRun();}},
  /** A tap at a model point: dents the soft body, kicks the springs; a tap on a tray piece / capsule half sends it home. */
  poke(part:string,pModel:T.Vector3,nModel:T.Vector3){
   if(justPosed){justPosed=false;return true;}
   const p=pieceOf(part);if(p&&p.st==='out'){sendHome(p);return true;}
   if(cap&&cap.state==='open'&&(isUnder(part,cap.top.o.name)||isUnder(part,cap.bottom.o.name))){closeCapsule();return true;}
   if(soft&&capOpen()){soft.dent(pModel,nModel,.045+.03*(softSpec?.soft??.6));soft.kick(-nModel.x*.5,-nModel.z*.5);soft.jiggle(.25);hooks.emit('dent',softSpec?.crackle?'crackle':undefined);}
   kickSprings(-nModel.z*2.4+(Math.random()-.5),nModel.x*2.4+(Math.random()-.5));
   if(cap&&cap.state==='closed'){hooks.emit('twist');return false;}
   return false;},
  /** Rub: finger motion during a squeeze. */
  rub(dx:number,dy:number){soft?.rub(dx*.004,dy*.004);soft?.jiggle(Math.min(.06,Math.hypot(dx,dy)*.002));},
  /** Squeeze let go: a jelly wobble and a spring kick (the squash itself springs back in the viewer's pressure). */
  released(){if(!soft?.slow)soft?.jiggle(-.35);kickSprings(1.2,0);},
  /** A fast flick that started on the toy: spin about itself (spin-top kind, or the flick bonus). Returns true if it spun. */
  flick(vx:number){if(!(spec?.kind==='spintop'||b.flick))return false;const need=spec?.kind==='spintop'?250:700;if(Math.abs(vx)<need)return false;
   spinW=clamp(vx*.022,-34,34)*(reduced?.4:1);spinning=true;settleT=0;hooks.emit('spin');return true;},
  /** Keyboard / screen-reader actions. Returns a short status line (or null if nothing to do). */
  action(name:KindAction):string|null{
   if(name==='work'||/^work\d$/.test(name)){if(!mechs.length)return null;const i=name==='work'?workIdx%mechs.length:Number(name.slice(4)),m=mechs[i];if(!m)return null;workIdx=i+1;return mechWork(m);}
   if(name==='more'||name==='less'){const m=mechs[(workIdx+mechs.length-1)%Math.max(1,mechs.length)];if(!m)return null;const s=m.spec,span=s.type==='crank'?Math.PI/2:(s.max-s.min)/4;
    m.shutting=false;m.auto={to:clamp((m.auto?.to??m.q)+(name==='more'?span:-span),s.min,s.max),release:true};if(s.type==='crank'){m.auto=null;m.v+=(name==='more'?1:-1)*4;}return `${cap1(s.label)} ${name==='more'?'moves':'moves back'}.`;}
   if(name==='pose'||name==='star'){if(!poseList.length)return null;const to=name==='star'?poseList.find(p=>p.name==='star')??poseList[poseList.length-1]:nextPoseFor(null);if(!to)return null;
    if(name==='star'&&poseCur===to&&poseT>=1){goPose(restPose);return 'Back to rest.';}goPose(to);return `${to.label} pose.`;}
   if(name==='swing'&&hangChain){hangChain.sleep=false;hangChain.o[1].add(v1.set(-1.6,0,-.4).multiplyScalar(1/120));kickSprings(2,1);hooks.emit('swing');return 'It swings on its chain.';}
   if(name==='apart'){const p=pieces.find(q=>q.st==='in'&&removable(q));if(!p)return pieces.length?'Nothing else comes off':null;
    p.st='out';p.freed=true;hadApart=true;p.vel.set(p.slot.x*1.6,2.4,p.slot.z*1.6);hooks.emit('pop',p.spec.name);hooks.fx('crumb',root.localToWorld(p.center.clone()));return `${cap1(p.spec.name)} off. ${status()}.`;}
   if(name==='together'){const p=[...pieces].reverse().find(q=>q.st==='out'&&canSnap(q));if(!p)return pieces.length?'Already together':null;sendHome(p);return `${cap1(p.spec.name)} goes back.`;}
   if(name==='wind'){if(spec?.kind!=='windup')return null;addWind(1.5);startRun(.35);return 'Wound up. Off it goes.';}
   if(name==='spin'){if(!(spec?.kind==='spintop'||b.flick))return null;api.flick(1400);return 'Spinning.';}
   if(name==='bump'||name==='swing'){if(!springs.length)return null;kickSprings(3,1.5);soft?.kick(.4,0);return name==='bump'?'Bump. It bobbles.':'It swings.';}
   if(name==='open'){if(!cap)return null;if(cap.state==='closed'){openCapsule();return 'Twisted open. A secret toy pops out.';}closeCapsule();return 'Packed back in its capsule.';}
   return null;},
  /** What can be done right now (for the action buttons). */
  can(){return {apart:pieces.some(q=>q.st==='in'&&removable(q)),together:pieces.some(q=>q.st==='out'),wind:spec?.kind==='windup'&&!running,open:!!cap,opened:capOpen(),
   piecesIn:piecesIn(),pieces:pieces.length,
   /** Round 3C: the working parts (label, first-use hint, open now), the hanging chain, the poses and the current one. */
   mechs:mechs.map(m=>({type:m.spec.type,label:m.spec.label,hint:m.spec.hint,open:mechOpen(m)})),chain:!!hangChain,poses:poseList.map(p=>p.name),pose:poseCur.name};},
  /** Tests: the joint value of each working part, the chain's state and the current blend. */
  probe(){return {mechs:mechs.map(m=>({q:m.q,v:m.v,fire:m.fire?.f??0})),chain:hangChain?{sleep:hangChain.sleep,anchor:hangChain.anchor.distanceTo(hangChain.home),tilt:root.quaternion.angleTo(rootRestQ),
   energy:hangChain.p.reduce((n,p,i)=>n+p.distanceTo(hangChain.o[i]),0),vmax:hangChain.vmax??0,off:hangChain.off??0}:null,pose:{cur:poseCur.name,to:poseTo.name,t:poseT}};},
  /** The camera needs this much room (model units, from the centre) while pieces / halves are on the tray. */
  extent(){let r=0;for(const p of pieces)if(p.st!=='in')r=Math.max(r,Math.hypot(p.center.x+p.off.x,p.center.z+p.off.z)+p.r*.6);
   if(cap&&cap.state!=='closed')for(const h of [cap.top,cap.bottom])r=Math.max(r,Math.hypot(h.center.x+h.off.x,h.center.z+h.off.z)+.25);
   if(running)r=Math.max(r,PATH_R+rig.radius);
   for(const m of mechs)if(m.spec.type==='wheels')r=Math.max(r,Math.abs(m.q)+rig.radius);
   if(hangChain)r=Math.max(r,rig.radius+hangChain.anchor.distanceTo(hangChain.home)*.6);return r;},
  /** Parts the soft body must not bend (pieces on the tray, capsule halves). */
  skip(part:string){if(part==='ring'&&hangChain)return true;if(chains.some(c=>c.tag&&isUnder(part,c.tag.name)))return true;// a dangling tag hangs from the squashed body, it is not squashed itself
   if(cap&&(isUnder(part,cap.top.o.name)||isUnder(part,cap.bottom.o.name)))return true;const p=pieceOf(part);return !!p&&p.st!=='in';},
  /**
   * Per frame, after the animator: integrate and apply every offset. `yawAcc`: the table's angular acceleration (rad/s²).
   * Returns true while anything moves.
   */
  update(dt:number,pressure:number,yawAcc:number):boolean{
   let moving=false;
   // Springs: the table's spin swings them outward; a damped spring brings them home.
   if(Math.abs(yawAcc)>.5){kickSprings(0,clamp(-yawAcc*.004,-.4,.4));soft?.kick(clamp(-yawAcc*.0012,-.2,.2),0);}
   for(const s of springs){s.vx+=(-s.k*s.ax-s.c*s.vx)*dt;s.vz+=(-s.k*s.az-s.c*s.vz)*dt;s.ax=clamp(s.ax+s.vx*dt,-.6,.6);s.az=clamp(s.az+s.vz*dt,-.6,.6);
    if(Math.abs(s.ax)+Math.abs(s.az)>.0008||Math.abs(s.vx)+Math.abs(s.vz)>.005){s.o.rotation.x+=s.ax;s.o.rotation.z+=s.az;moving=true;}else{s.ax=s.az=s.vx=s.vz=0;}}
   // Puzzle pieces.
   let near:Piece|null=null,nearD=1e9;
   for(const p of pieces){
    if(p.st==='snap'||p.st==='home'){p.t+=dt/(p.st==='home'?.5:.16);const u=Math.min(1,p.t),e=easeOut(u);p.off.copy(p.from).multiplyScalar(1-e);if(p.st==='home')p.off.y+=Math.sin(Math.PI*u)*.25;p.spin*=1-e;
     if(u>=1){const clicked=p.freed;p.st='in';p.off.set(0,0,0);p.spin=0;p.freed=false;if(clicked){hooks.emit('snap',p.spec.name);hooks.fx('sparkle',root.localToWorld(p.center.clone()));soft?.jiggle(.3);kickSprings(.8,.4);
       if(hadApart&&pieces.every(q=>q.st==='in')){hadApart=false;hooks.emit('complete');hooks.fx('confetti');}}}moving=true;}
    else if(p.st==='out'){const floor=-p.bottom;p.vel.y-=9*dt;p.off.addScaledVector(p.vel,dt);
     if(p.off.y<=floor){p.off.y=floor;if(Math.abs(p.vel.y)>.6){p.vel.y*=-.34;hooks.emit('drop');}else p.vel.y=0;p.vel.x*=.8;p.vel.z*=.8;
      // On the tray: slide to its slot (the tray feel), settling the little spin.
      p.off.x+=(p.slot.x-p.off.x)*Math.min(1,dt*5);p.off.z+=(p.slot.z-p.off.z)*Math.min(1,dt*5);}
     p.spinV*=Math.exp(-dt*3);p.spin+=p.spinV*dt;
     if(p.vel.lengthSq()>1e-4||Math.abs(p.off.x-p.slot.x)+Math.abs(p.off.z-p.slot.z)>.002||Math.abs(p.spinV)>.01)moving=true;}
    else if(p.st==='held'||p.st==='tug'){moving=true;if(p.st==='held'&&canSnap(p)){const d=p.off.length();if(d<nearD){nearD=d;near=p;}}}
    if(p.off.lengthSq()>0){p.o.position.add(p.off);}if(p.spin)p.o.rotation.y+=p.spin;if(p.st==='held'){p.o.rotation.z+=clamp(-p.vel.x*.05,-.25,.25);p.o.scale.multiplyScalar(1.04);}}
   if(ring){const show=near&&nearD<SNAP_R*2.6;if(show&&near){const k=1-clamp((nearD-SNAP_R*.6)/(SNAP_R*2),0,1);ring.visible=true;(ring.material as T.MeshBasicMaterial).opacity=.25+.6*k;
     const r=Math.max(.12,near.r*.85);ring.scale.set(r,r,r*.6);ring.position.set(near.center.x,Math.max(.02,near.center.y-near.r*.3),near.center.z);moving=true;}else ring.visible=false;}
   // Wind-up.
   if(windHold){addWind(dt*1.1);moving=true;}
   if(spec?.kind==='windup'){const key=partOf(spec.key);
    if(running){const sp=creep?.9:(1.2+wind*.55);speed+=(sp-speed)*Math.min(1,dt*4);const dth=speed*dt*(reduced?.35:1);theta+=dth;phase+=dth*9;wind=Math.max(0,wind-dt*.55);keyAngle-=dt*2.2;
     if(wind<=0&&!creep)creep=true;if(phase-lastTick>Math.PI){lastTick=phase;kickSprings(0,.5);soft?.jiggle(.08);}
     if(creep&&theta>=Math.PI*2){running=false;creep=false;theta=0;settle=1;hooks.emit('stop');}moving=true;}
    if(settle>0){settle=Math.max(0,settle-dt*1.6);moving=true;}
    const r=PATH_R*(reduced?.5:1),x=r*Math.sin(theta),z=r*Math.sin(theta)*Math.cos(theta),dx=r*Math.cos(theta),dz=r*Math.cos(2*theta),yaw=running?Math.atan2(dx,dz)-Math.atan2(1,1):0;
    if(running&&spec.gait==='hop'){// QA Nov 9 2026: a hopper (Grasshopper) springs along in arcs, both legs kicking together, instead of waddling.
     root.position.x+=x;root.position.z+=z;root.rotation.y+=yaw;const hp=Math.sin(phase*.5),up=Math.abs(hp);root.position.y+=.075*up*up*amp;root.rotation.x+=-.12*hp*Math.sign(Math.cos(phase*.5))*amp;
     for(const l of spec.legs??[]){const o=partOf(l);if(o)o.rotation.x+=(.8*up-.25)*amp;}}
    else if(running){root.position.x+=x;root.position.z+=z;root.rotation.y+=yaw;const s=Math.sin(phase);root.rotation.z+=.07*s*amp;root.position.y+=.018*Math.abs(s)*amp;
     for(const [i,l] of (spec.legs??[]).entries()){const o=partOf(l);if(o)o.rotation.x+=(i%2?-1:1)*.55*s*amp;}
     for(const [i,l] of (spec.arms??[]).entries()){const o=partOf(l);if(o)o.rotation.x+=(i%2?1:-1)*.45*s*amp;}}
    if(settle>0)root.rotation.z+=.06*Math.sin(settle*14)*settle*amp;
    if(key)key.rotation.z+=keyAngle;}
   // Spin.
   if(spinning){spinW-=Math.sign(spinW)*(.9+.12*Math.abs(spinW))*dt;spinA+=spinW*dt;tiltPhase+=dt*(4+Math.abs(spinW)*.15);const w=Math.abs(spinW);tiltA=.16*clamp(1-w/18,0,1)**2*amp;
    if(w<1.1){spinning=false;settleT=1;spinW=0;hooks.emit('stop');}moving=true;}
   if(settleT>0){settleT=Math.max(0,settleT-dt*1.2);tiltA=.16*settleT*Math.abs(Math.sin(settleT*12))*amp;if(settleT===0){tiltA=0;spinA=spinA%(Math.PI*2);}moving=true;}
   else if(!spinning&&spinA!==0){const home=Math.round(spinA/(Math.PI*2))*Math.PI*2;spinA+=(home-spinA)*Math.min(1,dt*3);if(Math.abs(home-spinA)<.002)spinA=0;else moving=true;}
   if(spinA||tiltA){root.rotation.y+=spinA;root.rotation.x+=Math.sin(tiltPhase)*tiltA;root.rotation.z+=Math.cos(tiltPhase)*tiltA;}
   // Capsule.
   if(cap){const c=cap;
    if(c.state==='closed'){if(!grab||grab.kind!=='capsule'){c.twist*=Math.exp(-dt*10);if(Math.abs(c.twist)<.002)c.twist=0;}c.top.o.rotation.y+=c.twist;c.inner.visible=false;if(c.twist)moving=true;}
    else{c.t+=dt;const halves=[c.top,c.bottom];
     for(const h of halves){if(c.state==='open'){const floor=h.floor;h.vel.y-=9*dt;h.off.addScaledVector(h.vel,dt);h.rot=clamp((h.off.y-floor)*2.4,0,1.2)*(reduced?.3:1);// tilts in flight, lands flat
       if(h.off.y<=floor&&h.vel.y<=0){h.off.y=floor;h.vel.y=Math.abs(h.vel.y)>.6?-h.vel.y*.3:0;h.off.x+=(h.slot.x-h.off.x)*Math.min(1,dt*5);h.off.z+=(h.slot.z-h.off.z)*Math.min(1,dt*5);}
       if(h.vel.lengthSq()>1e-4||h.off.distanceTo(v1.set(h.slot.x,h.off.y,h.slot.z))>.003)moving=true;}
      else{h.off.multiplyScalar(Math.exp(-dt*8));h.rot*=Math.exp(-dt*8);moving=true;}
      h.o.position.add(h.off);h.o.rotation.x+=(h===c.top?-1:1)*h.rot;}
     if(c.state==='closing'){c.pop=Math.max(0,c.pop-dt*4);if(c.top.off.length()<.004&&c.pop===0){c.state='closed';for(const h of halves){h.off.set(0,0,0);h.rot=0;h.vel.set(0,0,0);}hooks.emit('close');}}
     else c.pop=Math.min(1,c.pop+dt*2.2);
     const u=c.pop,s=c.state==='open'?(u<1?easeOut(u)*(1+.25*Math.sin(Math.PI*u)):1):u;c.inner.visible=s>.01;c.inner.scale.multiplyScalar(Math.max(.001,s));
     // The surprise floats up out of the capsule, hovers with a little turn, then settles onto the tray (≈ 1.5 s).
     if(c.state==='open'&&c.t<1.6){const t=c.t,up=t<.45?easeOut(t/.45):Math.max(0,1-easeInOut((t-.45)/1.05));c.inner.position.y+=(.34*up+.018*Math.sin(t*9)*up)*(reduced?.3:1);c.inner.rotation.y+=.5*Math.sin(Math.PI*Math.min(1,t/1.5))*(reduced?.3:1);moving=true;}
     if(u<1)moving=true;}}
   // Round 3C: working parts, poses, then the chains (a hanging toy takes its pose from its chain, after every other offset).
   clock+=dt;for(const m of mechs)if(mechUpdate(m,dt))moving=true;
   if(poseUpdate(dt))moving=true;
   for(const c of chains){if(chainUpdate(c,dt,yawAcc))moving=true;if(!c.sleep||c.from)chainApply(c);}
   // Soft body last (it reads nothing above, but pieces moved off the body must be skipped).
   if(soft&&soft.update(dt,capOpen()?pressure:0,api.skip))moving=true;
   return moving;},
  dispose(){soft?.rest();for(const c of chains){c.beads.removeFromParent();c.beads.geometry.dispose();(c.beads.material as T.Material).dispose();c.beads.dispose();}chains.length=0;
   for(const m of mechs)if(m.fire?.hidden)m.fire.o.visible=true;if(ring){ring.removeFromParent();ring.geometry.dispose();(ring.material as T.Material).dispose();ring=null;}},
 };
 function cap1(s:string){return s.charAt(0).toUpperCase()+s.slice(1);}
 function sendHome(p:Piece){p.st='home';p.t=0;p.from.copy(p.off);p.freed=true;}
 function addWind(turns:number){const before=wind;wind=Math.min(MAX_WIND,wind+turns);keyAngle+=(wind-before)*Math.PI*2*(reduced?.5:1);
  if(Math.floor(wind*8)!==Math.floor(before*8))hooks.emit('ratchet');}
 function startRun(delay=0){if(running)return;running=true;creep=false;theta=-delay;speed=0;phase=0;lastTick=0;hooks.emit('run');}
 function openCapsule(){if(!cap||cap.state!=='closed')return;const c=cap;c.state='open';c.t=0;c.pop=0;grab=null;
  c.top.vel.set(c.top.slot.x*1.4,3.4,c.top.slot.z*1.4);c.bottom.vel.set(c.bottom.slot.x*1.6,1.2,c.bottom.slot.z*1.6);
  hooks.emit('reveal');hooks.fx('sparkle');hooks.fx('confetti');soft?.jiggle(.5);kickSprings(2,1);}
 function closeCapsule(){if(!cap||cap.state!=='open')return;cap.state='closing';for(const h of [cap.top,cap.bottom])h.vel.set(0,0,0);}
 return api;
}
export type KindRuntime=ReturnType<typeof createKindRuntime>;
/** Keyboard / button actions. Round 3C: work (M: the next part), work0…work9 (one part), more / less (↑ / ↓), pose (P), star. */
export type KindAction='apart'|'together'|'wind'|'spin'|'bump'|'open'|'swing'|'work'|`work${number}`|'more'|'less'|'pose'|'star';
