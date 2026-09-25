/** Formiga, "Signature: winning it back in midfield" — shown in ONE real, sourced moment: Brazil v South Korea, 2015 FIFA Women's World
 * Cup, Group E, Olympic Stadium, Montreal, 9 June 2015 (Brazil 2–0): her 33rd-minute goal. An iconic-play riso film (RisoStory, chapters
 * mode): a 1:1 reconstruction from written accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: Formiga ("ant") was Brazil's tireless holding midfielder for 26 years (seven World Cups, seven Olympics). Her signature
 * lesson — "stay close to your opponent and nip in when the pass is loose" — is exactly how this goal happened: she was close enough to
 * the Korean player to latch onto a loose back-pass before the keeper could reach it. It is also her record goal (the oldest scorer at a
 * Women's World Cup at that date, 37 years and 98 days).
 *
 * SOURCES (cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "Formiga" (born 3 March 1978; 1.62 m; midfielder; nickname = "ant", for her unselfish team play; oldest Women's World Cup
 *    goalscorer v South Korea on 9 June 2015 at 37 y 3 m 6 d; seven consecutive World Cups 1995–2019) https://en.wikipedia.org/wiki/Formiga
 *  - Wikipedia, "2015 FIFA Women's World Cup Group E" (date, 19:00 EDT kick-off, Olympic Stadium Montreal, attendance 10,175, referee Esther
 *    Staubli, scorers + minutes, line-ups + numbers, the kit templates sourced to FIFA's tactical line-up)
 *    https://en.wikipedia.org/wiki/2015_FIFA_Women%27s_World_Cup_Group_E
 *  - NBC Sports / ProSoccerTalk, Nicholas Mendola, "Brazil 2-0 Korea Republic: Ageless Formiga, Marta make World Cup history" (9 Jun 2015):
 *    "Formiga opened the scoring when she latched onto one of the worst back passes you'll see, easily pushing the ball past Kim Jungmi"
 *  - ESPN match commentary, game 410194: "Goal! Brazil 1, Korea Republic Women 0. Formiga (Brazil) right footed shot from the centre of
 *    the box to the bottom right corner." (33')
 *  - The Guardian / Associated Press match report, 10 Jun 2015 (2–0; Formiga the oldest scorer in tournament history, in her sixth World Cup)
 * CONFIRMED by those accounts: 9 June 2015, Olympic Stadium, Montreal, 19:00 local, 10,175 fans; Brazil 2–0 South Korea; Formiga No. 20
 *  (central midfield), 1.62 m, aged 37; the goal in the 33rd minute: a very poor Korean back-pass, Formiga latched onto it, pushed it past
 *  keeper Kim Jung-mi (No. 18) with a RIGHT-footed shot from the centre of the box into the bottom RIGHT corner (shooter's view: +Z here).
 *  KIT: Brazil yellow shirts, blue shorts, blue socks; South Korea all white. Marta (10), Cristiane (11), Andressa Alves (9), Thaísa (8),
 *  Andressinha (5) started for Brazil.
 * INFERRED (illustrative): which Korean player made the back-pass and who passed to her (so both are drawn WITHOUT numbers), where on the
 *  pitch it began, the pass's foot and pace; Formiga's pressing position beside the passer, the length of her dart, her set-up touch before
 *  the shot; how far Kim Jung-mi came off her line and her late dive; every other player's position; the Korean trim (red) and the
 *  keeper's red kit; Formiga's short hair and everyone's hair styles; the stadium drawing (the Big O's oval concrete bowl under its roof,
 *  a sparse crowd, a turf apron — the 2015 tournament was played on artificial turf); the boards, the ball panels, the cameras. The
 *  narration names none of the inferred details (not the passer, not the corner's side, not the kit colours).
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, from Korea's build-up to the goal; 2 = the slow-motion replay from a low touchline camera: a red ring shows how close Formiga stays
 * to her opponent, the back-pass runs out of pace (yellow dashes stop short of the keeper), a red arrow = her dart, a spark = she wins it;
 * 3 = the replay from behind the goal: the right-foot finish (a red boot ring, a yellow lane into the bottom corner), then a swing round to
 * her celebration; 4 = the lesson from a low front camera: stay close (ring), your opponent (tether), nip in (arrow + spark), the pass is
 * loose (dashes). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(); women
 * footballers use athlete.ts builds (height ≈1.6–1.72, bulk ≈.9) with ponytails / short / curly hair. The world is right-handed
 * (athlete.ts's convention: X toward Korea's goal, Y up, +Z toward the main stand), so the right-foot finish needs no mirrored projector.
 * Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is
 * seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"Montreal, 2015, the Women's World Cup. Brazil against South Korea. Formiga hunts in midfield, right behind her opponent. Korea pass back... too softly! Formiga nips in, and slides it past the keeper. Goal!",seconds:16.2,
  cues:[[.2,'Montreal'],[2,"the Women's"],[3.5,'Brazil against'],[5.5,'Formiga hunts'],[7.2,'right behind'],[9.3,'Korea pass back'],[10.6,'too softly'],[11.6,'Formiga nips in'],[12.8,'slides it'],[14.6,'Goal']]},
 {label:'Watch it again',text:'Watch it again. She stays close to her opponent. The back-pass is slow, so she darts in and wins it.',seconds:8.8,
  cues:[[.15,'Watch it again'],[1.5,'stays close'],[3.3,'The back-pass'],[4.3,'slow'],[5.3,'darts in'],[6.3,'wins it']]},
 {label:'Right foot',text:"Her right foot rolls it into the corner. At thirty-seven, Formiga became the oldest goalscorer at a Women's World Cup!",seconds:9.4,
  cues:[[.15,'Her right foot'],[1.3,'rolls it'],[2.2,'into the corner'],[3.6,'At thirty-seven'],[4.5,'Formiga became'],[5.4,'the oldest goalscorer'],[7,"Women's World Cup"]]},
 {label:'Your turn',text:'Your turn: stay close to your opponent, and nip in when the pass is loose.',seconds:7.6,
  cues:[[.15,'Your turn'],[1,'stay close'],[1.9,'your opponent'],[3.3,'nip in'],[4.3,'the pass is loose']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py formiga-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/formiga-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-formiga-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/formiga-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('formiga: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit.
 * Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Brazil attack +X, Korea's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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

// ---------------------------------------------------------------- the Olympic Stadium, Montreal: an oval concrete bowl under a roof
const CX=52.5,NS=48;
/** a point on the oval: angle th around the pitch centre, d metres out from the bowl's base, height y (superellipse) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(43+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const STAND=(b:number):[number,number]=>[1+36*b,1.3+27*b];
type Bowl={stand:V3[][];fascia:V3[][];roof:V3[][];lights:V3[][];base:V3[];seats:{P:V3;h:number;row:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={stand:[],fascia:[],roof:[],lights:[],base:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=STAND(0),[d1,y1]=STAND(1);
  o.stand.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // the concrete ring beam at the top of the bowl, then the roof's underside sloping up and in toward its central opening
  o.fascia.push([rim(a,37,28.3),rim(b,37,28.3),rim(b,37.5,31.5),rim(a,37.5,31.5)]);
  o.roof.push([rim(a,37.5,31.5),rim(b,37.5,31.5),rim(b,8,47),rim(a,8,47)]);
  // the light ring hangs off the roof (inferred placement)
  if(i%2===0)o.lights.push([rim(a+.02,20,40.6),rim(b-.02,20,40.6),rim(b-.02,20.3,42),rim(a+.02,20.3,42)]);
  o.base.push(rim(a,0,0));
  // seats: a sparse crowd (10,175 in the big bowl) — most fans low down, the rest empty seats
  for(let r=0;r<11;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11),dens=r<4?.62:r<7?.3:.1;if(h>dens)continue;const[d,y]=STAND((r+.5)/11);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h:hash(i*31+r*7+k,5),row:r});}}
 return o;})();
/** everything behind the pitch: the roof's shadowy underside, the concrete bowl, the crowd (roar lifts the marks, flash = cameras) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const st=new Path2D(),fas=new Path2D(),rf=new Path2D(),li=new Path2D(),glow=new Path2D(),rib=new Path2D();
 for(let i=0;i<NS;i++){const q=quadP(c,BOWL.stand[i]);if(q)st.addPath(polyPath(q,true));const f=quadP(c,BOWL.fascia[i]);if(f)fas.addPath(polyPath(f,true));
  const r=quadP(c,BOWL.roof[i],12);if(r)rf.addPath(polyPath(r,true));if(i%3===0)seg3(c,BOWL.roof[i][0],BOWL.roof[i][3],.9,rib);}
 for(const L of BOWL.lights){const q=quadP(c,L,24);if(!q)continue;li.addPath(polyPath(q,true));const cx=(q[0][0]+q[2][0])/2,cy=(q[0][1]+q[2][1])/2,w=Math.abs(q[1][0]-q[0][0])+6;
  glow.addPath(polyPath(blob(cx,cy,w*1.2,w*.7,7,{amp:.05,n:14}),true));}
 s.tone(B,rf,.2);s.fill(K,rib,.55);
 // the bowl: pale concrete tiers of mostly empty seats, two walkway bands (so the stand reads against the dark roof)
 const walk=new Path2D();for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;for(const u of [.36,.68]){const[d0,y0]=STAND(u),[d1,y1]=STAND(u+.03),q=quadP(c,[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);if(q)walk.addPath(polyPath(q,true));}}
 s.knockout(st);s.tone(B,st,.55);s.tone(R,st,.12);s.knockout(walk,.75);
 // the crowd: one mark per fan group; Brazil yellow and green-ish, white, red, navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,12),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.3?0:q.h<.62?1:q.h<.74?2:q.h<.86?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.55);s.fill(Y,inks[1],.8);s.fill(R,inks[2],.7);s.fill(B,inks[3],.8);s.fill(K,inks[4],.8);
 s.knockout(fas,.7);s.tone(K,fas,.25);
 s.tone(Y,glow,.3);s.knockout(li);s.fill(Y,li,.5);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the turf apron, the artificial pitch with its stripes, boards, paper lines and both goals (the right goal drawn later from behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const ap=polyP(c,BOWL.base);if(ap.length>2){const p=polyPath(ap,true);s.knockout(p);s.fill(Y,p,.85);s.tone(B,p,.8);s.tone(K,p,.3);}
 const g=polyP(c,[[-3,0,-36],[108,0,-36],[108,0,36],[-3,0,36]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const stp=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-36],[(k+1)*5.25,0,-36],[(k+1)*5.25,0,36],[k*5.25,0,36]]);if(q.length>2)stp.addPath(polyPath(q,true));}s.tone(K,stp,.12);
 // boards: far touchline and behind both goals, blue with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-2,0,-37],[107,0,-37],[107,.9,-37],[-2,.9,-37]]),polyP(c,[[108.5,0,-30],[108.5,0,30],[108.5,.9,30],[108.5,.9,-30]]),polyP(c,[[-3.5,0,30],[-3.5,0,-30],[-3.5,.9,-30],[-3.5,.9,30]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<17;k++){const x=0+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<9;k++){const z=-28+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(B,bd,.9);s.tone(K,bd,.3);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??GOALPT[1]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.6*Math.exp(-Math.pow((z-bz)/1.6,2)));
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
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** women footballers: athletic builds, a touch slimmer through the shoulders */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.9,thighs:o.thighs??1.05,head:1.02});
/** Brazil 2015 (confirmed): yellow shirts, blue shorts, blue socks; blue numbers (as in the approved Brazil women's films) */
const BRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],trim:B,shorts:[B,.92],socks:[B,.92],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:B,build:W(1.64),seed:20,...o});
/** Formiga: No. 20, 1.62 m (confirmed); short dark hair (inferred); a compact, tireless holding midfielder's build */
const FORMIGA_ST:AthleteStyle=BRA({number:20,skin:SKIN_D,hair:[K,.95],hairStyle:'short',build:W(1.62,{bulk:.93,thighs:1.1}),seed:20});
/** South Korea 2015 (confirmed): all white; red trim and navy numbers inferred */
const KOR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'short',numberInk:K,build:W(1.65),seed:40,...o});
/** the Korean back-passer (not identified in the sources: drawn with no number) */
const PASSER_ST:AthleteStyle=KOR({number:null,hairStyle:'short',build:W(1.68,{bulk:.94}),seed:41});
/** Kim Jung-mi: No. 18 (confirmed); the red keeper's kit is inferred */
const KIM_ST:AthleteStyle={shirt:[R,.9],trim:K,shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',number:18,numberInk:K,build:W(1.7,{bulk:.95}),seed:18};
/** referee Esther Staubli (kit colour inferred) */
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,build:W(1.68),seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: ponytails and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after the back-pass)
type Role='formiga'|'bra'|'kor'|'passer'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** the beats (times and places inferred; see the header) */
const FEED=-3,RECV=-2,PASS=0,NIP=1.5,SHOT=2.05,LINE=2.52,IN_NET=2.66,DIVE=2.02;
const GOALPT:[number,number]=[105,2.85];
const ACTORS:Actor[]=[
 {name:'Formiga',role:'formiga',style:FORMIGA_ST,key:true,keys:[[-10,72,-1],[-7,75,-2],[-4.5,78.4,-2.8],[-3,80.4,-3.1],[-2,82,-3],[-1,83,-2.8],[0,83.7,-2.6],[.5,86.4,-2.35],[1,89.8,-2.15],[NIP,92.8,-2.05],[1.8,93.9,-1.9],[SHOT,94.6,-1.8],[2.4,95.5,-1.4],[3,97,0],[4,98.6,3.2],[5.2,99.4,7],[6.5,98.8,10.4],[8,97.6,13],[10,96.4,15]]},
 {name:'passer',role:'passer',style:PASSER_ST,key:true,keys:[[-10,88.5,-6.5],[-6,87.6,-6],[FEED,86.4,-5.2],[RECV,85.6,-4.7],[-1,85.1,-4.4],[PASS,84.8,-4.15],[.6,85.3,-3.9],[1.5,86.6,-3.3],[3,88.8,-2.2],[6,90.5,-1.4],[10,91,-1]]},
 {name:'Kim Jung-mi',role:'gk',style:KIM_ST,key:true,keys:[[-10,103.4,-.6],[-2,103,-1],[PASS,102.6,-1.1],[.7,101.6,-1],[NIP,99.9,-.85],[1.85,99.3,-.75],[DIVE,99.15,-.7],[4,99.2,-.7],[10,100,0]]},
 {name:'Korea feeder',role:'kor',style:KOR({number:null,seed:42}),keys:[[-10,76,-11],[-6,78.2,-10],[FEED,80,-9],[-1,79.4,-8.4],[3,81,-7],[10,85,-5]]},
 {name:'Cristiane',role:'bra',style:BRA({number:11,hair:[K,.9],build:W(1.72,{bulk:.95}),seed:11}),keys:[[-10,91,5],[-4,89,3.6],[0,88.6,2.4],[2,93,3],[3.5,96.6,5.8],[5,98.4,9.8],[7,98,12.6],[10,97,14.2]]},
 {name:'Marta',role:'bra',style:BRA({number:10,hair:[K,.95],build:W(1.62,{bulk:.88}),seed:10}),keys:[[-10,84,15],[-4,85,13.6],[0,86.2,12.4],[3,92,10.5],[5.5,97,11.6],[8,97.4,13.8],[10,96.8,15]]},
 {name:'Andressa Alves',role:'bra',style:BRA({number:9,seed:9}),keys:[[-10,86,-17],[-4,87,-15.5],[0,88,-14],[3,92,-10],[6,96,-2],[10,96.5,6]]},
 {name:'Thaísa',role:'bra',style:BRA({number:8,hairStyle:'curly',seed:8}),keys:[[-10,68,-6],[-4,71,-6],[0,74,-5],[4,79,-3],[10,86,0]]},
 {name:'Andressinha',role:'bra',style:BRA({number:5,seed:5}),keys:[[-10,72,8],[-4,74.5,7.4],[0,77,7],[4,82,6],[10,88,6]]},
 {name:'Korea 2',role:'kor',style:KOR({number:2,seed:43}),keys:[[-10,93,16],[-4,92,14.6],[0,91.2,13.4],[3,93.5,10.5],[10,96,8]]},
 {name:'Korea 20',role:'kor',style:KOR({number:20,seed:44}),keys:[[-10,93,-18],[-4,92,-17],[0,91,-15.6],[3,93.6,-12],[10,95.6,-9]]},
 {name:'Korea CB',role:'kor',style:KOR({number:null,hairStyle:'short',seed:45}),keys:[[-10,91,5.5],[-4,90.2,4.4],[0,89.8,3.4],[1.5,91.6,2.4],[3,94.6,1.6],[10,97.4,1.4]]},
 {name:'Korea 13',role:'kor',style:KOR({number:13,seed:46}),keys:[[-10,79,6],[-4,80,5],[0,81,4],[3,85,3],[10,90,2]]},
 {name:'Korea 10',role:'kor',style:KOR({number:10,seed:47}),keys:[[-10,70,-1],[-4,72,-1.5],[0,74,-2],[4,78,-1.5],[10,82,-1]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-10,70,7],[-4,74,7.5],[0,78,8],[4,85,8.6],[10,89,8.4]]},
];
const FORMIGA=0,PASSER=1,KIM=2,FEEDER=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball
/** RECVP = where the passer takes the feed; BACKP = the back-pass is struck; MEET = where it runs out of pace and Formiga gets there;
 * SETP = her set-up touch; AIM = where the keeper expected it */
const RECVP:[number,number]=[85.95,-4.55],BACKP:[number,number]=[85.25,-4.05],MEET:[number,number]=[93.25,-2.15],SETP:[number,number]=[95.05,-1.65],AIM:[number,number]=[100.4,-.9];
const NETP:V3=[105.9,.14,3.05],REST:V3=[106,.11,3.1];
/** the ball ahead of the feeder's feet */
function feederBall(tau:number):[number,number]{const p=posOf(FEEDER,tau),v=velOf(FEEDER,Math.min(tau,FEED-.1)),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.5,p[1]+v[1]/l*.5];}
const easeD=(u:number,p:number)=>1-Math.pow(1-clamp(u),p);
function ballAt(tau:number):V3{
 if(tau<FEED){const b=feederBall(tau);return[b[0],.11,b[1]];}
 if(tau<RECV){const s0=feederBall(FEED),e=easeD((tau-FEED)/(RECV-FEED),1.4);return[lerp(s0[0],RECVP[0],e),.11,lerp(s0[1],RECVP[1],e)];}
 if(tau<PASS){const e=easeInOutSine(clamp((tau-RECV)/(PASS-RECV)));return[lerp(RECVP[0],BACKP[0],e),.11,lerp(RECVP[1],BACKP[1],e)];}
 // the soft back-pass: it dies on the turf long before the keeper
 if(tau<NIP){const e=easeD(tau/NIP,2.2);return[lerp(BACKP[0],MEET[0],e),.11,lerp(BACKP[1],MEET[1],e)];}
 if(tau<SHOT){const e=easeD((tau-NIP)/(SHOT-NIP-.05),1.5);return[lerp(MEET[0],SETP[0],e),.11,lerp(MEET[1],SETP[1],e)];}
 if(tau<LINE){const u=(tau-SHOT)/(LINE-SHOT),e=easeD(u,1.1);return[lerp(SETP[0],GOALPT[0],e),.11+.12*Math.sin(Math.PI*u),lerp(SETP[1],GOALPT[1],e)];}
 if(tau<IN_NET){const u=(tau-LINE)/(IN_NET-LINE);return[lerp(GOALPT[0],NETP[0],u),.11,lerp(GOALPT[1],NETP[2],u)];}
 const e=easeD((tau-IN_NET)/.5,2);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e),lerp(NETP[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:.6*Math.exp(-(tau-IN_NET)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
/** the ball's spin (the panels roll with the distance it has travelled) */
const spinAt=(tau:number)=>{const a=ballAt(tau),b=ballAt(tau-.1);return(a[0]+a[2]*.7)/.11+Math.hypot(a[0]-b[0],a[2]-b[2]);};

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:9,rHipA:9,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-8});
/** the hunt: low, on the balls of the feet a stride off her opponent's shoulder, arms loose and wide, eyes on the ball */
const HUNT:Partial<Pose>={lHipF:36,rHipF:30,lKnee:52,rKnee:46,lHipA:12,rHipA:12,lean:22,pitch:6,lShA:34,rShA:34,lShF:18,rShF:18,lElb:52,rElb:52,neckP:12,squash:-.03};
/** the dart: drive off the front foot, body low and forward */
const DART:Partial<Pose>={lean:26,pitch:10,neckP:6,squash:-.02};
/** the passer: hands to her head as the ball goes in */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:40,rShA:40,lElb:128,rElb:128,neckP:-10,lean:-4,lHand:1,rHand:1};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk'){yaw=yawOf(b[0]-x,b[2]-z);}
 if(k===PASSER&&tau>-1.3&&tau<.3)yaw=lerpA(yaw,yawOf(AIM[0]-x,AIM[1]-z),bump(-1.4,.4,tau)*1.6);
 if(k===FORMIGA){if(tau>-2.2&&tau<.1)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),bump(-2.3,.2,tau)*.8);
  if(tau>1.6&&tau<2.5)yaw=lerpA(yaw,yawOf(GOALPT[0]-x,GOALPT[1]-z),Math.min(sm(1.6,1.85,tau),1-sm(2.3,2.5,tau)));}
 if(a.role==='bra'||a.role==='kor'||a.role==='ref'){if(sp<1.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),1-sp/1.2);}
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='kor'||a.role==='passer'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5),stride=k===FORMIGA?3.5:3.3;p=blendPose(idle,runCycle(distOf(k,tau)/stride,{speed:s}),clamp((sp-.5)/.9));}
 if(k===KIM){// comes off her line for the pass, sets, then a late low dive to her left (+Z)
  const u=(tau-DIVE)/.9;if(u>0)p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.05}),sm(0,.1,u));}
 if(k===PASSER){// the touch on the feed, then the soft right-footed back-pass
  p=over(p,{rHipF:28,rKnee:30,rAnk:18,lean:16,neckP:30,lShA:40,rShA:30},bump(RECV-.3,RECV+.25,tau));
  const D=.8,st=PASS-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.2}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>LINE)p=over(p,DESPAIR,sm(LINE,LINE+.5,tau));}
 if(k===FEEDER){const D=.8,st=FEED-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.35}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===FORMIGA){
  p=over(p,HUNT,bump(-2.6,.25,tau)*(1-clamp((sp-3)/3)));
  p=over(p,DART,bump(0,NIP+.1,tau));
  // she gets there first: a quick RIGHT-foot touch to set it (inferred), then the RIGHT-footed finish into the bottom right corner (confirmed)
  {const D=.5,st=NIP-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.15}),Math.min(sm(0,.2,u),1-sm(1,1.3,u)));}
  {const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));p=over(p,{rHipR:34},bump(.3,.8,u));}}
  if(tau>LINE+.3){const w=sm(LINE+.3,LINE+.9,tau);p=blendPose(p,tau<5.6?celebrate(tau*.9,{kind:'run'}):celebrate((tau-5.6)*1.1,{kind:'arms'}),w);}
 }
 if(a.role==='bra'&&k!==FORMIGA&&tau>LINE+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(LINE+.5,LINE+1,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(a.key?1.2:7))return;// a TV camera keeps extras off its lens
 const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.8/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.85,br*.26,2,{amp:.05,n:12}),true));s.tone(K,sh,.4);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:spinAt(tau),key:K,shadow:B,seed:5});};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===FORMIGA?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===FORMIGA||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===FORMIGA}:{});
  if(e.k===FORMIGA)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ground ribbon through world points (knocked out, then printed) */
function groundRibbon(s:Sheet,c:Cam,pts:[number,number][],wm:number,ink:string,w:number,seed:number,arrow=false){if(w<=0)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<2)return;const n=Math.max(2,Math.round(sp.length*clamp(w))),seg=sp.slice(0,n),wd=Math.max(4,c.F*wm/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 if(arrow){const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}}
/** a ring on the grass round a world point (radius in metres) */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rad:number,ink:string,w:number,seed:number){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[x+Math.cos(a)*rad,.03,z+Math.sin(a)*rad]);if(!q)return;pts.push(q);}
 const q=toCam(c,[x,0,z]);if(q[2]<1)return;const wd=Math.max(3,c.F*.1/q[2]);
 s.knockout(ribbon(pts,wd*1.8,{seed,close:true,taper:0,wobble:.8}),.7*w);s.fill(ink,ribbon(pts,wd,{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** "stays close": a red ring round the passer with Formiga inside it, and a short tether between them */
function closeMarks(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const p=posOf(PASSER,tau),f=posOf(FORMIGA,tau);
 groundRing(s,c,p[0],p[1],2.9*clamp(w*1.2),R,w,51);
 groundRibbon(s,c,[[p[0],p[1]],[(p[0]+f[0])/2,(p[1]+f[1])/2],[f[0],f[1]]],.08,R,w,53);}
/** "too softly / slow": the back-pass line toward the keeper, solid where the ball went, dashed where it never got, and a ring where it died */
function slowMarks(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 groundRibbon(s,c,[BACKP,[(BACKP[0]+MEET[0])/2,(BACKP[1]+MEET[1])/2],MEET],.07,Y,w,71);
 const k=posOf(KIM,Math.min(tau,NIP)),dash=new Path2D();
 for(let i=0;i<6;i++){const u0=i/6,u1=u0+.5/6,a=pr(c,[lerp(MEET[0],k[0],u0),.03,lerp(MEET[1],k[1],u0)]),b=pr(c,[lerp(MEET[0],k[0],u1),.03,lerp(MEET[1],k[1],u1)]);if(a&&b)dash.addPath(ribbon([a,b],Math.max(3,c.F*.07/Math.max(1,toCam(c,[MEET[0],0,MEET[1]])[2])),{seed:72+i,taper:0}));}
 s.knockout(dash,.7*w);s.fill(Y,dash,.95*w);
 groundRing(s,c,MEET[0],MEET[1],.7,R,w,75);}
/** "darts in": a red arrow on the grass along Formiga's run to the ball */
function dartArrow(s:Sheet,c:Cam,w:number){const pts:[number,number][]=[];for(let i=0;i<=12;i++)pts.push(posOf(FORMIGA,PASS+.05+(NIP-.1)*i/12));groundRibbon(s,c,pts,.12,R,w,61,true);}
/** the finish: a yellow lane from her boot into the bottom corner */
function finishLane(s:Sheet,c:Cam,w:number,seed:number){if(w>0)groundRibbon(s,c,[[SETP[0],SETP[1]],[lerp(SETP[0],GOALPT[0],.5),lerp(SETP[1],GOALPT[1],.5)],[GOALPT[0]+.6,GOALPT[1]+.08]],.1,Y,w,seed,true);}
/** a red ring round a boot */
function bootRing(s:Sheet,r:DrawResult|undefined,foot:'l'|'r',w:number){if(!r||w<=0)return;const toe=foot==='r'?r.joints.rToe:r.joints.lToe,an=foot==='r'?r.joints.rAn:r.joints.lAn,rad=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.8]);}s.fill(R,ribbon(pts,Math.max(3,rad*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** a spark at a world point */
function sparkAt(s:Sheet,c:Cam,P:V3,age:number,seed:number,ink=Y){if(age<-.3||age>.5)return;const q=toCam(c,P);if(q[2]<1)return;const g=scr(c,q);sparkBurst(s,ink,g[0],g[1],c.F*.5/q[2],{n:8,seed,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:Math.max(5,c.F*.04/q[2])});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const g=CUEW(0,'Goal');return key(t,[[0,-9],[CUEW(0,'Formiga hunts'),-3.3],[CUEW(0,'right behind'),-1.3],[CUEW(0,'Korea pass back'),PASS],[CUEW(0,'too softly'),.75],[CUEW(0,'Formiga nips in'),NIP],[CUEW(0,'slides it'),SHOT],[g,LINE+.15],[SECS(0)+1,LINE+.15+SECS(0)+1-g]],linear);};
const CAM1:V3=[52.5,25,86];
function cam1(t:number):Cam{
 const G=CUEW(0,'Goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[66,8,-12],m=posOf(FORMIGA,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(.4,3.4,t,easeInOutSine),toA=sm(G+.5,G+1.6,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]+3,toBall),lerp(open[1],2,toBall),lerp(open[2],bt[2]*.8,toBall)],T=lerp3(tb,cel,toA);
 const F=key(t,[[0,1500],[3.4,2800],[CUEW(0,'Formiga hunts'),3600],[CUEW(0,'right behind'),4600],[CUEW(0,'Korea pass back'),5200],[CUEW(0,'Formiga nips'),5800],[G,6300],[G+1.5,7300],[S,7600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(FORMIGA,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: close to her opponent, the slow back-pass, she wins it
const tau2=(t:number)=>key(t,[[0,-2.3],[CUEW(1,'stays close'),-1.5],[CUEW(1,'The back-pass'),-.05],[CUEW(1,'slow'),.55],[CUEW(1,'darts in'),.85],[CUEW(1,'wins it'),NIP],[SECS(1),NIP+.4]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),a=smooth(FORMIGA,tau),ps=smooth(PASSER,tau),wide=sm(CUEW(1,'The back-pass')-.4,CUEW(1,'slow'),t,easeInOutSine)*(1-sm(CUEW(1,'wins it')+.3,SECS(1),t,easeInOutSine)*.5);
 const mid:[number,number]=[(a[0]+ps[0])/2,(a[1]+ps[1])/2],k=posOf(KIM,Math.min(tau,NIP)),tg:[number,number]=[lerp(mid[0],(mid[0]+k[0])/2,wide),lerp(mid[1],(mid[1]+k[1])/2,wide)];
 const open=1-sm(0,1.3,t,easeInOutSine);
 const C:V3=[tg[0]-4.5+1.5*open,1.5+.4*open+.9*wide,tg[1]+10+3*open+4*wide],T:V3=[tg[0]+1,.85,tg[1]-.3];
 return look(C,T,2700-700*wide-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sc=CUEW(1,'stays close'),bp=CUEW(1,'The back-pass'),sl=CUEW(1,'slow'),di=CUEW(1,'darts in'),wi=CUEW(1,'wins it'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  closeMarks(s,c,tau,sm(sc-.2,sc+.6,t,easeOutBack)*(1-sm(bp-.1,bp+.4,t)));
  slowMarks(s,c,tau,sm(sl-.2,sl+.4,t,easeOut)*(1-sm(E-1,E-.6,t)));
  dartArrow(s,c,sm(di-.2,di+.6,t,easeOut)*(1-sm(E-1,E-.6,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{sparkAt(s,c,[MEET[0],.15,MEET[1]],t-wi,83);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the right-foot finish, then the celebration
const tau3=(t:number)=>{const ic=CUEW(2,'into the corner');return key(t,[[0,NIP-.1],[CUEW(2,'Her right foot'),NIP+.1],[CUEW(2,'rolls it'),SHOT],[ic,LINE+.02],[ic+.9,IN_NET+.6],[SECS(2),IN_NET+.6+(SECS(2)-ic-.9)*.9]],linear);};
const swing3=(t:number)=>{const ic=CUEW(2,'into the corner');return sm(ic+.4,ic+1.7,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(FORMIGA,tau),u=swing3(t),push=sm(0,CUEW(2,'rolls it'),t,easeInOutSine),hold=sm(CUEW(2,'At thirty')+1,SECS(2),t,easeInOutSine);
 const C0:V3=[117,4,-7+1.5*push],T0:V3=[lerp(m[0],(m[0]+104)/2,.35),1,lerp(m[1],1.2,.3)];
 const mm=smooth(FORMIGA,tau),C1:V3=[mm[0]+6.5+hold,1.9+.4*hold,mm[1]+7.5+1.4*hold],T1:V3=[mm[0]-.4,1.2+.3*hold,mm[1]-.6];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2900+1000*push,3000-200*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),rf=CUEW(2,'Her right foot'),ri=CUEW(2,'rolls it'),ic=CUEW(2,'into the corner'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(LINE,LINE+.3,tau),flash:sm(ic-.1,ic+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  finishLane(s,c,sm(ri-.15,ri+.45,t,easeOut)*(1-sm(ic+.6,ic+1.1,t)),64);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   bootRing(s,hero,'r',sm(rf-.1,rf+.3,t,easeOutBack)*(1-sm(ri+.6,ri+1,t)));}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),GOALPT[1]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(FORMIGA,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera travelling with her, stay close → nip in → the loose pass
const tau4=(t:number)=>key(t,[[0,-1.9],[CUEW(3,'stay close'),-1.2],[CUEW(3,'your opponent'),-.35],[CUEW(3,'nip in'),.55],[CUEW(3,'the pass is loose'),NIP-.05],[SECS(3),NIP+.45]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(FORMIGA,tau),late=sm(CUEW(3,'nip in')-.3,CUEW(3,'the pass')+.6,t,easeInOutSine);
 const C:V3=[m[0]+6+2*late,1.4+.5*late,m[1]+6.5+1.5*late],T:V3=[m[0]+1+2.5*late,.9,m[1]-.8];
 return look(C,T,2300-350*late);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),sc=CUEW(3,'stay close'),yo=CUEW(3,'your opponent'),ni=CUEW(3,'nip in'),pl=CUEW(3,'the pass is loose'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  closeMarks(s,c,tau,sm(sc-.2,sc+.5,t,easeOutBack)*(1-sm(ni-.2,ni+.2,t)));
  dartArrow(s,c,sm(ni-.2,ni+.6,t,easeOut)*(1-sm(E-.8,E-.4,t)));
  slowMarks(s,c,tau,sm(pl-.2,pl+.4,t,easeOut)*(1-sm(E-.8,E-.4,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // "your opponent": a red spark over the passer's head — that is who you stay close to
   const p=posOf(PASSER,tau);sparkAt(s,c,[p[0],2.1,p[1]],t-yo-.15,91,R);
   sparkAt(s,c,[MEET[0],.15,MEET[1]],t-pl-.2,93);}});
 },
 still:3.4,
};

const film:RisoStory={
 id:'formiga-signature',format:'11v11',title:'Formiga Wins It Back',theme:'Winning it back in midfield: stay close to your opponent and nip in when the pass is loose',
 ageNote:"Formiga's record goal: Brazil v South Korea, 2015 FIFA Women's World Cup, Olympic Stadium, Montreal, 9 June 2015. For players of every age.",
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — rubber crumbs thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.6*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
