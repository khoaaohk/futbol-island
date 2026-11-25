/**
 * Island Line: talking to the passengers (owner, Nov 24 2026: "should be able to interact with NPCs on the train. These NPCs should
 * talk about different events, games, teach"). Earlier the owner removed the floating Talk labels while riding (distracting), so
 * NOTHING is drawn or labelled until you are close or you aim at someone:
 *  POLISH 4 (owner: "exactly like island NPCs"): Town's "Talk to <name>" prompt (E / tap) for the nearest passenger within
 *  TALK_NEAR m standing or SEAT_REACH m of your seat (train-relative), in every camera view, at a stop too (Talk in the NPC slot
 *  beside the Get off pill); the island's near-only name tag over that one passenger; a tap / click on a passenger in reach; the
 *  island's hover glow (npcHover) + pointer + hover sound on desktop. Nothing drawn while nobody is in reach.
 * Opening uses Town's NpcConversation slide-out with a per-talk definition: (c) banter about the next stop as the greeting, three
 * topics ((a) an island event or game from real game data, (b) a teaching tip from the archetype, one more of either) and (d) one
 * quick question in the chat's challenge UI. lib/town/trainPassengerTalkPools.ts holds the content and its sources.
 * Rules: rotation without repeats per session (per archetype; the events across everyone); the passenger being talked to turns
 * toward you and keeps their seat (trainPassengers.face). Local only: nothing is sent, remote players never see a chat.
 * Heat: not riding = one branch per frame. Riding: a ray test against the ridden train's ≤ 14 riders only when the mouse moved or a
 * tap landed, the prompt test on the HUD tick, the glow and the tag (hidden by default) moved only while shown. No allocation
 * per frame.
 */
import * as T from 'three';
import {createNpcHover} from '../graphics/npcHover';
import type {NpcDefinition} from './npcDialogues';
import type {TalkSpot,TrainPassengers} from './trainPassengers';
import {TRAIN_STOPS,TRAIN_CARS} from './trainSchedule';
import {HALF_W,CAR_FLOOR_Y,ROOF_TOP,WIN_Y0,WIN_Y1,DOORS,DOOR_HALF,DOOR_Y0,DOOR_Y1} from './trainCarModel';
import {EVENTS,FITNESS,ROLE_POOLS,isTalkRole,type EventKind,type TalkRole,type TalkTopic} from './trainPassengerTalkPools';

/** Standing: talk reach (m) and the view cone (cos of the half angle, ~50°). Seated: reach (m, about two seats along the bench or across the aisle: SEAT_TABLE pitch ~1 m, benches ~1.9 m apart). */
export const TALK_STAND=1.5,TALK_VIEW_COS=Math.cos(50*Math.PI/180),SEAT_REACH=3;
/** POLISH 4 (owner: "interact exactly like island NPCs"): standing, the nearest passenger within TALK_NEAR m (train-relative: everyone
 *  in my train moves with me) is offered, in any camera view, no view cone and no aiming needed; held while within TALK_HOLD m more
 *  unless someone is TALK_SWITCH m closer (the island's tag hysteresis). Seated: the same within SEAT_REACH of my seat. */
export const TALK_NEAR=2.2,TALK_HOLD=.4,TALK_SWITCH=.5;
/** A tap: at most this many px of movement and ms down (a longer drag is the ride camera's look). */
export const TAP_PX=10,TAP_MS=450;
/** Body capsule for the ray test (m over the floor; kids scaled), radius. */
const SIT_LO=.45,SIT_HI=1.3,STAND_LO=.2,STAND_HI=1.75,KID=.78,BODY_R=.34;

// ---- rotation without repeats (per session; module memory, nothing saved)
const seen=new Map<string,string[]>();
/** Up to n ids of `pool` not handed out this session under `key`; a used-up pool starts over (skipping the last one handed out). */
export function take<T extends {id:string}>(key:string,pool:readonly T[],n:number,rand:()=>number=Math.random):T[]{
 if(!pool.length||n<1)return [];let s=seen.get(key);if(!s){s=[];seen.set(key,s);}
 let open=pool.filter(p=>!s!.includes(p.id));if(open.length<n){const last=s.at(-1);s.length=0;open=[...open,...pool.filter(p=>p.id!==last&&!open.includes(p))];}
 const a=[...open];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 const out=a.slice(0,n);for(const o of out)s.push(o.id);return out;
}
export function resetTalkRotation(){seen.clear();}
const fill=(text:string,next:string)=>text.replace(/\{next\}/g,next||'the next station');

/**
 * One talk's definition for passenger `base` (its CAST entry): the station islanders who board keep their own talk; everyone else
 * gets banter + an island event + teaching + a quick question. `next`: the next stop's name.
 */
export function talkDefFor(base:NpcDefinition&{boarder?:string},next:string,rand:()=>number=Math.random):NpcDefinition{
 if(base.boarder||!isTalkRole(base.role))return base;
 const role:TalkRole=base.role,pool=ROLE_POOLS[role];
 const kind:EventKind=take(`likes:${role}`,pool.likes.map(id=>({id})),1,rand)[0].id;
 const event=take('events',EVENTS[kind],1,rand)[0]??take('events',EVENTS.collect,1,rand)[0];
 const teach=[...take(`teach:${role}`,pool.teach,1,rand),...take('fitness',FITNESS,1,rand)];// one archetype tip + one fitness / everyday-football idea
 const banter=take(`banter:${role}`,pool.banter.map(id=>({id})),1,rand)[0].id;
 const quiz=take(`quiz:${role}`,pool.quiz,1,rand)[0];
 const topic=(t:TalkTopic)=>({id:`tt-${t.id}`,question:t.question,answer:t.answer,followUp:t.followUp??{question:'Tell me more!',answer:t.learn?'There\'s a whole page on it in Learn, on the Futbol Island site.':'Ask me again on the next ride. I always have something new.'}});
 const {src:_q,...challenge}=quiz;void _q;
 return {...base,greeting:fill(banter,next),lines:undefined,topics:[topic(event),...teach.map(topic)],
  fresh:{topics:[],challenges:[challenge],openers:[],returning:[]}};
}

// ---- picking (pure; tests)
type V3={x:number;y:number;z:number};
/** Standing: the nearest talkable spot of train k within TALK_STAND of `me` and inside the camera's view cone (fwd: its horizontal look). */
export function pickStanding(spots:readonly Readonly<TalkSpot>[],count:number,k:number,me:{x:number;z:number},fwd:{x:number;z:number}):number{
 const fl=Math.hypot(fwd.x,fwd.z)||1;let best=-1,bd=TALK_STAND;
 for(let i=0;i<count;i++){const s=spots[i];if(s.k!==k)continue;const dx=s.x-me.x,dz=s.z-me.z,d=Math.hypot(dx,dz);if(d>=bd)continue;
  if(d>.25&&(dx*fwd.x+dz*fwd.z)/(d*fl)<TALK_VIEW_COS)continue;best=i;bd=d;}
 return best;
}
/** POLISH 4: the nearest talkable spot of train k within `reach` of `me` (no view cone), keeping `keep` (a cast) while it is within
 *  reach + TALK_HOLD and nobody is TALK_SWITCH m closer; -1 none. */
export function pickNear(spots:readonly Readonly<TalkSpot>[],count:number,k:number,me:{x:number;z:number},reach:number,keep=-1):number{
 let best=-1,bd=reach,ki=-1,kd=Infinity;
 for(let i=0;i<count;i++){const s=spots[i];if(s.k!==k)continue;const d=Math.hypot(s.x-me.x,s.z-me.z);if(s.cast===keep&&d<reach+TALK_HOLD){ki=i;kd=d;}if(d<bd){best=i;bd=d;}}
 return ki>=0&&!(best>=0&&best!==ki&&bd<kd-TALK_SWITCH)?ki:best;
}
/** The talkable spot of train k a ray (o + t·dir, dir unit) hits first (a vertical body capsule), within `reach` m of `me`; -1 none. */
export function pickRay(spots:readonly Readonly<TalkSpot>[],count:number,k:number,o:V3,dir:V3,me:{x:number;z:number},reach:number,clear?:(s:Readonly<TalkSpot>)=>boolean):number{
 let best=-1,bt=Infinity;
 for(let i=0;i<count;i++){const s=spots[i];if(s.k!==k||Math.hypot(s.x-me.x,s.z-me.z)>reach)continue;
  const sc=s.kid?KID:1,lo=s.y+(s.standing?STAND_LO:SIT_LO)*sc,hi=s.y+(s.standing?STAND_HI:SIT_HI)*sc;
  // closest approach of the ray to the vertical axis through (s.x, s.z), in the horizontal plane
  const ox=o.x-s.x,oz=o.z-s.z,a=dir.x*dir.x+dir.z*dir.z;let t=a>1e-9?-(ox*dir.x+oz*dir.z)/a:0;if(t<0)t=0;
  const hx=ox+dir.x*t,hz=oz+dir.z*t,hy=o.y+dir.y*t;if(hx*hx+hz*hz>BODY_R*BODY_R||hy<lo-.1||hy>hi+.1)continue;
  if(t<bt&&(!clear||clear(s))){bt=t;best=i;}}
 return best;
}
/** POLISH 3 (coordinator: no talking "through" the car): the line from the eye o to a body point p, both in ONE car's local frame
 *  (x across, y up from the rail top, z along; the body ±HALF_W × floor…roof × ±6). True when the line reaches p without passing a
 *  solid panel: the eye is inside that car, or the line enters it through a side's window band or an open doorway. The roof, the
 *  ends, the underframe and the side panels block. Pure (tests). */
export function carSightClear(ox:number,oy:number,oz:number,px:number,py:number,pz:number,doorOpen:boolean):boolean{
 const X=HALF_W,Y0=CAR_FLOOR_Y-.15,Y1=ROOF_TOP-.1,Z=6;
 if(Math.abs(ox)<X&&oy>Y0&&oy<Y1&&Math.abs(oz)<Z)return true;
 // slab test for the segment o → p: the entry parameter and the face it enters through
 const d=[px-ox,py-oy,pz-oz],o=[ox,oy,oz],lo=[-X,Y0,-Z],hi=[X,Y1,Z];let tin=0,tout=1,face=-1;
 for(let a=0;a<3;a++){if(Math.abs(d[a])<1e-9){if(o[a]<lo[a]||o[a]>hi[a])return true;continue;}
  let t0=(lo[a]-o[a])/d[a],t1=(hi[a]-o[a])/d[a];if(t0>t1){const q=t0;t0=t1;t1=q;}
  if(t0>tin){tin=t0;face=a;}if(t1<tout)tout=t1;if(tin>tout)return true;}// misses this car's box
 if(face!==0)return false;// through the roof, the floor or an end
 const y=oy+d[1]*tin,z=oz+d[2]*tin;
 if(y>=WIN_Y0-.08&&y<=WIN_Y1+.08)return true;// a window band (the panes between the frames: close enough for a tap)
 if(doorOpen)for(const dz of DOORS)if(Math.abs(z-dz)<DOOR_HALF&&y>DOOR_Y0&&y<DOOR_Y1)return true;
 return false;
}

type Ports={/** POLISH 4: the island's hover sound on a new hovered passenger */hoverSound?:()=>void;states:()=>readonly {next:number;doors?:number}[]|undefined;/** POLISH 3: car c of train k's matrix (occlusion by the car body) */carMatrix?:(k:number,c:number,out:T.Matrix4)=>T.Matrix4;open:(npc:NpcDefinition)=>void;blocked:()=>boolean};
export function createTrainPassengerTalk(scene:T.Scene,pax:TrainPassengers,ports:Ports){
 // POLISH 4 (owner: "exactly like island NPCs"): the island's own hover glow (npcHover: ring, halo, soft column) on the hovered
 // passenger, and the island's near-only name tag (its colours and type) over the one the Talk prompt offers: one small sprite of
 // constant screen size (a world-sized tag 1 m away in first person would fill the view), hidden whenever nobody is offered.
 const glow=createNpcHover(scene,'train-talk-hover'),ring=glow.root;let hoverOn=false;
 let tagCanvas:HTMLCanvasElement|null=null,tagTex:T.CanvasTexture|null=null;// made on the first tag (none in a ride without talk)
 const tag=new T.Sprite(new T.SpriteMaterial({depthTest:false,depthWrite:false,sizeAttenuation:false}));tag.scale.set(.15,.047,1);tag.visible=false;tag.name='train-talk-tag';tag.renderOrder=3;scene.add(tag);
 let candCast=-1,tagCast=-1;const glowAt={id:'',x:0,y:0,z:0};
 const drawTag=(name:string)=>{if(typeof document==='undefined')return;if(!tagCanvas){tagCanvas=document.createElement('canvas');tagCanvas.width=512;tagCanvas.height=160;tagTex=new T.CanvasTexture(tagCanvas);tagTex.colorSpace=T.SRGBColorSpace;tag.material.map=tagTex;tag.material.needsUpdate=true;}
  const ctx=tagCanvas.getContext('2d');if(!ctx||!tagTex)return;ctx.clearRect(0,0,512,160);ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';
  ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(name,256,66,470);ctx.fillStyle='#e6cb8b';ctx.font='700 25px sans-serif';ctx.fillText('LET’S TALK',256,115,470);tagTex.needsUpdate=true;};
 const ndc=new T.Vector2(),tapV=new T.Vector2(),centre=new T.Vector2(0,0),rc=new T.Raycaster(),me={x:0,z:0};
 const defs=new Map<number,NpcDefinition>();// the definition offered to each passenger until they are talked to (no rotation churn)
 let dom:HTMLElement|null=null,cam:T.Camera|null=null,curK=-1,curStanding=false,curTalking=false,swallowClick=false,hoverDirty=false,mouseIn=false,hovered=-1,hoveredCast=-1,down:{x:number;y:number;t:number;id:number}|null=null;
 let lastTap='',aimed=false,talkCast=-1,lastTalkId:string|null=null,cursorSet=false;
 const toNdc=(e:PointerEvent,out:T.Vector2)=>{const r=dom!.getBoundingClientRect();out.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);};
 const onMove=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;mouseIn=true;toNdc(e,ndc);hoverDirty=true;};
 const onLeave=()=>{mouseIn=false;hoverDirty=true;};
 const onDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};};
 // A tap is resolved right here, in the capture phase, so a passenger hit is not ALSO a click on an island hover target behind
 // them (owner's station-house stamp, a vending machine...): Town's canvas pointerup / click handlers never see it.
 const onUp=(e:PointerEvent)=>{const d=down;down=null;if(!d||d.id!==e.pointerId)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>TAP_PX||performance.now()-d.t>TAP_MS)return;
  if(curK<0||!cam||curTalking)return;if(ports.blocked()){lastTap='blocked';return;}
  toNdc(e,tapV);const i=rayAt(cam,tapV,curK,curStanding?TALK_STAND+.5:SEAT_REACH);lastTap=i<0?'miss':'open';if(i<0)return;
  e.stopImmediatePropagation();swallowClick=true;const def=defOf(pax.spots().list[i],curK);if(def)ports.open(def);};
 const onClick=(e:MouseEvent)=>{if(!swallowClick)return;swallowClick=false;e.stopImmediatePropagation();e.preventDefault();};
 const castOf=(id:string|null)=>{if(!id||!id.startsWith('pax-'))return -1;const n=Number(id.slice(4));return Number.isInteger(n)?n:-1;};
 const nextName=(k:number)=>{const st=ports.states()?.[k];return st?TRAIN_STOPS[st.next]?.station.name??'':'';};
 function defOf(spot:Readonly<TalkSpot>,k:number):NpcDefinition|null{
  const base=pax.def(spot.cast);if(!base)return null;let d=defs.get(spot.cast);if(!d){d=talkDefFor(base,nextName(k));defs.set(spot.cast,d);}
  d.x=spot.x;d.z=spot.z;return d;}
 // POLISH 3: a passenger behind the car's side panel or roof (outside views) is not hit: the eye → body line must pass each car of
 // the train clear (inside it, or in through a window band / an open doorway): two small matrix inverses per candidate tested
 const cm=new T.Matrix4(),inv=new T.Matrix4(),eo=new T.Vector3(),ep=new T.Vector3();let rayK=-1;
 const sightClear=(s:Readonly<TalkSpot>)=>{if(!ports.carMatrix)return true;const st=ports.states()?.[rayK],open=!!st&&(st.doors??0)>.5;
  for(let c=0;c<TRAIN_CARS;c++){ports.carMatrix(rayK,c,cm);inv.copy(cm).invert();eo.copy(rc.ray.origin).applyMatrix4(inv);ep.set(s.x,s.y+(s.standing?1.45:1.15)*(s.kid?KID:1),s.z).applyMatrix4(inv);
   if(!carSightClear(eo.x,eo.y,eo.z,ep.x,ep.y,ep.z,open))return false;}
  return true;};
 function rayAt(camera:T.Camera,at:T.Vector2,k:number,reach:number){rc.setFromCamera(at,camera);rayK=k;const {list,count}=pax.spots();return pickRay(list,count,k,rc.ray.origin,rc.ray.direction,me,reach,sightClear);}
 // Town resets the canvas cursor every frame before this runs (its own hover targets), so a hovered passenger re-asserts it
 const setCursor=(on:boolean)=>{if(!dom)return;if(on){cursorSet=true;if(dom.style.cursor!=='pointer')dom.style.cursor='pointer';}else if(cursorSet){cursorSet=false;dom.style.cursor='';}};
 return {
  attach(el:HTMLElement){dom=el;el.addEventListener('pointermove',onMove,{passive:true});el.addEventListener('pointerleave',onLeave,{passive:true});
   el.addEventListener('pointerdown',onDown,{passive:true});el.addEventListener('pointerup',onUp,{capture:true});el.addEventListener('click',onClick,{capture:true});},
  /** Every frame after trainPassengers.update. k: the train I ride (-1: not riding); my world spot; the open chat's NPC id. */
  frame(camera:T.Camera,k:number,standing:boolean,x:number,z:number,talkingId:string|null,dt=1/60,reduced=false){
   cam=camera;curK=k;curStanding=standing;curTalking=!!talkingId;
   if(k<0){candCast=-1;if(tag.visible)tag.visible=false;if(hovered>=0||hoverOn||talkCast>=0){hovered=hoveredCast=-1;hoverOn=false;setCursor(false);}if(glow.root.visible)glow.update(null,dt,reduced);if(talkCast>=0){talkCast=-1;pax.face(-1);}if(lastTalkId!==talkingId)lastTalkId=talkingId;return;}
   me.x=x;me.z=z;const reach=standing?TALK_STAND+.5:SEAT_REACH;
   // the chat: who turns to me; when it closes, their next talk gets fresh content
   if(talkingId!==lastTalkId){const was=castOf(lastTalkId);if(was>=0)defs.delete(was);lastTalkId=talkingId;talkCast=castOf(talkingId);if(talkCast<0)pax.face(-1);}
   if(talkCast>=0)pax.face(talkCast,x,z);
   if(talkingId){if(tag.visible)tag.visible=false;if(hovered>=0||hoverOn){hovered=hoveredCast=-1;hoverOn=false;setCursor(false);}glow.update(null,dt,reduced);return;}
   if(hoverDirty){hoverDirty=false;const i=mouseIn&&!ports.blocked()?rayAt(camera,ndc,k,reach):-1,was=hoveredCast;hoveredCast=i>=0?pax.spots().list[i].cast:-1;if(hoveredCast>=0&&hoveredCast!==was)ports.hoverSound?.();}
   // the hovered passenger moves with the train: follow their spot (found again by cast; gone = unhover)
   hovered=-1;if(hoveredCast>=0){const {list,count}=pax.spots();for(let i=0;i<count;i++)if(list[i].cast===hoveredCast&&list[i].k===k){hovered=i;break;}if(hovered<0)hoveredCast=-1;}
   if(hovered>=0){const s=pax.spots().list[hovered];glowAt.id='pax-'+s.cast;glowAt.x=s.fx;glowAt.y=s.y;glowAt.z=s.fz;glow.update(glowAt,dt,reduced);hoverOn=true;setCursor(true);}else{if(hoverOn){hoverOn=false;setCursor(false);}if(glow.root.visible)glow.update(null,dt,reduced);}
   // the near-only name tag over the offered passenger (moves with the train: their spot this frame)
   let ts=-1;if(candCast>=0){const {list,count}=pax.spots();for(let i=0;i<count;i++)if(list[i].cast===candCast&&list[i].k===k){ts=i;break;}}
   if(ts>=0){const s=pax.spots().list[ts];if(tagCast!==s.cast){tagCast=s.cast;drawTag(pax.def(s.cast)?.name??'');}tag.position.set(s.x,s.y+(s.standing?2.05:1.62)*(s.kid?KID:1),s.z);if(!tag.visible)tag.visible=true;}else if(tag.visible)tag.visible=false;
  },
  /** HUD tick: the passenger the Talk prompt offers (or null). getOffPrimary: a stop's Get off pill is up (then aiming only). */
  candidate(camera:T.Camera,k:number,standing:boolean,x:number,z:number,getOffPrimary:boolean):NpcDefinition|null{
   // POLISH 4: island NPC rules: the nearest within reach (train-relative), any camera view, seated or standing, at a stop too
   // (Talk in the NPC slot beside the Get off pill); aiming at someone in reach still picks them (desktop). getOffPrimary: unused now.
   aimed=false;void getOffPrimary;if(k<0){candCast=-1;return null;}me.x=x;me.z=z;const {list,count}=pax.spots(),reach=standing?TALK_NEAR:SEAT_REACH;
   let i=rayAt(camera,centre.set(0,0),k,reach);if(i>=0)aimed=true;else i=pickNear(list,count,k,me,reach,candCast);
   candCast=i>=0?list[i].cast:-1;return i>=0?defOf(list[i],k):null;},
  /** The current candidate is under the camera's aim (E may talk even while Get off is the primary prompt). */
  get aimed(){return aimed;},
  /** Tests / checks. */
  get hovered(){return hoveredCast;},get lastTap(){return lastTap;},ring,get hoverShown(){return hoverOn;},get tagShown(){return tag.visible;},
  dispose(){if(dom){dom.removeEventListener('pointermove',onMove);dom.removeEventListener('pointerleave',onLeave);dom.removeEventListener('pointerdown',onDown);dom.removeEventListener('pointerup',onUp,{capture:true});dom.removeEventListener('click',onClick,{capture:true});setCursor(false);}
   glow.dispose();tag.removeFromParent();tag.material.dispose();tagTex?.dispose();pax.face(-1);},
 };
}
export type TrainPassengerTalk=ReturnType<typeof createTrainPassengerTalk>;
