/**
 * Summit Orchard (gs-summit), rebuilt for round 3B (Nov 9 2026; docs/gashapon-design.md "Round 3B"): Summit Isle fruit and summit
 * landmarks, HD kit, each toy plays its planned KIND (lib/gashapon/toyKinds.ts):
 *   Mango Max         a squishy ripe mango with a sunset blush, running boots (bonus: flick to spin)
 *   Papaya Pia        take-apart: the leaf comes off the stem, the top lifts, the seed bed lifts out of the hollow (bonus: squishy)
 *   Avo Kicker        working parts: slide the seed out of its socket, it springs back (bonus: the sprout on top bobbles)
 *   Orange Orbit      a spinner: a dimpled orange on her curled peel, flick to spin (bonus: squishy)
 *   Cairn Carl        take-apart: the flag, then the top and middle stones lift off the face stone (bonus: the flag bobbles)
 *   Summit Goal Gigi  the rare: a gold-and-pearl secret capsule; inside, the Summit 5s goal on a rocky turf plinth with her face on
 *                     the net, a ball, a pennant and a kick lever (the extra part) that sends the ball into the net
 * Model space: stands on y = 0, about 1 tall, front +z. Rows in lib/gashapon/toys.ts keep the words, links and voices.
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


/** z on the front of an ellipsoid turned `ang` about z (centre cx, cy). */
const ellSurfRot=(cx:number,cy:number,rx:number,ry:number,rz:number,ang:number):Surf=>(x,y)=>{const dx=x-cx,dy=y-cy,c=Math.cos(-ang),s=Math.sin(-ang),u=(dx*c-dy*s)/rx,v=(dx*s+dy*c)/ry;return rz*Math.sqrt(Math.max(0,1-u*u-v*v));};
/** A glossy leaf (pointed oval, a midrib) at `at`, pointing along yaw / pitch. */
function leaf(k:ToyKit,part:string,at:V3,len:number,yaw:number,pitch:number,color:string,roll=0){
 const sh=new T.Shape();sh.moveTo(0,0);sh.bezierCurveTo(len*.42,len*.22,len*.36,len*.78,0,len);sh.bezierCurveTo(-len*.36,len*.78,-len*.42,len*.22,0,0);
 const rot=yawPitch(yaw,pitch,roll);k.extrude(outline(sh,22),.014,{part,at,rot,color,mat:'vinyl',bevel:.005});
 const q=new T.Quaternion().setFromEuler(new T.Euler(...rot)),p=(t:number):V3=>{const v=new T.Vector3(0,len*t,.009).applyQuaternion(q);return [at[0]+v.x,at[1]+v.y,at[2]+v.z];};
 k.tube([p(.05),p(.5),p(.9)],.004,{part,color:k.shade(color,.14),mat:'vinyl'});
}
/** A football: white, five ink patches. */
function football(k:ToyKit,part:string,at:V3,r:number){
 k.sphere(r,{part,at,color:WHITE,mat:'vinyl'});
 for(const [dx,dy,dz] of [[0,.2,1],[.8,.5,.4],[-.8,.5,.4],[.6,-.6,.55],[-.6,-.6,.55],[0,.3,-1],[.7,-.2,-.6],[-.7,-.2,-.6]] as const){const n=Math.hypot(dx,dy,dz);
  k.cyl(r*.34,r*.34,r*.1,{part,at:[at[0]+dx/n*r*.97,at[1]+dy/n*r*.97,at[2]+dz/n*r*.97],rot:yawPitch(Math.atan2(dx,dz),Math.acos(dy/n)),color:INK,mat:'ink',seg:5});}
}
/** Football boots with studs (part `part`). */
function boots(k:ToyKit,o:{xs:readonly number[];top:number;z?:number;leg:string;boot:string;part?:string}){
 const part=o.part??'feet',z=o.z??.03;
 for(const x of o.xs){k.capsule(.032,Math.max(.01,o.top-.1),{part,at:[x,(o.top+.08)/2,z-.01],color:o.leg,mat:'vinyl'});
  k.sphere(.068,{part,at:[x,.05,z+.04],scale:[1,.6,1.4],color:o.boot,mat:'vinyl'});k.box(.012,.04,.09,{part,at:[x+.03,.06,z+.07],rot:[.3,0,0],color:WHITE,mat:'matte'});
  for(const [dx,dz] of [[-.03,.0],[.03,.0],[-.03,.09],[.03,.09]] as const)k.cyl(.012,.01,.022,{part,at:[x+dx,.011,z+dz],color:'#d9dde0',mat:'matte',seg:10});
  k.rbox(.12,.02,.18,.01,{part,at:[x,.024,z+.04],color:k.shade(o.boot,-.25),mat:'matte'});}
}

const set:ToyModelSet={
 'mango-max':(k)=>{
  const {body,accent}=k.c,c:V3=[0,.5,0],RX=.27,RY=.35,RZ=.25,ANG=-.2;
  k.part('legL',{at:[-.09,.2,.02]});k.part('legR',{at:[.09,.2,.02]});k.part('leaf',{at:[.07,.84,0]});k.part('armL',{at:[-.25,.47,0]});k.part('armR',{at:[.25,.47,0]});
  // A ripe mango: a tilted kidney with a sunset blush (low-frequency colour patches) and a soft sheen.
  k.blob(1,{at:c,rot:[0,0,ANG],scale:[RX,RY,RZ],amp:.012,freq:1.7,seed:4,color:body,dark:'#f0563a',light:'#ffd85a',mat:'vinyl',seg:64});
  const tip:V3=[c[0]-Math.sin(ANG)*RY*.98,c[1]+Math.cos(ANG)*RY*.98,0];
  k.sphere(.05,{at:tip,scale:[1,.4,1],color:'#8fbf4a',mat:'vinyl'});
  k.cyl(.016,.022,.07,{part:'leaf',at:[tip[0],tip[1]+.03,0],rot:[0,0,ANG],color:'#7a5230',mat:'matte',seg:10});
  leaf(k,'leaf',[tip[0]+.005,tip[1]+.05,0],.2,0,0,accent,-.95);leaf(k,'leaf',[tip[0]-.005,tip[1]+.05,0],.16,0,0,k.shade(accent,-.06),.85);
  face(k,'body',{x:.01,y:.5,surf:(x,y)=>ellSurfRot(c[0],c[1],RX,RY,RZ,ANG)(x,y)+.012,gap:.085,size:.045,mouth:'open',brows:'#a3401f'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.026,.11,{part:p,at:[s*.3,.42,.03],rot:[0,0,s*.9],color:'#e8812a',mat:'vinyl'});
   k.sphere(.036,{part:p,at:[s*.35,.37,.05],color:'#e8812a',mat:'vinyl'});k.torus(.03,.012,{part:p,at:[s*.335,.39,.045],rot:[PI/2,0,s*.9],color:WHITE,mat:'matte'});}
  boots(k,{xs:[-.09],top:.22,leg:'#e8812a',boot:'#2f8fd6',part:'legL'});boots(k,{xs:[.09],top:.22,leg:'#e8812a',boot:'#2f8fd6',part:'legR'});
  return {kind:{kind:'squish'},soft:{soft:.6},flick:true,
   squeeze:['jiggle'],poke:{default:['wobble'],legL:['sprint:legL+legR'],legR:['sprint:legL+legR'],leaf:['wiggle:leaf'],armL:['wave:armL'],armR:['wave:armR']},tap:['e_mangoroll'],head:{above:.68},
   voice:{squeeze:['e_splorp','boing:.9'],poke:['e_splorp:1.3'],tap:['roll:1.2','e_splorp:1.15']}};
 },
 'papaya-pia':(k)=>{
  const {body,accent}=k.c,skin='#ffa94d',flesh='#ff6a3a',gel='#d98a3a',H=.58,TOP=.76;
  const r=(y:number)=>.255*Math.pow(Math.max(0,Math.sin(PI*(y-.03)/(TOP-.03))),.62),rH=r(H);
  k.part('lid',{at:[0,H,0]});k.part('seeds',{at:[0,H-.03,0]});k.part('leaf',{at:[0,TOP+.05,0]});k.part('armL',{at:[-.24,.36,0]});k.part('armR',{at:[.24,.36,0]});
  // The bottom: skin, a flesh ring cut flat at H and a hollow for the seeds.
  k.lathe(prof(30,t=>{const y=.03+(H-.03)*t;return [r(y),y] as Pt;}),{color:skin,mat:'vinyl',seg:56});
  k.lathe([[rH-.002,H],[.15,H],[.105,H],[.09,H-.04],[.055,H-.075],[0,H-.085]],{color:flesh,mat:'soft',seg:56});
  for(let i=0;i<6;i++){const a=i*PI/3+.5;if(Math.cos(a)>.7)continue;k.tube(prof(8,t=>{const y=.1+t*(H-.14);return [Math.sin(a)*(r(y)+.002),y] as Pt;}).map(([x,y])=>[x,y,Math.cos(a)*(r(y)+.002)] as V3),.006,{color:k.shade(skin,-.08),mat:'vinyl'});}
  // The seed bed: an amber gel with glossy black seeds.
  k.sphere(.1,{part:'seeds',at:[0,H-.035,0],scale:[1,.65,1],color:gel,mat:'jelly'});
  const rs=rng(12);for(let i=0;i<18;i++){const a=i*2.4,d=.025+Math.sqrt(i/18)*.07;k.sphere(.021,{part:'seeds',at:[Math.sin(a)*d,H-.01+(.08-d)*.25,Math.cos(a)*d],scale:[1,.85,1],color:accent,mat:'ink',seg:12});void rs;}
  // The top: flesh underneath (a dome over the seeds), green-gold skin to the stem.
  k.lathe([[0,H+.035],[.1,H+.01],[rH-.002,H]],{part:'lid',color:flesh,mat:'soft',seg:56});
  k.lathe(prof(18,t=>{const y=H+(TOP-H)*t;return [r(y),y] as Pt;}),{part:'lid',color:'#c8c84a',mat:'vinyl',seg:56});
  k.cyl(.018,.026,.06,{part:'lid',at:[0,TOP+.02,0],color:'#7a5230',mat:'matte',seg:12});
  // A leaf clipped on the stem (it comes off first).
  k.sphere(.02,{part:'leaf',at:[0,TOP+.05,0],color:'#7a5230',mat:'matte'});
  leaf(k,'leaf',[0,TOP+.05,0],.2,.4,0,'#4f9a3a',-1.15);
  face(k,'body',{x:0,y:.36,surf:(x,y)=>Math.sqrt(Math.max(0,r(y)**2-x*x)),gap:.085,size:.042,mouth:'cat',blush:'#ff6f7d'});
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.03,.08,{part:p,at:[s*.27,.32,.04],rot:[0,0,s*.7],color:skin,mat:'vinyl'});k.sphere(.036,{part:p,at:[s*.31,.27,.06],color:skin,mat:'vinyl'});}
  sneakers(k,{xs:[-.09,.09],top:.07,z:.05,leg:skin,shoe:WHITE,sole:'#ff6f7d'});
  return {kind:{kind:'puzzle',pieces:[{part:'leaf',name:'the leaf'},{part:'lid',name:'the top',after:['leaf']},{part:'seeds',name:'the seeds',after:['lid']}]},
   soft:{soft:.45},
   squeeze:['rattle:seeds'],poke:{default:['jiggle','blink'],armL:['wave:armL'],armR:['wave:armR']},tap:['spin','lidopen:lid'],head:'lid',
   voice:{squeeze:['pop','e_seedrattle'],poke:['giggle'],tap:['giggle:1.2','pop:1.3']}};
 },
 'avo-kicker':(k)=>{
  const {body,accent}=k.c,skinC='#2f4a1e',ring='#9cc94a',cream='#e9f2a6',Y=.12;
  const sh=new T.Shape();sh.moveTo(0,0);sh.bezierCurveTo(.2,0,.29,.14,.29,.29);sh.bezierCurveTo(.29,.42,.19,.5,.16,.6);sh.bezierCurveTo(.13,.7,.08,.76,0,.76);
  sh.bezierCurveTo(-.08,.76,-.13,.7,-.16,.6);sh.bezierCurveTo(-.19,.5,-.29,.42,-.29,.29);sh.bezierCurveTo(-.29,.14,-.2,0,0,0);
  const pear=outline(sh,48).map(([x,y])=>[x,y+Y] as Pt);
  k.part('seed',{at:[0,.31+Y,.08]});k.part('sprout',{at:[0,.77+Y,-.02]});k.part('legL',{at:[-.09,Y+.02,0]});k.part('legR',{at:[.09,Y+.02,0]});k.part('armL',{at:[-.29,.36+Y,0]});k.part('armR',{at:[.29,.36+Y,0]});
  // The pebbly dark skin behind, a skin rim, a green ring and the creamy flesh.
  // The back: the same pear turned round (a lathe), pushed behind the cut face, with pebbly bumps.
  const half=pear.filter(([x])=>x>=-1e-6).sort((p,q)=>p[1]-q[1]),rAt=(y:number)=>{for(let i=0;i<half.length-1;i++){const [x0,y0]=half[i],[x1,y1]=half[i+1];if(y>=y0&&y<=y1)return x0+(x1-x0)*(y-y0)/Math.max(1e-6,y1-y0);}return 0;};
  const BZ=-.17,SZ=.62;
  k.lathe([[0,half[0][1]],...half.filter(([x])=>x>1e-4),[0,half[half.length-1][1]]],{at:[0,0,BZ],scale:[1.04,1,SZ*1.04],color:skinC,mat:'vinyl',seg:56});
  const rp=rng(17);for(let i=0;i<90;i++){const a=PI/2+rp()*PI,y=Y+.04+rp()*.68,rr=rAt(y)*1.04;if(rr<.04)continue;
   k.sphere(.01+rp()*.008,{at:[Math.sin(a)*rr,y,BZ+Math.cos(a)*rr*SZ],scale:[1,1,1],color:k.shade(skinC,rp()<.5?.05:.1),mat:'vinyl',seg:7});}
  k.extrude(scalePts(pear,1.04,0,.36+Y),.06,{at:[0,0,0],color:skinC,mat:'vinyl',bevel:.02});
  k.extrude(pear,.06,{at:[0,0,.012],color:ring,mat:'soft',bevel:.02});
  k.extrude(scalePts(pear,.84,0,.34+Y),.06,{at:[0,0,.022],color:cream,mat:'soft',bevel:.02});
  // The seed sits in its socket; slide it out and it springs back (the working part).
  k.torus(.118,.014,{at:[0,.31+Y,.074],color:k.shade(cream,-.1),mat:'soft'});k.cyl(.11,.11,.006,{at:[0,.31+Y,.073],rot:[PI/2,0,0],color:k.shade(cream,-.16),mat:'matte',seg:32});
  k.sphere(.115,{part:'seed',at:[0,.31+Y,.08],scale:[1,1.04,.95],color:accent,mat:'vinyl'});
  k.sphere(.04,{part:'seed',at:[-.04,.37+Y,.17],scale:[1,.7,.4],color:k.shade(accent,.18),mat:'ink'});
  face(k,'body',{x:0,y:.6+Y,surf:()=>.064,gap:.065,size:.036,mouth:'smile',brows:'#5b7a2a'});
  // A little sprout on top (it bobbles).
  k.cyl(.012,.016,.08,{part:'sprout',at:[0,.8+Y,-.02],color:'#7a5230',mat:'matte',seg:10});
  leaf(k,'sprout',[0,.83+Y,-.02],.12,0,0,'#6fbf4a',-.9);leaf(k,'sprout',[0,.83+Y,-.02],.1,0,0,'#5fae3e',.8);
  for(const s of [-1,1] as const){const p=s<0?'armL':'armR';k.capsule(.024,.1,{part:p,at:[s*.33,.32+Y,.02],rot:[0,0,s*.7],color:skinC,mat:'vinyl'});k.sphere(.032,{part:p,at:[s*.37,.28+Y,.03],color:skinC,mat:'vinyl'});}
  boots(k,{xs:[-.09],top:Y+.04,leg:skinC,boot:'#e94b3c',part:'legL'});boots(k,{xs:[.09],top:Y+.04,leg:skinC,boot:'#e94b3c',part:'legR'});
  k.slider('seed',{axis:[0,0,1],max:.16,release:'return',label:'seed',hint:'Pop my seed'});
  return {kind:{kind:'mechanism'},springs:[{part:'sprout',k:50,c:2.2,amp:1.4}],
   squeeze:['e_seedpop:seed'],poke:{default:['rock'],seed:['e_seedpop:seed'],legL:['kick:legL'],legR:['kick:legR'],sprout:['wiggle:sprout']},tap:['flip','kick:legR'],head:{above:.62+Y},
   voice:{squeeze:['e_tunk','e_tunk:1.15'],poke:['tok:.8'],tap:['whoosh','e_tunk:1.3']}};
 },
 'orange-orbit':(k)=>{
  const {body,accent}=k.c,c:V3=[0,.5,0],R=.3,pith='#fff4dc';
  k.part('leaf',{at:[0,.8,0]});k.part('peel',{at:[0,.12,0]});
  // A dimpled orange (fine pores), a navel stem, two glossy leaves and a tiny blossom.
  k.blob(R,{at:c,amp:.005,freq:24,seed:2,color:body,dark:k.shade(body,-.07),light:k.shade(body,.05),mat:'vinyl',seg:72});
  k.sphere(.04,{at:[0,.795,0],scale:[1,.35,1],color:'#8fa83a',mat:'vinyl'});
  k.cyl(.014,.018,.06,{part:'leaf',at:[0,.82,0],color:'#7a5230',mat:'matte',seg:10});
  leaf(k,'leaf',[0,.84,0],.2,.3,0,accent,-1.0);leaf(k,'leaf',[0,.84,0],.16,-.4,0,k.shade(accent,-.05),.95);
  for(let i=0;i<5;i++){const a=i*PI*2/5;k.sphere(.022,{part:'leaf',at:[-.06+Math.sin(a)*.02,.86,.03+Math.cos(a)*.02],scale:[1,.4,1],color:WHITE,mat:'vinyl',seg:10});}
  k.sphere(.01,{part:'leaf',at:[-.06,.87,.03],color:'#ffd84a',mat:'vinyl',seg:8});
  face(k,'body',{x:0,y:.53,surf:(x,y)=>Math.sqrt(Math.max(0,R*R-x*x-(y-c[1])**2))+.007,gap:.095,size:.046,mouth:'open'});
  // The peel: one curled ribbon from her lower side down to the floor, a little spring she sits on (orange out, pith in).
  const N=44,pt=(t:number):V3=>{const a=-.6+t*PI*2.1,y=.32-t*.285,rr=Math.max(.2,Math.sqrt(Math.max(0,R*R-(y-c[1])**2))*.98*(1-t)+.27*t);return [Math.sin(a)*rr,y,Math.cos(a)*rr];};
  for(let i=0;i<N;i++){const a=pt(i/N),b=pt((i+1)/N),d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],h=Math.hypot(d[0],d[2]),L=Math.hypot(...d)+.012,m:V3=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
   const rot:V3=[0,Math.atan2(-d[2],d[0]),Math.atan2(d[1],h)],rr=Math.hypot(m[0],m[2]);
   k.box(L,.055,.02,{part:'peel',at:m,rot,color:body,mat:'vinyl'});k.box(L,.045,.008,{part:'peel',at:[m[0]-m[0]/rr*.013,m[1],m[2]-m[2]/rr*.013],rot,color:pith,mat:'matte'});}
  return {kind:{kind:'spintop'},soft:{soft:.45},
   squeeze:['e_zest','puff'],poke:{default:['spin'],peel:['d_spring:peel'],leaf:['wiggle:leaf']},tap:['e_curlshot'],head:{above:.68},
   voice:{squeeze:['e_spray'],poke:['tok:1.2','tok:1.5'],tap:['e_spray:1.3','e_wheee']}};
 },
 'cairn-carl':(k)=>{
  const {body,accent}=k.c,moss='#6aa84f';
  k.part('stone3',{at:[-.02,.56,0]});k.part('stone4',{at:[.01,.7,0]});k.part('flag',{at:[0,.76,0]});
  // Granite stones: speckled, each its own shade; the face on the big one; moss and a little alpine flower.
  const stone=(part:string,r:number,at:V3,sc:V3,col:string,seed:number,ang=0)=>k.blob(r,{part,at,rot:[0,0,ang],scale:sc,amp:r*.06,freq:9,seed,color:col,dark:k.shade(col,-.14),light:k.shade(col,.1),mat:'matte',seg:56});
  stone('body',.32,[0,.155,0],[1.15,.42,.95],k.shade(body,-.08),1);
  stone('body',.25,[.01,.37,.01],[1,.58,.86],body,2,.05);
  stone('stone3',.18,[-.02,.565,0],[1,.52,.86],'#b4a998',3,-.1);
  stone('stone4',.12,[.01,.69,0],[1,.58,.9],'#8f9aa3',4,.08);
  // Seats: each stone sits in a worn dip on the one below.
  k.cyl(.11,.13,.01,{at:[-.02,.513,0],color:k.shade(body,-.18),mat:'matte',seg:28});k.cyl(.07,.08,.01,{part:'stone3',at:[.01,.652,0],color:'#9a8f80',mat:'matte',seg:24});
  face(k,'body',{x:.01,y:.39,surf:(x,y)=>ellSurf(.01,.37,.01,.25,.145,.215)(x,y)+.014,gap:.085,size:.036,mouth:'smile'});
  const rm=rng(14);for(let i=0;i<7;i++){const a=PI+(rm()-.5)*2.4,y=.12+rm()*.08;k.sphere(.04+rm()*.02,{at:[Math.sin(a)*.34,y+.06,Math.cos(a)*.27],scale:[1.3,.5,1],color:moss,mat:'soft',seg:14});}
  for(const [x,z] of [[.3,.17],[.22,.2]] as const)k.sphere(.04,{at:[x,.2,z],scale:[1.3,.5,1],color:moss,mat:'soft',seg:14});
  for(let i=0;i<5;i++){const a=i*PI*2/5;k.sphere(.016,{at:[-.28+Math.sin(a)*.018,.22,.18+Math.cos(a)*.018],scale:[1,.4,1],color:WHITE,mat:'vinyl',seg:8});}
  k.sphere(.008,{at:[-.28,.226,.18],color:'#ffd84a',mat:'vinyl',seg:6});
  // The lookout flag on top (it bobbles): a pole, a gold ball and a red pennant with a white ball.
  k.cyl(.012,.014,.36,{part:'flag',at:[0,.92,0],color:'#7a5230',mat:'matte',seg:10});k.sphere(.022,{part:'flag',at:[0,1.105,0],color:'#ffd447',mat:'gold'});
  k.extrude([[0,0],[.24,-.06],[0,-.14]],.018,{part:'flag',at:[.012,1.08,0],color:accent,mat:'vinyl',bevel:.005});
  k.cyl(.022,.022,.022,{part:'flag',at:[.07,1.01,0],rot:[PI/2,0,0],color:WHITE,mat:'vinyl',seg:16});
  return {kind:{kind:'puzzle',pieces:[{part:'flag',name:'the flag'},{part:'stone4',name:'the top stone',after:['flag']},{part:'stone3',name:'the middle stone',after:['stone4']}]},
   springs:[{part:'flag',k:40,c:1.8,amp:1.6},{part:'stone4',k:110,c:4,amp:.4}],
   squeeze:['e_teeter:stone3+stone4'],poke:{default:['e_clack:stone3+stone4'],flag:['d_flagwave:flag']},tap:['d_flagwave:flag','e_teeter:stone4'],head:'stone4',
   voice:{squeeze:['e_stones'],poke:['clack','clack:1.25'],tap:['e_breezewhistle']}};
 },
 'summit-goal-gigi':(k)=>{
  const {body,accent}=k.c,gold='#e8b92e',TURF='#6fbf4a',net=k.shade(accent,.42),post=body;
  k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
  k.part('net',{at:[0,.62,-.05],parent:'inner'});k.part('ball',{at:[.12,.2,.24],parent:'inner'});k.part('lever',{at:[.38,.14,.22],parent:'inner'});
  // The secret capsule: a gold dome with a pearl snow-peak, on a pearl cup with a gold rim.
  const dome:Pt[]=[[.48,.5],[.48,.56],[.45,.7],[.37,.85],[.23,.95],[0,.985]],cupP:Pt[]=[[0,.05],[.2,.06],[.37,.11],[.46,.23],[.48,.36],[.48,.5]];
  const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.02),y] as Pt).reverse();
  k.smoothLathe(dome,{part:'capTop',color:gold,mat:'gold',seg:44});k.smoothLathe(inset(dome),{part:'capTop',color:k.shade(gold,.1),mat:'gold',seg:44});
  k.extrude([[-.13,-.06],[-.03,.08],[.02,.02],[.06,.07],[.14,-.06]],.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:WHITE,mat:'pearl',bevel:.008});
  k.smoothLathe(cupP,{part:'capBot',color:'#fff8ec',mat:'pearl',seg:44});k.smoothLathe(inset(cupP),{part:'capBot',color:'#fffaf0',mat:'pearl',seg:44});
  k.torus(.48,.02,{part:'capBot',at:[0,.48,0],rot:[PI/2,0,0],color:gold,mat:'gold'});k.cyl(.2,.24,.05,{part:'capBot',at:[0,.025,0],color:gold,mat:'gold',seg:36});
  // Inside: a rocky summit plinth with a turf top and pitch lines, the goal (posts, net with her face), a ball, a pennant and a kick lever.
  k.blob(.42,{part:'inner',at:[0,.088,0],scale:[1.12,.18,.82],amp:.025,freq:6,seed:7,color:'#9a9a9a',dark:'#6f7377',light:'#c4c4c0',mat:'matte',seg:48});
  k.cyl(.44,.44,.04,{part:'inner',at:[0,.1,0],scale:[1.05,1,.75],color:TURF,mat:'matte',seg:48});
  for(const [w,d,x,z] of [[.7,.012,0,.06],[.012,.12,-.2,.12],[.012,.12,.2,.12],[.4,.012,0,.18]] as const)k.box(w,.004,d,{part:'inner',at:[x,.122,z],color:WHITE,mat:'matte'});
  for(const s of [-1,1]){k.cyl(.026,.026,.52,{part:'inner',at:[s*.36,.38,.06],color:post,mat:'vinyl',seg:20});
   k.cyl(.012,.012,.42,{part:'inner',at:[s*.36,.35,-.12],rot:[.55,0,0],color:post,mat:'vinyl',seg:10});k.cyl(.012,.012,.24,{part:'inner',at:[s*.36,.13,-.06],rot:[PI/2,0,0],color:post,mat:'vinyl',seg:10});}
  k.cyl(.026,.026,.75,{part:'inner',at:[0,.64,.06],rot:[0,0,PI/2],color:post,mat:'vinyl',seg:20});k.cyl(.012,.012,.72,{part:'inner',at:[0,.13,-.24],rot:[0,0,PI/2],color:post,mat:'vinyl',seg:10});
  // The net: a soft sheet sloping back from the bar, strings over it, mesh on the sides; her face on it.
  const TH=.55,cs=Math.cos(TH),sn=Math.sin(TH),onNet=(u:number,x:number,off=0):V3=>[x,.62-u*.48*cs+off*sn*0,.04-u*.48*sn+off];
  k.box(.7,.5,.008,{part:'net',at:onNet(.5,0),rot:[TH,0,0],color:net,mat:'soft'});
  for(let i=-4;i<=4;i++)k.box(.008,.5,.006,{part:'net',at:onNet(.5,i*.08,.008),rot:[TH,0,0],color:WHITE,mat:'matte'});
  for(let j=1;j<6;j++)k.box(.7,.008,.006,{part:'net',at:onNet(j/6,0,.008),rot:[TH,0,0],color:WHITE,mat:'matte'});
  for(const s of [-1,1]){k.extrude([[.04,.6],[-.24,.13],[.04,.13]],.006,{part:'net',at:[s*.355,0,0],rot:[0,PI/2,0],color:net,mat:'soft',bevel:.002});
   for(const y of [.25,.4])k.box(.006,.008,.2,{part:'net',at:[s*.36,y,-.06],color:WHITE,mat:'matte'});}
  const nf=onNet(.32,0,.014);k.part('eyes',{at:nf,parent:'net'});
  for(const s of [-1,1] as const){const n=s<0?'eyeL':'eyeR',p=onNet(.32,s*.09,.014);k.part(n,{at:p,parent:'eyes'});
   k.sphere(.042,{part:n,at:p,rot:[TH,0,0],scale:[1,1.28,.45],color:INK,mat:'ink'});k.sphere(.016,{part:n,at:onNet(.29,s*.09+.015,.03),color:WHITE,mat:'ink'});}
  k.torus(.045,.012,{part:'net',arc:PI,rot:[TH,0,PI],at:onNet(.5,0,.012),color:INK,mat:'ink'});
  for(const s of [-1,1])k.sphere(.034,{part:'net',at:onNet(.45,s*.17,.008),rot:[TH,0,0],scale:[1.3,.8,.35],color:BLUSH,mat:'matte'});
  football(k,'ball',[.12,.18,.24],.055);
  k.cyl(.008,.008,.3,{part:'inner',at:[-.4,.27,.18],color:WHITE,mat:'vinyl',seg:8});k.extrude([[0,0],[.15,-.04],[0,-.09]],.012,{part:'inner',at:[-.395,.41,.18],color:accent,mat:'vinyl',bevel:.004});
  // The kick lever: a little boot on a post; pull it and the ball flies into her net.
  k.cyl(.014,.014,.1,{part:'lever',at:[.38,.17,.22],color:'#7a5230',mat:'matte',seg:10});k.sphere(.04,{part:'lever',at:[.38,.23,.24],scale:[1,.6,1.4],color:'#e94b3c',mat:'vinyl'});
  k.proxy('lever',.09,[.38,.2,.22]);
  k.lever('lever',{axis:'x',max:.9,label:'kick lever',hint:'Kick it',fires:{part:'ball',at:.7,lift:[-.12,.2,-.32],hold:1.2}});
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},
   squeeze:['e_netripple:net'],poke:{default:['e_ping:inner','e_netripple:net'],ball:['e_goalshot:ball','e_netripple:net']},tap:['e_goalshot:ball','e_netripple:net','sparkle'],head:{above:.52},
   voice:{squeeze:['e_netswish'],poke:['e_postping'],tap:['e_netswish','e_postping:1.2']}};
 },
};
export default set;
