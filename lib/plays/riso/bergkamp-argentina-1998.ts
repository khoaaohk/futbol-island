/** Iconic play film: Dennis Bergkamp's last-minute winner, Netherlands 2–1 Argentina, World Cup quarter-final, Stade Vélodrome, Marseille,
 * 4 July 1998. A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/bergkamp-argentina-1998/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/bergkamp-argentina-1998/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/bergkamp-argentina-1998/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 through web-search result summaries; the pages could not be fetched in this session and the footage was not
 * reviewed, so the choreography between the documented beats is a reconstruction):
 *  - ESPN, "World Cup's Greatest Goals: Dennis Bergkamp (1998, Netherlands vs. Argentina)"
 *    https://www.espn.com/soccer/story/_/id/37372558/dennis-bergkamp-1998-netherlands-argentina
 *  - Britannica, "Famous FIFA World Cup Goals: Dennis Bergkamp's Sublime First Touch"
 *    https://www.britannica.com/sports/Famous-FIFA-World-Cup-Goals-Dennis-Bergkamps-Sublime-First-Touch
 *  - FIFA, "Dennis Bergkamp on his iconic goal against Argentina"
 *    https://www.fifa.com/en/tournaments/mens/worldcup/articles/dennis-bergkamp-netherlands-iconic-goal-argentina
 *  - FIFA match centre, "Netherlands v Argentina 2-1, Quarter-final, 1998 FIFA World Cup France" https://www.fifa.com/en/match-centre/match/17/1013/1025/8784
 *  - Football Oranje, "The Battle of Marseille - Holland 2-1 Argentina, 4 July 1998"
 *    http://www.football-oranje.com/the-battle-of-marseille-holland-2-1-argentina-4-july-1998/
 *  - Yahoo Sports, "Dennis Bergkamp's iconic goal sends Argentina packing"; GiveMeSport / OneFootball on the Dutch commentary;
 *    worldfootballindex.com "89 – Dennis Bergkamp: Netherlands v Argentina 1998"; Wikipedia "Dennis Bergkamp"
 * CONFIRMED by those accounts: 4 July 1998, Stade Vélodrome, Marseille, World Cup quarter-final; the score was 1–1 (Kluivert, López) and
 *  the goal came in the last minute of normal time (the 89th/90th minute), making it 2–1 and sending the Netherlands to the semi-final;
 *  captain Frank de Boer hit a long pass (reported as 60–70 yards) from deep; Bergkamp controlled it with ONE touch of his RIGHT foot, beat
 *  Roberto Ayala with a SECOND touch (also right foot) as he closed in, and with the third finished past the stranded keeper Carlos Roa
 *  ("into the roof of the net"); the brief for this film, matching the widely told version, gives the finish as the OUTSIDE of the right
 *  foot, over Roa, into the far corner: three touches in all. The Netherlands wore orange; Bergkamp wore 8.
 * INFERRED / ILLUSTRATIVE: every position and run in metres (de Boer ≈ 58 yd away, left of centre just inside his own half; Bergkamp
 *  receiving on the RIGHT of the Argentine box, near the camera); the pass as a lofted diagonal with a ≈ 2.55 s flight, and that de Boer
 *  (a left-footer) struck it with his LEFT foot; the control at about knee height with the ball dropping over his left shoulder; which way
 *  Ayala was sold (drawn: lunging to the outside while the second touch goes inside him); Roa's spot off his line and his late dive;
 *  the shot's arc; Argentina's KIT on the day (the away/home question could not be verified: drawn in their home sky-blue and white stripes
 *  with black shorts and white socks, since orange does not clash with them); the Dutch white shorts and orange socks; Roa's dark keeper
 *  kit; the other players shown (both sides were down to ten men — Numan and Ortega had been sent off — drawn as ten v ten without names
 *  except Kluivert); the referee's black kit; the sunny late-afternoon light; the 1998 Vélodrome drawn as an open bowl with no roof
 *  (straight side stands, curved ends), the crowd split orange and sky blue, banners on the front wall, perimeter boards without brands;
 *  the 1998 adidas Tricolore ball drawn as a paper ball with blue triads and an orange (red) accent; camera placements and lenses; the
 *  celebration run.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 de Boer's pass): ch1 = the high main-stand broadcast camera in real time (the pass, touch one, touch
 * two, touch three, the net); ch2 = the TV slow-motion replay, low and close, orbiting Bergkamp's right side (the control that kills the
 * ball dead, the inside touch past Ayala, the outside-of-the-foot finish); ch3 = the replay from behind the goal (over Roa, the far corner,
 * the crowd); ch4 = a duotone lesson (the first touch kills it dead and sets up the next move). Seams are forward passages into the ball.
 * Ball physics: the pass is ballistic (g = 9.81), the control drops the ball dead with a small bounce, the shot is a rising drive; contact
 * points come from the solved skeleton (right toe) so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts through ONE
 * adapter, drawPlayer(). Handedness: the world is right-handed (goal line x = 0, net toward +x, +z toward the main camera), so an athlete
 * facing +x has his right side at +z and Bergkamp, on the right of the box, is the near side of the pitch.
 * Framing: the world is centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square window (1.45:1 … 1:1).
 * Inks: yellow (sun, grass with blue), orange (the Dutch, the crowd), blue (sky, Argentina's stripes, grass), navy (key line). Scenes read
 * only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–280 plate ops per frame; wide-shot
 * figures print at 'low' detail and passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,clampPose,runCycle,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',O='orange',Y='yellow',B='blue';
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
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?…]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`bergkamp film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py bergkamp-argentina-1998 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/bergkamp-argentina-1998/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Marseille',"Marseille, 1998, a World Cup quarter-final. The Netherlands, in orange, and Argentina are level at one-one in the last minute. Frank de Boer hits a long, long pass for Dennis Bergkamp. One, two, three... goal!",
  ['Marseille','quarter-final','The Netherlands','in orange','Argentina','last minute','Frank de Boer','long, long pass','Dennis Bergkamp','One','two','three','goal']),
 prov('Three touches','Watch again, slowly. Touch one: his right foot cushions the ball dead. Touch two: inside Roberto Ayala. Touch three: the outside of his foot.',
  ['Watch again','slowly','Touch one','right foot','cushions the ball dead','Touch two','inside Roberto Ayala','Touch three','the outside']),
 prov('Far corner','Over the keeper, Carlos Roa, into the far corner. Two-one! The Netherlands are into the semi-final!',
  ['Over the keeper','Carlos Roa','far corner','Two-one','semi-final']),
 prov('First touch','A perfect first touch kills the ball dead and sets up your next move.',
  ['A perfect first touch','kills the ball dead','sets up','your next move']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`bergkamp film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
/** a 3D polyline (near-clipped) into a path */
function line3(path:Path2D,c:Camera,pts:V3[]){let on=false;for(const p of pts){if(depthOf(c,p)<NEAR+.1){on=false;continue;}const q=P(c,p);if(on)path.lineTo(q[0],q[1]);else path.moveTo(q[0],q[1]);on=true;}}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

/** a mark that must read on grass or navy: knock the paper through first, then print the ink (1 extra op) */
function inkMark(s:Sheet,p:Path2D,ink=Y,cov=.95){s.knockout(p,.92);s.fill(ink,p,cov);}
/** a ring (cue highlight) as one knocked-out ribbon */
function ringMark(s:Sheet,x:number,y:number,r:number,w:number,ink=Y,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);inkMark(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),ink,cov);}
/** a dotted ground arrow from a to b (metres), drawn up to `u` */
function groundArrow(s:Sheet,c:Camera,a:[number,number],b:[number,number],u:number,bend:number,ink=Y,wm=.14){
 if(u<.02)return;const pts:Pt[]=[];const nx=-(b[1]-a[1]),nz=b[0]-a[0];
 for(let i=0;i<=20;i++){const v=i/20*u,p:V3=[lerp(a[0],b[0],v)+nx*bend*4*v*(1-v),.03,lerp(a[1],b[1],v)+nz*bend*4*v*(1-v)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
 if(pts.length<2)return;const w=Math.max(8,wm*kAt(c,[a[0],0,a[1]])),gaps:[number,number][]=[];for(let x=.08;x<.9;x+=.14)gaps.push([x,x+.05]);
 inkMark(s,ribbon(pts,w,{taper:.1,wobble:1,gaps}),ink);
 const e=pts[pts.length-1],d=pts[Math.max(0,pts.length-3)],an=Math.atan2(e[1]-d[1],e[0]-d[0]);
 inkMark(s,polyPath([[e[0]+Math.cos(an)*w*2.2,e[1]+Math.sin(an)*w*2.2],[e[0]+Math.cos(an+2.4)*w*1.7,e[1]+Math.sin(an+2.4)*w*1.7],[e[0]+Math.cos(an-2.4)*w*1.7,e[1]+Math.sin(an-2.4)*w*1.7]],true),ink);}

// ================= the Stade Vélodrome, 1998: an open bowl (no roof yet), straight side stands, curved ends, under a July sun =================
const CX=-52.5,OA=60,OB=41;
/** a point `off` metres outside the bowl's inner edge at angle θ (θ = 90° is the main stand, +z): straight sides, rounded virages */
function oval(th:number,off:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(OA+off)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(OB+off)*Math.sign(s)*Math.pow(Math.abs(s),.2)];}
const NS=48;
const standH=(th:number)=>17+7*Math.abs(Math.sin(th)),standD=(th:number)=>30+8*Math.abs(Math.sin(th));
const standPt=(th:number,v:number):V3=>oval(th,standD(th)*v,1.3+standH(th)*v);
/** crowd: [θ, v, ink 0 paper / 1 navy / 2 orange / 3 blue (Argentina's sky blue), phase]; the Dutch fill most of the bowl in orange */
const CROWD=(()=>{const r=rng(1998),out:[number,number,number,number][]=[];for(let i=0;i<1500;i++){const th=r()*TAU,v=.05+r()*.9,c=r(),blueEnd=Math.max(0,Math.cos(th+Math.PI))>.7?.34:.12;out.push([th,v,c<.4?2:c<.4+blueEnd?3:c<.78?0:1,r()*TAU]);}return out;})();
/** banners hung on the front wall: [θ, kind 0 orange / 1 sky-blue-and-white stripes] */
const BANNERS:[number,number][]=Array.from({length:18},(_,i)=>[(i/18)*TAU+.11,(i*7)%5===0?1:0]);
/** the July sun, far away over the far stand */
const SUN:V3=[-120,190,-620];
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.6;
 // a hot, clear Marseille sky: blue bands deepening upward, a big yellow sun with stepped halo rings
 s.field(B,.16,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 [.12,.22,.34].forEach((d,i)=>s.tone(B,polyPath([[-Bnd,hz-300-i*220],[Bnd,hz-300-i*220],[Bnd,i===2?-Bnd*2:hz-520-i*220],[-Bnd,i===2?-Bnd*2:hz-520-i*220]],true),d));
 if(depthOf(c,SUN)>50){const[sx,sy]=P(c,SUN);if(Math.abs(sx)<Bnd&&sy>-Bnd&&sy<hz){const disc=(r:number)=>polyPath(Array.from({length:32},(_,i)=>[sx+Math.cos(i/32*TAU)*r,sy+Math.sin(i/32*TAU)*r] as Pt),true);
  s.knockout(disc(250),.35);s.tone(Y,disc(250),.2);s.tone(Y,disc(170),.32);s.fill(Y,disc(100),.95);}}
 // the bowl: stands knocked out, a navy screen, stepped rows; the front wall
 const stands=new Path2D(),rows=new Path2D(),walls=new Path2D(),rim=new Path2D();
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;addPoly(stands,clipPoly(c,[standPt(a,0),standPt(b,0),standPt(b,1),standPt(a,1)]));
  for(let k=0;k<12;k+=2)addPoly(rows,clipPoly(c,[standPt(a,k/12),standPt(b,k/12),standPt(b,(k+1)/12),standPt(a,(k+1)/12)]));
  addPoly(walls,clipPoly(c,[standPt(a,0),standPt(b,0),oval(b,0,0),oval(a,0,0)]));
  const ta=standPt(a,1),tb=standPt(b,1);addPoly(rim,clipPoly(c,[ta,tb,add(tb,[0,1.4,0]),add(ta,[0,1.4,0])]));}
 s.knockout(stands);s.tone(K,stands,.38);s.tone(B,rows,.26);s.tone(K,rows,.16);
 // crowd heads: faces, orange shirts and scarves, navy, Argentina's sky blue — bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[th,v,col,ph] of CROWD){const bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=standPt(th,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,4,18),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.9);if(seen[2])s.fill(O,heads[2],.95);if(seen[3]){s.knockout(heads[3],.9);s.fill(B,heads[3],.6);}
 // camera flashes when the goal goes in (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const p=standPt(r()*TAU,.08+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,walls,.7);s.fill(K,rim,.85);
 // banners on the front wall: orange flags and sky-blue-and-white stripes
 {const orng=new Path2D(),blu=new Path2D(),back=new Path2D();let n=0;
  BANNERS.forEach(([th,kind],i)=>{const th1=th+.07,sag=(u:number)=>Math.sin(tt*3+i+u*3)*.08;
   const q=[oval(th,0,1.3),oval(th1,0,1.3),oval(th1,0,.35+sag(1)),oval(th,0,.35+sag(0))];if(q.every(p=>depthOf(c,p)<3))return;const pq=clipPoly(c,q);if(pq.length<3)return;n++;addPoly(back,pq);
   if(kind===0)addPoly(orng,pq);else for(let k=0;k<5;k+=2){const u0=k/5,u1=(k+1)/5,a=(v:number,y:number)=>{const A=oval(lerp(th,th1,v),0,y);return A;};addPoly(blu,clipPoly(c,[a(u0,1.3),a(u1,1.3),a(u1,.35),a(u0,.35)]));}});
  if(n){s.knockout(back);s.fill(O,orng,.95);s.fill(B,blu,.7);}}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-40],[6,0,-40],[6,0,40],[-110,0,40]]));s.knockout(gp);inkMark(s,gp,Y,.88);s.tone(B,gp,.58);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 boards(s,c);
 goal(s,c,o.net);
}
/** perimeter boards: blank colour blocks (no brands) along the touchlines and behind the goal */
function boards(s:Sheet,c:Camera){
 const inks=[new Path2D(),new Path2D(),new Path2D()],back=new Path2D();let i=0;
 const run=(a:[number,number],b:[number,number],n:number)=>{for(let k=0;k<n;k++){const u0=k/n,u1=(k+.94)/n,p0:[number,number]=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:[number,number]=[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)];
  const q=clipPoly(c,[[p0[0],0,p0[1]],[p1[0],0,p1[1]],[p1[0],.9,p1[1]],[p0[0],.9,p0[1]]]);addPoly(back,q);addPoly(inks[(i++)%3],q);}};
 run([-102,-37.5],[-3,-37.5],14);run([-102,37.5],[-3,37.5],14);run([5.5,-28],[5.5,28],8);
 s.knockout(back);s.fill(B,inks[0],.8);s.fill(O,inks[1],.85);s.fill(Y,inks[2],.95);s.tone(K,back,.12);
}
/** the goal at x = 0: posts, bar, a box net held by stanchions; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){const col:V3[]=[];for(let j=0;j<=nv;j++)col.push(f(i/nu,j/nv));line3(mesh,c,col);}
  for(let j=0;j<=nv;j++){const row:V3[]=[];for(let i=0;i<=nu;i++)row.push(f(i/nu,j/nv));line3(mesh,c,row);}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (1998: the adidas Tricolore): paper, blue triads, an orange (red) accent, a blue shade =================
const BALL_R=.11;
function tricolore(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(O,disc,.18);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.3:.42);
 // triads turning with the spin: three fat curved blades round a small ring, foreshortened toward the rim; one accent stroke
 const tri=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,rr=r*(.28+.34*Math.abs(Math.sin(spin*.5+k*1.9))),cx=Math.cos(a)*rr,cy=Math.sin(a)*rr,f=1-.45*rr/r;
  for(let j=0;j<3;j++){const b=a*1.2+j*TAU/3;tri.addPath(ribbon([[cx+Math.cos(b-.55)*r*.24*f,cy+Math.sin(b-.55)*r*.24*f],[cx+Math.cos(b)*r*.3*f,cy+Math.sin(b)*r*.3*f],[cx+Math.cos(b+.55)*r*.24*f,cy+Math.sin(b+.55)*r*.24*f]],Math.max(2,r*.1*f),{taper:.7,wobble:0}));}}
 const aa=spin*.7;acc.addPath(ribbon([[Math.cos(aa)*r*.12,Math.sin(aa)*r*.12],[Math.cos(aa+.8)*r*.42,Math.sin(aa+.8)*r*.42]],Math.max(2,r*.12),{taper:.6,wobble:0}));
 s.fill(duo?K:B,tri,.95);s.fill(O,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.15,.55));}

// ================= kits (4 July 1998) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[O,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.48],[O,.3],[B,.08]],SKIN_D:AthleteStyle['skin']=[[O,.45],[Y,.55],[K,.3]];
/** the Netherlands: orange shirts, white shorts, orange socks */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:'paper',socks:O,trim:'paper',boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
/** Argentina: sky-blue and white stripes, black shorts, white socks (see INFERRED) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.62],shorts:[K,.9],socks:'paper',trim:K,boots:K,skin:SKIN_M,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const BERGKAMP:AthleteStyle=NED({number:8,numberInk:'paper',hair:[Y,.62],build:{height:1.88,bulk:.94,thighs:1},seed:8});
const DEBOER:AthleteStyle=NED({hair:[Y,.7],build:{height:1.79,bulk:1.02},seed:4});
const AYALA:AthleteStyle=ARG({hair:K,build:{height:1.77,bulk:1.04},seed:2});
const ROA:AthleteStyle={shirt:[K,.62],shorts:[K,.9],socks:[K,.62],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',gloves:'paper',line:K,sleeves:'long',shade:[K,.26],build:{height:1.84},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** duotone versions for the lesson chapter (navy + orange + paper) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,pattern:'plain',shirt:lead?O:[O,.35],shorts:lead?'paper':[K,.3],socks:lead?O:[O,.35],trim:'paper',skin:lead?[[O,.3]]:[[O,.15]],hair:lead?[K,.6]:[K,.5],shade:[K,.2],numberInk:'paper'});
/** a halftone echo print of a pose (chronophotograph stamps in the lesson) */
const ECHO:AthleteStyle={shirt:[O,.45],shorts:[O,.25],socks:[O,.3],boots:[K,.6],skin:[[O,.2]],hair:[K,.5],line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',seed:99};

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 de Boer's pass) =================
const G=9.81;
const BB:Build=BERGKAMP.build!;
const TP=2.55;// the pass: a long lofted diagonal, about 58 yards
const T2=TP+.62,T3=TP+1.24;// touch two (inside Ayala), touch three (the finish)
const SHT=.5,T_GOAL=T3+SHT;
const KICK:V3=[-59,.11,-10];// de Boer, left of centre, just inside his own half
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

// ---- Bergkamp: the three touches as ONE keyed spline on τ (control in the air, inside touch, outside-of-the-foot finish) ----
/** the finish: the strike with the toes turned IN at contact, so the outside of the right boot meets the ball */
const SHOT=(u:number):Pose=>{const p=strike(u,{power:.72}),w=Math.exp(-Math.pow((u-STRIKE_CONTACT)/.16,2));p.rHipR-=34*D2R*w;p.rHipA-=8*D2R*w;p.rAnk+=6*D2R*w;return clampPose(p);};
const REACH=posed({lHipF:22,lKnee:40,lAnk:6,rHipF:40,rKnee:92,rAnk:20,lean:2,lShA:48,rShA:42,lShF:10,rShF:-10,lElb:50,rElb:50,neckP:-20,neckY:22,twist:6});
/** touch one: the right foot up to meet the dropping ball, arms wide, eyes on it */
const CONTROL=posed({lHipF:8,lKnee:26,lAnk:18,rHipF:76,rKnee:56,rAnk:-14,rHipR:18,rHipA:6,lean:4,lShA:74,rShA:58,lShF:-12,rShF:22,lElb:30,rElb:36,neckP:34,neckY:4,twist:8});
/** the cushion: the foot gives way with the ball so it drops dead */
const CUSHION=posed({lHipF:14,lKnee:34,lAnk:12,rHipF:34,rKnee:54,rAnk:4,rHipR:10,lean:10,pitch:3,lShA:58,rShA:46,lElb:40,rElb:44,neckP:40,twist:4,squash:-.04});
const STEP_R=posed({lHipF:-14,lKnee:40,lAnk:30,rHipF:26,rKnee:20,rAnk:-6,lean:12,pitch:5,lShA:36,rShA:30,lShF:30,rShF:-20,lElb:70,rElb:70,neckP:34});
const LOAD_L=posed({lHipF:30,lKnee:36,lAnk:-4,rHipF:-22,rKnee:62,rAnk:30,lean:12,pitch:4,lShA:52,rShA:40,lElb:50,rElb:50,neckP:36,twist:-6});
/** touch two: the inside of the right boot rolls it across his body, inside Ayala */
const TOUCH2=posed({lHipF:14,lKnee:34,lAnk:4,rHipF:26,rHipA:-16,rHipR:34,rKnee:24,rAnk:4,lean:10,pitch:3,twist:-14,lShA:66,rShA:52,lShF:-6,rShF:18,lElb:36,rElb:40,neckP:40,neckY:-10});
const PUSH=posed({lHipF:-10,lKnee:40,lAnk:26,rHipF:30,rKnee:30,rHipA:-6,lean:14,pitch:6,lShA:40,rShA:30,lShF:30,rShF:-24,lElb:70,rElb:70,neckP:30});
// yaws and ball contact points; each place is solved from the skeleton so the boot meets the ball exactly
const Y1=YAW(1,-.22),Y2=YAW(1,-.34);
const B1XZ:[number,number]=[-10.3,9.4],B2:V3=[-9.1,.11,9.05],B3:V3=[-7.9,.11,7.4];
const NET_TO:V3=[0,2.12,-2.85];// the far corner, high (the far post from the main camera)
const Y3=YAW(NET_TO[0]-B3[0],NET_TO[2]-B3[2])+14*D2R;// outside of the foot: the ball leaves to the right of where he faces
const SK1=solve(CONTROL,BB,{yaw:Y1}),SK2=solve(TOUCH2,BB,{yaw:Y2}),SK3=solve(SHOT(STRIKE_CONTACT),BB,{yaw:Y3});
const B1:V3=[B1XZ[0],SK1.rToe[1]+.1,B1XZ[1]];
const P1:[number,number]=[B1[0]-SK1.rToe[0],B1[2]-SK1.rToe[2]],P2:[number,number]=[B2[0]-SK2.rToe[0],B2[2]-SK2.rToe[2]],P3:[number,number]=[B3[0]-SK3.rToe[0],B3[2]-SK3.rToe[2]];
const [d1x,d1z]=dirOf(Y1),[d3x,d3z]=dirOf(Y3);
const PA:[number,number]=[P1[0]-d1x*1.9,P1[1]-d1z*1.9];
const MOVE_T0=TP-.55,MOVE_T1=T3+.5;
const B_RUN:MKey[]=[[-8,-36,19],[-3,-30,17.5],[0,-24,15.5],[MOVE_T0,PA[0],PA[1]]];
const PLACE_KEYS:MKey[]=[[MOVE_T0,PA[0],PA[1]],[TP,P1[0],P1[1]],[T2,P2[0],P2[1]],[T3,P3[0],P3[1]],[MOVE_T1,P3[0]+d3x*.7,P3[1]+d3z*.7]];
const YAW_KEYS:[number,number][]=[[MOVE_T0,Y1],[TP,Y1],[T2-.2,Y2],[T2+.1,lerpAng(Y2,Y3,.5)],[T3-.3,Y3],[MOVE_T1,Y3]];
const yawAt=(tau:number)=>{let i=0;while(i<YAW_KEYS.length-2&&tau>=YAW_KEYS[i+1][0])i++;const a=YAW_KEYS[i],b=YAW_KEYS[i+1];return lerpAng(a[1],b[1],easeInOutSine(clamp((tau-a[0])/(b[0]-a[0]))));};
const runPose=(tau:number)=>runner(B_RUN,tau,[B1[0],B1[1],B1[2]],2).pose;
const MOVE_KEYS:[number,Pose][]=[
 [MOVE_T0,runPose(MOVE_T0)],[TP-.26,REACH],[TP,CONTROL],[TP+.2,CUSHION],[TP+.4,STEP_R],[T2-.2,LOAD_L],[T2,TOUCH2],[T2+.2,PUSH],
 [T3-.3,SHOT(.22)],[T3-.14,SHOT(.4)],[T3,SHOT(STRIKE_CONTACT)],[T3+.14,SHOT(.7)],[T3+.3,SHOT(.85)],[MOVE_T1,SHOT(1)],
];
const CELEB:MKey[]=[[MOVE_T1,P3[0]+d3x*.7,P3[1]+d3z*.7],[MOVE_T1+1.1,P3[0]-1.4,P3[1]+4.4],[MOVE_T1+2.4,P3[0]-3.2,P3[1]+9.6]];
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const B_SEGS:Seg[]=[
 [-99,t=>{const r=runner(B_RUN,t,ballAt(t),2);if(t>-1)r.pose={...r.pose,neckP:lerp(r.pose.neckP,-22*D2R,sm(-1,0,t)),neckY:lerp(r.pose.neckY,22*D2R,sm(-1,0,t))};return r;}],
 [MOVE_T0,t=>{const q=pathPos(PLACE_KEYS,t);return{pose:keyPoses(t,MOVE_KEYS,{torso:.03,arms:.05,head:.02}),place:{x:q.x,z:q.z,yaw:yawAt(t)}};}],
 [MOVE_T1,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(-1.8,5.2)}};}],
 [MOVE_T1+2.4,t=>{const e=CELEB[CELEB.length-1];return{pose:celebrate(Math.max(0,t-MOVE_T1-2.4)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(-1.8,5.2)}};}],
];
function segAt(segs:Seg[],tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=segs[a][1](tau),Bq=segs[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}
const bergAt=(tau:number)=>segAt(B_SEGS,tau);

// ---- de Boer: brings it forward, then the long diagonal with his left foot (contact at τ = 0), jogs on ----
const YG=YAW(B1[0]-KICK[0],B1[2]-KICK[2]);
const GR_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.9}),DEBOER.build,{yaw:YG});
const GP:[number,number]=[KICK[0]-GR_SK.lToe[0],KICK[2]-GR_SK.lToe[2]];
const [gbx,gbz]=dirOf(YG);
const DB_RUN:MKey[]=[[-8,GP[0]-gbx*9-1.2,GP[1]-gbz*9+.8],[-1.6,GP[0]-gbx*3.2,GP[1]-gbz*3.2],[-.6,GP[0]-gbx*1.1,GP[1]-gbz*1.1],[.5,GP[0]+gbx*.6,GP[1]+gbz*.6],[6,GP[0]+gbx*7,GP[1]+gbz*4]];

// ---- the ball: at de Boer's feet → the long pass (ballistic) → killed dead by touch one → rolled inside → the finish into the far corner ----
const VY=(B1[1]-KICK[1]+.5*G*TP*TP)/TP;
const DROP=Math.sqrt(2*(B1[1]-.11)/G);// the fall after the cushion
function ballAt(tau:number):V3{
 if(tau<-.6){const q=pathPos(DB_RUN,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.45+.2*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
 if(tau<0){const a=ballAt(-.6-1e-4),u=sm(-.6,-.15,tau,easeOut);return[lerp(a[0],KICK[0],u),.11,lerp(a[2],KICK[2],u)];}
 if(tau<TP){const u=tau/TP;return[lerp(KICK[0],B1[0],u),KICK[1]+VY*tau-.5*G*tau*tau,lerp(KICK[2],B1[2],u)];}
 if(tau<T2){// dead: it falls off the boot with almost no speed, one tiny bounce, then rolls a metre while he steps to it
  const s=tau-TP,u=s/(T2-TP),h=s<DROP?B1[1]-.5*G*s*s:.11+.07*Math.max(0,Math.sin(Math.PI*clamp((s-DROP)/.2)));
  return[lerp(B1[0],B2[0],easeOut(u)),Math.max(.11,h),lerp(B1[2],B2[2],easeOut(u))];}
 if(tau<T3){const u=(tau-T2)/(T3-T2),e=1-Math.pow(1-u,1.6);return[lerp(B2[0],B3[0],e),.11,lerp(B2[2],B3[2],e)];}
 const s=tau-T3;if(s<SHT){const u=s/SHT;return[lerp(B3[0],NET_TO[0],u),lerp(B3[1],NET_TO[1],u)+.7*4*u*(1-u),lerp(B3[2],NET_TO[2],u)-.5*Math.sin(Math.PI*u)];}
 const e=s-SHT,u=clamp(e/.16);if(u<1)return mix3(NET_TO,[1.75,1.95,-3.05],easeOut(u));
 const d=clamp((e-.16)/.55),h=1.95*(1-d*d)+.11*d*d;return[1.75-.25*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.71)*8))*Math.exp(-(e-.71)*3):0),-3.05+.2*d];}
const NET_HIT:V3=[2,1.95,-3.0];

// ---- Ayala: comes across to meet him, is sold to the outside as touch two goes inside him ----
const AY:[number,number]=[-7.3,9.7];
const AY_RUN:MKey[]=[[-8,-6.5,1.5],[0,-5.8,4],[TP-.3,AY[0],AY[1]]];
function ayalaAt(tau:number,b:V3):{pose:Pose;place:Place}{
 const L0=T2-.36,L1=T2+.36;
 if(tau<L0){const r=runner(AY_RUN,tau,b,5,backpedal(tau*2.2));if(tau>TP-.6)r.place.yaw=lerpAng(r.place.yaw??0,YAW(b[0]-AY[0],b[2]-AY[1]),sm(TP-.6,TP,tau));return r;}
 const yaw0=YAW(B2[0]-AY[0],B2[2]-AY[1]);
 if(tau<L1+.5)return{pose:lunge(clamp((tau-L0)/(L1-L0)),{side:'l'}),place:{x:AY[0],z:AY[1],yaw:yaw0}};
 // beaten: recovers and turns to watch it go
 const u=sm(L1+.5,L1+1.5,tau),x=AY[0]+.3*u,z=AY[1]+.25*u;return{pose:blendPose(lunge(1,{side:'l'}),{...backpedal(tau*1.6),neckP:-10*D2R},u),place:{x,z,yaw:lerpAng(yaw0,YAW(b[0]-x,b[2]-z),u)}};}
// ---- Roa: off his line toward the near post, then a late dive to his right as it flies past him ----
const ROA_PATH:MKey[]=[[-8,-1.2,.4],[TP,-1.7,1.8],[T3-.1,-2.3,2.7]];
function roaAt(tau:number,b:V3):{pose:Pose;place:Place}{
 const q=pathPos(ROA_PATH,tau);
 if(tau<T3-.05)return{pose:keeperSet(tau*1.6),place:{x:q.x,z:q.z,yaw:YAW(b[0]-q.x,b[2]-q.z)}};
 return{pose:keeperDive(clamp((tau-(T3-.05))/1.1),{side:'r',height:.75}),place:{x:q.x,z:q.z,yaw:YAW(B3[0]-q.x,B3[2]-q.z)}};}

// ---- everybody else (ten v ten after the two red cards) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const ACTORS:Actor[]=[
 {style:DEBOER,at:(t,b)=>{const r=runner(DB_RUN,t,b,1);if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2);r.pose=blendPose(r.pose,strike(u,{foot:'l',power:.9}),Math.sin(clamp((t+.7)/1.4)*Math.PI));r.place.yaw=YG;}return r;}},// 0 Frank de Boer
 {style:AYALA,at:ayalaAt},// 1 Roberto Ayala
 {style:ROA,at:roaAt},// 2 Carlos Roa
 mover(NED({number:9,numberInk:'paper',skin:SKIN_D,hair:K,build:{height:1.88}}),[[-8,-24,-2],[0,-19,-1],[T3,-9.5,-.5],[T_GOAL+2,-7,2]],3),// 3 Kluivert, into the box
 mover(NED({skin:SKIN_D,hair:K,hairStyle:'long',seed:26}),[[-8,-48,4],[0,-44,3],[T3,-36,4]],4),// 4 midfield
 mover(NED({seed:20}),[[-8,-54,14],[0,-49,12],[T3,-40,13]],5),// 5 midfield right
 mover(ARG({seed:41}),[[-8,-17,-6],[0,-15,-4.4],[T3,-9.8,-1.8]],6,backpedal(0)),// 6 with Kluivert
 mover(ARG({seed:42,skin:SKIN_L}),[[-8,-19,-14],[0,-16,-11],[T3,-12,-7.5]],7,backpedal(0)),// 7 left side
 mover(ARG({seed:43}),[[-8,-30,6],[0,-26,7.5],[T3,-17,9.5]],8),// 8 chasing back
 mover(ARG({seed:44,hairStyle:'long'}),[[-8,-38,-5],[0,-34,-4],[T3,-27,-1]],9),// 9 midfield
 mover(REF,[[-8,-44,14],[0,-38,12],[T3,-26,10.5]],10),// 10 the referee
];
const AYALA_I=1,ROA_I=2;
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Bergkamp with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g),hero=style===BERGKAMP;if(d<(hero?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&!hero&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&!hero&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>{drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail});}});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const be=bergAt(tp);put(BERGKAMP,be,o.hero?bergAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)ringMark(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  tricolore(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,berg:be};}
/** a touch pulse: a ring that pops round the ball at each of the three touches (τ times), fading over .7 s */
function touchPulses(s:Sheet,c:Camera,tp:number,scale=1,which=[TP,T2,T3]){
 for(const tc of which){const a=tp-tc;if(a<0||a>.7)continue;const b=ballAt(tc),q=P(c,b),k=kAt(c,b),r=Math.max(16,(.35+.5*easeOut(clamp(a/.35)))*k)*scale;ringMark(s,q[0],q[1],r,Math.max(4,.06*k),Y,.95*(1-sm(.45,.7,a)));}}

// ================= chapter 1 (live, real time): the high main-stand camera; the long pass, three touches, the net =================
const ch1q=()=>({m:T(0,'Marseille'),qf:T(0,'quarter-final'),nl:T(0,'The Netherlands'),io:T(0,'in orange'),ar:T(0,'Argentina'),lm:T(0,'last minute'),fdb:T(0,'Frank de Boer'),lp:T(0,'long, long pass'),db:T(0,'Dennis Bergkamp'),one:T(0,'One'),two:T(0,'two'),three:T(0,'three'),g:T(0,'goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. Touch one lands on "One" when the voice allows; the pass always leaves after "Frank de Boer". */
const ch1T=()=>{const q=ch1q(),TL=Math.max(q.fdb+.2,Math.min(q.one-TP,q.end-T_GOAL-1.2));return{TL,end:q.end};};
const BCAM:V3=[-36,21,58];
/** before the pass the director's camera tells the story with the words: the bowl → the Dutch → Argentina → de Boer on the ball */
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-52,6,-6],[q.qf,-46,3,-2],[q.nl,-46,1.2,4],[q.ar,-22,1.2,0],[q.lm,-30,1.2,2],[q.fdb,GP[0]+2,1.1,GP[1]],[q.lp,GP[0]+6,1.4,GP[1]+3]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<0)return[GP[0]+6,1.4,GP[1]+3];
 if(tau<TP){const u=sm(0,TP,tau);return mix3([lerp(b[0],B1[0],.3),Math.min(b[1],5)*.5+1,lerp(b[2],B1[2],.3)],[B1[0]-1,1.2,B1[2]-.5],u*u);}
 return mix3([B1[0]-1,1.2,B1[2]-.5],[lerp(B3[0],-1.5,.55),1.3,lerp(B3[2],2,.55)],sm(TP+.2,T_GOAL,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL-1.2,TL,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1900],[q.qf,2300],[q.nl,3300],[q.ar,3400],[q.lm,2900],[q.fdb,5400],[TL-.1,5600],[TL+.7,3300],[TL+TP-.9,4600],[TL+TP-.1,8400],[TL+T3,8600],[TL+T_GOAL+.3,6200],[q.end,6600]]),easeInOutSine);return cam(BCAM,look,F);}
/** team rings: on "in orange" orange rings print round the Dutch, on "Argentina" blue rings round the stripes */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),ro=sm(q.io,q.io+.3,t,easeOutBack)*(1-sm(q.ar,q.ar+.5,t)),ra=sm(q.ar,q.ar+.3,t,easeOutBack)*(1-sm(q.lm+.3,q.lm+.9,t));
 if(ro<.02&&ra<.02)return;const bp=ballAt(tp),po=new Path2D(),pa=new Path2D();
 const ring=(path:Path2D,x:number,z:number,g:number)=>{const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));};
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place;if(a.style.shirt===O&&ro>.02)ring(po,p.x??0,p.z??0,ro);if(a.style.pattern==='stripes'&&ra>.02)ring(pa,p.x??0,p.z??0,ra);});
 const h=bergAt(tp).place;if(ro>.02)ring(po,h.x??0,h.z??0,ro);
 if(ro>.02)inkMark(s,po,O,.95);if(ra>.02)inkMark(s,pa,B,.9);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL,tp=tt-TL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  teamRings(s,c,tp,t);
  // "Dennis Bergkamp": a yellow ring at his feet and a dotted mark where the long ball will come down
  const db=sm(q.db-.1,q.db+.3,tt,easeOutBack)*(1-sm(TL+TP-.2,TL+TP+.2,tt));
  if(db>.02){const h=bergAt(tp).place,g=groundRing(c,h.x??0,h.z??0,1.1*db);if(g.length>2)inkMark(s,ribbon(g,Math.max(6,.14*kAt(c,[h.x??0,0,h.z??0])),{close:true,taper:0,wobble:.6}));
   const lm=groundRing(c,B1[0],B1[2],.8*db,20);if(lm.length>2){const gaps:[number,number][]=[];for(let x=.04;x<1;x+=.12)gaps.push([x,x+.06]);inkMark(s,ribbon(lm,Math.max(5,.1*kAt(c,B1)),{close:true,taper:0,wobble:.4,gaps}));}}
  // "long, long pass": the ball's flight drawn as dots behind it while it hangs in the air
  if(tp>0&&tp<TP+.2){const dots=new Path2D();let n=0;for(let i=0;i<=16;i++){const t2=Math.max(0,tp-.9)+(Math.min(tp,TP)-Math.max(0,tp-.9))*i/16,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.05*kAt(c,p),3,10);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);n++;}if(n)s.fill(K,dots,.55);}
  drawWorld(s,c,t-TL,tp,{ballMin:13,cap:t>q.end-.7});
  // "One, two, three": a ring pops round the ball at each touch
  touchPulses(s,c,tp);},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:11,
};

// ================= chapter 2 (TV replay, slow motion, low and close on his right side): touch one kills it, touch two inside Ayala, touch three =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),t1:T(1,'Touch one'),rf:T(1,'right foot'),cu:T(1,'cushions the ball dead'),t2:T(1,'Touch two'),ia:T(1,'inside Roberto Ayala'),t3:T(1,'Touch three'),ou:T(1,'the outside'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,TP-1.2],[q.t1+.35,TP],[q.cu+.5,TP+.3],[q.t2+.4,T2],[q.ia+.8,T2+.35],[q.t3+.4,T3-.1],[q.ou+.3,T3],[q.end,T3+.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),be=bergAt(tau).place,b0=ballAt(tau),bd=sub(b0,[be.x??0,.95,be.z??0]),bl=Math.hypot(bd[0],bd[1],bd[2]),b=add([be.x??0,.95,be.z??0],mul(bd,Math.min(1,3.2/Math.max(.01,bl)))),orbit=sm(q.t1,q.ou,t,easeInOutSine);
 const ang=lerp(Y1-100*D2R,Y3-40*D2R,orbit),[fx,fz]=dirOf(ang),D=lerp(7.4,6.2,sm(0,q.t1,t))+.6*sm(q.ou,q.end,t);
 const body:V3=[be.x??0,.95,be.z??0],pos:V3=[body[0]+fx*D,1.0,body[2]+fz*D];
 const w=key(t,mono([[0,.15],[q.t1-.6,.3],[q.t1,.5],[q.cu+.4,.55],[q.t2,.5],[q.t3,.45],[q.end,.4]])),F=key(t,mono([[0,1250],[q.sl,1450],[q.t1,1700],[q.rf,1900],[q.cu+.6,1750],[q.t2,1600],[q.t3,1650],[q.ou+.2,1700],[q.end,1400]]));
 return cam(pos,mix3([b[0],Math.min(b[1],2.4),b[2]],body,w),F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "inside Roberto Ayala": a dotted arrow on the grass that curls inside him, and his outward lunge printed as a navy dash
  const ia=sm(q.ia-.1,q.ia+.7,tt)*(1-sm(q.t3+.5,q.t3+1.1,tt));
  if(ia>.02){groundArrow(s,c,[B2[0],B2[2]],[B3[0],B3[2]],clamp(ia*1.3),-.12);
   const gaps:[number,number][]=[];for(let x=.1;x<.9;x+=.2)gaps.push([x,x+.1]);const a=P(c,[AY[0],.03,AY[1]]),b=P(c,[AY[0]-.3,.03,AY[1]+1.4*ia]);s.fill(K,ribbon([a,b],Math.max(5,.08*kAt(c,[AY[0],0,AY[1]])),{taper:.3,wobble:.5,gaps}),.8);}
  const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:true,glow:sm(q.t1-.2,q.t1+.2,tt)*(1-sm(q.cu,q.cu+.5,tt)),cap:t>q.end-.7||t<.75});
  // "cushions the ball dead": the ball's flight drawn as speed lines that stop at the boot, then a flat ring where it drops dead
  if(tp>TP-.35&&tp<TP){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:8,len:150,width:6,cov:.7});}
  const dd=sm(q.cu+.2,q.cu+.6,tt,easeOutBack)*(1-sm(q.t2,q.t2+.4,tt));
  if(dd>.02){const g=groundRing(c,w.ball[0],w.ball[2],.42*dd,20);if(g.length>2)inkMark(s,ribbon(g,Math.max(6,.07*kAt(c,w.ball)),{close:true,taper:0,wobble:.5}));
   if(w.ball[1]>.16){const a=P(c,w.ball),b=P(c,[w.ball[0],.05,w.ball[2]]),gaps:[number,number][]=[];for(let x=.1;x<1;x+=.2)gaps.push([x,x+.1]);inkMark(s,ribbon([a,b],Math.max(4,.035*kAt(c,w.ball)),{taper:0,wobble:0,gaps}));}}
  // "right foot" / "the outside": a ring round the right boot (at the outside edge for touch three)
  const rf=sm(q.rf,q.rf+.3,tt,easeOutBack)*(1-sm(q.cu+.3,q.cu+.8,tt)),ou=sm(q.ou-.1,q.ou+.25,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));
  if(rf>.02||ou>.02){const be=bergAt(tp),sk=solve(be.pose,BB,be.place),out:V3=ou>.02?add(sk.rToe,mul([sk.fr.rFt[2],sk.fr.rFt[5],sk.fr.rFt[8]],.06)):sk.rToe,p=P(c,out),r=.3*kAt(c,out)*Math.max(rf,ou);ringMark(s,p[0],p[1],r,Math.max(5,.035*kAt(c,out)));}
  // touch pulses on the ball, sparks at the finish and speed lines as it leaves
  touchPulses(s,c,tp,.8,[TP,T2]);
  if(tp>=T3&&tp<T3+.25){const p=P(c,B3);sparkBurst(s,Y,p[0],p[1],100+110*sm(T3,T3+.1,tp,easeOut),{n:10,seed:88,g:1-sm(T3+.1,T3+.25,tp),width:12});}
  if(tp>=T3&&tp<T3+.5&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:160,width:7,cov:.85});}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 (replay from behind the goal): over Roa, into the far corner, the Vélodrome erupts =================
const ch3q=()=>({ok:T(2,'Over the keeper'),cr:T(2,'Carlos Roa'),fc:T(2,'far corner'),to:T(2,'Two-one'),sf:T(2,'semi-final'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,T3-.5],[q.ok+.2,T3],[q.cr+.3,T3+.28],[q.fc+.2,T_GOAL+.05],[q.to+.2,T_GOAL+.7],[q.end,T_GOAL+.7+(q.end-q.to-.2)*.9]]),x=>x);};
const GCAM:V3=[6.6,2.0,.3];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02));
 const toBall=sm(q.ok-.2,q.cr+.3,t,easeInOutSine),toFans=sm(q.to,q.to+1.3,t,easeInOutSine);
 const look0:V3=[P3[0],1.2,P3[1]],look1:V3=[b[0],clamp(b[1],1,3),b[2]],c=CELEB[CELEB.length-1],look2:V3=[c[1],1.4,c[2]];
 const corner:V3=[0,1.9,-2.6],look=mix3(mix3(mix3(look0,look1,toBall),corner,.55*sm(q.fc-.6,q.fc,t)),look2,toFans);
 const pos:V3=add(GCAM,[.3*toFans,.5*toFans,.9*toFans]),F=key(t,mono([[0,2500],[q.ok,2100],[q.cr,1900],[q.fc+.3,1600],[q.to,1600],[q.to+1.3,3200],[q.end,3600]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.fc+.2;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:30,hero:false,cap:t>q.end-.7||t<.75,skip:[0,4,5,9,10]});
  // "Over the keeper" / "Carlos Roa": his reach — a dashed line up from his gloves — and the ball sailing above it
  const reach=sm(q.cr,q.cr+.35,tt,easeOutBack)*(1-sm(q.fc+.3,q.fc+.8,tt));
  if(reach>.02){const rk=ACTORS[ROA_I].at(tp,ballAt(tp)),sk=solve(rk.pose,ROA.build,rk.place),hand=sk.rHa[1]>sk.lHa[1]?sk.rHa:sk.lHa,a=P(c,hand),b=P(c,[hand[0],hand[1]+.7*reach,hand[2]]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.22)gaps.push([u,u+.1]);
   const k=kAt(c,hand);inkMark(s,ribbon([a,b],Math.max(6,.07*k),{taper:0,wobble:0,gaps}));inkMark(s,ribbon([[b[0]-.3*k,b[1]],[b[0]+.3*k,b[1]]],Math.max(6,.07*k),{taper:.2,wobble:0}));}
  // the ball's path: dotted ink while it flies
  if(tp>T3&&tp<T_GOAL+.3){const dots=new Path2D();let n=0;for(let i=0;i<=16;i++){const t2=T3+(Math.min(tp,T_GOAL)-T3)*i/16,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),4,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);n++;}if(n)s.fill(K,dots,.6);}
  if(tp>T3+.1&&tp<T_GOAL+.05&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:170,width:7,cov:.8});}
  // "far corner": a yellow corner bracket printed in the angle of the far post and the bar
  const br=sm(q.fc,q.fc+.3,tt,easeOutBack)*(1-sm(q.sf,q.sf+.8,tt));if(br>.02){const C0:V3=[0,2.44,-3.66],k=kAt(c,C0),a=P(c,[0,2.44-.9*br,-3.66]),m=P(c,C0),b=P(c,[0,2.44,-3.66+.9*br]);inkMark(s,ribbon([a,m,b],Math.max(8,.14*k),{taper:.1,wobble:1}));}
  // "Two-one" / "semi-final": orange and sky-blue paper confetti over the celebration
  const cf=sm(q.to,q.to+.4,tt)*(1-sm(q.end-.8,q.end-.3,tt));
  if(cf>.02){const r=rng(19),po=new Path2D(),pp=new Path2D();for(let i=0;i<26;i++){const x=(r()-.5)*s.W*1.1,y0=-s.H*.6+r()*s.H*.3,y=y0+((tt-q.to)*(160+r()*120)+r()*400)%(s.H*1.2),a=r()*TAU+tt*(2+r()*3),sz=14+r()*16,pts:Pt[]=[[x+Math.cos(a)*sz,y+Math.sin(a)*sz*.5],[x+Math.cos(a+2)*sz,y+Math.sin(a+2)*sz*.5],[x+Math.cos(a+3.6)*sz,y+Math.sin(a+3.6)*sz*.5]];(i%3?po:pp).addPath(polyPath(pts,true));}
   s.fill(O,po,.95*cf);s.knockout(pp,.9*cf);}
 },
 aperture(t){const c=ch3Cam(t),tau=tau3(t),p=ballAt(tau);let x:number,y:number;if(depthOf(c,p)>NEAR+.6){[x,y]=P(c,p);}else{x=0;y=0;}const r=Math.max(22,Math.min(160,BALL_R*kAt(c,p)));return apertureDisc(x,y,r*.92,12);},
 still:4.2,
};

// ================= chapter 4 (duotone lesson): the first touch kills the ball dead and sets up the next move =================
const ch4q=()=>({a:T(3,'A perfect first touch'),k:T(3,'kills the ball dead'),su:T(3,'sets up'),nm:T(3,'your next move'),end:SEC(3)});
/** lesson clock: the pass drops in under "A perfect first touch", the ball dies on "kills the ball dead", holds dead through "sets up",
 * then the next two touches run at real speed on "your next move" */
const tau4=(t:number)=>{const q=ch4q(),nm=Math.max(q.nm,q.su+.6);return key(t,mono([[0,TP-1.3],[q.a+.5,TP-.15],[q.k+.3,TP],[q.k+1.1,TP+.3],[nm,TP+.36],[nm+1.1,T3+.1],[q.end,T3+.25+(q.end-nm-1.1)*.3]]),x=>x);};
const BERG4=duo(BERGKAMP,true),AYALA4:AthleteStyle={...duo(AYALA),shirt:'paper',pattern:'stripes',patternInk:[K,.45],shorts:[K,.6],socks:'paper'};
const LCAM=(t:number)=>{const q=ch4q(),v=key(t,mono([[0,-1.6,1.1,7.6,2300],[q.a,-1.4,1,6.8,2600],[q.k,-.8,.9,6.2,3000],[q.su,.2,1.1,7.2,2600],[q.nm,.8,1.3,8.4,2300],[q.end,1.2,1.5,9.2,2100]]),easeInOutSine,true);
 const h=bergAt(tau4(t)).place,fx=lerp(P1[0],h.x??0,.85),fz=lerp(P1[1],h.z??0,.6);
 return cam([fx+v[0],v[1],fz+v[2]],[fx+v[0]*.3+.5,.9,fz-.8],v[3]);};
/** the three stamps: control, touch two, the finish */
const STAMPS:number[]=[TP,T2,T3];
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground stepped orange light round the first touch
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[P1[0]-40,0,P1[1]-30],[P1[0]+40,0,P1[1]-30],[P1[0]+40,0,P1[1]+8],[P1[0]-40,0,P1[1]+8]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,B1[0],B1[2],r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5.5),.2);s.tone(O,pool(3.2),.2);s.tone(O,pool(1.6),.34);
  // "A perfect first touch": the long ball's last metres as a dotted arc dropping onto the boot
  const arcU=sm(q.a-.1,q.a+.6,tt)*(1-sm(q.k+.3,q.k+.9,tt));
  if(arcU>.02){const dots=new Path2D();for(let i=0;i<=12;i++){const t2=TP-1+i/12,p=ballAt(t2);if(t2>TP-1+arcU||depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p);dots.moveTo(pp[0]+9,pp[1]);dots.arc(pp[0],pp[1],9,0,TAU);}inkMark(s,dots,O);}
  // "kills the ball dead": a stop stamp — two stepped rings printed flat on the ground where it dies
  const kd=sm(q.k+.25,q.k+.6,tt,easeOutBack)*(1-sm(q.nm+.2,q.nm+.7,tt));
  if(kd>.02){const bd=ballAt(TP+.3);for(const [r,wm] of [[.55,.08],[.9,.05]] as [number,number][]){const g=groundRing(c,bd[0],bd[2],r*kd,28);if(g.length>2)inkMark(s,ribbon(g,Math.max(5,wm*kAt(c,bd)),{close:true,taper:0,wobble:.5}),O);}}
  // "sets up": the plan — a dotted arrow for touch two, and a second one for the shot toward the far post
  const su=sm(q.su,q.su+.7,tt)*(1-sm(q.end-.9,q.end-.4,tt));
  if(su>.02){groundArrow(s,c,[B2[0],B2[2]],[B3[0],B3[2]],clamp(su*1.4),-.12,O,.1);groundArrow(s,c,[B3[0],B3[2]],[lerp(B3[0],NET_TO[0],.35),lerp(B3[2],NET_TO[2],.35)],clamp(su*1.4-.5),0,O,.1);}
  // chronophotograph: each touch leaves a halftone echo print of that instant after it happens
  STAMPS.forEach(ts=>{if(tp<ts+.3||tt<q.nm-.2&&ts>TP)return;const h=bergAt(ts);drawPlayer(s,h.pose,c,ECHO,h.place,{detail:'low'});});
  const items:Item[]=[],h=bergAt(tp),hp=bergAt(tp-1/12);
  const ay=ACTORS[AYALA_I].at(tp,ballAt(tp));if(tp<T2+.45)items.push({depth:depthOf(c,[ay.place.x??0,0,ay.place.z??0]),draw:()=>{drawPlayer(s,ay.pose,c,AYALA4,ay.place,{detail:'mid'});}});
  items.push({depth:depthOf(c,[h.place.x??0,0,h.place.z??0]),draw:()=>{drawPlayer(s,h.pose,c,BERG4,h.place,{prev:hp,smear:true});}});
  const bpos=ballAt(tau);items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(20,BALL_R*kAt(c,bpos)),hit=tau>=TP&&tau<TP+.12?.25*(1-(tau-TP)/.12):0;
   tricolore(s,bp[0],bp[1],r,tau*9,{duo:true,sq:Math.max(hit,clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(r*3),0,.7)),dir:hit>0?-Math.PI/2:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "A perfect first touch": a ring round the right boot as the ball arrives
  const ft=sm(q.a+.2,q.a+.6,tt,easeOutBack)*(1-sm(q.k+.4,q.k+.8,tt));if(ft>.02){const sk=solve(h.pose,BB,h.place),p=P(c,sk.rToe),r=.32*kAt(c,sk.rToe)*ft;ringMark(s,p[0],p[1],r,Math.max(6,.04*kAt(c,sk.rToe)),O);}
  // the finish: sparks, and the ball flies off toward the far post
  if(tp>=T3&&tp<T3+.25){const p=P(c,B3);sparkBurst(s,O,p[0],p[1],120,{n:10,seed:41,g:1-sm(T3+.1,T3+.25,tp),width:12});}
 },
 still:6,
};

const story:RisoStory={
 id:'bergkamp-argentina-1998',format:'11v11',title:"Bergkamp's three touches",
 theme:'A perfect first touch kills the ball dead and sets up your next move.',
 ageNote:'World Cup quarter-final, Netherlands 2–1 Argentina, Stade Vélodrome, Marseille, 4 July 1998. The winner in the last minute.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball drops onto the point and dies dead in a ring (the first touch). Reduced motion: the ball in its ring, still. */
 touch(s,x,y,age,seed){
  const fall=age<=0?0:Math.max(0,1-age/.3),land=age<=0?1:easeOutBack(clamp((age-.25)/.3)),y0=y-220*fall*fall;
  if(land>.02){const pts=Array.from({length:22},(_,i)=>{const q=i/22*TAU;return[x+Math.cos(q)*95*land,y+26+Math.sin(q)*26*land] as Pt;});s.knockout(ribbon(pts,12,{close:true,taper:0,wobble:.5}),.9);s.fill(Y,ribbon(pts,12,{close:true,taper:0,wobble:.5}),.95);}
  if(age>.25&&age<.5)sparkBurst(s,O,x,y,110*land,{n:8,seed,g:1-clamp((age-.25)/.25),width:10});
  tricolore(s,x,y0,50,age*6+hash(seed,3)*TAU,{sq:age>.25&&age<.4?.2:0,dir:-Math.PI/2});
 },
};
export default story;
