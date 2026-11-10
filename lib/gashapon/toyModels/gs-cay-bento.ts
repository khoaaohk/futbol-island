/**
 * Bento Box Buddies (gs-cay-bento), rebuilt for round 3B (Nov 9 2026; docs/gashapon-design.md "Round 3B"): HD kit and each toy
 * plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Bento Ben         take-apart: the lid lifts off (it goes back last), then the rice, the octopus sausage and the rolled egg lift
 *                     out of their compartments (bonus: the side clips flip)
 *   Tamago Tama       a soft rolled-egg slice, the spiral layers on both cut faces (bonus: lift the loose outer layer, it unrolls)
 *   Curry Bun Cooper  a fried oval bun, crunchy panko crust and a curry leak (bonus: the steam curl bobbles)
 *   Banana Bolt       working parts: four peel flaps fold down on their hinges (bonus: the fruit tip bobbles)
 *   Juice Box Jun     bobble: the bendy straw nods (bonus: the carton ears unfold)
 *   Sushi Roll Sora   the rare: a glitter coral-and-teal secret capsule; inside, a veggie roll on a geta board with ginger, wasabi
 *                     and the captain band (the extra part)
 * Model space: stands on y = 0, about 1 tall, front +z. Generic food only, no brands. Rows in lib/gashapon/toys.ts keep the words.
 */
import * as T from 'three';
import type {ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96';
type Pt=readonly [number,number];
function rng(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
/** A shape's outline as points (the closing duplicate dropped). */
function outline(sh:T.Shape,n:number):Pt[]{const p=sh.getSpacedPoints(n).map(q=>[q.x,q.y] as Pt);const a=p[0],b=p[p.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)p.pop();return p;}
const scalePts=(pts:readonly Pt[],f:number,cx:number,cy:number):Pt[]=>pts.map(([x,y])=>[cx+(x-cx)*f,cy+(y-cy)*f] as Pt);
const inPoly=(poly:readonly Pt[],x:number,y:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
/** A dense turned profile from a function of t in 0..1 (k.lathe is exact, so details can sit on the surface). */
const prof=(n:number,f:(t:number)=>Pt):Pt[]=>Array.from({length:n+1},(_,i)=>f(i/n));
/** Euler angles (XYZ) for "tilt about x, then turn about y". */
function yawPitch(yaw:number,pitch:number,roll=0):V3{const q=new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,roll,'YXZ'));const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}

/** z of a surface in front of (x, y). */
type Surf=(x:number,y:number)=>number;
const ellSurf=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number):Surf=>(x,y)=>{const u=(x-cx)/rx,v=(y-cy)/ry;return cz+rz*Math.sqrt(Math.max(0,1-u*u-v*v));};
const cylSurf=(r:number):Surf=>x=>Math.sqrt(Math.max(0,r*r-x*x));
/**
 * A premium capsule-toy face on `part`: glossy ink eyes with two highlights (parts eyeL / eyeR under eyes, so blink works), a
 * mouth and matte blush, every feature pushed onto the surface `surf`.
 */
function face(k:ToyKit,part:string,o:{x:number;y:number;surf:Surf;gap?:number;size?:number;mouth?:'smile'|'open'|'cat'|'o'|'grin'|'none';blush?:string|false;eyes?:'dot'|'happy';prefix?:string;brows?:string}){
 const pre=o.prefix??'',gap=o.gap??.12,s=o.size??.045,{x,y,surf}=o;
 k.part(pre+'eyes',{at:[x,y,surf(x,y)],parent:part});
 for(const side of [-1,1] as const){const n=pre+(side<0?'eyeL':'eyeR'),ex=x+side*gap,ez=surf(ex,y);k.part(n,{at:[ex,y,ez],parent:pre+'eyes'});
  if(o.eyes==='happy')k.torus(s*.85,s*.28,{part:n,arc:PI,at:[ex,y-s*.35,ez+.003],color:INK,mat:'ink'});
  else{k.sphere(s,{part:n,at:[ex,y,ez-s*.16],scale:[1,1.28,.5],color:INK,mat:'ink'});
   k.sphere(s*.4,{part:n,at:[ex+s*.34,y+s*.46,ez+s*.2],scale:[1,1,.45],color:WHITE,mat:'ink'});
   k.sphere(s*.17,{part:n,at:[ex-s*.3,y-s*.44,ez+s*.18],scale:[1,1,.45],color:WHITE,mat:'ink'});}
  if(o.brows)k.capsule(s*.16,s*.7,{part:n,at:[ex,y+s*1.75,surf(ex,y+s*1.75)+.002],rot:[0,0,PI/2+side*.18],color:o.brows,mat:'ink'});}
 const my=y-s*2.15,mz=surf(x,my);
 if(o.mouth==='open'||o.mouth==='grin'){const w=o.mouth==='grin'?1.6:1.15;k.sphere(s*.72,{part,at:[x,my,mz-s*.14],scale:[w,.95,.42],color:MOUTH,mat:'ink'});
  k.sphere(s*.4,{part,at:[x,my-s*.3,mz-s*.02],scale:[w*.95,.6,.42],color:TONGUE,mat:'ink'});}
 else if(o.mouth==='o')k.torus(s*.42,s*.17,{part,at:[x,my+s*.1,mz+.002],color:MOUTH,mat:'ink'});
 else if(o.mouth==='cat'){for(const side of [-1,1])k.torus(s*.5,s*.18,{part,arc:PI,rot:[0,0,PI],at:[x+side*s*.5,my+s*.3,surf(x+side*s*.5,my)+.003],color:INK,mat:'ink'});}
 else if(o.mouth!=='none')k.torus(s*1.0,s*.24,{part,arc:PI,rot:[0,0,PI],at:[x,my+s*.55,mz+.003],color:INK,mat:'ink'});
 if(o.blush!==false){const bx=gap+s*1.55,by=y-s*1.6;for(const side of [-1,1])k.sphere(s*.9,{part,at:[x+side*bx,by,surf(x+side*bx,by)-s*.1],scale:[1.35,.8,.3],color:o.blush??BLUSH,mat:'matte'});}
}
/** Little sneakers on two stubby legs (part `feet`). */
function sneakers(k:ToyKit,o:{xs:readonly number[];top:number;z?:number;leg:string;shoe?:string;sole?:string;part?:string}){
 const part=o.part??'feet',z=o.z??.03;
 for(const x of o.xs){k.capsule(.034,Math.max(.01,o.top-.1),{part,at:[x,(o.top+.08)/2,z-.01],color:o.leg,mat:'vinyl'});
  k.sphere(.07,{part,at:[x,.048,z+.035],scale:[1,.62,1.35],color:o.shoe??WHITE,mat:'vinyl'});
  k.rbox(.13,.022,.19,.01,{part,at:[x,.011,z+.04],color:o.sole??'#e94b3c',mat:'matte'});
  k.torus(.03,.006,{part,at:[x,.07,z+.075],rot:[-1.1,0,0],color:o.sole??'#e94b3c',mat:'matte'});}
}


/** Rice grains scattered on a flat top (y) inside a rectangle, on `part`. */
function grains(k:ToyKit,part:string,cx:number,cz:number,w:number,d:number,y:number,n:number,seed:number,color='#fbfaf3'){
 const r=rng(seed),sh=[k.shade(color,.02),k.shade(color,-.04),k.shade(color,-.08)];
 for(let i=0;i<n;i++)k.sphere(.016,{part,at:[cx+(r()-.5)*w,y,cz+(r()-.5)*d],rot:[0,r()*PI,0],scale:[1.5,.6,.8],color:sh[i%3],mat:'soft',seg:7});
}

const set:ToyModelSet={
 'bento-ben':(k)=>{
  const {body,accent}=k.c,inner=k.shade(body,.16),wood='#c98a56',band='#ff6b8a',rice='#fbfaf3';
  k.part('lid',{at:[0,.5,-.31]});k.part('sticks',{at:[0,.6,.12],parent:'lid'});
  k.part('rice',{at:[-.2,.47,0]});k.part('egg',{at:[.2,.47,.13]});k.part('tako',{at:[.2,.47,-.12]});
  k.part('clipL',{at:[-.44,.44,0]});k.part('clipR',{at:[.44,.44,0]});k.part('feet',{at:[0,.06,0]});
  // The box: a rounded tub, a darker foot band, a lip round the top and a divider; each compartment floor is a lighter socket.
  k.rbox(.84,.34,.6,.07,{at:[0,.27,0],color:body,mat:'vinyl'});
  k.rbox(.85,.05,.61,.02,{at:[0,.125,0],color:k.shade(body,-.1),mat:'vinyl'});
  for(const [w,d,x,z] of [[.84,.03,0,.285],[.84,.03,0,-.285],[.03,.6,-.405,0],[.03,.6,.405,0],[.025,.56,.0,0],[.38,.025,.2,0]] as const)
   k.box(w,.07,d,{at:[x,.475,z],color:body,mat:'vinyl'});
  for(const [x,z,w,d] of [[-.2,0,.37,.54],[.2,.14,.37,.25],[.2,-.14,.37,.25]] as const)k.box(w,.006,d,{at:[x,.443,z],color:inner,mat:'matte'});
  // A green baran leaf divider (zig-zag) between the rice and the sides.
  const zz:[number,number][]=[[-.25,0]];for(let i=0;i<=10;i++)zz.push([-.25+i*.05,.05+(i%2)*.035]);zz.push([.25,0]);
  k.extrude(zz,.012,{at:[.013,.445,0],rot:[0,PI/2,0],color:'#3fae4f',mat:'vinyl',bevel:.003});
  // The rice block with a plum and sesame, the rolled-egg pair, and the octopus sausage (legs, eyes).
  k.rbox(.35,.07,.5,.03,{part:'rice',at:[-.2,.48,0],color:rice,mat:'soft'});grains(k,'rice',-.2,0,.32,.46,.516,48,4,rice);
  k.sphere(.045,{part:'rice',at:[-.2,.52,0],scale:[1,.75,1],color:'#c92f4b',mat:'vinyl'});
  const rs=rng(8);for(let i=0;i<10;i++)k.sphere(.008,{part:'rice',at:[-.2+(rs()-.5)*.28,.517,(rs()-.5)*.4],scale:[1.4,.6,1],color:INK,mat:'ink',seg:6});
  for(const x of [.12,.28]){k.rbox(.14,.09,.2,.03,{part:'egg',at:[x,.49,.13],color:'#ffd54a',mat:'soft'});
   for(const r of [.02,.04])k.torus(r,.005,{part:'egg',at:[x,.49,.231],scale:[1.3,1,1],color:'#e8b52a',mat:'matte'});}
  k.capsule(.06,.06,{part:'tako',at:[.2,.53,-.12],color:'#e2452f',mat:'vinyl'});k.sphere(.062,{part:'tako',at:[.2,.56,-.12],color:'#ef5a43',mat:'vinyl'});
  for(let i=0;i<6;i++){const a=i*PI/3;k.capsule(.02,.04,{part:'tako',at:[.2+Math.sin(a)*.065,.47,-.12+Math.cos(a)*.065],rot:[Math.cos(a)*1.1,0,-Math.sin(a)*1.1],color:'#e2452f',mat:'vinyl'});}
  for(const s of [-1,1])k.sphere(.011,{part:'tako',at:[.2+s*.022,.565,-.06],color:INK,mat:'ink',seg:8});
  k.torus(.012,.004,{part:'tako',at:[.2,.545,-.058],color:INK,mat:'ink'});
  // The lid (lifts off first): a cream lid, a pink elastic band, a football sticker and chopsticks resting on top.
  k.rbox(.86,.07,.62,.03,{part:'lid',at:[0,.545,0],color:accent,mat:'vinyl'});
  k.box(.87,.012,.6,{part:'lid',at:[0,.512,0],color:k.shade(accent,-.12),mat:'vinyl'});
  k.rbox(.07,.075,.635,.012,{part:'lid',at:[.26,.546,0],color:band,mat:'matte'});
  k.cyl(.07,.07,.006,{part:'lid',at:[-.22,.582,-.08],color:WHITE,mat:'vinyl',seg:32});
  const pent:Pt[]=[0,1,2,3,4].map(i=>{const a=PI/2+i*PI*2/5;return [Math.cos(a)*.026,Math.sin(a)*.026] as Pt;});
  k.extrude(pent,.006,{part:'lid',at:[-.22,.586,-.08],rot:[-PI/2,0,0],color:INK,mat:'ink',bevel:.002});
  for(const z of [.09,.15]){k.cyl(.014,.009,.62,{part:'sticks',at:[.02,.6,z],rot:[0,0,PI/2],color:wood,mat:'vinyl',seg:10});k.cyl(.0145,.014,.08,{part:'sticks',at:[-.27,.6,z],rot:[0,0,PI/2],color:'#d8342c',mat:'vinyl',seg:10});}
  k.box(.06,.025,.12,{part:'sticks',at:[.3,.59,.12],color:'#7ec8e3',mat:'vinyl'});
  // Side clips that flip down (the working part).
  for(const s of [-1,1] as const){const p=s<0?'clipL':'clipR';k.rbox(.025,.16,.14,.01,{part:p,at:[s*.435,.5,0],color:k.shade(accent,-.06),mat:'vinyl'});
   k.cyl(.012,.012,.14,{part:p,at:[s*.43,.44,0],rot:[PI/2,0,0],color:k.shade(body,-.15),mat:'vinyl',seg:10});}
  face(k,'body',{x:0,y:.3,surf:()=>.3,gap:.15,size:.05,mouth:'open'});
  // The back: a name sticker with a little ball.
  k.rbox(.26,.12,.006,.03,{at:[0,.28,-.302],color:WHITE,mat:'vinyl'});k.sphere(.03,{at:[-.07,.28,-.303],scale:[1,1,.3],color:INK,mat:'ink'});
  for(const y of [.3,.26])k.box(.1,.012,.004,{at:[.04,y,-.306],color:'#9aa8a0',mat:'matte'});
  sneakers(k,{xs:[-.24,.24],top:.15,z:.05,leg:k.shade(body,-.15)});
  k.hinge('clipR',{axis:[0,0,-1],max:1.3,detents:[],label:'side clip',hint:'Flip my clip',drives:[{part:'clipL',ratio:1,axis:[0,0,1]}]});
  return {kind:{kind:'puzzle',pieces:[{part:'lid',name:'the lid'},{part:'rice',name:'the rice',after:['lid']},{part:'tako',name:'the octopus sausage',after:['lid']},{part:'egg',name:'the rolled egg',after:['lid']}]},
   squeeze:['peek:lid','jiggle'],poke:{default:['jiggle','rattle:sticks'],sticks:['rattle:sticks','wiggle:sticks'],feet:['hop']},tap:['lidopen:lid','blink'],head:'lid',
   voice:{squeeze:['pop:.8'],poke:['click','click:1.3','click:1.1'],tap:['pop','mmhm:1.3']}};
 },
 'tamago-tama':(k)=>{
  const {body,accent}=k.c,layer=k.shade(body,-.07),brown='#e0a33a';
  k.part('flap',{at:[0,.62,.02]});k.part('armL',{at:[-.31,.34,0]});k.part('armR',{at:[.31,.34,0]});k.part('feet',{at:[0,.06,0]});
  // The rolled-egg slice: a soft block, the rolled layers showing as a spiral on both cut faces and as stripes on the sides.
  k.rbox(.6,.5,.36,.1,{at:[0,.37,0],color:body,mat:'soft'});
  const spiral=(z:number,cx:number,cy:number,col:string,r0=.02,r1=.2)=>{const pts:V3[]=[];for(let i=0;i<=90;i++){const t=i/90,a=t*PI*2*3.2,r=r0+(r1-r0)*t;pts.push([cx+Math.cos(a)*r*1.3,cy+Math.sin(a)*r,z]);}k.tube(pts,.007,{color:col,mat:'soft'});};
  spiral(-.182,0,.37,layer,.02,.19);spiral(.182,.05,.27,k.shade(body,-.035),.015,.11);
  const r=rng(6);for(let i=0;i<12;i++)k.sphere(.035+r()*.03,{at:[(r()-.5)*.44,.62,(r()-.5)*.24],scale:[1,.12,1],color:brown,mat:'soft',seg:14});
  // The loose end of the outer layer: lift it and the roll starts to unroll (the working part).
  k.rbox(.38,.02,.19,.01,{part:'flap',at:[0,.628,-.075],color:k.shade(body,.03),mat:'soft'});
  k.capsule(.013,.36,{part:'flap',at:[0,.628,-.165],rot:[0,0,PI/2],color:layer,mat:'soft'});
  face(k,'body',{x:0,y:.47,surf:()=>.18,gap:.12,size:.046,mouth:'open'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.04,.09,{part:p,at:[s*.34,.3,.04],rot:[0,0,s*.55],color:k.shade(body,-.04),mat:'soft'});k.sphere(.042,{part:p,at:[s*.38,.24,.06],color:k.shade(body,-.04),mat:'soft'});}
  sneakers(k,{xs:[-.14,.14],top:.13,z:.05,leg:accent,sole:accent});
  k.hinge('flap',{axis:'x',max:1.7,detents:[.8],label:'egg layer',hint:'Unroll me'});
  return {kind:{kind:'squish'},soft:{soft:.6},
   squeeze:['wobble'],poke:{default:['wobble'],flap:['flap:flap'],armL:['wave:armL'],armR:['wave:armR'],feet:['hop']},tap:['twirl','sparkle'],head:{above:.46},
   voice:{squeeze:['flop'],poke:['boop:.8'],tap:['flop:1.4','cheer:1.2']}};
 },
 'curry-bun-cooper':(k)=>{
  const {body,accent}=k.c,C:V3=[0,.43,0],RX=.47,RY=.31,RZ=.36,crumb=k.shade(body,.12);
  k.part('steam',{at:[0,.76,0]});k.part('legL',{at:[-.13,.14,0]});k.part('legR',{at:[.13,.14,0]});k.part('armL',{at:[-.44,.4,0]});k.part('armR',{at:[.44,.4,0]});
  // The fried oval bun: lumpy crust, a pinched seam on top, panko crumbs (none on the face) and a little curry leak.
  k.blob(.4,{at:C,scale:[RX/.4,RY/.4,RZ/.4],amp:.012,freq:8,seed:5,color:body,dark:k.shade(body,-.16),light:'#e7a64a',mat:'vinyl'});
  const seam:V3[]=[];for(let i=0;i<=20;i++){const x=-.36+i*.036,u=x/RX;seam.push([x,C[1]+RY*Math.sqrt(Math.max(0,1-u*u))*.98+.006,-.02+.012*Math.sin(i*1.7)]);}k.tube(seam,.016,{color:k.shade(body,-.1),mat:'vinyl'});
  const r=rng(11),z0=new T.Vector3(0,0,1),q=new T.Quaternion(),e=new T.Euler();
  for(let i=0,n=0;i<260&&n<70;i++){const u=r()*2-1,a=r()*PI*2,s=Math.sqrt(1-u*u),d=new T.Vector3(s*Math.cos(a),u,s*Math.sin(a));
   if(d.z>.3&&Math.abs(d.x)<.62&&d.y>-.55&&d.y<.6)continue;if(d.y<-.55)continue;
   const p=new T.Vector3(d.x*RX,C[1]+d.y*RY,d.z*RZ),nn=new T.Vector3(d.x/RX,d.y/RY,d.z/RZ).normalize();e.setFromQuaternion(q.setFromUnitVectors(z0,nn));
   k.blob(.022+r()*.016,{at:[p.x,p.y,p.z],rot:[e.x,e.y,e.z],scale:[1,1,.5],amp:.006,freq:6,seed:i,color:crumb,dark:k.shade(body,-.08),mat:'matte',seg:10});n++;}
  k.blob(.06,{at:[.4,.5,.12],scale:[.6,1,1],amp:.01,freq:5,seed:3,color:accent,dark:k.shade(accent,-.1),mat:'jelly',seg:20});
  k.capsule(.022,.05,{at:[.43,.43,.13],color:accent,mat:'jelly'});
  face(k,'body',{x:0,y:.47,surf:(x,y)=>ellSurf(0,C[1],0,RX,RY,RZ)(x,y)+.012,gap:.15,size:.054,mouth:'open',blush:'#ff7a5a',brows:k.shade(body,-.35)});
  k.sphere(.03,{at:[-.3,.62,.16],scale:[1,1.35,.6],color:'#8fd8ff',mat:'jelly'});k.cone(.022,.04,{at:[-.3,.66,.16],color:'#8fd8ff',mat:'jelly'});
  // Steam curls (they bobble): three soft puffs and a swirl.
  k.tube([[0,.76,0],[-.05,.82,0],[.0,.88,0],[.05,.93,0],[.01,.99,0]],.016,{part:'steam',color:WHITE,mat:'soft'});k.sphere(.016,{part:'steam',at:[.01,.99,0],color:WHITE,mat:'soft'});
  k.tube([[.12,.74,0],[.09,.79,0],[.13,.84,0],[.1,.88,0]],.012,{part:'steam',color:WHITE,mat:'soft'});k.sphere(.012,{part:'steam',at:[.1,.88,0],color:WHITE,mat:'soft'});
  k.tube([[-.13,.73,0],[-.16,.77,0],[-.12,.81,0]],.01,{part:'steam',color:WHITE,mat:'soft'});k.sphere(.01,{part:'steam',at:[-.12,.81,0],color:WHITE,mat:'soft'});
  for(const s of [-1,1] as const){const leg=s<0?'legL':'legR';k.capsule(.04,.05,{part:leg,at:[s*.13,.12,.02],color:k.shade(body,-.2),mat:'vinyl'});
   k.sphere(.07,{part:leg,at:[s*.13,.045,.06],scale:[1,.6,1.35],color:INK,mat:'vinyl'});k.rbox(.13,.02,.19,.01,{part:leg,at:[s*.13,.01,.065],color:WHITE,mat:'matte'});
   k.capsule(.035,.08,{part:s<0?'armL':'armR',at:[s*.48,.38,.06],rot:[0,0,s*.8],color:k.shade(body,-.05),mat:'vinyl'});}
  return {kind:{kind:'squish'},soft:{soft:.55,crackle:true},springs:[{part:'steam',k:40,c:1.8,amp:1.6}],
   squeeze:['puff'],poke:{default:['hothot'],legL:['kick:legL'],legR:['kick:legR'],steam:['wiggle:steam','puff'],armL:['wave:armL'],armR:['wave:armR']},tap:['puff','sway','wiggle:steam'],head:{above:.62},
   voice:{squeeze:['crunch','puff:1.2'],poke:['hothot'],tap:['puff:1.5','breeze:1.3']}};
 },
 'banana-bolt':(k)=>{
  const {body,accent}=k.c,fruit='#fff3c4',inside='#fff7d6',ridge=k.shade(body,-.08),D=.2,B=.08,Z=D/2;
  // The peel: a curved crescent (front flat face, rounded by a deep bevel) from the stem up to the peel line.
  const cx=(t:number)=>.03-.11*Math.sin(PI*t*.92),w=(t:number)=>.035+.085*Math.pow(Math.sin(PI*Math.min(1,t*.95+.05)),.6),y=(t:number)=>.16+.6*t;
  const L:Pt[]=[],R:Pt[]=[];for(let i=0;i<=28;i++){const t=i/28;L.push([cx(t)-w(t),y(t)]);R.push([cx(t)+w(t),y(t)]);}
  const tTop=1,topY=y(tTop),topX=cx(tTop);
  k.part('fruit',{at:[topX,topY,0]});for(const p of ['peelF','peelB','peelL','peelR'])k.part(p,{at:[topX,topY-.01,0]});
  k.part('armL',{at:[-.2,.46,0]});k.part('armR',{at:[.13,.48,0]});k.part('feet',{at:[0,.06,0]});
  k.extrude([...L,...R.reverse()],D,{color:body,mat:'vinyl',bevel:B});
  for(const sd of [-1,1])k.tube(Array.from({length:15},(_,i)=>{const t=.06+i/14*.88;return [cx(t)+sd*w(t)*.92,y(t),Z+.004] as V3;}),.008,{color:ridge,mat:'vinyl'});
  k.cyl(.035,.045,.07,{at:[cx(0),.13,0],color:accent,mat:'matte'});k.sphere(.04,{at:[cx(0),.1,0],scale:[1,.5,1],color:k.shade(accent,-.1),mat:'matte'});
  const rs=rng(4);for(let i=0;i<9;i++){const t=.2+rs()*.6;k.sphere(.012+rs()*.008,{at:[cx(t)+(rs()-.5)*w(t),y(t),-Z-.002],scale:[1,1,.3],color:'#8a6a2a',mat:'matte',seg:8});}
  // The fruit, peeking out of four peel flaps that fold down on their hinges.
  k.smoothLathe([[0,topY-.06],[.11,topY-.04],[.115,topY+.06],[.095,topY+.15],[.055,topY+.21],[0,topY+.225]],{part:'fruit',at:[topX,0,0],color:fruit,mat:'soft',seg:36});
  const flap=new T.Shape();flap.moveTo(-.075,0);flap.lineTo(.075,0);flap.quadraticCurveTo(.08,.12,0,.2);flap.quadraticCurveTo(-.08,.12,-.075,0);const fp=outline(flap,18);
  for(const [p,a] of [['peelF',0],['peelR',PI/2],['peelB',PI],['peelL',-PI/2]] as const){const dx=Math.sin(a)*.115,dz=Math.cos(a)*.115;
   k.extrude(fp,.022,{part:p,at:[topX+dx,topY-.02,dz],rot:yawPitch(a,-.12),color:body,mat:'vinyl',bevel:.008});
   k.extrude(scalePts(fp,.9,0,.08),.01,{part:p,at:[topX+dx*.9,topY-.015,dz*.9],rot:yawPitch(a,-.12),color:inside,mat:'matte',bevel:.003});}
  face(k,'body',{x:cx(.55)+.005,y:y(.55),surf:()=>Z,gap:.06,size:.034,mouth:'smile',brows:k.shade(accent,-.1)});
  // A lightning-bolt sticker on the back.
  k.extrude([[-.02,.05],[.03,.05],[0,.005],[.03,.005],[-.03,-.06],[-.005,-.01],[-.035,-.01]],.012,{at:[cx(.4),y(.4),-Z-.004],rot:[0,PI,0],color:'#ff9a3c',mat:'vinyl',bevel:.003});
  k.capsule(.026,.13,{part:'armL',at:[cx(.5)-w(.5)-.11,.44,.02],rot:[0,0,-.7],color:body,mat:'vinyl'});k.sphere(.034,{part:'armL',at:[cx(.5)-w(.5)-.17,.39,.03],color:body,mat:'vinyl'});
  k.capsule(.026,.13,{part:'armR',at:[cx(.5)+w(.5)+.11,.5,.02],rot:[0,0,1.1],color:body,mat:'vinyl'});k.sphere(.034,{part:'armR',at:[cx(.5)+w(.5)+.18,.53,.03],color:body,mat:'vinyl'});
  sneakers(k,{xs:[-.08,.12],top:.18,z:.03,leg:accent,shoe:WHITE,sole:'#2f8fd6'});
  k.hinge('peelF',{axis:'x',max:1.9,detents:[.9],label:'peel',hint:'Peel me',drives:[{part:'peelB',ratio:1,axis:[-1,0,0]},{part:'peelL',ratio:1,axis:[0,0,1]},{part:'peelR',ratio:1,axis:[0,0,-1]}]});
  return {kind:{kind:'mechanism'},springs:[{part:'fruit',k:60,c:2.4,amp:1.3}],
   squeeze:['flap:peelL+peelR','peek:fruit'],poke:{default:['tilt:root'],armR:['point:armR'],armL:['wave:armL'],peelL:['flap:peelL'],peelR:['flap:peelR'],feet:['hop']},tap:['point:armR','hop'],head:{above:.72},
   voice:{squeeze:['boing:1.3','whoosh:2'],poke:['boing:.9'],tap:['whoosh:1.4','pip:1.2']}};
 },
 'juice-box-jun':(k)=>{
  const {body}=k.c,stripe='#ff4f6d',water='#5ec8ff',foil='#d6dde5',W=.46,H=.62,D=.3,Y0=.13;
  k.part('straw',{at:[.11,Y0+H,0]});k.part('earL',{at:[-W/2,Y0+H-.01,0]});k.part('earR',{at:[W/2,Y0+H-.01,0]});
  k.part('armL',{at:[-.25,.42,0]});k.part('armR',{at:[.25,.42,0]});k.part('feet',{at:[0,.06,0]});
  // The carton: a soft-cornered brick, a sealed seam along the top, folded triangle ears at the sides.
  k.rbox(W,H,D,.045,{at:[0,Y0+H/2,0],color:body,mat:'vinyl'});
  k.rbox(W-.04,.03,.04,.01,{at:[0,Y0+H+.012,-.11],color:k.shade(body,-.06),mat:'vinyl'});
  for(const s of [-1,1] as const){const p=s<0?'earL':'earR';k.extrude([[0,0],[.13,0],[0,-.11]],.012,{part:p,at:[s*(W/2+.006),Y0+H-.012,s*.065],rot:[0,s*PI/2,0],scale:[1,1,1],color:k.shade(body,-.04),mat:'vinyl',bevel:.004});}
  // Front label: a white panel with an orange (segments, a leaf), and his face above it.
  k.rbox(.38,.25,.012,.04,{at:[0,Y0+.18,D/2],color:WHITE,mat:'vinyl'});
  k.cyl(.075,.075,.012,{at:[-.05,Y0+.18,D/2+.008],rot:[PI/2,0,0],color:'#ff8a1f',mat:'vinyl',seg:32});
  k.cyl(.06,.06,.004,{at:[-.05,Y0+.18,D/2+.015],rot:[PI/2,0,0],color:'#ffb347',mat:'vinyl',seg:32});
  for(let i=0;i<6;i++){const a=i*PI/3;k.box(.004,.06,.004,{at:[-.05+Math.sin(a)*.03,Y0+.18+Math.cos(a)*.03,D/2+.018],rot:[0,0,-a],color:WHITE,mat:'matte'});}
  k.sphere(.035,{at:[.0,Y0+.27,D/2+.01],rot:[0,0,-.7],scale:[1.5,.6,.3],color:'#5fb04a',mat:'vinyl'});
  k.sphere(.03,{at:[.09,Y0+.15,D/2+.012],scale:[1,1,.35],color:water,mat:'vinyl'});k.cone(.022,.04,{at:[.09,Y0+.185,D/2+.012],scale:[1,1,.45],color:water,mat:'vinyl'});
  face(k,'body',{x:0,y:Y0+.47,surf:()=>D/2,gap:.11,size:.046,mouth:'open'});
  // Back: a nutrition panel and a little barcode.
  k.rbox(.3,.3,.008,.02,{at:[0,Y0+.33,-D/2-.002],color:WHITE,mat:'vinyl'});
  for(let i=0;i<6;i++)k.box(.22-(i%3)*.04,.012,.004,{at:[-.02,Y0+.44-i*.04,-D/2-.008],color:'#9aa8a0',mat:'matte'});
  for(let i=0;i<9;i++)k.box(.006+(i%3)*.004,.07,.004,{at:[-.08+i*.02,Y0+.1,-D/2-.004],color:INK,mat:'ink'});
  // The bendy straw in its foil hole (it bobbles): a stripe winds round it and the bend is ribbed.
  k.cyl(.04,.04,.008,{at:[.11,Y0+H+.004,0],color:foil,mat:'gold'});
  const sp:V3[]=[[.11,Y0+H-.02,0],[.11,Y0+H+.18,0],[.11,Y0+H+.3,0],[.125,Y0+H+.345,0],[.165,Y0+H+.375,0],[.24,Y0+H+.4,0]];
  k.tube(sp,.024,{part:'straw',color:WHITE,mat:'vinyl'});k.sphere(.024,{part:'straw',at:sp[sp.length-1],color:WHITE,mat:'vinyl'});
  const hel:V3[]=[];for(let i=0;i<=40;i++){const t=i/40,yy=Y0+H+.01+t*.28,a=t*PI*7;hel.push([.11+Math.cos(a)*.025,yy,Math.sin(a)*.025]);}k.tube(hel,.006,{part:'straw',color:stripe,mat:'vinyl'});
  for(let i=0;i<4;i++)k.torus(.026,.005,{part:'straw',at:[.113+i*.008,Y0+H+.3+i*.017,0],rot:[PI/2,0,-.3-i*.22],color:k.shade(WHITE,-.08),mat:'vinyl'});
  for(const s of [-1,1] as const)k.capsule(.04,.1,{part:s<0?'armL':'armR',at:[s*.28,.36,.03],rot:[0,0,s*.45],color:body,mat:'vinyl'});
  k.sphere(.05,{part:'armL',at:[-.33,.27,.08],scale:[1,1.1,1],color:water,mat:'jelly'});k.cone(.036,.07,{part:'armL',at:[-.33,.33,.08],color:water,mat:'jelly'});
  sneakers(k,{xs:[-.12,.12],top:Y0+.04,z:.05,leg:k.shade(body,-.18)});
  k.hinge('earR',{axis:[0,0,1],max:1.5,label:'carton ear',hint:'Unfold me',drives:[{part:'earL',ratio:1,axis:[0,0,-1]}]});
  return {kind:{kind:'bobble',head:'straw'},
   squeeze:['wiggle:straw'],poke:{default:['bubbles','jiggle'],straw:['wiggle:straw'],armL:['wave:armL'],armR:['wave:armR'],feet:['hop']},tap:['peek:straw','wave:armR'],head:{above:.7},
   voice:{squeeze:['slurp'],poke:['bubble:.6','bloop:.7'],tap:['pip:.9','cheer:.9']}};
 },
 'sushi-roll-sora':(k)=>{
  const {body,accent}=k.c,wood='#d9b77a',rice='#fbfaf3',cap=accent,deep='#147a8a',R=.27;
  k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});k.part('band',{at:[0,.19,0],parent:'inner'});
  // The secret capsule: glitter coral and glitter teal halves, a gold rim, a pearl star.
  const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
  const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
  k.smoothLathe(dome,{part:'capTop',color:cap,mat:'glitter',seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:k.shade(cap,.1),mat:'glitter',seg:44});
  k.torus(.475,.015,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:'#ffd447',mat:'gold'});
  const star:Pt[]=[];for(let i=0;i<10;i++){const a=PI/2+i*PI/5,rr=i%2?.045:.1;star.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  k.extrude(star,.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:WHITE,mat:'pearl',bevel:.008});
  k.smoothLathe(cupP,{part:'capBot',color:deep,mat:'glitter',seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:k.shade(deep,.1),mat:'glitter',seg:44});
  k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:'#ffd447',mat:'gold'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(deep,-.1),mat:'glitter',seg:36});
  // Inside: a wooden geta board, the roll (nori, rice, cucumber / carrot / egg), pickled ginger, wasabi and the captain band.
  k.rbox(.9,.05,.5,.02,{part:'inner',at:[0,.075,0],color:wood,mat:'matte'});for(const s of [-1,1])k.rbox(.08,.05,.46,.01,{part:'inner',at:[s*.32,.025,0],color:k.shade(wood,-.15),mat:'matte'});
  const nori=prof(2,t=>[R,.1+t*.5] as Pt);k.lathe([[0,.1],...nori,[R-.035,.6],[0,.6]],{part:'inner',color:body,mat:'nori',seg:56});
  k.torus(R-.018,.022,{part:'inner',at:[0,.6,0],rot:[PI/2,0,0],color:rice,mat:'soft'});k.cyl(R-.03,R-.03,.012,{part:'inner',at:[0,.602,0],color:rice,mat:'soft',seg:48});
  grains(k,'inner',0,0,.36,.36,.612,40,9,rice);
  k.rbox(.09,.04,.09,.02,{part:'inner',at:[-.06,.62,.05],color:'#5fb04a',mat:'vinyl'});k.rbox(.09,.04,.09,.02,{part:'inner',at:[.06,.62,.05],color:'#ff8a3c',mat:'vinyl'});k.rbox(.13,.04,.07,.02,{part:'inner',at:[0,.62,-.07],color:'#ffd54a',mat:'vinyl'});
  for(let i=0;i<4;i++)k.sphere(.05,{part:'inner',at:[.34-i*.015,.12+i*.012,.12-i*.03],rot:[0,i*.6,.3],scale:[1.2,.25,1],color:'#ffb3c1',mat:'jelly'});
  k.blob(.045,{part:'inner',at:[-.34,.13,.13],scale:[1,.7,1],amp:.008,freq:6,color:'#9ccc4a',mat:'matte',seg:20});
  face(k,'inner',{x:0,y:.47,surf:(x,y)=>cylSurf(R)(x,y)+.002,gap:.1,size:.046,mouth:'open',prefix:'in',blush:'#ff8fa0'});
  k.lathe([[R+.012,.13],[R+.012,.25]],{part:'band',color:cap,mat:'vinyl',seg:56});
  for(const y of [.132,.248])k.torus(R+.012,.006,{part:'band',at:[0,y,0],rot:[PI/2,0,0],color:'#ffd447',mat:'gold'});
  k.torus(.035,.011,{part:'band',arc:PI*1.5,rot:[0,0,PI/4],at:[0,.19,R+.016],color:WHITE,mat:'vinyl'});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['circle'],poke:{default:['spin'],band:['pop:band'],ineyes:['blink:ineyes']},tap:['pop:band','hop','sparkle'],head:{above:.52},
   voice:{squeeze:['roll','roll:1.2'],poke:['whoosh:1.2'],tap:['roll:1.4','cheer']}};
 },
};
export default set;
