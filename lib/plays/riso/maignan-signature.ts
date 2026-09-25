/** Iconic-play film · Mike Maignan, signature "the flying fingertip save" — France 1–0 Belgium, UEFA Euro 2024 round of 16, Monday 1 July
 * 2024, Merkur Spiel-Arena, Düsseldorf: the diving stop from Kevin De Bruyne's low, rasping shot with seven minutes left, two minutes before
 * France's winner.
 *
 * WHY THIS MOMENT: Maignan's entry in lib/town/iconicPlays.json is a signature (kind "signature"): "the flying fingertip save", lesson "push
 * off hard with the foot nearest the ball to dive further". The film needed ONE real, written-up moment of that flying save. This is the stop
 * the Guardian's match report calls "a superb save" that "had to rescue" France and "an exceptional stop from De Bruyne", with seven minutes
 * left, in a knockout game at a major tournament that stood 0–0 — and France scored the only goal two minutes later. The Guardian's live
 * text gives the shot: "a low, rasping shot from just outside the France penalty area saved by Maignan after good work down the left by
 * Doku and Lukaku". A low shot heading for the corner is exactly the save the lesson teaches: to get there, the keeper must push off hard
 * from the foot nearest the ball and fly low across the goal. (Also considered: the same game's Lukaku save at 70' — "well saved", less
 * detail; the De Bruyne free kick in the first half that Maignan "just about managed to kick away while falling backwards" — a foot save,
 * not the signature.)
 *
 * SOURCES (read 23 Sep 2026; cached under scratchpad/films/src-cache/):
 *  - The Guardian match report, Sid Lowe, "France v Belgium, Euro 2024 last 16" (1 Jul 2024)
 *    https://www.theguardian.com/football/article/2024/jul/01/france-belgium-euro-2024-last-16-match-report  (guardian-fra-bel-2024.txt)
 *  - The Guardian minute-by-minute (1 Jul 2024), 70', 83', 85', 87' entries
 *    https://www.theguardian.com/football/live/2024/jul/01/france-v-belgium-euro-2024-last-16-live-score-updates  (guardian-fra-bel-2024-live.txt)
 *  - Wikipedia "UEFA Euro 2024 knockout stage" (raw): the France v Belgium box, line-ups, numbers and the kit templates from UEFA's
 *    tactical line-ups (wiki-euro2024-knockout.txt); Wikipedia "Mike Maignan" (raw) (wiki-mike-maignan.txt)
 * CONFIRMED by those accounts: France 1–0 Belgium, 1 July 2024, Merkur Spiel-Arena, Düsseldorf, round of 16 (46,810, referee Glenn Nyberg);
 * 0–0 until the 85th minute (Kolo Muani's shot deflected in off Vertonghen, "less than two minutes after" the save); the save at 83' ("there
 * were seven minutes left"): after "good work down the left by Doku and Lukaku", De Bruyne's "low, rasping shot from just outside the France
 * penalty area saved by Maignan", De Bruyne then with "his head in his hands". Numbers: Maignan 16, De Bruyne 7 (captain), Lukaku 10, Doku 22,
 * Mangala 18 (on at 63'), Carrasco 11; France: Koundé 5, Upamecano 4, Saliba 17, Théo Hernandez 22, Kanté 13, Tchouaméni 8. Kits (Wikipedia's
 * kit templates from UEFA's line-up sheet): France in their WHITE change shirts, blue shorts, white socks; Belgium in their dark-red home
 * shirts, black shorts, red socks. De Bruyne is right-footed; Maignan is 1.91 m.
 * INFERRED (illustrative, not in the accounts): Maignan's keeper-kit colours (a yellow kit here), which end and which side the camera sits,
 * every position, path and timing, the exact build-up (Doku down Belgium's left, a pass inside to Lukaku, Lukaku's lay-off to De Bruyne),
 * the spot De Bruyne shot from, that he struck it first time with his right foot, where the shot was heading (low, just inside Maignan's left
 * post), the side Maignan dived (to his left), that he pushed off the left foot, which glove touched it, and that the ball was pushed round
 * the post; the stadium shape and crowd colours; the camera placements. The narration names only confirmed facts plus the lesson (it never
 * names the side, the foot or the hand).
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with Belgium's attack down the far side to the shot and the save — real time; 2 = TV slow-motion replay from low behind the
 * shooter, looking down the line of the shot at the goal: Maignan pushes off and flies low across his goal toward the camera's right; 3 = the
 * second replay angle, a ground-level pitchside camera on the goal line beyond the post he dives toward: he flies at the lens at full
 * stretch and the glove pushes the ball away round the post, then the flecks as France score two minutes later; 4 = the lesson (the only
 * chapter with teaching marks): the near foot loads and glows, pushes hard, and a measured arc shows how far the push carries him.
 * Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only their local time t;
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,mirrorPose,runCycle,stand,strike,dribble,keeperSet,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Seven minutes left, live',text:'July twenty twenty-four, Euro last sixteen. France and Belgium, nil-nil, seven minutes left. Doku and Lukaku break down the left, and Kevin De Bruyne hits a low, rasping shot!',seconds:12.8,
  cues:[[.1,'July'],[2.5,'France and Belgium'],[4.1,'seven minutes'],[5.3,'Doku and Lukaku'],[8.5,'Kevin De Bruyne'],[10.4,'rasping shot']]},
 {label:'Watch again',text:'Watch again, slowly. Mike Maignan pushes off hard with the foot nearest the ball, and flies low across his goal.',seconds:9,
  cues:[[.1,'Watch again'],[.9,'slowly'],[1.3,'Mike Maignan'],[2,'pushes off hard'],[3.9,'foot nearest'],[5.8,'flies low']]},
 {label:'Full stretch',text:'From the goal line: at full stretch, his glove pushes the ball away. Two minutes later, France score!',seconds:9,
  cues:[[.1,'From the goal line'],[1.9,'full stretch'],[2.7,'his glove'],[3.4,'pushes the ball'],[5,'Two minutes'],[6.2,'France score']]},
 {label:'Your turn',text:'What a flying save! Your turn: push off hard with the foot nearest the ball, and you will dive further.',seconds:10,
  cues:[[.1,'What a flying save'],[1.6,'Your turn'],[2.4,'push off hard'],[4.3,'foot nearest'],[7,'dive further']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py maignan-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/maignan-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-maignan-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/maignan-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('maignan: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). */
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
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;

// ---------------------------------------------------------------- Düsseldorf: a closed bowl of French blue and Belgian red, the roof ring, grass, markings
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-14,76],b:[119,76],out:[0,1]},    // far side
 {a:[113,-9],b:[113,77],out:[1,0]},    // behind Maignan's goal
 {a:[-14,-8],b:[119,-8],out:[0,-1]},   // main stand (the live camera sits in it)
 {a:[-8,-9],b:[-8,77],out:[-1,0]},     // the far end
];
/** French blue and white, Belgian red, the odd yellow (inferred crowd colours; both sets of fans were in the ground) */
const TIER_INK:[string,number][]=[[B,.55],[R,.45],[K,.22],[B,.3],[Y,.16],[R,.28],[K,.35],[B,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.6),P(0,40,1.2+40*.6)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // the closed roof ring over the bowl
  addPoly(roof,[P(0,20,30),P(1,20,30),P(1,48,34),P(0,48,34)],c);
  const segs=16;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.34,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.6+lift,y1=1.2+d1*.6+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(B,concrete,.18);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.62);
 s.fill(B,wall,.55);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const z of[0,68]){const a=P3([105,0,z],c),b=P3([105,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([105,1.42,z+(z?-.5:.5)],c),g=P3([105,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
const GOAL={x:105,z0:30.34,z1:37.66,h:2.44,back:107,backH:2.0};
/** France's goal: white posts and bar, a net (paper haze + navy mesh) back to the stanchions. */
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

// ---------------------------------------------------------------- figures: the shared athlete library, ONE adapter
/** athlete.ts is right-handed (y up); this pitch (X to France's goal, Z away from the main camera) is left-handed, so the adapter negates z
 * both ways — that keeps every right foot a right foot and every left hand a left hand. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
type St={pose:Pose;place:Place};
/** Every body in the film goes through here: optional speed smear first, then the athlete. */
function drawPlayer(s:Sheet,st:St,cam:Cam,style:AthleteStyle,prev?:St,smear=false){
 const pc=proj(cam);
 if(smear&&prev)motionSmear(s,prev.pose,st.pose,pc,style,st.place,{prevPlace:prev.place,ink:[K,.35]});
 return drawAthlete(s,st.pose,pc,style,st.place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.45],[R,.3]],SKIN_D:InkFill[]=[[K,.75],[R,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** France in their white change shirts, blue shorts, white socks (UEFA line-up sheet via Wikipedia's kit template); blue numbers */
const france=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:B,shorts:B,socks:'paper',boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:B,scale:FIG,...o});
/** Belgium in their dark-red home shirts, black (navy) shorts, red socks — the red overprinted with navy for the dark red */
const belgium=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:K,shorts:K,socks:R,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.4],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Maignan: 1.91 m, number 16, cropped dark hair; keeper kit colours INFERRED (a yellow kit), long sleeves, white gloves */
const MAIGNAN:AthleteStyle={shirt:[Y,.95],trim:K,shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',
 number:16,numberInk:K,build:{height:1.91,bulk:1.06},scale:FIG,seed:16};

// ---------------------------------------------------------------- the dive (authored on athlete.ts's keyPoses)
/** A low flying dive, authored to the keeper's RIGHT and mirrored to his LEFT (maignanDive). The technique the lesson teaches: the foot
 * NEAREST the ball steps out and loads (.16: that knee deeply bent, the foot wide), then PUSHES — at launch (.34) that leg is driving straight
 * through a pointed toe while the other knee drives up and across; full stretch low over the grass with both arms long (.55 = the touch);
 * landing on the side (.88 → 1). */
const DIVE_C=.55,DIVE_PUSH=.34;
function diveRight(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,keeperSet(0)],
  [.16,posed({lHipF:50,rHipF:40,lKnee:58,rKnee:92,lHipA:14,rHipA:36,lAnk:-4,rAnk:-8,dz:.26,lean:24,pitch:6,roll:8,lShA:52,rShA:62,lShF:52,rShF:44,lElb:56,rElb:48,lShR:24,rShR:24,neckY:-16,neckP:-12,lHand:1,rHand:1})],
  [DIVE_PUSH,posed({dz:.82,air:.12,roll:44,bend:10,lean:8,pitch:0,rHipA:30,rHipF:8,rKnee:8,rAnk:54,lHipF:74,lKnee:100,lHipA:-8,lAnk:24,rShA:128,lShA:112,rShF:14,lShF:30,rElb:18,lElb:30,neckY:-18,neckP:-12,lHand:1,rHand:1})],
  [DIVE_C,posed({dz:1.62,air:.2,roll:86,bend:16,lean:4,rHipA:10,rHipF:-6,rKnee:8,rAnk:46,lHipF:40,lKnee:62,lHipA:4,lAnk:30,rShA:176,rShF:6,rElb:2,lShA:164,lShF:30,lElb:14,neckY:-10,neckP:-14,lHand:1,rHand:1})],
  [.72,posed({dz:1.98,air:.07,roll:92,bend:12,lean:6,rHipA:8,rHipF:4,rKnee:16,rAnk:40,lHipF:42,lKnee:66,lAnk:30,rShA:168,rShF:22,rElb:10,lShA:156,lShF:36,lElb:20,neckP:-8,lHand:1,rHand:.9})],
  [.88,posed({dz:2.12,air:0,roll:94,bend:8,lean:8,rHipF:14,rKnee:28,rAnk:34,lHipF:44,lKnee:66,lAnk:30,rShA:150,rShF:34,rElb:28,lShA:140,lShF:40,lElb:34,neckP:0,lHand:.9,rHand:.8})],
  [1,posed({dz:2.16,air:0,roll:92,bend:4,lean:14,rHipF:24,rKnee:40,rAnk:28,lHipF:48,lKnee:72,lAnk:28,rShA:128,rShF:44,rElb:50,lShA:120,lShF:46,lElb:56,neckP:8,lHand:.7,rHand:.7})],
 ];
 const p=keyPoses(clamp(t),keys),Q:[number,number][]=[[0,0],[.16,-.09],[DIVE_PUSH,.08],[DIVE_C,.1],[.72,.03],[.88,-.08],[1,-.03]];
 let v=Q[Q.length-1][1];for(let i=0;i+1<Q.length;i++){const[a,va]=Q[i],[b,vb]=Q[i+1];if(t>=a&&t<=b){const u=(t-a)/(b-a);v=va+(vb-va)*u*u*(3-2*u);break;}}if(t<0)v=0;
 p.squash=clamp(v,-.3,.3);return p;
}
/** the film's dive: to his LEFT (inferred), pushing off the LEFT foot — the foot nearest the ball */
const maignanDive=(t:number)=>mirrorPose(diveRight(t));

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = De Bruyne's shot)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'kdb',style:belgium({number:7,seed:7,hair:[R,.75],build:{height:1.81}}),keys:[[-12,70,35],[-8,74,36],[-4,79.5,38],[-2,83.6,39.6],[-.7,86.3,40.5],[0,87.4,40.7],[.7,88.3,40.8],[3,89.3,40.4],[6,89.5,40]]},
 {id:'doku',style:belgium({number:22,seed:22,skin:SKIN_D,hair:K,build:{height:1.73,bulk:.95}}),keys:[[-12,64,61],[-8,71,59],[-5,78.5,57.5],[-3.2,83.6,56],[-2,86,55],[0,88.4,52.8],[2,90,50.6],[6,91.5,49]]},
 {id:'lukaku',style:belgium({number:10,seed:10,skin:SKIN_D,hair:K,build:{height:1.91,bulk:1.18}}),keys:[[-12,80,45],[-8,84,46],[-5,88,47.2],[-3.2,90.2,47.8],[-2.4,90.9,47.4],[-1.2,91.2,46.6],[0,92.3,45],[2,94,42.6],[6,95,41]]},
 {id:'mangala',style:belgium({number:null,seed:18,skin:SKIN_D,hair:K}),keys:[[-12,66,29],[-8,72,30],[-3,82,31],[0,89.4,32.6],[2,92.5,33],[6,93.5,33]]},
 {id:'carrasco',style:belgium({number:null,seed:11,hair:[K,.8]}),keys:[[-12,68,14],[-8,74,15],[-3,83,17],[0,90,20.5],[3,92.5,22],[6,93,22.5]]},
 {id:'kounde',style:france({number:5,seed:5,build:{height:1.78}}),keys:[[-12,74,58],[-8,79,58],[-5,83.5,57],[-3,87,55.2],[0,90.6,51.2],[2,92.4,48.6],[6,93,47.6]]},
 {id:'saliba',style:france({number:null,seed:17,build:{height:1.92}}),keys:[[-12,88,40],[-8,90.5,41.6],[-3,94.6,43.6],[0,96.4,41.8],[2,97.2,39.6],[6,97,39]]},
 {id:'upa',style:france({number:null,seed:4,build:{height:1.86}}),keys:[[-12,89,30],[-8,91.5,31.5],[-3,95.6,35],[0,97.6,37.2],[2,98.2,36.4],[6,98,36]]},
 {id:'theo',style:france({number:null,seed:22,skin:SKIN_M,hair:[K,.8]}),keys:[[-12,82,16],[-8,86,17.4],[-3,92.4,21.2],[0,95,25.2],[2,96,26.4],[6,96.4,27]]},
 {id:'kante',style:france({number:13,seed:13,build:{height:1.68}}),keys:[[-12,72,46],[-8,77,46],[-4,82,45],[-1.5,85.2,44],[0,86.6,43.3],[1,87.6,42.6],[3,88.6,42],[6,89,41.8]]},
 {id:'tchoua',style:france({number:null,seed:8,build:{height:1.87}}),keys:[[-12,72,31],[-8,77,32],[-3,84,33.4],[0,88,34.4],[3,90,35],[6,90,35]]},
];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-12);for(let t=-11.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** passes and the shot are RIGHT-footed (De Bruyne confirmed; Doku and Lukaku inferred): the solved toe is where the ball leaves */
const toeAt=(id:string,T:number,face?:[number,number]):V3=>{const st=runState(TR(id).keys,T,face),sk=solve(strike(STRIKE_CONTACT),TR(id).style.build,st.place,FIG),t=toMy(sk.rToe);return[t[0],.11,t[2]];};
/** the shot: first time, low, aimed just inside Maignan's left-hand post (inferred) */
const AIM:[number,number]=[105,30.95];
const KDB_FACE:[number,number]=(()=>{const p=trackAt(TR('kdb').keys,0);return nrm2(AIM[0]-p[0],AIM[1]-p[1]);})();
const SHOT_FROM=toeAt('kdb',0,KDB_FACE);
/** where the ball meets the glove: on the line of the shot, 1.6 m short of the goal line, low (the glove's height at the touch) */
const X_TOUCH=103.4;
const ON_LINE=(x:number):[number,number]=>{const u=(x-SHOT_FROM[0])/(AIM[0]-SHOT_FROM[0]);return[x,lerp(SHOT_FROM[2],AIM[1],u)];};
/** Maignan set, square to De Bruyne */
const FACE:[number,number]=nrm2(-1,.3);
/** the dive's place: solved backwards so the LEFT glove sits just inside the ball's path at the touch (the glove on the goal-centre side) */
const HAND_XZ:[number,number]=[ON_LINE(X_TOUCH)[0]+.04,ON_LINE(X_TOUCH)[1]+.1];
const DIVE_SK0=solve(maignanDive(DIVE_C),MAIGNAN.build,placeOf(0,0,FACE),FIG);
const DIVE_AT:[number,number]=(()=>{const h=toMy(DIVE_SK0.lHa);return[HAND_XZ[0]-h[0],HAND_XZ[1]-h[2]];})();
const HAND_AT:V3=[HAND_XZ[0],toMy(DIVE_SK0.lHa)[1],HAND_XZ[1]];
const CONTACT:V3=[ON_LINE(X_TOUCH)[0],Math.max(.14,HAND_AT[1]),ON_LINE(X_TOUCH)[1]];
/** a low, rasping shot: ~28 m/s, so the 16 m reach the glove in about .6 s; the dive starts as the ball leaves his boot */
const T_C=.6,DUR=.78,T_J0=T_C-DIVE_C*DUR;
/** pushed away round the post and out behind the goal line (inferred) */
const OUT:V3=[106.4,.3,28.3],REST:V3=[109.2,.11,24.6];

/** the build-up: Doku down Belgium's left, inside to Lukaku, Lukaku's lay-off into De Bruyne's stride (inferred order, confirmed names) */
const T_P1=-3.2,T_R1=-2.4,T_P2=-1.15;
const P1_FROM=toeAt('doku',T_P1,nrm2(-.2,-1)),P1_TO:V3=(()=>{const p=trackAt(TR('lukaku').keys,T_R1);return[p[0]-.35,.11,p[1]+.3];})();
const P2_FROM:V3=(()=>{const p=trackAt(TR('lukaku').keys,T_P2);return[p[0]-.4,.11,p[1]-.25];})();

/** Maignan before the dive: shaded toward De Bruyne's side, then a set step into the middle as the ball comes inside */
function keeperState(T:number):St{
 const k=[[-12,104.1,36.8],[-4,104.0,36.4],[-1.8,103.9,35.6],[-.4,DIVE_AT[0]+.05,DIVE_AT[1]+.3],[T_J0,DIVE_AT[0],DIVE_AT[1]]];
 if(T<T_J0){const p=trackAt(k,T),b=ballAt(T),h=T>-.5?FACE:nrm2(b[0]-p[0],b[2]-p[1]);return{pose:keeperSet(T*1.5),place:placeOf(p[0],p[1],h)};}
 const u=(T-T_J0)/DUR,d=maignanDive(u),up=sm(T_C+1.5,T_C+2.4,T);
 // back up on his feet after the save (the up-blend rotates him through a kneel; inferred)
 return{pose:up>0?blendPose(d,posed({lHipF:30,rHipF:30,lKnee:40,rKnee:40,lean:14,lShA:30,rShA:30,lElb:50,rElb:50,dz:-2.1,neckP:-8}),up):d,place:placeOf(DIVE_AT[0],DIVE_AT[1],FACE)};
}

const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
/** The ball in 3D at play time T: Doku's dribble, the pass inside, the lay-off, the low shot, the glove, round the post. */
function ballAt(T:number):V3{
 const dk=TR('doku').keys;
 const ahead=(t:number,lead:number):V3=>{const p=trackAt(dk,t),v=velAt(dk,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<T_P1-.3)return ahead(T,.5+.3*Math.sin(T*5.1)**2);
 if(T<T_P1)return lerp3(ahead(T_P1-.3,.5+.3*Math.sin((T_P1-.3)*5.1)**2),P1_FROM,sm(T_P1-.3,T_P1,T));
 if(T<T_R1)return lerp3(P1_FROM,P1_TO,sm(T_P1,T_R1,T,u=>u*(1.4-.4*u)));
 if(T<T_P2)return lerp3(P1_TO,P2_FROM,sm(T_R1,T_P2,T,easeInOutSine));
 if(T<0)return lerp3(P2_FROM,SHOT_FROM,sm(T_P2,0,T,u=>u*(1.3-.3*u)));
 if(T<T_C)return lerp3(SHOT_FROM,CONTACT,sm(0,T_C,T,linear),.12);
 if(T<T_C+.4)return lerp3(CONTACT,OUT,sm(T_C,T_C+.4,T,linear),.35);
 return lerp3(OUT,REST,sm(T_C+.4,T_C+2,T,easeOut),.15);
}

// ---------------------------------------------------------------- the players at play time T
function stateOf(id:string,T:number):St{
 const tr=TR(id),k=tr.keys;
 if(id==='kdb'){const st=runState(k,T,T>-.6&&T<.6?KDB_FACE:undefined),w=win(T,-.5,.8);let pose=w>0?blendPose(st.pose,strike(clamp(T/.9+STRIKE_CONTACT)),w):st.pose;
  // head in his hands (the Guardian's 83' entry)
  if(T>T_C+.5)pose=blendPose(pose,posed({lShF:150,rShF:150,lShA:40,rShA:40,lElb:124,rElb:124,lean:-4,neckP:-18,lKnee:10,rKnee:10}),sm(T_C+.5,T_C+1.1,T));
  return{pose,place:st.place};}
 if(id==='doku'){const st=runState(k,T,T>T_P1-.5&&T<T_P1+.5?nrm2(-.2,-1):undefined);
  if(T<T_P1-.5){const d=dribble(strideAt(k,T)*.9/4.3,{foot:'r',speed:.95});return{...st,pose:blendPose(st.pose,d,win(T,-12,T_P1-.5,.2))};}
  const w=win(T,T_P1-.45,T_P1+.6);return w>0?{...st,pose:blendPose(st.pose,strike(clamp((T-T_P1)/.9+STRIKE_CONTACT),{power:.45}),w)}:st;}
 if(id==='lukaku'){const f=T>T_R1-.4&&T<T_P2+.5?nrm2(-.9,-.6):undefined,st=runState(k,T,f),w=win(T,T_P2-.45,T_P2+.55);
  return w>0?{...st,pose:blendPose(st.pose,strike(clamp((T-T_P2)/.9+STRIKE_CONTACT),{power:.35}),w)}:st;}
 if(id==='kante'){const st=runState(k,T),w=win(T,-.3,.9,.2);// closes De Bruyne down and stretches a leg (inferred)
  return w>0?{...st,pose:blendPose(st.pose,posed({lHipF:60,lHipA:30,lKnee:12,lAnk:-10,rHipF:30,rKnee:70,lean:20,roll:-10,lShA:60,rShA:50,lElb:40,rElb:40,neckP:10}),w*.8)}:st;}
 return runState(k,T);
}

type Item={depth:number;draw:()=>void};
const HEROES=['kdb','lukaku','doku','kante','maignan'];
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goal in depth order (far first). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean;noKeeper?:boolean}={}){
 stadium(s,c,o.bounce??0);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),...(o.noKeeper?[]:['maignan'])];
 for(const id of ids){const fn=(t:number)=>id==='maignan'?keeperState(t):stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='maignan'?MAIGNAN:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='maignan'&&T>T_J0+.05&&T<T_J0+.7*DUR)||(id==='kdb'&&T>-.2&&T<.25);
  // the keeper's depth is taken at his chest, not his feet: in flight he is well across from his take-off spot
  let depth=g[2];if(id==='maignan'&&T>T_J0){const sk=solve(st.pose,MAIGNAN.build,st.place,FIG),ch=toMy(sk.chest);depth=P3(ch,c)[2]||depth;}
  items.push({depth:1/depth,draw:()=>{drawPlayer(s,st,c,sty,fn(T-1/12),fast&&hero);}});}
 const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  // at the touch the ball prints over the glove from every angle (it is on the fingertips)
  const atSave=T>T_C-.2&&T<T_C+.15;
  items.push({depth:atSave?0:1/bq[2],draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:T*7,key:K,shadow:B,seed:3});}});}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
 // the touch: a quick flash where the glove meets the ball (footage chapters: no teaching marks)
 const hit=win(T,T_C-.01,T_C+.2,.05);if(hit>0){const q=P3(CONTACT,c);if(onScreen(q))sparkBurst(s,Y,q[0],q[1],.5*q[2],{n:9,seed:41,g:hit,width:.05*q[2]});}
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main-stand camera panning with Belgium's attack down the far side — the pass inside, the lay-off, the shot, the save. */
const MAIN_CAM:V3=[52.5,24,-40];
const t1=(t:number)=>t-CUEW(0,'rasping')-.15;// real time: the shot leaves De Bruyne's boot on "rasping"
function cam1(t:number){const T=t1(t);let bx=0,bz=0;for(let k=0;k<5;k++){const b=ballAt(Math.min(T,T_C)-.25-k*.12);bx+=b[0]/5;bz+=b[2]/5;}
 const tx=clamp(lerp(bx+3,100,sm(-.5,.7,T,easeInOutSine)),62,100),tz=lerp(clamp(bz-6,28,44),34,sm(-.6,.7,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],lerp(lerp(5000,5900,sm(-8,-2,T,easeInOutSine)),8200,sm(-.6,.8,T,easeInOutSine)));}
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3([DIVE_AT[0],.6,DIVE_AT[1]-1.4],cam1(t));return apertureDisc(p[0],p[1],Math.max(8,.9*p[2]),12);},
 get still(){return Math.min(SECS(0)-1,CUEW(0,'rasping')+1.4);},
};
/** 2 · TV slow-motion replay, low behind De Bruyne and looking down the line of his shot: the lay-off, the strike, the push, the flight. */
const LOW_BEHIND:V3=[77.5,1.9,43.4];
const t2=(t:number)=>warp(t,[[0,-1.35],[CUEW(1,'Mike'),-.25],[CUEW(1,'pushes'),T_J0+.02],[CUEW(1,'foot nearest'),T_J0+DIVE_PUSH*DUR-.04],[CUEW(1,'flies'),T_J0+.46*DUR],[CUEW(1,'flies')+1.4,T_C+.12],[SECS(1),T_C+.45]]);
const cam2=(t:number)=>{const T=t2(t),u=sm(-.4,T_C,T,easeInOutSine);return camAt(LOW_BEHIND,[lerp(96,103.4,u),lerp(1.1,.6,u),lerp(37.2,33.2,u)],lerp(1800,3500,u));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3([CONTACT[0],.6,CONTACT[2]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.9*p[2]),12);},
 get still(){return CUEW(1,'flies')+.9;},
};
/** 3 · the second replay angle: a ground-level pitchside camera on the goal line beyond the post he dives toward — he flies at the lens,
 * the glove pushes the ball round the post; then, two minutes later, the ground erupts in blue and white. Very slow. */
const LINE_CAM:V3=[103.9,.6,23.4];
const t3=(t:number)=>warp(t,[[0,T_J0-.2],[CUEW(2,'full stretch'),T_J0+.4*DUR],[CUEW(2,'his glove'),T_C-.05],[CUEW(2,'pushes the ball'),T_C],[CUEW(2,'pushes the ball')+1.2,T_C+.45],[CUEW(2,'Two minutes'),T_C+1.1],[SECS(2),T_C+3]]);
const cam3=(t:number)=>{const T=t3(t),u=sm(T_C+.3,T_C+2.4,T,easeInOutSine);return camAt(LINE_CAM,[lerp(103.8,104.2,u),lerp(.55,.9,u),lerp(32.2,33.6,u)],lerp(lerp(1500,1850,sm(0,CUEW(2,'his glove'),t,easeInOutSine)),1400,u));};
const ch3:Scene={
 draw(s,t){frame(s);const qF=CUEW(2,'France score'),cheer=sm(qF,qF+.5,t)*(1-sm(qF+2.2,qF+2.8,t));
  drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.5,bounce:cheer*Math.abs(Math.sin(t*7))});
  // "France score": the stands go up in blue and white flecks
  if(cheer>0){dust(s,B,-200,-360,700*easeOut(clamp((t-qF)/1.2)),22,{seed:91,size:16,cov:.8*cheer});dust(s,null,260,-320,560*easeOut(clamp((t-qF-.15)/1.2)),16,{seed:92,size:14,cov:.9*cheer});}
  frame(s);},
 aperture(t){const p=P3([HAND_AT[0],.5,HAND_AT[2]],cam3(t));return apertureDisc(p[0],p[1],Math.max(10,.9*p[2]),12);},
 get still(){return CUEW(2,'pushes the ball')+.6;},
};

// ---------------------------------------------------------------- 4 · the lesson plate (not footage)
/** A halftone Maignan on his line, seen low from the front-left: the near foot steps out and loads ("push off hard" — it glows), a push
 * arrow from that boot toward the ball ("foot nearest"), then the flight, with a measured yellow arc from the boot to the fingertips ("dive
 * further"). The ball comes in low and is pushed away round the post. L = the dive's own t (maignanDive), warped to the cues. */
const L_AT:[number,number]=[104.1,34.4],L_FACE:[number,number]=[-1,0];
const L_SK=(L:number)=>solve(maignanDive(clamp(L)),MAIGNAN.build,placeOf(L_AT[0],L_AT[1],L_FACE),FIG);
const L_HAND:V3=toMy(L_SK(DIVE_C).lHa);
const L_BOOT:V3=(()=>{const t=toMy(L_SK(.16).lToe);return[t[0],.02,t[2]];})();
const L_TOUCH:V3=[L_HAND[0]-.1,Math.max(.14,L_HAND[1]),L_HAND[2]-.12],L_SHOT:V3=[99.2,.14,31.5],L_OUT:V3=[106.2,.25,27.4];
function lessonState(L:number):St{return{pose:L<=0?keeperSet(-L*1.5):maignanDive(L),place:placeOf(L_AT[0],L_AT[1],L_FACE)};}
function lessonBall(L:number):V3{
 if(L<-.2)return L_SHOT;
 if(L<DIVE_C)return lerp3(L_SHOT,L_TOUCH,sm(-.2,DIVE_C,L,linear),.08);
 return lerp3(L_TOUCH,L_OUT,sm(DIVE_C,DIVE_C+.3,L,easeOut),.3);
}
const LESSON_CAM:V3=[97.2,1.25,39.6];
const cam4=(t:number)=>camAt(LESSON_CAM,[lerp(103.3,103.8,sm(0,SECS(3),t,easeInOutSine)),.7,lerp(33.6,32.6,sm(CUEW(3,'dive'),CUEW(3,'dive')+1.2,t,easeInOutSine))],lerp(1750,1650,sm(0,SECS(3),t,easeInOutSine)));
const t4=(t:number)=>warp(t,[[0,-.6],[CUEW(3,'Your turn'),-.2],[CUEW(3,'push off'),0],[CUEW(3,'push off')+1,.16],[CUEW(3,'foot nearest'),.18],[CUEW(3,'foot nearest')+1.4,DIVE_PUSH],[CUEW(3,'dive further'),.36],[CUEW(3,'dive further')+1.3,.66],[SECS(3),.92]]);
/** a thick yellow teaching stroke with a navy key line */
function mark(s:Sheet,pts:Pt[],w:number,seed:number){if(pts.length<2)return;const path=ribbon(pts,w,{seed,taper:.1,wobble:.8});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);}
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),cam=cam4(t),L=t4(tt);frame(s);
  drawPlay(s,T_C+6,cam,{ballScale:1.3,bounce:.5*Math.abs(Math.sin(t*6))*(1-sm(.3,2.2,t)),only:[],noKeeper:true});
  // "What a flying save!": blue and white flecks over the stand as the chapter opens
  dust(s,B,0,-300,640*easeOut(clamp(t/1.6)),18,{seed:77,size:15,cov:.75*(1-sm(1.6,2.4,t))});
  const P=(v:V3):Pt=>{const q=P3(v,cam);return[q[0],q[1]];},k1=P3([L_AT[0],0,L_AT[1]],cam)[2];
  // "push off hard": the near boot glows as it loads — a stamped yellow footprint ring under the left foot
  const qP=CUEW(3,'push off'),load=sm(qP+.2,qP+.8,t,easeInOutSine)*(1-sm(CUEW(3,'dive')+1.4,CUEW(3,'dive')+2,t));
  // "foot nearest": a push arrow from that boot toward the ball's side
  const qN=CUEW(3,'foot nearest'),arrow=sm(qN+.1,qN+.9,t,easeInOutSine)*(1-sm(CUEW(3,'dive')+.2,CUEW(3,'dive')+.6,t));
  if(arrow>0){const a=P([L_BOOT[0],.05,L_BOOT[2]]),b=P([L_BOOT[0]-.3,.05,L_BOOT[2]-2.2]),w=.1*k1;const tip=partial([a,b],arrow);mark(s,tip,w,5);
   if(arrow>.95){const d=Math.atan2(b[1]-a[1],b[0]-a[0]),hl=w*1.6,hd:Pt[]=[[b[0]+Math.cos(d)*hl,b[1]+Math.sin(d)*hl],[b[0]+Math.cos(d+2.3)*hl,b[1]+Math.sin(d+2.3)*hl],[b[0]+Math.cos(d-2.3)*hl,b[1]+Math.sin(d-2.3)*hl]];const hp=shape(hd);s.stroke(K,hp,5,.9);s.knockout(hp);s.fill(Y,hp,.95);}}
  // "dive further": a measured arc from the take-off boot to the fingertips, growing with the flight, ticks every metre
  const qD=CUEW(3,'dive further'),reach=sm(qD+.1,qD+1.3,t,linear);
  if(reach>0){const pts:Pt[]=[];for(let k=0;k<=16;k++){const u=k/16;pts.push(P([lerp(L_BOOT[0],L_HAND[0],u),.03+.55*Math.sin(Math.PI*u),lerp(L_BOOT[2],L_HAND[2],u)]));}
   mark(s,partial(pts,reach),.08*k1,9);
   const ticks=new Path2D(),n=Math.floor(Math.hypot(L_HAND[0]-L_BOOT[0],L_HAND[2]-L_BOOT[2]));for(let m=1;m<=n;m++){const u=m/Math.hypot(L_HAND[0]-L_BOOT[0],L_HAND[2]-L_BOOT[2]);if(u>reach)break;const g=P([lerp(L_BOOT[0],L_HAND[0],u),.01,lerp(L_BOOT[2],L_HAND[2],u)]);ticks.addPath(shape(blob(g[0],g[1],.1*k1,.05*k1,m,{n:10})));}
   s.stroke(K,ticks,4,.9);s.knockout(ticks);s.fill(Y,ticks,.95);}
  const st=lessonState(L);drawPlayer(s,st,cam,{...MAIGNAN,detail:'high'},lessonState(L-1/24),L>.2&&L<.6);
  // the ring round the loading boot prints over the body so it always reads (a yellow halo on the grass round that foot)
  if(load>0){const ring:Pt[]=[];for(let i=0;i<=20;i++){const a=i/20*TAU*load;ring.push(P([L_BOOT[0]+Math.cos(a)*.5,.01,L_BOOT[2]+Math.sin(a)*.32]));}mark(s,ring,.06*k1,21);}
  // the ball: in low, onto the fingertips, away round the post
  const bp=lessonBall(L),bq=P3(bp,cam),g=P3([bp[0],0,bp[2]],cam),r=Math.max(6,.13*bq[2]);
  s.tone(K,shape(blob(g[0],g[1],r*1.1,r*.33,4,{n:14})),.5);footballPanels(s,bq[0],bq[1],r,{rot:L*9,key:K,shadow:B,seed:3});
  const hit=win(L,DIVE_C-.01,DIVE_C+.12,.03);if(hit>0){const q=P3(L_TOUCH,cam);sparkBurst(s,Y,q[0],q[1],.8*q[2],{n:10,seed:61,g:hit,width:.06*q[2]});}
  frame(s);
 },
 get still(){return SECS(3)*.85;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'maignan-signature',format:'11v11',title:'The flying fingertip save',theme:'Push off with the foot nearest the ball',
 ageNote:'France v Belgium · Euro 2024 last 16, 1 July 2024',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little glove spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:5,seed,g,width:16});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to France's goal line at 105, Z across) — checked by tests/play-film-maignan-signature.cjs. */
export const FACTS={CONTACT,HAND_AT,DIVE_AT,FACE,SHOT_FROM,AIM,OUT,REST,GOAL,T_C,T_J0,DUR,DIVE_C,DIVE_PUSH,ballAt,maignanDive,keeperState,L_AT,L_FACE,L_BOOT,L_HAND,L_TOUCH,lessonBall};
