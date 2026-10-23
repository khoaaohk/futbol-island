// Friend bumps, the drawn side (docs/multiplayer-friend-bumps.md; the pure detection + curves are lib/town/friendBump.ts).
// remoteAvatars.ts calls detect() once a frame BEFORE its friend pass (last frame's shown / shield / door states: one frame late, unseen),
// applies a friend's overlay on their rig root right before it is batched, and update() moves the bursts. Town applies the local player's
// overlay around renderer.render only (applyLocalBump / restoreLocalBump), so no gameplay code ever reads a bumped transform.
// Heat: the burst pool (3 bursts x (1 bubble + 4 stars)) is made on the FIRST bump only; textures are cached canvases (one per word + one
// star), nothing is allocated per frame; everything sleeps (invisible, no work) when no burst is alive.
import * as T from 'three';
import {BUMP_BODIES,FAM,KIND,bumpFamily,bumpPose,createBumpBody,createBumpDetector,createBumpPose,createBumpReact,detectBumps,resetBumps,stepBump,type BumpBody,type BumpPose,type BumpReact} from '../town/friendBump';
import {Mode,Zone} from '../../multiplayer/protocol/types';

/** What the layer needs from a remote entry (remoteAvatars' Entry has all of these). */
export interface BumpEntry{id:number;hidden:boolean;muted:boolean;shield:boolean;door:number;shown:boolean;rig:{root:T.Object3D}|null;bump:BumpReact}
interface PoseLike{x:number;y:number;z:number;yaw:number;speed:number;mode:number;zone:number;fade:number}
interface LocalLike{x:number;y:number;z:number;mode?:number}
/** The local player's overlay this frame (Town applies it around the render only). */
export interface LocalBump extends BumpPose{on:boolean;nx:number;nz:number}

const BUBBLE_W=2.4,BURSTS=3,STARS=4,BURST_S=1.0,STAR_S=.6,REDUCED_S=.6;
const WORDS:Record<number,readonly string[]>={[KIND.Walk]:['Oof!','Bonk!'],[KIND.Ride]:['Bonk!','Whoops!'],[KIND.Fly]:['Boing!','Whee!']};
const STAR_TINT=['#ffe066','#ffffff','#ffb3d9','#9be7ff'];
const wordTex=new Map<string,T.CanvasTexture>();let starTex:T.CanvasTexture|null=null;
function wordTexture(w:string){
 let t=wordTex.get(w);if(t)return t;
 const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');
 if(g){
  g.font='900 46px system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';const tw=Math.min(240,g.measureText(w).width+40);
  g.fillStyle='rgba(255,255,255,.96)';g.beginPath();g.roundRect?g.roundRect(128-tw/2,8,tw,66,30):g.rect(128-tw/2,8,tw,66);g.fill();
  g.beginPath();g.moveTo(116,72);g.lineTo(128,90);g.lineTo(140,72);g.fill();
  g.lineWidth=4;g.strokeStyle='#ffc93c';g.beginPath();g.roundRect?g.roundRect(128-tw/2,8,tw,66,30):g.rect(128-tw/2,8,tw,66);g.stroke();
  g.fillStyle='#e8562e';g.fillText(w,128,43);
 }
 t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;wordTex.set(w,t);return t;
}
function starTexture(){
 if(starTex)return starTex;
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 if(g){g.fillStyle='#ffffff';g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?9:30;g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}g.closePath();g.fill();}
 starTex=new T.CanvasTexture(c);starTex.colorSpace=T.SRGBColorSpace;return starTex;
}
type Burst={age:number;life:number;x:number;y:number;z:number;reduced:boolean;seed:number;bubble:T.Sprite;stars:T.Sprite[]};
const sprite=(parent:T.Object3D,map:T.Texture|null,tint?:string)=>{const s=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthWrite:false,color:tint??'#ffffff'}));s.visible=false;s.raycast=()=>{};s.renderOrder=4;parent.add(s);return s;};

// Local overlay save / restore (module scratch: no allocation).
const saved={on:false,px:0,py:0,pz:0,ry:0,rz:0,sx:1,sy:1,sz:1,vx:0,vy:0,vz:0,vry:0,vrz:0,hasV:false};
/** Town, right before renderer.render: puts the local overlay on the player (and the ride / jet) roots. Restored by restoreLocalBump. */
export function applyLocalBump(b:LocalBump,player:T.Object3D,vehicle:T.Object3D|null){
 saved.on=false;if(!b.on)return;
 saved.on=true;saved.px=player.position.x;saved.py=player.position.y;saved.pz=player.position.z;saved.ry=player.rotation.y;saved.rz=player.rotation.z;saved.sx=player.scale.x;saved.sy=player.scale.y;saved.sz=player.scale.z;
 const ox=b.nx*b.back,oz=b.nz*b.back;
 player.position.x+=ox;player.position.y+=b.lift;player.position.z+=oz;player.rotation.y+=b.yaw;player.rotation.z+=b.roll;
 player.scale.x*=b.bulge;player.scale.y*=b.squash;player.scale.z*=b.bulge;
 saved.hasV=!!vehicle&&vehicle.visible;
 if(saved.hasV&&vehicle){saved.vx=vehicle.position.x;saved.vy=vehicle.position.y;saved.vz=vehicle.position.z;saved.vry=vehicle.rotation.y;saved.vrz=vehicle.rotation.z;
  vehicle.position.x+=ox;vehicle.position.y+=b.lift;vehicle.position.z+=oz;vehicle.rotation.y+=b.yaw;vehicle.rotation.z+=b.roll;}
}
export function restoreLocalBump(player:T.Object3D,vehicle:T.Object3D|null){
 if(!saved.on)return;saved.on=false;
 player.position.set(saved.px,saved.py,saved.pz);player.rotation.y=saved.ry;player.rotation.z=saved.rz;player.scale.set(saved.sx,saved.sy,saved.sz);
 if(saved.hasV&&vehicle){vehicle.position.set(saved.vx,saved.vy,saved.vz);vehicle.rotation.y=saved.vry;vehicle.rotation.z=saved.vrz;}
}

const pose=createBumpPose();
/** Takes the previous frame's yaw overlay back off a friend's rig root (a far friend's rig is not re-posed every frame). */
export function unBump(root:T.Object3D,r:BumpReact){if(r.yawOn!==0){root.rotation.y-=r.yawOn;r.yawOn=0;}}
/** Puts a friend's overlay on their rig root (after the pose + any flourish; `scale` = the root's base scale this frame). True when it touched x / z rotation. */
export function applyBump(root:T.Object3D,r:BumpReact,reduced:boolean,scale:number):boolean{
 if(!r.on||reduced)return false;
 bumpPose(r,false,pose);
 root.position.x+=r.nx*pose.back;root.position.y+=pose.lift;root.position.z+=r.nz*pose.back;
 if(pose.squash!==1||pose.bulge!==1)root.scale.set(scale*pose.bulge,scale*pose.squash,scale*pose.bulge);
 root.rotation.order='YXZ';root.rotation.y+=pose.yaw;r.yawOn=pose.yaw;root.rotation.z+=pose.roll;
 return true;
}

export interface FriendBumps{
 readonly local:LocalBump;
 /** Bumps started so far (tests / heat checks). */
 readonly fired:number;
 detect(dt:number,list:readonly BumpEntry[],poses:ReadonlyMap<number,PoseLike>,local:LocalLike|null|undefined,reduced:boolean,saver:boolean):void;
 update(dt:number):void;
 dispose():void;
}
export function createFriendBumps(parent:T.Object3D):FriendBumps{
 const root=new T.Group();root.name='friend-bumps';parent.add(root);
 const det=createBumpDetector(),bodies:BumpBody[]=[];for(let i=0;i<BUMP_BODIES;i++)bodies.push(createBumpBody());
 const localReact=createBumpReact(),local:LocalBump={...createBumpPose(),on:false,nx:0,nz:1};
 let bursts:Burst[]|null=null,alive=0,count=0,lx=NaN,lz=NaN;
 function makeBursts(){
  bursts=[];for(let i=0;i<BURSTS;i++){const stars:T.Sprite[]=[];for(let s=0;s<STARS;s++)stars.push(sprite(root,starTexture(),STAR_TINT[s]));bursts.push({age:0,life:0,x:0,y:0,z:0,reduced:false,seed:0,bubble:sprite(root,null),stars});}
 }
 function burst(x:number,y:number,z:number,kind:number,reduced:boolean){
  if(!bursts)makeBursts();
  let b=bursts![0];for(let i=0;i<BURSTS;i++){const c=bursts![i];if(c.life<=0){b=c;break;}if(c.age>b.age)b=c;}// a free one, else the oldest
  if(b.life<=0)alive++;
  b.age=0;b.life=reduced?REDUCED_S:BURST_S;b.x=x;b.y=y+3.45/* above the name label (LABEL_Y 2.62): readable from the phone's island camera, ~35 m back */;b.z=z;b.reduced=reduced;b.seed=(count*.618)%1;
  const words=WORDS[kind]??WORDS[KIND.Walk],m=b.bubble.material as T.SpriteMaterial,tex=wordTexture(words[count%words.length]);
  if(m.map!==tex){m.map=tex;m.needsUpdate=true;}
  count++;
 }
 const kindOfFam=(f:number)=>f===FAM.Fly?KIND.Fly:f===FAM.Ride?KIND.Ride:KIND.Walk;
 return {
  local,
  get fired(){return det.fired;},
  detect(dt,list,poses,l,reduced,saver){
   // every reaction ages (also the ones not tested this frame), so nothing freezes mid-wobble
   stepBump(localReact,dt);for(let i=0;i<list.length;i++)stepBump(list[i].bump,dt);
   let n=0;
   if(!saver){
    if(l){const fam=bumpFamily(l.mode??Mode.Walk);
     let vx=0,vz=0;if(lx===lx&&dt>0){vx=(l.x-lx)/dt;vz=(l.z-lz)/dt;if(vx*vx+vz*vz>900){vx=0;vz=0;}}/* a teleport is not a bump */
     lx=l.x;lz=l.z;
     if(fam!==FAM.None){const b=bodies[n++];b.id=-1;b.x=l.x;b.y=l.y;b.z=l.z;b.vx=vx;b.vz=vz;b.fam=fam;b.mode=l.mode??Mode.Walk;b.react=localReact;}
    }else{lx=NaN;localReact.on=false;}
    for(let i=0;i<list.length&&n<BUMP_BODIES;i++){
     const e=list[i];if(!e.rig||!e.shown||e.hidden||e.muted||e.shield||e.door<1)continue;
     const p=poses.get(e.id);if(!p||p.zone===Zone.Indoors||p.fade<.99)continue;
     const fam=bumpFamily(p.mode);if(fam===FAM.None)continue;
     const b=bodies[n++];b.id=e.id;b.x=p.x;b.y=p.y;b.z=p.z;b.vx=Math.sin(p.yaw)*p.speed;b.vz=Math.cos(p.yaw)*p.speed;b.fam=fam;b.mode=p.mode;b.react=e.bump;
    }
   }else{localReact.on=false;lx=NaN;}
   let hits=0;if(n>1)hits=detectBumps(det,bodies,n,dt);else det.clock+=dt;
   for(let i=0;i<hits;i++){const h=det.hits[i];burst(h.x,h.y,h.z,kindOfFam(h.kind),reduced);}
   bumpPose(localReact,reduced,local);local.on=localReact.on&&!reduced;local.nx=localReact.nx;local.nz=localReact.nz;
  },
  update(dt){
   if(!bursts||alive===0)return;
   for(let i=0;i<BURSTS;i++){
    const b=bursts[i];if(b.life<=0)continue;
    b.age+=dt;
    if(b.age>=b.life){b.life=0;alive--;b.bubble.visible=false;for(const s of b.stars)s.visible=false;continue;}
    const t=b.age/b.life;
    if(b.reduced){// one tiny sparkle, no motion
     const s=b.stars[0];s.visible=true;s.position.set(b.x,b.y-1.6,b.z);s.scale.setScalar(.5);(s.material as T.SpriteMaterial).opacity=Math.min(1,(1-t)*2.5);
     b.bubble.visible=false;for(let k=1;k<STARS;k++)b.stars[k].visible=false;continue;
    }
    // the word: pops in (overshoot), floats up a little, fades out at the end
    const pop=b.age<.16?(b.age/.16)*1.18:b.age<.26?1.18-(b.age-.16)/.1*.18:1,bm=b.bubble.material as T.SpriteMaterial;
    b.bubble.visible=true;b.bubble.position.set(b.x,b.y+.45*t,b.z);b.bubble.scale.set(BUBBLE_W*pop,BUBBLE_W*pop*96/256,1);bm.opacity=Math.min(1,(1-t)/.3);
    // the stars burst out from the contact point and twinkle away
    const ts=Math.min(1,b.age/STAR_S),out=1-(1-ts)*(1-ts);
    for(let k=0;k<STARS;k++){const s=b.stars[k];if(ts>=1){s.visible=false;continue;}
     const a=(k/STARS+b.seed)*Math.PI*2;s.visible=true;s.position.set(b.x+Math.cos(a)*.9*out,b.y-1.9+.6*out+.15*Math.sin(k+ts*9),b.z+Math.sin(a)*.9*out);
     s.scale.setScalar(.5*(1-ts*.6));(s.material as T.SpriteMaterial).opacity=1-ts;}
   }
  },
  dispose(){
   if(bursts)for(const b of bursts){(b.bubble.material as T.Material).dispose();for(const s of b.stars)(s.material as T.Material).dispose();}
   bursts=null;alive=0;resetBumps(det);root.removeFromParent();
   for(const t of wordTex.values())t.dispose();wordTex.clear();starTex?.dispose();starTex=null;
  },
 };
}
