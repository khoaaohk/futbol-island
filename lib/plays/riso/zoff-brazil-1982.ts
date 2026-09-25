/** Dino Zoff v Brazil, 1982 World Cup second round (Group C), Estadio Sarrià, Barcelona, 5 July 1982 (Italy 3–2 Brazil): the 89th-minute
 * save on the line from Oscar's header that kept Italy in front and sent them to the semi-final. An iconic-play riso film (RisoStory,
 * chapters mode): a 1:1 reconstruction from written accounts and one match photograph (we cannot watch the footage), printed as a riso sheet.
 * The Paolo Rossi film (rossi-brazil-1982.ts) is the same match: kits and pitch conventions match (Italy blue, Brazil yellow).
 *
 * SOURCES (what the choreography and kit follow):
 *  - The Guardian, Rob Smyth, "Italy 3–2 Brazil: 1982 World Cup, second round Group C – as it happened" (21 April 2020)
 *    https://www.theguardian.com/sport/live/2020/apr/21/italy-v-brazil-1982-world-cup-second-round-group-c-live
 *  - Wikipedia, "Italy v Brazil (1982 FIFA World Cup)"  https://en.wikipedia.org/wiki/Italy_v_Brazil_(1982_FIFA_World_Cup)  (line-ups, kits,
 *    substitutions, referee Abraham Klein, attendance 44,000, 17:15 kick-off)
 *  - it.wikipedia, "Italia-Brasile 3-2 (1982)"  https://it.wikipedia.org/wiki/Italia-Brasile_3-2_(1982)  ("All'89' Zoff con un ottimo
 *    intervento riuscì a parare sulla linea di porta un colpo di testa di Oscar da distanza ravvicinata")
 *  - Wikimedia Commons, "Italy v brazil 1982 02.jpg" (Sócrates scores past Zoff in this match): the kit photograph
 *    https://commons.wikimedia.org/wiki/File:Italy_v_brazil_1982_02.jpg
 * CONFIRMED by those sources: 89th minute, Italy leading 3–2 (at 2–2 Brazil would have gone through); Éder was fouled on the left wing and
 * curled the free kick beyond the far post; Oscar came round the back of a crowd of players and thumped a header towards goal from close
 * range; Zoff (40, captain, number 1) plunged to his LEFT to stop it, the ball slipped from his grasp and he grabbed it right on the line;
 * Brazil appealed that it had gone over; it had not; the match ended a little over a minute later (after one more Brazil corner). It was a
 * very hot afternoon. KITS (photo + Wikipedia kit template): Italy blue shirts, white shorts, blue socks; Brazil yellow shirts with green
 * trim, blue shorts, white socks; Zoff a pale grey long-sleeved jersey with a dark number 1, black shorts, blue socks. On the pitch at 89':
 * Italy Zoff, Cabrini, Bergomi (on for Collovati), Gentile, Scirea, Antognoni, Oriali, Marini (on for Tardelli), Conti, Graziani, Rossi;
 * Brazil Waldir Peres, Leandro, Oscar, Luizinho, Júnior, Cerezo, Sócrates, Éder, Falcão, Zico, Paulo Isidoro (on for Serginho).
 * INFERRED (illustrative): which end of the ground and which side of the TV picture the move happened (Brazil attack screen-right here, the
 * left wing on the far touchline); the free-kick spot; that Éder struck it with his left foot (he was famously left-footed; not stated for
 * this kick; the narration does not name the foot); the ball's curl and height; every player's position and path except Éder, Oscar and
 * Zoff's beats; Zoff's start position; that the header was not bounced; how far the ball squirmed and how he gathered it (reach, clutch to
 * the chest, kneel, stand); which Brazil players appealed; Italy's reaction; the referee's position; Zoff's bare hands (gloves not
 * verified); number colours; the Sarrià's stands (a compact ground with steep terraces close to the pitch and one roofed stand), crowd
 * colours, the advertising boards' colours; camera placements, lenses and replay angles.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in real time
 * (establish, Éder over the ball, the cross, Oscar's header, the save and the hold); 2 = slow-motion replay from a low camera out on the pitch
 * facing the goal: the header, Zoff plunging to his left, the ball slipping; 3 = replay from a camera on the goal-line extension (the angle
 * that shows the ball did not cross), the grab, Brazil appealing, Zoff up with the ball; 4 = the lesson from a low front camera (a stopwatch
 * at 89', a yellow ghost of the dive with the body behind the ball, a squeeze ring on the hold). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only (t, c); actions key off cue times so the recorded
 * voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,strike,header,keeperSet,keeperDive,keeperScoop,stand,posed,blendPose,mirrorPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The header, live',text:'Barcelona, 1982. Italy lead Brazil three goals to two, and time is almost up. Éder curls a free kick beyond the far post. Oscar heads it hard at goal!',seconds:13.8,
  cues:[[.2,'Barcelona'],[2.1,'Italy lead Brazil'],[4.9,'time is almost up'],[6.9,'Éder curls'],[8.3,'beyond the far post'],[10,'Oscar heads it'],[11.2,'at goal']]},
 {label:'Watch it again',text:"Watch again, slowly. Italy's forty-year-old captain, Dino Zoff, plunges to his left. The ball slips from his hands...",seconds:9.2,
  cues:[[.15,'Watch again'],[1.9,"Italy's forty-year-old captain"],[3.8,'Dino Zoff'],[4.8,'plunges to his left'],[6.4,'The ball slips']]},
 {label:'On the line',text:'But he grabs it, right on the line! Brazil appeal, but it has not crossed. Italy hold on and win!',seconds:8.4,
  cues:[[.15,'But he grabs it'],[1.3,'right on the line'],[2.9,'Brazil appeal'],[4.2,'it has not crossed'],[5.7,'Italy hold on']]},
 {label:'Your turn',text:'Your turn, keepers: stay focused right to the final whistle. Get your body behind the ball, and hold on tight!',seconds:8.8,
  cues:[[.15,'Your turn'],[1.5,'stay focused'],[3.2,'final whistle'],[4.5,'Get your body behind the ball'],[6.6,'hold on tight']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py zoff-brazil-1982, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/zoff-brazil-1982/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-zoff-brazil-1982.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/zoff-brazil-1982/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zoff: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',O='orange',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre. Full-sheet, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Brazil attack +X; Italy's goal line at X = 105), Y up, Z across (0 = the
 * middle, +34 = the near touchline under the main camera). A figure facing +X has its right side at +Z; Zoff, facing −X, has his LEFT at +Z. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
function quadP(c:Cam,q:V3[],minDepth=6):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Sarrià: a compact ground, steep terraces right behind the boards, one roofed stand
type StandDef={a:[number,number];b:[number,number];out:[number,number];depth:number;roof:boolean};
const STANDS:StandDef[]=[
 {a:[-6,-39],b:[111,-39],out:[0,-1],depth:22,roof:true},// the far side: the roofed stand
 {a:[112,-38],b:[112,38],out:[1,0],depth:17,roof:false},// behind Italy's goal
 {a:[-7,-38],b:[-7,38],out:[-1,0],depth:17,roof:false},
 {a:[-6,39],b:[111,39],out:[0,1],depth:20,roof:false},// the near side (the main camera sits in it)
];
const RISE=.6;
const SP=(st:StandDef,u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
type Seat={P:V3;h:number};
const SEATS:Seat[]=(()=>{const o:Seat[]=[];STANDS.forEach((st,si)=>{const L=Math.hypot(st.b[0]-st.a[0],st.b[1]-st.a[1]),cols=Math.round(L/1.7),rows=Math.round(st.depth/1.25);
 for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const h=hash(si*100003+r*977+k,7);if(h<.12)continue;const d=1+(r+.5)*(st.depth-1)/rows;o.push({P:SP(st,(k+.5+(hash(k+r*31,si)-.5)*.6)/cols,d,1.3+d*RISE+.35),h});}});return o;})();
/** the sky (a hot, hazy July afternoon), the terraces, the crowd (Brazil yellow, Italy blue, white shirts, sun-hats), the roof */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flags?:number}={}){
 const{roar=0,flags=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.16);
 const haze=new Path2D();haze.rect(-1e4,-v.hy*.4,2e4,1e4);s.tone(Y,haze,.16);
 const ter=new Path2D(),roof=new Path2D(),fas=new Path2D(),wall=new Path2D();
 for(const st of STANDS){const n=10;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,q=quadP(c,[SP(st,u0,0,1.2),SP(st,u1,0,1.2),SP(st,u1,st.depth,1.2+st.depth*RISE),SP(st,u0,st.depth,1.2+st.depth*RISE)]);if(q)ter.addPath(polyPath(q,true));
  const w=quadP(c,[SP(st,u0,0,0),SP(st,u1,0,0),SP(st,u1,0,1.25),SP(st,u0,0,1.25)],3);if(w)wall.addPath(polyPath(w,true));
  if(st.roof){const yb=1.2+st.depth*RISE+4.2,rq=quadP(c,[SP(st,u0,2,yb),SP(st,u1,2,yb),SP(st,u1,st.depth+1,yb+1.4),SP(st,u0,st.depth+1,yb+1.4)]);if(rq)roof.addPath(polyPath(rq,true));
   const fq=quadP(c,[SP(st,u0,2,yb-.9),SP(st,u1,2,yb-.9),SP(st,u1,2,yb+.2),SP(st,u0,2,yb+.2)]);if(fq)fas.addPath(polyPath(fq,true));}}}
 s.knockout(ter);s.tone(B,ter,.3);s.tone(K,ter,.14);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=false;
 for(const q of SEATS){const d=toCam(c,q.P);if(d[2]<5)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.55/d[2],2,14),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(t*10+q.h*TAU)):0;
  const ink=q.h<.36?0:q.h<.6?1:q.h<.76?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any=true;}
 if(any){s.knockout(inks[0],.7);s.fill(Y,inks[1],.9);s.fill(B,inks[2],.85);s.fill(O,inks[3],.8);s.fill(K,inks[4],.8);}
 // waving flags: a few Brazil (yellow) and Italy (blue) banners on the front rows
 if(flags>0){const fy=new Path2D(),fb=new Path2D();for(let i=0;i<12;i++){const q=SEATS[Math.floor(hash(i*53,5)*SEATS.length)],d=toCam(c,q.P);if(d[2]<6)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=c.F*1.2/d[2],w=Math.sin(t*6+i)*.3;
  (i%2?fy:fb).addPath(polyPath([[g[0],g[1]-z*.3],[g[0]+z*1.3,g[1]-z*(.55+w*.2)],[g[0]+z*1.25,g[1]+z*(.3-w*.2)],[g[0],g[1]+z*.2]],true));}
  s.knockout(fy,.8*flags);s.fill(Y,fy,.95*flags);s.knockout(fb,.8*flags);s.fill(B,fb,.95*flags);}
 s.knockout(wall);s.fill(K,wall,.35);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.4);s.knockout(fas);s.fill(K,fas,.4);
}
/** the grass (yellow × blue), mowing stripes, the sunburnt patches of a July pitch, boards, paper lines, the far goal */
const PATCHES:[number,number,number,number][]=[[92,-4,4,2],[99,9,3,1.6],[86,14,5,2.2],[76,-18,6,2.6],[60,6,5,2]];
function ground(s:Sheet,c:Cam,o:{glow?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(O,p,.22);s.tone(K,p,.12);}
 const g=polyP(c,[[-5,0,-37.5],[110,0,-37.5],[110,0,37.5],[-5,0,37.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37.5],[(k+1)*5.25,0,-37.5],[(k+1)*5.25,0,37.5],[k*5.25,0,37.5]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 const pa=new Path2D();PATCHES.forEach(([x,z,rx,rz],i)=>{const pts:Pt[]=[];for(let k=0;k<14;k++){const a=k/14*TAU,w=1+.18*Math.sin(a*3+i);const q=pr(c,[x+Math.cos(a)*rx*w,0,z+Math.sin(a)*rz*w]);if(!q)return;pts.push(q);}pa.addPath(polyPath(pts,true));});s.knockout(pa,.14);
 // advertising boards right on the edge of the pitch (the Guardian: Éder had to move one to take a corner)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,.9,-36.5],[-3,.9,-36.5]]),polyP(c,[[108,0,-36],[108,0,36],[108,.9,36],[108,.9,-36]]),polyP(c,[[-3,0,36.5],[108,0,36.5],[108,.9,36.5],[-3,.9,36.5]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-1+k*6.1;for(const z of[-36.45,36.45]){const q=polyP(c,[[x,.25,z],[x+3.4,.25,z],[x+3.4,.65,z],[x,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[107.95,.25,z],[107.95,.25,z+3.4],[107.95,.65,z+3.4],[107.95,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(O,bd,.9);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 // the corner flag nearest the free kick (the far left wing of Brazil's attack)
 s.knockout(ln);
 // "right on the line": Italy's goal line under the ball glows yellow (a teaching mark, lesson and goal-line replay only)
 const gl=o.glow??0;if(gl>0){const gp2=new Path2D();seg3(c,[105,0,-3.66],[105,0,3.66],.12,gp2);s.fill(Y,gp2,.95*gl);}
 goalNet(s,c,0,-1);goalPost(s,c,0,-3.66,true);goalPost(s,c,0,3.66,false);
}
/** a goal's net at X (posts at z ±3.66, bar 2.44, 2 m deep) */
function goalNet(s:Sheet,c:Cam,X:number,d:number){
 const z0=-3.66,z1=3.66,H=2.44,bk=X+d*2,zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk,1.9,z0],[bk,0,z0]],[[X,0,z1],[X,H,z1],[bk,1.9,z1],[bk,0,z1]],[[X,H,z0],[X,H,z1],[bk,1.9,z1],[bk,1.9,z0]],[[bk,0,z0],[bk,0,z1],[bk,1.9,z1],[bk,1.9,z0]]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bk,1.9,z],.025,mesh);seg3(c,[bk,1.9,z],[bk,0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)seg3(c,[bk,y,zs[i]],[bk,y,zs[i+1]],.025,mesh);seg3(c,[X,y*H/1.9,z0],[bk,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bk,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
}
/** one post (and, with bar, the crossbar): white with a navy edge */
function goalPost(s:Sheet,c:Cam,X:number,z:number,bar:boolean){
 const fr=new Path2D(),fo=new Path2D();seg3(c,[X,0,z],[X,2.44,z],.12,fr);seg3(c,[X,0,z],[X,2.44,z],.19,fo);
 if(bar){seg3(c,[X,2.44,-3.72],[X,2.44,3.72],.12,fr);seg3(c,[X,2.44,-3.72],[X,2.44,3.72],.19,fo);}
 s.stroke(K,fo,2.5,.9);s.knockout(fr);}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.3],[O,.2]];
const SKIN_TAN:InkFill[]=[[Y,.38],[O,.32],[K,.08]];
const SKIN_DARK:InkFill[]=[[O,.62],[K,.3]];
/** Italy: blue shirts, white shorts, blue socks (confirmed by the photo and the kit template); white trim and numbers inferred */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,trim:'paper',skin:SKIN,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:3,...o});
/** Brazil: yellow shirts with green trim (blue over yellow prints green), blue shorts, white socks (confirmed); blue numbers inferred */
const BRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,trim:[B,.75],skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,numberInk:[B,.85],seed:5,...o});
/** Dino Zoff: the pale grey long-sleeved jersey with a dark 1, black shorts, blue socks (confirmed by the photo); bare hands inferred */
const ZOFF_STYLE:AthleteStyle={shirt:[K,.3],shorts:[K,.92],socks:B,boots:K,skin:SKIN,hair:[K,.85],hairStyle:'short',line:K,sleeves:'long',number:1,numberInk:K,build:{height:1.82,bulk:1.02},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN,hair:[K,.7],hairStyle:'balding',line:K,seed:12};
/** the lesson's replay mark: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'long',build:ZOFF_STYLE.build,seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (T = seconds after Éder strikes the free kick)
type Role='gk'|'ita'|'bra'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean;jump?:number;appeal?:number;cheer?:number};
/** Positions are Hermite-interpolated between keys [T, X, Z]. Only Éder's, Oscar's and Zoff's beats are in the accounts; the rest of the
 * crowd of players in and around the box is illustrative (the Italy defenders marking, Brazil pushing everyone forward in the last minute). */
const ACTORS:Actor[]=[
 {name:'Zoff',role:'gk',style:ZOFF_STYLE,key:true,keys:[[-7,104.2,-.6],[-1,104.2,-.45],[0,104.25,-.3],[.9,104.3,0],[1.35,104.3,.1],[10,104.3,.1]]},
 {name:'Oscar',role:'bra',style:BRA({number:3,build:{height:1.86},hair:[K,.9],seed:31}),key:true,jump:1.45,appeal:2.5,keys:[[-7,95,-1.5],[-1,95.2,-1],[0,95.6,.6],[.6,97.4,3.6],[1.05,99.2,5.4],[1.45,100.2,6],[2.1,100.7,6.1],[3,101,5.6],[5,100.6,5.2],[10,99,4.8]]},
 {name:'Éder',role:'bra',style:BRA({number:11,skin:SKIN_TAN,seed:32}),key:true,keys:[[-7,79.4,-26.4],[-1.25,79.4,-26.4],[-.5,80.9,-25.2],[0,81.5,-24.6],[.7,82.9,-23.5],[3,86,-20.5],[10,92,-14]]},
 {name:'Sócrates',role:'bra',style:BRA({number:8,hairStyle:'curly',build:{height:1.92,bulk:.92},seed:33}),jump:1.3,appeal:2.6,keys:[[-7,97.5,-2.2],[0,97.6,-1.6],[1.2,99,.2],[2.5,99.6,1],[10,99,1.5]]},
 {name:'Zico',role:'bra',style:BRA({number:10,hairStyle:'long',seed:34}),appeal:2.7,keys:[[-7,95.6,-6],[0,95.8,-5.5],[1.4,97.8,-3.5],[3,99.2,-1.2],[10,99,-1]]},
 {name:'Luizinho',role:'bra',style:BRA({number:4,seed:35}),appeal:2.8,keys:[[-7,98.4,2.4],[0,98.6,2.6],[1.4,100.8,2.7],[3,101.3,3.2],[10,100.5,3.4]]},
 {name:'Cerezo',role:'bra',style:BRA({number:5,skin:SKIN_DARK,hairStyle:'curly',seed:36}),keys:[[-7,94.5,4.5],[0,94.8,5],[1.4,96.4,7.2],[10,97,7.5]]},
 {name:'Isidoro',role:'bra',style:BRA({number:7,skin:SKIN_DARK,seed:37}),appeal:2.9,keys:[[-7,99.5,-4.6],[0,99.7,-4.4],[1.4,101.6,-2.4],[3,102.3,-1.2],[10,102,-1]]},
 {name:'Falcão',role:'bra',style:BRA({number:15,hairStyle:'curly',hair:[O,.6],skin:SKIN,seed:38}),keys:[[-7,90.5,-9],[0,91,-8.5],[2,93,-5],[10,95,-3]]},
 {name:'Júnior',role:'bra',style:BRA({number:6,skin:SKIN_DARK,hairStyle:'curly',seed:39}),keys:[[-7,86.5,-19],[0,86.8,-18.6],[3,90,-14],[10,93,-10]]},
 {name:'Leandro',role:'bra',style:BRA({number:2,seed:40}),keys:[[-7,82,6],[10,85,4]]},
 {name:'Gentile',role:'ita',style:ITA({number:6,hairStyle:'curly',seed:41}),jump:1.35,cheer:5.6,keys:[[-7,96.4,-5.4],[0,96.6,-5],[1.4,98.4,-3.2],[3,100.6,-1],[5.5,103,.2],[10,103,.2]]},
 {name:'Scirea',role:'ita',style:ITA({number:7,seed:42}),jump:1.25,cheer:5.8,keys:[[-7,97,-.6],[0,97.3,0],[1.2,98.9,1.4],[3,101.5,2.3],[5.5,103.2,2],[10,103.2,2]]},
 {name:'Bergomi',role:'ita',style:ITA({number:3,seed:43}),keys:[[-7,98.8,-2.8],[0,99,-2.5],[1.4,100.6,-1.5],[10,101,-1.2]]},
 {name:'Cabrini',role:'ita',style:ITA({number:4,hairStyle:'long',seed:44}),keys:[[-7,99.6,5],[0,99.8,5.4],[1.3,100.7,6.9],[3,101.6,6.4],[10,101.4,6]]},
 {name:'Oriali',role:'ita',style:ITA({number:13,hairStyle:'curly',seed:45}),keys:[[-7,95.8,6.5],[0,96,6.8],[1.2,98,5.4],[3,98.6,5],[10,98.4,5]]},
 {name:'Antognoni',role:'ita',style:ITA({number:9,hairStyle:'long',seed:46}),keys:[[-7,93.6,-2],[0,93.8,-1.6],[2,95.5,0],[10,96,0]]},
 {name:'Conti',role:'ita',style:ITA({number:16,hairStyle:'curly',seed:47}),keys:[[-7,91,-9.5],[0,91.2,-9.2],[2,92.6,-7],[10,94,-5]]},
 {name:'Marini',role:'ita',style:ITA({number:11,seed:48}),keys:[[-7,93,3.2],[0,93.2,3.6],[2,95,4],[10,95.5,4]]},
 {name:'Graziani',role:'ita',style:ITA({number:19,hairStyle:'long',seed:49}),keys:[[-7,94.6,-7.6],[0,94.8,-7.2],[2,96.5,-5.5],[10,97,-5]]},
 {name:'Rossi',role:'ita',style:ITA({number:20,hairStyle:'curly',seed:50}),jump:-.05,keys:[[-7,88.4,-17.5],[0,88.4,-17.4],[1,88.6,-16.8],[4,90,-14],[10,91,-12]]},
 {name:'referee',role:'ref',style:REF,keys:[[-7,91,6],[0,91.2,6.2],[2,94,6.5],[4,97,6.8],[10,98,6.5]]},
];
const ZOFF=0,OSCAR=1,EDER=2;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-7,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** set-piece jostling stance: knees bent, arms out to hold position */
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:34,rShA:30,lShF:16,rShF:10,lElb:50,rElb:46,neckP:-10});
/** Brazil's appeal: both arms up, palms open, head back ("it was over!") */
const APPEAL:Partial<Pose>={lShA:150,rShA:146,lShF:30,rShF:24,lElb:18,rElb:24,lHand:1,rHand:1,neckP:-22,lean:-4};
/** an Italy defender's clenched fist at the end */
const FIST:Partial<Pose>={rShF:150,rShA:40,rElb:70,rHand:0,lShA:30,lElb:60,neckP:-12};
// Zoff's save, from the dive generator (to his LEFT): the reach back for the squirming ball, the clutch to his chest, kneeling, standing
const D_HEIGHT=.08,DIVE_DUR=.72,SAVE_T=1.78,DIVE0=SAVE_T-.55*DIVE_DUR,LAND=DIVE0+.9*DIVE_DUR,GRAB_T=2.3,CLUTCH_T=2.8,KNEEL0=4.7,KNEEL1=5.7,STAND0=6.4,STAND1=7.3;
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:D_HEIGHT});
const DIVE_END=DIVE(1);
const REACH=mirrorPose(over(keeperDive(1,{side:'r',height:D_HEIGHT}),{rShA:176,lShA:140,rShF:-60,lShF:-60,rElb:20,lElb:20,rHand:1,lHand:1,neckP:14,neckY:-10},1));
const CLUTCH=mirrorPose(over(keeperDive(1,{side:'r',height:D_HEIGHT}),{rShA:96,lShA:92,rShF:40,lShF:46,rElb:118,lElb:112,rHand:.8,lHand:.8,rHipF:74,lHipF:62,rKnee:98,lKnee:86,neckP:30,lean:28},1));
const KNEEL:Pose={...keeperScoop(.7),dx:DIVE_END.dx,dz:DIVE_END.dz};
const STAND_HOLD:Pose={...over(stand(),{lShF:40,rShF:40,lShA:18,rShA:18,lElb:112,rElb:112,lHand:.8,rHand:.8,neckP:-4},1),dx:DIVE_END.dx,dz:DIVE_END.dz};
const DIVE_PLACE={x:104.3,z:.1,yaw:Math.PI};
const handsMid=(p:Pose,pl:Place):V3=>{const sk=solve(p,ZOFF_STYLE.build,pl);return[(sk.lHa[0]+sk.rHa[0])/2,(sk.lHa[1]+sk.rHa[1])/2,(sk.lHa[2]+sk.rHa[2])/2];};
/** on the ground the ball sits on the lower palm (the upper hand comes over the top); held up, it sits between both hands */
const pinned=(p:Pose,pl:Place):V3=>{const sk=solve(p,ZOFF_STYLE.build,pl),lo=sk.lHa[1]<sk.rHa[1]?sk.lHa:sk.rHa;return[lo[0]+.03,.12,lo[2]];};
const holdAt=(T:number,p:Pose,pl:Place):V3=>{const w=sm(GRAB_T,CLUTCH_T,T,easeInOutSine);return w<=0?pinned(p,pl):w>=1?handsMid(p,pl):lerp3(pinned(p,pl),handsMid(p,pl),w);};
/** the ball meets both palms at full stretch, a little in front of them */
const HANDS:V3=(()=>{const m=handsMid(DIVE(.55),DIVE_PLACE);return[m[0]-.12,Math.max(.2,m[1]),m[2]+.06];})();
/** the grab: Zoff scrambles back so his hands pin the ball with its centre on the goal line (x 104.93: on the line, not over) */
const LINE_X=104.93;
const GRAB_SHIFT=(()=>{const m=pinned(REACH,DIVE_PLACE);return LINE_X-m[0];})();
const GRAB:V3=(()=>{const m=pinned(REACH,{...DIVE_PLACE,x:DIVE_PLACE.x+GRAB_SHIFT});return[LINE_X,m[1],m[2]];})();
function zoffState(T:number):{p:Pose;place:Place}{
 if(T<DIVE0){const[x,z]=posOf(ZOFF,T),b=ballAt(T),yaw=clamp(yawOf(b[0]-x,b[2]-z),Math.PI-.9,Math.PI+.9);
  // set, on his toes; a quick shuffle to his left as the cross comes over, then the load for the dive
  let p=keeperSet(T*1.5);const v=velOf(ZOFF,T);if(Math.abs(v[1])>.2)p=over(p,{lHipA:26,rHipA:20},clamp(Math.abs(v[1])));
  return{p,place:{x,z,yaw}};}
 const place:Place={...DIVE_PLACE,x:DIVE_PLACE.x+GRAB_SHIFT*sm(LAND-.05,GRAB_T,T,easeInOutSine)};
 let p=DIVE((T-DIVE0)/DIVE_DUR);
 if(T>LAND)p=blendPose(p,REACH,sm(LAND,GRAB_T,T,easeInOutSine));
 if(T>GRAB_T)p=blendPose(p,CLUTCH,sm(GRAB_T,CLUTCH_T,T,easeInOutSine));
 if(T>KNEEL0)p=blendPose(p,KNEEL,sm(KNEEL0,KNEEL1,T,easeInOutSine));
 if(T>STAND0)p=blendPose(p,STAND_HOLD,sm(STAND0,STAND1,T,easeInOutSine));
 return{p,place};
}
// Éder's left boot meets the ball at the kick (T = 0): the body is nudged in 3D so the solved toe lands on the ball
const BALL0:V3=[82,.11,-24];
const EDER_YAW=yawOf(100-82,6+24);
const EDER_SHIFT:[number,number]=(()=>{const[x,z]=posOf(EDER,0),sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.8}),ACTORS[EDER].style.build,{x,z,yaw:EDER_YAW});return[BALL0[0]-sk.lToe[0],BALL0[2]-sk.lToe[2]];})();
/** Oscar's forehead at the header (T = 1.45), solved from his body */
const HEAD_T=1.45,OSCAR_YAW=yawOf(HANDS[0]-100.2,HANDS[2]-6);
function stateOf(k:number,T:number):{p:Pose;place:Place}{
 if(k===ZOFF)return zoffState(T);
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]);let[x,z]=posOf(k,T);
 let yaw:number;
 if(k===OSCAR&&T>.9&&T<2.4)yaw=OSCAR_YAW;
 else if(k===EDER&&T>-.8&&T<.5)yaw=EDER_YAW;
 else if(sp>.5)yaw=yawOf(v[0],v[1]);
 else{const b=ballAt(T);yaw=yawOf(b[0]-x,b[2]-z);}
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='ref'?stand():T<1.6&&a.role!=='gk'&&x>85?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 // jostling in the box before the kick: a small seeded sway
 if(T<.2&&x>90){const ph=T*2.3+(a.style.seed??0);x+=.1*Math.sin(ph);z+=.08*Math.cos(ph*1.3);}
 if(k===EDER){const u=T/.9+STRIKE_CONTACT,w=clamp(1-Math.abs(T+.05)/.75);if(w>0){p=blendPose(p,strike(clamp(u),{foot:'l',power:.8}),Math.min(1,w*1.6));const ws=sm(-.9,-.3,T)*(1-sm(.5,1,T));x+=EDER_SHIFT[0]*ws;z+=EDER_SHIFT[1]*ws;}}
 if(a.jump!==undefined){const J=a.jump,u=(T-J)/1.05+.52;if(u>0&&u<1.1){const hp=header(clamp(u));hp.air*=k===OSCAR?1.4:.7;p=blendPose(p,hp,Math.min(sm(0,.12,u),1-sm(1,1.1,u)));}}
 if(a.appeal!==undefined&&T>a.appeal)p=over(p,APPEAL,sm(a.appeal,a.appeal+.35,T)*(1-sm(5.6,6.4,T)));
 if(a.cheer!==undefined&&T>a.cheer)p=over(p,FIST,sm(a.cheer,a.cheer+.35,T,easeOutBack));
 return{p,place:{x,z,yaw}};
}
const HEAD_PT:V3=(()=>{const st=stateOf(OSCAR,HEAD_T),sk=solve(st.p,ACTORS[OSCAR].style.build,st.place),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*.11,fc[1]+d[1]/l*.11+.02,fc[2]+d[2]/l*.11] as V3;})();

// ---------------------------------------------------------------- the ball: the free kick, the curling cross, the header, the save, the slip, the grab
const APEX=5.2;
function ballAt(T:number):V3{
 if(T<=0)return BALL0;
 if(T<HEAD_T){const u=T/HEAD_T,dx=HEAD_PT[0]-BALL0[0],dz=HEAD_PT[2]-BALL0[2],L=Math.hypot(dx,dz),n:[number,number]=[-dz/L,dx/L],bow=2.2*Math.sin(Math.PI*u);
  return[lerp(BALL0[0],HEAD_PT[0],u)+n[0]*bow,lerp(BALL0[1],HEAD_PT[1],u)+APEX*4*u*(1-u),lerp(BALL0[2],HEAD_PT[2],u)+n[1]*bow];}
 if(T<SAVE_T){const u=(T-HEAD_T)/(SAVE_T-HEAD_T);return[lerp(HEAD_PT[0],HANDS[0],u),lerp(HEAD_PT[1],HANDS[1],u)+.12*Math.sin(Math.PI*u),lerp(HEAD_PT[2],HANDS[2],u)];}
 if(T<GRAB_T){// it slips from his grasp: down off the palms, a small hop, squirming back toward the line
  const u=(T-SAVE_T)/(GRAB_T-SAVE_T),e=easeOut(u);return[lerp(HANDS[0],GRAB[0],e),lerp(HANDS[1],GRAB[1],u)+.22*Math.sin(Math.PI*Math.min(1,u*1.6))*(1-u),lerp(HANDS[2],GRAB[2],e)];}
 const st=zoffState(T),m=holdAt(T,st.p,st.place);
 return[Math.min(LINE_X,m[0]),Math.max(.11,m[1]),m[2]];
}

// ---------------------------------------------------------------- the ball print: the 1982 Adidas Tango España (paper, navy triads)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.45,cy+Math.sin(b)*pr0*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type PlayOut={bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at T, far to near: players, the ball, Italy's net and each post as their own depth items (so the near post
 * prints over Zoff from the goal-line camera). Positions on ones, poses on twos (Tp); Tprev = the drawing before (secondary motion). */
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;hero?:boolean;only?:number[];after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=5,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const items:{d:number;draw:()=>void}[]=[];let heroR:DrawResult|undefined;
 const sh=new Path2D();
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=stateOf(k,Tp),x=st.place.x!,z=st.place.z!,q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];
  if(!inView(v,g,h*1.6)&&!inView(v,[g[0],g[1]-h],h*1.6))return;
  if(h<420)sh.addPath(polyPath(blob(g[0],g[1],h*.13,h*.035,a.style.seed??1,{amp:.05,n:14}),true));
  items.push({d:q[2],draw:()=>{const px=h*ppu,detail=passing?(k===ZOFF?'mid':'low'):px<50||(!a.key&&px<230)?'low':'auto',big=h>=260&&!passing;
   const prev=big?stateOf(k,Tprev):null,fast=k===ZOFF&&Tp>DIVE0&&Tp<LAND+.1||k===OSCAR&&Tp>HEAD_T-.3&&Tp<HEAD_T+.2;
   const r=drawPlayer(s,st.p,c,{...a.style,shadow:h<420?false:undefined,detail},st.place,prev?{prev:prev.p,prevPlace:prev.place,smear:hero&&fast}:{});
   if(k===ZOFF)heroR=r;}});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8/(1+b[1]*.3),br*.25/(1+b[1]*.3),2,{amp:.05,n:12}),true));
 s.tone(K,sh,.42);
 // the ball sorts a hair in front of whatever it touches (hands, head)
 if(bg)items.push({d:bq[2]-.25,draw:()=>ball(s,bg[0],bg[1],br,T*7)});
 const nq=toCam(c,[106,1.2,0]);items.push({d:nq[2],draw:()=>goalNet(s,c,105,1)});
 for(const z of[-3.66,3.66]){const q=toCam(c,[105,1.2,z]);items.push({d:q[2],draw:()=>goalPost(s,c,105,z,z<0)});}
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 const out={bg,br,hero:heroR};o.after?.(out);return out;
}
/** a broadcast replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass (or round a point in the air) in ink, radius r metres */
function ring3(s:Sheet,c:Cam,P:V3,r:number,ink:string,w:number,seed:number,flat=true){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,flat?[P[0]+Math.cos(a)*r,P[1],P[2]+Math.sin(a)*r]:[P[0],P[1]+Math.sin(a)*r,P[2]+Math.cos(a)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const q=toCam(c,P),rr=ribbon(pts,Math.max(5,c.F*.07/q[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a screen-space ring round a point (the ball, the hands) */
function ring2(s:Sheet,x:number,y:number,r:number,ink:string,w:number,seed:number){if(w<=0||r<=0)return;const pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(4,r*.16),{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the header's path as an orange arrow from Oscar's head to the keeper's hands */
function headerArrow(s:Sheet,c:Cam,w:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<=10;i++){const q=pr(c,lerp3(HEAD_PT,HANDS,i/10*w));if(q)pts.push(q);}
 if(pts.length<3)return;const d=toCam(c,HANDS)[2],wd=Math.max(5,c.F*.07/d);s.knockout(ribbon(pts,wd*1.8,{seed:61,taper:.1,wobble:.6}),.8);
 laneArrow(s,O,pts[0],pts[pts.length-1],wd,{seed:62,head:wd*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const tau1=(t:number)=>{const e=CUEW(0,'Éder curls');return key(t,[[0,-6.2],[e,0],[CUEW(0,'beyond'),.85],[CUEW(0,'Oscar heads'),HEAD_T],[CUEW(0,'at goal'),SAVE_T+.25],[SECS(0),SAVE_T+.25+SECS(0)-CUEW(0,'at goal')]],linear);};
const CAM1:V3=[62,23,78];
function cam1(t:number):Cam{
 const T=tau1(t),bc=CUEW(0,'Barcelona'),il=CUEW(0,'Italy lead'),tm=CUEW(0,'time is');
 const b=ballAt(T),est=1-sm(bc+.4,il+.4,t,easeInOutSine);
 // establish on the stand across the pitch, tilt down to Éder over the ball, widen to show the crowded box, then ride the cross in to the goal
 const onEder:V3=[83,1.2,-22],onBox:V3=[92,1,-10],onGoal:V3=[103.4,.7,2];
 let T0v=lerp3(onEder,onBox,sm(tm-.3,tm+1.4,t,easeInOutSine));
 T0v=lerp3(T0v,[lerp(onBox[0],b[0],.5),1,lerp(onBox[2],b[2],.5)],sm(0,.6,T,easeInOutSine)*(1-sm(.6,1.3,T)));
 T0v=lerp3(T0v,onGoal,sm(.5,1.5,T,easeInOutSine));
 const Tg=lerp3(T0v,[70,14,-42],est);
 const F=key(t,[[0,2400],[il,5200],[tm,4600],[tm+1.6,4000],[CUEW(0,'Éder curls')+.2,4200],[CUEW(0,'Oscar heads')-.6,6200],[CUEW(0,'at goal'),8200],[SECS(0),9400]],easeInOutSine);
 return look(CAM1,Tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),Tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(SAVE_T,SAVE_T+.4,T)*(1-sm(4,5,T))*.8,flags:.6+.4*sm(0,1,T)});
  ground(s,c);
  play(s,c,v,T,Tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),T=tau1(t),st=zoffState(T),q=toCam(c,[st.place.x!,.6,st.place.z!]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(6,c.F*.12/q[2]),12);},
 still:11.6,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a low camera out on the pitch facing the goal
const tau2=(t:number)=>key(t,[[0,.95],[CUEW(1,'Watch'),1.0],[CUEW(1,"Italy's"),1.3],[CUEW(1,'Dino'),1.45],[CUEW(1,'plunges'),1.58],[CUEW(1,'The ball'),1.84],[SECS(1),2.12]],linear);
/** the replay camera high behind Italy's goal, looking back up the pitch through the net (Zoff's left is screen-left) */
function cam2(t:number):Cam{
 const T=tau2(t),push=sm(CUEW(1,'Dino')-.4,CUEW(1,'plunges')+.4,t,easeInOutSine),follow=sm(1.3,1.95,T,easeInOutSine);
 const C:V3=[lerp(118,116,push),lerp(6,4.6,push),lerp(-2.5,-1,push)];
 const Tg=lerp3([101.2,1.4,3.8],[104,.5,2.6],follow);
 return look(C,Tg,lerp(2500,4100,push));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),Tp=tau2(twos(t)),ic=CUEW(1,"Italy's"),bs=CUEW(1,'The ball');
  stadium(s,c,v,t);
  ground(s,c);
  // "forty-year-old captain": a yellow ring on the grass under Zoff
  const zw=sm(ic-.1,ic+.35,t,easeOutBack)*(1-sm(CUEW(1,'plunges')-.2,CUEW(1,'plunges')+.2,t));
  if(zw>0){const st=zoffState(T);ring3(s,c,[st.place.x!,0,st.place.z!],.75,Y,zw,71);}
  play(s,c,v,T,Tp,tau2(twos(t)-1/12),{minBall:6,hero:true,after:({bg,br})=>{
   // "The ball slips": an orange ring that pops off the ball as it squirms loose
   const age=t-bs;if(bg&&age>-.2&&age<1.6){const w=sm(-.2,.15,age,easeOutBack)*(1-sm(1.1,1.6,age));ring2(s,bg[0],bg[1],br*(1.9+.4*Math.sin(age*9)),O,w,72);}
   if(bg&&age>0&&age<.35)sparkBurst(s,O,bg[0],bg[1],br*4,{n:7,seed:73,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,br*.3)});}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · replay from the goal-line camera: the grab, Brazil appeal, not over, Italy hold on
const tau3=(t:number)=>key(t,[[0,2.0],[CUEW(2,'But he'),2.08],[CUEW(2,'right on'),2.36],[CUEW(2,'Brazil appeal'),2.75],[CUEW(2,'it has not'),3.6],[CUEW(2,'Italy hold'),5.2],[SECS(2),7.1]],linear);
function cam3(t:number):Cam{
 const T=tau3(t),push=sm(CUEW(2,'right on')-.3,CUEW(2,'right on')+.5,t,easeInOutSine),back=sm(CUEW(2,'Brazil appeal')-.3,CUEW(2,'Brazil appeal')+.8,t,easeInOutSine)*(1-sm(CUEW(2,'it has not')-.3,CUEW(2,'it has not')+.5,t,easeInOutSine)),rise=sm(CUEW(2,'Italy hold')-.4,SECS(2),t,easeInOutSine);
 const ball3=ballAt(T);
 const C:V3=[105.25+1.6*back+.8*rise,lerp(.95,1.2,push)+1.1*back+1.4*rise,11-1.8*push+2.5*back+2*rise];
 const Tg:V3=[lerp(104.75,ball3[0],.5)-1.6*back-.8*rise,.4+.5*back+.7*rise,lerp(2.4,ball3[2],.5)];
 return look(C,Tg,lerp(2400,3300,push)-900*back-600*rise);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),Tp=tau3(twos(t)),ro=CUEW(2,'right on'),nc=CUEW(2,'it has not'),ih=CUEW(2,'Italy hold');
  stadium(s,c,v,t,{flags:sm(ih-.2,ih+.4,t),roar:sm(ih,ih+.4,t)});
  const glow=sm(ro-.1,ro+.3,t)*(1-sm(CUEW(2,'Brazil appeal')-.1,CUEW(2,'Brazil appeal')+.3,t))+sm(nc-.1,nc+.3,t)*(1-sm(ih-.3,ih,t));
  ground(s,c,{glow});
  play(s,c,v,T,Tp,tau3(twos(t)-1/12),{minBall:6,hero:true,after:({bg,br})=>{
   // "right on the line" / "it has not crossed": a yellow ring on the ball while the line glows
   if(bg)ring2(s,bg[0],bg[1],br*1.7,Y,glow,81);
   const age=t-CUEW(2,'But he');if(bg&&age>0&&age<.4)sparkBurst(s,Y,bg[0],bg[1],br*4.5,{n:8,seed:82,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.25)/.15)),width:Math.max(4,br*.3)});}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),b=ballAt(tau3(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.8,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the save
const CAM4:V3=[100.2,1.35,-.6];
function cam4(t:number):Cam{
 const open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(3,'Get your')-.4,CUEW(3,'Get your')+.6,t,easeInOutSine),hold=sm(CUEW(3,'hold on')-.3,CUEW(3,'hold on')+.5,t,easeInOutSine);
 const C:V3=[CAM4[0]-1.2*open+.4*push+1.4*hold,CAM4[1]+.5*open-.25*hold,CAM4[2]-.8*open+.4*push+1.2*hold];
 return look(C,[104.3,lerp(1.1,.75,push)-.25*hold+.3*open,lerp(1.5,1.8,push)+.9*hold],lerp(1650,1850,push)+400*hold-250*open);
}
/** the real Zoff: clutching the ball on the line, then (hold on tight) the grab replays */
const tau4=(t:number)=>{const h=CUEW(3,'hold on');return t<h-.2?3.4:key(t,[[h-.2,GRAB_T-.15],[h+.9,CLUTCH_T+.1],[SECS(3),CLUTCH_T+.6]],easeInOutSine);};
/** the stopwatch floating above the crossbar: 89 minutes gone, then the whistle */
function stopwatch(s:Sheet,c:Cam,t:number,w:number){if(w<=0)return;const P=pr(c,[105.3,2.3,.75]);if(!P)return;const r=c.F*.42/toCam(c,[105.3,2.3,.75])[2]*easeOutBack(clamp(w));
 const fw=CUEW(3,'final whistle'),fill=lerp(0,89/90,sm(CUEW(3,'stay')-.2,CUEW(3,'stay')+1,t,easeInOutSine))+(1/90)*sm(fw,fw+.5,t);
 const face=polyPath(blob(P[0],P[1],r,r,9,{amp:.02,n:30}),true);s.knockout(face);
 const wedge=new Path2D(),a0=-Math.PI/2;wedge.moveTo(P[0],P[1]);for(let i=0;i<=40;i++){const a=a0+fill*TAU*i/40;wedge.lineTo(P[0]+Math.cos(a)*r*.86,P[1]+Math.sin(a)*r*.86);}wedge.closePath();s.fill(O,wedge,.85);
 s.fill(K,ribbon(blob(P[0],P[1],r,r,9,{amp:.02,n:30}),Math.max(4,r*.12),{close:true,seed:91,taper:0}),.95);
 const crown=new Path2D();crown.rect(P[0]-r*.16,P[1]-r*1.32,r*.32,r*.26);s.fill(K,crown,.95);
 const a=a0+fill*TAU;s.fill(K,ribbon([[P[0],P[1]],[P[0]+Math.cos(a)*r*.8,P[1]+Math.sin(a)*r*.8]],Math.max(3,r*.09),{seed:92,taper:.3}),.95);
 const age=t-fw;if(age>0&&age<.7)sparkBurst(s,Y,P[0],P[1],r*2.2,{n:10,seed:93,g:easeOutBack(clamp(age/.2))*(1-clamp((age-.45)/.25)),width:Math.max(5,r*.12)});}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),yt=CUEW(3,'Your turn'),sf=CUEW(3,'stay'),gb=CUEW(3,'Get your'),ho=CUEW(3,'hold on'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{glow:.35*sm(gb,gb+.4,t)*(1-sm(E-1,E-.5,t))});
  const T=tau4(t),Tp=tau4(twos(t));
  // "Your turn": a yellow ring under the keeper
  const zs=zoffState(3.4),zsk=solve(zs.p,ZOFF_STYLE.build,zs.place);
  ring3(s,c,[zsk.pelvis[0],0,zsk.pelvis[2]],1.1,Y,sm(yt,yt+.35,t,easeOutBack)*(1-sm(sf,sf+.3,t)),95);
  // "Get your body behind the ball": the header arrow, then a yellow ghost of the dive meeting it
  const gw=sm(gb-.1,gb+.3,t)*(1-sm(ho-.3,ho,t));
  if(gw>0){headerArrow(s,c,sm(gb-.1,gb+.6,t,easeOut));const u=sm(gb+.2,gb+1.3,t,easeInOutSine),Tg=lerp(DIVE0+.05,SAVE_T,u);drawPlayer(s,DIVE((Tg-DIVE0)/DIVE_DUR),c,GHOST,DIVE_PLACE);
   const h=pr(c,HANDS);if(h&&u>.95){const r=c.F*.11/toCam(c,HANDS)[2];ball(s,h[0],h[1],Math.max(5,r),1);sparkBurst(s,Y,h[0],h[1],r*5,{n:9,seed:96,g:easeOutBack(clamp((u-.95)*8)),width:Math.max(4,r*.3)});}}
  play(s,c,v,T,Tp,tau4(twos(t)-1/12),{minBall:5,hero:true,only:[ZOFF],after:({bg,br})=>{
   // "hold on tight": an orange ring that squeezes in round the hands and the ball
   const hw=sm(ho-.1,ho+.3,t)*(1-sm(E-.8,E-.4,t));if(bg&&hw>0)ring2(s,bg[0],bg[1],br*(2.6-.9*sm(ho,ho+1.2,t,easeOut))*(1+.06*Math.sin(t*14)),O,hw,97);}});
  stopwatch(s,c,t,sm(sf-.2,sf+.3,t)*(1-sm(gb-.3,gb,t)));
 },
 still:5.2,
};

const film:RisoStory={
 id:'zoff-brazil-1982',format:'11v11',title:"Zoff's save on the line",theme:'Keepers: stay focused to the final whistle, get your body behind the ball and hold on',
 ageNote:'World Cup second round, Italy v Brazil, Estadio Sarrià, Barcelona, 5 July 1982. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a keeper's catch — a yellow spark and a ring that squeezes shut. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  if(age<.35)sparkBurst(s,Y,x,y,110,{n:8,seed,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:14});
  if(age<1)ring2(s,x,y,70*(1-.6*easeOut(clamp(age/.6))),O,1-clamp((age-.6)/.4),seed+1);},
};
export default film;
/** Solved contact points (pitch metres; X to Italy's goal line at 105, Z across, +Z = Zoff's left) — checked by the test. */
export const FACTS={HEAD_PT,HANDS,GRAB,LINE_X,DIVE_PLACE,BALL0,ballAt,zoffState,SAVE_T,GRAB_T,HEAD_T};
