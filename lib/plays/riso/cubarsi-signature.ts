/** Iconic-play film · Pau Cubarsí, "Signature: the line-breaking pass" — Barcelona 3–1 Napoli, UEFA Champions League round of 16, second
 * leg, Estadi Olímpic Lluís Companys (Montjuïc), Barcelona, Tuesday 12 March 2024 (21:00 CET kick-off, a night match), the 13th minute:
 * seventeen-year-old Cubarsí's pass releases Fermín López beyond the Napoli defence; López brings the ball down and lifts it over Alex Meret
 * but also over the bar.
 *
 * WHY THIS MOMENT: Cubarsí's signature (lib/town/iconicPlays.json, kind "signature", lesson "Look forward first: a pass through the lines
 * skips lots of defenders") is a trait. This is the best-documented single example in the accounts read: on his Champions League debut (he
 * was Player of the Match) the Guardian's report singles out "Cubarsí's outrageous pass" that put López "in again ... beyond the defence",
 * and ESPN's commentary credits the chance to him ("Assisted by Pau Cubarsí"). One pass from a centre-back skipped Napoli's midfield and
 * back line — exactly the signature. The chance was missed (over the bar): the film says so; the goals are only mentioned.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Barcelona's goal line at X=0 and Barcelona attacking +X, Z across,
 * away from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera (Cubarsí on the ball, head up, the long pass
 * over the defence); 2 a TV slow-motion replay from a low camera behind him (he sees López's run; one pass over the midfield and the back
 * line); 3 a second replay from behind Napoli's goal (López brings it down, Meret rushes out, the chip over the keeper and just over the
 * bar); 4 the lesson (the only chapter with teaching marks: look forward first, the two Napoli lines, the pass over both, the skipped
 * defenders ringed). No overlays inside the footage chapters.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, slowly, generic UA, cached in scratchpad/films/src-cache/):
 *  - The Guardian, Sid Lowe, match report, 12 March 2024, "Barcelona ... Napoli" (guardian-barca-napoli-2024.txt): "Five minutes after that,
 *    Cubarsí produced a superb tackle to prevent Osimhen escaping once more ... Soon, López was in again, released by Cubarsí's outrageous
 *    pass. Bringing the ball down, beyond the defence, he lifted it over Alex Meret but also the bar. ... The game was still only 12 minutes
 *    in"; Barcelona 3–1 (4–2 on aggregate); "High on Montjuic"; Cubarsí 17. Lead photo (guardian-barca-napoli-2024-fermin.jpg): Barcelona in
 *    blue-and-garnet stripes, blue shorts, garnet socks; Napoli all in white; a floodlit night.
 *  - ESPN commentary, gameId 691520 (espn-barca-napoli-2024-commentary.txt): "13' Attempt missed. Fermín López (Barcelona) left footed shot
 *    from outside the box is too high. Assisted by Pau Cubarsí."; line-ups with shirt numbers (Cubarsí 33, López 32 playing right of
 *    midfield, Araujo, Koundé RB, Cancelo LB, Christensen, Gündogan, Raphinha, Lewandowski, Yamal; Napoli Meret, Di Lorenzo RB, Mário Rui LB,
 *    Rrahmani, Juan Jesus, Lobotka, Anguissa, Traoré, Politano, Kvaratskhelia, Osimhen); goals López 15', Cancelo 17', Rrahmani 30',
 *    Lewandowski 83'.
 *  - Wikipedia, "Pau Cubarsí" (raw; wiki-pau-cubarsi.txt): "on 12 March, he was named Player of the Match on his UEFA Champions League debut
 *    in a 3–1 victory over Napoli ... at 17 years and 50 days"; born 22 January 2007; 1.83 m; "a ball-playing defender ... his progressive
 *    passing".
 *  - Wikipedia, "2023–24 UEFA Champions League knockout phase" (raw; wiki-2023-24-ucl-ko.txt): 12 March 2024, 21:00, Barcelona 3–1 Napoli,
 *    Estadi Olímpic Lluís Companys (Barcelona's temporary home while Camp Nou was rebuilt), 50,301, referee Danny Makkelie.
 * CONFIRMED: match, date, ground, a night kick-off, 3–1 and the goal minutes; Cubarsí 17, on his Champions League debut, Player of the Match;
 *  the chance ~12–13 minutes in, before any goal; Cubarsí's pass released López beyond the Napoli defence; López brought the ball down,
 *  shot with his LEFT foot from outside the box and lifted it over Meret and over the bar; shirt numbers 33 and 32; the kits (photo).
 * INFERRED (not in the accounts): every position, path and timing; the pass as a long lofted ball (inferred from "bringing the ball down"),
 *  struck with Cubarsí's right foot from inside his own half on the left of the centre-back pair (drawn, never narrated); López's run from
 *  the right into the inside-right channel and his right-foot control; Osimhen pressing the passer; the Napoli back four's and midfield's
 *  places (their names and numbers are not printed or narrated); Meret coming off his line; the goalkeepers' kits (drawn ter Stegen grey,
 *  Meret yellow); Napoli's socks and trim; which end Barcelona attacked on screen; the stadium as drawn (an oval bowl round a covered running
 *  track, floodlight rails on the rim, a roof over the main stand); camera placements, hair and skin tones.
 *
 * Narration text: public/plays/narration/cubarsi-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.8 words/s, see prov()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json
 * exists `withTiming` re-times the action through the cue words and no scene code changes. Cue phrases all start with a plain word.
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Scenes read only their local time t; figures pose on twos. Every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,polyPath,ribbon,blob,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,posed,runCycle,dribble,stand,strike,keeperSet,keeperTip,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.8 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.8+(/[.!?…]$/.test(w)?.35:/[,;:]$/.test(w)?.15:0);}
 const nw=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`cubarsi film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+1).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py cubarsi-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/cubarsi-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/cubarsi-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Montjuïc','Barcelona against Napoli, 2024. Pau Cubarsí is seventeen, in his first Champions League game. On the ball at the back… look up… and a long pass flies over the defence!',
  ['Barcelona against Napoli','Pau Cubarsí','On the ball','look up','long pass flies']),
 prov('The replay','Watch again, slowly. Head up, Cubarsí spots Fermín López running behind the defenders. One pass skips the midfield and the defence.',
  ['Watch again','Head up','Fermín López running','One pass skips','midfield and the defence']),
 prov('The chance','Fermín brings it down and lifts it over the keeper… just over the bar! Barcelona won three-one, and Cubarsí was Player of the Match.',
  ['Fermín brings it down','lifts it over','just over the bar','Barcelona won','Player of the Match']),
 prov('The lesson','Remember Cubarsí’s trick. Look forward first! One pass through the lines skips lots of defenders.',
  ['Remember','Look forward first','One pass through the lines','skips lots of defenders']),
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

// ---------------------------------------------------------------- Montjuïc at night, March 2024: an oval bowl round a (covered) running track
const SCX=52.5,SCZ=34,PE=.5,NS=48,SD=34;
/** a point on the oval: angle th round the pitch centre, d metres out from the track's outer edge, height y (a superellipse) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[SCX+(64+d)*Math.sign(c)*Math.abs(c)**PE,y,SCZ+(46+d)*Math.sign(s)*Math.abs(s)**PE];}
/** one long single-tier rake climbing to ~26 m */
const RAKE=(b:number):[number,number]=>[1+(SD-1)*b,1.4+24.5*b];
type Bowl={seg:V3[][];wall:V3[][];roof:V3[][];lamps:[V3,V3][];track:V3[];trackIn:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],wall:[],roof:[],lamps:[],track:[],trackIn:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1),sn=Math.sin((a+b)/2);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,1,1.4),rim(a,1,1.4)]);
  // the roof over the main (near) stand only
  if(sn<-.62)o.roof.push([rim(a,SD-12,y1+3.4),rim(b,SD-12,y1+3.4),rim(b,SD+1,y1+5),rim(a,SD+1,y1+5)]);
  // floodlight rails along the rim of both long sides (the near one under the roof edge)
  if(Math.abs(sn)>.5&&i%2===0)o.lamps.push(sn<0?[rim(a,SD-11.6,y1+3.1),rim(b,SD-11.6,y1+3.1)]:[rim(a,SD+.4,y1+1.2),rim(b,SD+.4,y1+1.2)]);
  o.track.push(rim(a,0,0));
  const c=Math.cos(a),s=Math.sin(a);o.trackIn.push([SCX+56.5*Math.sign(c)*Math.abs(c)**PE,0,SCZ+38.5*Math.sign(s)*Math.abs(s)**PE]);
  for(let r=0;r<9;r++)for(let k=0;k<2;k++){const h=hash(i*977+r*31+k*7,23);if(h<.16)continue;const[d,y]=RAKE((r+.5)/9);
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,5)-.5)*.5)/2)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam){
 // a March night in Barcelona: a deep printed navy sky
 s.field(K,.8,.5);
 const bowl=new Path2D(),roof=new Path2D(),wall=new Path2D();
 for(const q of BOWL.seg)addFar(bowl,q,c,10);
 for(const q of BOWL.roof)addFar(roof,q,c,10);
 for(const q of BOWL.wall)addFar(wall,q,c,4);
 s.knockout(bowl);s.tone(B,bowl,.3);s.tone(K,bowl,.45);
 // the crowd (50,301): Barcelona blue and garnet, navy coats, a few yellow senyeras, lit faces
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(q.P,c)[2];if(d<14)continue;const p=P3(q.P,c);if(!onScreen(p))continue;const z=clamp(c.F*.6/d,2.4,14);
  inks[q.h<.45?0:q.h<.7?1:q.h<.9?2:3].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.55);s.fill(B,inks[1],.8);s.fill(R,inks[2],.75);s.fill(Y,inks[3],.7);}
 s.knockout(roof);s.fill(K,roof,.92);
 // floodlight rails: lit lamp strips with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b]of BOWL.lamps){bar3(lamp,c,a,b,.9);bar3(glow,c,a,b,3.6);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 // the low wall in front of the stands, then the covered track (a dark band) and the floodlit grass
 s.knockout(wall,.5);s.fill(K,wall,.6);
 const tr=new Path2D();addPoly(tr,BOWL.track,c);s.knockout(tr);s.fill(K,tr,.55);s.tone(B,tr,.45);
 const grass=new Path2D();addPoly(grass,BOWL.trackIn,c);s.knockout(grass);s.fill(Y,grass,.72);s.fill(B,grass,.5);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.16);
 // plain advertising boards along the touchlines and behind the goals (no brands)
 const bd=new Path2D(),board=(a:V3,b:V3)=>addFar(bd,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]],c,2);
 for(let k=0;k<10;k++){board([-3+k*11.1,0,-4],[-3+(k+1)*11.1,0,-4]);board([-3+k*11.1,0,72],[-3+(k+1)*11.1,0,72]);}
 for(let k=0;k<6;k++){board([-6,0,4+k*10],[-6,0,4+(k+1)*10]);board([112.5,0,4+k*10],[112.5,0,4+(k+1)*10]);}
 s.knockout(bd,.4);s.fill(K,bd,.7);s.tone(R,bd,.3);
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
/** A goal at line gx whose net runs out by dir (Napoli's: gx 105, dir +1): white posts and bar, a net (paper haze + navy mesh). */
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
 * negates z both ways — that keeps Cubarsí's RIGHT boot and López's LEFT boot on the correct sides. */
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
// skin: red + yellow screens (the floodlights warm everything)
const LIGHT:InkFill[]=[[R,.22],[Y,.42]],MID:InkFill[]=[[R,.34],[Y,.5],[K,.08]],DARK:InkFill[]=[[R,.45],[Y,.45],[K,.3]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Barcelona 2023–24 home (the Guardian's photo): blue shirts with garnet stripes, blue shorts, garnet socks, yellow numbers */
const barca=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:[R,.9],trim:[R,.8],shorts:[B,.95],socks:[R,.95],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:Y,scale:FIG,...o});
/** Napoli away (the photo): all white; sky-blue trim and numbers (inferred) */
const napoli=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[B,.6],shorts:'paper',socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:B,scale:FIG,...o});
/** Cubarsí: 17, 1.83 m, number 33, light-brown hair */
const CUBARSI:AthleteStyle=barca(LIGHT,{number:33,seed:33,hair:[K,.62],build:{height:1.83,bulk:.97}});
/** Fermín López: number 32, dark-blond hair */
const FERMIN:AthleteStyle=barca(LIGHT,{number:32,seed:32,hair:[Y,.9],build:{height:1.74,bulk:.97}});
const OSIMHEN:AthleteStyle=napoli(DARK,{seed:41,hair:[K,.9],build:{height:1.86}});
const TER_STEGEN:AthleteStyle={shirt:[K,.45],shorts:[K,.7],socks:[K,.45],boots:K,skin:LIGHT,hair:[Y,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
const MERET:AthleteStyle={shirt:[Y,.95],shorts:[K,.8],socks:[Y,.95],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',numberInk:K,scale:FIG,seed:2,build:{height:1.9}};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Cubarsí's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** where he strikes it (inside his own half, left of centre) and where López meets it, beyond Napoli's line */
const P0:[number,number]=[38.5,41],RC:[number,number]=[79.5,30.2];
const T_PASS=0,T_RCV=1.9,APEX=7.6;
/** Napoli's two lines at the pass (the lesson draws them): the midfield three and the back four */
const MID_X=55.2,DEF_X=67.2;
/** Cubarsí's long pass: right foot, facing down the flight */
const C_H=nrm2(RC[0]-P0[0],RC[1]-P0[1]),PASS_DUR=.8,C_START=T_PASS-STRIKE_CONTACT*PASS_DUR,C_POW=.85;
const C_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:C_POW}),CUBARSI.build,placeOf(0,0,C_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[P0[0]-f[0]-C_H[0]*.12,P0[1]-f[2]-C_H[1]*.12];})();
/** López's control: the right foot raised to cushion the dropping ball */
const CUSHION:Pose=posed({lHipF:10,lKnee:30,lAnk:-4,rHipF:50,rKnee:62,rAnk:-6,rHipR:18,lShA:52,rShA:40,lElb:40,rElb:42,lShF:10,rShF:-10,lean:14,neckP:42,pitch:2});
const F_H=nrm2(1,.1);
const F_AT:[number,number]=(()=>{const sk=solve(CUSHION,FERMIN.build,placeOf(0,0,F_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[RC[0]-f[0],RC[1]-f[2]];})();
const RC_Y:number=(()=>{const sk=solve(CUSHION,FERMIN.build,placeOf(F_AT[0],F_AT[1],F_H),FIG);return Math.max(.2,toMy(midSole(sk.rToe,sk.rHeel))[1]+.13);})();
const RCB:V3=[RC[0],RC_Y,RC[1]];
/** the ball drops dead in front of him (T1), he runs onto it, and the chip (left foot) from outside the box */
const T1:[number,number]=add2(RC,F_H,1.1),CHB:[number,number]=[84.3,31.3],LAND:[number,number]=[110.4,34.6];
const T_SHOT=T_RCV+1.55,CHIP_DUR=1.35,CH_POSE=.8,CH_START=T_SHOT-STRIKE_CONTACT*CH_POSE;
const CH_H=nrm2(LAND[0]-CHB[0],LAND[1]-CHB[1]);
const CH_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.5}),FERMIN.build,placeOf(0,0,CH_H),FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[CHB[0]-f[0]-CH_H[0]*.12,CHB[1]-f[2]-CH_H[1]*.12];})();
/** the chip's apex: high enough to clear the bar (2.44 m) with room, at the goal line */
const GL_U=(105-CHB[0])/(LAND[0]-CHB[0]),CHIP_H=3.15/(4*GL_U*(1-GL_U)),T_BAR=T_SHOT+GL_U*CHIP_DUR;
type Track={id:string;style:AthleteStyle;keys:number[][]};
const CUB_KEYS=[[-7,30.5,43.9],[-4.5,32.6,43.4],[-2.2,34.8,42.6],[C_START,...C_AT],[T_PASS+1.2,...C_AT],[T_SHOT+2,C_AT[0]+4,C_AT[1]-1]];
const FER_A:[number,number]=add2(F_AT,F_H,-2.9),FER_KEYS=[[-7,55.5,21.5],[-3,59,23],[-1,63,25],[0,66.4,26.3],[1,72.4,28.1],[T_RCV-.42,...FER_A],[T_RCV-.12,...F_AT],[T_RCV+.4,...F_AT],[CH_START,...CH_AT]];
const OSI_KEYS=[[-7,50,36.5],[-3,46,38],[-1,43.8,39.2],[0,42.9,39.6],[T_RCV,43.8,39.3],[T_SHOT+2,47,38]];
const MER_KEYS=[[-7,100.8,34],[0,100.3,33.9],[T_RCV,96.4,33.3],[T_SHOT-.1,93.4,33],[T_SHOT+3,92.9,33]];
const TRACKS:Track[]=[
 {id:'cubarsi',style:CUBARSI,keys:CUB_KEYS},
 {id:'fermin',style:FERMIN,keys:FER_KEYS},
 {id:'osimhen',style:OSIMHEN,keys:OSI_KEYS},
 // Napoli's back four (a high line, level at the pass) and midfield three; attackers (positions illustrative, no numbers printed)
 {id:'n-lcb',style:napoli(DARK,{seed:43}),keys:[[-7,70,30.5],[-2,68,29.2],[0,67.4,28.6],[.6,68.2,28.9],[T_RCV,74,29.6],[T_SHOT,80.6,30.4],[T_SHOT+3,85,31.5]]},
 {id:'n-rcb',style:napoli(MID,{seed:44}),keys:[[-7,70.5,40.5],[-2,68.2,39.4],[0,67.6,39],[T_RCV,73,37],[T_SHOT,79.2,35.4],[T_SHOT+3,83,34.5]]},
 {id:'n-lb',style:napoli(LIGHT,{seed:45}),keys:[[-7,66.5,13.5],[0,66,14.5],[T_RCV,70,18],[T_SHOT,75,22],[T_SHOT+3,79,25]]},
 {id:'n-rb',style:napoli(LIGHT,{seed:46}),keys:[[-7,66.5,56],[0,66.2,55],[T_RCV,69,51],[T_SHOT,73,47],[T_SHOT+3,77,44]]},
 {id:'n-m1',style:napoli(LIGHT,{seed:47,hairStyle:'bald'}),keys:[[-7,57,37],[0,55,38],[T_RCV,57,36.5],[T_SHOT,61,35],[T_SHOT+3,65,34]]},
 {id:'n-m2',style:napoli(DARK,{seed:48}),keys:[[-7,58,27],[0,55.5,29],[T_RCV,59,29],[T_SHOT,63,29.5],[T_SHOT+3,67,30]]},
 {id:'n-m3',style:napoli(DARK,{seed:49}),keys:[[-7,57,48],[0,55,47],[T_RCV,58,45],[T_SHOT,62,44],[T_SHOT+3,66,43]]},
 {id:'n-lw',style:napoli(LIGHT,{seed:50,hair:[K,.7]}),keys:[[-7,50,15],[0,48,17],[T_SHOT,52,20],[T_SHOT+3,55,21]]},
 {id:'n-rw',style:napoli(LIGHT,{seed:51}),keys:[[-7,51,57],[0,49,55],[T_SHOT,53,53],[T_SHOT+3,56,52]]},
 {id:'b-rcb',style:barca(MID,{seed:20}),keys:[[-7,33,24],[0,37,24],[T_SHOT,45,25],[T_SHOT+3,49,26]]},
 {id:'b-rb',style:barca(LIGHT,{seed:21,hairStyle:'curly'}),keys:[[-7,44,8],[0,48,8],[T_SHOT,56,8.5],[T_SHOT+3,61,9]]},
 {id:'b-lb',style:barca(LIGHT,{seed:22}),keys:[[-7,45,60],[0,49,60],[T_SHOT,57,60],[T_SHOT+3,62,59]]},
 {id:'b-cm',style:barca(LIGHT,{seed:23,hair:[Y,.7]}),keys:[[-7,45,33],[0,47,34],[T_SHOT,53,34],[T_SHOT+3,57,34]]},
 {id:'b-m2',style:barca(LIGHT,{seed:24}),keys:[[-7,58,44],[0,60,43],[T_SHOT,68,42],[T_SHOT+3,73,41]]},
 {id:'b-st',style:barca(LIGHT,{seed:25}),keys:[[-7,65.5,37],[0,66.4,36],[T_SHOT,77,37.5],[T_SHOT+3,82,37.5]]},
 {id:'b-lw',style:barca(MID,{seed:26}),keys:[[-7,65,58],[0,66,56],[T_SHOT,76,51],[T_SHOT+3,80,48]]},
 {id:'b-rw',style:barca(DARK,{seed:27,hairStyle:'curly'}),keys:[[-7,66,6],[0,66.8,7],[T_SHOT,76,12],[T_SHOT+3,80,15]]},
];
const TS_KEYS=[[-7,15,34],[0,17,34.5],[T_SHOT,21,35],[T_SHOT+3,22,35]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.2);for(let t=-7;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Cubarsí's carry, the long lofted pass over both Napoli lines, López's cushion (right foot), the ball dropping
 * dead in front of him, his run onto it, the left-foot chip over Meret and over the bar, landing on the net behind. */
function ballAt(T:number):V3{
 const p0:V3=[P0[0],.11,P0[1]],t1:V3=[T1[0],.11,T1[1]],chb:V3=[CHB[0],.11,CHB[1]];
 if(T<C_START){const p=trackAt(CUB_KEYS,T),v=velAt(CUB_KEYS,T),s=Math.hypot(v[0],v[1])||1,k=.6+.4*Math.max(0,Math.sin(T*TAU/.8));return[p[0]+v[0]/s*k,.11,p[1]+v[1]/s*k];}
 if(T<T_PASS){const p=trackAt(CUB_KEYS,C_START-.05),v=velAt(CUB_KEYS,C_START-.1),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,p0,sm(C_START,T_PASS,T,easeInOutSine));}
 if(T<T_RCV){const u=(T-T_PASS)/(T_RCV-T_PASS);return lerp3(p0,RCB,u,APEX);}
 if(T<T_RCV+.45){const u=clamp((T-T_RCV)/.45);return[lerp(RCB[0],t1[0],easeOut(u)),lerp(RCB[1],.11,u*u),lerp(RCB[2],t1[2],easeOut(u))];}
 if(T<T_SHOT)return lerp3(t1,chb,sm(T_RCV+.45,T_SHOT,T,t=>t*(1.6-.6*t)));
 // the chip: over Meret, over the bar, down behind the goal (then a small hop on the track)
 const u=(T-T_SHOT)/CHIP_DUR;
 if(u<1)return[lerp(chb[0],LAND[0],u),4*CHIP_H*u*(1-u)+.11,lerp(chb[2],LAND[1],u)];
 const w=clamp((u-1)*CHIP_DUR/.7);return[LAND[0]+.9*easeOut(w),.11+.5*4*w*(1-w),LAND[1]+.1*w];
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
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const up=clamp(b[1]/Math.max(3,Math.hypot(b[0]-x,b[2]-z)),0,1.2);
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=(.25-up*.9)*w;return clampPose(p);}
/** the look: head up from the ball, a glance right (toward López's run — − in the athlete's yaw), back to the ball for the strike */
const LOOK=[[-2,0,0],[-1.55,1,-.15],[-1.05,1,-.6],[-.62,.85,-.5],[C_START+.05,0,0]];
const lookAt=(T:number):[number,number]=>T<-2||T>C_START+.05?[0,0]:(()=>{const v=keyPath(T,LOOK,easeInOutSine);return[v[0],v[1]];})();
/** Cubarsí: the carry out of defence, head up, the look, the long right-foot pass, watching it fly */
function cubarsiState(T:number):St{
 if(T<C_START){const st=runState(CUB_KEYS,T,yawTo([1,-.08],C_H,sm(-1,C_START,T)));
  let pose=blendPose(st.pose,dribble(strideAt(CUB_KEYS,T)*.9/3.4,{foot:'r',speed:.35}),.55);const[up,turn]=lookAt(T);
  pose={...pose,neckP:pose.neckP-.75*up,lean:pose.lean-.12*up,neckY:pose.neckY+turn,twist:pose.twist+turn*.3};
  return{pose:clampPose(pose),place:st.place};}
 const u=clamp((T-C_START)/PASS_DUR),sp=placeOf(C_AT[0],C_AT[1],C_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:C_POW}),place:sp};
 if(T<T_PASS+1.2){const pose=keyPoses(clamp((T-C_START-PASS_DUR)/.7),[[0,strike(1,{foot:'r',power:C_POW})],[1,stand()]]);return{pose:lookAtBall({pose,place:sp},T,.8),place:sp};}
 const st=runState(CUB_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};
}
/** hands on head: so close */
const HANDS:Pose=posed({lHipF:12,rHipF:12,lKnee:18,rKnee:18,lAnk:-4,rAnk:-4,lean:4,pitch:2,neckP:-14,lShF:150,rShF:150,lShA:60,rShA:60,lElb:140,rElb:140});
/** López: the run beyond the line, head up at the ball, the cushion (right foot), onto it, the left-foot chip, hands on head */
function ferminState(T:number):St{
 if(T<T_RCV-.42){const st=runState(FER_KEYS,T);return{pose:lookAtBall(st,T,T>0?.9:.5),place:st.place};}
 if(T<T_RCV+.4){const st=runState(FER_KEYS,T,F_H),a=runState(FER_KEYS,T_RCV-.42).pose;
  const ctl=keyPoses(clamp((T-T_RCV+.42)/.82),[[0,a],[.42,CUSHION],[.62,CUSHION],[1,blendPose(CUSHION,stand(),.7)]]);
  return{pose:ctl,place:placeOf(F_AT[0],F_AT[1],F_H)};}
 if(T<CH_START){const st=runState(FER_KEYS,T,yawTo(F_H,CH_H,sm(T_RCV+.4,CH_START,T)));
  const pose=blendPose(blendPose(CUSHION,stand(),.7),blendPose(st.pose,dribble(strideAt(FER_KEYS,T)*.9/3.4,{foot:'l',speed:.6}),.4),sm(T_RCV+.4,T_RCV+.65,T));
  return{pose:clampPose(pose),place:st.place};}
 const u=clamp((T-CH_START)/CH_POSE),sp=placeOf(CH_AT[0],CH_AT[1],CH_H);
 if(u<1)return{pose:strike(u,{foot:'l',power:.5}),place:sp};
 const pose=lookAtBall({pose:keyPoses(clamp((T-CH_START-CH_POSE)/.6),[[0,strike(1,{foot:'l',power:.5})],[1,stand()]]),place:sp},T,.8);
 return{pose:blendPose(pose,HANDS,sm(T_BAR+.05,T_BAR+.55,T,easeInOutSine)),place:sp};
}
/** Meret: off his line when the pass is lofted, set, then the leap as the chip goes over him */
const TIP_START=T_SHOT+.1,TIP_DUR=.95;
function meretState(T:number):St{
 const [x,z]=trackAt(MER_KEYS,T),b=ballAt(T),h=nrm2(b[0]-x,b[2]-z);
 if(T<TIP_START){const v=velAt(MER_KEYS,T),sp=Math.hypot(v[0],v[1]);const run=runCycle(strideAt(MER_KEYS,T)*.9/4,{speed:.4});
  return{pose:blendPose(keeperSet(T*1.3),run,clamp((sp-.5)/1.5)),place:placeOf(x,z,T<T_RCV?nrm2(-1,0):h)};}
 const u=clamp((T-TIP_START)/TIP_DUR);return{pose:keeperTip(u,{hand:'r'}),place:placeOf(x,z,nrm2(-1,.05))};
}
function tsState(T:number):St{const[x,z]=trackAt(TS_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='cubarsi')return cubarsiState(T);if(id==='fermin')return ferminState(T);if(id==='meret')return meretState(T);if(id==='terstegen')return tsState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.55),place:st.place};
}
const HEROES=['cubarsi','fermin','osimhen','meret'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keepers, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'meret','terstegen'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='meret'?MERET:id==='terstegen'?TER_STEGEN:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='cubarsi'&&Math.abs(T-T_PASS)<.25)||(id==='fermin'&&(T<T_RCV-.4&&T>-.3||Math.abs(T-T_SHOT)<.2))||(id==='meret'&&T>TIP_START&&T<TIP_START+.6);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_PASS)<.3||Math.abs(T-T_RCV)<.3||Math.abs(T-T_SHOT)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera in the main stand: in on Cubarsí on the ball, then wide as the long pass flies over Napoli's line. */
const MAIN_CAM:V3=[50,19,-36];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.2],[q[2],-3.2],[q[3],-1.5],[q[4],-.05],[S,T_RCV+.35]]);};
const cam1=(t:number)=>{const q=Q(0),T=t1(t),b=ballAt(T),cb=trackAt(CUB_KEYS,Math.min(T,C_START));
 const focus=sm(q[1]-.2,q[1]+.9,t,easeInOutSine)*(1-sm(q[3]-.4,q[4]+.2,t,easeInOutSine));// "Pau Cubarsí … on the ball … look up": in on him
 // wide: Cubarsí and Napoli's lines in one frame, then the broadcast pan with the ball to López
 const fl=sm(-.1,T_RCV,T,easeInOutSine);
 const wide:[number,number]=[lerp(lerp(cb[0]+9,52,sm(-2.4,-.2,T,easeInOutSine)),lerp(b[0],RC[0]-5,.5),fl),lerp(39,33,fl)];
 const tx=lerp(wide[0],cb[0]+1.5,focus),tz=lerp(wide[1],cb[1],focus),F=lerp(lerp(4800,3300,sm(-2.4,-.2,T,easeInOutSine)),11500,focus);
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t);drawPlay(s,t1(twos(t)),c,{wide:true,ballScale:lerp(2.4,1.3,clamp((c.F-4800)/6700))});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[4]+.9;},
};
/** 2 · TV slow-motion replay from a low camera behind Cubarsí's left shoulder: head up, the glance at López's run, the pass sailing over
 * Napoli's midfield and back line. */
const LOW_CAM:V3=[27.6,3.8,50.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-2.3],[q[1],-1.75],[q[2],-1.1],[q[3],-.05],[q[4],.95],[S,1.8]]);};
const cam2=(t:number)=>{const T=t2(t),c=trackAt(CUB_KEYS,Math.min(T,C_START)),look=sm(-1.4,-.7,T,easeInOutSine),fl=sm(0,1.6,T,easeInOutSine),b=ballAt(T);
 const tx=lerp(lerp(c[0]+5,60,look),lerp(b[0],72,.55),fl),tz=lerp(lerp(c[1]-1.5,33,look),lerp(b[2],31,.55),fl),ty=lerp(.9,lerp(.6,Math.min(2.2,b[1]*.3),fl),look);
 return camAt(LOW_CAM,[tx,ty,tz],lerp(2100,2000,look));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.7});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(1)[3]+.8;},
};
/** 3 · the second replay from a raised camera behind Napoli's goal: López brings it down, Meret rushes out, the chip over him and just
 * over the bar, toward the lens. */
const GOAL_CAM:V3=[113.5,4.6,19.5];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_RCV-.8],[q[0]+.3,T_RCV+.05],[q[1]+.25,T_SHOT],[q[2]+.2,T_BAR],[q[3],T_SHOT+CHIP_DUR+.3],[S,T_SHOT+CHIP_DUR+2.4]]);};
const cam3=(t:number)=>{const T=t3(t),f=trackAt(FER_KEYS,Math.min(T,CH_START)),b=ballAt(T),go=sm(T_SHOT,T_BAR,T,easeInOutSine),back=sm(T_BAR+.3,T_BAR+2,T,easeInOutSine);
 const tx=lerp(lerp(f[0]+1,b[0],.3),lerp(100.5,94,back),go),ty=lerp(1.1,lerp(2.6,1.3,back),go),tz=lerp(lerp(f[1],b[2],.3),33.5,go),F=lerp(lerp(3900,2100,go),2300,back);
 return camAt(GOAL_CAM,[tx,ty,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(2)[2]+.5;},
};
/** 4 · the lesson plate: the moment from a raised camera behind Cubarsí, with bold yellow teaching marks — a ring round him and a look
 * arrow forward (look forward first), Napoli's two lines as dashed bars across the pitch, the pass arc over both to López, and a ring
 * popping on every Napoli player the pass skipped. */
const LESSON_CAM:V3=[20,15,10];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.2],[q[1],-.8],[q[2],-.05],[q[2]+1.8,T_RCV-.1],[S,T_RCV+.2]]);};
const cam4=(t:number)=>camAt(LESSON_CAM,[53,0,36],lerp(1560,1500,sm(0,SECS(3),t,easeInOutSine)));
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D,ink=Y){s.stroke(K,p,5,.9);s.knockout(p);s.fill(ink,p,.95);}
/** a bold teaching arrow along points (drawn to `u`), one path: shaft + head */
function arrowPts(s:Sheet,pts:Pt[],w:number,seed:number,u=1){if(u<=.01||pts.length<2)return;const n=Math.max(2,Math.ceil(pts.length*u)),q=pts.slice(0,n),e=q[q.length-1],d=q[q.length-2],an=Math.atan2(e[1]-d[1],e[0]-d[0]),hl=w*2.4;
 const back:Pt=[e[0]-Math.cos(an)*hl*.8,e[1]-Math.sin(an)*hl*.8],p=new Path2D();p.addPath(ribbon([...q.slice(0,-1),back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam,ink=Y){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring,ink);}
/** a dashed bar across the pitch at x (a Napoli line), drawn to u */
function lineBar(s:Sheet,x:number,c:Cam,u:number,seed:number){if(u<=.01)return;const p=new Path2D(),N=14;for(let i=0;i<N;i+=1){const z0=6+56*i/N,z1=z0+56/N*.6;if(z0>6+56*u)break;
 const a=G(x,z0,c),b=G(x,Math.min(z1,6+56*u),c);p.addPath(ribbon([a,b],Math.max(8,.5*P3([x,0,z0],c)[2]),{seed:seed+i,taper:0,wobble:.5}));}
 s.stroke(K,p,4,.85);s.knockout(p,.85);s.fill(Y,p,.85);}
/** the Napoli players the pass skipped: the midfield three and the back four (the ids between the passer and López) */
const SKIPPED=['n-m2','n-m1','n-m3','n-lb','n-lcb','n-rcb','n-rb'];
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "Remember": a yellow ring on the grass round Cubarsí
  const cp=cubarsiState(T).place,cx=cp.x!,cz=-cp.z!,hal=sm(.1,.5,t,easeOutBack);
  if(hal>.01)groundRing(s,cx,cz,1.3*hal,c);
  // "the lines": Napoli's midfield and back line as dashed yellow bars across the pitch
  const l1=sm(q[2]-.2,q[2]+.5,t,easeInOutSine),l2=sm(q[2]+.2,q[2]+.9,t,easeInOutSine);
  lineBar(s,MID_X,c,l1,70);lineBar(s,DEF_X,c,l2,90);
  // "skips lots of defenders": a ring pops on each skipped Napoli player, one after another
  SKIPPED.forEach((id,i)=>{const g=sm(q[3]+i*.14,q[3]+i*.14+.3,t,easeOutBack);if(g<.01)return;const p=stateOf(id,T).place;groundRing(s,p.x!,-p.z!,.95*g,c,R);});
  drawPlay(s,T,c,{ballScale:1.8,noStadium:true});
  // "Look forward first": a look arrow from his head, forward over the lines
  const look=sm(q[1],q[1]+.6,t,easeInOutSine)*(1-sm(q[2]+.4,q[2]+.9,t));
  if(look>.01){const h=P3([cx+.4,2.3,cz],c),e=G(cx+16,cz-3.2,c,2.3),pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8;pts.push([lerp(h[0],e[0],u),lerp(h[1],e[1],u)-Math.sin(u*Math.PI)*18]);}
   arrowPts(s,pts,Math.max(9,.18*h[2]),31,look);}
  // "One pass through the lines": the pass arc from his boot, over both lines, to López
  const arc=sm(q[2]+.3,q[2]+1.6,t,easeInOutSine);
  if(arc>.01){const pts:Pt[]=[];for(let i=0;i<=18;i++){const u=i/18,p=lerp3([P0[0],.11,P0[1]],RCB,u,APEX);pts.push(G(p[0],p[2],c,p[1]));}
   arrowPts(s,pts,Math.max(10,.2*P3([60,0,35],c)[2]),41,arc);}
  // a tick burst where López meets it
  const stamp=sm(q[2]+1.7,q[2]+2,t,easeOutBack)*(1-sm(q[3]-.1,q[3]+.3,t));
  if(stamp>.002){const bp=P3(RCB,c);sparkBurst(s,Y,bp[0],bp[1],1.1*bp[2],{n:10,seed:61,g:clamp(stamp),width:.08*bp[2]});}
  frame(s);
 },
 get still(){return Q(3)[3]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'cubarsi-signature',format:'11v11',title:'Cubarsí: the line-breaking pass',theme:'Look forward first: one pass through the lines skips lots of defenders',
 ageNote:'Barcelona 3–1 Napoli · Champions League, 12 March 2024 · Estadi Olímpic, Montjuïc',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Barcelona's goal line at X=0, Z across) — checked by tests/play-film-cubarsi-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1]};};
export const FACTS={P0,RC,RCB,T1,CHB,LAND,MID_X,DEF_X,T_PASS,T_RCV,T_SHOT,T_BAR,C_START,CH_START,SKIPPED,ballAt,lookAt,
 cubarsiFeet:(T:number)=>feet(cubarsiState(T),CUBARSI.build),
 ferminFeet:(T:number)=>feet(ferminState(T),FERMIN.build),
 at:(id:string,T:number)=>{const st=stateOf(id,T);return[st.place.x!,-st.place.z!] as [number,number];}};
