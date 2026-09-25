/** Iconic-play film (signature): "the forward who is everywhere" — Alfredo Di Stéfano's third goal in the 1960 European Cup final,
 * Eintracht Frankfurt 3–7 Real Madrid, Hampden Park, Glasgow, Wednesday 18 May 1960, 73rd minute, 6–2 → 7–2.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Di Stéfano a signature, not a match ("Signature: the forward who is everywhere",
 * interception_counter, centre; lesson "Help your team all over the pitch: even strikers win the ball back"). The sources describe the
 * trait (a self-described "withdrawn striker" who "played everywhere and did everything"; Herrera: "the entire orchestra"; the NYT obituary:
 * "agile, tireless and versatile"; McIlvanney's report the morning after: "the unflagging generalship of Di Stefano") and the 1960 final is
 * his most celebrated night (a hat-trick in "one of the greatest football matches ever played"). His third goal is the one whose context
 * the sources pin down: it came ONE MINUTE after Frankfurt had pulled one back (Stein 72', Di Stéfano 73') — the centre forward answering
 * straight away from deep. No written source we could read describes the goal's build-up move by move, so the move is drawn as the
 * signature (he drops deep for the ball, carries it forward himself and finishes it), and the narration only states what is confirmed
 * plus the trait ("This is how he played"), never the unconfirmed details.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/di-stefano-signature/script.json. The voice is generated later by the lead (local Kokoro). Until
 * then every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter
 * seconds, so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/di-stefano-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/di-stefano-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/; written accounts only, we cannot watch the footage):
 *  - Wikipedia, "1960 European Cup final" (raw wikitext: football box citing UEFA's match report, kit boxes, line-ups, attendance citing
 *    Sid Lowe, The Guardian 2020)  https://en.wikipedia.org/wiki/1960_European_Cup_final
 *  - de.wikipedia, "Finale des Europapokals der Landesmeister 1960" (match account: Frankfurt ahead 18', Di Stéfano 27' and 30', Puskás
 *    3–1 before half-time and 56'–71', Stein 72' for 6–2, "Di Stéfano gelang eine Minute später das 7:2", Stein 7–3; few fouls)
 *  - UEFA.com archive, "1959/60: Dazzling Madrid crush Frankfurt" (goal times: Di Stéfano 27 30 73, Puskás 46 56p 60 71, Kress 18,
 *    Stein 72 75)  https://web.archive.org/web/20100225114810/http://www.uefa.com/uefachampionsleague/history/season=1959/index.html
 *  - The Guardian, Sid Lowe, "'We marked an era' – 60 years on from when Real won 7–3 at Hampden" (18 May 2020): Di Stéfano "described
 *    himself as a 'withdrawn striker' and he played everywhere and did everything"; Herrera's "the entire orchestra"; the photo caption
 *    "leaves … Egon Loy begging for help after getting a hat-trick"
 *  - The Guardian, Frank Keating, "Hampden dazzled by white magic" (15 May 2002): "a warm, windblown night in Glasgow's antique and
 *    splintery stadium"; "the team clad all in white"; Wolstenholme on "the wind whistling through the grandstands of that great Glasgow
 *    canyon and … the terribly bumpy pitch"; McIlvanney: "the unflagging generalship of Di Stefano"
 *  - Wikipedia, "Alfredo Di Stéfano" (NYT obituary "agile, tireless and versatile"; "his ability to play any position … and stamina")
 * CONFIRMED by those accounts: Wednesday 18 May 1960, kick-off 19:30 BST, Hampden Park, Glasgow; 127,621 (Wikipedia/Guardian; de.wiki
 *  135,000); referee Jack Mowat (Scotland); ~70 million watched on television (BBC, Wolstenholme commentating); Frankfurt led 1–0 (Kress
 *  18'), Di Stéfano 27' and 30', Puskás 45+1', 56' pen, 60', 71'; STEIN 72' (6–2) and DI STÉFANO ONE MINUTE LATER, 73' (7–2) — his third
 *  goal, a hat-trick — then Stein 75', 7–3; Real's fifth European Cup in a row. KITS: Real Madrid ALL WHITE (shirts, shorts, socks —
 *  kit box and Keating); Eintracht Frankfurt RED shirts with WHITE sleeves and a white collar, red shorts, red socks (Wikipedia kit box).
 *  Numbers: Di Stéfano 9 (centre forward), Puskás 10, Del Sol 8, Canário 7, Gento 11, Zárraga 6 (captain), Vidal 4, Santamaría 5,
 *  Marquitos 2, Pachín 3, Domínguez 1; Loy 1, Lutz 2, Höfer 3, Weilbächer 4 (captain), Eigenbrodt 5, Stinka 6, Kress 7, Lindner 8,
 *  Stein 9, Pfaff 10, Meier 11. Di Stéfano was 33.
 * INFERRED / ILLUSTRATIVE: the whole build-up and finish of the 73rd-minute goal (drawn as: Real kick off after Stein's goal, Di Stéfano
 *  taps it to Puskás, drops five metres into his own half, takes Puskás's pass back, carries it down the middle past Weilbächer and scores
 *  low with his right foot from about 23 m, to Loy's right, Loy diving) — every position, run, touch and timing; his kicking foot; which end
 *  of Hampden and the direction of play on screen; the other players' positions; the red shirts drawn with red sleeves and white trim (the
 *  figure library has no separate sleeve ink; the kit box's white sleeves are not shown); long sleeves; the keepers' dark jerseys and the
 *  referee's black; the tan leather ball; Di Stéfano's thinning fair hair; the evening light at ~20:50 BST; Hampden as drawn (a huge oval
 *  bowl of open terracing with crush barriers, covered stands along both sides, a grass surround); the crowd's colours and flashbulbs; the
 *  celebrations. The lesson chapter's "everywhere" map (three ghosted Di Stéfanos in defence, midfield and attack) and its win-the-ball-
 *  back demonstration against a red No. 10 are a TEACHING DIAGRAM, not match footage — the narration presents them as "your turn". The
 *  newsreel scratches and vignette are a style choice (1960 was seen on black-and-white TV and newsreel).
 *
 * STRUCTURE (a 1:1 recreation of the broadcast as far as the sources go, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 Di Stéfano's first touch): ch1 = the high main-stand broadcast camera, near real time (the
 * great Hampden bowl, Frankfurt celebrating their goal, the kick-off, the drop deep, the run, the finish, the net, the hat-trick); ch2 = the
 * TV slow-motion replay from a low camera circling him (the centre forward, the drop deep, the carry, the finish of the move he started);
 * ch3 = the lesson (a wide gantry view with his three "everywhere" zones, then a swoop down to pitch level: a striker wins the ball back).
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (grass with blue, evening light, the ball, teaching
 * marks), red (Frankfurt, skin, arrows), blue (grass, sky), navy (key line, terraces, crowd, newsreel grain).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,solve,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`di stefano film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/di-stefano-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Hampden, 1960','Glasgow, 1960, European Cup final. Real Madrid, in white, against Eintracht Frankfurt, who have just scored. A minute later, Alfredo Di Stéfano gets the ball and off he goes. He runs and runs... and scores! His third goal!',
  ['Glasgow','European Cup final','Real Madrid','in white','Eintracht Frankfurt','have just scored','A minute later','Alfredo Di Stéfano','gets the ball','off he goes','runs and runs','scores','His third goal']),
 prov('Everywhere','Watch again, slowly. This is how he played: the centre forward drops deep for the ball, carries it forward himself and finishes the move he started.',
  ['Watch again','slowly','how he played','the centre forward','drops deep','carries it forward','himself','finishes the move','he started']),
 prov('Your turn','People said he played everywhere. Your turn: help your team all over the pitch. Even strikers win the ball back!',
  ['People said','played everywhere','Your turn','help your team','all over the pitch','Even strikers','win the ball back']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`di stefano film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Real attack is at x = 0, the pitch runs to x = −105) =================
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
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Hampden Park, 18 May 1960, ~20:50 BST: "that great Glasgow canyon" — a vast oval bowl of open terracing =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.4),y,(44+d)*Math.sign(s)*Math.pow(Math.abs(s),.4)];}
/** the terracing: from the pitch-side wall up a long slope, b ∈ [0,1] */
const TER=(b:number):[number,number]=>[1.5+36*b,1+21*b];
type Bowl={ter:V3[][];wall:V3[][];roof:V3[][];fascia:V3[][];rows:{P:V3;h:number}[];barriers:V3[][];top:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={ter:[],wall:[],roof:[],fascia:[],rows:[],barriers:[[],[]],top:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,m=(i+.5)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[t0,h0]=TER(0),[t1,h1]=TER(1);o.ter.push(Q(t0,h0,t1,h1));o.wall.push(Q(t1,h1,t1,h1+2.2));
  // covered stands along both long sides (inferred): a roof over the upper terracing
  const mp=rim(m,0,0);if(Math.abs(mp[0]-CX)<46&&Math.abs(mp[2])>40){o.roof.push(Q(14,17.8,38,23.6));o.fascia.push(Q(14,16.9,14,17.9));}
  for(let r=0;r<12;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,23);if(h<.1)continue;const[d,y]=TER((r+.5)/12);o.rows.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}
  for(const[j,bb] of[[0,.34],[1,.68]] as[number,number][]){const[d,y]=TER(bb);o.barriers[j].push(rim(a,d,y+1));}
  o.top.push(rim(a,t1,h1+2.2));}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number;canyon?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0,canyon=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // "a warm, windblown night": a pale evening sky, warm low down (yellow), cooler overhead (blue)
 s.field(B,.3,.6);
 const hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(Y,polyPath([[-Bnd,hz-520],[Bnd,hz-470],[Bnd,Bnd],[-Bnd,Bnd]],true),.22);
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-760],[-Bnd,hz-700]],true),.25);
 const ter=new Path2D(),wall=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.ter[i],ter);ad(BOWL.wall[i],wall);}
 for(let i=0;i<BOWL.roof.length;i++){const r=quadP(c,BOWL.roof[i]);if(r)roof.addPath(polyPath(r,true));const f=quadP(c,BOWL.fascia[i]);if(f)fas.addPath(polyPath(f,true));}
 s.knockout(ter);s.tone(K,ter,.42);s.tone(B,ter,.2);
 s.knockout(wall);s.fill(K,wall,.7);
 // the crowd: 127,621 — one mark per group on the terraces (white faces and shirts / red rosettes / blue / dark coats and caps)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.rows){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.42?0:q.h<.48?1:q.h<.64?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.72);s.fill(R,inks[1],.8);s.fill(B,inks[2],.8);s.fill(K,inks[3],.78);}
 // crush barriers: two long lines round the terracing
 const bar=new Path2D();for(const ring of BOWL.barriers){let on=false;for(const p of ring){if(depthOf(c,p)<16){on=false;continue;}const q=P(c,p);if(!inV(q)){on=false;continue;}if(on)bar.lineTo(q[0],q[1]);else bar.moveTo(q[0],q[1]);on=true;}}
 s.stroke(K,bar,2.4,.5);
 s.knockout(roof);s.fill(K,roof,.86);
 s.knockout(fas);s.tone(K,fas,.3);
 // "that great Glasgow canyon": the lip of the bowl traced in evening light
 if(canyon>.02){const lip=new Path2D();let on=false;for(const p of[...BOWL.top,BOWL.top[0]]){if(depthOf(c,p)<16){on=false;continue;}const q=P(c,p);if(on)lip.lineTo(q[0],q[1]);else lip.moveTo(q[0],q[1]);on=true;}s.stroke(Y,lip,9,.95*canyon);}
 // photographers' flashbulbs round the ground after the goal
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.rows[Math.floor(r()*BOWL.rows.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** the pitch: a grass surround (inferred), the bumpy grass (yellow × blue), faint stripes, paper lines, both goals; `half` lights the
 * halfway line, `lines` lights every line of the pitch */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;half?:number;lines?:number;circle?:number}={}){
 const sr=new Path2D();addPoly(sr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.5,0))));s.knockout(sr);s.fill(Y,sr,.62);s.tone(B,sr,.7);s.tone(K,sr,.18);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-38],[4,0,-38],[4,0,38],[-109,0,38]]));s.knockout(gp);s.fill(Y,gp,.82);s.tone(B,gp,.64);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.14);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 if(o.lines&&o.lines>.02)s.fill(Y,lines,.95*o.lines);
 if(o.half&&o.half>.02){const h=new Path2D();groundLine(h,c,[-52.5,-34],[-52.5,34],.5);s.fill(Y,h,.95*o.half);}
 if(o.circle&&o.circle>.02){const h=new Path2D();let prev:[number,number]|null=null;for(let i=0;i<=28;i++){const a=i/28*TAU,p:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)groundLine(h,c,prev,p,.45);prev=p;}s.fill(Y,h,.95*o.circle);}
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a 1960 goal on the line x = X, net 2 m deep toward dir: square posts, a box net on stanchions; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** 1960 newsreel / black-and-white TV: a soft dark vignette, a flicker of vertical scratches and dust (seeded per twelfth of a second) */
function reel(s:Sheet,t:number,w=1){
 if(w<=.02)return;const W=s.W,H=s.H,fr=Math.floor(t*12),r=rng(6000+fr);
 const v=new Path2D();v.rect(-W,-H,W*2,H*2);v.addPath(polyPath(Array.from({length:32},(_,i)=>{const a=i/32*TAU,c=Math.cos(a),sn=Math.sin(a);return[Math.sign(c)*Math.pow(Math.abs(c),.55)*W*.5,Math.sign(sn)*Math.pow(Math.abs(sn),.55)*H*.5] as Pt;}),true));
 s.tone(K,v,.32*w,undefined,'evenodd');
 const sc=new Path2D();for(let i=0;i<2;i++){if(r()<.35)continue;const x=(r()-.5)*W*.9,y0=-H*.6+r()*H*.3;sc.addPath(ribbon([[x,y0],[x+(r()-.5)*8,y0+H*(.5+r()*.6)]],1.6+r()*1.6,{seed:fr+i,taper:.2,wobble:1}));}
 s.stroke(K,sc,1.2,.55*w);
 const dust=new Path2D();for(let i=0;i<3;i++){const x=(r()-.5)*W,y=(r()-.5)*H,z=2+r()*4;dust.rect(x,y,z,z*(.6+r()));}s.knockout(dust,.8*w);
}

// ================= the tan leather ball of 1960 (yellow × red leather, navy panel seams) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,.85);s.tone(R,disc,.3);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (18 May 1960) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_TAN:AthleteStyle['skin']=[[R,.28],[Y,.55]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
/** Real Madrid: all white — shirts, shorts, socks (confirmed); long sleeves and navy numbers inferred */
const RM=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:[K,.9],...o});
/** Eintracht Frankfurt: red shirts with a white collar, red shorts, red socks (confirmed; the kit box's white sleeves cannot be drawn) */
const EF=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.4],sleeves:'long',numberInk:'paper',...o});
/** Di Stéfano: No. 9, 33 years old, "la Saeta Rubia" — thinning fair hair (inferred), 1.78 m */
const DISTEFANO:AthleteStyle=RM({number:9,hairStyle:'balding',hair:[Y,.9],build:{height:1.78,bulk:1,thighs:1.06},seed:9});
const LOY:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.7],boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.8},seed:1};
const DOMINGUEZ:AthleteStyle={shirt:[K,.55],shorts:[K,.9],socks:[K,.55],boots:K,skin:SKIN_TAN,hair:K,line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',seed:31};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'long',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Di Stéfano's first touch after the kick-off) =================
type TK=[number,number,number];// τ, x, z
type Role='ds'|'rm'|'ef'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const KO=-3.4,PUS_IN=-3,PUS_PASS=-1.5,SHOT=5;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). Real attack toward x = 0. */
const ACTORS:Actor[]=[
 {name:'Di Stéfano',role:'ds',style:DISTEFANO,key:true,keys:[[-12,-52.8,.7],[-4.2,-52.8,.7],[KO,-52.75,.62],[-2.8,-53.4,1],[-2,-54.6,1.6],[-1,-55.8,2.1],[-.4,-56.3,2.3],[0,-56.5,2.3],[.4,-55,2.1],[.9,-52.3,1.8],[1.4,-49,1.5],[1.9,-45.6,1.1],[2.4,-42.1,.5],[2.8,-39.4,-.2],[3.2,-36.6,-.5],[3.6,-33.6,-.2],[4,-30.5,.3],[4.4,-27.5,.5],[4.75,-25,.5],[SHOT,-23.3,.4],[5.5,-20.5,.4],[6.3,-18.3,1],[7.5,-16.7,2.4],[9,-15.7,3.6],[12,-15.1,4.2]]},
 {name:'Loy',role:'gk',style:LOY,key:true,keys:[[-12,-3,0],[0,-3.4,.2],[4,-4.1,.1],[SHOT,-4.3,0],[12,-4.3,0]]},
 {name:'Weilbächer',role:'ef',style:EF({number:4,seed:44,hair:[K,.8]}),key:true,keys:[[-12,-40,-4],[KO,-41,-1],[0,-43,1.6],[1.6,-43.4,2.3],[2.4,-42.6,2],[2.8,-41.8,1.5],[3.4,-41,1],[4.4,-37.5,.8],[SHOT,-33,.6],[12,-26,.4]]},
 {name:'Eigenbrodt',role:'ef',style:EF({number:5,seed:45,build:{height:1.84}}),key:true,keys:[[-12,-30,0],[KO,-31,.5],[0,-30,.6],[3,-24,1],[4,-21.2,1.3],[4.7,-21.2,1.1],[SHOT,-21.4,1],[5.6,-20.8,.8],[12,-15,1.5]]},
 {name:'Puskás',role:'rm',style:RM({number:10,seed:10,build:{height:1.72,bulk:1.12},hair:K}),key:true,keys:[[-12,-52.9,-2.6],[KO,-52.9,-2.5],[-3.2,-52.3,-2.2],[PUS_IN,-52.05,-2.1],[PUS_PASS,-51.75,-2.1],[-.5,-51,-3],[1,-48.5,-5],[SHOT,-36,-6],[12,-28,-5]]},
 {name:'Stein',role:'ef',style:EF({number:9,seed:49}),key:true,keys:[[-12,-58.5,-3.5],[-9,-55,-3.8],[KO,-49.5,-4.5],[0,-47.5,-4],[SHOT,-42,-2],[12,-36,-1]]},
 {name:'Del Sol',role:'rm',style:RM({number:8,seed:8,hair:K}),keys:[[-12,-55,5],[KO,-54,6],[0,-52,10],[2,-46,13.5],[SHOT,-33,11],[12,-24,7]]},
 {name:'Canário',role:'rm',style:RM({number:7,seed:7,skin:SKIN_DARK,hair:K}),keys:[[-12,-55,22],[0,-50,22],[SHOT,-30,17],[12,-20,12]]},
 {name:'Gento',role:'rm',style:RM({number:11,seed:11,hair:K}),keys:[[-12,-55,-22],[0,-49,-22],[SHOT,-27,-16],[12,-18,-11]]},
 {name:'Zárraga',role:'rm',style:RM({number:6,seed:6,hair:K}),keys:[[-12,-62,-9],[0,-58,-8],[SHOT,-46,-5],[12,-40,-4]]},
 {name:'Vidal',role:'rm',style:RM({number:4,seed:4,hair:K}),keys:[[-12,-62,9],[0,-58,8],[SHOT,-48,6],[12,-42,5]]},
 {name:'Santamaría',role:'rm',style:RM({number:5,seed:5,hair:K,skin:SKIN_TAN}),keys:[[-12,-74,0],[SHOT,-64,0],[12,-60,0]]},
 {name:'Marquitos',role:'rm',style:RM({number:2,seed:2,hair:K}),keys:[[-12,-74,16],[SHOT,-64,13],[12,-60,12]]},
 {name:'Pachín',role:'rm',style:RM({number:3,seed:3,hair:K}),keys:[[-12,-74,-16],[SHOT,-64,-13],[12,-60,-12]]},
 {name:'Domínguez',role:'gk',style:DOMINGUEZ,keys:[[-12,-99,0],[12,-94,0]]},
 {name:'Lindner',role:'ef',style:EF({number:8,seed:48}),keys:[[-12,-55,-9],[KO,-47,-10],[0,-45,-9],[SHOT,-37,-6],[12,-30,-4]]},
 {name:'Pfaff',role:'ef',style:EF({number:10,seed:50,hairStyle:'balding',hair:[K,.7]}),keys:[[-12,-54,9],[KO,-47,12],[0,-45.5,15],[SHOT,-37,12],[12,-30,8]]},
 {name:'Kress',role:'ef',style:EF({number:7,seed:47}),keys:[[-12,-57,-20],[KO,-48,-21],[0,-46,-20],[SHOT,-38,-15],[12,-30,-12]]},
 {name:'Meier',role:'ef',style:EF({number:11,seed:51}),keys:[[-12,-57,21],[KO,-48,22],[0,-46,21],[SHOT,-38,15],[12,-30,12]]},
 {name:'Stinka',role:'ef',style:EF({number:6,seed:46}),keys:[[-12,-38,10],[KO,-40,11],[0,-42,12.5],[3,-38,12],[SHOT,-30,8],[12,-24,5]]},
 {name:'Lutz',role:'ef',style:EF({number:2,seed:42}),keys:[[-12,-26,-14],[0,-26,-11],[SHOT,-18,-6.5],[12,-12,-5]]},
 {name:'Höfer',role:'ef',style:EF({number:3,seed:43}),keys:[[-12,-26,14],[0,-26,11],[SHOT,-18,6.5],[12,-12,5]]},
 {name:'Mowat',role:'ref',style:REF,keys:[[-12,-47,12],[0,-45,11],[SHOT,-32,10],[12,-24,9]]},
];
const DS=0,GKI=1,WEIL=2,EIG=3,PUS=4,STEIN=5,DELSOL=6;
const REAL=ACTORS.map((a,k)=>a.role==='ds'||a.role==='rm'?k:-1).filter(k=>k>=0),FRANK=ACTORS.map((a,k)=>a.role==='ef'?k:-1).filter(k=>k>=0);
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
type Table={X:number[];Z:number[];D:number[]};
function tables(list:TK[][],ta:number,tb:number,dt:number):Table[]{return list.map(keys=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(tb-ta)/dt;i++){const[x,z]=herm(keys,ta+i*dt);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});}
const TA=-12,TB=12,DT=.02;
const TABLES=tables(ACTORS.map(a=>a.keys),TA,TB,DT);
const samp=(arr:number[],tau:number,ta=TA)=>{const u=clamp((tau-ta)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
/** a ball spot just ahead of a (non-hero) player's boot, along his run */
function bootOf(k:number,tau:number,ahead=.5):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}

// ---- Di Stéfano: the kick-off tap, the drop deep, the carry down the middle, the swerve past Weilbächer, the finish (right foot, inferred) ----
const HIT:V3=[0,.32,-2.75];// where the ball crosses the line: low, to Loy's right (inferred)
const CYC=2.9,S0:V3=[-52.5,.11,0];
const A1=bootOf(PUS,PUS_IN,.45),A2=bootOf(PUS,PUS_PASS,.5);
function yawDs(tau:number){const v=velOf(DS,tau),[x,z]=posOf(DS,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):YAW(1,0),toGoal=YAW(HIT[0]-x,HIT[2]-z);
 let y=run;
 // the kick-off: face Puskás and tap it to him; then open up to watch his pass back, and turn onto it with the first touch
 y=lerpAng(y,YAW(-52.05-x,-2.1-z),1-sm(KO+.2,KO+.9,tau));
 y=lerpAng(y,YAW(A2[0]-x,A2[2]-z),sm(PUS_PASS-.8,PUS_PASS-.1,tau)*(1-sm(-.1,.4,tau)));
 return lerpAng(y,toGoal,sm(SHOT-.8,SHOT-.35,tau)*(1-sm(SHOT+.7,SHOT+1.3,tau)));}
/** the ball spot at his boot: ahead and a touch to the side of that foot */
function footAt(tau:number,foot:'l'|'r',ahead=.5):[number,number]{const p=posOf(DS,tau),y=yawDs(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=foot==='r'?.1:-.12;return[p[0]+fx*ahead+rx*sd,p[1]+fz*ahead+rz*sd];}
/** the swerve past Weilbächer: weight and shoulders thrown to his left, away from the challenge */
const SWERVE:Partial<Pose>={roll:-13,bend:-15,lean:20,twist:12,lShA:52,rShA:30,neckY:8,squash:-.05};
const SW=[2.3,3.3] as const;
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a pass: the strike blended in round its contact time */
function passAt(p:Pose,tau:number,at:number,power:number,D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot:'r',power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
const SD=1.05,S_ST=SHOT-STRIKE_CONTACT*SD;
function dsPose(tau:number):Pose{
 const v=velOf(DS,tau),sp=Math.hypot(v[0],v[1]);let p:Pose;
 if(tau<-.3){const s=clamp((sp-2)/5);p=blendPose(stand(),runCycle(distOf(DS,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
  p=passAt(p,tau,KO,.12,.8);
  p=over(p,{neckP:22,neckY:-10,lShA:30},bump(PUS_PASS-.8,0,tau));}// eyes on Puskás' pass back
 else{const s=clamp((sp-2)/4.5),dr=dribble(distOf(DS,tau)/CYC,{foot:'r',speed:.5+.45*s});p=blendPose(stand(),dr,clamp((sp-.3)/.8));
  p=over(p,{neckP:2,lean:10},bump(.9,2.1,tau)*.6);// head up: he looks at the goal between touches
  p=over(p,{neckP:4,lean:8},bump(3.4,4.4,tau)*.6);}
 p=over(p,SWERVE,bump(SW[0],SW[1],tau));
 const u=(tau-S_ST)/SD;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'r',power:.9}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>SHOT+1.1)p=blendPose(p,celebrate((tau-SHOT-1.1)*1.1,{kind:'arms'}),sm(SHOT+1.1,SHOT+1.6,tau));
 return p;}
/** the strike point: his right boot at contact (from the solved skeleton), a touch ahead of the toe, on the grass */
const M:V3=(()=>{const[x,z]=posOf(DS,SHOT),y=yawDs(SHOT),sk=solve(dsPose(SHOT),DISTEFANO.build,{x,z,yaw:y});return[sk.rToe[0]+Math.cos(y)*.1,.11,sk.rToe[2]-Math.sin(y)*.1];})();
/** his touches: one per dribble stride (right foot) from the first touch until the last one before the strike */
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(DS,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.75;tau+=DT){const ph=distOf(DS,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3)out.push(tau);prev=ph;}
 return out;})();
const TP:V3[]=TOUCHES.map(t=>{const[x,z]=footAt(t,'r');return[x,.11,z];});

// ---- the ball: on the spot, the kick-off tap to Puskás, his pass back, the carry, the low shot, the net ----
const FL=Math.hypot(HIT[0]-M[0],HIT[2]-M[2])/25,IN_NET=SHOT+FL,BACKT=IN_NET+.1,BACK:V3=[1.9,.28,-2.6],REST:V3=[1.3,.11,-2.1];
const G0=9.81,VY=(HIT[1]-M[1]+.5*G0*FL*FL)/FL;
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
function ballAt(tau:number):V3{
 if(tau<KO)return S0;
 if(tau<PUS_IN)return roll(S0,A1,(tau-KO)/(PUS_IN-KO));
 if(tau<PUS_PASS)return mix3(A1,A2,easeOut((tau-PUS_IN)/(PUS_PASS-PUS_IN)));
 if(tau<0)return roll(A2,TP[0],(tau-PUS_PASS)/-PUS_PASS);
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const a=TP[k],b=k+1<TOUCHES.length?TP[k+1]:M,t1=k+1<TOUCHES.length?TOUCHES[k+1]:SHOT,u=(tau-TOUCHES[k])/(t1-TOUCHES[k]),e=k+1<TOUCHES.length?1-(1-u)*(1-u):u*(1.4-.4*u);return mix3(a,b,e);}
 if(tau<IN_NET){const s=tau-SHOT;return[lerp(M[0],HIT[0],s/FL),M[1]+VY*s-.5*G0*s*s,lerp(M[2],HIT[2],s/FL)];}
 if(tau<BACKT)return mix3(HIT,BACK,(tau-IN_NET)/(BACKT-IN_NET));
 const u=clamp((tau-BACKT)/.8);return[lerp(BACK[0],REST[0],easeOut(u)),lerp(BACK[1],.11,Math.min(1,u*1.6)),lerp(BACK[2],REST[2],u)];
}
const NET_HIT:V3=[2,.35,-2.7];

// ---- everyone else ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DIVE_T=SHOT+.12,DIVE_D=1.05;
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===DS)return{p:dsPose(tau),yaw:yawDs(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ef'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(k===GKI&&tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'r',height:.08});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:-40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 // Puskás: takes the kick-off tap and plays it back to Di Stéfano
 if(k===PUS){if(tau>KO-.3&&tau<PUS_PASS+.5)yaw=tau<PUS_IN+.3?YAW(S0[0]-x,S0[2]-z):YAW(TP[0][0]-x,TP[0][2]-z);p=passAt(p,tau,PUS_PASS,.35);}
 // Stein has just scored (72'): arms up as Frankfurt run back to their half
 if(k===STEIN&&tau<-7.6)p=blendPose(p,celebrate((tau+12)*1.1,{kind:'arms'}),1-sm(-8.6,-7.6,tau));
 // the two who try to stop him: each turns to face him and jabs a leg, too late
 if(k===WEIL||k===EIG){const[cx,cz]=posOf(DS,tau),at=k===WEIL?2.75:SHOT+.08;if(tau>at-1.4&&tau<at+.6)yaw=lerpAng(yaw,YAW(cx-x,cz-z),Math.min(sm(at-1.4,at-1,tau),1-sm(at+.2,at+.6,tau)));
  const t0=at-.6*.8,u=(tau-t0)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(tau>IN_NET+.4&&(k===PUS||k===DELSOL||ACTORS[k].name==='Canário'||ACTORS[k].name==='Gento'))p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Di Stéfano with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<(k===DS?1:3.5))return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===DS?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===DS||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===DS}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.trail&&tau>SHOT&&tau<IN_NET+.05){const back=P(c,ballAt(Math.max(SHOT,tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
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
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** the ball's flight (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;dashed?:boolean;seed?:number;head?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,dashed=false,seed=81,head=true}=o;if(progress<=.01)return;
 const n=14,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=ballAt(t0+(t1-t0)*i/n),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.06;x<.95;x+=.12)gaps.push([x,x+.06]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.6,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.6,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** a ring on the grass (centre, radii in metres) */
function ringPath(c:Camera,cx:number,cz:number,rx:number,rz:number):Pt[]|null{const pts:Pt[]=[];for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];if(depthOf(c,g)<NEAR+.2)return null;pts.push(P(c,g));}return pts;}
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts=ringPath(c,cx,cz,rx,rz);if(!pts)return;const w=Math.max(5,c.F*wm/Math.max(1,depthOf(c,[cx,0,cz])));
 s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** small rings under a whole team at once (one path, two plate ops) */
function teamRings(s:Sheet,c:Camera,team:number[],tau:number,ink:string,cov:number,seed:number){
 if(cov<=.02)return;const knock=new Path2D(),inkP=new Path2D();
 for(const k of team){const[x,z]=posOf(k,tau),pts=ringPath(c,x,z,1.1,1.1);if(!pts)continue;const w=Math.max(4,c.F*.12/Math.max(1,depthOf(c,[x,0,z])));knock.addPath(ribbon(pts,w*1.7,{close:true,seed:seed+k,taper:0,wobble:.8}));inkP.addPath(ribbon(pts,w,{close:true,seed:seed+k,taper:0,wobble:.8}));}
 s.knockout(knock,.8*cov);s.fill(ink,inkP,cov);}
/** a screen-space ring round a joint pair (a boot), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 s.knockout(ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);
 s.fill(ink,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number,seed=143){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(40,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed,taper:0,wobble:.8}),.95*w);}
/** "his third goal": three leather balls pop up over his head, one after another */
function hatTrick(s:Sheet,hero:DrawResult,age:number,fade:number){if(age<=0||fade<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,tall=Math.max(60,Math.abs(f[1]-h[1])),r=clamp(tall*.3,40,64);
 for(let i=0;i<3;i++){const g=easeOutBack(clamp((age-i*.28)/.3))*fade;if(g<=.02)continue;const x=h[0]+(i-1)*r*2.7,y=h[1]-tall*.32-r*1.6-(i===1?r*.6:0);
  s.knockout(polyPath(Array.from({length:20},(_,j)=>[x+Math.cos(j/20*TAU)*r*1.35*g,y+Math.sin(j/20*TAU)*r*1.35*g] as Pt),true),.8);ball(s,x,y,r*g,i*1.3,{});}}
/** the goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}

// ================= chapter 1 (live, near real time): the high main-stand camera; the bowl, the kick-off, the drop, the run, the goal =================
const tau1=(t:number)=>{const hj=T(0,'have just scored'),am=T(0,'A minute later'),ad=T(0,'Alfredo Di Stéfano'),gb=T(0,'gets the ball'),og=T(0,'off he goes'),rr=T(0,'runs and runs'),sc=T(0,'scores'),tg=T(0,'His third goal'),E=SEC(0);
 return key(t,mono([[0,-11.6],[hj,-9],[am+.3,KO],[ad+.35,-1.2],[gb+.3,0],[og+.2,1.1],[rr+.1,2.3],[sc,SHOT],[tg+.1,IN_NET+.3],[E+1,IN_NET+.3+(E+.9-tg)]]),linear);};
const CAM1:V3=[-44,22,66];
function look1(tau:number):V3{const b=ballAt(tau),[cx,cz]=posOf(DS,tau);
 if(tau<0)return[lerp(b[0],-53,.4),1,lerp(b[2],0,.4)*.7];
 if(tau<IN_NET){const u=sm(SHOT-1,SHOT+.3,tau);return[lerp(lerp(b[0],cx,.3)+1.5,lerp(b[0],-8,.3),u),1,lerp(b[2],0,.3)*.7];}
 return mix3([-6,1.2,-1],[cx+1,1.4,cz*.8],sm(IN_NET+.1,IN_NET+1,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const gl=T(0,'Glasgow'),rm=T(0,'Real Madrid');
 // wide on the great bowl first ("that great Glasgow canyon"), then down onto the centre circle and the play
 const up=1-sm(rm-1.4,rm+.3,t,easeInOutSine);
 const F=key(t,mono([[0,1250],[gl+1.2,1350],[rm+.3,3900],[T(0,'have just scored'),4300],[T(0,'Alfredo Di Stéfano'),5000],[T(0,'off he goes')+.4,5400],[T(0,'scores'),5800],[T(0,'His third goal')+.4,6600],[SEC(0),6300]]),easeInOutSine);
 return cam(CAM1,mix3(look,[-52,11,-74],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,gl=T(0,'Glasgow'),ec=T(0,'European Cup final'),rm=T(0,'Real Madrid'),iw=T(0,'in white'),ef=T(0,'Eintracht Frankfurt'),hj=T(0,'have just scored'),am=T(0,'A minute later'),ad=T(0,'Alfredo Di Stéfano'),og=T(0,'off he goes'),rr=T(0,'runs and runs'),tg=T(0,'His third goal');frame(s);
  stadium(s,c,{t,cheer:.1+.9*sm(0,.5,goalIn)+.35*bump(hj-.2,am,t),flash:.12+1.2*sm(0,.4,goalIn),canyon:sm(gl-.1,gl+.4,t)*(1-sm(ec+.4,rm-.4,t))});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,circle:sm(ec-.1,ec+.5,t)*(1-sm(rm+.2,rm+.8,t))+sm(am-.2,am+.2,t)*(1-sm(am+1,am+1.5,t)),half:sm(ad-.1,ad+.3,t)*(1-sm(og+.2,og+.8,t))});
  // "Real Madrid, in white" / "Eintracht Frankfurt": rings under each team
  teamRings(s,c,REAL,tau,Y,.95*sm(rm-.1,rm+.3,t)*(1-sm(ef-.3,ef+.1,t)),201);
  teamRings(s,c,FRANK,tau,R,.95*sm(ef-.1,ef+.3,t)*(1-sm(hj+.4,hj+.9,t)),251);
  // "runs, and runs": the line of his run down the middle, drawn behind him
  if(tau>0)groundTrail(s,c,pathOf(DS,0,Math.min(tau,SHOT),18),.45,R,{progress:1,cov:.9*sm(rr-.2,rr+.3,t)*(1-sm(tg+.6,tg+1.2,t)),head:false,seed:93});
  airTrail(s,c,SHOT,IN_NET,Y,{progress:clamp((tau-SHOT)/FL),cov:.95*(1-sm(tg+1,tg+1.5,t)),wm:.35,seed:147,head:false});
  const w=drawWorld(s,c,tau,tp,{ballMin:13,trail:1});
  const hero=w.res.get(DS),stein=w.res.get(STEIN);
  // "in white": a ring round Di Stéfano; "Alfredo Di Stéfano": again, as the kick-off is taken
  if(hero){bodyRing(s,hero,Y,sm(iw-.15,iw+.25,t,easeOutBack)*(1-sm(iw+1,iw+1.4,t)));bodyRing(s,hero,Y,sm(ad-.15,ad+.25,t,easeOutBack)*(1-sm(ad+1.2,ad+1.6,t)),144);}
  // "have just scored": a red spark over Stein, arms up
  const sa=t-hj;if(stein&&sa>-.1&&sa<.8){const h=stein.joints.head;sparkBurst(s,R,h[0],h[1],Math.max(60,kAt(c,[-55,1,-4])*1.2),{n:8,seed:95,g:easeOutBack(clamp((sa+.1)/.2))*(1-clamp((sa-.5)/.3)),width:8});}
  // "A minute later": the kick-off — a spark on the centre spot as he taps it
  const ka=tau-KO;if(ka>-.05&&ka<.4){const q=P(c,S0);sparkBurst(s,Y,q[0],q[1],kAt(c,S0)*1.6,{n:8,seed:96,g:easeOutBack(clamp((ka+.05)/.1))*(1-clamp((ka-.25)/.15)),width:7});}
  // "gets the ball": a spark as Puskás' pass reaches him
  if(tau>-.05&&tau<.35){const q=P(c,TP[0]);sparkBurst(s,Y,q[0],q[1],kAt(c,TP[0])*1.8,{n:8,seed:97,g:easeOutBack(clamp((tau+.05)/.1))*(1-clamp((tau-.2)/.15)),width:7});}
  // "scores": a spark at the boot
  const ag=tau-SHOT;if(ag>-.02&&ag<.35){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*2.2,{n:9,seed:99,g:easeOutBack(clamp(ag/.08))*(1-clamp((ag-.2)/.15)),width:8});}
  // "His third goal": three balls over his head
  if(hero)hatTrick(s,hero,t-tg,1-sm(SEC(0)-.9,SEC(0)-.4,t));
  reel(s,t);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, a low camera circling him): the centre forward, the drop deep, the carry, the finish =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,.95],[T(1,'how he played'),1.25],[T(1,'the centre forward'),1.55],[T(1,'drops deep'),1.9],[T(1,'carries it forward')+.2,2.55],[T(1,'himself')+.2,3.35],[T(1,'finishes the move')+.3,SHOT],[T(1,'he started')+.2,SHOT+.3],[E,SHOT+.55]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(DS,clamp(tau,0,SHOT+.3)),ph=key(tau,[[.9,52],[2.8,88],[SHOT,138],[SHOT+.6,146]],easeInOutSine)*D2R,Rr=key(tau,[[.9,9],[SHOT,7.2]],linear),out=sm(T(1,'he started')-.2,E,t,easeInOutSine);
 const pos:V3=[x+Math.cos(ph)*Rr,lerp(1.7,2.4,out),z+Math.sin(ph)*Rr],look:V3=[lerp(x+1.4,-9,out*.6),lerp(1,.8,out),lerp(z,z*.5,out*.6)];
 return cam(pos,look,key(t,mono([[0,1900],[T(1,'drops deep'),1750],[T(1,'finishes the move'),2150],[E,1650]]),easeInOutSine));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),hp=T(1,'how he played'),cf=T(1,'the centre forward'),dd=T(1,'drops deep'),cr=T(1,'carries it forward'),hs=T(1,'himself'),fm=T(1,'finishes the move'),st=T(1,'he started');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c,{half:sm(dd-.1,dd+.3,t)*(1-sm(cr,cr+.5,t))});
  // "drops deep": where he came from — back from the centre spot into his own half (red, dashed, with its arrowhead)
  const dw=sm(dd-.15,dd+.7,t,easeOut),dOut=1-sm(E-.8,E-.4,t);
  groundTrail(s,c,pathOf(DS,KO,0,12),.2,R,{progress:dw,cov:.95*dOut,dashed:true,seed:101});
  // "carries it forward": his line down the middle, yellow, drawn ahead of him
  groundTrail(s,c,pathOf(DS,0,SHOT,18),.2,Y,{progress:sm(cr-.15,cr+1.1,t,easeOut),cov:.95*dOut,seed:103});
  // "he started" … "finishes the move": a ring where he took the ball, a ring where he shot
  const sw=sm(st-.2,st+.3,t,easeOutBack)*dOut;groundRing(s,c,TP[0][0],TP[0][2],1.3,1.3,.08,R,.95*clamp(sw),105);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(fm-.1,fm+.2,t)*(1-sm(fm+.9,fm+1.3,t)),trail:1});
  const fw=sm(fm-.1,fm+.4,t,easeOutBack)*dOut;groundRing(s,c,M[0],M[2],1.1,1.1,.08,Y,.95*clamp(fw),107);
  const hero=w.res.get(DS);
  if(hero){
   // "how he played" / "the centre forward": rings round him — No. 9
   bodyRing(s,hero,Y,sm(hp-.15,hp+.25,t,easeOutBack)*(1-sm(cf+.9,cf+1.3,t)));
   // "himself": the ball at his boot, ringed
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(hs-.15,hs+.2,t,easeOutBack)*(1-sm(hs+.9,hs+1.3,t)),109);}
  const ag=tp-SHOT;if(ag>-.03&&ag<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*.9,{n:9,seed:113,g:easeOutBack(clamp((ag+.03)/.08))*(1-clamp((ag-.12)/.13)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:115,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
  reel(s,t,.8);},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (the lesson): his three zones from the gantry, then down to the grass — a striker wins the ball back =================
/** the "everywhere" map: three ghosted Di Stéfanos (defending, passing, shooting) and their zones (a teaching diagram, not footage) */
const ZONES:{x:number;z:number;ink:string;pose:Pose;yaw:number}[]=[
 {x:-80,z:-4,ink:R,pose:lunge(.6,{side:'r'}),yaw:Math.PI},
 {x:-41.5,z:2.2,ink:Y,pose:stand(),yaw:Math.PI},
 {x:-22,z:1,ink:Y,pose:strike(.56,{foot:'r',power:1}),yaw:0},
];
/** the demonstration on λ (seconds): Pfaff (red 10) runs at Real's goal with the ball; Di Stéfano chases back, pokes it away, takes it */
const LC=2.6;
const DEMO:TK[][]=[
 [[0,-41.5,2.2],[.6,-43,3],[LC-.4,-48.4,5.1],[LC,-49.2,5.25],[LC+.45,-50.4,5.45],[LC+.9,-51.2,5.7],[LC+1.4,-51,6],[LC+2.2,-49,6.3],[LC+4,-45,6.5]],
 [[0,-45,4.4],[LC,-49.6,4.25],[LC+.5,-50.2,4.3],[LC+1.2,-50.3,4.4],[LC+4,-50.3,4.4]],
];
const DTA=-1,DTB=8;
const DTAB=tables(DEMO,DTA,DTB,DT);
const dPos=(k:number,l:number):[number,number]=>[samp(DTAB[k].X,l,DTA),samp(DTAB[k].Z,l,DTA)];
const dDist=(k:number,l:number)=>samp(DTAB[k].D,l,DTA);
const dVel=(k:number,l:number):[number,number]=>{const a=dPos(k,l-.1),b=dPos(k,l+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
const PFAFF:AthleteStyle=EF({number:10,seed:50,hairStyle:'balding',hair:[K,.7]});
const dBoot=(k:number,l:number,ahead=.55):V3=>{const[x,z]=dPos(k,l),v=dVel(k,l),n=Math.hypot(v[0],v[1]),dx=n>.3?v[0]/n:-1,dz=n>.3?v[1]/n:0;return[x+dx*ahead,.11,z+dz*ahead];};
const POKE=dBoot(1,LC,.6),TAKE=dBoot(0,LC+.9,.5);
function dBall(l:number):V3{if(l<LC)return dBoot(1,l,.6);if(l<LC+.9)return roll(POKE,TAKE,(l-LC)/.9);return dBoot(0,l,.5);}
function dPose(k:number,l:number):{p:Pose;yaw:number}{const v=dVel(k,l),sp=Math.hypot(v[0],v[1]),[x,z]=dPos(k,l),b=dBall(l);let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);let p:Pose;
 if(k===1){const s=clamp((sp-1.5)/4);p=l<LC?blendPose(stand(),dribble(dDist(1,l)/2.6,{foot:'l',speed:.4+.4*s}),clamp((sp-.3)/.8)):blendPose(READY,runCycle(dDist(1,l)/2.4,{speed:0}),clamp((sp-.5)/.8));
  if(l>LC-.1)p=over(p,{neckP:30,neckY:-30,lean:24},sm(LC-.1,LC+.5,l));return{p,yaw};}
 const s=clamp((sp-2)/5);p=blendPose(stand(),runCycle(dDist(0,l)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 if(l>LC-.8&&l<LC+.6)yaw=lerpAng(yaw,YAW(POKE[0]-x,POKE[2]-z),bump(LC-.8,LC+.6,l));
 const u=(l-(LC-.6*.8))/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
 if(l>LC+.9){const s2=clamp((sp-1.5)/4.5);p=blendPose(p,dribble(dDist(0,l)/2.6,{foot:'r',speed:.4+.4*s2}),sm(LC+.9,LC+1.3,l));}
 return{p,yaw};}
const tau3=(t:number)=>{const E=SEC(2),yt=T(2,'Your turn'),wb=T(2,'win the ball back');return key(t,mono([[yt,0],[wb+.25,LC],[E,LC+(E-wb-.25)*.9]]),linear);};
const CAMA:V3=[-51,36,46],LOOKA:V3=[-51,0,2];
function cam3(t:number){const l=tau3(t),yt=T(2,'Your turn'),E=SEC(2),dn=sm(yt-.2,yt+1.6,t,easeInOutSine),[dx,dz]=dPos(0,l),[px,pz]=dPos(1,l),fx=lerp(dx,px,.45),fz=lerp(dz,pz,.45);
 const lookB:V3=[fx-.6,.95,fz],posB:V3=[fx+2,1.6,fz+9.5-.8*sm(T(2,'Even strikers')-.3,T(2,'win the ball back')+.2,t,easeInOutSine)];
 const F=Math.exp(lerp(Math.log(1250),Math.log(2250),dn))+100*sm(T(2,'Even strikers')-.3,E,t,easeInOutSine);
 return cam(mix3(CAMA,posB,dn),mix3(LOOKA,lookB,dn),F);}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),l=tau3(t),lp=tau3(tt),E=SEC(2),ps=T(2,'People said'),pe=T(2,'played everywhere'),yt=T(2,'Your turn'),hy=T(2,'help your team'),ao=T(2,'all over the pitch'),es=T(2,'Even strikers'),wb=T(2,'win the ball back');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c,{lines:sm(ao-.1,ao+.4,t)*(1-sm(es,es+.5,t))});
  // "played everywhere": his three zones light up in turn — defending (red), passing and shooting (yellow)
  const zOut=1-sm(yt+.6,yt+1.3,t);
  ZONES.forEach((zn,i)=>{const w=sm(pe-.1+i*.3,pe+.3+i*.3,t,easeOutBack)*zOut;groundRing(s,c,zn.x,zn.z,7,6,.6,zn.ink,.95*clamp(w),301+i);});
  // "help your team": one line joining the zones, end to end
  groundTrail(s,c,[[-80,-4],[-68,-6],[-56,-1],[-41.5,2.2],[-31,3],[-22,1]],.3,Y,{progress:sm(hy-.2,hy+.9,t,easeOut),cov:.9*(1-sm(es-.2,es+.3,t)),dashed:true,seed:311});
  // the ghosted Di Stéfanos (a multiple exposure: one man, three places) — before the camera comes down
  const items:Item[]=[];const res=new Map<number,DrawResult>();
  if(t<yt+.5&&t>ps-.2)ZONES.forEach((zn,i)=>{if(i===1&&t>yt)return;const g:V3=[zn.x,0,zn.z],d=depthOf(c,g);if(d<1)return;items.push({depth:d,draw:()=>{drawPlayer(s,zn.pose,c,{...DISTEFANO,detail:'low',seed:9+i},{x:zn.x,z:zn.z,yaw:zn.yaw});}});});
  // the demonstration: Di Stéfano (and Pfaff with the ball)
  const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr;
  for(const k of[0,1]){if(k===0&&t<yt)continue;const[x,z]=dPos(k,l),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)continue;
   items.push({depth:d,draw:()=>{const{p,yaw}=dPose(k,lp),px=kAt(c,g)*1.8*ppu,st=k===0?DISTEFANO:PFAFF,big=px>=90;
    const prev=big?{pose:dPose(k,lp-1/12).p,place:{x:dPos(k,l-1/12)[0],z:dPos(k,l-1/12)[1],yaw:dPose(k,lp-1/12).yaw}}:undefined;
    res.set(k,drawPlayer(s,p,c,{...st,detail:px<50?'low':'auto'},{x,z,yaw},{prev,smear:k===0&&l>LC-.6&&l<LC+.3}));}});}
  const b=dBall(l);items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const q=P(c,b),r=Math.max(8,BALL_R*kAt(c,b));ballShadow(s,c,b);ball(s,q[0],q[1],r,l*8,{});}});
  items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
  const hero=res.get(0);
  // "Even strikers": a ring round the No. 9
  if(hero)bodyRing(s,hero,Y,sm(es-.15,es+.25,t,easeOutBack)*(1-sm(wb-.1,wb+.3,t)));
  // "win the ball back": a spark at the poke, and the ball's new line to him (yellow)
  const pa=l-LC;if(pa>-.03&&pa<.35){const q=P(c,POKE);sparkBurst(s,Y,q[0],q[1],kAt(c,POKE)*.8,{n:9,seed:321,g:easeOutBack(clamp((pa+.03)/.08))*(1-clamp((pa-.2)/.15)),width:9});}
  if(l>LC)groundTrail(s,c,[[POKE[0],POKE[2]],[lerp(POKE[0],TAKE[0],.5),lerp(POKE[2],TAKE[2],.5)],[TAKE[0],TAKE[2]]],.1,Y,{progress:clamp((l-LC)/.9),cov:.95*(1-sm(E-.6,E-.2,t)),seed:323});
  if(hero&&l>LC-.3&&l<LC+.7)bootRing(s,hero.joints.rToe,hero.joints.rAn,R,bump(LC-.3,LC+.7,l),325);
  reel(s,t,.6);},
 still:5,
};

const story:RisoStory={
 id:'di-stefano-signature',format:'11v11',title:'Di Stéfano everywhere, 1960',
 theme:'Help your team all over the pitch: even strikers win the ball back.',
 ageNote:'European Cup final, Eintracht Frankfurt 3–7 Real Madrid, Hampden Park, Glasgow, 18 May 1960 (73rd minute, his hat-trick goal). Di Stéfano was 33.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a newsreel flash and the leather ball rockets up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
