/** Iconic-play film · João Cancelo, "Signature: the full-back playmaker" (lib/town/iconicPlays.json: kind "signature", template
 * through_ball_assist, side right; lesson "A full-back can step inside into midfield to add an extra passer").
 *
 * THE REAL MOMENT (chapters 1–2): Manchester City 2–1 Borussia Dortmund, UEFA Champions League group stage (Group G, matchday 2), Etihad
 * Stadium (City of Manchester Stadium), Manchester, Wednesday 14 September 2022, 84th minute: Cancelo, out on the LEFT, looks up and floats
 * a cross into the six-yard box with the OUTSIDE of his RIGHT foot; it drops towards the far post and Erling Haaland volleys it in, 2–1.
 * WHY THIS MOMENT: the card calls him "the full-back playmaker"; this is the best-documented Cancelo assist (UEFA's Goal of the Season
 * 2022/23 was the finish), and three written accounts describe his part of it: a full-back creating the winner with a pass only a
 * playmaker tries. HONEST FALLBACK for the lesson's move (chapters 3–4): no source I read describes Cancelo "stepping inside" in this or
 * any one logged move, although Wikipedia describes the habit in detail. So the step inside is shown as a clearly labelled DEMONSTRATION
 * ("Watch this practice"): an empty ground by day, plain navy training tops, two red bibs, cones — never passed off as this match or any
 * other, and the narration only says he played that way for City.
 *
 * SOURCES (curl + a generic UA, cached in the session scratchpad films/src-cache/; only one new fetch was needed):
 *  - The Guardian, Andy Hunter, "Erling Haaland magic denies Dortmund as Manchester City make late comeback", 14 Sep 2022
 *    https://www.theguardian.com/football/2022/sep/14/manchester-city-borussia-dortmund-champions-league-match-report
 *    (guardian-mci-bvb-2022-report.txt): "With 10 minutes remaining John Stones unleashed an emphatic ... equaliser"; "Four minutes later
 *    João Cancelo looked up from the left and floated a gorgeous cross into the six-yard box with the outside of his right foot. Three
 *    Borussia defenders and one former Dortmund forward were waiting." Hummels: "no one closes the ball down and we let a cross reach
 *    Erling Haaland"; "Haaland lifted off behind defensive substitute Nico Schlotterbeck, feet first, and with the outside of his left foot
 *    steered an acrobatic volley beyond Alexander Meyer"; Stones "stationed at right-back in the absence of Kyle Walker".
 *  - BBC Sport, Phil McNulty, "Manchester City 2-1 Borussia Dortmund", 14 Sep 2022 (bbc-mci-bvb-2022.txt): Stones' equaliser "with 10
 *    minutes left", Haaland "four minutes later ... to soar through the air and score from Joao Cancelo's cross".
 *  - UEFA.com, 2022/23 Champions League Goal of the Season (uefa-haaland-gots-2023.txt): "As Cancelo's outside-of-the-boot cross dropped
 *    towards the far post, Haaland lifted his giant frame off the ground between two defenders".
 *  - Wikipedia, "2022–23 UEFA Champions League group stage" (raw; wiki-2022-23-ucl-groups.txt): 14 Sep 2022, 21:00 CEST (20:00 local),
 *    Manchester City 2–1 Borussia Dortmund, Bellingham 56', Stones 80', Haaland 84'.
 *  - Wikipedia, "João Cancelo" (raw; wiki-joao-cancelo.txt, fetched 24 Sep 2026): right-footed ("cross with his weaker left foot"), 1.82 m;
 *    Style of play: under Guardiola he became "one of his hybrid players, who plays both at full back and in central midfield in the same
 *    game ... Cancelo moved into central midfield alongside Rodri"; "he has proved brilliant at receiving in central midfield and
 *    progressing play with daring and accurate forward passes"; "With Cancelo instead adding an extra player in midfield". Wikipedia,
 *    "2023–24 Manchester City F.C. season": Cancelo's City number was 7 (the Sep 2023 loan row).
 *  - Kits: the approved Haaland film of this same goal (lib/plays/riso/haaland-signature.ts) read them off two press photographs: City
 *    sky-blue shirts, WHITE shorts, sky-blue socks; Dortmund YELLOW shirts with black shoulder trim, BLACK shorts, yellow socks.
 * CONFIRMED: date, ground, competition, 1–1 with six minutes left (80' → 84'), Cancelo on the LEFT, looked up, floated cross, OUTSIDE of the
 *  RIGHT foot, into the six-yard box, dropping towards the far post, nobody closed him down, Haaland's flying left-foot volley behind
 *  Schlotterbeck past Meyer; the kits; Cancelo's 7 and Haaland's 9; right-footed; a night game (20:00 kick-off local) under lights.
 *  His mid-game habit of stepping from full-back into central midfield next to Rodri, adding an extra passer (Wikipedia, style of play).
 * INFERRED / ILLUSTRATIVE (kept out of the narration): Cancelo at left-back (Stones was at right-back, and he crossed "from the left");
 *  who passed to him (drawn as De Bruyne) and where from; every position, run and timing between the sourced beats (shared with the
 *  Haaland film so the two films agree); the Dortmund right-back drawn about five metres off him, too late (Hummels: nobody closed the
 *  ball down) and drawn without a number; the cross's bend (a trivela bends to the kicker's right, so it bows out towards the goal line
 *  and falls back to the far post); his beard is not drawn (the figure library has none); Meyer's red kit; the crowd; the camera angles.
 *  The whole of chapters 3–4 is a demonstration (positions, pitch, kit, the two defenders) — no match, date or opponent is implied.
 *
 * FRAMING (full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = the high main-stand broadcast camera in
 * REAL TIME: De Bruyne's pass out left, Cancelo looks up, the floated cross, Haaland's volley, the net; 2 = TV slow-motion replay from a low
 * camera on the near touchline, a long lens on Cancelo's right boot: the outside of the foot through the ball, then panning with the
 * floated cross to the far post; 3 = the demonstration from a raised side camera by day: he starts wide, steps inside next to the
 * midfielder, receives the centre-back's pass behind the presser and plays it forward; 4 = the lesson, the same practice from a raised
 * camera behind the centre-backs, with teaching marks (the path inside, the three passers against two, the lanes).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (Dortmund, floodlights, grass with blue, teaching marks), red (keeper, bibs, skin), blue (City sky blue, sky, grass,
 * shade), navy (key line, Dortmund shorts, training tops). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst} from '../../paths/riso/shapes';
import * as A from './athlete';

// ---------------- the narration (script.json mirrors it) and its provisional timing ----------------
/** `tail` = silence after the last word (the action finishes and the .65 s passage plays in it). Cue words must stay substrings, in order,
 * and none starts with a contraction or a hyphenated word (Kokoro splits them). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Level, live',text:'Manchester, 2022. City and Dortmund are level, six minutes left. João Cancelo looks up on the left and floats a cross... Haaland! Goal!',tail:2.6,
  cues:['Manchester','City and Dortmund','are level','six minutes left','João Cancelo','looks up','on the left','floats a cross','Haaland','Goal']},
 {label:'Watch his boot',text:'Watch his right boot, slowly. He hits the ball with the outside of it, and the cross floats in, dropping towards the far post.',tail:1.4,
  cues:['Watch his right boot','slowly','He hits the ball','with the outside','the cross floats in','dropping','the far post']},
 {label:'How he played',text:'How he played for City. Watch this practice: he starts wide, then steps inside, next to the midfielder. Now there is one more passer in the middle.',tail:2.2,
  cues:['How he played','Watch this practice','he starts wide','then steps inside','next to the midfielder','Now there is','one more passer','in the middle']},
 {label:'Your turn',text:'Your turn: a full-back can step inside, into midfield, to add an extra passer.',tail:2.4,
  cues:['Your turn','a full-back','step inside','into midfield','add an extra passer']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py cancelo-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/cancelo-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/cancelo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('cancelo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cancelo film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a clock can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}
const lin=(x:number)=>x;

const K='navy',R='red',Y='yellow',B='blue';
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the passage's arrival scale multiplies in). */
function frame(s:Sheet,zoom=1,rot=0,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,rot);}

// ---------------- 3D: a pinhole camera over a real-size pitch (metres; x → the goal line at 0, z → far touchline, y up) ----------------
type V3=[number,number,number];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
type Cam={p:V3;f:V3;r:V3;u:V3;F:number};
function makeCam(p:V3,look:V3,F:number):Cam{const f=nrm(sub(look,p)),r=nrm([f[2],0,-f[0]]),u:V3=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];return{p,f,r,u,F};}
const NEAR=.3;
const depthOf=(c:Cam,p:V3)=>dot(sub(p,c.p),c.f);
function P(c:Cam,p:V3):Pt{const d=sub(p,c.p),z=Math.max(NEAR,dot(d,c.f));return[c.F*dot(d,c.r)/z,-c.F*dot(d,c.u)/z];}
const kAt=(c:Cam,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Cam,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let a2=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];a2+=a[0]*b[1]-b[0]*a[1];}const r=a2<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Cam,a:[number,number],b:[number,number],w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};

// ---------------- the Etihad: at night for the match (a closed bowl of crowd under a roof ring of lights); empty and by day for the practice ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-146,74],[41,74],[41,-74],[-146,-74]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],30,OUT[j][1]],[OUT[i][0],30,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 sky blue / 2 Dortmund yellow, phase] — the away fans are a yellow block in one corner */
const CROWD=(()=>{const r=rng(2209),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){for(let i=0;i<230;i++){const c=r(),u=r(),away=st===0&&u>.8;out.push([st,u,.04+r()*.92,away?(c<.8?2:0):c<.4?0:1,r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-100;x<=0;x+=10)out.push([x,34,66]);for(let z=-56;z<=56;z+=14)out.push([34,34,z]);for(let x=-100;x<=0;x+=10)out.push([x,34,-66]);for(let z=-56;z<=56;z+=14)out.push([-139,34,z]);return out;})();
/** the practice's cones: two lines of markers along the channel he steps in from, and a gate in front of the midfield */
const CONES:[number,number][]=[[-80,33],[-72,33],[-64,33],[-56,33],[-80,-20],[-72,-20],[-64,-20],[-56,-20],[-52,4],[-52,12]];
type Stadium={cheer?:number;flash?:number;t:number;glare?:number;net?:(p:V3)=>V3;day?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t,glare=0,day=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 if(day){s.field(B,.3,.5);s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-700],[-Bnd,hz-600]],true),.25);}
 else{s.field(B,.5,.6);s.field(K,.4,.5);s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-900],[-Bnd,hz-760]],true),.3);}
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],35,ub[2]],[ua[0],35,ua[2]]]));
  const fa=mix3(q[3],q[0],.18),fb=mix3(q[2],q[1],.18);addPoly(roof,clipPoly(c,[[ua[0],35,ua[2]],[ub[0],35,ub[2]],[fb[0],34.2,fb[2]],[fa[0],34.2,fa[2]]]));});
 s.knockout(stands);
 if(day){// empty seats by day: sky-blue seat rows, navy terrace bands, no crowd, no lights
  s.tone(B,stands,.55);s.tone(K,terr,.22);s.fill(K,roof,.85);}
 else{
  s.tone(K,stands,.55);s.tone(B,stands,.18);s.tone(K,terr,.3);
  const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
  for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(col===2?.25:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
  if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(B,heads[1],.62);if(seen[2]){s.knockout(heads[2],.9);s.fill(Y,heads[2],.9);}
  if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
  s.fill(K,roof,.95);
  const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((4.8+glare*4)*k,14,420);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.3*k,6,160),h=clamp(.8*k,4,100);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.7);}
 // grass: yellow × blue = green, mow stripes across the pitch, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-40],[6,0,-40],[6,0,40],[-111,0,40]]));s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 if(day){L([-105,-20.16],[-88.5,-20.16]);L([-88.5,-20.16],[-88.5,20.16]);L([-88.5,20.16],[-105,20.16]);}
 s.knockout(lines,.95);
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);s.tone(B,boards,.35);
 if(day){// the practice's cones (red)
  const cn=new Path2D();for(const[x,z] of CONES){const g:V3=[x,0,z];if(depthOf(c,g)<2)continue;const k=kAt(c,g),[px,py]=P(c,g),w=Math.max(4,.2*k),h=Math.max(6,.32*k);cn.addPath(polyPath([[px-w,py],[px,py-h],[px+w,py]],true));}
  s.knockout(cn);s.fill(R,cn,.9);}
 goal(s,c,o.net);
}
/** the goal at x=0: halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 if(depthOf(c,[0,1,0])<2)return;
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);
 const fr=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];fr.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(fr);
}

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This world is LEFT-handed for the library (x → goal, y up, z → far touchline, a player's LEFT when he faces the goal); the library is
// right-handed. The adapter negates z both ways, so Cancelo's right boot is his right boot from every camera. Library yaw = atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.88],[R,.2]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]],SKIN_D:A.InkFill[]=[[R,.78],[K,.2]];
const LINE={line:K,boots:K,hair:K,shade:[B,.32] as A.InkFill};
/** City: sky-blue shirts with a dark trim, white shorts, sky-blue socks (the photographs) */
const SKY:A.InkFill=[B,.5];
const CITY=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:SKY,shorts:'paper',socks:SKY,trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Dortmund: yellow shirts with black (navy) shoulder trim, black shorts, yellow socks (the photographs) */
const BVB=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:11,...o});
const CB:A.Build={height:1.82};
const CANCELO:A.AthleteStyle=CITY({number:7,skin:SKIN_M,build:CB,seed:27});
const HAALAND:A.AthleteStyle=CITY({number:9,hair:[Y,.7],hairStyle:'ponytail',build:{height:1.94,bulk:1.08,thighs:1.08},seed:9});
const DEBRUYNE:A.AthleteStyle=CITY({number:17,hair:[Y,.5],build:{height:1.81},seed:17});
const KEEPER:A.AthleteStyle={...LINE,shirt:[R,.9],shorts:[R,.9],socks:[R,.9],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.9},seed:23};
const REF:A.AthleteStyle={...LINE,shirt:[K,.88],shorts:K,socks:K,skin:SKIN_L,hairStyle:'bald',hair:null,seed:17};
/** the practice: plain navy training tops (no crest, no number), Cancelo with yellow trim so he can be followed; two red bibs */
const TRAIN=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[K,.85],shorts:[K,.85],socks:'paper',trim:'paper',number:null,skin:SKIN_L,hairStyle:'short',seed:60,...o});
const BIB=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.9],shorts:'paper',socks:[R,.9],trim:'paper',number:null,skin:SKIN_L,hairStyle:'short',build:{height:1.86,bulk:1.05},seed:70,...o});
const CAN_DEMO:A.AthleteStyle=TRAIN({skin:SKIN_M,trim:Y,socks:[Y,.9],build:CB,seed:27});
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,b0:V3,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,b0),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}

// ---------------- THE MATCH as ONE simulation on a real clock τ (seconds; τ = 0 is Haaland's volley) ----------------
// Shared with the Haaland film so the two films agree; exact metres are illustrative (see INFERRED).
const G=9.81,SHOT=.24,FLY_DUR=1.3,T_CROSS=-1.6,T_PASS=-5.2,T_RECV=-3.9;
type MKey=[number,number,number];// τ, x, z
type Mover={style:A.AthleteStyle;path:MKey[]};
function moverPos(p:MKey[],tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** true gait: phase from distance covered (≈ 2.3 m a stride cycle), speed from the path; idle players turn to watch the ball */
function moverState(path:MKey[],tau:number,ball:V3,idle:()=>A.Pose=A.stand):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(path,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}

const KDB_P:MKey[]=[[-12,-34,4],[-8,-29,5],[T_PASS,-26.4,6.2],[-3,-24,6.6],[0,-18,6],[2,-15,5]];
const CAN_P:MKey[]=[[-12,-42,28],[-7,-36,27],[T_RECV,-31.5,24.8],[-2.4,-26.6,23],[T_CROSS,-24.6,22.4],[0,-23,21.6],[2,-21,21]];
const HG:[number,number]=[-3.5,-2.55];// where Haaland takes off and meets it: inside the six-yard box, just inside the far post
const HAAL_P:MKey[]=[[-12,-15,3],[-6,-11.5,2.2],[-3,-9,.8],[-1.7,-7,-.5],[-.95,-5.1,-1.7],[-.36,HG[0]-.35,HG[1]+.12],[0,HG[0],HG[1]]];
const SCH_P:MKey[]=[[-12,-12,1.2],[-4,-8.6,.6],[-1.6,-6.4,-.2],[0,-5.3,-1.0],[1.5,-4.9,-1.1]];
const KEEP_X=-1.1;
const OTHERS:Mover[]=[
 {style:BVB({number:4,build:{height:1.91,bulk:1.04},seed:4}),path:SCH_P},// Schlotterbeck
 {style:BVB({number:13,skin:SKIN_M,seed:40}),path:[[-12,-12,-7],[-3,-6,-5.2],[0,-2.5,-4.1],[2,-2.2,-3.9]]},
 {style:BVB({number:15,build:{height:1.91},seed:41}),path:[[-12,-12,-1],[-3,-8.6,-.6],[0,-6.8,.1],[2,-6.3,.2]]},// Hummels
 {style:BVB({number:25,build:{height:1.95,bulk:1.1},seed:42}),path:[[-12,-12,5],[-3,-8,3.6],[0,-5.8,2.4],[2,-5.3,2.2]]},// Süle
 {style:BVB({number:23,seed:43}),path:[[-12,-19,-3],[0,-12,-1.5],[2,-10,-1]]},
 {style:BVB({number:22,skin:SKIN_D,build:{height:1.86},seed:44}),path:[[-12,-24,8],[T_PASS,-22,7],[0,-15,5],[2,-13,4.5]]},// Bellingham
 {style:BVB({number:6,seed:45}),path:[[-12,-25,-7],[0,-16,-6],[2,-14,-5.5]]},
 // the right-back: stays goal-side and never closes Cancelo down (Hummels: "no one closes the ball down") — five metres off, too late
 {style:BVB({number:null,seed:46}),path:[[-12,-34,19],[-3,-27,17],[T_CROSS,-25.6,16.8],[0,-24.8,17.4],[2,-23.8,17.6]]},
 {style:CITY({number:19,skin:SKIN_M,seed:50}),path:[[-12,-18,-1],[-3,-11,2],[0,-7.4,3.4],[2,-6.2,3.2]]},// Álvarez
 {style:CITY({number:47,seed:51}),path:[[-12,-24,-16],[0,-13,-10.5],[2,-11,-9]]},// Foden
 {style:CITY({number:20,seed:52}),path:[[-12,-36,12],[0,-24,11],[2,-21,10]]},// Bernardo Silva
 {style:CITY({number:16,build:{height:1.9},seed:53}),path:[[-12,-44,2],[0,-33,3],[2,-30,3]]},// Rodri
 {style:CITY({number:5,build:{height:1.88},seed:54}),path:[[-12,-40,-20],[0,-31,-17],[2,-29,-16]]},// Stones
 {style:REF,path:[[-12,-36,-7],[0,-21,-6],[3,-17,-6]]},
];

/** Haaland's flying LEFT-foot volley (contact .5), as in the Haaland film */
function fly(t:number):A.Pose{
 const keys:[number,A.Pose][]=[
  [0,A.posed({rHipF:34,rKnee:28,lHipF:-18,lKnee:64,lAnk:30,lean:12,pitch:4,lShF:28,rShF:-34,lElb:78,rElb:80,neckP:-10,neckY:8})],
  [.22,A.posed({rHipF:-10,rKnee:20,rAnk:38,lHipF:78,lKnee:96,lAnk:18,lean:0,pitch:-6,air:.04,lShF:104,lShA:30,lElb:52,rShF:40,rShA:40,rElb:42,neckP:-20,neckY:10})],
  [.38,A.posed({air:.14,pitch:-22,lean:-8,roll:4,lHipF:116,lHipA:14,lHipR:-12,lKnee:48,lAnk:16,rHipF:6,rKnee:28,rAnk:44,lShF:150,lShA:32,lElb:44,rShF:70,rShA:52,rElb:24,neckP:-30,neckY:10})],
  [.5,A.posed({air:.1,pitch:-30,lean:-12,roll:7,twist:-8,lHipF:130,lHipA:24,lHipR:-24,lKnee:8,lAnk:14,rHipF:2,rKnee:18,rAnk:52,lShF:168,lShA:26,lElb:50,rShF:60,rShA:60,rElb:14,rHand:.8,neckP:-24,neckY:12})],
  [.66,A.posed({air:.16,pitch:-58,lean:-4,roll:8,lHipF:104,lHipA:18,lKnee:26,lAnk:22,rHipF:34,rKnee:44,rAnk:30,lShF:96,lShA:70,lElb:34,rShF:24,rShA:84,rElb:30,neckP:26})],
  [.84,A.posed({air:0,pitch:-80,lean:6,roll:8,lHipF:66,lKnee:58,rHipF:52,rKnee:70,lShA:84,lShF:-8,rShA:84,rShF:-8,lElb:40,rElb:40,neckP:40})],
  [1,A.posed({air:0,pitch:-62,lean:36,lHipF:72,lKnee:84,rHipF:60,rKnee:92,lShF:-28,rShF:-28,lShA:40,rShA:40,lElb:22,rElb:22,neckP:12})],
 ];
 return A.clampPose(A.keyPoses(clamp(t),keys));}
const HYAW=22*Math.PI/180;
const HB:A.Build={height:1.94,bulk:1.08,thighs:1.08};
function haalandState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(HAAL_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 let pose=A.blendPose(A.blendPose(A.stand(),run,clamp((v-.3)/1.2)),fly(clamp(.5+tau/FLY_DUR)),easeInOutSine(sm(-.95,-.62,tau)));
 if(tau>1.4)pose=A.blendPose(pose,A.celebrate(tau-1.4,{kind:'run'}),easeInOutSine(sm(1.4,2.4,tau)));
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):HYAW,cel=sm(1.4,2.4,tau),yaw=angLerp(runYaw,HYAW,sm(-.9,-.45,tau));
 return{x:q.x-cel*3*(tau-1.4)/2,z:q.z-cel*3.6*(tau-1.4)/2,yaw:tau>1.4?angLerp(yaw,-2.1,cel):yaw,pose};}
const CONTACT:V3=(()=>{const sk=A.solve(fly(.5),HB,{x:HG[0],z:-HG[1],yaw:HYAW}),m=mix3(sk.lAn,sk.lToe,.55);return[m[0],m[1]+.02,-m[2]+.12];})();
const NETPT:V3=[.25,1.35,-1.55];

// ---- Cancelo: carries it down the left, looks up, and crosses with the OUTSIDE of his RIGHT foot ----
/** the trivela: his body faces left of the target (towards the goal line), the right foot turned IN (toes in, ankle locked and pointed)
 * so its outside edge meets the ball and swipes across it; the follow-through goes across his body, not towards the target */
function trivela(t:number):A.Pose{
 const s=A.strike(t,{power:.6}),w=sm(.3,.46,t)*(1-sm(.66,.84,t));
 return A.clampPose(A.blendPose(s,{...s,rHipR:-.6,rAnk:1.0,rHipA:s.rHipA-.18,rKnee:s.rKnee+.1,twist:s.twist+.12},w));}
const CAN_HEAD=Math.atan2(CONTACT[2]-22.4,CONTACT[0]+24.6)+.62;
/** where the outside of his right boot meets the ball (solved on the skeleton at contact, converted back to this world) */
const CAN_FOOT:V3=(()=>{const q=moverPos(CAN_P,T_CROSS),sk=A.solve(trivela(A.STRIKE_CONTACT),CB,{x:q.x,z:-q.z,yaw:CAN_HEAD}),m=mix3(sk.rAn,sk.rToe,.6);
 const right:[number,number]=[Math.sin(CAN_HEAD),-Math.cos(CAN_HEAD)];return[m[0]+right[0]*.11,.11,-m[2]+right[1]*.11];})();
const KDB_FOOT:V3=[-26.0,.11,6.3];
/** a ballistic flight a → b over `dur` seconds (real gravity), with a sideways bow (m) to the left of the travel (the trivela's bend) */
function flight(a:V3,b:V3,dur:number,s:number,bow=0):V3{const u=clamp(s/dur),vy=(b[1]-a[1]+.5*G*dur*dur)/dur,t=u*dur,dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,bw=bow*Math.sin(Math.PI*u);
 return[lerp(a[0],b[0],u)-dz/l*bw,a[1]+vy*t-.5*G*t*t,lerp(a[2],b[2],u)+dx/l*bw];}
function ballT(tau:number):V3{
 if(tau<T_PASS){const q=moverPos(KDB_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*9)*.12;return[q.x+q.vx/v*(.55+ph),.11,q.z+q.vz/v*(.55+ph)];}
 if(tau<T_RECV){const a=ballT(T_PASS-.001),u=easeOut(clamp((tau-T_PASS)/(T_RECV-T_PASS))),r=moverPos(CAN_P,T_RECV);return[lerp(a[0],r.x+.5,u),.11,lerp(a[2],r.z-.3,u)];}
 if(tau<T_CROSS-.3){const q=moverPos(CAN_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.14;return[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];}
 if(tau<T_CROSS){const a=ballT(T_CROSS-.3001),u=sm(T_CROSS-.3,T_CROSS,tau);return mix3(a,CAN_FOOT,u);}
 if(tau<0)return flight(CAN_FOOT,CONTACT,-T_CROSS,tau-T_CROSS,2.2);
 if(tau<SHOT)return mix3(CONTACT,NETPT,tau/SHOT);
 const s=tau-SHOT,u=clamp(s/.1);if(u<1)return mix3(NETPT,[1.6,1.1,-1.3],u);
 const d=clamp((s-.1)/.5),e=s-.6,bounce=d>=1?.12*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.6-.4*d,Math.max(.11,1.1*(1-d*d)+.11*d*d)+bounce,-1.3+.2*d];}
const DIVE_T0=-.08;
function keeperState(tau:number){const z=lerp(1.4,-.2,sm(T_CROSS,.05,tau,easeInOutSine));
 const pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/1.05),{side:'l',height:.55});
 return{x:KEEP_X,z,yaw:Math.PI,pose};}
function kdbState(tau:number,ball:V3){const st=moverState(KDB_P,tau,ball),w=sm(T_PASS-.55,T_PASS-.3,tau)*(1-sm(T_PASS+.4,T_PASS+.8,tau));
 if(tau<T_PASS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2)%1+1)%1,{foot:'r',speed:.5}),.6);
 const r=moverPos(CAN_P,T_RECV);return{...st,yaw:angLerp(st.yaw,Math.atan2(r.z-6.2,r.x+26.4),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_PASS)/1.1),{power:.55}),w)};}
/** the look up: the head lifts off the ball towards the box, well before the cross */
const LOOK=(tau:number)=>sm(T_CROSS-1.5,T_CROSS-1.2,tau)*(1-sm(T_CROSS-.65,T_CROSS-.45,tau));
function canceloState(tau:number,ball:V3){const st=moverState(CAN_P,tau,ball),w=sm(T_CROSS-.55,T_CROSS-.3,tau)*(1-sm(T_CROSS+.5,T_CROSS+1,tau));
 if(tau>T_RECV&&tau<T_CROSS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.2)%1+1)%1,{foot:'r',speed:.6}),.6);
 const lk=LOOK(tau);st.pose={...st.pose,neckP:st.pose.neckP-.7*lk,neckY:st.pose.neckY-.5*lk};
 return{...st,yaw:angLerp(st.yaw,CAN_HEAD,w),pose:A.blendPose(st.pose,trivela(clamp(A.STRIKE_CONTACT+(tau-T_CROSS)/1.1)),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:Omit<Body,'prev'>[]=[];
  out.push({...kdbState(t,b),style:DEBRUYNE},{...canceloState(t,b),style:CANCELO,smear:t>T_CROSS-.2&&t<T_CROSS+.25});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...haalandState(t),style:HAALAND,smear:t>-.3&&t<.35},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-1.1,p[2]+1.3)+Math.abs(p[0]-1.6)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};

// ---------------- chapter 1 (live, real time): the high main-stand camera: the pass out left, the look up, the cross, the volley, the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Goal')-SHOT-.15,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-38,21,-46];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_CROSS){const w=sm(T_CROSS-1.6,T_CROSS,tau);return[lerp(b[0],-14,.15+.2*w),1.2,lerp(b[2],8,.12+.25*w)];}
 const w=sm(T_CROSS,-.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-8,.3),1.2+b[1]*.3,lerp(b[2],2,.3)];return mix3(mid,[-3,1.2,-.8],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-10,2700],[T_PASS,3000],[T_RECV,3700],[T_CROSS,4300],[-.6,5400],[0,6800],[.8,6600],[1.8,5200],[4,4800]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.3+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,ballT(t-TL-.02),tt,w.ball[1]>1.5?30:18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:8.6,
};

// ---------------- chapter 2 (TV replay, slow motion): a low camera on the near touchline, a long lens on his right boot, then the flight ----------------
const ch2T=()=>({boot:T(1,'Watch his right boot'),slow:T(1,'slowly'),hits:T(1,'He hits the ball'),out:T(1,'with the outside'),floats:T(1,'the cross floats in'),drop:T(1,'dropping'),far:T(1,'the far post'),end:SEC(1)});
/** replay clock: from the last touches before the cross, ×~5 slow through the contact on "with the outside", then the ball's flight
 * (still slowed) to the far post as the words land there, and Haaland's volley at the very end */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_CROSS-1.3],[q.hits,T_CROSS-.4],[q.out+.2,T_CROSS+.02],[q.floats,T_CROSS+.3],[q.drop,-.75],[q.far,-.3],[q.end,.35]]) as unknown as Key[],lin);};
const CAM2:V3=[3,1.9,38];// low, by the corner flag ahead of him on the left: he runs and crosses towards the lens, right boot in view
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),foot:V3=[CAN_FOOT[0],.55,CAN_FOOT[2]];
 const w=key(t,mono<[number,number]>([[0,.25],[q.out+.2,.05],[q.floats,.35],[q.drop,.95],[q.far,1],[q.end,1]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,4200],[q.hits,5600],[q.out+.2,6400],[q.floats,3600],[q.drop,4200],[q.far,5200],[q.end,5600]]) as unknown as Key[]);
 const fp=sm(q.floats,q.drop,t,easeInOutSine),bl:V3=mix3([b[0],Math.min(b[1],2.6)*.6+.4,b[2]],[-3.2,1.3,-1.6],fp);const lk=mix3(foot,bl,w);return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),w=worldBodies(tau,tp,Math.max(.004,tp-tau2(tt-1/12))),goalIn=tau-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.15+.8*sm(0,.4,goalIn),flash:.15+.8*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,ballT(tau-.02),tt,22)]);
  // the contact: a yellow spark off the OUTSIDE of his right boot (the replay's one flourish)
  const age=tau-T_CROSS;if(age>-.02&&age<.14){const p=P(c,CAN_FOOT);sparkBurst(s,Y,p[0],p[1],(.35+2.4*clamp((age+.02)/.16))*kAt(c,CAN_FOOT)*.5,{n:9,seed:71,g:1-clamp(age/.14),width:Math.max(4,kAt(c,CAN_FOOT)*.05)});}
  void q;
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(20,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6.2,
};

// ---------------- THE PRACTICE (a demonstration, not a match): τ = seconds into the drill; City's own half, attacking +x ----------------
// Two centre-backs, the midfielder in the middle, the left-back wide; two red bibs press. The left-back steps inside next to the
// midfielder, the presser goes to the centre-back, the pass goes past the presser to the left-back, who plays it forward.
const D_PASS1=4.3,D_RECV1=5.05,D_PASS2=5.95,D_RECV2=6.95;
const CAN_D:MKey[]=[[0,-70.5,29.5],[.9,-70.4,29.2],[3.5,-64.6,11.4],[4.3,-64.3,10.9],[D_RECV1,-64.1,10.7],[D_PASS2,-63.6,10.5],[7.2,-61.5,10],[9,-58.5,9.4]];
const LCB_D:MKey[]=[[0,-75,10],[3,-74.6,9.8],[D_PASS1,-74.4,9.7],[9,-74,9.6]];
const RCB_D:MKey[]=[[0,-75,-10],[9,-74.4,-9.6]];
const SIX_D:MKey[]=[[0,-62.6,.6],[3,-62.8,.2],[6,-62.4,-.4],[9,-62,-.6]];
const TEN_D:MKey[]=[[0,-47,3.5],[4,-47.6,5.6],[D_RECV2,-48.3,6.9],[9,-47.4,6.6]];
const RB1_D:MKey[]=[[0,-60.4,-.4],[3,-60.6,0],[6,-60.3,.2],[9,-60.8,1.4]];// red bib on the midfielder
const RB2_D:MKey[]=[[0,-63,16],[1.2,-64.2,15],[D_PASS1,-70.6,11.6],[D_RECV1,-71.3,11.4],[6.5,-70,11.2],[9,-68.5,10.8]];// red bib presses the centre-back
const LCB_FOOT:V3=[-73.95,.11,9.6];
const CAN_REC:V3=[-63.6,.11,10.6];
const TEN_REC:V3=[-48.8,.11,6.9];
function ballD(tau:number):V3{
 if(tau<D_PASS1){const q=moverPos(LCB_D,tau),ph=.08*Math.sin(tau*5);return[q.x+.45+ph,.11,q.z-.1];}
 if(tau<D_RECV1){const u=easeOut(clamp((tau-D_PASS1)/(D_RECV1-D_PASS1))*.92+.08*clamp((tau-D_PASS1)/(D_RECV1-D_PASS1)));return mix3(LCB_FOOT,CAN_REC,u);}
 if(tau<D_PASS2){const u=sm(D_RECV1,D_PASS2-.15,tau);return mix3(CAN_REC,[-63.15,.11,10.35],u);}
 if(tau<D_RECV2){const u=easeOut(clamp((tau-D_PASS2)/(D_RECV2-D_PASS2)));return mix3([-63.15,.11,10.35],TEN_REC,u);}
 const q=moverPos(TEN_D,tau);return[q.x+.5,.11,q.z];}
/** a pass with the right instep, contact at τ0 */
const passPose=(tau:number,t0:number,power=.45)=>A.strike(clamp(A.STRIKE_CONTACT+(tau-t0)/1.1),{power});
const passW=(tau:number,t0:number)=>sm(t0-.55,t0-.3,tau)*(1-sm(t0+.35,t0+.75,tau));
function demoBodies(tau:number,tp:number):Body[]{
 const at=(t:number)=>{const b=ballD(t),out:Omit<Body,'prev'>[]=[];
  // Cancelo: jogs in from the touchline, arrives side-on (half-turned: he sees the ball AND the pitch ahead), receives, turns, passes forward
  {const st=moverState(CAN_D,t,b),arrived=sm(3.3,3.8,t),open=angLerp(Math.atan2(b[2]-st.z,b[0]-st.x),0,.5);
   let yaw=angLerp(st.yaw,open,arrived*(1-sm(D_RECV1,D_RECV1+.4,t))),pose=st.pose;
   yaw=angLerp(yaw,Math.atan2(TEN_REC[2]-10.5,TEN_REC[0]+63.6)+.25,sm(D_RECV1,D_RECV1+.45,t)*(1-sm(D_PASS2+.8,D_PASS2+1.2,t)));
   pose=A.blendPose(pose,A.posed({lHipF:14,rHipF:8,lKnee:26,rKnee:22,lean:10,twist:-14,neckY:-20,lShA:22,rShA:18,lElb:40,rElb:40}),arrived*(1-sm(D_RECV1-.2,D_RECV1+.1,t)));
   pose=A.blendPose(pose,passPose(t,D_PASS2,.5),passW(t,D_PASS2));
   out.push({x:st.x,z:st.z,yaw,pose,style:CAN_DEMO,smear:t>D_PASS2-.15&&t<D_PASS2+.2});}
  {const st=moverState(LCB_D,t,b),w=passW(t,D_PASS1);out.push({...st,yaw:angLerp(st.yaw,Math.atan2(CAN_REC[2]-9.7,CAN_REC[0]+74.4),w),pose:A.blendPose(st.pose,passPose(t,D_PASS1,.4),w),style:TRAIN({seed:61,build:{height:1.9}})});}
  out.push({...moverState(RCB_D,t,b),style:TRAIN({seed:62,skin:SKIN_D,build:{height:1.88}})});
  out.push({...moverState(SIX_D,t,b),style:TRAIN({seed:63,build:{height:1.9}})});
  out.push({...moverState(TEN_D,t,b),style:TRAIN({seed:64,skin:SKIN_M})});
  out.push({...moverState(RB1_D,t,b,A.stand),style:BIB({seed:71})});
  {const st=moverState(RB2_D,t,b);out.push({...st,style:BIB({seed:72,skin:SKIN_M})});}
  return out;};
 const now=at(tp),before=at(tp-1/12);return now.map((b,i)=>({...b,prev:before[i].pose}));}

// ---------------- chapter 3 (the demonstration, raised side camera by day): wide, the step inside, next to the midfielder, the extra pass ----------------
const ch3T=()=>({how:T(2,'How he played'),prac:T(2,'Watch this practice'),wide:T(2,'he starts wide'),steps:T(2,'then steps inside'),next:T(2,'next to the midfielder'),now:T(2,'Now there is'),one:T(2,'one more passer'),mid:T(2,'in the middle'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono<[number,number]>([[0,0],[q.wide,.5],[q.steps+.2,1.2],[q.next+.3,3.5],[q.now+.2,D_PASS1],[q.one+.2,D_RECV1+.1],[q.mid+.1,D_PASS2+.05],[q.end,8.2]]) as unknown as Key[],lin);};
const CAM3:V3=[-40,6,21];// raised, up-field on his side, looking back at the build-up: the step inside crosses the screen
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),b=ballD(tau),cn=moverPos(CAN_D,tau),open=1-sm(0,q.wide+.4,t,easeInOutSine);
 const fw=.35+.4*sm(D_PASS2,D_RECV2+.3,tau),focus:V3=[lerp(cn.x,b[0],fw),.8,lerp(cn.z,b[2],fw)];
 const lk=mix3(focus,[-68,.5,19],.55*open);
 const F=key(t,mono<[number,number]>([[0,1500],[q.wide,1600],[q.steps,1900],[q.next,2400],[q.now,2300],[q.mid,1900],[q.end,1700]]) as unknown as Key[]);
 return makeCam([CAM3[0]+(lk[0]+64)*.3,CAM3[1],CAM3[2]],lk,F);}
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt);
  frame(s);
  stadium(s,c,{t,day:true});
  drawWorld(s,c,demoBodies(tau,tp),[ballItem(s,c,ballD(tau),ballD(tau-.03),tt,14)]);
 },
 aperture(t){const c=ch3Cam(t),q=moverPos(CAN_D,tau3(t)),p:V3=[q.x,1.2,q.z],[x,y]=P(c,p);return apertureDisc(x,y,Math.max(24,.9*kAt(c,p)),12);},
 still:6,
};

// ---------------- chapter 4 (the lesson): the same practice from a raised camera behind the centre-backs, with teaching marks ----------------
const ch4T=()=>({yt:T(3,'Your turn'),fb:T(3,'a full-back'),si:T(3,'step inside'),im:T(3,'into midfield'),ex:T(3,'add an extra passer'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4T();return key(t,mono<[number,number]>([[0,0],[q.fb,.7],[q.si,1.1],[q.im+.3,3.6],[q.ex,D_PASS1-.1],[q.ex+1.6,D_RECV1+.3],[q.end,D_PASS2+1.4]]) as unknown as Key[],lin);};
function ch4Cam(t:number){const q=ch4T(),push=sm(0,q.im,t,easeInOutSine);
 return makeCam([-86+3*push,8.5-1*push,6+1.5*push],[-62,0,9.5],1250+200*push);}
/** a dashed ribbon along ground points (metres), drawn on by g */
function groundDash(s:Sheet,c:Cam,pts:[number,number][],g:number,ink:string,w:number,head=true){
 const q:Pt[]=[];for(const[x,z] of pts){const p:V3=[x,.03,z];if(depthOf(c,p)<1)return;q.push(P(c,p));}
 const n=Math.max(2,Math.round(q.length*clamp(g))),part=q.slice(0,n);if(part.length<2)return;
 const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);
 const rb=ribbon(part,w,{taper:.1,pressure:.2,wobble:1,gaps});s.knockout(rb);s.fill(ink,rb,.95);
 if(head&&g>.9){const a=part[part.length-2],b=part[part.length-1],d=Math.atan2(b[1]-a[1],b[0]-a[0]),h=w*2.6,hp=polyPath([[b[0]+Math.cos(d)*h,b[1]+Math.sin(d)*h],[b[0]+Math.cos(d+2.3)*h,b[1]+Math.sin(d+2.3)*h],[b[0]+Math.cos(d-2.3)*h,b[1]+Math.sin(d-2.3)*h]],true);s.knockout(hp);s.fill(ink,polyPath([[b[0]+Math.cos(d)*h,b[1]+Math.sin(d)*h],[b[0]+Math.cos(d+2.3)*h,b[1]+Math.sin(d+2.3)*h],[b[0]+Math.cos(d-2.3)*h,b[1]+Math.sin(d-2.3)*h]],true),.95);}}
/** a ring on the grass round a player's feet */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,ink:string,g:number,w:number){
 if(g<=.02)return;const q:Pt[]=[];for(let i=0;i<=28;i++){const a=i/28*TAU,p:V3=[x+Math.cos(a)*r*g,.03,z+Math.sin(a)*r*g];if(depthOf(c,p)<1)return;q.push(P(c,p));}
 const rb=ribbon(q,w,{close:true,taper:0,wobble:1,seed:Math.round(x*7+z)});s.knockout(rb);s.fill(ink,rb,.95);}
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),c=ch4Cam(t),tau=tau4(t),tp=tau4(tt),kk=kAt(c,[-64,0,10]);
  frame(s);
  stadium(s,c,{t,day:true});
  // "step inside": his path from the touchline to the midfielder's side, drawn on
  const g1=sm(q.si-.2,q.si+1.4,tt,easeOut)*(1-sm(q.end-.6,q.end-.2,tt));
  const path:[number,number][]=[];for(let i=0;i<=16;i++){const u=i/16;path.push([lerp(-70.4,-64.8,u)+1.2*Math.sin(u*Math.PI),lerp(29.2,11.8,u)]);}
  if(g1>.02)groundDash(s,c,path,g1,Y,Math.max(5,.35*kk));
  // "into midfield": the middle zone lit, the midfielder and him side by side
  const g2=sm(q.im-.1,q.im+.4,tt,easeOutBack)*(1-sm(q.end-.6,q.end-.2,tt));
  if(g2>.02){const zone=new Path2D();addPoly(zone,clipPoly(c,[[-66.5,.02,-2.5],[-60,.02,-2.5],[-60,.02,13.5],[-66.5,.02,13.5]]));s.knockout(zone,.4*g2);s.tone(Y,zone,.5*g2);}
  // "add an extra passer": yellow rings under the three passers (centre-back, midfielder, full-back), red rings under the two bibs: 3 v 2
  const g3=sm(q.ex-.15,q.ex+.35,tt,easeOutBack)*(1-sm(q.end-.6,q.end-.2,tt)),rp=(m:MKey[])=>moverPos(m,tau);
  if(g3>.02){for(const m of[LCB_D,SIX_D,CAN_D]){const p=rp(m);groundRing(s,c,p.x,p.z,1.3,Y,g3,Math.max(4,.22*kk));}
   for(const m of[RB1_D,RB2_D]){const p=rp(m);groundRing(s,c,p.x,p.z,1.1,R,g3,Math.max(4,.2*kk));}}
  // the lanes: centre-back → him (past the presser), him → forward
  const g4=sm(q.ex+.2,q.ex+1.1,tt,easeOut)*(1-sm(q.end-.6,q.end-.2,tt));
  if(g4>.02){groundDash(s,c,[[-73.6,9.7],[-70,10],[-66.5,10.4],[-64.4,10.6]],g4,K,Math.max(4,.26*kk));
   groundDash(s,c,[[-63,10.3],[-58,9.3],[-53,8],[-49.3,7]],sm(q.ex+1,q.ex+2,tt,easeOut)*(1-sm(q.end-.6,q.end-.2,tt)),K,Math.max(4,.26*kk));}
  drawWorld(s,c,demoBodies(tau,tp),[ballItem(s,c,ballD(tau),ballD(tau-.03),tt,14)]);
  // his arrival spot: a small yellow pulse on "add an extra passer"
  const cp=moverPos(CAN_D,tau),hp=P(c,[cp.x,2.25,cp.z]),pulse=sm(q.ex-.1,q.ex+.3,tt,easeOutBack)*(1-sm(q.ex+1.2,q.ex+1.6,tt));
  if(pulse>.02)sparkBurst(s,Y,hp[0],hp[1],.9*kk*pulse,{n:8,seed:88,g:pulse,width:Math.max(4,.12*kk)});
 },
 still:5,
};

const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
const story:RisoStory={
 id:'cancelo-signature',format:'11v11',title:'Cancelo, the full-back playmaker',
 theme:'A full-back can step inside into midfield to add an extra passer.',
 ageNote:'Champions League, Manchester City 2–1 Borussia Dortmund, Etihad Stadium, Manchester, 14 September 2022 (84th minute: his outside-of-the-boot cross), then a practice demonstration of how he stepped inside for City.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball pops up from the point with a yellow burst and a ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*160,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,ring(x,y,120*g,36*g,20),12,.95);
  if(age>0&&age<.5)sparkBurst(s,Y,x+Math.cos(a)*20,y-up,150*g,{n:9,seed,g:1-clamp((age-.25)/.25),width:14});
  ballAt(s,x,y-up,60,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
