/**
 * Kindness train wraps (owner, Nov 24 2026: "there are three trains, can we put a graphics wrap on each train … the theme is being
 * kind to one another … each train should have a different design … keep it positive"). One theme per livery, across both cars and
 * both sides; the liveries (trainLiveries.ts) stay the base colours:
 *  A "Fair Play" (shaking hands, a high five, the referee's thumbs-up) · B "Help Each Other Up" (helping a fallen opponent up,
 *  passing, sharing a water bottle) · C "Cheer Everyone On" (a crowd cheering both teams, the keeper and the striker hugging).
 * v3 (owner, Nov 25 2026: "show drip fc and no images of kids or characters. still have the text"): no people at all; the Drip FC
 * crest and wordmark (lib/shop/clubArt.ts, the club's own masks) on club-blue cards with football objects per theme; the slogans,
 * boarding notes and Kenji's talk are unchanged. The masks are fetched on demand the first time a wrap is drawn on screen (never at
 * load: until then the atlas carries the lettered fallback), then the atlas is redrawn ONCE into the same texture (same size).
 *
 * Heat first: ONE canvas atlas drawn once at load (ATLAS_W × ATLAS_H, mipmapped), ONE mesh for every wrap of every train (one draw),
 * its own MeshStandardMaterial (never a map on the shared vehicle material: every street vehicle's program stays as it is). The
 * panels sit on the lower body band between the doors (car-local z PANELS, y WRAP_Y0 … WRAP_Y1: below the window frames, clear of
 * every door frame), WRAP_OUT m proud of the skin with a polygon offset (no z-fighting with the stripes and seams). Per car: 4
 * panels a side + the cab badge over the headmark. trainRunning.ts writes a car's quads from its instance matrix only for trains in
 * the near tier; the wraps fade out (vertex alpha) as a car shrinks on screen to LOD_NEAR_OUT, so they are gone before the far box
 * tier swaps in, and are collapsed (not drawn) for hidden / far trains. Night: the texture is its own emissive map, lit by the
 * shared night factor at NIGHT_GLOW (no light). No allocation per frame.
 */
import * as T from 'three';
import {HALF_W,DOORS,DOOR_HALF,WIN_Y0,BODY_Y0} from './trainCarModel';
import {TRAIN_COUNT,TRAIN_CARS} from './trainSchedule';
import {LIVERIES} from './trainLiveries';
import {drawWrapTile,drawWrapBadge,WRAP_TILES,type ClubMarkFn} from './trainWrapArt';
import {clubArtReady,drawClubMark} from '../shop/clubArt';
import type {NpcDefinition} from './npcDialogues';

/** The three themes (index = livery). Copy: kid-friendly, positive, football facts checked:
 *  - the handshake: teams shake hands before and after matches as a sign of respect (FIFA's pre-match handshake; "fair play").
 *  - a player down: teams kick the ball out so the injured player can be helped, and the other team gives it back from the throw-in
 *    (a long-standing sporting custom, not a Law of the Game).
 *  - clapping both teams: fans applauding good play by either side, players swapping shirts at full time, are respect traditions. */
export const WRAP_THEMES=[
 {id:'fair-play',name:'Fair Play',slogan:['Shake hands,','play fair!'],
  board:"You're on the Fair Play train! In football, shaking hands after the match shows respect.",
  kenji:'This is the Fair Play train! Win or lose, we shake hands at the final whistle.'},
 {id:'help-up',name:'Help Each Other Up',slogan:['Help a','friend up!'],
  board:"You're on the Help Each Other Up train! When a player is hurt, teams kick the ball out so they get help, then give it back.",
  kenji:'This is the Help Each Other Up train! If someone falls, offer a hand, even on the other team.'},
 {id:'cheer-all',name:'Cheer Everyone On',slogan:['Cheer for','everyone!'],
  board:"You're on the Cheer Everyone On train! Great fans clap good play by both teams.",
  kenji:'This is the Cheer Everyone On train! Clap a great play, whoever makes it.'},
] as const satisfies readonly {id:string;name:string;slogan:readonly [string,string];board:string;kenji:string}[];
/** Train i's theme (its livery: trainRunning lv = i % LIVERIES.length). */
export const wrapThemeOf=(train:number)=>WRAP_THEMES[((train%LIVERIES.length)+LIVERIES.length)%LIVERIES.length];

// ---------------------------------------------------------------- layout (car-local: +z toward its cab, +x left of travel, y up from the rail top)
/** Clear of a door's frame strip (trainCarModel: ±.06 m round the hole) by DOOR_CLEAR more. */
export const DOOR_CLEAR=.12,WRAP_Y0=BODY_Y0+.08,WRAP_Y1=WIN_Y0-.08,WRAP_OUT=.014;
const DZ=DOOR_HALF+.06+DOOR_CLEAR;
/** The 4 side panels' car-local z spans (−z → +z): gangway end, between the doors, cab end (the straight side: −5.9 … 5.62). */
export const PANELS:readonly [number,number][]=[[-5.8,DOORS[0]-DZ],[DOORS[0]+DZ,DOORS[1]-DZ],[DOORS[1]+DZ,DOORS[2]-DZ],[DOORS[2]+DZ,5.52]];
/** The cab badge: over the headmark (trainCarModel: the disc at y 1.66, r ≤ .24), under the grab rail (y 2.12), on the cab face. */
export const BADGE={y:2.01,r:.115,z:6.026} as const;
/** Quads per car: 2 sides × the panels + the badge. */
export const QUADS_PER_CAR=PANELS.length*2+1,WRAP_QUADS=TRAIN_COUNT*TRAIN_CARS*QUADS_PER_CAR;
/** The atlas: a row per theme (the 4 tiles at PX px/m, GUTTER px apart), then a strip of badges. */
export const ATLAS_W=1536,ATLAS_H=800,GUTTER=8,BADGE_PX=76;
const SPAN=PANELS.reduce((a,[z0,z1])=>a+z1-z0,0);
export const PX=Math.floor((ATLAS_W-GUTTER*(PANELS.length+1))/SPAN),ROW_H=Math.round((WRAP_Y1-WRAP_Y0)*PX);
export type Rect={x:number;y:number;w:number;h:number};
/** Tile k of theme t / theme t's badge, in atlas pixels. */
export function tileRect(t:number,k:number):Rect{let x=GUTTER;for(let i=0;i<k;i++)x+=Math.round((PANELS[i][1]-PANELS[i][0])*PX)+GUTTER;return {x,y:GUTTER+t*(ROW_H+GUTTER),w:Math.round((PANELS[k][1]-PANELS[k][0])*PX),h:ROW_H};}
export function badgeRect(t:number):Rect{return {x:GUTTER+t*(BADGE_PX+GUTTER),y:GUTTER+LIVERIES.length*(ROW_H+GUTTER),w:BADGE_PX,h:BADGE_PX};}
/** On-screen size (trainRunning's car length over the screen half-height) → wrap opacity: 0 at LOD_NEAR_OUT, full from FADE_FULL. */
export const FADE_ZERO=.125,FADE_FULL=.19,NIGHT_GLOW=.32;
export const wrapAlpha=(size:number)=>{const k=Math.max(0,Math.min(1,(size-FADE_ZERO)/(FADE_FULL-FADE_ZERO)));return k*k*(3-2*k);};

/** Car-local corners (bottom-left, bottom-right, top-right, top-left as seen from outside), normal and UVs of quad q of a car. */
export function quadLocal(q:number,t:number){const H=ATLAS_H,W=ATLAS_W;
 if(q===QUADS_PER_CAR-1){const r=badgeRect(t),{y,r:R,z}=BADGE;return {p:[-R,y-R,z, R,y-R,z, R,y+R,z, -R,y+R,z],n:[0,0,1],uv:uvOf(r,W,H,false)};}
 const side=q<PANELS.length?1:-1,k=q%PANELS.length,[z0,z1]=PANELS[k],x=side*(HALF_W+WRAP_OUT),r=tileRect(t,k);
 // seen from +x the reader's right is −z; from −x it is +z: the tile reads left to right on both sides (never mirrored)
 const zl=side>0?z1:z0,zr=side>0?z0:z1;
 return {p:[x,WRAP_Y0,zl, x,WRAP_Y0,zr, x,WRAP_Y1,zr, x,WRAP_Y1,zl],n:[side,0,0],uv:uvOf(r,W,H,false)};}
function uvOf(r:Rect,W:number,H:number,_m:boolean){const u0=(r.x+.5)/W,u1=(r.x+r.w-.5)/W,v0=1-(r.y+r.h-.5)/H,v1=1-(r.y+.5)/H;return [u0,v0,u1,v0,u1,v1,u0,v1];}

/** Draw the whole atlas (at load, and once more when the club's masks arrive). `mark` draws the Drip FC crest / wordmark / drop. */
export function drawWrapAtlas(c:CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,mark:ClubMarkFn=drawClubMark){
 c.clearRect(0,0,ATLAS_W,ATLAS_H);
 for(let t=0;t<WRAP_THEMES.length;t++){const L=WRAP_THEMES[t];
  for(let k=0;k<WRAP_TILES.length;k++){const r=tileRect(t,k),s=r.h/100;c.save();c.translate(r.x,r.y);c.scale(s,s);drawWrapTile(c,t,k,r.w/s,L.slogan,mark);c.restore();}
  const b=badgeRect(t),s=b.w/100;c.save();c.translate(b.x,b.y);c.scale(s,s);drawWrapBadge(c,t,mark);c.restore();}}

// ---------------------------------------------------------------- the mesh (one draw for all three trains)
export function createTrainWraps(){
 const pos=new Float32Array(WRAP_QUADS*12),nor=new Float32Array(WRAP_QUADS*12),uv=new Float32Array(WRAP_QUADS*8),col=new Float32Array(WRAP_QUADS*16).fill(1),idx:number[]=[];
 const LOCAL=Array.from({length:LIVERIES.length},(_,t)=>Array.from({length:QUADS_PER_CAR},(_,q)=>quadLocal(q,t)));
 for(let i=0;i<TRAIN_COUNT;i++)for(let c=0;c<TRAIN_CARS;c++)for(let q=0;q<QUADS_PER_CAR;q++){const o=(i*TRAIN_CARS+c)*QUADS_PER_CAR+q;uv.set(LOCAL[i%LIVERIES.length][q].uv,o*8);idx.push(o*4,o*4+1,o*4+2,o*4,o*4+2,o*4+3);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('normal',new T.BufferAttribute(nor,3).setUsage(T.DynamicDrawUsage));
 geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setAttribute('color',new T.BufferAttribute(col,4).setUsage(T.DynamicDrawUsage));geo.setIndex(idx);
 let tex:T.Texture,artAsked=false,artDone=false,disposed=false;let redraw=()=>{};
 if(typeof document!=='undefined'){const cv=document.createElement('canvas');cv.width=ATLAS_W;cv.height=ATLAS_H;const g=cv.getContext('2d');if(g)drawWrapAtlas(g);
  // the club's masks: asked for the first time a wrap is on screen, then the atlas is redrawn once (same canvas, same texture size)
  redraw=()=>{if(artAsked)return;artAsked=true;void clubArtReady().then(()=>{if(disposed||!g)return;drawWrapAtlas(g);tex.needsUpdate=true;artDone=true;});};
  const ct=new T.CanvasTexture(cv);ct.colorSpace=T.SRGBColorSpace;ct.anisotropy=4;ct.generateMipmaps=true;ct.minFilter=T.LinearMipmapLinearFilter;tex=ct;}
 else tex=new T.Texture();// headless tests (no canvas): an empty texture, same material settings
 const mat=new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:'#fff1d6',emissiveIntensity:0,roughness:.85,vertexColors:true,transparent:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 const mesh=new T.Mesh(geo,mat);mesh.name='train-wraps';mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;mesh.castShadow=false;mesh.receiveShadow=false;mesh.visible=false;mesh.renderOrder=1;
 const shown=new Uint8Array(TRAIN_COUNT),seen=new Uint8Array(TRAIN_COUNT),alphaOf=new Float32Array(TRAIN_COUNT*TRAIN_CARS).fill(1),v=new T.Vector3();
 let dirty=false,quads=0;
 const writeCar=(i:number,c:number,m:T.Matrix4,a:number)=>{const L=LOCAL[i%LIVERIES.length],e=m.elements,base=(i*TRAIN_CARS+c)*QUADS_PER_CAR;
  for(let q=0;q<QUADS_PER_CAR;q++){const o=base+q,lq=L[q],nx=lq.n[0],ny=lq.n[1],nz=lq.n[2];
   for(let k=0;k<4;k++){v.set(lq.p[k*3],lq.p[k*3+1],lq.p[k*3+2]).applyMatrix4(m);pos[o*12+k*3]=v.x;pos[o*12+k*3+1]=v.y;pos[o*12+k*3+2]=v.z;
    nor[o*12+k*3]=e[0]*nx+e[4]*ny+e[8]*nz;nor[o*12+k*3+1]=e[1]*nx+e[5]*ny+e[9]*nz;nor[o*12+k*3+2]=e[2]*nx+e[6]*ny+e[10]*nz;}}
  const ac=i*TRAIN_CARS+c;if(alphaOf[ac]!==a){alphaOf[ac]=a;for(let q=0;q<QUADS_PER_CAR;q++)for(let k=0;k<4;k++)col[((base+q)*4+k)*4+3]=a;(geo.attributes.color as T.BufferAttribute).needsUpdate=true;}
  quads+=QUADS_PER_CAR;dirty=true;};
 const api={mesh,material:mat,texture:tex,
  /** Before the trains' draw loop. */
  begin(){seen.fill(0);quads=0;dirty=false;},
  /** Car c of train i in the near tier, from its instance matrix; `size` is its on-screen size (wrapAlpha). */
  car(i:number,c:number,m:T.Matrix4,size:number){const a=wrapAlpha(size);if(a<=.01)return;if(!artAsked)redraw();seen[i]=1;shown[i]=1;writeCar(i,c,m,a);},
  /** After the loop: collapse the trains no longer drawn, upload once, the night glow. */
  end(night:number){for(let i=0;i<TRAIN_COUNT;i++)if(shown[i]&&!seen[i]){shown[i]=0;pos.fill(0,i*TRAIN_CARS*QUADS_PER_CAR*12,(i+1)*TRAIN_CARS*QUADS_PER_CAR*12);dirty=true;}
   if(dirty)(geo.attributes.position as T.BufferAttribute).needsUpdate=(geo.attributes.normal as T.BufferAttribute).needsUpdate=true;
   const vis=quads>0;if(mesh.visible!==vis)mesh.visible=vis;mat.emissiveIntensity=night*NIGHT_GLOW;},
  /** The priming frame (600 m under the island): one car drawn so the program is ready before a train is first seen. */
  prime(m:T.Matrix4){api.begin();seen[0]=shown[0]=1;writeCar(0,0,m,1);api.end(0);},
  warm(on:boolean){mesh.visible=on;},
  /** For tests and the gfx probe. */
  get drawn(){return mesh.visible?quads:0;},
  /** True once the club's masks are in the atlas (tests and the train audit). */
  get clubArt(){return artDone;},
  dispose(){disposed=true;geo.dispose();mat.dispose();tex.dispose();mesh.removeFromParent();},
 };
 return api;
}
export type TrainWraps=ReturnType<typeof createTrainWraps>;

// ---------------------------------------------------------------- learning: the boarding note and Conductor Kenji (one line per theme)
const announced=new Set<string>();
/** The boarding note: the train's theme the first time this session you board a train of that theme, else `usual`. */
export function wrapBoardNote(train:number,usual:string){const th=wrapThemeOf(train);if(announced.has(th.id))return usual;announced.add(th.id);return th.board;}
/** Headless checks only: forget the themes already announced. */
export const resetWrapNotes=()=>announced.clear();
const KENJI_WHY:readonly [string,string][]=[
 ['Why shake hands?','It says "thanks for the game" to the other team and the referee. Showing respect keeps football fun for everyone.'],
 ['Why give the ball back?','If a team kicks the ball out so a hurt player can get help, the other team throws it back to them. That is fair play, even when no rule says so.'],
 ['Can I clap for the other team?','Yes! Clapping a great save or a great goal, whoever makes it, is good sportsmanship. Lots of players swap shirts at the end to say "well played".'],
];
const kenjiDefs=new Map<number,NpcDefinition>();
/** Conductor Kenji's talk on train k: his usual talk with the train's theme up front (greeting, first line, a "why the pictures?" topic). */
export function kenjiWrapNpc(k:number,base:NpcDefinition):NpcDefinition{if(k<0)return base;const t=((k%LIVERIES.length)+LIVERIES.length)%LIVERIES.length,th=WRAP_THEMES[t];let d=kenjiDefs.get(t);
 if(!d){d={...base,greeting:`Hello from the cab of the ${th.name} train! I'm Kenji, the conductor. Want a train fact while we roll?`,lines:[th.kenji,...(base.lines??[])],
  topics:[{id:'k-wrap',question:'Why does this train have pictures on it?',answer:`${th.kenji} Every picture shows a way to be kind in football.`,followUp:{question:KENJI_WHY[t][0],answer:KENJI_WHY[t][1]}},...(base.topics??[])]};kenjiDefs.set(t,d);}
 d.x=base.x;d.z=base.z;return d;}
