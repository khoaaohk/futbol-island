/** Iconic play film (signature): Franck Ribéry's dazzling dribble on the left — the run at the Dortmund defenders that made the opening
 * goal of the 2013 UEFA Champions League final, Borussia Dortmund 1–2 Bayern Munich, Wembley Stadium, London, Saturday 25 May 2013,
 * 60th minute, 0–0 (Mandžukić scored; Robben made it 2–1 in the 89th minute).
 * A RisoStory (chapters mode) played unchanged by the card window and StoryFilmPlayer. Narration text:
 * public/plays/narration/ribery-signature/script.json. The lead voices it later with local Kokoro; until then every chapter runs on
 * provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists
 * `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/ribery-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/ribery-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT: Ribéry's iconicPlays entry is a signature ("the dazzling dribble on the left"; lesson "Change direction quickly to leave
 * defenders off balance"). The best-documented instance in a match everyone saw: on the biggest stage, at 0–0 after an hour, he took on a
 * group of defenders on Bayern's LEFT and his clipped pass made the goal that opened the final. The same match as
 * lib/plays/riso/robben-final-2013.ts (the 89th-minute winner, a different moment): the same Wembley, kits and ball are drawn the same way,
 * but every composition here is its own (the far-side left wing, a low touchline replay, a high reverse angle from the corner, a lesson).
 *
 * SOURCES (read as raw pages; cached under the build scratchpad films/src-cache/ — no new fetches were needed):
 *  - The Guardian, Daniel Taylor, "Bayern Munich's Arjen Robben nets winner against Borussia Dortmund", 25 May 2013: "Just before the hour,
 *    Robben wandered over from his starting position on the right to double up with Ribéry on the left. As Ribéry ran at a clutch of
 *    defenders, Mandzukic would have been offside if the cross had reached him directly. Instead, Ribéry clipped the ball into Robben's path.
 *    Weidenfeller was forced to leave his line and that left the goal exposed as Robben swerved to the goalkeeper's left and turned the ball
 *    across the six-yard area. From a yard out, Mandzukic could hardly miss."
 *  - The Guardian, Paul Doyle, minute-by-minute, "GOAL! Bayern 1-0 Dortmund (Mandzukic 60)": "Helter-skelter defending from Dortmund
 *    combined with uncharacteristic composure from Robben, as the Dutchman springs a shoddy offside trap and then plays the ball across goal
 *    for Mandzukic to bundle into the net under slight pressure from Schmelzer. Hummels was a bystander." Also 26 min: "Ribéry hurtled down
 *    the left and dug out a wonderful cross"; 56 min: Piszczek "controlled Ribéry" in German classicos.
 *  - BBC Sport, Phil McNulty, "Borussia Dortmund 1-2 Bayern Munich", 25 May 2013: "the breakthrough finally came on the hour when Ribery
 *    played in Robben and his cross gave Mandzukic the simplest of tasks to finish"; Robben "set up Mario Mandzukic's first for Bayern on
 *    the hour".
 *  - Wikipedia, "2013 UEFA Champions League final" (raw wikitext): "Bayern … scored the first goal in the 60th minute, when Robben and Franck
 *    Ribéry combined to set up Mandžukić for a left-footed finish, the ball going past Marcel Schmelzer on the goal line from three yards
 *    out"; line-ups and numbers (Ribéry LW 7, Robben RW 10, Mandžukić CF 9, Müller 25, Weidenfeller 1, Piszczek 26, Hummels 15, Subotić 4,
 *    Schmelzer 29, Błaszczykowski 16, Gündoğan 8); the kit templates (Bayern all red; Dortmund yellow shirts with black stripes, black
 *    shorts, yellow socks — as checked for the Robben film).
 * CONFIRMED by those sources: the final, 25 May 2013, Wembley; 0–0 until the 60th minute; Robben had drifted over from the right to join
 *  Ribéry on the LEFT; Ribéry ran at a group ("a clutch") of defenders and CLIPPED the ball into Robben's path (not a direct cross);
 *  Robben sprang Dortmund's offside trap; Weidenfeller had to leave his line; Robben swerved to the keeper's left and turned the ball across
 *  the six-yard area; Mandžukić finished LEFT-FOOTED from about a yard out, past Schmelzer on the goal line; Hummels a bystander; Bayern
 *  all red, Dortmund yellow with black stripes and black shorts; the fans in red and yellow.
 * INFERRED / ILLUSTRATIVE (never named in the narration): the exact dribble — how many defenders were beaten and who (drawn as Piszczek and
 *  Błaszczykowski, Dortmund's right side, with Gündoğan closing), the move itself (a shoulder-drop feint outside, then a sharp cut back
 *  inside onto the right foot), and that he clipped it with his RIGHT foot; the spot on the left where it happened; every position, speed
 *  and time in metres and seconds; Robben's touches (left foot) and which way Weidenfeller went down (spreading to his right); Schmelzer's
 *  lunge; which end Bayern attacked and the main camera on the south side (as the Robben film); the keeper's kit (printed blue); the
 *  referee's kit; the ball (adidas Finale Wembley, white with navy stars); the camera positions and lenses. "They must guess which way he
 *  goes" is how the lesson explains a dribbler's threat, not a claim about what those defenders thought.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 Ribéry's clipped pass): ch1 = the live broadcast from the high main-stand camera, real time (the bowl, the teams, 0-0 and
 * 60 on the big screen, Ribéry on the far left wing running at the defenders, the clip, Robben, the cutback, Mandžukić); ch2 = the TV
 * slow-motion replay low from the left touchline (two defenders, the feint, the cut, the clip over them); ch3 = a second replay, high from
 * the goal-line corner (Robben in behind, Weidenfeller out, round him, across, the tap-in); ch4 = the lesson (run at your defender,
 * change direction quickly, leave them off balance). Seams are forward passages into Ribéry / the ball. Figures: lib/plays/riso/athlete.ts
 * through ONE adapter, drawPlayer(). Handedness: the world is right-handed (x toward Dortmund's goal, y up), athlete.ts's convention, so
 * Bayern attack +x and their LEFT wing is −z; strike({foot:'l'}) is a left foot. Framing: world centred on the CANVAS centre (never
 * sheet.safe), a lens that widens for a square window (1.45:1 … 1:1). Inks: yellow (Dortmund, floodlights, grass under blue, cue marks), red
 * (Bayern, Wembley's seats, crowd), blue (grass, dusk sky, keeper), navy (night, key line, Dortmund's black). Scenes read only their local
 * t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–320 plate ops per frame; wide-shot figures 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,keyPoses,posed,runCycle,dribble,backpedal,stand,strike,keeperSet,keeperDive,lunge,celebrate,
 STRIKE_CONTACT,touchPhase,type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

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
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/(\.\.\.|[,;:])$/.test(w)?.2:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`ribery film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py ribery-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/ribery-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Wembley, live','Wembley, 2013, the Champions League final: Bayern in red, Dortmund in yellow, no goals after an hour. Franck Ribéry runs at the defenders on the left, clips a pass... and Mandžukić scores!',
  ['Wembley','the Champions League final','Bayern','red','Dortmund','yellow','no goals','Franck Ribéry','runs at the defenders','on the left','clips a pass','Mandžukić','scores']),
 prov('Which way?','Watch again, slowly. Two defenders must guess which way he goes. He changes direction quickly, and clips it over them to Robben.',
  ['Watch again','slowly','Two defenders','must guess','which way','He changes direction','quickly','clips it over them','to Robben']),
 prov('Across the goal','Robben runs in behind. Keeper Weidenfeller rushes out, Robben goes round him and squares it. Mandžukić taps in!',
  ['Robben runs in behind','Keeper Weidenfeller','rushes out','goes round him','squares it','Mandžukić','taps in']),
 prov('Your turn','Your turn: run at your defender, change direction quickly, and leave them off balance.',
  ['Your turn','run at your defender','change direction','quickly','leave them','off balance']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`ribery film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Dortmund's goal line x = 0, net toward +x, pitch to x = −105) =================
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
function groundRing(c:Camera,x:number,z:number,r:number,n=28,rz=r):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*rz];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
/** a mark that must read on grass or night: knock the paper through first, then print the ink (1 extra op) */
function inkMark(s:Sheet,ink:string,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(ink,p,cov);}
const yInk=(s:Sheet,p:Path2D,cov=.95)=>inkMark(s,Y,p,cov);
/** a ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95,ink=Y){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);inkMark(s,ink,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a ring on the grass round a ground point, into a path */
function gRing(path:Path2D,c:Camera,x:number,z:number,r:number,w:number){const g=groundRing(c,x,z,r,26);if(g.length>2)path.addPath(ribbon(g,Math.max(4,w*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}
const dashes=(step:number,len:number,from=.04)=>{const g:[number,number][]=[];for(let x=from;x<1;x+=step)g.push([x,x+len]);return g;};
/** 7-segment block digits (glyph box 1 × 2) for the big screens */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};

// ================= Wembley from inside: three tiers of red seats, the roof ring with its floodlights, the big screens, the arch =================
const CX=-52.5;// the centre spot
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),.35),y,b*Math.sign(s)*Math.pow(Math.abs(s),.35)];}
type Lv=[number,number,number];// a, b, y
/** tier edges: lower tier, club-level fascia, middle tier, fascia, the tall upper tier */
const BOWL:Lv[]=[[60,42,1],[75,56,12.5],[76,57,15],[85,65,21],[86,66,23.5],[103,82,41]];
const TIERS:[number,number][]=[[0,1],[2,3],[4,5]],FASCIAS:[number,number][]=[[1,2],[3,4]];
const ROOF_IN:Lv=[89,69,46],ROOF_OUT:Lv=[114,94,51];
const NSEG=44;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
/** crowd: [tier, u round the bowl, v up the tier, ink 0 paper / 1 red (Bayern) / 2 yellow (Dortmund) / 3 navy, phase]. The end behind
 * Dortmund's goal (x > centre) leans red, the far end yellow, the sides mixed (which end each set of fans filled is inferred). */
const CROWD=(()=>{const r=rng(2013),o:[number,number,number,number,number][]=[];for(let i=0;i<1700;i++){const tier=r()<.42?0:r()<.45?1:2,u=r(),endX=Math.cos(u*TAU),c=r(),red=.36+.3*endX;o.push([tier,u,.05+r()*.9,c<.16?0:c<.16+red*.78?1:c<.94?2:3,r()*TAU]);}return o;})();
const LAMPS:V3[]=Array.from({length:52},(_,i)=>lvAt([ROOF_IN[0]+.5,ROOF_IN[1]+.5,ROOF_IN[2]-.8],i/52*TAU));
/** the two big screens under the roof in the ends (face the pitch) */
const SCREENS=[{x:CX+ROOF_IN[0]-3,dir:-1},{x:CX-ROOF_IN[0]+3,dir:1}].map(o=>({...o,y0:36,y1:42.5,z0:-10,z1:10}));
const SCREEN_C:V3=[SCREENS[0].x,39.2,0];
/** the arch: a 315 m span rising 133 m, leaning back over the far (north) stand — a white lattice tube in the sky */
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,-78-y*Math.tan(22*D2R)];});
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;screen?:{min:string;score:string}};
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,ey=c.eye;
 // a late-May dusk at 21:35: a deep blue sky, darker navy high up
 s.field(K,.5,.6);s.field(B,.35,.5);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz-560],[-Bnd,hz-480]],true),.35);
 // the arch over the far roof (a paper tube knocked out of the sky, lattice ticks in navy)
 {const pts:Pt[]=[];let ok=true,k=0;for(const p of ARCH){if(depthOf(c,p)<8){ok=false;break;}pts.push(P(c,p));k=Math.max(k,kAt(c,p));}
  if(ok&&pts.length>2){const w=clamp(7.4*kAt(c,ARCH[16]),3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.85);s.tone(B,tube,.12);
   const tick=new Path2D();for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w*.5,ny=dx/l*w*.5;tick.moveTo(pts[i][0]-nx,pts[i][1]-ny);tick.lineTo(pts[i][0]+nx+dx/l*w*.4,pts[i][1]+ny+dy/l*w*.4);}
   s.stroke(K,tick,Math.max(1.5,w*.08),.45);}}
 // stands: Wembley's red seats (red × navy in the dusk), rows stepped, the fascias between the tiers dark with a light band
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [...TIERS.map(q=>[...q,false]),...FASCIAS.map(q=>[...q,true])] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   addPoly(isF?fascia:stands,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1)));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.tone(R,stands,.55);s.tone(K,stands,.42);s.tone(K,rows,.22);s.knockout(fascia);s.fill(K,fascia,.8);s.tone(Y,fascia,.25);
 // crowd: faces and shirts in Bayern red and Dortmund yellow, bobbing on the twos when they rise
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,[l0,l1]=TIERS[tier],p=mix3(lvAt(BOWL[l0],th),lvAt(BOWL[l1],th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1]){s.knockout(heads[1],.7);s.fill(R,heads[1],.95);}if(seen[2]){s.knockout(heads[2],.8);s.fill(Y,heads[2],.95);}if(seen[3])s.fill(K,heads[3],.9);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=Math.floor(r()*3),th=r()*TAU,[l0,l1]=TIERS[tier],q=mix3(lvAt(BOWL[l0],th),lvAt(BOWL[l1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.72);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // the roof ring and its floodlight strip
 const roof=new Path2D();for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(ROOF_OUT,ROOF_IN,t0,t1)));addPoly(roof,clipPoly(c,band(ROOF_IN,[ROOF_IN[0],ROOF_IN[1],ROOF_IN[2]-2.2],t0,t1)));}
 s.knockout(roof);s.fill(K,roof,.88);
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp(3.4*k,10,360);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.1*k,5,140),h=clamp(.6*k,3,80);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.3);s.knockout(core);s.fill(Y,core,.6);}
 if(o.screen)for(const sc of SCREENS)screen(s,c,sc,o.screen.min,o.screen.score);
 goal(s,c,o.net);
 drawIn();
}
/** a big screen: a navy panel, the two badges' colours (Dortmund yellow/navy, Bayern red/paper), the score and the minute */
function screen(s:Sheet,c:Camera,sc:typeof SCREENS[number],min:string,score:string){
 const C:V3=[sc.x,(sc.y0+sc.y1)/2,0];if(depthOf(c,C)<4||dot(sub(c.eye,C),[sc.dir,0,0])<=0)return;
 const at=(u:number,v:number):V3=>[sc.x,lerp(sc.y1,sc.y0,v),lerp(sc.z0,sc.z1,sc.dir<0?u:1-u)];
 const quad=(u0:number,v0:number,u1:number,v1:number)=>{const q=[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1)];for(const p of q)if(depthOf(c,p)<NEAR)return[] as Pt[];return q.map(p=>P(c,p));};
 const panel=new Path2D();addPoly(panel,quad(0,0,1,1));s.knockout(panel);s.fill(K,panel,.95);
 const yel=new Path2D(),red=new Path2D(),pap=new Path2D();
 addPoly(yel,quad(.05,.12,.2,.48));addPoly(red,quad(.8,.12,.95,.48));addPoly(pap,quad(.84,.24,.91,.36));
 const glyphs=(str:string,u0:number,v0:number,gw:number,gh:number,path:Path2D)=>{[...str].forEach((ch,ci)=>{for(const sg of DIGITS[ch]??''){const[[x0,y0],[x1,y1]]=SEGS[sg],th=.3,hx=x1===x0?th/2:0,hy=y1===y0?th/2:0,ex=x1===x0?0:th/2,ey=y1===y0?0:th/2,ox=u0+ci*gw*1.5;
   addPoly(path,quad(ox+(x0-hx-ex)*gw,v0+(y0-hy-ey)*gh/2,ox+(x1+hx+ex)*gw,v0+(y1+hy+ey)*gh/2));}});};
 glyphs(score,.3,.12,.11,.36,pap);glyphs(min,.4,.62,.08,.26,yel);
 s.knockout(yel);s.fill(Y,yel,.95);s.knockout(red);s.fill(R,red,.95);s.knockout(pap);
}
/** Dortmund's goal at x = 0: posts, bar, a box net held by stanchions; `net` displaces the mesh (the ball rolling into the back) */
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

// ================= the ball: the final's adidas Finale Wembley — white, navy stars turning with the spin, a touch of red, a navy rim =================
const BALL_R=.11;
function finaleBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),duo?.3:.36);
 const star=(cx:number,cy:number,rr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<10;i++){const a=a0+i/10*TAU,m=i%2?rr*.45:rr;q.push([cx+Math.cos(a)*m,cy+Math.sin(a)*m]);}return polyPath(q,true);};
 const st=new Path2D(),acc=new Path2D(),m=Math.cos(spin*.6);
 st.addPath(star(Math.cos(spin)*r*.2,Math.sin(spin)*r*.2*m,r*.42,spin));
 for(let k=0;k<4;k++){const a=spin+k*TAU/4+.4;st.addPath(star(Math.cos(a)*r*.86,Math.sin(a)*r*.86*m,r*.3,a));acc.addPath(polyPath([[Math.cos(a+.8)*r*.55,Math.sin(a+.8)*r*.55*m],[Math.cos(a+1)*r*.7,Math.sin(a+1)*r*.7*m],[Math.cos(a+.9)*r*.45,Math.sin(a+.9)*r*.45*m]],true));}
 s.fill(K,st,.9);if(!duo)s.fill(R,acc,.9);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (the 2013 final) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[R,.18]],SKIN_M:AthleteStyle['skin']=[[Y,.45],[R,.3],[K,.1]];
/** Borussia Dortmund: yellow shirt with black stripes, black shorts (navy ink), yellow socks, black numbers */
const BVB=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,pattern:'stripes',patternInk:[K,.55],shorts:K,socks:Y,trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:30+n,...o});
/** Bayern Munich: all red, white numbers (white trim inferred) */
const FCB=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:'paper',seed:60+(n??0),...o});
/** Roman Weidenfeller, captain, number 1: the keeper kit is printed blue (NOT verified — inferred), yellow gloves */
const WEIDENFELLER:AthleteStyle={shirt:[B,.9],shorts:K,socks:[B,.9],trim:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',gloves:[Y,.9],line:K,shade:[K,.3],sleeves:'long',number:1,numberInk:Y,build:{height:1.9,bulk:1.02},seed:1};
const RIBERY:AthleteStyle=FCB(7,{hair:K,build:{height:1.7,bulk:1},seed:7});
const ROBBEN:AthleteStyle=FCB(10,{hair:null,hairStyle:'bald',build:{height:1.8,bulk:.95},seed:10});
const MANDZUKIC:AthleteStyle=FCB(9,{hair:K,build:{height:1.9,bulk:1.02},seed:9});
const PISZCZEK:AthleteStyle=BVB(26,{hair:[K,.8],build:{height:1.84}});
const KUBA:AthleteStyle=BVB(16,{hair:[K,.8],build:{height:1.75}});// Jakub Błaszczykowski
const SCHMELZER:AthleteStyle=BVB(29,{hair:[K,.7],build:{height:1.81}});
/** the referee: dark kit (inferred) */
const REF:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.9],trim:Y,boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** lesson versions: Ribéry keeps his red, everyone else a pale ghost */
const ghost=(st:AthleteStyle):AthleteStyle=>({...st,shirt:[Y,.45],pattern:'plain',shorts:[K,.3],socks:[Y,.45],trim:K,skin:[[Y,.3]],hair:[K,.5],shade:[K,.14],numberInk:K,gloves:st.gloves?[Y,.6]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Ribéry's clipped pass) =================
const IB:Build=RIBERY.build!,RB:Build=ROBBEN.build!,MB:Build=MANDZUKIC.build!,WB:Build=WEIDENFELLER.build!;
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
/** where a player stands so a joint of his pose meets a ground point (read from the solved skeleton) */
function jointSpot(pt:[number,number],yaw:number,pose:Pose,build:Build,j:'lToe'|'rToe'):[number,number]{const sk=solve(pose,build,{yaw}),t=sk[j];return[pt[0]-t[0],pt[1]-t[2]];}
const env=(tau:number,a:number,b:number,ramp=.15)=>Math.min(sm(a-ramp,a,tau),1-sm(b,b+ramp,tau));

// ---- Ribéry: the dribble down the left, the shoulder-drop feint outside, the sharp cut back inside, the clip (right foot: inferred) ----
const YAW_RUN=YAW(4,2.2);// running at the defenders: toward goal (+x) and a little inside (+z)
const FEINT0=-1.45,FEINT_D=.6,CUT_T=-.62,CUT_D=.5,CLIP_D=.8;
/** the feint: the left shoulder drops, the left leg steps out, the whole body sways to his LEFT (outside, world −z) */
function feint(t:number):Pose{return keyPoses(clamp(t),[
 [0,posed({lHipF:22,rHipF:-8,lKnee:40,rKnee:52,lean:16,pitch:5,lShA:30,rShA:30,lElb:62,rElb:62,neckP:24})],
 [.45,posed({lHipF:30,lHipA:30,lKnee:52,lHipR:10,rHipF:-6,rHipA:-4,rKnee:36,bend:-22,roll:-14,twist:16,lean:20,pitch:4,dz:-.26,lShA:72,lShF:10,lElb:38,rShA:24,rShF:-10,rElb:72,neckP:28,neckY:-12,squash:-.05})],
 [1,posed({lHipF:26,lHipA:18,lKnee:58,rHipF:4,rKnee:34,bend:-10,roll:-6,twist:6,lean:20,dz:-.12,lShA:48,rShA:34,lElb:48,rElb:62,neckP:28,neckY:-4})],
]);}
/** the cut: plant on the left, the right foot hooks the ball back inside (world +z), the body whips over to the right */
function cutPose(t:number):Pose{return keyPoses(clamp(t),[
 [0,feint(1)],
 [.5,posed({lHipF:30,lKnee:62,lHipA:8,rHipF:26,rHipA:22,rHipR:26,rKnee:34,rAnk:12,bend:16,roll:10,twist:-20,lean:22,dz:.1,lShA:58,lShF:8,rShA:40,lElb:40,rElb:52,neckP:34,neckY:-10,squash:-.06})],
 [1,posed({lHipF:-14,lKnee:44,rHipF:30,rKnee:40,bend:6,lean:18,pitch:6,twist:-8,lShA:34,rShA:34,lElb:60,rElb:60,neckP:26,dz:.1})],
]);}
const CLIP=(u:number)=>strike(u,{foot:'r',power:.45});
const R14:[number,number]=[-24.2,-23.6];// where the feint starts
const BCUT:[number,number]=[-22.95,-23.05];// the ball at the cut
const CLIP_B:[number,number]=[-21.9,-22.0];// the ball at the clip, τ = 0
// ---- the clip over the defenders into Robben's path, Robben's touches, the swerve round Weidenfeller, the ball across, the tap-in ----
const LAND:[number,number]=[-9.3,-12.3],TLAND=.95;
const T1:[number,number]=[-8.6,-11.8],T1T=1.1;// Robben's first touch (springing the trap)
const T2:[number,number]=[-7.1,-10.25],T2T=1.45;// the swerve to the keeper's left
const T3:[number,number]=[-5.35,-6.5],TC=2.0;// the ball turned across the six-yard area
const M:[number,number]=[-1.25,1.9],TM=2.6;// Mandžukić, a yard out, left foot
const GZ=1.25,TG=TM+.2;
const LINE:V3=[0,.11,GZ],NETB:V3=[1.7,.18,GZ-.25],REST:V3=[1.5,.11,GZ-.2];
const YAW_CUT=YAW_RUN,CLIP_YAW=YAW(T1[0]-CLIP_B[0],T1[1]-CLIP_B[1]);
const CUTP=jointSpot(BCUT,YAW_CUT,cutPose(.5),IB,'rToe');
const CLIPP=jointSpot(CLIP_B,CLIP_YAW,CLIP(STRIKE_CONTACT),IB,'rToe');
const [cfx,cfz]=dirOf(CLIP_YAW);
const RIB_P:MKey[]=[[-8.5,-37.4,-29.2],[-3.2,-28.4,-25.9],[FEINT0,R14[0],R14[1]],[CUT_T,CUTP[0],CUTP[1]],[0,CLIPP[0],CLIPP[1]],[.6,CLIPP[0]+cfx*1.1,CLIPP[1]+cfz*1.1],[2,CLIPP[0]+cfx*4.4,CLIPP[1]+cfz*4.4],[4.5,CLIPP[0]+cfx*8,CLIPP[1]+cfz*8]];
const DRIB_STEP=1.7;
/** the ball at his feet while he dribbles: a touch every stride (dribble's touchPhase), running ahead and caught again */
function dribbleBall(tau:number):V3{const q=pathPos(RIB_P,tau),v=Math.hypot(q.vx,q.vz),[dx,dz]=v>.2?[q.vx/v,q.vz/v]:dirOf(YAW_RUN),f=(((q.dist/DRIB_STEP-touchPhase)%1)+1)%1,off=.42+1.5*f*(1-f);return[q.x+dx*off,.11,q.z+dz*off];}
const B0=dribbleBall(FEINT0);
function ballAt(tau:number):V3{
 if(tau<FEINT0)return dribbleBall(tau);
 if(tau<CUT_T){const u=(tau-FEINT0)/(CUT_T-FEINT0),e=u*(2-u);return[lerp(B0[0],BCUT[0],e),.11,lerp(B0[2],BCUT[1],e)];}
 if(tau<0){const u=(tau-CUT_T)/-CUT_T,e=u*(1.35-.35*u);return[lerp(BCUT[0],CLIP_B[0],e),.11,lerp(BCUT[1],CLIP_B[1],e)];}
 if(tau<TLAND){const u=tau/TLAND;return[lerp(CLIP_B[0],LAND[0],u),.11+2.6*4*u*(1-u),lerp(CLIP_B[1],LAND[1],u)];}
 if(tau<T1T){const u=(tau-TLAND)/(T1T-TLAND);return[lerp(LAND[0],T1[0],u),.11+.3*Math.sin(Math.PI*u),lerp(LAND[1],T1[1],u)];}
 if(tau<T2T){const u=(tau-T1T)/(T2T-T1T),e=u*(1.2-.2*u);return[lerp(T1[0],T2[0],e),.11,lerp(T1[1],T2[1],e)];}
 if(tau<TC){const u=(tau-T2T)/(TC-T2T),e=u*(1.25-.25*u);return[lerp(T2[0],T3[0],e),.11,lerp(T2[1],T3[1],e)];}
 if(tau<TM){const u=(tau-TC)/(TM-TC);return[lerp(T3[0],M[0],u),.11+.22*Math.sin(Math.PI*u),lerp(T3[1],M[1],u)];}
 if(tau<TG){const u=(tau-TM)/(TG-TM);return[lerp(M[0],LINE[0],u),.11,lerp(M[1],LINE[2],u)];}
 if(tau<TG+.5){const u=(tau-TG)/.5;return mix3(LINE,NETB,u*(2-u));}
 return mix3(NETB,REST,clamp((tau-TG-.5)/.4));}
const netPush=(tau:number)=>(p:V3):V3=>{const a=tau-TG-.35;if(a<=0)return p;const d=Math.hypot(p[1]-.25,(p[2]-GZ)*.8),w=.28*Math.exp(-a*2.2)*Math.exp(-d*d*1.4)*(p[0]>1?1:p[0]/1);return[p[0]+w,p[1],p[2]];};
function riberyAt(tau:number):{pose:Pose;place:Place}{
 const q=pathPos(RIB_P,tau),v=Math.hypot(q.vx,q.vz),b=ballAt(tau);
 let pose:Pose,yaw=v>.4?YAW(q.vx,q.vz):YAW(b[0]-q.x,b[2]-q.z);
 if(tau<FEINT0+.3)pose=blendPose(idle(tau,7),dribble(q.dist/DRIB_STEP,{foot:'r',speed:clamp(v/5)}),clamp(v/.8));
 else{const sp=clamp(v/8);pose=blendPose(idle(tau,7),runCycle(q.dist/(2.2+2.4*sp)+.4,{speed:sp}),clamp(v/1.2));}
 const wf=env(tau,FEINT0,FEINT0+FEINT_D,.12);if(wf>.01){pose=blendPose(pose,feint((tau-FEINT0)/FEINT_D),wf);yaw=lerpAng(yaw,YAW_RUN,wf);}
 const c0=CUT_T-CUT_D*.5,wc=env(tau,c0,c0+CUT_D,.08);if(wc>.01){pose=blendPose(pose,cutPose((tau-c0)/CUT_D),wc);yaw=lerpAng(yaw,YAW_CUT,wc);}
 const k0=-STRIKE_CONTACT*CLIP_D,wk=env(tau,k0,k0+CLIP_D,.1);if(wk>.01){pose=blendPose(pose,CLIP((tau-k0)/CLIP_D),wk);yaw=lerpAng(yaw,CLIP_YAW,wk);}
 if(tau>TG-.2){const w=sm(TG-.2,TG+.6,tau);pose=blendPose(pose,celebrate(tau*.9,{kind:'arms'}),w*.9);}
 return{pose,place:{x:q.x,z:q.z,yaw}};}
// ---- Robben: in behind from the left, a left-foot touch, the swerve, the ball turned across ----
const RTOUCH=(u:number)=>strike(u,{foot:'l',power:.15});
const RCROSS=(u:number)=>strike(u,{foot:'l',power:.35});
const Y1=YAW(T2[0]-T1[0],T2[1]-T1[1]),Y2=YAW(T3[0]-T2[0],T3[1]-T2[1]),Y3=YAW(M[0]-T3[0],M[1]-T3[1]);
const RT1=jointSpot(T1,Y1,RTOUCH(STRIKE_CONTACT),RB,'lToe'),RT2=jointSpot(T2,Y2,RTOUCH(STRIKE_CONTACT),RB,'lToe'),RT3=jointSpot(T3,Y3,RCROSS(STRIKE_CONTACT),RB,'lToe');
const [r3x,r3z]=dirOf(Y3);
const RB_P:MKey[]=[[-8.5,-24.2,-12.6],[-3.2,-19.6,-11.6],[-.7,-17.6,-12.0],[0,-15.2,-12.3],[T1T,RT1[0],RT1[1]],[T2T,RT2[0],RT2[1]],[TC,RT3[0],RT3[1]],[TC+.5,RT3[0]+r3x*1.6,RT3[1]+r3z*1.6],[TM+.8,-3.6,-2.6],[TM+3.4,-2.6,3.2]];
function robbenAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(RB_P,tau,ballAt(tau),2);
 for(const[tt,yy,f] of [[T1T,Y1,RTOUCH],[T2T,Y2,RTOUCH],[TC,Y3,RCROSS]] as [number,number,(u:number)=>Pose][]){const d=f===RCROSS?.8:.5,a=tt-STRIKE_CONTACT*d,w=env(tau,a,a+d,.08);if(w>.01){r.pose=blendPose(r.pose,f((tau-a)/d),w*.9);r.place.yaw=lerpAng(r.place.yaw??0,yy,w);}}
 if(tau>TG-.1){const w=sm(TG-.1,TG+.5,tau);r.pose=blendPose(r.pose,celebrate(tau*.9,{kind:'arms'}),w);}
 return r;}
// ---- Weidenfeller: forced off his line, goes down spreading to his right as Robben swerves to his left ----
const C_AT:[number,number]=[-5.0,-8.5];
const YC=YAW(T1[0]-C_AT[0],T1[1]-C_AT[1]);
const CPLACE:Place={x:C_AT[0],z:C_AT[1],yaw:YC};
const DIVE=(u:number)=>{const p=keeperDive(u,{side:'r',height:0});p.dz*=.5;return p;},DIVE_DUR=.95,DIVE0=1.28;
const CAS_P:MKey[]=[[-8.5,-1.4,-1.6],[0,-2.2,-3.0],[.5,-2.9,-4.6],[DIVE0,C_AT[0],C_AT[1]]];
function keeperAt(tau:number):{pose:Pose;place:Place}{
 if(tau>=DIVE0)return{pose:DIVE((tau-DIVE0)/DIVE_DUR),place:CPLACE};
 const b=ballAt(tau),r=runner(CAS_P,tau,b,5,keeperSet(tau*1.6));
 if(tau>DIVE0-.25){const u=sm(DIVE0-.25,DIVE0,tau);r.pose=blendPose(r.pose,DIVE(0),u);r.place={x:lerp(r.place.x??0,C_AT[0],u),z:lerp(r.place.z??0,C_AT[1],u),yaw:lerpAng(r.place.yaw??0,YC,u)};}
 return r;}
// ---- Mandžukić: the run to the far post, the left-foot tap from a yard out ----
const MTAP=(u:number)=>strike(u,{foot:'l',power:.2});
const YM=YAW(LINE[0]-M[0],LINE[2]-M[1]);
const MFP=jointSpot(M,YM,MTAP(STRIKE_CONTACT),MB,'lToe');
const MZ_P:MKey[]=[[-8.5,-23.5,-1.8],[0,-15.0,-2.6],[1.2,-9.6,-1.0],[2.0,-5.4,.9],[TM,MFP[0],MFP[1]],[TM+.7,MFP[0]+1.1,MFP[1]+.6],[TM+3.4,-1.2,5.4]];
function mandzukicAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(MZ_P,tau,ballAt(tau),9),a=TM-STRIKE_CONTACT*.6,w=env(tau,a,a+.6,.1);
 if(w>.01){r.pose=blendPose(r.pose,MTAP((tau-a)/.6),w);r.place.yaw=lerpAng(r.place.yaw??0,YM,w);}
 if(tau>TG){const u=sm(TG,TG+.6,tau);r.pose=blendPose(r.pose,celebrate(tau*.9,{kind:'run'}),u);}
 return r;}
// ---- the defenders Ribéry runs at (inferred: Piszczek and Błaszczykowski), who bite on the feint and lunge late ----
const READY=posed({lHipF:30,rHipF:30,lKnee:46,rKnee:46,lHipA:14,rHipA:14,lAnk:-6,rAnk:-6,lean:22,pitch:4,lShA:32,rShA:32,lElb:60,rElb:60,neckP:-10});
/** the bite: weight thrown onto the right leg toward Ribéry's fake (world −z is a defender's RIGHT when he faces −x) */
const BITE=posed({rHipF:36,rHipA:30,rKnee:64,lHipF:18,lHipA:4,lKnee:30,bend:18,roll:12,dz:.28,lean:24,twist:-8,lShA:52,rShA:30,lElb:44,rElb:64,neckP:-4,neckY:-8,squash:-.04});
type Mark={p:MKey[];seed:number;bite:number;lungeAt:number;side:'l'|'r'};
const PIS_M:Mark={p:[[-8.5,-26.6,-25.2],[-3.2,-21.4,-24.2],[FEINT0,-20.1,-23.9],[CUT_T,-20.3,-24.9],[.1,-20.1,-24.8],[.6,-19.6,-24.2],[1.6,-17.2,-21.2],[4,-11.6,-15]],seed:3,bite:1,lungeAt:-.28,side:'l'};
const KUB_M:Mark={p:[[-8.5,-28.4,-18.2],[-3.2,-22.2,-20.0],[FEINT0,-20.5,-20.6],[CUT_T,-20.7,-21.4],[.1,-20.3,-21.0],[.7,-19.6,-20.3],[1.8,-17.8,-18],[4,-13,-13.4]],seed:5,bite:.8,lungeAt:.02,side:'l'};
function markerAt(m:Mark,tau:number):{pose:Pose;place:Place}{
 const q=pathPos(m.p,tau),v=Math.hypot(q.vx,q.vz),b=ballAt(tau),face=YAW(b[0]-q.x,b[2]-q.z),[fx,fz]=dirOf(face),along=q.vx*fx+q.vz*fz;
 const shuffle=blendPose(READY,backpedal(tau*1.8+m.seed*.3),clamp(v/1.4)),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp)+m.seed*.37,{speed:sp});
 const w=sm(1.2,2.6,along)*sm(.5,1.5,tau);
 let pose=blendPose(shuffle,run,w);const yaw=lerpAng(face,v>.6?YAW(q.vx,q.vz):face,w);
 const bw=m.bite*Math.min(sm(FEINT0+.12,FEINT0+.45,tau),1-sm(CUT_T+.12,CUT_T+.5,tau));if(bw>.01)pose=blendPose(pose,BITE,bw);
 const L0=m.lungeAt-.36,lw=env(tau,L0,L0+.6,.15);if(lw>.01)pose=blendPose(pose,lunge(clamp((tau-L0)/.6),{side:m.side}),lw);
 return{pose,place:{x:q.x,z:q.z,yaw}};}
/** the off-balance weight: how far a defender is leaning the wrong way (0..1) at τ */
const offBalance=(m:Mark,tau:number)=>m.bite*Math.min(sm(FEINT0+.12,FEINT0+.45,tau),1-sm(.2,.7,tau));
// ---- Schmelzer on the goal line, a lunge too late ----
const SCH_P:MKey[]=[[-8.5,-22,11],[0,-15.8,8.6],[1.4,-8.4,4.6],[2.3,-2.4,1.9],[TM,-.45,.5],[TM+1,-.3,.2]];
function schmelzerAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(SCH_P,tau,ballAt(tau),6),a=TM-.36,w=env(tau,a,a+.6,.15);
 if(w>.01){r.pose=blendPose(r.pose,lunge(clamp((tau-a)/.6),{side:'r'}),w);r.place.yaw=lerpAng(r.place.yaw??0,YAW(M[0]-(r.place.x??0),M[1]-(r.place.z??0)),w);}
 return r;}

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const SUBOTIC=BVB(4,{hair:K,build:{height:1.93,bulk:1}}),HUMMELS=BVB(15,{hair:[K,.85],build:{height:1.91,bulk:1.02}});
const ACTORS:Actor[]=[
 {style:PISZCZEK,at:t=>markerAt(PIS_M,t)},
 {style:KUBA,at:t=>markerAt(KUB_M,t)},
 {style:SCHMELZER,at:t=>schmelzerAt(t)},
 mover(HUMMELS,[[-8.5,-21,-6.5],[0,-14.9,-6.6],[1.1,-11.4,-9.2],[2.2,-7.4,-8.2],[3.4,-4.2,-5]],7),// Mats Hummels, "a bystander"
 mover(SUBOTIC,[[-8.5,-20.2,2.6],[0,-14.4,1.2],[1.3,-9.4,-.3],[2.4,-4.6,-1],[3.4,-2.8,-1.6]],3),// Neven Subotić
 mover(BVB(8,{hair:K}),[[-8.5,-30.5,-18.5],[-1.4,-25.4,-19.4],[0,-23.8,-20.2],[2,-20.8,-17.6],[4,-17,-14]],12),// İlkay Gündoğan, closing
 mover(BVB(6,{hair:[Y,.7],build:{height:1.85}}),[[-8.5,-25.5,-9.5],[0,-19.4,-9.8],[3,-11.5,-6.6]],8),// Sven Bender
 mover(BVB(11,{hair:[Y,.8]}),[[-8.5,-33,-6],[3,-27.5,-3.5]],15),// Marco Reus
 mover(BVB(19,{hair:K}),[[-8.5,-30,12],[3,-22.5,9]],14),// Kevin Großkreutz
 mover(BVB(9,{hair:K}),[[-8.5,-44,2],[3,-38.5,1]],16),// Robert Lewandowski
 mover(FCB(25,{hair:[K,.6]}),[[-8.5,-25,5.2],[0,-17.4,3.8],[2.6,-6.4,4.6],[3.6,-3.8,3.4]],18),// Thomas Müller
 mover(FCB(27,{hair:K,skin:SKIN_M}),[[-8.5,-45,-30],[0,-31,-30.4],[3,-23,-29]],19),// David Alaba, overlapping
 mover(FCB(31,{hair:[Y,.8]}),[[-8.5,-41,-12],[3,-30,-10]],20),// Bastian Schweinsteiger
 mover(FCB(8,{hair:K,build:{height:1.9}}),[[-8.5,-47,-2],[3,-38,-2.5]],21),// Javi Martínez
 mover(REF,[[-8.5,-41,-17],[3,-27,-13]],22),// Nicola Rizzoli
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([RIBERY,ROBBEN,WEIDENFELLER,MANDZUKIC,PISZCZEK,KUBA]);
/** everyone and the ball at τ, depth sorted. `hero` smears the fast movers; `prev` gives every figure its secondary motion; `cap` limits
 * figure detail (passages); small figures in wide shots print at 'low'. `styleOf` swaps kits (the lesson's ghosts). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean;styleOf?:(st:AthleteStyle)=>AthleteStyle;maxDepth?:number;nearCull?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt),sty=o.styleOf??(x=>x);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:(o.nearCull??3.4)))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if((o.cap&&!hero&&hPx<34)||(!hero&&d>(o.maxDepth??1e9)))return;const detail:Detail|undefined=hPx<62||(!hero&&hPx<(o.cap?150:120))?'low':o.cap||!hero?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,sty(style),st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const rib=riberyAt(tp),rob=robbenAt(tp),gk=keeperAt(tp),mz=mandzukicAt(tp);
 put(RIBERY,rib,riberyAt(tp-dt),!!o.hero);put(ROBBEN,rob,robbenAt(tp-dt),!!o.hero);put(WEIDENFELLER,gk,keeperAt(tp-dt),!!o.hero);put(MANDZUKIC,mz,mandzukicAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  finaleBall(s,q[0],q[1],r,tau*7,{sq:clamp(sp/(r*3),0,.6),dir:Math.atan2(dy,dx),duo:!!o.styleOf});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,rib,rob,gk,mz};}
/** a dashed ground arrow along a list of ground points (x, z), drawn to `u` of its length */
function groundArrow(s:Sheet,c:Camera,pts:[number,number][],u:number,w:number,ink=Y){if(u<=.02)return;const q:Pt[]=[];for(const p of pts){const g:V3=[p[0],.03,p[1]];if(depthOf(c,g)<NEAR+.2)continue;q.push(P(c,g));}if(q.length<2)return;
 const n=Math.max(2,Math.round(q.length*u)),seg=q.slice(0,n),last=pts[Math.min(pts.length-1,n-1)],wd=Math.max(5,w*kAt(c,[last[0],0,last[1]]));
 const path=ribbon(seg,wd,{taper:.1,wobble:.6,gaps:dashes(.1,.06)}),a=seg[seg.length-2],b=seg[seg.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=wd*2.2;
 path.addPath(polyPath([[b[0]+ux*z*1.3,b[1]+uy*z*1.3],[b[0]-uy*z,b[1]+ux*z],[b[0]+uy*z,b[1]-ux*z]],true));inkMark(s,ink,path,.95);}
const pathPts=(p:MKey[],t0:number,t1:number,n=14):[number,number][]=>Array.from({length:n+1},(_,i)=>{const q=pathPos(p,lerp(t0,t1,i/n));return[q.x,q.z];});
const ballPts=(t0:number,t1:number,n=14):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(lerp(t0,t1,i/n));return[b[0],b[2]];});
/** the ball's flight as yellow dots (in the air: real height), drawn to `u` */
function ballDots(s:Sheet,c:Camera,t0:number,t1:number,u:number,n=16,rMul=1){if(u<=.02)return;const dots=new Path2D();let k=0;for(let i=0;i<=n;i++){if(i/n>u)break;const p=ballAt(lerp(t0,t1,i/n));if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p),r=Math.max(3,.05*kAt(c,p)*rMul);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);k++;}if(k)yInk(s,dots,.95);}
/** off balance: a red lean line from a defender's feet up through where his weight has gone (world −z, the way he bit), and a wobble arc */
function redLean(s:Sheet,c:Camera,pl:Place,g:number,wob:number){if(g<=.02)return;const x=pl.x??0,z=pl.z??0,f:V3=[x,.05,z],h:V3=[x,1.95,z-.75*g];if(depthOf(c,f)<NEAR+.3||depthOf(c,h)<NEAR+.3)return;
 const k=kAt(c,f),p=ribbon([P(c,f),P(c,[x,1,z-.38*g]),P(c,h)],Math.max(4,.06*k),{taper:.2,wobble:.5,gaps:dashes(.16,.08)});
 const hp=P(c,h),a=P(c,[x,1.7,z-.9*g]),b=P(c,[x,1.75,z-.5*g]);p.addPath(polyPath([[hp[0]+(hp[0]-b[0])*.5,hp[1]+(hp[1]-b[1])*.5],a,b],true));
 if(wob>.02){const pts=groundRing(c,x,z,.7+.15*Math.sin(wob*9),18,.45);if(pts.length>2)p.addPath(ribbon(pts.slice(0,11),Math.max(3,.04*k),{taper:.3,wobble:.8}));}
 inkMark(s,R,p,.95);}

// ================= chapter 1 (live): the high main-stand camera, real time =================
const ch1q=()=>({wm:T(0,'Wembley'),cl:T(0,'the Champions League final'),by:T(0,'Bayern'),rd:T(0,'red'),bv:T(0,'Dortmund'),yl:T(0,'yellow'),ng:T(0,'no goals'),fr:T(0,'Franck Ribéry'),ra:T(0,'runs at the defenders'),ol:T(0,'on the left'),cp:T(0,'clips a pass'),mz:T(0,'Mandžukić'),sc:T(0,'scores'),end:SEC(0)});
/** the match clock: real time into the clip on "clips a pass", the ball over the line on (or just after) "scores" */
const tau1=(t:number)=>{const q=ch1q(),clip=q.cp+.25,g=Math.max(q.sc+.15,clip+TG*.92);
 return key(t,mono([[0,Math.max(-8.5,-clip)],[clip,0],[g,TG],[q.end,TG+(q.end-g)*.9]]),x=>x);};
const MAIN:V3=[-30,22,54];
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-56,30,64],[q.cl,-48,26,60],[q.bv+.4,MAIN[0],MAIN[1],MAIN[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the dribble the director's camera follows the words: the bowl and arch → Bayern → Dortmund → the big screen → Ribéry */
function ch1Pre(t:number):V3{const q=ch1q(),rp=riberyAt(tau1(q.fr)).place,v=key(t,mono([[0,CX,28,-30],[q.cl,CX+6,14,-10],[q.by-.1,-21,1,-8],[q.bv+.2,-16,1,-2],[q.yl+.45,-16,1,-2],[q.ng+.1,SCREEN_C[0],SCREEN_C[1]-1,0],[q.ng+.9,SCREEN_C[0],SCREEN_C[1]-1.4,0],[q.fr-.2,(rp.x??0)+2,1,(rp.z??0)+.5]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<0)return[b[0]+3.2,.9,b[2]+1.2];
 return mix3([b[0]+1,Math.min(b[1],4)*.4+.8,b[2]],[-4,1,-2],sm(TG+.2,TG+1.8,tau));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),w=sm(q.fr-.2,q.fr+.5,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,760],[q.cl,900],[q.by-.1,2400],[q.bv+.2,2500],[q.yl+.45,2500],[q.ng+.1,4200],[q.ng+.9,4500],[q.fr-.2,5200],[q.ra,6400],[q.cp,6000],[q.cp+.9,3600],[q.sc,3900],[q.end,3300]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings on "Bayern"/"red" and "Dortmund"/"yellow"; Ribéry's ring on "Franck Ribéry" */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rr=sm(q.by,q.by+.3,t,easeOutBack)*(1-sm(q.bv,q.bv+.5,t)),ry=sm(q.bv,q.bv+.3,t,easeOutBack)*(1-sm(q.ng,q.ng+.5,t)),rrb=sm(q.fr,q.fr+.3,t,easeOutBack)*(1-sm(q.cp,q.cp+.4,t));
 if(rr<.02&&ry<.02&&rrb<.02)return;const bp=ballAt(tp),pr=new Path2D(),py=new Path2D();
 const all=[...ACTORS.map(a=>({st:a.style,pl:a.at(tp,bp).place})),{st:ROBBEN,pl:robbenAt(tp).place},{st:RIBERY,pl:riberyAt(tp).place},{st:MANDZUKIC,pl:mandzukicAt(tp).place},{st:WEIDENFELLER,pl:keeperAt(tp).place}];
 for(const {st,pl} of all){if(st.shirt===R&&rr>.02)gRing(pr,c,pl.x??0,pl.z??0,.95*rr,.16);if(st.shirt===Y&&ry>.02)gRing(py,c,pl.x??0,pl.z??0,.95*ry,.16);}
 const rp=riberyAt(tp).place;if(rrb>.02)gRing(pr,c,rp.x??0,rp.z??0,1.5*rrb,.22);
 inkMark(s,R,pr,.95);yInk(s,py,.95);
}
/** "on the left": Bayern's left channel lit as a yellow dashed lane along the wing (world −z) */
function leftLane(s:Sheet,c:Camera,g:number){if(g<=.02)return;const p=new Path2D(),x0=-40,x1=lerp(x0,-6,g);for(const z of [-18.5,-31])groundLine(p,c,[x0,z],[x1,z],.35);
 const band=new Path2D();addPoly(band,clipPoly(c,[[x0,.02,-31],[x1,.02,-31],[x1,.02,-18.5],[x0,.02,-18.5]]));s.tone(Y,band,.3*g);inkMark(s,Y,p,.95);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),after=tau-TG;frame(s);
  const hot=sm(q.ng,q.ng+.4,t,easeOutBack)*(1-sm(q.fr,q.fr+.5,t));
  stadium(s,c,{t,cheer:.12+.9*sm(0,.4,after)*(1-sm(2.4,3.6,after)),flash:.12+.9*sm(0,.4,after),net:netPush(tau),screen:{min:'60',score:'0-0'}},()=>{
   if(hot>.02){const p=P(c,SCREEN_C),k=kAt(c,SCREEN_C);yRing(s,p[0],p[1],Math.max(20,13*k*hot),Math.max(6,1.1*k));}
   teamRings(s,c,tp,t);
   leftLane(s,c,sm(q.ol,q.ol+.5,tt,easeOut)*(1-sm(q.cp,q.cp+.5,tt)));
   // "runs at the defenders": a yellow arrow from Ribéry at the two defenders
   const ra=sm(q.ra,q.ra+.4,tt,easeOut)*(1-sm(q.cp-.1,q.cp+.3,tt));if(ra>.02){const rp=riberyAt(tp).place,pz=markerAt(PIS_M,tp).place;groundArrow(s,c,[[rp.x??0,rp.z??0],[lerp(rp.x??0,pz.x??0,.5),lerp(rp.z??0,pz.z??0,.5)+.6],[(pz.x??0)-.9,(pz.z??0)+1.2]],ra,.3);}
   // "clips a pass": the ball's flight as yellow dots
   ballDots(s,c,0,T1T,sm(q.cp,q.cp+.5,tt)*(1-sm(q.sc,q.sc+.4,tt)),14,2.2);
   const w=drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
   // "Mandžukić": a red ring on him
   const mz=sm(q.mz,q.mz+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(mz>.02){const p=new Path2D(),mp=w.mz.place;gRing(p,c,mp.x??0,mp.z??0,1.3*mz,.2);inkMark(s,R,p,.95);}
   // the cut: a spark at Ribéry's boot; the goal: a spark on the line
   if(tp>=CUT_T-.04&&tp<CUT_T+.25){const p=P(c,[BCUT[0],.15,BCUT[1]]);sparkBurst(s,Y,p[0],p[1],45+40*sm(CUT_T,CUT_T+.1,tp,easeOut),{n:8,seed:3,g:1-sm(CUT_T+.08,CUT_T+.25,tp),width:9});}
   if(tp>=TG-.05&&tp<TG+.4){const p=P(c,LINE);sparkBurst(s,Y,p[0],p[1],60+60*sm(TG,TG+.1,tp,easeOut),{n:9,seed:4,g:1-sm(TG+.15,TG+.4,tp),width:10});}
  });},
 aperture(t){const c=ch1Cam(t),mp=mandzukicAt(tau1(t)).place,g:V3=[mp.x??0,1.1,mp.z??0],[x,y]=P(c,g);return apertureDisc(x,y,clamp(.6*kAt(c,g),16,140),12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low from the left touchline): two defenders, the feint, the cut, the clip =================
const ch2q=()=>({wa:T(1,'Watch again'),sl:T(1,'slowly'),td:T(1,'Two defenders'),mg:T(1,'must guess'),ww:T(1,'which way'),hc:T(1,'He changes direction'),qk:T(1,'quickly'),co:T(1,'clips it over them'),tr:T(1,'to Robben'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-2.6],[q.td,-2.0],[q.mg,-1.62],[q.ww+.35,FEINT0+.3],[q.hc+.3,CUT_T-.2],[q.qk+.1,CUT_T],[q.co+.25,0],[q.tr+.3,.85],[q.end,1.15]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),av=(f:(x:number)=>number)=>(f(tau)+f(tau-.2)+f(tau-.4))/3;
 const rx=av(u=>riberyAt(u).place.x??0),rz=av(u=>riberyAt(u).place.z??0),b=ballAt(tau);
 const orbit=sm(0,q.co,t,easeInOutSine),up=sm(q.co,q.tr+.4,t,easeInOutSine);
 const pos:V3=[rx+lerp(-5.8,1.2,orbit)-1.5*up,1.35+.5*up,rz-lerp(4.2,7.4,orbit)-.6*up];
 const look:V3=[lerp(rx+2.3,b[0]-1,up*.55),lerp(.9,Math.min(b[1],3)*.6+.9,up),lerp(rz+1.1,b[2]-1,up*.55)];
 const F=key(t,mono([[0,1650],[q.sl,1800],[q.td,1700],[q.mg,1950],[q.hc,2150],[q.qk,2250],[q.co,1800],[q.tr+.3,1150],[q.end,1050]]),easeInOutSine);return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.06,screen:{min:'60',score:'0-0'}},()=>{
   const rp=riberyAt(tp).place,rx=rp.x??0,rz=rp.z??0;
   // "must guess" / "which way": two dashed arrows fork from the ball — outside (red, the fake) and inside (yellow, the real way)
   const mg=sm(q.mg,q.mg+.4,tt,easeOut)*(1-sm(q.qk,q.qk+.4,tt)),pulse=.5+.5*Math.sin(tt*9);
   if(mg>.02){const b=ballAt(Math.min(tp,FEINT0));groundArrow(s,c,[[b[0],b[2]],[b[0]+1.2,b[2]-.9],[b[0]+2.2,b[2]-2.2]],mg*(.8+.2*pulse),.13,R);
    groundArrow(s,c,[[b[0],b[2]],[b[0]+1.1,b[2]+1],[b[0]+2.4,b[2]+1.7]],mg*sm(q.ww,q.ww+.4,tt,easeOut)*(.8+.2*(1-pulse)),.13);}
   // "He changes direction": the ball's real path, fake out and cut back, drawn as it happens
   const hc=sm(q.hc,q.hc+.3,tt)*(1-sm(q.co+.2,q.co+.6,tt));if(hc>.02&&tp>FEINT0-.2)groundArrow(s,c,ballPts(FEINT0-.2,Math.min(Math.max(tp,FEINT0-.1),0),12),hc,.1);
   // "clips it over them": the flight in yellow dots
   ballDots(s,c,0,T1T,sm(q.co,q.co+.5,tt)*(1-sm(q.end-.9,q.end-.5,tt)),16,1);
   const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,prev:true,nearCull:6,maxDepth:30,cap:t>q.end-.7});
   // "Two defenders": blue rings on them
   const td=sm(q.td,q.td+.3,tt,easeOutBack)*(1-sm(q.hc,q.hc+.4,tt));if(td>.02){const p=new Path2D();for(const m of [PIS_M,KUB_M]){const pl=markerAt(m,tp).place;gRing(p,c,pl.x??0,pl.z??0,1*td,.08);}inkMark(s,B,p,.95);}
   // off balance: red lean lines as they bite on the fake
   const ob=sm(q.hc-.2,q.hc+.2,tt)*(1-sm(q.co+.3,q.co+.8,tt));for(const m of [PIS_M,KUB_M])redLean(s,c,markerAt(m,tp).place,ob*offBalance(m,tp)*1.2,tt);
   // "quickly": sparks at the cut touch and speed ticks behind him
   if(tp>=CUT_T-.04&&tp<CUT_T+.3){const p=P(c,[BCUT[0],.12,BCUT[1]]);sparkBurst(s,Y,p[0],p[1],70+60*sm(CUT_T,CUT_T+.1,tp,easeOut),{n:9,seed:6,g:1-sm(CUT_T+.1,CUT_T+.3,tp),width:10});}
   const qk=sm(q.qk,q.qk+.2,tt)*(1-sm(q.qk+.7,q.qk+1.1,tt));if(qk>.02){const h=P(c,[rx,1.1,rz]),k=kAt(c,[rx,1.1,rz]);speedLines(s,Y,h[0]-.7*k,h[1],Math.PI,{n:5,seed:9,len:1.1*k*qk,spread:.9*k,width:Math.max(4,.05*k),cov:.9});}
   // "to Robben": a red ring round him as the ball drops for him
   const tr=sm(q.tr,q.tr+.3,tt,easeOutBack);if(tr>.02){const p=new Path2D(),rb=w.rob.place;gRing(p,c,rb.x??0,rb.z??0,1.3*tr,.12);inkMark(s,R,p,.95);}
  });
  if(t<.45){const v=1-t/.45;speedLines(s,K,0,0,0,{n:9,seed:21,len:900*v,spread:700,width:18,cov:.5*v});}},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay, high from the goal-line corner): in behind, the keeper out, round him, across, the tap-in =================
const ch3q=()=>({rb:T(2,'Robben runs in behind'),kw:T(2,'Keeper Weidenfeller'),ro:T(2,'rushes out'),gr:T(2,'goes round him'),sq:T(2,'squares it'),mz:T(2,'Mandžukić'),ti:T(2,'taps in'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,-.2],[q.rb+.5,.5],[q.kw,.85],[q.ro+.3,1.2],[q.gr+.35,T2T+.2],[q.sq+.2,TC+.08],[q.mz,TM-.25],[q.ti+.15,TG],[q.end,TG+.6+(q.end-q.ti)*.4]]),x=>x);};
const RCAM:V3=[3,7.8,-21];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(tau),rp=robbenAt(tau).place,toGoal=sm(q.gr,q.mz+.3,t,easeInOutSine);
 const look0:V3=[lerp(b[0],rp.x??0,.4),.9,lerp(b[2],rp.z??0,.4)],look1:V3=[-2.4,.7,-1.4],look=mix3(look0,look1,toGoal*.7);
 const pos:V3=add(RCAM,[-1.6*toGoal,-1.8*toGoal,3.2*toGoal]);
 const F=key(t,mono([[0,1300],[q.rb,1350],[q.kw,1700],[q.ro,1800],[q.gr,1900],[q.sq,1750],[q.mz,2300],[q.ti,2550],[q.end,2200]]),easeInOutSine);return cam(pos,look,F);}
/** Dortmund's offside line at the clip: a navy dashed line across the pitch through the last outfield defender */
function offsideLine(s:Sheet,c:Camera,g:number){if(g<=.02)return;const x=-14.4,p=new Path2D();for(let z=-30;z<30;z+=2.4)groundLine(p,c,[x,z],[x,Math.min(30,z+1.4*g)],.16);s.knockout(p,.8);s.fill(K,p,.85);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt);
  const inT=q.ti-.2,shake=t>=inT?5*settle(t,inT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.9*sm(TG,TG+.4,tp),flash:.08+.8*sm(TG,TG+.4,tp),net:netPush(tau)},()=>{
   // "Robben runs in behind": the defenders' line, and his run through it
   const rb=sm(q.rb,q.rb+.4,tt,easeOut)*(1-sm(q.kw+.2,q.kw+.6,tt));offsideLine(s,c,rb);groundArrow(s,c,pathPts(RB_P,-.7,T1T,12),rb,.2);
   // "rushes out": the keeper's dashed run off his line
   const ro=sm(q.ro,q.ro+.4,tt,easeOut)*(1-sm(q.sq,q.sq+.4,tt));groundArrow(s,c,pathPts(CAS_P,0,DIVE0,8),ro,.16,B);
   // "goes round him": Robben's swerve to the keeper's left, a yellow arrow
   const gr=sm(q.gr,q.gr+.4,tt,easeOut)*(1-sm(q.mz,q.mz+.4,tt));groundArrow(s,c,pathPts(RB_P,T1T,TC,10),gr,.2);
   // "squares it": the ball's path across the six-yard area as dots
   const sq=sm(q.sq-.05,q.sq+.3,tt)*(1-sm(q.end-.9,q.end-.5,tt));if(sq>.02&&tp>TC)ballDots(s,c,TC,Math.min(tp,TG),1,12,1.3);
   const w=drawWorld(s,c,tau,tp,{ballMin:12,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const gs=solve(w.gk.pose,WB,w.gk.place);
   // "Keeper Weidenfeller": a blue ring round him
   const kw=sm(q.kw,q.kw+.3,tt,easeOutBack)*(1-sm(q.gr,q.gr+.4,tt));if(kw>.02){const p=new Path2D();gRing(p,c,gs.pelvis[0],gs.pelvis[2],1.2*kw,.12);inkMark(s,B,p,.95);}
   // "Mandžukić": a red ring round him
   const mz=sm(q.mz,q.mz+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(mz>.02){const p=new Path2D(),mp=w.mz.place;gRing(p,c,mp.x??0,mp.z??0,1.1*mz,.12);inkMark(s,R,p,.95);}
   // "taps in": sparks off his left boot and on the line
   if(tp>=TM-.02&&tp<TM+.22){const ms=solve(w.mz.pose,MB,w.mz.place),p=P(c,ms.lToe);sparkBurst(s,Y,p[0],p[1],60+50*sm(TM,TM+.08,tp,easeOut),{n:8,seed:5,g:1-sm(TM+.08,TM+.22,tp),width:9});}
   if(tp>=TG-.03&&tp<TG+.35){const p=P(c,LINE);sparkBurst(s,Y,p[0],p[1],80+80*sm(TG,TG+.1,tp,easeOut),{n:10,seed:8,g:1-sm(TG+.12,TG+.35,tp),width:11});}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),rp=riberyAt(Math.min(tau,.4)).place,mp=mandzukicAt(tau).place,g:V3=[mp.x??rp.x??0,1.1,mp.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.4,
};

// ================= chapter 4 (the lesson): run at your defender — change direction quickly — leave them off balance =================
const ch4q=()=>({yt:T(3,'Your turn'),ra:T(3,'run at your defender'),cd:T(3,'change direction'),qu:T(3,'quickly'),lt:T(3,'leave them'),ob:T(3,'off balance'),end:SEC(3)});
/** lesson camera: straight behind him looking up the wing, so the fake (world −z) reads as screen-left and the cut as screen-right.
 * lesson clock: the run on "run at your defender", the fake on "change direction", the cut on "quickly", the clip after "off balance" */
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,-3.0],[q.ra,-2.5],[q.cd+.1,FEINT0+.1],[q.qu+.15,CUT_T],[q.lt+.2,-.3],[q.ob+.3,-.02],[q.end,.35]]),x=>x);};
function LCAM(t:number){const q=ch4q(),tau=tau4(t),av=(f:(x:number)=>number)=>(f(tau)+f(tau-.25)+f(tau-.5))/3,x=av(u=>riberyAt(u).place.x??0),z=av(u=>riberyAt(u).place.z??0),push=sm(q.lt-.3,q.ob+.4,t,easeInOutSine);
 const pos:V3=[x-5.6+1.2*push,1.7,z+1.3-.5*push],look:V3=[x+2.6,.8,z+.6];return cam(pos,look,key(t,mono([[0,1700],[q.ra,1800],[q.cd,2000],[q.qu,2100],[q.lt,1900],[q.ob,1800],[q.end,1700]]),easeInOutSine));}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.72,.5);s.field(B,.25,.5);
  const rp0=riberyAt(tp).place,floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-40],[8,0,-40],[8,0,40],[-60,0,40]]));s.tone(B,floor,.3);
  const pool=(r:number)=>{const g=groundRing(c,rp0.x??0,rp0.z??0,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5.5),.2);s.tone(Y,pool(3),.18);
  // "run at your defender": a straight arrow at the defender
  const ra=sm(q.ra,q.ra+.4,tt,easeOut)*(1-sm(q.cd,q.cd+.4,tt));if(ra>.02){const pz=markerAt(PIS_M,tp).place,x=rp0.x??0,z=rp0.z??0;groundArrow(s,c,[[x+.4,z+.2],[lerp(x,pz.x??0,.45),lerp(z,pz.z??0,.45)],[(pz.x??0)-.8,(pz.z??0)+.2]],ra,.13);}
  // "change direction": the fake (red, out) and the real way (yellow, back inside) as a zig-zag on the grass
  const cd=sm(q.cd,q.cd+.4,tt,easeOut)*(1-sm(q.ob+.3,q.ob+.8,tt));if(cd>.02){groundArrow(s,c,[[B0[0],B0[2]],[B0[0]+.7,B0[2]-.9],[B0[0]+1.1,B0[2]-1.6]],cd,.1,R);groundArrow(s,c,ballPts(CUT_T-.1,0,10),cd*sm(q.qu,q.qu+.35,tt,easeOut),.12);}
  const w=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,prev:true,styleOf:st=>st===RIBERY?st:ghost(st),maxDepth:16,nearCull:5});
  // "quickly": a burst at the cut and speed ticks
  if(tp>=CUT_T-.04&&tp<CUT_T+.35){const p=P(c,[BCUT[0],.12,BCUT[1]]);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:41,g:1-sm(CUT_T+.1,CUT_T+.35,tp),width:11});}
  const qu=sm(q.qu,q.qu+.2,tt)*(1-sm(q.lt,q.lt+.4,tt));if(qu>.02){const rs=solve(w.rib.pose,IB,w.rib.place),h=P(c,rs.pelvis),k=kAt(c,rs.pelvis);speedLines(s,Y,h[0]-.6*k,h[1],Math.PI,{n:5,seed:13,len:1*k*qu,spread:.9*k,width:Math.max(4,.05*k),cov:.9});}
  // "leave them" / "off balance": red lean lines and wobbles at the defenders' feet
  const lt=sm(q.lt,q.lt+.35,tt,easeOutBack);for(const m of [PIS_M,KUB_M])redLean(s,c,markerAt(m,tp).place,lt*Math.max(offBalance(m,tp),.6),sm(q.ob,q.ob+.3,tt)>.02?tt:0);
 },
 still:6,
};

const story:RisoStory={
 id:'ribery-signature',format:'11v11',title:'Ribéry takes them on',
 theme:'Run at your defender, change direction quickly, and leave them off balance.',
 ageNote:'Champions League final, Borussia Dortmund 1–2 Bayern Munich, Wembley Stadium, London, 25 May 2013. At 0–0 on the hour, Ribéry ran at a group of Dortmund defenders on the left and clipped the ball into Robben\'s path; Robben went round Weidenfeller and turned it across for Mandžukić to score.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a zig-zag (fake one way, cut the other) and the ball clipped away on a dotted arc. Reduced motion: the marks, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.8),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(R,polyPath([[x,y],[x-side*50*g,y-40*g]],false),10,.95);s.stroke(Y,polyPath([[x,y],[x+side*70*g,y-30*g]],false),12,.95);
  if(age>0&&age<.28)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.28),width:10});
  const bx=x+side*220*u,by=y-12-160*4*u*(1-u);
  for(let i=1;i<6;i++){const v=u*i/6;s.fill(Y,polyPath(Array.from({length:8},(_,k)=>{const a=k/8*TAU;return[x+side*220*v+Math.cos(a)*7,y-12-160*4*v*(1-v)+Math.sin(a)*7] as Pt;}),true),.95);}
  finaleBall(s,bx,by,44,age*6+hash(seed,3)*TAU,{sq:0,dir:0});
 },
};
export default story;
