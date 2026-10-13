import {RAMPS,SWATCH,type Kit,type KitName,type Ramp} from './palette';
import {Pixmap,type Paint} from './raster';
import {depth,toScreen,toScreenF,type Camera,type Px} from './iso';
import {BALL_KEYS,BALL_SPRITES,LEATHER_KEYS,figureKeys,figureSprite,type Facing,type Hair,type Pose,type Skin} from './sprites';

/**
 * pixeliso · parts and the painter (Oct 10 2026). Every part is an Item: a painter's key (depth() of its nearest ground point),
 * a layer, and a draw function. Scene.paint sorts back to front (layer, then key, then the order added) and draws into the
 * Pixmap. This is the anatomy kit's painter's order in pixels: floor first, shadows on the floor, then solids from far to near,
 * then light and markers on top. A part that WRAPS another (a goal round the ball, a frame round a carriage) is split into a
 * back half and a front half with their own keys (goal() returns both).
 *
 * Shading (one light, from the upper left, like the anatomy kit): top = ramp[3], left face (+y side) = ramp[2], right face
 * (+x side) = ramp[1], outline = ramp[0] or black. No gradients: flat tones, Bayer dither for anything in between.
 */
export const LAYER={floor:0,decal:1,solid:2,light:3,marker:4} as const;
export type Item={key:number;layer:number;id?:string;draw:(pm:Pixmap,cam:Camera)=>void};
export type RampLike=Ramp|readonly string[];
const R=(r:RampLike)=>typeof r==='string'?RAMPS[r]:r;

export class Scene{
 items:Item[]=[];private ids:string[]=[];
 add(...items:(Item|Item[]|null|undefined|false)[]){for(const it of items){if(!it)continue;if(Array.isArray(it))this.items.push(...it);else this.items.push(it);}return this;}
 clear(){this.items.length=0;this.ids.length=0;return this;}
 /** Painter's order: layer, then depth key, then insertion. Returns the sorted list (tests read it). */
 order(){return this.items.map((it,i)=>({it,i})).sort((a,b)=>a.it.layer-b.it.layer||a.it.key-b.it.key||a.i-b.i).map(o=>o.it);}
 paint(pm:Pixmap,cam:Camera){this.ids.length=0;
  for(const it of this.order()){if(it.id){let t=this.ids.indexOf(it.id);if(t<0){this.ids.push(it.id);t=this.ids.length-1;}pm.tag=Math.min(255,t+1);}else pm.tag=0;it.draw(pm,cam);}
  pm.tag=0;return pm;}
 /** The id of the part under a buffer pixel (r = finger slop in buffer pixels). */
 pick(pm:Pixmap,x:number,y:number,r=0){const t=pm.pick(x,y,r);return t?this.ids[t-1]??null:null;}
}

// ── Floor ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const quad=(cam:Camera,pts:readonly (readonly [number,number,number])[])=>pts.map(p=>toScreen(cam,p[0],p[1],p[2]));
/** A flat floor rectangle (x, y, w, d) at height z. */
export function floor(x:number,y:number,w:number,d:number,paint:Paint,z=0):Item{
 return {key:-1e6,layer:LAYER.floor,draw:(pm,cam)=>pm.poly(quad(cam,[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]]),paint)};}
/** Mown grass: bands `band` metres wide across `axis`, two tones, with a dither seam so bands read as cut grass, not paint. */
export function pitch(x:number,y:number,w:number,d:number,{band=2,axis='x',ramp='grass',alt='grassAlt'}:{band?:number;axis?:'x'|'y';ramp?:RampLike;alt?:RampLike}={}):Item{
 const a=R(ramp),b=R(alt);
 return {key:-1e6,layer:LAYER.floor,draw:(pm,cam)=>{const n=Math.ceil((axis==='x'?w:d)/band);
  for(let i=0;i<n;i++){const s=i*band,e=Math.min((axis==='x'?w:d),s+band),c=i%2?a[2]:b[2];
   const pts=axis==='x'?[[x+s,y,0],[x+e,y,0],[x+e,y+d,0],[x+s,y+d,0]] as const:[[x,y+s,0],[x+w,y+s,0],[x+w,y+e,0],[x,y+e,0]] as const;pm.poly(quad(cam,pts),c);}
  // Texture: a sparse dither of the dark tone, every band (grass is never flat).
  const box=quad(cam,[[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0]]);pm.poly(box,{a:null,b:a[1],level:1});}};}
/** A painted line on the floor through world points (1 px, Bresenham: 2:1 steps). */
export function floorLine(pts:readonly (readonly [number,number])[],paint:Paint=RAMPS.line[3],{closed=false,z=0}:{closed?:boolean;z?:number}={}):Item{
 return {key:-1e6+1,layer:LAYER.floor,draw:(pm,cam)=>pm.polyline(pts.map(p=>toScreen(cam,p[0],p[1],z)),paint,closed)};}
/** Points on a floor arc (centre, radius, start/end angles in radians; angle 0 = +x). */
export function arcPoints(cx:number,cy:number,r:number,a0:number,a1:number,steps=16):[number,number][]{
 return Array.from({length:steps+1},(_,i)=>{const a=a0+(a1-a0)*i/steps;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});}
/** A floor spot (penalty spot, centre spot): a 2 × 1 px dash. */
export function spot(x:number,y:number,paint:Paint=RAMPS.line[3]):Item{
 return {key:-1e6+1,layer:LAYER.floor,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y);pm.rect(sx-1,sy,2,1,paint);}};}
/** A soft shadow on the floor: a 2:1 ellipse, dithered (it darkens whatever is under it). `r` in metres. */
export function shadow(x:number,y:number,r=.35,level=8,colour:string=SWATCH.shadow):Item{
 return {key:depth(x,y),layer:LAYER.decal,draw:(pm,cam)=>{const [sx,sy]=toScreenF(cam,x,y);const rx=Math.max(1.5,r*11.3),ry=Math.max(1,rx/2);pm.ellipse(Math.round(sx),Math.round(sy),rx,ry,{a:null,b:colour,level});}};}

// ── Solids ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type BlockOpts={ink?:boolean;top?:Paint;left?:Paint;right?:Paint;id?:string;key?:number;edge?:boolean};
/**
 * A box (x, y, z) → (x+w, y+d, z+h), the kit's slabOf in pixels. Three visible faces in ramp tones, a dark silhouette (black
 * with ink:true), and a lit top-front edge (edge:false to drop it).
 */
export function block(x:number,y:number,z:number,w:number,d:number,h:number,ramp:RampLike,o:BlockOpts={}):Item{
 const r=R(ramp);
 return {key:o.key??depth(x+w/2,y+d/2,z),layer:LAYER.solid,id:o.id,draw:(pm,cam)=>{
  const P=(a:number,b:number,c:number)=>toScreen(cam,a,b,c);
  const top=[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],left=[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],right=[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)];
  if(h>0){pm.poly(left,o.left??r[2]);pm.poly(right,o.right??r[1]);}
  pm.poly(top,o.top??r[3]);
  const ink=o.ink?'#000000':r[0];
  // Silhouette: the hexagon round the three faces.
  pm.polyline([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y,z),P(x+w,y+d,z),P(x,y+d,z),P(x,y+d,z+h)],ink,true);
  if(h>0&&o.edge!==false){const lit=r[3];pm.line(...P(x+w,y+d,z+h),...P(x+w,y+d,z),r[0]);pm.polyline([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y,z+h)],lit);}}};}
/** A thin slab (a plate, a step, a board lying down). */
export const slab=(x:number,y:number,z:number,w:number,d:number,ramp:RampLike,o:BlockOpts={})=>block(x,y,z,w,d,.1,ramp,{edge:false,...o});
/** An upright cylinder (post, drum, lamp column, ball stand): side columns shaded light-left → dark-right, lit top ellipse. */
export function cylinder(cx:number,cy:number,z:number,r:number,h:number,ramp:RampLike,o:{id?:string;ink?:boolean}={}):Item{
 const t=R(ramp);
 return {key:depth(cx,cy,z),layer:LAYER.solid,id:o.id,draw:(pm,cam)=>{
  const [sx,sy0]=toScreenF(cam,cx,cy,z),sy1=sy0-h*10,rx=Math.max(1,r*11.3),ry=Math.max(.5,rx/2);
  for(let x=Math.floor(sx-rx);x<=Math.ceil(sx+rx);x++){const u=(x+.5-sx)/rx;if(Math.abs(u)>1)continue;const dy=Math.sqrt(1-u*u)*ry;
   const p:Paint=u<-.35?t[2]:u<.25?{a:t[2],b:t[1],level:8}:t[1];for(let y=Math.round(sy1+dy);y<Math.round(sy0+dy);y++)pm.set(x,y,p);}
  pm.ellipse(sx,sy1,rx,ry,t[3]);
  const ink=o.ink?'#000000':t[0];pm.ellipse(sx,sy1,rx,ry,ink,true);
  pm.line(Math.round(sx-rx),Math.round(sy1),Math.round(sx-rx),Math.round(sy0),ink);pm.line(Math.round(sx+rx-1),Math.round(sy1),Math.round(sx+rx-1),Math.round(sy0),ink);
  for(let x=Math.floor(sx-rx);x<=Math.ceil(sx+rx);x++){const u=(x+.5-sx)/rx;if(Math.abs(u)>1)continue;pm.set(x,Math.round(sy0+Math.sqrt(1-u*u)*ry)-1,ink);}}};}
/** A vertical pole (flag post, lamp post, net post): 2 px, lit left and shaded right. */
export function pole(x:number,y:number,z:number,h:number,ramp:RampLike='white',o:{id?:string}={}):Item{
 const t=R(ramp);
 return {key:depth(x,y,z),layer:LAYER.solid,id:o.id,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y,z),top=sy-Math.round(h*10);
  pm.rect(sx-1,top,1,sy-top,t[3]);pm.rect(sx,top,1,sy-top,t[1]);pm.rect(sx-2,top,1,sy-top,t[0]);pm.rect(sx+1,top,1,sy-top,t[0]);pm.rect(sx-1,top-1,2,1,t[0]);}};}
/** A corner flag: a pole with a small two-tone pennant that waves between 2 frames. */
export function flag(x:number,y:number,{h=1.5,colour=RAMPS.gold as RampLike,frame=0}:{h?:number;colour?:RampLike;frame?:number}={}):Item[]{
 const c=R(colour);
 return [pole(x,y,0,h,'white'),{key:depth(x,y)+.001,layer:LAYER.solid,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y,h);
  const g=frame%2?['kkkk.','kabbk','kaabk','kkkk.']:['kkkkk','kabbk','kaabk','.kkkk'];pm.sprite(g,{k:'#000000',a:c[2],b:c[3]},sx+1,sy,false);}},shadow(x,y,.12,6)];}

// ── Football ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type FigureOpts={kit?:Kit|KitName;pose?:Pose;facing?:Facing;flip?:boolean;frame?:number;skin?:Skin;hair?:Hair;id?:string;shadow?:boolean};
/** A player: a pixel sprite standing on (x, y, z) with its own floor shadow. */
export function figure(x:number,y:number,z:number,o:FigureOpts={}):Item[]{
 const s=figureSprite(o.pose??'stand',o.facing??'front',o.frame??0),keys=figureKeys(o.kit??'red',o.skin,o.hair);
 const me:Item={key:depth(x,y,z),layer:LAYER.solid,id:o.id,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y,z);pm.sprite(s.grid,keys,sx-s.ax,sy-s.ay,o.flip);}};
 return o.shadow===false?[me]:[me,shadow(x,y,o.pose==='dive'?.7:.4,8)];}
/** The ball at (x, y) lifted z metres: sprite + a floor shadow that shrinks and fades with height. `frame` spins it. */
export function ball(x:number,y:number,z=0,o:{frame?:number;leather?:boolean;id?:string}={}):Item[]{
 const g=BALL_SPRITES[(o.frame??0)%BALL_SPRITES.length],keys=o.leather?LEATHER_KEYS:BALL_KEYS,lift=Math.max(0,z);
 return [{key:depth(x,y)+.002,layer:LAYER.solid,id:o.id,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y,z+.22);pm.sprite(g,keys,sx-2,sy-2);}},
  shadow(x,y,Math.max(.12,.25-lift*.03),Math.max(3,9-Math.round(lift*2)))];}
export type GoalOpts={w?:number;h?:number;d?:number;axis?:'x'|'y';bulge?:{u:number;z:number;amt:number}|null;ramp?:RampLike};
/**
 * A goal on a goal line. axis 'y' (default): the mouth spans y0 → y0+w on the line x = x0 and the net runs back to x0 − d
 * (away from the viewer). axis 'x': the mouth spans x0 → x0+w on y = y0, net back to y0 − d. Returns [net, bar, post, post]:
 * the net (back half) sorts behind a ball in the goal; the bar and each post (front half) sort on their own feet, in front of it. `bulge` pushes the back net
 * out where the ball hit (u along the mouth, metres).
 */
export function goal(x0:number,y0:number,o:GoalOpts={}):Item[]{
 const w=o.w??7.32,h=o.h??2.44,d=o.d??2,ax=o.axis??'y',t=R(o.ramp??'white');
 // World point from (u along the mouth, v back into the net, z up).
 const W=(u:number,v:number,z:number):[number,number,number]=>ax==='y'?[x0-v,y0+u,z]:[x0+u,y0-v,z];
 const mid=W(w/2,d,0),front=W(w/2,0,0);
 const net:Item={key:depth(mid[0],mid[1])-.01,layer:LAYER.solid,draw:(pm,cam)=>{
  const S=(u:number,v:number,z:number)=>{const p=W(u,v,z);let b=0;const B=o.bulge;if(B&&v>=d-1e-6){const k=Math.max(0,1-Math.hypot(u-B.u,z-B.z)/1.6);b=B.amt*k*k;}const q=ax==='y'?[p[0]-b,p[1]]:[p[0],p[1]-b];return toScreen(cam,q[0],q[1],z);};
  const mesh:Paint={a:null,b:SWATCH.net,level:4},cord=SWATCH.net;
  // Back, roof and the two sides: a faint dithered fill, then the cords every 0.5 m.
  pm.poly([S(0,d,0),S(w,d,0),S(w,d,h),S(0,d,h)],mesh);pm.poly([S(0,0,h),S(w,0,h),S(w,d,h),S(0,d,h)],mesh);
  pm.poly([S(0,0,0),S(0,d,0),S(0,d,h),S(0,0,h)],mesh);pm.poly([S(w,0,0),S(w,d,0),S(w,d,h),S(w,0,h)],mesh);
  const cords:Paint={a:null,b:cord,level:10};
  for(let u=0;u<=w+1e-6;u+=.5){pm.polyline([S(u,d,0),S(u,d,h),S(u,0,h)],cords);}
  for(let z=0;z<=h+1e-6;z+=.5){pm.polyline([S(0,0,z),S(0,d,z),S(w,d,z),S(w,0,z)],cords);}
  for(let v=0;v<=d+1e-6;v+=.5){pm.line(...S(0,v,h),...S(w,v,h),cords);}
  // Back stanchions (steel).
  pm.polyline([S(0,0,h),S(0,d,h),S(0,d,0)],RAMPS.steel[2]);pm.polyline([S(w,0,h),S(w,d,h),S(w,d,0)],RAMPS.steel[2]);pm.line(...S(0,d,0),...S(w,d,0),RAMPS.steel[1]);}};
 const P=(cam:Camera,u:number,z:number)=>{const p=W(u,0,z);return toScreen(cam,p[0],p[1],z);};
 const post=(u:number):Item=>{const g=W(u,0,0);return {key:depth(g[0],g[1])+.15,layer:LAYER.solid,draw:(pm,cam)=>{
  const [sx,sy]=P(cam,u,0),top=P(cam,u,h)[1];pm.rect(sx-2,top-1,4,sy-top+1,'#000000');pm.rect(sx-1,top,1,sy-top,t[3]);pm.rect(sx,top,1,sy-top,t[1]);}};};
 const bar:Item={key:depth(front[0],front[1])+.3,layer:LAYER.solid,draw:(pm,cam)=>{const a=P(cam,0,h),b=P(cam,w,h);
  for(const dy of [-2,1])pm.line(a[0],a[1]+dy,b[0],b[1]+dy,'#000000');pm.line(a[0],a[1]-1,b[0],b[1]-1,t[3]);pm.line(a[0],a[1],b[0],b[1],t[1]);
  // Re-draw the post tops over the bar's outline so the joints read as one frame.
  for(const u of [0,w]){const [sx,sy]=P(cam,u,h);pm.rect(sx-1,sy-1,1,2,t[3]);pm.rect(sx,sy-1,1,2,t[1]);}}};
 return [net,bar,post(0),post(w)];}

// ── Machines: panels, screens, lamps ─────────────────────────────────────────────────────────────────────────────────────
/**
 * An upright board (a scoreboard, a sign, a machine's front, a screen) standing on (x, y, z), `w` wide along its axis, `h`
 * tall, `t` thick. face 'x': the board runs along +x and faces the viewer's left (+y); face 'y': runs along +y, faces right
 * (+x). `text` is painted on the face in the 3×5 font, sheared to the face; `glow` makes the face a lit screen.
 */
export function panel(x:number,y:number,z:number,w:number,h:number,{face='x',t=.2,ramp='steel' as RampLike,screen,text,textColour=SWATCH.led,id,pad=.25}:{face?:'x'|'y';t?:number;ramp?:RampLike;screen?:string;text?:string;textColour?:string;id?:string;pad?:number}={}):Item[]{
 const body=face==='x'?block(x,y,z,w,t,h,ramp,{id}):block(x,y,z,t,w,h,ramp,{id});
 const out:Item[]=[body];
 if(screen||text){out.push({key:body.key+.001,layer:LAYER.solid,id,draw:(pm,cam)=>{
  const F=(u:number,v:number)=>face==='x'?toScreen(cam,x+u,y+t,z+v):toScreen(cam,x+t,y+u,z+v);
  if(screen)pm.poly([F(pad,pad),F(w-pad,pad),F(w-pad,h-pad),F(pad,h-pad)],screen);
  if(text){const [sx,sy]=face==='x'?F(pad+.15,h-pad-.1):F(w-pad-.15,h-pad-.1);pm.text(text,sx+1,sy+1,textColour,face==='x'?'x':'y');}}});}
 return out;}
/** A lamp: a bright core and a dithered halo (light layer: over the solids, under markers). r in pixels. */
export function lamp(x:number,y:number,z:number,{r=6,core=SWATCH.lampCore,glow=SWATCH.lampGlow,on=true}:{r?:number;core?:string;glow?:string;on?:boolean}={}):Item{
 return {key:depth(x,y,z),layer:LAYER.light,draw:(pm,cam)=>{const [sx,sy]=toScreen(cam,x,y,z);
  if(!on){pm.rect(sx-1,sy-1,2,2,RAMPS.steel[1]);return;}
  pm.ellipse(sx,sy,r,r/1.4,{a:null,b:glow,level:3});pm.ellipse(sx,sy,r*.55,r*.4,{a:null,b:glow,level:8});pm.rect(sx-1,sy-1,2,2,core);}};}

// ── Markers (always on top): reticle, aim path, arrow ───────────────────────────────────────────────────────────────────
/** A floor reticle: a 2:1 diamond ring with four ticks. */
export function reticle(x:number,y:number,{colour=RAMPS.gold[2],r=.5}:{colour?:string;r?:number}={}):Item{
 return {key:depth(x,y),layer:LAYER.marker,draw:(pm,cam)=>{const P=(a:number,b:number)=>toScreen(cam,a,b,0);
  pm.polyline([P(x-r,y),P(x,y-r),P(x+r,y),P(x,y+r)],'#000000',true);
  const [sx,sy]=P(x,y);pm.polyline([[sx-Math.round(r*8)+1,sy],[sx,sy-Math.round(r*4)+1],[sx+Math.round(r*8)-1,sy],[sx,sy+Math.round(r*4)-1]],colour,true);pm.set(sx,sy,colour);}};}
/** A dotted path through world points (aim line, flight preview): every other pixel, in a colour with a black under-dot. */
export function path(pts:readonly (readonly [number,number,number])[],colour:string=RAMPS.gold[2],gap=2):Item{
 return {key:0,layer:LAYER.marker,draw:(pm,cam)=>{let n=0;
  for(let i=0;i+1<pts.length;i++){const a=toScreenF(cam,...pts[i]),b=toScreenF(cam,...pts[i+1]),len=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));
   for(let k=0;k<len;k++,n++){if(n%(gap*2)>=gap)continue;const x=Math.round(a[0]+(b[0]-a[0])*k/len),y=Math.round(a[1]+(b[1]-a[1])*k/len);pm.set(x,y+1,'#000000');pm.set(x,y,colour);}}}};}
/** Screen-space helper: draw at a projected point (for one-off pixel art, e.g. a "!" over a head). */
export function at(x:number,y:number,z:number,fn:(pm:Pixmap,p:Px)=>void,layer:number=LAYER.marker):Item{
 return {key:depth(x,y,z),layer,draw:(pm,cam)=>fn(pm,toScreen(cam,x,y,z))};}
