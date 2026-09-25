/** Stoichkov's signature: the left-foot rocket. Bulgaria 2–1 Germany, 1994 World Cup quarter-final, Giants Stadium, East Rutherford (New
 * York/New Jersey), 10 July 1994. The 75th-minute free kick that made it 1–1 against the world champions.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * lib/town/iconicPlays.json lists Stoichkov as kind "signature" ("the left-foot rocket", params: left side, edge of the box, left foot; lesson:
 * practise shooting on your strong foot until it's powerful and accurate). WHY THIS MOMENT: it is his best-known goal on the biggest stage
 * (the goal that started the comeback that knocked out the holders, in the tournament where he won the Golden Boot), and it is a pure
 * left-foot strike from his favourite spot — he told La Repubblica two days later: "I've scored lots like that, that's my position. I was
 * angry because I'd missed one a little earlier." A 1:1 reconstruction from written accounts (we cannot watch the footage), rendered as riso.
 *
 * SOURCES (read Sept 2026 with curl; cached in scratchpad/films/src-cache):
 *  - Wikipedia, "1994 FIFA World Cup knockout stage" (raw wikitext: date, 12:00 EDT kick-off, Giants Stadium, 72,000, referee José Torres
 *    Cadena (Colombia), goals Matthäus 47' pen, Stoichkov 75', Letchkov 78', both line-ups and numbers, both kit templates)
 *    https://en.wikipedia.org/wiki/1994_FIFA_World_Cup_knockout_stage  (file wiki-1994-wc-knockout.txt)
 *  - Wikipedia, "Hristo Stoichkov" (raw wikitext: a left-footed forward, "renowned for his prowess at taking free kicks", joint Golden Boot
 *    with six goals, led Bulgaria past the defending champions 2–1) https://en.wikipedia.org/wiki/Hristo_Stoichkov
 *  - de.wikipedia, "Fußball-Weltmeisterschaft 1994/Finalrunde" (the same result, scorers, minutes, cards and substitutions)
 *  - Wikipedia search result text for "Bulgaria national football team": "the Bulgarians, however, managed to turn the game over with a
 *    swerving free kick by Hristo Stoichkov and a flying header" (search snippet only; wiki-search-stoichkov-fk2.json)
 *  - La Repubblica, Fulvio Bianchi, "Stoichkov, l'adorabile spaccone" (12 July 1994, via web.archive.org): the free kick "that sent Germany
 *    home"; Stoichkov: "Ne ho segnate tante così, quella è la mia posizione. Ero arrabbiato perché ne avevo sbagliata una poco prima."; he
 *    asked to come off five minutes from the end so Yordanov could say "I was there".
 *    http://ricerca.repubblica.it/repubblica/archivio/repubblica/1994/07/12/stoichkov-adorabile-spaccone.html
 *  - FIFA.com archived match page (web.archive.org, 2017): no narrative, venue/teams only.
 * CONFIRMED by those pages: 10 July 1994, 12:00 EDT, Giants Stadium, 72,000, referee José Torres Cadena; Germany 1–0 up (Matthäus pen 47');
 *  Stoichkov's free kick made it 1–1 (75'); Letchkov's header made it 2–1 (78'), three minutes later; a SWERVING free kick; Stoichkov is
 *  left-footed; he called it his position and had missed one shortly before. Numbers: Stoichkov 8, Illgner 1 (Germany GK), Mihaylov 1
 *  (Bulgaria GK, captain), Letchkov 9, Kostadinov 7, Sirakov 10, Balakov 20; Germany Matthäus 10, Klinsmann 18, Völler 13, Kohler 4,
 *  Helmer 5, Buchwald 6, Möller 7. Kits (Wikipedia kit templates for this match): Bulgaria red shirts, white shorts, red socks; Germany white
 *  shirts, black shorts, white socks.
 * INFERRED / ILLUSTRATIVE: every position in metres (ball 23 m out, 2 m left of centre, i.e. just outside the box on his left side, matching
 *  the iconicPlays params "left side, edge"), the foul that won it, the wall (four men, which Germans, their numbers), WHICH corner (drawn:
 *  high in the far corner to Stoichkov's right, Illgner's left — not narrated), the ball's exact height, curve and speed, the length of his
 *  run-up (not narrated), where Illgner stood and his keeper jersey (drawn blue, inferred), the other players' places, the referee's black
 *  kit, the ball (an Adidas Questra, drawn in the generic white-with-triads style), the stadium's look (the bowl, rim lights, crowd colours),
 *  the midday light, the camera positions, the slow-motion speed, the celebration, and the lesson's ghost balls and the "missed one" arc
 *  (they illustrate his quote; the earlier miss's flight is unknown).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (establishing wide → the scoreline beat → close
 * on Stoichkov → his run-up → panning with the ball to the goal → the net); ch2 = the slow-motion replay from BEHIND him, high, so the swerve
 * is seen: out left, up over the wall, bending back right and down into the net (a riso replay trail), then the celebration; ch3 = the lesson:
 * "his spot" (ghost balls in the corner, the one he missed over the bar), a close low view of the left-foot strike, then a view from behind
 * where a power arrow rides the rocket and a target ring waits in the corner.
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
 * public/plays/narration/stoichkov-signature/timing.json exists, replace VOICE below with
 *   import timingJson from '../../../public/plays/narration/stoichkov-signature/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 * (every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:"New York, 1994: Bulgaria against Germany, World Cup quarter-final. Germany lead one-nil. Free kick, in Hristo Stoichkov's favourite spot. Left foot... It's in! One-one!",tail:2.2,
  cues:['New York','Bulgaria against Germany','quarter-final','Germany lead','Free kick','favourite spot','Left foot',"It's in",'One-one']},
 {label:'Watch it again',text:'Watch it again, from behind. One whip of his left foot, and the ball swerves up over the wall and down into the net. Three minutes later, Bulgaria scored again and won!',tail:1.4,
  cues:['Watch it again','from behind','One whip','swerves','over the wall','into the net','Three minutes later','won']},
 {label:'The secret',text:"Stoichkov had scored lots from there, and he'd just missed one, so he tried again. Your turn: practise on your strong foot, until it's powerful and accurate.",tail:1.6,
  cues:['Stoichkov had scored','just missed','tried again','Your turn','strong foot','powerful','accurate']},
];
import timingJson from '../../../public/plays/narration/stoichkov-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('stoichkov: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('stoichkov: no cue '+w);return c.at;};
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
/** Pitch: the goal Germany defends is x = 0 (Bulgaria attack +x), goal centre z = 0, +z = Stoichkov's right (the main-stand side). */
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

// ---------------------------------------------------------------- Giants Stadium (illustrative): midday sky, the enclosed bowl, crowd, rim lights
/** stand planes (a along, b up the rake 0..1): 0 far side (z<0), 1 behind the goal, 2 near side (z>0), 3 the other end. Giants Stadium was a
 * closed two-tier bowl with its lights on the rim, not on pylons. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+26*b,-41-32*b],
 (a,b)=>[8+32*b,1.4+24*b,lerp(-54,54,a)],
 (a,b)=>[lerp(14,-118,a),1.4+26*b,41+32*b],
 (a,b)=>[-113-32*b,1.4+24*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,70,96,70],STAND_ROWS=13;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // noon in July, New Jersey (kick-off 12:00): a bright pale-blue screen, a thin summer haze near the horizon
 s.field(B,.18,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.18);
 const planes=new Path2D(),walk=new Path2D(),rim=new Path2D(),lamp=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));for(const b of[.46,1])seg3(c,S(0,b),S(1,b),.9,walk);
  // the upper-deck rim with its light banks
  const top=polyP(c,[S(0,1),S(1,1),add3(S(1,1),[0,2.4,0]),add3(S(0,1),[0,2.4,0])]);if(top.length>2)rim.addPath(polyPath(top,true));
  for(let k=1;k<8;k++){const P=add3(S(k/8,1),[0,2.4,0]),a=S(k/8-.018,1),b=S(k/8+.018,1),q2=polyP(c,[[a[0],P[1],a[2]],[b[0],P[1],b[2]],[b[0],P[1]+2.6,b[2]],[a[0],P[1]+2.6,a[2]]]);if(q2.length>2)lamp.addPath(polyPath(q2,true));}}
 s.knockout(planes);s.tone(K,planes,.4);s.tone(B,planes,.28);s.knockout(walk,.85);s.fill(K,rim,.85);
 // the crowd: seeded dots — paper (white shirts, both teams), Bulgaria red, German black-red-gold, the US summer crowd
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.46)<.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.34)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.8?1:h<.9?3:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.6);s.fill(R,inks[1],.92);s.fill(K,inks[3],.85);s.fill(Y,inks[2],.9);
 s.knockout(lamp);s.fill(Y,lamp,.55);s.stroke(K,lamp,1.8,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.75);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // advertising boards: paper with red and blue panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>{const q=polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]);if(q.length>2)bd.addPath(polyPath(q,true));};
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2,q=polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4,q=polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(B,pn,.9);s.fill(R,pr2,.9);s.stroke(K,bd,1.6,.7);
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
/** the goal at x = 0: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out high in the corner the ball hits (z +3, y 1.9) */
const HIT_Z=3.0;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1.9)=>X+2+bulge*.8*Math.exp(-Math.pow((z-HIT_Z)/1.5,2))*(.35+.65*y/1.9);
 const zs=[z0,-2.2,-.8,.6,2,HIT_Z,z1];
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
const B0:V3=[-23,.11,-2];// "left side, edge of the box": 23 m out, 2 m left of centre (inferred)
const DXG=-B0[0],WALL_D=9.15;
/** the flight as a function of distance d toward the goal: up over the wall (2.75 m at 9.15 m), peak ≈ 3.06 m, dipping to 2.1 m at the
 * line; sideways: out a touch to the left, then the left-foot swerve bends it right into the far corner (z +3.1). */
const HA=.454364,HB=-.0195326,HC=.000153891,SL=.05,CURL=.011815;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d+HB*d*d+HC*d*d*d,B0[2]-SL*d+CURL*d*d];
const FLY=.98,IN_NET=1.08;// 23 m in about a second: a rocket (≈ 85 km/h average), slowing
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.2-.2*u);};
const tauAtD=(d:number)=>{const k=clamp(d/DXG);return FLY*(1.2-Math.sqrt(1.44-.8*k))/.4;};
const LINE_PT=flight(DXG),NET_HIT:V3=[1.7,1.7,3.05],REST:V3=[1.2,.11,2.7];
const T_WALL=tauAtD(WALL_D);
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(LINE_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:-TAU*10*Math.min(tau,IN_NET)-TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits of 10 July 1994 (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.45],[R,.26]];
/** Bulgaria: red shirts, white shorts, red socks */
const bulgaria=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:'paper',socks:R,boots:K,skin:SKIN_M,hair:K,line:K,numberInk:'paper',hairStyle:'short',...o});
/** Germany: white shirts, black shorts, white socks */
const germany=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[K,.9],shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.5],line:K,numberInk:K,hairStyle:'short',...o});
const STOICH_B={height:1.78,bulk:1,thighs:1.12};
const STOICH_ST=bulgaria({number:8,hairStyle:'short',hair:K,build:STOICH_B,seed:8});
const ILLGNER_ST:AthleteStyle={shirt:[B,.85],trim:'paper',shorts:K,socks:[B,.85],boots:K,skin:SKIN_L,hair:[K,.8],line:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.9,bulk:1.02},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_M,hair:K,line:K,hairStyle:'short',build:{height:1.76},seed:30};

// ---------------------------------------------------------------- Stoichkov: set, a short run from the ball's right, the LEFT-foot whip
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,-.42/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];// from the ball's right, angled
const YAW_S=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.05,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=RUN_END-.8,RUN_L=2.4,STRIKE_L=1.05;// a few quick strides, then the plant on the right foot
/** where his pelvis stands at contact so his LEFT boot meets the back-right of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),STOICH_B,{x:0,z:0,yaw:YAW_S}),toe:[number,number]=[B0[0]-DIR[0]*.12+RIGHT[0]*.04,B0[2]-DIR[1]*.12+RIGHT[1]*.04];return[toe[0]-sk.lToe[0],toe[1]-sk.lToe[2]];})();
const S_SET=posed({lHipF:-6,rHipF:4,lKnee:14,rKnee:10,lAnk:6,rAnk:2,lean:8,neckP:16,lShA:14,rShA:12,lShF:2,rShF:-4,lElb:20,rElb:22,twist:-6});
const S_READY=posed({lHipF:-16,rHipF:16,lKnee:26,rKnee:22,lAnk:12,rAnk:10,lean:16,pitch:3,neckP:22,lShA:20,rShA:24,lShF:-10,rShF:8,lElb:30,rElb:34,twist:-4});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** Stoichkov's pose. ready 0..1 = eyes on the ball before the run; it = idle clock for breathing */
function stoichPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.3);const p=blendPose(S_SET,S_READY,ready);p.lean+=.03*br;p.neckP+=.03*br;return p;}
 // run phase ends near .95 (right foot down = the plant) — runCycle phase 0 = right foot down
 if(tau<RUN_END){const u=runU(tau);return blendPose(S_READY,runCycle(-.5+u*1.45,{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(.95+(tau-RUN_END)*1.6,{speed:.6});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'l',power:1}),sm(RUN_END,RUN_END+.12,tau));
 // the whip: body over the ball, the left leg snapping through and high, the right arm flung out for balance
 const whip=sm(-.18,0,tau)*(1-sm(.3,.7,tau));p.lean+=6*D2R*whip;p.lHipF+=8*D2R*whip;p.rShA+=26*D2R*whip;p.twist-=8*D2R*whip;
 if(tau>1.4)p=blendPose(p,celebrate((tau-1.4)/1.1,{kind:'run'}),sm(1.4,1.7,tau));
 return p;
}
function stoichPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*runU(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.7*(1-Math.pow(1-clamp(tau/.6),2));
 // after the goal he wheels away toward the main-stand corner
 const run=tau>1.4?Math.min(6,(tau-1.4)*3):0,cy=yawTo(0,0,.3,1);
 return{x:PC[0]+DIR[0]*g+run*.3,z:PC[1]+DIR[1]*g+run*.95,yaw:lerpAng(YAW_S,cy,sm(1.3,1.7,tau))};
}

// ---------------------------------------------------------------- everyone else (positions illustrative)
type Role='wall'|'keeper'|'def'|'att'|'ref';
type Actor={role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const WALL_X=B0[0]+WALL_D;
const ACTORS:Actor[]=[
 {role:'wall',st:germany({number:6,hair:[K,.7],build:{height:1.88},seed:6}),x:WALL_X,z:-2.75,phase:.1},
 {role:'wall',st:germany({number:4,build:{height:1.86,bulk:1.05},seed:4}),x:WALL_X+.05,z:-2.2,phase:.6},
 {role:'wall',st:germany({number:10,hair:[K,.7],build:{height:1.74},seed:10}),x:WALL_X,z:-1.65,phase:.3},
 {role:'wall',st:germany({number:5,hair:[K,.6],build:{height:1.9},seed:5}),x:WALL_X+.05,z:-1.1,phase:.8},
 {role:'keeper',st:ILLGNER_ST,x:-.5,z:.2,phase:0},
 {role:'def',st:germany({number:14,hair:[K,.6],build:{height:1.84},seed:14}),x:-10.5,z:4.2,phase:.4},
 {role:'def',st:germany({number:18,build:{height:1.87},seed:18}),x:-11,z:-5.6,phase:.9},
 {role:'def',st:germany({number:3,hair:[K,.6],build:{height:1.76},seed:3}),x:-12.2,z:1.2,phase:.5},
 {role:'att',st:bulgaria({number:9,hairStyle:'bald',skin:SKIN_L,build:{height:1.8},seed:9}),x:-12.6,z:.4,phase:.7},
 {role:'att',st:bulgaria({number:7,build:{height:1.8},seed:7}),x:-11.6,z:5.1,phase:.15},
 {role:'att',st:bulgaria({number:20,hairStyle:'curly',build:{height:1.76},seed:20}),x:-17.2,z:-6.4,phase:.25},
 {role:'ref',st:REF_ST,x:-19.5,z:4.8,phase:.35},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.42,neckP:-16});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
/** Illgner: set; the ball swerves away to his left faster than he can move — a late half-step and a turn of the head; then he looks back at the net */
const GK_SLUMP=posed({lHipF:4,rHipF:4,lKnee:8,rKnee:8,lean:18,neckP:34,lShF:-6,rShF:-6,lShA:8,rShA:8,lElb:12,rElb:12});
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),toGoal=yawTo(a.x,a.z,0,2),watch=sm(.05,.7,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'wall':{let p=blendPose(WALL_P,stand(),.25+.12*br);const j=tau<-.1?0:Math.sin(Math.PI*clamp((tau+.1)/.62));p=blendPose(p,WALL_J,j);
   p.neckY=(55*sm(T_WALL,T_WALL+.3,tau)*(1-sm(1.1,1.6,tau)))*D2R;
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(Math.PI,Math.PI+2.1,sm(.45,1.3,tau,easeInOutSine))}};}
  case 'keeper':{let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));p.neckY=(58*sm(.35,.95,tau))*D2R;p.lean-=6*D2R*sm(.5,.9,tau);
   if(tau>1.5)p=blendPose(p,GK_SLUMP,sm(1.5,2.2,tau));
   return{pose:p,place:{x:a.x,z:a.z+.35*sm(.55,.95,tau),yaw:yawTo(a.x,a.z,B0[0],B0[2])}};}
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

// ---------------------------------------------------------------- the 1994 ball (Adidas Questra; drawn in the generic white-with-triads style)
function questra(s:Sheet,x:number,y:number,r:number,rot:number){
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
 questra(s,g[0],g[1],r,spinAt(tau));
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[];
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 {const pl=stoichPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=stoichPose(tp,e.ready,e.it),prev={pose:stoichPose(tpPrev,e.ready,e.it-1/12),place:stoichPlace(tpPrev)};
  drawPlayer(s,pose,c,STOICH_ST,pl,prev,!!e.smear&&tp>RUN_END+.2&&tp<.4);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,a.st,cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const sxz=(tau:number):V3=>{const p=stoichPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time: Stoichkov waits over the ball; his run starts so the left foot strikes just after "Left foot" and the ball is in
 * the net on "It's in", then real time */
const tC1=()=>Math.max(CUE(0,'Left foot')+.45,CUE(0,"It's in")+.1-IN_NET);
const tau1=(t:number)=>{const c=tC1(),a=c+T_RUN0;return t<a?T_RUN0:t<c?lerp(T_RUN0,0,(t-a)/(c-a)):t-c;};
const P1:V3=[-28,17,54];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-18,0,-1],fov:34})],
  [CUE(0,'Germany lead')-.2,.9,()=>({P:P1,T:[-2,1,0],fov:13})],
  [CUE(0,'Free kick')-.1,.9,()=>({P:P1,T:[-15,.4,-1.6],fov:24})],
  [CUE(0,'favourite spot')-.1,.8,()=>({P:P1,T:add3(sxz(tau),[.9,.9,0]),fov:7})],
  [CUE(0,'Left foot')-.5,.6,()=>({P:P1,T:add3(sxz(Math.min(tau,0)),[1.4,.8,0]),fov:11})],
  [tC1()-.05,.8,()=>({P:P1,T:[-3,1.4,1.6],fov:17})],
  [CUE(0,'One-one')-.1,1.6,()=>({P:P1,T:[-.2,1.3,1.8],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=tC1()+IN_NET;
  const ready=sm(CUE(0,'Free kick'),CUE(0,'Free kick')+.8,t);
  stadium(s,c,t,[0,1,3],{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,minBall:15,lines:true,prevT:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from behind: out, up over the wall, swerve, down
const tau2=(t:number)=>key(t,[[0,-1.3],[CUE(1,'One whip')+.3,.02],[CUE(1,'swerves'),tauAtD(4)],[CUE(1,'over the wall'),T_WALL],[CUE(1,'into the net'),IN_NET-.05],[CUE(1,'Three minutes'),IN_NET+.9],[SECS(1),IN_NET+2.6]],linear);
const P2:V3=[-46,8.5,-3.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(-1.3,.2,tau,easeInOutSine);return{P:mix3([-40,4.2,-3.6],P2,u),T:mix3([-22,.8,-2],[-12,1.4,-.5],u),fov:lerp(26,24,u)};}],
  [CUE(1,'swerves')-.2,.9,()=>({P:P2,T:mix3([-10,1.8,-1],b,.35),fov:21})],
  [CUE(1,'over the wall')+.2,.9,()=>({P:P2,T:[-3,1.8,2.2],fov:13})],
  [CUE(1,'Three minutes')-.3,1.3,()=>({P:[-40,9,-10],T:add3(sxz(tau),[0,1,0]),fov:14})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),w=CUE(1,'won');
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:Math.max(sm(IN_NET+.1,IN_NET+.3,tau)*(1-sm(IN_NET+.8,IN_NET+1.1,tau)),sm(w-.1,w+.3,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.6),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w2=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w2*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(R,ribbon(pts,w2,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · the lesson: his spot, try again, strong foot → powerful and accurate
/** τ: frozen before the run while the ghost balls and the miss play; the run starts on "tried again", the strike on "strong foot", the
 * flight across "powerful" → "accurate" */
const tau3=(t:number)=>key(t,[[0,T_RUN0],[CUE(2,'tried again'),T_RUN0],[CUE(2,'strong foot')+.5,0],[CUE(2,'powerful')+.1,.03],[CUE(2,'accurate'),tauAtD(19)],[SECS(2)-.6,IN_NET+.3],[SECS(2),IN_NET+.6]],linear);
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-9,1.9,-.8],T:[0,1.8,2.1],fov:36})],
  [CUE(2,'just missed')-.2,.9,()=>({P:[-31,5,-10],T:[-7,2,.6],fov:36})],
  [CUE(2,'tried again')-.2,.9,()=>({P:add3(B0,[1.2,.8,-3.6]),T:add3(B0,[-1.4,.6,.3]),fov:44})],
  [CUE(2,'powerful')-.2,1,()=>({P:[-46,8,9],T:[-12,1.8,.2],fov:26})],
  [CUE(2,'accurate')-.3,1.1,()=>({P:[-42,6.2,-2.5],T:[-4,2,2.2],fov:13})],
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
/** a ring in the goal plane (x just inside the line) around (y,z) */
function goalRing(s:Sheet,c:Cam,y:number,z:number,rm:number,u:number,ink:string){
 if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[.05,y+Math.sin(a)*rm*u,z+Math.cos(a)*rm*u]);if(p)pts.push(p);}
 if(pts.length<24)return;const rr=ribbon(pts,Math.max(5,kAt(c,[0,y,z])*.07),{close:true,seed:31,taper:0,wobble:1});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);
}
/** "he'd scored lots from there": ghost balls popping into the far corner, one after another */
const GHOSTS:V3[]=[[.9,1.95,2.9],[1.1,1.55,3.2],[.8,2.15,2.4],[1.2,1.3,2.6]];
/** "he'd just missed one": an illustrative arc from the spot that clears the bar (the real miss's flight is unknown) */
const missAt=(u:number):V3=>{const d=DXG*u;return[B0[0]+d,.11+.5*d-.0172*d*d,B0[2]-.04*d+.0092*d*d];};
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tS=CUE(2,'Stoichkov had'),tM=CUE(2,'just missed'),tT=CUE(2,'tried again'),tY=CUE(2,'Your turn'),tF=CUE(2,'strong foot'),tP=CUE(2,'powerful'),tA=CUE(2,'accurate');
  stadium(s,c,t,[0,1,2]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · ghost balls in the corner — his spot, his goals
  const gh=1-sm(tT-.3,tT+.2,t);
  if(gh>.02)GHOSTS.forEach((P,i)=>{const u=sm(tS+.25+i*.3,tS+.55+i*.3,t,easeOutBack)*gh,g=pr(c,P);if(g&&u>.02){const r=Math.max(8,kAt(c,P)*.22*u);goalRing(s,c,P[1],P[2],.34,u,Y);questra(s,g[0],g[1],r,i*1.3);}});
  // 2 · the one he missed: a red arc that sails over the bar
  const mu=sm(tM,tM+1.1,t),mf=1-sm(tT-.2,tT+.3,t);
  if(mu>.02&&mf>.02){const pts:Pt[]=[];for(let i=0;i<=30;i++){const p=pr(c,missAt(.25+.95*i/30*mu));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(9,kAt(c,[-8,3,0])*.2);s.knockout(ribbon(pts,w*1.5,{taper:.5,pressure:.2,wobble:0}),.45*mf);s.fill(R,ribbon(pts,w,{taper:.5,pressure:.2,wobble:0}),.85*mf);
    const e=pts[pts.length-1];questra(s,e[0],e[1],Math.max(12,kAt(c,missAt(.25+.95*mu))*.2),mu*9);}}
  // 3 · the rocket: a yellow trail through the flight, and the power arrow riding it
  const pv=sm(tP-.25,tP+.15,t);
  if(tau>.02&&pv>.02){const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(10,kAt(c,[-12,2,-1])*.16);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*pv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*pv);}}
  const pw=sm(tP-.1,tP+.5,t,easeOutBack)*(1-sm(tA-.5,tA-.1,t));
  if(pw>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const f=flight(1+i/8*10*pw);pts.push([f[0],f[1]+.75,f[2]]);}arrow3(s,c,pts,Math.max(9,kAt(c,flight(8))*.13),R,.95);}
  // 4 · accurate: a target ring waits in the far corner, and closes on the ball as it arrives
  const ac=sm(tA-.2,tA+.4,t,easeOutBack);
  goalRing(s,c,1.95,3.0,.75*(1-.25*sm(tA+.4,tA+1.2,t))+.1,ac,R);
  // 5 · Stoichkov, the wall, Illgner and the ball
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
  // 6 · strong foot: a ring round ball and left boot, the boot lighting up at contact
  const ring=sm(tY-.1,tY+.4,t,easeOutBack)*(1-sm(tP-.4,tP,t));
  if(ring>.02){const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[B0[0]-.3+Math.cos(a)*1.05,0,B0[2]+.25+Math.sin(a)*.8]);if(p)pts.push(p);}
   if(pts.length>30){const rr=ribbon(pts,Math.max(6,kAt(c,B0)*.07),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
  const hit=sm(tF+.45,tF+.65,t,easeOutBack)*(1-sm(tF+1,tF+1.4,t));
  if(hit>.02){const p=pr(c,[B0[0]-DIR[0]*.1,.12,B0[2]-DIR[1]*.1]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,B0)*.35)*hit,{n:9,seed:61,width:Math.max(6,kAt(c,B0)*.04)});}
 },
 still:9,
};

const film:RisoStory={
 id:'stoichkov-signature',format:'11v11',title:"Stoichkov's left-foot rocket",
 theme:'Shooting: practise on your strong foot until your shot is powerful and accurate',
 ageNote:'Signature move: Bulgaria 2–1 Germany, 1994 World Cup quarter-final, Giants Stadium, East Rutherford, 10 July 1994. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little rocket — a red swerving streak with speed lines and a ball on its tip. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.55)/.25),dir=hash(seed,2)<.5?1:-1,r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+dir*(-40*k+190*k*k),y-240*k+120*k*k]);}
  if(pts.length>2)s.fill(R,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1],f=pts[pts.length-2];
  if(age>0&&age<.5)speedLines(s,K,e[0],e[1],Math.atan2(e[1]-f[1],e[0]-f[0]),{n:3,seed,len:80,spread:22,width:5,cov:.8*fade});
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  questra(s,e[0],e[1],30,age*14+r()*TAU);
 },
};
export default film;
