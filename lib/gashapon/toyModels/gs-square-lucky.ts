/**
 * Lucky Little Japan (gs-square-lucky), rebuilt for round 3B/3C batch 2 (Nov 9 2026; docs/gashapon-design.md "Round 3B" and
 * "Round 3C"): cute Japanese good-luck figurines (respectful, never jokes). HD kit, each toy plays its planned KIND
 * (lib/gashapon/toyKinds.ts):
 *   Daruma Dash     take-apart: a daruma-otoshi stack (the daruma head on blue, yellow and green lacquered blocks on a red base
 *                   and a wooden tray, with the little mallet); his face has the crane brows and turtle beard of a real daruma,
 *                   gold plum blossoms on the back (bonus: the daruma bobbles on top of the stack)
 *   Maneki Mika     a soft vinyl calico beckoning cat with a red collar and gold bell, a koban coin in her left paw (bonus
 *                   working part: pull her raised paw and it beckons, a lucky coin pops up)
 *   Origami Orin    working parts: a folded paper crane on a masu box printed with seigaiha waves; drag either wing and it
 *                   folds up and stays (bonus charm: a lucky paper star dangles on a ball chain from the box corner)
 *   Koi Kite Kaito  a spinner: a koinobori pole with the arrow wheel, the five-colour streamer, blue Kaito (scales, the big
 *                   koinobori eyes) and a little red koi; flick it and they circle the pole (bonus: the streamers swing)
 *   Ema Emi         a charm: a wooden ema wish plaque on a ball chain (a roof, wood grain, a red-and-white cord, tiny geta);
 *                   lift her painted-football flap and the wish underneath shows a ball in the goal (bonus working part)
 *   Torii Tomo      the rare: a pearl secret capsule with a sakura mark; inside, a little torii gate figure on moss with
 *                   stepping stones, petals and a stone lantern (the extra part); pose him: a welcome bow, a wave, a star
 *                   (bonus figure)
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
function plum(k:ToyKit,part:string,at:V3,n:T.Vector3,r:number,color=GOLD){
 const rot=basis(n,new T.Vector3(0,1,0)),q=new T.Quaternion().setFromEuler(new T.Euler(...rot));
 for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5,o=new T.Vector3(Math.cos(a)*r*.55,Math.sin(a)*r*.55,0).applyQuaternion(q);k.sphere(r*.42,{part,at:[at[0]+o.x,at[1]+o.y,at[2]+o.z],rot,scale:[1,1,.3],color,mat:'gold',seg:14});}
 k.sphere(r*.25,{part,at,rot,scale:[1,1,.5],color:'#fff2b8',mat:'gold',seg:12});
}

const set:ToyModelSet={
 'daruma-dash':(k)=>{
  const red=k.c.body,cream=k.c.accent,wood='#e6bf8a';
  k.part('blockG',{at:[0,.21,0]});k.part('blockY',{at:[0,.33,0]});k.part('blockB',{at:[0,.45,0]});k.part('head',{at:[0,.51,0]});
  // The wooden tray and the little mallet (tsuchi) lying in front.
  k.rbox(.66,.03,.54,.014,{at:[0,.015,0],color:wood,mat:'matte'});for(const z of [-.15,0,.15])k.box(.62,.002,.004,{at:[0,.031,z],color:k.shade(wood,-.08),mat:'matte'});
  k.cyl(.034,.034,.11,{at:[.12,.064,.22],rot:[PI/2,0,0],color:k.shade(wood,-.1),mat:'matte',seg:24});
  for(const dz of [-.04,.04])k.torus(.0345,.004,{at:[.12,.064,.22+dz],color:red,mat:'vinyl'});
  rod(k,[.12,.05,.22],[.31,.045,.22],.011,{color:wood,mat:'matte'});
  // The blocks: lacquered with rounded edges and a cream pinstripe at each edge (the base block is fixed).
  const R=.205;
  const block=(part:string,y0:number,col:string)=>{const h=.12,r=R;
   k.lathe([[0,y0],[r-.018,y0],[r-.005,y0+.005],[r,y0+.018],[r,y0+h-.018],[r-.005,y0+h-.005],[r-.018,y0+h],[0,y0+h]],{part,color:col,mat:'vinyl',seg:64});
   for(const y of [y0+.024,y0+h-.024])k.torus(r+.0005,.004,{part,at:[0,y,0],rot:[PI/2,0,0],color:cream,mat:'matte'});};
  block('body',.03,red);block('blockG',.15,'#3f9a5a');block('blockY',.27,'#f2c230');block('blockB',.39,'#2f6fd6');
  // The daruma: a red egg with a cream face panel, painted crane brows and turtle beard, gold plum blossoms.
  const H:Pt[]=[[0,.51],[.1,.512],[.17,.54],[.205,.6],[.212,.66],[.2,.73],[.165,.8],[.1,.85],[0,.87]];
  k.smoothLathe(H,{part:'head',color:red,mat:'vinyl',seg:64});
  const FY=.675,FZ=.172,patch:Surf=(x,y)=>FZ+.05*Math.sqrt(Math.max(0,1-(x/.135)**2-((y-FY)/.115)**2));
  k.sphere(1,{part:'head',at:[0,FY,FZ],scale:[.135,.115,.05],color:cream,mat:'vinyl',seg:48});
  k.torus(1,.035,{part:'head',at:[0,FY,FZ+.002],scale:[.138,.118,.6],color:GOLD,mat:'gold',seg:56});
  face(k,'head',{x:0,y:.69,surf:(x,y)=>patch(x,y)+.002,gap:.052,size:.03,mouth:'smile'});
  for(const s of [-1,1]){// crane-wing brows
   k.tube([[s*.025,.742,patch(s*.025,.742)+.003],[s*.055,.756,patch(s*.055,.756)+.003],[s*.09,.744,patch(s*.09,.744)+.002]],.009,{part:'head',color:INK,mat:'ink'});
   // turtle-shell beard curls at the cheeks
   k.torus(.016,.0045,{part:'head',arc:PI*1.4,at:[s*.07,.612,patch(s*.07,.612)+.002],rot:[0,0,s>0?-.4:PI*.6+.4],color:'#4a4040',mat:'ink'});}
  for(const dx of [-.02,0,.02])k.capsule(.004,.016,{part:'head',at:[dx,.585,patch(dx,.585)+.002],rot:[0,0,dx*8],color:'#4a4040',mat:'ink'});
  // Gold side swirls and two plum blossoms on the back.
  for(const s of [-1,1]){const a=s*1.25,y=.64,r=radiusAt(H,y);k.torus(.045,.008,{part:'head',arc:PI*1.2,at:[Math.sin(a)*(r+.001),y,Math.cos(a)*(r+.001)],rot:yawPitch(a,0,s*.4),color:GOLD,mat:'gold'});
   const b=s*1.15,y2=.56,r2=radiusAt(H,y2);k.torus(.03,.006,{part:'head',arc:PI,at:[Math.sin(b)*(r2+.001),y2,Math.cos(b)*(r2+.001)],rot:yawPitch(b,0,PI),color:GOLD,mat:'gold'});}
  for(const [a,y,r] of [[PI,.68,.06],[PI+.55,.6,.035],[PI-.55,.6,.035]] as const){const rr=radiusAt(H,y),n=new T.Vector3(Math.sin(a),0,Math.cos(a));plum(k,'head',[n.x*(rr+.004),y,n.z*(rr+.004)],n,r);}
  return {kind:{kind:'puzzle',pieces:[{part:'head',name:'the daruma'},{part:'blockB',name:'the blue block',after:['head']},{part:'blockY',name:'the yellow block',after:['blockB']},{part:'blockG',name:'the green block',after:['blockY']}]},
   springs:[{part:'head',k:70,c:2.4,amp:1}],
   squeeze:['e_teeter:blockB+head'],poke:{default:['tip'],head:['wink','wobble']},tap:['wink','wobble'],head:'head',
   voice:{squeeze:['tok','roll'],poke:['tok','boing:.7'],tap:['ting:.8']}};
 },
 'maneki-mika':(k)=>{
  const white=k.c.body,red=k.c.accent,orange='#f2a03d',black='#3a3638',pink='#ffb3c1';
  k.part('head',{at:[0,.48,0]});k.part('armR',{at:[.19,.46,.06]});k.part('bell',{at:[0,.47,.19]});k.part('tail',{at:[0,.14,-.22]});k.part('coin',{at:[.4,.95,.12]});
  // The seated body (a soft vinyl pear), front feet and a curled tail.
  const bodyP:Pt[]=[[0,0],[.19,.004],[.255,.04],[.275,.14],[.255,.26],[.2,.38],[.13,.46],[0,.5]];
  k.smoothLathe(bodyP,{scale:[1,1,.86],color:white,mat:'soft',seg:56});
  for(const s of [-1,1]){k.sphere(.07,{at:[s*.1,.04,.19],scale:[1,.6,1.15],color:white,mat:'soft'});
   for(const dx of [-.025,0,.025])k.sphere(.011,{at:[s*.1+dx,.045,.27],scale:[1,1,.5],color:pink,mat:'matte',seg:10});}
  k.tube([[0,.1,-.2],[.07,.13,-.29],[.09,.22,-.31],[.05,.3,-.28],[0,.33,-.24]],.034,{part:'tail',color:white,mat:'soft'});k.sphere(.04,{part:'tail',at:[0,.335,-.24],color:orange,mat:'soft'});
  // Calico patches: on the body back and side.
  const bodySurf=(a:number,y:number,lift:number):{at:V3;n:T.Vector3}=>{const r=radiusAt(bodyP,y);return {at:[Math.sin(a)*(r+lift),y,Math.cos(a)*(r+lift)*.86],n:new T.Vector3(Math.sin(a),0,Math.cos(a)*.86)};};
  for(const [a,y,w,h,col] of [[PI-.5,.24,.11,.09,orange],[PI+.6,.16,.08,.07,black],[-1.35,.3,.07,.06,orange]] as const){const p=bodySurf(a,y,-.012);k.sphere(1,{at:p.at,rot:basis(p.n,new T.Vector3(0,1,0)),scale:[w,h,.03],color:col,mat:'soft',seg:28});}
  // The big head, ears with pink insides, calico patches, whiskers.
  const HC:V3=[0,.7,0],HR:V3=[.275,.23,.2375];
  k.sphere(1,{part:'head',at:HC,scale:HR,color:white,mat:'soft',seg:48});
  for(const s of [-1,1]){k.cone(.085,.15,{part:'head',at:[s*.17,.9,-.01],rot:[0,0,-s*.42],color:white,mat:'soft'});k.cone(.05,.09,{part:'head',at:[s*.165,.893,.035],rot:[0,0,-s*.42],scale:[1,1,.4],color:pink,mat:'matte'});}
  const onHead=(yaw:number,el:number,lift:number):{at:V3;n:T.Vector3}=>{const d=new T.Vector3(Math.sin(yaw)*Math.cos(el),Math.sin(el),Math.cos(yaw)*Math.cos(el));
   return {at:[HC[0]+d.x*(HR[0]+lift),HC[1]+d.y*(HR[1]+lift),HC[2]+d.z*(HR[2]+lift)],n:new T.Vector3(d.x/HR[0],d.y/HR[1],d.z/HR[2])};};
  for(const [yaw,el,w,h,col] of [[-.62,.42,.12,.1,orange],[PI+.5,.35,.13,.11,black],[PI-.7,.1,.09,.08,orange]] as const){const p=onHead(yaw,el,-.014);k.sphere(1,{part:'head',at:p.at,rot:basis(p.n,new T.Vector3(0,1,0)),scale:[w,h,.03],color:col,mat:'soft',seg:28});}
  const hs=ellSurf(0,.7,0,.275,.23,.2375);
  face(k,'head',{x:0,y:.715,surf:(x,y)=>hs(x,y)+.002,gap:.095,size:.036,mouth:'cat',nose:'#ff8a9a'});
  for(const s of [-1,1])for(const i of [-1,0,1]){const pts:V3[]=[];for(let j=0;j<3;j++){const x=s*(.14+j*.04),y=.655+i*.016+i*j*.008;pts.push([x,y,hs(x,y)+.004]);}k.tube(pts,.0035,{part:'head',color:'#8a8a8a',mat:'ink'});}
  // The red collar with a gold bell.
  k.torus(.205,.03,{at:[0,.47,0],rot:[PI/2,0,0],scale:[1,.86,1],color:red,mat:'soft'});
  k.sphere(.052,{part:'bell',at:[0,.43,.205],color:GOLD,mat:'gold'});k.torus(.052,.006,{part:'bell',at:[0,.43,.205],rot:[PI/2,0,0],color:k.shade(GOLD,.1),mat:'gold'});
  k.box(.008,.03,.01,{part:'bell',at:[0,.41,.255],color:INK,mat:'matte'});k.sphere(.01,{part:'bell',at:[0,.4,.255],color:INK,mat:'matte'});k.torus(.014,.005,{part:'bell',at:[0,.485,.2],color:GOLD,mat:'gold'});
  // The beckoning paw (the working part): the arm, the paw and pink pads.
  k.capsule(.06,.14,{part:'armR',at:[.27,.58,.08],rot:upTo([.13,.24,.04]),color:white,mat:'soft'});
  k.sphere(.08,{part:'armR',at:[.33,.73,.1],color:white,mat:'soft'});
  k.sphere(.03,{part:'armR',at:[.33,.715,.172],scale:[1.15,.95,.4],color:pink,mat:'matte'});
  for(const dx of [-.032,0,.032])k.sphere(.013,{part:'armR',at:[.33+dx,.765-Math.abs(dx)*.4,.165],scale:[1,1,.45],color:pink,mat:'matte',seg:10});
  k.proxy('armR',.1,[.33,.72,.12]);
  // The left paw holding a gold koban coin (raised lines and a mark).
  rod(k,[-.18,.42,.08],[-.13,.27,.18],.055,{color:white,mat:'soft',seg:28});k.sphere(.062,{at:[-.12,.25,.2],color:white,mat:'soft'});
  k.sphere(1,{at:[-.05,.26,.255],rot:[-.18,0,.12],scale:[.085,.12,.022],color:GOLD,mat:'gold',seg:40});
  for(const dy of [-.05,-.025,0,.025,.05])k.box(.12-Math.abs(dy)*.9,.005,.006,{at:[-.05+dy*.12,.26+dy,.274-dy*.18],rot:[-.18,0,.12],color:k.shade(GOLD,.12),mat:'gold'});
  k.sphere(.02,{at:[-.05,.31,.268],rot:[-.18,0,.12],scale:[1,1.3,.4],color:k.shade(GOLD,-.12),mat:'gold',seg:12});
  // The lucky coin that pops up when she beckons.
  k.sphere(1,{part:'coin',at:[.4,.95,.12],scale:[.045,.062,.013],color:GOLD,mat:'gold',seg:32});k.extrude(starPts(.022,.01),.006,{part:'coin',at:[.4,.95,.134],color:'#fff2b8',mat:'gold',bevel:.002});
  k.lever('armR',{axis:'x',max:.75,label:'paw',hint:'Wave my paw',fires:{part:'coin',at:.6,hidden:true,lift:[0,.1,0],hold:1.1}});
  return {kind:{kind:'squish'},soft:{soft:.55},
   squeeze:['jiggle','wiggle:bell'],poke:{default:['blink','jiggle'],armR:['wave:armR'],bell:['wiggle:bell'],tail:['swish:tail']},tap:['wiggle:bell','nod'],head:'head',
   voice:{squeeze:['squish','pip'],poke:['purr'],tap:['ting','purr']}};
 },
 'origami-orin':(k)=>{
  const paper=k.c.body,cream='#fbf7ee',deep=k.shade(paper,-.18),pale=k.shade(paper,.1);
  k.part('wingL',{at:[-.035,.36,0]});k.part('wingR',{at:[.035,.36,0]});k.part('head',{at:[0,.56,.25]});k.part('star',{at:[.275,.07,.275]});
  // The masu box: cream paper with blue seigaiha waves round all four sides and fold creases on the lid.
  k.rbox(.5,.16,.5,.01,{at:[0,.08,0],color:cream,mat:'matte'});
  for(const s of [-1,1])k.box(.69,.003,.006,{at:[0,.161,0],rot:[0,s*PI/4,0],color:k.shade(cream,-.07),mat:'matte'});
  for(let side=0;side<4;side++){const yaw=side*PI/2,n=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),t=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
   for(let row=0;row<2;row++)for(let i=0;i<(row?5:6);i++){const u=-.2+i*.08+(row?.04:0),y=.03+row*.05;
    for(const [r,c] of [[.04,paper],[.026,pale]] as const){const p=n.clone().multiplyScalar(.2515).addScaledVector(t,u);k.torus(r,.0045,{at:[p.x,y,p.z],rot:[0,yaw,0],arc:PI,seg:12,color:c,mat:'matte'});}}}
  // The crane: a faceted paper diamond body, neck, tail, a round folded head with a beak.
  k.cone(.13,.12,{at:[0,.33,0],scale:[1,1,1.6],color:paper,mat:'matte',seg:4});
  k.cone(.13,.17,{at:[0,.185,0],rot:[PI,0,0],scale:[1,1,1.6],color:deep,mat:'matte',seg:4});
  const neck=(a:V3,b:V3,col:string)=>{const d:V3=[a[0]-b[0],a[1]-b[1],a[2]-b[2]];k.cone(.04,Math.hypot(...d),{at:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:upTo(d),scale:[1,1,.7],color:col,mat:'matte',seg:4});};
  neck([0,.56,.25],[0,.3,.17],paper);neck([0,.6,-.36],[0,.3,-.18],pale);
  k.sphere(.085,{part:'head',at:[0,.6,.26],color:paper,mat:'matte',seg:12});
  k.cone(.022,.08,{part:'head',at:[0,.565,.36],rot:[PI/2+.25,0,0],color:deep,mat:'matte',seg:4});
  face(k,'head',{x:0,y:.615,surf:sphSurf(.6,.086,.26),gap:.036,size:.021,mouth:'none'});
  // The wings: two triangles each (a fold crease between a lighter and a darker half), raised in a V.
  for(const s of [-1,1] as const){const p=s<0?'wingL':'wingR',lift=.5,rot=turns([[1,0,0],PI/2],[[0,0,1],s*lift]);
   k.extrude([[0,.21],[0,0],[s*.46,-.04]],.012,{part:p,at:[s*.035,.36,0],rot,color:pale,mat:'matte',bevel:.003});
   k.extrude([[0,0],[0,-.17],[s*.46,-.04]],.012,{part:p,at:[s*.035,.355,0],rot,color:paper,mat:'matte',bevel:.003});
   k.proxy(p,.1,[s*.26,.36+Math.sin(lift)*.23,0]);
   k.hinge(p,{axis:[0,0,s],max:1.0,detents:[.5],shut:.2,label:s<0?'left wing':'right wing',hint:'Fold my wings'});}
  // The lucky paper star on a little ball chain from the box corner.
  k.extrude(starPts(.045,.024),.026,{part:'star',at:[.275,.045,.275],rot:[0,PI/4,0],color:'#ff9ec4',mat:'matte',bevel:.009});
  k.torus(.01,.003,{part:'star',at:[.275,.094,.275],rot:[0,PI/4,0],color:'#d9c27a',mat:'gold'});
  k.chain({mode:'dangle',from:'body',at:[.275,.16,.275],length:.09,links:4,tag:'star',color:'#d9c27a'});
  return {kind:{kind:'mechanism'},
   squeeze:['flap:wingL+wingR'],poke:{default:['jiggle'],wingL:['flap:wingL'],wingR:['flap:wingR'],star:['wiggle:star']},tap:['glide','flap:wingL+wingR'],head:'head',
   voice:{squeeze:['flapflap'],poke:['rustle'],tap:['whoosh:1.2','flapflap']}};
 },
 'koinobori-koi':(k)=>{
  const blue=k.c.body,red=k.c.accent,pole='#f1e3c2',Y0=.72,MX=.04;
  k.part('wheel',{at:[0,1.02,0]});k.part('streamer',{at:[0,.95,0]});k.part('fish',{at:[0,Y0,0]});k.part('tail',{at:[MX+.42,Y0,0],parent:'fish'});k.part('fish2',{at:[0,.46,0]});
  // The garden stand: a lacquered wooden plinth with a moss top; the bamboo pole with node rings.
  k.lathe([[0,0],[.2,0],[.215,.02],[.2,.045],[.16,.055],[0,.055]],{color:'#9a5a32',mat:'vinyl',seg:48});
  k.sphere(1,{at:[0,.055,0],scale:[.17,.025,.17],color:'#6aa84f',mat:'soft',seg:36});
  k.cyl(.02,.022,1.0,{at:[0,.56,0],color:pole,mat:'vinyl',seg:20});for(const y of [.25,.45,.65,.85])k.torus(.022,.004,{at:[0,y,0],rot:[PI/2,0,0],color:k.shade(pole,-.15),mat:'vinyl'});
  k.sphere(.034,{at:[0,1.09,0],color:GOLD,mat:'gold'});
  // The arrow wheel (yaguruma) on top: eight spokes with feather tips round a gold hub.
  k.sphere(.022,{part:'wheel',at:[0,1.02,0],color:GOLD,mat:'gold'});
  for(let i=0;i<8;i++){const a=i*PI/4,d:V3=[0,Math.cos(a),Math.sin(a)];rod(k,[0,1.02,0],[0,1.02+d[1]*.085,d[2]*.085],.004,{part:'wheel',color:i%2?'#2a2a2e':'#c9ced6',mat:'vinyl',seg:6});
   k.box(.004,.03,.014,{part:'wheel',at:[.004,1.02+d[1]*.08,d[2]*.08],rot:[a,0,0],color:i%2?'#e94b3c':WHITE,mat:'matte'});}
  // The five-colour streamer (fukinagashi), each ribbon in gentle waves.
  const cols=['#2f6fd6',WHITE,'#e94b3c','#ffd447','#3d8f4f'];
  for(let j=0;j<5;j++)for(let i=0;i<4;i++){const x=.07+i*.1,z=Math.sin(i*1.4+j*.5)*.02,y=.985-j*.015-i*.012;k.box(.105,.016,.006,{part:'streamer',at:[x,y,z],rot:[0,Math.cos(i*1.4+j*.5)*.3,-.12],color:cols[j],mat:'matte'});}
  k.torus(.026,.006,{part:'streamer',at:[0,.985,0],rot:[PI/2,0,0],color:GOLD,mat:'gold'});
  // Kaito: a carp wind sock along +x (an open mouth ring at the pole, a hollow inside), scalloped scales, the big eyes.
  const prof:Pt[]=[[.11,0],[.128,.05],[.135,.13],[.122,.25],[.092,.35],[.066,.42]];
  const rz=turns([[0,0,1],-PI/2]);
  k.smoothLathe(prof,{part:'fish',at:[MX,Y0,0],rot:rz,color:blue,mat:'vinyl',seg:48});
  k.smoothLathe(prof.map(([r,h])=>[r-.008,h] as Pt).reverse(),{part:'fish',at:[MX,Y0,0],rot:rz,color:k.shade(blue,-.22),mat:'vinyl',seg:48});
  k.torus(.11,.014,{part:'fish',at:[MX,Y0,0],rot:[0,PI/2,0],color:WHITE,mat:'vinyl'});
  rod(k,[0,Y0+.11,0],[MX,Y0+.1,0],.005,{part:'fish',color:'#c9ced6',mat:'gold',seg:6});
  const rAt=(h:number)=>radiusAt(prof.map(([r,y])=>[r,y] as Pt),h);
  for(let row=0;row<4;row++)for(let i=0;i<12;i++){const h=.17+row*.055,ph=(i+(row%2)*.5)*PI/6,r=rAt(h)+.002,y=Y0+Math.cos(ph)*r,z=Math.sin(ph)*r;
   const n=new T.Vector3(.12,Math.cos(ph),Math.sin(ph));k.torus(.03,.0055,{part:'fish',at:[MX+h,y,z],rot:basis(n,new T.Vector3(-1,0,0)),arc:PI,seg:12,color:row%2?k.shade(blue,.22):WHITE,mat:'vinyl'});}
  k.part('eyes',{at:[MX+.09,Y0+.03,0],parent:'fish'});
  for(const s of [-1,1] as const){const n=s<0?'eyeL':'eyeR',r=rAt(.09),ez=Math.sqrt(r*r-.03*.03)*s;k.part(n,{at:[MX+.09,Y0+.03,ez],parent:'eyes'});
   const at=(d:number):V3=>[MX+.09,Y0+.03,ez+s*d];const rot:V3=[0,s>0?0:PI,0];
   k.sphere(.044,{part:n,at:at(-.008),rot,scale:[1,1,.3],color:WHITE,mat:'vinyl'});k.torus(.044,.005,{part:n,at:at(.002),rot,color:GOLD,mat:'gold'});
   k.sphere(.028,{part:n,at:at(-.002),rot,scale:[1,1,.35],color:'#2f6fd6',mat:'ink'});k.sphere(.017,{part:n,at:at(.003),rot,scale:[1,1,.4],color:INK,mat:'ink'});
   k.sphere(.0075,{part:n,at:[MX+.1,Y0+.042,ez+s*.011],rot,scale:[1,1,.5],color:WHITE,mat:'ink'});
   const mr=rAt(.035);k.torus(.016,.004,{part:'fish',arc:PI,at:[MX+.035,Y0-.035,s*(Math.sqrt(mr*mr-.035*.035)+.003)],rot:[0,s>0?0:PI,PI],color:INK,mat:'ink'});
   k.sphere(.018,{part:'fish',at:[MX+.115,Y0-.025,s*(Math.sqrt(rAt(.115)**2-.025*.025)-.002)],rot,scale:[1.3,.8,.3],color:BLUSH,mat:'matte'});
   k.extrude([[0,0],[.07,-.02],[.02,-.06]],.008,{part:'fish',at:[MX+.14,Y0-.1,s*.1],rot:[s*.5,0,0],color:red,mat:'matte',bevel:.002});}
  k.extrude([[0,0],[.13,.1],[.1,0],[.13,-.1]],.022,{part:'tail',at:[MX+.415,Y0,0],color:red,mat:'vinyl',bevel:.006});
  k.extrude([[.01,0],[.11,.07],[.09,0],[.11,-.07]],.024,{part:'tail',at:[MX+.415,Y0,0],color:WHITE,mat:'vinyl',bevel:.004});
  // The little red koi below him (a smaller sock, gold bands, white eyes).
  const p2:Pt[]=prof.map(([r,h])=>[r*.62,h*.7] as Pt);
  k.smoothLathe(p2,{part:'fish2',at:[MX,.46,0],rot:rz,color:red,mat:'vinyl',seg:40});k.smoothLathe(p2.map(([r,h])=>[r-.006,h] as Pt).reverse(),{part:'fish2',at:[MX,.46,0],rot:rz,color:k.shade(red,-.25),mat:'vinyl',seg:40});
  k.torus(.068,.01,{part:'fish2',at:[MX,.46,0],rot:[0,PI/2,0],color:WHITE,mat:'vinyl'});rod(k,[0,.46+.068,0],[MX,.46+.062,0],.004,{part:'fish2',color:'#c9ced6',mat:'gold',seg:6});
  for(const h of [.13,.2])k.torus(radiusAt(p2,h)+.002,.005,{part:'fish2',at:[MX+h,.46,0],rot:[0,PI/2,0],color:GOLD,mat:'gold'});
  for(const s of [-1,1]){const z=s*(radiusAt(p2,.06)-.004);k.sphere(.022,{part:'fish2',at:[MX+.06,.475,z],scale:[1,1,.35],color:WHITE,mat:'vinyl'});k.sphere(.012,{part:'fish2',at:[MX+.062,.475,z+s*.006],scale:[1,1,.4],color:INK,mat:'ink'});}
  k.extrude([[0,0],[.09,.065],[.07,0],[.09,-.065]],.016,{part:'fish2',at:[MX+.29,.46,0],color:WHITE,mat:'vinyl',bevel:.004});
  return {kind:{kind:'spintop'},flick:true,springs:[{part:'fish',k:30,c:1.4,amp:1.1},{part:'fish2',k:24,c:1.2,amp:1.3},{part:'streamer',k:20,c:1,amp:1.4},{part:'tail',k:40,c:1.6,amp:1.2}],
   squeeze:['swish:tail','wiggle:fish2'],poke:{default:['wiggle:fish'],tail:['swish:tail'],fish2:['wiggle:fish2'],streamer:['wiggle:streamer']},tap:['twirl','swish:tail'],head:'fish',
   voice:{squeeze:['whoosh'],poke:['flapflap:1.3'],tap:['whoosh','blip']}};
 },
 'ema-emi':(k)=>{
  const wood=k.c.body,roof=k.c.accent,grain=k.shade(wood,-.09),D=.055,FZ=D/2;
  k.part('flap',{at:[0,.395,FZ+.006]});k.part('feet',{at:[0,.05,0]});
  // The plaque: a house-shaped board, a dark wood roof on both slopes, grain front and back.
  k.extrude([[-.29,0],[.29,0],[.29,.4],[0,.56],[-.29,.4]],D,{at:[0,.15,0],color:wood,mat:'matte',bevel:.012});
  const ang=Math.atan2(.16,.29),L=Math.hypot(.29,.16)+.05;
  for(const s of [-1,1])k.rbox(L,.04,D+.03,.012,{at:[s*(.145+.018*Math.sin(ang)),.63+.018*Math.cos(ang),0],rot:[0,0,-s*ang],color:roof,mat:'vinyl'});
  const lines=[.18,.215,.26,.31,.345,.39];for(const z of [FZ+.0005,-FZ-.0005])for(const [i,y] of lines.entries())k.box(.5-(i%2)*.08,.0028,.0015,{at:[(i%3-1)*.02,y,z],color:grain,mat:'matte'});
  // The red-and-white cord through the top and the chain clasp.
  k.cyl(.012,.012,D+.004,{at:[0,.655,0],rot:[PI/2,0,0],color:k.shade(wood,-.35),mat:'matte',seg:16});
  k.torus(.04,.008,{at:[0,.7,0],color:'#e2452f',mat:'soft'});k.torus(.04,.0055,{at:[0,.7,.004],rot:[0,0,.35],color:WHITE,mat:'soft'});
  k.sphere(.016,{at:[0,.75,0],color:'#d9c27a',mat:'gold'});
  k.chain({mode:'hang',links:8,length:.26,at:[0,.765,0],color:'#d9c27a'});
  // Her face on the upper board.
  face(k,'body',{x:0,y:.5,surf:()=>FZ+.002,gap:.085,size:.036,mouth:'open'});
  // Under the flap: the wish, painted (a goal with the ball in the net and a gold star).
  const UZ=FZ+.001,pc='#fbf7ee';
  for(const x of [-.11,.11])k.box(.012,.12,.002,{at:[x,.26,UZ],color:pc,mat:'matte'});k.box(.234,.012,.002,{at:[0,.32,UZ],color:pc,mat:'matte'});
  for(let i=1;i<6;i++)k.box(.003,.11,.0015,{at:[-.11+i*.037,.265,UZ],color:'#c8b89a',mat:'matte'});for(let j=1;j<4;j++)k.box(.22,.003,.0015,{at:[0,.2+j*.03,UZ],color:'#c8b89a',mat:'matte'});
  k.cyl(.028,.028,.003,{at:[.03,.235,UZ+.001],rot:[PI/2,0,0],color:WHITE,mat:'vinyl',seg:24});k.cyl(.011,.011,.003,{at:[.03,.235,UZ+.002],rot:[PI/2,0,0],color:INK,mat:'ink',seg:5});
  k.extrude(starPts(.03,.013),.004,{at:[-.05,.36,UZ+.001],color:GOLD,mat:'gold',bevel:.001});
  // The flap (the working part): a lighter board with a painted football and two stars.
  k.rbox(.38,.21,.012,.012,{part:'flap',at:[0,.29,FZ+.008],color:k.shade(wood,.07),mat:'matte'});
  k.cyl(.07,.07,.004,{part:'flap',at:[0,.29,FZ+.0145],rot:[PI/2,0,0],color:WHITE,mat:'vinyl',seg:40});
  k.cyl(.024,.024,.004,{part:'flap',at:[0,.29,FZ+.0155],rot:[PI/2,0,0],color:INK,mat:'ink',seg:5});
  for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5;k.cyl(.016,.016,.004,{part:'flap',at:[Math.cos(a)*.055,.29+Math.sin(a)*.055,FZ+.0155],rot:[PI/2,0,a],color:INK,mat:'ink',seg:5});}
  for(const s of [-1,1])k.extrude(starPts(.022,.01),.004,{part:'flap',at:[s*.14,.35,FZ+.015],color:'#e2452f',mat:'vinyl',bevel:.001});
  k.sphere(.014,{part:'flap',at:[0,.2,FZ+.018],color:roof,mat:'vinyl'});
  k.proxy('flap',.1,[0,.29,FZ+.02]);
  k.hinge('flap',{axis:[-1,0,0],max:1.75,detents:[.9],label:'wish flap',hint:'Open my wish'});
  // The back: grain and a red shrine-seal circle.
  k.cyl(.055,.055,.003,{at:[0,.36,-FZ-.001],rot:[PI/2,0,0],color:'#d8342c',mat:'matte',seg:40});k.torus(.04,.004,{at:[0,.36,-FZ-.003],color:'#fbf7ee',mat:'matte'});
  k.cyl(.018,.018,.003,{at:[0,.36,-FZ-.003],rot:[PI/2,0,0],color:'#fbf7ee',mat:'matte',seg:24});
  // Little legs in tiny geta.
  for(const s of [-1,1]){const x=s*.1;k.capsule(.022,.07,{part:'feet',at:[x,.1,0],color:k.shade(wood,-.12),mat:'matte'});
   k.rbox(.1,.022,.16,.008,{part:'feet',at:[x,.042,.02],color:'#e8c48e',mat:'matte'});for(const z of [-.035,.07])k.box(.085,.032,.018,{part:'feet',at:[x,.016,z],color:k.shade('#e8c48e',-.15),mat:'matte'});
   k.torus(.03,.007,{part:'feet',arc:PI,at:[x,.053,.06],color:'#e2452f',mat:'soft'});}
  return {kind:{kind:'charm'},
   squeeze:['sway'],poke:{default:['wobble'],flap:['wiggle:flap'],feet:['hop']},tap:['twirl','sparkle'],head:{above:.45},
   voice:{squeeze:['creak'],poke:['knock'],tap:['hum','knock:1.3']}};
 },
 'torii-tomo':(k)=>{
  const red=k.c.body,black=k.c.accent,moss='#7cbf6a',stone='#a7a39b';
  secretCapsule(k,{top:'#fff6ee',topMat:'pearl',bot:'#f7d3cc',botMat:'pearl',rim:'#ffd447',mark:'#ffb7c5',markMat:'pearl',markPts:sakuraPts(.11)});
  for(const [n,at] of [['legL',[-.16,.46,0]],['legR',[.16,.46,0]],['armL',[-.16,.46,0]],['armR',[.16,.46,0]],['top',[0,.62,0]],['lantern',[.27,.05,-.14]]] as const)k.part(n,{at,parent:'inner'});
  // The shrine garden: a moss mound, gravel, stepping stones and fallen sakura petals.
  k.cyl(.36,.38,.05,{part:'inner',at:[0,.025,0],color:k.shade(moss,-.1),mat:'soft',seg:48});k.sphere(1,{part:'inner',at:[0,.05,0],scale:[.36,.012,.36],color:moss,mat:'soft',seg:40});
  for(const [x,z,r] of [[0,.24,.055],[-.06,.15,.045],[.03,.07,.04]] as const)k.blob(r,{part:'inner',at:[x,.058,z],scale:[1,.25,.8],amp:r*.12,freq:6,seed:x*9+3,color:stone,mat:'matte',seg:24});
  for(let i=0;i<14;i++){const a=i*2.4,rr=.12+((i*37)%10)/40;k.sphere(.014,{part:'inner',at:[Math.sin(a)*rr,.063,Math.cos(a)*rr*.95],rot:[0,a,0],scale:[1,.25,.7],color:i%3?'#ffc0cf':'#ffe1e8',mat:'matte',seg:10});}
  // The pillars (legs) with black base caps, the tie beam with its ends as little arms.
  for(const s of [-1,1] as const){const p=s<0?'legL':'legR',x=s*.16;k.cyl(.038,.045,.5,{part:p,at:[x,.35,0],color:red,mat:'vinyl',seg:32});
   k.cyl(.054,.056,.06,{part:p,at:[x,.08,0],color:black,mat:'vinyl',seg:32});k.torus(.05,.006,{part:p,at:[x,.11,0],rot:[PI/2,0,0],color:GOLD,mat:'gold'});
   const a=s<0?'armL':'armR';k.rbox(.17,.044,.05,.018,{part:a,at:[s*.255,.46,0],color:red,mat:'vinyl'});k.rbox(.014,.048,.054,.005,{part:a,at:[s*.337,.46,0],color:black,mat:'vinyl'});}
  k.box(.3,.044,.05,{part:'inner',at:[0,.46,0],color:red,mat:'vinyl'});
  // The name plaque between the beams is his face (a black frame with a gold edge).
  k.rbox(.19,.17,.03,.012,{part:'inner',at:[0,.552,.014],color:black,mat:'vinyl'});k.rbox(.155,.135,.032,.01,{part:'inner',at:[0,.552,.016],color:'#fff3dc',mat:'vinyl'});
  k.torus(1,.06,{part:'inner',at:[0,.552,.032],scale:[.085,.076,.08],seg:40,color:GOLD,mat:'gold'});
  face(k,'inner',{x:0,y:.566,surf:()=>.0325,gap:.038,size:.022,mouth:'smile',prefix:'in'});
  // The top: the red shimaki beam and the black kasagi with upturned ends.
  k.rbox(.46,.04,.062,.014,{part:'top',at:[0,.645,0],color:red,mat:'vinyl'});
  k.rbox(.44,.046,.084,.016,{part:'top',at:[0,.69,0],color:black,mat:'vinyl'});
  for(const s of [-1,1])k.rbox(.14,.042,.084,.016,{part:'top',at:[s*.275,.705,0],rot:[0,0,s*.2],color:black,mat:'vinyl'});
  k.rbox(.62,.008,.07,.004,{part:'top',at:[0,.668,0],color:k.shade(red,-.2),mat:'matte'});
  // The stone lantern (the extra part).
  const L=(y:number)=>y+.05;
  k.cyl(.045,.05,.02,{part:'lantern',at:[.27,L(.01),-.14],color:stone,mat:'matte',seg:6});k.cyl(.016,.02,.08,{part:'lantern',at:[.27,L(.06),-.14],color:stone,mat:'matte',seg:12});
  k.cyl(.04,.035,.015,{part:'lantern',at:[.27,L(.105),-.14],color:stone,mat:'matte',seg:6});k.rbox(.055,.05,.055,.008,{part:'lantern',at:[.27,L(.138),-.14],color:k.shade(stone,.06),mat:'matte'});
  k.box(.03,.026,.058,{part:'lantern',at:[.27,L(.138),-.14],color:'#ffe08a',mat:'jelly'});k.box(.058,.026,.03,{part:'lantern',at:[.27,L(.138),-.14],color:'#ffe08a',mat:'jelly'});
  k.cone(.06,.04,{part:'lantern',at:[.27,L(.183),-.14],color:k.shade(stone,-.08),mat:'matte',seg:6});k.sphere(.012,{part:'lantern',at:[.27,L(.21),-.14],color:stone,mat:'matte'});
  // Poses: a welcome bow, a wave, the star, and a hooray.
  k.pose('bow',{top:{rot:[.32,0,0]},armL:{rot:[0,0,.7]},armR:{rot:[0,0,-.7]}},{label:'Welcome bow',grab:['top']});
  k.pose('wave',{armR:{rot:[0,0,1.35]},top:{rot:[0,0,-.1]}},{label:'Wave',grab:['armR']});
  k.pose('star',{armL:{rot:[0,0,-.9]},armR:{rot:[0,0,.9]},legL:{rot:[0,0,-.22]},legR:{rot:[0,0,.22]}},{label:'Star',grab:['legL','legR','armL']});
  k.pose('victory',{armL:{rot:[0,0,-1.4]},armR:{rot:[0,0,1.4]},top:{rot:[0,0,.12]}},{label:'Hooray',grab:['top']});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['glow'],poke:{default:['blink:ineyes','glow'],lantern:['glow']},tap:['petal','glow'],head:{above:.6},
   voice:{squeeze:['lowbell:1.2'],poke:['hum:.8'],tap:['lowbell','breeze']}};
 },
};
export default set;
