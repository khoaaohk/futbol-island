/** Riso engine — the sheet: one offscreen plate canvas per ink, halftone
 * pattern tiles in sheet space, speckle grain inside the ink, and press()
 * which lays paper, multiplies the plates with a stable registration offset
 * and lets paper show through. Everything is cached per canvas and size. */
import {hash,rng,TAU,clamp,lerp,easeIO,type Pt} from './motion';

export type InkSet=Record<string,string>;
export type SheetSpec={paper:string;inks:InkSet;order:string[];registration?:number;alpha?:number;grain?:number;mottle?:number};
export type Safe={x:number;y:number;w:number;h:number};
export type Sheet={
 /** logical units: short side 1080; unit = css px per unit; cx,cy = the safe-region centre (where camera() aims) */
 W:number;H:number;cx:number;cy:number;unit:number;safe:Safe;width:number;height:number;dpr:number;
 /** arrival scale multiplier applied inside camera() (passage arrival .88→1; preview .68→.88). Set by the player/passage, read-only for stories. */
 arrival:number;
 /** compact-viewport fit (≤ 1): on short phones and short landscape the nominal 1080-unit square is scaled so it clears the title/headline band and the tray. Applied inside camera(); world units visible in safe = safe.w/fit × safe.h/fit. */
 fit:number;
 save():void;restore():void;translate(x:number,y:number):void;scale(sx:number,sy?:number):void;rotate(a:number):void;
 camera(x:number,y:number,zoom?:number,rot?:number):void;
 clip(path:Path2D,rule?:CanvasFillRule):void;
 fill(ink:string,path:Path2D,cov?:number,rule?:CanvasFillRule):void;
 stroke(ink:string,path:Path2D,width:number,cov?:number):void;
 tone(ink:string,path:Path2D,density:number|((x:number,y:number)=>number),box?:[number,number,number,number],rule?:CanvasFillRule):void;
 knockout(path:Path2D,cov?:number,rule?:CanvasFillRule):void;
 field(ink:string,cov?:number,mottle?:number):void;
 press(seed:number):void;
 /** current world→device matrix (plates share one transform stack) */
 getTransform():DOMMatrix;
 /** device-px → world point through the current transform */
 toWorld(px:number,py:number):Pt;
 /** the sheet's halftone levels (coverage steps used by tone()) */
 levels:readonly number[];
 /** internal — used by passage.ts */
 _passage:PassageState;
 _clipDevice(points:Pt[]):void;
 _ops:number;
};
export type PassageState={pending?:{points:Pt[];progress:number};screen?:Pt[];blend?:{p:number}};
export const LEVELS=[.1,.2,.32,.45,.6,.75,.88] as const;
/** Screen lattices per plate order index: (4,1)≈14°, (1,4)≈76°, (1,0)=0°, (1,1)=45° — overprints do not moiré. */
const LATTICE:[number,number][]=[[4,1],[1,4],[1,0],[1,1]];
type Plate={name:string;hex:string;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;index:number};
type Cache={width:number;height:number;dpr:number;inkKey:string;plates:Plate[];byName:Map<string,Plate>;patterns:Map<string,CanvasPattern>;speckle?:CanvasPattern;grain?:CanvasPattern;mottle?:CanvasPattern;cell:number};
const caches=new WeakMap<CanvasRenderingContext2D,Cache>();
const make=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;};

/** Halftone tile: a rotated dot lattice that repeats exactly, with seeded jitter keyed on position so wrapped dots match. */
function makeTile(ctx:CanvasRenderingContext2D,hex:string,level:number,lattice:[number,number],cell:number){
 const [a,b]=lattice,q=Math.sqrt(a*a+b*b),T=Math.max(4,Math.round(cell*q)),s=T/(a*a+b*b),cellPx=s*q,tile=make(T,T),g=tile.getContext('2d')!;
 if(level>=.7){// dense tones print as a flat solid with stochastic paper speckle (the reference's grain), not as touching dots
  g.fillStyle=hex;g.fillRect(0,0,T,T);g.globalCompositeOperation='destination-out';g.fillStyle='#000';const hole=cellPx*.3,count=Math.round(T*T*(1-level)/(Math.PI*hole*hole*.9)),r=rng(Math.round(level*100)+a*7+b);g.beginPath();
  for(let i=0;i<count;i++){const x=r()*T,y=r()*T,rad=hole*(.6+r()*.8);for(const [ox,oy] of [[0,0],[T,0],[-T,0],[0,T],[0,-T]]){g.moveTo(x+ox+rad,y+oy);g.arc(x+ox,y+oy,rad,0,TAU);}}
  g.fill();return ctx.createPattern(tile,'repeat')!;}
 g.fillStyle=hex;const rad=cellPx*.62*Math.sqrt(level),range=Math.ceil((T+cellPx*2)/s)+2;g.beginPath();
 for(let m=-range;m<=range;m++)for(let n=-range;n<=range;n++){const x=(m*a-n*b)*s,y=(m*b+n*a)*s;if(x<-cellPx||y<-cellPx||x>T+cellPx||y>T+cellPx)continue;
  const kx=Math.round((((x%T)+T)%T)*8),ky=Math.round((((y%T)+T)%T)*8),j1=hash(kx*7919+ky,11),j2=hash(kx+ky*7919,23),j3=hash(kx*31+ky*17,41);
  const px=x+(j1-.5)*cellPx*.22,py=y+(j2-.5)*cellPx*.22,r=rad*(.92+j3*.16);if(r<.35)continue;g.moveTo(px+r,py);g.arc(px,py,r,0,TAU);}
 g.fill();return ctx.createPattern(tile,'repeat')!;
}
/** Speckle: fine stochastic holes punched in the ink so paper shows as light speckle (the reference frames' grain). */
function makeSpeckle(ctx:CanvasRenderingContext2D,dpr:number){const T=128,tile=make(T,T),g=tile.getContext('2d')!,r=rng(77);g.fillStyle='#000';
 for(let i=0;i<1500;i++){const x=r()*T,y=r()*T,s=(.5+r()*1.1)*dpr,al=.35+r()*.65;g.globalAlpha=al;g.fillRect(x,y,s,s);}return ctx.createPattern(tile,'repeat')!;}
/** Paper grain: darker fibres and flecks, multiplied last so paper texture sits on solids too. */
function makeGrain(ctx:CanvasRenderingContext2D,dpr:number){const T=160,tile=make(T,T),g=tile.getContext('2d')!,r=rng(91);g.fillStyle='#fff';g.fillRect(0,0,T,T);
 for(let i=0;i<2200;i++){const x=r()*T,y=r()*T,s=(.6+r()*1.2)*dpr,v=205+(r()*50|0);g.fillStyle=`rgb(${v},${v-4},${v-10})`;g.fillRect(x,y,s,s*(.6+r()));}
 for(let i=0;i<90;i++){const x=r()*T,y=r()*T,L=(6+r()*18)*dpr,v=222+(r()*25|0);g.strokeStyle=`rgb(${v},${v-3},${v-8})`;g.lineWidth=.8*dpr;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*(r()-.5),y+L*(r()-.5));g.stroke();}
 return ctx.createPattern(tile,'repeat')!;}
/** Mottle: low-frequency blotches (periodic value noise) removed from a field so large ink areas breathe. */
function makeMottle(ctx:CanvasRenderingContext2D,dpr:number){const T=256,tile=make(T,T),g=tile.getContext('2d')!,img=g.createImageData(T,T),d=img.data,cells=5,cs=T/cells;
 const val=(i:number,j:number,seed:number)=>hash(((i%cells)+cells)%cells*131+((j%cells)+cells)%cells,seed);
 const smooth=(x:number,y:number,seed:number)=>{const i=Math.floor(x/cs),j=Math.floor(y/cs),fx=x/cs-i,fy=y/cs-j,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);return lerp(lerp(val(i,j,seed),val(i+1,j,seed),ux),lerp(val(i,j+1,seed),val(i+1,j+1,seed),ux),uy);};
 for(let y=0;y<T;y++)for(let x=0;x<T;x++){const n=.65*smooth(x,y,5)+.35*smooth(x*2.3%T,y*2.3%T,9),k=(y*T+x)*4,al=clamp((n-.42)*2.2);d[k]=0;d[k+1]=0;d[k+2]=0;d[k+3]=al*255;}
 g.putImageData(img,0,0);const p=ctx.createPattern(tile,'repeat')!;p.setTransform(new DOMMatrix().scale(dpr*.9));return p;}

/** The art region: title/caption space kept clear on compact phones; art left of the tray in short landscape. In css px. */
export function artRegion(width:number,height:number,tray:{bottom:number;right:number}){
 let x:number,y:number,w:number,h:number;
 if(width>height&&height<520){const u=Math.min(width*.53/850,(height-122)/760),cx=tray.right>0?(width-tray.right)*.5:width*.29,cy=(110+height-12)*.5;w=850*u;h=760*u;x=cx-w/2;y=cy-h/2;}
 else if(width<=600&&height<=740){const top=150,bottom=Math.max(top+100,Math.min(height-205,tray.bottom>0?height-tray.bottom-8:Infinity)),u=Math.min(width/740,(bottom-top)/680);w=740*u;h=680*u;x=width/2-w/2;y=(top+bottom)/2-h/2;}
 else{const u=Math.min(width/690,height*.66/620);w=690*u;h=620*u;x=width/2-w/2;y=height*.425-h/2;const top=Math.max(y,150),bottom=Math.min(y+h,tray.bottom>0?height-tray.bottom-8:height-40);y=top;h=Math.max(120,bottom-top);}
 return{x,y,w,h};
}

export function acquireSheet(ctx:CanvasRenderingContext2D,width:number,height:number,dpr:number,spec:SheetSpec,tray:{bottom:number;right:number}={bottom:0,right:0}):Sheet{
 const pw=Math.round(width*dpr),ph=Math.round(height*dpr),inkKey=spec.order.map(n=>n+':'+spec.inks[n]).join('|');
 let cache=caches.get(ctx);
 if(!cache||cache.width!==pw||cache.height!==ph||cache.dpr!==dpr||cache.inkKey!==inkKey){
  const plates:Plate[]=spec.order.map((name,index)=>{const hex=spec.inks[name];if(!hex)throw new Error(`riso: ink "${name}" is in order but not in inks`);const canvas=make(pw,ph);return{name,hex,canvas,ctx:canvas.getContext('2d')!,index};});
  cache={width:pw,height:ph,dpr,inkKey,plates,byName:new Map(plates.map(p=>[p.name,p])),patterns:new Map(),cell:4.5*dpr};caches.set(ctx,cache);
 }
 const c=cache,unit=Math.min(width,height)/1080,W=width/unit,H=height/unit,region=artRegion(width,height,tray),safe:Safe={x:region.x/unit,y:region.y/unit,w:region.w/unit,h:region.h/unit};
 const compact=(width<=600&&height<=740)||(width>height&&height<520),fit=compact?clamp(region.h/2/(540*unit)*1.05,.68,1):1;
 const base=new DOMMatrix([unit*dpr,0,0,unit*dpr,0,0]);
 for(const p of c.plates){const g=p.ctx;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,pw,ph);g.setTransform(base);g.lineCap='round';g.lineJoin='round';}
 const plate=(ink:string)=>{const p=c.byName.get(ink);if(!p)throw new Error(`riso: unknown ink "${ink}" (inks: ${spec.order.join(', ')})`);return p;};
 const levelFor=(cov:number)=>{let best=0;for(let i=0;i<LEVELS.length;i++)if(Math.abs(LEVELS[i]-cov)<Math.abs(LEVELS[best]-cov))best=i;return best;};
 const pattern=(p:Plate,level:number)=>{const k=`${p.name}|${level}`;let pat=c.patterns.get(k);if(!pat){pat=makeTile(ctx,p.hex,LEVELS[level],LATTICE[p.index%LATTICE.length],c.cell);c.patterns.set(k,pat);}return pat;};
 const style=(p:Plate,cov:number)=>{if(cov>=.95)return p.hex;const pat=pattern(p,levelFor(cov));pat.setTransform(p.ctx.getTransform().inverse());return pat;};
 const all=(fn:(g:CanvasRenderingContext2D)=>void)=>{for(const p of c.plates)fn(p.ctx);};
 const sheet:Sheet={
  W,H,cx:safe.x+safe.w/2,cy:safe.y+safe.h/2,unit,safe,width,height,dpr,arrival:1,fit,levels:LEVELS,_passage:{},_ops:0,
  save(){all(g=>g.save());},restore(){all(g=>g.restore());},
  translate(x,y){all(g=>g.translate(x,y));},scale(sx,sy=sx){all(g=>g.scale(sx,sy));},rotate(a){all(g=>g.rotate(a));},
  getTransform(){return c.plates[0].ctx.getTransform();},
  toWorld(px,py){const m=c.plates[0].ctx.getTransform().inverse(),p=m.transformPoint(new DOMPoint(px,py));return[p.x,p.y];},
  camera(x,y,zoom=1,rot=0){
   let m=base.translate(sheet.cx,sheet.cy).scale(zoom*sheet.arrival*sheet.fit).rotate(rot*180/Math.PI).translate(-x,-y);
   const pend=sheet._passage.pending;
   if(pend){// forward passage: zoom the outgoing world so the aperture's inscribed circle passes every canvas corner at progress 1
    const pts=pend.points.map(p=>{const q=m.transformPoint(new DOMPoint(p[0],p[1]));return[q.x,q.y] as Pt;});
    const ax=pts.reduce((s,p)=>s+p[0],0)/pts.length,ay=pts.reduce((s,p)=>s+p[1],0)/pts.length;let inner=Infinity;
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1];inner=Math.min(inner,Math.abs(dx*(a[1]-ay)-(a[0]-ax)*dy)/Math.max(.001,Math.hypot(dx,dy)));}
    const vx=sheet.cx*unit*dpr,vy=sheet.cy*unit*dpr,travel=pend.progress>=1?1:pend.progress*pend.progress,cover=Math.hypot(Math.max(vx,pw-vx),Math.max(vy,ph-vy))*1.45;
    const z=Math.exp(Math.log(Math.max(1,cover/Math.max(.01,inner)))*travel),tx=vx-z*ax+(ax-vx)*(1-travel),ty=vy-z*ay+(ay-vy)*(1-travel);
    m=new DOMMatrix([z,0,0,z,tx,ty]).multiply(m);sheet._passage.screen=pts.map(p=>[p[0]*z+tx,p[1]*z+ty]);
   }
   all(g=>g.setTransform(m));
  },
  clip(path,rule){all(g=>g.clip(path,rule));},
  _clipDevice(points){const path=new Path2D();points.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));path.closePath();all(g=>{const m=g.getTransform();g.setTransform(1,0,0,1,0,0);g.clip(path);g.setTransform(m);});},
  fill(ink,path,cov=1,rule){const p=plate(ink);p.ctx.fillStyle=style(p,cov);p.ctx.fill(path,rule);sheet._ops++;},
  stroke(ink,path,width,cov=1){const p=plate(ink);p.ctx.lineWidth=width;p.ctx.strokeStyle=style(p,cov);p.ctx.stroke(path);sheet._ops++;},
  tone(ink,path,density,box,rule){
   const p=plate(ink),g=p.ctx;
   if(typeof density==='number'){if(density<=.02)return;g.fillStyle=style(p,Math.min(density,.94));g.fill(path,rule);sheet._ops++;return;}
   // dot-size ramp: quantize a function of world position into LEVELS bands on a device-space grid, one pattern fill per band
   g.save();g.clip(path,rule);const m=g.getTransform(),inv=m.inverse();g.setTransform(1,0,0,1,0,0);
   let x0=0,y0=0,x1=pw,y1=ph;if(box){const cs=[[box[0],box[1]],[box[0]+box[2],box[1]],[box[0],box[1]+box[3]],[box[0]+box[2],box[1]+box[3]]].map(([x,y])=>m.transformPoint(new DOMPoint(x,y)));x0=Math.max(0,Math.min(...cs.map(q=>q.x)));x1=Math.min(pw,Math.max(...cs.map(q=>q.x)));y0=Math.max(0,Math.min(...cs.map(q=>q.y)));y1=Math.min(ph,Math.max(...cs.map(q=>q.y)));}
   const cell=Math.max(8,c.cell*1.6),bands=LEVELS.map(()=>new Path2D()),used=LEVELS.map(()=>false);
   for(let y=y0;y<y1;y+=cell)for(let x=x0;x<x1;x+=cell){const w=inv.transformPoint(new DOMPoint(x+cell/2,y+cell/2)),d=clamp(density(w.x,w.y));if(d<.05)continue;const k=levelFor(Math.min(d,.94));bands[k].rect(x,y,cell+.5,cell+.5);used[k]=true;}
   for(let k=0;k<LEVELS.length;k++)if(used[k]){const pat=pattern(p,k);pat.setTransform(new DOMMatrix());g.fillStyle=pat;g.fill(bands[k]);sheet._ops++;}
   g.restore();
  },
  knockout(path,cov=1,rule){all(g=>{g.globalCompositeOperation='destination-out';if(cov>=.95)g.fillStyle='#000';else{const pat=pattern(c.plates[0],levelFor(cov));pat.setTransform(g.getTransform().inverse());g.fillStyle=pat;}g.fill(path,rule);g.globalCompositeOperation='source-over';});sheet._ops+=c.plates.length;},
  field(ink,cov=1,mottle=spec.mottle??.5){const p=plate(ink),g=p.ctx;g.save();const m=g.getTransform();g.setTransform(1,0,0,1,0,0);
   if(cov>=.95)g.fillStyle=p.hex;else{const pat=pattern(p,levelFor(cov));pat.setTransform(new DOMMatrix());g.fillStyle=pat;}g.fillRect(0,0,pw,ph);
   if(mottle>0){c.mottle??=makeMottle(ctx,dpr);g.globalCompositeOperation='destination-out';g.globalAlpha=clamp(mottle)*.45;g.fillStyle=c.mottle;g.fillRect(0,0,pw,ph);}
   g.setTransform(m);g.restore();sheet._ops+=2;},
  press(seed){
   const reg=(spec.registration??1.8)*dpr,alpha=spec.alpha??.9,grain=spec.grain??.6;
   c.speckle??=makeSpeckle(ctx,dpr);c.grain??=makeGrain(ctx,dpr);
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
   ctx.fillStyle=spec.paper;ctx.fillRect(0,0,pw,ph);
   // faint stock bands: light falling across the sheet at 45°
   ctx.save();ctx.translate(pw/2,ph/2);ctx.rotate(-Math.PI/4);ctx.fillStyle='rgba(255,246,222,.4)';const span=Math.hypot(pw,ph);for(let i=-4;i<=4;i++)ctx.fillRect(-span,i*190*dpr-40*dpr,span*2,80*dpr);ctx.restore();
   const offset=(s:number,i:number):Pt=>{const a=hash(i*7+1,s)*TAU,mag=reg*(.6+.6*hash(i*7+2,s))*(i===c.plates.length-1?.5:1);return[Math.cos(a)*mag,Math.sin(a)*mag];};
   const blend=sheet._passage.blend,u=blend?(blend.p>=1?1:easeIO(blend.p)):0;
   for(const p of c.plates){
    // speckle inside the ink: fine holes so paper shows through every field
    if(grain>0){const g=p.ctx;g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-out';g.globalAlpha=grain*.55;g.fillStyle=c.speckle;g.fillRect(0,0,pw,ph);g.restore();}
    const o=offset(seed,p.index),o2=blend?offset(seed+1,p.index):o,ox=u>=1?o2[0]:lerp(o[0],o2[0],u),oy=u>=1?o2[1]:lerp(o[1],o2[1],u);
    ctx.globalCompositeOperation='multiply';ctx.globalAlpha=alpha;ctx.drawImage(p.canvas,Math.round(ox*2)/2,Math.round(oy*2)/2);
   }
   ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.55;ctx.fillStyle=c.grain;ctx.fillRect(0,0,pw,ph);
   ctx.restore();sheet._ops+=4+c.plates.length;
  },
 };
 return sheet;
}
/** Overprint check: the multiply result of two inks on paper, for tests and ledgers. */
export function overprint(a:string,b:string,paper='#f0ece2',alpha=.9){const h=(s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const P=h(paper),A=h(a),B=h(b);const one=(d:number[],s:number[])=>d.map((v,i)=>(1-alpha)*v+alpha*(v*s[i]/255));const out=one(one(P,A),B);return '#'+out.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');}
