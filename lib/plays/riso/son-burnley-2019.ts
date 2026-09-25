/** Son Heung-min v Burnley, Premier League, Tottenham Hotspur Stadium, London, 7 December 2019 (Tottenham 5–0 Burnley): the 32nd-minute
 * solo run from the edge of his own box, the 2019/20 Premier League Goal of the Season and the 2020 FIFA Puskás Award winner. An
 * iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage), printed as a
 * riso sheet.
 *
 * SOURCES (what the choreography and kit follow):
 *  - The Guardian, Sachin Nakrani, "Son Heung-min's wonder-goal steals show in Spurs' 5-0 thrashing of Burnley" (7 Dec 2019)
 *    https://www.theguardian.com/football/2019/dec/07/tottenham-hotspur-burnley-premier-league-match-report
 *  - BBC Sport, "Son Heung-min: Has 'Sonaldo' scored the goal of the season?" (7 Dec 2019)  https://www.bbc.co.uk/sport/football/50701386
 *  - Premier League, "Son's solo strike voted Budweiser Goal of the Month" (news/1563911) and "Son wins Budweiser Goal of the Season with
 *    solo special" (news/1750634), Ian Wright on the goal (news/1752589)
 *  - Sky Sports, "FIFA Best: Heung-Min Son wins Puskas Award for best goal of the past 12 months" (17 Dec 2020)
 *  - Wikipedia: "Son Heung-min", "FIFA Puskás Award" (2020 voting table), "2019–20 Tottenham Hotspur F.C. season" (result, scorers, kit
 *    infobox), "2019–20 Burnley F.C. season" (kit infobox)
 * CONFIRMED by those accounts: Saturday 7 December 2019, Tottenham Hotspur Stadium, Premier League, Spurs won 5–0; Son's goal came on 32
 * minutes (BBC: 31st) and made it 3–0 after Kane (4') and Lucas Moura (9'); it came from a Burnley free-kick that Jan Vertonghen hooked
 * clear under pressure from James Tarkowski; the ball fell to Son just outside Tottenham's own penalty area; seven Burnley players were
 * between him and goal; he outpaced Robbie Brady, Tarkowski, Matthew Lowton and Ben Mee, and brushed off Erik Pieters' swiping tackle
 * midway inside Burnley's half (Guardian); "ran away from two players and skipped past two challenges" (Premier League); 71.4 metres
 * dribbled in 11 seconds (Premier League; the BBC says 12 seconds and 12 touches, the Guardian ~90 yards); he finished with his RIGHT foot
 * past keeper Nick Pope and slid to his knees; he played on the left wing that day and wore 7; Mourinho called him "Sonaldo Nazario";
 * Goal of the Month (Dec 2019), Goal of the Season 2019/20, FIFA Puskás Award (Dec 2020). KIT: Tottenham's 2019/20 home kit, white
 * shirt, navy shorts, white socks (Wikipedia kit infobox).
 * INFERRED (illustrative): Burnley in their 2019/20 all-sky-blue AWAY kit (their claret home shirt has white shorts and socks, which would
 * clash with Spurs' white socks; not verified from footage, so the narration never names a colour); both keepers' and the referee's kits,
 * boots, the ball (the yellow Premier League winter ball); every position and timing between the confirmed beats; where the free-kick was
 * taken from and who took it; which foot Vertonghen hooked with; the exact line of the run (the film starts him right of centre and
 * drifts him through the middle), where each defender stood, the order he passed them, Pieters' swipe from Son's right, Mee's lunge in the
 * box as the second "challenge", Lowton closing from the left; the number of touches (the film derives ~10 long touches from his sprint
 * stride, all right foot); the finish spot and which side of Pope it went, Pope's dive; the direction of the knee slide; the other
 * players' positions and which unnamed Burnley players were on (they are left unnamed); the stadium's look (a rectangular bowl, navy
 * seats, a club-level band, a deep roof), the crowd colours, the grey December light, the camera placements, the direction of play.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, from the free-kick to the goal, panning with the ball; 2 = slow-motion replay from a low touchline camera running alongside him in
 * midfield: long touches (touch ticks, the ball rolling metres ahead, the gap arrow), full-speed streaks, a head-up sightline; 3 = replay
 * from behind the Burnley goal: Pieters' swipe, into the box between Mee and Lowton, right-foot finish past Pope, then a swing round to
 * the knee slide; 4 = the lesson from a low front camera on the open midfield stretch (the space ahead, long-touch arrows, full-speed
 * streaks, head-up sightline). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter,
 * drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,volley,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"London, 2019. A Burnley free kick is cleared to Son Heung-min, by his own box. Off he goes! Past one... past two... he's still going, into the box... goal!",seconds:14.6,
  cues:[[.2,'London'],[1.5,'A Burnley free kick'],[2.8,'is cleared'],[3.7,'Son Heung-min'],[4.8,'by his own box'],[6.1,'Off he goes'],[7.4,'Past one'],[8.7,'past two'],[10,"he's still going"],[11.4,'into the box'],[12.9,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. Long touches push the ball into space, so he sprints at full speed, head up.',seconds:8.4,
  cues:[[.15,'Watch it again'],[1.7,'Long touches'],[2.6,'push the ball'],[3.4,'into space'],[4.3,'so he sprints'],[5.2,'full speed'],[6.3,'head up']]},
 {label:'Past Nick Pope',text:'He skips a tackle, races into the box, and slots it past Nick Pope with his right foot. Puskás Award goal!',seconds:8.4,
  cues:[[.15,'He skips a tackle'],[1.4,'races into the box'],[2.7,'and slots it'],[3.4,'past Nick Pope'],[4.4,'right foot'],[5.4,'Puskás Award']]},
 {label:'Your turn',text:"Your turn: when there's space, carry the ball with long touches, run at full speed, and keep your head up.",seconds:8.2,
  cues:[[.15,'Your turn'],[1,"when there's space"],[2.1,'carry the ball'],[3,'long touches'],[4,'run at full speed'],[5.3,'keep your head up']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py son-burnley-2019, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/son-burnley-2019/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-son-burnley-2019.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/son-burnley-2019/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('son: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',O='orange',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Spurs attack +X, Burnley's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the stadium: a tight rectangular bowl (navy seats, club-level band, deep roof)
const CX=52.5,NS=56;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a squared-off superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(58.5+d)*Math.sign(c)*Math.pow(Math.abs(c),.22),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.22)];}
const LOW=(b:number):[number,number]=>[1.5+19*b,1.4+10.5*b],UP=(b:number):[number,number]=>[22.5+22*b,15+22*b];
type Bowl={low:V3[][];box:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number;up:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],box:[],up:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,21,11.9),rim(b,21,11.9),rim(b,22.5,15),rim(a,22.5,15)]);
  o.roof.push([rim(a,26,39),rim(b,26,39),rim(b,50,41),rim(a,50,41)]);
  o.fascia.push([rim(a,26,37.2),rim(b,26,37.2),rim(b,26,39.3),rim(a,26,39.3)]);
  for(const [f,rows,up] of [[LOW,8,false],[UP,8,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),11);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,up});}}
 return o;})();
/** everything behind the pitch: the grey December sky, the bowl, the crowd (roar lifts the seat marks) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o;
 // a London winter afternoon: pale grey-blue sky
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.18);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.08);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),led=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);add(BOWL.fascia[i],fas);
  const bq=BOWL.box[i],w=quadP(c,[bq[0],bq[1],bq[2],bq[3]].map((p,j)=>[p[0],j<2?12.9:13.6,p[2]] as V3));if(w)led.addPath(polyPath(w,true));}
 // navy seats under the crowd
 s.knockout(low);s.tone(K,low,.46);s.tone(B,low,.3);
 s.knockout(up);s.tone(K,up,.5);s.tone(B,up,.32);
 // the crowd: one mark per seat group; white home shirts, navy, a few blue, yellow stewards' bibs, orange scarves
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.5?0:q.h<.72?1:q.h<.86?2:q.h<.93?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(K,inks[1],.8);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(O,inks[4],.85);
 s.tone(K,up,.14);
 // the club-level band (navy) with its LED ribbon, the deep roof (navy underside) and its pale fascia
 s.knockout(box);s.fill(K,box,.85);s.knockout(led,.8);s.tone(Y,led,.3);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.4);
 s.knockout(fas);s.tone(K,fas,.2);
}
/** the green surround, grass (yellow × blue) with mowing stripes, ad boards, paper lines, both goals (the right goal drawn later when it
 * is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // LED boards: far touchline and behind both goals, navy with paper and yellow panels
 const bd=new Path2D(),pn=new Path2D(),py=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)(k%3?pn:py).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)(k%3?pn:py).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(py,.85);s.fill(Y,py,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??1.5);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.3],[O,.2]];
const SKIN_S7:InkFill[]=[[Y,.36],[O,.2]];
const SKIN_TAN:InkFill[]=[[Y,.4],[O,.34],[K,.1]];
const SKIN_DARK:InkFill[]=[[O,.5],[K,.42]];
/** Tottenham 2019/20 home (confirmed): white shirt (paper), navy shorts, white socks; navy trim and numbers */
const SPURS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,trim:K,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Son Heung-min, number 7 (confirmed); short black hair; right-footed finish (confirmed) */
const SON_STYLE=SPURS({skin:SKIN_S7,number:7,numberInk:K,hairStyle:'short',build:{height:1.83,bulk:1.02,thighs:1.1},seed:7});
/** Burnley in the all-sky-blue 2019/20 away kit (inferred, see header): a light blue screen, navy (claret) trim */
const BUR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:[B,.5],socks:[B,.5],boots:K,trim:K,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Nick Pope: keeper kit inferred (yellow) */
const POPE:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN,hair:[K,.8],hairStyle:'short',line:K,gloves:[O,.8],sleeves:'long',trim:K,build:{height:1.91},seed:51};
/** Hugo Lloris: keeper kit inferred (orange) */
const LLORIS:AthleteStyle={shirt:[O,.9],shorts:[O,.9],socks:[O,.9],boots:K,skin:SKIN,hair:[K,.8],hairStyle:'short',line:K,gloves:[Y,.8],sleeves:'long',trim:K,build:{height:1.88},seed:52};
const REF:AthleteStyle={shirt:[K,.88],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Son's first touch)
type Role='son'|'spurs'|'bur'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`), a hook volley (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike'|'hook';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The Burnley players named in the accounts get the beats the accounts give
 * them (Tarkowski at the clearance, Brady, Mee and Lowton outpaced, Pieters' swipe, Pope); where exactly each stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Son',role:'son',style:SON_STYLE,key:true,keys:[[-3,17.2,6.2],[-1.5,18.2,5.3],[-.4,19,4.7],[0,19.5,4.4],[.5,20.6,4.2],[1,22.6,3.9],[1.6,26,3.4],[2.2,30,2.9],[3,35.5,2.2],[4,42.5,1.3],[5,49.8,.4],[6,57.3,-.4],[7,64.9,-1.1],[8,72.6,-1.6],[8.7,78,-1.9],[9.4,83.2,-2.3],[10.1,88.3,-2.5],[10.6,91.7,-2.9],[11,94,-2.3],[11.3,95.4,-1.9],[11.8,96.9,-.9],[12.6,98.2,2.6],[13.4,98.9,8],[14,99,9.2],[19,99,9.2]]},
 {name:'Vertonghen',role:'spurs',style:SPURS({seed:21,hair:[K,.6]}),key:true,moves:[{kind:'hook',at:-1,dur:.9,side:'l'}],keys:[[-3,8.4,-.6],[-1.5,9.8,.8],[-1,10.1,1.1],[0,11,1.6],[19,24,2]]},
 {name:'Lloris',role:'gk',style:LLORIS,keys:[[-3,2.2,0],[-1,2.4,.6],[19,5,0]]},
 {name:'Kane',role:'spurs',style:SPURS({seed:22,build:{height:1.88}}),keys:[[-3,23,-9],[0,24,-9],[5,38,-8],[11,70,-7],[19,84,-4]]},
 {name:'Alli',role:'spurs',style:SPURS({seed:23,skin:SKIN_TAN}),keys:[[-3,27,-17],[0,28,-17],[19,76,-13]]},
 {name:'Lucas',role:'spurs',style:SPURS({seed:24,skin:SKIN_TAN,hairStyle:'curly'}),keys:[[-3,29,19],[0,30,19],[4,41,17],[11,76,13],[19,90,11]]},
 {name:'Sissoko',role:'spurs',style:SPURS({seed:25,skin:SKIN_DARK,hairStyle:'bald',build:{height:1.87,bulk:1.1}}),keys:[[-3,15,-7],[0,16,-6.5],[19,48,-4]]},
 {name:'Dier',role:'spurs',style:SPURS({seed:26,build:{height:1.88}}),keys:[[-3,12.5,8.5],[0,13.5,8],[19,40,6]]},
 {name:'Spurs full-back',role:'spurs',style:SPURS({seed:27,skin:SKIN_DARK}),keys:[[-3,13,15],[0,14,14.5],[19,36,12]]},
 {name:'Tarkowski',role:'bur',style:BUR({seed:31,build:{height:1.85,bulk:1.08}}),key:true,engage:[-1.6,-.6],moves:[{kind:'lunge',at:-1.05,dur:.8,side:'l'}],keys:[[-3,11.5,2.6],[-1.4,10.7,2],[-1,10.6,1.9],[0,12.2,2.6],[1,15.5,3.2],[3,24.5,3],[6,40,1.5],[10,62,.5],[19,76,0]]},
 {name:'Brady',role:'bur',style:BUR({seed:32,hair:[K,.7]}),key:true,engage:[-.4,1.5],keys:[[-3,27,-3],[0,25.4,.2],[1,24.4,1.2],[1.6,25,1.4],[2.5,27.5,1.6],[5,38,1.8],[19,58,1]]},
 {name:'Burnley midfielder A',role:'bur',style:BUR({seed:33}),engage:[.8,2.6],keys:[[-3,32,-3],[0,31.5,-1.5],[1.8,31.2,-.1],[2.6,32.4,.5],[5,42,1],[19,62,1]]},
 {name:'Burnley midfielder B',role:'bur',style:BUR({seed:34,hairStyle:'balding'}),engage:[2,3.8],keys:[[-3,36,-10],[0,35.2,-9],[2.5,37,-6],[3.5,39,-4.4],[5,44,-3.5],[19,62,-2]]},
 {name:'Burnley free-kick taker',role:'bur',style:BUR({seed:35}),moves:[{kind:'strike',at:-2.6,dur:.8,side:'r'}],keys:[[-4,37.6,-24.8],[-2.6,38.6,-24.3],[-1.5,36,-21],[0,33,-16],[19,52,-6]]},
 {name:'Mee',role:'bur',style:BUR({seed:36,build:{height:1.83,bulk:1.06}}),key:true,engage:[9.8,11],moves:[{kind:'lunge',at:10.5,dur:.85,side:'l'}],keys:[[-3,50,9],[0,49,7.5],[2,50.5,7.2],[4,54,7],[6,62.5,6.4],[8,73,5],[9.5,84,2.8],[10.3,89.6,1.1],[10.7,91.9,.5],[11.3,93.3,.5],[19,95,1]]},
 {name:'Lowton',role:'bur',style:BUR({seed:37}),key:true,engage:[9.8,11.4],keys:[[-3,56,-15],[0,55,-14],[3,58,-13],[6,68,-11.5],[9,85,-7.5],[10.2,91.4,-5.7],[10.7,93.2,-5.1],[11.3,94.3,-4.4],[19,96,-3.5]]},
 {name:'Pieters',role:'bur',style:BUR({seed:38,build:{height:1.84}}),key:true,engage:[7.6,9],moves:[{kind:'lunge',at:8.68,dur:.8,side:'r'}],keys:[[-3,62,20],[0,61,18],[3,63,14],[5,67,9],[7,72.4,3.6],[8,76.2,1],[8.6,78.3,-.2],[9.2,79.2,-.8],[10,81,-1.4],[19,90,-2]]},
 {name:'Pope',role:'gk',style:POPE,key:true,moves:[{kind:'dive',at:11.52,dur:.8,side:'l'}],keys:[[-3,103.6,0],[6,102.6,-.4],[9,101.6,-1],[10.8,100.4,-1],[11.3,100.2,-1],[19,100.2,-1]]},
 {name:'Rodriguez',role:'bur',style:BUR({seed:39}),keys:[[-3,6.6,5.4],[0,8,5],[19,24,4]]},
 {name:'Burnley forward',role:'bur',style:BUR({seed:40,build:{height:1.88}}),keys:[[-3,7,-3],[0,8.2,-2],[19,21,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,30,-4],[4,42,-6],[11,76,-8],[19,90,-6]]},
];
const SON=0,VERT=1,PIETERS=16;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4,T1=19,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: free-kick, Vertonghen's hooked clearance, long right-foot touches, the finish
/** his sprint stride: one gait cycle per CYC metres; a long touch every other stride or so, as the right foot swings through (phase ≈ .95) */
const CYC=4.4,FK=-2.6,HOOK=-1,SHOT=11.3,IN_NET=SHOT+.38,SLIDE=13.4;
const FKSPOT:V3=[38.9,.11,-24.2];
/** the touches (right foot): the first touch as the clearance drops, then long pushes on the stride, the forced touch past Pieters' swipe
 * and the nudge between Mee and Lowton; then the shot (inferred count, ≈ the BBC's 12 touches incl. the shot) */
const TOUCHES:number[]=(()=>{const forced=[8.5,10.4],out:number[]=[0];let prev=distOf(SON,0)/CYC-.95;
 for(let tau=DT;tau<SHOT-.45;tau+=DT){const ph=distOf(SON,tau)/CYC-.95;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.95&&forced.every(f=>Math.abs(f-tau)>.55))out.push(tau);prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
/** Son's heading: facing the dropping clearance before the first touch, then turning away up the pitch; frozen through the knee slide */
function yawSon(tau:number):number{
 const v=velOf(SON,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.1);
 if(tau<.6){const v0=posOf(VERT,HOOK),m=posOf(SON,tau),face=yawOf(v0[0]-m[0],v0[1]-m[1]);return lerpA(face,head,sm(-.25,.5,tau,easeInOutSine));}
 if(tau>SLIDE-.1){const w=velOf(SON,SLIDE-.3);return yawOf(w[0],w[1]);}
 return head;}
/** his forward and right directions on the ground (x, z) */
const fwdR=(tau:number):[Pt,Pt]=>{const y=yawSon(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** ball spot for the right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(SON,tau),[f,r]=fwdR(tau);return[p[0]+f[0]*.55+r[0]*.14,p[1]+f[1]*.55+r[1]*.14];};
const TP=TOUCHES.map(footAt);
const NET:V3=[105.35,.3,2.4],REST:V3=[106.2,.11,2.5];
const HOOKAT=():V3=>{const v=posOf(VERT,HOOK);return[v[0]+.5,.75,v[1]-.3];};
function ballAt(tau:number):V3{
 if(tau<FK)return FKSPOT;
 if(tau<HOOK){// the free-kick, curled in toward the Spurs six-yard box
  const u=(tau-FK)/(HOOK-FK),h=HOOKAT();return[lerp(FKSPOT[0],h[0],u),lerp(.11,h[1],u)+7*Math.sin(Math.PI*u)*(1-.1*u),lerp(FKSPOT[2],h[2],u)+3*Math.sin(Math.PI*u)];}
 if(tau<0){// Vertonghen's hooked clearance: up, over, and down to Son on the bounce
  const u=(tau-HOOK)/-HOOK,h=HOOKAT(),to=footAt(0),x=lerp(h[0],to[0],u),z=lerp(h[2],to[1],u);
  const y=u<.78?lerp(h[1],.11,u/.78)+5.2*Math.sin(Math.PI*u/.78):.11+.55*Math.sin(Math.PI*(u-.78)/.22);return[x,y,z];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.6);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.22*Math.sin(Math.PI*u*.8),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** watching the clearance drop: chest open, arms out, eyes on the ball */
const RECEIVE:Partial<Pose>={lean:8,lHipF:20,lKnee:30,rHipF:26,rKnee:36,lShA:46,rShA:40,lElb:36,rElb:40,neckP:-22};
/** a long push: the right leg reaches through and the laces meet the ball, a glance down */
const PUSH:Partial<Pose>={rHipF:44,rKnee:20,rAnk:36,neckP:14};
/** the hop over Pieters' swipe: both knees up, arms out */
const HOP:Partial<Pose>={air:.26,lKnee:84,rKnee:58,lHipF:40,rHipF:10,lShA:62,rShA:58,squash:.04};
/** the nudge between Mee and Lowton: body dipped into the gap, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:9*dir,bend:10*dir,lean:22,lKnee:54,rKnee:50,lShA:dir>0?30:70,rShA:dir>0?70:30,neckY:8*dir,squash:-.04});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(SON,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&(tau>3||x<50))yaw=yawOf(b[0]-x,b[2]-z);
 if(k===SON)yaw=yawSon(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bur'?READY:stand();
 if(k===SON){// a full sprint the whole way: long strides, head up (runCycle's sprint carries the head level), a push every other stride
  const s=clamp((sp-2)/5),rn=runCycle(distOf(SON,tau)/CYC,{speed:s});p=blendPose(idle,rn,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:mv.kind==='hook'?.5:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.08});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.75}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(mv.kind==='hook'&&u>0&&u<1.4)p=blendPose(p,volley(Math.min(1,u),{foot:mv.side,height:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===SON){
  if(tau<.35)p=over(p,RECEIVE,sm(-2.5,-1.6,tau)*(1-sm(-.1,.35,tau)));
  for(const T of TOUCHES)if(T<SHOT&&T>0&&Math.abs(tau-T)<.2)p=over(p,PUSH,bump(T-.2,T+.12,tau));
  p=over(p,HOP,bump(8.56,8.92,tau));
  p=over(p,CUT(1),bump(10.2,10.75,tau));
  const D=.8,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4&&tau<SLIDE+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau)*(1-sm(SLIDE,SLIDE+.2,tau)));
  if(tau>SLIDE)p=blendPose(p,celebrate(clamp((tau-SLIDE)/1.3),{kind:'kneeSlide'}),sm(SLIDE,SLIDE+.15,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the yellow winter ball (inferred) with navy graphics
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);s.fill(Y,disc,.95);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 // two sweeping navy bands round the ball: reads as a spinning ball at a glance
 const band=new Path2D();for(const k of[0,1]){const a0=rot+k*Math.PI,pts2:Pt[]=[];for(let i=0;i<=10;i++){const a=a0+i/10*Math.PI*.9;pts2.push([x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62*(.6+.4*Math.cos(rot))]);}band.addPath(ribbon(pts2,Math.max(2,r*.2),{seed:4+k,taper:.6,wobble:r*.01}));}
 s.fill(K,band,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;ring?:number}={}):PlayOut{
 const{minBall=6,hero=false,ring=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (a low winter sun: soft and short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 if(ring>0){const cx=b[0],cz=b[2],r=.55+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.09/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SON?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===SON||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SON}:{});
  if(e.k===SON)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** touch ticks: a yellow spark at each touch as it happens, and the trail of touch spots left on the grass (fading) */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number,span=3){if(w<=0)return;
 const dots=new Path2D();let any=false;
 TOUCHES.forEach((T,i)=>{const age=tau-T;if(age<0||age>span||T>=SHOT)return;const[x,z]=TP[i],q=toCam(c,[x,0,z]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.16/q[2]*(1-.45*age/span);
  dots.addPath(polyPath(blob(g[0],g[1],r,r*.42,i+3,{amp:.08,n:12}),true));any=true;
  if(age<.28){const b=pr(c,[x,.12,z]);if(b)sparkBurst(s,Y,b[0],b[1],c.F*.45/q[2],{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.1)),width:Math.max(4,c.F*.035/q[2]),cov:.95*w});}});
 if(any){s.knockout(dots,.8*w);s.fill(Y,dots,.9*w);}
}
/** the long touch: an orange arrow on the grass from the touch spot to where the ball will be met next (drawn as the ball rolls) */
function pushArrow(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 let k=-1;for(let i=0;i+1<TOUCHES.length;i++)if(tau>=TOUCHES[i]&&tau<TOUCHES[i+1]&&TOUCHES[i+1]<SHOT)k=i;if(k<0)return;
 const a=pr(c,[TP[k][0],0,TP[k][1]]),b=pr(c,[TP[k+1][0],0,TP[k+1][1]]);if(!a||!b)return;const q=toCam(c,[TP[k][0],0,TP[k][1]]),wd=Math.max(5,c.F*.12/q[2]);
 const u=clamp((tau-TOUCHES[k])/.35);s.knockout(ribbon([a,[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]],wd*1.7,{seed:61+k,taper:.1,wobble:.8}),.75*w);laneArrow(s,O,a,b,wd,{progress:u,seed:62+k,head:wd*3,cov:.95*w});}
/** the gap: a navy dashed bracket on the grass between his boots and the ball rolling ahead ("push the ball into space") */
function gapMark(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const m=posOf(SON,tau),b=ballAt(tau),a=pr(c,[m[0],0,m[1]]),e=pr(c,[b[0],0,b[2]]);if(!a||!e)return;const wd=Math.max(4,c.F*.07/toCam(c,[m[0],0,m[1]])[2]);
 laneArrow(s,K,a,e,wd,{dashed:true,seed:71,head:wd*2.6,cov:.9*w});}
/** "head up": a yellow sightline wedge from his eyes down onto the open grass far ahead, and a ring where he is looking */
function sightline(s:Sheet,c:Cam,r:DrawResult|undefined,tau:number,w:number,reach=16){if(!r||w<=0)return;
 const h=r.joints.head,m=posOf(SON,tau),[f,rt]=fwdR(tau),L=reach*(.35+.65*clamp(w*1.3)),cx=m[0]+f[0]*L,cz=m[1]+f[1]*L,P=(side:number)=>pr(c,[cx+rt[0]*side*L*.22,0,cz+rt[1]*side*L*.22]);
 const a=P(-1),b=P(1),e=pr(c,[cx,0,cz]);if(!a||!b||!e)return;const wedge=polyPath([h,a,e,b],true);s.knockout(wedge,.3*w);s.tone(Y,wedge,.5*w);
 const q=toCam(c,[cx,0,cz]),rr:Pt[]=[];for(let i=0;i<32;i++){const g=pr(c,[cx+Math.cos(i/32*TAU)*2.2,0,cz+Math.sin(i/32*TAU)*1.8]);if(g)rr.push(g);}
 if(rr.length>24){const ring=ribbon(rr,Math.max(4,c.F*.1/q[2]),{close:true,seed:74,taper:0,wobble:1});s.knockout(ring,.8*w);s.fill(Y,ring,.95*w);}
 s.fill(O,ribbon([h,e],Math.max(3,c.F*.05/q[2]),{seed:72,taper:.5,wobble:.6,gaps:[[.2,.3],[.45,.55],[.7,.8]]}),.9*w);}
/** the space: a yellow halo on the empty grass ahead of him */
function spaceHalo(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const m=posOf(SON,tau),[f]=fwdR(tau),cx=m[0]+f[0]*10,cz=m[1]+f[1]*10,pts:Pt[]=[];
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[cx+Math.cos(a)*6*w,0,cz+Math.sin(a)*4.5*w]);if(q)pts.push(q);}if(pts.length<30)return;
 const fillP=polyPath(pts,true),rim2=ribbon(pts,Math.max(7,c.F*.22/toCam(c,[cx,0,cz])[2]),{close:true,seed:73,taper:0,wobble:1.4});
 s.tone(Y,fillP,.5*w);s.knockout(rim2,.8*w);s.fill(Y,rim2,.95*w);}
/** full speed: navy speed lines streaming off him */
function speedLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const m=posOf(SON,tau),[f]=fwdR(tau),q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+f[0],1,m[1]+f[1]]);if(!q||!q2)return;const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2],p=new Path2D();
 for(let k=0;k<4;k++){const off=(k-1.5)*.42,st=.55+.25*(k%2);p.addPath(ribbon([[q[0]-Math.cos(dir)*z*st-Math.sin(dir)*z*off,q[1]-Math.sin(dir)*z*st+Math.cos(dir)*z*off],[q[0]-Math.cos(dir)*z*(st+1.2)-Math.sin(dir)*z*off,q[1]-Math.sin(dir)*z*(st+1.2)+Math.cos(dir)*z*off]],z*.05,{seed:9+k,taper:.9,wobble:.5}));}
 s.fill(K,p,.65*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~1–1.6× real time; the pre-roll is the free-kick) */
const tau1=(t:number)=>{const s=CUEW(0,'Son'),G=CUEW(0,'goal');return key(t,[[0,-3.6],[CUEW(0,'is cleared'),HOOK+.05],[s,0],[CUEW(0,'Off he goes'),1.7],[CUEW(0,'Past one'),3.4],[CUEW(0,'past two'),5.3],[CUEW(0,"he's still"),7.6],[CUEW(0,'into the box'),9.9],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[52.5,24,72];
function cam1(t:number):Cam{
 const cl=CUEW(0,'is cleared'),s0=CUEW(0,'Son'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the broadcast leads the play: a few metres ahead of the ball once he is running
 const lead=4*sm(s0,CUEW(0,'Off he goes'),t),open:V3=[23,1.5,-7],m=posOf(SON,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(cl-.6,s0+.2,t,easeInOutSine),toS=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]+lead,toBall),lerp(open[1],2.5,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,[[0,2700],[cl,3100],[s0,4300],[CUEW(0,'Past one'),4800],[CUEW(0,'into the box'),5400],[G,5800],[G+1.4,6700],[S,7000]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SON,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera running alongside him in midfield
const tau2=(t:number)=>key(t,[[0,1.7],[CUEW(1,'Long'),2.3],[CUEW(1,'push'),2.8],[CUEW(1,'into space'),3.3],[CUEW(1,'so he'),4],[CUEW(1,'full speed'),4.7],[CUEW(1,'head up'),5.5],[SECS(1),6.4]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SON,tau),open=1-sm(0,1.4,t,easeInOutSine),wide=sm(CUEW(1,'Long')-.4,CUEW(1,'push'),t,easeInOutSine)*(1-sm(CUEW(1,'so he')-.3,CUEW(1,'so he')+.4,t)),hu=sm(CUEW(1,'head up')-.4,CUEW(1,'head up')+.3,t,easeInOutSine);
 const C:V3=[m[0]-2.5+1.5*open-1.5*wide,1.5+.3*open+.4*hu,m[1]+10+3*open+2.5*wide-1.5*hu],T:V3=[m[0]+2.2+2.4*wide,.9+.45*hu,m[1]-.3];
 return look(C,T,2700-500*wide+600*hu-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),lt=CUEW(1,'Long'),pb=CUEW(1,'push'),is=CUEW(1,'into space'),sh=CUEW(1,'so he'),fs=CUEW(1,'full speed'),hu=CUEW(1,'head up'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  spaceHalo(s,c,tau,sm(is-.2,is+.35,t,easeOutBack)*(1-sm(sh+.2,sh+.6,t)));
  touchMarks(s,c,tau,sm(lt-.2,lt+.2,t)*(1-sm(E-1,E-.6,t)),2.4);
  pushArrow(s,c,tau,sm(lt-.1,lt+.3,t)*(1-sm(sh-.2,sh+.1,t)));
  gapMark(s,c,tau,sm(pb-.1,pb+.3,t)*(1-sm(is+.4,is+.7,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   speedLines(s,c,tau,sm(fs-.15,fs+.3,t)*(1-sm(E-1,E-.6,t)));
   sightline(s,c,hero,tau,sm(hu-.1,hu+.5,t,easeOut)*(1-sm(E-.9,E-.6,t)),9);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SON,tau2(t)),q=toCam(c,[m[0],1.5,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the Burnley goal: Pieters' swipe, the box, the finish, the knee slide
const tau3=(t:number)=>{const pa=CUEW(2,'Puskás');return key(t,[[0,8.05],[CUEW(2,'He skips'),8.25],[CUEW(2,'races'),9.55],[CUEW(2,'and slots'),SHOT-.05],[CUEW(2,'past Nick'),SHOT+.3],[CUEW(2,'right foot'),IN_NET+.35],[pa,SLIDE+.5],[SECS(2),SLIDE+.5+(SECS(2)-pa)*.7]],linear);};
const swing3=(t:number)=>sm(CUEW(2,'right foot')-.2,CUEW(2,'Puskás')+.1,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(SON,tau),e=sm(SHOT-.5,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'Puskás')+.2,SECS(2),t,easeInOutSine);
 const C0:V3=[118,6.5,-5+2*e],T0:V3=[lerp(m[0]+1,100,e),lerp(.9,1,e),lerp(m[1]*.8,.5,e)];
 const mm=smooth(SON,Math.min(tau,SLIDE+1.4)),C1:V3=[mm[0]+2.5+hold,1.9+.4*hold,mm[1]+9.5+1.5*hold],T1:V3=[mm[0]-.2,1+.2*hold,mm[1]-.3];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(5800-1500*sm(0,CUEW(2,'and slots'),t),3000-250*hold,u)*(1-.3*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),rf=CUEW(2,'right foot'),pa=CUEW(2,'Puskás'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "skips a tackle": the swipe meets only grass — an orange spark where Pieters' boot lands too late
   const age=tau-8.72;if(age>-.2&&age<.5){const[px,pz]=posOf(PIETERS,8.72),q=pr(c,[px+.9,.2,pz-.9]);if(q)sparkBurst(s,O,q[0],q[1],c.F*.55/toCam(c,[px,.2,pz])[2],{n:8,seed:83,g:easeOutBack(clamp((age+.2)/.15))*(1-clamp((age-.25)/.25)),width:9});}
   // "right foot": an orange ring round the right boot through the strike and follow-through
   const lw=sm(rf-.15,rf+.25,t,easeOutBack)*(1-sm(pa-.5,pa-.2,t));
   if(hero&&lw>0){const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.8]);}
    s.fill(O,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SON,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the open midfield stretch
const tau4=(t:number)=>key(t,[[0,4.3],[CUEW(3,'Your'),4.35],[CUEW(3,'when'),4.7],[CUEW(3,'carry'),5.15],[CUEW(3,'long'),5.55],[CUEW(3,'run'),6.1],[CUEW(3,'keep'),6.7],[SECS(3),7.6]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(SON,tau),push=sm(CUEW(3,'carry')-.3,CUEW(3,'carry')+.5,t,easeInOutSine)*(1-sm(CUEW(3,'long')-.2,CUEW(3,'long')+.4,t)),orbit=sm(CUEW(3,'run')-.4,CUEW(3,'run')+.6,t,easeInOutSine),hu=sm(CUEW(3,'keep')-.3,CUEW(3,'keep')+.5,t,easeInOutSine);
 const C:V3=[m[0]+9.5-2*orbit,1.3+.5*hu,m[1]-5.5-3*orbit],bl=ballAt(tau),T:V3=[lerp(m[0],bl[0],.45)+.6-.8*hu,.85+.4*hu-.1*push,lerp(m[1],bl[2],.45)+.2];
 return look(C,T,2900+400*push+300*hu);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wn=CUEW(3,'when'),cb=CUEW(3,'carry'),lt=CUEW(3,'long'),rn=CUEW(3,'run'),kh=CUEW(3,'keep'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  spaceHalo(s,c,tau,sm(wn-.1,wn+.4,t,easeOutBack)*(1-sm(cb+.3,cb+.7,t)));
  touchMarks(s,c,tau,sm(lt-.2,lt+.2,t)*(1-sm(E-1.2,E-.8,t)),2);
  pushArrow(s,c,tau,sm(lt-.1,lt+.3,t)*(1-sm(E-1.2,E-.8,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(cb-.1,cb+.35,t,easeOutBack)*(1-sm(lt-.1,lt+.2,t)),after:({hero})=>{
   speedLines(s,c,tau,sm(rn-.1,rn+.35,t)*(1-sm(E-.9,E-.4,t)));
   sightline(s,c,hero,tau,sm(kh-.05,kh+.45,t,easeOut)*(1-sm(E-.8,E-.4,t)),7);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'son-burnley-2019',format:'11v11',title:"Son's Puskás Award run",theme:'Carrying the ball into space: long touches, full speed, head up',
 ageNote:'Premier League, Tottenham Hotspur 5–0 Burnley, Tottenham Hotspur Stadium, London, 7 December 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of winter turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
