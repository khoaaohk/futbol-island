/** Alex Morgan's 123rd-minute winner — Canada 3–4 USA (after extra time), Olympic women's football semi-final, 6 August 2012,
 * Old Trafford, Manchester. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "Canada v United States (2012 Summer Olympics)" (raw wikitext; its match summary cites The Guardian live blog, the NYT
 *    "U.S. Women Win a Thriller on a Header", Caitlin Murray's "The National Team", the Globe and Mail oral history)
 *    https://en.wikipedia.org/wiki/Canada_v_United_States_(2012_Summer_Olympics)
 *  - Wikipedia, "Football at the 2012 Summer Olympics – Women's tournament – Knockout stage" (line-ups, shirt numbers, subs, kit template)
 *    https://en.wikipedia.org/wiki/Football_at_the_2012_Summer_Olympics_–_Women's_tournament_–_Knockout_stage
 *  - Wikipedia kit images Kit_body_usa12a.png / Kit_body_can12a.png (the patterns that template uses)
 *  - The Guardian, Graham Parker, "Olympic women's soccer 2012 – USA 4-3 Canada – as it happened" (6 Aug 2012)
 *    https://www.theguardian.com/sport/2012/aug/06/olympics-2012-football-usa-canada-live
 *  - The Guardian, Andy Hunter, "Alex Morgan's 123rd-minute header takes US through to final" (6 Aug 2012)
 *    https://www.theguardian.com/sport/2012/aug/06/london-2012-canada-usa-womens-football
 *  - The Globe and Mail, Cathal Kelly, "The greatest game of women's soccer ever played" (oral history, 12 June 2015)
 *    https://www.theglobeandmail.com/sports/soccer/an-oral-history-soccer/article24914992/
 * CONFIRMED by those accounts (and the brief): the semi-final, 6 August 2012, Old Trafford, 19:45 kick-off (a night finish), 26,630 in the
 * ground; 3–3 after Wambach's 80th-minute penalty; in the 123rd minute (Hunter: "122 minutes and 28 seconds"), on the verge of a shoot-out,
 * substitute Heather O'Reilly (9, on in the 101st minute) crossed and Morgan (13) "climbs high to head into the top right corner past a
 * despairing McLeod" (Parker), "headed … over the top of the despairing goalkeeper" (Hunter), "over McLeod's outstretched hand" (Globe);
 * the move: "Wambach passed it out to O'Reilly" (Globe editor's note); Canada's Lauren Sesselmann (10) "came out to defend Heather" and left
 * her player; Melissa Tancredi (14) "got back just enough to get my body on Abby" and "the ball felt just short, right in front of me, to
 * Alex Morgan"; the final whistle came seconds later; 4–3. Kits (the knockout-stage kit template): Canada all white with red trim,
 * the USA in navy shirts, shorts and socks (a darker navy sash, a red-and-white collar); Erin McLeod wore 18.
 * NOTE: Hunter's report credits "Christie Rampone's cross"; every other account (Parker's live blog, the Globe oral history with
 * Sesselmann's own memory, Wikipedia via Murray) and the brief say O'Reilly. The film follows O'Reilly.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds (the cross from ≈ 20 m out on the USA's
 * RIGHT — O'Reilly had come on and Heath moved central, and Parker has O'Reilly working the right in extra time, but the side of THIS cross
 * is not stated; ≈ 28 m of flight in ≈ 1.55 s, apex ≈ 4.4 m; Morgan meeting it ≈ 8 m out just left of centre and looping it up into the
 * top right corner in ≈ 0.95 s); O'Reilly crossing with her RIGHT foot; Morgan's drift and late dart; where every other player stood (the
 * other Canadians and Americans are drawn unnamed, with no numbers); McLeod's late back-pedalling leap with her left hand; the camera side
 * (drawn: the main camera on the O'Reilly side, the USA attacking left → right on screen); the white sleeves the template shows are not
 * drawn (athlete.ts prints one shirt ink); McLeod's kit colour (drawn yellow); hair; the celebration run; the night light, the red seats of
 * Old Trafford and its roof, the crowd colours and flags; the TV camera positions and lenses. The narration names none of the inferred details.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Wambach on the ball, her pass out wide,
 * O'Reilly's cross, Morgan's header over the keeper, the net, Morgan runs off); ch2 = the TV slow-motion REPLAY from a low camera by the
 * byline looking back at Morgan's face (her run into the box, the jump in front of the defenders, the forehead, the ball looping up over
 * McLeod's hand), with a replay trail on the cross; ch3 = a second REPLAY angle, high behind the goal: the header loops over the keeper into
 * the top corner, then live again for the celebration; ch4 = the lesson: a close, very slow replay with teaching marks (lit footprints of
 * her run into the box, a last-minute clock, a target ring in the top corner and the arrow of the header, the keeper's reach ring). Composed
 * on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to
 * square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for the ponytails and hems, motionSmear on the cross, the header, the keeper's leap). Women footballers: per-player builds
 * (height, slimmer bulk) and hair (ponytails; Wambach's short crop). Handedness: the world is right-handed (x toward Canada's goal, y up,
 * +z = the USA's right), exactly athlete.ts's convention, so O'Reilly's strike({foot:'r'}) is her RIGHT foot and the cross from the USA's
 * right comes from +z; header() is symmetric, and Morgan's redirect is a turn of the head and shoulders to her LEFT (toward the goal) with the
 * chin lifting to loop it up. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word
 * onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low', at most four big non-hero figures
 * print full, every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperTip,celebrate,header,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The last minute',text:"Old Trafford, 2012. The USA and Canada are tied, three-all, in the very last minute of extra time. Heather O'Reilly crosses... Alex Morgan heads it in! Four-three!",tail:2.2,
  cues:['Old Trafford','The USA and Canada','three-all','very last minute','Heather','crosses','Alex Morgan','heads it in','Four-three']},
 {label:'Watch it again',text:"Watch again, slowly. Morgan keeps running into the box. She jumps in front of the defenders and heads the ball up, over the keeper's hand.",tail:1.6,
  cues:['Watch again','keeps running','into the box','She jumps','in front of','heads the ball','over the keeper']},
 {label:'Behind the goal',text:"From behind the goal: she aims it high, into the top corner, where the keeper can't reach.",tail:2.3,
  cues:['From behind','aims it high','top corner','keeper can']},
 {label:'Never stop',text:"Keep running into the box until the very end! And aim your header where the keeper can't reach.",tail:1.9,
  cues:['Keep running','into the box','very end','aim your header','keeper can']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/morgan-canada-2012/timing.json, add
 *   import timingJson from '../../../public/plays/narration/morgan-canada-2012/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/morgan-canada-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('morgan: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('morgan: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Canada's goal line is x = 0 (the USA attack +x), goal centre z = 0, +z = the USA's right; touchlines z = ±34, halfway x = −52.5. */
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
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Old Trafford at night: a big closed bowl of red seats, three tiers, one roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind Canada's goal (+x), 2 the main stand (+z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-128,24,a),1.4+32*b,-(42+38*b)],
 (a,b)=>[9+34*b,1.4+29*b,lerp(66,-66,a)],
 (a,b)=>[lerp(24,-128,a),1.4+32*b,42+38*b],
 (a,b)=>[-114-34*b,1.4+29*b,lerp(-66,66,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.36,.68];
/** flags on the stand fronts: [stand, a, 0 = the Stars and Stripes | 1 = the Maple Leaf] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.42,1],[0,.56,0],[0,.7,1],[0,.83,0],[1,.22,1],[1,.4,0],[1,.62,0],[1,.8,1],[2,.26,0],[2,.44,1],[3,.35,0],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an August night in Manchester (the 123rd minute ≈ 10 pm): a navy sky, a floodlit blue haze low down
 s.field(K,.52,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  // the cantilever roof: a dark overhang over the top tier, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,13,0]),add3(S(0,.74),[0,13,0])]));
  seg3(c,add3(S(0,.74),[0,12.8,0]),add3(S(1,.74),[0,12.8,0]),.5,edge);}
 // (the tier fascias print with the roof lip, over the crowd: one knockout)
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,13,0]),add3(A(ai,.74),[0,13,0])]));}
 // Old Trafford's red seats, paper tier fascias
 s.knockout(planes);s.tone(R,planes,.66);s.tone(K,planes,.26);
 // the crowd: 26,630 in a big bowl, so plenty of empty red seats; seeded dots (white, Canada red, USA navy, a few yellow), sized by
 // distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,23);if(h<.4+.14*b)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.66?0:h<.8?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);tier.addPath(edge);s.knockout(tier,.8);
 // flags on the stand fronts: the Stars and Stripes (paper, red stripes, a navy canton) and the Maple Leaf (red bars, a red leaf)
 const fl=new Path2D(),stripe=new Path2D(),canton=new Path2D(),leaf=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){for(let k=0;k<3;k++){const b0=.005+(.075*(2*k+1))/7,b1=b0+.075/7;addPoly(stripe,polyP(c,[P(0,b0),P(1,b0),P(1,b1),P(0,b1)]));}addPoly(canton,polyP(c,[P(0,.045),P(.42,.045),P(.42,.08),P(0,.08)]));}
  else{addPoly(stripe,polyP(c,[P(0,.005),P(.25,.005),P(.25,.08),P(0,.08)]));addPoly(stripe,polyP(c,[P(.75,.005),P(1,.005),P(1,.08),P(.75,.08)]));
   addPoly(leaf,polyP(c,([[.5,.072],[.54,.06],[.58,.063],[.565,.05],[.61,.054],[.585,.04],[.6,.033],[.53,.035],[.52,.022],[.48,.022],[.47,.035],[.4,.033],[.415,.04],[.39,.054],[.435,.05],[.42,.063],[.46,.06]] as [number,number][]).map(([u,b])=>P(u,b))));}}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(K,canton,.95);s.fill(R,leaf,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.74),[0,12,0]),b=add3(S(u+.025,.74),[0,12,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: blue with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Canada's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz, at height by */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles) — women footballers
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** the USA's navy change kit (shirt, shorts, socks), red trim, paper numbers */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.82],shorts:[K,.88],socks:[K,.85],boots:K,skin:SKIN_L,hair:[K,.7],line:K,shade:[B,.35],trim:R,numberInk:'paper',hairStyle:'ponytail',build:{height:1.7,bulk:.88},...o});
/** Canada all in white, red trim and numbers */
const canada=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:R,hairStyle:'ponytail',build:{height:1.7,bulk:.9},...o});
const B_MOR:Build={height:1.7,bulk:.86,thighs:1.02},B_ORE:Build={height:1.65,bulk:.86},B_WAM:Build={height:1.8,bulk:.95,thighs:1.06},B_MCL:Build={height:1.75,bulk:.94},
 B_SES:Build={height:1.73,bulk:.92},B_TAN:Build={height:1.73,bulk:.96};
const MOR_ST=usa({number:13,hair:[K,.85],build:B_MOR,seed:13});
const ORE_ST=usa({number:9,hair:[R,.45],build:B_ORE,seed:9});
const WAM_ST=usa({number:14,hairStyle:'short',hair:[Y,.9],build:B_WAM,seed:14});
const MCL_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:18,numberInk:K,build:B_MCL,seed:18};
const SES_ST=canada({number:10,hair:[Y,.95],build:B_SES,seed:10});
const TAN_ST=canada({number:14,hair:[K,.85],build:B_TAN,seed:41});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is O'Reilly's cross)
const BALL_R=.11;
/** the cross flies TF s to Morgan's forehead; her looping header reaches the goal line TG */
const TF=1.55,TG=TF+.95,TPASS=-2.4,TRECV=-1.4;
/** Morgan's header spot (her pelvis) ≈ 8 m out, just left of centre, in front of Wambach and Tancredi at the far post; she opens up toward the
 * cross, the goal on her left */
const HP:[number,number]=[-8.4,-.2],YAW_M=yawTo(.55,.83);
/** Morgan's header pose: header() with a big spring ("climbs high") and the head + shoulders turning to her LEFT (toward the goal) through
 * contact, the chin lifting so the ball loops up and over the keeper */
function morHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.35;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.1,.42,sn)*w;p.twist+=lerp(-.05,.2,sn)*w;p.neckP-=.42*w;p.lean-=.12*w;return p;}
/** contact on the header clock: mid-flick, eyes open, forehead under the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** her forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(morHeader(CU),B_MOR,{x:HP[0],z:HP[1],yaw:YAW_M}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the cross point (ball on the grass) on the USA's right, ≈ 20 m out */
const P0:V3=[-20.4,BALL_R,24.6];
const DC=nrm2(HEAD_PT[0]-P0[0],HEAD_PT[2]-P0[2]),YAW_R=yawTo(DC[0],DC[1]);
/** where O'Reilly's pelvis stands at contact so her RIGHT boot meets the back of the ball (solved once, FK) */
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_ORE,{x:0,z:0,yaw:YAW_R});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** O'Reilly takes Wambach's pass here and knocks it forward into her stride */
const RECV:V3=[-22.6,BALL_R,24];
/** where the header crosses the goal line: the TOP RIGHT corner (+z, the USA's right), looping over McLeod */
const GOAL_PT:V3=[0,2.12,2.75],NET_HIT:V3=[1.5,1.6,2.95],REST:V3=[1.1,BALL_R,2.6];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CROSS=ballistic(P0,HEAD_PT,TF),V_HEAD=ballistic(HEAD_PT,GOAL_PT,TG-TF);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='mor'|'ore'|'wam'|'gk'|'close'|'mark'|'can'|'usa';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-9,T1=12,DT=.02;
const rp=(u:number):[number,number]=>[PCR[0]+DC[0]*u,PCR[1]+DC[1]*u];
/** after the goal the Americans chase Morgan toward the main-stand touchline */
const toMor=(x:number,z:number,k:number):number[][]=>[[TG+.6+k*.2,x,z],[TG+3.5+k*.3,lerp(x,-5.5,.6),lerp(z,15,.6)],[T1,lerp(x,-4,.8),lerp(z,22,.8)]];
const ACTORS:Actor[]=[
 {name:'Alex Morgan',role:'mor',hero:true,style:MOR_ST,keys:[[T0,-17.5,5.4],[-5,-15.6,4.4],[-2.5,-13.2,2.8],[0,-11.4,1.2],[.3,-10.5,.7],[TJ-.35,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.4,-7.6,2.6],[TF+3.6,-6,10],[TF+6.6,-4.2,19],[T1,-3,25]]},
 {name:"Heather O'Reilly",role:'ore',hero:true,style:ORE_ST,keys:[[T0,-31,27.5],[-4,-26.5,26.2],[TRECV,RECV[0]-.7,RECV[2]+.3],[-.55,...rp(-1.5)],[0,...rp(0)],[.7,...rp(.9)],[3,...rp(3.6)],[T1,-12,20]]},
 {name:'Abby Wambach',role:'wam',hero:true,style:WAM_ST,keys:[[T0,-27,9],[-5,-22.4,11.6],[TPASS,-19.6,13.2],[-1.2,-16.4,9.2],[0,-12.6,4.2],[.8,-9.3,-.8],[TF-.2,-7.1,-2.8],[TF,-6.7,-3.1],...toMor(-6.4,-2.8,0)]},
 {name:'Erin McLeod',role:'gk',hero:true,style:MCL_ST,keys:[[T0,-1.3,2.2],[-2,-1.5,2.5],[0,-1.7,1.7],[.9,-2,.7],[TF-.3,-2.3,.3],[TF,-2.3,.3],[T1,-1.5,.6]]},
 {name:'Lauren Sesselmann',role:'close',hero:true,style:SES_ST,keys:[[T0,-13.2,7.8],[-3,-12.6,6.4],[TRECV,-14.6,11.6],[0,-18.1,20.6],[.6,-18.5,21.1],[T1,-16.5,18.5]]},
 {name:'Melissa Tancredi',role:'mark',hero:true,style:TAN_ST,keys:[[T0,-20,6.2],[-3,-17.2,8],[0,-11.6,2.8],[.8,-8.8,-1.5],[TF-.2,-6.9,-2.3],[TF,-6.8,-2.4],[T1,-6.1,-1.8]]},
 {name:'Canada centre-back',role:'can',style:canada({build:{height:1.68},seed:44}),keys:[[T0,-8.6,4.4],[-2,-6.4,3.6],[0,-4.6,2.9],[TF,-3.5,2.3],[T1,-3.3,2]]},
 {name:'Canada right-back',role:'can',style:canada({skin:SKIN_M,hair:[K,.7],seed:45}),keys:[[T0,-12,-8.4],[-2,-10.6,-7.4],[0,-9.6,-6.6],[TF,-8.5,-5.2],[T1,-7.8,-4.4]]},
 {name:'Canada midfielder',role:'can',style:canada({skin:SKIN_D,build:{height:1.62,bulk:.94},hairStyle:'curly',seed:46}),keys:[[T0,-19.5,1.2],[-2,-17.4,.2],[0,-16.2,-.6],[TF,-13.6,-.9],[T1,-12.5,-.6]]},
 {name:'USA midfielder',role:'usa',style:usa({hair:[Y,.7],seed:61}),keys:[[T0,-30,4],[-2,-26,5.4],[0,-24.4,6],[TF,-21,5],...toMor(-20,4.6,1)]},
 {name:'USA forward',role:'usa',style:usa({skin:SKIN_M,hair:[K,.8],seed:62}),keys:[[T0,-15.4,-6.4],[-2,-13.2,-6],[0,-12.2,-5.6],[TF,-10.6,-4.8],...toMor(-10,-4.2,2)]},
];
const MOR=0,ORE=1,WAM=2,GK=3,SES=4,TAN=5;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** at Wambach's feet (a touch ahead of her) → her pass out wide → O'Reilly's touch forward → the cross → the header → the net */
function ahead(k:number,tau:number,lead:number):V3{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*lead,BALL_R,p[1]+v[1]/l*lead];}
let _pass:V3|null=null;const PASS0=()=>_pass??(_pass=ahead(WAM,TPASS,.5));
function ballAt(tau:number):V3{
 if(tau<TPASS)return ahead(WAM,tau,.42+.12*Math.abs(Math.sin(distOf(WAM,tau)*1.6)));
 if(tau<TRECV)return mix3(PASS0(),RECV,sm(TPASS,TRECV,tau,u=>u*(1.3-.3*u)));
 if(tau<-.3)return mix3(RECV,P0,sm(TRECV,-.3,tau,easeOut));
 if(tau<=0)return P0;
 if(tau<TF)return fly(P0,V_CROSS,tau);
 if(tau<TG)return fly(HEAD_PT,V_HEAD,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?distOf(WAM,Math.min(tau,TPASS))*3:tau<TF?tau*TAU*4:TF*TAU*4+(tau-TF)*TAU*2.5;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.2+2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:22,rShA:20,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** McLeod: set, shuffling across with the cross, then a late back-pedalling leap with her LEFT hand up (toward +z for a keeper facing −x);
 * the loop is already over her. L0 = start of the leap; the leap is scaled down (she is caught coming across). */
const L0=TF+.12,LEAP_L=1.05;
const leapPose=(u:number)=>{const p=keeperTip(clamp(u),{hand:'l'});p.air*=.6;p.dx*=.7;return p;};
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'mor':{
   // she drifts at the edge of the box watching the ball, darts in, opens up toward the cross, springs, flicks it up and over, runs off
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=morHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<-.2)yaw=lerpAng(yaw,faceYaw(k,tau,ballAt(tau)),.5);
   const w=sm(TJ-.7,TJ-.25,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_M:lerpAng(yaw,YAW_M,w);break;}
  case 'ore':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yaw,YAW_R,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.4){const c=celebrate(tau-TG,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+.9,tau)*.8);}break;}
  case 'wam':{// on the ball, then the pass out wide to O'Reilly, then the sprint to the far post (Tancredi on her)
   const w=win(tau,TPASS-.5,TPASS+.55,.2),pd=nrm2(RECV[0]-PASS0()[0],RECV[2]-PASS0()[2]);if(w>0)pose=blendPose(pose,strike(clamp((tau-TPASS)/1.0+STRIKE_CONTACT),{power:.5}),w);
   yaw=lerpAng(yaw,yawTo(pd[0],pd[1]),sm(TPASS-.9,TPASS-.4,tau)*(1-sm(TPASS+.6,TPASS+1.2,tau)));
   if(tau>TF-.5&&tau<TF+.8){const hp=header(clamp((tau-(TF-.38))/1.0));hp.air*=.35;pose=blendPose(pose,hp,sm(TF-.5,TF-.3,tau)*(1-sm(TF+.4,TF+.8,tau)));yaw=faceYaw(k,Math.min(tau,TF-.3));}
   if(tau>TG+.3){const c=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+1,tau)*.8);}break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(-.2,.4,tau)*(1-sm(TF-.6,TF-.3,tau)));
   if(tau>L0-.2)pose=blendPose(pose,leapPose((tau-L0)/LEAP_L),sm(L0-.2,L0,tau));
   if(tau>TG+1)pose=blendPose(pose,DEJECT,sm(TG+1.2,TG+2,tau)*.7);
   yaw=faceYaw(k,Math.min(tau,TF-.1),ballAt(Math.min(tau,TF-.1)));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI-.25,sm(TF-.1,TF+.2,tau));break;}
  case 'close':{// Sesselmann comes out to close O'Reilly down and blocks late: the cross is already away
   const w=win(tau,-.45,.7,.2);if(w>0)pose=blendPose(pose,lunge(clamp((tau+.45)/.9),{side:'r'}),w);
   yaw=lerpAng(yaw,faceYaw(k,tau,P0),sm(-1,-.3,tau)*(1-sm(.6,1.2,tau)));
   if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'mark':{// Tancredi tracks Wambach and gets her body on her; the ball drops short, in front of them
   if(tau>TF-.5&&tau<TF+.8){const hp=header(clamp((tau-(TF-.36))/1.0));hp.air*=.3;pose=blendPose(pose,hp,sm(TF-.5,TF-.3,tau)*(1-sm(TF+.4,TF+.8,tau)));}
   if(tau>TF+.7)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'can':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'usa':if(tau>TG+.3){const c=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the cross, the header, the leap). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
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
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;star?:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;under?:boolean}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest print 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.star?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<(f.star?44:64)?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 // under: the see-through net prints first (the camera behind the goal looks through the mesh at the keeper and the ball)
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:goal.under?1e9:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];netUnder?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,star:k===MOR,
  smear:o.smear&&((k===MOR&&tau>TJ&&tau<TF+.3)||(k===ORE&&tau>-.25&&tau<.35)||(k===GK&&tau>L0+.1&&tau<L0+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],under:o.netUnder});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the cross is struck on "crosses" and her forehead meets it on "Alex Morgan" */
function tau1(t:number){const tX=CUE(0,'crosses')-.05,tH=CUE(0,'Alex Morgan')+.45,k=clamp(TF/Math.max(.5,tH-tX),.85,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-32,20,62];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-12,0,4],fov:26})],
  [CUE(0,'The USA')-.2,1.4,()=>({P:P1,T:add3(mix3(gnd(b),[-9,0,1],.45),[0,1,0]),fov:13})],
  [CUE(0,'very last')-.2,1.3,()=>({P:P1,T:add3(mix3(gnd(b),at(ORE,tau,0),.5),[0,1,0]),fov:10})],
  [CUE(0,'Heather')-.6,.8,()=>({P:P1,T:add3(mix3(at(ORE,tau,0),gnd(b),.4),[0,1,0]),fov:6})],
  [CUE(0,'crosses')+.05,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.5*sm(0,TF,tau)),fov:lerp(10,14,sm(-.1,.8,tau))})],
  [CUE(0,'Alex')-.45,.8,()=>({P:P1,T:[HP[0]+2.6,1.9,HP[1]+.8],fov:6.8})],
  [CUE(0,'heads it in')+.4,1.5,()=>{const w=at(MOR,tau,1.2);return{P:P1,T:mix3(w,[-3,1.2,2],.35),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Four-three'),tN=CUE(0,'Alex')+.9;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Alex')+.6;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low by the byline, looking back at Morgan
const tau2=(t:number)=>key(t,mono([[0,-2.6],[CUE(1,'keeps running'),-1.8],[CUE(1,'into the box'),-.1],[CUE(1,'She jumps'),TJ+.02],[CUE(1,'in front of'),TF-.22],[CUE(1,'heads the ball'),TF+.02],[CUE(1,'over the keeper'),TF+.55],[SECS(1)-.2,TG+.45]]),linear);
const E2:V3=[1.2,1.3,11.5];
function cam2(t:number):Cam{
 const tau=tau2(t),w=at(MOR,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-10,1.6,1.5],fov:30})],
  [CUE(1,'keeps running')-.2,1.1,()=>({P:E2,T:mix3(w,[-9,1.2,0],.25),fov:17})],
  [CUE(1,'into the box')-.2,1,()=>({P:E2,T:mix3(w,[HP[0],1.4,HP[1]],.4),fov:15})],
  [CUE(1,'She jumps')-.3,1,()=>({P:add3(E2,[0,.2,-.4]),T:[HP[0],2,HP[1]-.4],fov:15})],
  [CUE(1,'heads the ball')-.3,.8,()=>({P:add3(E2,[0,.3,-.6]),T:[HEAD_PT[0]+.2,HEAD_PT[1]-.1,HEAD_PT[2]],fov:10})],
  [CUE(1,'over the keeper')-.2,1.1,()=>({P:add3(E2,[0,.4,-.6]),T:mix3([HEAD_PT[0],2.2,HEAD_PT[2]],[.2,1.8,2.4],.72),fov:28})],
 ]);
}
/** the replay trail: the ball's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the touch: a spark on her forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'heads the ball')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the loop drops over the keeper
const tau3=(t:number)=>key(t,mono([[0,TF-1.1],[CUE(2,'aims it high'),TF+.02],[CUE(2,'top corner'),TG+.02],[CUE(2,'keeper can'),TG+.7],[SECS(2),TG+3.4]]),linear);
const E3:V3=[10,5.2,-8.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),m=at(MOR,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-6.5,1.4,.4],fov:24})],
  [CUE(2,'aims it high')-.4,.9,()=>({P:E3,T:[-4.6,2,.8],fov:19})],
  [CUE(2,'top corner')-.1,1,()=>({P:E3,T:[-1.6,2,1.6],fov:16})],
  [CUE(2,'keeper can')+.4,1.8,()=>({P:add3(E3,[-1,-1,0]),T:m,fov:22})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(TG+2.2,TG+2.6,tau)*.8)});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),netUnder:true});
  // the replay graphic: the header's loop printed over the keeper and the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.4,TG+.9,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(MOR,tau3(twos(t))),sk=solve(p.pose,B_MOR,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'top corner')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-2.6],[CUE(3,'into the box'),-1.6],[CUE(3,'very end'),.2],[CUE(3,'aim your header'),TF-.08],[CUE(3,'keeper can'),TF+.5],[SECS(3),TG+.35]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(MOR,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-14,2.4,11],T:[-12,1.2,1.5],fov:38})],
  [CUE(3,'into the box')-.2,1.2,()=>({P:[-13.5,2,10.5],T:mix3(w,[HP[0],1,HP[1]],.4),fov:32})],
  [CUE(3,'very end')-.2,1,()=>({P:[-12.5,1.9,9.6],T:[HP[0]+.6,1.7,HP[1]],fov:28})],
  [CUE(3,'aim your header')-.4,1.1,()=>({P:[-4.4,2.2,13],T:[-4.3,2,.7],fov:43})],
  [CUE(3,'keeper can')+.1,1.1,()=>({P:[-3.2,2.3,11.6],T:[-2.6,2.1,1.2],fov:38})],
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
/** "until the very end": a stadium clock face (no numbers) printed in the top corner of the frame, its red hand sweeping up to the top */
function clockFace(s:Sheet,g:number,sweep:number){
 if(g<=0)return;const x=-lerp(270,330,1-g)-120,y=-300,r=120*easeOutBack(clamp(g)),face=polyPath(blob(x,y,r,r,5,{amp:.03,n:32}),true);
 s.knockout(face);s.stroke(K,face,6,.9);s.tone(Y,face,.3);
 const ticks=new Path2D();for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2,a0:Pt=[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],a1:Pt=[x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92];ticks.addPath(ribbon([a0,a1],i%3?5:9,{seed:i,taper:0,wobble:0}));}s.fill(K,ticks,.9);
 // the last slice before the top (the final minute) printed red; the hand sweeps into it
 const sl=new Path2D();sl.moveTo(x,y);for(let i=0;i<=8;i++){const a=-Math.PI/2-TAU/12+i/8*TAU/12;sl.lineTo(x+Math.cos(a)*r*.74,y+Math.sin(a)*r*.74);}sl.closePath();s.fill(R,sl,.7);
 const ha=-Math.PI/2-TAU/12*(1-sweep)-.9*(1-g);s.fill(K,ribbon([[x,y],[x+Math.cos(ha)*r*.8,y+Math.sin(ha)*r*.8]],10,{seed:3,taper:.6,wobble:0}),.95);
}
/** a target ring printed round P, facing the camera (rad in metres at P's depth) */
function goalRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,P);if(a<=0||!X)return;const R_=kAt(c,P)*rad,pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU;pts.push([X[0]+Math.cos(u)*R_,X[1]+Math.sin(u)*R_]);}const w=Math.max(12,kAt(c,P)*.1),rr=ribbon(pts,w,{seed:12,close:true,wobble:.6,pressure:.2});s.stroke(K,rr,Math.max(3,w*.25),.9*a);s.knockout(rr,a);s.fill(ink,rr,.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tK=CUE(3,'Keep running'),tB=CUE(3,'into the box'),tE=CUE(3,'very end'),tA=CUE(3,'aim your header'),tC=CUE(3,'keeper can');
  stadium(s,c,t,[0,1,3],{roar:.35+.5*sm(tK,tK+.6,t)*(1-sm(tB+1,tB+2,t))+.6*sm(tC+.3,tC+.9,t)});
  ground(s,c);
  // "into the box": her run's footprints light up in order as she arrives, a red ring where she jumps
  const run=sm(tB-.2,tB+.3,t)*(1-sm(tA+.2,tA+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<10;k++){const Tk=-2.4+k*((TJ-.3+2.4)/9),[x,z]=posOf(MOR,Tk),v=velOf(MOR,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);
   const X=pr(c,[HP[0],.01,HP[1]]);if(X){const rr=kAt(c,[HP[0],0,HP[1]])*.5,ring=polyPath(blob(X[0],X[1],rr,rr*.32,7,{n:20}),true);s.stroke(R,ring,Math.max(5,rr*.14),.95*run);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[MOR,WAM,GK,TAN]});
  // "aim your header": a target ring in the top corner, printed over the net
  const aim=sm(tA-.25,tA+.2,t,easeOutBack)*(1-sm(SECS(3)-.9,SECS(3)-.3,t));goalRing(s,c,GOAL_PT,.5*clamp(aim,0,1.2),Y,clamp(aim,0,1));
  // "Keep running": a burst over her; "until the very end": the clock
  const kg=sm(tK,tK+.35,t)*(1-sm(tK+1.2,tK+1.7,t));if(kg>0){const q=pr(c,at(MOR,tau,3.2));if(q)sparkBurst(s,Y,q[0],q[1],200*kg,{n:12,seed:9,g:easeOutBack(kg),width:16});}
  clockFace(s,sm(tE-.25,tE+.25,t)*(1-sm(tA-.2,tA+.3,t)),sm(tE,tE+1.1,t,easeInOutSine));
  // "aim your header": a ring on the ball, her forehead glows, and the loop is printed up and over into the corner
  const hd=sm(tA-.2,tA+.2,t);
  if(hd>0&&r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*hd);s.fill(Y,rp_,.95*hd);}
  if(hd>0){const st=stateOf(MOR,tau),sk=solve(st.pose,B_MOR,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0])),fade=1-sm(tA+1.6,tA+2.2,t);
   if(q){const rr=kAt(c,fp)*.07*clamp(hd,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fade);s.fill(Y,glow,.9*fade);}
   const arr=sm(tA+.1,tA+1.1,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push(fly(HEAD_PT,V_HEAD,(TG-TF)*arr*i/10));arrow3(s,c,pts,Math.max(16,kAt(c,HEAD_PT)*.07),Y,.95);}}
  // "where the keeper can't reach": a blue dashed ring round her highest reach (red would vanish on the red seats) — the loop passes above and beyond it
  const kc=sm(tC-.15,tC+.3,t)*(1-sm(SECS(3)-.6,SECS(3)-.1,t));
  if(kc>0){const p=stateOf(GK,L0+.62*LEAP_L),sk=solve(p.pose,B_MCL,p.place),hand=sk.lHa,X=pr(c,hand),pts:Pt[]=[];if(X){const R_=kAt(c,hand)*.6;for(let i=0;i<26;i++){const u=i/26*TAU;pts.push([X[0]+Math.cos(u)*R_,X[1]+Math.sin(u)*R_]);}}
   if(pts.length>8){const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);const rr=ribbon(pts,Math.max(12,kAt(c,hand)*.08),{seed:31,close:true,wobble:.6,gaps});s.stroke(K,rr,4,.9*kc);s.knockout(rr,kc);s.fill(B,rr,.95*kc);}}
 },
 get still(){return CUE(3,'aim your header')+.4;},
};

const film:RisoStory={
 id:'morgan-canada-2012',format:'11v11',title:"Morgan's last-minute header",
 theme:'Keep making runs into the box until the very end, and aim your header where the keeper can’t reach',
 ageNote:'Canada 3–4 USA (after extra time), Olympic women’s football semi-final, Old Trafford, 6 August 2012. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little looping header — a ball drops in on an arc, a yellow spark where it is met, and it loops up and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x-170*(1-u):x+200*easeOut(out),by=age<.35?y-120*(1-u)*(1-u)-10:y-140*Math.sin(out*Math.PI*.8)+30*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Canada's goal line x = 0, +z = the USA's right) — checked by tests/play-film-morgan-canada-2012.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,crossFoot:'r' as const,
 oreillyContact:()=>{const st=stateOf(ORE,0),sk=solve(st.pose,B_ORE,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 morganAt:(tau:number)=>{const st=stateOf(MOR,tau),sk=solve(st.pose,B_MOR,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 mcleodAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_MCL,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis,head:sk.head};},
 wambachAt:(tau:number)=>{const st=stateOf(WAM,tau),sk=solve(st.pose,B_WAM,st.place);return{pelvis:sk.pelvis,head:sk.head};},
 tancrediAt:(tau:number)=>{const st=stateOf(TAN,tau);return{x:st.place.x??0,z:st.place.z??0};},
 sesselmannAt:(tau:number)=>{const st=stateOf(SES,tau);return{x:st.place.x??0,z:st.place.z??0};}};
