/**
 * Rides & Rollers (gs-jetty), rebuilt for round 3B batch 3 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): island rides and
 * vehicles from the machine on the East Jetty plaza. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Scooter Skip     a pull-back wind-up kick scooter (grip-tape deck, urethane wheels, a rear brake fender, a bell); the key
 *                    sits on the motor box at the back (bonus: push him and the wheels roll)
 *   Bike Bram        working parts: turn the pedals and the chainring drives both spoked wheels; press his bell (bonus
 *                    wind-up not in the runtime yet: the pedals coast instead)
 *   Moped Mo         a bobblehead scooter-moped: his headset (face, headlamp, mirrors) nods on a spring above the leg shield
 *                    (bonus wind-up not in the runtime yet: he putters and laps instead)
 *   Jetpack Jo       take-apart: the flames come off the nozzles, then the two rocket tanks (bonus: flick to spin)
 *   Ferry Fern       a squeaky bath-toy ferry on a jelly wave: hull, cabin, bridge, funnel, life rings, a bow rail (bonus
 *                    wind-up not in the runtime yet: she bobs and sails a circle instead)
 *   Lighthouse Lumi  the rare: a pearl secret capsule; inside, the East Jetty lighthouse on its rock in the sea, a striped tower,
 *                    gallery, lantern with beams, and a little rowboat (the extra part); her keeper's door opens (bonus)
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
 */
import * as T from 'three';
import type {Finish,ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96',STEEL='#c9ced6';
type Pt=readonly [number,number];
type Surf=(x:number,y:number)=>number;
/** A shape's outline as points (the closing duplicate dropped). */
function outline(sh:T.Shape,n:number):Pt[]{const p=sh.getSpacedPoints(n).map(q=>[q.x,q.y] as Pt);const a=p[0],b=p[p.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)p.pop();return p;}
/** Euler angles that turn +y onto the direction d. */
function upTo(d:V3):V3{const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...d).normalize());const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
/** A straight rod (a round tube) between two model points. */
function rod(k:ToyKit,a:V3,b:V3,r:number,o:{part?:string;color:string;mat:Finish;seg?:number}){const d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
 k.cyl(r,r,Math.hypot(...d),{part:o.part,at:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:upTo(d),color:o.color,mat:o.mat,seg:o.seg??14});}
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
/** A wheel turning about x (the toy rolls along z): a tyre, a white hub and a coloured spoke so the turning shows. */
function wheelX(k:ToyKit,part:string,at:V3,r:number,w:number,tyre:string,spoke:string){
 k.cyl(r,r,w,{part,at,rot:[0,0,PI/2],color:tyre,mat:'vinyl',seg:32});k.torus(r*.62,r*.09,{part,at:[at[0]+w/2,at[1],at[2]],rot:[0,PI/2,0],color:k.shade(tyre,.15),mat:'vinyl'});
 k.torus(r*.62,r*.09,{part,at:[at[0]-w/2,at[1],at[2]],rot:[0,PI/2,0],color:k.shade(tyre,.15),mat:'vinyl'});
 k.cyl(r*.48,r*.48,w+.008,{part,at,rot:[0,0,PI/2],color:WHITE,mat:'vinyl',seg:24});k.box(w+.014,r*.7,r*.16,{part,at,color:spoke,mat:'matte'});
}

const set:ToyModelSet={
 'scooter-skip':(k)=>{
  const {body,accent}=k.c;
  k.part('wheelF',{at:[0,.09,.3]});k.part('wheelB',{at:[0,.09,-.28]});k.part('head',{at:[0,.72,.24]});k.part('bell',{at:[.13,.83,.24],parent:'head'});k.part('key',{at:[0,.24,-.4]});
  // The deck: teal, black grip tape, a kicked-up tail; the rear brake fender over the back wheel.
  k.rbox(.17,.045,.62,.02,{at:[0,.13,0],color:body,mat:'vinyl'});k.rbox(.14,.006,.5,.003,{at:[0,.155,-.02],color:'#2a2f33',mat:'matte'});
  k.torus(.1,.018,{at:[0,.09,-.28],rot:[0,PI/2,0],arc:PI*.55,color:body,mat:'vinyl'});
  wheelX(k,'wheelF',[0,.09,.3],.09,.05,accent,'#ffd447');wheelX(k,'wheelB',[0,.09,-.28],.09,.05,accent,'#ffd447');
  for(const s of [-1,1])k.box(.012,.14,.03,{part:'body',at:[s*.036,.15,.3],color:body,mat:'vinyl'});
  // The stem with an orange folding clamp, the head (his face), the T-bar with orange grips and the bell.
  rod(k,[0,.16,.31],[0,.7,.25],.028,{color:STEEL,mat:'gold'});k.torus(.034,.012,{at:[0,.3,.297],rot:[PI/2-.11,0,0],color:accent,mat:'vinyl'});
  k.rbox(.22,.17,.13,.06,{part:'head',at:[0,.72,.25],color:body,mat:'vinyl'});
  k.cyl(.018,.018,.5,{part:'head',at:[0,.82,.24],rot:[0,0,PI/2],color:STEEL,mat:'gold'});
  for(const s of [-1,1])k.capsule(.026,.08,{part:'head',at:[s*.24,.82,.24],rot:[0,0,PI/2],color:accent,mat:'matte'});
  k.sphere(.034,{part:'bell',at:[.13,.845,.24],scale:[1,.65,1],color:'#e8c14a',mat:'gold'});k.box(.01,.02,.03,{part:'bell',at:[.13,.83,.27],color:STEEL,mat:'gold'});
  face(k,'head',{x:0,y:.725,surf:()=>.317,gap:.062,size:.036,mouth:'open'});
  // The pull-back motor box and its wind-up key, at the back above the fender.
  k.rbox(.09,.07,.09,.02,{at:[0,.2,-.31],color:k.shade(body,-.15),mat:'vinyl'});
  k.cyl(.016,.016,.08,{part:'key',at:[0,.22,-.38],rot:[PI/2,0,0],color:'#d9b13b',mat:'gold',seg:12});
  for(const s of [-1,1])k.cyl(.045,.045,.016,{part:'key',at:[s*.05,.22,-.425],rot:[PI/2,0,0],scale:[1,1,.75],color:'#e8c14a',mat:'gold'});
  k.sphere(.022,{part:'key',at:[0,.22,-.425],color:'#e8c14a',mat:'gold'});k.proxy('key',.08,[0,.22,-.42]);
  k.wheels(['wheelF','wheelB'],{radius:.09,dir:[0,0,1],range:.4,label:'wheels',hint:'Push me'});
  return {kind:{kind:'windup',key:'key'},
   squeeze:['wiggle:bell','jiggle'],poke:{default:['wiggle:bell','blink'],bell:['wiggle:bell'],head:['nod:head']},tap:['hop','spin'],head:'head',
   voice:{squeeze:['d_wheel'],poke:['ding:1.2'],tap:['whoosh:1.6','ding:1.4']}};
 },
 'bike-bram':(k)=>{
  const {body,accent}=k.c,WY=.22,WR=.19;
  k.part('wheelB',{at:[-.32,WY,0]});k.part('wheelF',{at:[.32,WY,0]});k.part('crank',{at:[0,.2,0]});k.part('basket',{at:[.4,.55,0]});k.part('bell',{at:[.24,.735,.1]});
  // Two spoked wheels: tyres, silver rims, hubs, eight spokes.
  for(const [p,x] of [['wheelB',-.32],['wheelF',.32]] as const){k.torus(WR,.03,{part:p,at:[x,WY,0],color:'#2a2f33',mat:'matte'});k.torus(WR-.03,.011,{part:p,at:[x,WY,0],color:STEEL,mat:'gold'});
   k.cyl(.03,.03,.06,{part:p,at:[x,WY,0],rot:[PI/2,0,0],color:STEEL,mat:'gold',seg:16});
   for(let i=0;i<8;i++)k.box(.004,(WR-.03)*2,.004,{part:p,at:[x,WY,0],rot:[0,0,i*PI/8],color:STEEL,mat:'matte'});}
  k.cyl(.035,.035,.012,{part:'wheelB',at:[-.32,WY,.045],rot:[PI/2,0,0],color:'#e8c14a',mat:'gold',seg:14});
  // The frame (cyan tubes), chainstays and seatstays to the back axle, the fork, mudguards.
  const BB:V3=[0,.2,0],SEAT:V3=[-.1,.58,0],HT:V3=[.25,.58,0],HB:V3=[.28,.47,0];
  for(const [a,b] of [[BB,SEAT],[SEAT,HT],[BB,HB],[HT,HB]] as const)rod(k,a,b,.022,{color:body,mat:'vinyl'});
  for(const z of [-.03,.03]){rod(k,[0,.2,z],[-.32,WY,z],.014,{color:body,mat:'vinyl'});rod(k,[-.1,.56,z*.6],[-.32,WY,z],.013,{color:body,mat:'vinyl'});rod(k,[.28,.47,z*.6],[.32,WY,z],.014,{color:body,mat:'vinyl'});}
  for(const x of [-.32,.32])k.torus(WR+.045,.012,{at:[x,WY,0],rot:[0,0,PI*.22],arc:PI*.56,color:body,mat:'vinyl'});
  // The saddle and post, the handlebar stem and bar with grips.
  rod(k,SEAT,[-.12,.64,0],.014,{color:STEEL,mat:'gold'});k.sphere(1,{at:[-.12,.66,0],scale:[.09,.03,.055],color:'#5a3a22',mat:'vinyl',seg:28});
  rod(k,HT,[.24,.7,0],.016,{color:STEEL,mat:'gold'});k.cyl(.014,.014,.3,{at:[.24,.71,0],rot:[PI/2,0,0],color:STEEL,mat:'gold'});
  for(const s of [-1,1])k.capsule(.02,.06,{at:[.24,.71,s*.15],rot:[PI/2,0,0],color:accent,mat:'matte'});
  // The bell (press it).
  k.sphere(.028,{part:'bell',at:[.24,.735,.1],scale:[1,.6,1],color:'#e8c14a',mat:'gold'});k.proxy('bell',.07,[.24,.735,.1]);
  k.slider('bell',{axis:[0,-1,0],max:.014,release:'return',label:'bell',hint:'Ring me'});
  // The front basket with his face on the side; wicker weave on the others.
  k.rbox(.22,.16,.24,.03,{part:'basket',at:[.4,.63,0],color:'#d9b77a',mat:'matte'});k.rbox(.2,.02,.22,.008,{part:'basket',at:[.4,.71,0],color:k.shade('#d9b77a',-.15),mat:'matte'});
  for(const y of [.58,.63,.68])k.box(.225,.008,.006,{part:'basket',at:[.4,y,-.121],color:k.shade('#d9b77a',-.2),mat:'matte'});
  k.rbox(.19,.13,.01,.03,{part:'basket',at:[.4,.63,.122],color:body,mat:'vinyl'});
  face(k,'basket',{x:.4,y:.65,surf:()=>.13,gap:.055,size:.033,mouth:'open'});
  rod(k,[.28,.5,0],[.38,.555,0],.01,{color:STEEL,mat:'gold'});
  // The crank (the working part): a gold chainring with teeth, two arms and pedals; the chain to the back sprocket.
  k.cyl(.07,.07,.014,{part:'crank',at:[0,.2,.045],rot:[PI/2,0,0],color:'#e8c14a',mat:'gold',seg:28});
  for(let i=0;i<12;i++){const a=i*PI/6;k.box(.014,.016,.012,{part:'crank',at:[Math.cos(a)*.074,.2+Math.sin(a)*.074,.045],rot:[0,0,a],color:'#e8c14a',mat:'gold'});}
  for(const s of [-1,1]){k.box(.02,.13,.012,{part:'crank',at:[0,.2-s*.065,s*.06],color:STEEL,mat:'gold'});k.rbox(.07,.02,.05,.008,{part:'crank',at:[0,.2-s*.13,s*.085],color:INK,mat:'matte'});}
  k.proxy('crank',.1,[0,.12,.07]);
  k.tube([[0,.272,.045],[-.16,.262,.045],[-.32,WY+.037,.045],[-.355,WY,.045],[-.32,WY-.037,.045],[-.16,.16,.045],[0,.128,.045]],.006,{color:'#3a3f44',mat:'matte'});
  k.crank('crank',{axis:'z',label:'pedals',hint:'Pedal me',drives:[{part:'wheelB',ratio:2.2},{part:'wheelF',ratio:2.2}]});
  return {kind:{kind:'mechanism'},
   squeeze:['d_crank:crank+wheelB+wheelF'],poke:{default:['wiggle:bell','jiggle'],bell:['wiggle:bell'],crank:['d_crank:crank+wheelB+wheelF']},tap:['d_wheelie'],head:'basket',
   voice:{squeeze:['click','click:1.1','click'],poke:['d_ringring'],tap:['d_ringring:1.1','whoosh:1.4']}};
 },
 'moped-mo':(k)=>{
  const {body,accent}=k.c,seat='#5a3a22';
  k.part('wheelF',{at:[0,.1,.26]});k.part('wheelB',{at:[0,.1,-.24]});k.part('head',{at:[0,.68,.2]});k.part('lamp',{at:[0,.87,.23],parent:'head'});
  // Chunky whitewall wheels.
  for(const [p,z] of [['wheelF',.26],['wheelB',-.24]] as const){k.torus(.07,.03,{part:p,at:[0,.1,z],rot:[0,PI/2,0],color:'#2a2f33',mat:'matte'});
   for(const s of [-1,1])k.torus(.062,.01,{part:p,at:[s*.024,.1,z],rot:[0,PI/2,0],color:WHITE,mat:'matte'});k.cyl(.045,.045,.07,{part:p,at:[0,.1,z],rot:[0,0,PI/2],color:STEEL,mat:'gold',seg:20});}
  // The body: a round rear cowl with side bulges, the seat, the floorboard with rubber strips, the leg shield and front fender.
  k.sphere(1,{at:[0,.3,-.2],scale:[.18,.16,.25],color:body,mat:'vinyl',seg:40});
  for(const s of [-1,1])k.sphere(1,{at:[s*.09,.27,-.22],scale:[.12,.12,.19],color:body,mat:'vinyl',seg:32});
  k.sphere(1,{at:[0,.455,-.17],scale:[.1,.05,.18],color:seat,mat:'vinyl',seg:32});k.capsule(.008,.16,{at:[0,.47,-.15],rot:[PI/2,0,0],color:STEEL,mat:'gold'});k.box(.2,.012,.02,{at:[0,.45,-.03],color:STEEL,mat:'gold'});
  k.rbox(.22,.04,.24,.015,{at:[0,.17,.04],color:'#3a3f44',mat:'matte'});for(const x of [-.06,0,.06])k.box(.02,.006,.2,{at:[x,.193,.04],color:'#5a5f6a',mat:'matte'});
  k.rbox(.3,.45,.06,.1,{at:[0,.4,.2],color:body,mat:'vinyl'});k.rbox(.07,.22,.012,.03,{at:[0,.42,.233],color:accent,mat:'vinyl'});
  k.sphere(1,{at:[0,.2,.27],scale:[.075,.06,.12],color:body,mat:'vinyl',seg:32});
  k.sphere(.025,{at:[0,.34,-.445],scale:[1.4,.8,.6],color:'#e94b3c',mat:'jelly'});k.rbox(.1,.05,.008,.008,{at:[0,.25,-.44],color:WHITE,mat:'matte'});
  rod(k,[0,.6,.2],[0,.7,.2],.025,{color:STEEL,mat:'gold'});
  // The bobbing headset: his face, a round headlamp on top, handlebar grips and two mirrors.
  k.rbox(.34,.17,.14,.065,{part:'head',at:[0,.76,.2],color:body,mat:'vinyl'});
  for(const s of [-1,1]){k.capsule(.022,.07,{part:'head',at:[s*.21,.77,.2],rot:[0,0,PI/2],color:'#2a2f33',mat:'matte'});
   rod(k,[s*.13,.84,.2],[s*.17,.92,.2],.007,{part:'head',color:STEEL,mat:'gold',seg:8});k.cyl(.03,.03,.01,{part:'head',at:[s*.17,.94,.2],rot:[PI/2,0,0],color:STEEL,mat:'gold',seg:20});}
  k.cyl(.05,.05,.05,{part:'lamp',at:[0,.87,.23],rot:[PI/2,0,0],color:STEEL,mat:'gold',seg:28});k.sphere(.042,{part:'lamp',at:[0,.87,.25],scale:[1,1,.45],color:'#fff6c8',mat:'ink'});
  face(k,'head',{x:0,y:.78,surf:()=>.272,gap:.075,size:.036,mouth:'open'});
  return {kind:{kind:'bobble',head:'head'},
   squeeze:['d_putter','puff'],poke:{default:['d_putter'],lamp:['pop:lamp']},tap:['circle'],head:'head',
   voice:{squeeze:['d_puttputt'],poke:['d_meep'],tap:['d_puttputt:1.2','d_meep:1.2']}};
 },
 'jetpack-jo':(k)=>{
  const {body,accent}=k.c,dark='#3a3f44';
  for(const s of [-1,1] as const){const L=s<0?'L':'R';k.part('tank'+L,{at:[s*.25,.48,-.02]});k.part('flame'+L,{at:[s*.25,.21,-.02]});}
  // The core pack: silver with a red cap and stripe, landing struts with pads, straps and a gold buckle on the back.
  k.rbox(.32,.4,.2,.07,{at:[0,.48,0],color:body,mat:'vinyl'});k.rbox(.3,.06,.19,.03,{at:[0,.7,0],color:accent,mat:'vinyl'});
  k.rbox(.05,.38,.012,.01,{at:[0,.48,-.101],color:accent,mat:'vinyl'});
  for(const s of [-1,1]){k.tube([[s*.09,.66,-.1],[s*.1,.48,-.125],[s*.09,.3,-.1]],.016,{color:dark,mat:'matte'});
   rod(k,[s*.09,.3,0],[s*.13,.05,.0],.018,{color:STEEL,mat:'gold'});k.cyl(.05,.055,.03,{at:[s*.13,.015,0],color:dark,mat:'matte',seg:20});}
  k.rbox(.06,.04,.015,.008,{at:[0,.48,-.13],color:'#e8c14a',mat:'gold'});
  k.cyl(.03,.03,.02,{at:[.09,.64,.1],rot:[PI/2,0,0],color:'#ffd447',mat:'vinyl',seg:16});k.cyl(.02,.02,.02,{at:[-.09,.64,.1],rot:[PI/2,0,0],color:'#3ec6e0',mat:'vinyl',seg:16});
  face(k,'body',{x:0,y:.48,surf:()=>.102,gap:.08,size:.044,mouth:'grin',brows:dark});
  // Two rocket tanks (red nose cones, clamp bands, bell nozzles) and their jelly flames.
  for(const s of [-1,1] as const){const L=s<0?'L':'R',x=s*.25,t='tank'+L,f='flame'+L;
   k.cyl(.085,.085,.42,{part:t,at:[x,.48,-.02],color:'#e3e7ec',mat:'vinyl',seg:32});k.cone(.085,.12,{part:t,at:[x,.75,-.02],color:accent,mat:'vinyl',seg:32});
   for(const y of [.38,.58])k.torus(.088,.01,{part:t,at:[x,y,-.02],rot:[PI/2,0,0],color:dark,mat:'matte'});
   k.box(.04,.03,.04,{part:t,at:[s*.175,.58,-.02],color:dark,mat:'matte'});k.box(.04,.03,.04,{part:t,at:[s*.175,.38,-.02],color:dark,mat:'matte'});
   k.cyl(.05,.075,.06,{part:t,at:[x,.24,-.02],color:'#8a9098',mat:'gold',seg:24});
   k.cone(.062,.15,{part:f,at:[x,.135,-.02],rot:[PI,0,0],color:'#ff8a3c',mat:'jelly',seg:20});k.cone(.035,.1,{part:f,at:[x,.16,-.02],rot:[PI,0,0],color:'#ffe066',mat:'jelly',seg:16});}
  return {kind:{kind:'puzzle',pieces:[{part:'flameL',name:'the left flame'},{part:'flameR',name:'the right flame'},{part:'tankL',name:'the left tank',after:['flameL']},{part:'tankR',name:'the right tank',after:['flameR']}]},flick:true,
   squeeze:['d_flame:flameL+flameR'],poke:{default:['d_flame:flameL+flameR','puff'],flameL:['d_flame:flameL'],flameR:['d_flame:flameR']},tap:['loop','sparkle'],head:{above:.6},
   voice:{squeeze:['whoosh:.8'],poke:['d_sputter'],tap:['whoosh','sparkle']}};
 },
 'ferry-fern':(k)=>{
  const {body,accent}=k.c;
  k.part('funnel',{at:[0,.6,-.16]});k.part('flag',{at:[0,.64,.06]});
  // A jelly wave to float on.
  k.blob(1,{at:[0,.06,0],scale:[.44,.05,.38],amp:.006,freq:4,seed:3,color:'#4fb3e8',dark:'#2f86c8',light:'#9fdcf5',mat:'jelly',seg:48});
  // The hull: blue below, a white band, a deck; a red waterline stripe; a rail round the bow.
  const sh=new T.Shape();sh.moveTo(0,.46);sh.bezierCurveTo(.1,.4,.22,.28,.24,.1);sh.lineTo(.24,-.22);sh.bezierCurveTo(.24,-.34,.14,-.37,0,-.37);sh.bezierCurveTo(-.14,-.37,-.24,-.34,-.24,-.22);sh.lineTo(-.24,.1);sh.bezierCurveTo(-.22,.28,-.1,.4,0,.46);
  const hull=outline(sh,56),sc=(f:number)=>hull.map(([x,y])=>[x*f,y*f] as Pt);
  k.extrude(hull,.13,{at:[0,.145,0],rot:[PI/2,0,0],color:accent,mat:'vinyl',bevel:.045});
  k.extrude(sc(1.005),.02,{at:[0,.2,0],rot:[PI/2,0,0],color:'#e94b3c',mat:'vinyl',bevel:.006});
  k.extrude(sc(.99),.08,{at:[0,.25,0],rot:[PI/2,0,0],color:body,mat:'vinyl',bevel:.025});
  const rail=sc(.9).filter(([,y])=>y>.0).sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  k.tube(rail.filter((_,i)=>i%3===0).map(([x,y])=>[x,.34,y] as V3),.008,{color:accent,mat:'vinyl'});
  for(const [x,y] of rail.filter((_,i)=>i%9===0))k.cyl(.006,.006,.05,{at:[x,.315,y],color:accent,mat:'vinyl',seg:8});
  // The cabin (her face on its front), round windows down the sides, life rings, the bridge, the funnel and a pennant.
  k.rbox(.34,.2,.36,.05,{at:[0,.39,-.06],color:body,mat:'vinyl'});
  for(const s of [-1,1]){for(const z of [-.18,-.08,.02])k.cyl(.026,.026,.012,{at:[s*.171,.42,z],rot:[0,0,PI/2],color:'#2f6fd6',mat:'ink',seg:16});
   k.torus(.042,.014,{at:[s*.176,.38,.08],rot:[0,PI/2,0],color:'#ff7a2a',mat:'vinyl'});}
  k.rbox(.26,.12,.18,.04,{at:[0,.55,-.06],color:body,mat:'vinyl'});k.rbox(.27,.04,.19,.015,{at:[0,.565,-.06],color:accent,mat:'ink'});k.rbox(.3,.025,.22,.012,{at:[0,.622,-.06],color:accent,mat:'vinyl'});
  k.cyl(.06,.07,.16,{part:'funnel',at:[0,.7,-.16],color:accent,mat:'vinyl',seg:28});k.cyl(.062,.062,.03,{part:'funnel',at:[0,.72,-.16],color:WHITE,mat:'vinyl',seg:28});k.cyl(.061,.061,.025,{part:'funnel',at:[0,.79,-.16],color:'#e94b3c',mat:'vinyl',seg:28});
  k.cyl(.006,.006,.14,{part:'flag',at:[0,.7,.06],color:STEEL,mat:'gold',seg:8});k.extrude([[0,0],[.09,-.025],[0,-.05]],.008,{part:'flag',at:[.004,.77,.06],color:'#ffd447',mat:'vinyl',bevel:.002});
  face(k,'body',{x:0,y:.4,surf:()=>.122,gap:.085,size:.042,mouth:'open'});
  return {kind:{kind:'squish'},soft:{soft:.5},springs:[{part:'flag',k:40,c:2,amp:1.2}],
   squeeze:['pop:funnel','puff'],poke:{default:['d_bob:body'],funnel:['pop:funnel','puff'],flag:['wiggle:flag']},tap:['circle'],head:{above:.56},
   voice:{squeeze:['d_horn'],poke:['d_lap'],tap:['d_horn:1.15','d_lap']}};
 },
 'lighthouse-lumi':(k)=>{
  const {body,accent}=k.c;
  secretCapsule(k,{top:'#fff8ec',topMat:'pearl',bot:accent,botMat:'pearl',rim:'#ffd447',mark:'#ffd447',markMat:'gold'});
  k.part('lamp',{at:[0,.78,0],parent:'inner'});k.part('door',{at:[-.04,.26,.142],parent:'inner'});k.part('boat',{at:[.27,.05,.2],parent:'inner'});
  // The sea and the rock.
  k.cyl(.44,.44,.04,{part:'inner',at:[0,.02,0],scale:[1,1,.9],color:'#4fb3e8',mat:'jelly',seg:48});
  k.blob(1,{part:'inner',at:[0,.12,0],scale:[.3,.1,.26],amp:.012,freq:5,seed:6,color:'#8f969c',dark:'#636a70',light:'#b8bdc0',mat:'matte',seg:40});
  // The striped tower, windows, the gallery with railing, the glass lantern, the red roof.
  const r=(y:number)=>.15-(y-.18)*(.05/.52),bands=[.18,.31,.44,.57,.7];
  for(let i=0;i<4;i++){const y0=bands[i],y1=bands[i+1];k.lathe([[r(y0),y0],[r(y1),y1]],{part:'inner',color:i%2?accent:body,mat:'vinyl',seg:40});}
  k.cyl(r(.18),r(.18),.01,{part:'inner',at:[0,.18,0],color:body,mat:'vinyl',seg:40});
  for(const [y,a] of [[.4,.9],[.62,-.9]] as const)k.rbox(.03,.045,.01,.008,{part:'inner',at:[Math.sin(a)*r(y),y,Math.cos(a)*r(y)],rot:[0,a,0],color:INK,mat:'ink'});
  k.cyl(.14,.14,.02,{part:'inner',at:[0,.71,0],color:k.shade(accent,-.1),mat:'vinyl',seg:36});k.torus(.135,.006,{part:'inner',at:[0,.76,0],rot:[PI/2,0,0],color:INK,mat:'matte'});
  for(let i=0;i<10;i++){const a=i*PI/5;k.cyl(.004,.004,.05,{part:'inner',at:[Math.sin(a)*.135,.735,Math.cos(a)*.135],color:INK,mat:'matte',seg:6});}
  k.cyl(.085,.085,.12,{part:'inner',at:[0,.78,0],color:'#e8f6ff',mat:'clear',seg:28});
  k.cone(.1,.08,{part:'inner',at:[0,.88,0],color:accent,mat:'vinyl',seg:28});k.sphere(.02,{part:'inner',at:[0,.93,0],color:'#ffd447',mat:'gold'});
  // The lamp and its two beams (they sweep round).
  k.sphere(.045,{part:'lamp',at:[0,.78,0],color:'#ffe066',mat:'jelly'});
  for(const s of [-1,1])k.cone(.035,.2,{part:'lamp',at:[s*.15,.78,0],rot:[0,0,s*PI/2],color:'#ffd54a',mat:'jelly',seg:18});
  // Her face on the white band, the keeper's door (the working part) with a warm light inside, a little rowboat (the extra part).
  face(k,'inner',{x:0,y:.52,surf:(x,y)=>Math.sqrt(Math.max(0,r(y)**2-x*x))+.004,gap:.065,size:.038,mouth:'open',prefix:'in'});
  k.rbox(.07,.1,.004,.02,{part:'inner',at:[0,.26,.14],color:'#ffd447',mat:'jelly'});
  k.rbox(.08,.11,.014,.025,{part:'door',at:[0,.26,.148],color:k.shade(accent,-.15),mat:'vinyl'});k.sphere(.008,{part:'door',at:[.025,.26,.157],color:'#ffd447',mat:'gold'});
  k.proxy('door',.08,[0,.26,.15]);
  k.hinge('door',{axis:[0,-1,0],max:1.6,detents:[.8],label:'keeper\'s door',hint:'Open my door'});
  k.sphere(1,{part:'boat',at:[.27,.055,.2],scale:[.05,.03,.09],rot:[0,.4,0],color:'#e94b3c',mat:'vinyl',seg:24});k.box(.07,.008,.02,{part:'boat',at:[.27,.07,.2],rot:[0,.4,0],color:WHITE,mat:'matte'});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['d_sweep:lamp'],poke:{default:['blink:ineyes','d_lampblink:lamp'],door:['wiggle:door'],boat:['d_bob:boat']},tap:['glow','d_lampblink:lamp','sparkle'],head:{above:.65},
   voice:{squeeze:['hum:.6'],poke:['pip:.6'],tap:['d_foghorn','hum:.5']}};
 },
};
export default set;
