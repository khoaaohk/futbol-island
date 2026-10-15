import {EXHIBITS,GALLERIES,galleryOf,timelineOrder,type Exhibit} from '../endgame/museum';

/**
 * The History Museum's one print atlas (Oct 3 2026; restyled Oct 10 2026 as a modern gallery, docs/museum-modern-style.md):
 * every printed thing in the hall (gallery wall panels, the wall labels, the timeline wall, the kit wall's colour fields, the
 * information desk and the floodlight glow swatch) is painted ONCE per visit to one 1024² canvas and drawn by ONE merged unlit
 * mesh (the Konbini atlas pattern). Swiss-style: one grotesque sans, left-aligned, ink on gallery white, one primary accent per
 * gallery. The text is also in the DOM (cards, aria labels), never only in 3D.
 *
 * Oct 14 2026 layout (the Your Collection wing's pegboard, certificate frames and panel are gone; 23 cases, 7 galleries):
 *   y 0–256    gallery signs, 512 × 64, two a row (8 slots)
 *   y 256–416  the timeline wall
 *   y 416–544  the kit wall's three colour fields (128²), the desk sign, the glow swatch
 *   y 544–1024 wall labels, 170 × 80, six a row (36 slots)
 */
export const ATLAS=1024;
export type Rect={x:number;y:number;w:number;h:number};
const r=(x:number,y:number,w:number,h:number):Rect=>({x,y,w,h});
const SIGN_SLOT=['laws','worldcup','kit','hall','firsts','tactics','skills'];
export const SIGN_RECTS:Record<string,Rect>=Object.fromEntries(SIGN_SLOT.map((id,i)=>[id,r((i%2)*512,Math.floor(i/2)*64,512,64)]));
/** A sign's print height for a given width (the 8:1 panel). */
export const SIGN_ASPECT=64/512;
export const PLACARD={w:170,h:80,cols:6,y:544} as const;
export const placardRect=(i:number)=>r((i%PLACARD.cols)*PLACARD.w,PLACARD.y+Math.floor(i/PLACARD.cols)*PLACARD.h,PLACARD.w,PLACARD.h);
export const TIMELINE_RECT=r(0,256,1024,160);
export const KIT_RECTS=[r(0,416,128,128),r(128,416,128,128),r(256,416,128,128)];
export const KIT_NUMBERS=[1,9,10] as const;
export const DESK_RECT=r(384,416,224,64);
/** A flat warm-white swatch: the floodlight heads (unlit, so they read as lit) sample its centre. */
export const GLOW_RECT=r(608,416,32,32);

/** The gallery palette (docs/museum-modern-style.md) and each gallery's one accent. */
const INK='#1d1d1b',MUTED='#6b6a66',HAIR='#d9d6cf',CARD='#fbfaf7';
/** Oct 14 2026: the wing's galleries take the palette's black (Firsts), and share blue with the Laws (Rules & tactics: both are
 *  rules) and yellow with Balls and kits (Skills & science: both are about the ball and the kit). */
export const GALLERY_ACCENT:Readonly<Record<string,string>>={laws:'#2a5bd7',worldcup:'#e4322b',kit:'#f2c230',hall:'#1f8a5b',firsts:'#1d1d1b',tactics:'#2a5bd7',skills:'#f2c230'};
export const accentOf=(gallery:string)=>GALLERY_ACCENT[gallery]??INK;
const sans='"Helvetica Neue", Helvetica, Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
function fit(g:CanvasRenderingContext2D,text:string,max:number,size:number,weight:string){let s=size;do{g.font=`${weight} ${s}px ${sans}`;s-=1;}while(g.measureText(text).width>max&&s>9);}
function wrap(g:CanvasRenderingContext2D,text:string,max:number){const words=text.split(' '),lines:string[]=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>max&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
/** A card: flat white with a one-pixel hairline (no rounded corners, no shadow). */
function card(g:CanvasRenderingContext2D,r:Rect,inset=2){g.fillStyle=CARD;g.fillRect(r.x+inset,r.y+inset,r.w-inset*2,r.h-inset*2);g.strokeStyle=HAIR;g.lineWidth=2;g.strokeRect(r.x+inset+1,r.y+inset+1,r.w-inset*2-2,r.h-inset*2-2);}
const yearOf=(e:Exhibit)=>e.year.replace('Before the ','<');

/** Paints the atlas. `open[id]` = that case is open. */
export function paintMuseumAtlas(canvas:HTMLCanvasElement,open:Readonly<Record<string,boolean>>){
 canvas.width=ATLAS;canvas.height=ATLAS;const g=canvas.getContext('2d');if(!g)return canvas;
 g.clearRect(0,0,ATLAS,ATLAS);g.textBaseline='alphabetic';g.textAlign='left';
 // Gallery wall panels: the title in the sans, ink on white, a short accent rule above it.
 for(const gal of GALLERIES){const s=SIGN_RECTS[gal.id];if(!s)continue;card(g,s,0);g.fillStyle=accentOf(gal.id);g.fillRect(s.x+22,s.y+12,40,5);
  g.fillStyle=INK;fit(g,gal.title,s.w-44,26,'700');g.fillText(gal.title,s.x+22,s.y+50);}
 // Wall labels: **Title**, then "Year · Gallery" in muted ink, a small accent square; not yet open: "Not yet on view".
 EXHIBITS.forEach((e,i)=>{const p=placardRect(i),gal=galleryOf(e.gallery),isOpen=!!open[e.id];if(!gal)return;card(g,p);
  g.fillStyle=isOpen?accentOf(gal.id):HAIR;g.fillRect(p.x+10,p.y+10,8,8);
  g.fillStyle=INK;fit(g,'Ag',999,15,'700');const lines=wrap(g,e.title,p.w-20).slice(0,2);lines.forEach((l,k)=>g.fillText(l,p.x+10,p.y+36+k*16));
  const meta=isOpen?`${e.year} · ${gal.title}`:'Not yet on view';g.fillStyle=MUTED;fit(g,meta,p.w-20,11,'500');g.fillText(meta,p.x+10,p.y+p.h-10);});
 // Timeline wall: every case's year, oldest first, on one hairline; open years carry their gallery accent, locked ones a ring.
 // With 23 cases the years alternate above and below the line (the titles are on the DOM timeline card and in the exhibit).
 {const t=TIMELINE_RECT,list=timelineOrder(),step=(t.w-64)/list.length,y=t.y+t.h*.6;card(g,t,0);
  g.fillStyle=INK;g.font=`700 24px ${sans}`;g.fillText('The story of football',t.x+32,t.y+36);g.fillStyle=MUTED;g.font=`500 13px ${sans}`;g.fillText(`1863 → Today · ${list.length} cases`,t.x+32,t.y+56);
  g.fillStyle=INK;g.fillRect(t.x+32,y-1,t.w-64,2);
  list.forEach((e:Exhibit,i)=>{const cx=t.x+32+step*(i+.5),isOpen=!!open[e.id],up=i%2===0;g.textAlign='center';
   if(isOpen){g.fillStyle=accentOf(e.gallery);g.beginPath();g.arc(cx,y,7,0,Math.PI*2);g.fill();}else{g.fillStyle=CARD;g.beginPath();g.arc(cx,y,6,0,Math.PI*2);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();}
   g.fillStyle=HAIR;g.fillRect(cx-.5,up?y-16:y+8,1,8);
   g.fillStyle=isOpen?INK:MUTED;fit(g,yearOf(e),step*2-6,16,'700');g.fillText(yearOf(e),cx,up?y-22:y+36);g.textAlign='left';});}
 // Kit wall: three colour fields (the goalkeeper's 1, the 9 and the 10), the number small in the corner.
 KIT_RECTS.forEach((k,i)=>{g.fillStyle=['#1f8a5b','#e4322b','#2a5bd7'][i];g.fillRect(k.x,k.y,k.w,k.h);g.fillStyle=CARD;g.font=`700 24px ${sans}`;g.fillText(String(KIT_NUMBERS[i]),k.x+12,k.y+k.h-12);});
 // Information desk.
 {const d=DESK_RECT;card(g,d,0);g.fillStyle=INK;fit(g,'Information · Ask me',d.w-36,22,'700');g.fillText('Information · Ask me',d.x+18,d.y+40);}
 // The floodlight glow: a flat warm white.
 {const s=GLOW_RECT;g.fillStyle='#fff4c2';g.fillRect(s.x,s.y,s.w,s.h);}
 return canvas;
}
