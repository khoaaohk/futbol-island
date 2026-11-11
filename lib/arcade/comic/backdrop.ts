import * as T from 'three';
import {COMIC_INK} from './shading';

/** A printed golden-hour coast for games whose camera does not travel (boards, tables, courts): sky bands with a halftone turn, the
 * sun cut as stacked discs, cut clouds, two headland silhouettes, a lighthouse and a banded sea with a glitter path under the sun.
 * Painted once into one small canvas; put it on an unlit strip behind the play area (1 draw, 1 texture, no per-frame work).
 * Breakaway's own sky (runnerTrack.ts) stays a shader: it has to turn with the route, change weather and animate, which a static
 * game does not need. Palette defaults are Breakaway's classic sky, so the two read as the same evening. */
export type ComicCoastPalette={top:string;mid:string;haze:string;sunCore:string;sunRing:string;sunRing2:string;cloudLit:string;cloudShade:string;headA:string;headB:string;seaFar:string;seaNear:string;glitter:string;ink:string};
export const COMIC_COAST:ComicCoastPalette={top:'#e9825c',mid:'#f6a968',haze:'#ffcf7a',sunCore:'#fff1b0',sunRing:'#ffc24a',sunRing2:'#ff8a3c',cloudLit:'#ffe1b0',cloudShade:'#d9707a',headA:'#7a4a78',headB:'#c9788a',seaFar:'#2b6fa3',seaNear:'#1f8f96',glitter:'#fff1b0',ink:COMIC_INK};
export type ComicCoastOptions={width?:number;height?:number;/** 0..1 across the strip. */sunX?:number;/** 0..1 down the strip: where the sea meets the sky. */horizon?:number;palette?:Partial<ComicCoastPalette>;seed?:number};
const rand=(seed:number)=>{let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>{s=s*16807%2147483647;return(s-1)/2147483646;};};
export function paintComicCoast(g:CanvasRenderingContext2D,W:number,H:number,o:ComicCoastOptions={}){
 const p={...COMIC_COAST,...o.palette},hz=H*(o.horizon??.62),sx=W*(o.sunX??.3),rnd=rand(o.seed??7),u=H/256;
 // Sky: three flat bands; each turn is a dot screen (dots of the lower band growing into the upper one), never a gradient.
 const bands=[p.top,p.mid,p.haze],edge=[hz*.34,hz*.68];g.fillStyle=bands[0];g.fillRect(0,0,W,hz);
 for(let b=1;b<3;b++){const y0=edge[b-1];g.fillStyle=bands[b];g.fillRect(0,y0,W,hz-y0);const cell=7*u;for(let row=0;row<5;row++){const r=cell*.5*(1-row/5)*.95,y=y0-row*cell*.5-cell*.25;for(let x=(row%2)*cell*.5;x<W;x+=cell){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}}}
 // Sun: stacked discs, the lower part sliced into bars like a travel poster.
 const R=hz*.36,sy=hz-R*.42;g.fillStyle=p.sunRing2;g.beginPath();g.arc(sx,sy,R*1.5,0,Math.PI*2);g.globalAlpha=.35;g.fill();g.globalAlpha=1;
 g.fillStyle=p.sunRing;g.beginPath();g.arc(sx,sy,R*1.2,0,Math.PI*2);g.fill();g.fillStyle=p.sunCore;g.beginPath();g.arc(sx,sy,R,0,Math.PI*2);g.fill();
 g.fillStyle=p.sunRing;for(let i=0;i<4;i++){const y=sy+R*(.22+i*.2),h=R*(.035+i*.022);g.fillRect(sx-R*1.05,y,R*2.1,h);}
 // Cut clouds: a flat lit lozenge with a shaded underside.
 const cloud=(cx:number,cy:number,w:number)=>{g.fillStyle=p.cloudShade;g.beginPath();g.ellipse(cx,cy+w*.035,w*.5,w*.07,0,0,Math.PI*2);g.fill();g.fillStyle=p.cloudLit;g.beginPath();g.ellipse(cx-w*.03,cy,w*.46,w*.06,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(cx+w*.1,cy-w*.045,w*.22,w*.05,0,0,Math.PI*2);g.fill();};
 cloud(sx+W*.2,hz*.3,W*.22);cloud(sx-W*.21,hz*.5,W*.16);cloud(W*.9,hz*.16,W*.18);
 // Headlands: far (pale) then near (dark), with whitewashed houses and a striped lighthouse on the near one.
 const head=(x0:number,x1:number,h:number,fill:string,bumps:number)=>{g.fillStyle=fill;g.beginPath();g.moveTo(x0,hz);for(let i=0;i<=bumps;i++){const t=i/bumps,x=x0+(x1-x0)*t,y=hz-h*Math.sin(Math.PI*Math.min(1,t*1.15))*(.72+.28*rnd());g.lineTo(x,y);}g.lineTo(x1,hz);g.closePath();g.fill();};
 head(W*.42,W*1.02,hz*.2,p.headB,9);head(-W*.02,W*.36,hz*.16,p.headA,7);
 g.fillStyle='#fff0dc';for(let i=0;i<7;i++){const x=W*(.03+rnd()*.26),y=hz-hz*.035-rnd()*hz*.05;g.fillRect(x,y,5*u,3.4*u);}
 {const lx=W*.2,lh=hz*.2,lw=4.2*u;g.fillStyle='#fff0dc';g.fillRect(lx-lw/2,hz-hz*.1-lh,lw,lh);g.fillStyle=p.sunRing2;for(let i=0;i<3;i++)g.fillRect(lx-lw/2,hz-hz*.1-lh*(.2+i*.3),lw,lh*.12);g.fillStyle=p.ink;g.fillRect(lx-lw*.8,hz-hz*.1-lh-2*u,lw*1.6,2.4*u);}
 // Sea: far and near bands, a dotted turn, foam dashes, and the glitter path pointing at the sun.
 g.fillStyle=p.seaFar;g.fillRect(0,hz,W,H-hz);g.fillStyle=p.seaNear;g.fillRect(0,hz+(H-hz)*.3,W,H-hz);
 {const cell=6*u,y0=hz+(H-hz)*.3;g.fillStyle=p.seaNear;for(let row=0;row<3;row++){const r=cell*.42*(1-row/3);for(let x=(row%2)*cell*.5;x<W;x+=cell){g.beginPath();g.arc(x,y0-row*cell*.5-cell*.2,r,0,Math.PI*2);g.fill();}}}
 g.fillStyle=p.glitter;for(let i=0;i<70;i++){const t=rnd(),y=hz+2*u+t*(H-hz-4*u),spread=R*(.25+t*1.3),x=sx+(rnd()-.5)*2*spread,w=(4+rnd()*12)*u*(.5+t);g.fillRect(x-w/2,y,w,Math.max(1,1.6*u*(.6+t)));}
 g.fillStyle='#ffffff';g.globalAlpha=.55;for(let i=0;i<40;i++){const y=hz+rnd()*(H-hz),x=rnd()*W,w=(5+rnd()*14)*u;g.fillRect(x,y,w,Math.max(1,1.2*u));}g.globalAlpha=1;
 g.fillStyle=p.ink;g.fillRect(0,hz-Math.max(1,.8*u),W,Math.max(1,1.2*u));
}
/** paintComicCoast into a new canvas texture (default 512x256). Dispose it with the scene (stage.dispose() walks scene materials). */
export function comicCoastTexture(o:ComicCoastOptions={}){const c=document.createElement('canvas');c.width=o.width??512;c.height=o.height??256;paintComicCoast(c.getContext('2d')!,c.width,c.height,o);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
