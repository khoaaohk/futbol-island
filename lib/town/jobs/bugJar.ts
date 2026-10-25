/**
 * The Bug squad's firefly jar (Oct 21 2026, user: "the firefly jar isn't built, so night catches use the net"). At Night the job's
 * tool is a glass jar with a hinged lid instead of the net: carried in both hands in front of the chest, swept up over a firefly
 * with Cup (the scoop: low on the right, up and over, the mouth cupping down onto it), the lid snapping on, the firefly glowing
 * inside; riding, it hangs on the backpack's side socket like the net. Catch reach and auto-aim are the net's (bugCatch.ts): only
 * the look and the motion differ.
 *
 *  - Glass (one transparent mesh, no textures): an open cylinder with a bottom; its emissive warms up with the fireflies inside.
 *  - Trim (one merged vertex-colour mesh): the brass thread ring at the neck and a little football sticker on the front.
 *  - Lid (one merged vertex-colour mesh on a hinge at the back of the rim): red with a cream knob and three air holes; open while
 *    hunting, snapping shut on a catch (a spring with a little overshoot), shut while riding.
 *  - Glow: one camera-facing additive sprite inside the jar (no lights), shown while it holds fireflies.
 *  - Swoosh: the shared glowing trail (bugSwoosh.ts), smaller than the net's.
 * Same API as createBugNet (jobScene swaps one for the other): local +y = the jar's mouth; the group's matrix is set each frame.
 * Draws while a shift runs: glass, trim, lid (+ the glow sprite with fireflies inside, + the trail during a cup).
 */
import * as T from 'three';
import {mergeColoured} from './bugShape';
import {swingPhase,SWING,type NetCarry} from './bugCatch';
import {createSwoosh} from './bugSwoosh';
import {NET_PACK} from './bugNet';

export const JAR_RADIUS=.115;
export const JAR_HEIGHT=.25;
/** Lid hinge angle when open (rad, swung back over the hinge). */
export const JAR_LID_OPEN=-2.1;
/** The lid's screw twist (s, 1.5 turns) after it snaps shut, and the little shake after it is tight (s). */
export const JAR_SCREW_S=.35,JAR_SHAKE_S=.45;
const R=JAR_RADIUS,H=JAR_HEIGHT;

export function createBugJar(own:<X extends {dispose:()=>void}>(x:X)=>X){
 const group=new T.Group();group.name='job-jar';group.matrixAutoUpdate=false;group.visible=false;
 const tmp:T.BufferGeometry[]=[];const k=<G extends T.BufferGeometry>(g:G)=>{tmp.push(g);return g;};
 const m=(x:number,y:number,z:number,rx=0,ry=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1));
 // Glass: open cylinder + bottom, one geometry (merged without colours: the material tints it).
 const glassG=own(mergeColoured([
  {geometry:k(new T.CylinderGeometry(R,R*.94,H,22,1,true)),matrix:m(0,0,0),color:'#ffffff'},
  {geometry:k(new T.CircleGeometry(R*.94,22)),matrix:m(0,-H/2,0,Math.PI/2,0,0),color:'#ffffff'},
 ]));
 const glassMat=own(new T.MeshStandardMaterial({color:'#dff4ff',transparent:true,opacity:.32,roughness:.08,metalness:0,side:T.DoubleSide,depthWrite:false,emissive:'#ffd75a',emissiveIntensity:0}));
 const glass=new T.Mesh(glassG,glassMat);glass.name='job-jar-glass';glass.frustumCulled=false;glass.renderOrder=2;
 const trimG=own(mergeColoured([
  {geometry:k(new T.CylinderGeometry(R*1.03,R*1.03,.032,22,1,true)),matrix:m(0,H/2-.018,0),color:'#c9a24a'},
  {geometry:k(new T.TorusGeometry(R*1.02,.006,5,22)),matrix:m(0,H/2-.002,0,Math.PI/2,0,0),color:'#e0c06a'},
  {geometry:k(new T.CircleGeometry(.042,16)),matrix:m(0,-.01,R*.985+.003),color:'#f6f3ea'},
  {geometry:k(new T.CircleGeometry(.019,5)),matrix:m(0,-.01,R*.985+.005),color:'#1d1b1b'},
 ]));
 const opaqueMat=own(new T.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.1}));
 const trim=new T.Mesh(trimG,opaqueMat);trim.name='job-jar-trim';trim.frustumCulled=false;
 // Lid on a hinge at the back of the rim: the lid's centre sits R in front of the hinge.
 const lidG=own(mergeColoured([
  {geometry:k(new T.CylinderGeometry(R*1.1,R*1.1,.03,22)),matrix:m(0,.015,R),color:'#e2453c'},
  {geometry:k(new T.CylinderGeometry(.022,.026,.022,10)),matrix:m(0,.041,R),color:'#f6efe2'},
  {geometry:k(new T.CircleGeometry(.008,6)),matrix:m(.045,.0305,R,-Math.PI/2,0,0),color:'#3b0f0c'},
  {geometry:k(new T.CircleGeometry(.008,6)),matrix:m(-.045,.0305,R,-Math.PI/2,0,0),color:'#3b0f0c'},
  {geometry:k(new T.CircleGeometry(.008,6)),matrix:m(0,.0305,R+.05,-Math.PI/2,0,0),color:'#3b0f0c'},
 ]));
 for(const g of tmp)g.dispose();
 // Oct 25 2026 (catch upgrade): the lid screws on and off. Its geometry is centred on its own axis (translated back by R) and it
 // sits R in front of the hinge, so lid.rotation.y spins it in place (the screw twist) while the hinge swings it open / shut.
 lidG.translate(0,0,-R);
 const lid=new T.Mesh(lidG,opaqueMat);lid.name='job-jar-lid';lid.frustumCulled=false;lid.position.set(0,0,R);
 const lidHinge=new T.Group();lidHinge.position.set(0,H/2,-R);lidHinge.add(lid);
 // The glow inside: one additive camera-facing sprite (a radial falloff in the shader, no texture, no light).
 const glowMat=own(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uA:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv-.5;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);float s=length(modelMatrix[0].xyz);mv.xy+=position.xy*s;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float uA;varying vec2 vUv;void main(){float d=length(vUv)*2.;float a=(1.-smoothstep(0.,1.,d));a=a*a*uA;if(a<.01)discard;gl_FragColor=vec4(vec3(1.,.9,.45)*1.2,a);}'}));
 const glowG=own(new T.PlaneGeometry(1,1));const glow=new T.Mesh(glowG,glowMat);glow.name='job-jar-glow';glow.frustumCulled=false;glow.scale.setScalar(.5);glow.visible=false;glow.renderOrder=3;
 group.add(glass,trim,lidHinge,glow);
 const trail=createSwoosh(own,.8,1.2,Math.PI*1.1,'job-jar-swoosh'),swoosh=trail.mesh;trail.setLook('night');
 let lidA=JAR_LID_OPEN,lidV=0,flipWant=0,tilt=0,fill=0,haveYaw=false,lastYaw=0,sway=0,swayV=0,clock=0,screw=0,shake=0;let outcomeKind:'hit'|'miss'|null=null;
 const q=new T.Quaternion(),e=new T.Euler(0,0,0,'YXZ'),one=new T.Vector3(1,1,1),pos=new T.Vector3(),tmpV=new T.Vector3(),sx=new T.Vector3(),sy=new T.Vector3(),sz=new T.Vector3();
 /** The jar's forward tilt (rad, + = the mouth tips forward) through the cup: lowered with the mouth back a little in the wind-up,
  *  swept up and over until the mouth points forward and down (cupping the firefly), then righted as the lid snaps on. */
 function cupTilt(t:number){const s=swingPhase(t),e2=s.k*s.k*(3-2*s.k);
  if(s.phase==='windup')return -.35*e2;if(s.phase==='sweep')return -.35+2.25*e2;if(s.phase==='recover')return 1.9*(1-e2);return 0;}
 /** The lid: closing, the hinge snaps shut first, then the lid screws on (1.5 turns over JAR_SCREW_S) and the jar gives a little
  *  shake (the firefly inside bumps about); opening, it unscrews first, then the hinge swings back. Reduced motion: no spin, no shake. */
 function springLid(dt:number,reduced:boolean){const closing=flipWant>.5,target=closing||screw>.02?0:JAR_LID_OPEN;
  if(reduced||dt<=0){lidA=target;lidV=0;screw=closing?1:0;shake=0;}else{const h=Math.min(dt,1/30);lidV+=((target-lidA)*420-lidV*22)*h;lidA+=lidV*h;if(lidA>.12){lidA=.12;lidV=-Math.abs(lidV)*.3;}
   const was=screw;if(closing&&lidA>-.2)screw=Math.min(1,screw+dt/JAR_SCREW_S);else if(!closing)screw=Math.max(0,screw-dt/(JAR_SCREW_S*.8));
   if(was<1&&screw>=1)shake=JAR_SHAKE_S;if(shake>0)shake=Math.max(0,shake-dt);}
  lidHinge.rotation.x=lidA;lid.rotation.y=screw*Math.PI*3;}
 function place(yaw:number,dt:number,reduced:boolean){
  const sk=shake>0?shake/JAR_SHAKE_S:0;
  e.set(tilt+Math.sin(sk*Math.PI*7)*.06*sk,yaw,sway+Math.sin(sk*Math.PI*9)*.14*sk);q.setFromEuler(e);group.matrix.compose(pos,q,one);group.matrixWorldNeedsUpdate=true;springLid(dt,reduced);
  clock+=dt;glow.visible=fill>0;if(fill>0){const p=reduced?1:.85+.15*Math.sin(clock*5.3);glowMat.uniforms.uA.value=Math.min(1,.45+.55*fill)*p;glow.scale.setScalar(.34+.22*fill);
   // The firefly flutters about inside the glass (a small Lissajous loop, bigger in the shake): it is alive in there, not a lamp.
   const f=reduced?0:1+2*sk;glow.position.set(Math.sin(clock*7.3)*.025*f,Math.sin(clock*9.7)*.035*f-.01,Math.cos(clock*6.1)*.025*f);}
  glassMat.emissiveIntensity=fill>0?(.25+.45*fill)*(reduced?1:.85+.15*Math.sin(clock*5.3)):0;}
 const api={group,swoosh,bag:glass,bagPivot:lidHinge,kind:'jar' as const,
  /** Both hands hold the jar at its sides: the jar sits at their midpoint, upright and facing `yaw`, tipped by the cup. Same
   *  signature as the net's layout (`pose`: carry / low = Jar low, held a little forward and tipped / raise / swing = the cup). */
  layout(l:{x:number;y:number;z:number},r:{x:number;y:number;z:number},yaw:number,swingT:number,pose:NetCarry,dt:number,reduced:boolean){
   const fx=Math.sin(yaw),fz=Math.cos(yaw);
   let dy=haveYaw?yaw-lastYaw:0;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;lastYaw=yaw;haveYaw=true;
   swayV+=(dy/Math.max(dt,1e-3)*.02-sway*60-swayV*9)*dt;sway=reduced?0:Math.max(-.3,Math.min(.3,sway+swayV*dt));
   const want=swingT>=0?cupTilt(swingT):pose==='low'?.3:0,kk=reduced||swingT>=0?1:Math.min(1,dt*10);tilt+=(want-tilt)*kk;
   // The hands grip the jar's sides a touch below the neck: the jar's centre is a little in front of and below their midpoint.
   pos.set((l.x+r.x)/2+fx*.02,(l.y+r.y)/2-.01,(l.z+r.z)/2+fz*.02);
   place(yaw,dt,reduced);
   if(swingT>=0&&!reduced){const s=swingPhase(swingT);swoosh.visible=s.phase==='sweep'||s.phase==='recover';
    if(swoosh.visible){swoosh.position.set(pos.x-fx*.25,pos.y-.1,pos.z-fz*.25);swoosh.rotation.set(-.35,yaw+Math.PI/2,0,'YXZ');
     trail.show(s.phase==='sweep'?Math.max(.04,s.k):1,s.phase==='sweep'?1:1-s.k);}}
   else swoosh.visible=false;},
  /** Riding: the jar hangs upright beside the pack on its side socket (the net's NET_PACK.out clearance + the jar's radius), lid shut. */
  pack(socket:T.Matrix4,yaw:number,_tilt:number,dt:number,reduced:boolean){
   socket.extractBasis(sx,sy,sz);sx.normalize();pos.setFromMatrixPosition(socket).addScaledVector(sx,NET_PACK.out+R+.01);pos.y-=.04;
   tilt=0;sway=0;const was=flipWant;flipWant=1;place(yaw,dt,reduced);flipWant=was;swoosh.visible=false;},
  /** For tests: the jar's centre and its up (mouth) axis in world space. */
  poleLine(o:{x:number;y:number;z:number},d:{x:number;y:number;z:number}){const el=group.matrix.elements;o.x=el[12];o.y=el[13];o.z=el[14];d.x=el[4];d.y=el[5];d.z=el[6];},
  /** Snap the lid on (true) or open it again (false). */
  close(on:boolean){flipWant=on?1:0;},
  /** Point `k` of the way from the mouth (0) to the bottom (1) along the jar's axis (where a caught firefly glows). */
  bagPoint(kk:number,out:{x:number;y:number;z:number}){tmpV.set(0,H/2-(H-.03)*Math.max(0,Math.min(1,kk)),0).applyMatrix4(group.matrix);out.x=tmpV.x;out.y=tmpV.y;out.z=tmpV.z;return out;},
  bagCentre(out:{x:number;y:number;z:number}){return api.bagPoint(.5,out);},
  /** The lid's closedness (0 open → 1 shut). */
  get flip(){return Math.max(0,Math.min(1,1-lidA/JAR_LID_OPEN));},
  /** The mouth's centre (the "hoop" of the net's API). */
  hoopCentre(out:{x:number;y:number;z:number}){tmpV.set(0,H/2,0).applyMatrix4(group.matrix);out.x=tmpV.x;out.y=tmpV.y;out.z=tmpV.z;return out;},
  /** How full of light the jar is (0 = no firefly, 1 = a full shift): the glass glows and the inner sprite shows. */
  setFill(k:number){fill=Math.max(0,Math.min(1,k));},
  get fill(){return fill;},
  get lidAngle(){return lidA;},
  /** 0 = unscrewed … 1 = screwed tight; the shake left (s). */
  get screw(){return screw;},get shaking(){return shake;},
  /** The cup's outcome (as the net's): a miss wobbles the empty jar, a catch snaps the lid on (screw, shake) until the cup ends. */
  outcome(kind:'hit'|'miss'|null){outcomeKind=kind;if(kind==='miss')swayV+=5;if(kind==='hit')flipWant=1;},
  get outcomeKind(){return outcomeKind;},
  stageLook(_look:'day'|'sunset'|'night'|false){trail.setLook('night');},
  trail,
  reset(){lidA=JAR_LID_OPEN;lidV=0;flipWant=0;screw=0;shake=0;outcomeKind=null;tilt=0;sway=swayV=0;haveYaw=false;swoosh.visible=false;},
  get swingTime(){return SWING.end;},
 };
 return api;
}
export type BugJar=ReturnType<typeof createBugJar>;
