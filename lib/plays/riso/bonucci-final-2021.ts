/** Iconic play film — Leonardo Bonucci's equaliser, UEFA Euro 2020 final, Italy 1–1 England (Italy won 3–2 on penalties),
 * Wembley Stadium, London, 11 July 2021, 67th minute.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/bonucci-final-2021/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json; withTiming()
 * swaps the measured word onsets into the cues, and EVERY action time below is read from those cues, so a re-voice re-times the film.
 *
 * SOURCES (read Sep 26 2026):
 *  - Wikipedia, "UEFA Euro 2020 final" (match summary): "A minute later [67'], Italy won a corner, which was flicked on by Cristante to
 *    Verratti, who headed the ball towards goal; it was turned onto the post by Pickford, but Bonucci was able to react quickest and hit
 *    the ball into the goal from close range for Italy's equaliser." Kits: "Italy playing in blue shirts, dark blue shorts and blue socks,
 *    and England playing in white shirts, white shorts and white socks." Shaw scored after 1 min 56 s; 67,173 spectators; rain.
 *  - Sky Sports / Fox Sports / CBS match reports (via search): Berardi's corner; the ball to the back post; Verratti's header pushed onto
 *    the post by Pickford; Bonucci "prodded" / "tapped" the rebound in; oldest scorer in a Euros final (34 years 71 days).
 * CONFIRMED: date, venue, minute, score before (0–1) and after (1–1), the corner (Berardi), Cristante's flick-on, Verratti's header,
 *  Pickford turning it onto the post, Bonucci's close-range finish of the rebound, the kits of both teams.
 * INFERRED / ILLUSTRATIVE (not confirmed — the footage could not be reviewed in this session): which corner flag the corner came from
 *  (drawn from Italy's right, an in-swinger with Berardi's left foot), Bonucci's finishing foot (drawn right; the narration does not name
 *  a foot), exact positions and runs of every player, flight times, which post (drawn the far post from the corner), Pickford's kit
 *  (drawn yellow, the colour he wore through the tournament), the referee (omitted), crowd colours, Wembley's arch placement.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 the corner is struck). ch1 = the live, high main-stand camera in real time (the corner,
 * the flick, the header, the save onto the post, the tap-in, the net, the roar); ch2 = the TV slow-motion replay from low behind the goal
 * (through the net: the header, Pickford's hand, the post, Bonucci arriving first); ch3 = a lit lesson replay (follow the shot, keep
 * running, watch for the rebound, be first). Seams: forward passages into the goal mouth and the ball. Ball flights are ballistic
 * (g = 9.81); the finishing contact is read from the solved skeleton so the ball meets the boot. Figures: lib/plays/riso/athlete.ts.
 * Inks: yellow (floodlights, keeper, grass with blue), red (England fans' flags, skin), blue (Italy, night sky, grass), navy (key line,
 * Italy's shorts). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/bonucci-final-2021/timing.json';
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

// ---------------- Wembley at night in the rain: bowl, roof, the arch, floodlights, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: England white and red (flags), an Italian blue end behind the far goal */
const CROWD=(()=>{const r=rng(2021),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===3?120:230;for(let i=0;i<n;i++){const c=r(),u=r();const blue=st===3?c<.8:c<.08;out.push([st,u,.04+r()*.92,blue?2:c<.62?0:1,r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-104;x<=2;x+=9)out.push([x,36,70]);for(let z=-60;z<=60;z+=11)out.push([38,36,z]);for(let x=-104;x<=2;x+=9)out.push([x,36,-70]);for(let z=-60;z<=60;z+=11)out.push([-143,36,z]);return out;})();
/** the arch: a 133 m-high hoop over the north stand (drawn over the far stand, spanning the length of the ground) */
const ARCH:V3[]=Array.from({length:25},(_,i)=>{const u=i/24,x=lerp(-165,60,u);return[x,36+97*Math.sin(u*Math.PI),72+8*Math.sin(u*Math.PI)] as V3;});
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
 // the arch (paper ribbon with a navy edge), only where it is in front of the camera
 {const pts:Pt[]=[];for(const a of ARCH){if(depthOf(c,a)<5){pts.length=0;break;}pts.push(P(c,a));}if(pts.length>2){const w=clamp(2.4*kAt(c,ARCH[12]),5,40);s.fill(K,ribbon(pts,w*1.5,{taper:.2,pressure:0,wobble:.5}),.9);s.knockout(ribbon(pts,w,{taper:.2,pressure:0,wobble:.5}));}}
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
 // the corner flag at Italy's right corner
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
const ITALY:A.AthleteStyle={...LINE,shirt:B,shorts:K,socks:B,hairStyle:'short',seed:7};
const BONUCCI:A.AthleteStyle={...ITALY,number:19,numberInk:'paper',build:{height:1.9},seed:19};
const VERRATTI:A.AthleteStyle={...ITALY,build:{height:1.65},hairStyle:'curly',seed:6};
const ENGLAND:A.AthleteStyle={...LINE,shirt:'paper',shorts:'paper',socks:'paper',hairStyle:'short',build:{height:1.86},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:Y,shorts:Y,socks:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.85},seed:13};
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
 {label:'The corner',narration:'Wembley, 2021. The Euro final. England lead Italy, one nil. Italy win a corner, and the ball flies into a crowd of players.',seconds:9,
  cues:[{at:0,words:'Wembley'},{at:1.2,words:'The Euro final'},{at:2.5,words:'England lead Italy'},{at:4.3,words:'Italy win a corner'},{at:5.8,words:'the ball flies'},{at:7,words:'crowd of players'}]},
 {label:'Onto the post',narration:'Watch again. Verratti heads it at goal. Pickford dives and pushes it onto the post! But Leonardo Bonucci never stopped running. He gets there first, and pokes it in. One each!',seconds:12,
  cues:[{at:0,words:'Watch again'},{at:1,words:'Verratti heads it'},{at:2.6,words:'Pickford dives'},{at:3.8,words:'onto the post'},{at:5,words:'But Leonardo Bonucci'},{at:6.6,words:'never stopped running'},{at:8,words:'He gets there first'},{at:9.2,words:'pokes it in'},{at:10.4,words:'One each'}]},
 {label:'Follow it in',narration:'Want to score like Bonucci? When a teammate shoots, follow it in. Keep running, watch for the rebound, and be first to the ball.',seconds:9,
  cues:[{at:0,words:'Want to score'},{at:1.3,words:'When a teammate shoots'},{at:2.6,words:'follow it in'},{at:4,words:'Keep running'},{at:5.2,words:'watch for the rebound'},{at:6.8,words:'be first to the ball'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`bonucci film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 the corner is struck) ----------------
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

const SPOT:V3=[-.5,.11,-33.5];// the corner arc at Italy's right
const FLICK:V3=[-5.8,2.25,-2.2],TF1=1.3;// Cristante's flick-on at the near post
const HEAD:V3=[-3.1,.95,2.2],TF2=1.95;// Verratti's diving header toward the far post
const TOUCH:V3=[-.35,.62,3.05],TTOUCH=2.22;// Pickford's hand
const POST:V3=[0,.6,3.6],TPOST=2.33;// the far post
const TPOKE=2.98;// Bonucci's contact
const BON_G:[number,number]=[-1.85,2.35],BON_YAW=Math.atan2(1.1-BON_G[1],0-BON_G[0]);
const BON_BUILD:A.Build={height:1.9};
const bPoke=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+(tau-TPOKE)/.95),{foot:'r',power:.35});
const CONTACT:V3=(()=>{const sk=A.solve(bPoke(TPOKE),BON_BUILD,{x:BON_G[0],z:-BON_G[1],yaw:BON_YAW}),m=mix3(sk.rAn,sk.rToe,.6);return[m[0],.12,-m[2]];})();
const GOALIN:V3=[.9,.4,1.3],TIN=TPOKE+.26;
function ballT(tau:number):V3{
 if(tau<0)return SPOT;
 if(tau<TF1)return flight(SPOT,FLICK,TF1,tau/TF1);
 if(tau<TF2)return flight(FLICK,HEAD,TF2-TF1,(tau-TF1)/(TF2-TF1));
 if(tau<TTOUCH){const u=(tau-TF2)/(TTOUCH-TF2);const p=mix3(HEAD,TOUCH,u);p[1]+=.12*Math.sin(u*Math.PI);return p;}
 if(tau<TPOST)return mix3(TOUCH,POST,(tau-TTOUCH)/(TPOST-TTOUCH));
 if(tau<TPOKE){const u=(tau-TPOST)/(TPOKE-TPOST),p=mix3(POST,CONTACT,u);p[1]=lerp(POST[1],CONTACT[1],u)+.35*Math.sin(Math.min(1,u*1.25)*Math.PI)*(1-u);return p;}
 if(tau<TIN)return mix3(CONTACT,GOALIN,(tau-TPOKE)/(TIN-TPOKE));
 const d=clamp((tau-TIN)/.5);return[GOALIN[0]+.6*d,Math.max(.11,GOALIN[1]*(1-d*d)+.11*d*d),GOALIN[2]+.1*d];}
/** Verratti's diving header: running launch → horizontal, neck snap at .45 → lands on his chest */
function divingHeader(t:number):A.Pose{return A.keyPoses(clamp(t),[
 [0,A.runCycle(.1,{speed:.8})],
 [.25,A.posed({lHipF:30,lKnee:60,rHipF:-20,rKnee:40,lean:30,pitch:24,lShF:40,rShF:40,lShA:30,rShA:30,lElb:60,rElb:60,neckP:-30,air:.1})],
 [.45,A.posed({pitch:78,air:.45,lean:-10,neckP:-50,lHipF:-8,rHipF:-14,lKnee:30,rKnee:40,lAnk:40,rAnk:40,lShF:60,rShF:60,lShA:40,rShA:40,lElb:70,rElb:70})],
 [.75,A.posed({pitch:86,air:.08,lean:-14,neckP:-40,lHipF:-6,rHipF:-8,lKnee:20,rKnee:24,lAnk:40,rAnk:40,lShF:90,rShF:90,lShA:30,rShA:30,lElb:40,rElb:40})],
 [1,A.posed({pitch:88,air:0,lean:-8,neckP:-30,lHipF:-4,rHipF:-4,lKnee:14,rKnee:16,lAnk:40,rAnk:40,lShF:70,rShF:70,lShA:40,rShA:40,lElb:60,rElb:60})],
]);}
const BERARDI:MKey[]=[[-2,-4.5,-31.2],[-.35,-1.2,-33.1],[0,-.8,-33.35],[3,-6,-28]];
const CRIS:MKey[]=[[-2,-9.5,-5],[TF1-.5,-6.3,-2.6],[TF1,-5.9,-2.3],[5,-7,-3]];
const VERR:MKey[]=[[-2,-10.5,3],[TF2-.6,-4.9,2.35],[TF2,-3.6,2.25],[5,-3,2.2]];
const BON:MKey[]=[[-2,-10.5,-1.5],[0,-9,-.6],[TF2,-4.4,1.4],[TPOKE-.35,-2.3,2.2],[TPOKE,BON_G[0],BON_G[1]],[TPOKE+.6,-2.4,3.4],[TPOKE+3,-9,12]];
const KEEP_G:[number,number]=[-.8,.9];
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:ENGLAND,path:[[-2,-6,-1],[1.3,-5.2,-2.1],[4,-4.5,-1.5]]},// near-post defender beaten by the flick
 {style:ENGLAND,path:[[-2,-7,2.5],[2,-4.6,2.9],[4,-3.4,3]]},// marker trailing Verratti
 {style:ENGLAND,path:[[-2,-8.5,-3.5],[2.2,-5,-.2],[4,-3.8,.4]]},
 {style:ENGLAND,path:[[-2,-11,1],[2.5,-7.5,1.5],[4,-6.5,1.8]]},
 {style:ENGLAND,path:[[-2,-2.2,-3.2],[1.4,-1.9,-2.2],[4,-1.7,-1.6]]},// on the near post
 {style:ENGLAND,path:[[-2,-15,-6],[4,-12.5,-3]]},
 {style:ITALY,path:[[-2,-12,-8],[4,-9,-6]]},
 {style:ITALY,path:[[-2,-8,6.5],[2.5,-5.6,5.4],[4,-5,5]]},
];
function keeperState(tau:number){const t0=TTOUCH-.55*1.05,pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-t0)/1.05),{side:'r',height:.15});return{x:KEEP_G[0],z:KEEP_G[1],yaw:Math.PI,pose};}
function bonucciState(tau:number,ball:V3){const st=moverState(BON,tau,ball),w=sm(TPOKE-.55,TPOKE-.35,tau)*(1-sm(TPOKE+.45,TPOKE+.8,tau));
 let pose=A.blendPose(st.pose,bPoke(tau),w);if(tau>TPOKE+.8)pose=A.blendPose(pose,A.celebrate(tau*1.3,{kind:'run'}),sm(TPOKE+.8,TPOKE+1.3,tau));
 return{...st,yaw:angLerp(st.yaw,BON_YAW,w),pose};}
function verrattiState(tau:number,ball:V3){const st=moverState(VERR,tau,ball),w=sm(TF2-.5,TF2-.3,tau);return{...st,yaw:angLerp(st.yaw,Math.atan2(TOUCH[2]-HEAD[2],TOUCH[0]-HEAD[0]),w),pose:A.blendPose(st.pose,divingHeader(.45+(tau-TF2)/1.1),w)};}
function crisState(tau:number,ball:V3){const st=moverState(CRIS,tau,ball),w=sm(TF1-.55,TF1-.35,tau)*(1-sm(TF1+.6,TF1+1,tau));return{...st,yaw:angLerp(st.yaw,Math.atan2(SPOT[2]-FLICK[2],SPOT[0]-FLICK[0]),w),pose:A.blendPose(st.pose,A.header(clamp(.52+(tau-TF1)/1.1)),w)};}
function berardiState(tau:number,ball:V3){const st=moverState(BERARDI,tau,ball),w=sm(-.7,-.5,tau)*(1-sm(.5,.9,tau));return{...st,yaw:angLerp(st.yaw,Math.atan2(FLICK[2]-SPOT[2],FLICK[0]-SPOT[0]),w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+tau/1.05),{foot:'l',power:.8}),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...berardiState(t,b),style:{...ITALY,seed:11}},{...crisState(t,b),style:{...ITALY,build:{height:1.86},seed:16}},{...verrattiState(t,b),style:VERRATTI});
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...bonucciState(t,b),style:BONUCCI,smear:t>TPOKE-.3&&t<TPOKE+.3},{...keeperState(t),style:KEEPER,smear:t>TTOUCH-.3&&t<TTOUCH+.2});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number){return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),[x,y]=q,r=Math.max(min,BALL_R*kAt(c,b));ballShadow(s,c,b[0],b[2],b[1]);ballAt(s,x,y,r,tt*8,{sq:clamp(sp/(r*6),0,.35),dir:Math.atan2(dy,dx)});}};}
const netFor=(tau:number)=>{const age=tau-TIN;return age>0?netRipple(age,GOALIN[1],GOALIN[2]):undefined;};
/** a piecewise clock map t → τ through [t, τ] keys (monotone) */
const clockMap=(t:number,K0:[number,number][])=>key(t,mono(K0) as unknown as Key[],x=>x);

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({corner:T(0,'Italy win a corner'),flies:T(0,'the ball flies'),end:SEC(0)});
/** real time: the corner is struck just after "Italy win a corner" begins, so the goal lands before the seam */
const tau1=(t:number)=>t-(ch1T().corner+.2);
function ch1Cam(t:number){const tau=tau1(t),q=ch1T();
 const look=key(tau,mono<number[]>([[-9,-30,2,-8],[-2.5,-12,1.5,-16],[0,-8,1.5,-14],[TF1,-6,1.4,-3],[TPOST,-3.5,1.2,1.2],[TIN+.8,-3.5,1.2,1.4],[TIN+4,-6,1.4,1]]) as unknown as Key[],easeInOutSine,true);
 const F=key(tau,mono<number[]>([[-9,3200],[-2.5,3900],[0,3600],[TF1,4400],[TPOST,5200],[TIN+1,4600],[q.end,4400]]) as unknown as Key[],easeIO);
 return makeCam([-26,15,-52],[look[0],look[1],look[2]],F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-TIN;
  frame(s);stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.25+1.2*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,w.ball[1]>1.2?26:16)],'low');},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:7.5,
};

// ---------------- ch2: TV replay, slow motion, low behind the goal (through the net) ----------------
const ch2T=()=>({v:T(1,'Verratti heads it'),pd:T(1,'Pickford dives'),post:T(1,'onto the post'),bb:T(1,'But Leonardo Bonucci'),nr:T(1,'never stopped running'),first:T(1,'He gets there first'),poke:T(1,'pokes it in'),one:T(1,'One each'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,TF1-.2],[q.v+.3,TF2],[q.post+.2,TPOST],[q.bb,TPOST+.18],[q.poke+.25,TPOKE],[q.one,TIN+.5],[q.end,TIN+2.6]]);};
function ch2Cam(t:number){const q=ch2T();
 return camOf(t,[[0,5.5,1.9,5.6,-4,.9,-.5,1100],[q.v,5.3,1.8,5.3,-3.2,.8,1.2,1200],[q.post,5,1.6,5.2,-1.2,.7,2.6,1500],[q.nr,5,1.6,5.2,-2,.7,2.2,1350],[q.poke,4.8,1.5,4.9,-1.5,.6,2.2,1600],[q.one,4.8,1.6,4.9,-2,.8,1.8,1450],[q.end,4.6,2,4.6,-4,1.2,.5,1150]]);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const shake=t>=q.post+.2?8*settle(t,q.post+.2,{freq:7,decay:7}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(q.one,q.one+.5,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.3,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,34)]);
  if(t>=q.post+.2&&t<q.post+.7){const p=P(c,POST);sparkBurst(s,Y,p[0],p[1],90+90*sm(q.post+.2,q.post+.35,t,easeOut),{n:9,seed:21,g:1-sm(q.post+.45,q.post+.7,t),width:12});}},
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(34,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.9,12);},
 still:7.4,
};

// ---------------- ch3: lesson replay, lit from above behind the box — follow in, keep running, rebound, first ----------------
const ch3T=()=>({want:T(2,'Want to score'),sh:T(2,'When a teammate shoots'),fol:T(2,'follow it in'),kr:T(2,'Keep running'),wr:T(2,'watch for the rebound'),first:T(2,'be first to the ball'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,TF2-.5],[q.sh+.4,TF2],[q.kr,TTOUCH],[q.wr+.3,TPOST+.15],[q.first+.5,TPOKE],[q.end,TIN+1.4]]);};
function ch3Cam(t:number){const q=ch3T();return camOf(t,[[0,-16,9,-7,-2.5,.6,1.5,1500],[q.fol,-15,8.5,-6,-2.4,.6,2,1600],[q.wr,-13,7.5,-4.5,-1.6,.5,2.6,1800],[q.first,-12,7,-3.5,-1.4,.5,2.2,1900],[q.end,-12.5,7,-3.8,-1,.8,1.6,1750]]);}
function dashed(s:Sheet,pts:Pt[],w:number,g:number){const n=pts.length,m=Math.max(2,Math.round(n*g));const q=pts.slice(0,m);if(q.length<2)return;const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.12)gaps.push([x,x+.05]);s.fill(Y,ribbon(q,w,{taper:.1,pressure:.2,wobble:.8,gaps}),.95);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true,net:netFor(tau)});
  // follow it in: the shot's path (header → post) drawn on; keep running: Bonucci's run drawn from where he started
  const fol=sm(q.fol,q.fol+.6,tt,easeOut);if(fol>0){const pts:Pt[]=[];for(let i=0;i<=16;i++)pts.push(P(c,ballT(lerp(TF2,TPOST,i/16))));dashed(s,pts,16,fol);}
  const kr=sm(q.kr,q.kr+.8,tt,easeOut);if(kr>0){const pts:Pt[]=[];for(let i=0;i<=20;i++){const m=moverPos(BON,lerp(0,Math.min(tau,TPOKE),i/20));pts.push(P(c,[m.x,.05,m.z]));}dashed(s,pts,20,kr);
   const e=pts[pts.length-1];s.fill(Y,polyPath([[e[0]-18,e[1]+8],[e[0]+18,e[1]+8],[e[0],e[1]-22]],true),.95);}
  // watch for the rebound: rings where the ball comes back off the post
  const wr=sm(q.wr,q.wr+.4,tt,easeOutBack)*(1-sm(q.first+.6,q.first+1,tt));if(wr>.02){const ctr=CONTACT;for(let k=0;k<2;k++){const r=(.8+k*.55)*wr,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[ctr[0]+Math.cos(a)*r,.04,ctr[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),12-k*3,.95);}}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,30)]);
  const fp=q.first+.5;if(tt>=fp&&tt<fp+.4){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],120+120*sm(fp,fp+.12,tt,easeOut),{n:10,seed:31,g:1-sm(fp+.15,fp+.4,tt),width:14});}
  if(tt>=fp&&tt<fp+.5){const a=P(c,CONTACT),b=P(c,GOALIN);speedLines(s,K,lerp(a[0],b[0],.5),lerp(a[1],b[1],.5),Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:32,len:160,width:8,cov:.85});}},
 still:6,
};

const story:RisoStory={
 id:'bonucci-final-2021',format:'11v11',title:"Bonucci's final equaliser",
 theme:'Follow every shot in: be first to the rebound.',
 ageNote:'UEFA Euro 2020 final, Italy 1–1 England (Italy won on penalties), Wembley, 11 July 2021.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a ball bounces off an imaginary post with a yellow ring. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.5)sparkBurst(s,Y,x+Math.cos(a)*20,y-up,140*g,{n:9,seed,g:1-clamp((age-.25)/.25),width:14});
  ballAt(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
