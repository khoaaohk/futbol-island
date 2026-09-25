/** Iconic-play film · Bruno Guimarães, "Signature: win it, then pass forward". A RisoStory (chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. The real match: Liverpool 1–2 Newcastle United, 2025 EFL Cup final
 * (Carabao Cup), Wembley Stadium, London, Sunday 16 March 2025 — Bruno Guimarães captained Newcastle to their first domestic trophy in
 * 70 years and lifted the cup with Kieran Trippier. Only the rendering is riso.
 *
 * WHY THIS MATCH, AND WHY A DEMONSTRATION (signature-move fallback): iconicPlays.json gives Bruno a trait, not one moment ("win it, then
 * pass forward"; lesson "After you win the ball, look forward first for a quick pass"). No written account I could read describes one
 * specific Bruno ball-win followed by a forward pass in a way that can be recreated beat by beat: in the final his stats were 0 assists and
 * 2 chances created (BBC), and the two Bruno actions the reports do describe are a flicked header from Burn's knock-back (36') and a risky
 * spin in stoppage time that Elliott robbed for Chiesa's goal — neither is the signature (the Isak film already uses the 52nd-minute goal).
 * So, per the brief, the real-match chapters show ONLY confirmed things (the final whistle at Wembley, 2–1, the captain and Trippier lifting
 * the trophy), and the move itself is a separate, plainly labelled "How he does it" training demonstration (neutral training tops and
 * bibs, no named match, no named opponent), followed by the lesson. No goal, tackle or pass is staged inside the final.
 *
 * SOURCES (read Sept 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2025 EFL Cup final" (raw; wiki-2025-efl-cup-final.txt): 16 March 2025, Wembley, attendance 88,513, referee John Brooks;
 *    Newcastle won 2–1 (Burn 45+', Isak 52', Chiesa 90+4'); line-ups — Newcastle Pope 22; Trippier 2, Schär 5, Burn 33, Livramento 21;
 *    Bruno Guimarães 39 (captain), Tonali 8, Joelinton 7; Murphy 23, Isak 14, Barnes 11; subs Willock 28, Wilson 9 (81'), Krafth 17 (90').
 *    Liverpool van Dijk 4 (c), Konaté 5, Salah 11, Szoboszlai 8, Mac Allister 10, Gravenberch 38 … Kit boxes: Liverpool all red (home
 *    2024–25); Newcastle white shirt with black stripes and black sleeves, black shorts, black socks (home 2024–25).
 *  - The Guardian, David Hytner at Wembley, "Newcastle sink Liverpool to savour taste of glory after decades of drought", 16 Mar 2025
 *    (guardian-liv-new-efl-final-2025): photo caption "Bruno Guimarães and Kieran Trippier lift the trophy after Newcastle's win"; "the
 *    black-and-white-clad hordes"; "There was Bruno Guimarães and Joelinton in midfield"; 36' "Burn nodded a corner back for Guimarães, who
 *    could not muster the power on a flicked header"; stoppage time "Guimarães tried a risky spin move and was robbed by … Harvey Elliott".
 *  - BBC Sport live page, Phil McNulty (bbc-live-liv-new-efl-final-2025): "Newcastle United secured their first domestic trophy for 70 years";
 *    "The final whistle at Wembley was greeted with an outpouring of joy by Newcastle fans"; Bruno Guimarães 39, captain, 90 minutes,
 *    0 assists, 2 chances created; photo captions "Bruno Guimaraes (L) and Joelinton celebrate", "Eddie Howe hugs Bruno Guimaraes".
 *  - Sky Sports, Dan Long (sky-liv-new-efl-final-2025): the goals; "Bruno Guimaraes then directed a header straight at Caoimhin Kelleher".
 *  - Wikipedia, "Bruno Guimarães" (raw; wiki-bruno-guimaraes.txt): "On 16 March 2025, Guimarães became the first Newcastle United captain to
 *    lift a domestic trophy in 70 years … after leading the team to victory in the Carabao Cup final against Liverpool"; Brazilian
 *    midfielder; joined Arsenal in August 2026 (the card's club history, lib/town/playerCareers.json, agrees).
 * CONFIRMED by those accounts: date, Wembley, competition, 2–1 to Newcastle, the final whistle and the Newcastle fans' joy; Bruno the captain
 *  (No. 39) for 90 minutes; Bruno and Trippier lifting the trophy together; Bruno and Joelinton celebrating together; 70 years since the
 *  last domestic trophy (the 1955 FA Cup, so "seventy years for an English cup"); the kits (home v home); the players on the pitch at the end.
 * INFERRED / ILLUSTRATIVE (never narrated as fact): where everyone stood at the whistle and how each player celebrated; Bruno and Joelinton's
 *  hug (drawn right after the whistle — the photo's timing is not stated); the referee's arm and kit colour (drawn navy); the ball rolling
 *  loose at the whistle; the presentation on a low stage on the pitch in front of the main stand (the Guardian photo shows the lift, not
 *  where), that they wore the match kit for it, who stood beside them, Bruno on Trippier's right, the armband colour (drawn yellow), the
 *  confetti in black and white; the trophy's exact shape (drawn as a lidded three-handled silver cup); the light (16:30 GMT kick-off, so
 *  full time is about 18:25, dusk, floodlights on); the crowd's colours by end; Wembley's arch over the far stand. Chapter 3's drill is an
 *  invented demonstration of the card's lesson (his right foot for the poke and the pass is drawn, not claimed); chapter 4 is a teaching
 *  plate. Bruno drawn with medium-light skin, short black hair and a beard (lib/town/playerAppearance.json: skin 2, hair 0, beard).
 *
 * FRAMING (full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = the high main-stand broadcast camera in
 * REAL TIME at the final whistle — the referee's arm, Newcastle players leap, Liverpool players sink, the camera finds the captain and
 * Joelinton hugging; 2 = the TV camera low on the pitch facing the presentation stage: the captain and Trippier raise the trophy, confetti
 * falls; 3 = "How he does it", a raised side-on training-pitch camera (then a camera behind his shoulder for the look forward): he wins the
 * ball, lifts his head, a team-mate runs, one quick forward pass; 4 = the lesson, a duotone teaching plate (win it, look forward, pass).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline); the adapter negates z so right feet stay right feet. Scenes read only their
 * local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; poses on twos, cameras on ones; every
 * random value is seeded.
 *
 * Inks: yellow (grass with blue, floodlights, armband, lesson marks), red (Liverpool, Wembley's seats, bibs, skin), blue (sky, grass,
 * shade), navy (Newcastle black, key line, training tops). The lesson chapter is a duotone beat (navy + yellow on paper). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

// ---------------- the narration (script.json mirrors it) and its provisional timing ----------------
/** `tail` = silence after the last word (the action finishes and the .65 s passage plays in it). Cue words must stay substrings, in order;
 * every cue starts with a plain word (Kokoro splits contractions and hyphenated words, so those never match). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, full time',text:'Wembley, 2025, the League Cup final. The whistle blows! Newcastle beat Liverpool, two goals to one.',tail:2.2,
  cues:['Wembley','League Cup final','The whistle blows','Newcastle beat','two goals to one']},
 {label:'The trophy',text:'Their captain, Bruno Guimarães, lifts the trophy with Kieran Trippier. The fans had waited seventy years for an English cup!',tail:2.0,
  cues:['Their captain','Bruno Guimarães','lifts the trophy','Kieran Trippier','The fans','seventy years']},
 {label:'How he does it',text:'How he does it: Bruno wins the ball back. Then, before anything else, he looks forward. A teammate is running! One quick pass, and his team is attacking.',tail:1.9,
  cues:['How he does it','Bruno wins','before anything else','he looks forward','A teammate','One quick pass','his team is attacking']},
 {label:'Your turn',text:'Your turn! After you win the ball, look forward first, for a quick pass.',tail:2.4,
  cues:['Your turn','win the ball','look forward first','quick pass']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py bruno-guimaraes-signature writes timing.json next to
 * script.json). Then add `import timingJson from '../../../public/plays/narration/bruno-guimaraes-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/bruno-guimaraes-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('bruno-guimaraes: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`bruno-guimaraes film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}

const K='navy',R='red',Y='yellow',B='blue';
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre (W/2,H/2) at `zoom` units per world unit, ignoring safe/fit. */
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
type CK=[number,number,number,number,number,number,number,number];// t, pos xyz, look xyz, focal (units)
const camKeysOf=(t:number,K0:CK[],e=easeIO)=>{const v=key(t,K0 as unknown as Key[],e,true);return makeCam([v[0],v[1],v[2]],[v[3],v[4],v[5]],v[6]);};
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);

// ---------------- Wembley at dusk: a bowl of red seats under the roof, the arch, grass, lines, boards ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-146,74],[41,74],[41,-74],[-146,-74]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA]: 0 far side, 1 the east end, 2 the main stand (behind the ch1 camera), 3 the west end */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],30,OUT[j][1]],[OUT[i][0],30,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 Liverpool red / 2 Newcastle black, phase]; the black-and-white end east, red west (inferred) */
const CROWD=(()=>{const r=rng(1603),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){for(let i=0;i<240;i++){const c=r(),u=r();
 const toon=st===1||(st===0&&u>.5)||(st===2&&u<.5);out.push([st,u,.04+r()*.92,toon?(c<.5?0:2):(c<.72?1:0),r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-100;x<=0;x+=10)out.push([x,32,66]);for(let z=-56;z<=56;z+=14)out.push([34,32,z]);for(let x=-100;x<=0;x+=10)out.push([x,32,-66]);for(let z=-56;z<=56;z+=14)out.push([-139,32,z]);return out;})();
const ARCH:V3[]=Array.from({length:25},(_,i)=>{const u=i/24,y=133*(1-Math.pow(2*u-1,2));return[-52.5+(u-.5)*315,y,78+y*Math.tan(22*Math.PI/180)];});
/** cheer = crowd bounce (the Newcastle ends), flash = phone lights / flags flickering */
function stadium(s:Sheet,c:Cam,o:{cheer?:number;flash?:number;t:number}){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a dusk sky over London: a deeper blue screen, a navy band at the top, a warm low haze over the roof
 s.field(B,.38,.6);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-900],[-Bnd,hz-760]],true),.22);
 s.tone(Y,polyPath([[-Bnd,hz-420],[Bnd,hz-420],[Bnd,hz+80],[-Bnd,hz+80]],true),.12);
 {const pts:Pt[]=[];let ok=true;for(const p of ARCH){if(depthOf(c,p)<8){ok=false;break;}pts.push(P(c,p));}
  if(ok){const w=clamp(7.4*kAt(c,ARCH[12]),3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.9);s.stroke(K,tube,Math.max(1.4,w*.12),.55);}}
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=3)addPoly(terr,clipPoly(c,[bil(q,0,k/9+.3),bil(q,1,k/9+.3),bil(q,1,k/9+.34),bil(q,0,k/9+.34)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],34,ub[2]],[ua[0],34,ua[2]]]));
  const fa=mix3(q[3],q[0],.2),fb=mix3(q[2],q[1],.2);addPoly(roof,clipPoly(c,[[ua[0],34,ua[2]],[ub[0],34,ub[2]],[fb[0],32.4,fb[2]],[fa[0],32.4,fa[2]]]));});
 s.knockout(stands);s.fill(R,stands,.55);s.tone(K,stands,.2);s.tone(K,terr,.6);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(col===1?.15:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1]){s.knockout(heads[1],.6);s.fill(R,heads[1],.95);}if(seen[2]){s.knockout(heads[2],.6);s.fill(K,heads[2],.9);}
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.88);
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp(2.8*k,10,260);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.3*k,6,160),h=clamp(.7*k,4,100);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.35);s.tone(Y,halo,.24);s.knockout(core);s.fill(Y,core,.6);}
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-40],[6,0,-40],[6,0,40],[-111,0,40]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.18);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-52.7,.02,-.2],[-52.3,.02,-.2],[-52.3,.02,.2],[-52.7,.02,.2]]));
 s.knockout(lines,.95);
 const boards=new Path2D(),pan=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[-108,-37],[4,-37]]] as [[number,number],[number,number]][]){addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));
  const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/9);for(let i=0;i<n;i++){const u0=(i+.2)/n,u1=(i+.6)/n,p0:[number,number]=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:[number,number]=[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)];addPoly(pan,clipPoly(c,[[p0[0],.28,p0[1]],[p1[0],.28,p1[1]],[p1[0],.72,p1[1]],[p0[0],.72,p0[1]]]));}}
 s.fill(K,boards,.88);s.knockout(pan,.8);s.fill(Y,pan,.85);
}

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline); the library is right-handed (a figure facing +x
// has its right side on +z). The adapter negates z both ways, so a right foot is a right foot on screen. Library yaw = atan2(dz, dx) here.
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
const fromLib=(p:A.V3):V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** extra marks on a drawn body: the captain's armband (left upper arm) and a beard, only at mid/high detail and when facing us */
type Marks={captain?:boolean;beard?:boolean};
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false,mk:Marks={}){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 const r=A.drawAthlete(s,pose,pj,style,place,{prev});
 if(r.detail!=='low'&&(mk.captain||mk.beard)){const J=r.joints,d=(p:A.V3)=>pj.project(p)[2],hr=Math.hypot(J.head[0]-J.neck[0],J.head[1]-J.neck[1])*.95;
  if(mk.beard&&d(r.sk.face)<d(r.sk.head)){const c:Pt=[lerp(J.head[0],J.face[0],.55),lerp(J.head[1],J.face[1],.55)+hr*.42];s.tone(K,ring(c[0],c[1],hr*.5,hr*.36,12),.62);}
  if(mk.captain&&d(r.sk.lEl)<=d(r.sk.chest)+.04){const a:Pt=[lerp(J.lSh[0],J.lEl[0],.3),lerp(J.lSh[1],J.lEl[1],.3)],b:Pt=[lerp(J.lSh[0],J.lEl[0],.5),lerp(J.lSh[1],J.lEl[1],.5)],band=ribbon([a,b],Math.max(3,hr*.95),{taper:0,pressure:0,wobble:.3});s.knockout(band);s.fill(Y,band,.95);s.stroke(K,band,Math.max(1.2,hr*.08),.8);}}
 return r;}
const SKIN_L:A.InkFill[]=[[Y,.88],[R,.2]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]],SKIN_D:A.InkFill[]=[[R,.78],[K,.2]];
const LINE={line:K,boots:K,hair:K,shade:[B,.32] as A.InkFill};
/** Newcastle: white shirts with black stripes (black printed navy), black shorts, black socks (the kit box) */
const NEWC=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[K,.9],pattern:'stripes',patternInk:'paper',shorts:[K,.9],socks:[K,.9],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Liverpool: all red (the kit box), paper trim and numbers */
const LFC=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.95],shorts:[R,.95],socks:[R,.95],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:11,...o});
/** Bruno Guimarães: 1.82 m, medium-light skin, short black hair, beard, No. 39, the captain */
const BB:A.Build={height:1.82,bulk:1};
const BRUNO:A.AthleteStyle=NEWC({number:39,skin:SKIN_M,build:BB,seed:39});
const BRUNO_MK:Marks={captain:true,beard:true};
const TRIPPIER:A.AthleteStyle=NEWC({number:2,build:{height:1.73},hair:[K,.7],seed:2});
const JOELINTON:A.AthleteStyle=NEWC({number:7,skin:SKIN_M,build:{height:1.86,bulk:1.1},seed:307});
const REF:A.AthleteStyle={...LINE,shirt:[K,.88],shorts:K,socks:K,skin:SKIN_L,hairStyle:'short',seed:17};
type Body={x:number;z:number;y?:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean;mk?:Marks;detail?:A.Detail|'auto'};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,bd.y??0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,y:bd.y??0,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail:bd.detail??detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear,bd.mk);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;
/** a ball item for the depth sort (fast balls stretch along their travel) */
function ballItem(s:Sheet,c:Cam,b:V3,prev:V3,spin:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,prev),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,spin,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}

// common poses
const DEJECTED=A.posed({lHipF:44,rHipF:36,lKnee:46,rKnee:40,lAnk:-8,rAnk:-8,lean:52,pitch:8,lShF:44,rShF:40,lShA:10,rShA:10,lElb:16,rElb:18,neckP:34});
const HANDS_ON_HEAD=A.posed({lHipF:8,rHipF:6,lKnee:10,rKnee:8,lean:-4,lShF:120,rShF:120,lShA:60,rShA:60,lElb:140,rElb:140,neckP:-18});
const HUG=A.posed({lHipF:14,rHipF:8,lKnee:22,rKnee:18,lean:16,pitch:4,lShF:78,rShF:78,lShA:26,rShA:26,lElb:96,rElb:96,neckP:12});

// ---------------- chapter 1 (live, real time): the final whistle at Wembley from the high main-stand camera ----------------
// Positions at full time are illustrative (see the header). The referee blows on "The whistle blows"; Newcastle leap, Liverpool sink;
// the captain and Joelinton run to each other and hug (the BBC photo "Bruno Guimaraes (L) and Joelinton celebrate").
type Kind='arms'|'run'|'sad'|'head'|'ref';
type M1={st:A.AthleteStyle;x:number;z:number;vx:number;vz:number;kind:Kind;delay:number;to?:[number,number]};
const M1S:M1[]=[
 {st:NEWC({number:8,seed:308}),x:-60,z:6,vx:1.4,vz:-.4,kind:'arms',delay:.2},// Tonali
 {st:TRIPPIER,x:-44,z:-15,vx:-.6,vz:.8,kind:'run',delay:.3,to:[-50.5,-3.5]},
 {st:NEWC({number:33,build:{height:2.01,bulk:1.08},seed:333}),x:-70,z:-2,vx:1.8,vz:0,kind:'arms',delay:.15},// Burn
 {st:NEWC({number:5,seed:305}),x:-67,z:9,vx:1.5,vz:-.2,kind:'run',delay:.4,to:[-58,4]},// Schär
 {st:NEWC({number:28,skin:SKIN_D,seed:328}),x:-44,z:14,vx:-.8,vz:-.6,kind:'arms',delay:.35},// Willock
 {st:NEWC({number:9,skin:SKIN_D,seed:309}),x:-37,z:3,vx:-1,vz:0,kind:'run',delay:.25,to:[-47,1]},// Wilson
 {st:NEWC({number:21,skin:SKIN_M,seed:321}),x:-58,z:17,vx:1,vz:-.5,kind:'arms',delay:.5},// Livramento
 {st:NEWC({number:17,seed:317}),x:-41,z:-8,vx:-.9,vz:.3,kind:'arms',delay:.45},// Krafth
 {st:LFC({number:11,skin:SKIN_M,hairStyle:'curly',seed:111}),x:-50,z:9,vx:-1.1,vz:-.3,kind:'head',delay:.4},// Salah
 {st:LFC({number:8,hair:[Y,.6],seed:8}),x:-57,z:-8,vx:-1.2,vz:.2,kind:'sad',delay:.5},// Szoboszlai
 {st:LFC({number:10,seed:10}),x:-48,z:-12,vx:-1.4,vz:.4,kind:'sad',delay:.3},// Mac Allister
 {st:LFC({number:4,skin:SKIN_M,build:{height:1.95,bulk:1.08},seed:4}),x:-64,z:1,vx:.9,vz:0,kind:'head',delay:.6},// van Dijk
 {st:LFC({number:38,skin:SKIN_D,build:{height:1.9},seed:38}),x:-42,z:-3,vx:-1.2,vz:.1,kind:'sad',delay:.35},// Gravenberch
 {st:LFC({number:14,seed:114}),x:-36,z:-6,vx:-1.6,vz:.3,kind:'sad',delay:.25},// Chiesa
 {st:LFC({number:19,seed:119}),x:-61,z:-13,vx:-.8,vz:.5,kind:'head',delay:.55},// Elliott
 {st:LFC({number:5,skin:SKIN_D,build:{height:1.94,bulk:1.1},seed:5}),x:-71,z:11,vx:1.3,vz:-.3,kind:'sad',delay:.6},// Konaté
 {st:REF,x:-53.5,z:2.5,vx:-.8,vz:.2,kind:'ref',delay:0},// the referee (John Brooks)
];
const BRUNO0:[number,number]=[-55,-4],JOEL0:[number,number]=[-47,5];
const HUGPT:[number,number]=[-51.4,-.6];
const ch1T=()=>{const tw=T(0,'The whistle blows')+.15;return{tw,beat:T(0,'Newcastle beat'),two:T(0,'two goals to one'),end:SEC(0)};};
function m1At(m:M1,t:number){const{tw}=ch1T(),pre=Math.min(t,tw),dec=Math.max(0,t-tw),glide=.6*(1-Math.exp(-dec*2.2));
 let x=m.x+m.vx*(pre-tw)+m.vx*glide,z=m.z+m.vz*(pre-tw)+m.vz*glide,yaw=Math.atan2(m.vz,m.vx);
 const sp=Math.hypot(m.vx,m.vz)*(t<tw?1:Math.exp(-dec*2.2)),gait=A.runCycle(((t*1.1+hash(m.st.seed??1,5))%1+1)%1,{speed:clamp(sp/7)});
 let pose=A.blendPose(A.stand(),gait,clamp((sp-.2)/1.2));const go=t-(tw+m.delay);
 if(m.kind==='ref'){if(t>tw-.1)pose=A.blendPose(pose,A.posed({lShF:10,rShF:168,rShA:12,rElb:8,lElb:30,neckP:-10,lKnee:12,rKnee:12}),sm(tw-.1,tw+.15,t)*(1-sm(tw+1.6,tw+2.1,t)));}
 else if(go>0){const w=sm(0,.3,go);
  if(m.kind==='arms')pose=A.blendPose(pose,A.celebrate(go*.9+hash(m.st.seed??1,2),{kind:'arms'}),w);
  else if(m.kind==='sad')pose=A.blendPose(pose,DEJECTED,easeInOutSine(sm(0,.8,go)));
  else if(m.kind==='head')pose=A.blendPose(pose,HANDS_ON_HEAD,easeInOutSine(sm(0,.6,go)));
  else if(m.kind==='run'&&m.to){const dx=m.to[0]-x,dz=m.to[1]-z,D=Math.hypot(dx,dz),run=Math.min(Math.max(0,D-1.1),go*5.5),u=D>1e-6?run/D:0;x+=dx*u;z+=dz*u;
   const moving=run<D-1.15;yaw=Math.atan2(dz,dx);pose=moving?A.blendPose(pose,A.celebrate(go*1.4,{kind:'run'}),w):A.celebrate(go*.9,{kind:'arms'});}}
 return{x,z,yaw,pose};}
/** the captain and Joelinton: a leap at the whistle, a sprint to each other, the hug, then a jump together */
function pairAt(who:0|1,t:number){const{tw,beat}=ch1T(),o=who?JOEL0:BRUNO0,tRun=tw+.9,tHug=Math.max(beat+.1,tRun+1.1),side=who?1:-1;
 const hp:[number,number]=[HUGPT[0]+side*.27,HUGPT[1]],pre=Math.min(t,tw);
 let x=o[0]+(who?-1.1:1.2)*(pre-tw),z=o[1]+(who?-.3:.4)*(pre-tw),yaw=who?Math.atan2(-.3,-1.1):Math.atan2(.4,1.2);
 let pose=A.blendPose(A.stand(),A.runCycle(((t*1.2+who*.5)%1+1)%1,{speed:.18}),t<tw?.8:1-sm(tw,tw+.3,t));
 if(t>tw+.05&&t<tRun+.2)pose=A.blendPose(pose,A.celebrate((t-tw-.05)*1.05,{kind:'arms'}),sm(tw+.05,tw+.25,t)*(1-sm(tRun,tRun+.2,t)));
 if(t>tRun){const u=easeInOutSine(sm(tRun,tHug,t)),s0x=o[0],s0z=o[1];x=lerp(s0x,hp[0],u);z=lerp(s0z,hp[1],u);const dir=Math.atan2(hp[1]-s0z,hp[0]-s0x);
  const run=A.runCycle(((t-tRun)*2)%1,{speed:.8});pose=A.blendPose(pose,run,sm(tRun,tRun+.2,t)*(1-sm(tHug-.25,tHug,t)));
  yaw=angLerp(dir,who?Math.PI:0,sm(tHug-.4,tHug,t));}
 if(t>tHug-.3){pose=A.blendPose(pose,HUG,sm(tHug-.3,tHug,t));if(t>tHug+1.3)pose=A.blendPose(pose,A.celebrate((t-tHug-1.3)*.9+.05,{kind:'arms'}),sm(tHug+1.3,tHug+1.5,t));}
 return{x,z,yaw,pose};}
function ball1(t:number):V3{const{tw}=ch1T(),u=1-Math.exp(-Math.max(0,t+1)*.45);return[-51+(-3.6)*u,.11,3.2+1.4*u];}
function ch1Bodies(t:number,tp:number):Body[]{const out:Body[]=[];
 M1S.forEach(m=>{const a=m1At(m,t),b=m1At(m,tp);out.push({...a,prev:b.pose,style:m.st,detail:'low'});});
 const b0=pairAt(0,t),b0p=pairAt(0,tp),j0=pairAt(1,t),j0p=pairAt(1,tp);
 out.push({...b0,prev:b0p.pose,style:BRUNO,mk:BRUNO_MK,detail:'auto'},{...j0,prev:j0p.pose,style:JOELINTON,detail:'auto'});return out;}
const BCAM:V3=[-50,19,-50];
function ch1Cam(t:number){const{tw,beat,end}=ch1T(),b=pairAt(0,t),w=easeInOutSine(sm(tw+.5,beat+.4,t));
 const look:V3=mix3([-53,4,9],[b.x+.5,1.2,b.z+.6],w);
 const F=key(t,mono<[number,number]>([[0,1900],[tw,2050],[tw+.8,2600],[beat+.2,4600],[end,5600]]) as unknown as Key[]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{tw}=ch1T(),tt=twos(t),c=ch1Cam(t),joy=sm(tw,tw+.6,t,easeOut);
  frame(s);
  stadium(s,c,{t,cheer:.15+joy*1.1,flash:.3+joy*1.5});
  const b=ball1(tt);
  drawWorld(s,c,ch1Bodies(tt,tt-1/12),[ballItem(s,c,b,ball1(tt-1/12),tt*3,12)]);
  // the whistle: a small yellow burst at the referee's mouth
  if(t>tw-.05&&t<tw+.6){const r=m1At(M1S[M1S.length-1],tt),p=P(c,[r.x,1.75,r.z]);sparkBurst(s,Y,p[0],p[1],30+60*sm(tw-.05,tw+.2,t,easeOut),{n:7,seed:12,g:1-sm(tw+.25,tw+.6,t),width:5});}
 },
 aperture(t){const c=ch1Cam(t),b=pairAt(0,t),[x,y]=P(c,[b.x,1.3,b.z]),r=Math.max(40,kAt(c,[b.x,1,b.z])*.9);return apertureDisc(x,y,r,12);},
 still:9.2,
};

// ---------------- chapter 2 (TV, low on the pitch): the captain and Trippier lift the trophy on the presentation stage ----------------
const STAGE={x0:-57.5,x1:-47.5,z0:-33.8,z1:-29.6,h:.55};
const BR2:[number,number]=[-52.19,-30.7],TR2:[number,number]=[-52.81,-30.7];// Bruno on Trippier's right (inferred), facing the pitch (+z)
const FACE=Math.PI/2;
/** team-mates on the stage (who stood where is illustrative) */
const MATES:{st:A.AthleteStyle;x:number;z:number;ph:number}[]=[
 {st:JOELINTON,x:-51.3,z:-31.3,ph:.1},{st:NEWC({number:14,skin:SKIN_D,hairStyle:'curly',build:{height:1.92,bulk:.92},seed:14}),x:-53.7,z:-31.4,ph:.55},
 {st:NEWC({number:33,build:{height:2.01,bulk:1.08},seed:333}),x:-54.6,z:-32.5,ph:.3},{st:NEWC({number:8,seed:308}),x:-50.4,z:-32.4,ph:.75},
 {st:NEWC({number:23,seed:323}),x:-55.5,z:-31.2,ph:.9},{st:NEWC({number:21,skin:SKIN_M,seed:321}),x:-49.5,z:-31.2,ph:.4},
 {st:NEWC({number:5,seed:305}),x:-52.5,z:-32.8,ph:.65},{st:NEWC({number:11,skin:SKIN_M,seed:311}),x:-56.4,z:-32.4,ph:.2},
];
const ch2T=()=>{const lift=T(1,'lifts the trophy')+.25;return{cap:T(1,'Their captain'),bruno:T(1,'Bruno Guimarães'),lift,kt:T(1,'Kieran Trippier'),fans:T(1,'The fans'),sev:T(1,'seventy years'),end:SEC(1)};};
const HOLD=A.posed({lHipF:8,rHipF:6,lKnee:12,rKnee:10,lean:4,lShF:44,rShF:44,lShA:12,rShA:12,lElb:74,rElb:74,neckP:4});
const DIP=A.posed({lHipF:30,rHipF:28,lKnee:44,rKnee:42,lAnk:-10,rAnk:-10,lean:14,lShF:36,rShF:36,lShA:14,rShA:14,lElb:92,rElb:92,neckP:-2});
const LIFT=A.posed({lHipF:4,rHipF:2,lKnee:6,rKnee:6,lean:-8,pitch:-2,lShF:170,rShF:170,lShA:16,rShA:16,lElb:16,rElb:16,neckP:-28,lHand:.3,rHand:.3});
/** the two lifters: hold the cup at the chest, dip, drive it overhead on "lifts the trophy", pump it, a hop on "seventy years" */
function lifterPose(t:number,who:number):A.Pose{const q=ch2T(),lag=who*.06,l=q.lift+lag;
 let p=A.keyPoses(clamp((t-(l-.55))/1.05),[[0,HOLD],[.3,DIP],[.7,LIFT],[1,LIFT]]);
 if(t>l+.6){const pump=.5-.5*Math.cos((t-l-.6)*TAU*.9);p=A.blendPose(p,{...LIFT,lElb:LIFT.lElb+.55*pump,rElb:LIFT.rElb+.55*pump,lShF:LIFT.lShF-.15*pump,rShF:LIFT.rShF-.15*pump},1);}
 if(t>q.sev-.1){const u=((t-q.sev+.1)*1.6)%1,hop=Math.max(0,Math.sin(u*Math.PI));p={...p,air:p.air+.14*hop*sm(q.sev-.1,q.sev+.1,t),lKnee:p.lKnee+.3*(1-hop),rKnee:p.rKnee+.3*(1-hop)};}
 return A.clampPose(p);}
function mateAt(m:typeof MATES[number],t:number):A.Pose{const q=ch2T(),go=sm(q.lift+.1+m.ph*.3,q.lift+.35+m.ph*.3,t);
 const clap=Math.max(0,Math.sin((t+m.ph)*TAU*1.8)),pre=A.posed({lHipF:8,rHipF:6,lKnee:14,rKnee:12,lean:6,lShF:52+10*clap,rShF:52+10*clap,lShA:-4+14*(1-clap),rShA:-4+14*(1-clap),lElb:70,rElb:70,neckP:-4});
 return A.blendPose(pre,A.celebrate((t-q.lift)*.9+m.ph,{kind:'arms'}),go);}
/** the cup's grip point (between the two inner hands), in this world */
function cupPt(t:number):V3{const pb=lifterPose(t,0),pt=lifterPose(t,1);
 const sb=A.solve(pb,BB,{x:BR2[0],y:STAGE.h,z:-BR2[1],yaw:FACE}),st=A.solve(pt,TRIPPIER.build,{x:TR2[0],y:STAGE.h,z:-TR2[1],yaw:FACE});
 const bh=[fromLib(sb.lHa),fromLib(sb.rHa)].sort((a,b)=>Math.abs(a[0]-TR2[0])-Math.abs(b[0]-TR2[0]))[0],th=[fromLib(st.lHa),fromLib(st.rHa)].sort((a,b)=>Math.abs(a[0]-BR2[0])-Math.abs(b[0]-BR2[0]))[0];
 const m=mix3(bh,th,.5);return[m[0],m[1]+.04,m[2]+.08];}
/** the trophy (drawn as a lidded three-handled silver cup): paper with a navy edge, a blue shade down one side and a yellow glint */
function trophy(s:Sheet,c:Cam,g:V3,glint:number){const k=kAt(c,g),[x,y]=P(c,g),S=(px:number,py:number):Pt=>[x+px*k,y-py*k];
 const body:Pt[]=[S(-.1,-.34),S(.1,-.34),S(.07,-.28),S(.03,-.26),S(.03,-.14),S(.12,-.08),S(.16,.04),S(.15,.14),S(.12,.2),S(.08,.23),S(.05,.3),S(.02,.34),S(-.02,.34),S(-.05,.3),S(-.08,.23),S(-.12,.2),S(-.15,.14),S(-.16,.04),S(-.12,-.08),S(-.03,-.14),S(-.03,-.26),S(-.07,-.28)];
 const cup=polyPath(body,true),handles=new Path2D();
 for(const sd of [-1,1]){const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i/10*Math.PI;pts.push(S(sd*(.14+.09*Math.cos(a)),.07-.07*Math.sin(a)));}handles.addPath(ribbon(pts,Math.max(2,.028*k),{taper:.1,pressure:0,wobble:.3}));}
 s.knockout(handles);s.stroke(K,handles,Math.max(1.2,.008*k),.9);
 s.knockout(cup);s.stroke(K,cup,Math.max(1.4,.01*k),.95);
 s.tone(B,polyPath([S(.04,-.12),S(.11,-.07),S(.15,.05),S(.14,.14),S(.1,.2),S(.07,.1),S(.06,-.02)],true),.45);
 s.tone(K,polyPath([S(-.16,.05),S(.16,.05),S(.15,.08),S(-.15,.08)],true),.4);
 if(glint>0)sparkBurst(s,Y,x-.07*k,y-.12*k,Math.max(12,.14*k)*glint,{n:6,seed:33,g:glint,width:Math.max(2,.012*k)});}
/** confetti: black-and-white paper squares fluttering down in front of and behind the stage (seeded) */
const CONF=(()=>{const r=rng(3903),o:[number,number,number,number,number,number][]=[];for(let i=0;i<150;i++)o.push([-60+r()*15,-34+r()*15,6+r()*9,r()*TAU,r(),.6+r()*.7]);return o;})();
function confetti(s:Sheet,c:Cam,age:number,front:boolean){if(age<=0)return;const pw=new Path2D(),pk=new Path2D(),py=new Path2D();let n=0;
 for(const [x0,z0,y0,ph,col,sp] of CONF){if(front!==(z0>-29))continue;const y=y0-age*sp*1.4;if(y<.02)continue;const x=x0+.5*Math.sin(age*2.1+ph),z=z0+.3*Math.cos(age*1.7+ph),p:V3=[x,y,z];if(depthOf(c,p)<1.5)continue;
  const k=kAt(c,p),[sx,sy]=P(c,p),w=Math.max(3,.07*k),h=w*(.3+.7*Math.abs(Math.sin(age*6+ph))),a=ph+age*3,ca=Math.cos(a),sa=Math.sin(a);if(Math.abs(sx)>s.W||Math.abs(sy)>s.H)continue;
  const q:Pt[]=[[sx-ca*w+sa*h,sy-sa*w-ca*h],[sx+ca*w+sa*h,sy+sa*w-ca*h],[sx+ca*w-sa*h,sy+sa*w+ca*h],[sx-ca*w-sa*h,sy-sa*w+ca*h]];(col<.5?pw:col<.85?pk:py).addPath(polyPath(q,true));n++;}
 if(!n)return;s.knockout(pw);s.stroke(K,pw,1.2,.5);s.fill(K,pk,.92);s.knockout(py);s.fill(Y,py,.95);}
function stageDraw(s:Sheet,c:Cam){const{x0,x1,z0,z1,h}=STAGE,top=new Path2D(),front=new Path2D(),band=new Path2D(),back=new Path2D();
 addPoly(back,clipPoly(c,[[x0-1,0,z0-.5],[x1+1,0,z0-.5],[x1+1,2.6,z0-.5],[x0-1,2.6,z0-.5]]));
 addPoly(top,clipPoly(c,[[x0,h,z0],[x1,h,z0],[x1,h,z1],[x0,h,z1]]));addPoly(front,clipPoly(c,[[x0,0,z1],[x1,0,z1],[x1,h,z1],[x0,h,z1]]));
 addPoly(band,clipPoly(c,[[x0,h*.35,z1+.01],[x1,h*.35,z1+.01],[x1,h*.62,z1+.01],[x0,h*.62,z1+.01]]));
 s.fill(K,back,.9);const dots=new Path2D();for(let i=0;i<14;i++){const p=P(c,[x0-.5+i*(x1-x0+1)/13,1.9,z0-.49]),r=Math.max(3,.12*kAt(c,[x0,1.9,z0]));dots.addPath(polyPath([[p[0],p[1]-r],[p[0]+r,p[1]],[p[0],p[1]+r],[p[0]-r,p[1]]],true));}s.knockout(dots,.8);s.fill(Y,dots,.9);
 s.knockout(top);s.tone(K,top,.35);s.fill(K,front,.92);s.knockout(band,.85);s.fill(Y,band,.9);}
const CAM2:V3=[-52.1,1.75,-15.5];
function ch2Cam(t:number){const q=ch2T();
 return camKeysOf(t,mono<CK>([[0,...CAM2,-52.5,1.9,-31,2300],[q.bruno-.1,...CAM2,-52.25,1.75,-30.8,3300],[q.lift-.2,...CAM2,-52.4,2.05,-30.8,3700],
  [q.lift+.5,...CAM2,-52.5,2.55,-30.8,3500],[q.kt+.2,...CAM2,-52.5,2.4,-30.9,3000],[q.fans,...CAM2,-52.5,2.5,-31,2600],[q.end,...CAM2,-52.5,2.9,-31,2350]]));}
const ch2:Scene={
 draw(s,t){
  const q=ch2T(),tt=twos(t),c=ch2Cam(t),roar=sm(q.lift,q.lift+.5,t,easeOut),conf=tt-(q.fans-.3);
  frame(s);
  stadium(s,c,{t,cheer:.4+roar*1.1,flash:.6+roar*1.6+sm(q.sev,q.sev+.4,t)});
  confetti(s,c,conf,false);
  stageDraw(s,c);
  const bodies:Body[]=[{x:BR2[0],z:BR2[1],y:STAGE.h,yaw:FACE,pose:lifterPose(tt,0),prev:lifterPose(tt-1/12,0),style:BRUNO,mk:BRUNO_MK},
   {x:TR2[0],z:TR2[1],y:STAGE.h,yaw:FACE,pose:lifterPose(tt,1),prev:lifterPose(tt-1/12,1),style:TRIPPIER}];
  for(const m of MATES)bodies.push({x:m.x,z:m.z,y:STAGE.h,yaw:FACE+(hash(m.st.seed??1,4)-.5)*.5,pose:mateAt(m,tt),prev:mateAt(m,tt-1/12),style:m.st,detail:m.z<-32?'low':'auto'});
  const g=cupPt(tt),gl=sm(q.lift+.2,q.lift+.5,t)*(1-sm(q.lift+.9,q.lift+1.4,t));
  drawWorld(s,c,bodies,[{depth:depthOf(c,g)-.12,draw:()=>trophy(s,c,g,gl)}]);
  confetti(s,c,conf,true);
 },
 aperture(t){const c=ch2Cam(t),g=cupPt(t),[x,y]=P(c,g),r=Math.max(40,kAt(c,g)*.28);return apertureDisc(x,y,r,12);},
 still:8.6,
};

// ---------------- chapter 3 ("How he does it", a training demonstration — not the final): win it, look forward, one quick pass ----------------
// A drill on a training pitch in neutral kit: Bruno (navy training top) steps in and pokes the ball off a dribbler (red bib), settles it,
// lifts his head to look FORWARD first, spots a team-mate's run and plays one quick forward pass. His team attacks +x (screen right).
const OPP:A.AthleteStyle={...LINE,shirt:[R,.9],shorts:K,socks:K,trim:'paper',skin:SKIN_L,hairStyle:'short',number:null,seed:61,build:{height:1.8}};
const OPP2:A.AthleteStyle={...OPP,skin:SKIN_D,seed:62,build:{height:1.86}};
const BRUNO3:A.AthleteStyle={...BRUNO,shirt:[K,.88],pattern:'plain',shorts:K,socks:K,number:null,trim:'paper'};
const MATE3:A.AthleteStyle={...BRUNO3,skin:SKIN_L,build:{height:1.78},hair:[Y,.7],seed:73};
const B3X=0,B3Z=0;
const POKE_T=0,SET_T=.45,LOOK_T=.95,PASS_T=1.9,ARRIVE=2.65;
/** the poke: a lunge with the RIGHT leg into the ball (full reach .6 = τ 0) */
const lungeU=(tau:number)=>clamp(.6+tau/.7);
const POKE:V3=(()=>{const sk=A.solve(A.lunge(.6,{side:'r'}),BB,{x:B3X,z:-B3Z,yaw:0});const m=fromLib(mix3(sk.rAn as V3,sk.rToe as V3,.6) as A.V3);return[m[0]+.06,.11,m[2]];})();
/** his carry after the win: a small step forward, ball .5 m ahead */
const bX=(tau:number)=>B3X+.55*sm(SET_T-.2,LOOK_T,tau,easeInOutSine);
const SETPT=(tau:number):V3=>[bX(tau)+.52,.11,-.12];
const PASS_FROM:V3=(()=>{const sk=A.solve(A.strike(A.STRIKE_CONTACT,{foot:'r',power:.6}),BB,{x:B3X+.55,z:0,yaw:0});const m=fromLib(mix3(sk.rAn as V3,sk.rToe as V3,.5) as A.V3);return[m[0]+.1,.11,m[2]];})();
const TGT:V3=[12.4,.11,4.2];
const MATE_P:[number,number,number][]=[[-4,7,7.4],[.9,7.2,7.3],[1.4,8,7],[ARRIVE,TGT[0]-.55,TGT[2]+.25],[4.5,19,3.6]];
function mPos(p:[number,number,number][],tau:number){if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0};for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1];if(tau<b[0]){const u=(tau-a[0])/(b[0]-a[0]);return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/(b[0]-a[0]),vz:(b[2]-a[2])/(b[0]-a[0])};}}const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0};}
function ball3(tau:number):V3{
 if(tau<-.25){const o=opp3(tau);const ph=Math.sin(tau*9)*.12;return[o.x-.62+ph,.11,POKE[2]];}
 if(tau<POKE_T){const a=ball3(-.2501),u=sm(-.25,POKE_T,tau);return mix3(a,POKE,u);}
 if(tau<SET_T){const u=easeOut(sm(POKE_T,SET_T,tau)),s0=SETPT(SET_T);return[lerp(POKE[0],s0[0],u),.11+.18*Math.sin(Math.PI*u),lerp(POKE[2],s0[2],u)];}
 if(tau<PASS_T-.3)return SETPT(tau);
 if(tau<PASS_T){const u=sm(PASS_T-.3,PASS_T,tau);return mix3(SETPT(PASS_T-.3),PASS_FROM,u);}
 if(tau<ARRIVE){const u=(tau-PASS_T)/(ARRIVE-PASS_T),e=1-(1-u)*(1-u)*.35-.65*(1-u);return[lerp(PASS_FROM[0],TGT[0],e),.11+.05*Math.sin(Math.PI*u),lerp(PASS_FROM[2],TGT[2],e)];}
 const m=mPos(MATE_P,tau),v=Math.hypot(m.vx,m.vz)||1;return[m.x+m.vx/v*.6,.11,m.z+m.vz/v*.6];}
/** the dribbler: carries it at Bruno, loses it on the poke, staggers, then turns to chase */
const OSIDE=POKE[2]<0?-1:1,OLANE=POKE[2]+OSIDE*.4;
function opp3(tau:number){// carries it at Bruno on his right-hand lane, loses it on the poke, stumbles off to the side away from the team-mate (−z), then turns to chase
 let x=tau<-.1?lerp(7,1.3,clamp((tau+2.6)/2.5)):1.3-.8*easeOut(sm(-.1,1,tau)),z=OLANE-2*easeOut(sm(-.1,1.1,tau));
 let pose=A.dribble(((tau*2.3)%1+1)%1,{foot:'r',speed:.45}),yaw=Math.PI;
 if(tau>-.1)pose=A.blendPose(pose,A.posed({lean:30,pitch:10,lHipF:30,rHipF:-14,lKnee:50,rKnee:24,lShA:50,rShA:40,lShF:30,rShF:-10,lElb:40,rElb:30,neckP:18}),sm(-.1,.2,tau)*(1-sm(1,1.5,tau)));
 if(tau>1.1){pose=A.blendPose(pose,A.runCycle(((tau*1.6)%1+1)%1,{speed:.5}),sm(1.1,1.5,tau));yaw=angLerp(Math.PI,0,sm(1,1.5,tau));x+=Math.max(0,tau-1.3)*3.4;}
 return{x,z,yaw,pose};}
function opp2At(tau:number){const x=9.2,z=-2.6;let pose=A.backpedal(((tau*.8)%1+1)%1),yaw=Math.PI;pose=A.blendPose(A.stand(),pose,.5);
 if(tau>PASS_T){yaw=angLerp(Math.PI,Math.atan2(TGT[2]-z,TGT[0]-x),sm(PASS_T,PASS_T+.4,tau));pose=A.blendPose(pose,A.runCycle(((tau*1.5)%1+1)%1,{speed:.6}),sm(PASS_T+.1,PASS_T+.5,tau));return{x:x+Math.max(0,tau-PASS_T-.3)*2.6,z:z+Math.max(0,tau-PASS_T-.3)*1.2,yaw,pose};}
 return{x,z,yaw,pose};}
function mate3(tau:number){const m=mPos(MATE_P,tau),v=Math.hypot(m.vx,m.vz);let pose=A.blendPose(A.stand(),A.runCycle(((tau*1.55)%1+1)%1,{speed:clamp(v/7)}),clamp((v-.3)/1.5));
 let yaw=v>.4?Math.atan2(m.vz,m.vx):Math.atan2(-m.z,-m.x);
 if(tau>.5&&tau<1.2){pose={...pose,lShF:pose.lShF+.9*sm(.5,.8,tau)*(1-sm(1,1.2,tau)),lShA:pose.lShA+.6*sm(.5,.8,tau)*(1-sm(1,1.2,tau))};}// an arm up: "here!"
 if(tau>ARRIVE-.1)pose=A.blendPose(pose,A.dribble(((tau-ARRIVE)*2.2)%1,{foot:'r',speed:.8}),sm(ARRIVE-.1,ARRIVE+.2,tau));
 return{x:m.x,z:m.z,yaw,pose};}
/** Bruno: ready → the RIGHT-leg poke (τ 0) → settle it, step on → HEAD UP, look forward (τ .95) → one quick right-foot pass (τ 1.9) */
const READY=A.posed({lHipF:30,rHipF:26,lKnee:42,rKnee:40,lAnk:-8,rAnk:-8,lean:22,pitch:4,lShA:24,rShA:24,lElb:44,rElb:44,neckP:-4});
const HEADUP=A.posed({lHipF:16,rHipF:10,lKnee:24,rKnee:18,lean:8,pitch:2,lShA:28,rShA:22,lShF:10,rShF:-6,lElb:40,rElb:36,neckP:-24,neckY:4});
function bruno3(tau:number){let pose=A.blendPose(A.backpedal(((tau*1.1)%1+1)%1),READY,.55),yaw=0;
 if(tau>-.55)pose=A.blendPose(pose,A.lunge(lungeU(tau),{side:'r'}),easeInOutSine(sm(-.55,-.3,tau))*(1-sm(SET_T-.1,SET_T+.25,tau)));
 if(tau>SET_T-.1&&tau<PASS_T-.5)pose=A.blendPose(pose,A.dribble(((tau-SET_T)*1.8)%1,{foot:'r',speed:.2}),sm(SET_T-.1,SET_T+.2,tau)*(1-sm(LOOK_T-.25,LOOK_T,tau)));
 if(tau>LOOK_T-.25)pose=A.blendPose(pose,HEADUP,sm(LOOK_T-.25,LOOK_T+.05,tau,easeOutBack)*(1-sm(PASS_T-.7,PASS_T-.45,tau)));
 if(tau>LOOK_T+.1&&tau<PASS_T-.5){const sc=Math.sin((tau-LOOK_T-.1)*5)*sm(LOOK_T+.1,LOOK_T+.3,tau);pose={...pose,neckY:pose.neckY+.3*sc};}
 if(tau>PASS_T-.75){pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-PASS_T)/1.0),{foot:'r',power:.6}),easeInOutSine(sm(PASS_T-.75,PASS_T-.5,tau)));yaw=angLerp(0,Math.atan2(TGT[2]-PASS_FROM[2],TGT[0]-PASS_FROM[0])*.8,sm(PASS_T-.8,PASS_T-.3,tau));}
 return{x:bX(tau),z:B3Z,yaw,pose};}
const tau3=(t:number)=>{const c1=T(2,'Bruno wins'),c2=T(2,'before anything else'),c3=T(2,'he looks forward'),c4=T(2,'A teammate'),c5=T(2,'One quick pass'),c6=T(2,'his team is attacking');
 return key(t,mono<[number,number]>([[0,-2.6],[c1+.45,POKE_T],[c2,SET_T+.05],[c3+.25,LOOK_T],[c4+.2,1.25],[c5+.35,PASS_T],[c6,ARRIVE+.2],[SEC(2),4.3]]) as unknown as Key[],linear);};
const TREES:V3[][]=(()=>{const out:V3[][]=[];for(let i=0;i<22;i++){const x=-40+i*4.2,h=7+4*hash(i,3),p:V3[]=[];for(let k=0;k<10;k++){const a=k/10*TAU;p.push([x+Math.cos(a)*3.4,h*.5+Math.sin(a)*h*.5,42]);}out.push(p);}
 for(let i=0;i<16;i++){const z=-24+i*4.2,h=7+4*hash(i,7),p:V3[]=[];for(let k=0;k<10;k++){const a=k/10*TAU;p.push([52,h*.5+Math.sin(a)*h*.5,z+Math.cos(a)*3.4]);}out.push(p);}return out;})();
const CONES:[number,number][]=[[-6,-5],[-2,-5],[2,-5],[6,-5],[10,-5],[14,-5],[18,-5],[-6,11],[18,11]];
function training(s:Sheet,c:Cam){
 s.field(B,.2,.4);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-60,0,-40],[60,0,-40],[60,0,44],[-60,0,44]]));s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.6);
 const trees=new Path2D();for(const p of TREES)addPoly(trees,clipPoly(c,p));s.knockout(trees);s.fill(K,trees,.55);s.tone(B,trees,.55);
 const st=new Path2D();for(let x=-60;x<60;x+=8)addPoly(st,clipPoly(c,[[x,0,-40],[x+4,0,-40],[x+4,0,44],[x,0,44]]));s.tone(B,st,.16);
 const ln=new Path2D();groundLine(ln,c,[-40,-8],[40,-8],.14);groundLine(ln,c,[-40,14],[40,14],.14);s.knockout(ln,.85);
 const cn=new Path2D();for(const[x,z] of CONES)addPoly(cn,clipPoly(c,[[x-.18,0,z],[x+.18,0,z],[x,.32,z]]));s.knockout(cn);s.fill(R,cn,.95);s.fill(Y,cn,.5);
}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,gaps?:[number,number][]){
 const q=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
const ch3T=()=>({how:T(2,'How he does it'),wins:T(2,'Bruno wins'),bae:T(2,'before anything else'),look:T(2,'he looks forward'),mate:T(2,'A teammate'),pass:T(2,'One quick pass'),att:T(2,'his team is attacking'),end:SEC(2)});
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),m=mate3(Math.max(tau,ARRIVE-.4));
 return camKeysOf(t,mono<CK>([[0,1.5,5.8,-17,2.5,.8,1.5,2300],[q.wins-.2,.6,3.4,-10,.8,.9,.2,2500],[q.wins+.8,.4,3.2,-9.2,.9,.95,0,2750],[q.look-.75,.6,3.2,-9.4,1,.95,0,2750],
  [q.look+.05,-5.6,2.7,.3,5,.9,1.1,1750],[q.mate+.4,-5.8,2.8,.4,6.5,.9,2.6,1650],[q.pass-.3,3,6.2,-17,6,.7,2.2,2100],
  [q.att+.2,6.5,6.2,-17,10.5,.7,2.6,2100],[q.end,9.5,6,-17,m.x-1,.7,3,2250]]));}
function demoBodies(tau:number,tp:number,tpp:number):Body[]{
 const b=bruno3(tp),bp=bruno3(tpp),o=opp3(tp),op=opp3(tpp),o2=opp2At(tp),o2p=opp2At(tpp),m=mate3(tp),mp=mate3(tpp);
 return[{...b,prev:bp.pose,style:BRUNO3,mk:{beard:true},smear:(tp>-.25&&tp<.15)||(tp>PASS_T-.15&&tp<PASS_T+.2)},{...o,prev:op.pose,style:OPP},{...o2,prev:o2p.pose,style:OPP2},{...m,prev:mp.pose,style:MATE3,smear:tp>ARRIVE-.2&&tp<ARRIVE+.1}];}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  frame(s);training(s,c);
  const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.06]);
  // "A teammate is running": a red arrow along his run
  const ru=sm(q.mate-.1,q.mate+.5,t,easeOut)*(1-sm(q.att,q.att+.5,t));
  if(ru>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const u=i/8*ru,p=mPos(MATE_P,lerp(1.2,ARRIVE,u));pts.push([p.x,.05,p.z]);}arrow3(s,c,pts,Math.max(7,kAt(c,[8,0,6])*.08),R,.95);}
  // "One quick pass": the dashed yellow line of the pass, drawn with the ball
  const pl=sm(q.pass,q.pass+.35,t)*(1-sm(q.att+.6,q.att+1.1,t));
  if(pl>.02){const e=clamp((tp-PASS_T)/(ARRIVE-PASS_T)),pts:V3[]=[];const hi=Math.max(.15,e);for(let i=0;i<=10;i++)pts.push([lerp(PASS_FROM[0],TGT[0],i/10*hi),.04,lerp(PASS_FROM[2],TGT[2],i/10*hi)]);arrow3(s,c,pts,Math.max(7,kAt(c,[6,0,2])*.09),Y,.95*pl,gaps);}
  const bl=ball3(tp);
  drawWorld(s,c,demoBodies(tau,tp,tpp),[ballItem(s,c,bl,ball3(tpp),tt*6,14)]);
  // "Bruno wins": a spark at the poke
  if(tp>-.06&&tp<.35){const p=P(c,POKE);sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,POKE)*.55)*sm(-.06,.08,tp,easeOut),{n:9,seed:61,g:1-sm(.12,.35,tp),width:Math.max(6,kAt(c,POKE)*.03)});}
  // "he looks forward": a ring round his head and a dashed sight line forward to the team-mate
  const ey=sm(q.look,q.look+.45,t,easeOut)*(1-sm(q.pass-.1,q.pass+.3,t));
  if(ey>.02){const b=bruno3(tp),sk=A.solve(b.pose,BB,{x:b.x,z:-b.z,yaw:b.yaw}),eye=fromLib(sk.face),m=mate3(tp),tgt:V3=[m.x,1.4,m.z];
   const a=P(c,eye),bb=P(c,mix3(eye,tgt,ey*.92)),w=Math.max(8,kAt(c,eye)*.05),g2:[number,number][]=[];for(let i=0;i<9;i++)g2.push([(i+.6)/9.4,(i+.95)/9.4]);
   if(depthOf(c,tgt)>NEAR){s.knockout(ribbon([a,bb],w*1.7,{seed:13,taper:.25,wobble:.5,gaps:g2}),.9);const rb=ribbon([a,bb],w,{seed:13,taper:.25,wobble:.5,gaps:g2});s.fill(Y,rb,.95);s.stroke(K,rb,Math.max(2,w*.14),.85);}
   const hp=fromLib(sk.head),hq=P(c,hp),hr=kAt(c,hp)*.24;const rr=ribbon(Array.from({length:24},(_,i)=>[hq[0]+Math.cos(i/24*TAU)*hr,hq[1]+Math.sin(i/24*TAU)*hr] as Pt),Math.max(4,hr*.14),{close:true,taper:0,wobble:.8,seed:5});s.knockout(rr,.9);s.fill(Y,rr,.95);}
  // the pass: a spark off the boot; "attacking": speed lines off the team-mate's run
  if(tp>PASS_T-.02&&tp<PASS_T+.25){const p=P(c,PASS_FROM);sparkBurst(s,Y,p[0],p[1],Math.max(45,kAt(c,PASS_FROM)*.5)*sm(PASS_T-.02,PASS_T+.08,tp,easeOut),{n:8,seed:44,g:1-sm(PASS_T+.08,PASS_T+.25,tp),width:6});}
  if(t>q.att-.1){const m=mate3(tp),p=P(c,[m.x,.9,m.z]),f=P(c,[m.x+2,.9,m.z-.3]);speedLines(s,K,p[0],p[1],Math.atan2(p[1]-f[1],p[0]-f[0]),{n:4,seed:9,len:Math.max(60,kAt(c,[m.x,1,m.z])*1.1),spread:kAt(c,[m.x,1,m.z])*.5,width:4,cov:.7*sm(q.att-.1,q.att+.3,t)});}
 },
 aperture(t){const c=ch3Cam(t),p=ball3(tau3(t)),[x,y]=P(c,p),r=Math.max(34,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:9.4,
};

// ---------------- chapter 4 (duotone teaching plate): win it, look forward first, one quick pass ----------------
const G4:Pt=[-300,330],H4=640,AZ4=22;
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:AZ4,elevation:6});
const TM4:Pt=[380,150],TMH=250;
const CAM4M=A.figureCam({x:TM4[0],y:TM4[1],height:TMH,azimuth:AZ4-10,elevation:5});
const BDUO:A.AthleteStyle={...BRUNO3,shirt:[Y,.92],shorts:[K,.85],socks:[Y,.92],hair:K,skin:[[Y,.5],[K,.46]],shade:[K,.22],trim:K,detail:'high'};
const MDUO:A.AthleteStyle={...BDUO,skin:[[Y,.45],[K,.3]],shirt:[Y,.7],shorts:[K,.6],socks:[Y,.7],hair:[K,.7],detail:'mid',seed:74,build:{height:1.78}};
const ch4T=()=>{const win=T(3,'win the ball'),look=T(3,'look forward first'),pass=T(3,'quick pass');const WIN=win+.4,PS=Math.max(pass+.35,look+1.3);return{yt:T(3,'Your turn'),win,WIN,look,pass,PS,end:SEC(3)};};
/** the lesson figure's pose on the lesson clock */
function lesson4(t:number):A.Pose{const q=ch4T();
 let p=A.blendPose(A.backpedal(((t*1.1)%1+1)%1),READY,.6);
 if(t>q.WIN-.55)p=A.blendPose(p,A.lunge(clamp(.6+(t-q.WIN)/.7),{side:'r'}),easeInOutSine(sm(q.WIN-.55,q.WIN-.3,t))*(1-sm(q.look-.3,q.look,t)));
 if(t>q.look-.3)p=A.blendPose(p,HEADUP,sm(q.look-.3,q.look+.05,t,easeOutBack)*(1-sm(q.PS-.7,q.PS-.45,t)));
 if(t>q.PS-.75)p=A.blendPose(p,A.strike(clamp(A.STRIKE_CONTACT+(t-q.PS)/1.0),{foot:'r',power:.6}),easeInOutSine(sm(q.PS-.75,q.PS-.5,t)));
 return p;}
const L4=(p:A.V3):Pt=>{const a=CAM4.project(p);return[a[0],a[1]];};
function boot4(pose:A.Pose):A.V3{const sk=A.solve(pose,BB,{});const m=mix3(sk.rAn as V3,sk.rToe as V3,.55);return[m[0]+.1,Math.max(.13,m[1]+.02),m[2]];}
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t);
  const v=key(t,mono<number[]>([[0,40,-10,.92],[q.win,10,-20,.96],[q.look,80,-40,.94],[q.PS,140,-30,.93],[q.end,160,-20,.95]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(40,G4[1]-30,r*2.1,r*.32,40);
  s.knockout(pool(620),.6);s.tone(Y,pool(620),.2);s.tone(Y,pool(420),.32);s.tone(Y,pool(240),.45);
  s.knockout(ribbon([[-1200,G4[1]+90],[1400,TM4[1]+30]],12,{taper:.1,wobble:1.2}),.9);
  const pose=lesson4(tt),pv=lesson4(tt-1/12);
  // the team-mate far ahead: jogging, an arm up once he is seen
  const mp=A.blendPose(A.runCycle(((tt*1.3)%1+1)%1,{speed:.35}),A.posed({lShF:150,lShA:30,lElb:20,rShF:-10,lHipF:10,rHipF:6,lKnee:14,rKnee:12,lean:4}),sm(q.look+.2,q.look+.5,tt)*(1-sm(q.PS+.4,q.PS+.7,tt)));
  const mpp=A.blendPose(A.runCycle((((tt-1/12)*1.3)%1+1)%1,{speed:.35}),mp,.5);
  const mr=drawPlayer(s,mp,mpp,CAM4M,MDUO,{yaw:Math.PI*.92});
  // look forward first: yellow sight lines from his eyes to the team-mate, a ring on him
  const lk=sm(q.look-.05,q.look+.5,tt,easeOut)*(1-sm(q.PS+.1,q.PS+.4,tt));
  const r=drawPlayer(s,pose,pv,CAM4,BDUO,{},(tt>q.WIN-.25&&tt<q.WIN+.2)||(tt>q.PS-.2&&tt<q.PS+.3),{beard:true});
  if(lk>.02){const e=r.joints.face,tg=mr.joints.head;for(const [dy,cov] of [[0,1],[-60,.6],[60,.6]] as [number,number][]){const b:Pt=[lerp(e[0],tg[0],lk),lerp(e[1],tg[1]+dy,lk)];dashed(s,[e,b],1,cov===1?16:10);}
   s.stroke(Y,ring(tg[0],tg[1]+20,70*lk,90*lk),9,.95);}
  // the ball: rolls in with the dribbler's touch, poked away on "win the ball", settled, then passed on the dashed arrow
  const pk=boot4(A.lunge(.6,{side:'r'})),st0=boot4(READY),hit=boot4(A.strike(A.STRIKE_CONTACT,{foot:'r',power:.6}));
  let b:Pt,br=26,flying=false;
  if(tt<q.WIN){const u=sm(q.yt+.2,q.WIN,tt,x=>x*(2-x));const s0:A.V3=[pk[0]+3.2,.13,pk[2]];b=L4([lerp(s0[0],pk[0],u),.13,lerp(s0[2],pk[2],u)]);}
  else if(tt<q.PS-.3){const u=easeOut(sm(q.WIN,q.WIN+.4,tt));b=L4([lerp(pk[0],st0[0]+.25,u),.13+.2*Math.sin(Math.PI*u),lerp(pk[2],st0[2],u)]);}
  else if(tt<q.PS){const u=sm(q.PS-.3,q.PS,tt);b=L4([lerp(st0[0]+.25,hit[0],u),.13,lerp(st0[2],hit[2],u)]);}
  else{flying=true;const h=L4(hit),g:Pt=[mr.joints.rToe[0]-10,mr.joints.rToe[1]+8],u=sm(q.PS,q.PS+.7,tt,x=>1-(1-x)*(1-x));b=[lerp(h[0],g[0],u),lerp(h[1],g[1],u)-40*Math.sin(Math.PI*u)];br=lerp(26,16,u);
   const path:Pt[]=[];for(let i=0;i<=14;i++){const w=i/14;path.push([lerp(h[0],g[0],w),lerp(h[1],g[1],w)-40*Math.sin(Math.PI*w)]);}dashed(s,path,sm(q.PS,q.PS+.45,tt),16);}
  if(flying&&tt<q.PS+.5){const a=Math.atan2(b[1]-L4(hit)[1],b[0]-L4(hit)[0]);speedLines(s,K,b[0],b[1],a,{n:5,seed:42,len:200,width:9,cov:.85});}
  ballAt(s,b[0],b[1],br,tt*(flying?14:4),{duo:true});
  if(tt>=q.WIN-.05&&tt<q.WIN+.3)sparkBurst(s,Y,b[0],b[1],110*sm(q.WIN-.05,q.WIN+.1,tt,easeOut),{n:9,seed:41,g:1-sm(q.WIN+.1,q.WIN+.3,tt),width:13});
  if(tt>=q.PS&&tt<q.PS+.3)sparkBurst(s,Y,b[0],b[1],120*sm(q.PS,q.PS+.12,tt,easeOut),{n:10,seed:43,g:1-sm(q.PS+.12,q.PS+.3,tt),width:14});
  if(tt>q.PS+.65&&tt<q.PS+1.2){const g=sm(q.PS+.65,q.PS+.85,tt,easeOutBack)*(1-sm(q.PS+.9,q.PS+1.2,tt));s.stroke(Y,ring(b[0],b[1]+10,60*g,22*g),8,.95);}
 },
 still:6,
};

const story:RisoStory={
 id:'bruno-guimaraes-signature',format:'11v11',title:'Bruno Guimarães: win it, then pass forward',
 theme:'After you win the ball, look forward first for a quick pass.',
 ageNote:'EFL Cup final, Liverpool 1–2 Newcastle United, Wembley Stadium, London, 16 March 2025: the captain lifts the trophy. Chapter 3 is a training demonstration, not the match.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a quick win-and-pass — a red dash is cut, a yellow arrow shoots forward and the ball darts after it. Reduced motion: the still mark. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  s.fill(R,ribbon([[x-120,y+50],[x-10,y+4]],12,{seed,taper:.5,wobble:1}),.9*fade);
  const gaps:[number,number][]=[];for(let g=.05;g<1;g+=.16)gaps.push([g,g+.07]);
  const e:Pt=[x+lerp(0,190,u),y+lerp(0,-50,u)];
  s.fill(Y,ribbon([[x,y],e],14,{seed:seed+1,taper:.3,pressure:.2,wobble:1,gaps}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],28,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default story;
