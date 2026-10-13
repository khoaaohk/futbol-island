import {KITS,SWATCH,type Kit,type KitName} from './palette';
import type {Paint} from './raster';

/**
 * pixeliso · football players as small readable pixel characters (Oct 10 2026). Built procedurally on a 14 × 20 grid (18 px
 * tall inside a 1-px black outline: 1.8 m at Z_PX = 10), so every pose and kit stays one family: a 4-px head with hair, a 6-px
 * shirt in the team's three-tone ramp (light left, dark right: the light comes from the upper left like the blocks), a trim
 * collar, shorts, socks, boots. Team colour reads first, pose second, face last.
 *
 * Keys: h hair · s skin · S skin shade · L/j/J shirt light/mid/dark · n trim (collar, number) · p/P shorts · o socks · b boots
 * · g gloves · k outline.
 */
export type Pose='stand'|'run'|'kick'|'ready'|'dive'|'cheer'|'point';
export type Facing='front'|'back';
export type Skin='light'|'mid'|'dark';
export type Hair='black'|'brown'|'blond'|'red'|'bald';
export type Sprite={grid:string[];ax:number;ay:number};
const W=14,H=20;

function blank(w=W,h=H){return Array.from({length:h},()=>Array<string>(w).fill('.'));}
function outline(g:string[][]){const h=g.length,w=g[0].length,src=g.map(r=>r.slice());
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(src[y][x]!=='.')continue;
  if((x>0&&src[y][x-1]!=='.')||(x<w-1&&src[y][x+1]!=='.')||(y>0&&src[y-1][x]!=='.')||(y<h-1&&src[y+1][x]!=='.'))g[y][x]='k';}
 return g;}

/** The body, drawn in inner coordinates (the grid adds a 1-px margin for the outline). */
function body(pose:Pose,facing:Facing,frame:number):string[][]{
 const g=blank();const put=(x:number,y:number,c:string)=>{const X=x+1,Y=y+1;if(Y>=0&&Y<H&&X>=0&&X<W)g[Y][X]=c;};
 const row=(y:number,x0:number,x1:number,c:string)=>{for(let x=x0;x<=x1;x++)put(x,y,c);};
 const dip=pose==='ready'?1:0;// knees bent: the whole upper body sits a pixel lower
 // Head (x 4..7).
 const hy=dip;
 if(facing==='front'){row(hy,4,7,'h');put(4,hy+1,'h');row(hy+1,5,6,'s');put(7,hy+1,'h');row(hy+2,4,7,'s');put(5,hy+2,'S');put(6,hy+2,'S');row(hy+3,4,6,'s');put(7,hy+3,'S');}
 else{row(hy,4,7,'h');row(hy+1,4,7,'h');row(hy+2,4,7,'h');row(hy+3,4,7,'h');}
 row(hy+4,5,6,'S');
 // Shirt (x 3..8, rows 5..10): light left column, dark right column, trim collar.
 for(let y=5;y<=10;y++){put(3,y+dip,'L');row(y+dip,4,7,'j');put(8,y+dip,'J');}
 if(facing==='front')row(5+dip,5,6,'n');else{row(6+dip,5,6,'n');put(5,7+dip,'n');put(6,8+dip,'n');}
 // Arms.
 const L=(pts:Array<[number,number,string]>)=>pts.forEach(([x,y,c])=>put(x,y,c));
 const R=(pts:Array<[number,number,string]>)=>pts.forEach(([x,y,c])=>put(11-x,y,c==='s'?'S':c==='L'||c==='j'?'J':c));
 if(pose==='stand'){L([[2,5,'L'],[2,6,'L'],[2,7,'s'],[2,8,'s'],[2,9,'s']]);R([[2,5,'j'],[2,6,'j'],[2,7,'s'],[2,8,'s'],[2,9,'s']]);}
 if(pose==='run'){const f=frame%2;
  if(f===0){L([[2,5,'L'],[2,6,'L'],[1,7,'s'],[1,8,'s']]);R([[2,5,'j'],[2,6,'j'],[2,7,'s'],[2,8,'s'],[2,9,'s']]);}
  else{L([[2,5,'L'],[2,6,'L'],[2,7,'s'],[2,8,'s'],[2,9,'s']]);R([[2,5,'j'],[2,6,'j'],[1,7,'s'],[1,8,'s']]);}}
 if(pose==='kick'){L([[2,5,'L'],[1,6,'L'],[0,7,'s'],[0,8,'s']]);R([[2,5,'j'],[2,6,'j'],[1,7,'s'],[1,8,'s']]);}
 if(pose==='ready'||pose==='dive'){L([[2,6,'L'],[1,6,'s'],[0,6,'g'],[0,5,'g']]);R([[2,6,'j'],[1,6,'s'],[0,6,'g'],[0,5,'g']]);}
 if(pose==='cheer'){L([[2,4,'L'],[2,3,'s'],[2,2,'s'],[1,1,'s']]);R([[2,4,'j'],[2,3,'s'],[2,2,'s'],[1,1,'s']]);}
 if(pose==='point'){L([[2,5,'L'],[2,6,'L'],[2,7,'s'],[2,8,'s'],[2,9,'s']]);R([[2,5,'j'],[1,5,'s'],[0,4,'s']]);}
 // Shorts (rows 11..12).
 const sy=11+dip;row(sy,3,8,'p');put(8,sy,'P');row(sy+1,3,4,'p');row(sy+1,7,8,'P');
 // Legs and boots.
 const leg=(x:number,top:number,len:number,boot:number)=>{put(x,top,'s');put(x+1,top,'s');for(let y=top+1;y<top+1+len;y++){put(x,y,'o');put(x+1,y,'o');}put(x+boot,top+1+len,'b');put(x+boot+1,top+1+len,'b');};
 if(pose==='stand'||pose==='cheer'||pose==='point'){leg(3,13,3,0);leg(7,13,3,0);}
 else if(pose==='run'){const f=frame%2;
  if(f===0){leg(3,13,2,-1);put(7,13,'s');put(8,13,'s');put(7,14,'o');put(8,14,'o');put(8,15,'o');put(9,15,'o');put(8,16,'b');put(9,16,'b');}
  else{leg(7,13,2,1);put(3,13,'s');put(4,13,'s');put(3,14,'o');put(4,14,'o');put(2,15,'o');put(3,15,'o');put(2,16,'b');put(3,16,'b');}}
 else if(pose==='kick'){leg(3,13,3,0);put(7,13,'s');put(8,13,'s');put(8,14,'o');put(9,14,'o');put(9,15,'o');put(10,15,'o');put(10,16,'b');put(11,16,'b');}
 else if(pose==='ready'||pose==='dive'){leg(2,14,2,0);leg(8,14,2,0);}
 return g;
}

function rotate(g:string[][],dir:1|-1){const h=g.length,w=g[0].length,out=blank(h,w);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(dir>0)out[x][h-1-y]=g[y][x];else out[w-1-x][y]=g[y][x];}return out;}

const cache=new Map<string,Sprite>();
/**
 * The sprite grid for a pose. Anchor (ax, ay) = the grid pixel that stands on the ground point (between the feet, under the
 * bottom outline). A dive lies on its side (rotated), anchored at its middle. `frame` animates 'run' (two frames).
 */
export function figureSprite(pose:Pose,facing:Facing='front',frame=0):Sprite{
 const key=`${pose}|${facing}|${pose==='run'?frame%2:0}`;const hit=cache.get(key);if(hit)return hit;
 let g=outline(body(pose,facing,frame));let s:Sprite={grid:g.map(r=>r.join('')),ax:6,ay:H-1};
 if(pose==='dive'){g=rotate(g,1);s={grid:g.map(r=>r.join('')),ax:Math.floor(g[0].length/2),ay:g.length-2};}
 cache.set(key,s);return s;
}

const SKINS:Record<Skin,readonly string[]>={light:SWATCH.skinLight,mid:SWATCH.skinMid,dark:SWATCH.skinDark};
const HAIRS:Record<Hair,string|null>={black:SWATCH.hairBlack,brown:SWATCH.hairBrown,blond:SWATCH.hairBlond,red:SWATCH.hairRed,bald:null};
/** Colour keys for a kit, skin and hair. */
export function figureKeys(kit:Kit|KitName,skin:Skin='mid',hair:Hair='black'):Record<string,Paint>{
 const K:Kit=typeof kit==='string'?KITS[kit]:kit,S=SKINS[skin],hc=HAIRS[hair]??S[1];
 return {k:'#000000',h:hc,s:S[2],S:S[1],L:K.shirt[2],j:K.shirt[1],J:K.shirt[0],n:K.trim,p:K.shorts[1],P:K.shorts[0],o:K.socks,b:SWATCH.boot,g:K.gloves??S[2]};
}

/** The ball: 5 × 5 with its outline (a white ball with a black panel), plus a 2-frame spin. */
export const BALL_SPRITES:readonly (readonly string[])[]=[
 ['.kkk.','kwwwk','kwkwk','kwwSk','.kkk.'],
 ['.kkk.','kwkwk','kwwwk','kSwkk','.kkk.'],
];
export const BALL_KEYS:Record<string,Paint>={k:'#000000',w:'#fcfcfc',S:'#b4b4d8'};
/** A historic leather ball (brown, laced). */
export const LEATHER_KEYS:Record<string,Paint>={k:'#000000',w:'#b46c48',S:'#6c4824'};
