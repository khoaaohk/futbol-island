/** Iconic play film: Arjen Robben's 89th-minute winner, 2013 UEFA Champions League final, Borussia Dortmund 1–2 Bayern Munich, Wembley
 * Stadium, London, Saturday 25 May 2013 (kick-off 19:45 BST, so the goal comes at dusk under the floodlights).
 * A RisoStory (chapters mode) played unchanged by the card window and StoryFilmPlayer. Narration text:
 * public/plays/narration/robben-final-2013/script.json. The lead voices it later with local Kokoro; until then every chapter runs on
 * provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists
 * `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/robben-final-2013/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/robben-final-2013/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read for this film; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2013 UEFA Champions League final" (raw wikitext): date, Wembley, 86,298, referee Nicola Rizzoli, the line-ups and numbers,
 *    Mandžukić 60', Gündoğan pen 68', Robben 89'; "With a minute left in normal time, Ribéry played in Robben with a back-heeled pass; the
 *    Dutch forward burst past the defence and scuffed a weak, low shot past the onrushing Weidenfeller with his left foot from eight yards
 *    out"; the kit templates (Dortmund: yellow shirt with black stripes "_bvb_1213ch", black shorts "_pumaonblack2012" — the image was checked,
 *    yellow socks; Bayern: all red "_FCBAYERN_1314h"). Robben RW 10, Ribéry LW 7, Weidenfeller GK 1 (captain), Hummels 15, Subotić 4,
 *    Piszczek 26, Schmelzer 29.
 *  - BBC Sport, Phil McNulty, "Borussia Dortmund 1-2 Bayern Munich", 25 May 2013: Robben "showing great composure to take Franck Ribéry's
 *    flick in his stride in the 89th minute and beat Dortmund's outstanding keeper Roman Weidenfeller"; earlier Weidenfeller "denied Robben
 *    one-on-one before unwittingly blocking another effort from the eventual match-winner with his face"; the fans "splashed their yellow and
 *    red colours spectacularly across Wembley's canvas"; Robben in tears at the final whistle after losing the 2010 and 2012 finals.
 *  - The Guardian, Daniel Taylor, "Bayern Munich's Arjen Robben nets winner against Borussia Dortmund", 25 May 2013: "Robben set off through
 *    the middle, trying to get on the end of a backheel from Franck Ribéry, and benefited from a lucky ricochet off one of the defenders in
 *    close proximity. Suddenly Robben was free, bearing down on goal with only Weidenfeller to beat. Twice in the first half he had been in a
 *    similar position and come off second best. This time, he took his shot early, stabbing it to the goalkeeper's left … a prod of the ball
 *    that took it over the line almost in slow motion".
 *  - The Guardian, Paul Doyle, "Champions League final: Borussia Dortmund v Bayern Munich – as it happened", 89 min: "The goal came from a
 *    freekick hoofed into the box from the Bayern half. Ribéry beat Piszczek to it and flicked it on to Robben, who eluded Hummels and then
 *    did what he failed to do in the first half … guiding a low shot expertly beyond the reach of Weidenfeller."
 * CONFIRMED by those sources: 25 May 2013, Wembley, the first all-German Champions League final; 1–1 until the 89th minute; a long ball
 *  (a free kick, per the Guardian minute-by-minute) from Bayern's half; Ribéry (7) got to it ahead of Piszczek (26) and back-heeled /
 *  flicked it on; Robben (10) ran through the middle, a lucky ricochet off a Dortmund defender close by (Hummels, 15, the one he "eluded")
 *  left him free with only Weidenfeller (1, onrushing) to beat; he shot early, a low left-foot prod from about eight yards to the keeper's
 *  left that rolled over the line almost in slow motion; Robben had been denied twice one-on-one by Weidenfeller in the first half; Bayern
 *  won 2–1; the kits (Dortmund yellow with black stripes and black shorts, Bayern all red); both sets of fans in yellow and red.
 * INFERRED / ILLUSTRATIVE: every position, speed and time in metres/seconds; which foot Ribéry back-heeled with (right) and that the ball
 *  skipped past his right side; where the ricochet came off Hummels (his left boot, lunging); Robben's one push touch before the shot; which
 *  way Weidenfeller went down (spreading to his left, toward the shot); the other players' spots and who was on screen; the kicker of the
 *  long ball (drawn without a number); Weidenfeller's kit (printed blue: not verified), gloves, socks; Bayern's white trim; the referee's
 *  kit (dark); the ball (the adidas Finale Wembley, printed white with navy stars); which end Bayern attacked and that the main camera sits
 *  on the south side with the arch over the far (north) stand; which end the red and the yellow fans filled; the dusk sky; the big screens'
 *  places; the celebration run (airplane arms toward the corner); every camera placement and lens.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 Ribéry's back-heel): ch1 = the live broadcast from the high main-stand camera (the bowl and the arch, the teams, 1-1 and
 * 89 on the big screen, the free kick, the heel, Robben through, the goal); ch2 = the TV slow-motion replay low from the side (he keeps
 * running into the space between two defenders, the ricochet, free); ch3 = the replay from low behind the goal (Weidenfeller rushes out,
 * the calm early left-foot prod, the slow roll over the line, the celebration); ch4 = the lesson (after a miss stay brave, keep running
 * into space, finish calmly). Seams are forward passages into the ball / Robben. Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe), a lens that widens for a square window (1.45:1 … 1:1).
 * Inks: yellow (Dortmund, floodlights, grass under blue, cue marks), red (Bayern, Wembley's seats, crowd), blue (grass, dusk sky, keeper),
 * navy (night, key line, Dortmund's black). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is
 * seeded. Budget ≈ 150–300 plate ops per frame; wide-shot figures print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,keyPoses,posed,runCycle,stand,strike,keeperSet,keeperDive,lunge,celebrate,STRIKE_CONTACT,
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
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/(\.\.\.|[,;:])$/.test(w)?.2:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`robben film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py robben-final-2013 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/robben-final-2013/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Wembley, live','Wembley, 2013, the Champions League final: Bayern in red, Dortmund in yellow, one-all, last minute. Arjen Robben has missed two chances. A long ball, Ribéry\'s back-heel, and Robben runs through... goal!',
  ['Wembley','the Champions League final','Bayern','red','Dortmund','yellow','one-all','last minute','Arjen Robben','missed two chances','A long ball','Ribéry\'s back-heel','runs through','goal']),
 prov('Into the space','Watch again, slowly. Robben keeps running into the space between defenders. The ball bounces off one, and he\'s free.',
  ['Watch again','slowly','keeps running','the space','between defenders','bounces off one','free']),
 prov('The calm finish','Keeper Weidenfeller rushes out. Robben stays calm and pokes it early with his left foot. It rolls in, slowly... Bayern win!',
  ['Keeper Weidenfeller','rushes out','stays calm','pokes it early','left foot','rolls in','slowly','Bayern win']),
 prov('Your turn','Your turn: missed a chance? Stay brave. Keep running into space, and when the chance comes, finish calmly.',
  ['Your turn','missed a chance','Stay brave','Keep running','into space','the chance comes','finish calmly']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`robben film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;screen?:{min:string;hot?:number}};
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
 if(o.screen)for(const sc of SCREENS)screen(s,c,sc,o.screen.min);
 goal(s,c,o.net);
 drawIn();
}
/** a big screen: a navy panel, the two badges' colours (Dortmund yellow/navy, Bayern red/paper), the score 1-1 and the minute */
function screen(s:Sheet,c:Camera,sc:typeof SCREENS[number],min:string){
 const C:V3=[sc.x,(sc.y0+sc.y1)/2,0];if(depthOf(c,C)<4||dot(sub(c.eye,C),[sc.dir,0,0])<=0)return;
 const at=(u:number,v:number):V3=>[sc.x,lerp(sc.y1,sc.y0,v),lerp(sc.z0,sc.z1,sc.dir<0?u:1-u)];
 const quad=(u0:number,v0:number,u1:number,v1:number)=>{const q=[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1)];for(const p of q)if(depthOf(c,p)<NEAR)return[] as Pt[];return q.map(p=>P(c,p));};
 const panel=new Path2D();addPoly(panel,quad(0,0,1,1));s.knockout(panel);s.fill(K,panel,.95);
 const yel=new Path2D(),red=new Path2D(),pap=new Path2D();
 addPoly(yel,quad(.05,.12,.2,.48));addPoly(red,quad(.8,.12,.95,.48));addPoly(pap,quad(.84,.24,.91,.36));
 const glyphs=(str:string,u0:number,v0:number,gw:number,gh:number,path:Path2D)=>{[...str].forEach((ch,ci)=>{for(const sg of DIGITS[ch]??''){const[[x0,y0],[x1,y1]]=SEGS[sg],th=.3,hx=x1===x0?th/2:0,hy=y1===y0?th/2:0,ex=x1===x0?0:th/2,ey=y1===y0?0:th/2,ox=u0+ci*gw*1.5;
   addPoly(path,quad(ox+(x0-hx-ex)*gw,v0+(y0-hy-ey)*gh/2,ox+(x1+hx+ex)*gw,v0+(y1+hy+ey)*gh/2));}});};
 glyphs('1-1',.3,.12,.11,.36,pap);glyphs(min,.4,.62,.08,.26,yel);
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
const ROBBEN:AthleteStyle=FCB(10,{hair:null,hairStyle:'bald',build:{height:1.8,bulk:.95},seed:10});
const RIBERY:AthleteStyle=FCB(7,{hair:K,build:{height:1.7,bulk:1},seed:7});
const HUMMELS:AthleteStyle=BVB(15,{hair:[K,.85],build:{height:1.91,bulk:1.02}});
const SUBOTIC:AthleteStyle=BVB(4,{hair:K,build:{height:1.93,bulk:1}});
const PISZCZEK:AthleteStyle=BVB(26,{hair:[K,.8],build:{height:1.84}});
/** the referee: dark kit (inferred) */
const REF:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.9],trim:Y,boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** lesson versions: Robben keeps his red, everyone else a pale ghost */
const ghost=(st:AthleteStyle):AthleteStyle=>({...st,shirt:[Y,.45],pattern:'plain',shorts:[K,.3],socks:[Y,.45],trim:K,skin:[[Y,.3]],hair:[K,.5],shade:[K,.14],numberInk:K,gloves:st.gloves?[Y,.6]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Ribéry's back-heel) =================
const RB:Build=ROBBEN.build!,WB:Build=WEIDENFELLER.build!,IB:Build=RIBERY.build!,HB:Build=HUMMELS.build!;
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
function jointSpot(pt:[number,number],yaw:number,pose:Pose,build:Build,j:'lToe'|'rToe'|'rHeel'):[number,number]{const sk=solve(pose,build,{yaw}),t=sk[j];return[pt[0]-t[0],pt[1]-t[2]];}

// ---- the long ball (a free kick from Bayern's half; the kicker is drawn without a number) and Ribéry's back-heel ----
const LAUNCH:[number,number]=[-58.5,6.5],TL0=-2.95;// the free kick leaves at τ = TL0
const HEELP:[number,number]=[-20.9,-3.1];// the ball at Ribéry's right heel, τ = 0
const BOUNCE:[number,number]=[-23.6,-3.35],TBO=-.5;// the long ball's bounce
/** Ribéry's back-heel (right foot): back to goal, the ball skips past his right side, the right heel flicks back at HEEL_T */
const HEEL_T=.55,HEEL_DUR=.9;
function heelFlick(t:number):Pose{return keyPoses(clamp(t),[
 [0,posed({lHipF:16,rHipF:14,lKnee:30,rKnee:28,lean:14,pitch:4,lShA:34,rShA:34,lShF:10,rShF:10,lElb:44,rElb:44,neckP:24,neckY:-24})],
 [.32,posed({lHipF:24,lKnee:40,rHipF:20,rKnee:34,rHipA:10,lean:18,pitch:5,lShA:44,rShA:52,lShF:14,rShF:-6,lElb:40,rElb:36,neckP:32,neckY:-40,twist:-10})],
 [HEEL_T,posed({lHipF:22,lKnee:38,rHipF:-40,rKnee:66,rAnk:-10,rHipA:6,rHipR:-14,lean:26,pitch:8,lShA:40,rShA:62,lShF:28,rShF:-24,lElb:42,rElb:30,neckP:34,neckY:-52,twist:-16,squash:-.03})],
 [.78,posed({lHipF:18,lKnee:30,rHipF:-18,rKnee:44,lean:16,pitch:4,lShA:34,rShA:44,lShF:14,rShF:-6,lElb:44,rElb:40,neckP:10,neckY:-30,twist:-6})],
 [1,posed({lHipF:14,rHipF:12,lKnee:24,rKnee:24,lean:10,lShA:26,rShA:26,lElb:44,rElb:44,neckP:4,neckY:-20})],
]);}
const RIB_YAW=Math.PI*.97;
const RIBP=jointSpot(HEELP,RIB_YAW,heelFlick(HEEL_T),IB,'rHeel');
// ---- the ricochet off Hummels's lunging left boot (the defender "in close proximity") into Robben's path ----
const RIC=.5;// τ of the ricochet
const RICP:[number,number]=[-16.3,-.75];
const HUM_YAW=YAW(HEELP[0]-RICP[0],HEELP[1]-RICP[1]);
const HUM_LUNGE=(u:number)=>lunge(u,{side:'l'}),HUM_T0=RIC-.6*.7;
const HUMP=jointSpot(RICP,HUM_YAW,HUM_LUNGE(.6),HB,'lToe');
// ---- Robben: the run through the middle, one push touch with his LEFT foot, the early left-foot prod, the roll ----
const T1:[number,number]=[-12.5,.35],T1T=1.02;// his touch
const TS=1.78;// the shot
const B_S:[number,number]=[-7.7,-.45];// the ball at the shot (≈ 8 yards out)
const RTOUCH=(u:number)=>strike(u,{foot:'l',power:.15});
const RSTRIKE=(u:number)=>strike(u,{foot:'l',power:.38});
// ---- Weidenfeller: rushes out, then goes down spreading to his left — a fraction late ----
const C_AT:[number,number]=[-4.7,-1.95];
const YC=YAW(B_S[0]-C_AT[0],B_S[1]-C_AT[1]);
const CPLACE:Place={x:C_AT[0],z:C_AT[1],yaw:YC};
/** a rushing keeper's spread, not a full-length dive: half the sideways travel of keeperDive */
const DIVE=(u:number)=>{const p=keeperDive(u,{side:'l',height:0});p.dz*=.5;return p;},DIVE_DUR=.95,DIVE0=TS-.12;
const DIVE_SKS=[.55,.75,1].map(u=>solve(DIVE(u),WB,CPLACE));
/** the ball slips past the reach of his left side (world +z) */
const REACH=DIVE_SKS.flatMap(k=>[k.lHa,k.rHa,k.lToe,k.rToe,k.head]).reduce((a,b)=>b[2]>a[2]?b:a);
const PASSZ=REACH[2]+1,GZ=clamp(B_S[1]+(PASSZ-B_S[1])*(0-B_S[0])/(REACH[0]-B_S[0]),.9,3.1);
const LINE:V3=[0,.11,GZ],NETB:V3=[1.75,.16,GZ+.3],REST:V3=[1.55,.11,GZ+.25];
const TG=TS+1.3;// the ball crosses the line, "almost in slow motion"
const YR=YAW(LINE[0]-B_S[0],LINE[2]-B_S[1]);
const RFP=jointSpot(B_S,YR,RSTRIKE(STRIKE_CONTACT),RB,'lToe');
const YT1=YAW(B_S[0]-T1[0],B_S[1]-T1[1]);
const RT1=jointSpot(T1,YT1,RTOUCH(STRIKE_CONTACT),RB,'lToe');
const [rfx,rfz]=dirOf(YR);
const RB_P:MKey[]=[[-4,-33.4,11],[TL0,-33,10.6],[-1.5,-27.6,7.6],[0,-22.4,4.6],[.55,-18.4,2.3],[T1T,RT1[0],RT1[1]],[TS-.35,RFP[0]-rfx*1.9,RFP[1]-rfz*1.9],[TS,RFP[0],RFP[1]],[TS+.5,RFP[0]+rfx*1.9,RFP[1]+rfz*1.9],[TS+1.3,-4.4,2.6],[TS+2.4,-4,7.5],[TS+4,-3.6,14.5],[TS+6,-3.2,22]];
function ballAt(tau:number):V3{
 if(tau<TL0)return[LAUNCH[0],.11,LAUNCH[1]];
 if(tau<TBO){const u=(tau-TL0)/(TBO-TL0);return[lerp(LAUNCH[0],BOUNCE[0],u),.11+22*u*(1-u),lerp(LAUNCH[1],BOUNCE[1],u)];}
 if(tau<0){const u=(tau-TBO)/-TBO;return[lerp(BOUNCE[0],HEELP[0],u),.11+.55*Math.sin(Math.PI*u)*(1-.3*u),lerp(BOUNCE[1],HEELP[1],u)];}
 if(tau<RIC){const u=tau/RIC;return[lerp(HEELP[0],RICP[0],u),.11,lerp(HEELP[1],RICP[1],u)];}
 if(tau<T1T){const u=easeOut((tau-RIC)/(T1T-RIC))*.85+.15*(tau-RIC)/(T1T-RIC);return[lerp(RICP[0],T1[0],u),.11+.35*Math.sin(Math.PI*u)*(1-u),lerp(RICP[1],T1[1],u)];}
 if(tau<TS){const u=(tau-T1T)/(TS-T1T),e=u*(1.25-.25*u);return[lerp(T1[0],B_S[0],e),.11,lerp(T1[1],B_S[1],e)];}
 if(tau<TG){const u=(tau-TS)/(TG-TS),f=1-Math.pow(1-u,1.6);return[lerp(B_S[0],LINE[0],f),.11,lerp(B_S[1],LINE[2],f)];}
 if(tau<TG+.55){const u=(tau-TG)/.55;return mix3(LINE,NETB,u*(2-u));}
 return mix3(NETB,REST,clamp((tau-TG-.55)/.4));}
const netPush=(tau:number)=>(p:V3):V3=>{const a=tau-TG-.4;if(a<=0)return p;const d=Math.hypot(p[1]-.25,(p[2]-GZ)*.8),w=.28*Math.exp(-a*2.2)*Math.exp(-d*d*1.4)*(p[0]>1?1:p[0]/1);return[p[0]+w,p[1],p[2]];};
function robbenAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(RB_P,tau,ballAt(tau),2);
 if(tau>T1T-.3&&tau<T1T+.3){const u=clamp((tau-T1T)/.6+STRIKE_CONTACT),w=Math.sin(clamp((tau-T1T+.3)/.6)*Math.PI);r.pose=blendPose(r.pose,RTOUCH(u),w*.85);r.place.yaw=lerpAng(r.place.yaw??0,YT1,w);}
 if(tau>TS-.55&&tau<TS+.6){const u=clamp((tau-TS)/1.05+STRIKE_CONTACT),w=Math.sin(clamp((tau-TS+.55)/1.15)*Math.PI);r.pose=blendPose(r.pose,RSTRIKE(u),w);r.place.yaw=lerpAng(r.place.yaw??0,YR,w);}
 if(tau>TG-.1){const w=sm(TG-.1,TG+.5,tau);r.pose=blendPose(r.pose,celebrate(tau*.9,{kind:'run'}),w);}
 return r;}
const CAS_P:MKey[]=[[-4,-1.6,0],[0,-2,-.3],[.6,-2.7,-.7],[1.3,-3.9,-1.15],[DIVE0,C_AT[0],C_AT[1]]];
function keeperAt(tau:number):{pose:Pose;place:Place}{
 if(tau>=DIVE0)return{pose:DIVE((tau-DIVE0)/DIVE_DUR),place:CPLACE};
 const b=ballAt(tau),r=runner(CAS_P,tau,b,5,keeperSet(tau*1.6));
 if(tau>DIVE0-.25){const u=sm(DIVE0-.25,DIVE0,tau);r.pose=blendPose(r.pose,DIVE(0),u);r.place={x:lerp(r.place.x??0,C_AT[0],u),z:lerp(r.place.z??0,C_AT[1],u),yaw:lerpAng(r.place.yaw??0,YC,u)};}
 return r;}
const RIB_P:MKey[]=[[-4,RIBP[0]-.9,RIBP[1]-1.1],[-.5,RIBP[0],RIBP[1]],[.6,RIBP[0],RIBP[1]],[2,RIBP[0]+2.6,RIBP[1]+1.2],[4,RIBP[0]+6.5,RIBP[1]+2.6]];
function riberyAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(RIB_P,tau,ballAt(tau),7);
 if(tau<.6)r.place.yaw=lerpAng(RIB_YAW,r.place.yaw??0,sm(.3,.6,tau));
 const t0=-HEEL_T*HEEL_DUR;if(tau>t0-.25&&tau<t0+HEEL_DUR+.3){const u=clamp((tau-t0)/HEEL_DUR),w=Math.min(sm(t0-.25,t0,tau),1-sm(t0+HEEL_DUR,t0+HEEL_DUR+.3,tau));r.pose=blendPose(r.pose,heelFlick(u),w);}
 return r;}
const HUM_P:MKey[]=[[-4,HUMP[0]-1.4,HUMP[1]-.9],[-.4,HUMP[0]-.3,HUMP[1]-.2],[HUM_T0,HUMP[0],HUMP[1]],[HUM_T0+.7,HUMP[0],HUMP[1]],[1.8,HUMP[0]+3.4,HUMP[1]+.9],[3.2,-7.6,.4],[5,-3.6,1.4]];
function hummelsAt(tau:number):{pose:Pose;place:Place}{
 const r=runner(HUM_P,tau,ballAt(tau),9);
 if(tau>HUM_T0-.2&&tau<HUM_T0+.95){const u=clamp((tau-HUM_T0)/.7),w=Math.min(sm(HUM_T0-.2,HUM_T0,tau),1-sm(HUM_T0+.7,HUM_T0+.95,tau));r.pose=blendPose(r.pose,HUM_LUNGE(u),w);r.place.yaw=lerpAng(r.place.yaw??0,HUM_YAW,w);}
 return r;}
/** the free kick taker (not named in the sources): a Bayern player in his own half */
const KICK_Y=YAW(BOUNCE[0]-LAUNCH[0],BOUNCE[1]-LAUNCH[1]);
const KFP=jointSpot(LAUNCH,KICK_Y,strike(STRIKE_CONTACT,{power:.9}),{height:1.9},'rToe');
const [kfx,kfz]=dirOf(KICK_Y);
const KICK_P:MKey[]=[[-4.2,KFP[0]-kfx*2.6,KFP[1]-kfz*2.6],[TL0-.7,KFP[0]-kfx*2.6,KFP[1]-kfz*2.6],[TL0,KFP[0],KFP[1]],[TL0+.8,KFP[0]+kfx*1.2,KFP[1]+kfz*1.2],[3,KFP[0]+kfx*6,KFP[1]+kfz*4]];

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const KICKER=FCB(null,{hair:K,build:{height:1.9},seed:17});
const ACTORS:Actor[]=[
 {style:KICKER,at:(t,b)=>{const r=runner(KICK_P,t,b,1);if(t<TL0-.7)r.place.yaw=KICK_Y;
  if(t>TL0-.7&&t<TL0+.7){const u=clamp((t-TL0)/1.2+STRIKE_CONTACT),w=Math.sin(clamp((t-TL0+.7)/1.4)*Math.PI);r.pose=blendPose(r.pose,strike(u,{power:.9}),w);r.place.yaw=lerpAng(r.place.yaw??0,KICK_Y,w);}return r;}},
 {style:HUMMELS,at:(t)=>hummelsAt(t)},// Mats Hummels (the ricochet)
 mover(SUBOTIC,[[-4,-17.4,5.4],[0,-17,4.4],[.8,-15.4,3.4],[TS,-10.4,2.1],[TG,-3.2,2.5],[TG+1,-1.2,2.9]],3),// Neven Subotić, chasing back
 mover(PISZCZEK,[[-4,-19.6,-4.6],[-.4,-19.9,-4.2],[0,-19.9,-4.2],[1,-18.6,-3.6],[3,-13.4,-2]],4),// Łukasz Piszczek, beaten to it by Ribéry
 mover(BVB(29,{hair:[K,.7]}),[[-4,-18.8,11.5],[TS,-12.6,7.4],[TG+1,-8,5]],6),// Marcel Schmelzer
 mover(BVB(6,{hair:[Y,.7],build:{height:1.85}}),[[-4,-23.8,-.8],[TS,-17.2,.2]],8),// Sven Bender
 mover(BVB(8,{hair:K}),[[-4,-25.2,7.2],[TS,-19.6,5]],12),// İlkay Gündoğan
 mover(BVB(16,{hair:[K,.8]}),[[-4,-29,-13.5],[TS,-22,-9]],13),// Jakub Błaszczykowski
 mover(BVB(19,{hair:K}),[[-4,-30.5,16],[TS,-23.5,12]],14),// Kevin Großkreutz
 mover(BVB(11,{hair:[Y,.8]}),[[-4,-34.5,3],[TS,-27,2.5]],15),// Marco Reus
 mover(FCB(25,{hair:[K,.6]}),[[-4,-20.6,1.9],[0,-19.4,1.1],[TS,-11.6,-2.3],[TG,-6.6,-1.8]],16),// Thomas Müller
 mover(FCB(9,{hair:K,build:{height:1.9}}),[[-4,-19.9,-8.6],[TS,-12.2,-6],[TG,-7,-4]],18),// Mario Mandžukić
 mover(FCB(31,{hair:[Y,.8]}),[[-4,-40,-3],[TS,-31,-2]],19),// Bastian Schweinsteiger
 mover(FCB(8,{hair:K,build:{height:1.9}}),[[-4,-44,5],[TS,-35,4]],20),// Javi Martínez
 mover(REF,[[-4,-36,-10],[TS,-26,-8]],21),// Nicola Rizzoli
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([ROBBEN,WEIDENFELLER,RIBERY,HUMMELS]);
/** everyone and the ball at τ, depth sorted. `hero` smears Robben; `prev` gives every figure its secondary motion; `cap` limits figure
 * detail (passages); small figures in wide shots print at 'low'. `styleOf` swaps kits (the lesson's ghosts). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean;styleOf?:(st:AthleteStyle)=>AthleteStyle;maxDepth?:number;nearCull?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt),sty=o.styleOf??(x=>x);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:(o.nearCull??3.4)))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if((o.cap&&!hero&&hPx<34)||(!hero&&d>(o.maxDepth??1e9)))return;const detail:Detail|undefined=hPx<62||(!hero&&hPx<(o.cap?150:120))?'low':o.cap||!hero?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,sty(style),st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const rob=robbenAt(tp),gk=keeperAt(tp),rib=riberyAt(tp);
 put(ROBBEN,rob,robbenAt(tp-dt),!!o.hero);put(WEIDENFELLER,gk,keeperAt(tp-dt),!!o.hero);put(RIBERY,rib,riberyAt(tp-dt));
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  finaleBall(s,q[0],q[1],r,tau*7,{sq:clamp(sp/(r*3),0,.6),dir:Math.atan2(dy,dx),duo:!!o.styleOf});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,rob,gk,rib};}
/** a red X (a missed chance) */
function redX(s:Sheet,x:number,y:number,r:number,g:number){if(g<=.02)return;const w=Math.max(4,r*.3),p=new Path2D();p.addPath(ribbon([[x-r*g,y-r*g],[x+r*g,y+r*g]],w,{taper:.1,wobble:.5,seed:3}));p.addPath(ribbon([[x+r*g,y-r*g],[x-r*g,y+r*g]],w,{taper:.1,wobble:.5,seed:4}));inkMark(s,R,p,.95);}
/** a dashed ground arrow along a list of ground points (x, z), drawn to `u` of its length */
function groundArrow(s:Sheet,c:Camera,pts:[number,number][],u:number,w:number,ink=Y){if(u<=.02)return;const q:Pt[]=[];for(const p of pts){const g:V3=[p[0],.03,p[1]];if(depthOf(c,g)<NEAR+.2)continue;q.push(P(c,g));}if(q.length<2)return;
 const n=Math.max(2,Math.round(q.length*u)),seg=q.slice(0,n),last=pts[Math.min(pts.length-1,n-1)],wd=Math.max(5,w*kAt(c,[last[0],0,last[1]]));
 const path=ribbon(seg,wd,{taper:.1,wobble:.6,gaps:dashes(.1,.06)}),a=seg[seg.length-2],b=seg[seg.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=wd*2.2;
 path.addPath(polyPath([[b[0]+ux*z*1.3,b[1]+uy*z*1.3],[b[0]-uy*z,b[1]+ux*z],[b[0]+uy*z,b[1]-ux*z]],true));inkMark(s,ink,path,.95);}
const robPath=(t0:number,t1:number,n=14):[number,number][]=>Array.from({length:n+1},(_,i)=>{const q=pathPos(RB_P,lerp(t0,t1,i/n));return[q.x,q.z];});
/** the space between Hummels and Subotić as Robben arrives: a yellow dashed lozenge on the grass */
function spaceZone(s:Sheet,c:Camera,tau:number,g:number){if(g<=.02)return;const h=hummelsAt(Math.min(tau,.35)).place,sb=ACTORS[2].at(Math.min(tau,.35),ballAt(tau)).place,cx=((h.x??0)+(sb.x??0))/2+.6,cz=((h.z??0)+(sb.z??0))/2,rz=Math.abs((sb.z??0)-(h.z??0))/2-.55;
 const pts=groundRing(c,cx,cz,1.6*g,28,rz*g);if(pts.length<3)return;s.tone(Y,polyPath(pts,true),.35*g);inkMark(s,Y,ribbon(pts,Math.max(4,.07*kAt(c,[cx,0,cz])),{close:true,taper:0,wobble:.6,gaps:dashes(.07,.04)}),.95);}

// ================= chapter 1 (live): the high main-stand camera =================
const ch1q=()=>({wm:T(0,'Wembley'),cl:T(0,'the Champions League final'),by:T(0,'Bayern'),rd:T(0,'red'),bv:T(0,'Dortmund'),yl:T(0,'yellow'),oa:T(0,'one-all'),lm:T(0,'last minute'),ar:T(0,'Arjen Robben'),mc:T(0,'missed two chances'),lb:T(0,'A long ball'),rh:T(0,'Ribéry\'s back-heel'),rt:T(0,'runs through'),go:T(0,'goal'),end:SEC(0)});
/** the match clock: the free kick is set until "A long ball", the heel lands on "back-heel", the ball crosses the line on "goal" */
const tau1=(t:number)=>{const q=ch1q(),kick=Math.max(q.mc+.6,q.lb-.3),heel=Math.max(q.rh+.3,kick+1.6),g=Math.max(q.go,heel+1.6);
 return key(t,mono([[0,-5.2],[kick,TL0],[heel,0],[g,TG],[q.end,TG+(q.end-g)*.9]]),x=>x);};
const BCAM:V3=[-36,21,52];
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-56,30,64],[q.cl,-50,27,60],[q.bv+.4,BCAM[0],BCAM[1],BCAM[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the free kick the director's camera follows the words: the bowl and arch → Bayern → Dortmund → the big screen → Robben */
function ch1Pre(t:number):V3{const q=ch1q(),rb=robbenAt(-4).place,v=key(t,mono([[0,CX,28,-30],[q.cl,CX+6,14,-10],[q.by-.1,-26,1,-2],[q.bv+.2,-22,1,2],[q.yl+.45,-22,1,2],[q.oa+.1,SCREEN_C[0],SCREEN_C[1]-1,0],[q.lm+.4,SCREEN_C[0],SCREEN_C[1]-1.4,0],[q.ar-.2,(rb.x??0)+2,1,(rb.z??0)-2],[q.mc+.4,(rb.x??0)+4,1,rb.z??0]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<TS-.6)return[b[0]+3,Math.min(b[1],6)*.5+.8,b[2]*.6];
 return mix3([lerp(b[0],C_AT[0],.4),1,lerp(b[2],C_AT[1],.4)],[-5,1,4],sm(TG+.2,TG+1.6,tau));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),w=sm(q.mc+.2,q.lb,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,760],[q.cl,900],[q.by-.1,2300],[q.bv+.2,2400],[q.yl+.45,2400],[q.oa+.1,4200],[q.lm+.4,4600],[q.ar-.2,3100],[q.mc+.4,3000],[q.lb,2800],[q.rh,3700],[q.rt+.3,4700],[q.go,5300],[q.end,4500]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings on "Bayern"/"red" and "Dortmund"/"yellow"; Robben's ring on "Arjen Robben" */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rr=sm(q.by,q.by+.3,t,easeOutBack)*(1-sm(q.bv,q.bv+.5,t)),ry=sm(q.bv,q.bv+.3,t,easeOutBack)*(1-sm(q.oa,q.oa+.5,t)),rrb=sm(q.ar,q.ar+.3,t,easeOutBack)*(1-sm(q.lb+.2,q.lb+.7,t));
 if(rr<.02&&ry<.02&&rrb<.02)return;const bp=ballAt(tp),pr=new Path2D(),py=new Path2D();
 const all=[...ACTORS.map(a=>({st:a.style,pl:a.at(tp,bp).place})),{st:ROBBEN,pl:robbenAt(tp).place},{st:RIBERY,pl:riberyAt(tp).place},{st:WEIDENFELLER,pl:keeperAt(tp).place}];
 for(const {st,pl} of all){if(st.shirt===R&&rr>.02)gRing(pr,c,pl.x??0,pl.z??0,.95*rr,.14);if(st.shirt===Y&&ry>.02)gRing(py,c,pl.x??0,pl.z??0,.95*ry,.14);}
 const rp=robbenAt(tp).place;if(rrb>.02)gRing(pr,c,rp.x??0,rp.z??0,1.35*rrb,.18);
 inkMark(s,R,pr,.95);yInk(s,py,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),after=tau-TG;frame(s);
  const hot=sm(q.oa+.1,q.oa+.5,t,easeOutBack)*(1-sm(q.ar,q.ar+.5,t));
  stadium(s,c,{t,cheer:.12+.9*sm(0,.4,after)*(1-sm(2.4,3.6,after)),flash:.12+.9*sm(0,.4,after),net:netPush(tau),screen:{min:'89'}},()=>{
   if(hot>.02){const p=P(c,SCREEN_C),k=kAt(c,SCREEN_C);yRing(s,p[0],p[1],Math.max(20,13*k*hot),Math.max(6,1.1*k));const lm=sm(q.lm,q.lm+.3,t,easeOutBack);if(lm>.02){const m=P(c,[SCREENS[0].x,37.6,1.6]);yRing(s,m[0],m[1],Math.max(12,3.6*k*lm),Math.max(5,.7*k),.95,R);}}
   teamRings(s,c,tp,t);
   // "runs through": a dashed yellow lane from Robben through the gap to the goal
   const th=sm(q.rt,q.rt+.35,tt,easeOut)*(1-sm(q.go-.1,q.go+.3,tt));if(th>.02)groundArrow(s,c,robPath(Math.max(tp,.2),TS,10),th,.2);
   const w=drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
   // "missed two chances": two red crosses pop over his head (Weidenfeller had denied him twice in the first half)
   const mc=sm(q.mc,q.mc+.3,tt,easeOutBack),mo=1-sm(q.lb-.1,q.lb+.4,tt);if(mc*mo>.02){const rp=w.rob.place,hd:V3=[rp.x??0,2.6,rp.z??0];if(depthOf(c,hd)>NEAR){const p=P(c,hd),k=kAt(c,hd);redX(s,p[0]-.45*k,p[1],.26*k,mc*mo);redX(s,p[0]+.45*k,p[1],.26*k,sm(q.mc+.35,q.mc+.65,tt,easeOutBack)*mo);}}
   // "back-heel": a spark at Ribéry's heel as it flicks the ball on
   if(tp>=-.05&&tp<.3){const p=P(c,[HEELP[0],.15,HEELP[1]]);sparkBurst(s,Y,p[0],p[1],50+40*sm(0,.1,tp,easeOut),{n:8,seed:3,g:1-sm(.1,.3,tp),width:9});}
   if(tp>=TG-.05&&tp<TG+.4){const p=P(c,LINE);sparkBurst(s,Y,p[0],p[1],60+60*sm(TG,TG+.1,tp,easeOut),{n:9,seed:4,g:1-sm(TG+.15,TG+.4,tp),width:10});}
  });},
 aperture(t){const c=ch1Cam(t),rp=robbenAt(tau1(t)).place,g:V3=[rp.x??0,1.1,rp.z??0],[x,y]=P(c,g);return apertureDisc(x,y,clamp(.6*kAt(c,g),16,140),12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low from the side): the run into the space, the ricochet, free =================
const ch2q=()=>({wa:T(1,'Watch again'),sl:T(1,'slowly'),kr:T(1,'keeps running'),ts:T(1,'the space'),bd:T(1,'between defenders'),bo:T(1,'bounces off one'),fr:T(1,'free'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q(),bo=Math.max(q.bo+.25,q.bd+.6);return key(t,mono([[0,-.9],[q.kr,-.25],[q.bd,.25],[bo,RIC],[q.fr+.2,T1T+.05],[q.end,T1T+.45]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),rp=robbenAt(tau).place,b=ballAt(tau),mid:V3=[lerp(rp.x??0,b[0],.45)+1.2,.95,lerp(rp.z??0,b[2],.45)];
 const orbit=sm(0,q.end,t,easeInOutSine),pos:V3=[mid[0]-4.5+3*orbit,1.35-.15*orbit,mid[2]+12.5-2.5*orbit];
 const F=key(t,mono([[0,1150],[q.sl,1250],[q.kr,1350],[q.bd+.3,1250],[q.bo,1500],[q.fr+.3,1700],[q.end,1600]]),easeInOutSine);return cam(pos,mid,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.06,screen:{min:'89'}},()=>{
   // "keeps running": the dashed arrow of his run, drawn ahead of him through the gap
   const kr=sm(q.kr,q.kr+.5,tt,easeOut)*(1-sm(q.fr,q.fr+.4,tt));groundArrow(s,c,robPath(Math.max(-1.5,tp-.5),T1T+.1,14),kr,.16);
   // "the space": the gap between the two centre-backs
   spaceZone(s,c,tp,sm(q.ts,q.ts+.35,tt,easeOutBack)*(1-sm(q.bo,q.bo+.4,tt)));
   const w=drawWorld(s,c,tau,tp,{ballMin:18,hero:true,prev:true,nearCull:8,glow:sm(q.fr,q.fr+.3,tt)*(1-sm(q.end-.9,q.end-.5,tt)),cap:t>q.end-.7});
   // "between defenders": blue rings on Hummels and Subotić
   const bd=sm(q.bd,q.bd+.3,tt,easeOutBack)*(1-sm(q.fr,q.fr+.4,tt));if(bd>.02){const p=new Path2D(),h=hummelsAt(tp).place,sb=ACTORS[2].at(tp,ballAt(tp)).place;gRing(p,c,h.x??0,h.z??0,1*bd,.1);gRing(p,c,sb.x??0,sb.z??0,1*bd,.1);inkMark(s,B,p,.95);}
   // "bounces off one": sparks where the ball ricochets off Hummels's boot
   if(tp>=RIC-.03&&tp<RIC+.3){const p=P(c,[RICP[0],.14,RICP[1]]);sparkBurst(s,Y,p[0],p[1],90+80*sm(RIC,RIC+.08,tp,easeOut),{n:10,seed:6,g:1-sm(RIC+.1,RIC+.3,tp),width:11});}
   // "free": a big yellow ring round Robben on the grass
   const fr=sm(q.fr,q.fr+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(fr>.02){const p=new Path2D(),rp=w.rob.place;gRing(p,c,rp.x??0,rp.z??0,1.4*fr,.12);yInk(s,p,.95);}
  });
  if(t<.45){const v=1-t/.45;speedLines(s,K,0,0,0,{n:9,seed:21,len:900*v,spread:700,width:18,cov:.5*v});}},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from low behind the goal): the keeper rushes out, the calm early prod, the slow roll, Bayern win =================
const ch3q=()=>({kw:T(2,'Keeper Weidenfeller'),ro:T(2,'rushes out'),sc:T(2,'stays calm'),pe:T(2,'pokes it early'),lf:T(2,'left foot'),ri:T(2,'rolls in'),sl:T(2,'slowly'),bw:T(2,'Bayern win'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,T1T-.35],[q.ro,T1T+.05],[q.sc,TS-.4],[q.pe+.25,TS],[q.lf+.2,TS+.12],[q.ri,TS+.45],[q.sl+.3,TS+.95],[q.bw,TG+.2],[q.end,TG+.2+(q.end-q.bw)*.85]]),x=>x);};
const GCAM:V3=[4.2,1.4,7.6];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(tau),rp=robbenAt(tau).place,gp=keeperAt(tau).place;
 const toBall=sm(q.pe,q.ri+.3,t,easeInOutSine),toRob=sm(q.bw-.2,q.bw+.8,t,easeInOutSine);
 const look0:V3=[lerp(rp.x??0,gp.x??0,.45),.95,lerp(rp.z??0,gp.z??0,.45)],look1:V3=[b[0]-1.5,.6,b[2]-.3],look2:V3=[rp.x??0,1,rp.z??0];
 const look=mix3(mix3(look0,look1,toBall*.6),look2,toRob),pos:V3=add(GCAM,[.3*toRob,.4*toRob,-.8*toBall+1.5*toRob]);
 const F=key(t,mono([[0,2100],[q.kw,2200],[q.ro,2300],[q.sc,2800],[q.pe,3000],[q.lf+.2,3300],[q.ri,2500],[q.sl+.4,2300],[q.bw,2000],[q.end,2400]]),easeInOutSine);return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt);
  const inT=q.bw-.35,shake=t>=inT?5*settle(t,inT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.9*sm(TG,TG+.4,tp),flash:.08+.8*sm(TG,TG+.4,tp),net:netPush(tau)},()=>{
   // "rushes out": the keeper's dashed run off his line
   const ro=sm(q.ro,q.ro+.4,tt,easeOut)*(1-sm(q.pe,q.pe+.4,tt));groundArrow(s,c,Array.from({length:9},(_,i)=>{const p=pathPos(CAS_P,lerp(0,DIVE0,i/8));return[p.x,p.z] as [number,number];}),ro,.12,B);
   // "rolls in" / "slowly": the ball's path to the corner as yellow dots, left behind as it rolls
   const ri=sm(q.ri-.05,q.ri+.3,tt)*(1-sm(q.bw+.4,q.bw+.8,tt));if(ri>.02&&tp>TS){const dots=new Path2D();for(let i=0;i<=14;i++){const tb=lerp(TS,Math.min(tp,TG+.3),i/14),p=ballAt(tb);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,[p[0],.03,p[2]]),r=Math.max(3,.05*kAt(c,p)*ri);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}yInk(s,dots,.95);}
   const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const rs=solve(w.rob.pose,RB,w.rob.place),gs=solve(w.gk.pose,WB,w.gk.place);
   // "Keeper Weidenfeller": a ring round him
   const kw=sm(q.kw,q.kw+.3,tt,easeOutBack)*(1-sm(q.sc,q.sc+.4,tt));if(kw>.02){const p=new Path2D();gRing(p,c,gs.pelvis[0],gs.pelvis[2],1.1*kw,.1);inkMark(s,B,p,.95);}
   // "stays calm": a steady yellow level line under his eyes and a ring round his head — no panic, head still
   const sc=sm(q.sc,q.sc+.35,tt,easeOutBack)*(1-sm(q.lf+.3,q.lf+.7,tt));if(sc>.02&&depthOf(c,rs.head)>NEAR+.3){const h=P(c,rs.head),k=kAt(c,rs.head);yRing(s,h[0],h[1],.3*k*sc,Math.max(4,.035*k));const lv=new Path2D();lv.addPath(ribbon([[h[0]-.75*k*sc,h[1]+.34*k],[h[0]+.75*k*sc,h[1]+.34*k]],Math.max(4,.03*k),{taper:.3,wobble:.4}));yInk(s,lv,.95);}
   // "pokes it early": sparks off his left boot at contact
   if(tp>=TS-.02&&tp<TS+.22){const p=P(c,rs.lToe);sparkBurst(s,Y,p[0],p[1],60+60*sm(TS,TS+.08,tp,easeOut),{n:8,seed:5,g:1-sm(TS+.08,TS+.22,tp),width:9});}
   // "left foot": a red ring round his left boot
   const lf=sm(q.lf,q.lf+.3,tt,easeOutBack)*(1-sm(q.ri,q.ri+.4,tt));if(lf>.02&&depthOf(c,rs.lToe)>NEAR+.3){const p=P(c,rs.lToe),k=kAt(c,rs.lToe);yRing(s,p[0],p[1],.3*k*lf,Math.max(5,.04*k),.95,R);}
   // the ball over the line: a yellow spark on the line
   if(tp>=TG-.03&&tp<TG+.35){const p=P(c,LINE);sparkBurst(s,Y,p[0],p[1],80+80*sm(TG,TG+.1,tp,easeOut),{n:10,seed:8,g:1-sm(TG+.12,TG+.35,tp),width:11});}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),rp=robbenAt(tau).place,g:V3=[rp.x??0,1.1,rp.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.4,
};

// ================= chapter 4 (the lesson): after a miss, stay brave — keep running into space — finish calmly =================
const ch4q=()=>({yt:T(3,'Your turn'),mc:T(3,'missed a chance'),sb:T(3,'Stay brave'),kr:T(3,'Keep running'),is:T(3,'into space'),cc:T(3,'the chance comes'),fc:T(3,'finish calmly'),end:SEC(3)});
/** lesson clock: the run on "Keep running", through the space on "into space", the touch on "the chance comes", the prod on "finish calmly" */
const tau4=(t:number)=>{const q=ch4q(),fc=Math.max(q.fc+.35,q.cc+1);return key(t,mono([[0,-1.2],[q.kr,-.3],[q.is+.3,.55],[q.cc+.3,T1T],[fc,TS],[q.end,TS+.9]]),x=>x);};
function LCAM(t:number){const q=ch4q(),tau=tau4(t),rp=robbenAt(tau).place,x=rp.x??0,z=rp.z??0,push=sm(q.fc-.4,q.fc+.4,t,easeInOutSine);
 const pos:V3=[x+5.2-1.2*push,1.2,z+4.4+1.2*push],look:V3=[x+.9+.8*push,.95,z-.3];return cam(pos,look,key(t,mono([[0,1500],[q.sb,1700],[q.kr,1500],[q.cc,1700],[q.fc,1500],[q.end,1400]]),easeInOutSine));}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.72,.5);s.field(B,.25,.5);
  const rp0=robbenAt(tp).place,floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-40],[8,0,-40],[8,0,40],[-60,0,40]]));s.tone(B,floor,.3);
  const pool=(r:number)=>{const g=groundRing(c,rp0.x??0,rp0.z??0,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5),.2);s.tone(Y,pool(2.8),.18);
  {const gl=new Path2D();goalFrame(gl,c);inkMark(s,Y,gl,.6);}
  // "Keep running": the dashed run arrow ahead of him; "into space": the space between the defenders
  groundArrow(s,c,robPath(Math.max(-1.5,tp),T1T+.2,12),sm(q.kr,q.kr+.4,tt,easeOut)*(1-sm(q.cc,q.cc+.4,tt)),.13);
  spaceZone(s,c,tp,sm(q.is,q.is+.35,tt,easeOutBack)*(1-sm(q.cc+.2,q.cc+.6,tt)));
  const w=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,prev:true,styleOf:st=>st===ROBBEN?st:ghost(st),maxDepth:15,glow:sm(q.cc,q.cc+.3,tt)*(1-sm(q.fc,q.fc+.4,tt))});
  const rs=solve(w.rob.pose,RB,w.rob.place),h=P(c,rs.head),k=kAt(c,rs.head);
  // "missed a chance": a red X that fades; "Stay brave": a yellow chevron lifting over his head (chin up, go again)
  const mc=sm(q.mc,q.mc+.3,tt,easeOutBack)*(1-sm(q.sb,q.sb+.3,tt));redX(s,h[0]+.6*k,h[1]-.5*k,.25*k,mc);
  const sb=sm(q.sb,q.sb+.4,tt,easeOutBack)*(1-sm(q.kr+.3,q.kr+.8,tt));if(sb>.02){const y0=h[1]-(.42+.2*sb)*k,p=ribbon([[h[0]-.32*k,y0+.22*k],[h[0],y0],[h[0]+.32*k,y0+.22*k]],Math.max(5,.08*k),{taper:.1,wobble:.4});yInk(s,p,.95*sb);}
  // "finish calmly": the head-still ring and the dotted roll to the corner
  const fc=sm(q.fc,q.fc+.35,tt,easeOutBack);if(fc>.02){yRing(s,h[0],h[1],.3*k*fc,Math.max(4,.035*k));const dots=new Path2D();for(let i=0;i<=12;i++){const u=i/12*fc,p=mix3([B_S[0],.03,B_S[1]],[LINE[0],.03,LINE[2]],u);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p),r=Math.max(3,.05*kAt(c,p));dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}yInk(s,dots,.95);}
  if(tp>=TS-.02&&tp<TS+.22){const p=P(c,rs.lToe);sparkBurst(s,Y,p[0],p[1],80,{n:8,seed:41,g:1-sm(TS+.08,TS+.22,tp),width:10});}
 },
 still:6,
};
/** the goal frame alone (lesson chapter): posts and bar as ribbons */
function goalFrame(path:Path2D,c:Camera){const W=3.66,H=2.44,bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;path.addPath(ribbon([P(c,a),P(c,b)],Math.max(3,.12*kAt(c,mix3(a,b,.5))),{taper:0,wobble:.5}));};bar([0,0,-W],[0,H,-W]);bar([0,0,W],[0,H,W]);bar([0,H,-W],[0,H,W]);}

const story:RisoStory={
 id:'robben-final-2013',format:'11v11',title:"Robben's Wembley winner",
 theme:'After a miss, stay brave: keep running into space, and when the chance comes, finish calmly.',
 ageNote:'Champions League final, Borussia Dortmund 1–2 Bayern Munich, Wembley Stadium, London, 25 May 2013. At 1–1 in the 89th minute, Robben ran onto Ribéry\'s back-heel and prodded the winner past Weidenfeller with his left foot.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the ball is prodded in low and rolls slowly away with a yellow ring and a spark. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*28*g] as Pt;}),true),12,.95);
  if(age>0&&age<.28)sparkBurst(s,Y,x,y,100,{n:8,seed,g:1-clamp(age/.28),width:10});
  finaleBall(s,x+side*170*(1-Math.pow(1-u,1.6)),y-12,48,age*6+hash(seed,3)*TAU,{sq:0,dir:0});
 },
};
export default story;
