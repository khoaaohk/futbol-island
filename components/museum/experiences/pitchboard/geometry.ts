/**
 * The tactics board (Oct 14 2026; shared by first-international-1872, offside-rules and formations-history). Pure geometry, no
 * React: a pitch in model units and its mapping onto the exhibit's card.
 *
 * Model units: x runs along the pitch from YOUR goal line (0) to the OTHER team's goal line (100), y across it (0 to 64). The
 * halfway line is x = 50. On a tall card (a phone) the pitch stands upright and you attack UP the screen; on a wide card it lies
 * down and you attack to the RIGHT. A `view` shows only part of the length (the offside board shows the attacking half).
 */
export type Pt={x:number;y:number};
export const LEN=100,WID=64,HALF=50,MID_Y=32;
/** Real markings scaled to the board (a 105 × 68 m pitch → 100 × 64 units). */
export const MARK={box:15.7,boxW:38.4,six:5.2,sixW:17.4,spot:10,circle:8.7,goalW:7};
export type View={x0:number;x1:number};
export const FULL:View={x0:-3,x1:103};
export type Frame={w:number;h:number;portrait:boolean;s:number;ox:number;oy:number;view:View};
export type Pad={t:number;r:number;b:number;l:number};

/** Fit the view into a w × h card (pad leaves room for the corner captions and overlays). */
export function frameFor(w:number,h:number,view:View=FULL,pad:Pad={t:40,r:18,b:40,l:18}):Frame{
 const portrait=h>w*1.02,len=view.x1-view.x0,across=WID+4;
 const aw=Math.max(10,w-pad.l-pad.r),ah=Math.max(10,h-pad.t-pad.b);
 const s=portrait?Math.min(aw/across,ah/len):Math.min(aw/len,ah/across);
 const pw=(portrait?WID:len)*s,ph=(portrait?len:WID)*s;
 return {w,h,portrait,s,view,ox:pad.l+(aw-pw)/2,oy:pad.t+(ah-ph)/2};
}
/** Model → screen px. */
export function toScreen(f:Frame,p:Pt):[number,number]{
 return f.portrait?[f.ox+p.y*f.s,f.oy+(f.view.x1-p.x)*f.s]:[f.ox+(p.x-f.view.x0)*f.s,f.oy+p.y*f.s];
}
/** Screen px → model (unclamped). */
export function toModel(f:Frame,X:number,Y:number):Pt{
 return f.portrait?{x:f.view.x1-(Y-f.oy)/f.s,y:(X-f.ox)/f.s}:{x:(X-f.ox)/f.s+f.view.x0,y:(Y-f.oy)/f.s};
}
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** Keep a dragged dot on the visible pitch. */
export function clampToView(f:Frame,p:Pt,margin=1):Pt{
 return {x:clamp(p.x,Math.max(0,f.view.x0)+margin,Math.min(LEN,f.view.x1)-margin),y:clamp(p.y,margin,WID-margin)};
}
/** Arrow keys move a focused dot in model units: up/down along the pitch (toward / away from the goal you attack), left/right across. */
export function nudge(p:Pt,key:string,step=2):Pt|null{
 if(key==='ArrowUp')return {x:p.x+step,y:p.y};if(key==='ArrowDown')return {x:p.x-step,y:p.y};
 if(key==='ArrowLeft')return {x:p.x,y:p.y-step};if(key==='ArrowRight')return {x:p.x,y:p.y+step};return null;
}
const r1=(n:number)=>Math.round(n*10)/10;
/** SVG path through model points. */
export function pathOf(f:Frame,pts:Pt[],close=false){return pts.map((p,i)=>{const [X,Y]=toScreen(f,p);return `${i?'L':'M'}${r1(X)} ${r1(Y)}`;}).join('')+(close?'Z':'');}
/** A line straight across the pitch at x (an offside line, a defensive line). */
export const acrossAt=(f:Frame,x:number)=>pathOf(f,[{x,y:0},{x,y:WID}]);
/** The pitch markings in view, as one path, plus the goals. */
export function markings(f:Frame){
 const {box,boxW,six,sixW,circle,goalW,spot}=MARK,c=MID_Y,parts:string[]=[];
 const rect=(x0:number,y0:number,x1:number,y1:number)=>pathOf(f,[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}],true);
 const lo=Math.max(0,f.view.x0),hi=Math.min(LEN,f.view.x1);
 parts.push(pathOf(f,[{x:lo,y:0},{x:hi,y:0}]),pathOf(f,[{x:lo,y:WID},{x:hi,y:WID}]));
 if(f.view.x0<=0)parts.push(pathOf(f,[{x:0,y:0},{x:0,y:WID}]));
 if(f.view.x1>=LEN)parts.push(pathOf(f,[{x:LEN,y:0},{x:LEN,y:WID}]));
 if(lo<=HALF&&hi>=HALF)parts.push(acrossAt(f,HALF));
 const ends:[number,number][]=[];if(f.view.x0<=box)ends.push([0,1]);if(f.view.x1>=LEN-box)ends.push([LEN,-1]);
 for(const [g,d] of ends){parts.push(rect(g,c-boxW/2,g+d*box,c+boxW/2),rect(g,c-sixW/2,g+d*six,c+sixW/2));}
 const goals=ends.map(([g,d])=>rect(g,c-goalW/2,g-d*2.2,c+goalW/2));
 const spots=ends.map(([g,d])=>toScreen(f,{x:g+d*spot,y:c}));
 const centre=lo<=HALF+circle&&hi>=HALF-circle?{at:toScreen(f,{x:HALF,y:c}),r:circle*f.s}:null;
 const [ax,ay]=toScreen(f,{x:lo,y:0}),[bx,by]=toScreen(f,{x:hi,y:WID});
 return {lines:parts.join(''),goals,spots,centre,surface:{x:Math.min(ax,bx),y:Math.min(ay,by),w:Math.abs(bx-ax),h:Math.abs(by-ay)}};
}
/** Shortest distance from p to the segment a→b (model units), and where along it (0..1). */
export function segDist(p:Pt,a:Pt,b:Pt){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);
 return {d:Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y),t};}
export const dist=(a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y);
/** n players spread evenly across the pitch at depth x (spread 0..1 of the width; one player stands in the middle). */
export function line(n:number,x:number,spread:number):Pt[]{
 if(n===1)return [{x,y:MID_Y}];const w=WID*spread;return Array.from({length:n},(_,i)=>({x,y:MID_Y-w/2+w*i/(n-1)}));
}
