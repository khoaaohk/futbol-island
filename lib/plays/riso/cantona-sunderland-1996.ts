/** Iconic play film — Eric Cantona's chip against Sunderland, Premier League, Manchester United v Sunderland, Old Trafford,
 * 21 December 1996: the turn near halfway, the one-two with Brian McClair, the chip over Lionel Pérez, in off the post, and the famous
 * still, proud celebration (a slow turn to the whole stadium). A goal film only.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/cantona-sunderland-1996/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json;
 * withTiming() swaps the measured word onsets into the cues, and EVERY action time below is read from those cues.
 *
 * SOURCES (read Sep 26 2026):
 *  - Manchester United (manutd.com), "Explained: Cantona's Sunderland goal celebration" / "On this day in 1996: Cantona's iconic chip":
 *    "Eric Cantona picked up the ball close to the half-way line with his back to goal, turned sharply and then pushed forward ... the
 *    one-two with Brian McClair, the insouciant chip, and the ball clipped the inside of the post"; the celebration "collar up, chest out,
 *    slow turn ... Not moving from the spot, Cantona slowly turned 360 degrees".
 *  - Planet Football (photo caption): "chipped in a goal from the edge of the box, despite the attentions of Sunderland's Gareth Hall";
 *    Wikipedia "Lionel Perez (footballer)": Sunderland's goalkeeper; search summaries: "dribbled past two Sunderland players, before a
 *    one-two pass with Brian McClair, he chipped the ball over ... Lionel Perez".
 * CONFIRMED: date, venue, opponent, the turn near halfway with his back to goal, beating two players, the one-two with McClair, the chip
 *  from the edge of the box over Pérez, in off the inside of the post, the still 360° celebration; United in red shirts, white shorts.
 * INFERRED / ILLUSTRATIVE (the footage could not be reviewed in this session): Cantona's chipping foot (drawn right, his stronger foot; the
 *  narration names no foot), which post (drawn his left), all positions, distances and timings, the score at the time and the minute
 *  (not stated in the film), Sunderland's away kit (drawn blue shirts, navy shorts — NOT verified), the keeper's kit (drawn yellow),
 *  United's black socks, the crowd.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (τ = 0 the
 * chip). ch1 = the live, high main-stand camera in real time (the turn, the run, the one-two, the chip, the post, the net); ch2 = the TV
 * replay low behind Cantona (Pérez rushing out, the calm chip, the ball dropping in off the post, the slow proud turn); ch3 = a lit lesson
 * replay (keeper rushes out → stay calm → foot under the ball → lift it gently → let it drop). Seams: forward passages into the goal
 * mouth and the ball. Inks: yellow (floodlights, keeper, grass with blue), red (United and the Stretford crowd, skin), blue (the grey-blue
 * sky, grass, Sunderland as drawn), navy (key line, socks). Scenes read only their local t; drawn objects pose on twos; seeded randomness. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/cantona-sunderland-1996/timing.json';
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

// ---------------- Old Trafford on a grey December afternoon: stands, roof, floodlights on, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: United red and white everywhere, a small away end in blue */
const CROWD=(()=>{const r=rng(1996),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===0?250:220;for(let i=0;i<n;i++){const c=r(),u=r(),away=st===2&&u<.25;out.push([st,u,.04+r()*.92,away?(c<.7?2:0):(c<.55?1:c<.9?0:2),r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-104;x<=2;x+=9)out.push([x,36,70]);for(let z=-60;z<=60;z+=11)out.push([38,36,z]);for(let x=-104;x<=2;x+=9)out.push([x,36,-70]);for(let z=-60;z<=60;z+=11)out.push([-143,36,z]);return out;})();
type Stadium={t:number;cheer?:number;flash?:number;net?:(p:V3)=>V3;lesson?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{t,cheer=0,flash=0,lesson=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // grey winter afternoon sky: a pale blue screen with a light navy veil (the lesson prints it darker)
 s.field(B,.3,.6);s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),lesson?.6:.15);
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
const UNITED:A.AthleteStyle={...LINE,shirt:R,shorts:'paper',socks:K,numberInk:'paper',hairStyle:'short',build:{height:1.8},seed:7};
const CANTONA:A.AthleteStyle={...UNITED,number:7,build:{height:1.88,bulk:1.05},seed:77};
const SUNDERLAND:A.AthleteStyle={...LINE,shirt:B,shorts:K,socks:B,hairStyle:'short',build:{height:1.82},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:Y,shorts:K,socks:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.83},seed:13};
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
 {label:'The turn',narration:'Old Trafford, 1996. Eric Cantona picks up the ball near halfway, with his back to goal. He spins away from two Sunderland players, and plays a one two with Brian McClair, and chips the keeper! Goal!',seconds:14,
  cues:[{at:0,words:'Old Trafford'},{at:2.6,words:'Eric Cantona picks up'},{at:4.4,words:'with his back to goal'},{at:5.8,words:'He spins away'},{at:7,words:'two Sunderland players'},{at:8.4,words:'plays a one two'},{at:9.6,words:'Brian McClair'},{at:11,words:'chips the keeper'},{at:12.4,words:'Goal'}]},
 {label:'The chip',narration:'Watch the keeper. Lionel Pérez rushes out, but Cantona stays calm. He lifts it up and over him, and it drops in off the post! Then he stands, and turns slowly.',seconds:13,
  cues:[{at:0,words:'Watch the keeper'},{at:1.2,words:'Lionel Pérez rushes out'},{at:2.8,words:'Cantona stays calm'},{at:4.2,words:'He lifts it'},{at:5.2,words:'up and over him'},{at:6.6,words:'in off the post'},{at:8.2,words:'he stands'},{at:9.6,words:'turns slowly'}]},
 {label:'Stay calm',narration:'Want to chip like Cantona? When the keeper rushes out, stay calm. Get your foot under the ball, lift it gently, and let it drop.',seconds:9,
  cues:[{at:0,words:'Want to chip'},{at:1.3,words:'When the keeper rushes out'},{at:2.9,words:'stay calm'},{at:3.8,words:'Get your foot under the ball'},{at:5.4,words:'lift it gently'},{at:6.6,words:'let it drop'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cantona film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 the chip) ----------------
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
const T_GET=-6.2,T_SPIN=-5.9,T_P1=-3.1,T_MC=-2.65,T_RET=-1.55,T_TOUCH=-1.1,T_POST=1.35,T_IN=T_POST+.3;
const CAN_G:[number,number]=[-17.6,-1.1];
const POST_HIT:V3=[0,1.55,3.52];// the inside of his left-hand post
const CAN_YAW=Math.atan2(POST_HIT[2]-CAN_G[1],0-CAN_G[0]);
const CAN_BUILD:A.Build={height:1.88,bulk:1.05};
/** the chip: a short, soft swing with the foot under the ball (strike at low power, body leaning back a touch) */
const cChip=(tau:number)=>{const p=A.strike(clamp(A.STRIKE_CONTACT+tau/.9),{foot:'r',power:.35});return{...p,lean:p.lean-.12*sm(-.3,.2,tau)*(1-sm(.3,.7,tau))};};
const CHIP_PT:V3=(()=>{const q=toeAt(cChip(0),CAN_BUILD,CAN_G,CAN_YAW,'r');return[q[0],.11,q[2]];})();
const CAN:MKey[]=[[-9,-52.5,-10.4],[T_GET,-48.2,-8.6],[T_SPIN+.5,-47.4,-8.3],[-4.3,-41,-6.2],[T_P1,-31.2,-4.2],[T_RET-.1,-22.6,-2.5],[-.35,CAN_G[0]-.8,CAN_G[1]-.2],[0,CAN_G[0],CAN_G[1]],[1.4,-11.5,-.6],[2.6,-9.4,-.5],[9,-9.4,-.5]];
const MCC:MKey[]=[[-9,-33,9],[T_MC-.5,-25.8,4.9],[T_MC,-25.4,4.6],[0,-20,3.2],[3,-14,2.4]];
const MC_PT:V3=[-24.9,.11,4.25],RET_PT:V3=[-20.9,.11,-2.05],P1_PT:V3=[-30.6,.11,-4];
function ballT(tau:number):V3{
 if(tau<T_GET){const u=clamp((tau+8)/1.8);return mix3([-60,.11,-13],[-48.4,.11,-8.6],easeOut(u));}
 if(tau<T_SPIN+.5){return[-48.4+.8*sm(T_SPIN,T_SPIN+.5,tau),.11,-8.6+.3*sm(T_SPIN,T_SPIN+.5,tau)];}
 if(tau<T_P1-.35){const q=moverPos(CAN,tau),v=Math.hypot(q.vx,q.vz)||1,ph=(q.dist/1.9)%1,lead=.45+.35*ph;return[q.x+q.vx/v*lead,.11,q.z+q.vz/v*lead];}
 if(tau<T_P1)return mix3(ballT(T_P1-.351),P1_PT,(tau-(T_P1-.35))/.35);
 if(tau<T_MC)return mix3(P1_PT,MC_PT,(tau-T_P1)/(T_MC-T_P1));
 if(tau<T_RET)return mix3(MC_PT,RET_PT,(tau-T_MC)/(T_RET-T_MC));
 if(tau<T_TOUCH)return mix3(RET_PT,[RET_PT[0]+.9,.11,RET_PT[2]+.2],(tau-T_RET)/(T_TOUCH-T_RET));
 if(tau<0)return mix3([RET_PT[0]+.9,.11,RET_PT[2]+.2],CHIP_PT,easeOut((tau-T_TOUCH)/-T_TOUCH));
 if(tau<T_POST)return flight(CHIP_PT,POST_HIT,T_POST,tau/T_POST);
 if(tau<T_IN){const u=(tau-T_POST)/(T_IN-T_POST);return mix3(POST_HIT,[.9,.35,2.7],u);}
 const d=clamp((tau-T_IN)/.6),e=tau-T_IN-.6;return[.9+.5*d,Math.max(.11,.35*(1-d*d)+.11*d*d)+(d>=1?.1*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0),2.7-.2*d];}
const KEEP:MKey[]=[[-9,-1.5,-.4],[-1.6,-2.2,-.5],[-.15,-6.6,-.8],[.25,-6.9,-.8],[9,-6.9,-.8]];
function keeperState(tau:number,ball:V3){const q=moverPos(KEEP,tau),v=Math.hypot(q.vx,q.vz),t0=.2;
 let pose=v>.5?A.runCycle(((q.dist/2.1)%1+1)%1,{speed:clamp(v/8)}):A.keeperSet(((tau*1.4)%1+1)%1);
 if(tau>-.35&&tau<t0)pose=A.blendPose(pose,A.keeperSet(0),sm(-.35,-.1,tau));
 if(tau>=t0)pose=A.keeperDive(clamp((tau-t0)/1.1),{side:'r',height:1});
 return{x:q.x,z:q.z,yaw:tau<t0?Math.atan2(ball[2]-q.z,ball[0]-q.x):Math.PI,pose};}
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:{...SUNDERLAND,seed:21},path:[[-9,-43,-6],[T_GET,-46.6,-7.4],[T_SPIN+.4,-47.8,-7.9],[-4,-48.5,-7.2],[3,-42,-5]]},// the first player he turns away from
 {style:{...SUNDERLAND,seed:22},path:[[-9,-44,-12],[T_GET,-46.8,-9.9],[T_SPIN+.6,-47.4,-9.4],[-3.5,-45,-8],[3,-38,-6]]},// the second
 {style:{...SUNDERLAND,seed:23},path:[[-9,-38,-2],[T_P1,-30,-1],[-.2,-18.7,.2],[2,-13,.4]]},// Gareth Hall, chasing him to the edge of the box
 {style:{...SUNDERLAND,seed:24},path:[[-9,-26,-6],[-2,-19,-5],[0,-15.5,-4],[3,-11,-3]]},
 {style:{...SUNDERLAND,seed:25},path:[[-9,-25,3],[-2,-17,2.5],[0,-14,2.3],[3,-10,2]]},
 {style:{...SUNDERLAND,seed:26},path:[[-9,-30,12],[0,-20,8],[3,-15,7]]},
 {style:{...UNITED,seed:27},path:[[-9,-40,14],[0,-24,11],[3,-17,9]]},
 {style:{...UNITED,seed:28},path:[[-9,-50,4],[0,-34,2],[3,-26,1]]},
];
function canState(tau:number,ball:V3){const st=moverState(CAN,tau,ball);
 // back to goal as the ball arrives, then the sharp turn: a small counter-turn and a 180° spin on the ball
 let yaw=st.yaw;if(tau<T_SPIN+.5){const back=Math.PI+.25,spin=anticipateSpin(tau);yaw=angLerp(back,Math.atan2(2,8),spin);}
 const wp=sm(T_P1-.55,T_P1-.35,tau)*(1-sm(T_P1+.4,T_P1+.7,tau)),wt=sm(T_TOUCH-.35,T_TOUCH-.15,tau)*(1-sm(T_TOUCH+.15,T_TOUCH+.35,tau)),wc=sm(-.55,-.35,tau)*(1-sm(.45,.8,tau));
 let pose=st.pose;if(tau>T_SPIN+.3&&tau<T_P1-.55)pose=A.blendPose(pose,A.dribble(((moverPos(CAN,tau).dist/1.9)%1+1)%1,{foot:'r',speed:.8}),.55);
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_P1)/.9),{foot:'r',power:.45}),wp);
 pose=A.blendPose(pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_TOUCH)/.7),{foot:'r',power:.12}),wt);
 pose=A.blendPose(pose,cChip(tau),wc);
 // the celebration: he stops, stands tall, chest out, and turns slowly on the spot through a full circle
 const still=sm(2.3,2.9,tau);if(still>0){const proud={...A.stand(),lean:-.12,pitch:-.03,neckP:-.2,lShA:.2,rShA:.2,lShF:-.35,rShF:-.35,lElb:.5,rElb:.5};pose=A.blendPose(pose,proud,still);yaw=Math.PI*.1+TAU*easeInOutSine(sm(3,8.5,tau));}
 else if(tau>0)yaw=angLerp(yaw,st.yaw,1);
 return{...st,yaw:tau<T_SPIN+.5||still>0?yaw:angLerp(st.yaw,CAN_YAW,wc),pose};}
function anticipateSpin(tau:number){const u=(tau-T_SPIN)/.5;return u<=0?-.08*sm(T_SPIN-.25,T_SPIN,tau):easeInOutSine(clamp(u));}
function mccState(tau:number,ball:V3){const st=moverState(MCC,tau,ball),w=sm(T_MC-.5,T_MC-.3,tau)*(1-sm(T_MC+.4,T_MC+.7,tau));return{...st,yaw:angLerp(st.yaw,Math.atan2(RET_PT[2]-MC_PT[2],RET_PT[0]-MC_PT[0]),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+(tau-T_MC)/.8),{foot:'r',power:.3}),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...mccState(t,b),style:{...UNITED,build:{height:1.78},seed:9}},{...canState(t,b),style:CANTONA,smear:(t>T_SPIN-.1&&t<T_SPIN+.5)||(t>-.25&&t<.3)},{...keeperState(t,b),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netFor=(tau:number)=>{const age=tau-T_IN;return age>0?netRipple(age,.4,2.7):undefined;};
const aimAt=(tau:number):V3=>{const a=ballT(tau),b=ballT(tau-.15),c=ballT(tau-.3);return[(a[0]+b[0]+c[0])/3,1.2,(a[2]+b[2]+c[2])/3];};

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({pk:T(0,'Eric Cantona picks up'),sp:T(0,'He spins away'),ck:T(0,'chips the keeper'),end:SEC(0)});
/** near real time, anchored so the spin comes on "He spins away" and the chip is struck as "chips the keeper" is said (the goal lands
 * with "Goal!", before the seam): real time up to the spin, a gentle speed-up (≈1.1×) from the spin to the chip, real time after it */
const tau1=(t:number)=>{const q=ch1T(),ck=Math.min(q.ck+.1,q.end-.75-T_IN-.2),sp=Math.min(q.sp,ck+T_SPIN*.8);
 return t<sp?T_SPIN-(sp-t):t<ck?T_SPIN*(1-(t-sp)/(ck-sp)):t-ck;};
function ch1Cam(t:number){const tau=tau1(t),q=ch1T(),a=aimAt(tau),g=sm(-.3,T_POST,tau,easeInOutSine),look=mix3(a,[-4,1.3,1],g*.55);
 const F=key(tau,mono<number[]>([[-9,3800],[T_SPIN,4400],[-4,3400],[T_MC,3500],[0,3900],[T_IN+.5,4600],[q.end,4300]]) as unknown as Key[],easeIO);
 return makeCam([look[0]-5,15,-50],look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-T_IN;
  frame(s);stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.2+1*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,w.ball[1]>1.2?24:15)],'low');},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9.5,
};

// ---------------- ch2: TV replay, low behind Cantona: Pérez rushes, the chip, the post, the slow proud turn ----------------
const ch2T=()=>({wk:T(1,'Watch the keeper'),ro:T(1,'Lionel Pérez rushes out'),sc:T(1,'Cantona stays calm'),lb:T(1,'He lifts it'),uo:T(1,'up and over him'),post:T(1,'in off the post'),js:T(1,'he stands'),ts:T(1,'turns slowly'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,-1.9],[q.ro+.2,-1.2],[q.sc+.3,-.25],[q.lb+.25,0],[q.post+.2,T_POST],[q.js,2.7],[q.ts,3.4],[q.end,Math.min(8.5,3.4+(q.end-q.ts)*1.1)]]);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),a=aimAt(tau),kp=moverPos(KEEP,tau),w=sm(q.js-.8,q.js+.2,t,easeInOutSine);
 const early=mix3([kp.x,1.3,kp.z],a,.45),look=mix3(mix3(early,a,sm(q.lb,q.uo,t)*.6),[-9.4,1.25,-.5],w);
 const v=key(t,mono<number[]>([[0,-25,1.5,-3.2,1500],[q.sc,-24,1.5,-3,1650],[q.lb,-23.5,1.5,-2.9,1500],[q.post,-23,1.7,-2.7,1400],[q.js,-15.5,1.6,-5.8,1500],[q.end,-14.5,1.6,-5.3,1650]]) as unknown as Key[],easeIO,true);
 return makeCam([v[0],v[1],v[2]],look,v[3]);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const hit=q.post+.2,shake=t>=hit?7*settle(t,hit,{freq:6,decay:6}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(hit,hit+.5,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.2,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
  if(tt>=hit&&tt<hit+.45){const p=P(c,POST_HIT);sparkBurst(s,Y,p[0],p[1],70+70*sm(hit,hit+.12,tt,easeOut),{n:9,seed:61,g:1-sm(hit+.2,hit+.45,tt),width:10});}},
 aperture(t){const c=ch2Cam(t),g:V3=[-9.4,1.2,-.5],[x,y]=P(c,g),r=clamp(.45*kAt(c,g),30,260);return apertureDisc(x,y,r,12);},
 still:9,
};

// ---------------- ch3: lesson replay, side-on at the edge of the box — rushes out, calm, foot under, lift, drop ----------------
const ch3T=()=>({ro:T(2,'When the keeper rushes out'),sc:T(2,'stay calm'),fu:T(2,'Get your foot under the ball'),lg:T(2,'lift it gently'),ld:T(2,'let it drop'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,-1.6],[q.ro,-1.3],[q.sc+.4,-.4],[q.fu+.3,-.02],[q.lg+.2,.05],[q.ld+.3,.95],[q.end,T_IN+.3]]);};
function ch3Cam(t:number){const q=ch3T();return camOf(t,[[0,-12,4.5,-17,-12,.9,-.5,1300],[q.ro,-11.5,4.5,-16.5,-9,.9,-.5,1300],[q.fu,-12.5,3.8,-15,-15,.6,-1,1750],[q.lg,-12,4.2,-15.5,-10,1.5,.5,1300],[q.end,-10,4.4,-15,-4,1.4,1.5,1400]]);}
const ring=(s:Sheet,c:Cam,p:V3,r:number,w:number)=>{const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[p[0]+Math.cos(a)*r,.04,p[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),w,.95);};
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true,net:netFor(tau)});
  // rushes out: the keeper's rush drawn off his line; stay calm: a steady ring round Cantona; lift: the chip's arc; drop: a ring by the post
  const ro=sm(q.ro,q.ro+.6,tt,easeOut);if(ro>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const m=moverPos(KEEP,lerp(-1.6,Math.max(-1.5,Math.min(tau,-.15)),i/12));pts.push(P(c,[m.x,.05,m.z]));}dashed(s,pts,14,ro);}
  const sc=sm(q.sc,q.sc+.4,tt,easeOutBack)*(1-sm(q.fu,q.fu+.3,tt));if(sc>.02){const m=moverPos(CAN,tau);ring(s,c,[m.x,0,m.z],1.3*sc,12);}
  const lg=sm(q.lg,q.lg+.7,tt,easeOut);if(lg>0){const pts:Pt[]=[];for(let i=0;i<=18;i++)pts.push(P(c,flight(CHIP_PT,POST_HIT,T_POST,i/18)));dashed(s,pts,14,lg);}
  const ld=sm(q.ld,q.ld+.4,tt,easeOutBack);if(ld>.02){ring(s,c,[-.4,0,2.6],.8*ld,12);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,26)]);
  const fu=q.fu+.3;if(tt>=fu-.05&&tt<fu+.5){const p=P(c,CHIP_PT);sparkBurst(s,Y,p[0],p[1],80+60*sm(fu,fu+.12,tt,easeOut),{n:8,seed:71,g:1-sm(fu+.2,fu+.5,tt),width:10});}},
 still:6,
};

const story:RisoStory={
 id:'cantona-sunderland-1996',format:'11v11',title:"Cantona's chip",
 theme:'When the keeper rushes out, stay calm and lift the ball gently over him.',
 ageNote:'Premier League, Manchester United v Sunderland, Old Trafford, 21 December 1996.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a ball is chipped up from the point in a soft yellow arc. Reduced motion: the arc and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),dir=r()<.5?-1:1,u=age<=0?.5:clamp(age/.8),bx=x+dir*170*u,by=y-220*Math.sin(u*Math.PI);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const v=i/12*u;pts.push([x+dir*170*v,y-220*Math.sin(v*Math.PI)]);}
  if(pts.length>1)s.stroke(Y,polyPath(pts,false),9,.95);
  ballAt(s,bx,by,44,age*8+hash(seed,3)*TAU);
 },
};
export default story;
