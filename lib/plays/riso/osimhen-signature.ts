/** Signature film: Victor Osimhen, "the leaping header" (lib/town/iconicPlays.json, kind "signature", template header_goal, central, in the
 * box; lesson "Jump off one foot to go higher, and head the ball down toward goal."). The signature is shown through ONE real, documented
 * goal: Napoli 5–1 Juventus, Serie A, Friday 13 January 2023, Stadio Diego Armando Maradona, Naples — Osimhen's header for 4–1 (65').
 * WHY THIS MOMENT: of the candidate goals, it is the one the written record confirms as a header from a cross. The Udinese title-clincher
 * (4 May 2023, 52') was a rebound "smashed in" after Silvestri saved from Kvaratskhelia (BBC) — not a header. Against Juventus Osimhen scored
 * TWO headers (14' a header from the right of the six-yard box after Szczęsny parried Kvaratskhelia's shot; 65' a header from Kvaratskhelia's
 * cross); the 65' goal is the pure leaping header from a cross, the signature on his card, in the biggest win of Napoli's title season.
 * A riso RisoStory (chapters mode) played by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer; a 1:1 reconstruction
 * of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - ESPN commentary, Napoli 5-1 Juventus (Jan 13, 2023), gameId 644794 [espn-644794-commentary.html]: kick-off 2023-01-13 19:45Z (20:45
 *    local, a night match); 65' "Goal! Napoli 4, Juventus 1. Victor Osimhen (Napoli) header from very close range to the centre of the
 *    goal. Assisted by Khvicha Kvaratskhelia with a cross." (event type "Goal - Header"); 14' "Victor Osimhen (Napoli) header from the right
 *    side of the six yard box to the bottom right corner"; Osimhen No. 9, Kvaratskhelia No. 77; Juventus squad incl. Szczęsny, Danilo,
 *    Bremer, Alex Sandro; Raspadori replaced Osimhen later. https://www.espn.com/soccer/commentary/_/gameId/644794
 *  - ESPN (AP) report, same match [espn-644794-report.html]: "Kvaratskhelia and Osimhen combined again in the 65th with the latter heading in
 *    a cross from the Georgia forward"; 14' "Szczęsny brilliantly parried an acrobatic shot from Kvaratskhelia but Osimhen headed in the
 *    rebound"; Rrahmani 3–1 after 56'; Elmas 5–1 in the 72nd. https://www.espn.com/soccer/report/_/gameId/644794
 *  - Wikipedia, "Victor Osimhen" (raw) [wiki-victor-osimhen.txt]: "On 13 January 2023, Osimhen scored two and assisted another as Napoli beat
 *    Juventus 5–1"; height 1.86 m; right-footed; "strong aerial ability"; a fractured skull and eye socket (Nov 2021) — the cited Sportsbrief
 *    headline: "Horror Face Injury That Left Him Wearing Mask". https://en.wikipedia.org/wiki/Victor_Osimhen
 *  - BBC Sport, "Udinese 1-1 Napoli" (4 May 2023) [bbc-udinese-napoli-2023.txt]: the title goal was a 52nd-minute finish into the corner after
 *    Kvaratskhelia's shot was saved — used only to rule that goal out as a header.
 *  - Wikipedia, "Khvicha Kvaratskhelia" (cached): 1.83 m; a left winger who cuts in onto his right foot.
 * CONFIRMED: date, venue, night kick-off, 5–1; the 65th-minute goal made it 4–1; a HEADER from VERY CLOSE RANGE into the CENTRE of the goal
 *  from Kvaratskhelia's CROSS; it was Osimhen's second header of the night; numbers 9 and 77; Osimhen 1.86 m, right-footed, strong in the air,
 *  wore a protective face mask after the 2021 injury; Szczęsny in Juventus's goal.
 * INFERRED / ILLUSTRATIVE (never named in the narration): the cross coming from the LEFT (Kvaratskhelia's usual wing; the side is not in
 *  the sources) and struck with his RIGHT foot as an in-swinger; his short dribble before it; every position, run and timing in metres and
 *  seconds (the cross ≈ 22 m in 1.1 s, contact ≈ 6 m out, the header ≈ .3 s to the line); the ONE-FOOT take-off (left foot plant, right knee
 *  drive — the card's lesson; which foot he jumped off is not in the sources); the defender arriving late behind him (unnamed, no number) and the other
 *  players; Szczęsny shading his near post and his late low dive; KITS: Napoli in their sky-blue home shirts, white shorts, sky-blue socks
 *  (as the approved Kvaratskhelia film draws them), Juventus in black-and-white stripes with white shorts and socks (the usual no-clash
 *  away choice at Napoli; not verified for the day), Szczęsny in red; Osimhen's bleached hair and the mask drawn as a dark band; the stadium
 *  drawn as the Kvaratskhelia film's oval two-tier bowl round a blue running track under a roof ring; which end Napoli attacked on screen;
 *  the crowd's colours; Osimhen's celebration run; every camera placement and lens. No referee is drawn.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl at night → the box → close on
 * Kvaratskhelia on the near side below us → the cross → the leap → Osimhen wheels away); ch2 = the slow-motion replay from LOW ON THE FAR
 * TOUCHLINE, side-on to the run: the plant of ONE foot, the knee drive, the flight up to the ball (a yellow replay trail); ch3 = the replay
 * from BEHIND THE GOAL: the head snaps forward and the ball comes down at the camera into the middle of the net; ch4 = the lesson from low
 * on the near side: the one lit footprint, the knee-drive arrow, a ring on the ball with his head above it, the down arrow into a lit low
 * target in the goal. Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from
 * the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the cross, the leap and the dive). Handedness: the world is right-handed (x toward Juventus's goal, y up,
 * +z = Napoli's right), athlete.ts's own convention, so Kvaratskhelia's strike({foot:'r'}) is his RIGHT foot and the left wing is −z.
 * Osimhen's leap is authored here (osiHeader: a running ONE-FOOT take-off — plant the left, drive the right knee — an arched cock at the
 * peak and a forward neck snap that heads the ball DOWN). Szczęsny faces −x, so his dive to +z is to his LEFT (keeperDive side 'l').
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage
 * is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,dribble,keeperSet,keeperDive,celebrate,header,posed,keyPoses,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (each starts with a plain word — Kokoro
 * splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Naples, 2023',text:'Naples, 2023. Napoli against Juventus. Kvaratskhelia sends in a cross. Victor Osimhen leaps high... Goal! His second header of the night!',tail:2.4,
  cues:['Naples','Juventus','Kvaratskhelia','cross','Victor Osimhen','leaps high','Goal','second header']},
 {label:'Watch it again',text:'Watch again, slowly. Osimhen runs at the ball. He plants one foot, swings the other knee up, and flies up to meet it.',tail:1.6,
  cues:['Watch again','runs at','plants one foot','swings','flies up']},
 {label:'Head it down',text:'From behind the goal, watch his head snap forward. He heads it down, hard, into the middle of the net. Four–one Napoli!',tail:2.2,
  cues:['From behind','head snap','heads it down','middle','Napoli']},
 {label:'Jump off one foot',text:'Jump off one foot to go higher. Drive your knee up, get above the ball, and nod it down toward goal!',tail:2,
  cues:['Jump off one foot','Drive your knee','get above','nod it down']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/osimhen-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/osimhen-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/osimhen-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('osimhen: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('osimhen: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});
const inView=(v:{hx:number;hy:number},p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Juventus's goal line is x = 0 (Napoli attack +x), goal centre z = 0, +z = Napoli's right; touchlines z = ±34, halfway x = −52.5. */
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
/** a projected quad only when it is comfortably in front of the camera (stand parts near the camera are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Stadio Maradona at night: an oval two-tier bowl round a running track, roof ring
const CX=-52.5,NS=64;
/** a point on the bowl: angle th round the pitch centre, d metres out from the track's outer edge (a squared-off oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(70+d)*Math.sign(c)*Math.pow(Math.abs(c),.6),y,(48+d)*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
const LOW=(b:number):[number,number]=>[1.5+22*b,1.6+11.5*b],UP=(b:number):[number,number]=>[26+20*b,17.5+16*b];
type Bowl={low:V3[][];band:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number;away:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],band:[],up:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.band.push([rim(a,24,13.1),rim(b,24,13.1),rim(b,26,17.5),rim(a,26,17.5)]);
  o.roof.push([rim(a,29,39),rim(b,29,39),rim(b,50,36.5),rim(a,50,36.5)]);
  o.fascia.push([rim(a,29,37.4),rim(b,29,37.4),rim(b,29,39.4),rim(a,29,39.4)]);
  if(i%2===0)o.lamps.push(rim(a+.5/NS*TAU,28.8,38.2));
  // a small away section in one corner of the upper tier (Juventus colours; inferred)
  const away=i>=40&&i<44;
  for(const [f,rows,up] of [[LOW,9,false],[UP,7,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),11);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away:away&&up});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = phone flashes), floodlights */
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a January night in Naples: deep navy sky
 s.field(K,.8,.5);s.tone(B,polyPath([[-1e4,-1e4],[1e4,-1e4],[1e4,1e4],[-1e4,1e4]],true),.22);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.band[i],band);add(BOWL.roof[i],roof);add(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(B,low,.5);s.tone(K,low,.16);
 s.knockout(up);s.tone(B,up,.46);s.tone(K,up,.3);
 // the crowd: Napoli sky blue and white, navy, yellow flags, red flares; the away corner in black and white
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0&&!q.away?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.6?0:2):q.h<.38?0:q.h<.72?1:q.h<.87?2:q.h<.95?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.75);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.9);s.knockout(inks[4],.7);s.fill(R,inks[4],.95);
 s.knockout(band);s.fill(K,band,.75);
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.35);
 s.knockout(fas);s.fill(K,fas,.5);
 // floodlights along the roof edge, with yellow haloes
 const lp=new Path2D(),halo=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g,200))continue;const z=clamp(c.F*.9/d[2],3,16),r=clamp(c.F*4.5/d[2],8,120);
  lp.addPath(polyPath(blob(g[0],g[1],z,z*.5,7,{amp:.05,n:10}),true));halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}
 s.knockout(halo,.2);s.tone(Y,halo,.35);s.knockout(lp);s.fill(Y,lp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=7+12*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track (blue oval), floodlit grass with mowing stripes, boards, paper lines, the far goal frame */
const TRACK:V3[]=Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0));
function ground(s:Sheet,c:Cam){
 const tr=polyP(c,TRACK);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(B,p,.62);s.tone(K,p,.3);}
 const g=polyP(c,[[-112,0,-39],[7,0,-39],[7,0,39],[-112,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-37],[-(k+1)*5.25,0,-37],[-(k+1)*5.25,0,37],[-k*5.25,0,37]]));s.tone(K,st,.12);
 // advertising boards: navy with red and paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([4.5,0,-37],[4.5,0,37]);board([-109,0,37.5],[4.5,0,37.5]);board([-109,0,-37.5],[4.5,0,-37.5]);
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%2?pn:pr2,polyP(c,[[4.4,.25,z],[4.4,.25,z+3.4],[4.4,.65,z+3.4],[4.4,.65,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(k%2?pn:pr2,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.65,zz],[x,.65,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(pr2);s.fill(R,pr2,.8);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([0,0,z0],[0,0,z1]);L([-105,0,z0],[-105,0,z1]);L([CX,0,z0],[CX,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);circ(CX,0,.12,0,TAU,6);
 for(const [gx,d] of [[0,-1],[-105,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 // the far goal: just the frame
 const fg=new Path2D();seg3(c,[-105,0,-3.66],[-105,2.44,-3.66],.12,fg);seg3(c,[-105,0,3.66],[-105,2.44,3.66],.12,fg);seg3(c,[-105,2.44,-3.7],[-105,2.44,3.7],.12,fg);s.knockout(fg);
}
/** Juventus's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (z bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.4,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 const behind=c.eye[0]>0;s.knockout(net,behind?.14:.28);s.tone(K,net,behind?.06:.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,c.eye[0]>0?.5:.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** Napoli: sky-blue home shirts, white shorts, sky-blue socks (inferred for the day; as the Kvaratskhelia film draws them); paper numbers */
const nap=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.62],shorts:'paper',socks:[B,.62],boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[B,.35],numberInk:'paper',build:{height:1.82,bulk:1},...o});
/** Juventus: black-and-white stripes (black printed navy), white shorts and socks (inferred for the day) */
const juve=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[K,.95],shorts:'paper',socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:[K,.9],build:{height:1.86,bulk:1.02},...o});
const B_OSI:Build={height:1.86,bulk:1.04,thighs:1.06},B_KVA:Build={height:1.83,bulk:.9,thighs:.95},B_SZC:Build={height:1.95,bulk:1},B_JM:Build={height:1.87,bulk:1.06,thighs:1.04};
/** Osimhen: No. 9, bleached short hair (inferred), the protective mask drawn separately (drawMask) */
const OSI_ST=nap({number:9,skin:SKIN_D,hair:[Y,.8],build:B_OSI,seed:9});
const KVA_ST=nap({number:77,skin:SKIN_L,hairStyle:'long',hair:[K,.85],build:B_KVA,seed:77});
const JM_ST=juve({skin:SKIN_M,build:B_JM,seed:31});
const SZC_ST:AthleteStyle={shirt:[R,.85],shorts:[R,.85],socks:[R,.85],boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_SZC,seed:1};

// ---------------------------------------------------------------- Osimhen's leap: a running ONE-FOOT take-off (left plant, right knee drive), heading DOWN
/** u ∈ [0,1]: last stride (0) → the LEFT foot plants (.18) → take-off off that one foot, the right knee and both arms driving up (.32) →
 * arched and cocked at the peak, eyes on the ball (.46) → CONTACT: the neck and trunk snap forward so the forehead drives the ball down (.56)
 * → falling (.78) → landing (1). */
const U_PLANT=.18,U_TAKEOFF=.32,U_PEAK=.46;
function osiHeader(u:number):Pose{
 return keyPoses(clamp(u),[
  [0,posed({lHipF:34,lKnee:22,lAnk:-8,rHipF:-24,rKnee:70,rAnk:30,lean:12,pitch:6,lShF:-34,rShF:44,lShA:14,rShA:14,lElb:62,rElb:74,neckP:-10,squash:0})],
  [U_PLANT,posed({lHipF:30,lKnee:36,lAnk:-12,rHipF:-12,rKnee:92,rAnk:34,lean:2,pitch:-4,lShF:-52,rShF:-44,lShA:22,rShA:22,lElb:40,rElb:40,neckP:-22,squash:-.09})],
  [U_TAKEOFF,posed({air:.22,lHipF:-8,lKnee:8,lAnk:56,rHipF:100,rKnee:104,rAnk:24,lean:2,pitch:-2,lShF:128,rShF:108,lShA:40,rShA:46,lElb:48,rElb:58,neckP:-32,squash:.1})],
  [U_PEAK,posed({air:.8,lean:-24,pitch:-8,neckP:-46,lHipF:-16,lKnee:74,lAnk:44,rHipF:76,rKnee:112,rAnk:34,lShA:84,rShA:80,lShF:66,rShF:58,lElb:70,rElb:72,squash:0})],
  [.56,posed({air:.78,lean:28,pitch:10,neckP:52,lHipF:20,lKnee:62,lAnk:40,rHipF:58,rKnee:92,rAnk:36,lShA:56,rShA:56,lShF:-18,rShF:-22,lElb:60,rElb:60,squash:.03})],
  [.78,posed({air:.3,lean:14,pitch:4,neckP:20,lHipF:30,lKnee:30,lAnk:30,rHipF:32,rKnee:40,rAnk:30,lShA:34,rShA:34,lShF:10,rShF:10,lElb:44,rElb:44,squash:0})],
  [1,posed({lHipF:50,rHipF:44,lKnee:64,rKnee:58,lAnk:-12,rAnk:-12,lean:22,pitch:6,lShA:34,rShA:30,lShF:20,rShF:14,lElb:44,rElb:44,neckP:6,squash:-.09})],
 ]);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Kvaratskhelia's cross)
const BALL_R=.11,GRAV=9.81;
/** the cross flies TF s to Osimhen's head; his header reaches the goal line TG */
const TF=1.1,TG=TF+.3;
/** contact on the header clock and the leap's length; the jump starts TJ (so the contact lands exactly on TF) */
const CU=.56,HD=1.1,TJ=TF-CU*HD;
/** where he meets it ("very close range", in front of the goal's centre): his pelvis at contact; he faces the goal, turned a little toward
 * the cross (the ball comes from his left) */
const HP:[number,number]=[-6.1,.45],FACE:[number,number]=nrm2(1,-.35),YAW_H=yawTo(FACE[0],FACE[1]);
/** the ball's centre at contact: level with his forehead and just in front of it (head radius + ball radius along his facing), so the
 * snapping forehead comes over and down through the ball */
const HEAD_PT:V3=(()=>{const sk=solve(osiHeader(CU),B_OSI,{x:HP[0],z:HP[1],yaw:YAW_H});return add3(sk.head,[FACE[0]*(BALL_R+.12),.03,FACE[1]*(BALL_R+.12)]);})();
/** the cross spot: the left edge of the penalty area (inferred side) */
const P0:V3=[-11.8,BALL_R,-20.8];
/** a right-footer's in-swinger from the left: a steady sideways pull TOWARD the goal (+x) on top of gravity */
const SWING:V3=[2,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Kvaratskhelia strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_K=yawTo(DC[0],DC[1]);
/** where his pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_KVA,{x:0,z:0,yaw:YAW_K});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** his dribble in: down the wing and a little inside */
const AP=nrm2(1,.5);
const pk=(d:number):[number,number]=>[PCK[0]+AP[0]*d,PCK[1]+AP[1]*d];
/** the header: down into the middle of the goal, low */
const GOAL_PT:V3=[0,.5,.2],NET_HIT:V3=[1.7,.42,.25],REST:V3=[1.3,BALL_R,.3];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='osi'|'kva'|'gk'|'jm'|'nap'|'juv';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=12,DT=.02;
const fa=(d:number):[number,number]=>[HP[0]+FACE[0]*d,HP[1]+FACE[1]*d];
/** after the goal Osimhen wheels away toward the near corner; team-mates chase him */
const toCorner=(x:number,z:number,k:number):number[][]=>[[TG+.6+k*.2,x,z],[TG+4+k*.3,lerp(x,-8,.55),lerp(z,-26,.55)],[T1,lerp(x,-6,.8),lerp(z,-30,.85)]];
const ACTORS:Actor[]=[
 {name:'Victor Osimhen',role:'osi',hero:true,style:OSI_ST,keys:[[T0,-14.5,3.6],[-4,-13.2,3],[-1.4,-11.6,2.2],[-.2,-9.9,1.4],[TJ-.35,...fa(-2.2)],[TJ+U_PLANT*HD,...fa(-.5)],[TF,...HP],[TF+.55,...fa(.55)],[TF+1.3,-5.6,-2.5],[TF+3.6,-7,-12],[TF+6.4,-7,-22],[T1,-6.5,-27]]},
 {name:'Khvicha Kvaratskhelia',role:'kva',hero:true,style:KVA_ST,keys:[[T0,...pk(-17)],[-4.6,...pk(-11)],[-2.4,...pk(-5.2)],[-.9,...pk(-1.7)],[0,...PCK],[.6,PCK[0]+DC[0]*.9,PCK[1]+DC[1]*.9],[2.8,-10,-15],[5,-8.5,-19],[T1,-7,-25]]},
 {name:'Wojciech Szczęsny',role:'gk',hero:true,style:SZC_ST,keys:[[T0,-1.4,-.6],[-2,-1.2,-1.6],[0,-1.1,-2],[TF-.3,-.95,-1.5],[TF,-.9,-1.35],[T1,-.9,-1.3]]},
 {name:'Juventus defender (beaten in the air)',role:'jm',hero:true,style:JM_ST,keys:[[T0,-12.6,4.6],[-4,-11.8,3.9],[-1.4,-10.4,3.2],[0,-9.2,2.6],[TF-.5,-7.6,1.3],[TF,-7.15,.75],[TF+.6,-7,.8],[T1,-7.4,1.3]]},
 {name:'Juventus near post',role:'juv',style:juve({seed:41,build:{height:1.88}}),keys:[[T0,-4.8,-3.2],[0,-4.5,-2.9],[TF,-4.3,-2.2],[T1,-3.8,-1.8]]},
 {name:'Juventus beaten centre-back',role:'juv',style:juve({skin:SKIN_D,seed:42,build:{height:1.9,bulk:1.08}}),keys:[[T0,-9.5,-5.8],[-1.4,-8.8,-5],[0,-8.1,-4.2],[TF,-7.2,-2.8],[T1,-6.6,-2.2]]},
 {name:'Juventus wing-back',role:'juv',style:juve({seed:43}),keys:[[T0,...pk(-13)],[-4.6,...pk(-8.5)],[-2.4,-15.2,-22.6],[0,-13.6,-21.4],[TF,-13.2,-20.6],[T1,-12.4,-19.6]]},
 {name:'Juventus midfielder',role:'juv',style:juve({seed:44,build:{height:1.8}}),keys:[[T0,-20,-5],[-2,-18.2,-4.2],[0,-16.8,-3.4],[TF,-15.6,-2.6],[T1,-14.8,-2]]},
 {name:'Juventus back post',role:'juv',style:juve({seed:45}),keys:[[T0,-7.4,7.2],[0,-6.6,5.8],[TF,-5.9,4.8],[T1,-5.4,4.2]]},
 {name:'Napoli back-post runner',role:'nap',style:nap({seed:61,skin:SKIN_D}),keys:[[T0,-15,8.8],[-2,-12.4,7.6],[0,-9.6,6.6],[TF,-7.4,5.4],...toCorner(-6.8,4.6,0)]},
 {name:'Napoli edge of the box',role:'nap',style:nap({seed:62}),keys:[[T0,-22,2.2],[-2,-19.6,1.6],[0,-17.8,1.2],[TF,-16.4,.8],...toCorner(-15.8,.4,1)]},
];
const OSI=0,KVA=1,GK=2,JM=3,BACK_J=8,BACK_N=9;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=Math.round((T1-T0)/DT);i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
/** Osimhen's position at contact is exactly HP (the header's solved contact point depends on it) */
const posOf=(k:number,tau:number):[number,number]=>k===OSI&&Math.abs(tau-TF)<1e-9?[HP[0],HP[1]]:[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** at Kvaratskhelia's feet (small right-foot touches ahead of him) → the cross → the header → the net */
const OFF0:[number,number]=[P0[0]-PCK[0],P0[2]-PCK[1]];
function ballAt(tau:number):V3{
 if(tau<=0){const[x,z]=posOf(KVA,tau),w=sm(-.9,-.1,tau),push=.28*Math.max(0,Math.sin(distOf(KVA,tau)/2.2*TAU))*(1-sm(-1.3,-.7,tau));
  return[x+lerp(AP[0]*(.62+push),OFF0[0],w),BALL_R,z+lerp(AP[1]*(.62+push),OFF0[1],w)];}
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?distOf(KVA,tau)*1.3:tau<TF?tau*TAU*5:TF*TAU*5+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // in the box before a cross: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Szczęsny: set on his near post, then a late low dive to his LEFT (+z) — the header is already past him */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.12}),T_DIVE=TF+.1,DIVE_L=1;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'osi':{
   // eyes on Kvaratskhelia, the attack on the ball, the one-foot leap, the header down, the landing, away to celebrate
   if(tau<-.4)yaw=faceYaw(k,tau,ballAt(tau));
   if(tau>TJ-.3&&tau<TJ+HD+.6){const hp=osiHeader((tau-TJ)/HD);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.5,TJ-.05,tau)*(1-sm(TF+.45,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'kva':{
   if(tau<-.6){const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]);pose=dribble(distOf(k,tau)/2.2,{foot:'r',speed:clamp(sp/6)});}
   const w=win(tau,-.6,.85,.25);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yaw,YAW_K,sm(-1.1,-.45,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(-1.6,-1.2,tau)*(1-sm(-.3,0,tau)));
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'jm':{// behind him, a step late: a lower, later jump, then hands on hips
   if(tau<-.3)yaw=faceYaw(k,tau,ballAt(tau));
   if(tau>TF-.55&&tau<TF+1){const hp=header(clamp((tau-(TF-.32))/1.0));hp.air*=.55;pose=blendPose(pose,hp,.7*sm(TF-.55,TF-.3,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));if(tau>=-.3)yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'juv':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'nap':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the cross, the leap, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
/** Osimhen's protective face mask (worn since the 2021 skull and eye-socket fracture): a dark band over the brow, eyes and nose bridge,
 * printed only where it faces the camera and only when the head is big enough to read (≥ 9 css px) */
function drawMask(s:Sheet,c:Cam,sk:Skeleton,ppu:number){
 const h=sk.head,d=nrm3(sub3(sk.face,h)),u0=nrm3(sub3(h,sk.neck)),up=nrm3(sub3(u0,mul3(d,dot3(u0,d)))),sd=cross3(d,up);
 if(kAt(c,h)*ppu*.23<9)return;
 const R0=.118*sk.s,top:Pt[]=[],bot:Pt[]=[];
 for(let i=0;i<=8;i++){const a=(-66+i*16.5)*DEG,dir=add3(mul3(d,Math.cos(a)),mul3(sd,Math.sin(a))),p=add3(h,mul3(dir,R0));if(dot3(dir,sub3(c.eye,p))<0)continue;
  const p1=pr(c,add3(p,mul3(up,.045*sk.s))),p2=pr(c,add3(p,mul3(up,-.005*sk.s)));if(p1&&p2){top.push(p1);bot.push(p2);}}
 if(top.length<2)return;
 const m=polyPath([...top,...bot.reverse()],true);s.knockout(m,.9);s.fill(K,m,.92);
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean;mask?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);if(f.mask&&!passing)drawMask(s,c,r.sk,ppu);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,mask:k===OSI,
  smear:o.smear&&((k===OSI&&tau>TJ+U_PLANT*HD&&tau<TF+.25)||(k===KVA&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so his head meets the ball just after "leaps high" (the cross is struck TF earlier) */
const tH1=()=>CUE(0,'leaps')+.2;
function tau1(t:number){return Math.max(T0+.5,t-(tH1()-TF));}
const P1:V3=[-34,26,-80];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),tX=tH1()-TF;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-42,7,22],fov:40})],
  [CUE(0,'Juventus')-.4,1.4,()=>({P:P1,T:[-12,1,-7],fov:17})],
  [CUE(0,'Kvaratskhelia')-.5,1,()=>({P:P1,T:mix3(at(KVA,tau,.9),[-8,1,-4],.3),fov:9.5})],
  [tX-.3,.5,()=>({P:P1,T:mix3(at(KVA,tau,.9),[-8,1,-4],.4),fov:10})],
  [tX+.02,.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.6*sm(0,TF,tau)),fov:lerp(10,12,sm(0,.9,tau))})],
  [tH1()-.45,.6,()=>({P:P1,T:[HP[0]+1.2,1.6,HP[1]-.4],fov:6.2})],
  [CUE(0,'Goal')+.3,1.4,()=>{const w=at(OSI,tau,1.1);return{P:P1,T:mix3(w,[-6,1.2,-8],.3),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal'),tN=tH1()+.3;
  stadium(s,c,t,{roar:sm(tN,tN+.5,t),flash:sm(tG-.3,tG+.2,t)*(1-sm(tG+2.2,tG+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return tH1()+.05;},
};

/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** the replay trail: the ball's path so far, a fading yellow ribbon */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const T_PLANT=TJ+U_PLANT*HD,T_TAKEOFF=TJ+U_TAKEOFF*HD,T_PEAK=TJ+U_PEAK*HD;

// ---------------------------------------------------------------- 2 · the slow-motion replay from low on the far touchline, side-on to the leap
const tau2=(t:number)=>key(t,mono([[0,-1.6],[CUE(1,'runs at'),-.7],[CUE(1,'plants one foot'),T_PLANT],[CUE(1,'swings'),T_TAKEOFF],[CUE(1,'flies up'),T_PEAK],[CUE(1,'flies up')+.9,TF+.02],[SECS(1)-.2,TG+.3]]),linear);
const E2:V3=[-8.5,1.5,23];
function cam2(t:number):Cam{
 const tau=tau2(t),o=at(OSI,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-9,1.4,-5],fov:28})],
  [CUE(1,'runs at')-.4,1.1,()=>({P:E2,T:o,fov:11})],
  [CUE(1,'plants')-.3,.8,()=>({P:E2,T:at(OSI,tau,.75),fov:8.4})],
  [CUE(1,'swings')-.2,.8,()=>({P:E2,T:at(OSI,tau,1.5),fov:9.4})],
  [CUE(1,'flies up')-.2,.8,()=>({P:add3(E2,[0,-.3,0]),T:mix3([HEAD_PT[0]-.2,HEAD_PT[1]-.4,HEAD_PT[2]],[-3,1.2,.3],.5*sm(TF,TG,tau)),fov:lerp(9.5,16,sm(TF,TG,tau))})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // the replay graphic: a yellow ring under Osimhen ("that's him") until he takes off
  groundRing(s,c,at(OSI,tau,0),.75,Y,sm(CUE(1,'runs at')-.3,CUE(1,'runs at')+.1,t)*(1-sm(T_TAKEOFF-.05,T_TAKEOFF+.1,tau)),.16);
  // (the two back-post players, between this camera and the leap, are left out of the side-on replay)
  const r=play(s,c,tau,tp,{smear:true,min:10,only:ACTORS.map((_,k)=>k).filter(k=>k!==BACK_J&&k!==BACK_N)});
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'flies up')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay from behind the goal: the head snaps, the ball comes down at us
const tau3=(t:number)=>key(t,mono([[0,TJ-.5],[CUE(2,'head snap'),TF-.06],[CUE(2,'heads it down'),TF+.06],[CUE(2,'middle'),TG+.08],[CUE(2,'Napoli')-.3,TG+1.8],[SECS(2),TG+4.6]]),linear);
const E3:V3=[11,5.6,2.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),o=at(OSI,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0],1.6,HP[1]-.6],fov:16})],
  [CUE(2,'head snap')-.3,.8,()=>({P:E3,T:[HEAD_PT[0]+.2,HEAD_PT[1]-.2,HEAD_PT[2]],fov:10})],
  [CUE(2,'heads it down')-.1,.9,()=>({P:E3,T:[-2.8,1,-.2],fov:24})],
  [CUE(2,'middle')+.3,1.1,()=>({P:E3,T:[-2.4,1,-.4],fov:28})],
  [CUE(2,'Napoli')-1,1.6,()=>({P:[8.5,5.2,1.5],T:o,fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tN=CUE(2,'Napoli');
  stadium(s,c,t,{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tN-.1,tN+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the header's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(OSI,tau3(twos(t))),sk=solve(p.pose,B_OSI,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'heads it down')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: low on the near side, a slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,TJ-.7],[CUE(3,'Jump off')+.3,T_PLANT],[CUE(3,'Drive'),T_PLANT+.04],[CUE(3,'get above'),T_PEAK],[CUE(3,'nod it down'),TF-.02],[CUE(3,'nod it down')+.9,TF+.1],[SECS(3),TG+.15]]),linear);
const E4:V3=[-12.5,2.3,-8.5];
const osiSk=(tau:number)=>{const st=stateOf(OSI,tau);return solve(st.pose,B_OSI,st.place);};
function cam4v(t:number):Cam{
 const tau=tau4(t),o=at(OSI,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E4,T:[HP[0]+.6,1,HP[1]-.3],fov:30})],
  [CUE(3,'Jump off')-.2,1,()=>({P:add3(E4,[1,-.4,1]),T:mix3(o,[HP[0]-.4,.5,HP[1]],.5),fov:17})],
  [CUE(3,'Drive')-.2,.9,()=>({P:add3(E4,[1,-.4,1]),T:[HP[0]-.3,1.3,HP[1]],fov:17})],
  [CUE(3,'get above')-.2,.9,()=>({P:add3(E4,[1,-.2,1]),T:[HEAD_PT[0]-.2,HEAD_PT[1]-.35,HEAD_PT[2]],fov:15})],
  [CUE(3,'nod it down')-.1,1,()=>({P:E4,T:[-3,1.2,.2],fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tJ=CUE(3,'Jump off'),tD=CUE(3,'Drive'),tA=CUE(3,'get above'),tO=CUE(3,'nod it down'),end=SECS(3);
  stadium(s,c,t,{roar:.3+.3*sm(tO+.3,tO+.9,t)});
  ground(s,c);
  // "Jump off one foot": ONE lit footprint where the left foot plants, a spark under it
  const fp=sm(tJ-.1,tJ+.4,t)*(1-sm(tA+.3,tA+.9,t));
  if(fp>0){const sk=osiSk(T_PLANT),h=sk.lHeel,to=sk.lToe,mid:V3=[(h[0]+to[0])/2,.01,(h[2]+to[2])/2],ax=nrm2(to[0]-h[0],to[2]-h[2]),pts:Pt[]=[];
   for(let i=0;i<16;i++){const a=i/16*TAU,l=Math.cos(a)*.19,w=Math.sin(a)*(Math.cos(a)>0?.07:.055),p=pr(c,[mid[0]+ax[0]*l-ax[1]*w,.01,mid[2]+ax[1]*l+ax[0]*w]);if(p)pts.push(p);}
   if(pts.length>8){const path=polyPath(pts,true);s.stroke(K,path,5,.9*fp);s.knockout(path,fp);s.fill(Y,path,.95*fp);}
   const q=pr(c,mid);if(q&&t<tD+.4)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,mid)*.55)*fp,{n:9,seed:41,g:easeOutBack(fp),width:12});}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[OSI,GK,JM,KVA]});
  // "Drive your knee up": a red arrow along the right knee's path, plant → peak
  const kd=sm(tD-.1,tD+.5,t)*(1-sm(tO,tO+.4,t));
  if(kd>0){const pts:V3[]=[];for(let i=0;i<=8;i++){const sk=osiSk(lerp(T_PLANT,T_PEAK,i/8*sm(tD-.1,tD+.9,t)));pts.push(add3(sk.rKn,[0,.08,0]));}arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.07),R,.95*kd);}
  // "get above the ball": a ring on the ball, a navy tick at its height, a burst over his head
  const ab=sm(tA-.2,tA+.3,t)*(1-sm(end-.9,end-.3,t));
  if(ab>0&&r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}
   const rp=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*ab);s.fill(Y,rp,.95*ab);
   const sk=osiSk(tau),hp=pr(c,add3(sk.head,[0,.24,0]));if(hp&&tau>T_PEAK-.1)sparkBurst(s,Y,hp[0],hp[1],Math.max(50,kAt(c,sk.head)*.5)*ab,{n:11,seed:55,g:easeOutBack(ab),width:10});}
  // "nod it down toward goal": the header's path as a yellow arrow, down into a lit low target in the middle of the goal
  const nd=sm(tO-.2,tO+.3,t);
  if(nd>0){const zone=polyP(c,[[0,.02,-1.6],[0,.02,1.9],[0,1.05,1.9],[0,1.05,-1.6]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.35*nd);s.tone(Y,zp,.55*nd);s.stroke(K,zp,3,.7*nd);}
   const arr=sm(tO+.1,tO+1,t,easeInOutSine);if(arr>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,q,Math.max(9,kAt(c,HEAD_PT)*.06),Y,.95*nd);}}
 },
 get still(){return CUE(3,'get above')+.3;},
};

const film:RisoStory={
 id:'osimhen-signature',format:'11v11',title:"Osimhen's leaping header",
 theme:'Jump off one foot to go higher, get above the ball and head it down toward goal',
 ageNote:'Napoli 5–1 Juventus, Serie A, Stadio Diego Armando Maradona, Naples, 13 January 2023 (65th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball floats in from one side, a yellow spark where it is met, and it is nodded down and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.35),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-200*(1-u):x+150*easeOut(out),by=age<.3?y-90*(1-u)*(1-u)-40*(1-u):y+110*out*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Juventus's goal line x = 0, +z = Napoli's right) — checked by tests/play-film-osimhen-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,TJ,T_PLANT,T_TAKEOFF,T_PEAK,V_HEAD,ballAt,crossFoot:'r' as const,
 kvaraContact:()=>{const st=stateOf(KVA,0),sk=solve(st.pose,B_KVA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 osimhenAt:(tau:number)=>{const st=stateOf(OSI,tau),sk=solve(st.pose,B_OSI,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,lToe:sk.lToe,rToe:sk.rToe,lHeel:sk.lHeel,rHeel:sk.rHeel,lKn:sk.lKn,rKn:sk.rKn,lHip:sk.lHip,rHip:sk.rHip};},
 markerAt:(tau:number)=>{const st=stateOf(JM,tau),sk=solve(st.pose,B_JM,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_SZC,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
