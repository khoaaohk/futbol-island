/** Iconic play film: Marta's flick and spin, Brazil 4–0 United States, FIFA Women's World Cup semi-final, Hangzhou, China,
 * 27 September 2007 (79th minute, Marta's second goal, the fourth of the game). A RisoStory (chapters mode) played unchanged by the card
 * window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/marta-spin-2007/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/marta-spin-2007/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/marta-spin-2007/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 through web-search result summaries only: page fetches were refused in this session, the search budget ran out
 * before the kits could be checked, and the footage was not watched):
 *  - FIFA, "Watch: Every Marta goal at the FIFA Women's World Cup" https://www.fifa.com/en/articles/every-marta-goal-womens-world-cup
 *  - Inside FIFA, "Marta provides a masterclass" (China 2007 news) https://inside.fifa.com/tournaments/womens/womensworldcup/china2007/news/marta-provides-a-masterclass-2860869
 *  - ESPN match page, "USA 0-4 Brazil (Sep 27, 2007)" https://www.espn.com/soccer/match/_/gameId/229736/brazil-united-states
 *  - The18, "That Time Marta Obliterated The USWNT In The 2007 World Cup" https://the18.com/en/soccer-entertainment/uswnt-vs-brazil-2007-world-cup
 *  - Wikipedia, "2007 FIFA Women's World Cup" and "2007 FIFA Women's World Cup knockout stage"
 *    https://en.wikipedia.org/wiki/2007_FIFA_Women%27s_World_Cup_knockout_stage
 *  - Olympics.com, "Marta Da Silva" biography https://www.olympics.com/en/athletes/marta ; CNN (2023) and ESPN (2024) Marta profiles;
 *    Forbes (2024), FIFA names its best women's goal award after Marta
 *  - NPR, "U.S. Women Lose To Brazil In World Cup Semis" (27 Sept 2007) https://www.npr.org/2007/09/27/14778878/u-s-women-lose-to-brazil-in-world-cup-semis
 * CONFIRMED by those accounts: 27 September 2007, Hangzhou, World Cup semi-final, Brazil 4–0 United States; the goals were a Leslie Osborne
 *  own goal, Marta, Cristiane, Marta, so this 79th-minute goal made it 4–0; the US had ten players (Shannon Boxx sent off for a second
 *  yellow card just before half-time); Briana Scurry was in the US goal; Marta was 21 and wore 10. The goal: WITH HER BACK TO GOAL about
 *  five yards from the corner of the 18-yard box, on the LEFT, she controlled a BOUNCING pass with one touch of her RIGHT foot, then
 *  instantly FLICKED it with her LEFT foot past the defender Tina Ellertson and went round her; she cut in from the left, left another
 *  defender behind with a swerve of the hips and finished with a RIGHT-footed shot past Scurry. It was voted the goal of the tournament.
 *  Brazil wore yellow.
 * NOT VERIFIED (memory, searches exhausted): the United States' kit that night — drawn as their white first kit (white shirts, shorts and
 *  socks, navy trim); the evening kick-off under floodlights; the stadium being the Yellow Dragon Sports Centre with a running track round
 *  the pitch; all match officials being women.
 * INFERRED / ILLUSTRATIVE: every position, distance and run in metres (the turn is set 4–5 m outside the left corner of the box); who
 *  played the pass (an unnamed Brazil team-mate, drawn as a lofted ball that bounces once); which side the ball went (drawn: round the
 *  defender's inside, goal-side of her left shoulder) and which way Marta spun (drawn: over her right shoulder, round the defender's other
 *  side, so ball and player meet again behind her); the second defender (unnamed) and the direction of the hip swerve (a feint outside,
 *  then in); the shot's corner (drawn: low, inside the far post); Scurry's dive; every other player and all numbers except Marta's 10
 *  (Cristiane drawn as 11); hair styles and builds; Brazil's blue shorts and white socks; Scurry's red keeper kit; the referee's black kit;
 *  the ball design; the stadium's look (an oval bowl behind a red running track, a roof ring with floodlights, a mostly Chinese crowd with
 *  red, yellow and navy colours); every camera position and lens, and the slow-motion speed of the replay.
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 Marta's right-foot first touch):
 *  ch1 = LIVE, the high main-stand camera in real time (the teams, Marta back to goal, the defender tight behind, the bouncing pass, the
 *        flick and spin, the swerve, the shot, the net, four nil);
 *  ch2 = the TV slow-motion REPLAY from a low camera behind Marta (the ball flicked round one side of Ellertson, Marta spinning round the
 *        other, the collect, the second defender, the finish past Scurry);
 *  ch3 = the lesson, a duotone (yellow + navy) print: a defender tight behind you → a clever touch → flick the ball one way, run the other.
 * Seams are forward passages into the ball. Ball contact points are read from the solved skeleton (right toe for the control and the shot,
 * left toe for the flick), so boot and ball always meet. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). All the
 * players are women: slimmer builds (bulk ≈ .86–.92), heights 1.60–1.75 m, ponytails / long hair. World: right-handed metres like athlete.ts
 * (no projector wrap needed): the US goal line x = 0 (net toward +x), the pitch runs to x = −105, Brazil attack +x, their left is −z; the
 * TV camera sits high in the stand on the −z side.
 * Inks: yellow (Brazil, grass with blue, floodlights), red (skin, running track, keeper), blue (Brazil shorts, grass, night sky), navy
 * (key line, US trim). Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe. Scenes read only their local t;
 * drawn objects pose on twos, cameras on ones; all randomness is seeded. Phone heat: ≈4 plates, stands and crowd batched per ink, small
 * figures print at 'low' detail in wide shots and every figure is capped during passages; budget ≈ 150–270 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,dribble,stand,strike,backpedal,lunge,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
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
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`marta film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py marta-spin-2007 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/marta-spin-2007/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Hangzhou',"Hangzhou, China, 2007, a World Cup semi-final. Brazil, in yellow, play the United States. Marta, number ten, has her back to goal. A defender is tight behind her. Here comes the ball. Watch her feet... she scores! Four nil!",
  ['Hangzhou','World Cup','Brazil','United States','Marta','back to goal','A defender','Here comes the ball','Watch her feet','scores','Four nil']),
 prov('Flick and spin','Watch again, slowly. Marta flicks the ball round one side of the defender, and spins round the other. Then she beats one more, and slots it past the keeper.',
  ['Watch again','slowly','Marta flicks','one side','spins round','the other','beats one more','slots it','past the keeper']),
 prov('One way, the other','When a defender is tight behind you, use a clever touch. Flick the ball one way, and run the other!',
  ['When a defender','tight behind you','a clever touch','Flick the ball','one way','run the other']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`marta film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
/** a projected ground path (metres → sheet), dropping points behind the camera */
function groundPath(c:Camera,pts:[number,number][],y=.03):Pt[]{const o:Pt[]=[];for(const[x,z] of pts){const p:V3=[x,y,z];if(depthOf(c,p)>NEAR)o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** an arrow head at the end of a projected lane */
function arrowHead(pts:Pt[],w:number):Path2D|null{if(pts.length<2)return null;const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);
 return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.8,e[1]+Math.sin(a+2.4)*w*1.8],[e[0]+Math.cos(a-2.4)*w*1.8,e[1]+Math.sin(a-2.4)*w*1.8]],true);}

// ================= Hangzhou: an oval bowl behind a red running track, a roof ring with floodlights, a night match =================
const CXS=-52.5,SL=42.2;// the track's straights run x = CXS ± SL; the curves are centred on their ends
/** a point on the stadium outline (a discorectangle round the pitch): a ∈ [0,1) = near straight (−z, under the TV camera), the curve
 * behind the goal (+x), the far straight, the far curve. r = distance from the straight's line / the curve centre. */
function oval(a:number,r:number,y:number):V3{a=((a%1)+1)%1;
 if(a<.25){const u=a/.25;return[CXS-SL+2*SL*u,y,-r];}
 if(a<.5){const th=-Math.PI/2+(a-.25)/.25*Math.PI;return[CXS+SL+Math.cos(th)*r,y,Math.sin(th)*r];}
 if(a<.75){const u=(a-.5)/.25;return[CXS+SL-2*SL*u,y,r];}
 const th=Math.PI/2+(a-.75)/.25*Math.PI;return[CXS-SL+Math.cos(th)*r,y,Math.sin(th)*r];}
const ovalRing=(r:number,y:number,n=64):V3[]=>Array.from({length:n},(_,i)=>oval(i/n,r,y));
/** the bowl surface: v = 0 front row (behind the track) … 1 the back of the upper tier */
const bowl=(a:number,v:number):V3=>oval(a,lerp(49,90,v),lerp(1.4,31,v)+2.2*Math.sin(v*Math.PI));
const NSEG=56;
/** crowd: [a, v, ink 0 paper faces / 1 red / 2 navy / 3 yellow (Brazil fans), phase] */
const CROWD=(()=>{const r=rng(2007),out:[number,number,number,number][]=[];for(let i=0;i<2300;i++){const c=r(),v=.03+r()*.93;if(Math.abs(v-.5)<.035)continue;out.push([r(),v,c<.46?0:c<.74?1:c<.9?2:3,r()*TAU]);}return out;})();
const CROWD_P:V3[]=CROWD.map(([a,v])=>bowl(a,v));
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night: a navy sky over a floodlit blue haze near the roof line (no clouds: a printed gradient)
 s.field(K,.52,.5);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 [.14,.24,.36].forEach((d,i)=>s.tone(B,polyPath([[-Bnd,hz+200-i*170],[Bnd,hz+200-i*170],[Bnd,hz-150-i*170],[-Bnd,hz-150-i*170]],true),d));
 // the bowl: knocked out, a navy screen, stepped rows; the tier fascia; the roof ring with its floodlights
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D(),roof=new Path2D(),lamps=new Path2D();
 for(let i=0;i<NSEG;i++){const a0=i/NSEG,a1=(i+1)/NSEG;addPoly(stands,clipPoly(c,[bowl(a0,0),bowl(a1,0),bowl(a1,1),bowl(a0,1)]));
  for(let k=0;k<16;k+=2)addPoly(rows,clipPoly(c,[bowl(a0,k/16),bowl(a1,k/16),bowl(a1,(k+1)/16),bowl(a0,(k+1)/16)]));
  addPoly(fascia,clipPoly(c,[bowl(a0,.47),bowl(a1,.47),bowl(a1,.53),bowl(a0,.53)]));
  addPoly(roof,clipPoly(c,[oval(a0,80,36),oval(a1,80,36),oval(a1,96,38),oval(a0,96,38)]));
  for(let k=0;k<2;k++){const u=a0+(k+.5)/(NSEG*2),p=oval(u,80.5,35.2);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),5,24);lamps.rect(x-sz,y-sz*.45,sz*2,sz*.9);}}
 s.knockout(stands);s.tone(K,stands,.5);s.tone(B,rows,.2);s.tone(K,rows,.18);
 // crowd heads: faces, China red, navy, Brazil yellow — bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 CROWD.forEach(([,,col,ph],i)=>{const bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,b0=CROWD_P[i],p:V3=[b0[0],b0[1]+.35+bob,b0[2]];if(depthOf(c,p)<2)return;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;});
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(K,heads[2],.9);if(seen[3])s.fill(Y,heads[3],.95);
 // camera flashes when the goal goes in (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(28*flash);i++){const p=bowl(r(),.06+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,fascia,.85);s.fill(K,roof,.92);s.knockout(lamps);s.fill(Y,lamps,.55);
 // the running track (red, paper lane lines) round the infield
 const track=new Path2D();addPoly(track,clipPoly(c,ovalRing(47.5,0)));s.knockout(track);s.fill(R,track,.62);s.tone(K,track,.12);
 const lanes=new Path2D();for(const r of[38.4,40.8,43.2,45.6]){const q=ovalRing(r,0,72);for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];groundLine(lanes,c,[a[0],a[2]],[b[0],b[2]],.07);}}
 s.knockout(lanes,.75);
 // boards along the touchlines and behind the goal (paper and yellow panels)
 const boardsY=new Path2D(),boardsP=new Path2D();
 for(const z of[-35.6,35.6])for(let x=-104;x<0;x+=8){const q:V3[]=[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]];addPoly((Math.round(x/8)&1)?boardsY:boardsP,clipPoly(c,q));}
 for(let z=-24;z<24;z+=8){const q:V3[]=[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]];addPoly((Math.round(z/8)&1)?boardsY:boardsP,clipPoly(c,q));}
 s.knockout(boardsY);s.knockout(boardsP);s.fill(Y,boardsY,.9);s.tone(K,boardsP,.1);
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,ovalRing(37.2,0)));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net);
}
/** the goal at x = 0: posts, bar, a box net held by stanchions; `net` displaces the mesh for the ripple */
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (design illustrative): paper, navy panels, a yellow accent, a blue shade =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.58,cy=Math.sin(a)*r*.58*Math.cos(spin*.6);const tri:Pt[]=[];for(let j=0;j<3;j++){const b=a+j*TAU/3+.3;tri.push([cx+Math.cos(b)*r*.3,cy+Math.sin(b)*r*.3]);}pan.addPath(polyPath(tri,true));}
 const aa=spin*.8;acc.addPath(ribbon([[Math.cos(aa)*r*.1,Math.sin(aa)*r*.1],[Math.cos(aa+.9)*r*.45,Math.sin(aa+.9)*r*.45],[Math.cos(aa+1.8)*r*.2,Math.sin(aa+1.8)*r*.2]],Math.max(2,r*.16),{taper:.6,wobble:0}));
 s.fill(K,pan,.95);if(!duo)s.fill(Y,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (2007) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** women footballers: slimmer athletic builds, ponytails / long hair */
const WOMAN=(h:number,bulk=.88):Build=>({height:h,bulk,thighs:1.02,head:1.03});
const BRA=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:Y,shorts:B,socks:'paper',trim:B,boots:K,skin:SKIN_M,hair:K,hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:B,build:WOMAN(1.66),seed:40+(n??3),...o});
const USA=(o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:'paper',socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'short',build:WOMAN(1.68,.9),seed:60,...o});
const MARTA:Kit=BRA(10,{skin:SKIN_M,hair:[K,.95],hairStyle:'ponytail',build:WOMAN(1.62,.86),seed:10});
const ELLERTSON:Kit=USA({skin:SKIN_D,hair:[K,.95],hairStyle:'ponytail',build:WOMAN(1.68,.92),seed:61});
const DEF2:Kit=USA({hair:[K,.55],hairStyle:'ponytail',build:WOMAN(1.7,.9),seed:62});
const SCURRY:Kit={shirt:[R,.85],shorts:[K,.85],socks:[R,.85],boots:K,skin:SKIN_D,hair:[K,.95],hairStyle:'short',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],build:WOMAN(1.73,.92),seed:1};
const REF:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'ponytail',line:K,sleeves:'short',build:WOMAN(1.66,.88),seed:33};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[Y,.95]:[K,.35],shorts:lead?[K,.5]:'paper',socks:'paper',trim:lead?K:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:[K,.6],shade:[K,.2],numberInk:lead?K:K});
/** a halftone echo print of a pose (chronophotograph stamps in the lesson) */
const ECHO:Kit={shirt:[Y,.45],shorts:[Y,.3],socks:[Y,.3],boots:[K,.6],skin:[[Y,.3]],hair:[K,.5],hairStyle:'ponytail',line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',build:MARTA.build,seed:99};

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Marta's right-foot first touch) =================
const G=9.81;
const MB:Build=MARTA.build!;
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** idle: a standing body that breathes and looks around (never a frozen hold) */
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/7.5),run=runCycle(q.dist/(2+2.2*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
/** the active segment at τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:Seg[],tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=segs[a][1](tau),Bq=segs[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}

// ---- the geometry of the move (positions inferred; see the header) ----
const PASS_BALL:V3=[-33.5,.11,-20.8];// the bouncing pass comes from a team-mate behind her
const MP:[number,number]=[-20.6,-17.8];// Marta, back to goal, 4–5 m outside the left corner of the box
const YM=YAW(PASS_BALL[0]-MP[0],PASS_BALL[2]-MP[1]);// facing the pass (away from goal)
const[mfx,mfz]=dirOf(YM),LEFT:[number,number]=[mfz,-mfx],RIGHT:[number,number]=[-mfz,mfx];// her left / right on the ground
const E0:[number,number]=[MP[0]-mfx*.78,MP[1]-mfz*.78];// Tina Ellertson, tight behind her (goal-side)
const COL:V3=[E0[0]-mfx*2.4+LEFT[0]*.3,.11,E0[1]-mfz*2.4+LEFT[1]*.3];// where ball and Marta meet again, behind the defender
const FLICK_VIA:[number,number]=[E0[0]+LEFT[0]*1.35-mfx*.15,E0[1]+LEFT[1]*1.35-mfz*.15];// the ball goes round the defender's left side
const TS=3.35;// the shot (right foot)
const SB:V3=[-11.8,.11,-10.6];// where the shot is struck (inside the box, left of centre)
const TARGET:V3=[0,.34,2.35];// low, inside the far post
const YS=YAW(TARGET[0]-SB[0],TARGET[2]-SB[2]);
const SHOT_SK=solve(strike(STRIKE_CONTACT),MB,{yaw:YS});
const GP:[number,number]=[SB[0]-SHOT_SK.rToe[0],SB[2]-SHOT_SK.rToe[2]];
const DRIB:MKey[]=[[1.45,0,0],[2.25,-15.7,-15.0],[2.62,-15.05,-15.35],[3.0,-13.75,-12.9],[TS,GP[0],GP[1]]];// [0] filled below
const YD=YAW(DRIB[1][1]-COL[0],DRIB[1][2]-COL[2]);
const P_COL:[number,number]=[COL[0]-dirOf(YD)[0]*.5,COL[2]-dirOf(YD)[1]*.5];DRIB[0]=[1.45,P_COL[0],P_COL[1]];
const SPIN:MKey[]=[[.6,MP[0],MP[1]],[.95,MP[0]+RIGHT[0]*.95+(-mfx)*.25,MP[1]+RIGHT[1]*.95+(-mfz)*.25],[1.2,E0[0]+RIGHT[0]*1.2-mfx*.9,E0[1]+RIGHT[1]*1.2-mfz*.9],[1.45,P_COL[0],P_COL[1]]];
/** the spin: body yaw from facing the pass round over her RIGHT shoulder to the dribble line (unwrapped so it never takes the short way) */
const YEND=(()=>{let y=YD;while(y>YM)y-=TAU;return y;})();
const spinPlace=(t:number):Place=>{if(t<.6)return{x:MP[0],z:MP[1],yaw:YM};const q=pathPos(SPIN,t);return{x:q.x,z:q.z,yaw:lerp(YM,YEND,sm(.6,1.45,t,easeInOutSine))};};

// ---- Marta: drift in → hold, back to goal → right-foot control → left-foot flick → spin → collect → dribble, swerve → right-foot shot → celebrate ----
const HOLD=posed({lHipF:26,rHipF:22,lKnee:38,rKnee:34,lean:14,pitch:3,lShA:46,rShA:42,lShF:-24,rShF:-10,lElb:40,rElb:44,neckP:12,neckY:-8});
const CU=.5;// control contact (τ = 0) inside CTRL's [−.4, .4]
const CTRL_KEYS:[number,Pose][]=[
 [0,HOLD],
 [.3,posed({lHipF:24,lKnee:36,rHipF:30,rKnee:50,rAnk:0,lean:10,lShA:52,rShA:42,lShF:-24,lElb:40,rElb:40,neckP:36})],
 [CU,posed({lHipF:22,lKnee:40,rHipF:50,rKnee:64,rAnk:-12,rHipR:10,lean:8,lShA:58,rShA:48,lShF:-20,lElb:36,rElb:36,neckP:42,squash:-.03})],
 [.75,posed({lHipF:22,lKnee:38,rHipF:24,rKnee:42,rAnk:-4,lean:11,lShA:52,rShA:46,lShF:-22,lElb:38,rElb:38,neckP:40})],
 [1,posed({lHipF:22,lKnee:40,rHipF:14,rKnee:36,lean:12,lShA:50,rShA:44,lShF:-18,lElb:40,rElb:40,neckP:36,bend:4})],
];
const FU=.42;// flick contact inside FLICK's [.3, .9] → τ ≈ .552
const TF=.3+FU*.6;
const FLICK_KEYS:[number,Pose][]=[
 [0,CTRL_KEYS[4][1]],
 [.25,posed({rHipF:16,rKnee:38,lHipF:-6,lKnee:54,lAnk:30,lHipA:-16,lHipR:10,lean:10,twist:8,lShA:60,rShA:50,lShF:-20,lElb:36,rElb:36,neckP:38,neckY:10})],
 [FU,posed({rHipF:18,rKnee:40,lHipF:10,lKnee:28,lAnk:38,lHipA:32,lHipR:-24,lean:8,twist:-14,bend:6,lShA:68,rShA:56,lShF:-10,lElb:34,rElb:34,neckP:30,neckY:26,squash:.03})],
 [.7,posed({rHipF:22,rKnee:44,lHipF:4,lKnee:36,lAnk:20,lHipA:14,lean:10,twist:-20,bend:10,roll:6,lShA:64,rShA:48,lElb:40,rElb:44,neckP:18,neckY:30})],
 [1,posed({rHipF:-10,rKnee:46,rAnk:30,lHipF:34,lKnee:56,lean:14,twist:-18,roll:10,lShA:52,rShA:40,lShF:30,rShF:-24,lElb:70,rElb:70,neckP:12,neckY:26})],
];
const REC_SK=solve(keyPoses(CU,CTRL_KEYS),MB,{x:MP[0],z:MP[1],yaw:YM});
const REC:V3=[REC_SK.rToe[0],REC_SK.rToe[1]+.1,REC_SK.rToe[2]];// the bouncing pass meets the top of her right boot
const FLK_SK=solve(keyPoses(FU,FLICK_KEYS),MB,{x:MP[0],z:MP[1],yaw:YM});
const FLK:V3=[FLK_SK.lToe[0],.11,FLK_SK.lToe[2]];// the left boot meets the ball for the flick
/** the spin run: a run cycle leaning into the right turn, arms out, head over her LEFT shoulder looking for the ball */
function spinPose(t:number):Pose{const q=pathPos(SPIN,Math.max(.6,t)),p=runCycle(q.dist/2.3+.2,{speed:.55,armOut:16}),w=sm(.8,1.05,t)*(1-sm(1.3,1.5,t));p.roll+=14*D2R*w;p.bend+=8*D2R*w;p.neckY=lerp(p.neckY,32*D2R,w);return p;}
/** dribble along DRIB: short quick touches with the left foot; the hip swerve (a feint outside, then in) past the second defender */
const dribPh=(t:number)=>pathPos(DRIB,t).dist/1.55+.2;
function dribYaw(t:number){let vx=0,vz=0;for(const d of[-.12,0,.12]){const q=pathPos(DRIB,clamp(t+d,1.46,TS-.01));vx+=q.vx;vz+=q.vz;}return Math.hypot(vx,vz)>.1?YAW(vx,vz):YD;}
function dribPose(t:number):Pose{const p=dribble(dribPh(t),{foot:'l',speed:.65}),f=Math.sin(Math.PI*clamp((t-2.3)/.45)),cut=Math.sin(Math.PI*clamp((t-2.7)/.4));
 p.roll+=(-16*f+14*cut)*D2R;p.bend+=(-12*f+10*cut)*D2R;p.twist+=(10*f-8*cut)*D2R;p.lShA+=14*f*D2R;p.rShA+=14*cut*D2R;return p;}
const CELEB:MKey[]=[[TS+.6,GP[0],GP[1]],[TS+1.6,GP[0]+1.6,GP[1]-3.4],[TS+2.3,GP[0]+2.2,GP[1]-5]];
const MARTA_SEGS:Seg[]=[
 [-99,t=>{const r=runner([[-14,-23.4,-15.2],[-9.5,-21.6,-17.2],[-6,MP[0]-.3,MP[1]+.2],[-2.2,MP[0],MP[1]]],t,PASS_BALL,2,HOLD);if(t>-1.9)r.place.yaw=lerpAng(r.place.yaw??0,YM,sm(-1.9,-1.3,t));return r;}],
 [-.4,t=>({pose:keyPoses(clamp((t+.4)/.8),CTRL_KEYS),place:{x:MP[0],z:MP[1],yaw:YM}})],
 [.3,t=>({pose:keyPoses(clamp((t-.3)/.6),FLICK_KEYS),place:spinPlace(t)})],
 [.9,t=>({pose:spinPose(t),place:spinPlace(t)})],
 [1.45,t=>{const q=pathPos(DRIB,t);return{pose:dribPose(t),place:{x:q.x,z:q.z,yaw:dribYaw(t)}};}],
 [TS-.5,t=>{const q=pathPos(DRIB,t);return{pose:strike(clamp(STRIKE_CONTACT+(t-TS)/1.0)),place:{x:q.x,z:q.z,yaw:lerpAng(dribYaw(TS-.5),YS,sm(TS-.5,TS-.2,t))}};}],
 [TS+.6,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
 [TS+2.3,t=>{const e=CELEB[CELEB.length-1];return{pose:celebrate(Math.max(0,t-TS-2.3)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(-1,-.4)}};}],
];
const martaAt=(tau:number)=>segAt(MARTA_SEGS,tau);

// ---- the ball: placed → lofted pass, one bounce → a hop onto her right boot → cushioned down → flicked round the defender → dribbled → shot ----
const T_PASS=-1.25,BNC:V3=[MP[0]-mfx*3.4+.1,.11,MP[1]-mfz*3.4];const T_BNC=-.4;
const HOP_VY=(REC[1]-.11+.5*G*T_BNC*T_BNC)/(-T_BNC);
const SHT=.72,T_GOAL=TS+SHT;
/** dribble lead: the ball runs ahead after each left-foot touch and the foot catches it at the next */
const lead=(t:number)=>{const w=((dribPh(t)-.97)%1+1)%1;return .34+.5*Math.sin(Math.PI*w);};
function ballAt(tau:number):V3{
 if(tau<T_PASS)return PASS_BALL;
 if(tau<T_BNC){const s=tau-T_PASS,d=T_BNC-T_PASS,u=s/d,vy=.5*G*d;return[lerp(PASS_BALL[0],BNC[0],u),.11+vy*s-.5*G*s*s,lerp(PASS_BALL[2],BNC[2],u)];}
 if(tau<0){const s=tau-T_BNC,u=s/(-T_BNC);return[lerp(BNC[0],REC[0],u),.11+HOP_VY*s-.5*G*s*s,lerp(BNC[2],REC[2],u)];}
 if(tau<TF){const u=tau/TF,d=clamp(u/.55);return[lerp(REC[0],FLK[0],easeOut(u)),.11+(REC[1]-.11)*(1-d)*(1-d)+.05*Math.sin(Math.PI*clamp((u-.55)/.45)),lerp(REC[2],FLK[2],easeOut(u))];}
 if(tau<1.45){const u=(tau-TF)/(1.45-TF),e=u*(1.3-.3*u),a=(1-e)*(1-e),b=2*(1-e)*e,c2=e*e;
  return[a*FLK[0]+b*FLICK_VIA[0]+c2*COL[0],.11+.3*Math.sin(Math.PI*u),a*FLK[2]+b*FLICK_VIA[1]+c2*COL[2]];}
 if(tau<TS){const m=martaAt(tau).place,[dx,dz]=dirOf(m.yaw??0),L=lead(tau),f:V3=[(m.x??0)+dx*L,.11,(m.z??0)+dz*L];
  const drift:V3=[COL[0]+dirOf(YD)[0]*(tau-1.45)*2.2,.11,COL[2]+dirOf(YD)[1]*(tau-1.45)*2.2];
  return mix3(mix3(drift,f,sm(1.45,1.75,tau)),SB,sm(TS-.32,TS,tau));}
 const s=tau-TS;if(s<SHT){const u=s/SHT;return[lerp(SB[0],TARGET[0],u),lerp(SB[1],TARGET[1],u)+.35*4*u*(1-u),lerp(SB[2],TARGET[2],u)];}
 const e=s-SHT,u=clamp(e/.14);if(u<1)return mix3(TARGET,[1.8,.5,2.7],easeOut(u));
 const d=clamp((e-.14)/.5);return[1.8-.3*d,.11+.39*(1-d)*(1-d)+(d>=1?.06*Math.abs(Math.sin((e-.64)*8))*Math.exp(-(e-.64)*3):0),2.7-.2*d];}
const NET_HIT:V3=[2,.5,2.7];
/** Brazil's lead as the ball crosses the line is not shown as text: four ball stamps pop on "Four nil" */

// ---- everybody else ----
type Actor={style:Kit;team:'bra'|'usa'|'-';at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:Kit,team:Actor['team'],p:MKey[],seed:number,rest?:Pose):Actor=>({style,team,at:(t,b)=>runner(p,t,b,seed,rest)});
/** the passer (unnamed): lofts the ball in with her right foot at τ = T_PASS, jogs on */
const YPS=YAW(BNC[0]-PASS_BALL[0],BNC[2]-PASS_BALL[2]);
const PS_SK=solve(strike(STRIKE_CONTACT,{power:.7}),WOMAN(1.66),{yaw:YPS});
const PSP:[number,number]=[PASS_BALL[0]-PS_SK.rToe[0],PASS_BALL[2]-PS_SK.rToe[2]];
const[pbx,pbz]=dirOf(YPS);
const PASSER:MKey[]=[[-10,PSP[0]-pbx*4-1,PSP[1]-pbz*4+1],[-2.8,PSP[0]-pbx*3,PSP[1]-pbz*3],[T_PASS-.55,PSP[0]-pbx*1.1,PSP[1]-pbz*1.1],[T_PASS+.5,PSP[0]+pbx*.6,PSP[1]+pbz*.6],[5,PSP[0]+pbx*9,PSP[1]+pbz*5]];
/** Ellertson: tight behind Marta, a hand on her back; lunges to the ball side as it is flicked, turns late and chases */
const ELL_PRESS=posed({lHipF:30,rHipF:24,lKnee:40,rKnee:34,lean:18,lShF:62,lShA:14,lElb:16,rShF:24,rShA:30,rElb:50,neckP:10});
const ELL_SEGS:Seg[]=[
 [-99,t=>{const r=runner([[-14,-17.6,-14.6],[-9.5,-19,-16.6],[-6.2,E0[0]+.2,E0[1]+.2],[-2.4,E0[0],E0[1]]],t,[MP[0],0,MP[1]],3,ELL_PRESS);if(t>-2.2)r.place.yaw=lerpAng(r.place.yaw??0,YM,sm(-2.2,-1.5,t));return r;}],
 [.45,t=>({pose:lunge(clamp((t-.45)/.85),{side:'l'}),place:{x:E0[0],z:E0[1],yaw:lerpAng(YM,YM+.5,sm(.45,1,t))}})],
 [1.3,t=>{const r=runner([[1.3,E0[0]+LEFT[0]*.2,E0[1]+LEFT[1]*.2],[1.8,E0[0]+.3,E0[1]+.4],[TS+.6,-18.6,-16.4],[TS+2,-17.6,-15.2]],t,martaAt(t).place.x!==undefined?[martaAt(t).place.x!,0,martaAt(t).place.z!]:[0,0,0],4);if(t<1.9)r.place.yaw=lerpAng(YM+.5,YAW(COL[0]-E0[0],COL[2]-E0[1]),sm(1.3,1.9,t));return r;}],
];
/** the second defender (unnamed): steps across to meet Marta, bites on the outside feint, is left behind */
const D2P:[number,number]=[-12.9,-13.9];
const D2_SEGS:Seg[]=[
 [-99,t=>runner([[-10,-8.5,-6],[0,-9.4,-8.4],[1.7,-12.1,-12.8],[2.3,D2P[0],D2P[1]]],t,[MP[0],0,MP[1]],6,backpedal(.2))],
 [2.3,t=>{const m=pathPos(DRIB,2.3);return{pose:lunge(clamp((t-2.3)/.8),{side:'r'}),place:{x:D2P[0],z:D2P[1],yaw:YAW(m.x-D2P[0],m.z-D2P[1])}};}],
 [3.1,t=>{const b=ballAt(t),y0=YAW(pathPos(DRIB,2.3).x-D2P[0],pathPos(DRIB,2.3).z-D2P[1]);const r=runner([[3.1,D2P[0]+.1,D2P[1]-.3],[TS+2,-9.5,-9.5]],t,b,7);if(t<3.6)r.place.yaw=lerpAng(y0,YAW(b[0]-D2P[0],b[2]-D2P[1]),sm(3.1,3.6,t));return r;}],
];
/** Briana Scurry: set, shuffles across, dives to her left as the shot goes low past her */
const GKP:[number,number]=[-1.3,-1.9];
function scurryAt(t:number,b:V3){const q=pathPos([[-10,-2.4,.4],[0,-1.8,-1.2],[TS,GKP[0],GKP[1]]],t),yaw=YAW(b[0]-q.x,b[2]-q.z),ys=YAW(SB[0]-GKP[0],SB[2]-GKP[1]);
 if(t<TS+.02)return{pose:keeperSet(t*1.6),place:{x:q.x,z:q.z,yaw}};
 return{pose:blendPose(keeperSet(t*1.6),keeperDive(clamp((t-TS-.02)/.95),{side:'l',height:.12}),sm(TS+.02,TS+.12,t)),place:{x:GKP[0],z:GKP[1],yaw:ys}};}
const ACTORS:Actor[]=[
 {style:BRA(8,{seed:48,hair:[K,.8]}),team:'bra',at:(t,b)=>{const r=runner(PASSER,t,b,1);if(t>T_PASS-.7&&t<T_PASS+.7){const u=clamp((t-T_PASS+.62)/1.2);r.pose=blendPose(r.pose,strike(u,{power:.7}),Math.sin(clamp((t-T_PASS+.7)/1.4)*Math.PI));r.place.yaw=YPS;}return r;}},// the passer (unnamed)
 {style:ELLERTSON,team:'usa',at:t=>segAt(ELL_SEGS,t)},// Tina Ellertson
 {style:DEF2,team:'usa',at:t=>segAt(D2_SEGS,t)},// the second defender
 {style:SCURRY,team:'usa',at:(t,b)=>scurryAt(t,b)},// Briana Scurry
 mover(BRA(11,{hair:[K,.9],hairStyle:'short',build:WOMAN(1.7,.9)}),'bra',[[-10,-27,-4],[0,-20.5,-4.5],[2.2,-13.4,-3.2],[TS+1.2,-8.2,-2]],4),// Cristiane, into the box
 mover(USA({hair:[Y,.7],seed:63}),'usa',[[-10,-7.6,-2.6],[TS,-6.4,-3.6]],5,backpedal(0)),// US centre-back
 mover(USA({hair:[K,.8],skin:SKIN_M,seed:64}),'usa',[[-10,-11.4,3.4],[TS,-8.4,.8]],6,backpedal(0)),// US defender
 mover(USA({hair:[K,.7],seed:65}),'usa',[[-10,-28,-12],[1,-25,-15],[TS,-17.6,-14.2]],7),// US midfielder, tracking back
 mover(BRA(7,{hair:[K,.85],seed:47}),'bra',[[-10,-39,-9],[TS,-30,-11]],8),// Brazil midfielder
 mover(REF,'-',[[-10,-36,-2],[0,-31,-6],[TS,-25,-8]],9),// the referee
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Marta with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:Kit,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===MARTA?1:2.6))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&style!==MARTA&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&style!==MARTA&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const ma=martaAt(tp);put(MARTA,ma,martaAt(tp-1/12),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,marta:ma};}
/** the lanes of the move on the grass: the ball's (round the defender's left) and Marta's (round her right), drawn to fraction u */
const BALL_LANE:[number,number][]=Array.from({length:17},(_,i)=>{const b=ballAt(TF+(1.45-TF)*i/16);return[b[0],b[2]] as [number,number];});
const RUN_LANE:[number,number][]=Array.from({length:17},(_,i)=>{const p=spinPlace(.6+.85*i/16);return[p.x??0,p.z??0] as [number,number];});
const partLane=(l:[number,number][],u:number)=>{const n=Math.max(2,Math.round(1+u*(l.length-1)));return l.slice(0,n);};
/** the ball's lane as a row of ghost balls on the grass: paper discs with navy rims (2 ops); Marta's lane is her yellow */
function ghostBalls(s:Sheet,c:Camera,l:[number,number][],rad:number){const p=new Path2D(),rim=new Path2D();for(let i=0;i<l.length;i+=3){const[x,z]=l[i],g=groundRing(c,x,z,rad,12);if(g.length>2){p.addPath(polyPath(g,true));rim.addPath(ribbon(g,Math.max(3,.035*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.3}));}}s.knockout(p,.95);s.fill(K,rim,.9);}

// ================= chapter 1 (live, real time): the high main-stand camera =================
const ch1q=()=>({hz:T(0,'Hangzhou'),wc:T(0,'World Cup'),br:T(0,'Brazil'),us:T(0,'United States'),ma:T(0,'Marta'),bk:T(0,'back to goal'),de:T(0,'A defender'),here:T(0,'Here comes the ball'),wf:T(0,'Watch her feet'),sc:T(0,'scores'),fn:T(0,'Four nil'),end:SEC(0)});
/** the lead-in: τ = t − TL. The ball crosses the line near "scores" when the voice allows; the pass always leaves on "Here comes the ball". */
const ch1T=()=>{const q=ch1q(),lo=q.here-T_PASS-.1,hi=Math.max(lo,Math.min(q.here-T_PASS+.9,q.end-T_GOAL-1.5)),TL=clamp(q.sc-T_GOAL+.25,lo,hi);return{TL,end:q.end};};
const BCAM:V3=[-34,21,-68];
/** before the pass the director's camera tells the story with the words: the stadium → the teams → Marta → her back to goal → the defender */
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-52,27,46],[q.hz+.8,-42,24,48],[q.wc,-44,6,12],[q.br,-30,2,-9],[q.ma,MP[0]+.2,1.1,MP[1]],[q.bk,MP[0]+4,1.1,MP[1]+1.2],[q.de+.2,E0[0],1.05,E0[1]],[q.here-.2,-26.5,1,-19.4]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<0){const u=sm(T_PASS-.2,0,tau);return mix3([-26.5,1,-19.4],[lerp(b[0],MP[0],.6),1.1,lerp(b[2],MP[1],.6)],u);}
 if(tau<TS){const m=martaAt(tau).place;return[lerp(m.x??0,b[0],.4)+.8,1.2,lerp(m.z??0,b[2],.4)+.6];}
 return mix3([lerp(SB[0],b[0],.5),1.2,lerp(SB[2],b[2],.5)],[-4,1.2,-1.5],sm(TS+.3,T_GOAL,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL+T_PASS-1.2,TL+T_PASS,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1650],[q.hz+.8,1900],[q.wc,2400],[q.br,3000],[q.ma,7000],[q.de+.3,8200],[TL+T_PASS-.6,4600],[TL+.1,7600],[TL+1.5,7000],[TL+TS-.1,5400],[TL+T_GOAL+.3,4300],[q.end,4700]]),easeInOutSine);return cam(BCAM,look,F);}
/** team rings: on "Brazil" yellow rings round the yellow shirts, on "United States" navy rings round the white ones; "A defender" rings Ellertson */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rb=sm(q.br,q.br+.3,t,easeOutBack)*(1-sm(q.us+.2,q.us+.8,t)),ru=sm(q.us,q.us+.3,t,easeOutBack)*(1-sm(q.ma,q.ma+.6,t)),rm=sm(q.ma,q.ma+.3,t,easeOutBack)*(1-sm(q.bk+.3,q.bk+.8,t)),rd=sm(q.de,q.de+.3,t,easeOutBack)*(1-sm(q.here,q.here+.5,t));
 if(rb<.02&&ru<.02&&rm<.02&&rd<.02)return;const bp=ballAt(tp),pb=new Path2D(),pu=new Path2D(),pd=new Path2D();
 const ring=(path:Path2D,x:number,z:number,g:number)=>{const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));};
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place;if(a.team==='bra'&&rb>.02)ring(pb,p.x??0,p.z??0,rb);if(a.team==='usa'&&ru>.02)ring(pu,p.x??0,p.z??0,ru);});
 const m=martaAt(tp).place;if(rb>.02)ring(pb,m.x??0,m.z??0,rb);if(rm>.02)ring(pd,m.x??0,m.z??0,rm*1.2);
 if(rd>.02){const p=ACTORS[1].at(tp,bp).place;ring(pd,p.x??0,p.z??0,rd*1.2);}
 yInk(s,pb,.95);s.fill(K,pu,.9);if(rm>.02||rd>.02)yInk(s,pd,.95);
}
/** "Four nil": four paper balls pop in a row over the celebrating crowd (one knockout + one navy line op) */
function fourNil(s:Sheet,u:number,y:number){if(u<.02)return;const disc=new Path2D(),rim=new Path2D(),r=46;
 for(let i=0;i<4;i++){const g=easeOutBack(clamp(u*4-i*.6)),x=(i-1.5)*r*2.7;if(g<.02)continue;const pts:Pt[]=Array.from({length:18},(_,k)=>[x+Math.cos(k/18*TAU)*r*g,y+Math.sin(k/18*TAU)*r*g] as Pt);disc.addPath(polyPath(pts,true));rim.addPath(ribbon(pts,7,{close:true,taper:0,wobble:.6}));}
 s.knockout(disc);s.fill(Y,disc,.3);s.fill(K,rim,.95);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  teamRings(s,c,tt-TL,t);
  // "back to goal": a dotted chalk line from her heels to the goal behind her
  const bl=sm(q.bk,q.bk+.8,t)*(1-sm(q.de+.4,q.de+.9,t));if(bl>.02){const pts:Pt[]=[];for(let i=0;i<=24;i++){const u=i/24*bl,p:V3=[lerp(MP[0]+.6,-.3,u),.03,lerp(MP[1],0,u)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(10,.3*kAt(c,[MP[0],0,MP[1]])),gaps:[number,number][]=[];for(let x=.06;x<1;x+=.1)gaps.push([x,x+.04]);yInk(s,ribbon(pts,w,{taper:.1,wobble:1,gaps}),.95);const h=arrowHead(pts,w);if(h)yInk(s,h,.95);}}
  drawWorld(s,c,t-TL,tt-TL,{ballMin:13,glow:sm(q.wf,q.wf+.3,tt)*(1-sm(q.wf+1.2,q.wf+1.8,tt)),cap:t>q.end-.7});
  fourNil(s,sm(q.fn,q.fn+.9,tt)*(1-sm(q.end-.5,q.end,tt)),-300);},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low behind Marta): the flick one side, the spin the other, the collect, the finish =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),mf:T(1,'Marta flicks'),os:T(1,'one side'),sr:T(1,'spins round'),ot:T(1,'the other'),bo:T(1,'beats one more'),si:T(1,'slots it'),pk:T(1,'past the keeper'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-.95],[q.sl,-.3],[q.mf+.25,TF],[q.os+.35,.85],[q.sr+.35,1.1],[q.ot+.4,1.45],[q.bo+.4,2.55],[q.si+.25,TS],[q.pk+.5,T_GOAL],[q.end,T_GOAL+.6]]),x=>x);};
/** the replay camera: low behind Marta and a little to the near side (the ball goes screen-right, she goes screen-left), tracking her in */
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),av=(f:(x:number)=>number)=>(f(tau)+f(tau-.25)+f(tau-.5))/3;
 const mx=av(x=>martaAt(clamp(x,-1,TS)).place.x??0),mz=av(x=>martaAt(clamp(x,-1,TS)).place.z??0),late=sm(q.ot+.5,q.bo+.5,t,easeInOutSine),fin=sm(q.si,q.pk+.6,t,easeInOutSine);
 const pos:V3=[lerp(mx-7.4,-15,late),lerp(1.35,3,late),lerp(mz-2.6,-27,late)];
 const b=ballAt(tau),look0:V3=[lerp(mx,b[0],.4)+1.2,.85,lerp(mz,b[2],.4)+.3],look1:V3=[lerp(b[0],-4,.3),1,lerp(b[2],-2,.3)];
 const F=key(t,mono([[0,1500],[q.sl,1700],[q.mf,2000],[q.sr,1900],[q.ot+.3,1750],[q.bo,1900],[q.si,1750],[q.pk+.4,1800],[q.end,1850]]));
 return cam(pos,mix3(look0,look1,Math.max(late*.6,fin)),F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.8*sm(0,.4,goalIn),flash:.08+1.1*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const lw=Math.max(8,.09*kAt(c,[MP[0],0,MP[1]]));
  // "one side": the ball's lane, dotted yellow, round the defender's left; "spins round" / "the other": Marta's lane, a red ribbon, round her right
  const bu=sm(q.os-.2,q.os+.7,tt)*(1-sm(q.bo,q.bo+.6,tt));if(bu>.02){const l=partLane(BALL_LANE,sm(q.os-.2,q.os+.7,tt));ghostBalls(s,c,l,.13);}
  const ru=sm(q.sr-.1,q.ot+.2,tt)*(1-sm(q.bo,q.bo+.6,tt));if(ru>.02){const pts=groundPath(c,partLane(RUN_LANE,sm(q.sr-.1,q.ot+.2,tt)));if(pts.length>1){yInk(s,ribbon(pts,lw,{taper:.15,wobble:1}),.95);const h=arrowHead(pts,lw);if(h&&sm(q.ot,q.ot+.25,tt)>.5)yInk(s,h,.95);}}
  const w=drawWorld(s,c,tau,tp,{ballMin:24,hero:true,glow:sm(q.mf-.1,q.mf+.3,tt)*(1-sm(q.os+.4,q.os+.9,tt)),cap:t>q.end-.7});
  // "Marta flicks": a yellow ring round her LEFT boot at the flick
  const lf=sm(q.mf,q.mf+.3,tt,easeOutBack)*(1-sm(q.os+.2,q.os+.6,tt));if(lf>.02){const sk=solve(w.marta.pose,MB,w.marta.place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*lf;yRing(s,p[0],p[1],r,Math.max(5,.04*kAt(c,sk.lToe)));}
  // "beats one more": a ring round the second defender as she bites on the feint
  const bo=sm(q.bo,q.bo+.3,tt,easeOutBack)*(1-sm(q.si,q.si+.4,tt));if(bo>.02){const p=ACTORS[2].at(tp,ballAt(tp)).place,g=groundRing(c,p.x??0,p.z??0,.9*bo);if(g.length>2)yInk(s,ribbon(g,Math.max(6,.1*kAt(c,[p.x??0,0,p.z??0])),{close:true,taper:0,wobble:.6}),.95);}
  // "slots it": sparks at the right boot, speed lines as the ball runs low past the keeper
  if(tp>=TS&&tp<TS+.25&&depthOf(c,SB)>NEAR){const p=P(c,SB);sparkBurst(s,Y,p[0],p[1],90+90*sm(TS,TS+.1,tp,easeOut),{n:10,seed:10,g:1-sm(TS+.1,TS+.25,tp),width:11});}
  if(tp>=TS&&tp<T_GOAL&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:140,width:6,cov:.85});}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=depthOf(c,p)>NEAR+.3?P(c,p):[0,0],r=Math.max(24,Math.min(140,BALL_R*kAt(c,p)));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 (duotone lesson): tight behind you → a clever touch → flick the ball one way, run the other =================
const ch3q=()=>({wd:T(2,'When a defender'),tb:T(2,'tight behind you'),ct:T(2,'a clever touch'),fb:T(2,'Flick the ball'),ow:T(2,'one way'),ro:T(2,'run the other'),end:SEC(2)});
/** lesson clock: the ball drops in under "a clever touch", the flick lands on "Flick the ball", the spin runs through "run the other" */
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,-.9],[q.tb,-.35],[q.ct+.3,.15],[q.fb+.25,TF],[q.ow+.3,.95],[q.ro+.3,1.35],[q.ro+1.1,1.62],[q.end,1.72]]),x=>x);};
const MARTA3=duo(MARTA,true),ELL3=duo(ELLERTSON);
const LCAM=(t:number)=>{const q=ch3q(),v=key(t,mono([[0,-6.8,5.4,-3.4,2500],[q.tb,-6.4,5.6,-3.0,2750],[q.ct,-6.2,5.2,-2.8,2850],[q.fb,-6.6,6.0,-3.2,2600],[q.ro,-6.6,6.5,-3.4,2450],[q.end,-7,6.9,-3.6,2350]]),easeInOutSine,true);
 return cam([MP[0]+v[0],v[1],MP[1]+v[2]],[E0[0]+.2,.4,E0[1]+.3],v[3]);};
/** echo stamps: the flick at contact, the spin half way, the collect */
const STAMPS:[number,number][]=[[TF,0],[1.05,1],[1.45,2]];
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=LCAM(t),tau=tau3(t),tp=tau3(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round the two players
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[MP[0]-30,0,MP[1]-30],[MP[0]+40,0,MP[1]-30],[MP[0]+40,0,MP[1]+30],[MP[0]-30,0,MP[1]+30]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,E0[0]+.3,E0[1]+.1,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5),.2);s.tone(Y,pool(3),.2);s.tone(Y,pool(1.6),.3);
  const lw=Math.max(10,.1*kAt(c,[MP[0],0,MP[1]]));
  // "tight behind you": a short yellow bracket on the grass between her heels and the defender's toes
  const tb=sm(q.tb,q.tb+.4,tt,easeOutBack)*(1-sm(q.fb,q.fb+.5,tt));if(tb>.02){const a:[number,number]=[MP[0]-mfx*.2,MP[1]-mfz*.2],b:[number,number]=[E0[0]+mfx*.2,E0[1]+mfz*.2],e=.35*tb;
   const pts=groundPath(c,[[a[0]+LEFT[0]*e,a[1]+LEFT[1]*e],[a[0],a[1]],[b[0],b[1]],[b[0]+LEFT[0]*e,b[1]+LEFT[1]*e]]);if(pts.length>1)yInk(s,ribbon(pts,lw*.8,{taper:0,wobble:.5}),.95);}
  // "Flick the ball" / "one way": the ball's lane, dotted yellow; "run the other": her lane, a paper ribbon with an arrow, round the other side
  const bu=sm(q.fb,q.ow+.3,tt);if(bu>.02)ghostBalls(s,c,partLane(BALL_LANE,bu),.14);
  const ru=sm(q.ro-.1,q.ro+.7,tt);if(ru>.02){const pts=groundPath(c,partLane(RUN_LANE,ru));if(pts.length>1){yInk(s,ribbon(pts,lw,{taper:.15,wobble:1}),.95);const h=arrowHead(pts,lw);if(h&&ru>.9)yInk(s,h,.95);}}
  // they meet again behind the defender: a yellow ring pops where ball and player come back together
  const mt=sm(q.ro+.7,q.ro+1,tt,easeOutBack);if(mt>.02){const g=groundRing(c,COL[0],COL[2],.55*mt);if(g.length>2)yInk(s,ribbon(g,lw*.8,{close:true,taper:0,wobble:.6}),.95);}
  // chronophotograph echoes of Marta at the flick, mid-spin and the collect, printed as she passes them
  STAMPS.forEach(([ts,i])=>{if(tp<ts+.08||tt<q.ro+.9)return;const h=martaAt(ts);drawPlayer(s,h.pose,c,ECHO,h.place,{detail:'low'});});
  const items:Item[]=[],m=martaAt(tp),mp=martaAt(tp-1/12),e=ACTORS[1].at(tp,ballAt(tp));
  items.push({depth:depthOf(c,[e.place.x??0,0,e.place.z??0]),draw:()=>drawPlayer(s,e.pose,c,ELL3,e.place,{detail:'mid'})});
  items.push({depth:depthOf(c,[m.place.x??0,0,m.place.z??0]),draw:()=>drawPlayer(s,m.pose,c,MARTA3,m.place,{prev:mp,smear:true})});
  const bpos=ballAt(tau);items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(20,BALL_R*kAt(c,bpos));whiteBall(s,bp[0],bp[1],r,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(r*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "When a defender": a ring round the defender; "a clever touch": a ring round Marta's left boot
  const wd=sm(q.wd,q.wd+.35,tt,easeOutBack)*(1-sm(q.ct,q.ct+.4,tt));if(wd>.02){const g=groundRing(c,E0[0],E0[1],.85*wd);if(g.length>2)yInk(s,ribbon(g,lw*.8,{close:true,taper:0,wobble:.6}),.95);}
  const ct=sm(q.ct+.1,q.ct+.45,tt,easeOutBack)*(1-sm(q.ow,q.ow+.4,tt));if(ct>.02){const sk=solve(m.pose,MB,m.place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*ct;yRing(s,p[0],p[1],r,Math.max(6,.04*kAt(c,sk.lToe)));}
  if(tp>=TF&&tp<TF+.22){const p=P(c,FLK);sparkBurst(s,Y,p[0],p[1],100,{n:9,seed:41,g:1-sm(TF+.08,TF+.22,tp),width:11});}
 },
 still:5.5,
};

const story:RisoStory={
 id:'marta-spin-2007',format:'11v11',title:"Marta's flick and spin",
 theme:'Flick the ball one way and run the other to get past a defender tight behind you.',
 ageNote:"Women's World Cup semi-final, Brazil 4–0 United States, Hangzhou, China, 27 September 2007. Marta's second goal made it four nil.",
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a flick — the ball hops sideways off the point with a yellow ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),side=(hash(seed,5)<.5?-1:1),bx=x+side*150*easeOut(u),up=Math.sin(u*Math.PI)*110,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*100*g,y+Math.sin(q)*30*g] as Pt;}),true),12,.95);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y,110*g,{n:8,seed,g:1-clamp(age/.35),width:11});
  whiteBall(s,bx,y-up,52,age*10*side+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:0});
 },
};
export default story;
