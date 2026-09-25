/** Iconic play film: Frank Rijkaard's signature, "win it and play it forward". The 1990 European Cup final, AC Milan 1–0 Benfica,
 * Praterstadion (today the Ernst-Happel-Stadion), Vienna, Wednesday 23 May 1990: the only goal, 68th minute (67' in the Italian reports).
 * Alessandro Costacurta set the move going and passed forward to Marco van Basten; Van Basten's soft pass sent Rijkaard running through the
 * Benfica defence, and Rijkaard finished with the OUTSIDE OF HIS RIGHT FOOT past keeper Silvino. A RisoStory (chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1 reconstruction from written accounts (we did
 * not watch the footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Rijkaard a signature, not a match ("Signature: win it and play it forward"; lesson "Win the ball,
 * then pass it forward quickly before the other team is ready"). Wikipedia's player article describes him as a tenacious ball-winning
 * defensive midfielder "adept at starting attacking plays as a deep-lying playmaker once he won back possession" who also made "late runs
 * into the penalty area". His best-documented moment is this goal: a quick move played FORWARD from Milan's defence in two passes, finished
 * by the midfielder's own late run while Benfica were not set. The narration does NOT claim he won the ball in this move (no source says who
 * did); the lesson chapter then shows the whole signature (win it, pass forward quickly) as a generic duotone drill.
 *
 * SOURCES (read Sept 2026; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "1990 European Cup final" (raw): 23 May 1990, Praterstadion, Vienna; Milan 1–0 Benfica, Rijkaard 68'; "Frank Rijkaard ran
 *    through the opposing defence and scored the only goal"; referee Helmut Kohl (Austria); line-ups and numbers (Milan: G. Galli 1,
 *    Tassotti 2, Costacurta 5, Baresi 6, Maldini 3, Colombo 4, Ancelotti 7, Rijkaard 8, Evani 11, Van Basten 9, Gullit 10; Benfica: Silvino 1,
 *    José Carlos 2, Ricardo Gomes 3, Samuel 4, Aldair 5, Thern 6, Vítor Paneira 7, Pacheco 8, Hernâni 9, Valdo 10, Magnusson 11). KIT BOX:
 *    Milan in their WHITE away strip (white shirts, shorts, socks), Benfica in RED (red shirts, shorts and socks; the shorts pattern file
 *    shows red shorts with white side stripes).
 *  - Wikipedia (it), "Finale della Coppa dei Campioni 1989-1990" (raw): "Al 67' ... van Basten dà una palla in profondità al connazionale
 *    Frank Rijkaard il quale si invola a rete e batte il portiere lusitano"; same kit boxes.
 *  - dnamilan.com, PierGiorgio Danuol, "Milan-Benfica: 1-0" (6 Feb 2012, via web.archive.org): "l'azione parte dalla trequarti rossonera,
 *    imposta Costacurta, passaggio a Van Basten, tocco morbido per Rijkaard che si invola verso la porta, scatto fulmineo, tocco di esterno
 *    destro e pallone che si infila alle spalle di Silvino"; Rijkaard: "Ho visto l'angolino scoperto e ho capito che avrei fatto goal";
 *    about 57,000 in the ground (about 35,000 Milan fans, 15,000 Benfica fans); the goal "sblocca" a tight, tactical 0–0.
 *  - The Guardian, Nicky Bandini, "The great European Cup teams: Milan 1989-90" (24 May 2013): Milan retained the cup, "Frank Rijkaard score
 *    the only goal in a 1-0 win". Wikipedia, "Frank Rijkaard" (raw): 1.90 m; the ball-winning/deep-playmaker/late-run description above.
 * CONFIRMED by those accounts: date, ground, competition, 0–0 before the goal, the minute (67'/68'), 1–0 final score, Milan retaining the cup
 * (champions of Europe again); Milan in white, Benfica in red; Rijkaard wore 8, Van Basten 9, Costacurta 5, Silvino kept goal; the move:
 * Costacurta built it and passed forward to Van Basten, Van Basten's soft pass into space ("in profondità"), Rijkaard ran through ("si invola")
 * and scored with the OUTSIDE OF HIS RIGHT FOOT past Silvino, into the corner he saw was open.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, run and timing between those beats (where Costacurta
 * was, where Van Basten received, which side Rijkaard ran and from how deep, his touch before the shot, where he shot from); WHICH corner (drawn
 * low into the corner on Rijkaard's right, the side an outside-of-the-right-foot finish carries it) and the ball's height; Silvino coming off
 * his line and diving late; the Benfica defenders' positions (Aldair, Ricardo Gomes, Thern, Hernâni, José Carlos, Samuel) and the other
 * Milan players'; which way Milan attacked on screen; the kit trims and number colours; Silvino's kit (drawn blue) and the referee's (navy);
 * Rijkaard's and Gullit's hair; the celebration; night under floodlights (a late-May evening kick-off in Vienna; kick-off time not sourced);
 * the Prater drawn as an oval bowl with a running track under a roof ring, the crowd colours (Milan red and black, Benfica red).
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with Costacurta's pass forward, Van Basten's soft pass and Rijkaard's run into the net; 2 = slow-motion replay from low behind
 * the play: the two quick passes forward (yellow tracks), the flat-footed Benfica centre-backs ringed, the ball rolled into the space;
 * 3 = the reverse replay from the goal line beside the post: the outside-of-the-right-foot finish coming at us, into the corner, the roar;
 * 4 = the lesson, a duotone drill (navy + yellow on paper): step in and win the ball, pass it forward quickly past two players who have not
 * turned yet, to a team-mate running on. NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow (floodlight, grass with blue), red (Benfica, Milan fans, the track, skin), blue (grass, Silvino, shade), navy (night sky, key
 * line). The lesson chapter is a duotone beat (navy + yellow on paper). */
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
 {label:'Vienna, live',text:'Vienna, 1990, the European Cup final. Milan against Benfica, nil-nil. Costacurta plays it forward to Marco van Basten, a soft pass, and Frank Rijkaard races through... Goal!',tail:2.3,
  cues:['Vienna','the European Cup final','Milan against Benfica','Costacurta plays it forward','Marco van Basten','a soft pass','Frank Rijkaard races through','Goal']},
 {label:'Watch again',text:'Watch again, slowly. Two quick passes forward, and Benfica are not ready. Van Basten rolls it into the space, and Rijkaard runs onto it.',tail:.9,
  cues:['Watch again','slowly','Two quick passes forward','Benfica are not ready','Van Basten rolls it','into the space','Rijkaard runs onto it']},
 {label:'Into the corner',text:'The outside of his right foot... past the keeper, into the corner! One-nil. Milan are champions of Europe again!',tail:2.1,
  cues:['The outside of his','right foot','past the keeper','into the corner','One-nil','champions of Europe again']},
 {label:'Your turn',text:'Your turn: win the ball, then pass it forward quickly, before the other team is ready.',tail:2.2,
  cues:['Your turn','win the ball','pass it forward','quickly','before the other team is ready']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py rijkaard-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/rijkaard-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/rijkaard-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rijkaard: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`rijkaard film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ---------------- the Prater on a May night: an oval bowl round a running track under a roof ring, floodlights, grass, lines, the goal ----------------
/** a superellipse loop round the pitch centre (-52.5, 0): semi-axes a (along the pitch) and b (across), at height y */
const LOOPN=24;
const loopPt=(i:number,a:number,b:number,y:number):V3=>{const th=i/LOOPN*TAU,c=Math.cos(th),s=Math.sin(th),e=.55;return[-52.5+a*Math.sign(c)*Math.abs(c)**e,y,b*Math.sign(s)*Math.abs(s)**e];};
const TRACK_A=68,TRACK_B=47;
/** the stands as quads [lowerA, lowerB, upperB, upperA] between the track edge and the back of the bowl */
const STANDS:V3[][]=Array.from({length:LOOPN},(_,i)=>[loopPt(i,TRACK_A,TRACK_B,1.2),loopPt(i+1,TRACK_A,TRACK_B,1.2),loopPt(i+1,TRACK_A+32,TRACK_B+30,23),loopPt(i,TRACK_A+32,TRACK_B+30,23)]);
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 red / 2 navy (Milan black), phase] — Milan red and black fill most of the bowl; Benfica
 * red and white behind one goal (the reports: ~35,000 Milan fans, ~15,000 Benfica fans) */
const CROWD=(()=>{const r=rng(1990),out:[number,number,number,number,number][]=[];for(let st=0;st<LOOPN;st++){const n=36;for(let i=0;i<n;i++){const c=r(),u=r(),ben=st>=10&&st<=13;out.push([st,u,.04+r()*.92,ben?(c<.7?1:0):c<.4?1:c<.75?2:0,r()*TAU]);}}return out;})();
/** the floodlights along the roof's inner rim */
const LAMPS:V3[]=Array.from({length:LOOPN},(_,i)=>loopPt(i+.5,TRACK_A+22,TRACK_B+20,27.4));
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a May night over Vienna: navy sky, a blue glow over the rim from the floodlights
 s.field(K,.74,.5);s.field(B,.24,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,hz-520],[Bnd,hz-600],[Bnd,Bnd],[-Bnd,Bnd]],true),.3);
 // stands: knocked out, printed navy + blue, terraces as stepped bands, the roof ring, then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],28,ub[2]],[ua[0],28,ua[2]]]));
  const fa=mix3(q[3],q[0],.3),fb=mix3(q[2],q[1],.3);addPoly(roof,clipPoly(c,[[ua[0],28,ua[2]],[ub[0],28,ub[2]],[fb[0],27,fb[2]],[fa[0],27,fa[2]]]));});
 s.knockout(stands);s.fill(K,stands,.5);s.tone(B,stands,.3);s.tone(K,terr,.25);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9))*(st>=10&&st<=13?.2:1):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.85);if(seen[1]){s.knockout(heads[1],.9);s.fill(R,heads[1],.9);}if(seen[2])s.fill(K,heads[2],.92);
 // camera flashes in the crowd (paper sparks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(960+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*LOOPN),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.92);
 // floodlights under the roof rim: bright yellow lamp panels with a paper core
 {const glow=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const w=clamp(1.3*k,6,160),h=clamp(.7*k,4,90);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);addPoly(glow,[[x-w*2.2,y-h*2.4],[x+w*2.2,y-h*2.4],[x+w*2.2,y+h*2.4],[x-w*2.2,y+h*2.4]]);});
  s.tone(Y,glow,.3);s.knockout(core);s.fill(Y,core,.55);}
 // the running track round the pitch: red tartan
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:LOOPN},(_,i)=>loopPt(i,TRACK_A,TRACK_B,0))));s.knockout(tr);s.fill(R,tr,.5);s.tone(K,tr,.18);
 // grass under the lights: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.84);s.tone(B,gp,.66);
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
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]],[[-108,-37],[-108,37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.knockout(boards);s.fill(B,boards,.6);s.tone(K,boards,.3);
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
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Rijkaard's right foot is his right foot
// on screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.8],[R,.22]],SKIN_M:A.InkFill[]=[[Y,.7],[R,.42]],SKIN_D:A.InkFill[]=[[R,.72],[K,.36]];
const LINE={line:K,boots:K,hair:K,shade:[B,.3] as A.InkFill};
/** Milan: the white away strip (white shirts, shorts and socks — the kit box); red trim and navy numbers inferred */
const MIL=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',shorts:'paper',socks:'paper',trim:R,numberInk:K,skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Benfica: red shirts, red shorts, red socks (the kit box); white trim and numbers */
const BEN=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.95],shorts:[R,.95],socks:[R,.95],trim:'paper',numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:11,...o});
const RB:A.Build={height:1.9,bulk:1.08,thighs:1.1};
const RIJKAARD:A.AthleteStyle=MIL({number:8,skin:SKIN_D,hairStyle:'curly',build:RB,seed:8});
const VANBASTEN:A.AthleteStyle=MIL({number:9,hair:[K,.6],build:{height:1.88},seed:9});
const COSTACURTA:A.AthleteStyle=MIL({number:5,build:{height:1.83},seed:5});
const ALDAIR:A.AthleteStyle=BEN({number:5,skin:SKIN_M,build:{height:1.83},seed:25});
const RICARDO:A.AthleteStyle=BEN({number:3,skin:SKIN_D,build:{height:1.91},seed:23});
const KEEPER:A.AthleteStyle={...LINE,shirt:[B,.72],shorts:[K,.85],socks:[B,.72],gloves:'paper',sleeves:'long',skin:SKIN_L,hairStyle:'short',build:{height:1.8},seed:21};
const REF:A.AthleteStyle={...LINE,shirt:[K,.9],shorts:K,socks:K,skin:SKIN_L,hairStyle:'balding',seed:17};
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
/** the ball (drawn as a classic panel ball): paper with navy panels and a shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;
/** a projected ring on the grass (centre x,z, radius r metres) */
function groundRing(c:Cam,x:number,z:number,r:number,n=20):Pt[]|null{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.03,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR+.2)return null;pts.push(P(c,p));}return pts;}

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Rijkaard's strike) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const SHOT=.5,T_CPASS=-4.6,T_VREC=-3.2,T_VPASS=-2.35,T_RREC=-1;
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

// Costacurta steps up from the back and passes forward; Van Basten comes short, cushions it and rolls it into the space; Rijkaard's run
// from deep goes past him between the centre-backs (inferred paths)
const C_P:MKey[]=[[-12,-63,8.5],[-7,-60.5,7],[T_CPASS,-58.2,5.9],[-3,-56,5.4],[0,-52,5],[3,-49,5]];
const V_P:MKey[]=[[-12,-21,7],[-6,-23.5,6],[T_VREC-.3,-27.3,4.6],[T_VREC,-27.9,4.4],[T_VPASS,-27.8,4.1],[-1,-25.5,3.4],[0,-23.5,3],[3,-19,2.4]];
const C_FOOT:V3=[-57.6,.11,5.8],V_FOOT:V3=[-27.3,.11,4.3],V_FOOT2:V3=[-27.2,.11,3.8],RECV:V3=[-17.4,.11,-.35];
/** the ball at the strike: ahead of his right boot, 12 m out, a touch right of centre (inferred spot) */
const SPOT:V3=[-11.8,.11,-.7];
/** where it goes in: low, into the corner on his right (the side an outside-of-the-right-foot finish carries it; inferred) */
const NETPT:V3=[.25,.38,-3.0];
const SYAW=Math.atan2(NETPT[2]-SPOT[2],NETPT[0]-SPOT[0]);
/** the body faces a little LEFT of the target (+z): the outside of the right boot pushes the ball out to the right */
const BYAW=SYAW+.32;
/** the outside-of-the-foot strike: the kicking leg turned in (toes in), a shorter swing — the athlete's strike with the hip rotated */
function outside(u:number):A.Pose{const p=A.strike(u,{foot:'r',power:.55}),w=sm(.28,.46,u)*(1-sm(.74,.95,u));return{...p,rHipR:p.rHipR-.55*w,rHipA:p.rHipA-.2*w,rAnk:p.rAnk+.15*w};}
/** Rijkaard's place at contact, solved so the ball sits against the OUTSIDE of his RIGHT boot (library skeleton, converted to this world) */
const R_AT=(()=>{const sk=A.solve(outside(A.STRIKE_CONTACT),RB,{x:0,z:0,yaw:BYAW}),m=mix3(sk.rAn,sk.rToe,.6);
 const right:[number,number]=[Math.sin(BYAW),-Math.cos(BYAW)];// his right on the ground in this world
 return[SPOT[0]-m[0]-right[0]*.1,SPOT[2]+m[2]-right[1]*.1] as [number,number];})();
const R_P:MKey[]=[[-12,-52,-6],[-7,-48.5,-5],[T_CPASS,-43,-3.9],[-3,-33,-2.8],[T_VPASS,-27.8,-2],[-1.6,-23,-1.4],[T_RREC,-18.4,-.9],[-.45,-14.8,-.9],[0,R_AT[0],R_AT[1]],[.7,R_AT[0]+.9,R_AT[1]-.4]];
const KEEP_X=-3.2;
const ALD_P:MKey[]=[[-12,-23,4.5],[-5,-22.5,4.8],[T_VREC,-23.2,4.4],[T_VPASS,-23,3.6],[-1,-20.5,2],[0,-17.2,1.2],[2,-13,.4]];
const RIC_P:MKey[]=[[-12,-22,-4.5],[-5,-21.5,-4.2],[T_VPASS,-21.4,-3.6],[-1,-19.2,-2.9],[0,-15.4,-2.6],[2,-11.4,-2.4]];
const OTHERS:Mover[]=[
 {style:BEN({number:6,hair:[Y,.7],seed:40}),path:[[-12,-33,9],[-4,-31,7],[T_VPASS,-29.8,5.6],[0,-26,3],[2,-22,1.5]]},// Thern, closing Van Basten
 {style:BEN({number:9,skin:SKIN_M,seed:41}),path:[[-12,-41,-1],[-5,-38,-2],[0,-27,-2.6],[2,-22,-2.4]]},// Hernâni, chasing Rijkaard back
 {style:BEN({number:2,seed:42}),path:[[-12,-27,17],[-3,-22,13],[0,-18,10],[2,-14,8]]},// José Carlos, far side
 {style:BEN({number:4,seed:43}),path:[[-12,-26,-19],[-3,-21,-14],[0,-17,-11],[2,-13,-9]]},// Samuel, near side
 {style:BEN({number:10,skin:SKIN_M,seed:44}),path:[[-12,-44,6],[0,-38,4],[2,-34,3]]},// Valdo
 {style:MIL({number:10,skin:SKIN_D,hairStyle:'long',build:{height:1.91},seed:50}),path:[[-12,-25,-15],[-4,-20,-12.5],[0,-15,-10],[2,-12,-8.5]]},// Gullit, near side
 {style:MIL({number:11,seed:51}),path:[[-12,-36,21],[-4,-30,18],[0,-25,16],[2,-22,15]]},// Evani, far side
 {style:MIL({number:7,seed:52}),path:[[-12,-47,2],[0,-39,1],[2,-36,1]]},// Ancelotti
 {style:REF,path:[[-12,-42,-9],[0,-29,-10],[3,-25,-10]]},// referee (Helmut Kohl)
];

/** the ball on τ: Costacurta's feet → the pass forward → Van Basten's cushion → the soft pass into space → Rijkaard's touch → the finish */
function ballT(tau:number):V3{
 if(tau<T_CPASS-.2){const q=moverPos(C_P,tau),d=nrm([V_FOOT[0]-q.x,0,V_FOOT[2]-q.z]),ph=Math.sin(tau*6)*.12;return[q.x+d[0]*(.6+ph),.11,q.z+d[2]*(.6+ph)];}
 if(tau<T_CPASS){const a=ballT(T_CPASS-.2001),u=sm(T_CPASS-.2,T_CPASS,tau);return mix3(a,C_FOOT,u);}
 if(tau<T_VREC){const u=(tau-T_CPASS)/(T_VREC-T_CPASS),e=lerp(u,1-(1-u)*(1-u),.35),p=mix3(C_FOOT,V_FOOT,e);p[1]+=.35*Math.sin(Math.PI*u);return p;}
 if(tau<T_VPASS){const u=sm(T_VREC,T_VREC+.4,tau,easeOut);return mix3(V_FOOT,V_FOOT2,u);}
 if(tau<T_RREC){const u=(tau-T_VPASS)/(T_RREC-T_VPASS);return mix3(V_FOOT2,RECV,1-Math.pow(1-u,1.5));}
 if(tau<0){const u=(tau-T_RREC)/-T_RREC;return mix3(RECV,SPOT,u*(1.3-.3*u));}
 if(tau<SHOT){const u=tau/SHOT,p=mix3(SPOT,NETPT,u);p[1]=lerp(.11,NETPT[1],u)+.25*Math.sin(Math.PI*u);return p;}
 const s=tau-SHOT,u=clamp(s/.12);if(u<1)return mix3(NETPT,[1.6,.35,-2.7],u);
 const d=clamp((s-.12)/.5),e=s-.62,bounce=d>=1?.1*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.6-.3*d,Math.max(.11,.35*(1-d)+.11*d)+bounce,-2.7+.3*d];}
/** Silvino: comes off his line as the soft pass rolls through, sets, then a late dive to his left (−z), beaten low */
const DIVE_DUR=1.05,DIVE_T0=-.1;
function keeperState(tau:number){const z=lerp(.6,-.3,sm(T_VPASS,-.3,tau,easeInOutSine)),x=lerp(-1.2,KEEP_X,sm(T_VPASS,-.4,tau));
 let pose=tau<DIVE_T0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-DIVE_T0)/DIVE_DUR),{side:'l',height:.12});
 if(tau<DIVE_T0&&tau>T_VPASS&&tau<-.5)pose=A.blendPose(pose,A.runCycle(((tau*1.6)%1+1)%1,{speed:.35}),.5*(1-sm(-1.1,-.5,tau)));
 return{x,z,yaw:Math.PI,pose};}
/** Costacurta: carries it forward, then passes it with his right foot to Van Basten */
function costaState(tau:number,ball:V3){const st=moverState(C_P,tau,ball),w=sm(T_CPASS-.55,T_CPASS-.3,tau)*(1-sm(T_CPASS+.4,T_CPASS+.9,tau));
 if(tau<T_CPASS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*1.6)%1+1)%1,{foot:'r',speed:.4}),.5);
 return{...st,yaw:angLerp(st.yaw,Math.atan2(V_FOOT[2]-C_FOOT[2],V_FOOT[0]-C_FOOT[0]),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_CPASS)/1.1),{power:.7}),w)};}
/** Van Basten: comes short, cushions the pass, then rolls a soft pass with his right foot into the space for Rijkaard */
const VPYAW=Math.atan2(RECV[2]-V_FOOT2[2],RECV[0]-V_FOOT2[0]);
function vbState(tau:number,ball:V3){const st=moverState(V_P,tau,ball);
 const cush=sm(T_VREC-.35,T_VREC,tau)*(1-sm(T_VREC+.2,T_VREC+.5,tau));
 let pose=A.blendPose(st.pose,A.strike(.58,{foot:'r',power:.15}),cush*.7);
 const w=sm(T_VPASS-.5,T_VPASS-.25,tau)*(1-sm(T_VPASS+.4,T_VPASS+.9,tau));
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_VPASS)/1.2),{foot:'r',power:.3}),w);
 return{...st,yaw:angLerp(st.yaw,VPYAW,w),pose};}
/** the two centre-backs: flat, watching Van Basten; Aldair steps toward him, then both turn and chase Rijkaard too late */
function cbState(path:MKey[],tau:number,ball:V3){const st=moverState(path,tau,ball,A.stand);
 const brace=sm(T_VREC-.3,T_VREC,tau)*(1-sm(T_VPASS+.25,T_VPASS+.7,tau));
 return{...st,pose:A.blendPose(st.pose,A.backpedal(((tau*1.3)%1+1)%1),brace*.6)};}
/** Rijkaard: the long run from deep, a touch with the right foot, the outside-of-the-right-foot finish (τ = 0), then away arms out */
function rijkState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(R_P,tau),v=Math.hypot(q.vx,q.vz);
 const run=A.runCycle(((q.dist/2.4)%1+1)%1,{speed:clamp(v/7.5)});
 let pose=A.blendPose(A.stand(),run,clamp((v-.3)/1.2));
 // the touch as the soft pass arrives: a short right-foot push ahead
 const tw=sm(T_RREC-.25,T_RREC-.05,tau)*(1-sm(T_RREC+.1,T_RREC+.35,tau));
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_RREC)/1.1),{foot:'r',power:.12}),tw*.8);
 pose=A.blendPose(pose,outside(clamp(A.STRIKE_CONTACT+tau/1.1)),easeInOutSine(sm(-.7,-.45,tau)));
 const cel=sm(1.3,2.1,tau);
 if(tau>1.3){const c=A.celebrate(tau-1.3,{kind:'run'});pose=A.blendPose(pose,c,easeInOutSine(cel));}
 const ct=clamp(tau-1.3,0,4);
 const runYaw=v>.2?Math.atan2(q.vz,q.vx):BYAW,yaw=angLerp(runYaw,BYAW,sm(-.75,-.45,tau));
 return{x:q.x-cel*2.4*ct,z:q.z-cel*4.4*ct,yaw:tau>1.3?angLerp(yaw,-1.95,cel):yaw,pose};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...costaState(t,b),style:COSTACURTA,smear:t>T_CPASS-.12&&t<T_CPASS+.15},{...vbState(t,b),style:VANBASTEN},{...cbState(ALD_P,t,b),style:ALDAIR},{...cbState(RIC_P,t,b),style:RICARDO});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...rijkState(t),style:RIJKAARD,smear:t>-.2&&t<.3},{...keeperState(t),style:KEEPER,smear:t>DIVE_T0+.25&&t<DIVE_T0+.75});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (low, in the corner) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.5,p[2]+2.8)+Math.abs(p[0]-1.6)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.1,p[2]];};
/** a dashed line (a ribbon with gaps), drawn on by g */
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;s.fill(ink,ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}
/** a pass track on the grass from a to b, drawn on by g (an arrowhead once it is complete) */
function passTrack(s:Sheet,c:Cam,a:V3,b:V3,g:number){if(g<=.02)return;const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=mix3(a,b,i/16);p[1]=.03;if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const w=clamp(.2*kAt(c,mix3(a,b,.5)),8,30);dashed(s,pts,g,w);
 if(g>.95){const e=pts[pts.length-1],f=pts[pts.length-3],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),L=w*2.6;s.fill(Y,polyPath([[e[0]+Math.cos(ang)*L*.6,e[1]+Math.sin(ang)*L*.6],[e[0]+Math.cos(ang+2.4)*L,e[1]+Math.sin(ang+2.4)*L],[e[0]+Math.cos(ang-2.4)*L,e[1]+Math.sin(ang-2.4)*L]],true),.95);}}

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with the pass forward, the soft pass, the run, the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'Goal')-SHOT-.1,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-38,24,-62];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_VPASS){const w=sm(T_CPASS,T_VREC,tau);return[lerp(b[0],-30,.1+.25*w),1.2,lerp(b[2],1,.25)];}
 const w=sm(T_RREC,.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-14,.25),1.2+b[1]*.3,lerp(b[2],0,.3)];return mix3(mid,[-6,1.2,-1.5],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,2300],[T_CPASS,2300],[T_VREC,2700],[T_VPASS,3000],[T_RREC,3600],[0,4600],[.8,4900],[1.8,4100],[4,3800]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.2+1.1*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:+(ch1T().TL-1).toFixed(2),
};

// ---------------- chapter 2 (TV replay, slow motion, low behind the play): two quick passes forward, Benfica not ready, the ball into the space ----------------
const ch2T=()=>({two:T(1,'Two quick passes forward'),ready:T(1,'Benfica are not ready'),rolls:T(1,'Van Basten rolls it'),space:T(1,'into the space'),runs:T(1,'Rijkaard runs onto it'),end:SEC(1)});
/** replay clock: from just before Costacurta's pass, slowed through the two passes; ends as Rijkaard reaches the ball, before the strike */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,T_CPASS-.5],[q.two,T_CPASS+.1],[q.ready,T_VREC+.25],[q.rolls,T_VPASS-.05],[q.space,T_VPASS+.55],[q.runs,T_RREC-.1],[q.end,-.55]]) as unknown as Key[],x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),rk=moverPos(R_P,tau);
 const lk=mix3(b,[rk.x,1.1,rk.z],key(t,mono<[number,number]>([[0,0],[q.rolls,.1],[q.space,.4],[q.runs,.5],[q.end,.5]]) as unknown as Key[]));lk[1]=1.1;
 const F=key(t,mono<[number,number]>([[0,1500],[q.two,1700],[q.ready,2300],[q.rolls,2500],[q.space,2300],[q.runs,2100],[q.end,2000]]) as unknown as Key[]);
 // a low camera behind the play, tracking up the touchline side with the move (it starts behind Costacurta)
 const pos=key(t,mono<number[]>([[0,-70,3,-8],[q.two+.4,-66,3,-8],[q.ready,-46,2.6,-9],[q.rolls,-42,2.4,-9],[q.end,-37,2.3,-9]]) as unknown as Key[],easeIO,true);
 return makeCam([pos[0],pos[1],pos[2]],lk,F);}
const ch2:Scene={
 draw(s,t){
  const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:.1});
  const out=1-sm(q.end-.9,q.end-.4,tt);
  // "two quick passes forward": the tracks drawn on the grass as the ball travels
  passTrack(s,c,C_FOOT,V_FOOT,sm(q.two-.2,q.two+.9,tt,easeOut)*out);
  passTrack(s,c,V_FOOT2,RECV,sm(q.rolls-.1,q.space+.3,tt,easeOut)*out);
  // "Benfica are not ready": yellow rings round the two flat-footed centre-backs, still watching Van Basten
  const rg=sm(q.ready,q.ready+.35,tt,easeOutBack)*(1-sm(q.space,q.space+.5,tt));
  if(rg>.02)for(const path of [ALD_P,RIC_P]){const m=moverPos(path,tau),r=groundRing(c,m.x,m.z,1.1*rg);if(r)s.stroke(Y,polyPath(r,true),clamp(.09*kAt(c,[m.x,0,m.z]),6,16),.95);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN*.8)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4.6,
};

// ---------------- chapter 3 (reverse replay from the goal line beside the post): the outside-of-the-right-foot finish at us, the net, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'right foot')+.35)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{out:T(2,'The outside of his'),rf:T(2,'right foot'),HIT,past:T(2,'past the keeper'),corner:T(2,'into the corner'),one:T(2,'One-nil'),champ:T(2,'champions of Europe again'),end:SEC(2)};};
/** replay clock: slowed ×~5 through the last strides and the strike, the ball past Silvino on "past the keeper", in on "into the corner", then real time */
const tau3=(t:number)=>{const q=ch3T(),tp=Math.max(q.past,q.HIT+.35),tc=Math.max(q.corner,tp+.3);
 return key(t,mono<[number,number]>([[0,-.95],[q.out,-.75],[q.rf,-.3],[q.HIT,0],[tp,SHOT*.62],[tc,SHOT+.2],[tc+1,SHOT+1.2],[tc+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[2.2,1.2,-11];
function ch3Cam(t:number){const q=ch3T(),tp=Math.max(q.past,q.HIT+.35);
 const S:V3=[R_AT[0],1.0,R_AT[1]];
 const kc=camKeysOf(t,mono<CK>([[0,...CAM3,S[0]-1.4,1.1,S[2]+.4,5200],[q.rf,...CAM3,S[0]-.4,.95,S[2],6400],[q.HIT,...CAM3,S[0]+.2,.9,S[2],6200],[q.HIT+.3,...CAM3,S[0]+2.4,.9,S[2]-.6,4800],[tp,...CAM3,-3.6,.9,-1.8,4000],[q.corner,...CAM3,-1.2,1,-2.8,3700],[q.one,...CAM3,-2,1.1,-2.8,3500]]));
 // then the camera swings off the net to follow Rijkaard's celebration run, the crowd behind him
 const w=sm(q.one-.1,q.one+.9,t,easeInOutSine);if(w<=0)return kc;
 const r=rijkState(tau3(t)),lk=mix3([kc.p[0]+kc.f[0]*10,kc.p[1]+kc.f[1]*10,kc.p[2]+kc.f[2]*10],[r.x,1.3,r.z],w);
 return makeCam(mix3(kc.p,[4,2.6,-16],w),lk,lerp(kc.F,2500,w));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?7*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.one-.2,q.one+.4,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,net});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  if(w.ball[0]>.05)goal(s,c,net,-1);// the near side netting hangs in front of the ball once it is in
  // the finish: a yellow spark off the outside of the right boot, speed lines on the ball's flight
  if(tau>-.01&&tau<.1){const p=P(c,SPOT);sparkBurst(s,Y,p[0],p[1],60+220*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
  if(tau>0&&tau<SHOT){const p=P(c,w.ball),a=P(c,SPOT);speedLines(s,K,p[0],p[1],Math.atan2(p[1]-a[1],p[0]-a[0]),{n:5,seed:21,len:200,width:9,cov:.8});}
 },
 aperture(t){const c=ch3Cam(t),l=LAMPS[6],[x,y]=P(c,l),r=clamp(4*kAt(c,l),30,300);return apertureDisc(x,y,r*.6,12);},
 still:5,
};

// ---------------- chapter 4 (duotone drill): step in and win the ball, pass it forward quickly, before the other team is ready ----------------
const G4:Pt=[-270,470],H4=640;// his ground point and drawn height, seen from his right side a little in front: facing screen right
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:16,elevation:5});
const DUO_SKIN:A.InkFill[]=[[K,.5],[Y,.4]];
const RDUO:A.AthleteStyle={...RIJKAARD,shirt:'paper',shorts:'paper',socks:'paper',trim:K,skin:DUO_SKIN,hair:K,shade:[K,.2],detail:'high'};
/** the two opponents (navy halftone kits) caught facing the wrong way, and the team-mate (paper kit) running on to the pass */
const ODUO=(seed:number):A.AthleteStyle=>({line:K,boots:K,hair:K,shirt:[K,.55],shorts:[K,.8],socks:[K,.55],trim:'paper',skin:[[Y,.6],[K,.2]],shade:[K,.2],hairStyle:'short',seed});
const MDUO:A.AthleteStyle={...MIL({number:9,seed:60}),shirt:'paper',shorts:'paper',socks:'paper',trim:K,skin:[[Y,.6],[K,.2]],shade:[K,.2]};
const OPP=[{x:90,y:285,h:150,seed:70},{x:260,y:305,h:170,seed:71}].map(o=>({...o,cam:A.figureCam({x:o.x,y:o.y,height:o.h,azimuth:16,elevation:5})}));
const MATE={x0:300,x1:460,y:385,h:215};
const ch4T=()=>{const win=T(3,'win the ball'),pf=T(3,'pass it forward'),qk=T(3,'quickly');return{yt:T(3,'Your turn'),win,WON:win+.35,pf,qk,CT:Math.max(qk+.15,pf+.7),ready:T(3,'before the other team is ready'),end:SEC(3)};};
/** his pose: ready, the lunge to win it (full reach at WON), gather, then the forward pass (contact at CT) */
function lessonPose(t:number):A.Pose{const q=ch4T();
 const lu=key(t,mono<[number,number]>([[0,0],[q.WON-.45,.05],[q.WON,.6],[q.WON+.45,1]]) as unknown as Key[],x=>x);
 let p=A.blendPose(A.stand(),A.lunge(lu,{side:'r'}),sm(q.WON-.6,q.WON-.3,t));
 const u=key(t,mono<[number,number]>([[q.pf-.35,0],[q.pf,.22],[q.CT-.3,.4],[q.CT,A.STRIKE_CONTACT],[q.CT+.5,.8],[q.CT+1.1,1]]) as unknown as Key[],x=>x);
 p=A.blendPose(p,A.strike(u,{foot:'r',power:.5}),sm(q.WON+.35,q.pf-.2,t));
 return p;}
/** sheet points: where the lunge's right boot stops the ball, and where the pass is struck from */
const LESSON=(()=>{const at=(pose:A.Pose)=>{const sk=A.solve(pose,RB),m=mix3(sk.rAn,sk.rToe,.7),p=CAM4.project([m[0]+.1,.11,m[2]]);return[p[0],p[1]] as Pt;};
 return{stop:at(A.lunge(.6,{side:'r'})),kick:at(A.strike(A.STRIKE_CONTACT,{foot:'r',power:.5}))};})();
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),R4=40;
  const v=key(t,mono<number[]>([[0,-40,-10,.94],[q.win,-80,-10,1],[q.WON+.3,-60,-10,1],[q.pf,0,-20,.96],[q.CT+.4,40,-20,.94],[q.end,50,-20,.95]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the drill stage: navy field, a yellow floodlight pool in three screens, the grass line in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>ring(60,G4[1]-40,r*1.7,r*.32,40);
  s.knockout(pool(560),.6);s.tone(Y,pool(560),.2);s.tone(Y,pool(380),.3);s.tone(Y,pool(220),.42);
  s.knockout(ribbon([[-1000,G4[1]+18],[1000,G4[1]+10]],12,{taper:.1,wobble:1.2}),.9);
  // the ball's path: their pass comes across from the right; he steps in (win) and it stops at his boot; the forward pass to the team-mate
  const from:Pt=[440,300],stop=LESSON.stop,kick=LESSON.kick,mateAt=(u:number):Pt=>[lerp(MATE.x0,MATE.x1,u),MATE.y];
  const mu=sm(q.pf,q.CT+.9,tt,easeIO),target:Pt=[MATE.x0+(MATE.x1-MATE.x0)*.85+30,MATE.y];
  // "pass it forward": the dashed yellow track to where the team-mate will be, an arrowhead, drawn on before the kick
  const tr=sm(q.pf,q.pf+.5,tt,easeOut)*(1-sm(q.end-.9,q.end-.3,tt));
  if(tr>.02){const pts:Pt[]=[];for(let i=0;i<=14;i++)pts.push([lerp(kick[0],target[0],i/14),lerp(kick[1],target[1],i/14)-R4*.9]);dashed(s,pts,tr,14);
   if(tr>.95){const e=pts[pts.length-1],ang=Math.atan2(target[1]-kick[1],target[0]-kick[0]);s.fill(Y,polyPath([[e[0]+Math.cos(ang)*30,e[1]+Math.sin(ang)*30],[e[0]+Math.cos(ang+2.4)*44,e[1]+Math.sin(ang+2.4)*44],[e[0]+Math.cos(ang-2.4)*44,e[1]+Math.sin(ang-2.4)*44]],true),.95);}}
  // the opponents: jogging the wrong way after their pass, then turning too late ("before the other team is ready")
  for(const [i,o] of OPP.entries()){const turn=sm(q.ready+.2*i,q.ready+1+.2*i,tt,easeInOutSine),yaw=lerp(Math.PI*.92,.2,turn),ph=(tt*1.3+i*.4)%1;
   const pose=A.blendPose(A.runCycle(ph,{speed:.2}),A.backpedal(ph),turn),prev=A.blendPose(A.runCycle(((tt-1/12)*1.3+i*.4)%1,{speed:.2}),A.backpedal(((tt-1/12)*1.3+i*.4)%1),turn);
   drawPlayer(s,pose,prev,o.cam,{...ODUO(o.seed),detail:'mid'},{yaw});}
  // the team-mate running on toward the target
  {const mp=mateAt(mu),mc=A.figureCam({x:mp[0],y:mp[1],height:MATE.h,azimuth:16,elevation:5}),ph=(tt*1.5)%1,run=A.runCycle(ph,{speed:.4+.5*mu}),prev=A.runCycle(((tt-1/12)*1.5)%1,{speed:.4+.5*mu});
   drawPlayer(s,run,prev,mc,{...MDUO,detail:'mid'},{});}
  // the figure
  const p1=lessonPose(tt),p0=lessonPose(tt-1/12);
  const fig=drawPlayer(s,p1,p0,CAM4,RDUO,{},(tt>q.WON-.3&&tt<q.WON+.2)||(tt>q.CT-.3&&tt<q.CT+.35));
  // the ball
  let bxy:Pt,sq=0,ang=0,spin=0;
  if(tt<q.WON){const u=sm(q.win-1.6,q.WON,tt,x=>x);bxy=[lerp(from[0],stop[0],u),lerp(from[1],stop[1],u)-R4*.9];ang=Math.atan2(stop[1]-from[1],stop[0]-from[0]);spin=-tt*10;}
  else if(tt<q.CT){const u=sm(q.WON+.2,q.pf,tt,easeOut);bxy=[lerp(stop[0],kick[0],u),lerp(stop[1],kick[1],u)-R4*.9];spin=-q.WON*10;}
  else{const f=sm(q.CT,q.CT+.75,tt,easeOut);bxy=[lerp(kick[0],target[0],f),lerp(kick[1],target[1],f)-R4*.9];sq=.35*(1-sm(q.CT,q.CT+.12,tt));ang=Math.atan2(target[1]-kick[1],target[0]-kick[0]);spin=tt*14;}
  // "win the ball": a yellow ring and a spark where his boot stops it
  const wr=sm(q.WON-.1,q.WON+.2,tt,easeOutBack)*(1-sm(q.pf,q.pf+.4,tt));
  if(wr>.02){const f=fig.joints.rToe;s.stroke(Y,ring(f[0],Math.max(f[1],stop[1])+10,90*wr,26*wr),11,.95);}
  if(tt>=q.WON-.05&&tt<q.WON+.3)sparkBurst(s,Y,stop[0],stop[1]-R4*.9,110+110*sm(q.WON-.05,q.WON+.1,tt,easeOut),{n:9,seed:31,g:1-sm(q.WON+.1,q.WON+.3,tt),width:14});
  ballAt(s,bxy[0],bxy[1],R4,spin,{sq,dir:ang,duo:true});
  if(tt>=q.CT&&tt<q.CT+.6)speedLines(s,Y,bxy[0],bxy[1],ang,{n:5,seed:42,len:200,width:10,cov:.85});
  // on the team-mate's boot: a ring and a tick
  const tg=sm(q.CT+.7,q.CT+1,tt,easeOutBack);
  if(tg>.02)s.stroke(Y,ring(target[0],target[1]+6,70*tg,20*tg),10,.95);
  const tick=sm(q.ready+.9,q.ready+1.2,tt,easeOutBack);
  if(tick>.02){const cx=380,cy=150,k=tick;s.fill(Y,ribbon([[cx-40*k,cy],[cx-10*k,cy+30*k],[cx+50*k,cy-40*k]],20,{taper:.1,pressure:0,wobble:.8}),.95);}
 },
 still:5.4,
};

const story:RisoStory={
 id:'rijkaard-signature',format:'11v11',title:'Rijkaard: win it, play it forward',
 theme:'Win the ball, then pass it forward quickly before the other team is ready.',
 ageNote:'European Cup final, AC Milan 1–0 Benfica, Praterstadion, Vienna, 23 May 1990 (68th minute, the only goal).',
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
