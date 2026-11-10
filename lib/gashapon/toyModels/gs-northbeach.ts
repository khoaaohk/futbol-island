/**
 * Shell Seekers (gs-northbeach), rebuilt for round 3B/3C batch 2 (Nov 9 2026; docs/gashapon-design.md "Round 3B" and "Round 3C"):
 * shore creatures and beach finds from the North Beach machine. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Starfish Stella  a squishy standing sea star: five puffy arms (each can point), tubercle bumps on both faces (bonus: flick to
 *                    spin like a star)
 *   Hermit Hank      take-apart: the anemone hitch-hiker comes off his borrowed turban shell, then the shell, showing his soft
 *                    curled tail; one big claw, stalk eyes, tiny football boots (bonus wind-up not in the runtime yet: he scuttles)
 *   Sand Dollar Dee  a spinner standing on her edge like a coin: the underside with the mouth and food grooves at the front, the
 *                    five-petal flower of pores and five slots at the back (bonus working part: press her middle and one of the
 *                    legendary little doves pops out)
 *   Conch Connie     a charm: a pink conch on a ball chain (knobbed shoulder, spiral spire, flared lip); open the horny door of
 *                    her opening and a pink conch pearl is inside (bonus working part)
 *   Seagull Sully    a bobblehead gull: the yellow beak with the red spot, black wingtips with white mirrors, webbed feet, a ball
 *                    (bonus wind-up not in the runtime yet: he flaps and heads instead)
 *   Sea Glass Gem    the rare: a frosted clear sea-glass capsule; inside, Gem (a jelly pebble) on a sand bed with tiny shells and
 *                    a rainbow (the extra part) (bonus jelly)
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
 */
import * as T from 'three';
import type {Finish,ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96',GOLD='#e8b92e';
type Pt=readonly [number,number];
type Surf=(x:number,y:number)=>number;
const ellSurf=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number):Surf=>(x,y)=>{const u=(x-cx)/rx,v=(y-cy)/ry;return cz+rz*Math.sqrt(Math.max(0,1-u*u-v*v));};
const sphSurf=(cy:number,R:number,cz=0):Surf=>(x,y)=>cz+Math.sqrt(Math.max(0,R*R-x*x-(y-cy)**2));
/** Euler angles (XYZ) for "tilt about x, then turn about y". */
function yawPitch(yaw:number,pitch:number,roll=0):V3{const q=new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,roll,'YXZ'));const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
/** Euler angles that turn +y onto the direction d. */
function upTo(d:V3):V3{const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...d).normalize());const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
/** Euler angles for rotations applied one after another (each about a model axis). */
function turns(...steps:[V3,number][]):V3{const q=new T.Quaternion();for(const [ax,an] of steps)q.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(...ax).normalize(),an));const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
/** Euler angles whose local z is `z` and local y leans toward `yHint` (decals lying on a surface). */
function basis(z:T.Vector3,yHint:T.Vector3):V3{const Z=z.clone().normalize(),X=new T.Vector3().crossVectors(yHint,Z).normalize(),Y=new T.Vector3().crossVectors(Z,X);const e=new T.Euler().setFromRotationMatrix(new T.Matrix4().makeBasis(X,Y,Z),'XYZ');return [e.x,e.y,e.z];}
/** A straight rod between two model points. */
function rod(k:ToyKit,a:V3,b:V3,r:number,o:{part?:string;color:string;mat:Finish;seg?:number}){const d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
 k.cyl(r,r,Math.hypot(...d),{part:o.part,at:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:upTo(d),color:o.color,mat:o.mat,seg:o.seg??14});}
/** Piecewise-linear radius of a turned profile at height y. */
const radiusAt=(pts:readonly Pt[],y:number)=>{for(let i=0;i<pts.length-1;i++){const [r0,y0]=pts[i],[r1,y1]=pts[i+1];if(y>=Math.min(y0,y1)&&y<=Math.max(y0,y1))return r0+(r1-r0)*(y-y0)/((y1-y0)||1);}return 0;};
/**
 * A premium capsule-toy face: glossy ink eyes with two highlights (eyeL / eyeR under eyes, so blink works), a mouth, blush.
 * `sclera` puts a pale ring behind each eye (for darker bodies).
 */
function face(k:ToyKit,part:string,o:{x:number;y:number;surf:Surf;gap?:number;size?:number;mouth?:'smile'|'open'|'o'|'grin'|'cat'|'none';blush?:string|false;eyes?:'dot'|'happy';prefix?:string;brows?:string;sclera?:string;nose?:string}){
 const pre=o.prefix??'',gap=o.gap??.12,s=o.size??.045,{x,y,surf}=o;
 k.part(pre+'eyes',{at:[x,y,surf(x,y)],parent:part});
 for(const side of [-1,1] as const){const n=pre+(side<0?'eyeL':'eyeR'),ex=x+side*gap,ez=surf(ex,y);k.part(n,{at:[ex,y,ez],parent:pre+'eyes'});
  if(o.sclera)k.sphere(s*1.4,{part:n,at:[ex,y,ez-s*.3],scale:[1,1.18,.32],color:o.sclera,mat:'vinyl'});
  if(o.eyes==='happy')k.torus(s*.85,s*.28,{part:n,arc:PI,at:[ex,y-s*.35,ez+.003],color:INK,mat:'ink'});
  else{k.sphere(s,{part:n,at:[ex,y,ez-s*.16],scale:[1,1.28,.5],color:INK,mat:'ink'});
   k.sphere(s*.4,{part:n,at:[ex+s*.34,y+s*.46,ez+s*.2],scale:[1,1,.45],color:WHITE,mat:'ink'});
   k.sphere(s*.17,{part:n,at:[ex-s*.3,y-s*.44,ez+s*.18],scale:[1,1,.45],color:WHITE,mat:'ink'});}
  if(o.brows)k.capsule(s*.16,s*.7,{part:n,at:[ex,y+s*1.75,surf(ex,y+s*1.75)+.002],rot:[0,0,PI/2+side*.18],color:o.brows,mat:'ink'});}
 const my=y-s*2.15,mz=surf(x,my);
 if(o.nose)k.sphere(s*.42,{part,at:[x,y-s*1.25,surf(x,y-s*1.25)],scale:[1.25,.85,.5],color:o.nose,mat:'vinyl'});
 if(o.mouth==='open'||o.mouth==='grin'){const w=o.mouth==='grin'?1.6:1.15;k.sphere(s*.72,{part,at:[x,my,mz-s*.14],scale:[w,.95,.42],color:MOUTH,mat:'ink'});
  k.sphere(s*.4,{part,at:[x,my-s*.3,mz-s*.02],scale:[w*.95,.6,.42],color:TONGUE,mat:'ink'});}
 else if(o.mouth==='o')k.torus(s*.42,s*.17,{part,at:[x,my+s*.1,mz+.002],color:MOUTH,mat:'ink'});
 else if(o.mouth==='cat'){for(const side of [-1,1])k.torus(s*.5,s*.17,{part,arc:PI,rot:[0,0,PI],at:[x+side*s*.5,my+s*.55,surf(x+side*s*.5,my)+.003],color:INK,mat:'ink'});}
 else if(o.mouth!=='none')k.torus(s*1.0,s*.24,{part,arc:PI,rot:[0,0,PI],at:[x,my+s*.55,mz+.003],color:INK,mat:'ink'});
 if(o.blush!==false){const bx=gap+s*1.55,by=y-s*1.6;for(const side of [-1,1])k.sphere(s*.9,{part,at:[x+side*bx,by,surf(x+side*bx,by)-s*.1],scale:[1.35,.8,.3],color:o.blush??BLUSH,mat:'matte'});}
}
const starPts=(R:number,r:number):Pt[]=>Array.from({length:10},(_,i)=>{const a=PI/2+i*PI/5,rr=i%2?r:R;return [Math.cos(a)*rr,Math.sin(a)*rr] as Pt;});
/** A sakura blossom outline: five round petals, each with the little notch at its tip. */
const sakuraPts=(R:number):Pt[]=>Array.from({length:80},(_,i)=>{const a=PI/2+i*PI*2/80,ph=((a-PI/2)*5/2)%PI,c=Math.abs(Math.cos(ph)),d=Math.min(ph,PI-ph);
 const r=R*(.42+.58*Math.pow(c,.6))-R*.2*Math.exp(-(d*d)/.02);return [Math.cos(a)*r,Math.sin(a)*r] as Pt;});
/** The secret capsule: a domed top and a cup bottom, each a shell (outside + inside), a rim and a mark on the front. */
function secretCapsule(k:ToyKit,o:{top:string;topMat:Finish;bot:string;botMat:Finish;rim:string;mark:string;markMat:Finish;markPts?:Pt[]}){
 k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
 const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
 const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
 k.smoothLathe(dome,{part:'capTop',color:o.top,mat:o.topMat,seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:k.shade(o.top,.08),mat:o.topMat,seg:44});
 k.torus(.475,.015,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});
 k.extrude(o.markPts??starPts(.1,.045),.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:o.mark,mat:o.markMat,bevel:.008});
 k.smoothLathe(cupP,{part:'capBot',color:o.bot,mat:o.botMat,seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:k.shade(o.bot,.08),mat:o.botMat,seg:44});
 k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(o.bot,-.1),mat:o.botMat,seg:36});
}
/** A gold five-petal plum blossom (ume, a New Year good-luck flower) lying on a surface: centre `at`, normal `n`. */
/** A football: white, eight ink patches. */
function football(k:ToyKit,part:string,at:V3,r:number){
 k.sphere(r,{part,at,color:WHITE,mat:'vinyl'});
 for(const [dx,dy,dz] of [[0,.2,1],[.8,.5,.4],[-.8,.5,.4],[.6,-.6,.55],[-.6,-.6,.55],[0,.3,-1],[.7,-.2,-.6],[-.7,-.2,-.6]] as const){const n=Math.hypot(dx,dy,dz);
  k.cyl(r*.34,r*.34,r*.1,{part,at:[at[0]+dx/n*r*.97,at[1]+dy/n*r*.97,at[2]+dz/n*r*.97],rot:yawPitch(Math.atan2(dx,dz),Math.acos(dy/n)),color:INK,mat:'ink',seg:5});}
}
/** A small seeded random. */
const rng=(seed:number)=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
/** Tiny football boots (black, a white stripe, a white sole) at a leg tip. */
function boot(k:ToyKit,part:string,at:V3,yaw:number){
 k.sphere(.03,{part,at:[at[0],at[1]+.012,at[2]],rot:[0,yaw,0],scale:[.8,.6,1.35],color:'#22262b',mat:'vinyl'});
 k.box(.006,.016,.03,{part,at:[at[0]+Math.cos(yaw)*.02,at[1]+.016,at[2]-Math.sin(yaw)*.02],rot:[0,yaw,0],color:WHITE,mat:'matte'});
 k.rbox(.045,.008,.075,.003,{part,at:[at[0],at[1]+.004,at[2]],rot:[0,yaw,0],color:WHITE,mat:'matte'});
}

const set:ToyModelSet={
 'starfish-stella':(k)=>{
  const coral=k.c.body,peach=k.c.accent,CY=.255;
  // Five puffy tapered arms (parts, so each can point), a round centre, tubercle bumps front and back.
  const arms:[string,number][]=[['armTop',PI/2],['armR',PI/2-PI*2/5],['legR',PI/2-PI*4/5],['legL',PI/2+PI*4/5],['armL',PI/2+PI*2/5]];
  const prof:Pt[]=[[.125,0],[.118,.07],[.098,.15],[.07,.22],[.042,.275],[.018,.3],[0,.305]];
  k.part('star',{at:[0,CY,0]});
  k.sphere(.15,{part:'star',at:[0,CY,0],scale:[1,1,.62],color:coral,mat:'soft'});
  for(const [p,a] of arms){k.part(p,{at:[0,CY,0],parent:'star'});const rz=a-PI/2,dx=Math.cos(a),dy=Math.sin(a);
   k.smoothLathe(prof,{part:p,at:[0,CY,0],rot:[0,0,rz],scale:[1,1,.56],color:coral,mat:'soft',seg:36});
   for(let i=0;i<4;i++){const d=.08+i*.055,r=radiusAt(prof,d)*.56;for(const s of [-1,1])k.sphere(.02-i*.002,{part:p,at:[dx*d,CY+dy*d,s*(r+.002)],scale:[1,1,.6],color:peach,mat:'soft',seg:12});
   }
   k.sphere(.016,{part:p,at:[dx*.29,CY+dy*.29,0],color:k.shade(coral,-.12),mat:'soft',seg:12});}
  k.sphere(.022,{part:'star',at:[0,CY,-.093],scale:[1,1,.5],color:peach,mat:'soft',seg:14});
  face(k,'star',{x:0,y:CY+.025,surf:ellSurf(0,CY,0,.15,.15,.093),gap:.055,size:.032,mouth:'open'});
  return {kind:{kind:'squish'},soft:{soft:.6},flick:true,
   squeeze:['c_curl:armTop+armL+armR+legL+legR'],poke:{default:['c_reach:armR'],armTop:['c_reach:armTop'],armL:['c_reach:armL'],armR:['c_reach:armR'],legL:['c_reach:legL'],legR:['c_reach:legR']},tap:['c_starspin:star','sparkle'],head:'star',
   voice:{squeeze:['squish','blip'],poke:['blip:1.3'],tap:['blip','sparkle']}};
 },
 'hermit-hank':(k)=>{
  const shellC='#f4e4c8',band='#b5703f',red=k.c.body,pale='#f6c2a8',sand='#f1dfb4';
  k.part('crab',{at:[0,.15,.07]});k.part('clawL',{at:[-.12,.16,.17],parent:'crab'});k.part('clawR',{at:[.12,.16,.17],parent:'crab'});k.part('legs',{at:[0,.08,.07],parent:'crab'});
  k.part('shell',{at:[0,.3,-.12]});k.part('anemone',{at:[.11,.44,-.06]});
  // A patch of sand under him, with two tiny shells.
  k.blob(1,{at:[0,.0125,0],scale:[.36,.012,.32],amp:.004,freq:5,seed:3,color:sand,dark:k.shade(sand,-.08),mat:'matte',seg:40});
  for(const [x,z,c] of [[-.28,.14,'#f7c6b0'],[.27,-.17,'#e8d8f0']] as const)k.sphere(.025,{at:[x,.022,z],scale:[1,.45,1.2],color:c,mat:'vinyl',seg:14});
  // The crab: a red-orange head shell, the soft curled tail (seen when his shell comes off), stalk eyes, antennae.
  k.sphere(.14,{part:'crab',at:[0,.16,.07],scale:[1.15,.78,1],color:red,mat:'vinyl'});
  k.sphere(.13,{part:'crab',at:[0,.2,-.11],scale:[.95,.9,1.15],color:pale,mat:'soft'});
  for(const [y,z] of [[.27,-.06],[.25,-.13],[.22,-.19]] as const)k.torus(.1,.006,{part:'crab',at:[0,y,z],rot:[PI/2-.9,0,0],scale:[1,1,1],color:k.shade(pale,-.1),mat:'soft'});
  const hs=ellSurf(0,.16,.07,.161,.109,.14);k.torus(.02,.0055,{part:'crab',arc:PI,rot:[0,0,PI],at:[0,.165,hs(0,.15)+.002],color:INK,mat:'ink'});
  for(const s of [-1,1])k.sphere(.022,{part:'crab',at:[s*.075,.165,hs(s*.075,.165)-.002],scale:[1.3,.8,.35],color:'#ff8f8f',mat:'matte'});
  k.part('eyes',{at:[0,.36,.17],parent:'crab'});
  for(const s of [-1,1] as const){const n=s<0?'eyeL':'eyeR',x=s*.062;rod(k,[s*.04,.2,.15],[x,.33,.16],.014,{part:'crab',color:red,mat:'vinyl'});
   k.part(n,{at:[x,.36,.17],parent:'eyes'});k.sphere(.042,{part:n,at:[x,.36,.165],color:WHITE,mat:'vinyl'});
   k.sphere(.028,{part:n,at:[x,.362,.192],scale:[1,1.15,.55],color:INK,mat:'ink'});k.sphere(.01,{part:n,at:[x+.009,.373,.207],scale:[1,1,.5],color:WHITE,mat:'ink'});
   k.tube([[s*.03,.19,.19],[s*.09,.3,.24],[s*.16,.36,.22]],.005,{part:'crab',color:k.shade(red,.1),mat:'vinyl'});}
  // Claws: the right one bigger (real hermit crabs have one big claw), white-tipped pincers.
  for(const s of [-1,1] as const){const p=s<0?'clawL':'clawR',big=s>0?1.25:.9,x=s*.12;
   rod(k,[x,.16,.17],[x+s*.05,.12,.25],.022*big,{part:p,color:red,mat:'vinyl'});
   k.sphere(.05*big,{part:p,at:[x+s*.06,.12,.28],scale:[1,.8,1.15],color:red,mat:'vinyl'});
   k.capsule(.016*big,.06*big,{part:p,at:[x+s*.06,.145,.34],rot:[PI/2-.3,0,0],color:WHITE,mat:'vinyl'});k.capsule(.014*big,.05*big,{part:p,at:[x+s*.06,.1,.335],rot:[PI/2+.35,0,0],color:WHITE,mat:'vinyl'});
   for(let i=0;i<3;i++)k.sphere(.007,{part:p,at:[x+s*(.03+i*.025),.16*1+.0,.27+i*.01],color:k.shade(red,.15),mat:'vinyl',seg:8});}
  // Walking legs: three a side, jointed, the front pair in tiny football boots.
  for(const s of [-1,1] as const)for(let i=0;i<3;i++){const z=.12-i*.07,knee:V3=[s*(.2+i*.01),.16,z+.02],tip:V3=[s*(.27+i*.02),.03,z+.05-i*.02];
   k.tube([[s*.12,.13,z],knee,tip],.017,{part:'legs',color:red,mat:'vinyl'});k.sphere(.018,{part:'legs',at:knee,color:k.shade(red,.08),mat:'vinyl',seg:12});
   if(i===0)boot(k,'legs',[tip[0],.012,tip[2]+.01],0);else k.sphere(.015,{part:'legs',at:[tip[0],.026,tip[2]],color:WHITE,mat:'vinyl',seg:10});}
  // His borrowed shell: a cream turban shell with brown spiral bands, a pearly opening, and a spire.
  const whorl:V3=[0,.27,-.13];k.sphere(.18,{part:'shell',at:whorl,scale:[1,1,1.05],color:shellC,mat:'vinyl'});
  const spire:Pt[]=[[.15,0],[.135,.06],[.1,.13],[.065,.19],[.03,.24],[0,.26]];
  k.smoothLathe(spire,{part:'shell',at:[0,.36,-.17],rot:[-.45,0,0],color:shellC,mat:'vinyl',seg:40});
  const sp=new T.Euler(-.45,0,0),hel:V3[]=[];for(let i=0;i<=44;i++){const t=i/44,h=.02+t*.22,r=radiusAt(spire,h)+.004,a=t*PI*6;const v=new T.Vector3(Math.sin(a)*r,h,Math.cos(a)*r).applyEuler(sp);hel.push([v.x,v.y+.36,v.z-.17]);}
  k.tube(hel,.008,{part:'shell',color:band,mat:'vinyl'});
  for(const a of [0,1.2,2.4,3.6,4.8])k.tube(Array.from({length:7},(_,i)=>{const e=-.6+i*.25,yy=Math.sin(e)*.18,rr=Math.cos(e)*.183;return [Math.sin(a+i*.15)*rr,whorl[1]+yy,whorl[2]+Math.cos(a+i*.15)*rr*1.05] as V3;}),.012,{part:'shell',color:band,mat:'vinyl'});
  k.torus(.095,.022,{part:'shell',at:[0,.2,-.0],rot:[-.25,0,0],color:'#fff6ec',mat:'pearl'});
  // The anemone hitch-hiker on the shell (hermit crabs really carry them).
  k.cyl(.03,.036,.05,{part:'anemone',at:[.11,.44,-.06],rot:[0,0,-.35],color:'#ff8fb8',mat:'soft',seg:20});
  for(let i=0;i<9;i++){const a=i*PI*2/9;k.capsule(.008,.035,{part:'anemone',at:[.12+Math.cos(a)*.02,.49,-.06+Math.sin(a)*.02],rot:[Math.sin(a)*.6,0,-.35-Math.cos(a)*.6],color:i%2?'#ffd1e6':'#ffb0d2',mat:'soft'});}
  return {kind:{kind:'puzzle',pieces:[{part:'anemone',name:'the anemone'},{part:'shell',name:'his shell',after:['anemone']}]},
   squeeze:['c_hide:crab'],poke:{default:['peek:crab','blink'],clawL:['wave:clawL'],clawR:['wave:clawR'],legs:['c_scuttle']},tap:['c_scuttle'],head:{above:.3},
   voice:{squeeze:['clack:.8'],poke:['clack','c_tiptap'],tap:['c_tiptap','c_tiptap:1.2']}};
 },
 'sand-dollar-dee':(k)=>{
  const white=k.c.body,tan=k.c.accent,CY=.37,R=.3;
  k.part('feet',{at:[0,.04,0]});k.part('button',{at:[0,CY,-.03]});k.part('dove',{at:[0,CY+R+.06,0]});
  // The test: a lens-shaped disc standing on its edge (front = the underside, with the mouth in the middle).
  const lens:Pt[]=[[0,-.032],[.12,-.029],[.22,-.021],[.28,-.011],[R,0],[.28,.011],[.22,.021],[.12,.029],[0,.032]];
  k.smoothLathe(lens,{at:[0,CY,0],rot:[PI/2,0,0],color:white,mat:'matte',seg:72});
  const hAt=(rho:number)=>radiusAt([[.032,0],[.029,.12],[.021,.22],[.011,.28],[0,R]],rho);
  const zf=(x:number,y:number)=>{const rho=Math.hypot(x,y-CY);return Math.max(0,hAt(rho));};
  // Front: the underside, with a ring of fine pores round her face (the mouth is in the middle, as on a real sand dollar).
  for(let i=0;i<30;i++){const a=i*PI*2/30,r=.235+(i%2)*.018,x=Math.cos(a)*r,y=CY+Math.sin(a)*r;k.sphere(.006,{at:[x,y,zf(x,y)],scale:[1,1,.5],color:k.shade(tan,-.04),mat:'matte',seg:8});}
  face(k,'body',{x:0,y:CY+.045,surf:(x,y)=>zf(x,y)+.002,gap:.075,size:.038,mouth:'o',blush:'#ffb3a8'});
  // Five slots near the rim (a keyhole sand dollar), on both faces.
  for(let i=0;i<5;i++){const a=PI/2+PI/5+i*PI*2/5,x=Math.cos(a)*.205,y=CY+Math.sin(a)*.205;for(const s of [-1,1])k.sphere(1,{at:[x,y,s*(zf(x,y)-.004)],rot:[0,0,a],scale:[.045,.012,.008],color:k.shade(tan,-.12),mat:'matte',seg:20});}
  // Back: the five-petal flower of pores, and the centre button (the working part).
  for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5;for(const s of [-1,1])for(let j=0;j<7;j++){const t=(j+.5)/7,r=.045+t*.13,w=s*.032*Math.sin(PI*t),x=Math.cos(a)*r-Math.sin(a)*w,y=CY+Math.sin(a)*r+Math.cos(a)*w;
   k.sphere(.0065,{at:[x,y,-zf(x,y)-.001],scale:[1,1,.5],color:k.shade(tan,-.06),mat:'matte',seg:8});}}
  k.extrude(starPts(.036,.016),.012,{part:'button',at:[0,CY,-.033],color:tan,mat:'matte',bevel:.004});
  k.proxy('button',.08,[0,CY,-.04]);
  // The dove that pops out (the legend of the five little doves inside a sand dollar).
  const dy=CY+R+.06;k.sphere(.04,{part:'dove',at:[0,dy,0],scale:[1.25,.9,.9],color:WHITE,mat:'vinyl'});k.sphere(.028,{part:'dove',at:[.045,dy+.025,0],color:WHITE,mat:'vinyl'});
  k.cone(.008,.02,{part:'dove',at:[.075,dy+.022,0],rot:[0,0,-PI/2],color:'#ffb03b',mat:'vinyl'});for(const s of [-1,1])k.sphere(.006,{part:'dove',at:[.055,dy+.032,s*.02],color:INK,mat:'ink',seg:8});
  for(const s of [-1,1])k.extrude([[0,0],[-.06,.05],[-.075,.01]],.006,{part:'dove',at:[-.005,dy+.01,s*.03],rot:[s*.5,0,0],color:'#f2f6fb',mat:'vinyl',bevel:.002});
  k.slider('button',{axis:[0,0,1],max:.014,release:'return',label:'centre',hint:'Press my middle',fires:{part:'dove',at:.6,hidden:true,lift:[0,.1,0],hold:1.3}});
  // Little legs and round feet.
  for(const s of [-1,1]){k.capsule(.022,.04,{part:'feet',at:[s*.07,.07,0],color:tan,mat:'matte'});k.sphere(.042,{part:'feet',at:[s*.075,.025,.015],scale:[1,.6,1.25],color:k.shade(tan,-.08),mat:'vinyl'});}
  return {kind:{kind:'spintop'},flick:true,
   squeeze:['blink'],poke:{default:['c_coinroll'],feet:['hop'],button:['blink']},tap:['flip'],head:{above:.6},
   voice:{squeeze:['c_crack','ting:1.2'],poke:['roll:1.4','ting'],tap:['ting:.9','sparkle']}};
 },
 'conch-connie':(k)=>{
  const shell=k.c.body,rose=k.c.accent,lip='#ffe2d4',inside='#ff8f86';
  const LA=1.0,dir=(r:number,y:number):V3=>[Math.sin(LA)*r,y,Math.cos(LA)*r],DX:V3=[Math.cos(LA),0,-Math.sin(LA)],dc=dir(.272,.37);
  k.part('door',{at:[dc[0]+DX[0]*.07,.37,dc[2]+DX[2]*.07]});
  // The conch: a turned spindle (a siphon canal at the bottom, a shoulder of knobs, a stepped spire with a spiral suture).
  const P:Pt[]=[[0,0],[.03,.02],[.07,.08],[.13,.18],[.18,.3],[.21,.42],[.215,.5],[.2,.555],[.145,.6],[.11,.66],[.075,.73],[.045,.8],[.02,.85],[0,.87]];
  k.smoothLathe(P,{color:shell,mat:'vinyl',seg:56});
  for(let i=0;i<9;i++){const a=i*PI*2/9+.2;if(Math.abs(Math.sin(a))>.9&&Math.sin(a)>0)continue;k.cone(.035,.08,{at:[Math.sin(a)*.2,.565,Math.cos(a)*.2],rot:yawPitch(a,-1.0),color:k.shade(shell,.06),mat:'vinyl',seg:16});}
  const hel:V3[]=[];for(let i=0;i<=40;i++){const t=i/40,y=.6+t*.26,r=radiusAt(P,y)+.003,a=t*PI*7;hel.push([Math.sin(a)*r,y,Math.cos(a)*r]);}k.tube(hel,.007,{color:rose,mat:'vinyl'});
  for(let i=0;i<6;i++){const a=i*PI/3,y=.67;const r=radiusAt(P,y);k.sphere(.014,{at:[Math.sin(a)*r,y,Math.cos(a)*r],color:k.shade(shell,.08),mat:'vinyl',seg:10});}
  for(const y of [.24,.36]){const pts:V3[]=[];for(let i=0;i<=36;i++){const a=i/36*PI*2,yy=y+Math.sin(a*6)*.012,r=radiusAt(P,yy)+.002;pts.push([Math.sin(a)*r,yy,Math.cos(a)*r]);}k.tube(pts,.007,{color:rose,mat:'vinyl'});}
  // The flared lip on her right side and the glossy pink opening; a pink pearl inside behind the door.
  k.sphere(1,{at:dir(.2,.37),rot:[0,LA,0],scale:[.14,.26,.055],color:lip,mat:'vinyl',seg:40});
  k.sphere(1,{at:dir(.232,.37),rot:[0,LA,0],scale:[.095,.2,.03],color:inside,mat:'vinyl',seg:40});
  k.sphere(.032,{at:dir(.258,.355),color:'#ffc7d6',mat:'pearl'});
  k.sphere(1,{part:'door',at:dc,rot:[0,LA,0],scale:[.075,.15,.012],color:'#b07a52',mat:'vinyl',seg:32});
  for(let i=0;i<3;i++)k.torus(.025+i*.02,.003,{part:'door',arc:PI*.8,at:dir(.283,.33),rot:[0,LA,PI*.6],color:'#d6a072',mat:'vinyl'});
  k.proxy('door',.09,dir(.28,.37));
  k.hinge('door',{axis:[0,1,0],max:1.5,detents:[.75],label:'shell door',hint:'Open my door'});
  // Her face on the front of the big whorl.
  face(k,'body',{x:-.07,y:.41,surf:(x,y)=>Math.sqrt(Math.max(0,radiusAt(P,y)**2-x*x))+.003,gap:.068,size:.042,mouth:'open'});
  // The ball chain holds a gold cap on the spire tip.
  k.sphere(.022,{at:[0,.872,0],color:'#d9c27a',mat:'gold'});k.torus(.016,.005,{at:[0,.9,0],color:'#d9c27a',mat:'gold'});
  k.chain({mode:'hang',links:7,length:.22,at:[0,.915,0],color:'#d9c27a'});
  return {kind:{kind:'charm'},
   squeeze:['c_toot','puff'],poke:{default:['c_echo'],door:['wiggle:door']},tap:['c_tune','petal'],head:{above:.6},
   voice:{squeeze:['c_horn'],poke:['c_horn:1.3'],tap:['c_horn:1.1','c_horn:1.35','c_horn:1.2']}};
 },
 'seagull-sully':(k)=>{
  const white=k.c.body,yellow='#ffcf3a',grey='#aab6c2',black='#2a2e33',legC='#f6b54a';
  k.part('head',{at:[0,.5,.07]});k.part('wingL',{at:[-.16,.44,.02]});k.part('wingR',{at:[.16,.44,.02]});k.part('tail',{at:[0,.36,-.2]});k.part('ball',{at:[.22,.07,.22]});
  // The plump white body, a pale grey back, the tail with a black band.
  k.sphere(.2,{at:[0,.34,0],scale:[.92,.88,1.12],color:white,mat:'soft'});
  k.sphere(.19,{at:[0,.39,-.03],scale:[.88,.7,1.08],color:grey,mat:'soft'});
  k.extrude([[-.07,0],[.07,0],[.1,-.16],[0,-.19],[-.1,-.16]],.03,{part:'tail',at:[0,.33,-.2],rot:[PI/2+.3,0,0],color:white,mat:'soft',bevel:.01});
  k.extrude([[-.1,-.13],[.1,-.13],[0,-.19]],.034,{part:'tail',at:[0,.33,-.2],rot:[PI/2+.3,0,0],color:black,mat:'soft',bevel:.01});
  // Folded grey wings with black tips and white "mirror" spots.
  for(const s of [-1,1] as const){const p=s<0?'wingL':'wingR',x=s*.165;
   k.sphere(1,{part:p,at:[x,.39,-.04],rot:[.3,s*.12,0],scale:[.055,.12,.22],color:grey,mat:'soft',seg:36});
   k.sphere(1,{part:p,at:[x+s*.004,.33,-.24],rot:[.5,s*.1,0],scale:[.045,.06,.11],color:black,mat:'soft',seg:28});
   for(const zz of [-.27,-.22])k.sphere(.012,{part:p,at:[x+s*.045,.33+(-.24-zz)*.5,zz],scale:[.5,1,1],color:WHITE,mat:'soft',seg:10});}
  // Yellow legs and webbed feet.
  for(const s of [-1,1]){const x=s*.07;k.capsule(.016,.1,{at:[x,.09,.02],color:legC,mat:'vinyl'});
   k.extrude([[0,.02],[-.045,-.06],[0,-.04],[.045,-.06]],.012,{at:[x,.008,.05],rot:[-PI/2,0,0],color:legC,mat:'vinyl',bevel:.004});}
  // The head on its spring neck: a yellow beak with the red spot, cheeky grey brows.
  const HC:V3=[0,.64,.09];k.sphere(.14,{part:'head',at:HC,scale:[1,.96,1],color:white,mat:'soft'});
  k.cone(.045,.13,{part:'head',at:[0,.6,.27],rot:[PI/2+.12,0,0],scale:[1,1,.75],color:yellow,mat:'vinyl'});
  k.sphere(.018,{part:'head',at:[0,.625,.255],scale:[1.6,.9,1],color:yellow,mat:'vinyl'});
  k.sphere(.012,{part:'head',at:[0,.575,.29],scale:[1,1,.6],color:'#e2452f',mat:'vinyl',seg:12});
  face(k,'head',{x:0,y:.675,surf:sphSurf(.64,.142,.09),gap:.06,size:.03,mouth:'none',brows:'#8a96a3'});
  football(k,'ball',[.22,.07,.22],.065);
  return {kind:{kind:'bobble',head:'head'},soft:{soft:.4},
   squeeze:['flap:wingL+wingR','hop'],poke:{default:['c_ruffle'],wingL:['flap:wingL','c_ruffle'],wingR:['flap:wingR','c_ruffle'],ball:['juggle:ball'],tail:['swish:tail']},tap:['c_header:head','juggle:ball'],head:'head',
   voice:{squeeze:['c_squawk','flapflap'],poke:['flapflap','rustle'],tap:['c_squawk:1.2','pok']}};
 },
 'sea-glass-gem':(k)=>{
  const glass=k.c.body,frost=k.c.accent,sand='#f1dfb4';
  k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
  // A frosted sea-glass capsule: clear seafoam top with frost specks, a frosted jelly cup, a starfish mark.
  const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
  const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
  k.smoothLathe(dome,{part:'capTop',color:'#c8f5e2',mat:'clear',seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:'#c8f5e2',mat:'clear',seg:44});
  k.torus(.475,.015,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:WHITE,mat:'pearl'});
  const r=rng(21);for(let i=0;i<34;i++){const a=r()*PI*2,t=.12+r()*.8,y=.5+t*.46,rr=radiusAt(dome,y)-.004;
   k.sphere(.012+r()*.01,{part:'capTop',at:[Math.sin(a)*rr,y,Math.cos(a)*rr],rot:yawPitch(a,0),scale:[1,1,.25],color:WHITE,mat:'matte',seg:10});}
  k.extrude(starPts(.1,.045),.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:'#ffb08a',mat:'pearl',bevel:.008});
  k.smoothLathe(cupP,{part:'capBot',color:glass,mat:'jelly',seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:k.shade(glass,.1),mat:'jelly',seg:44});
  k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:WHITE,mat:'pearl'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(glass,-.1),mat:'jelly',seg:36});
  // Inside: a sand bed with tiny shells, a rainbow arc behind (the extra part), and Gem, a frosted sea-glass pebble.
  k.part('gem',{at:[0,.1,0],parent:'inner'});k.part('rainbow',{at:[0,.08,-.15],parent:'inner'});
  k.blob(1,{part:'inner',at:[0,.042,0],scale:[.38,.04,.36],amp:.006,freq:4,seed:5,color:sand,dark:k.shade(sand,-.07),mat:'matte',seg:44});
  for(const [x,z,c,sx] of [[-.24,.17,'#f7c6b0',1],[.26,.12,'#ffffff',1.2],[.18,.26,'#e8d8f0',.9]] as const){k.sphere(.03,{part:'inner',at:[x,.068,z],scale:[sx,.4,1],color:c,mat:'pearl',seg:16});
   for(let i=-2;i<=2;i++)k.box(.003,.004,.05,{part:'inner',at:[x+i*.009,.08,z],rot:[0,i*.25,0],color:k.shade(c,-.1),mat:'matte'});}
  const cols=['#ff7b7b','#ffb35a','#ffe066','#7ad67a','#6ab4ff'];
  for(let i=0;i<5;i++)k.torus(.31-i*.028,.014,{part:'rainbow',at:[0,.08,-.15],arc:PI,color:cols[i],mat:'jelly'});
  for(const s of [-1,1])k.sphere(.05,{part:'rainbow',at:[s*.26,.1,-.15],scale:[1.3,.7,.8],color:WHITE,mat:'soft'}),k.sphere(.04,{part:'rainbow',at:[s*.21,.09,-.13],color:WHITE,mat:'soft'});
  const GC:V3=[0,.24,.02];k.blob(.17,{part:'gem',at:GC,scale:[1.3,.9,1],amp:.012,freq:3,seed:9,color:glass,dark:k.shade(glass,-.08),light:frost,mat:'jelly',seg:56});
  for(let i=0;i<10;i++){const a=r()*PI*2,e=(r()-.3)*1.2;k.sphere(.01,{part:'gem',at:[GC[0]+Math.sin(a)*Math.cos(e)*.215,GC[1]+Math.sin(e)*.15,GC[2]+Math.cos(a)*Math.cos(e)*.168],scale:[1,1,.3],rot:yawPitch(a,-e),color:frost,mat:'matte',seg:8});}
  face(k,'gem',{x:0,y:.26,surf:(x,y)=>ellSurf(0,.24,.02,.221,.153,.17)(x,y)+.004,gap:.07,size:.034,mouth:'open',prefix:'in'});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},soft:{soft:.5,jelly:true},
   squeeze:['glow','pop:gem'],poke:{default:['jiggle','blink:ineyes'],rainbow:['pop:rainbow','sparkle']},tap:['pop:rainbow','sparkle','glow'],head:{above:.32},
   voice:{squeeze:['c_shimmer'],poke:['clink','clink:1.2'],tap:['c_shimmer:1.2','tinkle']}};
 },
};
export default set;
