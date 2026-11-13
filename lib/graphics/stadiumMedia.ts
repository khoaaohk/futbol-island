import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {STADIUM} from '../town/westParkLayout';
import {stadiumMood} from '../town/stadiumMood';
import {STADIUM_BALL,GANTRY_CAMERAS,PHOTO_SPOTS,photoLens,stadiumNpcBudget,STADIUM_NPC_INFO} from '../town/stadiumNpcs';

/**
 * DRIP FC Stadium media and public viewing (Nov 13 2026, owner; cast in lib/town/stadiumNpcs.ts). The live bits only:
 *  - the two broadcast camera heads on the gantry pan towards the stadium match's ball (idle: a slow sweep). 2 draws.
 *  - shutter glints at the photographers' lenses: one Points draw (one shared sprite, additive, no light), a random glint now and
 *    then and a quick burst on a goal or near miss (read from the shared crowd mood, stadiumMood.ts: no events of its own).
 *    None with reduced motion or at heat tier 3+; only for photographers the heat budget shows.
 *  - match cues for Town: a goal (the mascot dances, the bench claps, the public-viewing fans cheer), a near miss (the viewing fans
 *    clap, "ooh"), and a gesture slot for the bench. The public-viewing fans themselves are real townsfolk rigs (stadiumNpcs.ts
 *    VIEWING_CROWD, drawn by lib/graphics/islandNpcs.ts under its heat budget).
 * Heat: everything hides beyond FAR m from the stadium centre and does no work there (one distance check a frame). Near it, a few
 * dozen multiplies a frame; nothing allocates per frame.
 */
const FAR=150;
const PHOTO_RANK=PHOTO_SPOTS.map(p=>Object.keys(STADIUM_NPC_INFO).indexOf(p.id));
export function createStadiumMedia(parent:T.Object3D,phone:boolean){
 const root=new T.Group();root.name='stadium-media';root.visible=false;parent.add(root);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[];
 // ---- camera heads: body + lens + hood, merged, pivot at the pan axis; the lens points along local +z
 const body=new T.BoxGeometry(.34,.34,.6);body.translate(0,.17,-.05);
 const lens=new T.CylinderGeometry(.11,.13,.42,12);lens.rotateX(Math.PI/2);lens.translate(0,.17,.44);
 const hood=new T.BoxGeometry(.3,.06,.3);hood.translate(0,.37,.1);
 const headGeo=mergeGeometries([body.toNonIndexed(),lens.toNonIndexed(),hood.toNonIndexed()])!;[body,lens,hood].forEach(g=>g.dispose());geometries.push(headGeo);
 const headMat=new T.MeshStandardMaterial({color:'#2b3134',roughness:.55,metalness:.2});materials.push(headMat);
 const heads=GANTRY_CAMERAS.map(c=>{const m=new T.Mesh(headGeo,headMat);m.position.set(c.x,c.y-.15,c.z);m.castShadow=false;root.add(m);return m;});
 // ---- shutter glints: one Points draw, colour 0 = off (additive)
 const sprite=document.createElement('canvas');sprite.width=sprite.height=64;{const g=sprite.getContext('2d');if(g){const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,248,220,.85)');r.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}}
 const glintTex=new T.CanvasTexture(sprite);
 const lensAt=PHOTO_SPOTS.map(photoLens),pos=new Float32Array(lensAt.length*3),col=new Float32Array(lensAt.length*3);
 lensAt.forEach((p,i)=>{pos.set([p.x,p.y+.03,p.z],i*3);});
 const glintGeo=new T.BufferGeometry();glintGeo.setAttribute('position',new T.BufferAttribute(pos,3));const colAttr=new T.BufferAttribute(col,3);glintGeo.setAttribute('color',colAttr);geometries.push(glintGeo);
 const glintMat=new T.PointsMaterial({size:.9,map:glintTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});materials.push(glintMat);
 const glints=new T.Points(glintGeo,glintMat);glints.frustumCulled=false;root.add(glints);
 const glint=lensAt.map((_,i)=>({next:2+i*1.7,left:0,burst:0}));
 /** Per-frame cues for Town (reused object): a goal / a near miss just happened; a gesture slot (>= 0) for one bench / official NPC to animate. */
 const cue={goal:false,miss:false,gesture:-1};let gestureIn=6,gestureN=0;
 let clock=0,lastGoal=Infinity,lastMiss=Infinity;const rnd=(()=>{let s=7;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();
 return {root,
  /** ball: the stadium match's ball (world), or null with no match; tier: the heat tier (lib/graphics/heatTier). */
  update(dt:number,player:{x:number;z:number},ball:{x:number;z:number}|null,reduced:boolean,tier:number){
   cue.goal=false;cue.miss=false;cue.gesture=-1;STADIUM_BALL.live=!!ball;if(ball){STADIUM_BALL.x=ball.x;STADIUM_BALL.z=ball.z;}
   const near=Math.hypot(player.x-STADIUM.x,player.z-STADIUM.z)<FAR;if(root.visible!==near)root.visible=near;if(!near)return cue;
   dt=Math.min(Math.max(dt,0),.1);clock+=dt;const mood=stadiumMood();
   // camera heads: ease the pan towards the ball (or a slow sweep), only the yaw changes
   for(let i=0;i<heads.length;i++){const h=heads[i],tx=ball?ball.x:STADIUM.x+Math.sin(clock*.12+i)*25,tz=ball?ball.z:STADIUM.z+Math.cos(clock*.09+i*2)*40;
    const want=Math.atan2(tx-h.position.x,tz-h.position.z),d=Math.atan2(Math.sin(want-h.rotation.y),Math.cos(want-h.rotation.y));h.rotation.y+=d*Math.min(1,dt*(reduced?1:2.2));}
   // glints: random moments, a burst on a goal or a near miss
   const goal=mood.live&&mood.sinceGoal<lastGoal,miss=mood.live&&mood.sinceNearMiss<lastMiss;lastGoal=mood.sinceGoal;lastMiss=mood.sinceNearMiss;
   cue.goal=goal;cue.miss=miss&&!goal;gestureIn-=dt;if(mood.live&&gestureIn<=0&&!reduced){cue.gesture=gestureN++;gestureIn=5+rnd()*6;}
   const cap=stadiumNpcBudget(phone,tier),glintOn=!reduced&&tier<3;let dirty=false;
   for(let i=0;i<glint.length;i++){const g=glint[i],shown=glintOn&&PHOTO_RANK[i]<cap;
    if(shown&&(goal||miss))g.burst=goal?5:2;
    g.next-=dt;if(g.left>0)g.left-=dt;
    if(shown&&g.left<=0&&g.next<=0){g.left=.09;if(g.burst>0){g.burst--;g.next=.16+rnd()*.12;}else g.next=3+rnd()*6;}
    const k=shown&&g.left>0?1:0;if(col[i*3]!==k){col[i*3]=col[i*3+1]=col[i*3+2]=k;dirty=true;}}
   if(dirty)colAttr.needsUpdate=true;return cue;
  },
  dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());glintTex.dispose();}};
}
export type StadiumMedia=ReturnType<typeof createStadiumMedia>;
