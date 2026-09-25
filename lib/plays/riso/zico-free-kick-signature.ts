/** Zico's signature: the curling free kick — Brazil 4–1 Scotland, 1982 World Cup, Group 6, Estadio Benito Villamarín, Seville, 18 June 1982.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * lib/town/iconicPlays.json lists Zico as kind "signature" ("the curling free kick"; lesson: aim over the wall and let the curl bring the ball
 * down). WHY THIS MOMENT: it is his best-documented free kick on the biggest stage (FIFA files it under "World Cup wonder goals"; the
 * Independent put it in its 100 greatest World Cup moments), and the sources describe exactly the signature: a short, calm approach, the ball
 * lifted over the wall and curled down into the top corner while the keeper could only watch. A 1:1 reconstruction from written accounts
 * (we cannot watch the footage), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl; cached in scratchpad/films/src-cache):
 *  - Wikipedia, "1982 FIFA World Cup Group 6" (raw wikitext: result, time, venue, attendance, referee, line-ups, both kit templates)
 *    https://en.wikipedia.org/wiki/1982_FIFA_World_Cup_Group_6
 *  - Wikipedia, "Zico (footballer)" (raw wikitext: free-kick technique — standing foot, leaning back, knee raised high, instep, lifting it
 *    over the wall so it drops again; either top or bottom corner) https://en.wikipedia.org/wiki/Zico_(footballer)
 *  - The Guardian, Rob Smyth, "The Joy of Six: free-kick specialists" (28 Aug 2009): after training Zico hung a shirt in each top corner and
 *    aimed at them from 20 yards; a metal silhouette as a wall; "body leaning back ... caress the ball with the instep"; getting it up and down.
 *    https://www.theguardian.com/sport/blog/2009/aug/28/joy-of-six-free-kick-specialists
 *  - FUTWALL TEMPO, "Retro report: Brazil v Scotland 1982, the beauty of the unpredictable" (27 Mar 2026): Narey 18'; Cerezo fouled in the
 *    33rd minute; Zico "curled a free-kick into the top corner", 1–1; second half kicked off 10.00 pm as the sun went down; the Seville heat.
 *    https://futwalltempo.substack.com/p/retro-report-brazil-v-scotland-1982
 *  - The Independent, "World Cup 2014 countdown: Zico silences Scotland in 1982": "a sublime 30-yard free-kick into the top corner. Goalkeeper
 *    Alan Rough could only stand and watch." https://www.independent.co.uk/sport/football/international/world-cup-2014-countdown-zico-silences-scotland-in-1982-9265459.html
 *  - FIFA, "World Cup wonder goals: Zico v Scotland (1982)" (summary only: "leave Scotland goalkeeper Alan Rough awestruck").
 *  - Pete Spencer, "FIFA World Cup Spain 1982 – Day Six" (search-result summary only): "a free-kick in a fairly central position, about 30
 *    yards out. Zico took two steps and then curled the ball round the wall into the top corner with Rough rooted to the spot."
 * CONFIRMED by those pages: 18 June 1982, 21:00 local, Benito Villamarín, Seville, 47,379, referee Luis Paulino Siles (Costa Rica); Narey put
 *  Scotland 1–0 up (18'); Zico's free kick made it 1–1 (33'), after a foul on Cerezo; about 30 yards out, fairly central; a two-step approach;
 *  curled into the top corner; Rough did not move; Brazil won 4–1 (Oscar 48', Éder 63', Falcão 87'). Numbers: Zico 10, Rough 1.
 *  Kits (kit templates): Brazil yellow shirts with green collar and cuffs, blue shorts, white socks; Scotland navy shirts, white shorts, red
 *  socks. Zico's method: instep, leaning back, big knee lift, the ball lifted over the wall and brought back down.
 * SOURCES DISAGREE (slightly): "round the wall" (Spencer) v over the wall (Zico's general method, Wikipedia/Guardian). The film sends it up
 *  over the OUTER end of the wall and curls it in, so both hold; the narration says "over the wall".
 * INFERRED / ILLUSTRATIVE: every position in metres (ball 27.4 m out and 1.2 m left of centre), the wall (four men, who they were, their
 *  numbers), WHICH top corner (drawn: the left one from Zico's view, the keeper's right — not named in the narration), the ball's exact
 *  height and curve (a cubic fitted to "up over the wall, curls and dips into the top corner"), its speed, the SHOOTING FOOT (right: Zico was
 *  two-footed; iconicPlays.json says right; not narrated), where Rough stood, his kit (a grey jersey, inferred) and hair, the other players'
 *  places, the referee's black kit, the ball (an Adidas Tango-style ball), the stadium's look, the evening light, the camera positions, the
 *  slow-motion speed, the celebration, and the shirts in the lesson (drawn to illustrate the Guardian's training story, not this match).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (establishing wide → the scoreline beat → close
 * on Zico → the two steps → panning with the ball to the goal → the net); ch2 = the slow-motion replay from BEHIND Zico, high, so the ball is
 * seen rising over the wall, curling and dipping (a riso replay trail); ch3 = the lesson: shirts in the top corners (his daily practice), a
 * close low view of the strike, then a side-on view where the aim line goes up over the wall and the curl brings the ball down.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), frames from 1.45:1 down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Inks: yellow, red, blue, navy. Cue-keyed; seeded randomness. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,posed,blendPose,backpedal,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `at` times and chapter `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once
 * public/plays/narration/zico-free-kick-signature/timing.json exists, replace VOICE below with
 *   import timingJson from '../../../public/plays/narration/zico-free-kick-signature/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 * (every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:'Seville, 1982. Brazil against Scotland at the World Cup, and Scotland lead one-nil! Free kick to Brazil, thirty yards out. Zico takes just two steps... Top corner! One-one!',tail:2.2,
  cues:['Seville','Brazil against Scotland','Scotland lead','Free kick','thirty yards','Zico takes','two steps','Top corner','One-one']},
 {label:'Watch it again',text:'Watch it again, from behind. The ball rises up over the wall, then curls and dips, right into the top corner. Alan Rough can only stand and watch.',tail:1.4,
  cues:['Watch it again','from behind','rises up','over the wall','curls and dips','top corner','Alan Rough','stand and watch']},
 {label:'The secret',text:'Zico practised every day, with shirts hung in the top corners as targets. Your turn: aim over the wall, and let the curl bring the ball down.',tail:1.6,
  cues:['Zico practised','shirts hung','targets','Your turn','aim over the wall','let the curl','bring the ball down']},
];
import timingJson from '../../../public/plays/narration/zico-free-kick-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('zico: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zico: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const D2R=Math.PI/180;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal Scotland defends is x = 0 (Brazil attack +x), goal centre z = 0, +z = Zico's right (the main-stand side). */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov});

// ---------------------------------------------------------------- the Villamarín bowl (illustrative): evening sky, stands, crowd, pylons
/** stand planes (a along, b up the rake 0..1): 0 far side (z<0), 1 behind the goal, 2 near side (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+22*b,-41-30*b],
 (a,b)=>[8+30*b,1.4+19*b,lerp(-54,54,a)],
 (a,b)=>[lerp(14,-118,a),1.4+22*b,41+30*b],
 (a,b)=>[-113-30*b,1.4+19*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,70,96,70],STAND_ROWS=13;
const PYLONS:V3[]=[[12,0,-50],[12,0,50],[-117,0,-50],[-117,0,50]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June evening in Seville (kick-off 21:00, the sun going down): pale blue screen, a broad warm band low down
 s.field(B,.16,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);s.tone(R,polyPath([[-1e4,hz[1]-200],[1e4,hz[1]-200],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.12);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));for(const b of[.5,1])seg3(c,S(0,b),S(1,b),.8,walk);
  if(i===2){const top=polyP(c,[S(0,1),S(1,1),add3(S(1,1),[0,3.2,0]),add3(S(0,1),[0,3.2,0])]);if(top.length>2)roof.addPath(polyPath(top,true));}}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.3);s.knockout(walk,.85);s.fill(K,roof,.88);
 // the crowd: seeded dots — Brazil yellow, the Tartan Army's navy, paper, a little red
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.34)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.78?1:h<.93?3:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.6);s.fill(Y,inks[1],.95);s.fill(K,inks[3],.85);s.fill(R,inks[2],.9);
 const mast=new Path2D(),lamp=new Path2D();
 for(const P of PYLONS){if(toCam(c,P)[2]<NEAR+2)continue;seg3(c,P,add3(P,[0,40,0]),.9,mast);const h:V3=add3(P,[0,40,0]),side:V3=[P[0]>0?-1:1,0,P[2]>0?-1:1],ax:V3=[-side[2]*.7,0,side[0]*.7];
  const q=polyP(c,[add3(h,[-ax[0]*4,-2,-ax[2]*4]),add3(h,[ax[0]*4,-2,ax[2]*4]),add3(h,[ax[0]*4,2,ax[2]*4]),add3(h,[-ax[0]*4,2,-ax[2]*4])]);if(q.length>2)lamp.addPath(polyPath(q,true));}
 s.fill(K,mast,.8);s.knockout(lamp);s.fill(Y,lamp,.75);s.stroke(K,lamp,2.2,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.75);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // advertising boards: paper with blue panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>{const q=polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]);if(q.length>2)bd.addPath(polyPath(q,true));};
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2,q=polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4,q=polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(B,pn,.9);s.fill(R,pn,.35);s.stroke(K,bd,1.6,.7);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const q=polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]);if(q.length>2)flag.addPath(polyPath(q,true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out high in the top corner the ball hits (z −3, y 1.9) */
const HIT_Z=-3.0;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1.9)=>X+2+bulge*.8*Math.exp(-Math.pow((z-HIT_Z)/1.5,2))*(.35+.65*y/1.9);
 const zs=[z0,HIT_Z,-2,-.6,.8,2.2,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
const B0:V3=[-27.4,.11,-1.2];// "about 30 yards out, fairly central": 27.4 m out, 1.2 m left of centre (inferred)
const DXG=-B0[0],WALL_D=9.15;
/** the flight as a function of distance d toward the goal: up over the wall (2.7 m at 9.15 m), peak ≈ 3.25 m, dipping to 2.2 m at the line;
 * sideways: out a little to the right, then the curl brings it left into the top corner (z −3.1). */
const HA=.41563,HB=-.0155431,HC=.000115254,SL=.0676,CURL=.004996;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d+HB*d*d+HC*d*d*d,B0[2]+SL*d-CURL*d*d];
const FLY=1.22,IN_NET=1.34;// ~27 m in 1.2 s: a placed curler (≈ 80 km/h average), slowing
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.2-.2*u);};
const tauAtD=(d:number)=>{const k=clamp(d/DXG);return FLY*(1.2-Math.sqrt(1.44-.8*k))/.4;};
const LINE_PT=flight(DXG),NET_HIT:V3=[1.7,1.75,-3.05],REST:V3=[1.2,.11,-2.7];
const T_WALL=tauAtD(WALL_D);
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(LINE_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:TAU*9*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits of 18 June 1982 (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.5],[R,.3]],SKIN_D:InkFill[]=[[Y,.45],[R,.32],[B,.1]];
/** Brazil: yellow shirts, green collar and cuffs (blue over yellow), blue shorts, white socks */
const brazil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,numberInk:[B,.6],hairStyle:'short',...o});
/** Scotland: navy shirts, white shorts, red socks */
const scotland=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,trim:'paper',shorts:'paper',socks:R,boots:K,skin:SKIN_L,hair:K,line:K,numberInk:'paper',hairStyle:'short',...o});
const ZICO_B={height:1.72,bulk:.96,thighs:1.1};
const ZICO_ST=brazil({number:10,hairStyle:'short',build:ZICO_B,seed:10});
const ROUGH_ST:AthleteStyle={shirt:[K,.4],trim:'paper',shorts:K,socks:[K,.4],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,gloves:'paper',sleeves:'long',hairStyle:'curly',number:1,numberInk:'paper',build:{height:1.85,bulk:1.02},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_M,hair:K,line:K,hairStyle:'short',build:{height:1.74},seed:30};

// ---------------------------------------------------------------- Zico: stand, two steps, lean back, strike with the RIGHT instep
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,.42/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];// from the ball's left, angled
const YAW_Z=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.05,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=RUN_END-.62,RUN_L=1.45,STRIKE_L=1.05;// two short steps, then the plant
/** where Zico's pelvis stands at contact so his RIGHT boot meets the back-left of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),ZICO_B,{x:0,z:0,yaw:YAW_Z}),toe:[number,number]=[B0[0]-DIR[0]*.12-RIGHT[0]*.04,B0[2]-DIR[1]*.12-RIGHT[1]*.04];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const Z_SET=posed({lHipF:4,rHipF:-8,lKnee:10,rKnee:14,lAnk:2,rAnk:6,lean:6,neckP:14,lShA:12,rShA:14,lShF:-4,rShF:2,lElb:22,rElb:20,twist:6});
const Z_READY=posed({lHipF:14,rHipF:-14,lKnee:22,rKnee:24,lAnk:10,rAnk:12,lean:14,pitch:2,neckP:22,lShA:24,rShA:20,lShF:8,rShF:-10,lElb:34,rElb:30,twist:4});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** Zico's pose. ready 0..1 = eyes on the ball before the two steps; it = idle clock for breathing */
function zicoPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.2);const p=blendPose(Z_SET,Z_READY,ready);p.lean+=.03*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(Z_READY,runCycle(.5+u*.95,{speed:.35}),sm(0,.25,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.45+(tau-RUN_END)*1.4,{speed:.35});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'r',power:.8}),sm(RUN_END,RUN_END+.14,tau));
 // his signature: body leaning back as the right knee comes up high through the ball
 const back=sm(-.22,-.02,tau)*(1-sm(.35,.7,tau));p.lean-=16*D2R*back;p.pitch-=6*D2R*back;p.rHipF+=10*D2R*back;
 if(tau>1.5)p=blendPose(p,celebrate((tau-1.5)/1.1,{kind:'arms'}),sm(1.5,1.8,tau));
 return p;
}
function zicoPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*runU(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.6*(1-Math.pow(1-clamp(tau/.6),2))+(tau>1.5?Math.min(3,(tau-1.5)*2.4):0);
 return{x:PC[0]+DIR[0]*g,z:PC[1]+DIR[1]*g,yaw:YAW_Z};
}

// ---------------------------------------------------------------- everyone else (positions illustrative)
type Role='wall'|'keeper'|'def'|'att'|'ref';
type Actor={role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const WALL_X=B0[0]+WALL_D;
const ACTORS:Actor[]=[
 {role:'wall',st:scotland({number:4,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:4}),x:WALL_X,z:-2.45,phase:.1},
 {role:'wall',st:scotland({number:6,hair:[R,.6],build:{height:1.76},seed:6}),x:WALL_X+.05,z:-1.9,phase:.6},
 {role:'wall',st:scotland({number:10,hair:[R,.5],hairStyle:'curly',build:{height:1.78},seed:10}),x:WALL_X,z:-1.35,phase:.3},
 {role:'wall',st:scotland({number:5,build:{height:1.87},seed:5}),x:WALL_X+.05,z:-.8,phase:.8},
 {role:'keeper',st:ROUGH_ST,x:-.5,z:.75,phase:0},
 {role:'def',st:scotland({number:14,build:{height:1.83},seed:14}),x:-10.5,z:-4.2,phase:.4},
 {role:'def',st:scotland({number:3,build:{height:1.8},seed:3}),x:-11,z:1.4,phase:.9},
 {role:'def',st:scotland({number:16,hair:[K,.6],build:{height:1.72},seed:16}),x:-12.2,z:6.2,phase:.5},
 {role:'att',st:brazil({number:8,hairStyle:'curly',skin:SKIN_D,build:{height:1.92,bulk:.95},seed:8}),x:-12.6,z:-.4,phase:.7},
 {role:'att',st:brazil({number:9,build:{height:1.85,bulk:1.05},seed:9}),x:-11.6,z:4.1,phase:.15},
 {role:'att',st:brazil({number:5,hairStyle:'curly',skin:SKIN_D,build:{height:1.86,bulk:.94},seed:5}),x:-17.2,z:2.6,phase:.25},
 {role:'ref',st:REF_ST,x:-20.5,z:4.6,phase:.35},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.42,neckP:-16});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
/** Rough, "rooted to the spot": set, weight on his heels, only his head follows the ball to his right; then the slump */
const ROUGH_SLUMP=posed({lHipF:4,rHipF:4,lKnee:8,rKnee:8,lean:18,neckP:34,lShF:-6,rShF:-6,lShA:8,rShA:8,lElb:12,rElb:12});
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),toGoal=yawTo(a.x,a.z,0,-2),watch=sm(.05,.8,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'wall':{let p=blendPose(WALL_P,stand(),.25+.12*br);const j=tau<-.1?0:Math.sin(Math.PI*clamp((tau+.1)/.62));p=blendPose(p,WALL_J,j);
   p.neckY=(-55*sm(T_WALL,T_WALL+.35,tau)*(1-sm(1.1,1.6,tau)))*D2R;
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(Math.PI,Math.PI-2.1,sm(.5,1.4,tau,easeInOutSine))}};}
  case 'keeper':{let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));p.neckY=(-58*sm(.4,1.15,tau))*D2R;p.lean-=6*D2R*sm(.6,1.1,tau);
   if(tau>1.6)p=blendPose(p,ROUGH_SLUMP,sm(1.6,2.3,tau));
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,B0[0],B0[2])}};}
  case 'ref':{let p=stand();p=blendPose(p,posed({rShF:150,rShA:20,rElb:10,lShA:14,lElb:30}),sm(-3.2,-2.9,tau)*(1-sm(-.5,-.1,tau))*.9);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  case 'def':{let p=blendPose(DEF_P,backpedal(it*.5+a.phase),.25);p.air+=.015*Math.max(0,br);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(tau>.1){const u=(tau-.1)*1.3;p=blendPose(p,runCycle(u,{speed:.5}),sm(.1,.4,tau));}
   const run=tau>.1?Math.min(2.4,(tau-.1)*3.2):0;
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,watch)}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): prev = the pose one drawn frame earlier (secondary motion),
 * smear = halftone echo + speed lines on fast limbs (the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the 1982 ball: white with black Tango-style triads
function tango(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,11,{amp:.02,n:24}),disc=polyPath(pts,true);s.knockout(disc);
 if(r<12){s.fill(K,ribbon(pts,Math.max(3,r*.22),{seed:12,close:true,wobble:.4}));return;}
 s.save();s.clip(disc);s.tone(K,crescent(x,y,r*1.02,[-.42,-.45]),.24);
 const pan=new Path2D();for(let i=0;i<4;i++){const a=rot+i/4*TAU,cx=x+Math.cos(a)*r*.55,cy=y+Math.sin(a)*r*.55,q:Pt[]=[];for(let k=0;k<3;k++){const b=a+Math.PI+(k-1)*.8;q.push([cx+Math.cos(b)*r*.42,cy+Math.sin(b)*r*.42]);}pan.addPath(ribbon(smoothPts(q,false,6,2),Math.max(2.5,r*.12),{taper:.3,wobble:0}));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(3.5,r*.075),{seed:12,close:true,pressure:.5,wobble:r*.02}));
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 tango(s,g[0],g[1],r,spinAt(tau));
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[];
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 {const pl=zicoPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=zicoPose(tp,e.ready,e.it),prev={pose:zicoPose(tpPrev,e.ready,e.it-1/12),place:zicoPlace(tpPrev)};
  drawPlayer(s,pose,c,ZICO_ST,pl,prev,!!e.smear&&tp>RUN_END+.2&&tp<.4);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,a.st,cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const zxz=(tau:number):V3=>{const p=zicoPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time: Zico waits over the ball; his two steps run under "two steps" (≈1 s, slightly quicker than τ), the strike lands so the
 * ball hits the net on "Top corner", then real time */
const tC1=()=>Math.max(CUE(0,'two steps')+.35,CUE(0,'Top corner')+.1-IN_NET);
const tau1=(t:number)=>{const c=tC1(),a=c-1.05;return t<a?T_RUN0:t<c?lerp(T_RUN0,0,(t-a)/(c-a)):t-c;};
const P1:V3=[-30,16,54];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-18,0,-1],fov:34})],
  [CUE(0,'Scotland lead')-.2,.9,()=>({P:P1,T:[-2,1,0],fov:13})],
  [CUE(0,'Free kick')-.1,.9,()=>({P:P1,T:[-18,.4,-1.4],fov:24})],
  [CUE(0,'Zico takes')-.3,.8,()=>({P:P1,T:add3(zxz(tau),[.6,.9,0]),fov:6})],
  [CUE(0,'two steps')-.05,.6,()=>({P:P1,T:add3(zxz(tau),[1,.8,0]),fov:10})],
  [tC1()-.05,.95,()=>({P:P1,T:[-3,1.4,-1.8],fov:17})],
  [CUE(0,'One-one')-.1,1.6,()=>({P:P1,T:[-.2,1.3,-1.6],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=tC1()+IN_NET;
  const ready=sm(CUE(0,'thirty yards'),CUE(0,'thirty yards')+.8,t);
  stadium(s,c,t,[0,1,3],{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,minBall:15,lines:true,prevT:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from behind Zico: up, over, curl, dip
const tau2=(t:number)=>key(t,[[0,-1.1],[CUE(1,'rises up'),.03],[CUE(1,'over the wall'),T_WALL],[CUE(1,'curls and dips'),tauAtD(19)],[CUE(1,'top corner'),FLY],[CUE(1,'Alan Rough'),IN_NET+.25],[SECS(1),IN_NET+1.6]],linear);
const P2:V3=[-49,8.5,-.6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(-1.1,.3,tau,easeInOutSine);return{P:mix3([-44,4.2,-1.6],P2,u),T:mix3([-26,.8,-1],[-13,1.4,-1.8],u),fov:lerp(26,24,u)};}],
  [CUE(1,'over the wall')-.3,.9,()=>({P:P2,T:mix3([-10,1.8,-2],b,.35),fov:21})],
  [CUE(1,'curls and dips')-.2,.9,()=>({P:P2,T:[-3,1.8,-2.4],fov:13})],
  [CUE(1,'Alan Rough')-.3,1.2,()=>({P:[-47,7.5,-.8],T:[0,1.3,-.9],fov:9})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.6),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · the lesson: shirts as targets, aim over the wall, the curl brings it down
/** τ: frozen before the kick while the shirts appear; the strike on "Your turn"; the flight across "aim…" → "bring the ball down" */
const tau3=(t:number)=>key(t,[[0,-1.2],[CUE(2,'Your turn')-.3,-1.2],[CUE(2,'Your turn')+.85,0],[CUE(2,'aim over')+.1,.03],[CUE(2,'let the curl'),T_WALL+.05],[CUE(2,'bring the ball'),tauAtD(22)],[SECS(2)-.6,IN_NET+.3],[SECS(2),IN_NET+.6]],linear);
function cam3v(t:number):Cam{
 const b=ballAt(Math.min(tau3(t),FLY));
 return plan(t,[
  [0,0,()=>({P:[-7.5,1.9,4.2],T:[0,1.7,-1.2],fov:34})],
  [CUE(2,'targets')+.3,.6,()=>({P:[-6.5,2,3],T:[0,2,-2.4],fov:26})],
  [CUE(2,'Your turn')-.2,.9,()=>({P:add3(B0,[1.6,.7,-3.2]),T:add3(B0,[-.6,.45,.2]),fov:36})],
  [CUE(2,'aim over')-.1,1.1,()=>({P:[-50,8,-12],T:[-14,1.8,-1.5],fov:26})],
  [CUE(2,'bring the ball')-.2,1.1,()=>({P:[-46,6.2,-.8],T:[-5,2.1,-2.3],fov:13})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a training shirt hung in a top corner (Zico's daily target): a paper T-shape just under the bar, Brazil yellow with a red target ring */
function shirt(s:Sheet,c:Cam,z:number,u:number,ring:number){
 if(u<=.01)return;const sgn=z<0?1:-1,x=.05,top=2.36,h=.62*u,w=.34;
 const P=(dz:number,dy:number):V3=>[x,top-dy,z+sgn*dz];
 const q=polyP(c,[P(0,0),P(w*2.2,0),P(w*2.2,.16),P(w*1.75,.22),P(w*1.75,h),P(w*.45,h),P(w*.45,.22),P(0,.16)]);if(q.length<3)return;
 const sp=polyPath(q,true);s.knockout(sp);s.fill(Y,sp,.9);s.stroke(K,sp,2.4,.9);
 if(ring>.02){const m=P(w*1.1,h*.45),g=pr(c,m);if(g){const r=kAt(c,m)*.55*(.7+.3*ring),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([g[0]+Math.cos(a)*r,g[1]+Math.sin(a)*r]);}
  const rr=ribbon(pts,Math.max(5,r*.12),{close:true,seed:31,taper:0,wobble:1});s.knockout(rr,.9*ring);s.fill(R,rr,.95*ring);}}
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tSh=CUE(2,'shirts hung'),tTg=CUE(2,'targets'),tY=CUE(2,'Your turn'),tA=CUE(2,'aim over'),tC=CUE(2,'let the curl'),tD=CUE(2,'bring the ball');
  stadium(s,c,t,[0,1,2]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · the shirts in both top corners, then target rings
  const shU=sm(tSh-.2,tSh+.5,t,easeOutBack),tg=sm(tTg-.1,tTg+.4,t,easeOutBack)*(1-sm(tY,tY+.5,t));
  shirt(s,c,-3.66,shU,tg);shirt(s,c,3.66,shU*sm(tSh+.1,tSh+.6,t,easeOutBack),tg);
  // 2 · the aim line: straight, dashed, up over the wall (where you AIM) — and the real path, curling back down under it
  const am=sm(tA-.15,tA+.6,t)*(1-sm(tD,tD+.5,t));
  if(am>.02){const f9=flight(WALL_D),A=(d:number):V3=>{const k=d/WALL_D;return[B0[0]+d,.11+(f9[1]+.2-.11)*k,B0[2]+(f9[2]-B0[2])*k];};
   const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(A(.6+i/8*(WALL_D+1.2-.6)*am));arrow3(s,c,pts,Math.max(8,kAt(c,A(WALL_D))*.12),R,.95);}
  const pv=sm(tA-.2,tA+.2,t);
  if(tau>.02&&pv>.02){const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(10,kAt(c,[-14,2,-1.5])*.16);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*pv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*pv);}}
  // 3 · Zico, the wall, Rough and the ball
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
  // 4 · the strike: a ring round ball and boot, and the inside of the right boot lighting up at contact
  const ring=sm(tY-.1,tY+.4,t,easeOutBack)*(1-sm(tA-.3,tA+.2,t));
  if(ring>.02){const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[B0[0]-.2+Math.cos(a)*.95,0,B0[2]-.15+Math.sin(a)*.75]);if(p)pts.push(p);}
   if(pts.length>30){const rr=ribbon(pts,Math.max(6,kAt(c,B0)*.07),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
  const hit=sm(tY+.55,tY+.8,t,easeOutBack)*(1-sm(tY+1.1,tY+1.5,t));
  if(hit>.02){const p=pr(c,[B0[0]-DIR[0]*.1,.12,B0[2]-DIR[1]*.1]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,B0)*.35)*hit,{n:9,seed:61,width:Math.max(6,kAt(c,B0)*.04)});}
  // 5 · the curl: a blue arrow bending the path left after the wall
  const cu=sm(tC-.1,tC+.5,t,easeOutBack)*(1-sm(SECS(2)-.9,SECS(2)-.5,t));
  if(cu>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const d=13+i/8*11*cu;const f=flight(d);pts.push([f[0],f[1]+.5,f[2]-.15]);}arrow3(s,c,pts,Math.max(9,kAt(c,flight(16))*.12),B,.95);}
  // 6 · … and brings the ball DOWN into the top corner: a red arrow dropping onto the corner
  const dn=sm(tD-.1,tD+.45,t,easeOutBack)*(1-sm(SECS(2)-.7,SECS(2)-.4,t));
  if(dn>.02){const e:V3=[-.6,2.55,-3.2];arrow3(s,c,[add3(e,[-2.6,1.6*dn+.3,.1]),add3(e,[-1.5,1.1*dn+.25,0]),add3(e,[-.5,.2+.4*(1-dn),0])],Math.max(8,kAt(c,e)*.1),R,.95);}
 },
 still:9,
};

const film:RisoStory={
 id:'zico-free-kick-signature',format:'11v11',title:"Zico's curling free kick",
 theme:'Free kicks: aim over the wall and let the curl bring the ball down into the top corner',
 ageNote:'Signature move: Brazil 4–1 Scotland, 1982 World Cup, Estadio Benito Villamarín, Seville, 18 June 1982. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little free kick — a yellow arc that rises over a tiny wall and curls down, a Tango ball on its tip. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),dir=hash(seed,2)<.5?1:-1,r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+dir*(60*k-150*k*k),y-300*k+170*k*k]);}
  const wall=new Path2D();for(let i=0;i<3;i++)wall.addPath(polyPath([[x+dir*(-20+i*18)-7,y-40],[x+dir*(-20+i*18)+7,y-40],[x+dir*(-20+i*18)+7,y-8],[x+dir*(-20+i*18)-7,y-8]],true));
  s.fill(K,wall,.8*fade);
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  tango(s,e[0],e[1],30,age*14+r()*TAU);
 },
};
export default film;
