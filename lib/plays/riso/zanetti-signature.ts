/** Iconic-play film · Javier Zanetti, "Signature: win it and carry it forward" — shown through one real, sourced moment: Serie A,
 * Genoa 0–5 Internazionale, Stadio Luigi Ferraris ("Marassi"), Genoa, Saturday 17 October 2009 — Inter's SECOND goal (Mario Balotelli,
 * 31st minute), a counter-attack that Zanetti started by taking the ball off a Genoa player. A RisoStory (chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A reconstruction from WRITTEN accounts (the footage
 * itself was not reviewed); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Zanetti a signature, not a match ("Signature: win it and carry it forward"; lesson "After you win
 * the ball, run forward with it to start the attack"). Wikipedia's Zanetti article records exactly that trait inside one real match of the
 * 2009–10 treble season: "In the match against Genoa on 17 October, he started off the counter-attack that led to Inter's second goal after
 * dispossessing a Genoa player." His nickname, El Tractor, is sourced to "his stamina and tireless energetic runs up and down the wings to
 * aid both attack and defence". (The suggested alternative, his 1998 goal v England, is a free-kick routine: a finish, not this signature.)
 *
 * SOURCES (curl, Sept 2026; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "Javier Zanetti" (raw) — wiki-javier-zanetti.txt: the Genoa sentence above (citing inter.it); El Tractor and the style of
 *    play ("a good ball-winner", "two-footed", "excelled at playing on either flank", quick, strong, excellent ball control, acceleration);
 *    Inter captain in 2009–10 (first Italian captain of a treble). Shirt 4 at Inter (retired by the club in 2015, same article).
 *  - Wikipedia, "2009–10 Inter Milan season" (raw) — wiki-2009-10-inter-season.txt: match box 17 October 2009, 15:00 CET, Genoa 0–5
 *    Internazionale, Stadio Luigi Ferraris, attendance 32,942, referee Emidio Morganti; Inter goals Cambiasso 6', Balotelli 31',
 *    Stanković 45+4', Vieira 66', Maicon 71'; Genoa keeper Scarpi sent off 45+4'.
 *  - inter.it, "Throwback Thursday: Stankovic's stunner against Genoa" (4 May 2017, via web.archive.org) — inter-58181-archive.txt:
 *    Inter "visited Marassi on 17 October 2009", "already leading 2-0 thanks to goals from Cambiasso and Balotelli", won 5–0.
 * CONFIRMED: date, ground (away at Genoa's Marassi), competition, score before (1–0 Inter) and after (2–0) the goal, Balotelli the scorer
 * (31'), the move was a counter-attack started by Zanetti dispossessing a Genoa player; Zanetti's nickname and why; Genoa's keeper that day
 * was Alessio Scarpi (not named in the film).
 * INFERRED / ILLUSTRATIVE (kept out of the narration): EVERY position, run and timing (where on the pitch he won it — drawn in Inter's half
 * on the right, the side params.side gives; which Genoa player — unnamed, no number; how — a poke with the right foot; how far he carried it
 * and whether he passed directly to Balotelli — drawn as one carry and one forward pass; Balotelli's touch, shooting foot (right), spot and
 * corner, the keeper's dive). KITS: Genoa in their home red-and-navy (the halved shirt drawn as broad red/navy stripes, the library has no
 * halves), navy shorts and socks; Inter in an all-white change strip with navy trim (white is inferred: Inter's black-and-blue stripes
 * against Genoa's red-and-navy at home); numbers: Zanetti 4, Balotelli 45 (his Inter number that season); others unnumbered. Keeper in
 * blue, referee in navy; Zanetti's neat dark hair; the crowd mostly Genoa red and navy; daylight (the box gives a 15:00 kick-off); Marassi
 * drawn as its four tight, roofed stands right up to the pitch with the red corner towers.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME:
 * the Genoa player brings it forward, Zanetti steps in, wins it, carries it into the space, the pass, Balotelli scores; 2 = slow-motion
 * replay low behind the steal (the ring on the Genoa player, the poke spark, the carry drawn on the grass into the space, the attackers he
 * leaves behind ringed); 3 = a second replay, low in front of him: El Tractor coming at us with the ball, HEAD UP (a sight line), then the
 * pass that starts the attack; 4 = the lesson, a duotone drill (navy + yellow on paper): win it, run forward with it, the attack starts.
 * NEVER top-down. All figures are the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). This world is
 * LEFT-handed (x → the Genoa goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay
 * right feet. Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn
 * objects pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (sunlight, grass with blue), red (Genoa, the corner towers, skin), blue (sky, grass, keeper, shade), navy (key line, Genoa
 * navy, stands in shadow). The lesson chapter is a duotone beat (navy + yellow on paper). */
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
 {label:'Genoa, live',text:'Genoa against Inter, October 2009. Genoa bring it forward, and Javier Zanetti steps in and wins it! He runs with it, Inter break away, and Mario Balotelli scores! Two-nil!',tail:2.2,
  cues:['Genoa against Inter','October 2009','Genoa bring it forward','Javier Zanetti steps in','wins it','He runs with it','Inter break away','Mario Balotelli scores','Two-nil']},
 {label:'Watch again',text:'Watch again, slowly. Zanetti closes him down and pokes the ball away. He does not stop. He pushes it into the space Genoa left behind.',tail:.9,
  cues:['Watch again','slowly','closes him down','pokes the ball away','He does not stop','pushes it into the space','Genoa left behind']},
 {label:'El Tractor',text:'They called him El Tractor, because he never stopped running. Head up, he carries it forward and starts the attack!',tail:1.4,
  cues:['They called him','El Tractor','never stopped running','Head up','carries it forward','starts the attack']},
 {label:'Your turn',text:'Your turn: after you win the ball, run forward with it to start the attack.',tail:2.4,
  cues:['Your turn','win the ball','run forward with it','start the attack']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py zanetti-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/zanetti-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/zanetti-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('zanetti: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`zanetti film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}

const K='navy',R='red',Y='yellow',B='blue';
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre (W/2,H/2) at `zoom` units per world unit, ignoring safe/fit. */
function frame(s:Sheet,zoom=1,rot=0,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,rot);}

// ---------------- 3D: a pinhole camera over a real-size pitch (metres; x → the Genoa goal line at 0, z → far touchline, y up) ----------------
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

// ---------------- Marassi on an October afternoon: four tight roofed stands right up to the pitch, red corner towers, grass, lines, the goal ----------------
/** the stands as quads [lowerA, lowerB, upperB, upperA]: the front row 5 m from the lines, raking up 26 m back to 20 m high */
const STANDS:V3[][]=(()=>{const out:V3[][]=[],F=5,D=26,H0=1.2,H1=20;
 const side=(zs:number)=>{for(let i=0;i<8;i++){const x0=-105-F+i*(105+2*F)/8,x1=x0+(105+2*F)/8,z0=zs*(34+F),z1=zs*(34+F+D);out.push([[x0,H0,z0],[x1,H0,z0],[x1,H1,z1],[x0,H1,z1]]);}};
 const end=(xs:number,x0:number)=>{for(let i=0;i<5;i++){const z0=-34-F+i*(68+2*F)/5,z1=z0+(68+2*F)/5,xa=x0+xs*F,xb=x0+xs*(F+D);out.push([[xa,H0,z0],[xa,H0,z1],[xb,H1,z1],[xb,H1,z0]]);}};
 side(-1);side(1);end(1,0);end(-1,-105);return out;})();
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** the four corner towers (red, square, filling the corners between the stands, up to the roof line) */
const TOWERS:V3[]=[[18,0,52],[18,0,-52],[-123,0,52],[-123,0,-52]];
/** seeded crowd: [stand, u, v, colour 0 paper / 1 red / 2 navy, phase] — Genoa red and navy almost everywhere, a small white-and-navy Inter
 * away block in one end corner (inferred) */
const CROWD=(()=>{const r=rng(2009),out:[number,number,number,number,number][]=[];STANDS.forEach((_,st)=>{for(let i=0;i<64;i++){const c=r(),away=st===20;out.push([st,r(),.04+r()*.92,away?(c<.5?0:2):c<.46?1:c<.84?2:0,r()*TAU]);}});return out;})();
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // an October afternoon: a pale blue sky, warmer toward the horizon
 s.field(B,.3,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(Y,polyPath([[-Bnd,hz-300],[Bnd,hz-340],[Bnd,Bnd],[-Bnd,Bnd]],true),.16);
 // the corner towers behind the stands: red boxes, the shaded faces tinted navy
 {const lit=new Path2D(),dark=new Path2D();for(const[x,,z] of TOWERS){const h=13,Ht=25.5,q=(a:[number,number],b:[number,number]):V3[]=>[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],Ht,b[1]],[a[0],Ht,a[1]]];
   const A1:[number,number]=[x-h,z-h],B1:[number,number]=[x+h,z-h],C1:[number,number]=[x+h,z+h],D1:[number,number]=[x-h,z+h];
   addPoly(lit,clipPoly(c,q(A1,B1)));addPoly(lit,clipPoly(c,q(C1,D1)));addPoly(dark,clipPoly(c,q(B1,C1)));addPoly(dark,clipPoly(c,q(D1,A1)));
   addPoly(lit,clipPoly(c,[[x-h,Ht,z-h],[x+h,Ht,z-h],[x+h,Ht,z+h],[x-h,Ht,z+h]]));}
  const all=new Path2D();all.addPath(lit);all.addPath(dark);s.knockout(all);s.fill(R,all,.55);s.tone(K,dark,.3);s.tone(K,all,.22);}
 // stands: knocked out, printed navy + blue (in the roofs' shadow), terraces as stepped bands, the roof and its fascia, then the crowd
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2],fa=bil(q,0,.12),fb=bil(q,1,.12);
  addPoly(roof,clipPoly(c,[[fa[0],23,fa[2]],[fb[0],23,fb[2]],[ub[0],25,ub[2]],[ua[0],25,ua[2]]]));
  addPoly(roof,clipPoly(c,[[fa[0],21.6,fa[2]],[fb[0],21.6,fb[2]],[fb[0],23.2,fb[2]],[fa[0],23.2,fa[2]]]));
  addPoly(stands,clipPoly(c,[ua,ub,[ub[0],25,ub[2]],[ua[0],25,ua[2]]]));});
 s.knockout(stands);s.fill(K,stands,.42);s.tone(B,stands,.35);s.tone(K,terr,.22);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(st===20?1:.35):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.85);if(seen[1]){s.knockout(heads[1],.9);s.fill(R,heads[1],.9);}if(seen[2])s.fill(K,heads[2],.92);
 s.fill(K,roof,.9);
 // grass in the sun: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-110,0,-39],[5,0,-39],[5,0,39],[-110,0,39]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-105,-34],[-105,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([-105,-20.16],[-88.5,-20.16]);L([-88.5,-20.16],[-88.5,20.16]);L([-88.5,20.16],[-105,20.16]);
 s.knockout(lines,.95);
 // advertising boards at the pitch edge (drawn plain: no brands)
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[3,37]],[[3,37],[3,-37]],[[3,-37],[-108,-37]],[[-108,-37],[-108,37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.knockout(boards);s.fill(R,boards,.55);s.tone(K,boards,.3);
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
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so right feet are right feet on screen.
// Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.8],[R,.22]],SKIN_M:A.InkFill[]=[[Y,.74],[R,.34]],SKIN_D:A.InkFill[]=[[R,.72],[K,.36]];
const LINE={line:K,boots:K,hair:K,shade:[B,.3] as A.InkFill};
/** Inter: an all-white change strip, navy trim and numbers (inferred — see the header) */
const INT=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',shorts:'paper',socks:'paper',trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',number:null,seed:7,...o});
/** Genoa: red-and-navy shirts (the halves drawn as broad stripes), navy shorts and socks, paper numbers (inferred) */
const GEN=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.95],pattern:'stripes',patternInk:[K,.9],shorts:[K,.9],socks:[K,.9],trim:R,numberInk:'paper',skin:SKIN_L,hairStyle:'short',number:null,seed:11,...o});
const ZB:A.Build={height:1.78,bulk:1.03,thighs:1.08};
const ZANETTI:A.AthleteStyle=INT({number:4,skin:SKIN_M,hair:[K,.95],build:ZB,seed:4});
const BB:A.Build={height:1.89,bulk:1.06};
const BALOTELLI:A.AthleteStyle=INT({number:45,skin:SKIN_D,build:BB,seed:45});
const CARRIER:A.AthleteStyle=GEN({skin:SKIN_M,build:{height:1.8},seed:30});
const KEEPER:A.AthleteStyle={...LINE,shirt:[B,.72],shorts:[K,.85],socks:[B,.72],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.88},seed:21};
const REF:A.AthleteStyle={...LINE,shirt:[K,.9],shorts:K,socks:K,skin:SKIN_L,hairStyle:'balding',seed:17};
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail:detail==='auto'&&kk<55?'low':detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;
const BALL_MIN=40;
function groundRing(c:Cam,x:number,z:number,r:number,n=20):Pt[]|null{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.03,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR+.2)return null;pts.push(P(c,p));}return pts;}

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Balotelli's strike) ----------------
// Every chapter samples the same world: ch1 = the live camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction (see the header); exact metres are illustrative.
const SHOT=.55,T_ST=-5.6,T_ZP=-2.35,T_BREC=-1.3;
type MKey=[number,number,number];// τ, x, z
type Mover={style:A.AthleteStyle;path:MKey[]};
function moverPos(p:MKey[],tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
function moverState(path:MKey[],tau:number,ball:V3,idle:()=>A.Pose=A.stand):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(path,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}

// The Genoa player brings it forward (toward Inter's goal, −x) on Inter's right; Zanetti meets him and pokes it away with his right foot.
const G_P:MKey[]=[[-12,-30,-8.5],[-8,-43,-10.6],[T_ST-.3,-57.5,-12.2],[T_ST,-58.2,-12.4],[T_ST+.45,-58.7,-12.6],[T_ST+1.2,-58.4,-13],[T_ST+2.4,-54.5,-12.6],[0,-45,-11],[3,-38,-10]];
/** the ball in front of the carrier's boot as Zanetti arrives */
const BALL_ST:V3=[-58.85,.11,-12.45];
/** where the poke sends it: forward past the carrier's right side, into the space Genoa left behind */
const POKE:V3=[-57.4,.11,-14.3];
const ZLUNGE=.6,ZYAW=.12;
/** Zanetti's place at the steal, solved so the ball sits against his RIGHT boot at the lunge's full reach (library skeleton → this world) */
const Z_AT=(()=>{const sk=A.solve(A.lunge(ZLUNGE,{side:'r'}),ZB,{x:0,z:0,yaw:ZYAW}),m=mix3(sk.rAn,sk.rToe,.75);return[BALL_ST[0]-m[0],BALL_ST[2]+m[2]] as [number,number];})();
const Z_P:MKey[]=[[-12,-74,-18],[-8,-67.5,-16],[T_ST-.5,Z_AT[0]-2.6,Z_AT[1]-.7],[T_ST,Z_AT[0],Z_AT[1]],[T_ST+.4,Z_AT[0]+.9,Z_AT[1]-.6],[T_ST+.95,-56.4,-14.9],[-3.7,-49,-13.1],[T_ZP,-41.6,-10.7],[T_ZP+1,-35,-9.4],[1,-26,-7.6],[3,-20,-6.4]];
/** the pass forward: into Balotelli's run inside the Genoa half (inferred) */
const BRECV:V3=[-24.2,.11,-4.6];
/** the strike spot and where it goes in: low, just inside the post on Balotelli's right (inferred) */
const SPOT:V3=[-18.4,.11,-3.5];
const NETPT:V3=[.25,.38,-2.95];
const SYAW=Math.atan2(NETPT[2]-SPOT[2],NETPT[0]-SPOT[0]);
const B_AT=(()=>{const sk=A.solve(A.strike(A.STRIKE_CONTACT,{foot:'r',power:.9}),BB,{x:0,z:0,yaw:SYAW}),m=mix3(sk.rAn,sk.rToe,.6);return[SPOT[0]-m[0],SPOT[2]+m[2]] as [number,number];})();
const B_P:MKey[]=[[-12,-37,3.5],[-6,-33,1.2],[-3,-28.5,-2.2],[T_BREC,BRECV[0]-.8,BRECV[2]+.35],[-.5,B_AT[0]-1.6,B_AT[1]+.3],[0,B_AT[0],B_AT[1]],[.7,B_AT[0]+.9,B_AT[1]-.4]];
const KEEP_X=-2.6;
const OTHERS:Mover[]=[
 {style:GEN({skin:SKIN_M,seed:40}),path:[[-12,-25,-4],[-3,-24.5,-4],[-1,-22.5,-4.6],[0,-20.3,-5.4],[2,-15,-4.8]]},// Genoa centre-back, stepping to Balotelli late
 {style:GEN({seed:41}),path:[[-12,-23,5],[-3,-22,3.6],[0,-19.6,1.2],[2,-15,.2]]},// Genoa centre-back
 {style:GEN({seed:42}),path:[[-12,-42,-25],[-4,-35,-21],[0,-27,-16.5],[2,-22,-14]]},// Genoa full-back, near side
 {style:GEN({seed:43}),path:[[-12,-40,24],[0,-27,17],[2,-22,15]]},// Genoa full-back, far side
 {style:GEN({skin:SKIN_M,seed:44}),path:[[-12,-50,-2],[T_ST,-61,-5],[-3,-56,-5.5],[0,-47,-4.6],[2,-41,-4]]},// Genoa midfielder, caught upfield
 {style:GEN({seed:45}),path:[[-12,-48,7],[T_ST,-57,5],[-2,-51,4],[2,-43,3]]},// Genoa midfielder, caught upfield
 {style:INT({seed:50}),path:[[-12,-44,9],[-4,-36,8.5],[0,-24,5.5],[2,-19,4.5]]},// Inter forward, far side
 {style:INT({seed:51}),path:[[-12,-70,3],[-2,-60,1.5],[2,-52,1]]},// Inter midfielder
 {style:INT({skin:SKIN_D,seed:52}),path:[[-12,-78,-26],[-3,-62,-24],[1,-47,-22]]},// Inter right-back, near side
 {style:INT({seed:53}),path:[[-12,-62,20],[0,-47,16],[2,-42,14]]},// Inter midfielder, far side
 {style:REF,path:[[-12,-47,1],[0,-36,-4],[3,-31,-4]]},// referee
];

/** the ball while Zanetti carries it: pushed ahead, he catches up, another touch (every ~2.6 m) */
function carryBall(tau:number):V3{const q=moverPos(Z_P,tau),v=Math.hypot(q.vx,q.vz)||1,f=((q.dist/2.6)%1+1)%1,off=.55+.95*(f<.22?easeOut(f/.22):1-(f-.22)/.78);return[q.x+q.vx/v*off,.11,q.z+q.vz/v*off];}
const ZFOOT:V3=carryBall(T_ZP-.001);
function ballT(tau:number):V3{
 if(tau<T_ST){const q=moverPos(G_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*6)*.12,a:V3=[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];return mix3(a,BALL_ST,sm(T_ST-.35,T_ST,tau));}
 if(tau<T_ST+.95){const u=sm(T_ST,T_ST+.4,tau,easeOut),p=mix3(BALL_ST,POKE,u);return mix3(p,carryBall(tau),sm(T_ST+.4,T_ST+.95,tau));}
 if(tau<T_ZP)return carryBall(tau);
 if(tau<T_BREC){const u=(tau-T_ZP)/(T_BREC-T_ZP);return mix3(ZFOOT,BRECV,1-Math.pow(1-u,1.4));}
 if(tau<0){const u=(tau-T_BREC)/-T_BREC;return mix3(BRECV,SPOT,u*(1.3-.3*u));}
 if(tau<SHOT){const u=tau/SHOT,p=mix3(SPOT,NETPT,u);p[1]=lerp(.11,NETPT[1],u)+.3*Math.sin(Math.PI*u);return p;}
 const s=tau-SHOT,u=clamp(s/.12);if(u<1)return mix3(NETPT,[1.6,.35,-2.7],u);
 const d=clamp((s-.12)/.5),e=s-.62,bounce=d>=1?.1*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.6-.3*d,Math.max(.11,.35*(1-d)+.11*d)+bounce,-2.7+.3*d];}
/** the keeper: shuffles across as the pass goes in, sets, a late dive to his left (−z), beaten low */
const DIVE_DUR=1.05,DIVE_T0=-.08;
function keeperState(tau:number){const z=lerp(1.2,-.4,sm(T_ZP,-.3,tau,easeInOutSine)),x=lerp(-1,KEEP_X,sm(T_ZP,-.4,tau));
 const pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.15});
 return{x,z,yaw:Math.PI,pose};}
/** the Genoa carrier: dribbling forward, then robbed — he checks, turns and chases */
function carrierState(tau:number,ball:V3){const st=moverState(G_P,tau,ball);
 if(tau<T_ST-.2)st.pose=A.blendPose(st.pose,A.dribble(((tau*1.7)%1+1)%1,{foot:'r',speed:.6}),.55);
 const jolt=sm(T_ST-.05,T_ST+.2,tau)*(1-sm(T_ST+.6,T_ST+1.2,tau));
 st.pose=A.blendPose(st.pose,A.lunge(.45,{side:'l'}),jolt*.6);
 return st;}
/** Zanetti: presses in, the right-foot poke at full reach (τ = T_ST), the carry at pace with HEAD UP, the right-foot pass forward (T_ZP) */
const ZPYAW=Math.atan2(BRECV[2]-ZFOOT[2],BRECV[0]-ZFOOT[0]);
function zanState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(Z_P,tau),v=Math.hypot(q.vx,q.vz),run=A.runCycle(((q.dist/2.4)%1+1)%1,{speed:clamp(v/7.5)});
 let pose=A.blendPose(A.stand(),run,clamp((v-.3)/1.2));
 // the carry: a quicker, shorter stride over the ball, but the head stays UP (he looks for the pass)
 const cw=sm(T_ST+.5,T_ST+1,tau)*(1-sm(T_ZP-.5,T_ZP-.3,tau));
 if(cw>0){const d=A.dribble(((q.dist/2.6)%1+1)%1,{foot:'r',speed:.9});pose=A.blendPose(pose,{...d,neckP:-.18,lean:d.lean*.7},cw*.45);}
 // the steal: the lunge, full reach at T_ST
 const lw=sm(T_ST-.55,T_ST-.3,tau)*(1-sm(T_ST+.2,T_ST+.55,tau));
 pose=A.blendPose(pose,A.lunge(clamp(ZLUNGE+(tau-T_ST)/.75),{side:'r'}),lw);
 // the pass forward with his right foot
 const pw=sm(T_ZP-.5,T_ZP-.28,tau)*(1-sm(T_ZP+.4,T_ZP+.85,tau));
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_ZP)/1.1),{foot:'r',power:.6}),pw);
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):ZYAW;
 let yaw=angLerp(runYaw,ZYAW,sm(T_ST-.6,T_ST-.3,tau)*(1-sm(T_ST+.25,T_ST+.6,tau)));
 yaw=angLerp(yaw,ZPYAW,pw);
 return{x:q.x,z:q.z,yaw,pose};}
/** Balotelli: runs onto the pass, a right-foot touch, the right-foot strike (τ = 0), then away */
function baloState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(B_P,tau),v=Math.hypot(q.vx,q.vz);
 let pose=A.blendPose(A.stand(),A.runCycle(((q.dist/2.4)%1+1)%1,{speed:clamp(v/7.5)}),clamp((v-.3)/1.2));
 const tw=sm(T_BREC-.25,T_BREC-.05,tau)*(1-sm(T_BREC+.1,T_BREC+.35,tau));
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_BREC)/1.1),{foot:'r',power:.15}),tw*.8);
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+tau/1.1),{foot:'r',power:.9}),easeInOutSine(sm(-.7,-.45,tau)));
 const cel=sm(1.3,2.1,tau),ct=clamp(tau-1.3,0,4);
 if(tau>1.3)pose=A.blendPose(pose,A.celebrate(tau-1.3,{kind:'run'}),easeInOutSine(cel));
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):SYAW;let yaw=angLerp(runYaw,SYAW,sm(-.75,-.45,tau));
 // before the pass arrives he watches it come
 if(tau<T_BREC-.3)yaw=angLerp(yaw,Math.atan2(ZFOOT[2]-q.z,ZFOOT[0]-q.x),.35*(1-sm(T_BREC-.8,T_BREC-.3,tau)));
 return{x:q.x-cel*1.2*ct,z:q.z-cel*4.6*ct,yaw:tau>1.3?angLerp(yaw,-1.75,cel):yaw,pose};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...carrierState(t,b),style:CARRIER});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...zanState(t),style:ZANETTI,smear:(t>T_ST-.25&&t<T_ST+.2)||(t>T_ZP-.12&&t<T_ZP+.15)},{...baloState(t),style:BALOTELLI,smear:t>-.2&&t<.3},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.25&&t<DIVE_T0+.75});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.5,p[2]+2.8)+Math.abs(p[0]-1.6)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.1,p[2]];};
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
/** a track on the grass through ground points (x,z), drawn on by g, an arrowhead once complete */
function groundTrack(s:Sheet,c:Cam,pts3:V3[],g:number,minW=8,maxW=30){if(g<=.02)return;const pts:Pt[]=[];for(const p of pts3){if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,[p[0],.03,p[2]]));}
 const w=clamp(.2*kAt(c,pts3[pts3.length>>1]),minW,maxW);dashed(s,pts,g,w);
 if(g>.95){const e=pts[pts.length-1],f=pts[pts.length-3],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),L=w*2.6;s.fill(Y,polyPath([[e[0]+Math.cos(ang)*L*.6,e[1]+Math.sin(ang)*L*.6],[e[0]+Math.cos(ang+2.4)*L,e[1]+Math.sin(ang+2.4)*L],[e[0]+Math.cos(ang-2.4)*L,e[1]+Math.sin(ang-2.4)*L]],true),.95);}}
/** the carry route (Zanetti's path from the steal to the pass), sampled on the ground */
const CARRY:V3[]=Array.from({length:17},(_,i)=>{const q=moverPos(Z_P,lerp(T_ST+.2,T_ZP,i/16));return[q.x,0,q.z] as V3;});
const PASS:V3[]=Array.from({length:17},(_,i)=>mix3(ZFOOT,BRECV,i/16));

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with the carrier, the steal, the carry, the pass, the goal ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Mario Balotelli scores')+.35-SHOT,end-SHOT-1.5);return{TL,end};};
const BCAM:V3=[-40,23,-62];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_ZP)return[lerp(b[0],-45,.15),1.2,lerp(b[2],6,.3)];
 const w=sm(T_BREC-.4,.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-20,.2),1.2+b[1]*.3,lerp(b[2],-2,.3)];return mix3(mid,[-7,1.2,-2],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,2100],[T_ST-1,2400],[T_ST,2700],[T_ZP,2500],[T_BREC,2800],[0,3700],[.8,4000],[1.8,3500],[4,3300]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(0,.5,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:3,
};

// ---------------- chapter 2 (TV replay, slow motion, low behind the steal): closes him down, pokes it away, does not stop, into the space ----------------
const ch2T=()=>({slow:T(1,'slowly'),close:T(1,'closes him down'),poke:T(1,'pokes the ball away'),stop:T(1,'He does not stop'),push:T(1,'pushes it into the space'),left:T(1,'Genoa left behind'),end:SEC(1)});
/** replay clock: from before Zanetti closes in, slowed ×~2.5 through the steal; the poke lands on "pokes the ball away" */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_ST-2.1],[q.close,T_ST-.75],[q.poke+.2,T_ST],[q.stop,T_ST+.45],[q.push,T_ST+1.1],[q.left,T_ST+1.9],[q.end,T_ST+2.9]]) as unknown as Key[],x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),zq=moverPos(Z_P,tau);
 const lk=mix3(b,[zq.x,1,zq.z],.35);lk[1]=1.1;lk[0]+=key(t,mono<[number,number]>([[0,0],[q.stop,0],[q.push,3],[q.end,4]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,1700],[q.close,2100],[q.poke,2500],[q.stop,2300],[q.push,1900],[q.end,1800]]) as unknown as Key[]);
 // low behind Zanetti on Inter's side of the ball, a little in from the near touchline, dollying up with the carry
 const pos=key(t,mono<number[]>([[0,-74,2.6,-25],[q.poke,-71,2.5,-25],[q.push,-66,2.6,-25.5],[q.end,-60,2.8,-26]]) as unknown as Key[],easeIO,true);
 return makeCam([pos[0],pos[1],pos[2]],lk,F);}
const ch2:Scene={
 draw(s,t){
  const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.1});
  const out=1-sm(q.end-.9,q.end-.4,tt);
  // "into the space": the carry route drawn on the grass
  groundTrack(s,c,CARRY,sm(q.push-.1,q.left+.2,tt,easeOut)*out);
  // "Genoa left behind": rings round the Genoa players now on the wrong side of the ball
  const lb=sm(q.left,q.left+.35,tt,easeOutBack)*out;
  if(lb>.02)for(const m of [G_P,OTHERS[4].path,OTHERS[5].path]){const p=moverPos(m,tau),r=groundRing(c,p.x,p.z,1.1*lb);if(r)s.stroke(Y,polyPath(r,true),clamp(.09*kAt(c,[p.x,0,p.z]),6,16),.95);}
  // "closes him down": a ring on the carrier as Zanetti arrives
  const cr=sm(q.close,q.close+.35,tt,easeOutBack)*(1-sm(q.poke+.2,q.poke+.6,tt));
  if(cr>.02){const p=moverPos(G_P,tau),r=groundRing(c,p.x,p.z,1.2*cr);if(r)s.stroke(Y,polyPath(r,true),clamp(.09*kAt(c,[p.x,0,p.z]),6,16),.95);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN*.8)]);
  // "pokes the ball away": a yellow spark off his right boot
  if(tau>T_ST-.05&&tau<T_ST+.3){const p=P(c,BALL_ST);sparkBurst(s,Y,p[0],p[1],60+200*clamp((tau-T_ST+.05)/.3),{n:9,seed:84,g:1-clamp((tau-T_ST)/.3),width:10});}
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4.4,
};

// ---------------- chapter 3 (second replay, low in front): El Tractor coming at us, head up, the carry, the pass that starts the attack ----------------
const ch3T=()=>({they:T(2,'They called him'),tractor:T(2,'El Tractor'),never:T(2,'never stopped running'),head:T(2,'Head up'),carry:T(2,'carries it forward'),start:T(2,'starts the attack'),end:SEC(2)});
/** replay clock: from just after the steal, ×~2 slow through the carry, the pass on "starts the attack" */
const tau3=(t:number)=>{const q=ch3T();return key(t,mono<[number,number]>([[0,T_ST+.55],[q.never,T_ST+1.5],[q.head,T_ST+2.2],[q.carry,T_ZP-.7],[q.start+.2,T_ZP],[q.end,T_ZP+1.1]]) as unknown as Key[],x=>x);};
const CAM3:V3=[-31,1.5,-19];
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),z=moverPos(Z_P,tau),b=ballT(tau);
 const lz:V3=[z.x,1.15,z.z],w=sm(q.start+.1,q.end-.2,t,easeInOutSine),lp:V3=[b[0],.8,b[2]];
 const F=key(t,mono<[number,number]>([[0,5000],[q.tractor,5600],[q.head,5200],[q.carry,4400],[q.start,3400],[q.end,2600]]) as unknown as Key[]);
 return makeCam(CAM3,mix3(lz,lp,w),F);}
/** "Head up": a dashed sight line from his eyes to the space ahead (where the pass will go) */
function sightLine(s:Sheet,c:Cam,tau:number,g:number){if(g<=.02)return;const zs=zanState(tau),sk=A.solve(zs.pose,ZB,{x:zs.x,z:-zs.z,yaw:zs.yaw}),h=sk.head,eye:V3=[h[0],h[1]+.05,-h[2]],dv=nrm([BRECV[0]-eye[0],0,BRECV[2]-eye[2]]),tgt:V3=[eye[0]+dv[0]*7,1.2,eye[2]+dv[2]*7];
 const pts:Pt[]=[];for(let i=0;i<=12;i++){const p=mix3(eye,tgt,.06+.94*i/12);if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}dashed(s,pts,g,clamp(.2*kAt(c,eye),10,24));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.2+.3*sm(q.start,q.start+.5,tt)});
  // "starts the attack": the pass track forward, drawn on as the ball goes
  groundTrack(s,c,PASS,sm(q.start,q.start+.9,tt,easeOut),10,40);
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  sightLine(s,c,tau3(tt),sm(q.head,q.head+.5,tt,easeOut)*(1-sm(q.start-.2,q.start+.2,tt)));
  // "never stopped running": speed lines trailing him
  if(t>q.never&&t<q.carry+.4){const z=moverPos(Z_P,tau),p=P(c,[z.x,1,z.z]),a=P(c,[z.x-3,1,z.z-.6]);speedLines(s,K,p[0],p[1],Math.atan2(p[1]-a[1],p[0]-a[0]),{n:5,seed:21,len:260,width:9,cov:.55*sm(q.never,q.never+.3,t)*(1-sm(q.carry,q.carry+.4,t))});}
  if(tau>T_ZP-.02&&tau<T_ZP+.2){const p=P(c,ZFOOT);sparkBurst(s,Y,p[0],p[1],60+200*clamp((tau-T_ZP+.02)/.22),{n:9,seed:61,g:1-clamp((tau-T_ZP)/.2),width:10});}
 },
 aperture(t){const c=ch3Cam(t),z=moverPos(Z_P,tau3(t)),p:V3=[z.x,1.6,z.z],[x,y]=P(c,p),r=clamp(.5*kAt(c,p),40,260);return apertureDisc(x,y,r,12);},
 still:4,
};

// ---------------- chapter 4 (duotone drill): win the ball, run forward with it, the attack starts ----------------
const G4:Pt=[-300,480],H4=600;// his ground point and drawn height, seen from his right side a little in front: facing screen right
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:16,elevation:5});
const DUO_SKIN:A.InkFill[]=[[K,.5],[Y,.4]];
const ZDUO:A.AthleteStyle={...ZANETTI,shirt:'paper',shorts:'paper',socks:'paper',trim:K,skin:DUO_SKIN,hair:K,shade:[K,.2],detail:'high'};
const ODUO=(seed:number):A.AthleteStyle=>({line:K,boots:K,hair:K,shirt:[K,.55],shorts:[K,.8],socks:[K,.55],trim:'paper',skin:[[Y,.6],[K,.2]],shade:[K,.2],hairStyle:'short',seed});
const MDUO:A.AthleteStyle={...INT({seed:60}),shirt:'paper',shorts:'paper',socks:'paper',trim:K,skin:[[Y,.6],[K,.2]],shade:[K,.2]};
const ch4T=()=>{const win=T(3,'win the ball');return{yt:T(3,'Your turn'),win,WON:win+.35,run:T(3,'run forward with it'),att:T(3,'start the attack'),end:SEC(3)};};
/** distance run (in sheet units the ground scrolls) after the win: accelerate to a steady carry */
function runDist(t:number){const q=ch4T(),t0=q.WON+.3;if(t<=t0)return 0;const u=t-t0;return 380*(u<.6?u*u/1.2:u-.3);}
/** his pose: ready, the lunge (full reach at WON), then the carry — a dribble at pace, head up */
function lessonPose(t:number):A.Pose{const q=ch4T();
 const lu=key(t,mono<[number,number]>([[0,0],[q.WON-.45,.05],[q.WON,.6],[q.WON+.45,1]]) as unknown as Key[],x=>x);
 let p=A.blendPose(A.stand(),A.lunge(lu,{side:'r'}),sm(q.WON-.6,q.WON-.3,t));
 const ph=((runDist(t)/360)%1+1)%1,d=A.dribble(ph,{foot:'r',speed:.8}),r=A.runCycle(ph,{speed:.6});
 p=A.blendPose(p,A.blendPose(r,{...d,neckP:-.15},.55),sm(q.WON+.2,q.WON+.6,t));
 return p;}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
/** sheet point of his right boot for a pose (the ball sits just ahead of it) */
const bootAt=(pose:A.Pose,ahead=0):Pt=>{const sk=A.solve(pose,ZB),m=mix3(sk.rAn,sk.rToe,.7),p=CAM4.project([m[0]+.12+ahead,.11,m[2]]);return[p[0],p[1]];};
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),R4=38,dist=runDist(tt);
  const v=key(t,mono<number[]>([[0,-40,-10,.94],[q.win,-70,-10,1],[q.WON+.3,-40,-10,1],[q.run,-20,-20,.95],[q.att,-10,-20,.92],[q.end,0,-20,.93]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the drill stage: navy field, a yellow sunlit pool, the grass line in paper and cones that stream past as he runs
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(60,G4[1]-40,r*1.7,r*.32,40);
  s.knockout(pool(560),.6);s.tone(Y,pool(560),.2);s.tone(Y,pool(380),.3);s.tone(Y,pool(220),.42);
  s.knockout(ribbon([[-1000,G4[1]+18],[1000,G4[1]+10]],12,{taper:.1,wobble:1.2}),.9);
  {const cones=new Path2D();for(let i=-3;i<6;i++){const x=((i*260-dist)%2340+2340)%2340-1100,y=G4[1]+14;cones.addPath(polyPath([[x-18,y],[x+18,y],[x,y-40]],true));}s.fill(Y,cones,.85);}
  // the opponent who lost it: stumbles, turns, is left behind (scrolls away)
  {const o=[120-dist*.9,G4[1]-30] as Pt,oc=A.figureCam({x:o[0],y:o[1],height:520,azimuth:16,elevation:5}),turn=sm(q.WON,q.WON+.8,tt,easeInOutSine),ph=(tt*1.2)%1;
   if(o[0]>-1400){const pose=A.blendPose(A.runCycle(ph,{speed:.3}),A.lunge(.4,{side:'l'}),.5*(1-turn)),prev=A.blendPose(A.runCycle(((tt-1/12)*1.2)%1,{speed:.3}),A.lunge(.4,{side:'l'}),.5*(1-turn));
    drawPlayer(s,pose,prev,oc,{...ODUO(70),detail:'mid'},{yaw:lerp(Math.PI,.4,turn)});}}
  // "start the attack": two team-mates sprint up alongside, ahead of him, with arrows forward
  const ta=sm(q.att-.3,q.att+.6,tt,easeOut);
  if(ta>.02)for(const [i,m] of [{x:420,y:G4[1]-150,h:300},{x:180,y:G4[1]-230,h:220}].entries()){const mx=m.x+260*(1-ta),mc=A.figureCam({x:mx,y:m.y,height:m.h,azimuth:16,elevation:5}),ph=(tt*1.6+i*.37)%1;
   drawPlayer(s,A.runCycle(ph,{speed:.9}),A.runCycle(((tt-1/12)*1.6+i*.37)%1,{speed:.9}),mc,{...MDUO,detail:'mid'},{});
   const ax=mx+m.h*.35,ay=m.y-m.h*.45,L=150*ta;s.fill(Y,ribbon([[ax,ay],[ax+L,ay]],12,{taper:.1,pressure:0,wobble:.8}),.95);s.fill(Y,polyPath([[ax+L+26,ay],[ax+L-10,ay-22],[ax+L-10,ay+22]],true),.95);}
  // the figure
  const p1=lessonPose(tt),p0=lessonPose(tt-1/12);
  const fig=drawPlayer(s,p1,p0,CAM4,ZDUO,{},(tt>q.WON-.3&&tt<q.WON+.2));
  // the ball: their pass/dribble comes from the right to his boot (win), then rides just ahead of his right boot as he carries it
  const stop=bootAt(A.lunge(.6,{side:'r'}));let bxy:Pt,spin=0;
  if(tt<q.WON){const from:Pt=[520,G4[1]-10],u=sm(q.win-1.4,q.WON,tt,x=>x);bxy=[lerp(from[0],stop[0],u),lerp(from[1],stop[1],u)-R4*.9];spin=-tt*10;}
  else{const ph=((dist/360)%1+1)%1,push=ph<.2?easeOut(ph/.2):1-(ph-.2)/.8,ahead=.45+.5*push,sk=A.solve(p1,ZB),pp=CAM4.project([sk.pelvis[0]+ahead,.11,sk.pelvis[2]+.12]),cur:Pt=[pp[0],pp[1]],k=sm(q.WON,q.WON+.35,tt);bxy=[lerp(stop[0],cur[0],k),lerp(stop[1],cur[1],k)-R4*.9];spin=dist*.05;}
  // "win the ball": a yellow ring and a spark where his boot stops it
  const wr=sm(q.WON-.1,q.WON+.2,tt,easeOutBack)*(1-sm(q.run,q.run+.4,tt));
  if(wr>.02){const f=fig.joints.rToe;s.stroke(Y,ring(f[0],Math.max(f[1],stop[1])+10,90*wr,26*wr),11,.95);}
  if(tt>=q.WON-.05&&tt<q.WON+.3)sparkBurst(s,Y,stop[0],stop[1]-R4*.9,110+110*sm(q.WON-.05,q.WON+.1,tt,easeOut),{n:9,seed:31,g:1-sm(q.WON+.1,q.WON+.3,tt),width:14});
  // "run forward with it": a dashed yellow track drawn on ahead of him, an arrowhead
  const tr=sm(q.run,q.run+.6,tt,easeOut)*(1-sm(q.end-.9,q.end-.3,tt));
  if(tr>.02){const y=G4[1]-R4*.9,x0=bxy[0]+70,x1=x0+560,pts:Pt[]=[];for(let i=0;i<=14;i++)pts.push([lerp(x0,x1,i/14),y]);dashed(s,pts,tr,14);
   if(tr>.95)s.fill(Y,polyPath([[x1+34,y],[x1-10,y-30],[x1-10,y+30]],true),.95);}
  ballAt(s,bxy[0],bxy[1],R4,spin,{duo:true});
  if(tt>q.WON+.6)speedLines(s,Y,fig.joints.pelvis[0]-120,fig.joints.pelvis[1],Math.PI,{n:4,seed:42,len:180,width:9,cov:.6});
  const tick=sm(q.att+.9,q.att+1.2,tt,easeOutBack);
  if(tick>.02){const cx=380,cy=130,k=tick;s.fill(Y,ribbon([[cx-40*k,cy],[cx-10*k,cy+30*k],[cx+50*k,cy-40*k]],20,{taper:.1,pressure:0,wobble:.8}),.95);}
 },
 still:5.2,
};

const story:RisoStory={
 id:'zanetti-signature',format:'11v11',title:'Zanetti: win it, carry it forward',
 theme:'After you win the ball, run forward with it to start the attack.',
 ageNote:'Serie A, Genoa 0–5 Inter, Stadio Luigi Ferraris (Marassi), Genoa, 17 October 2009: the counter Zanetti started for Inter\'s second goal (Balotelli, 31st minute).',
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
