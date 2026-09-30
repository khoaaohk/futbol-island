/**
 * Pier shooting challenge runtime (Sep 29 2026; rules and teaching in eastPier.ts). One floating target ring off the East Pier's
 * head: a single merged, vertex-coloured mesh (one draw, no shadow), frustum-culled like any mesh, never animated. It is moved
 * only when a shot lands in it, from the ball's existing splash callback (Town.tsx), so it adds no loop, timer or per-frame work.
 * First hit ever: 5 learning coins (learn:explore:east-pier-target, once, never metered). Later hits: a stat and a toast only.
 * Progress (hits, best streak, current spot) is a tiny localStorage save.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {PIER_TARGET_SPOTS,PIER_TARGET_RADIUS,PIER_CHALLENGE_REWARD_ID,scorePierSplash,pierAimYaw,type PierChallengeState} from './eastPier';
import {creditOnce} from '../arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED} from './learnCoins';

export const PIER_CHALLENGE_KEY='fi2-east-pier-challenge-v1';
const SEA_Y=-.43;
function readState():PierChallengeState{
 const blank={spot:0,hits:0,streak:0,best:0};
 try{const raw=JSON.parse(localStorage.getItem(PIER_CHALLENGE_KEY)??'null');if(raw&&Number.isInteger(raw.spot)&&Number.isInteger(raw.hits))return {spot:Math.abs(raw.spot)%PIER_TARGET_SPOTS.length,hits:Math.max(0,raw.hits),streak:0,best:Math.max(0,raw.best|0)};}catch{/* private mode */}
 return blank;
}
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});

function ringGeometry(){
 const paint=(g:T.BufferGeometry,color:string)=>{const c=new T.Color(color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));g.deleteAttribute('uv');return g.index?g.toNonIndexed():g;};
 const parts:T.BufferGeometry[]=[];
 // Eight alternating orange/white arcs of a floating tube ring, lying on the water.
 for(let i=0;i<8;i++){const g=new T.TorusGeometry(PIER_TARGET_RADIUS,.17,6,6,Math.PI/4);g.rotateZ(i*Math.PI/4);g.rotateX(-Math.PI/2);parts.push(paint(g,i%2?'#fff3df':'#ef7d3c'));}
 // A pale inner disc so the target reads from the pier, and a small centre buoy with a flag.
 {const g=new T.CircleGeometry(PIER_TARGET_RADIUS-.15,24);g.rotateX(-Math.PI/2);g.translate(0,.02,0);parts.push(paint(g,'#bfe6de'));}
 {const g=new T.RingGeometry(.9,1.15,24);g.rotateX(-Math.PI/2);g.translate(0,.03,0);parts.push(paint(g,'#ef7d3c'));}
 parts.push(paint(new T.SphereGeometry(.32,10,6,0,Math.PI*2,0,Math.PI/2),'#e0513f'));
 parts.push(paint(new T.CylinderGeometry(.04,.04,1.6,5).translate(0,.8,0),'#294f43'));
 parts.push(paint(new T.BoxGeometry(.03,.42,.62).translate(0,1.36,.31),'#f4cc7c'));
 const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());return merged;
}

export function createPierTarget(scene:T.Scene){
 const state=readState();
 const geometry=ringGeometry(),material=new T.MeshStandardMaterial({vertexColors:true,roughness:.6});
 const mesh=new T.Mesh(geometry,material);mesh.name='east-pier-target';mesh.castShadow=false;mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;
 const place=()=>{const t=PIER_TARGET_SPOTS[state.spot];mesh.position.set(t.x,SEA_Y,t.z);mesh.updateMatrix();};
 place();scene.add(mesh);
 const save=()=>{try{localStorage.setItem(PIER_CHALLENGE_KEY,JSON.stringify({spot:state.spot,hits:state.hits,best:state.best}));}catch{/* the stat is a nicety */}};
 return {
  mesh,state,
  get target(){return PIER_TARGET_SPOTS[state.spot];},
  /** Tap-shot aim help toward the ring from the head (eastPier.ts pierAimYaw); null = leave the shot alone. */
  aim:(kicker:{x:number;z:number},yaw:number)=>pierAimYaw(state,kicker,yaw),
  /** Called from the ball's splash. Returns the toast text ('' when this splash has nothing to do with the pier). */
  splash(x:number,z:number,kicker:{x:number;z:number}):string{
   const result=scorePierSplash(state,{x,z},kicker);if(!result.message)return '';
   if(result.hit){place();save();void learnCoins.pay('explore',PIER_CHALLENGE_REWARD_ID,'You hit the Jetty Shooting Challenge ring');}
   return result.message;
  },
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();},
 };
}
