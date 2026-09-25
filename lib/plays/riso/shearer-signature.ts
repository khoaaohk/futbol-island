/** Iconic play film: Alan Shearer's signature, the powerful finish. England 4–1 Netherlands, UEFA Euro 96, Group A, Wembley Stadium, London,
 * Tuesday 18 June 1996 (19:30 BST kick-off): England's THIRD goal, 57th minute (56:07–56:08 on the clock), 2–0 → 3–0. Paul Gascoigne brushed
 * past Aron Winter on the left and slipped the ball inside to Teddy Sheringham, who shaped to shoot, then laid it into Shearer's path; Shearer's
 * right-footed shot from 12 yards thundered in at the near post past Edwin van der Sar. A RisoStory (chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written accounts (we did not watch the
 * footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Shearer a signature, not a single match ("Signature: the powerful finish"; lesson "Strike through the
 * middle of the ball to keep a powerful shot on target"). This goal is the best-documented example of it: the match reports single it out
 * as "a resounding shot" (englandstats), "a thunderous Shearer finish" (UEFA) and a shot that "threatened to break the net" (Norman Giller),
 * struck from 12 yards, on target, inside the near post, in England's most celebrated tournament performance.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 1996 Group A" (raw): 18 June 1996, 19:30, Netherlands 1–4 England, Wembley Stadium, attendance 76,798, referee Gerd
 *    Grabher (Austria); Shearer 23' pen, 57'; Sheringham 51', 62'; Kluivert 78'. Line-ups and numbers (Shearer 9, Sheringham 10, Gascoigne 8,
 *    van der Sar 1, Blind 3, Reiziger 2, Bogarde 15, Winter 12, Seedorf 4 ...). KIT TEMPLATES: Netherlands ORANGE shirts, WHITE shorts, orange
 *    socks; England WHITE shirts, NAVY shorts, WHITE socks.
 *  - englandstats.com, match 724 (England 4–1 Netherlands): "In the 57th minute Gascoigne brushed past Winter on the left and slipped the
 *    ball square to Sheringham, who instead of shooting feinted before sending in Shearer for a resounding shot inside the near post."
 *    "Alan Shearer ... Right-footed from 12 yards. 57' 56:07". Assist: Teddy Sheringham.
 *  - englandfootballonline.com, match 724 (Mike Payne / Norman Giller reports): "[0-3] Alan Shearer 57 56:08, perfect 12-yard strike from a
 *    Sheringham side-footed flick provided by Gascoigne"; "Sheringham, who unselfishly pushed the ball into the path of Shearer, who
 *    threatened to break the net with a shot that brought his fourth goal in three games."
 *  - UEFA.com, "England hit high notes to down Netherlands in EURO '96 Group A": "Gascoigne bursting down the left before passing inside to
 *    Sheringham, whose delightful lay-off was met by a thunderous Shearer finish."
 *  - The Guardian, Rob Smyth, "On second thoughts: England 4-1 Netherlands, Euro 96", 15 Feb 2008 (photo caption "Alan Shearer belts home from
 *    close range"; the "genuine class evident in the build-up to both of Alan Shearer's goals"). Wikipedia, "Alan Shearer" (raw).
 * CONFIRMED by those accounts: date, ground, competition, kick-off, minute and score (2–0 → 3–0); England in white shirts and navy shorts, the
 * Netherlands in orange shirts and white shorts; Shearer wore 9; the move: Gascoigne past Winter on the LEFT, the ball slipped inside/square
 * to Sheringham, Sheringham feinted to shoot instead of shooting, then side-footed it into Shearer's path; Shearer hit it with his RIGHT foot
 * from 12 yards, a thunderous shot inside the NEAR post past van der Sar.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, run and timing between those beats; that Shearer came
 * in from Sheringham's right (so the near post is the right-hand post as England attack), which is what "inside the near post" from a lay-off
 * across implies; that Sheringham's lay-off was a flick with the outside of his right foot after shaping to shoot with it; the height of the
 * shot (drawn high, just inside the near post); that Shearer hit it first time on the run; which way England attacked on screen (left to
 * right from the main stand); van der Sar's kit (drawn blue) and the referee's (drawn navy); Gascoigne's bleached hair (from memory of the
 * tournament, unsourced here); the other players' spots (McManaman, Anderton, Ince, Blind, Reiziger, Bogarde, Seedorf, de Kock); Shearer's
 * one-arm-raised celebration run; the crowd colours and the Dutch block; old Wembley drawn as an oval bowl under a roof ring, with the
 * greyhound track between the pitch and the stands, in June evening daylight (the 57th minute is about 20:25 BST, before sunset).
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with Gascoigne's burst, the pass inside, the lay-off and the shot into the net; 2 = slow-motion replay from low behind the play:
 * Sheringham shapes to shoot, the defenders freeze, the ball rolled into Shearer's path; 3 = the reverse replay from the goal line beside the
 * near post: Shearer's right-foot strike coming at us, the ball past van der Sar into the net, the roar; 4 = the lesson, a duotone replay
 * (plant beside the ball, lock the ankle, strike through the middle, on target). NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (evening light, grass with blue), orange (the Dutch, the track, skin), blue (sky, grass, van der Sar, shade), navy (England
 * shorts, key line). The lesson chapter is a duotone beat (navy + yellow on paper). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

// ---------------- the narration (script.json mirrors it) and its provisional timing ----------------
/** `tail` = silence after the last word (the action finishes and the .65 s passage plays in it). Cue words must stay substrings, in order. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, live',text:'Wembley, Euro 96. England lead the Netherlands two-nil. Paul Gascoigne bursts down the left and slides it inside to Teddy Sheringham... Shearer! Goal!',tail:2.3,
  cues:['Wembley','Euro 96','England lead','the Netherlands','Paul Gascoigne','bursts down the left','slides it inside','Teddy Sheringham','Shearer','Goal']},
 {label:'Watch again',text:'Watch again, slowly. Sheringham shapes to shoot, and the defenders freeze. But he rolls it sideways, into the path of Alan Shearer.',tail:.9,
  cues:['Watch again','slowly','Sheringham shapes to shoot','the defenders freeze','he rolls it sideways','into the path','Alan Shearer']},
 {label:'Bang!',text:'Shearer runs onto it. Head over the ball, laces through the middle... bang! It thunders in at the near post. Three-nil!',tail:2.1,
  cues:['Shearer runs onto it','Head over the ball','laces through the middle','bang','thunders in','near post','Three-nil']},
 {label:'Your turn',text:'Your turn: plant your foot beside the ball, lock your ankle, and strike through the middle to keep a powerful shot on target.',tail:2.0,
  cues:['Your turn','plant your foot','lock your ankle','strike through the middle','powerful shot','on target']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py shearer-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/shearer-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/shearer-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('shearer: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`shearer film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}

const K='navy',O='orange',Y='yellow',B='blue';
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

// ---------------- old Wembley on a June evening: an oval bowl under a roof ring, the greyhound track, grass, lines, boards, the goal ----------------
/** a superellipse loop round the pitch centre (-52.5, 0): semi-axes a (along the pitch) and b (across), at height y */
const LOOPN=24;
const loopPt=(i:number,a:number,b:number,y:number):V3=>{const th=i/LOOPN*TAU,c=Math.cos(th),s=Math.sin(th),e=.5;return[-52.5+a*Math.sign(c)*Math.abs(c)**e,y,b*Math.sign(s)*Math.abs(s)**e];};
const TRACK_A=64,TRACK_B=45;
/** the stands as quads [lowerA, lowerB, upperB, upperA] between the track edge and the back of the bowl */
const STANDS:V3[][]=Array.from({length:LOOPN},(_,i)=>[loopPt(i,TRACK_A,TRACK_B,1.2),loopPt(i+1,TRACK_A,TRACK_B,1.2),loopPt(i+1,TRACK_A+34,TRACK_B+32,24),loopPt(i,TRACK_A+34,TRACK_B+32,24)]);
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 blue / 2 Dutch orange, phase] — England's white and blue fill the bowl; the Dutch are an orange block */
const CROWD=(()=>{const r=rng(1896),out:[number,number,number,number,number][]=[];for(let st=0;st<LOOPN;st++){const n=38;for(let i=0;i<n;i++){const c=r(),u=r(),away=st>=8&&st<=10;out.push([st,u,.04+r()*.92,away?(c<.82?2:0):c<.55?0:1,r()*TAU]);}}return out;})();
/** the floodlights along the roof's inner rim (on, faint, in the evening light) */
const LAMPS:V3[]=Array.from({length:LOOPN},(_,i)=>{const p=loopPt(i+.5,TRACK_A+24,TRACK_B+22,28.4);return p;});
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a June evening over north London: blue sky, a warm yellow haze low down
 s.field(B,.28,.6);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(Y,polyPath([[-Bnd,hz-420],[Bnd,hz-520],[Bnd,Bnd],[-Bnd,Bnd]],true),.3);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-980],[-Bnd,hz-900]],true),.14);
 // stands: knocked out, printed navy + blue, terraces as stepped bands, the roof ring, then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],29,ub[2]],[ua[0],29,ua[2]]]));
  const fa=mix3(q[3],q[0],.3),fb=mix3(q[2],q[1],.3);addPoly(roof,clipPoly(c,[[ua[0],29,ua[2]],[ub[0],29,ub[2]],[fb[0],28,fb[2]],[fa[0],28,fa[2]]]));});
 s.knockout(stands);s.fill(K,stands,.62);s.tone(B,stands,.3);s.tone(K,terr,.3);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(col===2?.2:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(B,heads[1],.66);if(seen[2]){s.knockout(heads[2],.9);s.fill(O,heads[2],.92);}
 // flags and camera flashes in the crowd (paper sparks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(960+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*LOOPN),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.9);
 // roof lights: small yellow lamp panels (it is still daylight)
 {const core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const w=clamp(1.1*k,5,140),h=clamp(.6*k,3,80);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(core);s.fill(Y,core,.75);}
 // the greyhound track round the pitch: sandy orange
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:LOOPN},(_,i)=>loopPt(i,TRACK_A,TRACK_B,0))));s.knockout(tr);s.fill(O,tr,.34);s.tone(Y,tr,.3);
 // grass: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // advertising boards at the pitch edge (drawn plain: no brands)
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]],[[-108,-37],[-108,37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.knockout(boards);s.fill(B,boards,.7);s.tone(K,boards,.3);
 if(!o.noGoal)goal(s,c,o.net);
}
/** the goal at x=0: halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3,sideOnly?:number){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 if(sideOnly){grid((u,v)=>side(sideOnly*W,v,u),4,6);s.tone(K,vol,.12);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);return;}
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);
 const fr=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];fr.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(fr);
}

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline, a player's LEFT when he faces the goal); the library
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Shearer's right foot is his right foot
// on screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.8],[O,.2]],SKIN_M:A.InkFill[]=[[Y,.72],[O,.4]],SKIN_D:A.InkFill[]=[[O,.78],[K,.3]];
const LINE={line:K,boots:K,hair:K,shade:[B,.3] as A.InkFill};
/** England: white shirts with navy trim, navy shorts, white socks (the Euro 96 kit templates) */
const ENG=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',shorts:[K,.9],socks:'paper',trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Netherlands: orange shirts, white shorts, orange socks */
const NED=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[O,.95],shorts:'paper',socks:[O,.95],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:11,...o});
const SB:A.Build={height:1.83,bulk:1.06,thighs:1.1};
const SHEARER:A.AthleteStyle=ENG({number:9,build:SB,seed:9});
const SHERINGHAM:A.AthleteStyle=ENG({number:10,build:{height:1.85},seed:10});
const GASCOIGNE:A.AthleteStyle=ENG({number:8,hair:[Y,.85],build:{height:1.78,bulk:1.04},seed:8});
const BLIND:A.AthleteStyle=NED({number:3,hairStyle:'balding',build:{height:1.84},seed:3});
const WINTER:A.AthleteStyle=NED({number:12,skin:SKIN_D,build:{height:1.77},seed:12});
const REIZIGER:A.AthleteStyle=NED({number:2,skin:SKIN_D,build:{height:1.76},seed:2});
const KEEPER:A.AthleteStyle={...LINE,shirt:[B,.72],shorts:[K,.85],socks:[B,.72],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',hair:[Y,.6],build:{height:1.97},seed:23};
const REF:A.AthleteStyle={...LINE,shirt:[K,.9],shorts:K,socks:K,skin:SKIN_L,hairStyle:'short',seed:17};
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
/** the ball (the Euro 96 match ball, drawn as a classic panel ball): paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Shearer's strike) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const SHOT=.36,T_BEAT=-4.3,T_PASS=-2.5,T_RECV=-1.75,T_LAY=-.82;
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

// Gascoigne bursts down the left past Winter and slips it inside; Sheringham feints and lays it right; Shearer arrives from the right (inferred paths)
const GAZ_P:MKey[]=[[-12,-44,21],[-7,-36,18],[T_BEAT,-31.4,16.2],[T_PASS,-24.6,12.2],[-1,-21.5,10.6],[1,-19.5,9.4],[3,-18,8.6]];
const SHER_P:MKey[]=[[-12,-27,4],[-6,-23,3],[-3,-20.4,2.2],[T_RECV-.2,-19.8,1.9],[T_RECV,-19.6,1.8],[0,-19.3,1.6],[3,-19,1.4]];
/** the ball at the strike: just ahead of his right toe, 12 yards out, right of centre (inferred spot) */
const SPOT:V3=[-11,.11,-2.6];
/** where it goes in: high, just inside the near post (height inferred) */
const NETPT:V3=[.25,1.95,-3.05];
const SYAW=Math.atan2(NETPT[2]-SPOT[2],NETPT[0]-SPOT[0]);
/** Shearer's place at contact, solved so the ball sits on his RIGHT boot (library skeleton, converted to this world) */
const SH_AT=(()=>{const sk=A.solve(A.strike(A.STRIKE_CONTACT,{foot:'r',power:1}),SB,{x:0,z:0,yaw:SYAW}),m=mix3(sk.rAn,sk.rToe,.7);return[SPOT[0]-m[0]-Math.cos(SYAW)*.12,SPOT[2]+m[2]-Math.sin(SYAW)*.12] as [number,number];})();
const SHEA_P:MKey[]=[[-12,-30,-11],[-6,-24.5,-9],[-3,-19,-7],[-1.6,-15.8,-5],[-.7,-13,-3.6],[0,SH_AT[0],SH_AT[1]],[.7,SH_AT[0]+.9,SH_AT[1]]];
const KEEP_X=-1.3;
const WIN_P:MKey[]=[[-12,-35,12],[-6,-33,14.5],[T_BEAT,-30.2,15.4],[-3,-29.6,14.6],[0,-25,11.5],[3,-22,10]];
const BLIND_P:MKey[]=[[-12,-14,4.4],[-4,-15,3.9],[T_RECV,-16.1,3.4],[0,-15.6,3.1],[2,-15,2.6]];
const REI_P:MKey[]=[[-12,-17,-1],[-3,-16,-1.4],[T_LAY,-15.2,-1.8],[0,-13.8,-1.2],[2,-12.8,-1.6]];
const OTHERS:Mover[]=[
 {style:NED({number:15,skin:SKIN_D,build:{height:1.9},seed:40}),path:[[-12,-14,9],[-3,-13.4,7],[0,-12.2,5.4],[2,-11.6,4.8]]},// Bogarde, left of the box
 {style:NED({number:4,skin:SKIN_D,seed:41}),path:[[-12,-28,-1],[-4,-24,0],[0,-21.4,-1.2],[2,-20,-1.4]]},// Seedorf, chasing back
 {style:NED({number:18,seed:42,build:{height:1.88}}),path:[[-12,-12,-12],[-3,-10.5,-9],[0,-9.2,-7.2],[2,-8.8,-6.8]]},// de Kock, far side cover
 {style:NED({number:6,seed:43}),path:[[-12,-40,-14],[0,-31,-10],[2,-28,-9]]},// Ronald de Boer
 {style:ENG({number:17,seed:50}),path:[[-12,-50,26],[-4,-38,22],[0,-31,19],[2,-28,17]]},// McManaman, behind Gascoigne
 {style:ENG({number:11,seed:51}),path:[[-12,-38,-24],[-4,-28,-20],[0,-21,-17],[2,-18.5,-15]]},// Anderton, wide right
 {style:ENG({number:4,skin:SKIN_D,seed:52}),path:[[-12,-50,-2],[0,-38,0],[2,-35,0]]},// Ince
 {style:REF,path:[[-12,-44,-4],[0,-30,-6],[3,-26,-6]]},// referee (Gerd Grabher)
];

/** the ball on τ: Gascoigne's feet → past Winter → the pass inside → Sheringham's feint → the lay-off → the strike → the net */
const GAZ_FOOT:V3=[-24.1,.11,11.9],SHER_FOOT:V3=[-19.1,.11,1.3];
function ballT(tau:number):V3{
 if(tau<T_PASS-.2){const q=moverPos(GAZ_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.16;return[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];}
 if(tau<T_PASS){const a=ballT(T_PASS-.2001),u=sm(T_PASS-.2,T_PASS,tau);return mix3(a,GAZ_FOOT,u);}
 if(tau<T_RECV){const u=easeOut(clamp((tau-T_PASS)/(T_RECV-T_PASS)),);return mix3(GAZ_FOOT,SHER_FOOT,lerp(u,(tau-T_PASS)/(T_RECV-T_PASS),.4));}
 if(tau<T_LAY){const u=sm(T_RECV,T_RECV+.35,tau,easeOut);return mix3(SHER_FOOT,[SHER_FOOT[0]+.3,.11,SHER_FOOT[2]-.25],u);}
 if(tau<0){const a:V3=[SHER_FOOT[0]+.3,.11,SHER_FOOT[2]-.25],u=(tau-T_LAY)/-T_LAY;return mix3(a,SPOT,u*(1.25-.25*u));}
 if(tau<SHOT){const u=tau/SHOT,p=mix3(SPOT,NETPT,u);p[1]+=.35*Math.sin(Math.PI*u);return p;}
 const s=tau-SHOT,u=clamp(s/.1);if(u<1)return mix3(NETPT,[1.5,1.7,-2.8],u);
 const d=clamp((s-.1)/.5),e=s-.6,bounce=d>=1?.12*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.5-.3*d,Math.max(.11,1.7*(1-d*d)+.11*d*d)+bounce,-2.8+.3*d];}
/** van der Sar: shuffles across toward his near post as the lay-off comes, then a late dive to his left (−z), beaten high */
const DIVE_DUR=1.05,DIVE_T0=-.06;
function keeperState(tau:number){const z=lerp(.8,-1.2,sm(T_PASS,-.2,tau,easeInOutSine)),x=lerp(-1.1,KEEP_X-.4,sm(T_LAY,-.2,tau));
 let pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.8});
 if(tau<DIVE_T0&&tau>T_LAY){const ph=Math.sin((tau-T_LAY)*11);pose={...pose,lHipA:pose.lHipA+.25*Math.max(0,ph),rHipA:pose.rHipA+.25*Math.max(0,-ph),air:pose.air+.03*Math.abs(ph)};}
 return{x,z,yaw:Math.PI,pose};}
/** Gascoigne: dribbles down the left, shoulders past Winter, then slips it inside with his right foot */
function gazState(tau:number,ball:V3){const st=moverState(GAZ_P,tau,ball),w=sm(T_PASS-.55,T_PASS-.3,tau)*(1-sm(T_PASS+.4,T_PASS+.8,tau));
 if(tau<T_PASS-.5){st.pose=A.blendPose(st.pose,A.dribble(((tau*2.1)%1+1)%1,{foot:'r',speed:.7}),.55);
  const brush=sm(T_BEAT-.4,T_BEAT,tau)*(1-sm(T_BEAT+.2,T_BEAT+.6,tau));st.pose={...st.pose,roll:st.pose.roll+.2*brush,lShA:st.pose.lShA+.5*brush,lElb:st.pose.lElb+.3*brush};}
 return{...st,yaw:angLerp(st.yaw,Math.atan2(SHER_FOOT[2]-GAZ_FOOT[2],SHER_FOOT[0]-GAZ_FOOT[0]),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_PASS)/1.1),{power:.5}),w)};}
/** Winter: stands up to Gascoigne, jabs a leg, is brushed aside and chases back */
function winState(tau:number,ball:V3){const st=moverState(WIN_P,tau,ball,A.stand),w=sm(T_BEAT-.6,T_BEAT-.3,tau)*(1-sm(T_BEAT+.4,T_BEAT+.9,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(T_BEAT-.6,T_BEAT,tau)),{side:'r'}),w)};}
/** Sheringham: takes it, shapes to shoot with his right foot (the feint), then flicks it right into Shearer's path instead */
const LAYYAW=Math.atan2(SPOT[2]-SHER_FOOT[2],SPOT[0]-SHER_FOOT[0]);
function sherState(tau:number,ball:V3){const st=moverState(SHER_P,tau,ball);
 if(tau<T_RECV-.4)return st;
 const shape=clamp((tau-(T_RECV+.05))/.7)*.4;// the backswing of a shot, up to .4 (fully cocked) by the lay-off
 const feint=A.strike(shape,{foot:'r',power:.9}),w=sm(T_RECV-.4,T_RECV+.05,tau);
 let pose=A.blendPose(st.pose,feint,w);
 const lay=A.strike(clamp(A.STRIKE_CONTACT+(tau-T_LAY)/1.2),{foot:'r',power:.3}),lw=sm(T_LAY-.28,T_LAY-.05,tau);
 pose=A.blendPose(pose,{...lay,rHipR:lay.rHipR-.45,rHipA:lay.rHipA-.25},lw);
 if(tau>T_LAY+.6)pose=A.blendPose(pose,A.stand(),sm(T_LAY+.6,T_LAY+1.3,tau));
 const face=Math.atan2(-SHER_FOOT[2],-SHER_FOOT[0]);// squared up to the goal for the feint
 return{...st,yaw:angLerp(angLerp(st.yaw,face,w),LAYYAW+.5,lw*.35),pose};}
/** Blind: steps across and braces to block the shot he expects (the feint freezes him), and is left behind */
function blindState(tau:number,ball:V3){const st=moverState(BLIND_P,tau,ball,A.stand),w=sm(T_RECV,T_RECV+.35,tau)*(1-sm(T_LAY+.5,T_LAY+1.1,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.38*sm(T_RECV,T_LAY-.1,tau)),{side:'l'}),w)};}
/** Shearer: the run from the right, the strike with the laces of his RIGHT foot (τ = 0), then away with one arm up */
function shearerState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(SHEA_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 let pose=A.blendPose(A.blendPose(A.stand(),run,clamp((v-.3)/1.2)),A.strike(clamp(A.STRIKE_CONTACT+tau/1.1),{foot:'r',power:1}),easeInOutSine(sm(-.78,-.5,tau)));
 const cel=sm(1.3,2.1,tau);
 if(tau>1.3){const c=A.celebrate(tau-1.3,{kind:'run'});pose=A.blendPose(pose,{...c,rShF:172*Math.PI/180,rShA:14*Math.PI/180,rElb:.1,lShA:.5,lShF:-.3,lElb:1.2},easeInOutSine(cel));}
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):SYAW,yaw=angLerp(runYaw,SYAW,sm(-.8,-.45,tau));
 return{x:q.x-cel*2.6*(tau-1.3),z:q.z-cel*4.2*(tau-1.3),yaw:tau>1.3?angLerp(yaw,-1.9,cel):yaw,pose};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...gazState(t,b),style:GASCOIGNE},{...winState(t,b),style:WINTER},{...sherState(t,b),style:SHERINGHAM,smear:t>T_LAY-.15&&t<T_LAY+.15},{...blindState(t,b),style:BLIND},{...moverState(REI_P,t,b),style:REIZIGER});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...shearerState(t),style:SHEARER,smear:t>-.2&&t<.3},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.25&&t<DIVE_T0+.75});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (high, inside the near post) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-1.6,p[2]+2.8)+Math.abs(p[0]-1.5)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with the move; the lay-off; the strike; the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Goal')-SHOT-.1,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-36,22,-58];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_LAY){const w=sm(T_PASS-1,T_LAY,tau);return[lerp(b[0],-14,.15+.3*w),1.2,lerp(b[2],2,.2+.35*w)];}
 const w=sm(T_LAY,.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-10,.3),1.2+b[1]*.3,lerp(b[2],0,.3)];return mix3(mid,[-5,1.2,-2],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,2500],[T_BEAT,2800],[T_PASS,3200],[T_LAY,3900],[0,5000],[.8,5200],[1.8,4300],[4,4000]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.2+1.1*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:+(ch1T().TL+SHOT*.5).toFixed(2),
};

// ---------------- chapter 2 (TV replay, slow motion, low behind the play): the feint, the frozen defenders, the ball rolled into Shearer's path ----------------
const ch2T=()=>({shapes:T(1,'Sheringham shapes to shoot'),freeze:T(1,'the defenders freeze'),rolls:T(1,'he rolls it sideways'),path:T(1,'into the path'),as:T(1,'Alan Shearer'),end:SEC(1)});
/** replay clock: from Gascoigne's pass inside, slowed through the feint and the lay-off; ends as Shearer arrives, before the strike */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_PASS-.25],[q.shapes,T_RECV+.1],[q.freeze,T_RECV+.5],[q.rolls,T_LAY-.05],[q.path,T_LAY+.25],[q.as,-.5],[q.end,-.3]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-29,2.3,-15];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),sh=moverPos(SHEA_P,tau);
 const lk=mix3(b,[sh.x,1.1,sh.z],key(t,mono<[number,number]>([[0,0],[q.rolls,.1],[q.path,.45],[q.as,.6],[q.end,.6]]) as unknown as Key[]));lk[1]=1.1;
 const F=key(t,mono<[number,number]>([[0,3000],[q.shapes,4000],[q.freeze,4200],[q.rolls,4000],[q.path,3500],[q.end,3400]]) as unknown as Key[]);
 return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:.1});
  // the lay-off: a dashed yellow track on the grass, drawn on as the ball rolls into Shearer's path
  const g=sm(q.rolls-.1,q.path+.4,tt,easeOut)*(1-sm(q.end-.9,q.end-.4,tt));
  if(g>.02){const a:V3=[SHER_FOOT[0]+.3,.03,SHER_FOOT[2]-.25],pts:Pt[]=[];for(let i=0;i<=14;i++)pts.push(P(c,mix3(a,[SPOT[0],.03,SPOT[2]],i/14)));dashed(s,pts,g,Math.max(10,.18*kAt(c,a)));}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN*.8)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4.4,
};

// ---------------- chapter 3 (reverse replay from the goal line beside the near post): the right-foot strike at us, the net, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'bang')+.05)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{runs:T(2,'Shearer runs onto it'),head:T(2,'Head over the ball'),laces:T(2,'laces through the middle'),HIT,th:T(2,'thunders in'),np:T(2,'near post'),three:T(2,'Three-nil'),end:SEC(2)};};
/** replay clock: slowed ×~5 through the last strides and the strike on "bang", the ball in on "thunders in", then real time */
const tau3=(t:number)=>{const q=ch3T(),tn=Math.max(q.th,q.HIT+.5),tp=Math.max(q.np,tn+.3);
 return key(t,mono<[number,number]>([[0,-.85],[q.runs,-.72],[q.head,-.42],[q.laces,-.16],[q.HIT,0],[tn,SHOT*.95],[tp,SHOT+.25],[tp+1,SHOT+1.25],[tp+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[2.2,1.25,-13.5];
function ch3Cam(t:number){const q=ch3T(),tn=Math.max(q.th,q.HIT+.5);
 const S:V3=[SH_AT[0],1.05,SH_AT[1]];
 return camKeysOf(t,mono<CK>([[0,...CAM3,S[0]-1.4,1.1,S[2]-.6,5600],[q.head,...CAM3,S[0]-.4,1,S[2],6800],[q.HIT,...CAM3,S[0]+.2,.95,S[2],6400],[q.HIT+.35,...CAM3,S[0]+1.6,1.1,S[2]-.4,5000],[tn,...CAM3,-3,1.3,-3,4000],[q.np,...CAM3,-1.5,1.5,-3,3800],[q.three+.2,...CAM3,-4,1.6,-3.2,3400],[q.three+1,2.2,2,-13.5,-22,5,-52,2300],[q.end,2.2,2.2,-13.5,-28,8,-56,2100]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?9*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.three-.2,q.three+.4,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,net});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  if(w.ball[0]>.05)goal(s,c,net,-1);// the near side netting hangs in front of the ball once it is in
  // the strike: a yellow spark off the laces of the right boot, speed lines on the ball's flight
  if(tau>-.01&&tau<.1){const p=P(c,SPOT);sparkBurst(s,Y,p[0],p[1],60+260*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
  if(tau>0&&tau<SHOT){const p=P(c,w.ball),a=P(c,SPOT);speedLines(s,K,p[0],p[1],Math.atan2(p[1]-a[1],p[0]-a[0]),{n:5,seed:21,len:200,width:9,cov:.8});}
 },
 aperture(t){const c=ch3Cam(t),l=LAMPS[6],[x,y]=P(c,l),r=clamp(4*kAt(c,l),30,300);return apertureDisc(x,y,r*.6,12);},
 still:5.2,
};

// ---------------- chapter 4 (duotone replay): plant beside the ball, lock the ankle, strike through the middle, on target ----------------
const G4:Pt=[-300,470],H4=640;// his ground point and drawn height, seen from his right side: the planted left foot and the striking right leg read
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:12,elevation:4});
const SDUO:A.AthleteStyle={...SHEARER,shirt:'paper',shorts:[K,.85],socks:'paper',trim:K,skin:[[Y,.62],[K,.26]],shade:[K,.2],detail:'high'};
const ch4T=()=>{const st=T(3,'strike through the middle');return{yt:T(3,'Your turn'),plant:T(3,'plant your foot'),lock:T(3,'lock your ankle'),st,CT:st+.55,pw:T(3,'powerful shot'),tg:T(3,'on target'),end:SEC(3)};};
/** the lesson clock: strike keys at the cues (plant on "plant your foot", backswing held on "lock your ankle", contact at CT) */
function lessonPose(t:number){const q=ch4T();
 const u=key(t,mono<[number,number]>([[0,0],[q.plant+.3,.22],[q.lock+.2,.36],[q.CT-.25,.42],[q.CT,A.STRIKE_CONTACT],[q.CT+.55,.8],[q.CT+1.2,1]]) as unknown as Key[],x=>x);
 return A.strike(u,{foot:'r',power:1});}
/** the ball (on the ground in front of him) and his planted left foot, on the sheet at contact */
const LESSON=(()=>{const sk=A.solve(A.strike(A.STRIKE_CONTACT,{foot:'r',power:1}),SB),m=mix3(sk.rAn,sk.rToe,.7),toe=CAM4.project([m[0]+.12,.11,m[2]]),plant=CAM4.project(sk.lAn),ank=CAM4.project(sk.rAn),tip=CAM4.project(sk.rToe);
 return{ball:[toe[0],toe[1]] as Pt,plant:[plant[0],plant[1]] as Pt,ank:[ank[0],ank[1]] as Pt,tip:[tip[0],tip[1]] as Pt};})();
/** a dashed line (a ribbon with gaps), drawn on by g */
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
/** the target goal on the right: posts and bar in paper with a navy edge, the net in navy halftone */
const GOAL4={x0:150,x1:430,top:90,bottom:470};
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,bp=LESSON.ball,R4=46;
  const v=key(t,mono<number[]>([[0,-40,-10,.92],[q.plant,-120,-10,.98],[q.lock,-150,-10,1.02],[q.st,-140,-20,1.04],[CT+.3,10,-30,.96],[q.tg,40,-30,.95],[q.end,50,-30,.96]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the replay stage: navy field, a yellow evening-light pool in three screens, the grass line in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(G4[0]+260,G4[1]-30,r*1.7,r*.3,40);
  s.knockout(pool(620),.6);s.tone(Y,pool(620),.2);s.tone(Y,pool(420),.3);s.tone(Y,pool(240),.42);
  s.knockout(ribbon([[-1000,G4[1]+18],[1000,G4[1]+10]],12,{taper:.1,wobble:1.2}),.9);
  // the target goal: the net, then paper posts and bar with a navy edge
  const{x0,x1,top,bottom}=GOAL4,gnet=polyPath([[x0,top],[x1,top],[x1,bottom],[x0,bottom]],true);
  s.tone(K,gnet,.25);{const m=new Path2D();for(let x=x0;x<=x1;x+=32){m.moveTo(x,top);m.lineTo(x,bottom);}for(let y=top;y<=bottom;y+=32){m.moveTo(x0,y);m.lineTo(x1,y);}s.stroke(Y,m,3,.35);}
  const posts=[ribbon([[x0,bottom],[x0,top],[x1,top],[x1,bottom]],18,{taper:0,pressure:0,wobble:.6})];s.fill(K,ribbon([[x0,bottom],[x0,top],[x1,top],[x1,bottom]],26,{taper:0,pressure:0,wobble:.6}),.9);s.knockout(posts[0]);
  // the figure: approach, plant, backswing, contact at CT, follow-through
  const p1=lessonPose(tt),p0=lessonPose(tt-1/12);
  const fig=drawPlayer(s,p1,p0,CAM4,SDUO,{},tt>CT-.3&&tt<CT+.35);
  // "plant your foot": a yellow ring round the planted left foot beside the ball
  const pl=sm(q.plant,q.plant+.35,tt,easeOutBack)*(1-sm(q.st+.2,q.st+.6,tt));
  if(pl>.02){const f=fig.joints.lAn;s.stroke(Y,ring(f[0]+10,Math.max(f[1],LESSON.plant[1])+14,90*pl,24*pl),12,.95);}
  // "lock your ankle": a straight yellow bar along the striking foot, toe pointed
  const lk=sm(q.lock,q.lock+.3,tt,easeOutBack)*(1-sm(CT+.2,CT+.5,tt));
  if(lk>.02){const a=fig.joints.rKn,b=fig.joints.rAn,c=fig.joints.rToe,d=[c[0]+(c[0]-b[0])*.35,c[1]+(c[1]-b[1])*.35] as Pt;s.fill(Y,ribbon([[b[0]+(a[0]-b[0])*.35,b[1]+(a[1]-b[1])*.35],b,d],16*lk,{taper:.15,pressure:0,wobble:.6}),.95);}
  // the ball: waiting on the grass; "strike through the middle": a crosshair on its centre; at CT it flies straight into the goal
  const target:Pt=[(x0+x1)/2+40,top+130];const ang=Math.atan2(target[1]-bp[1],target[0]-bp[0]);
  let bxy:Pt=[bp[0],bp[1]-R4*.9],sq=0;
  if(tt>=CT){const f=sm(CT,CT+.42,tt,easeOut);bxy=[lerp(bp[0],target[0],f),lerp(bp[1]-R4*.9,target[1],f)];sq=.45*(1-sm(CT,CT+.12,tt));}
  const mid=sm(q.st-.15,q.st+.15,tt,easeOutBack)*(1-sm(CT,CT+.1,tt));
  // on target: a yellow ring in the goal where it will go in, and a tick once it has
  const tg=sm(q.pw,q.pw+.3,tt,easeOutBack);
  if(tg>.02){s.stroke(Y,ring(target[0],target[1],70*tg,70*tg),11,.95);}
  ballAt(s,bxy[0],bxy[1],R4,tt*(tt>=CT?14:0),{sq,dir:ang,duo:true});
  if(mid>.02){const r=R4*1.9*mid;s.stroke(Y,ring(bp[0],bp[1]-R4*.9,r,r),9,.95);const cr=new Path2D();cr.moveTo(bp[0]-r*1.3,bp[1]-R4*.9);cr.lineTo(bp[0]+r*1.3,bp[1]-R4*.9);cr.moveTo(bp[0],bp[1]-R4*.9-r*1.3);cr.lineTo(bp[0],bp[1]-R4*.9+r*1.3);s.stroke(Y,cr,7,.95);}
  if(tt>=CT&&tt<CT+.35)sparkBurst(s,Y,bp[0],bp[1]-R4*.9,130+130*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.15,CT+.35,tt),width:16});
  if(tt>=CT&&tt<CT+.5)speedLines(s,Y,bxy[0],bxy[1],ang,{n:5,seed:42,len:220,width:10,cov:.85});
  const tick=sm(q.tg+.1,q.tg+.4,tt,easeOutBack);
  if(tick>.02){const cx=x1-30,cy=top-70,k=tick;s.fill(Y,ribbon([[cx-40*k,cy],[cx-10*k,cy+30*k],[cx+50*k,cy-40*k]],20,{taper:.1,pressure:0,wobble:.8}),.95);}
 },
 still:5.2,
};

const story:RisoStory={
 id:'shearer-signature',format:'11v11',title:"Shearer's powerful finish",
 theme:'Strike through the middle of the ball to keep a powerful shot on target.',
 ageNote:'Euro 96, England 4–1 Netherlands, Wembley Stadium, London, 18 June 1996 (57th minute, England’s third goal).',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
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
