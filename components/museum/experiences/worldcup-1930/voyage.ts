import {COURSE,LAND,LAND_LABELS,PORTS,type LonLat} from './data';

/**
 * The route map (Canvas 2D, no WebGL), drawn like a 1930s Art Deco shipping-line map (Oct 9 2026 styles pass): an airbrushed
 * navy-to-teal sea with gold graticule, flat cream continents lifted on a coral offset shadow, deco lettering, a gold route
 * and the liner. The paper speckle comes from the experience's static overlay, so nothing here is per-pixel noise. `draw(p, phase)` paints one frame for scroll progress p (0..1); the caller owns the loop and only calls it
 * while something moves (the ship easing to the scroll, or waves while sailing). Nothing here runs on its own.
 */
export type Chart={draw:(p:number,phase:number)=>void;resize:()=>void;dispose:()=>void};

const INK='#13203a',LANDC='#f4e7c9',SEA_LINE='#f3b4431f',ROUTE='#f3b443',CORAL='#e0573a',CREAM='#f4e7c9';
const DECO='"WC30 Deco","Limelight",Georgia,serif',CAPS='"WC30 Sans","Josefin Sans","Futura",Arial,sans-serif';
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
  const sea=g.createLinearGradient(0,0,0,h);sea.addColorStop(0,'#13203a');sea.addColorStop(.55,'#1f5566');sea.addColorStop(1,'#163a52');g.fillStyle=sea;g.fillRect(0,0,w,h);
  // Airbrushed glow around the ship (where the light is), cheap: one radial gradient.
  {const gx=cx,gy=cy,r=Math.max(w,h)*.55,glow=g.createRadialGradient(gx,gy,0,gx,gy,r);glow.addColorStop(0,'#f3b44326');glow.addColorStop(1,'#f3b44300');g.fillStyle=glow;g.fillRect(0,0,w,h);}
  // Graticule every 10°, with the Equator and the Tropics marked.
  g.lineWidth=1;g.strokeStyle=SEA_LINE;g.beginPath();
  for(let lon=-120;lon<=60;lon+=10){const x=X(lon);if(x>-2&&x<w+2){g.moveTo(x,0);g.lineTo(x,h);}}
  for(let lat=-70;lat<=70;lat+=10){const y=Y(lat);if(y>-2&&y<h+2){g.moveTo(0,y);g.lineTo(w,y);}}
  g.stroke();
  const eq=Y(0);if(eq>-10&&eq<h+10){g.strokeStyle='#f3b443aa';g.lineWidth=2;g.setLineDash([12,8]);g.beginPath();g.moveTo(0,eq);g.lineTo(w,eq);g.stroke();g.setLineDash([]);g.lineWidth=1;
   g.fillStyle='#f3b443';g.font=`700 13px ${CAPS}`;(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing='3px';g.fillText('EQUATOR',X(-25),eq-8);(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing='0px';}
  for(const t of [23.44,-23.44]){const y=Y(t);if(y>-10&&y<h+10){g.strokeStyle='#f3b44333';g.setLineDash([2,5]);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();g.setLineDash([]);}}
  // Waves: little tilde marks drifting with the phase (they only move while the caller animates).
  g.strokeStyle='#f4e7c92e';g.lineWidth=1.4;g.beginPath();const ws=Math.max(5,Math.min(10,px*.9));
  for(const [lon,lat] of waves){const x=X(lon)+Math.sin(phase+lat)*2,y=Y(lat);if(x<-20||x>w+20||y<-20||y>h+20)continue;const b=Math.sin(phase*1.3+lon)*1.2;
   g.moveTo(x-ws,y+b);g.quadraticCurveTo(x-ws/2,y-3+b,x,y+b);g.quadraticCurveTo(x+ws/2,y+3+b,x+ws,y+b);}
  g.stroke();
  // Land: a fill, a coast line, then a second faint line offshore (an old chart's water line).
  // Land: a flat coral offset "shadow" first (the deco lift), then the cream plane with a fine ink edge.
  const path=(poly:LonLat[],ox:number,oy:number)=>{g.beginPath();poly.forEach(([lon,lat],i)=>i?g.lineTo(X(lon)+ox,Y(lat)+oy):g.moveTo(X(lon)+ox,Y(lat)+oy));g.closePath();};
  const lift=Math.max(3,Math.min(7,px*.25));
  g.fillStyle=CORAL;for(const poly of LAND){path(poly,lift,lift);g.fill();}
  const landG=g.createLinearGradient(0,0,w,h);landG.addColorStop(0,'#f8efd9');landG.addColorStop(1,'#ead8b0');
  for(const poly of LAND){path(poly,0,0);g.fillStyle=landG;g.fill();g.strokeStyle=INK;g.lineWidth=1.2;g.stroke();}
  g.textAlign='center';
  for(const l of LAND_LABELS){const x=X(l.at[0]),y=Y(l.at[1]);if(x<-200||x>w+200||y<-40||y>h+40)continue;const fs=Math.round(Math.max(10,Math.min(22,px*.9))*l.size);
   const ocean=l.t===l.t.toUpperCase()&&l.t.includes('OCEAN')||l.t.includes('Sea')||l.t.includes('Strait');
   g.font=l.size<.9?`700 ${Math.max(11,Math.round(fs*.85))}px ${CAPS}`:`400 ${fs}px ${DECO}`;const onLandLabel=l.t.includes('Strait');g.fillStyle=onLandLabel?'#13203acc':ocean?'#f3b443cc':'#13203a99';
   if(l.size>=.9){(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing=`${Math.round(fs*.35)}px`;}g.fillText(l.t,x,y);(g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing='0px';}
  // The course: dashed ahead, solid red behind the ship.
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle='#f4e7c977';g.lineWidth=2;g.setLineDash([2,7]);g.beginPath();COURSE.forEach((c,i)=>i?g.lineTo(X(c.at[0]),Y(c.at[1])):g.moveTo(X(c.at[0]),Y(c.at[1])));g.stroke();g.setLineDash([]);
  g.strokeStyle='#0b132699';g.lineWidth=7;g.beginPath();g.moveTo(X(COURSE[0].at[0]),Y(COURSE[0].at[1]));for(const c of COURSE){if(c.p>=p)break;g.lineTo(X(c.at[0]),Y(c.at[1]));}g.lineTo(X(at[0]),Y(at[1]));g.stroke();
  g.strokeStyle=ROUTE;g.lineWidth=3.5;g.beginPath();g.moveTo(X(COURSE[0].at[0]),Y(COURSE[0].at[1]));for(const c of COURSE){if(c.p>=p)break;g.lineTo(X(c.at[0]),Y(c.at[1]));}g.lineTo(X(at[0]),Y(at[1]));g.stroke();
  // Ports.
  g.textAlign='left';
  for(const port of PORTS){const x=X(port.at[0]),y=Y(port.at[1]);if(x<-80||x>w+80||y<-40||y>h+40)continue;const reached=p>=port.p-.005;
   g.beginPath();g.arc(x,y,reached?7:5.5,0,Math.PI*2);g.fillStyle=reached?ROUTE:CREAM;g.fill();g.lineWidth=2.5;g.strokeStyle=INK;g.stroke();
   if(reached){g.beginPath();g.arc(x,y,11,0,Math.PI*2);g.strokeStyle='#f3b44399';g.lineWidth=1.5;g.stroke();}
   g.font=`400 15px ${DECO}`;g.fillStyle=INK;const name=port.name.split(',')[0];
   // Labels sit clear of the ship: Genoa above its dot (the ship starts there), Villefranche below-right, the rest to the left.
   const lx=port.id==='genoa'?0:port.id==='villefranche'?10:-10,ly=port.id==='genoa'?-26:port.id==='villefranche'?16:-12;
   g.textAlign=port.id==='genoa'?'center':port.id==='villefranche'?'left':'right';
   g.lineWidth=5;g.strokeStyle=LANDC;g.lineJoin='round';g.strokeText(name,x+lx,y+ly);g.fillText(name,x+lx,y+ly);}
  g.textAlign='left';
  // The ship (seen from above): a wake, the hull, a deck and two funnels.
  const sx=X(at[0]),sy=Y(at[1]),L=Math.max(30,Math.min(46,Math.min(w,h)*.08));
  g.save();g.translate(sx,sy);g.rotate(heading);
  g.strokeStyle='#f4e7c9dd';g.lineWidth=2.4;g.beginPath();for(const s of [-1,1]){g.moveTo(-L*.45,s*L*.08);g.quadraticCurveTo(-L*1.2,s*L*.2,-L*2.1,s*L*(.42+Math.sin(phase*2)*.03));}g.stroke();
  g.fillStyle='#0b132688';hull(g,L,3,4);g.fill();
  g.fillStyle=CREAM;hull(g,L,0,0);g.fill();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();
  g.fillStyle=INK;g.beginPath();g.roundRect(-L*.36,-L*.1,L*.66,L*.2,L*.06);g.fill();
  g.fillStyle=CORAL;for(const fx of [-.12,.1]){g.beginPath();g.arc(fx*L,0,L*.075,0,Math.PI*2);g.fill();g.strokeStyle=CREAM;g.lineWidth=1.4;g.stroke();}
  g.restore();
  // Compass rose, top-right, quietly.
  // A deco compass star: eight gold points, the north one coral.
  const rx=w-50,ry=h-(w<700?260:74);if(ry>80){g.save();g.translate(rx,ry);g.strokeStyle='#f3b44399';g.lineWidth=1.2;g.beginPath();g.arc(0,0,24,0,Math.PI*2);g.stroke();
   for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?18:32;g.save();g.rotate(a);g.beginPath();g.moveTo(0,-r);g.lineTo(4,0);g.lineTo(-4,0);g.closePath();g.fillStyle=i===0?CORAL:'#f3b443cc';g.fill();g.restore();}
   g.font=`700 11px ${CAPS}`;g.fillStyle='#f3b443';g.textAlign='center';g.fillText('N',0,-37);g.restore();}
 };
 return {draw,resize,dispose:()=>{canvas.width=canvas.height=0;}};
}
function hull(g:CanvasRenderingContext2D,L:number,dx:number,dy:number){g.beginPath();g.moveTo(L*.55+dx,dy);g.quadraticCurveTo(L*.3+dx,-L*.17+dy,-L*.05+dx,-L*.16+dy);g.lineTo(-L*.45+dx,-L*.15+dy);
 g.quadraticCurveTo(-L*.55+dx,dy,-L*.45+dx,L*.15+dy);g.lineTo(-L*.05+dx,L*.16+dy);g.quadraticCurveTo(L*.3+dx,L*.17+dy,L*.55+dx,dy);g.closePath();}
/** Point-in-polygon against the coastlines (only used once, to keep wave marks off the land). */
function onLand([x,y]:LonLat){for(const poly of LAND){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];
 if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}if(inside)return true;}return false;}
