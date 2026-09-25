/** Iconic play film: Manuel Neuer, the sweeper-keeper, races far out of his box to head away one of Algeria's balls over the top,
 * Germany 2–1 Algeria (after extra time), 2014 FIFA World Cup round of 16, Estádio Beira-Rio, Porto Alegre, 30 June 2014, 70th minute, 0–0.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/neuer-algeria-2014/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/neuer-algeria-2014/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/neuer-algeria-2014/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read for this film; cached under scratchpad/films/src-cache/):
 *  - The Guardian, "Germany v Algeria: World Cup 2014 round of 16 – as it happened" (minute-by-minute), 30 June 2014:
 *    "70 min: Another long ball out of defence from Algeria prompts another chase from Slimani and another potentially suicidal dash out of
 *    his penalty area from Manuel Neuer. The German goalkeeper is nothing if not decisive and beats the Algeria forward to the bouncing ball
 *    by a split second, heading it out for a throw-in before the inevitable collision between the two players." Also: 67–69 min Mustafi
 *    off injured, Khedira on "just in front of the back four, while Philipp Lahm moves to right-back"; 36 min "Neuer rushes out of his area
 *    again to clear a speculative Aissa Mandi ball over the top"; 8 min Neuer's saving tackle on Slimani in the inside-left channel; the
 *    kits: "Algeria's players wear light green shirts, shorts and [socks]"; Germany "white shirts ... white shorts and white socks".
 *  - The Guardian, David Hytner, "Germany edge past Algeria as Schürrle and Özil end stalemate in extra time", 30 June 2014: "Germany's back
 *    line was extremely high ... With the defenders so high, the goalkeeper, Manuel Neuer, resembled a sweeper at times and he sparked alarm
 *    with a series of bolts from his line"; cool, "even a little chilly" evening at the Estádio Beira-Rio.
 *  - BBC Sport, "Germany 2-1 Algeria (after extra time)", 1 July 2014: "Keeper Neuer was forced to operate as an auxiliary sweeper as Slimani
 *    escaped the German centre-backs"; photo of Neuer challenging Slimani.
 *  - Wikipedia, "2014 FIFA World Cup knockout stage" (raw wikitext): 30 June 2014, 17:00 local, Estádio Beira-Rio, Porto Alegre, 43,063;
 *    2–1 a.e.t. (Schürrle 92', Özil 119', Djabou 120+1'); line-ups and numbers (Neuer 1, Lahm 16, Boateng 20, Mertesacker 17, Höwedes 4,
 *    Khedira 6, Schweinsteiger 7, Kroos 18, Müller 13, Özil 8, Schürrle 9; Slimani 13, Soudani 15, Feghouli 10, Taïder 19, Lacen 8,
 *    Ghoulam 3); kit templates: Germany all white (the 2014 home kit), Algeria all light green (#57C45C, the away kit).
 *  - Match photos (Reuters via BBC; AFP/Getty via the Guardian) of Neuer and Slimani that night: Neuer in a DARK NAVY long-sleeved keeper's
 *    kit with white sleeve stripes, navy shorts and socks, a white No. 1, red-and-white gloves, fair hair; Slimani No. 13 in light green with
 *    a white number, orange-red boots, close-cropped dark hair; floodlit, the grass mown in stripes.
 * CONFIRMED by those sources: the match, date, stadium, 0–0 in the 70th minute; Germany's very high back line; Algeria's long ball out of
 *  defence for Slimani to chase; Neuer dashing out of his penalty area; the ball BOUNCING; Neuer first "by a split second"; he HEADED it out
 *  for a THROW-IN; then the two collided; Neuer's many touches outside his area that night (11 by half-time); Germany in white, Algeria in
 *  light green; Neuer's navy kit, No. 1, and Slimani's No. 13 (from the photos); Lahm at right-back and Khedira in front of the back four.
 * INFERRED / ILLUSTRATIVE: every position, speed and time in metres/seconds; which Algerian defender kicked the long ball (unnamed, no number)
 *  and with which foot; the channel (Germany's right, Slimani's usual inside-left run, as at 8 min) and hence which touchline the throw-in
 *  was on (not narrated); where Neuer started (the edge of his box) and met the ball (≈11 m outside it); the ball's flight and bounce; that
 *  Neuer turned his head to send it to his right; how the collision played out (drawn gently: both go down, both fine); every other
 *  player's spot; which end Germany defended in the second half and where the main camera sat; Neuer's boots (white); the red-and-black
 *  chest chevron of Germany's shirt, reduced here to red trim (the figure library has no chevron); the 2014 Brazuca ball drawn as a white
 *  ball with navy, red and green pinwheel panels; the Beira-Rio bowl as drawn (red seats, the white petal-membrane roof ring, floodlights
 *  under its rim, a twilight sky: kick-off was 17:00 in a southern-hemisphere winter); the referee is left out of frame; the camera placements.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 the long ball is kicked): ch1 = the live broadcast from the high main-stand camera in real time (the bowl, the teams, the high
 * German line, the long ball, Slimani chasing, Neuer out of his box, the header, the ball out); ch2 = the TV slow-motion replay low behind
 * Neuer (he reads the ball over the top as it is kicked and is off before it bounces); ch3 = the replay low from the side at the meeting
 * point (outside the box: no hands; the head first, a split second before Slimani; out for a throw-in); ch4 = a duotone lesson (read the
 * through ball early and the keeper sweeps up behind a high line). Seams are forward passages into the ball. The header point is read from
 * the solved skeleton (Neuer's head at contact) and the bounce is aimed at it, so the ball always meets his forehead. Figures:
 * lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe), a lens that
 * widens for a square window (1.45:1 … 1:1). Inks: yellow (floodlights, grass under green, cue marks), red (Beira-Rio's seats, Germany's
 * trim, gloves, Algeria's cue rings), green (Algeria, the grass, the ball), navy (twilight sky, key line, Neuer's kit). Scenes read only their
 * local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–300 plate ops per frame; wide-shot figures
 * print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,keyPoses,posed,runCycle,stand,strike,keeperSet,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',RD='red',Y='yellow',G='green';
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`neuer film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py neuer-algeria-2014 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/neuer-algeria-2014/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Porto Alegre','World Cup 2014, Porto Alegre, nil-nil. Germany in white push up high. Algeria in green go long, and Slimani chases... but Manuel Neuer races out of his box and heads it away!',
  ['World Cup','Porto Alegre','nil-nil','Germany','white','push up high','Algeria','green','go long','Slimani','Manuel Neuer','out of his box','heads it away']),
 prov('Read it early',"Watch again, slowly. Neuer reads the ball over the top the moment it's kicked, and he's off before it bounces.",
  ['Watch again','slowly','reads','over the top',"kicked","he's off",'bounces']),
 prov('First to it',"Outside his box he can't use his hands, so he heads it, a split second before Slimani, out for a throw-in.",
  ['Outside his box','use his hands','heads it','a split second','before Slimani','throw-in']),
 prov('Sweeper keeper','Read the through ball early, and a keeper can sweep up behind the defence.',
  ['Read the through ball','early','a keeper','sweep up','behind the defence']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`neuer film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Germany's goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
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
/** a red mark (Algeria's cue colour) knocked through the grass */
function rInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(RD,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a ring on the grass round a ground point, into a path */
function gRing(path:Path2D,c:Camera,x:number,z:number,r:number,w:number){const g=groundRing(c,x,z,r,26);if(g.length>2)path.addPath(ribbon(g,Math.max(4,w*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}
/** a projected 3D polyline (points behind the lens dropped) */
function proj(c:Camera,pts:V3[]):Pt[]{const o:Pt[]=[];for(const p of pts)if(depthOf(c,p)>NEAR+.2)o.push(P(c,p));return o;}
const dashes=(step:number,on:number,from=.03):[number,number][]=>{const g:[number,number][]=[];for(let x=from;x<1;x+=step)g.push([x,x+on]);return g;};

// ================= the Estádio Beira-Rio from inside: the bowl of red seats, the white petal-membrane roof ring, floodlights, twilight =================
const CX=-52.5;// the centre spot
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),.6),y,b*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
type Lv=[number,number,number];// a, b, y
const BOWL:Lv[]=[[63,45,1.2],[79,60,17],[81,62,19],[97,76,35]];
const ROOF_IN:Lv=[78,60,41],ROOF_OUT:Lv=[104,84,39];
const NSEG=40,NPETAL=56;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
/** crowd: [tier, u round the bowl, v up the tier, ink 0 paper (Germany, Brazil) / 1 red / 2 green (Algeria) / 3 navy, phase] */
const CROWD=(()=>{const r=rng(2014),o:[number,number,number,number,number][]=[];for(let i=0;i<1400;i++){const tier=r()<.55?0:1,c=r();o.push([tier,r(),.05+r()*.9,c<.4?0:c<.6?1:c<.85?2:3,r()*TAU]);}return o;})();
const LAMPS:V3[]=Array.from({length:48},(_,i)=>lvAt([ROOF_IN[0]+.5,ROOF_IN[1]+.5,ROOF_IN[2]-.9],(i+.5)/48*TAU));
type Crowd={cheer?:number;flash?:number;t:number;hot?:number;goals?:number};
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,ey=c.eye;
 // twilight in a southern winter: a heavy navy screen, stepped darker high up
 s.field(K,.55,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz-620],[-Bnd,hz-520]],true),.32);
 // stands: the seats printed red under the navy dusk, the rows stepped, the concourse between the tiers navy
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [[0,1,false],[1,2,true],[2,3,false]] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   addPoly(isF?fascia:stands,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1)));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.fill(RD,stands,.42);s.tone(K,stands,.5);s.tone(K,rows,.22);s.knockout(fascia);s.tone(K,fascia,.7);
 // crowd: white shirts, red, Algeria's green, navy — bobbing on the twos when they rise
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,p=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(RD,heads[1],.95);if(seen[2]){s.knockout(heads[2],.9);s.fill(G,heads[2],.8);}if(seen[3])s.fill(K,heads[3],.9);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=r()<.5?0:1,th=r()*TAU,q=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass: yellow × green, mowing stripes, paper lines (both boxes, the halfway line and circle)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);yInk(s,gp,.8);s.tone(G,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(G,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 for(const [g,d] of [[0,-1],[-105,1]] as [number,number][]){Ln([g,-20.16],[g+d*16.5,-20.16]);Ln([g+d*16.5,-20.16],[g+d*16.5,20.16]);Ln([g+d*16.5,20.16],[g,20.16]);
  Ln([g,-9.16],[g+d*5.5,-9.16]);Ln([g+d*5.5,-9.16],[g+d*5.5,9.16]);Ln([g+d*5.5,9.16],[g,9.16]);
  let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=(d<0?Math.PI:0)-.927+i/10*1.854,pt:[number,number]=[g+d*11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 // the roof ring: white membrane petals (paper, a light navy dusk screen) on navy ribs, the floodlights under its rim
 const roof=new Path2D(),ribs=new Path2D(),rim=new Path2D();for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(ROOF_OUT,ROOF_IN,t0,t1)));addPoly(rim,clipPoly(c,band(ROOF_IN,[ROOF_IN[0],ROOF_IN[1],ROOF_IN[2]-1.6],t0,t1)));}
 for(let i=0;i<NPETAL;i++){const th=i/NPETAL*TAU,a=lvAt(ROOF_IN,th),b=lvAt(ROOF_OUT,th);if(depthOf(c,a)<4||depthOf(c,b)<4)continue;const pa=P(c,a),pb=P(c,b),mid=P(c,mix3(a,b,.5)),bow:Pt=[mid[0],mid[1]-Math.abs(pb[0]-pa[0])*.06];if(Math.abs(pa[0])>Bnd||Math.abs(pb[0])>Bnd)continue;ribs.moveTo(pa[0],pa[1]);ribs.quadraticCurveTo(bow[0],bow[1],pb[0],pb[1]);}
 s.knockout(roof);s.tone(K,roof,.18);s.stroke(K,ribs,clamp(.12*kAt(c,[CX,40,0]),2,8),.8);s.knockout(rim);s.fill(K,rim,.85);
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((3.4+(o.hot??0)*3)*k,10,380);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.1*k,5,140),h=clamp(.6*k,3,80);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.6);}
 goal(s,c,0,1);goal(s,c,-105,-1,true);
 if((o.goals??0)>.02){const p=new Path2D();for(const g of [0,-105]){const q=P(c,[g,1.2,0]);if(depthOf(c,[g,1.2,0])<NEAR+1)continue;const k=kAt(c,[g,1.2,0]),r=Math.max(14,4.2*k*o.goals!);p.addPath(ribbon(Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r,q[1]+Math.sin(i/24*TAU)*r*.7] as Pt),Math.max(5,.35*k),{close:true,taper:0,wobble:.6}));}yInk(s,p,.95);}
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

// ================= the ball: the 2014 Brazuca — white, navy / red / green pinwheel panels turning with the spin, a navy rim =================
const BALL_R=.11;
function brazuca(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),duo?.26:.3);
 const inks=duo?[K,Y,K]:[K,RD,G];
 for(let k=0;k<3;k++){const a=spin+k*TAU/3,m=Math.cos(spin*.6),arm=ribbon([[Math.cos(a)*r*.12,Math.sin(a)*r*.12*m],[Math.cos(a+.6)*r*.5,Math.sin(a+.6)*r*.5*m],[Math.cos(a+1.3)*r*.78,Math.sin(a+1.3)*r*.78*m]],Math.max(2,r*.2),{taper:.6,wobble:0});s.fill(inks[k],arm,.9);}
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.15,.55));}

// ================= kits (30 June 2014) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[RD,.16]],SKIN_M:AthleteStyle['skin']=[[Y,.45],[RD,.28],[K,.18]],SKIN_D:AthleteStyle['skin']=[[RD,.4],[Y,.45],[K,.34]];
/** Germany: the 2014 home kit, all white (paper); the chest chevron reduced to red trim; navy numbers */
const GER=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:RD,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:n,...o});
/** Algeria: the light green away kit (a green screen on paper, so it never merges with the yellow-under-green grass), white numbers */
const ALG=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[G,.58],shorts:[G,.58],socks:[G,.58],trim:[G,.9],boots:RD,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:'paper',seed:40+(n??0),...o});
/** Manuel Neuer: the dark navy long-sleeved keeper's kit, white No. 1, red-and-white gloves, fair hair (confirmed by the match photos) */
const NEUER:AthleteStyle={shirt:[K,.82],shorts:[K,.82],socks:[K,.82],trim:'paper',boots:'paper',skin:SKIN_L,hair:[Y,.85],hairStyle:'short',gloves:[RD,.9],line:K,shade:[K,.3],sleeves:'long',number:1,numberInk:'paper',build:{height:1.93,bulk:1.05},seed:1};
const SLIMANI:AthleteStyle=ALG(13,{skin:SKIN_M,hair:K,build:{height:1.88,bulk:1},seed:13});
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[K,.6]:[Y,.6],shorts:lead?[K,.6]:[K,.32],socks:lead?[K,.6]:[Y,.6],trim:lead?Y:K,boots:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[Y,.9]:K,shade:[K,.2],numberInk:lead?Y:K,gloves:st.gloves?[Y,.85]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the long ball is kicked) =================
const NB:Build=NEUER.build!,SB:Build=SLIMANI.build!;
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

// ---- the long ball: an Algerian defender (unnamed) hits it out of defence, over Germany's high line; it bounces once ----
const K0:[number,number]=[-79,-4.5];// the kicker's ball
const B1:V3=[-35.2,.11,-19];// the bounce, 19 m outside Germany's box
const TB=3;// flight time to the bounce
const TH=TB+.72;// Neuer's head meets the ball, on its way up from the bounce
const YK=YAW(B1[0]-K0[0],B1[2]-K0[1]);
const KFP=footSpot(K0,YK,strike(STRIKE_CONTACT,{power:1}),{height:1.85},'r');
const [kfx,kfz]=dirOf(YK);
// ---- Neuer: set at the edge of his box, reads it, sprints, a one-footed leap, the header, lands, bumps with Slimani, sits ----
const NEU_P:MKey[]=[[-4,-14.6,-6.2],[0,-15.5,-8],[.25,-15.6,-8.1],[.9,-16.8,-9.9],[1.9,-20.4,-13.9]];
const HDUR=.9,HC=.45,JUMP0=TH-HC*HDUR;// the leap window; contact at HC
const TO:[number,number]=[-26.4,-18.1];// take-off (the run's end)
NEU_P.push([JUMP0,TO[0],TO[1]]);
const AY=YAW(TO[0]-NEU_P[NEU_P.length-2][1],TO[1]-NEU_P[NEU_P.length-2][2]);// his run's heading
const NYAW=lerpAng(AY,YAW(-1,0),.45);// he turns partly toward the ball in the air
const [afx,afz]=dirOf(AY);
const NP:[number,number]=[TO[0]+afx*1.0,TO[1]+afz*1.0];// where his pelvis is at contact (the leap carries him 1 m)
/** the running header (t 0..1): take-off from the left foot, right knee driving (.2) → up, arms out wide for balance and the hands kept
 * away from the ball — he is outside his box (.45 = contact, head snapping round to his right) → lands (.7) → bumped, sits down (1) */
function neuerJump(t:number,run:Pose):Pose{
 const keys:[number,Pose][]=[
  [0,{...run,dx:-1}],
  [.2,posed({dx:-.62,air:.04,lHipF:-6,lKnee:24,lAnk:30,rHipF:78,rKnee:96,rAnk:10,lShF:-24,lElb:60,rShF:20,rElb:50,lShA:44,rShA:50,lean:8,pitch:2,neckP:-26})],
  [HC,posed({dx:0,air:.52,lHipF:-18,lKnee:72,lAnk:40,rHipF:48,rKnee:86,rAnk:28,lShA:64,rShA:58,lShF:-14,rShF:-14,lElb:24,rElb:24,lHand:1,rHand:1,lean:14,pitch:4,neckP:30,neckY:-24,twist:-14})],
  [.7,posed({dx:.2,air:.06,pitch:-12,lean:-4,roll:12,lHipF:30,lKnee:46,rHipF:52,rKnee:40,lShA:58,rShA:30,lShF:-22,rShF:-10,lElb:60,rElb:84,lHand:1,rHand:.6,neckP:-12,neckY:-10})],
  [1,posed({dx:-.1,pitch:-46,lean:26,roll:6,lHipF:74,lKnee:70,rHipF:60,rKnee:96,lShF:-34,rShF:-26,lShA:26,rShA:30,lElb:16,rElb:20,lHand:.8,rHand:.8,neckP:14})],
 ];
 const p=keyPoses(clamp(t),keys);p.squash=clamp(-.06*sm(.1,.2,t)*(1-sm(.2,.3,t))+.06*sm(.25,HC,t)*(1-sm(HC,.65,t))-.07*sm(.62,.72,t)*(1-sm(.72,.85,t)),-.3,.3);return p;
}
const NEU_RUN0=runner(NEU_P,JUMP0,[B1[0],0,B1[2]],1).pose;
const SIT=neuerJump(1,NEU_RUN0);
/** the contact: Neuer's head, read from the solved skeleton, and the ball just in front of his forehead */
const HIT:V3=(()=>{const sk=solve(neuerJump(HC,NEU_RUN0),NB,{x:NP[0],z:NP[1],yaw:NYAW}),d=nrm3(sub(sk.face,sk.head));return add(sk.head,[d[0]*.2,d[1]*.2+.02,d[2]*.2]);})();
function neuerAt(tau:number):{pose:Pose;place:Place}{
 if(tau<JUMP0){const b=ballAt(tau),r=runner(NEU_P,tau,b,1,keeperSet(tau*1.4));
  if(tau<.5){const u=sm(-.3,.3,tau);r.pose=blendPose(keeperSet(tau*1.4),r.pose,u);}
  return r;}
 const t=(tau-JUMP0)/HDUR;
 const place:Place={x:NP[0],z:NP[1],yaw:lerpAng(AY,NYAW,sm(0,HC,t))};
 if(t<=1)return{pose:neuerJump(t,NEU_RUN0),place};
 // sat on the grass, breathing, then back up on his feet
 const up=sm(TH+1.9,TH+2.7,tau),p=blendPose(SIT,{...stand(),dx:-.1},up);p.neckY+=.3*Math.sin(tau*.9)*(1-up);p.lean+=.04*Math.sin(tau*2.1);
 return{pose:p,place:{...place,yaw:lerpAng(NYAW,YAW(-1,-.6),up)}};
}
// ---- Slimani: level with Germany's line, turns and chases, a split second late, bumps into Neuer and goes down ----
const SLI_P:MKey[]=[[-4,-47,-12.6],[0,-45.5,-13.2],[.5,-44.8,-13.5],[1.6,-39,-15.6],[2.7,-33.2,-17.7],[TH-.2,-29.3,-20.4]];
const S0=TH-.2,SDUR=.95;
const SY=YAW(SLI_P[5][1]-SLI_P[4][1],SLI_P[5][2]-SLI_P[4][2]);
const SLI_RUN0=runner(SLI_P,S0-1e-3,[0,0,0],2).pose;
function slimaniBump(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,SLI_RUN0],
  [.3,posed({dx:.35,air:.26,lHipF:44,lKnee:74,rHipF:-10,rKnee:62,rAnk:30,lShA:60,rShA:56,lShF:30,rShF:26,lElb:40,rElb:44,lean:6,neckP:-30})],
  [.58,posed({dx:.75,air:.08,roll:-14,pitch:10,lean:22,twist:20,lHipF:22,lKnee:50,rHipF:52,rKnee:70,lShA:56,rShA:48,lShF:8,rShF:12,lElb:70,rElb:80,lHand:1,rHand:1,neckP:10,neckY:20})],
  [1,posed({dx:.55,lHipF:62,rHipF:40,lKnee:112,rKnee:102,lAnk:40,rAnk:40,lean:40,pitch:30,lShF:82,rShF:70,lShA:20,rShA:22,lElb:18,rElb:22,lHand:1,rHand:1,neckP:-10})],
 ];
 const p=keyPoses(clamp(t),keys);p.squash=clamp(.05*sm(.1,.3,t)*(1-sm(.3,.5,t))-.07*sm(.8,.95,t),-.3,.3);return p;
}
const SLI_DOWN=slimaniBump(1);
function slimaniAt(tau:number):{pose:Pose;place:Place}{
 if(tau<S0)return runner(SLI_P,tau,ballAt(tau),2);
 const t=(tau-S0)/SDUR,place:Place={x:SLI_P[5][1],z:SLI_P[5][2],yaw:SY};
 if(t<=1)return{pose:slimaniBump(t),place};
 const up=sm(TH+2.1,TH+2.9,tau),p=blendPose(SLI_DOWN,{...stand(),dx:.55},up);p.lean+=.04*Math.sin(tau*2.3);return{pose:p,place:{...place,yaw:lerpAng(SY,YAW(0,-1),up)}};
}
// ---- the ball ----
const KICK_IN:V3=[-86,.11,-1];
const VY0=4.905*TB,DT1=TH-TB,VY1=(HIT[1]-.11+4.905*DT1*DT1)/DT1;
const OUT1:V3=[-25.4,.11,-30.4],T_O1=TH+.75,VY2=(OUT1[1]-HIT[1]+4.905*.75*.75)/.75;
const OUT2:V3=[-24.8,.11,-36.4],T_O2=T_O1+.55,VY3=4.905*.55;
const OUT3:V3=[-24.4,.11,-38.6];
/** the moment the ball crosses the touchline (z = −34): out, throw-in */
const T_LINE=T_O1+.55*((-34-OUT1[2])/(OUT2[2]-OUT1[2]));
function ballAt(tau:number):V3{
 if(tau<-.4){const u=easeOut(clamp((tau+3)/2.4));return mix3(KICK_IN,[K0[0],.11,K0[1]],u);}
 if(tau<0)return[K0[0],.11,K0[1]];
 if(tau<TB){const u=tau/TB,p=mix3([K0[0],.11,K0[1]],B1,u);p[1]=.11+VY0*tau-4.905*tau*tau;return p;}
 if(tau<TH){const e=tau-TB,p=mix3(B1,HIT,e/DT1);p[1]=.11+VY1*e-4.905*e*e;return p;}
 if(tau<T_O1){const e=tau-TH,p=mix3(HIT,OUT1,e/.75);p[1]=Math.max(.11,HIT[1]+VY2*e-4.905*e*e);return p;}
 if(tau<T_O2){const e=tau-T_O1,p=mix3(OUT1,OUT2,e/.55);p[1]=.11+VY3*e-4.905*e*e;return p;}
 return mix3(OUT2,OUT3,easeOut(clamp((tau-T_O2)/1.2)));}

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const KICKER=ALG(null,{hair:K,build:{height:1.85}});
const LAHM=GER(16,{hair:K,build:{height:1.7}}),BOATENG=GER(20,{skin:SKIN_D,hair:K,build:{height:1.92,bulk:1.05}}),MERTE=GER(17,{hair:[K,.7],build:{height:1.98,bulk:1}}),HOEWEDES=GER(4,{hair:[K,.85],build:{height:1.87}});
const ACTORS:Actor[]=[
 {style:KICKER,at:(t,b)=>{const p:MKey[]=[[-4,KFP[0]-3,KFP[1]+2.4],[-.62,KFP[0]-kfx*1.1,KFP[1]-kfz*1.1],[.5,KFP[0]+kfx*.5,KFP[1]+kfz*.5],[4,KFP[0]+kfx*4,KFP[1]+kfz*2],[9,KFP[0]+kfx*9,KFP[1]+kfz*3]],r=runner(p,t,b,3);
  if(t<-.62)r.place.yaw=YAW(b[0]-r.place.x!,b[2]-r.place.z!);
  if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2),w=Math.sin(clamp((t+.7)/1.4)*Math.PI);r.pose=blendPose(r.pose,strike(u,{power:1}),w);r.place.yaw=lerpAng(r.place.yaw??0,YK,w);}return r;}},// an Algerian defender (unnamed)
 mover(LAHM,[[-4,-49,-24.5],[0,-47,-23.5],[1,-45.5,-23.4],[TB,-38.5,-23.6],[TH+1.2,-31,-25.5],[TH+3,-28.5,-27]],4),// Philipp Lahm, right-back since 69'
 mover(BOATENG,[[-4,-48.5,-9],[0,-46.4,-9.4],[.7,-45.6,-10],[TB,-38,-14],[TH+1,-32.5,-17.2],[TH+3,-30.8,-18]],5),// Jérôme Boateng
 mover(MERTE,[[-4,-49,2.6],[0,-47,2],[1,-46,.6],[TB,-40.5,-4],[TH+1.4,-35,-8]],6),// Per Mertesacker
 mover(HOEWEDES,[[-4,-49.5,18],[0,-47.5,16.5],[1.2,-46.5,15],[TH+1.4,-40,9]],7),// Benedikt Höwedes
 mover(GER(6,{hair:K,build:{height:1.89}}),[[-4,-57,-4],[0,-55,-3.5],[TH,-48,-8],[TH+3,-44,-10]],8),// Sami Khedira
 mover(GER(7,{hair:[Y,.7],build:{height:1.83}}),[[-4,-62,8],[0,-60,7],[TH+2,-53,2]],9),// Bastian Schweinsteiger
 mover(GER(18,{hair:[Y,.8],build:{height:1.82}}),[[-4,-65,-12],[0,-64,-12],[TH+2,-57,-14]],10),// Toni Kroos
 mover(GER(13,{hair:[K,.8],build:{height:1.86,bulk:.94}}),[[-4,-74,2],[0,-72,-1],[TH+2,-66,-5]],11),// Thomas Müller
 mover(ALG(15,{skin:SKIN_D,hair:K}),[[-4,-49,5],[0,-47.5,4.5],[TB,-41,0],[TH+2,-36,-4]],12),// El Arabi Soudani
 mover(ALG(10,{hair:[K,.9],build:{height:1.78}}),[[-4,-55,18],[0,-53,16],[TB,-47,11],[TH+2,-42,8]],14),// Sofiane Feghouli
 mover(ALG(19,{hair:K}),[[-4,-63,-7],[0,-62,-7],[TH+2,-55,-10]],15),// Saphir Taïder
 mover(ALG(8,{skin:SKIN_D,hair:K}),[[-4,-70,4],[0,-69,4],[TH+2,-63,1]],16),// Mehdi Lacen
 mover(ALG(3,{hair:K,build:{height:1.84}}),[[-4,-64,-27],[0,-63,-26],[TH+2,-55,-27]],17),// Faouzi Ghoulam
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([NEUER,SLIMANI]);
/** everyone and the ball at τ, depth sorted. `hero` smears Neuer and Slimani; `prev` gives every figure its secondary motion;
 * `cap` limits figure detail (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&!hero&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&!hero&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const neu=neuerAt(tp),sli=slimaniAt(tp);
 put(NEUER,neu,neuerAt(tp-dt),!!o.hero);put(SLIMANI,sli,slimaniAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  brazuca(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,neu,sli};}
/** the long ball's flight as 3D points (τ from a to b) */
const flight=(a:number,b:number,n=24):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(a+(b-a)*i/n));

// ================= chapter 1 (live): the high main-stand camera in real time =================
const ch1q=()=>({wc:T(0,'World Cup'),pa:T(0,'Porto Alegre'),nn:T(0,'nil-nil'),ge:T(0,'Germany'),wh:T(0,'white'),ph:T(0,'push up high'),al:T(0,'Algeria'),gr:T(0,'green'),gl:T(0,'go long'),sl:T(0,'Slimani'),mn:T(0,'Manuel Neuer'),ob:T(0,'out of his box'),ha:T(0,'heads it away'),end:SEC(0)});
/** the lead-in: τ = t − TL. The header lands on "heads it away" when the voice allows; the kick never leaves before "go long". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.ha-TH-.05,q.gl-.3,Math.max(q.gl-.3,Math.min(q.gl+1.8,q.end-TH-1.7)));return{TL,end:q.end};};
const BCAM:V3=[-44,19,50];
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-52.5,34,74],[q.pa,-50,30,70],[q.nn+.3,-49,24,64],[q.ge,BCAM[0],BCAM[1],BCAM[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the kick the director's camera follows the words: the bowl → the roof → the pitch → Germany's high line → Algeria → the kicker */
function ch1Pre(t:number):V3{const q=ch1q(),{TL}=ch1T(),v=key(t,mono([[0,CX,14,0],[q.pa,CX+14,22,-30],[q.nn+.3,CX,1,0],[q.ge,-46,1,-2],[q.ph+.3,-45,1,-4],[q.al,-54,1,-6],[q.gr+.3,-60,1,-8],[TL-1.2,-70,2,-8]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau),n=neuerAt(tau).place;
 if(tau<0)return[K0[0]+10,1,K0[1]-2];
 const u=sm(0,TB-.3,tau),play:V3=[lerp(lerp(K0[0]+10,b[0],.7),n.x??0,.55*u),Math.min(b[1],9)*.35+1,lerp(lerp(K0[1],b[2],.7),n.z??0,.55*u)*.9];
 return mix3(play,[-27,1,-25],sm(TH+.2,TH+1.6,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(Math.max(q.gr+.4,TL-1.6),Math.max(q.gr+1.2,TL-.4),t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1000],[q.pa,1150],[q.nn+.3,1600],[q.ge,2300],[q.ph+.3,2100],[q.al,2200],[TL-1,2600],[TL+.6,2300],[TL+TB-.8,3600],[TL+TH-.3,5200],[TL+TH+1.4,4600],[q.end,4300]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings on "white" / "green"; Slimani's ring on "Slimani", Neuer's on "Manuel Neuer" */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rg=sm(q.wh,q.wh+.3,t,easeOutBack)*(1-sm(q.al,q.al+.5,t)),ra=sm(q.gr,q.gr+.3,t,easeOutBack)*(1-sm(q.gl+.4,q.gl+.9,t)),rs=sm(q.sl,q.sl+.3,t,easeOutBack)*(1-sm(q.ha+.3,q.ha+.8,t)),rn=sm(q.mn,q.mn+.3,t,easeOutBack)*(1-sm(q.ha+.3,q.ha+.8,t));
 if(rg<.02&&ra<.02&&rs<.02&&rn<.02)return;const bp=ballAt(tp),pg=new Path2D(),pa=new Path2D();
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place,ger=a.style.shirt==='paper';if(ger&&rg>.02)gRing(pg,c,p.x??0,p.z??0,.95*rg,.14);if(!ger&&ra>.02)gRing(pa,c,p.x??0,p.z??0,.95*ra,.14);});
 const sp=slimaniAt(tp).place,np=neuerAt(tp).place;
 if(ra>.02)gRing(pa,c,sp.x??0,sp.z??0,.95*ra,.14);if(rs>.02)gRing(pa,c,sp.x??0,sp.z??0,1.4*rs,.18);
 if(rg>.02)gRing(pg,c,np.x??0,np.z??0,.95*rg,.14);if(rn>.02)gRing(pg,c,np.x??0,np.z??0,1.4*rn,.18);
 yInk(s,pg,.95);rInk(s,pa,.95);
}
/** Germany's back four at τ (sorted across the pitch) */
const backFour=(tp:number)=>{const b=ballAt(tp);return[LAHM,BOATENG,MERTE,HOEWEDES].map(st=>ACTORS.find(a=>a.style===st)!.at(tp,b).place).sort((a,b)=>(a.z??0)-(b.z??0));};
/** the 18-yard box of Germany's goal as a path of ground ribbons */
function boxPath(c:Camera,w=.3){const p=new Path2D();groundLine(p,c,[0,-20.16],[-16.5,-20.16],w);groundLine(p,c,[-16.5,-20.16],[-16.5,20.16],w);groundLine(p,c,[-16.5,20.16],[0,20.16],w);return p;}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),tau=t-TL,tp=tt-TL,after=tau-TH;
  const shake=tau>=TH?5*settle(tau,TH,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  const hot=sm(q.pa,q.pa+.4,t,easeOutBack)*(1-sm(q.nn,q.nn+.5,t)),goals=sm(q.nn,q.nn+.3,t,easeOutBack)*(1-sm(q.ge,q.ge+.4,t));
  stadium(s,c,{t,hot,goals,cheer:.12+.9*sm(0,.4,after)*(1-sm(1.2,2.4,after)),flash:.15+.9*sm(0,.4,after)},()=>{
   teamRings(s,c,tp,t);
   // "push up high": a dashed yellow line along Germany's back four, arrows pointing upfield
   const ph=sm(q.ph,q.ph+.4,tt,easeOut)*(1-sm(q.gl,q.gl+.5,tt));if(ph>.02){const bf=backFour(tp),pts=proj(c,bf.map(p=>[(p.x??0)-1.2,.02,p.z??0] as V3));if(pts.length>1){const k=kAt(c,[bf[1].x??0,0,bf[1].z??0]),path=ribbon(pts.slice(0,Math.max(2,Math.ceil(pts.length*ph))),Math.max(5,.18*k),{taper:0,wobble:.6,gaps:dashes(.1,.05)});
    bf.forEach(p=>{const a=P(c,[(p.x??0)-1.6,.02,p.z??0]),b=P(c,[(p.x??0)-1.6-4.2*ph,.02,p.z??0]),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=Math.max(8,.9*k);path.addPath(ribbon([a,b],Math.max(4,.14*k),{taper:.1,wobble:.4}));path.addPath(polyPath([[b[0]+ux*z,b[1]+uy*z],[b[0]-uy*z*.7,b[1]+ux*z*.7],[b[0]+uy*z*.7,b[1]-ux*z*.7]],true));});yInk(s,path,.95);}}
   // "go long": the ball's flight over the top, dashed yellow, drawn out ahead of the ball
   const gl=sm(q.gl,q.gl+.6,tt,easeOut)*(1-sm(TL+TB,TL+TB+.5,tt));if(gl>.02){const pts=proj(c,flight(0,TB*gl));if(pts.length>1){const k=kAt(c,B1);yInk(s,ribbon(pts,Math.max(5,.16*k),{taper:.2,wobble:.6,gaps:dashes(.07,.035)}),.95);}}
   // "out of his box": Germany's box flashes yellow as he leaves it
   const ob=sm(q.ob,q.ob+.3,tt,easeOutBack)*(1-sm(q.ob+1.2,q.ob+1.8,tt));if(ob>.02)yInk(s,boxPath(c,.3*ob+.1),.95*ob);
   drawWorld(s,c,tau,tp,{ballMin:13,cap:t>q.end-.7});
   if(tp>=TH&&tp<TH+.3){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],70+60*sm(TH,TH+.1,tp,easeOut),{n:9,seed:3,g:1-sm(TH+.1,TH+.3,tp),width:10});}
  });},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low behind Neuer): he reads the ball over the top as it is kicked, off before the bounce =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),rd:T(1,'reads'),ot:T(1,'over the top'),kk:T(1,'kicked'),of:T(1,"he's off"),bn:T(1,'bounces'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-1.05],[q.rd,-.55],[q.kk,0],[q.of+.1,.45],[q.bn+.3,1.05],[q.end,1.35]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),n=neuerAt(tau-.3).place,b=ballAt(Math.max(0,tau));
 const pos:V3=[(n.x??0)+7,2.4-.3*sm(q.kk,q.end,t),(n.z??0)+2.8];
 const ahead:V3=[(n.x??0)-12,.5,(n.z??0)-5],look=mix3(ahead,[lerp(ahead[0],b[0],.35),b[1]*.3+.5,lerp(ahead[2],b[2],.35)],sm(q.kk-.2,q.of+.8,t,easeInOutSine));
 const F=key(t,mono([[0,1600],[q.rd,1750],[q.kk,1650],[q.of+.5,1450],[q.end,1500]]),easeInOutSine);return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.08},()=>{
   // "bounces": the spot the ball will land, read in advance — a yellow ring on the grass that pulses (drawn under the figures)
   const bn=sm(q.bn,q.bn+.35,tt,easeOutBack)*(1-sm(q.end-.8,q.end-.4,tt));if(bn>.02){const p=new Path2D();gRing(p,c,B1[0],B1[2],1.2*bn*(1+.08*Math.sin(tt*9)),.12);yInk(s,p,.95);}
   // "over the top": the flight predicted from the kick, dashed over Germany's line
   const ot=sm(q.ot,q.ot+.6,tt,easeOut)*(1-sm(q.end-.8,q.end-.4,tt));if(ot>.02){const pts=proj(c,flight(0,TB*ot));if(pts.length>1)yInk(s,ribbon(pts,Math.max(5,.14*kAt(c,[-50,4,-12])),{taper:.2,wobble:.6,gaps:dashes(.07,.035)}),.95);}
   const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,prev:true,cap:t>q.end-.7});
   const sk=solve(w.neu.pose,NB,w.neu.place);
   // "reads": a dashed sight line from his eyes to the ball
   const rd=sm(q.rd,q.rd+.4,tt,easeOut)*(1-sm(q.of,q.of+.5,tt));if(rd>.02&&depthOf(c,sk.head)>NEAR+.3){const a=P(c,sk.head),b=P(c,w.ball);yInk(s,ribbon([a,[lerp(a[0],b[0],rd),lerp(a[1],b[1],rd)]],Math.max(4,.035*kAt(c,sk.head)),{taper:0,wobble:.5,gaps:dashes(.06,.03)}),.95);}
   // "kicked": sparks off the kicker's boot
   if(tp>=0&&tp<.25){const p=P(c,[K0[0],.2,K0[1]]);sparkBurst(s,Y,p[0],p[1],40+40*sm(0,.08,tp,easeOut),{n:8,seed:5,g:1-sm(.08,.25,tp),width:7});}
   // "he's off": speed lines streaming back from his boots
   const of=sm(q.of,q.of+.2,tt)*(1-sm(q.bn+.4,q.bn+.9,tt));if(of>.02&&depthOf(c,sk.pelvis)>NEAR+.5){const a=P(c,sk.pelvis),b=P(c,add(sk.pelvis,[dirOf(AY)[0],0,dirOf(AY)[1]]));speedLines(s,K,a[0],a[1]+.5*kAt(c,sk.pelvis),Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:9,len:160*of,width:6,cov:.8});}
  });},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(14,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay low from the side at the meeting point): outside the box, no hands, the head first, out for a throw-in =================
const ch3q=()=>({ob:T(2,'Outside his box'),uh:T(2,'use his hands'),hi:T(2,'heads it'),ss:T(2,'a split second'),bs:T(2,'before Slimani'),ti:T(2,'throw-in'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TH-1.15],[q.ob+.2,TH-.85],[q.uh+.2,TH-.45],[q.hi+.1,TH],[q.ss+.3,TH+.12],[q.bs+.3,TH+.3],[q.ti,T_LINE-.05],[q.end,T_LINE+.2+(q.end-q.ti)*.7]]),x=>x);};
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.max(tau,TH)),toOut=sm(q.bs,q.ti+.3,t,easeInOutSine);
 const v=key(t,mono([[0,-17.8,1.9,-5.8,1250],[q.ob+.6,-19,1.8,-6.8,1400],[q.uh,-25.4,1.3,-10.6,2000],[q.hi,-26.6,1.15,-11.6,2300],[q.bs+.2,-26.4,1.35,-11.4,2100],[q.ti+.4,-22.5,3.6,-11.5,1250],[q.end,-22.2,3.8,-11.8,1220]]),easeInOutSine,true);
 const look0:V3=mix3([-22.5,1,-19.6],[-27.8,1.3,-19.2],sm(q.ob+.4,q.uh,t,easeInOutSine)),look1:V3=[b[0],clamp(b[1],.4,2),b[2]];
 return cam([v[0],v[1],v[2]],mix3(look0,[look1[0],look1[1]*.5,look1[2]],toOut*.5),v[3]);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),hitT=q.hi+.1;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.8*sm(TH,TH+.5,tp)*(1-sm(TH+1.5,TH+2.5,tp)),flash:.1+.6*sm(TH,TH+.4,tp)},()=>{
   // "Outside his box": the corner of Germany's box behind him lights up, and a dashed line measures how far out he is
   const ob=sm(q.ob,q.ob+.35,tt,easeOutBack)*(1-sm(q.hi,q.hi+.5,tt));if(ob>.02){const p=boxPath(c,.35),n=neuerAt(tp).place,a=P(c,[-16.5,.02,-20.16]),b=P(c,[n.x??0,.02,n.z??0]);p.addPath(ribbon([a,[lerp(a[0],b[0],ob),lerp(a[1],b[1],ob)]],Math.max(4,.12*kAt(c,[-20,0,-19])),{taper:0,wobble:.5,gaps:dashes(.1,.05)}));yInk(s,p,.95*Math.min(1,ob));}
   // "throw-in": the touchline where the ball goes out glows yellow (under the figures)
   const ti=sm(q.ti-.1,q.ti+.3,tt,easeOut)*(1-sm(q.end-.9,q.end-.5,tt));if(ti>.02){const p=new Path2D();groundLine(p,c,[-33,-34],[-17,-34],.3+.25*ti);yInk(s,p,.95*ti);}
   const w=drawWorld(s,c,tau,tp,{ballMin:18,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const sk=solve(w.neu.pose,NB,w.neu.place),ss=solve(w.sli.pose,SB,w.sli.place);
   // "use his hands": a ring round each glove, struck through in red — not allowed out here
   const uh=sm(q.uh,q.uh+.3,tt,easeOutBack)*(1-sm(q.hi-.1,q.hi+.3,tt));if(uh>.02){const ring=new Path2D(),bar=new Path2D();for(const j of [sk.lHa,sk.rHa]){if(depthOf(c,j)<NEAR+.3)continue;const p=P(c,j),k=kAt(c,j),r=.2*k*uh,pts:Pt[]=Array.from({length:20},(_,i)=>[p[0]+Math.cos(i/20*TAU)*r,p[1]+Math.sin(i/20*TAU)*r] as Pt);ring.addPath(ribbon(pts,Math.max(4,.03*k),{close:true,taper:0,wobble:.6}));bar.addPath(ribbon([[p[0]-r*.72,p[1]+r*.72],[p[0]+r*.72,p[1]-r*.72]],Math.max(4,.035*k),{taper:0,wobble:.4}));}
    yInk(s,ring,.95);rInk(s,bar,.95);}
   // "heads it": a ring on his head and sparks where the forehead meets the ball
   const hi=sm(q.hi,q.hi+.3,tt,easeOutBack)*(1-sm(q.bs,q.bs+.5,tt));if(hi>.02&&depthOf(c,sk.head)>NEAR+.3){const p=P(c,sk.head);yRing(s,p[0],p[1],.24*kAt(c,sk.head)*hi,Math.max(4,.035*kAt(c,sk.head)));}
   if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],90+90*sm(TH,TH+.08,tp,easeOut),{n:10,seed:6,g:1-sm(TH+.08,TH+.25,tp),width:11});}
   // "a split second": the gap between the ball on Neuer's head and Slimani's head, dashed
   const sp=sm(q.ss,q.ss+.3,tt,easeOut)*(1-sm(q.ti,q.ti+.4,tt));if(sp>.02&&depthOf(c,ss.head)>NEAR+.3){const a=P(c,HIT),b=P(c,ss.head);yInk(s,ribbon([a,[lerp(a[0],b[0],sp),lerp(a[1],b[1],sp)]],Math.max(4,.03*kAt(c,HIT)),{taper:0,wobble:.5,gaps:dashes(.14,.07)}),.95);}
   // "before Slimani": a red ring round Slimani on the grass
   const bs=sm(q.bs,q.bs+.3,tt,easeOutBack)*(1-sm(q.ti+.3,q.ti+.8,tt));if(bs>.02){const p=new Path2D();gRing(p,c,ss.pelvis[0],ss.pelvis[2],.9*bs,.07);rInk(s,p,.95);}
   // "throw-in": a dotted yellow arrow along the header's flight, over the line
   if(ti>.02){const dots=new Path2D();let last:Pt|null=null,prev:Pt|null=null;for(let i=0;i<=16;i++){const tb=TH+.05+i/16*(T_LINE-TH)*ti,p=ballAt(tb);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p),r=Math.max(4,.05*kAt(c,p));dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);prev=last;last=pp;}
    if(last&&prev){const dx=last[0]-prev[0],dy=last[1]-prev[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=22;dots.addPath(polyPath([[last[0]+ux*z*1.4,last[1]+uy*z*1.4],[last[0]-uy*z,last[1]+ux*z],[last[0]+uy*z,last[1]-ux*z]],true));}yInk(s,dots,.95);}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),np=neuerAt(tau).place,g:V3=[np.x??0,1,np.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): read the through ball early, and the keeper sweeps up behind the defence =================
const ch4q=()=>({rt:T(3,'Read the through ball'),ea:T(3,'early'),ak:T(3,'a keeper'),su:T(3,'sweep up'),bd:T(3,'behind the defence'),end:SEC(3)});
/** lesson clock: the ball is kicked on "Read the through ball", Neuer is away on "early", he meets it on "behind the defence" */
const tau4=(t:number)=>{const q=ch4q(),bdT=Math.max(q.bd+.3,q.su+.8);return key(t,mono([[0,-.6],[q.rt,0],[q.ea+.2,.45],[q.su,TB-.6],[bdT,TH],[q.end,TH+.2+(q.end-bdT)*.4]]),x=>x);};
const NEU4=duo(NEUER,true),SLI4=duo(SLIMANI),DEF4=[LAHM,BOATENG,MERTE,HOEWEDES].map(st=>duo(st));
function LCAM(t:number){const q=ch4q(),v=key(t,mono([[0,-9,7,3,2600],[q.ea,-10,6.6,2,2750],[q.su,-11,6.2,1,2900],[q.end,-12,6,0,2900]]),easeInOutSine,true);
 const n=neuerAt(tau4(t)).place,lk:V3=[lerp(n.x??0,B1[0],.3),.6,lerp(n.z??0,B1[2],.3)];return cam([v[0]+.6*(lk[0]+22),v[1],v[2]+.6*(lk[2]+13)],lk,v[3]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-80,0,-34],[0,0,-34],[0,0,34],[-80,0,34]]));s.tone(K,floor,.2);
  const lines=new Path2D();groundLine(lines,c,[0,-34],[-80,-34],.2);groundLine(lines,c,[0,-34],[0,34],.2);groundLine(lines,c,[-52.5,-34],[-52.5,34],.2);lines.addPath(boxPath(c,.2));s.knockout(lines,.6);
  // "behind the defence": the space between Germany's high line and the box, a yellow screen
  const bd=sm(q.bd,q.bd+.4,tt,easeOut);if(bd>.02){const bf=backFour(tp),lx=Math.min(...bf.map(p=>p.x??0))+.5,zone=new Path2D();addPoly(zone,clipPoly(c,[[lx,0,-34],[lerp(lx,-16.5,bd),0,-34],[lerp(lx,-16.5,bd),0,34],[lx,0,34]]));s.knockout(zone,.35*bd);s.tone(Y,zone,.42*bd);}
  // "Read the through ball": its flight over the line, dashed, and where it will land
  const rt=sm(q.rt,q.rt+.6,tt,easeOut);{const pts=proj(c,flight(0,TB*rt));if(rt>.02&&pts.length>1)yInk(s,ribbon(pts,Math.max(5,.12*kAt(c,B1)),{taper:.2,wobble:.6,gaps:dashes(.07,.035)}),.95);if(rt>.5){const p=new Path2D();gRing(p,c,B1[0],B1[2],1.3*sm(.5,1,rt,easeOutBack),.14);yInk(s,p,.95);}}
  // "early" / "sweep up": Neuer's sweep drawn out from where he stood to where he meets it
  const ea=sm(q.ea,q.ea+.9,tt,easeOut);if(ea>.02){const pts=proj(c,[...NEU_P.slice(1).map(k=>[k[1],.02,k[2]] as V3),[NP[0],.02,NP[1]]]);if(pts.length>1){const n=Math.max(2,Math.ceil(pts.length*ea));yInk(s,ribbon(pts.slice(0,n),Math.max(5,.2*kAt(c,[-20,0,-12])),{taper:.1,wobble:.6,gaps:sm(q.su,q.su+.4,tt)>.5?undefined:dashes(.12,.06)}),.95);}}
  const n0=neuerAt(tp).place,pool=(r:number)=>{const g=groundRing(c,n0.x??0,n0.z??0,r,36),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};s.knockout(pool(3.2),.22);s.tone(Y,pool(1.6),.25);
  const items:Item[]=[];
  const n=neuerAt(tp),np=neuerAt(tp-1/12),sl=slimaniAt(tp),slp=slimaniAt(tp-1/12),bpos=ballAt(tau),b0=ballAt(tp);
  items.push({depth:depthOf(c,[n.place.x??0,0,n.place.z??0]),draw:()=>drawPlayer(s,n.pose,c,NEU4,n.place,{prev:np,smear:true})});
  items.push({depth:depthOf(c,[sl.place.x??0,0,sl.place.z??0]),draw:()=>drawPlayer(s,sl.pose,c,SLI4,sl.place,{prev:slp})});
  [LAHM,BOATENG,MERTE,HOEWEDES].forEach((st,i)=>{const a=ACTORS.find(x=>x.style===st)!,r=a.at(tp,b0);items.push({depth:depthOf(c,[r.place.x??0,0,r.place.z??0]),draw:()=>drawPlayer(s,r.pose,c,DEF4[i],r.place,{detail:'low'})});});
  items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),rr=Math.max(12,BALL_R*kAt(c,bpos));brazuca(s,bp[0],bp[1],rr,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(rr*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "a keeper": a ring round Neuer
  const ak=sm(q.ak,q.ak+.3,tt,easeOutBack)*(1-sm(q.bd+.4,q.bd+.9,tt));if(ak>.02){const p=new Path2D();gRing(p,c,n.place.x??0,n.place.z??0,1.1*ak,.14);yInk(s,p,.95);}
  if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],80,{n:10,seed:41,g:1-sm(TH+.08,TH+.25,tp),width:9});}
 },
 still:6,
};

const story:RisoStory={
 id:'neuer-algeria-2014',format:'11v11',title:"Neuer sweeps up",
 theme:'Read the through ball early, and a keeper can sweep up behind the defence.',
 ageNote:'World Cup round of 16, Germany 2–1 Algeria (after extra time), Estádio Beira-Rio, Porto Alegre, 30 June 2014. At 0–0 in the 70th minute Neuer raced far out of his box and headed a long ball away for a throw-in, a split second before Islam Slimani.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the ball drops, bounces, and is headed away with a yellow ring and sparks. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.8),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*28*g] as Pt;}),true),12,.95);
  const bx=u<.45?x-side*(1-u/.45)*120:x+side*(u-.45)/.55*170,by=u<.45?y-120*Math.abs(Math.cos(u/.45*Math.PI*.75))-12:y-12-(u-.45)/.55*140;
  if(age>.34&&age<.6)sparkBurst(s,Y,bx,by,100,{n:8,seed,g:1-clamp((age-.34)/.26),width:10});
  brazuca(s,bx,by,44,age*12+hash(seed,3)*TAU,{sq:age>.34&&age<.46?.2:0,dir:0});
 },
};
export default story;
