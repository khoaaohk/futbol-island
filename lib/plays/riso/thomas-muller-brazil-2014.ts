/** Iconic play film — Thomas Müller's opening goal, 2014 FIFA World Cup semi-final, Brazil 1–7 Germany, Estádio Mineirão,
 * Belo Horizonte, 8 July 2014, 11th minute: Toni Kroos's corner, Müller loses his marker David Luiz and side-foots a volley in at the
 * back post, unmarked.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/thomas-muller-brazil-2014/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json;
 * withTiming() swaps the measured word onsets into the cues, and EVERY action time below is read from those cues.
 *
 * SOURCES (read Sep 26 2026):
 *  - Wikipedia, "Brazil v Germany (2014 FIFA World Cup)": "In the 11th minute, the Germans scored from their first corner of the game.
 *    Thomas Müller escaped his marker, David Luiz, in the penalty box, and Toni Kroos's delivery found him wide open for a side-footed
 *    shot into the net."
 *  - Opta Analyst, "About That Game: Brazil 1-7 Germany" / NBC Sports (via search): "Müller lost his man, David Luiz, then steadied himself
 *    as Toni Kroos' corner was swung in to the back post, before volleying home from six yards out"; "completely unmarked to side-foot
 *    the ball home ... from just outside the six-yard box".
 *  - Museum of Jerseys (via search): Brazil wore their traditional yellow, blue and white in the Mineirazo.
 * CONFIRMED: date, venue, stage, minute, 0–0 → 1–0, Germany's first corner, Kroos's delivery to the back post, Müller escaping Luiz,
 *  unmarked, a side-footed volley from about six yards; Brazil yellow shirts, blue shorts, white socks.
 * INFERRED / ILLUSTRATIVE (the footage could not be reviewed in this session): which corner flag (drawn Germany's left), Kroos's foot
 *  (drawn right), Müller's volleying foot (drawn right; the narration names no foot), exact runs and positions, the German teammate
 *  shown in Luiz's path, where in the net it went, Germany's all-white kit (recalled, not re-verified), Júlio César's kit (drawn red),
 *  the crowd and the late-afternoon light.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (τ = 0
 * Kroos strikes the corner). ch1 = the live, high main-stand camera in real time (the corner, Müller peeling away, the volley, the net);
 * ch2 = the TV replay low behind the goal at the back post (Müller drifting away from Luiz, nobody with him, the side-foot volley);
 * ch3 = a lit lesson replay (move away from your marker early, find the empty space, strike first time). Seams: goal mouth, then the ball.
 * Inks: yellow (Brazil and the crowd, floodlights, grass with blue), red (the keeper as drawn, skin), blue (Brazil's shorts, sky, grass),
 * navy (key line, numbers). Scenes read only their local t; drawn objects pose on twos; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/thomas-muller-brazil-2014/timing.json';
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

// ---------------- the Mineirão, Belo Horizonte, late afternoon: the bowl, roof, lights, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: Brazil yellow nearly everywhere, white shirts between, a small German end */
const CROWD=(()=>{const r=rng(2014),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=250;for(let i=0;i<n;i++){const c=r(),u=r(),away=st===2&&u>.75;out.push([st,u,.04+r()*.92,away?(c<.6?0:1):(c<.72?2:c<.9?0:1),r()*TAU]);}}return out;})();
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-104;x<=2;x+=9)out.push([x,36,70]);for(let z=-60;z<=60;z+=11)out.push([38,36,z]);for(let x=-104;x<=2;x+=9)out.push([x,36,-70]);for(let z=-60;z<=60;z+=11)out.push([-143,36,z]);return out;})();
type Stadium={t:number;cheer?:number;flash?:number;net?:(p:V3)=>V3;lesson?:boolean};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{t,cheer=0,flash=0,lesson=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // late-afternoon sky: pale blue with a warm yellow haze low down (the lesson prints it darker)
 s.field(B,.3,.6);s.tone(Y,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.15);if(lesson)s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.6);
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
 {let prev:[number,number]|null=null;for(let i=0;i<=4;i++){const a=Math.PI/2+i/4*Math.PI/2,pt:[number,number]=[Math.cos(a)*1,34-Math.sin(a)*1];if(prev)L(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);
 // a corner flag
 {const f0:V3=[0,0,34],f1:V3=[0,1.5,34];if(depthOf(c,f0)>1&&depthOf(c,f1)>1){const a=P(c,f0),b=P(c,f1),w=Math.max(2,.05*kAt(c,f1));s.fill(K,ribbon([a,b],w,{taper:0,pressure:0}),.95);const fl=clipPoly(c,[f1,[0,1.2,34],[-.45,1.35,34]]);if(fl.length>2)s.fill(Y,polyPath(fl,true),.95);}}
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
const GERMANY:A.AthleteStyle={...LINE,shirt:'paper',shorts:'paper',socks:'paper',numberInk:K,hairStyle:'short',build:{height:1.86},seed:7};
const MULLER:A.AthleteStyle={...GERMANY,number:13,build:{height:1.86,bulk:.92},seed:13};
const KROOS:A.AthleteStyle={...GERMANY,number:18,build:{height:1.83},seed:18};
const BRAZIL:A.AthleteStyle={...LINE,shirt:Y,shorts:B,socks:'paper',numberInk:B,hairStyle:'short',build:{height:1.83},seed:11};
const LUIZ:A.AthleteStyle={...BRAZIL,number:4,hairStyle:'curly',build:{height:1.89},seed:4};
const KEEPER:A.AthleteStyle={...LINE,shirt:R,shorts:R,socks:R,gloves:'paper',sleeves:'long',hairStyle:'short',number:12,numberInk:'paper',build:{height:1.86},seed:12};
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
 {label:'The corner',narration:'Belo Horizonte, 2014. The World Cup semi final, Brazil against Germany. Toni Kroos swings in a corner, and Thomas Müller slips away from his marker.',seconds:11,
  cues:[{at:0,words:'Belo Horizonte'},{at:1.4,words:'The World Cup semi final'},{at:3.4,words:'Brazil against Germany'},{at:5.2,words:'Toni Kroos swings'},{at:6.4,words:'a corner'},{at:7.6,words:'Thomas Müller slips away'},{at:9.2,words:'from his marker'}]},
 {label:'Nobody with him',narration:'Watch Müller. While everyone looks at the ball, he drifts to the back post. Nobody is with him! The ball drops, and he sweeps it in with one touch. Germany lead, one nil.',seconds:12,
  cues:[{at:0,words:'Watch Müller'},{at:1,words:'While everyone looks'},{at:2.6,words:'he drifts'},{at:3.6,words:'the back post'},{at:4.6,words:'Nobody is with him'},{at:6,words:'The ball drops'},{at:7,words:'he sweeps it in'},{at:8.4,words:'one touch'},{at:9.4,words:'Germany lead'}]},
 {label:'Get free',narration:'Want to be free like Müller? Move away from your marker before the ball comes. Find the empty space, and be ready to strike first time.',seconds:9,
  cues:[{at:0,words:'Want to be free'},{at:1.4,words:'Move away'},{at:2.8,words:'before the ball comes'},{at:4.2,words:'Find the empty space'},{at:5.8,words:'ready to strike'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`muller film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 Kroos strikes the corner) ----------------
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
const SPOT:V3=[-.5,.11,33.5];// the corner arc at Germany's left
const T_V=1.5,T_IN=T_V+.28;
const MUL_G:[number,number]=[-6.4,-3.4];
const TARGET:V3=[.8,.8,-.6];
const MUL_YAW=Math.atan2(TARGET[2]-MUL_G[1],TARGET[0]-MUL_G[0]);
const MUL_BUILD:A.Build={height:1.86,bulk:.92};
/** the side-foot volley at knee height: the library volley (side-on, swivel on the standing leg), low ball */
const mVol=(tau:number)=>A.volley(clamp(.5+(tau-T_V)/.9),{foot:'r',height:.25});
const CONTACT:V3=(()=>{const sk=A.solve(mVol(T_V),MUL_BUILD,{x:MUL_G[0],z:-MUL_G[1],yaw:MUL_YAW}),m=mix3(sk.rAn,sk.rToe,.5);return[m[0],m[1]+.08,-m[2]];})();
const MUL:MKey[]=[[-3,-10.8,-.6],[-.6,-10.4,-.2],[.2,-9.6,-1.2],[T_V-.35,MUL_G[0]-.5,MUL_G[1]+.2],[T_V,MUL_G[0],MUL_G[1]],[T_V+.8,-5.2,-6],[T_V+4,-9,-18]];
const LUIZ_P:MKey[]=[[-3,-10.2,.2],[-.6,-10,.5],[.3,-9.4,-.4],[.8,-8.9,-1.1],[T_V,-8.6,-1.4],[T_V+2,-7.4,-2.6]];// follows, then is screened off
const KROOS_P:MKey[]=[[-3,-3.2,31.5],[-.35,-.9,33.2],[0,-.8,33.4],[2,-4,30]];
function ballT(tau:number):V3{
 if(tau<0)return SPOT;
 if(tau<T_V)return flight(SPOT,CONTACT,T_V,tau/T_V);
 if(tau<T_IN)return mix3(CONTACT,TARGET,(tau-T_V)/(T_IN-T_V));
 const d=clamp((tau-T_IN)/.5);return[TARGET[0]+.6*d,Math.max(.11,TARGET[1]*(1-d*d)+.11*d*d),TARGET[2]];}
const KEEP_G:[number,number]=[-.9,1.2];
function keeperState(tau:number){const z=lerp(KEEP_G[1],-.2,sm(.6,T_V-.1,tau)),t0=T_V+.05-.55*1.05;const pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-t0)/1.05),{side:'l',height:.35});return{x:KEEP_G[0],z,yaw:Math.PI,pose};}
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:{...GERMANY,seed:21},path:[[-3,-8.6,2.5],[0,-8.6,1],[.8,-8.7,-.9],[T_V+2,-8.8,-1.2]]},// the German teammate who ends up in Luiz's path
 {style:{...GERMANY,seed:22},path:[[-3,-9,4.5],[1.3,-5.4,2.4],[T_V+2,-4.6,2]]},// attacking the near post
 {style:{...GERMANY,seed:23},path:[[-3,-12,6],[1.3,-7.6,4.2],[T_V+2,-7,4]]},
 {style:{...GERMANY,seed:24},path:[[-3,-17,-2],[T_V+2,-15,-1.5]]},
 {style:{...BRAZIL,seed:25},path:[[-3,-6.5,3.2],[1.3,-5.8,2.8],[T_V+2,-5.4,2.6]]},
 {style:{...BRAZIL,seed:26},path:[[-3,-7.8,5.4],[1.3,-7.2,4.5],[T_V+2,-6.9,4.2]]},
 {style:{...BRAZIL,seed:27},path:[[-3,-2,2.4],[T_V+2,-1.8,2.6]]},// on the near post
 {style:{...BRAZIL,seed:28},path:[[-3,-11.5,2.4],[1.3,-9.6,1.6],[T_V+2,-9.2,1.2]]},
 {style:{...BRAZIL,seed:29},path:[[-3,-15,-5],[T_V+2,-12,-4]]},
];
function mulState(tau:number,ball:V3){const st=moverState(MUL,tau,ball),w=sm(T_V-.55,T_V-.4,tau)*(1-sm(T_V+.45,T_V+.8,tau));
 let pose=A.blendPose(st.pose,mVol(tau),w);if(tau>T_V+.8)pose=A.blendPose(pose,A.celebrate(tau*1.3,{kind:'run'}),sm(T_V+.8,T_V+1.3,tau));
 return{...st,yaw:angLerp(st.yaw,MUL_YAW,w),pose};}
function kroosState(tau:number,ball:V3){const st=moverState(KROOS_P,tau,ball),w=sm(-.55,-.35,tau)*(1-sm(.45,.8,tau));return{...st,yaw:angLerp(st.yaw,Math.atan2(CONTACT[2]-SPOT[2],CONTACT[0]-SPOT[0])+.25,w),pose:A.blendPose(st.pose,A.strike(clamp(A.STRIKE_CONTACT+tau/1),{foot:'r',power:.8}),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...kroosState(t,b),style:KROOS},{...moverState(LUIZ_P,t,b),style:LUIZ},{...mulState(t,b),style:MULLER,smear:t>T_V-.25&&t<T_V+.3},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netFor=(tau:number)=>{const age=tau-T_IN;return age>0?netRipple(age,TARGET[1],TARGET[2]):undefined;};
const aimAt=(tau:number):V3=>{const a=ballT(tau),b=ballT(tau-.15),c=ballT(tau-.3);return[(a[0]+b[0]+c[0])/3,1.2,(a[2]+b[2]+c[2])/3];};

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({ks:T(0,'Toni Kroos swings'),ms:T(0,'Thomas Müller slips away'),end:SEC(0)});
/** real time: the corner is struck on "a corner", so Müller's slip lands on his name (and the goal before the seam) */
const tau1=(t:number)=>{const q=ch1T();return t-Math.min(T(0,'a corner')+.1,q.end-.75-T_IN-.3);};
function ch1Cam(t:number){const tau=tau1(t),q=ch1T(),a=aimAt(tau),box:V3=[-7,1.2,0],w=sm(-1.5,.8,tau,easeInOutSine),look=mix3(mix3([-12,1.2,14],a,.5),box,w);
 const F=key(tau,mono<number[]>([[-9,3000],[-1,3100],[.8,3600],[T_V,4300],[T_IN+.6,4700],[q.end,4400]]) as unknown as Key[],easeIO);
 return makeCam([look[0]-8,15,-46],look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-T_IN;
  frame(s);stadium(s,c,{t,cheer:.25+.9*sm(0,.5,goalIn),flash:.2+1*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,w.ball[1]>1.2?24:15)],'low');},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:8.5,
};

// ---------------- ch2: TV replay, low behind the goal at the back post: Müller drifts away, nobody with him, the volley ----------------
const ch2T=()=>({el:T(1,'While everyone looks'),hd:T(1,'he drifts'),bp:T(1,'the back post'),nb:T(1,'Nobody is with him'),bd:T(1,'The ball drops'),sw:T(1,'he sweeps it in'),ot:T(1,'one touch'),gl:T(1,'Germany lead'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,-.8],[q.el+.2,0],[q.hd+.2,.35],[q.bp+.3,.8],[q.nb+.5,1.1],[q.bd+.2,1.32],[q.sw+.2,T_V],[q.gl,T_IN+.4],[q.end,T_IN+2.2]]);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),m=moverPos(MUL,tau),a=aimAt(tau),w=sm(q.bd-.3,q.sw,t,easeInOutSine);
 const look=mix3([m.x-1,1.2,m.z+1.2],mix3(a,[m.x,1,m.z],.5),w);
 const v=key(t,mono<number[]>([[0,4.6,1.7,-8.2,1300],[q.hd,4.6,1.7,-8,1450],[q.nb,4.4,1.6,-7.6,1750],[q.sw,4.2,1.6,-7.3,1850],[q.gl,4.2,1.8,-7.3,1500],[q.end,4.4,2.2,-7.6,1300]]) as unknown as Key[],easeIO,true);
 return makeCam([v[0],v[1],v[2]],look,v[3]);}
const ring=(s:Sheet,c:Cam,p:V3,r:number,w:number)=>{const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[p[0]+Math.cos(a)*r,.04,p[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),w,.95);};
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const hit=q.sw+.2,shake=t>=hit?7*settle(t,hit,{freq:6,decay:6}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(q.gl,q.gl+.5,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.2,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
  if(tt>=hit&&tt<hit+.45){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],70+70*sm(hit,hit+.12,tt,easeOut),{n:9,seed:81,g:1-sm(hit+.2,hit+.45,tt),width:10});}},
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.9,12);},
 still:7,
};

// ---------------- ch3: lesson replay from high behind the box — move away early, find the space, strike first time ----------------
const ch3T=()=>({ma:T(2,'Move away'),bc:T(2,'before the ball comes'),fs:T(2,'Find the empty space'),rs:T(2,'ready to strike'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,-.6],[q.ma,-.3],[q.bc+.3,.5],[q.fs+.3,1.1],[q.rs+.3,T_V],[q.end,T_IN+.8]]);};
function ch3Cam(t:number){const q=ch3T();return camOf(t,[[0,-24,11,-9,-8,.5,-.5,1500],[q.bc,-23,10.5,-9,-7.5,.5,-1.5,1600],[q.fs,-21,10,-9,-6.8,.5,-2.6,1800],[q.end,-20,9.5,-9,-5.6,.6,-2,1850]]);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true,net:netFor(tau)});
  // move away: Müller's path away from Luiz; before the ball comes: the corner's arc; empty space: rings at the back post; strike: a spark
  const ma=sm(q.ma,q.ma+.6,tt,easeOut);if(ma>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const m=moverPos(MUL,lerp(-.6,T_V,i/16));pts.push(P(c,[m.x,.05,m.z]));}dashed(s,pts,16,ma);}
  const bc=sm(q.bc,q.bc+.6,tt,easeOut);if(bc>0){const pts:Pt[]=[];for(let i=0;i<=18;i++)pts.push(P(c,flight(SPOT,CONTACT,T_V,.35+.65*i/18)));dashed(s,pts,12,bc);}
  const fs=sm(q.fs,q.fs+.4,tt,easeOutBack);if(fs>.02){ring(s,c,[MUL_G[0],0,MUL_G[1]],1*fs,12);ring(s,c,[MUL_G[0],0,MUL_G[1]],1.7*fs,7);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,24)]);
  const rs=q.rs+.3;if(tt>=rs-.05&&tt<rs+.5){const p=P(c,CONTACT);sparkBurst(s,Y,p[0],p[1],90+70*sm(rs,rs+.12,tt,easeOut),{n:9,seed:91,g:1-sm(rs+.2,rs+.5,tt),width:11});}},
 still:6,
};

const story:RisoStory={
 id:'thomas-muller-brazil-2014',format:'11v11',title:"Müller finds the space",
 theme:'Move away from your marker before the ball comes, so you are free when it arrives.',
 ageNote:'2014 World Cup semi-final, Brazil 1–7 Germany, Estádio Mineirão, Belo Horizonte, 8 July 2014.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: an empty-space ring opens at the point and a ball drops into it. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const g=age<=0?1:easeOutBack(clamp(age/.3)),d=age<=0?1:clamp(age/.6),by=y-160*(1-d*d);
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*95*g,y+Math.sin(q)*32*g] as Pt;}),true),10,.95);
  ballAt(s,x,by,44,age*9+hash(seed,3)*TAU,{sq:d>=1&&age>0?.15*Math.max(0,1-(age-.6)*5):0,dir:-Math.PI/2});
 },
};
export default story;
