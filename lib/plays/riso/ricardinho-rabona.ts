/** Ricardinho's rabona — a signature-move riso film (iconic plays, futsal). It shows HOW the move is done, not one dated match:
 * no specific match, score or date is depicted.
 * Structure, like a futsal broadcast (the rendering is riso; the staging is footage-like):
 *  1–2  LIVE — one continuous take from the broadcast position (camera 13 m outside the near touchline, 6 m up, panning with play, no
 *       overlays): he dribbles in on his far foot, sole-rolls the ball across onto his left ("wrong") side, the rival rushes in and pokes,
 *       he steps in and plays the rabona in real time; the ball curls into the near post, the keeper dives the wrong way, he celebrates.
 *  3    REPLAY — slow motion from behind, close on the legs: the last strides, the plant beside the ball, the kicking leg's knee bending
 *       high, wrapping behind the standing leg (ghost frames + a diagram plate: dashed foot path, the X ring), the strike, the laces.
 *  4    REPLAY (reverse angle) of the curl past the rival into the net, then the lesson: three cards (plant, swing behind, strike) and
 *       the smart-choice diagram (the right-foot route blocked by the rival, the rabona route open).
 * Technique (biomechanics used for the poses): standing foot planted beside the ball (about a foot away, slightly ahead, pointing at the
 * target); body leaning back and away from the ball with the arms out for balance; the kicking leg's knee bent high on the backswing, then
 * wrapped round the back of the standing leg; toe pointed down, striking through the ball with the laces/instep. Ball speed ≈16 m/s.
 * Sources (written descriptions):
 *  - Wikipedia, "Rabona": the kicking leg is wrapped/crossed behind the back of the standing leg — https://en.wikipedia.org/wiki/Rabona
 *  - UEFA.com, "Best of Ricardinho: the all-time Futsal EURO and UEFA futsal club competition top scorer" (his rabona goals, e.g. at Futsal
 *    EURO) — https://www.uefa.com/futsaleuro/news/029c-1e8252d9472a-320075b295e6-1000--best-of-ricardinho-the-all-time-futsal-euro-and-uefa-futs/
 *  - Wikipedia, "Ricardinho (futsal player, born 1985)" — https://en.wikipedia.org/wiki/Ricardinho_(futsal_player,_born_1985)
 *  - Soccer Coaching Pro, "How to Do the Rabona Move in Soccer (9-Step Guide)" — https://www.soccercoachingpro.com/rabona-soccer/
 *  - U90 Soccer, "Rabona Soccer Move: Explained" — https://u90soccer.com/blogs/learn/rabona-in-soccer
 *  (Web search only in this session — the pages themselves could not be fetched; video footage was not reviewed.)
 * Players: the shared athlete library (./athlete.ts) — generators dribble / runCycle / rabona / celebrate (Ricardinho), backpedal / lunge
 * (the rival), keeperSet / keeperDive; our stages are left-handed, so `projector()` maps library z → −Z. Ricardinho's place is solved back
 * from his kicking toe at RABONA_CONTACT so the wrap meets the ball; motionSmear echoes the wrap; `prev` drives hair / hem follow-through.
 * Timing: withTiming() moves the cues onto the Kokoro recording; `authored()` maps each chapter's clock through those cue anchors back onto
 * the authored choreography, so every action stays on its word.
 * Inks: yellow (wood court, lights), red (Portugal shirt/socks), green (Portugal shorts, the "standing leg" diagram plate), navy (key line,
 * rival kit, crowd). Ricardinho: red shirt with a paper 10 on the back, green shorts, white boots.
 * Composed for the player card's picture window (1.45:1 down to square): every scene is authored in a 1566×1080-unit box and `cam()`
 * centres it on the FULL sheet (W/2, H/2), cancelling the full-screen art region and `fit`. Phone heat: ≤ 4 plates, cached halftone tiles,
 * drawn objects on twos; ≈115–190 plate ops per frame, ≈290 on passage frames.
 * Scenes read only their local t; cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timing from '../../../public/plays/narration/ricardinho-rabona/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {dust,speedLines,sparkBurst,handCut,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,rabona,dribble,runCycle,runCadence,stand,lunge,backpedal,keeperSet,keeperDive,celebrate,posed,blendPose,touchPhase,RABONA_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Skeleton} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}
function camPath(s:Sheet,t:number,K0:Key[],shake:Pt=[0,0]){const v=key(t,padKeys(K0,[0,0,1,0]),easeInOutSine,true);cam(s,(v[0]||0)+shake[0],(v[1]||0)+shake[1],Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a low perspective camera over the court floor (metres → world units) ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BODY=1.78,BALL_R=.11,BALL_FX=-.23,GX=-1.2,GZ=11,WALLZ=14.2;
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);

// ---------------- geometry helpers ----------------
/** tube: a limb/segment outline — a centreline with widths at its knots, optional round caps. One polygon (world points). */
function tube(pts:Pt[],w:number[],capA=true,capB=true):Pt[]{
 const c:Pt[]=[],ww:number[]=[];
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(2,Math.ceil(L/14));for(let k=0;k<m;k++){const u=k/m,e=u*u*(3-2*u);c.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);ww.push(w[i]+(w[i+1]-w[i])*e);}}
 c.push(pts[pts.length-1]);ww.push(w[w.length-1]);
 const n=c.length,nrm=(i:number):Pt=>{const a=c[Math.max(0,i-1)],b=c[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l];};
 const Lp:Pt[]=[],Rp:Pt[]=[];for(let i=0;i<n;i++){const[nx,ny]=nrm(i),r=ww[i]/2;Lp.push([c[i][0]+nx*r,c[i][1]+ny*r]);Rp.push([c[i][0]-nx*r,c[i][1]-ny*r]);}
 const out:Pt[]=[...Lp],cap=(p:Pt,r:number,a0:number)=>{for(let k=1;k<8;k++){const a=a0-k/8*Math.PI;out.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}};
 if(capB){const[nx,ny]=nrm(n-1);cap(c[n-1],ww[n-1]/2,Math.atan2(ny,nx));}
 for(let i=n-1;i>=0;i--)out.push(Rp[i]);
 if(capA){const[nx,ny]=nrm(0);cap(c[0],ww[0]/2,Math.atan2(-ny,-nx));}
 return out;
}
/** the shadow half of a limb (light from the upper left): a thinner tube shifted to the screen-right side */
const shadeTube=(pts:Pt[],w:number[])=>tube(pts.map((p,i)=>[p[0]+w[Math.min(i,w.length-1)]*.24,p[1]+w[Math.min(i,w.length-1)]*.06] as Pt),w.map(v=>v*.5));
/** dashes: gaps list for a ribbon so it prints as a dashed diagram line */
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line (one op) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;s.fill(ink,ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)}),cov);}
/** an arrow head at the end of a polyline */
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt);s.fill(ink,polyPath(q,true),cov);}
/** a circle on the court floor, projected (convex) */
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
/** a line strip painted on the floor: (X,Z) points with a half width in metres → projected polygon */
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}

// ---------------- players: the shared athlete library (lib/plays/riso/athlete.ts) ----------------
/** Our stages are LEFT-handed (X right, Z away from the camera, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** facing: live world (the play runs along X) and replay world (the play runs along Z, toward the goal) */
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.88],[R,.2]];
const PORTUGAL:AthleteStyle={shirt:R,shorts:G,socks:R,boots:'paper',skin:SKIN,hair:K,line:K,trim:G,number:10,numberInk:'paper',hairStyle:'short',build:{height:1.72,bulk:.96},seed:10};
const RIVAL:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,number:4,numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1.04},seed:4};
const KEEPER:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:K,hairStyle:'short',build:{height:1.85},seed:1};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem secondary motion); smear = motion echo of the wrap */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cam=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cam,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cam,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** a diagram halo round one leg (hip → knee → ankle → toe), printed BEFORE the athlete so its knockout leaves only the rim */
function legHalo(s:Sheet,st:Stage,sk:Skeleton,side:'l'|'r',ink:string,g:number,cov=.75){
 if(g<=.02)return;const P=(j:V3)=>proj(st,j[0],j[1],-j[2]),k=kAt(st,-sk.pelvis[2]),w=(m:number)=>(m+.1*g)*k;
 const hip=side==='l'?sk.lHip:sk.rHip,kn=side==='l'?sk.lKn:sk.rKn,an=side==='l'?sk.lAn:sk.rAn,to=side==='l'?sk.lToe:sk.rToe;
 s.fill(ink,polyPath(tube([P(hip),P(kn),P(an),P(to)],[w(.2),w(.14),w(.1),w(.1)]),true),cov);
}
/** where the ball sits when the rabona meets it: just past the kicking toe along the foot (library coords) */
function contactBall(yaw:number,build=PORTUGAL.build):{toe:V3;ball:V3}{
 const sk=solve(rabona(RABONA_CONTACT),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;
 return{toe,ball:[toe[0]+d[0]/l*.09,BALL_R,toe[2]+d[2]/l*.09]};
}
// generator poses for the moves the library does not name
const SOLE_P=posed({rHipF:40,rKnee:36,rAnk:-10,rHipA:-12,lHipF:14,lKnee:26,lean:12,lShA:40,rShA:30,lElb:40,rElb:40,neckP:30});
const SHIELD_P=posed({lHipF:22,rHipF:18,lKnee:34,rKnee:30,lHipA:8,rHipA:8,lean:18,pitch:4,lShA:48,rShA:40,lElb:40,rElb:40,neckP:24});
const DRAG_P=posed({lHipF:34,lKnee:30,lAnk:-12,rHipF:16,rKnee:34,lean:16,pitch:2,lShA:52,rShA:44,lElb:40,rElb:40,neckP:28});

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;smear?:number;dir?:number}={}){
 const{rot=0,sx=1,sy=1,smear=0,dir=0}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88*sx,y+Math.sin(a)*r*.88*sy,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);

// ---------------- the arena: wood court, painted lines, striped futsal goal, boards, stands with a Portugal crowd, lights ----------------
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;crowd?:boolean};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=GX,by=1,t=0,crowd=true}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 // floor: wood (yellow flat + red tint), plank strips alternately tinted, plank seams converging to the far wall, butt joints
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.32);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.32);s.stroke(K,seams,4,.45);
 // painted court lines (paper): goal line, the D of the penalty area (6 m quarter circles from each post), the 6 m and 10 m spots
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([GX-1.58-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([GX+1.58+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-12,GZ],[12,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,GX,GZ-10,.12,12),true));
 s.knockout(lines,.92);
 // boards and stands (everything above the far edge of the floor)
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(G,rectPath(-span,wall-board,span*2,board));
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.6);
 s.fill(K,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 const top=wall-board,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);
 s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(crowd){// heads (lit skin), red and green shirts, a few Portugal flags; all rise and bob on "cheer"
  const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,x0=-span*.25,x1=span*.25,tw=Math.floor(t*12);
  for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round(x/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6));const hx=x+(hsh-.5)*gap*.4,hy=y-jump;
    heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);
    const body=hash(i,4);if(body<.28)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
  // flags: green hoist, red fly, waving
  for(let f=0;f<5;f++){const fx=proj(st,-9+f*4.3+hash(f,6),0,WALLZ)[0],fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12;
   const cut=.4,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
   greens.addPath(polyPath([pole(0,0),pole(cut,0),pole(cut,1),pole(0,1)],true));reds.addPath(polyPath([pole(cut,0),pole(.5,0),pole(.75,0),pole(1,0),pole(1,1),pole(.75,1),pole(.5,1),pole(cut,1)],true));
   heads.addPath(circlePath(fx+cut*fw,fy+fh*.5+wv(cut),fh*.2));}
  s.fill(Y,heads,.6);s.fill(R,reds);s.fill(G,greens);
 }
 // lights: stepped yellow halos in the roof; flash on the goal
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-3;i<=3;i++){const lx=proj(st,i*6,0,WALLZ)[0],ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
 // the futsal goal: net (halftone + mesh), red-and-paper striped posts; the back net bulges round the ball
 goal(s,st,bulge,bx,by);
 o.keeper?.(st);
 postsOf(s,st);
}
function goal(s:Sheet,st:Stage,bulge:number,bx:number,by:number){
 const Lx=GX-1.5,Rx=GX+1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsOf(s:Sheet,st:Stage){
 const Lx=GX-1.5,Rx=GX+1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
// ---- the court from the broadcast position: camera 13 m outside the near touchline, 6 m up; the play runs along X toward the goal at X = −20 ----
const TOUCH_FAR=20,BOARDS=21,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.32);
 // planks run along the court (horizontal on screen), alternate strips tinted, butt joints staggered
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30;
 for(let k=0;k<44;k++){const z0=-1+k*.5,z1=z0+.5;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.32);
 // painted lines: touchlines, goal line, halfway, the penalty area D (6 m arcs from the posts), the 6 m and 10 m marks
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-40,0],[40,0]],[[-40,TOUCH_FAR],[40,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(G,rectPath(-span,wall-board,span*2,board));
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.6);
 s.fill(K,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the stands: stepped navy rows, lit faces, red and green shirts, Portugal flags, roof lights (shared by both camera set-ups) */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.28)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  greens.addPath(polyPath([pole(0,0),pole(.4,0),pole(.4,1),pole(0,1)],true));reds.addPath(polyPath([pole(.4,0),pole(.7,0),pole(1,0),pole(1,1),pole(.7,1),pole(.4,1)],true));heads.addPath(circlePath(fx+.4*fw,fy+fh*.5+wv(.4),fh*.2));}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(G,greens);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X-lerp(Db,Dt,Yh/H)-d,Yh,Z);};
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,GOAL_X,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const B=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([B(POST_N,-w),B(POST_F,-w),B(POST_F,w),B(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([B(z0,-w),B(z1,-w),B(z1,w),B(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- the live play (one continuous take across chapters 1 and 2; T = live seconds, authored clock) ----
const RZ=11.8,BALL_NEAR=RZ-.32,BALL_FAR=RZ+.28,DZ=12.45,SHOT_X=-8.03;
/** the rabona meets the ball at (SHOT_X, BALL_NEAR): Ricardinho's place is solved back from his kicking toe (facing −X) */
const LIVE_HIT=contactBall(FACE_LEFT),PLANT_X=SHOT_X-LIVE_HIT.ball[0],PLANT_Z=BALL_NEAR-toMine(LIVE_HIT.ball)[2];
const rX=(T:number)=>key(T,[[0,-1.5],[2.0,-5.3,easeOut],[2.6,-5.9],[6.2,-7.0,easeIO],[8.5,-7.2],[10.9,-7.3],[11.3,PLANT_X,easeIn],[12.9,PLANT_X],[15.5,-6.3,easeIO]]);
const rZ=(T:number)=>key(T,[[10.9,RZ],[11.3,PLANT_Z,easeIn],[12.9,PLANT_Z],[15.5,10.2,easeIO]]);
const rabT=(T:number)=>key(T,[[11.05,0],[11.3,.18],[11.5,.27],[11.95,RABONA_CONTACT],[12.9,1]],linear);
/** the ball in the live take: dribbled on the far foot, sole-rolled across to the near side, shielded, dragged back from the poke,
 * nudged to the shooting spot, struck (≈16 m/s, curling left toward the near post), in the net, dropping with a bounce */
function liveBall(T:number):{X:number;Y:number;Z:number;spin:number;flying:boolean}{
 if(T<2.07){const lead=.35+.5*easeOut(((T-.1)/.6%1+1)%1);return{X:rX(T)-lead,Y:BALL_R,Z:BALL_FAR,spin:T*9,flying:false};}
 if(T<2.6){const u=sm(2.07,2.6,T,easeIO),x0=rX(2.07)-.35-.5*easeOut(((2.07-.1)/.6%1+1)%1);return{X:lerp(x0,rX(2.6)-.35,u),Y:BALL_R,Z:lerp(BALL_FAR,BALL_NEAR,u),spin:18+u*4,flying:false};}
 if(T<11.95){let X=rX(T)-.35-.06*Math.sin(T*2.2);X+=.2*sm(9.05,9.35,T,easeOut);if(T>=10.6)X=lerp(rX(10.6)-.35-.06*Math.sin(10.6*2.2)+.2,SHOT_X,sm(10.6,11.2,T,easeOut));return{X,Y:BALL_R,Z:BALL_NEAR,spin:24-X*9,flying:false};}
 if(T<12.7){const u=sm(11.95,12.7,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return{X:a*SHOT_X+b*(-14)+c*(GOAL_X-.45),Y:a*BALL_R+b*1.35+c*.95,Z:a*BALL_NEAR+b*BALL_NEAR+c*9.3,spin:30+u*30,flying:true};}
 const d=sm(12.7,13.1,T,easeIn),bo=Math.abs(Math.sin(sm(13.1,13.9,T)*Math.PI*2))*.14*(1-sm(13.1,13.9,T));return{X:GOAL_X-.5,Y:lerp(.95,BALL_R,d)+bo,Z:9.3,spin:60,flying:false};
}
/** Ricardinho live: dribble → sole roll across → shield → drag back from the poke → run-in → rabona → turn and celebrate */
const liveR:Gen=T=>{
 const X=rX(T),Z=rZ(T);let pose:Pose,yaw=FACE_LEFT;
 if(T<2.0)pose=dribble((T-.1)/.6+touchPhase,{foot:'r',speed:.45});
 else if(T<2.6)pose=blendPose(dribble((2.0-.1)/.6+touchPhase,{foot:'r',speed:.45}),SOLE_P,sm(2.0,2.12,T)*(1-sm(2.45,2.6,T)));
 else if(T<6.2)pose=blendPose(stand(),dribble(T*.9,{foot:'l',speed:.2}),.5*(1-sm(5.6,6.2,T)));
 else if(T<10.9){pose=blendPose(stand(),SHIELD_P,sm(6.2,6.8,T,easeIO));pose=blendPose(pose,DRAG_P,sm(9.0,9.2,T)*(1-sm(9.35,9.6,T)));}
 else if(T<11.05)pose=blendPose(SHIELD_P,runCycle((T-10.9)*runCadence(.5),{speed:.5}),sm(10.9,11.0,T));
 else if(T<12.9)pose=blendPose(runCycle(.15*runCadence(.5),{speed:.5}),rabona(rabT(T)),sm(11.05,11.3,T));
 else{const u=sm(12.9,13.4,T,easeIO);pose=blendPose(rabona(1),celebrate((T-12.9)*1.3,{kind:'run'}),u);yaw=lerp(FACE_LEFT,FACE_RIGHT+TAU,u);}
 return{pose,yaw,X,Z};
};
/** the rival live (faces +X): backpedal → rushes in → jockey → pokes at the ball (lunge, his right) → a late lunge at the rabona → turns to watch */
const liveD:Gen=T=>{
 const turn=sm(12.6,13.1,T,easeIO);let X:number,pose:Pose;
 if(T<6.22){X=lerp(-12.4,-11.6,sm(0,6.2,T));pose=backpedal(T*2.2);}
 else if(T<7.0){X=lerp(-11.6,-9.45,sm(6.22,7.0,T,easeOut));pose=blendPose(runCycle((T-6.22)*runCadence(.9),{speed:.9}),backpedal(T*1.2),sm(6.8,7.0,T));}
 else{X=-9.45-.1*sm(7,9,T);const poke=key(T,[[9.0,0],[9.25,.6],[9.9,1]],linear),late=key(T,[[11.7,0],[12.05,.6],[12.6,1]],linear);
  pose=backpedal(T*1.2);pose=blendPose(pose,lunge(poke,{side:'r'}),sm(8.9,9.05,T)*(1-sm(9.8,10.1,T)));pose=blendPose(pose,lunge(late,{side:'r'}),sm(11.6,11.75,T)*(1-turn));
  pose=blendPose(pose,stand(),turn);}
 return{pose,yaw:lerp(FACE_RIGHT,FACE_LEFT,turn),X,Z:DZ};
};
/** the keeper live (faces +X): set, then dives the wrong way (to the far post) as the rabona curls in at the near post */
const liveK:Gen=T=>{const u=sm(12.2,13.3,T,linear);return{pose:u>0?keeperDive(u,{side:'l'}):keeperSet(T*1.3),yaw:FACE_RIGHT,X:GOAL_X+.7,Z:10};};
const liveCam=(T:number)=>({x:key(T,[[0,-2.6],[2,-5.6],[2.6,-6.2],[6.2,-8.2],[8.5,-8.3],[10.9,-8.4],[11.95,-8.7],[12.3,-13.2],[12.65,-18.2],[13.4,-18.2],[14.1,-8.4],[15.5,-6.9]],easeInOutSine),
 zoom:key(T,[[0,1.75],[2,1.85],[6.2,1.6],[8.5,1.75],[10.9,1.95],[11.95,2.0],[12.3,1.5],[12.65,1.38],[13.4,1.38],[14.1,1.6],[15.5,1.75]],easeInOutSine),
 y:key(T,[[0,900],[11.95,900],[12.55,940],[13.3,940],[14.0,920],[15.5,940]],easeInOutSine)});
/** draws the live take at live time T (objects, on twos) with the camera at Tc (broadcast camera; no overlays) */
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,11.95,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=12.7;
 courtSide(s,st,T,{cheer:goal?1-.5*sm(14.5,15.5,T):.15*pulse(T,2.07,1),flash:pulse(T,12.7,1.2),bulge:.5*sm(12.55,12.7,T)*(1-.6*sm(12.9,13.8,T))+.12*settle(T,12.7,{amp:1,freq:3,decay:3}),bz:9.3,by:.95,
  keeper:()=>{athlete(s,st,liveK,T,KEEPER);}});
 // players back to front by depth: the rival (far side), Ricardinho, the ball on the near side (in front of both once it is across)
 athlete(s,st,liveD,T,RIVAL);
 const bp=proj(st,b.X,b.Y,b.Z),br=kAt(st,b.Z)*BALL_R,bg=proj(st,b.X,0,b.Z);
 const drawBall=()=>{shadow(s,bg[0],bg[1],br*1.15,br*.3,16,.45);ball(s,bp[0],bp[1],Math.max(9,br),18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.PI});};
 const behind=b.Z>rZ(T);if(behind)drawBall();
 athlete(s,st,liveR,T,PORTUGAL,{smear:T>11.4&&T<12.2?.12:0});
 if(!behind)drawBall();
}
/** Ricardinho's chest in the live take (the passage enters his red shirt) */
function liveChest(T:number,Tc:number):Pt[]{const c=liveCam(Tc),st=bst(c.x),a=liveR(T),sk=solve(a.pose,PORTUGAL.build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=.08*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

// ---- narration timing: the Kokoro recording's word onsets move the cues; scenes keep their authored clock through the cue anchors ----
const AUTH:{seconds:number;cues:number[]}[]=[
 {seconds:8.5,cues:[.15,.92,2.07,3.14,4.68,6.22,7.0]},
 {seconds:7.0,cues:[.15,1.3,2.42,3.19,4.35,5.95]},
 {seconds:10.2,cues:[.15,2.09,2.86,3.63,4.93,5.7,6.47,7.77,8.92]},
 {seconds:12.0,cues:[.15,1.69,2.47,3.98,5.33,5.84,6.72,7.46,9.77]},
];
const maps:number[][][]=[];
/** chapter time (recording) → authored scene time: piecewise linear through [0,0], each cue, the passage start and the end */
function authored(i:number,t:number){
 let m=maps[i];
 if(!m){const ch=film.chapters[i],A=AUTH[i],raw:number[][]=[[0,0]];ch.cues.forEach((c,k)=>{if(A.cues[k]!==undefined)raw.push([c.at,A.cues[k]]);});raw.push([ch.seconds-.65,A.seconds-.65],[ch.seconds,A.seconds]);
  m=[raw[0]];for(const p of raw.slice(1)){const q=m[m.length-1];if(p[0]>q[0]+.02&&p[1]>q[1]+.02&&p[0]<=ch.seconds&&(p[0]>=ch.seconds-.65||p[0]<ch.seconds-.65-.02))m.push(p);}maps[i]=m;}
 if(t<=0)return 0;for(let k=1;k<m.length;k++)if(t<=m[k][0])return m[k-1][1]+(m[k][1]-m[k-1][1])*(t-m[k-1][0])/(m[k][0]-m[k-1][0]);return m[m.length-1][1];
}
const clock=(i:number,t:number)=>({tt:authored(i,twos(t)),tc:authored(i,t)});

// ================= chapter 1 (LIVE, broadcast camera): he dribbles in, sole-rolls the ball onto his wrong side; the rival rushes in =================
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(liveChest(tt,tc));},still:5.6};
// ================= chapter 2 (LIVE, continued): the poke, the run-in, the rabona in real time, the goal, the celebration =================
const LIVE2=8.5;
const sc2:Scene={draw(s,t){const{tt,tc}=clock(1,t);live(s,LIVE2+tt,LIVE2+tc);},aperture(t){const{tt,tc}=clock(1,t);return aperture(liveChest(LIVE2+tt,LIVE2+tc));},still:3.2};

// ================= chapter 3 (REPLAY, the hero shot): slow motion from behind, close on the legs; ghost echoes and a diagram plate =================
const BALL_SPOT:Pt=[-.31,2.0];
const REP_HIT=contactBall(FACE_AWAY),REP_X=BALL_SPOT[0]-REP_HIT.ball[0],REP_Z=BALL_SPOT[1]-toMine(REP_HIT.ball)[2];
const rz3=(t:number)=>key(t,[[0,REP_Z-1.1],[2.09,REP_Z,easeOut]]),rx3=(t:number)=>key(t,[[0,REP_X+.12],[2.09,REP_X,easeOut]]);
const st3=(t:number):Stage=>({F:2000,eye:.5,cx:.15,cz:rz3(t)-3.95});
/** slow-motion rabona: run-in, plant (.25), a long slow wind-up while the voice explains, the wrap, contact (.58), a held instant */
const repT=(t:number)=>key(t,[[1.55,0],[2.09,.25],[4.93,.31],[5.7,.42],[6.47,.5],[7.77,RABONA_CONTACT],[8.92,.6],[10.2,.61]],linear);
const repR:Gen=t=>({pose:t<1.55?runCycle(t*.75,{speed:.6}):blendPose(runCycle(1.55*.75,{speed:.6}),rabona(repT(t)),sm(1.55,1.95,t,easeIO)),yaw:FACE_AWAY,X:rx3(t),Z:rz3(t)});
/** where two segments cross (or the closest point) — the X of the legs */
function cross(a:Pt,b:Pt,c:Pt,d:Pt):Pt{const r1:Pt=[b[0]-a[0],b[1]-a[1]],r2:Pt=[d[0]-c[0],d[1]-c[1]],den=r1[0]*r2[1]-r1[1]*r2[0];if(Math.abs(den)<1e-6)return L2(a,c,.5);const u=clamp(((c[0]-a[0])*r2[1]-(c[1]-a[1])*r2[0])/den);return[a[0]+r1[0]*u,a[1]+r1[1]*u];}
const keeperRear=(s:Sheet,st:Stage,t:number,dive=0)=>athlete(s,st,tt=>({pose:dive>0?keeperDive(dive,{side:'l'}):keeperSet(tt*1.3),yaw:FACE_CAMERA,X:GX,Z:GZ-.45}),t,KEEPER);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),ST3=st3(tt),P=(j:V3)=>{const m=toMine(j);return proj(ST3,m[0],m[1],m[2]);};
  const hit=pulse(t,7.77,.4),stomp=pulse(t,2.09,.4);
  camPath(s,t,[[0,-30,-90,1.02],[2.09,-50,-20,1.16],[2.86,-70,20,1.28],[3.63,-110,40,1.34],[4.93,-40,-10,1.3],[5.7,-40,0,1.34],[6.47,-70,40,1.5],[7.2,-90,60,1.6],[7.77,-110,90,1.72],[8.92,-150,140,2.2],[10.2,-155,144,2.28]],[9*hit*Math.sin(t*90),6*hit*Math.cos(t*77)+8*stomp]);
  arena(s,ST3,{t:tt,crowd:true,keeper:st=>keeperRear(s,st,tt)});
  const a=repR(tt),sk=solve(a.pose,PORTUGAL.build,placeAt(a.X,a.Z,a.yaw)),k=kAt(ST3,a.Z);
  const ballC=proj(ST3,BALL_SPOT[0],BALL_R,BALL_SPOT[1]),br=BALL_R*kAt(ST3,BALL_SPOT[1]);
  // the plant: a green disc under the standing foot, squeak rings and dust; "beside the ball": a dashed ring round the ball
  const lf=P(sk.lAn),lfG=proj(ST3,toMine(sk.lAn)[0],0,toMine(sk.lAn)[2]);
  if(tt>=2.86){const g=easeOutBack(sm(2.86,3.2,tt));s.fill(G,polyPath(blob(lfG[0],lfG[1],.2*k*g,.055*k*g,61,{n:20}),true),.6);}
  if(tt>=2.09&&tt<2.9){const u=sm(2.09,2.7,tt,easeOut);s.fill(Y,ribbon(blob(lfG[0],lfG[1],(.08+.26*u)*k,(.025+.07*u)*k,62,{n:22}),8*(1-u)+2,{seed:63,close:true,wobble:1.2}),1);dust(s,null,lf[0],lfG[1]-.02*k,(.12+.16*u)*k,12,{seed:64,size:9,spread:.4+u});}
  // the path of the kicking foot draws itself (dashed navy) with an arrow tip, from the wind-up round behind the standing leg to the ball
  const upto=Math.min(tt,7.77);
  if(upto>5.0){const pts:Pt[]=[];for(let q=0;q<=24;q++){const tk=lerp(4.93,upto,q/24),b=repR(tk);pts.push(P(solve(b.pose,PORTUGAL.build,placeAt(b.X,b.Z,b.yaw)).rToe));}dashed(s,K,pts,10,41,{dash:46});if(upto<7.73)arrowHead(s,K,pts,40,42);}
  shadow(s,ballC[0],proj(ST3,BALL_SPOT[0],0,BALL_SPOT[1])[1],br*1.2,br*.3,44,.45);
  if(tt<7.77)ball(s,ballC[0],ballC[1],br,45,{rot:.3});
  if(tt>=3.63){const ring=blob(ballC[0],ballC[1],br*1.45,br*1.45,65,{n:22});s.fill(R,ribbon(ring,8,{seed:66,close:true,wobble:1,gaps:dashGaps(ring,26)}),1);}
  // the legs: the standing leg's halo prints green on "standing foot", the kicking leg's yellow on "kicking leg"
  legHalo(s,ST3,sk,'l',G,sm(2.86,3.2,tt,easeOut)*(1-.6*sm(5.7,6.05,tt)),.45);legHalo(s,ST3,sk,'r',Y,sm(5.7,6.05,tt,easeOut),.6);
  athlete(s,ST3,repR,tt,PORTUGAL,{detail:'high',smear:tt>4.9&&tt<7.9?.45:0});
  // the ball squashed against the laces from the strike on (a frozen instant), printed over the boot
  if(tt>=7.77)ball(s,ballC[0]-br*.05,ballC[1],br,45,{sx:.88,sy:1.08,rot:.3});
  // the X: where the kicking shin crosses the standing shin — a navy ring prints and stays
  const xs=easeOutBack(sm(6.47,6.8,tt));
  if(xs>.02){const c=cross(P(sk.lKn),P(sk.lAn),P(sk.rKn),P(sk.rAn)),r=.13*k*xs;s.fill(K,ribbon(blob(c[0],c[1],r,r,46,{n:26}),9,{seed:47,close:true,wobble:1.3}));}
  // "behind it": the arrow curls round the back of the standing leg
  if(tt>=6.6){const u=sm(6.6,7.3,tt,easeOut),c=P(sk.lKn),pts:Pt[]=[];for(let q=0;q<=16;q++){const ang=-.2+q/16*Math.PI*1.05;pts.push([c[0]+Math.cos(ang)*.22*k,c[1]-.05*k-Math.sin(ang)*.08*k]);}
   const q=partial(pts,u);s.fill(R,ribbon(q,11,{seed:48,taper:.3,wobble:1}));if(u>.3)arrowHead(s,R,q,34,49);}
  // "strikes": an impact burst on the ball, speed lines toward the goal
  if(tt>=7.77){sparkBurst(s,Y,ballC[0]+br*.5,ballC[1]-br*.2,br*2.6,{n:11,seed:51,g:easeOut(sm(7.77,7.98,tt))});sparkBurst(s,R,ballC[0]+br*.5,ballC[1]-br*.2,br*1.8,{n:7,seed:52,g:easeOut(sm(7.8,8.1,tt)),cov:1});
   speedLines(s,K,ballC[0]-br*.9,ballC[1]-br*.3,Math.PI+.35,{n:4,seed:53,len:150,width:8,spread:50,cov:.8});}
  // "laces": a yellow halo round the boot where it meets the ball
  if(tt>=8.92){const c=L2(P(sk.rAn),P(sk.rToe),.55);s.fill(Y,ribbon(blob(c[0],c[1],.1*k,.07*k,54,{n:20}),10,{seed:55,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(2,t0),st=st3(tt),c=proj(st,BALL_SPOT[0],BALL_R,BALL_SPOT[1]),r=BALL_R*kAt(st,BALL_SPOT[1])*.85,q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([c[0]+Math.cos(ang)*r,c[1]+Math.sin(ang)*r]);}return aperture(q);},
 still:6.6,
};

// ================= chapter 4 (REPLAY reverse angle + lesson): the curl past the rival into the net; practise it slowly; smart choice =================
const ST4:Stage={F:1000,eye:1.6,cx:-.5,cz:-2.5};
const B0:[number,number,number]=[BALL_SPOT[0],BALL_R,BALL_SPOT[1]],B1:[number,number,number]=[-.25,1.0,6.2],B2:[number,number,number]=[-2.25,.8,GZ+.35];
function ball4(t:number):{X:number;Yh:number;Z:number;flying:boolean}{
 if(t<2.19){const u=Math.pow(clamp(t/2.19),1.25),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return{X:a*B0[0]+b*B1[0]+c*B2[0],Yh:a*B0[1]+b*B1[1]+c*B2[1],Z:a*B0[2]+b*B1[2]+c*B2[2],flying:true};}
 const d=sm(2.19,2.7,t,easeIn),bounce=Math.abs(Math.sin(sm(2.7,3.6,t)*Math.PI*2))*.15*(1-sm(2.7,3.6,t));return{X:B2[0]+.1*d,Yh:lerp(B2[1],BALL_R,d)+bounce,Z:B2[2],flying:false};
}
const r4:Gen=t=>{const tr=key(t,[[0,RABONA_CONTACT],[1.1,1]],linear);let pose=rabona(tr);pose=blendPose(pose,stand(),sm(1.1,1.6,t));pose=blendPose(pose,celebrate((t-2.3)*1.1,{kind:'arms'}),sm(2.3,2.6,t)*(1-sm(7.3,7.8,t)));return{pose,yaw:FACE_AWAY,X:REP_X,Z:REP_Z};};
const d4:Gen=t=>({pose:blendPose(lunge(key(t,[[0,.62],[1.4,1]],linear),{side:'r'}),stand(),sm(1.4,2.2,t)),yaw:FACE_CAMERA,X:1.75,Z:3.3});
const CARD_Y=720,CARD_W=190,CARDS:[number,number,number,string][]=[[-420,5.33,.25,'plant'],[0,5.84,.52,'swing'],[420,6.72,RABONA_CONTACT,'strike']];
const CARD_HIT=contactBall(0);
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0);
  const net=pulse(t,2.19,.5);
  camPath(s,t,[[0,80,250,2.0],[.8,20,190,1.75],[1.4,-20,140,1.7],[2.19,-20,130,1.6],[3.0,50,170,1.62],[3.7,50,175,1.64],[4.4,20,720,1.2],[7.4,20,730,1.22],[7.9,110,220,1.8],[9.77,120,200,1.86],[12,120,200,1.9]],[0,4*net*Math.sin(t*60)]);
  const b=ball4(tt),dive=key(tt,[[.9,0],[2.1,.62],[3.2,1]],linear);
  arena(s,ST4,{t:tt,cheer:sm(2.19,2.4,tt)*(1-.6*sm(4,5,tt))+.5*pulse(tt,9.77,1),flash:pulse(tt,2.19,1),bulge:.55*sm(2.0,2.19,tt)*(1-.6*sm(2.4,3.4,tt))+.12*settle(tt,2.19,{amp:1,freq:3,decay:3}),bx:B2[0],by:B2[1],keeper:st=>keeperRear(s,st,tt,dive)});
  const cardsUp=sm(4.4,4.5,tt)*(1-sm(7.4,7.45,tt));
  if(cardsUp<1)athlete(s,ST4,d4,tt,RIVAL);
  const g=proj(ST4,REP_X,0,REP_Z),h=kAt(ST4,REP_Z)*1.72;
  // "smart choice" diagram on the floor: the ghost ball, a red route to his right blocked by the rival, the green rabona route curling to goal
  const why=sm(7.85,8.25,tt,easeOut);
  if(why>.02){const gb=proj(ST4,B0[0],BALL_R,B0[2]);s.fill(K,circlePath(gb[0],gb[1],kAt(ST4,B0[2])*BALL_R),.32);
   const red:Pt[]=[[.35,2.05],[.5,2.5],[.55,2.85]].map(q=>proj(ST4,q[0],0,q[1])),jolt=sm(8.4,8.6,tt);dashed(s,R,red.map((q,i)=>i===2?[q[0]+10*jolt*Math.sin(tt*50),q[1]] as Pt:q),16,61,{progress:why,dash:40});
   if(jolt>0){const c=red[2];s.fill(R,ribbon([[c[0]-40,c[1]-40],[c[0]+40,c[1]+40]],16,{seed:62}),1);s.fill(R,ribbon([[c[0]+40,c[1]-40],[c[0]-40,c[1]+40]],16,{seed:63}),1);}
   const green:Pt[]=[];for(let k=0;k<=14;k++){const u=k/14,a=(1-u)*(1-u),bb=2*u*(1-u),c=u*u;green.push(proj(ST4,a*B0[0]+bb*B1[0]+c*B2[0],0,a*B0[2]+bb*B1[2]+c*B2[2]));}
   const gu=sm(8.6,9.4,tt,easeOut);dashed(s,G,green,18,64,{progress:gu,dash:56});if(gu>.9)arrowHead(s,G,green,56,65);}
  athlete(s,ST4,r4,tt,PORTUGAL,{smear:tt<.5?.1:0});
  // the ball in flight (trail + speed lines), then in the net
  const bp=proj(ST4,b.X,b.Yh,b.Z),br=kAt(ST4,b.Z)*BALL_R,bgp=proj(ST4,b.X,0,b.Z);
  if(b.flying){shadow(s,bgp[0],bgp[1],br*1.1,br*.3,66,.32);const trail:Pt[]=[];for(let k=0;k<=10;k++){const q=ball4(Math.max(0,tt-.5+k*.05));trail.push(proj(ST4,q.X,q.Yh,q.Z));}s.fill(Y,ribbon(trail,Math.max(24,br*1.5),{seed:67,taper:.9,wobble:.8}),1);
   speedLines(s,K,bp[0],bp[1],Math.atan2(bp[1]-proj(ST4,B0[0],B0[1],B0[2])[1],bp[0]-proj(ST4,B0[0],B0[1],B0[2])[0]),{n:4,seed:70,len:90,width:6,spread:30,cov:.8});}
  ball(s,bp[0],bp[1],Math.max(18,br),68,{rot:tt*9,smear:b.flying?.6:0,dir:-2.2});
  if(tt>=2.19&&tt<3.2)sparkBurst(s,Y,bp[0],bp[1],br*6,{n:12,seed:69,g:easeOut(sm(2.19,2.5,tt))*(1-sm(2.8,3.2,tt))});
  // "Practise it slowly": three paper cards rise into view, each prints one step of the move (a low camera behind the legs) on its cue
  const rise=sm(3.7,4.4,tt,easeOut),drop=sm(7.45,7.85,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.2);
   CARDS.forEach(([cx,t0c,pt,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+215;
    const fc=figureCam({x:cx-10,y:gy-20,height:600*(.9+.1*on),azimuth:-108,elevation:10,fov:14,at:[CARD_HIT.ball[0]*.5,0,CARD_HIT.ball[2]*.5]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=rabona(pt),sk=solve(pose,PORTUGAL.build,{}),bb=fc.project(CARD_HIT.ball),bR=BALL_R*(fc.scale?fc.scale(CARD_HIT.ball):100);
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    if(kind==='plant'){const f=fc.project([sk.lAn[0],0,sk.lAn[2]]);s.fill(G,polyPath(blob(f[0],f[1],bR*2.2,bR*.6,80,{n:18}),true),.6);}
    if(kind!=='strike')ball(s,bb[0],bb[1],bR,81+i);
    if(kind==='swing'){const pts:Pt[]=[];for(let q=0;q<=12;q++)pts.push(Pc(solve(rabona(lerp(.36,RABONA_CONTACT,q/12)),PORTUGAL.build,{}).rToe));dashed(s,K,pts,7,85,{dash:26});arrowHead(s,K,pts,24,86);}
    const halo=(side:'l'|'r',ink:string)=>{const hp=side==='l'?[sk.lHip,sk.lKn,sk.lAn,sk.lToe]:[sk.rHip,sk.rKn,sk.rAn,sk.rToe],kk=fc.scale?fc.scale(sk.pelvis):100;s.fill(ink,polyPath(tube(hp.map(Pc),[.3*kk,.24*kk,.2*kk,.2*kk]),true),ink===G?.6:.75);};
    if(kind==='plant')halo('l',G);if(kind==='swing')halo('r',Y);
    drawAthlete(s,pose,fc,{...PORTUGAL,detail:'mid',shadow:[K,.2]},{},{prev:rabona(pt-.03)});
    if(kind==='strike'){ball(s,bb[0],bb[1],bR,83,{sx:.9,sy:1.06});sparkBurst(s,Y,bb[0],bb[1],bR*2.4,{n:9,seed:84,g:on});}
    s.restore();});
   s.fill(K,frames);}
  // "smart choice": a big green tick stamps beside him, with a navy misregistered echo and a yellow burst
  const tick=easeOutBack(sm(9.77,10.1,tt));
  if(tick>.02){const c:Pt=[g[0]-h*.62,g[1]-h*.7],S=h*.32*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   sparkBurst(s,Y,c[0],c[1],S*1.3,{n:10,seed:87,g:tick});s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:88,taper:.2,wobble:1}),.45);s.fill(G,ribbon(tk,S*.24,{seed:89,taper:.2,wobble:1}));}
 },
 still:10.5,
};

const SCENES=[sc1,sc2,sc3,sc4];
const NARRATION=[
 'This is Ricardinho, Portugal’s futsal magician. The ball is on his wrong side, and a defender is rushing in.',
 'No time to switch feet. So he wraps one leg behind the other. Goal!',
 'Watch the replay. He plants his standing foot beside the ball, swings his kicking leg behind it, and strikes with the laces.',
 'It curls past the defender! That’s a rabona. Practise it slowly: plant, swing behind, strike. Only use it when it’s the smart choice.',
];
const film:RisoStory={
 id:'ricardinho-rabona',format:'futsal',title:'Ricardinho’s rabona',theme:'Wrap the kicking leg behind the standing leg.',ageNote:'For players aged 7–12: practise it slowly, and use it only when it is the smart choice.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 // Provisional timing: ~2.6 words per second with sentence pauses; audio is added later by the lead (real word onsets replace these `at`s).
 chapters:withTiming([
  {label:'Live: the problem',headline:{text:'Wrong side',at:5.07},narration:NARRATION[0],seconds:8.5,cues:[{at:.15,words:'This is'},{at:.92,words:'Ricardinho'},{at:2.07,words:'futsal magician'},{at:3.14,words:'The ball'},{at:4.68,words:'wrong side'},{at:6.22,words:'a defender'},{at:7.0,words:'rushing in'}]},
  {label:'Live: the rabona',narration:NARRATION[1],seconds:7.0,cues:[{at:.15,words:'No time'},{at:1.3,words:'switch feet'},{at:2.42,words:'So he'},{at:3.19,words:'wraps one leg'},{at:4.35,words:'behind the other'},{at:5.95,words:'Goal'}]},
  {label:'Replay: behind the leg',headline:{text:'Behind',at:5.37},narration:NARRATION[2],seconds:10.2,cues:[{at:.15,words:'Watch the replay'},{at:2.09,words:'plants'},{at:2.86,words:'standing foot'},{at:3.63,words:'beside the ball'},{at:4.93,words:'swings'},{at:5.7,words:'kicking leg'},{at:6.47,words:'behind it'},{at:7.77,words:'strikes'},{at:8.92,words:'laces'}]},
  {label:'Practise it',narration:NARRATION[3],seconds:12.0,cues:[{at:.15,words:'It curls'},{at:1.69,words:'past the defender'},{at:2.47,words:'That’s a rabona',headline:'Rabona'},{at:3.98,words:'Practise it slowly',headline:''},{at:5.33,words:'plant'},{at:5.84,words:'swing behind'},{at:6.72,words:'strike'},{at:7.46,words:'Only use it'},{at:9.77,words:'the smart choice',headline:'Smart choice'}]},
 ],timing as NarrationTiming),
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops onto the wood at the touch, squeaks (yellow/red rings) and bounces once; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.28,age,easeIn),by=y-160*(1-fall)-60*Math.max(0,Math.sin(clamp((age-.28)/.34)*Math.PI))*(age>.28?1:0);
  const u=clamp((age-.28)/.5),sq=age>.28&&age<.38?.14:0;
  if(age>.28&&u<1){s.fill(Y,ribbon(blob(x,y+r*.9,r*(1+2*u),r*(.3+.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(R,ribbon(blob(x,y+r*.9,r*(.6+1.3*u),r*(.2+.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  ball(s,x,by,r,seed,{sx:1+sq,sy:1-sq,rot:age*6});
  const rr=rng(seed);if(age>.28&&age<.7){const p=new Path2D();for(let i=0;i<8;i++){const a=rr()*TAU,d=r*(1+2.2*u);p.addPath(polyPath(blob(x+Math.cos(a)*d,y+r*.6+Math.sin(a)*d*.4,7,5,seed+i,{n:6}),true));}s.fill(i2(seed),p,1);}
 },
};
const i2=(seed:number)=>hash(seed,5)>.5?R:G;
export default film;
