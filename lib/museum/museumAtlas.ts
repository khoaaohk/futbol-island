import {EXHIBITS,GALLERIES,galleryOf,timelineOrder,type Exhibit} from '../endgame/museum';
import {GRAD_TITLES,GRADUATION_FORMATS} from '../endgame/graduationModel';

/**
 * The History Museum's one print atlas (Oct 3 2026; restyled Oct 10 2026 as a modern gallery, docs/museum-modern-style.md):
 * every printed thing in the hall (gallery wall panels, the 12 wall labels, the timeline wall, the kit wall's colour fields, the
 * certificate frames, the information desk and the Your Collection panel) is painted ONCE per visit to one 1024² canvas and drawn
 * by ONE merged unlit mesh (the Konbini atlas pattern). Swiss-style: one grotesque sans, left-aligned, ink on gallery white, one
 * primary accent per gallery. The text is also in the DOM (cards, aria labels), never only in 3D.
 */
export const ATLAS=1024;
export type Rect={x:number;y:number;w:number;h:number};
const r=(x:number,y:number,w:number,h:number):Rect=>({x,y,w,h});
export const SIGN_RECTS:Record<string,Rect>={laws:r(0,0,512,80),worldcup:r(512,0,512,80),kit:r(0,80,512,80),hall:r(512,80,512,80)};
export const placardRect=(i:number)=>r((i%4)*256,160+Math.floor(i/4)*112,256,112);
export const TIMELINE_RECT=r(0,496,1024,176);
export const KIT_RECTS=[r(0,672,160,160),r(160,672,160,160),r(320,672,160,160)];
export const KIT_NUMBERS=[1,9,10] as const;
/** The hidden-ball wall's peg grid (PEGBOARD: 20 × 5 on a 4:1 panel). */
export const PEG_RECT=r(480,672,544,136);
export const certRect=(i:number)=>r(i*160,832,160,192);
export const DESK_RECT=r(800,832,224,64),COLLECTION_SIGN_RECT=r(800,896,224,64);
/** The five certificate frames on the Hall of Fame wall: the four path graduations, then the Island Diploma. */
export const CERT_SLOTS=[...GRADUATION_FORMATS.map(f=>({id:`grad:${f}`,title:`${GRAD_TITLES[f]} Graduate`})),{id:'diploma',title:'Island Diploma'}] as const;

/** The gallery palette (docs/museum-modern-style.md) and each gallery's one accent. */
const INK='#1d1d1b',MUTED='#6b6a66',HAIR='#d9d6cf',CARD='#fbfaf7';
export const GALLERY_ACCENT:Readonly<Record<string,string>>={laws:'#2a5bd7',worldcup:'#e4322b',kit:'#f2c230',hall:'#1f8a5b'};
export const accentOf=(gallery:string)=>GALLERY_ACCENT[gallery]??INK;
const sans='"Helvetica Neue", Helvetica, Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
function fit(g:CanvasRenderingContext2D,text:string,max:number,size:number,weight:string){let s=size;do{g.font=`${weight} ${s}px ${sans}`;s-=1;}while(g.measureText(text).width>max&&s>9);}
function wrap(g:CanvasRenderingContext2D,text:string,max:number){const words=text.split(' '),lines:string[]=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>max&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
/** A card: flat white with a one-pixel hairline (no rounded corners, no shadow). */
function card(g:CanvasRenderingContext2D,r:Rect,inset=2){g.fillStyle=CARD;g.fillRect(r.x+inset,r.y+inset,r.w-inset*2,r.h-inset*2);g.strokeStyle=HAIR;g.lineWidth=2;g.strokeRect(r.x+inset+1,r.y+inset+1,r.w-inset*2-2,r.h-inset*2-2);}
const yearOf=(e:Exhibit)=>e.year.replace('Before the ','<');

/** Paints the atlas. `open[id]` = that case is open; `earned` = certificate ids the player holds. */
export function paintMuseumAtlas(canvas:HTMLCanvasElement,open:Readonly<Record<string,boolean>>,earned:readonly string[]){
 canvas.width=ATLAS;canvas.height=ATLAS;const g=canvas.getContext('2d');if(!g)return canvas;
 g.clearRect(0,0,ATLAS,ATLAS);g.textBaseline='alphabetic';g.textAlign='left';
 // Gallery wall panels: the title in the sans, ink on white, a short accent rule above it.
 for(const gal of GALLERIES){const s=SIGN_RECTS[gal.id];card(g,s,0);g.fillStyle=accentOf(gal.id);g.fillRect(s.x+22,s.y+18,40,6);
  g.fillStyle=INK;fit(g,gal.title,s.w-44,30,'700');g.fillText(gal.title,s.x+22,s.y+60);}
 // Wall labels: **Title**, then "Year · Gallery" in muted ink, a small accent square; not yet open: "Not yet on view".
 EXHIBITS.forEach((e,i)=>{const p=placardRect(i),gal=galleryOf(e.gallery),isOpen=!!open[e.id];card(g,p);
  g.fillStyle=isOpen?accentOf(gal.id):HAIR;g.fillRect(p.x+16,p.y+16,12,12);
  g.fillStyle=INK;g.font=`700 20px ${sans}`;const lines=wrap(g,e.title,p.w-32).slice(0,2);lines.forEach((l,k)=>g.fillText(l,p.x+16,p.y+50+k*22));
  g.fillStyle=MUTED;fit(g,isOpen?`${e.year} · ${gal.title}`:'Not yet on view',p.w-32,14,'500');g.fillText(isOpen?`${e.year} · ${gal.title}`:'Not yet on view',p.x+16,p.y+p.h-16);});
 // Timeline wall: every case's year, oldest first, on one hairline; open years carry their gallery accent, locked ones a ring.
 {const t=TIMELINE_RECT,list=timelineOrder(),step=(t.w-64)/list.length,y=t.y+t.h*.56;card(g,t,0);
  g.fillStyle=INK;g.font=`700 26px ${sans}`;g.fillText('The story of football',t.x+32,t.y+40);g.fillStyle=MUTED;g.font=`500 14px ${sans}`;g.fillText('1863 → Today',t.x+32,t.y+62);
  g.fillStyle=INK;g.fillRect(t.x+32,y-1,t.w-64,2);
  list.forEach((e:Exhibit,i)=>{const cx=t.x+32+step*(i+.5),isOpen=!!open[e.id];g.textAlign='center';
   if(isOpen){g.fillStyle=accentOf(e.gallery);g.beginPath();g.arc(cx,y,9,0,Math.PI*2);g.fill();}else{g.fillStyle=CARD;g.beginPath();g.arc(cx,y,8,0,Math.PI*2);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();}
   g.fillStyle=isOpen?INK:MUTED;fit(g,yearOf(e),step-8,20,'700');g.fillText(yearOf(e),cx,y-20);
   g.font=`500 12px ${sans}`;g.fillStyle=MUTED;wrap(g,isOpen?e.title:'Not yet on view',step-8).slice(0,2).forEach((l,k)=>g.fillText(l,cx,y+30+k*14));g.textAlign='left';});}
 // Kit wall: three colour fields (the goalkeeper's 1, the 9 and the 10), the number small in the corner.
 KIT_RECTS.forEach((k,i)=>{g.fillStyle=['#1f8a5b','#e4322b','#2a5bd7'][i];g.fillRect(k.x,k.y,k.w,k.h);g.fillStyle=CARD;g.font=`700 28px ${sans}`;g.fillText(String(KIT_NUMBERS[i]),k.x+14,k.y+k.h-16);});
 // Hidden-ball wall: a quiet grid of hairline-grey pegs on white (found balls sit on top in 3D).
 {const p=PEG_RECT;g.fillStyle=CARD;g.fillRect(p.x,p.y,p.w,p.h);g.fillStyle=HAIR;for(let j=0;j<5;j++)for(let i=0;i<20;i++){g.beginPath();g.arc(p.x+(i+.5)*p.w/20,p.y+(j+.5)*p.h/5,3.2,0,Math.PI*2);g.fill();}}
 // Certificate frames: earned = the title on a white mat with a green dot; not yet = an empty mat with a hairline square.
 CERT_SLOTS.forEach((c,i)=>{const f=certRect(i),got=earned.includes(c.id);g.fillStyle=CARD;g.fillRect(f.x,f.y,f.w,f.h);
  if(got){g.fillStyle=MUTED;g.font=`600 11px ${sans}`;g.fillText('CERTIFICATE',f.x+22,f.y+40);g.fillStyle=INK;g.font=`700 18px ${sans}`;wrap(g,c.title,f.w-44).forEach((l,k)=>g.fillText(l,f.x+22,f.y+70+k*21));
   g.fillStyle=i===4?'#f2c230':'#1f8a5b';g.beginPath();g.arc(f.x+30,f.y+f.h-34,8,0,Math.PI*2);g.fill();}
  else{g.strokeStyle=HAIR;g.lineWidth=2;g.strokeRect(f.x+28,f.y+28,f.w-56,f.h-56);g.fillStyle=MUTED;g.font=`500 12px ${sans}`;g.textAlign='center';g.fillText('Not yet earned',f.x+f.w/2,f.y+f.h/2+4);g.textAlign='left';}});
 // Information desk and the Your Collection panel.
 {const d=DESK_RECT;card(g,d,0);g.fillStyle=INK;fit(g,'Information · Ask me',d.w-36,22,'700');g.fillText('Information · Ask me',d.x+18,d.y+40);}
 {const d=COLLECTION_SIGN_RECT;card(g,d,0);g.fillStyle=GALLERY_ACCENT.hall;g.fillRect(d.x+18,d.y+12,28,4);g.fillStyle=INK;fit(g,'Your Collection',d.w-36,24,'700');g.fillText('Your Collection',d.x+18,d.y+46);}
 return canvas;
}
