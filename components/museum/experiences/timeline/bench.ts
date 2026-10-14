import {axisVector,boxCorners,cameraOf,circleRing,corners,cylinder,depthOf,extrude,fitProjection,insetPlan,iso,knurl,lineOnTop,onTop,planOutline,radialTicks,ring,sideArc,sideSeam,slabOf,topTicks,pathOf,
 type Flat,type LineTone,type Plan,type Plane,type Projection,type SolidPaths,type Tone} from '../anatomy/iso-kit';

/**
 * timeline · the DISPLAY BENCH (Oct 12 2026, anatomy restyle; the shared kit in ../anatomy; replaces the pixel time machine).
 * Football's story as a long museum bench on feet: twelve turntable stands, one per case, each carrying a small turned or built
 * artifact (the book of laws, the penalty goal, a folded numbered shirt, the 1930 cup, a stadium under its arch, a boot with
 * studs, a laced ball on a ring, a TV set, a futsal court, the 1991 trophy, the VAR monitor, a Trophy room cup). A carriage
 * runs on twin rails along the front: its pointer marks the case you're at, and its handwheel is the crank (one turn = 1.5
 * cases). The bench slides under the carriage; the current artifact is lit and ringed in the exhibit's one accent (blue).
 * Pure geometry: tests build every artifact in Node.
 */
export type Item=
 |{k:'solid';paths:SolidPaths;tone?:Tone;crease?:Tone|'none';lit?:boolean;flat?:boolean;cls?:string;inner?:string}
 |{k:'line';d:string;tone?:LineTone;cls?:string;free?:boolean}
 |{k:'dots';pts:Flat[];size?:number;tone?:Tone}
 |{k:'ball';c:Flat;r:number;cls?:string}
 |{k:'shadow';d:string;o:number};
export const SP=7,AZ=74,STAND_R=2.2,STAND_H=.55;
export const standX=(i:number)=>i*SP;
export const HUB={x:0,y:4.85,z:1.1},WHEEL_R=1.35;
const RAILS=[4.3,5.1] as const;

/** The camera: frame `span` metres of bench around the carriage (about three cases on a desktop, under two on a phone). */
export function benchCamera(w:number,h:number):Projection{
 // Wide (Oct 12 2026 polish): frame the stands and the carriage tightly (not the whole depth of the plate) at a lower elevation,
 // so the bench sits centred and big in the card instead of small and low with empty paper above it.
 if(w/h>1){const span=w/h>1.6?SP*1.6:SP*1.45;
  return fitProjection(boxCorners({x:-span/2,y:-1.6,w:span,d:7.8,r:0},-.4,2.6),Math.max(80,w),Math.max(80,h),{pad:10,headroom:h<520?14:22,azimuth:AZ,elevation:32});}
 const span=SP*.95;
 return fitProjection(boxCorners({x:-span/2,y:-2.4,w:span,d:8.8,r:0},-.6,3.4),Math.max(80,w),Math.max(80,h),{pad:10,headroom:h<520?14:26,azimuth:AZ,elevation:38});
}
/** Screen offset that slides the bench so case `pos` sits under the carriage. */
export const slide=(P:Projection,pos:number):Flat=>axisVector(P,[-pos*SP,0,0]);
/** Screen px per case along the bench (for drags). */
export const pxPerCase=(P:Projection)=>{const v=axisVector(P,[SP,0,0]);return Math.hypot(v[0],v[1])*Math.sign(v[0]||1);};
/** A screen point → the floor plane at height z (world metres), for the handwheel. */
export function floorAt(P:Projection,sx:number,sy:number,z=0):[number,number]{
 const {sinA,cosA,sinE,cosE,k}=cameraOf(P),u=(sx-P.origin[0])/k,v=((sy-P.origin[1])/k+z*cosE)/sinE;
 return [u*sinA+v*cosA,-u*cosA+v*sinA];
}
/** The handwheel's angle under a pointer (radians, in the wheel's plane). */
export const wheelAngle=(P:Projection,sx:number,sy:number)=>{const [x,y]=floorAt(P,sx,sy,HUB.z+.3);return Math.atan2(y-HUB.y,x-HUB.x);};

const ball=(P:Projection,x:number,y:number,z:number,r:number,cls?:string):Item=>({k:'ball',c:iso([x,y,z+r],P),r:r*cameraOf(P).k,cls});
const S=(paths:SolidPaths,o:Omit<Extract<Item,{k:'solid'}>,'k'|'paths'>={}):Item=>({k:'solid',paths,...o});
const L=(d:string,tone:LineTone='lo',o:{cls?:string;free?:boolean}={}):Item=>({k:'line',d,tone,...o});

/** One case's artifact, centred on (cx, 0), standing on z. `lit` marks the case you're at. */
export function artifact(id:string,P:Projection,cx:number,z:number,lit=false):Item[]{
 const it:Item[]=[],hi:Tone='hi';
 const box=(pl:Plan,z0:number,h:number,o:{tone?:Tone;bevel?:number;lit?:boolean;inner?:string}={})=>it.push(S(slabOf({...pl,x:pl.x+cx},z0,h,P,4,o.bevel??0),{tone:o.tone??hi,lit:o.lit,inner:o.inner}));
 const cyl=(x:number,y:number,r:number,z0:number,h:number,o:{tone?:Tone;lit?:boolean;inner?:string}={})=>it.push(S(cylinder(cx+x,y,r,z0,h,P,28),{tone:o.tone??hi,lit:o.lit,inner:o.inner}));
 switch(id){
  case 'laws-1863':{// a lectern with the book of laws, a second book under it
   box({x:-1.1,y:-.8,w:2.2,d:1.6,r:.1},z,.3,{tone:'mid'});
   box({x:-.9,y:-.65,w:1.8,d:1.3,r:.08},z+.3,.22,{inner:sideSeam({x:cx-.9,y:-.65,w:1.8,d:1.3,r:.08},z+.41,P,4)});
   box({x:-.8,y:-.55,w:1.6,d:1.1,r:.06},z+.52,.34,{lit,inner:sideSeam({x:cx-.8,y:-.55,w:1.6,d:1.1,r:.06},z+.62,P,4)+sideSeam({x:cx-.8,y:-.55,w:1.6,d:1.1,r:.06},z+.74,P,4)});
   it.push(L(lineOnTop([cx,-.55],[cx,.55],z+.86,P),'mid'));
   it.push(L([0,1,2].map(i=>lineOnTop([cx-.65,-.35+i*.22],[cx-.15-i*.12,-.35+i*.22],z+.86,P)).join(''),'lo',{free:true}));break;}
  case 'penalty-1891':{// a small goal, the spot and the ball
   for(const y of [-1.3,1.3])cyl(-.9,y,.07,z,1.3,{tone:'hi'});
   box({x:-.97,y:-1.37,w:.14,d:2.74,r:.04},z+1.24,.14,{lit});
   it.push(L([-.9,-.5,-.1,.3,.7,1.1].map(y=>lineOnTop([cx-.9,y],[cx-1.5,y],z+.02,P)).join(''),'faint'));
   it.push(L(ring(cx+.7,0,.12,z+.01,P,12),'mid'));it.push(ball(P,cx+.7,0,z,.3,'ball'));break;}
  case 'shirts':{// a folded shirt on a tilted board, a number on its back
   box({x:-1.2,y:-1,w:2.4,d:2,r:.12},z,.18,{tone:'mid'});
   const T:Plane[]=[[-.55,-.95],[.55,-.95],[.55,-.35],[.95,-.2],[.75,.25],[.55,.15],[.55,.95],[-.55,.95],[-.55,.15],[-.75,.25],[-.95,-.2],[-.55,-.35]].map(([x,y])=>[cx+y,x] as Plane);
   it.push(S(extrude(T,z+.18,.16,P,{convex:false}),{tone:hi,lit}));
   it.push(L(ring(cx-.7,0,.18,z+.34,P,16),'lo'));
   it.push(L(lineOnTop([cx-.2,-.18],[cx+.25,-.18],z+.34,P)+lineOnTop([cx+.25,-.18],[cx+.25,.15],z+.34,P)+lineOnTop([cx-.2,.15],[cx+.25,.15],z+.34,P)+lineOnTop([cx-.2,-.18],[cx-.2,.15],z+.34,P),'mid',{free:true}));break;}
  case 'worldcup-1930':case 'wwc-1991':{// a stepped base and a cup (1930) or a spiral spire with a ball (1991)
   box({x:-.7,y:-.7,w:1.4,d:1.4,r:.08},z,.35,{tone:'mid',bevel:.05});cyl(0,0,.45,z+.35,.25,{tone:'mid'});
   if(id==='worldcup-1930'){cyl(0,0,.12,z+.6,.55);it.push(S(slabOf({x:cx-.05,y:-.82,w:.1,d:.22,r:.05},z+1.25,.45,P,3),{tone:hi}));
    cyl(0,0,.62,z+1.12,.85,{lit,inner:sideArc(cx,0,.62,z+1.7,P,24)});it.push(L(ring(cx,0,.52,z+1.97,P,36),'lo'));
    it.push(S(slabOf({x:cx-.05,y:.6,w:.1,d:.22,r:.05},z+1.25,.45,P,3),{tone:hi}));}
   else{cyl(0,0,.32,z+.6,.4);cyl(0,0,.2,z+1,.6,{lit,inner:sideArc(cx,0,.2,z+1.3,P,16)});cyl(0,0,.12,z+1.6,.3);it.push(ball(P,cx,0,z+1.9,.42,lit?'globe lit':'globe'));}
   break;}
  case 'laced-leather':{// a heavy laced ball on a ring stand
   cyl(0,0,.75,z,.12,{tone:'mid'});cyl(0,0,.12,z+.12,.5,{tone:'mid'});it.push(L(ring(cx,0,.42,z+.66,P,28),'mid'));
   it.push(ball(P,cx,0,z+.55,.78,lit?'leather lit':'leather'));break;}
  case 'stadiums':{// a stadium on a plate: a back stand under a white arch, two ends, a front stand, the pitch in the middle
   box({x:-1.25,y:-1.05,w:2.5,d:2.1,r:.12},z,.16,{tone:'mid',bevel:.03});
   box({x:-1.15,y:-1,w:2.3,d:.45,r:.04},z+.16,.75,{inner:sideSeam({x:cx-1.15,y:-1,w:2.3,d:.45,r:.04},z+.5,P,3)});
   it.push(L(pathOf(Array.from({length:21},(_,j)=>{const f=j/20;return iso([cx-1.3+2.6*f,-1.12,z+.95+1.05*(1-(2*f-1)**2)],P);})),'hi'));
   box({x:-1.15,y:-.52,w:.36,d:1,r:.04},z+.16,.45);
   box({x:-.7,y:-.45,w:1.4,d:.9,r:.04},z+.16,.06,{lit});
   it.push(L(lineOnTop([cx,-.45],[cx,.45],z+.22,P)+ring(cx,0,.16,z+.22,P,16),'mid'));
   box({x:.79,y:-.52,w:.36,d:1,r:.04},z+.16,.45);
   box({x:-1.15,y:.5,w:2.3,d:.45,r:.04},z+.16,.28);break;}
  case 'boots':{// a boot on a little stand: studs under the sole, a high heel and a laced toe
   box({x:-.95,y:-.6,w:1.9,d:1.2,r:.1},z,.2,{tone:'mid',bevel:.03});
   for(const x of [-.6,-.2,.25,.6])cyl(x,0,.07,z+.2,.12,{tone:'mid'});
   box({x:-.85,y:-.3,w:1.7,d:.6,r:.22},z+.32,.12);
   box({x:-.85,y:-.3,w:.75,d:.6,r:.2},z+.44,.75,{lit,inner:sideSeam({x:cx-.85,y:-.3,w:.75,d:.6,r:.2},z+.9,P,4)});
   box({x:-.12,y:-.28,w:.95,d:.56,r:.26},z+.44,.28);
   it.push(L([.05,.22,.39].map(x=>lineOnTop([cx+x,-.16],[cx+x,.16],z+.72,P)).join(''),'mid'));break;}
  case 'telstar-1970':{// a TV set on legs, a dotted ball beside it
   for(const [x,y] of [[-.55,-.7],[.45,-.7],[-.55,.6],[.45,.6]])cyl(x,y,.06,z,.45,{tone:'mid'});
   const tv:Plan={x:cx-.75,y:-.95,w:1.4,d:1.9,r:.12};it.push(S(slabOf(tv,z+.45,1.3,P,4,.06),{tone:hi,lit,inner:sideSeam(tv,z+.6,P,4)}));
   it.push(L(planOutline({x:cx-.6,y:-.8,w:1.1,d:1.6,r:.1},z+1.75,P,4),'faint'));
   it.push(S(slabOf({x:cx+.65,y:-.75,w:.06,d:1.25,r:.12},z+.65,.95,P,4),{tone:'lo',crease:'none'}));
   it.push(L(lineOnTop([cx-.1,-.2],[cx-.4,-.5],z+1.75,P)+lineOnTop([cx-.1,.2],[cx-.4,.5],z+1.75,P),'mid'));
   it.push(ball(P,cx+.6,1.45,z,.32,'telstar'));break;}
  case 'futsal-1989':{// a small court with two goals
   const c:Plan={x:cx-1.3,y:-.9,w:2.6,d:1.8,r:.04};it.push(S(slabOf(c,z,.12,P,3),{tone:'mid',lit}));
   it.push(L(planOutline(insetPlan(c,.12),z+.12,P,3)+lineOnTop([cx,-.78],[cx,.78],z+.12,P)+ring(cx,0,.3,z+.12,P,20),'mid'));
   for(const s of [-1,1]){const gx=cx+s*1.18;for(const y of [-.32,.32])it.push(S(cylinder(gx,y,.04,z+.12,.4,P,10),{tone:hi}));it.push(S(slabOf({x:gx-.04,y:-.36,w:.08,d:.72,r:.02},z+.48,.06,P,2),{tone:hi}));}
   it.push(ball(P,cx+.3,.25,z+.12,.14,'ball'));break;}
  case 'var-2018':{// a monitor on a post, a base with a fader
   box({x:-.7,y:-.7,w:1.4,d:1.4,r:.1},z,.2,{tone:'mid',bevel:.04});cyl(0,0,.1,z+.2,1.1,{tone:'mid'});
   const m:Plan={x:cx-.12,y:-1.05,w:.24,d:2.1,r:.04};it.push(S(slabOf(m,z+1.1,1.25,P,3,.03),{tone:hi,lit}));
   it.push(S(slabOf({x:cx+.12,y:-.92,w:.02,d:1.84,r:0},z+1.22,1.0,P,1),{tone:'lo',crease:'none'}));
   it.push(L(planOutline({x:cx-.2,y:-.25,w:.4,d:.5,r:.04},z+.2,P,3),'lo'));break;}
  default:{// hall-of-fame, the Trophy room: a cabinet shelf with three cups, the middle (yours) lit (Oct 12 2026; was a certificate)
   box({x:-.5,y:-1.2,w:1,d:2.4,r:.06},z,.22,{tone:'mid',bevel:.03});box({x:-.45,y:-1.15,w:.12,d:2.3,r:.03},z+.22,1.5,{tone:'mid'});
   for(const [y,h,on] of [[-.75,.7,false],[0,1,true],[.75,.6,false]] as const){cyl(0,y,.2,z+.22,.08,{tone:'mid'});cyl(0,y,.06,z+.3,h*.45);
    cyl(0,y,.3,z+.3+h*.45,h*.5,{lit:on&&lit,tone:on?'hi':'mid',inner:sideArc(cx,y,.3,z+.3+h*.7,P,20)});}}
 }
 return it;
}

/** The static bench: halo, feet, top with a seam, twin front rails and end stops, a ruler with a major tick at every stand,
 *  and one turntable stand (with degree ticks and a label plate) per case, its artifact on top. */
export function benchItems(ids:readonly string[],P:Projection,lit=-1):Item[]{
 const n=ids.length,plan:Plan={x:-SP*1.1,y:-3.2,w:(n-1)*SP+SP*2.2,d:9.2,r:.6},it:Item[]=[],z0=-1.1,zf=-1.8;
 it.push({k:'shadow',d:slabOf({...plan,x:plan.x+.6,y:plan.y+.4,w:plan.w-1.2,d:plan.d-.4},z0-.2,.05,P).fill,o:.55});
 const feet:[number,number][]=[];for(let x=plan.x+1.6;x<plan.x+plan.w;x+=SP*2)for(const y of [plan.y+1.2,plan.y+plan.d-1.2])feet.push([x,y]);
 feet.sort((a,b)=>depthOf([a[0],a[1],0],P)-depthOf([b[0],b[1],0],P));
 for(const [x,y] of feet){it.push(S(cylinder(x,y,.55,zf,.1,P,24),{tone:'lo'}),S(cylinder(x,y,.4,zf+.1,.6,P,24),{tone:'mid'}));}
 it.push(S(slabOf(plan,z0,1.1,P,8,.2),{tone:'mid',inner:sideSeam(plan,z0+.45,P,8)}));
 it.push(L(corners(plan,.5).map(([x,y])=>ring(x,y,.16,0,P,14)).join(''),'lo'));
 it.push({k:'dots',pts:corners(plan,.5).map(([x,y])=>iso([x,y,0],P)),size:.8,tone:'mid'});
 // the ruler strip along the back edge, a major tick under every stand
 const ru:Plan={x:plan.x+1,y:plan.y+.35,w:plan.w-2,d:.5,r:.06};it.push(S(slabOf(ru,0,.05,P,3),{tone:'lo',crease:'none'}));
 const t=topTicks(0,(n-1)*SP,1,SP,ru.y+ru.d-.02,.05,[-.18,-.34],P,'x');it.push(L(t.minor,'lo'),L(t.major,'mid'));
 // stands, back to front along the bench (all at y = 0, so in x order)
 ids.forEach((id,i)=>{const x=standX(i);
  it.push({k:'shadow',d:onTop(circleRing(x+.1,.1,STAND_R,40),0,P,true),o:.55});
  it.push(S(cylinder(x,0,STAND_R,0,.18,P,48),{tone:'lo'}),S(cylinder(x,0,STAND_R-.15,.18,STAND_H-.18,P,48,.04),{tone:'mid',cls:'stand'}));
  const rt=radialTicks(x,0,STAND_R-.25,48,6,STAND_H,[.14,.3],P);it.push(L(rt.minor,'faint'),L(rt.major,'lo'));
  it.push({k:'dots',pts:[iso([x,0,STAND_H],P)],size:.9,tone:'mid'});
  const lp:Plan={x:x-.6,y:STAND_R+.25,w:1.2,d:.42,r:.06};it.push(S(slabOf(lp,0,.06,P,3),{tone:'lo',crease:'none'}),L(lineOnTop([lp.x+.18,lp.y+.21],[lp.x+.75,lp.y+.21],.06,P),'lo',{free:true}));
  it.push(...artifact(id,P,x,STAND_H,i===lit));
 });
 // twin rails along the front with end stops
 for(const y of RAILS)it.push(S(slabOf({x:plan.x+.8,y:y-.12,w:plan.w-1.6,d:.24,r:.08},0,.22,P,3),{tone:'mid'}));
 for(const x of [plan.x+.5,plan.x+plan.w-1])it.push(S(slabOf({x,y:RAILS[0]-.35,w:.5,d:1.5,r:.1},0,.45,P,3,.04),{tone:'mid'}));
 return it;
}
/** The ring that marks the case you're at (accent) – drawn on the stand top at the bench's current slide. */
export const markRing=(P:Projection,i:number):Item[]=>[{k:'line',d:sideArc(standX(i),0,STAND_R-.15,STAND_H,P,48),tone:'lit',cls:'accentLine'}];

/** The carriage at the centre of the view: a block on the rails, a pointer arm toward the stand, and the handwheel (static
 *  part); the handle (wheelHandle) is rebuilt at the wheel's angle. */
export function carriageItems(P:Projection):Item[]{
 const it:Item[]=[],c:Plan={x:-1.7,y:3.8,w:3.4,d:2.1,r:.2};
 it.push({k:'shadow',d:slabOf(c,0,.05,P).fill,o:.7});
 for(const y of RAILS)for(const x of [-1.5,1.1])it.push(S(slabOf({x,y:y-.22,w:.4,d:.44,r:.08},.22,.2,P,3),{tone:'mid'}));
 it.push(S(slabOf(c,.42,.55,P,5,.06),{tone:'hi',inner:sideSeam(c,.66,P,5)}));
 it.push(L(corners(c,.28).map(([x,y])=>ring(x,y,.09,.97,P,10)).join(''),'lo'));
 it.push(S(slabOf({x:-.18,y:2.35,w:.36,d:1.5,r:.06},.72,.18,P,3),{tone:'hi'}));
 it.push(S(cylinder(0,2.4,.2,.62,.34,P,18),{tone:'hi',lit:true,cls:'pointer'}));
 it.push(S(cylinder(HUB.x,HUB.y,.32,.97,.13,P,20),{tone:'mid'}));
 it.push(S(cylinder(HUB.x,HUB.y,WHEEL_R,HUB.z,.14,P,56,.03),{tone:'hi'}),L(knurl(HUB.x,HUB.y,WHEEL_R,HUB.z,HUB.z+.14,72,P,.02),'lo'));
 it.push(L(ring(HUB.x,HUB.y,WHEEL_R-.22,HUB.z+.14,P,56),'faint'));
 const rt=radialTicks(HUB.x,HUB.y,WHEEL_R-.24,24,6,HUB.z+.14,[.1,.2],P);it.push(L(rt.minor,'faint'),L(rt.major,'lo'));
 it.push(S(cylinder(HUB.x,HUB.y,.22,HUB.z+.14,.12,P,16),{tone:'hi'}));
 return it;
}
/** The handwheel's spoke and knob at angle `a` (rebuilt per frame while it turns: a few paths). */
export function wheelHandle(P:Projection,a:number):Item[]{
 const kx=HUB.x+Math.cos(a)*(WHEEL_R-.25),ky=HUB.y+Math.sin(a)*(WHEEL_R-.25);
 const z=HUB.z+.14,ax=HUB.x+Math.cos(a)*.22,ay=HUB.y+Math.sin(a)*.22;
 return [{k:'line',d:lineOnTop([ax,ay],[kx,ky],z+.06,P),tone:'hi'},S(cylinder(kx,ky,.17,z,.55,P,18),{tone:'hi',lit:true}),{k:'ball',c:iso([kx,ky,z+.55+.17],P),r:.19*cameraOf(P).k,cls:'knob lit'}];
}
/** A small projection for one artifact on its own (Order it's cards). */
export function artifactCamera(w:number,h:number):Projection{return fitProjection(boxCorners({x:-1.5,y:-1.5,w:3,d:3,r:0},-.32,2.3),w,h,{pad:2,azimuth:40,elevation:30});}
export function artifactScene(id:string,w:number,h:number):Item[]{
 const P=artifactCamera(w,h);
 return [{k:'shadow',d:onTop(circleRing(.1,.1,1.6,36),-.3,P,true),o:.6},S(cylinder(0,0,1.6,-.3,.3,P,40,.03),{tone:'mid'}),...artifact(id,P,0,0,false)];
}
