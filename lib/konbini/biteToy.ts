/**
 * The Konbini big-view "bite toy" (user, Sep 30 2026: "if you tap the item … every tap you do, it takes a bite out of it and
 * makes a vibrate and bite sound … when it's done, it starts the animation again building the item").
 *
 * Purely visual fun on the reveal canvas (components/KonbiniReveal.tsx), in the post-purchase reveal, Preview and collection
 * replays: it never eats the real item, spends, collects or touches any save; the Eat now / Save / Buy / Done buttons are
 * unchanged. Food takes BITES scalloped tooth-mark bites (right edge → top-left → top → all gone, crumbs left); drinks take
 * sips (the liquid level drops a notch; the last sip empties it). After the last one, the next tap or a short beat
 * (REBUILD_MS) rebuilds the item with the layer-by-layer build, and it loops forever like a toy.
 *
 * Heat: event-driven only. A tap redraws the canvas once, plus a crumb puff of PUFF_MS (skipped under reduced motion), then
 * the canvas is static again. The item's low-res alpha mask (MASK² bytes) is measured once per item and cached; nothing heavy
 * runs per tap. This module has NO access to the ledger, wallet or saves: its only outputs are the injected ports.
 */
export const BITES=4;
export const REBUILD_MS=600;
export const PUFF_MS=280;
export const HAPTIC_MS=16;
export const MASK=48;
export type BiteKind='bite'|'sip';
export type BiteSound='bite'|'sip'|'gone';
export type BitePorts={
 kind:BiteKind;label:string;
 reduced:()=>boolean;
 /** Draw the eaten state once (`bites` taken so far; `gone` = finished) and, when `puff`, play a ≤PUFF_MS crumb puff. */
 render:(bites:number,gone:boolean,puff:boolean)=>void;
 sound:(s:BiteSound)=>void;
 vibrate:(ms:number)=>void;
 announce:(text:string)=>void;
 /** Start the layer-by-layer build again (instant under reduced motion); the caller calls `built()` when it is done. */
 rebuild:()=>void;
 setTimer:(fn:()=>void,ms:number)=>unknown;clearTimer:(id:unknown)=>void;
};
export type BiteToy={tap:()=>boolean;built:()=>void;dispose:()=>void;state:()=>{bites:number;gone:boolean;ready:boolean;rebuilds:number}};
export const biteLabel=(kind:BiteKind,label:string)=>kind==='sip'?`Take a sip of ${label}`:`Take a bite of ${label}`;
export const biteAnnouncement=(kind:BiteKind,n:number)=>n>=BITES?'All gone! Making another…':`${kind==='sip'?'Sip':'Bite'} ${n} of ${BITES}`;

export function createBiteToy(ports:BitePorts):BiteToy{
 let bites=0,gone=false,ready=false,timer:unknown=null,rebuilds=0,disposed=false;
 const clear=()=>{if(timer!==null){ports.clearTimer(timer);timer=null;}};
 const rebuild=()=>{clear();if(disposed)return;bites=0;gone=false;ready=false;rebuilds++;ports.rebuild();};
 return {
  tap(){
   if(disposed||!ready)return false;
   if(gone){rebuild();return true;}
   bites++;gone=bites>=BITES;const reduced=ports.reduced();
   ports.render(bites,gone,!reduced);ports.sound(ports.kind);if(gone)ports.sound('gone');
   if(!reduced)ports.vibrate(HAPTIC_MS);
   ports.announce(biteAnnouncement(ports.kind,bites));
   if(gone)timer=ports.setTimer(()=>{timer=null;rebuild();},REBUILD_MS);
   return true;
  },
  built(){if(disposed)return;ready=true;bites=0;gone=false;},
  dispose(){disposed=true;clear();},
  state:()=>({bites,gone,ready,rebuilds}),
 };
}

// ---- Geometry (in the reveal's 300-unit art space) ------------------------------------------------------------------------
export type ItemBounds={cx:number;cy:number;x0:number;y0:number;x1:number;y1:number;size:number};
export type BiteSpot={x:number;y:number;r:number;rot:number};
/** Bounds + centroid of a MASK×MASK alpha mask (1 = opaque) laid over a `space`-unit square. */
export function maskBounds(mask:ArrayLike<number>,space=300,n=MASK):ItemBounds{
 let sx=0,sy=0,k=0,x0=n,y0=n,x1=-1,y1=-1;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(mask[y*n+x]){sx+=x;sy+=y;k++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 const u=space/n;if(!k)return {cx:space/2,cy:space/2,x0:space*.3,y0:space*.3,x1:space*.7,y1:space*.7,size:space*.4};
 return {cx:(sx/k+.5)*u,cy:(sy/k+.5)*u,x0:x0*u,y0:y0*u,x1:(x1+1)*u,y1:(y1+1)*u,size:Math.max(x1-x0+1,y1-y0+1)*u};
}
/** Where bite `i` (0-based) lands: the right edge, the top-left, then a big one from the top, always cutting in from an edge
 *  (a hole punched in the middle read as a white blob in the frame strips); the last bite takes everything. */
export function biteSpots(mask:ArrayLike<number>,space=300,n=MASK):BiteSpot[]{
 const b=maskBounds(mask,space,n),u=space/n,on=(x:number,y:number)=>{const i=Math.floor(x/u),j=Math.floor(y/u);return i>=0&&j>=0&&i<n&&j<n&&!!mask[j*n+i];};
 const edge=(dx:number,dy:number)=>{const l=Math.hypot(dx,dy);dx/=l;dy/=l;let last=[b.cx,b.cy];for(let s=0;s<space;s+=u/2){const x=b.cx+dx*s,y=b.cy+dy*s;if(on(x,y))last=[x,y];}return {x:last[0],y:last[1],dx,dy};};
 const at=(dx:number,dy:number,k:number):BiteSpot=>{const e=edge(dx,dy),r=Math.max(10,b.size*k);return {x:e.x+e.dx*r*.35,y:e.y+e.dy*r*.35,r,rot:Math.atan2(e.dy,e.dx)};};
 return [at(1,-.12,.22),at(-.75,-.66,.24),at(.25,-1,.3)];
}
/** A bite outline: a slightly squashed circle whose edge is scalloped by tooth marks. */
export function scallop(s:BiteSpot,points=48,teeth=5):[number,number][]{
 const out:[number,number][]=[],cr=Math.cos(s.rot),sr=Math.sin(s.rot);
 for(let i=0;i<points;i++){const a=i/points*Math.PI*2,k=.84+.16*Math.abs(Math.sin(a*teeth)),x=Math.cos(a)*s.r*k,y=Math.sin(a)*s.r*k*.88;out.push([s.x+x*cr-y*sr,s.y+x*sr+y*cr]);}
 return out;
}
/** Drink level after `sips` (1 = full, 0 = empty). */
export const drinkLevel=(sips:number)=>Math.max(0,1-Math.min(BITES,sips)/BITES);
/** Seeded crumbs left on the table under bite `i` (deterministic: the same picture on every redraw). */
export function crumbsFor(i:number,s:BiteSpot,b:ItemBounds,count=5):{x:number;y:number;r:number;c:number}[]{
 let seed=(i+1)*2654435761>>>0;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 return Array.from({length:count},()=>({x:s.x+(r()-.5)*s.r*1.8,y:Math.min(b.y1+4,Math.max(s.y,b.y1-8)+r()*10),r:1.2+r()*1.4,c:Math.floor(r()*3)}));
}
