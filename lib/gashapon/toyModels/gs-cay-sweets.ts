/**
 * Sweet Shop Treats (gs-cay-sweets), rebuilt for round 3B (Nov 9 2026; docs/gashapon-design.md "Round 3B"): HD kit (physical
 * finishes, smooth profiles) and each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Taiyaki Tai     take-apart: the face half of the fish cake lifts off, a candied chestnut sits in the bean filling, the filling
 *                   lifts out of the back half (order enforced both ways; bonus: squishy)
 *   Mochi Momo      a slow-rising daifuku on a sakura leaf, starch-dusted, keeper gloves (bonus: the sakura flower bobbles)
 *   Dango Trio      take-apart: pink, white and green dumplings slide off the skewer and go back in order (bonus: flick to spin)
 *   Ramune Rin      a jelly soda bottle with a codd-neck marble chamber (bonus: push the cap, the marble drops)
 *   Dorayaki Doug   working parts: the top pancake hinges open on the bean filling; two faces, a back two (bonus: squishy)
 *   Kakigori Kiki   the rare: a clear-and-frost secret capsule; inside, rainbow-syrup shaved ice in a footed glass with a
 *                   cherry, a wafer spoon and an ice flag (the extra part; bonus: jelly wobble)
 * Model space: stands on y = 0, about 1 tall, front +z. Generic sweets only, no brands. Rows in lib/gashapon/toys.ts keep the words.
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

const set:ToyModelSet={
 'taiyaki-tai':(k)=>{
  const {body}=k.c,crisp=k.shade(body,-.14),line=k.shade(body,-.2),light=k.shade(body,.08),anko='#5e2a32',kuri='#f0b43a';
  const sh=new T.Shape();sh.moveTo(-.45,.43);sh.bezierCurveTo(-.45,.62,-.3,.71,-.1,.71);sh.bezierCurveTo(.1,.71,.24,.6,.33,.5);sh.lineTo(.36,.47);sh.lineTo(.36,.37);
  sh.bezierCurveTo(.24,.25,.08,.17,-.1,.17);sh.bezierCurveTo(-.3,.17,-.45,.25,-.45,.43);
  const fish=outline(sh,36),inner=scalePts(fish,.93,-.05,.44),flat=scalePts(fish,.8,-.05,.44);
  k.part('shellF',{at:[0,.44,.1]});k.part('anko',{at:[-.05,.44,.02]});k.part('kuri',{at:[-.06,.45,.03]});
  k.part('tail',{at:[.35,.42,.02]});k.part('fin',{at:[.02,.7,.02]});k.part('feet',{at:[0,.06,0]});
  // The two halves of the cake (each a puffy bevelled slab) with the batter skirt between them and the bean filling inside.
  k.extrude(fish,.12,{at:[0,0,-.06],color:body,mat:'soft',bevel:.05});
  k.extrude(fish,.12,{part:'shellF',at:[0,0,.1],color:body,mat:'soft',bevel:.05});
  k.extrude(scalePts(fish,1.035,-.05,.44),.018,{at:[0,0,.004],color:light,mat:'soft',bevel:.006});
  k.tube([...scalePts(fish,.88,-.05,.44),scalePts(fish,.88,-.05,.44)[0]].map(([x,y])=>[x,y,.016] as V3),.01,{color:crisp,mat:'soft'});// the filling's socket
  k.extrude(inner,.04,{part:'anko',at:[0,0,.02],color:anko,mat:'vinyl',bevel:.014});
  const rb=rng(21);for(let i=0,n=0;i<80&&n<16;i++){const x=-.36+rb()*.62,y=.26+rb()*.36;if(!inPoly(scalePts(inner,.85,-.05,.44),x,y)||Math.hypot(x+.06,y-.45)<.12)continue;
   k.sphere(.022,{part:'anko',at:[x,y,.04],rot:[0,0,rb()*3],scale:[1.3,.85,.45],color:k.shade(anko,.07),mat:'vinyl',seg:10});n++;}
  // The candied chestnut, sunk in a dimple in the filling.
  k.cyl(.07,.07,.006,{part:'anko',at:[-.06,.45,.041],rot:[PI/2,0,0],color:k.shade(anko,-.12),mat:'matte',seg:24});
  k.torus(.078,.011,{part:'anko',at:[-.06,.45,.04],color:k.shade(anko,.05),mat:'vinyl'});
  k.sphere(.072,{part:'kuri',at:[-.06,.44,.035],scale:[1.12,1,.85],color:kuri,mat:'vinyl'});
  k.cone(.026,.045,{part:'kuri',at:[-.06,.53,.035],color:k.shade(kuri,-.05),mat:'vinyl'});
  k.sphere(.05,{part:'kuri',at:[-.06,.395,.06],scale:[1.3,.55,.6],color:k.shade(kuri,.12),mat:'matte'});
  // The mould's scales, gill and fin lines, on both faces (front z .16, back z −.12).
  for(const [z,part] of [[.162,'shellF'],[-.122,'body']] as const){
   for(const [x,y] of [[-.02,.36],[-.02,.48],[.07,.42],[.07,.54],[.07,.3],[.16,.36],[.16,.48],[.25,.42]] as const){
    if(!inPoly(flat,x-.04,y-.05)||!inPoly(flat,x+.04,y+.05)||!inPoly(flat,x,y))continue;
    k.torus(.042,.008,{part,arc:PI,rot:[0,0,-PI/2],at:[x,y,z],color:line,mat:'matte'});}
   k.torus(.11,.009,{part,arc:PI*.75,rot:[0,0,-PI*.375],at:[-.17,.44,z],color:line,mat:'matte'});}
  face(k,'shellF',{x:-.29,y:.5,surf:()=>.16,gap:.065,size:.036,mouth:'smile'});
  k.torus(.032,.01,{arc:PI,at:[-.29,.49,-.122],color:INK,mat:'ink'});// the back: a sleepy closed eye
  // The tail fan and the dorsal fin, ribbed both sides.
  const ts=new T.Shape();ts.moveTo(.3,.5);ts.quadraticCurveTo(.42,.6,.55,.69);ts.quadraticCurveTo(.46,.44,.55,.17);ts.quadraticCurveTo(.42,.26,.3,.36);
  k.extrude(outline(ts,30),.14,{part:'tail',at:[0,0,.02],color:crisp,mat:'soft',bevel:.035});
  const fs=new T.Shape();fs.moveTo(-.14,.66);fs.quadraticCurveTo(-.04,.88,.17,.8);fs.quadraticCurveTo(.22,.7,.21,.6);
  k.extrude(outline(fs,26),.1,{part:'fin',at:[0,0,.02],color:crisp,mat:'soft',bevel:.03});
  for(const z of [.092,-.052]){for(const a of [-.5,0,.5])k.tube([[.37,.43,z],[.44+Math.cos(a)*.02,.43+Math.sin(a)*.12,z],[.5,.43+Math.sin(a)*.22,z]],.007,{part:'tail',color:line,mat:'matte'});}
  for(const z of [.072,-.032])for(const x of [-.05,.04,.12])k.tube([[x,.7,z],[x+.02,.76,z],[x+.04,.8,z]],.006,{part:'fin',color:line,mat:'matte'});
  sneakers(k,{xs:[-.17,.09],top:.21,z:.02,leg:crisp});
  return {kind:{kind:'puzzle',pieces:[{part:'shellF',name:'the front half'},{part:'kuri',name:'the chestnut',after:['shellF']},{part:'anko',name:'the bean filling',after:['kuri']}]},
   soft:{soft:.4},
   squeeze:['swish:tail','hop'],poke:{default:['bubbles','blink'],tail:['swish:tail'],fin:['wiggle:fin'],feet:['hop']},tap:['swim','swish:tail'],head:{above:.6},
   voice:{squeeze:['bubble','whoosh:1.8'],poke:['bubble:1.4'],tap:['bubble:.8','blip','bubble:1.2']}};
 },
 'mochi-momo':(k)=>{
  const {body,accent}=k.c,petal='#ffb6cc',leaf='#6fa64a';
  // A daifuku that sags a little: a quarter-round foot under an elliptical dome (exact, so the dust sits on it).
  const top=(y:number)=>.49*Math.sqrt(Math.max(0,1-((y-.135)/.47)**2));
  const pts:Pt[]=[[0,.022],[.38,.022],...prof(10,t=>{const a=t*PI/2;return [.38+.11*Math.sin(a),.135-.113*Math.cos(a)] as Pt;}).slice(1),...prof(26,t=>{const y=.135+.47*t;return [top(y),y] as Pt;}).slice(1)];
  pts[pts.length-1]=[0,.605];
  k.part('flower',{at:[0,.605,0]});k.part('armL',{at:[-.47,.25,.02]});k.part('armR',{at:[.47,.25,.02]});k.part('leaf',{at:[0,.01,0]});
  k.lathe(pts,{color:body,mat:'soft',seg:64});
  // Potato-starch dust (not over the face).
  const r=rng(7);for(let i=0,n=0;i<200&&n<56;i++){const a=r()*PI*2,y=.16+r()*.43;if(Math.cos(a)>.45&&y<.48)continue;const rr=top(y)-.002;
   k.sphere(.009+r()*.006,{at:[Math.sin(a)*rr,y,Math.cos(a)*rr],color:'#ffffff',mat:'matte',seg:6});n++;}
  // The sakura leaf it sits on, peeking out behind, with its veins.
  const ls=new T.Shape();ls.moveTo(0,-.6);ls.bezierCurveTo(.38,-.4,.42,.2,0,.4);ls.bezierCurveTo(-.42,.2,-.38,-.4,0,-.6);
  k.extrude(outline(ls,40),.018,{part:'leaf',at:[.06,.009,-.05],rot:[-PI/2,0,-.5],color:leaf,mat:'matte',bevel:.006});
  const vein=(a:V3,b:V3)=>k.tube([a,[(a[0]+b[0])/2,a[1]+.004,(a[2]+b[2])/2],b],.006,{part:'leaf',color:k.shade(leaf,.12),mat:'matte'});
  const L=(u:number,v:number):V3=>{const c=Math.cos(-.5),s=Math.sin(-.5);return [.06+u*c-v*s,.02,-.05-(u*s+v*c)];};
  vein(L(0,-.58),L(0,.38));for(const v of [-.35,-.12,.1])for(const sd of [-1,1])vein(L(0,v),L(sd*.24,v+.14));
  // The sakura flower on top (it bobbles): five notched petals, a centre and stamens.
  const ps=new T.Shape();ps.moveTo(0,0);ps.bezierCurveTo(-.06,.03,-.065,.1,-.028,.12);ps.lineTo(0,.1);ps.lineTo(.028,.12);ps.bezierCurveTo(.065,.1,.06,.03,0,0);
  const pp=outline(ps,20);
  for(let i=0;i<5;i++){const a=i*PI*2/5;k.extrude(pp,.014,{part:'flower',at:[0,.612,0],scale:1.45,rot:yawPitch(a,-PI/2+.32),color:petal,mat:'vinyl',bevel:.004});
   k.extrude(scalePts(pp,.45,0,0),.016,{part:'flower',at:[0,.614,0],scale:1.45,rot:yawPitch(a,-PI/2+.32),color:k.shade(petal,.08),mat:'vinyl',bevel:.003});}
  k.sphere(.04,{part:'flower',at:[0,.632,0],scale:[1,.6,1],color:'#ffd84a',mat:'vinyl'});
  for(let i=0;i<6;i++){const a=i*PI/3+.3;k.tube([[0,.63,0],[Math.sin(a)*.045,.665,Math.cos(a)*.045],[Math.sin(a)*.065,.675,Math.cos(a)*.065]],.006,{part:'flower',color:'#ff8fb0',mat:'matte'});
   k.sphere(.013,{part:'flower',at:[Math.sin(a)*.065,.678,Math.cos(a)*.065],color:'#ffd84a',mat:'vinyl',seg:8});}
  face(k,'body',{x:0,y:.33,surf:(x,y)=>Math.sqrt(Math.max(0,top(y)**2-x*x)),gap:.15,size:.058,mouth:'cat',blush:accent});
  // Keeper gloves: a padded mitt, a thumb, a white cuff and a strap.
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR',x=s*.52;
   k.sphere(.1,{part:p,at:[x,.25,.06],scale:[.82,1,.75],color:accent,mat:'vinyl'});
   k.sphere(.042,{part:p,at:[x-s*.05,.29,.13],scale:[1,1.2,1],color:accent,mat:'vinyl'});
   k.torus(.066,.022,{part:p,at:[x+s*.005,.155,.05],rot:[PI/2,0,0],color:WHITE,mat:'vinyl'});
   k.rbox(.13,.035,.02,.012,{part:p,at:[x,.2,.125],rot:[0,s*.3,0],color:k.shade(accent,-.12),mat:'matte'});
   for(const dy of [.27,.31])k.capsule(.009,.07,{part:p,at:[x,dy,.135],rot:[0,0,PI/2],color:k.shade(accent,-.1),mat:'matte'});}
  return {kind:{kind:'squish'},soft:{soft:.9,slow:true},springs:[{part:'flower',k:45,c:2,amp:1.5}],
   squeeze:['stretchsnap'],poke:{default:['boingy'],armL:['wave:armL'],armR:['wave:armR'],flower:['swish:flower']},tap:['bounce','blink'],head:{above:.36},
   voice:{squeeze:['stretchy','boing:1.5'],poke:['boing:1.2'],tap:['boing:1.1','boing:1.4','boing:1.8']}};
 },
 'dango-trio':(k)=>{
  const wood='#d9b77a',plate='#b5562f',R=.168,RY=.157,balls=[['b1',.29,k.c.accent],['b2',.615,'#fff8ef'],['b3',.94,k.c.body]] as const;
  // A lacquer plate, a bamboo leaf and the little wooden stand the skewer stands in.
  k.rbox(.66,.05,.38,.025,{at:[0,.025,0],color:plate,mat:'vinyl'});k.rbox(.6,.006,.32,.02,{at:[0,.053,0],color:k.shade(plate,.08),mat:'vinyl'});
  const ls=new T.Shape();ls.moveTo(-.4,0);ls.quadraticCurveTo(0,.12,.38,0);ls.quadraticCurveTo(0,-.1,-.4,0);
  k.extrude(outline(ls,28),.012,{at:[.02,.062,-.06],rot:[-PI/2,0,.35],color:'#5f9e48',mat:'matte',bevel:.004});
  k.tube([[-.35,.07,.07],[0,.071,-.06],[.34,.07,-.18]],.005,{color:'#86c06a',mat:'matte'});
  k.cyl(.06,.07,.06,{at:[0,.085,0],color:wood,mat:'matte'});k.torus(.06,.008,{at:[0,.115,0],rot:[PI/2,0,0],color:k.shade(wood,-.15),mat:'matte'});
  k.cyl(.017,.017,1.08,{at:[0,.66,0],color:wood,mat:'matte',seg:12});k.cone(.017,.05,{at:[0,1.225,0],color:wood,mat:'matte',seg:12});
  k.torus(.024,.009,{at:[0,.126,0],rot:[PI/2,0,0],color:k.shade(wood,-.22),mat:'matte'});// the stop the bottom dumpling rests on
  for(const [p,y,c] of balls){k.part(p,{at:[0,y,0]});k.sphere(R,{part:p,at:[0,y,0],scale:[1,RY/R,1],color:c,mat:'soft'});
   for(const dy of [-1,1])k.torus(.024,.008,{part:p,at:[0,y+dy*(RY-.004),0],rot:[PI/2,0,0],color:k.shade(c,-.12),mat:'soft'});}
  const surf=(cy:number)=>ellSurf(0,cy,0,R,RY,R);
  face(k,'b1',{x:0,y:.31,surf:surf(.29),gap:.07,size:.035,mouth:'cat',prefix:'b1',blush:'#ffffff'});
  face(k,'b2',{x:0,y:.635,surf:surf(.615),gap:.07,size:.035,mouth:'smile',prefix:'b2'});
  face(k,'b3',{x:0,y:.96,surf:surf(.94),gap:.07,size:.036,eyes:'happy',mouth:'open',prefix:'b3',blush:'#ff7f9e'});
  // A sakura petal on the plate, for the back.
  const ps=new T.Shape();ps.moveTo(0,0);ps.bezierCurveTo(-.05,.03,-.055,.08,-.024,.1);ps.lineTo(0,.085);ps.lineTo(.024,.1);ps.bezierCurveTo(.055,.08,.05,.03,0,0);
  k.extrude(outline(ps,16),.01,{at:[-.22,.062,-.12],rot:[-PI/2,0,.8],color:'#ffc2d3',mat:'vinyl',bevel:.003});
  return {kind:{kind:'puzzle',pieces:[{part:'b3',name:'the pink dango'},{part:'b2',name:'the white dango',after:['b3']},{part:'b1',name:'the green dango',after:['b2']}]},
   flick:true,
   squeeze:['beat1:b1','beat2:b2','beat3:b3'],poke:{default:['jiggle'],b1:['wiggle:b1'],b2:['wiggle:b2','blink:b2eyes'],b3:['wiggle:b3','blink:b3eyes']},
   tap:['twirl','beat1:b3','beat2:b2','beat3:b1'],head:'b3',
   voice:{squeeze:['squish:1.3','squish:1.1','squish:.9'],poke:['giggle:1.2'],tap:['boop','boop:1.26','boop:1.5']}};
 },
 'ramune-rin':(k)=>{
  const {body,accent}=k.c,glass=k.shade(body,.04),wave='#2f8fd6',cap='#ff8fb8';
  // The bottle: a jelly-blue body (soda inside) with a clear codd neck where the marble lives.
  const bodyR=(y:number)=>y<.06?.2+.045*Math.sin(y/.06*PI/2):y<.42?.245:y<.6?.245-(.245-.11)*(1-Math.cos((y-.42)/.18*PI))/2:.11;
  k.part('marble',{at:[0,.72,0]});k.part('cap',{at:[0,.9,0]});k.part('armL',{at:[-.26,.36,0]});k.part('armR',{at:[.26,.36,0]});
  k.lathe([[0,0],...prof(30,t=>{const y=.6*t;return [bodyR(y),y] as Pt;}).slice(1),[0,.6]],{color:body,mat:'jelly',seg:56});
  const neck=(y:number)=>y<.62?.11-.02*((y-.58)/.04):y<.78?.09+.035*Math.sin((y-.62)/.16*PI):y<.82?.085:.088;
  k.lathe([[0,.58],...prof(24,t=>{const y=.58+.28*t;return [neck(y),y] as Pt;}),[0,.86]],{color:'#e8fbff',mat:'clear',seg:48});
  k.torus(.09,.012,{at:[0,.86,0],rot:[PI/2,0,0],color:glass,mat:'jelly'});
  k.sphere(.068,{part:'marble',at:[0,.72,0],color:'#5fd0e8',mat:'jelly'});k.sphere(.045,{part:'marble',at:[0,.72,0],color:'#2fa8c8',mat:'ink'});k.sphere(.02,{part:'marble',at:[.025,.75,.05],color:WHITE,mat:'ink'});
  const r=rng(5);for(let i=0;i<14;i++){const a=r()*PI*2,d=Math.sqrt(r())*.17,y=.08+r()*.46;k.sphere(.01+r()*.012,{at:[Math.sin(a)*d,y,Math.cos(a)*d],color:WHITE,mat:'ink',seg:8});}
  // The label band: a wave, fizz dots, her face on the front, a marble mark on the back.
  k.lathe([[.251,.16],[.251,.38]],{color:accent,mat:'matte',seg:56});
  const wv:V3[]=[];for(let i=0;i<=48;i++){const a=i/48*PI*2;wv.push([Math.sin(a)*.254,.2+.018*Math.sin(a*6),Math.cos(a)*.254]);}k.tube(wv,.009,{color:wave,mat:'matte'});
  for(const y of [.165,.375])k.torus(.252,.006,{at:[0,y,0],rot:[PI/2,0,0],color:wave,mat:'matte'});
  for(const [a,y,rr] of [[.95,.31,.016],[1.2,.35,.011],[-1,.33,.014],[-.75,.29,.01],[2.6,.3,.02],[3.4,.33,.014]] as const)k.cyl(rr,rr,.004,{at:[Math.sin(a)*.252,y,Math.cos(a)*.252],rot:yawPitch(a,PI/2),color:'#9fe0ff',mat:'matte',seg:14});
  k.cyl(.04,.04,.004,{at:[0,.29,-.252],rot:[PI/2,0,0],color:wave,mat:'matte',seg:20});k.cyl(.025,.025,.006,{at:[0,.29,-.254],rot:[PI/2,0,0],color:'#e8fbff',mat:'ink',seg:20});
  face(k,'body',{x:0,y:.3,surf:(x,y)=>cylSurf(.251)(x,y)+.001,gap:.085,size:.036,mouth:'open'});
  // The cap and the pusher on top (push it: the marble drops into the soda).
  k.cyl(.1,.105,.07,{part:'cap',at:[0,.895,0],color:cap,mat:'vinyl',seg:40});k.torus(.1,.012,{part:'cap',at:[0,.93,0],rot:[PI/2,0,0],color:k.shade(cap,.08),mat:'vinyl'});
  for(let i=0;i<16;i++){const a=i*PI/8;k.box(.008,.05,.01,{part:'cap',at:[Math.sin(a)*.105,.892,Math.cos(a)*.105],rot:[0,a,0],color:k.shade(cap,-.1),mat:'vinyl'});}
  k.cyl(.045,.05,.05,{part:'cap',at:[0,.95,0],color:k.shade(cap,.1),mat:'vinyl',seg:28});k.sphere(.045,{part:'cap',at:[0,.975,0],scale:[1,.4,1],color:k.shade(cap,.14),mat:'vinyl'});
  for(const s of [-1,1] as const)k.capsule(.04,.1,{part:s<0?'armL':'armR',at:[s*.29,.3,.03],rot:[0,0,s*.4],color:glass,mat:'jelly'});
  k.slider('cap',{axis:[0,-1,0],max:.05,label:'cap',hint:'Push my cap',fires:{part:'marble',at:.7,lift:[0,-.09,0],hold:1.2}});
  return {kind:{kind:'jelly'},soft:{soft:.6,jelly:true},
   squeeze:['bubbles','jiggle'],poke:{default:['rattle:marble','wiggle:marble'],cap:['peek:cap'],armL:['wave:armL'],armR:['wave:armR']},tap:['peek:cap','bubbles','pop:marble'],head:{above:.62},
   voice:{squeeze:['fizz','bubble:1.4'],poke:['clink','clink:1.2'],tap:['pop:1.2','fizz']}};
 },
 'dorayaki-doug':(k)=>{
  // Lifted Y on stubby legs, so the flat sandwich still stands about half a toy tall.
  const {body,accent}=k.c,pale='#f2cf8c',mid=k.shade(body,.06),brown=k.shade(body,-.06),Y=.1;
  k.part('top',{at:[0,.33+Y,-.4]});k.part('filling',{at:[0,.27+Y,0]});k.part('armL',{at:[-.44,.15+Y,0]});k.part('armR',{at:[.44,.15+Y,0]});k.part('feet',{at:[0,.06,0]});
  // The bottom pancake: browned underneath, a pale griddle rim.
  const rimB=(t:number):Pt=>{const a=-PI/2+t*PI;return [.4+.04*Math.cos(a),.15+Y+.08*Math.sin(a)];};
  k.lathe([[0,.07+Y],[.36,.07+Y],rimB(0),...prof(4,t=>rimB(t*.15)).slice(1)],{color:brown,mat:'soft',seg:64});
  k.lathe([...prof(16,t=>rimB(.15+t*.85)),[.3,.232+Y],[0,.232+Y]],{color:pale,mat:'soft',seg:64});
  // The bean filling bulging out between them, beans showing at the edge.
  k.blob(.41,{part:'filling',at:[0,.272+Y,0],scale:[1,.13,1],amp:.012,freq:7,seed:4,color:accent,dark:k.shade(accent,-.1),light:k.shade(accent,.1),mat:'vinyl'});
  const rb=rng(3);for(let i=0;i<22;i++){const a=i/22*PI*2+rb()*.2;k.sphere(.024,{part:'filling',at:[Math.sin(a)*.405,.27+Y+(rb()-.5)*.02,Math.cos(a)*.405],rot:[0,a,0],scale:[1.25,.8,.7],color:k.shade(accent,.06),mat:'vinyl',seg:10});}
  // The top pancake: pale rim, a golden ring, a browned dome with a toasted football mark and griddle pores.
  const rimT=(t:number):Pt=>{const a=-PI/2+t*PI;return [.4+.042*Math.cos(a),.38+Y+.065*Math.sin(a)];};
  k.lathe([[0,.318+Y],[.36,.318+Y],...prof(16,t=>rimT(t*.9))],{part:'top',color:pale,mat:'soft',seg:64});
  const dome=(r:number)=>.49+Y-.045*(r/.385)**2;
  k.lathe([rimT(.9),rimT(1),[.385,dome(.385)]],{part:'top',color:mid,mat:'soft',seg:64});
  k.lathe([...prof(12,t=>{const rr=.385*(1-t);return [rr,dome(rr)] as Pt;})],{part:'top',color:brown,mat:'soft',seg:64});
  const pent:Pt[]=[0,1,2,3,4].map(i=>{const a=PI/2+i*PI*2/5;return [Math.cos(a)*.05,Math.sin(a)*.05] as Pt;});
  k.extrude(pent,.008,{part:'top',at:[0,.492+Y,0],rot:[-PI/2,0,0],color:k.shade(body,-.24),mat:'matte',bevel:.002});
  for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5,c=Math.cos(a),s=Math.sin(a);const p=(d:number):V3=>[c*d,dome(d)+.002,-s*d];k.tube([p(.06),p(.1),p(.13)],.007,{part:'top',color:k.shade(body,-.24),mat:'matte'});}
  const rp=rng(9);for(let i=0;i<34;i++){const a=rp()*PI*2,d=.15+rp()*.22;k.sphere(.009,{part:'top',at:[Math.sin(a)*d,dome(d)-.002,Math.cos(a)*d],scale:[1,.5,1],color:k.shade(body,-.18),mat:'matte',seg:6});}
  // Two faces: the top pancake on its rim, the bottom one cheering below.
  const rimSurfT=(x:number,y:number)=>{const u=Math.max(-1,Math.min(1,(y-.38-Y)/.065)),rr=.4+.042*Math.sqrt(1-u*u);return Math.sqrt(Math.max(0,rr*rr-x*x));};
  const rimSurfB=(x:number,y:number)=>{const u=Math.max(-1,Math.min(1,(y-.15-Y)/.08)),rr=.4+.04*Math.sqrt(1-u*u);return Math.sqrt(Math.max(0,rr*rr-x*x));};
  face(k,'top',{x:0,y:.395+Y,surf:rimSurfT,gap:.12,size:.034,mouth:'smile',prefix:'t',brows:k.shade(body,-.3)});
  face(k,'body',{x:0,y:.165+Y,surf:rimSurfB,gap:.12,size:.032,eyes:'happy',mouth:'open'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.04,.1,{part:p,at:[s*.48,.15+Y,.05],rot:[0,0,s*.75],color:pale,mat:'soft'});k.sphere(.045,{part:p,at:[s*.53,.1+Y,.07],color:pale,mat:'soft'});}
  sneakers(k,{xs:[-.15,.15],top:.19,z:.08,leg:brown,shoe:'#fff6e4',sole:accent});
  k.hinge('top',{axis:[-1,0,0],max:1.25,detents:[.6],label:'top pancake',hint:'Open me'});
  return {kind:{kind:'mechanism'},soft:{soft:.4},
   squeeze:['pop:filling','jiggle'],poke:{default:['clap:armL+armR','jiggle'],filling:['pop:filling'],armL:['wave:armL'],armR:['wave:armR'],feet:['hop']},tap:['chomp:top'],head:'top',
   voice:{squeeze:['squish:.7','mmhm:.9'],poke:['pat','giggle:.6'],tap:['pat:1.3','pat:1.3','giggle:.7']}};
 },
 'kakigori-kiki':(k)=>{
  const {body,accent}=k.c,ice='#f4fbff',glassC='#bfe9ff',frost='#9fe3ff';
  k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
  k.part('flag',{at:[-.2,.78,-.14],parent:'inner'});k.part('spoon',{at:[.16,.78,.05],parent:'inner'});
  // The secret capsule: a clear dome with frost inside and a snowflake, on a frosted-ice cup.
  const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cup:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
  const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
  k.smoothLathe(dome,{part:'capTop',color:body,mat:'clear',seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:body,mat:'clear',seg:44});
  k.torus(.47,.014,{part:'capTop',at:[0,.505,0],rot:[PI/2,0,0],color:WHITE,mat:'pearl'});
  const r=rng(13);for(let i=0;i<26;i++){const a=r()*PI*2,t=.15+r()*.75,y=.5+t*.46,rr=Math.sqrt(Math.max(0,1-((y-.5)/.48)**2))*.44;
   k.box(.02+r()*.02,.004,.012,{part:'capTop',at:[Math.sin(a)*rr,y,Math.cos(a)*rr],rot:[r()*3,a,r()*3],color:WHITE,mat:'ink'});}
  for(let i=0;i<6;i++){const a=i*PI/3;k.box(.012,.12,.012,{part:'capTop',at:[Math.sin(a)*.05,.76+Math.cos(a)*.05,.42],rot:[-.55,0,-a],color:WHITE,mat:'pearl'});
   for(const s of [-1,1])k.box(.008,.04,.008,{part:'capTop',at:[Math.sin(a)*.08,.76+Math.cos(a)*.08,.4],rot:[-.55,0,-a+s*.8],color:WHITE,mat:'pearl'});}
  k.smoothLathe(cup,{part:'capBot',color:frost,mat:'jelly',seg:44});k.smoothLathe(inset(cup),{part:'capBot',color:k.shade(frost,.1),mat:'jelly',seg:44});
  k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:WHITE,mat:'pearl'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:k.shade(frost,-.1),mat:'jelly',seg:40});
  // Inside: a red lacquer tray, a footed glass, rainbow syrup on shaved ice, a cherry, a wafer spoon and an ice flag.
  k.cyl(.38,.4,.05,{part:'inner',at:[0,.025,0],color:'#d23a3a',mat:'vinyl',seg:48});k.torus(.385,.014,{part:'inner',at:[0,.05,0],rot:[PI/2,0,0],color:'#ffd447',mat:'gold'});
  k.lathe([[0,.05],[.15,.05],[.16,.065],[.15,.08],[.06,.1],[.05,.16],[.1,.2],[.2,.24],[.3,.31],[.35,.37],[.33,.38],[0,.38]],{part:'inner',color:glassC,mat:'jelly',seg:56});
  k.blob(.34,{part:'inner',at:[0,.52,0],scale:[1,1.02,1],amp:.014,freq:11,seed:2,color:ice,dark:'#d3e9f5',light:'#ffffff',mat:'soft'});
  k.blob(.22,{part:'inner',at:[0,.68,.1],scale:[1.05,.78,1.05],amp:.018,freq:5,seed:6,color:accent,dark:k.shade(accent,-.12),light:k.shade(accent,.1),mat:'jelly',seg:48});
  k.blob(.2,{part:'inner',at:[-.12,.66,-.1],scale:[1.05,.8,1.05],amp:.014,freq:6,seed:8,color:'#7ee0a3',mat:'jelly',seg:40});
  k.blob(.2,{part:'inner',at:[.13,.66,-.1],scale:[1.05,.8,1.05],amp:.014,freq:6,seed:9,color:'#58b8ff',mat:'jelly',seg:40});
  for(const [a,len] of [[-1.3,.07],[2.2,.09],[3.6,.06],[.9,.05]] as const){const rr=.31;k.capsule(.022,len,{part:'inner',at:[Math.sin(a)*rr,.6-len/2,Math.cos(a)*rr],color:accent,mat:'jelly'});}
  k.sphere(.06,{part:'inner',at:[.02,.89,.02],color:'#e8183c',mat:'vinyl'});k.sphere(.016,{part:'inner',at:[.04,.91,.07],color:WHITE,mat:'ink'});
  k.tube([[.02,.94,.02],[.03,.99,0],[.07,1.03,-.03]],.007,{part:'inner',color:'#4c8a33',mat:'matte'});
  k.rbox(.06,.3,.02,.02,{part:'spoon',at:[.2,.86,.02],rot:[0,0,-.42],color:'#f6d27a',mat:'matte'});k.rbox(.1,.1,.024,.04,{part:'spoon',at:[.27,1.0,.02],rot:[0,0,-.42],color:'#f6d27a',mat:'matte'});
  for(const d of [-.06,0,.06])k.box(.07,.006,.026,{part:'spoon',at:[.2+d*.42,.86+d,.02],rot:[0,0,-.42],color:k.shade('#f6d27a',-.12),mat:'matte'});
  k.cyl(.008,.008,.42,{part:'flag',at:[-.2,.92,-.14],color:'#d9b77a',mat:'matte',seg:8});
  k.rbox(.18,.13,.008,.006,{part:'flag',at:[-.11,1.05,-.14],color:WHITE,mat:'vinyl'});
  for(const z of [-.133,-.147])k.extrude([[-.045,-.03],[0,.035],[.045,-.03]],.004,{part:'flag',at:[-.11,1.065,z],color:'#e8183c',mat:'vinyl',bevel:.001});// a red ice-mountain mark
  for(const z of [-.135,-.145]){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push([-.19+i*.016,1.0+.008*Math.sin(i*1.4),z]);k.tube(pts,.006,{part:'flag',color:'#2f8fd6',mat:'vinyl'});}
  face(k,'inner',{x:0,y:.52,surf:(x,y)=>Math.sqrt(Math.max(0,.335**2-x*x-((y-.52)/1.02)**2))+.004,gap:.11,size:.042,mouth:'open',prefix:'in'});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},soft:{soft:.5,jelly:true},springs:[{part:'flag',k:50,c:2,amp:1.3},{part:'spoon',k:80,c:3,amp:.6}],
   squeeze:['shake','jiggle'],poke:{default:['sparkle','blink:ineyes'],flag:['wiggle:flag'],spoon:['wiggle:spoon']},tap:['sparkle','glow','twirl'],head:{above:.6},
   voice:{squeeze:['crunch:1.3','crispy:1.4'],poke:['blip:1.8'],tap:['tinkle','sparkle']}};
 },
};
export default set;
