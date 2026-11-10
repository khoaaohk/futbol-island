/**
 * Onigiri Pals (gs-square-snacks): the round 3B pilot (Nov 9 2026; docs/gashapon-design.md "Round 3B"). Built with the HD kit
 * (lib/gashapon/toyKit.ts `hd`: physical finishes, smooth profiles) and each toy plays its KIND (lib/gashapon/toyKinds.ts):
 *   Onigiri Ollie   take-apart: the nori wrap slides off, the top of the rice lifts, a plum filling sits inside (bonus: squishy)
 *   Melon Pan Mimi  squishy with a crackly sugar crust (bonus: flick to spin)
 *   Nikuman Nico    a very soft steamed bun, puffs steam on let-go (bonus: the pleated top twist bobbles)
 *   Karaage Kai     wind-up walker: a gold key on his back, little sneakers (bonus: a crunchy squeeze)
 *   Oden Odie       take-apart stack: konnyaku, egg and daikon come off the skewer and go back in order (bonus: they bobble)
 *   Golden Onigiri  the rare: a gold secret capsule, twist it open; inside, a glitter-gold onigiri on a red cushion with a star
 * Model space: stands on y = 0, about 1 tall, front +z. Each keeps its row in lib/gashapon/toys.ts (words, link, personality).
 */
import * as T from 'three';
import type {ToyKit,ToyModelSet,V3} from '../toyKit';

type Pt=readonly [number,number];
/** A rounded triangle outline (apex up) centred at (0, cy), as points. */
function triOutline(r:number,round:number,cy:number):Pt[]{
 const sh=new T.Shape(),pts=[0,1,2].map(i=>{const a=Math.PI/2+i*2*Math.PI/3;return new T.Vector2(Math.cos(a)*r,Math.sin(a)*r+cy);});
 for(let i=0;i<3;i++){const p=pts[i],n=pts[(i+1)%3],pr=pts[(i+2)%3],a=p.clone().lerp(pr,round),b=p.clone().lerp(n,round);if(i===0)sh.moveTo(a.x,a.y);else sh.lineTo(a.x,a.y);sh.quadraticCurveTo(p.x,p.y,b.x,b.y);}
 sh.closePath();return sh.getPoints(14).map(p=>[p.x,p.y] as Pt);
}
/** Keep the part of a convex outline above (keep = 1) or below (−1) the line y = at. */
function clipY(poly:readonly Pt[],at:number,keep:1|-1):Pt[]{const out:Pt[]=[];const inside=(p:Pt)=>(p[1]-at)*keep>=0;
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(at-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,at]);}}
 return out;}
const inPoly=(poly:readonly Pt[],x:number,y:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
function rng(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
/** Rice grains on the flat faces of an onigiri outline (both sides), split between two parts at y = split. */
function riceGrains(k:ToyKit,poly:readonly Pt[],halfDepth:number,n:number,rice:string,split:number,top:string,bottom:string,seed=3,mat:'soft'|'glitter'='soft'){
 const r=rng(seed);let made=0,tries=0;const shades=[k.shade(rice,.03),k.shade(rice,-.04),k.shade(rice,-.08)];
 while(made<n&&tries<n*20){tries++;const x=(r()-.5)*1.2,y=r()*1.0;if(!inPoly(poly,x,y)||!inPoly(poly,x*1.12,y)||!inPoly(poly,x,y+.05)||!inPoly(poly,x,y-.05))continue;
  const side=made%2?1:-1,part=y>split?top:bottom;if(Math.abs(y-split)<.025)continue;
  k.sphere(.022,{part,at:[x,y,side*(halfDepth+.004)],rot:[0,0,r()*Math.PI],scale:[1.5,.8,.45],color:shades[made%3],seg:7,mat});made++;}
}
function feet(k:ToyKit,shoe:string,y=.05,gap=.12){for(const s of [-1,1])k.sphere(.08,{part:'feet',at:[s*gap,y,.07],scale:[1,.62,1.3],color:shoe,mat:'vinyl'});}

const set:ToyModelSet={
 'onigiri-ollie':(k)=>{
  const rice=k.c.body,nori=k.shade(k.c.accent,.04),cy=.37,R=.6,D=.42,SPLIT=.47;
  const outline=triOutline(R,.36,cy);
  k.part('riceTop',{at:[0,SPLIT,0]});k.part('nori',{at:[0,.2,0]});k.part('plum',{at:[0,SPLIT,.02]});
  k.part('armL',{at:[-.4,.34,0]});k.part('armR',{at:[.4,.34,0]});k.part('feet',{at:[0,.05,0]});
  // The rice ball in two halves (they meet at y = SPLIT; bevelled, so the seam reads as two pieces).
  k.extrude(clipY(outline,SPLIT,-1),D,{color:rice,mat:'soft',bevel:.085});
  k.extrude(clipY(outline,SPLIT,1),D,{part:'riceTop',color:rice,mat:'soft',bevel:.085});
  riceGrains(k,outline,D/2,150,rice,SPLIT,'riceTop','body');
  // The plum (umeboshi) filling: wrinkled, glossy, half sunk in a hollow in the bottom half.
  k.sphere(.1,{part:'plum',at:[0,SPLIT+.01,.02],scale:[1,.86,.9],color:'#c92f4b',mat:'jelly'});
  for(let i=0;i<5;i++){const a=i*1.26;k.sphere(.03,{part:'plum',at:[Math.cos(a)*.07,SPLIT+.05,.02+Math.sin(a)*.06],scale:[1.2,.5,1],color:'#a8203a',mat:'vinyl'});}
  k.torus(.115,.018,{at:[0,SPLIT,.02],rot:[Math.PI/2,0,0],color:k.shade(rice,-.1),mat:'soft'});// the hollow's rim
  // The nori wrap: a crisp sheet round the bottom, with its pressed ridges.
  k.rbox(.5,.3,D+.05,.035,{part:'nori',at:[0,.2,0],color:nori,mat:'nori'});
  for(const y of [.11,.2,.29])k.box(.505,.006,D+.056,{part:'nori',at:[0,y,0],color:k.shade(nori,.07),mat:'nori'});
  k.face('riceTop',{at:[0,.64,D/2+.006],gap:.12,size:.042});
  for(const s of [-1,1] as const)k.capsule(.055,.1,{part:s<0?'armL':'armR',at:[s*.43,.32,0],rot:[0,0,s*.95],color:rice,mat:'soft'});
  feet(k,k.shade(rice,-.12));
  return {kind:{kind:'puzzle',pieces:[{part:'nori',name:'the nori wrap'},{part:'riceTop',name:'the top of the rice',after:['nori']},{part:'plum',name:'the plum filling',after:['riceTop']}]},
   soft:{soft:.35},
   squeeze:['jiggle'],poke:{default:['wobble'],armL:['wave:armL'],armR:['wave:armR'],feet:['hop']},tap:['bow'],head:'riceTop',
   voice:{squeeze:['squish','mmhm'],poke:['giggle'],tap:['mmhm:1.2']}};
 },
 'melon-pan-mimi':(k)=>{
  const {body,accent}=k.c,crust='#'+new T.Color(accent).lerp(new T.Color(body),.3).lerp(new T.Color('#fff8e0'),.18).getHexString(),groove=k.shade(crust,-.17),sugar='#fffdf2';
  k.part('crust',{at:[0,.38,0]});k.part('armL',{at:[-.5,.24,0]});k.part('armR',{at:[.5,.24,0]});k.part('feet',{at:[0,.04,0]});
  // The bun underneath: a soft golden ring.
  k.smoothLathe([[0,.02],[.36,.02],[.48,.07],[.535,.18],[.52,.3],[.42,.4],[0,.42]],{color:body,mat:'soft'});
  // The cookie crust dome with a diamond grid pressed in, and sugar crystals.
    // The cookie crust: a dome that overhangs the bun a little (a closed underside), never covering the face below it.
  k.smoothLathe([[0,.285],[.5,.285],[.572,.31],[.56,.36],[.5,.43],[.38,.5],[.2,.54],[0,.552]],{part:'crust',color:crust,mat:'soft'});
  // The pressed diamond grid: dark grooves laid ON the dome (sampled from its own profile), five each way.
  const prof:Pt[]=[[.572,.31],[.56,.36],[.5,.43],[.38,.5],[.2,.54],[0,.552]],domeY=(r:number)=>{if(r>=.572)return .31;for(let i=0;i<prof.length-1;i++){const [r0,y0]=prof[i],[r1,y1]=prof[i+1];if(r<=r0&&r>=r1){const t=(r0-r)/(r0-r1);return y0+(y1-y0)*t;}}return .552;};
  for(const a of [Math.PI/4,-Math.PI/4])for(const off of [-.34,-.17,0,.17,.34]){const dir=[Math.cos(a),Math.sin(a)],perp=[-dir[1],dir[0]],pts:V3[]=[];
   for(let t=-.6;t<=.6;t+=.04){const x=perp[0]*off+dir[0]*t,z=perp[1]*off+dir[1]*t,r=Math.hypot(x,z);if(r>.55)continue;pts.push([x,domeY(r)+.007,z]);}
   if(pts.length>2)k.tube(pts,.012,{part:'crust',color:groove,mat:'matte'});}
  const rr=rng(11);for(let i=0;i<70;i++){const a=rr()*Math.PI*2,d=Math.sqrt(rr())*.48,x=Math.cos(a)*d,z=Math.sin(a)*d;if(z<-.1&&rr()<.5)continue;
   k.box(.022,.014,.022,{part:'crust',at:[x,domeY(Math.hypot(x,z))+.006,z],rot:[rr(),rr()*3,rr()],color:sugar,mat:'ink'});}
  k.face('body',{at:[0,.2,.52],sphere:[0,.2,0,.535],gap:.14,size:.043});
  for(const s of [-1,1] as const)k.sphere(.075,{part:s<0?'armL':'armR',at:[s*.53,.2,.06],scale:[.8,1,.8],color:body,mat:'soft'});
  for(const s of [-1,1])k.sphere(.06,{part:'feet',at:[s*.16,.03,.3],scale:[1,.55,1.2],color:k.shade(body,-.15),mat:'vinyl'});
  return {kind:{kind:'squish'},soft:{soft:.55,crackle:true},flick:true,
   squeeze:['pop:crust'],poke:{default:['wobble'],armL:['wave:armL'],armR:['wave:armR']},tap:['sparkle','hop'],head:'crust',
   voice:{squeeze:['crispy'],poke:['pip'],tap:['sparkle','pip:1.3']}};
 },
 'nikuman-nico':(k)=>{
  const {body,accent}=k.c,pleat=k.shade(body,-.07);
  k.part('top',{at:[0,.77,0]});k.part('paper',{at:[0,0,0]});
  k.rbox(.92,.035,.92,.012,{part:'paper',at:[0,.018,0],color:accent,mat:'matte'});
  k.rbox(.9,.004,.9,.01,{part:'paper',at:[0,.037,0],color:k.shade(accent,.12),mat:'matte'});
  // A tall, soft steamed bun.
  k.smoothLathe([[0,.04],[.38,.04],[.5,.12],[.545,.26],[.51,.42],[.41,.56],[.26,.68],[.1,.755],[0,.765]],{color:body,mat:'soft'});
  // Fourteen pleats swirling up into the twist: each a soft ridge laid along the dome.
  const up=new T.Vector3(0,1,0),q=new T.Quaternion(),e=new T.Euler();
  for(let i=0;i<14;i++){const a=i*Math.PI*2/14,p1=new T.Vector3(Math.sin(a+.3)*.08,.752,Math.cos(a+.3)*.08),p2=new T.Vector3(Math.sin(a)*.36,.6,Math.cos(a)*.36),d=p2.clone().sub(p1),mid=p1.clone().add(p2).multiplyScalar(.5);
   mid.add(new T.Vector3(Math.sin(a)*.012,.01,Math.cos(a)*.012));e.setFromQuaternion(q.setFromUnitVectors(up,d.clone().normalize()));
   k.capsule(.024,Math.max(.01,d.length()-.04),{at:[mid.x,mid.y,mid.z],rot:[e.x,e.y,e.z],scale:[1,1,.7],color:pleat,mat:'soft'});}
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.capsule(.026,.06,{part:'top',at:[Math.sin(a)*.04,.79,Math.cos(a)*.04],rot:[Math.cos(a)*.7,0,-Math.sin(a)*.7],color:k.shade(body,-.05),mat:'soft'});}
  k.sphere(.05,{part:'top',at:[0,.82,0],scale:[1,1.15,1],color:k.shade(body,-.03),mat:'soft'});
  k.face('body',{at:[0,.34,.5],sphere:[0,.3,0,.54],gap:.13,size:.05,mouth:'open'});
  return {kind:{kind:'squish'},soft:{soft:.85},springs:[{part:'top',k:55,c:2.2,amp:1.5}],
   squeeze:['puff'],poke:{default:['blink'],paper:['wobble']},tap:['hop','puff'],head:'top',
   voice:{squeeze:['puff'],poke:['yawn'],tap:['boing:.8','pip']}};
 },
 'karaage-kai':(k)=>{
  const {body,accent}=k.c,dark=k.shade(body,-.12),light=k.shade(body,.1),shoe='#fff6e4';
  k.part('legL',{at:[-.13,.18,0]});k.part('legR',{at:[.13,.18,0]});k.part('band',{at:[0,.7,0]});k.part('armL',{at:[-.33,.46,0]});k.part('armR',{at:[.33,.46,0]});
  k.part('key',{at:[0,.5,-.38]});
  // Crispy fried batter: one lumpy blob (smooth noise pushed along the normals), hollows toasted dark, peaks golden; a few
  // craggy flakes stand proud on top.
  k.blob(.35,{at:[0,.5,0],scale:[1.05,.95,.95],amp:.03,freq:6.5,seed:3,color:body,dark:k.shade(body,-.22),light:'#f6c766',mat:'vinyl'});
  const r=rng(5),z0=new T.Vector3(0,0,1),qq=new T.Quaternion(),ee=new T.Euler();
  for(let i=0;i<34;i++){const u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u),n=new T.Vector3(s*Math.cos(a),u,s*Math.sin(a));if(n.z>.35&&Math.abs(n.x)<.6&&n.y>-.45&&n.y<.55)continue;if(n.y<-.6)continue;
   const p=new T.Vector3(n.x*.37,.5+n.y*.33,n.z*.34);ee.setFromQuaternion(qq.setFromUnitVectors(z0,n));
   k.blob(.045+r()*.03,{at:[p.x,p.y,p.z],rot:[ee.x,ee.y,ee.z],scale:[1,1,.45],amp:.012,freq:5,seed:i,color:light,dark:k.shade(body,-.18),mat:'matte',seg:14});}
  k.torus(.305,.038,{part:'band',at:[0,.7,0],rot:[Math.PI/2+.1,0,0],color:accent,mat:'matte'});
  for(const s of [-1,1])k.box(.06,.13,.025,{part:'band',at:[s*.05,.66,-.33],rot:[.2,0,s*.5],color:accent,mat:'matte'});// the knot's tails
  k.face('body',{at:[0,.52,.33],sphere:[0,.5,0,.348],gap:.12,size:.045});
  for(const s of [-1,1] as const){const leg=s<0?'legL':'legR';k.capsule(.05,.1,{part:leg,at:[s*.13,.11,0],color:dark,mat:'matte'});
   k.sphere(.075,{part:leg,at:[s*.13,.045,.045],scale:[1,.6,1.35],color:shoe,mat:'vinyl'});k.box(.1,.012,.12,{part:leg,at:[s*.13,.008,.05],color:'#e94b3c',mat:'matte'});
   k.capsule(.045,.08,{part:s<0?'armL':'armR',at:[s*.36,.42,.04],rot:[0,0,s*.7],color:light,mat:'vinyl'});}
  // The wind-up key on his back: a shaft and a butterfly grip, polished gold.
  k.cyl(.025,.025,.14,{part:'key',at:[0,.5,-.33],rot:[Math.PI/2,0,0],color:'#d9b13b',mat:'gold'});
  for(const s of [-1,1])k.cyl(.075,.075,.025,{part:'key',at:[s*.075,.5,-.41],rot:[Math.PI/2,0,0],scale:[1,1,.75],color:'#e8c14a',mat:'gold'});
  k.sphere(.035,{part:'key',at:[0,.5,-.41],color:'#e8c14a',mat:'gold'});
  return {kind:{kind:'windup',key:'key',legs:['legL','legR'],arms:['armL','armR']},soft:{soft:.25,crackle:true},springs:[{part:'band',k:80,c:3,amp:.8}],
   squeeze:['bounce'],poke:{default:['jiggle','puff'],legL:['kick:legL'],legR:['kick:legR'],band:['wiggle:band']},tap:['kickup','kick:legR'],head:{above:.68},
   voice:{squeeze:['crunch','boing:1.2'],poke:['sizzle'],tap:['pop','pip']}};
 },
 'oden-odie':(k)=>{
  const {body,accent}=k.c,stick='#d9b77a',broth='#d8a24a';
  k.part('low',{at:[0,.3,0]});k.part('mid',{at:[0,.58,0]});k.part('top',{at:[0,.88,0]});
  // A little oden pot of broth the skewer stands in.
  k.smoothLathe([[0,0],[.3,0],[.36,.05],[.37,.14],[.33,.15],[0,.15]],{color:k.shade(body,-.32),mat:'vinyl'});
  k.cyl(.32,.32,.012,{at:[0,.135,0],color:broth,mat:'jelly',seg:40});
  k.cyl(.02,.02,1.12,{at:[0,.62,0],color:stick,mat:'matte',seg:10});
  k.cone(.02,.05,{at:[0,1.2,0],color:stick,mat:'matte',seg:10});
  // Daikon: a thick translucent radish round, with its stained rim.
  k.cyl(.22,.22,.2,{part:'low',at:[0,.3,0],color:accent,mat:'jelly',seg:44});
  k.torus(.205,.018,{part:'low',at:[0,.4,0],rot:[Math.PI/2,0,0],color:k.shade(broth,-.05),mat:'jelly'});k.torus(.205,.018,{part:'low',at:[0,.2,0],rot:[Math.PI/2,0,0],color:k.shade(broth,-.05),mat:'jelly'});
  // A broth-stained boiled egg.
  k.sphere(.16,{part:'mid',at:[0,.58,0],scale:[1,1.15,1],color:body,mat:'vinyl'});
  // Konnyaku: a grey speckled triangle.
  k.extrude(triOutline(.21,.3,0).map(([x,y])=>[x,y+.88] as Pt),.1,{part:'top',color:'#8c7f76',mat:'matte',bevel:.025});
  const r=rng(9);for(let i=0;i<26;i++){const x=(r()-.5)*.26,y=.84+(r()-.5)*.14;if(!inPoly(triOutline(.18,.3,.88),x,y))continue;k.sphere(.01,{part:'top',at:[x,y,(i%2?1:-1)*.052],color:'#4d4540',seg:6,mat:'ink'});}
  k.face('low',{at:[0,.31,.225],gap:.08,size:.03,prefix:'low'});
  k.face('mid',{at:[0,.6,.17],sphere:[0,.58,0,.175],gap:.07,size:.03});
  k.face('top',{at:[0,.86,.056],gap:.06,size:.025,prefix:'top',blush:false});
  return {kind:{kind:'puzzle',pieces:[{part:'top',name:'the konnyaku'},{part:'mid',name:'the egg',after:['top']},{part:'low',name:'the daikon',after:['mid']}]},
   springs:[{part:'top',k:70,c:2.6,amp:.9},{part:'mid',k:90,c:3,amp:.6}],
   squeeze:['sway','wiggle:low+mid+top'],poke:{default:['wiggle:mid'],low:['wiggle:low'],mid:['wiggle:mid'],top:['wiggle:top']},tap:['hop','pop:low+mid+top'],head:'top',
   voice:{squeeze:['boop:.8','boop','boop:1.2'],poke:['boop:1.1'],tap:['cheer']}};
 },
 'golden-onigiri':(k)=>{
  const gold=k.c.body,deep=k.shade(gold,-.3),cy=.42;
  // The secret capsule: a gold bottom and a pearly top, split at the waist; the toy waits inside.
  k.part('capTop',{at:[0,.7,0]});k.part('capBot',{at:[0,.3,0]});k.part('inner',{at:[0,0,0]});
  k.part('star',{at:[0,1.03,0],parent:'inner'});k.part('armL',{at:[-.36,.4,0],parent:'inner'});k.part('armR',{at:[.36,.4,0],parent:'inner'});
  // Each half is a shell: an outside and a slightly smaller inside turned the other way (so it reads as a hollow cup when open).
  const dome:Pt[]=[[.47,.5],[.47,.56],[.44,.7],[.36,.84],[.22,.93],[0,.965]],cup:Pt[]=[[0,.06],[.2,.07],[.36,.12],[.45,.24],[.47,.36],[.47,.5]];
  const inset=(pts:Pt[])=>pts.map(([r,y])=>[Math.max(0,r-.022),y] as Pt).reverse();
  k.smoothLathe(dome,{part:'capTop',color:'#fff3cf',mat:'pearl',seg:56});k.smoothLathe(inset(dome),{part:'capTop',color:'#fff8e6',mat:'pearl',seg:56});
  k.torus(.46,.012,{part:'capTop',at:[0,.5,0],rot:[Math.PI/2,0,0],color:'#fff8e6',mat:'pearl'});
  // A gold star on the front: the secret's mark.
  const star:Pt[]=[];for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?.045:.1;star.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  k.extrude(star,.03,{part:'capTop',at:[0,.74,.425],rot:[-.62,0,0],color:'#e8b92e',mat:'gold',bevel:.008});
  k.smoothLathe(cup,{part:'capBot',color:gold,mat:'gold',seg:56});k.smoothLathe(inset(cup),{part:'capBot',color:k.shade(gold,.12),mat:'gold',seg:56});
  k.torus(.475,.018,{part:'capBot',at:[0,.48,0],rot:[Math.PI/2,0,0],color:deep,mat:'gold'});
  k.cyl(.2,.24,.06,{part:'capBot',at:[0,.03,0],color:deep,mat:'gold',seg:40});
  // Inside: a red cushion (the rare's extra part), the glitter-gold onigiri and its star.
  k.rbox(.72,.08,.56,.04,{part:'inner',at:[0,.04,0],color:'#d23a3a',mat:'soft'});
  for(const [x,z] of [[-.34,-.26],[.34,-.26],[-.34,.26],[.34,.26]] as const)k.sphere(.035,{part:'inner',at:[x,.06,z],color:'#ffd447',mat:'gold'});
  const outline=triOutline(.52,.36,cy);
  k.extrude(outline,.38,{part:'inner',color:gold,mat:'glitter',bevel:.08});
  riceGrains(k,outline,.19,90,gold,9,'inner','inner',4,'glitter');
  k.rbox(.44,.24,.42,.03,{part:'inner',at:[0,.26,0],color:deep,mat:'gold'});
  k.face('inner',{at:[0,.62,.196],gap:.11,size:.04,prefix:'in'});
  for(const s of [-1,1] as const)k.capsule(.05,.09,{part:s<0?'armL':'armR',at:[s*.38,.38,0],rot:[0,0,s*.95],color:gold,mat:'glitter'});
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.cone(.035,.12,{part:'star',at:[Math.sin(a)*.06,1.03+Math.cos(a)*.06,0],rot:[0,0,-a],color:k.c.accent,mat:'gold',seg:10});}
  k.sphere(.05,{part:'star',at:[0,1.03,0],color:'#ffe066',mat:'gold'});
  const at:V3=[0,.5,0];void at;
  return {kind:{kind:'capsule',top:'capTop',bottom:'capBot',inner:'inner'},soft:{soft:.35},springs:[{part:'star',k:60,c:2.4,amp:1.2}],
   squeeze:['glow'],poke:{default:['sparkle','wobble'],star:['spin','sparkle']},tap:['wobble','glow'],head:'star',
   voice:{squeeze:['chime'],poke:['sparkle'],tap:['bell']}};
 },
};
export default set;
