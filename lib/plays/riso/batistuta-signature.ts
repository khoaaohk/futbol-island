/** Iconic-play film (signature): "the thunderbolt strike" — Gabriel Batistuta's winner for Fiorentina v Arsenal, Champions League first group
 * stage, Group B, Arsenal 0–1 Fiorentina, Wembley Stadium, London, Wednesday 27 October 1999, 75th minute.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Batistuta a signature, not a match ("the thunderbolt strike", long_range_goal, right
 * foot; lesson "Plant your standing foot beside the ball and strike through it with power"). The Guardian's Golden Goal series picked this
 * goal as his emblematic "screamer" — "a reminder that Batistuta's right boot had a sweet spot the size of Gibraltar" — and David Lacey's
 * match report says he drove the ball "with maximum power into the roof of the net". It is the best-documented single thunderbolt of his
 * career (two written accounts describe it touch by touch). The signature's "centre, long" does not fit this goal (it came from the right,
 * at a narrow angle, inside the box); the film follows the sources, not the template.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/batistuta-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter seconds, so
 * once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/batistuta-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/batistuta-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage; cached in scratchpad/films/src-cache/):
 *  - The Guardian, "Golden Goal: Gabriel Batistuta for Fiorentina v Arsenal (1999)", Rob Smyth, 4 Dec 2015
 *    https://www.theguardian.com/football/blog/2015/dec/04/golden-goal-gabriel-batistuta-for-fiorentina-v-arsenal-1999
 *  - The Guardian, "Batistuta blasts the Gunners out", David Lacey, 28 Oct 1999 (match report with both line-ups)
 *    https://www.theguardian.com/football/1999/oct/28/championsleague.sport
 *  - Wikipedia, "1999–2000 UEFA Champions League first group stage" (match box: date, 20:45 CEST, Wembley, 73,256, referee Ľuboš Micheľ)
 *  - Wikipedia, "1999–2000 AC Fiorentina season" (kit box, squad numbers) and "1999–2000 Arsenal F.C. season" (kit box)
 *  - Wikipedia, "Gabriel Batistuta" (nickname Batigol; "spectacular powerful strikes against Arsenal and Manchester United")
 *  - Wikimedia Commons, Kit_shorts_fio00h.png (Fiorentina's 1999–2000 home shorts are purple)
 * CONFIRMED by those accounts: Wed 27 Oct 1999, Wembley (Arsenal's Champions League home that season), 73,256, a night kick-off; Arsenal and
 *  Fiorentina level on five points, so the winner went through (Guardian: "a win for either side would put them into the last 16"); the
 *  goal in the 75th minute, two minutes after Suker replaced Dixon; the move: Vieira tackled in midfield by Firicano, Jörg Heinrich burst
 *  from midfield to the D and, falling over under pressure, played the ball to Batistuta "lurking near the right corner of the penalty
 *  box"; only one team-mate in support against four Arsenal defenders; "three touches and three seconds later the ball was in the net":
 *  he cushioned it, inviting Nigel Winterburn in, dragged it down the line past him, and "as Winterburn lunged into a desperate block
 *  tackle, Batistuta stretched to scorch a rising drive over David Seaman and into the far corner" / "with maximum power into the roof of
 *  the net from a narrow angle"; Fiorentina's only shot on target; it put Fiorentina through and Arsenal out. Batigol, his right boot, his
 *  long hair, the arms-pumping mini lap of honour as his usual celebration. Arsenal (4-4-2): Seaman; Dixon (Suker 73), Keown, Adams,
 *  Winterburn; Parlour, Vieira, Petit, Overmars; Bergkamp, Kanu. Fiorentina (4-4-2): Toldo; Repka, Firicano, Pierini, Heinrich; Di Livio,
 *  Cois (Adani h-t), Rui Costa, Rossitto; Batistuta, Chiesa. KITS (kit boxes): Arsenal home — red shirt, WHITE sleeves, white shorts, red
 *  socks; Fiorentina home — purple shirt, purple shorts, purple socks. Squad numbers: Batistuta 9, Heinrich 17, Chiesa 20, Rui Costa 10.
 * INFERRED / ILLUSTRATIVE: that Fiorentina wore the purple home kit that night (Arsenal at home in red and white, so no clash — the narration
 *  never names the colour); that the strike was with his RIGHT foot (the Guardian's "right boot" line is about this goal, the laces are
 *  not described); which touches used which foot; every position, run and timing in metres and seconds (the strike drawn ≈ 10.6 m from
 *  the goal line and ≈ 15 m right of centre); Winterburn's lunging leg; the keeper's position (near post) and his late leap; the exact
 *  corner (drawn high into the far top corner); which end of Wembley and the direction of play on screen; Arsenal's numbers other than
 *  Seaman's; Seaman's keeper kit (a neutral dark grey, unknown) and his ponytail; the referee's black; Wembley as drawn (an oval bowl round
 *  the greyhound track, a continuous roof with floodlights along its front edge; the twin towers are left out because we could not place
 *  them); the scoreboard (illustrative, it shows the score); the crowd's colours; the white ball with navy panels; the celebration run.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 the strike): ch1 = the high main-stand broadcast camera, near real time (the stakes on the board, Heinrich's pass, the
 * cushion, the drag past Winterburn, the thunderbolt, 0–1); ch2 = the TV slow-motion replay, low beside him on his kicking side (the plant,
 * eyes down, the swing through); ch3 = the reverse angle from behind the net (the ball comes at us over Seaman, the celebration); ch4 = the
 * lesson on a low front-left camera (standing foot beside the ball, strike through it with power).
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (floodlight, grass with navy, teaching marks), red
 * (Arsenal, skin, the defender's marks), purple (Fiorentina, the night sky with navy), navy (key line, stands, sky).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,keyPoses,runCycle,stand,strike,lunge,backpedal,keeperSet,keeperDive,solve,
 type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',PU='purple';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9']/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`batistuta film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/batistuta-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Winner goes through','Wembley, 1999: Arsenal against Fiorentina, and the winner goes through. Heinrich passes to Batistuta, out on the right. One touch to stop it, one past the defender... boom! A thunderbolt into the roof of the net!',
  ['Wembley','Arsenal','Fiorentina','the winner goes through','Heinrich passes','to Batistuta','out on the right','One touch','to stop it','one past','the defender','boom','A thunderbolt','roof of the net']),
 prov('The thunderbolt','Watch again, slowly. Standing foot beside the ball, eyes down, and his leg swings through with all his power.',
  ['Watch again','slowly','Standing foot','beside the ball','eyes down','his leg swings through','all his power']),
 prov('Batigol','Too fast for David Seaman! Batigol\'s goal sends Fiorentina through.',
  ['Too fast','David Seaman','Batigol\'s goal','sends Fiorentina through']),
 prov('Your turn','Your turn: plant your standing foot beside the ball, and strike through it with power!',
  ['Your turn','plant your standing foot','beside the ball','strike through it','with power']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`batistuta film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Batistuta scores in is at x = 0, the pitch runs to x = −105; +z is his right, the near touchline) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/F)/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpAng=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=14):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
const ring=(x:number,y:number,rx:number,ry:number,n=24):Pt[]=>Array.from({length:n},(_,i)=>[x+Math.cos(i/n*TAU)*rx,y+Math.sin(i/n*TAU)*ry] as Pt);

// ================= Wembley, 27 October 1999, a floodlit night: an oval bowl round the greyhound track under one continuous roof =================
const CX=-52.5,NS=48;
/** a point on the bowl: angle th round the pitch centre, d metres back from the front of the stands (an oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(68+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(47+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
const STAND=(b:number):[number,number]=>[.5+26*b,1.2+15*b];
type Bowl={stand:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];lights:V3[][];track:V3[];trackIn:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={stand:[],back:[],roof:[],fascia:[],lights:[],track:[],trackIn:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[s0,h0]=STAND(0),[s1,h1]=STAND(1);o.stand.push(Q(s0,h0,s1,h1));
  o.back.push(Q(26.5,16,27,24));o.roof.push(Q(10,21.2,30,24.5));o.fascia.push(Q(10,20.2,10,21.3));
  // floodlights along the front edge of the roof, all the way round (inferred)
  if(i%2===0)o.lights.push([rim(a+.02,10.2,20.3),rim(a+.07,10.2,20.3),rim(a+.07,10.2,21.2),rim(a+.02,10.2,21.2)]);
  o.track.push(rim(a,0,0));
  const c=Math.cos(a),s=Math.sin(a);o.trackIn.push([CX+58.5*Math.sign(c)*Math.pow(Math.abs(c),.45),0,38*Math.sign(s)*Math.pow(Math.abs(s),.45)]);
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.14)continue;const[d,y]=STAND((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;score?:[number,number];pop?:number;flare?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flare=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a London night: a heavy navy field with a purple screen over it, paper showing through the halftone
 s.field(K,.82,.6);
 const sky=new Path2D();sky.rect(-s.W*2,-s.H*2,s.W*4,s.H*4);s.tone(PU,sky,.3);
 const st=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D(),li=new Path2D(),glow=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.stand[i],st);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.8);
 s.knockout(st);s.tone(K,st,.42);s.tone(PU,st,.3);
 // the crowd: one mark per group (Arsenal red, white shirts and faces, dark coats; a purple pocket of Fiorentina fans), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<14)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),away=q.P[2]>30&&q.P[0]<CX-40,lift=cheer>0&&away?cheer*z*1.4*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[away?3:q.h<.42?0:q.h<.7?1:2].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.7);s.fill(R,inks[1],.75);s.fill(K,inks[2],.8);s.knockout(inks[3],.6);s.fill(PU,inks[3],.9);}
 // the roof: a dark underside, a pale fascia, the floodlights glowing along it
 s.knockout(roof);s.fill(K,roof,.92);
 s.knockout(fas);s.tone(K,fas,.3);
 for(const L of BOWL.lights){const q=quadP(c,L,24);if(!q)continue;li.addPath(polyPath(q,true));const cx=(q[0][0]+q[2][0])/2,cy=(q[0][1]+q[2][1])/2,w=Math.min(16,Math.max(3,Math.abs(q[1][0]-q[0][0])))*(1+.8*flare)+3;glow.addPath(polyPath(ring(cx,cy,w*.9,w*.55,12),true));}
 s.tone(Y,glow,.3+.4*flare);s.knockout(li);s.fill(Y,li,.8);
 if(o.score)board(s,c,o.score,o.pop??0);
}
/** the scoreboard hung under the roof opposite the main camera (illustrative): Arsenal's goals as red bars on the left, Fiorentina's as purple bars on the right */
const BZ=58,BY=16.5,BH=5,BW=17;
const bc=(x:number,y:number):V3=>[CX+x,BY+y,BZ];
function board(s:Sheet,c:Camera,[a,b]:[number,number],pop:number){
 if(depthOf(c,bc(0,0))<20)return;
 const q=[bc(-BW/2,0),bc(BW/2,0),bc(BW/2,BH),bc(-BW/2,BH)].map(p=>P(c,p)),bd=polyPath(q,true);
 s.knockout(bd);s.fill(K,bd,.95);
 const blk=(x0:number,x1:number)=>polyPath([bc(x0,.5),bc(x1,.5),bc(x1,BH-.5),bc(x0,BH-.5)].map(v=>P(c,v)),true);
 const zero=(x:number)=>polyPath(Array.from({length:14},(_,i)=>{const u=i/14*TAU;return P(c,bc(x+Math.cos(u)*.8,BH/2+Math.sin(u)*1.5));}),true);
 s.fill(R,blk(-8,-4.6),.9);s.fill(PU,blk(4.6,8),.95);
 if(a===0)s.stroke(Y,zero(-1.6),Math.max(2,kAt(c,bc(0,0))*.2),.9);
 if(b===0)s.stroke(Y,zero(1.6),Math.max(2,kAt(c,bc(0,0))*.2),.9);
 else{const g=easeOutBack(clamp(pop));s.knockout(polyPath([bc(1.9,.8),bc(2.8,.8),bc(2.8,.8+(BH-1.6)*g),bc(1.9,.8+(BH-1.6)*g)].map(v=>P(c,v)),true));}
}
/** the pitch: floodlit grass (yellow × navy), mowing stripes, the greyhound track round it, paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const tr=clipPoly(c,BOWL.track);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.tone(K,p,.5);s.tone(R,p,.35);}
 const ti=clipPoly(c,BOWL.trackIn);if(ti.length>2){const p=polyPath(ti,true);s.knockout(p);s.fill(Y,p,.9);s.tone(K,p,.4);}
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-36],[4,0,-36],[4,0,36],[-109,0,36]]));s.knockout(gp);s.fill(Y,gp,.8);s.tone(K,gp,.5);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.12);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a goal on the line x = X, net 2 m deep toward dir: posts, bar, a box net; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.15);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-hit[0])*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.8,p[1]+w*.35,p[2]];};

// ================= the ball: paper white with navy panels =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const pan=new Path2D();for(let k=0;k<4;k++){const a=spin+k*TAU/4+(k%2)*.4,rr=r*(k===0?.2:.62),cx=Math.cos(a)*rr,cy=Math.sin(a)*rr*.9,pr=r*(k===0?.3:.24);pan.addPath(polyPath(Array.from({length:5},(_,i)=>[cx+Math.cos(a+i/5*TAU)*pr,cy+Math.sin(a+i/5*TAU)*pr] as Pt),true));}
 s.fill(K,pan,.85);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (27 October 1999) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[Y,.5],[R,.22]],SKIN_TAN:AthleteStyle['skin']=[[Y,.58],[R,.3]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
/** a kit for this film: athlete.ts has one shirt ink, so Arsenal's white sleeves are printed by the adapter (whiteSleeves) */
type Kit=AthleteStyle&{whiteSleeves?:boolean};
/** Arsenal home: red shirt with white sleeves, white shorts, red socks (kit box, confirmed) */
const ARS=(o:Partial<Kit>={}):Kit=>({shirt:R,shorts:'paper',socks:R,trim:'paper',boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',whiteSleeves:true,...o});
/** Fiorentina home: purple shirt, purple shorts, purple socks (kit box, confirmed; worn that night inferred) */
const FIO=(o:Partial<Kit>={}):Kit=>({shirt:PU,shorts:PU,socks:PU,trim:'paper',boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',...o});
const BATI:Kit=FIO({number:9,hair:[K,.88],hairStyle:'long',build:{height:1.85,bulk:1.06,thighs:1.1},seed:9});
const SEAMAN:Kit={shirt:[K,.55],shorts:[K,.8],socks:[K,.55],boots:K,skin:SKIN_LIGHT,hair:[K,.8],hairStyle:'ponytail',line:K,sleeves:'long',shade:[K,.26],gloves:'paper',number:1,numberInk:'paper',build:{height:1.93,bulk:1.04},seed:1};
const REF:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** Arsenal's white sleeves: a paper knockout over each upper arm, narrowed so the key line survives; an arm printed BEHIND the torso is
 * clipped to outside the torso so the red shirt never gets a hole (from the approved henry-flick-2000 film). ≤ 3 ops per Arsenal figure. */
function whiteSleeves(s:Sheet,r:DrawResult,c:Camera,st:AthleteStyle){
 const sk=r.sk,ppu=pxPer(s),lw=clamp(r.heightPx*.0115,.9,3.6)*(st.lineWeight??1)/ppu,b=st.build?.bulk??1,dC=depthOf(c,sk.chest);
 const front=new Path2D(),back=new Path2D();let nf=0,nb=0;
 for(const sd of['l','r'] as const){const sh=sk[sd==='l'?'lSh':'rSh'],el=sk[sd==='l'?'lEl':'rEl'],a=mix3(sh,el,.1),e=mix3(sh,el,.5),m=mix3(sh,el,.3);
  const pa=P(c,a),pe=P(c,e),w=(.128*b*sk.s*kAt(c,m)-lw*(r.detail==='low'?2.2:1.7))/2;if(w*ppu<.7)continue;
  const dx=pe[0]-pa[0],dy=pe[1]-pa[1],l=Math.hypot(dx,dy);if(l<1e-6)continue;const nx=-dy/l*w,ny=dx/l*w,ang=Math.atan2(dy,dx),q:Pt[]=[[pa[0]+nx,pa[1]+ny]];
  for(let i=0;i<=6;i++){const t=ang+Math.PI/2-i/6*Math.PI;q.push([pe[0]+Math.cos(t)*w,pe[1]+Math.sin(t)*w]);}q.push([pa[0]-nx,pa[1]-ny]);
  if(depthOf(c,m)>dC+.03){back.addPath(polyPath(q,true));nb++;}else{front.addPath(polyPath(q,true));nf++;}}
 if(nf)s.knockout(front);
 if(nb){const J=r.joints,rad=.12*sk.s*kAt(c,sk.chest),pts:Pt[]=[];for(const j of [J.lSh,J.rSh,J.neck,J.chest,J.pelvis,J.lHip,J.rHip])for(let i=0;i<8;i++)pts.push([j[0]+Math.cos(i/8*TAU)*rad,j[1]+Math.sin(i/8*TAU)*rad]);
  const out=new Path2D();out.rect(-1e5,-1e5,2e5,2e5);out.addPath(polyPath(hull2(pts),true));s.save();s.clip(out,'evenodd');s.knockout(back);s.restore();}
}
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 const r=drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
 if(style.whiteSleeves)whiteSleeves(s,r,c,style);
 return r;
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the strike) =================
type TK=[number,number,number];// τ, x, z
type Role='bati'|'fio'|'ars'|'gk'|'ref';
type Actor={name:string;role:Role;style:Kit;keys:TK[];key?:boolean};
/** the pass, the cushion (touch 1), the drag down the line (touch 2); τ = 0 the strike (touch 3): "three touches and three seconds" */
const PASS=-3.2,T1=-2.3,T2=-1.2;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). */
const ACTORS:Actor[]=[
 {name:'Batistuta',role:'bati',style:BATI,key:true,keys:[[-9.6,-21,21],[-6,-19.6,19.6],[-4.2,-18,17.9],[PASS,-17.5,17.3],[T1,-17.1,16.9],[-1.75,-16.8,16.6],[T2,-16.2,16.35],[-.8,-14.6,16],[-.35,-12.6,15.6],[0,-11.35,15.3],[.4,-10.7,15.2],[1.1,-10,15.6],[2.2,-9.6,17.4],[3.6,-9.8,20.2],[5.5,-11,23.5],[8,-13,26]]},
 {name:'Seaman',role:'gk',style:SEAMAN,key:true,keys:[[-9.6,-4.5,.5],[-5,-3.4,1.6],[-3,-2.4,2.4],[-1.2,-1.35,2.75],[0,-1.1,2.8],[8,-1.1,2.8]]},
 {name:'Winterburn',role:'ars',style:ARS({number:3,seed:63,hair:[K,.7]}),key:true,keys:[[-9.6,-15,11.5],[-5,-13.4,13],[PASS,-12.6,14],[T1,-13.6,14.6],[-1.6,-14.5,14.9],[T2,-14.9,15],[-.8,-14.2,14.6],[-.35,-12.9,14.2],[0,-12,14.05],[.5,-11.5,14.1],[2,-11.3,14.3],[8,-11,14.3]]},
 {name:'Heinrich',role:'fio',style:FIO({number:17,seed:17,hair:[K,.55],build:{height:1.86}}),key:true,keys:[[-9.6,-38,5],[-7,-33,4.2],[-5,-27.5,3.2],[PASS,-20.8,2.1],[-2.6,-19.9,1.9],[-2,-19.5,1.8],[8,-19.3,1.8]]},
 {name:'Petit',role:'ars',style:ARS({number:17,seed:71,hair:[K,.35]}),keys:[[-9.6,-30,-3],[-6,-27,-1],[PASS,-22.4,1],[-2,-21.2,1.6],[0,-19.8,3],[8,-17,5]]},
 {name:'Keown',role:'ars',style:ARS({number:5,seed:65,build:{height:1.85,bulk:1.06}}),keys:[[-9.6,-14,5],[-4,-10,7.5],[0,-6.6,6.6],[3,-5.4,5.4],[8,-5,5]]},
 {name:'Adams',role:'ars',style:ARS({number:6,seed:66,build:{height:1.9}}),keys:[[-9.6,-15,-2],[-4,-11,.5],[0,-7.6,1.6],[3,-6.2,1.4],[8,-6,1]]},
 {name:'Parlour',role:'ars',style:ARS({number:15,seed:75}),keys:[[-9.6,-21,-11],[-4,-15,-8],[0,-11.5,-5.4],[3,-9.6,-4],[8,-9,-3]]},
 {name:'Chiesa',role:'fio',style:FIO({number:20,seed:20}),keys:[[-9.6,-27,-7],[-4,-19,-5],[0,-13.2,-2.6],[2,-11.4,1.5],[5,-10.6,10],[8,-11.6,18]]},
 {name:'Vieira',role:'ars',style:ARS({number:4,seed:74,skin:SKIN_DARK,build:{height:1.93,bulk:.96}}),keys:[[-9.6,-40,8],[-4,-30,9],[0,-22,10],[4,-17,11],[8,-15,11]]},
 {name:'Rui Costa',role:'fio',style:FIO({number:10,seed:10,hair:[K,.8]}),keys:[[-9.6,-42,-6],[-4,-36,-5],[0,-30,-3],[8,-22,0]]},
 {name:'Di Livio',role:'fio',style:FIO({number:16,seed:16}),keys:[[-9.6,-46,12],[-4,-40,12],[0,-35,11],[8,-28,11]]},
 {name:'Overmars',role:'ars',style:ARS({number:11,seed:81}),keys:[[-9.6,-40,-20],[0,-33,-16],[8,-30,-12]]},
 {name:'Bergkamp',role:'ars',style:ARS({number:10,seed:80}),keys:[[-9.6,-48,2],[0,-42,4],[8,-38,5]]},
 {name:'Kanu',role:'ars',style:ARS({number:25,seed:85,skin:SKIN_DARK,build:{height:1.97,bulk:.92}}),keys:[[-9.6,-52,-7],[0,-46,-5],[8,-42,-4]]},
 {name:'Rossitto',role:'fio',style:FIO({number:11,seed:11}),keys:[[-9.6,-48,-17],[0,-41,-14],[8,-35,-11]]},
 {name:'Firicano',role:'fio',style:FIO({number:6,seed:6}),keys:[[-9.6,-62,-2],[0,-56,-1],[8,-50,0]]},
 {name:'Repka',role:'fio',style:FIO({number:2,seed:2}),keys:[[-9.6,-63,9],[0,-57,8],[8,-51,8]]},
 {name:'Micheľ',role:'ref',style:REF,keys:[[-9.6,-40,-10],[-4,-32,-9],[0,-25,-8],[4,-20,-6],[8,-18,-5]]},
];
const BAT=0,GKI=1,WIN=2,HEI=3,CHI=8;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-10,TB=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- poses ----
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
/** over(): blend channel overrides (degrees) into a pose */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** a strike-shaped move (a touch or the shot) blended in around its contact time; D = its length in seconds */
function move(p:Pose,tau:number,at:number,D:number,power:number,foot:'l'|'r'='r'):Pose{const u=(tau-at)/D+.52;if(u<-.15||u>1.45)return p;return blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.15,.1,u),1-sm(1.05,1.45,u)));}
// ---- Batistuta: lurking, the cushion, the drag down the line, the thunderbolt (right foot), the arms-pumping run ----
const HIT:V3=[0,2.28,-2.95];// where the ball crosses the line: high into the far corner, the roof of the net (corner inferred)
const SHOT_YAW=YAW(HIT[0]-(-11.35),HIT[2]-15.3);
const P0passer=():[number,number]=>posOf(HEI,PASS);
function yawBat(tau:number){const[x,z]=posOf(BAT,tau),v=velOf(BAT,tau),sp=Math.hypot(v[0],v[1]),[hx,hz]=P0passer();
 const watch=YAW(hx-x,hz-z),down=YAW(1,-.18),run=sp>.6?YAW(v[0],v[1]):down,toGoal=YAW(HIT[0]-x,HIT[2]-z);
 let y=watch;y=lerpAng(y,down,sm(T1+.1,T2-.15,tau));y=lerpAng(y,run,sm(T2,T2+.3,tau));y=lerpAng(y,toGoal,sm(-.75,-.3,tau));y=lerpAng(y,run,sm(.7,1.3,tau));return y;}
function batPose(tau:number):Pose{
 const v=velOf(BAT,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(READY,runCycle(distOf(BAT,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 p=over(p,{neckP:30,lean:14},bump(T1-.6,T1+.4,tau)+bump(-.9,-.05,tau)*.8);// eyes on the ball
 p=move(p,tau,T1,.75,.12);// touch 1: the cushion
 p=move(p,tau,T2,.7,.3);// touch 2: the drag down the line
 const u=tau/1.05+.52;if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 // the stretch: he reaches for it as Winterburn lunges (a longer stride, the body leaning back over the strike)
 p=over(p,{lKnee:44,lean:6,roll:-6},bump(-.35,.25,tau)*.6);
 // his usual celebration: a half-pace run with both fists pumping
 if(tau>1.1){const ph=distOf(BAT,tau)/2.4,pump=Math.sin(ph*TAU*2);p=blendPose(p,over(runCycle(ph,{speed:.45}),{lShA:40,rShA:40,lShF:120+30*pump,rShF:120-30*pump,lElb:110,rElb:110,neckP:-24,lean:0},1),sm(1.1,1.6,tau));}
 return p;}
/** a point on his solved right boot, a touch ahead of the toe, on the grass */
function bootAt(tau:number,ahead=.1):V3{const[x,z]=posOf(BAT,tau),y=yawBat(tau),sk=solve(batPose(tau),BATI.build,{x,z,yaw:y});return[sk.rToe[0]+Math.cos(y)*ahead,.11,sk.rToe[2]-Math.sin(y)*ahead];}
const M:V3=bootAt(0),R1:V3=bootAt(T1,.12),R2:V3=bootAt(T2,.12);

// ---- the ball: Heinrich's run, his pass, the cushion, the drag, the thunderbolt (ballistic, rising), the roof of the net, the drop ----
const G0=9.81,FL=.62,IN_NET=FL,BACKT=FL+.08,BACK:V3=[1.85,2.05,-3],REST:V3=[1.3,.11,-2.5];
const VY=(HIT[1]-M[1]+.5*G0*FL*FL)/FL;
function heiFoot(tau:number):V3{const[x,z]=posOf(HEI,tau),v=velOf(HEI,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(HEI,tau)/1.6,pulse=.12*Math.max(0,Math.sin(ph*TAU));return[x+v[0]/l*(.55+pulse),.11,z+v[1]/l*(.55+pulse)+.1];}
const P0:V3=heiFoot(PASS);
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.4-.4*u));
function ballAt(tau:number):V3{
 if(tau<PASS)return heiFoot(tau);
 if(tau<T1)return roll(P0,R1,(tau-PASS)/(T1-PASS));
 if(tau<T2)return roll(R1,R2,(tau-T1)/(T2-T1));
 if(tau<0)return roll(R2,M,(tau-T2)/-T2);
 if(tau<FL){const s=tau;return[lerp(M[0],HIT[0],s/FL),M[1]+VY*s-.5*G0*s*s,lerp(M[2],HIT[2],s/FL)];}
 if(tau<BACKT)return mix3(HIT,BACK,(tau-FL)/(BACKT-FL));
 const u=clamp((tau-BACKT)/.75),y=u<.55?lerp(BACK[1],.11,(u/.55)*(u/.55)):.11+.3*Math.sin(Math.PI*(u-.55)/.45);return[lerp(BACK[0],REST[0],easeOut(u)),y,lerp(BACK[2],REST[2],u)];
}
/** where the ball hits the net, in the goal's local frame (x = depth) */
const NET_HIT:V3=[2,2.05,-3];

/** Heinrich goes down as he plays the pass under pressure */
const FALL:Pose=posed({lKnee:104,rKnee:92,lHipF:40,rHipF:22,lAnk:40,rAnk:40,pitch:34,lean:36,lShF:70,rShF:62,lShA:24,rShA:30,lElb:20,rElb:28,neckP:-20,lHand:1,rHand:1});
const DIVE_T=.22,DIVE_D=1;
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===BAT)return{p:batPose(tau),yaw:yawBat(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ars'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'r',height:.95});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:-40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===HEI){if(tau>PASS-.5&&tau<PASS+.4)yaw=YAW(R1[0]-x,R1[2]-z);p=move(p,tau,PASS,.9,.5);
  if(tau>PASS+.15){const u=clamp((tau-PASS-.15)/.7);p=blendPose(p,keyPoses(u,[[0,strike(.8,{power:.5})],[.55,posed({lKnee:60,rKnee:40,lHipF:50,rHipF:-10,pitch:22,lean:30,lShF:60,rShF:40,lShA:30,rShA:30,neckP:-10})],[1,FALL]]),sm(0,.2,u));
   if(tau>PASS+2.5)p=blendPose(p,stand(),sm(PASS+2.5,PASS+3.5,tau));}}
 if(k===WIN){if(tau>T2-.6)yaw=lerpAng(yaw,YAW(b[0]-x,b[2]-z),sm(T2-.6,T2-.3,tau)*(1-sm(.5,1,tau)));
  // his move at the cushion (a step in), then the desperate block: full reach as the ball is struck
  const u1=(tau-(T2-.2-.6*.6))/.6;if(u1>0&&u1<1.4)p=blendPose(p,lunge(Math.min(1,u1),{side:'r'}),Math.min(sm(0,.15,u1),1-sm(.9,1.4,u1))*.7);
  const u=(tau-(-.02-.6*.75))/.75;if(u>0)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),sm(0,.12,u)*(1-sm(2,3,tau)));
  if(tau>1.2)p=over(p,{neckP:-10,neckY:40},sm(1.2,1.8,tau));}
 if(tau>IN_NET+.4&&k===CHI)p=blendPose(p,runCycle(distOf(k,tau)/2.4,{speed:.6}),1);
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Batistuta with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:number;only?:number[]}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const ppu=pxPer(s),passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===BAT?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===BAT||!!a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===BAT}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  // the thunderbolt: speed streaks behind the ball in flight
  if(o.trail&&tau>0&&tau<FL+.05){const back=P(c,ballAt(Math.max(0,tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(ring(q[0],q[1],r*1.6,r*1.6,20),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** the ball's flight in the air (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;seed?:number;head?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,seed=81,head=true}=o;if(progress<=.01)return;
 const n=14,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=ballAt(t0+(t1-t0)*i/n),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.6}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.6}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** a screen-space ring round a joint pair (a boot), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,pts=ring(cx,cy,r*1.25,r*.85,26);
 s.knockout(ribbon(pts,Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);
 s.fill(ink,ribbon(pts,Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a drawn figure (head to feet) */
function figureRing(s:Sheet,r:DrawResult|undefined,ink:string,w:number){if(!r||w<=.02)return;const h=r.joints.head,f=r.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.abs(f[1]-h[1])*.7+8;
 s.stroke(ink,polyPath(ring(h[0],cy,ry*.62*w,ry*w,24),true),Math.max(4,ry*.08),.95*w);}
/** the far top corner, lit: a yellow outline round the corner of the goal mouth and a light screen inside */
function cornerLit(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,1.2,-3.66],[0,2.44,-3.66],[0,2.44,-1.4],[0,1.2,-1.4]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.35*w);s.stroke(Y,p,Math.max(5,.08*kAt(c,[0,2,-2.5])),.95*w);}
/** the right toe's arc through the strike (screen points from solved skeletons), for the swing-through mark */
function toeArc(c:Camera,t0:number,t1:number,n=10):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*i/n,[x,z]=posOf(BAT,tau),sk=solve(batPose(tau),BATI.build,{x,z,yaw:yawBat(tau)});if(depthOf(c,sk.rToe)<NEAR+.2)continue;out.push(P(c,sk.rToe));}return out;}
/** the swing of the boot: a red ribbon along the toe's arc with an arrowhead at its end (paper halo so it reads on grass and kit) */
function swingMark(s:Sheet,arc:Pt[],wd:number,w:number,seed:number){const q=arc.slice(0,Math.max(2,Math.round(arc.length*clamp(w*1.3))));
 s.knockout(ribbon(q,wd*1.6,{seed,taper:.3,wobble:.6}),.5*w);s.fill(R,ribbon(q,wd,{seed,taper:.3,wobble:.6}),.95*w);
 if(q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.05,b[1]+(b[1]-a[1])*.05],wd,{seed:seed+1,head:wd*3,cov:.95*w});}}
/** where the left (standing) boot is planted at the strike */
const PLANT:V3=(()=>{const[x,z]=posOf(BAT,0),sk=solve(batPose(0),BATI.build,{x,z,yaw:yawBat(0)});return[sk.lAn[0],.03,sk.lAn[2]];})();

// ================= chapter 1 (live, near real time): the high main-stand camera; the stakes, the pass, the two touches, the thunderbolt, 0–1 =================
const tau1=(t:number)=>{const hp=T(0,'Heinrich passes'),tb=T(0,'to Batistuta'),ot=T(0,'One touch'),op=T(0,'one past'),bm=T(0,'boom'),rn=T(0,'roof of the net'),E=SEC(0);
 return key(t,mono([[0,-9.6],[hp-.2,PASS-.35],[tb+.2,PASS+.55],[ot,T1],[op,T2],[bm,-.02],[rn+.2,IN_NET+.12],[E+1,IN_NET+.12+(E+.8-rn)]]),linear);};
const CAM1:V3=[-26,21,-66];// the main stand on the far side of his run (which side is inferred): the play is across the pitch, the goal to the left
function look1(tau:number):V3{const b=ballAt(tau),[bx,bz]=posOf(BAT,tau);
 if(tau<PASS)return[lerp(b[0],bx,.4),1,lerp(b[2],bz,.4)];
 if(tau<IN_NET){const u=sm(T2,-.3,tau)*.5+sm(-.3,.3,tau)*.25;return[lerp(lerp(b[0],bx,.3),-4,u),1,lerp(lerp(b[2],bz,.3),5,u)];}
 return mix3([-4,1.2,3],[bx,1,bz],sm(IN_NET+.4,IN_NET+2.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const ar=T(0,'Arsenal'),wg=T(0,'the winner goes through'),hp=T(0,'Heinrich passes');
 // wide on the floodlit bowl first, up to the board for the stakes, then down onto the play
 const F=key(t,mono([[0,2600],[ar,3000],[wg+.6,3400],[hp,5000],[T(0,'to Batistuta'),5800],[T(0,'boom'),6300],[T(0,'roof of the net')+.5,6500],[SEC(0),5800]]),easeInOutSine);
 const up=sm(.2,ar-.1,t,easeInOutSine)*(1-sm(wg+.4,hp-.1,t,easeInOutSine)),wide=1-sm(.4,ar,t,easeInOutSine);
 const L:V3=[look[0]+(CX+10-look[0])*.4*wide,look[1]+4*wide,look[2]+(20-look[2])*.4*wide];
 return cam(CAM1,[L[0]+(CX+2-L[0])*up*.9,L[1]+(BY-6-L[1])*up*.8,L[2]+(BZ-L[2])*up*.75],F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,wb=T(0,'Wembley'),ar=T(0,'Arsenal'),fi=T(0,'Fiorentina'),wg=T(0,'the winner goes through'),hp=T(0,'Heinrich passes'),tb=T(0,'to Batistuta'),or=T(0,'out on the right'),ot=T(0,'One touch'),op=T(0,'one past'),de=T(0,'the defender'),bm=T(0,'boom'),th=T(0,'A thunderbolt'),rn=T(0,'roof of the net');frame(s);
  stadium(s,c,{t,cheer:.9*sm(0,.5,goalIn),score:[0,goalIn>.1?1:0],pop:clamp((goalIn-.1)/.35),flare:sm(wb-.1,wb+.3,t)*(1-sm(wb+1.2,wb+1.8,t))});
  // the stakes on the board: Arsenal's half, Fiorentina's half, then the whole board ("the winner goes through")
  const kb=kAt(c,bc(0,0)),blink=(at:number)=>sm(at-.1,at+.2,t)*(1-sm(at+1,at+1.4,t));
  for(const[at,x0] of[[ar,-6.3],[fi,6.3]] as[number,number][]){const w=blink(at);if(w<=.02||depthOf(c,bc(0,0))<20)continue;const q=P(c,bc(x0,BH/2));s.stroke(Y,polyPath(ring(q[0],q[1],kb*3.4,kb*2.6),true),Math.max(4,kb*.45),.95*w);}
  const wgw=blink(wg);if(wgw>.02&&depthOf(c,bc(0,0))>20){const q=P(c,bc(0,BH/2));s.stroke(Y,polyPath(ring(q[0],q[1],kb*8.6*easeOutBack(clamp(wgw*1.4)),kb*3.4),true),Math.max(4,kb*.5),.95*wgw);}
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "out on the right": the right corner of the penalty box lit on the grass
  groundRing(s,c,-16.5,20.16,2.2,2.2,.3,Y,.9*sm(or-.1,or+.3,t,easeOutBack)*(1-sm(or+1.1,or+1.5,t)),131);
  // "Heinrich passes": the pass line on the grass, drawn as the ball rolls
  const pw=sm(hp-.1,tb+.5,t,easeOut)*(1-sm(ot,ot+.5,t));
  groundTrail(s,c,Array.from({length:13},(_,i)=>{const b=ballAt(PASS+(T1-PASS)*i/12);return[b[0],b[2]] as [number,number];}),.35,Y,{progress:pw,dashed:true,head:true,cov:.9,seed:91});
  // "one touch past": the drag down the line
  const dw=sm(op-.1,op+.6,t,easeOut)*(1-sm(bm,bm+.4,t));
  groundTrail(s,c,Array.from({length:10},(_,i)=>{const b=ballAt(T2+(0-T2)*i/9);return[b[0],b[2]] as [number,number];}),.3,Y,{progress:dw,head:true,cov:.9,seed:93});
  const w=drawWorld(s,c,tau,tp,{ballMin:7,trail:1});
  // "to Batistuta": a ring round him; "the defender": a red ring round Winterburn
  figureRing(s,w.res.get(BAT),Y,sm(tb-.15,tb+.25,t,easeOutBack)*(1-sm(tb+1.3,tb+1.8,t)));
  figureRing(s,w.res.get(WIN),R,sm(de-.15,de+.25,t,easeOutBack)*(1-sm(bm,bm+.4,t)));
  // "One touch": a small spark ring where the ball dies at his foot
  const tw=sm(ot-.1,ot+.2,t)*(1-sm(ot+.7,ot+1,t));if(tw>.02){const q=P(c,R1),r=Math.max(9,kAt(c,R1)*.5);s.stroke(Y,polyPath(ring(q[0],q[1],r*1.4*easeOutBack(clamp(tw)),r),true),Math.max(3,r*.18),.95*tw);}
  // "boom": a spark at the boot; "A thunderbolt": the ball's line to the far corner; "roof of the net": the corner lit
  if(tau>-.02&&tau<.35){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*2.4,{n:9,seed:95,g:easeOutBack(clamp(tau/.08))*(1-clamp((tau-.2)/.15)),width:8});}
  airTrail(s,c,0,FL,Y,{progress:sm(th-.2,th+.4,t,easeOut),cov:.9*(1-sm(rn+.8,rn+1.3,t)),wm:.16,seed:97,head:false});
  cornerLit(s,c,sm(rn-.1,rn+.3,t)*(1-sm(SEC(0)-.6,SEC(0)-.2,t)));},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:11,
};

// ================= chapter 2 (TV replay, slow motion, low beside him on his kicking side): the plant, eyes down, the swing through =================
const FWD:[number,number]=[Math.cos(SHOT_YAW),-Math.sin(SHOT_YAW)],RGT:[number,number]=[-FWD[1],FWD[0]];// his facing at the strike and his right
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,-1.7],[T(1,'Standing foot'),-.5],[T(1,'beside the ball')+.3,-.26],[T(1,'eyes down')+.2,-.1],[T(1,'his leg swings through')+.2,0],[T(1,'all his power')+.3,.24],[E,.5]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(BAT,clamp(tau,-1.8,.25)),push=sm(T(1,'Standing foot')-.4,T(1,'eyes down'),t,easeInOutSine),orbit=sm(T(1,'his leg swings through')-.2,E,t,easeInOutSine);
 const look:V3=[x+FWD[0]*lerp(.5,4,orbit)+RGT[0]*.1,lerp(.7,1,orbit),z+FWD[1]*lerp(.5,4,orbit)+RGT[1]*.1];
 const dR=lerp(6.4,5,push)+1.5*orbit,dB=lerp(1.6,.6,push)+1.2*orbit;
 return cam([x+RGT[0]*dR-FWD[0]*dB,1.05+.25*orbit,z+RGT[1]*dR-FWD[1]*dB],look,key(t,mono([[0,2000],[T(1,'eyes down'),2500],[E,1900]])));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),sf=T(1,'Standing foot'),pb=T(1,'beside the ball'),ed=T(1,'eyes down'),ls=T(1,'his leg swings through'),ap=T(1,'all his power');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "plants beside the ball": a yellow ring on the grass round the ball and the plant spot
  groundRing(s,c,(PLANT[0]+M[0])/2,(PLANT[2]+M[2])/2,.62,.62,.05,Y,.95*sm(pb-.1,pb+.3,t,easeOutBack)*(1-sm(ls,ls+.4,t)),133);
  // "all his power": the rising line to the far corner
  airTrail(s,c,0,FL,Y,{progress:sm(ap-.2,ap+.6,t,easeOut),cov:.95*(1-sm(E-.6,E-.25,t)),wm:.09,seed:99});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(ls-.1,ls+.2,t)*(1-sm(ls+.9,ls+1.3,t)),trail:1,only:[BAT,WIN,GKI,CHI,5,6]});
  const hero=w.res.get(BAT);
  if(hero){
   // "His standing foot": a red ring round the planted left boot
   bootRing(s,hero.joints.lToe,hero.joints.lHeel,R,sm(sf-.1,sf+.3,t,easeOutBack)*(1-sm(ls+.1,ls+.5,t)),101);
   // "eyes down": a dashed sight line from his eyes to the ball
   const ew=sm(ed-.1,ed+.4,t,easeOut)*(1-sm(ls+.3,ls+.7,t));if(ew>.02&&depthOf(c,w.ball)>NEAR){const bq=P(c,w.ball);laneArrow(s,Y,hero.joints.face,bq,Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:ew,seed:103,head:10,cov:.95});}
   // "his leg swings through": the arc of the right boot through the ball
   const fw=sm(ls-.1,ls+.7,t,easeOut)*(1-sm(E-.6,E-.2,t));if(fw>.02){const arc=toeArc(c,-.06,Math.min(.3,tau));if(arc.length>2){const wd=Math.max(5,kAt(c,M)*.05);swingMark(s,arc,wd,fw,105);}}}
  // "all his power": sparks where the boot meets the ball
  if(tp>-.03&&tp<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*1,{n:10,seed:107,g:easeOutBack(clamp((tp+.03)/.08))*(1-clamp((tp-.12)/.13)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:109,len:900,spread:520,width:22,cov:.5*(1-t/.5)});},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse angle from behind the net): the ball comes at us over Seaman; Batigol's run =================
const tau3=(t:number)=>{const E=SEC(2),tf=T(2,'Too fast'),ds=T(2,'David Seaman'),bg=T(2,'Batigol\'s goal');
 return key(t,mono([[0,-.45],[tf+.25,.1],[ds+.3,IN_NET+.05],[bg,IN_NET+1.1],[E,IN_NET+1.1+(E-bg)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(BAT,tau),cel=sm(IN_NET+.3,IN_NET+1.6,tau,easeInOutSine);
 const look=mix3([-7,1.4,7.5],[x+1,1.3,z],cel);
 return cam([lerp(4.4,3.2,cel),lerp(1.75,2.2,cel),lerp(-4.9,-2.6,cel)],look,key(t,mono([[0,1450],[T(2,'David Seaman'),1600],[T(2,'Batigol\'s goal'),3200],[E,4000]]),easeInOutSine));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_NET,E=SEC(2),tf=T(2,'Too fast'),tk=T(2,'Too fast')+.35,ds=T(2,'David Seaman'),bg=T(2,'Batigol\'s goal'),sf=T(2,'sends Fiorentina through');frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),flare:.4*sm(sf-.1,sf+.3,t)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Too fast": the ball's line comes at us; "the keeper": a red ring on the grass where Seaman stands
  airTrail(s,c,0,Math.min(FL,Math.max(.01,tau)),Y,{progress:sm(tf-.2,tf+.2,t),cov:.9*(1-sm(bg,bg+.4,t)),wm:.08,seed:111,head:false});
  const[kx,kz]=posOf(GKI,tau);groundRing(s,c,kx,kz,1.1,1.1,.07,R,.95*sm(tk-.1,tk+.3,t,easeOutBack)*(1-sm(tk+1.1,tk+1.5,t)),113);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  // "David Seaman": the gap between his glove and the ball
  const gk=w.res.get(GKI),dw=sm(ds-.1,ds+.3,t)*(1-sm(ds+1.2,ds+1.6,t));
  if(gk&&dw>.02&&depthOf(c,w.ball)>NEAR){const q=P(c,w.ball),hnd=gk.joints.rHa;laneArrow(s,R,hnd,[lerp(hnd[0],q[0],.8),lerp(hnd[1],q[1],.8)],Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:dw,seed:115,head:12,cov:.95});}
  // "Batigol's goal": a ring round him on his run
  figureRing(s,w.res.get(BAT),Y,sm(bg-.15,bg+.25,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  // "sends Fiorentina through": purple flashes of the travelling fans' flags
  const fw=sm(sf-.1,sf+.4,t)*(1-sm(E-.45,E-.15,t));if(fw>.02){const r=rng(500+Math.floor(tt*12)),fp=new Path2D();for(let i=0;i<9;i++){const x=(r()-.5)*s.W*.9,y=-s.H*.2-r()*s.H*.28,z=9+r()*12;fp.addPath(polyPath([[x,y-z],[x+z*.32,y],[x,y+z],[x-z*.32,y]],true));}s.knockout(fp,fw);s.fill(PU,fp,.95*fw);}
  cornerLit(s,c,sm(tf,tf+.3,t)*(1-sm(ds+.6,ds+1,t))*.5);
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:117,len:900,spread:520,width:22,cov:.5*(1-t/.45)});},
 aperture(t){const c=cam3(t),[x,z]=posOf(BAT,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a low front-left camera): plant the standing foot beside the ball, strike through it with power =================
const tau4=(t:number)=>{const E=SEC(3),pf=T(3,'plant your standing foot'),bb=T(3,'beside the ball'),st=T(3,'strike through it'),wp=T(3,'with power');
 return key(t,mono([[0,-1.3],[pf,-.5],[bb+.3,-.05],[st,-.015],[st+.5,.08],[wp+.3,.36],[E,.6]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[x,z]=posOf(BAT,clamp(tau,-1.3,.15)),push=sm(T(3,'plant your standing foot')-.3,T(3,'beside the ball')+.3,t,easeInOutSine),follow=sm(T(3,'strike through it')-.1,E-.4,t,easeInOutSine);
 // in front of him and to his left: the planted left boot is nearest us, the ball just beyond it, the goal off to the left of frame
 const dF=lerp(4.6,3.4,push)+2.2*follow,dL=lerp(4.4,3.2,push)+1.2*follow;
 const look:V3=[x+FWD[0]*(.45+2*follow)-RGT[0]*.2,lerp(.45,.9,follow),z+FWD[1]*(.45+2*follow)-RGT[1]*.2];
 return cam([x+FWD[0]*dF-RGT[0]*dL,lerp(.9,.8,push)+.5*follow,z+FWD[1]*dF-RGT[1]*dL],look,2000+400*push-700*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),pf=T(3,'plant your standing foot'),bb=T(3,'beside the ball'),st=T(3,'strike through it'),wp=T(3,'with power');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  // "beside the ball": a ring on the grass round the plant spot and the ball together
  groundRing(s,c,(PLANT[0]+M[0])/2,(PLANT[2]+M[2])/2,.6,.6,.05,Y,.95*sm(bb-.1,bb+.3,t,easeOutBack)*(1-sm(st+.2,st+.6,t)),119);
  // "with power": the rising line to the far corner and the corner lit
  const gw=sm(wp-.2,wp+.5,t,easeOut)*(1-sm(E-.5,E-.15,t));
  if(gw>.02){const a=P(c,[M[0],.3,M[2]]),b=P(c,[M[0]+FWD[0]*2.4,1.1,M[2]+FWD[1]*2.4]),wd=Math.max(7,kAt(c,M)*.07);s.knockout(ribbon([a,b],wd*1.7,{seed:121,taper:.1}),.7*gw);laneArrow(s,R,a,b,wd,{seed:121,head:wd*3.2,cov:.95,progress:gw});}
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1,only:[BAT]});
  const hero=w.res.get(BAT);
  if(hero){
   // "plant your standing foot": the left boot ringed red as it lands
   bootRing(s,hero.joints.lToe,hero.joints.lHeel,R,sm(pf-.1,pf+.35,t,easeOutBack)*(1-sm(st+.2,st+.6,t)),123);
   // "strike through it": the boot's arc through the ball
   const fw=sm(st-.1,st+.6,t,easeOut)*(1-sm(E-.5,E-.15,t));if(fw>.02){const arc=toeArc(c,-.06,Math.min(.3,tau));if(arc.length>2){const wd=Math.max(6,kAt(c,M)*.05);swingMark(s,arc,wd,fw,125);}}}
  if(tp>-.03&&tp<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*.9,{n:10,seed:127,g:easeOutBack(clamp((tp+.03)/.08))*(1-clamp((tp-.12)/.13)),width:9});}},
 still:4,
};

const story:RisoStory={
 id:'batistuta-signature',format:'11v11',title:'Batistuta\'s thunderbolt, 1999',
 theme:'Shooting with power: plant your standing foot beside the ball and strike through it.',
 ageNote:'Champions League group stage, Arsenal 0–1 Fiorentina, Wembley, London, 27 October 1999. Batistuta (30) scored the only goal, 75th minute.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',purple:'#765ba7',navy:'#22366b'},order:['yellow','red','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a floodlight flash and the white ball thunders up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(ring(x,y,110*g,34*g,20),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
