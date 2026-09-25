/** Signature film: Kenan Yıldız, "face up and cut inside" — his goal "alla Del Piero" v Borussia Dortmund, Juventus 4–4 Borussia Dortmund,
 * UEFA Champions League 2025–26 league phase, matchday 1, Juventus (Allianz) Stadium, Turin, 16 September 2025 (63rd minute, 0–1 → 1–1).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/yildiz-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/yildiz-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/yildiz-signature/timing.json';   (and `timingJson as NarrationTiming`).
 * Cue gotcha: no cue starts with "Yıldız" (Kokoro may split the dotless ı); the name cue is "Kenan". The narration keeps the spelling "Yıldız".
 *
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Yıldız a signature ("face up and cut inside", lesson: face your defender, fake one way and
 * cut inside to shoot; params: from the LEFT, right foot). His goal v Dortmund is the best-documented example of the finish that move sets
 * up: a right-footer arriving from the left side, shooting from the edge of the box with the inside of the right foot so the ball bends
 * back in toward the far top corner — Italian football's "gol alla Del Piero", and Il Post, Football Italia and Del Piero himself put this
 * goal in that canon. Written sources describe the finish (collect on the edge of the area, steady, bend it into the far top corner), so
 * chapters 1–3 recreate only that. The sources do NOT describe a fake before the shot, so the face-up / fake / cut inside is NOT staged in
 * the match: it is chapter 4, a separate, labelled "How he does it" demonstration on a plain duotone stage with unnumbered neutral figures.
 *
 * SOURCES (fetched Sept 2026 with curl, cached in scratchpad/films/src-cache/; the footage itself was not reviewed):
 *  - Wikipedia, "Kenan Yıldız" (Juventus No. 10 since Aug 2024; the 16 Sept 2025 "Del Piero Zone" goal v Borussia Dortmund, a 4–4 draw;
 *    he said the shot was "instinctive") https://en.wikipedia.org/wiki/Kenan_Y%C4%B1ld%C4%B1z
 *  - The Guardian (Reuters), "Champions League roundup: Juventus stun Dortmund with late double in 4-4 epic" (16 Sept 2025): all eight goals
 *    after the break; Adeyemi 0–1 "eight minutes after the restart"; "The hosts drew level in the 63rd minute through Kenan Yildiz, who
 *    collected the ball on the edge of the area, steadied himself and bent a superb shot into the far corner to ignite the Juventus fans";
 *    Gregor Kobel in Dortmund's goal; Ryerson fought Yıldız for the ball (photo caption)
 *    https://www.theguardian.com/football/2025/sep/16/champions-league-roundup-juventus-dortmund-4-4-qarabag-union-saint-gilloise-benfica-psv
 *  - Football Italia, L. Bettoni, "30 years on, Yildiz recreates Del Piero's iconic goal vs. Borussia Dortmund" (17 Sept 2025): "a stunning
 *    curler into the top corner"; Juventus Stadium https://football-italia.net/yildiz-del-piero-recreates-del-piero-goal-30/
 *  - Il Post, "Breve storia dei gol 'alla Del Piero'" (17 Sept 2025): a shot from outside the area, powerful and precise, with a curling
 *    trajectory that qualifies it "a tutti gli effetti" as a gol alla Del Piero = shot from the edge of the box arriving from the LEFT side,
 *    RIGHT foot, inside of the foot, the ball bending back in ("rientrare") and dropping toward the top corner to the keeper's LEFT; and its
 *    lead photo of the strike (Jonathan Moscrop/CSM): Juventus ALL BLACK with white numbers (Yıldız 10, Vlahovic 9), Dortmund ALL YELLOW
 *    with black numbers (3 and 5 visible), a Dortmund player lunging to block, Yıldız striking with his RIGHT foot, left foot planted,
 *    floodlit crowd mostly in black and white https://www.ilpost.it/2025/09/17/gol-alla-del-piero-storia-yildiz/
 *  - Guardian (Reuters), Juventus 3–1 PSV roundup (17 Sept 2024), read for background only (his earlier curler v PSV).
 *  - lib/town/playerAppearance.json (Turkey; skin 1 / dark hair) and lib/town/playerCareers.json (Juventus 2023–, Turkey 2023–).
 * CONFIRMED by those accounts: 16 Sept 2025, Turin, UCL league phase MD1, Juventus v Borussia Dortmund, 4–4; 0–1 when Yıldız scored in the
 *  63rd minute (1–1); he collected the ball on the edge of the area, steadied himself and bent a right-footed shot with the inside of the foot
 *  from the left side into the far top corner (keeper's left), the ball bending back in; Kobel in goal; it ignited the Juventus fans;
 *  kits (photo): Juventus all black, white numbers; Dortmund all yellow, black numbers; Yıldız 10, Vlahovic 9 near the box, Dortmund 3 and
 *  5 and a lunging blocker between Yıldız and goal.
 * INFERRED / ILLUSTRATIVE: every position and run in metres (a short pass in from an unnamed team-mate infield, the ball collected ≈ 19 m out
 *  on the left, one settling touch inside onto the right foot, the strike from ≈ 19 m, the blocker's lunge); the ball's exact flight (a
 *  quadratic bend starting wide of the far post, back in to the top far corner); whether and how Kobel dived (drawn: a late dive to his left);
 *  Kobel's kit colour (drawn red, never named); which end Juventus attacked (drawn right to left on the main camera so the left wing is the
 *  near side); the celebration (drawn: a run toward the near touchline, team-mates following — not described by the sources); the kick-off
 *  hour (drawn under floodlights, a night sky); numbers of everyone except 10, 9, 3 and 5 (left blank); hair styles; the ball design (white
 *  with navy star panels); the stadium (steep two-tier stands close to the pitch, a flat navy roof ringed with floodlights, a yellow Dortmund
 *  away block in a far corner); crowd colours; camera placements and lenses; no referee drawn. Chapter 4 is a demonstration, not the match.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the goal is ONE simulation on a real clock τ
 * (seconds, τ = 0 Yıldız collects the ball): ch1 = the high main-stand broadcast camera, live (the pass in, the settling touch, the curler, the
 * far top corner); ch2 = the TV slow-motion replay, low behind his right side (the right foot wrapping round the ball, the ball starting wide
 * of the far post and bending back in); ch3 = the replay from behind the far post (past the keeper, the top corner, the fans); ch4 = "How he
 * does it", a separate duotone demonstration on its own clock (run at the defender, face up, fake outside, cut inside, curl it). Seams are
 * forward passages into the ball. The curler is a quadratic Bézier on the ground with a rising-dipping height; contact reads the solved
 * skeleton's RIGHT toe so ball and boot always meet. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world
 * centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square window. Inks: yellow (Dortmund, light, grass with
 * blue), red (skin, crowd accents, the keeper), blue (sky, grass, boards), navy (Juventus black, key line, roof, night). Scenes read only
 * their local t; poses on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 plate ops per frame (small wide-shot figures
 * print at 'low'). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,blendPose,runCycle,stand,strike,dribble,backpedal,lunge,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`yildiz film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py yildiz-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/yildiz-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Turin, live','Turin, Champions League. Juventus, in black, play Dortmund, in yellow. Kenan Yıldız gets the ball on the left edge of the box. He steadies himself, and bends it with his right foot. Far corner! Goal!',
  ['Turin','Champions League','Juventus, in black','Dortmund, in yellow','Kenan','left edge','steadies himself','bends it','right foot','Far corner','Goal']),
 prov('Watch again','Watch again, slowly. His right foot wraps around the ball. It starts wide of the far post, then bends back in.',
  ['Watch again','slowly','right foot','wraps around','starts wide','far post','bends back']),
 prov('Behind the goal','From behind the goal: past the keeper, top corner! The fans roar!',
  ['From behind','past the keeper','top corner','fans roar']),
 prov('How he does it','How he does it: run at your defender. Your turn: face your defender, fake one way, and cut inside to shoot.',
  ['How he does it','run at','Your turn','face your defender','fake one way','cut inside','shoot']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`yildiz film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}
/** a yellow arrow along ground points (projected), with gaps for a dashed read */
function groundArrow(s:Sheet,c:Camera,pts3:V3[],w:number,cov=.95,dashed=false){const pts:Pt[]=[];for(const p of pts3)if(depthOf(c,p)>NEAR)pts.push(P(c,p));if(pts.length<2)return;
 const gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.9;x+=.16)gaps.push([x,x+.06]);yInk(s,ribbon(pts,w,{taper:.1,wobble:.8,gaps}),cov);yInk(s,head(pts,w),cov);}

// ================= Turin: steep two-tier stands close to the pitch under a flat roof ringed with floodlights; a night sky =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[12,.9,-36.5],[-116,.9,-36.5],[-116,30,-60],[12,30,-60]],// the main stand under the TV camera (z < 0)
 [[7.5,.9,44],[7.5,.9,-44],[40,32,-44],[40,32,44]],// behind the goal Juventus attack
 [[-116,.9,36.5],[12,.9,36.5],[12,30,60],[-116,30,60]],// the far side, across from the camera
 [[-112.5,.9,-44],[-112.5,.9,44],[-140,30,44],[-140,30,-44]],// the other end
];
/** each roof's canopy reaches back in over its stand */
const OVER:V3[]=[[0,0,24],[-26,0,0],[0,0,-24],[22,0,0]];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red / 2 yellow / 3 blue / 4 navy, phase] — Juventus black and white everywhere; the Dortmund away
 * block (yellow) in the far corner by the other end (placement inferred) */
const CROWD=(()=>{const r=rng(1609),out:[number,number,number,number,number][]=[];[640,560,700,340].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),u=r(),v=.03+r()*.93;if(Math.abs(v-.5)<.035)continue;
 const away=st===2&&u<.14&&v>.4;out.push([st,u,v,away?(c<.9?2:4):(c<.42?0:c<.82?4:c<.9?3:c<.96?1:2),r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;post?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a night sky over Turin (floodlit match; the hour is inferred): blue under heavy navy, a faint floodlight haze at the roofline
 s.field(B,.5,.6);s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true),.62);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.knockout(polyPath([[-Bnd,hz-150],[Bnd,hz-170],[Bnd,hz+40],[-Bnd,hz+60]],true),.1);
 // stands: knocked out, a navy screen, rows; one fascia band on the two-tier stands; the flat roof (navy) with its floodlight line
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),leds=new Path2D(),lamps=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<18;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/18),bil(q,1,k/18),bil(q,1,(k+1)/18),bil(q,0,(k+1)/18)]));
  const lift:V3=[0,3,0],over=OVER[si];
  addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(add(q[2],lift),over),add(add(q[3],lift),over)]));
  if(si!==1){const v=.5;addPoly(fascia,clipPoly(c,[bil(q,0,v-.03),bil(q,1,v-.03),bil(q,1,v+.03),bil(q,0,v+.03)]));addPoly(leds,clipPoly(c,[bil(q,0,v-.012),bil(q,1,v-.012),bil(q,1,v+.012),bil(q,0,v+.012)]));}
  for(let k=0;k<22;k++){const u=(k+.5)/22,p=add(add(bil(q,u,1),lift),mix3([0,0,0],over,.9));if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}});
 s.knockout(stands);s.tone(K,stands,.5);s.tone(B,stands,.18);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.9);if(seen[2])yInk(s,heads[2],.95);if(seen[3])s.fill(B,heads[3],.9);if(seen[4])s.fill(K,heads[4],.92);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.tone(K,fascia,.6);s.fill(B,leds,.7);s.fill(K,roof,.95);s.knockout(lamps,.95);
 // LED boards along the touchlines and behind the goal (dark boards, blue panels)
 const bB=new Path2D(),bP=new Path2D();for(const z of[-35.4,35.4])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(B,bB,.9);s.fill(K,bP,.85);
 // grass under floodlights: yellow × blue = green, mowing stripes, paper lines (the box, the D, the six-yard box, the spot)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[5,0,-35],[5,0,35],[-110,0,35]]));s.knockout(gp);yInk(s,gp,.84);s.tone(B,gp,.64);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.16);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net,o.post??0);
}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple; `post` shivers the far post (z = +3.66) */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3,post=0){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const sh=post>0?.03*post:0;
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[sh,H+.06,W-sh]);bar([0,H,-W-.06],[sh,H,W+.06-sh]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (white with navy star panels and a blue accent — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // three star points (the star-ball motif) + a small accent
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.55,cy=Math.sin(a)*r*.55,rr=r*.34,pts:Pt[]=[];for(let j=0;j<10;j++){const aa=a+j/10*TAU,q=j&1?rr*.45:rr;pts.push([cx+Math.cos(aa)*q,cy+Math.sin(aa)*q]);}pan.addPath(polyPath(pts,true));}
 const aa=spin*.8+1;acc.addPath(ribbon([[Math.cos(aa)*r*.12,Math.sin(aa)*r*.12],[Math.cos(aa+.9)*r*.42,Math.sin(aa+.9)*r*.42]],Math.max(2,r*.13),{taper:.6,wobble:0}));
 s.fill(K,pan,.9);s.fill(duo?K:B,acc,duo?.5:.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (16 September 2025) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]];
type Kit=AthleteStyle;
/** Juventus: all black, white numbers (confirmed, Il Post photo); printed navy at .88 so the key line still reads; white trim inferred */
const JUV=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[K,.88],shorts:[K,.88],socks:[K,.88],trim:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[B,.3],sleeves:'short',number:n,numberInk:'paper',seed:40+(n??7),...o});
/** Borussia Dortmund: all yellow, black numbers (confirmed, Il Post photo); navy trim inferred */
const BVB=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:Y,shorts:Y,socks:Y,trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:60+(n??11),...o});
/** Kenan Yıldız, Juventus 10: skin 1 / dark hair (playerAppearance.json), tall and slim */
const YILDIZ:Kit=JUV(10,{skin:SKIN_M,hair:[K,.95],hairStyle:'short',build:{height:1.87,bulk:.9,thighs:.95,head:1.02},seed:10});
/** Gregor Kobel, Dortmund 1 (kit colour inferred; never named) */
const KOBEL:Kit={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],trim:K,boots:K,skin:SKIN_L,hair:[Y,.5],hairStyle:'short',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:K,build:{height:1.94},seed:1};
/** duotone versions for the demonstration (navy + yellow only; no numbers — neutral, not the match) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.5]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],number:null,gloves:undefined});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the goal as ONE simulation on τ (seconds; τ = 0 Yıldız collects the ball on the left edge of the box) =================
const YB:Build=YILDIZ.build!;
/** the ball's stops: TP the pass in (unnamed team-mate), Y0 collected, B2 after the settling touch inside (all inferred) */
const TP=-1.1,PASS_FROM:[number,number]=[-27.2,-4.6],Y0:[number,number]=[-19.6,-11.3],B2:[number,number]=[-19,-10];
const CONTACT=1.05,TF=.95,T_GOAL=CONTACT+TF;
/** the curler (right foot, inside of the foot): it sets off WIDE of the far post (control point) and bends LEFT, back in, to the top far corner */
const CTRL:[number,number]=[-7.4,4.4],HIT:V3=[0,2.12,3.38],POST:V3=[0,2.12,3.66];
const D1:V3=[1.2,1.95,3.05],D2:V3=[1.75,.11,2.8],NET_HIT:V3=[2,1.9,3.0];
const curl=(u:number):V3=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*B2[0]+b*CTRL[0]+c*HIT[0],lerp(.11,HIT[1],u)+.95*Math.sin(Math.PI*u)*(1-.3*u),a*B2[1]+b*CTRL[1]+c*HIT[2]];};
/** the body opened a little RIGHT of the far post at the strike (the ball starts right, wide, and bends back left) */
const GS=YAW(HIT[0]-B2[0],HIT[2]-B2[1])-14*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.85}),YB,{yaw:GS});
const GP:[number,number]=[B2[0]-SHOT_SK.rToe[0],B2[1]-SHOT_SK.rToe[2]];
const [sfx,sfz]=dirOf(GS);

type Role='hero'|'juv'|'bvb'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Yıldız',role:'hero',style:YILDIZ,key:true,keys:[[-10,-24,-17],[-5,-22.4,-14.6],[-2,-20.8,-12.6],[-.6,-20.3,-12],[0,-20.1,-11.75],[.45,-19.8,-11.1],[CONTACT,GP[0],GP[1]],[CONTACT+.5,GP[0]+sfx*.5,GP[1]+sfz*.5],[T_GOAL+.3,GP[0]+.8,GP[1]-.6],[T_GOAL+1.6,-16.4,-14.2],[T_GOAL+3.6,-13.2,-20.5],[T_GOAL+6,-12,-24],[T_GOAL+10,-11.8,-24.6]]},
 {name:'passer',role:'juv',style:JUV(null,{hair:[K,.85],seed:47}),key:true,keys:[[-10,-33,-3],[-5,-30.2,-3.8],[-2,-27.9,-4.4],[TP,-27.2,-4.6],[0,-26.6,-4.2],[2,-25,-3.2],[T_GOAL+1,-23,-7],[T_GOAL+4,-15,-18],[T_GOAL+10,-14,-21]]},
 {name:'blocker',role:'bvb',style:BVB(null,{hair:[K,.8],seed:77}),key:true,keys:[[-10,-14,-8],[-2,-16.2,-9.6],[0,-16.9,-10.2],[CONTACT-.3,-17.5,-10.5],[CONTACT+.4,-17.6,-10.6],[4,-17,-9.8],[9,-16.4,-9]]},
 {name:'Kobel',role:'gk',style:KOBEL,key:true,keys:[[-10,-3.2,-2.6],[-2,-2.6,-1.9],[0,-2.2,-1.5],[CONTACT,-1.8,-.9],[9,-1.8,-.9]]},
 {name:'5',role:'bvb',style:BVB(5,{hair:[K,.85]}),key:true,keys:[[-10,-12,-6],[-2,-14,-7.2],[0,-15,-7.6],[CONTACT,-15.4,-7.8],[4,-14.6,-7.4],[9,-14,-7]]},
 {name:'3',role:'bvb',style:BVB(3,{hair:[Y,.45],build:{height:1.91}}),keys:[[-10,-10,-3],[0,-12.4,-4.4],[CONTACT,-12.8,-4.9],[4,-12,-4.4],[9,-11,-4]]},
 {name:'Vlahovic',role:'juv',style:JUV(9,{hair:[K,.9],build:{height:1.9},hairStyle:'long'}),keys:[[-10,-9,-1],[0,-11.2,-2.4],[CONTACT,-11,-1.8],[T_GOAL+1,-12,-5],[T_GOAL+4,-12.4,-18],[T_GOAL+10,-12.2,-22]]},
 {name:'bvb-c',role:'bvb',style:BVB(null,{hair:[K,.7],seed:83}),keys:[[-10,-10,2],[0,-11.6,1.2],[CONTACT,-11.4,.6],[9,-11,.4]]},
 {name:'bvb-r',role:'bvb',style:BVB(null,{hair:[K,.8],seed:84}),keys:[[-10,-9,7],[0,-10.8,5.6],[CONTACT,-10.4,4.8],[9,-10,4.6]]},
 {name:'bvb-m',role:'bvb',style:BVB(null,{hair:[K,.85],seed:85}),keys:[[-10,-21,-3],[0,-21.8,-6.4],[CONTACT,-21,-7.4],[9,-20,-7]]},
 {name:'bvb-m2',role:'bvb',style:BVB(null,{hair:[K,.6],seed:86}),keys:[[-10,-23,4],[0,-22,2],[CONTACT,-21.4,1],[9,-20,0]]},
 {name:'juv-a',role:'juv',style:JUV(null,{hair:[K,.8],seed:51}),keys:[[-10,-13,6],[0,-13.6,5],[CONTACT,-13,4.2],[T_GOAL+1,-14,0],[T_GOAL+4,-14.4,-16],[T_GOAL+10,-14,-21]]},
 {name:'juv-b',role:'juv',style:JUV(null,{hair:[K,.9],seed:52}),keys:[[-10,-26,8],[0,-24,7],[CONTACT,-23,6],[9,-22,4]]},
 {name:'juv-c',role:'juv',style:JUV(null,{hair:[K,.85],seed:53}),keys:[[-10,-38,-8],[0,-35,-7],[5,-32,-6]]},
 {name:'juv-d',role:'juv',style:JUV(null,{hair:[K,.7],seed:54}),keys:[[-10,-40,10],[0,-37,9],[5,-34,8]]},
 {name:'bvb-f',role:'bvb',style:BVB(null,{hair:[K,.85],seed:87}),keys:[[-10,-36,2],[0,-34,1],[5,-31,0]]},
];
const YIL=0,PAS=1,BLK=2,GK=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=12,DT=.02;
function table(keys:number[][],t0:number,t1:number){const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(t1-t0)/DT;i++){const[x,z]=herm(keys,t0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D,t0};}
type Table=ReturnType<typeof table>;
const TABLES=ACTORS.map(a=>table(a.keys,T0,T1));
const samp=(tb:Table,arr:number[],tau:number)=>{const u=clamp((tau-tb.t0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posT=(tb:Table,tau:number):[number,number]=>[samp(tb,tb.X,tau),samp(tb,tb.Z,tau)];
const velT=(tb:Table,tau:number):[number,number]=>{const a=posT(tb,tau-.08),b=posT(tb,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const posOf=(k:number,tau:number)=>posT(TABLES[k],tau);
const distOf=(k:number,tau:number)=>samp(TABLES[k],TABLES[k].D,tau);
const velOf=(k:number,tau:number)=>velT(TABLES[k],tau);

// ---- the ball: the team-mate carries it → the pass in → collected → the settling touch inside → the curler → the net ----
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const BT=fwdBall(PAS,TP,.5);
function ballAt(tau:number):V3{
 if(tau<TP){const f=fwdBall(PAS,tau,.5+.12*Math.sin(tau*5.5));return[f[0],.11,f[1]];}
 if(tau<0){const u=(tau-TP)/-TP,e=1.4*u-.4*u*u;return[lerp(BT[0],Y0[0],e),.11,lerp(BT[1],Y0[1],e)];}
 if(tau<.5){const u=tau/.5,e=1-(1-u)*(1-u);return[lerp(Y0[0],B2[0],e),.11,lerp(Y0[1],B2[1],e)];}
 if(tau<CONTACT)return[B2[0],.11,B2[1]];
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return curl(1.1*u-.1*u*u);}
 const e=s-TF;if(e<.16)return mix3(HIT,D1,easeOut(e/.16));
 const d=clamp((e-.16)/.5),h=D1[1]*(1-d*d)+.11*d*d;return[lerp(D1[0],D2[0],d),Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.66)*8))*Math.exp(-(e-.66)*3):0),lerp(D1[2],D2[2],d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
const RECEIVE:Partial<Pose>={lean:12,rHipF:26,rKnee:34,rAnk:-12,lKnee:30,lShA:40,rShA:36,lElb:40,rElb:40,neckP:30};
/** "steadies himself": low, arms out for balance, head over the ball (the settling touch goes inside with the right foot) */
const STEADY:Partial<Pose>={lean:20,lKnee:44,rKnee:40,lShA:52,rShA:46,lElb:30,rElb:30,neckP:34};
const SD=.95,S_START=CONTACT-STRIKE_CONTACT*SD;
const goalYaw=(x:number,z:number)=>YAW(-x,.8-z);
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<-.5){p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.1,{speed:clamp(sp/7)}),clamp(sp/1.1));if(tau>-1.6)yaw=lerpAng(yaw,toBall,sm(-1.6,-.8,tau));}
  else if(tau<T_GOAL+.2){const dr=dribble(distOf(k,tau)/1.9,{foot:'r',speed:.4+.3*clamp(sp/4)});p=blendPose(READY,dr,clamp(sp/.9));
   yaw=sp>.5?lerpAng(YAW(v[0],v[1]),goalYaw(x,z),.45):goalYaw(x,z);
   p=over(p,RECEIVE,bump(-.5,.35,tau));p=over(p,STEADY,bump(.2,.75,tau));
   const u=(tau-S_START)/SD;if(u>-.2){yaw=lerpAng(yaw,GS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.85}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));
    p=over(p,{twist:12},bump(.25,.8,u));}}
  else{p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.2,T_GOAL+.7,tau));}
 }else if(a.role==='gk'){
  yaw=toBall;const q=keeperSet(tau*1.5),dAt=T_GOAL-.02,dd=.9,t0=dAt-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'l',height:.95}):q;if(u>0)yaw=YAW(1,0)+Math.PI;
 }else{
  const bvb=a.role==='bvb',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(bvb&&k!==BLK&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(bvb?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  if(k===PAS&&tau<TP){const dr=dribble(distOf(k,tau)/1.9,{foot:'r',speed:.4});p=blendPose(p,dr,.8);}
  if(k===PAS){const pu=(tau-(TP-STRIKE_CONTACT*.7))/.7;if(pu>0&&pu<1.3){p=blendPose(p,strike(Math.min(1,pu),{foot:'r',power:.3}),Math.min(sm(0,.15,pu),1-sm(1,1.3,pu)));yaw=YAW(Y0[0]-x,Y0[1]-z);}}
  // the blocker (photo: a Dortmund player lunging between Yıldız and goal as he shoots): he slides his left leg across the shot
  if(k===BLK){yaw=YAW(b[0]-x,b[2]-z);if(tau>CONTACT-.9)yaw=YAW(B2[0]-x,B2[1]-z);const lu=(tau-(CONTACT-.6*.75))/.75;if(lu>0&&lu<1.8){p=blendPose(p,lunge(Math.min(1,lu),{side:'l'}),Math.min(sm(0,.15,lu),1-sm(1.1,1.8,lu)));}}
  if(bvb&&k!==BLK&&tau>-.5&&tau<CONTACT+.6){const y=posOf(YIL,tau);yaw=YAW(y[0]-x,y[1]-z);}
  if(a.role==='juv'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau)*(1-sm(T_GOAL+2.2,T_GOAL+3,tau)));
  if(bvb&&tau>T_GOAL+.6)p=over(p,{lean:34,neckP:30,lShA:18,rShA:18,lElb:20,rElb:20},sm(T_GOAL+.6,T_GOAL+1.4,tau)*.8);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Yıldız with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;noBall?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===YIL?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==YIL&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==YIL&&hPx<150)?'low':o.cap?'mid':undefined;
  const hero=k===YIL&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 if(!o.noBall)items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings) */
function ringAt(path:Path2D,c:Camera,p:[number,number],g:number,r=.9){const q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** "far corner" / "top corner": a yellow bracket in the angle of the far post and the bar */
function cornerBracket(s:Sheet,c:Camera,w:number){if(w<=.02)return;const C0:V3=[0,2.44,3.66];if(depthOf(c,C0)<NEAR+.3)return;const k=kAt(c,C0),a=P(c,[0,2.44-.9*w,3.66]),m=P(c,C0),b=P(c,[0,2.44,3.66-.9*w]);yInk(s,ribbon([a,m,b],Math.max(7,.14*k),{taper:.1,wobble:1}),.95);}
/** the ball's dotted flight so far (bending back in to the far corner) */
function flightDots(s:Sheet,c:Camera,tp:number,size:number,ink:'y'|'k'){if(tp<=CONTACT||tp>=T_GOAL+.3)return;const dots=new Path2D();for(let i=0;i<=18;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(size*kAt(c,p),8,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}if(ink==='y')yInk(s,dots,.9);else s.fill(K,dots,.6);}
/** where the strike was aimed: the start tangent of the curl, run on to the goal line (it would pass wide of the far post) */
const AIM_END:[number,number]=(()=>{const dx=CTRL[0]-B2[0],dz=CTRL[1]-B2[1],u=-B2[0]/dx;return[0,B2[1]+dz*u];})();

// ================= chapter 1 (live): the high main-stand camera; the pass in, the settling touch, the curler, the far top corner =================
const ch1q=()=>({tu:T(0,'Turin'),cl:T(0,'Champions League'),jb:T(0,'Juventus, in black'),dy:T(0,'Dortmund, in yellow'),kn:T(0,'Kenan'),le:T(0,'left edge'),st:T(0,'steadies himself'),bi:T(0,'bends it'),rf:T(0,'right foot'),fc:T(0,'Far corner'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: the pre-roll is Juventus working it across, the play runs at ≈ 0.6–1.3× real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-8.6],[q.jb,-5.4],[q.kn,-.4],[q.le,.1],[q.st,.42],[q.bi,CONTACT-.1],[q.rf,CONTACT+.05],[q.fc,T_GOAL],[q.g,T_GOAL+.55],[q.end,T_GOAL+.55+(q.end-q.g)*.95]]),x=>x);};
const BCAM:V3=[-20,19,-50];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),g=posOf(YIL,tau);
 if(tau<CONTACT)return[b[0]+1.5,1,b[2]+1];
 if(tau<T_GOAL+.6)return mix3([b[0],1.2,b[2]],[-3,1.3,1.5],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-3,1.3,1.5],[g[0],1.2,g[1]],sm(T_GOAL+.6,T_GOAL+2.4,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-42,3,30],look=mix3(wide,av(ch1Look),sm(q.cl,q.dy,t,easeInOutSine));
 const F=key(t,mono([[0,1500],[q.cl,1900],[q.jb,2700],[q.dy,3500],[q.kn,4500],[q.le,5200],[q.bi,5000],[q.fc,4400],[q.g+.4,4300],[q.end,4900]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  // "Champions League": the floodlit bowl sparkles with camera flashes for a beat
  const clf=bump(q.cl,q.cl+1.4,tt);
  stadium(s,c,{t,cheer:.18+.9*sm(0,.5,goalIn),flash:.1+.9*clf+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  // team rings: navy for Juventus on "Juventus, in black", yellow for Dortmund on "Dortmund, in yellow", then a yellow ring for Yıldız
  const rj=sm(q.jb,q.jb+.3,tt,easeOutBack)*(1-sm(q.dy+.2,q.dy+.8,tt)),rb=sm(q.dy,q.dy+.3,tt,easeOutBack)*(1-sm(q.kn-.3,q.kn+.2,tt)),ry=sm(q.kn,q.kn+.3,tt,easeOutBack)*(1-sm(q.bi,q.bi+.5,tt));
  if(rj>.02||rb>.02||ry>.02){const pj=new Path2D(),pb=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{const p=posOf(k,tp);if((a.role==='juv'||a.role==='hero')&&rj>.02)ringAt(pj,c,p,rj);if((a.role==='bvb'||a.role==='gk')&&rb>.02)ringAt(pb,c,p,rb);});
   if(ry>.02)ringAt(py,c,posOf(YIL,tp),ry*1.2);
   if(rj>.02){s.knockout(pj,.9);s.fill(K,pj,.95);}if(rb>.02)yInk(s,pb,.95);if(ry>.02)yInk(s,py,.95);}
  // the pass in: a short arrow from the team-mate to Yıldız just before he collects it
  const pa=sm(-1.6,-1.2,tp)*(1-sm(.1,.5,tp));if(pa>.02){const pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*pa;pts.push([lerp(PASS_FROM[0]+.5,Y0[0],u),.03,lerp(PASS_FROM[1],Y0[1],u)]);}groundArrow(s,c,pts,Math.max(5,.1*kAt(c,[Y0[0],0,Y0[1]])),.9*pa,true);}
  // "left edge": the left half of the box edge prints yellow, dashed, for a beat
  const bx=sm(q.le,q.le+.3,tt)*(1-sm(q.bi+.2,q.bi+.8,tt));if(bx>.02){const pts:Pt[]=[];for(let i=0;i<=16;i++){const z=lerp(-20.16,0,i/16),p:V3=[-16.5,.03,z];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   const gaps:[number,number][]=[];for(let x=.04;x<1;x+=.1)gaps.push([x,x+.045]);if(pts.length>1)yInk(s,ribbon(pts,Math.max(6,.22*kAt(c,[-16.5,0,-10])),{taper:0,wobble:.6,gaps}),.95*bx);}
  // "steadies himself": the settling touch inside, a short yellow arrow
  const st=sm(q.st,q.st+.35,tt,easeOut)*(1-sm(q.rf,q.rf+.4,tt));if(st>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const u=i/8*st;pts.push([lerp(Y0[0],B2[0]+.5,u),.03,lerp(Y0[1],B2[1]+.6,u)]);}groundArrow(s,c,pts,Math.max(5,.1*kAt(c,[B2[0],0,B2[1]])),.95);}
  drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
  // "bends it": the dotted flight bending back in; "right foot": a spark off the right boot; "Far corner": the bracket in the far top corner
  flightDots(s,c,tp,.05,'y');
  if(tp>=CONTACT&&tp<CONTACT+.25){const b=P(c,[B2[0],.2,B2[1]]);sparkBurst(s,Y,b[0],b[1],70+60*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9});}
  cornerBracket(s,c,sm(q.fc-.15,q.fc+.25,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.4,tt)));},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9.5,
};

// ================= chapter 2 (TV replay, slow motion, low behind his right side): the right foot wraps round the ball, wide, then back in =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),rf:T(1,'right foot'),wa:T(1,'wraps around'),sw:T(1,'starts wide'),fp:T(1,'far post'),bb:T(1,'bends back'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,.05],[q.sl,.35],[q.rf,.66],[q.wa,CONTACT-.04],[q.wa+.6,CONTACT+.01],[q.sw,CONTACT+.18],[q.fp,CONTACT+.5],[q.bb,CONTACT+.72],[q.end,T_GOAL+.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.w,q.wa+.3,t,easeInOutSine),follow=sm(q.sw,q.bb,t,easeInOutSine);
 const hero:V3=[GP[0],.95,GP[1]],a0=-100*D2R,a1=-166*D2R,ang=lerp(a0,a1,orbit)+GS,[dx,dz]=dirOf(ang),D=lerp(5.2,4.4,orbit)+2.4*follow;
 const pos:V3=[hero[0]+dx*D-1.5*follow,1.05+.6*follow,hero[2]+dz*D];
 const look=mix3(mix3(hero,[b[0],Math.min(b[1],2.2),b[2]],.35),[b[0],clamp(b[1],.8,2.4),b[2]],follow);
 const F=key(t,mono([[0,1500],[q.sl,1700],[q.rf,2000],[q.wa,2150],[q.sw,1700],[q.fp,1600],[q.bb,1800],[q.end,2000]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "starts wide": the line the strike was aimed along, dashed, running on past the far post
  const sw=sm(q.sw-.1,q.sw+.5,tt,easeOut)*(1-sm(q.end-.8,q.end-.3,tt));
  if(sw>.02){const pts:V3[]=[];for(let i=0;i<=16;i++){const u=i/16*sw;pts.push([lerp(B2[0],AIM_END[0],u),.03,lerp(B2[1],AIM_END[1],u)]);}groundArrow(s,c,pts,Math.max(5,.07*kAt(c,[-8,0,0])),.8,true);}
  const w=drawWorld(s,c,tau,tp,{ballMin:22,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.rf-.2,q.rf+.2,tt)),cap:t>q.end-.7||t<.6});
  // "bends back": the ball's path traced in the air as dots over everything, curling back in
  flightDots(s,c,tp,.06,'y');
  // "right foot": a yellow ring on the right boot
  const rf=sm(q.rf-.1,q.rf+.25,tt,easeOutBack)*(1-sm(q.sw,q.sw+.4,tt));if(rf>.02){const pl=poseOf(YIL,tp),sk=solve(pl.pose,YB,pl.place),p=P(c,sk.rToe),r=.3*kAt(c,sk.rToe)*rf;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.rToe)));}
  // "wraps around": a wrap arrow round the ball's side at contact
  const wa=sm(q.wa-.1,q.wa+.3,tt)*(1-sm(q.fp,q.fp+.5,tt));if(wa>.02&&depthOf(c,w.ball)>NEAR+.4){const bp=P(c,w.ball),r=Math.max(22,BALL_R*kAt(c,w.ball))*1.9,pts:Pt[]=[];for(let i=0;i<=16;i++){const a=Math.PI*.45+i/16*2.6*wa;pts.push([bp[0]+Math.cos(a)*r,bp[1]+Math.sin(a)*r*.6]);}
   if(pts.length>2){const ww=Math.max(5,r*.12);yInk(s,ribbon(pts,ww,{taper:.2,wobble:.5}),.95);yInk(s,head(pts,ww),.95);}}
  // "far post": a ring flashes round the far post; spin ticks round the flying ball
  const fp=sm(q.fp-.1,q.fp+.25,tt,easeOutBack)*(1-sm(q.bb+.4,q.bb+.9,tt));if(fp>.02&&depthOf(c,POST)>NEAR+.3){const p=P(c,[0,1.3,3.66]);yRing(s,p[0],p[1],Math.max(16,.7*kAt(c,POST))*fp,Math.max(4,.05*kAt(c,POST)));}
  const spn=sm(q.sw-.1,q.sw+.2,tt)*(1-sm(q.bb,q.bb+.4,tt));if(spn>.02&&tp>CONTACT&&depthOf(c,w.ball)>NEAR+.5){const bp=P(c,w.ball),r=Math.max(18,BALL_R*kAt(c,w.ball))*1.7,sp0=tt*14,pk=new Path2D();for(let i=0;i<3;i++){const a=sp0+i*TAU/3,pts:Pt[]=[];for(let j=0;j<=6;j++){const aa=a-j/6*.9;pts.push([bp[0]+Math.cos(aa)*r,bp[1]+Math.sin(aa)*r]);}pk.addPath(ribbon(pts,Math.max(4,r*.1),{taper:.5,wobble:.4}));}yInk(s,pk,.95*spn);}
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110+100*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:10,seed:14,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:12});}
  if(tp>=CONTACT&&tp<CONTACT+.6&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:150,width:6,cov:.8});}
  cornerBracket(s,c,sm(q.bb-.1,q.bb+.3,tt,easeOutBack));},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(22,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4.6,
};

// ================= chapter 3 (replay from behind the far post): past the keeper, the top corner, the fans =================
const ch3q=()=>({fb:T(2,'From behind'),pk:T(2,'past the keeper'),tc:T(2,'top corner'),fr:T(2,'fans roar'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,CONTACT+.15],[q.pk,T_GOAL-.3],[q.tc,T_GOAL+.02],[q.tc+1,T_GOAL+1],[q.fr,T_GOAL+2.2],[q.end,T_GOAL+2.2+(q.end-q.fr)*.9]]),x=>x);};
const GCAM:V3=[6.8,1.9,5.8];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),g=posOf(YIL,tau);
 const toBall=sm(0,q.pk,t,easeInOutSine),toHero=sm(q.tc+.5,q.fr+.3,t,easeInOutSine);
 const look0:V3=[B2[0]+4,1.3,B2[1]+2],look1:V3=[b[0],clamp(b[1],1,3),b[2]],look2:V3=[g[0],1.6,g[1]-2];
 const look=mix3(mix3(look0,look1,toBall),look2,toHero);
 const pos:V3=add(GCAM,[-4*toHero,1.6*toHero,-2*toHero]),F=key(t,mono([[0,2400],[q.pk,1900],[q.tc,1650],[q.tc+.8,1700],[q.fr,2600],[q.end,2900]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.tc;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  const roar=sm(q.fr,q.fr+.3,tt);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn)+.4*roar,flash:.1+1.4*sm(0,.4,goalIn)+.8*roar,net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  flightDots(s,c,tp,.045,'k');
  // "past the keeper": his reach line — the glove's furthest point — and the ball beyond it
  const reach=sm(q.pk,q.pk+.35,tt,easeOutBack)*(1-sm(q.fr-.6,q.fr-.1,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:t>q.fr-.5,cap:t>q.end-.7||t<.6});
  if(reach>.02){const g=posOf(GK,tp),a=P(c,[g[0],.05,2.1]),b=P(c,[g[0],.05,lerp(2.1,2.9,reach)]),k=kAt(c,[g[0],0,3]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.25)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.06*k),{taper:0,wobble:0,gaps}),.9*reach);}
  if(tp>CONTACT+.5&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:160,width:7,cov:.8});}
  // "top corner": the bracket, and a ring flash where it went in under the bar by the far post
  cornerBracket(s,c,sm(q.tc-.1,q.tc+.3,tt,easeOutBack)*(1-sm(q.fr,q.fr+.5,tt)));
  const pf=sm(q.tc,q.tc+.25,tt,easeOutBack)*(1-sm(q.tc+1,q.tc+1.5,tt));if(pf>.02&&depthOf(c,POST)>NEAR+.3){const p=P(c,HIT);yRing(s,p[0],p[1],.35*kAt(c,HIT)*pf,Math.max(5,.05*kAt(c,HIT)));}
  // "fans roar": yellow sound arcs rise from the stand behind him
  if(roar>.02){const pl=poseOf(YIL,tp),sk=solve(pl.pose,YB,pl.place),hd=sk.head;if(depthOf(c,hd)>NEAR+.5){const p=P(c,hd),r=.34*kAt(c,hd),arcs=new Path2D();
   for(let i=0;i<3;i++){const ph=((tt*1.1+i/3)%1),rr=r*(1.8+ph*2.2),pts:Pt[]=[];for(let j=0;j<=8;j++){const a=-Math.PI*.8+j/8*Math.PI*.6;pts.push([p[0]+Math.cos(a)*rr,p[1]-r*.6+Math.sin(a)*rr]);}arcs.addPath(ribbon(pts,Math.max(4,r*.09*(1-ph*.6)),{taper:.3,wobble:.5}));}
   for(let i=0;i<3;i++){const ph=((tt*1.1+i/3+.5)%1),rr=r*(1.8+ph*2.2),pts:Pt[]=[];for(let j=0;j<=8;j++){const a=-Math.PI*.2-j/8*Math.PI*.6+Math.PI*.0;pts.push([p[0]+Math.cos(a)*rr,p[1]-r*.6+Math.sin(a)*rr]);}arcs.addPath(ribbon(pts,Math.max(4,r*.09*(1-ph*.6)),{taper:.3,wobble:.5}));}
   yInk(s,arcs,.95*roar);}}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(YIL,tau),p:V3=[x,1.2,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:3.2,
};

// ================= chapter 4 ("How he does it" — a DEMONSTRATION, not the match): run at the defender, face up, fake outside, cut inside, curl it =================
// Its own clock δ (seconds) on a plain duotone stage; two unnumbered neutral figures (the attacker is right-footed and starts on the left).
const DS=.9,DC=4.35,DTF=.8,DG=DC+DTF;// strike duration, contact, flight, in the net
/** the ball stops: DB0 where he faces up, DB1 after the cut inside (the outside of the right foot pushes it across), then the curl */
const DB0:[number,number]=[-23.1,-11.3],DB1:[number,number]=[-21.9,-9.1];
const DCTRL:[number,number]=[-9.4,3.9],DHIT:V3=[0,2.1,3.3];
const dcurl=(u:number):V3=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*DB1[0]+b*DCTRL[0]+c*DHIT[0],lerp(.11,DHIT[1],u)+.9*Math.sin(Math.PI*u)*(1-.3*u),a*DB1[1]+b*DCTRL[1]+c*DHIT[2]];};
const DGS=YAW(DHIT[0]-DB1[0],DHIT[2]-DB1[1])-12*D2R;
const DSK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.85}),YB,{yaw:DGS});
const DGP:[number,number]=[DB1[0]-DSK.rToe[0],DB1[1]-DSK.rToe[2]];
/** attacker keys: run in, face up (stopped, square on), the fake (a plant out to the left), the cut (across to the right), the strike */
const DA=table([[0,-32,-12.6],[1,-29.2,-12.2],[2,-25.6,-11.7],[2.4,-24.2,-11.55],[2.75,-23.8,-11.5],[3.3,-23.75,-11.7],[3.55,-23.5,-11.3],[3.9,-22.7,-10],[DC,DGP[0],DGP[1]],[DC+.6,DGP[0]+.6,DGP[1]+.3],[8,DGP[0]+.7,DGP[1]+.35]],0,8);
/** defender keys: backs off, sets square on, bites on the fake (shifts toward the touchline), turns too late */
const DD=table([[0,-18.4,-11.4],[1.6,-19.6,-11.4],[2.5,-21.2,-11.4],[3.1,-21.3,-11.45],[3.55,-21.35,-12.15],[4.2,-21.1,-11.7],[8,-20.8,-11.2]],0,8);
function dBall(d:number):V3{
 if(d<2.75){const p=posT(DA,d),v=velT(DA,d),sp=Math.hypot(v[0],v[1])||1,dd=.55+.1*Math.sin(d*6);return[p[0]+v[0]/sp*dd*clamp(sp),.11,p[1]+v[1]/sp*dd*clamp(sp)];}
 if(d<3.5){const p0=(()=>{const p=posT(DA,2.749),v=velT(DA,2.749),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*.55*clamp(sp),p[1]+v[1]/sp*.55*clamp(sp)];})(),u=sm(2.75,3.05,d);return[lerp(p0[0],DB0[0],u),.11,lerp(p0[1],DB0[1],u)];}
 if(d<3.95){const u=easeOut(clamp((d-3.5)/.45));return[lerp(DB0[0],DB1[0],u),.11,lerp(DB0[1],DB1[1],u)];}
 if(d<DC)return[DB1[0],.11,DB1[1]];
 const s=d-DC;if(s<DTF){const u=s/DTF;return dcurl(1.1*u-.1*u*u);}
 const e=s-DTF;if(e<.16)return mix3(DHIT,[1.2,1.9,3],easeOut(e/.16));const q=clamp((e-.16)/.5);return[lerp(1.2,1.75,q),Math.max(.11,1.9*(1-q*q)),lerp(3,2.8,q)];
}
/** the fake: plant the LEFT foot out wide, dip the left shoulder, look outside; the cut: the right foot reaches across and flicks it inside */
const FAKE:Partial<Pose>={lHipA:34,lHipF:18,lKnee:40,rKnee:36,bend:-16,twist:18,lean:18,lShA:58,rShA:30,lElb:30,rElb:40,neckY:22,neckP:20};
const CUT:Partial<Pose>={rHipF:30,rHipA:-14,rHipR:-18,rKnee:34,rAnk:20,bend:10,twist:-14,lean:16,lShA:50,rShA:36,neckP:32};
function dPoseA(d:number):{pose:Pose;place:Place}{
 const[x,z]=posT(DA,d),v=velT(DA,d),sp=Math.hypot(v[0],v[1]),toD=YAW(posT(DD,d)[0]-x,posT(DD,d)[1]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toD,p:Pose=blendPose(READY,dribble(samp(DA,DA.D,d)/1.9,{foot:'r',speed:.3+.5*clamp(sp/5)}),clamp(sp/1.2));
 if(d>2.4&&d<3.55)yaw=lerpAng(yaw,toD,sm(2.4,2.7,d));
 p=over(p,{lean:22,lKnee:50,rKnee:48,neckP:10},bump(2.5,3.2,d)*.9);// face up: low, square on, eyes on the defender
 p=over(p,FAKE,bump(3,3.6,d));p=over(p,CUT,bump(3.4,3.95,d));
 const u=(d-(DC-STRIKE_CONTACT*DS))/DS;if(u>-.2){yaw=lerpAng(yaw,DGS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.85}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));}
 if(d>DG+.3)p=blendPose(p,celebrate(d*1.2,{kind:'arms'}),sm(DG+.3,DG+.8,d));
 return{pose:p,place:{x,z,yaw}};}
function dPoseD(d:number):{pose:Pose;place:Place}{
 const[x,z]=posT(DD,d),v=velT(DD,d),sp=Math.hypot(v[0],v[1]),a=posT(DA,d),yaw=YAW(a[0]-x,a[1]-z);
 let p=sp>.4&&d<2.6?blendPose(READY,backpedal(samp(DD,DD.D,d)/1.1),clamp((sp-.4)/.8)):READY;
 // bites on the fake: lunges toward HIS right (the attacker's left, the touchline side)
 const lu=(d-3.1)/.8;if(lu>0&&lu<1.8)p=blendPose(p,lunge(Math.min(1,lu),{side:'r'}),Math.min(sm(0,.2,lu),1-sm(1.1,1.8,lu)));
 if(d>DG+.3)p=over(p,{lean:34,neckP:30,lShA:18,rShA:18,lElb:20,rElb:20},sm(DG+.3,DG+1,d)*.8);
 return{pose:p,place:{x,z,yaw}};}
const ch4q=()=>({hd:T(3,'How he does it'),ra:T(3,'run at'),yt:T(3,'Your turn'),fd:T(3,'face your defender'),fo:T(3,'fake one way'),ci:T(3,'cut inside'),sh:T(3,'shoot'),end:SEC(3)});
const dClock=(t:number)=>{const q=ch4q();return key(t,mono([[0,0],[q.ra,.9],[q.yt,2.3],[q.fd,2.6],[q.fo,3.1],[q.ci,3.55],[q.sh,DC-.15],[q.end,DC+1.25]]),x=>x);};
/** low behind the attacker's left shoulder (the fake and the cut read side to side), then up and back to watch it curl in */
function ch4Cam(t:number){const q=ch4q(),d=dClock(t),a=posT(DA,Math.min(d,3.9)),df=posT(DD,d),u=sm(q.sh-.5,q.sh+.6,t,easeInOutSine);
 const pos:V3=mix3([a[0]-5.4,1.7,a[1]-2.6],[DB1[0]-5.2,2.6,DB1[1]-2.4],u),look:V3=mix3([(a[0]+df[0])/2+.8,.9,(a[1]+df[1])/2+.4],[-10,1.2,-2.2],u);
 return cam(pos,look,lerp(1900,1750,u));}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=ch4Cam(t),d=dClock(t),dp=dClock(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round the duel, the goal in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[4,0,-30],[4,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(-22.6,-10.6,6),.2);s.tone(Y,pool(-22.6,-10.6,3.2),.2);s.tone(Y,pool(-1,1,5),.15);
  const box=new Path2D();groundLine(box,c,[-16.5,-20.16],[-16.5,20.16],.12);groundLine(box,c,[0,-20.16],[-16.5,-20.16],.12);s.knockout(box,.5);
  goal(s,c,dp>DG?netRipple(dp-DG,[2,1.9,3]):undefined,dp>DG?settle(dp-DG,0,{freq:9,decay:7}):0);
  const W=(p:V3)=>Math.max(5,.1*kAt(c,p));
  // "run at": a straight arrow from him to the defender
  const ra=sm(q.ra,q.ra+.4,tt,easeOut)*(1-sm(q.fd,q.fd+.4,tt));if(ra>.02){const a=posT(DA,dp),df=posT(DD,dp),pts:V3[]=[];for(let i=0;i<=8;i++){const u=i/8*ra*.8;pts.push([lerp(a[0]+.6,df[0]-.8,u),.03,lerp(a[1],df[1],u)]);}groundArrow(s,c,pts,W([a[0],0,a[1]]),.95);}
  // "face your defender": a face-to-face bar between them on the grass
  const fd=sm(q.fd,q.fd+.3,tt,easeOutBack)*(1-sm(q.fo+.2,q.fo+.6,tt));if(fd>.02){const a=posT(DA,dp),df=posT(DD,dp),r1=groundRing(c,a[0],a[1],.7*fd,20),r2=groundRing(c,df[0],df[1],.7*fd,20),p=new Path2D();
   if(r1.length>2)p.addPath(ribbon(r1,W([a[0],0,a[1]])*.7,{close:true,taper:0,wobble:.6}));if(r2.length>2)p.addPath(ribbon(r2,W([df[0],0,df[1]])*.7,{close:true,taper:0,wobble:.6}));yInk(s,p,.95);}
  // "fake one way": an arrow out toward the touchline (the fake) and the defender's weight going with it
  const fo=sm(q.fo,q.fo+.35,tt,easeOut)*(1-sm(q.ci+.3,q.ci+.8,tt));if(fo>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const u=i/8*fo;pts.push([DB0[0]+.3*u,.03,DB0[1]-.3-2.2*u]);}groundArrow(s,c,pts,W([DB0[0],0,DB0[1]]),.9,true);
   const df=posT(DD,dp),pd:V3[]=[];for(let i=0;i<=6;i++){const u=i/6*fo;pd.push([df[0],.03,df[1]-.2-1.4*u]);}groundArrow(s,c,pd,W([df[0],0,df[1]])*.7,.7);}
  // "cut inside": a bold arrow across, inside, onto the right foot
  const ci=sm(q.ci,q.ci+.35,tt,easeOut)*(1-sm(q.sh+.3,q.sh+.8,tt));if(ci>.02){const pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*ci;pts.push([lerp(DB0[0],DB1[0]+.6,u)-.5*Math.sin(Math.PI*u),.03,lerp(DB0[1],DB1[1]+1,u)]);}groundArrow(s,c,pts,W([DB1[0],0,DB1[1]])*1.2,.95);}
  // "shoot": the curl draws itself (dotted in the air), the corner bracket
  const sh=sm(q.sh-.1,q.sh+.6,tt,easeOut);if(sh>.02){const dots=new Path2D();for(let i=0;i<=24;i+=2){const p=dcurl(i/24*sh);if(depthOf(c,p)<NEAR)continue;const pp=P(c,p),r=clamp(.07*kAt(c,p),9,16);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}yInk(s,dots,.95);}
  cornerBracket(s,c,sm(q.sh,q.sh+.4,tt,easeOutBack));
  // the two figures and the ball, depth sorted (duotone, no numbers)
  const A=dPoseA(dp),Dd=dPoseD(dp),b=dBall(d),items:Item[]=[];
  items.push({depth:depthOf(c,[A.place.x!,0,A.place.z!]),draw:()=>drawPlayer(s,A.pose,c,duo(YILDIZ,true),A.place,{prev:dPoseA(dp-1/12),smear:true})});
  items.push({depth:depthOf(c,[Dd.place.x!,0,Dd.place.z!]),draw:()=>drawPlayer(s,Dd.pose,c,duo(BVB(null,{seed:91})),Dd.place,{prev:dPoseD(dp-1/12)})});
  items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR+.2)return;const q2=P(c,b),a=P(c,dBall(d-.03)),r=Math.max(14,BALL_R*kAt(c,b));ballShadow(s,c,b);whiteBall(s,q2[0],q2[1],r,d*9,{sq:clamp(Math.hypot(q2[0]-a[0],q2[1]-a[1])/(r*3),0,.7),dir:Math.atan2(q2[1]-a[1],q2[0]-a[0]),duo:true});}});
  items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
  if(dp>=DC&&dp<DC+.25){const p=P(c,[DB1[0],.15,DB1[1]]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(DC+.1,DC+.25,dp),width:11});}},
 still:3.4,
};

const story:RisoStory={
 id:'yildiz-signature',format:'11v11',title:'Yıldız cuts inside',
 theme:'Face your defender, fake one way, and cut inside to shoot.',
 ageNote:'UEFA Champions League, Juventus 4–4 Borussia Dortmund, Turin, 16 September 2025: his 63rd-minute curler "alla Del Piero" from the left edge of the box. The last chapter is a demonstration of the move.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: cut inside — a short yellow cut arrow, then the ball curls away from the point. Reduced motion: the arrow and the ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),pt=(v:number):Pt=>[x+v*240+Math.sin(v*Math.PI)*110,y-v*170-Math.sin(v*Math.PI)*30];
  const cut:Pt[]=[[x-120,y+60],[x-70,y+40],[x-20,y+8],[x,y]];s.fill(Y,ribbon(cut,12,{taper:.3,wobble:1}),.9);
  const trail:Pt[]=[];for(let i=0;i<=16;i++)trail.push(pt(i/16*Math.max(.15,u)));
  s.fill(Y,ribbon(trail,14,{taper:.6,wobble:1}),.9);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  const b=pt(u);whiteBall(s,b[0],b[1],48,age*12+hash(seed,3)*TAU);
 },
};
export default story;
