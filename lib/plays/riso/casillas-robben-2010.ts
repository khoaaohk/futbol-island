/** Iconic play film: Iker Casillas's outstretched-foot save from Arjen Robben's one-on-one, 2010 FIFA World Cup final, Netherlands 0–1 Spain
 * (after extra time), Soccer City, Johannesburg, 11 July 2010, 62nd minute, 0–0.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/casillas-robben-2010/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/casillas-robben-2010/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/casillas-robben-2010/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read for this film; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2010 FIFA World Cup final" (raw wikitext): the 62nd-minute chance ("receiving the ball from a Sneijder pass upfield, Robben
 *    was one-on-one with Casillas. He delayed his shot before attempting to flick the ball over the goalkeeper into the corner of the goal, but
 *    his shot lacked height and Casillas was able to put the ball out for a corner"), the line-ups, numbers and kit templates.
 *  - The Guardian, Scott Murray, "World Cup final: Holland v Spain – as it happened", 11 July 2010: "62 min: WHAT A MISS!!! Sneijder takes down
 *    a goal kick and slips a lovely pass straight down the centre, freeing Robben. He's onside, clear on goal with only Casillas to beat, and
 *    waits until the keeper commits. But he doesn't get any height on the ball as he goes to clip it into the corner, allowing the keeper to
 *    stick out a leg and deflect the shot over and out for a corner. Robben puts his head in his hands".
 *  - ESPN, Elko Born, "Arjen Robben and the trauma of 2010", 8 June 2014: "he slipped through the high Spanish defensive line … the Spanish
 *    goalkeeper managed to tip the ball out wide with the toe of his right foot. Robben clasped his head with his hands and fell to his knees."
 *  - Wikimedia Commons, "The 2010 World Cup Final.jpg" (pre-match line-up photo): Casillas in a GREEN keeper's kit (green shirt collar and green
 *    shorts, white socks); the referees in light-blue shirts, black shorts and socks. "FIFA World Cup 2010 Final Line-ups.jpg": Spain's navy
 *    shorts and socks, the Netherlands all in orange, Stekelenburg in black shorts and yellow socks, the gold Jo'bulani ball.
 *  - Stadium, ball and kit research shared with lib/plays/riso/iniesta-final-2010.ts (same match; the calabash bowl, the big screen, the ball).
 * CONFIRMED by those sources: the World Cup final, Soccer City, 11 July 2010; 0–0 in the 62nd minute; Sneijder (10) took down a goal kick and
 *  passed straight down the centre; Robben (11) was onside, through Spain's high line, one-on-one with Casillas (1, captain); Robben delayed
 *  and waited for the keeper to commit; the shot was low (no height) toward the corner; Casillas stuck out a leg and turned it wide with the
 *  TOE OF HIS RIGHT FOOT, out for a corner; Robben put his hands on his head and fell to his knees; Spain in dark blue (#003366) with navy
 *  shorts and socks, the Netherlands all orange; Casillas in green with white socks; the officials in light blue; Puyol (5) and Piqué (3)
 *  were Spain's centre-backs; Spain won 1–0 after extra time (Iniesta, 116').
 * INFERRED / ILLUSTRATIVE: every position, speed and time in metres/seconds; Robben shooting with his LEFT foot (his strong foot; not stated
 *  in the sources, so the narration does not name it); Casillas starting to fall to his LEFT while his trailing right leg swept out to his
 *  right (as recalled from the footage, not re-verified — the narration only says "right foot" and "toe", which are confirmed); where Casillas
 *  stood (≈8 m out); the goal kick's flight; which end Spain defended and which touchline the main camera sat on; every other player's spot;
 *  Casillas's gloves (yellow) and number ink; Puyol and Piqué chasing; the referee's light blue printed as a light navy screen (this ink set
 *  has no blue: green is spent on Casillas's kit and the grass); the stadium as drawn (see the Iniesta film); the camera placements and lenses.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 Sneijder's pass): ch1 = the live broadcast from the high main-stand camera in real time (the bowl, the teams, 0–0 at 62 on
 * the big screen, the goal kick taken down, the pass, Robben through, the save, the ball out); ch2 = the TV slow-motion replay, low from the
 * side (Casillas on his feet, big, Robben waiting); ch3 = the replay from low behind the goal (the low shot past his hands, the right foot, the
 * toe, the ball wide, Robben on his knees); ch4 = a duotone lesson (one-on-one: stay on your feet as long as you can, make yourself big, save it
 * with any part of your body). Seams are forward passages into the ball. The deflection point is read from the solved skeleton (Casillas's
 * right toe) and the shot is aimed at it, so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe), a lens that widens for a square window (1.45:1 … 1:1).
 * Inks: yellow (floodlights, the gold ball, grass under green, Spain's numbers, cue marks), orange (the Netherlands, the calabash, crowd),
 * green (Casillas's kit, the grass), navy (night sky, key line, Spain's dark blue kit). Scenes read only their local t; drawn objects pose on
 * twos, cameras on ones; all randomness is seeded. Budget ≈ 150–300 plate ops per frame; wide-shot figures print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,keyPoses,posed,runCycle,stand,strike,keeperSet,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',O='orange',Y='yellow',G='green';
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`casillas film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py casillas-robben-2010 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/casillas-robben-2010/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Soccer City','Johannesburg, 2010, the World Cup final, nil-nil. Spain in dark blue, the Netherlands in orange. Sneijder slips a pass, and Arjen Robben is through on Iker Casillas... saved!',
  ['Johannesburg','the World Cup final','nil-nil','Spain','dark blue','the Netherlands','orange','Sneijder','Arjen Robben','through','Iker Casillas','saved']),
 prov('Stay big','Watch again, slowly. Casillas stays on his feet and makes himself big. Robben waits for him to dive.',
  ['Watch again','slowly','stays on his feet','makes himself big','Robben waits','dive']),
 prov('The toe','Robben shoots low, past his hands, but Casillas sticks out his right foot. His toe turns it wide!',
  ['Robben shoots low','past his hands','sticks out','right foot','His toe','wide']),
 prov('One on one','One on one, stay on your feet as long as you can, make yourself big, and save it with any part of your body.',
  ['One on one','stay on your feet','as long as you can','make yourself big','any part of your body']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`casillas film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Spain's goal line x = 0, net toward +x, pitch to x = −105) =================
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
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a ring on the grass round a ground point, into a path */
function gRing(path:Path2D,c:Camera,x:number,z:number,r:number,w:number){const g=groundRing(c,x,z,r,26);if(g.length>2)path.addPath(ribbon(g,Math.max(4,w*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}
/** 7-segment block digits (glyph box 1 × 2) for the big screen */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};

// ================= Soccer City from inside: the calabash bowl, the roof ring with floodlights, the big screen (as in the Iniesta film) =================
const CX=-52.5;// the centre spot
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.sqrt(Math.abs(c)),y,b*Math.sign(s)*Math.sqrt(Math.abs(s))];}
type Lv=[number,number,number];// a, b, y
const BOWL:Lv[]=[[62,44,1.2],[80,61,21],[82,63,23],[101,81,44]];
const ROOF_IN:Lv=[84,65,47],ROOF_OUT:Lv=[106,86,50];
const NSEG=40;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
/** crowd: [tier, u round the bowl, v up the tier, ink 0 paper / 1 orange (Dutch) / 2 yellow (Spain) / 3 navy, phase] */
const CROWD=(()=>{const r=rng(2010),o:[number,number,number,number,number][]=[];for(let i=0;i<1500;i++){const tier=r()<.55?0:1,c=r();o.push([tier,r(),.05+r()*.9,c<.38?0:c<.72?1:c<.9?2:3,r()*TAU]);}return o;})();
const LAMPS:V3[]=Array.from({length:44},(_,i)=>lvAt([ROOF_IN[0]+.5,ROOF_IN[1]+.5,ROOF_IN[2]-.8],i/44*TAU));
/** the big screen under the roof behind Spain's goal (faces the pitch, −x) */
const SCR={x:CX+ROOF_IN[0]-1.2,y0:37.5,y1:45,z0:-9.5,z1:9.5};
const SCREEN_C:V3=[SCR.x,(SCR.y0+SCR.y1)/2,0];
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;hot?:number};
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,ey=c.eye;
 // a winter night: a heavy navy screen, stepped darker high up
 s.field(K,.55,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz-620],[-Bnd,hz-520]],true),.32);
 // stands: navy screen, the rows stepped, the fascia between the tiers printed orange (the calabash's earth colours)
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [[0,1,false],[1,2,true],[2,3,false]] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   addPoly(isF?fascia:stands,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1)));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.tone(K,stands,.45);s.tone(O,rows,.2);s.tone(K,rows,.2);s.knockout(fascia);s.fill(O,fascia,.75);s.tone(K,fascia,.32);
 // crowd: faces, orange shirts, Spain's yellow and navy — bobbing on the twos when they rise
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,p=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(O,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(K,heads[3],.9);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=r()<.5?0:1,th=r()*TAU,q=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass: yellow × green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);yInk(s,gp,.8);s.tone(G,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(G,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // the roof ring and its floodlights
 const roof=new Path2D();for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(ROOF_OUT,ROOF_IN,t0,t1)));addPoly(roof,clipPoly(c,band(ROOF_IN,[ROOF_IN[0],ROOF_IN[1],ROOF_IN[2]-2.2],t0,t1)));}
 s.knockout(roof);s.fill(K,roof,.88);
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((3.6+(o.hot??0)*3)*k,10,380);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.1*k,5,140),h=clamp(.6*k,3,80);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.6);}
 screen(s,c);
 goal(s,c,o.net);
 drawIn();
}
/** the big screen: a navy panel, the flags (Netherlands orange/paper/navy, Spain orange/yellow/orange), 0-0 and the minute, 62 */
function screen(s:Sheet,c:Camera){
 if(depthOf(c,SCREEN_C)<4)return;
 const at=(u:number,v:number):V3=>[SCR.x,lerp(SCR.y1,SCR.y0,v),lerp(SCR.z0,SCR.z1,u)];
 const quad=(u0:number,v0:number,u1:number,v1:number)=>{const q=[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1)];for(const p of q)if(depthOf(c,p)<NEAR)return[] as Pt[];return q.map(p=>P(c,p));};
 const panel=new Path2D();addPoly(panel,quad(0,0,1,1));s.knockout(panel);s.fill(K,panel,.95);
 const orange=new Path2D(),yel=new Path2D(),pap=new Path2D(),nav=new Path2D();
 addPoly(orange,quad(.05,.12,.22,.24));addPoly(pap,quad(.05,.24,.22,.36));addPoly(nav,quad(.05,.36,.22,.48));
 addPoly(orange,quad(.78,.12,.95,.2));addPoly(yel,quad(.78,.2,.95,.4));addPoly(orange,quad(.78,.4,.95,.48));
 const glyphs=(str:string,u0:number,v0:number,gw:number,gh:number,path:Path2D)=>{[...str].forEach((ch,ci)=>{for(const sg of DIGITS[ch]??''){const[[x0,y0],[x1,y1]]=SEGS[sg],th=.3,hx=x1===x0?th/2:0,hy=y1===y0?th/2:0,ex=x1===x0?0:th/2,ey=y1===y0?0:th/2,ox=u0+ci*gw*1.5;
   addPoly(path,quad(ox+(x0-hx-ex)*gw,v0+(y0-hy-ey)*gh/2,ox+(x1+hx+ex)*gw,v0+(y1+hy+ey)*gh/2));}});};
 glyphs('0-0',.31,.12,.11,.36,pap);glyphs('62',.4,.62,.08,.26,yel);
 s.knockout(orange);s.fill(O,orange,.95);s.knockout(yel);s.fill(Y,yel,.95);s.knockout(pap);s.knockout(nav);s.tone(K,nav,.6);
}
/** Spain's goal at x = 0: posts, bar, a box net held by stanchions; `net` displaces the mesh (the ball brushing the side netting) */
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

// ================= the ball: the final's gold Jo'bulani — yellow with an orange screen, navy swooshes turning with the spin, a navy rim =================
const BALL_R=.11;
function goldBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);s.fill(Y,disc,duo?.6:.88);if(!duo)s.tone(O,disc,.32);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.4);
 const sw=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,m=Math.cos(spin*.6);sw.addPath(ribbon([[Math.cos(a)*r*.15,Math.sin(a)*r*.15*m],[Math.cos(a+.7)*r*.55,Math.sin(a+.7)*r*.55*m],[Math.cos(a+1.5)*r*.72,Math.sin(a+1.5)*r*.72*m]],Math.max(2,r*.13),{taper:.7,wobble:0}));}
 s.fill(K,sw,.9);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (the 2010 final) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[O,.2]],SKIN_D:AthleteStyle['skin']=[[O,.45],[Y,.5],[K,.3]];
/** Spain: the dark blue away kit (a heavy navy screen, so the solid navy key line still reads), yellow numbers */
const ESP=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.78],shorts:[K,.78],socks:[K,.78],trim:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:n,...o});
/** the Netherlands: all orange */
const NED=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:O,socks:O,trim:K,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:30+n,...o});
/** Iker Casillas: the green keeper's kit, white socks (confirmed by the pre-match photo); yellow gloves (inferred) */
const CASILLAS:AthleteStyle={shirt:G,shorts:G,socks:'paper',trim:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',gloves:[Y,.9],line:K,shade:[K,.3],sleeves:'long',number:1,numberInk:K,build:{height:1.85,bulk:1},seed:1};
const ROBBEN:AthleteStyle=NED(11,{hair:null,hairStyle:'bald',build:{height:1.8,bulk:.95},seed:11});
const SNEIJDER:AthleteStyle=NED(10,{hair:[K,.8],build:{height:1.7,bulk:1.02}});
const PUYOL:AthleteStyle=ESP(5,{hair:K,hairStyle:'curly',build:{height:1.78,bulk:1.05}});
const PIQUE:AthleteStyle=ESP(3,{hair:K,build:{height:1.94,bulk:1}});
/** the referee: light blue in life, printed as a light navy screen (this ink set has no blue) */
const REF:AthleteStyle={shirt:[K,.32],shorts:[K,.9],socks:[K,.9],trim:Y,boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[K,.55]:[Y,.6],shorts:lead?[K,.55]:[K,.32],socks:lead?'paper':[Y,.6],trim:lead?Y:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?Y:K,gloves:st.gloves?[Y,.85]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Sneijder's pass) =================
const CB:Build=CASILLAS.build!,RB:Build=ROBBEN.build!;
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

// ---- Casillas: out to ≈8 m, the ready stance → tall and big → the save: he starts to fall to his left, his right leg sweeps out to his right ----
/** "big": tall on the balls of the feet, knees soft, arms wide and low, palms open */
const BIG=posed({lHipF:28,rHipF:28,lHipA:20,rHipA:20,lKnee:38,rKnee:38,lAnk:-4,rAnk:-4,lean:12,pitch:4,lShA:58,rShA:58,lShF:26,rShF:26,lElb:26,rElb:26,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-10});
const SAVE_DUR=.8,SAVE_T=.54;
/** the foot save (t 0..1): load → falling left, right leg long and low out to his right, toe up to the ball (SAVE_T) → down on his left side */
function footSave(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,BIG],
  [.24,posed({roll:-10,dz:-.05,lHipF:44,lKnee:72,lHipA:10,rHipF:24,rHipA:30,rKnee:40,lean:14,pitch:4,lShA:80,rShA:74,lShF:30,rShF:24,lElb:24,rElb:24,lHand:1,rHand:1,neckP:-6,neckY:-18})],
  [SAVE_T,posed({roll:-45,dz:-.2,air:.12,lHipF:80,lKnee:130,lHipA:-10,rHipA:22,rHipF:0,rKnee:0,rAnk:10,lean:15,bend:10,lShA:130,rShA:100,lShF:20,rShF:10,lElb:20,rElb:14,lHand:1,rHand:1,neckY:-40,neckP:4})],
  [.78,posed({roll:-78,dz:-.45,air:.02,lHipF:56,lKnee:90,lHipA:-4,rHipA:16,rHipF:10,rKnee:18,rAnk:14,lean:12,bend:8,lShA:150,rShA:118,lShF:24,rShF:18,lElb:30,rElb:26,lHand:1,rHand:1,neckY:-50,neckP:0})],
  [1,posed({roll:-88,dz:-.55,lHipF:48,lKnee:76,rHipA:8,rHipF:22,rKnee:36,rAnk:20,lean:10,bend:4,lShA:140,rShA:96,lShF:30,rShF:30,lElb:44,rElb:40,lHand:.8,rHand:.8,neckY:-58,neckP:-8})],
 ];
 const p=keyPoses(clamp(t),keys);p.squash=clamp(.05*Math.sin(Math.PI*clamp(t/SAVE_T))-.06*sm(.72,.86,t)+.05*sm(.86,1,t),-.3,.3);return p;
}
// ---- the shot: Robben, facing Casillas, shoots low with his LEFT foot (inferred) toward the keeper's right-hand corner ----
const TS=5.2;// Robben's contact
const C_AT:[number,number]=[-8.1,.55];// where Casillas stands when Robben shoots
const B_S:[number,number]=[-12.3,1.05];// the ball at Robben's contact
const YC=YAW(B_S[0]-C_AT[0],B_S[1]-C_AT[1]);// Casillas faces the ball
const CPLACE:Place={x:C_AT[0],z:C_AT[1],yaw:YC};
const SAVE_SK=solve(footSave(SAVE_T),CB,CPLACE);
/** the deflection point: the ball's centre just off the toe of his right boot */
const HIT:V3=[SAVE_SK.rToe[0]-.04,Math.max(.14,SAVE_SK.rToe[1]+.02),SAVE_SK.rToe[2]-.06];
const TH=TS+.28;// the ball reaches the toe (≈15 m/s over 4 m)
const SAVE0=TH-SAVE_T*SAVE_DUR;// Casillas commits just before the contact (Robben "waits until the keeper commits")
const YR=YAW(HIT[0]-B_S[0],HIT[2]-B_S[1]);// the shot's heading
const RSTRIKE=(u:number)=>strike(u,{foot:'l',power:.55});
const RFP=footSpot(B_S,YR,RSTRIKE(STRIKE_CONTACT),RB,'l');
const [rfx,rfz]=dirOf(YR);
/** the deflection: off the toe, up a little and out past his right-hand post (z < −3.66), over the line for a corner */
const OUT1:V3=[2.4,.5,-7.4],OUT2:V3=[5.2,.11,-9.6];
// ---- the build-up: Casillas's goal kick taken down by Sneijder in the centre circle, his pass straight down the middle ----
const F0:V3=[-56.2,.11,2.2];// the ball at Sneijder's feet when he passes
const YS0=YAW(-35.9-F0[0],.35-F0[2]);
const SFP=footSpot([F0[0],F0[2]],YS0,strike(STRIKE_CONTACT,{power:.45}),SNEIJDER.build!,'r');
const [sfx,sfz]=dirOf(YS0);
const SNE_P:MKey[]=[[-4,SFP[0]-1.6,SFP[1]+.4],[-.62,SFP[0]-sfx*1.1,SFP[1]-sfz*1.1],[.5,SFP[0]+sfx*.5,SFP[1]+sfz*.5],[4,SFP[0]+sfx*6,SFP[1]+sfz*2],[9,SFP[0]+sfx*12,SFP[1]+sfz*3]];
/** Robben: in behind from the right of centre, onto the pass, down the middle, slowing to wait, the shot, on to a stop */
const RB_P:MKey[]=[[-4,-50,-8.5],[0,-44.5,-4.6],[1.5,-36.8,.1],[3.3,-22.6,.9],[TS-1.1,-16.8,1.2],[TS-.62,RFP[0]-rfx*1.1,RFP[1]-rfz*1.1],[TS+.4,RFP[0]+rfx*.8,RFP[1]+rfz*.8],[TS+1.3,RFP[0]+rfx*2.6,RFP[1]+rfz*2.2]];
function dribbleBall(tau:number):V3{const q=pathPos(RB_P,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.72+.35*Math.abs(Math.sin(q.dist*1.1));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
const R1=dribbleBall(1.5),RL=dribbleBall(TS-1.1);
const GK0:V3=[-34,17,1.4],GKA:V3=[F0[0]+1.3,.7,F0[2]-.2];
function ballAt(tau:number):V3{
 if(tau<-.9){const u=clamp((tau+2.4)/1.5),p=mix3(GK0,GKA,u);p[1]=17*(1-u*u)+.7*u*u;return p;}
 if(tau<0){const u=(tau+.9)/.9,p=mix3(GKA,F0,easeOut(u));p[1]=Math.max(.11,lerp(.7,.11,u)+.22*Math.sin(Math.PI*Math.min(1,u*1.6))*(1-u));return p;}
 if(tau<1.5){const u=tau/1.5;return mix3(F0,R1,u*(1.35-.35*u));}
 if(tau<TS-1.1)return dribbleBall(tau);
 if(tau<TS){const u=easeOut(clamp((tau-(TS-1.1))/.95));return mix3(RL,[B_S[0],.11,B_S[1]],u);}
 if(tau<TH){const u=(tau-TS)/(TH-TS),p=mix3([B_S[0],.11,B_S[1]],HIT,u);p[1]+=.1*Math.sin(Math.PI*u);return p;}
 const e=tau-TH;if(e<.55){const u=e/.55,p=mix3(HIT,OUT1,u);p[1]=lerp(HIT[1],OUT1[1],u)+1.3*u*(1-u);return p;}
 const d=clamp((e-.55)/.9),p=mix3(OUT1,OUT2,easeOut(d));p[1]=Math.max(.11,OUT1[1]*(1-d)*(1-d)+.35*Math.abs(Math.sin(d*Math.PI*1.5))*(1-d));return p;}
const HEAD_HANDS=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:30,lShF:150,rShF:150,lShA:44,rShA:44,lElb:128,rElb:128,neckP:24,lean:8});
const KNEEL=posed({lHipF:4,rHipF:8,lKnee:112,rKnee:112,lAnk:50,rAnk:50,lean:24,pitch:6,lShF:152,rShF:152,lShA:42,rShA:42,lElb:132,rElb:132,neckP:36});
function robbenAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(RB_P,tau,ballAt(tau),2);
 if(tau>TS-.7&&tau<TS+.7){const u=clamp((tau-TS+.57)/1.1),w=Math.sin(clamp((tau-TS+.7)/1.4)*Math.PI);r.pose=blendPose(r.pose,RSTRIKE(u),w);r.place.yaw=lerpAng(r.place.yaw??0,YR,w);}
 if(tau>TS+1){r.pose=blendPose(r.pose,HEAD_HANDS,sm(TS+1,TS+1.6,tau));r.place.yaw=lerpAng(r.place.yaw??0,YR,sm(TS+1,TS+1.5,tau));}
 if(tau>TS+1.9){r.pose=blendPose(HEAD_HANDS,KNEEL,sm(TS+1.9,TS+2.6,tau));r.pose.neckP+=.06*Math.sin(tau*1.7);}
 return r;}
const CAS_P:MKey[]=[[-4,-11.5,0],[1,-11,.1],[3.2,-8.9,.45],[4.3,C_AT[0],C_AT[1]]];
function casillasAt(tau:number):{pose:Pose;place:Place}{
 if(tau>=SAVE0)return{pose:footSave((tau-SAVE0)/SAVE_DUR),place:CPLACE};
 const b=ballAt(tau),r=runner(CAS_P,tau,b,5,keeperSet(tau*1.6));
 if(tau>3.9){const u=sm(3.9,4.7,tau,easeInOutSine),bob=.5+.5*Math.sin(tau*7);r.pose=blendPose(r.pose,{...BIG,lKnee:BIG.lKnee+.06*bob,rKnee:BIG.rKnee+.06*bob},u);r.place.yaw=lerpAng(r.place.yaw??0,YAW(b[0]-C_AT[0],b[2]-C_AT[1]),u);}
 if(tau>SAVE0-.12){const u=sm(SAVE0-.12,SAVE0,tau);r.pose=blendPose(r.pose,BIG,u);r.place={x:lerp(r.place.x??0,C_AT[0],u),z:lerp(r.place.z??0,C_AT[1],u),yaw:lerpAng(r.place.yaw??0,YC,u)};}
 return r;}

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const ACTORS:Actor[]=[
 {style:SNEIJDER,at:(t,b)=>{const r=runner(SNE_P,t,b,1);if(t<-.62){r.place.yaw=YAW(b[0]-r.place.x!,b[2]-r.place.z!);}
  if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2),w=Math.sin(clamp((t+.7)/1.4)*Math.PI);r.pose=blendPose(r.pose,strike(u,{power:.45}),w);r.place.yaw=lerpAng(r.place.yaw??0,YS0,w);}return r;}},// Wesley Sneijder
 mover(PUYOL,[[-4,-44,1],[0,-42,.8],[1.5,-38.6,-.6],[3.3,-26,-.4],[TS,-16.2,-.1],[TS+1.2,-12.6,-.8],[TS+3,-12,-1]],3),// Carles Puyol, beaten, chasing
 mover(PIQUE,[[-4,-43,-9],[0,-41.5,-7.5],[1.5,-38.5,-6.2],[3.3,-28,-4.6],[TS,-19.5,-3.4],[TS+1.4,-15.4,-3.2]],4),// Gerard Piqué
 mover(ESP(11,{hair:K}),[[-4,-44,-18],[0,-43,-17],[3.3,-33,-13],[TS,-26,-10]],6),// Joan Capdevila
 mover(ESP(15,{hair:[K,.9],build:{height:1.83}}),[[-4,-45,17],[0,-44,16],[3.3,-34,13],[TS,-27,11]],7),// Sergio Ramos
 mover(ESP(16,{hair:K,build:{height:1.89,bulk:.94}}),[[-4,-50,6],[TS,-40,4]],8),// Sergio Busquets
 mover(ESP(8,{hair:K,build:{height:1.7}}),[[-4,-58,-7],[TS,-47,-5]],9),// Xavi
 mover(ESP(14,{hair:K}),[[-4,-61,11],[TS,-50,8]],10),// Xabi Alonso
 mover(ESP(6,{hair:[K,.85],hairStyle:'balding',build:{height:1.71}}),[[-4,-64,-15],[TS,-54,-12]],12),// Andrés Iniesta
 mover(NED(9,{hair:K}),[[-4,-49,11],[0,-46,10],[3.3,-33,8],[TS,-24,7.2],[TS+2,-19,6.4]],13),// Robin van Persie, in support
 mover(NED(7,{hair:[Y,.8]}),[[-4,-54,-20],[0,-50,-18],[TS,-34,-14]],14),// Dirk Kuyt
 mover(NED(6,{hair:[K,.7],build:{height:1.73,bulk:1.08}}),[[-4,-68,1],[TS,-60,0]],15),// Mark van Bommel
 mover(NED(8,{skin:SKIN_D,hair:K}),[[-4,-70,-8],[TS,-62,-6]],16),// Nigel de Jong
 mover(REF,[[-4,-60,12],[0,-56,11],[TS,-38,9]],17),// Howard Webb
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([ROBBEN,CASILLAS]);
/** everyone and the ball at τ, depth sorted. `hero` smears Robben and Casillas; `prev` gives every figure its secondary motion;
 * `cap` limits figure detail (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&!hero&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&!hero&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const rob=robbenAt(tp),cas=casillasAt(tp);
 put(ROBBEN,rob,robbenAt(tp-dt),!!o.hero);put(CASILLAS,cas,casillasAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  goldBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,rob,cas};}
/** the side netting brushed as the ball goes wide (a small bulge, only once the ball is past the post) */
const netBrush=(age:number)=>(p:V3):V3=>{if(age<=0)return p;const d=Math.hypot(p[0]-1,p[1]-.8,(p[2]+3.66)*2),w=.12*Math.exp(-age*3)*Math.exp(-d*d*.8)*Math.sin(age*18);return[p[0],p[1],p[2]-w];};

// ================= chapter 1 (live): the high main-stand camera in real time =================
const ch1q=()=>({jo:T(0,'Johannesburg'),wc:T(0,'the World Cup final'),sp:T(0,'Spain'),db:T(0,'dark blue'),ne:T(0,'the Netherlands'),or:T(0,'orange'),nn:T(0,'nil-nil'),sn:T(0,'Sneijder'),ar:T(0,'Arjen Robben'),th:T(0,'through'),ic:T(0,'Iker Casillas'),sa:T(0,'saved'),end:SEC(0)});
/** the lead-in: τ = t − TL. The toe meets the ball on "saved" when the voice allows; the pass always leaves near "Sneijder". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.sa-TH-.05,q.sn-1.7,Math.max(q.sn-1.7,Math.min(q.sn+.4,q.end-TH-1.1)));return{TL,end:q.end};};
const BCAM:V3=[-30,19,52];
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-50,33,60],[q.wc,-44,28,58],[q.db+.3,BCAM[0],BCAM[1],BCAM[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the pass the director's camera follows the words: the bowl → Spain → the Netherlands → the big screen → the goal kick */
function ch1Pre(t:number):V3{const q=ch1q(),{TL}=ch1T(),v=key(t,mono([[0,CX,16,0],[q.wc,CX+10,12,0],[q.nn+.3,SCREEN_C[0],SCREEN_C[1],0],[q.sp-.1,SCREEN_C[0],SCREEN_C[1]-1,0],[q.db+.3,-38,1,-3],[q.ne,-48,1,2],[q.or+.35,-50,1,0],[TL-1.8,-42,6,1]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<TS-.8)return[b[0]+3,Math.min(b[1],8)*.6+.8,b[2]*.6];
 return mix3([lerp(b[0],C_AT[0],.5),1,lerp(b[2],C_AT[1],.5)],[-4,1,-2.5],sm(TH+.2,TH+1.6,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(Math.max(q.or+.5,TL-2.4),Math.max(q.or+1.3,TL-1.2),t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1050],[q.wc,1300],[q.nn+.3,4600],[q.sp-.1,4400],[q.db+.3,3000],[q.ne,2800],[q.or+.3,2900],[TL-1.6,3000],[TL+1.4,3000],[TL+TS-.8,4400],[TL+TH+.2,5200],[q.end,4700]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings on "dark blue" / "orange"; Robben's ring on "Arjen Robben", Casillas's on "Iker Casillas" */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),re=sm(q.db,q.db+.3,t,easeOutBack)*(1-sm(q.ne,q.ne+.5,t)),rn=sm(q.or,q.or+.3,t,easeOutBack)*(1-sm(q.sn,q.sn+.5,t)),rr=sm(q.ar,q.ar+.3,t,easeOutBack)*(1-sm(q.sa+.3,q.sa+.8,t)),rc=sm(q.ic,q.ic+.3,t,easeOutBack)*(1-sm(q.sa+.3,q.sa+.8,t));
 if(re<.02&&rn<.02&&rr<.02&&rc<.02)return;const bp=ballAt(tp),pe=new Path2D(),pn=new Path2D();
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place,esp=Array.isArray(a.style.shirt)&&a.style.shirt[0]===K&&a.style.shirt[1]>.7,ned=a.style.shirt===O;if(esp&&re>.02)gRing(pe,c,p.x??0,p.z??0,.95*re,.14);if(ned&&rn>.02)gRing(pn,c,p.x??0,p.z??0,.95*rn,.14);});
 const rp=robbenAt(tp).place,cp=casillasAt(tp).place;
 if(rn>.02)gRing(pn,c,rp.x??0,rp.z??0,.95*rn,.14);if(rr>.02)gRing(pn,c,rp.x??0,rp.z??0,1.3*rr,.16);
 if(re>.02)gRing(pe,c,cp.x??0,cp.z??0,.95*re,.14);if(rc>.02)gRing(pe,c,cp.x??0,cp.z??0,1.3*rc,.16);
 yInk(s,pe,.95);s.knockout(pn,.9);s.fill(O,pn,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),tau=t-TL,tp=tt-TL,after=tau-TH;frame(s);
  const hot=sm(q.nn,q.nn+.4,t,easeOutBack)*(1-sm(q.sp+.2,q.sp+.7,t));
  stadium(s,c,{t,cheer:.12+.9*sm(0,.4,after)*(1-sm(1.2,2.4,after)),flash:.15+.9*sm(0,.4,after),net:netBrush(tau-TH-.45)},()=>{
   if(hot>.02){const p=P(c,SCREEN_C),k=kAt(c,SCREEN_C);yRing(s,p[0],p[1],Math.max(20,13*k*hot),Math.max(6,1.1*k));}
   teamRings(s,c,tp,t);
   // "through": a dashed yellow lane from Robben to the goal, through the space behind Spain's line
   const th=sm(q.th,q.th+.35,tt,easeOut)*(1-sm(q.ic+.2,q.ic+.7,tt));if(th>.02){const rp=robbenAt(tp).place,a:V3=[(rp.x??0)+1.5,.02,rp.z??0],b:V3=[-2,.02,-.5],gaps:[number,number][]=[];for(let x=.06;x<1;x+=.12)gaps.push([x,x+.05]);
    if(depthOf(c,a)>NEAR&&depthOf(c,b)>NEAR){const pa=P(c,a),pb=P(c,b);yInk(s,ribbon([pa,[lerp(pa[0],pb[0],th),lerp(pa[1],pb[1],th)]],Math.max(5,.12*kAt(c,a)),{taper:.2,wobble:.6,gaps}),.95);}}
   drawWorld(s,c,tau,tp,{ballMin:13,cap:t>q.end-.7});
   if(tp>=TH&&tp<TH+.3){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],70+60*sm(TH,TH+.1,tp,easeOut),{n:9,seed:3,g:1-sm(TH+.1,TH+.3,tp),width:10});}
  });},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low from the side): on his feet, big; Robben waits =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),sf:T(1,'stays on his feet'),mb:T(1,'makes himself big'),rw:T(1,'Robben waits'),dv:T(1,'dive'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,TS-2.7],[q.sf,TS-1.75],[q.rw,TS-.85],[q.end,TS-.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),rp=robbenAt(tau).place,mid:V3=[lerp(rp.x??0,C_AT[0],.55),.95,lerp(rp.z??0,C_AT[1],.55)];
 const orbit=sm(0,q.end,t,easeInOutSine),pos:V3=[mid[0]-3.2+2.6*orbit,1.25-.2*orbit,mid[2]+9.6-1.4*orbit];
 const look=mix3(mid,[C_AT[0],1,C_AT[1]],key(t,mono([[0,0],[q.sf,.3],[q.mb+.4,.4],[q.rw,.1],[q.end,.2]])));
 const F=key(t,mono([[0,1250],[q.sl,1350],[q.sf+.3,1650],[q.mb+.4,1800],[q.rw,1500],[q.end,1650]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.08},()=>{
   const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:true,prev:true,glow:sm(q.rw,q.rw+.3,tt)*(1-sm(q.dv+.2,q.dv+.6,tt)),cap:t>q.end-.7});
   const sk=solve(w.cas.pose,CB,w.cas.place);
   // "stays on his feet": yellow rings round both boots, planted
   const sf=sm(q.sf,q.sf+.35,tt,easeOutBack)*(1-sm(q.rw,q.rw+.5,tt));if(sf>.02){const p=new Path2D();gRing(p,c,sk.lAn[0],sk.lAn[2],.3*sf,.05);gRing(p,c,sk.rAn[0],sk.rAn[2],.3*sf,.05);yInk(s,p,.95);}
   // "makes himself big": a dashed yellow outline through his hands and feet — the space he fills
   const mb=sm(q.mb,q.mb+.45,tt,easeOutBack)*(1-sm(q.dv,q.dv+.5,tt));if(mb>.02){const cc=P(c,sk.chest),pts=[sk.lHa,sk.head,sk.rHa,sk.rToe,sk.lToe].map(j=>{const p=P(c,j);return[lerp(cc[0],p[0],.6+.55*mb),lerp(cc[1],p[1],.6+.55*mb)] as Pt;}),gaps:[number,number][]=[];for(let x=.03;x<1;x+=.08)gaps.push([x,x+.035]);
    yInk(s,ribbon(pts,Math.max(5,.05*kAt(c,sk.chest)),{close:true,taper:0,wobble:.6,gaps}),.95);}
   // "dive": the dive Robben is waiting for, drawn as an orange dashed ghost arc — Casillas doesn't give it to him
   const dv=sm(q.dv,q.dv+.3,tt,easeOut)*(1-sm(q.end-.8,q.end-.4,tt));if(dv>.02){const h=P(c,sk.head),k=kAt(c,sk.chest),dir=P(c,[sk.head[0],sk.head[1],sk.head[2]+1])[0]>h[0]?1:-1,pts:Pt[]=[];for(let i=0;i<=12;i++){const a=i/12*dv;pts.push([h[0]+dir*Math.sin(a*1.4)*1.4*k,h[1]+(1-Math.cos(a*1.4))*1.3*k]);}
    const gaps:[number,number][]=[];for(let x=.05;x<1;x+=.14)gaps.push([x,x+.06]);s.knockout(ribbon(pts,Math.max(5,.05*k),{taper:.3,wobble:.6,gaps}),.9);s.fill(O,ribbon(pts,Math.max(5,.05*k),{taper:.3,wobble:.6,gaps}),.9);}
  });},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(26,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from low behind the goal): the low shot past his hands, the right foot, the toe, wide =================
const ch3q=()=>({rs:T(2,'Robben shoots low'),ph:T(2,'past his hands'),so:T(2,'sticks out'),rf:T(2,'right foot'),ht:T(2,'His toe'),wd:T(2,'wide'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TS-.5],[q.rs+.3,TS],[q.ph+.3,TS+.14],[q.ht+.1,TH],[q.wd+.3,TH+.35],[q.end,TH+.35+(q.end-q.wd-.3)*.85]]),x=>x);};
const GCAM:V3=[4.4,1.25,-3.6];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.max(tau,TS)),rp=robbenAt(tau).place;
 const toOut=sm(q.wd-.1,q.wd+.8,t,easeInOutSine),toRob=sm(q.wd+.45,q.wd+1.4,t,easeInOutSine);
 const look0:V3=[lerp(C_AT[0],B_S[0],.25),.75,lerp(C_AT[1],B_S[1],.25)-.4],look1:V3=[b[0],clamp(b[1],.4,1.6),b[2]],look2:V3=[(rp.x??0),.9,(rp.z??0)];
 const look=mix3(mix3(look0,look1,toOut*.7),look2,toRob);
 const pos:V3=add(GCAM,[.2*toOut,.3*toRob,-1.2*toOut+.8*toRob]),F=key(t,mono([[0,2700],[q.rs,2900],[q.ph+.2,3300],[q.rf,3600],[q.ht+.2,3300],[q.wd,2200],[q.wd+.9,2000],[q.end,3200]]),easeInOutSine);return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),hitT=q.ht+.1;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.8*sm(TH,TH+.5,tp)*(1-sm(TH+1.5,TH+2.5,tp)),flash:.1+.6*sm(TH,TH+.4,tp),net:netBrush(tau-TH-.45)},()=>{
   const w=drawWorld(s,c,tau,tp,{ballMin:22,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const sk=solve(w.cas.pose,CB,w.cas.place);
   // "Robben shoots low": sparks off his left boot at contact, speed lines as the ball skims low
   if(tp>=TS&&tp<TS+.2){const rs=solve(w.rob.pose,RB,w.rob.place),p=P(c,rs.lToe);sparkBurst(s,Y,p[0],p[1],60+60*sm(TS,TS+.08,tp,easeOut),{n:8,seed:5,g:1-sm(TS+.08,TS+.2,tp),width:9});}
   if(tp>=TS&&tp<TH+.5&&depthOf(c,w.ball)>NEAR+.8){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:7,len:140,width:6,cov:.85});}
   // "past his hands": rings on both gloves and a dashed gap line from the nearer glove down to the ball — out of reach
   const ph=sm(q.ph,q.ph+.3,tt,easeOutBack)*(1-sm(q.so+.2,q.so+.6,tt));if(ph>.02){const p=new Path2D(),add1=(j:V3)=>{if(depthOf(c,j)<NEAR+.3)return;const pp=P(c,j),k=kAt(c,j),r=.16*k*ph,pts:Pt[]=Array.from({length:20},(_,i)=>[pp[0]+Math.cos(i/20*TAU)*r,pp[1]+Math.sin(i/20*TAU)*r] as Pt);p.addPath(ribbon(pts,Math.max(4,.025*k),{close:true,taper:0,wobble:.6}));};add1(sk.lHa);add1(sk.rHa);
    const hand=sk.rHa,a=P(c,hand),b=P(c,w.ball),gaps:[number,number][]=[];for(let x=.08;x<1;x+=.16)gaps.push([x,x+.07]);if(depthOf(c,hand)>NEAR+.3)p.addPath(ribbon([a,[lerp(a[0],b[0],ph),lerp(a[1],b[1],ph)]],Math.max(4,.02*kAt(c,hand)),{taper:0,wobble:.5,gaps}));yInk(s,p,.95);}
   // "right foot": a ring round his right boot as it sweeps out to the ball
   const rf=sm(q.so,q.so+.3,tt,easeOutBack)*(1-sm(q.wd,q.wd+.4,tt));if(rf>.02&&depthOf(c,sk.rToe)>NEAR+.3){const p=P(c,sk.rToe),k=kAt(c,sk.rToe);yRing(s,p[0],p[1],(.26+.06*sm(q.rf,q.rf+.3,tt))*k*rf,Math.max(5,.035*k));}
   // "His toe": sparks where the toe meets the ball
   if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],90+90*sm(TH,TH+.08,tp,easeOut),{n:10,seed:6,g:1-sm(TH+.08,TH+.25,tp),width:11});}
   // "wide": a dotted yellow arrow along the deflection, outside the post
   const wd=sm(q.wd-.05,q.wd+.4,tt,easeOut)*(1-sm(q.end-.9,q.end-.5,tt));if(wd>.02){const dots=new Path2D();let last:Pt|null=null,prev:Pt|null=null;for(let i=0;i<=16;i++){const tb=TH+.05+i/16*.55*wd,p=ballAt(tb);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p),r=Math.max(4,.05*kAt(c,p));dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);prev=last;last=pp;}
    if(last&&prev){const dx=last[0]-prev[0],dy=last[1]-prev[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=24;dots.addPath(polyPath([[last[0]+ux*z*1.4,last[1]+uy*z*1.4],[last[0]-uy*z,last[1]+ux*z],[last[0]+uy*z,last[1]-ux*z]],true));}yInk(s,dots,.95);}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),rp=robbenAt(tau).place,g:V3=[rp.x??0,1.1,rp.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): one on one — stay on your feet, make yourself big, save it with any part of your body =================
const ch4q=()=>({oo:T(3,'One on one'),sf:T(3,'stay on your feet'),al:T(3,'as long as you can'),mb:T(3,'make yourself big'),ap:T(3,'any part of your body'),end:SEC(3)});
/** lesson clock: Robben closes in on "One on one", Casillas holds his ground to "make yourself big", the toe save lands on "any part" */
const tau4=(t:number)=>{const q=ch4q(),apT=Math.max(q.ap+.35,q.mb+1);return key(t,mono([[0,TS-3],[q.sf,TS-1.8],[q.mb+.2,TS-.35],[apT,TH],[apT+1.2,TH+.9],[q.end,TH+.9+(q.end-apT-1.2)*.3]]),x=>x);};
const CAS4=duo(CASILLAS,true),ROB4=duo(ROBBEN);
function LCAM(t:number){const q=ch4q(),v=key(t,mono([[0,-6,1.3,-3.2,2400],[q.sf,-5.4,1.1,-3.6,2900],[q.mb,-4.8,1.05,-3.8,2700],[q.ap,-4.6,1,-4,3000],[q.end,-5.2,1.1,-4.2,2800]]),easeInOutSine,true);
 return cam([C_AT[0]+v[0],v[1],C_AT[1]+v[2]],[C_AT[0]-1.4,.85,C_AT[1]-.5],v[3]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt),k0=kAt(c,[C_AT[0],1,C_AT[1]]);frame(s);
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[C_AT[0]-40,0,C_AT[1]-40],[C_AT[0]+40,0,C_AT[1]-40],[C_AT[0]+40,0,C_AT[1]+40],[C_AT[0]-40,0,C_AT[1]+40]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,C_AT[0],C_AT[1],r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5),.2);s.tone(Y,pool(2.8),.2);s.tone(Y,pool(1.4),.32);
  const h=casillasAt(tp),hp=casillasAt(tp-1/12),r=robbenAt(tp),rpv=robbenAt(tp-1/12),bpos=ballAt(tau);
  // "One on one": a ring round each of them and a dashed line between — just the two of them
  const oo=sm(q.oo,q.oo+.35,tt,easeOutBack)*(1-sm(q.sf+.3,q.sf+.8,tt));if(oo>.02){const p=new Path2D();gRing(p,c,C_AT[0],C_AT[1],.8*oo,.05);gRing(p,c,r.place.x??0,r.place.z??0,.8*oo,.05);
   const a=P(c,[C_AT[0],.02,C_AT[1]]),b=P(c,[r.place.x??0,.02,r.place.z??0]),gaps:[number,number][]=[];for(let x=.1;x<.9;x+=.12)gaps.push([x,x+.05]);p.addPath(ribbon([a,[lerp(a[0],b[0],oo),lerp(a[1],b[1],oo)]],Math.max(5,.03*k0),{taper:0,wobble:.6,gaps}));yInk(s,p,.95);}
  const items:Item[]=[
   {depth:depthOf(c,[r.place.x??0,0,r.place.z??0]),draw:()=>{if(depthOf(c,[r.place.x??0,0,r.place.z??0])>1.2)drawPlayer(s,r.pose,c,ROB4,r.place,{prev:rpv});}},
   {depth:depthOf(c,[C_AT[0],0,C_AT[1]]),draw:()=>{drawPlayer(s,h.pose,c,CAS4,h.place,{prev:hp,smear:true});}},
   {depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),rr=Math.max(20,BALL_R*kAt(c,bpos));goldBall(s,bp[0],bp[1],rr,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(rr*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}},
  ];
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  const sk=solve(h.pose,CB,h.place),kc=kAt(c,sk.chest);
  // "stay on your feet": rings under both boots; "as long as you can": a yellow timer arc filling round him until Robben shoots
  const sf=sm(q.sf,q.sf+.35,tt,easeOutBack)*(1-sm(q.mb+.2,q.mb+.6,tt));if(sf>.02){const p=new Path2D();gRing(p,c,sk.lAn[0],sk.lAn[2],.3*sf,.05);gRing(p,c,sk.rAn[0],sk.rAn[2],.3*sf,.05);yInk(s,p,.95);}
  const al=sm(q.al,q.al+.3,tt,easeOut)*(1-sm(q.ap-.1,q.ap+.3,tt));if(al>.02){const fill=clamp((tp-(TS-2.2))/2.1),cc=P(c,[C_AT[0],1.1,C_AT[1]]),R0=1.25*kc,pts:Pt[]=[];for(let i=0;i<=30;i++){const a=-Math.PI/2+fill*TAU*i/30;pts.push([cc[0]+Math.cos(a)*R0,cc[1]+Math.sin(a)*R0*.95]);}
   const ring=polyPath(Array.from({length:36},(_,i)=>[cc[0]+Math.cos(i/36*TAU)*R0,cc[1]+Math.sin(i/36*TAU)*R0*.95] as Pt),true);s.stroke(Y,ring,Math.max(3,.012*kc),.5*al);if(fill>.01)yInk(s,ribbon(pts,Math.max(6,.04*kc),{taper:0,wobble:.5}),.95*al);}
  // "make yourself big": the dashed outline through hands and feet
  const mb=sm(q.mb,q.mb+.4,tt,easeOutBack)*(1-sm(q.ap,q.ap+.4,tt));if(mb>.02){const cc=P(c,sk.chest),pts=[sk.lHa,sk.head,sk.rHa,sk.rToe,sk.lToe].map(j=>{const p=P(c,j);return[lerp(cc[0],p[0],.6+.55*mb),lerp(cc[1],p[1],.6+.55*mb)] as Pt;}),gaps:[number,number][]=[];for(let x=.03;x<1;x+=.08)gaps.push([x,x+.035]);
   yInk(s,ribbon(pts,Math.max(6,.035*kc),{close:true,taper:0,wobble:.6,gaps}),.95);}
  // "any part of your body": yellow dots pop at the hands, chest, knees, and — biggest — the toe that made the save
  const ap=sm(q.ap,q.end-.6,tt);if(tt>q.ap){const dots=new Path2D(),J:V3[]=[sk.lHa,sk.rHa,sk.chest,sk.lKn,sk.rKn,sk.head,sk.rToe];J.forEach((j,i)=>{const u=clamp(ap*J.length*1.1-i);if(u<=0||depthOf(c,j)<NEAR+.3)return;const p=P(c,j),rr=(i===J.length-1?.13:.08)*kAt(c,j)*easeOutBack(u);dots.moveTo(p[0]+rr,p[1]);dots.arc(p[0],p[1],rr,0,TAU);});yInk(s,dots,.95);s.stroke(K,dots,Math.max(3,.008*kc));}
  if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(TH+.08,TH+.25,tp),width:11});}
 },
 still:6,
};

const story:RisoStory={
 id:'casillas-robben-2010',format:'11v11',title:"Casillas's toe save",
 theme:'One on one, stay on your feet as long as you can, make yourself big, and save it with any part of your body.',
 ageNote:'World Cup final, Netherlands 0–1 Spain (after extra time), Soccer City, Johannesburg, 11 July 2010. At 0–0 in the 62nd minute, Casillas turned Robben\'s shot wide with the toe of his right boot.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',green:'#00a95c',navy:'#22366b'},order:['yellow','orange','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the gold ball rolls in and glances off a boot tip, spinning away wide, with a yellow ring. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.8),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*28*g] as Pt;}),true),12,.95);
  const bx=u<.4?x-side*(1-u/.4)*140:x+side*(u-.4)/.6*170,by=u<.4?y:y-(u-.4)/.6*120;
  if(age>.3&&age<.56)sparkBurst(s,Y,x,y,100,{n:8,seed,g:1-clamp((age-.3)/.26),width:10});
  goldBall(s,bx,by-12,48,age*12+hash(seed,3)*TAU,{sq:age>.3&&age<.45?.2:0,dir:0});
 },
};
export default story;
