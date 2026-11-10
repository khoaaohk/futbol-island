/**
 * Boots & Kits (gs-eleven), rebuilt for round 3B batch 3 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): football gear with
 * faces from the machine beside the Eleven Park touchline. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Golden Boot Gus    a wind-up walker: a gold boot on a navy soleplate with ten studs, crossed laces and a bow, a butterfly
 *                      key on the heel (bonus: pull the heel loop and the ball pops up for a keepy-up)
 *   Shin Pad Shay      a squishy shin guard: a hard shell over navy foam (vents, a raised panel, a hex-foam back), on boots
 *                      (bonus: the ankle strap is a working velcro flap)
 *   Goalie Glove Frog  a bobblehead frog keeper: big rolled-finger gloves with latex palms and wrist straps (bonus: squishy)
 *   Armband Andi       a squishy stretchy captain's armband with a big C patch and ribbing (bonus: a C medallion on a ball
 *                      chain at the back velcro tab)
 *   Kit Shirt Kip      take-apart: the training bib comes off first, then the crest and the back number (bonus: a Kit Shop
 *                      swing tag dangling from his sleeve)
 *   Corner Flag Cora   the rare: a glitter red-and-yellow secret capsule; inside, Cora's chequered corner flag on a springy
 *                      striped pole over a turf corner with its quarter arc and a ball (the extra part); the flag swings like
 *                      a charm (bonus)
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
 */
import * as T from 'three';
import type {Finish,ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96',GRASS='#5fb34a';
type Pt=readonly [number,number];
type Surf=(x:number,y:number)=>number;
/** A shape's outline as points (the closing duplicate dropped). */
function outline(sh:T.Shape,n:number):Pt[]{const p=sh.getSpacedPoints(n).map(q=>[q.x,q.y] as Pt);const a=p[0],b=p[p.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)p.pop();return p;}
/** Euler angles (XYZ) for "tilt about x, then turn about y". */
function yawPitch(yaw:number,pitch:number,roll=0):V3{const q=new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,roll,'YXZ'));const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
const ellSurf=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number):Surf=>(x,y)=>{const u=(x-cx)/rx,v=(y-cy)/ry;return cz+rz*Math.sqrt(Math.max(0,1-u*u-v*v));};
const sphSurf=(cy:number,R:number):Surf=>(x,y)=>Math.sqrt(Math.max(0,R*R-x*x-(y-cy)**2));
/** A premium capsule-toy face: glossy ink eyes with two highlights (eyeL / eyeR under eyes, so blink works), a mouth, blush. */
function face(k:ToyKit,part:string,o:{x:number;y:number;surf:Surf;gap?:number;size?:number;mouth?:'smile'|'open'|'o'|'grin'|'none';blush?:string|false;eyes?:'dot'|'happy';prefix?:string;brows?:string}){
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
 else if(o.mouth!=='none')k.torus(s*1.0,s*.24,{part,arc:PI,rot:[0,0,PI],at:[x,my+s*.55,mz+.003],color:INK,mat:'ink'});
 if(o.blush!==false){const bx=gap+s*1.55,by=y-s*1.6;for(const side of [-1,1])k.sphere(s*.9,{part,at:[x+side*bx,by,surf(x+side*bx,by)-s*.1],scale:[1.35,.8,.3],color:o.blush??BLUSH,mat:'matte'});}
}
/** A football: white, eight ink patches. */
function football(k:ToyKit,part:string,at:V3,r:number){
 k.sphere(r,{part,at,color:WHITE,mat:'vinyl'});
 for(const [dx,dy,dz] of [[0,.2,1],[.8,.5,.4],[-.8,.5,.4],[.6,-.6,.55],[-.6,-.6,.55],[0,.3,-1],[.7,-.2,-.6],[-.7,-.2,-.6]] as const){const n=Math.hypot(dx,dy,dz);
  k.cyl(r*.34,r*.34,r*.1,{part,at:[at[0]+dx/n*r*.97,at[1]+dy/n*r*.97,at[2]+dz/n*r*.97],rot:yawPitch(Math.atan2(dx,dz),Math.acos(dy/n)),color:INK,mat:'ink',seg:5});}
}
/** Little football boots with studs on stubby legs (part `part`). */
function boots(k:ToyKit,o:{xs:readonly number[];top:number;z?:number;leg:string;boot:string;part?:string;sock?:string}){
 const part=o.part??'feet',z=o.z??.03;
 for(const x of o.xs){k.capsule(.032,Math.max(.01,o.top-.1),{part,at:[x,(o.top+.08)/2,z-.01],color:o.leg,mat:o.sock?'soft':'vinyl'});
  if(o.sock)k.torus(.036,.01,{part,at:[x,o.top-.01,z-.01],rot:[PI/2,0,0],color:o.sock,mat:'soft'});
  k.sphere(.068,{part,at:[x,.05,z+.04],scale:[1,.6,1.4],color:o.boot,mat:'vinyl'});k.box(.012,.04,.09,{part,at:[x+.03,.06,z+.07],rot:[.3,0,0],color:WHITE,mat:'matte'});
  for(const [dx,dz] of [[-.03,.0],[.03,.0],[-.03,.09],[.03,.09]] as const)k.cyl(.012,.01,.022,{part,at:[x+dx,.011,z+dz],color:'#d9dde0',mat:'matte',seg:10});
  k.rbox(.12,.02,.18,.01,{part,at:[x,.024,z+.04],color:k.shade(o.boot,-.25),mat:'matte'});}
}
/** A five-point star outline. */
const starPts=(R:number,r:number):Pt[]=>Array.from({length:10},(_,i)=>{const a=PI/2+i*PI/5,rr=i%2?r:R;return [Math.cos(a)*rr,Math.sin(a)*rr] as Pt;});
/** The secret capsule: a domed top and a cup bottom, each a shell (outside + inside), a rim and a mark on the front. */
function secretCapsule(k:ToyKit,o:{top:string;topMat:Finish;bot:string;botMat:Finish;rim:string;mark:string;markMat:Finish}){
 k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
 const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
 const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
 k.smoothLathe(dome,{part:'capTop',color:o.top,mat:o.topMat,seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:k.shade(o.top,.08),mat:o.topMat,seg:44});
 k.torus(.475,.015,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});
 k.extrude(starPts(.1,.045),.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:o.mark,mat:o.markMat,bevel:.008});
 k.smoothLathe(cupP,{part:'capBot',color:o.bot,mat:o.botMat,seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:k.shade(o.bot,.08),mat:o.botMat,seg:44});
 k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:o.rim,mat:'gold'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(o.bot,-.1),mat:o.botMat,seg:36});
}

const set:ToyModelSet={
 'golden-boot-gus':(k)=>{
  const {body,accent}=k.c,gold=body,navy=accent,stud='#e4e8ec';
  k.part('laces',{at:[0,.35,-.05]});k.part('key',{at:[0,.27,-.42]});k.part('tab',{at:[0,.45,-.33]});k.part('ball',{at:[.33,.085,.24]});
  // The soleplate (toe +z): a foot-shaped navy plate with ten conical studs, six on the forefoot and four on the heel.
  const sh=new T.Shape();sh.moveTo(0,-.38);sh.bezierCurveTo(.14,-.38,.15,-.2,.15,-.08);sh.bezierCurveTo(.15,.06,.19,.18,.17,.3);sh.bezierCurveTo(.15,.42,.05,.45,0,.45);
  sh.bezierCurveTo(-.05,.45,-.15,.42,-.16,.3);sh.bezierCurveTo(-.17,.18,-.14,.06,-.14,-.08);sh.bezierCurveTo(-.14,-.2,-.13,-.38,0,-.38);
  k.extrude(outline(sh,48),.05,{at:[0,.045,0],rot:[PI/2,0,0],color:k.shade(navy,-.04),mat:'matte',bevel:.015});
  for(const [x,z] of [[-.08,.33],[.08,.33],[-.09,.19],[.09,.19],[-.08,.05],[.08,.05],[-.07,-.21],[.07,-.21],[-.07,-.32],[.07,-.32]] as const)
   k.cyl(.017,.025,.026,{at:[x,.013,z],color:stud,mat:'matte',seg:14});
  // The upper: a gold toe box and a gold heel, the ankle collar with a padded navy rim.
  const toe={c:[0,.15,.2] as V3,r:[.164,.136,.23] as V3},heel={c:[0,.2,-.17] as V3,r:[.156,.171,.2185] as V3};
  k.sphere(1,{at:toe.c,scale:toe.r,color:gold,mat:'gold',seg:44});k.sphere(1,{at:heel.c,scale:heel.r,color:gold,mat:'gold',seg:44});
  k.cyl(.14,.15,.16,{at:[0,.38,-.2],color:gold,mat:'gold',seg:40});
  k.torus(.135,.032,{at:[0,.46,-.2],rot:[PI/2,0,0],color:navy,mat:'soft'});k.cyl(.11,.11,.01,{at:[0,.462,-.2],color:'#0f1a3a',mat:'matte',seg:32});
  // Side of the upper at (y, z): the wider of the two ellipsoids.
  const xs=(y:number,z:number)=>Math.max(...[toe,heel].map(e=>{const v=(y-e.c[1])/e.r[1],w=(z-e.c[2])/e.r[2];return e.r[0]*Math.sqrt(Math.max(0,1-v*v-w*w));}));
  // A navy speed flash and a star on each side; a navy heel counter band round the back.
  for(const s of [-1,1]){const pts:V3[]=[[-.33,.1],[-.2,.16],[-.02,.2],[.14,.2],[.27,.15]].map(([z,y])=>[s*(xs(y,z)+.004),y,z] as V3);k.tube(pts,.017,{color:navy,mat:'vinyl'});
   k.extrude(starPts(.045,.02),.012,{at:[s*(xs(.25,-.12)+.003),.25,-.12],rot:[0,s*PI/2,0],color:navy,mat:'vinyl',bevel:.003});}
  const hv=Math.sqrt(1-((.09-heel.c[1])/heel.r[1])**2),band:V3[]=[];
  for(let i=0;i<=12;i++){const a=-PI/2+i*PI/12;band.push([Math.sin(a)*heel.r[0]*hv*1.03,.09,heel.c[2]-Math.cos(a)*heel.r[2]*hv*1.03]);}
  k.tube(band,.02,{color:navy,mat:'vinyl'});
  // The tongue and laces: four crossings with eyelets, a bow on top.
  const yOn=(z:number)=>.272+(.17-z)*(.09/.28);
  k.rbox(.13,.024,.32,.01,{at:[0,.3,.06],rot:[.31,0,0],color:navy,mat:'soft'});
  for(let i=0;i<4;i++){const z=.16-i*.07,y=yOn(z)+.024;
   for(const s of [-1,1]){k.tube([[-.06*s,y,z+.025],[0,y+.008,z],[.06*s,y,z-.025]],.0085,{color:WHITE,mat:'matte'});k.sphere(.011,{at:[s*.072,y-.004,z+s*.025],color:'#ffe9a0',mat:'gold'});}}
  for(const s of [-1,1]){k.torus(.036,.01,{part:'laces',at:[s*.04,.375,-.07],rot:[-1.1,0,s*.55],color:WHITE,mat:'matte'});
   k.capsule(.008,.07,{part:'laces',at:[s*.025,.355,-.025],rot:[1.2,0,s*.4],color:WHITE,mat:'matte'});}
  k.sphere(.016,{part:'laces',at:[0,.365,-.06],color:WHITE,mat:'matte'});
  face(k,'body',{x:0,y:.17,surf:(x,y)=>ellSurf(...toe.c,...toe.r)(x,y)+.004,gap:.072,size:.036,mouth:'open'});
  // The wind-up key on the heel: a shaft and a butterfly grip.
  k.cyl(.02,.02,.1,{part:'key',at:[0,.27,-.4],rot:[PI/2,0,0],color:'#d9b13b',mat:'gold',seg:14});
  for(const s of [-1,1])k.cyl(.055,.055,.02,{part:'key',at:[s*.06,.27,-.455],rot:[PI/2,0,0],scale:[1,1,.75],color:'#e8c14a',mat:'gold'});
  k.sphere(.026,{part:'key',at:[0,.27,-.455],color:'#e8c14a',mat:'gold'});
  // The heel pull loop (the working part): pull it back and the ball pops up for a keepy-up.
  k.torus(.045,.013,{part:'tab',at:[0,.5,-.34],rot:[0,PI/2,0],color:navy,mat:'soft'});k.proxy('tab',.08,[0,.5,-.34]);
  k.lever('tab',{axis:[-1,0,0],max:.9,label:'heel loop',hint:'Pull my loop',fires:{part:'ball',at:.7,lift:[0,.24,0],hold:.45}});
  football(k,'ball',[.33,.085,.24],.085);
  return {kind:{kind:'windup',key:'key'},
   squeeze:['wiggle:laces','jiggle'],poke:{default:['rock'],laces:['wiggle:laces'],ball:['juggle:ball'],tab:['juggle:ball']},tap:['juggle:ball','sparkle'],head:{above:.3},
   voice:{squeeze:['d_zip','d_zip:1.25'],poke:['tok','d_thump:1.4'],tap:['tok','tok:1.15','tok:1.3']}};
 },
 'shin-pad-shay':(k)=>{
  const {body,accent}=k.c,shell=body,navy=accent;
  k.part('armL',{at:[-.21,.52,.0]});k.part('armR',{at:[.21,.52,.0]});k.part('strap',{at:[-.27,.25,.075]});k.part('feet',{at:[0,.12,0]});
  // The shield outline: wide and round at the knee, tapering to the ankle.
  const sh=new T.Shape();sh.moveTo(0,.13);sh.bezierCurveTo(.12,.13,.19,.16,.2,.3);sh.bezierCurveTo(.22,.5,.27,.68,.25,.82);sh.bezierCurveTo(.23,.93,.1,.96,0,.96);
  sh.bezierCurveTo(-.1,.96,-.23,.93,-.25,.82);sh.bezierCurveTo(-.27,.68,-.22,.5,-.2,.3);sh.bezierCurveTo(-.19,.16,-.12,.13,0,.13);
  const pad=outline(sh,56),big=pad.map(([x,y])=>[x*1.07,.545+(y-.545)*1.04] as Pt);
  // Navy foam behind (a hex-dot back), the white hard shell, a raised centre panel with a navy keyline, three vents.
  k.extrude(big,.06,{at:[0,0,-.035],color:navy,mat:'soft',bevel:.02});
  for(let r=0;r<5;r++)for(let c=-1;c<=1;c++){const x=c*.11+(r%2?.055:0),y=.28+r*.13;if(Math.abs(x)>.17)continue;k.sphere(.03,{at:[x,y,-.064],scale:[1,1,.35],color:k.shade(navy,.1),mat:'soft',seg:12});}
  k.extrude(pad,.07,{at:[0,0,.02],color:shell,mat:'vinyl',bevel:.03});
  const P={c:[0,.56,.055] as V3,r:[.165,.28,.035] as V3};k.sphere(1,{at:P.c,scale:P.r,color:k.shade(shell,-.02),mat:'vinyl',seg:40});
  k.tube(Array.from({length:33},(_,i)=>{const a=i/32*PI*2;return [Math.cos(a)*(P.r[0]+.004),P.c[1]+Math.sin(a)*(P.r[1]+.004),P.c[2]+.004] as V3;}),.007,{color:navy,mat:'vinyl'});
  for(const [x,y] of [[-.12,.84],[0,.87],[.12,.84]] as const)k.capsule(.012,.05,{at:[x,y,.058],rot:[0,0,PI/2+x*1.2],color:navy,mat:'matte'});
  k.roundTri(.065,.02,{at:[0,.37,.07],rot:[0,0,PI],color:navy,mat:'vinyl',round:.25});k.extrude(starPts(.026,.011),.01,{at:[0,.385,.083],color:'#ffd447',mat:'vinyl',bevel:.002});
  face(k,'body',{x:0,y:.62,surf:(x,y)=>ellSurf(...P.c,...P.r)(x,y)+.002,gap:.08,size:.04,mouth:'grin',brows:navy});
  // The velcro ankle strap: a working flap hinged at its left end.
  k.rbox(.56,.08,.03,.012,{part:'strap',at:[0,.25,.077],color:navy,mat:'soft'});k.rbox(.11,.064,.012,.006,{part:'strap',at:[.21,.25,.096],color:'#e8ebef',mat:'matte'});
  k.torus(.03,.008,{part:'strap',at:[-.27,.25,.077],rot:[0,PI/2,0],color:'#c9ced6',mat:'gold'});k.proxy('strap',.09,[.08,.25,.08]);
  k.hinge('strap',{axis:[0,-1,0],max:1.5,detents:[.75],label:'ankle strap',hint:'Open my strap'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.032,.12,{part:p,at:[s*.27,.47,.01],rot:[0,0,s*.55],color:navy,mat:'soft'});k.sphere(.04,{part:p,at:[s*.31,.41,.02],color:shell,mat:'vinyl'});}
  boots(k,{xs:[-.09,.09],top:.17,z:.0,leg:WHITE,boot:navy,sock:navy});
  return {kind:{kind:'squish'},soft:{soft:.45},
   squeeze:['d_bendpop'],poke:{default:['d_ring','blink'],armL:['wave:armL'],armR:['wave:armR'],feet:['hop'],strap:['wiggle:strap']},tap:['stretch','sparkle'],head:{above:.66},
   voice:{squeeze:['d_thump'],poke:['knock:1.6'],tap:['d_ready','d_thump:1.3']}};
 },
 'glove-frog':(k)=>{
  const {body,accent}=k.c,belly='#d6f0b0',dark=k.shade(body,-.13),strap='#23407e';
  k.part('head',{at:[0,.42,.02]});k.part('gloveL',{at:[-.24,.34,.04]});k.part('gloveR',{at:[.24,.34,.04]});k.part('ball',{at:[.32,.09,.24]});
  // A plump sitting frog: body, a pale belly, darker spots on the back, webbed feet.
  k.sphere(1,{at:[0,.27,0],scale:[.297,.256,.256],color:body,mat:'vinyl',seg:44});
  k.sphere(1,{at:[0,.24,.13],scale:[.21,.19,.15],color:belly,mat:'soft',seg:36});
  for(const [x,y,s] of [[-.12,.36,.05],[.1,.4,.04],[.16,.24,.035],[-.17,.2,.04],[0,.22,.045]] as const){const z=-Math.sqrt(Math.max(0,.256**2*(1-(x/.297)**2-((y-.27)/.256)**2)));k.sphere(s,{at:[x,y,z+.012],scale:[1,1,.35],color:dark,mat:'vinyl',seg:14});}
  for(const s of [-1,1]){k.sphere(1,{at:[s*.17,.03,.15],scale:[.085,.03,.12],color:dark,mat:'vinyl',seg:24});
   for(const a of [-.45,0,.45])k.sphere(.022,{at:[s*.17+Math.sin(a)*.09,.025,.15+Math.cos(a)*.11],scale:[1,.7,1],color:k.shade(body,-.05),mat:'vinyl',seg:12});}
  // The bobbing head: a wide frog head with eye bumps on top, a long grin, nostrils, blush.
  const H={c:[0,.6,.02] as V3,r:[.276,.187,.228] as V3},bumps=[-1,1].map(s=>[s*.13,.76,.07] as V3);
  k.sphere(1,{part:'head',at:H.c,scale:H.r,color:body,mat:'vinyl',seg:44});
  for(const b of bumps)k.sphere(.1,{part:'head',at:b,color:body,mat:'vinyl'});
  const hs=ellSurf(...H.c,...H.r),surf:Surf=(x,y)=>Math.max(hs(x,y),...bumps.map(b=>b[2]+Math.sqrt(Math.max(0,.01-(x-b[0])**2-(y-b[1])**2))));
  face(k,'head',{x:0,y:.765,surf:(x,y)=>surf(x,y)+.002,gap:.13,size:.05,mouth:'none',blush:false});
  k.tube(Array.from({length:13},(_,i)=>{const x=-.15+i*.025,y=.6-.045*(1-(x/.15)**2);return [x,y,hs(x,y)+.004] as V3;}),.011,{part:'head',color:INK,mat:'ink'});
  for(const s of [-1,1]){k.sphere(.009,{part:'head',at:[s*.03,.68,hs(s*.03,.68)+.002],color:INK,mat:'ink'});k.sphere(.04,{part:'head',at:[s*.19,.6,hs(s*.19,.6)-.004],scale:[1.35,.8,.3],color:BLUSH,mat:'matte'});}
  // Goalkeeper gloves held up ready: green arms, wrist straps, latex palms, four rolled fingers and a thumb.
  for(const s of [-1,1] as const){const p=s<0?'gloveL':'gloveR',x=s*.38;
   k.tube([[s*.24,.32,.04],[s*.33,.38,.05],[x,.47,.06]],.04,{part:p,color:body,mat:'vinyl'});
   k.cyl(.075,.07,.07,{part:p,at:[x,.5,.06],color:strap,mat:'vinyl'});k.cyl(.077,.077,.02,{part:p,at:[x,.5,.06],color:WHITE,mat:'matte'});
   k.rbox(.17,.19,.1,.045,{part:p,at:[x,.62,.06],color:accent,mat:'vinyl'});k.rbox(.13,.13,.02,.03,{part:p,at:[x,.63,.112],color:k.shade(accent,.2),mat:'matte'});
   for(const [i,dx] of [-.057,-.019,.019,.057].entries())k.capsule(.026,.06+(i===1||i===2?.02:0),{part:p,at:[x+dx,.75+(i===1||i===2?.01:0),.06],color:accent,mat:'vinyl'});
   k.capsule(.026,.05,{part:p,at:[x-s*.1,.6,.07],rot:[0,0,s*.75],color:accent,mat:'vinyl'});}
  football(k,'ball',[.32,.09,.24],.09);
  return {kind:{kind:'bobble',head:'head'},soft:{soft:.5},
   squeeze:['clap:gloveL+gloveR'],poke:{default:['d_leap'],gloveL:['clap:gloveL+gloveR'],gloveR:['clap:gloveL+gloveR'],ball:['d_catch:ball']},tap:['d_catch:ball','clap:gloveL+gloveR'],head:'head',
   voice:{squeeze:['d_ribbit','d_clap'],poke:['d_ribbit:1.3','boing:.8'],tap:['whoosh:1.4','d_clap']}};
 },
 'armband-andi':(k)=>{
  const {body,accent}=k.c,R=.355;
  k.part('armL',{at:[-.35,.46,0]});k.part('armR',{at:[.35,.46,0]});k.part('patch',{at:[0,.31,.36]});k.part('tag',{at:[0,.52,-.385]});
  // A stretchy elastic band (a hollow drum), hemmed edges and ribbing round the back.
  // A short wide elastic band (outside yellow, a darker inside so it reads hollow), red-and-white border stripes top and bottom.
  k.lathe([[.3,.12],[.33,.12],[R,.15],[R,.65],[.33,.68],[.3,.68]],{color:body,mat:'soft',seg:64});
  k.lathe([[.3,.68],[.275,.665],[.272,.135],[.3,.12]],{color:k.shade(body,-.2),mat:'soft',seg:64});
  for(const [y,c] of [[.16,accent],[.64,accent],[.19,WHITE],[.61,WHITE]] as const)k.torus(R+.003,c===WHITE?.007:.016,{at:[0,y,0],rot:[PI/2,0,0],color:c,mat:'soft'});
  // The captain's patch: a red panel with a white C, stitched edge.
  k.rbox(.25,.2,.04,.05,{part:'patch',at:[0,.33,.345],color:accent,mat:'vinyl'});
  k.tube(Array.from({length:25},(_,i)=>{const a=i/24*PI*2;return [Math.cos(a)*.105,.33+Math.sin(a)*.078,.367] as V3;}),.004,{part:'patch',color:k.shade(accent,.3),mat:'matte'});
  k.torus(.055,.019,{part:'patch',at:[0,.33,.37],arc:PI*1.5,rot:[0,0,PI*.25],color:WHITE,mat:'vinyl'});
  face(k,'body',{x:0,y:.53,surf:(x,y)=>Math.sqrt(Math.max(0,R*R-x*x))+.002,gap:.1,size:.042,mouth:'open'});
  // The velcro tab at the back, with a C medallion on a ball chain (the charm).
  k.rbox(.2,.42,.03,.012,{at:[0,.4,-.362],color:k.shade(accent,-.05),mat:'matte'});
  k.torus(.025,.007,{at:[0,.7,-.38],rot:[0,PI/2,0],color:'#d9c27a',mat:'gold'});
  k.cyl(.065,.065,.016,{part:'tag',at:[0,.455,-.388],rot:[PI/2,0,0],color:'#ffd447',mat:'gold',seg:32});k.torus(.012,.004,{part:'tag',at:[0,.525,-.388],color:'#d9c27a',mat:'gold'});
  k.torus(.032,.011,{part:'tag',at:[0,.455,-.4],arc:PI*1.5,rot:[0,PI,PI*.25],color:accent,mat:'vinyl'});
  k.chain({mode:'dangle',from:'body',at:[0,.69,-.385],length:.17,links:5,tag:'tag',color:'#d9c27a'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.036,.13,{part:p,at:[s*.4,.55,0],rot:[0,0,-s*.55],color:body,mat:'soft'});k.sphere(.046,{part:p,at:[s*.44,.63,0],color:body,mat:'soft'});}
  for(const s of [-1,1]){k.sphere(.075,{at:[s*.14,.05,.06],scale:[1,.6,1.35],color:accent,mat:'vinyl'});k.rbox(.13,.02,.19,.01,{at:[s*.14,.012,.065],color:WHITE,mat:'matte'});}
  return {kind:{kind:'squish'},soft:{soft:.6},
   squeeze:['stretch'],poke:{default:['wave:armL+armR','hop'],patch:['glow','pop:patch'],armL:['wave:armL'],armR:['wave:armR']},tap:['glow','pop:patch','sparkle'],head:{above:.47},
   voice:{squeeze:['stretchy'],poke:['d_hup','d_hup:1.25'],tap:['chime:.9','d_hup:1.3']}};
 },
 'kit-shirt-kip':(k)=>{
  const {body,accent}=k.c,bibC='#d8f23a',navy='#23407e';
  k.part('bib',{at:[0,.5,0]});k.part('crest',{at:[.12,.48,.108]});k.part('num',{at:[0,.5,-.106]});k.part('tag',{at:[.44,.45,0]});
  // The shirt: a team jersey (sleeves, crew collar, white cuffs), shorts, red socks and boots.
  const shirt:Pt[]=[[-.25,.3],[.25,.3],[.25,.6],[.41,.6],[.47,.72],[.3,.84],[.11,.87],[0,.82],[-.11,.87],[-.3,.84],[-.47,.72],[-.41,.6],[-.25,.6]];
  k.extrude(shirt,.2,{color:body,mat:'soft',bevel:.04});
  k.torus(.105,.022,{at:[0,.845,0],rot:[PI/2-.12,0,0],color:accent,mat:'soft'});
  for(const s of [-1,1])k.rbox(.07,.14,.22,.025,{at:[s*.445,.66,0],rot:[0,0,s*-.33],color:accent,mat:'soft'});
  k.rbox(.5,.07,.22,.025,{at:[0,.27,0],color:accent,mat:'soft'});
  for(const s of [-1,1])k.rbox(.23,.13,.21,.04,{at:[s*.12,.2,0],color:accent,mat:'soft'});
  boots(k,{xs:[-.1,.1],top:.16,z:.0,leg:body,boot:INK,sock:accent});
  face(k,'body',{x:0,y:.71,surf:()=>.102,gap:.07,size:.038,mouth:'open'});
  // The crest (under the bib) and the big back number 10 (seven-segment felt).
  k.extrude([[-.05,.05],[.05,.05],[.05,-.01],[0,-.06],[-.05,-.01]],.014,{part:'crest',at:[.12,.48,.107],color:navy,mat:'vinyl',bevel:.004});
  k.extrude(starPts(.024,.01),.006,{part:'crest',at:[.12,.48,.116],color:'#ffd447',mat:'gold',bevel:.002});
  const digit=(x:number,y:number,h:number,one:boolean)=>{const w=h*.55,t=h*.17,z=-.106;
   if(one){k.box(t,h,.012,{part:'num',at:[x,y,z],color:accent,mat:'matte'});return;}
   for(const sx of [-1,1])k.box(t,h,.012,{part:'num',at:[x+sx*w/2,y,z],color:accent,mat:'matte'});for(const sy of [-1,1])k.box(w+t,t,.012,{part:'num',at:[x,y+sy*(h-t)/2,z],color:accent,mat:'matte'});};
  digit(.1,.5,.24,true);digit(-.05,.5,.24,false);// read from behind: 1 on its right, 0 on its left
  // The training bib over the top: front and back panels, shoulder straps over the bevel, side ties, mesh dots.
  const bib:Pt[]=[[-.235,.36],[.235,.36],[.24,.6],[.24,.82],[.18,.83],[.18,.66],[.12,.6],[-.12,.6],[-.18,.66],[-.18,.83],[-.24,.82],[-.24,.6]];
  for(const z of [.127,-.127])k.extrude(bib,.02,{part:'bib',at:[0,0,z],color:bibC,mat:'soft',bevel:.006});
  for(const s of [-1,1]){k.tube([[s*.21,.83,.13],[s*.21,.9,.07],[s*.21,.915,0],[s*.21,.9,-.07],[s*.21,.83,-.13]],.02,{part:'bib',color:bibC,mat:'soft'});
   k.box(.03,.05,.27,{part:'bib',at:[s*.305,.46,0],color:k.shade(bibC,-.12),mat:'soft'});}
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)k.sphere(.012,{part:'bib',at:[-.15+c*.1,.42+r*.06,.138],scale:[1,1,.4],color:k.shade(bibC,-.18),mat:'matte',seg:10});
  // The Kit Shop swing tag dangling from his right cuff.
  k.rbox(.09,.12,.012,.012,{part:'tag',at:[.44,.38,0],color:WHITE,mat:'matte'});k.box(.09,.025,.014,{part:'tag',at:[.44,.35,0],color:body,mat:'matte'});
  k.torus(.011,.004,{part:'tag',at:[.44,.43,0],color:'#c9ced6',mat:'gold'});
  k.chain({mode:'dangle',from:'body',at:[.44,.57,0],length:.12,links:4,tag:'tag',color:'#c9ced6'});
  return {kind:{kind:'puzzle',pieces:[{part:'bib',name:'the training bib'},{part:'crest',name:'the crest',after:['bib']},{part:'num',name:'the number',after:['bib']}]},
   squeeze:['jiggle'],poke:{default:['jiggle','blink'],num:['pop:num'],crest:['pop:crest'],bib:['wiggle:bib']},tap:['spin','sparkle'],head:{above:.62},
   voice:{squeeze:['flapflap:1.4','cheer:.9'],poke:['flapflap','pop'],tap:['flapflap:1.2','cheer']}};
 },
 'corner-flag-cora':(k)=>{
  const {body,accent}=k.c,px=-.2,pz=-.16;
  secretCapsule(k,{top:body,topMat:'glitter',bot:accent,botMat:'glitter',rim:'#ffd447',mark:WHITE,markMat:'pearl'});
  k.part('pole',{at:[px,.07,pz],parent:'inner'});k.part('flag',{at:[px+.02,.8,pz],parent:'pole'});k.part('ball',{at:[px+.17,.11,pz+.17],parent:'inner'});
  // Inside: a turf corner (mown stripes, the touchline, the goal line and the quarter arc).
  k.cyl(.4,.42,.07,{part:'inner',at:[0,.035,0],color:GRASS,mat:'soft',seg:48});
  for(let i=-3;i<=3;i+=2)k.box(.1,.004,Math.sqrt(Math.max(0,.39**2-(i*.05)**2))*2,{part:'inner',at:[i*.05,.071,0],color:k.shade(GRASS,.06),mat:'soft'});
  k.box(.55,.006,.022,{part:'inner',at:[px+.275,.073,pz],color:WHITE,mat:'matte'});k.box(.022,.006,.45,{part:'inner',at:[px,.073,pz+.225],color:WHITE,mat:'matte'});
  k.torus(.2,.011,{part:'inner',at:[px,.073,pz],rot:[PI/2,0,0],arc:PI/2,color:WHITE,mat:'matte'});
  // The springy pole: a gold coil base, red-and-yellow bands, a gold knob.
  for(let i=0;i<4;i++)k.torus(.034,.009,{part:'pole',at:[px,.078+i*.016,pz],rot:[PI/2,0,0],color:'#e8b92e',mat:'gold'});
  k.cyl(.02,.022,.72,{part:'pole',at:[px,.46,pz],color:accent,mat:'vinyl',seg:16});
  for(const y of [.2,.36,.52,.68])k.cyl(.024,.024,.08,{part:'pole',at:[px,y,pz],color:body,mat:'vinyl',seg:16});
  k.sphere(.036,{part:'pole',at:[px,.84,pz],color:'#ffd447',mat:'gold'});
  // The flag: three by two chequered squares rippling in the wind, Cora's face on it.
  const W=.44,N=6,zAt=(x:number)=>pz+.03*Math.sin((x-px)*10.5),fy0=.5,fy1=.8;
  for(let i=0;i<N;i++){const x0=px+.025+i*W/N,x1=x0+W/N,xm=(x0+x1)/2,dz=zAt(x1)-zAt(x0),rot:V3=[0,-Math.atan2(dz,x1-x0),0];
   for(let r=0;r<2;r++){const red=((i>>1)+r)%2===0;k.box(Math.hypot(W/N,dz)+.002,(fy1-fy0)/2,.016,{part:'flag',at:[xm,fy0+(r+.5)*(fy1-fy0)/2,zAt(xm)],rot,color:red?body:accent,mat:'vinyl'});}}
  face(k,'flag',{x:px+.245,y:.665,surf:x=>zAt(x)+.009,gap:.075,size:.036,mouth:'open'});
  football(k,'ball',[px+.17,.11,pz+.17],.04);
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},springs:[{part:'flag',k:18,c:1.1,amp:1.4},{part:'pole',k:40,c:2,amp:.8}],
   squeeze:['d_spring:pole'],poke:{default:['d_flutter:flag'],pole:['d_spring:pole'],ball:['juggle:ball']},tap:['d_flagwave:pole','d_flutter:flag','sparkle'],head:{above:.5},
   voice:{squeeze:['d_twang'],poke:['d_flutter'],tap:['d_flutter','d_twang:1.3']}};
 },
};
export default set;
