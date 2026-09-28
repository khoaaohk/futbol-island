/** Iconic play film — Olivier Giroud's scorpion kick, Premier League, Arsenal 2–0 Crystal Palace, Emirates Stadium, London,
 * 1 January 2017, 17th minute: his flick starts the counter-attack, he sprints about 60 yards, Alexis Sánchez's cross comes in behind him
 * and he flicks it with his LEFT heel over his own head, over Wayne Hennessey and in off the underside of the bar. 2017 FIFA Puskás Award.
 * No special template: the movement (the flick, the sprint, the dive forward, the left heel coming up behind him) is built from the
 * athlete library's joints with authored keys (scorpion() below).
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/giroud-scorpion-2017/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json; withTiming()
 * swaps the measured word onsets into the cues, and EVERY action time below is read from those cues.
 *
 * SOURCES (read Sep 26 2026):
 *  - Wikipedia, "Olivier Giroud": "On 1 January 2017, Giroud scored with a backheeled 'scorpion kick' volley in a 2–0 win against Crystal
 *    Palace ... The goal later earned him the FIFA Puskás Award for the goal of the year."
 *  - Sports Mole, "On This Day: Olivier Giroud scores scorpion kick against Crystal Palace" / Arsenal.com (via search): "Giroud began a
 *    counter-attack with a flick, Iwobi fed Sanchez on the left-hand side, and Sanchez looked for Giroud in the Palace box. Sanchez's ball
 *    was behind Giroud, but the Frenchman improvised brilliantly with a back-heeled volley over his head which crashed in off the underside
 *    of the crossbar"; "a sprinting Giroud turned to stick out his left foot, flicked the ball over his head and saw it arc over the leap of
 *    Palace goalkeeper Wayne Hennessey, off the woodwork and into the net"; Arsenal: "Sprint 60 yards in eight seconds"; 17th minute.
 *  - Sky Sports report (via search): "a rainy Emirates Stadium"; Iwobi's header made it 2–0 in the second half.
 * CONFIRMED: date, venue, opponent, minute, the flick that started the counter, Iwobi to Sánchez on the left, Sánchez's cross behind Giroud,
 *  the LEFT-heel scorpion over his own head, over Hennessey's leap, in off the underside of the bar, the ≈ 60-yard sprint, the rain.
 * INFERRED / ILLUSTRATIVE (the footage could not be reviewed in this session): every position and run in metres, Sánchez's crossing foot
 *  (drawn right; not narrated), Iwobi's route, exact heights and flight times, the kind of flick that started the move, Crystal Palace's
 *  kit (drawn yellow, their 2016–17 away colour — likely but not verified), Hennessey's kit (drawn light blue), the crowd.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (τ = 0 the
 * heel strikes the ball). ch1 = the live, high main-stand camera in real time (the flick, the counter, the sprint, the cross, the scorpion,
 * the bar, the net); ch2 = the TV replay low from the far side of the box (the ball behind him, the dive forward, the left heel, the loop
 * over Hennessey, in off the bar); ch3 = a lit lesson replay (ball behind you → eyes on it → stay calm → be creative with the heel).
 * Seams: the goal mouth, then the ball. Inks: yellow (floodlights, Palace as drawn, grass with blue), red (Arsenal, the crowd, skin), blue
 * (night sky, grass, keeper), navy (key line). Scenes read only their local t; drawn objects pose on twos; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/giroud-scorpion-2017/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const K='navy',R='red',Y='yellow',B='blue';
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
const camOf=(t:number,K0:CK[])=>{const v=key(t,mono(K0) as unknown as Key[],easeIO,true);return makeCam([v[0],v[1],v[2]],[v[3],v[4],v[5]],v[6]);};

// ---------------- the Emirates under floodlights in the rain: bowl, roof, floodlights, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: Arsenal red and white, a small Palace end in blue */
const CROWD=(()=>{const r=rng(2017),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=240;for(let i=0;i<n;i++){const c=r(),u=r(),away=st===2&&u<.2;out.push([st,u,.04+r()*.92,away?(c<.7?2:1):(c<.55?1:c<.93?0:2),r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-104;x<=2;x+=9)out.push([x,36,70]);for(let z=-60;z<=60;z+=11)out.push([38,36,z]);for(let x=-104;x<=2;x+=9)out.push([x,36,-70]);for(let z=-60;z<=60;z+=11)out.push([-143,36,z]);return out;})();
type Stadium={t:number;cheer?:number;flash?:number;net?:(p:V3)=>V3;lesson?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{t,cheer=0,flash=0,lesson=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night sky: heavy navy over blue, rain streaks in paper
 s.field(B,.55,.6);s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),lesson?.7:.45);
 if(!lesson){const rain=new Path2D(),r=rng(77+Math.floor(tt*12));for(let i=0;i<26;i++){const x=(r()-.5)*s.W*1.2,y=(r()-.5)*s.H*1.2,l=40+r()*60;rain.addPath(polyPath([[x,y],[x+2.5,y],[x+2.5-l*.18,y+l],[x-l*.18,y+l]],true));}s.knockout(rain,.55);}
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<10;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/10),bil(q,1,k/10),bil(q,1,(k+1)/10),bil(q,0,(k+1)/10)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],37,ub[2]],[ua[0],37,ua[2]]]));});
 s.knockout(stands);s.tone(K,stands,lesson?.8:.6);s.tone(R,terr,lesson?.1:.2);
 if(!lesson){const heads=[new Path2D(),new Path2D(),new Path2D()];const seen=[0,0,0];
  for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
  if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.9);if(seen[2])s.fill(B,heads[2],.95);
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
const ARSENAL:A.AthleteStyle={...LINE,shirt:R,trim:'paper',shorts:'paper',socks:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8},seed:7};
const GIROUD:A.AthleteStyle={...ARSENAL,number:12,build:{height:1.93,bulk:1.05},seed:12};
const SANCHEZ:A.AthleteStyle={...ARSENAL,number:7,build:{height:1.69},seed:17};
const IWOBI:A.AthleteStyle={...ARSENAL,number:17,build:{height:1.8},hairStyle:'curly',seed:27};
const PALACE:A.AthleteStyle={...LINE,shirt:Y,shorts:Y,socks:Y,hairStyle:'short',build:{height:1.84},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:[B,.55],shorts:K,socks:[B,.55],gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.98},seed:13};
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:{depth:number;draw:()=>void}[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:{depth:number;draw:()=>void}[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail};
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
 {label:'The counter',narration:'Olivier Giroud flicks the ball on. Arsenal break forward. New Year’s Day, 2017, against Crystal Palace. He sprints sixty yards into the box. A scorpion kick! Goal!',seconds:13,
  cues:[{at:0,words:'Olivier Giroud flicks'},{at:1.8,words:'Arsenal break forward'},{at:3.4,words:'New Year’s Day'},{at:5,words:'against Crystal Palace'},{at:6.6,words:'He sprints'},{at:7.4,words:'sixty yards'},{at:8.4,words:'into the box'},{at:9.6,words:'A scorpion kick'},{at:11,words:'Goal'}]},
 {label:'The scorpion',narration:'Watch again. Alexis Sánchez crosses, but the ball is behind Giroud. He dives forward and flicks it with his left heel, up over his own head. It loops over the keeper, in off the bar!',seconds:13,
  cues:[{at:0,words:'Watch again'},{at:1,words:'Alexis Sánchez crosses'},{at:2.6,words:'behind Giroud'},{at:4,words:'He dives forward'},{at:5.4,words:'left heel'},{at:6.6,words:'over his own head'},{at:8,words:'loops over the keeper'},{at:9.8,words:'in off the bar'}]},
 {label:'Be brave',narration:'Want to be brave like Giroud? If the ball comes behind you, keep your eyes on it. Stay calm. Try something creative, like a flick with your heel.',seconds:10,
  cues:[{at:0,words:'Want to be brave'},{at:1.4,words:'If the ball comes behind you'},{at:3.2,words:'keep your eyes on it'},{at:4.6,words:'Stay calm'},{at:5.6,words:'Try something creative'},{at:7.2,words:'a flick with your heel'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`giroud film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 the heel strikes the ball) ----------------
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
const toeAt=(pose:A.Pose,b:A.Build,g:[number,number],yaw:number,foot:'l'|'r'):V3=>{const sk=A.solve(pose,b,{x:g[0],z:-g[1],yaw}),m=foot==='r'?mix3(sk.rAn,sk.rToe,.6):mix3(sk.lAn,sk.lToe,.6);return[m[0],m[1],-m[2]];};
/** the scorpion (LEFT heel): running → a leap forward → body diving flat, arms reaching for the grass, the left thigh swings back and the
 * knee folds so the heel comes up behind him and meets the ball (contact .5) → hands down → lands on his front. Library pose keys. */
function scorpion(t:number):A.Pose{return A.keyPoses(clamp(t),[
 [0,A.runCycle(.15,{speed:.9})],
 [.3,A.posed({pitch:22,lean:16,air:.06,lHipF:-18,lKnee:92,lAnk:30,rHipF:38,rKnee:32,rAnk:10,lShF:40,rShF:30,lShA:30,rShA:30,lElb:40,rElb:40,neckP:-14})],
 [.5,A.posed({pitch:62,lean:8,air:.28,lHipF:-48,lHipA:8,lKnee:146,lAnk:44,rHipF:8,rKnee:22,rAnk:30,lShF:118,rShF:122,lShA:26,rShA:26,lElb:20,rElb:20,neckP:-48,lHand:1,rHand:1})],
 [.72,A.posed({pitch:80,lean:4,air:.08,lHipF:-22,lKnee:104,lAnk:36,rHipF:4,rKnee:16,rAnk:30,lShF:150,rShF:152,lShA:22,rShA:22,lElb:30,rElb:30,neckP:-50,lHand:1,rHand:1})],
 [1,A.posed({pitch:88,air:0,lHipF:-6,lKnee:40,rHipF:0,rKnee:20,lShF:160,rShF:160,lShA:30,rShA:30,lElb:60,rElb:60,neckP:-40})],
]);}
const T_FLICK=-8.3,T_IW=-4.6,T_SA=-3.5,T_X=-1.05,T_BAR=1.0,T_IN=T_BAR+.25;
const GIR_G:[number,number]=[-8.2,-.9],GIR_YAW=Math.atan2(-.6-GIR_G[1],0-GIR_G[0]);
const GIR_BUILD:A.Build={height:1.93,bulk:1.05};
const SC_DUR=1.1;
const gSc=(tau:number)=>scorpion(.5+tau/SC_DUR);
const HEEL:V3=(()=>{const sk=A.solve(gSc(0),GIR_BUILD,{x:GIR_G[0],z:-GIR_G[1],yaw:GIR_YAW}),h=sk.lHeel;return[h[0],h[1]+.06,-h[2]];})();
const BAR:V3=[0,2.36,-.7];
const GIR:MKey[]=[[-10,-63,4.5],[T_FLICK,-61.4,3.6],[T_FLICK+.6,-60.6,3.2],[-5,-40,1.6],[-2.5,-22,.1],[-.5,GIR_G[0]-2.7,GIR_G[1]],[0,GIR_G[0],GIR_G[1]],[.5,GIR_G[0]+.9,GIR_G[1]],[9,GIR_G[0]+1,GIR_G[1]]];
const IWO:MKey[]=[[-10,-60,-6],[T_FLICK+.4,-59.6,-2.6],[T_IW-.3,-40,2.4],[T_IW,-38.8,2.8],[0,-26,4],[3,-20,4]];
const SAN:MKey[]=[[-10,-50,26],[T_SA,-29,21.5],[T_X-.4,-16.4,21.2],[T_X,-15.8,21],[3,-12,18]];
const FLICK_PT:V3=[-60.9,.11,3.1],IW_PT:V3=[-59.2,.11,-2.1],SA_PT:V3=[-28.4,.11,21.2];
const CROSS_PT:V3=[-15.3,.11,20.8];
function ballT(tau:number):V3{
 if(tau<T_FLICK){const u=easeOut(clamp((tau+10)/1.7));return mix3([-68,.11,9],FLICK_PT,u);}
 if(tau<T_FLICK+.45){const u=(tau-T_FLICK)/.45,p=mix3(FLICK_PT,IW_PT,u);p[1]=.11+.45*Math.sin(u*Math.PI);return p;}
 if(tau<T_IW-.3){const q=moverPos(IWO,tau),v=Math.hypot(q.vx,q.vz)||1;return[q.x+q.vx/v*.6,.11,q.z+q.vz/v*.6];}
 if(tau<T_IW)return mix3(ballT(T_IW-.301),[-38.2,.11,3],(tau-(T_IW-.3))/.3);
 if(tau<T_SA)return flight([-38.2,.11,3],SA_PT,T_SA-T_IW,(tau-T_IW)/(T_SA-T_IW));
 if(tau<T_X-.35){const q=moverPos(SAN,tau),v=Math.hypot(q.vx,q.vz)||1;return[q.x+q.vx/v*.6,.11,q.z+q.vz/v*.6];}
 if(tau<T_X)return mix3(ballT(T_X-.351),CROSS_PT,(tau-(T_X-.35))/.35);
 if(tau<0)return flight(CROSS_PT,HEEL,-T_X,(tau-T_X)/-T_X);
 if(tau<T_BAR)return flight(HEEL,BAR,T_BAR,tau/T_BAR);
 if(tau<T_IN){const u=(tau-T_BAR)/(T_IN-T_BAR);return mix3(BAR,[.5,.3,-.7],u);}
 const d=clamp((tau-T_IN)/.5),e=tau-T_IN-.5;return[.5+.6*d,.3*(1-d)+.11*d+(d>=1?.14*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0),-.7];}
const KEEP_G:[number,number]=[-2.3,-.5];
function keeperState(tau:number){const t0=T_BAR-.62*1.1+.18,pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperTip(clamp((tau-t0)/1.1),{hand:'r'});return{x:KEEP_G[0],z:KEEP_G[1],yaw:Math.PI,pose};}
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:{...PALACE,seed:21},path:[[-10,-58,6],[T_FLICK,-60,5],[-5,-52,3],[0,-30,2]]},// beaten by the flick
 {style:{...PALACE,seed:22},path:[[-10,-35,-4],[-3,-16,-2],[0,-10.4,-1.8],[2,-9,-1.6]]},// tracking Giroud, a yard behind
 {style:{...PALACE,seed:23},path:[[-10,-32,4],[-3,-14,3],[0,-7.4,2.2],[2,-6.6,2]]},
 {style:{...PALACE,seed:24},path:[[-10,-30,16],[T_X,-17.5,18.4],[2,-15,17]]},// the full-back on Sánchez
 {style:{...PALACE,seed:25},path:[[-10,-38,-12],[0,-18,-8],[2,-15,-7]]},
 {style:{...ARSENAL,seed:26},path:[[-10,-55,-14],[0,-26,-10],[3,-18,-8]]},
];
function girState(tau:number,ball:V3){const st=moverState(GIR,tau,ball),wf=sm(T_FLICK-.4,T_FLICK-.2,tau)*(1-sm(T_FLICK+.3,T_FLICK+.6,tau)),ws=sm(-.6,-.42,tau);
 let pose=A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_FLICK)/.7),{foot:'r',power:.2}),wf);
 pose=A.blendPose(pose,gSc(tau),ws);
 return{...st,yaw:angLerp(st.yaw,GIR_YAW,ws),pose};}
function sanState(tau:number,ball:V3){const st=moverState(SAN,tau,ball),w=sm(T_X-.55,T_X-.4,tau)*(1-sm(T_X+.45,T_X+.8,tau));
 let pose=st.pose;if(tau>T_SA+.1&&tau<T_X-.4)pose=A.blendPose(pose,A.dribble(((moverPos(SAN,tau).dist/1.8)%1+1)%1,{foot:'r',speed:.7}),.6);
 return{...st,yaw:angLerp(st.yaw,Math.atan2(HEEL[2]-CROSS_PT[2],HEEL[0]-CROSS_PT[0]),w),pose:A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_X)/.9),{foot:'r',power:.8}),w)};}
function iwoState(tau:number,ball:V3){const st=moverState(IWO,tau,ball),w=sm(T_IW-.55,T_IW-.35,tau)*(1-sm(T_IW+.4,T_IW+.7,tau));
 let pose=st.pose;if(tau>T_FLICK+.5&&tau<T_IW-.5)pose=A.blendPose(pose,A.dribble(((moverPos(IWO,tau).dist/1.9)%1+1)%1,{foot:'r',speed:.8}),.6);
 return{...st,yaw:angLerp(st.yaw,Math.atan2(SA_PT[2]-3,SA_PT[0]+38.2),w),pose:A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_IW)/.9),{foot:'r',power:.7}),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...iwoState(t,b),style:IWOBI},{...sanState(t,b),style:SANCHEZ},{...girState(t,b),style:GIROUD,smear:t>-.3&&t<.35},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netFor=(tau:number)=>{const age=tau-T_IN;return age>0?netRipple(age,.9,-.7):undefined;};
const aimAt=(tau:number):V3=>{const a=ballT(tau),b=ballT(tau-.15),c=ballT(tau-.3);return[(a[0]+b[0]+c[0])/3,1.2,(a[2]+b[2]+c[2])/3];};

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({gf:T(0,'Olivier Giroud flicks'),sk:T(0,'A scorpion kick'),end:SEC(0)});
/** real time, anchored so the flick comes as his name is said (and the goal lands before the seam) */
// real time, anchored so the scorpion (τ 0) comes on "A scorpion kick" and the goal lands with "Goal!" before the seam; the run fills the date line
const tau1=(t:number)=>{const q=ch1T();return t-Math.min(q.sk+.25,q.end-.75-T_IN-.2);};
function ch1Cam(t:number){const tau=tau1(t),q=ch1T(),a=aimAt(tau),gi=moverPos(GIR,tau),run=sm(T_IW,T_SA,tau)*(1-sm(T_X-.4,T_X+.3,tau)),box=sm(-.4,T_BAR,tau,easeInOutSine);
 const look=mix3(mix3(a,[gi.x,1,gi.z],run*.45),[-4,1.4,-.5],box*.55);
 const F=key(tau,mono<number[]>([[-10,3500],[T_FLICK,3900],[-6,3000],[T_SA,3000],[T_X,3500],[0,4300],[T_IN+.5,4700],[q.end,4400]]) as unknown as Key[],easeIO);
 return makeCam([look[0]-6,17,-54],look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-T_IN;
  frame(s);stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.25+1.2*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,w.ball[1]>1.2?24:15)],'low');},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:10,
};

// ---------------- ch2: TV replay, low from the far side of the box: the ball behind him, the dive, the LEFT heel, over Hennessey, off the bar ----------------
const ch2T=()=>({sc:T(1,'Alexis Sánchez crosses'),bg:T(1,'behind Giroud'),df:T(1,'He dives forward'),lh:T(1,'left heel'),oh:T(1,'over his own head'),ok:T(1,'loops over the keeper'),bar:T(1,'in off the bar'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,-2.1],[q.sc+.2,T_X],[q.bg+.3,-.45],[q.df+.2,-.14],[q.lh+.1,0],[q.oh+.3,.35],[q.ok+.2,.72],[q.bar+.1,T_BAR],[q.end,T_IN+1.6]]);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),gi=moverPos(GIR,tau),a=aimAt(tau),w=sm(q.lh,q.ok,t,easeInOutSine),hold=sm(q.bg-.3,q.df,t)*(1-w);
 const look=mix3(mix3(a,[gi.x,1.1,gi.z],hold*.8),[-2,1.6,-.6],w*.7);
 const v=key(t,mono<number[]>([[0,-9,1.3,-12,1000],[q.sc,-8.8,1.3,-11.5,1100],[q.bg,-8.6,1.2,-10.2,1700],[q.lh,-8.4,1.1,-9.6,2000],[q.ok,-8.6,1.3,-10,1500],[q.end,-9,1.8,-11,1250]]) as unknown as Key[],easeIO,true);
 return makeCam([v[0],v[1],v[2]],look,v[3]);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const hit=q.bar+.1,shake=t>=hit?8*settle(t,hit,{freq:6,decay:6}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(hit,hit+.5,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.4,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
  const kh=q.lh+.1;if(tt>=kh&&tt<kh+.45){const p=P(c,HEEL);sparkBurst(s,Y,p[0],p[1],70+60*sm(kh,kh+.12,tt,easeOut),{n:8,seed:95,g:1-sm(kh+.2,kh+.45,tt),width:10});}
  if(tt>=hit&&tt<hit+.45){const p=P(c,BAR);sparkBurst(s,Y,p[0],p[1],80+80*sm(hit,hit+.12,tt,easeOut),{n:9,seed:96,g:1-sm(hit+.2,hit+.45,tt),width:11});}},
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.9,12);},
 still:7,
};

// ---------------- ch3: lesson replay, side-on and a little high — ball behind you, eyes on it, calm, creative heel ----------------
const ch3T=()=>({bb:T(2,'If the ball comes behind you'),ey:T(2,'keep your eyes on it'),sc:T(2,'Stay calm'),cr:T(2,'Try something creative'),fh:T(2,'a flick with your heel'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,-1.4],[q.bb+.4,-.55],[q.ey+.3,-.3],[q.sc+.3,-.12],[q.cr+.3,-.03],[q.fh+.3,0],[q.fh+1.3,.6],[q.end,T_IN+.3]]);};
function ch3Cam(t:number){const q=ch3T();return camOf(t,[[0,-10,3.6,-10.5,-9,.9,1.5,1450],[q.ey,-10,3.4,-10,-8.6,1,.2,1700],[q.cr,-9.6,3.3,-9.8,-7.4,1.1,-.4,1750],[q.end,-9,3.8,-10.6,-4,1.5,-.6,1350]]);}
const ring=(s:Sheet,c:Cam,p:V3,r:number,w:number)=>{const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[p[0]+Math.cos(a)*r,.04,p[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),w,.95);};
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true,net:netFor(tau)});
  const gi=moverPos(GIR,tau);
  const bb=sm(q.bb,q.bb+.6,tt,easeOut);if(bb>0){const pts:Pt[]=[];for(let i=0;i<=16;i++)pts.push(P(c,flight(CROSS_PT,HEEL,-T_X,.45+.55*i/16)));dashed(s,pts,12,bb);}
  const sc=sm(q.sc,q.sc+.4,tt,easeOutBack)*(1-sm(q.fh,q.fh+.3,tt));if(sc>.02)ring(s,c,[gi.x,0,gi.z],1.3*sc,12);
  const cr=sm(q.cr,q.cr+.6,tt,easeOut);if(cr>0){const pts:Pt[]=[];for(let i=0;i<=18;i++)pts.push(P(c,flight(HEEL,BAR,T_BAR,i/18)));dashed(s,pts,14,cr);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,26)]);
  // eyes on it: a dashed sight line from his eyes to the ball, over the figures
  const ey=sm(q.ey,q.ey+.4,tt,easeOut)*(1-sm(q.fh+.2,q.fh+.5,tt));if(ey>.02){const a=P(c,[gi.x+.1,1.75,gi.z]),b=P(c,ballT(tau));const pts:Pt[]=[];for(let i=0;i<=10;i++)pts.push([lerp(a[0],b[0],i/10),lerp(a[1],b[1],i/10)]);dashed(s,pts,9,ey);}
  const fh=q.fh+.3;if(tt>=fh-.05&&tt<fh+.5){const p=P(c,HEEL);sparkBurst(s,Y,p[0],p[1],90+70*sm(fh,fh+.12,tt,easeOut),{n:9,seed:97,g:1-sm(fh+.2,fh+.5,tt),width:11});}},
 still:6,
};

const story:RisoStory={
 id:'giroud-scorpion-2017',format:'11v11',title:"Giroud's scorpion kick",
 theme:'If the ball comes behind you, keep your eye on it and be brave enough to try a flick.',
 ageNote:'Premier League, Arsenal 2–0 Crystal Palace, Emirates Stadium, 1 January 2017 (FIFA Puskás Award).',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a heel-flick — the ball pops backwards up and over the point in a loop. Reduced motion: the loop and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),dir=r()<.5?-1:1,u=age<=0?.6:clamp(age/.8),bx=x-dir*60+dir*200*u,by=y-230*Math.sin(u*Math.PI);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const v=i/12*u;pts.push([x-dir*60+dir*200*v,y-230*Math.sin(v*Math.PI)]);}
  if(pts.length>1)s.stroke(Y,polyPath(pts,false),9,.95);
  ballAt(s,bx,by,44,-age*10+hash(seed,3)*TAU);
 },
};
export default story;
