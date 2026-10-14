/**
 * Trophy room · the lathe (Oct 12 2026). A trophy is turned like a real one: bodies of revolution from a [radius, height] profile
 * in centimetres, plus the parts that are not round (handles, spiral bands, lotus petals, plaques, the globe's lines). Pure, so the
 * test can build every trophy in Node.
 *
 * The camera is the anatomy kit's orthographic iso camera (anatomy/iso-kit.ts): a horizontal circle of radius r is an ellipse
 * r·k wide and r·k·sin(elevation) tall, and height rises by z·k·cos(elevation). A point on a trophy at angle ψ from the viewer
 * (ψ = its own angle + the turntable's spin) lands at (cx + ρ·k·sin ψ, cy − z·k·cos e + ρ·k·sin e·cos ψ): ψ = 0 faces you.
 *
 * Painting (the anatomy rules):
 *  - a body is the union of the convex hulls of each pair of neighbouring rings (a frustum's picture IS that hull), outlined by
 *    stroking the union under its own fill so only the outer half of the hairline shows: one clean silhouette, no seams;
 *  - its front is toned by facing in five bands that follow the profile (light from the upper left) plus one thin gleam: the
 *    kit's four-tone look on a turned surface, the bands running smoothly up the curve, never a staircase;
 *  - parts that wrap the body (handles, spirals, petals) are split: the half behind the axis is painted before the bodies, the
 *    half in front after. Bodies and balls paint bottom to top (coaxial parts on a vertical axis seen from above).
 * Only decorations depend on the spin, so a turn redraws a handful of paths.
 */
export type Mat='gold'|'silver'|'whitegold'|'malachite'|'wood'|'paper'|'yellow';
export type Lathe={k:'lathe';part:string;mat:Mat;prof:readonly (readonly [number,number])[];open?:boolean;rings?:readonly number[]};
export type Handle={k:'handle';part:string;mat:Mat;at:readonly number[];t:number;curve:readonly (readonly [number,number])[]};
export type Helix={k:'helix';part:string;mat:Mat;prof:readonly (readonly [number,number])[];turns:number;count:number;t:number;phase?:number};
export type Ball={k:'sphere';part:string;mat:Mat;z:number;r:number;grid?:'globe'|'ball'};
export type Petals={k:'petals';part:string;mat:Mat;n:number;curve:readonly (readonly [number,number])[];half:readonly number[]};
export type Plaques={k:'plaques';part:string;mat:Mat;n:number;r:number;z:number;h:number;w:number};
export type Piece=Lathe|Handle|Helix|Ball|Petals|Plaques;

/** Five facing tones (left rim → highlight → front → shade → right rim), the flat-top tone, the inside of a bowl and the gleam. */
export const MATS:Record<Mat,{t:readonly [string,string,string,string,string];top:string;inner:string;spec:string;ball:readonly [string,string,string]}>={
 gold:{t:['#d3a73d','#f6d97c','#e6bd52','#c4962c','#9c731b'],top:'#efcf6c',inner:'#a87e22',spec:'#fff4cf',ball:['#fff0b8','#e3b748','#9a7019']},
 silver:{t:['#d2d4d5','#f4f5f5','#e2e3e4','#bfc1c3','#9a9da0'],top:'#ebeced',inner:'#a6a9ac',spec:'#ffffff',ball:['#ffffff','#d9dbdc','#9a9da0']},
 whitegold:{t:['#ddd7c4','#faf6e9','#ebe5d2','#cfc7ad','#aea58a'],top:'#f2edde',inner:'#b3aa90',spec:'#ffffff',ball:['#ffffff','#ece6d4','#aea58a']},
 malachite:{t:['#2c9767','#5ecb98','#36a573','#227f55','#145f3e'],top:'#47b884',inner:'#145f3e',spec:'#b9f0d4',ball:['#8fe0b8','#2c9767','#145f3e']},
 wood:{t:['#a2703f','#cf9c69','#b07c4b','#8d5f34','#6b4422'],top:'#bf8a57',inner:'#6b4422',spec:'#e6c49e',ball:['#d8aa78','#a2703f','#6b4422']},
 paper:{t:['#e9e9e4','#fbfbf8','#f2f2ee','#dcdcd7','#d3d3ce'],top:'#f7f7f3',inner:'#d3d3ce',spec:'#ffffff',ball:['#ffffff','#f2f2ee','#c9c9c4']},
 yellow:{t:['#efc23a','#fde58a','#f4cd4c','#dcae27','#bf9418'],top:'#f8d86a',inner:'#bf9418',spec:'#fff6cc',ball:['#fff1b3','#f2c230','#b88e14']},
};
export const EDGE='#3a3a3c',SIL='#2b2b2d';
const D2R=Math.PI/180;
/** Facing bands, in degrees from the viewer (−90 = left rim, +90 = right rim). */
const BANDS=[-90,-60,-26,12,52,90];

export type Mark={d:string;fill?:string;stroke?:string;w?:number;op?:number;part?:string};
export type Pose={c:readonly [number,number];k:number;elev:number;spin:number;
 /** 0..1 apart; parts lift by part.lift·apart cm and handles swing out by part.out·apart. */
 apart?:number;sil?:boolean};
export type Anchor={part:string;x:number;y:number};

const f1=(v:number)=>Math.round(v*10)/10;
const P=(pts:readonly (readonly [number,number])[],close=true)=>pts.length?pts.map(([x,y],i)=>`${i?'L':'M'}${f1(x)} ${f1(y)}`).join('')+(close?'Z':''):'';
function hull(pts:[number,number][]):[number,number][]{
 const s=[...pts].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(s.length<3)return s;
 const cr=(o:number[],a:number[],b:number[])=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:[number,number][]=[],up:[number,number][]=[];
 for(const p of s){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(let i=s.length-1;i>=0;i--){const p=s[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 return [...lo.slice(0,-1),...up.slice(0,-1)];
}
/** A Catmull-Rom spline through the points (any number of coordinates each), `per` samples per span: smooth handles and petals. */
export function smooth<T extends readonly number[]>(pts:readonly T[],per=6):number[][]{
 if(pts.length<3)return pts.map(p=>[...p]);const out:number[][]=[];
 for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let j=0;j<per;j++){const t=j/per,t2=t*t,t3=t2*t;
   out.push(p1.map((_,c)=>.5*(2*p1[c]+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t3)));}}
 out.push([...pts[pts.length-1]]);return out;
}
/** Linear interpolation of radius at height z along a profile. */
export function rAt(prof:readonly (readonly [number,number])[],z:number){
 if(z<=prof[0][1])return prof[0][0];
 for(let i=1;i<prof.length;i++)if(z<=prof[i][1]){const [r0,z0]=prof[i-1],[r1,z1]=prof[i];return z1===z0?r1:r0+(r1-r0)*(z-z0)/(z1-z0);}
 return prof[prof.length-1][0];
}

export type Trophyish={model:readonly Piece[];parts:readonly {id:string;lift:number;out?:number}[]};

/** Paint one trophy: a flat list of marks in painter's order, plus a leader-line anchor per part. */
export function drawTrophy(t:Trophyish,pose:Pose):{marks:Mark[];anchors:Anchor[]}{
 const {c,k,spin,sil=false}=pose,apart=pose.apart??0,sE=Math.sin(pose.elev*D2R),cE=Math.cos(pose.elev*D2R);
 const lift=(part:string)=>(t.parts.find(p=>p.id===part)?.lift??0)*apart,out=(part:string)=>(t.parts.find(p=>p.id===part)?.out??0)*apart;
 const S=(rho:number,psi:number,z:number):[number,number]=>[c[0]+rho*k*Math.sin(psi),c[1]-z*k*cE+rho*k*sE*Math.cos(psi)];
 const ell=(r:number,z:number,n=28):[number,number][]=>Array.from({length:n},(_,i)=>S(r,i/n*Math.PI*2,z));
 const arc=(r:number,z:number,a0:number,a1:number,n=18):[number,number][]=>Array.from({length:n+1},(_,i)=>S(r,(a0+(a1-a0)*i/n)*D2R,z));
 const back:Mark[]=[],mid:Mark[]=[],front:Mark[]=[],anchors:Anchor[]=[];
 const seen=new Set<string>();
 const tube=(list:Mark[],pts:[number,number][],w:number,mat:Mat,tone:number,part:string)=>{const d=P(pts,false),M=MATS[mat];
  if(sil){list.push({d,stroke:SIL,w,part});return;}
  list.push({d,stroke:EDGE,w:w+1.6,part},{d,stroke:M.t[tone],w,part});
  if(w>2.4)list.push({d,stroke:M.spec,w:Math.max(.8,w*.28),op:.75,part});};
 for(const p of t.model){
  const L=lift(p.part),O=out(p.part);
  if(p.k==='lathe'){
   const M=MATS[p.mat],prof=p.prof.map(([r,z])=>[r,z+L] as const),n=Math.max(20,Math.min(44,Math.round(Math.max(...prof.map(q=>q[0]))*k*.5)));
   const rings=prof.map(([r,z])=>ell(Math.max(r,.01),z,n));
   const hulls=rings.slice(1).map((rg,i)=>P(hull([...rings[i],...rg]))).join('');
   if(sil){mid.push({d:hulls,fill:SIL,part:p.part});continue;}
   mid.push({d:hulls,stroke:EDGE,w:1.6,fill:EDGE,part:p.part},{d:hulls,fill:M.top,part:p.part});
   // the facing bands up the profile (only where the surface is not a flat step)
   for(let b=0;b<5;b++){const a0=BANDS[b]*D2R,a1=BANDS[b+1]*D2R;
    const left=prof.map(([r,z])=>S(r,a0,z)),right=prof.map(([r,z])=>S(r,a1,z)).reverse();
    mid.push({d:P([...left,...right]),fill:M.t[b],part:p.part});}
   const g0=-46*D2R,g1=-38*D2R;mid.push({d:P([...prof.map(([r,z])=>S(r,g0,z)),...prof.map(([r,z])=>S(r,g1,z)).reverse()]),fill:M.spec,op:.7,part:p.part});
   // a flat step (a ring narrower than the next one down) shows its top: the kit's crease line along its front
   for(let i=1;i<prof.length;i++)if(prof[i][1]-prof[i-1][1]<.45&&prof[i-1][0]-prof[i][0]>.3)mid.push({d:P(arc(prof[i-1][0],prof[i-1][1],-90,90),false),stroke:EDGE,w:.6,op:.5,part:p.part});
   for(const z of p.rings??[]){const r=rAt(p.prof,z)+.02;mid.push({d:P(arc(r,z+L,-86,86),false),stroke:EDGE,w:.7,op:.55,part:p.part});}
   const [rt,zt]=prof[prof.length-1];
   if(p.open){const cx=c[0],[,cy]=S(0,0,zt),rx=rt*k,ry=rt*k*sE;
    // inside the bowl: the far wall faces you and catches the light, the near wall is in shade (a vertical ramp), a lip ring
    mid.push({d:P(ell(rt,zt,40)),fill:`url(#tr-in-${p.mat})`,part:p.part},
     {d:P(ell(rt*.9,zt,40)),stroke:EDGE,w:.6,op:.35,part:p.part},
     {d:P(ell(rt,zt,40)),stroke:EDGE,w:.8,part:p.part});void cx;void cy;void rx;void ry;}
   else if(rt>.6)mid.push({d:P(arc(rt,zt,-90,90),false),stroke:EDGE,w:.6,op:.45,part:p.part});
   if(!seen.has(p.part)){seen.add(p.part);const zm=(prof[0][1]+zt)/2;anchors.push({part:p.part,...xy(S(rAt(prof,zm),62*D2R,zm))});}
  }else if(p.k==='sphere'){
   const M=MATS[p.mat],[cx,cy]=S(0,0,p.z+L),r=p.r*k;
   if(sil){mid.push({d:circ(cx,cy,r),fill:SIL,part:p.part});continue;}
   mid.push({d:circ(cx,cy,r),stroke:EDGE,w:1.6,fill:`url(#tr-ball-${p.mat})`,part:p.part});
   const lines:string[]=[];
   const on=(lat:number,psi:number,z0:number)=>{const q:[number,number]=[cx+p.r*k*Math.cos(lat)*Math.sin(psi),cy-p.r*k*cE*Math.sin(lat)+p.r*k*sE*Math.cos(lat)*Math.cos(psi)];void z0;return q;};
   const vis=(lat:number,psi:number)=>Math.cos(lat)*Math.cos(psi)*cE+Math.sin(lat)*sE>.04;
   const run=(f:(s:number)=>[number,number],n:number)=>{let cur:[number,number][]=[];for(let i=0;i<=n;i++){const [lat,psi]=f(i/n);if(vis(lat,psi))cur.push(on(lat,psi,0));else{if(cur.length>1)lines.push(P(cur,false));cur=[];}}if(cur.length>1)lines.push(P(cur,false));};
   if(p.grid==='globe'){for(let m=0;m<8;m++){const lon=m/8*Math.PI*2+spin;run(s=>[-Math.PI/2+s*Math.PI,lon],24);}
    for(const lat of [-50,-25,0,25,50])run(s=>[lat*D2R,s*Math.PI*2],48);}
   else if(p.grid==='ball'){// three seams of a panelled ball, turning with the stand
    for(let g=0;g<3;g++){const tilt=[.5,1.1,-.7][g],ph=g*2.1+spin;run(s=>{const a=s*Math.PI*2,x=Math.cos(a),y=Math.sin(a)*Math.cos(tilt),z=Math.sin(a)*Math.sin(tilt);return [Math.asin(z),Math.atan2(y,x)+ph];},60);}}
   if(lines.length)mid.push({d:lines.join(''),stroke:EDGE,w:.7,op:.55,part:p.part});
   mid.push({d:circ(cx-r*.34,cy-r*.38,r*.16),fill:'#ffffff',op:.55,part:p.part});
   if(!seen.has(p.part)){seen.add(p.part);anchors.push({part:p.part,x:cx+r*.86,y:cy-r*.2});}
  }else if(p.k==='plaques'){
   const M=MATS[p.mat];if(sil)continue;
   for(let i=0;i<p.n;i++){const psi=i/p.n*Math.PI*2+spin+.13;const w2=p.w/2/p.r;
    if(Math.cos(psi)-Math.abs(Math.sin(w2))<.12)continue;
    const R=p.r+.12,z0=p.z+L,z1=z0+p.h,top=[0,1,2].map(j=>S(R,psi-w2+j*w2,z1)),bot=[0,1,2].map(j=>S(R,psi+w2-j*w2,z0));
    const tone=Math.sin(psi)<-.45?1:Math.sin(psi)<.3?2:3;
    mid.push({d:P([...top,...bot]),fill:M.t[tone],stroke:EDGE,w:.5,part:p.part});
    if(Math.cos(psi)>.5&&p.w*k>14)mid.push({d:P([S(R,psi-w2*.6,z0+p.h*.5),S(R,psi+w2*.35,z0+p.h*.5)],false),stroke:EDGE,w:.5,op:.45,part:p.part});}
  }else if(p.k==='handle'){
   const curve=smooth(p.curve,6);
   for(const a of p.at){const psi=a+spin,pts=curve.map(([rho,z])=>S(rho+O,psi,z+L)),w=2*p.t*k;
    const tone=Math.sin(psi)<-.35?1:Math.sin(psi)<.35?2:3;
    tube(Math.cos(psi)>=0?front:back,pts,w,p.mat,tone,p.part);
    if(!seen.has(p.part)||Math.sin(psi)>.3){const [x,y]=pts[Math.floor(pts.length*.45)];const i=anchors.findIndex(q=>q.part===p.part);
     if(i<0||x>anchors[i].x){if(i>=0)anchors.splice(i,1);anchors.push({part:p.part,x,y});}seen.add(p.part);}}
  }else if(p.k==='helix'){
   const z0=p.prof[0][1],z1=p.prof[p.prof.length-1][1],N=56,w=Math.max(1.2,2*p.t*k);
   for(let s=0;s<p.count;s++){let cur:[number,number][]=[],isFront:boolean|null=null,sinSum=0;
    const flush=()=>{if(cur.length>1){const tone=sinSum/cur.length<-.35?1:sinSum/cur.length<.35?2:3;tube(isFront?front:back,cur,w,p.mat,isFront?tone:4,p.part);}};
    for(let i=0;i<=N;i++){const u=i/N,z=z0+(z1-z0)*u,psi=(p.phase??0)+s/p.count*Math.PI*2+p.turns*Math.PI*2*u+spin,rho=rAt(p.prof,z)+p.t*.4+O,f=Math.cos(psi)>=0;
     const q=S(rho,psi,z+L);
     if(isFront!==null&&f!==isFront){cur.push(q);flush();cur=[q];sinSum=0;}
     isFront=f;cur.push(q);sinSum+=Math.sin(psi);}
    flush();}
   if(!seen.has(p.part)){seen.add(p.part);const z=(z0+z1)*.55;anchors.push({part:p.part,...xy(S(rAt(p.prof,z)+O,80*D2R,z+L))});}
  }else if(p.k==='petals'){
   const M=MATS[p.mat],list:{d:number;m:Mark[];f:boolean}[]=[];
   const cv=smooth(p.curve.map(([rho,z],j)=>[rho,z,p.half[j]]),5);
   for(let i=0;i<p.n;i++){const psi=i/p.n*Math.PI*2+spin+.3,f=Math.cos(psi)>=0;
    const L1=cv.map(([rho,z,h])=>S(rho+O,psi-h/Math.max(rho,1),z+L)),R1=cv.map(([rho,z,h])=>S(rho+O,psi+h/Math.max(rho,1),z+L)).reverse();
    const d=P([...L1,...R1]);
    if(sil){list.push({d:Math.cos(psi),f,m:[{d,fill:SIL,stroke:SIL,w:1,part:p.part}]});continue;}
    const tone=f?(Math.sin(psi)<-.5?1:Math.sin(psi)<.2?2:Math.sin(psi)<.65?3:4):1;
    const rib=P(cv.slice(0,-6).map(([rho,z])=>S(rho+O,psi,z+L)),false);
    list.push({d:Math.cos(psi),f,m:[{d,fill:f?M.t[tone]:M.top,part:p.part},{d:rib,stroke:EDGE,w:.6,op:.4,part:p.part},{d,stroke:EDGE,w:.8,part:p.part}]});}
   list.sort((a,b)=>a.d-b.d);for(const x of list)(x.f?front:back).push(...x.m);
   if(!seen.has(p.part)){seen.add(p.part);const [rho,z]=p.curve[3];anchors.push({part:p.part,...xy(S(rho+O,78*D2R,z+L))});}
  }
 }
 return {marks:[...back,...mid,...front],anchors};
}
const xy=([x,y]:[number,number])=>({x,y});
const circ=(cx:number,cy:number,r:number)=>`M${f1(cx-r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(r*2)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r*2)} 0Z`;

/** Screen box of a trophy at a pose (for hit areas and fits): x from the reach, y from the foot to the top. */
export function trophyBox(reachCm:number,heightCm:number,pose:Pose){const sE=Math.sin(pose.elev*D2R),cE=Math.cos(pose.elev*D2R),{c,k}=pose;
 return {x:c[0]-reachCm*k,y:c[1]-heightCm*k*cE-reachCm*k*sE*.6,w:reachCm*k*2,h:heightCm*k*cE+reachCm*k*sE*1.6};}
