import {EXHIBITS,GALLERIES,galleryOf,timelineOrder,type Exhibit} from '../endgame/museum';
import {GRAD_TITLES,GRADUATION_FORMATS} from '../endgame/graduationModel';

/**
 * The History Museum's one print atlas (Oct 3 2026): every printed thing in the hall (gallery signs, the 12 case placards, the
 * timeline wall, the kit wall shirts, the certificate frames, the VAR screen, the futsal court and the guide desk sign) is
 * painted ONCE per visit to one 1024² canvas and drawn by ONE merged unlit mesh (the Konbini atlas pattern). The text is also in
 * the DOM (cards, aria labels), never only in 3D.
 */
export const ATLAS=1024;
export type Rect={x:number;y:number;w:number;h:number};
const r=(x:number,y:number,w:number,h:number):Rect=>({x,y,w,h});
export const SIGN_RECTS:Record<string,Rect>={laws:r(0,0,512,80),worldcup:r(512,0,512,80),kit:r(0,80,512,80),hall:r(512,80,512,80)};
export const placardRect=(i:number)=>r((i%4)*256,160+Math.floor(i/4)*112,256,112);
export const TIMELINE_RECT=r(0,496,1024,176);
export const KIT_RECTS=[r(0,672,160,160),r(160,672,160,160),r(320,672,160,160)];
export const KIT_NUMBERS=[1,9,10] as const;
export const VAR_RECT=r(480,672,192,128),COURT_RECT=r(672,672,192,128),SHIRT_NUMBER_RECT=r(864,672,96,96),STAR_RECT=r(864,768,64,64);
export const certRect=(i:number)=>r(i*160,832,160,192);
export const DESK_RECT=r(800,832,224,64),COLLECTION_SIGN_RECT=r(800,896,224,64);
/** The five certificate frames on the Hall of Fame wall: the four path graduations, then the Island Diploma. */
export const CERT_SLOTS=[...GRADUATION_FORMATS.map(f=>({id:`grad:${f}`,title:`${GRAD_TITLES[f]} Graduate`})),{id:'diploma',title:'Island Diploma'}] as const;

const INK='#22366b',CREAM='#fff1d3',PAPER='#f6ecd6';
const serif='Georgia, "Times New Roman", serif',sans='system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
function fit(g:CanvasRenderingContext2D,text:string,max:number,size:number,weight:string,family:string){let s=size;do{g.font=`${weight} ${s}px ${family}`;s-=1;}while(g.measureText(text).width>max&&s>9);}
function wrap(g:CanvasRenderingContext2D,text:string,max:number){const words=text.split(' '),lines:string[]=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>max&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
function round(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,rad:number){g.beginPath();g.moveTo(x+rad,y);g.arcTo(x+w,y,x+w,y+h,rad);g.arcTo(x+w,y+h,x,y+h,rad);g.arcTo(x,y+h,x,y,rad);g.arcTo(x,y,x+w,y,rad);g.closePath();}
function lockGlyph(g:CanvasRenderingContext2D,cx:number,cy:number,s:number,color:string){g.save();g.strokeStyle=color;g.fillStyle=color;g.lineWidth=s*.16;g.beginPath();g.arc(cx,cy-s*.2,s*.28,Math.PI,0);g.stroke();g.fillRect(cx-s*.42,cy-s*.2,s*.84,s*.62);g.restore();}
function shirt(g:CanvasRenderingContext2D,rect:Rect,fill:string,num:string){
 const {x,y,w,h}=rect,cx=x+w/2;g.fillStyle=fill;g.strokeStyle=INK;g.lineWidth=5;g.lineJoin='round';
 g.beginPath();g.moveTo(cx-w*.18,y+h*.12);g.lineTo(cx-w*.42,y+h*.26);g.lineTo(cx-w*.34,y+h*.44);g.lineTo(cx-w*.26,y+h*.4);g.lineTo(cx-w*.26,y+h*.9);g.lineTo(cx+w*.26,y+h*.9);g.lineTo(cx+w*.26,y+h*.4);g.lineTo(cx+w*.34,y+h*.44);g.lineTo(cx+w*.42,y+h*.26);g.lineTo(cx+w*.18,y+h*.12);g.quadraticCurveTo(cx,y+h*.24,cx-w*.18,y+h*.12);g.closePath();g.fill();g.stroke();
 g.fillStyle=CREAM;g.textAlign='center';g.textBaseline='middle';g.font=`900 ${Math.round(h*.36)}px ${sans}`;g.fillText(num,cx,y+h*.62);
}

/** Paints the atlas. `open[id]` = that case is open; `earned` = certificate ids the player holds. */
export function paintMuseumAtlas(canvas:HTMLCanvasElement,open:Readonly<Record<string,boolean>>,earned:readonly string[]){
 canvas.width=ATLAS;canvas.height=ATLAS;const g=canvas.getContext('2d');if(!g)return canvas;
 g.clearRect(0,0,ATLAS,ATLAS);g.textBaseline='middle';g.textAlign='center';
 // Gallery signs: cream lettering on the gallery colour, a thin cream rule (the island's venue signs).
 for(const gal of GALLERIES){const s=SIGN_RECTS[gal.id];g.fillStyle=gal.art;round(g,s.x+4,s.y+6,s.w-8,s.h-12,12);g.fill();g.strokeStyle=CREAM;g.lineWidth=3;round(g,s.x+12,s.y+13,s.w-24,s.h-26,8);g.stroke();
  g.fillStyle=CREAM;fit(g,gal.title.toUpperCase(),s.w-60,36,'700',serif);g.fillText(gal.title.toUpperCase(),s.x+s.w/2,s.y+s.h/2+2);}
 // Case placards: year (big) + title, on the gallery colour; a locked case shows a lock.
 EXHIBITS.forEach((e,i)=>{const p=placardRect(i),gal=galleryOf(e.gallery),isOpen=!!open[e.id];
  g.fillStyle=PAPER;round(g,p.x+4,p.y+4,p.w-8,p.h-8,10);g.fill();g.fillStyle=gal.art;g.fillRect(p.x+4,p.y+4,p.w-8,30);
  g.fillStyle=CREAM;fit(g,e.year,p.w-40,22,'800',sans);g.fillText(e.year,p.x+p.w/2,p.y+20);
  g.fillStyle=INK;g.font=`700 21px ${serif}`;const lines=wrap(g,e.title,p.w-36).slice(0,2);lines.forEach((l,k)=>g.fillText(l,p.x+p.w/2,p.y+58+k*24-(lines.length-1)*8));
  if(!isOpen)lockGlyph(g,p.x+p.w-22,p.y+p.h-22,18,gal.art);});
 // Timeline wall: every case's year, oldest first, on one line; locked years are faded with a lock.
 {const t=TIMELINE_RECT,list=timelineOrder(),step=(t.w-60)/list.length,y=t.y+t.h*.52;g.fillStyle=PAPER;round(g,t.x+4,t.y+4,t.w-8,t.h-8,16);g.fill();
  g.fillStyle=INK;g.font=`700 26px ${serif}`;g.fillText('THE STORY OF FOOTBALL',t.x+t.w/2,t.y+28);
  g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.moveTo(t.x+24,y);g.lineTo(t.x+t.w-24,y);g.stroke();
  list.forEach((e:Exhibit,i)=>{const cx=t.x+30+step*(i+.5),gal=galleryOf(e.gallery),isOpen=!!open[e.id];g.globalAlpha=isOpen?1:.45;
   g.fillStyle=gal.art;g.beginPath();g.arc(cx,y,13,0,Math.PI*2);g.fill();g.strokeStyle=CREAM;g.lineWidth=3;g.stroke();
   g.fillStyle=INK;fit(g,e.year.replace('Before the ','<'),step-6,20,'800',sans);g.fillText(e.year.replace('Before the ','<'),cx,y-34);
   if(isOpen){g.font=`700 13px ${sans}`;const words=wrap(g,e.title,step-6).slice(0,2);words.forEach((l,k)=>g.fillText(l,cx,y+32+k*15));}else lockGlyph(g,cx,y+36,18,INK);
   g.globalAlpha=1;});}
 // Kit wall: shirts 1 (goalkeeper colours), 9 and 10.
 KIT_RECTS.forEach((k,i)=>shirt(g,k,i===0?'#3a9e5c':i===1?'#d8466f':'#2f6fb0',String(KIT_NUMBERS[i])));
 // VAR screen face: a pitch, the goal line and a ball, "VAR" in the corner.
 {const v=VAR_RECT;g.fillStyle='#1d3a2c';g.fillRect(v.x,v.y,v.w,v.h);g.fillStyle='#3f8f55';g.fillRect(v.x+8,v.y+8,v.w-16,v.h-16);g.strokeStyle=CREAM;g.lineWidth=4;g.beginPath();g.moveTo(v.x+v.w*.62,v.y+8);g.lineTo(v.x+v.w*.62,v.y+v.h-8);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.arc(v.x+v.w*.5,v.y+v.h*.55,11,0,Math.PI*2);g.fill();g.fillStyle=CREAM;g.font=`900 20px ${sans}`;g.textAlign='left';g.fillText('VAR',v.x+14,v.y+24);g.textAlign='center';}
 // Futsal court (top view).
 {const c=COURT_RECT;g.fillStyle='#8fc3dc';g.fillRect(c.x,c.y,c.w,c.h);g.strokeStyle=CREAM;g.lineWidth=4;g.strokeRect(c.x+8,c.y+8,c.w-16,c.h-16);g.beginPath();g.moveTo(c.x+c.w/2,c.y+8);g.lineTo(c.x+c.w/2,c.y+c.h-8);g.stroke();
  g.beginPath();g.arc(c.x+c.w/2,c.y+c.h/2,18,0,Math.PI*2);g.stroke();for(const s of [-1,1]){g.beginPath();g.arc(c.x+c.w/2+s*(c.w/2-8),c.y+c.h/2,30,s<0?-Math.PI/2:Math.PI/2,s<0?Math.PI/2:Math.PI*1.5);g.stroke();}}
 // The shirt case's number, and the Hall of Fame star.
 {const s=SHIRT_NUMBER_RECT;g.fillStyle=CREAM;g.font=`900 64px ${sans}`;g.fillText('10',s.x+s.w/2,s.y+s.h/2+4);}
 {const s=STAR_RECT,cx=s.x+s.w/2,cy=s.y+s.h/2;g.fillStyle=PAPER;g.fillRect(s.x,s.y,s.w,s.h);g.fillStyle=INK;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?11:25;g.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}g.closePath();g.fill();}
 // Certificate frames: earned = cream paper with a seal and the title; not yet = an empty dashed frame.
 CERT_SLOTS.forEach((c,i)=>{const f=certRect(i),got=earned.includes(c.id);
  g.fillStyle=got?'#e7b94a':'#b9ad94';g.fillRect(f.x+6,f.y+6,f.w-12,f.h-12);g.fillStyle=got?CREAM:'#ece3cf';g.fillRect(f.x+20,f.y+20,f.w-40,f.h-40);
  if(got){g.fillStyle=INK;g.font=`800 12px ${sans}`;g.fillText('CERTIFICATE',f.x+f.w/2,f.y+40);g.font=`700 19px ${serif}`;wrap(g,c.title,f.w-50).forEach((l,k)=>g.fillText(l,f.x+f.w/2,f.y+76+k*22));
   g.fillStyle='#f2bb45';g.beginPath();g.arc(f.x+f.w/2,f.y+f.h-56,18,0,Math.PI*2);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();}
  else{g.setLineDash([8,7]);g.strokeStyle='#8c8068';g.lineWidth=3;g.strokeRect(f.x+30,f.y+30,f.w-60,f.h-60);g.setLineDash([]);g.fillStyle='#8c8068';g.font=`900 44px ${sans}`;g.fillText('?',f.x+f.w/2,f.y+f.h/2);}});
 // Guide desk and the inside door sign.
 {const d=DESK_RECT;g.fillStyle='#294f43';round(g,d.x+4,d.y+6,d.w-8,d.h-12,10);g.fill();g.fillStyle='#f4cc7c';fit(g,'WELCOME · ASK ME!',d.w-30,24,'800',sans);g.fillText('WELCOME · ASK ME!',d.x+d.w/2,d.y+d.h/2+1);}
 {const d=COLLECTION_SIGN_RECT;g.fillStyle='#477c6a';round(g,d.x+4,d.y+6,d.w-8,d.h-12,10);g.fill();g.strokeStyle=CREAM;g.lineWidth=2;round(g,d.x+10,d.y+11,d.w-20,d.h-22,7);g.stroke();g.fillStyle=CREAM;fit(g,'YOUR COLLECTION',d.w-34,24,'700',serif);g.fillText('YOUR COLLECTION',d.x+d.w/2,d.y+d.h/2+1);}
 return canvas;
}
