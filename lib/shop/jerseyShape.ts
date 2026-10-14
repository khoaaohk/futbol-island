/**
 * Jersey studio mesh (Oct 12 2026): a procedural football shirt as plain typed arrays (no three.js, so tests can build it).
 *
 * BODY (one draw call): the torso is a superellipse tube swept up a "ghost mannequin" profile (hem flare → waist → chest →
 * rounded shoulders → neck), split into a front and a back grid at the side/shoulder seams so each face has its own atlas
 * region (lib/shop/jerseyPaint.ts ATLAS). Each front column is cut at the neckline (crew dip, V, wrap V) by bisection, so the
 * neck edge is exact. Sleeves are tapered elliptical tubes whose root ring is found ON the torso surface (marched per angle),
 * so there is no hidden overlap and the armhole seam is the first ring. A static drape (hem waves, underarm bunching, elbow
 * creases, a slight flare at the sleeve ends) is baked into the positions; normals come from central differences of the
 * displaced surface. Vertex colours carry a baked AO gradient (underarms, hem, sleeve undersides).
 * `seam` (vec2: distance to the nearest seam in metres, coordinate along it) lets the shader draw creases and stitch rows.
 *
 * TRIM (one draw call): collar rib (crew / V / polo fold-down collar with placket and buttons / wrap crossover) and the
 * rib cuffs, with a `role` attribute (0 trim colour, 1 buttons) that the scene turns into vertex colours.
 */
import {torsoUv,sleeveUv,ATLAS} from './jerseyPaint';
import type {CollarStyle,SleeveStyle} from './jersey';

export interface MeshData{position:Float32Array;normal:Float32Array;uv:Float32Array;color:Float32Array;seam:Float32Array;role:Float32Array;index:Uint32Array}
export interface ShapeOpts{sleeves:SleeveStyle;collar:CollarStyle;cuffs:boolean}
type V3=[number,number,number];

const N_BODY=2.3,TB=.74,Y_SH=.62,Y_NECK=.705,NECK_A=.098,NECK_B=.082;
const KY=[0,.12,.3,.48,.62],KA=[.252,.244,.24,.262,.27],KB=[.118,.113,.115,.13,.12];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,s:number):V3=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=(a:V3)=>Math.hypot(a[0],a[1],a[2]);
const norm=(a:V3):V3=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(e0:number,e1:number,x:number)=>{const t=clamp((x-e0)/(e1-e0));return t*t*(3-2*t);};
const spow=(v:number,e:number)=>Math.sign(v)*Math.pow(Math.abs(v),e);

function catmull(ys:number[],vs:number[],y:number){
 const yy=clamp(y,ys[0],ys[ys.length-1]);let i=0;while(i<ys.length-2&&yy>ys[i+1])i++;
 const t=(yy-ys[i])/(ys[i+1]-ys[i]),p0=vs[Math.max(0,i-1)],p1=vs[i],p2=vs[i+1],p3=vs[Math.min(vs.length-1,i+2)];
 return .5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
}
interface Ring{y:number;A:number;B:number;n:number;zo:number}
function ring(tIn:number):Ring{
 const t=clamp(tIn);
 if(t<=TB){const y=Y_SH*t/TB;return{y,A:catmull(KY,KA,y)+Math.max(0,.06-y)*.08,B:catmull(KY,KB,y),n:N_BODY,zo:0};}
 const s=(t-TB)/(1-TB),q=1-s;
 return{y:q*q*.62+2*s*q*.642+s*s*Y_NECK,A:q*q*.27+2*s*q*.27+s*s*NECK_A,B:q*q*.12+2*s*q*.119+s*s*NECK_B,n:N_BODY+(2-N_BODY)*s,zo:-.012*s*s};
}
function tAtY(y:number):number{
 if(y<=Y_SH)return y/Y_SH*TB;
 let lo=TB,hi=1;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(ring(m).y<y)lo=m;else hi=m;}return(lo+hi)/2;
}
function torsoBase(th:number,t:number):V3{
 const r=ring(t),e=2/r.n;
 return[r.A*spow(Math.sin(th),e),r.y,r.B*spow(Math.cos(th),e)+r.zo];
}
function torsoFold(th:number,y:number){
 const hem=smooth(.34,0,y),side=Math.abs(Math.sin(th));
 return .0085*hem*Math.sin(th*8+.9*Math.sin(th*3+1))
  +.0024*smooth(.58,.3,y)*smooth(0,.22,y)*Math.sin(th*5+2.1+y*6)
  +.0016*smooth(.45,.62,y)*smooth(.7,.62,y)*Math.sin(th*7+.4)
  // drag folds running from the underarm down towards the middle of the chest and back
  +.0032*Math.sin((y+(1-side)*.32)*52)*smooth(.45,.9,side)*smooth(.33,.44,y)*smooth(.6,.5,y);
}
function torsoP(th:number,t:number,fold=true):V3{
 const p=torsoBase(th,t);if(!fold)return p;
 const r=ring(t),n0=norm([p[0]/(r.A*r.A),0,(p[2]-r.zo)/(r.B*r.B)]);
 return add(p,mul(n0,torsoFold(th,p[1])));
}
function insideTorso(p:V3){
 if(p[1]<0||p[1]>Y_NECK)return false;
 const r=ring(tAtY(p[1]));
 return Math.pow(Math.abs(p[0])/r.A,r.n)+Math.pow(Math.abs(p[2]-r.zo)/r.B,r.n)<1;
}
/** Neckline height at |x| on the front (the column is cut where it rises above this). */
function neckLine(collar:CollarStyle,x:number){
 const u=clamp(Math.abs(x)/NECK_A);
 if(collar==='vneck')return .555+(Y_NECK-.555)*u;
 if(collar==='wrap')return .6+(Y_NECK-.6)*u;
 return Y_NECK-(collar==='polo'?.03:.032)*(1-u*u);
}
function columnTop(th:number,collar:CollarStyle){
 if(Math.cos(th)<=1e-6)return 1;
 const ok=(t:number)=>{const p=torsoBase(th,t);return p[1]<=neckLine(collar,p[0])+1e-6;};
 if(ok(1))return 1;
 let lo=.3,hi=1;for(let k=0;k<32;k++){const m=(lo+hi)/2;if(ok(m))lo=m;else hi=m;}return lo;
}
/** Cumulative ring arc over θ ∈ [−π/2, 3π/2] at one t (memoised per t: rows share t, only neckline-cut columns add more). */
const ARC_N=100,arcTables=new Map<number,Float64Array>();
function arcTable(t:number){
 const key=Math.round(t*1e7);let tab=arcTables.get(key);if(tab)return tab;
 tab=new Float64Array(ARC_N+1);let p=torsoBase(-Math.PI/2,t);
 for(let i=1;i<=ARC_N;i++){const q=torsoBase(-Math.PI/2+2*Math.PI*i/ARC_N,t);tab[i]=tab[i-1]+len(sub(q,p));p=q;}
 if(arcTables.size>4000)arcTables.clear();arcTables.set(key,tab);return tab;
}
const arcAt=(tab:Float64Array,th:number)=>{const f=clamp((th+Math.PI/2)/(2*Math.PI))*ARC_N,i=Math.min(ARC_N-1,Math.floor(f));return tab[i]+(tab[i+1]-tab[i])*(f-i);};
const arcTheta=(t:number,a:number,b:number)=>{const tab=arcTable(t);return Math.abs(arcAt(tab,b)-arcAt(tab,a));};

// ---- rows ---------------------------------------------------------------------------------------------------------------
const HEM_Y=[0,.006,.012,.018,.024];
function torsoRows(){
 const ts=HEM_Y.map(y=>y/Y_SH*TB);
 for(let i=0;i<=30;i++)ts.push((.04+(Y_SH-.04)*i/30)/Y_SH*TB);
 for(let i=1;i<=16;i++){const s=i/16;ts.push(TB+(1-TB)*s);}
 return ts;
}

// ---- builders -----------------------------------------------------------------------------------------------------------
class Builder{
 pos:number[]=[];nor:number[]=[];uv:number[]=[];col:number[]=[];seam:number[]=[];role:number[]=[];idx:number[]=[];
 get count(){return this.pos.length/3;}
 vert(p:V3,n:V3,uv:[number,number],ao=1,seam:[number,number]=[1,0],role=0){this.pos.push(...p);this.nor.push(...n);this.uv.push(...uv);this.col.push(ao,ao,ao);this.seam.push(...seam);this.role.push(role);return this.count-1;}
 /** Quads between a cols×rows block starting at `start` (cols fastest). Winding is chosen to face along the normals. */
 grid(start:number,cols:number,rows:number){
  const id=(i:number,j:number)=>start+j*cols+i;
  // find a non-degenerate probe quad to pick the winding
  let flip=false;
  probe:for(let j=Math.floor(rows/3);j<rows-1;j++)for(let i=Math.floor(cols/3);i<cols-1;i++){
   const a=id(i,j),b=id(i+1,j),c=id(i+1,j+1);const pa=this.p(a),g=cross(sub(this.p(b),pa),sub(this.p(c),pa));
   if(len(g)<1e-9)continue;flip=dot(g,this.n(a))<0;break probe;}
  for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
   const a=id(i,j),b=id(i+1,j),c=id(i+1,j+1),d=id(i,j+1);
   if(flip)this.idx.push(a,c,b,a,d,c);else this.idx.push(a,b,c,a,c,d);
  }
 }
 p(i:number):V3{return[this.pos[i*3],this.pos[i*3+1],this.pos[i*3+2]];}
 n(i:number):V3{return[this.nor[i*3],this.nor[i*3+1],this.nor[i*3+2]];}
 /** Area-weighted normals from the triangles (for trims; consistent with their winding). */
 faceNormals(from=0){
  const acc=new Float64Array(this.count*3);
  for(let k=0;k<this.idx.length;k+=3){const [a,b,c]=[this.idx[k],this.idx[k+1],this.idx[k+2]];if(a<from)continue;
   const g=cross(sub(this.p(b),this.p(a)),sub(this.p(c),this.p(a)));for(const v of[a,b,c])for(let q=0;q<3;q++)acc[v*3+q]+=g[q];}
  for(let v=from;v<this.count;v++){const n=norm([acc[v*3],acc[v*3+1],acc[v*3+2]]);this.nor[v*3]=n[0];this.nor[v*3+1]=n[1];this.nor[v*3+2]=n[2];}
 }
 out():MeshData{return{position:new Float32Array(this.pos),normal:new Float32Array(this.nor),uv:new Float32Array(this.uv),color:new Float32Array(this.col),seam:new Float32Array(this.seam),role:new Float32Array(this.role),index:new Uint32Array(this.idx)};}
}

// ---- sleeves ------------------------------------------------------------------------------------------------------------
interface Frame{p:V3;dir:V3;u1:V3;u2:V3}
interface SleeveDef{side:1|-1;Lend:number;long:boolean;S0:V3;table:Frame[]}
const D_MIN=-.26,D_STEP=.0025;
/** The sleeve axis as a table: it leaves the shoulder at 52° from vertical and (long sleeves) turns down to 33° and slightly
 *  forward at the elbow, so the long sleeve's root is the same as the short one's. */
function sleeveDef(side:1|-1,style:SleeveStyle):SleeveDef{
 const long=style==='long',Lend=long?.585:.215,S0:V3=[side*.208,.55,-.004];
 const alphaAt=(d:number)=>(52-(long?19*smooth(.04,.28,d):0))*Math.PI/180;
 const betaAt=(d:number)=>long?.24*smooth(.2,.45,d):.03*smooth(0,.2,d);
 const frameDir=(d:number)=>{const a=alphaAt(d),b=betaAt(d),dir0:V3=[side*Math.sin(a),-Math.cos(a),0],u1:V3=[side*Math.cos(a),Math.sin(a),0];
  const dir=norm(add(mul(dir0,Math.cos(b)),[0,0,Math.sin(b)]));return{dir,u1,u2:norm(mul(cross(u1,dir),-side))};};
 const table:Frame[]=[],n=Math.ceil((Lend+.08-D_MIN)/D_STEP);
 // integrate forward from d=0 and backward to D_MIN
 const i0=Math.round(-D_MIN/D_STEP);
 for(let i=0;i<=n;i++)table.push({p:S0,...frameDir(D_MIN+i*D_STEP)});
 for(let i=i0+1;i<=n;i++){const f=frameDir(D_MIN+(i-.5)*D_STEP);table[i]={...table[i],p:add(table[i-1].p,mul(f.dir,D_STEP))};}
 for(let i=i0-1;i>=0;i--){const f=frameDir(D_MIN+(i+.5)*D_STEP);table[i]={...table[i],p:sub(table[i+1].p,mul(f.dir,D_STEP))};}
 return{side,long,Lend,S0,table};
}
function sleeveRadius(s:SleeveDef,d:number){
 if(!s.long)return .093-.016*smooth(.02,.2,d);
 if(d<.2)return .093-.017*smooth(.02,.2,d);
 if(d<.36)return .076-.012*smooth(.2,.36,d);
 return .064-.016*smooth(.36,.585,d);
}
function sleeveFrame(s:SleeveDef,d:number):Frame{
 const f=clamp((d-D_MIN)/D_STEP,0,s.table.length-1.0001),i=Math.floor(f),w=f-i,A=s.table[i],B=s.table[i+1];
 const l=(x:V3,y:V3):V3=>[x[0]+(y[0]-x[0])*w,x[1]+(y[1]-x[1])*w,x[2]+(y[2]-x[2])*w];
 return{p:l(A.p,B.p),dir:l(A.dir,B.dir),u1:l(A.u1,B.u1),u2:l(A.u2,B.u2)};
}
function sleeveP(s:SleeveDef,phi:number,d:number,d0:number,fold=true):V3{
 const f=sleeveFrame(s,d),r=sleeveRadius(s,d);
 const loc=add(mul(f.u1,-Math.cos(phi)*r),mul(f.u2,Math.sin(phi)*r*.9));
 let p=add(f.p,loc);
 if(fold){
  const under=Math.max(0,Math.cos(phi));
  let disp=.0034*Math.sin(d*55+phi*2)*under*(1-smooth(0,.12,d-d0));
  if(s.long)disp+=.0045*Math.sin(d*70+phi)*Math.exp(-(((d-.33)/.06)**2))*Math.max(0,Math.cos(phi)+.3);
  disp+=.0026*Math.sin(phi*4+1)*smooth(s.Lend-.07,s.Lend,d);
  p=add(p,mul(norm(loc),disp));
 }
 return p;
}
function sleeveRoot(s:SleeveDef,phi:number){
 let d=.12;while(d>-.2&&!insideTorso(sleeveP(s,phi,d,0,false)))d-=.004;
 let lo=d,hi=d+.004;for(let k=0;k<20;k++){const m=(lo+hi)/2;if(insideTorso(sleeveP(s,phi,m,0,false)))lo=m;else hi=m;}
 return Math.max(-.2,hi-.004);
}
const NPHI=40;
function addSleeve(B:Builder,s:SleeveDef,cuffs:boolean){
 const start=B.count,d0s:number[]=[];
 for(let i=0;i<=NPHI;i++)d0s.push(sleeveRoot(s,(i%NPHI)/NPHI*Math.PI*2));
 const J=s.long?22:8;
 const rowsFor=(d0:number)=>{const r=[0,.005,.01,.016,.024,.034].map(o=>d0+o);
  const a=d0+.046,b=s.Lend-.04;for(let j=0;j<=J;j++)r.push(a+(b-a)*j/J);
  for(const o of[.03,.024,.018,.012,.006,0])r.push(s.Lend-o);return r;};
 const rows=rowsFor(0).length,cols=NPHI+1,e=1e-4;
 const grid:number[][]=[];for(let i=0;i<cols;i++)grid.push(rowsFor(d0s[i]));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const phi=i/NPHI*Math.PI*2,d0=d0s[i],d=grid[i][j];
  const p=sleeveP(s,phi,d,d0);
  const tp=sub(sleeveP(s,phi+e,d,d0),sleeveP(s,phi-e,d,d0)),td=sub(sleeveP(s,phi,d+e,d0),sleeveP(s,phi,d-e,d0));
  let n=norm(cross(tp,td));const f=sleeveFrame(s,d);if(dot(n,sub(p,f.p))<0)n=mul(n,-1);
  const r=sleeveRadius(s,d),under=Math.cos(phi);
  const seams:[number,number][]=[[d-d0,phi*.11],[Math.min(phi,Math.PI*2-phi)*r*.95,d]];
  if(!cuffs)seams.push([Math.abs(s.Lend-.012-d),phi*.11]);
  const seam=seams.reduce((m,x)=>x[0]<m[0]?x:m);
  const ao=(.93+.07*(1-under)/2)*(1-.3*Math.pow(Math.max(0,under),1.5)*(1-smooth(0,.1,d-d0)));
  B.vert(p,n,sleeveUv(s.side,s.Lend-d,phi/(Math.PI*2)*ATLAS.sleeveCirc*.98+.004),ao,seam);
 }
 B.grid(start,cols,rows);
 return d0s;
}

// ---- torso --------------------------------------------------------------------------------------------------------------
const NCOL=56;
function addTorso(B:Builder,face:'front'|'back',collar:CollarStyle,sleeves:SleeveDef[]){
 const start=B.count,rows=torsoRows(),cols=NCOL+1,e=1e-4,th0=face==='front'?-Math.PI/2:Math.PI/2;
 const tops:{th:number;t:number}[]=[];
 for(let i=0;i<cols;i++){const th=th0+Math.PI*i/NCOL;tops.push({th,t:face==='front'?columnTop(th,collar):1});}
 const remap=(t:number,tmax:number)=>{if(tmax>=1)return t;const tc=Math.min(.5,tmax*.75);return t<=tc?t:tc+(t-tc)*(tmax-tc)/(1-tc);};
 // profile arc (h) per column, accumulated row by row
 const hAcc=new Float64Array(cols),prevT=new Float64Array(cols);
 for(let j=0;j<rows.length;j++)for(let i=0;i<cols;i++){
  const {th,t:tmax}=tops[i],t=remap(rows[j],tmax);
  if(j>0){let q=torsoBase(th,prevT[i]);const n=Math.max(1,Math.ceil((t-prevT[i])/.01));for(let k=1;k<=n;k++){const r=torsoBase(th,prevT[i]+(t-prevT[i])*k/n);hAcc[i]+=len(sub(r,q));q=r;}}
  prevT[i]=t;const h=hAcc[i];
  const p=torsoP(th,t);
  const tth=sub(torsoP(th+e,t),torsoP(th-e,t)),tt=sub(torsoP(th,Math.min(1,t+e)),torsoP(th,Math.max(0,t-e)));
  let n=norm(cross(tt,tth));const rr=ring(t);if(dot(n,[p[0],0,p[2]-rr.zo])<0)n=mul(n,-1);
  // panel coordinates: arc from the face centre (signed so +x is the viewer's right on that face) and the side-seam distance
  const centre=face==='front'?0:Math.PI;
  const sArc=arcTheta(t,centre,th)*(face==='front'?Math.sign(th):(th<Math.PI?-1:1));
  const side=face==='front'?(th>=0?Math.PI/2:-Math.PI/2):(th<Math.PI?Math.PI/2:Math.PI*1.5);
  const sideDist=arcTheta(t,th,side);
  const hemDist=Math.abs(h-.012);
  const seam:[number,number]=hemDist<sideDist?[hemDist,sArc]:[sideDist,h];
  // baked AO: lighter up top, darker hem; underarm shadow next to each sleeve root
  let ao=.87+.13*smooth(0,.6,p[1]);
  for(const s of sleeves){const dS=len(sub(p,[s.S0[0]*.97,s.S0[1]-.03,s.S0[2]]));ao*=1-.42*smooth(.2,.1,dS)*(p[1]<s.S0[1]+.02?1:.45);}
  if(face==='back')ao*=1-.06*smooth(.5,.68,p[1])*smooth(.15,0,Math.abs(p[0]));
  B.vert(p,n,torsoUv(face,sArc,h),ao,seam);
 }
 B.grid(start,cols,rows.length);
 // the neck edge (top row) for the collar
 const top:{p:V3;n:V3;up:V3;th:number}[]=[];
 for(let i=0;i<cols;i++){const v=start+(rows.length-1)*cols+i,{th,t}=tops[i];
  top.push({p:B.p(v),n:B.n(v),up:norm(sub(torsoP(th,t),torsoP(th,Math.max(0,t-.01)))),th});}
 return top;
}

// ---- trims ---------------------------------------------------------------------------------------------------------------
/** Band cross-section: [along the band's up, along the surface normal, down the shirt surface away from the edge]. */
type Profile=([number,number]|[number,number,number])[];
/** A swept band: points[i] + D*ct + N*cn for each profile point; u = rib count along the band, v = across. */
function addBand(B:Builder,pts:{p:V3;n:V3;up:V3;down?:V3}[],closed:boolean,profileAt:(i:number)=>Profile,role=0,lift=0){
 const start=B.count,m=profileAt(0).length;let arc=0;
 const count=pts.length+(closed?1:0);
 for(let i=0;i<count;i++){
  const k=i%pts.length,q=pts[k];
  if(i>0)arc+=len(sub(q.p,pts[(i-1)%pts.length].p));
  const prof=profileAt(k);
  prof.forEach(([ct,cn,cf=0],j)=>B.vert(add(add(add(q.p,mul(q.up,ct)),mul(q.n,cn+lift)),mul(q.down??q.up,q.down?cf:0)),q.n,[arc/.0032,j/(m-1)],1,[1,0],role));
 }
 const id=(i:number,j:number)=>start+i*m+j;
 for(let i=0;i<count-1;i++)for(let j=0;j<m-1;j++)B.idx.push(id(i,j),id(i+1,j),id(i+1,j+1),id(i,j),id(i+1,j+1),id(i,j+1));
}
function ribProfile(h:number):Profile{return[[-.009,-.0022],[h*.45,-.0026],[h-.0022,-.0022],[h,.0002],[h-.0022,.0028],[h*.45,.0032],[-.009,.0028]];}

function addCollar(B:Builder,collar:CollarStyle,front:ReturnType<typeof addTorso>,back:ReturnType<typeof addTorso>){
 const loop=[...front,...back.slice(1,-1)];
 const lean=collar==='crew'?1.2:collar==='polo'?1.6:.8;
 const pts=loop.map(q=>({p:q.p,n:q.n,up:norm(add(q.up,[0,lean,0])),down:mul(q.up,-1) as V3,th:q.th}));
 // re-orthogonalise N against the band direction so the rib keeps its thickness
 for(const q of pts){q.n=norm(sub(q.n,mul(q.up,dot(q.n,q.up))));}
 if(collar==='polo'){
  const centre=pts.reduce((b,q,i)=>Math.abs(q.th)<Math.abs(pts[b].th)?i:b,0);
  const open:typeof pts=[];for(let k=1;k<pts.length;k++){const q=pts[(centre+k)%pts.length];if(Math.abs(q.p[0])>=.014||Math.cos(q.th)<0)open.push(q);}
  // keep the run between the two front gaps
  addBand(B,open,false,i=>{const q=open[i],L=.042+.03*Math.pow(Math.max(0,Math.cos(q.th)),3);
   // stand up from the neck edge, fold over, then lie on the shoulders/chest ~7 mm above the cloth; pointed tips at the front
   return[[-.009,-.0022,0],[.016,-.0022,0],[.0205,.0008,0],[.019,.0052,0],[.012,.0068,.008],[.005,.0074,.02],[0,.0072,L*.7],[0,.0066,L],[0,.0036,L+.002],[0,.0024,L-.008]];});
  addPlacket(B);
 }else{
  const h=collar==='crew'?.021:.019;
  addBand(B,pts,true,()=>ribProfile(h));
  if(collar==='wrap'){
   // the envelope crossover: the wearer's-left arm of the V carries on past the point, over the other arm
   const left=pts.filter(q=>Math.cos(q.th)>0&&q.p[0]>=0&&q.p[1]<.66).sort((a,b)=>b.p[1]-a.p[1]);
   if(left.length>=2){const c=left[left.length-1],prev=left[left.length-2],dir=norm(sub(c.p,prev.p));
    const ext=[1,2,3].map(k=>({p:add(c.p,mul(dir,.009*k)),n:c.n,up:c.up}));
    addBand(B,[...left.slice(-5),...ext],false,()=>ribProfile(h),0,.0034);}
  }
 }
}
function surfaceAt(x:number,y:number):{p:V3;n:V3}{
 const t=tAtY(y);let lo=-Math.PI/2,hi=Math.PI/2;
 for(let k=0;k<40;k++){const m=(lo+hi)/2;if(torsoP(m,t)[0]<x)lo=m;else hi=m;}
 const th=(lo+hi)/2,e=1e-4,p=torsoP(th,t);
 let n=norm(cross(sub(torsoP(th,Math.min(1,t+e)),torsoP(th,t-e)),sub(torsoP(th+e,t),torsoP(th-e,t))));if(n[2]<0)n=mul(n,-1);
 return{p,n};
}
function addPlacket(B:Builder){
 const start=B.count,ys=[.672,.655,.635,.615,.595,.575,.56],xs=[-.017,-.006,.006,.017];
 for(const y of ys)for(const x of xs){const s=surfaceAt(x,y);B.vert(add(s.p,mul(s.n,.0024)),s.n,[x/.0032,y*10],1,[1,0],0);}
 const id=(i:number,j:number)=>start+j*xs.length+i;
 for(let j=0;j<ys.length-1;j++)for(let i=0;i<xs.length-1;i++)B.idx.push(id(i,j),id(i,j+1),id(i+1,j+1),id(i,j),id(i+1,j+1),id(i+1,j));
 // side walls down into the shirt
 for(const i of[0,xs.length-1]){const w=B.count;for(const y of ys){const s=surfaceAt(xs[i],y);B.vert(add(s.p,mul(s.n,.0024)),s.n,[0,0]);B.vert(add(s.p,mul(s.n,-.001)),s.n,[0,1]);}
  for(let j=0;j<ys.length-1;j++){const a=w+j*2;if(i===0)B.idx.push(a,a+1,a+3,a,a+3,a+2);else B.idx.push(a,a+3,a+1,a,a+2,a+3);}}
 // buttons: little discs with a domed top
 for(const y of[.643,.6]){const s=surfaceAt(0,y),c=add(s.p,mul(s.n,.0026)),t1=norm(cross(s.n,[1,0,0])),t2=cross(t1,s.n),seg=14,r=.0058;
  const b=B.count;B.vert(add(c,mul(s.n,.0028)),s.n,[0,0],1,[1,0],1);
  for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2,o=add(mul(t1,Math.cos(a)*r),mul(t2,Math.sin(a)*r));B.vert(add(add(c,o),mul(s.n,.0016)),s.n,[0,0],1,[1,0],1);B.vert(add(c,o),s.n,[0,0],1,[1,0],1);}
  for(let k=0;k<seg;k++){const i0=b+1+k*2,i1=b+1+((k+1)%seg)*2;B.idx.push(b,i0,i1,i0,i0+1,i1+1,i0,i1+1,i1);}
 }
}
function addCuff(B:Builder,s:SleeveDef,d0s:number[]){
 const pts:{p:V3;n:V3;up:V3}[]=[],prof:Profile=[[-.037,-.0012],[-.034,.0026],[-.006,.003],[.0006,.0016],[.0022,-.0004],[.0006,-.0026],[-.012,-.003]];
 const start=B.count,m=prof.length;
 for(let i=0;i<=NPHI;i++){const phi=i/NPHI*Math.PI*2,r=sleeveRadius(s,s.Lend);
  prof.forEach(([ct,cn],j)=>{const d=s.Lend+ct,f=sleeveFrame(s,d),p=sleeveP(s,phi,d,d0s[i]),rad=norm(sub(p,f.p));B.vert(add(p,mul(rad,cn)),rad,[phi*r/.0032,j/(m-1)]);});}
 for(let i=0;i<NPHI;i++)for(let j=0;j<m-1;j++){const a=start+i*m+j,b=start+(i+1)*m+j;B.idx.push(a,b,b+1,a,b+1,a+1);}
 void pts;
}

/** Concatenates meshes (index offsets fixed up). */
function merge(parts:MeshData[]):MeshData{
 const sum=(k:keyof MeshData)=>parts.reduce((n,p)=>n+p[k].length,0);
 const out:MeshData={position:new Float32Array(sum('position')),normal:new Float32Array(sum('normal')),uv:new Float32Array(sum('uv')),color:new Float32Array(sum('color')),seam:new Float32Array(sum('seam')),role:new Float32Array(sum('role')),index:new Uint32Array(sum('index'))};
 const o={position:0,normal:0,uv:0,color:0,seam:0,role:0,index:0};let base=0;
 for(const p of parts){
  for(const k of['position','normal','uv','color','seam','role'] as const){(out[k] as Float32Array).set(p[k] as Float32Array,o[k]);o[k]+=p[k].length;}
  for(let i=0;i<p.index.length;i++)out.index[o.index+i]=p.index[i]+base;
  o.index+=p.index.length;base+=p.position.length/3;
 }
 return out;
}
// The torso (+ its collar) depends only on the collar; the sleeves (+ cuffs) only on the sleeve style and cuffs (both use the
// same shoulder root), so a style change rebuilds just one half. Each half is memoised.
const torsoCache=new Map<CollarStyle,{body:MeshData;trim:MeshData}>(),sleeveCache=new Map<string,{body:MeshData;trim:MeshData}>();
function torsoPart(collar:CollarStyle){
 let hit=torsoCache.get(collar);if(hit)return hit;
 const body=new Builder(),trim=new Builder(),sl=[sleeveDef(1,'short'),sleeveDef(-1,'short')];
 const front=addTorso(body,'front',collar,sl),back=addTorso(body,'back',collar,sl);
 addCollar(trim,collar,front,back);trim.faceNormals();
 hit={body:body.out(),trim:trim.out()};torsoCache.set(collar,hit);return hit;
}
function sleevePart(style:SleeveStyle,cuffs:boolean){
 const key=`${style}|${cuffs}`;let hit=sleeveCache.get(key);if(hit)return hit;
 const body=new Builder(),trim=new Builder();
 for(const side of[1,-1] as const){const s=sleeveDef(side,style),d0s=addSleeve(body,s,cuffs);if(cuffs)addCuff(trim,s,d0s);}
 trim.faceNormals();
 hit={body:body.out(),trim:trim.out()};sleeveCache.set(key,hit);return hit;
}
const cache=new Map<string,{body:MeshData;trim:MeshData}>();
/** Builds (and memoises per style) the body and trim meshes. */
export function buildJersey(o:ShapeOpts):{body:MeshData;trim:MeshData}{
 const key=`${o.sleeves}|${o.collar}|${o.cuffs}`;const hit=cache.get(key);if(hit)return hit;
 const t=torsoPart(o.collar),sl=sleevePart(o.sleeves,o.cuffs);
 const out={body:merge([t.body,sl.body]),trim:merge([t.trim,sl.trim])};
 if(cache.size>8)cache.clear();
 cache.set(key,out);return out;
}
