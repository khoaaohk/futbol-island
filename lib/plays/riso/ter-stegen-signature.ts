/** Iconic-play film · Marc-André ter Stegen, "Signature: passing out from the back" — one real, sourced moment: Getafe 0–2 Barcelona, La
 * Liga, Coliseum Alfonso Pérez, Getafe, Saturday 28 September 2019 (16:00 CEST kick-off, an afternoon match), the 41st-minute opening goal.
 *
 * WHY THIS MATCH: ter Stegen's signature (lib/town/iconicPlays.json, kind "signature", lesson "A keeper who can pass well is like an extra
 * player; stay calm and find a free teammate") is a trait, not one goal. This moment is the trait at its most literal and it is described
 * beat by beat in writing: the keeper rushed out of his area to stop a Getafe breakaway, controlled the ball with his chest (outside the
 * box, so no hands) and passed it the other way, long, for Luis Suárez, who lobbed the Getafe keeper first time. Wikipedia records it as
 * the first assist by a Barcelona goalkeeper in La Liga in the 21st century — a keeper acting as an extra outfield player.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Barcelona's goal line at X=0 and Getafe's at X=105, Z across, away
 * from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera (the Getafe long ball, ter Stegen races out,
 * chests it, the long pass, Suárez's lob, goal); 2 a TV slow-motion replay from a low camera in front of the keeper (the chest control, head
 * up, the strike); 3 a second replay from a raised camera behind the Getafe goal (the pass dropping for Suárez, one touch over the keeper,
 * in); 4 the lesson (the only chapter with teaching marks). No overlays inside the footage chapters. NEVER top-down.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, slowly, cached in scratchpad/films/src-cache/):
 *  - ESPN match report, "Ter Stegen assist helps Messi-less Barcelona win", gameId 550544 (espn-getafe-barca-2019.html/.txt): Getafe 0–2
 *    Barcelona, Suárez 41', Júnior Firpo 49', Lenglet sent off 82'; "Ter Stegen set up Suarez's opening goal in the 41st after leaving his area
 *    to stop a breakaway. He controlled the ball with his chest before sending it the other way to leave Suárez in a one-on-one situation
 *    against Getafe goalkeeper David Soria. The Uruguay striker calmly one-touched a lob shot over Soria"; Valverde: "He's incredible with his
 *    feet"; Messi and Dembélé absent.
 *  - ESPN commentary, same gameId (espn-getafe-barca-2019-commentary.html): "Goal! Getafe 0, Barcelona 1. Luis Suárez (Barcelona) right
 *    footed shot from outside the box to the centre of the goal. Assisted by Marc-André ter Stegen with a through ball."; kick-off
 *    2019-09-28T14:00Z; attendance 15,135; players named in the play-by-play (Piqué, Lenglet, Júnior Firpo, Sergi Roberto, Busquets, De Jong,
 *    Arthur, Griezmann, Carles Pérez for Barcelona; Ángel Rodríguez, Jaime Mata, Cucurella, Arambarri, Djené, Bruno González, Nyom, Jason,
 *    Damián Suárez for Getafe). The page's match data colours Getafe #0000ff (blue) and Barcelona #1d1e1f (near-black) — Barcelona's default
 *    team colour on ESPN is #990000, so the near-black is read as the kit worn that day.
 *  - Wikipedia, "Marc-André ter Stegen" (raw; wiki-ter-stegen.txt): "On 28 September 2019, Ter Stegen provided an assist to Luis Suárez for the
 *    first goal in a 2–0 away win over Getafe, becoming the first Barcelona goalkeeper to provide an assist in La Liga in the 21st century";
 *    style: "highly competent with the ball at his feet ... control and accurate distribution ... often functions as a sweeper-keeper".
 *  - Wikipedia (es), "Marc-André ter Stegen" (eswiki-ter-stegen.txt): the same assist, citing the ESPN and AS reports.
 * CONFIRMED: match, date, venue, afternoon kick-off, score and minute; ter Stegen left his area to stop a Getafe breakaway, controlled the
 *  ball with his chest, and passed it the other way ("a through ball"); Suárez one-on-one with Soria; Suárez's first-time lob with his RIGHT
 *  foot from OUTSIDE the box into the centre of the goal; first Barcelona keeper's La Liga assist this century; Barcelona in a near-black
 *  kit, Getafe in blue (ESPN match colours).
 * INFERRED (not in the pages read): every position, path and timing; who played the Getafe long ball and who was running through (both
 *  unnamed, unnumbered); the pass as a high lofted ball, and that Suárez met it on the half-volley after one bounce; ter Stegen's RIGHT
 *  foot (drawn, never narrated); that he took the ball down and struck it with no extra touch; Soria off his line and leaping back in vain;
 *  which end Barcelona attacked on screen; the kits in detail (Barcelona black with turquoise trim and numbers, the 2019–20 away strip;
 *  Getafe all blue with white numbers; ter Stegen in coral red, Soria in yellow — the keepers' colours are NOT sourced); numbers (ter Stegen
 *  1, Suárez 9 — their usual numbers; only names are narrated); the weather (drawn sunny); the Coliseum as drawn (one low ring of stands
 *  close to the pitch, a thin roof); hair and skin tones; camera placements.
 *
 * Narration text: public/plays/narration/ter-stegen-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.8 words/s, see prov()); EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Scenes read only their local time t; figures pose on twos. Every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,keeperTip,celebrate,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.8 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.8+(/[.!?…]$/.test(w)?.35:/[,;:]$/.test(w)?.15:0);}
 const nw=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`ter Stegen film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+1).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py ter-stegen-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/ter-stegen-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/ter-stegen-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The Coliseum','Getafe, 2019. A long ball flies over the top. Out rushes Barcelona keeper Marc-André ter Stegen! He chests it down and sends it back. Luis Suárez lifts it in. Goal!',
  ['Getafe','A long ball','Out rushes','keeper Marc-André','He chests it','sends it back','Luis Suárez lifts','Goal']),
 prov('The replay','Watch again. Outside his box, no hands allowed, so he uses his chest. Head up, he spots Suárez running, and strikes it long.',
  ['Watch again','Outside his box','uses his chest','Head up','spots Suárez','strikes it long']),
 prov('The assist','The pass drops into Suárez’s path. One touch, over the keeper, and in! A keeper’s assist!',
  ['The pass drops','One touch','over the keeper','and in','A keeper']),
 prov('The lesson','That’s ter Stegen. A keeper who passes well is like an extra player. Stay calm and find a free teammate.',
  ['ter Stegen','A keeper who passes','like an extra player','Stay calm','find a free teammate']),
],VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
/** a quad only when all of it is comfortably in front of the lens (the cameras sit inside the stands: near stand parts are culled) */
function addFar(p:Path2D,pts:V3[],c:Cam,minD:number){for(const v of pts)if(toCam(v,c)[2]<minD)return;addPoly(p,pts,c);}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
/** a 3D bar a→b as a ribbon, width wm metres (at least minW units) */
function bar3(p:Path2D,c:Cam,a:V3,b:V3,wm:number,minW=1.2){const pa=P3(a,c),pb=P3(b,c);if(pa[2]<=0||pb[2]<=0||toCam(a,c)[2]<4||toCam(b,c)[2]<4)return;p.addPath(ribbon([[pa[0],pa[1]],[pb[0],pb[1]]],Math.max(minW,wm*(pa[2]+pb[2])/2),{taper:0,pressure:0,wobble:.3}));}

// ---------------------------------------------------------------- the Coliseum Alfonso Pérez on a September afternoon: one low ring of stands close to the pitch
const SCX=52.5,SCZ=34,PE=.3,NS=44,SD=24;
/** a point on the stand ring: angle th round the pitch centre, d metres out from the inner edge (a squarish superellipse ~5 m outside the lines) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[SCX+(58+d)*Math.sign(c)*Math.abs(c)**PE,y,SCZ+(40+d)*Math.sign(s)*Math.abs(s)**PE];}
/** a lower, steep rake: climbing to ~19 m */
const RAKE=(b:number):[number,number]=>[1+(SD-1)*b,1.2+18*b];
type Bowl={seg:V3[][];roof:V3[][];tiers:[V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],tiers:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD-6,y1+2.2),rim(b,SD-6,y1+2.2),rim(b,SD+1,y1+3),rim(a,SD+1,y1+3)]);
  const[d,y]=RAKE(.5);o.tiers.push([rim(a,d,y),rim(b,d,y)]);
  for(let r=0;r<7;r++)for(let k=0;k<2;k++){const h=hash(i*977+r*31+k*7,29);if(h<.2)continue;const[dd,yy]=RAKE((r+.5)/7);// 15,135 in: empty patches
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,5)-.5)*.5)/2)/NS*TAU,dd,yy+.4),h});}}
 return o;})();
const GRASS:V3[]=Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0));
function stadium(s:Sheet,c:Cam){
 // a sunny afternoon sky (inferred): a pale printed blue
 s.field(B,.24,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg)addFar(bowl,q,c,10);
 for(const q of BOWL.roof)addFar(roof,q,c,10);
 s.knockout(bowl);s.tone(K,bowl,.28);s.tone(B,bowl,.3);
 // the crowd: Getafe blue, white shirts, red faces
 const inks=[new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(q.P,c)[2];if(d<14)continue;const p=P3(q.P,c);if(!onScreen(p))continue;const z=clamp(c.F*.6/d,2.4,14);
  inks[q.h<.6?0:q.h<.86?1:2].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);any++;}
 if(any){s.fill(B,inks[0],.9);s.knockout(inks[1],.85);s.fill(R,inks[2],.75);}
 const tf=new Path2D();for(const[a,b]of BOWL.tiers)bar3(tf,c,a,b,.8,1);s.knockout(tf,.6);
 s.knockout(roof);s.fill(K,roof,.7);s.tone(B,roof,.3);
 // the sunlit grass (yellow × blue), mowing stripes, paper lines, corner flags
 const grass=new Path2D();addPoly(grass,GRASS,c);s.knockout(grass);s.fill(Y,grass,.8);s.fill(B,grass,.48);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.14);
 // plain advertising boards (no brands)
 const bd=new Path2D(),board=(a:V3,b:V3)=>addFar(bd,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]],c,2);
 for(let k=0;k<10;k++){board([-3+k*11.1,0,-3.5],[-3+(k+1)*11.1,0,-3.5]);board([-3+k*11.1,0,71.5],[-3+(k+1)*11.1,0,71.5]);}
 for(let k=0;k<6;k++){board([-4,0,4+k*10],[-4,0,4+(k+1)*10]);board([109,0,4+k*10],[109,0,4+(k+1)*10]);}
 s.knockout(bd,.5);s.fill(B,bd,.8);s.tone(K,bd,.3);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir: white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps ter Stegen's and Suárez's RIGHT boots on their right. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: red + yellow screens (afternoon sun)
const LIGHT:InkFill[]=[[R,.22],[Y,.42]],MID:InkFill[]=[[R,.34],[Y,.5],[K,.08]],DARK:InkFill[]=[[R,.45],[Y,.45],[K,.3]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Barcelona 2019–20 away (near-black per ESPN's match colours; turquoise trim inferred) */
const barca=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,trim:[B,.9],shorts:K,socks:K,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.2],sleeves:'short',numberInk:B,scale:FIG,...o});
/** Getafe at home (blue per ESPN's match colours): all blue, white numbers */
const getafe=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:[B,.9],socks:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** ter Stegen: 1.87 m, number 1, light-brown/fair short hair; keeper colours inferred (coral red) */
const TS:AthleteStyle={shirt:R,trim:K,shorts:K,socks:R,boots:K,skin:LIGHT,hair:[Y,.9],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:K,scale:FIG,seed:1,build:{height:1.87,bulk:1}};
const SUAREZ:AthleteStyle=barca(MID,{number:9,seed:9,hair:K,build:{height:1.82,bulk:1.02}});
const SORIA:AthleteStyle={shirt:Y,trim:K,shorts:K,socks:Y,boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',numberInk:K,scale:FIG,seed:13,build:{height:1.9}};
const KICKER:AthleteStyle=getafe(LIGHT,{seed:41,hair:[K,.8],build:{height:1.8}});
const RUNNER:AthleteStyle=getafe(MID,{seed:42,hair:K,build:{height:1.8}});
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the chest control)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** the Getafe long ball over Barcelona's high line: struck (right foot) at LB0 at T_LB */
const LB0:[number,number]=[52,25],T_LB=-2.7,LB_DUR=.8,LB_START=T_LB-STRIKE_CONTACT*LB_DUR;
/** the chest control, just outside the D, T=0 */
const CH:[number,number]=[19.6,30.8],CH_H=nrm2(LB0[0]-CH[0],LB0[1]-CH[1]);
/** chest control (t 0..1, contact at .5): arms out for balance, chest pushed up to meet it, chin down watching, then cushion and settle */
function chestPose(u:number):Pose{return keyPoses(clamp(u),[
 [0,posed({lHipF:26,rHipF:-8,lKnee:34,rKnee:46,rAnk:20,lean:8,pitch:4,neckP:-18,lShA:34,rShA:34,lShF:20,rShF:-14,lElb:70,rElb:70})],
 [.3,posed({lHipF:16,rHipF:10,lKnee:30,rKnee:30,lean:-10,pitch:-2,neckP:10,lShA:56,rShA:56,lShF:14,rShF:14,lElb:40,rElb:40,squash:-.04})],
 [.5,posed({lHipF:22,rHipF:12,lKnee:36,rKnee:28,rAnk:8,lean:-24,pitch:-6,neckP:42,lShA:66,rShA:66,lShF:8,rShF:8,lElb:26,rElb:26,lHand:.6,rHand:.6,squash:.04})],
 [.75,posed({lHipF:20,rHipF:20,lKnee:34,rKnee:34,lean:10,pitch:2,neckP:46,lShA:44,rShA:44,lShF:10,rShF:10,lElb:40,rElb:40})],
 [1,posed({lHipF:16,rHipF:14,lKnee:24,rKnee:22,lean:12,pitch:3,neckP:40,lShA:24,rShA:24,lElb:36,rElb:36})]]);}
const CHEST_DUR=1,CHEST_START=-.5;
const TS_AT:[number,number]=(()=>{const sk=solve(chestPose(.5),TS.build,placeOf(0,0,CH_H),FIG),c=toMy(sk.chest);return[CH[0]-c[0]-CH_H[0]*.2,CH[1]-c[2]-CH_H[1]*.2];})();
const CH_Y:number=(()=>{const sk=solve(chestPose(.5),TS.build,placeOf(TS_AT[0],TS_AT[1],CH_H),FIG);return toMy(sk.chest)[1];})();
const CHB:V3=[CH[0],CH_Y,CH[1]];
/** the ball off his chest: drops in front of him (D1), a small bounce, settles at his feet (PB) */
const D1:[number,number]=add2(CH,CH_H,.55),PB:[number,number]=add2(CH,CH_H,1.35);
/** the long pass: right foot, lofted, the other way — lands at LAND, one bounce up to Suárez's boot at SR (outside the box) */
const LAND:[number,number]=[81,39.4],SR0:[number,number]=[84.6,38.9];
const T_P=1.9,P_DUR=.9,S_START=T_P-STRIKE_CONTACT*P_DUR,T_L=T_P+2.9,T_R=T_L+.45;
const S_H=nrm2(LAND[0]-PB[0],LAND[1]-PB[1]);
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),TS.build,placeOf(0,0,S_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[PB[0]-f[0]-S_H[0]*.12,PB[1]-f[2]-S_H[1]*.12];})();
/** Suárez's first-time lob: right foot, toward the centre of the goal */
const GOAL_C:[number,number]=[105,34.6],S2_DUR=.8,S2_START=T_R-STRIKE_CONTACT*S2_DUR,S2_H=nrm2(GOAL_C[0]-SR0[0],GOAL_C[1]-SR0[1]);
const SU_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),SUAREZ.build,placeOf(0,0,S2_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[SR0[0]-f[0]-S2_H[0]*.12,SR0[1]-f[2]-S2_H[1]*.12];})();
const SR_Y:number=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),SUAREZ.build,placeOf(SU_AT[0],SU_AT[1],S2_H),FIG);return Math.max(.14,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const SR:V3=[SR0[0],SR_Y,SR0[1]];
/** the lob crosses the goal line (under the bar, centre of the goal) at T_G, then into the net */
const LOB_T=1.9,T_G=T_R+LOB_T,LOB_H=4.4,GL:V3=[105,1.35,GOAL_C[1]];
/** the Getafe kicker strikes the long ball from LB0 */
const K_H=nrm2(CH[0]-LB0[0],CH[1]-LB0[1]);
const K_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.9}),KICKER.build,placeOf(0,0,K_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[LB0[0]-f[0]-K_H[0]*.12,LB0[1]-f[2]-K_H[1]*.12];})();
/** Soria: off his line, then the backward leap (right hand up) as the lob goes over */
const SO_TIP=1.1,SO_START=T_R+.33,SO_AT:[number,number]=[95.6,36.2];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TS_KEYS=[[-7,8,33.5],[-3.4,8.6,33.2],[-2.7,9.4,32.9],[-1.2,15.6,31.6],[CHEST_START,...TS_AT],[.45,...TS_AT],[S_START,...S_AT]];
const KICK_KEYS=[[-7,62,20],[-4.5,57.5,22.5],[LB_START-.3,K_AT[0]+1.2,K_AT[1]-.6],[LB_START,...K_AT],[T_LB+.7,...K_AT],[T_P,46,27],[T_R+3,52,30]];
/** the Getafe runner, through on the ball, beaten to it by the keeper */
const RUN_KEYS=[[-7,39,23.5],[-2.7,34,25],[-1.2,28,27.3],[0,23.6,28.8],[.8,22.3,29.6],[T_P,21.6,30.2],[T_P+1.5,22.5,31]];
const SU_KEYS=[[-7,49,45],[-2.7,53,44.8],[0,58.5,44.4],[T_P,61.8,43.8],[T_P+.8,66.5,42.6],[T_L-.4,80.4,40.2],[S2_START,...SU_AT],[S2_START+S2_DUR+.2,...add2(SU_AT,S2_H,.5)],[T_G+.3,SU_AT[0]+3,SU_AT[1]-.5],[T_G+3,SU_AT[0]+9,SU_AT[1]-9]];
const SO_KEYS=[[-7,100.5,34.5],[0,98,35],[T_P,94.5,35.8],[T_L-.3,95.3,36.1],[SO_START,...SO_AT]];
const TRACKS:Track[]=[
 {id:'kicker',style:KICKER,keys:KICK_KEYS},
 {id:'runner',style:RUNNER,keys:RUN_KEYS},
 {id:'suarez',style:SUAREZ,keys:SU_KEYS},
 // Barcelona (positions illustrative, no numbers printed): the high back line turning to chase, midfield, Griezmann
 {id:'b-rb',style:barca(MID,{seed:20}),keys:[[-7,36,9],[-2.7,35,10],[0,29,13],[T_P,31,12],[T_R+3,44,10]]},
 {id:'b-cb1',style:barca(LIGHT,{seed:3,build:{height:1.94}}),keys:[[-7,33,25],[-2.7,33,27],[0,26,27.5],[T_P,27,26],[T_R+3,38,27]]},
 {id:'b-cb2',style:barca(LIGHT,{seed:15}),keys:[[-7,34,41],[-2.7,33.5,40],[0,27.5,37],[T_P,28.5,38],[T_R+3,39,40]]},
 {id:'b-lb',style:barca(DARK,{seed:18}),keys:[[-7,37,58],[-2.7,36,57],[0,31,53],[T_P,33,54],[T_R+3,46,56]]},
 {id:'b-dm',style:barca(LIGHT,{seed:5}),keys:[[-7,46,33],[-2.7,44,31],[0,40,32],[T_P,41,32],[T_R+3,50,33]]},
 {id:'b-m1',style:barca(LIGHT,{seed:21}),keys:[[-7,54,20],[-2.7,52,21],[0,49,22],[T_P,51,22],[T_R+3,60,22]]},
 {id:'b-m2',style:barca(MID,{seed:8}),keys:[[-7,56,50],[-2.7,54,50],[0,51,49],[T_P,53,49],[T_R+3,62,47]]},
 {id:'b-fw',style:barca(LIGHT,{seed:7}),keys:[[-7,60,18],[-2.7,59,19],[0,60,20],[T_P,63,21],[T_R+3,76,26]]},
 // Getafe (positions illustrative): the second forward, midfield, the high back line chasing Suárez
 {id:'g-fw2',style:getafe(DARK,{seed:43}),keys:[[-7,42,42],[-2.7,37,41],[0,30,38],[T_P,28,37],[T_R+3,31,36]]},
 {id:'g-m1',style:getafe(LIGHT,{seed:44}),keys:[[-7,55,40],[-2.7,50,40],[0,44,40],[T_P,45,40],[T_R+3,56,38]]},
 {id:'g-m2',style:getafe(LIGHT,{seed:45,hair:[K,.6]}),keys:[[-7,52,54],[-2.7,47,55],[0,41,54],[T_P,42,54],[T_R+3,53,50]]},
 {id:'g-m3',style:getafe(MID,{seed:46}),keys:[[-7,50,12],[-2.7,46,12],[0,41,13],[T_P,42,14],[T_R+3,52,18]]},
 {id:'g-cb1',style:getafe(LIGHT,{seed:47}),keys:[[-7,64,40],[-2.7,61,40],[0,60,40.5],[T_P,62,40.2],[T_P+.6,63.5,40.4],[T_R,77.5,40.2],[T_R+3,90,37.5]]},
 {id:'g-cb2',style:getafe(DARK,{seed:48}),keys:[[-7,64,29],[-2.7,61,30],[0,60,31],[T_P,62.4,32],[T_P+.6,64,33.5],[T_R,77,36.6],[T_R+3,90,35]]},
 {id:'g-rb',style:getafe(MID,{seed:49}),keys:[[-7,66,52],[-2.7,63,52],[0,61,52],[T_P,63,51],[T_R,74,47],[T_R+3,84,44]]},
 {id:'g-lb',style:getafe(LIGHT,{seed:50}),keys:[[-7,66,15],[-2.7,63,16],[0,61,17],[T_P,63,18],[T_R,72,23],[T_R+3,82,27]]},
];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.2);for(let t=-7;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: the Getafe midfielder's dribble, his long ball over the top (a true parabola), ter Stegen's chest, the drop and
 * settle at his feet, his lofted pass the other way (≈10 m high), one bounce up to Suárez's right boot, the lob over Soria, into the net. */
function ballAt(T:number):V3{
 const lb:V3=[LB0[0],.11,LB0[1]],d1:V3=[D1[0],.11,D1[1]],pb:V3=[PB[0],.11,PB[1]],land:V3=[LAND[0],.11,LAND[1]];
 if(T<LB_START){const p=trackAt(KICK_KEYS,T),v=velAt(KICK_KEYS,T),s=Math.hypot(v[0],v[1])||1,w=.6+.4*Math.max(0,Math.sin(T*TAU/.7));return[p[0]+v[0]/s*w,.11,p[1]+v[1]/s*w];}
 if(T<T_LB){const p=trackAt(KICK_KEYS,LB_START-.05),v=velAt(KICK_KEYS,LB_START-.2),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,lb,sm(LB_START,T_LB,T,easeInOutSine));}
 if(T<0)return lerp3(lb,CHB,(T-T_LB)/-T_LB,8.6);
 if(T<.42){const u=T/.42;return[lerp(CHB[0],d1[0],u),lerp(CHB[1],.11,u*u),lerp(CHB[2],d1[2],u)];}
 if(T<1.05)return lerp3(d1,pb,easeOut(clamp((T-.42)/.63)),.22*(1-clamp((T-.42)/.4)));
 if(T<T_P)return pb;
 if(T<T_L)return lerp3(pb,land,(T-T_P)/(T_L-T_P),10.3);
 if(T<T_R){const u=(T-T_L)/(T_R-T_L);return[lerp(land[0],SR[0],u),lerp(.11,SR[1],u)+1.1*4*u*(1-u)*(1-.3*u),lerp(land[2],SR[2],u)];}
 if(T<T_G)return lerp3(SR,GL,(T-T_R)/LOB_T,LOB_H);
 // into the roof of the net, then down to the grass inside it
 const u=clamp((T-T_G)/.7),a:V3=[106.7,.11,GL[2]+.2];return[lerp(GL[0],a[0],easeOut(u)),lerp(GL[1],.11,u*u),lerp(GL[2],a[2],u)];
}

// ---------------------------------------------------------------- the players at play time T
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward a point (x,y,z). Right-handed yaw: + turns left. */
function lookAt(st:St,b:V3,w=1):Pose{const x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
const lookAtBall=(st:St,T:number,w=1)=>lookAt(st,ballAt(T),w);
/** his head comes up off the ball (T_UP) and turns toward Suárez before the strike */
const T_UP=1.02;
const upAt=(T:number)=>sm(T_UP,T_UP+.35,T)*(1-sm(S_START+.1,S_START+.35,T));
/** ter Stegen: the sweeper position, the sprint out, the chest control, the ball to his feet, head up, the long right-foot pass */
function tsState(T:number):St{
 if(T<CHEST_START){const st=runState(TS_KEYS,T,T<-2.9?CH_H:undefined);
  let pose=T<-2.9?blendPose(keeperSet(T*1.2),st.pose,.2):st.pose;
  pose=blendPose(pose,chestPose(0),sm(CHEST_START-.25,CHEST_START,T));
  return{pose:lookAtBall({pose,place:st.place},T,.9),place:st.place};}
 const place=placeOf(TS_AT[0],TS_AT[1],CH_H);
 if(T<.45)return{pose:chestPose((T-CHEST_START)/CHEST_DUR),place};
 if(T<S_START){// a short step to the ball, eyes on it — then head up and the look to Suárez
  const st=runState(TS_KEYS,T,yawTo(CH_H,S_H,sm(.45,S_START,T,easeInOutSine)));
  let pose=blendPose(chestPose(1),blendPose(st.pose,dribble(strideAt(TS_KEYS,T)*.9/3.4,{foot:'r',speed:.25}),.4),sm(.45,.75,T));
  const su=trackAt(SU_KEYS,T),up=upAt(T);
  pose=blendPose(lookAtBall({pose,place:st.place},T,.6),lookAt({pose:{...pose,neckP:pose.neckP-.7,lean:pose.lean-.12},place:st.place},[su[0],1.7,su[1]],1),up);
  return{pose:clampPose(pose),place:st.place};}
 const u=clamp((T-S_START)/P_DUR),sp=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.8}),place:sp};
 const pose=keyPoses(clamp((T-S_START-P_DUR)/.8),[[0,strike(1,{foot:'r',power:.8})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:sp},T,.7),place:sp};
}
/** the Getafe midfielder: on the ball, the long ball (right foot), watching it */
function kickerState(T:number):St{
 if(T<LB_START){const st=runState(KICK_KEYS,T);const pose=blendPose(st.pose,dribble(strideAt(KICK_KEYS,T)*.9/3.4,{foot:'r',speed:.5}),.5);
  const at=trackAt(KICK_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],K_H,sm(LB_START-.6,LB_START,T));
  return{pose:lookAtBall({pose,place:st.place},T,.4),place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-LB_START)/LB_DUR),place=placeOf(K_AT[0],K_AT[1],K_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.9}),place};
 if(T<T_LB+.7){const pose=keyPoses(clamp((T-LB_START-LB_DUR)/.6),[[0,strike(1,{foot:'r',power:.9})],[1,stand()]]);return{pose:lookAtBall({pose,place},T,.8),place};}
 const st=runState(KICK_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};
}
/** Suárez: on the last defender's shoulder, the sprint in behind, the first-time right-foot lob, then away, arms out */
function suarezState(T:number):St{
 if(T<S2_START){const st=runState(SU_KEYS,T),v=velAt(SU_KEYS,T),h=yawTo(nrm2(v[0],v[1]),S2_H,sm(S2_START-.5,S2_START,T));return{pose:lookAtBall({pose:st.pose,place:{...st.place,yaw:Math.atan2(h[1],h[0])}},T,.8),place:{...st.place,yaw:Math.atan2(h[1],h[0])}};}
 const u=clamp((T-S2_START)/S2_DUR),place=placeOf(SU_AT[0],SU_AT[1],S2_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.35}),place};
 if(T<T_G+.3){const st=runState(SU_KEYS,T,S2_H);const pose=keyPoses(clamp((T-S2_START-S2_DUR)/.5),[[0,strike(1,{foot:'r',power:.35})],[1,stand()]]);return{pose:lookAtBall({pose:blendPose(pose,st.pose,.3),place:st.place},T,.9),place:st.place};}
 const st=runState(SU_KEYS,T);return{pose:blendPose(st.pose,celebrate(strideAt(SU_KEYS,T)*.9/4.3,{kind:'run'}),sm(T_G+.3,T_G+.9,T)),place:st.place};
}
/** Soria: coming off his line, set, then the backward leap with his right hand up — the lob is over him */
function soriaState(T:number):St{
 const[x,z]=trackAt(SO_KEYS,T),b=ballAt(T),h=nrm2(-1,.05);
 if(T<SO_START){const st=runState(SO_KEYS,T,nrm2(b[0]-x,b[2]-z));const pose=blendPose(st.pose,keeperSet(T*1.4),sm(T_L-1,T_L,T));return{pose:lookAtBall({pose,place:st.place},T,.6),place:st.place};}
 return{pose:keeperTip(clamp((T-SO_START)/SO_TIP)),place:placeOf(SO_AT[0],SO_AT[1],h)};
}
function stateOf(id:string,T:number):St{
 if(id==='ts')return tsState(T);if(id==='kicker')return kickerState(T);if(id==='suarez')return suarezState(T);if(id==='soria')return soriaState(T);
 if(id==='runner'){const st=runState(RUN_KEYS,T);return{pose:lookAtBall(st,T,.8),place:st.place};}
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['ts','runner','suarez','soria','kicker'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keepers, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=['ts',...TRACKS.map(t=>t.id),'soria'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='ts'?TS:id==='soria'?SORIA:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='ts'&&((T>-2.4&&T<-.3)||Math.abs(T-T_P)<.2))||(id==='suarez'&&(Math.abs(T-T_R)<.2||(T>T_P+.3&&T<T_L-.3)));
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T)<.3||Math.abs(T-T_P)<.3||Math.abs(T-T_R)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera, panning with the play — the long ball, the keeper's sprint, the chest, the pass the other way, the lob. */
const MAIN_CAM:V3=[52.5,17,-27];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.4],[q[1],T_LB-.35],[q[2],-1.9],[q[3],-.9],[q[4]+.1,0],[q[5]+.2,T_P],[q[6]+.3,T_R],[q[7]+.2,T_G+.1],[S,T_G+1.2]]);};
/** where the TV camera points (pitch x) through the play: a smooth pan, wider while the long pass is in the air */
const PAN=[[-7,50],[-4,49],[T_LB,40],[-2.1,21],[-1.3,18.5],[0,21.5],[T_P,24.5],[T_P+1.2,52],[T_L,77],[T_R,87],[T_G,97],[T_G+2,98]];
/** the zoom: wide to set the scene, a touch in on the kick, wider while the long ball drops, in on the chest, wide for the pass and the lob */
const ZOOM=[[-7,4200],[-4,4400],[T_LB,5200],[-1.8,4700],[-.4,7400],[T_P,7400],[T_P+.8,4600],[T_L,4400],[T_R,4600],[T_G,4300],[T_G+2,4300]];
const cam1=(t:number)=>{const T=t1(t),x=keyPath(T,PAN,easeInOutSine)[0],F=keyPath(T,ZOOM,easeInOutSine)[0];
 return camAt(MAIN_CAM,[x,0,lerp(33,36,sm(T_P,T_R,T))],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true,ballScale:2.4});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[7]+.4;},
};
/** 2 · TV slow-motion replay from a low camera in front of him (upfield, near side): the chest, the drop, head up, the strike. */
const LOW_CAM:V3=[28.5,1.8,38.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-1.6],[q[1],-.55],[q[2],-.05],[q[2]+1.4,.5],[q[3],T_UP],[q[4],T_UP+.45],[q[5],S_START+.15],[q[5]+1,T_P+.1],[S,T_P+.9]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(TS_KEYS,Math.max(T,-1.4)),F=lerp(1900,2500,sm(-1.2,.3,T,easeInOutSine));
 return camAt(LOW_CAM,[m[0]+.3,1.05,m[1]-.2],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const T=t2(twos(t)),p=P3(ballAt(T),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(1)[3]+.6;},
};
/** 3 · the second replay from a raised camera behind the Getafe goal: the pass drops, one touch, over Soria, in. */
const END_CAM:V3=[114,5.2,41.5];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_L-1.3],[q[0],T_L-1.1],[q[1],T_R],[q[2],T_R+.95],[q[3],T_G+.05],[q[4],T_G+.6],[S,T_G+1.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),su=trackAt(SU_KEYS,T),f=sm(T_R+.2,T_G,T,easeInOutSine),
 tx=lerp(lerp(su[0],b[0],.35),lerp(b[0],96,.5),f),ty=lerp(clamp(b[1]*.35,.9,3),clamp(b[1]*.55,1.2,3.2),f),tz=lerp(lerp(su[1],b[2],.35),36,f),F=lerp(4400,2100,f);
 return camAt(END_CAM,[tx,ty,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.8});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(2)[4]+.4;},
};
/** 4 · the lesson plate: a raised camera behind the keeper looking up the pitch, with bold yellow teaching marks — a ring round ter Stegen,
 * rings under every Barcelona player (he is one more of them), look arcs round his head (stay calm), the pass arc and a ring on Suárez. */
const LESSON_CAM:V3=[-8,19,31];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,.7],[q[3],T_UP+.2],[q[4],S_START],[q[4]+1.6,T_L-.4],[S,T_L+.2]]);};
const cam4=(_t:number)=>camAt(LESSON_CAM,[48,0,37],1750);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D,ink=Y){s.stroke(K,p,5,.9);s.knockout(p);s.fill(ink,p,.95);}
/** ring outline (ground metres) added to a path */
function ringPath(p:Path2D,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 p.addPath(polyPath(out,true));p.addPath(polyPath(inn.reverse(),true));}
const BARCA_IDS=['b-rb','b-cb1','b-cb2','b-lb','b-dm','b-m1','b-m2','b-fw','suarez'];
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That's ter Stegen": a ring round him; "A keeper who passes … extra player": rings under all ten Barcelona outfield players pop in, one by one
  const pl=tsState(T).place,px=pl.x!,pz=-pl.z!;
  const hal=sm(q[0]-.1,q[0]+.35,t,easeOutBack),rings=new Path2D();let any=false;
  if(hal>.01){ringPath(rings,px,pz,1.4*hal,c);any=true;}
  BARCA_IDS.forEach((id,i)=>{const g=sm(q[1]+.2+i*.12,q[1]+.5+i*.12,t,easeOutBack)*(1-sm(q[4]-.3,q[4]+.1,t))*(id==='suarez'?0:1);if(g>.01){const p=stateOf(id,T).place;ringPath(rings,p.x!,-p.z!,1.3*g,c);any=true;}});
  if(any)mark(s,rings);
  // "like an extra player": a second, bigger ring round the keeper — he counts as one more
  const extra=sm(q[2],q[2]+.4,t,easeOutBack);
  if(extra>.01){const p=new Path2D();ringPath(p,px,pz,2.3*extra,c);mark(s,p,R);}
  drawPlay(s,T,c,{ballScale:2,noStadium:true,wide:false,only:['ts','runner','suarez','ball',...BARCA_IDS,'g-cb1','g-cb2','g-fw2','g-m1','g-m2','g-m3','g-rb','g-lb']});
  // "Stay calm": look arcs round his head as he lifts it
  const br=sm(q[3],q[3]+.5,t,easeOutBack)*(1-sm(q[4]+.2,q[4]+.6,t));
  if(br>.01){const h=P3([px,2.6,pz],c),k=h[2],p=new Path2D(),arc=(a0:number,a1:number)=>{const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;pts.push([h[0]+Math.cos(a)*1.2*k*br,h[1]+Math.sin(a)*.7*k*br]);}return pts;};
   p.addPath(ribbon(arc(Math.PI+.35,Math.PI*1.5-.2),Math.max(9,.2*k),{seed:31,taper:.3}));p.addPath(ribbon(arc(Math.PI*1.5+.2,TAU-.35),Math.max(9,.2*k),{seed:32,taper:.3}));mark(s,p);}
  // "find a free teammate": the pass as a bold arc through the air to Suárez's landing spot, and a ring on him
  const lane=sm(q[4]+.1,q[4]+1.1,t,easeInOutSine);
  if(lane>.01){const pts:Pt[]=[];const N=18;for(let i=0;i<=N;i++){const u=i/N*lane;const x=lerp(PB[0],LAND[0],u),z=lerp(PB[1],LAND[1],u),y=10.3*4*u*(1-u);pts.push(G(x,z,c,y));}
   const p=new Path2D();p.addPath(ribbon(pts,12,{seed:21,taper:0,wobble:.8}));
   if(lane>.97){const e=pts[N],d=pts[N-2],an=Math.atan2(e[1]-d[1],e[0]-d[0]),hl=30;p.addPath(shape([[e[0]+Math.cos(an)*hl*.5,e[1]+Math.sin(an)*hl*.5],[e[0]+Math.cos(an+2.2)*hl,e[1]+Math.sin(an+2.2)*hl],[e[0]+Math.cos(an-2.2)*hl,e[1]+Math.sin(an-2.2)*hl]]));}
   mark(s,p);}
  const spot=sm(q[4]+.9,q[4]+1.3,t,easeOutBack);
  if(spot>.01){const p=new Path2D(),su=trackAt(SU_KEYS,T);ringPath(p,su[0],su[1],1.8*spot,c);mark(s,p);}
  const stamp=sm(q[4]+1.3,q[4]+1.7,t,easeOutBack);
  if(stamp>.002){const su=trackAt(SU_KEYS,T),bp=P3([su[0],2.4,su[1]],c);sparkBurst(s,Y,bp[0],bp[1],1.2*bp[2],{n:10,seed:61,g:clamp(stamp),width:.1*bp[2]});}
  frame(s);
 },
 get still(){return Q(3)[4]+1.6;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'ter-stegen-signature',format:'11v11',title:'ter Stegen: the keeper who passes',theme:'A keeper who passes well is like an extra player',
 ageNote:'Getafe 0–2 Barcelona · La Liga, 28 September 2019 · Coliseum Alfonso Pérez, Getafe',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little sunny spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Barcelona's goal line at X=0, Z across) — checked by tests/play-film-ter-stegen-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1],chest:toMy(sk.chest),rHa:toMy(sk.rHa)};};
export const FACTS={CH,CHB,PB,LAND,SR,LB0,GL,T_LB,T_P,T_L,T_R,T_G,S_START,T_UP,SO_AT,ballAt,upAt,
 tsBody:(T:number)=>feet(tsState(T),TS.build),
 kickerFeet:(T:number)=>feet(kickerState(T),KICKER.build),
 suarezFeet:(T:number)=>feet(suarezState(T),SUAREZ.build),
 soriaBody:(T:number)=>feet(soriaState(T),SORIA.build),
 tsAt:(T:number)=>{const st=tsState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 runnerAt:(T:number)=>{const st=stateOf('runner',T);return[st.place.x!,-st.place.z!] as [number,number];},
 suarezAt:(T:number)=>{const st=suarezState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 defAt:(id:string,T:number)=>{const st=stateOf(id,T);return[st.place.x!,-st.place.z!] as [number,number];}};
