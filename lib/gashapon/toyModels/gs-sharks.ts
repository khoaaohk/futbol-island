/**
 * Reef Friends (gs-sharks), rebuilt for round 3B/3C batch 2 (Nov 9 2026; docs/gashapon-design.md "Round 3B" and "Round 3C"): sea
 * life from the island waters, from the machine on the Sharks Beach sand. HD kit, each toy plays its planned KIND
 * (lib/gashapon/toyKinds.ts):
 *   Reef Shark Remi  a wind-up: an upright chibi reef shark (white belly, gill slits, a friendly grin with rounded teeth, white-
 *                    rimmed eyes) with a gold key on his back; wind him and his fins paddle as he walks (bonus: tail and dorsal
 *                    fin bobble)
 *   Clownfish Coco   a squishy clownfish (three white bands edged in black, black-edged fins) in her anemone, whose tentacles
 *                    sway (bonus charm: a pearl scallop on a ball chain from her tail, like a bag-charm squishy)
 *   Octo Otto        a jelly octopus: a spotted translucent mantle (spots all round, so his back is decent too), six arms curling
 *                    over the sand with suckers, two arms up juggling balls (bonus squish)
 *   Manta Maya       a charm: a reef manta on a ball chain, head up, the white belly with her own spot pattern at the front, the
 *                    navy back with the white shoulder chevrons; her tail just touches the floor (bonus: flick to spin)
 *   Turtle Tali      take-apart: a plumeria comes off her shell, then the carapace lifts off to show her nest (three eggs), then
 *                    the hatchling (bonus wind-up not in the runtime yet: she paddles instead)
 *   Whale Wendell    the rare: a pearl secret capsule; inside, a humpback (long knobbly flippers, throat pleats, barnacles, raised
 *                    flukes, a jelly spout) on a jelly sea with his calf (the extra part) (bonus squish)
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
const rng=(seed:number)=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
/** A fin: a flat outline in the y-z plane (x = its thickness), +outline-x pointing back (-z). */
function finYZ(k:ToyKit,part:string,pts:Pt[],at:V3,o:{color:string;mat?:Finish;depth?:number;rot?:V3}){k.extrude(pts,o.depth??.03,{part,at,rot:o.rot??[0,PI/2,0],color:o.color,mat:o.mat??'vinyl',bevel:Math.min(.012,(o.depth??.03)/3)});}
/** Points along a smooth turned profile (radius r(h)), for lathe bands that sit exactly on the body. */
const profileOf=(f:(h:number)=>number,h0:number,h1:number,n:number):Pt[]=>Array.from({length:n+1},(_,i)=>{const h=h0+(h1-h0)*i/n;return [Math.max(0,f(h)),h] as Pt;});

const set:ToyModelSet={
 'reef-shark-remi':(k)=>{
  const top=k.c.body,belly='#f4f8fb',dark=k.shade(top,-.12);
  k.part('finL',{at:[-.2,.3,.06]});k.part('finR',{at:[.2,.3,.06]});k.part('tail',{at:[0,.12,-.19]});k.part('key',{at:[0,.36,-.24]});k.part('ball',{at:[.3,.075,.25]});k.part('dorsal',{at:[0,.55,-.12]});
  // An upright chibi reef shark: a bullet body, a white belly, gill slits, a dorsal fin.
  const P:Pt[]=[[0,0],[.12,.008],[.19,.05],[.225,.14],[.235,.26],[.225,.38],[.195,.5],[.145,.6],[.08,.665],[0,.69]];
  k.smoothLathe(P,{scale:[1,1,.95],color:top,mat:'vinyl',seg:56});
  const bs=(x:number,y:number)=>Math.sqrt(Math.max(0,radiusAt(P,y)**2-x*x))*.95;
  k.sphere(1,{at:[0,.24,.13],scale:[.17,.21,.11],color:belly,mat:'vinyl',seg:48});
  const bl=ellSurf(0,.24,.13,.17,.21,.11),fsurf=(x:number,y:number)=>Math.max(bs(x,y),bl(x,y));
  for(const s of [-1,1])for(let i=0;i<3;i++){const y=.4-i*.035,a=s*(1.05+i*.12),r=radiusAt(P,y);k.torus(.035,.0045,{at:[Math.sin(a)*r,y,Math.cos(a)*r*.95],rot:yawPitch(a,0,PI/2),arc:PI*.7,color:dark,mat:'matte'});}
  finYZ(k,'dorsal',[[-.06,0],[.1,0],[.12,.17],[.04,.12]],[0,.5,-.1],{color:top,depth:.035,rot:[0,PI/2,0]});
  // His face: eyes with white rims (the blue-grey body would swallow plain dark eyes), a friendly grin with rounded teeth.
  face(k,'body',{x:0,y:.48,surf:(x,y)=>fsurf(x,y)+.003,gap:.085,size:.036,mouth:'grin',sclera:WHITE});
  for(let i=-2;i<=2;i++)k.cone(.008,.016,{at:[i*.016,.418,fsurf(i*.016,.418)+.004],rot:[PI,0,0],color:WHITE,mat:'vinyl',seg:10});
  // Pectoral fins, a crescent tail resting on the sand, a gold wind-up key on his back, his football.
  for(const s of [-1,1] as const){const p=s<0?'finL':'finR';k.extrude([[0,0],[.15,-.07],[.17,-.1],[.04,-.06]],.03,{part:p,at:[s*.2,.3,.06],rot:s<0?[0,PI,-.2]:[0,0,-.2],color:top,mat:'vinyl',bevel:.01});}
  finYZ(k,'tail',[[0,.04],[.14,.2],[.11,.06],[.15,-.07],[.09,-.08],[0,-.03]],[0,.1,-.15],{color:top,depth:.035});
  k.cyl(.016,.016,.07,{part:'key',at:[0,.36,-.26],rot:[PI/2,0,0],color:'#d9b13b',mat:'gold',seg:12});
  for(const s of [-1,1])k.cyl(.045,.045,.016,{part:'key',at:[s*.05,.36,-.3],rot:[PI/2,0,0],scale:[1,1,.75],color:'#e8c14a',mat:'gold'});
  k.sphere(.022,{part:'key',at:[0,.36,-.3],color:'#e8c14a',mat:'gold'});k.proxy('key',.08,[0,.36,-.3]);
  football(k,'ball',[.3,.075,.25],.075);
  return {kind:{kind:'windup',key:'key',legs:['finL','finR'],gait:'walk'},springs:[{part:'tail',k:40,c:1.8,amp:1.3},{part:'dorsal',k:70,c:2.6,amp:.7}],
   squeeze:['swish:tail','wiggle:finL+finR'],poke:{default:['blink','wobble'],tail:['swish:tail'],finL:['wave:finL'],finR:['wave:finR'],ball:['juggle:ball']},tap:['circle','bubbles'],head:{above:.45},
   voice:{squeeze:['e_bwomm','bubble'],poke:['bubble:.9'],tap:['e_bwomm:1.25','bubble:1.1']}};
 },
 'clownfish-coco':(k)=>{
  const orange=k.c.body,white=k.c.accent,black='#22262b',CY=.43,H0=.01,LZ=.26,R=.22;
  k.part('fish',{at:[0,CY,0]});k.part('tail',{at:[0,CY,-.22],parent:'fish'});k.part('finL',{at:[-.2,CY-.06,.04],parent:'fish'});k.part('finR',{at:[.2,CY-.06,.04],parent:'fish'});
  k.part('tent1',{at:[0,.2,0]});k.part('tent2',{at:[0,.2,0]});k.part('charm',{at:[0,.23,-.32]});
  // The anemone she lives in: a pink column, a ring of green-tipped tentacles in two swaying groups.
  k.lathe([[0,0],[.2,0],[.22,.03],[.2,.12],[.22,.2],[0,.2]],{color:'#d86aa8',mat:'soft',seg:48});
  const tr=rng(7);for(let i=0;i<22;i++){const a=i*PI*2/22+tr()*.1,rr=.17+tr()*.04,p=i%2?'tent1':'tent2',len=.1+tr()*.05,lean=.5+tr()*.3;
   const base:V3=[Math.sin(a)*rr,.2,Math.cos(a)*rr],d:V3=[Math.sin(a)*lean,1,Math.cos(a)*lean],n=Math.hypot(...d),c:V3=[base[0]+d[0]/n*len/2,base[1]+d[1]/n*len/2,base[2]+d[2]/n*len/2];
   k.capsule(.022,len,{part:p,at:c,rot:upTo(d),color:'#ff9ccc',mat:'soft'});k.sphere(.025,{part:p,at:[base[0]+d[0]/n*(len+.01),base[1]+d[1]/n*(len+.01),base[2]+d[2]/n*(len+.01)],color:'#b8f07a',mat:'soft'});}
  // Coco: a round orange body along z (nose to the front), three white bands edged in black.
  const r=(h:number)=>{const u=(h-H0)/LZ;return R*Math.sqrt(Math.max(0,1-u*u))*(1+.06*u);};
  const lat=(pts:Pt[],color:string,mat:Finish='vinyl')=>k.lathe(pts,{part:'fish',at:[0,CY,0],rot:[PI/2,0,0],color,mat,seg:56});
  lat(profileOf(r,H0-LZ,H0+LZ,32),orange);
  for(const [a,b] of [[.1,.155],[-.075,-.01],[-.215,-.185]] as const){lat(profileOf(h=>r(h)+.005,a,b,6),white);for(const h of [a,b])k.torus(r(h)+.005,.0065,{part:'fish',at:[0,CY,h],color:black,mat:'vinyl'});}
  // Fins: dorsal (two lobes), pectorals, the tail, all orange with black edges.
  finYZ(k,'fish',[[-.14,0],[.1,0],[.06,.08],[-.02,.06],[-.08,.1]],[0,CY+.205,-.02],{color:orange,depth:.025,rot:[0,-PI/2,0]});
  finYZ(k,'fish',[[-.15,.01],[-.08,.11],[-.02,.065],[.06,.09],[.11,.01]],[0,CY+.2,-.02],{color:black,depth:.018,rot:[0,-PI/2,0]});
  for(const s of [-1,1] as const){const p=s<0?'finL':'finR';k.sphere(1,{part:p,at:[s*.24,CY-.06,.03],rot:[0,s*.4,s*.6],scale:[.08,.05,.018],color:orange,mat:'vinyl',seg:28});k.torus(1,.12,{part:p,at:[s*.24,CY-.06,.03],rot:[0,s*.4,s*.6],scale:[.08,.05,.1],color:black,mat:'vinyl',seg:28});}
  finYZ(k,'tail',[[0,.02],[.1,.12],[.13,.06],[.11,0],[.13,-.06],[.1,-.12],[0,-.02]],[0,CY,-.22],{color:orange,depth:.03,rot:[0,PI/2,0]});
  finYZ(k,'tail',[[.095,.115],[.13,.06],[.115,0],[.13,-.06],[.095,-.115],[.12,0]],[0,CY,-.222],{color:black,depth:.034,rot:[0,PI/2,0]});
  // Her face on the front of the nose: big glossy eyes with white rims, a little smile, blush.
  const fs=(x:number,y:number)=>{const rho=Math.hypot(x,y-CY),u=Math.sqrt(Math.max(0,1-(rho/(R*1.05))**2));return H0+LZ*u;};
  face(k,'fish',{x:0,y:CY+.05,surf:(x,y)=>fs(x,y)+.004,gap:.085,size:.04,mouth:'smile',sclera:WHITE,blush:'#ff6f6f'});
  // A bag-charm ball chain from her tail with a little pearl scallop shell on the end.
  k.chain({mode:'dangle',from:'body',at:[0,.31,-.32],length:.08,links:4,tag:'charm',color:'#d9c27a'});
  k.extrude(Array.from({length:13},(_,i)=>{const a=PI*.15+i*PI*.7/12;return [Math.cos(a)*.045,Math.sin(a)*.045-.045] as Pt;}).concat([[0,-.05]]),.012,{part:'charm',at:[0,.18,-.32],rot:[0,0,PI],color:'#fff0f4',mat:'pearl',bevel:.004});
  k.torus(.008,.003,{part:'charm',at:[0,.235,-.32],color:'#d9c27a',mat:'gold'});
  return {kind:{kind:'squish'},soft:{soft:.6},springs:[{part:'tent1',k:30,c:1.5,amp:1},{part:'tent2',k:24,c:1.3,amp:1.1},{part:'tail',k:50,c:2,amp:1}],
   squeeze:['e_wriggle','wiggle:tail'],poke:{default:['bubbles','wiggle:tail'],tent1:['d_bob:tent1'],tent2:['d_bob:tent2'],tail:['wiggle:tail'],charm:['wiggle:charm']},tap:['e_hidedart:fish'],head:{above:.4},
   voice:{squeeze:['e_blipblop'],poke:['bubble'],tap:['e_blipblop:1.2','whoosh:1.5']}};
 },
 'octo-otto':(k)=>{
  const purple=k.c.body,pink=k.c.accent,deep=k.shade(purple,-.12);
  k.part('head',{at:[0,.22,0]});k.part('armL',{at:[-.2,.32,.04]});k.part('armR',{at:[.2,.32,.04]});k.part('ballL',{at:[-.4,.66,.08],parent:'armL'});k.part('ballR',{at:[.4,.66,.08],parent:'armR'});
  k.part('ballF1',{at:[-.2,.06,.42]});k.part('ballF2',{at:[.24,.066,.4]});
  // The mantle: a soft jelly dome with darker spots all round (a decent back too).
  const M:Pt[]=[[0,.17],[.17,.19],[.25,.28],[.275,.42],[.25,.56],[.17,.66],[0,.7]];
  k.smoothLathe(M,{part:'head',color:purple,mat:'jelly',seg:56});
  const rr=rng(4);for(let i=0;i<14;i++){const a=rr()*PI*2,y=.3+rr()*.32;if(Math.abs(Math.sin(a/2))<.18&&y<.5)continue;const r=radiusAt(M,y);
   k.sphere(.022+rr()*.02,{part:'head',at:[Math.sin(a)*(r-.004),y,Math.cos(a)*(r-.004)],rot:yawPitch(a,0),scale:[1,1,.3],color:deep,mat:'jelly',seg:14});}
  face(k,'head',{x:0,y:.4,surf:(x,y)=>Math.sqrt(Math.max(0,radiusAt(M,y)**2-x*x))+.004,gap:.09,size:.04,mouth:'smile',sclera:WHITE,blush:'#ff8fc8'});
  // Six arms curl out over the sand (pale suckers on the curls), two reach up juggling balls.
  for(let i=0;i<6;i++){const a=PI/6+i*PI/3+(i>2?PI/3:0)*0,ang=PI*.25+i*PI*1.5/5;const ca=Math.sin(ang),sa=Math.cos(ang),side=i%2?1:-1;
   const pt=(r:number,y:number,tw=0):V3=>[ca*r-sa*tw*side,y,sa*r+ca*tw*side];
   k.tube([pt(.12,.24),pt(.24,.13),pt(.33,.075),pt(.41,.07,.02)],.048,{color:purple,mat:'jelly'});
   k.tube([pt(.4,.07,.02),pt(.47,.075,.04),pt(.49,.12,.07),pt(.45,.15,.08)],.032,{color:purple,mat:'jelly'});
   k.sphere(.034,{at:pt(.44,.16,.08),color:purple,mat:'jelly'});
   for(const [r,y,tw] of [[.3,.11,0],[.38,.105,.02],[.46,.12,.05]] as const)k.sphere(.014,{at:pt(r,y,tw),scale:[1,.6,1],color:pink,mat:'matte',seg:10});void a;}
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.tube([[s*.2,.32,.04],[s*.32,.4,.07],[s*.38,.52,.08],[s*.4,.6,.08]],.04,{part:p,color:purple,mat:'jelly'});
   for(const [x,y] of [[.31,.4],[.37,.5]] as const)k.sphere(.013,{part:p,at:[s*x,y,.115],scale:[1,1,.5],color:pink,mat:'matte',seg:10});}
  const ball=(p:string,at:V3,c:string)=>{k.sphere(.065,{part:p,at,color:c,mat:'vinyl'});k.torus(.065,.008,{part:p,at,rot:[PI/2,0,.4],color:WHITE,mat:'vinyl'});};
  ball('ballL',[-.4,.66,.08],'#ffd447');ball('ballR',[.4,.66,.08],'#5ec8f2');
  football(k,'ballF1',[-.2,.06,.42],.06);ball('ballF2',[.24,.066,.4],'#7bd389');
  return {kind:{kind:'jelly'},soft:{soft:.65,jelly:true},
   squeeze:['c_curl:armL+armR'],poke:{default:['puff','e_recoil'],armL:['wiggle:armL'],armR:['wiggle:armR'],ballF1:['juggle:ballF1'],ballF2:['juggle:ballF2']},tap:['e_jugA:ballL+ballR','e_jugB:ballF1+ballF2'],head:'head',
   voice:{squeeze:['e_squelch','pop'],poke:['puff:1.3','pop:1.2'],tap:['bloop:1.3','pop:1.4']}};
 },
 'manta-maya':(k)=>{
  const navy=k.c.body,belly=k.c.accent,CY=.5;
  const mz=(x:number,y:number)=>ellSurf(0,CY+.01,.02,.145,.25,.055)(x,y)+.002;
  k.part('ray',{at:[0,CY,0]});k.part('wingL',{at:[-.1,CY,0],parent:'ray'});k.part('wingR',{at:[.1,CY,0],parent:'ray'});
  // A manta keychain hanging head-up: the white belly faces front (eyes, a wide smile, gill slits, her own spot pattern),
  // the navy back has the white shoulder chevrons of a reef manta.
  k.sphere(1,{part:'ray',at:[0,CY,0],scale:[.16,.27,.07],color:navy,mat:'vinyl',seg:48});
  k.sphere(1,{part:'ray',at:[0,CY+.01,.02],scale:[.145,.25,.055],color:belly,mat:'vinyl',seg:48});
  for(const s of [-1,1] as const){const p=s<0?'wingL':'wingR',o:Pt[]=[[0,.2],[s*.2,.08],[s*.33,-.02],[s*.35,-.06],[s*.2,-.1],[s*.06,-.2],[0,-.21]];
   k.extrude(o,.05,{part:p,at:[s*.1,CY,0],color:navy,mat:'vinyl',bevel:.02});
   k.extrude(o.map(([x,y])=>[x*.86+s*.005,y*.84] as Pt),.012,{part:p,at:[s*.1,CY+.005,.024],color:belly,mat:'vinyl',bevel:.004});
   k.extrude([[0,.12],[s*.2,.03],[s*.05,-.03]],.012,{part:p,at:[s*.03,CY+.08,-.03],color:belly,mat:'matte',bevel:.004});
   // cephalic fins curling forward at the head
   k.tube([[s*.07,CY+.22,.01],[s*.1,CY+.3,.03],[s*.085,CY+.35,.06],[s*.055,CY+.33,.07]],.024,{part:'ray',color:navy,mat:'vinyl'});
   for(let i=0;i<5;i++)k.capsule(.004,.025,{part:'ray',at:[s*(.06+i*.012),CY-.04-i*.022,mz(s*(.06+i*.012),CY-.04-i*.022)],rot:[0,0,s*.6],color:'#9aa6b6',mat:'matte'});}
  for(const s of [-1,1])k.sphere(1,{part:'ray',at:[s*.075,CY+.1,-.062],rot:[0,0,s*.5],scale:[.06,.035,.012],color:belly,mat:'matte',seg:24});
  for(const [x,y,r] of [[-.05,CY-.12,.016],[.04,CY-.15,.012],[.07,CY-.08,.01],[-.02,CY-.19,.011]] as const)k.sphere(r,{part:'ray',at:[x,y,mz(x,y)-.002],scale:[1,1,.3],color:'#4a5a76',mat:'matte',seg:12});
  face(k,'ray',{x:0,y:CY+.13,surf:ellSurf(0,CY+.01,.02,.145,.25,.055),gap:.075,size:.034,mouth:'grin'});
  // The tail (its tip just resting on the floor) and the clasp the ball chain holds.
  k.capsule(.014,.2,{part:'ray',at:[0,CY-.36,-.005],color:navy,mat:'vinyl'});k.sphere(.01,{part:'ray',at:[0,.012,-.005],color:navy,mat:'vinyl',seg:10});
  k.sphere(.02,{part:'ray',at:[0,CY+.285,0],color:'#d9c27a',mat:'gold'});k.torus(.015,.005,{part:'ray',at:[0,CY+.31,0],color:'#d9c27a',mat:'gold'});
  k.chain({mode:'hang',links:8,length:.24,at:[0,CY+.325,0],color:'#d9c27a'});
  return {kind:{kind:'charm'},flick:true,springs:[{part:'wingL',k:36,c:1.8,amp:.9},{part:'wingR',k:36,c:1.8,amp:.9}],
   squeeze:['e_mantaflap:wingL+wingR'],poke:{default:['e_partglide:ray'],wingL:['e_mantaflap:wingL'],wingR:['e_mantaflap:wingR']},tap:['e_partloop:ray','bubbles'],head:{above:.6},
   voice:{squeeze:['e_whooshlow'],poke:['e_whooshlow:1.3'],tap:['e_whooshlow:.85','bubble:.8']}};
 },
 'turtle-tali':(k)=>{
  const green=k.c.body,sand=k.c.accent,olive='#5d7a3a',plate='#b99a52',cream='#f3e7c6';
  k.part('head',{at:[0,.2,.28]});k.part('flipL',{at:[-.2,.14,.12]});k.part('flipR',{at:[.2,.14,.12]});k.part('hindL',{at:[-.16,.1,-.18]});k.part('hindR',{at:[.16,.1,-.18]});
  k.part('shell',{at:[0,.3,0]});k.part('flower',{at:[0,.5,.02]});k.part('baby',{at:[.04,.24,-.02]});
  // Her body: a cream plastron and a smooth top with a little nest (three eggs, a hatchling) under the shell.
  k.smoothLathe([[0,0],[.2,.006],[.27,.05],[.28,.12],[.2,.2],[0,.22]],{scale:[1,1,1.2],color:cream,mat:'vinyl',seg:48});
  k.torus(.09,.02,{at:[0,.215,0],rot:[PI/2,0,0],color:'#d9c49a',mat:'matte'});
  for(const [x,z] of [[-.05,.03],[.05,.04],[-.01,-.06]] as const)k.sphere(.04,{at:[x,.25,z],scale:[1,1.15,1],color:'#fffaf0',mat:'vinyl'});
  // The hatchling (a piece): a tiny turtle climbing out.
  k.sphere(.035,{part:'baby',at:[.06,.27,-.01],scale:[1.1,.6,1.2],color:olive,mat:'vinyl'});k.sphere(.022,{part:'baby',at:[.06,.27,.04],color:green,mat:'vinyl'});
  for(const s of [-1,1])k.sphere(.006,{part:'baby',at:[.06+s*.01,.277,.06],color:INK,mat:'ink',seg:8});
  // Head and neck with lighter scale patches; flippers with spots; a short tail.
  k.capsule(.06,.1,{part:'head',at:[0,.2,.33],rot:[PI/2-.3,0,0],color:green,mat:'vinyl'});
  k.sphere(.11,{part:'head',at:[0,.25,.43],scale:[1,.9,1.05],color:green,mat:'vinyl'});
  for(const [x,y,z] of [[0,.34,.44],[-.05,.33,.41],[.05,.33,.41],[0,.32,.38],[-.075,.28,.45],[.075,.28,.45]] as const)k.sphere(.022,{part:'head',at:[x,y,z],scale:[1,.5,1],rot:[-.4,0,0],color:k.shade(green,.12),mat:'vinyl',seg:12});
  face(k,'head',{x:0,y:.265,surf:ellSurf(0,.25,.43,.11,.099,.1155),gap:.05,size:.028,mouth:'smile',blush:'#ffa0a0'});
  for(const s of [-1,1] as const){const p=s<0?'flipL':'flipR';
   k.sphere(1,{part:p,at:[s*.3,.06,.18],rot:[0,s*-.6,s*.1],scale:[.17,.025,.075],color:green,mat:'vinyl',seg:32});
   for(let i=0;i<3;i++)k.sphere(.014,{part:p,at:[s*(.24+i*.05),.085,.17+i*.025],scale:[1,.4,1],color:k.shade(green,.14),mat:'vinyl',seg:10});
   const h=s<0?'hindL':'hindR';k.sphere(1,{part:h,at:[s*.2,.05,-.27],rot:[0,s*.6,0],scale:[.09,.022,.06],color:green,mat:'vinyl',seg:24});}
  k.cone(.025,.06,{at:[0,.07,-.34],rot:[-PI/2,0,0],color:green,mat:'vinyl'});
  // The carapace (a piece): an olive dome (a shell inside too) with raised scute plates, a rim of marginal scutes.
  const D:Pt[]=[[.3,.13],[.3,.16],[.28,.28],[.22,.39],[.12,.47],[0,.5]];
  k.smoothLathe(D,{part:'shell',scale:[1,1,1.18],color:olive,mat:'vinyl',seg:56});k.smoothLathe(D.map(([r,y])=>[Math.max(0,r-.015),y-.01] as Pt).reverse(),{part:'shell',scale:[1,1,1.18],color:k.shade(olive,-.15),mat:'matte',seg:56});
  k.torus(.3,.022,{part:'shell',at:[0,.14,0],rot:[PI/2,0,0],scale:[1,1.18,1],color:k.shade(olive,.06),mat:'vinyl'});
  for(let i=0;i<16;i++){const a=i*PI*2/16;k.sphere(.03,{part:'shell',at:[Math.sin(a)*.305,.14,Math.cos(a)*.305*1.18],scale:[1,.6,1],color:k.shade(plate,-.08),mat:'vinyl',seg:12});}
  const onDome=(a:number,t:number):{p:V3;n:T.Vector3}=>{const y=.16+t*.32,r=radiusAt(D,y)+.004,p:V3=[Math.sin(a)*r,y,Math.cos(a)*r*1.18];const r2=radiusAt(D,y+.01),dr=(r2-r)/.01;return {p,n:new T.Vector3(Math.sin(a),-dr,Math.cos(a)/1.18).normalize()};};
  const scute=(p:V3,n:T.Vector3,rad:number)=>{k.cyl(rad,rad*1.05,.012,{part:'shell',at:p,rot:upTo([n.x,n.y,n.z]),color:plate,mat:'vinyl',seg:6});};
  scute([0,.502,0],new T.Vector3(0,1,0),.065);for(const z of [-1,1]){const q=onDome(z>0?0:PI,.78);scute(q.p,q.n,.06);}
  for(let i=0;i<8;i++){const q=onDome(PI/8+i*PI/4,.4);scute(q.p,q.n,.065);}
  // A plumeria flower on top (a piece).
  for(let i=0;i<5;i++){const a=i*PI*2/5;k.sphere(1,{part:'flower',at:[Math.sin(a)*.03,.515,.02+Math.cos(a)*.03],rot:[0,a,-.25],scale:[.022,.007,.036],color:WHITE,mat:'vinyl',seg:16});}
  k.sphere(.016,{part:'flower',at:[0,.52,.02],scale:[1,.6,1],color:'#ffd447',mat:'vinyl'});
  return {kind:{kind:'puzzle',pieces:[{part:'flower',name:'the flower'},{part:'shell',name:'her shell',after:['flower']},{part:'baby',name:'the hatchling',after:['shell']}]},
   squeeze:['e_tuck:head+flipL+flipR+hindL+hindR'],poke:{default:['e_slowblink'],flipL:['e_paddle:flipL'],flipR:['e_paddle:flipR'],hindL:['e_paddle:hindL'],hindR:['e_paddle:hindR']},tap:['e_paddle:flipL+flipR+hindL+hindR','e_swimfwd'],head:'head',
   voice:{squeeze:['bloop:.6'],poke:['hum:.6'],tap:['e_plipplop','e_plipplop:.9']}};
 },
 'whale-wendell':(k)=>{
  const blue=k.c.body,pale=k.c.accent,sea='#4fb3e8';
  secretCapsule(k,{top:'#f2f6ff',topMat:'pearl',bot:'#bcd6f2',botMat:'pearl',rim:'#ffd447',mark:'#ffd447',markMat:'gold'});
  for(const [n,at] of [['finL',[-.22,.24,.06]],['finR',[.22,.24,.06]],['tail',[0,.3,-.24]],['spout',[0,.58,.06]],['calf',[.28,.08,.2]]] as const)k.part(n,{at,parent:'inner'});
  // The sea: a jelly disc with white wave crests.
  k.cyl(.42,.42,.06,{part:'inner',at:[0,.03,0],color:sea,mat:'jelly',seg:48});
  for(let i=0;i<9;i++){const a=i*PI*2/9;k.torus(.05,.012,{part:'inner',arc:PI,at:[Math.sin(a)*.37,.06,Math.cos(a)*.37],rot:[0,a+PI/2,0],color:WHITE,mat:'vinyl'});}
  // Wendell, a humpback: a round blue body facing front, a pale chin and throat with pleats, little barnacles.
  const WC:V3=[0,.32,0],WR:V3=[.26,.24,.28];
  k.sphere(1,{part:'inner',at:WC,scale:WR,color:blue,mat:'vinyl',seg:56});
  k.sphere(1,{part:'inner',at:[0,.27,.1],scale:[.215,.17,.2],color:pale,mat:'vinyl',seg:48});
  const ws=ellSurf(0,.27,.1,.215,.17,.2);
  for(let i=-3;i<=3;i++){const x=i*.035;k.tube([[x,.2,ws(x,.2)+.002],[x*1.05,.16,ws(x,.16)+.002],[x*1.1,.13,ws(x*1.1,.13)]],.004,{part:'inner',color:k.shade(pale,-.12),mat:'matte'});}
  for(const [x,y] of [[-.1,.3],[-.12,.27],[.11,.29]] as const)k.sphere(.009,{part:'inner',at:[x,y,ws(x,y)],color:'#e9eef2',mat:'matte',seg:8});
  for(const s of [-1,1])k.capsule(.006,.03,{part:'inner',at:[s*.015,.555,.05],rot:[0,0,PI/2+s*.3],color:k.shade(blue,-.25),mat:'matte'});
  face(k,'inner',{x:0,y:.33,surf:(x,y)=>ws(x,y)+.003,gap:.085,size:.034,mouth:'smile',prefix:'in'});
  // Long humpback flippers with knobbly front edges, white underneath; the flukes raised behind.
  for(const s of [-1,1] as const){const p=s<0?'finL':'finR';
   k.sphere(1,{part:p,at:[s*.33,.19,.08],rot:[0,s*-.35,s*-.55],scale:[.15,.03,.055],color:blue,mat:'vinyl',seg:32});
   k.sphere(1,{part:p,at:[s*.33,.185,.08],rot:[0,s*-.35,s*-.55],scale:[.14,.026,.05],color:pale,mat:'vinyl',seg:32});
   for(let i=0;i<4;i++)k.sphere(.012,{part:p,at:[s*(.24+i*.05),.235-i*.027,.125-i*.012],color:k.shade(pale,.04),mat:'vinyl',seg:10});}
  k.tube([[0,.3,-.24],[0,.4,-.31],[0,.57,-.33]],.06,{part:'tail',color:blue,mat:'vinyl'});
  k.extrude([[0,0],[.12,.06],[.22,.04],[.18,-.02],[.06,-.03],[0,-.06],[-.06,-.03],[-.18,-.02],[-.22,.04],[-.12,.06]],.035,{part:'tail',at:[0,.6,-.33],rot:[-.25,0,0],color:blue,mat:'vinyl',bevel:.01});
  k.extrude([[0,-.01],[.1,.04],[.18,.025],[.06,-.02],[-.06,-.02],[-.18,.025],[-.1,.04]],.01,{part:'tail',at:[0,.6,-.35],rot:[-.25,0,0],color:pale,mat:'matte',bevel:.003});
  // The spout: three jelly drops over the blowhole.
  for(const [x,y,r] of [[0,.62,.03],[-.04,.68,.022],[.045,.69,.02],[0,.73,.018]] as const)k.sphere(r,{part:'spout',at:[x,y,.06],scale:[1,1.3,1],color:'#bfe8ff',mat:'jelly'});
  // His calf (the extra part), swimming at his side.
  k.sphere(1,{part:'calf',at:[.28,.1,.2],scale:[.08,.065,.09],color:blue,mat:'vinyl',seg:32});k.sphere(1,{part:'calf',at:[.28,.085,.24],scale:[.06,.04,.05],color:pale,mat:'vinyl',seg:24});
  for(const s of [-1,1])k.sphere(.008,{part:'calf',at:[.28+s*.025,.12,.28],color:INK,mat:'ink',seg:8});
  k.extrude([[0,0],[.05,.025],[.06,0],[0,-.01],[-.06,0],[-.05,.025]],.012,{part:'calf',at:[.28,.13,.12],rot:[-.6,0,0],color:blue,mat:'vinyl',bevel:.003});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},soft:{soft:.5},springs:[{part:'tail',k:30,c:1.6,amp:1.1},{part:'spout',k:60,c:2.4,amp:1}],
   squeeze:['e_spout:spout','bubbles'],poke:{default:['sway','blink:ineyes'],tail:['wiggle:tail'],finL:['flap:finL'],finR:['flap:finR'],spout:['e_spout:spout'],calf:['d_bob:calf']},tap:['e_sing','wiggle:tail'],head:{above:.45},
   voice:{squeeze:['e_spouthiss'],poke:['hum:.55'],tap:['e_whalecall']}};
 },
};
export default set;
