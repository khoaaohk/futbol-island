/**
 * Placeholder sponsor art (Nov 12 2026): Futbol Island's own panels in the arcade comic / cut-paper look (the Breakaway house
 * style: ink #231a2e, paper #fff3d6, sun, orange, red, teal), drawn in code, so there are no files to load. Shown on any slot that
 * has no active sponsor (before the migration, or between deals). Each one teaches a little football, like the rest of the island
 * (AGENTS.md): short habits a coach would shout. They are not ads: no "Sponsor" tag, no call to action.
 *
 * DRIP FC (Nov 13 2026, owner): the stadium's built-in naming sponsor (lib/stadium/dripfc.ts). Its wordmark / crest panels are
 * mixed in with the house panels (a third of the boards, one screen card and the gate; the centre circle's
 * placeholder is left empty for the drop painted on the grass, stadiumWorld.ts)
 *
 * adidas (Nov 13 2026, owner): the built-in roof fascia banner, white on black like adidas boards: the three-bar mark beside the
 * wordmark, twice per cell (the cell itself repeats along the roof). Its vector paths are embedded below and filled straight into
 * the atlas (no SVG or picture loaded), at the logo's own proportions. Also carries the "Sponsor" tag., drawn into the same atlas, and they DO carry the small "Sponsor" tag like any sponsor picture. The pictures come in as
 * `house` (decoded by surfaces.ts); without them the club's name is lettered instead. An admin-uploaded sponsor replaces a slot's
 * placeholders exactly as before.
 */
import {INK,PAPER,drawSponsorLabel,type AtlasRect,type CellSource,type Ctx2D} from './atlas';
import type {SponsorSlot} from './slots';
import {CREST_ASPECT,WORDMARK_ASPECT,type DripArtKey} from '../dripfc';

/** Drip FC's decoded pictures (any may be missing: lettering instead). */
export type HouseArt=Partial<Record<DripArtKey,CellSource>>;

const SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const BRUSH='IslandBrush,"Arial Black",system-ui,sans-serif';

/** Board panels: coaching habits, one per panel, in turn. */
export const BOARD_LINES:readonly [string,string][]=[['HEAD UP','LOOK BEFORE YOU GET THE BALL'],['PASS & MOVE','GIVE IT, THEN FIND SPACE'],['TALK!','CALL "MAN ON" FOR A TEAMMATE'],['RESPECT THE REF','PLAY FAIR, SHAKE HANDS']];
/** The board panels in turn: Drip FC on every third, so neighbouring boards never show the same thing. */
export const BOARD_PANELS:readonly (readonly [string,string]|'drip-paper'|'drip-ink')[]=[BOARD_LINES[0],'drip-paper',BOARD_LINES[1],BOARD_LINES[2],'drip-ink',BOARD_LINES[3]];
export const PLACEHOLDER_COUNT:Record<SponsorSlot,number>={board:BOARD_PANELS.length,screen:3,gate:1,fascia:1,flag:1,centre:1};
/** Plaza flags (Nov 13 2026, owner): the poles fly national flags (lib/town/plazaFlags.ts); the banner under each flag is built only
 *  for an uploaded flag sponsor (surfaces.ts), so the flag placeholder is a plain cell that is never shown. */
/** Which placeholders are Drip FC's (tests; the rest are Futbol Island's own). */
export const isDripPlaceholder=(slot:SponsorSlot,index:number)=>slot==='board'?typeof BOARD_PANELS[index%BOARD_PANELS.length]==='string':
 slot==='screen'?index%3===1:slot==='gate'?true:false;

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

/** Fit a picture of `aspect` inside the box centred on cx,cy. */
function fit(c:Ctx2D,img:CellSource,aspect:number,cx:number,cy:number,maxW:number,maxH:number){
 const h=Math.min(maxH,maxW/aspect),w=h*aspect;c.drawImage(img,cx-w/2,cy-h/2,w,h);
}
/** The Drip FC wordmark (light or dark), or the name lettered. */
function wordmark(c:Ctx2D,house:HouseArt|undefined,light:boolean,cx:number,cy:number,maxW:number,maxH:number){
 const img=house?.[light?'wordmarkLight':'wordmarkDark'];
 if(img)fit(c,img,WORDMARK_ASPECT,cx,cy,maxW,maxH);else words(c,'DRIP FC',cx,cy,maxH*.8,maxW,light?PAPER:SUN);
}
/** The crest on an ink disc with a paper ring. */
function crest(c:Ctx2D,house:HouseArt|undefined,cx:number,cy:number,r:number){
 c.fillStyle=INK;c.strokeStyle=PAPER;c.lineWidth=Math.max(1,r*.1);c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();c.stroke();
 if(house?.crest)fit(c,house.crest,CREST_ASPECT,cx,cy,r*1.25,r*1.4);else words(c,'DFC',cx,cy,r*.7,r*1.5,PAPER);
}

/** Draw placeholder `index` for `slot` into the atlas rect (already clipped round for the centre circle). */
export function drawPlaceholder(c:Ctx2D,slot:SponsorSlot,index:number,r:AtlasRect,house?:HouseArt){
 if(isDripPlaceholder(slot,index)){drawDrip(c,slot,index,r,house);return;}
 const {x,y,w,h}=r;c.save();
 const bg=[TEAL,ORANGE,VIOLET,RED][index%4];
 if(slot==='centre'){
  // Left empty since Nov 13 2026: without an uploaded centre sponsor surfaces.ts builds no centre disc, and the circle shows
  // Drip FC's painted drop (stadiumWorld.ts pitchLogo). An uploaded centre sponsor still gets its disc, over the drop.
 }else if(slot==='fascia'){
  drawAdidas(c,r);
 }else if(slot==='board'){
  // Boards: paper ground, a torn colour strip, the habit in brush letters, the small line beside it.
  c.fillStyle=PAPER;c.fillRect(x-4,y-4,w+8,h+8);
  const [big,small]=BOARD_PANELS[index%BOARD_PANELS.length] as readonly [string,string];
  paper(c,x+h*.25,y+h*.14,w*(small?.46:.9),h*.66,bg,index*7+3);
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
  words(c,'FUTBOL ISLAND',x+w/2,y+h*.48,h*.34,w*.8);// (the gate is Drip FC's today: drawDrip)
 }else{// flag: never shown (see PLACEHOLDER_COUNT)
  c.fillStyle=INK;c.fillRect(x-4,y-4,w+8,h+8);
 }
 c.restore();
}

/** Drip FC's panels: wordmark / crest in the same cut-paper frame, plus the "Sponsor" tag. */
function drawDrip(c:Ctx2D,slot:SponsorSlot,index:number,r:AtlasRect,house?:HouseArt){
 const {x,y,w,h}=r;c.save();
 if(slot==='board'){
  const ink=BOARD_PANELS[index%BOARD_PANELS.length]==='drip-ink';
  c.fillStyle=ink?INK:PAPER;c.fillRect(x-4,y-4,w+8,h+8);
  if(ink){crest(c,house,x+h*.75,y+h*.47,h*.36);wordmark(c,house,true,x+w*.46,y+h*.47,w*.5,h*.64);}
  else{paper(c,x+w*.18,y+h*.12,w*.56,h*.7,TEAL,index*7+3);wordmark(c,house,false,x+w*.46,y+h*.47,w*.48,h*.6);}
 }else if(slot==='screen'){
  c.fillStyle=INK;c.fillRect(x-4,y-4,w+8,h+8);dots(c,x,y,w,h,h*.06,TEAL);
  crest(c,house,x+w/2,y+h*.3,h*.19);
  wordmark(c,house,true,x+w/2,y+h*.64,w*.7,h*.28);
 }else if(slot==='gate'){
  c.fillStyle=SUN;c.fillRect(x-4,y-4,w+8,h+8);dots(c,x,y,w,h,h*.09,ORANGE);
  paper(c,x+w*.04,y+h*.16,w*.92,h*.64,RED,5);
  crest(c,house,x+w*.13,y+h*.48,h*.27);
  wordmark(c,house,true,x+w*.45,y+h*.48,w*.42,h*.44);
  words(c,'STADIUM',x+w*.8,y+h*.48,h*.24,w*.2);
 }
 drawSponsorLabel(c,r);
 c.restore();
}

/** adidas's "performance" logo (adidas.svg, 725 × 500, drawn in a translate(-60,-430) group): bars above the wordmark. */
const ADIDAS_D:readonly string[]=['M 533.9435,756.70465 386.43318,500.34377 492.40483,439.4751 l 183.4283,317.22955 -141.88963,0','m 141.03958,720.78673 105.97165,-61.27985 56.07037,97.19777 -141.47831,0 -20.56371,-35.91792','m 349.00724,920.25463 30.16006,0 0,-122.01125 -30.16006,0 0,122.01125 z','m 726.96825,923.13364 c -33.72452,0 -54.01413,-17.4106 -55.11081,-41.95001 l 31.80529,0 c 0,7.67715 4.79819,18.91861 25.36192,19.32994 13.70913,0 20.15239,-8.08849 20.15239,-14.12047 -0.82261,-9.59639 -12.88668,-10.419 -25.7732,-12.47534 -12.88652,-2.0564 -23.85386,-4.38692 -31.80518,-8.49966 -10.14488,-5.20948 -16.99942,-16.45093 -16.99942,-29.33745 0,-21.79767 18.91861,-39.07105 50.44967,-39.07105 30.57139,0 49.90133,16.03964 51.95773,39.8935 l -30.70861,0 c -0.27412,-6.44326 -1.5079,-16.58798 -19.60405,-16.58798 -12.20113,0 -20.28946,2.46752 -20.97501,10.96733 0,12.47519 25.36202,11.65274 45.10314,16.86211 18.9186,4.7983 30.98267,16.58814 30.98267,33.03907 0,30.29727 -24.53941,41.95001 -54.83653,41.95001','m 265.24438,611.93622 105.97165,-61.14278 118.85823,205.91121 -110.90696,0 0,30.16006 -30.16006,0 0,-30.29712 -83.76286,-144.63137','m 267.98623,923.13364 c -35.09542,0 -63.61043,-28.65221 -63.61043,-63.33619 0,-35.09547 28.51501,-62.78785 63.61043,-62.78785 13.29786,0 25.36187,3.56425 35.91793,10.83012 l 0,-51.13507 30.16011,0 0,163.54998 -30.16011,0 0,-8.08833 c -10.55606,6.85459 -22.62007,10.96734 -35.91793,10.96734 z m -34.68414,-63.33619 c 0,18.9185 16.17678,34.68398 35.50665,34.68398 18.91861,0 35.09542,-15.76548 35.09542,-34.68398 0,-18.91866 -16.17681,-35.09547 -35.09542,-35.09547 -19.32987,0 -35.50665,16.17681 -35.50665,35.09547','m 490.89682,756.70465 29.74883,0 0,163.54998 -29.74883,0 0,-8.08833 c -10.14478,6.85459 -22.62007,10.96734 -36.32921,10.96734 -34.68414,0 -63.19913,-28.65221 -63.19913,-63.33619 0,-35.09547 28.51499,-62.78785 63.19913,-62.78785 13.70914,0 25.77315,3.56425 36.32921,10.83012 l 0,-51.13507 z m -70.19079,103.0928 c 0,18.9185 16.17676,34.68398 34.68414,34.68398 19.32989,0 35.50665,-15.76548 35.50665,-34.68398 0,-18.91866 -16.17676,-35.09547 -35.50665,-35.09547 -18.50738,0 -34.68414,16.17681 -34.68414,35.09547','m 593.98956,923.13364 c -34.54703,0 -63.19913,-28.65221 -63.19913,-63.33619 0,-35.09547 28.6521,-62.78785 63.19913,-62.78785 13.29791,0 25.7731,3.56425 35.91798,10.83012 l 0,-9.7334 30.16006,0 0,122.14831 -30.16006,0 0,-8.08833 c -10.14488,6.85459 -22.20879,10.96734 -35.91798,10.96734 z m -33.86158,-63.33619 c 0,18.9185 16.17676,34.68398 35.09537,34.68398 18.91866,0 34.68419,-15.76548 34.68419,-34.68398 0,-18.91866 -15.76553,-35.09547 -34.68419,-35.09547 -18.91861,0 -35.09537,16.17681 -35.09537,35.09547','m 93.468866,859.79745 c 0,18.9185 16.176784,34.68398 35.095404,34.68398 19.32987,0 35.50666,-15.76548 35.50666,-34.68398 0,-18.91866 -16.17679,-35.09547 -35.50666,-35.09547 -18.91862,0 -35.095404,16.17681 -35.095404,35.09547 z m 34.272844,63.33619 c -34.684124,0 -63.336218,-28.65221 -63.336218,-63.33619 0,-35.09547 28.652094,-62.78785 63.336218,-62.78785 13.29787,0 25.77319,3.56425 36.32922,10.83012 l 0,-9.7334 29.74883,0 0,122.14831 -29.74883,0 0,-8.08833 c -10.14475,6.85459 -22.62008,10.96734 -36.32922,10.96734'];
/** Raw path-space bounds [x0,y0,x1,y1]: the bars, and the wordmark (from the bars' foot: the d stems and i dot meet them). */
export const ADIDAS_PARTS={mark:[141,439.5,675.8,756.7],word:[64.4,756.7,781.8,923.1]} as const;
let adidasPaths:Path2D[]|null=null;
/** Fill one part (clipped to its band) with its top-left at x,y and height h, white; returns its width. */
function adidasPart(c:Ctx2D,part:keyof typeof ADIDAS_PARTS,x:number,y:number,h:number){
 const [x0,y0,x1,y1]=ADIDAS_PARTS[part],k=h/(y1-y0),w=(x1-x0)*k;
 adidasPaths??=ADIDAS_D.map(d=>new Path2D(d));
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(x-x0*k,y-y0*k);c.scale(k,k);c.fillStyle=PAPER_WHITE;
 for(const p of adidasPaths)c.fill(p);
 c.restore();return w;
}
const PAPER_WHITE='#ffffff';
/** The fascia banner: black panel, mark + wordmark side by side, two lock-ups spaced along the cell, uniform scale (never squashed). */
function drawAdidas(c:Ctx2D,r:AtlasRect){
 const {x,y,w,h}=r;c.fillStyle='#000000';c.fillRect(x-4,y-4,w+8,h+8);
 const mh=h*.66,[mx0,my0,mx1,my1]=ADIDAS_PARTS.mark,[wx0,wy0,wx1,wy1]=ADIDAS_PARTS.word;
 const mw=mh*(mx1-mx0)/(my1-my0),wh=mh*.52,ww=wh*(wx1-wx0)/(wy1-wy0),gap=mh*.22,unit=mw+gap+ww;
 for(const f of [.25,.75]){const ux=x+w*f-unit/2,top=y+(h-mh)/2;
  if(typeof Path2D==='undefined'){words(c,'adidas',x+w*f,y+h/2,h*.5,w*.4,PAPER_WHITE,'system-ui,-apple-system,sans-serif','800');continue;}
  adidasPart(c,'mark',ux,top,mh);adidasPart(c,'word',ux+mw+gap,top+mh-wh,wh);}
 drawSponsorLabel(c,r);
}
