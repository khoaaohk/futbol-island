/** Iconic play film — Kylian Mbappé's volley, FIFA World Cup final, Argentina 3–3 France (Argentina won 4–2 on penalties), Lusail
 * Stadium, Qatar, 18 December 2022: France's second goal, 2–2, 97 seconds after his penalty. A RisoStory (chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written accounts (we
 * cannot watch the footage); only the rendering is riso.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - FIFA Training Centre, "Post Match Summary Report — Argentina 3–3 France, Final, Match 64" (official event data)
 *    https://www.fifatrainingcentre.com/media/native/world-cup-2022/report_128083.pdf
 *  - Wikipedia, "2022 FIFA World Cup final" (match summary, line-ups, the match kit templates)  https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_final
 *  - The Guardian, Barney Ronay/Guardian sport match report "Argentina win World Cup…" (18 Dec 2022)
 *    https://www.theguardian.com/football/2022/dec/18/world-cup-final-argentina-france-match-report
 *  - The Guardian, Jacob Steinberg, "Kylian Mbappé leads French frenzy after Didier Deschamps rolls the dice" (18 Dec 2022)
 *  - BBC Sport, "Argentina 3–3 France (4–2 on pens)" https://www.bbc.com/sport/football/63932622
 * CONFIRMED by those accounts: 18 December 2022, Lusail Stadium, 18:00 kick-off (so the 81st minute is under floodlights, after dark);
 * Argentina led 2–0 (Messi pen 23', Di María 36'), Mbappé scored a penalty (FIFA: 79'/80') to make it 2–1 and 97 seconds later scored
 * again for 2–2 (Wikipedia: "in the 81st minute"); the move began when substitute Kingsley Coman robbed/"barged" Lionel Messi off the ball;
 * Mbappé "finessed a give-and-go" with substitute Marcus Thuram; Thuram's return was a "lofted pass" / "chipped through-ball"; Mbappé hit it
 * FIRST TIME, a "side-on volley", with his RIGHT FOOT (FIFA event data: 80', Mbappé, On Target – Goal, Right Foot, from a Pass; Wikipedia:
 * "first-time volleying a lofted pass from Marcus Thuram with his right foot as he was falling to the ground"), into the bottom-right
 * corner (Wikipedia); Emiliano Martínez got a hand to it but could not keep it out; Mbappé wore 10 and had moved into the centre, Thuram
 * played on the left. KITS (Wikipedia's match kit template): Argentina in the sky-blue and white striped home shirt with WHITE shorts and
 * white socks; France all NAVY (shirt, shorts and socks).
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, run and timing between those beats; where Coman won
 * the ball (drawn near halfway) and that Adrien Rabiot then played it forward to Mbappé (lofted, his left foot); that Mbappé's half of the
 * one-two was a header into Thuram's path; Thuram's kicking foot; that Mbappé struck from the left side of the box, level with the penalty
 * spot, across goal to the far post (bottom right from him); which way France attacked on screen; Martínez's dive (to his left) and which
 * hand touched it; the goalkeeper's shirt (drawn red; unverified), the referee's kit (drawn yellow), the other players shown and their
 * positions, the crowd colours, the Lusail bowl's shape (a closed ring of stands under a roof with the lights on its rim), the camera
 * placements and the celebration.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with the ball from Coman's tackle to the net; 2 = slow-motion replay from a low touchline camera on a long lens: Thuram lifts the
 * ball back, Mbappé keeps his eyes on it and his body over it as it drops; 3 = the reverse replay from behind the goal: the right-foot
 * volley as he falls, the ball past Martínez's hand into the net, then up to the roaring crowd and the roof lights; 4 = the lesson, a
 * duotone replay of the strike (eyes on the ball, head and chest over it, locked ankle, through the middle). NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (floodlights, highlights, grass with blue), red (keeper, flags, skin), blue (Argentina stripes, night sky, grass, shade),
 * navy (France, key line). The lesson chapter is a duotone beat (navy + yellow on paper). */
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
 {label:'The one-two, live',text:'Qatar, 2022. The World Cup final. France are losing, two goals to one. Kingsley Coman wins the ball, and Kylian Mbappé plays a quick one-two with Marcus Thuram... Goal!',tail:2.6,
  cues:['Qatar','The World Cup final','France are losing','Kingsley Coman','wins the ball','Kylian Mbappé','one-two','Marcus Thuram','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Thuram lifts the ball over the defenders. Mbappé keeps his eyes on it, and his body over it, as it drops.',tail:1.3,
  cues:['Watch it again','slowly','Thuram lifts','over the defenders','Mbappé keeps','his eyes','his body over it','as it drops']},
 {label:'Two-all!',text:"Right foot, first time, even as he falls! It flies past Emiliano Martínez's hand. Two-all!",tail:2.4,
  cues:['Right foot','first time','as he falls','It flies past','Emiliano Martínez','hand','Two-all']},
 {label:'Your turn',text:'Your turn: keep your head and body over the dropping ball, lock your ankle, and strike through the middle.',tail:1.9,
  cues:['Your turn','keep your head','body over','dropping ball','lock your ankle','strike','through the middle']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py mbappe-volley-2022 writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/mbappe-volley-2022/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mbappe-volley-2022/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mbappe: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`mbappe film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ---------------- Lusail at night: a closed bowl of crowd under a roof ring of lights, grass, lines, boards, the goal and its net ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-146,74],[41,74],[41,-74],[-146,-74]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA] */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],30,OUT[j][1]],[OUT[i][0],30,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 sky blue / 2 red, phase] — Argentina's sky blue and white fill most of the bowl */
const CROWD=(()=>{const r=rng(2022),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===2?90:230;for(let i=0;i<n;i++){const c=r();out.push([st,r(),.04+r()*.92,c<.42?0:c<.84?1:2,r()*TAU]);}}return out;})();
/** the lights along the roof ring's inner rim */
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-100;x<=0;x+=10)out.push([x,34,66]);for(let z=-56;z<=56;z+=14)out.push([34,34,z]);for(let x=-100;x<=0;x+=10)out.push([x,34,-66]);for(let z=-56;z<=56;z+=14)out.push([-139,34,z]);return out;})();
type Stadium={cheer?:number;flash?:number;t:number;glare?:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t,glare=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night sky over the open roof: navy over blue, a deeper band at the top
 s.field(B,.55,.6);s.field(K,.35,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-900],[-Bnd,hz-760]],true),.3);
 // stands: knocked out, printed navy, terraces as stepped bands, the roof ring, then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],35,ub[2]],[ua[0],35,ua[2]]]));
  const fa=mix3(q[3],q[0],.18),fb=mix3(q[2],q[1],.18);addPoly(roof,clipPoly(c,[[ua[0],35,ua[2]],[ub[0],35,ub[2]],[fb[0],34.2,fb[2]],[fa[0],34.2,fa[2]]]));});
 s.knockout(stands);s.tone(K,stands,.55);s.tone(Y,stands,.12);s.tone(K,terr,.3);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(B,heads[1],.8);if(seen[2])s.fill(R,heads[2],.85);
 // phone lights and camera flashes in the crowd (paper sparks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.95);
 // roof lights: dotted-paper halo + yellow, then the lamp panels
 {const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((4.8+glare*4)*k,14,420);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.3*k,6,160),h=clamp(.8*k,4,100);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.7);}
 // grass: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-111,0,-40],[6,0,-40],[6,0,40],[-111,0,40]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.86);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // LED advertising boards at the pitch edge
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);s.tone(B,boards,.3);
 if(!o.noGoal)goal(s,c,o.net);
}
/** the goal at x=0: halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
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
/** the net ripple: a travelling ring pushed out from where the ball hits (bottom right from Mbappé: low, at the −z post) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.45,p[2]+2.8)+Math.abs(p[0]-1.6)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline, a player's LEFT when he faces the goal); the library
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Mbappé's right leg is his right leg on
// screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.88],[R,.2]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]],SKIN_D:A.InkFill[]=[[R,.78],[K,.2]];
const LINE={line:K,boots:K,hair:K,shade:[B,.32] as A.InkFill};
const FRA=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[K,.86],shorts:[K,.86],socks:[K,.86],numberInk:'paper',skin:SKIN_M,hairStyle:'short',seed:7,...o});
const ARG=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',pattern:'stripes',patternInk:[B,.62],shorts:'paper',socks:'paper',numberInk:K,skin:SKIN_L,hairStyle:'short',seed:11,...o});
const MBAPPE:A.AthleteStyle=FRA({number:10,skin:SKIN_D,hairStyle:'bald',hair:null,build:{height:1.78,bulk:.98,thighs:1.08},seed:10});
const THURAM:A.AthleteStyle=FRA({number:26,skin:SKIN_D,hair:[K,.9],build:{height:1.92,bulk:1.02},seed:26});
const COMAN:A.AthleteStyle=FRA({number:20,skin:SKIN_D,build:{height:1.78},seed:20});
const RABIOT:A.AthleteStyle=FRA({number:14,skin:SKIN_L,hairStyle:'long',build:{height:1.88},seed:14});
const MESSI:A.AthleteStyle=ARG({number:10,build:{height:1.7},seed:30});
const KEEPER:A.AthleteStyle={...LINE,shirt:[R,.9],shorts:[R,.9],socks:[R,.9],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.95},seed:23};
const REF:A.AthleteStyle={...LINE,shirt:[Y,.95],shorts:K,socks:K,skin:SKIN_L,hairStyle:'bald',hair:null,seed:17};
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
/** the ball (Al Hilm, the final's ball: drawn as a classic panel ball): paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is the volley) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const G=9.81,SHOT=.42,VOLLEY_DUR=1.05;
type MKey=[number,number,number];// τ, x, z
type Mover={style:A.AthleteStyle;path:MKey[];idle?:()=>A.Pose};
function moverPos(p:MKey[],tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
/** true gait: phase from distance covered (≈ 2.3 m a stride cycle), speed from the path; idle players turn to watch the ball */
function moverState(path:MKey[],tau:number,ball:V3,idle:()=>A.Pose=A.stand):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(path,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}

// the key moments (τ): Coman's tackle, Rabiot's lofted pass, Mbappé's header to Thuram, Thuram's first-time lofted return, the volley
const T_TACKLE=-5.7,T_RAB=-4.55,T_HEAD=-2.6,T_THU=-1.75;
const MESSI_P:MKey[]=[[-12,-47.5,-8.5],[-8,-51.2,-6.4],[T_TACKLE,-53.6,-5],[-5.2,-54.1,-4.8],[-4,-54.3,-4.4],[1,-50.5,-2]];
const COMAN_P:MKey[]=[[-12,-44,-13.5],[-8,-49.4,-9.6],[T_TACKLE,-53.2,-5.9],[-5.1,-53,-5],[-3.2,-49.5,-3],[1,-41,0]];
const RABIOT_P:MKey[]=[[-12,-44,7],[-7,-47,4.2],[-4.9,-49.1,2.9],[T_RAB,-49.2,2.8],[-3,-47.5,3.6],[1,-40,5]];
const MB_P:MKey[]=[[-12,-37.5,21],[-6,-31.5,18.2],[T_HEAD,-27.8,15.6],[-1.5,-20.4,11.6],[0,-12.9,7.6]];
const THU_P:MKey[]=[[-12,-33,27],[-5,-26.5,24.2],[T_THU,-21.4,20.4],[-1.2,-21,20.1],[1,-18.5,17.5]];
const KEEP_X=-1.35;
const OTHERS:Mover[]=[
 {style:ARG({number:26,seed:40}),path:[[-12,-30,16],[T_HEAD,-25,15],[0,-16.2,11.6],[2,-14.4,10.8]]},// Molina, chasing Mbappé back
 {style:ARG({number:19,seed:41,build:{height:1.83}}),path:[[-12,-34,5],[T_HEAD,-22,6.4],[0,-11.6,4.4],[2,-10.5,4]]},// Otamendi
 {style:ARG({number:13,seed:42,build:{height:1.85}}),path:[[-12,-35,-5],[T_HEAD,-21,-2.6],[0,-11.2,-1.6],[2,-10.6,-1.2]]},// Romero
 {style:ARG({number:3,seed:43}),path:[[-12,-31,-17],[T_HEAD,-21,-12],[0,-13,-8.6],[2,-12,-7.6]]},// Tagliafico
 {style:ARG({number:24,seed:44}),path:[[-12,-50,2],[T_HEAD,-37,6],[0,-25,8],[2,-21,8]]},// Enzo Fernández
 {style:ARG({number:7,seed:45}),path:[[-12,-52,-10],[T_HEAD,-43,-5],[0,-33,-2],[2,-30,-1]]},// De Paul
 {style:ARG({number:20,seed:46}),path:[[-12,-45,12],[T_HEAD,-36,16],[0,-28,17],[2,-26,17]]},// Mac Allister
 {style:ARG({number:9,seed:47}),path:[[-12,-58,-2],[0,-52,-1],[2,-50,0]]},// Álvarez
 {style:FRA({number:12,seed:50,build:{height:1.87}}),path:[[-12,-41,-3],[T_HEAD,-28,-1.5],[0,-15,-2.8],[2,-12.5,-2.6]]},// Kolo Muani, into the box
 {style:FRA({number:8,seed:51,build:{height:1.87}}),path:[[-12,-57,6],[0,-44,7],[2,-41,7]]},// Tchouaméni
 {style:FRA({number:25,seed:52,skin:SKIN_D}),path:[[-12,-55,20],[0,-40,24],[2,-37,24]]},// Camavinga
 {style:REF,path:[[-12,-60,-14],[T_HEAD,-47,-10],[0,-36,-9],[3,-31,-9]]},// referee (Szymon Marciniak)
];
// ---- Mbappé: the header (τ = T_HEAD), the run, the right-foot volley (τ = 0) as he falls, then up to celebrate ----
const MB_BUILD:A.Build={height:1.78};
const MG:[number,number]=[MB_P[MB_P.length-1][1],MB_P[MB_P.length-1][2]];
const CORNER:V3=[.15,.36,-2.95];// bottom right from Mbappé = the far post from the left of the box
/** heading at the strike: the volley's contact key turns the body 24° right of the place yaw, so the hips face the far corner */
const MYAW=Math.atan2(CORNER[2]-MG[1],CORNER[0]-MG[0])+24*Math.PI/180;
/** fallen: on his back and left hip, the right leg still up from the follow-through, arms out to land */
const FALL=A.posed({pitch:-58,roll:-18,lean:-6,air:0,lHipF:34,lKnee:66,lAnk:20,rHipF:74,rHipA:18,rKnee:26,rAnk:30,lShA:78,lShF:-26,lElb:36,rShA:86,rShF:12,rElb:30,neckP:34,neckY:-10,twist:-8});
/** the volley at τ: library right-foot volley (contact .5) with the standing leg giving way into the fall after contact */
function mbVolley(tau:number):A.Pose{const v=A.volley(clamp(.5+tau/VOLLEY_DUR),{foot:'r',height:.42});
 return A.blendPose(v,FALL,easeInOutSine(sm(.06,.62,tau))*.92);}
const HEAD_YAW=Math.atan2(20.4-15.6,-21.4+27.8);// facing Thuram for the header
const headerPose=(tau:number)=>A.header(clamp(.52+(tau-T_HEAD)/.95));
function mbState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(MB_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 let pose=A.blendPose(run,headerPose(tau),easeInOutSine(sm(T_HEAD-.5,T_HEAD-.2,tau))*(1-easeInOutSine(sm(T_HEAD+.18,T_HEAD+.55,tau))));
 pose=A.blendPose(pose,mbVolley(tau),easeInOutSine(sm(-.95,-.34,tau)));
 if(tau<-.12&&tau>T_HEAD+.3){// eyes on the dropping ball: the head turns back over the left shoulder and tips with the ball's height
  const b=ballT(tau),el=Math.atan2(b[1]-1.7,Math.hypot(b[0]-q.x,b[2]-q.z)+1),w=sm(T_HEAD+.3,T_HEAD+.8,tau)*(1-sm(-.4,-.12,tau));
  pose={...pose,neckP:pose.neckP-clamp(el,0,.9)*.7*w,neckY:pose.neckY+.55*w*(1-sm(-.9,-.4,tau))};}
 if(tau>1.3)pose=A.blendPose(pose,A.celebrate(tau-1.3,{kind:'run'}),easeInOutSine(sm(1.3,2.3,tau)));
 // the header nods the ball out left toward Thuram; then the run turns side-on into the strike
 const runYaw=Math.atan2(q.vz,q.vx),yaw=tau<T_HEAD+.4?angLerp(runYaw,HEAD_YAW,sm(T_HEAD-.5,T_HEAD-.2,tau)*(1-sm(T_HEAD+.1,T_HEAD+.4,tau))):angLerp(runYaw,MYAW,sm(-1,-.3,tau));
 const cel=sm(1.3,2.3,tau);return{x:q.x+cel*3.5*(tau-1.3)/2,z:q.z-cel*2*(tau-1.3)/2,yaw:tau>1.3?angLerp(yaw,-.9,cel):yaw,pose};}
/** where the header meets the ball: his forehead at the header's contact key */
const HEAD1:V3=(()=>{const q=moverPos(MB_P,T_HEAD),yaw=HEAD_YAW,sk=A.solve(A.blendPose(A.runCycle(0,{speed:.7}),headerPose(T_HEAD),1),MB_BUILD,{x:q.x,z:-q.z,yaw}),f=sk.face;return[f[0],f[1]+.1,-f[2]];})();
/** the ball on his RIGHT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sk=A.solve(mbVolley(0),MB_BUILD,{x:MG[0],z:-MG[1],yaw:MYAW}),m=mix3(sk.rAn,sk.rToe,.6);return[m[0],m[1]+.09,-m[2]];})();
const RAB_FOOT:V3=[-49.0,.11,2.95],THU_FOOT:V3=[-21.1,.11,20.55];
/** a ballistic flight a → b over `dur` seconds (real gravity) */
function flight(a:V3,b:V3,dur:number,s:number):V3{const u=clamp(s/dur),vy=(b[1]-a[1]+.5*G*dur*dur)/dur,t=u*dur;return[lerp(a[0],b[0],u),a[1]+vy*t-.5*G*t*t,lerp(a[2],b[2],u)];}
/** the keeper: set on his toes, then a dive to his LEFT (−z, the far post from Mbappé); his left hand meets the ball's line */
const DIVE_DUR=1.05,DIVE_T0=.36-.55*DIVE_DUR;
const T_TOUCH=.36;
const shotAt=(s:number):V3=>{const u=clamp(s/SHOT),p=mix3(CONTACT,CORNER,u);p[1]+=.25*Math.sin(u*Math.PI);return p;};
const KEEP_Z=(()=>{const sk=A.solve(A.keeperDive(.55,{side:'l',height:.15}),{height:1.95},{x:KEEP_X,z:0,yaw:Math.PI}),hz=Math.min(-sk.lHa[2],-sk.rHa[2]),b=shotAt(T_TOUCH);return clamp(b[2]-hz+.18,-1,2);})();
/** the ball on τ: Messi's feet → Coman's tackle → Rabiot → the lofted pass → Mbappé's header → Thuram → the lofted return → the volley → the net */
function ballT(tau:number):V3{
 if(tau<T_TACKLE){const q=moverPos(MESSI_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*9)*.12;return[q.x+q.vx/v*(.55+ph),.11,q.z+q.vz/v*(.55+ph)];}
 if(tau<T_RAB){const a=ballT(T_TACKLE-.001),u=easeOut(clamp((tau-T_TACKLE)/(T_RAB-T_TACKLE-.2)));return[lerp(a[0],RAB_FOOT[0],u),.11,lerp(a[2],RAB_FOOT[2],u)];}
 if(tau<T_HEAD)return flight(RAB_FOOT,HEAD1,T_HEAD-T_RAB,tau-T_RAB);
 if(tau<T_THU)return flight(HEAD1,THU_FOOT,T_THU-T_HEAD,tau-T_HEAD);
 if(tau<0)return flight(THU_FOOT,CONTACT,-T_THU,tau-T_THU);
 if(tau<SHOT)return shotAt(tau);
 const s=tau-SHOT,u=clamp(s/.12);if(u<1)return mix3(CORNER,[1.55,.45,-2.8],u);
 const d=clamp((s-.12)/.5),e=s-.62,bounce=d>=1?.12*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.55-.35*d,Math.max(.11,.45*(1-d*d)+.11*d*d)+bounce,-2.8+.3*d];}
function keeperState(tau:number){const pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.15});return{x:KEEP_X,z:KEEP_Z,yaw:Math.PI,pose};}
/** Messi: on the ball, then Coman barges him off it; he stumbles and turns to chase */
function messiState(tau:number,ball:V3){const st=moverState(MESSI_P,tau,ball);if(tau<T_TACKLE)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.1)%1+1)%1,{foot:'l',speed:.5}),.7);
 const hit=sm(T_TACKLE-.1,T_TACKLE+.2,tau)*(1-sm(T_TACKLE+.6,T_TACKLE+1.2,tau));return{...st,pose:{...st.pose,roll:st.pose.roll-.35*hit,lean:st.pose.lean+.2*hit}};}
/** Coman: runs in, shoulder to shoulder, pokes it away with his right foot */
function comanState(tau:number,ball:V3){const st=moverState(COMAN_P,tau,ball),w=sm(T_TACKLE-.5,T_TACKLE-.25,tau)*(1-sm(T_TACKLE+.3,T_TACKLE+.7,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6+(tau-T_TACKLE)/.9),{side:'r'}),w)};}
/** Rabiot: collects and lofts it forward with his LEFT foot */
function rabiotState(tau:number,ball:V3){const st=moverState(RABIOT_P,tau,ball),w=sm(T_RAB-.55,T_RAB-.3,tau)*(1-sm(T_RAB+.4,T_RAB+.8,tau));
 return{...st,yaw:angLerp(st.yaw,Math.atan2(HEAD1[2]-2.8,HEAD1[0]+49.2),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_RAB)/1.1),{foot:'l',power:.75}),w)};}
/** Thuram: meets the header and lifts it back first time over the defenders */
function thuramState(tau:number,ball:V3){const st=moverState(THU_P,tau,ball),w=sm(T_THU-.55,T_THU-.3,tau)*(1-sm(T_THU+.45,T_THU+.9,tau));
 return{...st,yaw:angLerp(st.yaw,Math.atan2(CONTACT[2]-20.4,CONTACT[0]+21.4),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_THU)/1.1),{power:.5}),w)};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...messiState(t,b),style:MESSI},{...comanState(t,b),style:COMAN},{...rabiotState(t,b),style:RABIOT},{...thuramState(t,b),style:THURAM});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...mbState(t),style:MBAPPE,smear:t>-.25&&t<.35},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.25&&t<DIVE_T0+.75});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with the move; the volley; the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Goal')-SHOT-.1,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-40,21,-47];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_HEAD){const m=moverPos(MB_P,tau);return[lerp(b[0],m.x,.25),1.2+b[1]*.4,lerp(b[2],m.z,.25)];}
 const w=sm(-.1,.6,tau,easeInOutSine),mid:V3=[lerp(b[0],MG[0],.45),b[1]*.5+.9,lerp(b[2],MG[1],.45)];return mix3(mid,[-4,1.2,.5],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,6800],[T_TACKLE-.5,7200],[T_RAB,6000],[T_HEAD,5800],[-1,6200],[-.2,7400],[.6,6800],[1.6,5600],[4,5600]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.3+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,w.ball[1]>1.5?30:18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9.6,
};

// ---------------- chapter 2 (TV replay, slow motion, a low touchline camera on a long lens): the lofted ball drops, he stays over it ----------------
const ch2T=()=>({lift:T(1,'Thuram lifts'),over:T(1,'over the defenders'),keeps:T(1,'Mbappé keeps'),eyes:T(1,'his eyes'),body:T(1,'his body over it'),drops:T(1,'as it drops'),end:SEC(1)});
/** replay clock: header → Thuram's lift on "Thuram lifts" → the ball hangs over the defenders → it drops into the strike zone at the end */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_HEAD-.35],[q.lift,T_THU-.05],[q.over,T_THU+.45],[q.drops,-.35],[q.end,-.1]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-15,2.4,-30];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),m=moverPos(MB_P,tau),head:V3=[m.x,1.5,m.z];
 const w=key(t,mono<[number,number]>([[0,.55],[q.lift,.45],[q.over,.5],[q.keeps,.7],[q.drops,.8],[q.end,.82]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,5600],[q.lift,5000],[q.over,5400],[q.keeps,7200],[q.body,8200],[q.end,8800]]) as unknown as Key[]);
 return makeCam(CAM2,mix3(b,head,w),F);}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:.15});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:7.4,
};

// ---------------- chapter 3 (reverse replay from behind the goal): the right-foot volley as he falls, past Martínez's hand, the net, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'first time')+.1)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{rf:T(2,'Right foot'),HIT,falls:T(2,'as he falls'),fl:T(2,'It flies past'),em:T(2,'Emiliano Martínez'),hand:T(2,'hand'),two:T(2,'Two-all'),end:SEC(2)};};
/** replay clock: the last drop into the strike, ×~8 slow through the strike and the fall, the ball past the hand on "hand", then real time */
const tau3=(t:number)=>{const q=ch3T(),th=Math.max(q.hand,q.HIT+1.2),tn=Math.max(q.two,th+.3);
 return key(t,mono<[number,number]>([[0,-.3],[q.HIT,0],[th,T_TOUCH],[tn,SHOT+.1],[tn+1,SHOT+1.1],[tn+10,SHOT+10]]) as unknown as Key[],x=>x);};
function ch3Cam(t:number){const q=ch3T(),th=Math.max(q.hand,q.HIT+1.2);
 return camKeysOf(t,mono<CK>([[0,4,1.3,-9.5,MG[0],1.1,MG[1],5000],[q.HIT,4,1.3,-9.5,MG[0]+.5,.9,MG[1]-.3,5400],[q.falls+.3,4,1.3,-9.5,MG[0]+1,.7,MG[1]-.6,4800],[q.fl,4,1.3,-9.5,-6,.8,2,2700],[th,4,1.3,-9.5,-1.8,.6,-1.6,2300],[q.two-.1,4,1.3,-9.5,-1.4,.7,-1.2,2300],[q.two+.8,3.5,3,-10,-14,6,4,1500],[q.end-.9,3.5,3,-10,-24,14,10,1300],[q.end,3.5,3,-10,-40,30,18,1300]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?8*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.two,q.two+.5,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,glare:roar*.5,noGoal:true});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  goal(s,c,net);// camera behind the goal: the net hangs in front of the play
  // the fingertip touch: a small yellow spark where the ball clips Martínez's hand
  if(tau>T_TOUCH-.02&&tau<T_TOUCH+.12){const p=P(c,shotAt(T_TOUCH));sparkBurst(s,Y,p[0],p[1],60+300*clamp((tau-T_TOUCH+.02)/.14),{n:8,seed:81,g:1-clamp((tau-T_TOUCH)/.12),width:10});}
 },
 aperture(t){const c=ch3Cam(t),l:V3=[-40,34,-66],[x,y]=P(c,l),r=clamp(4.8*kAt(c,l),30,300);return apertureDisc(x,y,r*.6,12);},
 still:4.6,
};

// ---------------- chapter 4 (duotone replay): eyes on the ball, head and body over it, a locked ankle, through the middle ----------------
const G4:Pt=[-40,470],H4=740,AZ4=28;// his ground point and drawn height; seen from his RIGHT-front: the right leg and the lean over the ball on our side
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:AZ4,elevation:5});
const MDUO:A.AthleteStyle={...MBAPPE,shirt:[K,.8],shorts:[K,.8],socks:[K,.8],skin:[[Y,.62],[K,.26]],shade:[K,.2],detail:'high'};
const ch4T=()=>{const th=T(3,'through the middle');return{yt:T(3,'Your turn'),head:T(3,'keep your head'),body:T(3,'body over'),drop:T(3,'dropping ball'),ank:T(3,'lock your ankle'),st:T(3,'strike'),th,CT:th+.25,end:SEC(3)};};
/** the lesson pose: the ready stance over the dropping ball → the RIGHT-foot volley through the middle (contact at CT; no fall here) */
function lessonPose(t:number):A.Pose{const q=ch4T(),v0=A.volley(.22,{foot:'r',height:.42});
 let p=A.blendPose(A.stand(),v0,sm(q.head-.2,q.body+.2,t));
 p={...p,neckP:p.neckP+.35*sm(q.head,q.head+.5,t),lean:p.lean+.12*sm(q.body,q.body+.5,t)*(1-sm(q.CT,q.CT+.4,t))};
 const start=q.CT-VOLLEY_DUR*.3;if(t>=start-.3)p=A.blendPose(p,A.volley(clamp(.5+(t-q.CT)/VOLLEY_DUR),{foot:'r',height:.42}),sm(start-.3,start,t));
 return p;}
/** where the ball sits on his RIGHT boot at contact, and its flight direction, on the sheet */
const LESSON_HIT=(()=>{const sk=A.solve(A.volley(.5,{foot:'r',height:.42}),MB_BUILD),m=mix3(sk.rAn,sk.rToe,.6),c:A.V3=[m[0],m[1]+.09,m[2]],a=CAM4.project(c),b=CAM4.project([c[0]+2,c[1]+.1,c[2]-.8]),L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return{p:[a[0],a[1]] as Pt,d:[(b[0]-a[0])/L,(b[1]-a[1])/L] as Pt};})();
/** a dashed yellow line (lesson only), drawn on by g */
function dashed(s:Sheet,a:Pt,b:Pt,g:number,w:number){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);s.fill(Y,ribbon([a,[lerp(a[0],b[0],g),lerp(a[1],b[1],g)]],w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,cpt=LESSON_HIT.p,dir=LESSON_HIT.d,ang=Math.atan2(dir[1],dir[0]);
  const v=key(t,mono<number[]>([[0,40,-40,.94],[q.head,20,-120,1.02],[q.body,10,-40,.98],[q.ank,cpt[0]*.5,cpt[1]*.4,1.08],[CT,cpt[0]*.5,cpt[1]*.4,1.1],[q.end,cpt[0]*.5+dir[0]*60,cpt[1]*.4,1.14]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the replay stage: navy field, a yellow floodlight pool in three screens, a light cone, the box edge in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(G4[0],G4[1],r*1.5,r*.3,40);
  s.knockout(pool(560),.6);s.tone(Y,pool(560),.2);s.tone(Y,pool(380),.32);s.tone(Y,pool(220),.45);
  s.tone(Y,polyPath([[-150,-1600],[150,-1600],[860,G4[1]],[-860,G4[1]]],true),.1);
  s.knockout(ribbon([[520,G4[1]+180],[260,G4[1]-40],[150,G4[1]-150]],12,{taper:.6,wobble:1.2}),.9);
  const pose=lessonPose(tt),prev=lessonPose(tt-1/12);
  const r=drawPlayer(s,pose,prev,CAM4,MDUO,{},tt>CT-.3&&tt<CT+.4);
  // the ball: hangs high, drops along a dotted arc (the "dropping ball"), meets the RIGHT boot on "through the middle", then flies off
  const start:Pt=[cpt[0]-dir[0]*160-120,-620],u=sm(q.drop-.3,CT,tt,x=>x*x*(1.2-.2*x));
  const at=(k:number):Pt=>[lerp(start[0],cpt[0],k),lerp(start[1],cpt[1],k)-260*Math.sin(Math.min(1,k*1.1)*Math.PI*.5)*(1-k)];
  let bxy=tt<q.drop-.3?at(0):at(u),sq=0;
  if(tt>=CT){const f=sm(CT,CT+.45,tt,easeIn);bxy=[cpt[0]+dir[0]*1400*f,cpt[1]+dir[1]*1400*f];sq=.5*(1-sm(CT,CT+.1,tt));}
  if(tt>=q.drop-.3&&tt<CT+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const p=at(i/18*Math.min(1,u+.02));dots.moveTo(p[0]+11,p[1]);dots.arc(p[0],p[1],11,0,TAU);}s.fill(Y,dots,.95);}
  // keep your head: the sight line from the eyes to the ball
  const watch=sm(q.head,q.head+.35,tt,easeOut)*(1-sm(CT+.2,CT+.5,tt));
  if(watch>.02)dashed(s,r.joints.face,bxy,watch,22);
  // body over it: a plumb line from the head down through the knee to the ball's landing spot, with an arrow tip
  const over=sm(q.body,q.body+.4,tt,easeOutBack)*(1-sm(q.st-.1,q.st+.3,tt));
  if(over>.02){const h=r.joints.head,f:Pt=[h[0],cpt[1]+30];dashed(s,[h[0],h[1]-40],f,over,18);
   s.fill(Y,polyPath([[f[0],f[1]+34*over],[f[0]-26*over,f[1]-10],[f[0]+26*over,f[1]-10]],true),.95);}
  // lock your ankle: a yellow ring round the striking ankle, a tight tick
  const ank=sm(q.ank,q.ank+.3,tt,easeOutBack)*(1-sm(CT+.3,CT+.7,tt));
  if(ank>.02){const a=r.joints.rAn;s.stroke(Y,ring(a[0],a[1],56*ank,40*ank),12,.95);}
  // through the middle: a target on the ball's centre and an arrow through it
  const target=sm(q.st-.1,q.st+.25,tt,easeOutBack)*(1-sm(CT+.05,CT+.2,tt)),br=62;
  ballAt(s,bxy[0],bxy[1],br,tt*(tt>=CT?12:1.5),{sq,dir:ang,duo:true});
  if(target>.02){s.stroke(Y,ring(bxy[0],bxy[1],br*1.4*target,br*1.4*target),11,.95);
   const d0=ring(bxy[0],bxy[1],18*target,18*target,12);s.knockout(d0);s.fill(Y,d0);}
  const thru=sm(q.th-.3,CT,tt,easeOut)*(1-sm(CT+.9,CT+1.3,tt));
  if(thru>.02){const a:Pt=[cpt[0]-dir[0]*360,cpt[1]-dir[1]*360],b:Pt=[cpt[0]+dir[0]*480,cpt[1]+dir[1]*480],e:Pt=[lerp(a[0],b[0],thru),lerp(a[1],b[1],thru)];s.fill(Y,ribbon([a,e],26,{taper:.3,pressure:.3,wobble:1}),.95);
   const ca=dir[0],sa=dir[1];s.fill(Y,polyPath([[e[0]+ca*60,e[1]+sa*60],[e[0]-sa*48,e[1]+ca*48],[e[0]+sa*48,e[1]-ca*48]],true),.95);}
  if(tt>=CT&&tt<CT+.35)sparkBurst(s,Y,cpt[0],cpt[1],140+140*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.15,CT+.35,tt),width:16});
  if(tt>=CT&&tt<CT+.6)speedLines(s,K,bxy[0],bxy[1],ang,{n:5,seed:42,len:240,width:10,cov:.85});
 },
 still:5.2,
};

const story:RisoStory={
 id:'mbappe-volley-2022',format:'11v11',title:"Mbappé's final volley",
 theme:'Keep your head and body over the dropping ball, lock your ankle, strike through the middle.',
 ageNote:'World Cup final, Argentina 3–3 France (Argentina won on penalties), Lusail Stadium, Qatar, 18 December 2022.',
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
