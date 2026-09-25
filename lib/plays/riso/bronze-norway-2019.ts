/** Lucy Bronze's first-time strike — Norway 0–3 England, FIFA Women's World Cup 2019 quarter-final, Stade Océane, Le Havre, Thursday
 * 27 June 2019 (kick-off 21:00). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer)
 * or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (read Sept 2026; page source fetched with curl, cached in scratchpad/films/src-cache):
 *  - Wikipedia, "2019 FIFA Women's World Cup knockout stage" (Norway vs England: score, scorers and minutes, Stade Océane, attendance
 *    21,111, line-ups with shirt numbers, the kit templates worn that night)  https://en.wikipedia.org/wiki/2019_FIFA_Women%27s_World_Cup_knockout_stage
 *  - The Guardian, "Norway 0-3 England: Women's World Cup quarter-final – as it happened" (51, 53, 56, 57, 59 and 63 min entries)
 *    https://www.theguardian.com/football/live/2019/jun/27/norway-v-england-womens-world-cup-quarter-final-live
 *  - The Guardian, Louise Taylor, "Lucy Bronze strike caps win over Norway as England reach semi-finals" (match report, 27 June 2019)
 *    https://www.theguardian.com/football/2019/jun/27/norway-england-womens-world-cup-quarter-final-match-report
 *  - The Independent, "England are into the Women's World Cup semi-finals" (27 June 2019)
 *    https://www.independent.co.uk/sport/football/womens_football/england-vs-norway-result-womens-world-cup-2019-quarter-final-white-scott-bronze-goals-video-a8978431.html
 *  - Wikipedia, "Lucy Bronze" (the goal "from just outside the area"; Player of the Match); The FA, "Phil Neville in bullish mood..."
 * CONFIRMED by those accounts: Norway 0–3 England, 27 June 2019, Stade Océane, Le Havre; Scott 3', White 40', Bronze 57'; a strong wind
 * off the Channel that evening; 56 min: "Lucy Bronze goes down after a tussle with Ingrid Engen, who concedes a free-kick between the right
 * side of the Norway penalty area and the touchline" (Guardian MBM); Beth Mead had come on for Toni Duggan (54') "only three minutes" before;
 * "Beth Mead was stood over the free-kick out on the right flank. She raised her right hand, eyes fixed on a crowded penalty box, but cut a
 * pass [to] the lone figure standing on its edge" (Independent); "Beth Mead pulled the ball her way and Bronze unleashed a fantastic shot",
 * "a surface-to-air screamer into the roof of the net from about 25 metres out after being left unmarked once again at a set-piece"
 * (Guardian MBM); "leaving the Lyon full-back to smash it first time, and imperiously, high into the net from just outside the area"
 * (Guardian report); "Bronze's howitzer appeared to go through [Hjelmseth's] hands" (Guardian MBM, 63 min); England had tried the same
 * short free-kick to Bronze at 51 min (Duggan, retaken) and Bronze had "spent the days before ... dry-running this move" (Independent);
 * Norway "keep leaving Bronze unmarked at set pieces" (59 min). Numbers: Bronze 2, Mead 22, White 18, Houghton 5, Bright 6, Scott 8,
 * Parris 7; Norway: Hjelmseth 1 (keeper), Mjelde 6, Thorisdottir 3, Minde 17, Engen 14, Risa 8, Reiten 16, Sævik 21. KITS (Wikipedia
 * kit templates for this match): England all white (shirt, shorts, socks); Norway navy shirts with red sleeves, navy shorts, red socks.
 * INFERRED (illustrative): every exact position and timing (the free-kick spot ≈ level with the box edge, 26 m in from the goal line's
 * centre; Bronze's spot ≈ 21 m out, right of centre, 3.9 m outside the box — "just outside" / "about 25 metres" disagree slightly), the
 * pass's pace, which foot Mead passed with (right here), that Bronze struck with her RIGHT foot (she is a right-back and right-footed; not
 * stated in the reports), the shot's exact line and which side of Hjelmseth it passed (drawn high, just to her right, over her raised
 * palm), Hjelmseth's position and leap and her yellow kit, the two-player wall, every other player's position (only Engen's late close-down
 * is suggested by the foul and the "unmarked" notes), the celebration run toward the England fans (the Guardian photo shows Bronze "raising
 * her arms in triumph"), trim and number inks, hair colours and ponytails, the direction of play on screen, camera positions, Stade Océane's
 * look (a single blue-seated bowl under a pale shell roof) and crowd colours, the late-June dusk light (≈ 22:00 local) under floodlights.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Mead over the free-kick wide on the right,
 * the raised hand, the pass cut back to Bronze on the edge of the box, the first-time strike into the roof of the net; ch2 = slow-motion
 * replay from a LOW touchline camera behind her: nobody marks her (an empty ring of grass), she waits, then arrives late, just as the ball
 * does (a riso trail marks the run); ch3 = the second replay from BEHIND THE GOAL, a long lens on her: knee over the ball, strike through
 * it, the ball rising past Hjelmseth's hands into the roof of the net, then live for the celebration; ch4 = the lesson on the grass: arrive
 * late (run + pass trails meeting), nobody can mark you, plant beside the ball, knee over it, ankle locked, strike through it first time.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion so the ponytails swing, motionSmear on the strike and the sprint); women's builds (1.62–1.81 m, slimmer bulk) with
 * ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward
 * the goal Norway defend, y up, +z = the attackers' right = the main-stand side), athlete.ts's own convention, so foot:'r' is the right
 * foot. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos,
 * cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperTip,celebrate,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py
 * has written public/plays/narration/bronze-norway-2019/timing.json, add
 *   import timingJson from '../../../public/plays/narration/bronze-norway-2019/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free-kick, live',text:'Le Havre, 2019. England play Norway at the World Cup. Free-kick out wide. Beth Mead raises her hand... then cuts it back to Lucy Bronze. First time! Roof of the net!',tail:2.3,
  cues:['Le Havre','England play Norway','Free-kick','Beth Mead','raises her hand','cuts it back','Lucy Bronze','First time','Roof of the net']},
 {label:'Arrive late',text:'Watch it again. Nobody marks Bronze. She waits outside the box, then arrives late, just as the ball does.',tail:1.2,
  cues:['Watch it again','Nobody marks','waits outside','arrives late','just as the ball']},
 {label:'Through the ball',text:'Knee over the ball, she strikes through it. Past the keeper\'s hands. Three-nil!',tail:2.4,
  cues:['Knee over','strikes through','Past the','hands','Three-nil']},
 {label:'The secret',text:'The secret? Arrive late, so no one can mark you. Plant beside the ball, knee over it, ankle locked, and strike through it first time.',tail:1.9,
  cues:['The secret','Arrive late','no one can mark','Plant beside','knee over','ankle locked','strike through']},
];
import timingJson from '../../../public/plays/narration/bronze-norway-2019/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('bronze: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('bronze: no cue '+w);return c.at;};
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
/** Pitch: the goal line Norway defend is x = 0 (England attack +x), goal centre z = 0, +z = the attackers' right (the main-stand side). */
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

// ---------------------------------------------------------------- Stade Océane at dusk: one blue-seated bowl under a pale shell roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+19*b,-40-24*b],
 (a,b)=>[7+22*b,1.3+17*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+19*b,40+24*b],
 (a,b)=>[-111-22*b,1.3+17*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=12,WALKS=[[.5],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, kind 0 = St George, 1 = Norway] (England fans behind this goal and along the main stand) */
const FLAGS:[number,number,number][]=[[0,.5,1],[0,.62,0],[0,.74,1],[0,.86,0],[1,.2,0],[1,.38,0],[1,.6,1],[1,.8,0],[2,.12,0],[2,.26,0],[3,.3,1],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a late-June dusk (≈ 22:00): a deep blue sky, a warm yellow-red glow low over the Channel
 s.field(B,.34,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);s.tone(R,polyPath([[-1e4,hz[1]-200],[1e4,hz[1]-200],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.15);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.8),[0,7.5,0]),add3(S(0,.8),[0,7.5,0])]));
  seg3(c,add3(S(0,.8),[0,7.3,0]),add3(S(1,.8),[0,7.3,0]),.4,edge);}
 s.knockout(planes);s.tone(B,planes,.62);s.tone(K,planes,.2);s.knockout(walk,.85);
 // the crowd: England white and red, Norway red and navy; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.05))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.58?0:h<.84?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.9);
 // the pale shell roof, its navy underside edge
 s.knockout(roof);s.tone(B,roof,.15);s.fill(K,edge,.85);
 // flags: St George (paper, red cross) and Norway (red, a navy cross edged white)
 const fl=new Path2D(),cr=new Path2D(),no=new Path2D(),nw=new Path2D(),nb=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
  else{no.addPath(polyPath(q,true));addPoly(nw,polyP(c,[P(.28,.005),P(.46,.005),P(.46,.075),P(.28,.075)]));addPoly(nw,polyP(c,[P(0,.028),P(1,.028),P(1,.052),P(0,.052)]));
   addPoly(nb,polyP(c,[P(.33,.005),P(.41,.005),P(.41,.075),P(.33,.075)]));addPoly(nb,polyP(c,[P(0,.035),P(1,.035),P(1,.045),P(0,.045)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(no);s.fill(R,no,.95);s.knockout(nw);s.fill(K,nb,.95);
 // floodlight strips along the roof lip, on for the evening
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.8),[0,6.6,0]),b=add3(S(u+.03,.8),[0,6.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
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
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge lifts the roof and pushes the back out where the shot went in (z ≈ −.5) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-.5,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.6,2)),back=(z:number)=>X+2+bw(z)*.7,top=(z:number)=>1.9+bw(z)*.35;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),top(z),z],.022,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),top(zs[i])*f,zs[i]],[back(zs[i+1]),top(zs[i+1])*f,zs[i+1]],.022,mesh,.7);seg3(c,[X,H*f,z0],[back(z0),top(z0)*f,z0],.022,mesh,.7);seg3(c,[X,H*f,z1],[back(z1),top(z1)*f,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;for(let i=0;i<zs.length-1;i++){const a=zs[i],b=zs[i+1];seg3(c,[X+(back(a)-X)*u,H+(top(a)-H)*u,a],[X+(back(b)-X)*u,H+(top(b)-H)*u,b],.022,mesh,.7);}}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[R,.5],[K,.4],[Y,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** England all white (Wikipedia kit template, this match); Norway navy shirts with red sleeve bands (trim), navy shorts, red socks */
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const norway=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:R,boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:R,numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.7),...o});
const BRONZE_B=W_BUILD(1.72,.95);
const BRONZE_ST=england({number:2,hair:[K,.85],build:BRONZE_B,seed:2});
const MEAD_ST=england({number:22,hair:[Y,.95],build:W_BUILD(1.64,.93),seed:22});
const ENGEN_ST=norway({number:14,build:W_BUILD(1.7,.92),seed:14});
const HJEL_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:W_BUILD(1.73,.95),seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Bronze's contact)
/** the free-kick spot (wide on the right, level with the box edge) and the ball where Bronze meets it (≈ 21 m out, right of centre) */
const F:V3=[-15.6,.11,25.8],M:V3=[-20.4,.11,7.6];
/** Mead's pass leaves at T_PASS and rolls to M at τ = 0; her hand goes up at T_HAND */
const T_PASS=-1.3,T_HAND=-3.3;
/** the shot: "surface-to-air ... into the roof of the net" — rising all the way, high just right of centre (keeper's right) */
const GOAL_PT:V3=[0,2.26,-.55],T_SHOT=.8,NET_HIT:V3=[1.55,2.02,-.5],REST:V3=[1.25,.11,-.3],T_NET=T_SHOT+.1;
const SHOT_DIR:[number,number]=(()=>{const dx=GOAL_PT[0]-M[0],dz=GOAL_PT[2]-M[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const PASS_DIR:[number,number]=(()=>{const dx=M[0]-F[0],dz=M[2]-F[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
function shotAt(u:number):V3{const e=u*(1.08-.08*u);return[lerp(M[0],GOAL_PT[0],e),lerp(M[1],GOAL_PT[1],e)+.42*Math.sin(Math.PI*e),lerp(M[2],GOAL_PT[2],e)];}
const roll=(a:V3,b:V3,u:number):V3=>mix3(a,b,u*(1.3-.3*u));
function ballAt(tau:number):V3{
 if(tau<T_PASS)return F;
 if(tau<0)return roll(F,M,(tau-T_PASS)/-T_PASS);
 if(tau<T_SHOT)return shotAt(tau/T_SHOT);
 if(tau<T_NET)return mix3(shotAt(1),NET_HIT,easeOut((tau-T_SHOT)/(T_NET-T_SHOT)));
 const u=clamp((tau-T_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.14*Math.abs(Math.sin((tau-T_NET-.55)*9))*Math.exp(-(tau-T_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=T_PASS?0:tau<0?TAU*2.2*(tau-T_PASS):TAU*2.2*-T_PASS+TAU*7*Math.min(tau,T_NET)+TAU*1.5*Math.max(0,tau-T_NET);
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
const CYCLE_M=3.8;
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}

// ---------------------------------------------------------------- Bronze: lurks alone on the edge of the box, arrives late, strikes first time, arms up
const SD=.9,ST0=-STRIKE_CONTACT*SD,ST1=(1-STRIKE_CONTACT)*SD;
/** a touch open at contact: hips square to the line of the shot, the body over the ball */
const YAW_B=yawTo(0,0,SHOT_DIR[0],SHOT_DIR[1]);
/** her pelvis at contact so the RIGHT boot meets the ball's back at M (solved once through the skeleton) */
const PB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:1}),BRONZE_B,{x:0,z:0,yaw:YAW_B});const tx=M[0]-SHOT_DIR[0]*.13,tz=M[2]-SHOT_DIR[1]*.13;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
/** where she waits: alone, ≈ 5.5 m behind and outside the strike spot, unmarked */
const WAIT:[number,number]=[PB[0]-4.6,PB[1]+3.3];
/** the late run: still until the pass is struck, then a short, fast, slightly curved run onto the ball */
const BRONZE_PATH:Path=[[-12,WAIT[0]-.3,WAIT[1]+.2],[-4,WAIT[0]-.1,WAIT[1]+.1],[-1.55,WAIT[0],WAIT[1]],[-.95,WAIT[0]+1.3,WAIT[1]-.55],
 [ST0,PB[0]-SHOT_DIR[0]*1.25+.1,PB[1]-SHOT_DIR[1]*1.25+.35],[0,PB[0],PB[1]],[ST1,PB[0]+SHOT_DIR[0]*.55,PB[1]+SHOT_DIR[1]*.55]];
/** the celebration: she wheels away toward the England fans in the main-stand corner, arms raised (inferred route) */
const CELEB_PATH:Path=[[ST1,PB[0]+SHOT_DIR[0]*.55,PB[1]+SHOT_DIR[1]*.55],[1.3,PB[0]+1.6,PB[1]+1.2],[2.4,-17.4,12.6],[3.6,-16.8,17.4],[4.6,-17.2,19.6],[6,-17.6,20.4]];
const B_TAB=distTable(BRONZE_PATH),CELEB_TAB=distTable(CELEB_PATH);
/** lurking: weight on the balls of the feet, knees soft, head up on the free-kick */
const LURK=posed({lHipF:18,rHipF:10,lKnee:26,rKnee:22,lean:10,pitch:3,neckP:-4,neckY:10,lShA:16,rShA:18,lShF:8,rShF:-4,lElb:46,rElb:42});
const ARMS_UP=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-32,lean:-10,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
function bronzePose(tau:number):Pose{
 if(tau<ST1){
  const sp=speedAt(BRONZE_PATH,tau),ph=distAt(B_TAB,tau)/CYCLE_M,run=runCycle(ph,{speed:clamp((sp-1)/5)});
  let p=blendPose(LURK,run,sm(.6,2.4,sp));
  // the head on a swivel while she waits: the ball, the box, the ball
  if(tau<-1.55)p.neckY+=(14*Math.sin(tau*1.3))*DEG;
  // the strike: approach → plant → backswing → CONTACT (τ = 0) → follow-through
  const u=STRIKE_CONTACT+tau/SD;if(u>0)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),sm(0,.14,u));
  return p;
 }
 const s=distAt(CELEB_TAB,tau),sp=speedAt(CELEB_PATH,tau);
 let p=blendPose(strike(1,{foot:'r',power:1}),celebrate(s/4.2,{kind:'run'}),sm(ST1,ST1+.4,tau));
 if(tau>3.2)p=blendPose(p,ARMS_UP,clamp(1-sp/3)*sm(3.2,4.2,tau));
 return p;
}
function bronzePlace(tau:number):Place{
 if(tau<ST1){const[x,z]=pathAt(BRONZE_PATH,tau),sp=speedAt(BRONZE_PATH,tau),a=pathAt(BRONZE_PATH,tau+.08),b=ballAt(tau);
  const face=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1,3,sp));return{x,z,yaw:lerpAng(face,YAW_B,sm(ST0-.2,ST0+.1,tau))};}
 const[x,z]=pathAt(CELEB_PATH,tau),a=pathAt(CELEB_PATH,tau+.1),sp=speedAt(CELEB_PATH,tau);
 const run=yawTo(x,z,a[0],a[1]),toFans=yawTo(x,z,-17,40);
 return{x,z,yaw:lerpAng(lerpAng(YAW_B,run,sm(ST1,ST1+.5,tau)),toFans,clamp(1-sp/2.5)*sm(3,4,tau))};
}

// ---------------------------------------------------------------- Mead: stands over the free-kick, raises her hand, cuts it back (right foot, inferred)
const MSD=.8;
const YAW_M=yawTo(0,0,PASS_DIR[0],PASS_DIR[1]);
const PM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),MEAD_ST.build,{x:0,z:0,yaw:YAW_M});const tx=F[0]-PASS_DIR[0]*.12,tz=F[2]-PASS_DIR[1]*.12;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
/** she stands ≈ 2.4 m behind the ball, looking at the box, then three steps in */
const MEAD_PATH:Path=[[-12,PM[0]-PASS_DIR[0]*2.5-.4,PM[1]-PASS_DIR[1]*2.5+.3],[T_PASS-1.05,PM[0]-PASS_DIR[0]*2.4-.4,PM[1]-PASS_DIR[1]*2.4+.3],
 [T_PASS-.45,PM[0]-PASS_DIR[0]*.9,PM[1]-PASS_DIR[1]*.9],[T_PASS,PM[0],PM[1]],[T_PASS+.8,PM[0]+PASS_DIR[0]*1.4,PM[1]+PASS_DIR[1]*1.4],
 [1.4,PM[0]+PASS_DIR[0]*2.6,PM[1]+PASS_DIR[1]*2.6],[4.4,-17.8,21.4],[6,-17.9,21.6]];
const HAND_UP=posed({rShF:34,rShA:150,rElb:10,rHand:1,neckY:-12,neckP:-8});

// ---------------------------------------------------------------- everyone else
type Role='mead'|'engen'|'keeper'|'wall'|'box';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number};
/** a box player: holds her spot while the free-kick is set, then steps toward the cut-back (dx, dz) and turns to watch */
const boxPath=(x:number,z:number,dx:number,dz:number,then?:[number,number,number][]):Path=>[[-12,x,z],[-3,x+.2*dx,z+.2*dz],[T_PASS+.1,x+.3*dx,z+.3*dz],[.6,x+dx,z+dz],...(then??[[3,x+dx*1.2,z+dz*1.2]])];
/** the wall: two Norwegians 9.15 m from the ball on the line to goal */
const WALL:[number,number]=(()=>{const dx=-F[0],dz=-F[2],l=Math.hypot(dx,dz);return[F[0]+dx/l*9.15,F[2]+dz/l*9.15];})();
const WP:[number,number]=(()=>{const dx=-F[0],dz=-F[2],l=Math.hypot(dx,dz);return[-dz/l*.36,dx/l*.36];})();
const TO_B=(x:number,z:number):[number,number]=>{const l=Math.hypot(PB[0]-x,PB[1]-z);return[(PB[0]-x)/l,(PB[1]-z)/l];};
const ACTORS:Actor[]=[
 {name:'Mead',role:'mead',st:MEAD_ST,path:MEAD_PATH,phase:.2},
 {name:'Engen',role:'engen',st:ENGEN_ST,path:[[-12,-13.9,10.2],[-3,-13.8,10],[T_PASS+.25,-14.1,9.9],[-.4,-15.9,9.2],[.2,-17.4,8.8],[.9,-17.5,8.6],[3,-17,8.4]],phase:.4},
 {name:'Reiten',role:'wall',st:norway({number:16,build:W_BUILD(1.66),seed:16}),path:[[-12,WALL[0]+WP[0],WALL[1]+WP[1]],[T_PASS+.2,WALL[0]+WP[0],WALL[1]+WP[1]],[1,WALL[0]+WP[0]-1.4,WALL[1]+WP[1]-1.6],[3,WALL[0]+WP[0]-2,WALL[1]+WP[1]-2.3]],phase:.1},
 {name:'Saevik',role:'wall',st:norway({number:21,hair:[R,.5],build:W_BUILD(1.64),seed:21}),path:[[-12,WALL[0]-WP[0],WALL[1]-WP[1]],[T_PASS+.2,WALL[0]-WP[0],WALL[1]-WP[1]],[1,WALL[0]-WP[0]-1.6,WALL[1]-WP[1]-1.3],[3,WALL[0]-WP[0]-2.2,WALL[1]-WP[1]-1.9]],phase:.6},
 {name:'Hjelmseth',role:'keeper',st:HJEL_ST,path:[[-12,-1.5,2.4],[T_PASS,-1.5,2.2],[-.2,-1.35,1.25],[.2,-1.25,.95],[3,-1.2,.9]],phase:0},
 {name:'White',role:'box',st:england({number:18,hair:[K,.8],build:W_BUILD(1.73),seed:18}),path:boxPath(-9.4,2.2,-.8,.5),phase:.3},
 {name:'Houghton',role:'box',st:england({number:5,hair:[Y,.7],build:W_BUILD(1.69),seed:5}),path:boxPath(-8.3,-3.1,-.6,.4),phase:.7},
 {name:'Bright',role:'box',st:england({number:6,hair:[Y,.9],build:W_BUILD(1.75,.95),seed:6}),path:boxPath(-10.4,5.6,-.5,.6),phase:.5},
 {name:'Scott',role:'box',st:england({number:8,hair:[R,.55],build:W_BUILD(1.81,.92),seed:8}),path:boxPath(-11.8,-.6,-.9,.3),phase:.9},
 {name:'Parris',role:'box',st:england({number:7,skin:SKIN_D,hair:K,hairStyle:'curly',build:W_BUILD(1.62),seed:7}),path:boxPath(-7.3,9.8,-.4,.3,[[2.2,-12,13.5],[4.6,-16.4,18.8],[6,-16.6,19.2]]),phase:.15},
 {name:'Mjelde',role:'box',st:norway({number:6,build:W_BUILD(1.7),seed:40}),path:boxPath(-8,1.1,-1,.8),phase:.8},
 {name:'Thorisdottir',role:'box',st:norway({number:3,build:W_BUILD(1.84,.95),seed:41}),path:boxPath(-8.8,-2.4,-.9,.6),phase:.35},
 {name:'Minde',role:'box',st:norway({number:17,build:W_BUILD(1.68),seed:42}),path:boxPath(-7.6,7.4,-.7,.2),phase:.55},
 {name:'Risa',role:'box',st:norway({number:8,build:W_BUILD(1.66),seed:43}),path:boxPath(-12,3.6,-1.4,.8),phase:.25},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** one actor's pose + place at τ (it = idle clock). England celebrate after the goal; Norway slump. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase;
 const br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 const eng=a.st.shirt==='paper';
 if(a.role==='mead'){
  // the raised right hand ("eyes fixed on a crowded penalty box"), then the short pass cut back to Bronze
  const hu=sm(T_HAND-.25,T_HAND+.2,tau)*(1-sm(T_PASS-1.05,T_PASS-.7,tau));if(hu>0){p=blendPose(p,{...p,...pick(HAND_UP,['rShF','rShA','rElb','rHand'])},hu);yaw=lerpAng(yaw,yawTo(x,z,-8,2),hu);}
  const us=STRIKE_CONTACT+(tau-T_PASS)/MSD;if(us>0&&us<1){const w=sm(0,.15,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot:'r',power:.45}),w);yaw=lerpAng(yaw,YAW_M,Math.max(w,sm(T_PASS-1,T_PASS-.5,tau)*(1-sm(T_PASS+.5,T_PASS+.9,tau))));}
  if(tau>T_NET+.2&&sp<1.2)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);
  if(tau>T_NET){const r=pathAt(CELEB_PATH,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.7*sm(T_NET,T_NET+.5,tau));}
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='engen'){
  // she reads the cut-back a beat late: a sprint out, then a stretching lunge that never reaches the ball
  const u=clamp((tau+.3)/.85);if(u>0&&tau<1.4){const w=sm(0,.15,u)*(1-sm(1.1,1.4,tau));p=blendPose(p,lunge(u,{side:'l'}),w);yaw=lerpAng(yaw,yawTo(x,z,M[0],M[2]),w);}
  if(tau>T_NET)p=blendPose(p,SLUMP,sm(T_NET+.4,T_NET+1.2,tau)*.7);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);
  // Hjelmseth shuffles across, then leaps back and up with her right palm: the ball goes through her hands into the roof
  const KD=.85,k0=.74-.62*KD;if(tau>k0){const u=clamp((tau-k0)/KD);kp=blendPose(kp,keeperTip(u,{hand:'r'}),sm(k0,k0+.12,tau)*(1-sm(2.4,3,tau)));}
  if(tau>2.4)kp=blendPose(kp,SLUMP,sm(2.4,3,tau)*.6);
  return{pose:kp,place:{x,z,yaw:yawTo(x,z,M[0],M[2])}};
 }
 if(a.role==='wall'){if(tau<T_PASS+.2){p=blendPose(p,READY,.7);yaw=yawTo(x,z,F[0],F[2]);}}
 // box players turn toward the cut-back; after the goal England arms up, Norway heads down
 if(tau>T_PASS&&sp<1.4)yaw=lerpAng(yaw,toBall,.8);
 if(tau>T_NET+.2&&sp<1.2){if(eng)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 if(tau>T_NET&&eng&&sp<1.2){const r=pathAt(CELEB_PATH,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}
/** copy a few channels of a pose (a raised arm over whatever the body is doing) */
function pick(p:Pose,keys:(keyof Pose)[]):Partial<Pose>{const o:Partial<Pose>={};for(const k of keys)o[k]=p[k];return o;}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the strike, the late run). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_PASS&&tau<T_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
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
 {const pl=bronzePlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=bronzePose(tp),prev={pose:bronzePose(tpPrev),place:bronzePlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(BRONZE_ST,d,true),pl,prev,!!e.smear&&tp>-1.3&&tp<3);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role!=='box'&&a.role!=='wall'),cur.place,prev,!!e.smear&&((a.role==='mead'&&tp>T_PASS-.5&&tp<T_PASS+.4)||(a.role==='keeper'&&tp>.2&&tp<1.2)));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(1.6,y/5)*.6+.6,z/5];}
const bxz=(tau:number):V3=>{const p=bronzePlace(tau);return[p.x??0,0,p.z??0];};
/** a ring on the grass (radius rm metres) around a ground point: the empty space round Bronze, the plant foot, the ball */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,cov=.95,dashed=false){if(u<=.02)return;const pts:Pt[]=[];const r=rm*(.75+.25*u);
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[P[0]+Math.cos(a)*r,.02,P[2]+Math.sin(a)*r]);if(q)pts.push(q);}if(pts.length<20)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<10;i++)gaps.push([(i+.55)/10,(i+.95)/10]);
 const w=Math.max(4,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,cov*u);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** real time; the strike lands on "First time" */
const tS1=()=>CUE(0,'First time')-.05;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-22,16,70];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-12,2,6],fov:24})],
  [CUE(0,'Free-kick')-.3,1.4,()=>({P:P1,T:mix3(F,[-12,1.5,8],.5),fov:17})],
  [CUE(0,'Beth Mead')-.2,1.2,()=>({P:P1,T:mix3(F,[-16,1.5,10],.28),fov:10.5})],
  [tS1()+T_PASS-.3,1,()=>({P:P1,T:add3(panTarget(tau),[1.5,.8,-1.5]),fov:14})],
  [tS1()-.2,.8,()=>({P:P1,T:mix3(M,[-4,1.6,0],.45),fov:16})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(bxz(tau),[0,1,0]),fov:11})],
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
 still:11,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera behind her: nobody marks her, she arrives late
const tau2=(t:number)=>key(t,mono([[0,-4],[CUE(1,'Nobody marks'),-3.3],[CUE(1,'waits outside')+.3,-2.2],[CUE(1,'arrives late')-.1,-1.5],[CUE(1,'just as the ball')-.1,-.55],[SECS(1),-.03]]),linear);
const E2:V3=[-31.5,1.45,17.5];
/** the run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=22;i++){const tau=lerp(t0,t1,i/22),p=bronzePlace(tau),q=pr(c,[p.x??0,.02,p.z??0]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,bxz(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** the pass so far, a dashed red line on the grass */
function passTrail(s:Sheet,c:Cam,tau:number,fade:number){
 if(tau<=T_PASS+.05||fade<=.02)return;const pts=pathPts(c,T_PASS,Math.min(tau,0),16);if(pts.length<3)return;const w=Math.max(6,kAt(c,M)*.12);
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);s.knockout(ribbon(pts,w*1.5,{taper:.4,pressure:.2,wobble:0,gaps}),.4*fade);s.fill(R,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0,gaps}),.9*fade);}
function cam2(t:number):Cam{
 const tau=tau2(t),b=add3(bxz(tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(b,[-10,1,4],.45),fov:34})],
  [CUE(1,'Nobody marks')-.2,1.2,()=>({P:add3(E2,[1,.2,-1]),T:add3(b,[1.2,-.4,-.6]),fov:28})],
  [CUE(1,'arrives late')-.3,1.1,()=>({P:add3(E2,[2.5,.1,-3]),T:mix3(b,M,.5),fov:22})],
  [CUE(1,'just as the ball')-.3,.9,()=>({P:add3(E2,[4,.1,-5]),T:mix3(add3(M,[0,.6,0]),b,.4),fov:17})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tN=CUE(1,'Nobody marks'),tA=CUE(1,'arrives late');
  stadium(s,c,t,[0,1]);
  ground(s,c);
  // "Nobody marks Bronze": an empty ring of grass round her — no Norway shirt inside it
  const nm=sm(tN-.1,tN+.4,t,easeOutBack)*(1-sm(tA-.2,tA+.3,t));groundRing(s,c,[WAIT[0],0,WAIT[1]],3.4,nm,Y,11,.95,true);
  runTrail(s,c,-1.55,Math.min(tau,0),sm(tA-.2,tA+.4,t));
  passTrail(s,c,tau,sm(tA-.2,tA+.4,t));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:34});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:5.5,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal, a long lens: through the ball, past the hands; then live
const tau3=(t:number)=>{const k=CUE(2,'Knee over'),st=CUE(2,'strikes through'),p=CUE(2,'Past the'),h=CUE(2,'hands'),o=CUE(2,'Three-nil');
 return key(t,mono([[0,-.3],[k+.4,-.04],[st,.0],[st+.5,.12],[p,.45],[h+.2,T_SHOT-.04],[o,T_NET+.45],[SECS(2),T_NET+.45+(SECS(2)-o)]]),linear);};
const E3:V3=[5.2,1.6,-1.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(Math.max(tau,0),T_SHOT)),r=add3(bxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:add3(M,[.3,.75,-.3]),fov:8})],
  [CUE(2,'strikes through')+.25,.8,()=>({P:E3,T:mix3(add3(M,[0,.8,0]),b,.5),fov:14})],
  [CUE(2,'Past the')-.15,.6,()=>({P:E3,T:mix3([-2.5,1.8,-.2],b,.3),fov:30})],
  [CUE(2,'Three-nil')-.2,1.4,()=>({P:add3(E3,[.5,1.2,.4]),T:r,fov:14})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tO=CUE(2,'Three-nil');
  stadium(s,c,t,[3,0,2],{roar:sm(tO-.3,tO+.3,t),flash:sm(tO-.2,tO+.2,t)*.8});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the shot's path so far: a yellow replay trail, boot → roof of the net
  if(tau>0&&tau<T_NET+.8){const pts=pathPts(c,0,Math.min(tau,T_SHOT),16),fade=1-sm(T_NET,T_NET+.8,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_SHOT)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:48});
  // the contact: a spark where her laces meet the ball
  const hit=sm(-.02,.03,tau)*(1-sm(.1,.26,tau));if(hit>0){const q=pr(c,M);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,M)*.5)*hit,{n:9,seed:23,width:Math.max(6,kAt(c,M)*.04)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(bxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: arrive late → no one can mark you → plant → knee over → ankle locked → strike through
const tau4=(t:number)=>{const a=CUE(3,'Arrive late'),n=CUE(3,'no one can mark'),p=CUE(3,'Plant beside'),k=CUE(3,'knee over'),l=CUE(3,'ankle locked'),s=CUE(3,'strike through');
 return key(t,mono([[0,-2.2],[a,-1.9],[n+.3,-1],[p,-.3],[k-.1,-.06],[l+.2,-.02],[s,0],[s+.9,.4],[SECS(3),.62]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),b=add3(bxz(tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:[-15.4,2,15.4],T:mix3(b,M,.25),fov:24})],
  [CUE(3,'Plant beside')-.3,1,()=>({P:[-16.6,1.1,11.4],T:add3(M,[-.3,.45,.2]),fov:34})],
  [CUE(3,'knee over')-.2,.7,()=>({P:[-17.8,.95,10.6],T:add3(M,[-.3,.55,.1]),fov:32})],
  [CUE(3,'strike through')-.3,1.1,()=>({P:[-26.5,1.7,10.8],T:[-10,1.2,3.5],fov:40})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tA=CUE(3,'Arrive late'),tN=CUE(3,'no one can mark'),tP=CUE(3,'Plant beside'),tK=CUE(3,'knee over'),tL=CUE(3,'ankle locked'),tS=CUE(3,'strike through');
  stadium(s,c,t,[0,1,2,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · arrive late: her run (yellow) and the pass (red, dashed) traced on the grass, meeting at the ball
  const ar=sm(tA-.2,tA+.4,t)*(1-sm(tP,tP+.6,t));runTrail(s,c,-1.55,Math.min(tau,0),ar,.28);passTrail(s,c,tau,ar);
  // 2 · no one can mark you: the empty ring of grass round her
  const nm=sm(tN-.1,tN+.4,t,easeOutBack)*(1-sm(tP-.2,tP+.3,t));if(nm>.02){const p=bronzePlace(tp);groundRing(s,c,[p.x??0,0,p.z??0],3,nm,Y,11,.95,true);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:40});
  const sk=solve(bronzePose(tp),BRONZE_B,bronzePlace(tp));
  // 3 · plant beside the ball: a red ring round the standing (left) foot, level with the ball
  const pl=sm(tP-.1,tP+.35,t,easeOutBack)*(1-sm(tS-.2,tS+.3,t));if(pl>.02)groundRing(s,c,[sk.lAn[0],0,sk.lAn[2]],.42,pl,R,21);
  // 4 · knee over it: a yellow plumb line from the knee down to the ball
  const kn=sm(tK-.1,tK+.35,t,easeOutBack)*(1-sm(tS-.1,tS+.4,t));
  if(kn>.02){const a=sk.lKn,bb=ballAt(Math.min(tau,0)),q1=pr(c,a),q2=pr(c,[a[0],.05,a[2]]);if(q1&&q2){const w=Math.max(5,kAt(c,a)*.03);const ln=ribbon([q1,[lerp(q1[0],q2[0],kn),lerp(q1[1],q2[1],kn)]],w,{taper:0,wobble:0,gaps:[[.2,.3],[.5,.6],[.8,.9]]});s.knockout(ln,.8*kn);s.fill(Y,ln,.95*kn);}ring3(s,c,a,.14,kn,Y,31);ring3(s,c,bb,.2,kn,Y,33);}
  // 5 · ankle locked: a red ring round the striking boot
  const an=sm(tL-.1,tL+.35,t,easeOutBack)*(1-sm(tS+.2,tS+.7,t));if(an>.02)ring3(s,c,sk.rAn,.15,an,R,43);
  // 6 · strike through it: a red arrow from the boot through the ball, rising toward the roof of the net
  const th=sm(tS-.05,tS+.5,t,easeOut);
  if(th>.02){const a0=add3(M,[-SHOT_DIR[0]*.5,.02,-SHOT_DIR[1]*.5]),a1=shotAt(.35*th),a2=shotAt(Math.max(.1,.75*th));arrow3(s,c,[a0,a1,a2],Math.max(9,kAt(c,a1)*.1),R,.95);}
  if(th>.02&&tau>0){const pts=pathPts(c,0,Math.min(tau,T_SHOT),18);if(pts.length>2){const w=Math.max(7,kAt(c,ballAt(Math.min(tau,T_SHOT)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.6,pressure:.2,wobble:0}),.45);s.fill(Y,ribbon(pts,w,{taper:.6,pressure:.2,wobble:0}),.9);}}
 },
 still:8.5,
};

const film:RisoStory={
 id:'bronze-norway-2019',format:'11v11',title:"Bronze's first-time strike",
 theme:'Striking first time from the edge of the box: arrive late so no one can mark you, plant beside the ball, keep your knee over it, lock your ankle and strike through it',
 ageNote:'Norway 0–3 England, FIFA Women’s World Cup 2019 quarter-final, Stade Océane, Le Havre, 27 June 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little first-time strike — a red pass rolls in, meets a yellow spark and the ball rises away. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*Math.min(1,u*1.8);pts.push([x+150-150*k,y+40-40*k]);}
  if(pts.length>2)s.fill(R,ribbon(pts,11,{seed,taper:.8,pressure:.3,wobble:1}),.9*fade);
  const out=clamp(u*1.8-1);const e:Pt=out>0?[x+160*out,y-150*out+30*out*out]:pts[pts.length-1];
  if(out>0){const tr:Pt[]=[];for(let i=0;i<=8;i++){const k=i/8*out;tr.push([x+160*k,y-150*k+30*k*k]);}if(tr.length>2)s.fill(Y,ribbon(tr,13,{seed:seed+1,taper:.9,pressure:.3,wobble:1}),.95*fade);}
  if(age>0&&age<.35&&u>.5)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.35),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
