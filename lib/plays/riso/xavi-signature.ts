/** Xavi Hernández, "Signature: the metronome pass". Germany 0–1 Spain, UEFA Euro 2008 final, Ernst-Happel-Stadion, Vienna, 29 June 2008,
 * 33rd minute: Xavi rolls the ball through, Fernando Torres beats Philipp Lahm to it and chips it over Jens Lehmann for the only goal.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (a kind:"signature" entry, lesson "Keep the ball moving with short, simple passes to control the game"): Xavi was named
 * Euro 2008's Player of the Tournament because he "epitomizes the Spanish style of play … the whole possession, passing and penetrating kind
 * of game that Spain played" (Andy Roxburgh, UEFA), and the final's winning goal came from his through pass. His own words give the
 * scanning half of the signature ("That's what I do: look for spaces. All day. I'm always looking.") and Guardiola's give the metronome half
 * ("I get the ball, I give the ball, I get the ball, I give the ball"). The film shows the one documented pass; the short passes that lead
 * to him are illustrative (see INFERRED) and the lesson chapter teaches the general habit.
 *
 * Narration text: public/plays/narration/xavi-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (see estimate()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists
 * `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/xavi-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/xavi-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2008 final" (raw wikitext, a featured article): 29 June 2008, Ernst-Happel-Stadion, Vienna, kick-off 20:45 CEST
 *    "at the end of a sunny day", 51,428, referee Roberto Rosetti; "Spain took the lead after 33 minutes when Torres latched onto a through
 *    ball from Xavi, beat Lahm on the edge of the penalty area, and then clipped the ball over the advancing Lehmann into the left-hand
 *    corner of the goal"; Lahm (16) was Germany's left-back and went off at half-time; line-ups and numbers (Xavi 8, Torres 9, Senna 19,
 *    Fàbregas 10, Iniesta 6, Silva 21, Lehmann 1, Lahm 16, Mertesacker 17, Metzelder 21, Friedrich 3, Frings 8, Hitzlsperger 15, Ballack 13);
 *    the kit table: Germany white shirts, black shorts, white socks; Spain red shirts, dark-navy shorts, dark-navy socks.
 *  - Wikimedia Commons kit graphics used by that table, Kit_body_ger08h.png / Kit_left_arm_ger08h.png: Germany's 2008 home shirt is white with
 *    a black band across the chest (with a thin black-red-gold stripe) and white sleeves with black trim.
 *  - The Guardian, Scott Murray, "Euro 2008 final: Germany v Spain – as it happened", 29 June 2008 (web.archive.org copy): "33 min: SUPERB
 *    GOAL!!! … He goes tearing down the inside-right channel after a perfectly-weighted ball is rolled towards the German area by Xavi. Lahm
 *    chases with Torres but can't get there; Lehmann comes out and can't either. Torres dinks a beautiful chip over the advancing keeper and
 *    into the empty net." 55 min: "Exactly what happened for the first goal" (Xavi again, Torres in, Lehmann out in time).
 *  - BBC Sport, Caroline Cheese, "Euro 2008 final as it happened", 29 June 2008 (web.archive.org copy): Torres "outpaces Philipp Lahm and
 *    dinks the ball over the advancing Jens Lehmann"; Graham Taylor (5 Live): "as Lahm chases Torres, he sees Lehmann coming and eases out
 *    of the challenge"; Alan Hansen: Spain "gave a masterclass in how to pass the ball". (The live text first credited a Fàbregas pass; the
 *    Guardian, Wikipedia and UEFA credit Xavi, which the film follows.)
 *  - Wikipedia, "Xavi (footballer, born 1980)": 1.70 m; Player of the Tournament at Euro 2008 and Roxburgh's quote; "Style of play": "look
 *    for spaces. All day. I'm always looking" and Guardiola's "I get the ball, I give the ball".
 *  - Wikipedia, "Ernst-Happel-Stadion": Austria's largest stadium (built 1929–31, Prater, Vienna), stands covered in the 1980s, ≈ 53,000
 *    seats for Euro 2008.
 * CONFIRMED by those sources: the match, date, venue, minute and score; Xavi's pass was a through ball rolled along the ground toward the
 *  German area; Torres ran down the INSIDE-RIGHT channel, outpaced Lahm (who chased and eased off), met it at the edge of the area, and
 *  chipped/dinked it over the advancing Lehmann into the empty net; the only goal, Spain champions; the kits and numbers above; Xavi 1.70 m.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (Xavi about 36 m from goal just right of centre, a ≈ 22 m
 *  pass, Torres onto it ≈ 16 m out, the chip from ≈ 15 m); the two short passes that lead to Xavi (Fàbregas → Senna → Xavi; the sources do
 *  not describe the build-up); Xavi's head turns before he receives and before he passes (his documented habit, not described for this
 *  pass); the passing foot (drawn RIGHT, Xavi's stronger foot; not narrated), Torres's touch and chip foot (drawn RIGHT; not narrated);
 *  "left-hand corner" read from Torres's side (the −z post); Lehmann's goalkeeper kit (drawn grey; not narrated) and his late spread; the
 *  German chest band is not printed (athlete.ts has no single-band pattern; the shirt reads white with navy trim); the other players' spots;
 *  Spain's yellow numbers and trim; the ball drawn as a white Europass with dark curved panels; the stadium as drawn (an oval bowl, two
 *  tiers, a roof ring with lamps on its lip, a running track round the pitch), the dusk sky (sunset in Vienna ≈ 21:00, goal ≈ 21:20), the
 *  crowd's colours, the camera positions and lenses, the celebration run.
 *
 * STRUCTURE (the TV broadcast, never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 Xavi's pass): ch1 = the live
 * broadcast — a wide establishing shot of the bowl at dusk, then the high main-stand camera in near real time (Spain in red, Germany in
 * white, the score bug, short passes to Xavi, the through ball, Torres past Lahm, the chip, goal); ch2 = the TV slow-motion replay, low and
 * close on Xavi: he looks around for space, one touch, the pass weighted into the gap behind the defence; ch3 = a second replay from behind
 * the goal: Torres gets there first and lifts it over Lehmann, the celebration; ch4 = the lesson, from behind Xavi at mid height: the short
 * passes traced as lanes, "get it" / "give it" rings, the space he found, Spain's passing web. Composed on the FULL sheet (world units =
 * sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the pass, the chip and the keeper's spread). Handedness: the world is right-handed exactly like
 * athlete.ts (x toward Germany's goal, y up, +z = Spain's right), so strike({foot:'r'}) is a RIGHT foot and the inside-right channel is +z.
 * Inks: yellow, red, blue, navy (Germany's white = paper). Everything keys off cue times; poses on twos, cameras on ones; all randomness
 * seeded. Heat: small figures print at 'low', at most FULL_CAP non-hero figures at full detail, every figure inside a passage capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Vienna, 2008',text:'Vienna, 2008, the Euro final. Spain, in red, play Germany, in white. Xavi looks up and rolls a perfect pass through. Fernando Torres races past Lahm, chips the keeper... goal!',tail:2.4,
  cues:['Vienna','Euro final','Spain, in red','Germany, in white','Xavi looks up','rolls a perfect pass','Fernando Torres','races past Lahm','chips the keeper','goal']},
 {label:'Always looking',text:'Watch again, slowly. Xavi is always looking for space. One touch, then a pass weighted just right, behind the defence.',tail:1.5,
  cues:['Watch again','slowly','always looking','One touch','weighted just right','behind the defence']},
 {label:'Champions',text:'Torres gets there first and lifts it over Jens Lehmann. Spain are champions of Europe!',tail:2.4,
  cues:['Torres gets there','lifts it over','Jens Lehmann','champions of Europe']},
 {label:'Your turn',text:'Your turn: keep the ball moving with short, simple passes. Get it, give it, and look for space to control the game.',tail:2,
  cues:['Your turn','keep the ball moving','short, simple passes','Get it','give it','look for space','control the game']},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py xavi-signature (writes timing.json next to script.json).
 * Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter lengths and
 * the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/xavi-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the Kokoro voice of the approved films): .2 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('xavi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('xavi: no cue '+w);return c.at;};
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
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
type P2=[number,number];
const RAD=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** the visible window in world units, with margin for the .68 passage preview; inside a passage it is read back from the sheet transform */
function view(s:Sheet):{cx:number;cy:number;hx:number;hy:number}{
 const base={cx:0,cy:0,hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120};if(!s._passage.pending)return base;
 const inv=s.getTransform().inverse(),W=s.width*s.dpr,H=s.height*s.dpr,cs=[[0,0],[W,0],[0,H],[W,H]].map(([x,y])=>inv.transformPoint(new DOMPoint(x,y)));
 const x0=Math.min(...cs.map(p=>p.x)),x1=Math.max(...cs.map(p=>p.x)),y0=Math.min(...cs.map(p=>p.y)),y1=Math.max(...cs.map(p=>p.y));
 if(!Number.isFinite(x0+x1+y0+y1))return base;const mg=(x1-x0)*.06+8;return{cx:(x0+x1)/2,cy:(y0+y1)/2,hx:(x1-x0)/2+mg,hy:(y1-y0)/2+mg};}

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Germany's goal line is x = 0 (Spain attack +x), goal centre z = 0, +z = Spain's right; touchlines z = ±34, halfway x = −52.5. */
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
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Ernst-Happel-Stadion at dusk: an oval bowl, two tiers, a roof ring with lamps
const CX=-52.5,NS=48;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(66+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(47+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[1+22*b,1.3+12*b],UP=(b:number):[number,number]=>[25+20*b,15.5+15*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lip:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lip:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,23.2,13.3),rim(b,23.2,13.3),rim(b,24.8,15.6),rim(a,24.8,15.6)]);
  o.roof.push([rim(a,30,37),rim(b,30,37),rim(b,56,35),rim(a,56,35)]);
  o.lip.push([rim(a,30,35.8),rim(b,30,35.8),rim(b,30,37.4),rim(a,30,37.4)]);
  if(i%2===0)o.lamps.push(rim(a+.5/NS*TAU,30.2,35.2));
  for(const [f,rows] of [[LOW,7],[UP,6]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,11);if(h<.2)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),lite=!!s._passage.pending;
 // a June dusk: deep blue sky, an afterglow low on the horizon (sunset ≈ 21:00, the goal ≈ 21:20)
 s.field(B,.62,.5);s.field(K,.38,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]+200],[1e4,hz[1]+200],[1e4,hz[1]-260],[-1e4,hz[1]-260]],true),.3);s.tone(R,polyPath([[-1e4,hz[1]+200],[1e4,hz[1]+200],[1e4,hz[1]-120],[-1e4,hz[1]-120]],true),.18);}
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),lip=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.band[i],band);add(BOWL.roof[i],roof);add(BOWL.lip[i],lip);}
 s.knockout(low);s.tone(K,low,.3);s.tone(B,low,.2);
 s.knockout(up);s.tone(K,up,.42);s.tone(B,up,.25);
 // the crowd: one mark per seat group, sized by distance — Spain red and yellow, Germany white and black; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0]-v.cx)>v.hx||Math.abs(p[1]-v.cy)>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.46?0:q.h<.7?1:q.h<.86?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);if(!lite){s.fill(Y,inks[2],.95);s.fill(K,inks[3],.85);}
 s.knockout(band);s.fill(K,band,.8);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.3);
 s.knockout(lip);s.fill(K,lip,.3);
 if(lite)return;
 // floodlights on the roof lip
 const lamp=new Path2D();for(const P of BOWL.lamps){const q=toCam(c,P);if(q[2]<14)continue;const g=scr(c,q),z=clamp(c.F*1.1/q[2],3,16);lamp.addPath(polyPath(blob(g[0],g[1],z,z*.6,5,{n:8}),true));}
 s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<20;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d),z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the running track, grass, lines, boards, both goals
function ground(s:Sheet,c:Cam){
 // the running track round the pitch (tartan: red × navy), inside the bowl's rim
 const tr:V3[]=[];for(let i=0;i<48;i++)tr.push(rim(i/48*TAU,-.5,0));const tq=polyP(c,tr);if(tq.length>2){const p=polyPath(tq,true);s.knockout(p);s.tone(R,p,.5);s.tone(K,p,.18);}
 const g=polyP(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.82);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards (no lettering): navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([5,0,-37],[5,0,37]);board([-110,0,-37],[-110,0,37]);board([-110,0,-38],[5,0,-38]);board([-110,0,38],[5,0,38]);
 for(let k=0;k<12;k++){const z=-35+k*6.1;addPoly(pn,polyP(c,[[4.9,.22,z],[4.9,.22,z+3.2],[4.9,.66,z+3.2],[4.9,.66,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.22,zz],[x+3.4,.22,zz],[x+3.4,.66,zz],[x,.66,zz]]));}
 s.knockout(bd);s.fill(K,bd,.85);s.knockout(pn,.9);s.fill(Y,pn,.7);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 for(const [gx,d] of [[0,-1],[-105,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 s.knockout(ln);
 goal3(s,c,-105,-1,0,0);
}
/** a goal at X (net going the d side): posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out round bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2)));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Spain's home kit that night: red shirts, dark-navy shorts and socks (yellow numbers and trim: inferred) */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Germany's home kit: white shirts, black shorts, white socks (navy trim and numbers; the chest band is not printed, see INFERRED) */
const ger=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,numberInk:K,hairStyle:'short',build:{height:1.86,bulk:1},...o});
const B_XAV:Build={height:1.7,bulk:.92},B_TOR:Build={height:1.86,bulk:.95},B_LEH:Build={height:1.9,bulk:1},B_LAHM:Build={height:1.7,bulk:.94};
const XAV_ST=esp({number:8,hair:[K,.9],build:B_XAV,seed:8});
/** Torres: No. 9, fair (strawberry-blond) hair */
const TOR_ST=esp({number:9,hair:[Y,.85],build:B_TOR,seed:9});
const LAHM_ST=ger({number:16,hair:[K,.7],build:B_LAHM,seed:16});
/** Lehmann: keeper's kit drawn grey with navy shorts (inferred) */
const LEH_ST:AthleteStyle={shirt:[K,.45],shorts:[K,.85],socks:[K,.45],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:Y,build:B_LEH,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Xavi's pass)
const BALL_R=.11,T0=-7,T1=8,DT=.02;
/** ball stops (ground, x/z): Fàbregas's feet, Senna's receive, Xavi's receive, Xavi's pass spot, Torres's touch, the chip spot */
const FB:P2=[-40.6,-8.4],SN:P2=[-46.2,-2.4],R0:P2=[-37.8,.5],XP:P2=[-36.4,1.2],TSPOT:P2=[-16.4,10.6],CB:P2=[-12,8.1];
/** pass times: Fàbregas → Senna, Senna → Xavi, Xavi's first touch, the through ball, Torres's touch, the chip, the goal line */
const PF=-4.1,AS=-3.15,PS=-2.05,AX=-1.1,TOUCH_END=-.4,TT=1.75,TC=2.45,TG=TC+1.05;
/** the chip: into the empty net at Torres's LEFT-hand side (−z), dropping in under the bar */
const GP:V3=[0,1.05,-2.1],NET_HIT:V3=[1.5,.55,-2.35],REST:V3=[1.15,BALL_R,-2.1],CHIP_H=2.6;
const D_P=nrm2(TSPOT[0]-XP[0],TSPOT[1]-XP[1]),YAW_P=yawTo(D_P[0],D_P[1]);
const D_C=nrm2(GP[0]-CB[0],GP[2]-CB[1]),YAW_C=yawTo(D_C[0],D_C[1]);
/** where a pelvis stands at strike contact so the RIGHT boot meets the back of the ball (solved once, FK) */
function contactPelvis(ball:P2,dir:P2,build:Build,power:number):P2{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power}),build,{x:0,z:0,yaw:yawTo(dir[0],dir[1])});return[ball[0]-dir[0]*.12-sk.rToe[0],ball[1]-dir[1]*.12-sk.rToe[2]];}
const PCX=contactPelvis(XP,D_P,B_XAV,.45),PCT=contactPelvis(CB,D_C,B_TOR,.35);
const D_FS=nrm2(SN[0]-FB[0],SN[1]-FB[1]),D_SX=nrm2(R0[0]-SN[0],R0[1]-SN[1]);
const PCF=contactPelvis(FB,D_FS,{height:1.77},.25),PCS=contactPelvis(SN,D_SX,{height:1.77},.25);
/** a receiver stands just beyond the ball, facing where it comes from */
const recv=(ball:P2,from:P2,d=.55):P2=>{const n=nrm2(ball[0]-from[0],ball[1]-from[1]);return[ball[0]+n[0]*d,ball[1]+n[1]*d];};
/** Torres's pelvis at his touch: behind the ball along his run, a touch to his left so the right boot meets it */
const D_T=nrm2(CB[0]-TSPOT[0],CB[1]-TSPOT[1]),TOR_TT:P2=[TSPOT[0]-D_T[0]*.55+D_T[1]*.14,TSPOT[1]-D_T[1]*.55-D_T[0]*.14];

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='xavi'|'torres'|'gk'|'lahm'|'esp'|'ger'|'fab'|'senna';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const along=(p:P2,d:P2,u:number):[number,number]=>[p[0]+d[0]*u,p[1]+d[1]*u];
const ACTORS:Actor[]=[
 {name:'Xavi',role:'xavi',hero:true,style:XAV_ST,keys:[[T0,-40.2,3],[-4,-39.2,1.8],[-2.2,-38.2,1.4],[AX,...recv(R0,SN,.5)],[TOUCH_END,...along(PCX,D_P,-.9)],[0,...PCX],[1.2,...along(PCX,D_P,2.2)],[TG+.6,-29,6.5],[T1,-25,8.5]]},
 {name:'Fernando Torres',role:'torres',hero:true,style:TOR_ST,keys:[[T0,-27.4,16.2],[-2,-27.7,15.2],[-.6,-27.9,14.3],[0,-26.4,13.7],[.9,-21.6,12.2],[TT,...TOR_TT],[TC,...PCT],[TC+.5,...along(PCT,D_C,2.3)],[TG+.5,-7.2,4.8],[TG+2.2,-7.6,12],[T1,-9.5,24]]},
 {name:'Jens Lehmann',role:'gk',hero:true,style:LEH_ST,keys:[[T0,-1.4,.4],[0,-2.2,1.2],[1.1,-3.3,2.3],[2,-6.6,4.6],[2.35,-7.7,5.4],[T1,-7.9,5.5]]},
 {name:'Philipp Lahm',role:'lahm',hero:true,style:LAHM_ST,keys:[[T0,-23.8,10.2],[0,-21.3,10.3],[.9,-19.6,10.1],[TT,-17.9,9.6],[2.1,-16.5,9.1],[TC,-15.6,8.8],[TC+.9,-14.9,8.5],[T1,-14.5,8.3]]},
 {name:'Marcos Senna',role:'senna',style:esp({number:19,skin:SKIN_D,hair:K,seed:19}),keys:[[T0,-47.5,-3.6],[AS,...recv(SN,FB,.5)],[PS,...PCS],[PS+1.2,-45,-1.5],[T1,-41,0]]},
 {name:'Cesc Fàbregas',role:'fab',style:esp({number:10,seed:10}),keys:[[T0,-42.4,-9.6],[PF,...PCF],[PF+1.4,-38.6,-8.6],[T1,-30,-6]]},
 {name:'Andrés Iniesta',role:'esp',style:esp({number:6,hairStyle:'balding',hair:[K,.7],build:{height:1.71,bulk:.9},seed:6}),keys:[[T0,-32,-18],[0,-29.5,-15.5],[TG,-22,-11],[T1,-16,-8]]},
 {name:'David Silva',role:'esp',style:esp({number:21,skin:SKIN_M,build:{height:1.7,bulk:.9},seed:21}),keys:[[T0,-30,-7.5],[0,-28.6,-6.6],[TG,-19,-3],[T1,-14,-1]]},
 {name:'Per Mertesacker',role:'ger',style:ger({number:17,build:{height:1.98,bulk:1},hair:[Y,.8],seed:17}),keys:[[T0,-24.6,2.6],[0,-23.4,3.1],[TT,-17.6,3.6],[TC,-13.4,3.2],[T1,-9.6,2.2]]},
 {name:'Christoph Metzelder',role:'ger',style:ger({number:21,build:{height:1.93},hair:[K,.75],seed:22}),keys:[[T0,-25.4,-5.2],[0,-24.6,-4.6],[TC,-16.4,-2.2],[T1,-12.4,-1.2]]},
 {name:'Arne Friedrich',role:'ger',style:ger({number:3,hair:[K,.8],seed:3}),keys:[[T0,-27.6,-17],[0,-26.4,-15.2],[T1,-17,-9]]},
 {name:'Torsten Frings',role:'ger',style:ger({number:8,hair:[K,.8],seed:8}),keys:[[T0,-41.5,5.4],[-2,-40.6,3.6],[0,-38.8,4],[T1,-28,6.4]]},
 {name:'Michael Ballack',role:'ger',style:ger({number:13,hair:[K,.85],build:{height:1.89},seed:13}),keys:[[T0,-35.4,-3.6],[-2,-35.6,-1.8],[AX,-35.4,-.9],[0,-34.2,-.6],[T1,-26.4,2]]},
 {name:'Thomas Hitzlsperger',role:'ger',style:ger({number:15,hair:[Y,.6],seed:15}),keys:[[T0,-43.6,-7.4],[PF,-43.2,-6],[0,-41.8,-4.4],[T1,-33,-2]]},
];
const XAV=0,TOR=1,GK=2,LAHM=3,SENNA=4,FAB=5;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball: two short passes, a touch, the through ball, Torres's touch, the chip
/** a rolled pass from a to b over [t0, t1], slowing as it goes (ease-out exponent e) */
const roll=(a:P2,b:P2,t0:number,t1:number,tau:number,e=1.5):V3=>{const u=clamp((tau-t0)/(t1-t0)),w=1-Math.pow(1-u,e);return[lerp(a[0],b[0],w),BALL_R,lerp(a[1],b[1],w)];};
function ballAt(tau:number):V3{
 if(tau<PF)return[FB[0],BALL_R,FB[1]];
 if(tau<AS)return roll(FB,SN,PF,AS,tau,1.3);
 if(tau<PS)return[SN[0],BALL_R,SN[1]];
 if(tau<AX)return roll(SN,R0,PS,AX,tau,1.3);
 if(tau<0)return roll(R0,XP,AX,TOUCH_END,tau,2);
 if(tau<TT)return roll(XP,TSPOT,0,TT,tau,1.35);
 if(tau<TC)return roll(TSPOT,CB,TT,TC,tau,1.6);
 if(tau<TG){const u=(tau-TC)/(TG-TC);return[lerp(CB[0],GP[0],u),lerp(BALL_R,GP[1],u)+4*CHIP_H*u*(1-u),lerp(CB[1],GP[2],u)];}
 if(tau<TG+.14)return mix3(GP,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>{let d=0;const N=24;for(let i=0;i<N;i++){const a=ballAt(T0+(tau-T0)*i/N),b=ballAt(T0+(tau-T0)*(i+1)/N);d+=Math.hypot(b[0]-a[0],b[2]-a[2]);}return d/BALL_R*.5;};
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** the 2008 match ball (Adidas Europass): paper white, a blue shade crescent, dark curved panels turning with the spin, a navy rim */
function europass(s:Sheet,x:number,y:number,r:number,spin:number){
 const rimP:Pt[]=Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[x+Math.cos(a)*r,y+Math.sin(a)*r] as Pt;}),disc=polyPath(rimP,true);
 s.knockout(disc);s.save();s.clip(disc);s.tone(B,crescent(x,y,r*1.02,[-.4,-.45]),.4);
 const nav=new Path2D(),m=Math.cos(spin*.6);
 for(let k=0;k<3;k++){const a=spin+k*TAU/3,arc:Pt[]=[];for(let i=0;i<=6;i++){const u=a+i/6*1.1,rr=r*(.35+.4*i/6);arc.push([x+Math.cos(u)*rr,y+Math.sin(u)*rr*m]);}nav.addPath(ribbon(arc,Math.max(1.5,r*.2),{taper:.6,wobble:0}));}
 s.fill(K,nav,.85);s.restore();
 s.fill(K,ribbon(rimP,Math.max(3,r*.1),{close:true,pressure:.5,wobble:r*.02}));
}

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // on the move off the ball: knees bent, arms loose, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:22,rHipF:16,lKnee:28,rKnee:24,lean:12,pitch:4,neckP:-8,lShA:22,rShA:20,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a pass: strike() around contact time tc, right foot, weight w */
const passPose=(tau:number,tc:number,power:number,dur=.9)=>strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot:'r',power});
/** Xavi's head turns — the "always looking" scans (inferred timing): a look over each shoulder before the ball comes, and one up the pitch
 * after his touch. Radians of neckY (+ = left). */
const scanAt=(tau:number)=>{const a=win(tau,-2.9,-1.45,.3),b=win(tau,-.85,-.1,.2);return a*55*RAD*Math.sin((tau+2.9)/1.45*TAU)+b*-24*RAD*Math.sin((tau+.85)/.75*Math.PI);};
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 const done=tau>TG+.4;
 switch(a.role){
  case 'xavi':{
   // receive facing Senna, a small right-foot touch that turns him forward, a look up, the rolled pass, then he follows it up
   if(tau<AX+.2)yaw=faceYaw(k,tau,[SN[0],0,SN[1]]);
   yaw=lerpAng(yaw,YAW_P,sm(AX-.1,TOUCH_END+.1,tau)*(1-sm(1,1.6,tau)));
   const tw=win(tau,AX-.45,AX+.45,.2);if(tw>0)pose=blendPose(pose,strike(clamp((tau-AX)/.8+STRIKE_CONTACT),{foot:'r',power:.1}),tw*.8);
   const pw=win(tau,-.5,.8,.2);if(pw>0)pose=blendPose(pose,passPose(tau,0,.45,1),pw);
   pose={...pose,neckY:pose.neckY+scanAt(tau)};
   if(done)pose=blendPose(pose,celebrate(tau*.9,{kind:'arms'}),sm(TG+.6,TG+1.3,tau)*.8);
   break;}
  case 'torres':{
   const tw=win(tau,TT-.4,TT+.35,.15);if(tw>0)pose=blendPose(pose,strike(clamp((tau-TT)/.7+STRIKE_CONTACT),{foot:'r',power:.15}),tw*.75);
   const cw=win(tau,TC-.5,TC+.7,.2);if(cw>0)pose=blendPose(pose,passPose(tau,TC,.35,.95),cw);
   if(tau>TC-.5&&tau<TC+.5)yaw=lerpAng(yaw,YAW_C,win(tau,TC-.5,TC+.5,.25));
   if(tau>TG)pose=blendPose(pose,celebrate(distOf(k,tau)/4.2,{kind:'run'}),sm(TG+.1,TG+.7,tau));
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.9,1.3,tau));
   // out to meet Torres, then a late spring and reach as the chip goes up and over him (the reach stops short: he stays near the ball's line)
   const T_S=TC-.12;if(tau>T_S-.1){const u=clamp((tau-T_S)/1.1);pose=blendPose(pose,keeperDive(Math.min(.5,u*.8),{side:'r',height:.9}),sm(T_S-.1,T_S+.05,tau));}
   yaw=faceYaw(k,Math.min(tau,TC-.1),ballAt(Math.min(tau,TC)));
   if(tau>TG+1.2)pose=blendPose(pose,DEJECT,sm(TG+1.2,TG+2,tau)*.5);break;}
  case 'lahm':{// chases on Torres's inside, then eases out of the challenge as Lehmann comes
   if(tau>-.2&&tau<TC+.6)yaw=faceYaw(k,tau);
   if(done)pose=blendPose(pose,DEJECT,sm(TG+.4,TG+1.2,tau)*.8);break;}
  case 'senna':{if(tau<AS+.2)yaw=faceYaw(k,tau,[FB[0],0,FB[1]]);
   const pw=win(tau,PS-.5,PS+.7,.2);if(pw>0){pose=blendPose(pose,passPose(tau,PS,.25),pw);yaw=lerpAng(yaw,yawTo(D_SX[0],D_SX[1]),pw);}
   if(done)pose=blendPose(pose,celebrate(tau*.8,{kind:'arms'}),sm(TG+.6,TG+1.3,tau)*.7);break;}
  case 'fab':{const pw=win(tau,PF-.5,PF+.7,.2);if(pw>0){pose=blendPose(pose,passPose(tau,PF,.25),pw);yaw=lerpAng(yaw,yawTo(D_FS[0],D_FS[1]),pw);}
   if(done)pose=blendPose(pose,celebrate(tau*.85,{kind:'arms'}),sm(TG+.6,TG+1.3,tau)*.7);break;}
  case 'esp':if(done)pose=blendPose(pose,celebrate(tau*.8+k,{kind:'arms'}),sm(TG+.6,TG+1.3,tau)*.7);break;
  case 'ger':if(done)pose=blendPose(pose,DEJECT,sm(TG+.6,TG+1.6,tau)*.8);break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and hems trail), smear = halftone echo + speed lines on fast limbs (the pass, the chip, the keeper's spread). */
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
 europass(s,g[0],g[1],r,rot);
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=2;
type Fig={k:number;st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; in a chapter's last .7 s and inside a passage
 * every figure is capped (Xavi and Torres 'mid', everyone else 'low', tiny extras skipped). */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean},goal:{bulge:number;bz:number},cap=false):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending||cap;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0]-v.cx)>v.hx+k||g[1]-v.cy<-v.hy-k||g[1]-v.cy>v.hy+k)continue;
  const px=k*ppu;if(passing&&!f.hero&&px<34)continue;const style:AthleteStyle=passing?{...f.style,detail:f.k===XAV||f.k===TOR?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});
 const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,0,1,goal.bulge,goal.bz)});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier for the heroes), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{k,st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===XAV&&tau>-.3&&tau<.3)||(k===TOR&&tau>TC-.3&&tau<TC+.3)||(k===GK&&tau>TC&&tau<TC+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},!!o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times) + shared marks
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const ring=(q:Pt,rx:number,ry:number,n=24):Pt[]=>Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[q[0]+Math.cos(a)*rx,q[1]+Math.sin(a)*ry] as Pt;});
/** a flat ring on the grass round P (radius in metres) */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,wm=.12){
 if(a<=.02)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.02,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<10)return;const w=Math.max(5,kAt(c,P)*wm),rp=ribbon(pts,w,{close:true,taper:0,wobble:.6,seed:5});s.knockout(rp,.9*a);s.fill(ink,rp,.95*a);}
/** a team ring on the grass round each player of a side (on "in red" / "in white") */
function teamRings(s:Sheet,c:Cam,tau:number,side:'esp'|'ger',g:number){
 if(g<=.02)return;const p=new Path2D();
 ACTORS.forEach((a,k)=>{const isEsp=a.style.shirt===R;if(side==='esp'?!isEsp:isEsp)return;
  const[x,z]=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<20;i++){const u=i/20*TAU,q=pr(c,[x+Math.cos(u)*.9*g,.02,z+Math.sin(u)*.9*g]);if(q)pts.push(q);}if(pts.length>12)p.addPath(ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.13),{close:true,taper:0,wobble:.6}));});
 s.knockout(p,.9);if(side==='esp')s.fill(R,p,.95);else s.stroke(K,p,2,.8);
}
/** the ball's ground path from τa to τb as a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,ta:number,tb:number,fade:number,wm=.16){
 if(fade<=0||tb<=ta)return;const pts:Pt[]=[];for(let i=0;i<=24;i++){const P=ballAt(lerp(ta,tb,i/24)),p=pr(c,[P[0],Math.min(P[1],.05)+.02,P[2]]);if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(6,kAt(c,ballAt(tb))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a projected arrow along 3D points (shaft + head), one ink, drawn to `u` of its length */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,u=1,cov=.95){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2||u<=.02)return;const seg=partial(q,u);if(seg.length<2)return;
 const a=seg[seg.length-2],b=seg[seg.length-1];s.knockout(ribbon(seg,w*1.6,{taper:.1,wobble:.6}),.8*cov);laneArrow(s,ink,a,b,w,{head:w*2.6,seed:3,cov});s.fill(ink,ribbon(seg,w,{taper:.1,wobble:.6}),cov);
}
/** "looking": yellow sight lines from a head to world points (dashed), fading in with g */
function sightLines(s:Sheet,c:Cam,from:V3,targets:V3[],g:number){
 if(g<=.02)return;const a=pr(c,from);if(!a)return;const p=new Path2D();
 for(const T of targets){const b=pr(c,T);if(!b)continue;const e:Pt=[lerp(a[0],b[0],g),lerp(a[1],b[1],g)],gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);p.addPath(ribbon([a,e],Math.max(4,kAt(c,from)*.03),{taper:.2,wobble:.4,gaps}));}
 s.knockout(p,.85*g);s.fill(Y,p,.95*g);
}
/** 7-segment block digits (glyph box 1 × 2) for the score bug */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}
/** the TV score bug (top left): Germany's flag (navy/red/yellow), 0-0 (0-1 after the goal), Spain's flag, the minute */
function scoreBug(s:Sheet,g:number,goal:boolean,minute:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=380,h=112,panel=polyPath([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const fl=(fx:number,cols:[string,number][])=>{cols.forEach(([ink,cov],i)=>{const p=polyPath([[fx,y+16+i*14],[fx+54,y+16+i*14],[fx+54,y+30+i*14],[fx,y+30+i*14]],true);s.knockout(p,g);s.fill(ink,p,cov*g);});};
 fl(x+16,[[K,.4],[R,.95],[Y,.95]]);fl(x+w-70,[[R,.95],[Y,.95],[R,.95]]);
 const sc=new Path2D(),mn=new Path2D();glyphs(goal?'0-1':'0-0',x+118,y+14,28,sc);s.knockout(sc,g);if(minute>.02){glyphs('33',x+150,y+82-8*(1-minute),11,mn);s.knockout(mn,g*minute);s.fill(Y,mn,.95*g*minute);}
}
/** the TV replay badge (top left): a rewind mark; "slowly" → the second triangle gives way to three slow dots */
function replayBadge(s:Sheet,g:number,slow:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=190,h=96,panel=polyPath([[x,y],[x+w,y],[x+w-18,y+h],[x-18,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const tri=(cx:number,cov:number)=>{const p=polyPath([[cx+22,y+22],[cx+22,y+h-22],[cx-14,y+h/2]],true);s.knockout(p,cov);s.fill(Y,p,.95*cov);};
 tri(x+50,g);tri(x+100,g*(1-slow));
 if(slow>.02){const d=new Path2D();for(let i=0;i<3;i++){const cx=x+96+i*26,cy=y+h/2,r=7*easeOutBack(clamp(slow*1.4-i*.2));if(r>.5)d.addPath(polyPath(blob(cx,cy,r,r,i+3,{n:10}),true));}s.knockout(d,g);s.fill(Y,d,.95*g);}
}
/** Xavi's head (for sight lines) at τ */
const xaviHead=(tau:number):V3=>{const st=stateOf(XAV,tau),sk=solve(st.pose,B_XAV,st.place);return[sk.head[0],sk.head[1]+.05,sk.head[2]];};

// ---------------------------------------------------------------- 1 · live: the bowl at dusk, then the high main-stand camera, near real time
/** τ from chapter time: near real time (×0.8–1.15), anchored so Xavi's pass leaves on "rolls a perfect pass" and the ball crosses the line
 * close to "goal" */
function tau1(t:number){const tP=CUE(0,'rolls a perfect pass')+.2,tG=CUE(0,'goal')+.1,k=clamp(TG/Math.max(.5,tG-tP),.8,1.15);return Math.max(T0+.2,(t-tP)*k);}
const P1:V3=[-34,24,70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:[-50,26,78],T:[-60,26,-30],fov:62})],
  [CUE(0,'Euro final')-.1,1.8,()=>({P:P1,T:[-38,0,-4],fov:34})],
  [CUE(0,'Spain')-.2,1.2,()=>({P:P1,T:[-38,1,-2],fov:22})],
  [CUE(0,'Xavi looks')-.6,.9,()=>({P:P1,T:mix3(at(XAV,tau,.9),gnd(b,.3),.4),fov:9})],
  [CUE(0,'rolls')+.1,1.2,()=>({P:P1,T:mix3(gnd(b,1),at(TOR,tau,1),.45),fov:17})],
  [CUE(0,'Fernando')+.2,.9,()=>({P:P1,T:mix3(gnd(b,1),at(TOR,tau,1),.35),fov:13})],
  [CUE(0,'chips')-.2,.8,()=>({P:P1,T:[-7,1.2,3],fov:13})],
  [CUE(0,'goal')+.5,1.5,()=>({P:P1,T:mix3(at(TOR,tau,1.1),[-4,1,2],.3),fov:15})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'goal'),tR=CUE(0,'Spain'),tW=CUE(0,'Germany'),tX=CUE(0,'Xavi looks');
  stadium(s,c,t,{roar:sm(tG,tG+.5,t),flash:sm(tG-.1,tG+.3,t)*(1-sm(tG+2,tG+2.8,t))});
  ground(s,c);
  // "in red": red rings round Spain; "in white": paper rings round Germany
  teamRings(s,c,tau,'esp',sm(tR,tR+.3,tt,easeOutBack)*(1-sm(tW,tW+.4,tt)));
  teamRings(s,c,tau,'ger',sm(tW,tW+.3,tt,easeOutBack)*(1-sm(tX-.4,tX,tt)));
  // "Xavi looks up": a yellow ring on Xavi and sight lines up the pitch
  groundRing(s,c,gnd(at(XAV,tau)),1.1,Y,sm(tX-.1,tX+.3,tt,easeOutBack)*(1-sm(CUE(0,'rolls')+.3,CUE(0,'rolls')+.8,tt)),.1);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06),cap:t>SECS(0)-.7});
  sightLines(s,c,xaviHead(tau),[[TSPOT[0],.3,TSPOT[1]],at(TOR,tau,1.2)],sm(tX,tX+.5,tt)*(1-sm(CUE(0,'rolls')-.1,CUE(0,'rolls')+.3,tt)));
  // the TV score bug: 0-0 at 33 minutes, then 0-1
  scoreBug(s,sm(CUE(0,'Euro final')-.1,CUE(0,'Euro final')+.3,t,easeOut)*(1-sm(SECS(0)-.9,SECS(0)-.5,t)),tau>TG,sm(tR-.1,tR+.3,t,easeOutBack));
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'rolls')+.4;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low and close on Xavi: looking, one touch, the pass
const tau2=(t:number)=>key(t,mono([[0,-3.1],[CUE(1,'always looking'),-2.6],[CUE(1,'One touch'),AX-.15],[CUE(1,'weighted'),-.05],[CUE(1,'behind the defence'),.95],[SECS(1),TT-.05]]),linear);
const E2:V3=[-42.5,1.8,-7];
function cam2(t:number):Cam{
 const tau=tau2(t),x=at(XAV,tau,1.05),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:x,fov:26})],
  [CUE(1,'always')-.2,1,()=>({P:add3(E2,[.5,-.1,1.5]),T:add3(x,[0,.3,0]),fov:17})],
  [CUE(1,'One touch')-.3,.8,()=>({P:add3(E2,[1,-.3,2]),T:mix3(x,gnd(b,.4),.4),fov:19})],
  [CUE(1,'weighted')+.1,1.2,()=>({P:[-30,3.2,24],T:mix3(gnd(b,.8),[TSPOT[0],.8,TSPOT[1]],.35),fov:30})],
  [CUE(1,'behind')-.1,1,()=>({P:[-27,3.4,23],T:[-19,.9,10.6],fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tL=CUE(1,'always looking'),tO=CUE(1,'One touch'),tW=CUE(1,'weighted'),tB=CUE(1,'behind the defence');
  stadium(s,c,t,{roar:.2});
  ground(s,c);
  // "behind the defence": the space behind Lahm lights up (a red target ring where Torres will meet it)
  groundRing(s,c,[TSPOT[0],0,TSPOT[1]],1.6,R,sm(tB-.2,tB+.25,t,easeOutBack),.14);
  // "weighted just right": the pass path so far
  trail(s,c,-.02,tau,sm(tW-.1,tW+.2,t));
  const r=play(s,c,tau,tp,{smear:true,min:8,cap:t>SECS(1)-.7});
  // "always looking": sight lines from his eyes to the space and to Torres, while his head turns
  sightLines(s,c,xaviHead(tau),[[TSPOT[0],.3,TSPOT[1]],at(TOR,tau,1.3),at(SENNA,tau,1.2)],sm(tL,tL+.5,t)*(1-sm(tO-.3,tO+.1,t)));
  // "One touch": a spark and a ring on the ball at his touch
  const ot=(tt-tO)/.5;if(ot>0&&ot<1&&r.ball){sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:8,seed:17,g:easeOutBack(clamp(ot*2))*(1-clamp((ot-.5)*2)),width:Math.max(5,r.ball.r*.4)});}
  if(r.ball){const w=win(tt,tO-.1,tW-.1,.2);if(w>0){const rp=ribbon(ring(r.ball.g,r.ball.r*2,r.ball.r*2,26),Math.max(4,r.ball.r*.25),{close:true,taper:0,wobble:.6,seed:8});s.knockout(rp,.9*w);s.fill(Y,rp,.95*w);}}
  const tWa=CUE(1,'Watch again'),tSl=CUE(1,'slowly');replayBadge(s,sm(tWa-.1,tWa+.3,t,easeOut)*(1-sm(tL+.6,tL+1,t)),sm(tSl-.05,tSl+.4,t));
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(1,'weighted')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay from behind the goal: first to the ball, over Lehmann, champions
const tau3=(t:number)=>key(t,mono([[0,1.05],[CUE(2,'Torres gets there'),TT-.2],[CUE(2,'lifts it over'),TC-.05],[CUE(2,'Jens Lehmann'),TC+.45],[CUE(2,'champions'),TG+.5],[SECS(2),TG+2.4]]),linear);
const E3:V3=[10,6.2,-8];
function cam3v(t:number):Cam{
 const tau=tau3(t),w=at(TOR,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(w,[-16,1,9],.3),fov:24})],
  [CUE(2,'Torres gets')-.2,.9,()=>({P:E3,T:mix3(w,[CB[0],1,CB[1]],.3),fov:20})],
  [CUE(2,'lifts')-.2,.8,()=>({P:E3,T:[-7,2.2,3.5],fov:26})],
  [CUE(2,'Jens')+.2,.9,()=>({P:E3,T:[-2.5,1.3,.5],fov:30})],
  [CUE(2,'champions')-.1,1.6,()=>({P:[4,3.2,10],T:w,fov:18})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'Torres gets'),tU=CUE(2,'lifts'),tJ=CUE(2,'Jens'),tC=CUE(2,'champions');
  stadium(s,c,t,{roar:sm(TG,TG+.4,tau),flash:sm(tC-.1,tC+.3,t)});
  ground(s,c);
  // "gets there first": red ring on the ball's meeting spot, Lahm's chase line in navy
  groundRing(s,c,[TSPOT[0],0,TSPOT[1]],1.2,R,sm(tF-.15,tF+.2,t,easeOutBack)*(1-sm(tU-.2,tU+.2,t)),.12);
  const r=play(s,c,tau,tp,{smear:true,min:10,lines:true,prevBall:tau3(t-.06),cap:t>SECS(2)-.7});
  // "lifts it over": the chip's arc drawn over the keeper
  const lw=sm(TC-.02,TC+.05,tau)*(1-sm(TG+.6,TG+1.1,tau));
  if(lw>0){const pts:Pt[]=[];for(let i=0;i<=18;i++){const p=pr(c,ballAt(lerp(TC,Math.min(tau,TG),i/18)));if(p)pts.push(p);}if(pts.length>2){const w=Math.max(6,kAt(c,[CB[0],1,CB[1]])*.1);s.knockout(ribbon(pts,w*1.4,{taper:.9,pressure:.2,wobble:0}),lw);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*lw);}}
  // "Jens Lehmann": a ring round the keeper, beaten
  const nr=sm(tJ-.1,tJ+.25,t,easeOutBack)*(1-sm(tC-.3,tC+.2,t));if(nr>.02){const st=stateOf(GK,tau),sk=solve(st.pose,B_LEH,st.place),q=pr(c,sk.chest);if(q){const rr=kAt(c,sk.chest)*.9*nr,p=ribbon(ring(q,rr,rr*1.1),Math.max(5,rr*.07),{close:true,taper:0,wobble:.8});s.knockout(p,.9);s.fill(Y,p,.95);}}
  if(r.ball){const hit=(tau-TC)/.2;if(hit>0&&hit<1)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});}
  streaks(s,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3v(t),q=pr(c,at(TOR,tau3(twos(t)),1.2))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'lifts')+.3;},
};
/** the replay wipe as a chapter opens: long halftone strokes across the frame */
function streaks(s:Sheet,amt:number,seed:number){if(amt<=.02)return;const v=view(s),p=new Path2D(),r=rng(seed);
 for(let i=0;i<14;i++){const y=v.cy+(r()-.5)*2*v.hy,x0=v.cx+(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- 4 · the lesson: from behind Xavi at mid height — short passes, get it, give it, space
const tau4=(t:number)=>key(t,mono([[0,-4.6],[CUE(3,'keep the ball'),-4.2],[CUE(3,'short, simple'),-2.4],[CUE(3,'Get it'),AX-.05],[CUE(3,'give it'),.05],[CUE(3,'look for space'),1.2],[CUE(3,'control'),TT],[SECS(3),TT+.4]]),linear);
const E4:V3=[-48.5,3.8,-5.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),x=at(XAV,tau,1);
 return plan(t,[
  [0,0,()=>({P:E4,T:[-42,.6,-3],fov:30})],
  [CUE(3,'short')-.2,1,()=>({P:add3(E4,[1,-.4,1]),T:mix3(x,[-43,.5,-3],.5),fov:30})],
  [CUE(3,'Get it')-.3,.8,()=>({P:add3(E4,[5,-1.2,1]),T:mix3(x,[-30,.5,5],.2),fov:26})],
  [CUE(3,'look for')-.2,1,()=>({P:add3(E4,[6,.4,0]),T:[-25,.6,6.5],fov:34})],
  [CUE(3,'control')-.2,1,()=>({P:add3(E4,[3,2,-1]),T:[-30,.5,3],fov:44})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12),E=SECS(3);
  const tK=CUE(3,'keep the ball'),tS=CUE(3,'short'),tG=CUE(3,'Get it'),tV=CUE(3,'give it'),tL=CUE(3,'look for'),tC=CUE(3,'control');
  stadium(s,c,t,{roar:.25});
  ground(s,c);
  const end=1-sm(E-1,E-.5,t);
  // "keep the ball moving": the ball's path so far, a yellow trail from Fàbregas on
  trail(s,c,Math.max(PF,tau-2.2),tau,sm(tK-.1,tK+.3,t)*end,.12);
  // "short, simple passes": the two short lanes (Fàbregas → Senna → Xavi) as arrows
  const sp=sm(tS-.1,tS+.8,t)*end;
  if(sp>0){arrow3(s,c,[[FB[0],.05,FB[1]],[SN[0],.05,SN[1]]],Math.max(6,kAt(c,[SN[0],0,SN[1]])*.1),R,clamp(sp*2),.9);arrow3(s,c,[[SN[0],.05,SN[1]],[R0[0],.05,R0[1]]],Math.max(6,kAt(c,[R0[0],0,R0[1]])*.1),R,clamp(sp*2-.6),.9);}
  // "Get it": a yellow ring on his first touch; "give it": the through ball's arrow into the space
  groundRing(s,c,[R0[0],0,R0[1]],1,Y,sm(tG-.1,tG+.3,t,easeOutBack)*end,.1);
  const gv=sm(tV-.1,tV+.9,t,easeInOutSine)*end;if(gv>0)arrow3(s,c,[[XP[0],.05,XP[1]],[TSPOT[0],.05,TSPOT[1]]],Math.max(6,kAt(c,[XP[0],0,XP[1]])*.07),Y,gv);
  // "look for space": the gap behind Lahm pulses
  const ls=sm(tL-.15,tL+.3,t)*end;if(ls>0){const pulse=1+.12*Math.sin((t-tL)*7);groundRing(s,c,[TSPOT[0],0,TSPOT[1]],2.2*pulse*easeOutBack(clamp(ls)),R,ls,.14);}
  // "control the game": Spain's passing web — lines joining the Spanish players round the ball
  const cw=sm(tC-.1,tC+.5,t)*end;
  if(cw>0){const web=new Path2D(),idx=[FAB,SENNA,XAV,6,7,TOR];for(let i=0;i<idx.length;i++)for(let j=i+1;j<idx.length;j++){if(Math.abs(i-j)>2)continue;const a=pr(c,at(idx[i],tau,.05)),b=pr(c,at(idx[j],tau,.05));if(!a||!b)continue;const e:Pt=[lerp(a[0],b[0],cw),lerp(a[1],b[1],cw)];web.addPath(ribbon([a,e],6,{taper:0,wobble:.5,seed:i*7+j}));}
   s.knockout(web,.8*cw);s.fill(R,web,.85*cw);}
  play(s,c,tau,tp,{smear:true,min:8,cap:t>E-.7});
  sightLines(s,c,xaviHead(tau),[[TSPOT[0],.3,TSPOT[1]]],sm(tL,tL+.4,t)*end);
 },
 get still(){return CUE(3,'look for')+.3;},
};

const film:RisoStory={
 id:'xavi-signature',format:'11v11',title:'Xavi: the metronome pass',
 theme:'Keep the ball moving with short, simple passes, always look for space, and play the pass that controls the game',
 ageNote:'Germany 0–1 Spain, Euro 2008 final, Vienna, 29 June 2008. Xavi\'s through ball set up Fernando Torres in the 33rd minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a quick pass — a ball rolls in, a yellow touch spark, and it rolls away along a short lane. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.45),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-160*(1-easeOut(u)):x+230*easeOut(out),by=y;
  if(age>.25&&age<.6)sparkBurst(s,Y,x,y,110,{n:8,seed:seed+1,g:easeOutBack(clamp((age-.25)/.12))*(1-clamp((age-.45)/.15)),width:14});
  if(fade>0){if(age>.3)s.fill(Y,ribbon([[x,y+26],[bx,by+26]],10,{taper:.8,wobble:.5,seed}),.8*fade);europass(s,bx,by,28,age*12);}
 },
};
export default film;
/** Solved contact points (pitch metres; Germany's goal line x = 0, +z = Spain's right) — checked by tests/play-film-xavi-signature.cjs. */
export const FACTS={XP,TSPOT,CB,GP,TT,TC,TG,ballAt,passFoot:'r' as const,
 xaviContact:()=>{const st=stateOf(XAV,0),sk=solve(st.pose,B_XAV,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 torresContact:()=>{const st=stateOf(TOR,TC),sk=solve(st.pose,B_TOR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 chipOver:()=>{const [kx,kz]=posOf(GK,TC+.3);let best=1e9,h=0;for(let i=0;i<=200;i++){const b=ballAt(TC+(TG-TC)*i/200),d=Math.hypot(b[0]-kx,b[2]-kz);if(d<best){best=d;h=b[1];}}return{dist:best,height:h};},
 torresAhead:()=>{const t=posOf(TOR,TT),l=posOf(LAHM,TT);return t[0]-l[0];}};
