/** Rafael Leão — signature: "the long-stride dribble" (lib/town/iconicPlays.json: kind "signature", template solo_dribble_goal, side left,
 * 2 beaten, right foot; lesson "Take long strides in open space, then short touches when defenders get close."). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * WHY THIS MOMENT: the signature is a trait, so the film recreates ONE real, written-up run that shows it: Napoli 1–1 AC Milan, Champions
 * League quarter-final second leg, Stadio Diego Armando Maradona, Naples, Tuesday 18 April 2023, Milan's goal (43'). His most celebrated
 * gallop: a "70-yard run" from his own half past three challenges, ending in the square ball for Giroud's tap-in that sent Milan to the
 * semi-final. The sources describe the play step by step, so the run is staged in the match (the brief allows this when written sources
 * describe the play). (Real Madrid 1–3 Milan, Nov 2024, is the Reijnders film's goal, so it is not used here.) The lesson's contrast —
 * long strides in open grass, short touches near a defender — is drawn over the replays and kept generic in the narration.
 *
 * SOURCES (fetched 24 Sep 2026 with curl and a generic UA, cached in the film scratchpad src-cache/; 7 requests):
 *  - The Guardian live blog, Rob Smyth, "Napoli 1-1 Milan (1-2 agg): Champions League quarter-final, second leg", 18 Apr 2023, the goal
 *    entry: "Ndombele let the ball run across his body, 25 yards from Milan's goal, and it was collected by Leao in the inside-left channel.
 *    He veered away from Ndombele's recovery challenge, then used sleight of hip to cut inside Di Lorenzo just past the halfway line. ...
 *    The last man on that side of the field, Rrahmani, was beaten by a sudden change of pace on the edge of the area, and Leao then used
 *    his strength to resist Rrahmani's desperate lunging challenge. Finally he drew Meret and squared the ball to Giroud, who sidefooted it
 *    past Juan Jesus on the line." Also: "a 70-yard run of the purest brilliance"; subs at 34' (Olivera for Mario Rui, Lozano for
 *    Politano); Anguissa suspended (Ndombele started); Leão off at 83'.  (cache: guardian-napoli-milan-2023-live*.{html,txt})
 *  - The Guardian (Reuters) report, "Milan hold firm to deny Napoli after Leão's solo run and Maignan's saves": "Rafael Leão sprinted with
 *    the ball from his own half past the Napoli defence before rolling it across to Giroud, who slotted home from close range"; 1–1,
 *    2–1 on aggregate; Giroud's penalty saved by Meret, Kvaratskhelia's by Maignan.  (cache: guardian-napoli-milan-2023-report.*)
 *  - Football Italia report: "started the run from his own half and rode three attempts to tackle him, keeping his cool to then roll
 *    across for the Giroud tap-in from eight yards".  (cache: fi-napoli-milan-2023.*)
 *  - Wikipedia "2022–23 UEFA Champions League knockout phase": date, venue, Giroud 43', referee Marciniak.  (cache: wiki-2022-23-ucl-ko.txt)
 *  - Guardian photo (Franco Romano/NurPhoto), "Olivier Giroud thanks Rafael Leao after his run set up the decisive Milan goal": Milan in the
 *    red-and-black striped HOME shirts, black shorts, black socks; Leão No. 17, long sleeves, locks tied up; Giroud short sleeves.
 *    (cache: guardian-napoli-milan-2023-giroud-leao.jpg)
 *  - Card data: lib/town/playerAppearance.json (Portugal; skin 5, curly hair), lib/town/playerCareers.json (AC Milan 2019–2026).
 * CONFIRMED: match, ground, date (a night game), score and the 43rd-minute goal; Ndombele letting the ball run across his body ~25 yards
 *  from Milan's goal; Leão collecting it in the inside-left channel in his own half; veering away from Ndombele's recovery challenge;
 *  cutting inside Di Lorenzo just past halfway; beating Rrahmani with a sudden change of pace and resisting his lunge; drawing Meret;
 *  squaring for Giroud's side-foot tap-in from about eight yards past Juan Jesus on the line; three challenges ridden; Milan's kit and
 *  Leão's number, sleeves and hair; who was on the pitch at 43' (Olivera and Lozano on).
 * INFERRED (illustrative, kept OUT of the narration): every position, speed and timing; the touch pattern (a long touch every other stride
 *  in open grass, a touch every stride near Rrahmani: the card's lesson, not a frame count); Lobotka as the passer to Ndombele; Rrahmani
 *  met a few metres outside the box rather than exactly on its edge; Leão's squaring foot (right) and Giroud's (right); Meret going to
 *  ground late; the other players' places; which way Milan attacked on the main camera (the camera on Milan's left, so Milan run
 *  right-to-left on screen); NAPOLI'S KIT (sky blue shirts and socks, white shorts: the home strip, not seen in a source) and Meret's
 *  yellow kit (placeholder); numbers from memory (Ndombele 91, Di Lorenzo 22, Rrahmani 13, Juan Jesus 5, Olivera 17, Lobotka 68,
 *  Zieliński 20, Kvaratskhelia 77, Lozano 11, Osimhen 9, Meret 1; Giroud 9, Brahim Díaz 10, Tonali 8, Bennacer 4, Hernández 19,
 *  Krunić 33); the Maradona drawn as an oval two-tier bowl round a blue running track under a roof ring, at night; crowd colours with a
 *  red Milan corner; no referee drawn; the boot-polishing celebration in the photo is not staged (arms-up celebration instead).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the run to the goal; ch2 =
 * slow-motion replay from a low touchline camera tracking Leão: long touches (yellow arrows ball-to-ball) in open grass, the red danger
 * ring round Rrahmani, the short touch ticks, the change of pace (blue), the square ball; ch3 = the lesson from a raised camera behind the
 * run: the open-space zone, long strides, defenders' red rings, short touches. All figures are the shared riso athlete (athlete.ts),
 * routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square), never sheet.safe. Handedness: the world
 * is right-handed (x toward the goal Milan attack, y up, +z = the attackers' right), athlete.ts's own convention, so his RIGHT foot is the
 * right foot and "the left" is −z. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times
 * the film; randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.7 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); no cue starts with
 * a contraction, a hyphenated word or "Leão" (Kokoro may split the tilde). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The run, live',text:'Napoli against Milan, Champions League. In his own half, a loose ball, and Rafael Leão takes it! Past one, and away he gallops up the left. Inside another, then a burst of speed past the last defender, and across to Giroud... Goal!',seconds:16.6,
  cues:[[.2,'Napoli'],[1,'Milan'],[1.4,'Champions League'],[2.6,'In his own half'],[4,'loose ball'],[4.8,'Rafael'],[5.6,'takes it'],[6.5,'Past one'],[7.9,'gallops'],[9.5,'Inside another'],[10.8,'burst of speed'],[11.8,'past the last'],[13.4,'across'],[13.9,'Giroud'],[14.9,'Goal']]},
 {label:'Watch it again',text:'Watch again, slowly. In open grass: long strides, ball pushed far ahead. Near a defender: short, quick touches. Then a change of pace, and he rolls it across!',seconds:11.8,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.9,'open grass'],[2.8,'long strides'],[4.2,'far ahead'],[5.2,'Near a defender'],[6.3,'short'],[6.8,'quick touches'],[8.3,'change of pace'],[9.7,'rolls it across']]},
 {label:'Your turn',text:'Your turn: in open space, take long strides. When defenders get close, switch to short touches!',seconds:8.4,
  cues:[[.15,'Your turn'],[1.3,'open space'],[2.4,'long strides'],[3.7,'defenders get close'],[5,'switch'],[5.6,'short touches']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py leao-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/leao-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-leao-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/leao-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('leao: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
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
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- the Stadio Maradona at night: an oval two-tier bowl round a running track, roof ring (simplified, inferred)
const CX=52.5,NS=60;
/** a point on the bowl: angle th round the pitch centre, d metres out from the track's outer edge (a squared-off oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(70+d)*Math.sign(c)*Math.pow(Math.abs(c),.6),y,(48+d)*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
const LOW=(b:number):[number,number]=>[1.5+22*b,1.6+11.5*b],UP=(b:number):[number,number]=>[26+20*b,17.5+16*b];
type Bowl={low:V3[][];band:V3[][];up:V3[][];roof:V3[][];lamps:V3[];seats:{P:V3;h:number;away:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],band:[],up:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,24,13.1),rim(b,24,13.1),rim(b,26,17.5),rim(a,26,17.5)]);
  o.roof.push([rim(a,29,39),rim(b,29,39),rim(b,50,36.5),rim(a,50,36.5)]);
  if(i%2===0)o.lamps.push(rim(a+.5/NS*TAU,28.8,38.2));
  // the Milan fans: one upper-tier segment behind the goal Milan attack (inferred placement)
  const away=a>.05*TAU&&a<.12*TAU;
  for(const [f,rows,up] of [[LOW,7,false],[UP,6,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),11);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away:away&&up});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = phones), the roof and floodlights */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.52,.5);s.field(B,.22,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){const q1=quadP(c,BOWL.low[i]);if(q1)addPoly(low,q1);const q2=quadP(c,BOWL.up[i]);if(q2)addPoly(up,q2);const q3=quadP(c,BOWL.band[i]);if(q3)addPoly(band,q3);const q4=quadP(c,BOWL.roof[i],10);if(q4)addPoly(roof,q4);}
 s.knockout(low);s.tone(B,low,.5);s.tone(K,low,.2);
 s.knockout(up);s.tone(B,up,.45);s.tone(K,up,.34);
 // the crowd: Napoli sky blue, white (paper), navy, phone lights (yellow); a red-and-black Milan corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0&&!q.away?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.6?4:2):q.h<.4?0:q.h<.75?1:q.h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.75);s.fill(K,inks[2],.8);s.fill(Y,inks[3],.95);s.fill(R,inks[4],.9);
 s.knockout(band,.8);s.fill(K,band,.6);
 s.knockout(roof);s.tone(K,roof,.8);s.tone(B,roof,.35);
 const lp=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lp.addPath(polyPath(blob(g[0],g[1],z,z*.5,7,{amp:.05,n:10}),true));}
 s.knockout(lp);s.fill(Y,lp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=7+12*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track (blue oval), floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags, both goals */
const TRACK:V3[]=Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0));
function ground(s:Sheet,c:Cam,o:{bulge?:number;ball?:V3}={}){
 const tr=polyP(c,TRACK);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(B,p,.62);s.tone(K,p,.3);}
 const g=polyP(c,[[-7,0,-39],[112,0,-39],[112,0,39],[-7,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.82);s.tone(K,gp,.12);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37.5],[109,0,-37.5],[109,.9,-37.5],[-4,.9,-37.5]]),polyP(c,[[-4,0,37.5],[109,0,37.5],[109,.9,37.5],[-4,.9,37.5]]),polyP(c,[[109,0,-36],[109,0,36],[109,.9,36],[109,.9,-36]]),polyP(c,[[-4,0,36],[-4,0,-36],[-4,.9,-36],[-4,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-37.45],[x+3.4,.25,-37.45],[x+3.4,.65,-37.45],[x,.65,-37.45]]));addPoly(pn,polyP(c,[[x,.25,37.45],[x+3.4,.25,37.45],[x+3.4,.65,37.45],[x,.65,37.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pn,.5);
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
 goal3(s,c,0,-1,0,0,1);
 goal3(s,c,105,1,o.bulge??0,o.ball?.[2]??0,o.ball?.[1]??1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,1),1,z],.025,mesh,.7);seg3(c,[back(z,1),1,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** AC Milan (photo-confirmed): red-and-black striped home shirts (black printed navy), black shorts, black socks */
const MIL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'stripes',patternInk:K,shorts:K,socks:K,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Napoli: sky-blue shirts and socks, white shorts (the home strip, INFERRED) */
const NAP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.62],shorts:'paper',socks:[B,.62],boots:K,trim:'paper',numberInk:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Leão: No. 17, ≈1.88 m, long sleeves, locks tied up (drawn curly), dark skin (card: skin 5); right-footed */
const LEAO=MIL({number:17,skin:SKIN_D,hair:K,hairStyle:'curly',sleeves:'long',build:{height:1.88},seed:17});
const GIROUD=MIL({number:9,skin:SKIN_L,hair:K,hairStyle:'short',build:{height:1.93,bulk:1.06},seed:9});
const MERET:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.9},seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- tracks: keyframed positions [τ, X, Z], Hermite-interpolated, tabled at 50 Hz
type Actor={name:string;style:AthleteStyle;keys:number[][];key?:boolean;role:'mil'|'nap'|'gk'};
type Tab={X:number[];Z:number[];D:number[]};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const DT=.02;
type Track={actors:Actor[];T0:number;tabs:Tab[]};
function track(actors:Actor[],T0:number,T1:number):Track{return{actors,T0,tabs:actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;
 for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};})};}
const samp=(T:Track,arr:number[],tau:number)=>{const u=clamp((tau-T.T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(T:Track,k:number,tau:number):[number,number]=>[samp(T,T.tabs[k].X,tau),samp(T,T.tabs[k].Z,tau)];
const distOf=(T:Track,k:number,tau:number)=>samp(T,T.tabs[k].D,tau);
const velOf=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau-.08),b=posOf(T,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau),b=posOf(T,k,tau-.3),d=posOf(T,k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(T:Track,k:number,tau:number)=>{const v=velOf(T,k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(T:Track,k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(T,k,tau),y=headingOf(T,k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};

// ---------------------------------------------------------------- THE RUN (τ = seconds after Leão squares it; positions inferred, see the header)
const T_START=-15,PASS=-10.6,PICK=-9,BEAT_N=-8.3,BEAT_D=-4.6,BEAT_R=-1,LUNGE_R=-.55,SQUARE=0,SHOT=.5,IN_NET=.72;
const ACTORS:Actor[]=[
 {name:'Leão',role:'mil',style:LEAO,key:true,keys:[[T_START,17,-12],[-12,18.8,-13.2],[-10.2,20.4,-14.2],[PICK,21.8,-15.1],[BEAT_N,25.8,-17.3],[-7.3,32.6,-19.3],[-6.2,41.2,-20.3],[-5.2,49.2,-20],[BEAT_D,53.8,-18.9],[-3.8,59.8,-15.8],[-3,66.2,-14],[-2.3,71.4,-12.9],[-1.7,75.2,-12.1],[-1.35,77.4,-11.7],[BEAT_R,79.8,-11.3],[LUNGE_R,84.1,-10.6],[-.25,87,-10.1],[SQUARE,89.4,-9.7],[.4,92,-9.3],[1.2,95.5,-8.6],[2.4,98,-6.6],[4,99.2,-4],[6,99.8,-2]]},
 {name:'Giroud',role:'mil',style:GIROUD,key:true,keys:[[T_START,44,3],[-10,52,3],[-6,62,1.5],[-3,75,0],[-1.5,84,-1],[SQUARE,93.5,-1.4],[.35,96.4,-1],[SHOT,97,-.9],[1,98.6,-.8],[1.8,99.2,-2.6],[3,98.9,-4.4],[5,98.9,-4.8]]},
 {name:'Brahim',role:'mil',style:MIL({number:10,skin:SKIN_M,build:{height:1.7,bulk:.92},seed:10}),keys:[[T_START,26,10],[-10,30,8],[-5,48,6],[0,70,3],[3,82,1],[5,86,0]]},
 {name:'Tonali',role:'mil',style:MIL({number:8,hairStyle:'long',seed:8}),keys:[[T_START,16,-4],[-10,17,-6],[-5,26,-8],[0,38,-8],[4,50,-6]]},
 {name:'Bennacer',role:'mil',style:MIL({number:4,skin:SKIN_M,hairStyle:'curly',seed:4}),keys:[[T_START,12,6],[-10,14,4],[-5,22,2],[0,32,0],[4,44,0]]},
 {name:'Theo',role:'mil',style:MIL({number:19,seed:19}),keys:[[T_START,10,-20],[-10,12,-22],[-5,22,-24],[0,34,-24],[4,46,-20]]},
 {name:'Krunic',role:'mil',style:MIL({number:33,seed:33}),keys:[[T_START,14,14],[-10,16,12],[0,26,10],[4,34,8]]},
 {name:'Ndombele',role:'nap',style:NAP({number:91,skin:SKIN_D,build:{height:1.81,bulk:1.08},seed:91}),key:true,keys:[[T_START,27,-11],[-12,25.5,-12],[-10,24.4,-12.6],[-9.6,24,-12.8],[PICK,23.8,-14],[BEAT_N,25,-15.6],[-7.5,28,-16.5],[-6,33,-17],[-3,40,-16],[0,46,-14],[3,50,-12]]},
 {name:'Lobotka',role:'nap',style:NAP({number:68,build:{height:1.7,bulk:.95},seed:68}),key:true,keys:[[T_START,38,-4],[-12,35,-5],[PASS,33.4,-5.8],[PICK,32,-6.5],[-5,40,-8],[0,52,-8],[3,58,-7]]},
 {name:'Di Lorenzo',role:'nap',style:NAP({number:22,seed:22}),key:true,keys:[[T_START,66,-27],[-10,63,-25.5],[-7,60,-23],[-5.4,56.4,-20.6],[BEAT_D,55,-19.9],[-4.1,56.4,-19.2],[-3.4,60,-17.6],[-2,67,-15.5],[0,76,-13],[2,82,-11],[4,85,-10]]},
 {name:'Rrahmani',role:'nap',style:NAP({number:13,build:{height:1.92,bulk:1.06},seed:13}),key:true,keys:[[T_START,84,-2],[-10,82,-5],[-6,80,-8],[-3,81,-10.5],[-1.8,81.4,-11.6],[-1.3,81,-12.1],[BEAT_R,80.6,-12.3],[LUNGE_R,83.2,-11.7],[-.2,86,-11.2],[.4,89.4,-10.4],[1.2,92.5,-9.4],[2.5,95,-8],[4,96,-7]]},
 {name:'Juan Jesus',role:'nap',style:NAP({number:5,skin:SKIN_D,hairStyle:'bald',build:{height:1.85,bulk:1.06},seed:15}),key:true,keys:[[T_START,84,6],[-10,83,4],[-6,82,1],[-3,86,-1],[-2,92,-1.5],[-1,96.5,-1],[SQUARE,100.5,0],[.4,103.4,.7],[.7,104.3,1],[3,104.4,1]]},
 {name:'Olivera',role:'nap',style:NAP({number:17,seed:27}),keys:[[T_START,44,26],[-10,50,24],[-5,64,17],[0,80,9],[2,88,6],[4,90,4]]},
 {name:'Zielinski',role:'nap',style:NAP({number:20,seed:20}),keys:[[T_START,34,8],[-10,32,6],[-5,42,3],[0,56,-2],[4,64,-4]]},
 {name:'Kvaratskhelia',role:'nap',style:NAP({number:77,seed:77}),keys:[[T_START,20,20],[-10,20,18],[-5,28,15],[0,40,10],[4,50,6]]},
 {name:'Lozano',role:'nap',style:NAP({number:11,skin:SKIN_M,seed:11}),keys:[[T_START,20,-26],[-10,22,-24],[-5,30,-22],[0,40,-19],[4,48,-16]]},
 {name:'Osimhen',role:'nap',style:NAP({number:9,skin:SKIN_D,hair:[Y,.9],build:{height:1.86,bulk:1.05},seed:29}),keys:[[T_START,14,2],[-10,16,0],[-5,24,-2],[0,34,-4],[4,42,-4]]},
 {name:'Meret',role:'gk',style:MERET,key:true,keys:[[T_START,103.5,0],[-3,103,-2],[-1,101.5,-4.2],[-.3,99.5,-6.4],[SQUARE,98.9,-7],[.4,98.8,-6.8],[.7,99.2,-5.6],[2,100,-4],[4,100.4,-3]]},
];
const MT=track(ACTORS,T_START,6.5);
const MIX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const LEO=MIX('Leão'),GIR=MIX('Giroud'),NDO=MIX('Ndombele'),LOB=MIX('Lobotka'),DIL=MIX('Di Lorenzo'),RRA=MIX('Rrahmani'),JJ=MIX('Juan Jesus'),GK=MIX('Meret');

/** the touch pattern: 0 in open grass (long strides, a long touch every other stride), 1 near Rrahmani (short strides, a touch every stride) */
const shortW=(tau:number)=>sm(-2.5,-2.1,tau)*(1-sm(-1.15,-.9,tau));
/** Leão's run phase (runCycle phase: 0 = right foot down) integrated along his track: a stride is 4.4 m in the open, 2.1 m when close */
const RPT:number[]=(()=>{const D=MT.tabs[LEO].D,o=[0];for(let i=1;i<D.length;i++){const tau=T_START+i*DT;o.push(o[i-1]+(D[i]-D[i-1])/lerp(4.4,2.1,shortW(tau)));}return o;})();
const runPh=(tau:number)=>samp(MT,RPT,tau);
type Touch={tau:number;P:[number,number];short:boolean};
const PASS_P=footSpot(MT,LOB,PASS,'r',.45),PICK_P=footSpot(MT,LEO,PICK,'r',.5);
const SQ_P=footSpot(MT,LEO,SQUARE,'r',.5);
const SHOT_P=footSpot(MT,GIR,SHOT,'r',.42);
/** the ball's touches: the collection, then one each time the right foot swings through (every other stride in the open), the square */
const TOUCHES:Touch[]=(()=>{const o:Touch[]=[{tau:PICK,P:PICK_P,short:false}];let last=Math.floor(runPh(PICK)-.97);
 for(let tau=PICK+.3;tau<-.35;tau+=DT){const a=runPh(tau-DT)-.97,b=runPh(tau)-.97;if(Math.floor(b)>Math.floor(a)){const k=Math.floor(b),sh=shortW(tau)>.5;if(sh||k-last>=2){o.push({tau,P:footSpot(MT,LEO,tau,'r',.5),short:sh});last=k;}}}
 o.push({tau:SQUARE,P:SQ_P,short:false});return o;})();
/** the finish: side-footed low past Juan Jesus into the net left of centre (exact spot inferred) */
const NET_P:V3=[105.3,.25,-2.1],REST_P:V3=[106.4,.11,-2.3];
function ballM(tau:number):V3{
 if(tau<PASS){const[x,z]=footSpot(MT,LOB,tau,'r',.45);return[x,.11,z];}
 if(tau<PICK)return roll([PASS_P[0],.11,PASS_P[1]],[PICK_P[0],.11,PICK_P[1]],(tau-PASS)/(PICK-PASS),.45);
 if(tau<SQUARE){let j=0;while(j+2<TOUCHES.length&&TOUCHES[j+1].tau<=tau)j++;const a=TOUCHES[j],b=TOUCHES[j+1],u=clamp((tau-a.tau)/(b.tau-a.tau)),D=Math.hypot(b.P[0]-a.P[0],b.P[1]-a.P[1]);
  // a long touch shoots ahead and slows (the ball far in front of him); a short touch barely leaves his foot
  const n=D>3?2.2:2,e=1-Math.pow(1-u,n);return[lerp(a.P[0],b.P[0],e),.11,lerp(a.P[1],b.P[1],e)];}
 if(tau<SHOT)return roll([SQ_P[0],.11,SQ_P[1]],[SHOT_P[0],.11,SHOT_P[1]],(tau-SQUARE)/(SHOT-SQUARE),.25);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT),b=lerp3([SHOT_P[0],.11,SHOT_P[1]],NET_P,u);return[b[0],b[1]+.05*Math.sin(Math.PI*u),b[2]];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return lerp3(NET_P,REST_P,e);
}
const bulgeM=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the base gait from speed: stand / jog / sprint, or a backpedal when moving backwards */
function gait(k:number,tau:number,idle:Pose):{p:Pose;yaw:number;sp:number}{
 const v=velOf(MT,k,tau),sp=Math.hypot(v[0],v[1]);let yaw=sp>.5?yawOf(v[0],v[1]):0;const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(MT,k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(MT,k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 return{p,yaw,sp};}
function lungeAt(p:Pose,yaw:number,x:number,z:number,b:V3,at:number,tau:number):Pose{const u=(tau-(at-.6*.9))/.9;if(u<=0||u>=1.5)return p;
 const s=Math.sin(yaw)*(b[0]-x)+Math.cos(yaw)*(b[2]-z)>0?'r':'l';return blendPose(p,lunge(Math.min(1,u),{side:s}),inWin(u));}
function poseM(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],[x,z]=posOf(MT,k,tau),b=ballM(tau);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='nap'?READY:stand();
 let{p,yaw,sp}=gait(k,tau,idle);if(sp<=.5||a.role==='nap'&&sp<3)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===LEO){
  // the gallop: long, high strides with the head up in the open; short quick strides, knees bent, eyes on the ball near Rrahmani
  const sw=shortW(tau),run=runCycle(runPh(tau),{speed:lerp(1,.55,sw),stride:lerp(1.14,.78,sw)});
  p=blendPose(p,run,sm(PICK-.5,PICK,tau)*(1-sm(-.3,0,tau)));
  p=over(p,{neckP:-4,lean:12},sm(PICK,PICK+.6,tau)*(1-sw)*(1-sm(-.4,0,tau)));
  p=over(p,{neckP:28,lean:20,lKnee:52,rKnee:52,lShA:30,rShA:30},sw*.8);
  // the collection: a cushioned right-foot touch as he turns up the pitch
  p=over(p,{rHipF:34,rKnee:24,rAnk:26,rHipR:20,neckP:30},bump(PICK-.25,PICK+.15,tau));
  // veer away from Ndombele (lean left), sleight of hip inside Di Lorenzo (dip the left hip, lean right)
  p=over(p,{bend:-14,twist:-12},bump(BEAT_N-.35,BEAT_N+.3,tau));
  p=over(p,{bend:16,twist:18,lHipA:20,neckY:-18},bump(BEAT_D-.4,BEAT_D+.35,tau));
  // resisting Rrahmani's lunge from his left: lean into it, the left arm out
  p=over(p,{bend:-12,lShA:52,lElb:30,twist:-10},bump(LUNGE_R-.3,LUNGE_R+.35,tau));
  // the square ball with the right foot (inferred), rolled across to Giroud
  const D=.7,u=(tau-(SQUARE-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),inWin(u));yaw=lerpA(yaw,yawOf(SHOT_P[0]-x,SHOT_P[1]-z)+.4,.7*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));}
 if(k===GIR){
  // eyes on Leão, then the side-foot tap-in (right foot inferred)
  p=over(p,{neckY:30,neckP:-2},bump(-3,SQUARE+.3,tau)*.8);
  const D=.55,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),inWin(u));yaw=lerpA(yaw,yawOf(NET_P[0]-x,NET_P[2]-z)+.5,.85*inWin(u));}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.3,IN_NET+.9,tau));}
 if(k===LOB){const D=.7,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),inWin(u));yaw=lerpA(yaw,yawOf(PICK_P[0]-x,PICK_P[1]-z),inWin(u));}}
 if(k===NDO){p=over(p,{neckP:20,lHipA:18,twist:20},bump(-10,-9.3,tau));p=lungeAt(p,yaw,x,z,b,BEAT_N,tau);}
 if(k===DIL)p=lungeAt(p,yaw,x,z,b,BEAT_D,tau);
 if(k===RRA)p=lungeAt(p,yaw,x,z,b,LUNGE_R,tau);
 if(k===JJ)p=lungeAt(p,yaw,x,z,b,SHOT+.12,tau);
 if(k===GK){yaw=yawOf(b[0]-x,b[2]-z);if(tau>-.5&&tau<.2)p=over(p,{lKnee:80,rKnee:80,lHipF:60,rHipF:60,lShA:50,rShA:50,lean:26},bump(-.5,.3,tau));
  const u=(tau-(SHOT-.05))/.8;if(u>0){p=keeperDive(Math.min(1,u),{side:'l',height:.05});yaw=Math.PI;}}
 if(a.role==='mil'&&k!==LEO&&k!==GIR&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='nap'&&tau>IN_NET+.7)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.7,IN_NET+1.5,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: white with navy star panels (the Champions League ball, simplified)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,d=r*(i%2?.58:.34),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.22,q:Pt[]=[];for(let j=0;j<10;j++){const b=a+j/10*TAU,rr=j%2?w*.45:w;q.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}pan.addPath(polyPath(q,true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the play through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;smear?:boolean;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=LEO}=o,A=ACTORS;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 A.forEach((_,k)=>{const[x,z]=posOf(MT,k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballM(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,A[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=A[e.k],{p,yaw}=poseM(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseM(e.k,tauPrev).p,smear:e.k===hero&&o.smear!==false}:{});
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

// ---------------------------------------------------------------- teaching marks
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(4,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61,dashed=false,wm=.16){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(5,c.F*wm/d);
 if(!dashed){s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);}
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,dashed?seg[0]:a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3,dashed});}
/** a 3D polyline arrow (the ball's path) */
function flight(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,seed=81){if(w<=.02)return;const sp:Pt[]=[];let d=1;for(const P of pts){const q=toCam(c,P);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(5,c.F*.12/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.6}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.6}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(MT,k,lerp(ta,tb,i/n)));return o;};
const ballPts=(ta:number,tb:number,n=10):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballM(lerp(ta+.001,tb-.001,i/n)));return o;};
/** "long strides, ball pushed far ahead": a yellow arrow from each long touch to the next, drawn as the ball travels (window [ta, tb]) */
function longTouches(s:Sheet,c:Cam,tau:number,w:number,ta:number,tb:number){if(w<=.02)return;
 for(let i=0;i+1<TOUCHES.length;i++){const a=TOUCHES[i],b=TOUCHES[i+1];if(a.short||b.tau-a.tau<.5||a.tau<ta||a.tau>tb||a.tau>tau)continue;const u=clamp((tau-a.tau)/(b.tau-a.tau));
  const L=Math.hypot(b.P[0]-a.P[0],b.P[1]-a.P[1]);if(L<3)continue;const pts:[number,number][]=[];for(let j=0;j<=8;j++)pts.push([lerp(a.P[0],b.P[0],j/8),lerp(a.P[1],b.P[1],j/8)]);
  groundArrow(s,c,pts,w*Math.max(.25,u),Y,300+i,false,.1);}}
/** "short, quick touches": a small yellow tick ring on the grass at each short touch once it has happened */
function shortTicks(s:Sheet,c:Cam,tau:number,w:number,ink=Y){if(w<=.02)return;
 TOUCHES.forEach((q,i)=>{if(!q.short||q.tau>tau)return;ring(s,c,q.P[0],q.P[1],.42,w*easeOutBack(clamp((tau-q.tau)/.2)),ink,400+i);});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera (Milan's left), near real time
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'Goal');return key(t,mono([[0,-14.3],[CUEW(0,'loose ball'),-9.95],[CUEW(0,'takes it'),PICK],[CUEW(0,'Past one'),BEAT_N+.15],[CUEW(0,'Inside another'),BEAT_D+.05],[CUEW(0,'across'),SQUARE],[CUEW(0,'Giroud'),SHOT],[G,IN_NET+.5],[S+1,IN_NET+.5+(S+1-G)*.85]]),linear);};
const CAM1:V3=[56,19,-76];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'Goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballM(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const g=posOf(MT,GIR,tau),l=posOf(MT,LEO,tau),cel:V3=[(g[0]+l[0])/2,1.2,(g[1]+l[1])/2],toC=sm(G+.3,G+1.6,t,easeInOutSine);
 // lead the play a little toward the goal Milan attack, so the run has room in front of it
 const lead=sm(CUEW(0,'takes it'),CUEW(0,'Past one')+1,t,easeInOutSine)*(1-sm(CUEW(0,'across')-.6,CUEW(0,'across')+.3,t));
 const T=lerp3([(bt[0]+l[0])/2+2*lead,1.3,(bt[2]+l[1])/2*.7+1.5],cel,toC);
 const F=key(t,[[0,6300],[CUEW(0,'takes it'),7000],[CUEW(0,'Inside another'),7200],[CUEW(0,'across'),7600],[G,8000],[G+1.2,9000],[S,9400]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(G-.4,G+.3,t),flash:sm(G-.2,G+.1,t)});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MT,LEO,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:11.6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low touchline camera tracking Leão: long touches, the danger ring, short touches, the change of pace
const tau2=(t:number)=>key(t,mono([[0,-6.4],[CUEW(1,'open grass'),-5.7],[CUEW(1,'far ahead'),-4.1],[CUEW(1,'Near a defender'),-2.8],[CUEW(1,'short'),-2.2],[CUEW(1,'quick touches'),-1.9],[CUEW(1,'change of pace'),BEAT_R-.05],[CUEW(1,'rolls it across'),SQUARE-.1],[SECS(1),SHOT+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(MT,LEO,Math.min(tau,SQUARE)),open=1-sm(0,1.4,t,easeInOutSine),close=sm(CUEW(1,'Near a defender')-.5,CUEW(1,'short'),t,easeInOutSine),toGoal=sm(CUEW(1,'change of pace')+.3,CUEW(1,'rolls it across'),t,easeInOutSine);
 const C:V3=[m[0]-6-4*toGoal,2.4+.8*open-.3*close+1.2*toGoal,m[1]-12+2.5*close-2*toGoal],T:V3=[lerp(m[0]+5,95,.75*toGoal),.8,lerp(m[1]+1,-4,.75*toGoal)];
 return look(C,T,2000-250*open+250*close-350*toGoal);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),og=CUEW(1,'open grass'),ls=CUEW(1,'long strides'),fa=CUEW(1,'far ahead'),nd=CUEW(1,'Near a defender'),sh=CUEW(1,'short'),qt=CUEW(1,'quick touches'),cp=CUEW(1,'change of pace'),ra=CUEW(1,'rolls it across'),E=SECS(1);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*.6});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,under:()=>{
   // "open grass": a wide yellow ring of empty grass round him
   const[lx,lz]=posOf(MT,LEO,tau);ring(s,c,lx+2,lz,4.5,sm(og-.2,og+.3,t,easeOutBack)*(1-sm(ls,ls+.5,t)),Y,41);
   // "long strides, ball pushed far ahead": yellow arrows from touch to touch
   longTouches(s,c,tau,sm(ls-.2,ls+.3,t,easeOut)*(1-sm(nd,nd+.5,t)),PICK,-2.5);
   // "far ahead": a ring where the ball is running to (the next touch)
   const nx=TOUCHES.find(q=>q.tau>tau);if(nx&&!nx.short)ring(s,c,nx.P[0],nx.P[1],.8,sm(fa-.15,fa+.25,t,easeOutBack)*(1-sm(nd-.3,nd,t)),Y,47);
   // "Near a defender": the red danger ring round Rrahmani
   const[rx,rz]=posOf(MT,RRA,tau);ring(s,c,rx,rz,2.6,sm(nd-.15,nd+.3,t,easeOutBack)*(1-sm(cp+.4,cp+.9,t)),R,51);
   // "short, quick touches": the tick at every short touch
   shortTicks(s,c,tau,sm(sh-.3,sh,t)*(1-sm(ra,ra+.5,t)));
   // "change of pace": his burst past Rrahmani, blue
   groundArrow(s,c,runPts(LEO,BEAT_R-.1,SQUARE-.05),sm(cp-.1,cp+.6,t,easeOut)*(1-sm(ra+.3,ra+.8,t)),B,63);},
   after:({joints})=>{
    // "quick touches": a spark on his right boot at each short touch
    const r=joints.get(LEO);if(r&&t>qt-.5){const q=TOUCHES.find(q=>q.short&&Math.abs(tau-q.tau)<.1);if(q){const age=tau-q.tau+.1;sparkBurst(s,Y,r.joints.rToe[0],r.joints.rToe[1],Math.max(12,r.heightPx*.14),{n:6,seed:93,g:easeOutBack(clamp(age/.08))*(1-clamp((age-.12)/.08)),width:5});}}
    // "rolls it across": the square ball and the tap-in, yellow
    flight(s,c,ballPts(SQUARE,SHOT),sm(ra-.1,ra+.4,t,easeOut)*(1-sm(E-.6,E-.3,t)),Y,85);
    }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(MT,LEO,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:6.9,
};

// ---------------------------------------------------------------- 3 · the lesson, a raised camera behind the run: open space and long strides, then defenders close and short touches
const tau3=(t:number)=>{const S=SECS(2);return key(t,mono([[0,-7.6],[CUEW(2,'open space'),-6.9],[CUEW(2,'long strides'),-5.7],[CUEW(2,'defenders get close'),-2.7],[CUEW(2,'short touches'),-1.8],[S-.9,-.35],[S,SQUARE+.2]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(MT,LEO,Math.min(tau,SQUARE)),push=sm(0,SECS(2),t,easeInOutSine);
 const C:V3=[m[0]-17+3*push,10-1.5*push,m[1]-13],T:V3=[m[0]+9,0,m[1]+3];
 return look(C,T,1850+250*push);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),yt=CUEW(2,'Your turn'),os=CUEW(2,'open space'),ls=CUEW(2,'long strides'),dg=CUEW(2,'defenders get close'),sw=CUEW(2,'switch'),st=CUEW(2,'short touches'),E=SECS(2);
  stadium(s,c,v,t);
  ground(s,c,{});
  const fade=1-sm(E-.7,E-.35,t);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,smear:false,under:()=>{
   // "open space": a big yellow zone of empty grass in front of him
   const z0=posOf(MT,LEO,Math.min(tau+1.2,-3.4));ring(s,c,z0[0],z0[1]+1,7,sm(os-.2,os+.3,t,easeOutBack)*(1-sm(dg,dg+.5,t))*(1+.06*Math.sin(t*6)),Y,45);
   // "long strides": the long touches, yellow arrows
   longTouches(s,c,tau,sm(ls-.2,ls+.3,t,easeOut)*(1-sm(st+.5,st+1,t)),PICK,-2.5);
   // "defenders get close": red rings round the defenders near him (Di Lorenzo, then Rrahmani)
   const dw=sm(dg-.15,dg+.3,t,easeOutBack)*fade;const[dx,dz]=posOf(MT,DIL,tau),[rx,rz]=posOf(MT,RRA,tau);ring(s,c,dx,dz,1.6,dw*.8,R,51);ring(s,c,rx,rz,2.6,dw,R,53);
   // "short touches": the ticks, and a blue ring keeping the ball close to him
   shortTicks(s,c,tau,sm(st-.3,st+.1,t)*fade);
   const[lx,lz]=posOf(MT,LEO,tau);ring(s,c,lx+.4,lz,1.2,sm(sw-.1,sw+.3,t,easeOutBack)*fade*shortW(tau+.2),B,55);},
   after:()=>{
    // "Your turn": a small spark over the boot at the start
    const b=ballM(tau),q=pr(c,b);if(q&&t<yt+1)sparkBurst(s,Y,q[0],q[1],kAt(c,b)*.9,{n:7,seed:97,g:easeOutBack(clamp((t-yt+.1)/.25))*(1-clamp((t-yt-.5)/.4)),width:6});}});
 },
 still:5.9,
};

const film:RisoStory={
 id:'leao-signature',format:'11v11',title:"Leão's Long-Stride Dribble",theme:'Take long strides in open space, then short touches when defenders get close',
 ageNote:'Champions League quarter-final, Napoli 1–1 AC Milan, Stadio Diego Armando Maradona, 18 April 2023 (Milan\'s goal, 43rd minute): Leão\'s run from his own half and square ball for Giroud. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
