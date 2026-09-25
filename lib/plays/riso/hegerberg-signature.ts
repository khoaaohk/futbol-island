/** Ada Hegerberg's SIGNATURE film, "the striker's run": her first-half hat-trick in the 2019 UEFA Women's Champions League final, Lyon 4–1
 * Barcelona, Saturday 18 May 2019 (kick-off 18:00 CEST), Groupama Arena (Ferencváros Stadion), Budapest — goals in the 14th, 19th and 30th
 * minutes. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 * A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the striker's run to the near post"; lesson: "Move a split second before the
 * cross so the defender cannot follow you"). The 2019 final is the best-documented match of her career (a hat-trick in 16–17 minutes, Player
 * of the Match), and all three goals came from balls played in from the flanks — two low from the right. The first goal (14') is filmed in
 * full and slow-replayed: Van de Sanden beat Ouahabi down the right and crossed low, and Hegerberg got there first and slid it under Paños.
 * Her exact run is not described by the sources, so the run is drawn as the signature describes it and the narration never claims more than
 * the reports ("she darts in front"; the near-post rule is said only as the general lesson).
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2019 UEFA Women's Champions League final" (raw wikitext: date, 18:00 CEST kick-off, Groupama Arena, 19,487, sunny 24 °C,
 *    scorers and minutes, line-ups with shirt numbers, the kit templates — Lyon all white (_ol1920), Barcelona home _fcbarcelona1819H with
 *    blue shorts and socks)  https://en.wikipedia.org/wiki/2019_UEFA_Women%27s_Champions_League_final
 *  - The Guardian, Suzanne Wrack, "Hegerberg stars as Lyon crush Barcelona to win Women's Champions League" (18 May 2019)
 *    https://www.theguardian.com/football/2019/may/18/lyon-barcelona-womens-champions-league-final-match-report
 *  - Reuters, Simon Evans, "Hegerberg hat-trick fires Lyon to fourth straight Champions League" (18 May 2019, web.archive.org copy)
 *  - Norwegian Wikipedia, "Mesterligafinalen i fotball for kvinner 2018/19" (line-ups; no extra goal detail)
 * CONFIRMED: Lyon 4–1 Barcelona; Marozsán 5', Hegerberg 14', 19', 30', Oshoala 89'. 14': "Van de Sanden, fed by the England right-back Lucy
 * Bronze, again left Ouahabi trailing and played an almost identical pass from the right, but this time it was Hegerberg's turn, coolly
 * slotting under Paños" (Guardian); "another low cross from Van de Sanden after England's Lucy Bronze had set up the counter-attack with a
 * strong breakout from the back" (Reuters). 19': "Amel Majri skipping into the box from the left and slipping the ball to Hegerberg who
 * hooked in with her left foot" (Guardian); "driven home first time" (Reuters). 30': "Bronze this time was the provider, sending a pinpoint
 * cross in for the Norwegian to turn home" (Guardian); "the overlapping Bronze whipped in a ball from the right" (Reuters). Numbers: Lyon
 * Hegerberg 14, Bronze 2, Van de Sanden 11, Majri 7, Marozsán 10, Le Sommer 9, Henry 6, Renard 3; Barcelona Paños 1 (keeper), Torrejón 8
 * (RB), Pereira 17, Mapi León 4 (CBs), Ouahabi 15 (LB), Losada 6. Kits: Lyon all white; Barcelona in their 2018–19 home shirt (blue and
 * garnet stripes, blue shorts and socks).
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds; the direction of play on screen (Lyon attack
 * the goal at x = 0, their right wing on the main-stand side); Hegerberg's run (waiting on the blind side of Mapi León, then darting across
 * her toward the near post a split second before the cross — the signature, not described in the reports; which defender marked her is not
 * stated); that she finished the first with her RIGHT foot (not stated), the shot's line under the diving Paños; how the third was finished
 * (drawn as a first-time right-foot stab at knee height at the near post; "turn home" does not say foot or head, so the narration does not
 * either); Majri's passing foot (left) and exact spot; the goalkeepers' kits (Paños drawn in yellow); hair and builds; the celebrations;
 * Groupama Arena's look (one green-seated, roofed bowl) and crowd colours; the early-evening sun (≈ 18:15–18:30 in May); TV camera positions
 * and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Bronze breaks out, Van de Sanden races past
 * Ouahabi and crosses low, Hegerberg slides it under Paños; ch2 = the same camera, brisk: Majri slips it across, the left-foot hook (2),
 * a whip-pan across the one world to the right wing, Bronze's cross, the hat-trick; ch3 = the slow-motion replay of the first goal from a
 * LOW camera beside the near post: she waits on her defender's blind side, darts across her a split second before the cross (a riso trail),
 * the defender a step behind (a red lag trail); ch4 = the lesson from a low touchline angle: the moment to go (rings on the cross and her
 * first step), the late run that gets blocked (a navy ghost), the dart to the near post (arrow + target ring), the gap the defender can't close.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion so the ponytails swing, motionSmear on the sprints and strikes); women's builds (1.62–1.77 m, slimmer bulk) with
 * ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward
 * the goal Barcelona defend, y up, +z = Lyon's right = the main-stand side), athlete.ts's own convention, so foot:'r' is the right foot.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,volley,runCycle,stand,keeperSet,keeperDive,celebrate,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/hegerberg-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/hegerberg-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The first goal, live',text:'Budapest, 2019. Lyon play Barcelona in the Women\'s Champions League final. Van de Sanden races clear, crosses low... Ada Hegerberg slides it under the keeper!',tail:2.2,
  cues:['Budapest','Lyon play Barcelona','final','Van de Sanden','crosses low','Ada Hegerberg','slides it','under the keeper']},
 {label:'Hat-trick',text:'Five minutes later, Majri slips it across. Left foot, two! Then Bronze whips it in. A hat-trick before the half-hour!',tail:2,
  cues:['Five minutes','Majri slips','Left foot','two','Then Bronze','whips it','hat-trick','half-hour']},
 {label:'The run',text:'Watch it again. Ada waits by her defender. A split second before the cross, she darts in front. Too late to follow!',tail:1.4,
  cues:['Watch it','waits by','split second','darts in front','Too late']},
 {label:'The secret',text:'The secret? Move a split second before the cross, not after. Dart to the near post, and your defender cannot follow.',tail:1.9,
  cues:['The secret','Move a split','not after','Dart to','near post','cannot follow']},
];
import timingJson from '../../../public/plays/narration/hegerberg-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('hegerberg: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('hegerberg: no cue '+w);return c.at;};
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
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
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

// ---------------------------------------------------------------- Groupama Arena, early evening sun: one green-seated, roofed bowl
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+16*b,-40-21*b],
 (a,b)=>[7+19*b,1.3+14*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+16*b,40+21*b],
 (a,b)=>[-111-19*b,1.3+14*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=11;
/** flags on the stand fronts: [stand, a, kind 0 = Lyon (white, red + blue), 1 = Barça (blue + garnet stripes)] */
const FLAGS:[number,number,number][]=[[0,.3,1],[0,.44,0],[0,.58,1],[0,.72,0],[0,.86,0],[1,.22,0],[1,.46,0],[1,.7,1],[2,.14,0],[2,.3,1],[3,.3,1],[3,.66,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear May evening sky (≈ 18:20): pale blue, warm low sun haze
 s.field(B,.2,.45);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-360],[1e4,hz[1]-360],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);seg3(c,S(0,.5),S(1,.5),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.78),[0,6.5,0]),add3(S(0,.78),[0,6.5,0])]));
  seg3(c,add3(S(0,.78),[0,6.3,0]),add3(S(1,.78),[0,6.3,0]),.4,edge);}
 // green seats: yellow + blue overprint
 s.knockout(planes);s.tone(Y,planes,.7);s.tone(B,planes,.62);s.knockout(walk,.85);
 // the crowd: Lyon white, red and blue; Barça blue and garnet; Budapest neutrals
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.75?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(B,inks[2],.9);s.fill(K,inks[3],.9);
 // the roof, its navy underside edge
 s.knockout(roof);s.tone(B,roof,.15);s.fill(K,edge,.85);
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D(),st=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(rd,polyP(c,[P(0,.03),P(1,.03),P(1,.045),P(0,.045)]));addPoly(bl,polyP(c,[P(0,.045),P(1,.045),P(1,.06),P(0,.06)]));}
  else{st.addPath(polyPath(q,true));for(let k=0;k<5;k+=2)addPoly(rd,polyP(c,[P(k/5,.005),P((k+1)/5,.005),P((k+1)/5,.075),P(k/5,.075)]));}}
 s.knockout(fl);s.knockout(st);s.fill(B,st,.95);s.fill(R,rd,.95);s.fill(B,bl,.95);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // the far stand's evening shadow across the far touchline strip
 const sh=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,-27],[-116,0,-31]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.22);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goalNet(s,c,o.bulge??0,o.bz??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the shot went in (z ≈ bz) */
function goalNet(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.6,2)),back=(z:number)=>X+2+bw(z)*.7,top=(z:number)=>1.9+bw(z)*.2;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),top(z),z],.022,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),top(zs[i])*f,zs[i]],[back(zs[i+1]),top(zs[i+1])*f,zs[i+1]],.022,mesh,.7);seg3(c,[X,H*f,z0],[back(z0),top(z0)*f,z0],.022,mesh,.7);seg3(c,[X,H*f,z1],[back(z1),top(z1)*f,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[R,.42],[Y,.4],[K,.12]],SKIN_D:InkFill[]=[[R,.5],[K,.4],[Y,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Lyon all white (Wikipedia kit template, this match) with red and blue trim; Barcelona 2018–19 home: blue and garnet stripes, blue shorts and socks */
const lyon=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:[B,.95],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.9],pattern:'stripes',patternInk:[R,.95],numberInk:[Y,.95],hairStyle:'ponytail',build:W_BUILD(1.67),...o});
const HEG_B=W_BUILD(1.77,.95);
const HEG_ST=lyon({number:14,hair:[Y,.95],build:HEG_B,seed:14});
const VDS_ST=lyon({number:11,skin:SKIN_D,hair:K,hairStyle:'ponytail',build:W_BUILD(1.67,.95),seed:11});
const BRONZE_ST=lyon({number:2,hair:[K,.85],build:W_BUILD(1.72,.95),seed:2});
const MAJRI_ST=lyon({number:7,skin:SKIN_M,hair:K,build:W_BUILD(1.64),seed:7});
const MAPI_ST=barca({number:4,hair:[R,.5],build:W_BUILD(1.7,.93),seed:4});
const PANOS_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:W_BUILD(1.66,.95),seed:1};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-10,T_MAX=9,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const CYCLE_M=3.7;
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
const dirOf=(a:V3,b:V3):[number,number]=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------------------------------------------------------- one goal = a Play on its own clock τ (seconds; τ = 0 is Hegerberg's contact)
type Move='strike'|'volley';
type Kick={t:number;foot:'l'|'r';power:number;move?:Move;height?:number};
type Role='hero'|'kicker'|'keeper'|'marker'|'lyon'|'barca';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;kick?:Kick;dive?:{t:number;side:'l'|'r';height:number};lunge?:{t:number;side:'l'|'r'}};
/** ball segments: carried at an actor's feet, or kicked from A to B (arc = extra height at the middle, m) */
type Seg={t0:number;t1:number;carry?:string;A?:V3;B?:V3;arc?:number;ease?:number};
type Play={name:string;actors:Actor[];segs:Seg[];M:V3;G:V3;T_SHOT:number;NET:V3;REST:V3;hero:Actor;marker?:Actor;celebDir:[number,number]};
const SD=.9;
/** the pelvis spot where a kicker's boot meets the ball at P, body turned to face dir (solved once through the skeleton) */
function kickSpot(P:V3,dir:[number,number],k:Kick,build:Build):[number,number]{
 const yaw=yawTo(0,0,dir[0],dir[1]),move=k.move??'strike',u=move==='volley'?.5:STRIKE_CONTACT;
 const pose=move==='volley'?volley(u,{foot:k.foot,height:k.height??.3}):strike(u,{foot:k.foot,power:k.power});
 const sk=solve(pose,build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe;
 return[P[0]-dir[0]*.12-toe[0],P[2]-dir[1]*.12-toe[2]];
}
const kickYaw=(dir:[number,number])=>yawTo(0,0,dir[0],dir[1]);

/** GOAL 1 (14'): Bronze breaks out and feeds Van de Sanden, who races past Ouahabi and crosses low from the right; Hegerberg darts across
 * Mapi León a split second before the cross and slides it under Paños (right foot, inferred). */
function goal1():Play{
 const PASS_A:V3=[-50.2,.11,21.6],PASS_B:V3=[-39.5,.11,27.2],C:V3=[-15.6,.11,19.4],M:V3=[-6.9,.11,2.5],G:V3=[0,.18,1.05];
 const T_PASS=-5,T_REC=-4.15,T_C=-1,T_SHOT=.42;
 const pdir=dirOf(PASS_A,PASS_B),cdir=dirOf(C,M),sdir=dirOf(M,G);
 const bronzeK:Kick={t:T_PASS,foot:'r',power:.6},vdsK:Kick={t:T_C,foot:'r',power:.8},hegK:Kick={t:0,foot:'r',power:.55};
 const PBr=kickSpot(PASS_A,pdir,bronzeK,BRONZE_ST.build!),PV=kickSpot(C,cdir,vdsK,VDS_ST.build!),PH=kickSpot(M,sdir,hegK,HEG_B);
 const hero:Actor={name:'Hegerberg',role:'hero',st:HEG_ST,kick:hegK,phase:.2,
  path:[[-10,-21,-2.6],[-6,-17.4,-1.9],[-3.2,-14,-1],[-1.6,-12.6,-.6],[-1.3,-12.5,-.55],[-.8,-11.3,.7],[-.38,-9.3,1.9],[0,PH[0],PH[1]],[.6,PH[0]+sdir[0]*1.5,PH[1]+sdir[1]*1.3],[1.6,-3.6,5.2],[3,-3.2,10.5],[5,-4.5,15.5],[7,-5.5,17]]};
 const marker:Actor={name:'Mapi Leon',role:'marker',st:MAPI_ST,phase:.6,lunge:{t:-.05,side:'r'},
  path:[[-10,-16.5,-3.4],[-4,-11.8,-2.2],[-1.3,-10.5,-1.7],[-.9,-10.35,-1.35],[-.45,-9.7,-.3],[0,-8.7,.85],[.5,-7.8,1.5],[2,-7.4,1.8]]};
 const actors:Actor[]=[hero,marker,
  {name:'Bronze',role:'kicker',st:BRONZE_ST,kick:bronzeK,phase:.1,path:[[-10,-63,17.5],[-8,-59,19],[T_PASS-.9,PBr[0]-pdir[0]*6.2,PBr[1]-pdir[1]*6.2],[T_PASS,PBr[0],PBr[1]],[-3.4,-44,23.2],[-1,-36,23.5],[3,-30,22]]},
  {name:'Van de Sanden',role:'kicker',st:VDS_ST,kick:vdsK,phase:.4,path:[[-10,-51,32],[-7,-47,31],[-5,-42.5,29.6],[T_REC,PASS_B[0]-.7,PASS_B[1]-.1],[-2.6,-28,24.3],[T_C-.35,PV[0]-cdir[0]*2.4,PV[1]-cdir[1]*2.4+.5],[T_C,PV[0],PV[1]],[0,-12.8,15.8],[1.6,-10.5,14],[4,-9,14]]},
  {name:'Ouahabi',role:'barca',st:barca({number:15,skin:SKIN_M,hair:K,build:W_BUILD(1.64),seed:15}),phase:.8,path:[[-10,-40,23],[-5,-38.5,24.6],[-4,-38,25.6],[-2.6,-31.5,24.5],[-1.2,-21.5,22.4],[0,-15.8,19.5],[2,-13,17.5]]},
  {name:'Paños',role:'keeper',st:PANOS_ST,phase:0,dive:{t:.24,side:'r',height:0},path:[[-10,-1.4,.2],[-2,-1.3,1],[-1,-1.4,1.9],[-.3,-2.3,2.3],[0,-2.65,2.25],[3,-2.7,2.2]]},
  {name:'Pereira',role:'barca',st:barca({number:17,build:W_BUILD(1.71),seed:17}),phase:.3,path:[[-10,-18,-9],[-4,-12.5,-6.5],[-1,-9.8,-4.4],[1,-8.4,-3.2],[3,-8,-3]]},
  {name:'Torrejón',role:'barca',st:barca({number:8,build:W_BUILD(1.64),seed:8}),phase:.55,path:[[-10,-24,-16],[-4,-16,-13],[0,-11,-11],[3,-10,-10]]},
  {name:'Losada',role:'barca',st:barca({number:6,build:W_BUILD(1.6),seed:6}),phase:.15,path:[[-10,-36,6],[-4,-25,8],[0,-17,7.4],[3,-15,7]]},
  {name:'Le Sommer',role:'lyon',st:lyon({number:9,hair:[K,.8],build:W_BUILD(1.61),seed:9}),phase:.7,path:[[-10,-34,-13],[-4,-20,-9.5],[0,-9.6,-6.2],[2,-8,-5.2],[4,-7,4]]},
  {name:'Marozsán',role:'lyon',st:lyon({number:10,hair:[Y,.8],build:W_BUILD(1.71),seed:10}),phase:.35,path:[[-10,-40,3],[-4,-26,4.5],[0,-17,3.5],[2,-14,5],[4,-8,12]]},
 ];
 const segs:Seg[]=[{t0:-10,t1:T_PASS,carry:'Bronze'},{t0:T_PASS,t1:T_REC,A:PASS_A,B:PASS_B,arc:.05,ease:.25},{t0:T_REC,t1:T_C,carry:'Van de Sanden'},{t0:T_C,t1:0,A:C,B:M,arc:.12,ease:.28}];
 return{name:'g1',actors,segs,M,G,T_SHOT,NET:[1.6,.35,.9],REST:[1.3,.11,.8],hero,marker,celebDir:[-4.5,15.5]};
}
/** GOAL 2 (19'): Majri skips into the box from the left and slips it across; Hegerberg hooks it in first time with her LEFT foot. */
function goal2():Play{
 const C:V3=[-11.8,.11,-12.4],M:V3=[-8.7,.11,-2.3],G:V3=[0,.42,2.2];const T_C=-.9,T_SHOT=.5;
 const cdir=dirOf(C,M),sdir=dirOf(M,G);const majK:Kick={t:T_C,foot:'l',power:.45},hegK:Kick={t:0,foot:'l',power:.9};
 const PM=kickSpot(C,cdir,majK,MAJRI_ST.build!),PH=kickSpot(M,sdir,hegK,HEG_B);
 const hero:Actor={name:'Hegerberg',role:'hero',st:HEG_ST,kick:hegK,phase:.2,path:[[-10,-18,.5],[-3,-14.2,-.4],[-1.4,-12.3,-1.3],[-.6,-10.6,-2],[0,PH[0],PH[1]],[.6,PH[0]+1.3,PH[1]+.7],[2,-6,-6],[4,-6.5,-13],[7,-7,-16]]};
 const marker:Actor={name:'Pereira',role:'marker',st:barca({number:17,build:W_BUILD(1.71),seed:17}),phase:.3,lunge:{t:-.1,side:'l'},path:[[-10,-14,-2.5],[-2,-10.6,-3.6],[-.6,-10.1,-3.4],[0,-9.5,-3.3],[2,-9,-3]]};
 const actors:Actor[]=[hero,marker,
  {name:'Majri',role:'kicker',st:MAJRI_ST,kick:majK,phase:.5,path:[[-10,-34,-21],[-3,-22.5,-17.2],[T_C-.6,PM[0]-cdir[0]*1.2-3,PM[1]-cdir[1]*1.2-1.1],[T_C,PM[0],PM[1]],[0,-10.4,-11],[3,-9,-12]]},
  {name:'Torrejón',role:'barca',st:barca({number:8,build:W_BUILD(1.64),seed:8}),phase:.55,path:[[-10,-26,-15],[-3,-20,-15.4],[-1.5,-15.6,-13.8],[0,-12.2,-12.4],[3,-11,-12]]},
  {name:'Paños',role:'keeper',st:PANOS_ST,phase:0,dive:{t:.3,side:'l',height:.35},path:[[-10,-1.4,-.4],[-1,-1.7,-1.5],[0,-2,-1.2],[3,-2,-1.2]]},
  {name:'Mapi Leon',role:'barca',st:MAPI_ST,phase:.6,path:[[-10,-13,2],[-2,-9.8,1.1],[0,-8.8,.2],[3,-8.4,0]]},
  {name:'Ouahabi',role:'barca',st:barca({number:15,skin:SKIN_M,hair:K,build:W_BUILD(1.64),seed:15}),phase:.8,path:[[-10,-16,9],[-2,-11.5,7.2],[0,-9.5,5.8],[3,-9,5.4]]},
  {name:'Van de Sanden',role:'lyon',st:VDS_ST,phase:.4,path:[[-10,-18,11],[-2,-12.5,8.2],[0,-8.8,5.4],[2,-6.5,1],[4,-6.2,-6]]},
  {name:'Le Sommer',role:'lyon',st:lyon({number:9,hair:[K,.8],build:W_BUILD(1.61),seed:9}),phase:.7,path:[[-10,-22,-8],[-2,-14.6,-7.2],[0,-11.5,-6.4],[2,-9,-8],[4,-7.4,-12.5]]},
  {name:'Marozsán',role:'lyon',st:lyon({number:10,hair:[Y,.8],build:W_BUILD(1.71),seed:10}),phase:.35,path:[[-10,-26,1],[-2,-18,1.4],[0,-15.5,.6],[2,-12,-3],[4,-9,-10]]},
  {name:'Losada',role:'barca',st:barca({number:6,build:W_BUILD(1.6),seed:6}),phase:.15,path:[[-10,-22,-4],[-2,-15.5,-3],[0,-13.8,-2.6],[3,-13,-2.4]]},
 ];
 const segs:Seg[]=[{t0:-10,t1:T_C,carry:'Majri'},{t0:T_C,t1:0,A:C,B:M,arc:.03,ease:.3}];
 return{name:'g2',actors,segs,M,G,T_SHOT,NET:[1.7,.5,2],REST:[1.35,.11,1.8],hero,marker,celebDir:[-6.5,-13]};
}
/** GOAL 3 (30'): the overlapping Bronze whips a ball in from the right; Hegerberg meets it at the near post and turns it home (finish inferred). */
function goal3():Play{
 const C:V3=[-19.2,.11,23.2],G:V3=[0,.48,-1.5];const T_C=-1.2,T_SHOT=.4;
 const heroK:Kick={t:0,foot:'r',power:.6,move:'volley',height:.3};
 // meet height: where her boot is at the volley's contact
 const toeY=(()=>{const sk=solve(volley(.5,{foot:'r',height:.3}),HEG_B,{x:0,z:0,yaw:0});return Math.max(.2,sk.rToe[1]+.06);})();
 const M:V3=[-6.4,toeY,.9],cdir=dirOf(C,M),sdir=dirOf(M,G);
 const bK:Kick={t:T_C,foot:'r',power:.9};const PB=kickSpot(C,cdir,bK,BRONZE_ST.build!);
 const PH=kickSpot(M,sdir,heroK,HEG_B);
 const hero:Actor={name:'Hegerberg',role:'hero',st:HEG_ST,kick:heroK,phase:.2,path:[[-10,-19,-2.4],[-3,-14.2,-2],[-1.6,-12.4,-1.8],[-1.45,-12.3,-1.75],[-.9,-10.7,-.7],[-.42,-8.9,.1],[0,PH[0],PH[1]],[.6,PH[0]+.9,PH[1]+.9],[2,-4.5,8],[4,-6,16],[7,-7,18]]};
 const marker:Actor={name:'Mapi Leon',role:'marker',st:MAPI_ST,phase:.6,lunge:{t:-.05,side:'r'},path:[[-10,-15,-3.8],[-2,-10.9,-3],[-1.2,-10.4,-2.7],[-.5,-9.6,-1.6],[0,-8.8,-.8],[2,-8.2,-.5]]};
 const actors:Actor[]=[hero,marker,
  {name:'Bronze',role:'kicker',st:BRONZE_ST,kick:bK,phase:.1,path:[[-10,-58,28],[-4.4,-44,27.5],[-2.6,-31,25.8],[T_C,PB[0],PB[1]],[0,-16.5,22.4],[3,-14,19]]},
  {name:'Van de Sanden',role:'lyon',st:VDS_ST,phase:.4,path:[[-10,-30,18],[-4.4,-25,18.6],[-2,-19.5,16.4],[0,-15,13],[2,-10,11],[4,-7,14]]},
  {name:'Ouahabi',role:'barca',st:barca({number:15,skin:SKIN_M,hair:K,build:W_BUILD(1.64),seed:15}),phase:.8,path:[[-10,-26,17],[-4.4,-22.5,17.4],[-2,-18,16],[0,-15.5,14],[3,-13,13]]},
  {name:'Pereira',role:'barca',st:barca({number:17,build:W_BUILD(1.71),seed:17}),phase:.3,path:[[-10,-14,4],[-2,-9.8,3.6],[0,-8.3,2.6],[3,-7.6,2.4]]},
  {name:'Paños',role:'keeper',st:PANOS_ST,phase:0,dive:{t:.24,side:'r',height:.3},path:[[-10,-1.4,1],[-1,-1.6,1.8],[0,-1.9,1.5],[3,-1.9,1.5]]},
  {name:'Torrejón',role:'barca',st:barca({number:8,build:W_BUILD(1.64),seed:8}),phase:.55,path:[[-10,-18,-12],[-2,-11.5,-9],[0,-9.2,-7],[3,-9,-6.5]]},
  {name:'Le Sommer',role:'lyon',st:lyon({number:9,hair:[K,.8],build:W_BUILD(1.61),seed:9}),phase:.7,path:[[-10,-20,-10],[-2,-12,-8],[0,-8.4,-6],[2,-7.5,-3],[4,-6,10]]},
  {name:'Marozsán',role:'lyon',st:lyon({number:10,hair:[Y,.8],build:W_BUILD(1.71),seed:10}),phase:.35,path:[[-10,-30,2],[-2,-20,2.4],[0,-16.6,2.2],[2,-13,6],[4,-9,13]]},
  {name:'Losada',role:'barca',st:barca({number:6,build:W_BUILD(1.6),seed:6}),phase:.15,path:[[-10,-28,5],[-2,-19.5,6.5],[0,-16.8,6.2],[3,-16,6]]},
 ];
 const segs:Seg[]=[{t0:-10,t1:T_C,carry:'Bronze'},{t0:T_C,t1:0,A:C,B:M,arc:1.35,ease:.12}];
 return{name:'g3',actors,segs,M,G,T_SHOT,NET:[1.6,.55,-1.4],REST:[1.3,.11,-1.2],hero,marker,celebDir:[-6,16]};
}
const G1=goal1(),G2=goal2(),G3=goal3();

// ---------------------------------------------------------------- the ball on a play's clock
const T_NETD=.1;
function shotAt(pl:Play,u:number):V3{const e=u*(1.06-.06*u);return[lerp(pl.M[0],pl.G[0],e),lerp(pl.M[1],pl.G[1],e)+.12*Math.sin(Math.PI*e),lerp(pl.M[2],pl.G[2],e)];}
function carryAt(pl:Play,who:string,tau:number):V3{const a=pl.actors.find(x=>x.name===who)!;const p=placeOf(pl,a,tau),ahead=pathAt(a.path,tau+.15),pp=pathAt(a.path,tau);
 const d=Math.hypot(ahead[0]-pp[0],ahead[1]-pp[1])||1,dx=(ahead[0]-pp[0])/d,dz=(ahead[1]-pp[1])/d,touch=.45+.35*Math.abs(Math.sin(tau*4.4));return[(p.x??0)+dx*touch,.11,(p.z??0)+dz*touch];}
function ballAt(pl:Play,tau:number):V3{
 if(tau<0){for(let i=0;i<pl.segs.length;i++){const s=pl.segs[i];if(tau>=s.t1&&i<pl.segs.length-1)continue;
  if(s.carry){const c=carryAt(pl,s.carry,tau),nx=pl.segs[i+1];if(nx?.A){const w=sm(s.t1-.45,s.t1,tau);return mix3(c,nx.A,w);}return c;}
  const u=clamp((tau-s.t0)/(s.t1-s.t0)),e=s.ease??.25,v=u*(1+e-e*u);const p=mix3(s.A!,s.B!,v);p[1]+= (s.arc??0)*Math.sin(Math.PI*v);return p;}
  return pl.M;}
 const T=pl.T_SHOT;if(tau<T)return shotAt(pl,tau/T);
 if(tau<T+T_NETD)return mix3(shotAt(pl,1),pl.NET,easeOut((tau-T)/T_NETD));
 const u=clamp((tau-T-T_NETD)/.55),h=pl.NET[1]*(1-u*u)+.11*u*u;return[lerp(pl.NET[0],pl.REST[0],u),Math.max(.11,h),lerp(pl.NET[2],pl.REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(1.6*tau+4*Math.max(0,Math.min(tau,.5)));
const bulgeAt=(pl:Play,tau:number)=>{const tn=pl.T_SHOT+T_NETD;return tau<tn-.03?0:Math.exp(-(tau-tn+.03)*2.4)*(1+.3*Math.sin((tau-tn)*14));};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the striker's lurk: low, on the balls of the feet, one shoulder on the defender, eyes on the ball */
const LURK=posed({lHipF:22,rHipF:14,lKnee:32,rKnee:28,lean:14,pitch:4,neckP:-6,lShA:20,rShA:22,lShF:10,rShF:-6,lElb:52,rElb:46});
const ARMS_UP=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-32,lean:-10,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
const kickPose=(k:Kick,u:number)=>k.move==='volley'?volley(u,{foot:k.foot,height:k.height??.3}):strike(u,{foot:k.foot,power:k.power});
const kickC=(k:Kick)=>k.move==='volley'?.5:STRIKE_CONTACT;
function placeOf(pl:Play,a:Actor,tau:number):Place{const[x,z]=pathAt(a.path,tau);return{x,z,yaw:0};}
/** one actor's pose + place at τ (it = idle clock). Lyon celebrate after the goal; Barcelona slump. */
function actorAt(pl:Play,a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(pl,tau),tn=pl.T_SHOT+T_NETD;
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 const run=runCycle(ph,{speed:clamp((sp-1)/5.5)});
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),run,sm(.5,2,sp));
 const lyonSide=a.st.shirt==='paper'&&a.role!=='keeper';
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);yaw=yawTo(x,z,ball[0],ball[2]);
  if(a.dive){const D=.8,t0=a.dive.t-.55*D;if(tau>t0){const u=clamp((tau-t0)/D);kp=blendPose(kp,keeperDive(u,{side:a.dive.side,height:a.dive.height}),sm(t0,t0+.1,tau));yaw=lerpAng(yaw,yawTo(x,z,pl.M[0],pl.M[2]),sm(t0,t0+.1,tau));}}
  if(tau>2.4)kp=blendPose(kp,SLUMP,sm(2.4,3,tau)*.5);
  return{pose:kp,place:{x,z,yaw}};
 }
 if(a.role==='hero'||a.role==='kicker'){
  const k=a.kick!,c=kickC(k);
  if(a.role==='hero'){p=blendPose(LURK,run,sm(.6,2.2,sp));if(tau<-1.4&&sp<2)yaw=lerpAng(yaw,toBall,.8);}
  const u=c+(tau-k.t)/SD;
  if(u>0&&u<1.15){const w=sm(0,.14,u)*(a.role==='hero'?1:1-sm(.85,1.1,u));const dir=dirOf(a===pl.hero?pl.M:ballAt(pl,k.t-.01),a===pl.hero?pl.G:ballAt(pl,k.t+.2));
   p=blendPose(p,kickPose(k,clamp(u)),w);yaw=lerpAng(yaw,kickYaw(dir),Math.max(w,sm(k.t-.5,k.t-.2,tau)*(1-sm(k.t+.4,k.t+.8,tau))));}
  if(a.role==='hero'&&tau>k.t+(1-c)*SD){
   const d=distAt(tabOf(a.path),tau);p=blendPose(kickPose(k,1),celebrate(d/4.2,{kind:'run'}),sm(k.t+(1-c)*SD,k.t+(1-c)*SD+.4,tau));
   if(tau>2.6)p=blendPose(p,ARMS_UP,clamp(1-sp/3)*sm(2.6,3.6,tau));
   yaw=lerpAng(yaw,heading,sm(.5,1,tau));
  }
  if(a.role==='kicker'&&tau>tn+.3&&sp<1.2)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.3,tn+.8,tau)*.9);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='marker'&&a.lunge){const u=clamp((tau-a.lunge.t+.45)/.8);if(u>0&&tau<1.4){const w=sm(0,.15,u)*(1-sm(1.1,1.4,tau));p=blendPose(p,lunge(u,{side:a.lunge.side}),w);yaw=lerpAng(yaw,yawTo(x,z,pl.M[0],pl.M[2]),w);}}
 if(sp<1.4)yaw=lerpAng(yaw,toBall,.8);
 if(tau>tn+.2&&sp<1.2){if(lyonSide)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.2,tn+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(tn+.2,tn+.9,tau)*.6);}
 if(tau>tn&&lyonSide&&sp<1.2){const r=pathAt(pl.hero.path,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprints, the strikes). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,pl:Play,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(pl,tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 if(P[1]>.3){const sh:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[P[0]+Math.cos(a)*.2,0,P[2]+Math.sin(a)*.16]);if(p)sh.push(p);}if(sh.length>8)s.tone(K,polyPath(sh,true),.3);}
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(pl,o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*1.2)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,pl:Play,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(pl,lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,pl:Play,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(p:Place,h=1.8)=>{const q=toCam(c,[p.x??0,.9,p.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const tn=pl.T_SHOT+T_NETD;
 for(const a of pl.actors){const cur=actorAt(pl,a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(pl,a,tpPrev,e.it-1/12);
  const big=a.role==='hero'||a.role==='kicker'||a.role==='keeper'||a.role==='marker';
  const fast=a.role==='hero'?tp>-1.4&&tp<2.5:a.role==='kicker'?Math.abs(tp-a.kick!.t)<.5:a.role==='keeper'?tp>-.2&&tp<tn+.6:a.role==='marker'&&tp>-1&&tp<.8;
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,big),cur.place,prev,!!e.smear&&fast);}});}
 const bq=toCam(c,ballAt(pl,tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,pl,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(pl:Play,tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(pl,tau-i*.12);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(1.6,y/5)*.5+.7,z/5];}
const posOf=(pl:Play,a:Actor,tau:number):V3=>{const[x,z]=pathAt(a.path,tau);return[x,0,z];};
/** a ring on the grass (radius rm metres) around a ground point */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,cov=.95,dashed=false){if(u<=.02)return;const pts:Pt[]=[];const r=rm*(.75+.25*u);
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[P[0]+Math.cos(a)*r,.02,P[2]+Math.sin(a)*r]);if(q)pts.push(q);}if(pts.length<20)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<10;i++)gaps.push([(i+.55)/10,(i+.95)/10]);
 const w=Math.max(4,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,cov*u);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a runner's route on the grass between two τs (a riso replay trail), ink + width in metres */
function trail(s:Sheet,c:Cam,a:Actor,t0:number,t1:number,fade:number,ink:string,wm=.3,dashed=false){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=20;i++){const[x,z]=pathAt(a.path,lerp(t0,t1,i/20)),q=pr(c,[x,.02,z]);if(q)pts.push(q);}
 if(pts.length<3)return;const[x1,z1]=pathAt(a.path,t1),w=Math.max(8,kAt(c,[x1,0,z1])*wm),gaps:[number,number][]=[];if(dashed)for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);
 s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0,gaps}),.45*fade);s.fill(ink,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0,gaps}),.9*fade);}
/** the cross so far, a dashed red line */
function crossTrail(s:Sheet,c:Cam,pl:Play,t0:number,tau:number,fade:number){
 if(tau<=t0+.05||fade<=.02)return;const pts=pathPts(c,pl,t0,Math.min(tau,0),16);if(pts.length<3)return;const w=Math.max(6,kAt(c,pl.M)*.1);
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);s.knockout(ribbon(pts,w*1.5,{taper:.4,pressure:.2,wobble:0,gaps}),.4*fade);s.fill(R,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0,gaps}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time (goal 1)
const P1:V3=[-26,17,72];
const tS1=()=>CUE(0,'slides it')+.1;
const tau1=(t:number)=>Math.max(-9.9,t-tS1());
const T_C1=-1;
function cam1(t:number):Cam{
 const tau=tau1(t),h=G1.hero;
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(G1,tau),[2,0,-2]),fov:15})],
  [CUE(0,'Van de Sanden')-.6,1.4,()=>({P:P1,T:add3(panTarget(G1,tau),[2,0,-3]),fov:12.5})],
  [tS1()+T_C1-.3,1,()=>({P:P1,T:[-9.5,1.2,6.5],fov:12})],
  [tS1()+.9,1.6,()=>({P:P1,T:add3(posOf(G1,h,tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+G1.T_SHOT+T_NETD;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  play(s,c,G1,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(G1,tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · brisk: goal 2 (left-foot hook), a whip-pan across the one world, goal 3 (Bronze's cross)
const tC2=()=>CUE(1,'Left foot')+.15,tC3=()=>CUE(1,'hat-trick')-.05;
const tSW=()=>CUE(1,'Then Bronze')-.1;
const tau2a=(t:number)=>Math.max(-9.9,t-tC2()),tau2b=(t:number)=>Math.max(-9.9,t-tC3());
function cam2(t:number):Cam{
 const a=tau2a(t),b=tau2b(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:mix3(panTarget(G2,a),[-10,1,-5],.4),fov:13})],
  [tC2()-.6,.8,()=>({P:P1,T:[-8.5,1.1,-3],fov:11})],
  [tC2()+.7,.5,()=>({P:P1,T:add3(posOf(G2,G2.hero,a),[0,1,0]),fov:8.5})],
  // the whip-pan to the right wing (the one world; the mid-pan blur carries the jump in time)
  [tSW()-.3,.55,()=>({P:P1,T:add3(panTarget(G3,b),[3,0,-4]),fov:13})],
  [tC3()-1.3,.9,()=>({P:P1,T:[-10.5,1.2,7],fov:12.5})],
  [tC3()+.8,1.2,()=>({P:P1,T:add3(posOf(G3,G3.hero,b),[0,1,0]),fov:8.5})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),useB=t>=tSW(),pl=useB?G3:G2,tf=useB?tau2b:tau2a,tau=tf(t),tp=tf(tt),tpp=tf(tt-1/12),tN=(useB?tC3():tC2())+pl.T_SHOT+T_NETD;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2,tN+3,t))});
  ground(s,c,{bulge:bulgeAt(pl,tau),bz:pl.G[2]});
  play(s,c,pl,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tf(t-.06),hero:'mid',smear:true});
  // the whip-pan: a sheet of horizontal speed streaks across the frame
  const w=sm(tSW()-.32,tSW(),t)*(1-sm(tSW(),tSW()+.3,t));
  if(w>.02){const v=view(s),p=new Path2D(),r=rng(77);for(let i=0;i<16;i++){const y=lerp(-v.hy,v.hy,(i+r())/16),h=8+r()*26,x0=-v.hx+r()*v.hx*.6;p.rect(x0,y,v.hx*2*(.5+r()*.5),h);}
   s.knockout(p,.8*w);s.tone(B,p,.5*w);}
 },
 aperture(t){const c=cam2(t),P=ballAt(G3,tau2b(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · slow-motion replay of goal 1, a LOW camera beside the near post: the run
const tau3=(t:number)=>key(t,mono([[0,-2.4],[CUE(2,'waits by'),-1.95],[CUE(2,'split second')+.2,-1.35],[CUE(2,'darts in front')+.1,-.7],[CUE(2,'Too late'),-.12],[SECS(2),.45]]),linear);
const E3:V3=[3.6,1.25,9.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),h=add3(posOf(G1,G1.hero,tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(h,[-11,1,3],.2),fov:18})],
  [CUE(2,'waits by')-.2,1.1,()=>({P:add3(E3,[-.4,.1,-.6]),T:add3(mix3(h,posOf(G1,G1.marker!,tau),.4),[0,.1,0]),fov:12})],
  [CUE(2,'split second')-.1,1,()=>({P:add3(E3,[-.6,.1,-.9]),T:mix3(h,[-12,1,9],.3),fov:20})],
  [CUE(2,'darts in front')-.2,1,()=>({P:add3(E3,[-1,.05,-1.4]),T:mix3(h,G1.M,.3),fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tW=CUE(2,'waits by'),tS=CUE(2,'split second'),tD=CUE(2,'darts in front'),tL=CUE(2,'Too late');
  stadium(s,c,t,[0,3,2]);
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  // "waits by her defender": one dashed ring round the pair
  const h=G1.hero,mk=G1.marker!;
  const wb=sm(tW-.1,tW+.4,t,easeOutBack)*(1-sm(tS+.2,tS+.7,t));if(wb>.02){const a=posOf(G1,h,tp),b=posOf(G1,mk,tp);groundRing(s,c,mix3(a,b,.5),1.9,wb,Y,11,.95,true);}
  // "a split second before the cross": the cross (red, dashed) and her run (yellow) traced on the grass
  const sp=sm(tS-.1,tS+.4,t);crossTrail(s,c,G1,T_C1,tau,sp);trail(s,c,h,-1.3,Math.min(tau,0),sm(tD-.4,tD+.2,t)*(1-sm(SECS(2)-.7,SECS(2),t)*.5),Y,.32);
  // "too late": the defender's lagging route in red
  trail(s,c,mk,-.9,Math.min(tau,.3),sm(tL-.2,tL+.3,t),R,.22,true);
  play(s,c,G1,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau3(t-.06),only:40});
  // the moment the cross is struck: a spark on the crosser's boot (off to the right wing)
  const k=sm(-1.06,-1,tau)*(1-sm(-.9,-.7,tau));if(k>0){const q=pr(c,ballAt(G1,-1));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,[-15.6,.1,19.4])*.5)*k,{n:8,seed:21,width:6});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(posOf(G1,G1.hero,tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.5,
};

// ---------------------------------------------------------------- 4 · the lesson: go a split second before the cross → not after → dart to the near post → they can't follow
const tau4=(t:number)=>{const m=CUE(3,'Move a split'),n=CUE(3,'not after'),d=CUE(3,'Dart to'),p=CUE(3,'near post'),f=CUE(3,'cannot follow');
 return key(t,mono([[0,-2.1],[m,-1.9],[m+.8,-1.3],[n+.6,-1.15],[d+.3,-.8],[p+.3,-.35],[f,-.05],[f+.9,.35],[SECS(3),.55]]),linear);};
const E4:V3=[-5.5,2.1,12.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),h=add3(posOf(G1,G1.hero,tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(h,[-13,1,10],.3),fov:34})],
  [CUE(3,'not after')-.2,1,()=>({P:add3(E4,[-.5,-.2,-1]),T:mix3(h,[-10.6,.6,-1],.4),fov:30})],
  [CUE(3,'Dart to')-.2,1,()=>({P:add3(E4,[-.5,-.4,-1.5]),T:mix3(h,G1.M,.4),fov:32})],
  [CUE(3,'cannot follow')-.3,1,()=>({P:add3(E4,[-.5,-.5,-2]),T:mix3(h,posOf(G1,G1.marker!,tau),.5),fov:26})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tM=CUE(3,'Move a split'),tA=CUE(3,'not after'),tD=CUE(3,'Dart to'),tP=CUE(3,'near post'),tF=CUE(3,'cannot follow');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  const h=G1.hero,mk=G1.marker!,W=posOf(G1,h,-1.3);
  // 2 · not after: the late run (a navy ghost route) ends at the defender's back — blocked
  const na=sm(tA-.1,tA+.4,t)*(1-sm(tD+.3,tD+.9,t));
  if(na>.02){const late:V3[]=[W,[-11.4,0,-.9],[-10.8,0,-1.9]];const q=late.map(p=>pr(c,[p[0],.02,p[2]])).filter((p):p is Pt=>!!p);if(q.length>2){const w=Math.max(7,kAt(c,W)*.2),gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);
   const rr=ribbon(q,w,{taper:.3,wobble:0,gaps});s.knockout(rr,.6*na);s.fill(K,rr,.8*na);const e=q[q.length-1],z=w*1.3,x=new Path2D();x.addPath(ribbon([[e[0]-z,e[1]-z],[e[0]+z,e[1]+z]],w*.7,{taper:0,wobble:0}));x.addPath(ribbon([[e[0]-z,e[1]+z],[e[0]+z,e[1]-z]],w*.7,{taper:0,wobble:0}));s.knockout(x,.9*na);s.fill(R,x,.95*na);}}
  // 3 · dart to the near post: a yellow arrow on the grass to a target ring
  const da=sm(tD-.1,tD+.5,t,easeOut);
  if(da>.02){const mid:V3=[-10.4,.03,1.1];arrow3(s,c,[[W[0],.03,W[2]],mid,mix3(mid,[G1.M[0],.03,G1.M[2]],da)],Math.max(8,kAt(c,mid)*.14),Y,.95);}
  const np=sm(tP-.1,tP+.4,t,easeOutBack);if(np>.02){groundRing(s,c,[G1.M[0],0,G1.M[2]],1,np,Y,31);groundRing(s,c,[0,0,3.66],.5,np,R,33);}
  play(s,c,G1,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:46});
  // 1 · a split second before: a red ring on the cross as it is struck, a yellow ring on her first step
  const mv=sm(tM-.1,tM+.35,t,easeOutBack)*(1-sm(tA+.4,tA+.9,t));
  if(mv>.02){const sk=solve(actorAt(G1,h,tp,tt).pose,HEG_B,actorAt(G1,h,tp,tt).place);ring3(s,c,sk.rAn,.3,mv,Y,41);ring3(s,c,ballAt(G1,Math.min(tp,T_C1)),.35,mv,R,43);}
  // 4 · cannot follow: the defender's lag trail and the gap between them
  const cf=sm(tF-.1,tF+.4,t);if(cf>.02){trail(s,c,mk,-.9,Math.min(tau,.2),cf,R,.2,true);
   const a=posOf(G1,h,tp),b=posOf(G1,mk,tp),qa=pr(c,[a[0],.05,a[2]]),qb=pr(c,[b[0],.05,b[2]]);if(qa&&qb){const w=Math.max(6,kAt(c,a)*.06),br=ribbon([qb,[lerp(qb[0],qa[0],cf),lerp(qb[1],qa[1],cf)]],w,{taper:0,wobble:.5});s.knockout(br,.9*cf);s.fill(R,br,.95*cf);}}
 },
 still:8,
};

const film:RisoStory={
 id:'hegerberg-signature',format:'11v11',title:"Hegerberg's run",
 theme:'The striker\'s run: move a split second before the cross, dart to the near post, and your defender cannot follow you',
 ageNote:'Lyon 4–1 Barcelona, UEFA Women’s Champions League final, Groupama Arena, Budapest, 18 May 2019 — Hegerberg’s hat-trick in the first half-hour. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little near-post dart — a yellow run curls in and meets a red cross at a ring. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const run:Pt[]=[],cr:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;run.push([x-120+120*k,y+70-70*k*k]);cr.push([x+150-150*k,y-110+110*k]);}
  s.fill(Y,ribbon(run,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const gaps:[number,number][]=[];for(let i=0;i<5;i++)gaps.push([(i+.6)/5,(i+.95)/5]);s.fill(R,ribbon(cr,9,{seed:seed+1,taper:.5,pressure:.3,wobble:1,gaps}),.9*fade);
  if(u>.9){const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([x+Math.cos(a)*34,y+Math.sin(a)*34]);}s.fill(Y,ribbon(pts,7,{close:true,seed,taper:0,wobble:1.2}),.9*fade);}
  if(age>0&&age<.35&&u>.5)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.35),width:9});
  footballPanels(s,cr[cr.length-1][0],cr[cr.length-1][1],24,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
