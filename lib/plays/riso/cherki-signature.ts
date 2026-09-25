/** Iconic-play film (signature): "the two-footed playmaker". Rayan Cherki's senior France debut: Spain 5–4 France, UEFA Nations League
 * Finals semi-final, MHPArena, Stuttgart, Thursday 5 June 2025 (21:00 CEST, floodlit). Cherki came on at 64' with France 1–4 down (Spain soon
 * made it 5–1), scored a volley on 79' (5–2) and crossed for Randal Kolo Muani's header in stoppage time (5–4). Spain still won 5–4.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Cherki a signature, not a match ("Signature: the two-footed playmaker", through_ball_assist,
 * centre; lesson "Practise with both feet so defenders can't guess which way you will go"). His debut is the best-documented half hour of
 * his play in writing: a goal AND an assist, and the goal won the Nations League Finals Goal of the Tournament (Wikipedia). NOTE: the brief
 * suggested "his France debut v Ukraine (Sep 2025)"; the sources say his debut was this match v Spain, so that is the one used.
 * HONESTY NOTE: both documented actions were LEFT-footed (the volley and the cross). No written source fetched says which foot is his
 * stronger one, so the film never claims it. "Both feet" is shown only in chapter 4, a clearly separate "your turn" DEMONSTRATION on a
 * training pitch (bibs, no crowd, no named players). No invented play is staged inside the real match.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/cherki-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter seconds,
 * so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/cherki-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/cherki-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read 24 Sep 2026 with curl, generic UA; cached under the session scratchpad films/src-cache/; written accounts and one photo, the
 * footage was not reviewed):
 *  - The Guardian live blog, "Spain v France: Nations League semi-final – live", 5 Jun 2025
 *    https://www.theguardian.com/football/live/2025/jun/05/spain-v-france-nations-league-semi-final-live  (guardian-esp-fra-2025-live.txt):
 *    "GOAL! Spain 5-2 France (Cherki 79) ... a fantastic volley ... Mbappe played a simple pass to him on the edge of the D; he stunned the ball
 *    up in the air and lashed a volley that beat Simon for pace"; "80 min I've just realised this is Cherki's first game for France";
 *    "GOAL! Spain 5-4 France (Kolo Muani 90+4) ... Cherki ... teases a gorgeous cross from the right edge of the area and Kolo Muani scores
 *    with a downward header from five yards"; 64' Cherki, Gusto and Barcola on; 76' Kolo Muani on for Dembélé; 77' Vivian and Samu on.
 *  - The Guardian match report, Sid Lowe, "Lamine Yamal dazzles as Spain win goal-fest with France to set up Portugal final", 5 Jun 2025
 *    https://www.theguardian.com/football/2025/jun/05/lamine-yamal-spain-goal-fest-france-portugal-final  (guardian-esp-fra-2025-report.txt):
 *    "Down 5-1 after 67 minutes, a belter from Rayan Cherki, an own goal from Dani Vivian and a Randal Kolo Muani header on 79, 84, and 93
 *    minutes"; Stuttgart; photo caption "Rayan Cherki crashes home a brilliant volley to make it 5-2".
 *  - Photograph (Angelika Warmuth/Reuters) on the live blog, the volley at the moment of the strike, from behind him (guardian-cherki-esp-volley.jpg):
 *    France in WHITE shirts, white shorts and white socks with blue numbers, Cherki No. 25; Spain in RED shirts with yellow numbers, NAVY
 *    shorts and red socks; Cherki inside the D at its edge, the ball at knee height; around him Spain's 6 (Merino), 8 (Fabián Ruiz), 18
 *    (Zubimendi), 24 (Cucurella), 10 (Olmo), 12 (Porro), 5; France's 12 and one more white shirt ahead. Floodlit.
 *  - Wikipedia, "Rayan Cherki" (raw): debut 5 June 2025, "scoring and assisting in a 5–4 loss against Spain" in the Nations League
 *    semi-finals; MHPArena, Stuttgart; the Nations League Finals Goal of the Tournament. (wiki-rayan-cherki.txt)
 *  - Search-result summaries (DuckDuckGo, ddg-cherki-two-footed.html), used only for the FOOT and the cut inside: "he scored a stunning
 *    left-footed volley from outside the penalty area, set up a goal for fellow substitute Randal Kolo Muani with a perfectly-placed inswinging
 *    cross"; "scored with a left-footed half-volley and crossed for Kolo Muani's late header"; "cutting onto his left and delivering a teasing
 *    cross for Randal Kolo Muani to head home"; one page adds he "dribbled past Marc Cucurella and crossed into the small area".
 * CONFIRMED: the match, date, city and stadium, night, debut, 1–4 → 5–1 → 5–2 → 5–4 and the Spain win; Mbappé's simple pass to Cherki on the
 *  edge of the D; the ball stunned up into the air, then a LEFT-foot volley that beat Simón for pace (79'); the kits (photo); Cherki No. 25;
 *  who was round him at the volley (photo numbers); in stoppage time, Cherki on the RIGHT edge of the area cut onto his LEFT foot and hit an
 *  inswinging cross; Kolo Muani's downward header from five yards.
 * INFERRED (illustrative; never narrated): every position, path and timing in metres and seconds; which foot stunned the ball up (drawn:
 *  his right); where the volley went in (drawn: to Simón's left, about head high); Mbappé's passing foot (drawn: right); the second Spain
 *  player beside Cucurella and all the other off-photo positions; Cucurella being the man he beat for the cross (one summary only: drawn,
 *  not named); the cross's height and curl; where the header went in (drawn: low, to Simón's right); Simón's keeper colours (drawn yellow);
 *  squad numbers other than 25 and the photo's (Mbappé 10, Kolo Muani 12 from the photo's France 12; Barcola and Gusto without numbers);
 *  which end France attacked (drawn: screen-right from the main camera, so France's right wing is the near touchline); the crowd colours; the
 *  stadium as drawn (a two-tier bowl, a pale membrane roof with the floodlights along its front edge); every camera.
 *  Chapter 4 (a feint one way with the right foot, then away with the left past a defender) is a DEMONSTRATION on a training pitch, not match footage.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): each real play is ONE simulation on its own
 * clock τ: ch1 = the high main-stand broadcast camera, near real time (the stadium at night, Mbappé's pass, the ball popped up, the volley,
 * 5–2); ch2 = the TV slow-motion replay from behind him, high on his left (the photo's angle): the touch that lifts it, the left foot;
 * ch3 = the stoppage-time assist from a lower main-stand camera (out on the right, cut onto the left, the curling cross, the header);
 * ch4 = the lesson, a training-pitch demonstration of using both feet to beat a defender.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Handedness: the world is right-handed like athlete.ts (x toward Spain's
 * goal at x = 0, y up, the main-stand camera at +z), so a figure attacking +x has its right side at +z and a LEFT boot strikes with no mirrored
 * projector; Simón faces −x, so his left is +z. Inks: yellow (grass with blue, teaching marks, floodlights), red (Spain, skin, arrows), blue
 * (grass, France's numbers, crowd), navy (key line, night sky, roof). Scenes read only their local t; figures pose on twos, cameras on ones;
 * all randomness is seeded. Heat: ≈ the foden film's budget (one crowd pass of four batched plates, small figures at 'low'). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,volley,header,lunge,backpedal,celebrate,keeperSet,keeperDive,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`cherki film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/cherki-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('First game for France','Stuttgart. Rayan Cherki\'s first game for France, in white. Mbappé passes to him on the edge of the box. He pops it up and smashes a volley. Goal!',
  ['Stuttgart','Rayan Cherki','first game','in white','Mbappé passes','edge of the box','pops it up','smashes a volley','Goal']),
 prov('Pop and volley','Watch again. One touch lifts the ball up. Then a volley with his left foot, too fast for the keeper.',
  ['Watch again','One touch','lifts the ball','Then a volley','left foot','too fast','the keeper']),
 prov('The cross','Near the end, he is out on the right. He cuts inside onto his left foot and curls a cross. Kolo Muani heads it in!',
  ['Near the end','out on the right','cuts inside','his left foot','curls a cross','Kolo Muani','heads it in']),
 prov('Your turn','Your turn: practise with both feet, so defenders can\'t guess which way you will go!',
  ['Your turn','practise with','both feet','so defenders','guess','which way','will go']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cherki film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Spain's goal is at x = 0, the pitch runs to x = −105;
// the main-stand camera sits at +z, so France attack left → right on screen) =================
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
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= the MHPArena, Stuttgart, on a June night: a two-tier bowl under a pale membrane roof, floodlights along its front edge =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(61+d)*Math.sign(c)*Math.pow(Math.abs(c),.3),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.3)];}
const LOW=(b:number):[number,number]=>[1.5+15*b,1.2+8.5*b],UPT=(b:number):[number,number]=>[19+14*b,12+11*b];
type Bowl={low:V3[][];up:V3[][];boxes:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],boxes:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1),[u0,g0]=UPT(0),[u1,g1]=UPT(1);o.low.push(Q(l0,h0,l1,h1));o.up.push(Q(u0,g0,u1,g1));o.boxes.push(Q(l1,h1,u0,g0));
  o.roof.push(Q(8,27,36,29.5));o.fascia.push(Q(8,25.8,8,27.1));
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.1)continue;const[d,y]=LOW((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}
  for(let r=0;r<6;r++)for(let k=0;k<3;k++){const h=hash(i*733+r*37+k*11,31);if(h<.12)continue;const[d,y]=UPT((r+.5)/6);o.seats.push({P:rim((i+(k+.5+(hash(i+r*17+k,6)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** floodlight lamps: a row along the roof's front edge */
const LAMPS:V3[]=Array.from({length:40},(_,i)=>rim((i+.5)/40*TAU,8.5,25.4));
type Crowd={t:number;cheer?:number;flash?:number;lamps?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0,lamps=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a June night: deep navy over the paper, a faint floodlit haze low over the bowl
 s.field(K,.86,.5);
 const hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(Y,polyPath([[-Bnd,hz-700],[Bnd,hz-700],[Bnd,hz+80],[-Bnd,hz+80]],true),.12);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.up[i],up);ad(BOWL.boxes[i],box);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(up);s.tone(K,up,.55);s.tone(B,up,.24);
 s.knockout(box);s.fill(K,box,.9);
 s.knockout(low);s.tone(K,low,.55);s.tone(B,low,.24);
 // the crowd: Spain red and yellow, France blue and white, dark coats; bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0&&q.h>.62?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.4?0:q.h<.62?2:q.h<.82?3:1].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.fill(R,inks[0],.9);s.fill(K,inks[2],.8);s.fill(B,inks[3],.9);s.knockout(inks[1],.85);}
 // the membrane roof: dark underside, its pale front edge lit by the floodlights
 s.knockout(roof);s.fill(K,roof,.95);
 s.knockout(fas,.85);s.tone(Y,fas,.2);
 // floodlights along the roof edge, with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const m of LAMPS){if(depthOf(c,m)<NEAR+14)continue;const g=P(c,m);if(!inV(g))continue;const k=kAt(c,m),r=clamp(k*(3.2+2*lamps),6,140),w=clamp(k*1.1,3,40);
  lamp.addPath(polyPath([[g[0]-w,g[1]-w*.4],[g[0]+w,g[1]-w*.4],[g[0]+w,g[1]+w*.4],[g[0]-w,g[1]+w*.4]],true));halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}
 s.knockout(halo,.2+.2*lamps);s.tone(Y,halo,.4+.25*lamps);s.knockout(lamp);s.fill(Y,lamp,.8);
 // phone flashes round the ground after the goal
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n){s.knockout(fp);s.fill(Y,fp,.5);}}
}
/** the pitch: a floodlit grass apron with LED boards, the striped grass (yellow × blue), paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;boards?:boolean}={}){
 const ap=new Path2D();addPoly(ap,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(ap);s.fill(Y,ap,.7);s.tone(B,ap,.7);s.tone(K,ap,.25);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-37],[4,0,-37],[4,0,37],[-109,0,37]]));s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 // LED advertising boards round the pitch (plain navy panels with a lit yellow band; no brands)
 if(o.boards!==false){const bd=new Path2D(),band=new Path2D(),seg=(a:[number,number],b:[number,number])=>{const q=quadP(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.9,b[1]],[a[0],.9,a[1]]],6);if(q)bd.addPath(polyPath(q,true));const r=quadP(c,[[a[0],.35,a[1]],[b[0],.35,b[1]],[b[0],.6,b[1]],[a[0],.6,a[1]]],6);if(r)band.addPath(polyPath(r,true));};
  for(let x=-104;x<0;x+=8){seg([x,-38],[x+8,-38]);seg([x,38],[x+8,38]);}for(let z=-30;z<30;z+=8){if(Math.abs(z+4)<6)continue;seg([5,z],[5,z+8]);seg([-110,z],[-110,z+8]);}
  s.knockout(bd);s.fill(K,bd,.85);s.knockout(band,.8);s.fill(Y,band,.6);}
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a modern goal on the line x = X, net 2 m deep toward dir: round posts, a box net; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.05);bar([Dp,0,W],[Dp,H,W],.05);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** the lesson's training pitch (no stands, no crowd): a daytime sky, a tree line behind the goal and down both sides */
function trainingGround(s:Sheet,c:Camera){
 s.field(B,.12,.5);
 const Bnd=Math.max(s.W,s.H)*1.5,hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-460],[-Bnd,hz-420]],true),.2);
 const trees=new Path2D(),row=(a:[number,number],b:[number,number],n:number,seed:number)=>{const top:V3[]=[],base:V3[]=[];for(let i=0;i<=n;i++){const u=i/n,x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),h=8+5*hash(i,seed)+2*Math.sin(i*1.7+seed);top.push([x,h,z]);base.push([x,0,z]);}
  const q=clipPoly(c,[...base,...top.reverse()]);addPoly(trees,q);};
 row([30,-70],[30,70],28,3);row([-120,-48],[30,-48],30,5);row([-120,48],[30,48],30,7);
 s.knockout(trees);s.fill(K,trees,.5);s.tone(B,trees,.45);s.tone(Y,trees,.25);
}

// ================= the ball (white with blue and navy panel marks) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(B,seams,Math.max(1.6,r*.12),.85);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}),.9);
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (5 June 2025, from the Reuters photo) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_M:AthleteStyle['skin']=[[R,.28],[Y,.55],[K,.06]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.34]];
/** France (confirmed by the photo): white shirts, white shorts, white socks, blue numbers and trim */
const FRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[B,.9],skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],number:null,numberInk:[B,.95],...o});
/** Spain (confirmed by the photo): red shirts with yellow numbers, navy shorts, red socks */
const ESP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[K,.9],socks:[R,.95],boots:K,trim:[Y,.9],skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.45],number:null,numberInk:[Y,.95],...o});
/** Cherki: No. 25, about 1.77 m, dark curly hair, card skin tone 2 */
const CHERKI:AthleteStyle=FRA({number:25,hairStyle:'curly',hair:[K,.85],skin:SKIN_M,build:{height:1.77,bulk:.97},seed:25});
/** Simón's keeper colours that night are NOT confirmed: drawn yellow */
const SIMON:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.3],number:null,build:{height:1.9},seed:23};
/** the lesson demonstration (not the match): a player in a yellow training bib, a defender in a red bib */
const TRAIN:AthleteStyle={shirt:[Y,.95],shorts:K,socks:'paper',boots:K,trim:K,skin:SKIN_M,hair:[K,.85],hairStyle:'curly',line:K,shade:[K,.26],number:null,build:{height:1.77,bulk:.97},seed:25};
const TRAIN_D:AthleteStyle={shirt:[R,.9],shorts:K,socks:[R,.9],boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.4],number:null,build:{height:1.83},seed:61};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the plays: each ONE simulation on its own τ (seconds) =================
type TK=[number,number,number];// τ, x, z
type Role='ch'|'fra'|'esp'|'gk';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
type Play={A:Actor[];TA:number;tab:{X:number[];Z:number[];D:number[]}[]};
const DT=.02;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
function mkPlay(A:Actor[],TA:number,TB:number):Play{return{A,TA,tab:A.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};})};}
const samp=(pl:Play,arr:number[],tau:number)=>{const u=clamp((tau-pl.TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(pl:Play,k:number,tau:number):[number,number]=>[samp(pl,pl.tab[k].X,tau),samp(pl,pl.tab[k].Z,tau)];
const distOf=(pl:Play,k:number,tau:number)=>samp(pl,pl.tab[k].D,tau);
const velOf=(pl:Play,k:number,tau:number):[number,number]=>{const a=posOf(pl,k,tau-.1),b=posOf(pl,k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
function bootOf(pl:Play,k:number,tau:number,ahead=.5):V3{const[x,z]=posOf(pl,k,tau),v=velOf(pl,k,tau),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
/** over(): blend channel overrides (degrees) into a pose */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** locomotion for anyone: stand / jog / sprint, or a backpedal when moving backwards */
function locomote(pl:Play,k:number,tau:number,yaw:number,idle:Pose):Pose{const v=velOf(pl,k,tau),sp=Math.hypot(v[0],v[1]),along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)return blendPose(idle,backpedal(distOf(pl,k,tau)/1.25),clamp((sp-.5)/.8));
 const s=clamp((sp-2.2)/5.5);return blendPose(idle,runCycle(distOf(pl,k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
/** a pass / cross: the strike blended in round its contact time */
function passAt(p:Pose,tau:number,at:number,power:number,foot:'l'|'r',D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
const G0=9.81;

// ---------------- PLAY A: the volley (79'). τ = 0: the touch that pops the ball up; VOL: the left-foot volley ----------------
const PASS_A=-.9,VOL=.62,VD=.9,V_ST=VOL-.5*VD,FL_A=.7,IN_A=VOL+FL_A,BACK_A=IN_A+.08;
const HIT_A:V3=[0,1.45,2.2];// where it went in: INFERRED (to Simón's left, about head high)
const PA=mkPlay([
 {name:'Cherki',role:'ch',style:CHERKI,key:true,keys:[[-6,-24.6,1.8],[-3,-22.8,.3],[-1.2,-21.2,-.3],[-.4,-20.8,-.45],[0,-20.6,-.5],[VOL,-20.35,-.5],[1.2,-20,-.2],[2,-18.6,1.2],[3.2,-15.6,4.4],[4.6,-12,8.4],[6,-9,11.5]]},
 {name:'Simón',role:'gk',style:SIMON,key:true,keys:[[-6,-1.4,-.8],[-1,-1.5,-.4],[0,-1.5,-.3],[6,-1.5,-.3]]},
 {name:'Mbappé',role:'fra',style:FRA({number:10,skin:SKIN_D,hair:[K,.9],build:{height:1.78},seed:10}),key:true,keys:[[-6,-28,-9.5],[-3,-24.6,-8.2],[PASS_A,-22.8,-7.2],[0,-20.8,-6.6],[1.5,-17,-6],[3,-14.4,-3],[6,-10.8,6.5]]},
 {name:'Fabián Ruiz',role:'esp',style:ESP({number:8,hair:[K,.85],build:{height:1.89},seed:8}),key:true,keys:[[-6,-14.5,-3.2],[-2,-16.6,-2.2],[0,-17.6,-1.9],[VOL,-17.9,-1.8],[3,-17.5,-1.2],[6,-17,-1]]},
 {name:'Merino',role:'esp',style:ESP({number:6,build:{height:1.89},seed:6}),keys:[[-6,-18,-9.5],[-1,-20,-7],[VOL,-20.8,-6.3],[6,-21,-5]]},
 {name:'Zubimendi',role:'esp',style:ESP({number:18,seed:18}),keys:[[-6,-22.4,-13.4],[0,-24.6,-12],[6,-24,-10]]},
 {name:'Cucurella',role:'esp',style:ESP({number:24,hairStyle:'curly',hair:[K,.9],build:{height:1.72},seed:24}),keys:[[-6,-11.8,6.6],[0,-14,5],[VOL,-14.4,4.7],[6,-13,4]]},
 {name:'Olmo',role:'esp',style:ESP({number:10,build:{height:1.79},seed:110}),keys:[[-6,-16.4,10],[0,-18.6,7.6],[VOL,-19,7.2],[6,-18,6]]},
 {name:'Porro',role:'esp',style:ESP({number:12,build:{height:1.73},seed:12}),keys:[[-6,-9.4,10],[0,-11.6,8],[6,-11,7]]},
 {name:'Vivian',role:'esp',style:ESP({number:5,build:{height:1.84},seed:5}),keys:[[-6,-9.2,2.2],[0,-11.4,2.6],[6,-10,2]]},
 {name:'Spain centre-back',role:'esp',style:ESP({build:{height:1.94},seed:14}),keys:[[-6,-8.2,-3.4],[0,-10.2,-2.6],[6,-9,-2]]},
 {name:'Kolo Muani',role:'fra',style:FRA({number:12,skin:SKIN_D,build:{height:1.87},seed:112}),keys:[[-6,-8.6,1],[0,-10.4,3.8],[VOL,-10.3,4],[3,-11,6],[6,-10,9.5]]},
 {name:'Barcola',role:'fra',style:FRA({skin:SKIN_D,seed:29}),keys:[[-6,-8,-13],[0,-9.6,-10.4],[6,-10,-6]]},
 {name:'Gusto',role:'fra',style:FRA({skin:SKIN_D,seed:13}),keys:[[-6,-24,23],[0,-19.6,19.4],[6,-14,15]]},
],-7,7);
const A_CH=0,A_GK=1,A_MB=2;
function yawA(tau:number){const v=velOf(PA,A_CH,tau),[x,z]=posOf(PA,A_CH,tau),run=Math.hypot(v[0],v[1])>.6?YAW(v[0],v[1]):YAW(-x,-z*.5),toGoal=YAW(HIT_A[0]-x,HIT_A[2]-z);
 return lerpAng(run,toGoal,sm(-1.2,-.3,tau)*(1-sm(VOL+.8,VOL+1.3,tau)));}
function chPoseA(tau:number):Pose{
 const v=velOf(PA,A_CH,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(stand(),runCycle(distOf(PA,A_CH,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 p=over(p,{neckY:34,neckP:12},bump(-2.4,-.3,tau));// eyes on Mbappé out to his left
 // the touch that pops it up (drawn with his right foot: INFERRED), then the LEFT-foot volley
 p=blendPose(p,dribble(.97+tau/.6,{foot:'r',speed:.3}),bump(-.5,.3,tau));
 p=over(p,{rAnk:-20,rHipF:30,rKnee:40},bump(-.08,.2,tau));
 const u=(tau-V_ST)/VD;
 if(u>-.1&&u<1.5)p=blendPose(p,volley(clamp(u),{foot:'l',height:.3}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>VOL+1.2)p=blendPose(p,celebrate((tau-VOL-1.2)*1.1,{kind:'run'}),sm(VOL+1.2,VOL+1.7,tau));
 return p;}
/** the volley point: his LEFT boot at contact (solved skeleton); the pop-up point: his right toe at τ = 0 */
const M_A:V3=(()=>{const[x,z]=posOf(PA,A_CH,VOL),sk=solve(chPoseA(VOL),CHERKI.build,{x,z,yaw:yawA(VOL)});return[sk.lToe[0],Math.max(.3,sk.lToe[1]+.06),sk.lToe[2]];})();
const TP_A:V3=(()=>{const[x,z]=posOf(PA,A_CH,0),sk=solve(chPoseA(0),CHERKI.build,{x,z,yaw:yawA(0)});return[sk.rToe[0],.11,sk.rToe[2]];})();
const VY_UP=(M_A[1]-TP_A[1]+.5*G0*VOL*VOL)/VOL,VY_SH=(HIT_A[1]-M_A[1]+.5*G0*FL_A*FL_A)/FL_A;
const A0=bootOf(PA,A_MB,PASS_A,.45);
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
function netBall(tau:number,t0:number,hit:V3,back:V3,rest:V3):V3{if(tau<t0+.08)return mix3(hit,back,(tau-t0)/.08);const u=clamp((tau-t0-.08)/.75),y=u<.55?lerp(back[1],.11,(u/.55)*(u/.55)):.11+.3*Math.sin(Math.PI*(u-.55)/.45);return[lerp(back[0],rest[0],easeOut(u)),y,lerp(back[2],rest[2],u)];}
function ballA(tau:number):V3{
 if(tau<PASS_A)return bootOf(PA,A_MB,tau,.45);
 if(tau<0)return roll(A0,TP_A,(tau-PASS_A)/-PASS_A);
 if(tau<VOL){const u=tau/VOL;return[lerp(TP_A[0],M_A[0],u),TP_A[1]+VY_UP*tau-.5*G0*tau*tau,lerp(TP_A[2],M_A[2],u)];}
 if(tau<IN_A){const s=tau-VOL,u=s/FL_A;return[lerp(M_A[0],HIT_A[0],u),M_A[1]+VY_SH*s-.5*G0*s*s,lerp(M_A[2],HIT_A[2],u)];}
 return netBall(tau,IN_A,HIT_A,[1.9,1.4,2.3],[1.4,.11,1.8]);}
const NET_A:V3=[2,1.4,2.2];
const DIVE_A=VOL+.22;

// ---------------- PLAY B: the cross (90+4'). τ = 0: the left-foot cross; HT: Kolo Muani's header ----------------
const CROSS=0,HT=1.02,HD=.85,H_ST=HT-.52*HD,HFL=.3,IN_B=HT+HFL;
const GOAL_B:V3=[0,.38,-1.3];// where the header went in: INFERRED (low, to Simón's right)
const PB=mkPlay([
 {name:'Cherki',role:'ch',style:CHERKI,key:true,keys:[[-4.5,-28.5,23.4],[-2.4,-22.6,20.9],[-1.3,-19.9,19.8],[-.7,-18.9,18.4],[-.2,-18.2,17.1],[CROSS,-18,16.7],[.7,-17.4,16.2],[2,-15.8,15.4],[4.5,-13,13]]},
 {name:'Simón',role:'gk',style:SIMON,key:true,keys:[[-4.5,-1.3,.8],[-1.5,-1.5,2],[0,-1.6,2.2],[HT,-1.4,1.3],[4.5,-1.4,1.3]]},
 {name:'Kolo Muani',role:'fra',style:FRA({number:12,skin:SKIN_D,build:{height:1.87},seed:112}),key:true,keys:[[-4.5,-10.4,4.6],[-2,-9.6,4.2],[-.6,-8.2,3.4],[.4,-6.3,2.2],[H_ST,-5.6,1.8],[HT,-4.7,1.35],[1.6,-4.1,1.2],[2.6,-5.5,3],[4.5,-9,7]]},
 {name:'Cucurella',role:'esp',style:ESP({number:24,hairStyle:'curly',hair:[K,.9],build:{height:1.72},seed:24}),key:true,keys:[[-4.5,-15.8,17.2],[-2.4,-17.4,19],[-1.3,-18.3,19.4],[-.7,-18.8,18.9],[0,-19,18.2],[1.5,-18.2,17],[4.5,-16,15]]},
 {name:'Vivian',role:'esp',style:ESP({number:5,build:{height:1.84},seed:5}),key:true,keys:[[-4.5,-8.6,3.8],[-1,-7.8,3.2],[HT,-6.2,2.3],[4.5,-6,2.8]]},
 {name:'Spain centre-back',role:'esp',style:ESP({build:{height:1.94},seed:14}),keys:[[-4.5,-8,-1.4],[0,-7,-.8],[HT,-5.8,-.6],[4.5,-6,-1]]},
 {name:'Porro',role:'esp',style:ESP({number:12,build:{height:1.73},seed:12}),keys:[[-4.5,-9.4,-9.4],[0,-7.6,-6.8],[4.5,-7,-6]]},
 {name:'Zubimendi',role:'esp',style:ESP({number:18,seed:18}),keys:[[-4.5,-15,6.8],[0,-12.6,5.8],[4.5,-11.5,5]]},
 {name:'Merino',role:'esp',style:ESP({number:6,build:{height:1.89},seed:6}),keys:[[-4.5,-16.4,1],[0,-12.4,.2],[4.5,-11,0]]},
 {name:'Mbappé',role:'fra',style:FRA({number:10,skin:SKIN_D,hair:[K,.9],build:{height:1.78},seed:10}),keys:[[-4.5,-13,-3],[0,-8.4,-2],[HT,-6.8,-1.6],[4.5,-6,-1]]},
 {name:'Barcola',role:'fra',style:FRA({skin:SKIN_D,seed:29}),keys:[[-4.5,-11,-11],[0,-7.4,-6.8],[HT,-6.4,-5.4],[4.5,-6,-5]]},
 {name:'Gusto',role:'fra',style:FRA({skin:SKIN_D,seed:13}),keys:[[-4.5,-35,26],[-1,-29,25.5],[4.5,-24,24.5]]},
],-5.5,5.5);
const B_CH=0,B_GK=1,B_KM=2,B_CU=3;
const SD_B=.9,SB_ST=CROSS-STRIKE_CONTACT*SD_B;
function yawB(tau:number){const v=velOf(PB,B_CH,tau),[x,z]=posOf(PB,B_CH,tau),run=Math.hypot(v[0],v[1])>.6?YAW(v[0],v[1]):0,toBox=YAW(-5-x,1-z);
 return lerpAng(run,toBox,sm(-.6,-.15,tau)*(1-sm(.9,1.6,tau)));}
function chPoseB(tau:number):Pose{
 const v=velOf(PB,B_CH,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(stand(),runCycle(distOf(PB,B_CH,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 // carrying it at Cucurella, then the cut inside onto his LEFT foot, then the left-foot cross
 if(tau<-1.25)p=blendPose(p,dribble(distOf(PB,B_CH,tau)/2.4,{foot:'r',speed:.6}),.75);
 p=blendPose(p,dribble(.97+(tau+.8)/.55,{foot:'l',speed:.5}),bump(-1.3,-.45,tau));
 p=over(p,{roll:-12,bend:-14,lean:16,neckY:18},bump(-1.35,-.55,tau)*.9);
 const u=(tau-SB_ST)/SD_B;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'l',power:.75}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>IN_B+.3)p=blendPose(p,celebrate((tau-IN_B-.3)*1.1,{kind:'arms'}),sm(IN_B+.3,IN_B+.8,tau));
 return p;}
function kmYaw(tau:number,x:number,z:number){const v=velOf(PB,B_KM,tau);return tau>H_ST-.2&&tau<HT+.6?YAW(GOAL_B[0]-x,GOAL_B[2]-z+1.6):Math.hypot(v[0],v[1])>.6?YAW(v[0],v[1]):YAW(-x,-z);}
function kmPose(tau:number,base:Pose):Pose{const u=(tau-H_ST)/HD;return u>-.15&&u<1.3?blendPose(base,header(clamp(u)),Math.min(sm(-.15,0,u),1-sm(1,1.3,u))):base;}
/** the cross leaves his LEFT boot (solved skeleton); the header meets his forehead at HT */
const C0:V3=(()=>{const[x,z]=posOf(PB,B_CH,CROSS),sk=solve(chPoseB(CROSS),CHERKI.build,{x,z,yaw:yawB(CROSS)});return[sk.lToe[0],.11,sk.lToe[2]];})();
const HB:V3=(()=>{const[x,z]=posOf(PB,B_KM,HT),y=kmYaw(HT,x,z),sk=solve(kmPose(HT,stand()),{height:1.87},{x,z,yaw:y});return[sk.head[0]+Math.cos(y)*.14,sk.head[1]+.05,sk.head[2]-Math.sin(y)*.14];})();
const VY_X=(HB[1]-C0[1]+.5*G0*HT*HT)/HT;
/** the ball at his feet while he carries it: ahead and to the side of the touching foot (right, then left after the cut) */
function carryB(tau:number):V3{const[x,z]=posOf(PB,B_CH,tau),y=yawB(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=lerp(.12,-.16,sm(-1.1,-.7,tau)),ah=.55-.15*bump(-1.1,-.6,tau);return[x+fx*ah+rx*sd,.11,z+fz*ah+rz*sd];}
function ballB(tau:number):V3{
 if(tau<CROSS)return mix3(carryB(tau),C0,sm(-.35,0,tau));
 if(tau<HT){const s=tau-CROSS,u=s/HT,curl=-1.6*Math.sin(Math.PI*u);// the inswing: it bows away from goal, then curls in
  return[lerp(C0[0],HB[0],u)+curl,C0[1]+VY_X*s-.5*G0*s*s,lerp(C0[2],HB[2],u)];}
 if(tau<IN_B)return mix3(HB,GOAL_B,(tau-HT)/HFL);
 return netBall(tau,IN_B,GOAL_B,[1.9,.3,-1.4],[1.3,.11,-1]);}
const NET_B:V3=[2,.4,-1.3];
const DIVE_B=HT+.02;

// ---------------- PLAY D: the lesson demonstration (training pitch). τ = 0: a right-foot touch one way; .6: the left foot takes it the other ----------------
const PD=mkPlay([
 {name:'player',role:'ch',style:TRAIN,key:true,keys:[[-3.5,-27,.6],[-1.2,-21.2,.7],[-.3,-19.6,.8],[0,-19.2,.95],[.35,-18.9,1.15],[.9,-18,-.3],[1.5,-16.3,-1.5],[2.3,-13.2,-2],[3.5,-9,-2]]},
 {name:'defender',role:'esp',style:TRAIN_D,key:true,keys:[[-3.5,-15.6,.7],[-1,-16.6,.8],[0,-17.1,.9],[.6,-17.3,1.6],[1.3,-17.3,1.75],[2.4,-16.8,1.2],[3.5,-16.5,.8]]},
],-4.5,4.5);
const D_PL=0,D_DF=1;
function yawD(tau:number){const v=velOf(PD,D_PL,tau);return Math.hypot(v[0],v[1])>.6?YAW(v[0],v[1]):0;}
function plPoseD(tau:number):Pose{const v=velOf(PD,D_PL,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(stand(),dribble(distOf(PD,D_PL,tau)/2.2,{foot:'r',speed:s*.6}),clamp((sp-.4)/.8));
 p=blendPose(p,dribble(.97+tau/.5,{foot:'r',speed:.4}),bump(-.45,.3,tau));
 p=over(p,{roll:10,bend:12,lean:14,rShA:48},bump(-.3,.45,tau)*.9);// the shoulders sell it to his right
 p=blendPose(p,dribble(.97+(tau-.6)/.5,{foot:'l',speed:.5}),bump(.15,.95,tau));
 p=over(p,{roll:-12,bend:-14,lean:16,lShA:48},bump(.4,1.1,tau)*.9);
 if(tau>1.1)p=blendPose(p,dribble(distOf(PD,D_PL,tau)/2.2,{foot:'l',speed:.7}),sm(1.1,1.4,tau)*.8);
 return p;}
function ballD(tau:number):V3{const[x,z]=posOf(PD,D_PL,tau),y=yawD(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y);
 const sd=.1+.28*sm(-.1,.25,tau)-.62*sm(.5,.85,tau);return[x+fx*.55+rx*sd,.11,z+fz*.55+rz*sd];}

// ---- everyone, per play ----
type Which='A'|'B'|'D';
const PL={A:PA,B:PB,D:PD} as const;
const ballOf=(w:Which,tau:number)=>w==='A'?ballA(tau):w==='B'?ballB(tau):ballD(tau);
function poseOf(w:Which,k:number,tau:number):{p:Pose;yaw:number}{
 const pl=PL[w];
 if(k===0)return w==='A'?{p:chPoseA(tau),yaw:yawA(tau)}:w==='B'?{p:chPoseB(tau),yaw:yawB(tau)}:{p:plPoseD(tau),yaw:yawD(tau)};
 const a=pl.A[k],v=velOf(pl,k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(pl,k,tau),b=ballOf(w,tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);let p=blendPose(keeperSet(tau*1.4),runCycle(distOf(pl,k,tau)/2.6,{speed:clamp((sp-1)/5)}),clamp((sp-.6)/1));
  // the dive, late both times: Simón faces −x, so his left is +z (the volley) and his right is −z (the header)
  const dt=w==='A'?DIVE_A:DIVE_B,side:'l'|'r'=w==='A'?'l':'r';
  if(tau>dt){p=keeperDive(clamp((tau-dt)/1),{side,height:w==='A'?.6:.12});yaw=YAW(-1,0);}
  return{p,yaw};}
 const idle=a.role==='esp'?READY:stand();
 if(a.role==='esp'&&sp<2.5)yaw=lerpAng(yaw,YAW(b[0]-x,b[2]-z),.75);
 let p=locomote(pl,k,tau,yaw,idle);
 if(w==='A'){
  if(k===A_MB){if(Math.abs(tau-PASS_A)<.5)yaw=YAW(TP_A[0]-x,TP_A[2]-z);p=passAt(p,tau,PASS_A,.4,'r');}
  if(k===3){const u=(tau-(VOL-.55))/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u))*.8);}
  if(tau>IN_A+.4&&a.role==='fra')p=blendPose(p,celebrate((tau-IN_A)*1.1+k*.13,{kind:'arms'}),sm(IN_A+.4,IN_A+1,tau));}
 if(w==='B'){
  if(k===B_KM){yaw=kmYaw(tau,x,z);p=kmPose(tau,p);if(tau>IN_B+.4)p=blendPose(p,celebrate((tau-IN_B)*1.1,{kind:'arms'}),sm(IN_B+.4,IN_B+.9,tau));}
  // Cucurella: square on to him, then a jab of the right leg as he cuts inside
  if(k===B_CU){const[cx,cz]=posOf(PB,B_CH,tau);if(tau<.6)yaw=YAW(cx-x,cz-z);const u=(tau+1.2)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}}
 if(w==='D'&&k===D_DF){const[px,pz]=posOf(PD,D_PL,tau);yaw=YAW(px-x,pz-z);p=blendPose(READY,backpedal(distOf(PD,D_DF,tau)/1.1),clamp((sp-.4)/.6));
  // he bites on the right-foot touch: a lunge to HIS left, the way the ball went first
  const u=(tau-.05)/.9;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Cherki with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,w:Which,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:[number,number];only?:number[]}):World{
 const pl=PL[w],b=ballOf(w,tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 const PLc=(k:number,tt:number):Place=>{const[x,z]=posOf(pl,k,tt);return{x,z,yaw:poseOf(w,k,tt).yaw};};
 pl.A.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(pl,k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<(k===0?1:3.5))return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const pose=poseOf(w,k,tp).p,place:Place={x,z,yaw:PLc(k,tp).yaw},px=kk*1.8*ppu;
   const detail=passing?(k===0?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===0||a.key);
   const prev=big?{pose:poseOf(w,k,tp-1/12).p,place:{...PLc(k,tp-1/12),x:posOf(pl,k,tau-1/12)[0],z:posOf(pl,k,tau-1/12)[1]}}:undefined;
   res.set(k,drawPlayer(s,pose,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===0}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballOf(w,tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  // speed streaks behind the ball in flight
  if(o.trail&&tau>o.trail[0]&&tau<o.trail[1]){const back=P(c,ballOf(w,Math.max(o.trail[0],tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6});}
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01||cov<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** ground points along the ball's path between two times */
const ballPath=(w:Which,t0:number,t1:number,n=12):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballOf(w,t0+(t1-t0)*i/n);return[b[0],b[2]];});
/** the ball's flight in the air (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,w:Which,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;dashed?:boolean;seed?:number;head?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,dashed=false,seed=81,head=true}=o;if(progress<=.01||cov<=.01)return;
 const n=16,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=ballOf(w,t0+(t1-t0)*i/n),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
 if(q.length<2)return;const wd=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.06;x<.95;x+=.12)gaps.push([x,x+.06]);
 s.knockout(ribbon(q,wd*1.6,{seed,taper:.1,wobble:.6,gaps}),.8*cov);s.fill(ink,ribbon(q,wd,{seed,taper:.1,wobble:.6,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],wd,{seed:seed+1,head:wd*3,cov});}}
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** a screen-space ring round a joint pair (a boot), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 s.knockout(ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);
 s.fill(ink,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number,seed=143){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(40,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed,taper:0,wobble:.8}),.95*w);}
/** a ring in the goal plane round the spot the ball flies into */
function cornerRing(s:Sheet,c:Camera,w:number,h:V3,sz=1){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU,p:V3=[h[0],Math.max(.05,h[1]+Math.sin(a)*.62*w*sz),h[2]+Math.cos(a)*.8*w*sz];if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const wd=Math.max(5,.1*sz*kAt(c,h)),cv=Math.min(1,w*1.5);s.knockout(ribbon(pts,wd*1.8,{close:true,seed:145,taper:0,wobble:.8}),.7*cv);s.fill(Y,ribbon(pts,wd,{close:true,seed:145,taper:0,wobble:.8}),.95*cv);}
/** the D and the edge of the box (the 18-yard line), lit */
function boxEdge(s:Sheet,c:Camera,w:number){if(w<=.02)return;const a=Math.acos(5.5/9.15),pts:[number,number][]=[];for(let i=0;i<=14;i++){const u=Math.PI-a+(2*a)*i/14;pts.push([-11+Math.cos(u)*9.15,Math.sin(u)*9.15]);}
 groundTrail(s,c,[[-16.5,-20.16],[-16.5,-10],[-16.5,0],[-16.5,10],[-16.5,20.16]],.16,Y,{cov:.8*w,head:false,seed:161});groundTrail(s,c,pts,.2,Y,{cov:.95*w,head:false,seed:163});}
/** a toe's arc through a move (screen points from solved skeletons), for the follow-through mark */
function toeArc(c:Camera,w:Which,t0:number,t1:number,foot:'l'|'r',n=10):Pt[]{const pl=PL[w],out:Pt[]=[];for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*i/n,[x,z]=posOf(pl,0,tau),ps=poseOf(w,0,tau),sk=solve(ps.p,CHERKI.build,{x,z,yaw:ps.yaw}),q=foot==='l'?sk.lToe:sk.rToe;if(depthOf(c,q)<NEAR+.2)continue;out.push(P(c,q));}return out;}
function spark(s:Sheet,c:Camera,p:V3,age:number,size:number,seed:number){if(age<=-.03||age>=.3)return;const q=P(c,p);sparkBurst(s,Y,q[0],q[1],kAt(c,p)*size,{n:9,seed,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.15)/.15)),width:8});}

// ================= chapter 1 (live, near real time): the high main-stand camera; the stadium, Mbappé's pass, the pop-up, the volley, 5–2 =================
const tau1=(t:number)=>{const fg=T(0,'first game'),iw=T(0,'in white'),mp=T(0,'Mbappé passes'),eb=T(0,'edge of the box'),pu=T(0,'pops it up'),sv=T(0,'smashes a volley'),gl=T(0,'Goal'),E=SEC(0);
 return key(t,mono([[0,-6.5],[fg,-4.5],[iw,-3],[mp,PASS_A-.1],[eb+.2,-.35],[pu+.15,.08],[sv+.1,VOL],[gl,IN_A+.08],[E+1,IN_A+.08+(E+1-gl)]]),linear);};
const CAM1:V3=[-44,22,60];
function look1(tau:number):V3{const b=ballA(tau),[fx,fz]=posOf(PA,A_CH,tau);
 if(tau<VOL){return[lerp(b[0],fx,.5)+3,1,lerp(b[2],fz,.5)*.8];}
 if(tau<IN_A){const u=sm(VOL-.1,IN_A,tau);return[lerp(lerp(b[0],fx,.5)+3,-8,u),1,lerp(lerp(b[2],fz,.5)*.8,1.5,u)];}
 return mix3([-8,1.2,1.5],[fx,1,fz*.8],sm(IN_A+.4,IN_A+2.4,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const st=T(0,'Stuttgart'),rc=T(0,'Rayan Cherki');
 // wide on the floodlit stadium first, then down onto the play
 const up=1-sm(st+.9,rc+.8,t,easeInOutSine);
 const F=key(t,mono([[0,1250],[st+.9,1350],[rc+.8,4200],[T(0,'first game'),5600],[T(0,'in white'),6000],[T(0,'Mbappé passes'),6800],[T(0,'pops it up'),7800],[T(0,'smashes a volley'),7400],[T(0,'Goal')+.4,6200],[SEC(0),6000]]),easeInOutSine);
 return cam(CAM1,mix3(look,[-48,16,-80],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_A,st=T(0,'Stuttgart'),rc=T(0,'Rayan Cherki'),fg=T(0,'first game'),iw=T(0,'in white'),mp=T(0,'Mbappé passes'),eb=T(0,'edge of the box'),pu=T(0,'pops it up'),sv=T(0,'smashes a volley'),gl=T(0,'Goal');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn),lamps:sm(st-.1,st+.4,t)*(1-sm(rc,rc+.6,t))});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_A):undefined});
  // "edge of the box": the D and the 18-yard line light up
  boxEdge(s,c,sm(eb-.1,eb+.4,t)*(1-sm(sv+.3,sv+.9,t)));
  // "Mbappé passes": the pass across the grass, dashed, drawn as it travels
  groundTrail(s,c,ballPath('A',PASS_A,0,12),.35,Y,{progress:clamp((tau-PASS_A)/-PASS_A),dashed:true,cov:.95*(1-sm(pu+.4,pu+.9,t)),seed:91});
  // "pops it up": the ball's little hop, then the volley's flight
  airTrail(s,c,'A',0,VOL,R,{progress:clamp(tau/VOL),cov:.95*(1-sm(sv+.5,sv+1,t)),wm:.18,seed:93,head:false});
  airTrail(s,c,'A',VOL,IN_A,Y,{progress:clamp((tau-VOL)/FL_A),cov:.95*(1-sm(gl+1,gl+1.5,t)),wm:.3,seed:147,head:false});
  const w=drawWorld(s,c,'A',tau,tp,{ballMin:13,trail:[VOL,IN_A+.05]});
  // "in white": rings under France's white shirts
  const iwW=sm(iw-.1,iw+.3,t,easeOutBack)*(1-sm(iw+1.1,iw+1.5,t));if(iwW>.02)PA.A.forEach((a,k)=>{if(a.role!=='fra'&&a.role!=='ch')return;const[x,z]=posOf(PA,k,tau);groundRing(s,c,x,z,.9,.9,.12,Y,.95*clamp(iwW),170+k);});
  const hero=w.res.get(A_CH);if(hero){bodyRing(s,hero,Y,sm(fg-.15,fg+.25,t,easeOutBack)*(1-sm(iw-.2,iw+.2,t)));
   // "pops it up": the touching boot lit; "smashes a volley": the left boot
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(pu-.1,pu+.25,t,easeOutBack)*(1-sm(pu+.9,pu+1.3,t)),151);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(sv-.1,sv+.25,t,easeOutBack)*(1-sm(sv+.9,sv+1.3,t)),153);}
  const mb=w.res.get(A_MB);if(mb)bodyRing(s,mb,Y,sm(mp-.15,mp+.25,t,easeOutBack)*(1-sm(mp+1,mp+1.4,t)),155);
  spark(s,c,TP_A,tau,1.4,97);
  spark(s,c,M_A,tau-VOL,2.2,99);
  // "Goal": the spot where it went in lights up
  cornerRing(s,c,sm(gl-.3,gl+.1,t,easeOutBack)*(1-sm(gl+1.2,gl+1.6,t)),HIT_A,2);},
 aperture(t){const c=cam1(t),p=ballA(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, from behind him and high on his left, like the Reuters photo): the pop-up, the left foot =================
const tau2=(t:number)=>{const E=SEC(1),ot=T(1,'One touch'),lb=T(1,'lifts the ball'),tv=T(1,'Then a volley'),lf=T(1,'left foot'),tf=T(1,'too fast'),tk=T(1,'the keeper');
 return key(t,mono([[0,-1.2],[ot,-.1],[lb+.3,.25],[tv+.2,VOL-.15],[lf+.1,VOL],[tf+.2,VOL+.3],[tk+.2,IN_A],[E,IN_A+.5]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(PA,A_CH,clamp(tau,-1.5,VOL+.2)),ot=T(1,'One touch'),lf=T(1,'left foot'),push=sm(ot-.6,ot+.5,t,easeInOutSine),out=sm(lf+.1,T(1,'the keeper'),t,easeInOutSine);
 const look:V3=[lerp(x+2.4,-4,out),lerp(.75,1.1,out),lerp(z+.5,1.2,out)];
 return cam([x-6.6+1.4*push-1.5*out,4.4-1*push+.8*out,z-5.2+1.1*push-.4*out],look,key(t,mono([[0,1900],[ot+.5,2300],[lf,2250],[E,1350]])));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),goalIn=tau-IN_A,ot=T(1,'One touch'),lb=T(1,'lifts the ball'),tv=T(1,'Then a volley'),lf=T(1,'left foot'),tf=T(1,'too fast'),tk=T(1,'the keeper');frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.5,goalIn),flash:.2+sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_A):undefined});
  // "lifts the ball": the hop, red, dashed, from the touch up to where the volley meets it
  airTrail(s,c,'A',0,VOL,R,{progress:sm(lb-.2,lb+.6,t,easeOut),cov:.95*(1-sm(lf+.2,lf+.7,t)),wm:.07,dashed:true,seed:101});
  // "Then a volley": the spot in the air where the boot will meet it
  const vw=sm(tv-.15,tv+.25,t,easeOutBack)*(1-sm(lf+.1,lf+.5,t));if(vw>.02&&depthOf(c,M_A)>NEAR){const q=P(c,M_A),r=Math.max(14,.32*kAt(c,M_A))*vw;s.knockout(ribbon(Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r,q[1]+Math.sin(i/24*TAU)*r] as Pt),Math.max(5,r*.3),{close:true,seed:103,taper:0,wobble:.8}),.7*vw);s.fill(Y,ribbon(Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r,q[1]+Math.sin(i/24*TAU)*r] as Pt),Math.max(3,r*.16),{close:true,seed:103,taper:0,wobble:.8}),.95*vw);}
  // "too fast": the flight to goal, drawn as it goes
  airTrail(s,c,'A',VOL,IN_A,Y,{progress:sm(tf-.3,tf+.5,t),cov:.95*(1-sm(E-.6,E-.2,t)),wm:.1,seed:105});
  const w=drawWorld(s,c,'A',tau,tp,{ballMin:8,hero:true,glow:sm(ot-.1,ot+.2,t)*(1-sm(lb+.6,lb+1,t)),trail:[VOL,IN_A+.05]});
  const hero=w.res.get(A_CH);
  if(hero){
   // "One touch": the boot that lifts it; "left foot": the LEFT boot at the volley, then its follow-through arc
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(ot-.1,ot+.25,t,easeOutBack)*(1-sm(lb+.3,lb+.7,t)),107);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(lf-.15,lf+.2,t,easeOutBack)*(1-sm(tf+.4,tf+.8,t)),109);
   const fw=sm(lf+.1,lf+.7,t,easeOut)*(1-sm(E-.8,E-.3,t));if(fw>.02&&tau>VOL){const arc=toeArc(c,'A',VOL-.05,Math.min(VOL+.4,tau),'l');if(arc.length>2){const wd=Math.max(5,kAt(c,M_A)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:111,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:111,head:wd*3,cov:.95*fw});}}}
  // "the keeper": a red ring round Simón's feet, beaten
  const gk=w.res.get(A_GK);if(gk)bodyRing(s,gk,R,sm(tk-.15,tk+.25,t,easeOutBack)*(1-sm(E-.5,E-.15,t)),113);
  spark(s,c,TP_A,tp,.8,112);spark(s,c,M_A,tp-VOL,1,114);
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:115,len:900,spread:520,width:22,cov:.5*(1-t/.5)});},
 aperture(t){const c=cam2(t),p=ballA(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (stoppage time, a lower main-stand camera): out on the right, the cut onto the left, the curling cross, the header =================
const tau3=(t:number)=>{const E=SEC(2),ne=T(2,'Near the end'),or=T(2,'out on the right'),ci=T(2,'cuts inside'),lf=T(2,'his left foot'),cc=T(2,'curls a cross'),km=T(2,'Kolo Muani'),hi=T(2,'heads it in');
 return key(t,mono([[0,-4.6],[ne+.3,-4],[or+.3,-2.5],[ci+.1,-1.2],[lf+.2,-.25],[cc+.2,CROSS+.05],[km+.2,HT-.3],[hi+.1,HT+.05],[hi+1,IN_B+.3],[E+1,IN_B+.3+(E-hi)]]),linear);};
const CAM3:V3=[-25,6,37];
function look3(tau:number):V3{const b=ballB(tau),[cx,cz]=posOf(PB,B_CH,tau);
 if(tau<CROSS)return[lerp(b[0],cx,.5)+2,1,lerp(b[2],cz,.5)-1];
 if(tau<IN_B){const u=sm(CROSS,HT,tau,easeInOutSine);return mix3([cx+2,1,cz-1],[-6,1.2,2.5],u);}
 const[kx,kz]=posOf(PB,B_KM,tau);return mix3([-6,1.2,2.5],[kx,1,kz],sm(IN_B+.4,IN_B+1.6,tau));}
function cam3(t:number){const tau=tau3(t),a=look3(tau),b=look3(tau-.25),c=look3(tau-.5),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(t,mono([[0,2900],[T(2,'out on the right'),3500],[T(2,'cuts inside'),3900],[T(2,'his left foot'),3800],[T(2,'curls a cross')+.3,2700],[T(2,'Kolo Muani'),3100],[T(2,'heads it in')+.5,3600],[SEC(2),3400]]),easeInOutSine);
 return cam(CAM3,look,F);}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_B,E=SEC(2),ne=T(2,'Near the end'),or=T(2,'out on the right'),ci=T(2,'cuts inside'),lf=T(2,'his left foot'),cc=T(2,'curls a cross'),km=T(2,'Kolo Muani'),hi=T(2,'heads it in');frame(s);
  stadium(s,c,{t,cheer:.1+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn),lamps:sm(ne-.1,ne+.4,t)*(1-sm(ne+1.2,ne+1.8,t))});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_B):undefined});
  // "cuts inside": his path inside, away from the defender, on the grass
  groundTrail(s,c,ballPath('B',-1.35,-.05,10),.16,R,{progress:sm(ci-.15,ci+.6,t,easeOut),cov:.95*(1-sm(cc+.2,cc+.7,t)),seed:121});
  // "curls a cross": the inswinging flight, drawn as it goes
  airTrail(s,c,'B',CROSS,HT,Y,{progress:clamp((tau-CROSS)/HT),cov:.95*(1-sm(hi+1,hi+1.5,t)),wm:.16,seed:123,head:false});
  airTrail(s,c,'B',HT,IN_B,Y,{progress:clamp((tau-HT)/HFL),cov:.95*(1-sm(hi+1,hi+1.5,t)),wm:.2,seed:125});
  const w=drawWorld(s,c,'B',tau,tp,{ballMin:10,hero:true,trail:[CROSS,IN_B+.05]});
  const hero=w.res.get(B_CH);
  if(hero){bodyRing(s,hero,Y,sm(or-.15,or+.25,t,easeOutBack)*(1-sm(ci-.2,ci+.2,t)),127);
   // "his left foot": the left boot lit as it meets the ball
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(lf-.1,lf+.25,t,easeOutBack)*(1-sm(cc+.4,cc+.8,t)),129);}
  // "out on the right": the right-hand edge of the box lit where he is
  const orW=sm(or-.1,or+.3,t)*(1-sm(ci+.2,ci+.6,t));groundTrail(s,c,[[-16.5,12],[-16.5,20.16],[-11,20.16],[0,20.16]],.18,Y,{cov:.9*orW,head:false,seed:131});
  // the defender he goes past: a red ring at his feet
  const cw=sm(ci-.1,ci+.3,t,easeOutBack)*(1-sm(lf+.2,lf+.6,t));if(cw>.02){const[x,z]=posOf(PB,B_CU,tau);groundRing(s,c,x,z,.9,.9,.08,R,.95*clamp(cw),133);}
  const kmr=w.res.get(B_KM);if(kmr)bodyRing(s,kmr,Y,sm(km-.15,km+.25,t,easeOutBack)*(1-sm(hi+.2,hi+.6,t)),135);
  spark(s,c,C0,tau-CROSS,1.4,137);spark(s,c,HB,tau-HT,1.6,139);
  cornerRing(s,c,sm(hi+.2,hi+.5,t,easeOutBack)*(1-sm(E-.5,E-.1,t)),GOAL_B,1.3);
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:141,len:900,spread:520,width:22,cov:.5*(1-t/.45)});},
 aperture(t){const c=cam3(t),p=ballB(tau3(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(10,BALL_R*kAt(c,p))*1.1,12);},
 still:4,
};

// ================= chapter 4 (the lesson, a training-pitch DEMONSTRATION, not the match): both feet — a right-foot touch one way, the left foot the other =================
const tau4=(t:number)=>{const E=SEC(3),yt=T(3,'Your turn'),bf=T(3,'both feet'),sd=T(3,'so defenders'),gs=T(3,'guess'),ww=T(3,'which way'),wg=T(3,'will go');
 return key(t,mono([[0,-3.2],[yt+.3,-2.6],[bf+.2,-1.6],[sd+.1,-.8],[gs+.1,-.25],[ww+.1,.15],[wg,.9],[E,2.6]]),linear);};
function cam4(t:number){const tau=tau4(t),[x,z]=posOf(PD,D_PL,clamp(tau,-3.2,2.2)),push=sm(T(3,'Your turn'),T(3,'both feet')+.3,t,easeInOutSine),wide=sm(T(3,'guess')-.3,T(3,'which way'),t,easeInOutSine);
 // behind the player and a little high, so his left and right read on screen; in close on the feet for "both feet"
 const pos:V3=[x-7.2+1.6*push-1.6*wide,3.2-.7*push+.9*wide,z+1.2-.4*push];
 const look:V3=[x+2.8-.8*push+1.2*wide,.6,z];
 const out=sm(T(3,'will go')-.3,T(3,'will go')+.7,t,easeInOutSine);
 return cam(pos,[look[0],look[1],look[2]+1.2*out],lerp(1650,2050,push)-350*wide-380*out);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),yt=T(3,'Your turn'),pw=T(3,'practise with'),bf=T(3,'both feet'),sd=T(3,'so defenders'),gs=T(3,'guess'),ww=T(3,'which way'),wg=T(3,'will go');frame(s);
  trainingGround(s,c);
  ground(s,c,{boards:false});
  // "Your turn": a ring round the ball
  const b0=ballD(tau);groundRing(s,c,b0[0],b0[2],.5,.5,.05,Y,.95*sm(yt-.1,yt+.3,t,easeOutBack)*(1-sm(pw,pw+.4,t)),151);
  // "guess": two ways past him, left and right, dashed; "which way": the way he went, solid
  const[dx,dz]=posOf(PD,D_DF,-.3),gW=sm(gs-.15,gs+.35,t,easeOut)*(1-sm(ww+.1,ww+.5,t));
  if(gW>.02){const bx=ballD(-.3);groundTrail(s,c,[[bx[0],bx[2]],[dx-.8,dz+1.4],[dx+.8,dz+2.4],[dx+3,dz+2.6]],.2,R,{progress:gW,dashed:true,seed:153});groundTrail(s,c,[[bx[0],bx[2]],[dx-.8,dz-1.4],[dx+.8,dz-2.4],[dx+3,dz-2.6]],.2,Y,{progress:gW,dashed:true,seed:155});}
  groundTrail(s,c,ballPath('D',.3,2.4,12),.12,Y,{progress:sm(ww-.1,wg+.4,t,easeOut),cov:.95*(1-sm(E-.5,E-.15,t)),seed:157});
  const w=drawWorld(s,c,'D',tau,tp,{ballMin:8,hero:true});
  const hero=w.res.get(D_PL);
  if(hero){
   // "both feet": the right boot and the left boot, one after the other
   bootRing(s,hero.joints.rToe,hero.joints.rAn,R,sm(bf-.15,bf+.2,t,easeOutBack)*(1-sm(sd-.2,sd+.2,t)),159);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(bf+.15,bf+.5,t,easeOutBack)*(1-sm(sd-.2,sd+.2,t)),161);
   // "which way": the right touch sells it, the left takes it
   bootRing(s,hero.joints.rToe,hero.joints.rAn,R,bump(ww-.3,ww+.5,t),163);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,bump(ww+.4,wg+.3,t),165);}
  // "so defenders": a red ring round the defender; he leans the wrong way
  const df=w.res.get(D_DF);if(df)bodyRing(s,df,R,sm(sd-.15,sd+.25,t,easeOutBack)*(1-sm(gs+.4,gs+.8,t)),167);},
 aperture(t){const c=cam4(t),p=ballD(tau4(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:4,
};

const story:RisoStory={
 id:'cherki-signature',format:'11v11',title:'Cherki: the two-footed playmaker, 2025',
 theme:'Two feet: practise with both feet so defenders can\'t guess which way you will go.',
 ageNote:'Rayan Cherki\'s first game for France: Nations League semi-final, Spain 5–4 France, MHPArena, Stuttgart, 5 June 2025. On as a substitute at 1–4, he volleyed in the 5–2 on 79 minutes and crossed for Kolo Muani\'s header for 5–4. Spain held on. Cherki was 21.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a floodlight flash and the ball pops up off the point, like his first touch. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
