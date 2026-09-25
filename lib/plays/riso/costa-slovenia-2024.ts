/** Diogo Costa's three shoot-out saves in a row — Portugal 0–0 Slovenia (a.e.t., Portugal won 3–0 on penalties), UEFA Euro 2024 round of
 * 16, Frankfurt Arena (Waldstadion), Frankfurt, Monday 1 July 2024 — an iconic-play riso film (RisoStory, chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the shoot-out from WRITTEN accounts and
 * one agency photo (the broadcast footage itself was not reviewed), rendered as a riso print. Kept kind: Slovenia's kickers are brave and
 * their kicks were good ("Slovenia's penalties haven't been awful" — the Guardian); the film celebrates the saves, never the misses.
 *
 * SOURCES (read Sept 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2024 knockout stage" (raw wikitext, cached earlier by another film agent): 1 July 2024, 21:00, Waldstadion
 *    Frankfurt, 46,576, referee Daniele Orsato (ITA); 0–0 a.e.t.; the shoot-out box (Ronaldo ✓ Fernandes ✓ B. Silva ✓; Iličić ✗, Balkovec
 *    ✗, Verbič ✗: 3–0); the kit boxes (Portugal: red shirts, dark green shorts 238523, red socks; Slovenia: all white); line-ups + numbers
 *    (Costa GK 22; Oblak GK 1; Balkovec LB 3; Verbič 7, on 87'; Iličić 26, on 106'); Costa Man of the Match.
 *  - The Guardian, Scott Murray, "Portugal 0-0 Slovenia (aet; pens 3-0): Euro 2024, last 16 – as it happened", 1 July 2024: "The shootout
 *    will take place in front of Portugal's fans, but Slovenia will go first. Oblak and Diogo Costa shake hands"; "Josip Iličić whips his
 *    penalty towards the bottom right. Diogo Costa ... makes an outrageous save!"; "Jure Balkovec opens his body and steers towards the
 *    left-hand side of the net. Diogo Costa extends fully and tips around the post. Another excellent save! Slovenia's penalties haven't
 *    been awful; Diogo Costa has simply been sensational!"; "Benjamin Verbič goes left. Diogo Costa guesses correctly, and claws away!";
 *    "That's three in a row Costa has saved"; Ronaldo, Fernandes and Bernardo Silva scored in between (not shown).
 *    https://www.theguardian.com/football/live/2024/jul/01/portugal-v-slovenia-euro-2024-last-16-live
 *  - The Guardian, Ben Fisher, match report, 1 July 2024: Costa "making three extraordinary saves, the last of which thwarted Benjamin
 *    Verbic down to his right"; "the roof here was again closed"; Slovenia's fans behind Oblak's goal during the match.
 *    https://www.theguardian.com/football/article/2024/jul/01/portugal-slovenia-euro-2024-last-16-match-report
 *  - Reuters photo (Kai Pfaffenbach) in the live blog: Costa's save from Balkovec, seen from behind the goal: a full-length horizontal dive to
 *    his right, the ball at the leading glove beside the post; Costa in an all-black keeper kit (gold 22 on the shorts), orange-red gloves
 *    and boots; a second Reuters photo shows Portugal's red shirts / green shorts / red socks and Costa in black.
 *  - Wikipedia, "Josip Iličić": his "stronger left foot".  Wikipedia, "Diogo Costa": height 1.86 m; Man of the Match; the one-on-one save from
 *    Šeško in extra time; "saving all three penalties in the shootout, becoming the first ever goalkeeper in the European Championship to do"
 *    so.  (Wikipedia, "Benjamin Verbič" was fetched but does not state his stronger foot.)
 * CONFIRMED: date, Frankfurt, the closed roof, 0–0 after extra time; Slovenia kicked first, at the end in front of Portugal's fans; three
 *  saves in a row (Iličić 26, Balkovec 3, Verbič 7), the first keeper to save three in a Euro shoot-out; Portugal scored all three kicks;
 *  Iličić's kick went to the kicker's bottom right = Costa's LEFT, low; Balkovec's to the kicker's left = Costa's RIGHT, Costa at full
 *  stretch tips it round the post; Verbič's to the kicker's left = Costa's RIGHT ("down to his right"), clawed away; Iličić is left-footed;
 *  Costa 22 in black with gold number and orange-red gloves; Portugal red / green / red, Slovenia all white; Oblak and Costa shook hands.
 * INFERRED (illustrative, never named in the narration): Balkovec left-footed (a left-back) and Verbič right-footed; the heights of the kicks
 *  (Iličić ≈ .25 m, Balkovec ≈ 1.5 m near the post, Verbič ≈ 1.3 m — solved from the dives); the run-ups; the rebounds; Costa's getting up and fist-pumping after
 *  the third; which touchline the main camera sits on (the shoot-out goal is drawn on screen LEFT); Oblak's kit (printed green) and the
 *  referee's (printed yellow); the white kits' trim; where the lines stood in the centre circle; the arena as drawn (a rounded two-tier
 *  bowl, the closed membrane roof on radial cables and the four-sided video cube hanging over the centre circle), crowd colours, boards;
 *  every time in seconds and every camera placement.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME from the side OPPOSITE the Kahn film (the
 * closed roof and the hanging cube → the two lines in the centre circle → the goal → Costa on his line → Iličić: saved → broadcast wipe →
 * Balkovec: tipped round the post → wipe → Verbič: saved → Costa roars; a three-glove save-counter bug fills one glove per save);
 * ch2 = the slow-motion replay of the Balkovec save from a LOW PITCH-SIDE camera just out from Costa's right-hand post (he dives almost
 * toward the lens: the set, the sight line, the push-off, the full stretch, the tip, the ball curling round the post); ch3 = the lesson
 * from HIGH BEHIND THE NET: he lies where the last dive left him → a yellow reset loop → he walks back to a mark in the middle of his line
 * → gets set (steady ring) → stays patient while a kicker runs up (sight line) → moves only when the ball is kicked.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units,
 * so it frames from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts
 * (continuous silhouettes, `prev` secondary motion, a motion smear on the runs, kicks and dives); small figures print at `low` detail and
 * every figure inside a passage is capped. Handedness: right-handed world (x toward the goal, y up), athlete.ts's convention, no mirrored
 * projector; Costa faces −x, so his RIGHT is −z (the camera side in ch1) and his LEFT is +z. Inks: a Portugal set — yellow, deep red,
 * green, navy (grass is green ink, not the blue × yellow of the other shoot-out films). Cues keyed by withTiming; poses on twos. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines,dust} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type Build,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` match the voice's word onsets; `at` and `seconds` are ESTIMATES until the Kokoro
 * voice exists. withTiming matches a cue by its FIRST word, in order — no cue starts with a word that also appears between it and the
 * previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Three in a row',text:'Frankfurt, 2024. Portugal and Slovenia go to penalties. Diogo Costa dives and saves from Iličić. Balkovec shoots, and Costa tips it round the post. Then Verbič... saved again! Three saves in a row, a Euros first!',tail:2.2,
  cues:['Frankfurt','Portugal and Slovenia','go to penalties','Diogo Costa','saves from','Balkovec shoots','tips it','round the post','Then Verbič','saved again','Three saves','Euros first']},
 {label:'Round the post',text:'Watch the second save, slowly. Balkovec strikes it well. Costa stays set and still, waits for the kick, pushes off, stretches every finger and tips it round the post.',tail:2.1,
  cues:['Watch','Balkovec strikes','Costa stays','waits','pushes off','stretches','tips it','round the post']},
 {label:'Your turn',text:'Your turn, keepers. After every kick, save or goal, reset. Walk back to the middle, get set, then stay patient until the ball is kicked.',tail:2.3,
  cues:['Your turn','After every','save or goal','reset','Walk back','middle','get set','stay patient','ball is kicked']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py costa-slovenia-2024, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/costa-slovenia-2024/timing.json';
 * and set VOICE to `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times. */
import timingJson from '../../../public/plays/narration/costa-slovenia-2024/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ the Kokoro pace): .22 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.22+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.38;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('costa: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('costa: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors, framing
const Y='yellow',R='red',G='green',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
let LENS=1;
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Frankfurt Arena, roof closed: a rounded two-tier bowl, a membrane roof on radial cables, the video cube
/** the bowl's base line: a rounded rectangle round the pitch (x −113..8, z ±42, corner radius 16), sampled evenly, with outward normals */
const BOWL:{p:[number,number];n:[number,number]}[]=(()=>{const X0=-113,X1=8,Z=42,r=16,pts:[number,number][]=[];
 const arc=(cx:number,cz:number,a0:number)=>{for(let k=0;k<6;k++){const a=a0+k/6*Math.PI/2;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}};
 const edge=(a:[number,number],b:[number,number],n:number)=>{for(let k=0;k<n;k++)pts.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);};
 edge([X1,-Z+r],[X1,Z-r],6);arc(X1-r,Z-r,0);edge([X1-r,Z],[X0+r,Z],20);arc(X0+r,Z-r,Math.PI/2);edge([X0,Z-r],[X0,-Z+r],6);arc(X0+r,-Z+r,Math.PI);edge([X0+r,-Z],[X1-r,-Z],20);arc(X1-r,-Z+r,Math.PI*1.5);
 return pts.map((p,i)=>{const a=pts[(i-1+pts.length)%pts.length],b=pts[(i+1)%pts.length],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1;return{p,n:[tz/l,-tx/l] as [number,number]};});})();
const NB=BOWL.length,RISE=38,OUT=32;
/** a point on the bowl: segment position a (float index), rake b 0..1 */
function SB(a:number,b:number):V3{const i=Math.floor(a)%NB,j=(i+1)%NB,u=a-Math.floor(a),P=BOWL[i],Q=BOWL[j];
 const x=lerp(P.p[0],Q.p[0],u),z=lerp(P.p[1],Q.p[1],u),nx=lerp(P.n[0],Q.n[0],u),nz=lerp(P.n[1],Q.n[1],u);return[x+nx*OUT*b,1.2+RISE*b,z+nz*OUT*b];}
const HUB:V3=[-52.5,52,0];
/** the roof's inner edge (the closed membrane spans inside it) */
const INNER=(a:number):V3=>{const p=SB(a,0),d=[HUB[0]-p[0],HUB[2]-p[2]],l=Math.hypot(d[0],d[1])||1;return[p[0]+d[0]/l*14,45,p[2]+d[1]/l*14];};
const TIER_LO=.44,TIER_HI=.55;
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // under a closed roof at night: a dark navy house with a warm green-yellow bounce
 s.field(K,.62,.6);
 s.tone(G,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.18);
 const vis=(P:V3)=>toCam(c,P)[2]>3;
 // the membrane roof: paper panels between radial cables, lit from below (yellow screen), cables in navy; the hub
 const mem=new Path2D(),cab=new Path2D();
 for(let i=0;i<NB;i+=2){const a=INNER(i),b=INNER((i+2)%NB);if(!vis(a)&&!vis(b)&&!vis(HUB))continue;addPoly(mem,polyP(c,[a,b,HUB]));seg3(c,a,HUB,.5,cab);}
 s.knockout(mem,.9);s.tone(Y,mem,.2);s.tone(K,mem,.16);s.fill(K,cab,.75);
 // the four-sided video cube hanging over the centre circle
 {const cx=-52.5,cz=0,h=5.5,y0=26,y1=32.5,co:V3[]=[[cx-h,0,cz-h],[cx+h,0,cz-h],[cx+h,0,cz+h],[cx-h,0,cz+h]],faces=new Path2D(),glow=new Path2D(),glow2=new Path2D(),ropes=new Path2D();
  for(let k=0;k<4;k++){const a=co[k],b=co[(k+1)%4],mid:V3=[(a[0]+b[0])/2,(y0+y1)/2,(a[2]+b[2])/2],nrm:V3=[mid[0]-cx,0,mid[2]-cz];
   if(dot3(nrm,[c.eye[0]-mid[0],c.eye[1]-mid[1],c.eye[2]-mid[2]])<=0)continue;
   addPoly(faces,polyP(c,[[a[0],y0,a[2]],[b[0],y0,b[2]],[b[0],y1,b[2]],[a[0],y1,a[2]]]));
   const ins=(p:V3,q:V3,u:number,y:number):V3=>[lerp(p[0],q[0],u),y,lerp(p[2],q[2],u)];
   addPoly(k%2?glow2:glow,polyP(c,[ins(a,b,.08,y0+.6),ins(a,b,.92,y0+.6),ins(a,b,.92,y1-.6),ins(a,b,.08,y1-.6)]));
   seg3(c,[a[0],y1,a[2]],HUB,.25,ropes);}
  s.fill(K,ropes,.7);s.knockout(faces);s.fill(K,faces,.92);s.knockout(glow,.8);s.tone(R,glow,.55);s.tone(Y,glow,.4+.3*roar);s.knockout(glow2,.8);s.tone(G,glow2,.5);s.tone(Y,glow2,.4+.3*roar);}
 // the two tiers, the box level between them, the fronts
 const planes=new Path2D(),boxes=new Path2D(),wins=new Path2D(),fronts=new Path2D(),deck=new Path2D(),lamp=new Path2D();
 for(let i=0;i<NB;i++){const q0=SB(i,.5),q1=SB(i+1,.5);if(!vis(q0)&&!vis(q1))continue;
  addPoly(planes,polyP(c,[SB(i,0),SB(i+1,0),SB(i+1,TIER_LO),SB(i,TIER_LO)]));addPoly(planes,polyP(c,[SB(i,TIER_HI),SB(i+1,TIER_HI),SB(i+1,1),SB(i,1)]));
  addPoly(boxes,polyP(c,[SB(i,TIER_LO),SB(i+1,TIER_LO),SB(i+1,TIER_HI),SB(i,TIER_HI)]));
  if(i%2===0)addPoly(wins,polyP(c,[SB(i+.2,TIER_LO+.03),SB(i+.8,TIER_LO+.03),SB(i+.8,TIER_HI-.03),SB(i+.2,TIER_HI-.03)]));
  seg3(c,SB(i,0),SB(i+1,0),.5,fronts);seg3(c,SB(i,TIER_HI),SB(i+1,TIER_HI),.5,fronts);
  // the roof deck from the back of the upper tier in to the membrane edge, and the lamp ring on its lip
  const r0=add3(SB(i,1),[0,3,0]),r1=add3(SB(i+1,1),[0,3,0]);addPoly(deck,polyP(c,[r0,r1,INNER(i+1),INNER(i)]));
  if(i%3===0){const a=INNER(i),b=INNER(i+.5);seg3(c,add3(a,[0,-.8,0]),add3(b,[0,-.8,0]),1,lamp);}}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(G,planes,.22);
 s.knockout(boxes);s.fill(K,boxes,.88);s.knockout(wins,.7);s.tone(Y,wins,.75);
 // the crowd: Portugal red and green behind the shoot-out goal and round the sides, Slovenia white, green and navy at the far end
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],ROWS=15;
 for(let i=0;i<NB;i++){const q0=SB(i+.5,.5);if(!vis(q0))continue;const svn=q0[0]<-96;
  for(let j=0;j<ROWS;j++){const b0=(j+.5)/ROWS,b=b0<.5?b0*TIER_LO/.5:TIER_HI+(b0-.5)/.5*(1-TIER_HI);
   for(let k=0;k<4;k++){const h=hash(i*131+j*7919+k*17,5);if(h<.25)continue;const P=SB(i+(k+.5+(hash(i+j*31+k,9)-.5)*.5)/4,b),q=toCam(c,P);if(q[2]<NEAR)continue;
    const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,16),lift=roar>0&&!svn?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
    const ink=svn?(h<.6?0:h<.8?2:4):(h<.58?1:h<.8?2:h<.9?3:0);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(G,inks[2],.92);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.9);
 s.knockout(fronts,.6);
 s.knockout(deck);s.tone(K,deck,.7);s.tone(G,deck,.15);
 s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),q=pr(c,SB(r1*NB,.1+.8*r2));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 const sur=polyP(c,BOWL.map(b=>[b.p[0],0,b.p[1]] as V3));if(sur.length<3)return;const sp=polyPath(sur,true);
 s.knockout(sp);s.fill(G,sp,.8);s.tone(K,sp,.55);
 const g=polyP(c,[[-109,0,-37.5],[4,0,-37.5],[4,0,37.5],[-109,0,37.5]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(G,gp,.88);s.tone(Y,gp,.35);s.tone(K,gp,.1);
 // mowing stripes along the length, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(G,st,.3);s.tone(K,st,.08);
 // LED boards: navy with lit panels in yellow and red
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5,0,-36],[5,0,36]);board([-108,0,-37],[5,0,-37]);board([-108,0,37],[5,0,37]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(k%2?pr2:pn,polyP(c,[[4.9,.2,z],[4.9,.2,z+4.6],[4.9,.75,z+4.6],[4.9,.75,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(k%2?pr2:pn,polyP(c,[[x,.2,zz],[x+4.6,.2,zz],[x+4.6,.75,zz],[x,.75,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.tone(Y,pn,.6);s.knockout(pr2,.85);s.tone(R,pr2,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
let BZ=0;
function goal3(s:Sheet,c:Cam,bulge:number,netCov=.32,hl=0,meshCov=.7){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-BZ)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,netCov);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,meshCov);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
 // a highlight on Costa's right-hand post (the replay's "round the post")
 if(hl>0){const p=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.1,p);s.fill(Y,p,.95*hl);}
}

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[G,.06]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Portugal: red shirts, dark green shorts, red socks (numbers printed gold = yellow; inferred) */
const portugal=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[G,.92],socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:G,numberInk:Y,hairStyle:'short',...o});
/** Slovenia: all white (trim printed green: inferred), navy numbers */
const slovenia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:G,numberInk:K,hairStyle:'short',...o});
/** Diogo Costa, 1.86 m, No. 22: all-black keeper kit (navy screen), gold 22, orange-red gloves and boots (Reuters photos) */
const COSTA_B:Build={height:1.86,bulk:1.05};
const COSTA_ST:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:R,skin:SKIN_M,hair:K,line:K,trim:R,gloves:[R,.95],sleeves:'long',hairStyle:'short',number:22,numberInk:Y,shade:[G,.35],build:COSTA_B,seed:22};
const OBLAK_ST:AthleteStyle={shirt:[G,.75],shorts:[G,.75],socks:[G,.75],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.88},seed:61};
const REF_ST:AthleteStyle={shirt:[Y,.9],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,hairStyle:'bald',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- the kicks (τ = 0 is the contact)
const B0:V3=[-11,.11,0];
const KX=-.14;
const T_RUN0=-1.3,SD=1.0,RUN_END=-STRIKE_CONTACT*SD,RUN_L=3.0,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),POWER=.85;
type KickSpec={name:string;st:AthleteStyle;foot:'l'|'r';side:'l'|'r';height:number;tDive:number;diveS:number;tSave:number;kind:'parry'|'tip';reb:[number,number];reach?:number};
type Kick=KickSpec&{dir:[number,number];yaw:number;pc:[number,number];H:V3;hand:'l'|'r'};
/** Iličić (26, left foot): low to Costa's LEFT; Balkovec (3, left foot, inferred): towards Costa's RIGHT post, tipped round it at full
 * stretch; Verbič (7, right foot, inferred): low-ish to Costa's RIGHT, clawed away. [3] is the lesson's illustrative kick (no name). */
const SPECS:KickSpec[]=[
 {name:'Iličić',st:slovenia({number:26,build:{height:1.9},hairStyle:'balding',seed:26}),foot:'l',side:'l',height:.22,tDive:-.05,diveS:.95,tSave:.4,kind:'parry',reb:[-3.4,3.6]},
 {name:'Balkovec',st:slovenia({number:3,build:{height:1.8},seed:3}),foot:'l',side:'r',height:.55,tDive:-.06,diveS:1,tSave:.44,kind:'tip',reb:[3.4,-7.4],reach:.8},
 {name:'Verbič',st:slovenia({number:7,build:{height:1.73},seed:7}),foot:'r',side:'r',height:.35,tDive:-.05,diveS:.95,tSave:.42,kind:'parry',reb:[-3.6,-3.2]},
 {name:'',st:slovenia({build:{height:1.8},seed:9}),foot:'r',side:'r',height:.3,tDive:-.04,diveS:.95,tSave:.44,kind:'parry',reb:[-3.4,-3]},
];
const KPLACE:Place={x:KX,z:0,yaw:Math.PI};
/** the dive; Balkovec's is launched harder (extra reach toward the post) with the leading arm fully straight */
function diveAt(k:KickSpec,tau:number):Pose{const ph=clamp((tau-k.tDive)/k.diveS),p=keeperDive(ph,{side:k.side,height:k.height});
 if(k.reach){const w=sm(.2,.55,ph);p.dz+=k.reach*w;}return p;}
const KICKS:Kick[]=SPECS.map(k=>{
 const sg=k.foot==='r'?1:-1,n=Math.hypot(1,.36),dir:[number,number]=[1/n,sg*.36/n],yaw=yawTo(0,0,dir[0],dir[1]);
 const sk=solve(strike(STRIKE_CONTACT,{foot:k.foot,power:POWER}),k.st.build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe,tg:[number,number]=[B0[0]-dir[0]*.1,B0[2]-dir[1]*.1];
 // the ball meets the LEADING glove (the one furthest along the dive), a ball radius in front of the palm
 const ks=solve(diveAt(k,k.tSave),COSTA_B,KPLACE),sgn=k.side==='r'?-1:1,hand:'l'|'r'=(ks.lHa[2]*sgn>ks.rHa[2]*sgn)?'l':'r',h=hand==='l'?ks.lHa:ks.rHa;
 const H:V3=k.kind==='tip'?[h[0]-.12,h[1],h[2]+sgn*.02]:[h[0]-.13,h[1],h[2]-sgn*.04];
 return{...k,dir,yaw,pc:[tg[0]-toe[0],tg[1]-toe[2]],H,hand};
});
const REB_T=.5,ROLL_T=1.8;
function ballAt(i:number,tau:number):V3{
 const k=KICKS[i];
 if(tau<=0)return B0;
 if(tau<k.tSave){const v=tau/k.tSave,u=1.1*v-.1*v*v,p=mix3(B0,k.H,u);p[1]+=.22*4*u*(1-u)*Math.min(1,k.H[1]);return p;}
 const a=tau-k.tSave;
 if(k.kind==='tip'){// the fingertips turn it sideways, outside the post, then it drops behind the goal line and rolls away
  const Q1:V3=[k.H[0]+.25,k.H[1]+.12,-4.15],Q2:V3=[1.7,.11,-5.1],D2:V3=[k.reb[0],.11,k.reb[1]];
  if(a<.12)return mix3(k.H,Q1,a/.12);
  if(a<.5){const u=(a-.12)/.38,p=mix3(Q1,Q2,u);p[1]=lerp(Q1[1],.11,u*u)+.35*u*(1-u);return p;}
  const u=easeOut(clamp((a-.5)/ROLL_T)),p=mix3(Q2,D2,u);p[1]=.11+.4*Math.abs(Math.sin(u*Math.PI*1.5))*(1-u);return p;}
 const R1:V3=[lerp(k.H[0],k.reb[0],.55),.11,lerp(k.H[2],k.reb[1],.55)],R2:V3=[k.reb[0],.11,k.reb[1]];
 if(a<REB_T){const u=a/REB_T,p=mix3(k.H,R1,u);p[1]=lerp(k.H[1],.11,u)+.8*u*(1-u);return p;}
 const u=easeOut(clamp((a-REB_T)/ROLL_T));return mix3(R1,R2,u);
}
const spinAt=(i:number,tau:number)=>tau<=0?0:-TAU*5*Math.min(tau,KICKS[i].tSave)+TAU*1.4*Math.max(0,tau-KICKS[i].tSave);

// ---------------------------------------------------------------- the kickers
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:10,rKnee:16,lAnk:0,rAnk:-4,lean:4,pitch:1,neckP:-2,lShA:12,rShA:12,lShF:2,rShF:0,lElb:16,rElb:18});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
/** after the save: hands on hips, head a little down — disappointed, not mocked */
const P_HIPS=posed({lHipF:4,rHipF:6,lKnee:8,rKnee:10,lean:6,neckP:18,lShA:34,rShA:34,lShF:-14,rShF:-14,lElb:96,rElb:96,lShR:30,rShR:30});
const gPos=(k:Kick,g:number):[number,number]=>[k.pc[0]+k.dir[0]*g,k.pc[1]+k.dir[1]*g];
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function takerPose(i:number,tau:number,it:number):Pose{
 const k=KICKS[i];
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.1+i),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.3,T_RUN0,tau));p.lean+=.02*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.2*Math.pow(u,.9),{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.2+(tau-RUN_END)*1.5,{speed:.55});
 let p=blendPose(run,strike(Math.min(1,us),{foot:k.foot,power:POWER}),sm(RUN_END,RUN_END+.14,tau));
 if(tau>k.tSave+.4)p=blendPose(p,P_HIPS,sm(k.tSave+.4,k.tSave+1,tau));
 return p;
}
function takerPlace(i:number,tau:number):Place{
 const k=KICKS[i];let g:number;
 if(tau<=T_RUN0)g=G_MARK;
 else if(tau<RUN_END){const u=runU(tau);g=G_MARK+RUN_L*(1.25*u-.25*u*u);}
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.6*(1-Math.pow(1-clamp(tau/.6),2));
 const[x,z]=gPos(k,g);return{x,z,yaw:k.yaw};
}

// ---------------------------------------------------------------- Costa: set, patient, the dive, back up — after the third, a roar on the spot
const SET=posed({lHipF:22,rHipF:22,lKnee:34,rKnee:34,lHipA:16,rHipA:16,lean:14,pitch:4,lShA:36,rShA:36,lShF:26,rShF:26,lElb:40,rElb:40,lHand:1,rHand:1,neckP:-10});
const ROAR=posed({lHipF:10,rHipF:14,lKnee:20,rKnee:24,lHipA:16,rHipA:16,lean:-10,neckP:-24,lShA:70,rShA:70,lShF:40,rShF:40,lElb:120,rElb:120});
const upOf=(k:KickSpec)=>{const e=diveAt(k,1e3),p=blendPose(stand(),SET,.3);p.dx=e.dx;p.dz=e.dz;return p;};
const landed=(k:KickSpec):[number,number]=>{const e=diveAt(k,1e3);return[KX-e.dx,-e.dz];};
function costaAt(i:number,tau:number,it:number,o:{roar?:boolean}={}):{pose:Pose;place:Place}{
 const k=KICKS[i],tUp0=k.tDive+k.diveS+.2,tUp1=tUp0+.6;
 let p=blendPose(SET,keeperSet(it*1.2),sm(T_RUN0-.2,T_RUN0+.4,tau));
 if(tau>k.tDive)p=blendPose(p,diveAt(k,tau),sm(k.tDive,k.tDive+.06,tau));
 if(tau>tUp0)p=blendPose(p,upOf(k),sm(tUp0,tUp1,tau,easeInOutSine));
 if(o.roar&&tau>tUp1){const r={...ROAR,dx:p.dx,dz:p.dz},pump=.5+.5*Math.sin((tau-tUp1)*9);r.lElb=lerp(100,135,pump);r.rElb=lerp(135,100,pump);p=blendPose(p,r,sm(tUp1,tUp1+.35,tau,easeOutBack));}
 return{pose:p,place:KPLACE};
}
const costaXZ=(i:number,tau:number):V3=>{const s=costaAt(i,tau,0),sk=solve(s.pose,COSTA_B,s.place);return[sk.pelvis[0],0,sk.pelvis[2]];};

// ---------------------------------------------------------------- everyone else: Oblak, the officials, the players in the centre circle
type Role='oblak'|'ref'|'ar'|'por'|'svn';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const LINE:Actor[]=[];
{const por=[[7,SKIN_L],[8,SKIN_L],[10,SKIN_L],[4,SKIN_D],[19,SKIN_D],[6,SKIN_L]] as [number,InkFill[]][],svn=[[11,SKIN_L],[6,SKIN_L],[22,SKIN_L],[2,SKIN_L],[5,SKIN_L],[19,SKIN_L]] as [number,InkFill[]][];
 por.forEach(([n,sk],i)=>LINE.push({name:'Portugal '+n,role:'por',st:portugal({number:n,skin:sk,build:{height:1.8+.03*(i%2)},seed:40+i,detail:'low',hairStyle:n===19?'curly':'short'}),x:-52.5+.2*(i%2),z:-5.2+i*.64,phase:i*.23}));
 svn.forEach(([n,sk],i)=>LINE.push({name:'Slovenia '+n,role:'svn',st:slovenia({number:n,skin:sk,build:{height:1.84+.02*(i%2)},seed:50+i,detail:'low'}),x:-52.5-.2*(i%2),z:.8+i*.64,phase:i*.31}));}
const ACTORS:Actor[]=[
 {name:'Oblak',role:'oblak',st:OBLAK_ST,x:.4,z:20.6,phase:.2},
 {name:'Orsato',role:'ref',st:REF_ST,x:-7.5,z:9.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,hairStyle:'short',seed:31},x:.6,z:-9.4,phase:.1},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
function actorAt(a:Actor,it:number,win:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'oblak':{const p=blendPose(stand(),LINKED,.3+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ref':case 'ar':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'por':{if(win<=0)return{pose:blendPose(LINKED,stand(),.2+.1*br),place:{x:a.x,z:a.z,yaw:toBall}};
   return{pose:blendPose(LINKED,celebrate(it*.9+a.phase,{kind:'arms'}),sm(0,.3,win)),place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{const p=blendPose(LINKED,stand(),.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBallAt(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;from?:V3|null}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.from){const a=pr(c,o.from);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(220,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:G,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,i:number,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let j=0;j<=n;j++){const p=pr(c,ballAt(i,lerp(ta,tb,j/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={i:number;it:number;win?:number;roar?:boolean;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;line?:boolean;actors?:boolean;taker?:boolean;costa?:(tau:number)=>{pose:Pose;place:Place}};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&px>170)return{...st,detail:'mid'};return st;};
 const i=e.i,k=KICKS[i],win=e.win??0,costa=e.costa??((tt:number)=>costaAt(i,tt,tt,{roar:e.roar}));
 if(e.taker!==false){const pl=takerPlace(i,tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=takerPose(i,tp,e.it),prev={pose:takerPose(i,tpPrev,e.it-1/12),place:takerPlace(i,tpPrev)};
  drawPlayer(s,pose,c,detailFor(k.st,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.4);}});}
 {const cur=costa(tp),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=costa(tpPrev);drawPlayer(s,cur.pose,c,detailFor(COSTA_ST,d,true),cur.place,prev,!!e.smear&&tp>k.tDive&&tp<k.tDive+k.diveS*.8);}});}
 if(e.actors!==false)for(const a of ACTORS){if(!e.line&&(a.role==='por'||a.role==='svn'))continue;const cur=actorAt(a,e.it,win),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,e.it-1/12,win);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const P=ballAt(i,tau),bq=toCam(c,P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBallAt(s,c,P,spinAt(i,tau),{min:e.minBall,from:e.lines&&e.prevT!==undefined&&tau>0&&tau<k.tSave+.6?ballAt(i,e.prevT):null});}});
 items.sort((a,b)=>b.d-a.d).forEach(q=>q.draw());
}

// ---------------------------------------------------------------- shots, wipes, overlays
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** the broadcast wipe between kicks: diagonal red and green bands sweep across (Portugal's TV graphics colours) */
function wipe(s:Sheet,amt:number,seed:number){if(amt<=.02)return;const v=view(s),r=rng(seed),a=new Path2D(),b=new Path2D();
 for(let i=0;i<9;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);(i%2?a:b).addPath(ribbon([[x0-L,y+L*.35],[x0+L,y-L*.35]],24+r()*44,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.knockout(a,.3*amt);s.tone(R,a,.8*amt);s.knockout(b,.3*amt);s.tone(G,b,.8*amt);}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
function groundRing(s:Sheet,c:Cam,at:V3,r:number,jag:number,w:number,ink:string,cov:number,t:number,sweep=1){
 const pts:Pt[]=[],n=Math.max(8,Math.round(48*sweep));for(let i=0;i<n;i++){const a=i/48*TAU,k=1+jag*(.22*Math.sin(a*9+t*7)+.12*Math.sin(a*14-t*11)),p=pr(c,[at[0]+Math.cos(a)*r*k,.02,at[2]+Math.sin(a)*r*k]);if(p)pts.push(p);}
 if(pts.length<6)return;const rr=ribbon(pts,w,{close:sweep>=1,seed:43,taper:sweep>=1?0:.3,wobble:jag*2+.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
function sightLine(s:Sheet,a:Pt,b:Pt,w:number,u1:number){
 const rb=new Path2D(),n=9;for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
 s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);
}
/** a keeper's glove (cuff, palm, four fingers, thumb) as one path */
function glovePath(cx:number,cy:number,r:number):Path2D{const p=polyPath(blob(cx,cy+r*.15,r*.52,r*.5,3,{amp:.03,n:16}),true);
 for(let k=0;k<4;k++){const x=cx+(-.39+.26*k)*r,top=cy-(k===1||k===2?.95:.8)*r;p.addPath(ribbon([[x,cy-.05*r],[x,top]],.24*r,{taper:0,wobble:0,seed:k}));}
 p.addPath(ribbon([[cx-.42*r,cy+.3*r],[cx-.8*r,cy-.1*r]],.26*r,{taper:0,wobble:0,seed:7}));
 p.addPath(polyPath([[cx-.5*r,cy+.6*r],[cx+.5*r,cy+.6*r],[cx+.46*r,cy+1.05*r],[cx-.46*r,cy+1.05*r]],true));return p;}
/** the save-counter bug (top left): a dark chip with three glove slots; a glove prints in as each save is made */
function counterBug(s:Sheet,fills:number[],o:{show?:number;pulse?:number}={}){
 const{show=1,pulse=0}=o;if(show<=0)return;
 const x0=-s.W/2+50,y0=-s.H/2+44,r=30,gap=76,w=gap*3+62,h=2*r+44,sc=easeOutBack(clamp(show));
 const tx=(x:number,y:number):Pt=>[x0+(x-x0)*sc,y0+(y-y0)*sc];
 const box=polyPath(blob(x0+w/2*sc,y0+h/2*sc,w/2*sc,h/2*sc,9,{amp:.03,n:22}),true);s.knockout(box,.9);s.tone(K,box,.82);
 // a small Portugal chip: green over red
 const c0=tx(x0+22,y0+h/2),chip=polyPath(blob(c0[0],c0[1],12*sc,18*sc,5,{amp:.05,n:12}),true);s.fill(R,chip,.95);s.fill(G,polyPath(blob(c0[0]-4*sc,c0[1],7*sc,16*sc,6,{amp:.05,n:10}),true),.95);
 const empty=new Path2D();
 fills.forEach((f,i)=>{const[cx,cy]=tx(x0+76+i*gap,y0+h/2-6),rr=r*sc*(f>0?.6+.4*easeOutBack(clamp(f))+.12*pulse:.9);
  const gp=glovePath(cx,cy,rr);if(f<=0){empty.addPath(gp);return;}
  s.knockout(gp);s.fill(R,gp,.95);s.fill(Y,polyPath(blob(cx,cy+rr*.15,rr*.34,rr*.3,4,{amp:.03,n:12}),true),.9);s.stroke(K,gp,2.4,.85);
  if(f<1)sparkBurst(s,Y,cx,cy,rr*3,{n:8,seed:60+i,g:easeOutBack(clamp(f*2))*(1-clamp(f*2-1)),width:Math.max(3,rr*.2)});});
 s.stroke(Y,empty,2.6,.6);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera (opposite side to the Kahn film), real time, three kicks
function sched(){
 const tA=CUE(0,'saves from')-KICKS[0].tSave-.1,tB=CUE(0,'tips it')-KICKS[1].tSave-.05,tC=CUE(0,'saved again')-KICKS[2].tSave-.08;
 const cutB=Math.max(tA+KICKS[0].tSave+.75,Math.min(CUE(0,'Balkovec')-.25,tB+T_RUN0-.45));
 const cutC=Math.max(tB+KICKS[1].tSave+1.1,Math.min(CUE(0,'Then')-.1,tC+T_RUN0-.8));
 return{t0:[tA,tB,tC],cutB,cutC};
}
const seg1=(t:number)=>{const S=sched(),i=t<S.cutB?0:t<S.cutC?1:2;return{i,tau:Math.max(T_RUN0-4,t-S.t0[i])};};
const P1:V3=[-36,22,-56];
const FR:Shot={P:P1,T:[-5.1,1.1,-.3],fov:8.8};
function cam1(t:number):Cam{
 const S=sched(),[,,tC]=S.t0,kC=KICKS[2];
 const follow=():Shot=>{const g=costaXZ(2,Math.max(0,t-tC));return{P:P1,T:add3(g,[-1,1,0]),fov:8.2};};
 return plan(t,[
  [0,0,()=>({P:P1,T:[-54,24,16],fov:52})],
  [CUE(0,'Portugal and')-.2,1.4,()=>({P:P1,T:[-52.5,2,0],fov:13})],
  [CUE(0,'go to penalties')-.2,1.1,()=>({P:P1,T:[-6,1.2,0],fov:14})],
  [CUE(0,'Diogo Costa')-.25,.9,()=>({P:P1,T:[KX,1.1,0],fov:4.6})],
  [Math.max(CUE(0,'Diogo Costa')+.8,S.t0[0]+T_RUN0-.25),.8,()=>FR],
  [S.t0[1]+KICKS[1].tSave-.1,.6,()=>({P:P1,T:[-1,1.2,-2.2],fov:7.4})],
  [S.cutC,.01,()=>FR],
  [tC+kC.tSave+.3,.8,follow],
  [CUE(0,'Three saves')-.1,1.4,()=>{const f=follow();return{...f,T:add3(f.T,[-3,0,0]),fov:15};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),S=sched(),{i,tau}=seg1(t),tt=twos(t),tp=seg1(tt).i===i?seg1(tt).tau:tau,tpp=seg1(tt-1/12).i===i?seg1(tt-1/12).tau:tp-1/12;
  const tSv=S.t0[i]+KICKS[i].tSave,win=i===2?sm(tSv+.3,tSv+1.6,t):0;
  stadium(s,c,t,{roar:sm(tSv,tSv+.4,t)*(i===2?1:.6),flash:sm(tSv+.05,tSv+.3,t)*(i===2?1:.4)*(1-sm(tSv+2.5,tSv+3.5,t))});
  ground(s,c);
  play(s,c,tau,tp,tpp,{i,it:tt,win,roar:i===2,minBall:12,lines:true,prevT:tau-.06,line:true});
  wipe(s,bump(S.cutB-.12,S.cutB+.3,t)+bump(S.cutC-.12,S.cutC+.3,t),11+i);
  // the save counter: one glove per save; it pulses on "Three saves ... a Euros first"
  const fills=S.t0.map((t0,k)=>clamp((t-(t0+KICKS[k].tSave))/.5,-1,1));
  counterBug(s,fills,{show:sm(CUE(0,'Diogo Costa')-.2,CUE(0,'Diogo Costa')+.4,t),pulse:bump(CUE(0,'Three saves')-.1,CUE(0,'Euros first')+.8,t)});
 },
 aperture(t){const c=cam1(t),{i,tau}=seg1(t),g=costaXZ(i,tau),q=pr(c,add3(g,[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],Math.max(14,kAt(c,g)*.5),12);},
 still:14,
};

// ---------------------------------------------------------------- 2 · slow-motion replay of the Balkovec save, low pitch-side just out from Costa's right-hand post
const K2=1;
const tau2=(t:number)=>{const k=KICKS[K2];return key(t,mono([[0,T_RUN0-.9],[CUE(1,'Balkovec'),T_RUN0-.45],[CUE(1,'Costa stays'),T_RUN0+.2],[CUE(1,'waits'),-.12],[CUE(1,'pushes off'),-.02],[CUE(1,'stretches'),k.tSave-.08],[CUE(1,'tips it'),k.tSave+.02],[CUE(1,'round the post'),k.tSave+.2],[CUE(1,'round the post')+1.2,k.tSave+.75],[SECS(1),2.6]]),linear);};
const E2:V3=[-6.2,.75,-9.6];
function cam2(t:number):Cam{
 const k=KICKS[K2];
 return plan(t,[
  [0,0,()=>({P:add3(E2,[-1,.6,-4]),T:[-5.5,.9,0],fov:44})],
  [CUE(1,'Balkovec')-.25,1,()=>({P:add3(E2,[-1.2,.1,.6]),T:[-12.5,1,.6],fov:17})],
  [CUE(1,'Costa stays')-.2,.9,()=>({P:add3(E2,[.6,0,.4]),T:[KX,1,-.2],fov:15})],
  [CUE(1,'waits')-.2,.9,()=>({P:add3(E2,[-1,.6,-4]),T:[-5.5,.9,0],fov:44})],
  [CUE(1,'pushes off')-.2,.6,()=>({P:add3(E2,[1.4,-.1,.6]),T:[-.4,.9,-1.6],fov:24})],
  [CUE(1,'stretches')-.2,.5,()=>({P:add3(E2,[1.8,-.15,.9]),T:add3(k.H,[0,-.1,.4]),fov:15})],
  [CUE(1,'round the post')-.1,.8,()=>({P:add3(E2,[2.2,.1,.4]),T:[.4,.9,-3.9],fov:22})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),k=KICKS[K2];
  const cs=CUE(1,'Costa stays'),wt=CUE(1,'waits'),po=CUE(1,'pushes off'),st=CUE(1,'stretches'),ti=CUE(1,'tips it'),rp=CUE(1,'round the post');
  stadium(s,c,t,{roar:sm(ti,ti+.4,t),flash:.7*bump(ti,ti+1.4,t)});
  ground(s,c,{goal:false});
  goal3(s,c,0,.32,sm(rp-.2,rp+.2,t)*(1-sm(SECS(1)-1,SECS(1)-.4,t)));
  // "stays set and still": a steady yellow ring round his feet
  const kp:V3=[KX,0,0],still=sm(cs-.1,cs+.5,t)*(1-sm(po-.2,po,t));
  if(still>.02)groundRing(s,c,kp,.85,0,Math.max(6,kAt(c,kp)*.05),Y,still,tt);
  // "pushes off": a yellow arrow on the grass toward his right post, dust from the push foot
  const pa=sm(po-.1,po+.35,t,easeOut)*(1-sm(rp,rp+.6,t));
  if(pa>.02){const a:V3=[KX-.25,.03,-.2],b:V3=[KX-.35,.03,-.2-2.6*pa];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(7,kAt(c,a)*.07),Y,.95);}
  const pd=t-po;if(pd>0&&pd<.9){const q=pr(c,[KX,.05,.35]);if(q)dust(s,G,q[0],q[1],kAt(c,[KX,0,0])*.5*(.5+pd),10,{seed:31,size:kAt(c,[KX,0,0])*.05,cov:.8*(1-pd/.9),spread:1});}
  // the replay trail: the shot and its turn round the post
  if(tau>.02&&tau<k.tSave+1.2){const pts=pathPts(c,K2,Math.max(0,tau-.8),tau,22),fade=1-sm(k.tSave+.7,k.tSave+1.2,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(K2,tau))*.15);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{i:K2,it:tt,smear:true,minBall:12,actors:false});
  const kn=costaAt(K2,tp,tt),sk=solve(kn.pose,COSTA_B,kn.place);
  // "waits for the kick": a dashed sight line from his eyes to the ball, held until the strike
  const sl=sm(wt-.1,wt+.45,t,easeOutBack)*(1-sm(po-.15,po+.05,t));
  if(sl>.02){const a=pr(c,sk.face),b=pr(c,B0);if(a&&b)sightLine(s,a,b,Math.max(8,kAt(c,kp)*.04),clamp(sl));}
  // "stretches every finger": a yellow reach line from his shoulder out past the open glove
  const sr=sm(st-.1,st+.2,t)*(1-sm(ti+.3,ti+.8,t));
  if(sr>.02){const sh=k.hand==='l'?sk.lSh:sk.rSh,hd=k.hand==='l'?sk.lHa:sk.rHa,a=pr(c,sh),b=pr(c,add3(hd,[(hd[0]-sh[0])*.25,(hd[1]-sh[1])*.25,(hd[2]-sh[2])*.25]));
   if(a&&b){const rb=ribbon([a,b],Math.max(5,kAt(c,hd)*.035),{taper:.6,wobble:0,seed:4});s.knockout(rb,.8*sr);s.fill(Y,rb,.9*sr);}}
  // "tips it": a spark at the fingertips
  const age=tau-k.tSave,hq=pr(c,k.H);if(hq&&age>-.02&&age<.35){const r=kAt(c,k.H);sparkBurst(s,Y,hq[0],hq[1],r*.55,{n:10,seed:83,g:easeOutBack(clamp((age+.02)/.06))*(1-clamp((age-.2)/.15)),width:Math.max(6,r*.045)});}
  wipe(s,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),g=costaXZ(K2,tau2(t)),q=pr(c,add3(g,[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],Math.max(14,kAt(c,g)*.35),12);},
 still:7.2,
};

// ---------------------------------------------------------------- 3 · the lesson, from high behind the net: reset → walk back to the middle → get set → stay patient → go on the kick
const KL=3,LAND_K=KICKS[2];
const LAND=landed(LAND_K);
const MID:V3=[KX,0,0];
/** the lesson's contact time (the illustrative kick is struck on "kicked") */
const tKick=()=>CUE(2,'ball is kicked')+.5;
function lessonCosta(t:number):{pose:Pose;place:Place}{
 const rs=CUE(2,'reset'),wb=CUE(2,'Walk back'),gs=CUE(2,'get set');
 const up0=rs+.15,up1=up0+.8,w0=Math.max(wb,up1),w1=Math.max(w0+1.5,Math.min(gs-.1,w0+2.2)),tau=t-tKick();
 const lying=diveAt(LAND_K,1e3);
 if(t<up0)return{pose:lying,place:KPLACE};
 const gotUp={...upOf(LAND_K)};
 if(t<w0)return{pose:blendPose(lying,gotUp,sm(up0,up1,t,easeInOutSine)),place:KPLACE};
 // walking back along the line from where the dive left him to the middle (dx/dz moved into the place)
 const upNo={...gotUp,dx:0,dz:0};
 if(t<w1+.4){const u=easeInOutSine(clamp((t-w0)/(w1-w0))),x=lerp(LAND[0],MID[0],u),z=lerp(LAND[1],MID[2],u),walkYaw=yawTo(LAND[0],LAND[1],MID[0],MID[2]);
  const walking=blendPose(upNo,runCycle((t-w0)*1.5,{speed:0}),.55*bump(w0-.1,w1+.1,t));walking.lean*=.6;
  return{pose:walking,place:{x,z,yaw:lerpAng(lerpAng(Math.PI,walkYaw,sm(w0,w0+.3,t)),Math.PI,sm(w1-.3,w1+.2,t))}};}
 // set and patient, then the dive on the kick
 let p=blendPose(upNo,blendPose(SET,keeperSet(t*1.2),.6),sm(w1+.2,Math.max(w1+.5,gs+.2),t));
 const k=KICKS[KL];if(tau>k.tDive)p=blendPose(p,diveAt(k,tau),sm(k.tDive,k.tDive+.06,tau));
 return{pose:p,place:KPLACE};
}
function cam3r(t:number):Cam{
 const rs=CUE(2,'reset'),wb=CUE(2,'Walk back'),sp=CUE(2,'stay patient'),bk=CUE(2,'ball is kicked');
 return plan(t,[
  [0,0,()=>({P:[5.6,3.8,-4.2],T:[-3,.5,-1.2],fov:34})],
  [rs-.3,.9,()=>({P:[4.8,3.3,-4.4],T:[LAND[0]-.8,.4,LAND[1]],fov:24})],
  [wb,1.8,()=>({P:[5.2,3.6,-2.2],T:[-2.2,.6,-.4],fov:28})],
  [sp-.3,1.2,()=>({P:[6.5,2.6,-1.2],T:[-5,.2,0],fov:36})],
  [bk-.1,.8,()=>({P:[6.2,2.5,-1],T:[-4,.3,-.4],fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3r(t),tt=twos(t);
  const ae=CUE(2,'After every'),sg=CUE(2,'save or goal'),rs=CUE(2,'reset'),wb=CUE(2,'Walk back'),md=CUE(2,'middle'),gs=CUE(2,'get set'),sp=CUE(2,'stay patient'),bk=CUE(2,'ball is kicked'),E=SECS(2);
  const tK=tKick(),tau=t-tK,taup=tt-tK,taupp=tt-1/12-tK;
  BZ=1.2;const bul=sm(sg+.35,sg+.5,t)*Math.exp(-Math.max(0,t-sg-.5)*2.6);
  stadium(s,c,t,{roar:.3*bump(sg,sg+1.2,t)});
  ground(s,c,{goal:false});
  const kp:V3=[LAND[0],0,LAND[1]],w=Math.max(7,kAt(c,MID)*.06);
  // "After every kick": the last save's ball rolls away from his gloves
  const roll=clamp((t-ae+.6)/2.2);
  // "reset": a yellow loop drawn round him on the grass (it closes as the arrow comes round)
  const rl=sm(rs-.1,rs+.6,t)*(1-sm(wb+.4,wb+1,t));
  if(rl>.02){groundRing(s,c,[kp[0]-.3,0,kp[2]+.7],1.35,0,w,Y,Math.min(1,rl*1.4),tt,clamp(rl*1.05));
   const a=Math.min(1,rl)*TAU*.97,cx=kp[0]-.3,cz=kp[2]+.7,h:V3=[cx+Math.cos(a)*1.35,.03,cz+Math.sin(a)*1.35],h0:V3=[cx+Math.cos(a-.35)*1.35,.03,cz+Math.sin(a-.35)*1.35];arrow3(s,c,[h0,h],w*.9,Y,Math.min(1,rl*1.4));}
  // "Walk back to the middle": dashed footsteps along the line, and a yellow mark on the middle of the goal line
  const fp=sm(wb-.2,wb+.6,t)*(1-sm(E-.9,E-.4,t));
  if(fp>.02){const steps=new Path2D();for(let j=1;j<7;j++){const u=j/7;if(u>fp*1.2)break;const x=lerp(LAND[0],MID[0],u)-.25,z=lerp(LAND[1],MID[2],u)+(j%2?.12:-.12),q=polyP(c,[[x-.14,.02,z-.06],[x+.14,.02,z-.06],[x+.14,.02,z+.06],[x-.14,.02,z+.06]]);addPoly(steps,q);}s.knockout(steps,.8);s.fill(Y,steps,.85*fp);}
  const mk=sm(md-.15,md+.3,t,easeOutBack)*(1-sm(E-.9,E-.4,t));
  if(mk>.02){const mm=new Path2D();seg3(c,[KX-.05,.02,-.45*mk],[KX-.05,.02,.45*mk],.14,mm);seg3(c,[KX-.5*mk,.02,0],[KX+.3*mk,.02,0],.14,mm);s.knockout(mm);s.fill(Y,mm,.95);
   const age=t-md;if(age>-.1&&age<.6){const q=pr(c,MID);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,MID)*.6,{n:9,seed:77,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(5,w*.5)});}}
  // "get set": a steady ring at the middle; "stay patient": it holds, calm, while the kicker runs up
  const set=sm(gs-.1,gs+.4,t)*(1-sm(tK+.1,tK+.3,t));
  if(set>.02)groundRing(s,c,MID,.8,0,w,Y,set,tt);
  // the kicker (illustrative) and the ball on the spot; Costa
  const costaFn=(x:number)=>lessonCosta(x+tK);
  play(s,c,tau,taup,taupp,{i:KL,it:tt,smear:true,minBall:12,actors:false,costa:costaFn});
  if(roll<1&&t<rs+1.5){const P:V3=[lerp(LAND[0]-.6,-4.2,easeOut(roll)),.11,lerp(LAND[1]-.3,-5.2,easeOut(roll))];drawBallAt(s,c,P,-roll*TAU*3,{min:10});}
  // the net over them, seen from behind; on "save or goal" it bulges once (a goal counts the same: reset)
  goal3(s,c,bul,.16,0,.38);
  const sgA=t-sg;if(sgA>-.1&&sgA<.7){const kn=lessonCosta(tt),sk=solve(kn.pose,COSTA_B,kn.place),q=pr(c,sk.lHa);if(q){const r=kAt(c,sk.lHa);sparkBurst(s,Y,q[0],q[1],r*.6,{n:9,seed:71,g:easeOutBack(clamp((sgA+.1)/.2))*(1-clamp((sgA-.4)/.3)),width:Math.max(5,r*.045)});}}
  // "stay patient": his sight line to the ball, held until it is kicked
  const sl=sm(sp-.1,sp+.5,t,easeOutBack)*(1-sm(tK-.05,tK+.1,t));
  if(sl>.02){const kn=lessonCosta(tt),sk=solve(kn.pose,COSTA_B,kn.place),a=pr(c,sk.face),b=pr(c,add3(B0,[0,.12,0]));if(a&&b)sightLine(s,a,b,Math.max(6,kAt(c,[-5,1,0])*.045),clamp(sl));}
  // "kicked": a pop on the ball at the strike — the moment he is allowed to move
  const ag=t-tK;if(ag>-.05&&ag<.5){const q=pr(c,B0);if(q){const r=kAt(c,B0);sparkBurst(s,Y,q[0],q[1],r*.5,{n:9,seed:88,g:easeOutBack(clamp((ag+.05)/.15))*(1-clamp((ag-.3)/.2)),width:Math.max(5,r*.05)});}}
  void bk;BZ=0;
 },
 still:9,
};

const film:RisoStory={
 id:'costa-slovenia-2024',format:'11v11',title:"Costa's three saves in a row",
 theme:'Keepers: reset after every kick, get set and stay patient until the ball is kicked',
 ageNote:'Portugal 0–0 Slovenia (Portugal won 3–0 on penalties), Euro 2024 round of 16, Frankfurt, 1 July 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a glove prints where you tap and a ball is pushed away. Reduced motion: the static glove. */
 touch(s,x,y,age,seed){
  const g=glovePath(x,y,60);
  if(age<=0){s.knockout(g);s.fill(R,g,.95);s.stroke(K,g,3,.85);return;}
  const u=easeOut(clamp(age/.6)),r=rng(seed),dir=r()<.5?-1:1;
  if(age<.45){const k=1-clamp((age-.25)/.2);s.knockout(g,k);s.fill(R,g,.95*k);sparkBurst(s,Y,x,y,110,{n:9,seed,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.2)/.15)),width:14});}
  if(age<1)footballPanels(s,x+dir*180*u,y-120*u+160*u*u,30,{rot:age*8*dir,key:K,shadow:G,seed:5});
 },
};
export default film;
/** Solved contacts (pitch metres; goal line x = 0, −z = Costa's right) — checked by the film test. */
export const FACTS={B0,KX,KICKS:KICKS.slice(0,3).map(k=>({name:k.name,foot:k.foot,side:k.side,kind:k.kind,hand:k.hand,H:k.H,tSave:k.tSave,tDive:k.tDive,number:k.st.number})),
 ballAt,costaAt:(i:number,tau:number)=>{const s=costaAt(i,tau,0);return solve(s.pose,COSTA_B,s.place);},
 toeAt:(i:number,tau:number)=>{const k=KICKS[i],sk=solve(takerPose(i,tau,0),k.st.build,takerPlace(i,tau));return k.foot==='r'?sk.rToe:sk.lToe;},
 lessonCosta:(t:number)=>{const s=lessonCosta(t);return solve(s.pose,COSTA_B,s.place);},MID,LAND,tKick,
 sched,chapterSeconds:SECS,cue:CUE};
