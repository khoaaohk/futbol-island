/** Iconic play film — Cesc Fàbregas's pass for Andrés Iniesta's World Cup-winning goal, 2010 FIFA World Cup final, Netherlands 0–1 Spain
 * (after extra time), Soccer City, Johannesburg, 11 July 2010, 116th minute. The card is Fàbregas's, so the film is about THE PASS.
 * (lib/plays/riso/iniesta-final-2010.ts is Iniesta's own card film of the same goal; this file shares no code with it.)
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/fabregas-final-2010/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json; withTiming()
 * swaps the measured word onsets into the cues, and EVERY action time below is read from those cues.
 *
 * SOURCES (read Sep 26 2026):
 *  - Wikipedia, "2010 FIFA World Cup final" (extra time): "Spain then broke upfield through Torres, who passed into the centre where the
 *    ball bounced off a Netherlands defender. Fàbregas retrieved it and passed to Iniesta who was in space on the right-hand side of the
 *    penalty area. He took one touch with his right foot before striking the ball with his right foot on the half-volley past Stekelenburg
 *    into the left corner of the goal to give Spain the lead four minutes before the end." Heitinga had been sent off (Netherlands ten
 *    men); Fàbregas came on for Alonso; Spain changed into red only for the presentation (they played in their dark blue away kit).
 *  - FIFA / CNN / Goal.com retrospectives (via search): 116th minute, 1–0, Spain's first World Cup; "Fabregas ... slid a precise pass to
 *    Andrés Iniesta inside the box".
 * CONFIRMED: date, venue, minute, 0–0 before and 1–0 after, Torres's run and pass into the centre, the deflection off a Dutch defender,
 *  Fàbregas retrieving it and passing to Iniesta on the right side of the box, Iniesta's right-foot touch and right-foot half-volley into
 *  the left corner (the far corner from where he stood), Spain in dark blue, the Netherlands in orange.
 * INFERRED / ILLUSTRATIVE (the footage could not be reviewed in this session): Fàbregas's passing foot (drawn right, his stronger foot; the
 *  narration names no foot), exact positions/runs/distances, pass pace, the height of Iniesta's touch, which Dutch player the ball hit and
 *  who closed Iniesta (unnamed), shirt numbers' ink (yellow), Stekelenburg's kit (drawn light blue), the Netherlands' shorts/socks (drawn
 *  orange), crowd colours, the stadium (a generic bowl with a roof ring of lights, not Soccer City's calabash facade).
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (τ = 0
 * Fàbregas's pass). ch1 = the live, high main-stand camera in real time (Torres breaks, the deflection, Fàbregas, the pass, the touch,
 * the half-volley, the net); ch2 = the TV slow-motion replay low behind Fàbregas (head up, the slide-rule pass, Iniesta's finish);
 * ch3 = a lit lesson replay (stay calm, look up early, pass into the path). Seams: forward passages into the goal mouth and the ball.
 * Inks: yellow (floodlights, Spain's numbers and flags, grass with blue), orange (the Netherlands and their fans), blue (night sky, grass,
 * the keeper), navy (key line, Spain's dark blue kit). Scenes read only their local t; drawn objects pose on twos; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/fabregas-final-2010/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';
import {beats,shotAt,reframe,type Keep,type View as DView} from './director';

const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const K='navy',R='orange',Y='yellow',B='blue';
function frame(s:Sheet,zoom=1,rot=0,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,rot);}

// ---------------- 3D pinhole camera over a real pitch (metres; x → the goal line at 0, z → far touchline, y up) ----------------
type V3=[number,number,number];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
type Cam={p:V3;f:V3;r:V3;u:V3;F:number};
function makeCam(p:V3,look:V3,F:number):Cam{const f=nrm(sub(look,p)),r=nrm([f[2],0,-f[0]]),u:V3=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];return{p,f,r,u,F};}
const NEAR=.3;
const depthOf=(c:Cam,p:V3)=>dot(sub(p,c.p),c.f);
function P(c:Cam,p:V3):Pt{const d=sub(p,c.p),z=Math.max(NEAR,dot(d,c.f));return[c.F*dot(d,c.r)/z,-c.F*dot(d,c.u)/z];}
const kAt=(c:Cam,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Cam,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let S=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];S+=a[0]*b[1]-b[0]*a[1];}const r=S<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Cam,a:[number,number],b:[number,number],w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
/** keys forced to increase in time (a retime can never reorder a camera or a clock map) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}
type CK=[number,number,number,number,number,number,number,number];// t, pos xyz, look xyz, focal
/** the authored keyed camera as eye, aim point and focal (the director reframes it; makeCam builds it) */
const camOf=(t:number,K0:CK[])=>{const v=key(t,mono(K0) as unknown as Key[],easeIO,true);return{eye:[v[0],v[1],v[2]] as V3,target:[v[3],v[4],v[5]] as V3,F:v[6]};};

// ---------------- Soccer City at night: the bowl, the roof ring of floodlights, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: Dutch orange everywhere, Spain's red-and-yellow flags in blocks */
const CROWD=(()=>{const r=rng(2010),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===2?110:230;for(let i=0;i<n;i++){const c=r();out.push([st,r(),.04+r()*.92,c<.5?1:c<.8?2:0,r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-104;x<=2;x+=9)out.push([x,36,70]);for(let z=-60;z<=60;z+=11)out.push([38,36,z]);for(let x=-104;x<=2;x+=9)out.push([x,36,-70]);for(let z=-60;z<=60;z+=11)out.push([-143,36,z]);return out;})();
type Stadium={t:number;cheer?:number;flash?:number;net?:(p:V3)=>V3;lesson?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{t,cheer=0,flash=0,lesson=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night sky: heavy navy over blue
 s.field(B,.55,.6);s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),lesson?.7:.45);
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<10;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/10),bil(q,1,k/10),bil(q,1,(k+1)/10),bil(q,0,(k+1)/10)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],37,ub[2]],[ua[0],37,ua[2]]]));});
 s.knockout(stands);s.tone(K,stands,lesson?.8:.6);s.tone(R,terr,lesson?.1:.2);
 if(!lesson){const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
  for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
  if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.9);if(seen[2])s.fill(Y,heads[2],.95);
  if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}}
 s.fill(K,roof,.95);
 const halo=new Path2D(),core=new Path2D();LAMPS.forEach(l=>{if(depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp(4.8*k,14,380);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.3*k,6,150),h=clamp(.8*k,4,90);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
 s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.6);
 // grass: yellow × blue = green (the lesson prints it paler), mow stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);s.fill(Y,gp,lesson?.5:.88);s.tone(B,gp,lesson?.32:.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.18);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=4;i++){const a=Math.PI/2+i/4*Math.PI/2,pt:[number,number]=[Math.cos(a)*1,-34+Math.sin(a)*1];if(prev)L(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);
 // a corner flag
 {const f0:V3=[0,0,-34],f1:V3=[0,1.5,-34];if(depthOf(c,f0)>1&&depthOf(c,f1)>1){const a=P(c,f0),b=P(c,f1),w=Math.max(2,.05*kAt(c,f1));s.fill(K,ribbon([a,b],w,{taper:0,pressure:0}),.95);const fl=clipPoly(c,[f1,[0,1.2,-34],[-.45,1.35,-34]]);if(fl.length>2)s.fill(Y,polyPath(fl,true),.95);}}
 goal(s,c,o.net);
}
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);
 const fr=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];fr.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(fr);
}
/** the net ripple: a travelling ring pushed out from where the ball hits (age = real seconds since it crossed the line) */
const netRipple=(age:number,hy:number,hz:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hy,p[2]-hz)+Math.abs(p[0]-1)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.25,p[2]];};

// ---------------- figures (athlete library through this film's left-handed world: z negated both ways) ----------------
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
const SKIN:A.InkFill[]=[[Y,.88],[R,.2]];
const LINE={line:K,boots:K,hair:K,skin:SKIN,shade:[B,.32] as A.InkFill};
const SPAIN:A.AthleteStyle={...LINE,shirt:K,shorts:K,socks:K,numberInk:Y,hairStyle:'short',build:{height:1.78},seed:7};
const FABREGAS:A.AthleteStyle={...SPAIN,number:10,build:{height:1.8},seed:10};
const INIESTA:A.AthleteStyle={...SPAIN,number:6,hairStyle:'balding',build:{height:1.71,bulk:.92},seed:6};
const TORRES:A.AthleteStyle={...SPAIN,number:9,hairStyle:'long',build:{height:1.86},seed:9};
const HOLLAND:A.AthleteStyle={...LINE,shirt:R,shorts:R,socks:R,hairStyle:'short',build:{height:1.84},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:[B,.55],shorts:[B,.55],socks:[B,.55],gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.97},seed:13};
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:{depth:number;draw:()=>void}[]=[],detail:'auto'|A.Detail='auto',hero?:A.AthleteStyle){
 const pj=projector(c),items:{depth:number;draw:()=>void}[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail:hero&&bd.style===hero?'auto':detail};
  items.push({depth:d,draw:()=>{if(bd.smear)A.motionSmear(s,bd.prev,bd.pose,pj,style,place);A.drawAthlete(s,bd.pose,pj,style,place,{prev:bd.prev});}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;

// ---------------- narration and timing ----------------
const CHAPTERS:Chapter[]=withTiming([
 {label:'Extra time',narration:'Johannesburg, 2010. The World Cup final is still nil nil, deep in extra time. Spain break forward, the ball bounces loose, and Cesc Fàbregas finds Andrés Iniesta in space.',seconds:11,
  cues:[{at:0,words:'Johannesburg'},{at:1.3,words:'The World Cup final'},{at:3,words:'nil nil'},{at:4,words:'deep in extra time'},{at:5.6,words:'Spain break forward'},{at:7,words:'the ball bounces loose'},{at:8.5,words:'Cesc Fàbregas finds'},{at:9.6,words:'in space'}]},
 {label:'The pass',narration:'Watch Fàbregas again. He lifts his head, sees Iniesta alone on the right, and slides the ball into his path. One touch, then a shot, into the corner! Spain are world champions!',seconds:12,
  cues:[{at:0,words:'Watch Fàbregas again'},{at:1.3,words:'He lifts his head'},{at:2.5,words:'sees Iniesta alone'},{at:3.8,words:'slides the ball'},{at:5,words:'into his path'},{at:6.2,words:'One touch'},{at:7.2,words:'then a shot'},{at:8.2,words:'into the corner'},{at:9.5,words:'Spain are world champions'}]},
 {label:'Head up',narration:'Want to pass like Fàbregas? Stay calm, even when your legs are tired. Look up before the ball arrives. Then pass into your teammate’s path, not at his feet.',seconds:10,
  cues:[{at:0,words:'Want to pass'},{at:1.4,words:'Stay calm'},{at:2.3,words:'even when your legs are tired'},{at:4.2,words:'Look up'},{at:5,words:'before the ball arrives'},{at:6.6,words:'Then pass'},{at:7.4,words:'into your teammate’s path'},{at:8.8,words:'not at his feet'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`fabregas film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 Fàbregas's pass) ----------------
const G=9.81;
/** ballistic flight a→b in time d (straight in x/z, gravity in y) */
function flight(a:V3,b:V3,d:number,u:number):V3{const tt=clamp(u)*d,vy=(b[1]-a[1]+.5*G*d*d)/d;return[lerp(a[0],b[0],clamp(u)),a[1]+vy*tt-.5*G*tt*tt,lerp(a[2],b[2],clamp(u))];}
type MKey=[number,number,number];// τ, x, z
function moverPos(path:MKey[],tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 const p=path;let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const angLerp=(a:number,b:number,u:number)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
function moverState(path:MKey[],tau:number,ball:V3,idle:()=>A.Pose=A.stand):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(path,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number){return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),[x,y]=q,r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,x,y,r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
/** a piecewise clock map t → τ through [t, τ] keys (monotone) */
const clockMap=(t:number,K0:[number,number][])=>key(t,mono(K0) as unknown as Key[],x=>x);
function dashed(s:Sheet,pts:Pt[],w:number,g:number){const n=pts.length,m=Math.max(2,Math.round(n*g));const q=pts.slice(0,m);if(q.length<2)return;const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.12)gaps.push([x,x+.05]);s.fill(Y,ribbon(q,w,{taper:.1,pressure:.2,wobble:.8,gaps}),.95);}
const TOR:MKey[]=[[-5,-50,12],[-1.75,-31.5,6.5],[-1.2,-30,6],[3,-25.5,7.5]];// Torres runs with it, passes into the centre (then jogs on wide — illustrative, kept out of the ch2 replay lens)
const TOR_PASS=-1.75,T_DEF=-1.12,T_TOUCH=-.4;
const DEF_PT:V3=[-24.3,.3,2.6];// the ball hits a Dutch defender's shin
const FAB_G:[number,number]=[-21.4,-.7],FAB_YAW=Math.atan2(-8.9-FAB_G[1],-13.2-FAB_G[0]);
const FAB:MKey[]=[[-5,-27,-5],[-1.2,-23.3,-2.4],[T_TOUCH,-21.9,-1.1],[0,FAB_G[0],FAB_G[1]],[1.2,-20,-2.5],[4,-16,-4]];
const fPass=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+tau/.9),{foot:'r',power:.4});
const FAB_BUILD:A.Build={height:1.8};
const toeAt=(pose:A.Pose,b:A.Build,g:[number,number],yaw:number,foot:'l'|'r'):V3=>{const sk=A.solve(pose,b,{x:g[0],z:-g[1],yaw}),m=foot==='r'?mix3(sk.rAn,sk.rToe,.6):mix3(sk.lAn,sk.lToe,.6);return[m[0],m[1],-m[2]];};
const PASS_PT:V3=(()=>{const q=toeAt(fPass(0),FAB_BUILD,FAB_G,FAB_YAW,'r');return[q[0],.11,q[2]];})();
const T_REC=.8,T_ITOUCH=.88,T_SHOT=1.44,T_IN=T_SHOT+.4;
const INI_G:[number,number]=[-12.6,-8.7];
const INI_YAW=Math.atan2(2.95-INI_G[1],0-INI_G[0]);
const INI_BUILD:A.Build={height:1.71,bulk:.92};
const iShot=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+(tau-T_SHOT)/1),{foot:'r',power:1});
const SHOT_PT:V3=(()=>{const q=toeAt(iShot(T_SHOT),INI_BUILD,INI_G,INI_YAW,'r');return[q[0],Math.max(.18,q[1]+.1),q[2]];})();
const REC_PT:V3=[SHOT_PT[0]-1.25,.11,SHOT_PT[2]-.5];// where the pass meets his right foot (his touch knocks it on and up)
const INI:MKey[]=[[-5,-19,-13],[-1,-15.5,-10.6],[T_REC,REC_PT[0]-.55,REC_PT[2]-.35],[T_SHOT-.3,INI_G[0],INI_G[1]],[T_SHOT+.9,-10.2,-8.2],[T_SHOT+4,-6,-16]];
const GOALIN:V3=[.9,.42,3.0];// the left corner from Iniesta: low, just inside the far post
function ballT(tau:number):V3{
 if(tau<TOR_PASS){const q=moverPos(TOR,tau),v=Math.hypot(q.vx,q.vz)||1;return[q.x+q.vx/v*.6,.11,q.z+q.vz/v*.6];}
 if(tau<T_DEF){const a=ballT(TOR_PASS-.001),u=(tau-TOR_PASS)/(T_DEF-TOR_PASS);return[lerp(a[0],DEF_PT[0],u),.11+.19*u,lerp(a[2],DEF_PT[2],u)];}
 if(tau<T_TOUCH){const u=easeOut((tau-T_DEF)/(T_TOUCH-T_DEF)),to:V3=[PASS_PT[0]-.5,.11,PASS_PT[2]+.45];const p=mix3(DEF_PT,to,u);p[1]=lerp(DEF_PT[1],.11,u)+.25*Math.sin(u*Math.PI)*(1-u);return p;}
 if(tau<0){const u=easeOut((tau-T_TOUCH)/-T_TOUCH);return mix3([PASS_PT[0]-.5,.11,PASS_PT[2]+.45],PASS_PT,u);}
 if(tau<T_REC){const u=tau/T_REC,p=mix3(PASS_PT,REC_PT,1-Math.pow(1-u,1.25));p[1]=.11;return p;}
 if(tau<T_ITOUCH)return REC_PT;
 if(tau<T_SHOT){const u=(tau-T_ITOUCH)/(T_SHOT-T_ITOUCH),p=mix3(REC_PT,SHOT_PT,u),bounce=u<.72?.62*Math.sin(u/.72*Math.PI):.22*Math.sin((u-.72)/.28*Math.PI*.5);p[1]=.11+bounce;return p;}
 if(tau<T_IN){const u=(tau-T_SHOT)/(T_IN-T_SHOT),p=mix3(SHOT_PT,GOALIN,u);p[1]+=.25*Math.sin(u*Math.PI);return p;}
 const d=clamp((tau-T_IN)/.5);return[GOALIN[0]+.6*d,Math.max(.11,GOALIN[1]*(1-d*d)+.11*d*d),GOALIN[2]-.1*d];}
const KEEP_G:[number,number]=[-1.4,-.5];
function keeperState(tau:number){const t0=T_SHOT+.3-.55*1.05,pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-t0)/1.05),{side:'r',height:.2});return{x:KEEP_G[0],z:KEEP_G[1],yaw:Math.PI,pose};}
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:{...HOLLAND,seed:21},path:[[-5,-26,5],[T_DEF,-24.9,3],[1,-24.6,5.2],[4,-23.5,8]]},// the defender the ball comes off (then turns away toward the far side — illustrative, kept out of the ch2 replay lens)
 {style:{...HOLLAND,seed:22},path:[[-5,-17,-2],[0,-15.8,-5.6],[T_SHOT,-14.4,-7.2],[4,-13.6,-7.6]]},// closing Iniesta, a step late
 {style:{...HOLLAND,seed:23},path:[[-5,-15,6],[1,-11.5,4.8],[4,-9.5,4.6]]},
 {style:{...HOLLAND,seed:24},path:[[-5,-18,10],[1,-14,6],[4,-11,5]]},
 {style:{...HOLLAND,seed:25},path:[[-5,-30,-2],[0,-26,-3],[4,-24,-7.5]]},// (tracks back wide — illustrative, clears the ch2 replay frame instead of half-leaving it)
 {style:{...SPAIN,seed:26},path:[[-5,-24,14],[0,-17,10],[4,-12,8]]},
];
function fabState(tau:number,ball:V3){const st=moverState(FAB,tau,ball),w=sm(-.55,-.35,tau)*(1-sm(.45,.8,tau));
 let pose=A.blendPose(st.pose,fPass(tau),w);
 // head up: he looks at Iniesta before the pass (neck turned toward the run), then at the ball as he strikes it
 if(tau<-.1)pose={...pose,neckP:pose.neckP-.35*sm(-1.2,-.7,tau)*(1-sm(-.3,-.1,tau))};
 return{...st,yaw:angLerp(st.yaw,FAB_YAW,w),pose};}
function iniState(tau:number,ball:V3){const st=moverState(INI,tau,ball);
 const touch=sm(T_ITOUCH-.3,T_ITOUCH-.1,tau)*(1-sm(T_ITOUCH+.15,T_ITOUCH+.3,tau)),shot=sm(T_SHOT-.55,T_SHOT-.4,tau)*(1-sm(T_SHOT+.5,T_SHOT+.9,tau));
 let pose=A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_ITOUCH)/.7),{foot:'r',power:.15}),touch);
 pose=A.blendPose(pose,iShot(tau),shot);
 if(tau>T_SHOT+.9)pose=A.blendPose(pose,A.celebrate(tau*1.3,{kind:'run'}),sm(T_SHOT+.9,T_SHOT+1.4,tau));
 return{...st,yaw:angLerp(st.yaw,INI_YAW,Math.max(touch,shot)),pose};}
function torState(tau:number,ball:V3){const st=moverState(TOR,tau,ball,A.stand),w=sm(TOR_PASS-.55,TOR_PASS-.35,tau)*(1-sm(TOR_PASS+.4,TOR_PASS+.7,tau));
 let pose=tau<TOR_PASS-.55?A.blendPose(st.pose,A.dribble(((moverPos(TOR,tau).dist/1.9)%1+1)%1,{foot:'r',speed:.9}),.6):st.pose;pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-TOR_PASS)/.9),{foot:'r',power:.5}),w);
 return{...st,pose};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...torState(t,b),style:TORRES});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...fabState(t,b),style:FABREGAS,smear:t>-.25&&t<.25},{...iniState(t,b),style:INIESTA,smear:t>T_SHOT-.25&&t<T_SHOT+.3},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netFor=(tau:number)=>{const age=tau-T_IN;return age>0?netRipple(age,GOALIN[1],GOALIN[2]):undefined;};

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({sb:T(0,'Spain break forward'),bl:T(0,'the ball bounces loose'),fi:T(0,'Cesc Fàbregas finds'),end:SEC(0)});
/** real time, anchored so the pass is played as "Fàbregas finds" is said (the goal then lands before the seam) */
const tau1=(t:number)=>{const q=ch1T();return t-Math.min(q.fi+.25,q.end-.75-T_IN-.25);};
/** the camera's aim: the ball, smoothed over the last .3 s of play, a little above the grass */
const aimAt=(tau:number):V3=>{const a=ballT(tau),b=ballT(tau-.15),c=ballT(tau-.3);return[(a[0]+b[0]+c[0])/3,1.2,(a[2]+b[2]+c[2])/3];};
/** the window in camera units (set by each scene's draw; read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** who the ch1 shot is about at τ (every weight eases, nothing cuts): the key player (Torres → Fàbregas → Iniesta), the receiver to keep
 * (Fàbregas while Torres plays it into the centre, then Iniesta while Fàbregas weighs the pass) and, for the finish, the goal mouth.
 * X = the second subject the shot holds with the key player (the ball, swung to the receiver, then to the goal). */
const GOAL_C:V3=[0,1.2,0];
function ch1Subject(tau:number){const tor=moverPos(TOR,tau),fab=moverPos(FAB,tau),ini=moverPos(INI,tau),ball=ballT(tau);
 const u1=sm(-1.9,-.9,tau,easeInOutSine),u2=sm(.3,.8,tau,easeInOutSine),hero:V3=[lerp(lerp(tor.x,fab.x,u1),ini.x,u2),0,lerp(lerp(tor.z,fab.z,u1),ini.z,u2)];
 const wF=sm(-3,-1.85,tau,x=>x)*(1-u1),wI=sm(-1.9,-.8,tau)*(1-u2),wR=Math.max(wF,wI),wG=sm(T_ITOUCH,T_SHOT,tau),sw=wF+wI||1;
 // for the finish X is the ball held within 2.5 m of Iniesta: the shot swings round behind him so the goal lines up beyond him instead
 const rc:V3=[(fab.x*wF+ini.x*wI)/sw,1,(fab.z*wF+ini.z*wI)/sw],bd=Math.hypot(ball[0]-hero[0],ball[2]-hero[2]),bc=mix3(hero,ball,lerp(1,Math.min(1,2.5/(bd||1)),u2));
 const X=mix3([bc[0],ball[1],bc[2]],rc,wR);
 return{fab,ini,hero,ball,wF,wI,wG,X,u2,w:Math.max(wR,wG)};}
function ch1CamAuthored(t:number){const tau=tau1(t),q=ch1T(),a=aimAt(tau),g=sm(T_SHOT-.2,T_IN+.3,tau,easeInOutSine),look0=mix3(a,[-3,1.2,-1.5],g*.6);
 const F0=key(tau,mono<number[]>([[-9,3300],[-3,3700],[0,4200],[T_SHOT,4600],[T_IN+.8,4900],[q.end,4500]]) as unknown as Key[],easeIO);
 // the broadcast operator holds the story: the key player, the ball and the second subject (the receiver for the pass, the goal mouth for
 // the finish) — aimed at their middle, and widened just enough that all three sit inside the window
 const S=ch1Subject(tau);if(S.w<=0)return{eye:[look0[0]-8,16,-50] as V3,target:look0,F:F0};
 const pts:V3[]=[[S.hero[0],1,S.hero[2]],S.ball,S.X,mix3(S.ball,GOAL_C,S.wG)],x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),z0=Math.min(...pts.map(p=>p[2])),z1=Math.max(...pts.map(p=>p[2]));
 const look=mix3(look0,[(x0+x1)/2,1.2,(z0+z1)/2],S.w),eye:V3=[look[0]-8,16,-50],c0=makeCam(eye,look,F0),pp=pts.map(p=>P(c0,p));
 const need=Math.max(1,...pp.map(q=>Math.max(Math.abs(q[0])/(.38*DV.w),Math.abs(q[1])/(.32*DV.h))));
 return{eye,target:look,F:F0/lerp(1,need,S.w)};}
const DUTCH=OTHERS.filter(o=>o.style.shirt===R);
/** a soft keep only counts as far as the authored camera already shows it (so the authored frame always fits and the director never snaps) */
const inView=(c0:Cam,p:V3)=>{if(depthOf(c0,p)<1)return 0;const q=P(c0,p);return 1-sm(.68,.84,Math.max(Math.abs(q[0])/(DV.w/2),Math.abs(q[1])/(DV.h/2)));};
const softPt=(c0:Cam,p:V3,w0:number):Keep[]=>{const w=w0*inView(c0,p);return w>.01?[{P:p,w}]:[];};
const softPlayer=(c0:Cam,x:number,z:number,w0:number):Keep[]=>{const f:V3=[x,0,z],h:V3=[x,1.8,z],w=w0*Math.min(inView(c0,f),inView(c0,h));return w>.01?[{P:f,w},{P:h,w}]:[];};
/** the largest shot (hero height ÷ window height) that still holds every point beside the hero, judged sideways from where the director puts
 * the eye (the authored bearing swung by az°); weights scale each point's pull so a keep easing in widens the shot smoothly */
function gapFit(eye:V3,hero:V3,azDeg:number,pts:[V3,number][]){const v0=sub(eye,[hero[0],1,hero[2]]),az=Math.atan2(v0[2],v0[0])+azDeg*Math.PI/180,px=-Math.sin(az),pz=Math.cos(az);
 const gap=Math.max(0,...pts.map(([p,w])=>w*Math.abs((p[0]-hero[0])*px+(p[2]-hero[2])*pz)));return Math.max(.14,1.8*.7*(DV.w/DV.h)/(gap+1.2));}
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026), chapter 1 in football terms: a short establishing wide of the bowl, then follow
 * the ball carrier (Torres breaking). Pull out to a SPACE shot as Torres plays it into the centre and hold it through the bounce and
 * Fàbregas's pass, aimed between the passer and the receiver (first Fàbregas, then Iniesta in space on the right) and only as wide as
 * their gap needs, so the viewer sees the space and the decision. As the pass arrives, push in low and tight on Iniesta, swinging round
 * behind him so the goal lines up beyond him (the touch, the half-volley and the far corner in one frame), then hold on him as the net
 * ripples. The key player hands over Torres → Fàbregas → Iniesta, each over half a second to a second (never a cut). */
const C1=ch1T(),T1=(tau:number)=>tau+(C1.fi-tau1(C1.fi));
const B1=beats([[0,'wide'],[1.2,'follow'],[T1(-3),{from:'space',size:.24}],[T1(.2),{from:'tight',az:-30}],[T1(T_IN)+.3,{from:'reaction',az:-35}]]);
function ch1Cam(t:number){const c=ch1CamAuthored(t),c0=makeCam(c.eye,c.target,c.F),tau=tau1(t),S=ch1Subject(tau),sh=shotAt(t,B1);
 // the focus sits midway between the key player and X; the shot is never tighter than the sideways gap between them allows (as seen
 // from where the director will put the eye), so the receiver / the goal stays in by framing rather than by backing the move off
 // (judged a little ahead so the frame opens before it is needed, and released over the last second so a push-in after the pass eases in
 // instead of jumping: pull-outs follow the play at once, push-ins at the director's own pace)
 const fit=(d:number)=>{const Q=d?ch1Subject(tau+d):S;return gapFit(c.eye,Q.hero,sh.az,[[Q.X,1],[Q.ball,1]]);};
 const sFit=Math.min(fit(0),fit(.35),Math.exp([-1,-.75,-.5,-.25,0].reduce((a,d)=>a+Math.log(fit(d)),0)/5));
 const p={...sh,ball:lerp(sh.ball,.5,S.w),size:Math.min(sh.size,sFit)},wG=sm(T_SHOT,T_IN,tau);
 const keep:Keep[]=[S.ball,...softPlayer(c0,S.fab.x,S.fab.z,S.wF),...softPlayer(c0,S.ini.x,S.ini.z,S.wI),...softPt(c0,GOAL_C,wG),...softPt(c0,[0,2.44,0],.9*wG),
  ...DUTCH.flatMap(o=>{const m=moverPos(o.path,tau),d=Math.hypot(m.x-S.hero[0],m.z-S.hero[2]);return softPlayer(c0,m.x,m.z,(1-sm(2.5,5,d,x=>x))*(1-S.u2));})];
 const r=reframe(c,{hero:S.hero,ball:S.X,keep},p,DV);return makeCam(r.eye,r.target,r.F);}
const ch1:Scene={
 draw(s,t){DV={w:s.W,h:s.H};const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-T_IN,close=shotAt(t,B1).size>.4;
  frame(s);stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.25+1.2*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,16)],'low',close?(tau<.55?FABREGAS:INIESTA):undefined);},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9,
};

// ---------------- ch2: TV replay, slow motion, low behind Fàbregas ----------------
const ch2T=()=>({lh:T(1,'He lifts his head'),si:T(1,'sees Iniesta alone'),sl:T(1,'slides the ball'),ip:T(1,'into his path'),ot:T(1,'One touch'),sh:T(1,'then a shot'),co:T(1,'into the corner'),wc:T(1,'Spain are world champions'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,-1.45],[q.lh+.3,-.8],[q.sl+.25,0],[q.ot+.1,T_ITOUCH],[q.sh+.3,T_SHOT],[q.co+.3,T_IN],[q.wc+.6,T_IN+.8],[q.end,T_IN+2.8]]);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),a=aimAt(tau),ini=moverPos(INI,tau),w=sm(q.lh,q.si+.4,t)*(1-sm(q.sl,q.sl+.6,t));
 // head up: the aim swings from the ball to Iniesta while Fàbregas looks, then follows the pass and the shot
 // until the pass the aim also holds Fàbregas (knee-to-chest height), so his whole body stays in the window (aiming at the ball alone
 // cut him at the frame edge — only a boot showed); the eye sits behind him on his right and a little higher, where Fàbregas and Iniesta share one bearing and both nearby Dutch players fall outside the frame (the old low eye at z 3.2 sat on the defender's line, and he
 // walked right past the lens and filled the frame with his legs cut off)
 const fab=moverPos(FAB,tau),hold=.6*(1-sm(q.sl+.25,q.ot,t));
 const look=mix3(mix3(a,[fab.x,.9,fab.z],hold),[ini.x,1.2,ini.z],w*.6);
 const v=key(t,mono<number[]>([[0,-34,3.8,5,1200],[q.si,-31.4,3.4,3.6,1300],[q.ot,-29.8,3.4,3,1550],[q.co+.5,-29,3.5,2.6,1750],[q.end,-29,3.7,2.6,1500]]) as unknown as Key[],easeIO,true);
 return makeCam([v[0],v[1],v[2]],look,v[3]);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const hit=q.co+.3,shake=t>=hit?8*settle(t,hit,{freq:6,decay:6}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(q.co+.3,q.co+.8,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.4,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,26)]);
  const ps=q.sl+.25;if(tt>=ps&&tt<ps+.5){const p=P(c,PASS_PT);sparkBurst(s,Y,p[0],p[1],70+70*sm(ps,ps+.12,tt,easeOut),{n:8,seed:41,g:1-sm(ps+.2,ps+.5,tt),width:10});}},
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(26,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.9,12);},
 still:6,
};

// ---------------- ch3: lesson replay from above and behind Fàbregas — calm, look up early, pass into the path ----------------
const ch3T=()=>({sc:T(2,'Stay calm'),lu:T(2,'Look up'),ba:T(2,'before the ball arrives'),tp:T(2,'Then pass'),path:T(2,'into your teammate’s path'),feet:T(2,'not at his feet'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,-1.6],[q.sc,-1.3],[q.lu,-.95],[q.tp+.2,-.02],[q.path+.1,0],[q.feet+.5,T_REC],[q.end,T_ITOUCH+.2]]);};
function ch3CamAuthored(t:number){const q=ch3T();return camOf(t,[[0,-34,11,4,-19,.5,-2.5,1350],[q.lu,-33.6,10.8,3.5,-17,.5,-4,1400],[q.tp,-33,10.6,3,-16,.5,-5,1480],[q.end,-32.4,10.4,2.5,-15,.5,-6,1560]]);}
/** Director beats, chapter 3 (the lesson): a LESSON shot on Fàbregas from the first frame (the passage opens straight onto him), with
 * everything the marks teach kept in frame the whole time (so nothing pops as a mark arrives): Iniesta (the sight line), the start of his
 * run (the arrow), the target ring in his path, and the ball once it is on its way to Fàbregas. */
const B3=beats([[0,{from:'lesson',ball:0}]]);
const RUN0=(()=>{const m=moverPos(INI,-1.5);return[m.x,0,m.z] as V3;})();
function ch3Cam(t:number){const q=ch3T(),c=ch3CamAuthored(t),tau=tau3(t),fab=moverPos(FAB,tau),ini=moverPos(INI,tau),wB=sm(q.lu,q.ba,t);
 const keep:Keep[]=[[ini.x,0,ini.z],[ini.x,1.75,ini.z],RUN0,REC_PT,...(wB>.01?[{P:ballT(tau),w:wB}]:[])];
 const r=reframe(c,{hero:[fab.x,0,fab.z],keep},shotAt(t,B3),DV);return makeCam(r.eye,r.target,r.F);}
const ch3:Scene={
 draw(s,t){DV={w:s.W,h:s.H};const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true});
  const fb=moverPos(FAB,tau);
  // stay calm: a slow breathing ring around Fàbregas
  const calm=sm(q.sc,q.sc+.5,tt,easeOutBack)*(1-sm(q.tp,q.tp+.4,tt));if(calm>.02){const r=(1.2+.25*Math.sin(tt*2.4))*calm,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[fb.x+Math.cos(a)*r,.04,fb.z+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),12,.95);}
  // the pass into the path: a dashed line to the spot ahead of Iniesta, and a target ring there
  const pp=sm(q.tp,q.tp+.6,tt,easeOut);if(pp>0){const pts:Pt[]=[];for(let i=0;i<=16;i++)pts.push(P(c,mix3(PASS_PT,REC_PT,i/16)));dashed(s,pts,16,pp);}
  const ring=sm(q.path,q.path+.4,tt,easeOutBack)*(1-sm(q.end-.6,q.end,tt));if(ring>.02){for(let k=0;k<2;k++){const r=(.7+k*.5)*ring,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[REC_PT[0]+Math.cos(a)*r,.04,REC_PT[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),12-k*3,.95);}}
  // not at his feet: Iniesta's run drawn as an arrow INTO the ring
  const run=sm(q.feet,q.feet+.5,tt,easeOut);if(run>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const m=moverPos(INI,lerp(-1.5,T_REC,i/14));pts.push(P(c,[m.x,.05,m.z]));}dashed(s,pts,14,run);}
  // heat: the closer lesson framing would promote every figure to full detail; only Fàbregas (the passer the lesson is about) gets it
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)],'low',FABREGAS);
  // look up: a dashed sight line from his eyes to Iniesta, drawn over the players
  const look=sm(q.lu,q.lu+.45,tt,easeOut)*(1-sm(q.tp+.3,q.tp+.7,tt));if(look>.02){const ini=moverPos(INI,tau),a=P(c,[fb.x,1.72,fb.z]),b=P(c,[ini.x,1.6,ini.z]);const pts:Pt[]=[];for(let i=0;i<=12;i++)pts.push([lerp(a[0],b[0],i/12),lerp(a[1],b[1],i/12)]);dashed(s,pts,10,look);}},
 still:7,
};

const story:RisoStory={
 id:'fabregas-final-2010',format:'11v11',title:"Fàbregas's winning pass",
 theme:'Stay calm, look up early and pass into your teammate’s path.',
 ageNote:'2010 World Cup final, Netherlands 0–1 Spain (after extra time), Soccer City, Johannesburg, 11 July 2010.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a pass rolls out from the point to a yellow target ring. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=(r()-.5)*1.2,g=age<=0?1:easeOutBack(clamp(age/.3)),u=age<=0?1:easeOut(clamp(age/.6)),tx=x+Math.cos(a)*170,ty=y+Math.sin(a)*60;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[tx+Math.cos(q)*70*g,ty+Math.sin(q)*24*g] as Pt;}),true),10,.95);
  ballAt(s,lerp(x,tx,u),lerp(y,ty,u),44,age*12+hash(seed,3)*TAU);
 },
};
export default story;
