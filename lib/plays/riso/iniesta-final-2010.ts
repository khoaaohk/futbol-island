/** Iconic play film: Andrés Iniesta's World Cup-winning goal, 2010 FIFA World Cup final, Netherlands 0–1 Spain (after extra time),
 * Soccer City, Johannesburg, 11 July 2010, 116th minute.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/iniesta-final-2010/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/iniesta-final-2010/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/iniesta-final-2010/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (written accounts; web fetching and further searching were unavailable in this build session, so the facts below come from these
 * widely published accounts as previously read, NOT re-read now; the footage was not reviewed — the lead should spot-check before release):
 *  - Wikipedia, "2010 FIFA World Cup final" https://en.wikipedia.org/wiki/2010_FIFA_World_Cup_final
 *  - FIFA, "Iniesta's winner crowns Spain" / 2010 FIFA World Cup South Africa match report, Netherlands 0–1 Spain (a.e.t.) https://www.fifa.com
 *  - BBC Sport, "Netherlands 0–1 Spain (aet)" match report, 11 July 2010 https://news.bbc.co.uk/sport
 *  - The Guardian, "World Cup 2010 final: Holland v Spain – as it happened" and match report, 11 July 2010 https://www.theguardian.com
 *  - UEFA.com / ESPN retrospectives on Iniesta's goal and his tribute to Dani Jarque (Espanyol captain, died August 2009)
 *  - Wikipedia, "Soccer City" (FNB Stadium: the calabash / African pot design, the earth-toned mosaic facade) https://en.wikipedia.org/wiki/FNB_Stadium
 *  - Wikipedia, "Adidas Jabulani" (the gold "Jo'bulani" version used in the final) https://en.wikipedia.org/wiki/Adidas_Jabulani
 * CONFIRMED by those accounts: 11 July 2010, Soccer City, Johannesburg, the World Cup final; 0–0 after 90 minutes; the winner came in the
 *  116th minute of extra time (four minutes before penalties); Spain won 1–0, their first World Cup; Cesc Fàbregas played the final pass;
 *  Iniesta, inside the right side of the penalty area, let the ball bounce and struck it with his RIGHT foot past Maarten Stekelenburg;
 *  Spain wore their dark blue away kit, the Netherlands orange; Iniesta wore 6, Fàbregas 10, Fernando Torres 9, Jesús Navas 22; Torres
 *  and Fàbregas were substitutes; John Heitinga had been sent off (109'), so the Netherlands had ten men; referee Howard Webb (England);
 *  attendance 84,490; the final's ball was the gold Jo'bulani; Iniesta celebrated by showing an undershirt reading "Dani Jarque siempre con
 *  nosotros" (Dani Jarque always with us) — kept out of the film to keep it simple; the stadium is shaped like a calabash (an African pot).
 * INFERRED / ILLUSTRATIVE: every position and run in metres; the build-up drawn before the pass (a Torres cross from the left, blocked by
 *  Rafael van der Vaart and falling to Fàbregas — as recalled, not re-verified); the pass as a short clipped ball that bounces once in front
 *  of Iniesta; flight times, bounce height (≈ .6 m) and the contact height; the side of the goal (drawn across Stekelenburg into the far side,
 *  his fingertips just failing); the defender closing Iniesta (unnamed) and every other player's spot; which touchline the main camera sat
 *  on; the Netherlands' orange shorts and socks, Spain's dark blue shorts and socks, the yellow numbers on Spain's shirts; the keeper's blue
 *  kit and the referee's black kit; the stadium as drawn (a rounded bowl with two tiers, a roof ring with floodlights, a big screen, the
 *  mosaic panels in four earth tones, the ring of lights at the base); the crowd's colours; the camera placements and lenses; the celebration
 *  run toward the corner flag.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 Fàbregas's pass): ch1 = the live broadcast — the opening aerial over the calabash craning in over the
 * roof, then the high main-stand camera in real time (the big screen at 0–0 in the 116th minute, Torres's cross, the block, the pass, the
 * bounce, the strike, the net); ch2 = the TV slow-motion replay, low and close in front of Iniesta (he lets it bounce, head down, body
 * still, ×≈4); ch3 = the replay from low behind the goal (the right-foot strike, the ball past Stekelenburg's fingertips, the net, the
 * celebration and the flashes); ch4 = a duotone lesson (the pressure of the big moment → calm → settle your body → strike it cleanly).
 * Seams are forward passages into the ball. Ball physics: the pass is ballistic (g = 9.81) with one bounce (restitution ≈ .67), the shot a
 * flat drive; the contact point is read from the solved skeleton (right toe) so the ball always meets the boot. Figures: lib/plays/riso/
 * athlete.ts through ONE adapter, drawPlayer(). Framing: the world is centred on the CANVAS centre (never sheet.safe) with a lens that widens
 * for a square window (1.45:1 … 1:1). Inks: yellow (floodlights, Spain's numbers, the gold ball, grass with blue), orange (the Netherlands,
 * the calabash, the crowd), blue (night sky, grass, keeper), navy (key line, Spain's dark blue kit). Scenes read only their local t; drawn
 * objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–300 plate ops per frame; wide-shot figures print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,runCycle,stand,strike,volley,lunge,backpedal,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',O='orange',Y='yellow',B='blue';
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
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/(\.\.\.|[,;:])$/.test(w)?.2:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`iniesta film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py iniesta-final-2010 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/iniesta-final-2010/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Soccer City','Johannesburg, 2010, the World Cup final. Spain, in dark blue, play the Netherlands, in orange. Nil-nil, with four minutes of extra time left. Fàbregas passes to Andrés Iniesta, and... goal!',
  ['Johannesburg','the World Cup final','Spain','dark blue','the Netherlands','orange','Nil-nil','four minutes','Fàbregas passes','Andrés Iniesta','goal']),
 prov('Calm','Watch again, slowly. Iniesta stays calm. He lets the ball bounce, keeps his head down and his body still.',
  ['Watch again','slowly','stays calm','lets the ball bounce','head down','body still']),
 prov('The strike','Then he strikes it cleanly with his right foot, past Stekelenburg. Spain are world champions for the first time!',
  ['Then','strikes it','right foot','past Stekelenburg','world champions','first time']),
 prov('Big moments','In the biggest moment, stay calm. Settle your body, and strike the ball cleanly.',
  ['biggest moment','stay calm','Settle your body','strike','cleanly']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`iniesta film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** 7-segment block digits (glyph box 1 × 2) for the big screen */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};

// ================= Soccer City: the calabash (a rounded bowl in plan, a pot-bellied mosaic shell, a roof ring with floodlights) =================
const CX=-52.5;// the centre spot
/** a rounded-rectangle ring in plan (superellipse, exponent 4) at half-axes a (along the pitch) and b (across), height y */
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.sqrt(Math.abs(c)),y,b*Math.sign(s)*Math.sqrt(Math.abs(s))];}
type Lv=[number,number,number];// a, b, y
/** the bowl: lower tier, the fascia step, upper tier (tops out under the roof) */
const BOWL:Lv[]=[[62,44,1.2],[80,61,21],[82,63,23],[101,81,44]];
const ROOF_IN:Lv=[84,65,47],ROOF_OUT:Lv=[106,86,50];
/** the calabash shell outside: bellied in the middle, drawn in toward the rim */
const SHELL:Lv[]=[[108,88,0],[117,97,13],[119,99,27],[114,94,40],[106,86,50]];
const NSEG=40;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
const insidePlan=(p:V3,l:Lv)=>Math.pow(Math.abs(p[0]-CX)/l[0],4)+Math.pow(Math.abs(p[2])/l[1],4)<1;
/** crowd: [tier 0 lower / 1 upper, u round the bowl, v up the tier, ink 0 paper / 1 orange (Dutch) / 2 yellow (Spain) / 3 navy, phase] */
const CROWD=(()=>{const r=rng(2010),o:[number,number,number,number,number][]=[];for(let i=0;i<1500;i++){const tier=r()<.55?0:1,c=r();o.push([tier,r(),.05+r()*.9,c<.38?0:c<.72?1:c<.9?2:3,r()*TAU]);}return o;})();
/** mosaic panels of the shell: [level band, segment, sub-band, tone 0..3] (the calabash's earth-toned fibre-concrete tiles) */
const MOSAIC=(()=>{const r=rng(116),o:number[]=[];for(let i=0;i<(SHELL.length-1)*NSEG*2;i++)o.push(Math.floor(r()*4));return o;})();
/** floodlights along the roof's inner edge */
const LAMPS:V3[]=Array.from({length:44},(_,i)=>lvAt([ROOF_IN[0]+.5,ROOF_IN[1]+.5,ROOF_IN[2]-.8],i/44*TAU));
/** the big screen, hanging under the roof behind the goal Spain attack (faces the pitch, −x) */
const SCR={x:CX+ROOF_IN[0]-1.2,y0:37.5,y1:45,z0:-9.5,z1:9.5};
const SCREEN_C:V3=[SCR.x,(SCR.y0+SCR.y1)/2,0];
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;hot?:number;clock?:string;confetti?:number};
/** is the camera outside the calabash (the opening aerial)? */
const outside=(c:Camera)=>!insidePlan(c.eye,[ROOF_OUT[0],ROOF_OUT[1],0]);
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a winter night: a deep blue screen and a navy screen over it, stepped darker high up
 s.field(B,.6,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz+Bnd],[-Bnd,hz+Bnd]],true),.45);
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz-620],[-Bnd,hz-520]],true),.32);
 if(outside(c)){exterior(s,c);if(c.eye[1]>ROOF_IN[2]){const hole=new Path2D();addPoly(hole,clipPoly(c,Array.from({length:NSEG},(_,i)=>lvAt(ROOF_IN,i/NSEG*TAU))));s.save();s.clip(hole);interior(s,c,o,tt,Bnd);drawIn();s.restore();}return;}
 interior(s,c,o,tt,Bnd);drawIn();
}
/** the outside of the calabash at night: the dark ground, the lit plaza, the mosaic shell (front faces only), the ring of lights, the roof */
function exterior(s:Sheet,c:Camera){
 const gr=new Path2D();addPoly(gr,clipPoly(c,[[CX-900,0,-900],[CX+900,0,-900],[CX+900,0,900],[CX-900,0,900]]));s.knockout(gr,.6);s.tone(K,gr,.6);s.tone(B,gr,.32);
 const plaza=new Path2D();addPoly(plaza,clipPoly(c,Array.from({length:NSEG},(_,i)=>lvAt([150,130,.01],i/NSEG*TAU))));s.tone(Y,plaza,.2);
 const tiles=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],all=new Path2D(),lights=new Path2D();
 for(let l=0;l+1<SHELL.length;l++)for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU,mid=lvAt(SHELL[l],(t0+t1)/2),n:V3=[(mid[0]-CX)/(SHELL[l][0]**2),.15/60,mid[2]/(SHELL[l][1]**2)];
  if(dot(n,sub(c.eye,mid))<=0)continue;
  for(let k=0;k<2;k++){const q=clipPoly(c,band(SHELL[l],SHELL[l+1],t0,t1,k/2,(k+1)/2));addPoly(all,q);addPoly(tiles[MOSAIC[(l*NSEG+i)*2+k]],q);}
  if(l===0){const q=band(SHELL[0],SHELL[1],t0+.02,t1-.02,.55,.72);addPoly(lights,clipPoly(c,q));}}
 s.knockout(all);s.fill(O,tiles[0],.88);s.fill(O,tiles[1],.6);s.tone(K,tiles[1],.32);s.fill(Y,tiles[2],.75);s.fill(O,tiles[2],.32);s.tone(K,tiles[3],.6);s.tone(O,tiles[3],.32);
 s.tone(K,all,.1);s.knockout(lights,.9);s.fill(Y,lights,.88);
 const roof=new Path2D();for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(ROOF_OUT,ROOF_IN,t0,t1)));}
 s.knockout(roof);s.tone(K,roof,.6);s.tone(B,roof,.2);
}
/** inside the bowl: stands and crowd, grass and lines, the roof ring with its floodlights, the big screen, the goal */
function interior(s:Sheet,c:Camera,o:Crowd,tt:number,Bnd:number){
 const{cheer=0,flash=0}=o,ey=c.eye;
 // stands: knocked out, navy screen, the two tiers' rows stepped, the fascia between them printed orange (the stadium's earth colours)
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [[0,1,false],[1,2,true],[2,3,false]] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   const q=band(BOWL[l0],BOWL[l1],t0,t1);addPoly(isF?fascia:stands,clipPoly(c,q));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.tone(K,stands,.45);s.tone(O,rows,.2);s.tone(K,rows,.2);s.knockout(fascia);s.fill(O,fascia,.75);s.tone(K,fascia,.32);
 // crowd: faces, orange shirts and wigs, Spain's yellow and navy — bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,l0=BOWL[tier*2],l1=BOWL[tier*2+1],p=mix3(lvAt(l0,th),lvAt(l1,th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(O,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(K,heads[3],.9);
 // camera flashes (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=r()<.5?0:1,th=r()*TAU,q=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // the roof ring (navy, seen from under or over), its floodlight halos and lamp panels
 const roof=new Path2D();for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;addPoly(roof,clipPoly(c,band(ROOF_OUT,ROOF_IN,t0,t1)));addPoly(roof,clipPoly(c,band(ROOF_IN,[ROOF_IN[0],ROOF_IN[1],ROOF_IN[2]-2.2],t0,t1)));}
 s.knockout(roof);s.fill(K,roof,.88);
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((3.6+(o.hot??0)*3)*k,10,380);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.1*k,5,140),h=clamp(.6*k,3,80);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.6);}
 screen(s,c,o.clock??'116');
 goal(s,c,o.net);
 if(o.confetti&&o.confetti>.01)confetti(s,c,o.confetti,tt);
}
/** the big screen: a navy panel, the flags (Netherlands orange/paper/blue, Spain orange/yellow/orange), 0-0 (or 0-1) and the minute */
function screen(s:Sheet,c:Camera,clock:string){
 if(depthOf(c,SCREEN_C)<4)return;
 const at=(u:number,v:number):V3=>[SCR.x,lerp(SCR.y1,SCR.y0,v),lerp(SCR.z0,SCR.z1,u)];
 const quad=(u0:number,v0:number,u1:number,v1:number)=>{const q=[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1)];for(const p of q)if(depthOf(c,p)<NEAR)return[] as Pt[];return q.map(p=>P(c,p));};
 const panel=new Path2D();addPoly(panel,quad(0,0,1,1));s.knockout(panel);s.fill(K,panel,.95);
 const orange=new Path2D(),yel=new Path2D(),blu=new Path2D(),pap=new Path2D();
 // Netherlands flag (left: red-white-blue drawn orange/paper/blue), Spain flag (right: red-yellow-red drawn orange/yellow/orange)
 addPoly(orange,quad(.05,.12,.22,.24));addPoly(pap,quad(.05,.24,.22,.36));addPoly(blu,quad(.05,.36,.22,.48));
 addPoly(orange,quad(.78,.12,.95,.2));addPoly(yel,quad(.78,.2,.95,.4));addPoly(orange,quad(.78,.4,.95,.48));
 const glyphs=(str:string,u0:number,v0:number,gw:number,gh:number,path:Path2D)=>{[...str].forEach((ch,ci)=>{for(const sg of DIGITS[ch]??''){const[[x0,y0],[x1,y1]]=SEGS[sg],th=.3,hx=x1===x0?th/2:0,hy=y1===y0?th/2:0,ex=x1===x0?0:th/2,ey=y1===y0?0:th/2,ox=u0+ci*gw*1.5;
   addPoly(path,quad(ox+(x0-hx-ex)*gw,v0+(y0-hy-ey)*gh/2,ox+(x1+hx+ex)*gw,v0+(y1+hy+ey)*gh/2));}});};
 // the score between the flags, the minute under it (u runs +z, screen-right from the main stand)
 glyphs(clock.startsWith('F')?'0-1':'0-0',.31,.12,.11,.36,pap);glyphs(clock.replace('F',''),.36,.62,.08,.26,yel);
 s.knockout(orange);s.fill(O,orange,.95);s.knockout(yel);s.fill(Y,yel,.95);s.knockout(blu);s.fill(B,blu,.95);s.knockout(pap);
}
/** paper confetti falling in front of the far stand (the trophy night) */
function confetti(s:Sheet,c:Camera,amt:number,tt:number){
 const r=rng(77),p=new Path2D(),py=new Path2D();let n=0;
 for(let i=0;i<Math.round(90*amt);i++){const x=CX+(r()-.5)*150,z=(r()-.5)*120,h=(r()*30+tt*6)%30,y=34-h,q:V3=[x,y,z];if(depthOf(c,q)<3)continue;const k=kAt(c,q),[sx,sy]=P(c,q),w=clamp(.5*k,4,26),a=r()*TAU+tt*(2+r()*3);
  const pts:Pt[]=[[sx+Math.cos(a)*w,sy+Math.sin(a)*w*.4],[sx-Math.sin(a)*w*.5,sy+Math.cos(a)*w*.5],[sx-Math.cos(a)*w,sy-Math.sin(a)*w*.4],[sx+Math.sin(a)*w*.5,sy-Math.cos(a)*w*.5]];(i%3?p:py).addPath(polyPath(pts,true));n++;}
 if(n){s.knockout(p);s.knockout(py);s.fill(Y,py,.9);}
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

// ================= the ball: the final's gold Jo'bulani — yellow with an orange screen, navy swooshes turning with the spin, a navy rim =================
const BALL_R=.11;
function goldBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);s.fill(Y,disc,duo?.6:.88);if(!duo)s.tone(O,disc,.32);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // the Jabulani's curved panel graphics: three swooshes round the ball
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
/** the Netherlands: orange */
const NED=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:O,socks:O,trim:K,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:30+n,...o});
const INIESTA:AthleteStyle=ESP(6,{hair:[K,.85],hairStyle:'balding',build:{height:1.71,bulk:.92,thighs:.98},seed:6});
const FABREGAS:AthleteStyle=ESP(10,{hair:K,build:{height:1.8,bulk:.98}});
const TORRES:AthleteStyle=ESP(9,{hair:[Y,.75],build:{height:1.86,bulk:.95}});
const VDV:AthleteStyle=NED(23,{hair:[Y,.8],build:{height:1.78,bulk:1}});
const KEEPER:AthleteStyle={shirt:[B,.85],shorts:[K,.8],socks:[B,.85],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],build:{height:1.97},seed:21};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[K,.55]:[Y,.6],shorts:lead?[K,.55]:[K,.32],socks:lead?[K,.55]:[Y,.6],trim:lead?Y:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?Y:K,gloves:st.gloves?[Y,.6]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Fàbregas's pass) =================
const G=9.81;
const IB:Build=INIESTA.build!;
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
/** where a player stands so his RIGHT toe meets a ground ball at `ball` when struck facing `yaw` (read from the solved skeleton) */
function footSpot(ball:[number,number],yaw:number,pose:Pose,build:Build={}):[number,number]{const sk=solve(pose,build,{yaw});return[ball[0]-sk.rToe[0],ball[1]-sk.rToe[2]];}

// ---- the pass and the strike: Fàbregas's clipped pass bounces once in front of Iniesta, who volleys it on the way down with his RIGHT foot ----
const F0:V3=[-19.6,.11,-1.2];// Fàbregas, at the edge of the D
const V_AIM:[number,number]=[-12.9,5.5];// where the right boot meets the ball, inside the right of the box
const NET_TO:V3=[0,.95,-2.75];// across Stekelenburg into the far side of the net
const VOL=(u:number)=>volley(u,{foot:'r',height:.3});
const YT=YAW(NET_TO[0]-V_AIM[0],NET_TO[2]-V_AIM[1]);// the shot's heading
const YV=YT+24*D2R;// his place yaw for the library volley (the body swivels through YT at contact)
const VOL_SK=solve(VOL(.5),IB,{yaw:YV});
const HIT_H=VOL_SK.rToe[1]+.1;
const V_HIT:V3=[V_AIM[0],HIT_H,V_AIM[1]];
const PV:[number,number]=[V_AIM[0]-VOL_SK.rToe[0],V_AIM[1]-VOL_SK.rToe[2]];
const TP=1.0,VY0=G*TP/2;// the pass: ≈1.2 m apex, lands after 1 s
const VB=Math.max(3.3,Math.sqrt(2*G*Math.max(0,HIT_H-.11))*1.15);// off the grass (restitution ≈ .67)
const SB=(VB+Math.sqrt(Math.max(0,VB*VB-2*G*(HIT_H-.11))))/G;// after the bounce, down to boot height
const PDIR:[number,number]=(()=>{const dx=V_AIM[0]-F0[0],dz=V_AIM[1]-F0[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const HS=Math.hypot(V_AIM[0]-F0[0],V_AIM[1]-F0[2])/(TP+.8*SB);// horizontal speed before the bounce (×.8 after)
const B1:V3=[F0[0]+PDIR[0]*HS*TP,.11,F0[2]+PDIR[1]*HS*TP];// the bounce spot
const TV=TP+SB,SHT=.5,T_GOAL=TV+SHT;
const NET_HIT:V3=[2,.9,-2.85];
// ---- the build-up: Torres crosses from the left, van der Vaart blocks, the ball falls to Fàbregas ----
const TC:V3=[-25.2,.11,-17.4],BK:V3=[-17.1,.75,-9.4],R0:V3=[F0[0]-.9,.11,F0[2]-.5];
const TX=-2.4,TBK=-1.8,TR=-.4;// Torres's cross, the block, the ball arrives at Fàbregas
function ballAt(tau:number):V3{
 if(tau<TX){const q=pathPos(TORRES_P,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.35+.25*Math.abs(Math.sin(q.dist*.9));if(tau>TX-.5){const u=(tau-(TX-.5))/.5;return mix3([q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap],TC,u);}return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
 if(tau<TBK){const u=(tau-TX)/(TBK-TX),p=mix3(TC,BK,u);p[1]+=.6*Math.sin(u*Math.PI);return p;}
 if(tau<TR){const u=(tau-TBK)/(TR-TBK),p=mix3(BK,R0,u);p[1]=Math.max(.11,lerp(BK[1],.11,u)+2.2*u*(1-u));return p;}
 if(tau<0){const u=easeOut((tau-TR)/-TR);return mix3(R0,F0,u);}
 if(tau<TP)return[F0[0]+PDIR[0]*HS*tau,.11+VY0*tau-.5*G*tau*tau,F0[2]+PDIR[1]*HS*tau];
 if(tau<TV){const s=tau-TP;return[B1[0]+PDIR[0]*HS*.8*s,.11+VB*s-.5*G*s*s,B1[2]+PDIR[1]*HS*.8*s];}
 const s=tau-TV;if(s<SHT){const u=s/SHT,p=mix3(V_HIT,NET_TO,u);p[1]+=.3*Math.sin(Math.PI*u);return p;}
 const e=s-SHT,u=clamp(e/.14);if(u<1)return mix3(NET_TO,[1.75,.85,-2.85],easeOut(u));
 const d=clamp((e-.14)/.4),h=.85*(1-d*d)+.11*d*d;return[1.75-.25*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.54)*8))*Math.exp(-(e-.54)*3):0),-2.85+.2*d];}

// ---- Iniesta: drifts into space on the right of the box → settles side-on, eyes on the ball, lets it bounce → right-foot volley → celebrates ----
const INI_RUN:MKey[]=[[-9,-18.2,11.4],[-4,-16.3,9.4],[TP-1.25,PV[0],PV[1]]];
const CELEB:MKey[]=[[TV+.5,PV[0],PV[1]],[TV+2.2,-8,14.5],[TV+3.6,-5.5,21]];
/** head on the ball: turn and nod the head toward it from wherever the body faces */
function watchBall(p:Pose,place:Place,ball:V3,w:number):Pose{
 const x=place.x??0,z=place.z??0,face=(place.yaw??0)+p.yaw+p.twist,rel=lerpAng(0,YAW(ball[0]-x,ball[2]-z)-face,1),dist=Math.hypot(ball[0]-x,ball[2]-z);
 const down=Math.atan2(1.55-ball[1],Math.max(.4,dist));return{...p,neckY:lerp(p.neckY,clamp(rel,-80*D2R,80*D2R)*.8,w),neckP:lerp(p.neckP,clamp(down,-.6,.95),w)};}
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const INI_SEGS:Seg[]=[
 [-99,t=>runner(INI_RUN,t,ballAt(t),2)],
 [TP-1.15,t=>{const place:Place={x:PV[0],z:PV[1],yaw:lerpAng(YAW(F0[0]-PV[0],F0[2]-PV[1])*.4+YV*.6,YV,sm(TP-1.1,TV-.6,t))};
  const u=sm(TP-1.15,TV-.55,t,easeInOutSine),p=blendPose(stand(),VOL(0),u),br=Math.sin(t*2.2)*.03*(1-u);return{pose:watchBall({...p,lean:p.lean+br},place,ballAt(t),.85),place};}],
 [TV-.5,t=>{const place={x:PV[0],z:PV[1],yaw:YV};const p=VOL(clamp((t-(TV-.5))/1));return{pose:t<TV-.1?watchBall(p,place,ballAt(t),.6*(1-sm(TV-.3,TV-.1,t))):p,place};}],
 [TV+.5,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
 [TV+3.6,t=>{const e=CELEB[CELEB.length-1];return{pose:celebrate(Math.max(0,t-TV-3.6)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(CX-e[1],-e[2])}};}],
];
/** Iniesta at τ: the active segment, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function iniestaAt(tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<INI_SEGS.length&&tau>=INI_SEGS[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=INI_SEGS[a][1](tau),Bq=INI_SEGS[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=INI_SEGS[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=INI_SEGS[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return INI_SEGS[i][1](tau);}

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const YF=YAW(PDIR[0],PDIR[1]),FP=footSpot([F0[0],F0[2]],YF,strike(STRIKE_CONTACT,{power:.45}),FABREGAS.build);
const [ffx,ffz]=dirOf(YF);
const FAB_P:MKey[]=[[-9,FP[0]-6,FP[1]-2],[TBK,FP[0]-2.6,FP[1]-.8],[-.62,FP[0]-ffx*1.1,FP[1]-ffz*1.1],[.5,FP[0]+ffx*.5,FP[1]+ffz*.5],[4,FP[0]+ffx*5,FP[1]+ffz*3]];
const YTO=YAW(BK[0]-TC[0],BK[2]-TC[2]),TOP=footSpot([TC[0],TC[2]],YTO,strike(STRIKE_CONTACT,{power:.8}),TORRES.build);
const [tfx,tfz]=dirOf(YTO);
const TORRES_P:MKey[]=[[-9,TOP[0]-14,TOP[1]-3.5],[TX-.62,TOP[0]-tfx*1.2,TOP[1]-tfz*1.2],[TX+.4,TOP[0]+tfx*.6,TOP[1]+tfz*.6],[TX+3,TOP[0]+tfx*4,TOP[1]+tfz*2.5],[6,TOP[0]+tfx*7,TOP[1]+tfz*4]];
/** a passer: runner, and around the contact the library strike (contact at `tc`, right foot) facing the pass */
const passer=(style:AthleteStyle,path:MKey[],tc:number,yaw:number,power:number,seed:number):Actor=>({style,at:(t,b)=>{const r=runner(path,t,b,seed);if(t>tc-.7&&t<tc+.7){const u=clamp((t-tc+.62)/1.2);r.pose=blendPose(r.pose,strike(u,{power}),Math.sin(clamp((t-tc+.7)/1.4)*Math.PI));r.place.yaw=lerpAng(r.place.yaw??0,yaw,Math.sin(clamp((t-tc+.7)/1.4)*Math.PI));}return r;}});
const VDV_AT:[number,number]=[BK[0]+.55,BK[2]-.25];
const CLOSER:MKey[]=[[-9,-9.6,13.2],[TP,-11.2,10.6],[TV-.35,-13.1,8.4]];// the defender who comes across too late (unnamed; inferred)
const ACTORS:Actor[]=[
 passer(FABREGAS,FAB_P,0,YF,.45,1),// Cesc Fàbregas
 passer(TORRES,TORRES_P,TX,YTO,.8,3),// Fernando Torres
 {style:VDV,at:(t,b)=>{const yaw=YAW(TC[0]-VDV_AT[0],TC[2]-VDV_AT[1]);// Rafael van der Vaart: steps across, blocks, turns to watch
  if(t<TBK-.55)return runner([[-9,-19.6,-5.6],[TBK-1.8,-18,-7.8],[TBK-.6,VDV_AT[0],VDV_AT[1]]],t,b,4,backpedal(0));
  if(t<TBK+.5)return{pose:lunge(clamp((t-(TBK-.55))/.9),{side:'l'}),place:{x:VDV_AT[0],z:VDV_AT[1],yaw}};
  const u=sm(TBK+.5,TBK+1.4,t);return{pose:blendPose(lunge(1,{side:'l'}),{...idle(t,4),neckP:-.1},u),place:{x:VDV_AT[0]+.3*u,z:VDV_AT[1]+.2*u,yaw:lerpAng(yaw,YAW(b[0]-VDV_AT[0],b[2]-VDV_AT[1]),u)}};}},
 {style:NED(15),at:(t,b)=>{if(t<TV-.35)return runner(CLOSER,t,b,5,backpedal(t*2));const l=CLOSER[CLOSER.length-1];return{pose:lunge(clamp((t-(TV-.35))/.8),{side:'r'}),place:{x:l[1],z:l[2],yaw:YAW(PV[0]-l[1],PV[1]-l[2])}};}},// the closing defender
 mover(NED(4,{hair:[K,.6],build:{height:1.88,bulk:1.05}}),[[-9,-11,-4],[TP,-9.6,.2],[TV,-8.4,1.6],[T_GOAL+1,-7.2,2.4]],6,backpedal(0)),// Joris Mathijsen
 mover(NED(2,{skin:SKIN_D,hair:K}),[[-9,-15,-15],[0,-12.5,-10],[TV,-10.6,-7]],7,backpedal(0)),// Gregory van der Wiel
 mover(NED(6,{hair:[K,.7],build:{height:1.73,bulk:1.08}}),[[-9,-26,4],[0,-22,1.2],[TV,-19.4,2.4]],8),// Mark van Bommel
 mover(NED(10,{hair:null,hairStyle:'bald'}),[[-9,-33,-8],[TV,-27,-6]],9),// Wesley Sneijder
 mover(NED(11,{hair:null,hairStyle:'balding'}),[[-9,-44,10],[TV,-38,8]],10),// Arjen Robben
 mover(ESP(22,{hair:K}),[[-9,-36,22],[0,-24,19],[TV,-19,15.5],[T_GOAL+2,-12,17]],11),// Jesús Navas
 mover(ESP(8,{hair:K,build:{height:1.7}}),[[-9,-34,2],[0,-28,4.5],[TV,-25,5]],12),// Xavi
 mover(ESP(16,{hair:K,build:{height:1.89,bulk:.94}}),[[-9,-45,-2],[TV,-38,-1]],13),// Sergio Busquets
 {style:KEEPER,at:(t,b)=>{const q=pathPos([[-9,-2.2,.4],[0,-1.9,.9],[TV,-1.7,1.5]],t),t0=TV+.04;// Maarten Stekelenburg: set, then the dive to his right
  if(t<t0)return{pose:keeperSet(t*1.6),place:{x:q.x,z:q.z,yaw:YAW(b[0]-q.x,b[2]-q.z)}};return{pose:keeperDive(clamp((t-t0)/.95),{side:'r',height:.3}),place:{x:q.x,z:q.z,yaw:YAW(V_HIT[0]-q.x,V_HIT[2]-q.z)}};}},
 mover(REF,[[-9,-36,-12],[0,-30,-9],[TV,-26,-7]],14),// Howard Webb
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Iniesta with motion smear; `prev` gives every figure its secondary motion;
 * `cap` limits figure detail (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean;skip?:number[];tiny?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12;
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===INIESTA?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(hPx<(o.tiny??0))return;if(o.cap&&style!==INIESTA&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&style!==INIESTA&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 const bpp=ballAt(tp-dt);
 ACTORS.forEach((a,i)=>{if(o.skip?.includes(i))return;put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined);});
 const he=iniestaAt(tp);put(INIESTA,he,iniestaAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  goldBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,ini:he};}

// ================= chapter 1 (live): the aerial over the calabash craning in, then the high main-stand camera in real time =================
const ch1q=()=>({jo:T(0,'Johannesburg'),wc:T(0,'the World Cup final'),sp:T(0,'Spain'),db:T(0,'dark blue'),ne:T(0,'the Netherlands'),or:T(0,'orange'),nn:T(0,'Nil-nil'),fm:T(0,'four minutes'),fa:T(0,'Fàbregas passes'),ai:T(0,'Andrés Iniesta'),g:T(0,'goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. The ball crosses the line on "goal" when the voice allows; the pass always leaves near "Fàbregas passes". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.g-T_GOAL+.1,q.fa-.3,Math.max(q.fa-.3,Math.min(q.fa+.8,q.end-T_GOAL-1.3)));return{TL,end:q.end};};
const BCAM:V3=[-30,17.5,47];
/** the crane: from the night aerial outside the calabash, up over the roof ring, down to the main-stand gantry */
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,CX+34,70,205],[q.wc,CX+24,96,140],[q.sp,-33,74,58],[q.db+.3,BCAM[0],BCAM[1],BCAM[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the pass the director's camera follows the words: the calabash → the bowl → Spain → the Netherlands → the big screen → the move */
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,CX,20,0],[q.wc,CX,6,0],[q.sp,-44,0,-2],[q.db+.3,-33,1,-3],[q.ne,-24,1,-4],[q.or+.35,-22,1,-2],[q.nn+.3,SCREEN_C[0],SCREEN_C[1],0],[q.fm+.6,SCREEN_C[0],SCREEN_C[1]-.5,0],[q.fa-.9,-21,1,-7]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<0)return[lerp(b[0],-16,.45),1.1,lerp(b[2],0,.45)];
 if(tau<TV)return[lerp(-15,b[0],.5),1.2,lerp(1.5,b[2],.5)];
 return mix3([lerp(V_HIT[0],b[0],.6),1.3,lerp(V_HIT[2],b[2],.6)],[-6,1.4,8],sm(T_GOAL+.3,T_GOAL+2.4,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(Math.max(q.fm+.7,TL-2.6),Math.max(q.fm+1.6,TL-1),t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1250],[q.wc,1300],[q.sp,1500],[q.db+.3,3000],[q.ne,3300],[q.or+.3,3300],[q.nn+.3,4800],[q.fm+.6,5200],[q.fa-.6,4400],[TL+TP-.3,6600],[TL+TV,7400],[TL+T_GOAL+.4,5600],[q.end,6000]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings: on "dark blue" yellow rings round Spain's shirts, on "orange" orange rings round the Dutch; on "Andrés Iniesta" his own ring */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),re=sm(q.db,q.db+.3,t,easeOutBack)*(1-sm(q.ne,q.ne+.5,t)),rn=sm(q.or,q.or+.3,t,easeOutBack)*(1-sm(q.nn,q.nn+.5,t)),ri=sm(q.ai,q.ai+.3,t,easeOutBack)*(1-sm(q.g,q.g+.4,t));
 if(re<.02&&rn<.02&&ri<.02)return;const bp=ballAt(tp),pe=new Path2D(),pn=new Path2D(),pi=new Path2D();
 const ring=(path:Path2D,x:number,z:number,g:number)=>{const r=groundRing(c,x,z,.95*g);if(r.length>2)path.addPath(ribbon(r,Math.max(5,.14*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));};
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place,esp=Array.isArray(a.style.shirt)&&a.style.shirt[0]===K&&a.style.number!=null,ned=a.style.shirt===O;if(esp&&re>.02)ring(pe,p.x??0,p.z??0,re);if(ned&&rn>.02)ring(pn,p.x??0,p.z??0,rn);});
 const h=iniestaAt(tp).place;if(re>.02)ring(pe,h.x??0,h.z??0,re);if(ri>.02)ring(pi,h.x??0,h.z??0,ri*1.3);
 yInk(s,pe,.95);s.knockout(pn,.9);s.fill(O,pn,.95);yInk(s,pi,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  const hot=sm(q.nn,q.nn+.4,t,easeOutBack)*(1-sm(q.fa-.9,q.fa-.3,t));
  stadium(s,c,{t,cheer:.15+.9*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,clock:goalIn>0?'F116':'116'},()=>{
   if(hot>.02){const p=P(c,SCREEN_C),k=kAt(c,SCREEN_C);yRing(s,p[0],p[1],Math.max(20,13*k*hot),Math.max(6,1.1*k));}
   if(!outside(c))teamRings(s,c,tt-TL,t);
   drawWorld(s,c,t-TL,tt-TL,{ballMin:14,cap:t>q.end-.7,tiny:outside(c)?8:0});});},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low and close in front of Iniesta): calm, the bounce, head down, body still =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),sc:T(1,'stays calm'),lb:T(1,'lets the ball bounce'),hd:T(1,'head down'),bs:T(1,'body still'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,TP-1.05],[q.lb+.35,TP],[q.bs+.35,TV-.14],[q.end,TV-.06]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.sc,q.end,t,easeInOutSine),ang=YT-62*D2R-40*D2R*orbit,[fx,fz]=dirOf(ang),D=lerp(6.8,5.4,sm(0,q.hd,t));
 const body:V3=[PV[0],.95,PV[1]],pos:V3=[body[0]+fx*D,.8+.25*sm(q.lb,q.end,t),body[2]+fz*D];
 const w=key(t,mono([[0,.55],[q.sc,.78],[q.lb,.5],[q.hd+.3,.62],[q.bs,.72],[q.end,.66]])),F=key(t,mono([[0,1500],[q.sl,1750],[q.sc+.3,2050],[q.lb+.3,1900],[q.hd+.3,2200],[q.end,2350]]));
 return cam(pos,mix3([b[0],clamp(b[1],.3,2.2),b[2]],body,w),F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.08},()=>{
   // "stays calm": a quiet paper ring round his feet, breathing slowly
   const calm=sm(q.sc,q.sc+.4,tt,easeOutBack)*(1-sm(q.lb,q.lb+.5,tt));if(calm>.02){const r=groundRing(c,PV[0]+.2,PV[1],.95+.08*Math.sin(tt*2.2),30);if(r.length>2)yInk(s,ribbon(r,Math.max(6,.07*kAt(c,[PV[0],0,PV[1]])),{close:true,taper:0,wobble:.5}),.9*calm);}
   // "lets the ball bounce": a ring prints where it lands and spreads
   const bo=sm(TP-.05,TP+.35,tp,easeOut)*(1-sm(q.hd,q.hd+.6,tt));if(bo>.02){const r=groundRing(c,B1[0],B1[2],.18+.5*bo,24);if(r.length>2)yInk(s,ribbon(r,Math.max(5,.06*kAt(c,B1)),{close:true,taper:0,wobble:.5}),.95*(1-.4*sm(TP+.2,TP+.5,tp)));}
   const w=drawWorld(s,c,tau,tp,{ballMin:30,hero:true,prev:true,glow:sm(q.lb-.1,q.lb+.3,tt)*(1-sm(q.hd,q.hd+.4,tt)),cap:t>q.end-.7});
   // "head down": a dashed yellow sight line from his eyes to the ball
   const hd=sm(q.hd,q.hd+.35,tt,easeOut)*(1-sm(q.end-.9,q.end-.5,tt));if(hd>.02){const sk=solve(w.ini.pose,IB,w.ini.place),e=P(c,sk.head),b=P(c,w.ball),gaps:[number,number][]=[];for(let x=.08;x<1;x+=.14)gaps.push([x,x+.06]);
    yInk(s,ribbon([e,[lerp(e[0],b[0],hd),lerp(e[1],b[1],hd)]],Math.max(5,.035*kAt(c,sk.head)),{taper:.2,wobble:.6,gaps}),.95);}
   // "body still": a yellow spirit line across the shoulders that stays level
   const bs=sm(q.bs,q.bs+.35,tt,easeOutBack);if(bs>.02){const sk=solve(w.ini.pose,IB,w.ini.place),a=P(c,sk.lSh),b=P(c,sk.rSh),m:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2-.25*kAt(c,sk.chest)],h=.42*kAt(c,sk.chest)*bs;
    yInk(s,ribbon([[m[0]-h,m[1]],[m[0]+h,m[1]]],Math.max(6,.05*kAt(c,sk.chest)),{taper:.1,wobble:0}),.95);}
  });},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(30,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 (replay from low behind the goal): the right-foot strike, past Stekelenburg, the net, the champions =================
const ch3q=()=>({th:T(2,'Then'),st:T(2,'strikes it'),rf:T(2,'right foot'),ps:T(2,'past Stekelenburg'),wc:T(2,'world champions'),ft:T(2,'first time'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TV-.3],[q.st+.25,TV],[q.ps+.35,T_GOAL+.02],[q.wc,T_GOAL+.9],[q.end,T_GOAL+.9+(q.end-q.wc)*.9]]),x=>x);};
const GCAM:V3=[6.4,1.5,-5.2];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),ini=iniestaAt(tau).place;
 const toBall=sm(q.rf,q.ps+.3,t,easeInOutSine),toFans=sm(q.wc-.3,q.wc+1.3,t,easeInOutSine);
 const look0:V3=[PV[0]+.8,1.1,PV[1]-.6],look1:V3=[b[0],clamp(b[1],.8,2),b[2]],look2:V3=[(ini.x??0)+.5,1.6,(ini.z??0)+.5];
 const look=mix3(mix3(look0,look1,toBall*.55),look2,toFans);
 const pos:V3=add(GCAM,[.3*toFans,.9*toFans,2.4*toFans]),F=key(t,mono([[0,3300],[q.st,3600],[q.rf+.2,3000],[q.ps,2200],[q.ps+.6,1900],[q.wc,2400],[q.wc+1.3,4800],[q.end,5200]]),easeInOutSine);return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.ps+.35,champ=sm(q.wc,q.wc+.6,tt,easeOut);
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,hot:champ*.6,confetti:champ,clock:goalIn>0?'F116':'116'},()=>{
   const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:true,prev:!(t>q.end-.7||t<.75),cap:t>q.end-.7||t<.75});
   // "right foot": a ring round the right boot at contact; sparks; speed lines as it flies
   const rf=sm(q.rf-.1,q.rf+.2,tt,easeOutBack)*(1-sm(q.ps,q.ps+.4,tt));if(rf>.02){const sk=solve(w.ini.pose,IB,w.ini.place),p=P(c,sk.rToe),k=kAt(c,sk.rToe);yRing(s,p[0],p[1],.32*k*rf,Math.max(5,.04*k));}
   if(tp>=TV&&tp<TV+.2){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],100+100*sm(TV,TV+.08,tp,easeOut),{n:10,seed:6,g:1-sm(TV+.08,TV+.2,tp),width:12});}
   if(tp>=TV&&tp<T_GOAL&&depthOf(c,w.ball)>NEAR+.8){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:7,len:160,width:7,cov:.85});}
   // "past Stekelenburg": a yellow tick at his fingertips — the ball just beyond them
   const ps=sm(q.ps,q.ps+.3,tt,easeOutBack)*(1-sm(q.wc-.2,q.wc+.3,tt));if(ps>.02){const kp=ACTORS[11].at(tp,w.ball),sk=solve(kp.pose,KEEPER.build,kp.place),hand=sk.rHa[1]>sk.lHa[1]?sk.lHa:sk.rHa;if(depthOf(c,hand)>NEAR+.5){const p=P(c,hand),k=kAt(c,hand);yRing(s,p[0],p[1],.24*k*ps,Math.max(4,.03*k));}}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),ini=iniestaAt(tau).place,g:V3=[ini.x??0,1.2,ini.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),26,180),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): the pressure of the biggest moment → calm → settle your body → strike it cleanly =================
const ch4q=()=>({bm:T(3,'biggest moment'),sc:T(3,'stay calm'),se:T(3,'Settle your body'),st:T(3,'strike'),cl:T(3,'cleanly'),end:SEC(3)});
/** lesson clock: settled before the bounce; the ball bounces on "Settle your body", the strike lands on "strike" */
const tau4=(t:number)=>{const q=ch4q(),stT=Math.max(q.st+.15,q.se+.8);return key(t,mono([[0,TP-1.1],[q.sc,TP-.75],[q.se+.3,TP],[stT,TV],[stT+.9,TV+.9],[q.end,TV+.9+(q.end-stT-.9)*.4]]),x=>x);};
const INI4=duo(INIESTA,true);
function LCAM(t:number){const q=ch4q(),v=key(t,mono([[0,-1,1.4,9,2700],[q.bm,-.7,1.3,8.2,3200],[q.sc,-.5,1.2,7.8,3400],[q.se,-.3,1.05,7.2,4000],[q.st,.3,.95,7,4200],[q.cl,1.1,1.05,7.6,3200],[q.end,1.6,1.1,8,3000]]),easeInOutSine,true);
 const[fx,fz]=dirOf(YT),[rx,rz]=dirOf(YT-Math.PI/2);// his right side, looking back across him
 const base:V3=[PV[0]+fx*v[0],v[1],PV[1]+fz*v[0]];return cam([base[0]+rx*v[2],v[1],base[2]+rz*v[2]],[PV[0]+fx*v[0]*.5,.95,PV[1]+fz*v[0]*.5],v[3]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt),k0=kAt(c,[PV[0],1,PV[1]]);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Iniesta
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[PV[0]-40,0,PV[1]-40],[PV[0]+40,0,PV[1]-40],[PV[0]+40,0,PV[1]+40],[PV[0]-40,0,PV[1]+40]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,PV[0],PV[1],r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5.5),.2);s.tone(Y,pool(3.2),.2);s.tone(Y,pool(1.6),.32);
  // "the biggest moment": noise — jagged rings of pressure and flashbulbs crowd him; "stay calm": the rings smooth into slow, round
  // breaths and fade away
  const pres=sm(q.bm-.2,q.bm+.4,tt,easeOut)*(1-sm(q.se-.2,q.se+.5,tt)),calm=sm(q.sc,q.sc+1,tt,easeInOutSine);
  if(pres>.02){const ctr=P(c,[PV[0],1.05,PV[1]]),rings=new Path2D();for(let i=0;i<3;i++){const r0=(1.5+i*.75)*k0*(1+.08*calm*Math.sin(tt*2+i)),jag=(1-calm)*.16,pts:Pt[]=[];for(let j=0;j<36;j++){const a=j/36*TAU,n=jag*Math.sin(j*7.3+i*2+Math.floor(tt*12)*1.7)*Math.sin(j*3.1+tt*20);pts.push([ctr[0]+Math.cos(a)*r0*(1+n),ctr[1]+Math.sin(a)*r0*.8*(1+n)]);}rings.addPath(ribbon(pts,Math.max(6,.035*k0),{close:true,taper:0,wobble:1}));}
   yInk(s,rings,.95*pres);
   if(calm<.6){const fp=new Path2D(),r=rng(40+Math.floor(tt*12));for(let i=0;i<8;i++){const a=r()*TAU,d=(2.6+r()*1.4)*k0,x=ctr[0]+Math.cos(a)*d,y=ctr[1]+Math.sin(a)*d*.7,z=(18+r()*20)*pres*(1-calm/.6);fp.addPath(polyPath([[x,y-z],[x+z*.3,y],[x,y+z],[x-z*.3,y]],true));fp.addPath(polyPath([[x-z,y],[x,y-z*.3],[x+z,y],[x,y+z*.3]],true));}s.knockout(fp);}}
  // Iniesta (duotone) and the ball, live
  const lessonAt=(x:number)=>{if(x<TV+.3)return iniestaAt(x);const place:Place={x:PV[0],z:PV[1],yaw:YV};return{pose:blendPose(VOL(clamp((x-(TV-.5))/1)),idle(x,6),sm(TV+.5,TV+1.6,x)),place};};
  const h=lessonAt(tp),hp=lessonAt(tp-1/12),bpos=ballAt(tau);
  const items:Item[]=[{depth:depthOf(c,[h.place.x??0,0,h.place.z??0]),draw:()=>{drawPlayer(s,h.pose,c,INI4,h.place,{prev:hp,smear:true});}}];
  items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(24,BALL_R*kAt(c,bpos));goldBall(s,bp[0],bp[1],r,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(r*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  // "Settle your body": the ball's arc dotted in (one bounce), a level across the shoulders, a ring round the planted left foot
  const se=sm(q.se,q.se+.4,tt,easeOutBack)*(1-sm(q.cl,q.cl+.5,tt));
  if(se>.02){const dots=new Path2D();for(let i=0;i<=20;i++){const tb=lerp(Math.max(0,TP-.7),TV,i/20),p=ballAt(tb);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p);dots.moveTo(pp[0]+8,pp[1]);dots.arc(pp[0],pp[1],8,0,TAU);}yInk(s,dots,.9*se);}
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  if(se>.02){const sk=solve(h.pose,IB,h.place),a=P(c,sk.lSh),b=P(c,sk.rSh),k=kAt(c,sk.chest),m:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2-.3*k],half=.5*k*se,tilt=.06*settle(tt,q.se+.1,{freq:1.4,decay:2.5,phase:Math.PI/2});
   const bar=polyPath([[m[0]-half,m[1]-half*tilt-.035*k],[m[0]+half,m[1]+half*tilt-.035*k],[m[0]+half,m[1]+half*tilt+.035*k],[m[0]-half,m[1]-half*tilt+.035*k]],true);s.knockout(bar);s.fill(Y,bar,.95);s.stroke(K,bar,Math.max(3,.01*k));
   const bub=polyPath(Array.from({length:14},(_,i)=>[m[0]+half*tilt*2+Math.cos(i/14*TAU)*.05*k,m[1]+Math.sin(i/14*TAU)*.028*k] as Pt),true);s.knockout(bub);
   const f=sk.lAn,g=groundRing(c,f[0],f[2],.42*se,24);if(g.length>2)yInk(s,ribbon(g,Math.max(6,.05*kAt(c,f)),{close:true,taper:0,wobble:.5}),.95);}
  // "strike": sparks at the contact; "cleanly": one straight yellow line through the middle of the ball, toward goal
  if(tp>=TV&&tp<TV+.25){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],130,{n:10,seed:41,g:1-sm(TV+.1,TV+.25,tp),width:12});}
  const cl=sm(q.cl-.1,q.cl+.5,tt,easeOut)*(1-sm(q.end-.6,q.end-.2,tt));
  if(cl>.02){const a=P(c,V_HIT),bq=P(c,add(V_HIT,mul(sub(NET_TO,V_HIT),.5))),dx=bq[0]-a[0],dy=bq[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,L=Math.min(l,900)*cl,st:Pt=[a[0]-ux*120,a[1]-uy*120],e:Pt=[a[0]+ux*L,a[1]+uy*L],w=Math.max(12,.05*k0);
   yInk(s,ribbon([st,e],w,{taper:.2,pressure:.2,wobble:.8}),.95);yInk(s,polyPath([[e[0]+ux*w*2.6,e[1]+uy*w*2.6],[e[0]-uy*w*2,e[1]+ux*w*2],[e[0]+uy*w*2,e[1]-ux*w*2]],true),.95);}
  if(tp>=TV&&tp<TV+.7&&depthOf(c,bpos)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,ballAt(tp));speedLines(s,Y,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:42,len:170,width:7,cov:.9});}
 },
 still:6,
};

const story:RisoStory={
 id:'iniesta-final-2010',format:'11v11',title:"Iniesta's World Cup winner",
 theme:'In the biggest moment, stay calm. Settle your body and strike the ball cleanly.',
 ageNote:'World Cup final, Netherlands 0–1 Spain (after extra time), Soccer City, Johannesburg, 11 July 2010. Iniesta scored in the 116th minute.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the gold ball bounces once from the point (let it bounce), with a yellow ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.9),up=age<=0?0:(u<.4?Math.sin(u/.4*Math.PI)*160:Math.sin((u-.4)/.6*Math.PI)*90),g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*100*g,y+Math.sin(q)*30*g] as Pt;}),true),12,.95);
  if(age>.34&&age<.62)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp((age-.34)/.28),width:11});
  goldBall(s,x,y-up,52,age*10+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
