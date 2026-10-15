/**
 * Summit Isle painting easel (Oct 14 2026; user: "In this corner is an easel that is a place to paint the view. Build an interactive
 * easel with paint and paint brushes so the user can just relax and paint", then "the painting is supposed to be relaxing, to take
 * in the views"). Pure rules, no three.js and no DOM (tests/paint-easel.cjs):
 *  - where the easel stands (open grass on the upper west slope, left of the pitch fence in the follow camera, facing the sea and
 *    the main island) and the poses that hang off it (the canvas board, the stool, the paint table, the seated camera);
 *  - the painting tools' maths: the palette, brush sizes, stamp spacing along a stroke, a scanline flood fill, a bounded undo stack;
 *  - the paintings save: the last few paintings as small WebP/JPEG data URLs in `fi2-paintings-v1`, under a byte budget, the oldest
 *    rotated out. Child-made pictures: a DEVICE key (lib/saves/snapshot.ts DEVICE_KEYS), never synced, never sent anywhere.
 * The 3D prop is lib/town/paintEaselWorld.ts (static, batched), the runtime lib/graphics/paintEasel.ts, the UI components/PaintEasel.tsx.
 * No score, no coins: it is a quiet place to sit, look and paint.
 */
import {SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_OBSTACLES,summitGround,summitSlope,summitTrailDistance,onSummitIsle} from './summitIsle';
import {ISLAND_SQUARE} from './venues';

// ------------------------------------------------------------------------------------------------------------------- placement
/** The circled grass: ~12 m west of the pitch fence's west side, a little south of the pitch's centre line (left of the fence in the
 *  follow camera, below the lookout, above the orchard on the west slope). An offset from the fence, so it follows the pitch. */
export const EASEL_TARGET={dx:-12,dz:3} as const;
/** Gentle ground under the easel and stool (m per m; the walk limit is 0.62). */
export const EASEL_MAX_SLOPE=.34;
/** How far (m) the search may move the easel from its target to find ground that gentle and clear. */
export const EASEL_SEARCH=1.5;
/** Clearances (m): from the pitch fence (≥ 3), from any trail's centre line (≥ 4, plus the 1 m tread). */
export const EASEL_CLEAR={fence:3,trail:5} as const;
/** Prompt reach (m): "Paint the view" shows within this distance of the easel. */
export const EASEL_REACH=3.2;

export type EaselSpot={x:number;z:number;ground:number;yaw:number;
 /** Forward (toward the view) and right, unit vectors in x/z. */
 fx:number;fz:number;rx:number;rz:number};

/** The easel's spot: the nearest gentle, walkable, clear ground to the target, facing the main island across the sea. */
export function easelSpot(ok:(x:number,z:number)=>boolean=(a,b)=>onSummitIsle(a,b)):EaselSpot{
 const P=SUMMIT_PITCH,F=SUMMIT_FENCE,tx=P.x-F.halfX+EASEL_TARGET.dx,tz=P.z+EASEL_TARGET.dz;
 const good=(x:number,z:number)=>ok(x,z)&&summitSlope(x,z)<=EASEL_MAX_SLOPE&&summitTrailDistance(x,z)>=EASEL_CLEAR.trail
  &&!(Math.abs(x-P.x)<F.halfX+EASEL_CLEAR.fence+1&&Math.abs(z-P.z)<F.halfZ+EASEL_CLEAR.fence+1)
  &&!SUMMIT_OBSTACLES.some(o=>Math.abs(x-o.x)<o.w/2+2&&Math.abs(z-o.z)<o.d/2+2)
  // Room round it: the painter's stand behind, the table and stool beside, a step in front.
  &&[[1.6,0],[-1.6,0],[0,1.6],[0,-1.6],[2.4,0],[0,2.4],[-2.4,0],[0,-2.4]].every(([ax,az])=>ok(x+ax,z+az));
 let best:{x:number;z:number}|null=null,bestD=Infinity;const step=.25,n=Math.round(EASEL_SEARCH/step);
 for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const d=Math.hypot(i,j)*step;if(d>EASEL_SEARCH+1e-9||d>=bestD)continue;
  const x=tx+i*step,z=tz+j*step;if(good(x,z)){bestD=d;best={x,z};}}
 const p=best??{x:tx,z:tz},yaw=Math.atan2(ISLAND_SQUARE.x-p.x,ISLAND_SQUARE.z-p.z),fx=Math.sin(yaw),fz=Math.cos(yaw);
 return {x:p.x,z:p.z,ground:summitGround(p.x,p.z),yaw,fx,fz,rx:-fz,rz:fx};
}

/** Where the pieces stand, relative to the easel (m along forward / right). The painter stands behind the canvas, looking past it. */
export const EASEL_LAYOUT={
 /** The painter's spot, behind the canvas (on the uphill side). */stand:{f:-1.05,r:0},
 /** The stool beside the painter (a seat for the eye, not a collider in the walk line). */stool:{f:-.95,r:-.72},
 /** The paint table with the palette, pots, brushes and the water jar. */table:{f:-.55,r:.92},
 /** The canvas board: centre height above the easel's ground, size (4:3), lean back from vertical. */
 canvas:{h:1.38,w:1.0,hgt:.75,lean:.2},
} as const;
export const easelPoint=(s:EaselSpot,f:number,r:number)=>({x:s.x+s.fx*f+s.rx*r,z:s.z+s.fz*f+s.rz*r});

/** The canvas board's centre and its painted face's normal (toward the painter: away from the view, tilted up by the lean). */
export function canvasPose(s:EaselSpot){
 const C=EASEL_LAYOUT.canvas,lean=C.lean;
 return {x:s.x,y:s.ground+C.h,z:s.z,w:C.w,h:C.hgt,lean,
  /** Unit normal of the painted face. */nx:-s.fx*Math.cos(lean),ny:Math.sin(lean),nz:-s.fz*Math.cos(lean)};
}

/** The seated camera: behind and above the painter, looking out over the canvas to the sea and the main island. */
export const EASEL_CAMERA={back:2.1,side:1.05,eye:2.45,
 /** "Just look" (Oct 15 2026, "can we see less skyline?"): the horizon sits this high above the screen's centre (NDC), so the sea,
  *  the beach and the main island fill most of the view and the sky is a band at the top (was a fixed -6° pitch: ~45% sky on a phone). */
 lookHorizon:.4,
 /** Horizontal half-angle (degrees) the visible part of the view should span on narrow screens; the FOV is clamped to fovMin…fovMax. */
 halfDeg:30,fovMin:42,fovMax:96,far:1300,
 /** The blend in and out (s), and the "Just look" drift: ±yaw/pitch degrees over a period (s). Off with reduced motion. */
 blendIn:1.1,blendOut:.7,driftYaw:1.1,driftPitch:.35,driftPeriod:48} as const;
/** The "Just look" camera. `fov` (vertical, degrees: easelFov for the screen) sets the pitch that puts the horizon at lookHorizon. */
export function easelCamera(s:EaselSpot,fov=60){
 // Over the painter's shoulder, a step to the right: the easel sits low at the left of the frame, the view open in the middle.
 const b=easelPoint(s,-EASEL_CAMERA.back,EASEL_CAMERA.side),g=Math.max(summitGround(b.x,b.z),s.ground);
 return {x:b.x,y:g+EASEL_CAMERA.eye,z:b.z,yaw:s.yaw,pitch:-Math.atan(EASEL_CAMERA.lookHorizon*Math.tan(fov*Math.PI/360))};
}
/** Vertical FOV (degrees) so the visible region (the screen minus the painting card) spans ~halfDeg either side of centre. */
export function easelFov(visibleAspect:number,visibleFraction=1){
 const C=EASEL_CAMERA,a=Math.max(.2,visibleAspect),v=Math.max(.3,Math.min(1,visibleFraction));
 // Visible region's vertical half-angle tan = v * tan(full/2); its horizontal = aspect * that.
 const tanVis=Math.tan(C.halfDeg*Math.PI/180)/a,full=2*Math.atan(tanVis/v)*180/Math.PI;
 return Math.max(C.fovMin,Math.min(C.fovMax,full));
}
/** The painting framing (Oct 14 2026, "the painting portion should be on the easel"): the easel's own board is the paper, large in
 *  the lower part of a phone (above the one-row tool tray) or the lower left of a wide screen (the palette tray beside it), the camera
 *  looking straight out to the main island so the sea and the horizon stay open above it. Values in NDC (-1…1):
 *  `bottom` the board's lower edge (phones: clear of the tray), `left` its left edge (wide screens; phones centre it), `width` the
 *  most of the screen width it may take, `half` the most half-height, `horizon` where the horizon sits (Oct 15 2026, "can we see
 *  less skyline?": raised from .24 / .42, so the camera tilts down and the sky is only a band at the top of the screen, the island,
 *  the sea and the beach filling the space between it and the board). */
export const EASEL_PAINT_FRAME={
 phone:{fov:76,bottom:-.76,left:null,width:.92,half:.34,horizon:.54},
 wide:{fov:54,bottom:-.8,left:-.84,width:.4,half:.5,horizon:.58},
 /** The camera never comes closer to the board than this (m), nor lower than this above the ground. */
 minDepth:.85,minEye:.7,
} as const;
/** The seated painting camera for a screen `aspect`: position, yaw/pitch and FOV that put the board where EASEL_PAINT_FRAME says. */
export function easelPaintCamera(s:EaselSpot,aspect:number){
 const F=aspect<1?EASEL_PAINT_FRAME.phone:EASEL_PAINT_FRAME.wide,a=Math.max(.3,aspect);
 const tanV=Math.tan(F.fov*Math.PI/360),tanH=tanV*a,C=canvasPose(s);
 const pitch=-Math.atan(F.horizon*tanV),yaw=s.yaw,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 // Depth: the board as wide as allowed, unless that makes it too tall.
 const Z=Math.max(EASEL_PAINT_FRAME.minDepth,C.w/(2*F.width*tanH),C.h/2/(F.half*tanV));
 const halfW=C.w/2/(Z*tanH),halfH=C.h/2/(Z*tanV);
 const bx=F.left===null?0:F.left+halfW,by=F.bottom+halfH,X=bx*Z*tanH,Y=by*Z*tanV;
 // Camera basis: forward (yaw, pitch), right, up = right × forward.
 const f={x:sy*cp,y:sp,z:cy*cp},r={x:-cy,y:0,z:sy},u={x:-sy*sp,y:cp,z:-cy*sp};
 const x=C.x-f.x*Z-r.x*X-u.x*Y,z=C.z-f.z*Z-r.z*X-u.z*Y;let y=C.y-f.y*Z-r.y*X-u.y*Y;
 y=Math.max(y,summitGround(x,z)+EASEL_PAINT_FRAME.minEye);
 return {x,y,z,yaw,pitch,fov:F.fov};
}
/** The view snapshot (trace and the picture styles): standing at the easel looking out at the view (the easel behind it), a 4:3
 *  centre crop ±VIEW_SHOT.halfDeg wide, aimed down so the horizon sits VIEW_SHOT.horizon from the top: mostly island, sea and beach,
 *  a strip of sky (was ±30° at -4°: the top ~40% blank sky). */
export const VIEW_SHOT={halfDeg:25,horizon:.2} as const;
export function easelViewCamera(s:EaselSpot,aspect:number){
 const tanH=Math.tan(VIEW_SHOT.halfDeg*Math.PI/180),tanCrop=tanH/(PAINT_W/PAINT_H),tanV=tanH/Math.min(Math.max(.3,aspect),PAINT_W/PAINT_H);
 const pitch=-Math.atan((1-2*VIEW_SHOT.horizon)*tanCrop);
 return {x:s.x+s.fx*.4,y:s.ground+1.75,z:s.z+s.fz*.4,yaw:s.yaw,pitch,fov:2*Math.atan(tanV)*180/Math.PI};
}
/** Where a point on the board's plane (offset a along its right, b along its up, metres from the centre) lands on the paper (px). */
export const boardToPaper=(a:number,b:number,w:number,h:number)=>({x:(a/w+.5)*PAINT_W,y:(.5-b/h)*PAINT_H});
/** The "Just look" drift (radians) at time t (s): a slow breathing pan. Zero with reduced motion. */
export function easelDrift(t:number,reduced:boolean){
 if(reduced)return {yaw:0,pitch:0};const C=EASEL_CAMERA,w=2*Math.PI/C.driftPeriod,D=Math.PI/180;
 return {yaw:Math.sin(t*w)*C.driftYaw*D,pitch:Math.sin(t*w*.63+1)*C.driftPitch*D};
}

// ------------------------------------------------------------------------------------------------------------------- painting
/** The working canvas (and the saved picture): 4:3, small enough that undo snapshots stay cheap. */
export const PAINT_W=512,PAINT_H=384;
/** The view snapshot (trace and the picture styles, lib/town/paintStyles.ts): 4:3 at twice the paper's size, so the buildings, the
 *  lighthouse, the beach line and the palms survive the styles' edge work (the pictures are scaled to the paper once, cached). */
export const VIEW_W=1024,VIEW_H=768;
/** The paper's colour (the board's ground under the paint, and the saved picture's background). */
export const PAINT_PAPER='#fbf6ea';
/** Colours from the view: sky, sea, sand, grass, sunset, white and ink. */
export const PAINT_PALETTE:readonly {id:string;name:string;hex:string}[]=[
 {id:'sky',name:'Sky blue',hex:'#8fcbe8'},{id:'deep',name:'Deep sea',hex:'#2b6f9e'},{id:'sea',name:'Sea turquoise',hex:'#3fbfb4'},
 {id:'foam',name:'White',hex:'#fbf8f0'},{id:'sand',name:'Sand',hex:'#ecd29a'},{id:'grass',name:'Grass green',hex:'#79b85a'},
 {id:'leaf',name:'Leaf green',hex:'#2f7a4a'},{id:'sun',name:'Sun yellow',hex:'#ffd45e'},{id:'sunset',name:'Sunset orange',hex:'#f58a4b'},
 {id:'pink',name:'Sunset pink',hex:'#ef8fb0'},{id:'roof',name:'Roof red',hex:'#c9553f'},{id:'ink',name:'Ink',hex:'#24343a'},
];
export type PaintTool='brush'|'water'|'fill'|'eraser'|'pick';
export const PAINT_TOOLS:readonly {id:PaintTool;name:string}[]=[
 {id:'brush',name:'Brush'},{id:'water',name:'Watercolour'},{id:'fill',name:'Fill'},{id:'eraser',name:'Eraser'},{id:'pick',name:'Pick a colour from the view'},
];
/** Brush radii (canvas px) for small / medium / large; watercolour paints wider and soft. */
export const BRUSH_SIZES=[4,10,22] as const;
export const BRUSH={
 brush:{scale:1,alpha:1,spacing:0},
 /** Low-opacity soft stamps: colour builds up where you go over it again, like a wash. */
 water:{scale:1.9,alpha:.09,spacing:.18},
 eraser:{scale:1.4,alpha:1,spacing:0},
} as const;
export const FILL_TOLERANCE=40;
export const brushRadius=(tool:PaintTool,size:number)=>BRUSH_SIZES[Math.max(0,Math.min(BRUSH_SIZES.length-1,size|0))]*(tool==='water'?BRUSH.water.scale:tool==='eraser'?BRUSH.eraser.scale:1);

/** Stamp centres from a to b every `spacing` px, carrying the leftover distance between calls (so a slow stroke is even). */
export function stampsAlong(a:{x:number;y:number},b:{x:number;y:number},spacing:number,carry:number){
 const out:{x:number;y:number}[]=[];const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),s=Math.max(.5,spacing);
 let d=s-carry;while(d<=len){const t=len?d/len:0;out.push({x:a.x+dx*t,y:a.y+dy*t});d+=s;}
 return {points:out,carry:len-(d-s)};
}

export const hexToRgb=(hex:string)=>{const n=parseInt(hex.replace('#','').slice(0,6),16);return {r:n>>16&255,g:n>>8&255,b:n&255};};
export const rgbToHex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');

/** Scanline flood fill in RGBA `data` (w×h) from (x, y) with `rgba` (0–255 each). Pixels within `tol` (max channel difference,
 *  alpha included) of the start pixel are filled. Returns the number of pixels changed. With `target` (same size), the region is
 *  found in `data` but painted into `target` (a style picture under the paint: fill its shapes, colouring-book style, on the paint). */
export function floodFill(data:Uint8ClampedArray,w:number,h:number,x:number,y:number,rgba:readonly [number,number,number,number],tol=FILL_TOLERANCE,target?:Uint8ClampedArray){
 x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return 0;
 const i0=(y*w+x)*4,sr=data[i0],sg=data[i0+1],sb=data[i0+2],sa=data[i0+3];
 if(Math.max(Math.abs(sr-rgba[0]),Math.abs(sg-rgba[1]),Math.abs(sb-rgba[2]),Math.abs(sa-rgba[3]))===0)return 0;
 const seen=new Uint8Array(w*h);
 const match=(p:number)=>{if(seen[p])return false;const i=p*4;return Math.abs(data[i]-sr)<=tol&&Math.abs(data[i+1]-sg)<=tol&&Math.abs(data[i+2]-sb)<=tol&&Math.abs(data[i+3]-sa)<=tol;};
 const out=target??data,set=(p:number)=>{seen[p]=1;const i=p*4;out[i]=rgba[0];out[i+1]=rgba[1];out[i+2]=rgba[2];out[i+3]=rgba[3];};
 const stack:number[]=[x,y];let n=0;
 while(stack.length){const sy=stack.pop()!,sx=stack.pop()!;let lx=sx;const row=sy*w;if(!match(row+lx))continue;
  while(lx>0&&match(row+lx-1))lx--;let rx=sx;while(rx<w-1&&match(row+rx+1))rx++;
  for(let px=lx;px<=rx;px++){set(row+px);n++;}
  for(const ny of [sy-1,sy+1]){if(ny<0||ny>=h)continue;const nrow=ny*w;let inRun=false;
   for(let px=lx;px<=rx;px++){const m=match(nrow+px);if(m&&!inRun){stack.push(px,ny);inRun=true;}else if(!m)inRun=false;}}}
 return n;
}

/** A bounded undo stack: the newest `limit` states (each a snapshot taken before a change). */
export const UNDO_LIMIT=8;
export function createUndo<S>(limit=UNDO_LIMIT){
 const states:S[]=[];
 return {push(s:S){states.push(s);if(states.length>limit)states.shift();},pop():S|null{return states.pop()??null;},clear(){states.length=0;},get size(){return states.length;}};
}

// ------------------------------------------------------------------------------------------------------------------- the save
/** Device-only (lib/saves/snapshot.ts DEVICE_KEYS, docs/accounts-design.md table B): child-made pictures never sync or leave the device. */
export const PAINT_SAVE_KEY='fi2-paintings-v1';
/** Keep the newest MAX paintings, each at most ITEM_BYTES (a data URL), all of them under TOTAL_BYTES. */
export const PAINT_BUDGET={max:5,itemBytes:90*1024,totalBytes:300*1024} as const;
export type Painting={id:string;at:number;img:string};
/** `hung`: the painting on the easel in the world ("Hang on easel"); unset, the newest hangs there. */
export type PaintSave={version:1;items:Painting[];hung?:string};
export const emptyPaintSave=():PaintSave=>({version:1,items:[]});
const IMG_RE=/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
export const validPaintingImage=(v:unknown):v is string=>typeof v==='string'&&v.length<=PAINT_BUDGET.itemBytes&&IMG_RE.test(v);
export function sanitizePaintSave(v:unknown):PaintSave{
 if(!v||typeof v!=='object'||!Array.isArray((v as PaintSave).items))return emptyPaintSave();
 const items:Painting[]=[],ids=new Set<string>();
 for(const p of (v as PaintSave).items){if(!p||typeof p!=='object')continue;const {id,at,img}=p as Painting;
  if(typeof id!=='string'||!/^[a-z0-9-]{1,40}$/.test(id)||ids.has(id)||!Number.isFinite(at)||!validPaintingImage(img))continue;ids.add(id);items.push({id,at,img});}
 items.sort((a,b)=>b.at-a.at);const hung=(v as PaintSave).hung;return fitBudget(withHung({version:1,items},typeof hung==='string'?hung:undefined)).save;
}
/** The save with `hung` kept only while it names one of its paintings. */
const withHung=(s:PaintSave,hung:string|undefined):PaintSave=>hung&&s.items.some(p=>p.id===hung)?{version:1,items:s.items,hung}:{version:1,items:s.items};
export const paintSaveBytes=(s:PaintSave)=>s.items.reduce((n,p)=>n+p.img.length+40,0);
/** Newest first; drops the oldest until it fits MAX and TOTAL_BYTES. */
export function fitBudget(s:PaintSave):{save:PaintSave;dropped:string[]}{
 const items=[...s.items].sort((a,b)=>b.at-a.at),dropped:string[]=[];
 while(items.length>PAINT_BUDGET.max||(items.length>1&&paintSaveBytes({version:1,items})>PAINT_BUDGET.totalBytes))dropped.push(items.pop()!.id);
 return {save:withHung({version:1,items},s.hung),dropped};
}
/** Adds a painting (newest first). Refused (unchanged) if the image is not a small data URL. */
export function addPainting(s:PaintSave,p:Painting):{save:PaintSave;added:boolean;dropped:string[]}{
 if(!validPaintingImage(p.img)||!/^[a-z0-9-]{1,40}$/.test(p.id))return {save:s,added:false,dropped:[]};
 const r=fitBudget(withHung({version:1,items:[p,...s.items.filter(q=>q.id!==p.id)]},s.hung));return {save:r.save,added:true,dropped:r.dropped};
}
/** Removes a painting; if it was the one on the easel, the newest left hangs there instead (none left: a bare board). */
export const removePainting=(s:PaintSave,id:string):PaintSave=>withHung({version:1,items:s.items.filter(p=>p.id!==id)},s.hung===id?undefined:s.hung);
/** "Hang on easel": this painting shows on the easel in the world (refused, unchanged, if it is not in the save). */
export const hangPainting=(s:PaintSave,id:string):PaintSave=>withHung(s,id).hung===id?withHung(s,id):s;
/** The painting on the easel in the world: the one hung there, else the newest; null with none saved. */
export const hungPainting=(s:PaintSave):Painting|null=>s.items.find(p=>p.id===s.hung)??s.items[0]??null;
type Store={getItem(k:string):string|null;setItem(k:string,v:string):void};
export function readPaintings(store?:Store|null):PaintSave{try{const st=store??(typeof localStorage!=='undefined'?localStorage:null);return sanitizePaintSave(JSON.parse(st?.getItem(PAINT_SAVE_KEY)??'null'));}catch{return emptyPaintSave();}}
/** Writes the save; when the device is full, drops the oldest paintings and tries again. Returns what was stored (null: nothing). */
export function writePaintings(s:PaintSave,store?:Store|null):PaintSave|null{
 const st=store??(typeof localStorage!=='undefined'?localStorage:null);if(!st)return null;let cur=s;
 for(;;){try{st.setItem(PAINT_SAVE_KEY,JSON.stringify(cur));return cur;}catch{if(cur.items.length<=1)return null;cur=withHung({version:1,items:cur.items.slice(0,-1)},cur.hung);}}
}
export const newPaintingId=(now:number,rand:number)=>`p-${Math.floor(now).toString(36)}-${Math.floor(rand*1e6).toString(36)}`;
