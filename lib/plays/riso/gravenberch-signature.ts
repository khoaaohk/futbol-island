/** Iconic-play film · Ryan Gravenberch, "Signature: steal and carry" — the counter-attack behind Liverpool's first goal, Manchester
 * United 0–3 Liverpool, Premier League, Old Trafford, Manchester, Sunday 1 September 2024, 35th minute (0–1, Luis Díaz). A RisoStory
 * (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction from WRITTEN
 * accounts (the footage itself was not reviewed), rendered as a riso print.
 * LEAD: once public/plays/narration/gravenberch-signature/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/gravenberch-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cue words).
 *
 * WHY THIS MOMENT: Gravenberch's entry in lib/town/iconicPlays.json is a signature ("steal and carry"; lesson: after you win the ball,
 * carry it forward into the space in front of you). Under Arne Slot he became Liverpool's No 6, the man who "shield[s] the defence and
 * get[s] the ball rolling when he does reclaim possession" (WhoScored/Guardian, 3 Sep 2024, which names this match: "imperious"). His
 * best-documented turnover-to-attack is this goal at Old Trafford: Casemiro's misplaced pass, "a lightning fast Liverpool counter", "the
 * outstanding Gravenberch found Salah", Salah's cross, Díaz's header at an unguarded far post. The written reports describe that chain, so
 * chapters 1–2 show it; chapter 3 is a clearly labelled "How he does it" demonstration of the card's lesson (a training drill in bibs, no
 * named match, no named opponents), because no source spells out the exact touches of his carry that afternoon.
 *
 * SOURCES (read 24 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - The Guardian, David Hytner at Old Trafford, "Luis Díaz strikes twice as dominant Liverpool win at Manchester United" (1 Sep 2024)
 *    https://www.theguardian.com/football/article/2024/sep/01/manchester-united-liverpool-premier-league-match-report
 *    (guardian-manutd-liverpool-2024.txt): "The breakthrough followed a misplaced Casemiro pass and a lightning fast Liverpool counter; it
 *    was Slot's blueprint throughout. The outstanding Gravenberch found Salah and when he crossed, Liverpool had two men over at the far
 *    post … Dominik Szoboszlai could not reach Salah's cross. Díaz could." Also: an early Alexander-Arnold goal ruled out, a move "ignited by
 *    Ryan Gravenberch's jet-heeled burst from midfield"; Liverpool "squeezing high, nipping in front to win possession"; 3–0 (Díaz 2, Salah).
 *  - The Guardian minute-by-minute, Tim de Lisle (guardian-mbm-manutd-liverpool-2024*.txt): "GOAL! Man United 0-1 Liverpool (Diaz 35)
 *    … A simple header at the far post from a delicious cross by Salah" (photo caption: "scores … past Andre Onana"); "The goal sprang from
 *    a shocker of a pass by Casemiro. Under no pressure."; "the first goal … came when United had somehow forgotten to put anyone on the far
 *    post"; referee Anthony Taylor; Casemiro subbed at half-time.
 *  - The Guardian/WhoScored, Ben McAleer, "Why has Ryan Gravenberch become a key midfield cog for Slot at Liverpool?" (3 Sep 2024)
 *    (guardian-gravenberch-slot-2024.txt): his No 6 role, "imperious" in this 3–0; top of Liverpool's tackles and interceptions.
 *  - Wikipedia, "Ryan Gravenberch" (raw; wiki-ryan-gravenberch.txt): the deep-lying role under Slot, "his dominance in a 3–0 win over
 *    Manchester United at Old Trafford"; 2024–25 title; Young Player of the Season. Card facts: lib/town/playerAppearance.json (Netherlands),
 *    lib/town/playerCareers.json (Ajax 2018–22, Bayern 2022–23, Liverpool 2023–).
 * CONFIRMED by those sources: match, venue, date, minute, score (0–1 then 0–3); the chain misplaced Casemiro pass (under no pressure) →
 *  fast Liverpool counter → Gravenberch finds Salah → Salah's cross → far post left unguarded, Szoboszlai cannot reach it → Díaz heads in
 *  past Onana.
 * INFERRED (illustrative, never narrated as fact): that the loose pass came to Gravenberch himself and that he carried it ~11 m before
 *  passing (the sources say only that the counter was lightning fast and that he found Salah); every position, run and timing in metres
 *  and seconds; Salah on the right touchline side, crossing with his LEFT foot, and Díaz heading from ≈5 m out; Onana's shuffle and late
 *  dive; which end Liverpool attacked on screen; THE KITS — United in the home red shirt, white shorts, black socks and Liverpool in the
 *  black 2024–25 away strip (both from memory, unverified in the cached sources, never named in the narration); Onana's kit (drawn
 *  yellow); Gravenberch's No. 38; the other players and their runs; Old Trafford drawn as a closed bowl of red seats; the crowd's colours;
 *  the weather; camera placements. Chapter 3's drill (bibs, cones, positions) is an invented demonstration.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the ground wide → Casemiro's pass goes astray
 * → Gravenberch takes it and drives into the space → the pass right to Salah → the cross → the far-post header → celebration); ch2 = the
 * slow-motion replay: a LOW pitch-side tele on Gravenberch's carry and pass, then a cut to a low camera by the far corner for the cross and
 * the header at the empty far post; ch3 = "How he does it": a raised side-on training-pitch camera — win it, look up, spot the open grass,
 * carry it forward in big pushes while the defenders back off. Composed on the FULL sheet (world units = sheet units centred on the canvas;
 * never sheet.safe) so it frames from the 1.45:1 card window down to square. Every body goes through ONE adapter, drawPlayer() →
 * athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, motion smear on the fast touches). Small figures in wide shots
 * and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward United's goal at x = 0, y up,
 * +z = the main-stand side = Liverpool's right), athlete.ts's own convention, so feet are not mirrored.
 * Inks: yellow, red, blue, navy. Poses on twos, cameras on ones, all randomness seeded. Budget ≈150–300 plate ops per frame, passages ≲600. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,settle,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,backpedal,lunge,header,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. No cue starts with a contraction, a
 * hyphenated word or an accented name. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Live at Old Trafford',text:'Old Trafford, 2024: Manchester United against Liverpool. A United pass goes astray, and Liverpool break fast. Gravenberch finds Salah on the right. Salah crosses to the far post, and Díaz heads it in. Goal!',tail:1.6,
  cues:['Old Trafford','Manchester United','pass goes astray','Liverpool break fast','Gravenberch finds','on the right','Salah crosses','far post','heads it in','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. The pass comes loose, and Gravenberch finds Salah in a flash. Nobody marks the far post, and Díaz heads it home.',tail:1.5,
  cues:['Watch again','slowly','The pass','comes loose','Gravenberch finds','in a flash','Nobody marks','far post','heads it home']},
 {label:'How he does it',text:'How he does it: win the ball, look up, and spot the open grass. Carry it forward, fast. Defenders must back away. After you win it, run into the space in front!',tail:1.8,
  cues:['How he does it','win the ball','look up','spot the open grass','Carry it forward','fast','Defenders must','back away','After you win','run into the space']},
];
import timingJson from '../../../public/plays/narration/gravenberch-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈2.7 words/s, Kokoro's pace): .22 s + .02 s a letter per word, pauses after , : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.22+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('gravenberch: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gravenberch: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}
/** piecewise-linear t → τ through anchors, slope 1 (real time) before the first and after the last anchor */
function pw(t:number,A:[number,number][]):number{if(t<=A[0][0])return A[0][1]-(A[0][0]-t);for(let i=0;i+1<A.length;i++){const a=A[i],b=A[i+1];if(t<b[0])return lerp(a[1],b[1],(t-a[0])/(b[0]-a[0]));}const l=A[A.length-1];return l[1]+(t-l[0]);}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy',D2R=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const fwd=(yaw:number):[number,number]=>[Math.cos(-yaw),Math.sin(-yaw)];
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera (right-handed metres, y up)
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
/** a quad only when every corner is comfortably in front of the lens (stands beside / behind the camera would project huge) */
function quadP(c:Cam,path:Path2D,pts:V3[],minD=3){for(const p of pts)if(toCam(c,p)[2]<minD)return;addPoly(path,pts.map(p=>scr(c,toCam(c,p))));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});
function ringPts(c:Cam,x:number,z:number,r:number,n=30):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p=pr(c,[x+Math.cos(a)*r,.02,z+Math.sin(a)*r]);if(p)o.push(p);}return o;}

// ---------------------------------------------------------------- Old Trafford: a closed bowl of red seats (drawn, not surveyed)
/** pitch 105 × 68: United's goal line x = 0 (net toward +x), halfway x = −52.5, the far goal x = −105; touchlines z = ±34 */
const HW=-52.5,PL=-105,TZ=34;
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-110,.9,-37.5],[5,.9,-37.5],[5,26,-60],[-110,26,-60]],// far side (the big three-tier stand)
 [[6,.9,39],[6,.9,-39],[22,17,-39],[22,17,39]],// the end behind United's goal
 [[5,.9,37.5],[-110,.9,37.5],[-110,20,56],[5,20,56]],// the main stand under the TV camera
 [[-111,.9,-39],[-111,.9,39],[-127,17,39],[-127,17,-39]],// the far end
];
const CORNERS:Q4[]=[[[5,.9,-37.5],[6,.9,-39],[22,17,-39],[5,26,-60]],[[6,.9,39],[5,.9,37.5],[5,20,56],[22,17,39]],[[-110,.9,37.5],[-111,.9,39],[-127,17,39],[-110,20,56]],[[-111,.9,-39],[-110,.9,-37.5],[-110,26,-60],[-127,17,-39]]];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper faces / 1 red / 2 navy, phase] (both sets of fans wear a lot of red) */
const CROWD=(()=>{const r=rng(2409),out:[number,number,number,number,number][]=[];[640,300,520,300].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),u=r(),v=.04+r()*.9;
 out.push([st,u,v,c<.4?0:c<.8?1:2,r()*TAU]);}});return out;})();
const USEG=10;
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number;lite?:boolean}={}){
 const{roar=0,flash=0,lite=false}=o,tt=twos(t),v=view(s);
 s.field(B,.26,.4);
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),shade=new Path2D();
 STANDS.forEach((q,si)=>{for(let k=0;k<USEG;k++){const u0=k/USEG,u1=(k+1)/USEG;
   quadP(c,stands,[bil(q,u0,0),bil(q,u1,0),bil(q,u1,1),bil(q,u0,1)]);
   if(!lite)for(let j=0;j<12;j+=2)quadP(c,rows,[bil(q,u0,j/12),bil(q,u1,j/12),bil(q,u1,(j+1)/12),bil(q,u0,(j+1)/12)]);
   for(const vv of si===1||si===3?[.5]:[.34,.68])quadP(c,fascia,[bil(q,u0,vv),bil(q,u1,vv),bil(q,u1,vv+.045),bil(q,u0,vv+.045)]);
   const lift:V3=[0,3.6,0],over:V3=si===0?[0,0,8]:si===2?[0,0,-8]:si===1?[-6,0,0]:[6,0,0];
   const r0=add3(bil(q,u0,1),lift),r1=add3(bil(q,u1,1),lift);quadP(c,roof,[r0,r1,add3(r1,over),add3(r0,over)]);
   if(si!==0)quadP(c,shade,[bil(q,u0,.62),bil(q,u1,.62),bil(q,u1,1),bil(q,u0,1)]);}});
 for(const q of CORNERS)for(let k=0;k<4;k++)quadP(c,stands,[bil(q,k/4,0),bil(q,(k+1)/4,0),bil(q,(k+1)/4,1),bil(q,k/4,1)]);
 // red seats: red ink with a navy screen for depth
 s.knockout(stands);s.tone(R,stands,.62);s.tone(K,stands,.3);if(!lite){s.tone(K,rows,.18);}
 if(!lite){const heads=[new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0];
  for(const[st,u,vv,col,ph] of CROWD){const q=STANDS[st],bob=roar>0?roar*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,vv);p[1]+=.35+bob;const d=toCam(c,p);if(d[2]<3)continue;
   const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;const sz=clamp(.55*c.F/d[2],3.5,18);heads[col].rect(g[0]-sz/2,g[1]-sz*.6,sz,sz*1.15);seen[col]++;}
  if(seen[0])s.knockout(heads[0],.8);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(K,heads[2],.85);}
 s.tone(K,shade,.24);s.fill(K,fascia,.88);s.fill(K,roof,.92);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.8),d=toCam(c,p);if(d[2]<4)continue;const g=scr(c,d),sz=clamp(.9*c.F/d[2],7,22);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  fp.addPath(polyPath([[g[0],g[1]-sz],[g[0]+sz*.3,g[1]],[g[0],g[1]+sz],[g[0]-sz*.3,g[1]]],true));fp.addPath(polyPath([[g[0]-sz,g[1]],[g[0],g[1]-sz*.3],[g[0]+sz,g[1]],[g[0],g[1]+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // advertising boards: navy with red and paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const z of[-35.9,35.9])for(let x=PL-3;x<3;x+=8){const q:V3[]=[[x,0,z],[x+7.8,0,z],[x+7.8,.9,z],[x,.9,z]];quadP(c,bd,q,2);if((Math.round(x/8)&1)===0)quadP(c,pn,[[x+.4,.2,z],[x+7.4,.2,z],[x+7.4,.7,z],[x+.4,.7,z]],2);}
 for(const X of[4.5,PL-4.5])for(let z=-32;z<32;z+=8){quadP(c,bd,[[X,0,z],[X,0,z+7.8],[X,.9,z+7.8],[X,.9,z]],2);}
 s.knockout(bd);s.fill(K,bd,.9);s.tone(R,bd,.35);s.knockout(pn,.85);
}
/** the pitch, mowing stripes, paper lines, corner flags and both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;lite?:boolean}={}){
 const g=polyP(c,[[PL-6,0,-36.5],[5,0,-36.5],[5,0,36.5],[PL-6,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.62);
 if(!o.lite){const st=new Path2D();for(let x=PL;x<0;x+=10.5)addPoly(st,polyP(c,[[x,0,-TZ],[x+5.25,0,-TZ],[x+5.25,0,TZ],[x,0,TZ]]));s.tone(B,st,.18);}
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([PL*k/8,0,-TZ],[PL*(k+1)/8,0,-TZ]);L([PL*k/8,0,TZ],[PL*(k+1)/8,0,TZ]);}
 for(const X of[0,HW,PL])for(let k=0;k<4;k++)L([X,0,-TZ+k*TZ/2],[X,0,-TZ+(k+1)*TZ/2]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(HW,0,9.15);seg3(c,[HW-.15,0,0],[HW+.15,0,0],.3,ln);
 for(const sg of[1,-1]){const X=sg>0?0:PL,d=-sg;
  L([X,0,-20.16],[X+d*16.5,0,-20.16]);L([X+d*16.5,0,-20.16],[X+d*16.5,0,20.16]);L([X+d*16.5,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+d*5.5,0,-9.16]);L([X+d*5.5,0,-9.16],[X+d*5.5,0,9.16]);L([X+d*5.5,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(sg>0)circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(PL+11,0,9.15,-a,a,12);
  seg3(c,[X+d*11.1,0,0],[X+d*10.9,0,0],.22,ln);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const X of[0,PL])for(const z of[-TZ,TZ]){if(toCam(c,[X,0,z])[2]<2)continue;seg3(c,[X,0,z],[X,1.55,z],.05,pole);addPoly(flag,polyP(c,[[X,1.55,z],[X,1.2,z],[X+(X?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,1,o.bulge??0);goal3(s,c,-1,0);
}
/** a goal: sg = 1 United's goal at x = 0 (net toward +x), −1 the far goal. bulge pushes the back net out, low by the far post. */
function goal3(s:Sheet,c:Cam,sg:number,bulge:number){
 const X=sg>0?0:PL,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+sg*(2+bulge*.9*Math.exp(-Math.pow((z-GL[2])/1.4,2))*Math.exp(-Math.pow((y-.6)/.8,2)));
 if(toCam(c,[X,1,0])[2]<2)return;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[back(z,y0),y0,z],[back(z,y1),y1,z],.022,mesh,.7);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D(),fo=new Path2D();for(const[w,p] of [[.12,fr],[.2,fo]] as [number,Path2D][]){seg3(c,[X,0,z0],[X,H,z0],w,p);seg3(c,[X,0,z1],[X,H,z1],w,p);seg3(c,[X,H,z0-.06],[X,H,z1+.06],w,p);}
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Díaz's header)
const G=9.81;
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a body moving along keys: stride phase from distance, speed from velocity, facing the run (or `look` when slow) */
function runner(p:MKey[],tau:number,look:[number,number],idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const lookYaw=yawTo(q.x,q.z,look[0],look[1]),yaw=v>.05?lerpAng(lookYaw,Math.atan2(-q.vz,q.vx),clamp((v-.3)/.9)):lookYaw;
 return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** turn the head (and a little of the shoulders) toward a ground point; up = chin angle (− looks up) */
function headTo(p:Pose,pl:Place,tx:number,tz:number,w:number,up=-14):Pose{if(w<=0)return p;const o={...p},rel=clamp(wrap(yawTo(pl.x??0,pl.z??0,tx,tz)-(pl.yaw??0)),-1.25,1.25);
 o.neckY=lerp(p.neckY,rel*.8,w);o.twist=lerp(p.twist,rel*.25,w);o.neckP=lerp(p.neckP,up*D2R,w);return o;}
const bumpT=(t:number,c:number,w:number)=>{const d=Math.abs(t-c)/w;return d>=1?0:.5+.5*Math.cos(d*Math.PI);};

// ---- the kits (athlete.ts styles) ----
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** United's home kit (inferred): red shirt, white shorts, black socks */
const united=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:K,boots:K,trim:'paper',skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],numberInk:'paper',number:null,...o});
/** Liverpool's black 2024–25 away strip (inferred): drawn navy with blue trim */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.86],shorts:[K,.86],socks:[K,.86],boots:K,trim:[B,.9],skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.22],numberInk:[B,.95],number:null,...o});
const GRA_B:Build={height:1.9,bulk:.92};
/** Ryan Gravenberch, No. 38 — tall, long-legged, short dark hair (card appearance) */
const GRA_ST=lfc({number:38,skin:SKIN_D,hair:[K,.95],build:GRA_B,seed:38});
const SAL_B:Build={height:1.75,bulk:.95,thighs:1.08};
const SAL_ST=lfc({number:11,skin:SKIN_M,hair:[K,.9],hairStyle:'curly',build:SAL_B,seed:11});
const DIAZ_B:Build={height:1.8,bulk:.92};
const DIAZ_ST=lfc({number:7,skin:SKIN_M,hair:[K,.9],hairStyle:'curly',build:DIAZ_B,seed:7});
const ONANA_B:Build={height:1.9,bulk:.97};
/** Onana's keeper kit is not in the sources: drawn yellow and never named */
const ONANA_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',number:24,numberInk:K,build:ONANA_B,seed:24};
const CAS_ST=united({number:18,skin:SKIN_M,hair:[K,.9],build:{height:1.85,bulk:1.0},seed:18});

// ---- the key beats (τ) and points ----
const T_CP=-7.2;// Casemiro's pass goes astray
const T_GR=-6.45;// it runs to Gravenberch: first touch
const T_GP=-4.25;// his pass right to Salah
const T_SR=-3.35;// Salah takes it
const T_X=-1.5;// Salah's cross (left foot)
const C0:V3=[-35.5,.11,-4.2];
const G1:[number,number]=[-40.3,-6.6];// where Gravenberch meets the loose pass
const S1:[number,number]=[-20.5,17.5];
// the pass right: he plants and strikes (right foot) from the end of his carry
const G2P:[number,number]=[-29.6,-.4];
const YAW_GP=yawTo(G2P[0],G2P[1],S1[0],S1[1])+14*D2R;
const GP0:V3=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.5}),GRA_B,{x:G2P[0],z:G2P[1],yaw:YAW_GP}),d=fwd(YAW_GP);return[sk.rToe[0]+d[0]*.1,.11,sk.rToe[2]+d[1]*.1];})();
// Salah's cross from the right, left foot
const S2P:[number,number]=[-14.2,22.3];
// Díaz: the header point — his forehead at contact, ≈5 m out by the far post
const DH:[number,number]=[-4.6,-5.1];
const YAW_D=yawTo(DH[0],DH[1],0,-1.6);
const DPC:[number,number]=(()=>{const sk=solve(header(.52),DIAZ_B,{x:0,z:0,yaw:YAW_D}),d=fwd(YAW_D);return[DH[0]-sk.face[0]-d[0]*.13,DH[1]-sk.face[2]-d[1]*.13];})();
const HD:V3=(()=>{const sk=solve(header(.52),DIAZ_B,{x:DPC[0],z:DPC[1],yaw:YAW_D}),d=fwd(YAW_D);return[sk.face[0]+d[0]*.13,sk.face[1]+.05,sk.face[2]+d[1]*.13];})();
const YAW_X=yawTo(S2P[0],S2P[1],HD[0],HD[2])-12*D2R;
const X0:V3=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.7}),SAL_B,{x:S2P[0],z:S2P[1],yaw:YAW_X}),d=fwd(YAW_X);return[sk.lToe[0]+d[0]*.1,.11,sk.lToe[2]+d[1]*.1];})();
const TF=-T_X,VY=(HD[1]-X0[1]+.5*G*TF*TF)/TF;
/** the header goes in low inside the far post; the net takes it */
const GL:V3=[0,.5,-2.5],NETP:V3=[1.55,.4,-2.6],REST:V3=[1.2,.11,-2.3];
const T_IN=.36,T_NET=.5,T_REST=1.1;

// ---- Gravenberch: pressing high, the loose pass, the carry into the space, head up, the pass right ----
const GR_KEYS:MKey[]=[[-14,-45.5,-9.5],[-9,-43.5,-8.6],[T_CP,-42.2,-7.6],[T_GR,G1[0]+.1,G1[1]-.35],[-5.5,-35.6,-4.0],[T_GP-STRIKE_CONTACT*.8,G2P[0],G2P[1]]];
const GR_AFTER:MKey[]=[[T_GP+.4,G2P[0]+.5,G2P[1]+.2],[-2,-24,1.5],[0,-17,2.5],[3,-11,3]];
const TOUCH=(p:Pose):Pose=>({...p,rHipF:38*D2R,rHipA:14*D2R,rKnee:24*D2R,rAnk:30*D2R,lKnee:34*D2R,lHipF:18*D2R,lean:18*D2R,neckP:30*D2R,lShA:44*D2R,rShA:30*D2R});
/** the pushes of the carry (τ): the ball runs ahead after each */
const PUSHES=[T_GR,-5.75,-5.15];
function graRun(tau:number):{pose:Pose;place:Place}{
 const b=ballAt(tau),r=runner(GR_KEYS,tau,[b[0],b[2]]);let p=r.pose;
 if(tau>T_GR-.3&&tau<T_GP-.6){let k=0;for(const q of PUSHES)k=Math.max(k,bumpT(tau,q,.22));if(k>0)p=blendPose(p,TOUCH(p),k*.9);}
 // eyes: down at the touches, then UP at the space in front before the pass
 const up=sm(-5.35,-5.2,tau)*(1-sm(-5.1,-4.95,tau))+sm(-4.75,-4.6,tau);
 p=headTo(p,r.place,S1[0],S1[1],up,-8);
 return{pose:p,place:r.place};}
const RUN_END_G=T_GP-STRIKE_CONTACT*.8;
const GR_AT_END=()=>graRun(RUN_END_G);
function graAt(tau:number):{pose:Pose;place:Place}{
 if(tau<RUN_END_G)return graRun(tau);
 if(tau<T_GP+.45){const us=STRIKE_CONTACT+(tau-T_GP)/.8;const p=blendPose(GR_AT_END().pose,strike(clamp(us),{power:.5}),sm(RUN_END_G,RUN_END_G+.12,tau));
  const d=fwd(YAW_GP),g=Math.max(0,tau-T_GP)*1.2;return{pose:p,place:{x:G2P[0]+d[0]*g,z:G2P[1]+d[1]*g,yaw:YAW_GP}};}
 const r=runner(GR_AFTER,tau,[ballAt(tau)[0],ballAt(tau)[2]]);const end=graAtStrikeEnd();
 const p=blendPose(end,r.pose,sm(T_GP+.45,T_GP+.9,tau));
 if(tau>T_NET)return{pose:blendPose(p,celebrate((tau-T_NET)*.9,{kind:'arms'}),sm(T_NET+.2,T_NET+.8,tau)*.8),place:r.place};
 return{pose:headTo(p,r.place,ballAt(tau)[0],ballAt(tau)[2],.6,-6),place:r.place};}
const graAtStrikeEnd=()=>strike(clamp(STRIKE_CONTACT+.45/.8),{power:.5});

// ---- Salah: takes the pass on the right, drives at the full-back, the cross ----
const SA_KEYS:MKey[]=[[-14,-33,24],[-8,-29,22],[T_GP,-23.5,19.5],[T_SR,S1[0]-.4,S1[1]+.55],[-2.6,-17.6,20.6],[T_X-.9,S2P[0]-1.6,S2P[1]-.9],[T_X-STRIKE_CONTACT*.9,S2P[0],S2P[1]]];
const SA_PUSH=[T_SR,-2.75,-2.25];
function salRun(tau:number):{pose:Pose;place:Place}{
 const b=ballAt(tau),r=runner(SA_KEYS,tau,[b[0],b[2]]);let p=r.pose;
 let k=0;for(const q of SA_PUSH)k=Math.max(k,bumpT(tau,q,.2));if(k>0)p=blendPose(p,{...TOUCH(p),lHipF:38*D2R,lHipA:14*D2R,lKnee:24*D2R,rHipF:18*D2R,rHipA:0,rKnee:34*D2R},k*.9);
 p=headTo(p,r.place,HD[0],HD[2],sm(-2.2,-2.0,tau)*(1-sm(-1.95,-1.85,tau)),-6);
 return{pose:p,place:r.place};}
const RUN_END_S=T_X-STRIKE_CONTACT*.9;
function salAt(tau:number):{pose:Pose;place:Place}{
 if(tau<RUN_END_S)return salRun(tau);
 const us=STRIKE_CONTACT+(tau-T_X)/.9,end=salRun(RUN_END_S);
 let p=blendPose(end.pose,strike(clamp(us),{foot:'l',power:.7}),sm(RUN_END_S,RUN_END_S+.12,tau));
 const d=fwd(YAW_X),g=Math.max(0,tau-T_X)*1.4*Math.exp(-Math.max(0,tau-T_X)*.6);
 if(tau>T_X+.4)p=headTo(blendPose(p,stand(),sm(T_X+.4,T_X+.9,tau)),{x:S2P[0],z:S2P[1],yaw:YAW_X},HD[0],HD[2],1,-8);
 if(tau>T_NET)p=blendPose(p,celebrate((tau-T_NET)*.9,{kind:'arms'}),sm(T_NET+.1,T_NET+.6,tau)*.85);
 return{pose:p,place:{x:S2P[0]+d[0]*g,z:S2P[1]+d[1]*g,yaw:YAW_X}};}

// ---- Díaz: the run to the empty far post, the header ----
const HSD=.9,T_HS=-.52*HSD;
const DI_KEYS:MKey[]=[[-14,-30,-16],[-7,-24,-15],[-3.5,-15.5,-11.5],[-1.5,-9.2,-8],[T_HS,DPC[0]-.35,DPC[1]-.2]];
function diazAt(tau:number):{pose:Pose;place:Place}{
 const b=ballAt(tau);
 if(tau<T_HS){const r=runner(DI_KEYS,tau,[b[0],b[2]]);return{pose:headTo(r.pose,r.place,b[0],b[2],sm(T_X-.2,T_X+.3,tau),-30),place:r.place};}
 const u=clamp((tau-T_HS)/HSD);let p=header(u);
 const x=lerp(DPC[0]-.35,DPC[0],sm(T_HS,0,tau))+Math.max(0,tau)*1.2,z=lerp(DPC[1]-.2,DPC[1],sm(T_HS,0,tau))+Math.max(0,tau)*.8;
 let yaw=YAW_D;
 if(tau>.55){p=blendPose(p,celebrate((tau-.55)*1.0,{kind:'run'}),sm(.55,1.0,tau));yaw=lerpAng(YAW_D,yawTo(0,0,-.3,1),sm(.6,1.1,tau));}
 return{pose:p,place:{x:x+Math.max(0,tau-.6)*2.2*Math.cos(-yaw),z:z+Math.max(0,tau-.6)*2.2*Math.sin(-yaw),yaw}};}

// ---- the ball ----
function carryBall(tau:number,keys:MKey[],pushes:number[],end:V3,tEnd:number,from:V3,t0:number):V3{
 const q=pathPos(keys,tau),v=Math.hypot(q.vx,q.vz)||1,d:[number,number]=[q.vx/v,q.vz/v];let since=9;for(const p of pushes)if(tau>=p)since=tau-p;
 const k=.45+.85*(1-Math.exp(-since*3.2))*Math.exp(-since*1.1);
 let P:V3=[q.x+d[0]*k,.11,q.z+d[1]*k];
 P=mix3(from,P,sm(t0,t0+.3,tau));
 return mix3(P,end,sm(tEnd-.35,tEnd,tau));}
function ballAt(tau:number):V3{
 if(tau<T_CP){// Casemiro on the ball, small touches
  const a=(tau+9)*2.1;return[C0[0]-.6+.35*Math.cos(a),.11,C0[2]+.2+.35*Math.sin(a)];}
 if(tau<T_GR){const u=(tau-T_CP)/(T_GR-T_CP),e=1-Math.pow(1-u,1.3);return[lerp(C0[0],G1[0],e),.11,lerp(C0[2],G1[1],e)];}
 if(tau<T_GP)return carryBall(tau,GR_KEYS,PUSHES,GP0,T_GP,[G1[0],.11,G1[1]],T_GR);
 if(tau<T_SR){const u=(tau-T_GP)/(T_SR-T_GP),e=1-Math.pow(1-u,1.2);return[lerp(GP0[0],S1[0],e),.11,lerp(GP0[2],S1[1],e)];}
 if(tau<T_X)return carryBall(tau,SA_KEYS,SA_PUSH,X0,T_X,[S1[0],.11,S1[1]],T_SR);
 if(tau<0){const s=tau-T_X,u=s/TF;return[lerp(X0[0],HD[0],u),X0[1]+VY*s-.5*G*s*s,lerp(X0[2],HD[2],u)];}
 if(tau<T_IN)return mix3(HD,GL,tau/T_IN);
 if(tau<T_NET)return mix3(GL,NETP,easeOut((tau-T_IN)/(T_NET-T_IN)));
 const u=clamp((tau-T_NET)/(T_REST-T_NET)),b=u>=1?.1*Math.abs(Math.sin((tau-T_REST)*9))*Math.exp(-(tau-T_REST)*3.5):0;
 return[lerp(NETP[0],REST[0],u),Math.max(.11,lerp(NETP[1],.11,u*u))+b,lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*5;
const bulgeAt=(tau:number)=>tau<T_NET-.05?0:Math.exp(-(tau-T_NET+.05)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));

// ---- Onana: shuffles across with the cross, a late dive toward the far post ----
function onanaAt(tau:number,it:number):{pose:Pose;place:Place}{
 const b=ballAt(tau);
 if(tau<T_X){const z=lerp(.4,2.2,sm(T_GP,T_X,tau));return{pose:keeperSet(it*1.3),place:{x:-1.4,z,yaw:yawTo(-1.4,z,b[0],b[2])}};}
 if(tau<-.25){const u=sm(T_X,-.3,tau),z=lerp(2.2,.2,u);let p=blendPose(keeperSet(it*1.3),backpedal(tau*3),.35*Math.sin(Math.PI*u));return{pose:p,place:{x:-1.2,z,yaw:yawTo(-1.2,z,b[0],b[2])}};}
 const u=clamp((tau+.25)/.9);const p=keeperDive(u,{side:'r',height:.2});
 if(tau>1.3)return{pose:blendPose(p,posed({lean:20,neckP:30,lKnee:40,rKnee:40,lHipF:30,rHipF:30}),sm(1.3,1.8,tau)),place:{x:-1.1,z:-.6,yaw:Math.PI}};
 return{pose:p,place:{x:-1.2,z:.2,yaw:Math.PI}};}

// ---- everyone else ----
type Actor={name:string;st:AthleteStyle;at:(tau:number,it:number)=>{pose:Pose;place:Place}};
const DEJECT=posed({lean:30,neckP:30,lHipF:26,rHipF:26,lKnee:32,rKnee:32,lShA:12,rShA:12,lShF:22,rShF:22});
const watch=(r:{pose:Pose;place:Place},tau:number,it:number,ph:number,happy:boolean)=>{const b=ballAt(tau);let p=headTo(r.pose,r.place,b[0],b[2],.7,-10);
 if(tau>T_NET)p=happy?blendPose(p,celebrate(it*.9+ph,{kind:'arms'}),sm(T_NET+.1,T_NET+.6,tau)*.85):blendPose(p,DEJECT,sm(T_NET+.2,T_NET+1,tau)*.7);return{pose:p,place:r.place};};
const mover=(name:string,st:AthleteStyle,keys:MKey[],happy:boolean,ph=0):Actor=>({name,st,at:(tau,it)=>{const b=ballAt(tau);return watch(runner(keys,tau,[b[0],b[2]]),tau,it,ph,happy);}});
/** Szoboszlai: arrives at the far post first and leaps — the cross is just too high for him */
const T_SZ=-.62;
const SZ_KEYS:MKey[]=[[-14,-31,-2],[-6,-25,-3],[-2.5,-13.5,-3.2],[T_SZ,-6.9,-2.4]];
const ACTORS:Actor[]=[
 {name:'Casemiro',st:CAS_ST,at:(tau,it)=>{const b=ballAt(tau);
  const r=runner([[-14,-34.5,-2],[-9,-34.6,-3.3],[T_CP-.5,C0[0]-1.2,C0[2]+.25],[T_CP+.5,C0[0]-.8,C0[2]+.1],[-4,-30,-3],[0,-18,-1],[3,-12,-1]],tau,[b[0],b[2]]);
  if(tau>T_CP-.55&&tau<T_CP+.5){const u=clamp(STRIKE_CONTACT+(tau-T_CP)/1.0);r.pose=blendPose(r.pose,strike(u,{power:.35}),Math.sin(Math.PI*clamp((tau-T_CP+.55)/1.05)));r.place.yaw=yawTo(r.place.x??0,r.place.z??0,-43,-12);}
  return watch(r,tau,it,.1,false);}},
 {name:'Kobbie Mainoo',st:united({number:37,skin:SKIN_D,build:{height:1.8,bulk:.92},seed:37}),at:(tau,it)=>{const b=ballAt(tau);
  const r=runner([[-14,-44,-13],[T_CP,-43.2,-12.2],[T_GR,-42.4,-11.2],[-4.5,-36,-6],[0,-26,-2],[3,-20,-1]],tau,[b[0],b[2]]);return watch(r,tau,it,.2,false);}},
 {name:'Bruno Fernandes',st:united({number:8,hair:[K,.8],build:{height:1.79,bulk:.93},seed:8}),at:(tau,it)=>watch(runner([[-14,-50,4],[T_CP,-49,3],[-4,-42,2],[0,-32,1.5],[3,-26,1]],tau,[ballAt(tau)[0],ballAt(tau)[2]]),tau,it,.3,false)},
 {name:'Diogo Dalot',st:united({number:20,hair:[K,.85],build:{height:1.83,bulk:.93},seed:20}),at:(tau,it)=>watch(runner([[-14,-30,18],[T_GP,-24,15.5],[T_SR,-19.5,17],[T_X,-13.2,20.4],[0,-12.6,19.4]],tau,[ballAt(tau)[0],ballAt(tau)[2]]),tau,it,.4,false)},
 mover('Lisandro Martínez',united({number:6,hair:[K,.85],build:{height:1.75,bulk:1},seed:6}),[[-14,-24,6],[T_GP,-18,5.5],[T_X,-9.5,4.2],[0,-7.4,3.2],[3,-6,2.5]],false,.5),
 mover('Matthijs de Ligt',united({number:4,hair:[Y,.8],build:{height:1.89,bulk:1.02},seed:4}),[[-14,-24,-2],[T_GP,-18,-.8],[T_X,-9.6,.2],[0,-7.5,.6],[3,-6.5,.6]],false,.6),
 mover('Noussair Mazraoui',united({number:3,skin:SKIN_M,hair:[K,.85],build:{height:1.83,bulk:.92},seed:3}),[[-14,-26,-12],[T_GP,-19,-8],[T_X,-10,-3.4],[0,-8.2,-1.8],[3,-7.2,-2.2]],false,.7),
 mover('Marcus Rashford',united({number:10,skin:SKIN_D,build:{height:1.8,bulk:.94},seed:10}),[[-14,-54,-20],[T_CP,-52,-19],[-3,-44,-14],[3,-38,-10]],false,.8),
 mover('Joshua Zirkzee',united({number:11,skin:SKIN_M,build:{height:1.93,bulk:.95},seed:111}),[[-14,-58,2],[T_CP,-56,1],[-3,-48,0],[3,-42,0]],false,.9),
 mover('Alejandro Garnacho',united({number:17,hair:[K,.9],build:{height:1.8,bulk:.9},seed:17}),[[-14,-55,24],[T_CP,-53,22],[-3,-44,17],[3,-38,12]],false,.15),
 {name:'Dominik Szoboszlai',st:lfc({number:8,hair:[Y,.8],build:{height:1.86,bulk:.93},seed:81}),at:(tau,it)=>{const b=ballAt(tau);
  if(tau<T_SZ){const r=runner(SZ_KEYS,tau,[b[0],b[2]]);return watch(r,tau,it,.3,true);}
  const u=clamp((tau-T_SZ)/.9);let p=header(Math.min(u,.95));const pl:Place={x:-6.9+.6*sm(T_SZ,T_SZ+.4,tau),z:-2.4-.3*sm(T_SZ,T_SZ+.4,tau),yaw:yawTo(-6.9,-2.4,X0[0],X0[2])};
  p=headTo(p,pl,b[0],b[2],.8,-40);if(tau>T_NET)p=blendPose(p,celebrate((tau-T_NET)*.9+.3,{kind:'arms'}),sm(T_NET+.1,T_NET+.6,tau));return{pose:p,place:pl};}},
 mover('Diogo Jota',lfc({number:20,skin:SKIN_L,hair:[K,.9],build:{height:1.78,bulk:.93},seed:20}),[[-14,-30,6],[T_GP,-24,5],[T_X,-11.5,2.6],[0,-6.4,1.7],[3,-5.6,1.4]],true,.45),
 mover('Alexis Mac Allister',lfc({number:10,hair:[Y,.55],hairStyle:'curly',build:{height:1.76,bulk:.92},seed:10}),[[-14,-47,-14],[T_CP,-45,-12],[-4,-36,-9],[0,-26,-6],[3,-22,-5]],true,.55),
 mover('Trent Alexander-Arnold',lfc({number:66,skin:SKIN_L,build:{height:1.8,bulk:.93},seed:66}),[[-14,-44,26],[T_GP,-35,25],[-1,-28,24],[3,-24,23]],true,.65),
 mover('Andy Robertson',lfc({number:26,hair:[R,.45],build:{height:1.78,bulk:.93},seed:26}),[[-14,-46,-26],[-6,-40,-25],[0,-32,-22],[3,-28,-20]],true,.75),
 mover('Virgil van Dijk',lfc({number:4,skin:SKIN_D,build:{height:1.95,bulk:1.02},seed:4}),[[-14,-60,-6],[-6,-56,-5],[0,-50,-4],[3,-47,-3]],true,.85),
];

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and hem trail), smear = halftone echo + speed lines on fast limbs (the touches, the pass, the cross, the header). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
const BALL_R=.11;
function drawBallAt(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;dir?:number;lineLen?:number}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+Math.min(P[1],14)*.04;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.05,.12,.5));
 if(o.dir!==undefined&&o.lineLen)speedLines(s,K,g[0],g[1],o.dir,{n:4,seed:7,len:o.lineLen,spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau);let dir:number|undefined,lineLen:number|undefined;
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(o.prev)),g=pr(c,P);if(a&&g){const d=Math.hypot(g[0]-a[0],g[1]-a[1]),r=Math.max(o.min??14,kAt(c,P)*BALL_R);if(d>r*1.2){dir=Math.atan2(g[1]-a[1],g[0]-a[0]);lineLen=Math.min(200,d*1.3);}}}
 return drawBallAt(s,c,P,spinAt(tau),{min:o.min,dir,lineLen});
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the match through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const heroes:[AthleteStyle,(t:number,it:number)=>{pose:Pose;place:Place},(t:number)=>boolean][]=[
  [GRA_ST,t=>graAt(t),t=>(t>T_GR-.15&&t<T_GR+.2)||(t>T_GP-.25&&t<T_GP+.25)],
  [SAL_ST,t=>salAt(t),t=>t>T_X-.25&&t<T_X+.25],
  [DIAZ_ST,t=>diazAt(t),t=>t>-.2&&t<.2],
  [ONANA_ST,onanaAt,t=>t>-.1&&t<.4],
 ];
 for(const[st,f,sw] of heroes){const cur=f(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=f(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(st,d,true),cur.place,prev,!!e.smear&&sw(tp));}});}
 for(const a of ACTORS){const cur=a.at(tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=a.at(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at3=(pl:Place,y=1):V3=>[pl.x??0,y,pl.z??0];
/** the ball as a camera follows it: averaged over the last .4 s (an operator's lag), height eased so the frame never whips */
const follow=(tau:number):V3=>{const a=ballAt(tau),b=ballAt(tau-.2),c=ballAt(tau-.4);return[(a[0]+b[0]+c[0])/3,Math.min(6,(a[1]+b[1]+c[1])/3*.7+.8),(a[2]+b[2]+c[2])/3];};
/** a telestrator ring on the grass under a player */
function ring(s:Sheet,c:Cam,pl:Place,r:number,ink:string,seed=3){const q=ringPts(c,pl.x??0,pl.z??0,r);if(q.length>20){const rb=ribbon(q,Math.max(4,kAt(c,at3(pl,0))*.2),{close:true,taper:0,wobble:.6,seed});s.knockout(rb,.85);s.fill(ink,rb,.95);}}
/** a projected arrow (shaft + head) along 3D points */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,gaps?:[number,number][]){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the header lands on "heads it in"; the loose pass on "pass goes astray"; his pass on "Gravenberch finds" */
const tH1=()=>Math.min(CUE(0,'heads it in')+.1,SECS(0)-T_REST-1.2);
const tau1=(t:number)=>pw(t,mono([[CUE(0,'pass goes astray')+.15,T_CP],[CUE(0,'Gravenberch finds')+.2,T_GP],[tH1(),0]],.4));
const P1:V3=[-24,24,64];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,4,-6],fov:40})],
  [CUE(0,'Manchester United')-.3,1.4,()=>({P:P1,T:mix3(follow(tau),[-38,1,-6],.3),fov:17})],
  [CUE(0,'pass goes astray')-.1,.9,()=>({P:P1,T:mix3(follow(tau),at3(graAt(tau).place,1),.4),fov:10})],
  [CUE(0,'Liverpool break fast')-.1,.8,()=>({P:P1,T:add3(at3(graAt(tau).place,1),[2.5,0,0]),fov:9})],
  [CUE(0,'Gravenberch finds')-.1,1.2,()=>({P:P1,T:mix3(follow(tau),at3(salAt(tau).place,1),.3),fov:16})],
  [CUE(0,'Salah crosses')-.4,1,()=>({P:P1,T:mix3(follow(tau),[-8,1,-2],.45),fov:19})],
  [CUE(0,'far post')-.2,.8,()=>({P:P1,T:mix3(follow(tau),[-4,1,-3],.6),fov:12})],
  [tH1()+.7,1.2,()=>({P:P1,T:mix3([-6,1.2,-2],at3(diazAt(tau).place,1),.5),fov:17})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tH1()+T_NET;
  stadium(s,c,t,{roar:sm(tN,tN+.4,t),flash:.12+.88*sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "Liverpool break fast": a ring under him as he takes the loose ball, then a yellow arrow into the space in front
  const tb=CUE(0,'Liverpool break fast'),tg=CUE(0,'Gravenberch finds');
  const rl=sm(tb-.4,tb,t,easeOutBack)*(1-sm(tg-.1,tg+.3,t));
  if(rl>.02)ring(s,c,graAt(tau).place,1.4*rl,Y);
  const ar=sm(tb,tb+.5,t,easeOut)*(1-sm(tg,tg+.4,t));
  if(ar>.02){const a:V3=[G1[0]+1,.05,G1[1]+.6],b:V3=[G2P[0]+1.5,.05,G2P[1]+.9];arrow3(s,c,[a,mix3(a,b,ar*.5),mix3(a,b,ar)],Math.max(6,kAt(c,a)*.35),Y,.9);}
  // "far post": a red ring on the empty far post
  const fp=CUE(0,'far post'),rf=sm(fp-.1,fp+.3,t,easeOutBack)*(1-sm(tH1()+.2,tH1()+.6,t));
  if(rf>.02)ring(s,c,{x:DPC[0],z:DPC[1]},1.8*rf,R,9);
  play(s,c,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:12.4,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay: the carry (low tele), then a cut to the far post
const tC2=()=>CUE(1,'Nobody marks')-.3;
const tau2=(t:number)=>key(t,mono([[0,T_GR-1.1],[CUE(1,'Watch again'),T_GR-1],[CUE(1,'The pass'),T_GR-.35],[CUE(1,'comes loose')+.3,T_GR+.1],[CUE(1,'Gravenberch finds'),-5.0],[CUE(1,'in a flash'),T_GP-.15],[tC2()-.02,T_SR-.2],[tC2()+.03,T_X-.35],[CUE(1,'far post')+.1,-.9],[CUE(1,'heads it home'),-.05],[CUE(1,'heads it home')+.7,T_IN+.05],[SECS(1),T_REST+.6]]),linear);
const E2A:V3=[-31,1.6,14],E2B:V3=[-9,1.45,-31];
function cam2(t:number):Cam{
 const tau=tau2(t);
 return plan(t,[
  [0,0,()=>({P:E2A,T:mix3(at3(graAt(tau).place,1.1),follow(tau),.3),fov:9})],
  [CUE(1,'Gravenberch finds')-.2,1,()=>({P:E2A,T:mix3(at3(graAt(tau).place,1.1),follow(tau),.45),fov:12})],
  [CUE(1,'in a flash')-.3,.7,()=>({P:E2A,T:mix3(at3(graAt(tau).place,1.1),follow(tau),.85),fov:34})],
  [tC2(),.01,()=>({P:E2B,T:mix3(follow(tau),[-5,1.3,-4],.5),fov:26})],
  [CUE(1,'far post')-.3,.9,()=>({P:E2B,T:mix3(follow(tau),[-4.5,1.8,-4.5],.65),fov:17})],
  [CUE(1,'heads it home')+.2,1,()=>({P:E2B,T:[-2.2,1,-3],fov:21})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  const tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const shake=tau>=T_NET?5*settle(tau,T_NET,{freq:5,decay:5}):0;frame(s,shake,shake*.3);const c=cam2(t);
  stadium(s,c,t,{roar:sm(T_NET,T_NET+.4,tau),flash:sm(T_NET,T_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the cross so far, fading at the tail
  if(tau>T_X+.02&&tau<T_NET+.5){const pts=pathPts(c,Math.max(T_X,tau-.9),Math.min(tau,T_NET),22),fade=1-sm(T_NET,T_NET+.5,tau);if(pts.length>2){const w=Math.max(7,kAt(c,ballAt(Math.min(tau,0)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  // the carry: yellow ribbon of his run behind him
  if(tau>T_GR&&tau<T_GP+.6){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=graAt(lerp(T_GR,Math.min(tau,T_GP),i/16)).place,p=pr(c,[q.x??0,.03,q.z??0]);if(p)pts.push(p);}const fade=1-sm(T_GP+.1,T_GP+.6,tau);if(pts.length>2)s.fill(Y,ribbon(pts,Math.max(6,kAt(c,at3(graAt(tau).place,0))*.18),{taper:.9,pressure:.2,wobble:.5}),.8*fade);}
  // "Nobody marks the far post": a red ring on the empty space
  const nm=CUE(1,'Nobody marks'),rf=sm(nm,nm+.4,t,easeOutBack)*(1-sm(CUE(1,'heads it home'),CUE(1,'heads it home')+.4,t));
  if(rf>.02)ring(s,c,{x:DPC[0],z:DPC[1]},1.6*rf,R,9);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10});
  // the header: a spark at his forehead
  if(tp>-.06&&tp<.3){const p=pr(c,HD);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(45,kAt(c,HD)*.5)*sm(-.06,.08,tp,easeOut),{n:9,seed:31,g:1-sm(.1,.3,tp),width:8});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 still:7.6,
};

// ---------------------------------------------------------------- 3 · "How he does it": a training drill in bibs (a demonstration, not the match)
/** an attacker (red bib) dribbles at Gravenberch (navy training top); he pokes it away, looks up, and carries it into the open grass
 * while two defenders (red bibs) back off. τ3 = 0 is the steal. */
const W3:[number,number]=[0,0];
const bib=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.9],shorts:K,socks:K,boots:K,trim:'paper',skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.28],number:null,...o});
const ATT_ST=bib({seed:61,build:{height:1.8,bulk:.94}}),DEF1_ST=bib({seed:62,skin:SKIN_M,build:{height:1.84,bulk:.95}}),DEF2_ST=bib({seed:63,skin:SKIN_D,build:{height:1.82,bulk:.95}});
const GRA3_ST:AthleteStyle={...GRA_ST,shirt:[K,.9],shorts:K,socks:K,number:null,trim:[R,.8]};
const OPEN:[number,number]=[8.5,0];
/** the carry: after the poke he takes it, looks up, then pushes it forward in big touches */
const G3_KEYS:MKey[]=[[.25,W3[0]-.6,W3[1]+.2],[.9,.2,.1],[1.3,1.1,0],[2.1,4.6,0],[2.9,8.4,0],[3.6,11.6,0],[4.6,15.2,0]];
const G3_PUSH=[.95,1.55,2.3,3.05,3.75,4.4];
function gra3(tau:number):{pose:Pose;place:Place}{
 if(tau<.25){// ready, low; the poke lunge (right foot) meets the ball at τ = 0
  const pl:Place={x:W3[0]-1.4+.8*sm(-.8,0,tau),z:W3[1]+.35,yaw:0};let p=blendPose(stand(),posed({lean:22,lHipF:30,rHipF:26,lKnee:40,rKnee:38,lShA:22,rShA:22,lElb:40,rElb:40,neckP:10}),.8);
  const lu=clamp((tau+.55)/.9);if(lu>0)p=blendPose(p,lunge(lu,{side:'r'}),Math.sin(Math.PI*Math.min(lu,.6)/1.2));
  return{pose:p,place:pl};}
 const q=pathPos(G3_KEYS,tau),v=Math.hypot(q.vx,q.vz);let p=blendPose(lunge(.6,{side:'r'}),dribble(q.dist/1.6,{speed:clamp(v/7)}),sm(.25,.6,tau));
 let k=0;for(const x of G3_PUSH)k=Math.max(k,bumpT(tau,x,.2));if(k>0)p=blendPose(p,TOUCH(p),k*.85);
 // "look up": chin up, eyes on the open grass (and again between pushes)
 const up=sm(.55,.75,tau)*(1-sm(1.15,1.3,tau))+.7*sm(2.4,2.6,tau)*(1-sm(2.9,3.0,tau));
 p=headTo(p,{x:q.x,z:q.z,yaw:0},OPEN[0]+4,OPEN[1],up,-12);
 return{pose:p,place:{x:q.x,z:q.z,yaw:0}};}
function ball3(tau:number):V3{
 if(tau<0){const pl=att3(tau).place;const ph=Math.abs(Math.sin(tau*4.2));return[(pl.x??0)-.55-.25*ph,.11,(pl.z??0)+.05];}
 if(tau<.35){const u=clamp(tau/.35);return[lerp(1.0-.55,.1,u),.11+.25*Math.sin(Math.PI*u),lerp(.05,.1,u)];}
 const q=gra3(tau).place;let since=9;for(const p of G3_PUSH)if(tau>=p)since=tau-p;
 const k=.5+1.7*(1-Math.exp(-since*3))*Math.exp(-since*1.2);
 return mix3([.1,.11,.1],[(q.x??0)+k,.11,(q.z??0)+.1],sm(.35,.6,tau));}
function att3(tau:number):{pose:Pose;place:Place}{
 const x=tau<0?1.0-tau*2.4:1.0+Math.max(0,tau)*.4,pl:Place={x,z:W3[1]+.1,yaw:Math.PI};
 let p=tau<0?dribble(-tau*2,{speed:.35}):stand();
 if(tau>-.05){p=blendPose(p,posed({lean:-10,pitch:-6,neckP:20,lShA:50,rShA:40,lElb:30,rElb:30,lHipF:14,rHipF:-8,lKnee:22,rKnee:12}),sm(-.05,.3,tau));
  if(tau>.6){pl.yaw=lerpAng(Math.PI,0,sm(.6,1.2,tau));p=blendPose(p,runCycle((tau-.6)*1.6,{speed:.4}),sm(.8,1.2,tau));pl.x=x+Math.max(0,tau-.9)*2.6;}}
 return{pose:headTo(p,pl,tau<.6?x-1.2:x+3,0,.8,tau<0?24:6),place:pl};}
function def3(z0:number):(tau:number)=>{pose:Pose;place:Place}{return tau=>{
 const x0=13.5,g=gra3(tau).place.x??0,back=clamp((g-2.5)*.6,0,6.5),x=x0+back,pl:Place={x,z:z0-Math.sign(z0)*Math.min(1.6,back*.3),yaw:Math.PI};
 const moving=sm(1.8,2.3,tau)*(1-sm(4.4,4.9,tau));let p=blendPose(stand(),backpedal(tau*2.2),moving);
 return{pose:headTo(p,pl,g,0,1,6),place:pl};};}
const DEF_A=def3(-4.6),DEF_B=def3(4.4);
const tau3=(t:number)=>key(t,mono([[0,-2.6],[CUE(2,'How he does it'),-2.4],[CUE(2,'win the ball'),-.55],[CUE(2,'win the ball')+.6,.05],[CUE(2,'look up'),.55],[CUE(2,'spot the open grass'),.8],[CUE(2,'Carry it forward'),1.0],[CUE(2,'fast'),1.75],[CUE(2,'Defenders must'),2.4],[CUE(2,'back away'),2.9],[CUE(2,'After you win'),3.4],[CUE(2,'run into the space'),3.9],[SECS(2),4.9]]),linear);
const CONES:[number,number][]=[[-6,-7],[-2,-7],[2,-7],[6,-7],[10,-7],[14,-7],[18,-7],[22,-7],[-6,8],[22,8]];
function training(s:Sheet,c:Cam){
 s.field(B,.2,.4);
 const gp=polyP(c,[[-60,0,-42],[60,0,-42],[60,0,38],[-60,0,38]]);
 if(gp.length>2){const g=polyPath(gp,true);s.knockout(g);s.fill(Y,g,.95);s.tone(B,g,.6);}
 const trees=new Path2D();for(let i=0;i<30;i++){const x=-60+i*4.2,h=7+4*hash(i,3),p:V3[]=[];for(let k=0;k<10;k++){const a=k/10*TAU;p.push([x+Math.cos(a)*3.4,h*.5+Math.sin(a)*h*.5,-42+Math.sin(a*2)*.5]);}addPoly(trees,polyP(c,p));}
 s.knockout(trees);s.fill(K,trees,.55);s.tone(B,trees,.55);
 const st=new Path2D();for(let x=-60;x<60;x+=8)addPoly(st,polyP(c,[[x,0,-42],[x+4,0,-42],[x+4,0,38],[x,0,38]]));s.tone(B,st,.16);
 const cn=new Path2D();for(const[x,z] of CONES)addPoly(cn,polyP(c,[[x-.18,0,z],[x+.18,0,z],[x,.32,z]]));s.knockout(cn);s.fill(R,cn,.95);s.fill(Y,cn,.5);
}
function cam3v(t:number):Cam{
 const tau=tau3(t),gx=()=>gra3(tau).place.x??0;
 return plan(t,[
  [0,0,()=>({P:[1,5.2,15],T:[1,.9,0],fov:27})],
  [CUE(2,'win the ball')-.3,.8,()=>({P:[0,3.2,9.5],T:[.2,.9,0],fov:25})],
  [CUE(2,'look up')-.2,.9,()=>({P:[1.5,3.4,10],T:[1.2,1.3,0],fov:24})],
  [CUE(2,'spot the open grass')-.1,1.1,()=>({P:[5,6.5,17],T:[6.5,.6,0],fov:30})],
  [CUE(2,'Carry it forward')-.1,1.2,()=>({P:[gx()+3,5.8,15],T:[gx()+3.2,.8,0],fov:30})],
  [CUE(2,'After you win')-.2,1.2,()=>({P:[gx()+3,6.2,17],T:[gx()+3.4,.8,0],fov:33})],
 ]);
}
function drawDemo(s:Sheet,c:Cam,tau:number,tp:number,tpp:number){
 const items:{d:number;draw:()=>void}[]=[];
 const add=(f:(x:number)=>{pose:Pose;place:Place},st:AthleteStyle,sm2=false)=>{const cur=f(tp),d=toCam(c,at3(cur.place,.9))[2];if(d<1)return;items.push({d,draw:()=>drawPlayer(s,cur.pose,c,st,cur.place,f(tpp),sm2)});};
 add(att3,ATT_ST);add(DEF_A,DEF1_ST);add(DEF_B,DEF2_ST);add(gra3,GRA3_ST,(tp>-.3&&tp<.25)||G3_PUSH.some(x=>Math.abs(tp-x)<.12));
 const bp=ball3(tau),bq=toCam(c,bp);if(bq[2]>NEAR)items.push({d:bq[2],draw:()=>{drawBallAt(s,c,bp,tau*5,{min:12});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tW=CUE(2,'win the ball'),tU=CUE(2,'look up'),tO=CUE(2,'spot the open grass'),tC=CUE(2,'Carry it forward'),tF=CUE(2,'fast'),tB=CUE(2,'back away'),tA=CUE(2,'After you win'),tR=CUE(2,'run into the space');
  training(s,c);
  // "spot the open grass": a dashed yellow patch in front of him, pulsing again on "run into the space"
  const op=sm(tO-.1,tO+.4,t,easeOutBack)*(1-sm(tB+.2,tB+.6,t))+sm(tR-.1,tR+.4,t,easeOutBack);
  if(op>.02){const ox=lerp(OPEN[0],(gra3(tp).place.x??0)+3.4,sm(tB+.2,tR,t)),q=ringPts(c,ox,OPEN[1],2.6*Math.min(1,op),36);if(q.length>24){const gaps:[number,number][]=[];for(let x=.03;x<1;x+=.1)gaps.push([x,x+.04]);const rr=ribbon(q,Math.max(5,kAt(c,[ox,0,OPEN[1]])*.14),{close:true,seed:43,taper:0,wobble:1,gaps});s.knockout(rr,.9);s.fill(Y,rr,.95);}}
  // "Carry it forward": a yellow arrow from his feet into the space
  const ca=sm(tC-.1,tC+.4,t,easeOut)*(1-sm(tA,tA+.4,t));
  if(ca>.02){const g=gra3(tp).place,a:V3=[(g.x??0)+.9,.04,-.9],b:V3=[OPEN[0]+2.6,.04,-.9];arrow3(s,c,[a,mix3(a,b,ca*.5),mix3(a,b,ca)],Math.max(7,kAt(c,a)*.1),Y,.95);}
  // "back away": red arrows behind the two defenders
  const bw=sm(tB-.2,tB+.3,t,easeOut)*(1-sm(tA+.2,tA+.6,t));
  if(bw>.02)for(const f of[DEF_A,DEF_B]){const d=f(tp).place,a:V3=[(d.x??0)+.8,.04,d.z??0],b:V3=[(d.x??0)+.8+2.6*bw,.04,d.z??0];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.08),R,.95);}
  drawDemo(s,c,tau,tp,tpp);
  // "win the ball": a spark at the poke
  if(tp>-.06&&tp<.35){const P:V3=[-.4,.2,.1],p=pr(c,P);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,P)*.5)*sm(-.06,.08,tp,easeOut),{n:9,seed:61,g:1-sm(.12,.35,tp),width:Math.max(6,kAt(c,P)*.035)});}
  // "look up": a red ring round his head and a dashed sight line to the open grass
  const ey=sm(tU-.1,tU+.3,t,easeOut)*(1-sm(tC-.1,tC+.3,t));
  if(ey>.02){const pp=gra3(tp),sk=solve(pp.pose,GRA3_ST.build,pp.place),eye=add3(sk.face,[0,.02,0]),tgt:V3=[OPEN[0],.2,OPEN[1]];
   const a=pr(c,eye),bb=pr(c,mix3(eye,tgt,ey*.9));if(a&&bb){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.6)/9.4,(i+.95)/9.4]);const w=Math.max(8,kAt(c,eye)*.05),rb=ribbon([a,bb],w,{seed:13,taper:.25,wobble:.5,gaps});s.knockout(ribbon([a,bb],w*1.7,{seed:13,taper:.25,wobble:.5,gaps}),.9);s.fill(R,rb,.95);s.stroke(K,rb,Math.max(2,w*.14),.85);}
   const hr=kAt(c,sk.head)*.24,hp=pr(c,sk.head);if(hp){const pts:Pt[]=[];for(let i=0;i<24;i++){const a2=i/24*TAU;pts.push([hp[0]+Math.cos(a2)*hr,hp[1]+Math.sin(a2)*hr]);}const rr=ribbon(pts,Math.max(4,hr*.14),{close:true,taper:0,wobble:.8,seed:5});s.knockout(rr,.9);s.fill(R,rr,.95);}}
  // "fast": speed lines off the carry
  if(t>tF-.1){const q=gra3(tp).place,p=pr(c,at3(q,.9));if(p){const f=pr(c,[(q.x??0)+2,.9,q.z??0]);if(f)speedLines(s,K,p[0],p[1],Math.atan2(p[1]-f[1],p[0]-f[0]),{n:4,seed:9,len:Math.max(60,kAt(c,at3(q,1))*1.1),spread:kAt(c,at3(q,1))*.5,width:4,cov:.7*sm(tF-.1,tF+.3,t)});}}
 },
 still:9,
};

const film:RisoStory={
 id:'gravenberch-signature',format:'11v11',title:'Ryan Gravenberch: steal and carry',
 theme:'After you win the ball, carry it forward into the space in front of you',
 ageNote:'Manchester United 0–3 Liverpool, Premier League, Old Trafford, 1 September 2024: the fast counter behind the first goal. Chapter 3 is a training demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: steal and carry — a red dash takes the ball and a yellow arrow carries it forward. Reduced motion: the still mark. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  s.fill(R,ribbon([[x-40,y+80],[x,y]],14,{seed,taper:.5,pressure:.3,wobble:1}),.9*fade);
  const e:Pt=[x+lerp(0,170,u),y+lerp(0,-30,u)];
  s.fill(Y,ribbon([[x,y],[e[0],e[1]]],13,{seed:seed+1,taper:.3,pressure:.2,wobble:1}),.9*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],28,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
