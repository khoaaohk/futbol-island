/** Luís Figo — signature: the byline cross from the right. Germany 3–1 Portugal, World Cup match for third place, Gottlieb-Daimler-Stadion,
 * Stuttgart, 8 July 2006 (21:00 local kick-off, so the 88th minute is played under floodlights): Figo's cross, Nuno Gomes's header, 88'.
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the byline cross from the right", lesson "beat your defender,
 * then look up before you cross the ball"): it is the best-documented single Figo cross we could confirm, and it is the last thing he
 * did for Portugal. He came off the bench for his 127th and final cap and, two minutes from time, crossed for Nuno Gomes to head in —
 * "Figo's last act in his number seven shirt for Portugal was to lay on a goal for Gomes who headed in from close range" (BBC). His
 * crossing from the right flank is what Wikipedia's player article describes as his trademark ("curling crosses to teammates from the
 * right flank"), with stepovers as his favourite feint, so the film is built around the cross and the look-up before it.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, slowly, cached under the session scratchpad films/src-cache/):
 *  - BBC Sport, "Germany 3-1 Portugal", 8 July 2006: "Nuno Gomes headed Portugal a late consolation after a Luis Figo cross"; "On 76
 *    minutes the disappointing Pauleta made way for Figo who won his 127th and final cap for Portugal"; "Figo's last act in his number
 *    seven shirt for Portugal was to lay on a goal for Gomes who headed in from close range"; line-ups, Goals: Nuno Gomes 88; ref Toru
 *    Kamikawa; att 52,000.   https://news.bbc.co.uk/sport2/hi/football/world_cup_2006/4991644.stm   (cache: bbc-4991644.txt)
 *  - The Guardian (Observer), Martin Palmer, "Germans give Jurgen a night to remember", 9 July 2006: Figo left on the bench, "he came on
 *    late in the second half and provided the cross from which Nuno Gomes headed Portugal's late goal"; Kahn captain for the night;
 *    Germany's Kahn; Nowotny, Metzelder, Lahm, Jansen; ... Portugal ... Pauleta (Figo 77); Nuno Valente (Nuno Gomes 69).
 *    https://www.theguardian.com/football/2006/jul/09/worldcup2006.match   (cache: guardian-ger-por-2006.txt)
 *  - Wikipedia, "2006 FIFA World Cup knockout stage" (raw): date, 21:00 kick-off, Gottlieb-Daimler-Stadion, 3–1, Nuno Gomes 88'; both
 *    line-ups with shirt numbers and positions; kit templates (Germany white shirts, black shorts, white socks; Portugal red shirts, red
 *    shorts, red socks).   (cache: wiki-2006-wc-ko.txt)
 *  - Wikipedia, "Luís Figo" (raw): his final cap, "setting up Nuno Gomes to head in an 88th-minute consolation goal"; Pauleta "handed
 *    him back the captain's armband"; naturally right-footed; stepovers; curling crosses from the right flank.   (cache: wiki-luis-figo.txt)
 *  - German Wikipedia, "Fußball-Weltmeisterschaft 2006/Finalrunde" (raw): the same line-ups and substitutions.   (cache: dewiki-wm2006-finalrunde.txt)
 * CONFIRMED by those accounts: the match, date, ground, 21:00 kick-off, Germany 3–0 up, Figo on for Pauleta (76'/77') for his last cap,
 * wearing 7 and (Wikipedia) the captain's armband; the goal in the 88th minute: a Figo CROSS headed in by Nuno Gomes (21) FROM CLOSE
 * RANGE; Kahn (12, captain) in goal. Figo is right-footed. KIT: Germany white shirts, black (printed navy) shorts, white socks; Portugal
 * red shirts, red shorts, red socks. On the pitch at 88': Germany Kahn 12, Lahm 16, Nowotny 6, Metzelder 21, Jansen 2 (left-back),
 * Schneider 19, Kehl 5, Frings 8, Hitzlsperger 15, Neuville 10, Hanke 9; Portugal Ricardo 1, Paulo Ferreira 2, Ricardo Costa 4, Meira 5,
 * Nuno Gomes 21, Petit 8, Maniche 18, Cristiano Ronaldo 17, Deco 20, Simão 11, Figo 7.
 * INFERRED (illustrative, and kept OUT of the narration): which wing the cross came from (drawn from the RIGHT, his signature side, so
 * Jansen is the defender he faces) and from how deep (near the byline); the build-up (Maniche → Deco → Figo); the stepover feint and the
 * burst down the outside past Jansen; the right-foot, inside-of-the-boot cross curling away from Kahn; the exact spot and height of the
 * header and the side of the net; Kahn's late dive; every other player's position; the direction of play on screen (Portugal attacking
 * left to right from the main-stand camera, which puts Figo on the NEAR touchline); number colours (Portugal yellow, Germany navy); the
 * armband colour; both keepers' kits (Kahn grey); the +Teamgeist ball print; the 2006 ground's shape (an oval bowl around a running
 * track under a pale membrane roof — the track colour is a guess) and crowd colours; night darkness at 22:50; the celebrations.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, real time, following the ball from midfield to the net;
 * ch2 = the slow-motion replay from a raised camera behind Figo's left shoulder: he lifts his head (a dashed sight line to Gomes), Gomes's
 * run (blue), the spot (yellow ring) and the curling cross; ch3 = a second replay angle from BEHIND GERMANY'S GOAL: the header, the net,
 * then a pan to Figo; ch4 = the lesson over Figo's shoulder: beat your defender (the feint, his run outside), look up (sight line), cross
 * (the ball's lane to the striker's spot). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE
 * adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square), never sheet.safe. Scenes read only (t, c); every action keys
 * off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,keyPoses,mirrorPose,solve,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The last cross, live',text:'World Cup 2006, third place match. Luís Figo comes on for his last game for Portugal. Two minutes left. Figo on the wing... he looks up, crosses... Nuno Gomes heads it in!',seconds:14.8,
  cues:[[.2,'World Cup 2006'],[1.6,'third place'],[3,'Luís Figo comes on'],[4.3,'his last game'],[6.2,'Two minutes left'],[7.6,'Figo on the wing'],[9.4,'he looks up'],[10.6,'crosses'],[12,'Nuno Gomes heads it in']]},
 {label:'Watch it again',text:'Watch again, slowly. Before he crosses, Figo lifts his head. He sees where Nuno Gomes is running... and curls it there.',seconds:9.6,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.7,'Before he crosses'],[2.9,'Figo lifts his head'],[4.4,'He sees'],[5.4,'Nuno Gomes is running'],[7.2,'and curls it there']]},
 {label:'Behind the goal',text:"Behind the goal: Gomes heads it in from close range. Figo's last assist for Portugal!",seconds:7.8,
  cues:[[.15,'Behind the goal'],[1.7,'Gomes heads it in'],[3.1,'close range'],[4.4,"Figo's last assist"],[5.6,'for Portugal']]},
 {label:'Your turn',text:'Your turn: beat your defender, then look up before you cross the ball, so you know where your striker is running.',seconds:9.2,
  cues:[[.15,'Your turn'],[.9,'beat your defender'],[2.3,'then look up'],[3.1,'before you cross'],[4.6,'so you know'],[5.4,'your striker'],[6.1,'is running']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py figo-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/figo-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-figo-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/figo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('figo: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced monotone in time (a recorded voice can squeeze cue gaps) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: full-sheet framing (never sheet.safe), the engine's arrival scale kept. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Portugal attack +X, Germany's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Portugal's
 * right wing (Figo) is the near side. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras inside the bowl cull the near stand) */
function quadP(c:Cam,q:V3[],minDepth=16):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- the Gottlieb-Daimler-Stadion in 2006, at night: an oval bowl round a running track, pale membrane roof
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the trackside rim (an oval superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(68+d)*Math.sign(c)*Math.pow(Math.abs(c),.6),y,(47+d)*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
const LOW=(b:number):[number,number]=>[1+22*b,1.4+12*b],UP=(b:number):[number,number]=>[25+18*b,16+15*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:[V3,V3][];track:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],track:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,23,13.4),rim(b,23,13.4),rim(b,25,16),rim(a,25,16)]);
  o.roof.push([rim(a,14,37),rim(b,14,37),rim(b,50,33),rim(a,50,33)]);
  o.lamps.push([rim(a,14.6,36.4),rim(b,14.6,36.4)]);
  o.track.push(rim(a,.5,0));
  for(const [f,rows,off] of [[LOW,8,0],[UP,7,5000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,13);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = cameras), the membrane roof and its lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.74,.5);s.field(B,.26,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){const r1=quadP(c,BOWL.low[i]);if(r1)addPoly(low,r1);const r2=quadP(c,BOWL.up[i]);if(r2)addPoly(up,r2);const r3=quadP(c,BOWL.band[i]);if(r3)addPoly(band,r3);const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 s.knockout(low);s.tone(B,low,.36);s.tone(K,low,.32);
 s.knockout(up);s.tone(B,up,.34);s.tone(K,up,.44);
 // the crowd: German white, black-red-gold, Portuguese red, a few camera flashes
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.h<.46?2:q.h<.76?0:q.h<.93?1:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.85);s.fill(K,inks[1],.85);s.knockout(inks[2],.72);s.fill(Y,inks[3],.95);
 s.knockout(band);s.fill(K,band,.85);
 // the pale membrane roof, lit from below
 s.knockout(roof);s.tone(B,roof,.22);s.tone(K,roof,.18);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track, the floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, flags and both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const tr=polyP(c,BOWL.track);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(R,p,.55);s.tone(K,p,.35);}
 const sur=polyP(c,[[-9,0,-41],[114,0,-41],[114,0,41],[-9,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.25);}
 const g=polyP(c,[[-5,0,-38],[110,0,-38],[110,0,38],[-5,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]));s.tone(K,st,.12);
 // boards: along the far touchline and behind both goals (generic navy boards with pale panels)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pn,.4);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const[x,z] of [[0,-34],[0,34],[105,-34],[105,34]] as Pt[]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0,o.ballY);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by=1){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=by)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,.95),.95,z],.025,mesh,.7);seg3(c,[back(z,.95),.95,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_O:InkFill[]=[[Y,.42],[R,.26],[K,.05]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** Portugal: red shirts, red shorts, red socks (confirmed); yellow numbers and navy trim inferred */
const POR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,trim:K,skin:SKIN_O,hair:K,hairStyle:'short',line:K,numberInk:Y,seed:3,...o});
/** Germany: white shirts, black shorts, white socks (confirmed; black printed navy); navy numbers and trim inferred */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:[Y,.6],hairStyle:'short',line:K,numberInk:K,seed:5,...o});
const FIGO_STYLE=POR({number:7,hair:K,skin:SKIN_O,build:{height:1.8,bulk:1.02},seed:7});
const KAHN:AthleteStyle={shirt:[K,.45],shorts:K,socks:[K,.45],boots:K,skin:SKIN_L,hair:[Y,.85],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:12,numberInk:'paper',build:{height:1.88,bulk:1.08},seed:12};
const RICARDO:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:K,skin:SKIN_O,hair:K,hairStyle:'bald',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,seed:41};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Figo receives the ball)
type Role='figo'|'por'|'ger'|'gk';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
/** face: a defender faces the ball (and backpedals) until τ face */
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean;face?:number};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The confirmed beats (Figo's cross, Gomes's header from close range, Kahn in
 * goal) are kept; every exact spot, the build-up and the feint are inferred. */
const ACTORS:Actor[]=[
 {name:'Figo',role:'figo',style:FIGO_STYLE,key:true,keys:[[-7.6,72.5,30.5],[-4,75,29.8],[-1.5,76.6,28.6],[0,78,27.6],[.6,80.6,27],[1.1,83,26.5],[1.55,84.2,26.1],[1.95,86.6,27.1],[2.4,90.6,27.3],[2.85,94.6,26.5],[3.2,97.2,25.6],[3.4,98.2,25.2],[3.8,99.3,24.9],[4.6,100.2,24.2],[5.6,100.6,22.6],[7.5,100.3,21.2]]},
 {name:'Gomes',role:'por',style:POR({number:21,seed:21,hair:K,build:{height:1.81}}),key:true,keys:[[-7.6,80,2.5],[-3,85,3.4],[0,89,3.8],[1.5,92,3.6],[2.5,95.3,3.2],[3.4,97.7,2.6],[3.95,99.4,2.1],[4.3,99.8,2],[5,100.2,2.4],[6,99.6,6],[7.5,99.8,12]]},
 {name:'Deco',role:'por',style:POR({number:20,seed:20,skin:SKIN_M,hairStyle:'bald'}),keys:[[-7.6,63,6],[-5.4,65,7.5],[-4.2,66.4,8.4],[-2.4,69,11],[-1.2,70.4,12.4],[0,72,13],[4.3,85,8],[7.5,90,10]]},
 {name:'Maniche',role:'por',style:POR({number:18,seed:18}),keys:[[-7.6,58.5,-4.5],[-5.4,60.6,-3.4],[-4,62,-3],[0,66,-2],[4.3,83,-4],[7.5,88,-2]]},
 {name:'Ronaldo',role:'por',style:POR({number:17,seed:17,hairStyle:'short',build:{height:1.86}}),key:true,keys:[[-7.6,82,-12],[0,90,-10],[3.4,96,-7.4],[4.3,98,-6.4],[7.5,99,-2]]},
 {name:'Simão',role:'por',style:POR({number:11,seed:11,build:{height:1.7}}),keys:[[-7.6,78,-22],[0,85,-18],[4.3,91.5,-14],[7.5,94,-8]]},
 {name:'Petit',role:'por',style:POR({number:8,seed:8,hairStyle:'bald'}),keys:[[-7.6,53,1],[0,60,2],[7.5,66,3]]},
 {name:'Paulo Ferreira',role:'por',style:POR({number:2,seed:2}),keys:[[-7.6,63,28],[0,69,30.5],[4.3,79,31],[7.5,84,29]]},
 {name:'Ricardo',role:'gk',style:RICARDO,keys:[[-7.6,20,0],[7.5,22,0]]},
 {name:'Jansen',role:'ger',style:GER({number:2,seed:32,build:{height:1.91}}),key:true,face:1.75,moves:[{kind:'lunge',at:1.55,dur:.8,side:'r'}],keys:[[-7.6,90,22.5],[-3,89.4,23],[0,88.4,23.8],[.8,87.8,24.6],[1.3,87.5,25.2],[1.75,87.6,25],[2.2,89,25.6],[2.8,92.2,25.4],[3.4,94.8,24.6],[4.5,97.2,22.4],[7.5,98,19]]},
 {name:'Metzelder',role:'ger',style:GER({number:21,seed:33,build:{height:1.93}}),key:true,face:4.8,keys:[[-7.6,93,5],[0,95.2,4],[2.5,97.2,3.4],[3.6,98.6,3.2],[4.3,99.3,3.4],[7.5,100,4]]},
 {name:'Nowotny',role:'ger',style:GER({number:6,seed:34,hair:K,build:{height:1.87}}),key:true,face:4.8,keys:[[-7.6,94,-4],[0,96.2,-3],[3,98.4,-2.2],[4.3,99.4,-1.4],[7.5,100,-1]]},
 {name:'Lahm',role:'ger',style:GER({number:16,seed:35,hair:K,build:{height:1.7}}),face:4.8,keys:[[-7.6,91,-16],[0,94.5,-12.5],[3.4,97,-9],[4.3,97.6,-8],[7.5,98,-7]]},
 {name:'Kehl',role:'ger',style:GER({number:5,seed:36,hair:K}),face:4.8,keys:[[-7.6,79,3],[0,84,7],[3,89.5,10.5],[4.3,91.5,9.6],[7.5,93,9]]},
 {name:'Frings',role:'ger',style:GER({number:8,seed:37}),face:4.8,keys:[[-7.6,75,-6],[0,80,-2],[4.3,89.5,-1],[7.5,91,-1]]},
 {name:'Hitzlsperger',role:'ger',style:GER({number:15,seed:38,hair:K}),keys:[[-7.6,70,14],[-2,74,19],[0,76,21.5],[2,81.5,24.5],[4.3,88,23.5],[7.5,90,22]]},
 {name:'Schneider',role:'ger',style:GER({number:19,seed:39,hairStyle:'balding'}),keys:[[-7.6,66,-24],[0,72,-20],[7.5,80,-14]]},
 {name:'Kahn',role:'gk',style:KAHN,key:true,moves:[{kind:'dive',at:4.42,dur:.9,side:'r'}],keys:[[-7.6,102,.6],[0,102.6,1.8],[3,103.3,2.8],[3.6,103.4,2.6],[4.05,103.5,1.7],[7.5,103.5,1.7]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const FIGO=IX('Figo'),GOMES=IX('Gomes'),DECO=IX('Deco'),MANI=IX('Maniche'),JANSEN=IX('Jansen'),KAHN_I=IX('Kahn');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7.6,T1=7.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: Maniche → Deco → Figo, the feint, THE CROSS, the header, the net
const P1=-5.4,R1=-4.2,P2=-1.2,RECEIVE=0,FEINT=1.2,CROSS=3.4,HEAD=4.32,IN_NET=HEAD+.3;
/** Gomes's header: the ball meets his forehead at contact (solved once from the athlete skeleton, so ball and head agree) */
const HEAD_D=.9,HEAD_YAW=yawOf(-1,1.6);
const HEAD_PT:V3=(()=>{const[x,z]=posOf(GOMES,HEAD),sk=solve(header(.52),{height:1.81},{x,z,yaw:HEAD_YAW}),h=sk.head,f=sk.face;return[h[0]+(f[0]-h[0])*1.4,h[1]+.04,h[2]+(f[2]-h[2])*1.4];})();
const NET:V3=[105.35,.95,-2.1],REST:V3=[106.3,.11,-1.8];
const CROSS_PT=footSpot(FIGO,CROSS,'r',.42,.16);
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
/** dribble: the ball knocked on with the RIGHT foot every half second, the runner catching it up */
const TOUCH=[RECEIVE+.05,.55,1.02,1.98,2.45,2.92];
function carried(k:number,tau:number,ts:number[]):V3{let i=0;while(i+1<ts.length&&tau>=ts[i+1])i++;const u=clamp((tau-ts[i])/((ts[i+1]??ts[i]+.5)-ts[i])),ahead=.35+.75*Math.sin(Math.PI*Math.pow(u,.8));const[x,z]=footSpot(k,tau,'r',ahead,.12);return[x,.11,z];}
function passPath(a:V3,b:V3,u:number):V3{const q=roll(a,b,u,.25);return[q[0],.11+.06*Math.sin(Math.PI*u),q[2]];}
/** the cross: struck with the inside of the right boot, rising to ~4 m and curling away from the keeper (the bend pulls it back toward −X) */
function crossPath(u:number):V3{const A:V3=[CROSS_PT[0],.11,CROSS_PT[1]],e=u*(1+.22-.22*u),b=lerp3(A,HEAD_PT,e),sw=Math.sin(Math.PI*e);
 return[b[0]-1.5*sw,lerp(.11,HEAD_PT[1],e)+3.2*sw*(1-.25*e),b[2]];}
function ballAt(tau:number):V3{
 if(tau<P1)return carried(MANI,tau,[T0,T0+.5,T0+1,T0+1.5,P1]);
 if(tau<R1){const a=footSpot(MANI,P1,'r',.4),b=footSpot(DECO,R1,'r',.45);return passPath([a[0],.11,a[1]],[b[0],.11,b[1]],(tau-P1)/(R1-P1));}
 if(tau<P2)return carried(DECO,tau,[R1,R1+.6,R1+1.2,R1+1.8,R1+2.4,P2]);
 if(tau<RECEIVE){const a=footSpot(DECO,P2,'r',.4),b=footSpot(FIGO,RECEIVE,'r',.4);return passPath([a[0],.11,a[1]],[b[0],.11,b[1]],(tau-P2)/(RECEIVE-P2));}
 if(tau<CROSS-.28)return carried(FIGO,tau,TOUCH);
 if(tau<CROSS){const a=carried(FIGO,CROSS-.28,TOUCH);return lerp3(a,[CROSS_PT[0],.11,CROSS_PT[1]],sm(CROSS-.28,CROSS,tau,easeOut));}
 if(tau<HEAD)return crossPath((tau-CROSS)/(HEAD-CROSS));
 if(tau<IN_NET){const u=(tau-HEAD)/(IN_NET-HEAD);return lerp3(HEAD_PT,NET,u);}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);const b=lerp3(NET,REST,e);return[b[0],lerp(NET[1],.11,Math.min(1,u*1.6)),b[2]];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** the stepover (inferred): the LEFT leg circles over the ball and the body dips inside, selling a cut in; then he bursts outside.
 * Authored as a right-leg stepover and mirrored. */
function stepover(u:number):Pose{return mirrorPose(keyPoses(u,[
 [0,posed({lHipF:12,lKnee:30,rHipF:14,rKnee:32,lean:16,pitch:5,neckP:28,lShA:26,rShA:24,lElb:44,rElb:44})],
 [.35,posed({lKnee:40,lHipF:12,rHipF:40,rHipA:-12,rKnee:74,rAnk:22,rHipR:-10,bend:-8,roll:-4,lean:18,pitch:5,lShA:40,rShA:30,lElb:40,rElb:44,neckP:32})],
 [.62,posed({lKnee:46,lHipF:10,rHipF:30,rHipA:36,rKnee:54,rHipR:28,bend:18,roll:9,lean:15,lShA:30,rShA:66,lElb:50,rElb:30,neckP:26,twist:12,squash:-.04})],
 [1,posed({lKnee:44,lHipF:8,rHipF:8,rHipA:26,rKnee:38,bend:10,roll:6,lean:14,lShA:30,rShA:52,lElb:50,rElb:36,neckP:22,squash:-.05})],
]));}
/** Figo lifts his head before the cross: chin up, eyes across to the box (to his left) */
const LOOK_UP:Partial<Pose>={neckP:-12,neckY:34,twist:6,lean:6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 const toBall=yawOf(b[0]-x,b[2]-z);
 let yaw=sp>.5?yawOf(v[0],v[1]):toBall;
 if(a.face!==undefined&&tau<a.face)yaw=toBall;
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.45});}
 if(k===KAHN_I)yaw=tau<4.42-.5?toBall:Math.PI;
 if(k===FIGO){
  if(tau<RECEIVE-.15&&sp<2)yaw=toBall;
  for(const t of TOUCH)p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(t-.16,t+.1,tau));
  const fu=(tau-FEINT)/.6;if(fu>0&&fu<1.35)p=blendPose(p,stepover(Math.min(1,fu)),inWin(fu));
  p=over(p,LOOK_UP,bump(2.3,CROSS-.08,tau)*.95);
  const D=.85,u=(tau-(CROSS-.52*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),inWin(u));yaw=lerpA(yaw,yawOf(HEAD_PT[0]-x,HEAD_PT[2]-z)+.35,.75*inWin(u));}
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.5,IN_NET+1,tau));}
 if(k===GOMES){const u=(tau-(HEAD-.52*HEAD_D))/HEAD_D;if(u>0&&u<1.3){p=blendPose(p,header(Math.min(1,u)),inWin(u*1.05));yaw=lerpA(yaw,HEAD_YAW,inWin(u));}
  if(tau>IN_NET+.45)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.45,IN_NET+1,tau));}
 if(a.role==='por'&&k!==GOMES&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='ger'&&tau>IN_NET+.8)p=over(p,{lean:36,neckP:36,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.7);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 2006 +Teamgeist (paper, curved navy propellers, gold trim)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 if(r>5){const pan=new Path2D(),gold=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,c=Math.cos(a),sn=Math.sin(a),cx=x+c*r*.5,cy=y+sn*r*.5,w=r*.2;
   const q:Pt[]=[[cx-sn*w*1.8,cy+c*w*1.8],[cx+c*w,cy+sn*w],[cx+sn*w*1.8,cy-c*w*1.8],[cx-c*w*.6,cy-sn*w*.6]];pan.addPath(polyPath(q,true));gold.addPath(ribbon([[cx-sn*w*2,cy+c*w*2],[cx+c*w*1.4,cy+sn*w*1.4],[cx+sn*w*2,cy-c*w*2]],Math.max(1,r*.07),{seed:i,taper:.3}));}
  s.fill(K,pan,.9);s.fill(Y,gold,.9);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** the captain's armband (confirmed he wore it; colour inferred): a yellow band round Figo's left upper arm on the big figure */
function armband(s:Sheet,r:DrawResult){const j=r.joints,a=j.lSh,e=j.lEl,L=Math.hypot(e[0]-a[0],e[1]-a[1]);if(L<14)return;
 const m:Pt=[lerp(a[0],e[0],.42),lerp(a[1],e[1],.42)],dx=(e[0]-a[0])/L,dy=(e[1]-a[1])/L,w=L*.2,hw=L*.07;
 const p=polyPath([[m[0]-dy*w-dx*hw,m[1]+dx*w-dy*hw],[m[0]+dy*w-dx*hw,m[1]-dx*w-dy*hw],[m[0]+dy*w+dx*hw,m[1]-dx*w+dy*hw],[m[0]-dy*w+dx*hw,m[1]+dx*w+dy*hw]],true);s.knockout(p);s.fill(Y,p,.95);}
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8*Math.max(.35,1-b[1]*.15),br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{});
  if(e.k===FIGO&&px>=110&&!passing)armband(s,r);
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the cross's flight as a dashed yellow arc in the air, drawn in with w (plus its shadow line on the grass) */
function crossArc(s:Sheet,c:Cam,w:number){if(w<=.02)return;const air:Pt[]=[],gr:[number,number][]=[];const n=Math.max(3,Math.round(18*w));
 for(let i=0;i<=n;i++){const q=crossPath(i/18),p=pr(c,q);if(p)air.push(p);gr.push([q[0],q[2]]);}
 if(air.length<3)return;const d=toCam(c,HEAD_PT)[2],wd=Math.max(5,c.F*.11/d);
 groundArrow(s,c,gr,1,K,77);
 s.knockout(ribbon(air,wd*1.8,{seed:81,taper:.1,wobble:.6}),.75);laneArrow(s,Y,air[air.length-2],air[air.length-1],wd,{seed:82,head:wd*3});s.fill(Y,ribbon(air,wd,{seed:83,taper:.1,wobble:.6}),.95);}
/** a run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** "look up": a dashed yellow sight line from his eyes to a point */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(6,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.6);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed:91,taper:.2,wobble:.6}),.7);laneArrow(s,Y,h,end,u,{dashed:true,seed:92,head:u*3});}
const HEAD_GROUND:[number,number]=[HEAD_PT[0],HEAD_PT[2]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time, keyed to the cue words (the build-up plays in real time, Figo's run a touch slower) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'Nuno Gomes');return key(t,mono([[0,-7.5],[CUEW(0,'Figo on the wing'),RECEIVE],[CUEW(0,'he looks up'),2.35],[CUEW(0,'crosses'),CROSS],[G,HEAD-.3],[G+.9,IN_NET+.3],[S+1,IN_NET+.3+(S+1-G-.9)*.85]]),linear);};
const CAM1:V3=[76,19,70];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'Nuno Gomes'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // "Luís Figo comes on … his last game": the camera leans toward Figo on the wing, then rides the ball; at the cross it frames the box
 const fg=smooth(FIGO,tau),look7=sm(CUEW(0,'Luís Figo')-.3,CUEW(0,'Luís Figo')+.8,t,easeInOutSine)*(1-sm(CUEW(0,'Two minutes')-.2,CUEW(0,'Figo on the wing')-.3,t,easeInOutSine));
 const box=sm(CROSS-.2,HEAD-.2,tau,easeInOutSine),cel=smooth(GOMES,tau),toC=sm(G+.9,G+2,t,easeInOutSine);
 let T:V3=lerp3([bt[0]+2,1.6,bt[2]*.8],[fg[0]-2,1.6,fg[1]-4],look7*.75);
 T=lerp3(T,[99,1.4,8],box);T=lerp3(T,[cel[0]-1,1.2,cel[1]+4],toC);
 const F=key(t,[[0,3600],[CUEW(0,'Luís Figo'),4000],[CUEW(0,'his last game'),5600],[CUEW(0,'Two minutes'),4300],[CUEW(0,'Figo on the wing'),4700],[CUEW(0,'crosses'),4500],[G,4900],[G+1.4,6200],[S,6600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Nuno Gomes'),lf=CUEW(0,'Luís Figo'),tm=CUEW(0,'Two minutes');
  stadium(s,c,v,t,{roar:sm(G+.6,G+1.1,t),flash:sm(G+.7,G+.95,t)});
  const b=ballAt(tau);ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],ballY:b[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:FIGO,under:()=>{
   // "Luís Figo comes on": a yellow ring under number 7 (a broadcast highlight)
   const[fx,fz]=posOf(FIGO,tau);ring(s,c,fx,fz,1.3,sm(lf-.1,lf+.4,t,easeOutBack)*(1-sm(tm-.4,tm,t)),Y,44);}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GOMES,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Figo's left shoulder: he lifts his head, finds Gomes, curls it in
const tau2=(t:number)=>key(t,mono([[0,1.75],[CUEW(1,'Before he'),2.1],[CUEW(1,'Figo lifts'),2.5],[CUEW(1,'He sees'),2.85],[CUEW(1,'Nuno Gomes is'),3.1],[CUEW(1,'and curls'),CROSS-.12],[SECS(1),CROSS+.62]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(FIGO,Math.min(tau,CROSS+.2)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(1,'He sees')-.3,CUEW(1,'Nuno Gomes is')+.6,t,easeInOutSine);
 const C:V3=[m[0]-5.6+2*open,2.6+1.4*wide,m[1]+2.4+1.2*wide],T:V3=[m[0]+6+1.5*wide,.8,m[1]-2.2-8*wide];
 return look(C,T,2000-700*wide-150*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),lh=CUEW(1,'Figo lifts'),hs=CUEW(1,'He sees'),ng=CUEW(1,'Nuno Gomes is'),ac=CUEW(1,'and curls'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(E-.8,E-.4,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:FIGO,under:()=>{
   // "Nuno Gomes is running": his run (blue) and the spot he is running to (yellow ring)
   groundArrow(s,c,runPts(GOMES,2.2,HEAD),sm(ng-.2,ng+.7,t,easeOut)*fade,B,63);
   ring(s,c,HEAD_GROUND[0],HEAD_GROUND[1],1.4,sm(ng+.2,ng+.6,t,easeOutBack)*fade,Y,45);},
   after:({joints})=>{
    // "Figo lifts his head": the dashed sight line from his eyes to Gomes
    const r=joints.get(FIGO),[gx,gz]=posOf(GOMES,tau);sightLine(s,r,pr(c,[gx,1.6,gz]),sm(lh+.2,hs+.3,t,easeOut)*(1-sm(ac,ac+.4,t)));
    // "and curls it there": the ball's curling flight to the ring
    crossArc(s,c,sm(ac-.1,E-.9,t,easeOut)*fade);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind Germany's goal: the header, the net, then Figo
const tau3=(t:number)=>{const g=CUEW(2,'Gomes heads'),cr=CUEW(2,'close range');return key(t,mono([[0,CROSS+.05],[g,HEAD-.12],[cr,IN_NET+.25],[CUEW(2,"Figo's last"),IN_NET+.9],[SECS(2),IN_NET+2.4]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),turn=sm(CUEW(2,"Figo's last")-.5,CUEW(2,'for Portugal')+.2,t,easeInOutSine),fg=smooth(FIGO,tau);
 const C0:V3=[113,5.2,-8],T0:V3=[lerp(97,99.6,sm(CROSS,HEAD,tau,easeInOutSine)),1.5,lerp(12,2.5,sm(CROSS,HEAD,tau,easeInOutSine))];
 const C1:V3=[109,3.4,10],T1:V3=[fg[0]-.5,1.1,fg[1]];
 return look(lerp3(C0,C1,turn),lerp3(T0,T1,turn),lerp(2300+600*sm(CROSS+.3,HEAD,tau),3600,turn));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'Gomes heads'),E=SECS(2),turn=sm(CUEW(2,"Figo's last")-.5,CUEW(2,'for Portugal')+.2,t,easeInOutSine);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(IN_NET,IN_NET+.3,tau)*(1-sm(E-1.2,E-.6,t))});
  const b=ballAt(tau);ground(s,c,{goalLater:turn<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:tau<IN_NET+.6?GOMES:FIGO,under:()=>{
   ring(s,c,HEAD_GROUND[0],HEAD_GROUND[1],1.3,sm(.1,.6,t,easeOutBack)*(1-sm(g+.4,g+.8,t)),Y,47);},
   after:()=>{const age=t-g-.1;if(age>-.15&&age<.6){const q=pr(c,HEAD_PT);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,HEAD_PT)*.55,{n:8,seed:94,g:easeOutBack(clamp((age+.15)/.18))*(1-clamp((age-.35)/.25)),width:8});}}});
  if(turn<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2],b[1]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(FIGO,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: over Figo's shoulder — beat your defender, look up, then cross
const tau4=(t:number)=>key(t,mono([[0,.45],[CUEW(3,'beat'),FEINT-.05],[CUEW(3,'then look up'),2.35],[CUEW(3,'before you cross'),2.75],[CUEW(3,'so you know'),CROSS-.08],[CUEW(3,'your striker'),CROSS+.3],[SECS(3),HEAD-.02]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(FIGO,Math.min(tau,CROSS+.2)),push=sm(0,1.2,t,easeInOutSine),box=sm(CUEW(3,'then look up')-.4,CUEW(3,'so you know')+.3,t,easeInOutSine);
 const C:V3=[m[0]-6-1.5*(1-push)-1*box,2.4+1.2*box,m[1]+2.6+1.4*box],T0:V3=[m[0]+8,.7,m[1]+.3],T1:V3=[m[0]+6,.7,m[1]-6.5];
 return look(C,lerp3(T0,T1,box),2100+200*push-600*box);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),bd=CUEW(3,'beat'),lu=CUEW(3,'then look up'),bc=CUEW(3,'before you cross'),sk=CUEW(3,'so you know'),ys=CUEW(3,'your striker'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(E-.9,E-.5,t);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:FIGO,under:()=>{
   // "beat your defender": the feint inside, then his run down the OUTSIDE past Jansen (blue); Jansen's lunge the wrong way (red ring)
   const[jx,jz]=posOf(JANSEN,1.6);ring(s,c,jx,jz-.6,1,sm(bd+.3,bd+.7,t,easeOutBack)*(1-sm(lu,lu+.4,t)),R,46);
   groundArrow(s,c,runPts(FIGO,1.45,3.1),sm(bd+.2,lu,t,easeOut)*(1-sm(sk,sk+.4,t)),B,67);
   // "your striker is running": Gomes's run and his spot
   groundArrow(s,c,runPts(GOMES,2.4,HEAD),sm(ys-.2,ys+.6,t,easeOut)*fade,B,68);
   ring(s,c,HEAD_GROUND[0],HEAD_GROUND[1],1.4,sm(bc-.1,bc+.3,t,easeOutBack)*fade,Y,48);},
   after:({joints})=>{
    // "then look up": the sight line from his eyes to the striker; "before you cross": the ball's lane
    const r=joints.get(FIGO),[gx,gz]=posOf(GOMES,tau);sightLine(s,r,pr(c,[gx,1.6,gz]),sm(lu,lu+.6,t,easeOut)*(1-sm(sk+.4,sk+.8,t)));
    crossArc(s,c,sm(sk-.1,sk+1.1,t,easeOut)*fade);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'figo-signature',format:'11v11',title:"Figo's Last Cross",theme:'Beat your defender, then look up before you cross the ball',
 ageNote:'World Cup match for third place, Germany 3–1 Portugal, Stuttgart, 8 July 2006 (the 88th minute, Figo’s last game for Portugal). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
