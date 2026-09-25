/** Iconic-play film · Dani Olmo, "Signature: finding the pocket of space" — Spain 2–1 Germany (after extra time), UEFA Euro 2024
 * quarter-final, Stuttgart Arena (MHPArena), Friday 5 July 2024 (18:00 local kick-off, a summer evening), the 51st minute: Lamine Yamal
 * cuts inside from the right with Tah and Raum backpedalling, rolls the ball across the face of the penalty area, and Olmo — arriving
 * from deeper, untracked — sweeps it first time past Manuel Neuer for 1–0.
 *
 * WHY THIS MOMENT: Olmo's signature (lib/town/iconicPlays.json, kind "signature", lesson "Stand between the other team's midfield and
 * defence, where nobody is marking you.") is a trait: the attacking midfielder who drifts into the space behind the opponents' midfield
 * where no one picks him up. The Germany goal is the written accounts' clearest picture of it: "Arriving from deeper, the timing of the run
 * as perfect as Lamine Yamal's pass" (Sid Lowe, the Guardian) and "nobody had tracked Dani Olmo's run" (Guardian live blog). He had come
 * on in the 8th minute for the injured Pedri and was named Man of the Match; Spain went on to win Euro 2024 and Olmo finished as one of the
 * tournament's joint top scorers (card country Spain, lib/town/playerAppearance.json; clubs Dinamo Zagreb, RB Leipzig 2020–24, Barcelona
 * from 2024, lib/town/playerCareers.json). The Euro 2024 semi-final v France belongs to the Yamal film and the final to other films, so
 * neither is used. The general "stand between the lines" idea is taught in chapter 3 as a clearly labelled "How he does it" demonstration
 * with plain duotone figures (no names, no numbers, no match) — the match chapters only stage what the accounts describe.
 *
 * SOURCES (fetched 24 Sep 2026 with curl, generic UA, ≥ 8 s apart, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2024 knockout stage" (raw; wiki-euro2024-knockout.txt, already cached): Spain vs Germany, 5 July 2024, 18:00,
 *    MHPArena Stuttgart, attendance 54,000, referee Anthony Taylor; goals Olmo 51', Wirtz 89', Merino 119'; Pedri off 8' → Olmo (10) on;
 *    Nacho on for Le Normand 46'; Andrich and Wirtz on for Can and Sané 46'; Raum off 57'; line-ups with numbers (Spain: Simón 23; Carvajal
 *    2, Nacho 4, Laporte 14, Cucurella 24; Rodri 16, Fabián Ruiz 8; Yamal 19, Olmo 10, Williams 17; Morata 7. Germany: Neuer 1; Kimmich 6,
 *    Rüdiger 2, Tah 4, Raum 3; Andrich 23, Kroos 8; Musiala 10, Gündoğan 21, Wirtz 17; Havertz 7); Man of the Match Dani Olmo; KITS from
 *    UEFA's line-up sheet: Spain red shirts, dark-blue shorts, red socks (_esp24h); Germany all white (_ger24h).
 *  - The Guardian, Sid Lowe, "Mikel Merino breaks hosts' hearts as Spain send Germany out of Euro 2024" (5 July 2024;
 *    guardian-esp-ger-2024-report.txt) https://www.theguardian.com/football/article/2024/jul/05/spain-germany-euro-2024-quarter-final-match-report
 *    — "Lamine Yamal slowed and set up Olmo, cool as you like. Arriving from deeper, the timing of the run as perfect as Lamine Yamal's
 *    pass, Olmo swept past Neuer"; "David Raum reluctant to be drawn too close"; Kroos's foul sent Pedri "limping off in tears".
 *  - The Guardian live blog, Barry Glendenning (guardian-esp-ger-2024-live.txt, -p2.txt) https://www.theguardian.com/football/live/2024/jul/05/spain-v-germany-euro-2024-quarter-final-live-score-updates
 *    — "GOAL! Spain 1-0 Germany (Olmo 50) … The ball's played down the inside right to Lamine Yamal, he cuts inside with Jonathan Tah and
 *    Raum backpedalling in front of him. The teenager then rolls a perfectly weighted ball across the face of the Germany penalty area. Dani
 *    Olmo's run was well timed and he swept the ball past Manuel Neuer without breaking stride."; "Both David Raum and Jonathan Tah allowed
 *    Yamal to play the ball across the face of their penalty area completely unopposed … nobody had tracked Dani Olmo's run"; captions
 *    "Dani Olmo sweeps a first time shot goalwards … And past Germany's keeper Manuel Neuer".
 * CONFIRMED: match, date, ground, kick-off, score and scorers; Olmo on for the injured Pedri in the 8th minute and Man of the Match; the
 *  build-up (ball played down the inside right to Yamal; Yamal cuts inside with Tah and Raum backpedalling; Yamal rolls the ball across the
 *  face of the box); Olmo's well-timed, untracked run from deeper; the FIRST-TIME finish "without breaking stride" past Neuer; shirt numbers
 *  (Olmo 10, Yamal 19, Neuer 1, Tah 4, Raum 3 …); the kits (Spain red / dark blue / red, Germany all white).
 * INFERRED (not in the accounts; nothing below is narrated): every position, path and timing in metres and seconds; who played the ball
 *  down the inside right (drawn as Carvajal); Yamal's LEFT foot for the roll across (his stronger foot); Olmo's RIGHT foot (his stronger
 *  foot), the low shot and the corner it went in (drawn low into the corner to Neuer's right, the far side from Yamal); Neuer's dive; Spain
 *  attacking left-to-right on the main camera with Yamal on the near side; the runs of Morata (near post, taking Rüdiger), Williams,
 *  Kimmich, Kroos and Andrich; Olmo's celebration run toward the near touchline; Neuer's goalkeeper kit colour (drawn blue); Spain's yellow
 *  numbers and trim, Germany's navy numbers and trim; hair and skin tones; the ball design (white with navy and red panels); the Stuttgart
 *  Arena drawn as a two-tier bowl under a pale membrane roof ring, open to a summer-evening sky; crowd colours; camera placements and
 *  lenses; no referee drawn. The whole of chapter 3 is a demonstration, not the match.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds; τ = 0 Yamal receives down the inside right): ch1 = the high main-stand broadcast camera, live (the pass to Yamal, the cut inside,
 * the roll across, Olmo's run, the first-time finish, the net, the celebration); ch2 = the TV slow-motion replay, low from behind Olmo's
 * left shoulder (his run from deep past Germany's midfield, Yamal drawing Tah and Raum, the untracked arrival, the sweep without breaking
 * stride); ch3 = "How he does it", a duotone demonstration on a navy stage (the pocket between a midfield line and a back line, a player
 * stepping into it, nobody marking him, the pass finding him). Seams are forward passages into the ball. Contact reads the solved
 * skeleton's RIGHT toe so ball and boot always meet. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world
 * centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square window. Inks: yellow (light, grass with blue, Spain
 * trim), red (Spain, skin), blue (sky, grass), navy (key line, shorts). Scenes read only their local t; poses on twos, cameras on ones;
 * all randomness is seeded. Budget ≈ 150–260 plate ops per frame (small wide-shot figures print at 'low').
 *
 * Narration text: public/plays/narration/dani-olmo-signature/script.json. The lead voices it later with local Kokoro; until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes. Every cue starts with a plain word.
 * LEAD: when public/plays/narration/dani-olmo-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/dani-olmo-signature/timing.json';   (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,blendPose,runCycle,stand,strike,dribble,backpedal,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() (aperture() reuses the last value) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`olmo film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py dani-olmo-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/dani-olmo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Stuttgart, live','Stuttgart, 2024. Spain, in red, play Germany, in white, in the Euro quarter-final. Dani Olmo came on for injured Pedri. Yamal cuts inside and rolls it across. Nobody follows Olmo. First time... past Neuer! Goal!',
  ['Stuttgart','Spain, in red','Germany, in white','Dani Olmo','injured Pedri','Yamal cuts inside','rolls it across','Nobody follows Olmo','First time','past Neuer','Goal']),
 prov('Watch again',"Watch again, slowly. Olmo runs from deep, behind Germany's midfield. Yamal pulls two defenders. Olmo arrives unmarked and sweeps it in without breaking stride.",
  ['Watch again','slowly','Olmo runs from deep','behind Germany','Yamal pulls','two defenders','Olmo arrives unmarked','sweeps it in','without breaking stride']),
 prov('How he does it',"How he does it: find the pocket. Stand between the other team's midfield and defence, where nobody is marking you.",
  ['How he does it','find the pocket','Stand between','midfield','defence','nobody is marking you']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`olmo film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
/** a camera from position, look point and focal length F (sheet units; widened by LENS for a square window) */
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/(F*LENS))/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** a projected polyline on the grass between ground points (drops points behind the camera) */
function groundPts(c:Camera,pts:[number,number][]):Pt[]{const o:Pt[]=[];for(const[x,z] of pts){const p:V3=[x,.03,z];if(depthOf(c,p)>NEAR)o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}
/** a yellow arrow on the grass through ground points, drawn to fraction u */
function groundArrow(s:Sheet,c:Camera,pts:[number,number][],u:number,wm=.13,cov=.95){if(u<=.02)return;const n=pts.length-1,out:[number,number][]=[];const L=u*n;for(let i=0;i<=Math.floor(L);i++)out.push(pts[i]);if(L<n){const i=Math.floor(L),f=L-i;out.push([lerp(pts[i][0],pts[i+1][0],f),lerp(pts[i][1],pts[i+1][1],f)]);}
 const q=groundPts(c,out);if(q.length<2)return;const e=out[out.length-1],w=Math.max(6,wm*kAt(c,[e[0],0,e[1]]));yInk(s,ribbon(q,w,{taper:.1,wobble:.8}),cov);yInk(s,head(q,w),cov);}

// ================= Stuttgart: a two-tier bowl under a pale membrane roof ring, open to a summer-evening sky =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-118,.9,-38],[14,.9,-38],[14,30,-64],[-118,30,-64]],// far side (across from the TV camera)
 [[9,.9,46],[9,.9,-46],[36,30,-46],[36,30,46]],// behind the goal Spain attack
 [[14,.9,38],[-118,.9,38],[-118,30,64],[14,30,64]],// the main stand under the camera
 [[-114,.9,-46],[-114,.9,46],[-141,30,46],[-141,30,-46]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red / 2 yellow / 3 blue / 4 navy, phase] — Germany's white and black, Spain's red and yellow */
const CROWD=(()=>{const r=rng(705),out:[number,number,number,number,number][]=[];[760,340,620,340].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.03+r()*.93;if(Math.abs(v-.5)<.04)continue;out.push([st,r(),v,c<.4?0:c<.58?4:c<.8?1:c<.9?2:3,r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a 18:00 July sky: pale blue, a warm band low down
 s.field(B,.34,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.tone(Y,polyPath([[-Bnd,hz-220],[Bnd,hz-220],[Bnd,hz+400],[-Bnd,hz+400]],true),.16);
 // two tiers: knocked out, a navy-grey screen, rows; one light fascia band between the tiers; the pale membrane roof with its navy edge
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),roofEdge=new Path2D(),fascia=new Path2D(),leds=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<16;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/16),bil(q,1,k/16),bil(q,1,(k+1)/16),bil(q,0,(k+1)/16)]));
  const lift:V3=[0,3.5,0],over=(si===0?[0,0,24]:si===2?[0,0,-24]:si===1?[-22,0,0]:[22,0,0]) as V3;
  const r0=add(q[3],lift),r1=add(q[2],lift),r2=add(r1,over),r3=add(r0,over);addPoly(roof,clipPoly(c,[r0,r1,r2,r3]));
  const e:V3=[over[0]*.06,0,over[2]*.06];addPoly(roofEdge,clipPoly(c,[add(r3,[-e[0],-.8,-e[2]]),add(r2,[-e[0],-.8,-e[2]]),r2,r3]));
  addPoly(fascia,clipPoly(c,[bil(q,0,.47),bil(q,1,.47),bil(q,1,.53),bil(q,0,.53)]));addPoly(leds,clipPoly(c,[bil(q,0,.49),bil(q,1,.49),bil(q,1,.51),bil(q,0,.51)]));});
 s.knockout(stands);s.tone(K,stands,.38);s.tone(B,stands,.18);s.tone(K,rows,.16);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(K,heads[4],.9);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.tone(K,fascia,.45);s.fill(Y,leds,.7);s.knockout(roof,.95);s.tone(B,roof,.12);s.fill(K,roofEdge,.85);
 // LED boards along the touchlines and behind the goal
 const bB=new Path2D(),bP=new Path2D();for(const z of[-35.4,35.4])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(B,bB,.9);s.fill(R,bP,.8);
 // grass: yellow × blue = green, mowing stripes, paper lines (the box, the D, the six-yard box, the spot)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[5,0,-35],[5,0,35],[-110,0,35]]));s.knockout(gp);yInk(s,gp,.9);s.tone(B,gp,.58);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net);
}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (2024: white with navy panels and a red accent — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3;pan.addPath(ribbon([[Math.cos(a)*r*.15,Math.sin(a)*r*.15],[Math.cos(a+.7)*r*.6,Math.sin(a+.7)*r*.6],[Math.cos(a+1.3)*r*1.05,Math.sin(a+1.3)*r*1.05]],Math.max(2,r*.2),{taper:.4,wobble:0}));}
 const aa=spin*.8+1;acc.addPath(ribbon([[Math.cos(aa)*r*.2,Math.sin(aa)*r*.2],[Math.cos(aa+.9)*r*.5,Math.sin(aa+.9)*r*.5]],Math.max(2,r*.14),{taper:.6,wobble:0}));
 s.fill(K,pan,.9);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (5 July 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Spain: red shirts, dark-blue shorts, red socks (confirmed); yellow numbers and trim (inferred) */
const ESP=(n:number,o:Partial<Kit>={}):Kit=>({shirt:R,shorts:[K,.9],socks:R,trim:Y,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:40+n,...o});
/** Germany: all white (confirmed); navy trim and numbers (inferred) */
const GER=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:'paper',socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:60+n,...o});
const OLMO:Kit=ESP(10,{skin:SKIN_L,hair:[K,.88],hairStyle:'short',build:{height:1.79,bulk:.95},seed:10});
const YAMAL:Kit=ESP(19,{skin:SKIN_D,hair:[K,.92],hairStyle:'short',build:{height:1.8,bulk:.86,thighs:.94,head:1.02},seed:19});
const NEUER:Kit={shirt:[B,.85],shorts:[K,.85],socks:[B,.85],trim:K,boots:K,skin:SKIN_L,hair:[Y,.55],hairStyle:'short',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.93,bulk:1.05},seed:1};
/** duotone versions for the demonstration (navy + yellow only, no numbers: plain figures, not named players) */
const DEMO_US:Kit={shirt:[Y,.6],shorts:[K,.32],socks:[Y,.6],trim:K,boots:K,skin:[[Y,.35]],hair:K,hairStyle:'short',line:K,shade:[K,.2],sleeves:'short',seed:301};
const DEMO_HERO:Kit={...DEMO_US,shirt:[K,.45],shorts:'paper',socks:'paper',trim:'paper',skin:[[Y,.6],[K,.2]],hair:[K,.9],seed:310};
const DEMO_THEM:Kit={...DEMO_US,shirt:'paper',shorts:'paper',socks:'paper',skin:[[Y,.3]],shade:[K,.3],seed:320};

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Yamal receives down the inside right) =================
const OB_:Build=OLMO.build!;
/** CPASS: the ball down the inside right; PASS: Yamal rolls it across; CONTACT: Olmo's first-time finish (all inferred timings) */
const CPASS=-1.3,PASS=2.2,CONTACT=3.15,TF=.58,T_GOAL=CONTACT+TF;
/** OC: where Olmo meets the ball (≈ 13.6 m out, just left of centre); HIT: low into the corner to Neuer's right */
const OC:[number,number]=[-13.6,-1.1],HIT:V3=[0,.32,-2.95];
const D1:V3=[1.2,.34,-2.75],D2:V3=[1.75,.11,-2.45],NET_HIT:V3=[2,.4,-2.8];
/** the body square to the shot at contact */
const OS=YAW(HIT[0]-OC[0],HIT[2]-OC[1])+6*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.85}),OB_,{yaw:OS});
const OP:[number,number]=[OC[0]-SHOT_SK.rToe[0],OC[1]-SHOT_SK.rToe[2]];
const [ofx,ofz]=dirOf(YAW(OC[0]-(-24.6),OC[1]-(-2.3)));

type Role='hero'|'yam'|'esp'|'ger'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Olmo',role:'hero',style:OLMO,key:true,keys:[[-10,-41,-6.5],[-5,-35,-5],[-2,-30.6,-3.6],[0,-27.6,-2.9],[1.3,-24.6,-2.3],[CONTACT,OP[0],OP[1]],[CONTACT+.5,OP[0]+ofx*2.9,OP[1]+ofz*2.9],[T_GOAL+.5,OP[0]+ofx*5.2,OP[1]+ofz*5.2+.6],[T_GOAL+1.6,-7.6,4.5],[T_GOAL+3.2,-8.2,12.5],[T_GOAL+5,-9,17.5]]},
 {name:'Yamal',role:'yam',style:YAMAL,key:true,keys:[[-10,-38,18.5],[-4,-31.5,16.8],[CPASS,-28.6,15.8],[0,-26.2,14.8],[.8,-24.4,13.3],[1.6,-22.2,11.1],[PASS,-20.8,9.9],[2.8,-20,9.3],[4,-19.2,8.8],[T_GOAL+1.2,-16.6,9.4],[T_GOAL+3.2,-11.5,13.5],[T_GOAL+5,-10,16.6]]},
 {name:'Neuer',role:'gk',style:NEUER,key:true,keys:[[-10,-3.2,2.2],[0,-2.7,2.6],[PASS,-2.3,1.1],[CONTACT,-2.1,.1],[8,-2.1,.1]]},
 {name:'Tah',role:'ger',style:GER(4,{skin:SKIN_D,build:{height:1.95,bulk:1.08}}),key:true,keys:[[-10,-19,1.5],[0,-16.2,3.6],[1.2,-15.4,5],[PASS,-14.6,5.8],[CONTACT,-13.2,4.2],[T_GOAL+1,-11.5,2.5],[8,-11,2]]},
 {name:'Raum',role:'ger',style:GER(3,{hair:[Y,.5],build:{height:1.8}}),key:true,keys:[[-10,-24,16],[0,-18.6,12.4],[1.2,-17,11.2],[PASS,-16,10.4],[CONTACT,-15.2,9.3],[T_GOAL+1,-14,8],[8,-13.5,8]]},
 {name:'Carvajal',role:'esp',style:ESP(2,{hair:[K,.85]}),keys:[[-10,-45,23.5],[-3,-37.5,22],[CPASS,-35.2,21.6],[1,-31,21],[4,-24.5,19.2],[8,-21,18]]},
 {name:'Morata',role:'esp',style:ESP(7,{hair:[K,.8],build:{height:1.89}}),keys:[[-10,-24,1],[0,-17.2,1.4],[1.4,-14.6,2.2],[CONTACT,-9.6,2.6],[T_GOAL+1,-8.4,3.6],[8,-8,5]]},
 {name:'Rüdiger',role:'ger',style:GER(2,{skin:SKIN_D,build:{height:1.9,bulk:1.1}}),keys:[[-10,-19,-5],[0,-15.6,-3.8],[1.4,-13.6,-1.4],[CONTACT,-9.8,1.1],[T_GOAL+1,-8.8,1],[8,-8.5,1]]},
 {name:'Williams',role:'esp',style:ESP(17,{skin:SKIN_D,hair:[K,.9]}),keys:[[-10,-26,-19],[0,-18.5,-16],[CONTACT,-12.6,-12],[8,-11,-9]]},
 {name:'Kimmich',role:'ger',style:GER(6,{hair:[Y,.45],build:{height:1.77}}),keys:[[-10,-22,-15],[0,-16.8,-13.4],[CONTACT,-12.2,-10.4],[8,-11,-9]]},
 {name:'Andrich',role:'ger',style:GER(23,{hair:[K,.3],hairStyle:'balding',build:{height:1.87,bulk:1.05}}),keys:[[-10,-30,-6],[0,-23.4,-4.2],[1.6,-22.4,-1.2],[CONTACT,-20.6,.8],[8,-18,2]]},
 {name:'Kroos',role:'ger',style:GER(8,{hair:[Y,.5],build:{height:1.83}}),keys:[[-10,-31,7],[0,-24.8,6.4],[1.6,-23.6,7.6],[CONTACT,-22.6,7.2],[8,-21,6]]},
 {name:'Fabián',role:'esp',style:ESP(8,{hair:[K,.85]}),keys:[[-10,-40,-3],[0,-32.5,-7],[CONTACT,-26,-5.5],[8,-22,-4]]},
 {name:'Gündoğan',role:'ger',style:GER(21,{skin:SKIN_M}),keys:[[-10,-35,12],[0,-29.5,10.5],[CONTACT,-26.8,8.8],[8,-24,7]]},
 {name:'Wirtz',role:'ger',style:GER(17,{hair:[R,.5]}),keys:[[-10,-40,17],[0,-33.6,18.6],[CONTACT,-30,17],[8,-27,15]]},
 {name:'Musiala',role:'ger',style:GER(10,{skin:SKIN_D}),keys:[[-10,-38,-10],[0,-33,-9],[CONTACT,-29,-7],[8,-26,-6]]},
 {name:'Rodri',role:'esp',style:ESP(16,{hair:[K,.85],build:{height:1.91}}),keys:[[-10,-47,4],[0,-40,3],[CONTACT,-36,2],[8,-32,2]]},
 {name:'Cucurella',role:'esp',style:ESP(24,{hairStyle:'curly',hair:[K,.75]}),keys:[[-10,-45,-24],[CONTACT,-36,-22]]},
 {name:'Havertz',role:'ger',style:GER(7,{build:{height:1.93}}),keys:[[-10,-47,-2],[CONTACT,-42,-1]]},
];
const OLM=0,YAM=1,GK=2,TAH=3,RAUM=4,CARV=5,MOR=6;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---- the ball: Carvajal carries it → down the inside right to Yamal → Yamal's cut inside → rolled across → Olmo first time → net ----
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const CB=fwdBall(CARV,CPASS,.45),Y0=fwdBall(YAM,0,.55),BP=fwdBall(YAM,PASS,.55);
function ballAt(tau:number):V3{
 if(tau<CPASS){const f=fwdBall(CARV,tau,.45+.12*Math.sin(tau*5));return[f[0],.11,f[1]];}
 if(tau<0){const u=(tau-CPASS)/-CPASS,e=1.45*u-.45*u*u;return[lerp(CB[0],Y0[0],e),.11,lerp(CB[1],Y0[1],e)];}
 if(tau<PASS){const f=fwdBall(YAM,tau,.55+.14*Math.sin(tau*7.5));return[f[0],.11,f[1]];}
 if(tau<CONTACT){const u=(tau-PASS)/(CONTACT-PASS),e=1.3*u-.3*u*u;return[lerp(BP[0],OC[0],e),.11,lerp(BP[1],OC[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return[lerp(OC[0],HIT[0],u),lerp(.11,HIT[1],u)+.28*Math.sin(Math.PI*u),lerp(OC[1],HIT[2],u)];}
 const e=s-TF;if(e<.14)return mix3(HIT,D1,easeOut(e/.14));
 const d=clamp((e-.14)/.45),h=D1[1]*(1-d*d)+.11*d*d;return[lerp(D1[0],D2[0],d),Math.max(.11,h)+(d>=1?.06*Math.abs(Math.sin((e-.59)*8))*Math.exp(-(e-.59)*3):0),lerp(D1[2],D2[2],d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
const RECEIVE:Partial<Pose>={lean:12,lHipF:26,lKnee:34,lAnk:-12,rKnee:30,lShA:40,rShA:36,lElb:40,rElb:40,neckP:30};
const ARMS_UP:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** the first-time strike, quick (no set-up touch) */
const SD=.62,S_START=CONTACT-STRIKE_CONTACT*SD;
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  // the run from deep (a sprint), the first-time strike without breaking stride, then the airplane-arms celebration run
  p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.4,{speed:clamp(sp/7.5)}),clamp(sp/1.1));
  if(sp<.6)yaw=toBall;else if(tau>-.5&&tau<CONTACT)yaw=lerpAng(YAW(v[0],v[1]),toBall,.25);
  const u=(tau-S_START)/SD;if(u>-.2&&u<1.5){yaw=lerpAng(yaw,OS,sm(-.2,.2,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.85}),Math.min(sm(-.15,.1,u),1-sm(1.05,1.5,u)));}
  if(tau>T_GOAL+.3)p=blendPose(p,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.3,T_GOAL+.9,tau));
 }else if(a.role==='yam'){
  if(tau<-.4){p=blendPose(idle(tau,2),runCycle(distOf(k,tau)/3.1,{speed:clamp(sp/7)}),clamp(sp/1.1));}
  else if(tau<PASS+.6){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.35+.3*clamp(sp/4)});p=blendPose(READY,dr,clamp(sp/.9));
   p=over(p,RECEIVE,Math.max(0,1-Math.abs(tau)/.45));
   const u=(tau-(PASS-STRIKE_CONTACT*.7))/.7;if(u>-.1&&u<1.4){yaw=lerpAng(yaw,YAW(OC[0]-BP[0],OC[1]-BP[1])+20*D2R,sm(-.1,.2,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.4}),Math.min(sm(-.1,.12,u),1-sm(1,1.4,u)));}}
  else{p=blendPose(idle(tau,2),runCycle(distOf(k,tau)/3.1,{speed:clamp(sp/7)}),clamp(sp/1.1));if(sp<.6)yaw=toBall;}
  if(tau>T_GOAL+.4)p=over(p,ARMS_UP,sm(T_GOAL+.4,T_GOAL+.9,tau));
 }else if(a.role==='gk'){
  yaw=toBall;const q=keeperSet(tau*1.5),dAt=T_GOAL-.12,dd=.9,t0=dAt-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'r',height:.2}):q;if(u>0)yaw=YAW(1,0)+Math.PI;
 }else{
  const ger=a.role==='ger',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(ger&&sp>.4&&sp<4.2&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(ger?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  // Tah and Raum face Yamal as they backpedal (he draws them)
  if((k===TAH||k===RAUM)&&tau<CONTACT){const y=posOf(YAM,tau);yaw=YAW(y[0]-x,y[1]-z);}
  if(k===CARV){const u=(tau-(CPASS-STRIKE_CONTACT*.8))/.8;if(u>0&&u<1.3){p=blendPose(p,strike(Math.min(1,u),{power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));yaw=YAW(Y0[0]-CB[0],Y0[1]-CB[1]);}}
  if(a.role==='esp'&&tau>T_GOAL+.5)p=over(p,ARMS_UP,sm(T_GOAL+.5,T_GOAL+1,tau)*(k===MOR?1:.6));
  if(ger&&tau>T_GOAL+.4)p=over(p,{lean:34,neckP:34,lShA:10,rShA:10},sm(T_GOAL+.4,T_GOAL+1.2,tau)*.8);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Olmo with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===OLM?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==OLM&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==OLM&&hPx<150)?'low':o.cap?'mid':undefined;
  const hero=k===OLM&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02){const pts:Pt[]=Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r*1.6,q[1]+Math.sin(i/24*TAU)*r*1.6] as Pt);yInk(s,ribbon(pts,Math.max(3,r*.3*o.glow),{close:true,taper:0,wobble:.6}));}
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, highlights) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** a knocked-out "empty space" pool round a ground point: paper light with a yellow screen (reads as open grass) */
function spacePool(s:Sheet,c:Camera,x:number,z:number,r:number,w:number){if(w<=.02)return;const g=groundRing(c,x,z,r*w,36);if(g.length<3)return;const p=polyPath(g,true);s.knockout(p,.35*w);s.tone(Y,p,.35*w);}
/** a navy tether on the grass from a defender to the man he is drawn to */
function tether(s:Sheet,c:Camera,a:[number,number],b:[number,number],u:number){if(u<=.02)return;const q=groundPts(c,[a,[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]]);if(q.length<2)return;const gaps:[number,number][]=[];for(let x=.08;x<1;x+=.16)gaps.push([x,x+.07]);s.fill(K,ribbon(q,Math.max(4,.08*kAt(c,[a[0],0,a[1]])),{taper:0,wobble:.5,gaps}),.9);}

// ================= chapter 1 (live): the high main-stand camera; down the inside right, the cut inside, the roll across, the finish =================
const ch1q=()=>({st:T(0,'Stuttgart'),sp:T(0,'Spain, in red'),ge:T(0,'Germany, in white'),dol:T(0,'Dani Olmo'),ip:T(0,'injured Pedri'),ly:T(0,'Yamal cuts inside'),ra:T(0,'rolls it across'),nf:T(0,'Nobody follows Olmo'),ft:T(0,'First time'),pn:T(0,'past Neuer'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: the pre-roll is Spain on the ball, the play runs at 0.6–1.3× real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-8.5],[q.ly,-.3],[q.ra,PASS-.1],[q.nf,PASS+.5],[q.ft,CONTACT],[q.pn,T_GOAL-.1],[q.g,T_GOAL+.5],[q.end,T_GOAL+.5+(q.end-q.g)*.95]]),x=>x);};
const BCAM:V3=[-17,20,54];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),o=posOf(OLM,tau);
 // the build-up frames ball and Olmo together (his run is the story); the finish follows the ball to goal; then Olmo's celebration
 if(tau<CONTACT){const w=tau<PASS?.4:lerp(.4,.2,sm(PASS,CONTACT,tau));return[lerp(b[0],o[0],w)+1.5,1,lerp(b[2],o[1],w)];}
 if(tau<T_GOAL+.6)return mix3([b[0],1.1,b[2]],[-5,1.1,-1],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-5,1.1,-1],[o[0],1.1,o[1]],sm(T_GOAL+.6,T_GOAL+2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-30,9,-44],look=mix3(wide,av(ch1Look),sm(q.sp-.4,q.dol,t,easeInOutSine));
 const F=key(t,mono([[0,1600],[q.sp,2800],[q.dol,4000],[q.ly,4700],[q.ra,4900],[q.ft,5300],[q.pn,5200],[q.g+.4,4800],[q.end,5200]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // team rings: red for Spain on "Spain, in red", navy for Germany on "Germany, in white"; yellow for Olmo, then for Yamal
  const ra=sm(q.sp,q.sp+.3,tt,easeOutBack)*(1-sm(q.ge+.2,q.ge+.8,tt)),rg=sm(q.ge,q.ge+.3,tt,easeOutBack)*(1-sm(q.dol,q.dol+.6,tt)),ro=sm(q.dol,q.dol+.3,tt,easeOutBack)*(1-sm(q.ly,q.ly+.5,tt)),ry=sm(q.ly,q.ly+.3,tt,easeOutBack)*(1-sm(q.ra+.3,q.ra+.9,tt));
  const rn=sm(q.nf,q.nf+.3,tt,easeOutBack)*(1-sm(q.ft,q.ft+.4,tt)),rk=sm(q.pn,q.pn+.25,tt,easeOutBack)*(1-sm(q.g,q.g+.5,tt));
  if(ra>.02||rg>.02||ro>.02||ry>.02||rn>.02||rk>.02){const pa=new Path2D(),pg=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='esp'||a.role==='hero'||a.role==='yam')&&ra>.02)ringAt(pa,c,k,tp,ra);if((a.role==='ger'||a.role==='gk')&&rg>.02)ringAt(pg,c,k,tp,rg);});
   if(ro>.02)ringAt(py,c,OLM,tp,ro*1.25);if(ry>.02)ringAt(py,c,YAM,tp,ry*1.2);if(rn>.02)ringAt(py,c,OLM,tp,rn*1.25);if(rk>.02)ringAt(pg,c,GK,tp,rk*1.1);
   s.fill(R,pa,.95);s.fill(K,pg,.9);yInk(s,py,.95);}
  // "Nobody follows Olmo": the open grass round him prints light for a beat
  const nf=sm(q.nf-.1,q.nf+.3,tt)*(1-sm(q.ft,q.ft+.3,tt));if(nf>.02){const o=posOf(OLM,tp);spacePool(s,c,o[0]+1.5,o[1],4.2,nf);}
  // "Yamal cuts inside": his carry as a yellow arrow on the grass; "rolls it across": the pass line ahead of the ball, dashed
  const ci=sm(q.ly+.2,q.ly+1,tt,easeOut)*(1-sm(q.ra+.3,q.ra+.8,tt));if(ci>.02){const pts:[number,number][]=[];for(let i=0;i<=8;i++)pts.push(fwdBall(YAM,lerp(.1,PASS,i/8),.2));groundArrow(s,c,pts,ci,.13);}
  const rl=sm(q.ra-.1,q.ra+.4,tt,easeOut)*(1-sm(q.ft,q.ft+.4,tt));if(rl>.02){const q2=groundPts(c,[BP,[lerp(BP[0],OC[0],rl),lerp(BP[1],OC[1],rl)]]);if(q2.length>1){const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.06]);const w=Math.max(6,.12*kAt(c,[OC[0],0,OC[1]]));yInk(s,ribbon(q2,w,{taper:0,wobble:.6,gaps}),.95);yInk(s,head(q2,w),.95);}}
  drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
  // "injured Pedri": the substitution board's up-arrow over Olmo (he came on for Pedri)
  const ip=sm(q.ip-.1,q.ip+.3,tt,easeOutBack)*(1-sm(q.ly-.2,q.ly+.3,tt));if(ip>.02){const o=posOf(OLM,tp),top:V3=[o[0],2.6,o[1]];if(depthOf(c,top)>NEAR){const p=P(c,top),k=kAt(c,top),h=Math.max(30,.9*k)*ip,w=Math.max(8,.18*k);const shaft:Pt[]=[[p[0],p[1]],[p[0],p[1]-h]];yInk(s,ribbon(shaft,w,{taper:0,wobble:.4}),.95);yInk(s,head(shaft,w),.95);}}
  // "First time": a spark off the right boot
  if(tp>=CONTACT&&tp<CONTACT+.25){const b=P(c,[OC[0],.2,OC[1]]);sparkBurst(s,Y,b[0],b[1],70+60*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9});}},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10.5,
};

// ================= chapter 2 (TV replay, slow motion, low behind Olmo's left shoulder): the run from deep, Yamal draws two, the sweep =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),or:T(1,'Olmo runs from deep'),sp:T(1,'behind Germany'),yp:T(1,'Yamal pulls'),td:T(1,'two defenders'),oa:T(1,'Olmo arrives unmarked'),si:T(1,'sweeps it in'),wb:T(1,'without breaking stride'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-1.3],[q.sl,-.9],[q.or,-.2],[q.sp,.6],[q.yp,1.2],[q.td,1.7],[q.oa,PASS+.35],[q.si,CONTACT],[q.wb,CONTACT+.3],[q.end,T_GOAL+.25]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),o=posOf(OLM,Math.min(tau,CONTACT+.3)),b=ballAt(Math.min(tau,T_GOAL)),fin=sm(q.oa,q.si+.4,t,easeInOutSine);
 // behind his left shoulder, low; frames Olmo, Yamal's carry and the goal; at the finish it swings to look along the shot
 const pos:V3=[o[0]-5.2-1.5*fin,3.4+.3*fin,o[1]-5.6+1.5*fin];
 const look0:V3=[lerp(o[0],-19,.55)+2,.9,lerp(o[1],10,.45)],look1:V3=[lerp(b[0],-4,.4),.8,lerp(b[2],-1.5,.4)];
 const F=key(t,mono([[0,1050],[q.or,1150],[q.yp,1100],[q.oa,1300],[q.si,1550],[q.wb,1600],[q.end,1650]]));return cam(pos,mix3(look0,look1,fin),F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.5,goalIn),flash:.05+sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Olmo runs from deep": his run as a yellow arrow on the grass from where he started to where he meets the ball
  const orr=sm(q.or-.1,q.or+.8,tt,easeOut)*(1-sm(q.si,q.si+.5,tt));if(orr>.02){const pts:[number,number][]=[];for(let i=0;i<=10;i++){const p=posOf(OLM,lerp(-1.3,CONTACT,i/10));pts.push([p[0],p[1]]);}groundArrow(s,c,pts,orr,.09,.85);}
  // "behind Germany's midfield": the empty grass behind Germany's midfield prints light
  const sp=sm(q.sp-.1,q.sp+.4,tt)*(1-sm(q.oa+.3,q.oa+.9,tt));spacePool(s,c,-17.5,-1.6,3.6,sp);
  // "Yamal pulls" / "two defenders": a ring on Yamal, navy tethers from Tah and Raum to him
  const yp=sm(q.yp-.1,q.yp+.3,tt,easeOutBack)*(1-sm(q.oa,q.oa+.5,tt)),td=sm(q.td-.1,q.td+.5,tt)*(1-sm(q.oa,q.oa+.5,tt));
  if(td>.02){const y=posOf(YAM,tp);tether(s,c,posOf(TAH,tp),y,td);tether(s,c,posOf(RAUM,tp),y,td);const pg=new Path2D();ringAt(pg,c,TAH,tp,td);ringAt(pg,c,RAUM,tp,td);s.fill(K,pg,.9);}
  if(yp>.02){const py=new Path2D();ringAt(py,c,YAM,tp,yp*1.2);yInk(s,py,.95);}
  // "Olmo arrives unmarked": a yellow ring round him
  const oa=sm(q.oa-.1,q.oa+.3,tt,easeOutBack)*(1-sm(q.wb,q.wb+.5,tt));if(oa>.02){const po=new Path2D();ringAt(po,c,OLM,tp,oa*1.3);yInk(s,po,.95);}
  const w=drawWorld(s,c,tau,tp,{ballMin:18,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.or-.2,q.or+.2,tt)),cap:t>q.end-.7||t<.6});
  // "sweeps it in": the spark and speed lines; "without breaking stride": his next strides ahead as yellow footprints
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[OC[0],.15,OC[1]]);sparkBurst(s,Y,p[0],p[1],100+90*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:10,seed:14,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:12});}
  if(tp>=CONTACT&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:140,width:6,cov:.8});}
  const wb=sm(q.wb-.1,q.wb+.5,tt)*(1-sm(q.end-.6,q.end-.2,tt));if(wb>.02){const fp=new Path2D();for(let i=1;i<=4;i++){if(i/4>wb+.01)break;const d=.9*i,side=(i&1)?.18:-.18,px=OP[0]+ofx*d-ofz*side,pz=OP[1]+ofz*d+ofx*side,g=groundRing(c,px,pz,.2,10);if(g.length>2)fp.addPath(polyPath(g,true));}yInk(s,fp,.95);}},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 ("How he does it", a duotone demonstration — not the match): the pocket between the lines =================
/** demo world (pitch metres, attacking +x): a passer, a midfield line of three, a back line of four, and the player who finds the pocket */
const DM_X=-26.5,DF_X=-15.5,PK:[number,number]=[-21,-4.6],PASSER:[number,number]=[-33.5,-1.5];
const DEMO:{style:Kit;hero?:boolean;keys:number[][]}[]=[
 {style:DEMO_HERO,hero:true,keys:[[0,-30.2,-5.4],[1.2,-29.8,-5.3],[3.2,-24.5,-5],[4.2,PK[0],PK[1]],[6.8,PK[0],PK[1]],[7.6,PK[0]+.4,PK[1]-.1],[9,PK[0]+2.2,PK[1]+.3]]},
 {style:DEMO_US,keys:[[0,PASSER[0]-1,PASSER[1]],[4,PASSER[0],PASSER[1]],[9,PASSER[0]+1,PASSER[1]]]},
 {style:DEMO_THEM,keys:[[0,DM_X,-10.5],[9,DM_X+.3,-10]]},{style:DEMO_THEM,keys:[[0,DM_X-.4,.2],[9,DM_X,.8]]},{style:DEMO_THEM,keys:[[0,DM_X,9.5],[9,DM_X+.2,9]]},
 {style:DEMO_THEM,keys:[[0,DF_X,-13]]},{style:DEMO_THEM,keys:[[0,DF_X+.3,-4.8]]},{style:DEMO_THEM,keys:[[0,DF_X+.3,3.6]]},{style:DEMO_THEM,keys:[[0,DF_X,11.8]]},
];
const DTAB=DEMO.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=500;i++){const[x,z]=herm(a.keys,i*.02);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const dS=(arr:number[],u:number)=>{const f=clamp(u/.02,0,arr.length-1),i=Math.floor(f),r=f-i;return i+1<arr.length?lerp(arr[i],arr[i+1],r):arr[i];};
const dPos=(k:number,u:number):[number,number]=>[dS(DTAB[k].X,u),dS(DTAB[k].Z,u)];
const dVel=(k:number,u:number):[number,number]=>{const a=dPos(k,u-.08),b=dPos(k,u+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
/** demo clock: the pass leaves at D_PASS and reaches the pocket at D_REC */
const D_PASS=6.3,D_REC=7.0;
const DREC:[number,number]=[PK[0]-.55,PK[1]+.05];
function dBall(u:number):V3{const pb:[number,number]=[PASSER[0]+.6,PASSER[1]];
 if(u<D_PASS){const p=dPos(1,u);return[p[0]+.6,.11,p[1]];}
 if(u<D_REC){const f=(u-D_PASS)/(D_REC-D_PASS),e=1.25*f-.25*f*f;return[lerp(pb[0],DREC[0],e),.11,lerp(pb[1],DREC[1],e)];}
 const p=dPos(0,u),v=dVel(0,u),sp=Math.hypot(v[0],v[1]);return sp>.3?[p[0]+v[0]/sp*.55,.11,p[1]+v[1]/sp*.55]:[DREC[0],.11,DREC[1]];}
function dPose(k:number,u:number):{pose:Pose;place:Place}{
 const[x,z]=dPos(k,u),v=dVel(k,u),sp=Math.hypot(v[0],v[1]),b=dBall(u),toBall=YAW(b[0]-x,b[2]-z);let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(k===0){p=blendPose(READY,runCycle(dS(DTAB[0].D,u)/3.2,{speed:clamp(sp/7)}),clamp(sp/1.1));
  // in the pocket he opens his body half-turned (sees ball and goal), receives, turns toward goal
  if(u>4.2&&u<7.4)yaw=lerpAng(toBall,YAW(1,0),.35);
  p=over(p,RECEIVE,Math.max(0,1-Math.abs(u-D_REC)/.5));
  if(u>=7.4)p=blendPose(READY,dribble(dS(DTAB[0].D,u)/1.9,{foot:'r',speed:.5}),clamp(sp/.9));
  p=over(p,{neckY:-40},Math.max(0,1-Math.abs(u-3.6)/.6)*.8);// a shoulder check
 }else if(k===1){p=idle(u,k);const w=(u-(D_PASS-STRIKE_CONTACT*.8))/.8;yaw=YAW(DREC[0]-x,DREC[1]-z);if(w>0&&w<1.3)p=blendPose(p,strike(Math.min(1,w),{power:.5}),Math.min(sm(0,.15,w),1-sm(1,1.3,w)));}
 else{p=blendPose(READY,runCycle(u+k,{speed:.2}),clamp(sp/1.2));yaw=toBall;}
 return{pose:p,place:{x,z,yaw}};}
const ch3q=()=>({hh:T(2,'How he does it'),fp:T(2,'find the pocket'),sb:T(2,'Stand between'),mf:T(2,'midfield'),df:T(2,'defence'),nm:T(2,'nobody is marking you'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,.4],[q.fp,1.1],[q.sb,3.1],[q.mf,4.1],[q.df,4.6],[q.nm,D_PASS-.1],[q.end-.3,8.2],[q.end,8.5]]),x=>x);};
const LCAM=(t:number)=>{const q=ch3q(),v=key(t,mono([[0,-39,5.6,-2.5,1350],[q.fp,-38.6,5.4,-2.7,1400],[q.sb,-38.2,5.2,-2.9,1450],[q.nm,-38,5.1,-3.1,1500],[q.end,-37.8,5.1,-3.2,1520]]),easeInOutSine,true);
 const lk=sm(q.sb,q.nm+1,t,easeInOutSine);return cam([v[0],v[1],v[2]],[lerp(-24,-22,lk),0,lerp(-2,-3.2,lk)],v[3]);};
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=LCAM(t),u=tau3(t),up=tau3(tt);frame(s);
  // the stage: a navy print, the ground a lighter navy, the goal in paper far away
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-70,0,-32],[4,0,-32],[4,0,32],[-70,0,32]]));s.tone(K,floor,.2);
  const lines=new Path2D();groundLine(lines,c,[-16.5,-20.16],[-16.5,20.16],.14);groundLine(lines,c,[0,-20.16],[-16.5,-20.16],.14);groundLine(lines,c,[0,20.16],[-16.5,20.16],.14);s.tone(Y,lines,.35);
  goal(s,c);
  // "How he does it": a label-like yellow ring round the player at his start
  const hh=sm(q.hh,q.hh+.4,tt,easeOutBack)*(1-sm(q.fp,q.fp+.4,tt));if(hh>.02){const p=dPos(0,up),g=groundRing(c,p[0],p[1],.9*hh,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.1*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}),.95);}
  // "find the pocket": the band of grass between the two lines prints light yellow, the pocket itself brighter
  const fp=sm(q.fp-.1,q.fp+.6,tt);if(fp>.02){const band=new Path2D();addPoly(band,clipPoly(c,[[DM_X+1.2,0,-18],[DF_X-1.2,0,-18],[DF_X-1.2,0,18],[DM_X+1.2,0,18]]));s.tone(Y,band,.22*fp);
   const g=groundRing(c,PK[0],PK[1],2*fp,36);if(g.length>2){const pk=polyPath(g,true);s.knockout(pk,.3);s.fill(Y,pk,.4);}}
  // "Stand between": his step into the pocket as a yellow arrow
  const sb=sm(q.sb-.1,q.sb+.8,tt,easeOut)*(1-sm(q.nm+.8,q.nm+1.4,tt));if(sb>.02){const pts:[number,number][]=[];for(let i=0;i<=8;i++){const p=dPos(0,lerp(1.2,4.2,i/8));pts.push(p);}groundArrow(s,c,pts,sb,.12);}
  // "midfield" / "defence": a paper line through each line of opponents
  const lineThrough=(xs:number,z0:number,z1:number,w:number)=>{if(w<=.02)return;const pts:[number,number][]=[];for(let i=0;i<=12;i++)pts.push([xs,lerp(z0,lerp(z0,z1,w),i/12)]);const q2=groundPts(c,pts);if(q2.length<2)return;s.knockout(ribbon(q2,Math.max(4,.1*kAt(c,[xs,0,0])),{taper:0,wobble:.6}),.9);};
  lineThrough(DM_X,-14,13,sm(q.mf-.1,q.mf+.6,tt));lineThrough(DF_X,-16.5,15.5,sm(q.df-.1,q.df+.6,tt));
  // "nobody is marking you": dashed reach lines from the nearest opponents stop short of him; a yellow ring round him
  const nm=sm(q.nm-.1,q.nm+.4,tt)*(1-sm(q.end-.5,q.end-.1,tt));if(nm>.02){const h=dPos(0,up);for(const k of[2,6]){const o=dPos(k,up),d=Math.hypot(h[0]-o[0],h[1]-o[1]),stop=(d-1.8)/d;tether(s,c,o,[lerp(o[0],h[0],stop),lerp(o[1],h[1],stop)],nm);}
   const pr=new Path2D(),g=groundRing(c,h[0],h[1],1.1*nm,24);if(g.length>2)pr.addPath(ribbon(g,Math.max(5,.1*kAt(c,[h[0],0,h[1]])),{close:true,taper:0,wobble:.6}));yInk(s,pr,.95);}
  // the pass through the gap into the pocket: its line on the grass as it travels
  if(up>D_PASS-.1&&up<D_REC+.6){const b=dBall(Math.min(up,D_REC)),q2=groundPts(c,[[PASSER[0]+.6,PASSER[1]],[b[0],b[2]]]);if(q2.length>1)s.fill(Y,ribbon(q2,8,{taper:.3,wobble:.5}),.7);}
  // figures and ball, depth sorted
  const items:Item[]=[];DEMO.forEach((a,k)=>{const st=dPose(k,up),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<2)return;
   items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev:a.hero?dPose(k,up-1/12):undefined,detail:a.hero?undefined:'mid'})});});
  const b=dBall(u);items.push({depth:depthOf(c,b),draw:()=>{const qb=P(c,b);ballShadow(s,c,b);whiteBall(s,qb[0],qb[1],Math.max(12,BALL_R*kAt(c,b)),u*8,{duo:true});}});
  items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());},
 still:7,
};

const story:RisoStory={
 id:'dani-olmo-signature',format:'11v11',title:'Olmo finds the pocket',
 theme:"Stand between the other team's midfield and defence, where nobody is marking you.",
 ageNote:'UEFA Euro 2024 quarter-final, Spain 2–1 Germany (after extra time), Stuttgart, 5 July 2024. Olmo came on for the injured Pedri, scored the first goal and was Man of the Match.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: the pocket — a yellow ring opens round the point and a ball rolls into it. Reduced motion: the ring and the ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.7),r=40+90*easeOutBack(u);
  const ring:Pt[]=Array.from({length:28},(_,i)=>[x+Math.cos(i/28*TAU)*r,y+Math.sin(i/28*TAU)*r*.55] as Pt);
  s.fill(Y,ribbon(ring,12,{close:true,taper:0,wobble:1}),.9);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  whiteBall(s,lerp(x-220,x,easeOut(u)),y+10,40,age*12+hash(seed,3)*TAU);
 },
};
export default story;
