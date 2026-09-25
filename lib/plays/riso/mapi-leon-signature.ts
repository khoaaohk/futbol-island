/** Mapi León's signature — "the tackle and the long pass" (lib/town/iconicPlays.json: kind "signature", template last_ditch_tackle, side
 * left, lesson "Win the ball cleanly, then lift your head to find a teammate far away."). An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer, rendered as a riso print.
 *
 * WHY THIS MATCH, AND THE HONEST FALLBACK: no written source I could read describes ONE logged Mapi León tackle-then-long-pass (the match
 * reports of her finals credit the goals to others: Martens hit the bar / Leupolz own goal, Alexia's penalty, Alexia's pass for Bonmatí,
 * Martens's cutback for Graham Hansen). So, per the brief's fallback, the film recreates the SIGNATURE inside the real match the sources
 * describe best: Chelsea 0–4 Barcelona, the 2021 UEFA Women's Champions League final, Gamla Ullevi, Gothenburg, Sunday 16 May 2021, 21:00
 * CEST, played behind closed doors — Mapi León's first Champions League title, a full 90 minutes as the LEFT centre-back beside Patri Guijarro
 * and a clean sheet. The Guardian's report gives the defensive picture the film shows: the Kirby–Kerr interplay "was cut off with ease, the
 * ball pickpocketed away by the masters of the passing game"; the Equalizer: Barcelona "won tackles, forced errors". Wikipedia's player
 * article gives the signature itself: "a versatile left-footed defender ... mostly utilised as a ball-playing centre-back ... her quality
 * technique and passing", "her ability to distribute the ball up the pitch". The narration says so plainly: "Here's how Mapi León defends"
 * — the sequence is how she plays, NOT a claim that this exact tackle and pass happened at a given minute.
 *
 * SOURCES (read 23 Sep 2026; fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "Mapi León" (left-footed; ball-playing centre-back; passing; 1.69 m; played the 2021 final in a centre-back pairing with Patri
 *    Guijarro as Andrea Pereira was suspended; the 4–0 shutout; UWCL Squad of the Season 2020–21) https://en.wikipedia.org/wiki/Mapi_León
 *  - Wikipedia, "2021 UEFA Women's Champions League final" (date, 21:00 CEST, Gamla Ullevi, behind closed doors, 0–4, referee Riem Hussein,
 *    line-ups and numbers, and the KIT TEMPLATES worn: Chelsea all blue with white socks; Barcelona PINK shirts (#F7AEC1, the 2020–21 third kit)
 *    with turquoise shorts and socks (#1AC5DC)) https://en.wikipedia.org/wiki/2021_UEFA_Women%27s_Champions_League_final
 *  - The Guardian, Suzanne Wrack, "Barcelona blow Chelsea away..." match report, 16 May 2021 (33-second opener, 4–0 inside 36 minutes; the
 *    second-half Kirby–Kerr interplay "cut off with ease, the ball pickpocketed away")
 *    https://www.theguardian.com/football/2021/may/16/chelsea-barcelona-womens-champions-league-final-match-report
 *  - UEFA.com match report "Chelsea 0-4 Barcelona: Barça surge to first Women's Champions League title" (Alexia and Martens "unplayable on the
 *    Barcelona left"; Graham Hansen "allowing no respite for Chelsea on their own left")
 *  - The Equalizer, Blair Newman, 16 May 2021 (free part: "Barcelona won tackles, forced errors, and regained the ball deep in opposition
 *    territory")
 * CONFIRMED: the match, place, date, 21:00 kick-off, the empty stadium, the 4–0 score and the clean sheet; Mapi León No. 4 at left centre-back
 * for all 90 minutes, left-footed, Guijarro 12 beside her; the numbers (Barcelona: Paños 1, Torrejón 8, Guijarro 12, León 4, Ouahabi 15,
 * Bonmatí 14, Hamraoui 10, Alexia 11, Graham Hansen 16, Hermoso 7, Martens 22; Chelsea: Carter 7, Bright 4, Eriksson 16, Charles 21, Ingle 5,
 * Ji 10, Kirby 14 (right forward, i.e. on Mapi's side), Harder 23, Kerr 20); the kits; Chelsea's attack shut out.
 * INFERRED (illustrative): the whole tackle-and-pass sequence (built from her documented style, as the narration says), every position, run and
 * timing; that Kirby is the attacker she tackles (Kirby played on Mapi's side); the tackle as a standing poke with her LEFT foot (her strong
 * foot) and the long pass with her left foot; the pass reaching Graham Hansen (No. 16) on the far right wing (not narrated); the dusk sky
 * (21:00 in Gothenburg in May); the seat colour of the empty stands; which end each team attacked; the camera positions; Mapi's dark-brown
 * hair tied back and the other hair colours (from photographs, not text); the navy numbers on Barcelona's pink shirts; Paños's kit colour.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Ingle's pass to Kirby, Kirby turns and runs at
 * Mapi, Mapi steps in and pokes it away, one touch, head up, the long diagonal pass sails over Chelsea's attack to the far wing; ch2 = slow-
 * motion replay from a LOW pitch-side camera in front of her: she doesn't dive in (a crossed-out ghost slide), stays on her feet (yellow
 * marks under her boots), pokes it away with her left foot (a red hook arrow), clean (the ball ringed yellow at her feet); ch3 = the second
 * replay angle, low BEHIND her: her head comes up (a dashed yellow sight line), the teammate far away (ringed red), the long pass (a red arc
 * in the air) over the Chelsea attackers it skips (ringed), the camera riding the ball to the wing; ch4 = the lesson from a raised three-
 * quarter angle: win the ball cleanly → lift your head → find a teammate far away. Composed on the FULL sheet (world units = sheet units
 * centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing, motionSmear on the tackle
 * and the strike); women's builds with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail.
 * Handedness: the world is right-handed (x toward the goal Chelsea defend, y up, +z = Barcelona's right), athlete.ts's own convention, so a
 * LEFT foot is the left foot. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets),
 * poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,backpedal,lunge,slideTackle,dribble,posed,blendPose,clampPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/mapi-leon-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mapi-leon-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:"Gothenburg, 2021: the Champions League final, Barcelona against Chelsea. Here's how Mapi León defends. Chelsea attack. Mapi steps in and wins the ball. Head up... long pass!",tail:3.0,
  cues:['Gothenburg','Barcelona against',"Here's how",'Chelsea attack','steps in','wins the ball','Head up','long pass']},
 {label:'Stay on your feet',text:"Watch again. She doesn't dive in. She stays on her feet, then pokes the ball away with her left foot. Clean!",tail:1.1,
  cues:['Watch again','dive in','stays on','pokes','left foot','Clean']},
 {label:'Head up, look far',text:"Her head comes up. She spots a teammate far away, and the long pass flies over Chelsea's attack. Barcelona won that final four nil!",tail:1.6,
  cues:['Her head','spots','far away','long pass','over Chelsea','Barcelona won']},
 {label:'The secret',text:'The secret? Win the ball cleanly. Then lift your head, and find a teammate far away.',tail:1.7,
  cues:['The secret','Win the ball','Then lift','find a teammate','far away']},
];
import timingJson from '../../../public/plays/narration/mapi-leon-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mapi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mapi: no cue '+w);return c.at;};
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
/** a 0 → 1 → 0 bump over [a, b] (smooth edges) */
const hump=(a:number,b:number,t:number,e=.3)=>sm(a,a+(b-a)*e,t)*(1-sm(b-(b-a)*e,b,t));
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: halfway line x = 0; Barcelona defend the goal at x = −52.5 and attack +x; +z = Barcelona's right; the main stand is on −z. */
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

// ---------------------------------------------------------------- Gamla Ullevi at dusk, behind closed doors: four close rectangular stands of EMPTY seats under dark roofs, floodlights on the roof lips
/** a stand: a = along it 0..1, b = up the rake 0..1. 0 the far side (+z), 1 behind the goal Barcelona attack (+x), 2 the main-stand side (−z), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-76,76,a),1.4+15*b,39+17*b],
 (a,b)=>[59+15*b,1.4+13*b,lerp(-56,56,a)],
 (a,b)=>[lerp(76,-76,a),1.4+15*b,-(39+17*b)],
 (a,b)=>[-(59+15*b),1.4+13*b,lerp(56,-56,a)],
];
const NSEG=[10,7,10,7],ROWS=11;
/** floodlight banks on the roof lips: [stand, a] */
const LAMPS:[number,number][]=[[0,.15],[0,.5],[0,.85],[1,.3],[1,.7],[2,.15],[2,.5],[2,.85],[3,.3],[3,.7]];
function stadium(s:Sheet,c:Cam,which:number[]){
 // dusk in Gothenburg in May: a blue evening sky, deeper up high, the last warm light low behind the roofs
 s.field(B,.5,.5);s.field(K,.24,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const Bd=4000;s.tone(K,polyPath([[-Bd,-Bd],[Bd,-Bd],[Bd,hz[1]-700],[-Bd,hz[1]-620]],true),.4);
  const glow=polyPath([[-Bd,hz[1]-420],[Bd,hz[1]-470],[Bd,hz[1]+60],[-Bd,hz[1]+60]],true);s.knockout(glow,.5);s.tone(Y,glow,.45);s.tone(R,glow,.3);}
 const planes=new Path2D(),rows=new Path2D(),roof=new Path2D(),edge=new Path2D(),steps=new Path2D();
 for(const i of which){const S=STANDS[i],n=NSEG[i];for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;addPoly(planes,polyP(c,[S(a0,0),S(a1,0),S(a1,1),S(a0,1)]));
  // empty seats: the rows read as thin pale lines across the stand (nobody in them), the gangways as pale steps
  for(let j=1;j<ROWS;j++){const b=j/ROWS;seg3(c,S(a0,b),S(a1,b),.16,rows,.7);}
  seg3(c,S(a0,0),S(a0,.98),.7,steps,.8);
  addPoly(roof,polyP(c,[add3(S(a0,1),[0,1.5,0]),add3(S(a1,1),[0,1.5,0]),add3(S(a1,.8),[0,8.5,0]),add3(S(a0,.8),[0,8.5,0])]));
  seg3(c,add3(S(a0,.8),[0,8.3,0]),add3(S(a1,.8),[0,8.3,0]),.5,edge);}}
 s.knockout(planes);s.tone(B,planes,.62);s.tone(K,planes,.3);s.knockout(rows,.42);s.knockout(steps,.6);
 s.tone(K,roof,.55);s.knockout(edge,.9);
 const lamp=new Path2D(),halo=new Path2D();
 for(const[si,a] of LAMPS){if(!which.includes(si))continue;const P=add3(STANDS[si](a,.8),[0,9.4,0]),q=pr(c,P);if(!q)continue;const r=clamp(kAt(c,P)*1.6,5,40);
  lamp.rect(q[0]-r,q[1]-r*.4,r*2,r*.8);halo.addPath(polyPath(Array.from({length:14},(_,k)=>{const an=k/14*TAU;return[q[0]+Math.cos(an)*r*2.4,q[1]+Math.sin(an)*r*1.5] as Pt;}),true));}
 s.knockout(halo,.5);s.tone(Y,halo,.3);s.knockout(lamp);s.fill(Y,lamp,.25);
}
// ---------------------------------------------------------------- floodlit grass, the full pitch markings, boards, corner flags, both goals
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-58,0,-37],[58,0,-37],[58,0,37],[-58,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.66);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-52.5+k*5.25,0,-34],[-52.5+(k+1)*5.25,0,-34],[-52.5+(k+1)*5.25,0,34],[-52.5+k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards round the pitch: navy with lit yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-56,0,-36.5],[56,0,-36.5]);board([-56,0,36.5],[56,0,36.5]);board([56,0,-36.5],[56,0,36.5]);board([-56,0,-36.5],[-56,0,36.5]);
 for(const zz of[-36.4,36.4])for(let k=0;k<16;k++){const x=-54+k*6.9;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.8,.25,zz],[x+3.8,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){const x0=-52.5+k*13.125,x1=x0+13.125;L([x0,0,-34],[x1,0,-34]);L([x0,0,34],[x1,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);L([52.5,0,-34+k*17],[52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(0,0,9.15);seg3(c,[-.1,0,0],[.1,0,0],.22,ln);
 for(const sg of[-1,1]){const X=52.5*sg,d=-sg;
  L([X,0,-20.16],[X+d*16.5,0,-20.16]);L([X+d*16.5,0,-20.16],[X+d*16.5,0,20.16]);L([X+d*16.5,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+d*5.5,0,-9.16]);L([X+d*5.5,0,-9.16],[X+d*5.5,0,9.16]);L([X+d*5.5,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15),cx=X+d*11;if(sg>0)circ(cx,0,9.15,Math.PI-a,Math.PI+a,12);else circ(cx,0,9.15,-a,a,12);
  seg3(c,[cx-.1,0,0],[cx+.1,0,0],.22,ln);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const x of[-52.5,52.5])for(const z of[-34,34]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x-.45*Math.sign(x),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 for(const sg of[-1,1])goal3(s,c,sg);
}
/** a goal at x = 52.5·sg: posts z ±3.66, bar 2.44, net 2 m deep behind the line */
function goal3(s:Sheet,c:Cam,sg:number){
 const X=52.5*sg,Xb=X+2*sg,z0=-3.66,z1=3.66,H=2.44;
 const net=new Path2D();
 for(const P of[[[X,0,z0],[X,H,z0],[Xb,1.9,z0],[Xb,0,z0]],[[X,0,z1],[X,H,z1],[Xb,1.9,z1],[Xb,0,z1]],[[X,H,z0],[X,H,z1],[Xb,1.9,z1],[Xb,1.9,z0]],[[Xb,0,z0],[Xb,0,z1],[Xb,1.9,z1],[Xb,1.9,z0]]] as V3[][])addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.14);
 const mesh=new Path2D();for(let i=0;i<=8;i++){const z=lerp(z0,z1,i/8);seg3(c,[X,H,z],[Xb,1.9,z],.022,mesh,.7);seg3(c,[Xb,1.9,z],[Xb,0,z],.022,mesh,.7);}
 for(let j=1;j<=3;j++){const y=1.9*j/4;seg3(c,[Xb,y,z0],[Xb,y,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Barcelona that night: PINK shirts (a light red screen), turquoise shorts and socks (a light blue screen); navy numbers (inferred) */
const PINK:InkFill=[R,.42],TURQ:InkFill=[B,.5];
const bar=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:PINK,shorts:TURQ,socks:TURQ,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** Chelsea all in blue, white socks, white numbers */
const che=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:'paper',numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.68),shade:[K,.3],...o});
const MAPI_B=W_BUILD(1.69,.95);
/** Mapi León, No. 4: dark-brown hair tied back (from photographs — inferred) */
const MAPI_ST=bar({number:4,hair:[K,.72],build:MAPI_B,seed:4});
const KIRBY_B=W_BUILD(1.57,.92);
/** Fran Kirby, No. 14 (Chelsea's right forward — on Mapi's side of the pitch) */
const KIRBY_ST=che({number:14,hair:[K,.8],build:KIRBY_B,seed:14});
const CGH_B=W_BUILD(1.72,.92);
/** Caroline Graham Hansen, No. 16 (Barcelona's right forward): blonde, tied back */
const CGH_ST=bar({number:16,hair:[Y,.85],build:CGH_B,seed:16});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Mapi's long pass)
/** Ingle's pass into Kirby; Kirby's turn; her push toward Mapi; Mapi's poke (TK); Mapi's set-up touch; the pass; it lands on the wing */
const T_IN=-4.4,T_KR=-3.3,T_KT=-2.95,T_KP=-2.55,T_TK=-2.0,T_T2=-1.0,T_ARR=2.7;
/** head up: she looks at the far wing between these */
const T_UP0=-.95,T_UP1=-.3;
const I0:V3=[-13,.11,-8];
const K_RCV:V3=[-24.6,.11,-13.2],K2:V3=[-25.5,.11,-12.95],K3:V3=[-26.2,.11,-12.75];
const TK_BALL:V3=[-28.6,.11,-12.35];
/** the hook: her left foot drags it out from Kirby's path, back across in front of her (+z) */
const M1:V3=[-28.25,.11,-10.55];
const HR:V3=[10.5,.11,26.8];
const PASS_DIR:[number,number]=(()=>{const dx=HR[0]-M1[0],dz=HR[2]-M1[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const PASS_YAW=yawTo(0,0,PASS_DIR[0],PASS_DIR[1]);
/** where the set-up touch leaves it for the pass */
const PB:V3=[M1[0]+PASS_DIR[0]*.85,.11,M1[2]+PASS_DIR[1]*.85];
/** the poke: facing Kirby's run (toward +x, a little to her left), LEFT foot reaching; her pelvis solved so the left toe meets the ball */
const YAW_TK=yawTo(0,0,1,-.28);
const LUNGE_D=.62,LUNGE_AT=.6;
const MT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_AT,{side:'l'}),MAPI_B,{x:0,z:0,yaw:YAW_TK});return[TK_BALL[0]-sk.lToe[0]-.05,TK_BALL[2]-sk.lToe[2]];})();
/** her pelvis at the pass so her LEFT boot meets the ball (solved once through the skeleton) */
const PA:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.95}),MAPI_B,{x:0,z:0,yaw:PASS_YAW});return[PB[0]-PASS_DIR[0]*.08-sk.lToe[0],PB[2]-PASS_DIR[1]*.08-sk.lToe[2]];})();
/** the long pass: a driven, lofted diagonal, ≈ 53 m, peak ≈ 8.5 m */
const PEAK=8.5;
const flightAt=(u:number):V3=>{const p=mix3(PB,HR,u);p[1]=.11+4*PEAK*u*(1-u);return p;};
const H_END:V3=[24.5,.11,24.2];

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
const T_MIN=-10,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.6;

// ---------------------------------------------------------------- Mapi León: holds the line, steps up to Kirby, stays on her feet, pokes it away with her left foot, one touch, head up, the long left-footed pass
const MAPI_PATH:Path=[[-10,-34.4,-7.2],[-6,-34.0,-7.8],[T_IN,-33.2,-8.9],[T_KR,-31.4,-10.3],[-2.75,-30.6,-10.7],[T_TK-LUNGE_AT*LUNGE_D,MT[0]-.35,MT[1]+.08],[T_TK,MT[0],MT[1]],
 [-1.55,MT[0]+.12,MT[1]+.3],[T_T2,M1[0]-PASS_DIR[0]*.55-.1,M1[2]-PASS_DIR[1]*.55+.05],[-.45,PA[0]-PASS_DIR[0]*.7,PA[1]-PASS_DIR[1]*.7],[0,PA[0],PA[1]],
 [.7,PA[0]+PASS_DIR[0]*.9,PA[1]+PASS_DIR[1]*.9],[2,-25.2,-9.6],[4,-21.6,-8.8],[7,-17,-8]];
const MAPI_TAB=distTable(MAPI_PATH);
const mapiXZ=(tau:number):V3=>{const p=pathAt(MAPI_PATH,tau);return[p[0],0,p[1]];};
/** the defender's stance: low, knees bent, on the balls of the feet, arms out a little for balance */
const JOCKEY=posed({lHipF:34,rHipF:26,lKnee:48,rKnee:44,lHipA:14,rHipA:14,lean:24,pitch:4,lShA:32,rShA:32,lShF:14,rShF:14,lElb:56,rElb:56,neckP:-10});
/** the set-up touch: a short push with the LEFT instep */
const PUSH_L=posed({lHipF:30,lKnee:26,lAnk:26,lHipR:16,rHipF:-6,rKnee:32,lean:16,pitch:5,neckP:22,lShA:26,rShA:40,lShF:-20,rShF:22,lElb:60,rElb:64});
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
function mapiPose(tau:number,it:number):Pose{
 const sp=speedAt(MAPI_PATH,tau),ph=distAt(MAPI_TAB,tau)/CYCLE_M;
 let p=blendPose(blendPose(READY,stand(),.4+.1*Math.sin(it*1.7)),runCycle(ph,{speed:clamp((sp-1)/6)}),sm(.6,2.2,sp));
 // the jockey: low and patient as Kirby runs at her (she does not dive in)
 const jw=sm(T_KR-.4,T_KR+.1,tau)*(1-sm(T_TK-LUNGE_AT*LUNGE_D-.05,T_TK-LUNGE_AT*LUNGE_D+.12,tau));
 if(jw>0)p=blendPose(p,blendPose(JOCKEY,backpedal(ph*1.3),.35),jw*.9);
 // the poke: a lunge on the LEFT side, left toe to the ball; after contact the foot sweeps back across (the hook)
 const lu=(tau-(T_TK-LUNGE_AT*LUNGE_D))/LUNGE_D;
 if(lu>0&&lu<1.35){const w=sm(0,.12,lu)*(1-sm(1.05,1.35,lu));let q=lunge(clamp(lu),{side:'l'});
  const hk=hump(LUNGE_AT-.02,1,lu,.35);if(hk>0){q={...q};q.lHipA-=26*DEG*hk;q.lHipR-=18*DEG*hk;q.neckP+=6*DEG*hk;q=clampPose(q);}
  p=blendPose(p,q,w);}
 // the set-up touch with her left instep, eyes on the ball
 const pw=hump(T_T2-.22,T_T2+.26,tau,.4);if(pw>0)p=blendPose(p,PUSH_L,pw*.8);
 // HEAD UP: chin lifts, eyes up the pitch to the far wing
 const up=hump(T_UP0,T_UP1+.2,tau,.3);if(up>0){p={...p};p.neckP-=40*DEG*up;p.lean-=8*DEG*up;p.twist-=8*DEG*up;p=clampPose(p);}
 // the long pass: LEFT foot, full power
 const us=STRIKE_CONTACT+tau/.8;
 if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.86,1,us));p=blendPose(p,strike(us,{foot:'l',power:.95}),w);}
 // afterwards she watches it go
 if(tau>.5){p={...p};p.neckP-=16*DEG*sm(.5,.9,tau)*(1-sm(3,3.6,tau));p=clampPose(p);}
 return p;
}
function mapiPlace(tau:number):Place{
 const[x,z]=pathAt(MAPI_PATH,tau),b=ballAt(tau),a=pathAt(MAPI_PATH,tau+.1),sp=speedAt(MAPI_PATH,tau);
 let yaw=yawTo(x,z,b[0],b[2]);
 const lw=sm(T_TK-.5,T_TK-.3,tau)*(1-sm(T_TK+.3,T_TK+.6,tau));yaw=lerpAng(yaw,YAW_TK,lw);
 // from the touch to the pass she squares up to the pass line
 const pw=sm(T_T2-.2,T_T2+.3,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,PASS_YAW,pw);
 if(tau>.5)yaw=lerpAng(yaw,lerpAng(yawTo(x,z,a[0],a[1]),yawTo(x,z,b[0],b[2]),.6),sm(.5,1.2,tau)*sm(1,2.5,sp));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- Fran Kirby: checks in for Ingle's pass, turns, runs at Mapi — and it's gone
const KIRBY_PATH:Path=[[-10,-20,-16],[-6,-21.6,-14.9],[T_IN,-23.4,-13.9],[T_KR,K_RCV[0]+.45,K_RCV[2]-.05],[T_KT,-25.0,-13.0],[T_KP,-25.7,-12.85],[T_TK,-27.55,-12.55],
 [-1.6,-28.8,-13.2],[-1.15,-29.7,-14.1],[-.6,-30.3,-15.0],[0,-30.1,-15.3],[1.2,-28.6,-14.4],[3,-24.8,-11],[6,-19,-9]];
const KIRBY_TAB=distTable(KIRBY_PATH);
const RECV=posed({lHipF:36,lKnee:40,lAnk:20,rHipF:10,rKnee:26,lean:16,pitch:3,neckP:34,lShA:30,rShA:40,lElb:40,rElb:40});
/** the ball's gone: she stretches after it, off balance */
const REACH=posed({rHipF:58,rKnee:24,rAnk:18,lHipF:-18,lKnee:46,lean:26,pitch:8,roll:-6,lShA:52,rShA:34,lShF:-30,rShF:44,neckP:26});
function kirbyPose(tau:number,it:number):Pose{
 const sp=speedAt(KIRBY_PATH,tau),ph=distAt(KIRBY_TAB,tau)/CYCLE_M+.3;
 let p=blendPose(blendPose(READY,stand(),.4),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.6,2,sp));
 const rw=hump(T_KR-.3,T_KT+.1,tau,.4);if(rw>0)p=blendPose(p,RECV,rw*.75);
 if(tau>T_KT&&tau<T_TK+.1){const w=sm(T_KT,T_KT+.2,tau)*(1-sm(T_TK-.05,T_TK+.1,tau));p=blendPose(p,dribble((tau-T_KT)*2.6+.3,{foot:'r',speed:.6}),w*.8);}
 const kw=hump(T_TK-.05,-.7,tau,.35);if(kw>0)p=blendPose(p,REACH,kw*.75);
 if(tau>-.8){p={...p};p.neckP+=0;p.lean+=6*DEG*sm(-.8,-.3,tau);}
 return p;
}
function kirbyPlace(tau:number):Place{
 const[x,z]=pathAt(KIRBY_PATH,tau),b=ballAt(tau),a=pathAt(KIRBY_PATH,tau+.1),sp=speedAt(KIRBY_PATH,tau);
 let yaw=yawTo(x,z,b[0],b[2]);
 // after the turn she faces her run (toward Mapi and the goal)
 const run=sm(T_KT-.15,T_KT+.2,tau)*(1-sm(T_TK+.05,T_TK+.35,tau));yaw=lerpAng(yaw,yawTo(x,z,a[0],a[1]),run*sm(.8,2,sp));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- Graham Hansen: wide on the far right wing, the run, the ball drops onto her
const CGH_PATH:Path=[[-10,-2,27.6],[-5,.6,27.4],[-1.5,3.2,27.2],[0,4.8,27],[1.4,7.6,26.9],[T_ARR,HR[0]-.55,HR[2]+.1],[3.6,14,26.2],[5.2,19.8,25],[7,25.6,23.6]];
const CGH_TAB=distTable(CGH_PATH);
const cghXZ=(tau:number):V3=>{const p=pathAt(CGH_PATH,tau);return[p[0],0,p[1]];};
/** she cushions the dropping ball with her right instep (inferred foot) */
const CUSHION=posed({rHipF:44,rKnee:52,rAnk:12,rHipR:30,lKnee:24,lHipF:6,lean:12,pitch:2,neckP:40,lShA:56,rShA:44,lShF:10,rShF:-4,lElb:30,rElb:36});
function cghPose(tau:number,it:number):Pose{
 const sp=speedAt(CGH_PATH,tau),ph=distAt(CGH_TAB,tau)/CYCLE_M+.6;
 let p=blendPose(blendPose(READY,stand(),.4+.1*Math.sin(it*1.9)),runCycle(ph,{speed:clamp((sp-1)/6)}),sm(.6,2,sp));
 // eyes up at the ball in the air
 if(tau>.1&&tau<T_ARR){p={...p};p.neckP-=30*DEG*hump(.1,T_ARR-.2,tau,.3);p=clampPose(p);}
 const cw=hump(T_ARR-.35,T_ARR+.3,tau,.4);if(cw>0)p=blendPose(p,CUSHION,cw*.85);
 return p;
}
function cghPlace(tau:number):Place{
 const[x,z]=pathAt(CGH_PATH,tau),a=pathAt(CGH_PATH,tau+.1),sp=speedAt(CGH_PATH,tau),b=ballAt(tau);
 let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1.5,3.5,sp));
 if(tau>T_ARR-.5&&tau<T_ARR+.2)yaw=lerpAng(yaw,yawTo(x,z,PB[0],PB[2]),.35*hump(T_ARR-.5,T_ARR+.2,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<T_IN){const u=clamp((tau-T_MIN)/(T_IN-T_MIN));return mix3([-7.5,.11,-5.2],[I0[0]-.4,.11,I0[2]],easeInOutSine(u));}
 // Ingle's pass into Kirby's feet
 if(tau<T_KR){const u=(tau-T_IN)/(T_KR-T_IN);return mix3(I0,K_RCV,u*(1.4-.4*u));}
 // the turn, then the push toward Mapi
 if(tau<T_KT){const u=(tau-T_KR)/(T_KT-T_KR);return mix3(K_RCV,K2,easeInOutSine(u));}
 if(tau<T_KP){const u=(tau-T_KT)/(T_KP-T_KT);return mix3(K2,K3,u);}
 if(tau<T_TK){const u=(tau-T_KP)/(T_TK-T_KP);return mix3(K3,TK_BALL,u*(1.5-.5*u));}
 // the poke: hooked out of Kirby's path, back across in front of Mapi
 if(tau<-1.35){const u=(tau-T_TK)/(-1.35-T_TK);return mix3(TK_BALL,M1,u*(1.7-.7*u));}
 if(tau<T_T2)return M1;
 // the set-up touch, then the long pass
 if(tau<0){const u=(tau-T_T2)/(0-T_T2);return mix3(M1,PB,Math.min(1,u*1.8)*(1.4-.4*Math.min(1,u*1.8)));}
 if(tau<T_ARR){const u=tau/T_ARR;return flightAt(u*(1.12-.12*u));}
 // she cushions it and runs on down the wing
 const u=clamp((tau-T_ARR)/(7-T_ARR)),c=cghXZ(tau);const ahead:V3=[c[0]+.7,.11,c[2]-.1];return mix3(mix3(HR,ahead,sm(0,.12,u)),ahead,sm(.1,.3,u));
}
const spinAt=(tau:number)=>tau<=0?TAU*1.2*(tau+10):TAU*1.2*10+TAU*3.4*Math.min(tau,T_ARR)+TAU*.8*Math.max(0,tau-T_ARR);

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'keeper'|'passer';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;/** a pass: [contact τ, foot, power, target] */kick?:[number,'l'|'r',number,V3];bar:boolean};
const ACTORS:Actor[]=[
 // Chelsea
 {name:'Ingle',role:'passer',bar:false,st:che({number:5,build:W_BUILD(1.66,.95),hair:[R,.5],seed:105}),path:[[-10,-7,-5],[-7,-9,-6.4],[T_IN,I0[0]-.55,I0[2]+.2],[-2.5,-15.6,-7.2],[0,-17,-6],[3,-15,-3]],phase:.2,kick:[T_IN,'r',.75,K_RCV]},
 {name:'Kerr',role:'run',bar:false,st:che({number:20,build:W_BUILD(1.68,.95),hair:[K,.9],skin:SKIN_M,seed:120}),path:[[-10,-28,4],[-5,-31,1.6],[T_KR,-33.4,-1.4],[T_TK,-36.4,-3.6],[-1,-36.8,-3.8],[0,-35.8,-3],[3,-30,-1]],phase:.5},
 {name:'Harder',role:'run',bar:false,st:che({number:23,build:W_BUILD(1.69,.95),hair:[Y,.75],seed:123}),path:[[-10,-24,6],[-5,-27,5],[T_TK,-31.2,3.6],[-.5,-31.8,3],[2,-28,3],[5,-22,4]],phase:.8},
 {name:'Ji',role:'run',bar:false,st:che({number:10,build:W_BUILD(1.61,.92),hair:[K,.9],seed:110}),path:[[-10,-14,10],[-5,-17,10.6],[T_TK,-21,9.6],[0,-21.6,9],[3,-18,10],[6,-12,12]],phase:.35},
 {name:'Charles',role:'def',bar:false,st:che({number:21,build:W_BUILD(1.64,.92),hair:[K,.85],seed:121}),path:[[-10,-2,18],[-4,-3,18.6],[0,-3.4,18.8],[1.2,-1,20.2],[T_ARR,5.6,23],[5,14.4,23.4],[7,20.6,22.4]],phase:.1},
 {name:'Bright',role:'def',bar:false,st:che({number:4,build:W_BUILD(1.73,1),seed:104}),path:[[-10,6,4],[-4,3,3],[0,1.4,2.6],[T_ARR,5,6],[6,12,10]],phase:.6},
 {name:'Carter',role:'def',bar:false,st:che({number:7,build:W_BUILD(1.66,.95),hair:[K,.9],skin:[[Y,.46],[R,.36],[K,.2]],seed:107}),path:[[-10,-2,-20],[-4,-5,-19],[0,-7,-18],[4,-4,-15]],phase:.9},
 // Barcelona
 {name:'Guijarro',role:'def',bar:true,st:bar({number:12,build:W_BUILD(1.64,.95),hair:[K,.85],seed:212}),path:[[-10,-34.8,2.6],[-5,-35.4,1.8],[T_TK,-36.8,.4],[0,-35,1.4],[4,-30,3]],phase:.25},
 {name:'Torrejon',role:'def',bar:true,st:bar({number:8,build:W_BUILD(1.65,.92),hair:[K,.8],seed:208}),path:[[-10,-29,16],[-5,-31,14.6],[T_TK,-33,12.6],[0,-31,13],[4,-24,15]],phase:.7},
 {name:'Ouahabi',role:'def',bar:true,st:bar({number:15,build:W_BUILD(1.64,.92),hair:[K,.9],skin:SKIN_M,seed:215}),path:[[-10,-25,-24],[-5,-27,-22.4],[T_TK,-29.6,-19.4],[0,-28,-19],[4,-21,-22]],phase:.45},
 {name:'Hamraoui',role:'run',bar:true,st:bar({number:10,build:W_BUILD(1.67,.92),hair:[K,.9],skin:[[Y,.46],[R,.36],[K,.2]],seed:210}),path:[[-10,-18,-2],[-5,-21,-3],[T_TK,-24,-4.4],[0,-22,-4],[4,-15,-1]],phase:.15},
 {name:'Alexia',role:'run',bar:true,st:bar({number:11,build:W_BUILD(1.73,.95),hair:[K,.75],seed:211}),path:[[-10,-12,-14],[-5,-16,-16],[T_TK,-20,-17.6],[0,-18,-17],[4,-10,-16]],phase:.55},
 {name:'Bonmati',role:'run',bar:true,st:bar({number:14,build:W_BUILD(1.62,.9),hair:[R,.42],seed:214}),path:[[-10,-10,5],[-5,-13,4],[T_TK,-16,2.6],[0,-13,4],[4,-4,8]],phase:.85},
 {name:'Hermoso',role:'run',bar:true,st:bar({number:7,build:W_BUILD(1.71,1),skin:SKIN_M,seed:207}),path:[[-10,-4,-2],[-5,-6,-1],[0,-4,0],[3,2,4],[6,9,8]],phase:.05},
 {name:'Martens',role:'run',bar:true,st:bar({number:22,build:W_BUILD(1.7,.92),hair:[Y,.8],seed:222}),path:[[-10,-4,-22],[-5,-7,-22.6],[0,-6,-22],[4,2,-19]],phase:.65},
 {name:'Panos',role:'keeper',bar:true,st:{shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:W_BUILD(1.66,.95),seed:201},
  path:[[-10,-45,-1.5],[-4,-44,-3],[0,-43.4,-2.6],[4,-42,-1]],phase:0},
];
const SHAPE=posed({lHipF:26,rHipF:22,lKnee:36,rKnee:34,lHipA:12,rHipA:12,lean:18,pitch:3,lShA:24,rShA:24,lShF:12,rShF:10,lElb:48,rElb:48,neckP:-2});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** one actor's pose + place at τ (it = idle clock): facing the ball when slow, the run when fast; defenders jockey; a kick when due */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(SHAPE,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper')return{pose:blendPose(keeperSet(it*1.2),runCycle(ph,{speed:.3}),sm(1,2.2,sp)*.8),place:{x,z,yaw:toBall}};
 if(a.role==='def'&&sp<2.5)p=blendPose(p,backpedal(ph*1.4),sm(.4,1.2,sp)*.5);
 // the long pass in the air: heads go up as it flies over
 if(tau>.2&&tau<T_ARR){p={...p};p.neckP-=22*DEG*hump(.2,T_ARR,tau,.3);p=clampPose(p);}
 if(a.kick){const[t0,foot,power,tgt]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tgt[0],tgt[2]),w);}}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the poke, the strike, the sprints). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen (with its shadow on the grass while it flies)
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.03;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.05,.15,.5));
 if(o.lines&&o.prev!==undefined&&((tau>0&&tau<T_ARR)||(tau>T_IN&&tau<T_KR))){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=mapiPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=mapiPose(tp,e.it),prev={pose:mapiPose(tpPrev,e.it-1/12),place:mapiPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(MAPI_ST,d,true),pl,prev,!!e.smear&&((tp>T_TK-.4&&tp<T_TK+.4)||(tp>-.4&&tp<.5)));}});}
 {const pl=kirbyPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=kirbyPose(tp,e.it),prev={pose:kirbyPose(tpPrev,e.it-1/12),place:kirbyPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(KIRBY_ST,d,true),pl,prev,!!e.smear&&tp>T_KT&&tp<-1.2);}});}
 {const pl=cghPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=cghPose(tp,e.it),prev={pose:cghPose(tpPrev,e.it-1/12),place:cghPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(CGH_ST,d,true),pl,prev,!!e.smear&&tp>T_ARR-.4&&tp<6);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,false);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), on the ground under a lofted ball */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(2,y/5)*.4+.6,z/5];}
/** smoothed ground point under Mapi (cameras ride it) */
const mxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(MAPI_PATH,tau+i*.1);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** "stays on her feet": small yellow marks under both boots */
function feetMarks(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;const sk=solve(mapiPose(tau,0),MAPI_B,mapiPlace(tau));
 for(const[j,sd] of[[sk.lToe,41],[sk.rToe,43]] as [V3,number][])groundRing(s,c,[j[0],0,j[2]],.32,u,Y,sd);}
/** "she doesn't dive in": the dive she doesn't make — a pale ghost slide, crossed out in red */
const GHOST:AthleteStyle={...MAPI_ST,shirt:[R,.15],shorts:[B,.15],socks:[B,.15],skin:[[Y,.15]],hair:[K,.2],line:K,number:undefined,detail:'low',shadow:false};
function ghostDive(s:Sheet,c:Cam,u:number){if(u<=.02)return;const pl:Place={x:MT[0]-.6,z:MT[1]-.1,yaw:YAW_TK-.2},pose=slideTackle(.55,{foot:'l'});
 drawPlayer(s,pose,c,GHOST,pl);
 const pv=solve(pose,MAPI_B,pl).pelvis,P:V3=[pv[0],.45,pv[2]],q=pr(c,P);if(!q)return;const r=clamp(kAt(c,P)*2.2,40,220)*u,w=Math.max(6,r*.12);
 const x=new Path2D();x.addPath(ribbon([[q[0]-r,q[1]-r*.6],[q[0]+r,q[1]+r*.6]],w,{seed:5,taper:.2,wobble:1}));x.addPath(ribbon([[q[0]-r,q[1]+r*.6],[q[0]+r,q[1]-r*.6]],w,{seed:6,taper:.2,wobble:1}));
 s.knockout(x,.9);s.fill(R,x,.95);}
/** the poke: a red hook arrow on the grass from where Kirby had it, out of her path, to Mapi's feet */
function hookArrow(s:Sheet,c:Cam,u:number){if(u<=.02)return;const pts:V3[]=[];for(let i=0;i<=10;i++){const k=i/10*u,p=mix3(TK_BALL,M1,k);p[0]+=.7*Math.sin(Math.PI*k);p[1]=.03;pts.push(p);}
 arrow3(s,c,pts,Math.max(6,kAt(c,TK_BALL)*.14),R,.95);}
/** head up: a dashed yellow sight line from her eyes to the teammate far away (drawn out with u) */
function sightLine(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;
 const a=mapiXZ(tau),h=cghXZ(tau),E:V3=[a[0],1.55,a[2]],T:V3=[h[0],1.3,h[2]],end=mix3(E,T,u);
 const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(mix3(E,end,i/8));
 arrow3(s,c,pts,Math.max(6,kAt(c,E)*.05),Y,.95,true);}
/** the long pass: a red arc through the air along the real flight (drawn out with u) */
function passArc(s:Sheet,c:Cam,u:number,fade=1){if(u<=.02||fade<=.02)return;const pts:V3[]=[];for(let i=0;i<=18;i++)pts.push(flightAt(i/18*u));
 const mid=flightAt(u*.5);arrow3(s,c,pts,Math.max(7,kAt(c,mid)*.35),R,.95*fade);}
/** the Chelsea attackers the pass skips, ringed */
function skipRings(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;const k=kirbyPlace(tau);groundRing(s,c,[k.x??0,0,k.z??0],.8,u,R,51);
 for(const n of['Kerr','Harder','Ji']){const a=ACTORS.find(q=>q.name===n)!,[x,z]=pathAt(a.path,tau);groundRing(s,c,[x,0,z],.8,u,R,n.length+52);}}
const strikeSpark=(s:Sheet,c:Cam,tau:number,at:number,P:V3,seed:number)=>{const hit=sm(at-.02,at+.04,tau)*(1-sm(at+.1,at+.28,tau));if(hit<=0)return;const q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(34,kAt(c,P)*.55)*hit,{n:8,seed,width:Math.max(4,kAt(c,P)*.05)});};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time (keyed to the cues so each beat lands on its words): Ingle's pass on "Chelsea attack", the poke on "wins the ball", head up, the pass on "long pass" */
const tau1=(t:number)=>{const a=CUE(0,'Chelsea attack'),w=CUE(0,'wins the ball'),h=CUE(0,'Head up'),l=CUE(0,'long pass')+.25;
 return key(t,mono([[0,T_IN-(a+.1)],[a+.1,T_IN],[w,T_TK+.1],[h+.1,-.85],[l,0],[SECS(0),SECS(0)-l]]),linear);};
const P1:V3=[-20,20,-63];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:mix3(panTarget(tau),[-26,.6,-11],.5),fov:9})],
  [CUE(0,'Chelsea attack')-.2,1.2,()=>({P:P1,T:mix3(panTarget(tau),add3(mxz(tau),[0,.6,0]),.55),fov:7.2})],
  [CUE(0,'long pass')-.1,1.6,()=>({P:P1,T:mix3(panTarget(tau),[-8,1,10],.35),fov:15})],
  [CUE(0,'long pass')+1.6,1.4,()=>({P:P1,T:add3(cghXZ(tau),[0,1,0]),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12);
  stadium(s,c,[0,1,3]);
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(cghXZ(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a LOW pitch-side camera in front of her: no dive, on her feet, the poke with her left foot, clean
const tau2=(t:number)=>key(t,mono([[0,-3.4],[CUE(1,'dive in'),-2.85],[CUE(1,'stays on'),-2.55],[CUE(1,'pokes')+.1,-2.0],[CUE(1,'left foot')+.2,-1.8],[CUE(1,'Clean'),-1.45],[SECS(1),-1.15]]),linear);
const E2:V3=[-27.6,1.6,-19.8];
function cam2(t:number):Cam{
 const tau=tau2(t),k=mxz(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(add3(k,[0,.8,0]),[-26.8,.8,-12.6],.45),fov:28})],
  [CUE(1,'stays on')-.3,1.2,()=>({P:add3(E2,[-.6,-.3,.9]),T:add3(k,[.9,.55,-.6]),fov:24})],
  [CUE(1,'Clean')-.4,1.2,()=>({P:add3(E2,[-.2,-.1,1.6]),T:mix3(add3(k,[0,.6,0]),M1,.5),fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tD=CUE(1,'dive in'),tS=CUE(1,'stays on'),tP=CUE(1,'pokes'),tC=CUE(1,'Clean');
  stadium(s,c,[0,1,3]);
  ground(s,c);
  ghostDive(s,c,sm(tD-.1,tD+.35,t,easeOutBack)*(1-sm(tS-.2,tS+.2,t)));
  feetMarks(s,c,tp,sm(tS-.05,tS+.35,t,easeOutBack)*(1-sm(tP+.1,tP+.5,t)));
  hookArrow(s,c,sm(tP+.05,tP+.8,t,easeOut)*(1-sm(tC+.4,tC+.9,t)));
  groundRing(s,c,ballAt(tau),.6,sm(tC-.1,tC+.35,t,easeOutBack),Y,44);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:70});
  strikeSpark(s,c,tau,T_TK,TK_BALL,9);
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(mxz(tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:5.2,
};

// ---------------------------------------------------------------- 3 · second replay, low BEHIND her: head up, the teammate far away, the long pass over Chelsea's attack; the camera rides the ball to the wing
const tau3=(t:number)=>{const h=CUE(2,'Her head'),sp=CUE(2,'spots'),f=CUE(2,'far away'),l=CUE(2,'long pass'),o=CUE(2,'over Chelsea'),b=CUE(2,'Barcelona won');
 return key(t,mono([[0,-1.25],[h+.2,-.9],[sp+.1,-.6],[f,-.4],[l+.1,0],[o+.2,1.2],[b,2.5],[SECS(2),3.3]]),linear);};
const E3:V3=[PB[0]-PASS_DIR[0]*5.6-PASS_DIR[1]*1.7,2.1,PB[2]-PASS_DIR[1]*5.6+PASS_DIR[0]*1.7];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:add3(PB,[PASS_DIR[0]*2.5,1.2,PASS_DIR[1]*2.5]),fov:32})],
  [CUE(2,'spots')-.2,1.1,()=>({P:add3(E3,[-.6,1.2,-.4]),T:mix3(add3(PB,[0,1.4,0]),add3(cghXZ(tau),[0,1,0]),.5),fov:32})],
  [CUE(2,'long pass')+.1,1.4,()=>({P:add3(E3,[-1.6,3.4,-1.2]),T:mix3(b,add3(cghXZ(tau),[0,1,0]),.45),fov:34})],
  [CUE(2,'Barcelona won')-.8,1.4,()=>({P:add3(cghXZ(tau),[-7,2.6,-7]),T:add3(cghXZ(tau),[1.4,.9,0]),fov:28})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tH=CUE(2,'Her head'),tS=CUE(2,'spots'),tL=CUE(2,'long pass'),tO=CUE(2,'over Chelsea'),tB=CUE(2,'Barcelona won');
  stadium(s,c,[0,1]);
  ground(s,c);
  groundRing(s,c,cghXZ(tau),1,sm(tS-.1,tS+.4,t,easeOutBack)*(1-sm(tB+.6,tB+1.1,t)),R,61);
  skipRings(s,c,tau,sm(tO-.15,tO+.35,t,easeOutBack)*(1-sm(tB-.2,tB+.3,t)));
  passArc(s,c,sm(tL-.1,tL+.6,t,easeOut),1-sm(tB-.2,tB+.4,t));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:90});
  sightLine(s,c,Math.min(tau,T_UP1),sm(tH+.2,tS+.2,t,easeOut)*(1-sm(tL-.1,tL+.3,t)));
  strikeSpark(s,c,tau,0,PB,6);
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(cghXZ(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson from a raised three-quarter angle: win the ball cleanly → lift your head → find a teammate far away
const tau4=(t:number)=>{const w=CUE(3,'Win the ball'),l=CUE(3,'Then lift'),f=CUE(3,'find a teammate'),fa=CUE(3,'far away');
 return key(t,mono([[0,-2.8],[w,-2.3],[w+.9,-1.6],[l,-1.0],[l+.8,-.5],[f,0],[fa+.3,1.2],[SECS(3),2.9]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t);
 return plan(t,[
  [0,0,()=>({P:[MT[0]+5.5,4.4,MT[1]-7.5],T:[MT[0]-.2,.6,MT[1]+.2],fov:34})],
  [CUE(3,'Then lift')-.4,1.1,()=>({P:[PB[0]-4.8,5,PB[2]-8],T:mix3(add3(PB,[0,.8,0]),add3(cghXZ(tau),[0,1,0]),.18),fov:38})],
  [CUE(3,'find a teammate')-.2,1.8,()=>({P:[PB[0]-14,17,PB[2]-20],T:mix3(PB,cghXZ(tau),.52),fov:46})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tW=CUE(3,'Win the ball'),tL=CUE(3,'Then lift'),tF=CUE(3,'find a teammate');
  stadium(s,c,[0,1,3]);
  ground(s,c);
  // 1 · win the ball cleanly: the hook arrow and the ball ringed at her feet; 2 · lift your head: the sight line; 3 · find a teammate far away: the pass arc, the teammate ringed
  hookArrow(s,c,sm(tW-.05,tW+.8,t,easeOut)*(1-sm(tL-.2,tL+.2,t)));
  {const u=sm(tW+.6,tW+1,t,easeOutBack)*(1-sm(tL-.2,tL+.2,t));if(u>.02)groundRing(s,c,ballAt(Math.min(tau,T_T2)),.6,u,Y,71);}
  passArc(s,c,sm(tF-.05,tF+.9,t,easeOut));
  groundRing(s,c,cghXZ(tau),1,sm(tF+.3,tF+.8,t,easeOutBack),R,73);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:95});
  sightLine(s,c,Math.min(tau,T_UP1),sm(tL-.05,tL+.5,t,easeOut)*(1-sm(tF+.2,tF+.6,t)));
 },
 still:6.4,
};

const film:RisoStory={
 id:'mapi-leon-signature',format:'11v11',title:"León's tackle and long pass",
 theme:'Win the ball cleanly (stay on your feet, don’t dive in), then lift your head and find a teammate far away',
 ageNote:'Chelsea 0–4 Barcelona, UEFA Women’s Champions League final, Gamla Ullevi, Gothenburg, 16 May 2021 (behind closed doors) — Mapi León’s signature shown as how she plays, not one logged moment. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the tackle and the long pass — a small yellow hook at the touch point, then a red arc lifts far away and the ball lands. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.65)/.3),r=rng(seed);
  const hook:Pt[]=[];for(let i=0;i<=8;i++){const a=Math.PI*1.1+Math.PI*.7*Math.min(1,u*2)*i/8;hook.push([x+Math.cos(a)*30,y+Math.sin(a)*18]);}
  if(hook.length>2)s.fill(Y,ribbon(hook,9,{seed,taper:.6,pressure:.3,wobble:1}),.95*fade);
  const k=clamp(u*1.6-.5);if(k>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const q=i/12*k;pts.push([x+20+240*q,y-10-160*q*(1-q)*2.2+20*q]);}s.fill(R,ribbon(pts,10,{seed:seed+1,taper:.9,pressure:.3,wobble:1}),.95*fade);
   const e=pts[pts.length-1];footballPanels(s,e[0],e[1],24,{rot:age*8+r()*TAU,key:K,shadow:B,seed:5});}
  else footballPanels(s,x+20,y-10,24,{rot:r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
