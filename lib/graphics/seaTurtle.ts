import * as T from 'three';

/**
 * Realistic low-poly green sea turtle (Oct 21 2026, user: "turtles need to be more realistic"). ONE builder for every turtle on the
 * island: the Explore room's turtles (diveRoom.ts school), the zone friend Shelly (friendParts, 'mid' detail), the surfacing turtles by
 * Turtle Pool (zoneLife.ts) and the shore shallows' clear-window turtles (clearCreatures.ts → clearWindow.ts).
 *
 * Model: facing −X (head), +Y up, centred near the origin, shell SEA_TURTLE.shell units long. A lofted, domed, teardrop carapace (wider
 * at the shoulders, a pointed rear, a lip at the rim), its scutes painted in VERTEX COLOURS (5 vertebral, 4 costal a side, marginals
 * round the rim: dark seams, a warm light centre per scute) with subtle ridges (scute centres raised, the vertebral keel); a cream
 * plastron; a rounded head with a horn beak, two eyes with a highlight, nostrils and a gentle smile on a neck that can extend; two long
 * curved leaf-shaped front flippers (thick leading edge, claw), two shorter broad hind flippers, a small tail. No texture.
 *
 * LOD: `seaTurtleGeometry()` is ONE geometry holding three bands (aTw.w = 0 full ≤ ~450 triangles, 1 low ~160 beyond 14 m, 2 a far
 * silhouette ~30 beyond 40 m). The vertex shader keeps only the band each INSTANCE wants (stKeep) and collapses the rest to a point,
 * so an instanced draw picks its LOD per instance with NO extra draw call.
 *
 * Animation (vertex shader only, SEA_TURTLE_GLSL stPose): aTw = (part, weight along the limb, 0, lod band). Part 0 = not a turtle
 * (untouched; other creatures sharing a material carry zeros), 1 body, 2 front flipper, 3 hind flipper, 4 head and neck, 5 tail.
 * A 4 s cycle: a slow powerful figure-8 front stroke (the blade bends along its length and feathers), a glide with the flippers
 * swept back, hind-flipper trim, body pitch / tiny roll / heave with each stroke, a head bob and a slow neck stretch. `k` (0..1)
 * scales it all: 0 is the still pose (heat tier 3-4, Battery saver, reduced motion).
 */
export const SEA_TURTLE={shell:.62,head:.1,front:.44,hind:.2,lodNear:14,lodFar:40} as const;
export type TurtleDetail='full'|'mid'|'low'|'far';
type V=[number,number,number];
type Out={pos:number[];nor:number[];col:number[];tw:number[]};
const rgb=(h:string):V=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
const mixC=(a:V,b:V,k:number):V=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a:V,b:V):V=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a:V,k:number):V=>[a[0]*k,a[1]*k,a[2]*k];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=(a:V):V=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};

const C={
 scute:['#6f7a3e','#7b723c','#667545','#80793f','#727040'].map(rgb),seam:rgb('#463f22'),glow:rgb('#b39a55'),
 marg:[rgb('#5d6836'),rgb('#7f7a46')],rim:rgb('#c9bb7c'),plas:rgb('#eadfa2'),plasSeam:rgb('#cdbf80'),
 skin:rgb('#8f9862'),skinDark:rgb('#6a6a3a'),scale:rgb('#857c45'),cream:rgb('#e4d9a0'),beak:rgb('#a8975c'),
 eye:rgb('#24180f'),shine:rgb('#ffffff'),mouth:rgb('#3a2918'),
 flip:['#6b6a3b','#878150','#5d5b34'].map(rgb),flipSpot:rgb('#a69e64'),flipEdge:rgb('#cbbf86'),flipUnder:rgb('#e0d49c'),claw:rgb('#d9cd9b'),
};

/** One part: shared vertices (smooth normals within the part), faces with per-corner colours. */
class Part{
 v:V[]=[];f:{i:[number,number,number];c:[V,V,V]}[]=[];tw:[number,number][]=[];
 constructor(public part:number){}
 vert(p:V,w=0){this.v.push(p);this.tw.push([this.part,w]);return this.v.length-1;}
 /** A face, wound so its normal points away from `ref` (a point inside the part). */
 face(a:number,b:number,c:number,ca:V,cb:V,cc:V,ref:V){
  const n=cross(sub(this.v[b],this.v[a]),sub(this.v[c],this.v[a])),m=mul(add(add(this.v[a],this.v[b]),this.v[c]),1/3);
  if(dot(n,sub(m,ref))<0)this.f.push({i:[a,c,b],c:[ca,cc,cb]});else this.f.push({i:[a,b,c],c:[ca,cb,cc]});
 }
 emit(o:Out,lod:number,smooth=true){
  const vn:V[]=this.v.map(()=>[0,0,0]);
  for(const {i} of this.f){const n=cross(sub(this.v[i[1]],this.v[i[0]]),sub(this.v[i[2]],this.v[i[0]]));for(const k of i)vn[k]=add(vn[k],n);}
  for(const {i,c} of this.f){const fn=norm(cross(sub(this.v[i[1]],this.v[i[0]]),sub(this.v[i[2]],this.v[i[0]])));
   for(let k=0;k<3;k++){const p=this.v[i[k]],n=smooth?norm(vn[i[k]]):fn;o.pos.push(...p);o.nor.push(...n);o.col.push(...c[k]);o.tw.push(this.tw[i[k]][0],this.tw[i[k]][1],0,lod);}}
 }
}
/**
 * Loft rings (each `m` points, closed) into a tube; `front` / `back` poles close the ends (fans). `col(face ring i, around j, corner
 * ring, corner around)` paints each corner; ring indices: −1 front pole, rings.length back pole.
 */
function loft(P:Part,rings:number[][],centres:V[],front:number|null,back:number|null,col:(fi:number,fj:number,ci:number,cj:number)=>V){
 const m=rings[0].length;
 for(let i=0;i+1<rings.length;i++)for(let j=0;j<m;j++){const j1=(j+1)%m,ref=mul(add(centres[i],centres[i+1]),.5),a=rings[i][j],b=rings[i][j1],c=rings[i+1][j1],d=rings[i+1][j];
  P.face(a,b,c,col(i,j,i,j),col(i,j,i,j1),col(i,j,i+1,j1),ref);P.face(a,c,d,col(i,j,i,j),col(i,j,i+1,j1),col(i,j,i+1,j),ref);}
 const L=rings.length;
 if(front!==null)for(let j=0;j<m;j++){const j1=(j+1)%m;P.face(front,rings[0][j],rings[0][j1],col(-1,j,-1,0),col(-1,j,0,j),col(-1,j,0,j1),centres[0]);}
 if(back!==null)for(let j=0;j<m;j++){const j1=(j+1)%m;P.face(back,rings[L-1][j1],rings[L-1][j],col(L-1,j,L,0),col(L-1,j,L-1,j1),col(L-1,j,L-1,j),centres[L-1]);}
}

const DETAIL={
 full:{nu:10,top:8,bot:3,head:[0,1,2,3,4,5],hm:8,eye:true,nose:true,smile:true,front:[0,.15,.35,.55,.75,.9],fsec:4,claw:true,hind:[0,.45,.85],tail:true},
 mid:{nu:8,top:8,bot:3,head:[0,2,3,5],hm:8,eye:true,nose:false,smile:true,front:[0,.25,.5,.75,.9],fsec:4,claw:false,hind:[0,.6],tail:false},
 low:{nu:6,top:6,bot:2,head:[1,3,5],hm:6,eye:false,nose:false,smile:false,front:[0,.45,.85],fsec:3,claw:false,hind:[0,.6],tail:false},
 far:{nu:3,top:2,bot:2,head:[3],hm:3,eye:false,nose:false,smile:false,front:[0],fsec:3,claw:false,hind:[0],tail:false},
} as const;
/** Head stations: x, centre y, half width, half height (units; the skull is s2..pole, SEA_TURTLE.head long). */
const HEAD:[number,number,number,number][]=[[-.24,0,.055,.045],[-.3,.005,.05,.042],[-.335,.015,.053,.05],[-.37,.02,.056,.052],[-.402,.015,.046,.042],[-.425,.005,.028,.03]];
const HEAD_TIP:V=[-.437,0,0];
const shellX=(u:number)=>-.3+SEA_TURTLE.shell*u;
const shellW=(u:number)=>.25*Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.55)*(1-.18*u);
const shellH=(u:number)=>.13*Math.pow(Math.sin(Math.PI*Math.pow(u,.9)),.6);
const shellD=(u:number)=>.06*Math.pow(Math.sin(Math.PI*u),.5);

function shell(o:Out,d:typeof DETAIL[TurtleDetail],lod:number){
 const P=new Part(1),{nu,top,bot}=d,m=top+bot,rings:number[][]=[],centres:V[]=[];
 const mid=top/2,us:number[]=[];for(let i=1;i<nu;i++)us.push(i/nu);
 // Which scute a top column belongs to: 'm' marginal (the rim columns), 'v' vertebral (the middle two), 'c' costal.
 const kind=(j:number)=>top<4?'v':j===0||j===top-1?'m':Math.abs(j+.5-mid)<1?'v':'c';
 const span=(j:number):[number,number]=>kind(j)==='m'?(j===0?[0,1]:[top-1,top]):kind(j)==='v'?[mid-1,mid+1]:j<mid?[1,mid-1]:[mid+1,top-1];
 const rows=(k:string)=>k==='v'?5:k==='c'?4:nu;
 // 0 on a scute's seam .. 1 at its centre, for a corner (u, column k) of a face in column j.
 const inner=(j:number,u:number,k:number)=>{const kd=kind(j),n=rows(kd),s=Math.min(n-1,Math.floor(((u+0)*n)+1e-6)),[k0,k1]=span(j);
  const du=Math.min(u-s/n,(s+1)/n-u)*nu,dk=Math.min(k-k0,k1-k);return Math.max(0,Math.min(1,Math.min(du,dk)));};
 for(let i=0;i<us.length;i++){const u=us[i],x=shellX(u),w=shellW(u),h=shellH(u),dd=shellD(u),r:number[]=[];
  for(let k=0;k<=top;k++){const a=k/top*Math.PI,rim=k===0||k===top;let z=w*Math.cos(a)*(rim?1.05:1),y=rim?-.03*h:h*Math.pow(Math.sin(a),.7);
   // Ridges: the vertebral keel and each scute's centre stand a touch proud of the seams.
   if(!rim&&top>=6){const j=Math.min(top-1,k),cIn=Math.max(inner(j,u,k),inner(Math.max(0,k-1),u,k));y+=(.004+(k===mid?.004:0))*cIn-.002*(1-cIn);}
   if(top<6&&!rim)z*=.8;
   r.push(P.vert([x,y,z]));}
  for(let b=1;b<bot;b++){const z=-w*.6*Math.cos(Math.PI*b/bot);r.push(P.vert([x,-dd*(.85+.15*Math.sin(Math.PI*b/bot)),z]));}
  rings.push(r);centres.push([x,(h-dd)*.3,0]);}
 const front=P.vert([shellX(0)-.01,.0,0]),back=P.vert([shellX(1)+.01,-.005,0]);
 const uAt=(ci:number)=>ci<0?0:ci>=us.length?1:us[ci];
 loft(P,rings,centres,front,back,(fi,fj,ci,cj)=>{
  const u=uAt(ci),uf=fi<0?.5/nu:fi>=us.length-1&&ci===us.length?1-.5/nu:(uAt(fi)+uAt(fi+1))/2;
  if(fj>=top){// plastron: cream, faint seams at the rim and down the middle
   const k=cj>top?cj-top:0;return cj===0||cj===top||ci<0||ci>=us.length?C.plasSeam:mixC(C.plas,C.plasSeam,k===Math.floor(bot/2)&&bot%2===0?.6:hash(Math.floor(u*6)+k)*.25);}
  const kd=kind(fj),n=rows(kd),s=Math.min(n-1,Math.floor(uf*n));
  if(kd==='m'){const base=C.marg[s%2];return cj===0||cj===top?C.rim:ci<0||ci>=us.length?C.seam:mixC(C.seam,base,.75);}
  const base=C.scute[(s*3+(kd==='v'?0:fj<mid?1:2))%C.scute.length];
  if(ci<0||ci>=us.length)return mixC(C.seam,base,.5);
  const t=inner(fj,u,cj);return t<.5?mixC(C.seam,base,.35+t):mixC(base,C.glow,.55*t);
 });
 P.emit(o,lod);
}

function head(o:Out,d:typeof DETAIL[TurtleDetail],lod:number){
 const P=new Part(4),m=d.hm,rings:number[][]=[],centres:V[]=[],sts=d.head.map(i=>HEAD[i]);
 sts.forEach(([x,cy,hw,hh],si)=>{const r:number[]=[],w=Math.min(1,Math.max(0,(x+.24)/-.08));
  for(let j=0;j<m;j++){const a=j/m*Math.PI*2,s=Math.sin(a);r.push(P.vert([x,cy+hh*s*(s<0?.8:1),hw*Math.cos(a)],w));}
  rings.push(r);centres.push([x,cy,0]);void si;});
 const tip=P.vert(HEAD_TIP,1),last=sts.length-1;
 loft(P,rings,centres,null,tip,(fi,fj,ci,cj)=>{
  const s=ci>last?0:Math.sin(cj/m*Math.PI*2),x=ci>last?HEAD_TIP[0]:sts[ci][0];
  if(x<-.415)return s<-.2?mixC(C.beak,C.cream,.4):C.beak;
  if(s<-.25)return C.cream;
  if(x>-.31)return mixC(C.skin,C.cream,s<.2?.4:0);
  // Head scales: a darker cap of plates on top, lighter between.
  return hash(fi*13+fj*7)>.5?C.scale:mixC(C.skinDark,C.scale,s>.6?.2:.6);});
 P.emit(o,lod);
 const F=new Part(4),ex=-.384,ey=.034,ez=.05;
 for(const sd of [-1,1]){
  if(d.eye){// a little pyramid eye (dark) and a white highlight just in front of it
   const out=norm([-.3,.35,sd]),up=norm(cross(out,[0,0,1])),side=cross(out,up),c0:V=[ex,ey,sd*ez],r=.013;
   const b=[0,1,2,3].map(q=>F.vert(add(c0,add(mul(up,r*Math.cos(q*Math.PI/2)),mul(side,r*Math.sin(q*Math.PI/2)))),1)),ap=F.vert(add(c0,mul(out,.011)),1);
   for(let q=0;q<4;q++)F.face(b[q],b[(q+1)%4],ap,C.eye,C.eye,C.eye,sub(c0,mul(out,.02)));
   const h0=add(add(c0,mul(out,.0125)),add(mul(up,.004),[-.003,0,0])),h=[F.vert(h0,1),F.vert(add(h0,mul(up,.005)),1),F.vert(add(h0,[-.005,.002,0]),1)];
   F.face(h[0],h[1],h[2],C.shine,C.shine,C.shine,c0);
  }else if(lod===1){const a=F.vert([ex-.006,ey+.004,sd*(ez+.006)],1),b=F.vert([ex+.008,ey+.002,sd*(ez+.004)],1),c=F.vert([ex,ey-.008,sd*(ez+.003)],1);F.face(a,b,c,C.eye,C.eye,C.eye,[ex,ey,0]);}
  if(d.nose){const a=F.vert([-.431,.021,sd*.008],1),b=F.vert([-.427,.024,sd*.013],1),c=F.vert([-.426,.018,sd*.012],1);F.face(a,b,c,C.mouth,C.mouth,C.mouth,[-.41,.0,0]);}
  if(d.smile){// a thin dark line from the beak tip back along the jaw, turning up at the corner: a gentle smile
   const pts:V[]=[[-.434,-.006,sd*.012],[-.414,-.009,sd*.03],[-.398,-.001,sd*.044]],th=.0035,q=pts.map(p=>[F.vert(add(p,[0,th,sd*.002]),1),F.vert(add(p,[0,-th,sd*.002]),1)]);
   for(let k=0;k<2;k++)F.face(q[k][0],q[k+1][0],q[k+1][1],C.mouth,C.mouth,C.mouth,[-.41,-.005,0]),F.face(q[k][0],q[k+1][1],q[k][1],C.mouth,C.mouth,C.mouth,[-.41,-.005,0]);
  }
 }
 F.emit(o,lod,false);
}

/** A flipper blade: a curved leading edge (span from `root`, the sweep angle easing from a0 to a1), leaf chord, thick leading edge. */
function flipper(o:Out,lod:number,part:number,sd:number,root:V,len:number,a0:number,a1:number,chord:(t:number)=>number,thick:(t:number)=>number,ts:readonly number[],sec:number,claw:boolean){
 const P=new Part(part),rings:number[][]=[],centres:V[]=[];
 const at=(t:number):{c:V;s:V;l:V}=>{let p:V=[...root],s:V=[0,0,1];const n=24;for(let k=0;k<n;k++){const tt=(k+.5)/n*t,a=a0+(a1-a0)*Math.pow(tt,1.5);s=[Math.sin(a),-.05,Math.cos(a)*sd];p=add(p,mul(s,len*t/n));}
  const a=a0+(a1-a0)*Math.pow(t,1.5);s=norm([Math.sin(a),0,Math.cos(a)*sd]);return {c:p,s,l:norm([-Math.abs(s[2]),0,s[0]*sd])};};
 for(const t of ts){const {c,l}=at(t),ch=chord(t),th=thick(t),r:number[]=[];
  const pts:V[]=sec===4?[c,add(sub(c,mul(l,ch*.22)),[0,th*.5,0]),sub(c,mul(l,ch)),add(sub(c,mul(l,ch*.22)),[0,-th*.4,0])]:[add(c,[0,th*.15,0]),add(sub(c,mul(l,ch*.3)),[0,th*.45,0]),sub(c,mul(l,ch))];
  for(const p of pts)r.push(P.vert(p,t));rings.push(r);centres.push(add(sub(c,mul(l,ch*.35)),[0,0,0]));}
 const tipT=at(1),tip=P.vert(sub(tipT.c,mul(tipT.l,chord(1)*.3)),1),m=sec;
 // Mottled tops (per-face shade + a light spot at the ridge), a pale trailing margin, a cream underside.
 loft(P,rings,centres,null,tip,(fi,fj,ci,cj)=>{const under=sec===4?fj>=2:fj===2;
  if(under)return C.flipUnder;const e=cj===2;return e?C.flipEdge:cj===1&&hash(fi*5+fj+part*3+sd)>.45?C.flipSpot:C.flip[Math.floor(hash(fi*7+fj*3+part+sd*11)*3)];});
 void m;P.emit(o,lod);
 if(claw){const {c,s,l}=at(.5),Q=new Part(part),a=Q.vert(sub(c,mul(s,.012)),.5),b=Q.vert(add(c,mul(s,.012)),.5),k=Q.vert(add(add(c,mul(l,.02)),mul(s,.01)),.5);
  Q.face(a,b,k,C.claw,C.claw,C.claw,[c[0],c[1]-1,c[2]]);Q.face(a,k,b,C.claw,C.claw,C.claw,[c[0],c[1]+1,c[2]]);Q.emit(o,lod,false);}
}

function tail(o:Out,lod:number){const P=new Part(5),b=[[.29,-.005,0],[.29,-.035,.018],[.29,-.035,-.018]].map(p=>P.vert(p as V,0)),tip=P.vert([.37,-.035,0],1),ref:V=[.31,-.025,0];
 P.face(b[0],b[1],tip,C.skin,C.skin,C.skinDark,ref);P.face(b[1],b[2],tip,C.cream,C.cream,C.skinDark,ref);P.face(b[2],b[0],tip,C.skin,C.skin,C.skinDark,ref);P.face(b[0],b[2],b[1],C.skin,C.skin,C.skin,[.36,-.025,0]);P.emit(o,lod);}

function build(o:Out,detail:TurtleDetail,lod:number){
 const d=DETAIL[detail];shell(o,d,lod);head(o,d,lod);
 for(const sd of [-1,1]){
  flipper(o,lod,2,sd,[-.17,-.02,.19*sd],SEA_TURTLE.front,.32,.75,t=>.068+.05*Math.sin(Math.PI*Math.pow(t,.7))-.03*t,t=>.034-.026*t,d.front,d.fsec,d.claw);
  flipper(o,lod,3,sd,[.22,-.035,.1*sd],SEA_TURTLE.hind,.8,1.05,t=>.075+.04*Math.sin(Math.PI*t)-.02*t,t=>.02-.012*t,d.hind,d.fsec,false);
 }
 if(d.tail)tail(o,lod);
}
function toGeometry(o:Out,withAW=true){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(o.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(o.nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(o.col,3));g.setAttribute('aTw',new T.Float32BufferAttribute(o.tw,4));
 // aW: the clear window's generic flap weight (its LIFE_HEAD declares it for every kind); the turtle's own motion is aTw.
 if(withAW){const w=new Float32Array(o.tw.length/4);for(let i=0;i<w.length;i++)w[i]=o.tw[i*4]===2||o.tw[i*4]===3?o.tw[i*4+1]:0;g.setAttribute('aW',new T.BufferAttribute(w,1));}
 g.computeBoundingSphere();return g;
}
const out=():Out=>({pos:[],nor:[],col:[],tw:[]});
/** The instanced turtle: three LOD bands in one geometry (aTw.w 0 / 1 / 2), non-indexed, vertex-coloured. */
export function seaTurtleGeometry():T.BufferGeometry{const o=out();build(o,'full',0);build(o,'low',1);build(o,'far',2);return toGeometry(o);}
/** One band on its own (tests, the friend): aTw.w is `lod`. */
export function seaTurtleBand(detail:TurtleDetail):T.BufferGeometry{const o=out();build(o,detail,detail==='full'||detail==='mid'?0:detail==='low'?1:2);return toGeometry(o,false);}
/** Measured proportions of a band (units): shell length / width, head (skull) length, front and hind flipper lengths. */
export function seaTurtleProportions(){return {shell:SEA_TURTLE.shell,shellWidth:2*Math.max(...Array.from({length:50},(_,i)=>shellW((i+.5)/50)))*1.05,head:-.335-HEAD_TIP[0],front:SEA_TURTLE.front,hind:SEA_TURTLE.hind};}

/**
 * The shared shader library. Declares aTw; stKeep(d, minLod) → 1 to draw this vertex's LOD band for an instance d m from the camera
 * (minLod 1 = the low band only: heat tier 2+), stPose(p, n, t, phase, k) poses a vertex and its normal in model space.
 */
export const SEA_TURTLE_GLSL=/* glsl */`
attribute vec4 aTw;
vec3 stRot(vec3 v,vec3 a,float r){float c=cos(r),s=sin(r);return v*c+cross(a,v)*s+a*dot(a,v)*(1.-c);}
float stKeep(float d,float minLod){if(aTw.x<.5)return 1.;float want=max(minLod,d<${SEA_TURTLE.lodNear.toFixed(1)}?0.:d<${SEA_TURTLE.lodFar.toFixed(1)}?1.:2.);return 1.-step(.5,abs(aTw.w-want));}
void stPose(inout vec3 p,inout vec3 n,float t,float ph,float k){
 float part=aTw.x;if(part<.5)return;
 float sd=p.z<0.?-1.:1.,w=aTw.y;
 float cyc=fract(t*.25+ph),th=clamp(cyc/.6,0.,1.)*6.28318;
 float gl=smoothstep(.56,.68,cyc)*(1.-smoothstep(.9,1.,cyc)),st=1.-gl;
 if(part>1.5&&part<2.5){// front flipper: figure-8 stroke, bending and feathering along the blade; swept back in the glide
  vec3 pv=vec3(-.17,-.02,.19*sd),q=p-pv,sp=normalize(vec3(.35,0.,.94*sd));
  float el=mix(-.06,mix(.58*cos(th)-.04,-.1,gl),k),sw=mix(.12,mix(.28*sin(th)+.12*sin(2.*th),.55,gl),k);
  float bend=k*w*w*mix(-.5*sin(th+.7),.1,gl),tw=k*w*st*.45*sin(th);
  q=stRot(q,sp,tw*sd);n=stRot(n,sp,tw*sd);
  float a=-sd*(el+bend);q=stRot(q,vec3(1.,0.,0.),a);n=stRot(n,vec3(1.,0.,0.),a);
  float b=sd*sw;q=stRot(q,vec3(0.,1.,0.),b);n=stRot(n,vec3(0.,1.,0.),b);p=pv+q;}
 else if(part>2.5&&part<3.5){// hind flippers: a gentle trim, steering in the glide
  vec3 pv=vec3(.22,-.035,.1*sd),q=p-pv;float el=k*(st*.16*sin(th+1.2)+gl*.06),sw=k*.1*sin(t*.5+ph*6.28);
  float a=-sd*el*(.4+.6*w);q=stRot(q,vec3(1.,0.,0.),a);n=stRot(n,vec3(1.,0.,0.),a);q=stRot(q,vec3(0.,1.,0.),sw*sd);n=stRot(n,vec3(0.,1.,0.),sw*sd);p=pv+q;}
 else if(part>3.5&&part<4.5){// head: bob against the stroke, the neck stretching out and back slowly
  p.x-=w*k*.02*(.5+.5*sin(t*.39+ph*6.28));vec3 pv=vec3(-.25,0.,0.),q=p-pv;float a=w*k*(.07*sin(th+1.6)*st+.03*sin(t*.6+ph*3.));
  q=stRot(q,vec3(0.,0.,1.),a);n=stRot(n,vec3(0.,0.,1.),a);p=pv+q;}
 else if(part>4.5){float a=w*k*.15*sin(t*1.3+ph*6.28);p.z+=a*(p.x-.29)*.8;}
 // the whole body: pitch, a tiny roll and a heave with each stroke; level in the glide
 float pi=k*st*.05*sin(th+.4),ro=k*st*.025*sin(th);
 p=stRot(p,vec3(0.,0.,1.),pi);n=stRot(n,vec3(0.,0.,1.),pi);p=stRot(p,vec3(1.,0.,0.),ro);n=stRot(n,vec3(1.,0.,0.),ro);p.y+=k*st*.012*cos(th);
}
`;

/**
 * The Explore room's turtle school model (diveRoom.ts `school`, the instanced fish shader): the LOD geometry, no tail wag (amp 0), and
 * the GLSL the fish shader splices in: `pose` defines stP / stN (posed position and normal) from the path clock dvT, the seed aPD.w and
 * the path point dvP. `still` (heat tier 3+ / Battery saver / reduced motion) holds the pose; `lite` (tier 2+) keeps the low band only.
 */
export function seaTurtleModel(o:{lite?:boolean;still?:boolean}={}){
 const stCtl={value:new T.Vector2(o.still?0:1,o.lite?1:0)};
 return {geometry:seaTurtleGeometry(),anim:{axis:[1,0,0] as [number,number,number],start:0,span:1,dir:[0,1,0] as [number,number,number],k:[0,0,0] as [number,number,number],amp:0},
  turtle:{uniforms:{uStCtl:stCtl},head:'uniform vec2 uStCtl;\n'+SEA_TURTLE_GLSL,
   pose:'vec3 stP=position,stN=normal;stPose(stP,stN,dvT,fract(aPD.w*.159),uStCtl.x);stP*=stKeep(distance(cameraPosition,dvP),uStCtl.y);'}};
}
/**
 * Shelly, the Turtle Pool friend (diveRoom.ts friendParts, drawn in the pickups' draw): the 'mid' band (≤ 340 triangles) turned to face
 * +z and scaled to ~0.87 m of shell, split into body (limb 0) and front flippers (limb 1: they lift for the wave / high five). Its own
 * vertex colours and smooth normals are kept (userData.paint).
 */
export function seaTurtleFriendParts(){
 const g=seaTurtleBand('mid'),tw=g.getAttribute('aTw'),parts:{g:T.BufferGeometry;limb:number}[]=[];
 for(const limb of [0,1]){const keep:number[]=[];for(let i=0;i<tw.count;i+=3)if((tw.getX(i)===2)===(limb===1))keep.push(i);
  const q=new T.BufferGeometry();for(const name of ['position','normal','color']){const a=g.getAttribute(name),arr=new Float32Array(keep.length*3*a.itemSize);
   keep.forEach((v,k)=>{for(let j=0;j<3*a.itemSize;j++)arr[k*3*a.itemSize+j]=(a.array as Float32Array)[v*a.itemSize+j];});q.setAttribute(name,new T.BufferAttribute(arr,a.itemSize));}
  q.rotateY(Math.PI/2);q.scale(1.4,1.4,1.4);q.userData.paint=true;parts.push({g:q,limb});}
 g.dispose();return parts;
}
/** Turtle controls per scene: anim (0 still: heat tier 3-4 / Battery saver / reduced motion), minLod (1 = the low band only at heat tier 2+). */
export function seaTurtleControls(tier:number,reduced:boolean){return {anim:reduced||tier>=3?0:1,minLod:tier>=2?1:0};}
/**
 * Patch an INSTANCED material's compiled shader with the turtle library (zoneLife.ts): pose in model space before the instance matrix,
 * the per-instance LOD band, a per-instance phase from gl_InstanceID. Vertices with aTw.x = 0 (other kinds) pass through unchanged.
 */
export function patchSeaTurtle(shader:{uniforms:Record<string,T.IUniform>;vertexShader:string},time:{value:number},ctl:{value:T.Vector2}){
 shader.uniforms.uStTime=time;shader.uniforms.uStCtl=ctl;
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uStTime;uniform vec2 uStCtl;\n'+SEA_TURTLE_GLSL)
  .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
vec3 stP=position;
#ifdef USE_INSTANCING
stPose(stP,objectNormal,uStTime,fract(float(gl_InstanceID)*.618),uStCtl.x);stP*=stKeep(distance(cameraPosition,(modelMatrix*instanceMatrix[3]).xyz),uStCtl.y);
#endif`).replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=stP;');
}
