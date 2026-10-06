/** Iconic play film — Edinson Cavani's first goal, 2018 FIFA World Cup round of 16, Uruguay 2–1 Portugal, Fisht Stadium, Sochi,
 * 30 June 2018, 7th minute: Cavani switches play to Luis Suárez, sprints into the box and heads Suárez's cross in at the back post.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration: public/plays/narration/cavani-portugal-2018/script.json, voiced with local Kokoro (af_bella, 1.0) → timing.json; withTiming()
 * swaps the measured word onsets into the cues, and EVERY action time below is read from those cues.
 *
 * SOURCES (read Sep 26 2026):
 *  - Wikipedia, "2018 FIFA World Cup knockout stage" (Uruguay vs Portugal): "In the seventh minute, Edinson Cavani switched play from right
 *    to left with a sweeping pass out to Luis Suárez, who delivered a cross which the former crashed home at the back post from six yards
 *    out." Pepe equalised (55'), Cavani's curling right-foot winner (62').
 *  - ESPN / Sports Illustrated / FIFA match reports (via search): "a wonderful 40-yard diagonal pass to Luis Suárez", "Suárez returned the
 *    favour with a sumptuous cross toward the opposite post", "a bullet header at the far post".
 * CONFIRMED: date, stage, venue, minute, 0–0 → 1–0, Cavani's switch from right to left (≈ 40 yards) to Suárez, Suárez's cross, Cavani's
 *  header at the back post from about six yards; Uruguay's sky-blue shirts; Portugal in red (the famous photo of Ronaldo helping the injured
 *  Cavani off shows Ronaldo in red).
 * INFERRED / ILLUSTRATIVE (the footage could not be reviewed in this session): Cavani's passing foot and Suárez's crossing foot (drawn right;
 *  the narration names no foot), where exactly each player stood and ran, flight times, Suárez's touches before the cross, the pass that
 *  reached Cavani before the switch (drawn from a teammate behind him), where in the net the header went, Portugal's socks (drawn red —
 *  their green socks cannot print as one ink here), Uruguay's black shorts and socks, the keeper's kit (drawn yellow), the crowd.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (τ = 0
 * Cavani's switch). ch1 = the live, high main-stand camera in real time (the switch, Suárez, the cross, the header, the net); ch2 = the TV
 * replay low on the left side of the box (Cavani's long run, the cross, the back-post header); ch3 = a lit lesson replay (pass, don't
 * watch, sprint into the box, attack the far post). Seams: forward passages into the goal mouth and the ball.
 * Inks: yellow (floodlights, keeper, grass with blue), red (Portugal and fans, skin), blue (Uruguay's sky blue as a screen, night sky,
 * grass), navy (key line, Uruguay's shorts). Scenes read only their local t; drawn objects pose on twos; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/cavani-portugal-2018/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';
import {beats,shotAt,type ShotParams,reframe,steady,type Pin,type Keep,type View as DView} from './director';

const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const K='navy',R='red',Y='yellow',B='blue';
function frame(s:Sheet,zoom=1,rot=0,dx=0,dy=0){const S=zoom*s.arrival;DV={w:s.W,h:s.H};s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,rot);}

/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1080,h:1080};
// ---------------- 3D pinhole camera over a real pitch (metres; x → the goal line at 0, z → far touchline, y up) ----------------
type V3=[number,number,number];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
type Cam={p:V3;f:V3;r:V3;u:V3;F:number;t:V3};
function makeCam(p:V3,look:V3,F:number):Cam{const f=nrm(sub(look,p)),r=nrm([f[2],0,-f[0]]),u:V3=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];return{p,f,r,u,F,t:look};}
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

// ---------------- Fisht Stadium, Sochi, at night: the bowl, the roof rim of floodlights, grass, lines, boards, the goal ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const,OUT=[[-150,78],[45,78],[45,-78],[-150,-78]] as const;
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],32,OUT[j][1]],[OUT[i][0],32,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: Portugal red and Uruguay sky blue in blocks, paper-white shirts between */
const CROWD=(()=>{const r=rng(2018),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===0?250:200;for(let i=0;i<n;i++){const c=r(),u=r(),blueEnd=u>.55;out.push([st,u,.04+r()*.92,c<.18?0:(blueEnd?(c<.8?2:1):(c<.8?1:2)),r()*TAU]);}}return out;})();
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
  if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.9);if(seen[2])s.tone(B,heads[2],.55);
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
const URUGUAY:A.AthleteStyle={...LINE,shirt:[B,.55],shorts:K,socks:K,numberInk:K,hairStyle:'short',build:{height:1.82},seed:7};
const CAVANI:A.AthleteStyle={...URUGUAY,number:21,hairStyle:'long',build:{height:1.84},seed:21};
const SUAREZ:A.AthleteStyle={...URUGUAY,number:9,build:{height:1.82},seed:9};
const PORTUGAL:A.AthleteStyle={...LINE,shirt:R,shorts:R,socks:R,hairStyle:'short',build:{height:1.84},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:Y,shorts:K,socks:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.9},seed:13};
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:{depth:number;draw:()=>void}[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:{depth:number;draw:()=>void}[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  // the wide live shot draws everyone at low detail; only Cavani returns to full detail once the director has pushed in on him
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail:detail==='low'&&bd.style===CAVANI&&kk*1.84>=240?'auto':detail};
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
 {label:'The switch',narration:'Sochi, 2018. The World Cup, Uruguay against Portugal. Edinson Cavani sprays a long pass out to Luis Suárez on the left, then starts to run.',seconds:11,
  cues:[{at:0,words:'Sochi'},{at:1.2,words:'The World Cup'},{at:2.3,words:'Uruguay against Portugal'},{at:4.2,words:'Edinson Cavani sprays'},{at:5.6,words:'a long pass'},{at:6.6,words:'Luis Suárez'},{at:7.8,words:'on the left'},{at:8.8,words:'then starts to run'}]},
 {label:'Keep running',narration:'Watch Cavani again. He passes, and keeps running, into the box. Suárez whips the ball across to the far post, and there is Cavani, crashing in to head it home. One nil to Uruguay!',seconds:14,
  cues:[{at:0,words:'Watch Cavani again'},{at:1.3,words:'He passes'},{at:2.2,words:'keeps running'},{at:3.2,words:'into the box'},{at:5,words:'Suárez whips'},{at:6.6,words:'far post'},{at:7.6,words:'there is Cavani'},{at:8.8,words:'head it home'},{at:10.2,words:'One nil'}]},
 {label:'Pass and go',narration:'Want to score like Cavani? After you pass, do not stand and watch. Sprint into the box, aim for the far post, and the ball can come straight back to you.',seconds:10,
  cues:[{at:0,words:'Want to score'},{at:1.4,words:'After you pass'},{at:2.4,words:'do not stand and watch'},{at:4,words:'Sprint into the box'},{at:5.4,words:'aim for the far post'},{at:7,words:'come straight back'}]},
],VOICE);
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cavani film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

// ---------------- the play: ONE simulation on a real clock τ (τ = 0 Cavani's switch) ----------------
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
// Cavani on the right of centre: a teammate's ball reaches him, he switches it ≈ 36 m to Suárez on the left
const CAV_G:[number,number]=[-38,-9],SUA_REC_G:[number,number]=[-22.6,22.6];
const CAV_YAW=Math.atan2(SUA_REC_G[1]-CAV_G[1],SUA_REC_G[0]-CAV_G[0]);
const CAV_BUILD:A.Build={height:1.84},SUA_BUILD:A.Build={height:1.82};
const cPass=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+tau/.95),{foot:'r',power:.8});
const SWITCH_PT:V3=(()=>{const q=toeAt(cPass(0),CAV_BUILD,CAV_G,CAV_YAW,'r');return[q[0],.11,q[2]];})();
const T_ARR=1.85,T_CROSS=3.9,T_HEAD=5.15,T_IN=T_HEAD+.3;
const SUA_X_G:[number,number]=[-16.2,19.2];
const SUA_YAW=Math.atan2(-4.5-SUA_X_G[1],-5-SUA_X_G[0]);
const sCross=(tau:number)=>A.strike(clamp(A.STRIKE_CONTACT+(tau-T_CROSS)/.95),{foot:'r',power:.85});
const CROSS_PT:V3=(()=>{const q=toeAt(sCross(T_CROSS),SUA_BUILD,SUA_X_G,SUA_YAW,'r');return[q[0],.11,q[2]];})();
const REC_PT:V3=[SUA_REC_G[0]+.5,.11,SUA_REC_G[1]-.4];
// the back-post header, six yards out: the ball meets his forehead (solved from the skeleton at the header's contact)
const HEAD_G:[number,number]=[-5.6,-4.3],HEAD_YAW=Math.atan2(-1.9-HEAD_G[1],0-HEAD_G[0]);
const cHead=(tau:number)=>A.header(clamp(.52+(tau-T_HEAD)/1.0));
const HEAD_PT:V3=(()=>{const sk=A.solve(cHead(T_HEAD),CAV_BUILD,{x:HEAD_G[0],z:-HEAD_G[1],yaw:HEAD_YAW}),h=sk.head,f=sk.face;return[f[0]+(f[0]-h[0])*.6,h[1]+.05,-(f[2]+(f[2]-h[2])*.6)];})();
const GOALIN:V3=[.8,.55,-1.9];
const CAV:MKey[]=[[-4,-44,-6],[-.6,-38.9,-8.5],[0,CAV_G[0],CAV_G[1]],[.7,-36.6,-9.1],[2.4,-26,-8.6],[4.2,-12,-6.8],[T_HEAD-.25,HEAD_G[0]-1.2,HEAD_G[1]-.1],[T_HEAD,HEAD_G[0],HEAD_G[1]],[T_HEAD+.7,-4,-5.2],[T_HEAD+4,-10,-22]];
const SUA:MKey[]=[[-4,-26,27],[0,-24,24.5],[T_ARR,SUA_REC_G[0],SUA_REC_G[1]],[T_CROSS-.5,SUA_X_G[0]-.9,SUA_X_G[1]+.5],[T_CROSS,SUA_X_G[0],SUA_X_G[1]],[T_CROSS+1.5,-13,17]];
const MATE:MKey[]=[[-4,-50,-1],[-1.6,-47,-3],[4,-44,-2]];// the teammate who finds Cavani
const T_MATE=-1.45;
function ballT(tau:number):V3{
 if(tau<T_MATE){const q=moverPos(MATE,tau);return[q.x+.6,.11,q.z-.3];}
 if(tau<0){const a=ballT(T_MATE-.001),u=easeOut((tau-T_MATE)/-T_MATE);return mix3(a,SWITCH_PT,u);}
 if(tau<T_ARR)return flight(SWITCH_PT,REC_PT,T_ARR,tau/T_ARR);
 if(tau<T_CROSS){const q=moverPos(SUA,tau),v=Math.hypot(q.vx,q.vz);if(tau>T_CROSS-.4)return mix3(ballT(T_CROSS-.4),CROSS_PT,(tau-(T_CROSS-.4))/.4);return[q.x+(v>.3?q.vx/v*.6:.5),.11,q.z+(v>.3?q.vz/v*.6:-.4)];}
 if(tau<T_HEAD)return flight(CROSS_PT,HEAD_PT,T_HEAD-T_CROSS,(tau-T_CROSS)/(T_HEAD-T_CROSS));
 if(tau<T_IN){const u=(tau-T_HEAD)/(T_IN-T_HEAD);return mix3(HEAD_PT,GOALIN,u);}
 const d=clamp((tau-T_IN)/.5);return[GOALIN[0]+.6*d,Math.max(.11,GOALIN[1]*(1-d*d)+.11*d*d),GOALIN[2]];}
const KEEP_G:[number,number]=[-1.2,1.6];
function keeperState(tau:number){
 const shuffle=sm(T_CROSS,T_HEAD-.2,tau),z=lerp(KEEP_G[1],-.6,shuffle),t0=T_HEAD+.12-.55*1.05;
 const pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-t0)/1.05),{side:'l',height:.3});return{x:KEEP_G[0],z,yaw:Math.PI,pose};}
const OTHERS:{style:A.AthleteStyle;path:MKey[]}[]=[
 {style:{...PORTUGAL,seed:21},path:[[-4,-30,-4],[2,-20,-6],[T_HEAD,-7.2,-3.1],[T_HEAD+2,-6.5,-2.8]]},// Cavani's marker, a step behind
 {style:{...PORTUGAL,seed:22},path:[[-4,-26,2],[3,-14,1],[T_HEAD,-8,.5],[T_HEAD+2,-7.6,.4]]},
 {style:{...PORTUGAL,seed:23},path:[[-4,-28,10],[3,-17,8],[T_HEAD,-9,4.8],[T_HEAD+2,-8.6,4.4]]},
 {style:{...PORTUGAL,seed:24},path:[[-4,-30,19],[T_ARR,-24.5,19.5],[T_CROSS,-17.6,17.1],[T_CROSS+2,-15,15]]},// the full-back to Suárez
 {style:{...PORTUGAL,seed:25},path:[[-4,-42,-14],[4,-30,-14],[T_HEAD+2,-22,-12]]},
 {style:{...URUGUAY,seed:26},path:[[-4,-34,4],[3,-18,3],[T_HEAD,-11,1.8],[T_HEAD+2,-10.5,1.5]]},
 {style:{...URUGUAY,seed:27},path:MATE},
];
function cavState(tau:number,ball:V3){const st=moverState(CAV,tau,ball),wp=sm(-.55,-.35,tau)*(1-sm(.45,.75,tau)),wh=sm(T_HEAD-.55,T_HEAD-.4,tau)*(1-sm(T_HEAD+.5,T_HEAD+.8,tau));
 let pose=A.blendPose(st.pose,cPass(tau),wp);pose=A.blendPose(pose,cHead(tau),wh);
 if(tau>T_HEAD+.8)pose=A.blendPose(pose,A.celebrate(tau*1.3,{kind:'run'}),sm(T_HEAD+.8,T_HEAD+1.3,tau));
 return{...st,yaw:angLerp(angLerp(st.yaw,CAV_YAW,wp),HEAD_YAW,wh),pose};}
function suaState(tau:number,ball:V3){const st=moverState(SUA,tau,ball),w=sm(T_CROSS-.55,T_CROSS-.4,tau)*(1-sm(T_CROSS+.45,T_CROSS+.8,tau));
 let pose=st.pose;if(tau>T_ARR+.1&&tau<T_CROSS-.4)pose=A.blendPose(pose,A.dribble(((moverPos(SUA,tau).dist/1.8)%1+1)%1,{foot:'r',speed:.6}),.6);
 return{...st,yaw:angLerp(st.yaw,SUA_YAW,w),pose:A.blendPose(pose,sCross(tau),w)};}
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  for(const m of OTHERS)out.push({...moverState(m.path,t,b),style:m.style});
  out.push({...suaState(t,b),style:SUAREZ},{...cavState(t,b),style:CAVANI,smear:t>T_HEAD-.25&&t<T_HEAD+.3},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}
const netFor=(tau:number)=>{const age=tau-T_IN;return age>0?netRipple(age,GOALIN[1],GOALIN[2]):undefined;};
const aimAt=(tau:number):V3=>{const a=ballT(tau),b=ballT(tau-.15),c=ballT(tau-.3);return[(a[0]+b[0]+c[0])/3,1.2,(a[2]+b[2]+c[2])/3];};

// ---------------- ch1: live, high main-stand camera, real time ----------------
const ch1T=()=>({sp:T(0,'Edinson Cavani sprays'),end:SEC(0)});
const tau1=(t:number)=>{const q=ch1T();return t-Math.min(q.sp+.6,q.end-.75-T_IN-.3);};
/** the Portugal players and the keeper (feet), for the nearSlide() keeps */
const foesAt=(tau:number):V3[]=>OTHERS.slice(0,5).map(m=>{const q=moverPos(m.path,tau);return[q.x,0,q.z] as V3;}).concat([[KEEP_G[0],0,lerp(KEEP_G[1],-.6,sm(T_CROSS,T_HEAD-.2,tau))] as V3]);
const pinOf=(c:Cam):Pin=>({eye:c.p,target:c.t,F:c.F});
const camOfPin=(p:Pin)=>makeCam(p.eye,p.target,p.F);
const GOAL_KEEP:V3[]=[[0,2.44,-3.66],[0,0,-3.66],[0,0,1.5]];
/** the ball as a keep that matters only while it is near the hero (a ball flying past the replay camera never vetoes the push-in) */
const ballKeep=(b:V3,h:V3,r0=6,r1=14,g=1):Keep[]=>hard(b,(1-sm(r0,r1,Math.hypot(b[0]-h[0],b[2]-h[2])))*g,h);
/** reframe about the hero with the teaching keeps; the aim leans toward their weighted centre (passed as the director's ball focus, so it
 * slides smoothly as a keep fades in or out — no snap when a weight crosses "hard"); the nearby players are kept in frame but never steer the aim */
function direct(c:Cam,hero:V3,teach:Keep[],soft:Keep[],shot:ShotParams):Pin{
 let x=0,y=0,z=0,w=0;for(const k of teach){const P=Array.isArray(k)?k as V3:(k as {P:V3}).P,wk=Array.isArray(k)?1:(k as {w:number}).w;x+=P[0]*wk;y+=P[1]*wk;z+=P[2]*wk;w+=wk;}
 const u=w/(w+1.5),poi:V3=w>0?[lerp(hero[0],x/w,u),lerp(1,y/w,u),lerp(hero[2],z/w,u)]:[hero[0],1,hero[2]];
 return reframe(pinOf(c),{hero,ball:poi,keep:[...teach,...soft],height:1.84},shot,DV);}
/** a teaching keep that never pops: instead of fading its weight (the fit would flip when a fading point slips behind the lens), the
 * point itself slides in from the hero as w rises and back into him as w falls — a hard keep throughout, so the framing moves continuously */
const hard=(P:V3,w:number,hero:V3):Keep[]=>{if(w<=.001)return[];const u=Math.min(1,w),y0=Math.min(P[1],1.84);return[{P:[lerp(hero[0],P[0],u),lerp(y0,P[1],u),lerp(hero[2],P[2],u)],w:1}];};
const both=(g:[number,number]|{x:number;z:number},w:number,hero:V3,h=1.84):Keep[]=>{const x=Array.isArray(g)?g[0]:g.x,z=Array.isArray(g)?g[1]:g.z;return[...hard([x,0,z],w,hero),...hard([x,h,z],w,hero)];};
/** the players near the hero (the defender he is beating, his marker, the keeper) as sliding keeps — like the director's near(), weighted
 * 1 inside r0 m fading to 0 at r1, but each point slides out of the hero instead of softening, so the fit never flips frame to frame */
const nearSlide=(hero:V3,others:V3[],r0:number,r1:number,about:V3=hero,g=1):Keep[]=>others.flatMap(o=>{const w=(1-sm(r0,r1,Math.hypot(o[0]-about[0],o[2]-about[2])))*g;return[...hard([o[0],0,o[2]],w,hero),...hard([o[0],1.84,o[2]],w,hero)];});
/** Director beats, ch1 (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the bowl, follow Cavani as the ball is
 * worked to him, push in low for the switch itself (the touch), then pull OUT for the 36 m long ball — Cavani and the ball first, then the
 * ball and Suárez at the far side (the decision: the space on the left). Close on Suárez taking it down, pull out again for the cross with
 * Cavani's run into the box, push in tight for the back-post header with the goal mouth and keeper kept, and hold on the celebration. */
const ch1Off=()=>{const q=ch1T();return Math.min(q.sp+.6,q.end-.75-T_IN-.3);};
const B1=beats([[0,'wide'],[1.2,'follow'],[T(0,'Edinson Cavani sprays')-.3,'tight'],[T(0,'Edinson Cavani sprays')+.5,{from:'space',size:.24}],
 [T(0,'Luis Suárez')-.3,{from:'follow',size:.4}],[T(0,'then starts to run')-.7,{from:'space',size:.26}],[ch1Off()+T_HEAD-.3,'tight'],[ch1Off()+T_IN+.3,'reaction']]);
/** the directed camera, steadied over ±.5 s (pure in t: seeking and the 15 fps player see the same move) */
function ch1Cam(t:number){return camOfPin(steady(t,ch1Dir,.5,5));}
function ch1Dir(t:number):Pin{const tau=tau1(t),c=ch1CamAuthored(t),cav=moverPos(CAV,tau),sua=moverPos(SUA,tau);
 // the hero: Cavani, handed to Suárez while the switch flies to him, and back to Cavani as the cross flies (blended, never a hard switch)
 const u=sm(.9,2.4,tau,easeInOutSine)*(1-sm(T_CROSS-.6,T_CROSS+.95,tau,easeInOutSine)),hero:V3=[lerp(cav.x,sua.x,u),0,lerp(cav.z,sua.z,u)];
 const keep:Keep[]=[...both(cav,1-sm(1.4,2.2,tau,easeInOutSine),hero),...both(sua,sm(.1,.8,tau,easeInOutSine)*(1-sm(T_CROSS,T_CROSS+.8,tau,easeInOutSine)),hero,1.82),
  ...GOAL_KEEP.flatMap(P=>hard(P,sm(T_CROSS+.2,T_HEAD-.2,tau,easeInOutSine),hero)),...ballKeep(ballT(tau),hero,4,10,1-sm(-1.2,-.3,tau)),...hard(ballT(tau),sm(-1.2,-.3,tau),hero)];
 const fo=foesAt(tau),cp:V3=[cav.x,0,cav.z],sp:V3=[sua.x,0,sua.z];// near players measured from the real players (not the moving hand-over point)
 return direct(c,hero,keep,[...nearSlide(hero,fo,5,9,cp,1-u),...nearSlide(hero,fo,5,9,sp,u)],shotAt(t,B1));}
function ch1CamAuthored(t:number){const tau=tau1(t),q=ch1T(),a=aimAt(tau),cav=moverPos(CAV,tau),g=sm(T_CROSS-.3,T_HEAD,tau,easeInOutSine);
 // the director keeps Cavani's run in the picture while the ball is out on the left, then frames the box
 const run=sm(T_ARR-.4,T_ARR+.6,tau)*(1-g),look=mix3(mix3(a,[cav.x,1,cav.z],run*.45),[-4,1.2,-1],g*.5);
 const F=key(tau,mono<number[]>([[-6,3000],[0,3200],[T_ARR,2900],[T_CROSS,3500],[T_HEAD,4400],[q.end,4200]]) as unknown as Key[],easeIO);
 return makeCam([look[0]-6,18,-56],look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),tau=tau1(t),c=ch1Cam(t),w=worldBodies(tau,tau1(tt),1/12),goalIn=tau-T_IN;
  frame(s);stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),flash:.25+1.2*sm(0,.4,goalIn),net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,w.ball[1]>1.2?24:15)],'low');},
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:9.5,
};

// ---------------- ch2: TV replay, low on the left of the box, looking across at Cavani's run and the back post ----------------
const ch2T=()=>({hp:T(1,'He passes'),kr:T(1,'keeps running'),box:T(1,'into the box'),sw:T(1,'Suárez whips'),fp:T(1,'far post'),tc:T(1,'there is Cavani'),hh:T(1,'head it home'),on:T(1,'One nil'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return clockMap(t,[[0,-.7],[q.hp+.15,0],[q.sw+.2,T_CROSS],[q.fp+.2,T_CROSS+.75],[q.tc+.35,T_HEAD-.05],[q.hh+.1,T_HEAD+.1],[q.on+.1,T_IN+.5],[q.end,T_IN+2.4]]);};
/** Director beats, ch2: the replay starts on Cavani, pushes in low for his pass, follows him as he keeps running, pulls out as Suárez whips
 * the cross in (the run and the ball both in the picture), then tight on the back-post header with the goal and the keeper kept in frame,
 * and the reaction for one nil. Cavani's marker stays in shot (near) so the viewer sees him lose the man. */
const B2=beats([[0,'follow'],[T(1,'He passes')-.35,'tight'],[T(1,'keeps running')+.1,'follow'],[T(1,'Suárez whips')-.3,{from:'space',size:.26}],
 [T(1,'there is Cavani')-.1,'tight'],[T(1,'head it home')+.4,'reaction']]);
function ch2Cam(t:number){return camOfPin(steady(t,ch2Dir,.5,5));}
function ch2Dir(t:number):Pin{const q=ch2T(),tau=tau2(t),c=ch2CamAuthored(t),cav=moverPos(CAV,tau),hero:V3=[cav.x,0,cav.z];
 const keep:Keep[]=[...GOAL_KEEP.flatMap(P=>hard(P,sm(q.sw,q.fp,t)*(1-sm(q.hh+.3,q.hh+1.4,t)),hero))],cross=sm(q.sw,q.fp,t),wb=1-sm(-.1,.5,tau)*(1-sm(T_ARR,T_CROSS-.3,tau));
 return direct(c,hero,[...keep,...ballKeep(ballT(tau),hero,lerp(5,10,cross),lerp(20,30,cross),wb)],nearSlide(hero,foesAt(tau),3.5,7),shotAt(t,B2));}
function ch2CamAuthored(t:number){const q=ch2T(),tau=tau2(t),cav=moverPos(CAV,tau),a=aimAt(tau),w=sm(q.sw-.2,q.fp,t,easeInOutSine);
 const look=mix3([cav.x+3,1.2,cav.z+1],mix3(a,[HEAD_PT[0],1.3,HEAD_PT[2]],.5),w);
 const v=key(t,mono<number[]>([[0,-14,1.8,27,1100],[q.box,-13,1.8,26,1200],[q.sw,-12,1.9,25,1300],[q.tc,-11.5,1.9,24.5,2000],[q.hh,-11.5,1.9,24.5,2300],[q.end,-12,2.4,24,1600]]) as unknown as Key[],easeIO,true);
 return makeCam([v[0],v[1],v[2]],look,v[3]);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),Math.max(.01,tau2(tt)-tau2(tt-1/12)));
  const hit=q.hh+.1,shake=t>=hit?8*settle(t,hit,{freq:6,decay:6}):0;frame(s,1,0,shake,shake*.3);
  const roar=sm(q.on,q.on+.5,tt,easeOut);stadium(s,c,{t,cheer:.15+roar,flash:.1+roar*1.4,net:netFor(tau)});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,22)]);
  if(tt>=hit&&tt<hit+.45){const p=P(c,HEAD_PT);sparkBurst(s,Y,p[0],p[1],80+80*sm(hit,hit+.12,tt,easeOut),{n:9,seed:51,g:1-sm(hit+.2,hit+.45,tt),width:11});}},
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(22,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.9,12);},
 still:9,
};

// ---------------- ch3: lesson replay from high behind the run — pass, don't watch, sprint, far post ----------------
const ch3T=()=>({ap:T(2,'After you pass'),dn:T(2,'do not stand and watch'),sb:T(2,'Sprint into the box'),fp:T(2,'aim for the far post'),cb:T(2,'come straight back'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return clockMap(t,[[0,-.5],[q.ap+.2,0],[q.dn,.5],[q.sb+.3,2.2],[q.fp+.3,T_CROSS],[q.cb+.4,T_HEAD],[q.end,T_IN+.9]]);};
/** Director beats, ch3 (the lesson): closer than the authored high shot, but every mark stays readable — the dashed switch (pass point
 * and Suárez) while it is drawn, the ring round Cavani for "do not stand and watch", the far post from the sprint on, and the cross's run-in —
 * and a tight finish on the header that "comes straight back". */
/** a point 80 % along Suárez's cross: the drawn arc's run-in to the far post stays readable */
const CROSS_MID:V3=flight(CROSS_PT,HEAD_PT,T_HEAD-T_CROSS,.8);
const B3=beats([[0,'lesson'],[T(2,'come straight back')+.1,{from:'tight',size:.45}]]);
function ch3Cam(t:number){return camOfPin(steady(t,ch3Dir,.5,5));}
function ch3Dir(t:number):Pin{const q=ch3T(),tau=tau3(t),c=ch3CamAuthored(t),cav=moverPos(CAV,tau),hero:V3=[cav.x,0,cav.z];
 const E=easeInOutSine,wa=sm(q.ap-.6,q.ap,t,E)*(1-sm(q.dn-.2,q.dn+1.2,t,E)),wr=sm(q.dn-.6,q.dn,t,E)*(1-sm(q.sb-.6,q.sb+1.1,t,E)),wf=sm(q.sb-.6,q.sb+.6,t,E),wc=sm(q.cb-.7,q.cb,t,E)*(1-sm(q.cb+.6,q.cb+1.4,t,E));
 const keep:Keep[]=[...hard(SWITCH_PT,wa,hero),...both(SUA_REC_G,wa,hero,1.82),...both(CAV_G,wr,hero),...hard([HEAD_G[0]-1.5,0,HEAD_G[1]],wf,hero),...hard([HEAD_G[0]+1.5,0,HEAD_G[1]],wf,hero),...hard(CROSS_MID,wc,hero)];
 return direct(c,hero,[...keep,...ballKeep(ballT(tau),hero,5,20)],nearSlide(hero,foesAt(tau),3,6),shotAt(t,B3));}
function ch3CamAuthored(t:number){const q=ch3T();return camOf(t,[[0,-54,20,-18,-30,0,-2,1250],[q.dn,-52,19,-17,-26,0,0,1250],[q.sb,-44,17,-14,-18,0,1,1300],[q.fp,-34,15,-12,-9,0,0,1450],[q.end,-30,14,-11,-7,.5,-1,1550]]);}
const ring=(s:Sheet,c:Cam,p:V3,r:number,w:number)=>{const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(c,[p[0]+Math.cos(a)*r,.04,p[2]+Math.sin(a)*r]));}s.stroke(Y,polyPath(pts,true),w,.95);};
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),Math.max(.01,tau3(tt)-tau3(tt-1/12)));
  frame(s);stadium(s,c,{t,lesson:true,net:netFor(tau)});
  // after you pass: the switch drawn as a dashed arc; sprint: Cavani's run drawn behind him; far post: rings at the back post; come back: the cross
  const ap=sm(q.ap,q.ap+.6,tt,easeOut);if(ap>0){const pts:Pt[]=[];for(let i=0;i<=16;i++)pts.push(P(c,flight(SWITCH_PT,REC_PT,T_ARR,i/16)));dashed(s,pts,14,ap);}
  const dn=sm(q.dn,q.dn+.3,tt)*(1-sm(q.sb,q.sb+.3,tt));if(dn>.02)ring(s,c,[CAV_G[0],0,CAV_G[1]],1.4*easeOutBack(dn),12);
  const sb=sm(q.sb,q.sb+.5,tt,easeOut);if(sb>0){const pts:Pt[]=[];for(let i=0;i<=22;i++){const m=moverPos(CAV,lerp(0,Math.min(tau,T_HEAD),i/22));pts.push(P(c,[m.x,.05,m.z]));}dashed(s,pts,18,sb);}
  const fp=sm(q.fp,q.fp+.4,tt,easeOutBack);if(fp>.02){ring(s,c,[HEAD_G[0],0,HEAD_G[1]],.9*fp,12);ring(s,c,[HEAD_G[0],0,HEAD_G[1]],1.5*fp,8);}
  const cb=sm(q.cb,q.cb+.5,tt,easeOut);if(cb>0){const pts:Pt[]=[];for(let i=0;i<=16;i++)pts.push(P(c,flight(CROSS_PT,HEAD_PT,T_HEAD-T_CROSS,i/16)));dashed(s,pts,14,cb);}
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,22)]);},
 still:7,
};

const story:RisoStory={
 id:'cavani-portugal-2018',format:'11v11',title:"Cavani's pass and go",
 theme:'Pass and keep running: the ball can come straight back to you.',
 ageNote:'2018 World Cup round of 16, Uruguay 2–1 Portugal, Fisht Stadium, Sochi, 30 June 2018.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a one-two — the ball leaves the point and curls back to it, with a yellow ring. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,u=age<=0?0:clamp(age/.8),out=Math.sin(u*Math.PI),g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  ballAt(s,x+Math.cos(a)*150*out,y+Math.sin(a)*60*out-80*out,46,age*10+hash(seed,3)*TAU);
 },
};
export default story;
