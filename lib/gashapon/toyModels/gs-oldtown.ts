/**
 * Trophies & Legends (gs-oldtown), rebuilt for round 3B batch 3 (Nov 9 2026; docs/gashapon-design.md "Round 3B"): cups, medals
 * and matchday from the machine by the Old Town Ground. HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Cup Captain    take-apart: the ribbons come off the handle, then the lid and the two handles of a polished gold cup on
 *                  a lacquered plinth; a tiny ball waits inside the bowl (bonus: the name plate flips down to show the winners)
 *   Medal Milo     a charm: a gold winner's medal (laurel wreath, a star on the back) on a striped ribbon and a ball chain;
 *                  flick it and it spins on the chain (bonus spinner)
 *   Whistle Wyn    working parts: a chrome pea whistle; press the mouthpiece and the cork pea jumps in the slot (bonus: the
 *                  referee's yellow and red cards dangle from his ring on a ball chain)
 *   Scarf Skye     a squishy knitted supporters' scarf wound in three striped rolls, a name band for her face (bonus: the
 *                  tasselled ends swing like charms)
 *   TV Ball Tico   a spinner: the 1970 black-and-white 32-panel TV ball (12 black pentagons), rabbit-ear antenna (bonus
 *                  take-apart not in the runtime yet: his antenna and panels react instead)
 *   Stadium Stan   the rare: a gold secret capsule; inside, the Old Town Ground (stands, crowd, mown pitch, goals, four
 *                  floodlights and a tiny trophy, the extra part); pull the switch and the floodlight beams come on (bonus)
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
 */
import * as T from 'three';
import type {Finish,ToyKit,ToyModelSet,V3} from '../toyKit';

const PI=Math.PI,INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0',MOUTH='#7a2630',TONGUE='#ff7f96',GRASS='#5fb34a';
type Pt=readonly [number,number];
type Surf=(x:number,y:number)=>number;
const sphSurf=(cy:number,R:number):Surf=>(x,y)=>Math.sqrt(Math.max(0,R*R-x*x-(y-cy)**2));
/** Euler angles (XYZ) for "tilt about x, then turn about y". */
function yawPitch(yaw:number,pitch:number,roll=0):V3{const q=new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,roll,'YXZ'));const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
/** Euler angles that turn +y onto the direction d. */
function upTo(d:V3):V3{const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...d).normalize());const e=new T.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z];}
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
/** Piecewise-linear radius of a turned profile at height y. */
const radiusAt=(pts:readonly Pt[],y:number)=>{for(let i=0;i<pts.length-1;i++){const [r0,y0]=pts[i],[r1,y1]=pts[i+1];if(y>=Math.min(y0,y1)&&y<=Math.max(y0,y1))return r0+(r1-r0)*(y-y0)/((y1-y0)||1);}return 0;};

const set:ToyModelSet={
 'cup-captain':(k)=>{
  const gold=k.c.body,lacquer='#22303a',green='#3d8f4f';
  k.part('lid',{at:[0,.8,0]});k.part('handleL',{at:[-.32,.62,0]});k.part('handleR',{at:[.32,.62,0]});k.part('ribbon',{at:[.41,.66,.03]});k.part('plate',{at:[0,.088,.222]});
  // A lacquered two-step plinth with gold trims; the engraved name plate (the working part) and the winners' names under it.
  k.rbox(.52,.06,.52,.02,{at:[0,.03,0],color:lacquer,mat:'vinyl'});k.rbox(.44,.16,.44,.03,{at:[0,.14,0],color:lacquer,mat:'vinyl'});
  for(const y of [.062,.216])k.rbox(y<.1?.5:.45,.012,y<.1?.5:.45,.006,{at:[0,y,0],color:gold,mat:'gold'});
  for(let i=0;i<3;i++)k.box(.15-i*.03,.008,.004,{at:[0,.165-i*.025,.2215],color:'#c9b37a',mat:'matte'});
  k.extrude(starPts(.018,.008),.004,{at:[-.1,.165,.2215],color:gold,mat:'gold',bevel:.001});
  k.rbox(.26,.1,.012,.01,{part:'plate',at:[0,.14,.228],color:k.shade(gold,.06),mat:'gold'});
  for(const [w,y] of [[.17,.155],[.11,.125]] as const)k.box(w,.01,.004,{part:'plate',at:[0,y,.235],color:'#7a6320',mat:'matte'});
  k.proxy('plate',.09,[0,.14,.23]);
  k.hinge('plate',{axis:'x',max:1.45,detents:[.7],label:'name plate',hint:'Flip my plate'});
  // The stem with a knop, the polished bowl (a hollow shell) and a bead ring.
  k.lathe([[.15,.22],[.15,.235],[.12,.25],[.06,.27],[.045,.3],[.045,.33]],{color:gold,mat:'gold',seg:40});
  k.sphere(.062,{at:[0,.355,0],scale:[1,.8,1],color:gold,mat:'gold'});
  k.lathe([[.045,.37],[.05,.4],[.09,.43],[.14,.45]],{color:gold,mat:'gold',seg:40});
  const bowl:Pt[]=[[0,.42],[.12,.43],[.2,.48],[.25,.58],[.27,.7],[.28,.78]];
  k.smoothLathe(bowl,{color:gold,mat:'gold',seg:56});k.smoothLathe([[.265,.78],[.255,.7],[.23,.62],[.12,.57],[0,.56]],{color:k.shade(gold,-.12),mat:'gold',seg:56});
  k.torus(.28,.014,{at:[0,.785,0],rot:[PI/2,0,0],color:gold,mat:'gold'});k.torus(.2,.012,{at:[0,.48,0],rot:[PI/2,0,0],color:k.shade(gold,.08),mat:'gold'});
  football(k,'body',[0,.625,0],.065);// a tiny match ball waits in the bowl
  face(k,'body',{x:0,y:.63,surf:(x,y)=>Math.sqrt(Math.max(0,radiusAt(bowl,y)**2-x*x))+.006,gap:.09,size:.044,mouth:'open'});
  // The lid with a finial.
  k.smoothLathe([[.29,.79],[.275,.81],[.2,.86],[.1,.9],[.04,.93],[.03,.96]],{part:'lid',color:gold,mat:'gold',seg:48});
  k.sphere(.045,{part:'lid',at:[0,.995,0],color:k.shade(gold,.08),mat:'gold'});k.torus(.032,.008,{part:'lid',at:[0,.96,0],rot:[PI/2,0,0],color:gold,mat:'gold'});
  // Two big loving-cup handles with scroll ends.
  for(const s of [-1,1] as const){const p=s<0?'handleL':'handleR';
   k.tube([[s*.262,.74,0],[s*.36,.76,0],[s*.415,.68,0],[s*.39,.57,0],[s*.29,.5,0],[s*.215,.49,0]],.024,{part:p,color:gold,mat:'gold'});
   k.sphere(.03,{part:p,at:[s*.37,.765,0],color:k.shade(gold,.06),mat:'gold'});}
  // Team ribbons tied on the right handle: a bow and two striped tails.
  for(const s of [-1,1]){k.torus(.035,.011,{part:'ribbon',at:[.41+s*.035,.68,.035],rot:[0,0,s*.6],color:green,mat:'soft'});
   k.rbox(.045,.2,.01,.008,{part:'ribbon',at:[.41+s*.02,.57,.035],rot:[0,0,s*.12],color:green,mat:'soft'});k.box(.014,.19,.012,{part:'ribbon',at:[.41+s*.02,.57,.036],rot:[0,0,s*.12],color:WHITE,mat:'soft'});}
  k.sphere(.022,{part:'ribbon',at:[.41,.67,.04],color:k.shade(green,-.05),mat:'soft'});
  return {kind:{kind:'puzzle',pieces:[{part:'ribbon',name:'the ribbons'},{part:'lid',name:'the lid'},{part:'handleR',name:'the right handle',after:['ribbon']},{part:'handleL',name:'the left handle'}]},
   squeeze:['wiggle:handleL+handleR'],poke:{default:['d_ring'],handleL:['wiggle:handleL'],handleR:['wiggle:handleR'],ribbon:['wiggle:ribbon'],lid:['pop:lid']},tap:['d_lift','sparkle'],head:'lid',
   voice:{squeeze:['ting:.9','d_hooray'],poke:['ting','ting:1.2'],tap:['ting','d_hooray']}};
 },
 'medal-milo':(k)=>{
  const gold=k.c.body,green=k.c.accent,CY=.4,R=.22;
  // The medal: a thick gold disc with a raised rim, a laurel wreath and Milo's face; a star on the back.
  k.cyl(R,R,.05,{at:[0,CY,0],rot:[PI/2,0,0],color:gold,mat:'gold',seg:56});k.torus(R-.008,.024,{at:[0,CY,0],color:k.shade(gold,.06),mat:'gold'});
  for(const s of [-1,1])for(let i=0;i<7;i++){const a=-PI/2+s*(.35+i*.33),x=Math.cos(a)*.165,y=CY+Math.sin(a)*.165;
   k.sphere(1,{at:[x,y,.027],rot:[0,0,a+s*PI/2+s*.5],scale:[.016,.036,.009],color:k.shade(gold,.12),mat:'gold',seg:14});}
  face(k,'body',{x:0,y:CY+.03,surf:()=>.027,gap:.075,size:.042,mouth:'open'});
  k.extrude(starPts(.1,.045),.012,{at:[0,CY,-.03],rot:[0,PI,0],color:k.shade(gold,.1),mat:'gold',bevel:.003});
  k.torus(.15,.006,{at:[0,CY,-.026],color:k.shade(gold,-.15),mat:'gold'});
  // The bail, the striped ribbon (green, white stripe) and a gold clasp the ball chain holds.
  k.torus(.032,.011,{at:[0,CY+R+.03,0],rot:[0,PI/2,0],color:gold,mat:'gold'});
  for(const s of [-1,1]){k.rbox(.075,.16,.012,.006,{at:[s*.042,CY+R+.12,0],rot:[0,0,-s*.28],color:green,mat:'soft'});k.box(.02,.16,.014,{at:[s*.042,CY+R+.12,.0],rot:[0,0,-s*.28],color:WHITE,mat:'soft'});}
  k.rbox(.2,.035,.03,.012,{at:[0,CY+R+.205,0],color:gold,mat:'gold'});
  k.chain({mode:'hang',links:8,length:.28,at:[0,CY+R+.225,0],color:'#d9c27a'});
  boots(k,{xs:[-.07,.07],top:CY-R+.03,z:.0,leg:gold,boot:green});
  return {kind:{kind:'charm'},flick:true,
   squeeze:['glow'],poke:{default:['wobble'],feet:['hop']},tap:['glow','sparkle'],head:{above:CY+.1},
   voice:{squeeze:['clink','whoosh:1.6'],poke:['whoosh:1.8','clink:1.2'],tap:['sparkle','ting:1.3']}};
 },
 'whistle-wyn':(k)=>{
  const chrome=k.c.body,ref=k.c.accent,CY=.32,R=.22;
  k.part('mouth',{at:[.22,.49,0]});k.part('pea',{at:[-.02,.5,0]});k.part('cards',{at:[-.29,.34,0]});k.part('armL',{at:[-.2,.28,.02]});k.part('armR',{at:[.2,.28,.02]});
  // The chrome barrel (a flat drum), bevelled rims, the air slot on top and the cork pea inside it.
  k.cyl(R,R,.2,{at:[0,CY,0],rot:[PI/2,0,0],color:chrome,mat:'gold',seg:56});
  for(const z of [-.1,.1])k.torus(R-.004,.016,{at:[0,CY,z],color:k.shade(chrome,.08),mat:'gold'});
  k.box(.1,.014,.13,{at:[-.02,CY+R-.004,0],color:INK,mat:'matte'});
  // A painted pale face disc on the front (the chrome stays on the rims and the back).
  k.cyl(.19,.19,.006,{at:[0,CY,.1],rot:[PI/2,0,0],color:'#eef1f5',mat:'vinyl',seg:48});
  k.sphere(.045,{part:'pea',at:[-.02,.5,0],color:'#e0a060',mat:'matte'});
  // The mouthpiece (the working part: press it and the pea jumps), with its opening.
  k.rbox(.3,.1,.15,.03,{part:'mouth',at:[.22,.49,0],color:chrome,mat:'gold'});k.rbox(.012,.045,.1,.006,{part:'mouth',at:[.372,.49,0],color:INK,mat:'matte'});
  k.proxy('mouth',.1,[.3,.49,0]);
  k.slider('mouth',{axis:[-1,0,0],max:.05,release:'return',label:'mouthpiece',hint:'Blow me',fires:{part:'pea',at:.6,lift:[0,.14,0],hold:.4}});
  face(k,'body',{x:0,y:CY+.03,surf:()=>.103+.004,gap:.085,size:.045,mouth:'o',brows:ref});
  // The back: an engraved ring and a star.
  k.torus(.13,.006,{at:[0,CY,-.104],color:k.shade(chrome,-.25),mat:'gold'});k.extrude(starPts(.07,.03),.008,{at:[0,CY,-.104],rot:[0,PI,0],color:k.shade(chrome,.1),mat:'gold',bevel:.002});
  // The lanyard ring, with the yellow and red cards on a short ball chain (the charm).
  k.torus(.055,.015,{at:[-.24,.49,0],color:chrome,mat:'gold'});
  k.rbox(.085,.12,.008,.01,{part:'cards',at:[-.31,.27,.006],rot:[0,0,.18],color:'#ffd21f',mat:'vinyl'});k.rbox(.085,.12,.008,.01,{part:'cards',at:[-.27,.27,-.006],rot:[0,0,-.2],color:'#e8322c',mat:'vinyl'});
  k.torus(.012,.004,{part:'cards',at:[-.29,.335,0],color:'#c9ced6',mat:'gold'});
  k.chain({mode:'dangle',from:'body',at:[-.29,.46,0],length:.12,links:4,tag:'cards',color:'#c9ced6'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.026,.08,{part:p,at:[s*.26,.24,.03],rot:[0,0,s*.7],color:ref,mat:'soft'});k.sphere(.034,{part:p,at:[s*.3,.2,.04],color:WHITE,mat:'vinyl'});}
  boots(k,{xs:[-.08,.08],top:.14,z:.0,leg:ref,boot:ref,sock:ref});
  return {kind:{kind:'mechanism'},
   squeeze:['stretchsnap','puff'],poke:{default:['rattle:pea','jiggle'],pea:['rattle:pea'],cards:['wiggle:cards'],armL:['wave:armL'],armR:['wave:armR']},tap:['d_toot:mouth','puff'],head:{above:.4},
   voice:{squeeze:['d_whistle'],poke:['tok:1.7','tok:2','tok:1.8'],tap:['d_fulltime']}};
 },
 'scarf-skye':(k)=>{
  const green=k.c.body,white=k.c.accent;
  k.part('endL',{at:[-.19,.44,.27]});k.part('endR',{at:[.06,.6,0]});
  // Three knitted rolls, each made of arcs: the stripes run across the scarf, so they wrap round each roll.
  const roll=(R:number,t:number,y:number,col:(a:number)=>string,n:number)=>{const da=PI*2/n;for(let i=0;i<n;i++){const a=i*da;k.torus(R,t,{at:[0,y,0],rot:[PI/2,0,a],arc:da+.004,seg:6,color:col(a+da/2),mat:'soft'});}};
  roll(.2,.1,.1,a=>Math.floor(a/(PI/7))%2?white:green,14);
  const front=(a:number)=>Math.abs(a-PI/2)<.95;
  roll(.19,.13,.32,a=>front(a)?white:(Math.floor(a/(PI/6))%3===0?white:green),24);
  roll(.14,.09,.53,a=>Math.floor(a/(PI/6))%2?green:white,12);
  // Her face on the name band of the middle roll.
  const tor=(R:number,t:number,yc:number):Surf=>(x,y)=>{const d=t*t-(y-yc)**2;if(d<0)return 0;const rho=R+Math.sqrt(d);return Math.sqrt(Math.max(0,rho*rho-x*x));};
  face(k,'body',{x:0,y:.35,surf:(x,y)=>tor(.19,.13,.32)(x,y)+.003,gap:.085,size:.045,mouth:'open',blush:'#ff8fa0'});
  // The two ends: striped strips with tassels. The left one hangs down the front, the right one pokes out of the top and flops over.
  const surfAt=(x:number,y:number)=>Math.max(tor(.2,.1,.1)(x,y),tor(.19,.13,.32)(x,y),tor(.14,.09,.53)(x,y));
  const strip=(part:string,pts:V3[],tas:boolean)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],m:V3=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d);
    k.rbox(.11,L+.012,.026,.01,{part,at:m,rot:upTo(d),color:i%2?white:green,mat:'soft'});}
   if(tas){const e=pts[pts.length-1];for(let j=0;j<5;j++)k.capsule(.007,.035,{part,at:[e[0]-.044+j*.022,e[1]-.026,e[2]],color:j%2?white:green,mat:'soft'});}};
  const left:V3[]=[];for(let i=0;i<6;i++){const y=.44-i*.07,x=-.19-i*.004;left.push([x,y,surfAt(x,y)+.018]);}
  strip('endL',left,true);
  strip('endR',[[.05,.56,0],[.08,.66,-.01],[.15,.71,-.03],[.23,.67,-.06],[.27,.6,-.08],[.28,.53,-.09]],true);
  return {kind:{kind:'squish'},soft:{soft:.6},springs:[{part:'endL',k:24,c:1.3,amp:1.3},{part:'endR',k:30,c:1.5,amp:1.2}],
   squeeze:['twirl'],poke:{default:['wave:endL+endR'],endL:['wave:endL'],endR:['wave:endR']},tap:['d_chant','sway'],head:{above:.5},
   voice:{squeeze:['whoosh:1.2'],poke:['whoosh:1.5'],tap:['d_lala']}};
 },
 'tv-ball-tico':(k)=>{
  const {body,accent}=k.c,CY=.42,R=.28;
  k.part('antenna',{at:[0,CY+R-.01,0]});
  // The 1970 TV ball: 20 white hexagons and 12 black pentagons, one hexagon facing front for his face.
  k.sphere(R,{at:[0,CY,0],color:body,mat:'vinyl',seg:56});
  const phi=(1+Math.sqrt(5))/2,ico=[[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]].map(p=>new T.Vector3(...p).normalize());
  const c=new T.Vector3().add(ico[0]).add(ico[1]).add(ico[8]).normalize(),q=new T.Quaternion().setFromUnitVectors(c,new T.Vector3(0,0,1)),tilt=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),.3);
  const vs=ico.map(p=>p.clone().applyQuaternion(q).applyQuaternion(tilt)),up=new T.Vector3(0,1,0),fz=new T.Vector3(0,0,1);
  for(const n of vs){const near=vs.filter(m=>m!==n).sort((a,b)=>b.dot(n)-a.dot(n))[0],qa=new T.Quaternion().setFromUnitVectors(up,n),t0=fz.clone().applyQuaternion(qa);
   const want=near.clone().sub(n.clone().multiplyScalar(near.dot(n))).normalize(),ang=Math.atan2(n.dot(t0.clone().cross(want)),t0.dot(want)),qf=new T.Quaternion().setFromAxisAngle(n,ang).multiply(qa),e=new T.Euler().setFromQuaternion(qf,'XYZ');
   k.cyl(R*.34,R*.34,.02,{at:[n.x*R*.975,CY+n.y*R*.975,n.z*R*.975],rot:[e.x,e.y,e.z],color:accent,mat:'vinyl',seg:5});}
  face(k,'body',{x:0,y:CY+.02,surf:sphSurf(CY,R+.004),gap:.075,size:.042,mouth:'open',blush:false});
  // Rabbit-ear antenna on top (it bobbles), little boots.
  k.sphere(.05,{part:'antenna',at:[0,CY+R-.005,0],scale:[1,.55,1],color:'#5a5f6a',mat:'vinyl'});
  for(const s of [-1,1]){k.cyl(.007,.007,.26,{part:'antenna',at:[s*.06,CY+R+.115,0],rot:[0,0,-s*.45],color:'#c9ced6',mat:'gold',seg:8});k.sphere(.019,{part:'antenna',at:[s*.12,CY+R+.235,0],color:'#e94b3c',mat:'vinyl'});}
  boots(k,{xs:[-.09,.09],top:CY-R+.05,z:.0,leg:accent,boot:accent,sock:body});
  return {kind:{kind:'spintop'},springs:[{part:'antenna',k:45,c:2,amp:1.4}],
   squeeze:['bounce'],poke:{default:['bounce'],antenna:['wiggle:antenna'],feet:['hop']},tap:['d_tvflicker','wiggle:antenna'],head:{above:.62},
   voice:{squeeze:['d_crackle','roll'],poke:['boing:.8','tok'],tap:['d_crackle','d_crackle:1.3']}};
 },
 'stadium-stan':(k)=>{
  const {body,accent}=k.c,SX=1.1,SZ=.88,stand=accent,crowd=['#3d8f4f','#ffffff','#e94b3c','#2f6fd6','#ffd447','#3d8f4f','#ffffff'],skin=['#f1c9a5','#c98a5e','#8a5a3c','#f6d7b8'];
  secretCapsule(k,{top:'#e8b92e',topMat:'gold',bot:body,botMat:'vinyl',rim:'#ffd447',mark:'#fff4dc',markMat:'pearl'});
  k.part('pitch',{at:[0,.06,0],parent:'inner'});k.part('beams',{at:[0,.3,0],parent:'inner'});k.part('switch',{at:[.3,.16,.31],parent:'inner'});k.part('cup',{at:[0,.075,0],parent:'inner'});
  // The ground: a concrete apron, the stands (one turned ring), a green roof rim.
  k.cyl(.46,.46,.05,{part:'inner',at:[0,.025,0],scale:[1.02,1,.86],color:'#b9b4a6',mat:'matte',seg:48});
  k.lathe([[.44,.05],[.44,.3],[.41,.32]],{part:'inner',scale:[SX,1,SZ],color:stand,mat:'matte',seg:56});k.lathe([[.41,.32],[.3,.12],[.29,.08],[.31,.05]],{part:'inner',scale:[SX,1,SZ],color:k.shade(body,-.05),mat:'matte',seg:56});
  for(const [r,y] of [[.33,.16],[.365,.215],[.4,.27]] as const)k.torus(r,.004,{part:'inner',at:[0,y,0],rot:[PI/2,0,0],scale:[SX,SZ,1],seg:48,color:k.shade(body,.15),mat:'matte'});
  k.torus(.43,.02,{part:'inner',at:[0,.315,0],rot:[PI/2,0,0],scale:[SX,SZ,1],color:body,mat:'vinyl'});
  // The pitch: mown stripes, lines, a centre circle and two goals.
  k.cyl(.26,.26,.02,{part:'pitch',at:[0,.06,0],scale:[1.15,1,.8],color:GRASS,mat:'soft',seg:40});
  for(let i=-2;i<=2;i+=2)k.box(.06,.003,.3,{part:'pitch',at:[i*.06,.071,0],color:k.shade(GRASS,.07),mat:'soft'});
  k.box(.006,.004,.3,{part:'pitch',at:[0,.072,0],color:WHITE,mat:'matte'});k.torus(.05,.004,{part:'pitch',at:[0,.072,0],rot:[PI/2,0,0],color:WHITE,mat:'matte'});
  for(const s of [-1,1]){k.box(.006,.004,.3,{part:'pitch',at:[s*.24,.072,0],color:WHITE,mat:'matte'});
   for(const z of [-.04,.04])k.cyl(.004,.004,.04,{part:'pitch',at:[s*.245,.09,z],color:WHITE,mat:'vinyl',seg:6});k.cyl(.004,.004,.084,{part:'pitch',at:[s*.245,.11,0],rot:[PI/2,0,0],color:WHITE,mat:'vinyl',seg:6});}
  for(const z of [-.15,.15])k.box(.49,.004,.006,{part:'pitch',at:[0,.072,z],color:WHITE,mat:'matte'});
  // The tiny trophy on the centre spot (the extra part).
  k.cyl(.012,.018,.02,{part:'cup',at:[0,.082,0],color:'#e8b92e',mat:'gold',seg:12});k.cyl(.005,.005,.02,{part:'cup',at:[0,.1,0],color:'#e8b92e',mat:'gold',seg:8});
  k.lathe([[.006,.11],[.022,.12],[.026,.145]],{part:'cup',color:'#e8b92e',mat:'gold',seg:16});for(const s of [-1,1])k.torus(.01,.003,{part:'cup',at:[s*.026,.13,0],rot:[0,0,0],color:'#e8b92e',mat:'gold'});
  // The crowd: four blocks on the stand slope (a wave runs through them), scarves held high.
  for(let b=0;b<4;b++){const p='crowd'+(b+1);k.part(p,{at:[0,.2,0],parent:'inner'});const mid=b*PI/2;
   for(let row=0;row<2;row++)for(let i=0;i<7;i++){const a=mid-.62+i*.207+(row?.1:0),rr=.335+row*.055,y=.16+row*.075,x=Math.cos(a)*rr*SX,z=Math.sin(a)*rr*SZ;
    k.cyl(.016,.02,.045,{part:p,at:[x,y+.024,z],color:crowd[(i+b*3+row)%crowd.length],mat:'vinyl',seg:8});
    k.sphere(.019,{part:p,at:[x,y+.064,z],color:skin[(i+row+b)%skin.length],mat:'vinyl',seg:9});}}
  // Four floodlight towers, their lamp heads aimed at the pitch, and the beams (hidden until the switch).
  for(const [x,z] of [[-.42,-.28],[.42,-.28],[-.42,.28],[.42,.28]] as const){const yaw=Math.atan2(-x,-z);
   k.cyl(.012,.016,.52,{part:'inner',at:[x,.31,z],color:'#c9cdd4',mat:'gold',seg:10});
   k.rbox(.11,.075,.03,.012,{part:'inner',at:[x,.6,z],rot:yawPitch(yaw,.5),color:'#5a5f6a',mat:'vinyl'});
   const n=new T.Vector3(0,0,1).applyEuler(new T.Euler(...yawPitch(yaw,.5)));k.rbox(.09,.055,.01,.01,{part:'inner',at:[x+n.x*.016,.6+n.y*.016,z+n.z*.016],rot:yawPitch(yaw,.5),color:'#fff6c8',mat:'ink'});
   const from=new T.Vector3(x+n.x*.03,.6+n.y*.03,z+n.z*.03),to=new T.Vector3(x*.25,.075,z*.25),d=from.clone().sub(to),L=d.length(),m=from.clone().add(to).multiplyScalar(.5);
   k.cone(.09,L,{part:'beams',at:[m.x,m.y,m.z],rot:upTo([d.x,d.y,d.z]),color:'#fff3b0',mat:'clear',seg:20});}
  face(k,'inner',{x:0,y:.19,surf:x=>SZ*Math.sqrt(Math.max(0,.44**2-(x/SX)**2))+.004,gap:.12,size:.05,mouth:'open',prefix:'in'});
  // The floodlight switch on the front-right wall (the working part).
  k.rbox(.07,.07,.02,.01,{part:'inner',at:[.3,.16,.31],rot:[0,.75,0],color:'#5a5f6a',mat:'vinyl'});
  k.capsule(.012,.07,{part:'switch',at:[.3,.2,.33],color:'#c9cdd4',mat:'gold'});k.sphere(.024,{part:'switch',at:[.3,.25,.33],color:'#e94b3c',mat:'vinyl'});
  k.proxy('switch',.08,[.3,.21,.33]);
  k.lever('switch',{axis:'x',max:.9,label:'floodlight switch',hint:'Lights on',fires:{part:'beams',at:.7,hidden:true,hold:2.2}});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['d_rip1:crowd1','d_rip2:crowd2','d_rip3:crowd3','d_rip4:crowd4'],
   poke:{default:['d_rip1:crowd1','d_rip2:crowd2','d_rip3:crowd3','d_rip4:crowd4'],crowd1:['d_rip1:crowd1'],crowd2:['d_rip1:crowd2'],crowd3:['d_rip1:crowd3'],crowd4:['d_rip1:crowd4'],cup:['pop:cup']},
   tap:['pop:cup','glow','sparkle'],head:{above:.45},
   voice:{squeeze:['d_roar'],poke:['blip:.8','blip:.8'],tap:['d_whistle','crowd']}};
 },
};
export default set;
