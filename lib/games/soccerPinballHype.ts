import * as T from 'three';
import type {PinballState} from './soccerPinball';
import {HOT_SPOTS,HOT_R,hotZoneTime} from './soccerPinballMissions';

/* Futbol Pinball round 3 living-table visuals (docs/ARCADE_PINBALL_R3_OCT26.md). Built once, 2 draw calls:
 *  - chase lights: 26 rail lamps in ONE instanced draw. A light wave chases around the rails; it speeds up and
 *    brightens with the hype (combos, hot zones, multiball, goals) and the lamps nearest the ball glow, so the table
 *    "wakes up" as a rally builds. Colours are written into the existing instance buffer (no allocation).
 *    Reduced motion: no chase, only the ball-proximity glow. Hard divisions run the lamps in a warmer palette.
 *  - hot zone: one pulsing ring on the lit spot; it shrinks as its time runs out (a readable timer without text).
 * update() returns whether anything is animating so the frame loop can sleep. */

const N_SIDE=10,N_TOP=6,N=N_SIDE*2+N_TOP;
export function createPinballHype(scene:T.Scene,px:(x:number)=>number,pz:(y:number)=>number,mobile:boolean,reduced:boolean){
 const pos=new Float32Array(N*2);
 // Left rail (x 20) up from the kickboard, the lane divider (x 341) down from the arch: one loop with the top row.
 for(let i=0;i<N_SIDE;i++){pos[i*2]=20;pos[i*2+1]=440-i*40;pos[(N_SIDE+i)*2]=341;pos[(N_SIDE+i)*2+1]=162+i*26;}
 // Top row on the goal-line rails, either side of the goal frame.
 for(let i=0;i<N_TOP;i++){const k=N_SIDE*2+i,x=i<3?36+i*26:274+(i-3)*20;pos[k*2]=x;pos[k*2+1]=45;}
 const lampMat=new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false,transparent:true,opacity:.95,depthWrite:false});lampMat.userData.arcadeSpill=true;
 const lamps=new T.InstancedMesh(new T.CircleGeometry(.19,mobile?10:14),lampMat,N);lamps.name='pinball-chase-lights';lamps.frustumCulled=false;
 const dummy=new T.Object3D();dummy.rotation.x=-Math.PI/2;
 for(let i=0;i<N;i++){dummy.position.set(px(pos[i*2]),.05,pz(pos[i*2+1]));dummy.updateMatrix();lamps.setMatrixAt(i,dummy.matrix);lamps.setColorAt(i,new T.Color('#24425a'));}
 lamps.instanceMatrix.needsUpdate=true;lamps.instanceColor!.setUsage(T.DynamicDrawUsage);scene.add(lamps);
 const hotMat=new T.MeshBasicMaterial({color:'#ffe86d',toneMapped:false,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});hotMat.userData.arcadeSpill=true;
 const hot=new T.Mesh(new T.RingGeometry(.78,1,mobile?28:40),hotMat);hot.name='pinball-hot-zone';hot.rotation.x=-Math.PI/2;hot.visible=false;hot.renderOrder=3;scene.add(hot);
 const dim=new T.Color('#24425a'),cool=new T.Color('#73fff1'),warm=new T.Color('#ff62c2'),gold=new T.Color('#ffe86d'),hardA=new T.Color('#ff8a2a'),hardB=new T.Color('#ffe86d'),c=new T.Color(),hue=new T.Color();
 let phase=0,lastKey=-1;
 function update(s:PinballState,dt:number){
  const playing=s.phase==='playing'||s.phase==='goal',hype=s.hype,hard=s.level>=5;
  phase+=dt*(1.2+hype*5);
  const chase=!reduced&&playing,bx=s.ball.x,by=s.ball.y;
  // Sleep: a still table with no hype keeps its last colours.
  const key=playing?-2:Math.round(hype*20);
  if(!playing&&key===lastKey&&!hot.visible)return false;lastKey=key;
  for(let i=0;i<N;i++){
   const x=pos[i*2],y=pos[i*2+1],near=playing?Math.max(0,1-Math.hypot(x-bx,y-by)/90):0;
   // Chase order runs as a loop: up the left rail, along the top, down the lane divider.
   const order=i<N_SIDE?i:i>=N_SIDE*2?N_SIDE+i-N_SIDE*2:N_SIDE+N_TOP+i-N_SIDE;
   const wave=chase?Math.max(0,Math.sin(phase-order*.55))**3:0;
   const k=Math.min(1,near*.9+wave*(.25+hype*.75)+(s.phase==='goal'?.5:0));
   hue.copy(hard?(i%2?hardA:hardB):(i%2?cool:warm));if(hype>.85&&!reduced)hue.lerp(gold,.5);
   c.copy(dim).lerp(hue,k);lamps.setColorAt(i,c);
  }
  lamps.instanceColor!.needsUpdate=true;
  const h=s.hot,show=s.phase==='playing'&&h.time>0;hot.visible=show;
  if(show){const spot=HOT_SPOTS[h.i],left=h.time/hotZoneTime(s.level),r=HOT_R/30*(1.25+.5*left)*(reduced?1:1+.08*Math.sin(s.time*9));
   hot.position.set(px(spot.x),.045,pz(spot.y));hot.scale.setScalar(r);hotMat.opacity=left<.3&&!reduced?(Math.sin(s.time*16)>0?.95:.35):.85;}
  return playing||hot.visible;
 }
 return{update};
}
