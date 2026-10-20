/**
 * The Bug squad's butterfly net and its swing (catching lane, Oct 20 2026; user: "the net looks like a cone, it needs to look
 * better" and "the net needs to have a swing, the net animation and catching animation"). Built with the job props, disposed with
 * them; no textures, three draws while a shift runs (frame, bag, swoosh trail) and the trail only during a swing.
 *
 *  - Frame (one merged vertex-colour mesh): a sturdy wooden pole with a rubber grip, a dark collar band at the joint, a round hoop
 *    (0.42 m radius, twice the first lane's) and a little football on the pole's butt (white with a dark pentagon patch).
 *  - Bag: a deep, rounded mesh bag (a stretched hemisphere, not a cone) with mesh lines from alternating vertex colours. It hangs
 *    behind the hoop, lags on a spring through the swing and flips closed (a twist over the rim) on a catch.
 *  - Swoosh: a flat ribbon arc revealed along the sweep and faded out (additive; glowing yellow at Night).
 * Local frame: the pole runs up +y from the hands (y = 0), the hoop stands in the y-z plane above it and its opening faces +x, so the
 * caller orients the net with a full basis: y = pole direction, x = the way the hoop is moving (the bag trails behind, along −x).
 */
import * as T from 'three';
import {mergeColoured} from './bugShape';
import {swingPhase,SWING,type NetCarry} from './bugCatch';

export const NET_HOOP_RADIUS=.42;
export const NET_POLE=1.15;
const R=NET_HOOP_RADIUS,BAG_DEPTH=1.55;
/** The hands sit this far up the pole from its butt (the grip). */
export const NET_GRIP=.42;
/** How much the pole follows the hand-to-hand line (0 = the carry / swing direction only, 1 = exactly the hands' line). */
export const NET_HAND_FOLLOW=.85;
/** Where the hands sit up the pole (m from the butt) per held pose: the relaxed carry holds it nearer the butt (the pole's tail
 *  stays clear of the hip), Net down right at the butt (nothing pokes back into the body); swings and the raise use NET_GRIP. */
export const NET_GRIP_BY_MODE={carry:.27,low:.15,swing:NET_GRIP,raise:NET_GRIP} as const;
/** Riding: the pole rests on the backpack's side socket (lib/graphics/backpack.ts `backpack-side-right`, docs/backpack.md), this
 *  far up the pole from its butt, tilted back by BACKPACK_RIDE_OFFSETS[ride].poleTilt; the hoop rides behind and above the rider
 *  with the bag streaming back. `out` = metres pushed out from the socket so the pole clears the pack's side. */
export const NET_PACK={strap:.42,out:.035} as const;
/** Blend time between carry modes (s): the pole's grip and hand-follow ease instead of snapping. */
export const NET_MODE_BLEND_S=.2;

export function createBugNet(own:<X extends {dispose:()=>void}>(x:X)=>X,night:boolean){
 const group=new T.Group();group.name='job-net';group.matrixAutoUpdate=false;group.visible=false;
 const tmp:T.BufferGeometry[]=[];const k=<G extends T.BufferGeometry>(g:G)=>{tmp.push(g);return g;};
 const m=(x:number,y:number,z:number,rx=0,ry=0,rz=0,s=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(s,s,s));
 const top=NET_POLE+R;
 const frame=own(mergeColoured([
  {geometry:k(new T.CylinderGeometry(.022,.027,NET_POLE,8)),matrix:m(0,NET_POLE/2,0),color:'#a8743f'},
  {geometry:k(new T.CylinderGeometry(.033,.033,.32,8)),matrix:m(0,.12,0),color:'#2d3a46'},
  {geometry:k(new T.CylinderGeometry(.036,.03,.14,8)),matrix:m(0,NET_POLE-.04,0),color:'#1f3d4a'},
  {geometry:k(new T.TorusGeometry(R,.022,6,36)),matrix:m(0,top,0,0,Math.PI/2,0),color:'#2f7d92'},
  {geometry:k(new T.SphereGeometry(.06,10,8)),matrix:m(0,-.07,0),color:'#f6f3ea'},
  {geometry:k(new T.CircleGeometry(.032,5)),matrix:m(0,-.07,.061),color:'#1d1b1b'},
  {geometry:k(new T.CircleGeometry(.03,5)),matrix:m(.061,-.07,0,0,Math.PI/2,0),color:'#1d1b1b'},
 ]));
 for(const g of tmp)g.dispose();
 const frameMat=own(new T.MeshStandardMaterial({vertexColors:true,roughness:.65}));
 const frameMesh=new T.Mesh(frame,frameMat);frameMesh.name='job-net-frame';frameMesh.frustumCulled=false;group.add(frameMesh);
 // The bag: a hemisphere (axis +y) stretched deep, turned to trail along −x from the hoop; mesh lines = alternating vertex colours.
 const bagG=own(new T.SphereGeometry(R*.98,28,10,0,Math.PI*2,0,Math.PI/2));
 {const uv=bagG.getAttribute('uv'),n=uv.count,col=new Float32Array(n*3),a=new T.Color(night?'#dfe9ff':'#f6f8f1'),b=new T.Color(night?'#4b5e86':'#5e7a71');
  for(let i=0;i<n;i++){const u=uv.getX(i),v=uv.getY(i),line=Math.round(u*28)%2===0||Math.round(v*10)%3===0,c=line?b:a;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  bagG.setAttribute('color',new T.BufferAttribute(col,3));
  bagG.scale(1,-BAG_DEPTH,1);bagG.rotateZ(-Math.PI/2);}
 const bagMat=own(new T.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false,roughness:.9}));
 const bagPivot=new T.Group();bagPivot.position.set(0,top,0);const bag=new T.Mesh(bagG,bagMat);bag.name='job-net-bag';bag.frustumCulled=false;bagPivot.add(bag);group.add(bagPivot);
 // Swoosh: a ribbon arc (24 segments), revealed with the sweep by draw range, in world space.
 const swooshG=own(new T.RingGeometry(1.35,1.95,24,1,0,Math.PI*1.25));
 const swooshMat=own(new T.MeshBasicMaterial({color:night?'#f4ff8a':'#ffffff',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
 const swoosh=new T.Mesh(swooshG,swooshMat);swoosh.name='job-net-swoosh';swoosh.frustumCulled=false;swoosh.visible=false;swoosh.rotation.order='YXZ';
 const SEG_IDX=6;
 // Spring state for the bag's lag, and the catch flip (0 open → 1 closed).
 let lag=0,lagV=0,lastA=0,lastYaw=0,flip=0,flipWant=0,follow=1,grip:number=NET_GRIP_BY_MODE.carry,surge=0,surgeV=0,lastVf=0,haveMid=false;
 const lastMid=new T.Vector3(),sx=new T.Vector3(),sy=new T.Vector3(),sz=new T.Vector3();
 const bx=new T.Vector3(),by=new T.Vector3(),bz=new T.Vector3(),pos=new T.Vector3(),tmpV=new T.Vector3(),hand=new T.Vector3(),mid=new T.Vector3();
 /** Swing angle (rad from straight ahead, + = to the player's right) and hoop height (m above the hands) at swing time t. */
 function swingAim(t:number){const s=swingPhase(t);
  if(s.phase==='windup'){const e=s.k*s.k*(3-2*s.k);return {a:.4+e*1.6,h:.55+e*.75};}
  if(s.phase==='sweep'){const e=s.k*s.k*(3-2*s.k);return {a:2-e*3.4,h:1.3-Math.sin(s.k*Math.PI)*1.25-e*.25};}
  if(s.phase==='recover'){const e=s.k;return {a:-1.4+e*1.5,h:.05+e*.5};}
  return {a:.1,h:.55};}
 const api={group,swoosh,bag,bagPivot,
  /** Lay the net out in both hands: `l` / `r` = the hand points (world), facing `yaw` (rad, 0 = +z). The pole runs through both
   *  hands (their midpoint, along the hand-to-hand line blended with the carry / swing direction), so neither hand floats off it.
   *  `swingT` < 0 = not swinging; `pose`: 'carry' over the shoulder, 'low' = Net down (stalking), 'raise' = held up after a catch. */
  layout(l:{x:number;y:number;z:number},r:{x:number;y:number;z:number},yaw:number,swingT:number,pose:NetCarry,dt:number,reduced:boolean){
   const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=-fz,rz=fx;// forward and the player's right
   let a=0,h=0,mx=fx,mz=fz;
   // Pole inertia: the bag lags on a spring when the swing moves the hoop and when the player turns.
   let dy=yaw-lastYaw;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;lastYaw=yaw;
   if(swingT>=0){const s=swingAim(swingT);a=s.a;h=s.h;const d=a-lastA;lastA=a;
    // Motion direction of the hoop: d(dir)/da × sign(da).
    const sg=d<0?1:-1;mx=(fx*Math.sin(a)-rx*Math.cos(a))*sg;mz=(fz*Math.sin(a)-rz*Math.cos(a))*sg;
    lagV+=(d/Math.max(dt,1e-3)*.06-lag*40-lagV*7)*dt;}
   else{lagV+=(-dy/Math.max(dt,1e-3)*.05-lag*30-lagV*6)*dt;
    if(pose==='carry'){a=Math.PI*.78;h=1.25;}else if(pose==='low'){a=.12;h=-.55;}else{a=.05;h=2.2;}}
   lag=reduced?0:Math.max(-1.2,Math.min(1.2,lag+lagV*dt));
   // Held carry / Net down (bug-polish): the arms are solved onto the pole, so the pole is exactly the hands' line (follow 1);
   // swings / the raise keep the swing aim blended with the hands (NET_HAND_FOLLOW). Both ease over NET_MODE_BLEND_S.
   const held=pose==='carry'||pose==='low',k=reduced?1:Math.min(1,dt/NET_MODE_BLEND_S*3);
   follow+=((held?1:NET_HAND_FOLLOW)-follow)*k;grip+=((NET_GRIP_BY_MODE[pose==='pack'?'carry':pose])-grip)*k;
   const ca=Math.cos(a),sa=Math.sin(a),dx=fx*ca+rx*sa,dz=fz*ca+rz*sa;
   by.set(dx,h,dz).normalize();
   // The hands' line: from the lower (rear) hand to the upper one, flipped to point the way the net points.
   hand.set(r.x-l.x,r.y-l.y,r.z-l.z);const hl=hand.length(),w=Math.max(0,Math.min(1,(hl-.08)/.2))*follow;
   if(hl>1e-4){hand.multiplyScalar(1/hl);if(held||hand.dot(by)<0)hand.negate();/* held: from the rear (r) hand to the front (l) hand */by.multiplyScalar(1-w).addScaledVector(hand,w).normalize();}
   mid.set((l.x+r.x)/2,(l.y+r.y)/2,(l.z+r.z)/2);
   // Starts and stops: the bag swings back when the walk speeds up and forward when it stops (a spring on the hands' acceleration
   // along the facing), on top of the turn lag.
   if(haveMid&&dt>0){const vf=((mid.x-lastMid.x)*fx+(mid.z-lastMid.z)*fz)/Math.max(dt,1e-3);const acc=(vf-lastVf)/Math.max(dt,1e-3);lastVf=vf;
    surgeV+=(-Math.max(-30,Math.min(30,acc))*.012-surge*26-surgeV*5.5)*dt;surge=reduced?0:Math.max(-.9,Math.min(.9,surge+surgeV*dt));}
   lastMid.copy(mid);haveMid=true;
   bx.set(mx,0,mz);bx.addScaledVector(by,-bx.dot(by));if(bx.lengthSq()<1e-4)bx.set(fx,0,fz).addScaledVector(by,-by.x*fx-by.z*fz);bx.normalize();
   bz.crossVectors(bx,by);pos.copy(mid).addScaledVector(by,-grip);
   group.matrix.makeBasis(bx,by,bz).setPosition(pos);group.matrixWorldNeedsUpdate=true;
   flip+=(flipWant-flip)*Math.min(1,dt*(reduced?60:12));
   bagPivot.rotation.set(flip*.9,lag*.8,-.22+lag*.25+surge*.45+flip*.4);
   // The swoosh follows the sweep: a flat arc round the player's chest, revealed along the swing, fading in the recovery.
   if(swingT>=0&&!reduced){const s=swingPhase(swingT);swoosh.visible=s.phase==='sweep'||s.phase==='recover';
    if(swoosh.visible){swoosh.position.set(mid.x-fx*.2,mid.y+.15,mid.z-fz*.2);swoosh.rotation.set(-Math.PI/2+.25,yaw-Math.PI*.15,0);
     const segs=s.phase==='sweep'?Math.max(1,Math.ceil(s.k*24)):24;swooshG.setDrawRange(0,segs*SEG_IDX);swooshMat.opacity=s.phase==='sweep'?.55:.55*(1-s.k);}}
   else swoosh.visible=false;
  },
  /** Riding (scooter / bike / moped; bug-polish wiring to the backpack lane): the pole rests on the pack's side socket
   *  (`backpack-side-right`), `socket` = its world matrix (the pack's own axes: +x out of that side, +z into the body), tilted
   *  back from vertical by `tilt` rad (BACKPACK_RIDE_OFFSETS[ride].poleTilt),
   *  NET_PACK.strap up the pole from its butt; the hoop rides behind and above, the bag streaming back and lagging on turns. */
  pack(socket:T.Matrix4,yaw:number,tilt:number,dt:number,reduced:boolean){
   let dy=yaw-lastYaw;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;lastYaw=yaw;
   lagV+=(-dy/Math.max(dt,1e-3)*.04-lag*30-lagV*6)*dt;lag=reduced?0:Math.max(-1,Math.min(1,lag+lagV*dt));
   socket.extractBasis(sx,sy,sz);sx.normalize();sz.y=0;if(sz.lengthSq()<1e-6)sz.set(Math.sin(yaw),0,Math.cos(yaw));sz.normalize();
   // Tilted back from vertical by the ride's tilt (whatever the rider's lean), away from the body (−z); the hoop opens forward so
   // the bag trails behind.
   by.set(0,Math.cos(tilt),0).addScaledVector(sz,-Math.sin(tilt)).normalize();
   bx.copy(sz);bx.addScaledVector(by,-bx.dot(by)).normalize();bz.crossVectors(bx,by);
   pos.setFromMatrixPosition(socket).addScaledVector(sx,NET_PACK.out).addScaledVector(by,-NET_PACK.strap);
   group.matrix.makeBasis(bx,by,bz).setPosition(pos);group.matrixWorldNeedsUpdate=true;haveMid=false;
   flip+=(0-flip)*Math.min(1,dt*12);bagPivot.rotation.set(0,lag*.6,-.12+lag*.2);swoosh.visible=false;
  },
  /** For tests: the pole's line (origin, unit direction) in world space. */
  poleLine(o:{x:number;y:number;z:number},d:{x:number;y:number;z:number}){const e=group.matrix.elements;o.x=e[12];o.y=e[13];o.z=e[14];d.x=e[4];d.y=e[5];d.z=e[6];},
  /** Close the bag over the catch (true) or open it again (false). */
  close(on:boolean){flipWant=on?1:0;},
  /** World point in the middle of the bag (where a caught bug wiggles). */
  bagCentre(out:{x:number;y:number;z:number}){tmpV.set(-R*.75,NET_POLE+R,0).applyMatrix4(group.matrix);out.x=tmpV.x;out.y=tmpV.y;out.z=tmpV.z;return out;},
  /** World point at the hoop's centre. */
  hoopCentre(out:{x:number;y:number;z:number}){tmpV.set(0,NET_POLE+R,0).applyMatrix4(group.matrix);out.x=tmpV.x;out.y=tmpV.y;out.z=tmpV.z;return out;},
  reset(){lag=lagV=flip=flipWant=0;lastA=0;surge=surgeV=lastVf=0;haveMid=false;follow=1;grip=NET_GRIP_BY_MODE.carry;swoosh.visible=false;},
  get swingTime(){return SWING.end;},
 };
 return api;
}
export type BugNet=ReturnType<typeof createBugNet>;
