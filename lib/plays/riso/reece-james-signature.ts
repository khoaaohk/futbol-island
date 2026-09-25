/** Reece James's SIGNATURE film, "the curling right-wing cross": his assist for Kai Havertz's header in Chelsea 1–1 Burnley, Premier
 * League, Stamford Bridge, London, Saturday 6 November 2021, 33rd minute. An iconic-play riso film (RisoStory, chapters mode) played by
 * the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not
 * reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the curling right-wing cross", template cross_assist, side right; lesson:
 * "Look up before you cross and aim for the space between the keeper and defenders"). This assist is a well-reported example of exactly
 * that trait from right wing-back: "James whipped in a cross for Havertz to score" (BBC), "the wing back curled in a delightful cross"
 * (Chelsea News), "Reece James floated a cross into the box on 33 minutes which Havertz headed into the net" (ESPN), and Transfermarkt
 * logs it as "Assist: Reece James, Cross". The BBC adds it was "the seventh Premier League goal that right-back James has been involved in
 * in six starts this season" — the cross was his weapon that autumn.
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in the build scratchpad films/src-cache/):
 *  - BBC Sport, Emlyn Begley, "Chelsea 1-1 Burnley: Matej Vydra salvages surprise point for Clarets" (6 Nov 2021)
 *    https://www.bbc.com/sport/football/59099961  (bbc-59099961.txt)
 *  - ESPN match commentary, gameId 605930 (goal line, assist, line-ups, formations)
 *    https://www.espn.com/soccer/commentary/_/gameId/605930  (espn-605930-commentary.html)
 *  - Chelsea News, "(Video): The perfect angle of Kai Havertz' header against Burnley" (Nov 2021)
 *    https://chelsea.news/2021/11/video-the-perfect-angle-of-kai-havertz-header-against-burnley/  (chelseanews-havertz-burnley-angle.html)
 *  - DuckDuckGo result summaries (ddg-reece-burnley-2021.html): ESPN report ("floated a cross … 33 minutes"), Transfermarkt ("Header …
 *    Assist: Reece James, Cross"), Chelsea News ("tons of space on the right wing … pick out Kai Havertz peeling off the defenders in the
 *    middle. His header flew past Nick Pope"), Sky Sports ("Chelsea are held to a 1-1 draw at Stamford Bridge").
 *  - Wikipedia, "Reece James" (right-back / wing-back, height 1.80 m, Chelsea academy)  (wiki-reece-james.txt)
 *  - Kit-shop / club-release summaries for Burnley's 2021–22 Umbro kits (ddg-burnley-away-kit-2021.html, ddg-burnley-third-kit-2021.html)
 * CONFIRMED: Chelsea 1–1 Burnley, 6 Nov 2021, Stamford Bridge, Premier League; Havertz 33' ("header from the centre of the box to the bottom
 * left corner. Assisted by Reece James with a cross" — ESPN), Vydra 79'; Chelsea were top of the table. The cross was whipped / curled /
 * floated in from the right, where James "has had tons of space on the right wing all day"; Havertz was "peeling off the defenders in the
 * middle" and "had timed his run to perfection"; the header beat Nick Pope. Line-ups (ESPN): Chelsea 3-4-1-2 — Mendy; Christensen 4,
 * Thiago Silva 6, Rüdiger 2; James 24, Jorginho 5, Kanté 7, Chilwell 21; Barkley 18; Havertz 29, Hudson-Odoi 20. Burnley 4-4-2 — Pope 1;
 * Lowton 2, Tarkowski 5, Mee 6, Taylor 3; Gudmundsson 7, Brownhill 8, Westwood 18, McNeil 11; Wood 9, Cornet 20. James 1.80 m.
 * INFERRED (illustrative reconstruction, never narrated as fact): every position, run and timing in metres and seconds; where James crossed
 * from (here ≈ 22 m from the goal line, 9 m in from the right touchline, after carrying it down the wing) and that it was his right foot
 * (his stronger foot; not stated in the reports); the cross's shape (≈ 1.35 s, curling away from the keeper); which Burnley player was
 * nearest Havertz (drawn as Tarkowski) and the other players' positions; Havertz's exact spot (≈ 7.6 m out, just right of centre) and
 * the low line into the corner (ESPN's "bottom left corner" is from the header's point of view, so the far post from the cross); Pope's
 * dive; the celebration; which end Chelsea attacked (the film: right to left from the main camera, so James's right wing is the far
 * side, crossed in front of the far stand); THE KITS — Chelsea in their royal-blue home shirts and shorts with white socks (home side; the 2021–22 home kit), Burnley in the
 * 2021–22 Umbro away kit (white with pale-blue pinstripes and claret trim — a navy third kit would clash with Chelsea blue, so the white
 * change strip is the plausible one; not verified), Pope in yellow (not verified), so the narration never names a kit colour; hair and
 * builds; the stadium's look (four close, roofed stands of blue seats, a full house, the Burnley fans in one block of the far end) and the
 * grey November afternoon light with the floodlights on; the camera positions.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main camera in REAL TIME, panning with the ball: James carries it down the
 * right wing and curls it in, Havertz heads it home; ch2 = the slow-motion replay from a LOW touchline camera behind James: the right-foot
 * whip, the curl traced in the air, the gap between the keeper and the defenders lit on the grass; ch3 = the second replay angle from
 * BEHIND THE GOAL, through the net: Havertz peels off his defender, times his jump, heads it into the bottom corner, then live for the
 * celebration; ch4 = the lesson: look up (a ring on James's eyes and a dashed sight line to the box), before you cross (the strike), aim
 * for the space (a yellow zone on the grass between the keeper and the back line), the keeper (ring), the defenders (a red line), your
 * team-mate (his run arrowed to the ball).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion, motionSmear on the cross, the jump and the header); small wide-shot figures and every figure inside a passage print at
 * `low` detail. Handedness: the world is right-handed (x toward the goal Burnley defend, y up, +z = Chelsea's right),
 * athlete.ts's own convention, so foot:'r' is the right foot. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming
 * swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
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
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/reece-james-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/reece-james-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). Every cue starts with a plain
 * word (Kokoro splits contractions and hyphenated words). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The cross, live',text:'Stamford Bridge, November 2021. Chelsea against Burnley. Reece James has space on the right wing. He curls a cross into the box... Kai Havertz heads it in!',tail:2.4,
  cues:['Stamford Bridge','Chelsea against Burnley','Reece James','right wing','curls a cross','Kai Havertz','heads it in']},
 {label:'The whip',text:'Watch it again. James whips it with his right foot, curling it into the gap between the keeper and the defenders.',tail:1.3,
  cues:['Watch it again','James whips it','right foot','curling it','the gap']},
 {label:'Timed to perfection',text:'Havertz peels off his defender, times his jump, and heads it into the bottom corner. Chelsea lead!',tail:1.9,
  cues:['Havertz peels off','times his jump','heads it','bottom corner','Chelsea lead']},
 {label:'The secret',text:'The secret? Look up before you cross. Then aim for the space between the keeper and the defenders, where your teammate can attack it.',tail:1.9,
  cues:['The secret','Look up','before you cross','aim for the space','between the keeper','the defenders','your teammate']},
];
import timingJson from '../../../public/plays/narration/reece-james-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('reece: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('reece: no cue '+w);return c.at;};
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
/** Pitch: the goal line Burnley defend is x = 0 (Chelsea attack +x), goal centre z = 0, +z = Chelsea's right (the far side from the main camera). */
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

// ---------------------------------------------------------------- Stamford Bridge: a grey November afternoon, four close roofed stands of blue seats, a full house
/** stand planes (a along, b up the rake 0..1): 0 the main-camera side (z<0), 1 behind this goal, 2 the tall stand behind James's
 * wing (z>0), 3 the far end. The stands sit close to the pitch. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,10,a),1.2+18*b,-39-19*b],
 (a,b)=>[5.5+17*b,1.2+16*b,lerp(-52,52,a)],
 (a,b)=>[lerp(10,-114,a),1.2+22*b,39+22*b],
 (a,b)=>[-110-17*b,1.2+16*b,lerp(52,-52,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=12,WALKS=[[.45],[.5],[.4],[.5]];
/** a full house; the Burnley fans sit in one block of the far end (inferred) */
const OCC=[.85,.85,.85,.85];
const AWAY=(si:number,a:number)=>si===3&&a>.62&&a<.9;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(B,.14,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(K,polyPath([[-1e4,hz[1]-1e4],[1e4,hz[1]-1e4],[1e4,hz[1]-200],[-1e4,hz[1]-200]],true),.1);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.7,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.82),[0,6,0]),add3(S(0,.82),[0,6,0])]));
  seg3(c,add3(S(0,.82),[0,5.8,0]),add3(S(1,.82),[0,5.8,0]),.4,edge);}
 s.knockout(planes);s.tone(B,planes,.62);s.tone(K,planes,.2);s.knockout(walk,.8);
 // the crowd: home fans in blue and white; the Burnley block in claret (red) and pale blue
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6),a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,away=AWAY(si,a);if(h>OCC[si])continue;
   const P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0&&!away?roar*z*1.1*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hh=hash(i*7+j*13+si,9),ink=away?(hh<.55?4:hh<.8?1:3):(hh<.5?2:hh<.75?0:3);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.tone(B,inks[1],.35);s.knockout(inks[1],.6);s.fill(B,inks[2],.95);s.fill(K,inks[3],.9);s.fill(R,inks[4],.9);
 s.knockout(roof);s.fill(K,roof,.88);s.knockout(edge,.8);
 // floodlight strips along the roof lip (on, on a grey afternoon)
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<5;k++){const u=(k+.5)/5,a=add3(S(u-.03,.82),[0,5.2,0]),b=add3(S(u+.03,.82),[0,5.2,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.8,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(16*flash);for(let i=0;i<n;i++){const r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[i%which.length],q=pr(c,STANDS[si](.1+.8*r2,.1+.6*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-114,0,-42],[10,0,-42],[10,0,42],[-114,0,42]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([4.5,0,-36.5],[4.5,0,36.5]);board([-108,0,-36.5],[4.5,0,-36.5]);board([-108,0,36.5],[4.5,0,36.5]);
 for(let k=0;k<12;k++){const z=-35+k*6;addPoly(pn,polyP(c,[[4.4,.25,z],[4.4,.25,z+3.2],[4.4,.66,z+3.2],[4.4,.66,z]]));}
 for(const zz of[-36.4,36.4])for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.3,.25,zz],[x+3.3,.66,zz],[x,.66,zz]]));}
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(B,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the header went in (z ≈ BZ) */
const BZ=-2.9;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-BZ)/1.5,2));
 const zs=[z0,BZ,-1,1,z1];
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** Chelsea: royal-blue home shirts and shorts, white socks, white numbers. Burnley: the white away kit with pale-blue pinstripes and
 * claret (red) trim (inferred, see the header); Pope in yellow (inferred). */
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const burnley=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.3],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:R,hairStyle:'short',...o});
/** Reece James: 1.80 m, a strong wing-back's frame, short dark hair */
const JAMES_B={height:1.8,bulk:1.06};
const JAMES_ST=chelsea({number:24,skin:SKIN_D,hair:K,build:JAMES_B,seed:24});
/** Kai Havertz: tall (about 1.9 m), light-brown hair */
const HAVERTZ_B={height:1.9,bulk:.94};
const HAVERTZ_ST=chelsea({number:29,skin:SKIN_L,hair:[R,.55],build:HAVERTZ_B,seed:29});
const TARKOWSKI_ST=burnley({number:5,hair:K,build:{height:1.85,bulk:1.04},seed:5});
const POPE_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[R,.5],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.91,bulk:1},seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is James's cross)
/** Havertz meets the cross at τ = TC with his forehead at H (x, z) — ≈ 7.6 m out, just right of centre (the centre of the box) */
const TC=1.35,TO=TC-.22,TL=TC+.36;
const H_XZ:[number,number]=[-7.6,.7];
/** the target: low into the bottom corner on Havertz's left (the far post from the cross) */
const GOAL_PT:V3=[0,.32,-2.9];
const J_BALL:V3=[-22,.11,25];
/** his body opens between the goal and the ball's arrival */
const YAW_H=lerpAng(yawTo(H_XZ[0],H_XZ[1],GOAL_PT[0],GOAL_PT[2]),yawTo(H_XZ[0],H_XZ[1],J_BALL[0],J_BALL[2]),.4);
/** Havertz's pelvis place at contact so his forehead is at H (solved once through the skeleton) and the contact height */
const [PR,HY]=(()=>{const sk=solve(header(.52),HAVERTZ_B,{x:0,z:0,yaw:YAW_H});const fh=mix3(sk.face,sk.head,.35);return[[H_XZ[0]-fh[0],H_XZ[1]-fh[2]] as [number,number],fh[1]+.06];})();
const H:V3=[H_XZ[0],HY,H_XZ[1]];
/** the cross: 1.35 s, whipped with the right instep; it bows toward goal and curls away from the keeper as it drops */
function crossAt(u:number):V3{const tt=u*TC,vy=(H[1]-J_BALL[1]+4.9*TC*TC)/TC,e=u*(1.1-.1*u);
 const bend=Math.sin(Math.PI*u);return[lerp(J_BALL[0],H[0],e)+bend*1.6,J_BALL[1]+vy*tt-4.9*tt*tt,lerp(J_BALL[2],H[2],e)+bend*.5];}
/** the header: down into the corner, .5 s to the line */
const T_HEAD=.5,T_GOAL=TC+T_HEAD,NET_HIT:V3=[1.6,.3,-3],REST:V3=[1.2,.11,-2.6],T_NET=T_GOAL+.1;
function headerAt(u:number):V3{const e=u*(1.08-.08*u);return[lerp(H[0],GOAL_PT[0],e),lerp(H[1],GOAL_PT[1],e)+.1*Math.sin(Math.PI*e),lerp(H[2],GOAL_PT[2],e)];}

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
const CYCLE_M=4;
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}

// ---------------------------------------------------------------- James: carries it down the right wing in space, looks up, the RIGHT-footed cross
const OSD=.95;
const JDIR:[number,number]=(()=>{const a=Math.atan2(H[2]-J_BALL[2],H[0]-J_BALL[0])+.3;return[Math.cos(a),Math.sin(a)];})();
const YAW_J=yawTo(0,0,JDIR[0],JDIR[1]);
/** James's pelvis at contact so the RIGHT boot meets the ball (solved once) */
const PJ:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),JAMES_B,{x:0,z:0,yaw:YAW_J});const tx=J_BALL[0]-JDIR[0]*.1,tz=J_BALL[2]-JDIR[1]*.1;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
const JAMES_PATH:Path=[[-12,-54,28],[-7,-43,27.6],[-3,-32.5,26.8],[-1.2,-27.4,26.2],[-.55,PJ[0]-JDIR[0]*1.6,PJ[1]-JDIR[1]*1.6],[0,PJ[0],PJ[1]],[.6,PJ[0]+JDIR[0]*1.1,PJ[1]+JDIR[1]*1.1],[2.4,-18.5,21],[6,-15,17.5],[8,-14,17]];
/** the ball at his feet while he carries it (touches every stride), then the set-up touch onto his right foot */
function carryAt(tau:number):V3{const[x,z]=pathAt(JAMES_PATH,tau),a=pathAt(JAMES_PATH,tau+.15),d=Math.hypot(a[0]-x,a[1]-z)||1,touch=.5+.35*Math.abs(Math.sin(tau*4.2));return[x+(a[0]-x)/d*touch,.11,z+(a[1]-z)/d*touch];}
function ballAt(tau:number):V3{
 if(tau<-.7)return carryAt(tau);
 if(tau<0)return mix3(carryAt(-.7),J_BALL,easeOut(clamp((tau+.7)/.65)));
 if(tau<TC)return crossAt(tau/TC);
 if(tau<T_GOAL)return headerAt((tau-TC)/T_HEAD);
 if(tau<T_NET)return mix3(headerAt(1),NET_HIT,easeOut((tau-T_GOAL)/(T_NET-T_GOAL)));
 const u=clamp((tau-T_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.08*Math.abs(Math.sin((tau-T_NET-.55)*9))*Math.exp(-(tau-T_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=-.7?TAU*1.2*tau:TAU*6*Math.min(tau,T_NET)+TAU*1.5*Math.max(0,tau-T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:Math.exp(-(tau-T_NET+.03)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));
/** "look up": James lifts his head to the box a beat before the cross */
const lookW=(tau:number)=>sm(-1.6,-1.2,tau)*(1-sm(-.45,-.2,tau));

// ---------------------------------------------------------------- Havertz: peels off his defender, times his run, springs, heads, celebrates
const RUN_FROM:[number,number]=[-11.6,-1.3];
const RUN_DIR=(()=>{const l=Math.hypot(PR[0]-RUN_FROM[0],PR[1]-RUN_FROM[1]);return[(PR[0]-RUN_FROM[0])/l,(PR[1]-RUN_FROM[1])/l] as [number,number];})();
const TAKE:[number,number]=[PR[0]-RUN_DIR[0]*.35,PR[1]-RUN_DIR[1]*.35],LAND:[number,number]=[PR[0]+RUN_DIR[0]*.4,PR[1]+RUN_DIR[1]*.3];
/** level with the back line, then he peels away (back and wide of Tarkowski) while James carries it, then attacks the space */
const HAV_PATH:Path=[[-12,-16,-1],[-6,-12.4,.2],[-3,-10.6,.9],[-1.6,-11.6,-.4],[-.3,-12.3,-1.5],[.35,RUN_FROM[0],RUN_FROM[1]],[TO,TAKE[0],TAKE[1]]];
/** the celebration: he wheels away toward the near corner */
const CELEB_PATH:Path=[[TL,LAND[0],LAND[1]],[TL+.5,-6.6,2.8],[TL+1.3,-7.4,8],[TL+2.4,-9.4,14.5],[TL+3.6,-11.8,20.5],[TL+4.6,-13,23]];
/** Tarkowski: tight to him at first, ball-watching as he peels off; a beat late to jump, and lower */
const TARK_PATH:Path=[[-12,-14.6,-.2],[-6,-11.4,.9],[-3,-9.8,1.5],[-1.6,-9.6,1.3],[-.3,-9.4,1.1],[.5,-9.2,1],[TC-.14,PR[0]+.3,PR[1]+1.1],[TC+.8,PR[0]+.8,PR[1]+1.3],[TC+3,PR[0]+1.1,PR[1]+1.4]];
const WAIT=posed({lHipF:22,rHipF:14,lKnee:30,rKnee:24,lean:12,pitch:4,neckP:-6,lShA:18,rShA:16,lShF:12,rShF:-6,lElb:48,rElb:40});
const ARMS_OUT=posed({lShA:112,rShA:108,lShF:14,rShF:18,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-30,lean:-8,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
function havPose(tau:number):Pose{
 if(tau<TO){
  const sp=speedAt(HAV_PATH,tau),ph=distAt(tabOf(HAV_PATH),tau)/CYCLE_M,run=runCycle(ph,{speed:clamp((sp-1.2)/5.4)});
  const p=blendPose(WAIT,run,sm(.6,2.2,sp));
  return blendPose(p,header(.22),sm(TO-.2,TO,tau));
 }
 if(tau<TL){const u=tau<TC?.22+.3*(tau-TO)/(TC-TO):.52+.48*(tau-TC)/(TL-TC);const p=header(u);
  // the neck snaps and drives the forehead down toward the far corner
  const snap=sm(TC-.1,TC+.05,tau)*(1-sm(TC+.18,TL,tau));p.neckY-=14*snap*Math.PI/180;p.neckP+=10*snap*Math.PI/180;return p;}
 const s=distAt(tabOf(CELEB_PATH),tau),sp=speedAt(CELEB_PATH,tau);
 let p=blendPose(header(1),celebrate(s/4.2,{kind:'run'}),sm(TL,TL+.35,tau));
 if(tau>TL+3.4)p=blendPose(p,ARMS_OUT,clamp(1-sp/3)*sm(TL+3.4,TL+4.2,tau));
 return p;
}
function havPlace(tau:number):Place{
 if(tau<TO){const[x,z]=pathAt(HAV_PATH,tau),sp=speedAt(HAV_PATH,tau),a=pathAt(HAV_PATH,tau+.08),b=ballAt(tau);
  // while he drifts back he keeps facing the ball (a backward-side drift), then turns into his run
  const face=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(2.5,4,sp)*sm(.2,.5,tau));return{x,z,yaw:lerpAng(face,YAW_H,sm(TO-.35,TO,tau))};}
 if(tau<TL){const u=(tau-TO)/(TL-TO),x=lerp(TAKE[0],LAND[0],u),z=lerp(TAKE[1],LAND[1],u);
  const w=1-Math.abs(tau-TC)/.25,px=lerp(x,PR[0],clamp(w)),pz=lerp(z,PR[1],clamp(w));return{x:px,z:pz,yaw:YAW_H};}
 const[x,z]=pathAt(CELEB_PATH,tau),a=pathAt(CELEB_PATH,tau+.1),sp=speedAt(CELEB_PATH,tau);
 const run=yawTo(x,z,a[0],a[1]),toFans=yawTo(x,z,-14,44);
 return{x,z,yaw:lerpAng(lerpAng(YAW_H,run,sm(TL,TL+.5,tau)),toFans,clamp(1-sp/2.5)*sm(TL+3,TL+4,tau))};
}

// ---------------------------------------------------------------- everyone else
type Role='run'|'tark'|'keeper'|'james'|'watch';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;
 /** a pass or cross: [contact τ, foot, power] */kick?:[number,'l'|'r',number]};
const ACTORS:Actor[]=[
 {name:'James',role:'james',st:JAMES_ST,path:JAMES_PATH,phase:.2,kick:[0,'r',.9]},
 {name:'Tarkowski',role:'tark',st:TARKOWSKI_ST,path:TARK_PATH,phase:.45},
 {name:'Pope',role:'keeper',st:POPE_ST,path:[[-12,-2.6,-.5],[-3,-2.1,1.6],[0,-1.7,2.4],[TC-.2,-1.7,.9],[TC+.6,-1.6,-.2]],phase:0},
 {name:'Taylor',role:'run',st:burnley({number:3,build:{height:1.75},seed:3}),path:[[-12,-44,21],[-7,-37,21.5],[-3,-30,22],[-.4,-26.4,22.6],[.8,-25.2,22.4],[4,-22,20]],phase:.6},
 {name:'McNeil',role:'run',st:burnley({number:11,hair:[R,.5],build:{height:1.83,bulk:.95},seed:11}),path:[[-12,-60,24],[-7,-50,23],[-3,-40,22],[0,-34,21],[3,-29,19.5]],phase:.3},
 {name:'Mee',role:'watch',st:burnley({number:6,build:{height:1.85},seed:6}),path:[[-12,-15,4.5],[-4,-11.2,4.3],[0,-9.6,3.8],[1.4,-8.8,3.2],[3,-8.4,3]],phase:.8},
 {name:'Lowton',role:'run',st:burnley({number:2,hair:[Y,.7],build:{height:1.8},seed:2}),path:[[-12,-18,-9],[-5,-13,-7.5],[0,-10.5,-6.4],[1.5,-9,-5.5],[3,-8.4,-5]],phase:.15},
 {name:'Hudson-Odoi',role:'run',st:chelsea({number:20,skin:SKIN_D,build:{height:1.77},seed:20}),path:[[-12,-24,-12],[-5,-17,-10],[0,-13.5,-8],[1.4,-8.4,-5.2],[3,-6.8,-4],[5,-7,-1]],phase:.55},
 {name:'Barkley',role:'run',st:chelsea({number:18,hair:[Y,.6],build:{height:1.85,bulk:1.03},seed:18}),path:[[-12,-30,5],[-5,-23,5.5],[0,-18.5,5],[2,-16.4,4],[4,-15,4]],phase:.7},
 {name:'Brownhill',role:'run',st:burnley({number:8,hair:[R,.5],build:{height:1.78},seed:8}),path:[[-12,-28,8],[-5,-22,7.5],[0,-17,6],[2,-15.2,5.2],[4,-14.4,5]],phase:.9},
 {name:'Chilwell',role:'run',st:chelsea({number:21,build:{height:1.78},seed:21}),path:[[-12,-36,-22],[-5,-27,-20],[0,-21,-17],[3,-16.5,-13]],phase:.1},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** one actor's pose + place at τ (it = idle clock). Chelsea celebrate after the goal; Burnley slump. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase;
 const br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.kick){const[t0,foot,power]=a.kick,us=STRIKE_CONTACT+(tau-t0)/OSD;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,YAW_J,w);}}
 if(a.role==='james'){
  // head up: he looks at the box (chin up, head turned toward the goal) before he whips it in
  const lw=lookW(tau);if(lw>0){p.neckP-=14*lw*Math.PI/180;p.neckY+=wrap(yawTo(x,z,H[0],H[2])-yaw)*.6*lw;}
  if(tau>T_NET+.2)p=blendPose(p,celebrate(it*.9,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);
  return{pose:p,place:{x,z,yaw}};
 }
 const chelseaKit=a.st.shirt!=='paper'&&a.role!=='keeper';
 if(a.role==='tark'){
  // ball-watching, a beat late to jump, and lower
  const t0=TC-.2;if(tau>t0-.2){const u=clamp(.22+.3*(tau-t0)/.3,0,1),hp=header(tau<t0?.22:u);hp.air*=.55;const w=sm(t0-.2,t0,tau)*(1-sm(TC+.55,TC+.9,tau));p=blendPose(p,hp,w);yaw=lerpAng(yaw,YAW_H+.5,w);}
  if(tau>TC+.8)p=blendPose(p,SLUMP,sm(TC+.8,TC+1.5,tau)*.7);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);
  // Pope shuffles across with the cross, then dives to his right as the header goes in low
  if(tau>TC+.05){const u=clamp((tau-TC-.05)/1.2);kp=blendPose(kp,keeperDive(u*.75,{side:'r',height:.15}),sm(TC+.05,TC+.2,tau)*(1-sm(TC+2.4,TC+3,tau)));}
  if(tau>TC+2.4)kp=blendPose(kp,SLUMP,sm(TC+2.4,TC+3,tau)*.6);
  return{pose:kp,place:{x,z,yaw:yawTo(x,z,tau<TC?ball[0]:H[0],tau<TC?ball[2]:H[2])}};
 }
 if(a.role==='watch'){p=blendPose(p,READY,.4);if(tau>TC+.7)p=blendPose(p,SLUMP,sm(TC+.7,TC+1.4,tau)*.7);return{pose:p,place:{x,z,yaw:toBall}};}
 if(tau>T_NET+.2&&sp<1.2){if(chelseaKit)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 if(tau>T_NET&&sp<1.2){const r=pathAt(CELEB_PATH,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the cross, the jump, the header). */
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
 {const pl=havPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=havPose(tp),prev={pose:havPose(tpPrev),place:havPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(HAVERTZ_ST,d,true),pl,prev,!!e.smear&&((tp>TO-.25&&tp<TL)||(tp>TL+.2&&tp<TL+3)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role!=='run'),cur.place,prev,!!e.smear&&((a.role==='james'&&tp>-.5&&tp<.5)||(a.role==='tark'&&tp>TC-.5&&tp<TC+.4)));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+2.5,Math.min(1.4,y/5)*.6+.6,z/5];}
const hxz=(tau:number):V3=>{const p=havPlace(tau);return[p.x??0,0,p.z??0];};
const jxz=(tau:number):V3=>{const p=pathAt(JAMES_PATH,tau);return[p[0],0,p[1]];};

// ---------------------------------------------------------------- 1 · live: the high main camera, real time, panning with the ball
/** real time; the header lands on "heads it in" */
const tS1=()=>CUE(0,'heads it in')+.1-TC;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-32,18,-50];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,0,14],fov:30})],
  [CUE(0,'Reece James')-.3,1.4,()=>({P:P1,T:add3(panTarget(tau),[3,0,-2]),fov:10.5})],
  [CUE(0,'curls a cross')-.4,1,()=>({P:P1,T:mix3(panTarget(tau),[-14,.8,10],.3),fov:11.5})],
  [tS1()+.2,1,()=>({P:P1,T:mix3(panTarget(tau),[-8,1.2,2],.5),fov:12})],
  [tS1()+TC-.3,.7,()=>({P:P1,T:[-5.5,1.3,.4],fov:9.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(hxz(tau),[0,1,0]),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[2,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:11.5,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera behind James: the whip, the curl, the gap
const tau2=(t:number)=>key(t,mono([[0,-2.4],[CUE(1,'James whips'),-.7],[CUE(1,'right foot')+.1,.02],[CUE(1,'curling it')+.2,.55],[CUE(1,'the gap')+.3,TC-.2],[SECS(1),TC+.1]]),linear);
/** the cross so far, traced in the air (a riso replay trail) */
function crossTrail(s:Sheet,c:Cam,tau:number,fade:number){
 if(tau<=.05||fade<=.02)return;const pts=pathPts(c,0,Math.min(tau,TC),18);if(pts.length<3)return;
 const w=Math.max(7,kAt(c,ballAt(Math.min(tau,TC)))*.12);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.4*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.85*fade);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** THE GAP: the space between the keeper's line and the back line, lit on the grass (x from the six-yard area out to the defenders) */
const GAP_X0=-2.8,GAP_X1=-9,GAP_Z0=-6.5,GAP_Z1=6.5;
function gapZone(s:Sheet,c:Cam,u:number,seed:number){
 if(u<=.02)return;const x1=lerp(GAP_X0,GAP_X1,easeOut(u)),q=polyP(c,[[GAP_X0,.02,GAP_Z0],[x1,.02,GAP_Z0],[x1,.02,GAP_Z1],[GAP_X0,.02,GAP_Z1]]);if(q.length<3)return;
 const p=polyPath(q,true);s.knockout(p,.35*u);s.tone(Y,p,.75*u);
 const edge=new Path2D();seg3(c,[x1,.02,GAP_Z0],[x1,.02,GAP_Z1],.2,edge);seg3(c,[GAP_X0,.02,GAP_Z0],[GAP_X0,.02,GAP_Z1],.2,edge);s.knockout(edge,.8*u);s.fill(Y,edge,.95*u);void seed;}
const E2:V3=[-33,1.6,34.5];
function cam2(t:number):Cam{
 const tau=tau2(t),j=add3(jxz(tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(j,[-12,1,4],.25),fov:30})],
  [CUE(1,'James whips')-.3,1,()=>({P:add3(E2,[1.5,-.2,-1.5]),T:add3(j,[1.5,-.1,-.8]),fov:20})],
  [CUE(1,'curling it')-.2,1.2,()=>({P:add3(E2,[4,.6,-3]),T:mix3(ballAt(Math.min(tau,TC)),[-7,1,1],.5),fov:24})],
  [CUE(1,'the gap')-.3,1,()=>({P:add3(E2,[6,1.6,-4]),T:[-6.5,.8,1],fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tR=CUE(1,'right foot'),tC=CUE(1,'curling it'),tG=CUE(1,'the gap');
  stadium(s,c,t,[1,0]);
  ground(s,c);
  // "the gap between the keeper and the defenders": the space lit on the grass
  gapZone(s,c,sm(tG-.15,tG+.6,t),21);
  // "curling it": the cross traced in the air
  crossTrail(s,c,tau,sm(tC-.3,tC+.3,t));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06)});
  // "right foot": a ring on the striking boot at contact
  const rf=sm(tR-.2,tR+.2,t,easeOutBack)*(1-sm(tR+.8,tR+1.3,t));if(rf>.02){const ja=actorAt(ACTORS[0],tp,tt),sk=solve(ja.pose,JAMES_B,ja.place);ring3(s,c,sk.rToe,.3,rf,R,11);}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal, through the net; then live for the celebration
const tau3=(t:number)=>{const a=CUE(2,'Havertz peels'),j=CUE(2,'times his'),h=CUE(2,'heads it'),g=CUE(2,'bottom corner'),o=CUE(2,'Chelsea lead');
 return key(t,mono([[0,-2.2],[a+.8,-.4],[j+.2,TO-.05],[h+.15,TC],[g+.2,T_NET],[o,T_NET+.4],[SECS(2),T_NET+.4+(SECS(2)-o)]]),linear);};
const E3:V3=[4.8,1.9,-4.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=add3(hxz(tau),[0,1.2,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(r,[-10,1.2,0],.3),fov:20})],
  [CUE(2,'times his')-.3,.8,()=>({P:E3,T:mix3(H,r,.4),fov:19})],
  [CUE(2,'heads it')-.1,.6,()=>({P:E3,T:[-3.4,1,-1],fov:25})],
  [CUE(2,'Chelsea lead')-.2,1.4,()=>({P:add3(E3,[.6,.5,2]),T:r,fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tP=CUE(2,'Havertz peels'),tO=CUE(2,'Chelsea lead');
  stadium(s,c,t,[3,2,0],{roar:sm(tO-.3,tO+.3,t),flash:sm(tO-.2,tO+.2,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "peels off his defender": his drift away from Tarkowski drawn on the grass (a yellow dashed trail)
  const pe=sm(tP-.1,tP+.5,t)*(1-sm(tO-1.2,tO-.6,t));
  if(pe>.02){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,add3(hxz(lerp(-3,Math.min(tp,TO),i/16)),[0,.03,0]));if(q)pts.push(q);}
   if(pts.length>3){const gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.55)/7,(i+.9)/7]);const w=Math.max(6,kAt(c,H)*.08),rb=ribbon(pts,w,{taper:.3,pressure:.2,wobble:.6,gaps});s.knockout(rb,.8*pe);s.fill(Y,rb,.95*pe);}}
  // the header's path so far: a yellow replay trail, forehead → net
  if(tau>TC&&tau<T_NET+.8){const pts=pathPts(c,TC,Math.min(tau,T_GOAL),16),fade=1-sm(T_NET,T_NET+.8,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_GOAL)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:60,lines:true,prevT:tau3(t-.06)});
  const hit=sm(TC-.02,TC+.05,tau)*(1-sm(TC+.12,TC+.3,tau));if(hit>0){const q=pr(c,H);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,H)*.5)*hit,{n:9,seed:23,width:Math.max(6,kAt(c,H)*.04)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(hxz(tau3(t)),[0,1.3,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: look up → before you cross → aim for the space → the keeper → the defenders → your team-mate
const tau4=(t:number)=>{const l=CUE(3,'Look up'),b=CUE(3,'before you'),a=CUE(3,'aim for'),k=CUE(3,'between the'),d=CUE(3,'the defenders'),y=CUE(3,'your teammate');
 return key(t,mono([[0,-2.2],[l,-1.5],[l+.9,-1.2],[b+.5,.05],[a,.45],[k+.3,.7],[d+.3,.85],[y,TC-.3],[SECS(3),T_GOAL+.05]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),j=add3(jxz(tau),[0,1.3,0]);
 return plan(t,[
  [0,0,()=>({P:[-31,1.8,32],T:add3(j,[1,.1,-.5]),fov:26})],
  [CUE(3,'aim for')-.3,1.2,()=>({P:[-23,6.5,15],T:[-6.5,.5,1],fov:32})],
  [CUE(3,'your teammate')-.2,1.2,()=>({P:[-19,4.5,12],T:[-6.5,1,0],fov:34})],
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
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tL=CUE(3,'Look up'),tB=CUE(3,'before you'),tA=CUE(3,'aim for'),tK=CUE(3,'between the'),tD=CUE(3,'the defenders'),tY=CUE(3,'your teammate');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 3 · aim for the space: the gap lit on the grass (under the players)
  gapZone(s,c,sm(tA-.1,tA+.7,t),41);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:48});
  const ja=actorAt(ACTORS[0],tp,tt),jk=solve(ja.pose,JAMES_B,ja.place);
  // 1 · look up: a yellow ring on his eyes and a dashed sight line to the box
  const lu=sm(tL-.1,tL+.35,t,easeOutBack)*(1-sm(tA-.3,tA+.2,t));
  if(lu>.02){ring3(s,c,jk.face,.22,lu,Y,31);const e=add3(jk.face,[0,.05,0]);arrow3(s,c,[e,mix3(e,[-7,1,1],.5*lu),mix3(e,[-7,1,1],.9*lu)],Math.max(7,kAt(c,e)*.05),Y,.95,true);}
  // 2 · before you cross: a red ring on the striking boot
  const bc=sm(tB-.05,tB+.3,t,easeOutBack)*(1-sm(tA-.2,tA+.3,t));if(bc>.02)ring3(s,c,jk.rToe,.3,bc,R,33);
  // 4 · between the keeper: a red ring round Pope
  const kp=sm(tK-.1,tK+.3,t,easeOutBack)*(1-sm(tY+.4,tY+.9,t));if(kp>.02){const pa=actorAt(ACTORS[2],tp,tt);ring3(s,c,[pa.place.x??0,1,pa.place.z??0],1,kp,R,35);}
  // 5 · and the defenders: a red line along the back line
  const dl=sm(tD-.1,tD+.4,t,easeOut)*(1-sm(tY+.4,tY+.9,t));if(dl>.02){const bar=new Path2D();seg3(c,[GAP_X1-.2,.03,-6.5],[GAP_X1-.2,.03,lerp(-6.5,6.5,dl)],.3,bar);s.knockout(bar);s.fill(R,bar,.95);}
  // 6 · your team-mate can attack it: Havertz's run arrowed into the space, the ball's line traced to meet him
  const tm=sm(tY-.1,tY+.5,t,easeOut);if(tm>.02){const a0=hxz(.35),a1:V3=[PR[0],.05,PR[1]];arrow3(s,c,[add3(a0,[0,.05,0]),mix3(add3(a0,[0,.05,0]),a1,.5*tm),mix3(add3(a0,[0,.05,0]),a1,tm)],Math.max(8,kAt(c,a1)*.1),R,.95);
   const pts=partial(pathPts(c,0,TC,20),tm);if(pts.length>2){const w=Math.max(7,kAt(c,H)*.08);s.knockout(ribbon(pts,w*1.5,{taper:.6,pressure:.2,wobble:0}),.4);s.fill(Y,ribbon(pts,w,{taper:.6,pressure:.2,wobble:0}),.9);}}
 },
 still:9,
};

const film:RisoStory={
 id:'reece-james-signature',format:'11v11',title:"Reece James's curling cross",
 theme:'Crossing from the right: look up before you cross and aim for the space between the keeper and the defenders',
 ageNote:'Chelsea 1–1 Burnley, Premier League, Stamford Bridge, London, 6 November 2021. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little cross — a yellow ball curls in from the right, meets a red forehead tick and is headed down. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=14;i++){const k=i/14*Math.min(1,u*1.6);pts.push([x+190-190*k,y-40-120*Math.sin(Math.PI*k*.85)+40*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const out=clamp(u*1.6-1);const e:Pt=out>0?[x-120*out,y+90*out]:pts[pts.length-1];
  if(age>0&&age<.35&&u>.55)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.35),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
