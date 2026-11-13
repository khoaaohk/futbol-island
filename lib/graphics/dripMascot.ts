import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {PlayerRig} from './player';

/**
 * Drip, the DRIP FC mascot (Nov 13 2026, owner: "a big friendly costumed character, an oversized head and body", original design):
 * a water-drop costume worn over a townsperson rig (lib/town/stadiumNpcs.ts 'stadium-mascot-drip'). The drop is one merged mesh in
 * vertex colours (body, white belly, eyes, smile, a gold DRIP FC band) on the rig's root, so the bean's arms and legs still walk,
 * wave and high-five through the shared runtime. 1 draw, no texture, no per-frame work. The rig's profile is 15 % taller and a touch heavier.
 */
export function dressDripMascot(rig:PlayerRig){
 const parts:T.BufferGeometry[]=[];
 const paint=(g:T.BufferGeometry,hex:string)=>{const geo=g.index?g.toNonIndexed():g;if(geo!==g)g.dispose();const c=new T.Color(hex),n=geo.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);geo.setAttribute('color',new T.BufferAttribute(col,3));geo.deleteAttribute('uv');parts.push(geo);return geo;};
 // the drop: a big round bottom and a tapering tip (a lathe profile), 1.25 m tall from the hips
 const prof:T.Vector2[]=[];for(let i=0;i<=14;i++){const t=i/14,a=-Math.PI/2+t*Math.PI*.82;prof.push(new T.Vector2(Math.cos(a)*.62,Math.sin(a)*.62));}
 prof.push(new T.Vector2(.28,.78),new T.Vector2(.1,1.02),new T.Vector2(0,1.12));
 const drop=new T.LatheGeometry(prof,22);drop.translate(0,1.05,0);paint(drop,'#3ea8e0');
 const belly=new T.SphereGeometry(.44,16,10,-Math.PI*.35,Math.PI*.7,Math.PI*.35,Math.PI*.4);belly.translate(0,1.02,.2);paint(belly,'#f4f8fb');
 for(const sx of [-1,1]){const eye=new T.SphereGeometry(.12,10,8);eye.scale(1,1.25,.6);eye.translate(sx*.17,1.42,.53);paint(eye,'#ffffff');
  const pupil=new T.SphereGeometry(.055,8,6);pupil.translate(sx*.16,1.42,.6);paint(pupil,'#1d2b36');}
 const smile=new T.TorusGeometry(.14,.025,6,14,Math.PI);smile.rotateZ(Math.PI);smile.translate(0,1.26,.57);paint(smile,'#1d2b36');
 const band=new T.TorusGeometry(.6,.045,6,28);band.rotateX(Math.PI/2);band.translate(0,.86,0);paint(band,'#e2c766');
 const merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());if(!merged)return null;
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.6});
 const mesh=new T.Mesh(merged,material);mesh.name='drip-mascot-costume';mesh.castShadow=true;rig.root.add(mesh);
 rig.setProfile({height:1.15,build:1.1,legs:1,stride:.9,cadence:.95,lean:1,armSwing:1.2,agility:.9,weight:1.1,crouch:1});
 return {mesh,geometries:[merged],materials:[material as T.Material]};
}
