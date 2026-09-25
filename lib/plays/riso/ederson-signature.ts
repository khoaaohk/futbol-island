/** Ederson's signature, the long kick that starts attacks — Manchester City 6–1 Huddersfield Town, Premier League, Etihad Stadium,
 * Manchester, Sunday 19 August 2018 (a summer afternoon match). An iconic-play riso film (RisoStory, chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the 25th-minute opening goal from WRITTEN
 * accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Ederson a signature ("the long kick that starts attacks"), not one match. This goal is
 * that signature at its purest and best documented: straight from a goal kick, one 70-yard pass beat the Huddersfield press and put Agüero
 * through to score; Wikipedia records it as the first Premier League assist by a Manchester City goalkeeper.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "Ederson (footballer, born 1993)" (raw): "On 19 August 2018, Ederson became the first Manchester City goalkeeper to provide a
 *    Premier League assist, as his goal-kick was converted by Sergio Agüero for the opening goal in a 6–1 win over Huddersfield Town";
 *    "Although naturally left-footed ... capable of using either foot"; "launch an attack with long kicks"; Guinness record drop kick 75.35 m.
 *    https://en.wikipedia.org/wiki/Ederson_(footballer,_born_1993)
 *  - Evening Standard, "Manchester City 6 Huddersfield 1: Sergio Aguero scores hat-trick as Terriers are hit for six", 19 Aug 2018:
 *    "goalkeeper Ederson who eventually unlocked the door on 25 minutes. From a goal kick he bypassed the Huddersfield press with a brilliant,
 *    arrowed 70-yard pass to Aguero. Goalkeeper Ben Hamer foolishly rushed out to meet him and the Argentine showed good composure to check
 *    back and loft over both Hamer and the covering Philip Billing for his first league goal of the season."
 *    https://www.standard.co.uk/sport/football/manchester-city-6-huddersfield-1-sergio-aguero-scores-hattrick-as-terriers-are-hit-for-six-a3915101.html
 *  - The Guardian, "Sergio Agüero hits hat-trick in Manchester City's rout of Huddersfield", 19 Aug 2018: after Stankovic's 20-yard attempt
 *    "ballooned over", "There was no such direction issue for Ederson from the resulting goal-kick. The Brazilian struck a sweet 70-yard pass
 *    to the roving Agüero and, as Ben Hamer advanced, the goalkeeper found himself the victim of a cute lob and City led 1-0"; City's back
 *    three (Stones, Kompany, Laporte) with Mendy, D. Silva and Jesus; Huddersfield 3-5-1-1 with Stankovic, Tommy Smith, Sabiri, Mounie.
 *    https://www.theguardian.com/football/2018/aug/19/manchester-city-huddersfield-town-premier-league-match-report
 *  - Wikipedia, "2018–19 Huddersfield Town A.F.C. season" (raw): the kits (home blue-and-white stripes with white shorts; away all black;
 *    third fluorescent yellow with navy shorts); 1–6 v Manchester City, 19 August 2018, their heaviest defeat.
 * CONFIRMED by those accounts: the date, ground, score, the 25th minute and 1–0 opener; it came from a GOAL KICK (after Stankovic's shot went
 * over); a 70-yard, "arrowed", "sweet" pass that bypassed Huddersfield's press; Agüero "roving" and free to receive; Hamer rushed out /
 * advanced; Agüero CHECKED BACK and LOFTED (a "cute lob") over Hamer AND the covering Philip Billing; Ederson is naturally left-footed.
 * INFERRED (illustrative): every exact position, run and timing; the kicking foot (his natural LEFT); the side of the six-yard box; the flat
 * flight and one bounce before Agüero's first touch; Agüero's right foot for the touch and the lob; Huddersfield's defenders caught on a
 * high line; the kits — City's sky blue home shirts, white shorts, sky blue socks; Huddersfield in their all-black change strip (their home
 * stripes clash with City's shirts; black prints navy); the goalkeepers' colours (Ederson drawn red, Hamer yellow) — none named in the
 * narration; who else is on the pitch and where (unnamed figures in the shape of a 3-at-the-back City and a pressing Huddersfield); the
 * direction of play on screen (City attacking left to right from the main-stand camera). The stadium (not from a fetched source): a steep
 * three-tier bowl with a navy roof ring and the Etihad's tall cable masts outside it; a bright afternoon.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, real time (the goal kick, the 70-yard flight, the keeper
 * rushing out, the lob); ch2 = the slow-motion replay LOW behind Ederson (he looks up; the press is high; Agüero free behind it; his left
 * foot; the ball flies over the press); ch3 = a second replay angle from BEHIND THE HUDDERSFIELD GOAL (the check-back, the lob over Hamer
 * and Billing), ending on the whole move traced in one line; ch4 = the lesson, high behind the keeper (look up, find the free teammate, one
 * long pass starts the attack). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept in the
 * central ~1000 units so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward the Huddersfield goal, y up, +z = the main-stand side = Ederson's right as he kicks),
 * athlete.ts's own convention, so his LEFT foot strikes without a mirrored projector. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,header,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. Once the
 * lead has generated public/plays/narration/ederson-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ederson-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The long kick, live',text:'Huddersfield, 2018. A City goal kick. Ederson looks up, finds Agüero seventy yards away. The keeper rushes out, Agüero lifts it over. Goal!',tail:1.9,
  cues:['Huddersfield','goal kick','Ederson','looks up','finds Agüero','seventy yards','keeper rushes','Agüero lifts','Goal']},
 {label:'Watch again',text:'Watch again. Huddersfield press high, but Agüero is free behind them. His left foot sends it over the press.',tail:1.5,
  cues:['Watch again','Huddersfield press','Agüero is free','left foot','sends it','over the press']},
 {label:'Behind the goal',text:'Behind the goal: Agüero checks back and lobs Ben Hamer. One kick did it all.',tail:1.4,
  cues:['Behind the goal','Agüero checks','lobs','Ben Hamer','One kick','did it all']},
 {label:'Your turn',text:'Your turn: look up before you kick. A long pass to a free teammate starts an attack in one touch.',tail:1.7,
  cues:['Your turn','look up','before you kick','long pass','free teammate','starts an attack','one touch']},
];
import timingJson from '../../../public/plays/narration/ederson-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ederson: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ederson: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Huddersfield's goal line is x = 0 (City attack +x), City's goal line x = −105, goal centres z = 0, +z = the main-stand side. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Etihad on a bright afternoon: a steep squared bowl, a navy roof ring, the cable masts
const CXS=-52.5,NS=60,PE=.28;
/** a point on the bowl: angle th round the pitch centre (0 = behind Huddersfield's goal, +90° = the main stand), d metres out from the
 * stand's front (a squared superellipse 9 m behind the goal lines, 7 m beyond the touchlines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(61.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD1=44;
const RAKE=(b:number):[number,number]=>[SD1*b,1.4+34*b];
type Bowl={seg:V3[][];roof:V3[][];tiers:[V3,V3][];seats:{P:V3;h:number}[];masts:{foot:V3;top:V3;ties:V3[]}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],tiers:[],seats:[],masts:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD1-16,y1+7),rim(b,SD1-16,y1+7),rim(b,SD1+2,y1+4),rim(a,SD1+2,y1+4)]);
  // the tier fronts (two facias across the rake)
  for(const f of[.36,.68]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.18)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 // the cable masts ring the outside of the bowl; ties run down to the roof's inner edge
 for(let m=0;m<12;m++){const th=(m+.5)/12*TAU,[,y1]=RAKE(1);o.masts.push({foot:rim(th,SD1+8,0),top:rim(th,SD1+10,y1+30),ties:[rim(th-.09,SD1-16,y1+7),rim(th+.09,SD1-16,y1+7)]});}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a bright Manchester afternoon: paper sky with a light blue screen
 s.field(B,.16,.5);
 const bowl=new Path2D(),roof=new Path2D(),tiers=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 // the masts and their ties first (white steel against the sky), so the bowl hides their feet
 const mast=new Path2D(),tie=new Path2D();for(const m of BOWL.masts){if(toCam(c,m.foot)[2]<20)continue;seg3(c,m.foot,m.top,1.1,mast,1.1);for(const q of m.ties)seg3(c,m.top,q,.25,tie,.6);}
 s.fill(K,tie,.6);s.knockout(mast,.9);s.stroke(K,mast,1.2,.8);
 s.knockout(bowl);s.tone(B,bowl,.55);s.tone(K,bowl,.16);
 // the crowd: one mark per seat group, sized by distance; sky blue and white City, a navy block, a few yellow flags; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.5?0:q.h<.78?1:q.h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(B,inks[1],.75);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);
 for(const[a,b] of BOWL.tiers)if(toCam(c,a)[2]>14&&toCam(c,b)[2]>14)seg3(c,a,b,1.3,tiers,1.2);
 s.fill(K,tiers,.8);
 s.knockout(roof);s.fill(K,roof,.88);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, both goals
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const gp0=polyP(c,[[8.5,0,-40.5],[8.5,0,40.5],[-113.5,0,40.5],[-113.5,0,-40.5]]);if(gp0.length<3)return;const gp=polyPath(gp0,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // advertising boards behind both goals and along both touchlines: navy with paper panels (generic)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.2,0,-30],[4.2,0,30]);board([-109.2,0,-30],[-109.2,0,30]);board([-108,0,-37.5],[3,0,-37.5]);board([-108,0,37.5],[3,0,37.5]);
 for(const xx of[4.1,-109.1])for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[xx,.25,z],[xx,.25,z+3.3],[xx,.68,z+3.3],[xx,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.45);
 // painted lines (both halves)
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(const X of[0,-52.5,-105])for(let k=0;k<4;k++)L([X,0,-34+k*17],[X,0,-34+(k+1)*17]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 for(const[X,d] of[[0,-1],[-105,1]] as [number,number][]){
  L([X,0,-20.16],[X+16.5*d,0,-20.16]);L([X+16.5*d,0,-20.16],[X+16.5*d,0,20.16]);L([X+16.5*d,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+5.5*d,0,-9.16]);L([X+5.5*d,0,-9.16],[X+5.5*d,0,9.16]);L([X+5.5*d,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)circ(X-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(X+11,0,9.15,-a,a,12);
  seg3(c,[X+11*d-.1,0,0],[X+11*d+.1,0,0],.22,ln);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const X of[0,-105])for(const z of[-34,34]){seg3(c,[X,0,z],[X,1.55,z],.05,pole);addPoly(flag,polyP(c,[[X,1.55,z],[X,1.2,z],[X+(X<0?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,1,o.bulge??0);goal3(s,c,-105,-1,0);
}
/** a goal on the line x = X, net 2 m deep toward dir (+1: Huddersfield's goal); bulge pushes the back out round z = GOAL_PT's z */
function goal3(s:Sheet,c:Cam,X:number,dir:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,bz=GOAL_PT[2],back=(z:number,y=0)=>X+dir*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(y<1?.6:1));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,2),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,2),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.12);
 const near=toCam(c,[X,1,0])[2]<60;
 if(near){const mesh=new Path2D();
  for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,2),1.9,z],.022,mesh,.7);seg3(c,[back(z,2),1.9,z],[back(z),0,z],.022,mesh,.7);}
  for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
  s.fill(K,mesh,.7);}
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** City home: sky blue shirts, white shorts, sky blue socks; navy numbers and trim (inferred) */
const SKY:InkFill=[B,.5];
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Huddersfield change strip: all black (printed navy), white numbers (inferred) */
const town=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const EDER_B={height:1.88,bulk:1.04};
const EDER_ST:AthleteStyle={shirt:[R,.85],shorts:[R,.85],socks:[R,.85],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:31,numberInk:K,build:EDER_B,seed:31};
const AGUERO_B={height:1.73,bulk:1.06,thighs:1.1};
const AGUERO_ST=city({number:10,skin:SKIN_M,build:AGUERO_B,seed:10});
const HAMER_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:26};

// ---------------------------------------------------------------- the kick geometry (τ = seconds after Ederson's contact)
/** the goal kick: from the edge of his six-yard box, a little left of centre (inferred), aimed at Agüero's run */
const K_BALL:V3=[-99.5,.11,-2.6];
const LAND:V3=[-37.2,.11,-5.4];
const YAW_K=yawTo(K_BALL[0],K_BALL[2],LAND[0],LAND[2]);
/** "arrowed": the kick climbs flat and fast; a full swing of the LEFT foot, body leaning back a touch to lift it */
const DRIVE:Partial<Pose>={lean:6,pitch:-2,lAnk:62};
const KD=1.15,K_ST=-STRIKE_CONTACT*KD;
function kStrike(tau:number):Pose{const u=(tau-K_ST)/KD;return over(strike(clamp(u),{foot:'l',power:1}),DRIVE,bump(-.3,.35,tau)*.8);}
/** the inside of the laces of his left foot at contact, relative to the pelvis (solved once, FK) */
const K_FOOT=(()=>{const sk=solve(kStrike(0),EDER_B,{x:0,z:0,yaw:YAW_K});return mix3(sk.lAn,sk.lToe,.5);})();
const E0:[number,number]=[K_BALL[0]-K_FOOT[0],K_BALL[2]-K_FOOT[2]];
/** the flight: 70 yards in 2.4 s, apex 12 m, air drag (fast off the boot, slowing), one bounce, then Agüero's first touch */
const FLY=2.4,APEX=12,T_CTRL=2.98;
const BOUNCE:V3=[-34.7,.11,-5.5];
const flightE=(u:number)=>u*(1.32-.32*u);
function flight(u:number):V3{const e=flightE(u),b=mix3(K_BALL,LAND,e);return[b[0],.11+4*APEX*e*(1-e)*(1-.12*e),b[2]];}

// ---------------------------------------------------------------- Agüero's carry → the check-back → the lob over Hamer and Billing
const T_TOUCH=[T_CTRL,3.56,4.12],T_CHK=4.66,T_LOB=5.36,LFLY=1.42,IN_NET=T_LOB+LFLY+.08;
const LOB0:V3=[-24.9,.11,-3.3];
const GOAL_PT:V3=[0,1.45,-.7];
const LOB_APEX=4.2;
const YAW_L=yawTo(LOB0[0],LOB0[2],GOAL_PT[0],GOAL_PT[2]);
const SCOOP:Partial<Pose>={lean:-4,pitch:-2,rAnk:-6,neckP:14};
const LD=.8,L_ST=T_LOB-STRIKE_CONTACT*LD;
function lStrike(tau:number):Pose{const u=(tau-L_ST)/LD;return over(strike(clamp(u),{foot:'r',power:.4}),SCOOP,bump(T_LOB-.35,T_LOB+.3,tau));}
const L_FOOT=(()=>{const sk=solve(lStrike(T_LOB),AGUERO_B,{x:0,z:0,yaw:YAW_L});return mix3(sk.rAn,sk.rToe,.55);})();
const A_LOB:[number,number]=[LOB0[0]-L_FOOT[0],LOB0[2]-L_FOOT[2]];
const lobE=(u:number)=>u*(1.12-.12*u);
function lob(u:number):V3{const e=lobE(u),b=mix3(LOB0,GOAL_PT,e);return[b[0],b[1]+4*LOB_APEX*e*(1-e),b[2]];}
/** when (and where) the lob passes over Billing, covering back on the line (he leaps for it) */
const T_BJ=T_LOB+LFLY*.74,BJ=lob(.74);
/** Agüero's celebration: away toward the main-stand corner */
const CEL:[number,number]=[-6,21];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'city'|'town'|'gk'|'ogk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const Er=(dx:number,dz:number)=>[E0[0]+dx,E0[1]+dz];
const CTRL_P:[number,number]=[BOUNCE[0]-.55,BOUNCE[2]+.05];
const ACTORS:Actor[]=[
 {name:'Ederson',role:'hero',st:EDER_ST,key:true,keys:[[-5,...Er(-1.4,1.2)],[-3.6,...Er(-2.4,2.4)],[-2.7,...Er(-3.2,3.3)],[-1.25,...Er(-3.3,3.4)],[-.6,...Er(-1.5,1.5)],[0,...E0],[.45,...Er(.9,-.1)],[1.6,...Er(2.2,-.2)],[4,...Er(4,0)],[13,...Er(5,0)]]},
 {name:'Agüero',role:'city',st:AGUERO_ST,key:true,keys:[[-5,-46.4,-7.8],[-2,-45.8,-7.4],[-.6,-45.6,-7],[.6,-43.8,-6.6],[1.6,-40.6,-6.1],[2.5,-37,-5.6],[T_CTRL,...CTRL_P],[3.56,-31.6,-5.1],[4.12,-27.8,-4.8],[T_CHK,-25.1,-4.5],[5.02,-25.5,-4],[T_LOB,...A_LOB],[5.9,-23.6,-2.9],[6.9,-18,-1],[8.2,-12,6],[9.6,CEL[0]-3,CEL[1]-6],[11,...CEL],[13,CEL[0]+.5,CEL[1]+.4]]},
 {name:'Hamer',role:'ogk',st:HAMER_ST,key:true,keys:[[-5,-6.5,-.8],[0,-7.2,-1.2],[2.4,-10,-2.4],[3.6,-15,-3.6],[4.6,-19.4,-4.2],[5.05,-21.2,-4.2],[5.6,-21.8,-4.1],[13,-21.8,-4.1]]},
 {name:'Billing',role:'town',st:town({skin:SKIN_M,build:{height:1.95},seed:18}),key:true,keys:[[-5,-49,3.5],[0,-47.5,3],[2,-41,2],[3.5,-33,1],[4.8,-23,-.2],[5.9,-12,-.6],[T_BJ-.25,BJ[0]-1.2,BJ[2]+.3],[T_BJ,BJ[0]+.1,BJ[2]+.1],[T_BJ+.5,BJ[0]+1.6,BJ[2]],[13,BJ[0]+2.4,BJ[2]-.2]]},
 // Huddersfield's high line (caught out by the run in behind) and their press on City's box
 {name:'Town CB',role:'town',st:town({seed:40,build:{height:1.9}}),keys:[[-5,-45.2,-2.6],[0,-44.8,-2.8],[1.4,-42.6,-3.6],[3,-36.5,-4],[4.6,-30,-3.6],[6.5,-24,-2.4],[13,-20,-1]]},
 {name:'Town RCB',role:'town',st:town({seed:41,skin:SKIN_D,build:{height:1.86}}),keys:[[-5,-45.6,-12.5],[0,-45,-12.4],[2,-41.5,-10.5],[4.5,-33,-8],[7,-26,-5],[13,-22,-4]]},
 {name:'Town LCB',role:'town',st:town({seed:42,build:{height:1.88}}),keys:[[-5,-44.6,8.6],[0,-44.2,8.2],[2,-40.8,6],[4.5,-32,3.2],[7,-25,1.8],[13,-21,1]]},
 {name:'Mounie',role:'town',st:town({seed:43,skin:SKIN_D,build:{height:1.9}}),keys:[[-5,-87.2,3.2],[0,-86.4,2.6],[1.5,-85,2],[4,-80,1],[13,-68,0]]},
 {name:'Town press R',role:'town',st:town({seed:44}),keys:[[-5,-84,-12.5],[0,-83.2,-12],[2,-81,-11],[13,-66,-8]]},
 {name:'Town press L',role:'town',st:town({seed:45,build:{height:1.8}}),keys:[[-5,-82.6,11.4],[0,-82,10.8],[2,-80,10],[13,-65,7]]},
 {name:'Town mid',role:'town',st:town({seed:46,skin:SKIN_M}),keys:[[-5,-70,-3],[0,-69,-3],[3,-64,-3.6],[13,-50,-3]]},
 {name:'Stones',role:'city',st:city({number:5,build:{height:1.88},seed:5}),keys:[[-5,-95.5,-16],[0,-95,-15.5],[4,-88,-12],[13,-72,-8]]},
 {name:'Kompany',role:'city',st:city({number:4,skin:SKIN_D,hairStyle:'bald',build:{height:1.9},seed:4}),keys:[[-5,-93,1.2],[0,-92.4,1],[4,-86,.5],[13,-70,0]]},
 {name:'Laporte',role:'city',st:city({number:14,build:{height:1.9},seed:14}),keys:[[-5,-95,15.5],[0,-94.6,15],[4,-88,12],[13,-72,8]]},
 {name:'City mid',role:'city',st:city({seed:25,skin:SKIN_M,build:{height:1.79}}),keys:[[-5,-77,.6],[0,-76.5,.4],[4,-70,0],[13,-58,0]]},
 {name:'David Silva',role:'city',st:city({number:21,build:{height:1.73},seed:21}),keys:[[-5,-64,-10],[0,-63,-10],[3,-55,-8],[13,-38,-6]]},
 {name:'Mendy',role:'city',st:city({number:22,skin:SKIN_D,build:{height:1.85},seed:22}),keys:[[-5,-60,-27],[0,-59,-26.6],[3,-52,-24],[13,-34,-18]]},
 {name:'Jesus',role:'city',st:city({number:33,skin:SKIN_M,build:{height:1.75},seed:33}),key:true,keys:[[-5,-50,11.5],[0,-49.4,11],[2,-44,9.4],[4.5,-34,6],[7,-25,4],[9,-18,10],[11,CEL[0]-1.6,CEL[1]-1.2],[13,CEL[0]-1.4,CEL[1]-1.1]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,AGUERO=IX('Agüero'),HAMER=IX('Hamer'),BILLING=IX('Billing');
const PRESS=[IX('Mounie'),IX('Town press R'),IX('Town press L')];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: the goal kick, the bounce, the carry, the check-back, the lob, the net
/** Agüero's touches: each one pushes the ball to where his right boot will meet it at the next touch */
const footAt=(tau:number):V3=>{const[x,z]=posOf(AGUERO,tau),v=velOf(AGUERO,tau),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.55,.11,z+v[1]/l*.55+.12];};
const TP=T_TOUCH.map(footAt);
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
const NET_HIT:V3=[1.75,.9,-.5],REST:V3=[1.3,.11,-.4];
function ballAt(tau:number):V3{
 if(tau<0)return K_BALL;
 if(tau<FLY)return flight(tau/FLY);
 if(tau<T_CTRL){const u=(tau-FLY)/(T_CTRL-FLY),b=mix3(LAND,BOUNCE,u);return[b[0],.11+1.25*4*u*(1-u),b[2]];}
 for(let i=0;i<T_TOUCH.length;i++){const a=T_TOUCH[i],b=i+1<T_TOUCH.length?T_TOUCH[i+1]:T_CHK,B2=i+1<T_TOUCH.length?TP[i+1]:footAt(T_CHK);if(tau<b)return roll(i?TP[i]:BOUNCE,B2,(tau-a)/(b-a),.35);}
 if(tau<T_LOB)return roll(footAt(T_CHK),LOB0,(tau-T_CHK)/(T_LOB-T_CHK),.6);
 if(tau<T_LOB+LFLY)return lob((tau-T_LOB)/LFLY);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-T_LOB-LFLY)/.08));
 const u=clamp((tau-IN_NET)/.6);const b=mix3(NET_HIT,REST,easeOut(u));return[b[0],.11+(NET_HIT[1]-.11)*Math.pow(1-u,2),b[2]];
}
const spinAt=(tau:number)=>TAU*(tau<0?0:tau<FLY?7*tau:tau<T_LOB?7*FLY+2.2*(tau-FLY):7*FLY+2.2*(T_LOB-FLY)+4*Math.min(tau-T_LOB,LFLY));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** "looks up": chin up, eyes down the pitch, hands loose at the hips */
const LOOKUP:Partial<Pose>={neckP:-26,lean:2,pitch:0,lShA:18,rShA:22,lElb:30,rElb:30};
/** "checks back": the right sole drags the ball back and inside, body over it, arms out */
const CHECK:Partial<Pose>={rHipF:34,rKnee:36,rAnk:-26,rHipR:-10,lKnee:40,lHipF:14,lean:10,pitch:-3,twist:-18,lShA:58,rShA:44,lElb:30,rElb:36,neckP:26};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='ogk'||(a.role==='town'&&sp<1.5))yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.4&&sp<.6&&k!==AGUERO&&k!==HERO)yaw=yawTo(x,z,CEL[0],CEL[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='ogk'?keeperSet(tau*1.4+k*.1):a.role==='town'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===HERO){
  // the goal kick: steps back from the ball, chin up to find Agüero, the run-up from his right, the full swing of the LEFT foot
  if(tau<-.9)p=over(p,LOOKUP,sm(-4.4,-3.6,tau)*(1-sm(-1.3,-.9,tau)));
  if(tau<-1.25)yaw=lerpAng(yaw,YAW_K,sm(-3,-2.4,tau));
  const u=(tau-K_ST)/KD,w=Math.min(sm(-.12,.1,u),1-sm(1,1.4,u));
  if(w>0){p=blendPose(p,kStrike(tau),w);yaw=lerpAng(yaw,YAW_K,sm(-.35,.05,u));}
  if(tau>1.4)p=over(p,{neckP:-10},sm(1.4,2,tau));
 }
 if(k===AGUERO){
  if(tau>T_CTRL-.4&&tau<T_CHK-.1)p=blendPose(p,dribble(distOf(k,tau)/1.7,{foot:'r',speed:.8}),clamp((sp-.5)/.8)*bump(T_CTRL-.4,T_CHK,tau));
  // the first touch: cushion the bouncing ball down with the right foot
  p=over(p,{rHipF:48,rKnee:40,rAnk:10,lKnee:34,lean:14,neckP:32,lShA:44,rShA:30},bump(T_CTRL-.3,T_CTRL+.2,tau));
  // the check-back: plant, drag it back inside as Hamer arrives
  const wc=bump(T_CHK-.22,T_LOB-.2,tau);if(wc>0){p=over(p,CHECK,wc);yaw=lerpAng(yaw,yawTo(x,z,-40,-3),wc*.5);}
  const u=(tau-L_ST)/LD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,lStrike(tau),w);yaw=lerpAng(yaw,YAW_L,sm(-.25,.05,u));}
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:tau<10.6?'run':'arms'}),sm(IN_NET+.2,IN_NET+.7,tau));
 }
 if(k===HAMER){
  // rushing out, then down to smother on the ball's old spot as it is checked back past him
  const D=1,u=(tau-(T_LOB-.55*D))/D;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.06}),sm(0,.1,u));yaw=lerpAng(yaw,yawTo(x,z,LOB0[0]-2,LOB0[2]-1.4),.8);}
 }
 if(k===BILLING){const D=.9,u=(tau-(T_BJ-.52*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,header(Math.min(1,u)),w);yaw=lerpAng(yaw,Math.PI,w);}}
 if(tau>IN_NET+.25&&k!==AGUERO&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='city')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='town')p=over(p,DESPAIR,w*.85);}
 if(k===HERO&&tau>IN_NET+.3)p=over(p,JOY,sm(IN_NET+.3,IN_NET+.9,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the kick, the lob). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.03;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.04,.12,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the ball's path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid';focus?:number};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):Record<number,DrawResult>{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending,res:Record<number,DrawResult>={};
 const focus=e.focus??HERO;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,hero=k===focus;
   const detail:AthleteStyle['detail']=passing?(hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':hero&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const fast=(k===HERO&&tp>-.5&&tp<.45)||(k===AGUERO&&tp>T_LOB-.45&&tp<T_LOB+.35);
   res[k]=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,!!e.smear&&big&&fast);}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return res;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** the ball's path so far as a ribbon, from τ `from` to τ */
function trail(s:Sheet,c:Cam,from:number,tau:number,w:number,o:{ink?:string;min?:number;n?:number;seed?:number}={}){if(w<=0||tau<=from)return;
 const{ink=Y,min=6,n=28,seed=61}=o,pts=pathPts(c,from,tau,n);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(tau))*.12);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.8,pressure:.2,wobble:0}),.92*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a screen-space ring round a world point (min radius in sheet units, so a far player still reads) */
function sring(s:Sheet,c:Cam,P:V3,w:number,ink=Y,o:{min?:number;k?:number;seed?:number}={}){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(o.min??26,kAt(c,P)*(o.k??1.3))*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r*.8,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,r*.13),{close:true,seed:o.seed??77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** "looks up": a dashed yellow eye-line from his head, drawn out toward a target */
function eyeLine(s:Sheet,c:Cam,r:DrawResult|undefined,T:V3,w:number){if(!r||w<=.02)return;
 const H=r.sk.head,a=pr(c,[H[0],H[1]+.05,H[2]]),b=pr(c,T);if(!a||!b)return;const e:Pt=[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w],u=Math.max(4,kAt(c,H)*.04);
 s.knockout(ribbon([a,e],u*1.8,{seed:71,taper:0,wobble:.4}),.7*w);s.fill(Y,ribbon([a,e],u,{seed:71,taper:.1,wobble:.4,gaps:[[.12,.2],[.3,.38],[.48,.56],[.66,.74],[.84,.9]]}),.95*w);}
/** "the press": a red wall line through the pressing players (they are all on one side of the ball) */
function pressWall(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;
 const pts=PRESS.map(k=>at3(k,tau,.05)).sort((a,b)=>a[2]-b[2]);const q:Pt[]=[];const P0=add3(pts[0],[0,0,-4]),P1=add3(pts[pts.length-1],[0,0,4]);
 for(let i=0;i<=16;i++){const u=i/16*w,P=u<.5?mix3(P0,mix3(pts[0],pts[pts.length-1],.5),u*2):mix3(mix3(pts[0],pts[pts.length-1],.5),P1,u*2-1);const p=pr(c,P);if(p)q.push(p);}
 if(q.length>2){const wd=Math.max(6,kAt(c,pts[1])*.3);s.knockout(ribbon(q,wd*1.6,{seed:91,taper:.1,wobble:.6}),.6*w);s.fill(R,ribbon(q,wd,{seed:91,taper:.1,wobble:.6}),.9*w);}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** the step back as "Ederson" lands, the chin up on "looks up", the run-up on "finds Agüero", contact as "seventy yards" lands, the keeper
 * racing out on "keeper rushes", the lob as "Agüero lifts" lands, the net on "Goal"; real time elsewhere */
const tau1=(t:number)=>{const g=CUE(0,'Goal'),ks=CUE(0,'seventy yards');
 return key(t,mono([[0,-5],[CUE(0,'Ederson'),-4.2],[CUE(0,'looks up'),-3.4],[CUE(0,'finds Agüero'),-1.25],[ks+.2,0],[CUE(0,'keeper rushes')+.1,4.3],[CUE(0,'Agüero lifts')+.3,T_LOB],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-50,21,64];
function cam1(t:number):Cam{
 const tau=tau1(t),ep=at3(HERO,tau,1),ap=at3(AGUERO,tau,1),hp=at3(HAMER,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-86,2,-2],fov:20})],
  [CUE(0,'Ederson')-.5,1.1,()=>({P:P1,T:add3(ep,[5,0,-1]),fov:9})],
  [CUE(0,'seventy yards')-.2,.9,()=>({P:P1,T:mix3(b,[-62,3,-4],.3),fov:24})],
  [CUE(0,'seventy yards')+1.3,1.1,()=>({P:P1,T:mix3(b,ap,.55),fov:14})],
  [CUE(0,'keeper rushes')-.2,.9,()=>({P:P1,T:mix3(ap,hp,.5),fov:10})],
  [CUE(0,'Agüero lifts')-.1,.8,()=>({P:P1,T:mix3(ap,[-4,1.4,-1],.5),fov:11})],
  [g+.4,1.6,()=>({P:P1,T:mix3(ap,[-4,1,4],.35),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the long ball's wake: a thin yellow trail behind it while it flies (so the eye can follow it across the pitch)
  if(tau>0&&tau<FLY+.5)trail(s,c,Math.max(0,tau-.7),Math.min(tau,FLY),1-sm(FLY,FLY+.5,tau),{min:4,n:16});
  play(s,c,tau,tp,tpp,{minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // the strike: a spark off his left boot
  const age=tau;if(age>-.05&&age<.35){const q=pr(c,K_BALL);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,K_BALL)*.6),{n:8,seed:13,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,K_BALL)*.05)});}
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'keeper rushes')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Ederson
const tau2=(t:number)=>key(t,mono([[0,-3.2],[CUE(1,'Watch again'),-3.1],[CUE(1,'Huddersfield press'),-2.5],[CUE(1,'Agüero is free'),-1.9],[CUE(1,'left foot'),-.45],[CUE(1,'sends it'),0],[CUE(1,'over the press'),.85],[SECS(1),1.9]]),linear);
const E2:V3=[E0[0]-6.2,1.7,E0[1]+3.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.max(0,tau)),ep=at3(HERO,Math.min(tau,.3),1.1),ap=at3(AGUERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(ep,[-80,2,-3],.45),fov:40})],
  [CUE(1,'Huddersfield press')-.2,.9,()=>({P:add3(E2,[0,.6,0]),T:[-85,1.2,.5],fov:26})],
  [CUE(1,'Agüero is free')-.1,1,()=>({P:add3(E2,[0,3.2,3]),T:mix3(ap,[-85,1,0],.3),fov:13})],
  [CUE(1,'left foot')-.35,.8,()=>({P:add3(E2,[2.4,-.4,-3.2]),T:add3(ep,[1.8,-.35,.4]),fov:32})],
  [CUE(1,'sends it')+.15,1.2,()=>({P:add3(E2,[1,.4,-1]),T:[-72,5,-3.5],fov:42})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tW=CUE(1,'Watch again'),tP=CUE(1,'Huddersfield press'),tF=CUE(1,'Agüero is free'),tL=CUE(1,'left foot'),tS=CUE(1,'sends it'),tO=CUE(1,'over the press');
  stadium(s,c,t);
  ground(s,c);
  // "press high": a red wall through the three players pressing City's box
  pressWall(s,c,tau,sm(tP-.1,tP+.6,t)*(1-sm(tO+.6,tO+1.1,t)));
  // the kick's path climbing over the press
  if(tau>0)trail(s,c,0,Math.min(tau,FLY),1,{min:6,n:20});
  const res=play(s,c,tau,tp,tpp,{smear:true,minBall:11});
  // "looks up": his eye-line out to Agüero
  eyeLine(s,c,res[HERO],at3(AGUERO,tau,1.4),sm(tW+.1,tW+.7,t)*(1-sm(tP-.5,tP-.2,t)));
  // "Agüero is free": a yellow ring round him, far behind the press
  sring(s,c,at3(AGUERO,tau,.9),sm(tF-.1,tF+.35,t,easeOutBack)*(1-sm(tL-.3,tL+.1,t)),Y,{min:30,k:1.4,seed:81});
  // "left foot": a red ring on his kicking boot
  const lf=sm(tL-.1,tL+.3,t,easeOutBack)*(1-sm(tS+.3,tS+.7,t)),hr=res[HERO];
  if(hr&&lf>.02){const toe=hr.joints.lToe,an=hr.joints.lAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*lf+4,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.25,cy+Math.sin(a)*r*.85]);}
   s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lf);}
  // "sends it": the spark at contact
  const sf=sm(tS-.1,tS+.25,t,easeOutBack)*(1-sm(tS+.6,tS+1,t));
  if(sf>.02){const p=pr(c,K_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,K_BALL)*.5)*sf,{n:9,seed:61,width:Math.max(5,kAt(c,K_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.max(0,tau2(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'Agüero is free')+.4;

// ---------------------------------------------------------------- 3 · the second replay angle, behind Huddersfield's goal, then the whole move in one line
const tau3=(t:number)=>key(t,mono([[0,2.1],[CUE(2,'Behind the goal'),2.5],[CUE(2,'Agüero checks'),T_CHK-.05],[CUE(2,'lobs'),T_LOB],[CUE(2,'Ben Hamer'),T_LOB+.55],[CUE(2,'One kick'),IN_NET+.5],[SECS(2)+1,IN_NET+.5+(SECS(2)+1-CUE(2,'One kick'))*.8]]),linear);
const E3:V3=[10,5.2,-3.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),ap=at3(AGUERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(ap,b,.4),fov:22})],
  [CUE(2,'Agüero checks')-.3,.8,()=>({P:E3,T:mix3(ap,at3(HAMER,tau,.8),.4),fov:20})],
  [CUE(2,'lobs')+.1,.9,()=>({P:add3(E3,[-.4,-.3,.2]),T:mix3([-14,2.5,-2],b,.5),fov:30})],
  [CUE(2,'One kick')-.3,1.6,()=>({P:[14,15,-10],T:[-50,2,-4],fov:44})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tC=CUE(2,'Agüero checks'),tL=CUE(2,'lobs'),tH=CUE(2,'Ben Hamer'),tO=CUE(2,'One kick'),tA=CUE(2,'did it all');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.8});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "checks back": a yellow arrow along the ball's drag back and inside
  const ck=sm(tC-.1,tC+.5,t)*(1-sm(tL+.3,tL+.7,t));if(ck>.02){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(add3(ballAt(lerp(T_CHK,T_CHK+(T_LOB-T_CHK)*ck,i/8)),[0,-.08,0]));arrow3(s,c,pts,Math.max(6,kAt(c,LOB0)*.14),Y,.95);}
  // the lob so far
  if(tau>T_LOB)trail(s,c,T_LOB,Math.min(tau,T_LOB+LFLY),1-sm(tO-.3,tO+.3,t),{min:7});
  // "One kick did it all": the whole move in one yellow line, goal kick to net
  const all=sm(tO-.1,tA+.6,t);if(all>.02){trail(s,c,0,lerp(0,IN_NET,all),1,{min:9,n:60,seed:64});}
  play(s,c,tau,tp,tpp,{smear:true,minBall:11,focus:AGUERO});
  // "Ben Hamer": a red ring round the beaten keeper
  sring(s,c,at3(HAMER,tau,.5),sm(tH-.15,tH+.3,t,easeOutBack)*(1-sm(tO-.2,tO+.2,t)),R,{min:30,k:1.1,seed:84});
  // "did it all": a yellow ring round Ederson, far away at the other end
  sring(s,c,at3(HERO,tau,.9),sm(tA-.1,tA+.4,t,easeOutBack),Y,{min:26,k:1.6,seed:85});
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:0,
};
ch3.still=CUE(2,'Ben Hamer')+.2;

// ---------------------------------------------------------------- 4 · the lesson: look up → one long pass → to the free teammate → the attack starts
const tau4=(t:number)=>key(t,mono([[0,-4.6],[CUE(3,'look up'),-3.9],[CUE(3,'before you kick'),-2.4],[CUE(3,'long pass'),-.1],[CUE(3,'free teammate'),1.1],[CUE(3,'start'),FLY*.92],[CUE(3,'one touch'),T_CTRL+.15],[SECS(3),T_CTRL+1.3]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),ep=at3(HERO,Math.min(tau,.5),1),b=ballAt(Math.max(0,tau));
 return plan(t,[
  [0,0,()=>({P:[E0[0]-5.5,3.4,E0[1]+6.5],T:add3(ep,[2.5,-.1,-.8]),fov:30})],
  [CUE(3,'long pass')+.1,1.3,()=>({P:[-68,11,64],T:[-67,5,-4],fov:42})],
  [CUE(3,'one touch')+.2,1.3,()=>({P:[-62,10,60],T:mix3([-56,4,-4],b,.2),fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tU=CUE(3,'look up'),tB=CUE(3,'before you kick'),tF=CUE(3,'free teammate'),tP=CUE(3,'long pass'),tA=CUE(3,'start'),tT=CUE(3,'one touch'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c);
  // "free teammate": the press walled off in red, the free man ringed in yellow
  pressWall(s,c,tau,sm(tF-.3,tF+.4,t)*(1-sm(E-1,E-.6,t)));
  // one long pass: the flight drawn as it flies, kept on screen
  if(tau>0)trail(s,c,0,Math.min(tau,FLY),1-sm(E-.9,E-.5,t),{min:11,n:24});
  // "starts an attack": a red arrow from the reception on toward the far goal
  const sa=sm(tA-.1,tA+.9,t)*(1-sm(E-.8,E-.4,t));if(sa>.02){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push(mix3(add3(BOUNCE,[0,.05,0]),[lerp(-34.7,-20,sa),.05,lerp(-5.5,-3,sa)],i/10));arrow3(s,c,pts,Math.max(7,kAt(c,BOUNCE)*.9),R,.95);}
  const res=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "look up": chin up, the eye-line out over the press
  eyeLine(s,c,res[HERO],at3(AGUERO,tau,1.4),sm(tU-.05,tU+.8,t)*(1-sm(tP-.2,tP+.2,t)));
  // "before you kick": a red ring on the ball still at his feet
  sring(s,c,K_BALL,sm(tB-.1,tB+.3,t,easeOutBack)*(1-sm(tP-.25,tP+.05,t)),R,{min:18,k:.5,seed:86});
  sring(s,c,at3(AGUERO,tau,.9),sm(tF-.3,tF+.2,t,easeOutBack)*(1-sm(E-.8,E-.4,t)),Y,{min:28,k:1.4,seed:87});
  // "one touch": a spark as the ball arrives at Agüero's foot
  const ot=t-tT;if(ot>-.1&&ot<.8){const q=pr(c,BOUNCE);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(44,kAt(c,BOUNCE)*1.2),{n:9,seed:19,g:easeOutBack(clamp((ot+.1)/.2))*(1-clamp((ot-.45)/.35)),width:Math.max(4,kAt(c,BOUNCE)*.08)});}
 },
 still:0,
};
ch4.still=CUE(3,'free teammate')+.3;

const film:RisoStory={
 id:'ederson-signature',format:'11v11',title:"Ederson's long kick",
 theme:'The long kick that starts attacks: look up before you kick and find the free teammate; one long pass can start an attack',
 ageNote:'Manchester City 6–1 Huddersfield Town, Premier League, Etihad Stadium, Manchester, 19 August 2018: Ederson\'s goal kick sets up Agüero. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a long kick — a high yellow arc launched from the point with a ball riding it. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.55)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=18;i++){const k=i/18*u;pts.push([x+340*k,y-150*4*k*(1-k)*(1-.2*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
