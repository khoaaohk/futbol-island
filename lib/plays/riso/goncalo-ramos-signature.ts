/** Iconic play film: Gonçalo Ramos's signature, the first-time finish. Portugal 6–1 Switzerland, 2022 FIFA World Cup round of 16,
 * Lusail Stadium, Lusail, Qatar, Tuesday 6 December 2022 (22:00 local kick-off, a night match under the lights): the 51st-minute goal,
 * Portugal's third and his second of his hat-trick, when he darted across the near post to flick Diogo Dalot's low cross in first time.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged. A 1:1
 * reconstruction from WRITTEN match reports (we did not watch the footage); only the rendering is riso.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Ramos a signature, not a match ("Signature: the first-time finish"; lesson "Keep moving in the
 * box so the defender can't settle next to you"). The hat-trick against Switzerland is his most famous night (his first international
 * start, in place of Cristiano Ronaldo), and of its three goals this is the one written sources describe as BOTH halves of the card: he
 * kept moving and "darted across the near post" to get "in front of Comert", and he "flicked an instinctive finish" first time. The lead's
 * suggested opener (17') was a turn on Fabian Schär and a drilled shot (Guardian: "Ramos turned him far too easily"), i.e. NOT a first-time
 * finish, so this film uses the 51st-minute goal instead. The play IS described by the sources, so it is staged inside the real match; the
 * lesson chapter is a separate, plainly generic duotone drill.
 *
 * SOURCES (read Sept 2026 with curl, cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2022 FIFA World Cup knockout stage" (raw), Portugal vs Switzerland: 6 December 2022, 22:00, Lusail Stadium, attendance
 *    83,720, referee César Arturo Ramos (Mexico); goals Ramos 17', 51', 67', Pepe 33', Guerreiro 55', Leão 90+2'; Akanji 58'; Ronaldo
 *    left out of the starting line-up, Ramos "named instead to make his first start"; line-ups and numbers (Portugal: Costa 22; Dalot 2,
 *    Pepe 3, Dias 4, Guerreiro 5; Carvalho 14; Otávio 25, Bernardo Silva 10; Bruno Fernandes 8, Ramos 26, Félix 11. Switzerland: Sommer 1;
 *    Akanji 5, Schär 22 (off at 46' for Cömert 18), Rodriguez 13; Xhaka 10; E. Fernandes 2, Sow 15, Freuler 8, Vargas 17; Embolo 7,
 *    Shaqiri 23); kit boxes: Portugal RED shirts (DB1D27), GREEN shorts (0F7540), RED socks; Switzerland WHITE shirts, light-grey (E0E0E0)
 *    shorts and socks; Ramos man of the match. https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_knockout_stage
 *  - The Guardian, match report, 6 Dec 2022 ("Ramos hits hat-trick as Portugal thrash Switzerland 6–1 after Ronaldo dropped"): "Ramos
 *    moved, and that allowed others to move off him"; "Ramos darted across the near post to turn in Diogo Dalot's low cross in via the
 *    undercarriage of Yann Sommer". https://www.theguardian.com/football/2022/dec/06/portugal-switzerland-world-cup-last-16-match-report
 *  - The Guardian, live blog (Rob Smyth), 6 Dec 2022: "GOAL! Portugal 3-0 Switzerland (Ramos 50)"; "The goal was made by Dalot, who gave
 *    Vargas a taste of his own by zipping down the right and driving a cross to the near post. Ramos got in front of Comert (I think) and
 *    flicked an instinctive finish that went through Sommer and into the net." https://www.theguardian.com/football/live/2022/dec/06/
 *    portugal-v-switzerland-world-cup-2022-last-16-live-score-updates
 *  - BBC Sport (Phil McNulty), 6 Dec 2022: "Ramos effectively ended the contest with a near post swoop on Diogo Dalot's cross six minutes
 *    after the break". https://www.bbc.com/sport/football/63789753
 *  - Wikipedia, "Gonçalo Ramos" (raw): height 1.85 m; striker; Benfica at the time (clubs as lib/town/playerCareers.json: Benfica → PSG →
 *    AC Milan). Card country: Portugal (lib/town/playerAppearance.json).
 * CONFIRMED by those accounts: the match, date, ground, night kick-off, the score before (2–0) and after (3–0), the minute (51' per
 *  Wikipedia/BBC; the live blog logged it at 50); Dalot ZIPPED DOWN THE RIGHT past Vargas and DROVE a LOW cross to the NEAR POST; Ramos
 *  DARTED ACROSS the near post and got IN FRONT of Cömert; a FIRST-TIME FLICK ("instinctive finish"); it went THROUGH SOMMER'S LEGS into
 *  the net; the names, numbers and kits above (Portugal red/green/red, Switzerland white with light grey); Cömert on for Schär at half-time.
 * INFERRED / ILLUSTRATIVE (not confirmed, kept out of the narration): every position, path and timing between those beats; which foot Ramos
 *  flicked it with (drawn RIGHT: the ball came from his right) and which foot Dalot crossed with (drawn RIGHT); where Dalot crossed from
 *  (just outside the right corner of the box); Ramos's little check away before his dart (the "keep moving" habit, drawn small); Sommer's
 *  spot (a step off his near post) and kit (printed yellow), the referee's kit (printed navy); Vargas's late block; everyone else's spot;
 *  which way Portugal attacked on screen (left to right from the main stand) and so which touchline Dalot ran down on screen (the near one);
 *  the celebration (a run toward the near corner); the Lusail bowl as drawn (two steep tiers, a pale roof ring with floodlights on its lip);
 *  crowd colours (Portugal red and green, Swiss red and white); Swiss numbers printed red; Portugal numbers printed paper.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in REAL TIME,
 * panning with Dalot's run down the right, the low cross, the dart and the flick; 2 = slow-motion replay from a low camera on the far side
 * of the box: Ramos keeps moving and gets in front of Cömert, a yellow dashed run to a ring at the near post; 3 = the reverse replay from
 * behind the goal, through the net: one touch, the ball squeezes through Sommer's legs, the net, the roar; 4 = the lesson, a duotone
 * drill (keep moving so the defender can't settle next to you, then dart in front and hit it first time). NEVER top-down.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). This world is LEFT-handed
 * (x → the goal line at 0, y up, z → the far touchline = an attacker's LEFT); the adapter negates z so right feet stay right feet.
 * Scenes read only their local t; every action keys off cue times, so the recorded voice (withTiming) re-times the film; drawn objects
 * pose on twos, cameras on ones; every random value is seeded.
 *
 * Inks: yellow, red, green, navy (Portugal red + green, Switzerland paper with a pale navy screen, grass = yellow under green, a navy
 * night sky). The lesson chapter is a duotone beat (navy + yellow on paper). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

// ---------------- the narration (script.json mirrors it) and its provisional timing ----------------
/** `tail` = silence after the last word (the action finishes and the .65 s passage plays in it). Cue words must stay substrings, in order.
 * No cue starts with a contraction or a hyphenated word (Kokoro splits them), and none starts with "Gonçalo". */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Near post, live',text:'Lusail, World Cup 2022. Portugal lead Switzerland two-nil. Diogo Dalot zips down the right... and drives it low to the near post. Ramos darts across... flicks it in, first time! Goal!',tail:2.4,
  cues:['Lusail','Portugal lead','Diogo Dalot','down the right','drives it low','near post','Ramos darts','flicks it in','Goal']},
 {label:'Keep moving',text:'Watch again, slowly. See Ramos keep moving? He gets in front of his defender, at the near post.',tail:1.2,
  cues:['Watch again','slowly','keep moving','gets in front','near post']},
 {label:'One touch',text:"From behind the goal: one touch, and it squeezes through the keeper's legs. Portugal lead three-nil!",tail:2.4,
  cues:['From behind','one touch','squeezes through','Portugal lead']},
 {label:'Your turn',text:"Your turn: keep moving in the box. When you keep moving, your defender can't settle next to you. Then hit it first time!",tail:2.2,
  cues:['Your turn','keep moving','When you','defender','settle','Then hit it','first time']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py goncalo-ramos-signature writes timing.json next to
 * script.json). Then add `import timingJson from '../../../public/plays/narration/goncalo-ramos-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/goncalo-ramos-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('goncalo-ramos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`goncalo-ramos film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}

const K='navy',R='red',Y='yellow',G='green';
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
/** the box and six-yard lines, the penalty spot and arc (shared by the match and the drill) */
function boxLines(lines:Path2D,c:Cam,full:boolean){
 const L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 if(full){L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([-52.5,-34],[-52.5,34]);
  let prev:[number,number]|null=null;for(let i=0;i<=16;i++){const a=i/16*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 L([0,-34],[0,34]);
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
}

// ---------------- Lusail at night: a huge closed bowl, two steep tiers, a pale roof ring with the floodlights on its lip ----------------
const IN=[[-113,42],[8,42],[8,-42],[-113,-42]] as const, OUT=[[-150,80],[45,80],[45,-80],[-150,-80]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA]: 0 far side, 1 behind the goal Portugal attack, 2 the main stand (behind the camera), 3 the far end */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],38,OUT[j][1]],[OUT[i][0],38,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
const FASCIA:[number,number]=[.44,.5];
/** seeded crowd: [stand, u, v, colour 0 paper / 1 red / 2 green, phase] — Portugal red and green everywhere, Swiss red and white (inferred) */
const CROWD=(()=>{const r=rng(612),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){for(let i=0;i<400;i++){const c=r(),v=.04+r()*.92;if(v>FASCIA[0]-.02&&v<FASCIA[1]+.02)continue;
 out.push([st,r(),v,c<.28?0:c<.8?1:2,r()*TAU]);}}return out;})();
type Stadium={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a Gulf night: deep navy, a faint floodlit haze low over the bowl
 s.field(K,.86,.5);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(Y,polyPath([[-Bnd,hz-760],[Bnd,hz-760],[Bnd,hz+60],[-Bnd,hz+60]],true),.1);
 // stands: knocked out, printed navy with a green cast, terraces as stepped bands, the lit fascia between the tiers, the roof ring
 const stands=new Path2D(),terr=new Path2D(),fas=new Path2D(),roof=new Path2D(),lip=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  addPoly(fas,clipPoly(c,[bil(q,0,FASCIA[0]),bil(q,1,FASCIA[0]),bil(q,1,FASCIA[1]),bil(q,0,FASCIA[1])]));
  const ua=q[3],ub=q[2],fa=mix3(q[3],q[0],.3),fb=mix3(q[2],q[1],.3);
  addPoly(roof,clipPoly(c,[[ua[0],41,ua[2]],[ub[0],41,ub[2]],[fb[0],44,fb[2]],[fa[0],44,fa[2]]]));
  addPoly(lip,clipPoly(c,[[fa[0],44,fa[2]],[fb[0],44,fb[2]],[fb[0],42.6,fb[2]],[fa[0],42.6,fa[2]]]));
  // the floodlight line along the inner lip: short lit bars, a soft halo round each
  for(let k=0;k<8;k++){const u=(k+.5)/8,a=mix3([fa[0],43,fa[2]],[fb[0],43,fb[2]],u-.025),b=mix3([fa[0],43,fa[2]],[fb[0],43,fb[2]],u+.025),m=mix3(a,b,.5);if(depthOf(c,m)<4)continue;
   addPoly(lamp,clipPoly(c,[a,b,[b[0],43.8,b[2]],[a[0],43.8,a[2]]]));const[x,y]=P(c,m);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;const rr=clamp(kAt(c,m)*5,8,150);halo.moveTo(x+rr,y);halo.ellipse(x,y,rr,rr*.6,0,0,TAU);}});
 s.knockout(stands);s.tone(K,stands,.55);s.tone(G,stands,.08);s.tone(K,terr,.25);
 s.knockout(fas);s.fill(K,fas,.9);s.tone(Y,fas,.22);
 const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.62*k,6,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.85);if(seen[1]){s.knockout(heads[1],.8);s.fill(R,heads[1],.9);}if(seen[2]){s.knockout(heads[2],.8);s.fill(G,heads[2],.9);}
 // phone lights and camera flashes once the goal is in (paper flecks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.84);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),8,24);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(roof,.9);s.tone(K,roof,.16);s.tone(Y,roof,.12);s.fill(K,lip,.92);
 s.knockout(halo,.2);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.85);
 // floodlit grass: yellow × green, mowing stripes, paper lines
 const ground=clipPoly(c,[[-113,0,-42],[8,0,-42],[8,0,42],[-113,0,42]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.88);s.tone(G,gp,.78);s.tone(K,gp,.1);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(K,stripes,.12);
 const lines=new Path2D();boxLines(lines,c,true);s.knockout(lines,.95);
 // LED boards at the pitch edge: navy with lit red panels
 const boards=new Path2D(),panels=new Path2D();for(const[a,b] of [[[-108,38],[5,38]],[[5,38],[5,-38]],[[5,-38],[-108,-38]]] as [[number,number],[number,number]][]){addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.95,b[1]],[a[0],.95,a[1]]]));
  for(let k=0;k<12;k++){const u0=k/12+.015,u1=u0+.05;addPoly(panels,clipPoly(c,[[lerp(a[0],b[0],u0),.25,lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),.25,lerp(a[1],b[1],u1)],[lerp(a[0],b[0],u1),.7,lerp(a[1],b[1],u1)],[lerp(a[0],b[0],u0),.7,lerp(a[1],b[1],u0)]]));}}
 s.fill(K,boards,.88);s.knockout(panels,.8);s.tone(R,panels,.4);
 if(!o.noGoal)goal(s,c,o.net);
}
/** the goal at x=0 (`light`: seen from behind, printed over the players, a thin mesh): halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3,light=false){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 if(light){s.tone(K,vol,.08);s.stroke(K,mesh,Math.max(1.6,.012*kAt(c,[1.5,1,0])),.5);}else{s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);}
 const fr=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];fr.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(fr);
}

// ---------------- figures: the shared athlete library through ONE adapter ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline, a player's LEFT when he faces the goal); the library
// is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Ramos's right foot is his right foot
// on screen from every camera. Library yaw = this world's heading atan2(dz, dx).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
/** THE adapter: every body in the film is drawn here (a motion smear first on fast moves, then the figure with its previous pose) */
function drawPlayer(s:Sheet,pose:A.Pose,prev:A.Pose,pj:A.Projector,style:A.AthleteStyle,place:A.Place={},smear=false){
 if(smear)A.motionSmear(s,prev,pose,pj,style,place);
 return A.drawAthlete(s,pose,pj,style,place,{prev});}
const SKIN_L:A.InkFill[]=[[Y,.35],[R,.16]],SKIN_M:A.InkFill[]=[[Y,.46],[R,.26],[K,.06]],SKIN_D:A.InkFill[]=[[R,.45],[K,.45],[Y,.18]];
const LINE={line:K,boots:K,hair:[K,.88] as A.InkFill,shade:[K,.28] as A.InkFill};
/** Portugal: red shirts, green shorts, red socks (the match's kit box); paper numbers, green trim (inferred) */
const POR=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:[R,.95],shorts:[G,.95],socks:[R,.95],trim:[G,.9],numberInk:'paper',skin:SKIN_L,hairStyle:'short',seed:7,...o});
/** Switzerland: white shirts, light-grey shorts and socks (the kit box); red trim and numbers (inferred) */
const SUI=(o:Partial<A.AthleteStyle>={}):A.AthleteStyle=>({...LINE,shirt:'paper',shorts:[K,.2],socks:[K,.2],trim:[R,.9],numberInk:R,skin:SKIN_L,hairStyle:'short',seed:11,...o});
const RB:A.Build={height:1.85,bulk:1};
const RAMOS:A.AthleteStyle=POR({number:26,hair:[K,.9],build:RB,seed:26});
const DALOT:A.AthleteStyle=POR({number:2,hair:K,skin:SKIN_M,build:{height:1.83},seed:2});
const COMERT:A.AthleteStyle=SUI({number:18,hair:K,build:{height:1.83,bulk:1.02},seed:18});
const VARGAS:A.AthleteStyle=SUI({number:17,hair:K,skin:SKIN_M,build:{height:1.8,bulk:.97},seed:17});
const AKANJI:A.AthleteStyle=SUI({number:5,hair:K,skin:SKIN_D,build:{height:1.87},seed:5});
/** Sommer: yellow keeper kit (unverified), long sleeves */
const KEEPER:A.AthleteStyle={...LINE,shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:K,skin:SKIN_L,hairStyle:'short',build:{height:1.83},seed:33};
const REF:A.AthleteStyle={...LINE,shirt:[K,.88],shorts:K,socks:K,trim:[Y,.8],skin:SKIN_M,hairStyle:'short',seed:19};
/** a figure on the pitch: ground (x,z) in this world, heading yaw (radians), the pose now and one drawn frame earlier (secondary motion) */
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean;hero?:boolean};
type Item={depth:number;draw:()=>void};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:Item[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:Item[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail:!bd.hero&&detail==='auto'&&kk*1.85<340?'low' as const:detail};
  items.push({depth:d,draw:()=>{drawPlayer(s,bd.pose,bd.prev,pj,style,place,!!bd.smear);}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
/** the ball (the Al Rihla, printed paper with navy panels): shade crescent; squash along a direction */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:G,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
const BALL_MIN=40;

// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Ramos's flick) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replays (same world, slowed clock).
// Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const SHOT=.22,T_CROSS=-.8;
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

// Dalot zips down the right (the near touchline, −z) past Vargas and drives it low from just outside the box; Ramos drifts at the edge of
// the six-yard-box zone, checks away once, then darts across the near post in front of Cömert (positions inferred; the beats are reported)
const DALOT_P:MKey[]=[[-12,-48,-30.6],[-8,-37,-29.2],[-4,-23,-25.6],[-2,-16,-23.6],[T_CROSS,-11.6,-22.4],[0,-10.4,-21.8],[2,-9.6,-21.2]];
const DALOT_FOOT:V3=[-10.9,.11,-21.9];
const RAM_P:MKey[]=[[-12,-25,4.6],[-8,-19.6,3.8],[-4,-14.6,2.9],[-2.6,-12.6,2.1],[-1.9,-11.9,2.6],[-1.25,-10.4,1.5],[0,-4.8,-2.2],[.6,-3.7,-2.9],[1.4,-3.3,-4.4],[2.6,-3.6,-7.8],[4.5,-4.4,-13]];
const RAM_AT:[number,number]=[-4.8,-2.2];
const RAM_YAW=-.45;// his heading at the flick: toward the goal, turned a touch to his right (−z), into the ball
const COM_P:MKey[]=[[-12,-21.4,3.4],[-8,-17.6,2.9],[-4,-13,2.4],[-2.6,-11.3,1.6],[-1.9,-10.9,2.0],[-1.25,-9.5,1.6],[0,-5.9,-1.05],[1,-4.6,-1.6],[2,-4.3,-1.8]];
const VAR_P:MKey[]=[[-12,-45,-28.8],[-8,-35,-27.8],[-4,-24,-24.8],[-2,-17.6,-23.2],[T_CROSS,-13.4,-22.3],[0,-12.3,-21.6],[2,-11.8,-21]];
const KEEP_X=-.75;
const OTHERS:Mover[]=[
 {style:AKANJI,path:[[-12,-19,6.4],[-4,-11.8,5.8],[T_CROSS,-8,4.8],[0,-7,4.2],[2,-6.6,3.8]]},
 {style:SUI({number:13,hair:K,build:{height:1.8},seed:13}),path:[[-12,-20,11],[0,-8.6,9.6],[2,-8,9]]},// Rodriguez, far side
 {style:SUI({number:10,hair:K,build:{height:1.86,bulk:1.04},seed:10}),path:[[-12,-27,-4.5],[0,-15.4,-3.2],[2,-14,-2.8]]},// Xhaka
 {style:SUI({number:15,hair:K,skin:SKIN_D,seed:15}),path:[[-12,-31,-12.5],[0,-19.6,-12.4],[2,-18.4,-11.4]]},// Sow
 {style:SUI({number:2,hair:K,skin:SKIN_M,seed:21}),path:[[-12,-28,14.5],[0,-15.4,11],[2,-13.8,10.2]]},// Edimilson Fernandes
 {style:SUI({number:8,hair:K,seed:8}),path:[[-12,-35,6],[0,-23.4,4],[2,-21.6,3.6]]},// Freuler
 {style:SUI({number:23,hair:K,build:{height:1.69,bulk:1.08},seed:23}),path:[[-12,-46,-8],[0,-34,-10],[2,-32,-10]]},// Shaqiri
 {style:SUI({number:7,hair:K,skin:SKIN_D,build:{height:1.85,bulk:1.06},seed:27}),path:[[-12,-53,2],[0,-44,0],[2,-42,0]]},// Embolo
 {style:POR({number:11,hair:K,seed:31}),path:[[-12,-30,4],[-3,-16,5.6],[0,-10.4,7.4],[2,-8.8,7]]},// Félix, far post
 {style:POR({number:8,hair:K,build:{height:1.79},seed:32}),path:[[-12,-33,-6.5],[0,-18.6,-6.8],[2,-16.6,-6]]},// Bruno Fernandes
 {style:POR({number:25,hair:K,skin:SKIN_M,build:{height:1.72},seed:35}),path:[[-12,-37,4],[0,-22.4,2],[2,-20.4,1.6]]},// Otávio
 {style:POR({number:10,hair:K,build:{height:1.73,bulk:.94},seed:36}),path:[[-12,-41,-18],[0,-27,-17.4],[2,-25,-15.6]]},// Bernardo Silva
 {style:POR({number:14,hair:K,skin:SKIN_D,build:{height:1.87,bulk:1.05},seed:37}),path:[[-12,-55,-4],[0,-45,-4],[2,-43,-4]]},// Carvalho
 {style:REF,path:[[-12,-45,-10],[0,-27.5,-5.6],[3,-23,-6]]},// referee (César Ramos)
];

// ---- Ramos: drift, check, the dart, the first-time flick with his RIGHT foot (contact τ = 0), away to celebrate ----
const flickPose=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+tau/1.05),{foot:'r',power:.35});
function ramosState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(RAM_P,tau),v=Math.hypot(q.vx,q.vz),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/7)});
 let pose=A.blendPose(A.stand(),run,clamp((v-.3)/1.2));
 // eyes on Dalot as he shapes to cross: the head turns to his right (−z) and back to the ball
 const look=sm(T_CROSS-1.3,T_CROSS-.6,tau)*(1-sm(T_CROSS+.2,-.3,tau));pose={...pose,neckY:pose.neckY-.7*look};
 const w=sm(-.42,-.24,tau)*(1-sm(.55,.95,tau));
 if(w>0)pose=A.blendPose(pose,flickPose(tau),w);
 // then away toward the near corner, arms out (inferred)
 if(tau>.9){const u=easeInOutSine(sm(.9,1.6,tau));pose=A.blendPose(pose,A.celebrate((tau-.9)*1.2,{kind:'run'}),u);}
 const head=v>.2?Math.atan2(q.vz,q.vx):RAM_YAW,yaw=angLerp(angLerp(head,RAM_YAW,sm(-.45,-.25,tau)),head,sm(.6,1.1,tau));
 return{x:q.x,z:q.z,yaw,pose};}
/** the ball on the instep of his RIGHT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sk=A.solve(flickPose(0),RB,{x:RAM_AT[0],z:-RAM_AT[1],yaw:RAM_YAW}),m=mix3(sk.rAn,sk.rToe,.7);return[m[0],.11,-m[2]];})();
/** where it crosses the line: low, just inside the near post, having gone between Sommer's feet (inferred height and spot) */
const NETPT:V3=[.25,.16,-1.95];
/** the ball on τ: Dalot's run down the right → the driven low cross → the flick → through the keeper's legs → the net */
function ballT(tau:number):V3{
 if(tau<T_CROSS-.25){const q=moverPos(DALOT_P,tau),v=Math.hypot(q.vx,q.vz)||1,ph=Math.sin(tau*8)*.16;return[q.x+q.vx/v*(.6+ph),.11,q.z+q.vz/v*(.6+ph)];}
 if(tau<T_CROSS){const a=ballT(T_CROSS-.2501),u=sm(T_CROSS-.25,T_CROSS,tau);return mix3(a,DALOT_FOOT,u);}
 if(tau<0){const u=(tau-T_CROSS)/-T_CROSS,p=mix3(DALOT_FOOT,CONTACT,u);p[1]=.11+.26*Math.sin(Math.PI*u)*(1-u*.4);return p;}
 if(tau<SHOT)return mix3(CONTACT,NETPT,tau/SHOT);
 const s=tau-SHOT,u=clamp(s/.1);if(u<1)return mix3(NETPT,[1.6,.2,-1.7],u);
 const d=clamp((s-.1)/.6),e=s-.7,bounce=d>=1?.08*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[1.6-.4*d,.11+.09*(1-d)+bounce,-1.7+.2*d];}
/** the ball's height where it passes the keeper's line (for the legs check in the test notes) */
const KEEP_Z=lerp(CONTACT[2],NETPT[2],(KEEP_X-CONTACT[0])/(NETPT[0]-CONTACT[0]));
/** Sommer: a step off his near post as Dalot crosses, set, then he goes down too late as it squeezes between his feet */
function keeperState(tau:number){const z=lerp(-.4,KEEP_Z,sm(-4,T_CROSS+.2,tau,easeInOutSine));
 let pose=A.keeperSet(((tau*1.4)%1+1)%1);
 pose=A.blendPose(pose,A.keeperScoop(clamp((tau-.12)/.8)),sm(.14,.42,tau));
 return{x:KEEP_X,z,yaw:angLerp(Math.PI,Math.atan2(-21.9-z,-10.9-KEEP_X),.45*(1-sm(T_CROSS+.2,-.1,tau))),pose};}
/** Dalot: runs with it down the right, then drives it across with his RIGHT foot (inferred foot) */
function dalotState(tau:number,ball:V3){const st=moverState(DALOT_P,tau,ball),w=sm(T_CROSS-.55,T_CROSS-.3,tau)*(1-sm(T_CROSS+.45,T_CROSS+.9,tau));
 if(tau<T_CROSS-.5)st.pose=A.blendPose(st.pose,A.dribble(((tau*2.3)%1+1)%1,{foot:'r',speed:.75}),.55);
 const heading=Math.atan2(CONTACT[2]-DALOT_FOOT[2],CONTACT[0]-DALOT_FOOT[0])-.3;
 return{...st,yaw:angLerp(st.yaw,heading,w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_CROSS)/1.1),{foot:'r',power:.85}),w)};}
/** Vargas: chasing Dalot, a block that comes too late */
function vargasState(tau:number,ball:V3){const st=moverState(VAR_P,tau,ball),w=sm(T_CROSS-.4,T_CROSS,tau)*(1-sm(T_CROSS+.6,T_CROSS+1.2,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(T_CROSS-.4,T_CROSS,tau)),{side:'l'}),w)};}
/** Cömert: tracks Ramos goal-side, then stretches a leg as Ramos steps in front of him, too late */
function comertState(tau:number,ball:V3){const st=moverState(COM_P,tau,ball),w=sm(-.35,-.05,tau)*(1-sm(.7,1.3,tau));
 return{...st,pose:A.blendPose(st.pose,A.lunge(clamp(.6*sm(-.35,0,tau)),{side:'r'}),w)};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean;hero?:boolean}[]=[];
  out.push({...dalotState(t,b),style:DALOT,smear:t>T_CROSS-.2&&t<T_CROSS+.25,hero:true},{...vargasState(t,b),style:VARGAS},{...comertState(t,b),style:COMERT,hero:true});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...ramosState(t),style:RAMOS,smear:t>-1.25&&t<.3,hero:true},{...keeperState(t),style:KEEPER,hero:true});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number):Item{return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,q[0],q[1],r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** the net ripple: a travelling ring pushed out from where the ball hits (low, near-post side) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-.25,p[2]+1.7)+Math.abs(p[0]-1.6)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.15,p[2]];};
/** a dashed line (replay and lesson marks), drawn on by g */
function dashed(s:Sheet,pts:Pt[],g:number,w:number,ink=Y,ko=false){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);const n=Math.max(2,Math.round(pts.length*g));const q=pts.slice(0,n);if(q.length<2)return;const r=ribbon(q,w,{taper:.2,pressure:.2,wobble:1,gaps});if(ko)s.knockout(r,.95);s.fill(ink,r,.95);}
/** a ring mark on the grass: knocked out to paper first, so a yellow mark reads on the yellow-green grass */
function ringMark(s:Sheet,pts:Pt[],w:number,ink=Y,cov=.95){if(pts.length<3)return;const r=ribbon([...pts,pts[0],pts[1]],w,{taper:0,pressure:0,wobble:.6});s.knockout(r,cov);s.fill(ink,r,cov);}
const ring=(x:number,y:number,rx:number,ry:number,n=24)=>polyPath(Array.from({length:n},(_,i)=>{const a=i/n*TAU;return[x+Math.cos(a)*rx,y+Math.sin(a)*ry] as Pt;}),true);
/** a ring lying on the grass (radius metres) */
function groundRing(c:Cam,x:number,z:number,r:number,n=24):Pt[]{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.03,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];pts.push(P(c,p));}return pts;}

// ---------------- chapter 1 (live, real time): the high main-stand camera pans with Dalot down the right; the cross; the dart; the net ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.min(T(0,'flicks it in')+.2,end-SHOT-1.6);return{TL,end};};
const BCAM:V3=[-30,19,-80];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<T_CROSS){const w=sm(T_CROSS-3,T_CROSS,tau);return[lerp(b[0],-10,.15+.3*w),1.2,lerp(b[2]+12,-4,.25+.35*w)];}
 const w=sm(T_CROSS,-.2,tau,easeInOutSine),mid:V3=[lerp(b[0],-8,.3),1.2,lerp(b[2]+8,-4,.3)];return mix3(mid,[-5,1,-1],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,3700],[-8,3800],[-3,4100],[T_CROSS,4600],[0,6200],[.8,6400],[1.8,5400],[4,4900]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-SHOT;
  frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.3+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9.4,
};

// ---------------- chapter 2 (TV replay, slow motion, a low camera on the far side of the box): he keeps moving and gets in front ----------------
const ch2T=()=>({slow:T(1,'slowly'),km:T(1,'keep moving'),front:T(1,'gets in front'),post:T(1,'near post'),end:SEC(1)});
/** replay clock: from his drift at the edge of the zone, slowed; the check-away on "keep moving"; the dart on "gets in front"; ends a
 * breath before the touch (chapter 3 shows it) */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono<[number,number]>([[0,-4],[q.slow,-3.3],[q.km,-2.4],[q.front,-1.25],[q.post,-.5],[q.end,-.12]]) as unknown as Key[],x=>x);};
const CAM2:V3=[-22,6.5,15];
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballT(tau),m=ramosState(tau),head:V3=[m.x,1.2,m.z];
 const w=key(t,mono<[number,number]>([[0,.97],[q.km,.97],[q.front,.9],[q.post,.8],[q.end,.75]]) as unknown as Key[]);
 const F=key(t,mono<[number,number]>([[0,2900],[q.km,3200],[q.front,3000],[q.post,2800],[q.end,2900]]) as unknown as Key[]);
 const lk=mix3(b,head,w);lk[1]=Math.min(lk[1],2);return makeCam(CAM2,lk,F);}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.004,tau2(tt)-tau2(tt-1/12)));
  frame(s);
  stadium(s,c,{t,cheer:.15,flash:0});
  const q=ch2T();
  // his dart, as a yellow dashed run on the grass from where he checked away to the near post (drawn on from "gets in front")
  const runG=sm(q.front-.1,q.post,tt,easeOut);
  if(runG>.02){const a=moverPos(RAM_P,-1.9),pts:Pt[]=[];for(let i=0;i<=16;i++){const u=i/16,p:V3=[lerp(a.x,RAM_AT[0],u),.03,lerp(a.z,RAM_AT[1],u)-.5*Math.sin(u*Math.PI)];pts.push(P(c,p));}dashed(s,pts,runG,Math.max(9,.22*kAt(c,[RAM_AT[0],0,RAM_AT[1]])),Y,true);}
  // the near post target: a yellow ring on the grass where the cross and the run meet
  const rg=sm(q.post-.1,q.post+.35,tt,easeOutBack);
  if(rg>.02)ringMark(s,groundRing(c,CONTACT[0],CONTACT[2],.9*rg),Math.max(7,.14*kAt(c,CONTACT)));
  // the defender who can't settle: a red ring under Cömert's feet while he is caught flat (from "keep moving")
  const cg=sm(q.km,q.km+.4,tt,easeOut)*(1-sm(q.post,q.post+.5,tt));
  if(cg>.02){const cm=moverPos(COM_P,tau);ringMark(s,groundRing(c,cm.x,cm.z,.7),Math.max(6,.1*kAt(c,[cm.x,0,cm.z])),R,.9*cg);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
 },
 aperture(t){const c=ch2Cam(t),m=ramosState(tau2(t)),p:V3=[m.x,1.2,m.z],[x,y]=P(c,p),r=Math.max(40,.9*kAt(c,p));return apertureDisc(x,y,r,12);},
 still:6.2,
};

// ---------------- chapter 3 (reverse replay from behind the goal, through the net): one touch, between the keeper's feet, the roar ----------------
const ch3T=()=>{const HIT=Math.ceil((T(2,'one touch')+.2)*12)/12;// on the twos grid so the drawn flick meets the ball
 return{from:T(2,'From behind'),HIT,sq:T(2,'squeezes through'),lead:T(2,'Portugal lead'),end:SEC(2)};};
/** replay clock: the cross in flight, ×~4 slow to the touch on "one touch", the ball through the legs on "squeezes through", then real time */
const tau3=(t:number)=>{const q=ch3T(),tm=Math.max(q.sq+.25,q.HIT+.6),tn=Math.max(q.lead,tm+.4);
 return key(t,mono<[number,number]>([[0,T_CROSS+.1],[q.HIT,0],[tm,SHOT*.9],[tn,SHOT+.35],[tn+1,SHOT+1.35],[tn+10,SHOT+10]]) as unknown as Key[],x=>x);};
const CAM3:V3=[8.5,2.1,2.6];
function ch3Cam(t:number){const q=ch3T(),tm=Math.max(q.sq+.25,q.HIT+.6);
 return camKeysOf(t,mono<CK>([[0,...CAM3,-9,.9,-10,3300],[q.HIT-.4,...CAM3,-5.2,.6,-3.2,4000],[q.HIT,...CAM3,-4,.5,-2.4,4300],[tm,...CAM3,-2,.4,-2,4500],[q.lead,...CAM3,-3.4,.9,-3,3700],[q.lead+1.2,8.5,2.4,2.6,-4,1.4,-9,2600],[q.end,8.5,2.5,2.6,-4.4,1.6,-12,2500]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.004,tau3(tt)-tau3(tt-1/12)));
  const shake=t>=q.HIT?5*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-SHOT,roar=sm(q.lead-.2,q.lead+.4,tt,easeOut);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,cheer:.2+roar*1.1,flash:.2+roar*1.4,net,noGoal:true});
  // the gap: a yellow dashed line from the boot, between the keeper's feet, to the net (on "squeezes through")
  const g=sm(q.sq-.15,q.sq+.35,tt,easeOut)*(1-sm(q.lead+.2,q.lead+.8,tt));
  if(g>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push(P(c,mix3([CONTACT[0],.04,CONTACT[2]],[NETPT[0],.04,NETPT[2]],u)));}dashed(s,pts,g,Math.max(8,.1*kAt(c,CONTACT)),Y,true);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
  // the touch: a yellow spark off the right boot
  if(tau>-.01&&tau<.1){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],50+200*clamp((tau+.01)/.11),{n:9,seed:84,g:1-clamp(tau/.1),width:10});}
  // the goal frame and the net between us and the play (we are behind the goal)
  goal(s,c,net,true);
 },
 aperture(t){const c=ch3Cam(t),l:V3=[-10,14,-50],[x,y]=P(c,l),r=clamp(8*kAt(c,l),40,300);return apertureDisc(x,y,r,12);},
 still:4.6,
};

// ---------------- chapter 4 (duotone lesson drill): keep moving so the defender can't settle; then dart in front and hit it first time ----------------
const CAM4P:V3=[-9.5,3.4,11.5];
const SDUO:A.AthleteStyle={...RAMOS,shirt:[K,.8],shorts:'paper',socks:'paper',hair:K,skin:[[Y,.62],[K,.26]],shade:[K,.2],trim:K,numberInk:'paper',number:9,detail:'high'};
const DDUO:A.AthleteStyle={...COMERT,shirt:'paper',shorts:[K,.5],socks:[K,.5],hair:K,skin:[[Y,.62],[K,.26]],shade:[K,.2],trim:K,numberInk:K,number:5,detail:'high'};
const ch4T=()=>{const yt=T(3,'Your turn'),km=T(3,'keep moving'),wy=T(3,'When you'),df=T(3,'defender'),st=T(3,'settle'),hit=T(3,'Then hit it'),ft=T(3,'first time');
 const CT=Math.max(ft+.35,hit+1.3);return{yt,km,wy,df,st,hit,ft,CT,end:SEC(3)};};
/** the striker's drill path (x,z) by chapter time: stand, sway away and back (keep moving), then the dart to the near post at CT */
function strikerAt(t:number):[number,number]{const q=ch4T();
 const K0=mono<[number,number,number]>([[0,-10.4,1.6],[q.km,-10.4,1.6],[q.km+.8,-11.5,2.4],[q.km+1.7,-9.9,.9],[q.km+2.6,-11.4,2.1],[q.km+3.5,-10.1,1.1],[q.hit-.1,-11,1.8],[q.CT,-4.8,-2.2],[q.CT+.8,-3.6,-3.2],[q.CT+2.5,-3.4,-5]]);
 const v=key(t,K0 as unknown as Key[],easeInOutSine,true);return[v[0],v[1]];}
/** the defender tries to sit goal-side next to him, always half a second late (he can't settle) */
function defenderAt(t:number):[number,number]{const q=ch4T(),a=strikerAt(t-.5),w=sm(q.CT-.4,q.CT,t);return[lerp(a[0]+1.1,-5.9,w),lerp(a[1]-.5,-1.05,w)];}
function drillBody(t:number,who:'s'|'d',ball:V3){const q=ch4T(),at=who==='s'?strikerAt:defenderAt,p=at(t),p0=at(t-.1),vx=(p[0]-p0[0])/.1,vz=(p[1]-p0[1])/.1,v=Math.hypot(vx,vz);
 let pose=A.blendPose(A.stand(),A.runCycle(((t*1.45)%1+1)%1,{speed:clamp(v/7)}),clamp((v-.3)/1.4));
 let yaw=Math.atan2(ball[2]-p[1],ball[0]-p[0]);
 if(v>1.5)yaw=angLerp(yaw,Math.atan2(vz,vx),clamp((v-1.5)/2));
 if(who==='s'){const w=sm(q.CT-.42,q.CT-.24,t)*(1-sm(q.CT+.55,q.CT+.95,t));if(w>0){pose=A.blendPose(pose,flickPose(t-q.CT),w);yaw=angLerp(yaw,RAM_YAW,w);}}
 else{const w=sm(q.CT-.35,q.CT-.05,t)*(1-sm(q.CT+.7,q.CT+1.2,t));if(w>0)pose=A.blendPose(pose,A.lunge(clamp(.45*sm(q.CT-.35,q.CT,t)),{side:'r'}),w*.8);}
 return{x:p[0],z:p[1],yaw,pose};}
/** the drill ball: waits out on the right, the low cross starts .8 s before CT, the flick, into the net */
const D_FOOT:V3=[-10.5,.11,-15];
const FDUO:A.AthleteStyle={...SDUO,number:2,seed:3,detail:'mid'};
/** the drill's crosser (a teammate in the navy bib) on the right: a right-footed low cross .8 s before CT */
function feederState(t:number){const q=ch4T(),t0=q.CT-.8,w=sm(t0-.55,t0-.3,t)*(1-sm(t0+.45,t0+.9,t)),yaw=Math.atan2(CONTACT[2]-D_FOOT[2],CONTACT[0]-D_FOOT[0])-.3;
 return{x:D_FOOT[0]-.55,z:D_FOOT[2]-.35,yaw,pose:A.blendPose(A.stand(),A.strike(clamp(A.STRIKE_CONTACT+(t-t0)/1.1),{foot:'r',power:.8}),w)};}
function drillBall(t:number):V3{const q=ch4T(),t0=q.CT-.8;
 if(t<t0)return D_FOOT;
 if(t<q.CT){const u=(t-t0)/.8,p=mix3(D_FOOT,CONTACT,u);p[1]=.11+.26*Math.sin(Math.PI*u)*(1-u*.4);return p;}
 const s2=t-q.CT;if(s2<SHOT)return mix3(CONTACT,NETPT,s2/SHOT);const u=clamp((s2-SHOT)/.1);return mix3(NETPT,[1.6,.2,-1.7],u);}
/** the drill camera: a fixed spot, panning (on ones) to keep the pair centred, then over to the near post for the finish */
function ch4Cam(t:number){const q=ch4T(),pair=(u:number)=>{const a=strikerAt(u),d=defenderAt(u);return[(a[0]+d[0])/2,(a[1]+d[1])/2];};
 const m=[0,.25,.5].map(o=>pair(t-o)),mx=(m[0][0]+m[1][0]+m[2][0])/3,mz=(m[0][1]+m[1][1]+m[2][1])/3,w=sm(q.hit,q.CT+.2,t,easeInOutSine);
 const F=key(t,mono<[number,number]>([[0,3300],[q.km,2800],[q.hit,2600],[q.CT,2500],[q.end,2600]]) as unknown as Key[]);
 return makeCam(CAM4P,[lerp(mx,-3.6,w),.95,lerp(mz,-1.8,w)],F);}
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),c=ch4Cam(t),b=drillBall(tt);
  frame(s);
  // the drill stage: navy field, a yellow pool of light on the grass, paper box lines and the goal
  s.field(K,.75,.5);
  const pad=new Path2D();addPoly(pad,clipPoly(c,[[-22,0,-24],[3,0,-24],[3,0,16],[-22,0,16]]));s.knockout(pad,.55);s.tone(Y,pad,.22);
  const pool=new Path2D();addPoly(pool,groundRing(c,-7.5,0,7,32));s.tone(Y,pool,.3);
  const lines=new Path2D();boxLines(lines,c,false);s.knockout(lines,.9);
  goal(s,c,undefined);
  // "keep moving": his sway as a yellow dashed trail behind him (from "keep moving" until the dart)
  const tg=sm(q.km,q.km+.5,tt,easeOut)*(1-sm(q.hit+.4,q.hit+1,tt));
  if(tg>.02){const pts:Pt[]=[];for(let i=0;i<=20;i++){const u=lerp(q.km,Math.min(tt,q.hit),i/20),p=strikerAt(u);pts.push(P(c,[p[0],.03,p[1]]));}dashed(s,pts,1,Math.max(8,.16*kAt(c,[-10,0,1.5])),Y);}
  // "can't settle": a navy ring under the defender that keeps sliding off his feet
  const dg=sm(q.df,q.df+.3,tt,easeOutBack)*(1-sm(q.hit,q.hit+.5,tt));
  if(dg>.02){const d=defenderAt(tt),wob=.12*Math.sin(tt*9),r=groundRing(c,d[0]+wob,d[1],.75*dg);if(r.length)s.stroke(K,polyPath(r,true),Math.max(6,.12*kAt(c,[d[0],0,d[1]])),.9);}
  // "then hit it": the dart as a yellow arrow to a ring at the near post
  const ag=sm(q.hit-.1,q.hit+.6,tt,easeOut)*(1-sm(q.CT+.4,q.CT+.9,tt));
  if(ag>.02){const a=strikerAt(q.hit-.1),pts:Pt[]=[];for(let i=0;i<=14;i++){const u=i/14;pts.push(P(c,[lerp(a[0],RAM_AT[0],u),.03,lerp(a[1],RAM_AT[1],u)-.5*Math.sin(u*Math.PI)]));}dashed(s,pts,ag,Math.max(9,.2*kAt(c,[RAM_AT[0],0,RAM_AT[1]])),Y);
   const r=groundRing(c,CONTACT[0],CONTACT[2],.8*ag);if(r.length)s.stroke(Y,polyPath(r,true),Math.max(6,.12*kAt(c,CONTACT)),.95);}
  const pj=projector(c),bodies:Item[]=[];
  {const f=feederState(tt),fp=feederState(tt-1/12),g:V3=[f.x,0,f.z];bodies.push({depth:depthOf(c,g),draw:()=>{drawPlayer(s,f.pose,fp.pose,pj,FDUO,{x:f.x,z:-f.z,yaw:f.yaw});}});}
  for(const who of ['s','d'] as const){const st=who==='s'?SDUO:DDUO,now=drillBody(tt,who,b),prev=drillBody(tt-1/12,who,drillBall(tt-1/12)),g:V3=[now.x,0,now.z];
   bodies.push({depth:depthOf(c,g),draw:()=>{drawPlayer(s,now.pose,prev.pose,pj,st,{x:now.x,z:-now.z,yaw:now.yaw},who==='s'?tt>q.hit&&tt<q.CT+.3:false);}});}
  bodies.push({depth:depthOf(c,b),draw:()=>{const p=P(c,b),r=Math.max(34,BALL_R*kAt(c,b)),a=P(c,drillBall(tt-.03)),dir=Math.atan2(p[1]-a[1],p[0]-a[0]),sp=Math.hypot(p[1]-a[1],p[0]-a[0]);ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,p[0],p[1],r,tt*6,{sq:clamp(sp/(r*6),0,.35),dir,duo:true});}});
  bodies.sort((x,y)=>y.depth-x.depth).forEach(i=>i.draw());
  if(tt>=q.CT&&tt<q.CT+.3){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],110+120*sm(q.CT,q.CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(q.CT+.12,q.CT+.3,tt),width:14});}
  if(tt>=q.CT&&tt<q.CT+.45){const p=P(c,b),a=P(c,CONTACT);speedLines(s,K,p[0],p[1],Math.atan2(p[1]-a[1],p[0]-a[0]),{n:5,seed:42,len:200,width:9,cov:.85});}
 },
 still:5.4,
};

const story:RisoStory={
 id:'goncalo-ramos-signature',format:'11v11',title:"Gonçalo Ramos's first-time finish",
 theme:"Keep moving in the box so the defender can't settle next to you.",
 ageNote:'World Cup round of 16, Portugal 6–1 Switzerland, Lusail Stadium, Qatar, 6 December 2022 (51st minute).',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
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
