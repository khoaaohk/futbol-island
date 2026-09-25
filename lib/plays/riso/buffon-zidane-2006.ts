/** Iconic-play film · Gianluigi Buffon tips Zinedine Zidane's header over the bar — Italy v France, World Cup final, 9 July 2006,
 * Olympiastadion, Berlin (extra time, about the 104th minute).
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch to Italy's goal
 * line at X=105, Z across from the near touchline, Y up) seen through TV cameras — 1 live, the high main camera on the side (Zidane plays it
 * out to Sagnol on the right, Sagnol crosses it back, Zidane's header, Buffon's tip over), 2 the TV slow-motion replay from the high camera
 * behind Italy's goal, 3 a second slow replay from a low angle in front of the goal, 4 the lesson (the only chapter with teaching marks:
 * the set stance stamped, the eye line to the ball, the strong hand, the path over the bar). No overlays inside the footage chapters.
 * Kid-friendly: the later sending-off is not shown or narrated.
 *
 * SOURCES (read 23 Sep 2026; cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "2006 FIFA World Cup final" (raw): https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_final
 *  - Wikipedia (it), "Finale del campionato mondiale di calcio 2006": https://it.wikipedia.org/wiki/Finale_del_campionato_mondiale_di_calcio_2006
 *  - Wikipedia (fr), "Finale de la Coupe du monde de football 2006" (citing L'Équipe): https://fr.wikipedia.org/wiki/Finale_de_la_Coupe_du_monde_de_football_2006
 *  - BBC Sport, "Italy 1-1 France (aet)" (Jonathan Stevenson, 9 July 2006): http://news.bbc.co.uk/sport2/hi/football/world_cup_2006/4991652.stm
 *  - Wikimedia Commons photo, "Italy vs France - FIFA World Cup 2006 final - Gianluigi Buffon.jpg" (Buffon's kit that night)
 * CONFIRMED by those sources: extra time of the final in Berlin, about the 103rd/104th minute; Zidane plays the ball to Willy Sagnol on the
 * right, Sagnol crosses it back toward the middle about eight metres out; Zidane's powerful header; Buffon's reflex save tips it over the
 * crossbar (for a corner); Italy go on to win the World Cup on penalties. Kits: Italy blue shirts, white shorts, blue socks; France all
 * white; Buffon in an all-gold kit (short sleeves, dark shoulder panels, white undershirt collar) and pale gloves; Buffon 1, Zidane 10,
 * Sagnol 19; the Olympiastadion has a blue running track around the pitch and a honeycomb goal net.
 * INFERRED (not in the sources): every other player's position, all paths and timings, which end and camera placements and lenses, Sagnol's
 * right-footed cross and Zidane's right-footed pass, the exact height and side of the header, that Buffon used his RIGHT hand (the
 * narration never names the hand), his small spring back and up, where the ball landed behind the goal, skin/hair screens.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts) routed through ONE adapter, drawPlayer(). The camera frames the whole sheet
 * (never sheet.safe), for card windows from 1.45:1 to square. Actions are timed from the chapter cues so real narration timings re-time the
 * drawing. Scenes read only their local time t; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,key,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,smoothPts,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,runCycle,stand,strike,header,keeperSet,keeperTip,lunge,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------- narration + timing ----------------
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The header, live',text:'Berlin, 2006, the World Cup final. In extra time, Zinedine Zidane passes to Willy Sagnol, who crosses it back. Zidane heads it hard!',seconds:11.9,
  cues:[[.1,'Berlin'],[3.7,'In extra time'],[4.8,'Zinedine Zidane passes'],[6.2,'Willy Sagnol'],[7.3,'who crosses it back'],[8.8,'Zidane heads it hard']]},
 {label:'Watch it again',text:'Watch it again, slowly. Gianluigi Buffon stays set, on his toes. He watches the ball, springs up, and tips it over the bar!',seconds:9.4,
  cues:[[.15,'Watch it again'],[1.9,'Gianluigi Buffon stays set'],[4.5,'He watches the ball'],[5.8,'springs up'],[6.7,'tips it over the bar']]},
 {label:'From the front',text:'From the front: one strong hand pushes the ball up and over. Italy went on to win the World Cup!',seconds:7.4,
  cues:[[.15,'From the front'],[1.4,'one strong hand'],[3.1,'up and over'],[4.5,'Italy went on']]},
 {label:'Your turn',text:'Your turn: stay set, watch the header, and use a strong hand to push it over the bar.',seconds:7.6,
  cues:[[.15,'Your turn'],[1,'stay set'],[2,'watch the header'],[3.6,'strong hand'],[4.9,'over the bar']]},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py buffon-zidane-2006 (writes timing.json next to
 * script.json). Then import that timing.json here and pass it as NarrationTiming: withTiming swaps in the clips, chapter lengths and word
 * onsets and the whole film re-times itself (tests/play-film-buffon-zidane-2006.cjs fails until this is wired once timing.json exists). */
import timingJson from '../../../public/plays/narration/buffon-zidane-2006/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);

const K='navy',Y='yellow',O='orange',B='blue';
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>film.chapters[i].cues.map(c=>c.at);
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------- camera: the whole frame ----------------
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never sheet.safe. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------- 3D: pitch metres → screen through a TV camera ----------------
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
/** a painted line on the grass from a to b (x,z), w metres wide */
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;

// ---------------- the Olympiastadion in 3D: the blue running track, the bowl of stands under a roof ring, grass, markings ----------------
/** The track is a stadium oval around the pitch: straights along Z = 34 ± R, bends centred on X = 14 and 91. oval(u, r): a point at
 * perimeter parameter u ∈ [0,1) on the oval of radius r, with its outward normal. */
const OV={c0:14,c1:91,cz:34,R:39,W:9};
function oval(u:number,r:number):{p:[number,number];n:[number,number]}{
 const L=OV.c1-OV.c0,P=2*L+TAU*r,d=((u%1)+1)%1*P;
 if(d<L)return{p:[OV.c0+d,OV.cz-r],n:[0,-1]};
 if(d<L+Math.PI*r){const a=-Math.PI/2+(d-L)/r;return{p:[OV.c1+Math.cos(a)*r,OV.cz+Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
 if(d<2*L+Math.PI*r){const e=d-L-Math.PI*r;return{p:[OV.c1-e,OV.cz+r],n:[0,1]};}
 const a=Math.PI/2+(d-2*L-Math.PI*r)/r;return{p:[OV.c0+Math.cos(a)*r,OV.cz+Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
const SEGS=44,TIERS=18;
const TIER_INK:[string,number][]=[[B,.45],[O,.2],[Y,.32],[B,.2],[K,.2],[B,.32],[O,.45],[Y,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const R0=OV.R+OV.W,concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D()),track=new Path2D(),lanes=new Path2D();
 const at=(u:number,d:number,y:number):V3=>{const o=oval(u,R0);return[o.p[0]+o.n[0]*d,y,o.p[1]+o.n[1]*d];};
 for(let g=0;g<SEGS;g++){const u0=g/SEGS,u1=(g+1)/SEGS;
  addPoly(concrete,[at(u0,0,1.2),at(u1,0,1.2),at(u1,40,1.2+40*.55),at(u0,40,1.2+40*.55)],c);
  addPoly(wall,[at(u0,0,0),at(u1,0,0),at(u1,0,1.1),at(u0,0,1.1)],c);
  addPoly(roof,[at(u0,24,32),at(u1,24,32),at(u1,46,33.5),at(u0,46,33.5)],c);
  for(let k=0;k<TIERS;k++){const d0=1+k*2.1,d1=d0+1.7,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   addPoly(tiers[(k*3+g*5)%TIER_INK.length],[at(u0,d0,y0),at(u1,d0,y0),at(u1,d1,y1),at(u0,d1,y1)],c);}
  // the running track: one ring quad per segment; lane lines on the straights only
  const a0=oval(u0,OV.R),a1=oval(u1,OV.R),b0=oval(u0,R0),b1=oval(u1,R0);
  addPoly(track,[[a0.p[0],0,a0.p[1]],[a1.p[0],0,a1.p[1]],[b1.p[0],0,b1.p[1]],[b0.p[0],0,b0.p[1]]],c);}
 for(const side of[-1,1])for(let l=1;l<8;l++){const z=OV.cz+side*(OV.R+l*OV.W/8);groundLine(lanes,[OV.c0,z],[OV.c1,z],c,.1);}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.7);s.fill(O,wall,.32);s.fill(B,wall,.6);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
 s.fill(B,track,.78);s.knockout(lanes,.6);
 const grass=new Path2D();{const pts:V3[]=[];for(let i=0;i<48;i++){const o=oval(i/48,OV.R);pts.push([o.p[0],0,o.p[1]]);}addPoly(grass,pts,c);}
 s.knockout(grass);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,-3],[(i+1)*5.25,0,-3],[(i+1)*5.25,0,71],[i*5.25,0,71]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const z of[0,68]){const a=P3([105,0,z],c),b=P3([105,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([105,1.42,z+(z?-.5:.5)],c),g=P3([105,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(O,fl);}
}
const GOAL={x:105,z0:30.34,z1:37.66,h:2.44,back:107,backH:2.0};
/** Italy's goal: white posts and bar and the Berlin honeycomb net (paper haze + navy hexagons on the back, a plain mesh on the sides). */
function goal(s:Sheet,c:Cam){
 const g=GOAL,net=new Path2D();
 addPoly(net,[[g.x,0,g.z0],[g.back,0,g.z0],[g.back,g.backH,g.z0],[g.x,g.h,g.z0]],c);addPoly(net,[[g.x,0,g.z1],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.x,g.h,g.z1]],c);
 addPoly(net,[[g.back,0,g.z0],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);addPoly(net,[[g.x,g.h,g.z0],[g.x,g.h,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);
 s.knockout(net,.32);
 const k0=P3([g.x,1,34],c)[2],sp=Math.max(.3,30/Math.max(1,k0));// the mesh never prints tighter than ~30 units (no moiré in a small card)
 const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
 // honeycomb on the back: zigzag rows + alternating verticals (pointy-top hexagons, side a)
 const a=sp*.62,hw=a*.866,rows=Math.ceil(g.backH/(1.5*a)),cols=Math.ceil((g.z1-g.z0)/hw);
 const hz=(k:number)=>Math.min(g.z1,g.z0+k*hw),hy=(y:number)=>Math.min(g.backH,y);
 for(let j=0;j<=rows;j++){const y0=j*1.5*a;if(y0>g.backH)break;
  for(let k=0;k<cols;k++){seg([g.back,hy(y0+((k+j)%2)*.5*a),hz(k)],[g.back,hy(y0+((k+1+j)%2)*.5*a),hz(k+1)]);
   if((k+j)%2===1&&y0+.5*a<g.backH)seg([g.back,hy(y0+.5*a),hz(k)],[g.back,hy(y0+1.5*a),hz(k)]);}}
 for(const z of[g.z0,g.z1])for(let y=0;y<=g.backH+.01;y+=sp)seg([g.x,y*g.h/g.backH,z],[g.back,y,z]);
 for(let x=g.x;x<=g.back+.01;x+=sp){for(const z of[g.z0,g.z1])seg([x,0,z],[x,lerp(g.h,g.backH,(x-g.x)/(g.back-g.x)),z]);}
 for(let z=g.z0;z<=g.z1+.01;z+=sp)seg([g.x,g.h,z],[g.back,g.backH,z]);
 s.stroke(K,mesh,Math.max(1.4,.011*k0),.45);
 const post=(p0:V3,p1:V3)=>{const p=P3(p0,c),q=P3(p1,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(5,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([g.x,0,g.z0],[g.x,g.h,g.z0]));fr.addPath(post([g.x,0,g.z1],[g.x,g.h,g.z1]));fr.addPath(post([g.x,g.h,g.z0-.06],[g.x,g.h,g.z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
 const stan=new Path2D();for(const z of[g.z0,g.z1]){const p=P3([g.back,0,z],c),q=P3([g.back,g.backH,z],c),d=P3([g.x,g.h,z],c);if(p[2]>0&&q[2]>0&&d[2]>0){stan.moveTo(p[0],p[1]);stan.lineTo(q[0],q[1]);stan.lineTo(d[0],d[1]);}}
 s.stroke(K,stan,Math.max(2,.03*k0),.7);
}

// ---------------- figures: the shared athlete library, through ONE adapter ----------------
/** athlete.ts is right-handed (y up); this film's pitch (X to Italy's goal, Z away from the main camera) is left-handed, so the projector
 * negates z both ways — that keeps Buffon's RIGHT hand on the far-post side and Sagnol's right boot on the touchline side. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE figure adapter: every body in the film is printed here (motion smear first on fast moves, then the athlete). */
function drawPlayer(s:Sheet,pose:Pose,pc:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[O,.2]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const italy=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',number:null,scale:FIG,...o});
const france=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[B,.6],shorts:'paper',socks:'paper',boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.8],number:null,scale:FIG,...o});
/** Buffon: the all-gold kit of the final (dark shoulder panels as trim), pale gloves, number 1 */
const BUFFON:AthleteStyle={shirt:Y,trim:[K,.75],shorts:Y,socks:Y,boots:K,skin:LIGHT,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',gloves:'paper',number:1,numberInk:K,scale:FIG,seed:1,build:{height:1.91}};
type St={pose:Pose;place:Place};

// ---------------- the play (pitch metres; play seconds T, T=0 = Zidane's pass out to Sagnol) ----------------
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'zidane',style:france(LIGHT,{number:10,seed:10,hairStyle:'balding',hair:[K,.45],build:{height:1.85}}),keys:[[-6,70,24],[-2,76,23],[0,80,21.8],[.5,81.2,22.6],[2.2,90.5,29],[3.4,95.6,32.6],[3.9,96.8,33.3],[4.6,97.1,33.4],[9,96,32.5]]},
 {id:'sagnol',style:france(LIGHT,{number:19,seed:19,hair:[Y,.88]}),keys:[[-6,74,6],[-2,79,5.6],[0,81.4,5.4],[1.0,84.6,5.3],[2.2,87.8,5.5],[2.6,88.9,5.7],[3.4,90.3,6.6],[9,90,8]]},
 // Italy's defenders around the ball and the rest of both teams: positions are illustrative (not in the sources)
 {id:'i-lb',style:italy(LIGHT,{seed:3}),keys:[[-6,84,10],[0,88.4,8.6],[2.2,91.6,7.4],[2.9,92.2,7.6],[9,93,9]]},
 {id:'i-cb1',style:italy(LIGHT,{seed:5}),keys:[[-6,88,27],[0,92,28.2],[2.2,95,30.8],[3.4,96.9,32.1],[3.9,97.5,32.5],[9,98,32]]},
 {id:'i-cb2',style:italy(MID,{seed:23,build:{height:1.93}}),keys:[[-6,90,38],[0,93.5,38.5],[3.9,98.6,37.4],[9,98.6,37]]},
 {id:'i-rb',style:italy(LIGHT,{seed:19}),keys:[[-6,88,54],[0,91,52],[3.9,96.8,46],[9,97,45]]},
 {id:'i-m1',style:italy(LIGHT,{seed:8}),keys:[[-6,76,33],[0,81,34],[3.9,89.5,33.5],[9,90,33]]},
 {id:'i-m2',style:italy(MID,{seed:21}),keys:[[-6,74,16],[0,79,15],[3.9,86,17],[9,87,18]]},
 {id:'f-9',style:france(DARK,{seed:20}),keys:[[-6,86,37],[0,91,38.5],[3.9,98.9,36.3],[9,98.4,36]]},
 {id:'f-11',style:france(DARK,{seed:12}),keys:[[-6,82,46],[0,87,46],[3.9,95.5,43.8],[9,95,43]]},
 {id:'f-w',style:france(MID,{seed:7}),keys:[[-6,74,58],[0,79,57],[3.9,88,55],[9,88,54]]},
 {id:'f-dm',style:france(DARK,{seed:6}),keys:[[-6,62,30],[0,66,31],[3.9,72,33],[9,73,33]]},
];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-6);for(let t=-5.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const CROSS_T=2.6,HEAD_T=3.9,TIP0=HEAD_T-.02,TIP_DUR=.72,TOUCH_T=TIP0+.62*TIP_DUR;
const CROSS_FROM:V3=[88.95,.11,6.25];
/** The ball in 3D at play time T: at Zidane's feet, his pass out to Sagnol, Sagnol's touch, the cross back into the middle, the header,
 * Buffon's fingers, up and over the bar, down behind the goal. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const zd=TR('zidane').keys,sg=TR('sagnol').keys;
 if(T<0)return ahead(zd,T,.6);
 if(T<1.0)return lerp3(ahead(zd,0,.6),ahead(sg,1.0,.7),sm(0,1.0,T,u=>u*(1.3-.3*u)),.25);
 if(T<CROSS_T-.12)return ahead(sg,T,key(T,[[1,.7],[1.4,1.4],[2.2,.8]])+.12*Math.sin(T*9));
 if(T<CROSS_T)return CROSS_FROM;
 if(T<HEAD_T)return lerp3(CROSS_FROM,HEAD_PT,sm(CROSS_T,HEAD_T,T,linear),4.2);
 if(T<TOUCH_T)return lerp3(HEAD_PT,HAND,sm(HEAD_T,TOUCH_T,T,linear),.05);
 if(T<TOUCH_T+.8)return lerp3(HAND,LANDS,sm(TOUCH_T,TOUCH_T+.8,T,linear),LIFT);
 const u=sm(TOUCH_T+.8,TOUCH_T+2.2,T,easeOut);return[lerp(LANDS[0],110.5,u),.11+.45*Math.abs(Math.sin(u*Math.PI))*(1-u),lerp(LANDS[2],HAND[2]+1.6,u)];
}

// ---------------- the players at play time T (poses from athlete.ts generators; contacts solved in 3D) ----------------
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
const ZID_FACE=nrm2(105-96.8,34.9-33.3);
/** Sagnol's right boot meets the ball at the cross: the body is nudged in 3D so the solved toe lands on CROSS_FROM */
let _sgShift:[number,number]|null=null;
function sagnolShift(){if(_sgShift)return _sgShift;const st=runState(TR('sagnol').keys,CROSS_T),sk=solve(strike(STRIKE_CONTACT),TR('sagnol').style.build,st.place,FIG),toe=toMy(sk.rToe);return _sgShift=[CROSS_FROM[0]-toe[0],CROSS_FROM[2]-toe[2]];}
function stateOf(id:string,T:number):St{
 const k=TR(id).keys;
 if(id==='zidane'){const st=runState(k,T,T>3.3?ZID_FACE:undefined);
  if(T<.45){const w=win(T,-.55,.45);return w>0?{...st,pose:blendPose(st.pose,strike(clamp(T/1.0+STRIKE_CONTACT),{power:.45}),w)}:st;}
  if(T<3.3)return st;
  const hp=header(clamp((T-HEAD_T)/1.15+.52));hp.air*=1.15;
  return{pose:blendPose(blendPose(st.pose,hp,sm(3.3,3.45,T)),stand(),sm(5.2,6,T)),place:st.place};}
 if(id==='sagnol'){const st=runState(k,T,T>2.3&&T<3.2?nrm2(1,1.1):undefined),w=win(T,CROSS_T-.5,CROSS_T+.6);if(w<=0)return st;const d=sagnolShift(),ws=win(T,CROSS_T-.75,CROSS_T+.8,.4);
  return{pose:blendPose(st.pose,strike(clamp((T-CROSS_T)/1.0+STRIKE_CONTACT)),w),place:{...st.place,x:st.place.x!+d[0]*ws,z:st.place.z!-d[1]*ws}};}
 if(id==='i-lb'){const st=runState(k,T),w=win(T,2.3,3.2);return w>0?{...st,pose:blendPose(st.pose,lunge(clamp((T-2.3)/.9),{side:'r'}),w)}:st;}
 if(id==='i-cb1'){const st=runState(k,T,T>3.3?nrm2(-1,.1):undefined);if(T<3.35)return st;const hp=header(clamp((T-HEAD_T-.06)/1.15+.52));hp.air*=.55;
  return{pose:blendPose(blendPose(st.pose,hp,sm(3.35,3.5,T)),stand(),sm(5,5.6,T)),place:st.place};}
 return runState(k,T);
}
/** Buffon: set on his toes, shuffling with the cross, the reflex spring up and back (right palm over the bar at TOUCH_T), the landing in
 * his goalmouth, back up into his set stance. Facing the field (−X). */
const TIP_AT:[number,number]=[103.55,33.9];
const BUFF_KEYS=[[-6,103.7,33.2],[0,103.8,33.0],[CROSS_T,103.8,32.5],[3.5,103.6,33.6],[TIP0,TIP_AT[0],TIP_AT[1]]];
const tipPose=(u:number)=>{const p=keeperTip(clamp(u),{hand:'r'});return{...p,air:p.air*.42,dx:p.dx*.5};};
function buffonState(T:number):St{
 if(T<TIP0){const[x,z]=trackAt(BUFF_KEYS,T);return{pose:keeperSet(T<CROSS_T?T*1.3:CROSS_T*1.3+(T-CROSS_T)*2.6),place:placeOf(x,z,[-1,0])};}
 let pose=tipPose((T-TIP0)/TIP_DUR);
 const up=sm(TIP0+TIP_DUR+.5,TIP0+TIP_DUR+1.6,T,easeInOutSine),st=tipPose(1).dx;
 const x=TIP_AT[0];if(up>0){const back=sm(TIP0+TIP_DUR+1.2,TIP0+TIP_DUR+2.6,T,easeInOutSine);pose=blendPose(pose,{...keeperSet(T*1.3),dx:st},up);pose={...pose,dx:lerp(st,0,back)};}
 return{pose,place:placeOf(x,TIP_AT[1],[-1,0])};
}
// the contacts, solved once from the bodies: Buffon's right palm (HAND), Zidane's forehead (HEAD_PT)
const HAND:V3=(()=>{const sk=solve(tipPose(.62),BUFFON.build,placeOf(TIP_AT[0],TIP_AT[1],[-1,0]),FIG),h=toMy(sk.rHa),e=toMy(sk.rEl),d=[h[0]-e[0],h[1]-e[1],h[2]-e[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[h[0]+d[0]/l*.1,h[1]+d[1]/l*.1,h[2]+d[2]/l*.1] as V3;})();
const LANDS:V3=[108.9,.11,HAND[2]+.9],LIFT=2.6;
const HEAD_PT:V3=(()=>{const st=stateOf('zidane',HEAD_T),sk=solve(st.pose,TR('zidane').style.build,st.place,FIG),hd=toMy(sk.head),fc=toMy(sk.face),d=[fc[0]-hd[0],fc[1]-hd[1],fc[2]-hd[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*.11,fc[1]+d[1]/l*.11+.02,fc[2]+d[2]/l*.11] as V3;})();

type Item={depth:number;draw:()=>void};
const HEROES=['zidane','sagnol','i-cb1','i-lb','buffon'];
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goal in depth order (far first).
 * detail 'low' for wide shots; otherwise heroes print at 'auto' (mid/high) and the rest at 'low'. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean;ball?:V3|null;keeper?:(T:number)=>St}={}){
 stadium(s,c,o.bounce??0);
 const pc=proj(c),items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),'buffon'];
 for(const id of ids){const fn=(t:number)=>id==='buffon'?(o.keeper??buffonState)(t):stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='buffon'?BUFFON:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='zidane'&&T>3.6&&T<4.1)||(id==='buffon'&&T>TIP0+.1&&T<TOUCH_T+.15)||(id==='sagnol'&&T>CROSS_T-.15&&T<CROSS_T+.25);
  items.push({depth:1/g[2],draw:()=>{const pr=fn(T-1/12);drawPlayer(s,st.pose,pc,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 const bp=o.ball===undefined?ballAt(T):o.ball;
 if(bp){const bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:T>TOUCH_T-.15&&T<TOUCH_T+.5&&o.ball===undefined?0:1/bq[2],draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:T*6,key:K,shadow:B,seed:3});}});}}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------- chapters ----------------
const MAIN_CAM:V3=[52.5,30,-62];
/** 1 · live: real time between the cue beats (establish Berlin, Zidane on the ball, the pass, the cross, the header, the tip). */
const t1=(t:number)=>{const q=Q(0),S=film.chapters[0].seconds;return warp(t,[[0,-5.4],[q[2]+.2,0],[q[4]+.35,CROSS_T],[q[5]+.3,HEAD_T],[S,HEAD_T+S-q[5]-.3]]);};
const cam1=(t:number)=>{const Tc=t1(t),bx=ballAt(Math.max(-5.4,Tc-.35))[0],est=1-sm(-5.4,-2.6,Tc,easeInOutSine),box=sm(CROSS_T,HEAD_T+.2,Tc,easeInOutSine);
 const tx=lerp(clamp(bx+4,76,97),100,box),tz=lerp(lerp(17,13,sm(0,1.5,Tc)),31,box)+est*22,ty=est*10;
 return camAt(MAIN_CAM,[tx,ty,tz],lerp(lerp(5600,6400,box),2600,est));};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.2*p[2]),12);},
 get still(){return Q(0)[5]+.9;},
};
/** 2 · the TV slow-motion replay from the high camera behind Italy's goal: the cross drops in, Buffon set, Zidane rises, the tip over. */
const BEHIND:V3=[141,11,35.2];
const replay2=(t:number)=>{const q=Q(1),S=film.chapters[1].seconds;return warp(t,[[0,CROSS_T+.25],[q[1],3.2],[q[2],3.62],[q[3]+.25,HEAD_T+.05],[q[4]+.35,TOUCH_T],[S,TOUCH_T+.75]]);};
const cam2=(t:number)=>{const T=replay2(t);return camAt(BEHIND,[101.4,1.5,lerp(32.6,33.8,sm(3,HEAD_T,T))],lerp(6600,7600,sm(3,HEAD_T,T,easeInOutSine)));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,replay2(twos(t)),cam2(t),{ballScale:1.8});frame(s);},
 aperture(t){const p=P3([104.9,1.25,34],cam2(t));return apertureDisc(p[0],p[1],Math.max(10,.9*p[2]),12);},
 get still(){return Q(1)[4]+.5;},
};
/** 3 · a second slow replay from a low camera in front of the goal, off Zidane's shoulder: the header, the palm, up and over. */
const LOW:V3=[91,1.6,24.2];
const replay3=(t:number)=>{const q=Q(2),S=film.chapters[2].seconds;return warp(t,[[0,3.62],[q[1],HEAD_T],[q[1]+1.1,TOUCH_T],[q[2]+.4,TOUCH_T+.45],[q[3],TOUCH_T+.9],[S,TOUCH_T+2.2]]);};
const cam3=(t:number)=>{const T=replay3(t);return camAt(LOW,[101.5,1.6,lerp(32.2,33.2,sm(HEAD_T,TOUCH_T+.5,T))],lerp(2300,2700,sm(3.6,TOUCH_T,T,easeInOutSine)));};
const ch3:Scene={
 draw(s,t){const T=replay3(twos(t)),q=Q(2);frame(s);drawPlay(s,T,cam3(t),{ballScale:1.7,bounce:.5*Math.abs(Math.sin(t*6))*sm(q[3],q[3]+.4,t)});frame(s);},
 aperture(t){const p=P3(ballAt(replay3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.12*p[2]),12);},
 get still(){return Q(2)[1]+1.1;},
};
/** 4 · the lesson plate (not footage): the goal, Buffon, and bold yellow teaching marks — the set stance stamped (stay set), the eye line
 * from his face to the ball coming off Zidane's head (watch the header), the spring and the palm (strong hand), the ball's path up and over
 * the bar with an arrowhead (over the bar). */
const LESSON_CAM:V3=[93.2,1.5,35.6];
const cam4=(t:number)=>camAt(LESSON_CAM,[104.4,1.55,lerp(34.3,34,sm(0,8,t))],lerp(2150,2300,sm(0,8,t,easeInOutSine)));
/** the lesson's Buffon: set in the middle of his goal, then (strong hand) the tip again, held at the touch */
function lessonKeeper(t:number):St{
 const q=Q(3),go=q[3]-.35;
 if(t<go)return{pose:keeperSet(t*1.3),place:placeOf(TIP_AT[0],TIP_AT[1],[-1,0])};
 return{pose:tipPose(Math.min(.62,(t-go)/(TIP_DUR*1.4))),place:placeOf(TIP_AT[0],TIP_AT[1],[-1,0])};
}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),cam=cam4(t),tt=twos(t);frame(s);
  // the lesson ball: floats at the header point, then (watch the header) travels the eye line to the palm, then over the bar
  const flyU=sm(q[2]+.3,q[3]+.35,t,easeInOutSine),over=sm(q[4]-.2,q[4]+1,t,easeInOutSine);
  const lb:V3|null=t<q[2]-.1?null:over>0?lerp3(HAND,LANDS,over*.62,LIFT):lerp3(HEAD_PT,HAND,flyU,.05);
  drawPlay(s,tt,cam,{ballScale:1.3,bounce:.6*Math.abs(Math.sin(t*6))*(1-sm(.3,2.4,t)),only:[],ball:lb,keeper:()=>lessonKeeper(tt)});
  // "stay set": two lit footprints stamped under his set stance
  const set=sm(q[1],q[1]+.35,t,easeOutBack);
  if(set>.002){const fp=new Path2D();for(const dz of[-.3,.3]){const pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=P3([TIP_AT[0]-.12+Math.cos(a)*.26*set,.01,TIP_AT[1]+dz+Math.sin(a)*.13*set],cam);pts.push([p[0],p[1]]);}fp.addPath(shape(pts));}
   s.stroke(K,fp,6,.9);s.knockout(fp);s.fill(Y,fp,.95);
  }
  // "watch the header": a dashed eye line from Buffon's face to the ball
  const eye=sm(q[2],q[2]+.4,t,easeOut)*(1-sm(q[4]-.3,q[4],t));
  if(eye>.01&&lb){const kp=lessonKeeper(tt),sk=solve(kp.pose,BUFFON.build,kp.place,FIG),f=P3(toMy(sk.face),cam),b=P3(lb,cam),n=9,dash=new Path2D();
   for(let i=0;i<n;i++){const u0=i/n,u1=(i+.55)/n;if(u1>eye)break;dash.addPath(ribbon([[lerp(f[0],b[0],u0),lerp(f[1],b[1],u0)],[lerp(f[0],b[0],u1),lerp(f[1],b[1],u1)]],7,{seed:30+i,taper:0,wobble:.5}));}
   s.stroke(K,dash,4,.9);s.knockout(dash);s.fill(Y,dash,.95);}
  // "strong hand": a spark at the palm as it meets the ball
  const hand=sm(q[3]+.1,q[3]+.45,t,easeOutBack);
  const hp=P3(HAND,cam);if(hand>.01)sparkBurst(s,Y,hp[0],hp[1],.75*hp[2],{n:10,seed:61,g:clamp(hand),width:.06*hp[2]});
  // "over the bar": the ball's path from the palm, up over the crossbar and down behind it, with an arrowhead
  const draw=sm(q[4],q[4]+1.1,t,easeInOutSine);
  if(draw>.002){const pts:Pt[]=[];for(let i=0;i<=14;i++){const p=P3(lerp3(HAND,LANDS,i/14,LIFT),cam);pts.push([p[0],p[1]]);}
   const line=partial(smoothPts(pts,false,6,2),draw),w=Math.max(10,.1*hp[2]);
   if(line.length>1){const path=ribbon(line,w,{seed:9,taper:.2,wobble:1.2});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);
    if(draw>.97){const e=line[line.length-1],pr=line[line.length-3]??line[0],a=Math.atan2(e[1]-pr[1],e[0]-pr[0]),hl=w*2.6,head=shape([[e[0]+Math.cos(a)*hl*.6,e[1]+Math.sin(a)*hl*.6],[e[0]+Math.cos(a+2.4)*hl,e[1]+Math.sin(a+2.4)*hl],[e[0]+Math.cos(a-2.4)*hl,e[1]+Math.sin(a-2.4)*hl]]);s.stroke(K,head,5,.9);s.knockout(head);s.fill(Y,head,.95);}}}
  frame(s);
 },
 get still(){return film.chapters[3].seconds*.85;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'buffon-zidane-2006',format:'11v11',title:'Over the bar in Berlin',theme:'Stay set, watch the ball, strong hand',
 ageNote:'Italy v France · World Cup final, 9 July 2006 · Berlin, Germany',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little gold spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to Italy's goal line at 105, Z across) — checked by tests/play-film-buffon-zidane-2006.cjs. */
export const FACTS={HAND,HEAD_PT,LANDS,GOAL,CROSS_FROM,ballAt,TOUCH_T,HEAD_T,CROSS_T};
