/** Signature film: Arda Güler, "the left-footed curler" — his curler v Georgia, Türkiye 3–1 Georgia, UEFA Euro 2024 Group F,
 * Westfalenstadion (BVB Stadion), Dortmund, 18 June 2024 (kick-off 18:00).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/guler-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/guler-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/guler-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Güler a signature ("the left-footed curler", lesson: wrap your foot around the ball to
 * curl it into the top corner). His goal v Georgia is the best-documented example of exactly that: a left-footed curler from 25 yards into
 * the top of the far corner, on his European Championship debut. Written sources describe the play itself, so the real match is recreated
 * (no separate "how he does it" demo is needed); only what the sources give is staged, everything else is listed as inferred below.
 *
 * SOURCES (fetched Sept 2026 with curl, cached in scratchpad/films/src-cache/; the footage itself was not reviewed):
 *  - Wikipedia, "UEFA Euro 2024 Group F" (Turkey vs Georgia: date, 18:00 kick-off, 3–1, goals Müldür 25', Güler 65', Aktürkoğlu 90+7',
 *    Mikautadze 32', Westfalenstadion, attendance 59,127, line-ups/numbers/positions, player of the match Güler; kits from UEFA's line-up
 *    sheet: Turkey ALL RED (E10016, pattern _tur24a), Georgia ALL WHITE) https://en.wikipedia.org/wiki/UEFA_Euro_2024_Group_F
 *  - Wikipedia, "Arda Güler": left-footed attacking midfielder / right winger; the goal made him the youngest debutant to score at a Euro
 *    finals, aged 19 years 114 days https://en.wikipedia.org/wiki/Arda_G%C3%BCler
 *  - The Guardian, Sid Lowe, "Arda Guler brings the thunder as Turkey survive storm to beat Georgia" (18 June 2024)
 *    https://www.theguardian.com/football/article/2024/jun/18/turkey-georgia-euro-2024-group-f-match-report
 *  - The Guardian live blog, "Turkey v Georgia: Euro 2024 – live" (18 June 2024), the 65th-minute entry and photo captions
 *    https://www.theguardian.com/football/live/2024/jun/18/turkey-v-georgia-euro-2024-live-scores
 *  - lib/town/playerAppearance.json (Turkey; skin/hair) and lib/town/playerCareers.json (Fenerbahçe 2021–23, Real Madrid 2023–).
 * CONFIRMED by those accounts: 18 June 2024, Dortmund, Euro 2024 Group F, Turkey 3–1 Georgia; the match "played in a fittingly epic biblical
 *  storm, water cascading off the Westfalenstadion roof"; the south stand ("the yellow wall") was "red for the day" with Turkey fans; 1–1
 *  when Güler scored in the 65th minute (2–1); the move: Georgia got the ball clear but Giorgi Tsitaishvili (21, Georgia's left wing-back)
 *  "overplays, caught in possession by [Kaan] Ayhan (22), the ball breaks to Guler, 25 yards out" and he "curls a stunningly joyous finish
 *  that shaves the inside of the far post, seven-eighths of the way up" / "curled left-footed into the far corner from 25 yards"; the keeper
 *  Giorgi Mamardashvili (25) "has no chance"; Güler "stood with a hand to his ear" and was joined by his team-mates; Güler wore 8 and played
 *  on the right; Kochorashvili 6, Kakabadze 2, Kashia 4, Dvali 3, Kvirkvelia 5, Mekvabishvili 20, Chakvetadze 10, Mikautadze 22,
 *  Kvaratskhelia 7; Turkey: Çalhanoğlu 10, Kökçü 6, Yıldız 19, Barış Alper Yılmaz 21, Kadıoğlu 20, Müldür 18.
 * INFERRED / ILLUSTRATIVE: every position and run in metres (Tsitaishvili carrying out of the right-hand channel, Ayhan's poke, the ball
 *  breaking inside to Güler ≈ 23 m out and right of centre, his set-up touch, a strike from ≈ 24 m); the ball's flight (it sets off out to
 *  his LEFT, wide of the far post, and bends back RIGHT — left-to-right from the shooter, the clockwise spin of a left-footed inside-of-the-
 *  boot curler — into the top far corner, beyond the keeper, just inside the post);
 *  that it grazes rather than rebounds off the post; Mamardashvili's late dive to his right; which end Turkey attacked (drawn left to right
 *  toward the south stand on the main camera); where Güler celebrated and which hand went to his ear; the rain's strength at that minute;
 *  Turkey's white numbers/trim and Georgia's red trim and numbers; Mamardashvili's kit colour (drawn yellow, never named); hair styles; the
 *  ball design (a white 2024 ball with navy and red panels); the stadium drawn as steep boxy stands close to the pitch under a flat navy roof
 *  with yellow pylons, a storm-grey sky; crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 the ball breaks to Güler): ch1 = the high main-stand broadcast camera, live, in the rain (Tsitaishvili overplays, Ayhan
 * pokes it, it breaks to Güler, the curler, the top corner); ch2 = the TV slow-motion replay, low and close behind Güler (the left foot
 * wrapping round the side of the ball, the spin, the bend toward the far post); ch3 = the replay from behind the far post (beyond the
 * keeper's reach, just inside the post, then the hand to his ear); ch4 = a duotone lesson (wrap your foot around the ball, curl it into
 * the top corner). Seams are forward passages into the ball. The curler is a quadratic Bézier on the ground (it starts out left of the far
 * post and bends back right, in toward the goal, into the far corner) with a rising-dipping height profile; contact reads the solved skeleton's LEFT toe so ball and
 * boot always meet. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never
 * sheet.safe) with a lens that widens for a square window. Inks: yellow (light, grass with blue, pylons), red (Turkey, skin, the crowd),
 * blue (sky, grass), navy (key line, storm, roof). Scenes read only their local t; poses on twos, cameras on ones; all randomness is seeded.
 * Budget ≈ 150–260 plate ops per frame (small wide-shot figures print at 'low'; the rain is one op). */
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`guler film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py guler-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/guler-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Dortmund, live','Dortmund, Euro 2024, in a huge storm. Turkey, in red, face Georgia. A teammate wins the ball. It breaks to Arda Güler, outside the box. He curls it with his left foot... top corner! Goal!',
  ['Dortmund','huge storm','Turkey, in red','Georgia','wins the ball','Arda Güler','outside the box','He curls it','left foot','top corner','Goal']),
 prov('Watch again','Watch again, slowly. He wraps his left foot around the side of the ball. It spins, and bends toward the far post.',
  ['Watch again','slowly','He wraps','left foot','side of the ball','spins','bends','far post']),
 prov('The far post','From behind: the keeper cannot reach it. Just inside the post! He cups his ear to the crowd.',
  ['From behind','keeper cannot reach','Just inside the post','cups his ear','crowd']),
 prov('Your turn','Your turn: wrap your foot around the ball, and curl it into the top corner.',
  ['Your turn','wrap your foot','around the ball','curl it','top corner']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`guler film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= Dortmund: steep boxy stands hard against the pitch, a flat roof on yellow pylons, the south terrace red for the day =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-116,.9,-36.5],[12,.9,-36.5],[12,30,-60],[-116,30,-60]],// far side (across from the TV camera): two tiers
 [[7.5,.9,44],[7.5,.9,-44],[40,36,-44],[40,36,44]],// the south terrace behind the goal Turkey attack: one huge steep tier
 [[12,.9,36.5],[-116,.9,36.5],[-116,30,60],[12,30,60]],// the main stand under the camera
 [[-112.5,.9,-44],[-112.5,.9,44],[-140,30,44],[-140,30,-44]],// north stand
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red / 2 yellow / 3 blue / 4 navy, phase] — Turkey red and white everywhere, the south terrace a red wall */
const CROWD=(()=>{const r=rng(1806),out:[number,number,number,number,number][]=[];[760,520,620,340].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.03+r()*.93;if(st!==1&&Math.abs(v-.5)<.035)continue;
 out.push([st,r(),v,st===1?(c<.14?0:c<.9?1:4):(c<.3?0:c<.72?1:c<.78?2:c<.88?3:4),r()*TAU]);}});return out;})();
/** the eight yellow pylons that carry the roof, standing proud above it outside the long sides */
const PYLONS:[number,number][]=[[-96,-66],[-66,-66],[-38,-66],[-8,-66],[-96,66],[-66,66],[-38,66],[-8,66]];
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;post?:number;storm?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t,storm=1}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a storm sky over Dortmund (18:00 kick-off in June: daylight, but under black cloud): blue, heavy navy, a pale seam low down
 s.field(B,.5,.6);s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true),.3+.12*storm);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.knockout(polyPath([[-Bnd,hz-120],[Bnd,hz-150],[Bnd,hz+40],[-Bnd,hz+60]],true),.18);
 // stands: knocked out, a navy-grey screen, rows; one fascia band on the two-tier stands; the flat roof (navy) with the floodlight line
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),leds=new Path2D(),lamps=new Path2D(),masts=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<18;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/18),bil(q,1,k/18),bil(q,1,(k+1)/18),bil(q,0,(k+1)/18)]));
  const lift:V3=[0,3,0],over=(si===0?[0,0,24]:si===2?[0,0,-24]:si===1?[-26,0,0]:[22,0,0]) as V3;
  addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(add(q[2],lift),over),add(add(q[3],lift),over)]));
  if(si!==1){const v=.5;addPoly(fascia,clipPoly(c,[bil(q,0,v-.03),bil(q,1,v-.03),bil(q,1,v+.03),bil(q,0,v+.03)]));addPoly(leds,clipPoly(c,[bil(q,0,v-.012),bil(q,1,v-.012),bil(q,1,v+.012),bil(q,0,v+.012)]));}
  for(let k=0;k<22;k++){const u=(k+.5)/22,p=add(add(bil(q,u,1),lift),over);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}});
 // (only pylons well in front of the lens: a mast near the image plane projects to enormous lengths and ribbon() would sample all of it)
 const onSheet=(p:Pt)=>Math.abs(p[0])<Bnd&&Math.abs(p[1])<Bnd;
 for(const[x,z] of PYLONS){const a:V3=[x,18,z],b:V3=[x,58,z*.97],r0w:V3=[x+18,34,z*.92],r1w:V3=[x-18,34,z*.92];if(Math.min(depthOf(c,a),depthOf(c,b),depthOf(c,r0w),depthOf(c,r1w))<15)continue;
  const pa=P(c,a),tip=P(c,b),r0=P(c,r0w),r1=P(c,r1w);if(!onSheet(pa)||!onSheet(tip)||!onSheet(r0)||!onSheet(r1))continue;const w=Math.max(3,1.4*kAt(c,a));masts.addPath(ribbon([pa,tip],w,{taper:.3,pressure:0,wobble:.4}));
  masts.addPath(ribbon([tip,r0],Math.max(1.5,w*.25),{taper:0,pressure:0,wobble:0}));masts.addPath(ribbon([tip,r1],Math.max(1.5,w*.25),{taper:0,pressure:0,wobble:0}));}
 s.knockout(stands);s.tone(K,stands,.46);s.tone(B,stands,.2);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(K,heads[4],.9);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.tone(K,fascia,.5);s.fill(Y,leds,.7);s.fill(K,roof,.92);s.knockout(lamps,.95);yInk(s,masts,.95);
 // LED boards along the touchlines and behind the goal
 const bB=new Path2D(),bP=new Path2D();for(const z of[-35.4,35.4])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(B,bB,.9);s.fill(R,bP,.8);
 // grass: yellow × blue = green, mowing stripes, a wet navy sheen, paper lines (the box, the D, the six-yard box, the spot)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[5,0,-35],[5,0,35],[-110,0,35]]));s.knockout(gp);yInk(s,gp,.84);s.tone(B,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.14+.06*storm);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net,o.post??0);
}
/** the rain: slanted paper streaks falling in screen space (seeded, on twos), one knockout op; `amt` 0…1.5 */
function rain(s:Sheet,t:number,amt:number,len=1){if(amt<=.02)return;const tt=twos(t),Wd=s.W*.75,Hd=s.H*.75,r=rng(4711),p=new Path2D(),n=Math.round(90*amt),L=(90+60*amt)*len,sl=.26;
 for(let i=0;i<n;i++){const x0=r()*2-1,y0=r(),sp=.8+r()*.5,y=((y0+tt*1.6*sp)%1)*2-1,x=x0*Wd-y*Hd*sl,yy=y*Hd,w=3+r()*3;
  p.moveTo(x-w,yy);p.lineTo(x+w,yy);p.lineTo(x+w-L*sl,yy-L);p.lineTo(x-w-L*sl,yy-L);p.closePath();}
 s.knockout(p,.5);}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple; `post` shivers the far post (z = −3.66) */
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
 bar([0,0,-W],[sh,H+.06,-W+sh]);bar([0,0,W],[0,H+.06,W]);bar([sh,H,-W-.06+sh],[0,H,W+.06]);
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

// ================= kits (18 June 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]];
type Kit=AthleteStyle;
/** Turkey: all red (confirmed, UEFA line-up sheet); white numbers and trim (inferred) */
const TUR=(n:number,o:Partial<Kit>={}):Kit=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.28],sleeves:'short',number:n,numberInk:'paper',seed:40+n,...o});
/** Georgia: all white (confirmed); red trim and numbers (inferred) */
const GEO=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:R,seed:60+n,...o});
/** Arda Güler, Turkey 8: skin 1 / dark hair (playerAppearance.json), slight build */
const GULER:Kit=TUR(8,{skin:SKIN_M,hair:[K,.9],hairStyle:'short',build:{height:1.76,bulk:.86,thighs:.94,head:1.02},seed:8});
const MAMA:Kit={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',gloves:[B,.8],line:K,sleeves:'long',shade:[K,.26],number:25,numberInk:K,build:{height:1.97},seed:25};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the ball breaks to Güler) =================
const GB:Build=GULER.build!;
/** the ball's stops: TK Ayhan's poke, Y0 it breaks to Güler, B2 after his set-up touch (all inferred) */
const TK=-1.05,Y0:[number,number]=[-23.3,6.35],B2:[number,number]=[-22.9,5.25];
const CONTACT=1.05,TF=.95,T_GOAL=CONTACT+TF;
/** the curler: from B2 it sets off out to his LEFT, aimed wide of the far post (control point), and bends back RIGHT — left-to-right from the
 * shooter, the left foot's clockwise spin — into the top far corner, shaving the inside of the far post seven-eighths of the way up */
const CTRL:[number,number]=[-10.2,-4.4],HIT:V3=[0,2.14,-3.42],POST:V3=[0,2.14,-3.66];
const D1:V3=[1.2,1.95,-3.05],D2:V3=[1.75,.11,-2.8],NET_HIT:V3=[2,1.9,-3.0];
const curl=(u:number):V3=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*B2[0]+b*CTRL[0]+c*HIT[0],lerp(.11,HIT[1],u)+1.05*Math.sin(Math.PI*u)*(1-.3*u),a*B2[1]+b*CTRL[1]+c*HIT[2]];};
/** the body opened a little LEFT of the far post at the strike (the ball starts left, outside the post, and bends back right) */
const GS=YAW(HIT[0]-B2[0],HIT[2]-B2[1])+12*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.85}),GB,{yaw:GS});
const GP:[number,number]=[B2[0]-SHOT_SK.lToe[0],B2[1]-SHOT_SK.lToe[2]];
const [sfx,sfz]=dirOf(GS);
const CUP0=T_GOAL+2.3;// he stops and cups his ear (place inferred)
const CUP_AT:[number,number]=[-16.6,13.2];

type Role='hero'|'tur'|'geo'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Güler',role:'hero',style:GULER,key:true,keys:[[-10,-30,12],[-5,-27.5,9.6],[-2,-25.2,7.6],[-.6,-24.4,6.95],[0,-23.95,6.6],[.45,-23.7,6.1],[CONTACT,GP[0],GP[1]],[CONTACT+.5,GP[0]+sfx*.5,GP[1]+sfz*.5],[T_GOAL+.3,GP[0]+.6,GP[1]+.9],[T_GOAL+1.3,-20,8.6],[CUP0-.2,CUP_AT[0],CUP_AT[1]],[T_GOAL+9,CUP_AT[0],CUP_AT[1]]]},
 {name:'Ayhan',role:'tur',style:TUR(22,{hair:[K,.85]}),key:true,keys:[[-10,-31,15],[-4,-26.4,12.9],[-1.7,-23.8,12.4],[TK,-23.3,12.25],[0,-23.1,11.6],[2,-22.2,10.4],[T_GOAL+1,-21,10],[CUP0+1.6,-19,13.4],[T_GOAL+9,-19,13.4]]},
 {name:'Tsitaishvili',role:'geo',style:GEO(21,{hair:[K,.8]}),key:true,keys:[[-10,-11,17],[-6,-15.2,15.1],[-3,-19.6,13.3],[TK-.2,-22.1,12.35],[TK+.3,-22.3,12.2],[.8,-21.9,11.4],[3,-20.5,9.6],[9,-19,8.5]]},
 {name:'Mamardashvili',role:'gk',style:MAMA,key:true,keys:[[-10,-3.4,2.6],[-2,-2.6,1.9],[0,-2.2,1.5],[CONTACT,-1.8,.9],[9,-1.8,.9]]},
 {name:'Kochorashvili',role:'geo',style:GEO(6,{hair:[K,.85]}),keys:[[-10,-16,6],[-2,-18.8,5.6],[0,-19.4,5.8],[CONTACT,-19.7,3.4],[4,-19.4,3.2],[9,-20,5]]},
 {name:'Yıldız',role:'tur',style:TUR(19,{hair:[K,.8],build:{height:1.86}}),keys:[[-10,-20,-12],[0,-15,-9.5],[CONTACT,-12.6,-8],[T_GOAL+1,-13.5,-4],[CUP0+2,-18.4,15.4],[T_GOAL+9,-18.4,15.4]]},
 {name:'Kökçü',role:'tur',style:TUR(6,{hair:[K,.9]}),keys:[[-10,-24,-2],[0,-19,-1],[CONTACT,-17.2,-.4],[T_GOAL+1,-18,3],[CUP0+2.2,-17.2,16.2],[T_GOAL+9,-17.2,16.2]]},
 {name:'Barış Alper',role:'tur',style:TUR(21,{hair:[K,.85]}),keys:[[-10,-14,1],[0,-12.2,2.5],[CONTACT,-10.6,1.4],[T_GOAL+1,-11,3],[CUP0+2.5,-19.6,11.6],[T_GOAL+9,-19.6,11.6]]},
 {name:'Çalhanoğlu',role:'tur',style:TUR(10,{hair:[K,.7]}),keys:[[-10,-38,4],[0,-32,4],[4,-28,5],[9,-24,8]]},
 {name:'Müldür',role:'tur',style:TUR(18,{hair:[K,.85]}),keys:[[-10,-40,26],[0,-33,24],[5,-30,22]]},
 {name:'Kadıoğlu',role:'tur',style:TUR(20,{hair:[K,.8]}),keys:[[-10,-40,-22],[0,-34,-20],[5,-33,-18]]},
 {name:'Kakabadze',role:'geo',style:GEO(2,{hair:[K,.85]}),keys:[[-10,-16,-18],[0,-13.5,-13],[CONTACT,-11.8,-10.5],[9,-10,-9]]},
 {name:'Dvali',role:'geo',style:GEO(3,{hair:[K,.8],build:{height:1.9}}),keys:[[-10,-15,-6],[0,-12.6,-5.2],[CONTACT,-11.4,-4.4],[9,-10,-4]]},
 {name:'Kashia',role:'geo',style:GEO(4,{hair:[K,.85]}),keys:[[-10,-15,.5],[0,-12.8,.6],[CONTACT,-11.3,.4],[9,-10,0]]},
 {name:'Kvirkvelia',role:'geo',style:GEO(5,{hair:[K,.6],build:{height:1.9}}),keys:[[-10,-14,7],[0,-12.6,6],[CONTACT,-11.2,4.8],[9,-10,4]]},
 {name:'Mekvabishvili',role:'geo',style:GEO(20,{hair:[K,.85]}),keys:[[-10,-22,-5],[0,-19.5,-3.8],[CONTACT,-18.2,-2],[9,-17,-1]]},
 {name:'Chakvetadze',role:'geo',style:GEO(10,{hair:[K,.8]}),keys:[[-10,-30,-9],[0,-27,-8],[5,-24,-6]]},
 {name:'Mikautadze',role:'geo',style:GEO(22,{hair:[K,.9]}),keys:[[-10,-40,3],[0,-36,2],[5,-33,2]]},
 {name:'Kvaratskhelia',role:'geo',style:GEO(7,{hair:[K,.8]}),keys:[[-10,-38,-15],[0,-35,-13],[5,-32,-12]]},
];
const GUL=0,AYH=1,TSI=2,GK=3,KOC=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---- the ball: Tsitaishvili carries it out → Ayhan pokes it loose → it breaks inside to Güler → his touch → the curler → the net ----
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const BT=fwdBall(TSI,TK,.5);
function ballAt(tau:number):V3{
 if(tau<TK){const f=fwdBall(TSI,tau,.5+.14*Math.sin(tau*5.5));return[f[0],.11,f[1]];}
 if(tau<0){const u=(tau-TK)/-TK,e=1.5*u-.5*u*u;return[lerp(BT[0],Y0[0],e),.11+.25*Math.sin(Math.PI*clamp(u*1.6))*(1-u),lerp(BT[1],Y0[1],e)];}
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
const RECEIVE:Partial<Pose>={lean:12,lHipF:26,lKnee:34,lAnk:-12,rKnee:30,lShA:40,rShA:36,lElb:40,rElb:40,neckP:30};
/** "he cups his ear": standing tall, chest out, the right hand cupped behind the right ear, the left arm out, head tilted — turned to the
 * red south terrace (direction and hand inferred) */
const CUP=posed({lHipF:6,rHipF:-4,lKnee:10,rKnee:8,lHipA:8,rHipA:8,lean:-10,pitch:-3,bend:-8,rShA:112,rShF:24,rElb:150,rShR:20,rHand:1,lShA:42,lShF:12,lElb:24,lHand:1,neckY:-14,neckP:-10});
const SD=.95,S_START=CONTACT-STRIKE_CONTACT*SD;
const goalYaw=(x:number,z:number)=>YAW(-x,-.8-z);
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<-.5){p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.1,{speed:clamp(sp/7)}),clamp(sp/1.1));if(tau>-1.6)yaw=lerpAng(yaw,toBall,sm(-1.6,-.8,tau));}
  else if(tau<T_GOAL+.2){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.4+.3*clamp(sp/4)});p=blendPose(READY,dr,clamp(sp/.9));
   yaw=sp>.5?lerpAng(YAW(v[0],v[1]),goalYaw(x,z),.45):goalYaw(x,z);
   p=over(p,RECEIVE,bump(-.5,.4,tau));
   const u=(tau-S_START)/SD;if(u>-.2){yaw=lerpAng(yaw,GS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.85}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));
    p=over(p,{twist:-12},bump(.25,.8,u));}}
  else if(tau<CUP0-.3){p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.2,T_GOAL+.7,tau));}
  else{const u=sm(CUP0-.3,CUP0+.2,tau);p=blendPose(celebrate(distOf(k,tau)/3.4,{kind:'run'}),CUP,u);p=over(p,{neckY:-14+10*Math.sin((tau-CUP0)*1.3),lean:-10-3*Math.sin((tau-CUP0)*2)},u);
   yaw=lerpAng(YAW(v[0]||-1,v[1]),YAW(1,-.75),u);}
 }else if(a.role==='gk'){
  yaw=toBall;const q=keeperSet(tau*1.5),dAt=T_GOAL-.02,dd=.9,t0=dAt-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'r',height:.95}):q;if(u>0)yaw=YAW(1,0)+Math.PI;
 }else{
  const geo=a.role==='geo',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(geo&&k!==TSI&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(geo?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  if(k===TSI&&tau<TK){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.5});p=blendPose(p,dr,.8);}
  if(k===TSI&&tau>=TK){p=over(p,{twist:20,neckY:40,lShA:50,rShA:40},sm(TK,TK+.4,tau)*(1-sm(1.5,2.5,tau)));}
  if(k===AYH){const lu=(tau-(TK-.6*.7))/.7;if(lu>0&&lu<1.6){p=blendPose(p,lunge(Math.min(1,lu),{side:'r'}),Math.min(sm(0,.15,lu),1-sm(1,1.6,lu)));yaw=YAW(BT[0]-x,BT[1]-z);}}
  if(k===KOC&&tau>-.5&&tau<CONTACT+.6)yaw=YAW(posOf(GUL,tau)[0]-x,posOf(GUL,tau)[1]-z);
  if(a.role==='tur'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau));
  if(a.role==='geo'&&tau>T_GOAL+.6)p=over(p,{lean:34,neckP:30,lShA:18,rShA:18,lElb:20,rElb:20},sm(T_GOAL+.6,T_GOAL+1.4,tau)*.8);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Güler with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. `style` swaps kits (the duotone lesson). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;only?:number[];style?:(k:number)=>Kit;duoBall?:boolean;noBall?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===GUL?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==GUL&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==GUL&&hPx<150)?'low':o.cap?'mid':undefined;
  const style=o.style?o.style(k):a.style,hero=k===GUL&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 if(!o.noBall)items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx),duo:o.duoBall});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, the tackle) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** the curler's path on the grass (projected shadow line) or in the air, u ∈ [0, n] */
function curlPath(c:Camera,n:number,air:boolean):Pt[]{const pts:Pt[]=[];for(let i=0;i<=30;i++){const u=i/30*n,p=curl(u),q:V3=air?p:[p[0],.03,p[2]];if(depthOf(c,q)>NEAR)pts.push(P(c,q));}return pts;}
/** "top corner": a yellow corner bracket in the angle of the far post and the bar */
function cornerBracket(s:Sheet,c:Camera,w:number){if(w<=.02)return;const C0:V3=[0,2.44,-3.66];if(depthOf(c,C0)<NEAR+.3)return;const k=kAt(c,C0),a=P(c,[0,2.44-.9*w,-3.66]),m=P(c,C0),b=P(c,[0,2.44,-3.66+.9*w]);yInk(s,ribbon([a,m,b],Math.max(7,.14*k),{taper:.1,wobble:1}),.95);}
/** the ball's dotted flight so far (out wide of the far post, then swerving right, back in to the corner) */
function flightDots(s:Sheet,c:Camera,tp:number,size:number,ink:'y'|'k'){if(tp<=CONTACT||tp>=T_GOAL+.3)return;const dots=new Path2D();for(let i=0;i<=18;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(size*kAt(c,p),8,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}if(ink==='y')yInk(s,dots,.9);else s.fill(K,dots,.6);}

// ================= chapter 1 (live): the high main-stand camera in the rain; Tsitaishvili overplays, Ayhan pokes it, Güler curls it in =================
const ch1q=()=>({dm:T(0,'Dortmund'),hs:T(0,'huge storm'),tr:T(0,'Turkey, in red'),ge:T(0,'Georgia'),wb:T(0,'wins the ball'),ag:T(0,'Arda Güler'),ob:T(0,'outside the box'),hc:T(0,'He curls it'),lf:T(0,'left foot'),tc:T(0,'top corner'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: the pre-roll is Georgia carrying it out, the play runs at ≈ 0.6–1.3× real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-9.4],[q.tr,-6.8],[q.wb,TK-.35],[q.ag,-.05],[q.ob,.45],[q.hc,CONTACT-.1],[q.lf,CONTACT+.05],[q.tc,T_GOAL],[q.g,T_GOAL+.55],[q.end,T_GOAL+.55+(q.end-q.g)*.95]]),x=>x);};
const BCAM:V3=[-20,19,50];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),g=posOf(GUL,tau);
 if(tau<CONTACT)return[b[0]+1.5,1,b[2]];
 if(tau<T_GOAL+.6)return mix3([b[0],1.2,b[2]],[-3,1.3,-1.5],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-3,1.3,-1.5],[g[0],1.2,g[1]],sm(T_GOAL+.6,T_GOAL+2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-42,3,-34],look=mix3(wide,av(ch1Look),sm(q.hs,q.ge,t,easeInOutSine));
 const F=key(t,mono([[0,1500],[q.hs,1900],[q.tr,2700],[q.ge,3600],[q.wb,4600],[q.ag,5400],[q.hc,5200],[q.tc,4500],[q.g+.4,4400],[q.end,5000]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  const storm=.7+.5*sm(q.hs,q.hs+.6,tt)*(1-.4*sm(q.tr+.5,q.ge,tt));
  stadium(s,c,{t,storm,cheer:.18+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  // team rings: red for Turkey on "Turkey, in red", navy for Georgia on "Georgia", yellow for the ball-winner and for Güler
  const rt=sm(q.tr,q.tr+.3,tt,easeOutBack)*(1-sm(q.ge+.2,q.ge+.8,tt)),rg=sm(q.ge,q.ge+.3,tt,easeOutBack)*(1-sm(q.wb-.3,q.wb+.2,tt)),rw=sm(q.wb,q.wb+.3,tt,easeOutBack)*(1-sm(q.ag,q.ag+.5,tt)),ry=sm(q.ag,q.ag+.3,tt,easeOutBack)*(1-sm(q.hc,q.hc+.5,tt));
  if(rt>.02||rg>.02||rw>.02||ry>.02){const pa=new Path2D(),pf=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='tur'||a.role==='hero')&&rt>.02)ringAt(pa,c,k,tp,rt);if((a.role==='geo'||a.role==='gk')&&rg>.02)ringAt(pf,c,k,tp,rg);});
   if(rw>.02)ringAt(py,c,AYH,tp,rw*1.2);if(ry>.02)ringAt(py,c,GUL,tp,ry*1.2);
   s.fill(R,pa,.95);s.fill(K,pf,.9);yInk(s,py,.95);}
  // "wins the ball": a yellow burst where Ayhan pokes it loose, then a short arrow showing it break inside to Güler
  if(tp>=TK&&tp<TK+.3){const b=P(c,[BT[0],.2,BT[1]]);sparkBurst(s,Y,b[0],b[1],50+40*sm(TK,TK+.1,tp,easeOut),{n:8,seed:12,g:1-sm(TK+.1,TK+.3,tp),width:8});}
  const br=sm(q.wb+.1,q.wb+.6,tt,easeOut)*(1-sm(q.ob,q.ob+.5,tt));if(br>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10*br,p:V3=[lerp(BT[0],Y0[0],u),.03,lerp(BT[1],Y0[1]+.5,u)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(5,.12*kAt(c,[Y0[0],0,Y0[1]]));yInk(s,ribbon(pts,w,{taper:.1,wobble:.8,gaps:[[.3,.4],[.65,.75]]}),.95);yInk(s,head(pts,w),.95);}}
  // "outside the box": the edge of the box prints yellow, dashed, for a beat
  const bx=sm(q.ob,q.ob+.3,tt)*(1-sm(q.hc+.2,q.hc+.8,tt));if(bx>.02){const pts:Pt[]=[];for(let i=0;i<=24;i++){const z=lerp(-20.16,20.16,i/24),p:V3=[-16.5,.03,z];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   const gaps:[number,number][]=[];for(let x=.04;x<1;x+=.08)gaps.push([x,x+.035]);if(pts.length>1)yInk(s,ribbon(pts,Math.max(6,.22*kAt(c,[-16.5,0,6])),{taper:0,wobble:.6,gaps}),.95*bx);}
  drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
  // "He curls it": the dotted flight bending back in, left-to-right; "left foot": a spark off the left boot; "top corner": the bracket in the far top corner
  flightDots(s,c,tp,.05,'y');
  if(tp>=CONTACT&&tp<CONTACT+.25){const b=P(c,[B2[0],.2,B2[1]]);sparkBurst(s,Y,b[0],b[1],70+60*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9});}
  cornerBracket(s,c,sm(q.tc-.15,q.tc+.25,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.4,tt)));
  rain(s,t,storm);},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10,
};

// ================= chapter 2 (TV replay, slow motion, low behind Güler): the left foot wraps round the side of the ball, the spin, the bend =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),hw:T(1,'He wraps'),lf:T(1,'left foot'),sb:T(1,'side of the ball'),sp:T(1,'spins'),bd:T(1,'bends'),fp:T(1,'far post'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,.05],[q.sl,.35],[q.hw,.62],[q.lf,CONTACT-.04],[q.sb,CONTACT+.005],[q.sp,CONTACT+.18],[q.bd,CONTACT+.55],[q.fp,T_GOAL-.08],[q.end,T_GOAL+.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.w,q.lf+.3,t,easeInOutSine),follow=sm(q.sp,q.fp,t,easeInOutSine);
 const hero:V3=[GP[0],.95,GP[1]],a0=-100*D2R,a1=-168*D2R,ang=lerp(a0,a1,orbit)+GS,[dx,dz]=dirOf(ang),D=lerp(5.2,4.4,orbit)+2.2*follow;
 const pos:V3=[hero[0]+dx*D-1.5*follow,1.05+.5*follow,hero[2]+dz*D-.4*follow];
 const look=mix3(mix3(hero,[b[0],Math.min(b[1],2.2),b[2]],.35),[b[0],clamp(b[1],.8,2.4),b[2]],follow);
 const F=key(t,mono([[0,1500],[q.sl,1700],[q.hw,1900],[q.lf,2150],[q.sb,2050],[q.sp,1800],[q.fp,1900],[q.end,2100]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05,storm:.9});
  const w=drawWorld(s,c,tau,tp,{ballMin:22,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.hw-.2,q.hw+.2,tt)),cap:t>q.end-.7||t<.6});
  // "bends": the ball's path traced in the air as dots over everything, out wide of the far post then swerving back right, inside it
  flightDots(s,c,tp,.06,'y');
  // "He wraps": a yellow arc on the grass from his plant foot, swinging open to his left (the body opens left of the far post), and a
  // dashed aim line along the ball's first direction — out wide of the far post, before the spin bends it back in
  const hw=sm(q.hw,q.hw+.6,tt)*(1-sm(q.sp,q.sp+.5,tt));
  if(hw>.02){const pts:Pt[]=[],y0=GS-50*D2R,y1=lerp(y0,GS,hw);for(let i=0;i<=16;i++){const a=lerp(y0,y1,i/16),[fx,fz]=dirOf(a),p:V3=[GP[0]+fx*1.5,.03,GP[1]+fz*1.5];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const ww=Math.max(6,.08*kAt(c,[GP[0],0,GP[1]]));yInk(s,ribbon(pts,ww,{taper:.1,wobble:.8}),.95*hw);yInk(s,head(pts,ww),.95*hw);
    const ax=CTRL[0]-B2[0],az=CTRL[1]-B2[1],al=Math.hypot(ax,az),L=4*hw,a0:V3=[B2[0],.03,B2[1]],a1:V3=[B2[0]+ax/al*L,.03,B2[1]+az/al*L];
    if(depthOf(c,a0)>NEAR&&depthOf(c,a1)>NEAR)yInk(s,ribbon([P(c,a0),P(c,a1)],ww*.7,{taper:0,wobble:.5,gaps:[[.2,.3],[.5,.6],[.8,.9]]}),.9*hw);}}
  // "left foot": a yellow ring on the left boot; "side of the ball": a wrap arrow round the ball's LEFT side at contact (the clockwise spin)
  const lf=sm(q.lf-.1,q.lf+.25,tt,easeOutBack)*(1-sm(q.sp,q.sp+.4,tt));if(lf>.02){const sk=solve(poseOf(GUL,tp).pose,GB,poseOf(GUL,tp).place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*lf;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.lToe)));}
  const sb=sm(q.sb-.1,q.sb+.3,tt)*(1-sm(q.bd,q.bd+.5,tt));if(sb>.02&&depthOf(c,w.ball)>NEAR+.4){const bp=P(c,w.ball),r=Math.max(22,BALL_R*kAt(c,w.ball))*1.9,pts:Pt[]=[];for(let i=0;i<=16;i++){const a=Math.PI*.45+i/16*2.6*sb;pts.push([bp[0]+Math.cos(a)*r,bp[1]+Math.sin(a)*r*.6]);}
   if(pts.length>2){const ww=Math.max(5,r*.12);yInk(s,ribbon(pts,ww,{taper:.2,wobble:.5}),.95);yInk(s,head(pts,ww),.95);}}
  // "spins": short spin ticks round the flying ball, on the same flattened ring as the wrap arrow and turning the same way — CLOCKWISE on
  // screen, which from this camera behind and a little above him is the left foot's clockwise-from-above sidespin (near side sweeping left,
  // the ball's left side going forward) that bends it left-to-right; a counter-clockwise ring would be a right-footer's curl
  const spn=sm(q.sp-.1,q.sp+.2,tt)*(1-sm(q.fp,q.fp+.4,tt));if(spn>.02&&tp>CONTACT&&depthOf(c,w.ball)>NEAR+.5){const bp=P(c,w.ball),r=Math.max(18,BALL_R*kAt(c,w.ball))*1.7,sp0=tt*14,pk=new Path2D();for(let i=0;i<3;i++){const a=sp0+i*TAU/3,pts:Pt[]=[];for(let j=0;j<=6;j++){const aa=a+j/6*.9;pts.push([bp[0]+Math.cos(aa)*r,bp[1]+Math.sin(aa)*r*.6]);}pk.addPath(ribbon(pts,Math.max(4,r*.1),{taper:.5,wobble:.4}));}yInk(s,pk,.95*spn);}
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110+100*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:10,seed:14,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:12});}
  if(tp>=CONTACT&&tp<CONTACT+.6&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:150,width:6,cov:.8});}
  cornerBracket(s,c,sm(q.fp-.1,q.fp+.3,tt,easeOutBack));
  rain(s,t,.55,.8);},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(22,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the far post): beyond the keeper's reach, just inside the post, the hand to his ear =================
const ch3q=()=>({fb:T(2,'From behind'),kc:T(2,'keeper cannot reach'),ji:T(2,'Just inside the post'),ce:T(2,'cups his ear'),cr:T(2,'crowd'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,CONTACT+.15],[q.kc,T_GOAL-.35],[q.ji,T_GOAL+.02],[q.ji+1.2,T_GOAL+1.1],[q.ce,CUP0+.2],[q.end,CUP0+.2+(q.end-q.ce)*.8]]),x=>x);};
const GCAM:V3=[6.8,1.9,-5.8];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),g=posOf(GUL,tau);
 const toBall=sm(0,q.kc,t,easeInOutSine),toHero=sm(q.ji+.6,q.ce,t,easeInOutSine);
 const look0:V3=[B2[0]+4,1.3,B2[1]-2],look1:V3=[b[0],clamp(b[1],1,3),b[2]],look2:V3=[g[0],1.25,g[1]];
 const look=mix3(mix3(look0,look1,toBall),look2,toHero);
 const pos:V3=add(GCAM,[-10*toHero,2.2*toHero,8*toHero]),F=key(t,mono([[0,2400],[q.kc,1900],[q.ji,1650],[q.ji+.8,1700],[q.ce,4200],[q.end,4800]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.ji;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,storm:.9,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  flightDots(s,c,tp,.045,'k');
  // "keeper cannot reach": his reach line — the glove's furthest point — and the ball beyond it
  const reach=sm(q.kc,q.kc+.35,tt,easeOutBack)*(1-sm(q.ce-.6,q.ce-.1,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:t>q.ce-.5,cap:t>q.end-.7||t<.6});
  if(reach>.02){const g=posOf(GK,tp),a=P(c,[g[0],.05,-2.3]),b=P(c,[g[0],.05,lerp(-2.3,-3.1,reach)]),k=kAt(c,[g[0],0,-3]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.25)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.06*k),{taper:0,wobble:0,gaps}),.9*reach);}
  if(tp>CONTACT+.5&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:160,width:7,cov:.8});}
  // "Just inside the post": a yellow ring flashes round the inside of the far post where the ball shaved it
  const pf=sm(q.ji,q.ji+.25,tt,easeOutBack)*(1-sm(q.ji+1,q.ji+1.5,tt));if(pf>.02&&depthOf(c,POST)>NEAR+.3){const p=P(c,HIT);yRing(s,p[0],p[1],.35*kAt(c,HIT)*pf,Math.max(5,.05*kAt(c,HIT)));}
  // "cups his ear": a yellow ring round his head and hand; "crowd": sound arcs from the stands toward the cupped ear
  const ce=sm(q.ce,q.ce+.35,tt,easeOutBack);if(ce>.02){const pl=poseOf(GUL,tp),sk=solve(pl.pose,GB,pl.place),hd=sk.head;if(depthOf(c,hd)>NEAR+.5){const p=P(c,hd),r=.34*kAt(c,hd)*ce;yRing(s,p[0],p[1],r,Math.max(5,.04*kAt(c,hd)));
   const cr=sm(q.cr-.1,q.cr+.4,tt);if(cr>.02){const arcs=new Path2D();for(let i=0;i<3;i++){const ph=((tt*1.2+i/3)%1),rr=r*(1.5+ph*1.6),pts:Pt[]=[];for(let j=0;j<=8;j++){const a=-Math.PI*.35+j/8*Math.PI*.7;pts.push([p[0]+Math.cos(a)*rr,p[1]+Math.sin(a)*rr]);}arcs.addPath(ribbon(pts,Math.max(4,r*.08*(1-ph*.6)),{taper:.3,wobble:.5}));}yInk(s,arcs,.95*cr);}}}
  rain(s,t,.8,1.1);},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(GUL,tau),p:V3=[x,1.2,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): wrap your foot around the ball, curl it into the top corner =================
const ch4q=()=>({yt:T(3,'Your turn'),wf:T(3,'wrap your foot'),ab:T(3,'around the ball'),ci:T(3,'curl it'),tc:T(3,'top corner'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,.2],[q.wf,.62],[q.ab,CONTACT-.03],[q.ab+.8,CONTACT+.04],[q.ci,CONTACT+.3],[q.tc,T_GOAL-.05],[q.end,T_GOAL+.25]]),x=>x);};
/** first low at his LEFT side, a little ahead (the left foot wrapping round the ball in full view), then up behind him to watch it curl */
const LCAM=(t:number)=>{const q=ch4q(),u=sm(q.ci-.5,q.ci+.7,t,easeInOutSine),near=sm(0,q.wf,t,easeInOutSine);
 // orbit round his left side to behind him (he stays in shot), the look drifting from the ball to the flight
 const phi=lerp(-67,-191,u)*D2R,d=lerp(5.6-.6*near,7.6,u),pos:V3=[B2[0]+d*Math.cos(phi),lerp(1.5-.2*near,4.4,u),B2[1]+d*Math.sin(phi)],look:V3=mix3([B2[0]-.4,.7,B2[1]+.4],[-11,1,.6],u*u);
 return cam(pos,look,lerp(lerp(2000,2500,near),1650,u));};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Güler, the goal in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[4,0,-30],[4,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(B2[0]+.5,B2[1],6),.2);s.tone(Y,pool(B2[0]+.3,B2[1],3.2),.2);s.tone(Y,pool(-1,-1,5),.15);
  goal(s,c,tp>T_GOAL?netRipple(tp-T_GOAL,NET_HIT):undefined,tp>T_GOAL?settle(tp-T_GOAL,0,{freq:9,decay:7}):0);
  // "Your turn": a ring round the ball at his feet
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.wf,q.wf+.4,tt));if(yt>.02){const b=ballAt(tp),g=groundRing(c,b[0],b[2],.55*yt,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,b)),{close:true,taper:0,wobble:.6}),.95);}
  // "curl it": the curved path draws itself ahead of the strike, dotted in the air, its shadow on the grass
  const ci=sm(q.ci-.4,q.ci+.6,tt,easeOut)*(1-sm(q.end-.6,q.end-.2,tt));if(ci>.02){const air=curlPath(c,ci,true),gr=curlPath(c,ci,false),dots=new Path2D();air.forEach((p,i)=>{if(i%2)return;dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);});yInk(s,dots,.95);
   if(gr.length>1)s.tone(Y,ribbon(gr,10,{taper:.2,wobble:.6}),.5);}
  cornerBracket(s,c,sm(q.tc-.1,q.tc+.3,tt,easeOutBack));
  const styleOf=(k:number)=>k===GUL?duo(GULER,true):duo(ACTORS[k].style);
  const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,only:[GUL,GK],style:styleOf,duoBall:true});
  // "wrap your foot": a ring on the left boot; "around the ball": the wrap arrow round the ball's left side at contact (the clockwise spin)
  const wf=sm(q.wf-.1,q.wf+.25,tt,easeOutBack)*(1-sm(q.ci,q.ci+.4,tt));if(wf>.02){const pl=poseOf(GUL,tp),sk=solve(pl.pose,GB,pl.place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*wf;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.lToe)));}
  const ab=sm(q.ab-.1,q.ab+.3,tt)*(1-sm(q.tc,q.tc+.4,tt));if(ab>.02&&depthOf(c,w.ball)>NEAR+.4&&tp<CONTACT+.25){const bp=P(c,[B2[0],.11,B2[1]]),r=Math.max(34,BALL_R*kAt(c,[B2[0],.11,B2[1]]))*1.9,pts:Pt[]=[];for(let i=0;i<=16;i++){const a=Math.PI*.45+i/16*2.6*ab;pts.push([bp[0]+Math.cos(a)*r,bp[1]+Math.sin(a)*r*.6]);}
   if(pts.length>2){const ww=Math.max(5,r*.12);yInk(s,ribbon(pts,ww,{taper:.2,wobble:.5}),.95);yInk(s,head(pts,ww),.95);}}
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:11});}},
 still:5.5,
};

const story:RisoStory={
 id:'guler-signature',format:'11v11',title:"Güler's curler",
 theme:'Wrap your foot around the ball to curl it into the top corner.',
 ageNote:'UEFA Euro 2024, Türkiye 3–1 Georgia, Dortmund, 18 June 2024. Aged 19, the youngest player to score on his European Championship debut.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a curler — the ball swerves away from the point along a yellow bending trail. Reduced motion: the ball and the curve, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),pt=(v:number):Pt=>[x+v*260-Math.sin(v*Math.PI)*120,y-v*150-Math.sin(v*Math.PI)*40];
  const trail:Pt[]=[];for(let i=0;i<=16;i++)trail.push(pt(i/16*Math.max(.15,u)));
  s.fill(Y,ribbon(trail,14,{taper:.6,wobble:1}),.9);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  const b=pt(u);whiteBall(s,b[0],b[1],48,age*12+hash(seed,3)*TAU);
 },
};
export default story;
/** test hook (tests/play-film-guler-signature.cjs): the ball's flight on τ and its ends, to check which way the curler bends */
export const flight={ballAt,B2,HIT,POST,CONTACT,T_GOAL};
