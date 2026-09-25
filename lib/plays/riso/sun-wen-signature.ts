/** Sun Wen v Norway, FIFA Women's World Cup semi-final, Foxboro Stadium, Foxborough, Massachusetts, 4 July 1999 (China 5–0): her
 * third-minute goal. An iconic-play riso film (RisoStory, chapters mode) for Sun Wen's SIGNATURE entry ("the clever finish": find space
 * where the defenders are not looking, then finish quickly): a 1:1 reconstruction from written accounts (we cannot watch the footage),
 * printed as a riso sheet.
 * WHY THIS MOMENT: it is her best-described goal of the 1999 World Cup, the tournament she won the Golden Ball and the Golden Boot at.
 * Two written accounts describe it: while everyone went to Jin Yan's shot and the keeper's save, Sun was free in front of goal, "trapped
 * the rebound, turned hard and drilled a left-footed shot" — the clever finish exactly: in the space nobody was watching, and quick.
 *
 * SOURCES (what the choreography and kits follow):
 *  - Associated Press match report on CNN/SI, "China rolls into final with 5-0 rout of defending champ Norway" (4 July 1999), archived:
 *    https://web.archive.org/web/1999/http://sportsillustrated.cnn.com:80/soccer/world/1999/womens_worldcup/news/1999/07/04/china_norway/
 *    (and its AP photograph t1_sun_ap_01.jpg: Sun, No. 9, celebrating with teammates — the kit)
 *  - Philip Hersh, Chicago Tribune, "Hot? Chinese star Sun blazing" (6 July 1999):
 *    https://www.chicagotribune.com/1999/07/06/hot-chinese-star-sun-blazing/
 *  - Wikipedia, "1999 FIFA Women's World Cup knockout stage" (date, 19:30 EDT kick-off, scorers and minutes, stadium, attendance 28,986,
 *    referee) and "Sun Wen (footballer)" (Golden Ball, Golden Boot, seven goals at the tournament, FIFA Female Player of the Century).
 * CONFIRMED by those accounts: Sunday 4 July 1999, Foxboro Stadium, a "steamy" evening, 87 °F at kick-off; 28,986 in the 58,868-seat
 * stadium, a crowd "largely subdued"; the third minute; "Liu [Ailing] kicked the ball from about 35 yards, leading Jin Yan into the box.
 * Nordby made a kick save on Jin's 12-yard shot and went to the ground. She got up but was beaten by Sun's left-footer for a 1-0 lead"
 * (AP); "Sun trapped the rebound …, turned hard and drilled a left-footed shot that put China ahead for good" (Tribune); Sun wore No. 9
 * and captained China; she scored again from a penalty (72'), China won 5–0. KITS (the AP photo): China all in white — white shirts with
 * red side panels and red numbers, white shorts with a red hem, white socks with red tops; Sun's hair dark and short.
 * A CONFLICT, followed as noted: the Tribune calls it "the rebound of a corner kick"; the AP gives the play in order (Liu's long ball, Jin's
 * shot, Nordby's kick save), which the film follows. Neither the corner nor the pass is named in the narration's detail beyond the AP's.
 * INFERRED (illustrative): Norway's kit (red shirts, white shorts, blue socks — their usual home colours; they are not in the photo);
 * Bente Nordby's goalkeeper kit; the direction of play and the side of the box (drawn centre-right, under the main-stand camera); where
 * Liu, Jin and Sun stood and ran; the exact spot of the pass, Jin's shot (from the AP's 12 yards) and her right foot; which leg Nordby
 * saved with and how she fell and got up; the rebound's flight; which foot Sun trapped with (her left), the turn to her left and the
 * corner she scored in (low, the side Nordby had left); every other player's position (others are unnumbered on purpose); that the
 * defenders were all watching Jin's shot (the lesson's reading of an unmarked trap-and-turn); everyone's hair apart from Sun's; Foxboro
 * Stadium's shape as drawn (one low, open, oval bank of seats, half full), the evening light, the crowd colours, the ad boards, the camera
 * placements and lenses; the celebration.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera in real
 * time: Liu's long ball, Jin's shot, the save, Sun's finish; 2 = slow-motion replay from a low camera behind Sun: the defenders all
 * watching Jin (red sightlines), Sun alone in the space (a yellow ring); 3 = slow-motion replay from behind the goal: the kick save, the
 * rebound out to her, the trap, the hard turn (red turn arrow), the left foot, then the crowd; 4 = the lesson from behind and above Sun:
 * the space ring, the defenders' sightlines, the ball coming to her, the quick finish. All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded.
 *
 * LEAD: when public/plays/narration/sun-wen-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/sun-wen-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Near Boston, 1999. The World Cup semi-final: China against Norway. Liu Ailing’s long pass finds Jin Yan. Saved... but Sun Wen scores!',seconds:12.2,
  cues:[[.2,'Near Boston'],[1.7,'The World Cup semi-final'],[3.7,'China against Norway'],[5.4,'Liu Ailing'],[6.4,'long pass'],[7.2,'finds Jin Yan'],[8.6,'Saved'],[9.5,'but Sun Wen'],[10.5,'scores']]},
 {label:'Watch again',text:'Watch again, slowly. The defenders all watch Jin Yan’s shot. Sun Wen waits in the space behind them, where nobody is looking.',seconds:9.6,
  cues:[[.15,'Watch again'],[1.7,'The defenders'],[2.7,'watch Jin Yan'],[4.4,'Sun Wen waits'],[5.4,'in the space'],[7.2,'nobody is looking']]},
 {label:'Trap, turn, shoot',text:'The keeper saves, and the ball bounces out to Sun. She traps it, turns hard, and scores with her left foot! Only three minutes gone!',seconds:10,
  cues:[[.15,'The keeper saves'],[1.6,'the ball bounces out'],[3.4,'She traps it'],[4.3,'turns hard'],[5.3,'scores with her left foot'],[7.5,'Only three minutes']]},
 {label:'Your turn',text:'Your turn: find space where the defenders are not looking. When the ball comes to you, finish quickly!',seconds:8.4,
  cues:[[.15,'Your turn'],[.9,'find space'],[2.3,'defenders are not looking'],[4.2,'When the ball comes'],[5.8,'finish quickly']]},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py sun-wen-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/sun-wen-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('sun-wen: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (China attack +X; Norway's goal line at X = 105), Y up, Z across
 * (+34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. Nordby, facing −X, has the +Z post
 * on her LEFT. */
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
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
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

// ---------------------------------------------------------------- Foxboro Stadium: one low, open, oval bank of seats on a steamy evening
const CX=52.5,NS=52;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.35),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),.35)];}
/** one tier of bench seating, [d, y] at its front and back */
const TIER:[number,number,number,number]=[2,1.4,36,19];
type Bowl={seats:V3[][];wall:V3[][];top:V3[][];crowd:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seats:[],wall:[],top:[],crowd:[]};const[d0,y0,d1,y1]=TIER;
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;
  o.seats.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // 28,986 in 58,868 seats (confirmed): about half the benches are empty, more of them high up
  for(let r=0;r<10;r++)for(let j=0;j<3;j++){const h=hash(i*977+r*31+j*7,11),u=(r+.5)/10;if(h<.36+.3*u)continue;o.crowd.push({P:rim((i+(j+.5+(hash(i+r*13+j,4)-.5)*.5)/3)/NS*TAU,lerp(d0,d1,u),lerp(y0,y1,u)+.45),h});}
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,d0,y0),rim(a,d0,y0)]);
  o.top.push([rim(a,d1,y1),rim(b,d1,y1),rim(b,d1+.6,y1+2.4),rim(a,d1+.6,y1+2.4)]);}
 return o;})();
/** everything behind the pitch: the warm evening sky, the bank of seats, the crowd (roar lifts the marks, flash = flag-waving sparkle) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 const sky=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,sky,.22);s.tone(Y,sky,.14);
 const seats=new Path2D(),wall=new Path2D(),top=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=polyP(c,q);if(r.length>2)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.seats[i],seats);add(BOWL.wall[i],wall);add(BOWL.top[i],top);}
 // bare aluminium benches: paper with a cool screen
 s.knockout(seats);s.tone(B,seats,.14);s.tone(K,seats,.08);
 // the crowd: white shirts (paper), red (both teams' fans), blue, a little yellow and navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.crowd){const d=toCam(c,q.P);if(d[2]<12)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.55?0:q.h<.72?1:q.h<.84?2:q.h<.92?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.85);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.75);
 // the pitch-level wall navy-blue; the rim a navy lip against the sky
 s.knockout(wall);s.fill(B,wall,.75);s.tone(K,wall,.35);s.knockout(top);s.fill(K,top,.4);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.crowd[Math.floor(hash(i*17+T12*101,3)*BOWL.crowd.length)],d=toCam(c,q.P);if(d[2]<12)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the grass surround, the pitch (yellow × blue) with mowing stripes, ad boards, paper lines, the far goal and the corner flags */
function ground(s:Sheet,c:Cam){
 const sur=polyP(c,[[-10,0,-41],[115,0,-41],[115,0,41],[-10,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.72);}
 const g=polyP(c,[[-3,0,-37],[108,0,-37],[108,0,37],[-3,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // ad boards: the far touchline and behind the goals (navy, with paper panels)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-38.5],[110,0,-38.5],[110,.9,-38.5],[-4,.9,-38.5]]),polyP(c,[[110.5,0,-36],[110.5,0,36],[110.5,.9,36],[110.5,.9,-36]]),polyP(c,[[-5.5,0,36],[-5.5,0,-36],[-5.5,.9,-36],[-5.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.65,-38.45],[x,.65,-38.45]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[110.45,.25,z],[110.45,.25,z+3.4],[110.45,.65,z+3.4],[110.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.85);s.knockout(pn,.85);s.fill(R,pn,.35);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(105,34,1,Math.PI,1.5*Math.PI,5);circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 goal3(s,c,0,-1);
 // corner flags (navy poles, yellow flags) at Norway's end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);const a=pr(c,[105,1.55,z]),b=pr(c,[105,1.4,z-Math.sign(z)*.45]),e=pr(c,[105,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep. net = paper haze strength (lighter when the camera looks through it). */
const GOAL={x:105,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,X:number,d:number,net=.3,bulge?:{z:number;y:number;k:number}){
 const z0=-3.66,z1=3.66,H=2.44,bx=X+d*2;
 const bb=(z:number,y:number)=>bulge?bx+d*.55*bulge.k*Math.max(0,1-Math.hypot(z-bulge.z,(y-bulge.y)*1.3)/1.8):bx;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const n=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)n.addPath(polyPath(q,true));}
 s.knockout(n,net);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bb(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[bb(z,y0),y0,z],[bb(z,y1),y1,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=lerp(z0,z1,i/4),zb=lerp(z0,z1,(i+1)/4);seg3(c,[bb(za,y),y,za],[bb(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_E:InkFill[]=[[Y,.4],[R,.2]];
const SKIN_L:InkFill[]=[[Y,.32],[R,.18]];
/** women footballers: athletic builds, a touch slimmer through the shoulders; heights illustrative */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.92,thighs:o.thighs??1.06,head:1.03});
/** China 4 July 1999 (the AP photo): all white — white shirts with red trim and red numbers, white shorts, white socks with red tops */
const CHN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_E,hair:[K,.85],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:R,build:W(1.66),seed:5,...o});
/** Sun Wen: No. 9 and the captain (confirmed); dark, short hair (the AP photo); small and quick ("despite her size", Tribune) */
const SUN:AthleteStyle=CHN({number:9,hair:[K,.9],hairStyle:'short',build:W(1.62,{bulk:.93,thighs:1.12}),seed:9});
/** Liu Ailing and Jin Yan: named in the AP account; numbers left off (not verified); hair inferred */
const LIU:AthleteStyle=CHN({hair:[K,.85],hairStyle:'short',build:W(1.64),seed:10});
const JIN:AthleteStyle=CHN({hair:[K,.85],hairStyle:'ponytail',build:W(1.67),seed:11});
/** Norway (inferred: their usual red shirts, white shorts, blue socks; China were in white) */
const NOR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:'paper',socks:B,boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',build:W(1.72,{bulk:.95}),seed:31,...o});
/** Bente Nordby: goalkeeper kit inferred (navy, yellow gloves); fair hair inferred */
const NORDBY:AthleteStyle={shirt:[K,.92],trim:Y,shorts:[K,.92],socks:[K,.88],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'long',gloves:[Y,.9],build:W(1.72,{bulk:.98}),seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: ponytails and hems trail); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds, T = 0 = Liu strikes the long ball)
const FIG=1.06;// figures 6 % over life size so they read in a small card window
/** the beats: Jin gets to the ball, Jin shoots, Nordby's kick save, the rebound reaches Sun's left foot, the left-foot shot, in the net */
const T_RECV=1.95,T_JSHOT=2.5,T_SAVE=2.82,T_TRAP=3.72,T_SHOT=4.32,T_GOAL=4.9;
type Role='sun'|'gk'|'passer'|'jin'|'chn'|'nor';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, X, Z]. Only Liu, Jin, Nordby and Sun have beats in the accounts; everyone else is an
 * illustrative marker, unnamed and unnumbered. The Norway players all converge on Jin's shot, away from Sun (the lesson's reading). */
const ACTORS:Actor[]=[
 {name:'Sun',role:'sun',style:SUN,key:true,keys:[[-3,80.2,9.4],[0,83.4,7.8],[1,85.5,6.6],[1.9,87.1,5.6],[2.5,87.8,5.1],[3,88.25,4.8],[3.4,88.6,4.6],[3.72,88.85,4.45],[4.05,89.1,4.3],[4.32,89.3,4.2],[4.7,89.9,4.3],[5.6,91.2,6.8],[7,92.3,10.5],[9,93,14]]},
 {name:'Nordby',role:'gk',style:NORDBY,key:true,keys:[[-3,103.6,.2],[0,103.4,-.3],[1.4,102.6,-1.2],[2.3,101.95,-1.75],[2.82,101.8,-1.85],[3.6,101.8,-1.85],[4.1,101.95,-1.1],[4.35,102.05,-.7],[9,102.05,-.7]]},
 {name:'Liu',role:'passer',style:LIU,key:true,keys:[[-3,68.3,6.4],[-1.2,70.6,5.1],[-.4,71.9,4.3],[0,72.4,3.9],[.6,72.9,3.6],[2.5,75.2,2.6],[5,79,2],[9,82,1.5]]},
 {name:'Jin',role:'jin',style:JIN,key:true,keys:[[-3,79.2,-9.6],[0,83.7,-8.2],[1,87.5,-6.5],[1.95,92.2,-4.8],[2.5,94.1,-4.1],[2.9,94.9,-3.85],[3.6,94.9,-3.4],[5,95.3,-2.8],[9,95,-2]]},
 {name:'nor2',role:'nor',style:NOR({seed:32,hair:[Y,.7]}),keys:[[-3,89.6,-8.4],[0,91.2,-7.6],[1.5,92.9,-6.1],[2.5,95.2,-4.9],[3.5,96.5,-3.8],[5,96.6,-2.2],[9,96,-1]]},
 {name:'nor3',role:'nor',style:NOR({seed:33,hairStyle:'short',hair:[Y,.8]}),keys:[[-3,93,-.8],[0,93.4,-1.4],[2,95.4,-2.3],[3,97.3,-1.6],[4.2,98.1,.1],[5,98,1],[9,97.5,1.5]]},
 {name:'nor4',role:'nor',style:NOR({seed:34,hair:[K,.7]}),keys:[[-3,92,6.4],[0,92.8,5.4],[2,95.5,2],[3,97.2,.7],[4.4,97.3,2],[9,97,3]]},
 {name:'nor5',role:'nor',style:NOR({seed:35,hair:[Y,.85]}),keys:[[-3,94,-14],[0,95,-13],[2.5,97.4,-8.6],[4.5,98.4,-6],[9,98,-4]]},
 {name:'nor6',role:'nor',style:NOR({seed:36,hairStyle:'short',hair:[Y,.6]}),keys:[[-3,77.5,1.2],[0,80.2,.2],[2,84.4,-1.4],[3.5,86.4,-.9],[4.4,87.4,.5],[9,89,2.5]]},
 {name:'nor7',role:'nor',style:NOR({seed:37,hair:[Y,.75]}),keys:[[-3,95,13.2],[0,95.5,12.8],[2.5,96.6,11.2],[4.5,96.9,10.2],[9,96.6,9.6]]},
 {name:'chn4',role:'chn',style:CHN({seed:42,hairStyle:'short'}),keys:[[-3,81.5,-1.8],[0,84.8,-2],[2,89.6,-.9],[3,92,-.1],[4,93.6,.4],[9,94.6,1]]},
 {name:'chn5',role:'chn',style:CHN({seed:43}),keys:[[-3,76,-14.5],[0,79,-13.2],[3,85,-10.6],[9,89,-7]]},
 {name:'chn6',role:'chn',style:CHN({seed:44,hairStyle:'short'}),keys:[[-3,65.5,-2.4],[0,67.8,-1.2],[4,74,1],[9,78,2]]},
];
const SUN_I=0,GK_I=1,PASS_I=2,JIN_I=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
/** Sun's facings: drifting toward the near side, the rebound arriving on her LEFT (from the goal); then the hard turn left to face goal */
const SUN_FACE_TRAP=yawOf(.5,.87),SUN_FACE_SHOT=yawOf(105-89.6,2.8-4.2)+14*RAD;
/** Sun's trap and turn (confirmed: "trapped the rebound, turned hard"): the left foot reaches out to cushion the ball arriving from her left,
 * arms out for balance, chin down; then she drags it round as she spins left on her right foot and plants for the shot */
const TRAP=(T:number)=>keyPoses(T,[
 [T_TRAP-.5,posed({lHipF:14,rHipF:16,lKnee:24,rKnee:24,lShA:30,rShA:30,lElb:50,rElb:50,lean:10,pitch:2,neckP:6,neckY:40})],
 [T_TRAP-.14,posed({lHipF:22,lHipA:28,lHipR:36,lKnee:44,lAnk:-12,rHipF:16,rKnee:34,lShA:58,rShA:50,lShF:10,rShF:14,lElb:44,rElb:50,lean:12,bend:8,neckP:28,neckY:34})],
 [T_TRAP,posed({lHipF:16,lHipA:22,lHipR:38,lKnee:36,lAnk:-10,rHipF:16,rKnee:38,lShA:62,rShA:52,lElb:40,rElb:48,lean:14,bend:8,neckP:38,neckY:22,squash:-.04})],
 [T_TRAP+.18,posed({lHipF:34,lHipA:12,lHipR:18,lKnee:56,lAnk:4,rHipF:10,rKnee:40,lShA:48,rShA:62,lElb:46,rElb:40,lean:18,bend:-6,twist:16,neckP:32,neckY:8})],
 [T_SHOT-.3,posed({rHipF:26,rKnee:42,lHipF:-22,lKnee:74,lAnk:30,lShA:66,rShA:38,rShF:-20,lElb:34,rElb:46,lean:12,twist:14,bend:-8,neckP:30,squash:-.05})],
],{});
/** the finish: a full left-foot strike, drilled low, contact at T_SHOT */
const SHOT=(T:number)=>strike(clamp((T-T_SHOT)/.95+STRIKE_CONTACT),{foot:'l',power:1});
function sunYaw(T:number):number{const v=velOf(SUN_I,T),run=yawOf(v[0],v[1]),b=ballAt(T),[x,z]=posOf(SUN_I,T),watch=yawOf(b[0]-x,b[2]-z);
 if(T<1.6)return run;
 if(T<2.9)return lerpA(run,watch,sm(1.6,2.2,T));// watching the play like everyone else, but in the space
 if(T<T_TRAP+.06)return lerpA(watch,SUN_FACE_TRAP,sm(2.9,3.45,T,easeInOutSine));
 if(T<T_SHOT+.4)return lerpA(SUN_FACE_TRAP,SUN_FACE_SHOT,sm(T_TRAP+.04,T_SHOT-.26,T,easeInOutSine));// the hard turn
 return lerpA(SUN_FACE_SHOT,run,sm(T_SHOT+.4,T_SHOT+.9,T));}
/** Jin's right-foot shot from the AP's 12 yards (the foot is inferred) */
const JSHOT=(T:number)=>strike(clamp((T-T_JSHOT)/.9+STRIKE_CONTACT),{foot:'r',power:.9});
const JIN_FACE_SHOT=yawOf(105-93.3,-2.9+4.1)-14*RAD;
/** Nordby: the kick save with her right leg (a jab to her right, full reach at T_SAVE), down on the ground, up again, then too late */
const NORD_SAVE=(T:number)=>lunge(clamp((T-T_SAVE)/.7+.6),{side:'r'});
const NORD_DOWN=(T:number)=>{const p=keeperDive(clamp(.86+(T-T_SAVE)/.6*.14),{side:'r',height:0});p.dz=-.35;return p;};
const NORD_LATE=(T:number)=>keeperDive(clamp((T-(T_SHOT+.04))/.8+.05),{side:'r',height:.1});// her dive toward the +Z post (the athlete's dive sides read mirrored in this world)
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T),b=ballAt(T);
 // everyone off the ball watches the ball
 let yaw=sp>1.6?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(T*1.3):stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='passer'){yaw=lerpA(yaw,PASS_YAW,sm(-1,-.3,T)*(1-sm(.8,1.6,T)));const u=(T+STRIKE_CONTACT)/1.0;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='jin'){const v2=velOf(k,T);yaw=T<T_RECV?yawOf(v2[0],v2[1]):lerpA(yawOf(v2[0],v2[1]),JIN_FACE_SHOT,sm(T_RECV,T_JSHOT-.25,T));
  const w=sm(T_JSHOT-.5,T_JSHOT-.3,T)*(1-sm(T_JSHOT+.45,T_JSHOT+.7,T));if(w>0)p=blendPose(p,JSHOT(T),w);
  if(T>T_JSHOT+.7)yaw=lerpA(JIN_FACE_SHOT,yawOf(b[0]-x,b[2]-z),sm(T_JSHOT+.7,T_JSHOT+1.1,T));}
 if(a.role==='sun'){yaw=sunYaw(T);
  const wt=sm(T_TRAP-.7,T_TRAP-.45,T)*(1-sm(T_SHOT-.45,T_SHOT-.3,T));if(wt>0)p=blendPose(p,TRAP(T),wt);
  const ws=sm(T_SHOT-.45,T_SHOT-.3,T)*(1-sm(T_SHOT+.45,T_SHOT+.7,T));if(ws>0)p=blendPose(p,SHOT(T),ws);
  // the celebration: a run toward the main stand, arms out, then the jump with both arms up
  if(T>T_GOAL+.2){const wc=sm(T_GOAL+.2,T_GOAL+.6,T);p=blendPose(p,T<T_GOAL+2.6?celebrate(distOf(k,T)/3.3,{kind:'run'}):celebrate((T-T_GOAL-2.6)*1.1,{kind:'arms'}),wc);
   if(T>T_GOAL+2.3)yaw=lerpA(yaw,yawOf(-.6,1),sm(T_GOAL+2.3,T_GOAL+2.8,T));}}
 if(a.role==='gk'){
  if(T<T_SAVE+.05)yaw=lerpA(lerpA(Math.PI,yawOf(b[0]-x,b[2]-z),.75),GK_YAW_SAVE,sm(T_JSHOT-.4,T_JSHOT-.05,T));
  else if(T<3.7)yaw=GK_YAW_SAVE;
  else yaw=lerpA(GK_YAW_SAVE,yawOf(b[0]-x,b[2]-z),sm(3.7,4.2,T));
  if(T>T_SAVE-.4&&T<T_SHOT-.1){
   const ws=sm(T_SAVE-.4,T_SAVE-.25,T);p=blendPose(p,NORD_SAVE(Math.min(T,T_SAVE+.02)),ws);
   const wd=sm(T_SAVE+.04,T_SAVE+.36,T)*(1-sm(3.55,4.2,T,easeInOutSine));if(wd>0)p=blendPose(p,NORD_DOWN(T),wd);}
  if(T>=T_SHOT-.1)p=blendPose(keeperSet(T*1.3),NORD_LATE(T),sm(T_SHOT,T_SHOT+.12,T));}
 if(a.role==='chn'&&T>T_GOAL+.6){p=blendPose(p,celebrate((T-T_GOAL)*1.1+k*.3,{kind:'arms'}),sm(T_GOAL+.6,T_GOAL+1.1,T)*clamp(1-(sp-.8)/1.5));}
 if(a.role==='jin'&&T>T_GOAL+.5){p=blendPose(p,celebrate((T-T_GOAL)*1.1+.6,{kind:'arms'}),sm(T_GOAL+.5,T_GOAL+1,T));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
let PASS_YAW=yawOf(91.3-72.4,-4.85-3.9),GK_YAW_SAVE=yawOf(93.3-101.8,-4.1+1.85);
function skAt(k:number,T:number){const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T);return solve(p,ACTORS[k].style.build,{x,z,yaw},FIG);}
// ballAt is referenced by poseOf (the facings) before the contacts exist: until they are solved the ball rests at Liu's feet
let BALL0:V3=[72.7,.11,3.9],RECV:V3=[91.8,.11,-4.7],JSHOT_PT:V3=[93.4,.11,-4.1],SAVE_PT:V3=[101.3,.15,-2.3],TRAP_PT:V3=[88.9,.2,3.9],SHOT_PT:V3=[89.6,.11,4.1],SOLVED=false;
/** low into the corner Nordby had left (inferred), the net and the rest after it */
const LOW:V3=[105.1,.42,2.75],NET:V3=[106.6,.36,2.6],REST:V3=[106.4,.11,2.4];
/** the ball at play time T: Liu's long ball into Jin's run, Jin's touch and shot, the kick save, the rebound out to Sun, her trap and drag
 * round, the left-foot shot, the net */
function ballAt(T:number):V3{
 if(T<0||!SOLVED)return BALL0;
 if(T<T_RECV)return lerp3(BALL0,RECV,T/T_RECV,1.3);
 if(T<T_JSHOT)return lerp3(RECV,JSHOT_PT,sm(T_RECV,T_JSHOT,T,u=>u*(1.4-.4*u)));
 if(T<T_SAVE)return lerp3(JSHOT_PT,SAVE_PT,(T-T_JSHOT)/(T_SAVE-T_JSHOT),.12);
 if(T<T_TRAP)return lerp3(SAVE_PT,TRAP_PT,sm(T_SAVE,T_TRAP,T,u=>u*(1.3-.3*u)),1.5);
 if(T<T_SHOT)return lerp3(TRAP_PT,SHOT_PT,sm(T_TRAP,T_SHOT,T,easeInOutSine));
 if(T<T_GOAL)return lerp3(SHOT_PT,LOW,(T-T_SHOT)/(T_GOAL-T_SHOT),.18);
 if(T<T_GOAL+.18)return lerp3(LOW,NET,(T-T_GOAL)/.18);
 if(T<T_GOAL+.75)return lerp3(NET,REST,sm(T_GOAL+.18,T_GOAL+.75,T,u=>u*u));
 return REST;
}
{const[jx,jz]=posOf(JIN_I,T_RECV),[lx,lz]=posOf(PASS_I,0);PASS_YAW=yawOf(jx-lx,jz-lz);
 const sp=skAt(PASS_I,0);BALL0=[sp.rToe[0],.11,sp.rToe[2]];
 const jv=velOf(JIN_I,T_RECV),jl=Math.hypot(jv[0],jv[1])||1;RECV=[jx+jv[0]/jl*.55,.11,jz+jv[1]/jl*.55];
 const sj=skAt(JIN_I,T_JSHOT);JSHOT_PT=[sj.rToe[0],Math.max(.11,sj.rToe[1]),sj.rToe[2]];
 const[gx,gz]=posOf(GK_I,T_SAVE);GK_YAW_SAVE=yawOf(JSHOT_PT[0]-gx,JSHOT_PT[2]-gz);
 const sg=skAt(GK_I,T_SAVE);SAVE_PT=[sg.rToe[0],Math.max(.12,sg.rToe[1]),sg.rToe[2]];
 const st=skAt(SUN_I,T_TRAP);TRAP_PT=[st.lToe[0],Math.max(.14,st.lToe[1]+.05),st.lToe[2]];
 const ss=skAt(SUN_I,T_SHOT);SHOT_PT=[ss.lToe[0],Math.max(.12,ss.lToe[1]),ss.lToe[2]];SOLVED=true;}

// ---------------------------------------------------------------- the ball print
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:3});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={bg:Pt|null;br:number;res:Map<number,DrawResult>};
/** everything on the pitch at T (positions on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion); the goal is
 * printed in depth order with the players (through its net when the camera is behind it) */
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;near?:number;hero?:boolean;after?:(r:PlayOut)=>void;ghost?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(o.near??3.5))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const hgt=b[1];sh.addPath(polyPath(blob(bground[0],bground[1],br*.9/(1+hgt*.3),br*.28/(1+hgt*.3),2,{amp:.05,n:12}),true));}s.tone(K,sh,.4);
 const out:PlayOut={bg,br,res:new Map()};
 type It={d:number;draw:()=>void};const items:It[]=[];
 const behind=c.C[0]>GOAL.x+.5,bk=T>T_GOAL?Math.sin(Math.PI*clamp((T-T_GOAL)/.9)):0;
 items.push({d:behind?-1:depth(c,[106,1.2,0]),draw:()=>goal3(s,c,105,1,behind?.16:.3,bk>0?{z:NET[2],y:NET[1],k:bk}:undefined)});
 if(bg)items.push({d:bq[2],draw:()=>ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11)});
 for(const e of list)items.push({d:e.d,draw:()=>{
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,Tp),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures and extras; during a passage only Sun keeps 'mid'
  const detail=passing?(e.k===SUN_I?'mid':'low'):px<50||(!a.key&&px<170)?'low':'auto';
  const fast=(e.k===SUN_I&&T>T_TRAP-.1&&T<T_SHOT+.3)||(e.k===GK_I&&((T>T_SAVE-.25&&T<T_SAVE+.35)||(T>T_SHOT&&T<T_GOAL+.2)))||(e.k===JIN_I&&T>T_JSHOT-.2&&T<T_JSHOT+.25);
  const prv=big&&!passing?poseOf(e.k,Tprev):null;
  const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prv?{prev:prv.p,prevPlace:{x:e.x,z:e.z,yaw:prv.yaw},smear:hero&&fast}:{});
  out.res.set(e.k,r);}});
 items.sort((p,q)=>q.d-p.d);
 o.ghost?.(out);
 for(const it of items)it.draw();
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring on the grass round a point (a stamped spot), knocked out under; fillA = a light screen inside (the "space") */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y,fillA=0){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const q=pr(c,[x+Math.cos(i/40*TAU)*r,.01,z+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<34)return;if(fillA>0)s.tone(ink,polyPath(pts,true),fillA*w);const rr=ribbon(pts,Math.max(5,c.F*.07/depth(c,[x,0,z])),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a flight path of the ball between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=0)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** a dotted sightline from a player's eyes to a point (red: a defender watching the ball; yellow: Sun's eyes on goal) */
function sightline(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number,ink=Y,seed=5){if(!r||!to||w<=0)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+5;
 const L=Math.hypot(to[0]-h[0],to[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(12,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],to[0],u),y=lerp(h[1],to[1],u),rr=hs*.26;dots.addPath(polyPath(blob(x,y,rr,rr,i+seed,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(ink,dots,.95);}
/** all the Norway players' sightlines to a point, batched: two plate ops however many */
function watchers(s:Sheet,res:Map<number,DrawResult>,to:Pt|null,w:number){if(!to||w<=0)return;const dots=new Path2D();let any=false;
 ACTORS.forEach((a,k)=>{if(a.role!=='nor'&&a.role!=='gk')return;const r=res.get(k);if(!r)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2+4,L=Math.hypot(to[0]-h[0],to[1]-h[1]);if(L<hs*2)return;
  const N=Math.max(3,Math.min(9,Math.floor(L/(hs*1.3))));for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const rr=hs*.24;dots.addPath(polyPath(blob(lerp(h[0],to[0],u),lerp(h[1],to[1],u),rr,rr,k*7+i,{amp:.1,n:9}),true));any=true;}});
 if(any){s.knockout(dots,.8);s.fill(R,dots,.95);}}
/** a stamped ring round a point on screen, knocked out under */
function screenRing(s:Sheet,p:Pt|null,r:number,w:number,ink=Y){if(!p||w<=0)return;const pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([p[0]+Math.cos(a)*r*(1+.04*Math.sin(a*3)),p[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,r*.16),{close:true,seed:17,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** "turns hard": a red arc arrow on the grass round her feet, sweeping from where she faced to the goal (progress u) */
function turnArrow(s:Sheet,c:Cam,x:number,z:number,u:number,w:number){if(w<=0||u<=0)return;const a0=SUN_FACE_TRAP,a1=SUN_FACE_SHOT,pts:Pt[]=[];
 for(let i=0;i<=16;i++){const a=lerpA(a0,a1,i/16*u),q=pr(c,[x+Math.cos(a)*1.4,.01,z-Math.sin(a)*1.4]);if(q)pts.push(q);}
 if(pts.length<4)return;const d=depth(c,[x,0,z]),wd=Math.max(5,c.F*.07/d);s.knockout(ribbon(pts,wd*1.8,{seed:67,taper:.1,wobble:.5}),.8*w);
 laneArrow(s,R,pts[pts.length-3],pts[pts.length-1],wd,{seed:68,head:Math.max(10,c.F*.2/d)});s.fill(R,ribbon(pts,wd,{seed:67,taper:.1,wobble:.5}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** T from chapter-1 time: real time, Nordby's save lands just after "Saved", so the long ball starts as Liu is named and Sun's shot goes in
 * on "scores" */
const kick1=()=>CUEW(0,'Saved')+.15-T_SAVE;
const tau1=(t:number)=>clamp(t-kick1(),T0,T1);
const CAM1:V3=[66,30,80];
function cam1(t:number):Cam{
 const T=tau1(t),S=SECS(0),lc=CUEW(0,'Liu');
 // open wide on the evening bowl, settle on Liu as she lines it up, follow the long ball into the box and stay on the finish
 const wide:V3=[60,12,-52],pass:V3=[75,.5,1],b=ballAt(T),bt:V3=[lerp(b[0],96,.3),.6,lerp(b[2],0,.35)],fin:V3=[95.5,1,1.5];
 const toPass=sm(1,lc-.3,t,easeInOutSine),follow=sm(-.1,1.4,T,easeInOutSine),finish=sm(T_JSHOT,T_TRAP,T,easeInOutSine);
 let tg=lerp3(wide,pass,toPass);tg=lerp3(tg,bt,follow);tg=lerp3(tg,fin,finish);
 const F=key(t,[[0,2300],[lc-.3,5600],[kick1()+.5,4800],[kick1()+T_RECV,6400],[kick1()+T_TRAP,7600],[kick1()+T_GOAL+.6,7000],[S,6800]],easeInOutSine);
 return look(CAM1,tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),tp=tau1(twos(t)),sc=CUEW(0,'scores');
  stadium(s,c,v,t,{roar:sm(sc-.3,sc+.4,t)*(1-sm(SECS(0)-.6,SECS(0),t)*.4),flash:sm(sc-.2,sc+.3,t)*(1-sm(sc+2,sc+2.6,t))});
  ground(s,c);
  play(s,c,v,T,tp,tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SUN_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:11.5,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Sun: everyone watches Jin, Sun in the space
const tau2=(t:number)=>key(t,[[0,1.2],[CUEW(1,'The defenders'),1.75],[CUEW(1,'watch Jin'),2.25],[CUEW(1,'Sun Wen waits'),2.62],[CUEW(1,'in the space'),2.8],[CUEW(1,'nobody'),3.05],[SECS(1),3.3]],linear);
function cam2(t:number):Cam{
 const S=SECS(1),T=tau2(t),sw=sm(CUEW(1,'Sun Wen waits')-.5,CUEW(1,'in the space')+.3,t,easeInOutSine),back=sm(CUEW(1,'nobody')-.3,S,t,easeInOutSine);
 // low behind Sun's right shoulder, looking past her at the crowd round Jin; drifting round and up as the space is named
 const[sx,sz]=posOf(SUN_I,T);
 const C:V3=[sx-5.2+.6*sw-.8*back,1.7+.5*sw+1.2*back,sz+3.6+.5*sw+.6*back];
 const tg:V3=[lerp(95,92,sw),lerp(1.1,1,sw),lerp(-2.6,.8,sw)];
 return look(C,tg,lerp(1800,1650,sw)-200*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),tp=tau2(twos(t)),td=CUEW(1,'The defenders'),wj=CUEW(1,'watch Jin'),sw=CUEW(1,'Sun Wen waits'),sp=CUEW(1,'in the space'),nb=CUEW(1,'nobody'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  // "in the space behind them": a yellow ring and a light yellow screen on the grass round Sun
  const[sx,sz]=posOf(SUN_I,T);groundRing(s,c,sx,sz,1.9,sm(sp-.2,sp+.3,t,easeOutBack)*(1-sm(E-.8,E-.45,t)),Y,.35);
  play(s,c,v,T,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:1.5,
   after:({res,bg})=>{
    // "The defenders all watch Jin Yan's shot": red dotted sightlines from every Norway player to the ball
    watchers(s,res,bg,sm(td-.1,wj+.5,t)*(1-sm(E-.8,E-.45,t)));
    // "Jin Yan's shot": a red ring round Jin's feet
    const jw=sm(wj-.1,wj+.3,t,easeOutBack)*(1-sm(sw,sw+.4,t));if(jw>0){const[jx,jz]=posOf(JIN_I,T);groundRing(s,c,jx,jz,.8,jw,R);}
    // "where nobody is looking": Sun's own eyes, a yellow sightline on the goal
    sightline(s,res.get(SUN_I),pr(c,[105,1,0]),sm(nb-.1,nb+.6,t)*(1-sm(E-.7,E-.4,t)),Y,5);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(SUN_I,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:5.6,
};

// ---------------------------------------------------------------- 3 · slow replay from behind the goal: the save, the rebound, trap, turn, left foot; the crowd
const tau3=(t:number)=>{const ks=CUEW(2,'The keeper'),bo=CUEW(2,'the ball bounces'),tr=CUEW(2,'She traps'),th=CUEW(2,'turns hard'),sc=CUEW(2,'scores with'),on=CUEW(2,'Only');
 return key(t,[[0,T_JSHOT-.05],[ks+.5,T_SAVE+.02],[bo+.3,T_SAVE+.3],[tr,T_TRAP-.08],[tr+.6,T_TRAP+.06],[th+.6,T_SHOT-.14],[sc+.3,T_SHOT+.04],[sc+1.3,T_GOAL],[on,T_GOAL+.7],[SECS(2),T_GOAL+3]],linear);};
const rise3=(t:number)=>sm(CUEW(2,'Only')-.4,CUEW(2,'Only')+1,t,easeInOutSine);
function cam3(t:number):Cam{
 const T=tau3(t),up=rise3(t),pan=sm(CUEW(2,'the ball bounces')-.2,CUEW(2,'She traps')+.2,t,easeInOutSine);
 const C:V3=[108.6-1.5*up,2.3+3.2*up,5.6+2*up],b=ballAt(Math.min(T,T_GOAL)),[sx,sz]=posOf(SUN_I,Math.min(T,T_SHOT+.2)),[gx,gz]=posOf(GK_I,T);
 // from behind the goal line, just outside the +Z post: on Nordby and the save, pan out with the rebound to Sun, hold on her through the
 // finish, then up to the crowd
 const tg0:V3=[lerp(lerp(gx-3,b[0],.3),sx+2,pan),lerp(.8,1,pan),lerp(lerp(gz-.4,b[2],.3),sz-.4,pan)],tg1:V3=[70,8,-44];
 // after the strike, swing with the ball into the net
 const fol=sm(CUEW(2,'scores with')+.5,CUEW(2,'scores with')+1.3,t,easeInOutSine),tgf:V3=[lerp(tg0[0],98,fol),tg0[1],lerp(tg0[2],2.2,fol)];
 return look(C,lerp3(tgf,tg1,up),lerp(lerp(lerp(2600,3900,pan),2600,fol),900,up));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),tp=tau3(twos(t)),ks=CUEW(2,'The keeper'),bo=CUEW(2,'the ball bounces'),tr=CUEW(2,'She traps'),th=CUEW(2,'turns hard'),sc=CUEW(2,'scores with'),on=CUEW(2,'Only'),up=rise3(t);
  stadium(s,c,v,t,{roar:sm(sc+.8,sc+1.4,t),flash:sm(sc+1,sc+1.5,t)});
  ground(s,c);
  play(s,c,v,T,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,near:1.2,
   ghost:()=>{// "turns hard": the red turn arrow round her feet, printed under her
    const[sx,sz]=posOf(SUN_I,T);turnArrow(s,c,sx,sz,sm(th-.2,th+.7,t,easeOut),1-sm(sc+.6,sc+1,t));},
   after:({res})=>{
    const gk=res.get(GK_I),sun=res.get(SUN_I);
    // "The keeper saves": a red ring round Nordby's saving boot
    if(gk){const w=sm(ks+.3,ks+.7,t,easeOutBack)*(1-sm(bo+.2,bo+.6,t)),q=gk.joints.rToe,kn=gk.joints.rKn;screenRing(s,q,Math.hypot(q[0]-kn[0],q[1]-kn[1])*.6+6,w,R);}
    // "the ball bounces out to Sun": the rebound's flight (yellow)
    flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_TRAP)),sm(bo-.1,bo+.3,t)*(1-sm(th,th+.4,t)),Y,.08);
    // "She traps it": a yellow ring round her left boot
    if(sun){const q=sun.joints.lToe,kn=sun.joints.lKn;screenRing(s,q,Math.hypot(q[0]-kn[0],q[1]-kn[1])*.55+6,sm(tr-.05,tr+.35,t,easeOutBack)*(1-sm(th+.2,th+.6,t)));}
    // "scores with her left foot": a spark off her left boot at contact, the shot's line into the net
    const age=T-T_SHOT;if(sun&&age>-.03&&age<.35){const q=sun.joints.lToe;sparkBurst(s,Y,q[0],q[1],c.F*.5/depth(c,SHOT_PT),{n:9,seed:91,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/depth(c,SHOT_PT))});}
    flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(sc,sc+.3,t)*(1-sm(on-.5,on-.1,t)),Y,.09);}});
  // "Only three minutes gone!": the camera lifts to the crowd, a few flags and a little confetti
  if(up>.2){const k=sm(on,on+1.2,t),fall=(t-on)*240;const y0=-v.hy*2.2+(fall%(v.hy*2.4));confetti(s,[R,Y,'paper'],[-v.hx,y0,v.hx*2,v.hy*1.6],Math.round(24*k),7,{size:30,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),q=toCam(c,[70,8,-44]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*3/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: behind and above Sun, the goal at the top of the frame
const tau4=(t:number)=>{const fs=CUEW(3,'find space'),dn=CUEW(3,'defenders are'),wb=CUEW(3,'When the ball'),fq=CUEW(3,'finish quickly');
 return key(t,[[0,1.6],[fs+.2,2.05],[dn,2.4],[dn+1.2,2.72],[wb,T_SAVE-.05],[wb+1.1,T_TRAP],[fq,T_TRAP+.08],[fq+1.3,T_GOAL],[SECS(3),T_GOAL+.5]],linear);};
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'find space')-.3,CUEW(3,'defenders are')+.3,t,easeInOutSine),back=sm(CUEW(3,'finish quickly')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[79.6+2*push-1*back,7-1.2*push+.8*back,14.5-1.5*push+.6*back];
 const tg:V3=[95+.6*push,1,.6-.3*push];
 return look(C,tg,2300+450*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),T=tau4(t),tp=tau4(twos(t)),fs=CUEW(3,'find space'),dn=CUEW(3,'defenders are'),wb=CUEW(3,'When the ball'),fq=CUEW(3,'finish quickly'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(fq+1,fq+1.4,t)});
  ground(s,c);
  // "find space": the yellow ring and screen round Sun
  const[sx,sz]=posOf(SUN_I,Math.min(T,T_TRAP));groundRing(s,c,sx,sz,2.2,sm(fs-.1,fs+.35,t,easeOutBack)*(1-sm(E-1,E-.6,t)),Y,.35);
  play(s,c,v,T,tp,tau4(twos(t)-1/12),{minBall:6,near:3,hero:true,
   ghost:()=>{// "When the ball comes to you": the rebound's flight into her ring
    flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_TRAP)),sm(wb,wb+.4,t)*(1-sm(E-1,E-.6,t)),Y,.08);},
   after:({res,bg})=>{
    // "where the defenders are not looking": their red sightlines, all on the ball
    watchers(s,res,bg,sm(dn-.1,dn+.6,t)*(1-sm(wb+.4,wb+.9,t)));
    // "finish quickly!": the shot's line into the net and a big yellow burst there
    flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(fq,fq+.3,t)*(1-sm(E-.7,E-.4,t)),Y,.12);
    const age=T-T_GOAL;if(age>-.03&&age<.6){const q=pr(c,LOW);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.7/depth(c,LOW),{n:10,seed:93,g:easeOutBack(clamp((age+.03)/.1))*(1-clamp((age-.4)/.2)),width:Math.max(6,c.F*.05/depth(c,LOW))});}}});
 },
 still:6.2,
};

const film:RisoStory={
 id:'sun-wen-signature',format:'11v11',title:'Sun Wen’s clever finish',theme:'Find space where the defenders are not looking, then finish quickly',
 ageNote:'Women’s World Cup semi-final, China v Norway, Foxboro Stadium, Massachusetts, 4 July 1999. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little burst of red-and-yellow confetti and a yellow spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(g>0)sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age<.9){const u=easeOut(clamp(age/.6)),r=80+160*u;confetti(s,[R,Y,'paper'],[x-r,y-r*.8+120*age*age,r*2,r*1.4],10,seed+1,{size:18*(1-clamp((age-.6)/.3))+2,cov:.95});}},
};
export default film;
/** Solved contact points (pitch metres; X to Norway's goal line at 105, Z across) — checked by the test. */
export const FACTS={BALL0,RECV,JSHOT_PT,SAVE_PT,TRAP_PT,SHOT_PT,LOW,GOAL,ballAt,T_RECV,T_JSHOT,T_SAVE,T_TRAP,T_SHOT,T_GOAL,
 sunAt:(T:number)=>posOf(SUN_I,T),
 /** every Norway outfield player's position at T (for the "space" check) */
 norwayAt:(T:number)=>ACTORS.map((a,k)=>a.role==='nor'?posOf(k,T):null).filter(Boolean) as [number,number][],
 nordbyHands:(T:number)=>{const sk=skAt(GK_I,T);return[sk.lHa,sk.rHa];},
 nordbyToes:(T:number)=>{const sk=skAt(GK_I,T);return{l:sk.lToe,r:sk.rToe};},
 sunToes:(T:number)=>{const sk=skAt(SUN_I,T);return{l:sk.lToe,r:sk.rToe};},
 jinToes:(T:number)=>{const sk=skAt(JIN_I,T);return{l:sk.lToe,r:sk.rToe};}};
