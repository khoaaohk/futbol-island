/**
 * laws-1863 · the thin-line drawing kit (Oct 9 2026, "thin line art motion storytelling"). Every picture in the exhibit is a set of
 * named monoline strokes (one hairline weight, round caps and joins, bright edge / dim detail, one accent for what changed), in the
 * line language of the museum's Hairline engine (components/museum/experiences/timeline/hairline, a port of @lucasmarkes/hairline,
 * MIT). Strokes are polylines; LineMorph resamples a stroke to a fixed number of points so any stroke can morph into any other
 * stroke with the same name (a tape sags, then straightens into a crossbar; scattered players walk into a formation; a leg swings
 * through a kick). Pure geometry: no DOM, tested in Node.
 */
export type Pt=readonly [number,number];
export type Tone='ink'|'dim'|'accent';
export type Stroke={pts:readonly Pt[];smooth?:boolean;closed?:boolean;tone?:Tone;dash?:boolean};
export type Drawing=Readonly<Record<string,Stroke>>;

export const N=36;
const r1=(n:number)=>Math.round(n*10)/10;

/** Resample a polyline to n points spaced evenly along its length (closed strokes include the closing segment). */
export function resample(pts:readonly Pt[],n=N,closed=false):Pt[]{
 const P=closed&&pts.length>2?[...pts,pts[0]]:[...pts];if(P.length<2)return Array.from({length:n},()=>P[0]??[0,0]);
 const d=[0];for(let i=1;i<P.length;i++)d.push(d[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const L=d[d.length-1]||1,out:Pt[]=[];let j=1;
 for(let k=0;k<n;k++){const t=closed?k/n*L:k/(n-1)*L;while(j<d.length-1&&d[j]<t)j++;const a=P[j-1],b=P[j],seg=d[j]-d[j-1]||1,u=Math.min(1,Math.max(0,(t-d[j-1])/seg));
  out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);}
 return out;
}
export const mix=(a:readonly Pt[],b:readonly Pt[],t:number):Pt[]=>a.map((p,i)=>[p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t]);

/** SVG path data: straight runs, or a Catmull–Rom spline through the points (closed strokes close smoothly). */
export function toPath(pts:readonly Pt[],smooth=false,closed=false):string{
 if(pts.length<2)return '';
 if(!smooth)return 'M'+pts.map(p=>r1(p[0])+' '+r1(p[1])).join('L')+(closed?'Z':'');
 const P=pts,n=P.length,at=(i:number)=>closed?P[(i+n)%n]:P[Math.max(0,Math.min(n-1,i))];
 let d=`M${r1(P[0][0])} ${r1(P[0][1])}`;const last=closed?n:n-1;
 for(let i=0;i<last;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);
  d+=`C${r1(p1[0]+(p2[0]-p0[0])/6)} ${r1(p1[1]+(p2[1]-p0[1])/6)} ${r1(p2[0]-(p3[0]-p1[0])/6)} ${r1(p2[1]-(p3[1]-p1[1])/6)} ${r1(p2[0])} ${r1(p2[1])}`;}
 return d+(closed?'Z':'');
}

// ---- shapes ----
export const line=(a:Pt,b:Pt,o:Partial<Stroke>={}):Stroke=>({pts:[a,b],...o});
export const ring=(c:Pt,r:number,o:Partial<Stroke>={},ry=r,n=24):Stroke=>({pts:Array.from({length:n},(_,k)=>{const a=-Math.PI/2+k/n*Math.PI*2;return [c[0]+r*Math.cos(a),c[1]+ry*Math.sin(a)] as Pt;}),smooth:true,closed:true,...o});
export const curve=(pts:readonly Pt[],o:Partial<Stroke>={}):Stroke=>({pts,smooth:true,...o});
/** A quadratic arc from a to b bowed by h (negative = up). */
export const arc=(a:Pt,b:Pt,h:number,o:Partial<Stroke>={},n=12):Stroke=>{const m:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2+h];
 return {pts:Array.from({length:n+1},(_,k)=>{const t=k/n,u=1-t;return [u*u*a[0]+2*u*t*m[0]+t*t*b[0],u*u*a[1]+2*u*t*m[1]+t*t*b[1]] as Pt;}),smooth:true,...o};};
export const rect=(x0:number,y0:number,x1:number,y1:number,o:Partial<Stroke>={},r=3):Stroke=>{
 const c=(cx:number,cy:number,a0:number):Pt[]=>[0,1,2,3].map(k=>{const a=a0+k/3*Math.PI/2;return [cx+r*Math.cos(a),cy+r*Math.sin(a)] as Pt;});
 return {pts:[...c(x1-r,y0+r,-Math.PI/2),...c(x1-r,y1-r,0),...c(x0+r,y1-r,Math.PI/2),...c(x0+r,y0+r,Math.PI)],closed:true,...o};};
export const cross=(c:Pt,s:number,key:string,o:Partial<Stroke>={}):Record<string,Stroke>=>({[key+'a']:line([c[0]-s,c[1]-s],[c[0]+s,c[1]+s],o),[key+'b']:line([c[0]+s,c[1]-s],[c[0]-s,c[1]+s],o)});
export const ball=(c:Pt,r=3.2,o:Partial<Stroke>={}):Stroke=>ring(c,r,o,r,16);

// ---- the line figure: a bean-proportioned player in five strokes and a head ----
type Pose={neck:Pt;head:Pt;armL:[Pt,Pt];armR:[Pt,Pt];legL:[Pt,Pt];legR:[Pt,Pt]};
/** Key points relative to the hip (y up is negative), facing right, at scale 1 (a player ≈ 44 units tall). */
export const POSES={
 stand:{neck:[0,-15],head:[0,-21],armL:[[-4,-8],[-5,-1]],armR:[[4,-8],[5,-1]],legL:[[-2.5,9],[-3.5,18]],legR:[[2.5,9],[3.5,18]]},
 run:{neck:[3,-14.5],head:[4.6,-20.2],armL:[[-3,-9],[-7.5,-4]],armR:[[8,-11],[11,-6]],legL:[[-6,7],[-11.5,12.5]],legR:[[6,7],[5,17]]},
 windup:{neck:[-1,-15],head:[-1.5,-21],armL:[[-8,-11],[-13,-9]],armR:[[6,-10],[10,-6]],legL:[[0,9],[0,18]],legR:[[-5,7],[-11,4]]},
 kick:{neck:[-2.5,-14.5],head:[-3.6,-20.2],armL:[[-9,-12],[-15,-10.5]],armR:[[6,-10],[11.5,-8.5]],legL:[[-1.5,9],[-2.5,18]],legR:[[8,4.5],[15.5,3]]},
 catch:{neck:[0,-15],head:[0,-21],armL:[[-7.5,-20],[-5,-28]],armR:[[7.5,-20],[5,-28]],legL:[[-2.5,9],[-3.5,18]],legR:[[2.5,9],[3.5,18]]},
 throw:{neck:[-.6,-15],head:[.4,-21],armL:[[-3.5,-22],[-6,-25]],armR:[[2,-22],[-1.6,-26.5]],legL:[[-4,9],[-6.5,18]],legR:[[4,9],[7,18]]},
 point:{neck:[0,-15],head:[0,-21],armL:[[-4,-8],[-5,-1]],armR:[[7,-14],[14,-15]],legL:[[-2.5,9],[-3.5,18]],legR:[[2.5,9],[3.5,18]]},
 card:{neck:[0,-15],head:[0,-21],armL:[[-4,-8],[-5,-1]],armR:[[4,-23],[4.5,-30]],legL:[[-2.5,9],[-3.5,18]],legR:[[2.5,9],[3.5,18]]},
 fall:{neck:[9,-10],head:[13.5,-13.5],armL:[[13,-4],[16,1.5]],armR:[[11,-2.5],[14,3.5]],legL:[[-5,8],[-9.5,14.5]],legR:[[-1.5,9],[-8,11]]},
} as const satisfies Record<string,Pose>;
export type PoseName=keyof typeof POSES;
/** A player at hip-foot position (x, ground) facing ±1. Keys: `${id}.head|body|armL|armR|legL|legR`. */
export function person(id:string,x:number,ground:number,pose:PoseName,o:{face?:1|-1;s?:number;tone?:Tone}={}):Record<string,Stroke>{
 const p=POSES[pose],f=o.face??1,s=o.s??1,hy=ground-18*s,P=(q:Pt):Pt=>[x+q[0]*s*f,hy+q[1]*s],tone=o.tone??'ink';
 const limb=(a:readonly [Pt,Pt],from:Pt):Stroke=>({pts:[P(from),P(a[0]),P(a[1])],smooth:true,tone});
 return {
  [id+'.head']:ring(P(p.head),4.6*s,{tone},4.6*s,18),
  [id+'.body']:{pts:[P([0,0]),P([(p.neck[0])*.5,p.neck[1]*.5+.4]),P(p.neck)],smooth:true,tone},
  [id+'.armL']:limb(p.armL,p.neck),[id+'.armR']:limb(p.armR,p.neck),
  [id+'.legL']:limb(p.legL,[0,0]),[id+'.legR']:limb(p.legR,[0,0]),
 };
}
/** Where a pose's hands meet (for a ball held up or over the head). */
export function hands(x:number,ground:number,pose:PoseName,face:1|-1=1,s=1):Pt{const p=POSES[pose];return [x+(p.armL[1][0]+p.armR[1][0])/2*s*face,ground-18*s+(p.armL[1][1]+p.armR[1][1])/2*s];}
/** The kicking foot of a pose. */
export const foot=(x:number,ground:number,pose:PoseName,face:1|-1=1,s=1):Pt=>{const p=POSES[pose];return [x+p.legR[1][0]*s*face,ground-18*s+p.legR[1][1]*s];};
