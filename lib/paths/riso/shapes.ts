/** Riso engine — the shared print-language kit. Marks, edges, fields, bands and a few
 * football constructions. Every function: (sheet, ink, ...geometry in world units, options).
 * Internals are seeded (never Math.random); marks hold while the seed holds.
 * Story-specific lead objects (a kite, a lantern, a dial…) belong in the story file, not here. */
import type {Sheet} from './sheet';
import {rng,hash,noise1,TAU,clamp,lerp,ribbon,wob,polyPath,curvePath,circlePath,rectPath,torn,blob,smoothPts,partial,rotPts,movePts,type Pt} from './motion';

// ---------------- marks ----------------
export type ContourOpts={close?:boolean;seed?:number;pressure?:number;taper?:number;gaps?:[number,number][];wobble?:number;cov?:number;step?:number};
/** contour: a pressure-varied, wobbling ink line as one filled ribbon (thicker on the shadow side when pressure>0, tapered ends, deliberate gaps). */
export function contour(s:Sheet,ink:string,pts:Pt[],width:number,o:ContourOpts={}){s.fill(ink,ribbon(pts,width,o),o.cov??1);}
/** contourPath: the same ribbon as a Path2D for clipping or knockout. */
export const contourPath=(pts:Pt[],width:number,o:ContourOpts={})=>ribbon(pts,width,o);
/** dust: seeded speckle fragments in a disc — chalk dust, spray, pollen. ink omitted → paper knockout. */
export function dust(s:Sheet,ink:string|null,x:number,y:number,r:number,count:number,o:{seed?:number;size?:number;cov?:number;spread?:number}={}){
 const{seed=1,size=6,cov=1,spread=1}=o,rr=rng(seed),p=new Path2D();
 for(let i=0;i<count;i++){const a=rr()*TAU,d=Math.pow(rr(),.6)*r*spread,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d,sz=size*(.4+rr()*1.1),rot=rr()*TAU;const q=rotPts([[-sz,-sz*.6],[sz,-sz*.4],[sz*.7,sz*.6],[-sz*.6,sz*.5]],rot);p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 if(ink)s.fill(ink,p,cov);else s.knockout(p,cov);
}
/** chalkStroke: chalk on an ink surface — a paper knockout ribbon with dusty edges. progress 0..1 draws the line on. */
export function chalkStroke(s:Sheet,pts:Pt[],width:number,o:{seed?:number;progress?:number;cov?:number;dust?:number;close?:boolean;step?:number}={}){
 const{seed=1,progress=1,cov=.92,close=false,step=7}=o,line=progress>=1?pts:partial(smoothPts(pts,close,step),progress);if(line.length<2)return;
 s.knockout(ribbon(line,width,{seed,pressure:.6,taper:.5,wobble:1.6,close:close&&progress>=1,step}),cov);
 if((o.dust??1)<=0)return;
 const q=smoothPts(line,false,Math.max(10,step)),n=Math.max(2,Math.round((o.dust??1)*q.length/3)),rr=rng(seed+5),p=new Path2D();
 for(let i=0;i<n;i++){const k=Math.min(q.length-1,Math.floor(rr()*q.length)),a=rr()*TAU,d=width*(.6+rr()*1.4),px=q[k][0]+Math.cos(a)*d,py=q[k][1]+Math.sin(a)*d,sz=width*(.1+rr()*.22);p.rect(px,py,sz,sz*(.6+rr()));}
 s.knockout(p,.75);
}
/** laneArrow: a chunky hand-cut arrow from a to b (a pass lane, an option). dashed → segments. */
export function laneArrow(s:Sheet,ink:string,a:Pt,b:Pt,width:number,o:{dashed?:boolean;head?:number;seed?:number;cov?:number;progress?:number}={}){
 const{dashed=false,head=width*2.4,seed=1,cov=1,progress=1}=o,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,end:Pt=[a[0]+ux*L*progress,a[1]+uy*L*progress],shaftEnd:Pt=[end[0]-ux*head*.9,end[1]-uy*head*.9];
 const gaps:[number,number][]=dashed?[[.18,.3],[.48,.6],[.78,.88]]:[];
 if(L*progress>head)s.fill(ink,ribbon([a,shaftEnd],width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps}),cov);
 const tip=polyPath(wob([[end[0],end[1]],[end[0]-ux*head-uy*head*.55,end[1]-uy*head+ux*head*.55],[end[0]-ux*head*.6,end[1]-uy*head*.6],[end[0]-ux*head+uy*head*.55,end[1]-uy*head-ux*head*.55]],1.5,seed+3,true,{step:5,corner:.4}));s.fill(ink,tip,cov);
}
/** sparkBurst: rays around a point (a spark, an idea, a burst). g 0..1 grows the rays. */
export function sparkBurst(s:Sheet,ink:string,x:number,y:number,r:number,o:{n?:number;seed?:number;g?:number;width?:number;cov?:number}={}){
 const{n=9,seed=1,g=1,width=r*.12,cov=1}=o,rr=rng(seed),p=new Path2D();
 for(let i=0;i<n;i++){const a=i/n*TAU+(rr()-.5)*.3,r0=r*.45,r1=r*(.8+rr()*.5)*g;const q=ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],width*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8});p.addPath(q);}
 s.fill(ink,p,cov);
}
/** speedLines: trailing lines behind a fast object. dir = direction of travel (radians). */
export function speedLines(s:Sheet,ink:string,x:number,y:number,dir:number,o:{n?:number;seed?:number;len?:number;spread?:number;width?:number;cov?:number}={}){
 const{n=6,seed=1,len=140,spread=70,width=5,cov=1}=o,rr=rng(seed),p=new Path2D(),px=-Math.sin(dir),py=Math.cos(dir);
 for(let i=0;i<n;i++){const side=(rr()-.5)*spread*2,back=20+rr()*40,L=len*(.5+rr()),x0=x-Math.cos(dir)*back+px*side,y0=y-Math.sin(dir)*back+py*side;p.addPath(ribbon([[x0,y0],[x0-Math.cos(dir)*L,y0-Math.sin(dir)*L]],width*(.5+rr()),{seed:seed+i,taper:.9,wobble:.6}));}
 s.fill(ink,p,cov);
}
/** scribble: loose multi-ink loops inside a radius (thought, energy, a tangle). One ribbon per ink. */
export function scribble(s:Sheet,inks:string[],x:number,y:number,r:number,o:{seed?:number;width?:number;loops?:number;cov?:number;progress?:number}={}){
 const{seed=1,width=9,loops=4,cov=1,progress=1}=o;
 inks.forEach((ink,k)=>{const rr=rng(seed+k*17),pts:Pt[]=[];let a=rr()*TAU;for(let i=0;i<loops*4+2;i++){const d=r*(.25+rr()*.7);pts.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);a+=1.4+rr()*1.9;}
  const line=progress>=1?pts:partial(smoothPts(pts,false,8),progress);if(line.length>1)s.fill(ink,ribbon(line,width,{seed:seed+k,pressure:.5,taper:.6,wobble:2,step:8}),cov);});
}
/** thread: a sinuous ribbon with small twist ticks — string, rope, a woven strand. */
export function thread(s:Sheet,ink:string,pts:Pt[],width:number,o:{seed?:number;cov?:number;ticks?:boolean;progress?:number}={}){
 const{seed=1,cov=1,ticks=true,progress=1}=o,line=progress>=1?pts:partial(smoothPts(pts,false,6),progress);if(line.length<2)return;s.fill(ink,ribbon(line,width,{seed,pressure:.35,taper:.3,wobble:1.2}),cov);
 if(ticks){const q=smoothPts(line,false,width*2.2),p=new Path2D();for(let i=1;i<q.length-1;i+=2){const a=q[i-1],b=q[i+1],nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1,w=width*.55;p.moveTo(q[i][0]-nx/l*w,q[i][1]-ny/l*w);p.lineTo(q[i][0]+nx/l*w+ (b[0]-a[0])/l*w*.4,q[i][1]+ny/l*w+(b[1]-a[1])/l*w*.4);}s.stroke(ink,p,Math.max(1.5,width*.22),cov);}
}

// ---------------- edges and fields ----------------
/** handCut: subdivide a polygon and displace vertices laterally without smoothing — the jagged, scissor-cut edge of the reference frames. */
export function handCut(pts:Pt[],seed=1,amp=30,step=150,close=true):Pt[]{const out:Pt[]=[],n=pts.length,segs=close?n:n-1,rr=rng(seed);
 for(let i=0;i<segs;i++){const a=pts[i],b=pts[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.round(L/step)),nx=-(b[1]-a[1])/(L||1),ny=(b[0]-a[0])/(L||1);
  for(let k=0;k<m;k++){const u=(k+(k?(rr()-.5)*.5:0))/m,d=k?amp*(rr()*2-1)*(.4+.6*rr()):0;out.push([lerp(a[0],b[0],u)+nx*d,lerp(a[1],b[1],u)+ny*d]);}}
 if(!close)out.push(pts[n-1]);return out;}
/** tornRect: a rectangle with torn paper edges (noise), as a Path2D. */
export const tornRect=(x:number,y:number,w:number,h:number,seed=1,amp=14)=>polyPath(torn(x,y,w,h,seed,amp),true);
/** field: a large ink area of a given kind in a box — torn (all edges torn), wave (wavy top), arch (a dome), wall (a slab with hand-cut sides). */
export function field(s:Sheet,ink:string,kind:'torn'|'wave'|'arch'|'wall',box:[number,number,number,number],o:{cov?:number;seed?:number;amp?:number}={}){
 const{cov=1,seed=1,amp=18}=o,[x,y,w,h]=box;let path:Path2D;
 if(kind==='torn')path=tornRect(x,y,w,h,seed,amp);
 else if(kind==='wave'){const pts:Pt[]=[[x,y+h]];for(let i=0;i<=16;i++){const u=i/16;pts.push([x+u*w,y+amp*Math.sin(u*TAU*1.5+seed)+amp*.5*noise1(u*6+seed,seed)]);}pts.push([x+w,y+h]);path=curvePath(pts,true,1.2);}
 else if(kind==='arch'){const p=new Path2D();const r=w/2;p.moveTo(x,y+h);p.lineTo(x,y+r);p.arc(x+r,y+r,r,Math.PI,0);p.lineTo(x+w,y+h);p.closePath();path=p;}
 else path=polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],seed,amp,h/3),true);
 s.fill(ink,path,cov);
}
/** arches(cx, cy, r0, step, count): nested arch bands (an arch = a half disc on two legs) as ring paths, innermost first.
 * Fill each with s.fill/s.tone at stepped coverage: one band, one flat print. legs = how far the legs run down. */
export function arches(cx:number,cy:number,r0:number,step:number,count:number,legs=3000):Path2D[]{
 const arch=(r:number,p:Path2D,reverse=false)=>{if(reverse){p.moveTo(cx+r,cy+legs);p.lineTo(cx+r,cy);p.arc(cx,cy,r,0,Math.PI,true);p.lineTo(cx-r,cy+legs);}else{p.moveTo(cx-r,cy+legs);p.lineTo(cx-r,cy);p.arc(cx,cy,r,Math.PI,0);p.lineTo(cx+r,cy+legs);}p.closePath();};
 const out:Path2D[]=[];for(let k=0;k<count;k++){const p=new Path2D();arch(r0+step*(k+1),p);if(k===0){out.push(p);continue;}arch(r0+step*k,p,true);out.push(p);}return out;}
/** ring(x, y, r0, r1): an annulus path (inner winding reversed, so plain nonzero fills work). r1 may be huge for a stepped vignette band. */
export function ring(x:number,y:number,r0:number,r1:number){const p=new Path2D();p.arc(x,y,r1,0,TAU);p.moveTo(x+r0,y);p.arc(x,y,r0,0,TAU,true);p.closePath();return p;}
/** crescent(x, y, r, light): the shadow side of a disc — disc minus an offset circle toward the light [dx,dy] in −1..1. */
export function crescent(x:number,y:number,r:number,light:Pt=[-.4,-.45],k=1.15){const p=new Path2D();p.arc(x,y,r,0,TAU);p.moveTo(x+light[0]*r*.9+r*k,y+light[1]*r*.9);p.arc(x+light[0]*r*.9,y+light[1]*r*.9,r*k,0,TAU,true);p.closePath();return p;}
/** tornChannel(x, width, seed): a vertical channel with hand-cut edges spanning y0..y1 (the reference's navy channel). */
export function tornChannel(x:number,width:number,seed=1,o:{y0?:number;y1?:number;amp?:number;step?:number;lean?:number}={}):Path2D{
 const{y0=-3000,y1=3000,amp=45,step=170,lean=0}=o;return polyPath(handCut([[x-width/2+lean*y0,y0],[x+width/2+lean*y0,y0],[x+width/2+lean*y1,y1],[x-width/2+lean*y1,y1]],seed,amp,step),true);}
/** ribbons(cx, cy, angle, widths): broad bands crossing the whole sheet edge to edge, perpendicular to `angle`, centred on the middle band. */
export function ribbons(cx:number,cy:number,angle:number,widths:number[],o:{seed?:number;wobble?:number;span?:number}={}):Path2D[]{
 const{seed=1,wobble=0,span=4000}=o,nx=Math.cos(angle+Math.PI/2),ny=Math.sin(angle+Math.PI/2),dx=Math.cos(angle),dy=Math.sin(angle),total=widths.reduce((a,b)=>a+b,0);let off=-total/2;
 return widths.map((w,k)=>{const o0=off,o1=off+w;off+=w;const pts:Pt[]=[[cx+nx*o0-dx*span,cy+ny*o0-dy*span],[cx+nx*o0+dx*span,cy+ny*o0+dy*span],[cx+nx*o1+dx*span,cy+ny*o1+dy*span],[cx+nx*o1-dx*span,cy+ny*o1-dy*span]];return wobble?polyPath(wob(pts,wobble,seed+k,true,{step:60,corner:.4}),true):polyPath(pts,true);});}
/** strata(box, count, seed): torn horizontal layers (ground, sediment, tide lines), top layer first; each runs to the box bottom. */
export function strata(box:[number,number,number,number],count:number,seed=1,amp=26):Path2D[]{const[x,y,w,h]=box,out:Path2D[]=[];
 for(let k=0;k<count;k++){const top=y+h*k/count,pts:Pt[]=[[x-100,y+h+200]];for(let i=0;i<=20;i++){const u=i/20;pts.push([x-100+u*(w+200),top+amp*noise1(u*7+k*3,seed+k)+amp*.4*noise1(u*23,seed+k+7)]);}pts.push([x+w+100,y+h+200]);out.push(polyPath(pts,true));}return out;}
/** contourRings(cx, cy, r0, step, count): wobbly concentric rings (map contours, ripples, sound). Points, innermost first. */
export function contourRings(cx:number,cy:number,r0:number,step:number,count:number,seed=1,amp=.06):Pt[][]{const out:Pt[][]=[];for(let k=0;k<count;k++){const r=r0+step*k;out.push(blob(cx,cy,r,r,seed+k,{amp,n:Math.max(24,Math.round(r/14))}));}return out;}
/** lattice(box, gap, angle): parallel stripes across a box as point pairs — weave one angle, then the other. */
export function lattice(box:[number,number,number,number],gap:number,angle:number,seed=1):Pt[][]{const[x,y,w,h]=box,cx=x+w/2,cy=y+h/2,R=Math.hypot(w,h)/2+gap,ca=Math.cos(angle),sa=Math.sin(angle),out:Pt[][]=[];
 for(let v=-R;v<=R;v+=gap){const j=(hash(Math.round(v),seed)-.5)*gap*.3;out.push([[cx+ca*-R-sa*(v+j),cy+sa*-R+ca*(v+j)],[cx+ca*R-sa*(v+j),cy+sa*R+ca*(v+j)]]);}return out;}
/** windStreaks(box, count, seed): long thin streak polylines (wind, current, speed of weather). */
export function windStreaks(box:[number,number,number,number],count:number,seed=1,o:{len?:number;lift?:number}={}):Pt[][]{const{len=700,lift=60}=o,[x,y,w,h]=box,rr=rng(seed),out:Pt[][]=[];
 for(let i=0;i<count;i++){const x0=x+rr()*w,y0=y+rr()*h,L=len*(.4+rr()),pts:Pt[]=[];for(let k=0;k<=6;k++){const u=k/6;pts.push([x0+u*L,y0-lift*Math.sin(u*Math.PI)*(rr()-.3)]);}out.push(pts);}return out;}
/** confetti: small hand-cut fragments scattered in a box (secondary accents). inks → one fill each; 'paper' → knockout. */
export function confetti(s:Sheet,inks:(string|'paper')[],box:[number,number,number,number],count:number,seed=1,o:{size?:number;cov?:number}={}){
 const{size=42,cov=1}=o,rr=rng(seed),paths=inks.map(()=>new Path2D());
 for(let i=0;i<count;i++){const k=i%inks.length,x=box[0]+rr()*box[2],y=box[1]+rr()*box[3],sz=size*(.5+rr()),rot=rr()*TAU,q=rotPts([[-sz*.5,-sz*.4],[sz*.5,-sz*.55],[sz*.45,sz*.4],[-sz*.35,sz*.5]].map(p=>[p[0]*(.8+rr()*.4),p[1]*(.8+rr()*.4)] as Pt),rot);paths[k].moveTo(x+q[0][0],y+q[0][1]);for(let j=1;j<4;j++)paths[k].lineTo(x+q[j][0],y+q[j][1]);paths[k].closePath();}
 inks.forEach((ink,k)=>ink==='paper'?s.knockout(paths[k]):s.fill(ink,paths[k],cov));
}
/** glowDisc: a disc with a stepped halftone halo (sun, lantern, a light in a dark room). steps = halo bands. */
export function glowDisc(s:Sheet,ink:string,x:number,y:number,r:number,o:{steps?:number;glow?:number;seed?:number;core?:boolean}={}){
 const{steps=4,glow=1,seed=1,core=true}=o;for(let k=steps;k>=1;k--){const rr=r*(1+k*.42*glow),level=s.levels[Math.max(0,Math.min(s.levels.length-1,steps-k))];s.tone(ink,polyPath(blob(x,y,rr,rr,seed+k,{amp:.04}),true),level);}
 if(core)s.fill(ink,polyPath(blob(x,y,r,r,seed,{amp:.03}),true));
}
/** ripple: concentric wobbly rings as contours. */
export function ripple(s:Sheet,ink:string,x:number,y:number,r:number,count:number,o:{width?:number;seed?:number;spacing?:number;cov?:number;progress?:number}={}){
 const{width=7,seed=1,spacing=r*.5,cov=1,progress=1}=o;for(let k=0;k<count;k++){const g=clamp(progress*count-k);if(g<=0)continue;const rr=(r+spacing*k)*(.7+.3*g);s.fill(ink,ribbon(blob(x,y,rr,rr,seed+k,{amp:.05,n:Math.max(24,Math.round(rr/12))}),width*(1-k/(count+1)),{seed:seed+k,close:true,pressure:.4,wobble:1.5}),cov*g);}
}
/** pressureWalls: two masses closing on a gap — the opponent/pressure role. gap = clear width between the inner edges. */
export function pressureWalls(s:Sheet,ink:string,x:number,y:number,gap:number,o:{height?:number;thick?:number;lean?:number;seed?:number;cov?:number}={}){
 const{height=900,thick=700,lean=0,seed=1,cov=1}=o;
 const left=polyPath(handCut([[x-gap/2-thick,y-height/2],[x-gap/2-lean*height/2,y-height/2],[x-gap/2+lean*height/2,y+height/2],[x-gap/2-thick,y+height/2]],seed,34,160),true);
 const right=polyPath(handCut([[x+gap/2+lean*height/2,y-height/2],[x+gap/2+thick,y-height/2],[x+gap/2+thick,y+height/2],[x+gap/2-lean*height/2,y+height/2]],seed+9,34,160),true);
 s.fill(ink,left,cov);s.fill(ink,right,cov);
}

// ---------------- football constructions ----------------
/** footballPanels: the 5-panel ball — paper white, key-ink panels and contour, one halftone shadow crescent. */
export function footballPanels(s:Sheet,x:number,y:number,r:number,o:{rot?:number;key?:string;shadow?:string;seed?:number;light?:Pt}={}){
 const{rot=0,key='navy',shadow='pink',seed=1,light=[-.4,-.45]}=o,disc=polyPath(blob(x,y,r,r,seed,{amp:.025}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(shadow,crescent(x,y,r*1.02,light),.45);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const pts:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;pts.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(wob(pts,r*.02,seed+3,true,{step:8,corner:.5}),true);};
 s.fill(key,pent(x,y,r*.33,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,d=r*.86;s.fill(key,pent(x+Math.cos(a)*d,y+Math.sin(a)*d,r*.3,a+Math.PI));}
 const seams=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,a2=rot+Math.PI/5+i/5*TAU;seams.moveTo(x+Math.cos(a)*r*.33,y+Math.sin(a)*r*.33);seams.lineTo(x+Math.cos(a2)*r*.62,y+Math.sin(a2)*r*.62);}s.stroke(key,seams,Math.max(2,r*.05));
 s.restore();
 s.fill(key,ribbon(blob(x,y,r,r,seed+1,{amp:.02,n:48}),Math.max(3,r*.075),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}));
}
/** goalFrame: posts and crossbar with a halftone net and side depth. */
export function goalFrame(s:Sheet,ink:string,x:number,y:number,w:number,h:number,o:{depth?:number;net?:string;seed?:number;bar?:number}={}){
 const{depth=h*.35,net=ink,seed=1,bar=Math.max(6,h*.06)}=o;
 s.tone(net,polyPath([[x,y],[x+w,y],[x+w+depth*.5,y+depth*.4],[x+w+depth*.5,y+h+depth*.4],[x-depth*.5,y+h+depth*.4],[x-depth*.5,y+depth*.4]],true),.28);
 s.fill(ink,ribbon([[x,y+h],[x,y],[x+w,y],[x+w,y+h]],bar,{seed,pressure:.5,taper:.2,wobble:1.5}));
 s.fill(ink,ribbon([[x,y],[x-depth*.5,y+depth*.4],[x-depth*.5,y+h+depth*.4]],bar*.6,{seed:seed+1,taper:.3,wobble:1}));
 s.fill(ink,ribbon([[x+w,y],[x+w+depth*.5,y+depth*.4],[x+w+depth*.5,y+h+depth*.4]],bar*.6,{seed:seed+2,taper:.3,wobble:1}));
}
/** disc: a plain blob disc (solid or halftone) — a stand-in body, a stone, a sun without glow. */
export function disc(s:Sheet,ink:string|'paper',x:number,y:number,r:number,o:{cov?:number;seed?:number;amp?:number}={}){const{cov=1,seed=1,amp=.04}=o,p=polyPath(blob(x,y,r,r,seed,{amp}),true);if(ink==='paper')s.knockout(p,cov);else s.fill(ink,p,cov);}
export {polyPath,curvePath,circlePath,rectPath,blob,torn,movePts,rotPts};
