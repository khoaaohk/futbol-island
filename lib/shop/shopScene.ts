import * as T from 'three';
import {wearBackpack} from '@/lib/graphics/backpack';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createPlayer,profileFor,type PlayerMotion,type PlayerRig} from '../graphics/player';
import {loadCustomization,beanLookFor,playerOutfit} from '../town/customization';
import {getQuizProgress} from '../town/quizProgress';
import {npcDress} from '../town/beanLooks';
import {AGE_PROFILES} from '../town/townsfolkCast';
import {createStuckWatch} from '../konbini/konbiniPath';
import {frameCapSlot} from '../town/frameCap';
import {tierSettings} from '../graphics/heatTier';
import {ROOM,DOOR,COUNTER,CLERK,CLERK_ZONE,PODIUMS,BENCH,PLANTS,SHOP_STATIONS,shopObstacles,shopBlocked,shopCollide,findShopPath,stationPois,clerkPoi,segPoint,
 NEAR_STATION,NEAR_NPC,type ShopPoi,type ShopStation} from './shopLayout';
import type {NpcDefinition} from '../town/npcDialogues';
import {SHOP_CLERK,SHOP_SHOPPERS,SHOP_SHOPPER_CAP,type ShopSpot} from './shopCast';
import {emoteBody,applyEmoteArms} from '../graphics/emotePose';
import {emoteSeconds} from '../town/emoteReact';
import type {EmoteBubbles} from '../graphics/emoteBubbles';
// Party in the Kit Shop (docs/multiplayer-rooms-design.md Phase 4): the scene only talks to the hooks seam; with no layer attached
// (flag off, no party) frame() is false, pushOut() moves nothing and nothing below runs.
import {shopRoomHooks,type ShopHookSource,type ShopLocalPose} from '../multiplayer/rooms/shopHooks';
import {shopCrowdCount} from '../multiplayer/rooms/shop';
/** Remote-only frames (a friend walks while you stand still) run at <= 20 fps: the shop's npc-only rate. */
export const SHOP_REMOTE_FRAME_MS=50;
export type {ShopStation,ShopPoi} from './shopLayout';
export {SHOP_STATIONS} from './shopLayout';

/**
 * The walk-in Kit Shop interior (Oct 12 2026; users: "when you walk in, you can see a store with different walls with futbol
 * jerseys and boots", "make the shop more modern looking", then "for the boots store, player should be able to walk inside. there
 * should be npcs here along with clerk"). A modern kit store: pale concrete floor, white walls, backlit display niches of jerseys
 * (Jersey studio), a lightbox wall of boots on floating shelves (Boot studio), a wall of ball cubbies (Ball studio), a central
 * island counter with the clerk behind it, orange LED accents and clean station signage. Floor plan: lib/shop/shopLayout.ts.
 *
 * Walking is the Museum's recipe (lib/museum/museumScene.ts): your own character (createPlayer + your customisation) walks with
 * WASD / arrows or the joystick (setStick), a tap walks you to a wall, a person or a floor spot (grid A*, a stuck watch so a
 * blocked tap always gives up), box collision, glass doors that slide as you come and go, and walking out of the doors calls
 * onExit. The camera keeps the shop's perspective view from the front and follows you (eased, clamped to the room).
 *
 * People (lib/shop/shopCast.ts): the clerk at the till and five shoppers on the island's townsfolk rig and bean looks. Heat: a
 * shopper holds still at a display (NO posing while still) and walks to its next display one at a time, with a 12 s rest between
 * walks (so an untouched shop is still most of the time); far walkers pose at
 * 15 Hz (the island's far-pose rule, phase-spread) while their root glides every frame; a person only re-poses while walking,
 * turning, waving or settling. One instanced blob shadow for everyone, no shadow maps.
 *
 * Heat recipe kept from the diorama: every solid thing is ONE merged vertex-coloured Lambert mesh, the display jerseys ONE mesh on
 * one atlas, every glowing thing ONE unlit mesh, all the lettering ONE unlit mesh: 4 room draws (+ the glass doors, the blob
 * shadows, the held boot and, near a station, its floor ring). Nothing renders at rest: frames run while you walk, the camera
 * settles, a door slides or a person moves; when only the shoppers move the loop drops to 20 fps; a still room schedules no
 * frame at all (the next shopper's walk is a timer, not a loop). Phones: the heat tier's pixel-ratio cap (≤ 1.5) and 30 fps.
 * Idle rest (Oct 13 2026, heat audit): after IDLE_REST s with no input from you the shoppers stop starting walks (one already
 * walking finishes its leg), no walk timer is set, and the room reaches 0 rAF like the Museum; any input (a key, the stick, a tap,
 * a studio or chat closing, a tap anywhere on the room's UI through poke()) wakes it and they resume.
 * setCovered (a studio, My kit or a chat) stops everything; dispose() frees every geometry, material, texture and the context.
 */
export type ShopSceneState={sleeping:boolean;resting:boolean;frames:number;draws:number;covered:boolean;leaving:boolean;x:number;z:number;yaw:number;near:string|null;doorOpen:number;
 npcs:{id:string;name:string;x:number;z:number;mode:'hold'|'walk';clerk:boolean}[];poses:number;
 render:{calls:number;triangles:number;geometries:number;textures:number};pixelRatio:number;frameMs:number;
 /** Party (rooms Phase 4): remote-only frames, your emote, shoppers stepped out for friends, the friend layer (null: no party). */
 remoteOnly:boolean;remoteFrames:number;emote:number;shoppersOut:number;party:{shown:number;meRing:boolean;friends:unknown[]}|null};
export type ShopSceneCallbacks={onFirstFrame?:()=>void;onNear?:(poi:ShopPoi|null)=>void;onPrompt?:(x:number,y:number,visible:boolean)=>void;onArrive?:(poi:ShopPoi)=>void;onExit?:()=>void};

/** Modern store palette. */
const P={floor:'#dedbd4',floorDark:'#cbc7bf',joint:'#c9c5bc',wall:'#f7f6f3',wallLow:'#e9e7e2',graphite:'#2a2f34',white:'#fbfbf9',
 wood:'#dcc7a5',woodDark:'#c9b08a',accent:'#ef5a2f',navy:'#1f2a44',glow:'#fff7ea',glowCool:'#f3f8ff',screen:'#1b2026'} as const;
/** Original island kits only (no real clubs): base, second, accent, pattern, crest initials, number. */
const KITS:[string,string,string,string,string,number][]=[
 ['#ef5a2f','#fbfbf9','#1f2a44','stripes','FI',10],['#2a5bd7','#f2c230','#fbfbf9','hoops','PC',7],['#fbfbf9','#1f8a5b','#1f2a44','sash','CG',4],
 ['#1f2a44','#ef5a2f','#fbfbf9','halves','OT',9],['#f2c230','#1f2a44','#1f2a44','chevron','SB',11],['#1f8a5b','#fbfbf9','#f2c230','quarters','EP',6],
 ['#7b4fd6','#fbfbf9','#f2c230','checkers','CC',8],['#e4322b','#2a1a3a','#fbfbf9','fade','IH',1],
];
/** Display boots: upper, sole, accent. */
const BOOTS:[string,string,string][]=[
 ['#ef5a2f','#1f2a44','#fbfbf9'],['#fbfbf9','#2a5bd7','#ef5a2f'],['#1f2a44','#f2c230','#f2c230'],['#35c46a','#22272b','#fbfbf9'],
 ['#2a5bd7','#fbfbf9','#f2c230'],['#f2c230','#22272b','#ef5a2f'],['#22272b','#ef5a2f','#ef5a2f'],['#e4322b','#fbfbf9','#22272b'],
 ['#fbfbf9','#22272b','#35c46a'],['#7b4fd6','#f2c230','#fbfbf9'],['#9fd8f0','#1f2a44','#ef5a2f'],['#f7a8c8','#fbfbf9','#7b4fd6'],
 ['#c9ccce','#ef5a2f','#1f2a44'],['#1f8a5b','#f2c230','#fbfbf9'],['#ff9d2e','#22272b','#fbfbf9'],['#22272b','#fbfbf9','#2a5bd7'],
];
/** Ball cubbies: base, patch. */
const BALLS:[string,string][]=[['#fbfbf9','#1d1d1b'],['#ef5a2f','#1f2a44'],['#f2c230','#1f2a44'],['#fbfbf9','#2a5bd7'],['#35c46a','#fbfbf9'],
 ['#1f2a44','#f2c230'],['#fbfbf9','#e4322b'],['#7b4fd6','#fbfbf9'],['#fbfbf9','#1f8a5b'],['#ff9d2e','#fbfbf9'],['#e8e2d0','#7a4a2a'],['#9fd8f0','#1f2a44'],
 ['#fbfbf9','#ef5a2f'],['#22272b','#fbfbf9'],['#f7a8c8','#7b4fd6']];

const JERSEY_OUTLINE:[number,number][]=[[-.22,.85],[-.5,.8],[-.8,.55],[-.63,.3],[-.47,.43],[-.46,-.85],[.46,-.85],[.47,.43],[.63,.3],[.8,.55],[.5,.8],[.22,.85],[0,.66]];
const BOOT_OUTLINE:[number,number][]=[[-.5,0],[.47,0],[.53,.07],[.42,.19],[.06,.29],[-.17,.47],[-.44,.5],[-.53,.3]];
const shapeOf=(pts:[number,number][])=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};
/** Far walkers pose at this rate (the island's FAR_POSE rule, lib/graphics/islandNpcs.ts), within NEAR_POSE metres every frame. */
const POSE_HZ=15,NEAR_POSE=4;

export function createShopScene(canvas:HTMLCanvasElement,callbacks:ShopSceneCallbacks={}){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 const pixelRatio=()=>Math.min(devicePixelRatio||1,mobile?Math.min(1.5,tierSettings().maxPixelRatio):Math.min(2,tierSettings().maxPixelRatio));
 renderer.setPixelRatio(pixelRatio());renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color('#f4f2ed');
 const camera=new T.PerspectiveCamera(40,1,.1,80);
 scene.add(new T.HemisphereLight('#ffffff','#ddd7cc',2.1));const sun=new T.DirectionalLight('#fff4e4',1.05);sun.position.set(-4,9,8);scene.add(sun);

 // ---- Builders -----------------------------------------------------------------------------------------------------------------
 const solid:T.BufferGeometry[]=[],glow:T.BufferGeometry[]=[],kit:T.BufferGeometry[]=[],print:T.BufferGeometry[]=[];
 const color=new T.Color(),c2=new T.Color(),m=new T.Matrix4(),q=new T.Quaternion(),euler=new T.Euler(),v=new T.Vector3(),sv=new T.Vector3();
 type Place={x?:number;y?:number;z?:number;rx?:number;ry?:number;rz?:number;s?:number;sx?:number;sy?:number;sz?:number;parent?:T.Matrix4};
 function place(geo:T.BufferGeometry,{x=0,y=0,z=0,rx=0,ry=0,rz=0,s=1,sx=s,sy=s,sz=s,parent}:Place){
  const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();
  euler.set(rx,ry,rz);q.setFromEuler(euler);m.compose(v.set(x,y,z),q,sv.set(sx,sy,sz));if(parent)m.premultiply(parent);g.applyMatrix4(m);return g;
 }
 /** Vertex colour, optionally a vertical (or depth) gradient: lighting baked into the paint. */
 function paint(g:T.BufferGeometry,hex:string,low?:string,axis:'x'|'y'|'z'='y',range:[number,number]=[0,ROOM.h]){
  const pos=g.getAttribute('position'),n=pos.count,a=new Float32Array(n*3);color.set(hex);if(low)c2.set(low);
  for(let i=0;i<n;i++){let r=color.r,gg=color.g,b=color.b;if(low){const t=T.MathUtils.clamp(((axis==='y'?pos.getY(i):axis==='x'?pos.getX(i):pos.getZ(i))-range[0])/(range[1]-range[0]),0,1);r=c2.r+(color.r-c2.r)*t;gg=c2.g+(color.g-c2.g)*t;b=c2.b+(color.b-c2.b)*t;}a[i*3]=r;a[i*3+1]=gg;a[i*3+2]=b;}
  g.setAttribute('color',new T.BufferAttribute(a,3));return g;
 }
 const box=(w:number,h:number,d:number,hex:string,p:Place,low?:string,axis?:'x'|'y'|'z',range?:[number,number])=>{const g=paint(place(new T.BoxGeometry(w,h,d),p),hex,low,axis,range);g.deleteAttribute('uv');solid.push(g);return g;};
 const lit=(geo:T.BufferGeometry,hex:string,p:Place)=>{const g=paint(place(geo,p),hex);g.deleteAttribute('uv');solid.push(g);return g;};
 const shine=(geo:T.BufferGeometry,hex:string,p:Place)=>{const g=paint(place(geo,p),hex);g.deleteAttribute('uv');g.deleteAttribute('normal');glow.push(g);return g;};

 // ---- Room shell: concrete floor (darker toward the walls), white walls (lighter toward the top), graphite base and caps.
 box(ROOM.halfW*2,.2,ROOM.front-ROOM.back,P.floor,{y:-.1,z:(ROOM.front+ROOM.back)/2});
 for(let x=-ROOM.halfW+2;x<ROOM.halfW;x+=2)box(.025,.012,ROOM.front-ROOM.back,P.joint,{x,y:.006,z:(ROOM.front+ROOM.back)/2});
 for(let z=ROOM.back+2;z<ROOM.front;z+=2)box(ROOM.halfW*2,.012,.025,P.joint,{y:.006,z});
 // Baked contact light: the floor darkens into the walls (soft gradients, no shadow maps).
 box(ROOM.halfW*2,.008,1.1,P.floor,{y:.004,z:ROOM.back+.55},P.floorDark,'z',[ROOM.back,ROOM.back+1.1]);
 box(1,.008,ROOM.front-ROOM.back-1.1,P.floor,{x:-ROOM.halfW+.5,y:.005,z:(ROOM.front+ROOM.back+1.1)/2},P.floorDark,'x',[-ROOM.halfW,-ROOM.halfW+1]);
 box(1,.008,ROOM.front-ROOM.back-1.1,P.floorDark,{x:ROOM.halfW-.5,y:.005,z:(ROOM.front+ROOM.back+1.1)/2},P.floor,'x',[ROOM.halfW-1,ROOM.halfW]);
 box(ROOM.halfW*2+.6,ROOM.h,.3,P.wall,{y:ROOM.h/2,z:ROOM.back-.15},P.wallLow);
 for(const sx of [-1,1]){box(.3,ROOM.h,ROOM.front-ROOM.back,P.wall,{x:sx*(ROOM.halfW+.15),y:ROOM.h/2,z:(ROOM.front+ROOM.back)/2},P.wallLow);
  box(.34,.1,ROOM.front-ROOM.back+.3,P.graphite,{x:sx*(ROOM.halfW+.15),y:ROOM.h+.05,z:(ROOM.front+ROOM.back)/2});
  box(.04,.14,ROOM.front-ROOM.back,P.graphite,{x:sx*(ROOM.halfW-.02),y:.07,z:(ROOM.front+ROOM.back)/2});}
 box(ROOM.halfW*2+.6,.1,.34,P.graphite,{y:ROOM.h+.05,z:ROOM.back-.15});
 box(ROOM.halfW*2,.14,.04,P.graphite,{y:.07,z:ROOM.back+.02});
 // Back-wall divider between the jersey and boot walls: an orange LED blade, floor to top.
 shine(new T.BoxGeometry(.16,ROOM.h-.3,.05),P.accent,{x:0,y:(ROOM.h-.3)/2+.15,z:ROOM.back+.03});
 // Shopfront (the room grew 1.5 m toward the street for it): a low white sill either side of the glass doors, graphite posts
 // and an entrance mat. The camera looks in over the sill, like the Museum's and the Konbini's fronts.
 const doorL=DOOR.x-DOOR.half-.05,doorR=DOOR.x+DOOR.half+.05;
 box(doorL+ROOM.halfW+.3,.5,.18,P.wall,{x:(doorL-ROOM.halfW-.3)/2,y:.25,z:ROOM.front+.05},P.wallLow);box(ROOM.halfW+.3-doorR,.5,.18,P.wall,{x:(doorR+ROOM.halfW+.3)/2,y:.25,z:ROOM.front+.05},P.wallLow);
 for(const px of [-ROOM.halfW-.15,doorL,doorR,ROOM.halfW+.15])box(.14,1.1,.16,P.graphite,{x:px,y:.55,z:ROOM.front+.05});
 shine(new T.BoxGeometry(doorL+ROOM.halfW,.03,.04),P.accent,{x:(doorL-ROOM.halfW)/2,y:.47,z:ROOM.front+.15});shine(new T.BoxGeometry(ROOM.halfW-doorR,.03,.04),P.accent,{x:(doorR+ROOM.halfW)/2,y:.47,z:ROOM.front+.15});
 box(3.2,.02,1.2,'#8a8f94',{x:0,y:.01,z:ROOM.front-.8});box(2.6,.012,.36,P.joint,{x:0,y:.016,z:ROOM.front+.05});

 // ---- Jersey studio: six backlit niches (3 × 2) on the back wall's west half, each with a hanging jersey.
 const nicheW=2,nicheH=1.5,cols=[-6.3,-4,-1.7],rows=[1.45,3.15];
 let k=0;
 for(const y of rows)for(const x of cols){
  shine(new T.PlaneGeometry(nicheW-.12,nicheH-.12),P.glow,{x,y,z:ROOM.back+.02});
  for(const [w,h,dx,dy] of [[nicheW,.1,0,nicheH/2],[nicheW,.1,0,-nicheH/2],[.1,nicheH,-nicheW/2,0],[.1,nicheH,nicheW/2,0]] as const)box(w,h,.3,P.white,{x:x+dx,y:y+dy,z:ROOM.back+.15});
  shine(new T.BoxGeometry(nicheW-.2,.03,.04),P.accent,{x,y:y-nicheH/2+.07,z:ROOM.back+.29});
  jersey(x,y+.02,ROOM.back+.16,.76,k++);
  box(.03,.2,.03,'#b9bcbe',{x,y:y+.73,z:ROOM.back+.16});
 }
 // ---- Boot studio: a lightbox wall on the east half with four floating shelves of boots.
 shine(new T.PlaneGeometry(7,3.3),P.glowCool,{x:3.95,y:2.12,z:ROOM.back+.02});
 for(const [w,h,dx,dy] of [[7.2,.1,0,1.7],[7.2,.1,0,-1.7],[.1,3.5,-3.55,0],[.1,3.5,3.55,0]] as const)box(w,h,.25,P.white,{x:3.95+dx,y:2.12+dy,z:ROOM.back+.12});
 [.82,1.57,2.32,3.07].forEach((y,shelf)=>{
  box(6.5,.06,.5,P.white,{x:3.95,y,z:ROOM.back+.3});
  shine(new T.BoxGeometry(6.3,.02,.04),P.accent,{x:3.95,y:y-.04,z:ROOM.back+.53});
  for(let i=0;i<4;i++)boot(1.5+i*1.62,y+.03,ROOM.back+.3,.78,.35,BOOTS[shelf*4+i]);
 });
 // ---- Ball studio: fifteen cubbies (5 × 3) on the east wall, each backlit with one ball.
 const cubbyZ=[-5.6,-4.3,-3,-1.7,-.4],cubbyY=[1.05,2.05,3.05];let b=0;
 for(const y of cubbyY)for(const z of cubbyZ){
  shine(new T.PlaneGeometry(1.08,.82),P.glow,{x:ROOM.halfW-.02,y,z,ry:-Math.PI/2});
  box(.5,.06,1.2,P.white,{x:ROOM.halfW-.25,y:y-.44,z});
  for(const dz of [-.6,.6])box(.5,.94,.06,P.white,{x:ROOM.halfW-.25,y,z:z+dz});
  ball(ROOM.halfW-.42,y-.11,z,.29,BALLS[b++]);
 }
 box(.5,.06,6.6,P.white,{x:ROOM.halfW-.25,y:cubbyY[2]+.47,z:-3});
 shine(new T.BoxGeometry(.04,.02,6.4),P.accent,{x:ROOM.halfW-.5,y:cubbyY[0]-.49,z:-3});
 // ---- West wall: folded-shirt shelves (colour stacks) under the big KIT SHOP wordmark.
 [.85,1.55,2.25].forEach((y,row)=>{box(.42,.05,5.4,P.white,{x:-ROOM.halfW+.21,y,z:-3.4});
  shine(new T.BoxGeometry(.03,.02,5.2),P.accent,{x:-ROOM.halfW+.42,y:y-.035,z:-3.4});
  for(let i=0;i<6;i++){const kitc=KITS[(i+row*3)%KITS.length];for(let s=0;s<3;s++)box(.36,.07,.62,s===1?kitc[1]:kitc[0],{x:-ROOM.halfW+.22,y:y+.06+s*.075,z:-5.6+i*.88});}
 });
 // ---- Central island counter: white body, pale wood top, LED under the lip, folded stacks, a ball stand and the till. The clerk
 // stands behind it in a closed corner: two low side panels and a back cabinet with boot boxes (one collision box, shopLayout.ts).
 const cz=COUNTER.z;
 box(COUNTER.w,.9,COUNTER.d,P.white,{x:COUNTER.x,y:.45,z:cz},P.wallLow);
 box(COUNTER.w+.2,.08,COUNTER.d+.2,P.wood,{x:COUNTER.x,y:.94,z:cz});
 shine(new T.BoxGeometry(COUNTER.w-.1,.03,.04),P.accent,{x:COUNTER.x,y:.86,z:cz+COUNTER.d/2+.09});
 for(const [i,dx] of [[0,-1.3],[1,-.65],[4,.95]] as const)for(let s=0;s<4;s++)box(.5,.06,.4,s%2?KITS[i][1]:KITS[i][0],{x:dx,y:1.01+s*.065,z:cz-.05});
 lit(new T.CylinderGeometry(.12,.16,.16,16),P.graphite,{x:.15,y:1.06,z:cz-.05});ball(.15,1.36,cz-.05,.21,BALLS[0]);
 box(.5,.34,.04,P.screen,{x:1.6,y:1.16,z:cz-.35,rx:-.25});
 for(const sx of [-1,1])box(.1,1,cz-COUNTER.d/2-CLERK_ZONE.minZ,P.white,{x:sx*(CLERK_ZONE.maxX-.05),y:.5,z:(CLERK_ZONE.minZ+cz-COUNTER.d/2)/2},P.wallLow);
 box(CLERK_ZONE.maxX-CLERK_ZONE.minX,1.15,.32,P.white,{x:0,y:.575,z:CLERK_ZONE.minZ+.16},P.wallLow);box(CLERK_ZONE.maxX-CLERK_ZONE.minX+.06,.05,.38,P.wood,{x:0,y:1.175,z:CLERK_ZONE.minZ+.16});
 for(let i=0;i<6;i++){const bx=-1.6+i*.64,hgt=.2;box(.5,hgt,.3,i%2?P.graphite:P.accent,{x:bx,y:1.2+hgt/2,z:CLERK_ZONE.minZ+.16});box(.52,.03,.32,P.white,{x:bx,y:1.2+hgt+.015,z:CLERK_ZONE.minZ+.16});
  if(i%3===1){box(.5,hgt,.3,P.navy,{x:bx,y:1.4+hgt/2+.03,z:CLERK_ZONE.minZ+.16});}}
 // ---- A low try-on bench and two tall plants by the entrance.
 box(BENCH.w-.1,.42,BENCH.d-.08,P.white,{x:BENCH.x,y:.21,z:BENCH.z},P.wallLow);box(BENCH.w,.06,BENCH.d,P.wood,{x:BENCH.x,y:.45,z:BENCH.z});
 for(const [px,pz] of PLANTS){lit(new T.CylinderGeometry(.34,.28,.7,16),P.graphite,{x:px,y:.35,z:pz});
  for(const [dx,dy,dz,r] of [[0,1.15,0,.48],[.18,1.55,.1,.36],[-.16,1.45,-.12,.34]] as const)lit(new T.IcosahedronGeometry(r,1),'#5f8d5a',{x:px+dx,y:dy,z:pz+dz});}
 // ---- Station podiums: white plinths with a tilted screen and an orange floor ring.
 /** Each podium turns to face the shop's front (where you come in). */
 const podiumFrame=(s:ShopStation)=>{const p=PODIUMS[s];return new T.Matrix4().compose(new T.Vector3(p.x,0,p.z),new T.Quaternion().setFromEuler(new T.Euler(0,Math.atan2(-p.x,11-p.z),0)),new T.Vector3(1,1,1));};
 for(const s of SHOP_STATIONS){const p=PODIUMS[s],parent=podiumFrame(s);
  box(.9,1,.7,P.white,{y:.5,parent},P.wallLow);
  box(.84,.05,.56,P.graphite,{y:1.03,rx:.35,parent});
  shine(new T.RingGeometry(.95,1.05,48),P.accent,{x:p.x,y:.012,z:p.z,rx:-Math.PI/2});
 }

 // ---- Jersey + boot + ball parts (called above).
 function jersey(x:number,y:number,z:number,s:number,i:number){
  const g=new T.ExtrudeGeometry(shapeOf(JERSEY_OUTLINE),{depth:.05,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:1});
  // Map the front onto atlas tile i (4 × 2 tiles of 256²): u,v from the outline's box, so the painted silhouette lines up.
  const uv=g.getAttribute('uv'),pos=g.getAttribute('position'),tx=(i%4)*.25,ty=1-Math.floor(i/4)*.5;
  for(let n=0;n<uv.count;n++)uv.setXY(n,tx+T.MathUtils.clamp((pos.getX(n)+.82)/1.64,0,1)*.25,ty-.5+T.MathUtils.clamp((pos.getY(n)+.87)/1.74,0,1)*.5);
  kit.push(place(g,{x,y,z,s}));
 }
 function boot(x:number,y:number,z:number,s:number,yaw:number,[upper,sole,accent]:[string,string,string]){
  const parent=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,yaw,0)),new T.Vector3(s,s,s));
  lit(new T.ExtrudeGeometry(shapeOf(BOOT_OUTLINE),{depth:.3,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:4}).translate(0,.06,-.15),upper,{parent});
  lit(new T.BoxGeometry(1.04,.07,.36),sole,{y:.035,parent});
  for(const sx of [-.38,-.22,.14,.3])for(const sz of [-.11,.11])lit(new T.BoxGeometry(.06,.06,.06),sole,{x:sx,y:-.02,z:sz,parent});
  lit(new T.BoxGeometry(.5,.06,.38),accent,{x:.02,y:.2,rz:.32,parent});
  for(const lx of [-.06,.06,.18])lit(new T.BoxGeometry(.04,.025,.2),P.white,{x:lx,y:.36-lx*.55,parent});
 }
 function ball(x:number,y:number,z:number,r:number,[base,patch]:[string,string]){
  lit(new T.IcosahedronGeometry(r,2),base,{x,y,z});
  const ico=new T.IcosahedronGeometry(1,0),p=ico.getAttribute('position'),seen:T.Vector3[]=[],up=new T.Vector3(0,1,0);
  for(let i=0;i<p.count;i++){const d=new T.Vector3().fromBufferAttribute(p,i).normalize();if(seen.some(o=>o.distanceTo(d)<.01))continue;seen.push(d);
   const rot=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(up,d));
   lit(new T.CylinderGeometry(r*.33,r*.33,r*.08,5),patch,{x:x+d.x*r*.97,y:y+d.y*r*.97,z:z+d.z*r*.97,rx:rot.x,ry:rot.y,rz:rot.z});}
  ico.dispose();
 }


 // ---- Atlases: the jersey prints (lit) and the signage (unlit).
 const kitCanvas=paintKitAtlas(),signCanvas=paintSignAtlas();
 const kitTex=new T.CanvasTexture(kitCanvas);kitTex.colorSpace=T.SRGBColorSpace;kitTex.anisotropy=4;
 const signTex=new T.CanvasTexture(signCanvas);signTex.colorSpace=T.SRGBColorSpace;signTex.anisotropy=4;
 /** A plane showing atlas rect (px,py,pw,ph) of the 1024×512 sign canvas. */
 function sign(rect:readonly [number,number,number,number],width:number,p:Place){
  const [px,py,pw,ph]=rect,g=new T.PlaneGeometry(width,width*ph/pw),uv=g.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setXY(i,(px+uv.getX(i)*pw)/1024,1-(py+(1-uv.getY(i))*ph)/512);
  print.push(place(g,p));
 }
 sign(SIGN.jersey,4.4,{x:-4,y:4.12,z:ROOM.back+.03});
 sign(SIGN.boots,4.4,{x:3.95,y:4.12,z:ROOM.back+.03});
 sign(SIGN.ball,3.8,{x:ROOM.halfW-.03,y:3.95,z:-3,ry:-Math.PI/2});
 sign(SIGN.logo,5.2,{x:-ROOM.halfW+.03,y:3.95,z:-3.4,ry:Math.PI/2});
 sign(SIGN.tagline,4.4,{x:-ROOM.halfW+.03,y:3.25,z:-3.4,ry:Math.PI/2});
 // Podium screens lie on the tilted graphite top (normal 0, .94, .34 before the podium's turn).
 for(const s of SHOP_STATIONS)sign(SIGN[`${s}Screen` as const],.74,{y:1.03+.03*.94,z:.03*.34,rx:-Math.PI/2+.35,parent:podiumFrame(s)});
 sign(SIGN.till,.44,{x:1.6,y:1.165,z:COUNTER.z-.325,rx:-.25});

 // ---- The boot a shopper holds up: one small boot from the same builder, its own (hidden until held) mesh.
 const propFrom=solid.length;boot(0,0,0,.42,0,BOOTS[3]);const propParts=solid.splice(propFrom);

 // ---- Merge into the four room draws.
 const solidMat=new T.MeshLambertMaterial({vertexColors:true});
 const kitMat=new T.MeshLambertMaterial({map:kitTex});
 const glowMat=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});
 const printMat=new T.MeshBasicMaterial({map:signTex,alphaTest:.5,toneMapped:false});
 const merged:T.Mesh[]=[];
 for(const [list,mat,name] of [[solid,solidMat,'shop-solid'],[kit,kitMat,'shop-kits'],[glow,glowMat,'shop-glow'],[print,printMat,'shop-print']] as const){
  const g=mergeGeometries(list as T.BufferGeometry[]);list.forEach(x=>x.dispose());if(!g)continue;g.computeBoundingSphere();
  const mesh=new T.Mesh(g,mat);mesh.name=name;mesh.matrixAutoUpdate=false;scene.add(mesh);merged.push(mesh);
 }
 const propGeo=mergeGeometries(propParts)!;propParts.forEach(g=>g.dispose());propGeo.center();
 const heldBoot=new T.Mesh(propGeo,solidMat);heldBoot.name='shop-held-boot';heldBoot.visible=false;scene.add(heldBoot);
 // Station ring: one small extra mesh under the podium you are standing at.
 const ringMat=new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 const stationRing=new T.Mesh(new T.RingGeometry(1.08,1.2,48),ringMat);stationRing.rotation.x=-Math.PI/2;stationRing.position.y=.015;stationRing.visible=false;stationRing.name='shop-station-ring';scene.add(stationRing);
 // Glass doors: one 2-instance mesh that slides open as you come and go (the Museum's doors).
 const glassMat=new T.MeshBasicMaterial({color:'#dff1f5',transparent:true,opacity:.3,depthWrite:false});
 const doorGeo=new T.BoxGeometry(DOOR.half-.04,2.2,.05),doors=new T.InstancedMesh(doorGeo,glassMat,2);doors.frustumCulled=false;doors.renderOrder=2;doors.name='shop-doors';scene.add(doors);
 const doorFrame=new T.Object3D();let doorOpen=1,doorTarget=1;
 function placeDoors(){for(let i=0;i<2;i++){const s=i?1:-1;doorFrame.position.set(DOOR.x+s*(DOOR.half/2+doorOpen*(DOOR.half-.1)),1.15,ROOM.front+.05);doorFrame.updateMatrix();doors.setMatrixAt(i,doorFrame.matrix);}doors.instanceMatrix.needsUpdate=true;}
 placeDoors();

 // ---- People: you, the clerk and the shoppers (the island's townsfolk rig and bean looks) -----------------------------------
 const shopperDefs=SHOP_SHOPPERS.slice(0,SHOP_SHOPPER_CAP),people=2+shopperDefs.length;
 const shadowGeo=new T.CircleGeometry(1,20);shadowGeo.rotateX(-Math.PI/2);
 const shadowMat=new T.MeshBasicMaterial({color:'#2a2722',transparent:true,opacity:.16,depthWrite:false});
 const shadows=new T.InstancedMesh(shadowGeo,shadowMat,people);shadows.frustumCulled=false;shadows.renderOrder=1;shadows.name='shop-blob-shadows';scene.add(shadows);
 const so=new T.Object3D();
 function placeShadow(i:number,px:number,pz:number,s:number){so.position.set(px,.02,pz);so.scale.set(s,1,s*.75);so.updateMatrix();shadows.setMatrixAt(i,so.matrix);shadows.instanceMatrix.needsUpdate=true;}
 const progress=getQuizProgress(),custom=loadCustomization(progress.completed,progress.total);
 const player=createPlayer('you','home',true,true);player.setAppearance(custom);player.setBeanLook(beanLookFor(custom),playerOutfit(custom));const pack=wearBackpack(player.root,playerOutfit(custom));/* Oct 21 2026: the always-worn pack, folded (docs/backpack.md) */player.root.name='shop-player';scene.add(player.root);
 type Actor={id:string;name:string;rig:PlayerRig;clerk:boolean;spots:ShopSpot[];spot:number;x:number;z:number;facing:number;mode:'hold'|'walk';holdUntil:number;speed:number;
  motion:PlayerMotion;settle:number;wave:number;nearYou:boolean;elapsed:number;bucket:number;slot:number;leader:Actor|null;follower:Actor|null;height:number;expr:string;shadow:number;poi:ShopPoi|null;
  /** Stepped out for a party friend (rooms Phase 4: friends replace shoppers): hidden, not posed, not solid, not a prompt. */
  away:boolean};
 let rngSeed=1234567;const rand=()=>{rngSeed=(rngSeed*16807)%2147483647;return rngSeed/2147483647;};
 const clock=()=>performance.now()/1000,born=clock();
 function makeActor(def:NpcDefinition,top:string,top2:string,age:'kid'|'teen'|'adult'|'elder',spots:ShopSpot[],clerk:boolean,i:number):Actor{
  const rig=createPlayer(def.id,'neutral',true,true);rig.setProfile(age==='adult'?profileFor('npc',37+i):AGE_PROFILES[age]);
  const d=npcDress(def);if(clerk){d.look.headwear='cap';d.look.headwearColor=P.accent;d.look.headwearColor2=P.navy;}rig.setBeanLook(d.look,{...d.outfit,shirt:top,shirt2:top2});
  rig.root.name=`shop-npc-${def.id}`;scene.add(rig.root);
  const s=spots[0],a:Actor={id:def.id,name:def.name,rig,clerk,spots,spot:0,x:s.x,z:s.z,facing:s.yaw,mode:'hold',holdUntil:clerk?Infinity:born+5+i*4+rand()*2,speed:age==='kid'?.95:age==='elder'?.7:.85,
   motion:{travelMode:'walk',facing:s.yaw,lookX:s.look.x,lookY:s.look.y,lookZ:s.look.z,ready:clerk?.15:0},settle:0,wave:0,nearYou:false,elapsed:0,bucket:-1,slot:(i*.618034)%1/POSE_HZ,leader:null,follower:null,
   height:1.8*rig.profileScale,expr:'neutral',shadow:i+1,poi:null,away:false};
  if(s.holdBoot)a.motion.called=1;
  rig.update(s.x,s.z,0,0,reduced,{...a.motion,resumePose:true});placeShadow(a.shadow,s.x,s.z,.4*rig.profileScale);
  return a;
 }
 const clerk=makeActor(SHOP_CLERK.def,SHOP_CLERK.top,SHOP_CLERK.top2,'adult',[{x:CLERK.x,z:CLERK.z,yaw:CLERK.yaw,look:{x:0,y:1.3,z:3}}],true,0);
 const shoppers=shopperDefs.map((s,i)=>makeActor(s.def,s.top,s.top2,s.age,s.spots,false,i+1));
 for(const s of shopperDefs)if(s.with){const kid=shoppers.find(a=>a.id===s.def.id)!,lead=shoppers.find(a=>a.id===s.with);if(lead){kid.leader=lead;lead.follower=kid;kid.holdUntil=Infinity;}}
 const actors=[clerk,...shoppers];
 // Kid + parent pose-settle once after the first solve (the held boot needs its hand).
 for(const a of actors)a.settle=.9;
 const clerkPoiValue=clerkPoi(SHOP_CLERK.def.name);
 for(const a of shoppers)a.poi={id:a.id,kind:'npc',npc:a.id,label:`Talk to ${a.name}`,a:{x:a.x,z:a.z},b:{x:a.x,z:a.z},face:{x:a.x,z:a.z},anchor:{x:a.x,y:a.height+.35,z:a.z},
  box:{minX:a.x-.35,maxX:a.x+.35,minZ:a.z-.35,maxZ:a.z+.35,h:a.height}};
 const stations=stationPois();
 const pois=():ShopPoi[]=>[...stations,clerkPoiValue,...shoppers.filter(a=>!a.away).map(a=>a.poi!)];

 // ---- State ------------------------------------------------------------------------------------------------------------------
 const obstacles=shopObstacles(),blocked=(px:number,pz:number)=>shopBlocked(px,pz,obstacles);
 let x:number=DOOR.x,z=ROOM.front+.4,vx=0,vz=0,yaw=Math.PI,time=0,frame=0,last=0,slot=0,disposed=false,covered=false,leaving=false,settle=1,draws=0,frames=0,poses=0;
 let firstFrameSent=false,npcOnly=false,npcTimer:ReturnType<typeof setTimeout>|undefined;const stuck=createStuckWatch(.5);
 // Party: remote-only frames (counted for the heat checks), the local emote (lazy bubble), the shoppers stepped out for friends.
 let ringHid=false,remoteOnly=false,remoteFrames=0,emote:{kind:number;age:number;dur:number}|null=null,bubbles:EmoteBubbles|null=null,friendSlots=0;
 const pushPt={x:0,z:0};
 let target:{x:number;z:number}|null=null,route:{x:number;z:number}[]=[],arrivePoi:ShopPoi|null=null,near:ShopPoi|null=null,promptVisible=false;
 const keys=new Set<string>(),stick={x:0,z:0},motion:PlayerMotion={travelMode:'walk'};
 const ray=new T.Raycaster(),ndc=new T.Vector2(),floor=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3(),projected=new T.Vector3(),hand=[new T.Vector3(),new T.Vector3()],box3=new T.Box3();
 const baseFrameMs=()=>{const t=tierSettings();return mobile?Math.max(1000/30,t.frameMs):t.cap30Everywhere?t.frameMs:0;};
 /** Only the shoppers are moving (you and the camera are still): 20 fps is plenty for a walk across the shop. */
 const frameMs=()=>npcOnly||remoteOnly?Math.max(SHOP_REMOTE_FRAME_MS,baseFrameMs()):baseFrameMs();

 // ---- Camera: the shop's perspective view from the front, following you (eased like the Museum's, clamped to the room) -------
 let aspect=1,camX=0,camZ=0,dist=12.5,pitch=.66,xr=0,viewportW=1,viewportH=1,viewportLeft=0,viewportTop=0;
 function frameRoom(){const portrait=aspect<.8,vfov=portrait?56:aspect<1.2?48:42;dist=portrait?13.5:aspect<1.2?13.5:13.5;pitch=portrait?.86:.68;
  camera.fov=vfov;camera.aspect=aspect;camera.updateProjectionMatrix();
  const halfVis=dist*Math.tan(T.MathUtils.degToRad(vfov/2))*aspect;xr=Math.max(0,ROOM.halfW+.8-halfVis);}
 /** Portrait phones aim further in (the stick and the station cards cover the bottom of the screen). */
 const wantX=()=>T.MathUtils.clamp(x,-xr,xr),wantZ=()=>aspect<.8?T.MathUtils.clamp(z-1.9,ROOM.back+2.2,ROOM.front-3.4):T.MathUtils.clamp(z-.8,ROOM.back+2.6,ROOM.front-2.4);
 /** The camera swings a little toward the side wall you walk to, so the ball cubbies and the KIT SHOP wall read. */
 function placeCamera(){const ly=.9;camera.position.set(camX*.8,ly+Math.sin(pitch)*dist,camZ+Math.cos(pitch)*dist);camera.lookAt(camX,ly,camZ);camera.updateMatrixWorld();}

 const findPath=(tx:number,tz:number)=>findShopPath({x,z},{x:tx,z:tz},blocked);
 function nearest(){let best:ShopPoi|null=null,bd=Infinity;
  for(const p of stations){const s=segPoint(p,x,z),d=Math.hypot(s.x-x,s.z-z);if(d<NEAR_STATION&&d<bd){bd=d;best=p;}}
  {const s=segPoint(clerkPoiValue,x,z),d=Math.hypot(s.x-x,s.z-z)-.3;if(d<NEAR_NPC-.3&&d<bd){bd=d;best=clerkPoiValue;}}
  for(const a of shoppers){if(a.away)continue;const d=Math.hypot(a.x-x,a.z-z)-.3;if(d<NEAR_NPC-.3&&d<bd){bd=d;best=a.poi;}}
  return best;}
 function faceOf(p:ShopPoi){if(p.npc&&p.npc!=='clerk'){const a=shoppers.find(s=>s.id===p.npc);if(a)return {x:a.x,z:a.z};}return p.face;}
 function arrive(p:ShopPoi){const f=faceOf(p);yaw=Math.atan2(f.x-x,f.z-z);callbacks.onArrive?.(p);}
 function walkToPoi(p:ShopPoi){let s:{x:number;z:number};
  const a=p.npc&&p.npc!=='clerk'?shoppers.find(o=>o.id===p.npc):undefined;
  if(a){const dx=x-a.x,dz=z-a.z,d=Math.hypot(dx,dz)||1;s={x:a.x+dx/d*.95,z:a.z+dz/d*.95};}else s=p.stand??segPoint(p,x,z);
  if(Math.hypot(s.x-x,s.z-z)<.35||(a&&Math.hypot(a.x-x,a.z-z)<1.3)){target=null;route=[];arrivePoi=null;arrive(p);wake();return;}
  route=findPath(s.x,s.z);target=route.shift()??{x:s.x,z:s.z};arrivePoi=p;stuck.reset();wake();}

 // ---- People: one step (walk a leg, turn, wave), posing only when something changed --------------------------------------------
 /** One shopper walks at a time, and the shop rests WALK_GAP seconds between walks: a still room is a sleeping room. */
 const WALK_GAP=12;let walker:Actor|null=null,nextWalkAt=born+5;
 /** No input from you for IDLE_REST s: the shoppers rest (no new walks, no walk timer), so the room sleeps at 0 rAF. */
 const IDLE_REST=60;let lastInput=born;
 const resting=()=>clock()-lastInput>IDLE_REST;
 /** Any input: the idle clock restarts, and a resting room wakes so the shoppers resume. */
 function poke(){const was=resting();lastInput=clock();if(was)wake();}
 function beginWalk(a:Actor){a.spot=(a.spot+1)%a.spots.length;a.mode='walk';a.settle=0;a.motion.called=0;}
 function stepActor(a:Actor,dt:number,t:number,youMoving:boolean){
  const dx=x-a.x,dz=z-a.z,dYou=Math.hypot(dx,dz);
  if(!a.clerk&&a.mode==='hold'&&!a.leader&&a.spots.length>1&&t>=a.holdUntil){
   if(resting()){/* resting: no new walk until you are back */}
   else if((!walker||walker===a)&&t>=nextWalkAt){walker=a;beginWalk(a);if(a.follower&&!a.follower.away)beginWalk(a.follower);}else a.holdUntil=Math.max(t,nextWalkAt)+.5+rand()*3;}
  let want=a.facing;
  if(a.mode==='walk'){const s=a.spots[a.spot],tx=s.x-a.x,tz=s.z-a.z,d=Math.hypot(tx,tz);
   if(d<.04){a.x=s.x;a.z=s.z;a.mode='hold';a.holdUntil=t+12+rand()*8;a.settle=.9;if(walker===a){walker=null;nextWalkAt=t+WALK_GAP;}}
   else{const inWay=dYou<.9&&tx*dx+tz*dz>0;if(!inWay){const step=Math.min(d,a.speed*dt);a.x+=tx/d*step;a.z+=tz/d*step;}want=Math.atan2(tx,tz);}}
  const range=a.clerk?5:2.4,close=dYou<range;
  if(a.mode==='hold')want=close?Math.atan2(dx,dz):a.spots[a.spot].yaw;
  if(close!==a.nearYou){a.nearYou=close;a.settle=Math.max(a.settle,.6);if(close&&dYou<2.2&&a.mode==='hold'&&!reduced&&!a.clerk)a.wave=1.4;}
  const turn=Math.atan2(Math.sin(want-a.facing),Math.cos(want-a.facing));a.facing=Math.abs(turn)<.002?want:a.facing+turn*(1-Math.exp(-dt*6));
  a.wave=Math.max(0,a.wave-dt);a.settle=Math.max(0,a.settle-dt);
  const spot=a.spots[a.spot],holding=a.mode==='hold'&&!!spot.holdBoot&&!close;
  const m=a.motion;m.facing=a.facing;m.intentHeading=a.mode==='walk'?want:undefined;
  if(close){m.lookX=x;m.lookY=1.3;m.lookZ=z;}else if(a.mode==='hold'){m.lookX=spot.look.x;m.lookY=spot.look.y;m.lookZ=spot.look.z;}else{m.lookX=m.lookY=m.lookZ=undefined;}
  m.called=a.wave>0?Math.sin(Math.min(1,a.wave/1.4)*Math.PI)*.9:holding?1:0;
  const expr=close?'happy':'neutral';if(expr!==a.expr){a.expr=expr;a.rig.setExpression(expr);}
  const needs=a.mode==='walk'||Math.abs(turn)>.01||a.wave>0||a.settle>0||(close&&youMoving);
  if(!needs){a.elapsed=0;return false;}
  a.elapsed+=dt;const bucket=Math.floor((t+a.slot)*POSE_HZ);
  if(dYou>NEAR_POSE&&bucket===a.bucket){a.rig.root.position.set(a.x,0,a.z);}
  else{a.bucket=bucket;const poseDt=Math.min(a.elapsed,.1);a.elapsed=0;a.rig.update(a.x,a.z,poseDt,t,reduced,m);poses++;
   if(spot.holdBoot||heldBoot.userData.by===a.id){heldBoot.userData.by=a.id;const show=holding&&a.settle<.6;heldBoot.visible=show;
    if(show){a.rig.handPositions(hand[0],hand[1]);const h=hand[0].y>hand[1].y?hand[0]:hand[1];heldBoot.position.set(h.x,h.y+.06,h.z);heldBoot.rotation.set(0,a.facing+Math.PI/2,-.35);}}}
  if(a.poi){a.poi.a.x=a.poi.b.x=a.poi.face.x=a.poi.anchor.x=a.x;a.poi.a.z=a.poi.b.z=a.poi.face.z=a.poi.anchor.z=a.z;const bx=a.poi.box;bx.minX=a.x-.35;bx.maxX=a.x+.35;bx.minZ=a.z-.35;bx.maxZ=a.z+.35;}
  placeShadow(a.shadow,a.x,a.z,.4*a.rig.profileScale);
  return true;
 }
 /** While the room sleeps, the next shopper's walk is a timer (no frames in between). */
 function scheduleNpcs(){clearTimeout(npcTimer);npcTimer=undefined;if(covered||disposed||leaving)return;
  let next=Infinity;for(const a of shoppers)if(!a.away&&a.mode==='hold'&&!a.leader&&a.spots.length>1)next=Math.min(next,a.holdUntil);
  if(next<Infinity&&next<lastInput+IDLE_REST)npcTimer=setTimeout(()=>{npcTimer=undefined;if(!resting())wake();},Math.max(50,(next-clock())*1000+20));}

 function tick(now:number){frame=0;if(disposed||covered||document.hidden)return;
  const interval=frameMs();if(interval>0){const next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(tick);return;}slot=next;}
  const dt=Math.max(.001,Math.min(.05,last?(now-last)/1000:1/60));last=now;time+=dt;frames++;const t=clock();
  let ix=stick.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),iz=stick.z+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(ix||iz){target=null;route=[];arrivePoi=null;}
  else if(target){const dx=target.x-x,dz=target.z-z,d=Math.hypot(dx,dz);
   if(!leaving&&stuck.step(target,d,dt)){target=null;route=[];arrivePoi=null;stuck.reset();}
   else if(d<.12){target=route.shift()??null;if(!target&&arrivePoi){const p=arrivePoi;arrivePoi=null;arrive(p);}}else{ix=dx/d*Math.min(1,d*2.2);iz=dz/d*Math.min(1,d*2.2);}}
  // A calm shop walk (the Museum's pace).
  const len=Math.max(1,Math.hypot(ix,iz)),resp=1-Math.exp(-dt*12),top=3;vx+=(ix/len*top-vx)*resp;vz+=(iz/len*top-vz)*resp;
  const ox=x,oz=z,pos={x:x+vx*dt,z:z+vz*dt};shopCollide(pos,obstacles);
  // People are solid too: you step round a shopper (they wait if you stand in their way).
  for(const a of shoppers){if(a.away)continue;const dx=pos.x-a.x,dz=pos.z-a.z,d=Math.hypot(dx,dz);if(d<.6&&d>1e-4){pos.x=a.x+dx/d*.6;pos.z=a.z+dz/d*.6;}}
  // A busy party friend's force field (a studio stand, the till) is solid too (design 3.4: r 0.6 + your body).
  pushPt.x=pos.x;pushPt.z=pos.z;if(shopRoomHooks.pushOut(pushPt,.3)){pos.x=pushPt.x;pos.z=pushPt.z;}
  shopCollide(pos,obstacles);x=pos.x;z=pos.z;vx=(x-ox)/dt;vz=(z-oz)/dt;const speed=Math.hypot(vx,vz);
  if(!leaving&&z>ROOM.front-.1&&Math.abs(x-DOOR.x)<DOOR.half&&vz>.15){leaving=true;keys.clear();stick.x=stick.z=0;target=null;route=[];doorTarget=1;callbacks.onExit?.();}
  if(Math.hypot(ix,iz)>.08)yaw=Math.atan2(ix,iz);
  doorTarget=leaving||Math.hypot(x-DOOR.x,z-ROOM.front)<2.6?1:0;const prevDoor=doorOpen;doorOpen=reduced?doorTarget:T.MathUtils.damp(doorOpen,doorTarget,7,dt);if(Math.abs(doorOpen-doorTarget)<.003)doorOpen=doorTarget;if(doorOpen!==prevDoor)placeDoors();
  const youMoving=speed>.03||!!target;
  motion.facing=yaw;motion.intentHeading=speed>.08?Math.atan2(vx,vz):undefined;motion.stopDistance=target?Math.hypot(target.x-x,target.z-z):undefined;motion.dribbling=false;
  // A wire emote from the party chip plays on your own rig (no camera change in rooms), with its bubble.
  if(emote){emote.age+=dt;if(emote.age>=emote.dur){emote=null;motion.jump=undefined;motion.called=0;player.setExpression('neutral');settle=Math.max(settle,.3);}
   else if(!reduced){const b=emoteBody(emote.kind,emote.age,emote.dur);motion.called=b.called;motion.jump=b.jump;}}
  if(youMoving||settle>0||emote){player.update(x,z,dt,time,reduced,motion);if(emote&&!reduced)applyEmoteArms(player.root,emote.kind,emote.age,emote.dur);placeShadow(0,x,z,ringHid?0:.42);poses++;}
  if(bubbles&&(emote||bubbles.active(0))){bubbles.follow(0,x,2.55,z);bubbles.update(dt,reduced);}
  let crowd=false;for(const a of actors)if(!a.away&&stepActor(a,dt,t,youMoving))crowd=true;
  const n=leaving?null:nearest();if(n!==near){near=n;callbacks.onNear?.(n);const st=n?.station;stationRing.visible=!!st;if(st){const p=PODIUMS[st];stationRing.position.set(p.x,.015,p.z);}}
  const follow=reduced?1:1-Math.exp(-dt*5),cx=wantX(),cz=wantZ();camX+=(cx-camX)*follow;camZ+=(cz-camZ)*follow;placeCamera();
  if(near){const a=near.anchor;projected.set(a.x,a.y,a.z).project(camera);const vis=Math.abs(projected.x)<.92&&projected.y<.85&&projected.y>-.8&&projected.z<1;
   callbacks.onPrompt?.((projected.x*.5+.5)*viewportW,(-projected.y*.5+.5)*viewportH,vis);promptVisible=vis;}else if(promptVisible){promptVisible=false;callbacks.onPrompt?.(0,0,false);}
  // Friends in this room (zero cost without a party). One ring rule: while the party draws your colour ring, your blob shadow hides.
  const remoteKeep=shopRoomHooks.frame(dt,performance.now(),camera);
  if(shopRoomHooks.meRing!==ringHid){ringHid=!ringHid;placeShadow(0,x,z,ringHid?0:.42);}
  renderer.render(scene,camera);draws++;if(!firstFrameSent){firstFrameSent=true;callbacks.onFirstFrame?.();}
  const you=youMoving||keys.size>0||Math.hypot(stick.x,stick.z)>.02||doorOpen!==doorTarget||Math.abs(camX-cx)>.005||Math.abs(camZ-cz)>.005||!!emote||!!bubbles?.active(0);
  if(you)settle=.5;else settle-=dt;npcOnly=!you&&settle<=0&&crowd;
  // Friends moving here keep frames too, at the remote rate (20 fps) when nothing of yours moves.
  remoteOnly=!you&&settle<=0&&!crowd&&remoteKeep;if(remoteOnly)remoteFrames++;
  if(settle>0||crowd||leaving||remoteKeep)frame=requestAnimationFrame(tick);else{last=0;slot=0;remoteOnly=false;scheduleNpcs();}
 }
 function wake(){clearTimeout(npcTimer);npcTimer=undefined;remoteOnly=false;if(!frame&&!covered&&!disposed&&!document.hidden){settle=Math.max(settle,.3);last=0;slot=0;frame=requestAnimationFrame(tick);}}
 /** A friend here moved: frames without the local 0.5 s settle (the layer says how long), at the remote rate. */
 function wakeRemote(){if(!frame&&!covered&&!disposed&&!document.hidden){clearTimeout(npcTimer);npcTimer=undefined;remoteOnly=true;last=0;slot=0;frame=requestAnimationFrame(tick);}}
 /** Friends replace shoppers (heat-neutral, design 4): the last shoppers in this order step out; a kid steps out before its parent. */
 const STEP_OUT=['shop-tane','shop-yuna','shop-yusuf','shop-oskar','shop-nadia'];
 const outOrder=[...shoppers].sort((a,b)=>{const i=STEP_OUT.indexOf(a.id),j=STEP_OUT.indexOf(b.id);return (i<0?99:i)-(j<0?99:j);});
 function setFriendSlots(n:number){
  const out=shoppers.length-shopCrowdCount(n,shoppers.length);if(out===friendSlots)return;friendSlots=out;
  outOrder.forEach((a,i)=>{const away=i<out;if(away===a.away)return;a.away=away;a.rig.root.visible=!away;
   if(away){if(walker===a){walker=null;nextWalkAt=clock()+WALK_GAP;}if(heldBoot.userData.by===a.id)heldBoot.visible=false;placeShadow(a.shadow,a.x,a.z,0);}
   else{if(a.leader){a.spot=a.leader.spot;const sp=a.spots[a.spot%a.spots.length];a.x=sp.x;a.z=sp.z;a.mode='hold';}a.settle=.9;placeShadow(a.shadow,a.x,a.z,.4*a.rig.profileScale);}});
  wake();}
 /** The local player as the party sends it (one reused object). */
 function readPose(out:ShopLocalPose){out.x=x;out.z=z;out.facing=yaw;out.speed=Math.hypot(vx,vz);}
 /** A friend already stands inside when you arrive: re-aim the walk-in to a free slot (only before your first input). */
 function arriveAt(tx:number,tz:number){if(lastInput!==born||leaving||disposed)return;route=findPath(tx,tz);target=route.shift()??{x:tx,z:tz};arrivePoi=null;stuck.reset();wake();}
 async function playEmote(kind:number,face?:{x:number;z:number}|null){if(disposed||leaving)return;
  if(!bubbles){const m=await import('../graphics/emoteBubbles');if(disposed)return;bubbles=bubbles??m.createEmoteBubbles(scene);}
  if(face)yaw=Math.atan2(face.x-x,face.z-z);const dur=emoteSeconds(kind);emote={kind,age:0,dur};player.setExpression('happy');bubbles.show(0,kind,dur);wake();}
 function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;renderer.setPixelRatio(pixelRatio());renderer.setSize(w,h,false);viewportW=w;viewportH=h;const r=canvas.getBoundingClientRect();viewportLeft=r.left;viewportTop=r.top;
  aspect=w/h;frameRoom();if(draws===0){camX=wantX();camZ=wantZ();}placeCamera();wake();}
 function clearInput(){keys.clear();stick.x=stick.z=0;target=null;route=[];arrivePoi=null;vx=vz=0;wake();}
 function key(e:KeyboardEvent){if(leaving||covered)return;
  if(!/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code)||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
  e.preventDefault();poke();if(e.type==='keydown')keys.add(e.code);else keys.delete(e.code);wake();}
 function visibility(){if(document.hidden){keys.clear();stick.x=stick.z=0;cancelAnimationFrame(frame);frame=0;clearTimeout(npcTimer);}else wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',visibility);
 player.update(x,z,0,0,reduced,{facing:yaw,resumePose:true,travelMode:'walk'});placeShadow(0,x,z,.42);resize();
 // Arrival: a few steps in from the doors (already open from the door slide); the clerk waves hello (greet()).
 target={x:DOOR.x,z:ROOM.front-1.8};
 // The party seam (lib/multiplayer/rooms/shopHooks.ts): registered now, a layer attaches only when this tab is in a party.
 const hookSource:ShopHookSource={scene,camera,phone:mobile,reduced,readPose,wakeRemote,arrive:arriveAt,emote:(k,f)=>{void playEmote(k,f);},setFriendSlots,sleeping:()=>frame===0};
 shopRoomHooks.register(hookSource);

 return {
  get pois(){return pois();},
  setStick(a:number,b:number){if(leaving)return;poke();stick.x=a;stick.z=b;wake();},
  /** Any tap or input on the room's UI: wakes resting shoppers (the idle clock restarts). */
  poke,
  /** A tap in the shop: a person, the till or a wall walks you there (and then talks / opens the studio); the floor walks there. */
  pick(clientX:number,clientY:number):string|null{if(leaving||covered)return null;poke();ndc.set((clientX-viewportLeft)/viewportW*2-1,1-(clientY-viewportTop)/viewportH*2);ray.setFromCamera(ndc,camera);
   let best:ShopPoi|null=null,bd=Infinity;for(const p of pois()){box3.min.set(p.box.minX,0,p.box.minZ);box3.max.set(p.box.maxX,p.box.h,p.box.maxZ);const h=ray.ray.intersectBox(box3,hit);
    if(h){const d=h.distanceToSquared(ray.ray.origin)-(p.kind==='npc'?4:0);if(d<bd){bd=d;best=p;}}}
   if(best){walkToPoi(best);return best.id;}
   if(ray.ray.intersectPlane(floor,hit)){route=findPath(T.MathUtils.clamp(hit.x,-ROOM.halfW+.5,ROOM.halfW-.5),T.MathUtils.clamp(hit.z,ROOM.back+1,ROOM.front-.5));target=route.shift()??null;arrivePoi=null;stuck.reset();wake();}return null;},
  /** "Show me" (the clerk, the station cards' keyboard twin): walk to that station or person; onArrive fires there. */
  walkTo(id:string){poke();const p=pois().find(q=>q.id===id);if(p)walkToPoi(p);},
  /** The clerk waves hello (on arrival). */
  greet(){if(!reduced)clerk.wave=1.6;clerk.settle=Math.max(clerk.settle,.4);wake();},
  setCovered(value:boolean){if(value===covered)return;covered=value;if(value){keys.clear();stick.x=stick.z=0;cancelAnimationFrame(frame);frame=0;clearTimeout(npcTimer);npcTimer=undefined;}else{lastInput=clock();wake();}},
  clearInput,
  /** Test/measurement hooks. */
  measureRender(n=60){const t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);return (performance.now()-t0)/n;},
  /** Heat check hook (scripts/check-mp-rooms-shop.cjs): ms per friend-layer update and per render, friends drawn vs hidden. */
  measureParty(n=60){if(!shopRoomHooks.attached)return null;let t0=performance.now();for(let i=0;i<n;i++)shopRoomHooks.update(1/60,performance.now(),camera,false);const update=(performance.now()-t0)/n;
   t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);const withF=(performance.now()-t0)/n,calls=renderer.info.render.calls;shopRoomHooks.update(0,performance.now(),camera,true);
   t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);const without=(performance.now()-t0)/n,callsWithout=renderer.info.render.calls;shopRoomHooks.update(0,performance.now(),camera,false);
   return {update,renderWith:withF,renderWithout:without,calls,callsWithout};},
  /** The local emote (party chip): exposed for checks. */
  emote:(kind:number)=>{void playEmote(kind,null);},
  threeScene:scene,
  debugPlace(px:number,pz:number,a=yaw){if(leaving)return;poke();x=px;z=pz;yaw=a;vx=vz=0;target=null;route=[];arrivePoi=null;settle=.5;wake();},
  get state():ShopSceneState{return {sleeping:frame===0,resting:resting(),frames,draws,covered,leaving,x,z,yaw,near:near?.id??null,doorOpen,poses,
   npcs:actors.filter(a=>!a.away).map(a=>({id:a.id,name:a.name,x:a.x,z:a.z,mode:a.mode,clerk:a.clerk})),
   remoteOnly,remoteFrames,emote:emote?.kind??-1,shoppersOut:friendSlots,
   party:shopRoomHooks.attached?{shown:shopRoomHooks.shown,meRing:shopRoomHooks.meRing,friends:shopRoomHooks.debugFriends()}:null,
   render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},pixelRatio:renderer.getPixelRatio(),frameMs:frameMs()};},
  dispose(){disposed=true;cancelAnimationFrame(frame);frame=0;clearTimeout(npcTimer);observer.disconnect();shopRoomHooks.unregister(hookSource);bubbles?.dispose();bubbles=null;
   window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);
   pack?.dispose();player.dispose();for(const a of actors)a.rig.dispose();
   for(const mesh of merged)mesh.geometry.dispose();stationRing.geometry.dispose();propGeo.dispose();doorGeo.dispose();shadowGeo.dispose();
   for(const mat of [solidMat,kitMat,glowMat,printMat,ringMat,glassMat,shadowMat])mat.dispose();kitTex.dispose();signTex.dispose();
   renderer.dispose();renderer.forceContextLoss();},
 };
}
export type ShopScene=ReturnType<typeof createShopScene>;

// ---- Sign atlas (1024 × 512, painted once per visit) ---------------------------------------------------------------------------
const SIGN={
 jersey:[0,0,512,96],boots:[512,0,512,96],ball:[0,96,512,96],tagline:[512,96,512,96],logo:[0,192,640,150],
 jerseyScreen:[640,192,128,96],bootsScreen:[768,192,128,96],ballScreen:[896,192,128,96],till:[640,300,128,64],
} as const satisfies Record<string,readonly [number,number,number,number]>;
const SANS='"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
function paintSignAtlas(){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d')!;
 const spaced=(px:number)=>{(g as unknown as {letterSpacing?:string}).letterSpacing=`${px}px`;};
 const station=([x,y,w,h]:readonly number[],label:string,icon:(cx:number,cy:number,s:number)=>void)=>{
  g.fillStyle=P.graphite;g.beginPath();g.roundRect(x+4,y+8,w-8,h-16,14);g.fill();
  g.fillStyle=P.accent;g.beginPath();g.arc(x+50,y+h/2,28,0,Math.PI*2);g.fill();icon(x+50,y+h/2,22);
  g.fillStyle='#ffffff';g.textAlign='left';g.textBaseline='middle';spaced(5);g.font=`800 40px ${SANS}`;g.fillText(label,x+94,y+h/2+2);
 };
 const jerseyIcon=(cx:number,cy:number,s:number,fill='#ffffff')=>{g.fillStyle=fill;g.beginPath();JERSEY_OUTLINE.forEach(([px,py],i)=>{const X=cx+px*s,Y=cy-py*s;if(i)g.lineTo(X,Y);else g.moveTo(X,Y);});g.closePath();g.fill();};
 const bootIcon=(cx:number,cy:number,s:number,fill='#ffffff')=>{g.fillStyle=fill;g.beginPath();BOOT_OUTLINE.forEach(([px,py],i)=>{const X=cx+px*s*1.7,Y=cy+s*.45-py*s*1.7;if(i)g.lineTo(X,Y);else g.moveTo(X,Y);});g.closePath();g.fill();};
 const ballIcon=(cx:number,cy:number,s:number,fill='#ffffff',ink:string=P.accent)=>{g.fillStyle=fill;g.beginPath();g.arc(cx,cy,s*.85,0,Math.PI*2);g.fill();g.fillStyle=ink;g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.lineTo(cx+Math.cos(a)*s*.36,cy+Math.sin(a)*s*.36);}g.closePath();g.fill();};
 station(SIGN.jersey,'JERSEY STUDIO',jerseyIcon);station(SIGN.boots,'BOOT STUDIO',bootIcon);station(SIGN.ball,'BALL STUDIO',(x,y,s)=>ballIcon(x,y,s,'#ffffff',P.accent));
 {const [x,y,w,h]=SIGN.tagline;g.fillStyle=P.navy;g.textAlign='center';g.textBaseline='middle';spaced(5);g.font=`800 38px ${SANS}`;g.fillText('DESIGN YOUR OWN KIT',x+w/2,y+h/2);}
 {const [x,y,w,h]=SIGN.logo;g.fillStyle=P.navy;g.beginPath();g.roundRect(x+4,y+6,w-8,h-12,10);g.fill();ballIcon(x+78,y+h/2,52,'#ffffff',P.navy);
  g.fillStyle='#ffffff';g.textAlign='left';g.textBaseline='alphabetic';spaced(8);g.font=`800 92px ${SANS}`;g.fillText('KIT SHOP',x+150,y+h*.68);g.fillStyle=P.accent;g.fillRect(x+152,y+h*.78,220,6);}
 for(const [key,icon] of [['jerseyScreen',jerseyIcon],['bootsScreen',bootIcon],['ballScreen',(cx:number,cy:number,s:number)=>ballIcon(cx,cy,s,'#ffffff',P.accent)]] as const){
  const [x,y,w,h]=SIGN[key];g.fillStyle=P.screen;g.fillRect(x,y,w,h);const grad=g.createLinearGradient(x,y,x,y+h);grad.addColorStop(0,'rgba(255,255,255,.08)');grad.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grad;g.fillRect(x,y,w,h);
  icon(x+w/2,y+h/2-8,26);g.fillStyle=P.accent;g.textAlign='center';g.textBaseline='middle';spaced(3);g.font=`800 16px ${SANS}`;g.fillText('TAP TO DESIGN',x+w/2,y+h-14);}
 {const [x,y,w,h]=SIGN.till;g.fillStyle=P.screen;g.fillRect(x,y,w,h);g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='middle';spaced(2);g.font=`800 18px ${SANS}`;g.fillText('KIT SHOP',x+w/2,y+h/2-10);g.fillStyle=P.accent;g.font=`700 13px ${SANS}`;g.fillText('COINS ONLY',x+w/2,y+h/2+14);}
 return c;
}

// ---- Jersey atlas (1024 × 512: eight 256² tiles, painted once per visit) -------------------------------------------------------
function paintKitAtlas(){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d')!;
 // Tiles are 256 wide, 256 tall; the outline box (x −.82….82, y −.87….87) fills the tile, matching the geometry's UVs.
 const X=(px:number,ox:number)=>ox+(px+.82)/1.64*256,Y=(py:number,oy:number)=>oy+(1-(py+.87)/1.74)*256;
 KITS.forEach(([base,second,accent,pattern,initials,number],i)=>{
  const ox=(i%4)*256,oy=Math.floor(i/4)*256;
  g.fillStyle=base;g.fillRect(ox,oy,256,256);   // the edges/back read as the shirt colour
  g.save();g.beginPath();JERSEY_OUTLINE.forEach(([px,py],n)=>n?g.lineTo(X(px,ox),Y(py,oy)):g.moveTo(X(px,ox),Y(py,oy)));g.closePath();g.clip();
  g.fillStyle=base;g.fillRect(ox,oy,256,256);g.fillStyle=second;
  const L=ox,T0=oy,S=256;
  if(pattern==='stripes')for(let k=0;k<6;k++)g.fillRect(L+22+k*38,T0,18,S);
  else if(pattern==='hoops')for(let k=0;k<5;k++)g.fillRect(L,T0+40+k*44,S,20);
  else if(pattern==='sash'){g.save();g.translate(L+S/2,T0+S/2);g.rotate(-.75);g.fillRect(-S,-22,S*2,44);g.restore();}
  else if(pattern==='halves')g.fillRect(L+S/2,T0,S/2,S);
  else if(pattern==='quarters'){g.fillRect(L+S/2,T0,S/2,S/2);g.fillRect(L,T0+S/2,S/2,S/2);}
  else if(pattern==='chevron'){g.beginPath();g.moveTo(L,T0+70);g.lineTo(L+S/2,T0+130);g.lineTo(L+S,T0+70);g.lineTo(L+S,T0+100);g.lineTo(L+S/2,T0+160);g.lineTo(L,T0+100);g.closePath();g.fill();}
  else if(pattern==='checkers'){for(let a=0;a<8;a++)for(let b2=0;b2<8;b2++){if((a+b2)%2)g.fillRect(L+a*32,T0+b2*32,32,32);}}
  else if(pattern==='fade'){const gr=g.createLinearGradient(0,T0,0,T0+S);gr.addColorStop(0,base);gr.addColorStop(1,second);g.fillStyle=gr;g.fillRect(L,T0,S,S);}
  // Fabric: fine diagonal knit and a soft centre light (the shirt's drape), then side shadows.
  g.globalAlpha=.05;g.strokeStyle='#000';g.lineWidth=1;for(let k=-S;k<S;k+=5){g.beginPath();g.moveTo(L+k,T0);g.lineTo(L+k+S,T0+S);g.stroke();}
  g.globalAlpha=1;const light=g.createRadialGradient(L+S*.45,T0+S*.4,10,L+S/2,T0+S/2,S*.62);light.addColorStop(0,'rgba(255,255,255,.16)');light.addColorStop(1,'rgba(0,0,0,.16)');g.fillStyle=light;g.fillRect(L,T0,S,S);
  // Collar, cuffs and the hem in the accent colour.
  g.strokeStyle=accent;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(X(-.22,ox),Y(.85,oy));g.lineTo(X(0,ox),Y(.66,oy));g.lineTo(X(.22,ox),Y(.85,oy));g.stroke();
  g.lineWidth=8;for(const sx of [-1,1]){g.beginPath();g.moveTo(X(sx*.8,ox),Y(.55,oy));g.lineTo(X(sx*.63,ox),Y(.3,oy));g.stroke();}
  g.fillStyle=accent;g.fillRect(X(-.46,ox),Y(-.8,oy),X(.46,ox)-X(-.46,ox),6);
  // Generic crest (a shield with initials) on the left chest and a small number on the right.
  const cx=X(-.22,ox),cy=Y(.38,oy);g.fillStyle=accent;g.beginPath();g.moveTo(cx-17,cy-18);g.lineTo(cx+17,cy-18);g.lineTo(cx+17,cy+2);g.quadraticCurveTo(cx+17,cy+16,cx,cy+22);g.quadraticCurveTo(cx-17,cy+16,cx-17,cy+2);g.closePath();g.fill();
  g.fillStyle=base;g.textAlign='center';g.textBaseline='middle';g.font=`900 14px ${SANS}`;g.fillText(initials,cx,cy-1);
  g.fillStyle=second===base?accent:(pattern==='halves'||pattern==='quarters'?accent:second);g.font=`900 30px ${SANS}`;g.fillText(String(number),X(.22,ox),Y(.36,oy));
  g.restore();
 });
 return c;
}
