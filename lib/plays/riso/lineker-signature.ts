/** Iconic play film: Gary Lineker's signature, the poacher's finish in the six-yard box. England 3–0 Poland, 1986 FIFA World Cup, first
 * round, Group F (the last group game), Estadio Universitario, San Nicolás de los Garza (Monterrey), Mexico, Wednesday 11 June 1986,
 * 4 pm local kick-off: the 8th-minute opening goal (7:30 on the clock), the first of his first-half hat-trick. A RisoStory (chapters mode)
 * played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written
 * accounts (we did not watch the footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Lineker a signature, not a single match ("Signature: the poacher's finish in the six-yard box";
 * lesson "Get across your defender to the near post and finish with one touch"). This goal is the textbook, best-documented example: a
 * low cross from the right that he met first time, stretching, with a right-foot side-foot from 5–6 yards out. It turned his World Cup
 * (no goals in England's first two games) and began the hat-trick that made him the tournament's Golden Boot winner.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - englandfootballonline.com, "England Match No. 616 - Poland - 11 June 1986" (efo-616-pol-1986): venue, date, 4.00pm CST kick-off,
 *    attendance 22,600, Poland kicked off; "[1-0] Gary Lineker 8 (7:30) stretched to side-foot in with his right-foot from 5 yards to turn in
 *    a Gary Stevens cross"; [2-0] 14' right foot from 7 yards (Hodge cross); [3-0] 36' left foot after a Steven corner; lineups and numbers
 *    (Lineker 10, M. Gary Stevens 2, Trevor Steven 17, Beardsley 20, Sansom 3, Hodge 18, Reid 16, Hoddle 4, Butcher 6, Fenwick 14, Shilton 1;
 *    Poland: Młynarczyk 1, Ostrowski 4, Wójcicki 5, Majewski 10, Pawlak 18, Boniek 20 ...); referee André Daina (Switzerland), officials in
 *    black; KITS: England "the 1986 Umbro World Cup uniform - white v-necked jersey with shadow stripes, blue collar with white/red trim ...
 *    blue shorts ... white socks"; Poland "Red v-necked diagonal shadow striped jerseys with white Adidas trim ... white shorts ... red socks".
 *  - englandstats.com, match 616 (englandstats-616), quoting Mike Payne, England: The Complete Post-War Record (1993): "Sansom won a tackle deep
 *    in England's half on the left and the ball bobbed from Lineker to Beardsley and back again before the Everton man cut inside. Lineker
 *    switched the attack square to Steven on the right and Steven...waited for Stevens to make the overlapping run. The right-back sent the
 *    ball across low and there was...Lineker surging in to sweep it past Mlynarczyk." Right-footed from 6 yards, 8' (07:33).
 *  - Wikipedia, "Gary Lineker" (raw): the second-quickest World Cup hat-trick, six goals and the Golden Boot, "He played most of the tournament
 *    wearing a lightweight cast on his forearm". A search-result snippet on the match: "the game that launched 1,001 copycat
 *    wrist-bandage-wearing schoolkids" (ddg-lineker-cast-1986).
 * CONFIRMED by those accounts: date, ground, competition, score and minute; England had to win (no goals and one point from the first two
 * games); the move: Sansom's tackle deep in England's half on the left, Lineker and Beardsley swapping the ball, Lineker cutting inside and
 * switching play square to Trevor Steven on the right, Steven waiting for right-back Gary Stevens' overlap, Stevens' LOW cross, Lineker
 * surging in and stretching to side-foot it in FIRST TIME with his RIGHT foot from 5–6 yards past Józef Młynarczyk. Kits: England white
 * shirts, blue (navy) shorts, white socks; Poland red shirts, white shorts, red socks; referee in black. Lineker wore 10 and a light cast.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, run and timing between those beats (the exact line
 * of Lineker's run from his own half; that he came across the front of a Polish centre-back towards the NEAR post, the lesson's reading of
 * "surging in"; where Stevens crossed from); which ARM the cast was on (drawn on the left forearm) and its look (a paper band); the side
 * of the pitch England attacked in the first half (drawn left to right from the main stand, so the right wing is the near touchline);
 * Młynarczyk's kit (drawn grey) and position (near his near post), his late dive; where the ball went in (low, just right of centre);
 * Lineker's follow-through and celebration; the other players' spots; the crowd (thin, as 22,600 in a bigger bowl), a sunny afternoon,
 * the stadium drawn as an open bowl with no roof and the Sierra Madre hills beyond; the ball drawn as a classic panel ball.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time (the move is keyed to the words, ~1–1.4× real time before the cross, real time from the cross), panning with the switch, the
 * overlap, the low cross and the finish; 2 = slow-motion replay from a low camera behind the crosser on the near touchline: Lineker's long
 * run arriving and surging in at the ball; 3 = the reverse angle from the near byline, low and close: the stretch, the right side-foot,
 * past the keeper, the net, the celebration; 4 = the lesson, a duotone replay (get across your defender, near post, one touch).
 * NEVER top-down. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world
 * is LEFT-handed (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (sunlight, grass with blue), red (Poland, skin), blue (sky, grass, shade), navy (England shorts, key line). The lesson
 * chapter is a duotone beat (navy + yellow on paper). */
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
 {label:'Mexico, live',text:'Mexico, 1986. England must beat Poland. Kenny Sansom wins it, Lineker and Beardsley swap passes, and Lineker switches it to Trevor Steven. Gary Stevens overlaps, crosses low... Lineker! Goal!',tail:2.2,
  cues:['Mexico','England must beat Poland','Kenny Sansom','swap passes','switches it','Trevor Steven','Gary Stevens overlaps','crosses low','Lineker!','Goal']},
 {label:'Watch his run',text:'Watch it again, slowly. After his pass, Lineker sprints all the way into the box, then surges in to meet the low cross.',tail:1,
  cues:['Watch it again','After his pass','Lineker sprints','into the box','surges in','the low cross']},
 {label:'One touch',text:'He stretches out his right foot and sweeps it first time past the Polish keeper! One-nil, and his first-half hat-trick has begun!',tail:2,
  cues:['He stretches','right foot','sweeps it','first time','Polish keeper','One-nil','hat-trick']},
 {label:'Your turn',text:'Your turn: get across your defender to the near post, and finish with one touch.',tail:2,
  cues:['Your turn','get across','your defender','the near post','one touch']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py lineker-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/lineker-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/lineker-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lineker: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`lineker film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ---------------- the Estadio Universitario on a June afternoon: an open bowl (no roof), a thin crowd, hills beyond, grass, lines, the goal ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-140,68],[35,68],[35,-68],[-140,-68]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA]: 0 far side, 1 behind the goal England attack, 2 the main stand (behind the camera), 3 the far end */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1,IN[i][1]],[IN[j][0],1,IN[j][1]],[OUT[j][0],24,OUT[j][1]],[OUT[i][0],24,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 red (Poland) / 2 yellow hats / 3 blue, phase] — 22,600 in a bigger bowl: thin, in patches */
const CROWD=(()=>{const r=rng(1986),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){for(let i=0;i<260;i++){const u=r(),v=.04+r()*.9,c=r();
 // patchy: fuller low down and near the halfway line, empty concrete high up behind the goals
 const keep=(1-v*.7)*(st===0||st===2?1-.5*Math.abs(u-.5):.55);if(r()>keep)continue;out.push([st,u,v,c<.52?0:c<.66?1:c<.84?2:3,r()*TAU]);}}return out;})();
/** the Sierra Madre beyond the far stand: a ridge line (x, height) far behind z = +far */
const RIDGE:[number,number][]=(()=>{const r=rng(64),o:[number,number][]=[];for(let x=-420;x<=320;x+=20)o.push([x,70+60*Math.abs(Math.sin(x*.009+.7))+30*r()]);return o;})();
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a hot, pale afternoon sky: a thin blue screen, deeper towards the top
 s.field(B,.14,.6);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-700],[-Bnd,hz-560]],true),.2);
 // the hills: a hazy blue ridge far beyond the far stand (and beyond the goal end), only when the camera looks that way
 {const hill=new Path2D();for(const[side,zf] of [[0,420],[1,0]] as [number,number][]){const pts:V3[]=[];
   if(side===0){RIDGE.forEach(([x,h])=>pts.push([x,h,zf]));pts.push([320,0,zf],[-420,0,zf]);}
   else{RIDGE.forEach(([x,h])=>pts.push([380,h*.8,x*.9]));pts.push([380,0,288],[380,0,-378]);}
   if(pts.every(p=>depthOf(c,p)>NEAR))addPoly(hill,pts.map(p=>P(c,p)));}
  s.tone(B,hill,.42);s.tone(K,hill,.1);}
 // stands: concrete terraces in the sun (paper under a light blue screen) with stepped shade bands; the far side's upper rim a hard edge
 const stands=new Path2D(),terr=new Path2D(),rim=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<10;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/10),bil(q,1,k/10),bil(q,1,(k+1)/10),bil(q,0,(k+1)/10)]));
  addPoly(rim,clipPoly(c,[q[3],q[2],[q[2][0],q[2][1]+1.2,q[2][2]],[q[3][0],q[3][1]+1.2,q[3][2]]]));});
 s.knockout(stands);s.tone(B,stands,.34);s.tone(K,stands,.26);s.tone(Y,stands,.14);s.tone(K,terr,.2);s.fill(K,rim,.8);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.95);if(seen[1]){s.knockout(heads[1],.9);s.fill(R,heads[1],.85);}if(seen[2]){s.knockout(heads[2],.9);s.fill(Y,heads[2],.9);}if(seen[3])s.fill(B,heads[3],.7);
 // camera flashes and waving shirts in the crowd after the goal (paper sparks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.7);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass in the sun: yellow × blue = green, mow stripes, paper lines
 const ground=clipPoly(c,[[-111,0,-40],[6,0,-40],[6,0,40],[-111,0,40]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.56);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.18);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // advertising boards at the pitch edge: paper panels with red and blue blocks (1986 boards were printed, not LED)
 const boards=new Path2D(),ads=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][]){addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));
  const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/7);for(let i=0;i<n;i+=2){const u0=(i+.15)/n,u1=(i+.85)/n,p0:V3=[lerp(a[0],b[0],u0),.2,lerp(a[1],b[1],u0)],p1:V3=[lerp(a[0],b[0],u1),.8,lerp(a[1],b[1],u1)];addPoly(ads,clipPoly(c,[[p0[0],.2,p0[2]],[p1[0],.2,p1[2]],[p1[0],.8,p1[2]],[p0[0],.8,p0[2]]]));}}
 s.knockout(boards);s.tone(B,boards,.2);s.fill(R,ads,.7);
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
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Lineker's right foot is his right foot
// on screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose);
 * `cast` adds Lineker's light forearm cast (a paper band with a key line) on the left forearm once the figure is big enough to read it */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false,cast=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 const r=A.drawAthlete(s,pose,pj,style,place,{prev});
 if(cast&&r.detail!=='low'){const e=r.joints.lEl,h=r.joints.lHa,a:Pt=[lerp(e[0],h[0],.4),lerp(e[1],h[1],.4)],b:Pt=[lerp(e[0],h[0],.9),lerp(e[1],h[1],.9)],w=Math.max(3,Math.hypot(h[0]-e[0],h[1]-e[1])*.3);
  const band=ribbon([a,b],w,{taper:0,pressure:0,wobble:.5});s.stroke(K,band,Math.max(1.5,w*.25),.9);s.knockout(band);}
 return r;}
const SKIN_L:A.InkFill[]=[[Y,.86],[R,.22]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]];
const LINE={line:K,boots:K,hair:K,shade:[B,.3] as A.InkFill};
/** England: white shirts with a blue collar (drawn as navy trim), blue shorts, white socks (EFO: the 1986 Umbro World Cup uniform) */
const ENG=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',shorts:[K,.85],socks:'paper',trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:5,...o});
/** Poland: red shirts with white trim, white shorts, red socks (EFO) */
const POL=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.92],shorts:'paper',socks:[R,.92],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:11,...o});
const LB_:A.Build={height:1.77,bulk:.96};
const LINEKER:A.AthleteStyle=ENG({number:10,hair:[K,.85],build:LB_,seed:10});
const STEVENS:A.AthleteStyle=ENG({number:2,build:{height:1.8},seed:2});
const STEVEN:A.AthleteStyle=ENG({number:17,hair:[Y,.55],build:{height:1.75},seed:17});
const BEARDSLEY:A.AthleteStyle=ENG({number:20,build:{height:1.71},seed:20});
const SANSOM:A.AthleteStyle=ENG({number:3,build:{height:1.68},seed:3});
const CB5:A.AthleteStyle=POL({number:5,build:{height:1.85,bulk:1.04},seed:5});
const KEEPER:A.AthleteStyle={...LINE,shirt:[K,.45],shorts:[K,.8],socks:[K,.45],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.84},seed:23};
const REF:A.AthleteStyle={...LINE,shirt:[K,.9],shorts:K,socks:K,skin:SKIN_L,hairStyle:'balding',hair:[K,.7],seed:17};
/** a figure on the pitch: ground (x,z) in this world, heading yaw (radians), the pose now and one drawn frame earlier (secondary motion) */
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean;cast?:boolean};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear,!!bd.cast);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
/** the ball (drawn as a classic panel ball): paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad+h*.25,.02,z+Math.sin(a)*rad-h*.2];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Lineker's touch) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const SHOT=.3,FLY_DUR=1.1;
const T_TACKLE=-12.2,T_L1=-11.5,T_B=-10.9,T_L2=-10.2,T_SW=-8.6,T_SR=-7.5,T_SP=-3.8,T_VR=-3,T_CROSS=-1.2;
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

// Sansom's tackle on the left (+z) deep in England's half → Lineker ↔ Beardsley → Lineker cuts inside and switches it square to Steven on the
// right (−z) → Steven waits → Stevens overlaps → the low cross → Lineker, who has run the length of the half, surges in (all paths inferred)
const HG:[number,number]=[-5.1,-2.2];// where Lineker meets it: 5–6 yards out, towards the near post
const LIN_P:MKey[]=[[-14,-77,19],[T_L1,-74.5,17.2],[T_B,-73.4,15.8],[T_L2,-70.6,13],[-9.4,-67.5,9.4],[T_SW,-64.6,6.4],[-7,-54,5],[-5,-41,4],[-3,-28,3],[-1.8,-19.5,2.1],[-1.2,-14.2,1.4],[-.6,-9.2,-.3],[-.25,-6.5,-1.5],[0,HG[0],HG[1]],[.5,-4.2,-2.6],[1.2,-3.6,-3]];
const BEA_P:MKey[]=[[-14,-70,19],[T_L1,-71,15],[T_B,-71.3,13.6],[-9,-66,13],[-6,-55,12],[-2,-40,10],[2,-31,8]];
const SAN_P:MKey[]=[[-14,-82,27],[T_TACKLE,-79,24.8],[-11.4,-78.6,24.2],[-9,-74,25],[0,-55,25],[2,-51,25]];
const STE_P:MKey[]=[[-14,-62,-17],[T_SW,-58,-20],[T_SR,-55.5,-21.6],[-6.4,-52,-21],[-5,-48.5,-20],[T_SP,-46,-19.4],[-2,-42,-18],[2,-34,-15]];
const STV_P:MKey[]=[[-14,-80,-28],[-8.6,-68,-30],[-6,-57,-31],[T_SP,-45,-31.5],[T_VR,-38.6,-31],[-2.1,-33,-30.2],[T_CROSS,-27.6,-29.4],[-.4,-25,-28.8],[2,-22,-28]];
const DEF_P:MKey[]=[[-14,-40,1],[-8,-30,1.2],[-4,-18,1.4],[T_CROSS,-8.6,.8],[-.5,-7,.2],[0,-6.4,-.4],[1.5,-5.8,-.8]];// Polish centre-back (drawn as Wójcicki, 5)
const KEEP_X=-1;
const OTHERS:Mover[]=[
 {style:POL({number:10,build:{height:1.83},seed:40}),path:[[-14,-38,8],[-4,-17,6.6],[0,-8.4,4.6],[2,-7,4]]},// Majewski, the other centre-back
 {style:POL({number:18,seed:41}),path:[[-14,-42,-20],[T_SP,-34,-24],[T_CROSS,-24,-27],[0,-21,-26.5],[2,-19,-26]]},// Pawlak, closing Stevens
 {style:POL({number:4,seed:42}),path:[[-14,-44,24],[-4,-24,16],[0,-13,10],[2,-11,9]]},// Ostrowski
 {style:POL({number:20,seed:43}),path:[[-14,-66,4],[-8,-56,2],[0,-30,2],[2,-26,1.5]]},// Boniek
 {style:POL({number:13,seed:44}),path:[[-14,-60,-8],[-6,-46,-10],[0,-24,-9],[2,-21,-8]]},// Komornicki
 {style:POL({number:6,seed:45}),path:[[-14,-58,20],[-6,-44,17],[0,-22,13],[2,-19,12]]},// Matysik
 {style:POL({number:11,seed:46}),path:[[-14,-84,14],[-8,-78,10],[0,-58,6],[2,-54,5]]},// Smolarek
 {style:ENG({number:18,seed:50}),path:[[-14,-58,27],[-6,-40,22],[0,-17,12],[2,-14,10]]},// Hodge, arriving at the far post
 {style:ENG({number:16,seed:51}),path:[[-14,-66,-6],[-6,-52,-8],[0,-34,-8],[2,-31,-8]]},// Reid
 {style:ENG({number:4,build:{height:1.83},seed:52}),path:[[-14,-74,2],[-6,-64,0],[0,-47,1],[2,-44,1]]},// Hoddle
 {style:ENG({number:6,build:{height:1.93,bulk:1.1},seed:53}),path:[[-14,-92,-8],[0,-70,-6],[2,-67,-6]]},// Butcher
 {style:ENG({number:14,build:{height:1.8},seed:54}),path:[[-14,-92,9],[0,-70,6],[2,-67,6]]},// Fenwick
 {style:REF,path:[[-14,-70,-10],[-6,-52,-13],[0,-30,-12],[3,-24,-11]]},// referee André Daina
];

// ---- Lineker: the long run, the surge across, the stretched RIGHT side-foot (τ = 0), balance, then the celebration ----
/** the stretch, authored for the RIGHT foot (contact .5): a long last stride, left leg planted and bent deep, the right leg reaching long and
 * low across the ball with the toes turned out (the inside of the foot), the body leaning back, arms wide for balance */
function stretch(t:number):A.Pose{
 const keys:[number,A.Pose][]=[
  [0,A.posed({lHipF:36,lKnee:40,rHipF:-24,rKnee:82,lAnk:10,lean:16,pitch:6,lShF:-30,rShF:38,lElb:76,rElb:80,neckP:6})],
  [.24,A.posed({lHipF:24,lKnee:52,lAnk:-6,rHipF:12,rHipA:14,rHipR:18,rKnee:74,rAnk:20,lean:10,pitch:2,lShF:10,lShA:40,rShF:24,rShA:34,lElb:50,rElb:56,neckP:22,squash:-.06})],
  [.5,A.posed({lHipF:58,lKnee:98,lAnk:-18,rHipF:66,rHipA:26,rHipR:44,rKnee:6,rAnk:-14,lean:-4,pitch:-12,bend:-6,twist:-10,lShF:26,lShA:66,lElb:30,rShF:16,rShA:58,rElb:26,neckP:34,neckY:6,squash:.05})],
  [.68,A.posed({lHipF:50,lKnee:92,lAnk:-12,rHipF:52,rHipA:20,rHipR:30,rKnee:22,rAnk:0,lean:-2,pitch:-10,lShF:34,lShA:74,lElb:36,rShF:24,rShA:66,rElb:34,neckP:10,neckY:14})],
  [.86,A.posed({lHipF:22,lKnee:46,rHipF:34,rKnee:40,lean:6,pitch:0,lShF:20,lShA:50,lElb:50,rShF:18,rShA:46,rElb:50,neckP:-6,neckY:20,squash:-.04})],
  [1,A.posed({lHipF:14,lKnee:24,rHipF:10,rKnee:20,lean:4,lShF:10,lShA:30,lElb:50,rShF:10,rShA:30,rElb:50,neckP:-4,neckY:18})],
 ];
 return A.clampPose(A.keyPoses(clamp(t),keys));}
const strT=(tau:number)=>clamp(.5+tau/FLY_DUR);
/** heading at the strike: coming across towards the near post (−z), turned to face the goal as the right leg sweeps it in (inferred) */
const HYAW=-20*Math.PI/180;
function linekerState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(LIN_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/7.5)});
 let pose=A.blendPose(A.stand(),run,clamp((v-.3)/1.2));
 // on the ball in his own half: short touches, then the switch pass with his right foot
 if(tau>T_L2-.1&&tau<T_SW-.3)pose=A.blendPose(pose,A.dribble(((tau*2.2)%1+1)%1,{foot:'r',speed:.55}),.6);
 const sw=sm(T_SW-.5,T_SW-.28,tau)*(1-sm(T_SW+.35,T_SW+.8,tau));
 if(sw>0)pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_SW)/1.1),{foot:'r',power:.7}),sw);
 pose=A.blendPose(pose,stretch(strT(tau)),easeInOutSine(sm(-.6,-.3,tau)));
 if(tau<-.4&&tau>T_CROSS-.8){// eyes on the cross as it comes in
  const w=sm(T_CROSS-.8,T_CROSS,tau)*(1-sm(-.6,-.4,tau));pose={...pose,neckY:pose.neckY-.5*w,neckP:pose.neckP+.15*w};}
 const cel=easeInOutSine(sm(1.1,1.8,tau));
 if(tau>1.1)pose=A.blendPose(pose,A.celebrate(tau-1.1,{kind:'arms'}),cel);
 let yaw=v>.2?Math.atan2(q.vz,q.vx):HYAW;
 if(tau>T_SW-.6&&tau<T_SW+.4)yaw=angLerp(yaw,Math.atan2(-21.6-6.4,-55.5+64.6),sw);// square to the right
 yaw=angLerp(yaw,HYAW,sm(-.45,-.15,tau));
 if(tau>1.1)yaw=angLerp(yaw,-Math.PI*.7,cel);// turns to the crowd in the main stand
 return{x:q.x,z:q.z,yaw,pose};}
/** the ball on the INSIDE of his RIGHT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sk=A.solve(stretch(.5),LB_,{x:HG[0],z:-HG[1],yaw:HYAW}),m=mix3(sk.rAn,sk.rToe,.45);return[m[0],Math.max(.11,m[1]),-m[2]];})();
/** where it crosses the line: low, just right of centre (inferred) */
const NETPT:V3=[.25,.35,.7];
const CROSS_FOOT:V3=[-27.1,.11,-29.1];
/** a low driven cross a → b: skims up to ~.5 m and slows a little as it runs */
function lowCross(a:V3,b:V3,u:number):V3{const e=1-Math.pow(1-clamp(u),1.25);return[lerp(a[0],b[0],e),lerp(a[1],b[1],e)+.42*Math.sin(Math.PI*e),lerp(a[2],b[2],e)];}
/** a ground pass a → b over [t0,t1] */
function pass(a:V3,b:V3,t0:number,t1:number,tau:number):V3{const u=easeOut(clamp((tau-t0)/(t1-t0)));return[lerp(a[0],b[0],u),.11,lerp(a[2],b[2],u)];}
/** the ball on τ: the tackle → Lineker → Beardsley → Lineker → the switch → Steven → Stevens → the low cross → the touch → the net */
function carried(p:MKey[],tau:number,lead=.6):V3{const q=moverPos(p,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.12;return[q.x+q.vx/v*(lead+ph),.11,q.z+q.vz/v*(lead+ph)];}
const at0=(p:MKey[],t:number):V3=>{const q=moverPos(p,t);return[q.x,.11,q.z];};
function ballT(tau:number):V3{
 if(tau<T_TACKLE){const q=moverPos(SAN_P,tau);return[q.x+2.2,.11,q.z-1.2];}
 if(tau<T_L1){const a=at0(SAN_P,T_TACKLE),b=at0(LIN_P,T_L1),u=clamp((tau-T_TACKLE)/(T_L1-T_TACKLE));return[lerp(a[0],b[0],u),.11+.8*Math.sin(Math.PI*u)*.6,lerp(a[2],b[2],u)];}// it bobbles loose
 if(tau<T_B)return pass(at0(LIN_P,T_L1),at0(BEA_P,T_B),T_L1,T_B,tau);
 if(tau<T_L2)return pass(at0(BEA_P,T_B),at0(LIN_P,T_L2),T_B,T_L2,tau);
 if(tau<T_SW-.2)return carried(LIN_P,tau,.55);
 if(tau<T_SW){const a=carried(LIN_P,T_SW-.2001,.55),u=sm(T_SW-.2,T_SW,tau);return mix3(a,at0(LIN_P,T_SW),u*.5);}
 if(tau<T_SR){const a=ballT(T_SW-.001),b=at0(STE_P,T_SR),u=easeOut(clamp((tau-T_SW)/(T_SR-T_SW)));return[lerp(a[0],b[0],u),.11+.6*Math.sin(Math.PI*u),lerp(a[2],b[2],u)];}// a long square ball, a little lofted
 if(tau<T_SP-.2)return carried(STE_P,tau,.55);
 if(tau<T_VR){const a=carried(STE_P,T_SP-.2001,.55);return pass(a,at0(STV_P,T_VR),T_SP-.2,T_VR,tau);}
 if(tau<T_CROSS-.2)return carried(STV_P,tau,.6);
 if(tau<T_CROSS){const a=carried(STV_P,T_CROSS-.2001,.6),u=sm(T_CROSS-.2,T_CROSS,tau);return mix3(a,CROSS_FOOT,u);}
 if(tau<0)return lowCross(CROSS_FOOT,CONTACT,(tau-T_CROSS)/-T_CROSS);
 if(tau<SHOT)return mix3(CONTACT,NETPT,tau/SHOT);
 const s=tau-SHOT,u=clamp(s/.12);if(u<1)return mix3(NETPT,[1.7,.3,.9],u);
 const d=clamp((s-.12)/.5);return[1.7-.3*d,.11+.15*(1-d)*Math.abs(Math.sin(d*7)),.9+.2*d];}
/** Młynarczyk: shuffling across to his near post as the cross comes, then a late dive to cover the far side (+z) */
const DIVE_DUR=1.05,DIVE_T0=-.02;
function keeperState(tau:number){const z=lerp(.6,-1.5,sm(T_CROSS-.4,-.2,tau,easeInOutSine));
 let pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'r',height:.2});
 if(tau<DIVE_T0&&tau>T_CROSS){const ph=Math.sin((tau-T_CROSS)*11);pose={...pose,lHipA:pose.lHipA+.25*Math.max(0,ph),rHipA:pose.rHipA+.25*Math.max(0,-ph),air:pose.air+.03*Math.abs(ph)};}
 return{x:KEEP_X,z,yaw:Math.PI,pose};}
/** a passer: on the ball, then the pass (right foot) at tp towards `to` */
function passerState(path:MKey[],tau:number,ball:V3,tp:number,to:[number,number],onFrom=-99){const st=moverState(path,tau,ball),w=sm(tp-.5,tp-.28,tau)*(1-sm(tp+.35,tp+.8,tau)),q=moverPos(path,tp);
 if(tau>onFrom&&tau<tp-.45)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.2)%1+1)%1,{foot:'r',speed:.55}),.6);
 return{...st,yaw:angLerp(st.yaw,Math.atan2(to[1]-q.z,to[0]-q.x),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-tp)/1.1),{foot:'r',power:.6}),w)};}
/** the centre-back: tracks the ball, a step too slow as Lineker comes across in front of him, then a late lunge */
function defState(tau:number,ball:V3){const st=moverState(DEF_P,tau,ball,A.stand),w=sm(-.45,-.1,tau)*(1-sm(.6,1.2,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(-.45,0,tau)),{side:'r'}),w)};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean;cast?:boolean}[]=[];
  const tackle=moverState(SAN_P,t,b),tw=sm(T_TACKLE-.4,T_TACKLE,t)*(1-sm(T_TACKLE+.3,T_TACKLE+.8,t));tackle.pose=A.blendPose(tackle.pose,A.lunge(clamp(.6*sm(T_TACKLE-.4,T_TACKLE,t)),{side:'l'}),tw);
  out.push({...tackle,style:SANSOM},
   {...passerState(BEA_P,t,b,T_B,[LIN_P[3][1],LIN_P[3][2]]),style:BEARDSLEY},
   {...passerState(STE_P,t,b,T_SP,[-38.6,-31],T_SR),style:STEVEN},
   {...passerState(STV_P,t,b,T_CROSS,[HG[0],HG[1]],T_VR),style:STEVENS,smear:t>T_CROSS-.2&&t<T_CROSS+.25},
   {...defState(t,b),style:CB5});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...linekerState(t),style:LINEKER,smear:t>-.25&&t<.3,cast:true},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.2&&t<DIVE_T0+.7});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (low, just right of centre) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.4,p[2]-.8)+Math.abs(p[0]-1.7)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.1,p[2]];};

// ---------------- chapter 1 (live, ~real time): the high main-stand camera pans with the move; the switch; the cross; the finish; the net ----------------
/** the live clock: the move keyed to the words (≈1–1.4× real time up to the cross), real time from the cross on */
const tau1=(t:number)=>{const q={ks:T(0,'Kenny Sansom'),sw:T(0,'swap passes'),si:T(0,'switches it'),ts:T(0,'Trevor Steven'),ov:T(0,'Gary Stevens overlaps'),cl:T(0,'crosses low'),g:T(0,'Goal')};
 const tc=Math.max(q.cl+.1,q.g-SHOT-.25+T_CROSS);
 return key(t,mono<[number,number]>([[0,T_TACKLE-.8],[q.ks+.2,T_TACKLE+.1],[q.sw+.2,T_B],[q.si+.3,T_SW],[q.ts+.3,T_SR],[q.ov+.2,T_SP-.6],[tc,T_CROSS],[tc+20,T_CROSS+20]]) as unknown as Key[],x=>x);};
const BCAM:V3=[-38,19,-54];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_CROSS){const w=sm(T_VR,T_CROSS,tau),l=moverPos(LIN_P,tau);return[lerp(b[0],l.x,.08+.1*w),.5,lerp(b[2],l.z,.08+.1*w)];}
 const w=sm(T_CROSS,-.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-10,.3),1.2,lerp(b[2],-4,.3)];return mix3(mid,[-4,1.2,-1.8],w);}
function ch1Cam(t:number){const tau=tau1(t),a=ch1Look(tau),b=ch1Look(tau-.15),c=ch1Look(tau-.3),look:V3=[(2*a[0]+b[0]+c[0])/4,(2*a[1]+b[1]+c[1])/4,(2*a[2]+b[2]+c[2])/4];
 const F=key(tau,[[-13,3300],[T_SW,3400],[T_SP,3500],[T_CROSS,3900],[-.4,5600],[0,6400],[.8,6300],[1.8,5400],[4,5200]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),c=ch1Cam(t),tau=tau1(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:11.6,
};

// ---------------- chapter 2 (TV replay, slow motion, a low camera behind the crosser on the near touchline): the long run, the surge ----------------
const ch2T=()=>({w:T(1,'Watch it again'),ap:T(1,'After his pass'),ls:T(1,'Lineker sprints'),box:T(1,'into the box'),sg:T(1,'surges in'),lc:T(1,'the low cross'),end:SEC(1)});
/** replay clock: from the overlap (Lineker already sprinting), slowed, to the moment before the touch */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_SP-.4],[q.ls,T_VR],[q.box,-1.9],[q.sg,T_CROSS+.1],[q.lc,-.7],[q.end,-.38]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-38,2.6,-42];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),m=moverPos(LIN_P,tau),him:V3=[m.x,1.2,m.z];
 const w=key(t,mono<[number,number]>([[0,.85],[q.ls,.9],[q.box,.8],[q.sg,.6],[q.lc,.55],[q.end,.55]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,3000],[q.ls,3300],[q.box,3900],[q.sg,4700],[q.lc,5200],[q.end,5300]]) as unknown as Key[]);
 const lk=mix3(b,him,w);lk[1]=Math.min(lk[1],1.6);return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN*.7)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6.6,
};

// ---------------- chapter 3 (reverse replay from the near byline, low and close): the stretch, the right side-foot, past the keeper, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'sweeps it')+.1)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{hs:T(2,'He stretches'),rf:T(2,'right foot'),HIT,ft:T(2,'first time'),pk:T(2,'Polish keeper'),one:T(2,'One-nil'),ht:T(2,'hat-trick'),end:SEC(2)};};
/** replay clock: the stretch in slow motion up to the touch on "sweeps it", the ball in on "Polish keeper", then real time */
const tau3=(t:number)=>{const q=ch3T(),tm=Math.max(q.pk+.2,q.HIT+.9),tn=Math.max(q.one,tm+.3);
 return key(t,mono<[number,number]>([[0,-.62],[q.hs,-.42],[q.rf,-.16],[q.HIT,0],[tm,SHOT*.95],[tn,SHOT+.3],[tn+1,SHOT+1.3],[tn+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[3.2,1.25,-13.5];
function ch3Cam(t:number){const q=ch3T(),tm=Math.max(q.pk+.2,q.HIT+.9),L:V3=[HG[0],0,HG[1]];
 return camKeysOf(t,mono<CK>([[0,...CAM3,L[0]-.8,1.05,L[2]-.4,3000],[q.hs,...CAM3,L[0]-.3,.95,L[2],3300],[q.HIT,...CAM3,L[0]+.3,.85,L[2]+.2,3500],[q.ft,...CAM3,L[0]+1.4,.8,L[2]+.8,3100],[tm,...CAM3,-1.2,.8,-.2,2700],[q.one,...CAM3,-2.4,1,-1.2,2500],[q.ht,2.6,1.4,-15,-4,1.3,-3.6,2600],[q.end,2.6,1.4,-15,-4,1.4,-4,2500]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?6*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.one,q.one+.5,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.3,net});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  // the one touch: a yellow spark off the inside of the right boot
  if(tau>-.01&&tau<.1){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],60+240*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
 },
 aperture(t){const c=ch3Cam(t),m=moverPos(LIN_P,tau3(t)),p:V3=[m.x,1.5,m.z],[x,y]=P(c,p),r=clamp(.5*kAt(c,p),30,300);return apertureDisc(x,y,r,12);},
 still:4.4,
};

// ---------------- chapter 4 (duotone replay): get across your defender, near post, one touch ----------------
/** the lesson world: the same six-yard box, seen from behind the attacker, a little raised (not top-down), the near post and the wing on the right; the defender stands where Lineker
 * started, Lineker runs across in FRONT of him to the near post and meets the low ball with one touch */
const L4:V3=[-17.5,4.2,3];
const cam4=(z:number)=>makeCam(L4,[-6.3,.6,-1.2],3000*z);
const DUO=(o:A.AthleteStyle):A.AthleteStyle=>({...o,shirt:[K,.78],shorts:'paper',socks:[K,.78],hair:[K,.95],skin:[[Y,.62],[K,.26]],shade:[K,.2],trim:K,numberInk:'paper',detail:'mid'});
const LDUO:A.AthleteStyle=DUO(LINEKER),DDUO:A.AthleteStyle={...DUO(CB5),shirt:[K,.4],socks:[K,.4],shorts:[K,.4]};
const ch4T=()=>{const ot=T(3,'one touch');return{yt:T(3,'Your turn'),ga:T(3,'get across'),yd:T(3,'your defender'),np:T(3,'the near post'),ot,CT:ot+.4,end:SEC(3)};};
/** the lesson run: from behind the defender's shoulder (−8.4, .9) across his front to the near-post spot HG, arriving at CT */
const RUN4:Pt[]=[[-8.6,1.1],[-7.6,.2],[-6.6,-1.1],[-5.6,-1.9],[HG[0],HG[1]]];
function run4At(u:number):Pt{const n=RUN4.length-1,f=clamp(u)*n,i=Math.min(n-1,Math.floor(f)),k=f-i;return[lerp(RUN4[i][0],RUN4[i+1][0],k),lerp(RUN4[i][1],RUN4[i+1][1],k)];}
function lesson(t:number){const q=ch4T(),u=easeInOutSine(sm(q.ga-.1,q.CT-.05,t)),p=run4At(u),pv=run4At(u-.02),moving=sm(q.ga-.2,q.ga+.1,t)*(1-sm(q.CT-.3,q.CT,t));
 let pose=A.blendPose(A.stand(),A.runCycle(((t*1.6)%1+1)%1,{speed:.8}),moving);
 pose=A.blendPose(pose,stretch(.5+(t-q.CT)/FLY_DUR),easeInOutSine(sm(q.CT-.55,q.CT-.25,t)));
 const yaw=u>.02&&u<.98?Math.atan2(p[1]-pv[1],p[0]-pv[0]):u>=.98?HYAW:0;return{x:p[0],z:p[1],yaw:angLerp(yaw,HYAW,sm(q.CT-.4,q.CT-.1,t)),pose};}
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
/** ground ring (metres) projected */
function groundRing(c:Cam,x:number,z:number,r:number,n=24):Path2D{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;pts.push(P(c,[x+Math.cos(a)*r,.02,z+Math.sin(a)*r]));}return polyPath(pts,true);}
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,c=cam4(key(t,mono<[number,number]>([[0,1],[q.np,1.06],[CT,1.12],[q.end,1.1]]) as unknown as Key[]));
  frame(s);
  // the replay stage: navy field, the six-yard box and goal line in paper, a yellow pool of light at the near post
  s.field(K,.72,.5);
  const pool=groundRing(c,HG[0]+1,HG[1]-.4,4.2,32);s.knockout(pool,.55);s.tone(Y,pool,.35);
  const lines=new Path2D();groundLine(lines,c,[0,-9.16],[-5.5,-9.16],.2);groundLine(lines,c,[-5.5,-9.16],[-5.5,9.16],.2);groundLine(lines,c,[0,-12],[0,9.16],.2);s.knockout(lines,.9);
  goal(s,c,tt>CT+SHOT?netRipple(tt-CT-SHOT):undefined);
  const pj=projector(c);
  // the near post: a yellow halo on "the near post"
  const np=sm(q.np-.1,q.np+.3,tt,easeOutBack)*(1-sm(CT+.4,CT+.9,tt));
  if(np>.02){const a=P(c,[0,0,-3.66]),b=P(c,[0,2.44,-3.66]),k=kAt(c,[0,1,-3.66]);s.stroke(Y,ribbon([a,b],.16*k,{taper:0,pressure:0,wobble:.5}),.1*k*np,.95);}
  // the defender: ball-watching, then turning too late
  const dx=-6.4,dz=.3,dyaw=(u:number)=>angLerp(Math.atan2(-9-dz,-12-dx),Math.atan2(-2-dz,-4-dx),sm(CT-.3,CT+.3,u));
  const dp=(u:number)=>A.blendPose(A.stand(),A.lunge(clamp(.6*sm(CT-.4,CT,u)),{side:'r'}),sm(CT-.5,CT-.2,u));
  // the run: a dashed yellow path across the FRONT of the defender to the near post
  const runG=sm(q.ga-.1,q.ga+.7,tt,easeOut)*(1-sm(CT+.3,CT+.8,tt));
  if(runG>.02){const pts:Pt[]=[];for(let i=0;i<=20;i++)pts.push(P(c,[...((p:Pt)=>[p[0],.03,p[1]])(run4At(i/20))] as V3));dashed(s,pts,runG,.18*kAt(c,[-6,0,0]),Y);
   const e=pts[Math.max(1,Math.round(20*runG))],f=pts[Math.max(0,Math.round(20*runG)-1)],a=Math.atan2(e[1]-f[1],e[0]-f[0]),hs=.34*kAt(c,[-6,0,0]);if(runG>.9)s.fill(Y,polyPath([[e[0]+Math.cos(a)*hs,e[1]+Math.sin(a)*hs],[e[0]+Math.cos(a+2.4)*hs*.8,e[1]+Math.sin(a+2.4)*hs*.8],[e[0]+Math.cos(a-2.4)*hs*.8,e[1]+Math.sin(a-2.4)*hs*.8]],true),.95);}
  // "your defender": a ring on his feet
  const yd=sm(q.yd-.1,q.yd+.3,tt,easeOutBack)*(1-sm(q.np+.2,q.np+.6,tt));
  if(yd>.02)s.stroke(Y,groundRing(c,dx,dz,.9*yd),.1*kAt(c,[dx,0,dz]),.95);
  const l1=lesson(tt),l0=lesson(tt-1/12);
  const items:{d:number;f:()=>void}[]=[
   {d:depthOf(c,[dx,0,dz]),f:()=>drawPlayer(s,dp(tt),dp(tt-1/12),pj,DDUO,{x:dx,z:-dz,yaw:dyaw(tt)})},
   {d:depthOf(c,[l1.x,0,l1.z]),f:()=>drawPlayer(s,l1.pose,l0.pose,pj,LDUO,{x:l1.x,z:-l1.z,yaw:l1.yaw},tt>CT-.3&&tt<CT+.35,true)}];
  // the low ball: in from the right wing along the grass (a dotted line), one touch at CT, then into the goal
  const from:V3=[-8.5,.11,-12.5],bt=(u:number):V3=>lowCross(from,CONTACT,u);let b:V3=tt<CT?bt(sm(q.np,CT,tt,x=>x)):mix3(CONTACT,NETPT,clamp((tt-CT)/SHOT));
  if(tt>CT+SHOT)b=mix3(NETPT,[1.7,.3,.9],clamp((tt-CT-SHOT)/.15));
  items.push({d:depthOf(c,b),f:()=>{if(tt>=q.np-.2&&tt<CT+.3){const dots=new Path2D();for(let i=0;i<=16;i++){const bp=bt(i/16),p=P(c,bp),k=kAt(c,bp)*.09;dots.moveTo(p[0]+k,p[1]);dots.arc(p[0],p[1],k,0,TAU);}s.fill(Y,dots,.95);}
   const p=P(c,b);ballAt(s,p[0],p[1],Math.max(34,BALL_R*kAt(c,b)*1.3),tt*(tt>=CT?12:4),{duo:true});}});
  items.sort((a,b)=>b.d-a.d).forEach(i=>i.f());
  // one touch: a target ring on the boot as the ball arrives, a spark at the touch, speed lines towards the goal
  const cp=P(c,CONTACT),ft=sm(q.ot-.1,q.ot+.25,tt,easeOutBack)*(1-sm(CT+.05,CT+.25,tt));
  if(ft>.02){s.stroke(Y,ring(cp[0],cp[1],80*ft,80*ft),10,.95);}
  if(tt>=CT&&tt<CT+.35)sparkBurst(s,Y,cp[0],cp[1],120+120*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.15,CT+.35,tt),width:14});
  if(tt>=CT&&tt<CT+.5){const g=P(c,NETPT);speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-cp[1],g[0]-cp[0]),{n:5,seed:42,len:200,width:9,cov:.85});}
 },
 still:5,
};

const story:RisoStory={
 id:'lineker-signature',format:'11v11',title:"Lineker's poacher's finish",
 theme:'Get across your defender to the near post and finish with one touch.',
 ageNote:'1986 World Cup, England 3–0 Poland, Estadio Universitario, Monterrey, 11 June 1986 (8th minute, the first goal of his hat-trick).',
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
