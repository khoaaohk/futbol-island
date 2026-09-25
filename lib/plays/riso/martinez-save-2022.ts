/** Emiliano "Dibu" Martínez v Randal Kolo Muani — World Cup final, Argentina 3–3 France (Argentina won 4–2 on penalties), Lusail
 * Stadium, Qatar, 18 December 2022: the save in the 123rd minute (120+3). An iconic-play riso film (RisoStory, chapters mode): a 1:1
 * reconstruction from written accounts (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (what the choreography and kit follow; cached under scratchpad/films/src-cache):
 *  - Wikipedia, "2022 FIFA World Cup final" (raw wikitext, fetched 23 Sep 2026)  https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_final
 *  - Wikipedia (es), "Final de la Copa Mundial de Fútbol de 2022"  https://es.wikipedia.org/wiki/Final_de_la_Copa_Mundial_de_F%C3%BAtbol_de_2022
 *  - Página|12, "La atajada de Dibu Martínez en tiempo de descuento que valió un Mundial" (18 Dec 2022)
 *    https://www.pagina12.com.ar/509147-la-atajada-de-dibu-martinez-en-tiempo-de-descuento-que-valio
 *  - The Guardian, "2022 World Cup final: Argentina 3-3 France (aet, 4-2 on pens) – as it happened" (Scott Murray) and match report
 *    https://www.theguardian.com/football/live/2022/dec/18/argentina-france-world-cup-2022-final-live
 *  - BBC Sport, "World Cup final: Argentina beat France on penalties in dramatic Qatar showpiece"  https://www.bbc.co.uk/sport/football/63932622
 *  - Wikipedia, "Emiliano Martínez" (1.95 m, Argentina No. 23) and "Randal Kolo Muani" (France No. 12, on as a 41st-minute substitute)
 * CONFIRMED by those accounts: Lusail Stadium, 18 December 2022, extra time's last minute (120+3, about 15 seconds of added time left);
 * the Argentina back line had stepped up to squeeze the space; a ball went past Nicolás Otamendi and, bouncing, fell to an unmarked Kolo
 * Muani at the edge of the box, one on one with Martínez; he chose a hard, low shot (he had the option of a pass to the middle) toward
 * the right of the goal; Martínez "spreads" himself and blocks it with his outstretched LEFT leg (left shin / boot); Argentina countered
 * at once. Argentina went on to win the shoot-out 4–2. KIT: Argentina in the sky-blue and white stripes with BLACK shorts (printed navy)
 * and white socks; France in navy shirts and navy shorts. Martínez wore 23, Kolo Muani 12, Otamendi 19, Mbappé 10.
 * INFERRED (illustrative): where the long ball came from (drawn as Ibrahima Konaté's clearance from the France half) and its flight and
 * bounces; every position and timing between the beats; where exactly Martínez stood, how far he came out and the shot spot (right-hand
 * channel for the shooter, inside the box); Kolo Muani's shooting foot (right) and his touch; the pose-by-pose shape of the spread (a
 * star: arms up and out, left leg sliding wide) and his fall; where the rebound went; the other 13 players' positions; France's socks
 * (navy; the sources disagree); Martínez's goalkeeper kit colours (printed as a red screen with a blue shade, i.e. a violet — not
 * verified, never named in the narration), his gloves and hair; the direction of play on screen; the night-time bowl (two tiers, roof
 * ring, floodlight band), crowd colours, the LED boards, the Al Hilm ball print (paper with gold triads); camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera: the
 * night bowl, the long ball, the bounce past Otamendi, Kolo Muani through, the save seen wide; 2 = slow-motion replay from a low camera
 * behind the shooter's right shoulder: Martínez races out, spreads, the left leg blocks (a ring on the boot, a spark at contact);
 * 3 = replay from behind the goal: how little of the goal he leaves (the gaps flash red), he goes down, the crowd; 4 = the lesson from
 * above the goal: the shooting angle printed on the grass, Martínez rushing out along it, his body's "shadow" on the goal line growing
 * as he closes the angle and spreads (arrows out along his arms and legs). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only (t); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,strike,header,keeperSet,stand,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); withTiming matches a
 * cue by its FIRST word, in order, so no cue starts with a word that appears earlier in the sentence after the previous cue. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The last minute',text:'Lusail, 2022. The World Cup final, the very last minute of extra time. A long ball bounces past Otamendi. Randal Kolo Muani is through, one on one!',seconds:12.4,
  cues:[[.2,'Lusail'],[1.8,'The World Cup final'],[3.3,'the very last minute'],[5.6,'A long ball'],[6.8,'bounces past Otamendi'],[8.5,'Randal Kolo Muani'],[9.8,'is through'],[10.5,'one on one']]},
 {label:'Watch the save',text:'Watch again, slowly. Emiliano Martínez races off his line, spreads his arms and legs wide, and blocks the shot with his left leg!',seconds:10.4,
  cues:[[.1,'Watch again'],[1.7,'Emiliano Martínez'],[3.1,'races off his line'],[4.9,'spreads his arms'],[6.8,'blocks the shot'],[8.2,'his left leg']]},
 {label:'Behind the goal',text:'From behind the goal, see how little space he leaves. Argentina went on to win the World Cup!',seconds:8.6,
  cues:[[.1,'From behind the goal'],[2.1,'see how little space'],[3.8,'he leaves'],[5.2,'Argentina went on'],[6.6,'win the World Cup']]},
 {label:'Your turn',text:'Your turn, keepers: rush out fast to close the angle, then make yourself big. Spread your arms and legs wide!',seconds:9.4,
  cues:[[.1,'Your turn'],[1.5,'rush out fast'],[2.8,'close the angle'],[4.4,'make yourself big'],[6.2,'Spread your arms'],[7.4,'legs wide']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py martinez-save-2022, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/martinez-save-2022/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-martinez-save-2022.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/martinez-save-2022/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('martinez: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (France attack −X; Argentina's goal line at X = 0, the left of the main
 * camera), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right at +Z,
 * so Martínez, facing out (+X), has his LEFT side toward −Z: the shot goes low to the −Z side and his left leg reaches it. */
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
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a ground polygon (x,z pairs) projected */
const groundPoly=(c:Cam,pts:[number,number][],y=.012)=>polyP(c,pts.map(([x,z])=>[x,y,z] as V3));

// ---------------------------------------------------------------- Lusail at night: a round bowl, two tiers, the roof ring and its floodlight band
const CX=52.5,NS=64;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(43+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[2+22*b,1.6+12*b],UP=(b:number):[number,number]=>[25+22*b,16.5+17*b];
type Bowl={low:V3[][];up:V3[][];roof:V3[][];band:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],roof:[],band:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.roof.push([rim(a,44,36),rim(b,44,36),rim(b,70,40),rim(a,70,40)]);
  o.band.push([rim(a,44,34.4),rim(b,44,34.4),rim(b,44,36.2),rim(a,44,36.2)]);
  o.lamps.push(rim(a+.5/NS*TAU,44,35.3));
  for(const [f,rows] of [[LOW,9],[UP,8]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,17);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the night sky, the bowl, the crowd (roar lifts the marks; flash = phone lights and camera flashes) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),up=new Path2D(),roof=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.band[i],band);}
 s.knockout(low,.8);s.tone(B,low,.5);s.tone(K,low,.3);
 s.knockout(up,.8);s.tone(B,up,.45);s.tone(K,up,.45);
 // the crowd: mostly Argentina's sky blue and white, some gold, a little red; one mark per seat group, sized by distance
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.4*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.42?0:q.h<.72?1:q.h<.82?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(B,inks[1],.6);s.fill(Y,inks[2],.85);s.fill(R,inks[3],.8);s.fill(K,inks[4],.7);
 // the roof ring (navy underside) and the floodlight band glowing under it
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.5);
 s.knockout(band);s.fill(Y,band,.55);
 const lamps=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lamps.addPath(polyPath(blob(g[0],g[1],z,z*.55,3,{amp:.05,n:10}),true));}
 s.knockout(lamps);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass under floodlights (yellow × blue, a navy night screen) with mowing stripes, LED boards, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.5);s.tone(K,p,.35);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // LED boards: far touchline and behind both goals, red with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.9);s.tone(K,bd,.2);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,105,1);
 if(!o.goalLater)goal3(s,c,0,-1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep behind it (d = direction of the net) */
function goal3(s:Sheet,c:Cam,X:number,d:number){
 const z0=-3.66,z1=3.66,H=2.44,bk=X+d*2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk,1.9,z0],[bk,0,z0]],[[X,0,z1],[X,H,z1],[bk,1.9,z1],[bk,0,z1]],[[X,H,z0],[X,H,z1],[bk,1.9,z1],[bk,1.9,z0]],[[bk,0,z0],[bk,0,z1],[bk,1.9,z1],[bk,1.9,z0]]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bk,1.9,z],.025,mesh);seg3(c,[bk,1.9,z],[bk,0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bk,y,z0],[bk,y,z1],.025,mesh);seg3(c,[X,y*H/1.9,z0],[bk,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bk,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Argentina: sky-blue (blue screen) and white stripes, black shorts (navy), white socks */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** France: navy shirts and shorts (navy socks inferred), white numbers */
const FRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Emiliano Martínez, 1.95 m, No. 23 — keeper kit colours INFERRED (a red screen shaded blue = violet), paper gloves */
const MTZ:AthleteStyle={shirt:[R,.85],shorts:[K,.85],socks:[R,.85],boots:K,trim:K,skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[B,.45],gloves:'paper',sleeves:'long',number:23,numberInk:'paper',build:{height:1.95,bulk:1.05},seed:23};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};
/** the lesson's comparison ghost: a yellow silhouette of the same body */
const GHOST:AthleteStyle={...MTZ,shirt:[Y,.6],shorts:[Y,.6],socks:[Y,.6],boots:[Y,.6],skin:[[Y,.6]],hair:[Y,.6],gloves:[Y,.6],trim:null,number:null,line:Y,shade:null,shadow:false};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds from Kolo Muani's shot)
type Role='gk'|'arg'|'fra'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Only the beats are in the accounts; the spots are inferred. */
const ACTORS:Actor[]=[
 {name:'Martínez',role:'gk',style:MTZ,key:true,keys:[[-10,6,.6],[-6,5.7,.2],[-3.3,5.1,-.8],[-1.75,4.8,-1.25],[-1.1,5.7,-1.8],[-.55,6.85,-2.55],[-.3,7.2,-2.8],[4,7.2,-2.8]]},
 {name:'Kolo Muani',role:'fra',style:FRA({number:12,skin:SKIN_D,build:{height:1.87},seed:12}),key:true,keys:[[-10,48,-10],[-6,40.5,-8],[-4,30.5,-6.2],[-3.3,26.4,-5.3],[-2,20.4,-4.3],[-1.1,16.6,-3.9],[-.35,13.6,-4.6],[0,12.9,-4.9],[.5,12.3,-4.8],[1.5,11.9,-4.3],[4,12.4,-2.2]]},
 {name:'Otamendi',role:'arg',style:ARG({number:19,build:{height:1.83},seed:19}),key:true,keys:[[-10,32.5,-3],[-6,30.5,-3],[-4.5,27.6,-3],[-3.6,25.3,-2.9],[-3.2,24.9,-2.9],[-2.6,24.2,-3.2],[-1.5,21,-3.8],[0,16.6,-4.3],[1.5,13.4,-3.9],[4,11.8,-2.6]]},
 {name:'Romero',role:'arg',style:ARG({number:13,seed:13}),keys:[[-10,32,7],[-4,26.5,4.5],[-2,21.5,2],[0,16.5,.8],[2,13.4,.4],[4,12.6,1.2]]},
 {name:'Montiel',role:'arg',style:ARG({number:4,seed:4}),keys:[[-10,33,17],[-3,25.5,12],[0,18.5,8],[4,14.5,6]]},
 {name:'Pezzella',role:'arg',style:ARG({number:6,seed:6}),keys:[[-10,32,-16],[-3,25,-12.5],[0,19,-9.5],[4,15,-7.5]]},
 {name:'Mbappé',role:'fra',style:FRA({number:10,skin:SKIN_D,seed:10}),key:true,keys:[[-10,51,5],[-6,43,4],[-4,33,3.6],[-2,24,3.1],[0,16,2.4],[1.5,13,2],[4,12.5,3]]},
 {name:'Konaté',role:'fra',style:FRA({number:24,skin:SKIN_D,build:{height:1.94},seed:24}),keys:[[-10,63,2],[-6.8,61.2,3.6],[-6,60.6,4.1],[-4,58.5,3.2],[4,52,2]]},
 {name:'Messi',role:'arg',style:ARG({number:10,build:{height:1.7},seed:30}),keys:[[-10,49,13],[4,40,11]]},
 {name:'Enzo',role:'arg',style:ARG({number:24,seed:31,hairStyle:'long'}),keys:[[-10,46,-5],[4,34,-7]]},
 {name:'Paredes',role:'arg',style:ARG({number:5,seed:32}),keys:[[-10,55,8],[4,44,5]]},
 {name:'Dybala',role:'arg',style:ARG({number:21,seed:33}),keys:[[-10,42,-12],[4,33,-11]]},
 {name:'Coman',role:'fra',style:FRA({number:20,skin:SKIN_D,seed:34}),keys:[[-10,52,-19],[4,34,-15]]},
 {name:'Fofana',role:'fra',style:FRA({number:13,skin:SKIN_D,seed:35}),keys:[[-10,58,-6],[4,46,-4]]},
 {name:'Upamecano',role:'fra',style:FRA({number:18,skin:SKIN_D,seed:36}),keys:[[-10,68,-8],[4,60,-6]]},
 {name:'referee',role:'ref',style:REF,keys:[[-10,46,10],[4,28,11]]},
];
const MTZ_I=0,KM=1,OTA=2,KONATE=7;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Martínez: the set (wide, low, gloves open), the star (arms up and out, legs wide), the reach (left leg sliding out to the ball), down */
const SET=posed({lHipF:44,rHipF:44,lHipA:24,rHipA:24,lKnee:64,rKnee:64,lAnk:-8,rAnk:-8,lean:22,pitch:8,lShF:36,rShF:36,lShA:48,rShA:48,lElb:40,rElb:40,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-14});
const STAR=posed({lHipF:14,rHipF:22,lHipA:52,rHipA:36,lKnee:10,rKnee:32,lAnk:8,rAnk:0,lHipR:30,rHipR:18,lean:10,pitch:4,roll:-12,bend:-10,lShF:18,rShF:22,lShA:116,rShA:108,lElb:14,rElb:18,lHand:1,rHand:1,neckP:8,air:.05});
const REACH=posed({lHipF:18,rHipF:26,lHipA:72,rHipA:28,lKnee:4,rKnee:46,lAnk:14,lHipR:40,rHipR:12,lean:8,roll:-30,bend:-14,lShF:20,rShF:26,lShA:126,rShA:112,lElb:12,rElb:20,lHand:1,rHand:1,neckP:14,neckY:-6,air:.02,dz:-.25});
const FALL=posed({lHipF:22,rHipF:30,lHipA:48,rHipA:24,lKnee:18,rKnee:52,lAnk:20,roll:-62,bend:-8,lean:6,lShF:26,rShF:34,lShA:128,rShA:104,lElb:24,rElb:30,lHand:1,rHand:1,neckP:10,dz:-.6});
const DOWN=posed({lHipF:22,rHipF:34,lHipA:36,rHipA:18,lKnee:24,rKnee:58,lAnk:24,roll:-84,lean:4,lShF:32,rShF:42,lShA:132,rShA:96,lElb:34,rElb:44,lHand:.8,rHand:.8,neckP:6,dz:-.85});
const SIT=posed({lHipF:70,rHipF:84,lHipA:24,rHipA:20,lKnee:90,rKnee:104,roll:-28,lean:30,pitch:-50,lShF:20,rShF:40,lShA:40,rShA:60,lElb:40,rElb:30,neckP:-10,dz:-.7,lHand:.8,rHand:.8});
const T_BLOCK=.2,T_SHOT=0;
const MTZ_KEYS:[number,Pose][]=[[-.36,SET],[-.14,posed({...{lHipF:48,rHipF:48,lHipA:28,rHipA:28,lKnee:70,rKnee:70,lean:22,pitch:8,lShF:30,rShF:30,lShA:62,rShA:62,lElb:34,rElb:34,lHand:1,rHand:1,neckP:-10}})],[.04,STAR],[T_BLOCK,REACH],[.55,FALL],[.95,DOWN],[2.4,DOWN],[3.2,SIT],[4,stand()]];
const SETP:[number,number]=[7.2,-2.8];
/** the long ball and the shot spot (inferred), and where Martínez faces */
const SHOT_FROM:V3=[12.35,.11,-4.95];
const MY=yawOf(SHOT_FROM[0]-SETP[0],SHOT_FROM[2]-SETP[1]);
/** Martínez at τ: set and bouncing, the rush off his line (run), the set, the star, the reach, down, sitting up */
function mtzPose(tau:number):{p:Pose;yaw:number}{
 const v=velOf(MTZ_I,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(MTZ_I,tau),b=ballAt(tau);
 let yaw=tau>-.6?MY:sp>1.2?lerpA(yawOf(b[0]-x,b[2]-z),yawOf(v[0],v[1]),.35):yawOf(b[0]-x,b[2]-z);
 let p=keeperSet(tau*1.25);
 const run=runCycle(distOf(MTZ_I,tau)/3.1,{speed:clamp((sp-1.5)/3)});
 p=blendPose(p,run,sm(-1.8,-1.55,tau)*(1-sm(-.6,-.36,tau)));
 if(tau>-.6)p=blendPose(p,keyPoses(Math.max(-.36,tau),MTZ_KEYS),sm(-.6,-.36,tau));
 return{p,yaw};}
/** everyone else at τ (with their yaw) */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===MTZ_I)return mtzPose(tau);
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const idle=a.role==='ref'?stand():READY;
 let p:Pose;
 const faceBall=yawOf(b[0]-x,b[2]-z),backing=a.role==='arg'&&k!==OTA&&tau<-3.4&&sp>.6&&Math.cos(faceBall-yawOf(v[0],v[1]))<-.3;
 if(backing){yaw=faceBall;p=blendPose(idle,backpedal(distOf(k,tau)/1.3),clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(k===KONATE){const u=clamp((tau+6)/1.0+STRIKE_CONTACT),w=sm(-6.55,-6.4,tau)*(1-sm(-5.5,-5.2,tau));if(w>0){p=blendPose(p,strike(u,{foot:'r'}),w);yaw=lerpA(yaw,yawOf(-1,-.2),w);}}
 if(k===OTA){// the header he cannot reach: the ball bounces up past him
  const w=sm(-3.75,-3.6,tau)*(1-sm(-2.9,-2.65,tau));if(w>0){const hp=header(clamp((tau+3.3)/1.1+.5));hp.air*=.55;p=blendPose(p,hp,w);yaw=lerpA(yaw,yawOf(1,-.1),w);}}
 if(k===KM){const w=sm(-.62,-.5,tau)*(1-sm(.75,1.1,tau));if(w>0){p=blendPose(p,strike(clamp(tau/0.95+STRIKE_CONTACT),{foot:'r',power:.85}),w);yaw=lerpA(yaw,KM_YAW,sm(-.62,-.45,tau));}
  if(tau>1.1)p=blendPose(p,over(READY,{lShF:150,rShF:150,lShA:20,rShA:20,lElb:120,rElb:120,neckP:30,lean:20},1),sm(1.2,1.7,tau));// hands to his head (inferred)
  if(tau>-.6)yaw=lerpA(yaw,KM_YAW,1-sm(1,1.6,tau));}
 return{p,yaw};}
const KM_YAW=yawOf(0-SHOT_FROM[0],-2.4-SHOT_FROM[2]);
/** Kolo Muani's right boot meets the ball at the shot: his body is nudged so the solved toe lands on SHOT_FROM */
let _kmShift:[number,number]|null=null;
function kmShift():[number,number]{if(_kmShift)return _kmShift;const[x,z]=posOf(KM,0),sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.85}),ACTORS[KM].style.build,{x,z,yaw:KM_YAW});return _kmShift=[SHOT_FROM[0]-sk.rToe[0],SHOT_FROM[2]-sk.rToe[2]];}
function placeOf(k:number,tau:number,yaw:number):Place{const[x,z]=posOf(k,tau);if(k===KM){const d=kmShift(),w=sm(-.9,-.45,tau)*(1-sm(.9,1.5,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}

// ---------------------------------------------------------------- the ball: long ball, bounces, Kolo Muani's touch, the shot, the block, the rebound
const LAUNCH:V3=(()=>{const[x,z]=posOf(KONATE,-6);return[x-.5,.11,z+.1];})();
const BN1:V3=[24.8,.11,-3.0],BN2:V3=[20.1,.11,-3.5],BN3:V3=[18.0,.11,-3.8];
const TOUCH:V3=(()=>{const[x,z]=posOf(KM,-1.1),v=velOf(KM,-1.1),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.5,.11,z+v[1]/l*.5];})();
/** the block point: Martínez's lower left shin at T_BLOCK, pushed out by a ball radius toward the shooter (solved once from his body) */
const BLOCK:V3=(()=>{const p=keyPoses(T_BLOCK,MTZ_KEYS),sk=solve(p,MTZ.build,{x:SETP[0],z:SETP[1],yaw:MY}),a=lerp3(sk.lKn,sk.lAn,.72),d=nrm3([SHOT_FROM[0]-a[0],0,SHOT_FROM[2]-a[2]]);return[a[0]+d[0]*.13,Math.max(.14,a[1]),a[2]+d[2]*.13];})();
const REB1:V3=[11.6,.11,3.2],REB2:V3=[15.8,.11,7.4];
const hop=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
function ballAt(tau:number):V3{
 if(tau<-6){const[x,z]=posOf(KONATE,tau);return[x-.5,.11,z+.1];}
 if(tau<-3.3)return hop(LAUNCH,BN1,sm(-6,-3.3,tau,linear),8.9);
 if(tau<-2)return hop(BN1,BN2,sm(-3.3,-2,tau,linear),2.05);
 if(tau<-1.3)return hop(BN2,BN3,sm(-2,-1.3,tau,linear),.6);
 if(tau<-1.1)return hop(BN3,TOUCH,sm(-1.3,-1.1,tau,linear),.12);
 if(tau<T_SHOT)return hop(TOUCH,SHOT_FROM,sm(-1.1,T_SHOT,tau,u=>u*(1.5-.5*u)),0);
 if(tau<T_BLOCK)return lerp3(SHOT_FROM,BLOCK,(tau-T_SHOT)/(T_BLOCK-T_SHOT));
 if(tau<1.1)return hop(BLOCK,REB1,sm(T_BLOCK,1.1,tau,linear),1.3);
 const u=sm(1.1,2.6,tau,easeOut);return hop(REB1,REB2,u,.25*(1-u));
}

// ---------------------------------------------------------------- the ball print: Al Hilm (paper, gold triads, navy key)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.45,cy+Math.sin(b)*pr0*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(Y,pan,.95);s.fill(R,pan,.3);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;only?:number[];after?:(r:PlayOut)=>void;mtz?:(tau:number)=>{p:Pose;place:Place}}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=k===MTZ_I&&o.mtz?[o.mtz(tau).place.x!,o.mtz(tau).place.z!]:posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft, short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  let pose:Pose,place:Place,prev:Pose|undefined,prevPlace:Place|undefined;
  if(e.k===MTZ_I&&o.mtz){const m=o.mtz(tauP),mp=o.mtz(tauPrev);pose=m.p;place=m.place;prev=mp.p;prevPlace=mp.place;}
  else{const q=poseOf(e.k,tauP),qp=poseOf(e.k,tauPrev);pose=q.p;place=placeOf(e.k,tauP,q.yaw);prev=qp.p;prevPlace=placeOf(e.k,tauPrev,qp.yaw);place={...place,x:e.k===KM?place.x:e.x,z:e.k===KM?place.z:e.z};}
  // phone heat: low detail for small figures and extras; during a passage only the keeper keeps 'mid'
  const detail=passing?(e.k===MTZ_I?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const fast=(e.k===MTZ_I&&tauP>-.3&&tauP<.9)||(e.k===KM&&tauP>-.3&&tauP<.4);
  const r=drawPlayer(s,pose,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,big&&!passing?{prev,prevPlace,smear:hero&&fast}:{});
  if(e.k===MTZ_I)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** Martínez as the match plays him (place + pose) */
const mtzMatch=(tau:number)=>{const m=mtzPose(tau),[x,z]=posOf(MTZ_I,tau);return{p:m.p,place:{x,z,yaw:m.yaw} as Place};};
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- the angle: what the keeper's body hides of the goal (the lesson's measure)
const POST=3.66;
/** the part of the goal line his body covers, seen from the ball: rays from the ball through every limb end to the line X = 0 */
function coverOf(sk:ReturnType<typeof solve>,bx:number,bz:number):{lo:number;hi:number;jl:V3;jh:V3}{
 let lo=Infinity,hi=-Infinity,jl:V3=sk.pelvis,jh:V3=sk.pelvis;
 for(const j of [sk.lHa,sk.rHa,sk.lToe,sk.rToe,sk.lHeel,sk.rHeel,sk.lKn,sk.rKn,sk.lEl,sk.rEl,sk.head,sk.lSh,sk.rSh,sk.pelvis] as V3[]){if(bx-j[0]<.3)continue;const z=bz+(j[2]-bz)*bx/(bx-j[0]);if(z<lo){lo=z;jl=j;}if(z>hi){hi=z;jh=j;}}
 return{lo:clamp(lo,-POST,POST),hi:clamp(hi,-POST,POST),jl,jh};}
/** the shooting angle on the grass (yellow), his body's shadow on it (blue), the gaps left at the posts (red); w = fade */
function angleMarks(s:Sheet,c:Cam,sk:ReturnType<typeof solve>,w:number,o:{wedge?:number;gaps?:number}={}){
 if(w<=0)return;const{wedge=1,gaps=1}=o,bx=SHOT_FROM[0],bz=SHOT_FROM[2],cv=coverOf(sk,bx,bz);
 const tri=groundPoly(c,[[bx,bz],[0,-POST],[0,POST]]);
 if(tri.length>2&&wedge>0){const p=polyPath(tri,true);s.tone(Y,p,.7*w*wedge);s.stroke(Y,p,5,.95*w*wedge);}
 const shade=groundPoly(c,[[cv.jl[0],cv.jl[2]],[0,cv.lo],[0,cv.hi],[cv.jh[0],cv.jh[2]]],.02);
 if(shade.length>2){const p=polyPath(shade,true);s.knockout(p,.5*w);s.tone(B,p,.75*w);}
 if(gaps>0){const g=new Path2D(),L=(a:number,b:number)=>{if(b-a>.04)seg3(c,[0,.03,a],[0,.03,b],.32,g);};L(-POST,cv.lo);L(cv.hi,POST);
  const gw=new Path2D();for(const[a,b]of[[-POST,cv.lo],[cv.hi,POST]] as [number,number][])if(b-a>.04){const q=groundPoly(c,[[bx,bz],[0,a],[0,b]],.015);if(q.length>2)gw.addPath(polyPath(q,true));}
  s.tone(R,gw,.5*w*gaps);s.fill(R,g,.95*w*gaps);}
 return cv;}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera
const tau1=(t:number)=>{const lb=CUEW(0,'A long'),bo=CUEW(0,'bounces'),km=CUEW(0,'Randal'),th=CUEW(0,'is through'),oo=CUEW(0,'one on one'),S=SECS(0);
 return key(t,[[0,-9.8],[lb-.2,-6.2],[bo+.2,-3.3],[km+.4,-1.9],[th+.2,-1.15],[oo+.3,-.45],[S-1.4,.3],[S+1,1.6]],linear);};
const CAM1:V3=[40,23,66];
function cam1(t:number):Cam{
 const tau=tau1(t),lm=CUEW(0,'the very'),bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.4),b2=bs(tau-.8),bt:V3=[clamp((b0[0]+b1[0]+b2[0])/3,6.5,58),0,(b0[2]+b1[2]+b2[2])/3*.6];
 const open:V3=[48,11,-10],toBall=sm(lm-.8,lm+1.2,t,easeInOutSine),end=sm(CUEW(0,'one on one')-.5,SECS(0),t,easeInOutSine);
 const T=lerp3(lerp3(open,[bt[0],1.2,bt[2]],toBall),[9.8,.9,-3.9],end);
 const F=key(t,[[0,1150],[CUEW(0,'The World')+.6,1500],[lm+1.2,4300],[CUEW(0,'bounces'),5000],[CUEW(0,'is through'),6300],[CUEW(0,'one on one')+.3,9800],[SECS(0),10800]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(T_BLOCK,T_BLOCK+.4,tau),flash:sm(T_BLOCK+.05,T_BLOCK+.3,tau)*(1-sm(1.2,1.6,tau))});
  ground(s,c);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,mtz:mtzMatch});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MTZ_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:10.6,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low camera behind the shooter's right shoulder
const tau2=(t:number)=>{const S=SECS(1);return key(t,[[0,-2.2],[CUEW(1,'Emiliano'),-1.85],[CUEW(1,'races'),-1.55],[CUEW(1,'spreads')+.2,-.2],[CUEW(1,'blocks'),.1],[CUEW(1,'his left')+.2,.2],[CUEW(1,'his left')+.9,.24],[S,.75]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=posOf(MTZ_I,tau),k=posOf(KM,tau),push=sm(CUEW(1,'spreads')-.5,CUEW(1,'blocks'),t,easeInOutSine),leg=sm(CUEW(1,'blocks'),CUEW(1,'his left')+.3,t,easeInOutSine);
 const kw=.4*sm(-1.2,-.4,tau),mid:V3=[(m[0]*(1-kw)+k[0]*kw),.95,(m[1]*(1-kw)+k[1]*kw)],T=lerp3(mid,[BLOCK[0]+.2,.55,BLOCK[2]-.2],leg*.7);
 const C:V3=[lerp(20,17.5,push)-1*leg,lerp(1.7,1.35,push),lerp(-13.8,-12.5,push)];
 return look(C,T,4300-300*push+700*leg);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ra=CUEW(1,'races'),hl=CUEW(1,'his left');
  stadium(s,c,v,t);
  ground(s,c);
  // "races off his line": the path of his rush printed on the grass (yellow), fading as he sets
  const rw=sm(ra-.1,ra+.6,t,easeOut)*(1-sm(CUEW(1,'spreads')+.4,CUEW(1,'spreads')+1,t));
  if(rw>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const[mx,mz]=posOf(MTZ_I,lerp(-1.8,-.3,i/12)),q=pr(c,[mx,.02,mz]);if(q)pts.push(q);}
   if(pts.length>3){const d=toCam(c,[SETP[0],0,SETP[1]])[2],wd=c.F*.16/d;s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*rw);laneArrow(s,Y,pts[0],pts[pts.length-1],wd,{seed:62,head:wd*3,progress:rw});}}
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,mtz:mtzMatch,after:({hero})=>{
   // "his left leg": an orange-red ring round the left boot and a spark where the ball meets the shin
   const lw=sm(hl-.1,hl+.3,t,easeOutBack)*(1-sm(SECS(1)-1.2,SECS(1)-.8,t));
   if(hero&&lw>0){const toe=hero.joints.lToe,kn=hero.joints.lKn,r=Math.hypot(toe[0]-kn[0],toe[1]-kn[1])*.75*lw+2,cx=lerp(toe[0],kn[0],.35),cy=lerp(toe[1],kn[1],.35),pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*.8]);}
    s.knockout(ribbon(pts,Math.max(5,r*.22),{seed:82,close:true,taper:0,wobble:.8}),.8*lw);s.fill(R,ribbon(pts,Math.max(3,r*.13),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}
   const age=tau-T_BLOCK,bq=pr(c,BLOCK);if(bq&&age>-.01&&age<.3){const d=toCam(c,BLOCK)[2];sparkBurst(s,Y,bq[0],bq[1],c.F*.55/d,{n:9,seed:83,g:easeOutBack(clamp((age+.01)/.05))*(1-clamp((age-.18)/.12)),width:Math.max(6,c.F*.04/d)});}
   }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(MTZ_I,tau2(t)),q=toCam(c,[m[0],1.1,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.3/q[2]),12);},
 still:7.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: how little space he leaves, down, the crowd
const tau3=(t:number)=>{const sh=CUEW(2,'see how'),hl=CUEW(2,'he leaves'),ar=CUEW(2,'Argentina'),S=SECS(2);return key(t,[[0,-.75],[sh,.02],[hl+.6,.08],[ar-.3,.2],[ar+.8,1.1],[S,3.3]],linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),push=sm(CUEW(2,'see how')-.6,CUEW(2,'he leaves'),t,easeInOutSine),up=sm(CUEW(2,'Argentina')-.2,SECS(2),t,easeInOutSine);
 const C:V3=[-3.6+1*push-2.5*up,1.75+.2*push+4.5*up,-2.4-.3*push],T:V3=[lerp(9,8.2,push),lerp(1.05,.9,push)+3*up,lerp(-3.5,-3.2,push)];
 void tau;return look(C,T,lerp(2600,3300,push)*(1-.15*up));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sh=CUEW(2,'see how'),ar=CUEW(2,'Argentina'),wn=CUEW(2,'win');
  stadium(s,c,v,t,{roar:sm(ar-.1,ar+.4,t),flash:sm(ar,ar+.3,t)});
  ground(s,c,{goalLater:true});
  // "how little space": the slivers of goal he leaves flash red on the goal line
  const gw=sm(sh-.1,sh+.4,t)*(1-sm(ar-.6,ar-.2,t));
  if(gw>0){const m=mtzMatch(tau3(twos(t))),sk=solve(m.p,MTZ.build,m.place);angleMarks(s,c,sk,gw,{wedge:0});}
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,mtz:mtzMatch});
  goal3(s,c,0,-1);
  // "win the World Cup": sky-blue and white paper ribbons rain over the frame
  const cw=sm(wn-.2,wn+.4,t);if(cw>0){const fall=(t-wn)*260;confetti(s,[B,'paper',Y],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(90*cw),71,{size:44,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),m=posOf(MTZ_I,tau3(t)),q=toCam(c,[m[0],1,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.3/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · the lesson: from above the goal, the angle and the star
const LINE:[number,number]=[.9,-.4];
/** the lesson keeper: on his line, then rushing out along the angle to the set spot, set, then spreading into the star */
function lessonMtz(t:number):{p:Pose;place:Place}{
 const ru=CUEW(3,'rush'),mk=CUEW(3,'make'),sp=CUEW(3,'Spread'),u=sm(ru-.1,ru+1.2,t,easeInOutSine),x=lerp(LINE[0],SETP[0],u),z=lerp(LINE[1],SETP[1],u);
 let p=keeperSet(t*1.3);const moving=bump(ru-.1,ru+1.3,t);
 p=blendPose(p,runCycle(u*2.4,{speed:.7}),clamp(moving*1.6));
 p=blendPose(p,SET,sm(ru+1,ru+1.4,t));
 p=blendPose(p,STAR,sm(mk-.1,mk+.5,t,easeOutBack)*.7+sm(sp-.2,sp+.4,t)*.3);
 return{p,place:{x,z,yaw:MY}};}
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'make')-.4,CUEW(3,'make')+.6,t,easeInOutSine),back=sm(CUEW(3,'legs')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[-8.5+1.5*push-.8*back,7.2-1.2*push,-1.6],T:V3=[7.2+.6*push,.2+.5*push,-3.2];
 return look(C,T,2350+700*push-200*back);}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),yt=CUEW(3,'Your'),ru=CUEW(3,'rush'),ca=CUEW(3,'close'),mk=CUEW(3,'make'),sp=CUEW(3,'Spread'),lg=CUEW(3,'legs'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const m=lessonMtz(twos(t)),sk=solve(m.p,MTZ.build,m.place);
  // "close the angle": the shooting angle on the grass; his shadow grows as he comes out; the gaps at the posts shrink
  const aw=sm(yt+.4,ru,t)*(1-sm(E-.8,E-.3,t));
  angleMarks(s,c,sk,aw,{gaps:sm(ru-.3,ru+.2,t)});
  // the keeper he was, left on the line, as a yellow ghost (compare how much less he covers there)
  const gw=sm(ru+.2,ca,t)*(1-sm(mk+1.2,mk+1.8,t));if(gw>0)drawPlayer(s,keeperSet(0),c,GHOST,{x:LINE[0],z:LINE[1],yaw:MY});
  play(s,c,v,-.1,-.1,-.1-1/12,{minBall:5,hero:true,only:[MTZ_I,KM],mtz:tt=>lessonMtz(twos(t)+(tt+.1)),after:({hero})=>{
   if(!hero)return;const J=hero.joints,ctr:Pt=J.chest;
   // "Spread your arms" / "legs wide": yellow arrows out along the limbs
   const arm=sm(sp-.1,sp+.4,t,easeOut)*(1-sm(E-.7,E-.3,t)),leg=sm(lg-.1,lg+.4,t,easeOut)*(1-sm(E-.7,E-.3,t)),out=(a:Pt,b:Pt,k:number):[Pt,Pt]=>{const dx=b[0]-a[0],dy=b[1]-a[1];return[[b[0]+dx*.1,b[1]+dy*.1],[b[0]+dx*k,b[1]+dy*k]];};
   const u=Math.hypot(J.head[0]-J.neck[0],J.head[1]-J.neck[1])*.9+6;
   if(arm>0)for(const h of [J.lHa,J.rHa]){const[a,b]=out(ctr,h,.55);s.knockout(ribbon([a,b],u*.9,{seed:71,taper:.1}),.8*arm);laneArrow(s,Y,a,b,u*.45,{progress:arm,seed:72,head:u*1.4});}
   if(leg>0)for(const f of [J.lToe,J.rToe]){const[a,b]=out(J.pelvis,f,.45);s.knockout(ribbon([a,b],u*.9,{seed:73,taper:.1}),.8*leg);laneArrow(s,Y,a,b,u*.45,{progress:leg,seed:74,head:u*1.4});}
   // "make yourself big": a ring bursts round him as he spreads
   const age=t-mk;if(age>-.1&&age<.7)sparkBurst(s,Y,ctr[0],ctr[1],u*6,{n:12,seed:75,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.45)/.25)),width:u*.35});}});
 },
 still:8.4,
};

const film:RisoStory={
 id:'martinez-save-2022',format:'11v11',title:"Dibu Martínez's last-minute save",theme:'Keepers: rush out to close the angle, then make yourself big',
 ageNote:'World Cup final, Argentina v France, Lusail Stadium, Qatar, 18 December 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flick of turf and a glove-spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
/** Solved contacts (pitch metres; Argentina's goal line at X = 0, Z across, −Z = Martínez's left) — checked by the film test. */
export const FACTS={SHOT_FROM,BLOCK,SETP,T_BLOCK,ballAt,mtzAt:(tau:number)=>{const m=mtzMatch(tau);return solve(m.p,MTZ.build,m.place);},kmToeAt:(tau:number)=>{const q=poseOf(KM,tau);return solve(q.p,ACTORS[KM].style.build,placeOf(KM,tau,q.yaw)).rToe;},cover:(tau:number)=>{const m=mtzMatch(tau);return coverOf(solve(m.p,MTZ.build,m.place),SHOT_FROM[0],SHOT_FROM[2]);}};
