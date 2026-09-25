/** Iconic-play film · Aurélien Tchouaméni, "Signature: the shield in front of the defence" — England 1–2 France, FIFA World Cup 2022
 * quarter-final, Al Bayt Stadium, Al Khor, Qatar, Saturday 10 December 2022 (kick-off 22:00 local). A riso film (RisoStory, chapters mode)
 * played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself
 * was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: Tchouaméni's entry in lib/town/iconicPlays.json is a signature (a trait: "the shield in front of the defence", lesson
 * "Stay between the ball and your goal so attackers have to go around you"), not one match moment. No written source we could reach logs ONE
 * specific Tchouaméni block or interception with a minute and a position, so — per the brief — the real-match chapters (1–3) show only the
 * best-documented, confirmed moment of his France career: his 17th-minute 25-yard goal against England, which several written sources
 * describe in detail. The shielding trait itself is shown ONLY in chapter 4, a clearly labelled demonstration ("How he does it": training
 * kits, a training pitch, no crowd, no named opponent, no score, no date). The narration says so plainly ("Watch how he does it"). No
 * invented block, tackle or interception is staged inside the real match.
 *
 * SOURCES (read 24 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2022 FIFA World Cup knockout stage" (raw; England vs France: score, scorers and minutes, Al Bayt Stadium, attendance
 *    68,895, referee Wilton Sampaio, line-ups with shirt numbers, the kit templates worn that night, the goal: "a shot from outside the
 *    penalty area to the left corner which beat England goalkeeper Jordan Pickford diving down to his right")  (wiki-2022-wc-ko.txt)
 *  - BBC Sport, Phil McNulty, "England 1-2 France" (10 Dec 2022): "France took a 17th-minute lead when Aurelien Tchouameni's 25-yard drive
 *    beat Jordan Pickford low to his right"; Griezmann "providing the pass for Tchouameni's strike"  https://www.bbc.com/sport/football/63843792
 *    (bbc-eng-fra-2022-report.txt)
 *  - The Guardian, Scott Murray, "England v France: World Cup 2022 quarter-final – live" (17, 19 and 22 min entries): "Upamecano picks
 *    Saka's pocket ... in the French left-back position and sets off down the left flank. His team-mates follow. The ball's shuttled to the
 *    right flank by Mbappe, then cut back via Dembele and Griezmann for Tchouameni, who sends a sensational diagonal daisycutter into the
 *    bottom left from 25 yards!"; "Pickford ... couldn't get over to the shot in time"; photo captions "Tchouameni shoots from outside the
 *    box", "Pickford sees it late and can't keep the shot out"
 *    https://www.theguardian.com/football/live/2022/dec/10/england-v-france-world-cup-2022-quarter-final-live (guardian-eng-fra-2022-live*.txt)
 * CONFIRMED by those sources: the match, date, venue and result (England 1–2 France; Tchouaméni 17', Kane 54' pen, Giroud 78'); the move —
 * France win the ball on their own left, break, the ball is switched to the right by Mbappé, then cut back via Dembélé and Griezmann (who
 * gives the final pass) to Tchouaméni ≈ 25 yards out, outside the box; the shot is LOW ("daisycutter", "low"), DIAGONAL, into the bottom
 * LEFT corner, Pickford diving down to HIS RIGHT and not getting across in time. Numbers: France — Lloris 1, Koundé 5, Varane 4,
 * Upamecano 18, Théo Hernandez 22, Tchouaméni 8, Rabiot 14, Dembélé 11, Griezmann 7, Mbappé 10, Giroud 9; England — Pickford 1, Walker 2,
 * Stones 5, Maguire 6, Shaw 3, Rice 4, Henderson 8, Bellingham 22, Saka 17, Kane 9, Foden 20. KITS (Wikipedia kit templates for this match):
 * France in their home kit — dark navy shirts, WHITE shorts, RED socks; England in their home kit — WHITE shirts, NAVY shorts, WHITE socks.
 * Club facts (card data, lib/town/playerCareers.json): Real Madrid since 2022 (not named in the film). Country (playerAppearance.json): France.
 * INFERRED (illustrative): the Saka/Upamecano challenge and the first ~20 s of the move are not shown (the film joins the move as Mbappé
 * switches it; the disputed foul is not shown or narrated); every exact position and timing (Mbappé's switch ≈ 31 m from goal on the left,
 * Dembélé receiving wide right, cutting in, Griezmann receiving ≈ 17 m out right of centre and laying it back first time); Tchouaméni's spot
 * (≈ 23 m out, 4.4 m right of centre → a 24 m diagonal shot, "25 yards"); that he struck FIRST TIME and with his RIGHT foot (he is
 * right-footed; neither report states the foot or the touch — so neither is narrated); which feet Mbappé, Dembélé and Griezmann passed
 * with (right); the ball's exact line inside the left post; every England player's position (only Pickford's is described); Pickford's
 * goalkeeper kit (yellow here); the celebration run toward the corner; hair, skin and trim details; the direction of play on screen; camera
 * positions; Al Bayt's interior (a tent-shaped roof with red, navy and white sadu stripes over a red-seated bowl) and the crowd colours.
 * Chapter 4 is a DEMONSTRATION, not match footage: training tops (Tchouaméni in blue, the attacker in a red bib), a training pitch.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Mbappé switches it, Dembélé cuts in, Griezmann
 * lays it back, the diagonal daisycutter into the bottom corner, Tchouaméni wheels away; ch2 = slow-motion replay from a LOW camera behind
 * him: 25 yards out, low and hard, skidding across the grass (a yellow replay trail); ch3 = the second replay from BEHIND THE GOAL, long lens:
 * Pickford sees it late, dives to his right, too late — then live for the celebration; ch4 = "How he does it" (the demonstration): the only
 * chapter with teaching marks — a ring round him in front of his two centre-backs, his shuffle traced on the grass, the dashed line from the
 * ball to the goal that he stands on, a shield arc facing the ball, the attacker's arrow bending round him, then he steps in and wins it.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Every body goes through ONE adapter, drawPlayer() → athlete.ts (`prev` secondary motion, motionSmear on the strike and the
 * dive); small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the
 * goal England defend, y up, +z = France's right = the main-stand side), athlete.ts's own convention, so foot:'r' is the right foot and
 * Pickford (facing −x) diving to HIS right goes to −z, the shooter's left. Inks: yellow, red, blue, navy. Everything is keyed to cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,lunge,backpedal,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once
 * scripts/plays/kokoro-narrate.py has written public/plays/narration/tchouameni-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/tchouameni-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The strike, live',text:'Qatar, 2022. France play England at the World Cup. France break forward. Griezmann lays it back to Aurélien Tchouaméni. Shot! Low into the corner!',tail:2.4,
  cues:['Qatar','France play England','France break','Griezmann','lays it back','Shot','Low into']},
 {label:'Low and hard',text:'Watch again. From twenty-five yards, he hits it low and hard across the grass.',tail:1.3,
  cues:['Watch again','From twenty','hits it low','across the grass']},
 {label:'Too late',text:'Pickford sees it late. He dives... too late. France lead!',tail:2.2,
  cues:['Pickford sees','He dives','too late','France lead']},
 {label:'How he does it',text:'Usually, Tchouaméni is France\'s shield. Watch how he does it. He shuffles across, always between the ball and his goal. The attacker must go around him. Stay between the ball and your goal, so attackers have to go around you.',tail:1.9,
  cues:['Usually','Watch how','shuffles across','always between','attacker must','Stay between','go around you']},
];
import timingJson from '../../../public/plays/narration/tchouameni-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('tchouameni: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('tchouameni: no cue '+w);return c.at;};
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
const dir2=(a:V3,b:V3):[number,number]=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line England defend is x = 0 (France attack +x), goal centre z = 0, +z = France's right (the main-stand side). */
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

// ---------------------------------------------------------------- Al Bayt at night: a red-seated bowl under a tent roof striped like sadu weaving (inferred look)
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+21*b,-40-25*b],
 (a,b)=>[7+23*b,1.3+19*b,lerp(-55,55,a)],
 (a,b)=>[lerp(12,-116,a),1.3+21*b,40+25*b],
 (a,b)=>[-111-23*b,1.3+19*b,lerp(55,-55,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=12,WALKS=[[.45],[.45],[.45],[.45]];
/** flags on the stand fronts: [stand, a, kind 0 = St George, 1 = France tricolore] */
const FLAGS:[number,number,number][]=[[0,.44,1],[0,.56,0],[0,.68,1],[0,.8,1],[1,.2,0],[1,.4,0],[1,.62,1],[1,.82,0],[2,.14,1],[2,.3,0],[3,.3,1],[3,.64,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // night (kick-off 22:00): a deep navy sky through the roof opening
 s.field(K,.42,.55);s.field(B,.3,.5);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),sadu=[new Path2D(),new Path2D()],edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  // the tent roof: a canopy leaning in over the stand, woven stripes along it
  const T=(a:number,h:number):V3=>add3(S(a,1),[0,1.2+h*9,0]);
  addPoly(roof,polyP(c,[T(0,0),T(1,0),T(1,1),T(0,1)]));
  for(let k=0;k<3;k++){const h0=.14+k*.3,h1=h0+.1;addPoly(sadu[k%2],polyP(c,[T(0,h0),T(1,h0),T(1,h1),T(0,h1)]));}
  seg3(c,T(0,0),T(1,0),.5,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.28);s.knockout(walk,.85);
 // the crowd: France navy, red and white; England white and red; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.05))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.56?0:h<.78?1:h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(K,inks[2],.95);s.fill(Y,inks[3],.85);
 // the tent roof: pale canvas, red and navy woven bands, a navy lip
 s.knockout(roof);s.tone(Y,roof,.12);s.fill(R,sadu[0],.8);s.fill(K,sadu[1],.75);s.fill(K,edge,.9);
 // flags: St George (paper, red cross) and the tricolore (navy | paper | red)
 const fl=new Path2D(),cr=new Path2D(),fb=new Path2D(),fw=new Path2D(),fr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
  else{addPoly(fb,polyP(c,[P(0,.005),P(.34,.005),P(.34,.075),P(0,.075)]));addPoly(fw,polyP(c,[P(.33,.005),P(.67,.005),P(.67,.075),P(.33,.075)]));addPoly(fr,polyP(c,[P(.66,.005),P(1,.005),P(1,.075),P(.66,.075)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(fb);s.fill(K,fb,.95);s.knockout(fw);s.knockout(fr);s.fill(R,fr,.95);
 // floodlight strips under the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,1),[0,1.6,0]),b=add3(S(u+.03,1),[0,1.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the training pitch for the demonstration: an evening sky, a line of trees, no crowd */
function trainingGround(s:Sheet,c:Cam){
 s.field(B,.32,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-300],[1e4,hz[1]-300],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);}
 // a tree line all round, far away
 const tr=new Path2D();const ring=(a:number):V3=>[-50+Math.cos(a)*120,0,Math.sin(a)*95];
 for(let i=0;i<72;i++){const a0=i/72*TAU,a1=(i+1)/72*TAU,h0=9+5*hash(i,3),h1=9+5*hash(i+1,3);addPoly(tr,polyP(c,[ring(a0),ring(a1),add3(ring(a1),[0,h1,0]),add3(ring(a0),[0,h0,0])]));}
 s.knockout(tr);s.fill(K,tr,.55);s.tone(B,tr,.4);
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;boards?:boolean}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 if(o.boards!==false){// advertising boards: navy with red panels (inferred)
  const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
  board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
  for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
  for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
  s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.8);}
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
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out LOW where the shot went in (bottom left, z ≈ −3.1) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-3.1,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.4,2)),back=(z:number,y=0)=>X+2+bw(z)*.7*(1-y/2.4),top=()=>1.9;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),top(),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),top(),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),top(),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),top(),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),top(),z],.022,mesh,.7);seg3(c,[back(z,1.9),top(),z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],1.9*f),top()*f,zs[i]],[back(zs[i+1],1.9*f),top()*f,zs[i+1]],.022,mesh,.7);seg3(c,[X,H*f,z0],[back(z0,1.9*f),top()*f,z0],.022,mesh,.7);seg3(c,[X,H*f,z1],[back(z1,1.9*f),top()*f,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[R,.5],[K,.4],[Y,.2]],SKIN_M:InkFill[]=[[R,.42],[Y,.3],[K,.18]];
/** France home, this match (Wikipedia kit template): dark navy shirts, white shorts, red socks */
const france=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:'paper',socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** England home, this match: white shirts, navy shorts, white socks */
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:K,hairStyle:'short',...o});
const TCH_B={height:1.87,bulk:1.03};
const TCH_ST=france({number:8,skin:SKIN_D,hair:K,build:TCH_B,seed:8});
const GRIEZ_ST=france({number:7,hair:[K,.7],build:{height:1.76,bulk:.95},seed:7});
const DEMB_ST=france({number:11,skin:SKIN_D,build:{height:1.78,bulk:.95},seed:11});
const MBAP_ST=france({number:10,skin:SKIN_D,hairStyle:'bald',build:{height:1.78},seed:10});
const PICK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[R,.45],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.85,bulk:1},seed:1};

// ---------------------------------------------------------------- the move on one clock τ (seconds; τ = 0 is Tchouaméni's contact)
/** Mbappé carries on the left and switches it (lofted) to Dembélé wide right; Dembélé cuts in and passes to Griezmann; Griezmann lays it back
 * first time to Tchouaméni ≈ 23 m out; the low diagonal shot into the bottom left corner. Every spot inferred (see the header). */
const MB0:V3=[-38,.11,-12.5],MB1:V3=[-31.5,.11,-9.4],T_MB=-6.2;
const D_REC:V3=[-23.4,.11,21],T_DR=-4.4;
const D_PASS:V3=[-19.8,.11,16.9],T_DE=-2.3;
const G_REC:V3=[-17.4,.11,9.3],T_GR=-1.35;
const M:V3=[-22.8,.11,4.4];
/** the shot: a skidding daisycutter, diagonal, into the bottom LEFT corner (from the shooter; Pickford's right) */
const GOAL_PT:V3=[0,.2,-3.1],T_SHOT=.95,NET_HIT:V3=[1.75,.2,-3.25],REST:V3=[1.5,.11,-2.9],T_NET=T_SHOT+.1;
const SHOT_DIR=dir2(M,GOAL_PT);
function shotAt(u:number):V3{const e=u*(1.1-.1*u);return[lerp(M[0],GOAL_PT[0],e),lerp(M[1],GOAL_PT[1],e)+.2*Math.sin(Math.PI*e)*(1-e*.6)+.06*Math.abs(Math.sin(Math.PI*e*3)),lerp(M[2],GOAL_PT[2],e)];}
const roll=(a:V3,b:V3,u:number):V3=>mix3(a,b,u*(1.3-.3*u));
/** a carried ball: forward along a→b with small touch pulses */
const carry=(a:V3,b:V3,u:number):V3=>mix3(a,b,clamp(u+.018*Math.sin(TAU*4*u)));
function ballAt(tau:number):V3{
 if(tau<T_MB)return carry(MB0,MB1,clamp((tau+9.5)/(T_MB+9.5)));
 if(tau<T_DR){const u=(tau-T_MB)/(T_DR-T_MB),p=mix3(MB1,D_REC,u);return[p[0],.11+7.5*u*(1-u),p[2]];}
 if(tau<T_DE)return carry(D_REC,D_PASS,(tau-T_DR)/(T_DE-T_DR));
 if(tau<T_GR)return roll(D_PASS,G_REC,(tau-T_DE)/(T_GR-T_DE));
 if(tau<0)return roll(G_REC,M,(tau-T_GR)/-T_GR);
 if(tau<T_SHOT)return shotAt(tau/T_SHOT);
 if(tau<T_NET)return mix3(shotAt(1),NET_HIT,easeOut((tau-T_SHOT)/(T_NET-T_SHOT)));
 const u=clamp((tau-T_NET)/.6);return[lerp(NET_HIT[0],REST[0],easeOut(u)),.11+.09*(1-u),lerp(NET_HIT[2],REST[2],easeOut(u))];
}
const spinAt=(tau:number)=>TAU*(1.6*tau+6*clamp(tau/T_NET)+(tau>0?4*Math.min(tau,T_NET):0));
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
const T_MIN=-12,T_MAX=12,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** pelvis spot so the kicking boot meets the ball's back at `at` when striking along `d` (solved once through the skeleton) */
function plantFor(at:V3,d:[number,number],build:AthleteStyle['build'],power:number):[number,number]{
 const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power}),build,{x:0,z:0,yaw:yawTo(0,0,d[0],d[1])});const tx=at[0]-d[0]*.13,tz=at[2]-d[1]*.13;return[tx-sk.rToe[0],tz-sk.rToe[2]];}

// ---------------------------------------------------------------- Tchouaméni: supports the move, arrives on the lay-off, strikes first time (right foot, inferred), wheels away
const SD=.9,ST0=-STRIKE_CONTACT*SD,ST1=(1-STRIKE_CONTACT)*SD;
const YAW_T=yawTo(0,0,SHOT_DIR[0],SHOT_DIR[1]);
const PT=plantFor(M,SHOT_DIR,TCH_B,1);
const TCH_PATH:Path=[[-12,-36.5,5.2],[-8,-34,6],[-4.4,-30.6,6.8],[-1.6,-28.2,6.9],[ST0,PT[0]-SHOT_DIR[0]*1.3,PT[1]-SHOT_DIR[1]*1.3+.3],[0,PT[0],PT[1]],[ST1,PT[0]+SHOT_DIR[0]*.55,PT[1]+SHOT_DIR[1]*.55]];
/** the celebration: he wheels away toward the France fans in the main-stand corner (route inferred) */
const CELEB_PATH:Path=[[ST1,PT[0]+SHOT_DIR[0]*.55,PT[1]+SHOT_DIR[1]*.55],[1.4,PT[0]+2.4,PT[1]+.2],[2.8,-17.2,9.5],[4.4,-15,15.5],[6,-13.8,20.5],[8,-13.4,22.4]];
const T_TAB=distTable(TCH_PATH),CELEB_TAB=distTable(CELEB_PATH);
const ARMS_UP=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-32,lean:-10,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
function tchPose(tau:number):Pose{
 if(tau<ST1){
  const sp=speedAt(TCH_PATH,tau),ph=distAt(T_TAB,tau)/CYCLE_M;let p=blendPose(stand(),runCycle(ph,{speed:clamp((sp-1)/5)}),sm(.5,2,sp));
  const u=STRIKE_CONTACT+tau/SD;if(u>0)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),sm(0,.14,u));
  return p;
 }
 const s=distAt(CELEB_TAB,tau),sp=speedAt(CELEB_PATH,tau);
 let p=blendPose(strike(1,{foot:'r',power:1}),celebrate(s/4.2,{kind:'run'}),sm(ST1,ST1+.45,tau));
 if(tau>4.6)p=blendPose(p,ARMS_UP,clamp(1-sp/3)*sm(4.6,5.8,tau));
 return p;
}
function tchPlace(tau:number):Place{
 if(tau<ST1){const[x,z]=pathAt(TCH_PATH,tau),sp=speedAt(TCH_PATH,tau),a=pathAt(TCH_PATH,tau+.08),b=ballAt(tau);
  const face=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1,3,sp));return{x,z,yaw:lerpAng(face,YAW_T,sm(ST0-.25,ST0+.1,tau))};}
 const[x,z]=pathAt(CELEB_PATH,tau),a=pathAt(CELEB_PATH,tau+.1),sp=speedAt(CELEB_PATH,tau);
 const run=yawTo(x,z,a[0],a[1]),toFans=yawTo(x,z,-14,45);
 return{x,z,yaw:lerpAng(lerpAng(YAW_T,run,sm(ST1,ST1+.5,tau)),toFans,clamp(1-sp/2.5)*sm(4.4,5.6,tau))};
}

// ---------------------------------------------------------------- everyone else
type Role='passer'|'keeper'|'eng'|'fra';
/** a passer: carries/receives, then strikes the pass at `tp` along `pd` (power pw); `carry` = [from, to] while he has it */
type Pass={tp:number;pd:[number,number];pw:number;carry?:[number,number]};
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;pass?:Pass};
const MB_D=dir2(MB1,D_REC),DE_D=dir2(D_PASS,G_REC),GR_D=dir2(G_REC,M),MB_C=dir2(MB0,MB1),DE_C=dir2(D_REC,D_PASS);
const PMB=plantFor(MB1,MB_D,MBAP_ST.build,.85),PDE=plantFor(D_PASS,DE_D,DEMB_ST.build,.55),PGR=plantFor(G_REC,GR_D,GRIEZ_ST.build,.45);
/** a carrier's pelvis ≈ .62 m behind a carried ball */
const behind=(tau:number,d:[number,number]):[number,number]=>{const b=ballAt(tau);return[b[0]-d[0]*.62,b[2]-d[1]*.62];};
const MBAP_PATH:Path=[[-12,MB0[0]-MB_C[0]*.62-2.2,MB0[2]-MB_C[1]*.62-1],[-9.5,...behind(-9.5,MB_C)],[-8,...behind(-8,MB_C)],[T_MB-.5,MB1[0]-MB_C[0]*.9,MB1[2]-MB_C[1]*.9],
 [T_MB,PMB[0],PMB[1]],[T_MB+1,PMB[0]+2.5,PMB[1]+.6],[-2,-19,-9.5],[.5,-12.5,-8.6],[3,-10.5,-7.4]];
const DEMB_PATH:Path=[[-12,-27.5,24.5],[T_MB,-25.6,23.4],[T_DR-.3,D_REC[0]-DE_C[0]*.7-.2,D_REC[2]-DE_C[1]*.7+.4],[T_DR+.4,...behind(T_DR+.4,DE_C)],[T_DE-.6,...behind(T_DE-.6,DE_C)],
 [T_DE,PDE[0],PDE[1]],[T_DE+.9,PDE[0]+1.6,PDE[1]-.4],[1,-13.6,15],[3,-12.4,14]];
const GRIEZ_PATH:Path=[[-12,-27,8],[-6,-23.5,8.2],[T_DE-.2,G_REC[0]-1,G_REC[2]+1.4],[T_GR,PGR[0],PGR[1]],[T_GR+.8,PGR[0]+1.2,PGR[1]-.9],[1,-12.8,6.2],[3,-11,5]];
const ACTORS:Actor[]=[
 {name:'Mbappe',role:'passer',st:MBAP_ST,path:MBAP_PATH,phase:.2,pass:{tp:T_MB,pd:MB_D,pw:.85,carry:[-12,T_MB]}},
 {name:'Dembele',role:'passer',st:DEMB_ST,path:DEMB_PATH,phase:.6,pass:{tp:T_DE,pd:DE_D,pw:.55,carry:[T_DR,T_DE]}},
 {name:'Griezmann',role:'passer',st:GRIEZ_ST,path:GRIEZ_PATH,phase:.4,pass:{tp:T_GR,pd:GR_D,pw:.45}},
 {name:'Giroud',role:'fra',st:france({number:9,hair:[K,.8],build:{height:1.93,bulk:1.05},seed:9}),path:[[-12,-24,-1],[-5,-15,-.5],[-1,-11.5,-1.8],[1,-10.5,-2.2],[3,-10,-1]],phase:.7},
 {name:'Rabiot',role:'fra',st:france({number:14,hairStyle:'long',hair:[K,.75],build:{height:1.88},seed:14}),path:[[-12,-40,-6],[-5,-32,-4],[0,-27.5,-2.5],[3,-24,-1]],phase:.1},
 {name:'Pickford',role:'keeper',st:PICK_ST,path:[[-12,-2.6,1.6],[-4,-2.4,2.2],[-1,-1.6,1.1],[0,-1.3,.8],[3,-1.3,.8]],phase:0},
 {name:'Maguire',role:'eng',st:england({number:6,hair:[K,.6],build:{height:1.94,bulk:1.1},seed:6}),path:[[-12,-18,-1],[-5,-12.5,0],[-1,-10.5,-.5],[1,-9.8,-.9],[3,-9.5,-1]],phase:.3},
 {name:'Stones',role:'eng',st:england({number:5,build:{height:1.88},seed:5}),path:[[-12,-19,-6],[-5,-13,-5.2],[-1,-11.5,-4],[1,-11,-3.6],[3,-10.6,-3.4]],phase:.8},
 {name:'Walker',role:'eng',st:england({number:2,skin:SKIN_D,hairStyle:'bald',build:{height:1.83},seed:2}),path:[[-12,-24,-14],[-5,-16,-11.5],[-1,-12.2,-9.8],[1,-11,-9],[3,-10,-8]],phase:.5},
 {name:'Shaw',role:'eng',st:england({number:3,build:{height:1.81,bulk:1.05},seed:3}),path:[[-12,-24,15],[T_DR,-19.5,17.5],[T_DE,-18,15.8],[0,-17,14],[3,-15,13]],phase:.15},
 {name:'Rice',role:'eng',st:england({number:4,hair:[K,.7],build:{height:1.85},seed:4}),path:[[-12,-27,4],[-5,-20,5.2],[T_GR,-16.2,7.6],[0,-17.6,6.6],[3,-17.5,6]],phase:.9},
 {name:'Henderson',role:'eng',st:england({number:8,hair:[Y,.5],build:{height:1.82},seed:18}),path:[[-12,-33,12],[-5,-27.5,11],[0,-24,9.4],[3,-21.5,8]],phase:.35},
 {name:'Bellingham',role:'eng',st:england({number:22,skin:SKIN_M,build:{height:1.86},seed:22}),path:[[-12,-40,-4],[-5,-33,-3],[0,-28,-2.2],[3,-25,-1.5]],phase:.55},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** Pickford: set, sees it late, dives down to his right (−z) — the ball is past his glove */
const K_DIVE=.42,KD=.95;
/** one actor's pose + place at τ (it = idle clock). France celebrate after the goal; England slump. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);yaw=yawTo(x,z,M[0],M[2]);
  if(tau>K_DIVE){const u=clamp((tau-K_DIVE)/KD);kp=blendPose(kp,keeperDive(u,{side:'r',height:.05}),sm(K_DIVE,K_DIVE+.1,tau));yaw=lerpAng(yaw,Math.PI,.5);}
  if(tau>3)kp=blendPose(kp,SLUMP,sm(3,3.8,tau)*.5);
  return{pose:kp,place:{x,z,yaw}};
 }
 if(a.role==='passer'&&a.pass){const P=a.pass;
  if(P.carry&&tau>P.carry[0]&&tau<P.tp-.35){p=blendPose(p,dribble(ph,{foot:'r',speed:clamp(sp/5)}),.6);yaw=lerpAng(heading,toBall,.3);}
  const us=STRIKE_CONTACT+(tau-P.tp)/.8;if(us>0&&us<1){const w=sm(0,.15,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot:'r',power:P.pw}),w);
   yaw=lerpAng(yaw,yawTo(0,0,P.pd[0],P.pd[1]),Math.max(w,sm(P.tp-.9,P.tp-.4,tau)*(1-sm(P.tp+.5,P.tp+.9,tau))));}
 }
 const fra=a.st.shirt===K;
 if(tau>T_NET+.3&&sp<1.4){if(fra)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.3,T_NET+.8,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.3,T_NET+1,tau)*.6);}
 else if(sp<1.4&&tau>T_MB)yaw=lerpAng(yaw,toBall,.8);
 if(tau>T_NET&&fra&&sp<1.4){const r=tchPlace(tau);yaw=lerpAng(yaw,yawTo(x,z,r.x??0,r.z??0),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the strike, the dive, the tackle). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBallAt(s:Sheet,c:Cam,P:V3,spin:number,o:{min?:number;from?:V3|null}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.from){const a=pr(c,o.from);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spin,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the match through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=tchPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=tchPose(tp),prev={pose:tchPose(tpPrev),place:tchPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(TCH_ST,d,true),pl,prev,!!e.smear&&tp>-.8&&tp<2.5);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='passer'||a.role==='keeper'),cur.place,prev,!!e.smear&&((a.pass&&tp>a.pass.tp-.4&&tp<a.pass.tp+.4)||(a.role==='keeper'&&tp>K_DIVE&&tp<K_DIVE+.9)));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBallAt(s,c,ballAt(tau),spinAt(tau),{min:e.minBall,from:e.lines&&e.prevT!==undefined&&tau>T_MB&&tau<T_NET?ballAt(e.prevT):null});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<6;i++){const p=ballAt(tau-i*.12);x+=p[0];y+=p[1];z+=p[2];}return[x/6,Math.min(1.6,y/6)*.5+.6,z/6];}
const txz=(tau:number):V3=>{const p=tchPlace(tau);return[p.x??0,0,p.z??0];};
/** a ring on the grass (radius rm metres) around a ground point */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,cov=.95,dashed=false){if(u<=.02)return;const pts:Pt[]=[];const r=rm*(.75+.25*u);
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[P[0]+Math.cos(a)*r,.02,P[2]+Math.sin(a)*r]);if(q)pts.push(q);}if(pts.length<20)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<10;i++)gaps.push([(i+.55)/10,(i+.95)/10]);
 const w=Math.max(4,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,cov*u);}
function trail(s:Sheet,c:Cam,pts:Pt[],w:number,ink:string,fade:number,taper=.8){if(pts.length<3||fade<=.02)return;s.knockout(ribbon(pts,w*1.5,{taper,pressure:.2,wobble:0}),.45*fade);s.fill(ink,ribbon(pts,w,{taper,pressure:.2,wobble:0}),.9*fade);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** real time; the strike lands on "Shot" */
const tS1=()=>CUE(0,'Shot')-.05;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-26,17,72];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(tau1(0)),[5,0,6]),fov:19})],
  [CUE(0,'France play')-.4,1.6,()=>({P:P1,T:add3(panTarget(tau),[4,0,4]),fov:16})],
  [CUE(0,'France break')-.3,1.2,()=>({P:P1,T:add3(panTarget(tau),[2.5,0,1]),fov:14})],
  [tS1()-1.2,1,()=>({P:P1,T:mix3(M,[-6,1.2,-1],.45),fov:12.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(txz(tau),[0,1,0]),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(txz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low camera behind him: 25 yards, low and hard
const tau2=(t:number)=>key(t,mono([[0,-1.9],[CUE(1,'From twenty'),-1],[CUE(1,'hits it low')-.1,-.03],[CUE(1,'hits it low')+.5,.1],[CUE(1,'across the grass')+.2,.55],[SECS(1),.85]]),linear);
const E2:V3=[-32.5,1.25,6.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=add3(txz(tau),[0,1,0]),bl=ballAt(Math.min(Math.max(tau,-2),T_SHOT));
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(b,G_REC,.45),fov:30})],
  [CUE(1,'From twenty')-.3,1.1,()=>({P:add3(E2,[2.5,0,-2]),T:mix3(b,[-4,.8,-1],.28),fov:30})],
  [CUE(1,'hits it low')+.2,.9,()=>({P:add3(E2,[3,.1,-2.6]),T:mix3([-8,.5,-1.5],bl,.5),fov:36})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tF=CUE(1,'From twenty');
  stadium(s,c,t,[0,1]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // "From twenty-five yards": a dashed ring round the ball's spot outside the box (replay telestration)
  const fy=sm(tF-.1,tF+.4,t,easeOutBack)*(1-sm(tF+1.6,tF+2.2,t));groundRing(s,c,M,.9,fy,Y,11,.95,true);
  // the shot's path so far: a yellow replay trail skimming the grass
  if(tau>0){const pts=pathPts(c,0,Math.min(tau,T_SHOT),18);trail(s,c,pts,Math.max(7,kAt(c,ballAt(Math.min(tau,T_SHOT)))*.14),Y,1-sm(T_NET,T_NET+.6,tau),.9);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:44});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:4.5,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal, a long lens: Pickford sees it late; then live
const tau3=(t:number)=>{const p=CUE(2,'Pickford sees'),d=CUE(2,'He dives'),l=CUE(2,'too late'),f=CUE(2,'France lead');
 return key(t,mono([[0,.02],[p+.3,.22],[d,K_DIVE+.02],[l,T_NET+.05],[f,T_NET+.5],[SECS(2),T_NET+.5+(SECS(2)-f)]]),linear);};
const E3:V3=[6.5,1.55,-5.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(Math.max(tau,0),T_SHOT));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-1.5,.9,.2],b,.35),fov:24})],
  [CUE(2,'He dives')-.1,.6,()=>({P:E3,T:[-1.2,.7,-1.4],fov:26})],
  [CUE(2,'France lead')-.2,1.4,()=>({P:add3(E3,[.5,1.8,2]),T:add3(txz(tau),[0,1.1,0]),fov:9})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tO=CUE(2,'France lead');
  stadium(s,c,t,[3,0,2],{roar:sm(tO-.3,tO+.3,t),flash:sm(tO-.2,tO+.2,t)*.8});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>0&&tau<T_NET+.8){const pts=pathPts(c,0,Math.min(tau,T_SHOT),16);trail(s,c,pts,Math.max(8,kAt(c,ballAt(Math.min(tau,T_SHOT)))*.15),Y,1-sm(T_NET,T_NET+.8,tau),.9);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:48});
  // in: a spark where the ball hits the net low in the corner
  const hit=sm(T_NET-.03,T_NET+.05,tau)*(1-sm(T_NET+.15,T_NET+.4,tau));if(hit>0){const q=pr(c,NET_HIT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,NET_HIT)*.6)*hit,{n:9,seed:23,width:Math.max(6,kAt(c,NET_HIT)*.04)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(txz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · "How he does it": a DEMONSTRATION on a training pitch (not match footage)
/** demo clock u (s). The attacker (red bib) dribbles at goal from the centre, then veers right to find a way round; Tchouaméni (blue
 * training top) shuffles so he is always on the line from the ball to the middle of his goal, in front of two centre-backs; forced wide,
 * the attacker runs out of room and he steps in and wins it. */
const U_TACKLE=7.1;
const ATT_PATH:Path=[[0,-41,2.2],[1.6,-37,2.8],[3.2,-32.6,5.2],[4.8,-29.4,9.4],[6.3,-27,13],[7.3,-26,14.6],[9,-26.4,15.6]];
const ATT_TAB=distTable(ATT_PATH);
const DEMO_T:AthleteStyle={shirt:B,shorts:K,socks:K,boots:K,skin:SKIN_D,hair:K,line:K,trim:'paper',hairStyle:'short',build:TCH_B,seed:8};
const DEMO_CB=(seed:number):AthleteStyle=>({...DEMO_T,skin:seed%2?SKIN_L:SKIN_M,build:{height:1.88},seed});
const DEMO_A:AthleteStyle={shirt:R,shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:'paper',hairStyle:'short',build:{height:1.78},seed:31};
const DEMO_GK:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.88},seed:41};
function attPlace(u:number):Place{const[x,z]=pathAt(ATT_PATH,u),a=pathAt(ATT_PATH,u+.1);return{x,z,yaw:yawTo(x,z,a[0],a[1])};}
function demoBall(u:number):V3{
 const bu=Math.min(u,U_TACKLE),[x,z]=pathAt(ATT_PATH,bu),a=pathAt(ATT_PATH,bu+.1),d=dir2([x,0,z],[a[0],0,a[1]]),ph=distAt(ATT_TAB,bu)/1.6;
 const lead=.62+.25*Math.max(0,Math.sin(TAU*ph)),b:V3=[x+d[0]*lead,.11,z+d[1]*lead];
 if(u<=U_TACKLE)return b;
 // poked away by the tackle, rolling back up the pitch
 const k=clamp((u-U_TACKLE)/1.4);return[b[0]-6*easeOut(k),.11,b[2]-2.2*easeOut(k)];
}
/** Tchouaméni's spot: on the line from the ball to the middle of the goal, ≈ 22 m out; near the end he steps out to meet it */
function tchDemoXZ(u:number):[number,number]{
 const b=demoBall(Math.min(u,U_TACKLE)),L=Math.hypot(b[0],b[2]),r=Math.min(lerp(22,L-1.15,sm(5.6,U_TACKLE,u)),L-1.15);return[b[0]/L*r,b[2]/L*r];
}
const TD_SAMPLES:Path=(()=>{const o:Path=[];for(let u=-1;u<=12;u+=.25){const p=tchDemoXZ(u);o.push([u,p[0],p[1]]);}return o;})();
const TD_TAB=distTable(TD_SAMPLES);
function demoTch(u:number):{pose:Pose;place:Place}{
 const[x,z]=tchDemoXZ(u),b=demoBall(Math.min(u,U_TACKLE)),sp=speedAt(TD_SAMPLES,u),face=yawTo(x,z,b[0],b[2]);
 const ph=distAt(TD_TAB,u)/1.3;let p=blendPose(READY,backpedal(ph),sm(.3,1.2,sp));
 const lu=clamp((u-(U_TACKLE-.6*.8))/.8);if(lu>0)p=blendPose(p,lunge(lu,{side:'r'}),sm(0,.1,lu)*(1-sm(.9,1,lu)*.4));
 return{pose:p,place:{x,z,yaw:face}};
}
function demoAtt(u:number):{pose:Pose;place:Place}{
 const pl=attPlace(u),sp=speedAt(ATT_PATH,u),ph=distAt(ATT_TAB,u)/1.6;
 let p=blendPose(stand(),dribble(ph,{foot:'r',speed:clamp(sp/5)}),sm(.3,1.2,sp));
 if(u>U_TACKLE)p=blendPose(p,SLUMP,sm(U_TACKLE+.2,U_TACKLE+1,u)*.45);
 return{pose:p,place:pl};
}
function demoCB(u:number,side:number,it:number):{pose:Pose;place:Place}{
 const b=demoBall(Math.min(u,U_TACKLE)),x=-13.5+.15*(b[0]+30),z=side*4.6+b[2]*.25;
 return{pose:blendPose(READY,stand(),.4+.2*Math.sin(it*2+side)),place:{x,z,yaw:yawTo(x,z,b[0],b[2])}};
}
const tau4=(t:number)=>{const w=CUE(3,'Watch how'),sh=CUE(3,'shuffles across'),al=CUE(3,'always between'),am=CUE(3,'attacker must'),st=CUE(3,'Stay between');
 return key(t,mono([[0,0],[w,.1],[sh,2.4],[al,3.9],[am,5.4],[st,U_TACKLE-.25],[st+1.2,U_TACKLE+.7],[SECS(3),U_TACKLE+1.4]]),linear);};
function cam4v(t:number):Cam{
 const u=tau4(t),T=demoTch(u).place,TP:V3=[T.x??0,0,T.z??0],b=demoBall(u),mid:V3=[lerp(TP[0],b[0],.4),.7,lerp(TP[2],b[2],.4)];
 return plan(t,[
  [0,0,()=>({P:add3(TP,[-9,3.2,-4.5]),T:add3(TP,[4.5,.8,.5]),fov:36})],
  [CUE(3,'Watch how')-.2,1.6,()=>({P:add3(mid,[13,6.5,-10]),T:add3(mid,[-.5,0,.5]),fov:34})],
  [CUE(3,'Stay between')-.3,1.2,()=>({P:add3(mid,[9,4.5,-8]),T:mid,fov:34})],
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
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),u=tau4(t),tt=twos(t),up=tau4(tt),upp=tau4(tt-1/12);
  const tU=CUE(3,'Usually'),tS=CUE(3,'shuffles across'),tA=CUE(3,'always between'),tM=CUE(3,'attacker must'),tY=CUE(3,'Stay between');
  trainingGround(s,c);
  ground(s,c,{boards:false});
  const T=demoTch(up),Tp=T.place,TP:V3=[Tp.x??0,0,Tp.z??0],b=demoBall(u);
  // "France's shield": a ring round him, in front of his two centre-backs
  const ring=sm(tU-.1,tU+.4,t,easeOutBack);groundRing(s,c,TP,1.3,ring*(1-.5*sm(tA,tA+.5,t)),Y,11);
  // "shuffles across": his steps traced on the grass
  const sf=sm(tS-.1,tS+.5,t);if(sf>.02){const pts:Pt[]=[];for(let i=0;i<=20;i++){const uu=lerp(.2,Math.min(up,U_TACKLE),i/20),p=tchDemoXZ(uu),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}trail(s,c,pts,Math.max(6,kAt(c,TP)*.16),Y,sf*.9);}
  // "always between the ball and his goal": the dashed line from the ball to the middle of the goal runs through him; a shield arc faces the ball
  const bt=sm(tA-.1,tA+.4,t);if(bt>.02&&u<U_TACKLE+.2){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,[lerp(b[0],0,i/16*bt),.03,lerp(b[2],0,i/16*bt)]);if(q)pts.push(q);}
   const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.6)/12,(i+.95)/12]);if(pts.length>2){const w=Math.max(5,kAt(c,TP)*.09);s.knockout(ribbon(pts,w*1.5,{taper:0,wobble:0,gaps}),.5*bt);s.fill(R,ribbon(pts,w,{taper:0,wobble:0,gaps}),.95*bt);}
   const fa=Math.atan2(b[2]-TP[2],b[0]-TP[0]),arc:Pt[]=[];for(let i=0;i<=14;i++){const a=fa+(i/14-.5)*2.1,q=pr(c,[TP[0]+Math.cos(a)*1.7,.03,TP[2]+Math.sin(a)*1.7]);if(q)arc.push(q);}
   if(arc.length>2){const w=Math.max(8,kAt(c,TP)*.28);s.knockout(ribbon(arc,w*1.4,{taper:.5,wobble:0}),.6*bt);s.fill(Y,ribbon(arc,w,{taper:.5,wobble:0}),.95*bt);}}
  // "The attacker must go around him": a red arrow bending wide round him
  const am=sm(tM-.1,tM+.5,t)*(1-sm(tY+.6,tY+1.2,t));if(am>.02){const pts:V3[]=[];const u0=Math.min(u,6.2);for(let i=0;i<=10;i++){const p=pathAt(ATT_PATH,lerp(u0,u0+2.2*am,i/10));pts.push([p[0]+1.2*Math.sin(i/10*Math.PI),.05,p[1]+2.5*Math.sin(i/10*Math.PI)]);}
   arrow3(s,c,pts,Math.max(8,kAt(c,TP)*.12),R,.95);}
  // the figures, depth-sorted (two centre-backs, a keeper, the attacker, Tchouaméni)
  const items:{d:number;draw:()=>void}[]=[];const add=(f:{pose:Pose;place:Place},prev:{pose:Pose;place:Place},st:AthleteStyle,smear=false)=>{const q=toCam(c,[f.place.x??0,.9,f.place.z??0]);if(q[2]<1)return;items.push({d:q[2],draw:()=>drawPlayer(s,f.pose,c,st,f.place,prev,smear)});};
  add(T,demoTch(upp),DEMO_T,up>U_TACKLE-.6&&up<U_TACKLE+.6);add(demoAtt(up),demoAtt(upp),DEMO_A);
  add(demoCB(up,-1,tt),demoCB(upp,-1,tt-1/12),DEMO_CB(4));add(demoCB(up,1,tt),demoCB(upp,1,tt-1/12),DEMO_CB(5));
  {const b0=demoBall(up),gz=clamp(b0[2]*.1,-1.2,1.2),gk={pose:keeperSet(tt*1.3),place:{x:-1.2,z:gz,yaw:yawTo(-1.2,gz,b0[0],b0[2])}};add(gk,gk,DEMO_GK);}
  const bq=toCam(c,b);if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBallAt(s,c,b,u*9,{min:12});}});
  items.sort((a,z)=>z.d-a.d).forEach(i=>i.draw());
  // "Stay between": he steps in and wins it — a spark at the ball
  const hit=sm(U_TACKLE-.05,U_TACKLE+.05,u)*(1-sm(U_TACKLE+.2,U_TACKLE+.5,u));if(hit>0){const q=pr(c,demoBall(U_TACKLE));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,TP)*.5)*hit,{n:8,seed:41,width:6});}
 },
 still:8.5,
};

const film:RisoStory={
 id:'tchouameni-signature',format:'11v11',title:'Tchouaméni: the shield',
 theme:'The shield in front of the defence: stay between the ball and your goal so attackers have to go around you (plus his low, hard strike from 25 yards)',
 ageNote:'England 1–2 France, FIFA World Cup 2022 quarter-final, Al Bayt Stadium, 10 December 2022; the last chapter is a demonstration. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little shield — a yellow arc springs up and a red ball bounces off it. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  const arc:Pt[]=[];for(let i=0;i<=12;i++){const a=-Math.PI/2+(i/12-.5)*2*u;arc.push([x+Math.cos(a)*70,y+60+Math.sin(a)*70]);}
  if(arc.length>2)s.fill(Y,ribbon(arc,16,{seed,taper:.4,pressure:.3,wobble:1}),.95*fade);
  const k=age<=0?1:clamp(age/.6),bx=x+140-140*Math.min(1,k*2)+(k>.5?90*(k-.5)*2:0),by=y-40+(k>.5?-60*(k-.5)*2:0);
  if(age>.25&&age<.45)sparkBurst(s,Y,x,y-10,60,{n:7,seed,g:1-clamp((age-.25)/.2),width:8});
  footballPanels(s,bx,by,26,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
