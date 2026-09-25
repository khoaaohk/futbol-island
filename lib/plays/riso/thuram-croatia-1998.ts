/** Lilian Thuram v Croatia, World Cup semi-final, Stade de France, Saint-Denis, 8 July 1998 (France 2–1 Croatia): the right-back's two goals —
 * the only two he ever scored for France (142 caps). An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written
 * accounts (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (read Sept 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "1998 FIFA World Cup knockout stage" (France vs Croatia: 8 July 1998, 21:00 CEST, Stade de France, Saint-Denis, 76,000,
 *    referee José María García-Aranda (Spain); Šuker 46', Thuram 47', 70'; line-ups and numbers: Thuram RB 15, Djorkaeff 6, Zidane 10,
 *    Guivarc'h 9 (off 68' for Trezeguet 20), Henry 12 (on 31' for Karembeu), Blanc 5 (sent off 74'); Croatia GK Ladić 1, Bilić 6, Štimac 4,
 *    Šimić 20, Jarni 17 (left wing-back), Stanić 13, Soldo 14, Asanović 7, Boban 10 (captain, off 65' for Marić 11), Vlaović 19, Šuker 9)
 *    https://en.wikipedia.org/wiki/1998_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Lilian Thuram" (at fault for Croatia's opening goal, then a brace, "his only two international goals"; man of the match)
 *  - Wikipédia (fr), "Match de football France – Croatie (1998)" (47': "il récupère un ballon dans les pieds de Boban à l'entrée de la surface
 *    de réparation croate, sollicite le une-deux, dans l'axe, avec Djorkaeff"; 70': "une nouvelle montée sur son côté droit… une-deux avec
 *    Thierry Henry… récupère le ballon dans la foulée à l'entrée de la surface et tente un tir du pied gauche… une somptueuse frappe enroulée
 *    au ras du poteau"; "Il s'agenouille et met son doigt devant son menton"; Deschamps told him at half-time to push up)
 *  - Bruno Colombari, "8 juillet 1998 : France-Croatie", chroniquesbleues.fr (8 July 2020) (KIT: "les Français jouent en bleu-bleu-rouge, la
 *    Croatie évoluant pour sa part en maillot blanc à damier rouge, short blanc et chaussettes blanches"; Šuker scored "24 secondes" into the
 *    half; 47': Thuram "chipe un ballon dans les pieds de Boban à l'entrée de la surface adverse jusqu'à Djorkaeff qui a l'inspiration géniale
 *    de lui remettre instantanément dans la course… en position d'avant-centre, qui bat Ladic d'un plat du pied en déséquilibre"; 70': "sur une
 *    transversale de Zidane, cette percussion dans le couloir droit avec Henry, ce ballon arraché à Jarni et l'enchaînement intérieur du gauche
 *    au second poteau"; "Thuram avance sur l'aile droite… appelle Henry, trouve le une-deux, perd le ballon, le reprend dans les pieds de Jarni,
 *    et du gauche à l'entrée de la surface il enroule un amour d'intérieur du pied qui contourne Ladic et finit près du second poteau";
 *    celebration "à genoux, l'air préoccupé et deux doigts sur la bouche")  https://www.chroniquesbleues.fr/8-juillet-1998-France-Croatie
 * CONFIRMED by those pages: date, venue, crowd, referee, score and minutes; Croatia scored at the very start of the second half and Thuram
 *  equalised one minute later; goal 1: Thuram, pushed up on the right, took the ball off Boban's feet at the edge of the Croatian area, played
 *  a one-two with Djorkaeff through the middle, who returned it first time into his run, and Thuram, now in the centre-forward's spot, beat
 *  Ladić with a side-foot finish while off balance; goal 2: Zidane's cross-field pass, Thuram's run down the right channel, a one-two with
 *  Henry, he lost the ball, won it back from Jarni's feet, and from the edge of the area curled a LEFT-footed inside-of-the-foot shot round
 *  Ladić, in near the far post; the kneeling, finger-to-chin "thinking" celebration; his only two goals for France; France reached their first
 *  World Cup final. KIT: France all blue with red socks (blue shirt, blue shorts, red socks); Croatia white shirts with red checks, white
 *  shorts, white socks. Numbers above.
 * INFERRED (illustrative): every position, speed and timing in metres and seconds between those beats; the direction of play on screen
 *  (France attack to the right, so Thuram's right wing is the near touchline under the main camera); the foot of the first finish (the
 *  right, side-foot) and where it went in (low, to Ladić's right); the height of the curler (low to mid, near the far post) and the exact bend;
 *  Ladić's movements and dives; Boban's and Jarni's reactions; Henry's position for the one-two; the other players' positions (Zidane's pass
 *  starts off screen); which knee Thuram knelt on and which hand (left knee down, right index finger to his chin); where he knelt and which
 *  way he faced; the goalkeeper's kit (yellow) and the referee's black kit; France's white numbers; the night sky (sunset in Paris on 8 July is
 *  about 21:55, so the second half is played in the last light under the floodlights); the Stade de France's shape as drawn (an oval bowl of
 *  three tiers with a band of boxes under a floating oval roof lit along its inner edge), the crowd colours and tricolour flags, the boards,
 *  the scoreboard graphic, the camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; never top-down): 1 = the high main-stand camera,
 * live, near real time, both goals (a broadcast cut between them) with a riso score graphic; 2 = TV slow-motion replay of the second goal from a
 * low camera that swings from the near touchline to behind his left shoulder (the ball won back from Jarni, the left foot, the curl round
 * Ladić into the far corner); 3 = a low front camera on the celebration (the kneel, the finger to the chin, the thinker's dots); 4 = the lesson
 * from a raised camera behind the first goal (a defender wins the ball high and joins the attack; reply straight away after conceding). Every
 * figure is the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Each goal is one simulation on its
 * own clock τ (seconds; goal 1: τ = 0 the steal from Boban; goal 2: τ = 0 the ball won back from Jarni). Scenes read only (t); every action
 * keys off cue times, so the recorded voice (VOICE → withTiming) re-times the film; every random value is seeded. Inks: yellow, red, blue, navy. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,glowDisc} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets (≈3 words/s plus pauses), replaced by the measured Kokoro onsets once timing.json exists. `seconds` includes the
 * silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/3+(/[.!?]$/.test(w)?.32:/[,;:]$/.test(w)?.14:/\.\.\.$/.test(w)?.4:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`thuram film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py thuram-croatia-1998, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/thuram-croatia-1998/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-thuram-croatia-1998.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/thuram-croatia-1998/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Two goals, live',"France v Croatia, 1998. Croatia score first! Straight away, right-back Lilian Thuram wins the ball, plays a one-two with Djorkaeff, and scores! Then he steals it again and curls it in... goal!",
  ['France v Croatia','Croatia score first','Straight away','Lilian Thuram','wins the ball','one-two','and scores','Then he steals','curls it in','goal']),
 prov('Watch again','Watch again, slowly. He wins the ball back, then curls it with his left foot, round the keeper, into the far corner.',
  ['Watch again','He wins','the ball back','curls it','left foot','round the keeper','far corner']),
 prov('The thinker','His only two goals for France! He kneels, finger on chin, like a thinker.',
  ['His only two goals','for France','He kneels','finger on chin','like a thinker']),
 prov('Your turn','Your turn: defenders can win the ball high and join the attack. If the other team scores, reply straight away!',
  ['Your turn','defenders','win the ball high','join the attack','If the other team scores','reply straight away']),
],VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('thuram: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys for key() made strictly increasing in time (the voice can squeeze two cues together) */
const mono=(K:number[][]):number[][]=>{let prev=-1e9;return K.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});};

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's arrival
 * scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number;vx:number;vy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60,vx:s.W/(2*z*s.arrival),vy:s.H/(2*z*s.arrival)});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (France attack +X, Croatia's goal line at 105), Y up, Z across (0 = the
 * middle, +34 = the near touchline under the main-stand camera, Thuram's right wing). A figure facing +X has its right side at +Z. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (the cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=16):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Stade de France: one oval bowl (three tiers, a band of boxes) under a floating oval roof
const CX=52.5,NS=60;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
/** tier profiles (d0, y0) → (d1, y1): the lower tier, the boxes band, the middle tier, the upper tier; the roof floats above on its needles */
const LOW=(b:number):[number,number]=>[2+19*b,1.6+10*b],MID=(b:number):[number,number]=>[23+11*b,15+9*b],UPP=(b:number):[number,number]=>[36+18*b,27+17*b];
type Bowl={low:V3[][];mid:V3[][];up:V3[][];box:V3[][];roof:V3[][];glass:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],mid:[],up:[],box:[],roof:[],glass:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.mid.push(Q(MID,0,1));o.up.push(Q(UPP,0,1));
  o.box.push([rim(a,21.5,11.8),rim(b,21.5,11.8),rim(b,23,15),rim(a,23,15)]);
  o.glass.push([rim(a,4,47),rim(b,4,47),rim(b,20,47.6),rim(a,20,47.6)]);
  o.roof.push([rim(a,20,47.6),rim(b,20,47.6),rim(b,58,46),rim(a,58,46)]);
  if(i%2===0)o.lamps.push(rim(a+(b-a)*.5,4.6,46.6));
  for(const [f,rows,sd] of [[LOW,7,0],[MID,5,4000],[UPP,7,8000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+sd,17);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** tricolour flags hung on the boxes band (vertical blue / white / red) and a few Croatia checker flags */
const FLAGS:{i:number;kind:0|1}[]=[{i:3,kind:0},{i:7,kind:0},{i:11,kind:1},{i:15,kind:0},{i:19,kind:0},{i:24,kind:0},{i:28,kind:1},{i:33,kind:0},{i:37,kind:0},{i:42,kind:0},{i:47,kind:1},{i:52,kind:0},{i:56,kind:0}];
/** everything behind the pitch: the last light in the sky above the roof opening, the bowl, the crowd (roar lifts the seat marks, flash =
 * photographers' flashes), the flags, the roof and its floodlight strip */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // late dusk: a deep blue field, a navy screen on top
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.55);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),mid=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),glass=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.mid[i],mid);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);add(BOWL.glass[i],glass);}
 // phone heat: one knockout for all three tiers (a knockout costs an op per plate), then the tier screens
 const tiers=new Path2D();tiers.addPath(low);tiers.addPath(mid);tiers.addPath(up);s.knockout(tiers);
 s.tone(B,low,.34);s.tone(K,low,.14);s.tone(B,mid,.4);s.tone(K,mid,.24);s.tone(B,up,.45);s.tone(K,up,.34);
 // the crowd: white shirts (paper), France blue, red, a few yellow, navy coats; roar lifts the marks
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,12),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.46?0:q.h<.66?1:q.h<.8?2:q.h<.86?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(B,inks[1],.9);s.fill(R,inks[2],.9);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.8);}
 // the boxes band (lit windows) and the flags hung on its front
 s.knockout(box);s.fill(K,box,.75);
 const fw=new Path2D(),fb=new Path2D(),fr=new Path2D();
 for(const F of FLAGS){const a=F.i/NS*TAU,b=(F.i+.7)/NS*TAU,q=(u:number,w:number):V3=>rim(lerp(a,b,u),lerp(21.4,22.9,w),lerp(11.9,14.6,w)),Q=(u0:number,u1:number)=>quadP(c,[q(u0,0),q(u1,0),q(u1,1),q(u0,1)],12);
  const all=Q(0,1);if(!all||!inView(v,all[0],200))continue;fw.addPath(polyPath(all,true));
  if(F.kind===0){const l=Q(0,.33),r=Q(.67,1);if(l)fb.addPath(polyPath(l,true));if(r)fr.addPath(polyPath(r,true));}
  else for(let k=0;k<4;k++){const g=Q(k/4,(k+.5)/4);if(g)fr.addPath(polyPath(g,true));}}
 s.knockout(fw);s.fill(B,fb,.95);s.fill(R,fr,.95);
 // the roof: its translucent inner band (a light screen) and the solid oval beyond; a floodlight strip all along the inner edge
 const cover=new Path2D();cover.addPath(glass);cover.addPath(roof);s.knockout(cover);s.tone(B,glass,.25);
 s.tone(K,roof,.62);s.tone(B,roof,.3);
 const lamps=new Path2D(),glows:[Pt,number][]=[];
 for(const P of BOWL.lamps){const d=toCam(c,P);if(d[2]<20)continue;const g=scr(c,d);if(!inView(v,g,200))continue;const w=c.F*2.6/d[2],h=c.F*.7/d[2];lamps.rect(g[0]-w/2,g[1]-h/2,w,h);if(glows.length<4&&!s._passage.pending)glows.push([g,Math.max(8,c.F*1.8/d[2])]);}
 s.knockout(lamps);s.fill(Y,lamps,.95);for(const [g,r] of glows)glowDisc(s,Y,g[0],g[1],r,{steps:2,glow:1,seed:Math.round(g[0])});
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround (the lower tier's moat), grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the far goal drawn later
 * from a camera behind or level with it, so the net sits in front of the keeper) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);
 if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);if(g.length>2)p.addPath(polyPath(g,true));s.tone(K,p,.3,undefined,'evenodd');s.tone(B,p,.24,undefined,'evenodd');}
 if(g.length<3)return;const gp=polyPath(g,true);
 s.fill(Y,gp,.95);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // boards: far touchline and behind both goals — navy with paper, red and blue panels
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D();
 for(const q of [polyP(c,[[-4,0,-36],[109,0,-36],[109,.9,-36],[-4,.9,-36]]),polyP(c,[[108.5,0,-34],[108.5,0,34],[108.5,.9,34],[108.5,.9,-34]]),polyP(c,[[-3.5,0,34],[-3.5,0,-34],[-3.5,.9,-34],[-3.5,.9,34]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.22,-35.95],[x+3.6,.22,-35.95],[x+3.6,.68,-35.95],[x,.68,-35.95]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-33+k*6.2,q=polyP(c,[[108.45,.22,z],[108.45,.22,z+3.6],[108.45,.68,z+3.6],[108.45,.68,z]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.9);const pan=new Path2D();pan.addPath(pn);pan.addPath(pr2);s.knockout(pan,.85);s.fill(R,pr2,.95);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 // the far (France) goal only when the camera can see it
 const g0=toCam(c,[0,1.2,0]);if(g0[2]>NEAR&&Math.abs(c.F*g0[0]/g0[2])<3000)goal3(s,c,0,-1,0,0,1);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0,o.ballY??1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.3,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const ya=1.9*(1-j/3),yb=1.9*(1-(j+1)/3);seg3(c,[back(z,ya),ya,z],[back(z,yb),yb,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[R,.75],[Y,.2]];
const SKIN_M:InkFill[]=[[R,.78],[Y,.3]];
const SKIN_D:InkFill[]=[[R,.8],[K,.3]];
/** France 1998 in the semi-final: "bleu-bleu-rouge" — blue shirt, blue shorts, red socks (confirmed); white numbers and trim inferred */
const FRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:R,boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Lilian Thuram, number 15: 1.85 m, powerful, close-cropped hair */
const THURAM_ST=FRA({number:15,skin:SKIN_D,hair:K,hairStyle:'short',build:{height:1.85,bulk:1.06,thighs:1.1},seed:15});
/** Croatia: white shirts with red checks (the checks are printed over the torso by checks(); far figures get a red screen), white shorts and
 * white socks (confirmed); red trim inferred */
const CRO=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:R,skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:3,...o,number:null});
/** Dražen Ladić: a yellow keeper's jersey (inferred), navy shorts */
const LADIC_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:[K,.5],sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.84},seed:51};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'balding',line:K,trim:'paper',build:{height:1.8},seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose and place one drawing earlier (secondary motion: the shirt hem trails); smear = the halftone echo + speed arcs.
 * Croatia's checks are printed over the torso after the body (a 4 × 5 grid that follows the spine and shoulders). */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;checks?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
 if(o.checks)checks(s,r);
 return r;
}
/** the Croatian checkerboard: red squares over the shirt, laid on a grid aligned with the spine (shoulders → hips) and the shoulder line */
function checks(s:Sheet,r:DrawResult){
 const j=r.joints,top:Pt=[(j.lSh[0]+j.rSh[0])/2,(j.lSh[1]+j.rSh[1])/2],bot:Pt=[(j.lHip[0]+j.rHip[0])/2,(j.lHip[1]+j.rHip[1])/2];
 const ax=bot[0]-top[0],ay=bot[1]-top[1],L=Math.hypot(ax,ay);if(L<3)return;const ux=ax/L,uy=ay/L,nx=-uy,ny=ux;
 const sw=Math.abs((j.rSh[0]-j.lSh[0])*nx+(j.rSh[1]-j.lSh[1])*ny),hw=Math.max(sw*.62,L*.3),t0=-L*.04,t1=L*1.08,cols=4,rows=5;
 const P=(i:number,k:number):Pt=>{const a=t0+(t1-t0)*k/rows,w=-hw+2*hw*i/cols,taper=1-.08*k/rows;return[top[0]+ux*a+nx*w*taper,top[1]+uy*a+ny*w*taper];};
 const p=new Path2D();for(let k=0;k<rows;k++)for(let i=0;i<cols;i++)if((i+k)%2===0)p.addPath(polyPath([P(i,k),P(i+1,k),P(i+1,k+1),P(i,k+1)],true));
 s.fill(R,p,.92);
}

// ---------------------------------------------------------------- one goal = one simulation: keyed actors, 50 Hz tables, the ball as legs
type Role='thu'|'fra'|'cro'|'gk'|'ref';
type Move={kind:'kick'|'lunge'|'dive';at:number;dur:number;side:'l'|'r';power?:number;height?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number,number];key?:boolean};
type Tab={X:number[];Z:number[];P:number[];D:number[]};
/** a ball leg: from a to b over [t0, t1]; lift = arc height (m); bend = sideways bow (m, + = to the left of travel) */
type Leg={t0:number;t1:number;a:V3;b:V3;lift?:number;bend?:number;ease?:(u:number)=>number};
type Game={A:Actor[];T:Tab[];T0:number;hero:number;legs:Leg[];carry:(tau:number)=>V3;net:V3;inNet:number;shot:number};
const DT=.02;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position, gait phase (stride grows with speed: jog ≈ 2.4 m per cycle, sprint ≈ 4.6 m) and distance */
function tables(A:Actor[],T0:number,T1:number):Tab[]{return A.map(a=>{const X:number[]=[],Z:number[]=[],P:number[]=[],D:number[]=[];let ph=0,d=0,px=0,pz=0;
 for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i){const dd=Math.hypot(x-px,z-pz),sp=dd/DT;ph+=dd/(2.2+2.4*clamp(sp/8));d+=dd;}X.push(x);Z.push(z);P.push(ph);D.push(d);px=x;pz=z;}return{X,Z,P,D};});}
const samp=(G:{T0:number},arr:number[],tau:number)=>{const u=clamp((tau-G.T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(G:Game,k:number,tau:number):[number,number]=>[samp(G,G.T[k].X,tau),samp(G,G.T[k].Z,tau)];
const velOf=(G:Game,k:number,tau:number):[number,number]=>{const a=posOf(G,k,tau-.08),b=posOf(G,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(G:Game,k:number,tau:number):[number,number]=>{const a=posOf(G,k,tau),b=posOf(G,k,tau-.3),d=posOf(G,k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headOf=(G:Game,k:number,tau:number)=>{const v=velOf(G,k,tau);return yawOf(v[0],v[1]);};
/** a boot spot: ahead of the body and a touch to the given side (right = +Z when facing +X) */
function bootAt(G:Game,k:number,tau:number,side:'l'|'r',yaw?:number):V3{const p=posOf(G,k,tau),y=yaw??headOf(G,k,tau),s=side==='r'?1:-1;return[p[0]+Math.cos(y)*.5+Math.sin(y)*.13*s,.11,p[1]-Math.sin(y)*.5+Math.cos(y)*.13*s];}
function ballOf(G:Game,tau:number):V3{
 const L=G.legs;if(tau<L[0].t0)return G.carry(tau);
 for(let i=0;i<L.length;i++){const g=L[i],next=L[i+1];if(next&&tau>=next.t0)continue;
  if(tau>=g.t1){// resting at the leg's end until the next leg starts (the last leg: dropped in the net, then settles)
   if(!next&&G.inNet<=g.t1){const e=tau-g.t1,fall=Math.max(.11,g.b[1]-4.9*e*e),hop=e>.5?.12*Math.abs(Math.sin((e-.5)*8))*Math.exp(-(e-.5)*4):0;return[g.b[0]+.9*easeOut(clamp(e/.6)),fall+hop,g.b[2]];}
   return g.b;}
  const u=clamp((tau-g.t0)/(g.t1-g.t0)),e=(g.ease??linear)(u),dx=g.b[0]-g.a[0],dz=g.b[2]-g.a[2],l=Math.hypot(dx,dz)||1,bw=(g.bend??0)*4*e*(1-e);
  return[lerp(g.a[0],g.b[0],e)+dz/l*bw,lerp(g.a[1],g.b[1],e)+(g.lift??0)*4*e*(1-e),lerp(g.a[2],g.b[2],e)-dx/l*bw];}
 return L[L.length-1].b;}
const bulgeOf=(G:Game,tau:number)=>tau<G.inNet?0:Math.exp(-(tau-G.inNet)*2.2)*(1+.3*Math.sin((tau-G.inNet)*14));

// ---------------------------------------------------------------- goal 1 (47'): the steal from Boban, the one-two with Djorkaeff, the side-foot finish
const SHOT_A=2.2;
const ACT_A:Actor[]=[
 {name:'Thuram',role:'thu',style:THURAM_ST,key:true,engage:[1,-3,0],moves:[{kind:'kick',at:.55,dur:.7,side:'r',power:.35},{kind:'kick',at:SHOT_A,dur:.8,side:'r',power:.45}],
  keys:[[-4,74,20.5],[-3,76.2,19.5],[-2,78.8,18],[-1,81.6,16.4],[-.4,83.2,15.4],[0,84,14.9],[.3,84.8,14.2],[.55,85.6,13.5],[1,88.3,10.8],[1.5,91,7.8],[1.9,92.8,5.9],[SHOT_A,93.9,4.9],[2.5,94.8,4.4],[3,95.6,4.8],[3.8,96.4,7.2],[5,97,11],[7,97,16]]},
 {name:'Boban',role:'cro',style:CRO({number:10,hairStyle:'balding',seed:31}),key:true,keys:[[-4,89.5,11.5],[-3,88.6,12.3],[-2,87.4,13.2],[-1,86.2,14.2],[-.4,85.5,14.9],[0,85.1,15.3],[.4,85,15.8],[1,85.6,16],[2.5,87.5,14.5],[7,90,11]]},
 {name:'Djorkaeff',role:'fra',style:FRA({number:6,skin:SKIN_M,seed:36}),key:true,moves:[{kind:'kick',at:1.05,dur:.6,side:'r',power:.3}],keys:[[-4,80,3],[-2,83,4.2],[0,86.4,5.4],[.6,88,5.8],[1.05,88.6,5.7],[1.5,89.6,5],[2.2,91.5,3.2],[3,94,2],[5,96,6],[7,96.5,12]]},
 {name:'Ladić',role:'gk',style:LADIC_ST,key:true,moves:[{kind:'dive',at:SHOT_A+.3,dur:.8,side:'r',height:.08}],keys:[[-4,103.2,1],[1,102.6,1.6],[1.8,101.8,2.4],[SHOT_A,101.3,2.8],[7,101.3,2.8]]},
 {name:'Bilić',role:'cro',style:CRO({number:6,build:{height:1.9},seed:32}),moves:[{kind:'lunge',at:2.15,dur:.8,side:'l'}],keys:[[-4,92.5,4],[0,92,4.5],[1.2,93,4.4],[1.9,94.5,4.4],[2.3,95.3,4.2],[7,97,3]]},
 {name:'Šimić',role:'cro',style:CRO({number:20,seed:33}),keys:[[-4,93,10.5],[-2,91,11],[0,89.2,11],[1,90,9.5],[2,92.5,7],[7,95,6]]},
 {name:'Štimac',role:'cro',style:CRO({number:4,hairStyle:'long',seed:34}),keys:[[-4,95,-6],[0,95,-4.5],[2,97,-2.5],[7,99,-1]]},
 {name:'Jarni',role:'cro',style:CRO({number:17,seed:35}),keys:[[-4,82,24],[0,85,21],[7,90,17]]},
 {name:'Soldo',role:'cro',style:CRO({number:14,seed:37}),keys:[[-4,80,5],[0,82,6],[3,86,5],[7,89,4]]},
 {name:'Asanović',role:'cro',style:CRO({number:7,seed:38}),keys:[[-4,76,-7],[7,82,-5]]},
 {name:'Stanić',role:'cro',style:CRO({number:13,seed:39}),keys:[[-4,86,-20],[7,92,-14]]},
 {name:'Šuker',role:'cro',style:CRO({number:9,seed:40}),keys:[[-4,70,-3],[7,75,-2]]},
 {name:'Vlaović',role:'cro',style:CRO({number:19,seed:41}),keys:[[-4,73,9],[7,78,7]]},
 {name:'Guivarc\'h',role:'fra',style:FRA({number:9,seed:42}),keys:[[-4,90,-6],[0,93,-4.5],[2,96.5,-3],[4,98,-1],[7,98,2]]},
 {name:'Zidane',role:'fra',style:FRA({number:10,hairStyle:'balding',seed:43}),keys:[[-4,76,-3],[2,82,-2],[7,88,2]]},
 {name:'Henry',role:'fra',style:FRA({number:12,skin:SKIN_D,seed:44}),keys:[[-4,84,-15],[2,90,-11],[7,94,-5]]},
 {name:'Petit',role:'fra',style:FRA({number:17,hair:[Y,.9],hairStyle:'ponytail',seed:45}),keys:[[-4,68,-2],[7,76,1]]},
 {name:'Deschamps',role:'fra',style:FRA({number:7,seed:46}),keys:[[-4,66,8],[7,72,8]]},
 {name:'Lizarazu',role:'fra',style:FRA({number:3,seed:47}),keys:[[-4,70,-24],[7,76,-21]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-4,78,-4],[3,86,-2],[7,90,0]]},
];
const THU=0,BOBAN=1,DJORK=2;
const GA:Game=(()=>{const G={A:ACT_A,T:tables(ACT_A,-4,7),T0:-4,hero:THU,legs:[] as Leg[],carry:(()=>[0,0,0]) as (tau:number)=>V3,net:[105.3,.32,-1.7] as V3,inNet:SHOT_A+.42,shot:SHOT_A};
 // before the steal Boban carries it, a touch ahead of his right boot as he turns out of his own box
 G.carry=tau=>bootAt(G,BOBAN,tau,'r');
 const steal=bootAt(G,THU,0,'r'),carry=bootAt(G,THU,.55,'r'),dj=bootAt(G,DJORK,1.02,'r'),shot=bootAt(G,THU,SHOT_A,'r');
 G.legs=[{t0:-.12,t1:0,a:G.carry(-.12),b:steal},{t0:0,t1:.55,a:steal,b:carry,ease:easeOut},{t0:.55,t1:1.02,a:carry,b:dj},{t0:1.05,t1:SHOT_A,a:dj,b:shot,ease:(u:number)=>1-Math.pow(1-u,1.5)},
  {t0:SHOT_A,t1:G.inNet,a:shot,b:G.net,lift:.18}];
 return G;})();

// ---------------------------------------------------------------- goal 2 (70'): the one-two with Henry, the ball won back from Jarni, the left-foot curler
const SHOT_B=.62,KNEEL_T=3.9;
const ACT_B:Actor[]=[
 {name:'Thuram',role:'thu',style:THURAM_ST,key:true,engage:[1,-.9,.1],moves:[{kind:'kick',at:-1.9,dur:.7,side:'r',power:.35},{kind:'kick',at:0,dur:.5,side:'r',power:.2}],
  keys:[[-3,76.2,21.6],[-2.4,78.4,20.4],[-1.9,80.2,19.3],[-1.3,82.3,17.7],[-.8,83.6,16.4],[-.4,84.4,15.6],[0,85.2,14.7],[.3,85.9,13.9],[SHOT_B,86.5,13.3],[.9,87.1,13.1],[1.5,88.1,13.6],[2.2,89.2,15],[2.9,89.9,16.4],[3.4,90.1,16.9],[8,90.1,16.9]]},
 {name:'Jarni',role:'cro',style:CRO({number:17,seed:35}),key:true,engage:[0,-1.2,.4],moves:[{kind:'lunge',at:-.7,dur:.8,side:'l'},{kind:'lunge',at:.15,dur:.8,side:'r'}],keys:[[-3,86,21],[-2,85,19.5],[-1.2,84.6,17.2],[-.7,84.9,16.1],[-.3,85.5,15.4],[0,85.8,15.2],[.3,86,15.4],[1,87,15],[3,88.5,15],[8,89,15]]},
 {name:'Henry',role:'fra',style:FRA({number:12,skin:SKIN_D,build:{height:1.88,bulk:.95},seed:44}),key:true,moves:[{kind:'kick',at:-1.35,dur:.6,side:'r',power:.35}],keys:[[-3,82,13],[-2,83,14],[-1.45,83.8,14.6],[-1,84.5,14],[0,86.5,11.5],[1,90,8.5],[3,92,9.5],[5,92.6,12.2],[8,91.3,15.4]]},
 {name:'Ladić',role:'gk',style:LADIC_ST,key:true,moves:[{kind:'dive',at:SHOT_B+.72,dur:.9,side:'r',height:.35}],keys:[[-3,103.3,2.5],[0,102.6,2.8],[SHOT_B,102.3,2.9],[8,102.3,2.9]]},
 {name:'Šimić',role:'cro',style:CRO({number:20,seed:33}),keys:[[-3,92,11],[0,90.2,11.8],[SHOT_B,89.6,11.8],[2,91,12],[8,93,13]]},
 {name:'Bilić',role:'cro',style:CRO({number:6,build:{height:1.9},seed:32}),keys:[[-3,95,5],[0,94.5,4.5],[1,95,3.5],[8,97,3]]},
 {name:'Štimac',role:'cro',style:CRO({number:4,hairStyle:'long',seed:34}),keys:[[-3,96,-3],[8,98,-2]]},
 {name:'Soldo',role:'cro',style:CRO({number:14,seed:37}),keys:[[-3,86,4],[0,87,5],[8,90,5]]},
 {name:'Marić',role:'cro',style:CRO({number:11,seed:48}),keys:[[-3,82,2],[8,86,3]]},
 {name:'Asanović',role:'cro',style:CRO({number:7,seed:38}),keys:[[-3,80,-6],[8,84,-4]]},
 {name:'Stanić',role:'cro',style:CRO({number:13,seed:39}),keys:[[-3,88,-18],[8,92,-12]]},
 {name:'Šuker',role:'cro',style:CRO({number:9,seed:40}),keys:[[-3,74,0],[8,78,1]]},
 {name:'Vlaović',role:'cro',style:CRO({number:19,seed:41}),keys:[[-3,76,6],[8,80,6]]},
 {name:'Trezeguet',role:'fra',style:FRA({number:20,seed:49}),keys:[[-3,93,-2],[0,95,-1],[1.6,97,0],[4,96.2,7.5],[8,92.6,14]]},
 {name:'Djorkaeff',role:'fra',style:FRA({number:6,skin:SKIN_M,seed:36}),keys:[[-3,88,3],[0,90,3],[2,92.5,7],[4.5,93.2,10.6],[8,91.8,15]]},
 {name:'Zidane',role:'fra',style:FRA({number:10,hairStyle:'balding',seed:43}),keys:[[-3,72,-6],[0,78,-4],[4,84,4],[7,88,10]]},
 {name:'Petit',role:'fra',style:FRA({number:17,hair:[Y,.9],hairStyle:'ponytail',seed:45}),keys:[[-3,70,0],[8,78,6]]},
 {name:'Deschamps',role:'fra',style:FRA({number:7,seed:46}),keys:[[-3,66,6],[8,74,8]]},
 {name:'Lizarazu',role:'fra',style:FRA({number:3,seed:47}),keys:[[-3,72,-22],[8,78,-18]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-3,80,-2],[8,88,2]]},
];
const JARNI=1,HENRY_B=2;
const GB:Game=(()=>{const G={A:ACT_B,T:tables(ACT_B,-3,8),T0:-3,hero:THU,legs:[] as Leg[],carry:(()=>[0,0,0]) as (tau:number)=>V3,net:[105.3,.62,-3.05] as V3,inNet:SHOT_B+.95,shot:SHOT_B};
 G.carry=tau=>bootAt(G,THU,tau,'r');
 const give=bootAt(G,THU,-1.9,'r'),hen=bootAt(G,HENRY_B,-1.42,'r'),th0=bootAt(G,THU,0,'r'),[jx,jz]=posOf(G,JARNI,0),lost:V3=[(th0[0]+jx)/2,.11,(th0[2]+jz)/2];
 // the shot spot: ahead of his LEFT boot at the strike
 const shot=bootAt(G,THU,SHOT_B,'l');
 // the curler: struck with the inside of the left foot it starts outside the far post and bends back in (to his right), round Ladić
 G.legs=[{t0:-1.9,t1:-1.42,a:give,b:hen},{t0:-1.35,t1:-.7,a:hen,b:lost,ease:easeOut},{t0:0,t1:SHOT_B-.02,a:lost,b:shot,ease:easeOut},
  {t0:SHOT_B,t1:G.inNet,a:shot,b:G.net,lift:.55,bend:3.2,ease:(u:number)=>1-Math.pow(1-u,1.15)}];
 return G;})();

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the side-foot finish while falling away: the standing leg buckles, the body tips back and sideways */
const OFFBAL:Partial<Pose>={roll:-10,bend:-12,lean:2,lShA:70,rShA:52,neckP:26};
/** inside of the left foot: the kicking foot turned out, the hips open, the body wrapped over the ball */
const CURL:Partial<Pose>={lHipR:30,twist:-10,bend:10,rShA:84,lShA:44,neckP:36};
/** Boban robbed: arms out, a stumble */
const ROBBED:Partial<Pose>={lShA:60,rShA:48,lean:-6,roll:8,neckP:-10,lKnee:40,squash:-.04};
/** the thinker: down on the left knee, the right foot planted, the right hand's finger to his chin, the left hand on his thigh (FK-tuned) */
const KNEEL:Partial<Pose>={lHipF:0,lHipA:2,lKnee:94,lAnk:30,rHipF:90,rHipA:12,rKnee:86,rAnk:-10,lean:14,pitch:0,twist:0,roll:0,bend:0,neckP:18,neckY:0,
 rShF:80,rShA:10,rElb:120,rShR:-50,rHand:.25,lShF:40,lShA:14,lElb:50,lShR:0,lHand:.6,dx:0,dz:0,air:0,yaw:0,squash:0};
function kneel(u:number,run:Pose):Pose{return keyPoses(u,[[0,run],[.35,posed({lHipF:30,lKnee:70,rHipF:70,rKnee:80,lean:22,lShA:40,rShA:40,lElb:40,rElb:40,neckP:10,squash:-.06})],
 [.7,posed({...KNEEL,rShF:40,rElb:70,rShR:0,neckP:6,squash:-.04})],[1,posed(KNEEL)]]);}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(G:Game,k:number,tau:number):{p:Pose;yaw:number}{
 const a=G.A[k],v=velOf(G,k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(G,k,tau),b=ballOf(G,tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage){const[tk,e0,e1]=a.engage,[mx,mz]=posOf(G,tk,tau);if(tau>e0-.4&&tau<e1+.4)yaw=lerpA(yaw,yawOf(mx-x,mz-z),Math.min(sm(e0-.4,e0,tau),1-sm(e1,e1+.4,tau)));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='cro'?READY:stand();
 if(sp>.5&&along<-.35*sp&&a.role!=='thu')p=blendPose(idle,backpedal(samp(G,G.T[k].D,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(samp(G,G.T[k].P,tau),{speed:a.role==='thu'?.3+.7*s:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='kick'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='kick'&&u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.5}),Math.min(sm(0,.14,u),1-sm(1.05,1.5,u)));
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:mv.height??.5});yaw=yawOf(-1,0);}}
 if(G===GA){
  if(k===THU){p=over(p,OFFBAL,bump(SHOT_A-.1,SHOT_A+.7,tau));if(tau>G.inNet+.5)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(G.inNet+.5,G.inNet+1,tau));}
  if(k===BOBAN)p=over(p,ROBBED,bump(-.05,1.1,tau));
  if(k===DJORK&&tau>G.inNet+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(G.inNet+.3,G.inNet+.8,tau));
 }else{
  if(k===THU){
   // the left-foot curler (the inside of the foot, the hips opening), then a few running steps, then down into the thinker
   const D=.85,st=SHOT_B-STRIKE_CONTACT*D,u=(tau-st)/D;
   if(u>0&&u<1.5)p=blendPose(p,over(strike(Math.min(1,u),{foot:'l',power:.9}),CURL,bump(.3,.75,u)),Math.min(sm(0,.14,u),1-sm(1.05,1.5,u)));
   if(tau>2.9){p=kneel(sm(3.1,KNEEL_T,tau,linear),p);yaw=lerpA(yaw,yawOf(-.35,1),sm(2.7,3.4,tau,easeInOutSine));}
  }
  if(k===HENRY_B&&tau>G.inNet+.2)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(G.inNet+.2,G.inNet+.7,tau)*(1-sm(3.2,3.8,tau)));
  if(k===JARNI&&tau>.2&&tau<1.4)p=over(p,ROBBED,bump(.2,1.4,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 1998 "Tricolore" (paper, blue triads with red accents)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),acc=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number,into:Path2D)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.42,cy+Math.sin(b)*pr0*.42]);}into.addPath(polyPath(q,true));};
 tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot,pan);
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a,pan);}
 s.fill(B,pan,.95);
 if(r>9){tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.14,rot,acc);s.fill(R,acc,.95);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing a goal through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,G:Game,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;before?:()=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 G.A.forEach((_,k)=>{const[x,z]=posOf(G,k,tau),q=toCam(c,[x,.9,z]);if(q[2]<3)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballOf(G,tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlit: short and soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.15,e.h*.035,G.A[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=G.A[e.k],px=e.h*ppu,big=e.h>=300;
  // phone heat: during a passage (two scenes on one sheet) the tiny extras are left out
  if(passing&&!a.key&&px<60)continue;
  const{p,yaw}=poseOf(G,e.k,tauP);
  // phone heat: low detail for small figures and extras; during a passage only Thuram keeps 'mid'
  const detail=passing?(e.k===G.hero?'mid':'low'):px<50||(e.k!==G.hero&&px<(a.key?72:110))?'low':'auto';
  // Croatia: the printed checks on card-size figures; a red screen on the white shirt when the figure is too small for squares
  const cro=a.role==='cro',chk=cro&&px>=46&&!passing;
  let prev:{pose:Pose;place:Place}|undefined;
  if(big&&(e.k===G.hero||e.h>520)&&!passing){const q=poseOf(G,e.k,tauPrev),[qx,qz]=posOf(G,e.k,tauPrev);prev={pose:q.p,place:{x:qx,z:qz,yaw:q.yaw}};}
  const st:AthleteStyle={...a.style,shadow:e.h<420?false:undefined,detail,...(cro&&!chk?{shirt:[R,.32] as InkFill}:{})};
  const r=drawPlayer(s,p,c,st,{x:e.x,z:e.z,yaw},{prev,smear:hero&&e.k===G.hero&&!!prev,checks:chk});
  if(e.k===G.hero)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the cut between the goals): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- the broadcast score graphic (top-left): FRA ▢ n – n ▢ CRO, a pop on each change
/** a digit 0–2 as a brush stroke in a w × h box at (x, y) (top-left) */
function digit(n:number,x:number,y:number,w:number,h:number):Pt[]{
 if(n===1)return[[x+w*.2,y+h*.22],[x+w*.55,y],[x+w*.55,y+h]];
 if(n===2)return[[x,y+h*.25],[x+w*.2,y+h*.03],[x+w*.6,y],[x+w*.95,y+h*.22],[x+w*.8,y+h*.5],[x,y+h],[x+w,y+h]];
 const o:Pt[]=[];for(let i=0;i<=20;i++){const a=i/20*TAU;o.push([x+w/2+Math.sin(a)*w*.48,y+h/2-Math.cos(a)*h*.5]);}return o;}
function scoreBug(s:Sheet,v:View,fra:number,cro:number,pop:number,w=1){if(w<=0)return;
 const u=Math.min(v.vx,v.vy)*.075,x0=-v.vx+u*.9,y0=-v.vy+u*.9,W=u*6.4,H=u*1.9,sc=1+.15*pop;
 const plate=polyPath([[x0,y0],[x0+W,y0],[x0+W+u*.35,y0+H],[x0,y0+H]],true);s.knockout(plate,.9*w);s.fill(K,plate,.9*w);
 // team chips: France blue with a white and red edge; Croatia white with red checks
 const fc=rectPath(x0+u*.35,y0+u*.45,u*1,u*1);s.knockout(fc,w);s.fill(B,fc,.95*w);s.fill(R,rectPath(x0+u*1.15,y0+u*.45,u*.2,u),.95*w);
 const cc=rectPath(x0+W-u*1.35,y0+u*.45,u,u);s.knockout(cc,w);const ck=new Path2D();for(let i=0;i<3;i++)for(let j=0;j<3;j++)if((i+j)%2===0)ck.rect(x0+W-u*1.35+i*u/3,y0+u*.45+j*u/3,u/3,u/3);s.fill(R,ck,.95*w);
 // the score: paper strokes, the changing side pops
 const dh=u*1.05,dw=u*.62,cy=y0+(H-dh)/2,st=Math.max(2.5,u*.16);
 const d1=digit(fra,x0+u*1.75,cy,dw,dh),d2=digit(cro,x0+W-u*2.4,cy,dw,dh);
 const sP=(pts:Pt[],cx:number,k:number)=>pts.map(p=>[cx+(p[0]-cx)*k,cy+dh/2+(p[1]-cy-dh/2)*k] as Pt);
 s.knockout(ribbon(sP(d1,x0+u*1.75+dw/2,sc),st,{seed:3,taper:0,wobble:.4}),w);s.knockout(ribbon(sP(d2,x0+W-u*2.4+dw/2,1),st,{seed:4,taper:0,wobble:.4}),w);
 s.knockout(ribbon([[x0+W/2-u*.3,y0+H/2],[x0+W/2+u*.3,y0+H/2]],st,{seed:5,taper:0}),w);
 if(pop>0)sparkBurst(s,Y,x0+u*1.75+dw/2,y0+H/2,u*1.6,{n:8,seed:6,g:easeOutBack(clamp(pop*2))*(1-clamp((pop-.5)*2)),width:Math.max(3,u*.18)});
}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a ground point (metres), ribbon width in metres */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,wm:number,ink:string,w:number,seed=7){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rx,0,z+Math.sin(i/36*TAU)*rz]);if(q)pts.push(q);}if(pts.length<30)return;
 const q=toCam(c,[x,0,z]);if(q[2]<NEAR)return;const rr=ribbon(pts,Math.max(5,c.F*wm/q[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass along ground points (metres) */
function groundArrow(s:Sheet,c:Cam,pts3:[number,number][],wm:number,ink:string,w:number,seed=61){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const [x,z] of pts3){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}if(pts.length<2)return;
 const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*wm/d;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the flight of the ball as a dotted line (from τ0 to τ1), and a ring where it ends */
function flightDots(s:Sheet,c:Cam,G:Game,t0:number,t1:number,ink:string,w:number,size=.045,minR=3.5){if(w<=0||t1<=t0)return;const dots=new Path2D();let n=0;
 for(let i=0;i<=22;i++){const b=ballOf(G,t0+(t1-t0)*i/22),q=toCam(c,b);if(q[2]<1)continue;const g=scr(c,q),r=Math.max(minR,c.F*size/q[2]);dots.moveTo(g[0]+r,g[1]);dots.arc(g[0],g[1],r,0,TAU);n++;}
 if(n)s.fill(ink,dots,.85*w);}
/** speed lines streaming off a runner, drawn in screen space behind him */
function runLines(s:Sheet,c:Cam,x:number,z:number,w:number,seed=9){if(w<=0)return;const q=pr(c,[x,1,z]),q2=pr(c,[x+1,1,z]);if(!q||!q2)return;const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),zz=c.F/Math.max(1,toCam(c,[x,1,z])[2]);
 for(let k=0;k<3;k++){const oy=zz*(-.55+k*.45),a:Pt=[q[0]-Math.cos(dir)*zz*(.7+k*.2),q[1]+oy],b:Pt=[q[0]-Math.cos(dir)*zz*(1.9+k*.45),q[1]+oy];s.fill(K,ribbon([a,b],zz*.05,{seed:seed+k,taper:.9,wobble:.5}),.6*w);}}
/** a ring round a drawn joint (the left boot, the chin) */
function jointRing(s:Sheet,p:Pt,r:number,ink:string,w:number,seed=82){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([p[0]+Math.cos(a)*r*1.2,p[1]+Math.sin(a)*r*.85]);}
 s.fill(ink,ribbon(pts,Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, both goals, a broadcast cut between them
const CUT1=()=>CUEW(0,'Then he steals')-.45;
/** τ of goal 1 (keyed so the steal lands on "wins the ball" and the finish on "and scores"; near real time) */
const tau1A=(t:number)=>key(t,mono([[0,-3.9],[CUEW(0,'Straight away'),-.9],[CUEW(0,'wins the ball'),0],[CUEW(0,'one-two'),.95],[CUEW(0,'and scores'),SHOT_A+.2],[CUEW(0,'and scores')+3,SHOT_A+3.2]]),linear);
/** τ of goal 2 (from Jarni blocking Henry's return; the win on "steals", the curl on "curls it in", the net on "goal") */
const tau1B=(t:number)=>{const G=CUEW(0,'goal');return key(t,mono([[CUT1(),-1.05],[CUEW(0,'Then he steals'),-.2],[CUEW(0,'Then he steals')+.35,.05],[CUEW(0,'curls it in'),SHOT_B+.05],[G,GB.inNet-.05],[SECS(0)+1,GB.inNet-.05+SECS(0)+1-G]]),linear);};
const CAM1:V3=[60,25,76];
function cam1(t:number):Cam{
 const two=t>=CUT1(),G=two?GB:GA,tau=two?tau1B(t):tau1A(t),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballOf(G,u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const m=posOf(G,THU,tau),cel:V3=[m[0]-1,1.1,m[1]];
 if(!two){// opens wide on the bowl and the pitch, finds the ball as Croatia build out, follows the one-two, settles on Thuram
  const open:V3=[74,6,-6],toBall=sm(0,CUEW(0,'Croatia score')+.2,t,easeInOutSine),toT=sm(CUEW(0,'and scores')+.4,CUEW(0,'and scores')+1.3,t,easeInOutSine);
  const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toT);
  return look(CAM1,T,key(t,mono([[0,1700],[CUEW(0,'Croatia score'),3600],[CUEW(0,'Straight away'),4300],[CUEW(0,'one-two'),4700],[CUEW(0,'and scores'),5200],[CUT1(),5600]]),easeInOutSine));}
 const g=CUEW(0,'goal'),toT=sm(g+.3,g+1.2,t,easeInOutSine);
 return look(CAM1,lerp3([bt[0],2.2,lerp(bt[2],0,.2)],cel,toT),key(t,mono([[CUT1(),4800],[CUEW(0,'curls it in'),5100],[g,5600],[S,6400]]),easeInOutSine));
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),cut=CUT1(),two=t>=cut,G=two?GB:GA,tau=two?tau1B(t):tau1A(t),tp=two?tau1B(Math.max(cut,twos(t))):tau1A(Math.min(twos(t),cut-.001));
  const sc=CUEW(0,'Croatia score'),g=CUEW(0,'goal'),inA=CUEW(0,'and scores')+.1;
  stadium(s,c,v,t,{roar:two?sm(g+.1,g+.6,t):sm(inA,inA+.5,t)*(1-sm(cut-.6,cut,t)),flash:two?sm(g+.2,g+.45,t):bump(inA,inA+1.2,t)});
  ground(s,c,{bulge:bulgeOf(G,tau),ballZ:G.net[2],ballY:G.net[1]});
  const lt=CUEW(0,'Lilian Thuram'),ot=CUEW(0,'one-two'),[hx,hz]=posOf(G,THU,tau);
  play(s,G,c,v,tau,tp,two?tau1B(Math.max(cut,twos(t)-1/12)):tau1A(twos(t)-1/12),{minBall:9,before:()=>{
   // "Lilian Thuram": a yellow ring finds the right-back; "one-two": the two passes as dotted lines (to Djorkaeff and straight back)
   if(!two)groundRing(s,c,hx,hz,1.1,1.1,.22,Y,sm(lt-.1,lt+.3,t,easeOutBack)*(1-sm(ot+.4,ot+.9,t)),13);
   if(!two)flightDots(s,c,GA,.55,Math.min(tau,SHOT_A),Y,sm(ot-.2,ot+.1,t)*(1-sm(cut-1,cut-.5,t)),.16,6);}});
  // the cut between the goals: the broadcast wipe
  streaks(s,v,1-Math.min(1,Math.abs(t-cut)/.3),29);
  // the score graphic: 0–1 on "Croatia score first", 1–1 as goal 1 goes in, 2–1 on "goal"
  const fra=t>=g?2:t>=inA?1:0,cro=t>=sc?1:0,pop=fra===2?clamp((t-g)/.6):fra===1?clamp((t-inA)/.6):0;
  scoreBug(s,v,fra,cro,pop>=1?0:pop,sm(.3,.8,t));
  if(cro&&t<sc+.8&&t>=sc)sparkBurst(s,R,-v.vx+Math.min(v.vx,v.vy)*.075*(.9+6.4-1.85),-v.vy+Math.min(v.vx,v.vy)*.075*1.85,Math.min(v.vx,v.vy)*.12,{n:8,seed:8,g:easeOutBack(clamp((t-sc)/.2))*(1-clamp((t-sc-.45)/.35)),width:6});
 },
 aperture(t){const c=cam1(t),two=t>=CUT1(),G=two?GB:GA,[x,z]=posOf(G,THU,two?tau1B(t):tau1A(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10.2,
};

// ---------------------------------------------------------------- 2 · slow replay of the curler: low on the near touchline, then swinging behind his left shoulder
const tau2=(t:number)=>key(t,mono([[0,-1.55],[CUEW(1,'He wins'),-.45],[CUEW(1,'the ball back'),.02],[CUEW(1,'curls it'),SHOT_B-.22],[CUEW(1,'left foot'),SHOT_B+.02],[CUEW(1,'round the keeper'),SHOT_B+.5],[CUEW(1,'far corner'),GB.inNet],[SECS(1),GB.inNet+.45]]),linear);
const swing2=(t:number)=>sm(CUEW(1,'the ball back')+.2,CUEW(1,'curls it')+.1,t,easeInOutSine);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(GB,THU,Math.min(tau,SHOT_B+.3)),u=swing2(t),open=1-sm(0,1.1,t,easeInOutSine),fly=sm(CUEW(1,'left foot')+.1,CUEW(1,'round the keeper')+.2,t,easeInOutSine);
 // near-touchline side view of the tussle with Jarni (low, close), then round behind his left shoulder looking down the line of the curl
 const C0:V3=[m[0]-.5+1.2*open,1.35+.3*open,m[1]+8.2+2.5*open],T0:V3=[m[0]+.9,.8,m[1]-.2];
 const C1:V3=[m[0]-4.6,1.9,m[1]-1.6],T1:V3=lerp3([m[0]+5,.9,m[1]-3.5],[101,1.1,-.8],fly);
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2900-300*open,2300+500*fly,u));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),hw=CUEW(1,'He wins'),bb=CUEW(1,'the ball back'),ci=CUEW(1,'curls it'),lf=CUEW(1,'left foot'),rk=CUEW(1,'round the keeper'),fc=CUEW(1,'far corner'),E=SECS(1);
  stadium(s,c,v,t,{roar:sm(fc,fc+.4,t)});
  ground(s,c,{bulge:bulgeOf(GB,tau),ballZ:GB.net[2],ballY:GB.net[1]});
  const endFade=1-sm(E-1,E-.65,t);
  play(s,GB,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "He wins": a red ring under Jarni with the ball at his feet; "the ball back": a yellow ring where Thuram's boot takes it
   const[jx,jz]=posOf(GB,JARNI,tau);groundRing(s,c,jx,jz,.85,.85,.1,R,sm(hw-.1,hw+.3,t,easeOutBack)*(1-sm(bb+.3,bb+.7,t)),17);
   const L=GB.legs[2].a;groundRing(s,c,L[0],L[2],.55,.55,.09,Y,sm(bb-.1,bb+.25,t,easeOutBack)*(1-sm(ci,ci+.4,t)),19);
   // "curls it": the bend drawn on the grass under the ball's path — straight line to the far post vs the curve
   const cw=sm(ci-.1,ci+.5,t,easeOut)*endFade;if(cw>0){const pts:[number,number][]=[];for(let i=0;i<=12;i++){const b=ballOf(GB,SHOT_B+(GB.inNet-SHOT_B)*i/12);pts.push([b[0],b[2]]);}groundArrow(s,c,pts,.13,Y,cw,61);}}
  ,after:({hero,bg})=>{
   // "left foot": an orange ring round his left boot at the strike
   const lw=sm(lf-.2,lf+.15,t,easeOutBack)*(1-sm(rk+.2,rk+.6,t));if(hero&&lw>0){const toe=hero.joints.lToe,an=hero.joints.lAn;jointRing(s,[(toe[0]+an[0])/2,(toe[1]+an[1])/2],Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3+3,R,lw);}
   // the strike spark; the dotted flight bending round Ladić; "far corner": a yellow target in the bottom of the far post
   const age=tau-SHOT_B;if(bg&&age>-.02&&age<.12){const b=ballOf(GB,SHOT_B),q=pr(c,b);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.8/Math.max(1,toCam(c,b)[2]),{n:10,seed:58,g:1-sm(.05,.12,age),width:12});}
   flightDots(s,c,GB,SHOT_B,Math.min(tau,GB.inNet),K,sm(rk-.6,rk-.2,t)*endFade);
   const[lx,lz]=posOf(GB,3,tau);groundRing(s,c,lx,lz,.9,.9,.08,R,sm(rk-.1,rk+.3,t,easeOutBack)*(1-sm(fc,fc+.4,t)),23);
   const tw=sm(fc-.5,fc,t,easeOutBack)*endFade;if(tw>0){const q=polyP(c,[[105,.05,-3.6],[105,1.05,-3.6],[105,1.05,-2.4],[105,.05,-2.4]]);if(q.length>2){const pulse=1+.25*bump(fc,fc+.5,t);s.fill(Y,ribbon([...q,q[0]],Math.max(5,8*pulse),{seed:5,taper:0,wobble:.8}),.95*tw);s.tone(Y,polyPath(q,true),.3*tw);}}
  }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballOf(GB,tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · the thinker: a low front camera on the celebration
const tau3=(t:number)=>key(t,mono([[0,GB.inNet+.35],[CUEW(2,'He kneels'),3.35],[CUEW(2,'finger'),KNEEL_T+.25],[CUEW(2,'like a thinker'),KNEEL_T+.75],[SECS(2),KNEEL_T+1.9]]),linear);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(GB,THU,tau),kn=sm(CUEW(2,'He kneels')-.3,CUEW(2,'finger'),t,easeInOutSine),cl=sm(CUEW(2,'finger')-.2,CUEW(2,'like a thinker')+.4,t,easeInOutSine),back=sm(SECS(2)-1.4,SECS(2),t,easeInOutSine);
 // in front of him (he turns to face the main stand), dropping low as he kneels, pushing in on the chin, easing back
 const k=1-.18*kn-.12*cl+.2*back,C:V3=[m[0]-5.4*k,1.35-.3*kn,m[1]+4.2*k],T:V3=[m[0]+.3,.95-.3*kn+.15*cl,m[1]-.2];
 return look(C,T,2350+250*cl-200*back);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),tg=CUEW(2,'His only'),ff=CUEW(2,'for France'),hk=CUEW(2,'He kneels'),fi=CUEW(2,'finger'),th=CUEW(2,'like a thinker'),E=SECS(2);
  stadium(s,c,v,t,{roar:.8,flash:sm(tg,tg+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c);
  const[mx,mz]=posOf(GB,THU,tau);
  play(s,GB,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "He kneels": a blue ring lands on the grass round him
   groundRing(s,c,mx,mz,1,1,.1,B,sm(hk-.1,hk+.35,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),37);}
  ,after:({hero})=>{
   if(!hero)return;const j=hero.joints,hd=Math.hypot(j.head[0]-j.neck[0],j.head[1]-j.neck[1]);
   // his index finger (the athlete's hand is a fist): a short skin stroke from the right hand up to the lips
   const fw=sm(KNEEL_T-.1,KNEEL_T+.2,tau);if(fw>0){const tip:Pt=[lerp(j.rHa[0],j.face[0],.75),lerp(j.rHa[1],j.face[1],.75)-hd*.12];s.fill(R,ribbon([j.rHa,tip],Math.max(2.5,hd*.14),{seed:91,taper:.5}),.85*fw);}
   // "finger on chin": a yellow ring round hand and chin
   jointRing(s,[(j.rHa[0]+j.face[0])/2,(j.rHa[1]+j.face[1])/2],hd*.75,Y,sm(fi-.1,fi+.3,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),84);
   // "like a thinker": three thought dots rising from his head
   const tw=sm(th-.1,th+.6,t,easeOut)*(1-sm(E-.7,E-.3,t));if(tw>0){const d=new Path2D();for(let k=0;k<3;k++){const a=clamp(tw*3-k),r=hd*(.12+.07*k)*a,x=j.head[0]+hd*(.7+.55*k),y=j.head[1]-hd*(.9+.75*k);if(r>0){d.moveTo(x+r,y);d.arc(x,y,r,0,TAU);}}s.knockout(d,tw);s.stroke(K,d,Math.max(2,hd*.06),.9*tw);}
   // "His only two goals for France": two ball stamps above him, with a tricolour ribbon under them on "for France"
   const gw=sm(tg-.1,tg+.3,t,easeOutBack)*(1-sm(hk-.2,hk+.2,t));if(gw>0){for(let k=0;k<2;k++)ball(s,j.head[0]+(k-.5)*hd*2.1,j.head[1]-hd*2.6,hd*.6*gw,k*1.3);
    const fw2=sm(ff-.1,ff+.3,t)*gw;if(fw2>0){const y=j.head[1]-hd*1.55,x0=j.head[0]-hd*1.6,wd=hd*3.2/3;for(const [i,ink] of [[0,B],[2,R]] as [number,string][])s.fill(ink,rectPath(x0+i*wd,y,wd,hd*.28),.95*fw2);s.knockout(rectPath(x0+wd,y,wd,hd*.28),fw2);}}
  }});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GB,THU,tau3(t)),q=toCam(c,[x,1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised camera behind goal 1 (win the ball high, join the attack, reply at once)
const tau4=(t:number)=>key(t,mono([[0,-1.6],[CUEW(3,'defenders'),-.7],[CUEW(3,'win the ball'),0],[CUEW(3,'join the attack'),.9],[CUEW(3,'If the other'),1.9],[CUEW(3,'reply'),SHOT_A+.1],[SECS(3),SHOT_A+.7]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(GA,THU,tau),wide=sm(CUEW(3,'join the attack')-.2,CUEW(3,'If the other'),t,easeInOutSine);
 const C:V3=[m[0]-10-3*wide,6.5+2*wide,m[1]+10+2*wide],T:V3=[m[0]+3+5*wide,.4,m[1]-3-2*wide];
 return look(C,T,2500-400*wide);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your turn'),df=CUEW(3,'defenders'),wb=CUEW(3,'win the ball'),ja=CUEW(3,'join the attack'),io=CUEW(3,'If the other'),rp=CUEW(3,'reply'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeOf(GA,tau),ballZ:GA.net[2],ballY:GA.net[1]});
  const[mx,mz]=posOf(GA,THU,tau),fade=1-sm(E-.9,E-.4,t);
  play(s,GA,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "Your turn" / "defenders": a blue ring under the right-back
   groundRing(s,c,mx,mz,.9,.9,.1,B,sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(wb-.2,wb+.1,t)),37);
   // "win the ball high": a yellow ring where he takes it off Boban, and a red arrow up the touchline from a right-back's usual spot to there
   const st=GA.legs[1].a;groundRing(s,c,st[0],st[2],.7,.7,.1,Y,sm(wb-.1,wb+.3,t,easeOutBack)*fade,41);
   groundArrow(s,c,[[st[0]-22,st[2]+3],[st[0]-14,st[2]+2.2],[st[0]-6,st[2]+1],[st[0]-1.2,st[2]+.2]],.16,R,sm(wb,wb+.6,t,easeOut)*(1-sm(ja+.2,ja+.6,t)),43);
   // "join the attack": a yellow arrow of his run from the steal to the shooting spot
   const sh=GA.legs[4].a,pts:[number,number][]=[];for(let i=0;i<=8;i++){const[x,z]=posOf(GA,THU,lerp(.1,SHOT_A,i/8));pts.push([x,z]);}pts.push([sh[0],sh[2]]);
   groundArrow(s,c,pts,.14,Y,sm(ja-.1,ja+.6,t,easeOut)*fade,45);}
  ,after:()=>{runLines(s,c,mx,mz,sm(ja-.1,ja+.3,t)*(1-sm(io,io+.3,t)),19);}});
  // "If the other team scores": the score graphic shows 0–1; "reply straight away": a stopwatch sweeps one minute and it turns 1–1
  const bw=sm(io-.2,io+.2,t)*fade,rw=sm(rp-.1,rp+.5,t);
  scoreBug(s,v,rw>.5?1:0,1,rw>.5&&rw<1?(rw-.5)*2:0,bw);
  if(bw>0){const u=Math.min(v.vx,v.vy)*.075,cx=-v.vx+u*(.9+6.4+1.6),cy=-v.vy+u*1.85,r=u*.8,sw=sm(rp,rp+.8,t);
   const face=new Path2D();face.arc(cx,cy,r,0,TAU);s.knockout(face,bw);s.stroke(K,face,Math.max(2,u*.14),.9*bw);
   if(sw>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const a=-Math.PI/2+sw*TAU*i/16;pts.push([cx+Math.cos(a)*r*.62,cy+Math.sin(a)*r*.62]);}s.fill(R,ribbon(pts,r*.38,{seed:47,taper:0}),.9*bw);}
   const a=-Math.PI/2+sw*TAU;s.fill(K,ribbon([[cx,cy],[cx+Math.cos(a)*r*.8,cy+Math.sin(a)*r*.8]],Math.max(2,u*.12),{seed:48,taper:.3}),.95*bw);}
 },
 still:5,
};

const film:RisoStory={
 id:'thuram-croatia-1998',format:'11v11',title:"Thuram's two goals v Croatia",theme:'Defenders can win the ball high and join the attack; after conceding, reply straight away',
 ageNote:'World Cup semi-final, France v Croatia, Stade de France, Saint-Denis, 8 July 1998. His only two goals in 142 games for France.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of wet evening turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
