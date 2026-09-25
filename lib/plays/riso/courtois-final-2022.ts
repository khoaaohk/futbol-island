/** Thibaut Courtois v Sadio Mané — Champions League final, Liverpool 0–1 Real Madrid, Stade de France, Saint-Denis (Paris), 28 May 2022:
 * the 21st-minute fingertip save onto the post. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written
 * accounts and one agency photograph (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (cached under scratchpad/films/src-cache):
 *  - Wikipedia, "2022 UEFA Champions League final" (raw wikitext, fetched 23 Sep 2026): line-ups and numbers, kit templates (Liverpool all
 *    red, Real Madrid all white), "Thiago Alcântara played a ball through to Sadio Mané who managed to make space for himself and take a
 *    shot which was saved on to the left post by Courtois" (21'), Courtois man of the match with nine saves, Vinícius 59', 75,000, 21:36 KO.
 *    https://en.wikipedia.org/wiki/2022_UEFA_Champions_League_final
 *  - The Guardian, "Real Madrid beat Liverpool 1-0 in Champions League final – as it happened" (Rob Smyth), 21 min: "Thiago slides a
 *    typical disguised pass into Mane on the edge of the area. He zips inside Eder Militao and whacks a shot that is pushed onto the inside
 *    of the post by the diving Courtois before rebounding to safety."  https://www.theguardian.com/football/live/2022/may/28/champions-league-final-liverpool-real-madrid-live-updates
 *  - The Guardian match report (David Hytner): Courtois "stretching to tip Mané's shot from the edge of the penalty area against the inside
 *    of his near post. The ball would run in front of the line but it would not spin over it."
 *    https://www.theguardian.com/football/2022/may/28/champions-league-final-match-report-liverpool-real-madrid
 *  - Photograph (Dylan Martinez/Reuters, in the Guardian blog, "Courtois fingertips Mane's shot onto the upright"): Courtois flat out in the
 *    air, facing the pitch, the lower (right) arm reaching the ball low at the foot of the post, the top arm bent by his face; all-green
 *    keeper kit incl. green socks, dark gloves; Kroos (8, white, navy-lilac number) in front of the post, Henderson (14, all red, white
 *    number) in the box; Real Madrid fans in white with Spanish flags behind that goal; dark LED boards with red graphics.
 * CONFIRMED: date, venue, night kick-off; the minute (21); Thiago's disguised pass into Mané at the edge of the area; Mané going inside
 *  Militão and shooting hard from the edge of the box; Courtois diving and fingertipping it onto the INSIDE of his NEAR post; the ball
 *  running along in front of the line and out to safety; nine saves, man of the match, Real Madrid won 1–0. Kits: Liverpool red shirts,
 *  shorts and socks (white numbers); Real Madrid white shirts, shorts and socks; Courtois all green. Numbers: Courtois 1, Mané 10,
 *  Thiago 6, Militão 3, Alaba 4, Kroos 8, Henderson 14, Salah 11. The dive is to Courtois's RIGHT (read from the photo, and it agrees
 *  with the geometry: Mané on Liverpool's left side of the box, the near post = Wikipedia's "left post" seen from the attack).
 * INFERRED (illustrative): every position and path between the beats (where Thiago passed from, Mané's exact touch and shot spot,
 *  Militão's lunge, the other 18 players); Mané's shooting foot (right) — never named in the narration; the ball's exact height and
 *  speed; how far Courtois stood off his line; the rebound's path along the line and Alaba's clearance; the pose-by-pose dive (the
 *  shared keeperDive, top arm bent after the photo); his getting up; the ball print (paper with navy stars); the referee's kit; the
 *  bowl (a Stade de France-like oval with a floating roof ring), crowd colours by end, LED boards; the camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera:
 * the night bowl, Thiago's pass, Mané inside Militão, the shot and the save seen wide; 2 = slow-motion replay from a low camera out on
 * the pitch looking back at the goal (the angle of the Reuters photo): Courtois tall and set (a height bar), the dive, a ring on the
 * fingertips, a spark on the post; 3 = replay from behind the goal: the ball runs along the line and stays out (the line glows), nine
 * save ticks, Madrid's ribbons; 4 = the lesson from above the goal: the shooting angle on the grass, a small crouched keeper (yellow
 * ghost) against a tall, wide one (his "shadow" on the goal line grows, the gaps shrink), then the full-stretch dive to the post.
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only (t); every
 * action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,strike,keeperSet,keeperDive,lunge,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); withTiming matches a
 * cue by its FIRST word, in order, so no cue starts with a word that appears earlier in the sentence after the previous cue. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The first big chance',text:'Paris, 2022, the Champions League final. Liverpool in red, Real Madrid in white. Thiago slides a pass to Sadio Mané. He zips inside and shoots!',seconds:11.2,
  cues:[[.2,'Paris'],[1.4,'the Champions League final'],[3.5,'Liverpool in red'],[4.9,'Real Madrid in white'],[6.5,'Thiago slides'],[7.9,'Sadio Mané'],[8.9,'He zips inside'],[9.9,'and shoots']]},
 {label:'Watch the save',text:'Watch again, slowly. Thibaut Courtois stands tall and set, then flies across at full stretch. His fingertips push it onto the post!',seconds:9.8,
  cues:[[.1,'Watch again'],[1.6,'Thibaut Courtois'],[2.6,'stands tall'],[4.2,'then flies'],[5.3,'full stretch'],[6.3,'His fingertips'],[7.6,'onto the post']]},
 {label:'It stays out',text:'From behind the goal: the ball rolls along the line, but stays out! Courtois made nine saves. Real Madrid won the final!',seconds:9.4,
  cues:[[.1,'From behind the goal'],[1.6,'the ball rolls'],[3.4,'stays out'],[4.7,'Courtois made'],[5.6,'nine saves'],[6.6,'Real Madrid won']]},
 {label:'Your turn',text:'Your turn, keepers: stay tall and spread wide, so the shooter sees less goal. Then stretch: even fingertips count!',seconds:8.6,
  cues:[[.1,'Your turn'],[1.4,'stay tall'],[2.5,'spread wide'],[3.9,'sees less goal'],[5.5,'Then stretch'],[6.5,'even fingertips']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py courtois-final-2022, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/courtois-final-2022/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-courtois-final-2022.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/courtois-final-2022/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('courtois: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
/** inks: yellow (floodlights, grass under green, cue marks), red (Liverpool, the crowd's red end), green (Courtois's kit, the grass),
 * navy (the night, key line, Madrid's numbers); Real Madrid's white is the paper. */
const Y='yellow',R='red',G='green',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit.
 * Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Liverpool attack −X; Real Madrid's goal line at X = 0, the left of the
 * main camera), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). Courtois faces +X, so his RIGHT is +Z:
 * Mané comes from Liverpool's left (+Z), the near post is the +Z post and the dive goes to +Z. */
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
const groundPoly=(c:Cam,pts:[number,number][],y=.012)=>polyP(c,pts.map(([x,z])=>[x,y,z] as V3));

// ---------------------------------------------------------------- a Stade de France-like bowl at night: a long oval, two tiers, the floating roof ring
const CX=52.5,NS=64;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[2+20*b,1.4+11*b],UP=(b:number):[number,number]=>[23+24*b,15+18*b];
type Bowl={low:V3[][];up:V3[][];roof:V3[][];band:V3[][];seats:{P:V3;h:number;end:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],roof:[],band:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.roof.push([rim(a,40,38),rim(b,40,38),rim(b,72,40),rim(a,72,40)]);
  o.band.push([rim(a,40,36.4),rim(b,40,36.4),rim(b,40,38.2),rim(a,40,38.2)]);
  o.lamps.push(rim(a+.5/NS*TAU,40,37.3));
  for(const [f,rows] of [[LOW,9],[UP,8]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,17);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows),P=rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4);o.seats.push({P,h,end:P[0]<CX-30?-1:P[0]>CX+30?1:0});}}
 return o;})();
/** the night sky, the bowl, the crowd (Madrid's end in white with Spanish reds and golds, Liverpool's end red; roar lifts the marks) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(G,rectPath(-1e4,-1e4,2e4,2e4),.2);
 const low=new Path2D(),up=new Path2D(),roof=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.band[i],band);}
 s.knockout(low,.8);s.tone(K,low,.6);
 s.knockout(up,.8);s.tone(K,up,.72);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];// paper, red, yellow, navy
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0&&q.end<=0?roar*z*1.4*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.end<0?(q.h<.6?0:q.h<.78?1:q.h<.9?2:3):q.end>0?(q.h<.72?1:q.h<.85?0:3):(q.h<.45?1:q.h<.8?0:q.h<.88?2:3);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.85);s.fill(R,inks[1],.8);s.fill(Y,inks[2],.85);s.fill(K,inks[3],.7);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(G,roof,.25);
 s.knockout(band);s.fill(Y,band,.55);
 const lamps=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lamps.addPath(polyPath(blob(g[0],g[1],z,z*.55,3,{amp:.05,n:10}),true));}
 s.knockout(lamps);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass under floodlights (yellow × green, a navy night screen) with mowing stripes, dark LED boards with red panels, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean;post?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(G,p,.55);s.tone(K,p,.4);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(G,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.4,.2,-36.95],[x+3.4,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[-3.45,.2,z],[-3.45,.2,z+3.4],[-3.45,.7,z+3.4],[-3.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.9);s.tone(G,bd,.2);s.fill(R,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,105,1);
 if(!o.goalLater)goal3(s,c,0,-1,o.post??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep behind it (d = direction of the net); post = the +Z post's yellow flash (0..1) */
function goal3(s:Sheet,c:Cam,X:number,d:number,post=0){
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
 if(post>0){const p=new Path2D();seg3(c,[X,0,z1],[X,H,z1],.12,p);s.fill(Y,p,.95*post);}
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[K,.06]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Liverpool: red shirts, shorts and socks, white numbers */
const LIV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.92],shorts:[R,.92],socks:[R,.92],boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Real Madrid: white (paper) shirts, shorts and socks, navy numbers and trim */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[K,.8],skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:[K,.9],shade:[K,.22],seed:3,...o});
/** Thibaut Courtois, 1.99 m, No. 1 — all green (photo), dark gloves, long sleeves */
const COU:AthleteStyle={shirt:[G,.95],shorts:[G,.95],socks:[G,.95],boots:K,trim:[K,.7],skin:SKIN_L,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],gloves:[K,.85],sleeves:'long',number:1,numberInk:[K,.8],build:{height:1.99,bulk:1.02},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'balding',line:K,seed:12};
/** the lesson's comparison ghost: a yellow silhouette of the same body */
const GHOST:AthleteStyle={...COU,shirt:[Y,.6],shorts:[Y,.6],socks:[Y,.6],boots:[Y,.6],skin:[[Y,.6]],hair:[Y,.6],gloves:[Y,.6],trim:null,number:null,line:Y,shade:null,shadow:false};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds from Mané's shot)
type Role='gk'|'rma'|'liv'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Only the beats are in the accounts; the spots are inferred. */
const ACTORS:Actor[]=[
 {name:'Courtois',role:'gk',style:COU,key:true,keys:[[-9,2.3,-1.6],[-5,1.7,-.2],[-2.6,1.4,.45],[-1.6,1.25,.75],[-.5,1.1,.9],[5,1.1,.9]]},
 {name:'Mané',role:'liv',style:LIV({number:10,skin:SKIN_D,build:{height:1.75},seed:10}),key:true,keys:[[-9,35,13.5],[-5,28.6,11.8],[-2.6,22.4,9.9],[-1.7,20.5,8.7],[-1.1,19.4,7.5],[-.5,18.3,6.3],[0,17.75,5.75],[.6,16.4,5.1],[1.5,15.4,5.3],[5,14.8,6.2]]},
 {name:'Thiago',role:'liv',style:LIV({number:6,skin:SKIN_L,build:{height:1.74},seed:6}),key:true,keys:[[-9,33.5,-2.2],[-4,28.4,-.8],[-2.6,27.3,-.4],[-1,25.8,.2],[5,23,1.2]]},
 {name:'Militão',role:'rma',style:RMA({number:3,skin:SKIN_D,build:{height:1.86},seed:13}),key:true,keys:[[-9,25,7],[-4,21,8],[-2.6,19.9,8.6],[-1.7,19.2,8.9],[-1.2,18.9,8.8],[-.6,18.8,8.3],[0,18.4,7.6],[5,13.5,5.2]]},
 {name:'Alaba',role:'rma',style:RMA({number:4,skin:SKIN_D,build:{height:1.8},seed:14}),key:true,keys:[[-9,17.5,-4],[-3,14.4,-3.6],[0,11,-4.3],[1.2,9.6,-4.6],[2.2,6.8,-3.7],[2.9,4.9,-3.1],[5,6.2,-3.6]]},
 {name:'Kroos',role:'rma',style:RMA({number:8,hair:[Y,.75],seed:18}),keys:[[-9,27,4],[-3,15.5,5.6],[0,8.8,7.6],[2,7.6,8.6],[5,7,8.6]]},
 {name:'Carvajal',role:'rma',style:RMA({number:2,hair:K,seed:19}),keys:[[-9,23,15.5],[0,13.5,12.5],[5,11,10]]},
 {name:'Mendy',role:'rma',style:RMA({number:23,skin:SKIN_D,seed:20}),keys:[[-9,21,-13],[0,12.2,-9],[5,10,-8]]},
 {name:'Casemiro',role:'rma',style:RMA({number:14,skin:SKIN_M,seed:21}),keys:[[-9,28,2.5],[0,19.8,1.6],[5,15,1]]},
 {name:'Modrić',role:'rma',style:RMA({number:10,hairStyle:'long',hair:[Y,.5],seed:22}),keys:[[-9,31,-7],[0,22.5,-5],[5,18,-4]]},
 {name:'Valverde',role:'rma',style:RMA({number:15,seed:23}),keys:[[-9,34,17],[0,24,13.5],[5,20,11]]},
 {name:'Salah',role:'liv',style:LIV({number:11,skin:SKIN_D,hairStyle:'curly',seed:24}),key:true,keys:[[-9,27,-8.5],[0,12.6,-4.6],[5,9.2,-3.6]]},
 {name:'Henderson',role:'liv',style:LIV({number:14,skin:SKIN_L,seed:25}),keys:[[-9,35,-5],[0,15.2,-2.6],[2,11.2,-2],[5,9.6,-2]]},
 {name:'Díaz',role:'liv',style:LIV({number:23,skin:SKIN_D,hairStyle:'curly',seed:26}),keys:[[-9,31,24],[0,16.5,17],[5,13,15]]},
 {name:'Alexander-Arnold',role:'liv',style:LIV({number:66,seed:27}),keys:[[-9,41,-24],[5,30,-22]]},
 {name:'Robertson',role:'liv',style:LIV({number:26,skin:SKIN_L,seed:28}),keys:[[-9,45,27],[5,34,26]]},
 {name:'Fabinho',role:'liv',style:LIV({number:3,skin:SKIN_D,seed:29}),keys:[[-9,45,1],[5,37,1]]},
 {name:'Benzema',role:'rma',style:RMA({number:9,skin:SKIN_M,seed:30}),keys:[[-9,46,-6],[5,44,-5]]},
 {name:'Vinícius',role:'rma',style:RMA({number:20,skin:SKIN_D,seed:31}),keys:[[-9,48,-20],[5,45,-18]]},
 {name:'referee',role:'ref',style:REF,keys:[[-9,35,6],[5,24,7]]},
];
const COU_I=0,MANE=1,THI=2,MIL=3,ALA=4;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-9,T1=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Courtois tall and set: upright, feet a little wider than the hips, gloves out and open (the "stand tall" of the replay) */
const TALL=posed({lHipF:30,rHipF:30,lHipA:18,rHipA:18,lKnee:40,rKnee:40,lAnk:-6,rAnk:-6,lean:12,pitch:4,lShF:34,rShF:34,lShA:52,rShA:52,lElb:30,rElb:30,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-10});
/** the lesson's two stances: tall and spread (arms up and out, legs wide) vs small and hunched (arms tucked in) */
const WIDE=posed({lHipF:16,rHipF:16,lHipA:30,rHipA:30,lKnee:22,rKnee:22,lAnk:-4,rAnk:-4,lean:8,pitch:3,lShF:22,rShF:22,lShA:104,rShA:104,lElb:14,rElb:14,lShR:10,rShR:10,lHand:1,rHand:1,neckP:-6});
const SMALL=posed({lHipF:72,rHipF:72,lHipA:6,rHipA:6,lKnee:104,rKnee:104,lAnk:-14,rAnk:-14,lean:40,pitch:10,lShF:62,rShF:62,lShA:8,rShA:8,lElb:96,rElb:96,lHand:.6,rHand:.6,neckP:-20});
/** getting up after the dive: onto a knee beside the post, watching the ball (dz keeps him where he landed) */
const KNEEL=posed({dz:2.3,lHipF:6,lKnee:112,lAnk:30,rHipF:80,rKnee:92,lean:18,lShF:30,rShF:24,lShA:30,rShA:36,lElb:40,rElb:40,neckP:-6,neckY:30,lHand:.7,rHand:.7});
const T_SHOT=0,T_TIP=.62,T_POST=.68,T_CLEAR=2.9,DIVE=1.2,DIVE_H=.05;
/** where the dive's extension (.55) lands on T_TIP */
const diveU=(tau:number)=>clamp(.55+(tau-T_TIP)/DIVE);
/** the dive, with the top (left) arm bent by his face as in the photograph */
function divePose(tau:number):Pose{const u=diveU(tau);return over(keeperDive(u,{side:'r',height:DIVE_H}),{lShA:118,lShF:36,lElb:96,neckY:-8},bump(.3,1.02,u)*.85);}
/** the shot spot (inferred) and where Courtois faces as it is struck */
const SHOT_FROM:V3=[17.3,.11,5.2];
const SETP:[number,number]=[1.1,.9];
const MY=yawOf(SHOT_FROM[0]-SETP[0],SHOT_FROM[2]-SETP[1]);
function couPose(tau:number):{p:Pose;yaw:number}{
 const b=ballAt(tau),[x,z]=posOf(COU_I,tau);
 const yaw=tau>-.6?MY:yawOf(b[0]-x,b[2]-z);
 let p=blendPose(keeperSet(tau*1.25),TALL,sm(-1.6,-.9,tau)*.55);
 p=blendPose(p,divePose(tau),sm(-.14,-.02,tau));
 p=blendPose(p,KNEEL,sm(2.4,3.4,tau));
 if(tau>3.8)p=blendPose(p,{...stand(),dz:2.3},sm(3.8,4.6,tau));
 return{p,yaw:lerpA(yaw,yawOf(1,-.7),sm(2.6,3.4,tau))};}
/** everyone else at τ (with their yaw) */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===COU_I)return couPose(tau);
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const idle=a.role==='ref'?stand():READY;
 let p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:clamp((sp-2.2)/5)}),clamp((sp-.5)/.9));
 if(k===THI){const w=sm(-3.25,-3.1,tau)*(1-sm(-2.1,-1.8,tau));if(w>0){p=blendPose(p,strike(clamp((tau+2.6)/1.0+STRIKE_CONTACT),{foot:'r',power:.45}),w);yaw=lerpA(yaw,yawOf(RECV[0]-x,RECV[2]-z),w);}}
 if(k===MIL){const w=sm(-1.55,-1.35,tau)*(1-sm(-.5,-.2,tau));if(w>0){p=blendPose(p,lunge(clamp((tau+1.5)/1.2),{side:'r'}),w);yaw=lerpA(yaw,yawOf(1,-.9),w);}}
 if(k===MANE){const w=sm(-.62,-.5,tau)*(1-sm(.75,1.1,tau));if(w>0){p=blendPose(p,strike(clamp(tau/.95+STRIKE_CONTACT),{foot:'r',power:.95}),w);yaw=lerpA(yaw,MANE_YAW,sm(-.62,-.45,tau));}
  if(tau>1.1)p=blendPose(p,over(READY,{lShF:150,rShF:150,lShA:20,rShA:20,lElb:120,rElb:120,neckP:30,lean:20},1),sm(1.3,1.9,tau));// hands to his head (inferred)
  if(tau>-.6)yaw=lerpA(yaw,MANE_YAW,1-sm(1,1.6,tau));}
 if(k===ALA){const w=sm(T_CLEAR-.55,T_CLEAR-.4,tau)*(1-sm(T_CLEAR+.5,T_CLEAR+.8,tau));if(w>0){p=blendPose(p,strike(clamp((tau-T_CLEAR)/.95+STRIKE_CONTACT),{foot:'l',power:.9}),w);yaw=lerpA(yaw,yawOf(1,-.8),w);}}
 return{p,yaw};}
const MANE_YAW=yawOf(0-SHOT_FROM[0],3.3-SHOT_FROM[2]);
/** a striker's boot meets the ball at contact: his body is nudged so the solved toe lands on the ball */
const _shift=new Map<number,[number,number]>();
function shiftFor(k:number,tc:number,target:V3,foot:'l'|'r',power:number,yaw:number):[number,number]{const c=_shift.get(k);if(c)return c;const[x,z]=posOf(k,tc),sk=solve(strike(STRIKE_CONTACT,{foot,power}),ACTORS[k].style.build,{x,z,yaw}),toe=foot==='r'?sk.rToe:sk.lToe,d:[number,number]=[target[0]-toe[0],target[2]-toe[2]];_shift.set(k,d);return d;}
function placeOf(k:number,tau:number,yaw:number):Place{const[x,z]=posOf(k,tau);
 if(k===MANE){const d=shiftFor(MANE,0,SHOT_FROM,'r',.95,MANE_YAW),w=sm(-.9,-.45,tau)*(1-sm(.9,1.5,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}
 if(k===ALA){const d=shiftFor(ALA,T_CLEAR,CLR,'l',.9,yawOf(1,-.8)),w=sm(T_CLEAR-.8,T_CLEAR-.4,tau)*(1-sm(T_CLEAR+.4,T_CLEAR+1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}
 return{x,z,yaw};}

// ---------------------------------------------------------------- the ball: Thiago's pass, Mané's touch inside, the shot, the tip, the post, along the line, clear
const PASS:V3=(()=>{const[x,z]=posOf(THI,-2.6);return[x-.55,.11,z+.2];})();
const RECV:V3=(()=>{const[x,z]=posOf(MANE,-1.7);return[x-.4,.11,z-.3];})();
const TOUCH:V3=(()=>{const[x,z]=posOf(MANE,-1.05);return[x-.6,.11,z-.6];})();
/** the tip point: Courtois's right glove at T_TIP pushed out by a ball radius (+Z, toward the post) — solved once from his body */
const TIP:V3=(()=>{const sk=solve(divePose(T_TIP),COU.build,{x:SETP[0],z:SETP[1],yaw:MY}),h=sk.rHa;return[h[0],Math.max(.14,h[1]),h[2]+.1];})();
/** the ball meets the inside of the near post (post radius .06 + ball .11 inside z = 3.66) */
const POST:V3=[.06,Math.max(.14,TIP[1]*.85),3.49];
const ROLL:V3=[.45,.11,.2],CLR:V3=[4.4,.11,-2.7],AWAY:V3=[30,.11,-24];
const hop=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
function ballAt(tau:number):V3{
 if(tau<-2.6){const[x,z]=posOf(THI,tau);return[x-.55,.11,z+.2];}
 if(tau<-1.7)return hop(PASS,RECV,sm(-2.6,-1.7,tau,u=>u*(1.4-.4*u)),0);
 if(tau<-1.05)return hop(RECV,TOUCH,sm(-1.7,-1.05,tau,u=>u*(1.5-.5*u)),.05);
 if(tau<T_SHOT)return hop(TOUCH,SHOT_FROM,sm(-1.05,T_SHOT,tau,u=>u*(1.3-.3*u)),0);
 if(tau<T_TIP)return lerp3(SHOT_FROM,TIP,(tau-T_SHOT)/(T_TIP-T_SHOT));
 if(tau<T_POST)return lerp3(TIP,POST,(tau-T_TIP)/(T_POST-T_TIP));
 if(tau<1.9)return hop(POST,ROLL,sm(T_POST,1.9,tau,u=>u*(1.6-.6*u)),.12);
 if(tau<T_CLEAR)return hop(ROLL,CLR,sm(1.9,T_CLEAR,tau,linear),0);
 return hop(CLR,AWAY,sm(T_CLEAR,T_CLEAR+2.2,tau,easeOut),14);
}

// ---------------------------------------------------------------- the ball print (inferred): paper with navy stars
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.3);
 const st=new Path2D(),star=(cx:number,cy:number,R0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<10;i++){const a=a0+i/10*TAU,rr=i%2?R0*.42:R0;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return polyPath(q,true);};
 st.addPath(star(x+Math.cos(rot)*r*.18,y+Math.sin(rot)*r*.18,r*.36,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;st.addPath(star(x+Math.cos(a)*r*.85,y+Math.sin(a)*r*.85,r*.3,a));}
 s.fill(K,st,.85);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;only?:number[];after?:(r:PlayOut)=>void;cou?:(tau:number)=>{p:Pose;place:Place};noBall?:boolean}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.6)&&!inView(v,[g[0],g[1]-h],h*1.6))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=!o.noBall&&bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  let pose:Pose,place:Place,prev:Pose|undefined,prevPlace:Place|undefined;
  if(e.k===COU_I&&o.cou){const m=o.cou(tauP),mp=o.cou(tauPrev);pose=m.p;place=m.place;prev=mp.p;prevPlace=mp.place;}
  else{const q=poseOf(e.k,tauP),qp=poseOf(e.k,tauPrev),shifted=e.k===MANE||e.k===ALA;pose=q.p;place=placeOf(e.k,tauP,q.yaw);prev=qp.p;prevPlace=placeOf(e.k,tauPrev,qp.yaw);if(!shifted)place={...place,x:e.x,z:e.z};}
  // phone heat: low detail for small figures and extras; during a passage only the keeper keeps 'mid'
  const detail=passing?(e.k===COU_I?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const fast=(e.k===COU_I&&tauP>-.1&&tauP<1.1)||(e.k===MANE&&tauP>-.3&&tauP<.4);
  const r=drawPlayer(s,pose,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,big&&!passing?{prev,prevPlace,smear:hero&&fast}:{});
  if(e.k===COU_I)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** Courtois as the match plays him (place + pose) */
const couMatch=(tau:number)=>{const m=couPose(tau),[x,z]=posOf(COU_I,tau);return{p:m.p,place:{x,z,yaw:m.yaw} as Place};};
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** a hand-drawn ring round a sheet point */
function ringAt(s:Sheet,cx:number,cy:number,r:number,w:number,seed:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*.85]);}
 s.knockout(ribbon(pts,Math.max(5,r*.2),{seed,close:true,taper:0,wobble:.8}),.8*w);s.fill(Y,ribbon(pts,Math.max(3,r*.12),{seed,close:true,taper:0,wobble:.8}),.95*w);}

// ---------------------------------------------------------------- the angle: what the keeper's body hides of the goal (the lesson's measure)
const POSTZ=3.66;
/** the part of the goal line his body covers, seen from the ball: rays from the ball through every limb end to the line X = 0 */
function coverOf(sk:ReturnType<typeof solve>,bx:number,bz:number):{lo:number;hi:number;jl:V3;jh:V3}{
 let lo=Infinity,hi=-Infinity,jl:V3=sk.pelvis,jh:V3=sk.pelvis;
 for(const j of [sk.lHa,sk.rHa,sk.lToe,sk.rToe,sk.lHeel,sk.rHeel,sk.lKn,sk.rKn,sk.lEl,sk.rEl,sk.head,sk.lSh,sk.rSh,sk.pelvis] as V3[]){if(bx-j[0]<.3)continue;const z=bz+(j[2]-bz)*bx/(bx-j[0]);if(z<lo){lo=z;jl=j;}if(z>hi){hi=z;jh=j;}}
 return{lo:clamp(lo,-POSTZ,POSTZ),hi:clamp(hi,-POSTZ,POSTZ),jl,jh};}
/** the shooting angle on the grass (yellow), his body's shadow on it (green), the gaps left at the posts (red); w = fade */
function angleMarks(s:Sheet,c:Cam,sk:ReturnType<typeof solve>,w:number,o:{wedge?:number;gaps?:number}={}){
 if(w<=0)return;const{wedge=1,gaps=1}=o,bx=SHOT_FROM[0],bz=SHOT_FROM[2],cv=coverOf(sk,bx,bz);
 const tri=groundPoly(c,[[bx,bz],[0,-POSTZ],[0,POSTZ]]);
 if(tri.length>2&&wedge>0){const p=polyPath(tri,true);s.tone(Y,p,.7*w*wedge);s.stroke(Y,p,5,.95*w*wedge);}
 const shade=groundPoly(c,[[cv.jl[0],cv.jl[2]],[0,cv.lo],[0,cv.hi],[cv.jh[0],cv.jh[2]]],.02);
 if(shade.length>2){const p=polyPath(shade,true);s.knockout(p,.5*w);s.tone(G,p,.8*w);s.tone(K,p,.25*w);}
 if(gaps>0){const g=new Path2D(),L=(a:number,b:number)=>{if(b-a>.04)seg3(c,[0,.03,a],[0,.03,b],.32,g);};L(-POSTZ,cv.lo);L(cv.hi,POSTZ);
  const gw=new Path2D();for(const[a,b]of[[-POSTZ,cv.lo],[cv.hi,POSTZ]] as [number,number][])if(b-a>.04){const q=groundPoly(c,[[bx,bz],[0,a],[0,b]],.015);if(q.length>2)gw.addPath(polyPath(q,true));}
  s.tone(R,gw,.5*w*gaps);s.fill(R,g,.95*w*gaps);}
 return cv;}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera
const tau1=(t:number)=>{const th=CUEW(0,'Thiago'),sa=CUEW(0,'Sadio'),zi=CUEW(0,'He zips'),sh=CUEW(0,'and shoots'),S=SECS(0);
 return key(t,[[0,-8.6],[th-.3,-3.1],[sa+.2,-1.75],[zi+.3,-1.05],[sh+.15,0],[S-1.3,1.05],[S+1,2.2]],linear);};
const CAM1:V3=[38,23,68];
function cam1(t:number):Cam{
 const tau=tau1(t),lr=CUEW(0,'Liverpool'),bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.4),b2=bs(tau-.8),bt:V3=[clamp((b0[0]+b1[0]+b2[0])/3,6,58),0,(b0[2]+b1[2]+b2[2])/3*.6];
 const open:V3=[48,11,-10],toBall=sm(lr-.8,lr+1.4,t,easeInOutSine),end=sm(CUEW(0,'He zips')-.3,SECS(0)-.6,t,easeInOutSine);
 const T=lerp3(lerp3(open,[bt[0],1.2,bt[2]],toBall),[3.6,.9,2.6],end);
 const F=key(t,[[0,1150],[CUEW(0,'the Champions')+.6,1500],[lr+1.4,4000],[CUEW(0,'Thiago'),4800],[CUEW(0,'Sadio'),5600],[CUEW(0,'He zips'),6600],[CUEW(0,'and shoots')+.3,8600],[SECS(0),9600]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(T_POST,T_POST+.4,tau),flash:sm(T_POST+.05,T_POST+.3,tau)*(1-sm(1.4,1.8,tau))});
  ground(s,c,{post:bump(T_POST-.02,T_POST+.5,tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,cou:couMatch});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(COU_I,tau1(t)),q=toCam(c,[x,.9,z+1]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:10.2,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low camera out on the pitch looking back at the goal
const tau2=(t:number)=>{const S=SECS(1);return key(t,[[0,-1.35],[CUEW(1,'Thibaut'),-.85],[CUEW(1,'stands'),-.45],[CUEW(1,'then flies'),-.04],[CUEW(1,'full')+.3,.42],[CUEW(1,'His')+.5,T_TIP],[CUEW(1,'onto')+.2,T_POST+.02],[S,1.25]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),push=sm(CUEW(1,'Thibaut')-.3,CUEW(1,'stands')+.6,t,easeInOutSine),dive=sm(CUEW(1,'then flies')-.2,CUEW(1,'His')+.4,t,easeInOutSine);void tau;
 const C:V3=[lerp(24,15,push)-2.5*dive,lerp(2,1.3,push),lerp(-9.5,-2.2,push)];
 const T:V3=[lerp(6,1.4,push),lerp(.95,.85,push)-.25*dive,lerp(3.6,1.4,push)+1.4*dive];
 return look(C,T,lerp(2300,3300,push)+700*dive);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),st=CUEW(1,'stands'),hf=CUEW(1,'His'),op=CUEW(1,'onto');
  stadium(s,c,v,t);
  const pw=bump(op-.25,op+1.4,t);
  ground(s,c,{post:pw});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,cou:couMatch,after:({hero})=>{
   if(!hero)return;const J=hero.joints;
   // "stands tall": a yellow height bar beside him, from the boots to above his head
   const tw=sm(st-.1,st+.4,t,easeOut)*(1-sm(CUEW(1,'then flies')-.3,CUEW(1,'then flies'),t));
   if(tw>0){const top=Math.min(J.head[1],J.lHa[1],J.rHa[1]),bot=Math.max(J.lToe[1],J.rToe[1]),x=Math.max(J.lHa[0],J.rHa[0],J.lToe[0],J.rToe[0])+(bot-top)*.18,u=(bot-top)*.07+4,y1=lerp(bot,top-u*1.5,tw);
    s.knockout(ribbon([[x,bot],[x,y1]],u*1.4,{seed:41,taper:0}),.8);laneArrow(s,Y,[x,bot],[x,y1],u*.6,{seed:42,head:u*2});}
   // "His fingertips": a ring round the right glove
   const fw=sm(hf-.1,hf+.3,t,easeOutBack)*(1-sm(SECS(1)-1.2,SECS(1)-.8,t));
   if(fw>0){const h=J.rHa,el=J.rEl,r=Math.hypot(h[0]-el[0],h[1]-el[1])*.55*fw+2;ringAt(s,h[0],h[1],r,fw,82);}
   // the post: a spark where the ball meets it
   const age=tau-T_POST,pq=pr(c,POST);if(pq&&age>-.01&&age<.35){const d=toCam(c,POST)[2];sparkBurst(s,Y,pq[0],pq[1],c.F*.6/d,{n:9,seed:83,g:easeOutBack(clamp((age+.01)/.06))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/d)});}
  }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=couMatch(tau2(t)),sk=solve(m.p,COU.build,m.place),q=toCam(c,sk.chest),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.3/q[2]),12);},
 still:7.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: along the line, out; nine saves; Madrid won
const tau3=(t:number)=>{const br=CUEW(2,'the ball'),so=CUEW(2,'stays'),cm=CUEW(2,'Courtois'),S=SECS(2);return key(t,[[0,.3],[br-.2,.6],[br+.4,.8],[so+.3,1.95],[cm,2.6],[S,4.6]],linear);};
function cam3(t:number):Cam{
 const push=sm(CUEW(2,'the ball')-.6,CUEW(2,'stays'),t,easeInOutSine),up=sm(CUEW(2,'Courtois')-.2,SECS(2),t,easeInOutSine);
 const C:V3=[-3.8+.6*push-2*up,1.6+.2*push+4.5*up,5.4-.6*push-2*up],T:V3=[lerp(6,4.2,push),lerp(.6,.45,push)+2.4*up,lerp(1.8,.6,push)-.6*up];
 return look(C,T,lerp(2200,2700,push)*(1-.2*up));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),br=CUEW(2,'the ball'),so=CUEW(2,'stays'),ns=CUEW(2,'nine'),rw=CUEW(2,'Real'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(rw-.1,rw+.4,t),flash:sm(rw,rw+.3,t)});
  ground(s,c,{goalLater:true});
  // "rolls along the line … stays out": the goal line glows yellow under the rolling ball
  const lw=sm(br-.1,br+.4,t)*(1-sm(ns-.2,ns+.3,t));
  if(lw>0){const g=new Path2D();seg3(c,[0,.03,-POSTZ],[0,.03,POSTZ],.24,g);s.knockout(g,.9*lw);s.fill(Y,g,.95*lw);}
  const ow=sm(so-.1,so+.3,t,easeOutBack)*(1-sm(ns-.3,ns,t)),bq=pr(c,ballAt(tau));
  if(bq&&ow>0){const d=toCam(c,ballAt(tau))[2];ringAt(s,bq[0],bq[1],c.F*.3/d*ow+4,ow,91);}
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,cou:couMatch});
  goal3(s,c,0,-1);
  // "nine saves": nine glove ticks pop along the top of the frame
  const nw=1-sm(E-.8,E-.4,t);
  if(t>ns-.1&&nw>0){const vy=(v.hy-60)*.68,vx=(v.hx-60)*.68,box=Math.min(vx,vy)*.09,gap=box*2.2,y=-vy+box*2,x0=-gap*4,p=new Path2D(),q=new Path2D();
   for(let i=0;i<9;i++){const a=sm(ns-.1+i*.09,ns+.1+i*.09,t,easeOutBack);if(a<=0)continue;const r=box*a;p.addPath(polyPath(blob(x0+i*gap,y,r,r*1.1,i+3,{amp:.08,n:12}),true));q.addPath(polyPath(blob(x0+i*gap,y,r*.55,r*.6,i+9,{amp:.1,n:10}),true));}
   s.knockout(p,.9*nw);s.fill(G,p,.9*nw);s.fill(Y,q,.95*nw);}
  // "Real Madrid won the final": white paper ribbons with gold rain over the frame
  const cw=sm(rw-.2,rw+.4,t);if(cw>0){const fall=(t-rw)*260;confetti(s,['paper',Y,K],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(90*cw),71,{size:44,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(COU_I,tau3(t)),q=toCam(c,[x,.8,z+2]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.3/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · the lesson: from above the goal, small vs tall and wide, then the stretch
/** the lesson keeper at his set spot: small and hunched → tall and wide (on "stay tall" / "spread wide") → the dive to the post ("Then stretch") */
function lessonCou(t:number):{p:Pose;place:Place}{
 const tl=CUEW(3,'stay'),sw=CUEW(3,'spread'),ts=CUEW(3,'Then'),E=SECS(3);
 let p=blendPose(SMALL,keeperSet(t*1.3),sm(tl-.3,tl+.3,t)*.6);
 p=blendPose(p,TALL,sm(tl-.1,tl+.5,t,easeOutBack));
 p=blendPose(p,WIDE,sm(sw-.1,sw+.5,t,easeOutBack));
 const du=clamp(.55*(t-ts+.1)/.8);if(t>ts-.2){p=blendPose(p,divePose(T_TIP+(du-.55)*DIVE),sm(ts-.2,ts,t));}
 void E;return{p,place:{x:SETP[0],z:SETP[1],yaw:MY}};}
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'stay')-.4,CUEW(3,'spread')+.6,t,easeInOutSine),dive=sm(CUEW(3,'Then')-.2,CUEW(3,'even'),t,easeInOutSine);
 const C:V3=lerp3([-8+1.6*push,7-1.4*push,-1.2],[-5.5,3.6,-.8],dive),T:V3=lerp3([6.2+.2*push,.2+.5*push,1.6],[2.6,.5,2.3],dive);
 return look(C,T,lerp(2500+1000*push,2900,dive));}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),yt=CUEW(3,'Your'),tl=CUEW(3,'stay'),sw=CUEW(3,'spread'),sl=CUEW(3,'sees'),ts=CUEW(3,'Then'),ef=CUEW(3,'even'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{post:sm(ef-.1,ef+.3,t)*(1-sm(E-.7,E-.3,t))});
  const m=lessonCou(twos(t)),sk=solve(m.p,COU.build,m.place);
  // the shooting angle on the grass; his shadow on the goal line grows as he stands tall and spreads; the gaps flash on "sees less goal"
  const aw=sm(yt+.3,tl,t)*(1-sm(ts-.3,ts+.2,t));
  angleMarks(s,c,sk,aw,{gaps:.55+.45*bump(sl-.1,sl+1.1,t)});
  // the small, hunched keeper he could have been, as a yellow ghost beside him (compare the shadow)
  const gw=sm(tl+.1,tl+.6,t)*(1-sm(sl+.9,ts-.1,t));if(gw>0)drawPlayer(s,SMALL,c,GHOST,{x:SETP[0]+.1,z:SETP[1]-1.9,yaw:MY});
  // "Then stretch": the ball's path to the post and the glove's arc
  const dw=sm(ts-.1,ts+.4,t)*(1-sm(E-.6,E-.25,t));
  if(dw>0){const a=pr(c,SHOT_FROM),b=pr(c,POST);if(a&&b){const d=toCam(c,POST)[2],wd=c.F*.07/d;laneArrow(s,R,a,b,wd,{seed:62,head:wd*3,progress:dw,dashed:true});}}
  play(s,c,v,-.8,-.8,-.8-1/12,{minBall:5,hero:true,only:[COU_I],noBall:true,cou:tt=>lessonCou(twos(t)+(tt+.8)),after:({hero})=>{
   if(!hero)return;const J=hero.joints,ctr:Pt=J.chest,u=Math.hypot(J.head[0]-J.neck[0],J.head[1]-J.neck[1])*.9+6;
   // "spread wide": yellow arrows out along the arms and legs
   const arm=sm(sw-.1,sw+.4,t,easeOut)*(1-sm(ts-.4,ts-.1,t)),out=(a:Pt,b:Pt,k:number):[Pt,Pt]=>{const dx=b[0]-a[0],dy=b[1]-a[1];return[[b[0]+dx*.1,b[1]+dy*.1],[b[0]+dx*k,b[1]+dy*k]];};
   if(arm>0){for(const h of [J.lHa,J.rHa]){const[a,b]=out(ctr,h,.5);s.knockout(ribbon([a,b],u*.9,{seed:71,taper:.1}),.8*arm);laneArrow(s,Y,a,b,u*.45,{progress:arm,seed:72,head:u*1.4});}
    for(const f of [J.lToe,J.rToe]){const[a,b]=out(J.pelvis,f,.4);s.knockout(ribbon([a,b],u*.9,{seed:73,taper:.1}),.8*arm);laneArrow(s,Y,a,b,u*.45,{progress:arm,seed:74,head:u*1.4});}}
   // "stay tall": a burst round him as he rises
   const age=t-tl;if(age>-.1&&age<.7)sparkBurst(s,Y,ctr[0],ctr[1],u*6,{n:12,seed:75,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.45)/.25)),width:u*.35});
   // "even fingertips": a ring on the right glove and the ball printed just past it
   const fw=sm(ef-.1,ef+.3,t,easeOutBack)*(1-sm(E-.6,E-.25,t));
   if(fw>0){const h=J.rHa;ringAt(s,h[0],h[1],u*2.2*fw+2,fw,77);const bq=pr(c,TIP);if(bq){const d=toCam(c,TIP)[2];ball(s,bq[0],bq[1],Math.max(5,c.F*.11/d),1);}}}});
 },
 still:8.2,
};

const film:RisoStory={
 id:'courtois-final-2022',format:'11v11',title:"Courtois's fingertip save",theme:'Keepers: stay tall and spread wide, then stretch all the way',
 ageNote:'Champions League final, Liverpool v Real Madrid, Stade de France, Paris, 28 May 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flick of turf and a glove-spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(G,a,.6*fade);
}
export default film;
/** Solved contacts (pitch metres; Real Madrid's goal line at X = 0, Z across, +Z = Courtois's right, the near post) — checked by the film test. */
export const FACTS={SHOT_FROM,TIP,POST,SETP,T_TIP,T_POST,ballAt,couAt:(tau:number)=>{const m=couMatch(tau);return solve(m.p,COU.build,m.place);},
 maneToeAt:(tau:number)=>{const q=poseOf(MANE,tau);return solve(q.p,ACTORS[MANE].style.build,placeOf(MANE,tau,q.yaw)).rToe;},
 coverWith:(p:Pose)=>coverOf(solve(p,COU.build,{x:SETP[0],z:SETP[1],yaw:MY}),SHOT_FROM[0],SHOT_FROM[2]),SMALL,WIDE};
