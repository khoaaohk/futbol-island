/** Iconic play film: Erling Haaland's signature, the first-time finish. Manchester City 2–1 Borussia Dortmund, UEFA Champions League
 * group stage (Group G, matchday 2), Etihad Stadium (City of Manchester Stadium), Manchester, 14 September 2022: the 84th-minute winner,
 * a flying, first-time volley with the outside of his LEFT boot from João Cancelo's cross. A RisoStory (chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written accounts and two press
 * photographs (we did not watch the footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Haaland a signature, not a single match ("Signature: the first-time finish"; lesson "Make your
 * run early, then hit it first time before the keeper is set"). This goal is the best-documented example of it: a cross he met first time,
 * without a touch, in the six-yard box, which UEFA's Technical Observer panel later named the 2022/23 Champions League Goal of the Season.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - The Guardian, Andy Hunter, "Erling Haaland magic denies Dortmund as Manchester City make late comeback", 14 Sep 2022
 *    https://www.theguardian.com/football/2022/sep/14/manchester-city-borussia-dortmund-champions-league-match-report
 *    ("Four minutes later João Cancelo looked up from the left and floated a gorgeous cross into the six-yard box with the outside of his
 *    right foot. Three Borussia defenders and one former Dortmund forward were waiting ... Haaland lifted off behind defensive substitute
 *    Nico Schlotterbeck, feet first, and with the outside of his left foot steered an acrobatic volley beyond Alexander Meyer.")
 *  - BBC Sport, Phil McNulty, "Manchester City 2–1 Borussia Dortmund", 14 Sep 2022  https://www.bbc.com/sport/football/62894559
 *    ("Haaland took off into the air to meet Cancelo's cross with his outstretched left foot to divert the ball past a disbelieving Meyer";
 *    Stones' equaliser "with 10 minutes left"; Haaland's winner "four minutes later")
 *  - UEFA.com, "2022/23 UEFA Champions League Goal of the Season: Erling Haaland tops Technical Observer selection", 1 Jul 2023
 *    ("As Cancelo's outside-of-the-boot cross dropped towards the far post, Haaland lifted his giant frame off the ground between two
 *    defenders and, with his left leg raised high, somehow hooked the ball into the net with the outside of his boot"; "inside the
 *    five-metre box"; Guardiola compared it to Johan Cruyff's 1973 'phantom goal')
 *  - Wikipedia, "2022–23 UEFA Champions League group stage" (raw): 14 Sep 2022, Manchester City 2–1 Borussia Dortmund, Bellingham 56',
 *    Stones 80', Haaland 84', City of Manchester Stadium, attendance 50,441, referee Daniele Orsato. Wikipedia, "Erling Haaland" (raw).
 *  - Photographs: Getty Images via BBC Sport (Haaland in possession, Bellingham beside him) and Marc Atkins/Getty via the Guardian (the
 *    moment of the volley, caption "Erling Haaland scores with an unorthodox finish against his former teammates").
 * CONFIRMED by those accounts: date, ground, competition, score and minute (1–1 after Stones' 80th-minute equaliser, so City and Dortmund
 * are level with six minutes left); Dortmund were Haaland's former club; Cancelo crossed from the LEFT with the OUTSIDE of his RIGHT foot, a
 * floated cross that dropped towards the far post into the six-yard box; Haaland jumped between two defenders, behind Schlotterbeck, left leg
 * raised high, and hit it first time with the OUTSIDE of his LEFT boot past goalkeeper Alexander Meyer. KITS (the two photographs): City in
 * sky-blue shirts with a dark collar trim, WHITE shorts and sky-blue socks; Dortmund in YELLOW shirts with black shoulder panels, BLACK
 * shorts and yellow socks with black hoops; Haaland wore 9, his long fair hair tied back; in the volley photo his left boot is above his
 * head, his body leans back, one arm is flung up with a clenched fist and the other reaches out, his right foot is near the grass;
 * Dortmund's defenders around him look up at the ball. Night: 21:00 CEST (20:00 in Manchester) kick-off, so the 84th minute is under lights.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, run and timing between those beats (Haaland drifting
 * from the penalty spot to the far post behind Schlotterbeck is our reading of "lifted off behind" him); who passed to Cancelo (drawn as
 * De Bruyne) and where Cancelo crossed from (the left channel, about 22 m out); the cross's bend (drawn bowing toward the goal line, then
 * dropping in); which way City attacked on screen (left to right from the main stand); Haaland's exact heading (facing the goal line,
 * turned a little toward the cross, like Cruyff's phantom goal) and where the ball went in (drawn mid-height, inside the far post); that
 * Meyer was still shuffling across when it was hit and dived late; Meyer's kit (drawn red, unverified) and the referee's (drawn navy);
 * the other players' spots and numbers; that Haaland landed on his back; the celebration; the crowd colours and the away end; the Etihad
 * drawn as a closed bowl under a roof ring of lights.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with De Bruyne's pass, Cancelo's cross and the volley into the net; 2 = slow-motion replay from a low near-touchline camera on a
 * long lens: Haaland slips in behind Schlotterbeck with his eyes on the dropping ball; 3 = the reverse angle from the far touchline on a
 * long lens (his left side, so the raised left leg is on our side, as in the photograph): the flying volley, the ball past Meyer, the net,
 * then across to the roaring main stand; 4 = the lesson, a
 * duotone replay (make the run early, meet it first time, before the keeper is set). NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so left feet stay left feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (Dortmund, floodlights, grass with blue), red (keeper, skin), blue (City sky blue at half screen, night sky, grass, shade),
 * navy (Dortmund shorts, key line). The lesson chapter is a duotone beat (navy + yellow on paper). */
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
 {label:'Level, live',text:"Manchester, 2022. City are drawing with Erling Haaland's old club, Borussia Dortmund. Six minutes left. João Cancelo looks up on the left and floats a cross... Haaland! Goal!",tail:2.6,
  cues:['Manchester','City are drawing',"Erling Haaland's old club",'Borussia Dortmund','Six minutes left','João Cancelo','looks up','floats a cross','Haaland','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Haaland slips in behind Nico Schlotterbeck, eyes on the ball as it drops towards the far post.',tail:1.2,
  cues:['Watch it again','slowly','Haaland slips in','Nico Schlotterbeck','eyes on the ball','as it drops','the far post']},
 {label:'First time!',text:'He leaps, left leg high in the air, and hooks it first time with the outside of his boot, past Alexander Meyer! Two-one!',tail:2.4,
  cues:['He leaps','left leg high','hooks it','first time','outside of his boot','Alexander Meyer','Two-one']},
 {label:'Your turn',text:'Your turn: make your run early, then hit it first time, before the keeper is set.',tail:2.2,
  cues:['Your turn','make your run early','hit it first time','before the keeper','is set']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py haaland-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/haaland-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/haaland-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('haaland: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`haaland film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ---------------- the Etihad at night: a closed bowl of crowd under a roof ring of lights, grass, lines, boards, the goal and its net ----------------
const IN=[[-111,40],[6,40],[6,-40],[-111,-40]] as const, OUT=[[-146,74],[41,74],[41,-74],[-146,-74]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA]: 0 far side, 1 behind the goal City attack, 2 the main stand (behind the camera), 3 the far end */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],30,OUT[j][1]],[OUT[i][0],30,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 sky blue / 2 Dortmund yellow, phase] — sky blue fills the bowl; the away fans are a yellow block in one corner */
const CROWD=(()=>{const r=rng(2209),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=230;for(let i=0;i<n;i++){const c=r(),u=r(),away=st===0&&u>.8;out.push([st,u,.04+r()*.92,away?(c<.8?2:0):c<.4?0:1,r()*TAU]);}}return out;})();
/** the lights along the roof ring's inner rim */
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-100;x<=0;x+=10)out.push([x,34,66]);for(let z=-56;z<=56;z+=14)out.push([34,34,z]);for(let x=-100;x<=0;x+=10)out.push([x,34,-66]);for(let z=-56;z<=56;z+=14)out.push([-139,34,z]);return out;})();
type Stadium={cheer?:number;flash?:number;t:number;glare?:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t,glare=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // Manchester night sky: navy over blue, a deeper band at the top
 s.field(B,.5,.6);s.field(K,.4,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-900],[-Bnd,hz-760]],true),.3);
 // stands: knocked out, printed navy, terraces as stepped bands, the roof ring, then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],35,ub[2]],[ua[0],35,ua[2]]]));
  const fa=mix3(q[3],q[0],.18),fb=mix3(q[2],q[1],.18);addPoly(roof,clipPoly(c,[[ua[0],35,ua[2]],[ub[0],35,ub[2]],[fb[0],34.2,fb[2]],[fa[0],34.2,fa[2]]]));});
 s.knockout(stands);s.tone(K,stands,.55);s.tone(B,stands,.18);s.tone(K,terr,.3);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(col===2?.25:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(B,heads[1],.62);if(seen[2]){s.knockout(heads[2],.9);s.fill(Y,heads[2],.9);}
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
 // LED advertising boards at the pitch edge (the Champions League's dark boards)
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);s.tone(B,boards,.35);
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
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Haaland's left leg is his left leg on
// screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.88],[R,.2]],SKIN_M:A.InkFill[]=[[Y,.8],[R,.32]],SKIN_D:A.InkFill[]=[[R,.78],[K,.2]];
const LINE={line:K,boots:K,hair:K,shade:[B,.32] as A.InkFill};
/** City: sky-blue shirts (blue at half screen) with a dark trim, white shorts, sky-blue socks (the photographs) */
const SKY:A.InkFill=[B,.5];
const CITY=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:SKY,shorts:'paper',socks:SKY,trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Dortmund: yellow shirts with black (navy) shoulder trim, black shorts, yellow socks (the photographs) */
const BVB=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],trim:K,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:11,...o});
const HB:A.Build={height:1.94,bulk:1.08,thighs:1.08};
const HAALAND:A.AthleteStyle=CITY({number:9,hair:[Y,.7],hairStyle:'ponytail',build:HB,seed:9});
const CANCELO:A.AthleteStyle=CITY({number:7,skin:SKIN_M,build:{height:1.82},seed:27});
const DEBRUYNE:A.AthleteStyle=CITY({number:17,hair:[Y,.5],build:{height:1.81},seed:17});
const SCHLOTT:A.AthleteStyle=BVB({number:4,build:{height:1.91,bulk:1.04},seed:4});
const KEEPER:A.AthleteStyle={...LINE,shirt:[R,.9],shorts:[R,.9],socks:[R,.9],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.9},seed:23};
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
/** the ball (the Champions League match ball: drawn as a classic panel ball): paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is the volley) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const G=9.81,SHOT=.24,FLY_DUR=1.3,T_CROSS=-1.6,T_PASS=-5.2,T_RECV=-3.9;
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

// De Bruyne → Cancelo (left channel) → the cross; Haaland drifts from the spot to the far post behind Schlotterbeck (all inferred paths)
const KDB_P:MKey[]=[[-12,-34,4],[-8,-29,5],[T_PASS,-26.4,6.2],[-3,-24,6.6],[0,-18,6],[2,-15,5]];
const CAN_P:MKey[]=[[-12,-42,28],[-7,-36,27],[T_RECV,-31.5,24.8],[-2.4,-26.6,23],[T_CROSS,-24.6,22.4],[0,-23,21.6],[2,-21,21]];
const HG:[number,number]=[-3.5,-2.55];// where Haaland takes off and meets it: inside the six-yard box, just inside the far post
const HAAL_P:MKey[]=[[-12,-15,3],[-6,-11.5,2.2],[-3,-9,.8],[-1.7,-7,-.5],[-.95,-5.1,-1.7],[-.36,HG[0]-.35,HG[1]+.12],[0,HG[0],HG[1]]];
const SCH_P:MKey[]=[[-12,-12,1.2],[-4,-8.6,.6],[-1.6,-6.4,-.2],[0,-5.3,-1.0],[1.5,-4.9,-1.1]];
const KEEP_X=-1.1;
const OTHERS:Mover[]=[
 {style:BVB({number:13,skin:SKIN_M,seed:40}),path:[[-12,-12,-7],[-3,-6,-5.2],[0,-2.5,-4.1],[2,-2.2,-3.9]]},// Guerreiro, goal side of Haaland
 {style:BVB({number:15,build:{height:1.91},seed:41}),path:[[-12,-12,-1],[-3,-8.6,-.6],[0,-6.8,.1],[2,-6.3,.2]]},// Hummels
 {style:BVB({number:25,build:{height:1.95,bulk:1.1},seed:42}),path:[[-12,-12,5],[-3,-8,3.6],[0,-5.8,2.4],[2,-5.3,2.2]]},// Süle
 {style:BVB({number:23,seed:43}),path:[[-12,-19,-3],[0,-12,-1.5],[2,-10,-1]]},// Can
 {style:BVB({number:22,skin:SKIN_D,build:{height:1.86},seed:44}),path:[[-12,-24,8],[T_PASS,-22,7],[0,-15,5],[2,-13,4.5]]},// Bellingham
 {style:BVB({number:6,seed:45}),path:[[-12,-25,-7],[0,-16,-6],[2,-14,-5.5]]},// Özcan
 {style:BVB({number:17,seed:46}),path:[[-12,-36,22],[-3,-28,20.5],[T_CROSS,-26,20.4],[0,-25.2,19.8],[2,-24,19]]},// the right-back closing Cancelo
 {style:CITY({number:19,skin:SKIN_M,seed:50}),path:[[-12,-18,-1],[-3,-11,2],[0,-7.4,3.4],[2,-6.2,3.2]]},// Álvarez
 {style:CITY({number:47,seed:51}),path:[[-12,-24,-16],[0,-13,-10.5],[2,-11,-9]]},// Foden
 {style:CITY({number:20,seed:52}),path:[[-12,-36,12],[0,-24,11],[2,-21,10]]},// Bernardo Silva
 {style:CITY({number:16,build:{height:1.9},seed:53}),path:[[-12,-44,2],[0,-33,3],[2,-30,3]]},// Rodri
 {style:CITY({number:5,build:{height:1.88},seed:54}),path:[[-12,-40,-20],[0,-31,-17],[2,-29,-16]]},// Stones
 {style:REF,path:[[-12,-36,-7],[0,-21,-6],[3,-17,-6]]},// referee (Daniele Orsato)
];

// ---- Haaland: the drift to the far post, the take-off (right foot), the flying LEFT-foot volley (τ = 0), the fall, up to celebrate ----
/** the flying volley, authored for the LEFT foot (contact .5): take-off off the right foot, left knee drives up, the body leans back, the
 * left leg swings up above his head and the outside of the boot hooks the ball; one arm flung up, the other reaching; then down on his back */
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
 const sq=t<.2?-.05*sm(0,.2,t):t<.5?lerp(-.05,.08,sm(.2,.5,t)):lerp(.08,0,sm(.5,.8,t));
 return A.clampPose({...A.keyPoses(clamp(t),keys),squash:sq});}
const flyT=(tau:number)=>clamp(.5+tau/FLY_DUR);
/** heading at the strike: facing the goal line, turned a little toward the cross (inferred; like Cruyff's phantom goal) */
const HYAW=22*Math.PI/180;
function haalandState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(HAAL_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 let pose=A.blendPose(A.blendPose(A.stand(),run,clamp((v-.3)/1.2)),fly(flyT(tau)),easeInOutSine(sm(-.95,-.62,tau)));
 if(tau<-.7&&tau>T_CROSS-.6){// eyes on the dropping ball: the head tips up with the ball's height
  const b=ballT(tau),el=Math.atan2(b[1]-1.7,Math.hypot(b[0]-q.x,b[2]-q.z)+1),w=sm(T_CROSS-.6,T_CROSS,tau)*(1-sm(-.95,-.7,tau));
  pose={...pose,neckP:pose.neckP-clamp(el,0,.9)*.7*w};}
 if(tau>1.4)pose=A.blendPose(pose,A.celebrate(tau-1.4,{kind:'run'}),easeInOutSine(sm(1.4,2.4,tau)));
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):HYAW,cel=sm(1.4,2.4,tau);
 const yaw=angLerp(runYaw,HYAW,sm(-.9,-.45,tau));
 return{x:q.x-cel*3*(tau-1.4)/2,z:q.z-cel*3.6*(tau-1.4)/2,yaw:tau>1.4?angLerp(yaw,-2.1,cel):yaw,pose};}
/** the ball on the OUTSIDE of his LEFT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sk=A.solve(fly(.5),HB,{x:HG[0],z:-HG[1],yaw:HYAW}),m=mix3(sk.lAn,sk.lToe,.55);return[m[0],m[1]+.02,-m[2]+.12];})();
/** where it crosses into the net: mid-height, inside the far post (inferred) */
const NETPT:V3=[.25,1.35,-1.55];
const KDB_FOOT:V3=[-26.0,.11,6.3],CAN_FOOT:V3=[-24.2,.11,22.1];
/** a ballistic flight a → b over `dur` seconds (real gravity), with an optional sideways bow (m) to the left of the travel */
function flight(a:V3,b:V3,dur:number,s:number,bow=0):V3{const u=clamp(s/dur),vy=(b[1]-a[1]+.5*G*dur*dur)/dur,t=u*dur,dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,bw=bow*Math.sin(Math.PI*u);
 return[lerp(a[0],b[0],u)-dz/l*bw,a[1]+vy*t-.5*G*t*t,lerp(a[2],b[2],u)+dx/l*bw];}
/** the ball on τ: De Bruyne's feet → his pass → Cancelo carries it → the floated outside-of-the-boot cross → the volley → the net */
function ballT(tau:number):V3{
 if(tau<T_PASS){const q=moverPos(KDB_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*9)*.12;return[q.x+q.vx/v*(.55+ph),.11,q.z+q.vz/v*(.55+ph)];}
 if(tau<T_RECV){const a=ballT(T_PASS-.001),u=easeOut(clamp((tau-T_PASS)/(T_RECV-T_PASS))),r=moverPos(CAN_P,T_RECV);return[lerp(a[0],r.x+.5,u),.11,lerp(a[2],r.z-.3,u)];}
 if(tau<T_CROSS-.25){const q=moverPos(CAN_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.14;return[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];}
 if(tau<T_CROSS){const a=ballT(T_CROSS-.2501),u=sm(T_CROSS-.25,T_CROSS,tau);return mix3(a,CAN_FOOT,u);}
 if(tau<0)return flight(CAN_FOOT,CONTACT,-T_CROSS,tau-T_CROSS,2.2);
 if(tau<SHOT)return mix3(CONTACT,NETPT,tau/SHOT);
 const s=tau-SHOT,u=clamp(s/.1);if(u<1)return mix3(NETPT,[1.6,1.1,-1.3],u);
 const d=clamp((s-.1)/.5),e=s-.6,bounce=d>=1?.12*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.6-.4*d,Math.max(.11,1.1*(1-d*d)+.11*d*d)+bounce,-1.3+.2*d];}
/** Meyer: still shuffling across from his near post when the ball is hit (not set), then a late dive to his left (−z) */
const DIVE_DUR=1.05,DIVE_T0=-.08;
function keeperState(tau:number){const z=lerp(1.4,-.2,sm(T_CROSS,.05,tau,easeInOutSine));
 let pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.55});
 if(tau<DIVE_T0&&tau>T_CROSS){const ph=Math.sin((tau-T_CROSS)*11);pose={...pose,lHipA:pose.lHipA+.25*Math.max(0,ph),rHipA:pose.rHipA+.25*Math.max(0,-ph),air:pose.air+.03*Math.abs(ph)};}
 return{x:KEEP_X,z,yaw:Math.PI,pose};}
/** De Bruyne: on the ball, then the pass out to the left with his right foot */
function kdbState(tau:number,ball:V3){const st=moverState(KDB_P,tau,ball),w=sm(T_PASS-.55,T_PASS-.3,tau)*(1-sm(T_PASS+.4,T_PASS+.8,tau));
 if(tau<T_PASS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2)%1+1)%1,{foot:'r',speed:.5}),.6);
 const r=moverPos(CAN_P,T_RECV);return{...st,yaw:angLerp(st.yaw,Math.atan2(r.z-6.2,r.x+26.4),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_PASS)/1.1),{power:.55}),w)};}
/** Cancelo: carries it down the left, looks up, and crosses with the OUTSIDE of his RIGHT foot (body square to the goal line, swiping across) */
function canceloState(tau:number,ball:V3){const st=moverState(CAN_P,tau,ball),w=sm(T_CROSS-.55,T_CROSS-.3,tau)*(1-sm(T_CROSS+.45,T_CROSS+.9,tau));
 if(tau>T_RECV&&tau<T_CROSS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.2)%1+1)%1,{foot:'r',speed:.6}),.6);
 const look=sm(T_CROSS-1.3,T_CROSS-1,tau)*(1-sm(T_CROSS-.6,T_CROSS-.4,tau));st.pose={...st.pose,neckP:st.pose.neckP-.45*look,neckY:st.pose.neckY-.5*look};
 const heading=Math.atan2(CONTACT[2]-CAN_FOOT[2],CONTACT[0]-CAN_FOOT[0])+.62;
 return{...st,yaw:angLerp(st.yaw,heading,w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_CROSS)/1.1),{power:.6}),w)};}
/** Schlotterbeck: backs toward goal watching the cross, then stretches too late as Haaland rises behind him */
function schState(tau:number,ball:V3){const st=moverState(SCH_P,tau,ball,A.stand),w=sm(-.5,-.15,tau)*(1-sm(.6,1.2,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(-.5,0,tau)),{side:'l'}),w)};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...kdbState(t,b),style:DEBRUYNE},{...canceloState(t,b),style:CANCELO,smear:t>T_CROSS-.2&&t<T_CROSS+.25},{...schState(t,b),style:SCHLOTT});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...haalandState(t),style:HAALAND,smear:t>-.3&&t<.35},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.25&&t<DIVE_T0+.75});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (mid-height, inside the far post) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-1.1,p[2]+1.3)+Math.abs(p[0]-1.6)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with the move; the cross; the volley; the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Goal')-SHOT-.15,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-38,21,-46];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_CROSS){const w=sm(T_CROSS-1.6,T_CROSS,tau);return[lerp(b[0],-12,.2+.25*w),1.2,lerp(b[2],4,.2+.3*w)];}
 const w=sm(T_CROSS,-.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-8,.3),1.2+b[1]*.3,lerp(b[2],2,.3)];return mix3(mid,[-3,1.2,-.8],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,2600],[T_PASS,2900],[T_RECV,3300],[T_CROSS,3600],[-.6,5400],[0,7000],[.8,6800],[1.8,5200],[4,4800]]);return makeCam(BCAM,look,F);}
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

// ---------------- chapter 2 (TV replay, slow motion, a low near-touchline camera on a long lens): behind Schlotterbeck, eyes on the drop ----------------
const ch2T=()=>({slips:T(1,'Haaland slips in'),sch:T(1,'Nico Schlotterbeck'),eyes:T(1,'eyes on the ball'),drops:T(1,'as it drops'),far:T(1,'the far post'),end:SEC(1)});
/** replay clock: from Cancelo's cross, slowed, so the ball floats over while Haaland slips in behind Schlotterbeck; ends before the take-off */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_CROSS-.35],[q.slips,T_CROSS+.25],[q.sch,-.95],[q.eyes,-.72],[q.drops,-.55],[q.end,-.36]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-13,2.1,-24];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),m=moverPos(HAAL_P,tau),head:V3=[m.x,1.4,m.z];
 const w=key(t,mono<[number,number]>([[0,.9],[q.slips,.96],[q.sch,.95],[q.eyes,.82],[q.drops,.72],[q.end,.72]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,4600],[q.slips,5800],[q.sch,6400],[q.eyes,5600],[q.drops,4800],[q.end,4800]]) as unknown as Key[]);
 const lk=mix3(b,head,w);lk[1]=Math.min(lk[1],2.4);return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:.15});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6.2,
};

// ---------------- chapter 3 (reverse replay from behind the goal): the flying left-foot volley, past Meyer, the net, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'hooks it')+.1)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{leaps:T(2,'He leaps'),leg:T(2,'left leg high'),HIT,ft:T(2,'first time'),out:T(2,'outside of his boot'),am:T(2,'Alexander Meyer'),two:T(2,'Two-one'),end:SEC(2)};};
/** replay clock: take-off on "He leaps", ×~6 slow up to the strike on "hooks it", the ball past Meyer on his name, then real time */
const tau3=(t:number)=>{const q=ch3T(),tm=Math.max(q.am,q.HIT+1),tn=Math.max(q.two,tm+.3);
 return key(t,mono<[number,number]>([[0,-.62],[q.leaps,-.36],[q.leg,-.14],[q.HIT,0],[tm,SHOT*.9],[tn,SHOT+.3],[tn+1,SHOT+1.3],[tn+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[-7.5,1.6,27];
function ch3Cam(t:number){const q=ch3T(),tm=Math.max(q.am,q.HIT+1);
 return camKeysOf(t,mono<CK>([[0,...CAM3,HG[0]-.3,1.2,HG[1],8200],[q.leaps,...CAM3,HG[0],1.35,HG[1],9000],[q.HIT,...CAM3,HG[0]+.2,1.45,HG[1],9400],[q.out,...CAM3,HG[0]+.8,1.35,HG[1]+.2,8400],[tm,...CAM3,-1.2,1.2,-1.4,6400],[q.two-.1,...CAM3,-1.2,1.2,-1.4,6000],[q.two+.8,-7.5,2.4,27,-8,6,-40,2600],[q.end-.9,-7.5,2.6,27,-12,12,-45,2200],[q.end,-7.5,2.6,27,-14,20,-45,2200]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?8*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.two,q.two+.5,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,glare:roar*.5,net});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  if(w.ball[0]>.05)goal(s,c,net,1);// the side netting nearest the camera hangs in front of the ball once it is in
  // the first-time contact: a yellow spark off the outside of the left boot
  if(tau>-.01&&tau<.1){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],60+260*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
 },
 aperture(t){const c=ch3Cam(t),l:V3=[-10,34,-66],[x,y]=P(c,l),r=clamp(4.8*kAt(c,l),30,300);return apertureDisc(x,y,r*.6,12);},
 still:4.6,
};

// ---------------- chapter 4 (duotone replay): make the run early, meet it first time, before the keeper is set ----------------
const G4:Pt=[10,480],H4=700,AZ4=38;// his ground point and drawn height, seen from his right-front: the leap and the raised left leg read
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:AZ4,elevation:5});
const KG4:Pt=[560,260],KH4=370;// the keeper, further back on the right
const KCAM4=A.figureCam({x:KG4[0],y:KG4[1],height:KH4,azimuth:150,elevation:5});
const HDUO:A.AthleteStyle={...HAALAND,shirt:[K,.8],shorts:'paper',socks:[K,.8],hair:[Y,.9],skin:[[Y,.62],[K,.26]],shade:[K,.2],trim:K,detail:'high'};
const KDUO:A.AthleteStyle={...KEEPER,shirt:[K,.6],shorts:[K,.6],socks:[K,.6],skin:[[Y,.62],[K,.26]],shade:[K,.2],detail:'mid'};
const ch4T=()=>{const hit=T(3,'hit it first time');return{yt:T(3,'Your turn'),run:T(3,'make your run early'),hit,CT:hit+.55,kp:T(3,'before the keeper'),set:T(3,'is set'),end:SEC(3)};};
/** the lesson clock: he runs in early (from the left), arrives, rises and meets it at CT; the fly() keys play at real speed */
function lessonState(t:number){const q=ch4T(),arrive=q.CT-.62;
 const x=lerp(-2.1,0,sm(q.run-.2,arrive,t,easeOut)),runW=sm(q.run-.35,q.run-.1,t)*(1-sm(arrive-.3,arrive,t));
 let pose=A.blendPose(A.stand(),A.runCycle(((t*1.5)%1+1)%1,{speed:.75}),runW);
 const ft=.5+(t-q.CT)/FLY_DUR;
 pose=A.blendPose(pose,fly(ft),easeInOutSine(sm(q.CT-.9,q.CT-.62,t)));
 return{x,pose};}
/** where the ball meets the outside of his LEFT boot at contact, on the sheet */
const LESSON_HIT=(()=>{const sk=A.solve(fly(.5),HB),m=mix3(sk.lAn,sk.lToe,.55),c:A.V3=[m[0],m[1]+.02,m[2]-.12],a=CAM4.project(c);return[a[0],a[1]] as Pt;})();
/** a dashed yellow line (lesson only), drawn on by g */
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,cpt=LESSON_HIT;
  const v=key(t,mono<number[]>([[0,60,-20,.9],[q.run,-20,-20,.92],[q.hit,40,-60,.96],[CT,80,-60,1],[q.kp,300,-30,.98],[q.end,330,-30,1]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the replay stage: navy field, a yellow floodlight pool in three screens, a light cone, the six-yard line in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(G4[0]+200,G4[1]-40,r*1.7,r*.32,40);
  s.knockout(pool(600),.6);s.tone(Y,pool(600),.2);s.tone(Y,pool(400),.32);s.tone(Y,pool(230),.45);
  s.tone(Y,polyPath([[-100,-1600],[200,-1600],[900,G4[1]],[-700,G4[1]]],true),.1);
  s.knockout(ribbon([[-900,G4[1]+120],[900,G4[1]-60]],12,{taper:.1,wobble:1.2}),.9);
  // the keeper: shuffling across (not set) until "is set", too late; the ball flies past
  const kst=(u:number)=>{const shuffle=1-sm(q.set,q.set+.4,u),ph=Math.sin(u*9)*shuffle;let p=A.keeperSet(((u*1.4)%1+1)%1);p={...p,lHipA:p.lHipA+.3*Math.max(0,ph),rHipA:p.rHipA+.3*Math.max(0,-ph),air:p.air+.04*Math.abs(ph)};return{p,x:lerp(-.5,.6,sm(q.yt,q.set,u,easeInOutSine))};};
  const k1=kst(tt),k0=kst(tt-1/12);
  const kr=drawPlayer(s,k1.p,k0.p,KCAM4,KDUO,{z:k1.x});
  // not set: a flickering yellow ring round his moving feet from "before the keeper" to "is set", then a tick as he finally settles
  const ns=sm(q.kp-.1,q.kp+.25,tt,easeOutBack)*(1-sm(q.set+.5,q.set+.9,tt));
  if(ns>.02){const f=kr.joints.lAn,g=kr.joints.rAn,cx=(f[0]+g[0])/2,cy=Math.max(f[1],g[1])+10;s.stroke(K,ring(cx,cy,110*ns,26*ns),12,tt<q.set?.95:.6);
   if(tt<q.set){for(const d of[-1,1])s.fill(K,polyPath([[cx+d*(130*ns),cy],[cx+d*(100*ns),cy-16],[cx+d*(100*ns),cy+16]],true),.95);}}
  // the early run: a dashed curve from where he started to the spot where the ball will drop
  const st=lessonState(tt),pv=lessonState(tt-1/12);
  const runG=sm(q.run-.2,q.run+.6,tt,easeOut)*(1-sm(CT+.3,CT+.8,tt));
  if(runG>.02){const pts:Pt[]=[];for(let i=0;i<=16;i++){const u=i/16,p=CAM4.project([lerp(-2.6,-.3,u),0,.6*Math.sin(u*Math.PI)]);pts.push([p[0],p[1]]);}dashed(s,pts,runG,22,K);
   const e=pts[Math.max(1,Math.round(16*runG))];if(runG>.9)s.fill(K,polyPath([[e[0]+44,e[1]],[e[0]-8,e[1]-30],[e[0]-8,e[1]+30]],true),.95);}
  drawPlayer(s,st.pose,pv.pose,CAM4,HDUO,{x:st.x},tt>CT-.35&&tt<CT+.4);
  // the ball: floats in from the top left along a dotted arc, meets the LEFT boot first time at CT, then flies past the keeper
  const start:Pt=[cpt[0]-560,-560],drop=sm(q.run,CT,tt,x=>x*x*(1.2-.2*x));
  const at=(k:number):Pt=>[lerp(start[0],cpt[0],k),lerp(start[1],cpt[1],k)-220*Math.sin(k*Math.PI)];
  let bxy=tt<q.run?at(0):at(drop),sq=0;
  const kGoal:Pt=[KG4[0]+40,KG4[1]-230],ang=Math.atan2(kGoal[1]-cpt[1],kGoal[0]-cpt[0]);
  if(tt>=CT){const f=sm(CT,CT+.6,tt,easeIn);bxy=[cpt[0]+Math.cos(ang)*1700*f,cpt[1]+Math.sin(ang)*1700*f];sq=.5*(1-sm(CT,CT+.1,tt));}
  if(tt>=q.run&&tt<CT+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const p=at(i/18*Math.min(1,drop+.02));dots.moveTo(p[0]+10,p[1]);dots.arc(p[0],p[1],10,0,TAU);}s.fill(Y,dots,.95);}
  // first time: a target ring on the boot as the ball arrives, no touch to control it
  const ft=sm(q.hit-.1,q.hit+.3,tt,easeOutBack)*(1-sm(CT+.05,CT+.25,tt));
  if(ft>.02){s.stroke(Y,ring(cpt[0],cpt[1],90*ft,90*ft),11,.95);const d0=ring(cpt[0],cpt[1],16*ft,16*ft,12);s.knockout(d0);s.fill(Y,d0);}
  ballAt(s,bxy[0],bxy[1],58,tt*(tt>=CT?12:1.5),{sq,dir:ang,duo:true});
  if(tt>=CT&&tt<CT+.35)sparkBurst(s,Y,cpt[0],cpt[1],140+140*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.15,CT+.35,tt),width:16});
  if(tt>=CT&&tt<CT+.6)speedLines(s,K,bxy[0],bxy[1],ang,{n:5,seed:42,len:240,width:10,cov:.85});
 },
 still:5.4,
};

const story:RisoStory={
 id:'haaland-signature',format:'11v11',title:"Haaland's first-time finish",
 theme:'Make your run early, then hit it first time before the keeper is set.',
 ageNote:'Champions League, Manchester City 2–1 Borussia Dortmund, Etihad Stadium, Manchester, 14 September 2022 (84th minute).',
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
