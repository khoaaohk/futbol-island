/** Iconic play film: Ruud van Nistelrooy's signature, the six-yard-box poacher. Manchester United 3–0 Millwall, the 2004 FA Cup final,
 * Millennium Stadium, Cardiff, Saturday 22 May 2004 (15:00 kick-off): the 81st-minute third goal, Ryan Giggs's driven cross from the left
 * slid home by Van Nistelrooy from three yards. A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written match reports (we did not watch the footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Van Nistelrooy a signature, not a match ("Signature: the six-yard-box poacher"; lesson "Follow every
 * shot in; rebounds often fall to the striker who keeps running"). This goal is a precisely described example of it in a final: while Giggs
 * ran down the left, Van Nistelrooy kept going all the way into the six-yard box and was "in the right position" (BBC) to slide in a cross
 * from three yards. It is NOT a rebound, so the narration never calls it one: the replay shows the keep-running habit, and the lesson chapter
 * (a generic duotone drill, not the match) shows the rebound version of the same habit.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2004 FA Cup final" (raw): 22 May 2004, 15:00 BST, Millennium Stadium, Cardiff, attendance 71,350, referee Jeff Winter;
 *    Ronaldo 44', Van Nistelrooy 65' pen, 81'; "Giggs went on a run down the left and crossed for Van Nistelrooy to tap in from three yards
 *    out. There were suggestions that Van Nistelrooy was offside at the moment of Giggs' pass, but television replays showed his feet were
 *    grounded in an onside position"; line-ups and squad numbers (United: Howard; G. Neville, Brown, Silvestre, O'Shea; Ronaldo 7, Fletcher 24,
 *    Keane 16, Giggs 11; Scholes 18; Van Nistelrooy 10. Millwall: Marshall 33; Elliott 25, Lawrence 2, Ward 12, Ryan 3 (Cogan 37 from 74');
 *    Ifill 7, Wise 19, Livermore 8, Sweeney 26; Cahill 4; Harris 9 (McCammon 23 from 75')); kit templates (United red shirts, white shorts,
 *    white socks; Millwall blue shirts with white, blue shorts, blue socks); weather "scattered clouds, 13 °C".
 *  - The Guardian, Kevin McCarra, "United triumph by taking the job seriously", 24 May 2004
 *    https://www.theguardian.com/football/2004/may/24/match.manchesterunited ("Ruud van Nistelrooy's second goal in the 81st minute. Ryan
 *    Giggs drove the ball across for him to convert and there were claims for offside. Some television angles, however, suggest that his feet
 *    were legit, with only his jutting torso breaching the rules").
 *  - BBC Sport, "Man Utd win FA Cup", 22 May 2004  http://news.bbc.co.uk/sport1/hi/football/fa_cup/3725063.stm ("Van Nistelrooy then tapped
 *    home a driven Giggs cross"; "The prolific Dutchman was then in the right position to score United's third, sliding the ball home after
 *    more good work from Giggs"; "81 mins: Van Nistelrooy makes it three").
 * CONFIRMED by those accounts: the match, date, ground, minute and score (2–0 → 3–0); Giggs ran down the LEFT and DROVE the ball ACROSS; Van
 * Nistelrooy SLID it home from THREE YARDS; he was right on the last defender's line when Giggs crossed (the offside claim; feet onside); the
 * players' names and numbers; United in red shirts, white shorts and white socks, Millwall in blue; a daytime kick-off with scattered cloud.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, path and timing between those beats; where Giggs crossed
 * from (drawn from just inside the left corner of the box) and with which foot (drawn with his LEFT, his stronger foot); the cross's height
 * (drawn low and skidding, our reading of "driven"); which foot Van Nistelrooy slid in with (drawn RIGHT) and where it went in (low, inside the
 * far post); that keeper Andy Marshall was covering his near post and dived across too late; the defenders' spots (Elliott chasing Giggs,
 * Lawrence level with Van Nistelrooy, Ward stretching at the near post); Marshall's kit (drawn yellow, unverified) and the referee's (navy);
 * the details of Millwall's shirt (drawn blue with white trim); which way United attacked on screen (left to right from the main stand);
 * which ends the two sets of fans filled; the Millennium Stadium roof (drawn as a ring round an open sky); the celebration.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with Giggs's run down the left, the driven cross and the slide into the net; 2 = slow-motion replay from a low near-touchline camera
 * on a long lens: Van Nistelrooy never stops running, into the six-yard box, while Giggs goes down the far side; 3 = the reverse replay from
 * behind the goal, through the net: the cross zips across, he slides it home from three yards, the net, then up to the red end; 4 = the
 * lesson, a duotone drill (follow the shot in; the keeper pushes it out; the rebound falls to the striker who keeps running). NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so left feet stay left feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: red (United, skin), blue (Millwall, sky, grass with yellow, shade), yellow (keeper, grass, the lesson), navy (key line, roof,
 * referee). The lesson chapter is a duotone beat (navy + yellow on paper). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

// ---------------- the narration (script.json mirrors it) and its provisional timing ----------------
/** `tail` = silence after the last word (the action finishes and the .65 s passage plays in it). Cue words must stay substrings, in order. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Cup final, live',text:'Cardiff, 2004: the FA Cup final. Manchester United lead Millwall two-nil. Ryan Giggs races down the left. Ruud van Nistelrooy keeps running... Giggs drives it across... Van Nistelrooy! Three-nil!',tail:2.4,
  cues:['Cardiff','the FA Cup final','Manchester United lead','two-nil','Ryan Giggs','down the left','keeps running','drives it across','Van Nistelrooy!','Three-nil']},
 {label:'Watch it again',text:'Watch it again, slowly. While Giggs runs, Van Nistelrooy never stops. He sprints right into the six-yard box.',tail:1.2,
  cues:['Watch it again','slowly','While Giggs runs','never stops','He sprints','six-yard box']},
 {label:'Three yards out',text:"Giggs's cross zips in, and he slides it home from three yards. Easy, because he got there first!",tail:2.4,
  cues:["Giggs's cross",'zips in','slides it home','three yards','Easy','got there first']},
 {label:'Your turn',text:'Your turn: follow every shot in. When the keeper pushes it out, the rebound falls to the striker who keeps running!',tail:2.2,
  cues:['Your turn','follow every shot in','keeper pushes it out','the rebound','who keeps running']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py van-nistelrooy-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/van-nistelrooy-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/van-nistelrooy-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('van-nistelrooy: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`van-nistelrooy film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}

const K='navy',R='red',Y='yellow',B='blue';
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre (W/2,H/2) at `zoom` units per world unit, ignoring safe/fit.
 * The engine's arrival scale (passage) still multiplies in, so seams stay pixel-exact. */
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
/** units per metre at a point */
const kAt=(c:Cam,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
/** polygon clipped against the near plane, then projected */
function clipPoly(c:Cam,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
/** add a polygon with a normalised winding so overlapping parts in one path never cancel */
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let a2=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];a2+=a[0]*b[1]-b[0]*a[1];}const r=a2<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
/** a painted line on the grass (width w metres) as a projected quad */
function groundLine(path:Path2D,c:Cam,a:[number,number],b:[number,number],w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
type CK=[number,number,number,number,number,number,number,number];// t, pos xyz, look xyz, focal (units)
const camKeysOf=(t:number,K0:CK[],e=easeIO)=>{const v=key(t,K0 as unknown as Key[],e,true);return makeCam([v[0],v[1],v[2]],[v[3],v[4],v[5]],v[6]);};

// ---------------- the Millennium Stadium on a May afternoon: a closed bowl of red and blue fans, the roof ring round an open sky ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-146,74],[41,74],[41,-74],[-146,-74]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA]: 0 far side, 1 behind the goal United attack, 2 the main stand (behind the camera), 3 the far end */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],30,OUT[j][1]],[OUT[i][0],30,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 United red / 2 Millwall blue, phase] — a cup final splits the bowl: red behind this goal
 * and along the near half of the sides, blue at the far end (which end each club had is inferred) */
const CROWD=(()=>{const r=rng(2204),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){for(let i=0;i<380;i++){const c=r(),u=r();
 const red=st===1||(st===0&&u>.55)||(st===2&&u<.45);out.push([st,u,.04+r()*.92,c<.3?0:red?1:2,r()*TAU]);}}return out;})();
/** scattered cloud (the day's weather): paper puffs high in the sky */
const CLOUDS:[number,number,number,number][]=(()=>{const r=rng(522),out:[number,number,number,number][]=[];for(let i=0;i<9;i++)out.push([-160+r()*230,70+r()*40,-120+r()*240,10+r()*14]);return out;})();
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // afternoon sky: a pale blue screen, deeper toward the top, scattered paper cloud
 s.field(B,.2,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-700],[-Bnd,hz-560]],true),.18);
 {const cl=new Path2D();let n=0;for(const[x,y,z,r0] of CLOUDS){const p:V3=[x,y,z];if(depthOf(c,p)<20)continue;const k=kAt(c,p),[px,py]=P(c,p);if(Math.abs(px)>Bnd||Math.abs(py)>Bnd)continue;const w=r0*k,h=w*.32;
  for(const[ox,oy,s0] of [[0,0,1],[-.55,.15,.7],[.6,.18,.75],[.2,-.3,.6]] as const){const pts:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU;pts.push([px+ox*w+Math.cos(a)*w*.5*s0,py+oy*h+Math.sin(a)*h*s0]);}addPoly(cl,pts);}n++;}
  if(n)s.knockout(cl,.85);}
 // stands: knocked out, printed navy, terraces as stepped bands, the roof ring (its trusses in navy), then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],35,ub[2]],[ua[0],35,ua[2]]]));
  const fa=mix3(q[3],q[0],.22),fb=mix3(q[2],q[1],.22);addPoly(roof,clipPoly(c,[[ua[0],35,ua[2]],[ub[0],35,ub[2]],[fb[0],34.2,fb[2]],[fa[0],34.2,fa[2]]]));});
 s.knockout(stands);s.tone(K,stands,.5);s.tone(B,stands,.16);s.tone(K,terr,.3);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(col===2?.25:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1]){s.knockout(heads[1],.9);s.fill(R,heads[1],.85);}if(seen[2])s.fill(B,heads[2],.7);
 // red flags and scarves waving in the red end once the goal is in (paper flecks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=r()<.6?1:0,p=bil(STANDS[st],st===0?.55+r()*.45:r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.9);
 // grass: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-111,0,-40],[14,0,-40],[14,0,40],[-111,0,40]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // advertising boards at the pitch edge
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.8);s.tone(R,boards,.3);
 if(!o.noGoal)goal(s,c,o.net);
}
/** the goal at x=0 (`light`: seen from behind, printed over the players, a thin mesh): halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3,sideOnly?:number,light=false){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 if(sideOnly){grid((u,v)=>side(sideOnly*W,v,u),4,6);s.tone(K,vol,.12);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);return;}
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 if(light){s.tone(K,vol,.08);s.stroke(K,mesh,Math.max(1.6,.012*kAt(c,[1.5,1,0])),.5);}else{s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);}
 const fr=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];fr.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(fr);
}

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline, a player's LEFT when he faces the goal); the library
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Giggs's left foot is his left foot on
// screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.88],[R,.2]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]];
const LINE={line:K,boots:K,hair:K,shade:[B,.32] as A.InkFill};
/** United: red shirts with white numbers, white shorts, white socks (the match's kit template) */
const UTD=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.95],shorts:'paper',socks:'paper',trim:K,numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Millwall: blue shirts with white trim, blue shorts, blue socks (the kit template; the shirt's details unverified) */
const MIL=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[B,.92],shorts:[B,.92],socks:[B,.92],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:11,...o});
const RB:A.Build={height:1.88,bulk:1.02};
const RVN:A.AthleteStyle=UTD({number:10,hair:K,build:RB,seed:10});
const GIGGS:A.AthleteStyle=UTD({number:11,hair:K,build:{height:1.8,bulk:.95},seed:31});
const ELLIOTT:A.AthleteStyle=MIL({number:25,skin:SKIN_M,build:{height:1.8},seed:25});
const LAWRENCE:A.AthleteStyle=MIL({number:2,build:{height:1.85},seed:2});
const WARD:A.AthleteStyle=MIL({number:12,build:{height:1.9,bulk:1.05},seed:12});
const KEEPER:A.AthleteStyle={...LINE,shirt:[Y,.95],shorts:K,socks:[Y,.95],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.9},seed:33};
const REF:A.AthleteStyle={...LINE,shirt:[K,.88],shorts:K,socks:K,skin:SKIN_L,hairStyle:'bald',hair:null,seed:17};
/** a figure on the pitch: ground (x,z) in this world, heading yaw (radians), the pose now and one drawn frame earlier (secondary motion) */
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
/** the ball: paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Van Nistelrooy's touch) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const SHOT=.24,T_CROSS=-.9;
type MKey=[number,number,number];// τ, x, z
type Mover={style:A.AthleteStyle;path:MKey[]};
function moverPos(p:MKey[],tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
/** true gait: phase from distance covered (≈ 2.3 m a stride cycle), speed from the path; idle players turn to watch the ball */
function moverState(path:MKey[],tau:number,ball:V3,idle:()=>A.Pose=A.stand):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(path,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}

// Giggs runs down the left (the far side) and drives it across from just inside the box; Van Nistelrooy runs from the D all the way into the
// six-yard box, level with the last defender when Giggs crosses (all positions inferred; the run and the offside line are from the reports)
const GIGGS_P:MKey[]=[[-12,-54,28],[-8,-41,27.4],[-4,-23,24.2],[-2,-15.4,20.4],[T_CROSS,-11.6,17.4],[0,-10.4,16.6],[2,-9.6,16]];
const GIGGS_FOOT:V3=[-11.0,.11,17.0];
const SLP:[number,number]=[-5.2,-.25];// where Van Nistelrooy goes down into the slide (world x,z)
const SH=-.08;// his heading in the slide (straight at the goal, a touch toward the far post)
const SLIDE_DUR=1.05,SLC=.45,SL0=-SLC*SLIDE_DUR;// slide clock: contact at slide t = .45 on τ = 0
const RVN_P:MKey[]=[[-12,-26,4],[-6,-20,3],[-3.2,-15.5,2],[-1.8,-11.6,1.1],[T_CROSS,-8.6,.4],[SL0,SLP[0],SLP[1]]];
const LAW_P:MKey[]=[[-12,-20,3],[-4,-11.6,2.4],[T_CROSS,-8.4,1.5],[0,-5.9,.9],[1.6,-5.1,.9]];
const WARD_P:MKey[]=[[-12,-19,-3],[-4,-10.2,3.6],[T_CROSS,-6.6,5.4],[0,-4.9,4.9],[1.6,-4.6,4.6]];
const ELL_P:MKey[]=[[-12,-47,24.6],[-8,-36,24.4],[-4,-20,22],[-2,-13.6,19.4],[T_CROSS,-10.4,17.9],[0,-9.6,17],[2,-9.2,16.2]];
const KEEP_X=-.9;
const OTHERS:Mover[]=[
 {style:MIL({number:37,seed:40}),path:[[-12,-19,-14],[T_CROSS,-10,-10],[0,-8.6,-8.8],[2,-8.2,-8.4]]},// Cogan, far side
 {style:MIL({number:8,seed:41}),path:[[-12,-26,6],[-3,-19,8],[0,-16,6.5],[2,-15,6]]},// Livermore
 {style:MIL({number:19,seed:42}),path:[[-12,-28,-4],[0,-19,-2.5],[2,-17.5,-2]]},// Wise
 {style:MIL({number:26,seed:43}),path:[[-12,-34,16],[-3,-24,15],[0,-20,13],[2,-19,12]]},// Sweeney
 {style:MIL({number:4,seed:44}),path:[[-12,-33,-10],[0,-22,-7],[2,-20,-6]]},// Cahill
 {style:MIL({number:7,seed:45}),path:[[-12,-42,-18],[0,-31,-14],[2,-29,-13]]},// Ifill
 {style:MIL({number:23,seed:46}),path:[[-12,-52,-2],[0,-42,-2],[2,-40,-2]]},// McCammon
 {style:UTD({number:18,hair:[R,.75],seed:50}),path:[[-12,-32,-4],[-3,-19,-3],[0,-14.5,-2.6],[2,-12,-2]]},// Scholes arriving at the edge
 {style:UTD({number:7,hair:K,skin:SKIN_M,seed:51}),path:[[-12,-30,-21],[-3,-17,-14],[0,-11.5,-10.5],[2,-9.5,-9.5]]},// Ronaldo, far post side
 {style:UTD({number:16,hair:K,seed:52}),path:[[-12,-42,7],[0,-30,7],[2,-28,7]]},// Keane
 {style:UTD({number:24,hair:K,seed:53}),path:[[-12,-38,-9],[0,-27,-6],[2,-25,-5]]},// Fletcher
 {style:REF,path:[[-12,-42,-6],[0,-24,-8],[3,-20,-8]]},// referee (Jeff Winter)
];

// ---- Van Nistelrooy: the run, the slide (RIGHT foot leads, contact τ = 0), up, and away to celebrate ----
/** the slide pose at slide-time u with its forward travel (pose.dx) moved into the ground position, so place and pose stay continuous */
function slidePlace(u:number){const p=A.slideTackle(clamp(u),{foot:'r'}),d=p.dx;return{x:SLP[0]+Math.cos(SH)*d,z:SLP[1]+Math.sin(SH)*d,pose:{...p,dx:0,dz:0}};}
function rvnState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 if(tau<SL0){const q=moverPos(RVN_P,tau),v=Math.hypot(q.vx,q.vz),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
  let pose=A.blendPose(A.stand(),run,clamp((v-.3)/1.2));
  // eyes on the cross as Giggs shapes to hit it: the head turns to the left (+z) and back to the ball
  const look=sm(T_CROSS-1.2,T_CROSS-.6,tau)*(1-sm(T_CROSS+.2,SL0,tau));pose={...pose,neckY:pose.neckY+.7*look};
  return{x:q.x,z:q.z,yaw:angLerp(Math.atan2(q.vz,q.vx),SH,sm(T_CROSS,SL0,tau)),pose};}
 const u=(tau-SL0)/SLIDE_DUR,sp=slidePlace(u);let pose=sp.pose,x=sp.x,z=sp.z,yaw=SH;
 // up off the grass and away toward the United fans on the far side to celebrate (inferred)
 if(tau>1.3){const w=easeInOutSine(sm(1.3,2.4,tau)),ct=tau-1.3;pose=A.blendPose(pose,A.celebrate(ct*1.2,{kind:'run'}),w);const run=sm(1.8,2.6,tau)*(tau-1.8);x-=w*.4+run*2.2;z+=w*.3+run*2.8;yaw=angLerp(SH,2.2,w);}
 return{x,z,yaw,pose};}
/** the ball on the toe of his RIGHT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sp=slidePlace(SLC),sk=A.solve(sp.pose,RB,{x:sp.x,z:-sp.z,yaw:SH}),m=mix3(sk.rAn,sk.rToe,.8);return[m[0]+.08,.11,-m[2]];})();
/** where it crosses the line: low, inside the far post (inferred) */
const NETPT:V3=[.2,.3,-1.9];
/** the ball on τ: Giggs's dribble down the left → the driven cross, low and skidding → the slide → the net */
function ballT(tau:number):V3{
 if(tau<T_CROSS-.25){const q=moverPos(GIGGS_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.16;return[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];}
 if(tau<T_CROSS){const a=ballT(T_CROSS-.2501),u=sm(T_CROSS-.25,T_CROSS,tau);return mix3(a,GIGGS_FOOT,u);}
 if(tau<0){const u=(tau-T_CROSS)/-T_CROSS,p=mix3(GIGGS_FOOT,CONTACT,u);p[1]=.11+.3*Math.sin(Math.PI*u)*(1-u*.4);return p;}
 if(tau<SHOT)return mix3(CONTACT,NETPT,tau/SHOT);
 const s=tau-SHOT,u=clamp(s/.1);if(u<1)return mix3(NETPT,[1.7,.3,-2.1],u);
 const d=clamp((s-.1)/.6),e=s-.7,bounce=d>=1?.1*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.7-.5*d,.11+.19*(1-d)+bounce,-2.1+.3*d];}
/** Marshall: covering his near post as Giggs crosses, then a late dive across to his left (−z) as the ball zips past him */
const DIVE_DUR=1.0,DIVE_T0=T_CROSS+.3;
function keeperState(tau:number){const z=lerp(.6,2.3,sm(-4,T_CROSS,tau,easeInOutSine));
 const pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.05});
 return{x:KEEP_X,z,yaw:angLerp(Math.PI,Math.atan2(17-z,-11-KEEP_X),.35*(1-sm(DIVE_T0-.2,DIVE_T0,tau))),pose};}
/** Giggs: runs with it down the left, then drives it across with his LEFT foot */
function giggsState(tau:number,ball:V3){const st=moverState(GIGGS_P,tau,ball),w=sm(T_CROSS-.55,T_CROSS-.3,tau)*(1-sm(T_CROSS+.45,T_CROSS+.9,tau));
 if(tau<T_CROSS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.3)%1+1)%1,{foot:'l',speed:.7}),.55);
 const heading=Math.atan2(CONTACT[2]-GIGGS_FOOT[2],CONTACT[0]-GIGGS_FOOT[0])-.35;
 return{...st,yaw:angLerp(st.yaw,heading,w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_CROSS)/1.1),{foot:'l',power:.85}),w)};}
/** Elliott: chasing Giggs goal-side, a block that comes too late */
function elliottState(tau:number,ball:V3){const st=moverState(ELL_P,tau,ball),w=sm(T_CROSS-.4,T_CROSS,tau)*(1-sm(T_CROSS+.6,T_CROSS+1.2,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(T_CROSS-.4,T_CROSS,tau)),{side:'r'}),w)};}
/** Ward: stretches for the cross at the near side of the six-yard box and misses it */
function wardState(tau:number,ball:V3){const st=moverState(WARD_P,tau,ball),w=sm(T_CROSS,T_CROSS+.35,tau)*(1-sm(.5,1.1,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(T_CROSS,T_CROSS+.4,tau)),{side:'r'}),w)};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...giggsState(t,b),style:GIGGS,smear:t>T_CROSS-.2&&t<T_CROSS+.25},{...elliottState(t,b),style:ELLIOTT},{...wardState(t,b),style:WARD},{...moverState(LAW_P,t,b),style:LAWRENCE});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...rvnState(t),style:RVN,smear:t>SL0&&t<.3},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.2&&t<DIVE_T0+.7});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (low, inside the far post) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.3,p[2]+2.1)+Math.abs(p[0]-1.7)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with Giggs down the left; the cross; the slide; the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Van Nistelrooy!')+.15,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-40,21,-46];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_CROSS){const w=sm(T_CROSS-3,T_CROSS,tau);return[lerp(b[0],-12,.15+.3*w),1.2,lerp(b[2],5,.25+.35*w)];}
 const w=sm(T_CROSS,-.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-8,.3),1.2,lerp(b[2],4,.3)];return mix3(mid,[-3.5,1,-.6],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,3400],[-8,3600],[-3,3800],[T_CROSS,4100],[0,5600],[.8,5800],[1.8,4800],[4,4400]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.3+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9.6,
};

// ---------------- chapter 2 (TV replay, slow motion, a low near-touchline camera on a long lens): he never stops running ----------------
const ch2T=()=>({slow:T(1,'slowly'),runs:T(1,'While Giggs runs'),never:T(1,'never stops'),spr:T(1,'He sprints'),box:T(1,'six-yard box'),end:SEC(1)});
/** replay clock: from the middle of Giggs's run, slowed; the cross is struck on "He sprints"; ends as he reaches the six-yard box */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,-4.4],[q.runs,-3.2],[q.never,-2.1],[q.spr,T_CROSS],[q.box,-.7],[q.end,SL0+.02]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-15,2.2,-26];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),m=rvnState(tau),head:V3=[m.x,1.3,m.z];
 const w=key(t,mono<[number,number]>([[0,.55],[q.runs,.62],[q.never,.9],[q.spr,.85],[q.box,.8],[q.end,.8]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,3000],[q.runs,3200],[q.never,4800],[q.spr,4600],[q.box,5200],[q.end,5400]]) as unknown as Key[]);
 const lk=mix3(b,head,w);lk[1]=Math.min(lk[1],2.2);return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:0});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
  // the six-yard box lights up in yellow as he sprints into it (the target spot)
  const q=ch2T(),g=sm(q.spr,q.box+.3,tt,easeOut);
  if(g>.02){const box=new Path2D();addPoly(box,clipPoly(c,[[-5.5,.03,-9.16],[0,.03,-9.16],[0,.03,9.16],[-5.5,.03,9.16]]));s.tone(Y,box,.35*g);}
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6.2,
};

// ---------------- chapter 3 (reverse replay from behind the goal, through the net): the cross zips in, the slide from three yards, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'slides it home')+.25)*12)/12;// on the twos grid so the drawn slide meets the ball
 return{cross:T(2,"Giggs's cross"),zips:T(2,'zips in'),HIT,yards:T(2,'three yards'),easy:T(2,'Easy'),first:T(2,'got there first'),end:SEC(2)};};
/** replay clock: the cross in flight, ×~4 slow up to the touch on "slides it home", the ball in on "three yards", then real time */
const tau3=(t:number)=>{const q=ch3T(),tm=Math.max(q.yards,q.HIT+.6),tn=Math.max(q.easy,tm+.3);
 return key(t,mono<[number,number]>([[0,T_CROSS+.05],[q.zips,-.5],[q.HIT,0],[tm,SHOT*.95],[tn,SHOT+.3],[tn+1,SHOT+1.3],[tn+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[8.5,2.3,-3.6];
function ch3Cam(t:number){const q=ch3T(),tm=Math.max(q.yards,q.HIT+.6);
 return camKeysOf(t,mono<CK>([[0,...CAM3,-7,.8,6,3500],[q.zips,...CAM3,-5.2,.6,1.6,3900],[q.HIT,...CAM3,-3.2,.5,-.2,4300],[tm,...CAM3,-2.8,.6,-.6,4100],[q.easy,...CAM3,-3.6,.9,.2,3600],[q.first,...CAM3,-5,1.2,3,3000],[q.first+1,8.5,2.4,-3.6,-12,5,40,1500],[q.end,8.5,2.5,-3.6,-14,8,46,1350]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?6*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.easy-.2,q.easy+.4,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,net,noGoal:true});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  // three yards: a yellow dashed line from the touch to the goal line (the distance he finished from)
  const d3=sm(q.yards-.2,q.yards+.3,tt,easeOut)*(1-sm(q.easy+.3,q.easy+.8,tt));
  if(d3>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push(P(c,[lerp(CONTACT[0],0,u),.04,CONTACT[2]]));}dashed(s,pts,d3,Math.max(8,.12*kAt(c,CONTACT)),Y);}
  // the touch: a yellow spark off the right boot
  if(tau>-.01&&tau<.1){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],50+200*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
  // the goal frame and the net between us and the play (we are behind the goal)
  goal(s,c,net,undefined,true);
 },
 aperture(t){const c=ch3Cam(t),l:V3=[-16,12,52],[x,y]=P(c,l),r=clamp(8*kAt(c,l),40,300);return apertureDisc(x,y,r,12);},
 still:4.6,
};

// ---------------- chapter 4 (duotone lesson drill): follow the shot in; the keeper pushes it out; the rebound falls to the runner ----------------
const G4:Pt=[-60,470],H4=640,AZ4=40;// the striker's ground point and drawn height, seen from his right-front
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:AZ4,elevation:5});
const KG4:Pt=[520,250],KH4=360;// the keeper, further back on the right
const KCAM4=A.figureCam({x:KG4[0],y:KG4[1],height:KH4,azimuth:150,elevation:5});
const SDUO:A.AthleteStyle={...RVN,shirt:[K,.8],shorts:'paper',socks:'paper',hair:K,skin:[[Y,.62],[K,.26]],shade:[K,.2],trim:K,numberInk:'paper',detail:'high'};
const KDUO:A.AthleteStyle={...KEEPER,shirt:[K,.55],shorts:[K,.55],socks:[K,.55],skin:[[Y,.62],[K,.26]],shade:[K,.2],detail:'mid'};
const ch4T=()=>{const yt=T(3,'Your turn'),fol=T(3,'follow every shot in'),PT=Math.max(T(3,'keeper pushes it out')+.25,fol+1),reb=T(3,'the rebound'),kr=T(3,'who keeps running');
 return{yt,fol,PT,reb,kr,CT:Math.max(kr+.35,PT+1.2),end:SEC(3)};};
const KDIVE=1.0;// the keeper's dive, contact (.55) at PT
/** the striker: a jog, then he keeps running in after the shot, and taps in the rebound with his right foot at CT */
function lessonState(t:number){const q=ch4T(),arrive=q.CT-.55;
 const x=lerp(-2,0,sm(q.fol,arrive,t,easeInOutSine)),runW=sm(q.fol-.3,q.fol,t)*(1-sm(arrive-.25,arrive,t));
 let pose=A.blendPose(A.stand(),A.runCycle(((t*1.5)%1+1)%1,{speed:.85}),runW);
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(t-q.CT)/1.1),{power:.6}),easeInOutSine(sm(q.CT-.7,q.CT-.45,t)));
 return{x,pose};}
/** where the ball meets the right boot at the tap-in, on the sheet */
const LESSON_HIT=(()=>{const sk=A.solve(A.strike(A.STRIKE_CONTACT,{power:.6}),{}),m=mix3(sk.rAn,sk.rToe,.6),a=CAM4.project([m[0],.11,m[2]]);return[a[0],a[1]] as Pt;})();
/** where the keeper's palms are at full stretch (the parry), on the sheet */
const PARRY=(()=>{const sk=A.solve(A.keeperDive(.55,{side:'r',height:.35}),{height:1.9}),m=mix3(sk.lHa,sk.rHa,.5),a=KCAM4.project(m);return[a[0],a[1]] as Pt;})();
/** a dashed line (lesson and replay marks), drawn on by g */
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,PT=q.PT,hit=LESSON_HIT;
  const v=key(t,mono<number[]>([[0,20,-20,.9],[q.fol,0,-30,.92],[PT,100,-40,.94],[CT,40,-40,1],[q.end,40,-30,1]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the drill stage: navy field, a yellow pool of light in three screens, the six-yard line in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(G4[0]+320,G4[1]-60,r*1.7,r*.32,40);
  s.knockout(pool(620),.6);s.tone(Y,pool(620),.2);s.tone(Y,pool(420),.32);s.tone(Y,pool(240),.45);
  s.knockout(ribbon([[-900,G4[1]+110],[1000,G4[1]-80]],12,{taper:.1,wobble:1.2}),.9);
  // the keeper: set, then the dive to his right that pushes the shot out (palms at full stretch on PT)
  const kpose=(u:number)=>u<PT-.55*KDIVE?A.keeperSet(((u*1.4)%1+1)%1):A.keeperDive(clamp((u-(PT-.55*KDIVE))/KDIVE),{side:'r',height:.35});
  drawPlayer(s,kpose(tt),kpose(tt-1/12),KCAM4,KDUO,{},tt>PT-.3&&tt<PT+.3);
  // the striker's run in: a dashed arrow from where he started to the rebound spot (drawn on from "follow every shot in")
  const st=lessonState(tt),pv=lessonState(tt-1/12);
  const runG=sm(q.fol-.1,q.fol+.9,tt,easeOut)*(1-sm(CT+.3,CT+.8,tt));
  if(runG>.02){const pts:Pt[]=[];for(let i=0;i<=16;i++){const u=i/16,p=CAM4.project([lerp(-2.3,-.2,u),0,.4*Math.sin(u*Math.PI)]);pts.push([p[0],p[1]]);}dashed(s,pts,runG,22,Y);
   const e=pts[Math.max(1,Math.round(16*runG))];if(runG>.9)s.fill(Y,polyPath([[e[0]+44,e[1]],[e[0]-8,e[1]-30],[e[0]-8,e[1]+30]],true),.95);}
  drawPlayer(s,st.pose,pv.pose,CAM4,SDUO,{x:st.x},tt>CT-.3&&tt<CT+.3);
  // the ball: the shot flies in from the left at the keeper, is pushed out (spark), drops to the rebound spot, and is tapped in past him
  const src:Pt=[-900,120],goalPt:Pt=[KG4[0]+120,KG4[1]-150],shotT0=q.fol+.15;
  let bxy:Pt=src,sq=0,dir=0;
  if(tt>=shotT0&&tt<PT){const u=easeIn(sm(shotT0,PT,tt,x=>x));bxy=[lerp(src[0],PARRY[0],u),lerp(src[1],PARRY[1],u)-60*Math.sin(u*Math.PI)];dir=Math.atan2(PARRY[1]-src[1],PARRY[0]-src[0]);sq=.25;}
  else if(tt>=PT&&tt<CT){const u=sm(PT,CT,tt,x=>x),at=(k:number):Pt=>[lerp(PARRY[0],hit[0],k),lerp(PARRY[1],hit[1],k)-160*Math.sin(k*Math.PI)];bxy=at(u);dir=Math.atan2(hit[1]-PARRY[1],hit[0]-PARRY[0]);
   // the rebound's path as dots, and a ring on the spot where it will land
   const rg=sm(q.reb-.1,q.reb+.3,tt,easeOutBack);if(rg>.02){const dots=new Path2D();for(let i=0;i<=14;i++){const p=at(i/14);dots.moveTo(p[0]+9,p[1]);dots.arc(p[0],p[1],9,0,TAU);}s.fill(Y,dots,.9);s.stroke(Y,ring(hit[0],hit[1]+10,110*rg,30*rg),11,.95);}}
  else if(tt>=CT){const f=sm(CT,CT+.45,tt,easeOut);bxy=[lerp(hit[0],goalPt[0],f),lerp(hit[1],goalPt[1],f)];dir=Math.atan2(goalPt[1]-hit[1],goalPt[0]-hit[0]);sq=.4*(1-sm(CT,CT+.1,tt));}
  if(tt>=PT&&tt<PT+.3)sparkBurst(s,Y,PARRY[0],PARRY[1],100+120*sm(PT,PT+.12,tt,easeOut),{n:9,seed:43,g:1-sm(PT+.12,PT+.3,tt),width:14});
  ballAt(s,bxy[0],bxy[1],56,tt*(tt>=CT?12:4),{sq,dir,duo:true});
  if(tt>=CT&&tt<CT+.3)sparkBurst(s,Y,hit[0],hit[1],130+120*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.12,CT+.3,tt),width:16});
  if(tt>=CT&&tt<CT+.5)speedLines(s,K,bxy[0],bxy[1],dir,{n:5,seed:42,len:220,width:10,cov:.85});
 },
 still:5.4,
};

const story:RisoStory={
 id:'van-nistelrooy-signature',format:'11v11',title:"Van Nistelrooy's six-yard finish",
 theme:'Follow every shot in; rebounds often fall to the striker who keeps running.',
 ageNote:'FA Cup final, Manchester United 3–0 Millwall, Millennium Stadium, Cardiff, 22 May 2004 (81st minute).',
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
