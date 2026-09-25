/** Iconic-play film · Thiago Silva, "Signature: the perfectly timed interception" — shown as HOW HE DID IT, set in a real match the sources
 * describe: Manchester City v Chelsea, UEFA Champions League final, 29 May 2021, Estádio do Dragão, Porto (Chelsea won 1–0, Havertz 42').
 *
 * WHY THIS MOMENT: Thiago Silva's signature (lib/town/iconicPlays.json) is a trait, not one goal: he reads the pass early and steps in to take
 * it, so he never has to dive in. No written account we could find logs ONE specific Silva interception with a minute and a position (the
 * Guardian's minute-by-minute of the 2021 final records only a 7th-minute foul on him and the groin injury that ended his night at 39'). So,
 * per the brief's honest fallback, the film recreates his signature — the early read and the step into the passing lane — inside the setting
 * of that real final (the right stadium, kits, numbers and team shape), and the narration says so ("Here's how Thiago Silva defends"). It never
 * gives the move a minute, a scoreline or a named City passer.
 *
 * A recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Chelsea's goal line at X=0, Z across, away
 * from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on the side (City pass it around, the forward
 * pass, Silva steps in front and takes it); 2 a TV slow-motion replay from a low camera on the near side (he reads it and moves before the
 * pass; on his feet, a step into the ball's path); 3 a second replay from the high camera behind Chelsea's goal (he looks up and passes it
 * to a teammate; Chelsea go forward); 4 the lesson (the only chapter with teaching marks: a ring round him, his eyes on the passer, the pass
 * he read, the early step, and a crossed-out dive). No overlays inside the footage chapters.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2021 UEFA Champions League final" (match summary citing BBC Sport live text, 29 May 2021; line-ups; kit boxes):
 *    https://en.wikipedia.org/wiki/2021_UEFA_Champions_League_final  (wiki-2021-ucl-final.txt)
 *  - The Guardian, "Manchester City 0-1 Chelsea: Champions League final – as it happened" (Scott Murray's minute-by-minute, 29 May 2021),
 *    three pages: https://www.theguardian.com/football/live/2021/may/29/manchester-city-v-chelsea-champions-league-final-live
 *    (guardian-mci-che-2021-live{,-p2,-p3}.txt)
 *  - Wikipedia, "Thiago Silva" (style of play: "positional awareness and tactical discipline, making him effective in one-on-one defending,
 *    anticipating plays, and regaining possession"; L'Équipe, 1 March 2015: 2.9 interceptions per match and 0 fouls in 630 minutes):
 *    https://en.wikipedia.org/wiki/Thiago_Silva  (wiki-thiago-silva.txt)
 * CONFIRMED by those accounts: the match (Manchester City v Chelsea, Champions League final), the date (29 May 2021), the venue (Estádio do
 * Dragão, Porto), kick-off around 8 p.m. in front of 14,110 (a stadium mostly empty); Chelsea in a back three: Azpilicueta 28 (captain),
 * Thiago Silva 6, Rüdiger 2, with James 24 and Chilwell 21 wide, Jorginho 5 and Kanté 7 in midfield, Mendy 16 in goal; City had 58 % of the
 * ball by the 37th minute and Chelsea were "happy to wait for a chance to counter"; Silva went off injured in the 39th minute (Christensen on);
 * Chelsea won 1–0. Kits (kit boxes): City sky-blue shirts, white shorts, sky-blue socks; Chelsea royal-blue shirts, blue shorts, white socks.
 * Silva's defending style (reads the play, anticipates, wins the ball back, rarely fouls) from the Thiago Silva article.
 * INFERRED (not in the accounts): the whole move — who passed, where, when, Silva's route, the interception point and his pass out — is an
 * illustration of his signature, not a logged play; which end Chelsea defended on screen (their goal is screen-left from the main camera);
 * every position and timing; the feet (the City passer's right, Silva's right boot into the lane and right-footed pass — drawn, never
 * narrated); City players are drawn WITHOUT numbers or names; Mendy's kit colour (a neutral grey); hair and skin tones; the Dragão's blue
 * seats, roof and the camera placements; the evening light. The narration names only the match, the teams and Silva.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,polyPath,ribbon,blob,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,slideTackle,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,4]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The final',text:'Porto, 2021: the Champions League final. Manchester City pass it around. Here’s how Thiago Silva defends. He watches the passer… The pass goes forward. Silva steps in front, and it’s his!',seconds:14.2,
  cues:[[0,'Porto'],[2.9,'Manchester City pass'],[4.9,'Here’s how Thiago Silva defends'],[7,'He watches the passer'],[8.9,'The pass goes forward'],[10.6,'Silva steps in front'],[12,'it’s his']]},
 {label:'The replay',text:'Watch again, slowly. Silva reads the pass before it’s played. He moves early. He doesn’t dive in: he steps into the ball’s path and takes it.',seconds:11.4,
  cues:[[0,'Watch again'],[1.7,'Silva reads the pass'],[4,'He moves early'],[5.6,'He doesn’t dive in'],[7.3,'he steps into the ball’s path']]},
 {label:'Calm',text:'Then he looks up, and passes it to a teammate. No foul! Chelsea attack!',seconds:7.4,
  cues:[[0,'Then he looks up'],[1.5,'passes it to a teammate'],[3.4,'No foul'],[4.6,'Chelsea attack']]},
 {label:'The lesson',text:'That’s Thiago Silva. Good defenders read the pass early, so they don’t need to dive in!',seconds:8.6,
  cues:[[0,'That’s Thiago Silva'],[1.6,'Good defenders'],[2.7,'read the pass early'],[4.5,'they don’t need to dive in']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py thiago-silva-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/thiago-silva-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/thiago-silva-signature/timing.json';
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
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];

// ---------------------------------------------------------------- the Estádio do Dragão: four roofed stands, blue seats, 14,110 inside
/** stand planes (a along, b up the rake 0..1): 0 the far side (+Z), 1 behind Chelsea's goal (−X), 2 behind City's goal (+X), 3 the main
 * stand (−Z, under the TV gantry; only printed by cameras that are not in it). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-7,112,a),1.3+21*b,72+27*b],
 (a,b)=>[-7-25*b,1.3+18*b,lerp(72,-4,a)],
 (a,b)=>[112+25*b,1.3+18*b,lerp(-4,72,a)],
 (a,b)=>[lerp(112,-7,a),1.3+21*b,-4-27*b],
];
const ROWS=[15,11,11,15],AISLES=[10,6,6,10];
/** fan clusters (seeded): a thin, patchy crowd — 14,110 in a stadium built for about 50,000 */
const CROWD:{st:number;a:number;b:number;w:number;h:number;ink:number}[]=(()=>{let r=7;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};const out=[];
 for(let i=0;i<46;i++){const st=[0,0,0,1,2,3][Math.floor(rnd()*6)],a=.06+rnd()*.88,b=.08+rnd()*.6;out.push({st,a,b,w:.03+rnd()*.05,h:.08+rnd()*.12,ink:rnd()<.5?0:1});}return out;})();
function stadium(s:Sheet,c:Cam,which=[0,1,2]){
 // an evening sky over Porto, just before sunset: a light warm haze low down
 s.field(Y,.08,.4);
 const planes=new Path2D(),rows=new Path2D(),roof=new Path2D(),fans=[new Path2D(),new Path2D()];
 for(const i of which){const S=STANDS[i];addPoly(planes,[S(0,0),S(1,0),S(1,1),S(0,1)],c);
  for(let j=1;j<ROWS[i];j++){const b=j/ROWS[i];addPoly(rows,[S(0,b),S(1,b),add3(S(1,b),[0,.16,0]),add3(S(0,b),[0,.16,0])],c);}
  for(let k=1;k<AISLES[i];k++){const a=k/AISLES[i],d=.006;addPoly(rows,[S(a-d,0),S(a+d,0),S(a+d,1),S(a-d,1)],c);}
  // the roof: a dark overhang over the top rows, lifted on its trusses
  addPoly(roof,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.62),[0,11,0]),add3(S(0,.62),[0,11,0])],c);}
 for(const f of CROWD)if(which.includes(f.st)){const S=STANDS[f.st];addPoly(fans[f.ink],[S(f.a,f.b),S(f.a+f.w,f.b),S(f.a+f.w,f.b+f.h),S(f.a,f.b+f.h)],c);}
 s.knockout(planes);s.tone(B,planes,.7);s.tone(K,planes,.3);s.knockout(rows,.55);
 s.fill(O,fans[0],.55);s.fill(K,fans[1],.45);s.tone(Y,fans[0],.5);
 s.knockout(roof);s.fill(K,roof,.85);
}
/** grass, stripes, lines, boards and corner flags */
function ground(s:Sheet,c:Cam){
 const grass=new Path2D();addPoly(grass,[[-7,0,-4],[112,0,-4],[112,0,72],[-7,0,72]],c);s.knockout(grass);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 // advertising boards: navy with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D();
 for(const[a,b]of[[[-4,70.5],[109,70.5]],[[-4.5,-2],[-4.5,70]],[[109.5,-2],[109.5,70]]]as[[number,number],[number,number]][])addPoly(bd,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.9,b[1]],[a[0],.9,a[1]]],c);
 for(let k=0;k<16;k++){const x=-2+k*7;addPoly(pn,[[x,.25,70.4],[x+3.6,.25,70.4],[x+3.6,.66,70.4],[x,.66,70.4]],c);}
 s.knockout(bd);s.fill(K,bd,.88);s.knockout(pn,.8);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Chelsea's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Silva's RIGHT boot on his right. */
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
/** Chelsea 2020–21 home: royal-blue shirts and shorts, white socks. City 2020–21 home: sky-blue shirts, white shorts, sky-blue socks. */
const chelsea=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
const city=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.4],trim:[K,.5],shorts:'paper',socks:[B,.4],boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',scale:FIG,...o});
/** Thiago Silva: centre of Chelsea's back three, number 6, close-cropped dark hair */
const SILVA:AthleteStyle=chelsea(MID,{number:6,seed:6,hairStyle:'short',build:{height:1.81,bulk:1.02}});
/** the City players in the move: drawn without numbers or names (the move is an illustration, see the header) */
const PASSER:AthleteStyle=city(LIGHT,{seed:41,build:{height:1.75}});
const FORWARD:AthleteStyle=city(DARK,{seed:47,build:{height:1.72}});
const MENDY:AthleteStyle={shirt:[K,.45],shorts:[K,.6],socks:[K,.45],boots:K,skin:DARK,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:16,numberInk:'paper',scale:FIG,seed:16};
/** the lesson's marks: a yellow silhouette of a body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:6,build:SILVA.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the forward pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** City work it square (T_A → T_B), then the forward pass at T=0 from P0 toward the forward checking in to R. */
const T_A=-3.5,T_B=-2.5,T_INT=1.1,LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_INT-LUNGE_REACH*LUNGE_DUR,T_READ=-.5,T_P2=T_INT+2.1,T_ARR=T_P2+1.05;
const P0:[number,number]=[37.5,40.5],R:[number,number]=[21,34.6],PASS_D=nrm2(R[0]-P0[0],R[1]-P0[1]);
/** where Silva meets it: 3.3 m in front of the forward's feet, on the lane */
const I_XZ:[number,number]=add2(R,PASS_D,-3.3);
/** Silva faces the ball coming; the lunge puts his right boot on the lane */
const M_H=nrm2(-PASS_D[0]+.12,-PASS_D[1]);
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),SILVA.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[I_XZ[0]-f[0],I_XZ[1]-f[2]];})();
const I_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),SILVA.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.12,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const INTERCEPT:V3=[I_XZ[0],I_Y,I_XZ[1]];
/** the cushioned ball stops just past his boot */
const I_STOP:[number,number]=add2(I_XZ,PASS_D,.35);
/** his pass out: to Chelsea's midfielder dropping in on the near side (right foot) */
const J:[number,number]=[33,21.5],H2=nrm2(J[0]-I_STOP[0],J[1]-I_STOP[1]);
const BALL2:[number,number]=add2(I_STOP,H2,1.1);
const STRIKE_DUR=1,S2_START=T_P2-STRIKE_CONTACT*STRIKE_DUR;
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.5}),SILVA.build,placeOf(0,0,H2),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[BALL2[0]-f[0]-H2[0]*.13,BALL2[1]-f[2]-H2[1]*.13];})();
/** the City passer: right foot, facing the lane */
const P_H=nrm2(PASS_D[0]+.05,PASS_D[1]),P_START=0-STRIKE_CONTACT*STRIKE_DUR;
const P_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),PASSER.build,placeOf(0,0,P_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[P0[0]-f[0]-P_H[0]*.13,P0[1]-f[2]-P_H[1]*.13];})();
/** where the square pass reaches the passer */
const PR:[number,number]=[42.6,44.2];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const PASS_KEYS=[[-5,45,48.6],[T_A,43.8,46.4],[T_B,...PR],[-1.4,40.4,42.6],[P_START,...P_AT],[3,...add2(P_AT,[-.8,-.2])],[7,...add2(P_AT,[-3,-1])]];
const MID2_KEYS=[[-5,47.5,31],[T_A-.1,46.8,30.6],[-1,45.6,31.6],[2,42,31.2],[7,39,30]];
const FWD_KEYS=[[-5,15.4,38.6],[-2.5,16.6,37.4],[T_READ,19.2,35.6],[0,19.9,35.2],[T_INT,...add2(R,[-.3,.1])],[T_INT+.7,...add2(R,[.2,.2])],[T_P2,22.4,33.6],[T_ARR+2,24.5,31.4]];
const SIL_KEYS=[[-5,16.2,33.2],[-2.5,17.4,33.4],[T_READ,18.2,33.1],[.15,20.6,33.3],[LS,...M_AT]];
const JOR_KEYS=[[-5,36,28],[-2,34.8,26],[T_INT,33.8,23.4],[T_ARR-.3,...add2(J,[.3,.1])],[T_ARR+3,40,21]];
const TRACKS:Track[]=[
 {id:'silva',style:SILVA,keys:SIL_KEYS},
 {id:'c-fwd',style:FORWARD,keys:FWD_KEYS},
 {id:'c-pass',style:PASSER,keys:PASS_KEYS},
 {id:'c-mid2',style:city(MID,{seed:43}),keys:MID2_KEYS},
 {id:'jorginho',style:chelsea(OLIVE,{number:5,seed:25}),keys:JOR_KEYS},
 {id:'azpi',style:chelsea(OLIVE,{number:28,seed:28}),keys:[[-5,17,22],[0,17.6,23.2],[T_INT,18.4,24.6],[T_P2,20.5,24],[T_ARR+3,26,22]]},
 {id:'rudiger',style:chelsea(DARK,{number:2,seed:22,build:{height:1.9}}),keys:[[-5,16,44],[0,16.8,43],[T_INT,18.6,41.6],[T_P2,21,41],[T_ARR+3,27,42]]},
 {id:'kante',style:chelsea(DARK,{number:7,seed:27,build:{height:1.68}}),keys:[[-5,33,42],[0,31.4,40.6],[T_INT,29.4,38.6],[T_ARR+3,36,36]]},
 {id:'james',style:chelsea(MID,{number:24,seed:24}),keys:[[-5,24,10],[0,24.6,11],[T_ARR+3,34,10]]},
 {id:'chilwell',style:chelsea(LIGHT,{number:21,seed:21}),keys:[[-5,24,57],[0,25,56],[T_ARR+3,32,58]]},
 // City's other attackers (no numbers)
 {id:'c-w1',style:city(LIGHT,{seed:44}),keys:[[-5,30,60],[0,26,58.5],[T_ARR+3,27,56]]},
 {id:'c-w2',style:city(DARK,{seed:45}),keys:[[-5,28,12],[0,25.6,14],[T_ARR+3,27,15]]},
 {id:'c-am',style:city(OLIVE,{seed:46}),keys:[[-5,31,50],[0,27.5,47],[T_INT,25.6,45],[T_ARR+3,28,43]]},
];
const MENDY_KEYS=[[-5,4,34],[0,4.6,34.6],[T_INT,5,35],[T_ARR+3,6,33]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-5.2);for(let t=-5;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const G3=(p:[number,number]):V3=>[p[0],.11,p[1]];
/** The ball at play time T: the square pass to the passer, his touches, the forward pass (right foot) along the grass, cut out by Silva's
 * right boot, cushioned dead, one touch out, his pass (right foot) to Jorginho, who carries it forward. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<T_A)return ahead(MID2_KEYS,T,.6);
 const a0=ahead(MID2_KEYS,T_A,.6);
 if(T<T_B)return lerp3(a0,G3(add2(PR,[-.5,-.3])),sm(T_A,T_B,T,u=>u*(1.3-.3*u)));
 if(T<0){const d=ahead(PASS_KEYS,T,.62+.3*Math.max(0,Math.sin((T-T_B)*TAU/.7)));return lerp3(d,G3(P0),sm(-.6,0,T));}
 if(T<T_INT)return lerp3(G3(P0),INTERCEPT,clamp(T/T_INT)*(1.12-.12*clamp(T/T_INT)));
 if(T<T_INT+.4)return lerp3(INTERCEPT,G3(I_STOP),sm(T_INT,T_INT+.4,T,easeOut));
 if(T<T_P2)return lerp3(G3(I_STOP),G3(BALL2),sm(T_INT+1.05,T_P2-.35,T,easeOut));
 if(T<T_ARR)return lerp3(G3(BALL2),G3(add2(J,[.5,.4])),clamp((T-T_P2)/(T_ARR-T_P2))*(1.1-.1*clamp((T-T_P2)/(T_ARR-T_P2))));
 const d=ahead(JOR_KEYS,T,.7);return lerp3(G3(add2(J,[.5,.4])),d,sm(T_ARR,T_ARR+.5,T));
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
const hd=(p:Place):[number,number]=>[Math.cos(p.yaw!),Math.sin(p.yaw!)];
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward a point (default: the ball). Right-handed yaw: + turns left. */
function lookAt(st:St,T:number,w=1,at?:[number,number]):Pose{const b=at?[at[0],0,at[1]]:ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.2*w;return clampPose(p);}
/** Silva before the lunge: goal-side, eyes on the passer; he moves as the passer shapes to play it (T_READ), before the ball is struck,
 * and arrives in the lane on his feet */
function silvaApproach(T:number):St{
 const v=velAt(SIL_KEYS,T),sp=Math.hypot(v[0],v[1]),p=trackAt(SIL_KEYS,T),toBall=(()=>{const b=ballAt(T);return nrm2(b[0]-p[0],b[2]-p[1]);})();
 const h=yawTo(sp>1.4?[v[0]/sp,v[1]/sp]:toBall,M_H,sm(LS-.45,LS,T,easeInOutSine)),st=runState(SIL_KEYS,T,sp>1.4?undefined:toBall);
 const pose=lookAt({pose:st.pose,place:placeOf(p[0],p[1],h)},T,1);
 return{pose,place:placeOf(p[0],p[1],h)};
}
function silvaState(T:number):St{
 if(T<LS)return silvaApproach(T);
 const u=clamp((T-LS)/LUNGE_DUR),from=silvaApproach(LS).pose,place=placeOf(M_AT[0],M_AT[1],M_H);
 if(T<LS+LUNGE_DUR){const pose=blendPose(from,lunge(u),sm(0,.2,u));return{pose:lookAt({pose,place},T,.4),place};}
 // up tall with the ball, head up, turning to Jorginho, a touch out, then the pass with the right foot
 const T1=LS+LUNGE_DUR;
 if(T<S2_START){const w=sm(T1+.3,S2_START,T,easeInOutSine),x=lerp(M_AT[0],S_AT[0],w),z=lerp(M_AT[1],S_AT[1],w),h=yawTo(M_H,H2,sm(T1,T1+.9,T,easeInOutSine));
  const walk=blendPose(stand(),runCycle((T-T1)*1.6,{speed:.1}),.55*win(T,T1+.3,S2_START+.05,.25));
  const pose=keyPoses(clamp((T-T1)/.5),[[0,lunge(1)],[1,walk]]),st={pose,place:placeOf(x,z,h)};
  return{pose:lookAt(st,T,.8,T<T1+1.1?I_STOP:J),place:st.place};}
 const sp2=placeOf(S_AT[0],S_AT[1],H2),v=clamp((T-S2_START)/STRIKE_DUR);
 if(v<1)return{pose:strike(v,{foot:'r',power:.5}),place:sp2};
 return{pose:lookAt({pose:keyPoses(clamp((T-S2_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:.5})],[1,stand()]]),place:sp2},T,.7),place:sp2};
}
/** the City passer: takes the square pass, a few touches, looks up at the forward, the pass (right foot), then watches it cut out */
function passerState(T:number):St{
 if(T<P_START){const st=runState(PASS_KEYS,T);let pose=blendPose(st.pose,dribble(strideAt(PASS_KEYS,T)*.9/3.6,{foot:'r',speed:.6}),.5*win(T,T_B,P_START+.1,.3));
  pose=lookAt({pose,place:st.place},T,.6*win(T,-1.4,-.5,.2),R);
  const h=yawTo(hd(st.place),P_H,sm(P_START-.5,P_START,T));return{pose,place:placeOf(trackAt(PASS_KEYS,T)[0],trackAt(PASS_KEYS,T)[1],h)};}
 const u=clamp((T-P_START)/STRIKE_DUR),place=placeOf(P_AT[0],P_AT[1],P_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.6}),place};
 const st=runState(PASS_KEYS,T,P_H);return{pose:lookAt({pose:blendPose(strike(1,{foot:'r',power:.6}),st.pose,sm(P_START+1,P_START+1.6,T)),place:st.place},T,.8),place:st.place};
}
/** the City forward: checks in toward the ball, beaten to it; turns to chase */
function forwardState(T:number):St{const st=runState(FWD_KEYS,T,T<T_INT+.3?nrm2(P0[0]-trackAt(FWD_KEYS,T)[0],P0[1]-trackAt(FWD_KEYS,T)[1]):undefined);return{pose:lookAt(st,T,.8),place:st.place};}
/** the square pass: a short side-foot pass (right foot) */
function mid2State(T:number):St{const st=runState(MID2_KEYS,T);const pose=blendPose(st.pose,strike(clamp((T-T_A)/.8+STRIKE_CONTACT),{power:.3}),win(T,T_A-.4,T_A+.6,.2));
 const h=yawTo(hd(st.place),nrm2(PR[0]-47,PR[1]-30.6),win(T,T_A-.5,T_A+.6,.2));return{pose:lookAt({pose,place:st.place},T,.5),place:placeOf(st.place.x!,-st.place.z!,h)};}
function mendyState(T:number):St{const[x,z]=trackAt(MENDY_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='silva')return silvaState(T);if(id==='c-pass')return passerState(T);if(id==='c-fwd')return forwardState(T);if(id==='c-mid2')return mid2State(T);if(id==='mendy')return mendyState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAt(st,T,.5),place:st.place};
}
const HEROES=['silva','c-fwd','c-pass'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: stands, grass, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;stands?:number[]}={}){
 if(!o.noStadium){stadium(s,c,o.stands);ground(s,c);}
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'mendy'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='mendy'?MENDY:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='silva'&&T>T_READ&&T<T_INT+.1)||(id==='c-pass'&&Math.abs(T)<.22);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_INT)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the near side, panning with the ball: City work it square, the forward pass, Silva steps in, his ball. */
const MAIN_CAM:V3=[36,26,-42];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-4.8],[q[1],-3.9],[q[2],-2.2],[q[3],-1.1],[q[4],0],[q[5],.62],[q[6],T_INT+.2],[S,T_INT+1.5]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_INT+.6)),m=trackAt(SIL_KEYS,Math.min(T,LS)),focus=sm(-2.6,-1.2,T,easeInOutSine),
 tx=lerp(b[0]-4,lerp(b[0],m[0],.5),focus),tz=lerp(b[2]-2,lerp(b[2],m[1],.5),focus),F=lerp(4800,6400,sm(-3,-.5,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.4;},
};
/** 2 · TV slow-motion replay from a low camera on the near side, level with the lane: eyes on the passer, the early move, the step in. */
const LOW_CAM:V3=[13,2.1,22.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-1.6],[q[1],-1.2],[q[2],T_READ],[q[3],.25],[q[4],LS+.1],[S-.6,T_INT+.12],[S,T_INT+.2]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(SIL_KEYS,Math.min(T,LS)),b=ballAt(T),w=sm(-.2,T_INT,T,easeInOutSine),
 tgt=[lerp(lerp(m[0],P_AT[0],.25),lerp(m[0],b[0],.5),w),lerp(lerp(m[1],P_AT[1],.25),lerp(m[1],b[2],.5),w)],F=lerp(2000,2700,sm(-.8,T_INT,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],.9,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,stands:[0,1,2]});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.6;},
};
/** 3 · the second replay, from the high camera behind Chelsea's goal: ball dead at his feet, head up, the pass to Jorginho, Chelsea go. */
const BEHIND:V3=[-11,7,31];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_INT+.35],[q[1],S2_START+.2],[q[2],T_P2+.55],[q[3],T_ARR+.1],[S,T_ARR+1.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),tx=lerp(I_STOP[0],b[0],.6),tz=lerp(I_STOP[1],b[2],.6),F=lerp(3900,3200,sm(T_INT+1,T_ARR,T,easeInOutSine));
 return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,stands:[0,2,3]});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.8;},
};
/** 4 · the lesson plate: the move again from a raised camera on the near side, with bold yellow teaching marks — a ring round Silva, his
 * eyes on the passer (good defenders), the pass he read + his early step (read the pass early), and a yellow ghost of a sliding dive at the
 * forward, crossed out, and a tick where he takes it (they don't need to dive in). */
const LESSON_CAM:V3=[9,5.5,27];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.4],[q[1],-1.1],[q[2],-.9],[q[2]+1.2,.3],[q[3]+.2,T_INT],[S,T_INT+.05]]);};
const cam4=(t:number)=>camAt(LESSON_CAM,[25,.6,36.6],2150);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** dashes along a ground segment (eye line / pass lane) */
function dashes(s:Sheet,a:V3,b:V3,c:Cam,n:number,u:number,w:number,seed:number){const p=new Path2D();for(let i=0;i<n;i++){const u0=i/n,u1=(i+.55)/n;if(u0>u)break;const A=P3(lerp3(a,b,u0),c),Bq=P3(lerp3(a,b,Math.min(u1,u)),c);if(A[2]<=0||Bq[2]<=0)continue;p.addPath(ribbon([[A[0],A[1]],[Bq[0],Bq[1]]],w,{seed:seed+i,taper:0,wobble:.5}));}mark(s,p);}
/** the dive he did NOT make: a sliding body launched at the forward from the spot Silva started */
const DIVE_H=nrm2(R[0]-19.2,R[1]-33.4),DIVE_PLACE=placeOf(19.2,33.4,DIVE_H);
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c,[0,1,2]);ground(s,c);
  // "That's Thiago Silva": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.1,q[1]+.5,t));
  if(hal>.01){const m=silvaState(T).place;groundRing(s,m.x!,-m.z!,1.1*hal,c);}
  // "read the pass early": the lane of the pass he read, dashed, from the passer's boot to the forward
  const lane=sm(q[2],q[2]+.8,t)*(1-sm(q[3]+1.6,q[3]+2.2,t));
  if(lane>.01)dashes(s,G3(P0),G3(R),c,9,lane,Math.max(8,.14*P3(G3(I_XZ),c)[2]),31);
  drawPlay(s,T,c,{ballScale:1.5,only:['silva','c-fwd','c-pass','mendy','ball'],noStadium:true});
  // "Good defenders": his eyes on the passer — a dashed line from his head to the passer
  const eye=sm(q[1],q[1]+.3,t)*(1-sm(q[2]+.6,q[2]+1,t));
  if(eye>.01){const m=silvaState(T).place,p=passerState(T).place;dashes(s,[m.x!,1.95,-m.z!],[p.x!,1.7,-p.z!],c,7,eye,Math.max(6,.1*P3([m.x!,0,-m.z!],c)[2]),41);}
  // "read the pass early": his early step, an arrow from where he started to where he takes it
  const step=sm(q[2]+.5,q[2]+1.4,t,easeOut)*(1-sm(q[3]+1.6,q[3]+2.2,t));
  if(step>.01){const a=G(18.2,33.1,c),b=G(M_AT[0],M_AT[1],c);arrow(s,a,b,Math.max(12,.2*P3([20,0,34],c)[2]),21,step);}
  // "they don't need to dive in": the dive he didn't make, a yellow ghost sliding at the forward, and a big cross over it; a tick at the ball
  const dive=sm(q[3]-.1,q[3]+.3,t,easeOutBack);
  if(dive>.01){drawPlayer(s,slideTackle(.3+.3*clamp(dive)),c,GHOST,DIVE_PLACE);
   const ctr=P3([DIVE_PLACE.x!+DIVE_H[0]*1.1,.45,-DIVE_PLACE.z!+DIVE_H[1]*1.1],c),r=.95*ctr[2]*clamp((t-q[3]-.25)/.3),w=Math.max(10,.18*ctr[2]);
   if(r>1){const x=new Path2D();x.addPath(ribbon([[ctr[0]-r,ctr[1]-r*.8],[ctr[0]+r,ctr[1]+r*.8]],w,{seed:81,taper:.1}));x.addPath(ribbon([[ctr[0]-r,ctr[1]+r*.8],[ctr[0]+r,ctr[1]-r*.8]],w,{seed:82,taper:.1}));mark(s,x);}}
  const stamp=sm(q[3]+.9,q[3]+1.25,t,easeOutBack);
  if(stamp>.002){const bp=P3(INTERCEPT,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]+1.3*bp[2],y=bp[1]-1.6*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  frame(s);
 },
 get still(){return Q(3)[3]+1.6;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'thiago-silva-signature',format:'11v11',title:'Thiago Silva: the early read',theme:'Read the pass early, step in, no need to dive',
 ageNote:'How he defended · Man City v Chelsea · Champions League final, 29 May 2021 · Porto',
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
/** Solved contact points (pitch metres; Chelsea's goal line at X=0, Z across) — checked by tests/play-film-thiago-silva-signature.cjs. */
export const FACTS={INTERCEPT,P0,R,BALL2,J,M_AT,T_READ,T_INT,T_P2,ballAt,
 /** mid-sole of each of Silva's boots at the interception frame (my metres) */
 rightFoot:()=>{const st=silvaState(T_INT),sk=solve(st.pose,SILVA.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 leftFoot:()=>{const st=silvaState(T_INT),sk=solve(st.pose,SILVA.build,st.place,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 /** Silva's pelvis height at the interception (on his feet, not on the grass) */
 pelvisY:()=>{const st=silvaState(T_INT),sk=solve(st.pose,SILVA.build,st.place,FIG);return sk.pelvis[1];},
 /** Silva's right boot at his pass out */
 passFoot:()=>{const st=silvaState(T_P2),sk=solve(st.pose,SILVA.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** the City passer's right boot at the forward pass */
 passerFoot:()=>{const st=passerState(0),sk=solve(st.pose,PASSER.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 silvaAt:(T:number)=>{const st=silvaState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 forwardAt:(T:number)=>{const st=forwardState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
