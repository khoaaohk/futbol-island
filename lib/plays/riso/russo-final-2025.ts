/** Alessia Russo's equaliser — England 1–1 Spain (England won 3–1 on penalties), UEFA Women's Euro 2025 final, St. Jakob-Park, Basel,
 * Sunday 27 July 2025. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or
 * StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026; web text fetched as page source):
 *  - Wikipedia, "UEFA Women's Euro 2025 final" (match summary, line-ups with shirt numbers, the kit templates worn in the final)
 *    https://en.wikipedia.org/wiki/UEFA_Women%27s_Euro_2025_final
 *  - The FA, "England v Spain, UEFA Women's EURO final, Sunday 27 July 2025" (match report)
 *    https://www.englandfootball.com/england/womens-senior-team/fixtures-results/2024-25/EURO-2025/England-v-Spain-UEFA-Womens-EURO-final-sunday-27-July-2025
 *  - The Guardian live blog, "England v Spain: Women's Euro 2025 final – as it happened" (57 min entry + Getty/AFP photo captions)
 *    https://www.theguardian.com/football/live/2025/jul/27/england-v-spain-womens-euro-2025-final-live-score-updates
 *  - Wikipedia, "Chloe Kelly" and "Alessia Russo" (Kelly came on in the final and provided the cross; Russo's 57th-minute equaliser)
 *    https://en.wikipedia.org/wiki/Chloe_Kelly  https://en.wikipedia.org/wiki/Alessia_Russo
 * CONFIRMED by those accounts: Sunday 27 July 2025, St. Jakob-Park, Basel, 34,203; Spain led through Mariona Caldentey's 25th-minute header;
 * Lauren James went off injured in the 41st minute and Chloe Kelly (18) came on for her; in the 57th minute "Walsh sent it strongly through
 * to Georgia Stanway, who laid it out wide for Kelly, who crossed in for Russo to score from a header" (Wikipedia); "It comes to Kelly on
 * the left and she pops it in with Russo heading home" (Guardian); "a delightful cross onto the head of the Arsenal forward, who made no
 * mistake with a brilliant header back across goal and into the top corner" (The FA); Russo scored "under pressure from Laia Aleixandri"
 * (Getty caption, Guardian); 1–1 after extra time, England won the shoot-out 3–1 and Kelly scored the winning penalty. Numbers: Russo 23,
 * Kelly 18, Walsh 4, Stanway 8, Toone 10, Hemp 11; Spain: Cata Coll 13 (keeper), Ona Batlle 2, Irene Paredes 4, Laia Aleixandri 14, Olga
 * Carmona 7, Aitana Bonmatí 6, Patricia Guijarro 12. KITS (Wikipedia kit templates for the final): England white shirts, blue shorts,
 * white socks; Spain all red.
 * INFERRED (illustrative): every exact position and timing (Walsh's pass from ~42 m out, Stanway's lay-off, Kelly receiving ~25 m wide on
 * the left, one touch then the cross), which foot Kelly crossed with (left here), the cross's height and speed (≈ 1.3 s, peak ≈ 3.3 m),
 * where Russo met it (≈ 8.6 m out, just right of centre) and her run (waiting at the edge of the box, then a late curved sprint), the jump
 * and the exact corner ("back across goal and into the top corner" = the far top corner from where she met it, the post Kelly crossed
 * from), Aleixandri's position and late jump, Paredes, keeper Coll's position and late dive (and her yellow kit), the other players, the
 * trim and number inks (England navy numbers, Spain yellow), hair colours and ponytails, the celebration run, the direction of play on
 * screen, the camera positions, St. Jakob-Park's stands and crowd colours, the summer-evening light.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Walsh → Stanway → Kelly
 * wide on the left → the cross → Russo's header → the net; ch2 = slow-motion replay from a LOW touchline camera: Russo waits at the edge of
 * the box, then times her run into the space and jumps above Aleixandri (a riso trail marks the run); ch3 = the second replay angle from
 * BEHIND THE GOAL, through the net: her forehead meets it and sends it back across Coll into the top corner, then live again for the
 * celebration; ch4 = the lesson: time your run (the run traced on the grass), attack the cross, eyes open, forehead, and where to direct
 * it (down, or back across the keeper). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe),
 * framing from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing, motionSmear on
 * the cross, the sprint and the header); women's builds (1.62–1.80 m, slimmer bulk) with ponytails; small wide-shot figures and every
 * figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the goal Spain defend, y up, +z = the
 * attackers' right), athlete.ts's own convention, so Kelly's LEFT foot is the left foot. Inks: yellow, red, blue, navy. Everything is keyed
 * to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,header,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py
 * has written public/plays/narration/russo-final-2025/timing.json, add
 *   import timingJson from '../../../public/plays/narration/russo-final-2025/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The equaliser, live',text:'Basel, the 2025 Euro final. England are losing to Spain. Walsh finds Stanway, out wide to Chloe Kelly. Kelly crosses... Alessia Russo heads it in!',tail:2.4,
  cues:['Basel','England are losing','Walsh finds','Stanway','Chloe Kelly','crosses','Alessia Russo','heads it in']},
 {label:'Watch her run',text:'Watch it again. Russo waits, then times her run into the space, and jumps above her defender.',tail:1.3,
  cues:['Watch it again','waits','times her run','into the space','jumps above']},
 {label:'Back across goal',text:'Her forehead sends it back across the keeper, into the top corner. One-all! England went on to win on penalties!',tail:1.8,
  cues:['Her forehead','back across','top corner','One-all','England went on','penalties']},
 {label:'The secret',text:'The secret? Time your run and attack the cross. Eyes open, meet it with your forehead, and direct it down or back across the keeper.',tail:1.9,
  cues:['The secret','Time your run','attack the cross','Eyes open','forehead','direct it down','back across']},
];
import timingJson from '../../../public/plays/narration/russo-final-2025/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('russo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('russo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Spain defend is x = 0 (England attack +x), goal centre z = 0, +z = the attackers' right (the main-stand side). */
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

// ---------------------------------------------------------------- St. Jakob-Park: a summer evening, a steep two-tier box of red seats under a roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+24*b,-40-28*b],
 (a,b)=>[7+26*b,1.3+22*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+20*b,40+24*b],
 (a,b)=>[-111-26*b,1.3+22*b,lerp(54,-54,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.46],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, kind 0 = St George, 1 = Spain] (England fans in the majority behind this goal) */
const FLAGS:[number,number,number][]=[[0,.5,0],[0,.62,1],[0,.74,0],[0,.86,0],[1,.18,0],[1,.36,1],[1,.6,0],[1,.8,0],[2,.1,0],[2,.24,1],[3,.3,1],[3,.62,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a warm July evening: pale blue sky, a yellow haze low down
 s.field(B,.15,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,8.5,0]),add3(S(0,.82),[0,8.5,0])]));
  seg3(c,add3(S(0,.82),[0,8.3,0]),add3(S(1,.82),[0,8.3,0]),.4,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.22);s.knockout(walk,.85);
 // the crowd: England white and red, Spain red and yellow, some navy; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.84?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.95);s.fill(K,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 // flags on the stand fronts: St George (paper, red cross) and Spain (red, yellow band)
 const fl=new Path2D(),cr=new Path2D(),es=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
  else{es.addPath(polyPath(q,true));addPoly(band,polyP(c,[P(0,.023),P(1,.023),P(1,.057),P(0,.057)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(es);s.fill(R,es,.95);s.fill(Y,band,.95);
 // floodlight strips along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.82),[0,7.6,0]),b=add3(S(u+.03,.82),[0,7.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
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
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out at the top corner the header went in (z −3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-3,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-3,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.95],numberInk:[Y,.95],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const RUSSO_B=W_BUILD(1.73,.92);
const RUSSO_ST=england({number:23,hair:K,build:RUSSO_B,seed:23});
const KELLY_ST=england({number:18,hair:[Y,.95],build:W_BUILD(1.7),seed:18});
const ALEIX_ST=spain({number:14,build:W_BUILD(1.73,.93),seed:14});
const COLL_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:13,numberInk:K,build:W_BUILD(1.7,.94),seed:13};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Kelly's cross)
/** Russo meets the cross at τ = TC with her forehead at H (x, z) — just right of centre, ≈ 8.6 m out */
const TC=1.3,TO=TC-.22,TL=TC+.36;
const H_XZ:[number,number]=[-8.6,1.4];
/** the target: "back across goal and into the top corner" — the far top corner from where she met it (z < 0), just under the bar */
const GOAL_PT:V3=[0,2.2,-3.12];
/** her body opens between the goal and the ball's arrival, and the head snaps toward the corner */
const KELLY_BALL:V3=[-22,.11,-25];
const YAW_H=lerpAng(yawTo(H_XZ[0],H_XZ[1],GOAL_PT[0],GOAL_PT[2]),yawTo(H_XZ[0],H_XZ[1],KELLY_BALL[0],KELLY_BALL[2]),.32);
/** Russo's pelvis place at contact so her forehead is at H (solved once through the skeleton) and the contact height */
const [PR,HY]=(()=>{const sk=solve(header(.52),RUSSO_B,{x:0,z:0,yaw:YAW_H});const fh=mix3(sk.face,sk.head,.35);return[[H_XZ[0]-fh[0],H_XZ[1]-fh[2]] as [number,number],fh[1]+.06];})();
const H:V3=[H_XZ[0],HY,H_XZ[1]];
/** the cross: 1.3 s, whipped, peak ≈ 3.3 m; a slight inswing (bending toward goal) */
const T_CROSS=TC;
function crossAt(u:number):V3{const tt=u*T_CROSS,vy=(H[1]-KELLY_BALL[1]+4.9*T_CROSS*T_CROSS)/T_CROSS,e=u*(1.12-.12*u);
 const bend=Math.sin(Math.PI*u)*.9;return[lerp(KELLY_BALL[0],H[0],e)+bend*.3,KELLY_BALL[1]+vy*tt-4.9*tt*tt,lerp(KELLY_BALL[2],H[2],e)-bend];}
/** the header: .62 s to the line, a slight loop over Coll's reach, into the top corner */
const T_HEAD=.62,T_GOAL=TC+T_HEAD,NET_HIT:V3=[1.6,1.85,-2.95],REST:V3=[1.2,.11,-2.5],T_NET=T_GOAL+.12;
function headerAt(u:number):V3{const e=u*(1.1-.1*u);return[lerp(H[0],GOAL_PT[0],e),lerp(H[1],GOAL_PT[1],e)+.34*Math.sin(Math.PI*e),lerp(H[2],GOAL_PT[2],e)];}
/** the build-up (ground passes): Walsh → Stanway → Kelly; Kelly's touch forward; ball positions on the grass */
const W_BALL:V3=[-41.4,.11,-5.6],S_BALL:V3=[-30.4,.11,-12.3],S_OUT:V3=[-30.0,.11,-12.9],K_RCV:V3=[-24.6,.11,-26.5];
const T_WPASS=-4.6,T_SRCV=-3.8,T_SPASS=-3.3,T_KRCV=-2.2,T_KTOUCH=-1.85;
const roll=(a:V3,b:V3,u:number):V3=>mix3(a,b,u*(1.35-.35*u));
function ballAt(tau:number):V3{
 if(tau<T_WPASS){const u=clamp((tau+10)/(10+T_WPASS));return mix3([-46.5,.11,-2.2],W_BALL,u);}// Walsh carries it forward
 if(tau<T_SRCV)return roll(W_BALL,S_BALL,(tau-T_WPASS)/(T_SRCV-T_WPASS));
 if(tau<T_SPASS)return mix3(S_BALL,S_OUT,sm(T_SRCV,T_SPASS,tau));
 if(tau<T_KRCV)return roll(S_OUT,K_RCV,(tau-T_SPASS)/(T_KRCV-T_SPASS));
 if(tau<T_KTOUCH)return K_RCV;
 if(tau<0)return mix3(K_RCV,KELLY_BALL,easeOut(clamp((tau-T_KTOUCH)/(-.05-T_KTOUCH))));
 if(tau<TC)return crossAt(tau/TC);
 if(tau<T_GOAL)return headerAt((tau-TC)/T_HEAD);
 if(tau<T_NET)return mix3(headerAt(1),NET_HIT,easeOut((tau-T_GOAL)/(T_NET-T_GOAL)));
 const u=clamp((tau-T_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-T_NET-.55)*9))*Math.exp(-(tau-T_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:TAU*5*Math.min(tau,T_NET)+TAU*1.5*Math.max(0,tau-T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:Math.exp(-(tau-T_NET+.03)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-12,T_MAX=9,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;

// ---------------------------------------------------------------- Russo: waits, the late curved sprint, the jump, the header, the celebration
const RUN_DIR=(()=>{const a:[number,number]=[-13.6,-1.0],l=Math.hypot(PR[0]-a[0],PR[1]-a[1]);return[(PR[0]-a[0])/l,(PR[1]-a[1])/l] as [number,number];})();
const TAKE:[number,number]=[PR[0]-RUN_DIR[0]*.45,PR[1]-RUN_DIR[1]*.45],LAND:[number,number]=[PR[0]+RUN_DIR[0]*.5,PR[1]+RUN_DIR[1]*.35];
/** the celebration: she wheels away toward the left corner, where Kelly crossed from */
const RUSSO_PATH:Path=[[-12,-21,-8],[-7,-20.2,-7.2],[-4.6,-19.2,-5.8],[-2.2,-18.1,-4.4],[-.6,-17.3,-3.3],[.3,-13.6,-1.0],[TO,TAKE[0],TAKE[1]]];
const CELEB_PATH:Path=[[TL,LAND[0],LAND[1]],[TL+.5,-7.4,-.2],[TL+1.3,-6.6,-5.2],[TL+2.4,-6.2,-11.6],[TL+3.6,-7.2,-16.6],[TL+4.6,-8.4,-18.4]];
const RUSSO_TAB=distTable(RUSSO_PATH),CELEB_TAB=distTable(CELEB_PATH);
const RUSSO_WAIT=posed({lHipF:22,rHipF:14,lKnee:30,rKnee:24,lean:12,pitch:4,neckP:-6,neckY:24,lShA:18,rShA:16,lShF:12,rShF:-6,lElb:48,rElb:40});
const ARMS_OUT=posed({lShA:112,rShA:108,lShF:14,rShF:18,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-30,lean:-8,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
function russoPose(tau:number):Pose{
 if(tau<TO){
  const sp=speedAt(RUSSO_PATH,tau),ph=distAt(RUSSO_TAB,tau)/CYCLE_M,run=runCycle(ph,{speed:clamp((sp-1.2)/5.4)});
  let p=blendPose(RUSSO_WAIT,run,sm(.6,2.2,sp));
  // the head on a swivel while she waits: ball, box, ball
  if(tau<.2)p.neckY+=(20*Math.sin(tau*1.7))*DEG*(1-sm(-.8,0,tau));
  // gather for the jump: the run drops into the take-off
  return blendPose(p,header(.22),sm(TO-.2,TO,tau));
 }
 if(tau<TL){const u=tau<TC?.22+.3*(tau-TO)/(TC-TO):.52+.48*(tau-TC)/(TL-TC);const p=header(u);
  // attack the ball: the chest opens toward it, then the neck snaps and turns the forehead back across goal
  const snap=sm(TC-.1,TC+.05,tau)*(1-sm(TC+.18,TL,tau));p.neckY+=(-24*snap+10*(1-sm(TO,TC-.08,tau)))*DEG;p.twist+=(-14*snap)*DEG;return p;}
 const s=distAt(CELEB_TAB,tau),sp=speedAt(CELEB_PATH,tau);
 let p=blendPose(header(1),celebrate(s/4.2,{kind:'run'}),sm(TL,TL+.35,tau));
 if(tau>TL+3.4)p=blendPose(p,ARMS_OUT,clamp(1-sp/3)*sm(TL+3.4,TL+4.2,tau));
 return p;
}
function russoPlace(tau:number):Place{
 if(tau<TO){const[x,z]=pathAt(RUSSO_PATH,tau),sp=speedAt(RUSSO_PATH,tau),a=pathAt(RUSSO_PATH,tau+.08),b=ballAt(Math.max(tau,T_KRCV));
  const face=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1,3,sp));return{x,z,yaw:lerpAng(face,YAW_H,sm(TO-.35,TO,tau))};}
 if(tau<TL){const u=(tau-TO)/(TL-TO),x=lerp(TAKE[0],LAND[0],u),z=lerp(TAKE[1],LAND[1],u);
  // the place is solved for the pelvis at contact: land exactly on PR at TC
  const w=1-Math.abs(tau-TC)/.25,px=lerp(x,PR[0],clamp(w)),pz=lerp(z,PR[1],clamp(w));return{x:px,z:pz,yaw:YAW_H};}
 const[x,z]=pathAt(CELEB_PATH,tau),a=pathAt(CELEB_PATH,tau+.1),sp=speedAt(CELEB_PATH,tau);
 const run=yawTo(x,z,a[0],a[1]),toFans=yawTo(x,z,-8,-40);
 return{x,z,yaw:lerpAng(lerpAng(YAW_H,run,sm(TL,TL+.5,tau)),toFans,clamp(1-sp/2.5)*sm(TL+3,TL+4,tau))};
}

// ---------------------------------------------------------------- Kelly: receives wide on the left, one touch, the LEFT-footed cross
const KSD=.95;
/** approach toward the cross's direction, from a little outside the ball */
const KDIR:[number,number]=(()=>{const a=Math.atan2(H[2]-KELLY_BALL[2],H[0]-KELLY_BALL[0])-.35;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
/** Kelly's pelvis at contact so the LEFT boot meets the ball (solved once) */
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),KELLY_ST.build,{x:0,z:0,yaw:YAW_K});const tx=KELLY_BALL[0]-KDIR[0]*.1,tz=KELLY_BALL[2]-KDIR[1]*.1;return[tx-sk.lToe[0],tz-sk.lToe[2]];})();
const KELLY_PATH:Path=[[-12,-27.5,-29.5],[-6,-26.6,-28.6],[-3.4,-25.8,-27.6],[T_KRCV,K_RCV[0]-.7,K_RCV[2]-.35],[-.55,PK[0]-KDIR[0]*1.7,PK[1]-KDIR[1]*1.7],[0,PK[0],PK[1]],[.6,PK[0]+KDIR[0]*1.1,PK[1]+KDIR[1]*1.1],[2.4,-19.5,-21.5],[6,-12,-17.5],[8,-10,-17.5]];

// ---------------------------------------------------------------- everyone else
type Role='run'|'aleix'|'keeper'|'kelly'|'watch';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;
 /** a pass or cross: [contact τ, foot, power] */kick?:[number,'l'|'r',number];/** a first touch on the ball at τ */touch?:number};
const ACTORS:Actor[]=[
 {name:'Kelly',role:'kelly',st:KELLY_ST,path:KELLY_PATH,phase:.2,kick:[0,'l',.95],touch:T_KRCV},
 {name:'Walsh',role:'run',st:england({number:4,hair:[Y,.8],build:W_BUILD(1.67),seed:4}),path:[[-12,-50,1],[-7,-47.2,-1.4],[T_WPASS,W_BALL[0]-.6,W_BALL[2]+.25],[-2,-38.5,-6.4],[4,-33,-6.5]],phase:.5,kick:[T_WPASS,'r',.55]},
 {name:'Stanway',role:'run',st:england({number:8,hair:[Y,.85],build:W_BUILD(1.64,.95),seed:8}),path:[[-12,-34,-7],[-6,-32.6,-9.6],[T_SRCV,S_BALL[0]-.55,S_BALL[2]+.2],[T_SPASS,S_OUT[0]-.55,S_OUT[2]+.3],[-1,-26,-12],[3,-19,-9]],phase:.1,kick:[T_SPASS,'r',.5],touch:T_SRCV},
 {name:'Toone',role:'run',st:england({number:10,build:W_BUILD(1.65),seed:10}),path:[[-12,-30,8],[-4,-26,6],[0,-20.5,3.5],[2.5,-17,2.6],[5,-14.5,1]],phase:.7},
 {name:'Hemp',role:'run',st:england({number:11,build:W_BUILD(1.64),seed:11}),path:[[-12,-27,17],[-4,-21,14.5],[0,-13.5,11],[1.6,-8.2,7.6],[3,-7.4,6.4]],phase:.3},
 {name:'Aleixandri',role:'aleix',st:ALEIX_ST,path:[[-12,-14,-5.2],[-4,-13.2,-4.2],[-1.6,-12.6,-3],[0,-11.9,-1.6],[.8,-10.1,.7],[TC-.14,PR[0]+.3,PR[1]+1.1]],phase:.4},
 {name:'Paredes',role:'watch',st:spain({number:4,build:W_BUILD(1.73,.95),seed:40}),path:[[-12,-12.5,-8.2],[-3,-11.4,-6.6],[.4,-8.4,-6],[1.3,-6.4,-5.4],[3,-6,-5.2]],phase:.8},
 {name:'Coll',role:'keeper',st:COLL_ST,path:[[-12,-1.6,-.6],[-3,-1.2,-1.5],[0,-.95,-2.1],[1.1,-1.15,-.2],[1.5,-1.1,.1]],phase:0},
 {name:'Batlle',role:'run',st:spain({number:2,skin:SKIN_M,build:W_BUILD(1.64),seed:41}),path:[[-12,-15,-18],[-4,-16.6,-20],[T_KRCV,-18.4,-21.6],[0,-20.3,-23.2],[1.2,-20.1,-22.5],[4,-17,-19]],phase:.6},
 {name:'Bonmati',role:'run',st:spain({number:6,build:W_BUILD(1.61,.9),seed:42}),path:[[-12,-33,-2],[-5,-31.5,-5],[-3,-29,-9.5],[-.5,-26.2,-14.5],[2,-23,-15]],phase:.9},
 {name:'Guijarro',role:'run',st:spain({number:12,build:W_BUILD(1.64),seed:43}),path:[[-12,-24,2.5],[-4,-21.5,1],[0,-17.5,-.6],[2,-14.5,.2]],phase:.15},
 {name:'Carmona',role:'run',st:spain({number:7,build:W_BUILD(1.6,.9),seed:44}),path:[[-12,-18,10.5],[-4,-15.4,9],[0,-11.5,7.8],[1.6,-7.8,6.2],[3,-7.2,5.4]],phase:.35},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const TRAP=posed({lHipF:10,rHipF:40,rKnee:40,rAnk:20,lKnee:24,lean:18,pitch:3,neckP:34,lShA:40,rShA:30,lElb:40,rElb:40});
/** one actor's pose + place at τ (it = idle clock). England celebrate after the goal; Spain slump. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase;
 const br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.touch!==undefined){const w=Math.sin(Math.PI*clamp((tau-a.touch+.25)/.5));if(w>0)p=blendPose(p,TRAP,w*.8);}
 if(a.kick){const[t0,foot,power]=a.kick,us=STRIKE_CONTACT+(tau-t0)/(a.role==='kelly'?KSD:.8);
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);
   const aim=t0===T_WPASS?S_BALL:K_RCV;yaw=lerpAng(yaw,a.role==='kelly'?YAW_K:yawTo(x,z,aim[0],aim[2]),w);}}
 const eng=a.st.shirt==='paper';
 if(a.role==='aleix'){
  // she tracks Russo, arrives a beat late and jumps lower
  const t0=TC-.3;if(tau>t0-.2){const u=clamp(.22+.3*(tau-t0)/.3,0,1),hp=header(tau<t0?.22:u);hp.air*=.72;const w=sm(t0-.2,t0,tau)*(1-sm(TC+.55,TC+.9,tau));p=blendPose(p,hp,w);yaw=lerpAng(yaw,YAW_H+.25,w);}
  if(tau>TC+.8)p=blendPose(p,SLUMP,sm(TC+.8,TC+1.5,tau)*.7);
  // after her jump she drifts on a little toward goal
  const drift=tau>TC-.14?.45*clamp((tau-TC+.14)/.7):0;return{pose:p,place:{x:x+drift,z,yaw}};
 }
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);
  // Coll steps across with the cross, then a late dive to her right as the header loops back across
  if(tau>TC+.1){const u=clamp((tau-TC-.1)/1.3);kp=blendPose(kp,keeperDive(u*.72,{side:'r',height:.95}),sm(TC+.1,TC+.3,tau)*(1-sm(TC+2.4,TC+3,tau)));}
  if(tau>TC+2.4)kp=blendPose(kp,SLUMP,sm(TC+2.4,TC+3,tau)*.6);
  return{pose:kp,place:{x,z,yaw:yawTo(x,z,ball[0],ball[2])}};
 }
 if(a.role==='watch'){p=blendPose(p,READY,.4);if(tau>TC+.7)p=blendPose(p,SLUMP,sm(TC+.7,TC+1.4,tau)*.7);return{pose:p,place:{x,z,yaw:toBall}};}
 // after the goal: England arms up (a teammate's joy), Spain heads down
 if(tau>T_NET+.2&&sp<1.2){if(eng)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 if(tau>T_NET&&sp<1.2){const r=pathAt(CELEB_PATH,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}
/** actorAt reads each path's distance table; cache the tables once per actor */
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the cross, the sprint, the header). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=russoPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=russoPose(tp),prev={pose:russoPose(tpPrev),place:russoPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(RUSSO_ST,d,true),pl,prev,!!e.smear&&((tp>-.2&&tp<TL)||(tp>TL+.2&&tp<TL+3)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role!=='run'),cur.place,prev,!!e.smear&&a.role==='kelly'&&tp>-.5&&tp<.5);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+2.5,Math.min(1.4,y/5)*.6+.6,z/5];}
const rxz=(tau:number):V3=>{const p=russoPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the header lands on "heads it in" */
const tS1=()=>CUE(0,'heads')+.1-TC;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-36,18,48];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,0,-7],fov:26})],
  [CUE(0,'England are losing')-.2,1.4,()=>({P:P1,T:add3(panTarget(tau),[2,0,1]),fov:19})],
  [CUE(0,'Walsh')-.3,1,()=>({P:P1,T:panTarget(tau),fov:15})],
  [CUE(0,'Chloe Kelly')-.2,1,()=>({P:P1,T:mix3(panTarget(tau),[-14,.8,-8],.3),fov:14})],
  [tS1()+.2,.9,()=>({P:P1,T:mix3(panTarget(tau),[-8,1.2,-1],.5),fov:13})],
  [tS1()+TC-.2,.7,()=>({P:P1,T:[-5,1.3,-.5],fov:9.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(rxz(tau),[0,1,0]),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:11.5,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera: she waits, times the run, jumps above
const tau2=(t:number)=>key(t,mono([[0,-2.8],[CUE(1,'waits'),-2.2],[CUE(1,'times her run')-.1,-.7],[CUE(1,'into the space'),.35],[CUE(1,'jumps above')-.1,TO-.05],[SECS(1),TC-.04]]),linear);
const E2:V3=[-13.5,1.5,-16.5];
/** the run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=22;i++){const tau=lerp(t0,t1,i/22),p=russoPlace(tau),q=pr(c,[p.x??0,.02,p.z??0]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,rxz(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
function cam2(t:number):Cam{
 const tau=tau2(t),r=add3(rxz(tau),[1.2,1.2,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(r,[-12,1,-6],.3),fov:30})],
  [CUE(1,'times her run')-.3,1.2,()=>({P:add3(E2,[1.5,0,2]),T:add3(r,[1.5,0,.5]),fov:24})],
  [CUE(1,'jumps above')-.5,1,()=>({P:add3(E2,[2.5,.3,5]),T:mix3(H,add3(r,[0,.6,0]),.5),fov:14})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[1,2,3]);
  ground(s,c);
  runTrail(s,c,-.7,Math.min(tau,TO),sm(CUE(1,'times her run')-.2,CUE(1,'times her run')+.4,t));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal, through the net; then live for the celebration
const tau3=(t:number)=>{const a=CUE(2,'Her forehead'),b=CUE(2,'back across'),g=CUE(2,'top corner'),o=CUE(2,'One-all');
 return key(t,mono([[0,TC-.45],[a+.15,TC],[b+.1,TC+.18],[g+.2,T_NET],[o,T_NET+.5],[SECS(2),T_NET+.5+(SECS(2)-o)]]),linear);};
const E3:V3=[4.6,1.55,-1.1];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL)),r=add3(rxz(tau),[0,1.2,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(H,[-9,1.4,1],.4),fov:18})],
  [CUE(2,'back across')-.2,.8,()=>({P:E3,T:mix3(H,b,.55),fov:22})],
  [CUE(2,'top corner')-.1,.6,()=>({P:E3,T:[-3,1.8,-2.2],fov:26})],
  [CUE(2,'One-all')-.2,1.4,()=>({P:add3(E3,[.6,.4,0]),T:r,fov:14})],
  [CUE(2,'England went')-.1,1.6,()=>({P:add3(E3,[.6,.6,0]),T:add3(r,[-1,.3,-1.2]),fov:18})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tO=CUE(2,'One-all'),tE=CUE(2,'England went'),tP=CUE(2,'penalties');
  stadium(s,c,t,[3,0,2],{roar:sm(tO-.3,tO+.3,t),flash:sm(tO-.2,tO+.2,t)*.6+.4*sm(tE,tE+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the header's path so far: a yellow replay trail, forehead → top corner
  if(tau>TC&&tau<T_NET+.8){const pts=pathPts(c,TC,Math.min(tau,T_GOAL),16),fade=1-sm(T_NET,T_NET+.8,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_GOAL)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:60});
  // the forehead contact: a spark where the ball meets her head
  const hit=sm(TC-.02,TC+.05,tau)*(1-sm(TC+.12,TC+.3,tau));if(hit>0){const q=pr(c,H);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,H)*.5)*hit,{n:9,seed:23,width:Math.max(6,kAt(c,H)*.04)});}
  // "England went on to win on penalties!": a paper-and-yellow burst over the fans
  const wn=sm(tP-.2,tP+.4,t);if(wn>0){const q=pr(c,[-8,6.5,-30]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*wn,{n:11,seed:9,g:easeOutBack(wn),width:15});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(rxz(tau3(t)),[0,1.3,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: time the run → attack the cross → eyes open → forehead → direct it
const tau4=(t:number)=>{const r=CUE(3,'Time your run'),a=CUE(3,'attack the cross'),e=CUE(3,'Eyes open'),f=CUE(3,'forehead'),d=CUE(3,'direct it down'),b=CUE(3,'back across');
 return key(t,mono([[0,-1.1],[r,-.7],[a-.1,.55],[e,TO+.02],[f+.05,TC],[d-.1,TC],[b+.2,TC+.35],[SECS(3),T_GOAL+.02]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),r=add3(rxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:[-14.5,1.7,-12.5],T:mix3(r,[-12,1,-1],.4),fov:32})],
  [CUE(3,'attack the cross')-.2,1,()=>({P:[-9.5,1.9,-8.5],T:mix3(r,H,.5),fov:26})],
  [CUE(3,'Eyes open')-.2,.8,()=>({P:add3(H,[3.4,-.7,-.9]),T:add3(H,[-.2,-.5,.1]),fov:28})],
  [CUE(3,'forehead')-.3,.6,()=>({P:add3(H,[3.3,.3,-.5]),T:add3(H,[-.2,-.5,.1]),fov:28})],
  [CUE(3,'direct it down')-.25,1.1,()=>({P:[-16.5,3.4,4.4],T:[-4,1.3,-1.4],fov:30})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tR=CUE(3,'Time your run'),tA=CUE(3,'attack the cross'),tE=CUE(3,'Eyes open'),tF=CUE(3,'forehead'),tD=CUE(3,'direct it down'),tB=CUE(3,'back across');
  stadium(s,c,t,[0,1,2,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · time your run: the curved run traced on the grass, then the take-off spot ringed
  runTrail(s,c,-.7,Math.min(tau,TO),sm(tR-.2,tR+.4,t),.28);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:40});
  // 2 · attack the cross: a red arrow from her forehead toward the ball's arrival
  const at=sm(tA-.1,tA+.4,t,easeOutBack)*(1-sm(tF,tF+.5,t));
  if(at>.02){const sk=solve(russoPose(tp),RUSSO_B,russoPlace(tp)),hd=add3(sk.face,[0,.1,0]),b=ballAt(Math.min(tau,TC-.06));arrow3(s,c,[hd,mix3(hd,b,.45*at),mix3(hd,b,.85*at)],Math.max(8,kAt(c,hd)*.06),R,.95);}
  // 3 · eyes open: a yellow ring round her face
  const eo=sm(tE-.15,tE+.3,t,easeOutBack)*(1-sm(tF+.3,tF+.8,t));if(eo>.02){const sk=solve(russoPose(tp),RUSSO_B,russoPlace(tp));ring3(s,c,sk.face,.2,eo,Y,31);}
  // 4 · the forehead: a spark where the ball meets it
  const fh=sm(tF-.1,tF+.25,t,easeOutBack)*(1-sm(tD,tD+.4,t));if(fh>.02){const q=pr(c,H);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,H)*.45)*fh,{n:9,seed:61,width:Math.max(6,kAt(c,H)*.04)});ring3(s,c,H,.16,fh,R,43);}
  // 5 · direct it: DOWN (red, into the bottom corner off a bounce) and BACK ACROSS the keeper (yellow, the real path)
  const dn=sm(tD-.05,tD+.5,t,easeOutBack);
  if(dn>.02){const bounce:V3=[-2.2,.02,-1.4],low:V3=[0,.35,-2.9],a0=add3(H,[.25,-.05,-.1]);arrow3(s,c,[a0,mix3(a0,bounce,.5*dn),mix3(a0,bounce,dn)],Math.max(9,kAt(c,bounce)*.13),R,.95);
   if(dn>.6){const v=clamp((dn-.6)/.4);arrow3(s,c,[bounce,mix3(bounce,low,.5*v),mix3(bounce,low,v)],Math.max(9,kAt(c,low)*.13),R,.95);}}
  const ac=sm(tB-.05,tB+.5,t,easeOut);
  if(ac>.02){const pts=partial(pathPts(c,TC,T_GOAL,24),ac),w=Math.max(12,kAt(c,[-4,2,-1])*.14);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
 },
 still:9,
};

const film:RisoStory={
 id:'russo-final-2025',format:'11v11',title:"Russo's Euro final header",
 theme:'Heading from a cross: time your run into the box, attack the ball, meet it with your forehead and direct it down or back across the keeper',
 ageNote:'England 1–1 Spain (England won 3–1 on penalties), UEFA Women’s Euro 2025 final, St. Jakob-Park, Basel, 27 July 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a yellow cross arcs in, meets a red forehead tick and bounces off toward the corner. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=14;i++){const k=i/14*Math.min(1,u*1.6);pts.push([x-190+190*k,y-40-120*Math.sin(Math.PI*k*.85)+40*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const out=clamp(u*1.6-1);const e:Pt=out>0?[x+110*out,y-10+70*out*out]:pts[pts.length-1];
  if(age>0&&age<.35&&u>.55)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.35),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
