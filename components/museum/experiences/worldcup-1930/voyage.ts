import {COURSE,LAND,LAND_LABELS,PORTS,type LonLat} from './data';

/**
 * The route map (Canvas 2D, no WebGL), drawn as an abstract gallery map (Oct 10 2026 modern pass, docs/museum-modern-style.md):
 * a gallery-white ground, the continents as a field of small ink dots (a dot wherever there is land), a few hairline meridians,
 * the Equator as a dashed hairline, the course as one line (muted ahead, the exhibit's blue behind the ship), ports as rings that
 * fill blue once reached, and the ship as a blue disc trailing a short line. Swiss labels in the app's sans.
 * `draw(p, phase)` paints one frame for scroll progress p (0..1); the caller owns the loop and only calls it while the ship eases
 * to the scroll. Nothing here runs on its own and nothing moves at rest (`phase` is accepted for the caller's contract only).
 */
export type Chart={draw:(p:number,phase:number)=>void;resize:()=>void;dispose:()=>void};

const GROUND='#f6f4ef',INK='#1d1d1b',MUTED='#6b6a66',HAIR='#d9d6cf',BLUE='#2a5bd7';
const SANS='"Helvetica Neue",Helvetica,Arial,sans-serif';
const NAMES:Record<string,string>={EUROPE:'Europe',AFRICA:'Africa','SOUTH AMERICA':'South America','ATLANTIC OCEAN':'Atlantic Ocean'};
const smooth=(a:number,b:number,t:number)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k);};

/** Where the ship is at scroll p: along the course keyframes, eased between them. */
export function shipAt(p:number):{at:LonLat;heading:number}{
 const c=COURSE;if(p<=c[0].p)return {at:c[0].at,heading:hd(c[0].at,c[1].at)};
 for(let i=1;i<c.length;i++){if(p<=c[i].p){const a=c[i-1],b=c[i],t=(p-a.p)/(b.p-a.p);return {at:[a.at[0]+(b.at[0]-a.at[0])*t,a.at[1]+(b.at[1]-a.at[1])*t],heading:hd(a.at,b.at)};}}
 const n=c.length;return {at:c[n-1].at,heading:hd(c[n-2].at,c[n-1].at)};
}
function hd(a:LonLat,b:LonLat){return Math.atan2(-(b[1]-a[1]),b[0]-a[0]);}
/** How much of the map fits across the short side of the screen (degrees): close in the Mediterranean, wide over the ocean. */
export function spanAt(p:number){return 16+44*smooth(.2,.36,p)-30*smooth(.8,.95,p);}

/** The land as a dot field: one dot per STEP degrees wherever the point falls on a coastline polygon (computed once). */
const STEP=1.25;
let DOTS:LonLat[]|null=null;
function landDots(){if(DOTS)return DOTS;const out:LonLat[]=[];
 for(let lat=-58;lat<=62;lat+=STEP)for(let lon=-100;lon<=46;lon+=STEP){const p:LonLat=[lon+((Math.round(lat/STEP)%2)?STEP/2:0),lat];if(onLand(p))out.push(p);}
 return DOTS=out;}

export function createChart(canvas:HTMLCanvasElement,opts:{coarse:boolean}):Chart{
 const g=canvas.getContext('2d',{alpha:false})!;let w=1,h=1,dpr=1;
 const dots=landDots();
 const resize=()=>{dpr=Math.min(window.devicePixelRatio||1,opts.coarse?1.5:2);w=Math.max(1,canvas.clientWidth);h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);};
 resize();

 const draw=(p:number,_phase:number)=>{
  g.setTransform(dpr,0,0,dpr,0,0);
  const {at}=shipAt(p),span=spanAt(p),px=Math.min(w,h)/span;// pixels per degree
  // Keep the ship a little above centre on phones (the story cards sit at the bottom there).
  const cx=w>=700?w*.6:w/2,cy=h*(w<700?.36:.5),mercY=(lat:number)=>lat*(1+Math.abs(lat)/400);
  const X=(lon:number)=>cx+(lon-at[0])*px,Y=(lat:number)=>cy-(mercY(lat)-mercY(at[1]))*px;
  g.fillStyle=GROUND;g.fillRect(0,0,w,h);
  // Hairline meridians every 20° (quiet structure, not a chart grid).
  g.lineWidth=1;g.strokeStyle=HAIR;g.beginPath();
  for(let lon=-120;lon<=60;lon+=20){const x=Math.round(X(lon))+.5;if(x>-2&&x<w+2){g.moveTo(x,0);g.lineTo(x,h);}}
  g.stroke();
  // The Equator: a dashed hairline with a small label.
  const eq=Y(0);if(eq>-10&&eq<h+10){g.strokeStyle=MUTED;g.setLineDash([4,6]);g.beginPath();g.moveTo(0,Math.round(eq)+.5);g.lineTo(w,Math.round(eq)+.5);g.stroke();g.setLineDash([]);
   g.fillStyle=MUTED;g.font=`500 12px ${SANS}`;g.textAlign='left';g.fillText('Equator · 0°',16,eq-8);}
  // Land: a field of dots (one path, culled to the screen).
  const r=Math.max(1.1,Math.min(3.2,px*STEP*.2));g.fillStyle=INK;g.globalAlpha=.78;g.beginPath();
  for(const [lon,lat] of dots){const x=X(lon),y=Y(lat);if(x<-4||x>w+4||y<-4||y>h+4)continue;g.moveTo(x+r,y);g.arc(x,y,r,0,Math.PI*2);}
  g.fill();g.globalAlpha=1;
  // Continent and sea names: small muted sans, never shouted.
  g.textAlign='center';
  for(const l of LAND_LABELS){const x=X(l.at[0]),y=Y(l.at[1]);if(x<-200||x>w+200||y<-40||y>h+40)continue;
   const sea=/Ocean|OCEAN|Sea|Strait/.test(l.t),txt=NAMES[l.t]??l.t;
   g.font=`${sea?'400':'600'} ${l.size<.9?12:14}px ${SANS}`;
   const tw=g.measureText(txt).width;g.fillStyle=GROUND;g.globalAlpha=.85;g.fillRect(x-tw/2-4,y-12,tw+8,17);g.globalAlpha=1;
   g.fillStyle=sea?MUTED:INK;g.fillText(txt,x,y);}
  // The course: a thin muted line for the whole voyage, then the blue line drawn behind the ship.
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle=MUTED;g.globalAlpha=.55;g.lineWidth=1.25;g.setLineDash([1,5]);g.beginPath();COURSE.forEach((c,i)=>i?g.lineTo(X(c.at[0]),Y(c.at[1])):g.moveTo(X(c.at[0]),Y(c.at[1])));g.stroke();g.setLineDash([]);g.globalAlpha=1;
  g.strokeStyle=BLUE;g.lineWidth=2.5;g.beginPath();g.moveTo(X(COURSE[0].at[0]),Y(COURSE[0].at[1]));for(const c of COURSE){if(c.p>=p)break;g.lineTo(X(c.at[0]),Y(c.at[1]));}g.lineTo(X(at[0]),Y(at[1]));g.stroke();
  // Ports: rings that fill blue once the ship has reached them.
  for(const port of PORTS){const x=X(port.at[0]),y=Y(port.at[1]);if(x<-80||x>w+80||y<-40||y>h+40)continue;const reached=p>=port.p-.005;
   g.beginPath();g.arc(x,y,6,0,Math.PI*2);g.fillStyle=reached?BLUE:GROUND;g.fill();g.lineWidth=1.5;g.strokeStyle=reached?BLUE:INK;g.stroke();
   const name=port.name.split(',')[0];g.font=`600 13px ${SANS}`;
   const lx=port.id==='genoa'?0:port.id==='villefranche'?12:-12,ly=port.id==='genoa'?-16:port.id==='villefranche'?18:-10;
   g.textAlign=port.id==='genoa'?'center':port.id==='villefranche'?'left':'right';
   g.lineWidth=4;g.strokeStyle=GROUND;g.strokeText(name,x+lx,y+ly);g.fillStyle=INK;g.fillText(name,x+lx,y+ly);}
  g.textAlign='left';
  // The ship: a blue disc with a white core, on top of everything.
  const sx=X(at[0]),sy=Y(at[1]),R=Math.max(7,Math.min(10,Math.min(w,h)*.022));
  g.beginPath();g.arc(sx,sy,R+5,0,Math.PI*2);g.strokeStyle=BLUE;g.globalAlpha=.25;g.lineWidth=1;g.stroke();g.globalAlpha=1;
  g.beginPath();g.arc(sx,sy,R,0,Math.PI*2);g.fillStyle=BLUE;g.fill();
  g.beginPath();g.arc(sx,sy,R*.32,0,Math.PI*2);g.fillStyle=GROUND;g.fill();
 };
 return {draw,resize,dispose:()=>{canvas.width=canvas.height=0;}};
}
/** Point-in-polygon against the coastlines (used once, to build the land dot field). */
function onLand([x,y]:LonLat){for(const poly of LAND){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];
 if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}if(inside)return true;}return false;}
