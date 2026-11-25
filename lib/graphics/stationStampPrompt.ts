/**
 * Island stamp book: the station houses' "Collect stamp" prompt (owner, Nov 23 2026: "hovering over a station building shows the
 * island's existing GREEN BUILDING OUTLINE … with a button Collect stamp, or Stamped ✓ when already collected → opens the book on
 * that page"). The gashapon prompt's shape (lib/graphics/gashaponPrompt.ts):
 *  - Desktop: hover(ray) tests the five station houses (ray into each house's own frame, one box each); the hovered house gets the
 *    shared green outline (lib/graphics/buildingGlow.ts 'station', one glow moved to it) and wants the HUD slot as explicit intent
 *    (distance -1). The pointer resting on the button holds the hover (holdHover).
 *  - Walking up (phones and desktop): within STAMP_REACH of a house the button shows (the HUD stack's 'enter' slot, key
 *    STAMP_FOCUS_KEY, arbitrated with Board, Enter and the rest by distance).
 *  - A tap on the house (pick) opens it like the other buildings' tap-to-open.
 * The platform's stamp stand (Nov 24 2026, lib/town/trainLayout.ts STAMP_STAND_U) counts as the house: hovering or tapping it picks
 * the station (its own small box) and standing within STAND_REACH m of it shows the button.
 * You have to be at the station: hover and tap count only within STAMP_HOVER_RANGE metres of the house (a stamp is a souvenir of
 * having been there).
 *
 * Heat: no timers; 5 squared-distance checks per frame, ray tests only while the pointer is over the canvas, one projection while
 * the button shows. The glow draws only while shown (no light added).
 */
import * as T from 'three';
import {TRAIN_STATIONS,STATION_PLATFORM_Y,trackAt,leftNormal,bedAt} from '../town/trainTrack';
import {trainLayout,stampStandSpot} from '../town/trainLayout';
import {createBuildingGlow} from './buildingGlow';
import {readStamps,stampById,type StampId} from '../town/islandStamps';

export const STAMP_FOCUS_KEY='station-stamp';
/** Metres from the house's middle that count as standing at it (the platform in front of it included). */
export const STAMP_REACH=7.5;
/** Hover / tap only count this close (metres, player to house). */
export const STAMP_HOVER_RANGE=45;
const HOVER_GRACE=600,H=2.9,ROOF=1.9,STAND_REACH=3;
export type StationHouse={id:StampId;name:string;x:number;y:number;z:number;yaw:number;w:number;d:number;h:number;
 /** The stamp stand on its platform (world x, z). */stand:{x:number;z:number}};
/** Where each station house stands (lib/town/trainWorld.ts buildStation: 8 m along the line, behind the platform; South on it). */
export function stationHouses():StationHouse[]{
 const L=trainLayout();
 return TRAIN_STATIONS.map(st=>{const c=trackAt(st.s),n=leftNormal(c.tx,c.tz),south=st.id==='south',hd=south?3.8:4.6,v1=south?8.1:5.45,hv0=south?v1-hd:v1,hm=hv0+hd/2;
  const sp=stampStandSpot(st);
  return {id:st.id,name:st.name,x:c.x+n.x*st.side*hm,y:bedAt(L.profile,st.s)+STATION_PLATFORM_Y,z:c.z+n.z*st.side*hm,yaw:Math.atan2(-c.tz,c.tx),w:8,d:hd,h:H,stand:{x:sp.x,z:sp.z}};});
}
export type StampPromptUpdate={x:number;z:number;groundY:number;onFoot:boolean;canEnter:boolean;focusKey:string|null;camera:T.Camera;width:number;height:number;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;dt?:number;reduced?:boolean};

export function createStationStampPrompt(scene?:T.Object3D){
 const houses=stationHouses().map(h=>{const m=new T.Matrix4().makeRotationY(h.yaw).setPosition(h.x,h.y,h.z);
  const inv=m.clone().invert(),sl=new T.Vector3(h.stand.x,h.y,h.stand.z).applyMatrix4(inv);
  return {h,inv,box:new T.Box3(new T.Vector3(-h.w/2-.9,0,-h.d/2-1.3),new T.Vector3(h.w/2+.9,h.h+ROOF+.2,h.d/2+1.3)),
   stand:new T.Box3(new T.Vector3(sl.x-.6,0,sl.z-.45),new T.Vector3(sl.x+.6,2.15,sl.z+.45))};});
 const local=new T.Ray(),hit=new T.Vector3(),anchor=new T.Vector3(),R2=STAMP_REACH*STAMP_REACH;
 let hovered:StationHouse|null=null,hoverUntil=0,near:StationHouse|null=null,shown='',glowAt='',px=0,pz=0;
 const glowRoot=scene?new T.Group():null,glow=glowRoot?createBuildingGlow(glowRoot,8,4.6,H,'station'):null;
 if(glowRoot){glowRoot.name='station-stamp-selection';scene!.add(glowRoot);}
 const inRange=(h:StationHouse)=>(px-h.x)**2+(pz-h.z)**2<STAMP_HOVER_RANGE*STAMP_HOVER_RANGE;
 const pick=(ray:T.Raycaster)=>{let best:StationHouse|null=null,bestD=Infinity;
  for(const s of houses){if(!inRange(s.h))continue;local.copy(ray.ray).applyMatrix4(s.inv);for(const b of [s.box,s.stand])if(local.intersectBox(b,hit)){const d=hit.distanceTo(local.origin);if(d<bestD){bestD=d;best=s.h;}}}
  return best;};
 const onChange=()=>{shown='';};
 if(typeof window!=='undefined')window.addEventListener('fi2-island-stamps-changed',onChange);
 return {
  get hovered(){return hovered;},
  get near(){return near;},
  hover(ray:T.Raycaster|null,now=0){const h=ray?pick(ray):null;if(h){hovered=h;hoverUntil=now+HOVER_GRACE;}else if(!ray||now>=hoverUntil)hovered=null;return hovered;},
  holdHover(id:string|undefined,now=0){const s=houses.find(x=>x.h.id===id);if(s){hovered=s.h;hoverUntil=now+HOVER_GRACE;}return hovered;},
  /** The station house a tap ray hits (within range), or null. */
  pick(ray:T.Raycaster){return pick(ray);},
  update(c:StampPromptUpdate):{key:string;distance:number}|null{
   px=c.x;pz=c.z;near=null;let best=R2;
   const over=c.canEnter&&hovered&&inRange(hovered)?hovered:null;
   if(over)near=over;
   else if(c.canEnter&&c.onFoot)for(const s of houses){const ds=(c.x-s.h.stand.x)**2+(c.z-s.h.stand.z)**2,d2=Math.min((c.x-s.h.x)**2+(c.z-s.h.z)**2,ds<STAND_REACH*STAND_REACH?ds:Infinity);if(d2<best&&Math.abs(c.groundY-s.h.y)<2.2){best=d2;near=s.h;}}
   if(glow&&glowRoot){if(over&&over.id!==glowAt){glowAt=over.id;glowRoot.position.set(over.x,over.y,over.z);glowRoot.rotation.y=over.yaw;glowRoot.scale.set(1,1,over.d/4.6);glowRoot.updateMatrixWorld(true);}
    glow.update(Boolean(over),c.dt??1/60,c.reduced??false);}
   const want=near?{key:STAMP_FOCUS_KEY,distance:over?-1:Math.sqrt(best)}:null;
   const el=c.ui<HTMLButtonElement>('[data-stamp-go]');
   if(el){let hidden=!(near&&c.focusKey===STAMP_FOCUS_KEY);
    if(!hidden&&near){anchor.set(near.x,near.y+H+ROOF+.6,near.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden){c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));
      if(shown!==near.id){shown=near.id;const done=!!readStamps().stamps[near.id];el.dataset.stampGo=near.id;el.dataset.stamped=done?'1':'';
       el.textContent=done?'Stamped ✓':'Collect stamp';el.setAttribute('aria-label',done?`${stampById(near.id)?.name} stamp collected: open the Island stamp book`:`Collect the ${stampById(near.id)?.name} station stamp`);}}}
    c.hide(el,hidden);}
   return want;
  },
  dispose(){if(typeof window!=='undefined')window.removeEventListener('fi2-island-stamps-changed',onChange);glow?.dispose();glowRoot?.removeFromParent();},
 };
}
export type StationStampPrompt=ReturnType<typeof createStationStampPrompt>;
