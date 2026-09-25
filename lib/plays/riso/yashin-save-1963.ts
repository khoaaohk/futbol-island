/** Iconic-play film · Lev Yashin, "the Black Spider in the air" — the boxer's punch from Jimmy Greaves's power drive: England 2–1 Rest of the
 * World, the FA Centenary match, Wednesday 23 October 1963, Wembley Stadium, London (the card id keeps its stub name, yashin-save-1963).
 *
 * WHY THIS MOMENT (the entry is kind:"signature", "commanding his area, all in black"): Yashin's fame rested on NOT waiting on his line —
 * he shouted orders, came off his line and was among the first keepers to PUNCH instead of catch (Wikipedia, citing FIFA). In the 1963
 * Match of the Century, the game that fixed the "Black Spider" name for the world, Norman Giller describes one save that is exactly that
 * signature: Greaves "fired in a power drive that most goalkeepers would have tried to either tuck away around a post or over the bar. But
 * the unpredictable Russian met it with a boxer's punch that sent the ball screaming back to the halfway line. Greaves and Yashin then fell
 * into each other's arms laughing". That one moment is recreated here.
 *
 * A faithful recreation rendered as a riso print (a 1960s broadcast, so an old-newsreel feel: warm paper, heavier grain, a soft vignette and
 * film scratches on the footage chapters only): one 3D choreography in pitch metres (X along the pitch to the World XI goal line at X=105,
 * Z across from the near touchline, Y up) seen through TV cameras — 1 live, the high main camera on the side (Yashin all in black on his line,
 * waving his defenders into place; Greaves running at the World XI defence; the drive; Yashin comes out and punches it back toward halfway),
 * 2 the TV slow-motion replay from a low angle beside Greaves (Yashin off his line, the step, the punch), 3 a second angle high behind the goal
 * (the ball flying away; Greaves and Yashin fall into each other's arms laughing), 4 the lesson (the only chapter with teaching marks: shout
 * waves over the defence, footprints off the line to the punch, the area lit up as his home). No teaching overlays inside the footage.
 *
 * SOURCES (read 23 Sep 2026 as raw pages; cached under the build scratchpad films/src-cache/):
 *  - England Football Online, match 373 (England 2 Rest of the World 1, 23 Oct 1963): match summary + reports by Mike Payne, Norman Giller and
 *    Glen Isherwood — http://www.englandfootballonline.com/Seas1960-70/1963-64/M0373RoW1963.html  (efo-373.txt)
 *  - Wikipedia, "1963 England v Rest of the World football match" (raw wikitext: date, venue, line-ups, kits)  (wiki-1963-eng-row.txt)
 *  - Wikipedia, "Lev Yashin" (raw wikitext: all-black outfit "in truth very dark blue", vocal, came off his line, punched balls, the
 *    1963 match fixing the Black Spider name, tall stature)  (wiki-lev-yashin.txt)
 *  - Wikimedia Commons, "Bobby Moore vs Josef Masopust 1963.jpg" (a photo from the match: England long-sleeved white shirts, dark shorts,
 *    white socks; World XI long-sleeved dark shirts with a white collar and cuffs, white shorts; packed terraces; a roof over the stand)
 * CONFIRMED by those accounts: 23 October 1963, kick-off 2.45 pm, Wembley, about 87,000–100,000 people, the FA's centenary; Yashin in goal
 * for the Rest of the World in the first half only (off at half-time, Šoškić on); the first half goalless; Greaves tested Yashin again and
 * again ("three times ... to the full" — Payne; "a sixth time" on the half hour — Giller); on the half hour Greaves's power drive, met by
 * Yashin with "a boxer's punch that sent the ball screaming back to the halfway line", then the two "fell into each other's arms laughing"
 * (Giller); Yashin's all-black kit ("Man in Black" — Giller; "all-black outfit" — Wikipedia); his habits of shouting orders, coming off his
 * line and punching (Wikipedia/FIFA); kits: England white shirts, dark blue shorts, white socks; the World XI blue shirts, white shorts, blue
 * socks (EFO "Colours"); numbers from the line-ups (Greaves 8; Djalma Santos 2, Schnellinger 3, Pluskal 4, Popluhár 5, Masopust 6; Smith 9,
 * Eastham 10, Charlton 11, Paine 7).
 * INFERRED (illustrative, never narrated): which end and which side of the box; every position, run, path and timing in metres and seconds
 * (the drive from ≈ 17 m, ≈ 25 m/s, at chest height; Yashin ≈ 1.5 m off his line when it is struck and a ≈ 1.4 m step into the punch);
 * Greaves's LEFT foot (Mike Payne's report has Yashin "nonchalantly" punching away a Greaves left-foot shot in the first half — possibly the
 * same save, possibly another); the punching hand (right, one fist, per "a boxer's punch"); Yashin's arm-waving before the shot (his known
 * habit, not described for this moment); Greaves's hands on his head; the hug choreography; the ball's flight path and bounces; which other
 * players were near and where; Yashin's cap (not drawn), gloves (none drawn), shirt number (none drawn), height 1.89 m; the leather ball's
 * colour; the camera placements and lenses; the weather (a flat, overcast-looking London afternoon).
 *
 * FIGURES: every body through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the drive and the punch). Handedness: athlete.ts is right-handed; this pitch (X to the goal, Z away from
 * the main camera) is left-handed, so the projector negates z both ways (as in the approved Banks film) — Greaves's strike({foot:'l'}) is his
 * LEFT foot. The camera frames the whole sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter
 * cues so recorded narration re-times the drawing; poses on twos. Heat: wide shots print every figure at 'low'; heroes at 'auto'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,twosIndex,sm,clamp,lerp,keyPath,rng,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,smoothPts,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,posed,keyPoses,runCycle,stand,strike,keeperSet,STRIKE_CONTACT,type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The Black Spider',text:'Wembley, 1963. England play the Rest of the World. In goal, all in black, is Lev Yashin, the Black Spider. Jimmy Greaves hits a rocket... but Yashin punches it all the way back to halfway!',tail:1.6,
  cues:['Wembley','England play','In goal','Jimmy Greaves','punches it','back to halfway']},
 {label:'Watch again',text:"Watch again, slowly. Yashin doesn't wait on his line. He steps out and meets the ball with a boxer's punch!",tail:1.6,
  cues:['Watch again',"doesn't wait",'steps out',"boxer's punch"]},
 {label:'Friends',text:"Greaves can't believe it. The two stars fall into each other's arms, laughing!",tail:2.2,
  cues:['Greaves','fall into','laughing']},
 {label:'The lesson',text:'Yashin shouted orders to his defenders. So shout loud, come for the ball with confidence. Your area is your home!',tail:2.2,
  cues:['Yashin shouted','shout loud','come for the ball','Your area']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/yashin-save-1963/timing.json, add
 *   import timingJson from '../../../public/plays/narration/yashin-save-1963/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/yashin-save-1963/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('yashin: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('yashin: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** Piecewise-linear map from chapter time to play time (anchors kept increasing, so crowded voice timings can never fold it). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}

// ---------------------------------------------------------------- inks, shapes
const K='navy',Y='yellow',O='orange',B='blue';
/** Consistent winding so overlapping parts of one figure union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;

// ---------------------------------------------------------------- old Wembley in 3D: roofed terraces, the running track, the pitch, the goal
type Stand={a:[number,number];b:[number,number];out:[number,number]};
/** the terraces sit back beyond the cinder track that ringed the old Wembley pitch */
const STANDS:Stand[]=[
 {a:[-60,80],b:[165,80],out:[0,1]},    // far side
 {a:[117,-58],b:[117,126],out:[1,0]},   // behind the World XI goal
 {a:[-60,-12],b:[165,-12],out:[0,-1]}, // main stand (the side camera sits in it)
 {a:[-12,-58],b:[-12,126],out:[-1,0]},  // the far end
];
const TIER_INK:[string,number][]=[[K,.32],[O,.2],[B,.3],[K,.2],[O,.32],[B,.2],[K,.45],[Y,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.5),P(0,40,1.2+40*.5)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=22;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.34,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.5+lift,y1=1.2+d1*.5+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}
  // the roof over the terraces (the whole bowl was roofed for 1963): a dark slab, its front edge on a line of pillars
  addPoly(roof,[P(0,14,23.5),P(1,14,23.5),P(1,42,24.6),P(0,42,24.6)],c);}
 s.fill(Y,concrete,.2);s.tone(O,concrete,.15);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.62);s.stroke(K,roof,2,.7);
 s.fill(O,wall,.25);s.fill(Y,wall,.45);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
 // the cinder track, then the grass (Wembley's "lush turf": yellow + blue = green, mown stripes)
 const track=new Path2D();addPoly(track,[[-12,0,-12],[117,0,-12],[117,0,80],[-12,0,80]],c);s.fill(O,track,.42);s.tone(K,track,.14);
 const grass=new Path2D();addPoly(grass,[[-4,0,-4],[109,0,-4],[109,0,72],[-4,0,72]],c);s.knockout(grass);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,-4],[(i+1)*5.25,0,-4],[(i+1)*5.25,0,72],[i*5.25,0,72]],c);s.tone(B,stripes,.2);
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
/** The World XI goal: white posts and bar, a net (paper haze + navy mesh) back to the stanchions. */
function goal(s:Sheet,c:Cam){
 const g=GOAL,net=new Path2D();
 addPoly(net,[[g.x,0,g.z0],[g.back,0,g.z0],[g.back,g.backH,g.z0],[g.x,g.h,g.z0]],c);addPoly(net,[[g.x,0,g.z1],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.x,g.h,g.z1]],c);
 addPoly(net,[[g.back,0,g.z0],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);addPoly(net,[[g.x,g.h,g.z0],[g.x,g.h,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);
 s.knockout(net,.32);
 const k0=P3([g.x,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
 for(let z=g.z0;z<=g.z1+.01;z+=sp){seg([g.back,0,z],[g.back,g.backH,z]);seg([g.x,g.h,z],[g.back,g.backH,z]);}
 for(let y=0;y<=g.backH+.01;y+=sp){seg([g.back,y,g.z0],[g.back,y,g.z1]);for(const z of[g.z0,g.z1])seg([g.x,y*g.h/g.backH,z],[g.back,y,z]);}
 for(let x=g.x;x<=g.back+.01;x+=sp)for(const z of[g.z0,g.z1])seg([x,0,z],[x,lerp(g.h,g.backH,(x-g.x)/(g.back-g.x)),z]);
 s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(5,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([g.x,0,g.z0],[g.x,g.h,g.z0]));fr.addPath(post([g.x,0,g.z1],[g.x,g.h,g.z1]));fr.addPath(post([g.x,g.h,g.z0-.06],[g.x,g.h,g.z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
 const stan=new Path2D();for(const z of[g.z0,g.z1]){const a=P3([g.back,0,z],c),b=P3([g.back,g.backH,z],c),d=P3([g.x,g.h,z],c);if(a[2]>0&&b[2]>0&&d[2]>0){stan.moveTo(a[0],a[1]);stan.lineTo(b[0],b[1]);stan.lineTo(d[0],d[1]);}}
 s.stroke(K,stan,Math.max(2,.03*k0),.7);
}
/** the 1960s newsreel: a soft vignette and a couple of film scratches that change every drawn frame (footage chapters only) */
function newsreel(s:Sheet,t:number,k=1){
 const v=new Path2D();v.rect(-1400,-1000,2800,2000);v.ellipse(0,0,860,610,0,0,TAU,true);s.tone(K,v,.2*k);
 const n=twosIndex(t),r=rng(n*7919+13),sc=new Path2D();
 for(let i=0;i<2;i++){if(r()<.45)continue;const x=(r()-.5)*1300,y0=-700+r()*300,len=500+r()*800;sc.addPath(ribbon([[x,y0],[x+(r()-.5)*30,y0+len]],2+r()*2.5,{seed:n+i,taper:.6,wobble:.5}));}
 s.fill(K,sc,.45*k);
 if(r()<.5)dust(s,K,(r()-.5)*1100,(r()-.5)*700,40,4,{seed:n,size:3,cov:.5*k});
}

// ---------------------------------------------------------------- figures: the shared athlete library (ONE adapter: drawPlayer)
/** athlete.ts is right-handed (y up); this pitch is left-handed, so the adapter negates z both ways (Greaves's left foot stays his left). */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (pitch metres) facing heading h (pitch x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
type St={pose:Pose;place:Place};
/** THE one body adapter: every figure in the film prints through here → athlete.ts (smear first on fast moves, then the body with `prev`). */
function drawPlayer(s:Sheet,st:St,pr:St|null,c:Cam,style:AthleteStyle,o:{smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&pr)motionSmear(s,pr.pose,st.pose,pc,style,st.place,{prevPlace:pr.place,ink:[K,.35]});
 drawAthlete(s,st.pose,pc,style,st.place,pr?{prev:pr.pose,prevPlace:pr.place}:{});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[O,.2]],MID:InkFill[]=[[O,.7],[Y,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** the World XI: blue shirts with a white collar and cuffs, white shorts, blue socks (EFO "Colours" + the Moore/Masopust photograph) */
const world=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',number:n,numberInk:'paper',scale:FIG,seed:n+20,...o});
/** England: long-sleeved white shirts, dark blue shorts, white socks */
const england=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:'paper',shorts:[K,.85],socks:'paper',boots:K,skin:LIGHT,hair:[K,.75],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',number:n,numberInk:K,scale:FIG,seed:n,...o});
/** Yashin head to toe in black ("in truth very dark blue") — solid navy, long sleeves; tall (1.89 m); no cap, gloves or number drawn */
const YASHIN:AthleteStyle={shirt:K,trim:K,shorts:K,socks:K,boots:K,skin:LIGHT,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.35],sleeves:'long',scale:FIG,seed:1,build:{height:1.89,bulk:1.02}};
const GREAVES=england(8,{hair:[K,.9],build:{height:1.73,bulk:.95}});

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Greaves on the ball at the edge of the D)
type Track={id:string;style:AthleteStyle;keys:number[][]};
const GREAVES_KEYS=[[-7.5,60,17],[-4,68,21],[-1.5,75,24.5],[0,79.5,27],[1,84.6,29.6],[1.75,87.4,31],[1.9,87.9,31.3],[2.6,89.6,31.9],[3.3,90.3,32.1],[3.9,90.5,32.1],[5.7,98.74,32.3],[12,98.74,32.3]];
const TRACKS:Track[]=[
 // the World XI defence
 {id:'popluhar',style:world(5,{hair:[K,.7]}),keys:[[-7.5,95,38],[-4,95,37.5],[0,94,35.5],[1.9,92.4,33.6],[2.6,92.2,33.4],[4,90,32.5],[8,84,32],[12,80,32]]},
 {id:'schnellinger',style:world(3,{hair:[Y,.6]}),keys:[[-7.5,90,20],[-4,92,21],[0,94,23],[1.9,95.6,25.4],[2.6,96,26],[4,93,26],[8,86,26],[12,82,26]]},
 {id:'santos',style:world(2,{skin:MID}),keys:[[-7.5,90,50],[-4,92,48],[0,94,46],[1.9,96,43.5],[2.6,96.4,43],[4,93,42],[8,86,40],[12,82,40]]},
 {id:'masopust',style:world(6),keys:[[-7.5,60,24],[-4,67,26],[-1.5,72.8,27.4],[0,77,28.6],[1.9,85.4,32.4],[2.6,87.2,33],[4,86,32],[8,80,30],[12,76,30]]},
 {id:'pluskal',style:world(4),keys:[[-7.5,78,16],[-4,81,17],[0,84,19],[1.9,87,22],[2.6,87.6,22.5],[4,85,23],[8,80,24],[12,76,24]]},
 // England's forwards
 {id:'smith',style:england(9,{hair:[K,.85]}),keys:[[-7.5,84,40],[-4,87,40],[0,90,39.5],[1.9,96.5,38],[2.6,97.2,37.6],[4,95,36],[8,90,35],[12,86,35]]},
 {id:'charlton',style:england(11,{hairStyle:'balding',hair:[Y,.5]}),keys:[[-7.5,76,56],[-4,80,55],[0,84,54],[1.9,90,51],[2.6,91,50.5],[4,89,49],[8,84,46],[12,80,46]]},
 {id:'paine',style:england(7,{hair:[K,.7]}),keys:[[-7.5,78,8],[-4,82,9],[0,86,10],[1.9,92,13.5],[2.6,93,14],[4,91,15],[8,86,17],[12,82,17]]},
 {id:'eastham',style:england(10,{hair:[K,.8]}),keys:[[-7.5,64,36],[-4,69,37],[0,74,38],[1.9,81,39],[2.6,82,39],[4,81,38],[8,78,36],[12,74,36]]},
 {id:'greaves',style:GREAVES,keys:GREAVES_KEYS},
];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-8);for(let t=-7.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
// ---- authored moves (athlete.ts posed/keyPoses; degrees)
/** Yashin waving his defence into place: upright, right arm out pointing, head turned to them (his known habit; the gesture is inferred) */
const SHOUT=(t:number)=>posed({lHipF:26,rHipF:20,lKnee:30,rKnee:26,lHipA:10,rHipA:10,lean:8,rShF:70+14*Math.sin(t*9),rShA:62,rElb:10,rShR:10,rHand:1,lShF:30,lShA:30,lElb:60,neckY:26,neckP:-14,twist:10});
/** a boxer's punch off the line: load, drive forward and up off the left foot, right fist straight through the ball at .55, land a step on */
const PUNCH_CONTACT=.55;
function punch(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,keeperSet(0)],
  [.28,posed({lHipF:64,rHipF:44,lKnee:78,rKnee:64,lHipA:12,rHipA:12,lAnk:-8,rAnk:-4,lean:26,pitch:8,rShF:34,rShA:22,rElb:112,rShR:10,lShF:52,lShA:26,lElb:96,twist:-14,neckP:-20,dx:.35,rHand:0,lHand:0})],
  [PUNCH_CONTACT,posed({air:.2,dx:.95,lHipF:78,lKnee:92,lAnk:30,rHipF:-14,rKnee:26,rAnk:44,lean:-6,pitch:-4,rShF:96,rShA:8,rElb:4,rShR:0,lShF:14,lShA:34,lElb:100,twist:24,neckP:-26,rHand:0,lHand:0})],
  [.75,posed({air:.08,dx:1.25,lHipF:44,lKnee:52,rHipF:4,rKnee:40,lean:6,rShF:108,rShA:16,rElb:18,lShF:22,lShA:36,lElb:80,twist:16,neckP:-30,rHand:0,lHand:.2})],
  [1,posed({dx:1.4,lHipF:36,rHipF:30,lKnee:44,rKnee:40,lean:12,pitch:4,rShF:70,rShA:26,rElb:40,lShF:30,lShA:26,lElb:50,neckP:-18,rHand:.4,lHand:.4})],
 ];
 const p=keyPoses(t,keys);p.squash=t<.28?-.06*sm(0,.28,t):t<.6?.07*(1-sm(.55,.75,t)):-.05*sm(.85,1,t);return p;
}
/** Greaves after the save: hands on his head (inferred) */
const HANDS_ON_HEAD=posed({lHipF:14,rHipF:10,lKnee:16,rKnee:14,lean:-6,pitch:-2,lShF:132,rShF:132,lShA:58,rShA:58,lElb:144,rElb:144,lShR:-20,rShR:-20,neckP:-18,lHand:1,rHand:1});
/** the hug: arms wrapped round the other's back, heads over shoulders; b bobs the laugh (head back, shoulders shaking) */
/** Greaves → Yashin for the hug: square to the behind-the-goal camera so neither hides the other */
const HUG_DIR=nrm2(.52,.6);
const HUG=(b:number,tall:boolean)=>posed({lHipF:6,rHipF:10,lKnee:12,rKnee:16,lean:14-10*b,pitch:3,lShF:84,rShF:92,lShA:30,rShA:24,lElb:96,rElb:104,lShR:-36,rShR:-40,neckP:tall?10-26*b:-8-22*b,neckY:18,twist:6,lHand:.8,rHand:.8,squash:.02*b});

// ---- the ball and its contacts
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const SHOT_T=1.9,P0=1.95,PDUR=.9,CONTACT_T=P0+PUNCH_CONTACT*PDUR;
const GREAVES_FACE=nrm2(105-87.9,34-31.3);
/** Greaves's LEFT boot meets the ball at SHOT_T: the solved toe of the strike pose */
let _shot:V3|null=null;
function shotFrom():V3{if(_shot)return _shot;const st=greavesState(SHOT_T),sk=solve(st.pose,GREAVES.build,st.place,FIG),t=toMy(sk.lToe);return _shot=[t[0]+.08,.11,t[2]];}
/** Yashin's base for the punch and his facing (toward where the drive came from) */
const YB:[number,number]=[102.85,33.45];
let _face:[number,number]|null=null;
function yFace(){if(_face)return _face;const s=shotFrom();return _face=nrm2(s[0]-YB[0],s[2]-YB[1]);}
let _fist:V3|null=null;
/** the fist at the moment of contact (the ball meets it just in front of the knuckles) */
function fist():V3{if(_fist)return _fist;const sk=solve(punch(PUNCH_CONTACT),YASHIN.build,placeOf(YB[0],YB[1],yFace()),FIG),h=toMy(sk.rHa),e=toMy(sk.rEl),d=[h[0]-e[0],h[1]-e[1],h[2]-e[2]],l=Math.hypot(d[0],d[1],d[2])||1;
 return _fist=[h[0]+d[0]/l*.17,h[1]+d[1]/l*.17,h[2]+d[2]/l*.17];}
const LAND1:V3=[63,.11,25.5],LAND2:V3=[56,.11,26],REST:V3=[51.5,.11,26.2];
/** The ball in 3D at play time T: Greaves's dribble, the drive, the punch back high toward halfway, two bounces, rolling out near the line. */
function ballAt(T:number):V3{
 const k=GREAVES_KEYS;
 const ahead=(t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<1.45){const ph=((T+8)*2)%1;return ahead(T,.55+.7*Math.sin(ph*Math.PI));}
 if(T<SHOT_T)return lerp3(ahead(1.45,.9),shotFrom(),sm(1.45,SHOT_T,T,easeInOutSine));
 if(T<CONTACT_T){const u=(T-SHOT_T)/(CONTACT_T-SHOT_T);return lerp3(shotFrom(),fist(),u,.25);}
 if(T<4.9)return lerp3(fist(),LAND1,sm(CONTACT_T,4.9,T,u=>u*(1.25-.25*u)),10);
 if(T<6.2)return lerp3(LAND1,LAND2,sm(4.9,6.2,T,linear),2.2);
 const u=sm(6.2,8.4,T,easeOut);return[lerp(LAND2[0],REST[0],u),.11,lerp(LAND2[2],REST[2],u)];
}

// ---- the players at play time T
function greavesState(T:number):St{
 const k=GREAVES_KEYS;
 if(T>=5.7){const b=.5+.5*Math.sin((T-5.7)*11);const p=trackAt(k,T);return{pose:blendPose(runState(k,5.6).pose,HUG(b*sm(6,6.4,T),false),sm(5.55,5.95,T)),place:placeOf(p[0],p[1],HUG_DIR)};}
 const st=runState(k,T,T>1.3&&T<3.9?GREAVES_FACE:undefined);
 const w=win(T,1.35,2.75,.3);let pose=st.pose;
 if(w>0)pose=blendPose(pose,strike(clamp((T-SHOT_T)/1.0+STRIKE_CONTACT),{foot:'l',power:1}),w);
 const h=win(T,3.05,4.1,.3);if(h>0)pose=blendPose(pose,HANDS_ON_HEAD,h);
 return{pose,place:st.place};
}
const YASHIN_KEYS=[[-8,104.3,34.2],[-1.2,104.2,34],[0,103.9,33.8],[1.6,102.95,33.5],[P0,YB[0],YB[1]]];
function yashinState(T:number):St{
 if(T<P0){const[x,z]=trackAt(YASHIN_KEYS,T),look=nrm2(ballAt(Math.min(T,SHOT_T))[0]-x,ballAt(Math.min(T,SHOT_T))[2]-z),sh=win(T,-5.4,-1.3,.5);
  return{pose:blendPose(keeperSet(T*1.3),SHOUT(T),sh),place:placeOf(x,z,T<-1.2?[-1,0]:look)};}
 const F=yFace();
 if(T<P0+PDUR)return{pose:punch((T-P0)/PDUR),place:placeOf(YB[0],YB[1],F)};
 const L:[number,number]=[YB[0]+F[0]*1.4,YB[1]+F[1]*1.4];
 if(T<4.2){const p=blendPose(punch(1),{...stand(),dx:1.4},sm(P0+PDUR,P0+PDUR+.5,T));return{pose:p,place:placeOf(YB[0],YB[1],F)};}
 // walks out to Greaves, then the hug (facing him)
 const HK=[[4.2,L[0],L[1]],[5.7,99.26,32.9],[12,99.26,32.9]];
 if(T<5.7){const st=runState(HK,T,nrm2(-1,-.1));return st;}
 const b=.5+.5*Math.sin((T-5.7)*11+.8),p=trackAt(HK,T);
 return{pose:blendPose(stand(),HUG(b*sm(6,6.4,T),true),sm(5.55,5.95,T)),place:placeOf(p[0],p[1],[-HUG_DIR[0],-HUG_DIR[1]])};
}
function stateOf(id:string,T:number):St{
 if(id==='yashin')return yashinState(T);
 if(id==='greaves')return greavesState(T);
 const k=TR(id).keys;return runState(k,T,T>1.7&&T<2.8?nrm2(ballAt(T)[0]-trackAt(k,T)[0],ballAt(T)[2]-trackAt(k,T)[1]):undefined);
}

type Item={depth:number;draw:()=>void};
const HEROES=['greaves','yashin'];
/** Everything at play time T through camera c: the stadium, then players, ball and goal in depth order (far first).
 * wide: every figure at 'low' (small in a wide shot); otherwise heroes print at 'auto' and the rest at 'low'. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean;yashin?:St|null;noBall?:boolean;under?:()=>void}={}){
 stadium(s,c,o.bounce??0);o.under?.();
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),'yashin'];
 for(const id of ids){
  const fn=(t:number)=>id==='yashin'&&o.yashin?o.yashin:stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='yashin'?YASHIN:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='greaves'&&T>1.75&&T<2.15)||(id==='yashin'&&T>P0+.15&&T<P0+.7);
  items.push({depth:1/g[2],draw:()=>drawPlayer(s,st,fn(T-1/12),c,sty,{smear:fast&&hero})});}
 const bp=ballAt(T),bq=P3(bp,c);
 if(!o.noBall&&onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-1e-5,draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.3:.55);leatherBall(s,bq[0],bq[1],r,T);}});}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}
/** the 1960s leather ball (colour inferred): a tan disc, a navy rim and a turning panel seam */
function leatherBall(s:Sheet,x:number,y:number,r:number,T:number){
 const d=shape(blob(x,y,r,r,5,{n:16,amp:.03}));s.knockout(d);s.fill(O,d,.55);s.fill(Y,d,.6);s.stroke(K,d,Math.max(1.5,r*.14),.9);
 if(r>7){const a=T*7,seam=new Path2D();seam.moveTo(x+Math.cos(a)*r*.85,y+Math.sin(a)*r*.85);seam.quadraticCurveTo(x+Math.cos(a+1.6)*r*.2,y+Math.sin(a+1.6)*r*.2,x+Math.cos(a+Math.PI)*r*.85,y+Math.sin(a+Math.PI)*r*.85);s.stroke(K,seam,Math.max(1,r*.09),.8);}
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side — Yashin waving his defence into place, Greaves running at them, the drive, the punch back toward halfway. */
const MAIN_CAM:V3=[70,17,-46];
const t1=(t:number)=>warp(t,[[0,-7.4],[CUE(0,'In goal'),-4.6],[CUE(0,'Jimmy'),-.3],[CUE(0,'punches'),CONTACT_T-.05],[SECS(0),5.2]]);
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-7.4,T-.3)),est=1-sm(-7.4,-5.2,T,easeInOutSine);
 // opens on Yashin and his line (establishing, a touch wider), follows Greaves in, holds on the punch, then pans back with the ball
 const tx0=lerp(102.5,lerp(b[0]+4,99.5,.45),sm(-3.2,-.6,T,easeInOutSine)),tx=T<CONTACT_T+.2?tx0:lerp(tx0,Math.max(72,b[0]),.75*sm(CONTACT_T+.2,CONTACT_T+1.6,T,easeInOutSine));
 const tz=lerp(lerp(34,31,sm(-3.2,1.5,T)),27,sm(CONTACT_T+.2,4.6,T))+est*4,ty=est*3;
 const F=lerp(lerp(6400,8200,sm(-6.5,1.6,T,easeInOutSine)),5200,sm(CONTACT_T+.3,4.4,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,ty,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);const T=t1(twos(t));drawPlay(s,T,cam1(t),{wide:true,ballScale:2.4});newsreel(s,t);frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return CUE(0,'In goal')+.8;},
};
/** 2 · the TV slow-motion replay, low beside Greaves: Yashin off his line before the shot, the step, the boxer's punch. */
const LOW:V3=[95.5,1.4,27.2];
const replayT=(t:number)=>warp(t,[[0,.9],[CUE(1,"doesn't"),1.45],[CUE(1,'steps'),P0+.05],[CUE(1,"boxer's")+.35,CONTACT_T],[SECS(1),3.0]]);
const cam2=(t:number)=>{const T=replayT(t);return camAt(LOW,[lerp(103,101.6,sm(.9,CONTACT_T,T,easeInOutSine)),lerp(1.0,1.35,sm(1.8,CONTACT_T,T)),lerp(33.8,33.2,sm(.9,CONTACT_T,T))],lerp(2300,2900,sm(0,CUE(1,"boxer's")+.35,t,easeInOutSine)));};
const ch2:Scene={
 draw(s,t){frame(s);const T=replayT(twos(t));drawPlay(s,T,cam2(t),{ballScale:1.6});
  // the punch lands: a small burst at the fist (part of the replay's freeze, drawn in ink like the ball)
  const g=sm(CONTACT_T-.01,CONTACT_T+.04,T)*(1-sm(CONTACT_T+.2,CONTACT_T+.45,T));if(g>0){const f=P3(fist(),cam2(t));sparkBurst(s,Y,f[0],f[1],.55*f[2],{n:9,seed:23,g,width:.05*f[2]});}
  newsreel(s,t,.9);frame(s);},
 aperture(t){const y=yashinState(replayT(twos(t))),p=P3([y.place.x!,1.3,-y.place.z!],cam2(t));return apertureDisc(p[0],p[1],Math.max(10,.7*p[2]),12);},
 get still(){return CUE(1,"boxer's")+.4;},
};
/** 3 · a second angle, high behind the goal: the ball flies away up the pitch; Greaves and Yashin meet and hug, laughing. */
const BEHIND:V3=[122,8.5,13];
const t3=(t:number)=>warp(t,[[0,3.0],[CUE(2,'Greaves'),3.25],[CUE(2,'fall into'),5.72],[SECS(2),8.6]]);
const cam3=(t:number)=>{const T=t3(t);return camAt(BEHIND,[lerp(96,99,sm(3,5.7,T,easeInOutSine)),lerp(1.2,1.1,sm(3,6,T)),lerp(33,32.6,sm(3,5.7,T))],lerp(2900,5200,sm(3.2,6.4,T,easeInOutSine)));};
const ch3:Scene={
 draw(s,t){frame(s);const T=t3(twos(t));drawPlay(s,T,cam3(t),{ballScale:1.8});newsreel(s,t,.9);frame(s);},
 aperture(t){const p=P3([98.95,1.45,32.6],cam3(t));return apertureDisc(p[0],p[1],Math.max(10,.8*p[2]),12);},
 get still(){return CUE(2,'laughing')+.3;},
};
/** 4 · the lesson plate (not footage): Yashin back on his line. Shout waves roll out over his defenders ("shout loud"); footprints off the
 * line light up while a yellow Yashin comes out and punches ("come for the ball"); then his whole area prints yellow ("your area is your home"). */
const LESSON_CAM:V3=[95,7.5,52];
const cam4=(t:number)=>camAt(LESSON_CAM,[lerp(102.2,101.4,sm(0,SECS(3),t,easeInOutSine)),.8,lerp(34,32.8,sm(0,SECS(3),t))],lerp(3000,3150,sm(0,SECS(3),t,easeInOutSine)));
/** the lesson's walk: from the line to the punch, T-space of the real play */
const LESSON_WALK=(u:number)=>lerp(-.2,P0+PDUR*.85,u);
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),cam=cam4(t),q0=CUE(3,'shout loud'),q1=CUE(3,'come for'),q2=CUE(3,'Your area');frame(s);
  // Yashin: on his line waving and shouting (the live chapter's pose), then he comes out along the footprints and punches, and stays there
  const walk=sm(q1,q1+2.1,t,easeInOutSine),Tw=LESSON_WALK(walk),shoutT=-3+tt*.9;
  const ys=walk>0?yashinState(Tw):yashinState(shoutT);
  const home=sm(q2,q2+.6,t,easeOutBack),F=yFace();
  // under the players: the area printing yellow as his home, then the footprints off the line
  const under=()=>{
   if(home>.002){const x=105-16.5*clamp(home),area=new Path2D();addPoly(area,[[105,0,13.84],[x,0,13.84],[x,0,54.16],[105,0,54.16]],cam);s.tone(Y,area,.5);
    const edge=new Path2D();groundLine(edge,[x,13.84],[x,54.16],cam,.4);groundLine(edge,[105,13.84],[x,13.84],cam,.4);groundLine(edge,[105,54.16],[x,54.16],cam,.4);s.fill(Y,edge,.95);}
   if(t>=q1-.3){const dim=new Path2D(),lit=new Path2D();
    for(let i=0;i<6;i++){const u=i/5,x=lerp(104.1,YB[0]+F[0]*1.1,u),z=lerp(33.9,YB[1]+F[1]*1.1,u)+(i%2?.2:-.2),pts:Pt[]=[];for(let j=0;j<12;j++){const a=j/12*TAU,p=P3([x+Math.cos(a)*.28,.01,z+Math.sin(a)*.13],cam);pts.push([p[0],p[1]]);}(u<=walk+.02?lit:dim).addPath(shape(pts));}
    s.knockout(dim,.75);if(walk>0){s.stroke(K,lit,5,.9);s.knockout(lit);s.fill(Y,lit,.95);}}};
  drawPlay(s,-3+tt*.3,cam,{only:['popluhar','schnellinger'],yashin:ys,noBall:true,under});
  // shout waves: three arcs roll out from his head toward the defence, bolder on "shout loud"
  const loud=sm(q0,q0+.4,t,easeOutBack),on=sm(.2,.7,t)*(1-sm(q1-.2,q1+.3,t));
  if(on>.01){const hd=solve(ys.pose,YASHIN.build,ys.place,FIG),h=toMy(hd.head),hp=P3(h,cam),aim=P3([h[0]-3,h[1],h[2]+.6],cam),dir=Math.atan2(aim[1]-hp[1],aim[0]-hp[0]),arcs=new Path2D();
   for(let i=0;i<3;i++){const ph=((t*1.2+i/3)%1),R=(.6+ph*3.2)*hp[2]*(1+.35*loud),pts:Pt[]=[];for(let j=0;j<=10;j++){const a=dir+lerp(-.55,.55,j/10);pts.push([hp[0]+Math.cos(a)*R,hp[1]+Math.sin(a)*R]);}
    arcs.addPath(ribbon(pts,(.12+.08*loud)*hp[2]*(1-ph*.5),{seed:40+i,taper:.5,wobble:.8}));}
   s.stroke(K,arcs,4,.8*on);s.fill(Y,arcs,.95*on);
   if(loud>.01)sparkBurst(s,Y,hp[0]+Math.cos(dir)*.35*hp[2],hp[1]+Math.sin(dir)*.35*hp[2],.5*hp[2],{n:7,seed:77,g:clamp(loud)*on,width:.05*hp[2]});}
  // the punch: a burst at the fist and the ball's way out, back up the pitch
  if(Tw>=CONTACT_T-.05){const fp=fist(),f=P3(fp,cam),tip=P3([fp[0]-6,fp[1]+2.2,fp[2]-1],cam),mid=P3([fp[0]-3,fp[1]+1.9,fp[2]-.5],cam),line=partial(smoothPts([[f[0],f[1]],[mid[0],mid[1]],[tip[0],tip[1]]],false,6,2),sm(q1+1.5,q1+2.3,t,easeInOutSine));
   if(line.length>1){const arrow=ribbon(line,.1*f[2],{seed:5,taper:.2,wobble:1});s.stroke(K,arrow,5,.9);s.knockout(arrow);s.fill(Y,arrow,.95);}
   sparkBurst(s,Y,f[0],f[1],.6*f[2],{n:9,seed:61,g:sm(CONTACT_T-.05,CONTACT_T+.1,Tw),width:.05*f[2]});
   leatherBall(s,f[0]+(tip[0]-f[0])*.02,f[1]+(tip[1]-f[1])*.02,.13*f[2],0);}
  frame(s);
 },
 get still(){return SECS(3)*.85;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'yashin-save-1963',format:'11v11',title:'The Black Spider',theme:'Shout loud and come for the ball',
 ageNote:'England v Rest of the World · 23 October 1963 · Wembley, London',
 spec:{paper:'#efe7d4',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:2,alpha:.9,grain:.78,mottle:.55},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to the World XI goal line at 105, Z across) — checked by tests/play-film-yashin-save-1963.cjs. */
export const FACTS={GOAL,ballAt,shotFrom,fist,yFace,SHOT_T,CONTACT_T,LAND1,yashinAt:(T:number)=>{const s=yashinState(T);return[s.place.x!,-s.place.z!] as [number,number];},greavesAt:(T:number)=>trackAt(GREAVES_KEYS,T)};
