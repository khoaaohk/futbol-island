import {COURSE,LAND,LAND_LABELS,PORTS,type LonLat} from './data';

/**
 * The sea chart (Canvas 2D, no WebGL): a cream paper chart with a graticule, hand-simplified coastlines, the ports of call and
 * the Conte Verde. `draw(p, phase)` paints one frame for scroll progress p (0..1); the caller owns the loop and only calls it
 * while something moves (the ship easing to the scroll, or waves while sailing). Nothing here runs on its own.
 */
export type Chart={draw:(p:number,phase:number)=>void;resize:()=>void;dispose:()=>void};

const INK='#1f2a44',PAPER='#d5e1dc',LANDC='#f1e6c8',SEA_LINE='#1f2a4422',ROUTE='#b8322a';
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

export function createChart(canvas:HTMLCanvasElement,opts:{coarse:boolean}):Chart{
 const g=canvas.getContext('2d',{alpha:false})!;let w=1,h=1,dpr=1;
 // A paper grain tile, made once.
 const grain=document.createElement('canvas');grain.width=grain.height=96;{const q=grain.getContext('2d')!;const img=q.createImageData(96,96);let s=1930;
  for(let i=0;i<img.data.length;i+=4){s=(Math.imul(s,1664525)+1013904223)>>>0;const v=s>>>24;img.data[i]=31;img.data[i+1]=42;img.data[i+2]=68;img.data[i+3]=v>238?22:v>200?8:0;}q.putImageData(img,0,0);}
 let pattern:CanvasPattern|null=g.createPattern(grain,'repeat');
 // Wave marks: fixed spots on the sea (a sparse lattice, jittered), drawn only when on screen.
 const waves:LonLat[]=[];{let s=7;for(let lon=-80;lon<=20;lon+=5)for(let lat=-50;lat<=50;lat+=4.5){s=(Math.imul(s,1664525)+1013904223)>>>0;const jx=(s>>>8&255)/255*4-2,jy=(s>>>16&255)/255*3-1.5;
  const p:LonLat=[lon+jx+(lat%9?2.5:0),lat+jy];if(!onLand(p))waves.push(p);}}
 const resize=()=>{dpr=Math.min(window.devicePixelRatio||1,opts.coarse?1.5:2);w=Math.max(1,canvas.clientWidth);h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);};
 resize();

 const draw=(p:number,phase:number)=>{
  g.setTransform(dpr,0,0,dpr,0,0);
  const {at,heading}=shipAt(p),span=spanAt(p),px=Math.min(w,h)/span;// pixels per degree
  // Keep the ship a little below centre on tall screens (cards sit at the bottom on phones).
  const cx=w>=700?w*.6:w/2,cy=h*(w<700?.36:.5),mercY=(lat:number)=>lat*(1+Math.abs(lat)/400);// a gentle hint of a chart projection
  const X=(lon:number)=>cx+(lon-at[0])*px,Y=(lat:number)=>cy-(mercY(lat)-mercY(at[1]))*px;
  g.fillStyle=PAPER;g.fillRect(0,0,w,h);
  // Graticule every 10°, with the Equator and the Tropics marked.
  g.lineWidth=1;g.strokeStyle=SEA_LINE;g.beginPath();
  for(let lon=-120;lon<=60;lon+=10){const x=X(lon);if(x>-2&&x<w+2){g.moveTo(x,0);g.lineTo(x,h);}}
  for(let lat=-70;lat<=70;lat+=10){const y=Y(lat);if(y>-2&&y<h+2){g.moveTo(0,y);g.lineTo(w,y);}}
  g.stroke();
  const eq=Y(0);if(eq>-10&&eq<h+10){g.strokeStyle='#1f2a4466';g.setLineDash([8,6]);g.beginPath();g.moveTo(0,eq);g.lineTo(w,eq);g.stroke();g.setLineDash([]);
   g.fillStyle='#1f2a4499';g.font='italic 600 12px Georgia, "Times New Roman", serif';g.fillText('Equator',X(-25),eq-6);}
  for(const t of [23.44,-23.44]){const y=Y(t);if(y>-10&&y<h+10){g.strokeStyle='#1f2a4426';g.setLineDash([2,5]);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();g.setLineDash([]);}}
  // Waves: little tilde marks drifting with the phase (they only move while the caller animates).
  g.strokeStyle='#1f2a4440';g.lineWidth=1.2;g.beginPath();const ws=Math.max(5,Math.min(10,px*.9));
  for(const [lon,lat] of waves){const x=X(lon)+Math.sin(phase+lat)*2,y=Y(lat);if(x<-20||x>w+20||y<-20||y>h+20)continue;const b=Math.sin(phase*1.3+lon)*1.2;
   g.moveTo(x-ws,y+b);g.quadraticCurveTo(x-ws/2,y-3+b,x,y+b);g.quadraticCurveTo(x+ws/2,y+3+b,x+ws,y+b);}
  g.stroke();
  // Land: a fill, a coast line, then a second faint line offshore (an old chart's water line).
  for(const poly of LAND){g.beginPath();poly.forEach(([lon,lat],i)=>i?g.lineTo(X(lon),Y(lat)):g.moveTo(X(lon),Y(lat)));g.closePath();
   g.fillStyle=LANDC;g.fill();g.strokeStyle='#1f2a4424';g.lineWidth=6;g.stroke();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();}
  if(pattern){g.fillStyle=pattern;g.fillRect(0,0,w,h);}
  g.textAlign='center';
  for(const l of LAND_LABELS){const x=X(l.at[0]),y=Y(l.at[1]);if(x<-200||x>w+200||y<-40||y>h+40)continue;const fs=Math.round(Math.max(10,Math.min(22,px*.9))*l.size);
   g.font=`${l.size<.9?'italic 500':'600'} ${fs}px Georgia, "Times New Roman", serif`;g.fillStyle='#1f2a4488';
   if(l.size>=.9){(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing=`${Math.round(fs*.35)}px`;}g.fillText(l.t,x,y);(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing='0px';}
  // The course: dashed ahead, solid red behind the ship.
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle='#1f2a4455';g.lineWidth=1.5;g.setLineDash([3,6]);g.beginPath();COURSE.forEach((c,i)=>i?g.lineTo(X(c.at[0]),Y(c.at[1])):g.moveTo(X(c.at[0]),Y(c.at[1])));g.stroke();g.setLineDash([]);
  g.strokeStyle=ROUTE;g.lineWidth=3;g.beginPath();g.moveTo(X(COURSE[0].at[0]),Y(COURSE[0].at[1]));for(const c of COURSE){if(c.p>=p)break;g.lineTo(X(c.at[0]),Y(c.at[1]));}g.lineTo(X(at[0]),Y(at[1]));g.stroke();
  // Ports.
  g.textAlign='left';
  for(const port of PORTS){const x=X(port.at[0]),y=Y(port.at[1]);if(x<-80||x>w+80||y<-40||y>h+40)continue;const reached=p>=port.p-.005;
   g.beginPath();g.arc(x,y,reached?6:5,0,Math.PI*2);g.fillStyle=reached?ROUTE:PAPER;g.fill();g.lineWidth=2;g.strokeStyle=INK;g.stroke();
   g.font='700 13px Georgia, "Times New Roman", serif';g.fillStyle=INK;const name=port.name.split(',')[0];
   // Labels sit clear of the ship: Genoa above its dot (the ship starts there), Villefranche below-right, the rest to the left.
   const lx=port.id==='genoa'?0:port.id==='villefranche'?10:-10,ly=port.id==='genoa'?-26:port.id==='villefranche'?16:-12;
   g.textAlign=port.id==='genoa'?'center':port.id==='villefranche'?'left':'right';
   g.lineWidth=4;g.strokeStyle=LANDC;g.lineJoin='round';g.strokeText(name,x+lx,y+ly);g.fillText(name,x+lx,y+ly);}
  g.textAlign='left';
  // The ship (seen from above): a wake, the hull, a deck and two funnels.
  const sx=X(at[0]),sy=Y(at[1]),L=Math.max(30,Math.min(46,Math.min(w,h)*.08));
  g.save();g.translate(sx,sy);g.rotate(heading);
  g.strokeStyle='#ffffffcc';g.lineWidth=2;g.beginPath();for(const s of [-1,1]){g.moveTo(-L*.45,s*L*.08);g.quadraticCurveTo(-L*1.2,s*L*.2,-L*2.1,s*L*(.42+Math.sin(phase*2)*.03));}g.stroke();
  g.fillStyle='#1f2a4433';hull(g,L,2,3);g.fill();
  g.fillStyle='#262b33';hull(g,L,0,0);g.fill();
  g.fillStyle='#f4efe3';g.beginPath();g.roundRect(-L*.36,-L*.1,L*.66,L*.2,L*.06);g.fill();
  g.fillStyle='#d9a441';for(const fx of [-.12,.1]){g.beginPath();g.arc(fx*L,0,L*.065,0,Math.PI*2);g.fill();g.strokeStyle='#262b33';g.lineWidth=1.2;g.stroke();}
  g.restore();
  // Compass rose, top-right, quietly.
  const rx=w-46,ry=h-(w<700?260:70);if(ry>80){g.save();g.translate(rx,ry);g.strokeStyle='#1f2a4466';g.fillStyle='#1f2a4466';g.lineWidth=1;g.beginPath();g.arc(0,0,22,0,Math.PI*2);g.stroke();
   g.beginPath();g.moveTo(0,-30);g.lineTo(5,0);g.lineTo(0,30);g.lineTo(-5,0);g.closePath();g.fill();g.font='700 10px Georgia, serif';g.textAlign='center';g.fillText('N',0,-34);g.restore();}
 };
 return {draw,resize,dispose:()=>{pattern=null;grain.width=grain.height=0;canvas.width=canvas.height=0;}};
}
function hull(g:CanvasRenderingContext2D,L:number,dx:number,dy:number){g.beginPath();g.moveTo(L*.55+dx,dy);g.quadraticCurveTo(L*.3+dx,-L*.17+dy,-L*.05+dx,-L*.16+dy);g.lineTo(-L*.45+dx,-L*.15+dy);
 g.quadraticCurveTo(-L*.55+dx,dy,-L*.45+dx,L*.15+dy);g.lineTo(-L*.05+dx,L*.16+dy);g.quadraticCurveTo(L*.3+dx,L*.17+dy,L*.55+dx,dy);g.closePath();}
/** Point-in-polygon against the coastlines (only used once, to keep wave marks off the land). */
function onLand([x,y]:LonLat){for(const poly of LAND){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];
 if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}if(inside)return true;}return false;}
