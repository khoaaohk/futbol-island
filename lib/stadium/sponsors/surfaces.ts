/**
 * The stadium's sponsor surfaces (Nov 12 2026, phase 4). Loaded lazily (index.ts loadSponsorSurfaces) the first time the player
 * nears the stadium; nothing here runs before that.
 *
 * Cost: ONE texture (the atlas, atlas.ts), ONE material, TWO meshes = two draw calls for every sponsor surface:
 *  - `ring`: the 16 pitchside boards and the big screen (the parts that move);
 *  - `still`: gate arch, roof fascia, plaza flag banners (both faces; uploaded sponsors only) and the centre-circle disc (same).
 * No frame loop of its own. The ring's onBeforeRender (three calls it only when the ring is actually drawn: in view, not culled,
 * visible) advances ONE shared uniform for the LED scroll and swaps board pictures every rotateMs, and only while the camera is
 * within `animRadius`. Off screen, hidden or far away: zero work. The still mesh never changes after it is built.
 */
import * as T from 'three';
import {atlasItems,composeAtlas,packAtlas,pickKey,uvOf,BLANK_KEY,DESKTOP_ATLAS_MAX,PHONE_ATLAS_MAX,type CellSource,type UvRect,type AtlasPlan} from './atlas';
import {defaultStadiumLayout,layoutProblems,repeatsFor,type SponsorLayout,type SponsorQuad} from './layout';
import {drawPlaceholder,PLACEHOLDER_COUNT,type HouseArt} from './placeholders';
import {DRIP_FC_ART,type DripArtKey} from '../dripfc';
import {boardPick,parseFeed,pickSlots,rotationStep,SLOT_SPECS,type SlotPick,type SponsorFeed,type SponsorSlot} from './slots';
import {countStadiumSeen} from '@/lib/analytics/sponsorEvents';

/** Effect per vertex: 0 plain, 1 LED board (scrolls, dot pattern), 2 LED screen (dot pattern, no scroll). */
const FX_PLAIN=0,FX_SCROLL=1,FX_LED=2;
/** Scroll speed in picture widths per second (gentle: one picture passes in 25 s). */
export const SCROLL_PER_SEC=.04;
/** The ring animates and rotates only while the camera is this close to the stadium centre (metres). */
export const ANIM_RADIUS=140;

/** `house`: Drip FC's decoded pictures for the built-in panels (placeholders.ts); optional, lettering without them. */
export type SponsorArt={picks:Record<SponsorSlot,SlotPick[]>;images:Map<string,CellSource>;feed:SponsorFeed;house?:HouseArt};
export type SurfaceOptions={
 /** Atlas edge limit: defaults to 1024 on phones (coarse pointer), 2048 on desktop (used only if 1024 cannot hold the cells). */
 maxAtlas?:number;
 animRadius?:number;
 /** Clock in ms (tests). */
 now?:()=>number;
 /** A canvas factory (tests). */
 canvas?:(size:number)=>HTMLCanvasElement|OffscreenCanvas;
};
export type SponsorSurfaces={
 /** Holds both meshes; already added to the scene passed in. Place / rotate it with the stadium. */
 group:T.Group;
 ring:T.Mesh;still:T.Mesh;
 material:T.MeshBasicMaterial;texture:T.CanvasTexture;
 /** The atlas cell of a slot instance right now (board i, flag i, ...), for phase 2's own geometry. */
 uvRect:(slot:SponsorSlot,index?:number)=>UvRect;
 /** Give phase 2's own geometry (with a 0..1 `uv`) the sponsor attributes so it can use `material`. */
 applyTo:(geometry:T.BufferGeometry,slot:SponsorSlot,index?:number)=>void;
 /** The big screen shows a sponsor card (true, between matches) or goes dark for the stadium's own score (false). */
 setScreenSponsor:(on:boolean)=>void;
 stats:{drawCalls:number;atlasSize:number;textureBytes:number;cells:number};
 dispose:()=>void;
};

const coarse=()=>typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;

/** The material: MeshBasic (fog, tone mapping and colour space as everywhere else) sampling its atlas cell per vertex. */
export function createSponsorMaterial(texture:T.Texture){
 const uScroll={value:0};
 const m=new T.MeshBasicMaterial({map:texture});
 m.onBeforeCompile=sh=>{
  sh.uniforms.uScroll=uScroll;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aCell;attribute float aFx;varying vec4 vCell;varying float vFx;varying vec2 vLocal;')
   .replace('#include <uv_vertex>','#include <uv_vertex>\nvCell=aCell;vFx=aFx;vLocal=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uScroll;varying vec4 vCell;varying float vFx;varying vec2 vLocal;')
   .replace('#include <map_fragment>',[
    'float sc=step(.5,vFx)*step(vFx,1.5);',
    'vec2 f=vec2(fract(vLocal.x+sc*uScroll),clamp(vLocal.y,0.,1.));',
    'vec2 g=vLocal*vCell.zw;',// unwrapped gradients: no mip seam where a repeat wraps
    'vec4 sampledDiffuseColor=textureGrad(map,vCell.xy+f*vCell.zw,dFdx(g),dFdy(g));',
    'if(vFx>.5){vec2 q=fract(vec2(vLocal.x*64.,vLocal.y*8.))-.5;float k=clamp(1.-1.5*max(fwidth(vLocal.x*64.),fwidth(vLocal.y*8.)),0.,1.);',
    ' sampledDiffuseColor.rgb*=mix(1.,mix(.74,1.1,smoothstep(.5,.22,length(q))),k*.6);}',// LED dots, faded out before they alias
    'diffuseColor*=sampledDiffuseColor;'].join('\n'));
 };
 m.customProgramCacheKey=()=>'stadium-sponsor-v1';
 return {material:m,uScroll};
}

type Builder={pos:number[];uv:number[];cell:number[];fx:number[];idx:number[]};
const builder=():Builder=>({pos:[],uv:[],cell:[],fx:[],idx:[]});
/** One quad facing `yaw`. `rep` = picture repeats along it (the shader wraps within the cell). */
function quad(b:Builder,q:SponsorQuad,uv:UvRect,fx:number,rep:number){
 const c=Math.cos(q.yaw),s=Math.sin(q.yaw),hw=q.w/2,hh=q.h/2,base=b.pos.length/3;
 // Right vector of a face looking towards (sin yaw, 0, cos yaw) is (cos yaw, 0, -sin yaw).
 for(const [lx,ly,u,v] of [[-hw,-hh,0,0],[hw,-hh,rep,0],[hw,hh,rep,1],[-hw,hh,0,1]] as const){
  b.pos.push(q.x+lx*c,q.y+ly,q.z-lx*s);b.uv.push(u,v);b.cell.push(uv.u,uv.v,uv.w,uv.h);b.fx.push(fx);
 }
 b.idx.push(base,base+1,base+2,base,base+2,base+3);
}
function disc(b:Builder,c:{x:number;z:number;r:number;y?:number},uv:UvRect,seg=32){
 const base=b.pos.length/3,y=c.y??.03;
 b.pos.push(c.x,y,c.z);b.uv.push(.5,.5);b.cell.push(uv.u,uv.v,uv.w,uv.h);b.fx.push(FX_PLAIN);
 for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,cx=Math.cos(a),sz=Math.sin(a);
  // Seen from above with north up: +X right, -Z up the picture.
  b.pos.push(c.x+cx*c.r,y,c.z-sz*c.r);b.uv.push(.5+cx*.5,.5+sz*.5);b.cell.push(uv.u,uv.v,uv.w,uv.h);b.fx.push(FX_PLAIN);
  if(i)b.idx.push(base,base+i,base+i+1);
 }
}
function geometry(b:Builder){
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(b.pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));
 g.setAttribute('aCell',new T.Float32BufferAttribute(b.cell,4));g.setAttribute('aFx',new T.Float32BufferAttribute(b.fx,1));
 g.setIndex(b.idx);g.computeBoundingSphere();return g;
}

/** Pictures + placeholders → one canvas → one mipmapped texture. */
export function buildAtlasTexture(art:SponsorArt,opt:SurfaceOptions={}){
 const items=atlasItems(art.picks),phone=coarse(),max=opt.maxAtlas??(phone?PHONE_ATLAS_MAX:DESKTOP_ATLAS_MAX);
 let plan:AtlasPlan=packAtlas(items,Math.min(max,PHONE_ATLAS_MAX));
 if(plan.scale<1&&max>PHONE_ATLAS_MAX)plan=packAtlas(items,max);
 const canvas=opt.canvas?opt.canvas(plan.size):Object.assign(document.createElement('canvas'),{width:plan.size,height:plan.size});
 const ctx=(canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
 composeAtlas(ctx,plan,art.picks,art.images,(c,slot,i,r)=>drawPlaceholder(c,slot,i,r,art.house));
 const tex=new T.CanvasTexture(canvas as HTMLCanvasElement);
 tex.colorSpace=T.SRGBColorSpace;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.anisotropy=4;
 tex.needsUpdate=true;
 return {texture:tex,plan,bytes:Math.round(plan.size*plan.size*4*4/3)};
}

/** Build the surfaces from art already loaded (sync). createSponsorSurfaces below loads the art first. */
export function buildSponsorSurfaces(scene:T.Object3D,layout:SponsorLayout,art:SponsorArt,opt:SurfaceOptions={}):SponsorSurfaces{
 const bad=layoutProblems(layout);if(bad.length)throw new Error('sponsor layout: '+bad.join(', '));
 const now=opt.now??(()=>performance.now()),radius=opt.animRadius??ANIM_RADIUS;
 const {texture,plan,bytes}=buildAtlasTexture(art,opt);
 const {material,uScroll}=createSponsorMaterial(texture);
 const cellOf=(p:SlotPick)=>uvOf(plan.rects[pickKey(p)],plan.size),blank=uvOf(plan.rects[BLANK_KEY],plan.size);
 const pick=(slot:SponsorSlot,i:number,step=0)=>{const list=art.picks[slot];return list[boardPick(i,step,list.length)];};

 // Ring: boards then the screen (its 4 vertices last).
 const rb=builder();
 layout.boards.forEach((q,i)=>quad(rb,q,cellOf(pick('board',i)),FX_SCROLL,repeatsFor(q,SLOT_SPECS.board.aspect)));
 quad(rb,layout.screen,cellOf(pick('screen',0)),FX_LED,1);
 const ring=new T.Mesh(geometry(rb),material);ring.name='stadium-sponsors-ring';
 // Still: gate, fascia, flags (front + mirrored back), centre disc.
 const sb=builder();
 quad(sb,layout.gate,cellOf(pick('gate',0)),FX_PLAIN,1);
 layout.fascia.forEach((q,i)=>quad(sb,q,cellOf(pick('fascia',i)),FX_PLAIN,repeatsFor(q,SLOT_SPECS.fascia.aspect)));
 // The flag banners only for an uploaded flag sponsor: otherwise the poles fly just their national flags (lib/town/plazaFlags.ts).
 if(art.picks.flag.some(p=>p.sponsor))layout.flags.forEach((q,i)=>{const c=cellOf(pick('flag',i));quad(sb,q,c,FX_PLAIN,1);quad(sb,{...q,yaw:q.yaw+Math.PI},c,FX_PLAIN,1);});
 // The centre disc only for an uploaded sponsor: otherwise the grass shows Drip FC's painted drop (stadiumWorld.ts pitchLogo).
 if(art.picks.centre.some(p=>p.sponsor))disc(sb,layout.centre,cellOf(pick('centre',0)));
 const still=new T.Mesh(geometry(sb),material);still.name='stadium-sponsors-still';
 for(const m of [ring,still]){m.castShadow=false;m.receiveShadow=false;m.matrixAutoUpdate=false;m.updateMatrix();}

 const group=new T.Group();group.name='stadium-sponsors';group.add(ring,still);scene.add(group);
 const boardsPaid=art.picks.board.some(p=>p.sponsor),screenPaid=art.picks.screen.some(p=>p.sponsor);
 const cellAttr=ring.geometry.getAttribute('aCell') as T.BufferAttribute,screenAt=layout.boards.length*4;
 let screenOn=true,boardStep=0,screenStep=0;
 const writeCell=(v0:number,uv:UvRect)=>{for(let v=v0;v<v0+4;v++)cellAttr.setXYZW(v,uv.u,uv.v,uv.w,uv.h);};
 const writeScreen=()=>{writeCell(screenAt,screenOn?cellOf(pick('screen',0,screenStep)):blank);};
 const centre=new T.Vector3(),cam=new T.Vector3();
 ring.onBeforeRender=(_r,_s,camera)=>{
  centre.setFromMatrixPosition(group.matrixWorld);
  if(cam.setFromMatrixPosition(camera.matrixWorld).distanceTo(centre)>radius)return;
  const t=now();uScroll.value=(t/1000*SCROLL_PER_SEC)%1;
  let dirty=false;
  const b=rotationStep('board',t);if(b!==boardStep&&art.picks.board.length>1){boardStep=b;layout.boards.forEach((_q,i)=>writeCell(i*4,cellOf(pick('board',i,b))));dirty=true;}
  const s=rotationStep('screen',t);if(s!==screenStep&&art.picks.screen.length>1){screenStep=s;if(screenOn){writeScreen();dirty=true;}}
  if(dirty)cellAttr.needsUpdate=true;
  if(camera.userData.broadcastFeed)return;// the big screen's back-face feed (lib/town/stadiumFeed.ts) is not a player's view: no counts
  if(boardsPaid)countStadiumSeen('boards_seen');
  if(screenOn&&screenPaid)countStadiumSeen('screen_card');
 };

 const indexed=(slot:SponsorSlot,i=0)=>{
  if(slot==='board')return cellOf(pick('board',i,boardStep));
  if(slot==='screen')return screenOn?cellOf(pick('screen',0,screenStep)):blank;
  return cellOf(pick(slot,i));
 };
 return {
  group,ring,still,material,texture,
  uvRect:indexed,
  applyTo(g,slot,i=0){
   const n=g.getAttribute('position').count,uv=indexed(slot,i);
   g.setAttribute('aCell',new T.Float32BufferAttribute(Array.from({length:n},()=>[uv.u,uv.v,uv.w,uv.h]).flat(),4));
   g.setAttribute('aFx',new T.Float32BufferAttribute(new Array(n).fill(slot==='board'?FX_SCROLL:slot==='screen'?FX_LED:FX_PLAIN),1));
  },
  setScreenSponsor(on){if(on===screenOn)return;screenOn=on;writeScreen();cellAttr.needsUpdate=true;},
  stats:{drawCalls:2,atlasSize:plan.size,textureBytes:bytes,cells:Object.keys(plan.rects).length},
  dispose(){group.removeFromParent();ring.geometry.dispose();still.geometry.dispose();material.dispose();texture.dispose();},
 };
}

/** Fetch and decode the sponsor pictures at their cell size; a picture that fails is dropped (its slot falls back). */
export async function loadSponsorArt(feed:SponsorFeed,fetchImpl:typeof fetch=fetch):Promise<SponsorArt>{
 const images=new Map<string,CellSource>();
 await Promise.all(feed.entries.map(async e=>{
  try{
   const r=await fetchImpl(e.image,{mode:'cors',credentials:'omit',signal:AbortSignal.timeout(8000)});if(!r.ok)return;
   const [w,h]=SLOT_SPECS[e.slot].cell;
   images.set(e.id,await createImageBitmap(await r.blob(),{resizeWidth:w,resizeHeight:h,resizeQuality:'high'}));
  }catch{/* placeholder instead */}
 }));
 const ok={...feed,entries:feed.entries.filter(e=>images.has(e.id))};
 const picks=pickSlots(ok.entries,s=>PLACEHOLDER_COUNT[s]);
 // Drip FC's three small pictures (same origin, ~26 KB), only while some slot still shows the built-in panels.
 const house:HouseArt={};
 if(Object.values(picks).some(l=>l.some(p=>!p.sponsor)))await Promise.all((Object.keys(DRIP_FC_ART) as DripArtKey[]).map(async k=>{
  try{const r=await fetchImpl(DRIP_FC_ART[k],{credentials:'omit',signal:AbortSignal.timeout(8000)});if(r.ok)house[k]=await createImageBitmap(await r.blob());}catch{/* lettering instead */}
 }));
 try{await Promise.race([document.fonts.load('400 48px IslandBrush'),new Promise(r=>setTimeout(r,1500))]);}catch{/* fallback font */}
 return {picks,images,feed:ok,house};
}

/** GET /api/stadium-sponsors (CDN-cached). Any failure = placeholders. */
export async function fetchSponsorFeed(fetchImpl:typeof fetch=fetch):Promise<SponsorFeed>{
 try{const r=await fetchImpl('/api/stadium-sponsors',{credentials:'omit'});if(r.ok)return parseFeed(await r.json());}catch{/* placeholders */}
 return parseFeed(null);
}

/**
 * THE API for the stadium: fetch the feed, decode the pictures, compose the atlas, build both meshes and add them to `scene`.
 * `layout` defaults to the concept layout. Images are closed once they are on the canvas.
 */
export async function createSponsorSurfaces(scene:T.Object3D,layout:SponsorLayout=defaultStadiumLayout(),opt:SurfaceOptions&{feed?:SponsorFeed}={}):Promise<SponsorSurfaces>{
 const art=await loadSponsorArt(opt.feed??await fetchSponsorFeed());
 const s=buildSponsorSurfaces(scene,layout,art,opt);
 for(const img of [...art.images.values(),...Object.values(art.house??{})])(img as ImageBitmap).close?.();
 return s;
}
