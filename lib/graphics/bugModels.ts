/**
 * Bug models (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): one merged low-poly geometry per BUG_SPECIES entry (and the
 * firefly), built from its `look` (lib/town/jobs/bugSpecies.ts). Real anatomy in vertex colours, no textures: head / thorax /
 * abdomen, six legs (eight on the jumping spider), antennae, species-accurate wings and patterns (monarch veins and white-dotted
 * borders, swallowtail tails and eye-spots, iridescent morpho blue, luna-moth tails, a ladybird's seven spots, a dragonfly's four
 * glassy wings and ringed tail, a bumblebee's fuzzy bands...). Wings, wing cases and legs carry extra attributes so the shared
 * vertex shader (bugSwarm.ts) flaps, lifts and walks them per instance:
 *   aWing = (side ±1, kind, hinge x, hinge y)  kind 1 fore wing, 2 hind wing (lags), 3 wing case (lifts open), 4 folded hind wing
 *           (spreads with the wing-case opening, then flaps)
 *   aMisc = (leg phase, leg weight, sheen, glow)
 * Model space: head towards +z, y up, feet at y = 0, normalised so the longer of length and wingspan is 1 (the swarm scales by
 * look.size). The far LOD (createBugFarGeometry) is one tiny silhouette shared by every species, tinted per instance.
 */
import * as T from 'three';
import type {BugSpecies} from '../town/jobs/bugSpecies';

type V3=readonly [number,number,number];
type P2=readonly [number,number];
type Opt={wing?:readonly [number,number,number,number];leg?:number;legW?:number|'x';root?:number;sheen?:number;glow?:number};
type ColorFn=(x:number,y:number,z:number)=>string;

/** Collects coloured parts with the bug attributes into one non-indexed geometry. */
class Builder{
 pos:number[]=[];nor:number[]=[];col:number[]=[];wing:number[]=[];misc:number[]=[];private c=new T.Color();
 add(g:T.BufferGeometry,m:T.Matrix4|null,color:string|ColorFn,o:Opt={}){
  const src=g.index?g.toNonIndexed():g;g.dispose();if(m)src.applyMatrix4(m);
  const a=src.getAttribute('position'),n=src.getAttribute('normal'),w=o.wing??[0,0,0,0];
  if(typeof color==='string')this.c.set(color);
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);this.pos.push(x,y,z);this.nor.push(n.getX(i),n.getY(i),n.getZ(i));
   if(typeof color!=='string')this.c.set(color(x,y,z));this.col.push(this.c.r,this.c.g,this.c.b);this.wing.push(w[0],w[1],w[2],w[3]);
   const lw=o.leg===undefined?0:o.legW==='x'||o.legW===undefined?Math.max(0,Math.abs(x)-(o.root??0)):o.legW;
   this.misc.push(o.leg??0,lw,o.sheen??0,o.glow??0);}
  src.dispose();
 }
 /** Uniform scale so the longer of length (z) and span (x) is 1; hinges scale too. */
 finish(){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<this.pos.length;i+=3){x0=Math.min(x0,this.pos[i]);x1=Math.max(x1,this.pos[i]);z0=Math.min(z0,this.pos[i+2]);z1=Math.max(z1,this.pos[i+2]);}
  const s=1/Math.max(x1-x0,z1-z0,1e-6);
  for(let i=0;i<this.pos.length;i++)this.pos[i]*=s;for(let i=0;i<this.wing.length;i+=4){this.wing[i+2]*=s;this.wing[i+3]*=s;}
  for(let i=0;i<this.misc.length;i+=4)this.misc[i+1]*=s;
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));g.setAttribute('aWing',new T.Float32BufferAttribute(this.wing,4));
  g.setAttribute('aMisc',new T.Float32BufferAttribute(this.misc,4));g.computeBoundingSphere();return g;
 }
}

const tmpM=new T.Matrix4(),tmpQ=new T.Quaternion(),tmpE=new T.Euler(),UP=new T.Vector3(0,1,0),va=new T.Vector3(),vb=new T.Vector3();
const mat=(x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),tmpQ.setFromEuler(tmpE.set(rx,ry,rz)).clone(),new T.Vector3(sx,sy,sz));

/** Ellipsoid. */
function ell(b:Builder,r:V3,p:V3,color:string|ColorFn,o:Opt={},seg:readonly [number,number]=[8,6],rot:V3=[0,0,0]){
 // Poles along z, so colour bands along a body (bee stripes, a spider's chevrons) follow the rings.
 b.add(new T.SphereGeometry(1,seg[0],seg[1]).rotateX(Math.PI/2),mat(p[0],p[1],p[2],r[0],r[1],r[2],rot[0],rot[1],rot[2]),color,o);}
/** Half ellipsoid (one wing case): side +1 is the x > 0 half, upper half only. */
function halfShell(b:Builder,side:number,r:V3,p:V3,color:string|ColorFn,o:Opt){
 b.add(new T.SphereGeometry(1,7,5,side>0?Math.PI/2:Math.PI*1.5,Math.PI,0,Math.PI/2),mat(p[0],p[1],p[2],r[0],r[1],r[2]),color,o);}
/** A tapered tube between two points (legs, antennae, horns). */
function tube(b:Builder,a:V3,c:V3,r0:number,r1:number,color:string,o:Opt={},radial=4){
 va.set(a[0],a[1],a[2]);vb.set(c[0],c[1],c[2]);const len=va.distanceTo(vb);if(len<1e-6)return;
 const dir=vb.clone().sub(va).normalize(),q=new T.Quaternion().setFromUnitVectors(UP,dir),mid=va.clone().add(vb).multiplyScalar(.5);
 b.add(new T.CylinderGeometry(r1,r0,len,radial,1,false),tmpM.clone().compose(mid,q,new T.Vector3(1,1,1)),color,o);}
function chain(b:Builder,pts:readonly V3[],r0:number,r1:number,color:string,o:Opt={}){
 for(let i=0;i<pts.length-1;i++){const k0=i/(pts.length-1),k1=(i+1)/(pts.length-1);tube(b,pts[i],pts[i+1],r0+(r1-r0)*k0,r0+(r1-r0)*k1,color,o);}}
/** A flat polygon in the x/z plane at height y (outline in x, z); optional holes; tilt rolls it about the z axis through hinge. */
function flat(b:Builder,outline:readonly P2[],y:number,color:string|ColorFn,o:Opt={},holes:readonly (readonly P2[])[]=[],tilt=0,hingeX=0){
 const shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(x,z)));for(const h of holes)shape.holes.push(new T.Path(h.map(([x,z])=>new T.Vector2(x,z))));
 const g=new T.ShapeGeometry(shape);g.applyMatrix4(new T.Matrix4().makeRotationX(Math.PI/2));
 const m=new T.Matrix4().makeTranslation(hingeX,y,0).multiply(new T.Matrix4().makeRotationZ(tilt)).multiply(new T.Matrix4().makeTranslation(-hingeX,0,0));
 b.add(g,m,color,o);}
const mirror=(pts:readonly P2[],s:number):P2[]=>pts.map(([x,z])=>[x*s,z] as const);
const centroid=(pts:readonly P2[])=>{let x=0,z=0;for(const p of pts){x+=p[0];z+=p[1];}return [x/pts.length,z/pts.length] as const;};
/** The outline shrunk towards its middle (an inner edge for border rings and overlays). */
const inset=(pts:readonly P2[],k:number,toward?:P2):P2[]=>{const c=toward??centroid(pts);return pts.map(([x,z])=>[c[0]+(x-c[0])*(1-k),c[1]+(z-c[1])*(1-k)] as const);};
const circle=(cx:number,cz:number,r:number,n=6):P2[]=>Array.from({length:n},(_,i)=>[cx+Math.cos(i/n*Math.PI*2)*r,cz+Math.sin(i/n*Math.PI*2)*r] as const);
/** A thin strip along a polyline (wing veins). */
function strip(pts:readonly P2[],w:number):P2[]{const L:P2[]=[],R:P2[]=[];
 for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],c=pts[Math.min(pts.length-1,i+1)],dx=c[0]-a[0],dz=c[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;
  L.push([pts[i][0]+nx,pts[i][1]+nz]);R.push([pts[i][0]-nx,pts[i][1]-nz]);}
 return [...L,...R.reverse()];}
/** Points along an outline's edges, pulled in by k towards the middle (border dots). */
function edgeDots(pts:readonly P2[],k:number,every=1):P2[]{const out:P2[]=[];const c=centroid(pts);
 for(let i=0;i<pts.length;i+=every){const a=pts[i],n=pts[(i+1)%pts.length],mx=(a[0]+n[0])/2,mz=(a[1]+n[1])/2;out.push([mx+(c[0]-mx)*k,mz+(c[1]-mz)*k]);}return out;}

/** Six legs (tripod gait phases): roots on the body sides at the given z, knee raised, feet on the ground (y = 0). */
function legs(b:Builder,color:string,o:{rootX:number;rootY:number;zs:readonly number[];reach:number;knee:number;r:number;splay?:readonly number[];footColor?:string}){
 o.zs.forEach((z,i)=>{for(const s of [-1,1]){const sp=o.splay?.[i]??0,phase=((i%2===0)===(s>0)?0:Math.PI);
  const root:V3=[s*o.rootX,o.rootY,z],knee:V3=[s*(o.rootX+o.reach*.55),o.knee,z+sp*.5],foot:V3=[s*(o.rootX+o.reach),0,z+sp];
  const lo:Opt={leg:phase,root:o.rootX};tube(b,root,knee,o.r*1.25,o.r,color,lo);tube(b,knee,foot,o.r,o.r*.6,o.footColor??color,lo);}});}
/** Clubbed / plain / elbowed antennae from the head. */
function antennae(b:Builder,color:string,base:V3,mid:V3,tip:V3,r:number,club=0){
 for(const s of [-1,1]){const p=(v:V3):V3=>[v[0]*s,v[1],v[2]];chain(b,[p(base),p(mid),p(tip)],r,r*.7,color);if(club)ell(b,[club,club,club*1.6],p(tip),color,{},[5,4]);}}
/** A football patch: a small white disc with a dark pentagon (the unobtrusive "ball" accent), lying on a surface at p. */
function ballPatch(b:Builder,p:V3,r:number,o:Opt={}){flat(b,circle(p[0],p[2],r,8),p[1],'#f4f1ea',o);flat(b,circle(p[0],p[2],r*.45,5),p[1]+r*.08,'#1e1e1e',o);}

// ---------------------------------------------------------------------------------------------------------------------------
// Wing outlines (left wing, x > 0, hinge near x = 0; z forward). Mirrored for the right wing.
const BF_FW:P2[]=[[.04,.12],[.2,.25],[.42,.34],[.57,.31],[.56,.2],[.46,.05],[.3,-.04],[.08,-.03]];
const BF_HW:P2[]=[[.05,.01],[.25,-.01],[.4,-.08],[.43,-.2],[.33,-.32],[.18,-.36],[.07,-.22]];
const SW_HW:P2[]=[[.05,.01],[.25,-.01],[.4,-.08],[.42,-.2],[.34,-.3],[.27,-.34],[.27,-.54],[.23,-.55],[.21,-.37],[.14,-.36],[.06,-.22]];
const MO_FW:P2[]=[[.04,.13],[.22,.27],[.44,.38],[.6,.37],[.62,.24],[.5,.06],[.32,-.06],[.08,-.04]];
const MO_HW:P2[]=[[.05,.0],[.28,-.02],[.46,-.1],[.48,-.24],[.36,-.38],[.2,-.42],[.08,-.26]];
const LU_FW:P2[]=[[.05,.12],[.3,.24],[.5,.29],[.53,.2],[.42,.03],[.22,-.06],[.06,-.04]];
const LU_HW:P2[]=[[.06,-.02],[.3,-.06],[.41,-.16],[.33,-.3],[.26,-.48],[.21,-.74],[.16,-.73],[.15,-.5],[.08,-.3]];
const DF_FW:P2[]=[[.03,.27],[.25,.31],[.5,.3],[.64,.27],[.62,.22],[.42,.21],[.16,.21],[.03,.22]];
const DF_HW:P2[]=[[.03,.18],[.2,.2],[.46,.2],[.62,.17],[.6,.12],[.36,.1],[.13,.07],[.03,.12]];
const DM_FW:P2[]=[[.02,.25],[.06,.26],[.25,.29],[.44,.28],[.45,.25],[.25,.24],[.06,.24]];
const DM_HW:P2[]=[[.02,.2],[.06,.21],[.25,.23],[.43,.22],[.44,.19],[.25,.18],[.06,.19]];
const BEE_FW:P2[]=[[.05,.17],[.2,.15],[.36,.07],[.38,.0],[.27,-.01],[.09,.08]];
const BEE_HW:P2[]=[[.05,.1],[.17,.06],[.27,.0],[.24,-.03],[.08,.04]];
/** Folded hind wings under wing cases (kind 4): a fan that spreads when the case opens. */
const FAN:P2[]=[[.03,.06],[.22,.04],[.44,-.06],[.48,-.2],[.3,-.28],[.04,-.12]];

const GLASS='#c4d8e4',GLASS_VEIN='#4a5560';
const W=(side:number,kind:number,hx:number,hy:number)=>[side,kind,side*hx,hy] as const;

// ---------------------------------------------------------------------------------------------------------------------------
function butterfly(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];
 const morpho=sp.id==='blue-morph',swallow=sp.id==='swallowtail',monarch=sp.id==='monarch';
 const body=morpho?'#3a2e24':'#1f1a16';
 ell(b,[.05,.05,.1],[0,.1,.05],body);ell(b,[.034,.034,.19],[0,.09,-.19],swallow?'#e7cf52':body);ell(b,[.042,.042,.042],[0,.11,.17],body,{},[6,5]);
 for(const s of [-1,1])ell(b,[.022,.026,.022],[s*.03,.115,.19],'#2b2b2b',{},[5,4]);
 antennae(b,body,[.015,.13,.2],[.05,.2,.32],[.08,.24,.42],.006,.014);
 legs(b,body,{rootX:.03,rootY:.07,zs:[.1,.05,0],reach:.09,knee:.06,r:.007,splay:[.04,0,-.04]});
 if(monarch)tube(b,[0,.09,-.06],[0,.09,-.09],.04,.04,'#f2c230',{},6);// the captain's gold armband
 else ballPatch(b,[0,.152,.05],.026);
 const hy=.11,hx=.04,fw=BF_FW,hw=swallow?SW_HW:BF_HW;
 for(const s of [-1,1]){const fo:Opt={wing:W(s,1,hx,hy)},ho:Opt={wing:W(s,2,hx,hy)},F=mirror(fw,s),H=mirror(hw,s);
  if(monarch){
   // Underside / border black, orange panels with black veins, white dots in the border.
   flat(b,F,hy,dark,fo);flat(b,H,hy,dark,ho);
   flat(b,inset(F,.16),hy+.004,main,fo);flat(b,inset(H,.18),hy+.004,main,ho);
   for(const tip of [F[2],F[3],F[4],F[5]])flat(b,strip([[s*.07,.03],[tip[0]*.82,tip[1]*.82+.01]],.016),hy+.008,dark,fo);
   for(const tip of [H[1],H[2],H[3],H[4],H[5]])flat(b,strip([[s*.07,-.02],[tip[0]*.85,tip[1]*.85]],.016),hy+.008,dark,ho);
   for(const [x,z] of edgeDots(F,.06))flat(b,circle(x,z,.011,5),hy+.008,sec,fo);for(const [x,z] of edgeDots(H,.06))flat(b,circle(x,z,.011,5),hy+.008,sec,ho);
   flat(b,circle(s*.45,.27,.022,5),hy+.008,sec,fo);flat(b,circle(s*.5,.24,.018,5),hy+.008,sec,fo);
  }else if(swallow){
   flat(b,F,hy,dark,fo);flat(b,H,hy,dark,ho);
   flat(b,inset(F,.14),hy+.004,main,fo);flat(b,inset(H,.24,[s*.2,-.12]),hy+.004,main,ho);
   // Black bars from the leading edge, a yellow-dotted dark border, blue lunules and a red eye-spot by the tail.
   for(const [a,c] of [[[.12,.18],[.18,.02]],[[.24,.25],[.28,.0]],[[.36,.3],[.38,.04]]] as const)flat(b,strip([[s*a[0],a[1]],[s*c[0],c[1]]],.035),hy+.008,dark,fo);
   for(const [x,z] of edgeDots(F,.07))flat(b,circle(x,z,.012,5),hy+.008,main,fo);
   for(const [x,z] of edgeDots(H,.1).slice(1,5))flat(b,circle(x,z,.016,5),hy+.008,sec,ho);
   flat(b,circle(s*.12,-.28,.028,6),hy+.008,'#d8422e',ho);flat(b,circle(s*.12,-.28,.012,5),hy+.012,dark,ho);
  }else if(morpho){
   // Brown underside, black border, and the shimmering blue top panel (sheen: view-dependent iridescence in the shader).
   flat(b,F,hy,dark,fo);flat(b,H,hy,dark,ho);
   flat(b,inset(F,.2,[s*.18,.08]),hy+.004,(x,_y,z)=>Math.hypot(x-s*.12,z-.05)<.18?sec:main,{...fo,sheen:1});
   flat(b,inset(H,.18,[s*.15,-.1]),hy+.004,(x,_y,z)=>Math.hypot(x-s*.1,z+.08)<.16?sec:main,{...ho,sheen:1});
   for(const [x,z] of [[.47,.28],[.52,.24],[.5,.17]] as const)flat(b,circle(s*x,z,.012,5),hy+.008,'#f2f2f2',fo);
  }else{flat(b,F,hy,main,fo);flat(b,H,hy,main,ho);}
 }
}
function moth(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];const fur='#f1f0e2';
 ell(b,[.07,.07,.1],[0,.11,.05],fur,{},[7,5]);ell(b,[.055,.055,.18],[0,.1,-.16],fur,{},[7,5]);ell(b,[.045,.045,.045],[0,.12,.17],fur,{},[6,4]);
 for(const s of [-1,1]){ell(b,[.02,.022,.02],[s*.035,.125,.2],'#262626',{},[5,4]);
  flat(b,[[s*.02,.21],[s*.09,.34],[s*.13,.38],[s*.08,.27]],.14,'#c8a24a',{},[],s*-.3,0);}// feathery antennae
 legs(b,'#c7b7a0',{rootX:.04,rootY:.07,zs:[.1,.05,0],reach:.1,knee:.07,r:.008});
 ballPatch(b,[0,.18,.05],.026);
 const hy=.12,hx=.05;
 for(const s of [-1,1]){const fo:Opt={wing:W(s,1,hx,hy)},ho:Opt={wing:W(s,2,hx,hy)},F=mirror(LU_FW,s),H=mirror(LU_HW,s);
  flat(b,F,hy,main,fo);flat(b,H,hy,(x,_y,z)=>z<-.45?sec:main,ho);
  flat(b,strip([[s*.06,.11],[s*.28,.23],[s*.5,.28]],.025),hy+.006,'#8a3b4c',fo);// purple-brown leading edge
  for(const [c,o] of [[[.26,.08],fo],[[.24,-.18],ho]] as const){flat(b,circle(s*c[0],c[1],.04,7),hy+.006,dark,o);flat(b,circle(s*c[0],c[1],.026,6),hy+.01,'#e9c45a',o);flat(b,circle(s*c[0],c[1],.012,5),hy+.014,'#3a2a28',o);}
  flat(b,strip([[s*.1,.0],[s*.36,.0]],.008),hy+.006,dark,fo);
 }
}
function dragon(b:Builder,sp:BugSpecies,damsel:boolean){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];
 const ey=damsel?.06:.045,er=damsel?.035:.065;
 for(const s of [-1,1])ell(b,[er,er*.95,er],[s*ey,.14,damsel?.36:.4],damsel?main:'#3a8fb0',{},[7,5]);
 ell(b,[.035,.03,.04],[0,.12,damsel?.33:.36],dark,{},[5,4]);
 ell(b,[damsel?.04:.07,damsel?.05:.08,.12],[0,.12,.24],damsel?main:sec,{},[7,5]);
 // The long tail: alternating colour rings along a tapered tube.
 const z0=.13,z1=damsel?-.75:-.62,n=damsel?9:8,r0=damsel?.018:.032,r1=damsel?.014:.022;
 for(let i=0;i<n;i++){const a=z0+(z1-z0)*i/n,c=z0+(z1-z0)*(i+1)/n,r=r0+(r1-r0)*i/n;tube(b,[0,.12,a],[0,.12,c-.004],r,r*.95,main,{},6);tube(b,[0,.12,c-.012],[0,.12,c],r*1.08,r*1.08,dark,{},6);}
 if(!damsel)ell(b,[.03,.02,.05],[0,.135,-.08],sec,{},[5,4]);
 legs(b,dark,{rootX:.03,rootY:.08,zs:[.28,.24,.2],reach:.08,knee:.07,r:.007});
 antennae(b,dark,[.01,.16,.43],[.02,.18,.45],[.03,.19,.47],.004);
 ballPatch(b,[0,.2,.24],.02);
 const hy=.17,hx=.03,fw=damsel?DM_FW:DF_FW,hw=damsel?DM_HW:DF_HW;
 for(const s of [-1,1]){const fo:Opt={wing:W(s,1,hx,hy),sheen:.35},ho:Opt={wing:W(s,2,hx,hy),sheen:.35},F=mirror(fw,s),H=mirror(hw,s);
  flat(b,F,hy,GLASS,fo);flat(b,H,hy,GLASS,ho);
  // Veins and the dark pterostigma near each tip.
  for(const [o,P] of [[fo,F],[ho,H]] as const){const c=centroid(P),tipX=P.reduce((m,p)=>Math.abs(p[0])>Math.abs(m[0])?p:m,P[0]);
   flat(b,strip([[s*.03,c[1]+.02],[tipX[0]*.97,tipX[1]]],.006),hy+.004,GLASS_VEIN,o);flat(b,strip([[s*.03,c[1]-.02],[tipX[0]*.85,tipX[1]-.025]],.004),hy+.004,GLASS_VEIN,o);
   flat(b,[[tipX[0]*.88,tipX[1]+.012],[tipX[0]*.95,tipX[1]+.01],[tipX[0]*.95,tipX[1]-.004],[tipX[0]*.88,tipX[1]-.002]],hy+.006,dark,o);}
 }
}
function bee(b:Builder,sp:BugSpecies){
 const bumble=sp.id==='bumblebee',[main,dark]=bumble?['#f2c230','#1d1d1d']:[sp.look.palette[0],sp.look.palette[1]];
 const tail=bumble?'#f6efe2':main,rz=bumble?.24:.26,rx=bumble?.15:.11;
 // Fuzzy bands: the colour follows z along the abdomen.
 const band=(z:number)=>{const k=(z-(-.12+rz))/(-2*rz);// 0 front .. 1 tail
  if(bumble)return k<.25?main:k<.62?dark:tail;return k>.86?dark:Math.floor(k*6)%2===1?dark:main;};
 ell(b,[rx,bumble?.14:.11,rz],[0,.17,-.12],(_x,_y,z)=>band(z),{},[9,13]);
 ell(b,[.13,.12,.13],[0,.19,.12],(_x,y,z)=>bumble?(z>.18||y<.12?main:dark):(y>.25?'#6b4a22':main),{},[8,6]);
 ell(b,[.08,.08,.07],[0,.17,.27],dark,{},[7,5]);for(const s of [-1,1])ell(b,[.03,.05,.035],[s*.06,.18,.28],'#141414',{},[5,4]);
 antennae(b,dark,[.03,.22,.32],[.06,.3,.36],[.1,.27,.45],.009);
 legs(b,dark,{rootX:.07,rootY:.12,zs:[.17,.1,.02],reach:.16,knee:.13,r:.013,splay:[.06,0,-.08]});
 if(!bumble)for(const s of [-1,1])ell(b,[.025,.035,.04],[s*.19,.04,-.04],'#e7a63a',{},[5,4]);// pollen baskets
 if(sp.id==='honeybee'){flat(b,[[-.04,.08],[.04,.08],[.04,.16],[-.04,.16]],.312,'#f6efe2');flat(b,[[-.012,.09],[.012,.09],[.012,.15],[-.012,.15]],.314,'#d8322e');flat(b,[[-.03,.108],[.03,.108],[.03,.132],[-.03,.132]],.314,'#d8322e');}
 else ballPatch(b,[0,.312,.12],.04);
 const hy=.27,hx=.05;
 for(const s of [-1,1]){const fo:Opt={wing:W(s,1,hx,hy),sheen:.3},ho:Opt={wing:W(s,2,hx,hy),sheen:.3},F=mirror(BEE_FW,s),H=mirror(BEE_HW,s);
  flat(b,F,hy,'#c9d9e0',fo);flat(b,H,hy,'#c9d9e0',ho);flat(b,strip([[s*.06,.15],[s*.3,.08]],.008),hy+.004,'#6e5b45',fo);flat(b,strip([[s*.07,.07],[s*.28,.02]],.006),hy+.004,'#6e5b45',fo);}
}
/** Beetles, the ladybird and the firefly: two wing cases (kind 3) over folded hind wings (kind 4). */
function beetle(b:Builder,sp:BugSpecies|null,kind:'ladybird'|'rhino'|'stag'|'tiger'|'firefly'){
 const P=sp?.look.palette??['#2a2a2a','#e8a07a','#141414'],[main,sec,dark]=[P[0],P[1],P[P.length-1]];
 const lady=kind==='ladybird',tiger=kind==='tiger',fly=kind==='firefly';
 const er:V3=lady?[.26,.22,.3]:tiger?[.15,.09,.27]:fly?[.12,.06,.28]:[.18,.13,.3],ec:V3=lady?[0,.1,-.04]:tiger?[0,.15,-.14]:fly?[0,.11,-.1]:[0,.12,-.13];
 const caseCol=fly?'#33302c':kind==='stag'?'#3b2416':main,top=ec[1]+er[1],shine=tiger?.5:kind==='rhino'||kind==='stag'?.15:lady?.12:0;
 ell(b,[er[0]*.92,er[1]*.4,er[2]*.95],[ec[0],ec[1]-.005,ec[2]],dark,{},[7,5]);// underside
 if(fly)ell(b,[.08,.05,.08],[0,.1,-.36],'#f7f58a',{glow:1},[6,5]);// the lantern
 for(const s of [-1,1]){const wo:Opt={wing:W(s,3,0,top),sheen:shine};
  halfShell(b,s,er,ec,fly?(x)=>Math.abs(x)>er[0]*.82?'#d6c9a0':caseCol:caseCol,wo);
  // Spots on the cases (ladybird seven, tiger beetle cream dots), sitting on the dome surface.
  const spots:P2[]=lady?[[.45,.35],[.6,-.15],[.35,-.6]]:tiger?[[.5,.3],[.6,-.2],[.4,-.7]]:[];
  for(const [u,v] of spots){const x=s*u*er[0],z=ec[2]+v*er[2],y=ec[1]+er[1]*Math.sqrt(Math.max(0,1-u*u-v*v)),n=new T.Vector3(x/(er[0]*er[0]),(y-ec[1])/(er[1]*er[1]),(z-ec[2])/(er[2]*er[2])).normalize();
   const q=new T.Quaternion().setFromUnitVectors(UP,n),r=lady?.055:.03;b.add(new T.CylinderGeometry(r,r,.012,7),new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(1,1,1)),lady?dark:'#efe6c4',wo);}
  const fo:Opt={wing:W(s,4,.04,top-.02)};flat(b,mirror(FAN,s).map(([x,z])=>[x*(er[0]/.26)*1.6,z*(er[2]/.3)+ec[2]+.04] as const),top-.02,'#d8d2c6',fo);
 }
 if(lady)ell(b,[.035,.02,.03],[0,top-.01,ec[2]+er[2]*.86],dark,{},[5,4]);// the seventh spot, on the seam
 // Pronotum and head.
 const pr:V3=lady?[.17,.1,.08]:tiger?[.08,.06,.07]:fly?[.09,.035,.07]:[.16,.11,.12],pz=lady?.24:tiger?.17:fly?.23:.16;
 ell(b,pr,[0,ec[1]+.01,pz],fly?(x,_y,z)=>Math.hypot(x,z-pz)<.04?'#141414':sec:lady?dark:kind==='stag'?'#2d1a10':main,{sheen:shine},[8,5]);
 if(lady)for(const s of [-1,1])ell(b,[.05,.04,.04],[s*.11,ec[1]+.03,.27],P[1],{},[5,4]);
 const hz=pz+pr[2]+.03,hr:V3=lady?[.1,.06,.06]:tiger?[.08,.06,.06]:kind==='stag'?[.15,.08,.09]:fly?[.06,.04,.05]:[.1,.07,.08];
 ell(b,hr,[0,ec[1],hz],tiger?main:dark,{sheen:shine},[7,5]);
 for(const s of [-1,1])ell(b,tiger?[.045,.045,.045]:[.03,.03,.03],[s*hr[0]*.8,ec[1]+.02,hz+hr[2]*.5],tiger?'#2a1f12':'#1a1a1a',{},[5,4]);
 if(kind==='rhino'){chain(b,[[0,ec[1]+.02,hz+.06],[0,ec[1]+.08,hz+.14],[0,ec[1]+.2,hz+.17],[0,ec[1]+.28,hz+.11]],.035,.01,sec);chain(b,[[0,ec[1]+.09,pz+.05],[0,ec[1]+.15,pz+.1]],.025,.008,dark);}
 if(kind==='stag')for(const s of [-1,1]){chain(b,[[s*.06,ec[1],hz+.05],[s*.15,ec[1]+.03,hz+.16],[s*.13,ec[1]+.05,hz+.28],[s*.04,ec[1]+.06,hz+.33]],.025,.01,sec);tube(b,[s*.14,ec[1]+.03,hz+.2],[s*.08,ec[1]+.03,hz+.21],.012,.006,sec);}
 if(tiger)for(const s of [-1,1])chain(b,[[s*.04,ec[1]+.01,hz+.05],[s*.08,ec[1],hz+.09]],.012,.006,'#efe6c4');// sickle jaws
 const antLen=tiger?.36:fly?.24:lady?.12:.18;antennae(b,dark,[.04,ec[1]+.02,hz+.04],[.09,ec[1]+.07,hz+.04+antLen*.45],[.15,ec[1]+.06,hz+.04+antLen],.008,kind==='stag'||kind==='rhino'?.018:0);
 legs(b,tiger?'#2f5a3a':dark,{rootX:er[0]*.5,rootY:ec[1]-.02,zs:[pz,ec[2]+er[2]*.45,ec[2]],reach:tiger?.3:lady?.18:.26,knee:ec[1]+(tiger?.12:.06),r:tiger?.011:.016,splay:[.08,0,-.12]});
 if(!fly&&!lady)ballPatch(b,[0,top+.004,ec[2]+er[2]*.5],.022,{wing:W(1,3,0,top)});
 else if(lady)ballPatch(b,[0,ec[1]+pr[1]+.004,pz],.03);
}
function hopper(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]],cricket=sp.id==='cricket';
 const by=.15;
 ell(b,[.07,.07,cricket?.24:.28],[0,by,-.08],main,{sheen:cricket?.15:0},[8,6]);
 ell(b,[.08,.09,.1],[0,by+.02,.24],cricket?dark:sec,{sheen:cricket?.2:0},[7,5]);
 ell(b,[.065,.085,.075],[0,by+.04,.37],main,{},[7,5],[-.5,0,0]);
 for(const s of [-1,1])ell(b,[.03,.04,.035],[s*.055,by+.07,.39],cricket?'#100c08':'#5a4a1e',{},[5,4]);
 antennae(b,dark,[.02,by+.1,.42],[.07,by+.16,cricket?.5:.5],cricket?[.2,by+.12,.95]:[.08,by+.17,.6],.007);
 if(cricket)for(const s of [-1,1])tube(b,[s*.03,by,-.3],[s*.08,by+.02,-.48],.01,.004,dark);// cerci
 // Front four legs and the big jumping legs: femur up and back to the knee, shin back down to the foot.
 legs(b,cricket?main:dark,{rootX:.05,rootY:by-.04,zs:[.26,.16],reach:.16,knee:by+.04,r:.012,splay:[.08,-.02]});
 for(const s of [-1,1]){const lo:Opt={leg:s>0?Math.PI*.5:Math.PI*1.5,legW:.15};
  ell(b,[.035,.06,.2],[s*.1,by+.07,-.08],(_x,_y,z)=>z<-.18?sec:main,lo,[6,5],[.55,0,0]);
  tube(b,[s*.11,by+.17,-.26],[s*.13,.02,-.02],.014,.008,cricket?main:'#c7d35a',lo);}
 const hy=by+.07;
 for(const s of [-1,1]){const co:Opt={wing:W(s,3,0,hy)};
  flat(b,mirror([[0,.2],[.075,.18],[.085,-.2],[.04,-.4],[0,-.32]],s),hy,cricket?'#3a2a1c':'#8cc451',co,[],-s*.35,0);
  if(!cricket)flat(b,strip([[s*.02,.16],[s*.04,-.3]],.01),hy+.004,'#3d5a1e',co,[],-s*.35,0);
  flat(b,mirror(FAN.map(([x,z])=>[x*.9,z*1.2-.05] as const),s),hy-.01,cricket?'#5c4b3a':'#e3eaa8',{wing:W(s,4,.03,hy-.01)});}
 ballPatch(b,[0,by+.11,.24],.025);
}
function stick(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];const y=.1;
 chain(b,[[0,y,.42],[0,y+.005,.2],[0,y,-.1],[0,y-.005,-.5]],.025,.016,main);
 for(const z of [.2,-.1])ell(b,[.03,.03,.03],[0,y,z],dark,{},[5,4]);
 ell(b,[.03,.03,.05],[0,y+.01,.46],sec,{},[6,4]);
 antennae(b,dark,[.01,y+.02,.5],[.04,y+.04,.65],[.06,y+.05,.8],.005);
 for(const [i,z] of [.33,.12,-.02].entries())for(const s of [-1,1]){const lo:Opt={leg:((i%2===0)===(s>0)?0:Math.PI),root:.02},sp2=i===0?.18:i===2?-.2:0;
  chain(b,[[s*.02,y,z],[s*.17,y+.1,z+sp2*.4],[s*.26,0,z+sp2]],.008,.005,i===0?sec:main,lo);}
 ballPatch(b,[0,y+.026,.0],.02);
}
function ant(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];const y=.13;
 ell(b,[.075,.065,.08],[0,y+.01,.28],main,{},[7,5]);for(const s of [-1,1]){ell(b,[.02,.025,.02],[s*.06,y+.03,.31],'#111',{},[5,4]);chain(b,[[s*.03,y-.02,.35],[s*.05,y-.03,.4],[s*.01,y-.03,.42]],.01,.005,dark);}
 ell(b,[.045,.05,.12],[0,y,.1],sec,{},[7,5]);ell(b,[.03,.04,.03],[0,y,-.04],main,{},[5,4]);
 ell(b,[.11,.1,.15],[0,y+.02,-.19],dark,{sheen:.15},[8,6]);
 antennae(b,dark,[.03,y+.05,.33],[.06,y+.17,.36],[.13,y+.15,.5],.007);
 legs(b,main,{rootX:.03,rootY:y-.03,zs:[.15,.09,.04],reach:.26,knee:y+.08,r:.01,splay:[.12,0,-.16]});
 ballPatch(b,[0,y+.052,.1],.022);
}
function mantis(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];
 tube(b,[0,.18,.04],[0,.32,.3],.03,.022,main,{},6);
 ell(b,[.085,.055,.04],[0,.355,.34],main,{},[7,5]);for(const s of [-1,1])ell(b,[.035,.04,.035],[s*.075,.365,.34],sec,{},[6,4]);
 antennae(b,dark,[.02,.39,.36],[.06,.46,.44],[.12,.48,.56],.004);
 ell(b,[.07,.06,.3],[0,.16,-.2],main,{},[8,6]);
 for(const s of [-1,1]){// folded "praying" front legs
  chain(b,[[s*.03,.27,.24],[s*.05,.2,.33],[s*.05,.31,.43]],.022,.016,main);chain(b,[[s*.05,.31,.43],[s*.05,.22,.4],[s*.04,.25,.34]],.012,.008,sec);}
 legs(b,main,{rootX:.03,rootY:.15,zs:[.02,-.06],reach:.32,knee:.24,r:.01,splay:[.06,-.16]});
 for(const s of [-1,1]){flat(b,mirror([[0,.04],[.07,.0],[.09,-.32],[.04,-.48],[0,-.4]],s),.22,sec,{wing:W(s,3,0,.22)},[],-s*.3,0);
  flat(b,strip(mirror([[.02,0],[.05,-.4]],s),.01),.224,dark,{wing:W(s,3,0,.22)},[],-s*.3,0);
  flat(b,mirror(FAN.map(([x,z])=>[x*1.1,z*1.4-.1] as const),s),.21,'#e3efc8',{wing:W(s,4,.03,.21)});}
 ballPatch(b,[0,.215,-.05],.022);
}
function spider(b:Builder,sp:BugSpecies){
 const [dark,white,grey]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[2]];
 ell(b,[.12,.09,.14],[0,.14,.1],dark,{},[8,6]);
 // Zebra abdomen: white chevrons across a black body.
 ell(b,[.13,.1,.18],[0,.15,-.17],(x,_y,z)=>{const k=(z+.17+Math.abs(x)*.6)*18;return Math.floor(k)%2===0?white:dark;},{},[10,12]);
 for(const s of [-1,1]){ell(b,[.036,.036,.03],[s*.042,.16,.235],'#0b0b0b',{},[6,5]);ell(b,[.02,.02,.02],[s*.09,.17,.21],'#0b0b0b',{},[5,4]);
  ell(b,[.012,.012,.012],[s*.03,.18,.26],'#ffffff',{},[4,3]);ell(b,[.03,.03,.04],[s*.04,.09,.25],white,{},[5,4]);}// eye glints, pedipalps
 const zs=[.18,.12,.06,0];
 zs.forEach((z,i)=>{for(const s of [-1,1]){const lo:Opt={leg:((i%2===0)===(s>0)?0:Math.PI),root:.08},sp2=[.14,.04,-.06,-.16][i];
  chain(b,[[s*.08,.12,z],[s*.22,.2,z+sp2*.5],[s*.3,0,z+sp2]],.016,.009,i===0?dark:grey,lo);}});
 flat(b,[[-.05,.06],[.05,.06],[.05,.14],[-.05,.14]],.232,white);// white face band
 ballPatch(b,[0,.232,.1],.02);
}
function caterpillar(b:Builder,sp:BugSpecies){
 const [main,dark,dot]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[2]];
 const n=9;for(let i=0;i<n;i++){const z=.4-i*.1,r=.085-Math.abs(i-3)*.004,y=r,o:Opt={leg:i*.8,legW:.035};
  ell(b,[r,r,.065],[0,y,z],(_x,_y,zz)=>Math.abs(zz-z+.03)<.014?dark:main,o,[8,6]);
  for(const s of [-1,1])flat(b,circle(s*r*.5,z,.016,5),y+r*.86,dot,o);
  ell(b,[.025,.02,.02],[0,.015,z],main,o,[5,4]);}
 ell(b,[.06,.06,.05],[0,.07,.47],'#5d8a2a',{leg:-.8,legW:.035},[6,5]);
 ballPatch(b,[0,.172,.1],.02,{leg:2.4,legW:.035});
}
function cicada(b:Builder,sp:BugSpecies){
 const [main,sec,dark]=[sp.look.palette[0],sp.look.palette[1],sp.look.palette[sp.look.palette.length-1]];
 ell(b,[.13,.07,.07],[0,.15,.32],main,{},[7,5]);for(const s of [-1,1])ell(b,[.04,.045,.04],[s*.13,.16,.31],'#7a2a1a',{},[5,4]);
 ell(b,[.12,.1,.13],[0,.16,.18],(x,_y,z)=>Math.abs(x)<.03&&z>.12?sec:main,{},[8,6]);ell(b,[.11,.09,.22],[0,.13,-.09],dark,{},[8,6]);
 antennae(b,dark,[.03,.17,.38],[.05,.18,.42],[.08,.18,.44],.005);
 legs(b,main,{rootX:.06,rootY:.1,zs:[.22,.14,.06],reach:.18,knee:.12,r:.013,splay:[.08,0,-.08]});
 ballPatch(b,[0,.262,.18],.03);
 const hy=.24;
 for(const s of [-1,1]){const co:Opt={wing:W(s,3,0,hy),sheen:.3};
  const F=mirror([[.02,.22],[.13,.18],[.2,-.1],[.17,-.44],[.1,-.47],[.04,-.12]],s);
  flat(b,F,hy,'#c9dae0',co,[],-s*.42,0);
  for(const v of [[[.03,.2],[.16,-.4]],[[.03,.18],[.1,-.44]],[[.06,.0],[.19,-.12]]] as const)flat(b,strip(mirror(v,s),.007),hy+.004,'#4b5a2a',co,[],-s*.42,0);
  flat(b,mirror(FAN.map(([x,z])=>[x*.9,z*1.1] as const),s),hy-.02,'#c9dae0',{wing:W(s,4,.04,hy-.02),sheen:.3});}
}

const BUILDERS:Record<string,(b:Builder,sp:BugSpecies)=>void>={
 butterfly,moth,dragonfly:(b,s)=>dragon(b,s,false),damselfly:(b,s)=>dragon(b,s,true),bee,
 ladybird:(b,s)=>beetle(b,s,'ladybird'),
 beetle:(b,s)=>beetle(b,s,s.id==='stag-beetle'?'stag':s.id==='ground-beetle'?'tiger':'rhino'),
 hopper,stick,ant,mantis,spider,caterpillar,cicada,
};
/** Every body the species table uses has a model (tests/bug-flight.cjs checks all 20). */
export const BUG_MODEL_BODIES=Object.keys(BUILDERS);
/** The full model of one species (or the firefly with `null`). */
export function createBugModel(sp:BugSpecies|null):T.BufferGeometry{
 const b=new Builder();
 if(!sp)beetle(b,null,'firefly');else{const f=BUILDERS[sp.look.body];if(!f)throw new Error('no bug model for '+sp.look.body);f(b,sp);}
 return b.finish();
}
/** The far silhouette (one for all species): a dark-ish body and two wings that spread with iPose.x, tinted per instance. */
export function createBugFarGeometry():T.BufferGeometry{
 const b=new Builder();
 ell(b,[.07,.07,.42],[0,.1,0],'#a8a39a',{},[5,3]);
 for(const s of [-1,1])flat(b,mirror([[.03,.2],[.48,.26],[.42,-.02],[.3,-.3],[.04,-.12]],s),.12,'#ffffff',{wing:W(s,4,.03,.12)});
 return b.finish();
}
export const triangleCount=(g:T.BufferGeometry)=>g.getAttribute('position').count/3;
