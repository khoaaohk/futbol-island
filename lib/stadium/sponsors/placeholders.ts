/**
 * Placeholder sponsor art (Nov 12 2026): Futbol Island's own panels in the arcade comic / cut-paper look (the Breakaway house
 * style: ink #231a2e, paper #fff3d6, sun, orange, red, teal), drawn in code, so there are no files to load. Shown on any slot that
 * has no active sponsor (before the migration, or between deals). Each one teaches a little football, like the rest of the island
 * (AGENTS.md): short habits a coach would shout. They are not ads: no "Sponsor" tag, no call to action.
 */
import {INK,PAPER,type AtlasRect,type Ctx2D} from './atlas';
import type {SponsorSlot} from './slots';

const SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8',GRASS='#5fae5a';
const BRUSH='IslandBrush,"Arial Black",system-ui,sans-serif';

/** Board panels: coaching habits, one per panel, in turn. */
export const BOARD_LINES:readonly [string,string][]=[['HEAD UP','LOOK BEFORE YOU GET THE BALL'],['PASS & MOVE','GIVE IT, THEN FIND SPACE'],['TALK!','CALL "MAN ON" FOR A TEAMMATE'],['RESPECT THE REF','PLAY FAIR, SHAKE HANDS']];
export const PLACEHOLDER_COUNT:Record<SponsorSlot,number>={board:BOARD_LINES.length,screen:2,gate:1,fascia:2,flag:3,centre:1};

/** A deterministic wobble, so the torn edges look the same every load (and in the tests). */
function rand(seed:number){let s=(seed*2654435761)>>>0||1;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};}
/** A cut-paper strip: a slightly torn rectangle with a hard ink drop shadow. */
function paper(c:Ctx2D,x:number,y:number,w:number,h:number,fill:string,seed:number,shadow=Math.max(2,h*.08)){
 const r=rand(seed),j=Math.max(1,h*.05),pts:[number,number][]=[];
 const n=Math.max(4,Math.round(w/(h*.5)));
 for(let i=0;i<=n;i++)pts.push([x+w*i/n,y+(r()-.5)*j]);
 for(let i=0;i<=3;i++)pts.push([x+w+(r()-.5)*j,y+h*i/3]);
 for(let i=n;i>=0;i--)pts.push([x+w*i/n,y+h+(r()-.5)*j]);
 for(let i=3;i>=0;i--)pts.push([x+(r()-.5)*j,y+h*i/3]);
 const trace=(dx:number,dy:number)=>{c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px+dx,py+dy):c.moveTo(px+dx,py+dy));c.closePath();};
 c.fillStyle=INK;trace(shadow,shadow);c.fill();
 c.fillStyle=fill;trace(0,0);c.fill();
 c.strokeStyle=INK;c.lineWidth=Math.max(1,h*.035);c.lineJoin='round';c.stroke();
}
/** Brush lettering with an ink outline, shrunk to fit `maxW`. */
function words(c:Ctx2D,text:string,x:number,y:number,size:number,maxW:number,fill=PAPER,font=BRUSH,weight='400'){
 let s=size;c.font=`${weight} ${s}px ${font}`;
 const w=c.measureText(text).width;if(w>maxW){s=Math.max(6,s*maxW/w);c.font=`${weight} ${s}px ${font}`;}
 c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.strokeStyle=INK;c.lineWidth=Math.max(1.5,s*.16);c.strokeText(text,x,y);c.fillStyle=fill;c.fillText(text,x,y);
}
/** A comic halftone patch (paper print feel). */
function dots(c:Ctx2D,x:number,y:number,w:number,h:number,step:number,color:string){
 c.save();c.globalAlpha=.22;c.fillStyle=color;
 for(let yy=y+step/2;yy<y+h;yy+=step)for(let xx=x+step/2+((yy/step|0)%2)*step/2;xx<x+w;xx+=step){c.beginPath();c.arc(xx,yy,step*.22,0,Math.PI*2);c.fill();}
 c.restore();
}
/** A simple football: a white disc with the comic pentagon patch. */
function ball(c:Ctx2D,cx:number,cy:number,r:number){
 c.fillStyle=PAPER;c.strokeStyle=INK;c.lineWidth=Math.max(1,r*.12);c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle=INK;c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;const px=cx+Math.cos(a)*r*.38,py=cy+Math.sin(a)*r*.38;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();
 for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(cx+Math.cos(a)*r*.38,cy+Math.sin(a)*r*.38);c.lineTo(cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*.95);c.stroke();}
}

/** Draw placeholder `index` for `slot` into the atlas rect (already clipped round for the centre circle). */
export function drawPlaceholder(c:Ctx2D,slot:SponsorSlot,index:number,r:AtlasRect){
 const {x,y,w,h}=r;c.save();
 const bg=[TEAL,ORANGE,VIOLET,RED][index%4];
 if(slot==='centre'){
  c.fillStyle=GRASS;c.fillRect(x,y,w,h);
  const cx=x+w/2,cy=y+h/2;c.fillStyle=SUN;c.strokeStyle=INK;c.lineWidth=w*.03;c.beginPath();c.arc(cx,cy,w*.46,0,Math.PI*2);c.fill();c.stroke();
  dots(c,x,y,w,h,w*.05,ORANGE);ball(c,cx,cy-h*.06,w*.2);
  words(c,'FUTBOL ISLAND',cx,cy+h*.26,h*.11,w*.7);
 }else if(slot==='board'||slot==='fascia'){
  // Boards and fascia: paper ground, a torn colour strip, the habit in brush letters, the small line beside it.
  c.fillStyle=slot==='fascia'?INK:PAPER;c.fillRect(x-4,y-4,w+8,h+8);
  const [big,small]=slot==='board'?BOARD_LINES[index%BOARD_LINES.length]:index%2?['LEARN THE GAME','']:['FUTBOL ISLAND',''];
  paper(c,x+h*.25,y+h*.14,w*(small?.46:.9),h*.66,slot==='fascia'?[SUN,TEAL][index%2]:bg,index*7+3);
  words(c,big,x+h*.25+w*(small?.23:.45),y+h*.47,h*.46,w*(small?.42:.84));
  if(small){c.font=`800 ${Math.round(h*.24)}px system-ui,-apple-system,sans-serif`;c.textAlign='left';c.textBaseline='middle';c.fillStyle=INK;
   let s=h*.24;const max=w*.46;const mw=c.measureText(small).width;if(mw>max){s*=max/mw;c.font=`800 ${s}px system-ui,-apple-system,sans-serif`;}
   c.fillText(small,x+w*.52,y+h*.5);}
 }else if(slot==='screen'){
  c.fillStyle=index?VIOLET:TEAL;c.fillRect(x-4,y-4,w+8,h+8);dots(c,x,y,w,h,h*.06,INK);
  paper(c,x+w*.1,y+h*.2,w*.8,h*.36,SUN,11+index);
  words(c,index?'MATCH DAY':'FUTBOL ISLAND',x+w/2,y+h*.38,h*.2,w*.72);
  words(c,index?'Keep your shape, help your team':'Every touch teaches the game',x+w/2,y+h*.75,h*.085,w*.84,PAPER,'system-ui,-apple-system,sans-serif','800');
  ball(c,x+w*.9,y+h*.15,h*.08);
 }else if(slot==='gate'){
  c.fillStyle=SUN;c.fillRect(x-4,y-4,w+8,h+8);dots(c,x,y,w,h,h*.09,ORANGE);
  paper(c,x+w*.06,y+h*.18,w*.88,h*.6,RED,5);
  words(c,'FUTBOL ISLAND STADIUM',x+w/2,y+h*.48,h*.34,w*.8);
 }else{// flag
  c.fillStyle=[RED,TEAL,SUN][index%3];c.fillRect(x-4,y-4,w+8,h+8);
  dots(c,x,y,w,h,w*.12,INK);
  paper(c,x+w*.12,y+h*.62,w*.76,h*.22,PAPER,9+index,w*.03);
  ball(c,x+w/2,y+h*.36,w*.26);
  words(c,['GOAL!','TEAM','FAIR'][index%3],x+w/2,y+h*.73,h*.13,w*.66,[SUN,RED,TEAL][index%3]);
 }
 c.restore();
}
