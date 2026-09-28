import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {PlayerRig,PlayerMotion} from './player';
import {juggleContact,type JuggleTouch} from '../town/walkBall';
/**
 * One trick program per court freestyler (lib/town/courtFreestylers.ts `freestyle` index), so the four never do the
 * same thing at the same time: each has its own tricks, tempo, arc height, footedness, rests and program length.
 * `rest` = ball trapped on the ground (rig idles); `stall` = ball balanced on the head (rig idles, ball sways).
 * `h` = arc height above the straight line to the next contact; `s` = fixed side (-1 left, 1 right), else alternating.
 */
type Beat={t:JuggleTouch|'rest'|'stall';d:number;h?:number;s?:-1|1};
const foot=(d:number,h:number,s?:-1|1):Beat=>({t:'foot',d,h,s});
const PROGRAMS:readonly (readonly Beat[])[]=[
 // Nico: around the world, always the right foot, with a pause to reset between sets.
 [{t:'rest',d:1.1},foot(.6,.6,1),foot(.55,.55,1),{t:'around-world',d:.8,h:.85,s:1},foot(.55,.5,1),{t:'around-world',d:.8,h:.85,s:1},foot(.5,.5,1),foot(.5,.5,1),{t:'knee',d:.65,h:.55,s:1},foot(.55,.35,1)],
 // Zuri: quick, low alternating keep-ups, both feet, then a short rest.
 [{t:'rest',d:.7},foot(.5,.45),...Array.from({length:10},()=>foot(.4,.3)),{t:'knee',d:.5,h:.35},{t:'knee',d:.5,h:.35},foot(.4,.3),foot(.4,.3),foot(.4,.25)],
 // Kei: high, cushioned knee-to-foot combos.
 [foot(.65,.7,-1),{t:'knee',d:.8,h:.85,s:-1},{t:'knee',d:.8,h:.85,s:1},foot(.65,.6,1),{t:'knee',d:.8,h:.85,s:-1},{t:'knee',d:.8,h:.85,s:-1},foot(.65,.6,-1),foot(.65,.6,1),{t:'knee',d:.8,h:.85,s:1},foot(.6,.4,1),{t:'rest',d:1.3}],
 // Iza: climbs to the head, small head bounces, a head stall, then back down.
 [{t:'rest',d:.9},foot(.7,.9,1),{t:'knee',d:.65,h:.6,s:1},{t:'shoulder',d:.65,h:.45,s:1},{t:'head',d:.5,h:.35},{t:'head',d:.5,h:.35},{t:'head',d:.5,h:.35},{t:'stall',d:1.7},{t:'head',d:.55,h:.4},{t:'shoulder',d:.65,h:.4,s:-1},{t:'knee',d:.65,h:.5,s:-1},foot(.6,.35,-1)],
];
const GROUND={x:.2,y:.19,z:.5};
/** Driven by the existing visible-NPC update only; no extra frame loop. */
export function createCourtFreestyle(rig:PlayerRig,variant:number){
 const paint=(g:T.BufferGeometry,color:string)=>{const c=new T.Color(color),n=g.getAttribute('position').count,colors=new Float32Array(n*3);for(let i=0;i<n;i++)colors.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(colors,3));return g;};
 const parts=[paint(new T.SphereGeometry(.19,12,8),'#fff1d3')];
 for(const p of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){
  const normal=new T.Vector3(...p),patch=paint(new T.CircleGeometry(.061,5),'#294f43');
  patch.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal));patch.translate(p[0]*.188,p[1]*.188,p[2]*.188);parts.push(patch);
 }
 const geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});
 const ball=new T.Mesh(geometry,material);ball.name='freestyle-ball';ball.castShadow=true;rig.root.add(ball);
 const program=PROGRAMS[((variant%PROGRAMS.length)+PROGRAMS.length)%PROGRAMS.length],total=program.reduce((sum,b)=>sum+b.d,0);
 let age=(variant*2.3)%total;
 const motion:PlayerMotion={};
 const side=(i:number)=>program[i].s??(i%2?1:-1) as -1|1;
 const point=(i:number)=>{const b=program[i];return b.t==='rest'?GROUND:juggleContact(b.t==='stall'?'head':b.t,side(i),rig.juggleHead,rig.headTop);};
 return {ball,motion,prepare(dt:number,active:boolean,reduced:boolean){
  if(active&&!reduced)age=(age+dt)%total;
  if(!active||reduced){motion.juggle=undefined;ball.position.set(.28,.2,.36);return;}
  let i=0,t=age;while(t>=program[i].d){t-=program[i].d;i=(i+1)%program.length;}
  const beat=program[i],phase=t/beat.d,next=(i+1)%program.length;
  if(beat.t==='rest'||beat.t==='stall'){
   motion.juggle=undefined;const at=point(i),sway=beat.t==='stall'?Math.sin(age*3.1)*.03:0;
   ball.position.set(at.x+sway,at.y,at.z);ball.rotation.y=beat.t==='stall'?age*.6:ball.rotation.y;return;
  }
  motion.juggle=phase;motion.juggleTouch=beat.t;motion.kickSide=side(i);
  const from=point(i),to=point(next),blend=phase*phase*(3-2*phase),h=beat.h??.5;
  ball.position.set(from.x+(to.x-from.x)*blend,from.y+(to.y-from.y)*phase+4*phase*(1-phase)*h,from.z+(to.z-from.z)*blend);
  ball.rotation.x=age*(1.8+variant*.5);ball.rotation.z=age*(variant%2?1:-1)*.8;
 },dispose(){ball.removeFromParent();geometry.dispose();material.dispose();}};
}
