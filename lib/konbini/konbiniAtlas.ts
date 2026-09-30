import {FOOD_MENU} from './food';
import {drawFood} from './foodArt';
import {MAGAZINES} from './konbiniContent';
/**
 * One 1024×512 canvas atlas for everything printed in the Konbini: the 23 foods, shelf decor, gear, the six magazine covers,
 * the store sign and four posters. The 3D shelves draw it on ONE merged unlit mesh; the UI reuses the same canvas as a CSS
 * sprite (one toDataURL per visit). Our own "しま Konbini" island brand: teal, sunny yellow and coral, a ball-in-a-wave mark.
 * No real chain's name, logo, stripes or trade dress; the luncheon-meat slice is generic (no can, no logo).
 */
export const ATLAS_W=1024,ATLAS_H=512,CELL=64,COLS=16;
export const cellRect=(cell:number)=>({x:(cell%COLS)*CELL,y:Math.floor(cell/COLS)*CELL,w:CELL,h:CELL});
export const DECOR={ball:24,pack:25,goal:26,shinpads:27,bagA:28,bagB:29,crackers:30,banana:31,cans:40,noodles:41,cone:42,bottleRow:43,sunscreen:55,flipflops:56,beachball:57,plant:58} as const;
/** A tall surfboard (one cell wide, two high). */
export const SURFBOARD_RECT={x:704,y:192,w:64,h:128};
export const magazineCell=(i:number)=>32+i;
export const SIGN_RECT={x:0,y:384,w:512,h:64},CAY_SIGN_RECT={x:0,y:448,w:512,h:64};
/** Posters: 0 water first, 1 fuel up, 2 match day, 3 stamp card, 4 sand sprints (surf), 5 beach soccer. */
export const POSTER_RECTS=[{x:512,y:320,w:128,h:192},{x:640,y:320,w:128,h:192},{x:768,y:320,w:128,h:192},{x:896,y:320,w:128,h:192},{x:0,y:192,w:128,h:192},{x:128,y:192,w:128,h:192}];
export const PALETTE={teal:'#2f8f8a',yellow:'#ffd35c',coral:'#f07a5f',cream:'#fff6dc',ink:'#1f3d3a',white:'#fbfaf5'};

type C=CanvasRenderingContext2D;
function rr(c:C,x:number,y:number,w:number,h:number,r:number){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function fill(c:C,color:string,draw:()=>void){c.fillStyle=color;draw();c.fill();}
function drawDecor(c:C,cell:number,x:number,y:number){
 switch(cell){
  case DECOR.ball:fill(c,'#fbfaf5',()=>{c.beginPath();c.arc(x,y,20,0,Math.PI*2);});c.fillStyle='#1f3d3a';for(const [dx,dy] of [[0,0],[-12,-9],[12,-9],[-9,12],[9,12]]){c.beginPath();c.arc(x+dx,y+dy,5,0,Math.PI*2);c.fill();}break;
  case DECOR.pack:fill(c,PALETTE.teal,()=>rr(c,x-18,y-24,36,48,4));fill(c,PALETTE.yellow,()=>c.rect(x-18,y-6,36,10));c.fillStyle=PALETTE.cream;c.font='bold 9px sans-serif';c.textAlign='center';c.fillText('CARDS',x,y+2);break;
  case DECOR.goal:c.strokeStyle='#fbfaf5';c.lineWidth=4;c.strokeRect(x-22,y-12,44,26);c.strokeStyle='#ffffff88';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(x-22+i*7.3,y-12);c.lineTo(x-22+i*7.3,y+14);c.stroke();}break;
  case DECOR.shinpads:for(const dx of [-10,10])fill(c,PALETTE.coral,()=>rr(c,x+dx-8,y-18,16,36,7));break;
  case DECOR.bagA:fill(c,'#f07a5f',()=>rr(c,x-16,y-22,32,44,4));fill(c,'#ffd35c',()=>{c.beginPath();c.arc(x,y,9,0,Math.PI*2);});break;
  case DECOR.bagB:fill(c,'#5b6fb8',()=>rr(c,x-16,y-22,32,44,4));fill(c,'#9ad04a',()=>c.rect(x-16,y-4,32,8));break;
  case DECOR.crackers:fill(c,'#fff1d3',()=>rr(c,x-20,y-14,40,30,4));for(let i=0;i<3;i++)fill(c,'#c98a3a',()=>{c.beginPath();c.arc(x-11+i*11,y+1,6,0,Math.PI*2);});break;
  case DECOR.banana:c.strokeStyle='#f2d24b';c.lineWidth=9;c.lineCap='round';c.beginPath();c.arc(x,y-14,24,.5,2.6);c.stroke();break;
  case DECOR.cans:for(const [dx,col] of [[-14,'#d8342c'],[0,'#2f8f8a'],[14,'#ffd35c']] as const)fill(c,col,()=>rr(c,x+dx-6,y-14,12,30,3));break;
  case DECOR.noodles:fill(c,'#fff6dc',()=>{c.beginPath();c.moveTo(x-18,y-16);c.lineTo(x+18,y-16);c.lineTo(x+13,y+20);c.lineTo(x-13,y+20);c.closePath();});fill(c,'#f07a5f',()=>c.rect(x-16,y-6,32,9));break;
  case DECOR.cone:fill(c,'#ff8a2a',()=>{c.beginPath();c.moveTo(x,y-22);c.lineTo(x+14,y+18);c.lineTo(x-14,y+18);c.closePath();});c.fillStyle='#fff';c.fillRect(x-8,y-2,16,5);break;
  case DECOR.sunscreen:fill(c,'#ffd35c',()=>rr(c,x-9,y-20,18,40,5));fill(c,'#f07a5f',()=>rr(c,x-6,y-26,12,8,2));fill(c,'#fbfaf5',()=>{c.beginPath();c.arc(x,y,6,0,Math.PI*2);});break;
  case DECOR.flipflops:for(const dx of [-10,10]){fill(c,'#5fb8f2',()=>{c.beginPath();c.ellipse(x+dx,y+4,8,18,0,0,Math.PI*2);});c.strokeStyle='#f07a5f';c.lineWidth=2.5;c.beginPath();c.moveTo(x+dx-6,y+2);c.lineTo(x+dx,y-8);c.lineTo(x+dx+6,y+2);c.stroke();}break;
  case DECOR.beachball:fill(c,'#fbfaf5',()=>{c.beginPath();c.arc(x,y,21,0,Math.PI*2);});for(const [a,col] of [[0,'#f07a5f'],[2.1,'#5fb8f2'],[4.2,'#ffd35c']] as const){c.fillStyle=col;c.beginPath();c.moveTo(x,y);c.arc(x,y,21,a,a+1);c.closePath();c.fill();}break;
  case DECOR.plant:fill(c,'#c98a5a',()=>{c.beginPath();c.moveTo(x-12,y+8);c.lineTo(x+12,y+8);c.lineTo(x+9,y+28);c.lineTo(x-9,y+28);c.closePath();});c.strokeStyle='#3d8f5a';c.lineWidth=5;c.lineCap='round';for(const a of [-1.2,-.6,0,.6,1.2]){c.beginPath();c.moveTo(x,y+8);c.quadraticCurveTo(x+Math.sin(a)*14,y-10,x+Math.sin(a)*26,y-18+Math.abs(a)*8);c.stroke();}break;
  case DECOR.bottleRow:for(const [dx,col] of [[-14,'#bfe6f5'],[0,'#8cc46a'],[14,'#7fd3f0']] as const)fill(c,col,()=>rr(c,x+dx-6,y-18,12,38,4));break;
 }
}
function logo(c:C,x:number,y:number,r:number){fill(c,PALETTE.yellow,()=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);});c.fillStyle=PALETTE.teal;c.beginPath();c.moveTo(x-r,y+r*.2);c.quadraticCurveTo(x-r*.4,y-r*.25,x,y+r*.2);c.quadraticCurveTo(x+r*.4,y+r*.6,x+r,y+r*.2);c.lineTo(x+r*.8,y+r*.7);c.quadraticCurveTo(x,y+r*1.2,x-r*.8,y+r*.7);c.closePath();c.fill();c.fillStyle='#fbfaf5';c.beginPath();c.arc(x+r*.1,y-r*.3,r*.28,0,Math.PI*2);c.fill();}
function sign(c:C,r:{x:number;y:number;w:number;h:number},sub:string){
 fill(c,PALETTE.teal,()=>c.rect(r.x,r.y,r.w,r.h));c.fillStyle=PALETTE.yellow;c.fillRect(r.x,r.y+r.h-8,r.w,4);c.fillStyle=PALETTE.coral;c.fillRect(r.x,r.y+r.h-4,r.w,4);
 logo(c,r.x+34,r.y+28,20);c.fillStyle=PALETTE.cream;c.textAlign='left';c.textBaseline='middle';c.font='bold 30px sans-serif';c.fillText('しま KONBINI',r.x+66,r.y+26);c.font='bold 13px sans-serif';c.fillStyle=PALETTE.yellow;c.fillText(sub,r.x+330,r.y+28);
}
function poster(c:C,r:{x:number;y:number;w:number;h:number},bg:string,title:string,lines:string[],draw?:(x:number,y:number)=>void){
 fill(c,bg,()=>c.rect(r.x+4,r.y+4,r.w-8,r.h-8));c.fillStyle=PALETTE.cream;c.textAlign='center';c.textBaseline='alphabetic';c.font='bold 17px sans-serif';c.fillText(title,r.x+r.w/2,r.y+30);
 draw?.(r.x+r.w/2,r.y+86);c.font='bold 11px sans-serif';lines.forEach((l,i)=>c.fillText(l,r.x+r.w/2,r.y+140+i*15));
}
export function paintKonbiniAtlas(canvas:HTMLCanvasElement){
 canvas.width=ATLAS_W;canvas.height=ATLAS_H;const c=canvas.getContext('2d')!;c.clearRect(0,0,ATLAS_W,ATLAS_H);
 for(const f of FOOD_MENU){const r=cellRect(f.cell);drawFood(c,f.id,r.x+32,r.y+34);}
 for(const cell of Object.values(DECOR)){const r=cellRect(cell);drawDecor(c,cell,r.x+32,r.y+34);}
 MAGAZINES.forEach((m,i)=>{const r=cellRect(magazineCell(i));fill(c,m.cover,()=>c.rect(r.x+8,r.y+2,48,60));c.fillStyle=m.ink;c.textAlign='center';c.font='bold 8px sans-serif';c.fillText(m.title.slice(0,12),r.x+32,r.y+13);
  fill(c,'#fbfaf5',()=>{c.beginPath();c.arc(r.x+32,r.y+34,10,0,Math.PI*2);});c.fillStyle=m.cover;c.beginPath();c.arc(r.x+32,r.y+34,3.5,0,Math.PI*2);c.fill();c.fillStyle=m.ink;c.font='bold 6px sans-serif';c.fillText(m.headline.slice(0,18),r.x+32,r.y+56);});
 sign(c,SIGN_RECT,'ISLAND SQUARE · OPEN 24H');sign(c,CAY_SIGN_RECT,'CORAL CAY · OPEN 24H');
 poster(c,POSTER_RECTS[0],'#2f8f8a','WATER FIRST',['Drink before, during','and after you play'],(x,y)=>drawFood(c,'drink-water',x,y));
 poster(c,POSTER_RECTS[1],'#f07a5f','FUEL UP',['Rice = energy','for training'],(x,y)=>drawFood(c,'musubi-classic',x,y));
 poster(c,POSTER_RECTS[2],'#5b6fb8','MATCH DAY',['Meal 3–4 h before','snack 1–2 h before'],(x,y)=>drawDecor(c,DECOR.ball,x,y));
 poster(c,POSTER_RECTS[3],'#d8a52a','STAMP CARD',['Read every magazine','fill your card!'],(x,y)=>logo(c,x,y,22));
 poster(c,POSTER_RECTS[4],'#3aa0c8','SAND SPRINTS',['Short sprints,','then rest'],(x,y)=>{fill(c,'#f2d59a',()=>c.rect(x-40,y+8,80,14));drawDecor(c,DECOR.beachball,x,y-6);});
 poster(c,POSTER_RECTS[5],'#e0a33a','BEACH SOCCER',['5 a side','barefoot on sand'],(x,y)=>drawDecor(c,DECOR.flipflops,x,y));
 {const r=SURFBOARD_RECT;fill(c,'#fbfaf5',()=>{c.beginPath();c.ellipse(r.x+32,r.y+64,20,60,0,0,Math.PI*2);});fill(c,'#3aa0c8',()=>c.rect(r.x+29,r.y+6,6,116));fill(c,'#f07a5f',()=>c.rect(r.x+13,r.y+60,38,6));}
 return canvas;
}
