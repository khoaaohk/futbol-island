/** Iconic play film (signature): Samuel Eto'o, "the speedy run in behind". The real moment: his equaliser in the Champions League final,
 * Barcelona 2–1 Arsenal, Stade de France, Saint-Denis (Paris), Wednesday 17 May 2006, 76th minute. A RisoStory (chapters mode) played unchanged
 * by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer. Narration text: public/plays/narration/etoo-signature/script.json.
 * The lead voices it later with local Kokoro. Until then every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action
 * time is read from cue onsets and chapter seconds, so once timing.json exists `withTiming` re-times the action and no scene code changes.
 * LEAD: when public/plays/narration/etoo-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/etoo-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: "Signature: the speedy run in behind"; lesson "Time your run so you're onside, then sprint in
 * behind the defence"): the goal is exactly that signature — Eto'o stays on the Arsenal line until Larsson's one-touch flick, then sprints in
 * behind the right-back into the space and scores; it was so tight that Wenger and Henry called it offside, but the flag stayed down.
 *
 * SOURCES (read Sept 2026 as raw pages, cached in the session scratchpad films/src-cache/; the footage was not reviewed):
 *  - Wikipedia, "2006 UEFA Champions League final" (raw wikitext; cites UEFA's minute-by-minute and tactical line-ups)
 *    https://en.wikipedia.org/wiki/2006_UEFA_Champions_League_final ("Iniesta sent a pass through the inside-left channel to Larsson whose
 *    one-touch, right-footed lay-off quickly released Eto'o to equalise"; 76'; kits: "Arsenal wore their yellow away strip, while Barcelona wore
 *    their traditional blue and maroon striped kit"; kit template: claret shorts, blue socks; Arsenal yellow with dark shorts and socks; numbers;
 *    Almunia on for Lehmann (sent off 18'); Wenger "felt that Samuel Eto'o was offside"; Henry: "the first goal was a close offside decision";
 *    kick-off 20:45 CEST; referee Terje Hauge; assistants Holvik and Sundet)
 *  - BBC Sport, "Barcelona 2-1 Arsenal", 17 May 2006 http://news.bbc.co.uk/sport2/hi/football/europe/4773353.stm ("Larsson helped break
 *    Arsenal's resistance by delivering a deft pass into the path of Eto'o, who tucked a neat finish past Almunia at the near post"; "the wet
 *    surface"; Eto'o 76; line-ups)
 *  - The Guardian, minute-by-minute (Barry Glendenning), 17 May 2006 https://www.theguardian.com/football/minbymin/report/0,,1777091,00.html
 *    ("The ball was sent low and hard down the left flank by Deco, Larsson casually flicked it into the path of Eto'o, who made a fool of Eboue
 *    and sent a low drive past Almunia at the near post"; "it's raining heavily"; "lashing rain in Paris")
 *  - The Guardian, "Larsson takes his leave in the grandest style", 18 May 2006 ("his flick that allowed the dangerous Samuel Eto'o to clip an
 *    equaliser past Manuel Almunia")
 * CONFIRMED by those pages: the date, venue, competition and the 76th minute; Arsenal led 1–0 (Campbell 37') and were down to ten men;
 *  Barcelona in blue-and-claret stripes, Arsenal in their yellow away strip; heavy rain; the move went down Barcelona's LEFT channel; a low, hard
 *  pass reached Larsson (no. 7), whose one-touch RIGHT-footed flick/lay-off went into Eto'o's path; Eto'o (no. 9) beat Eboué (no. 27, Arsenal's
 *  right-back) and finished LOW past Almunia (no. 24) at the NEAR post; Arsenal (Wenger, Henry) said it was offside — a close decision; the
 *  goal stood. Numbers: Touré 28, Campbell 23, Cole 3, Gilberto 19, Ljungberg 8, Flamini 16, Hleb 13, Ronaldinho 10, Giuly 8, Deco 20,
 *  Belletti 2.
 * CONFLICTING: who played the pass to Larsson (Iniesta per Wikipedia/UEFA, Deco per the Guardian) — drawn as an unnumbered team-mate, never
 *  named. The claret shorts come only from the Wikipedia kit template (drawn red).
 * WIDELY KNOWN, NOT RE-READ THIS SESSION: Eto'o is right-footed; Larsson's shaved head; the Stade de France's bowl with its floating roof ring.
 * INFERRED / ILLUSTRATIVE: which foot Eto'o shot with (drawn right, first time — whether he took a touch first is not in the sources, so the
 *  narration never says); every position in metres (Arsenal's line ≈ 20 m out, Larsson ≈ 21 m out in the inside-left channel, the shot from
 *  ≈ 11 m out wide on the left of the box); Eto'o drawn exactly level with the second-last defender when Larsson touches it (the real frame is
 *  disputed — the narration only says "level is onside" as the rule and that the flag stayed down); which end, and so which side of the main
 *  camera Barcelona attacked (drawn: the near side, attacking right → left); the assistant referee on the near touchline; Almunia's keeper kit
 *  (drawn dark grey) and his dive; the ball (drawn as the Champions League starball, white with dark stars); seat and crowd colours; the
 *  celebration; camera placements and lenses.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 Larsson's flick): ch1 = the high main-stand broadcast camera in real time, in the rain; ch2 = the TV slow
 * replay from the touchline, level with the Arsenal line (the "offside camera"), frozen on the flick with the line drawn across, then his burst
 * past Eboué; ch3 = the replay from behind the goal, low through the net (the low shot at the near post past Almunia); ch4 = a duotone lesson
 * (time the run on the line, then sprint in behind). Seams are forward passages into the ball. Contact points are read from the solved
 * skeleton (right toe) so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer() (which also
 * prints the assistant's flag). Framing: the world is centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square
 * window. Inks: yellow (floodlights, Arsenal, grass with blue), red (skin, Barcelona's claret), blue (Barcelona, grass, seats), navy (night,
 * key line). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 ops. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,strike,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`etoo film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py etoo-signature (writes timing.json next to script.json). */
import timingJson from '../../../public/plays/narration/etoo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Paris, 2006',"Paris, 2006, the Champions League final, in pouring rain. Barcelona trail Arsenal. Larsson flicks it on, and Samuel Eto'o is already sprinting in behind. Goal!",
  ['Paris','pouring rain','Barcelona','Arsenal','Larsson flicks',"Samuel Eto'o",'sprinting in behind','Goal']),
 prov('Level',"Watch again. Eto'o waits level with the last defender: level is onside! Arsenal said offside, but the flag stayed down. Then he bursts past Eboué, into the space.",
  ['Watch again','waits level','last defender','level is onside','Arsenal said offside','flag stayed down','bursts past','into the space']),
 prov('Near post','From behind the goal: low and hard, past Almunia at the near post.',
  ['From behind the goal','low and hard','past Almunia','near post']),
 prov('Time your run',"Time your run so you're onside, then sprint in behind the defence!",
  ['Time your run',"onside",'sprint in behind','the defence']),
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`etoo film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105; the main stand at −z) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/(F*LENS))/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
function arrowPath(pts:Pt[],w:number,gaps?:[number,number][]){const p=ribbon(pts,w,{taper:.1,wobble:.8,gaps});if(pts.length>1){const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);p.addPath(polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true));}return p;}
/** a ground polyline through world points (skips points behind the camera) */
function groundPts(c:Camera,pts:V3[]):Pt[]{const o:Pt[]=[];for(const p of pts)if(depthOf(c,p)>NEAR)o.push(P(c,p));return o;}
const dashes=(step:number,on:number):[number,number][]=>{const g:[number,number][]=[];for(let x=step*.4;x<1;x+=step)g.push([x,x+on]);return g;};

// ================= the Stade de France at night, in the rain: a rounded bowl, a floating roof ring with the floodlights under its edge =================
const CX=-52.5;
/** a point on a rounded-rectangle ring (superellipse, n = 4) round the pitch centre */
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.sqrt(Math.abs(c)),y,b*Math.sign(s)*Math.sqrt(Math.abs(s))];}
const BOWL={a0:62,b0:41,y0:.9,a1:90,b1:67,y1:27,a2:98,b2:75,y2:40};
const SEG=32;
const CROWD=(()=>{const r=rng(2006),out:[number,number,number,number][]=[];for(let i=0;i<1150;i++){const th=r()*TAU,v=.04+r()*.92,end=Math.cos(th),c=r();
 // Barcelona fans (blue / claret) toward the goal Barcelona attack, Arsenal (yellow / red) toward the other end; paper faces and navy coats everywhere
 const barca=end>.2?.75:end<-.2?.2:.5;out.push([th,v,c<.3?0:c<.42?3:r()<barca?(r()<.55?1:2):(r()<.7?4:2),r()*TAU]);}return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;lite?:boolean;rain?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t,lite=false,rain=1}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 s.field(K,.8,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 [.14,.24].forEach((d,i)=>s.tone(B,polyPath([[-Bnd,hz-150-i*260],[Bnd,hz-150-i*260],[Bnd,hz+900],[-Bnd,hz+900]],true),d));
 // the bowl: a lower and an upper band of seats, the roof ring above, the floodlight strip under its inner edge
 const lower=new Path2D(),upper=new Path2D(),rows=new Path2D(),roof=new Path2D(),lamps=new Path2D(),halo=new Path2D();
 for(let i=0;i<SEG;i++){const a=i/SEG*TAU,b2=(i+1)/SEG*TAU;
  addPoly(lower,clipPoly(c,[ringPt(BOWL.a0,BOWL.b0,BOWL.y0,a),ringPt(BOWL.a0,BOWL.b0,BOWL.y0,b2),ringPt(BOWL.a1,BOWL.b1,BOWL.y1,b2),ringPt(BOWL.a1,BOWL.b1,BOWL.y1,a)]));
  addPoly(upper,clipPoly(c,[ringPt(BOWL.a1,BOWL.b1,BOWL.y1+1.5,a),ringPt(BOWL.a1,BOWL.b1,BOWL.y1+1.5,b2),ringPt(BOWL.a2,BOWL.b2,BOWL.y2,b2),ringPt(BOWL.a2,BOWL.b2,BOWL.y2,a)]));
  if(!lite)for(const v of[.25,.5,.75])addPoly(rows,clipPoly(c,[ringPt(lerp(BOWL.a0,BOWL.a1,v),lerp(BOWL.b0,BOWL.b1,v),lerp(BOWL.y0,BOWL.y1,v),a),ringPt(lerp(BOWL.a0,BOWL.a1,v),lerp(BOWL.b0,BOWL.b1,v),lerp(BOWL.y0,BOWL.y1,v),b2),ringPt(lerp(BOWL.a0,BOWL.a1,v+.04),lerp(BOWL.b0,BOWL.b1,v+.04),lerp(BOWL.y0,BOWL.y1,v+.04),b2),ringPt(lerp(BOWL.a0,BOWL.a1,v+.04),lerp(BOWL.b0,BOWL.b1,v+.04),lerp(BOWL.y0,BOWL.y1,v+.04),a)]));
  addPoly(roof,clipPoly(c,[ringPt(100,77,46,a),ringPt(100,77,46,b2),ringPt(74,52,44,b2),ringPt(74,52,44,a)]));
  const la=ringPt(75,53,43.2,a+.02),lb=ringPt(75,53,43.2,b2-.02);addPoly(lamps,clipPoly(c,[la,lb,add(lb,[0,-1.1,0]),add(la,[0,-1.1,0])]));
  const m=mix3(la,lb,.5);if(!lite&&depthOf(c,m)>8){const[x,y]=P(c,m),rr=clamp(3*kAt(c,m),14,110);if(Math.abs(x)<Bnd&&Math.abs(y)<Bnd)halo.addPath(polyPath(Array.from({length:12},(_,j)=>[x+Math.cos(j/12*TAU)*rr*1.8,y+Math.sin(j/12*TAU)*rr] as Pt),true));}}
 const stands=new Path2D();stands.addPath(lower);stands.addPath(upper);s.knockout(stands);s.tone(B,stands,.5);s.tone(K,upper,.35);if(!lite)s.tone(K,rows,.25);
 // crowd heads: faces, Barcelona blue and claret, navy coats, Arsenal yellow — bobbing on the twos when they react
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 if(!lite)for(const[th,v,col,ph] of CROWD){const bob=cheer>0&&(col===1||col===2)?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=ringPt(lerp(BOWL.a0,BOWL.a1,v),lerp(BOWL.b0,BOWL.b1,v),lerp(BOWL.y0,BOWL.y1,v)+.4+bob,th);if(depthOf(c,p)<3)continue;const k=kAt(c,p),sz=clamp(.55*k,4,18),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.8);if(seen[1])s.fill(B,heads[1],.95);if(seen[2])s.fill(R,heads[2],.9);if(seen[3])s.fill(K,heads[3],.9);if(seen[4])s.fill(Y,heads[4],.95);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const p=ringPt(lerp(BOWL.a0,BOWL.a2,r()),lerp(BOWL.b0,BOWL.b2,r()*.9),4+r()*30,r()*TAU);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.95);
 if(!lite)s.tone(Y,halo,.2);s.knockout(lamps);s.fill(Y,lamps,.9);
 // advertising boards round the pitch
 const boardsB=new Path2D(),boardsP=new Path2D();for(const z of[-36.5,36.5])for(let x=-105;x<4;x+=8){const q:V3[]=[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]];addPoly((Math.round(x/8)&1)?boardsB:boardsP,clipPoly(c,q));}
 const boards=new Path2D();boards.addPath(boardsB);boards.addPath(boardsP);s.knockout(boards);s.fill(B,boardsB,.9);
 // wet grass under the lights: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-112,0,-36.5],[7,0,-36.5],[7,0,36.5],[-112,0,36.5]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.58);
 if(!lite){const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);}
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 goal(s,c,o.net);
 if(rain>0)rainfall(s,t,rain);
}
/** heavy rain: paper streaks slanting through the floodlight, moving on the twos (one op) */
function rainfall(s:Sheet,t:number,amt:number){const tt=twos(t),hw=540*s.W/Math.max(1,s.H)+60,p=new Path2D(),n=Math.round(70*amt);
 for(let i=0;i<n;i++){const x0=(hash(i,7)*2-1)*hw,sp=1500+700*hash(i,8),len=40+50*hash(i,9),y=((hash(i,10)*1300+tt*sp)%1300)-650,x=x0+y*.18;
  p.addPath(ribbon([[x,y],[x+len*.18,y+len]],2.2+1.6*hash(i,11),{taper:.5,wobble:0}));}
 s.knockout(p,.55);}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple */
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (Champions League starball: white with dark stars — design illustrative) =================
const BALL_R=.11;
const starPts=(cx:number,cy:number,r:number,a:number):Pt[]=>Array.from({length:10},(_,i)=>{const rr=i%2?r*.45:r,q=a+i/10*TAU;return[cx+Math.cos(q)*rr,cy+Math.sin(q)*rr] as Pt;});
function starBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,polyPath(Array.from({length:20},(_,i)=>{const a=i/20*TAU;return[Math.cos(a)*r*1.02+r*.34,Math.sin(a)*r*1.02+r*.38] as Pt;}),true),duo?.3:.4);
 const st=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.55,cy=Math.sin(a)*r*.55*Math.cos(spin*.6);st.addPath(polyPath(starPts(cx,cy,r*.34,a),true));}
 s.fill(K,st,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (17 May 2006) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[Y,.45],[R,.36],[K,.16]];
/** a kit for this film: the assistant referee's flag is printed by the adapter */
type Kit=AthleteStyle&{flag?:boolean};
/** Barcelona: blue-and-claret stripes (blue shirt, red stripes print claret over it), claret shorts (drawn red), blue socks */
const BAR=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[B,.95],pattern:'stripes',patternInk:[R,.9],shorts:[R,.9],socks:[B,.95],trim:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:10+(n??0),...o});
/** Arsenal: the yellow away strip, dark shorts and socks (drawn navy) */
const ARS=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[Y,.95],shorts:[K,.85],socks:[K,.85],trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:40+(n??0),...o});
const ETOO:Kit=BAR(9,{skin:SKIN_D,hair:[K,.95],build:{height:1.8,bulk:.95,thighs:1.04},seed:9});
const LARSSON:Kit=BAR(7,{hair:null,hairStyle:'bald',build:{height:1.77,bulk:.95},seed:7});
const EBOUE:Kit=ARS(27,{skin:SKIN_D,hair:[K,.9],build:{height:1.78,bulk:.95}}),TOURE:Kit=ARS(28,{skin:SKIN_D,hair:[K,.9],build:{height:1.83,bulk:1.05}});
const CAMPBELL:Kit=ARS(23,{skin:SKIN_D,hair:[K,.9],build:{height:1.88,bulk:1.12}}),COLE:Kit=ARS(3,{skin:SKIN_M,hair:[K,.9],build:{height:1.76}});
const ALMUNIA:Kit={shirt:[K,.6],shorts:[K,.85],socks:[K,.7],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',gloves:'paper',line:K,sleeves:'long',shade:[K,.28],number:24,numberInk:'paper',build:{height:1.88},seed:24};
const OFFICIAL:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,sleeves:'short',seed:33};
const AR:Kit={...OFFICIAL,flag:true,seed:34};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[Y,.9]:[K,.45],pattern:'plain',shorts:lead?[K,.7]:[K,.3],socks:lead?[Y,.8]:'paper',trim:lead?K:'paper',skin:lead?[[Y,.6],[K,.25]]:[[Y,.35]],hair:lead?[K,.95]:st.hair?K:null,shade:[K,.2],numberInk:lead?K:'paper',gloves:st.gloves?[Y,.8]:undefined});
const ECHO:Kit={shirt:[Y,.45],shorts:[Y,.3],socks:[Y,.3],boots:[K,.6],skin:[[Y,.3]],hair:[K,.5],line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',seed:99};

/** the assistant referee's flag: a short stick from the right hand pointing down, a small yellow-and-red cloth (≤ 2 ops) */
function flagOf(s:Sheet,r:DrawResult,c:Camera,up:number){
 const sk=r.sk,h=sk.rHa,dn:V3=up>0?[0,1,0]:[0,-1,0],tip=add(h,[dn[0]*.55,dn[1]*.55,dn[2]*.55]);if(depthOf(c,h)<NEAR||depthOf(c,tip)<NEAR)return;
 const a=P(c,h),b=P(c,tip),k=kAt(c,h),w=Math.max(2,.025*k);s.fill(K,ribbon([a,b],w,{taper:0,wobble:.2}));
 const q1=P(c,add(tip,[0,-dn[1]*.3,0])),q2=P(c,add(add(tip,[0,-dn[1]*.3,0]),[.32,0,.1])),q3=P(c,add(tip,[.32,0,.1]));
 const cloth=polyPath([b,q1,q2,q3],true);s.knockout(cloth,.9);s.fill(Y,cloth,.9);s.fill(R,polyPath([b,[(b[0]+q1[0])/2,(b[1]+q1[1])/2],[(b[0]+q2[0])/2,(b[1]+q2[1])/2],[(b[0]+q3[0])/2,(b[1]+q3[1])/2]],true),.9);}
/** THE figure adapter: every footballer and official in this film is drawn here (athlete.ts: skeletal pose, one continuous silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 const r=drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
 if(style.flag&&r.heightPx>26)flagOf(s,r,c,-1);
 return r;
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Larsson's flick) =================
const LINE_X=-19.8;// Arsenal's line when Larsson touches it (the second-last defender, Eboué)
const TPASS=-1.25,TS=1.38,SHT=.5,T_GOAL=TS+SHT;
const EB:Build=ETOO.build!,LB:Build=LARSSON.build!;
// ---- Larsson: side-on in the inside-left channel, the pass comes across him from his left; a one-touch, right-footed flick into the path ----
const LP:[number,number]=[-21.4,-12.4];
const YL=YAW(-.45,-.89);
const LPLACE:Place={x:LP[0],z:LP[1],yaw:YL};
const FLICK_POSE=posed({lHipF:14,lKnee:36,rHipF:10,rHipA:34,rKnee:18,rAnk:10,rHipR:-26,lean:12,bend:-12,roll:-4,lShA:44,rShA:28,lElb:30,rElb:40,neckY:20,neckP:38});
const LK:[number,Pose][]=[
 [-.7,posed({lHipF:14,rHipF:14,lKnee:28,rKnee:28,lean:12,lShA:26,rShA:26,lElb:40,rElb:40,neckY:60,neckP:18})],// watching the pass come from his left
 [-.2,posed({lHipF:16,lKnee:34,rHipF:4,rHipA:22,rKnee:30,rHipR:-20,lean:14,bend:-6,lShA:36,rShA:40,lElb:34,rElb:34,neckY:40,neckP:32})],// opens the right leg
 [0,FLICK_POSE],// the flick
 [.3,posed({lHipF:12,lKnee:32,rHipF:6,rHipA:24,rKnee:24,rHipR:-10,lean:10,bend:-8,neckY:-30,neckP:20,lShA:36,rShA:30,lElb:36,rElb:40})],// head turns to watch it go
 [.9,posed({lHipF:16,rHipF:16,lKnee:26,rKnee:26,lean:10,lShA:22,rShA:22,lElb:40,rElb:40,neckY:-40,neckP:6})],
];
const FLICK_SK=solve(FLICK_POSE,LB,LPLACE);
const [lfx,lfz]=dirOf(YL);
const B_F:V3=[FLICK_SK.rToe[0]-lfz*.08,.11,FLICK_SK.rToe[2]+lfx*.08];// the ball meets the inside of his right boot
// ---- Eto'o: on the line → the burst → a first-time, low, right-footed shot at the near post ----
const NET_TO:V3=[0,.24,-3.15];// low, just inside the near post
const SP:[number,number]=[-11.3,-11.9];// where he plants to shoot (the ball sits just ahead of the right boot)
const YS=YAW(NET_TO[0]-SP[0],NET_TO[2]-SP[1]);
const SPLACE:Place={x:SP[0],z:SP[1],yaw:YS};
const SHOT_SK=solve(strike(STRIKE_CONTACT,{power:.8}),EB,SPLACE);
const [sfx,sfz]=dirOf(YS);
const B_S:V3=[SHOT_SK.rToe[0]+sfx*.1,.11,SHOT_SK.rToe[2]+sfz*.1];
type MKey=[number,number,number];
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** Eto'o's run: drifting along the line, timing it, level at the flick, then the sprint to the shot and the celebration toward the corner */
const ERUN:MKey[]=[[-12,-27,-21.5],[-4,-23.5,-19.6],[-1.6,-21.4,-18.6],[-.5,-20.5,-17.9],[0,LINE_X,-17.5],[.35,-18.1,-16.4],[.8,-15.4,-14.6],[TS-.3,SP[0]-sfx*2.1,SP[1]-sfz*2.1],[TS,SP[0],SP[1]],[TS+.6,SP[0]+sfx*1.5,SP[1]+sfz*1.5]];
const CELEB:MKey[]=[[TS+.6,SP[0]+sfx*1.5,SP[1]+sfz*1.5],[TS+1.8,-8.4,-19],[TS+3.2,-6.5,-25.5]];
function etooAt(tau:number):{pose:Pose;place:Place}{
 if(tau>TS+.6){const q=pathPos(CELEB,tau),v=Math.hypot(q.vx,q.vz),run=celebrate(q.dist/3,{kind:'run'}),arms=celebrate(Math.max(0,tau-TS-3.2)/.9,{kind:'arms'});
  const fin=strike(1,{power:.8}),pose=tau<TS+3.2?blendPose(fin,run,sm(TS+.6,TS+1.1,tau)):blendPose(run,arms,sm(TS+3.2,TS+3.5,tau));
  return{pose,place:{x:q.x,z:q.z,yaw:v>.3?lerpAng(YS,YAW(q.vx,q.vz),sm(TS+.6,TS+1.1,tau)):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}
 const r=runner(ERUN,tau,B_F,.2);
 // before the flick he glances across at Larsson (timing the run)
 if(tau<.1)r.pose.neckY+=.7*sm(-2.2,-1.2,tau)*(1-sm(-.1,.15,tau));
 const w=sm(TS-.42,TS-.2,tau);if(w>0){const u=clamp(STRIKE_CONTACT+(tau-TS)/.86,0,1);r.pose=blendPose(r.pose,strike(u,{power:.8}),w);r.place.yaw=lerpAng(r.place.yaw??0,YS,w);}
 return r;}
// ---- the ball: the pass → Larsson's flick → into the path → the shot → the net ----
const PASSER_YAW=YAW(B_F[0]+13.8,B_F[2]-5.6);
const PASS_SK=solve(strike(.52,{power:.6}),{},{yaw:PASSER_YAW});
const PASSER_BALL:V3=[B_F[0]-15.2,.11,B_F[2]+5.6];
const PP:[number,number]=[PASSER_BALL[0]-PASS_SK.rToe[0],PASSER_BALL[2]-PASS_SK.rToe[2]];
function ballAt(tau:number):V3{
 if(tau<TPASS)return PASSER_BALL;
 if(tau<0){const u=(tau-TPASS)/-TPASS,e=1.3*u-.3*u*u;return[lerp(PASSER_BALL[0],B_F[0],e),.11,lerp(PASSER_BALL[2],B_F[2],e)];}
 if(tau<TS){const u=tau/TS,e=1.45*u-.45*u*u;return[lerp(B_F[0],B_S[0],e),.11,lerp(B_F[2],B_S[2],e)];}
 const s=tau-TS;if(s<SHT){const u=s/SHT;return[lerp(B_S[0],NET_TO[0],u),lerp(.11,NET_TO[1],u)+.12*Math.sin(Math.PI*u),lerp(B_S[2],NET_TO[2],u)];}
 const e=s-SHT,u=clamp(e/.14);if(u<1)return mix3(NET_TO,[1.75,.3,-3.3],easeOut(u));
 const d=clamp((e-.14)/.9);return[1.75-.5*d,.11+.2*(1-d)*Math.abs(Math.cos(d*5)),-3.3+.2*d];}
const NET_HIT:V3=[2,.3,-3.3];

// ---- everybody else ----
type Actor={style:Kit;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:Kit,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
/** a defender holding the line: low, side-on, arms out */
const SET=posed({lHipF:30,rHipF:24,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:18,pitch:3,lShA:28,rShA:28,lElb:56,rElb:56,neckP:-6});
const PASS_RUN:MKey[]=[[-12,PP[0]-6,PP[1]-1],[-3,PP[0]-2.2,PP[1]-.3],[-1.9,PP[0]-.9,PP[1]],[TPASS+.4,PP[0]+.6,PP[1]+.1],[3,PP[0]+5,PP[1]]];
const ACTORS:Actor[]=[
 {style:EBOUE,at:(t,b)=>runner([[-12,-24.5,-16.5],[-2,-20.6,-15.4],[0,LINE_X,-15.1],[.45,-19.6,-14.9],[TS,-16.2,-13.4],[TS+1.5,-12.6,-12.6]],t,b,1,SET)},// Emmanuel Eboué (27), the right-back
 {style:TOURE,at:(t,b)=>runner([[-12,-24.4,-6.6],[0,-19.9,-6.9],[.5,-19.4,-7.3],[TS,-16.4,-8.2],[TS+1.5,-13.2,-7.4]],t,b,2,SET)},// Kolo Touré (28)
 {style:CAMPBELL,at:(t,b)=>runner([[-12,-23.8,1.8],[0,-19.9,1.1],[.5,-19.4,.4],[TS,-17.2,-1.6],[TS+1.5,-15.2,-2.6]],t,b,3,SET)},// Sol Campbell (23)
 {style:COLE,at:(t,b)=>runner([[-12,-24.5,10.5],[0,-20.6,8.7],[TS,-18.6,5.2],[TS+1.5,-16.6,3.2]],t,b,4,SET)},// Ashley Cole (3)
 {style:LARSSON,at:(t,b)=>{const r=runner([[-12,-27,-8],[-2.5,-22.6,-11.3],[-.8,LP[0],LP[1]],[.5,LP[0],LP[1]],[2.4,-17.6,-10.4],[4,-15,-9.6]],t,b,5);
  const w=sm(-1,-.55,t)*(1-sm(.5,.95,t));if(w>0){r.pose=blendPose(r.pose,keyPoses(t,LK,{torso:.04,arms:.07,head:.03}),w);r.place.yaw=lerpAng(r.place.yaw??0,YL,w);}return r;}},// Henrik Larsson (7)
 {style:BAR(null,{skin:SKIN_L}),at:(t,b)=>{const r=runner(PASS_RUN,t,b,6);if(t>TPASS-.6&&t<TPASS+.5){const u=clamp((t-TPASS)/.9+.52);r.pose=blendPose(r.pose,strike(u,{power:.6}),Math.sin(clamp((t-TPASS+.6)/1.1)*Math.PI));r.place.yaw=PASSER_YAW;}return r;}},// the passer (sources differ: Iniesta or Deco)
 {style:ALMUNIA,at:(t,b)=>{const pos=pathPos([[-12,-1.2,-.6],[0,-1.4,-1.2],[TS,-1.9,-2.1]],t),x=pos.x,z=pos.z,face=YAW(b[0]-x,b[2]-z);// Manuel Almunia (24)
  const ds=TS+.04;if(t<ds)return{pose:keeperSet(t*1.7),place:{x,z,yaw:face}};
  return{pose:keeperDive(clamp((t-ds)/1.2),{side:'r',height:.06}),place:{x,z,yaw:YAW(B_S[0]-x,B_S[2]-z)}};}},
 mover(ARS(19,{skin:SKIN_M}),[[-12,-31,-9.6],[0,-25,-11.4],[TS,-22.8,-11.8],[TS+2,-21,-11.2]],7),// Gilberto Silva (19), closing Larsson
 mover(ARS(16,{hair:[K,.8]}),[[-12,-32,-1],[0,-27.4,-3.2],[TS+2,-23.6,-5.4]],8),// Mathieu Flamini (16)
 mover(ARS(13,{hair:[Y,.5]}),[[-12,-34,-20],[0,-29.4,-18.6],[TS+2,-25,-16.4]],9),// Alexander Hleb (13)
 mover(ARS(8,{hair:[K,.7]}),[[-12,-37,7],[0,-32,5],[TS+2,-28.5,3]],10),// Freddie Ljungberg (8)
 mover(BAR(10,{skin:SKIN_D,hair:[K,.95],hairStyle:'long'}),[[-12,-31,2.6],[0,-25.2,3],[TS,-19.4,.6],[TS+2,-15.6,-1.6]],11),// Ronaldinho (10)
 mover(BAR(8,{hair:[K,.8]}),[[-12,-29,16.5],[0,-23.8,14.5],[TS+2,-17.5,9.5]],12),// Ludovic Giuly (8)
 mover(BAR(20,{skin:SKIN_M}),[[-12,-41,3.5],[0,-35,2],[TS+2,-31.5,.2]],13),// Deco (20)
 mover(BAR(2,{skin:SKIN_M}),[[-12,-40,23],[0,-34,21.5],[TS+2,-29.5,18]],14),// Juliano Belletti (2)
 mover(OFFICIAL,[[-12,-38,5.5],[0,-33.5,4.5],[TS+2,-27,2.5]],15),// referee Terje Hauge
 mover(AR,[[-12,-23.8,-35.3],[0,LINE_X,-35.3],[TS,-17.4,-35.3],[TS+2,-15.2,-35.3]],16),// the assistant referee, level with the line, flag down
];
const IX={eboue:0,toure:1,campbell:2,cole:3,larsson:4,almunia:6,ar:16};
const LINE=[0,1,2,3];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Eto'o with motion smear + secondary motion; `cap` limits figure detail (passages) */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:Kit,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===ETOO?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&style!==ETOO&&hPx<34)return;const detail:Detail|undefined=hPx<62||(style!==ETOO&&hPx<95)||(o.cap&&style!==ETOO)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const he=etooAt(tp);put(ETOO,he,o.hero?etooAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  starBall(s,q[0],q[1],r,tau>TPASS?(tau-TPASS)*9:0,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,eto:he};}
/** the Arsenal line at the flick: a yellow dashed line across the pitch through the second-last defender (x = LINE_X) */
function offsideLine(s:Sheet,c:Camera,amt:number,w=.16){if(amt<.02)return;const zs:V3[]=[];const z0=-34,z1=lerp(z0,34,amt);for(let i=0;i<=24;i++)zs.push([LINE_X,.03,lerp(z0,z1,i/24)]);const pts=groundPts(c,zs);if(pts.length<2)return;
 yInk(s,ribbon(pts,Math.max(5,w*kAt(c,[LINE_X,0,-17]))*1,{taper:0,wobble:.5,gaps:dashes(.07,.035)}),.95);}
/** a ring on the ground round a player */
function ringAround(path:Path2D,c:Camera,x:number,z:number,g:number){const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}

// ================= chapter 1 (live, real time): the high main-stand camera in the rain =================
const ch1q=()=>({pa:T(0,'Paris'),pr:T(0,'pouring rain'),ba:T(0,'Barcelona'),ar:T(0,'Arsenal'),lf:T(0,'Larsson flicks'),se:T(0,"Samuel Eto'o"),si:T(0,'sprinting in behind'),g:T(0,'Goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. The flick lands just after "Larsson flicks"; the ball hits the net close to "Goal" when the voice allows. */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.g-T_GOAL-.15,q.lf+.15,Math.max(q.lf+.15,Math.min(q.lf+1.6,q.end-T_GOAL-1.3)));return{TL,end:q.end};};
const BCAM:V3=[-24,19,-52];
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-48,6,-2],[q.pr,-40,4,-8],[q.ba,-26,1.5,-10],[q.ar,-23,1,-8],[q.lf,lerp(LP[0],PASSER_BALL[0],.35),1,lerp(LP[1],PASSER_BALL[2],.35)]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),e=etooAt(tau).place;
 if(tau<0)return[lerp(b[0],LP[0],.5)+1,1,lerp(b[2],LP[1],.5)];
 const k=tau<T_GOAL?.35:lerp(.35,.75,sm(T_GOAL,T_GOAL+1.5,tau));return[lerp(b[0],e.x??0,k)+1.2,1,lerp(b[2],e.z??0,k)];}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL-2,TL-.6,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,2100],[q.pr,2600],[q.ba,3900],[q.ar,4200],[q.lf,5200],[TL,5000],[TL+TS,5200],[TL+T_GOAL+.4,4600],[q.end,5200]]),easeInOutSine);return cam(BCAM,look,F);}
/** team rings on "Barcelona" (the stripes) and "Arsenal" (the yellow shirts); a ring on Larsson; on "Samuel Eto'o" a ring on him */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),{TL}=ch1T(),ra=sm(q.ba,q.ba+.3,t,easeOutBack)*(1-sm(q.ar,q.ar+.5,t)),rc=sm(q.ar,q.ar+.3,t,easeOutBack)*(1-sm(q.lf,q.lf+.5,t)),rl=sm(q.lf,q.lf+.3,t,easeOutBack)*(1-sm(TL+.3,TL+.8,t)),re=sm(q.se,q.se+.3,t,easeOutBack)*(1-sm(TL+TS-.2,TL+TS+.2,t));
 if(ra<.02&&rc<.02&&rl<.02&&re<.02)return;const bp=ballAt(tp),pa=new Path2D(),pc=new Path2D(),py=new Path2D();
 ACTORS.forEach((a,i)=>{const p=a.at(tp,bp).place,x=p.x??0,z=p.z??0;if(a.style.pattern==='stripes'&&ra>.02)ringAround(pa,c,x,z,ra);if(a.style.shirt?.[0]===Y&&rc>.02)ringAround(pc,c,x,z,rc);if(i===IX.larsson&&rl>.02)ringAround(py,c,x,z,rl*1.3);});
 const e=etooAt(tp).place;if(ra>.02)ringAround(pa,c,e.x??0,e.z??0,ra);if(re>.02)ringAround(py,c,e.x??0,e.z??0,re*1.3);
 if(ra>.02){s.knockout(pa,.9);s.fill(B,pa,.95);}if(rc>.02){s.knockout(pc,.9);s.fill(Y,pc,.95);s.fill(K,pc,.3);}if(rl>.02||re>.02)yInk(s,py,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  stadium(s,c,{t,lite:t>q.end-.7,rain:.6+.5*sm(q.pr,q.pr+.6,t),cheer:.1+.9*sm(0,.5,goalIn)*(1-.5*sm(1.5,3,goalIn)),flash:.1+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  teamRings(s,c,tt-TL,t);
  // "sprinting in behind": his run lights up ahead of him, from the line to the shot, a dashed yellow arrow
  const sr=sm(q.si,q.si+.4,t)*(1-sm(TL+T_GOAL,TL+T_GOAL+.5,t));if(sr>.02){const pts=groundPts(c,Array.from({length:13},(_,i)=>{const p=pathPos(ERUN,lerp(0,TS,i/12*sr));return[p.x,.03,p.z] as V3;}));
   if(pts.length>1)yInk(s,arrowPath(pts,Math.max(6,.16*kAt(c,[-15,0,-14])),dashes(.14,.07)),.9);}
  drawWorld(s,c,t-TL,tt-TL,{ballMin:12,cap:t>q.end-.7});
  const tau=tt-TL;if(tau>TS&&tau<T_GOAL){const a=P(c,ballAt(tau-.06)),b=P(c,ballAt(tau));speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:5,len:110,width:6,cov:.85});}
  // "Goal!": a yellow burst in the net
  const gb=sm(q.g,q.g+.3,t,easeOutBack)*(1-sm(q.end-1,q.end-.6,t));if(gb>.02&&goalIn>0){const p=P(c,NET_HIT);sparkBurst(s,Y,p[0],p[1],Math.max(50,1.1*kAt(c,NET_HIT))*gb,{n:12,seed:17,g:gb,width:9});}},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=etooAt(t-TL).place,g:V3=[p.x??0,1,p.z??0],[x,y]=P(c,g);return apertureDisc(x,y,Math.max(16,.9*kAt(c,g)),12);},
 still:9.4,
};

// ================= chapter 2 (TV replay, slow, from the touchline level with Arsenal's line): the line, onside, the flag, the burst =================
const ch2q=()=>({w:T(1,'Watch again'),wl:T(1,'waits level'),ld:T(1,'last defender'),lo:T(1,'level is onside'),ao:T(1,'Arsenal said offside'),fd:T(1,'flag stayed down'),bp:T(1,'bursts past'),sp:T(1,'into the space'),end:SEC(1)});
/** replay clock: slow toward the flick, FROZEN on it through "Level is onside … flag stayed down", then the burst in slow motion */
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-2.2],[q.wl,-1],[q.ld+.2,-.25],[q.lo,0],[q.bp-.1,0],[q.sp+.3,.85],[q.end,1.2]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),e=etooAt(tau).place,follow=sm(q.bp-.2,q.end,t,easeInOutSine);
 const pos:V3=[lerp(LINE_X-3,-14,follow),lerp(6.5,5.5,follow),-53];
 const look=mix3([LINE_X+.4,.2,-17],[(e.x??0)+1.5,.6,(e.z??0)+1],follow);
 const F=key(t,mono([[0,3000],[q.wl,3600],[q.lo,3400],[q.fd,3300],[q.bp,3500],[q.end,3900]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.06,flash:.05,rain:.8,lite:t>q.end-.7||t<.6});
  // "Level is onside": the line drawn across the pitch through the second-last defender (x = LINE_X); held while frozen
  offsideLine(s,c,sm(q.ld,q.ld+.7,tt)*(1-sm(q.bp+.4,q.bp+.9,tt)));
  // "into the space": the gap behind Eboué, toned yellow
  const sp=sm(q.bp+.2,q.sp+.3,tt)*(1-sm(q.end-.6,q.end-.3,tt));if(sp>.02){const g=new Path2D();addPoly(g,clipPoly(c,[[LINE_X+1,.02,-19],[-9,.02,-15.5],[-9,.02,-8.5],[LINE_X+1,.02,-12.5]]));s.tone(Y,g,.3*sp);}
  const w=drawWorld(s,c,tau,tp,{ballMin:22,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.wl,q.wl+.5,tt)),cap:t>q.end-.7});
  // "waits level" / "last defender": rings on Eto'o and on Eboué, tied by a short dashed bar along the line
  const rr=sm(q.wl,q.wl+.3,tt,easeOutBack)*(1-sm(q.ao,q.ao+.4,tt)),rd=sm(q.ld,q.ld+.3,tt,easeOutBack)*(1-sm(q.ao,q.ao+.4,tt));
  if(rr>.02||rd>.02){const path=new Path2D(),bp=ballAt(tp),eb=ACTORS[IX.eboue].at(tp,bp).place,e=w.eto.place;if(rr>.02)ringAround(path,c,e.x??0,e.z??0,rr*1.2);if(rd>.02)ringAround(path,c,eb.x??0,eb.z??0,rd*1.2);yInk(s,path,.95);}
  // "Arsenal said offside": the four Arsenal defenders' arms go up (drawn as small red ticks over them); "flag stayed down": a ring on the flag
  const ao=sm(q.ao,q.ao+.3,tt,easeOutBack)*(1-sm(q.fd+.2,q.fd+.6,tt));if(ao>.02){const path=new Path2D(),bp=ballAt(tp);for(const i of LINE){const pl=ACTORS[i].at(tp,bp).place,p:V3=[pl.x??0,2.25,pl.z??0];if(depthOf(c,p)<1)continue;const pp=P(c,p),k=kAt(c,p),h=clamp(.34*k,8,70)*ao;
   path.addPath(ribbon([[pp[0],pp[1]],[pp[0],pp[1]-h]],Math.max(3,.06*k),{taper:.3,wobble:0}));path.addPath(polyPath(Array.from({length:10},(_,j)=>[pp[0]+Math.cos(j/10*TAU)*h*.14,pp[1]+h*.32+Math.sin(j/10*TAU)*h*.14] as Pt),true));}s.knockout(path,.9);s.fill(R,path,.95);}
  const fd=sm(q.fd,q.fd+.3,tt,easeOutBack)*(1-sm(q.bp+.3,q.bp+.7,tt));if(fd>.02){const a=ACTORS[IX.ar].at(tp,ballAt(tp)),sk=solve(a.pose,{},a.place),p:V3=add(sk.rHa,[0,-.35,0]),pp=P(c,p);if(depthOf(c,p)>1)yRing(s,pp[0],pp[1],.5*kAt(c,p)*fd,Math.max(4,.05*kAt(c,p)));}
  // the replay's pause mark while frozen on the flick
  const pz=sm(q.lo,q.lo+.25,tt)*(1-sm(q.bp-.2,q.bp,tt));if(pz>.02){const path=new Path2D(),hw=540*s.W/Math.max(1,s.H),x=-hw+150,y=-540+150,h=120*pz,bw=h*.3,g=h*.22;for(const dx of[-g-bw,g])path.addPath(polyPath([[x+dx,y-h/2],[x+dx+bw,y-h/2],[x+dx+bw,y+h/2],[x+dx,y+h/2]],true));yInk(s,path,.9);}
 },
 aperture(t){const c=ch2Cam(t),p=etooAt(tau2(t)).place,g:V3=[p.x??0,1,p.z??0],[x,y]=P(c,g);return apertureDisc(x,y,Math.max(24,.8*kAt(c,g)),12);},
 still:5.5,
};

// ================= chapter 3 (replay from behind the goal, low through the net): the low shot past Almunia at the near post =================
const ch3q=()=>({fb:T(2,'From behind the goal'),sl:T(2,'low and hard'),pa:T(2,'past Almunia'),np:T(2,'near post'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,.55],[q.sl,TS-.08],[q.sl+.35,TS+.06],[q.pa+.1,TS+.3],[q.np+.1,T_GOAL+.02],[q.end,T_GOAL+.02+(q.end-q.np-.1)*.8]]),x=>x);};
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),toCeleb=sm(q.np+.6,q.end,t,easeInOutSine),e=etooAt(tau).place;
 const pos:V3=[5,1.35+.4*toCeleb,-1.6];
 const look0:V3=mix3([B_S[0],.8,B_S[2]],[-2,.8,-3],.3),look1:V3=[(e.x??0),1,(e.z??0)];
 const look=mix3(look0,look1,.55*toCeleb);
 const F=key(t,mono([[0,2300],[q.fb+.3,2600],[q.sl,2900],[q.pa,2600],[q.np+.3,2400],[q.end,2600]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.np+.1;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,rain:.9,lite:t>q.end-.7||t<.6,cheer:.1+1.1*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "low and hard": the ball's path to the near post drawn low along the grass
  const sl=sm(q.sl,q.sl+.4,tt)*(1-sm(q.np+.4,q.np+.9,tt));if(sl>.02){const pts=groundPts(c,Array.from({length:11},(_,i)=>{const u=i/10*sl;return[lerp(B_S[0],NET_TO[0],u),.04,lerp(B_S[2],NET_TO[2],u)] as V3;}));if(pts.length>1)yInk(s,arrowPath(pts,Math.max(5,.07*kAt(c,[-5,0,-7])),dashes(.14,.07)),.9);}
  const w=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,cap:t>q.end-.7||t<.6,skip:[7,8,9,10,14,15]});
  if(tp>=TS&&tp<TS+.18){const p=P(c,B_S);sparkBurst(s,Y,p[0],p[1],70+60*sm(TS,TS+.08,tp,easeOut),{n:9,seed:10,g:1-sm(TS+.08,TS+.18,tp),width:9});}
  if(tp>TS&&tp<T_GOAL&&depthOf(c,w.ball)>NEAR+.8){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:11,len:120,width:6,cov:.85});}
  // "near post": a ring round the near post as it goes in
  const np=sm(q.np,q.np+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(np>.02){const p:V3=[0,.5,-3.66];if(depthOf(c,p)>NEAR){const pp=P(c,p);yRing(s,pp[0],pp[1],.32*kAt(c,p)*np,Math.max(4,.06*kAt(c,p)));}}
 },
 aperture(t){const c=ch3Cam(t),p=etooAt(tau3(t)).place,g:V3=[p.x??0,1,p.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.6)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.8*kAt(c,g),22,140),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): time the run on the line, then sprint in behind =================
const ch4q=()=>({ty:T(3,'Time your run'),on:T(3,'onside'),si:T(3,'sprint in behind'),td:T(3,'the defence'),end:SEC(3)});
/** lesson clock: drifting on the line through "Time your run", level on "onside", the sprint on "sprint in behind", the pass reaching him at the end */
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,-2.4],[q.ty,-1.8],[q.on,-.05],[q.si,.05],[q.td+.2,.9],[q.end-.3,TS]]),x=>x);};
const ETOO4=duo(ETOO,true),LINE4=[duo(EBOUE),duo(TOURE),duo(CAMPBELL),duo(COLE)],LARS4=duo(LARSSON);
function LCAM(t:number){const q=ch4q(),tau=tau4(t),e=etooAt(tau).place,w=sm(q.si,q.end-.4,t,easeInOutSine);
 const pos:V3=[lerp(LINE_X-4,-11,w),lerp(3.6,3.2,w),lerp(-29,-27,w)],look:V3=mix3([LINE_X+1,.8,-14],[(e.x??0)+1,.8,(e.z??0)+2],w);
 return cam(pos,look,key(t,mono([[0,2300],[q.on,2500],[q.si,2200],[q.td+.4,2400],[q.end,2500]])));}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-34],[6,0,-34],[6,0,34],[-60,0,34]]));s.tone(K,floor,.2);
  // the space behind the line, lit yellow (brighter once he sprints into it)
  const spc=new Path2D();addPoly(spc,clipPoly(c,[[LINE_X,.02,-24],[0,.02,-24],[0,.02,4],[LINE_X,.02,4]]));s.tone(Y,spc,.1+.14*sm(q.si,q.td+.3,tt));
  goal(s,c);
  // "onside": the line (yellow dashes), pulsing on the word
  offsideLine(s,c,1,.14+.08*sm(q.on,q.on+.25,tt)*(1-sm(q.on+.7,q.on+1.2,tt)));
  const items:Item[]=[],h=etooAt(tp),hp=etooAt(tp-1/12),bp=ballAt(tp);
  // "Time your run": the ghost of a run made too early, a step past the line (a halftone echo with a navy cross)
  const gh=sm(q.ty+.3,q.ty+.7,tt)*(1-sm(q.on,q.on+.4,tt));
  if(gh>.02){const g=runCycle(.3,{speed:.8}),pl:Place={x:LINE_X+2.6,z:-17.6,yaw:YAW(1,.4)};items.push({depth:depthOf(c,[pl.x!,0,pl.z!]),draw:()=>{drawPlayer(s,g,c,ECHO,pl,{detail:'low'});const p:V3=[pl.x!,2.3,pl.z!];if(depthOf(c,p)<1)return;const pp=P(c,p),r=.28*kAt(c,p)*gh,x=new Path2D();x.addPath(ribbon([[pp[0]-r,pp[1]-r],[pp[0]+r,pp[1]+r]],Math.max(4,r*.3),{taper:0,wobble:0}));x.addPath(ribbon([[pp[0]+r,pp[1]-r],[pp[0]-r,pp[1]+r]],Math.max(4,r*.3),{taper:0,wobble:0}));s.fill(K,x,.9);}});}
  LINE.forEach((i,k)=>{const a=ACTORS[i].at(tp,bp);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,LINE4[k],a.place,{detail:'mid'})});});
  {const a=ACTORS[IX.larsson].at(tp,bp);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,LARS4,a.place,{detail:'mid'})});}
  items.push({depth:depthOf(c,[h.place.x??0,0,h.place.z??0]),draw:()=>drawPlayer(s,h.pose,c,ETOO4,h.place,{prev:hp,smear:true})});
  const bpos=ballAt(tau);items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const b2=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(16,BALL_R*kAt(c,bpos));starBall(s,b2[0],b2[1],r,tau*9,{duo:true,sq:clamp(Math.hypot(b2[0]-a[0],b2[1]-a[1])/(r*3),0,.7),dir:Math.atan2(b2[1]-a[1],b2[0]-a[0])});}});
  items.filter(i=>i.depth>1.2).sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "sprint in behind" / "the defence": his run as a solid yellow arrow into the space behind the line
  const sr=sm(q.si,q.td+.4,tt)*(1-sm(q.end-.8,q.end-.4,tt));if(sr>.02){const pts=groundPts(c,Array.from({length:13},(_,i)=>{const p=pathPos(ERUN,lerp(0,TS,i/12*sr));return[p.x,.03,p.z] as V3;}));if(pts.length>1)yInk(s,arrowPath(pts,Math.max(6,.12*kAt(c,[-15,0,-14]))),.95);}
  // "the defence" → the end: a ring on the ball as the flick reaches his path
  const br=sm(q.td+.5,q.td+.8,tt,easeOutBack);if(br>.02&&depthOf(c,bpos)>1){const p=P(c,bpos);yRing(s,p[0],p[1],.5*kAt(c,bpos)*br,Math.max(4,.05*kAt(c,bpos)));}
 },
 still:6,
};

const story:RisoStory={
 id:'etoo-signature',format:'11v11',title:"Eto'o's run in behind",
 theme:"Time your run so you're onside, then sprint in behind the defence.",
 ageNote:'Champions League final, Barcelona 2–1 Arsenal, Stade de France, Paris, 17 May 2006. Eto\'o equalised in the 76th minute; Belletti won it.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a sprint in behind — a dashed yellow line (the defence) and a burst arrow past it. Reduced motion: the mark, still. */
 touch(s,x,y,age,seed){
  const g=age<=0?1:easeOutBack(clamp(age/.25)),run=age<=0?1:easeOut(clamp(age/.5));
  const line=new Path2D();for(let i=-3;i<=3;i++)line.addPath(ribbon([[x-20,y+i*44-14],[x-20,y+i*44+14]],10*g,{taper:0,wobble:0}));s.knockout(line,.9);s.fill(Y,line,.95);
  const pts:Pt[]=[[x-80,y+30],[x-20,y+10],[x-20+170*run,y-20]];s.fill(Y,arrowPath(pts,12*g),.95);
  if(age>0&&age<.3)sparkBurst(s,Y,x-20,y+10,90*g,{n:8,seed,g:1-clamp(age/.3),width:10});
  starBall(s,x-20+190*run,y-20,34,age*12+hash(seed,3)*TAU,{sq:0,dir:0});
 },
};
export default story;
