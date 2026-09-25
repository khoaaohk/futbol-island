/** Iconic play film (signature move): Jan Oblak, the unbeatable one-on-one — "Here's how he did it" — shown in a real match he played:
 * Bayern Munich 2–1 Atlético Madrid (2–2 on aggregate, Atlético through on away goals), UEFA Champions League semi-final second leg,
 * Allianz Arena, Munich, 3 May 2016, 20:45 CEST. Oblak was UEFA's man of the match. A RisoStory (chapters mode) played unchanged by the
 * card window and StoryFilmPlayer.
 * Narration text: public/plays/narration/oblak-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/oblak-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/oblak-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MATCH / HONESTY: lib/town/iconicPlays.json gives Oblak a signature ("the unbeatable one-on-one"; lesson: "Stay on your feet as
 * long as you can so the attacker has to make the first move"), not one match moment. The research budget allowed this session (no web
 * search left, ≤ 8 slow page fetches; kicker's report returned 403, the Guardian URL 404 and a search page a bot check) turned up NO
 * written account of one specific Oblak one-on-one — minute, attacker, outcome. So, following the brief's fallback, the film shows the
 * SIGNATURE inside the real match where the sources say he stood out most: Munich 2016, where Bayern "ran the Rojiblancos ragged" and Oblak
 * "had done more than most to keep Bayern at bay" and was named man of the match. The narration says so plainly ("Here's how he did it").
 * It never claims this particular chance happened at a given minute, names no scoreline for the moment, and names no Bayern player in it:
 * the striker, the passer and every other outfield player are unnamed and unnumbered. (His one DOCUMENTED save that night was Thomas
 * Müller's 34th-minute penalty — a penalty, not a one-on-one, so it is not what this film shows.)
 *
 * SOURCES (cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "Jan Oblak" (raw wikitext, wiki-jan-oblak.txt): height 1.88 m, club number 13; "On 3 May 2016, Oblak saved Thomas Müller's
 *    penalty at the Allianz Arena in the second leg of the Champions League semi-finals; although Atlético lost the match 2–1, they advanced
 *    to the final on away goals"; Style of play: "tall, athletic … known for his speed, quick reflexes, and agility, as well as his reading of
 *    the game … ability to come off his line".
 *  - UEFA.com, Jordan Maciel, "Oblak relieved after Atlético edge out Bayern", 4 May 2016 (Wayback 2021 copy, uefa-oblak-relieved-2016.txt):
 *    "Josep Guardiola's side ran the Rojiblancos ragged but only took a 1-0 lead into the break. 'It's lucky we were only 1-0 down,' admitted
 *    Oblak, who had done more than most to keep Bayern at bay, saving Thomas Müller's 34th-minute penalty"; Oblak: "Especially in the first
 *    half, we weren't so well organised and we had a lot of problems."
 *  - Wikipedia, "2015–16 Atlético Madrid season" (raw, wiki-2015-16-atletico-season.txt): the second leg — 3 May 2016, 20:45 CEST, Allianz
 *    Arena, Munich, attendance 70,000, referee Cüneyt Çakır, Alonso 31', Müller penalty missed 34', Griezmann 54', Lewandowski 74', F. Torres
 *    penalty missed 86', man of the match Jan Oblak; the season's kits: home red-and-white stripes with blue shorts, AWAY all dark navy
 *    (#1B2452), three keeper kits (green, black, YELLOW).
 *  - Wikipedia, "2015–16 FC Bayern Munich season" (raw, cached by another film, wiki-2015-16-bayern-season.txt): home kit all red; the draw,
 *    both legs and scores.
 *  - Wikipedia (es), "Jan Oblak" (eswiki-jan-oblak.txt): the same career facts (used as a cross-check only).
 * CONFIRMED: the match, date, kick-off, stadium (the Allianz Arena, a closed bowl under a ring roof), crowd 70,000; Bayern pressing
 *  "again and again" (ran them ragged) and Oblak man of the match; Oblak No. 13, 1.88 m, Atlético's keeper; Bayern's home kit all red.
 * INFERRED / ILLUSTRATIVE (the whole one-on-one is an illustration of his signature, not one documented chance): the through ball, the
 *  run, the striker's feint, the low shot to Oblak's left, his low block with the left glove and the ball parried wide, the clearance;
 *  every position, speed and time; which end Atlético defended and where the main camera sat; the kits worn THAT night beyond Bayern's red
 *  — Atlético drawn in their navy AWAY strip (red home stripes would clash with Bayern's red; not verified), Oblak drawn in the season's
 *  yellow keeper kit with navy gloves (not verified) — no kit colour is named in the narration; the striker shoots with his right foot
 *  (not named in the narration); Oblak's hair (short, dark); the ball (the 2015–16 Champions League match ball drawn as a white ball with
 *  a navy star); the arena drawn as a steep three-tier bowl under a dark ring roof with floodlights on its inner edge, a mostly red crowd;
 *  the referee is left out of frame.
 *
 * STRUCTURE (never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 the striker's shot): ch1 = the live broadcast
 * from the high main-stand camera in real time (the arena, Bayern's pressure, Oblak close up, the through ball, the run, Oblak up and big,
 * the block); ch2 = the TV slow-motion replay from BEHIND THE STRIKER, over his shoulder (what the attacker sees: a keeper who will not go
 * down, feet planted, knees bent, hands low, the feint ignored); ch3 = the replay low from the FRONT-LEFT of Oblak at pitch level (the
 * striker has to move first; the shot low; Oblak drops fast and the ball hits his glove, coming toward the lens); ch4 = a duotone lesson
 * from high behind Oblak's shoulder (a ghost keeper who dives early and is rounded, vs Oblak standing tall until the shot). Compositions
 * differ from lib/plays/riso/casillas-robben-2010.ts (side-on and behind-the-goal replays). The block point is read from the solved
 * skeleton (Oblak's left glove mid-dive) and the shot is aimed at it. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer().
 * Handedness: right-handed world (Atlético's goal line x = 0, net toward +x, pitch to x = −105); Oblak faces −x so his LEFT is +z.
 * Framing: world centred on the CANVAS centre (never sheet.safe), a lens that widens for a square window. Inks: yellow (floodlights, grass
 * under blue, Oblak's kit, cue marks), red (Bayern, the crowd, the striker's cue rings), blue (the grass with yellow), navy (night, roof,
 * Atlético's kit, key line). Scenes read only their local t; drawn objects pose on twos, cameras on ones; randomness is seeded.
 * Budget ≈ 150–300 plate ops per frame; wide-shot figures print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,posed,runCycle,dribble,stand,strike,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',RD='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/(\.\.\.|[,;:])$/.test(w)?.2:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`oblak film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py oblak-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/oblak-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Allianz Arena',"Munich, 2016, Champions League semi-final. Bayern attack and attack, but Atlético's keeper Jan Oblak is man of the match. Here's how he did it: a striker runs through... Oblak stays up. Saved!",
  ['Munich','Champions League','Bayern attack','Jan Oblak','man of the match','how he did it','runs through','stays up','Saved']),
 prov('Stay on your feet','Watch again, slowly. Oblak stays on his feet, knees bent, hands low. The striker waits for a dive that never comes.',
  ['Watch again','slowly','stays on his feet','knees bent','hands low','waits for a dive','never comes']),
 prov('Move first','So the striker must move first. He shoots low; Oblak drops fast and blocks it with his glove.',
  ['So the striker','move first','shoots low','drops fast','blocks it','his glove']),
 prov('Make them move',"Don't dive early! Stay on your feet as long as you can, so the attacker has to move first.",
  ['dive early','Stay on your feet','as long as you can','attacker','move first']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`oblak film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Atlético's goal line x = 0, net toward +x, pitch to x = −105) =================
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
const unit2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a red mark (Bayern's cue colour) knocked through the grass */
function rInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(RD,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a ring on the grass round a ground point, into a path */
function gRing(path:Path2D,c:Camera,x:number,z:number,r:number,w:number){const g=groundRing(c,x,z,r,26);if(g.length>2)path.addPath(ribbon(g,Math.max(4,w*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}
/** a projected 3D polyline (points behind the lens dropped) */
function proj(c:Camera,pts:V3[]):Pt[]{const o:Pt[]=[];for(const p of pts)if(depthOf(c,p)>NEAR+.2)o.push(P(c,p));return o;}
const dashes=(step:number,on:number,from=.03):[number,number][]=>{const g:[number,number][]=[];for(let x=from;x<1;x+=step)g.push([x,x+on]);return g;};

// ================= the Allianz Arena from inside at night: a steep three-tier bowl under a dark ring roof, floodlit, 70,000 =================
const CX=-52.5;// the centre spot
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),.4),y,b*Math.sign(s)*Math.pow(Math.abs(s),.4)];}
type Lv=[number,number,number];// a, b, y
const BOWL:Lv[]=[[61,42,1],[68,49,10.5],[69.5,50.5,12.5],[77,58,22.5],[78.5,59.5,24.5],[87,68,37],[88,69,39]];
/** the roof: from the top rim, in over the stands to its inner edge (the opening over the pitch) */
const ROOF_IN:Lv=[72,53,44];
const NSEG=44;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
/** crowd: [tier 0..2, u round the bowl, v up the tier, ink 0 paper / 1 red (mostly Bayern) / 3 navy, phase] */
const CROWD=(()=>{const r=rng(2016),o:[number,number,number,number,number][]=[];for(let i=0;i<1500;i++){const c=r();o.push([Math.floor(r()*3),r(),.05+r()*.9,c<.27?0:c<.8?1:3,r()*TAU]);}return o;})();
type Crowd={cheer?:number;flash?:number;t:number;roofGlow?:number};
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t,cheer=0,flash=0,roofGlow=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,ey=c.eye;
 // night over Munich: navy everywhere the roof and stands don't cover
 s.field(K,.82,.5);
 // the roof's underside: a lighter navy ring, its steel ribs, and the floodlights along its inner edge
 const roof=new Path2D(),ribs=new Path2D(),lights=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(BOWL[6],ROOF_IN,t0,t1)));
  const a=lvAt(BOWL[6],t0),b=lvAt(ROOF_IN,t0);if(depthOf(c,a)>NEAR&&depthOf(c,b)>NEAR){const pa=P(c,a),pb=P(c,b);ribs.moveTo(pa[0],pa[1]);ribs.lineTo(pb[0],pb[1]);}
  if(i%2===0){const q=lvAt(ROOF_IN,(t0+t1)/2);q[1]-=.6;if(depthOf(c,q)>2){const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),4,22);lights.addPath(polyPath([[x-sz*1.6,y],[x,y-sz*.55],[x+sz*1.6,y],[x,y+sz*.55]],true));}}}
 s.knockout(roof,.9);s.tone(K,roof,.5);s.stroke(K,ribs,3,.6);
 s.knockout(lights);s.fill(Y,lights,.95);
 if(roofGlow>.02){const p=new Path2D(),pts:Pt[]=[];for(let i=0;i<=48;i++){const q=lvAt(ROOF_IN,i/48*TAU);if(depthOf(c,q)<NEAR+1){if(pts.length>1)p.addPath(ribbon(pts.splice(0),10*roofGlow+4,{taper:0,wobble:.6}));pts.length=0;continue;}pts.push(P(c,q));}if(pts.length>1)p.addPath(ribbon(pts,10*roofGlow+4,{taper:0,wobble:.6}));yInk(s,p,.95*Math.min(1,roofGlow));}
 // stands: concrete (a navy screen), rows stepped; the tier fascias darker
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [[0,1,false],[1,2,true],[2,3,false],[3,4,true],[4,5,false],[5,6,true]] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   addPoly(isF?fascia:stands,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1)));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.tone(K,stands,.42);s.tone(K,rows,.16);s.knockout(fascia);s.tone(K,fascia,.8);
 // crowd: mostly Bayern red, white and navy — bobbing on the twos when they rise
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,p=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1]){s.knockout(heads[1],.9);s.fill(RD,heads[1],.9);}if(seen[3])s.fill(K,heads[3],.85);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=Math.floor(r()*3),th=r()*TAU,q=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass under the lights: yellow × blue, mowing stripes, paper lines (both boxes, the halfway line and circle)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);yInk(s,gp,.78);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 for(const [g,d] of [[0,-1],[-105,1]] as [number,number][]){Ln([g,-20.16],[g+d*16.5,-20.16]);Ln([g+d*16.5,-20.16],[g+d*16.5,20.16]);Ln([g+d*16.5,20.16],[g,20.16]);
  Ln([g,-9.16],[g+d*5.5,-9.16]);Ln([g+d*5.5,-9.16],[g+d*5.5,9.16]);Ln([g+d*5.5,9.16],[g,9.16]);
  let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=(d<0?Math.PI:0)-.927+i/10*1.854,pt:[number,number]=[g+d*11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 goal(s,c,0,1);goal(s,c,-105,-1,true);
 drawIn();
}
/** a goal at x = gx whose net runs toward d (+1 = +x): posts, bar, a box net held by stanchions (the far goal frame only) */
function goal(s:Sheet,c:Camera,gx:number,d:number,far=false){
 const W=3.66,H=2.44,Dp=2*d,vol=new Path2D(),mesh=new Path2D();
 if(!far){const back=(u:number,v:number):V3=>[gx+Dp,lerp(H,0,v),lerp(-W,W,u)],top=(u:number,v:number):V3=>[gx+lerp(0,Dp,v),H,lerp(-W,W,u)],side=(z:number)=>(u:number,v:number):V3=>[gx+lerp(0,Dp,u),lerp(H,0,v),z];
  const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
   for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
   for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
  grid(back,14,5);grid(top,14,3);grid(side(-W),3,5);grid(side(W),3,5);
  s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[gx,1,0]),2,9),.75);}
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([gx,0,-W],[gx,H+.06,-W]);bar([gx,0,W],[gx,H+.06,W]);bar([gx,H,-W-.06],[gx,H,W+.06]);
 if(!far){bar([gx+Dp,0,-W],[gx+Dp,H,-W],.06);bar([gx+Dp,0,W],[gx+Dp,H,W],.06);bar([gx,H,-W],[gx+Dp,H,-W],.05);bar([gx,H,W],[gx+Dp,H,W],.05);}
 s.fill(K,edge,.9);s.knockout(frameP);
}

// ================= the ball: white, a navy star turning with the spin, a navy rim (the season's Champions League ball, simplified) =================
const BALL_R=.11;
function starBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const m=Math.cos(spin*.6),cx=Math.cos(spin)*r*.25,cy=Math.sin(spin)*r*.2*m,star:Pt[]=[];
 for(let k=0;k<10;k++){const a=spin*.5+k/10*TAU,rr=k%2?r*.2:r*.5;star.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*(.55+.45*Math.abs(m))]);}
 s.fill(K,polyPath(star,true),.85);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.15,.55));}

// ================= kits (3 May 2016) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[RD,.16]],SKIN_M:AthleteStyle['skin']=[[Y,.45],[RD,.28],[K,.18]],SKIN_D:AthleteStyle['skin']=[[RD,.4],[Y,.45],[K,.34]];
/** Bayern: all red (the confirmed home kit), paper trim; nobody numbered — the chance is an illustration */
const FCB=(seed:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[RD,.92],shorts:[RD,.92],socks:[RD,.92],trim:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:null,numberInk:'paper',seed,...o});
/** Atlético: the season's navy AWAY strip (INFERRED for that night), red trim; unnumbered */
const ATM=(seed:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.86],shorts:[K,.86],socks:[K,.86],trim:RD,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.2],sleeves:'short',number:null,numberInk:'paper',seed,...o});
/** Jan Oblak: No. 13, 1.88 m; the season's yellow keeper kit and navy gloves (INFERRED: the kit worn that night is not verified) */
const OB_B:Build={height:1.88,bulk:1.03};
const OBLAK:AthleteStyle={shirt:[Y,.95],shorts:[Y,.9],socks:[Y,.95],trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',gloves:[K,.85],line:K,shade:[K,.3],sleeves:'long',number:13,numberInk:K,build:OB_B,seed:13};
/** the striker who runs through: unnamed, no number (the moment is an illustration, not a documented chance) */
const ST_B:Build={height:1.84,bulk:1};
const STRIKER:AthleteStyle=FCB(77,{build:ST_B});
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false,ghost=false):AthleteStyle=>({...st,shirt:lead?[Y,.95]:[K,ghost?.14:.36],shorts:lead?[Y,.8]:[K,ghost?.1:.22],socks:lead?[Y,.9]:[K,ghost?.14:.36],trim:K,boots:ghost?[K,.3]:K,skin:ghost?[[K,.08]]:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:ghost?[K,.3]:K,line:K,shade:[K,ghost?.06:.2],numberInk:K,gloves:st.gloves?[K,ghost?.3:.8]:undefined,seed:(st.seed??0)+(ghost?500:0)});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the striker's shot) =================
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** idle: a standing body that breathes and looks around (never a frozen hold) */
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** where a player stands so his toe (foot 'l' or 'r') meets a ground ball at `ball` when striking facing `yaw` (read from the solved skeleton) */
function footSpot(ball:[number,number],yaw:number,pose:Pose,build:Build,foot:'l'|'r'):[number,number]{const sk=solve(pose,build,{yaw}),t=foot==='l'?sk.lToe:sk.rToe;return[ball[0]-t[0],ball[1]-t[2]];}

// ---- Oblak: off his line as the striker comes, square to the ball, then set and still; he goes down only as the shot is struck ----
const SHOT:[number,number]=[-11.8,-2.8];// where the ball is struck from
const UD=unit2(SHOT[0],SHOT[1]);// the line from the goal centre to the shot
const OB_D=6;// how far out he sets (metres from the goal centre)
const PD:[number,number]=[UD[0]*OB_D,UD[1]*OB_D];
const YD=YAW(SHOT[0]-PD[0],SHOT[1]-PD[1]);// square to the shooter
const TF=.3;// the shot's flight to his glove
const DUR=.72,UC=.5;// the low dive; the left glove meets the ball at UC
const D0=TF-UC*DUR;// he goes down only as the striker strikes (≈ −0.06 s): the striker moved first
const dive=(u:number)=>keeperDive(clamp(u),{side:'l',height:0});
/** the block: just in front of Oblak's LEFT glove mid-dive, read from the solved skeleton */
const HIT:V3=(()=>{const sk=solve(dive(UC),OB_B,{x:PD[0],z:PD[1],yaw:YD}),g=sk.lHa,[tx,tz]=unit2(SHOT[0]-g[0],SHOT[1]-g[2]);return[g[0]+tx*(BALL_R+.05),Math.max(BALL_R+.06,g[1]),g[2]+tz*(BALL_R+.05)];})();
const OB_END=dive(1);
/** distance off his line: creeps out as the striker comes, then STOPS and sets */
const obDist=(tau:number)=>key(tau,[[-7,1.1],[-4.4,1.3],[-3,3.2],[-1.8,5.3],[-1.1,OB_D]],easeInOutSine);
function oblakAt(tau:number):{pose:Pose;place:Place}{
 if(tau<D0){const b=ballAt(tau),bd=unit2(b[0],b[2]),w=sm(-1.8,-.7,tau),d=obDist(tau),dir=unit2(lerp(bd[0],UD[0],w),lerp(bd[1],UD[1],w)),x=dir[0]*d,z=dir[1]*d;
  const v=Math.abs(obDist(tau+.05)-obDist(tau-.05))/.1;let p=blendPose(keeperSet(tau*1.6),runCycle(tau*1.9,{speed:.12}),clamp(v/2.2)*.7);
  // the striker's feint: a flicker of weight to his right — and back. He stays up.
  const f=sm(-1.5,-1.3,tau)*(1-sm(-1.2,-.95,tau));p.bend+=.14*f;p.dz=-.08*f;
  if(tau>D0-.22)p=blendPose(p,dive(0),sm(D0-.22,D0,tau));
  return{pose:p,place:{x,z,yaw:lerpAng(YAW(b[0]-x,b[2]-z),YD,sm(-1,D0,tau))}};}
 const t=(tau-D0)/DUR,place:Place={x:PD[0],z:PD[1],yaw:YD};
 if(t<=1)return{pose:dive(t),place};
 // down on his side after the block, then up on his feet, turning to find the ball
 const up=sm(TF+1.3,TF+2.2,tau),p=blendPose(OB_END,{...stand(),dx:OB_END.dx,dz:OB_END.dz},up);p.neckY+=.3*Math.sin(tau*.9)*(1-up);p.lean+=.04*Math.sin(tau*2.1);
 return{pose:p,place:{...place,yaw:lerpAng(YD,YD-.9,up)}};
}
// ---- the striker (Bayern, unnamed): through on goal, dribbling, a feint, then the low right-footed shot ----
const SDUR=.75,SS=-STRIKE_CONTACT*SDUR;// his strike: starts at SS, contact at τ = 0
const YS=YAW(HIT[0]-SHOT[0],HIT[2]-SHOT[1]);
const KFP=footSpot(SHOT,YS,strike(STRIKE_CONTACT,{power:.9}),ST_B,'r');
const T_RECV=-4.4;// the through ball reaches him
const ST_P:MKey[]=[[-7.2,-49,-13.4],[-5.6,-44.6,-11.8],[T_RECV,-38.8,-9.6],[-2.4,-25.4,-6.3],[-1.2,-18.3,-4.8],[SS,KFP[0],KFP[1]]];
const HEADS=posed({lShF:150,rShF:150,lShA:44,rShA:44,lElb:128,rElb:128,lHand:1,rHand:1,neckP:-22,lean:-6,lHipF:16,rHipF:6,lKnee:18,rKnee:12});
function strikerAt(tau:number):{pose:Pose;place:Place}{
 if(tau<SS){const q=pathPos(ST_P,tau),v=Math.hypot(q.vx,q.vz);let r:{pose:Pose;place:Place};
  if(tau<T_RECV)r=runner(ST_P,tau,ballAt(tau),2);
  else{const pose=blendPose(runner(ST_P,tau,ballAt(tau),2).pose,dribble(q.dist/1.7,{foot:'r',speed:clamp(v/8)}),sm(T_RECV,T_RECV+.35,tau));r={pose,place:{x:q.x,z:q.z,yaw:YAW(q.vx,q.vz)}};}
  // the feint: shoulders dropped to his left, as if to go round — the keeper doesn't buy it
  const f=sm(-1.55,-1.3,tau)*(1-sm(-1.1,-.85,tau));r.pose.twist+=.42*f;r.pose.bend-=.26*f;r.pose.lean+=.1*f;r.place.yaw=(r.place.yaw??0)+.22*f;
  if(tau>SS-.25){const u=sm(SS-.25,SS,tau);r.pose=blendPose(r.pose,strike(0,{power:.9}),u);r.place.yaw=lerpAng(r.place.yaw??0,YS,u);}
  return r;}
 const t=(tau-SS)/SDUR,place:Place={x:KFP[0],z:KFP[1],yaw:YS};
 if(t<=1)return{pose:strike(t,{power:.9}),place};
 const u=sm(SS+SDUR,SS+SDUR+.8,tau),p=blendPose(strike(1,{power:.9}),HEADS,u);p.lean+=.03*Math.sin(tau*2.2);p.neckY+=.2*Math.sin(tau*.8)*u;
 return{pose:p,place:{...place,yaw:lerpAng(YS,YS+.5,u)}};
}
// ---- the ball ----
const PASS0:V3=[-55.5,.11,3.2],T_PASS=-5.6;
/** while he dribbles: the ball rolls a stride ahead of him, touched on */
function dribbleBall(tau:number):V3{const q=pathPos(ST_P,tau),[fx,fz]=Math.hypot(q.vx,q.vz)>.3?unit2(q.vx,q.vz):unit2(-q.x,-q.z),lead=.66+.22*Math.sin(q.dist/1.7*TAU);return[q.x+fx*lead,.11,q.z+fz*lead];}
const RECV=dribbleBall(T_RECV);
const OUT1:V3=[HIT[0]-2.4,.11,HIT[2]+4.6],T_O1=TF+.45;
const OUT2:V3=[OUT1[0]-2.6,.11,OUT1[2]+3.4],T_O2=T_O1+1.6;
const T_CL=3.1;// an Atlético defender clears it
const CLEAR_TO:V3=[-44,.11,31],T_CL_END=T_CL+2.2;
const YCL=YAW(CLEAR_TO[0]-OUT2[0],CLEAR_TO[2]-OUT2[2]);
function ballAt(tau:number):V3{
 if(tau<T_PASS)return PASS0;
 if(tau<T_RECV){return mix3(PASS0,RECV,easeOut(clamp((tau-T_PASS)/(T_RECV-T_PASS))));}
 if(tau<SS){const d=dribbleBall(tau),w=sm(-.95,-.5,tau);return mix3(d,[SHOT[0],.11,SHOT[1]],w);}
 if(tau<0)return[SHOT[0],.11,SHOT[1]];
 if(tau<TF){const u=tau/TF,p=mix3([SHOT[0],.11,SHOT[1]],HIT,u);p[1]+=.12*Math.sin(Math.PI*u);return p;}
 if(tau<T_O1){const e=(tau-TF)/(T_O1-TF),p=mix3(HIT,OUT1,e);p[1]=lerp(HIT[1],.11,e)+.8*Math.sin(Math.PI*e);return p;}
 if(tau<T_CL){const u=easeOut(clamp((tau-T_O1)/(T_O2-T_O1)));const p=mix3(OUT1,OUT2,u);p[1]=.11+.12*Math.abs(Math.sin(u*Math.PI*2))*(1-u);return p;}
 const u=clamp((tau-T_CL)/(T_CL_END-T_CL)),p=mix3(OUT2,CLEAR_TO,u);p[1]=.11+14*Math.sin(Math.PI*u);return p;}

// ---- everybody else (unnamed): the passer, Bayern's support runners, Atlético's defenders chasing back ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
/** a player who runs in and kicks the ball at τ = tk from ball spot `bs` toward yaw `yk` */
function kicker(style:AthleteStyle,bs:V3,yk:number,tk:number,from:[number,number],after:[number,number],seed:number,build:Build):Actor{
 const kf=footSpot([bs[0],bs[2]],yk,strike(STRIKE_CONTACT,{power:1}),build,'r'),[kx,kz]=dirOf(yk),d=.8,t0=tk-STRIKE_CONTACT*d;
 const path:MKey[]=[[t0-4,from[0],from[1]],[t0,kf[0],kf[1]],[t0+d,kf[0],kf[1]],[t0+d+3,kf[0]+after[0],kf[1]+after[1]]];
 return{style,at:(t,b)=>{if(t<t0){const r=runner(path,t,b,seed);if(t>t0-.25){const u=sm(t0-.25,t0,t);r.pose=blendPose(r.pose,strike(0),u);r.place.yaw=lerpAng(r.place.yaw??0,yk,u);}return r;}
  if(t<t0+d)return{pose:strike((t-t0)/d),place:{x:kf[0],z:kf[1],yaw:yk}};
  const r=runner(path,t,b,seed);r.pose=blendPose(strike(1),r.pose,sm(t0+d,t0+d+.4,t));return r;}};}
const PASSER=kicker(FCB(66,{hair:[K,.7],build:{height:1.8}}),PASS0,YAW(RECV[0]-PASS0[0],RECV[2]-PASS0[2]),T_PASS,[-60,6],[3,0],3,{height:1.8});
const CLEARER=kicker(ATM(21,{skin:SKIN_M,build:{height:1.86}}),OUT2,YCL,T_CL,[-19,6],[-3,4],4,{height:1.86});
const ACTORS:Actor[]=[
 PASSER,
 CLEARER,
 mover(ATM(22,{build:{height:1.87}}),[[-7,-44,-6],[-5.6,-42.5,-7],[T_RECV,-39.5,-8.2],[-2.4,-27.8,-5.4],[0,-16.2,-2.1],[1.4,-12.8,1.4],[3.6,-12.2,5]],5),// chasing the striker
 mover(ATM(23,{skin:SKIN_D,build:{height:1.83}}),[[-7,-43,-22],[-5.6,-41.5,-21.5],[-2.4,-31,-16],[0,-22.5,-12],[3,-18,-10]],6),
 mover(ATM(24,{build:{height:1.78}}),[[-7,-50,4],[-5.6,-48.5,3],[-2.4,-33,-1],[0,-24,-2],[3,-19,-3]],7),
 mover(FCB(31,{build:{height:1.83}}),[[-7,-50,14],[-5.6,-48,13],[-2.4,-30,9.5],[0,-17.5,7.6],[1.5,-13.5,7.4],[3.5,-12.5,8.5]],8),// arriving at the far post
 mover(FCB(32,{skin:SKIN_M,build:{height:1.76}}),[[-7,-54,-20],[-5.6,-52,-19],[-2.4,-38,-15],[0,-29,-14],[3,-26,-13]],9),
 mover(FCB(33,{build:{height:1.8}}),[[-7,-64,-4],[-5.6,-62,-4],[0,-50,-2],[3,-46,0]],10),
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([OBLAK,STRIKER]);
/** everyone and the ball at τ, depth sorted. `hero` smears Oblak and the striker; `prev` gives every figure its secondary motion;
 * `cap` limits figure detail (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&!hero&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&!hero&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const ob=oblakAt(tp),st=strikerAt(tp);
 put(OBLAK,ob,oblakAt(tp-dt),!!o.hero);put(STRIKER,st,strikerAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  starBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,ob,st};}
/** the shot's path as 3D points (τ from a to b) */
const flight=(a:number,b:number,n=16):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(a+(b-a)*i/n));
/** the shooting angle: the triangle from the ball to both posts, on the grass */
function angleTri(c:Camera,b:[number,number]):Path2D{const p=new Path2D();addPoly(p,clipPoly(c,[[b[0],.02,b[1]],[0,.02,-3.66],[0,.02,3.66]]));return p;}
/** a height ruler beside a standing figure: a yellow bar from the grass to `h` metres, with a tick at the top */
function ruler(s:Sheet,c:Camera,x:number,z:number,h:number,u:number,side:[number,number]){
 const g:V3=[x+side[0],0,z+side[1]],top:V3=[g[0],h*u,g[2]];if(depthOf(c,g)<NEAR+.5)return;const a=P(c,g),b=P(c,top),k=kAt(c,g),w=Math.max(4,.05*k),p=ribbon([a,b],w,{taper:0,wobble:.4});
 if(u>.95){const t0=P(c,[top[0]-side[0]*.5,top[1],top[2]-side[1]*.5]),t1=P(c,[top[0]+side[0]*.35,top[1],top[2]+side[1]*.35]);p.addPath(ribbon([t0,t1],w,{taper:0,wobble:.4}));}
 yInk(s,p,.95);}
/** a ring round a 3D point (a joint), screen-space */
function jRing(s:Sheet,c:Camera,j:V3,rm:number,u:number){if(u<.02||depthOf(c,j)<NEAR+.3)return;const p=P(c,j),k=kAt(c,j);yRing(s,p[0],p[1],rm*k*u,Math.max(4,.035*k));}

// ================= chapter 1 (live): the high main-stand camera in real time, under the Allianz roof =================
const ch1q=()=>({mu:T(0,'Munich'),cl:T(0,'Champions League'),ba:T(0,'Bayern attack'),jo:T(0,'Jan Oblak'),mm:T(0,'man of the match'),hd:T(0,'how he did it'),rt:T(0,'runs through'),su:T(0,'stays up'),sv:T(0,'Saved'),end:SEC(0)});
/** the lead-in: τ = t − TL. The block lands on "Saved" when the voice allows; the through ball never leaves before "how he did it". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.sv-TF+.05,q.hd-T_PASS-.4,Math.max(q.hd-T_PASS-.4,q.end-TF-2.2));return{TL,end:q.end};};
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-52.5,30,70],[q.mu+.6,-50,27,66],[q.ba,-44,22,58],[q.jo,-36,19,50]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the through ball the director's camera follows the words: the bowl → the roof → Bayern pouring forward → Oblak close up → the passer */
function ch1Pre(t:number):V3{const q=ch1q(),{TL}=ch1T(),o0=oblakAt(-7).place,v=key(t,mono([[0,CX,14,0],[q.mu+.5,CX,8,0],[q.cl,CX,1,0],[q.ba,-36,1,-4],[q.jo-.05,-24,1,-3],[q.jo+.6,o0.x??0,1,o0.z??0],[q.hd,o0.x??0,1,o0.z??0],[TL+T_PASS-.6,-46,1.5,-2]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(Math.min(tau,TF)),o=oblakAt(tau).place,w=sm(-3.5,-1,tau);
 return[lerp(b[0],(b[0]+(o.x??0))/2,w),1,lerp(b[2],(b[2]+(o.z??0))/2,w)*.9];}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(Math.max(q.hd-.2,TL+T_PASS-1.4),Math.max(q.hd+.3,TL+T_PASS-.3),t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,900],[q.mu+.6,1000],[q.cl,1500],[q.ba,1900],[q.jo-.05,2100],[q.jo+.7,11000],[q.mm,12500],[q.hd-.2,11000],[q.hd+.6,2400],[TL+T_PASS,2300],[TL-2,3300],[TL-.6,4700],[TL+TF+.2,5600],[TL+TF+1.6,4900],[q.end,4600]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** a five-point star on the centre spot (a nod to the competition's starball) */
function centreStar(c:Camera,u:number):Path2D{const p=new Path2D(),pts:V3[]=[];for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,r=(k%2?3.4:8.6)*u;pts.push([CX+Math.cos(a)*r,.02,Math.sin(a)*r]);}addPoly(p,clipPoly(c,pts));return p;}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),tau=t-TL,tp=tt-TL,after=tau-TF;
  const shake=tau>=TF?5*settle(tau,TF,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  const roofGlow=sm(q.mu,q.mu+.35,t,easeOutBack)*(1-sm(q.cl-.1,q.cl+.4,t));
  stadium(s,c,{t,roofGlow,cheer:.15+.9*sm(0,.4,after)*(1-sm(1.4,2.6,after)),flash:.2+.9*sm(0,.4,after)*(1-sm(1.5,2.5,after))},()=>{
   // "Champions League": a star on the centre spot
   const cl=sm(q.cl,q.cl+.4,tt,easeOutBack)*(1-sm(q.ba,q.ba+.4,tt));if(cl>.02)yInk(s,centreStar(c,cl),.95);
   // "Bayern attack": red rings under every Bayern player, arrows toward Atlético's goal
   const ba=sm(q.ba,q.ba+.3,tt,easeOutBack)*(1-sm(q.jo,q.jo+.4,tt));if(ba>.02){const bp=ballAt(tp),p=new Path2D(),ar=new Path2D();
    [...ACTORS.filter(a=>a.style.shirt&&Array.isArray(a.style.shirt)&&a.style.shirt[0]===RD).map(a=>a.at(tp,bp).place),strikerAt(tp).place].forEach(pl=>{gRing(p,c,pl.x??0,pl.z??0,1*ba,.14);const a0=P(c,[(pl.x??0)+1.3,.02,pl.z??0]),a1=P(c,[(pl.x??0)+1.3+4*ba,.02,(pl.z??0)*.95]);ar.addPath(ribbon([a0,a1],Math.max(4,.12*kAt(c,[pl.x??0,0,pl.z??0])),{taper:.6,wobble:.5}));});
    rInk(s,p,.95);rInk(s,ar,.9);}
   const op=oblakAt(tp).place;
   // "Jan Oblak": a ring round him
   const jo=sm(q.jo,q.jo+.3,tt,easeOutBack)*(1-sm(q.hd,q.hd+.4,tt));if(jo>.02){const p=new Path2D();gRing(p,c,op.x??0,op.z??0,1.2*jo,.12);yInk(s,p,.95);}
   // "how he did it": the shooting angle — the triangle from the ball to the posts — he will stand in the middle of it
   const hd=sm(q.hd,q.hd+.5,tt,easeOut)*(1-sm(TL+TF,TL+TF+.5,tt));if(hd>.02&&tp>T_RECV-.3){const b=ballAt(Math.min(tp,0)),p=angleTri(c,[b[0],b[2]]);s.knockout(p,.3*hd);s.tone(Y,p,.45*hd);}
   // "runs through": a dashed run ahead of the striker toward goal
   const rt=sm(q.rt,q.rt+.5,tt,easeOut)*(1-sm(q.su,q.su+.5,tt));if(rt>.02){const pts=proj(c,Array.from({length:11},(_,i)=>{const u=clamp(tp+(SS-tp)*i/10*rt,tp,SS),r=pathPos(ST_P,u);return[r.x,.05,r.z] as V3;}));if(pts.length>1)rInk(s,ribbon(pts,Math.max(5,.14*kAt(c,[-20,0,-5])),{taper:.2,wobble:.6,gaps:dashes(.1,.05)}),.95);}
   drawWorld(s,c,tau,tp,{ballMin:13,cap:t>q.end-.7});
   const sk=solve(oblakAt(tp).pose,OB_B,op);
   // "man of the match": a burst of yellow sparks over him
   const mm=sm(q.mm,q.mm+.15,tt)*(1-sm(q.mm+.6,q.mm+1,tt));if(mm>.02&&depthOf(c,sk.head)>NEAR+.5){const p=P(c,add(sk.head,[0,.5,0])),k=kAt(c,sk.head);sparkBurst(s,Y,p[0],p[1],(.6+.5*sm(q.mm,q.mm+.3,tt,easeOut))*k,{n:10,seed:11,g:mm,width:Math.max(5,.05*k)});}
   // "stays up": a height ruler beside him — all 1.88 m of him still standing
   const su=sm(q.su,q.su+.4,tt,easeOut)*(1-sm(q.sv-.1,q.sv+.3,tt));if(su>.02&&tp<D0)ruler(s,c,op.x??0,op.z??0,OB_B.height!*.86,su,[.2,.8]);
   // "Saved": sparks where the ball meets his glove, then a ring on the grass
   if(tp>=TF&&tp<TF+.3){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],70+60*sm(TF,TF+.1,tp,easeOut),{n:9,seed:3,g:1-sm(TF+.1,TF+.3,tp),width:10});}
   const sv=sm(q.sv,q.sv+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(sv>.02){const p=new Path2D();gRing(p,c,HIT[0],HIT[2],1.3*sv,.16);yInk(s,p,.95);}
  });},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, over the STRIKER's shoulder): what the attacker sees — a keeper who will not go down =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),sf:T(1,'stays on his feet'),kb:T(1,'knees bent'),hl:T(1,'hands low'),wd:T(1,'waits for a dive'),nc:T(1,'never comes'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-2.9],[q.sf,-2.1],[q.kb,-1.75],[q.hl,-1.5],[q.wd,-1.25],[q.nc,-.55],[q.end,-.2]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),a=pathPos(ST_P,Math.min(tau-.15,SS)),[fx,fz]=unit2(-a.x+PD[0]*0,-a.z),rx=-fz,rz=fx;// behind him, over his right shoulder
 const d=key(t,mono([[0,4.2],[q.sf,3.4],[q.wd,2.8],[q.end,2.6]]),easeInOutSine),pos:V3=[a.x-fx*d+rx*.9,1.85,a.z-fz*d+rz*.9];
 const o=oblakAt(tau).place,look:V3=[lerp(a.x,o.x??0,.72),.95,lerp(a.z,o.z??0,.72)];
 const F=key(t,mono([[0,1500],[q.sf,1700],[q.kb,1850],[q.hl,1850],[q.nc,2000],[q.end,2050]]),easeInOutSine);return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.1},()=>{
   // the angle he is closing: a faint triangle from the ball to the posts, behind him
   const ag=sm(q.sf-.3,q.sf+.4,tt)*(1-sm(q.end-.8,q.end-.4,tt));if(ag>.02){const b=ballAt(tp),p=angleTri(c,[b[0],b[2]]);s.knockout(p,.25*ag);s.tone(Y,p,.3*ag);}
   const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,prev:true,cap:t>q.end-.7});
   const sk=solve(w.ob.pose,OB_B,w.ob.place),ss=solve(w.st.pose,ST_B,w.st.place);
   // "stays on his feet": a ring round his boots on the grass
   const sf=sm(q.sf,q.sf+.3,tt,easeOutBack)*(1-sm(q.kb+.4,q.kb+.8,tt));if(sf>.02){const p=new Path2D();gRing(p,c,(sk.lAn[0]+sk.rAn[0])/2,(sk.lAn[2]+sk.rAn[2])/2,.62*sf,.08);yInk(s,p,.95);}
   // "knees bent": a ring on each knee
   const kb=sm(q.kb,q.kb+.3,tt,easeOutBack)*(1-sm(q.hl+.3,q.hl+.7,tt));jRing(s,c,sk.lKn,.17,kb);jRing(s,c,sk.rKn,.17,kb);
   // "hands low": a ring on each glove, and the gap between them and the grass
   const hl=sm(q.hl,q.hl+.3,tt,easeOutBack)*(1-sm(q.wd+.2,q.wd+.6,tt));jRing(s,c,sk.lHa,.16,hl);jRing(s,c,sk.rHa,.16,hl);
   // "waits for a dive": the striker's gaze, a dashed red sight line from his head to the keeper
   const wd=sm(q.wd,q.wd+.4,tt,easeOut)*(1-sm(q.end-.8,q.end-.4,tt));if(wd>.02&&depthOf(c,ss.head)>NEAR+.3&&depthOf(c,sk.chest)>NEAR+.3){const a=P(c,ss.head),b=P(c,sk.chest);rInk(s,ribbon([a,[lerp(a[0],b[0],wd),lerp(a[1],b[1],wd)]],Math.max(4,.03*kAt(c,sk.chest)),{taper:0,wobble:.5,gaps:dashes(.07,.035)}),.95);}
   // "never comes": his full height ringed, still up
   const nc=sm(q.nc,q.nc+.35,tt,easeOutBack)*(1-sm(q.end-.7,q.end-.35,tt));if(nc>.02)ruler(s,c,w.ob.place.x??0,w.ob.place.z??0,OB_B.height!*.84,nc,[.15,-.75]);
  });},
 aperture(t){const c=ch2Cam(t),o=oblakAt(tau2(t)).place,g:V3=[o.x??0,1,o.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.4*kAt(c,g),22,180),12);},
 still:5,
};

// ================= chapter 3 (replay low from Oblak's FRONT-LEFT at pitch level): the striker moves first; the low shot; the block comes toward the lens =================
const ch3q=()=>({st:T(2,'So the striker'),mf:T(2,'move first'),sl:T(2,'shoots low'),df:T(2,'drops fast'),bi:T(2,'blocks it'),gl:T(2,'his glove'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,-1.1],[q.mf,SS-.1],[q.sl,-.02],[q.df+.1,D0+.12],[q.bi+.1,TF],[q.gl+.3,TF+.12],[q.end,Math.min(T_O1+.3,TF+.12+(q.end-q.gl-.3)*.35)]]),x=>x);};
const C3:V3=[PD[0]+3.2,.95,PD[1]+8.4];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.max(tau,0));
 const look0:V3=[lerp(PD[0],SHOT[0],.45),.85,lerp(PD[1],SHOT[1],.45)],look1:V3=[HIT[0],.6,HIT[2]],look=mix3(look0,[lerp(look1[0],b[0],.3),.6,lerp(look1[2],b[2],.3)],sm(q.sl,q.bi,t,easeInOutSine));
 const v=key(t,mono([[0,...C3,1500],[q.mf,C3[0]-.3,C3[1],C3[2]-.4,1650],[q.sl,C3[0]-.6,.8,C3[2]-1.2,1900],[q.bi,C3[0]-.7,.75,C3[2]-1.5,2050],[q.end,C3[0]-.9,.9,C3[2]-1.2,1850]]),easeInOutSine,true);
 return cam([v[0],v[1],v[2]],look,v[3]);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),hitT=q.bi+.1;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.8*sm(TF,TF+.5,tp),flash:.1+.6*sm(TF,TF+.4,tp)},()=>{
   const w=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const sk=solve(w.ob.pose,OB_B,w.ob.place),ss=solve(w.st.pose,ST_B,w.st.place);
   // "So the striker": a red ring round him on the grass
   const st=sm(q.st,q.st+.3,tt,easeOutBack)*(1-sm(q.sl,q.sl+.4,tt));if(st>.02){const p=new Path2D();gRing(p,c,ss.pelvis[0],ss.pelvis[2],.9*st,.08);rInk(s,p,.95);}
   // "move first": red sparks off his planted foot as he commits to the shot
   const mf=sm(q.mf,q.mf+.2,tt)*(1-sm(q.mf+.6,q.mf+1,tt));if(mf>.02&&depthOf(c,ss.lAn)>NEAR+.3){const p=P(c,ss.lAn),k=kAt(c,ss.lAn);sparkBurst(s,RD,p[0],p[1],(.35+.3*mf)*k,{n:8,seed:21,g:mf,width:Math.max(4,.03*k)});}
   // "shoots low": the shot's path, dashed, skimming the grass toward his glove
   const sl=sm(q.sl,q.sl+.4,tt,easeOut)*(1-sm(q.gl,q.gl+.5,tt));if(sl>.02){const pts=proj(c,flight(0,TF*sl));if(pts.length>1)yInk(s,ribbon(pts,Math.max(4,.07*kAt(c,HIT)),{taper:.2,wobble:.5,gaps:dashes(.1,.05)}),.95);}
   // "drops fast": speed lines along his dive
   const df=sm(q.df,q.df+.2,tt)*(1-sm(q.bi+.3,q.bi+.8,tt));if(df>.02&&depthOf(c,sk.pelvis)>NEAR+.5){const a=P(c,sk.chest),b=P(c,sk.lHa);speedLines(s,K,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:5,seed:9,len:150*df,width:6,cov:.8});}
   // "blocks it": sparks where the ball meets his glove
   if(tp>=TF&&tp<TF+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],90+90*sm(TF,TF+.08,tp,easeOut),{n:10,seed:6,g:1-sm(TF+.08,TF+.25,tp),width:11});}
   // "his glove": a ring round the left glove
   const gl=sm(q.gl,q.gl+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));jRing(s,c,sk.lHa,.24,gl);
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),o=oblakAt(tau).place,g:V3=[o.x??0,.5,o.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.6,
};

// ================= chapter 4 (duotone lesson, high behind Oblak's shoulder): the early diver is rounded; the keeper who stays up makes them move first =================
const ch4q=()=>({de:T(3,'dive early'),sf:T(3,'Stay on your feet'),al:T(3,'as long as you can'),at:T(3,'attacker'),mf:T(3,'move first'),end:SEC(3)});
/** lesson clock: the run on "dive early" (the ghost goes down), Oblak still up through "as long as you can", the shot on "move first" */
const tau4=(t:number)=>{const q=ch4q(),mfT=Math.max(q.mf,q.at+.5);return key(t,mono([[0,-2.6],[q.de,-2],[q.sf,-1.3],[q.al,-.8],[q.at,-.45],[mfT,0],[mfT+.5,TF],[q.end,TF+.15+(q.end-mfT-.5)*.3]]),x=>x);};
const OB4=duo(OBLAK,true),ST4=duo(STRIKER),GHOST=duo(OBLAK,false,true);
/** the ghost: a keeper who dives at the ball's feet too early — and the striker's easy way round him */
const GH_T=-1.6;
const ghostAt=(tau:number):{pose:Pose;place:Place}=>{const b=ballAt(GH_T),o=oblakAt(GH_T).place;return{pose:keeperDive(clamp((tau-GH_T)/.8),{side:'r',height:0}),place:{x:o.x,z:o.z,yaw:YAW(b[0]-(o.x??0),b[2]-(o.z??0))}};};
function LCAM(t:number){const q=ch4q(),v=key(t,mono([[0,.8,3.4,-5.2,1900],[q.sf,.2,3,-4.8,2150],[q.at,-.4,2.7,-4.4,2200],[q.mf+.4,.6,3.2,-4.8,1750],[q.end,.6,3.2,-4.8,1700]]),easeInOutSine,true);
 const look:V3=mix3([lerp(PD[0],SHOT[0],.55),.6,lerp(PD[1],SHOT[1],.55)],[lerp(HIT[0],SHOT[0],.4),.5,lerp(HIT[2],SHOT[1],.4)+.6],sm(q.at,q.mf+.5,t,easeInOutSine));return cam([v[0],v[1],v[2]],look,v[3]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-34],[0,0,-34],[0,0,34],[-60,0,34]]));s.tone(K,floor,.2);
  const lines=new Path2D();groundLine(lines,c,[0,-34],[0,34],.2);groundLine(lines,c,[0,-20.16],[-16.5,-20.16],.2);groundLine(lines,c,[-16.5,-20.16],[-16.5,20.16],.2);groundLine(lines,c,[-16.5,20.16],[0,20.16],.2);
  groundLine(lines,c,[0,-9.16],[-5.5,-9.16],.2);groundLine(lines,c,[-5.5,-9.16],[-5.5,9.16],.2);groundLine(lines,c,[-5.5,9.16],[0,9.16],.2);s.knockout(lines,.6);
  // the goal frame (paper) so the angle reads
  const gf=new Path2D();for(const [a,b] of [[[0,0,-3.66],[0,2.44,-3.66]],[[0,0,3.66],[0,2.44,3.66]],[[0,2.44,-3.66],[0,2.44,3.66]]] as [V3,V3][])if(depthOf(c,a)>NEAR&&depthOf(c,b)>NEAR)gf.addPath(ribbon([P(c,a),P(c,b)],Math.max(4,.1*kAt(c,a)),{taper:0,wobble:.4}));s.knockout(gf,.9);
  const bNow=ballAt(Math.min(tp,0)),tri=angleTri(c,[bNow[0],bNow[2]]);s.knockout(tri,.2);s.tone(Y,tri,.22);
  const items:Item[]=[];
  // "dive early": the ghost keeper goes down too soon, and the dashed way round him into an open goal
  const de=sm(q.de,q.de+.3,tt)*(1-sm(q.sf+.4,q.sf+1,tt));if(de>.02&&tp>GH_T-.3){const g=ghostAt(tp),gp=ghostAt(tp-1/12);items.push({depth:-1e9,draw:()=>drawPlayer(s,g.pose,c,GHOST,g.place,{prev:gp})});
   const b0=ballAt(GH_T),o=oblakAt(GH_T).place,round:V3[]=[[b0[0],.05,b0[2]],[(o.x??0)-.8,.05,(o.z??0)+2.4],[(o.x??0)+1.4,.05,(o.z??0)+2.2],[-.4,.05,.6]],pts=proj(c,round);if(pts.length>1){const u=sm(q.de+.3,q.de+1.1,tt,easeOut),n=Math.max(2,Math.ceil(pts.length*u));s.fill(K,ribbon(pts.slice(0,n),Math.max(5,.14*kAt(c,[o.x??0,0,o.z??0])),{taper:.2,wobble:.6,gaps:dashes(.1,.05)}),.6*de);}}
  const n=oblakAt(tp),np=oblakAt(tp-1/12),sl=strikerAt(tp),slp=strikerAt(tp-1/12),bpos=ballAt(tau);
  items.push({depth:depthOf(c,[n.place.x??0,0,n.place.z??0]),draw:()=>drawPlayer(s,n.pose,c,OB4,n.place,{prev:np,smear:true})});
  items.push({depth:depthOf(c,[sl.place.x??0,0,sl.place.z??0]),draw:()=>drawPlayer(s,sl.pose,c,ST4,sl.place,{prev:slp})});
  items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),rr=Math.max(12,BALL_R*kAt(c,bpos));starBall(s,bp[0],bp[1],rr,tau*9,{sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(rr*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  const sk=solve(n.pose,OB_B,n.place),ss=solve(sl.pose,ST_B,sl.place);
  // "Stay on your feet": a ring round his boots
  const sf=sm(q.sf,q.sf+.3,tt,easeOutBack)*(1-sm(q.at,q.at+.4,tt));if(sf>.02){const p=new Path2D();gRing(p,c,(sk.lAn[0]+sk.rAn[0])/2,(sk.lAn[2]+sk.rAn[2])/2,.7*sf,.1);yInk(s,p,.95);}
  // "as long as you can": a timer arc filling round his head while he stays up
  const al=sm(q.al,q.al+.3,tt)*(1-sm(q.mf+.3,q.mf+.7,tt));if(al>.02&&depthOf(c,sk.head)>NEAR+.3){const p=P(c,add(sk.head,[0,.55,0])),k=kAt(c,sk.head),r=.28*k,fill=clamp((tt-q.al)/Math.max(.5,q.mf-q.al)),pts:Pt[]=[];for(let i=0;i<=20;i++){const a=-Math.PI/2+fill*TAU*i/20;pts.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}if(fill>.02)yInk(s,ribbon(pts,Math.max(4,.05*k),{taper:0,wobble:.5}),.95*al);}
  // "attacker": a ring round the striker
  const at=sm(q.at,q.at+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(at>.02){const p=new Path2D();gRing(p,c,ss.pelvis[0],ss.pelvis[2],.9*at,.08);yInk(s,p,.95);}
  // "move first": sparks off his boot as he shoots — then the block
  if(tp>=0&&tp<.25){const p=P(c,[SHOT[0],.15,SHOT[1]]);sparkBurst(s,Y,p[0],p[1],60,{n:8,seed:41,g:1-sm(.08,.25,tp),width:8});}
  if(tp>=TF&&tp<TF+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],80,{n:10,seed:42,g:1-sm(TF+.08,TF+.25,tp),width:9});}
 },
 still:6,
};

const story:RisoStory={
 id:'oblak-signature',format:'11v11',title:'Oblak stays up',
 theme:'One on one? Stay on your feet as long as you can, so the attacker has to move first.',
 ageNote:'Signature move, shown in a real match: Bayern Munich 2–1 Atlético Madrid (Atlético through on away goals), Champions League semi-final, Allianz Arena, Munich, 3 May 2016 — Jan Oblak was man of the match. This one-on-one is an illustration of how he played, not one filmed moment.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball skims in low and is blocked by a yellow glove with sparks. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.8),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*28*g] as Pt;}),true),12,.95);
  const bx=u<.45?x-side*(1-u/.45)*140:x-side*(u-.45)/.55*110,by=u<.45?y-8:y-8-Math.sin((u-.45)/.55*Math.PI)*70;
  if(age>.34&&age<.6)sparkBurst(s,Y,x,y-8,100,{n:8,seed,g:1-clamp((age-.34)/.26),width:10});
  starBall(s,bx,by,44,age*12+hash(seed,3)*TAU,{sq:age>.34&&age<.46?.2:0,dir:0});
 },
};
export default story;
