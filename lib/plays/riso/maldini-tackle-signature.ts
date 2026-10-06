/** Iconic-play film · Paolo Maldini, "Signature: the perfect clean tackle" — shown through one real, sourced moment: Brazil v Italy, World Cup
 * final, 17 July 1994, Rose Bowl, Pasadena (0–0 after extra time, Brazil won 3–2 on penalties), about the 17th minute.
 *
 * WHY THIS MOMENT: Maldini's signature (lib/town/iconicPlays.json) is a trait, not one goal — the clean challenge that wins the ball without
 * diving in. The written accounts of the 1994 final record a specific Maldini moment: Romário slipped the ball through to Bebeto on the left
 * of Italy's penalty area, Bebeto crossed instead of shooting, and the cross was deflected behind off Maldini. It is a block rather than a
 * sliding tackle, so the film says exactly that ("the ball bounces off Maldini and out for a corner") and never claims a slide: the lesson is
 * the signature itself — wait, stay on your feet, win it cleanly, don't dive in — which the Maldini accounts describe as his way of defending.
 *
 * A faithful recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Italy's goal line at X=0, Z across,
 * away from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on the side (Romário to Bebeto, Maldini across
 * and waiting, the cross, blocked); 2 a TV slow-motion replay from a low camera upfield, side-on (Maldini stays on his feet and waits; his leg meets
 * the cross); 3 a second replay from behind Italy's goal (the ball flies off him and behind for a corner; nobody on the grass); 4 the lesson
 * (the only chapter with teaching marks: the gap he keeps, his feet on the grass, the clean block, a crossed-out dive). No overlays inside the
 * footage chapters.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "1994 FIFA World Cup final" (match summary, citing Rob King, "World Cup giants fail to break deadlock", The Birmingham Post,
 *    18 July 1994, p. 26, and Mike Downey, Los Angeles Times, 18 July 1994; line-ups; kit boxes): https://en.wikipedia.org/wiki/1994_FIFA_World_Cup_final
 *  - Wikipedia, "Paolo Maldini" (style of play: a precise tackler who "often avoided committing to challenges when he deemed them unnecessary,
 *    preferring to restrict the offensive play of his opponents through his positioning"): https://en.wikipedia.org/wiki/Paolo_Maldini
 *  - Wikipedia, "1994 UEFA Champions League final" (checked as an alternative; no single sourced Maldini tackle, not used).
 * CONFIRMED by those accounts: the match, date (17 July 1994), venue (Rose Bowl, Pasadena), 12:30 pm kick-off in daylight and heat (38 °C);
 * about the 17th minute ("four minutes" after a 13th-minute Romário header) Romário passed the ball through to Bebeto on the LEFT side of the
 * penalty area; instead of shooting Bebeto crossed; the cross deflected behind off Paolo Maldini. Maldini started at centre-back (5) beside
 * Baresi (6, captain); Mussi (8) right-back until the 35th minute; Pagliuca (1) in goal; Bebeto 7, Romário 11. Kits: Italy blue shirts, white
 * shorts, blue socks; Brazil yellow shirts, blue shorts, white socks. The second half: Brazil "unable to break through the centre-back
 * pairing of Franco Baresi and Paolo Maldini". The final finished 0–0.
 * INFERRED (not in the accounts): which end Italy defended on screen (here their goal is screen-left from the main camera), every position,
 * path and timing, that the cross was low and driven, Bebeto's crossing foot (left, drawn but never narrated) and Maldini's blocking leg
 * (right, drawn but never narrated), that Maldini came across from the middle and waited on his feet (his style per the sources, not a frame
 * of this clip), the angle of the deflection and where the ball stopped, all other players (drawn without names; only the verified numbers
 * are printed), the camera placements and lenses, Pagliuca's shirt colour (a neutral grey), hair and skin tones, and the San Gabriel
 * mountains behind the north end (real geography; the main camera is placed on the west side, the Rose Bowl press-box side). The narration
 * names only the confirmed beats.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,slideTackle,backpedal,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';
import {beats,shotAt,reframe,steady,near,type Keep,type Pin,type ShotParams,type Beats,type View as DView} from './director';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,5]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The final',text:'Pasadena, 1994: the World Cup final. Brazil attack Italy. Romário slips the ball to Bebeto, on the left of the box. Paolo Maldini stays close… Bebeto crosses. Blocked!',seconds:13.2,
  cues:[[0,'Pasadena'],[3.3,'Brazil attack'],[4.8,'Romário slips'],[6.1,'Bebeto, on the left'],[8.2,'Paolo Maldini stays close'],[10.2,'Bebeto crosses'],[11.4,'Blocked']]},
 {label:'The replay',text:'Watch again, slowly. Maldini doesn’t dive in. He stays on his feet, and waits. Bebeto crosses, and Maldini’s leg is right there.',seconds:10.2,
  cues:[[0,'Watch again'],[1.7,'Maldini doesn’t dive in'],[3.6,'He stays on his feet'],[6,'Bebeto crosses'],[7.3,'Maldini’s leg is right there']]},
 {label:'Clean',text:'The ball bounces off Maldini and out for a corner. No foul, no fall: just clean defending.',seconds:8.2,
  cues:[[0,'The ball bounces off Maldini'],[2.2,'out for a corner'],[3.8,'No foul'],[5.4,'just clean defending']]},
 {label:'The lesson',text:'That’s Maldini. Wait for the right moment, stay on your feet, and win the ball cleanly. Don’t dive in!',seconds:10,
  cues:[[0,'That’s Maldini'],[1.5,'Wait for the right moment'],[3.6,'stay on your feet'],[5,'win the ball cleanly'],[6.9,'Don’t dive in']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py maldini-tackle-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/maldini-tackle-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/maldini-tackle-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',O='orange',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030);DV={w:s.W/base,h:s.H/base};const a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1500,h:1030};
/** the director (lib/plays/riso/director.ts): move an authored camAt() camera toward a shot, then rebuild it with camAt */
const HERO_H=2;// figures print 10 % over life size (FIG)
const pinOf=(c:{pos:V3;target:V3;F:number}):Pin=>({eye:c.pos,target:c.target,F:c.F});
const camOf=(p:Pin)=>camAt(p.eye,p.target,p.F);
/** a player's feet and head as keep points (weight w: 1 = hard, must stay in frame) */
const kp=(p:[number,number],w:number):Keep[]=>w>.01?[{P:[p[0],0,p[1]],w:Math.min(1,w)},{P:[p[0],HERO_H,p[1]],w:Math.min(1,w)}]:[];
const OTHERS=(T:number,skip:string[]):V3[]=>TRACKS.filter(k=>!skip.includes(k.id)).map(k=>{const p=trackAt(k.keys,T);return[p[0],0,p[1]] as V3;});
/** the directed camera at chapter time t (half: the steadiness window; 0 = no averaging) */
function direct(t:number,B:Beats,authored:(t:number)=>{pos:V3;target:V3;F:number},subj:(t:number)=>{hero:V3;ball:V3;keep:Keep[];recenter?:number},half=.35):Cam{
 const sh:ShotParams=shotAt(t,B);if(sh.k<=1e-4&&shotAt(t+half,B).k<=1e-4)return camOf(pinOf(authored(t)));
 return camOf(steady(t,u=>{const S=subj(u);return reframe(pinOf(authored(u)),{hero:S.hero,ball:S.ball,keep:S.keep,height:HERO_H},shotAt(u,B),DV,{recenter:S.recenter??0});},half));
}
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};

// ---------------------------------------------------------------- the Rose Bowl: one open bowl of seats, the grass, markings, goals
/** The bowl's inner rim: a rounded rectangle (superellipse) round the pitch, the seats rising from it on every side, no roof. */
const BOWL={cx:52.5,cz:34,a:63,b:45,n:4.2,rows:22,step:1.8,rise:.52,segs:40};
function bowlPt(u:number,d:number,y:number):V3{const th=u*TAU,c=Math.cos(th),s=Math.sin(th),e=2/BOWL.n;return[BOWL.cx+(BOWL.a+d)*Math.sign(c)*Math.abs(c)**e,y,BOWL.cz+(BOWL.b+d)*Math.sign(s)*Math.abs(s)**e];}
const TIER_INK:[string,number][]=[[O,.3],[B,.2],[Y,.3],[O,.18],[K,.18],[B,.3],[O,.42],[Y,.18]];
/** the San Gabriel mountains beyond the north end (screen-left from the west-side main camera): one far ridge, one tone */
const RIDGE:V3[]=(()=>{const r:V3[]=[[-700,0,-700]];const pk=[40,95,70,130,88,150,105,120,75,110,60];pk.forEach((h,i)=>r.push([-700,h,-700+i*1500/(pk.length-1)]));r.push([-700,0,800]);return r;})();
function stadium(s:Sheet,c:Cam){
 const hills=new Path2D();addPoly(hills,RIDGE,c);s.tone(B,hills,.32);
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D()),S=BOWL.segs;
 for(let g=0;g<S;g++){const u0=g/S,u1=(g+1)/S;
  addPoly(concrete,[bowlPt(u0,0,1.2),bowlPt(u1,0,1.2),bowlPt(u1,BOWL.rows*BOWL.step+1,1.2+(BOWL.rows*BOWL.step+1)*BOWL.rise),bowlPt(u0,BOWL.rows*BOWL.step+1,1.2+(BOWL.rows*BOWL.step+1)*BOWL.rise)],c);
  addPoly(wall,[bowlPt(u0,0,0),bowlPt(u1,0,0),bowlPt(u1,0,1.1),bowlPt(u0,0,1.1)],c);
  for(let k=0;k<BOWL.rows;k++){const d0=1+k*BOWL.step,d1=d0+BOWL.step*.8,y0=1.2+d0*BOWL.rise,y1=1.2+d1*BOWL.rise;
   addPoly(tiers[(k*3+g*5)%TIER_INK.length],[bowlPt(u0,d0,y0),bowlPt(u1,d0,y0),bowlPt(u1,d1,y1),bowlPt(u0,d1,y1)],c);}}
 s.fill(Y,concrete,.22);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(O,wall,.3);s.fill(B,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([10,0,34],c)[2]),.6);
 const grassPts:V3[]=[];for(let i=0;i<48;i++)grassPts.push(bowlPt(i/48,0,0));const grass=new Path2D();addPoly(grass,grassPts,c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(O,fl);}
}
/** A goal at line gx whose net runs out by dir (Italy's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Maldini's RIGHT leg on his right and Bebeto's LEFT boot on his left. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[O,.2]],OLIVE:InkFill[]=[[O,.32]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const brazil=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],scale:FIG,...o});
const italy=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Maldini: centre-back, number 5, dark hair */
const MALDINI:AthleteStyle=italy(OLIVE,{number:5,seed:5,hair:K,build:{height:1.86,bulk:1.02}});
const BEBETO:AthleteStyle=brazil(DARK,{number:7,seed:7,build:{height:1.77,bulk:.98}});
const ROMARIO:AthleteStyle=brazil(MID,{number:11,seed:11,build:{height:1.69,bulk:1}});
const PAGLIUCA:AthleteStyle={shirt:[K,.4],shorts:[K,.6],socks:[K,.4],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of a body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:5,build:MALDINI.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 ≈ Romário's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const T_PASS=.3,T_RECV=1.05,T_CROSS=3.4,T_BLOCK=3.52,T_OUT=T_BLOCK+.55,T_REST=T_BLOCK+1.7;
/** Bebeto crosses from here (inside the area, its left side as Brazil attack = the near side), low and driven toward Romário in the middle */
const CROSS_BALL:[number,number]=[11.2,17.2],ROM_RUN:[number,number]=[6.6,31],CROSS_D=nrm2(ROM_RUN[0]-CROSS_BALL[0],ROM_RUN[1]-CROSS_BALL[1]);
/** Maldini faces the crosser; the lunge puts his right boot across the lane of the cross */
const M_H=nrm2(-CROSS_D[0]+.12,-CROSS_D[1]);
const LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_BLOCK-LUNGE_REACH*LUNGE_DUR;
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** where the cross meets him: 2.4 m down the lane */
const BLOCK_XZ:[number,number]=add2(CROSS_BALL,CROSS_D,2.4);
/** Maldini's spot, solved so the right boot's sole is on the lane at full reach */
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),MALDINI.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[BLOCK_XZ[0]-f[0],BLOCK_XZ[1]-f[2]];})();
const BLOCK_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),MALDINI.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.14,toMy(midSole(sk.rToe,sk.rHeel))[1]+.13);})();
const BLOCK:V3=[BLOCK_XZ[0],BLOCK_Y,BLOCK_XZ[1]];
/** Bebeto's cross: left foot, facing a little toward the goal line of the lane */
const STRIKE_DUR=1,B_START=T_CROSS-STRIKE_CONTACT*STRIKE_DUR,B_H=nrm2(CROSS_D[0]-.3,CROSS_D[1]);
const B_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),BEBETO.build,placeOf(0,0,B_H),FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[CROSS_BALL[0]-f[0]-B_H[0]*.13,CROSS_BALL[1]-f[2]-B_H[1]*.13];})();
/** off Maldini's boot, rising, over the goal line wide of the near post (a corner), then to rest behind the line */
const OUT_D=nrm2(-1,-.34),OUT_AT:[number,number]=[0,BLOCK_XZ[1]+OUT_D[1]/OUT_D[0]*(0-BLOCK_XZ[0])],BALL_REST:[number,number]=[-3.6,OUT_AT[1]-1.3];
const RECV:[number,number]=[13.9,16.3];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const ROM_KEYS=[[-5,34,33.5],[-2.5,29,32.4],[0,24.6,31],[T_PASS,23.8,30.8],[1.5,17.5,30.5],[T_CROSS,9.2,30.7],[T_CROSS+.8,7,31],[T_REST,6.4,30.4],[T_REST+3,7,30]];
const BEB_KEYS=[[-5,33,22],[-2.5,26,20.5],[0,18.6,17.6],[T_RECV,...add2(RECV,[.65,.05])],[2.1,12.7,16.8],[B_START,...B_AT]];
const MAL_KEYS=[[-5,15,33.5],[-2.5,13.4,31.5],[0,12.6,28.4],[T_RECV,12.4,24.6],[2.2,...add2(M_AT,[.15,.5])],[LS,...M_AT]];
const TRACKS:Track[]=[
 {id:'maldini',style:MALDINI,keys:MAL_KEYS},
 {id:'bebeto',style:BEBETO,keys:BEB_KEYS},
 {id:'romario',style:ROMARIO,keys:ROM_KEYS},
 {id:'baresi',style:italy(LIGHT,{number:6,seed:16,hairStyle:'balding',build:{height:1.76}}),keys:[[-5,16,37],[-2.5,14.5,35.5],[0,12.4,33.6],[2,9.8,32.4],[T_CROSS,8.4,32],[T_REST,7.8,31.6],[T_REST+3,8,31]]},
 {id:'mussi',style:italy(LIGHT,{number:8,seed:18}),keys:[[-5,28,11],[-2.5,24,11.5],[0,19.8,12.6],[T_RECV,17.2,13.4],[T_CROSS,14.2,13.2],[T_REST,12.6,13.4],[T_REST+3,11,13.8]]},
 // everyone else (not named in the accounts; positions illustrative, no numbers printed)
 {id:'i-3',style:italy(OLIVE),keys:[[-5,17,48],[0,14.6,44],[T_CROSS,11.6,40.5],[T_REST+3,10.4,39]]},
 {id:'i-4',style:italy(LIGHT,{seed:24}),keys:[[-5,34,26],[0,27.5,24.6],[T_CROSS,20.5,23],[T_REST+3,17,22]]},
 {id:'i-5',style:italy(OLIVE,{seed:25}),keys:[[-5,33,40],[0,27,38],[T_CROSS,20.6,35.4],[T_REST+3,17.4,34]]},
 {id:'i-6',style:italy(LIGHT,{seed:26}),keys:[[-5,40,15],[0,33,15.6],[T_CROSS,26,16.6],[T_REST+3,22.5,17]]},
 {id:'b-8',style:brazil(LIGHT,{seed:28}),keys:[[-5,44,36],[0,36,35],[T_CROSS,29,33],[T_REST+3,26,32]]},
 {id:'b-9',style:brazil(MID,{seed:29}),keys:[[-5,40,10],[0,33.5,10.4],[T_CROSS,25.5,12],[T_REST+3,22,12.6]]},
 {id:'b-17',style:brazil(DARK,{seed:37}),keys:[[-5,38,52],[0,30,49],[T_CROSS,21.5,45],[T_REST+3,18,43]]},
];
const PAG_KEYS=[[-5,3,34],[0,2.4,33],[T_CROSS,1.5,30.6],[T_REST,1.3,29.6],[T_REST+3,1.4,29.2]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-5.2);for(let t=-5;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Romário's dribble, his pass through to Bebeto, Bebeto's touch and set, the low cross (left foot), off Maldini's
 * right boot, up and over the goal line wide of the post, rolling to rest behind it (a corner). */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<T_PASS)return ahead(ROM_KEYS,T,.7+.45*Math.max(0,Math.sin(T*TAU/.6)));
 const p0=ahead(ROM_KEYS,T_PASS,.7),rv:V3=[RECV[0],.11,RECV[1]],cb:V3=[CROSS_BALL[0],.11,CROSS_BALL[1]];
 if(T<T_RECV)return lerp3(p0,rv,sm(T_PASS,T_RECV,T,u=>u*(1.3-.3*u)));
 if(T<T_CROSS)return lerp3(rv,cb,sm(T_RECV+.1,T_CROSS-.7,T,easeOut));
 if(T<T_BLOCK)return lerp3(cb,BLOCK,clamp((T-T_CROSS)/(T_BLOCK-T_CROSS)));
 const out:V3=[OUT_AT[0],.9,OUT_AT[1]],rest:V3=[BALL_REST[0],.11,BALL_REST[1]];
 if(T<T_OUT)return lerp3(BLOCK,out,clamp((T-T_BLOCK)/(T_OUT-T_BLOCK)),.9);
 if(T<T_REST){const u=sm(T_OUT,T_REST,T,easeOut),p=lerp3(out,rest,u);p[1]=.11+.8*Math.abs(Math.cos(u*Math.PI*1.5))*(1-u)*(1-u);return p;}
 return rest;
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** Maldini before the lunge: across from the middle, then low on his toes in front of Bebeto (the jockey), eyes on the ball */
function maldiniApproach(T:number):St{
 const v=velAt(MAL_KEYS,T),sp=Math.hypot(v[0],v[1]),turn=sm(1.5,2.3,T,easeInOutSine),toBall=(()=>{const b=ballAt(T),p=trackAt(MAL_KEYS,T);return nrm2(b[0]-p[0],b[2]-p[1]);})();
 const h=yawTo(sp>.8?[v[0]/sp,v[1]/sp]:toBall,M_H,turn),st=runState(MAL_KEYS,T,h);
 // the jockey: knees bent, weight forward, small shuffles — on his feet, waiting
 const jockey=blendPose(backpedal(T*1.1),stand(),.25);
 const pose=blendPose(st.pose,jockey,sm(1.6,2.3,T)*.9);
 return{pose:lookAtBall({pose,place:st.place},T,1-.5*sm(2.6,LS,T)),place:st.place};
}
/** Maldini: across, the jockey, the lunge on the right leg at the cross (full reach at the block), back up tall, turning to watch it go out */
function maldiniState(T:number):St{
 if(T<LS)return maldiniApproach(T);
 const place=placeOf(M_AT[0],M_AT[1],M_H),u=clamp((T-LS)/LUNGE_DUR),from=maldiniApproach(LS).pose;
 if(T<LS+LUNGE_DUR)return{pose:blendPose(from,lunge(u),sm(0,.18,u)),place};
 // recovery: the planted lunge draws back into a tall stance, head turned after the ball
 const r=clamp((T-LS-LUNGE_DUR)/.7),h=yawTo(M_H,nrm2(-1,-.2),sm(LS+LUNGE_DUR,LS+LUNGE_DUR+1,T,easeInOutSine));
 const pose=keyPoses(r,[[0,lunge(1)],[1,{...stand(),dx:.3,dz:.3}]]);const st={pose,place:placeOf(M_AT[0],M_AT[1],h)};
 return{pose:lookAtBall(st,T,.8),place:st.place};
}
/** Bebeto: onto Romário's pass, a touch across, set, the cross with his left foot, then watching it go out */
function bebetoState(T:number):St{
 if(T<B_START){const st=runState(BEB_KEYS,T);
  let pose=blendPose(st.pose,dribble(strideAt(BEB_KEYS,T)*.9/3.6,{foot:'l',speed:.7}),.5*win(T,T_RECV-.2,B_START+.1,.3));
  pose=lookAtBall({pose,place:st.place},T,.5);
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],B_H,sm(B_START-.6,B_START,T));
  return{pose,place:placeOf(trackAt(BEB_KEYS,T)[0],trackAt(BEB_KEYS,T)[1],h)};}
 const u=clamp((T-B_START)/STRIKE_DUR),place=placeOf(B_AT[0],B_AT[1],B_H);
 if(u<1)return{pose:strike(u,{foot:'l',power:.75}),place};
 const h=yawTo(B_H,nrm2(-1,-.3),sm(B_START+STRIKE_DUR,B_START+STRIKE_DUR+.8,T));
 const pose=keyPoses(clamp((T-B_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'l',power:.75})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:placeOf(B_AT[0],B_AT[1],h)},T,.7),place:placeOf(B_AT[0],B_AT[1],h)};
}
/** Romário: on the ball, the pass through (right foot), then the run into the middle for the cross */
function romarioState(T:number):St{
 const st=runState(ROM_KEYS,T);
 if(T<T_PASS+.6){let pose=blendPose(st.pose,dribble(strideAt(ROM_KEYS,T)*.9/3.6,{foot:'r',speed:.8}),.5*(1-sm(T_PASS-.4,T_PASS-.2,T)));
  pose=blendPose(pose,strike(clamp((T-T_PASS)/.8+STRIKE_CONTACT),{power:.35}),win(T,T_PASS-.4,T_PASS+.6,.2));
  const toB=nrm2(RECV[0]-trackAt(ROM_KEYS,T_PASS)[0],RECV[1]-trackAt(ROM_KEYS,T_PASS)[1]);
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],toB,win(T,T_PASS-.45,T_PASS+.6,.2));
  return{pose,place:placeOf(trackAt(ROM_KEYS,T)[0],trackAt(ROM_KEYS,T)[1],h)};}
 return{pose:lookAtBall(st,T,.6),place:st.place};
}
function pagliucaState(T:number):St{const[x,z]=trackAt(PAG_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='maldini')return maldiniState(T);if(id==='bebeto')return bebetoState(T);if(id==='romario')return romarioState(T);if(id==='pagliuca')return pagliucaState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['maldini','bebeto'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'pagliuca'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='pagliuca'?PAGLIUCA:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='maldini'&&T>LS+.1&&T<T_BLOCK+.12)||(id==='bebeto'&&Math.abs(T-T_CROSS)<.22);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_BLOCK)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the west side, panning with the ball: Romário to Bebeto, Maldini across and waiting, cross, blocked. */
const MAIN_CAM:V3=[46,27,-44];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-4.6],[q[1],-1.3],[q[2],T_PASS],[q[3],T_RECV+.35],[q[4],2.3],[q[5],T_CROSS-.1],[q[6],T_BLOCK+.12],[S,T_REST-.1]]);};
const cam1Authored=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-4.6,Math.min(T,T_OUT)-.3)),tx=clamp(b[0]-1,8,40),tz=lerp(30,21,sm(-1,2.5,T)),F=lerp(5000,7800,sm(-1,3,T,easeInOutSine));
 return{pos:MAIN_CAM,target:[tx,0,tz] as V3,F};};
/** Director beats, chapter 1 (the live broadcast): a short establishing wide of the Rose Bowl, then follow Romário on the ball; pull out
 * for his pass through so the passer AND Bebeto (the receiver) are both in the picture; follow Bebeto on the left of the box while the
 * camera hands over to Maldini coming across; push in on Maldini staying close (Bebeto kept in frame — the gap he keeps); go tight and low
 * for the cross and the block, the attacker still in shot; then ease back out a little as the ball flies off him for a corner. */
const C1=(i:number)=>Q(0)[i];
const B1=beats([[0,'wide'],[1,{from:'follow',az:20}],[C1(2)-.3,{from:'space',size:.24}],[C1(3)+.5,'follow'],[C1(4)-.35,{from:'follow',size:.42,low:.5,az:25}],
 [C1(5)-.4,{from:'tight',az:25}],[C1(6)+.6,{from:'follow',size:.32,low:.5}]]);
/** the subject: Romário on the ball → Bebeto (from the pass) → Maldini (before "Maldini stays close"), blended, never switched */
function subj1(t:number){const T=t1(t),r=trackAt(ROM_KEYS,T),b=trackAt(BEB_KEYS,T),m=trackAt(MAL_KEYS,T),u=sm(T_PASS,T_RECV+.2,T,easeInOutSine),v=sm(1.7,2.3,T,easeInOutSine);
 const hx=lerp(lerp(r[0],b[0],u),m[0],v),hz=lerp(lerp(r[1],b[1],u),m[1],v),hero:V3=[hx,0,hz],q=C1(2),q3=C1(3);
 // Bebeto (the receiver, then the attacker being defended) from just before the pass to the end; Romário while he passes; Maldini while
 // the camera is still on Bebeto; nearby players soft
 const keep:Keep[]=[...kp(b,sm(q-1,q-.35,t)),...kp(r,sm(q-1,q-.35,t)*(1-sm(q+.6,q+1.3,t))),...kp(m,sm(q3-.2,q3+.5,t)*(1-v)),...near(hero,OTHERS(T,['maldini','bebeto','romario']),6,10,HERO_H)];
 return{hero,ball:ballAt(T),keep,recenter:sm(q-1,q-.3,t)*(1-sm(q3+.3,q3+1,t))};}
const cam1=(t:number)=>direct(t,B1,cam1Authored,subj1);
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:shotAt(t,B1).k<.5});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.4;},
};
/** 2 · TV slow-motion replay from a low camera upfield, side-on to the pair: the gap Maldini keeps, on his feet, waiting; the leg. */
const LOW_CAM:V3=[23,1.6,16.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,1.2],[q[1],1.75],[q[2],2.35],[q[3],T_CROSS-.3],[q[4]+.3,T_BLOCK],[S,T_BLOCK+.32]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(MAL_KEYS,Math.min(T,LS)),bb=trackAt(BEB_KEYS,Math.min(T,B_START)),mid:[number,number]=[(m[0]+bb[0])/2,(m[1]+bb[1])/2],
 tgt=[lerp(mid[0],BLOCK_XZ[0],sm(3,T_BLOCK,T)),lerp(mid[1],BLOCK_XZ[1],sm(3,T_BLOCK,T))],F=lerp(1750,2300,sm(1.4,T_BLOCK,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],.85,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.4;},
};
/** 3 · the second replay, from the high camera behind Italy's goal: the ball flies off Maldini, up and behind the line; nobody down. */
const BEHIND:V3=[-15,6.2,25];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_BLOCK-.3],[q[1],T_BLOCK+.42],[q[2],T_OUT+.5],[q[3],T_REST-.2],[S,T_REST+1.2]]);};
const cam3Authored=(t:number)=>{const T=t3(t),b=ballAt(T),follow=sm(T_BLOCK,T_OUT+.4,T,easeInOutSine),tx=lerp(BLOCK_XZ[0]-1,lerp(b[0],M_AT[0],.5),follow),tz=lerp(BLOCK_XZ[1]-.5,lerp(b[2],M_AT[1],.5),follow),F=lerp(2900,2200,sm(T_BLOCK,T_REST,T,easeInOutSine));
 return{pos:BEHIND,target:[tx,.8,tz] as V3,F};};
/** Director beats, chapter 3 (the replay from behind the goal): start close and low on Maldini as the cross hits his leg (Bebeto, the
 * crosser, kept in frame); pull out as the ball flies off him and over the line (it must be seen going out for a corner); then settle on
 * Maldini, still standing — no foul, no fall. */
const C3=(i:number)=>Q(2)[i];
const B3=beats([[0,{from:'tight',size:.48}],[C3(1)-.3,{from:'space',size:.28}],[C3(2)-.2,{from:'reaction',size:.42}]]);
function subj3(t:number){const T=t3(t),m=trackAt(MAL_KEYS,T),hero:V3=[m[0],0,m[1]],b=ballAt(T);
 // once the ball has gone out and rests behind the line (right under this camera), the focus hands back to Maldini and the ball becomes a
 // soft keep, so "No foul, no fall" is on him standing (eased over 1.2 s and steadied over ±.6 s, so the hand-over never jumps)
 const f=sm(C3(2)-.4,C3(2)+.8,t,easeInOutSine),focus:V3=[lerp(b[0],m[0],f),lerp(b[1],1,f),lerp(b[2],m[1],f)];
 return{hero,ball:focus,keep:[...(f>0?[{P:b,w:1-.8*f}]:[]),...kp(trackAt(BEB_KEYS,T),1-sm(C3(1)-.3,C3(1)+.4,t)),...near(hero,OTHERS(T,['maldini','bebeto']),6,10,HERO_H)]};}
const cam3=(t:number)=>direct(t,B3,cam3Authored,subj3,.6);
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.3;},
};
/** 4 · the lesson plate: the moment again from a raised camera on the near side, with bold yellow teaching marks — a ring round Maldini, the
 * gap he keeps (wait for the right moment), his two boots on the grass (stay on your feet), a burst and a tick at the block (win it
 * cleanly), and a yellow ghost of a sliding dive, crossed out (don't dive in). */
const LESSON_CAM:V3=[21,7.5,3];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,2.1],[q[1],2.1],[q[2]-.2,2.9],[q[3]-.3,T_CROSS-.2],[q[3]+.35,T_BLOCK],[S,T_BLOCK+.05]]);};
const LESSON_MID:[number,number]=[(M_AT[0]+B_AT[0])/2,(M_AT[1]+B_AT[1])/2];
/** Director, chapter 4 (the lesson): one 'lesson' framing, closer than the authored plate, with every teaching mark held in frame — Bebeto
 * (the gap Maldini keeps), the block and the tick above it, and the crossed-out dive. */
const B4=beats([[0,'lesson']]);
const DIVE_X:V3=[M_AT[0]+M_H[0]*1.3,0,M_AT[1]+M_H[1]*1.3];
const KEEP4:Keep[]=[[B_AT[0],0,B_AT[1]],[B_AT[0],HERO_H,B_AT[1]],[BLOCK[0],BLOCK[1]+1.6,BLOCK[2]],[DIVE_X[0],0,DIVE_X[2]],[DIVE_X[0],1.4,DIVE_X[2]]];
const cam4=(t:number)=>{const T=t4(t);return camOf(reframe({eye:LESSON_CAM,target:[LESSON_MID[0]-.2,.6,LESSON_MID[1]+.4],F:2700},{hero:(()=>{const m=trackAt(MAL_KEYS,T);return[m[0],0,m[1]] as V3;})(),ball:ballAt(T),keep:KEEP4,height:HERO_H},shotAt(t,B4),DV));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** the dive he did NOT make: a sliding body launched at Bebeto from Maldini's spot */
const DIVE_PLACE=placeOf(M_AT[0]+M_H[0]*.2,M_AT[1]+M_H[1]*.2,M_H);
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That's Maldini": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.1,q[1]+.5,t));
  if(hal>.01){const m=maldiniState(T).place;groundRing(s,m.x!,-m.z!,1.1*hal,c);}
  // "stay on your feet": a small ring round each boot, on the grass
  const feet=sm(q[2],q[2]+.35,t,easeOutBack)*(1-sm(q[3]+.1,q[3]+.5,t));
  if(feet>.01){const st=maldiniState(T),sk=solve(st.pose,MALDINI.build,st.place,FIG);for(const f of[midSole(sk.lToe,sk.lHeel),midSole(sk.rToe,sk.rHeel)]){const p=toMy(f);groundRing(s,p[0],p[2],.32*feet,c);}}
  drawPlay(s,T,c,{ballScale:1.5,only:['maldini','bebeto','romario','pagliuca','ball'],noStadium:true});
  // "Wait for the right moment": the gap he keeps — a double-headed bar on the grass between Maldini and Bebeto
  const gap=sm(q[1],q[1]+.35,t,easeOutBack)*(1-sm(q[2]+.6,q[2]+1,t));
  if(gap>.01){const m=maldiniState(T).place,b=bebetoState(T).place,a=G(m.x!,-m.z!,c),bq=G(b.x!,-b.z!,c),w=Math.max(12,.2*P3([m.x!,0,-m.z!],c)[2])*gap;
   const mid:Pt=[(a[0]+bq[0])/2,(a[1]+bq[1])/2],sa:Pt=[lerp(mid[0],a[0],.8*gap),lerp(mid[1],a[1],.8*gap)],sb:Pt=[lerp(mid[0],bq[0],.8*gap),lerp(mid[1],bq[1],.8*gap)];
   arrow(s,mid,sa,w,21);arrow(s,mid,sb,w,22);}
  // "win the ball cleanly": a burst at the block and a tick
  const stamp=sm(q[3]+.35,q[3]+.7,t,easeOutBack);
  if(stamp>.002&&t<q[4]+.2){const bp=P3(BLOCK,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]-1.1*bp[2],y=bp[1]-1.4*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  // "Don't dive in": the dive he didn't make, a yellow ghost sliding at Bebeto, and a big cross over it
  const dive=sm(q[4]-.1,q[4]+.3,t,easeOutBack);
  if(dive>.01){drawPlayer(s,slideTackle(.3+.3*clamp(dive)),c,GHOST,DIVE_PLACE);
   const ctr=P3([DIVE_PLACE.x!+M_H[0]*1.1,.45,-DIVE_PLACE.z!+M_H[1]*1.1],c),r=.95*ctr[2]*clamp((t-q[4]-.25)/.3),w=Math.max(10,.18*ctr[2]);
   if(r>1){const x=new Path2D();x.addPath(ribbon([[ctr[0]-r,ctr[1]-r*.8],[ctr[0]+r,ctr[1]+r*.8]],w,{seed:81,taper:.1}));x.addPath(ribbon([[ctr[0]-r,ctr[1]+r*.8],[ctr[0]+r,ctr[1]-r*.8]],w,{seed:82,taper:.1}));mark(s,x);}}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'maldini-tackle-signature',format:'11v11',title:'Maldini: the clean block',theme:'Wait for the right moment, then win it cleanly',
 ageNote:'Brazil v Italy · World Cup final, 17 July 1994 · Pasadena, USA',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little sun spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Italy's goal line at X=0, Z across) — checked by tests/play-film-maldini-tackle-signature.cjs. */
export const FACTS={BLOCK,CROSS_BALL,OUT_AT,BALL_REST,M_AT,T_CROSS,T_BLOCK,ballAt,
 /** mid-sole of each of Maldini's boots at the block frame (my metres) */
 rightFoot:()=>{const st=maldiniState(T_BLOCK),sk=solve(st.pose,MALDINI.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 leftFoot:()=>{const st=maldiniState(T_BLOCK),sk=solve(st.pose,MALDINI.build,st.place,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 /** Maldini's pelvis height at the block (on his feet, not on the grass) */
 pelvisY:()=>{const st=maldiniState(T_BLOCK),sk=solve(st.pose,MALDINI.build,st.place,FIG);return sk.pelvis[1];},
 /** Bebeto's left and right boots at the cross */
 bebetoFeet:()=>{const st=bebetoState(T_CROSS),sk=solve(st.pose,BEBETO.build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel))};},
 maldiniAt:(T:number)=>{const st=maldiniState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 bebetoAt:(T:number)=>{const st=bebetoState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
