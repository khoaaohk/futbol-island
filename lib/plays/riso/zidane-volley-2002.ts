/** Iconic play film — Zidane's volley, UEFA Champions League final, Real Madrid 2–1 Bayer Leverkusen, Hampden Park, Glasgow, 15 May 2002.
 * A RisoStory (chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * Narration text: public/plays/narration/zidane-volley-2002/script.json (voiced later by the shared Kokoro generator; until then each
 * chapter runs on `seconds` estimated at ~2.6 words/s). EVERY action time is read from the chapter's cue `at` values and the chapter's
 * seconds, so swapping in real word timings re-times the animation with no code change.
 *
 * Frame: composed on the FULL sheet (W × H, centred on W/2, H/2), never on sheet.safe — the card window is small (≈ 300×180 … 380×260,
 * or near-square ≈ 346×364), so every key action sits inside the central ~1000×1000 units and figures/ball are drawn big.
 *
 * Look: more detailed than the path stories. The pitch, stands, roof floodlights, goal and net are real 3D geometry (metres) projected
 * through a moving broadcast / low three-quarter camera — never top-down. Footballers are jointed riso figures (head, neck, torso,
 * shorts, thighs, knees, shins, socks, boots, upper arms, forearms, hands) posed by limb angles and billboarded at their projected
 * ground point, so they keep real proportions and move with believable mechanics. Real Madrid = paper white with navy line; Leverkusen
 * = red shirts, black (navy) shorts; Zidane = tall, balding crown, number 5 on the back; Roberto Carlos = short, heavy thighs, shaved head.
 *
 * Inks: yellow (floodlights, highlights), red (Leverkusen), blue (dusk sky, grass with yellow, shade), navy (key line). Grass prints
 * yellow × blue = green; skin = red .2 + yellow .45 screens; the lesson chapter is a duotone beat (navy + yellow on paper).
 *
 * Structure (the user's standard: a 1:1 recreation of the real broadcast, only the rendering is riso). The play is ONE simulation on
 * a real clock τ (worldBodies/ballT): ch1 = the live, high, side-on broadcast camera in REAL TIME (Solari's ball down the left,
 * Carlos's first-time cross, the volley, the net); ch2–3 = the TV slow-motion REPLAY of the same simulation from a low, close angle
 * behind Zidane (×~6.5 while the ball drops, ×3 through the strike and into the net), then back up to the crowd. No teaching overlays
 * inside the footage; the three coaching points live only in ch4, a lit duotone lesson replay. Seams: forward passages into the net
 * mouth, the ball, and a roof floodlight. Ball physics: the cross is ballistic (g = 9.81, 2.85 s, ≈10 m apex); gait cadence follows
 * distance run; idle players turn to face the ball.
 *
 * Sources (read Sept 2026):
 *  - FIFA, "15 May 2002: Zizou's stroke of genius" https://www.fifa.com/en/articles/twenty-years-ago-today-zizous-stroke-of-genius
 *  - Wikipedia, "2002 UEFA Champions League final" https://en.wikipedia.org/wiki/2002_UEFA_Champions_League_final
 *  - Scottish FA 150, "Real Madrid 2 Bayer Leverkusen 1, 2002" https://150.scottishfa.co.uk/classic-moments/matches-at-hampden-park/real-madrid-2-bayer-leverkusen-1-2002/
 *  - UEFA.com, "Zidane's 2002 Champions League final volley from every angle" (video page) and "Zidane looks back on once-in-a-lifetime volley"
 *  - Champions Journal, "Classic final goals: Zinédine Zidane's volley in 2002" https://www.champions-journal.com/interview/zidane-a-goal-for-the-ages
 * Confirmed by those accounts: 15 May 2002, Hampden Park, Glasgow; 1–1 (Raúl 8', Lúcio 13') until Zidane's goal in the 45th minute
 * ("on the stroke of half-time"), final score 2–1; Roberto Carlos, chasing a ball from Santiago Solari down the left wing, stretched and
 * hooked a high, looping first-time cross; Zidane stood sideways-on to Hans-Jörg Butt's goal just inside / at the edge of the penalty
 * area, waited as it dropped, swivelled and struck a left-footed volley into the top left corner; referee Urs Meier; attendance 50,499.
 * Inferred / illustrative (not confirmed): exact positions and runs of every player (our reconstruction), the number and placement of
 * other players shown, Carlos's crossing foot (left, his strong foot), flight time/apex, Leverkusen's kit that night (drawn red shirts,
 * black shorts, red socks), Butt's kit (drawn yellow), the referee's kit (drawn black), Butt's dive, dusk sky and floodlight layout.
 *
 * Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timing from '../../../public/plays/narration/zidane-volley-2002/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,anticipate,settle,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {footballPanels,sparkBurst,speedLines} from '../../paths/riso/shapes';
import * as A from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre (W/2,H/2) at `zoom` units per world unit, ignoring safe/fit.
 * The engine's arrival scale (passage) still multiplies in, so seams stay pixel-exact. */
function frame(s:Sheet,zoom=1,rot=0,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,rot);}

// ---------------- 3D: a pinhole broadcast camera over a real-size pitch (metres; x → the goal line at 0, z → far touchline, y up) ----------------
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
/** units per metre at a point */
const kAt=(c:Cam,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
/** polygon clipped against the near plane, then projected */
function clipPoly(c:Cam,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
/** add a polygon with a normalised winding so overlapping parts in one path never cancel */
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
/** a painted line on the grass (width w metres) as a projected quad */
function groundLine(path:Path2D,c:Cam,a:[number,number],b:[number,number],w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
type CK=[number,number,number,number,number,number,number,number];// t, pos xyz, look xyz, focal (units)
const camKeysOf=(t:number,K0:CK[],e=easeIO)=>{const v=key(t,K0 as unknown as Key[],e,true);return makeCam([v[0],v[1],v[2]],[v[3],v[4],v[5]],v[6]);};

// ---------------- the stadium: dusk sky, a four-sided bowl of crowd, roof with floodlights, grass, lines, boards, the goal and its net ----------------
const IN=[[-111,39],[6,39],[6,-39],[-111,-39]] as const, OUT=[[-148,76],[43,76],[43,-76],[-148,-76]] as const;
/** the four stands as [lowerA, lowerB, upperB, upperA] */
const STANDS:V3[][]=[0,1,2,3].map(i=>{const j=(i+1)%4;return[[IN[i][0],1.1,IN[i][1]],[IN[j][0],1.1,IN[j][1]],[OUT[j][0],27,OUT[j][1]],[OUT[i][0],27,OUT[i][1]]];});
const bil=(q:V3[],u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** seeded crowd: [stand, u, v, colour 0 paper / 1 red / 2 yellow, phase] — Madrid white, Leverkusen red, a few yellow scarves */
const CROWD=(()=>{const r=rng(501),out:[number,number,number,number,number][]=[];for(let st=0;st<4;st++){const n=st===2?90:230;for(let i=0;i<n;i++){const c=r();out.push([st,r(),.04+r()*.92,c<.52?0:c<.86?1:2,r()*TAU]);}}return out;})();
/** floodlights along the roof front edge */
const LAMPS:V3[]=(()=>{const out:V3[]=[];for(let x=-100;x<=0;x+=10)out.push([x,31,68]);for(let z=-60;z<=60;z+=12)out.push([36,31,z]);for(let x=-100;x<=0;x+=10)out.push([x,31,-68]);for(let z=-60;z<=60;z+=12)out.push([-141,31,z]);return out;})();
type Stadium={lamps?:number;cheer?:number;flash?:number;t:number;glare?:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Cam,o:Stadium){
 const{lamps=1,cheer=0,flash=0,t,glare=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // sky: dusk blue with a deeper top band (stepped, not flat)
 s.field(B,.45,.6);
 const hz=P(c,[c.p[0]+c.f[0]*1e4,c.p[1],c.p[2]+c.f[2]*1e4])[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-900],[-Bnd,hz-760]],true),.2);
 // stands: knocked out, printed navy, terraces as stepped bands, then the crowd speckle
 const stands=new Path2D(),terr=new Path2D(),roof=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<9;k+=2)addPoly(terr,clipPoly(c,[bil(q,0,k/9),bil(q,1,k/9),bil(q,1,(k+1)/9),bil(q,0,(k+1)/9)]));
  const ua=q[3],ub=q[2];addPoly(roof,clipPoly(c,[ua,ub,[ub[0],32,ub[2]],[ua[0],32,ua[2]]]));
  const fa=mix3(q[3],q[0],.2),fb=mix3(q[2],q[1],.2);addPoly(roof,clipPoly(c,[[ua[0],32,ua[2]],[ub[0],32,ub[2]],[fb[0],31.2,fb[2]],[fa[0],31.2,fa[2]]]));});
 s.knockout(stands);s.tone(K,stands,.6);s.tone(K,terr,.32);
 const heads=[new Path2D(),new Path2D(),new Path2D()];let seen=[0,0,0];
 for(const [st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.3+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,7,22),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.55,sz,sz*1.1);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.9);if(seen[2])s.fill(Y,heads[2],.9);
 // camera flashes in the crowd (paper sparks on twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1.2*kAt(c,p),9,26);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,roof,.95);
 // floodlights: dotted-paper halo + yellow, then the lamp panels
 if(lamps>0){const halo=new Path2D(),core=new Path2D();LAMPS.forEach((l,i)=>{if(i/LAMPS.length>lamps||depthOf(c,l)<4)return;const k=kAt(c,l),[x,y]=P(c,l);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)return;const hr=clamp((4.8+glare*4)*k,14,420);addPoly(halo,[[x-hr,y],[x-hr*.7,y-hr*.7],[x,y-hr],[x+hr*.7,y-hr*.7],[x+hr,y],[x+hr*.7,y+hr*.7],[x,y+hr],[x-hr*.7,y+hr*.7]]);const w=clamp(1.3*k,6,160),h=clamp(.8*k,4,100);addPoly(core,[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h]]);});
  s.knockout(halo,.45);s.tone(Y,halo,.32);s.knockout(core);s.fill(Y,core,.6);}
 // grass: yellow × blue = green, mow stripes across the pitch, paper lines
 const ground=clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]);const gp=new Path2D();addPoly(gp,ground);s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),L=(a:[number,number],b:[number,number],w=.13)=>groundLine(lines,c,a,b,w*1.4);
 L([-105,-34],[0,-34]);L([-105,34],[0,34]);L([0,-34],[0,34]);L([-52.5,-34],[-52.5,34]);
 L([0,-20.16],[-16.5,-20.16]);L([-16.5,-20.16],[-16.5,20.16]);L([-16.5,20.16],[0,20.16]);
 L([0,-9.16],[-5.5,-9.16]);L([-5.5,-9.16],[-5.5,9.16]);L([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)L(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // advertising boards at the pitch edge
 const boards=new Path2D();for(const[a,b] of [[[-108,37],[4,37]],[[4,37],[4,-37]],[[4,-37],[-108,-37]]] as [[number,number],[number,number]][])addPoly(boards,clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],1,b[1]],[a[0],1,a[1]]]));s.fill(K,boards,.88);
 goal(s,c,o.net);
}
/** the goal at x=0: halftone net volume + mesh (displaced by `net` for the ripple), paper posts and bar with a navy edge */
function goal(s:Sheet,c:Cam,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([lerp(1,2,v),lerp(2.3,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,1,v),lerp(H,2.3,v),lerp(-W,W,u)]);
 const side=(z:number,v:number,w:number):V3=>{const x=lerp(0,lerp(1,2,v),w),y=lerp(lerp(H,0,v),lerp(2.3,0,v),w);return D([x,y,z]);};
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(j)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}
  for(let j=0;j<=nv;j++){for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1)continue;const q=P(c,a);if(i)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);}}};
 grid(back,14,6);grid(top,14,3);grid((u,v)=>side(-W,v,u),4,6);grid((u,v)=>side(W,v,u),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2.2,.03*kAt(c,[0,1,0])),.75);
 const frame=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=.12*kAt(c,mix3(a,b,.5));const q:Pt[]=[pa,pb];frame.addPath(ribbon(q,Math.max(2,w),{taper:0,pressure:0,wobble:.6}));edge.addPath(ribbon(q,Math.max(2,w)+Math.max(2,w*.35),{taper:0,pressure:0,wobble:.6}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(frame);
}

// ---------------- figures: the shared athlete library (lib/plays/riso/athlete.ts) through this film's projector ----------------
// This film's world is LEFT-handed for the library (x → goal, y up, z → far touchline, which is a player's LEFT when he faces the goal);
// the library is right-handed (a figure facing +x has its right side on +z). The adapter negates z both ways, so Zidane's left leg is
// his left leg on screen from every camera. Library yaw = this world's heading atan2(dz, dx) (derived: facing (cos θ, sin θ) here is
// (cos θ, −sin θ) there, which is library yaw θ).
const toLib=(p:V3):A.V3=>[p[0],p[1],-p[2]];
function projector(c:Cam):A.Projector{return{eye:toLib(c.p),project:q=>{const m:V3=[q[0],q[1],-q[2]],[x,y]=P(c,m);return[x,y,depthOf(c,m)];},scale:q=>kAt(c,[q[0],q[1],-q[2]])};}
const SKIN:A.InkFill[]=[[Y,.88],[R,.2]];// one flat screen + one light screen
const LINE={line:K,boots:K,hair:K,skin:SKIN,shade:[B,.32] as A.InkFill};
const ZIDANE:A.AthleteStyle={...LINE,shirt:'paper',shorts:'paper',socks:'paper',number:5,numberInk:K,hairStyle:'balding',build:{height:1.85},seed:5};
const CARLOS:A.AthleteStyle={...LINE,shirt:'paper',shorts:'paper',socks:'paper',number:3,numberInk:K,hairStyle:'bald',build:{height:1.68,bulk:1.12,thighs:1.25},seed:3};
const MADRID:A.AthleteStyle={...LINE,shirt:'paper',shorts:'paper',socks:'paper',hairStyle:'short',seed:7};
const LEVER:A.AthleteStyle={...LINE,shirt:R,shorts:K,socks:R,hairStyle:'short',build:{height:1.84},seed:11};
const KEEPER:A.AthleteStyle={...LINE,shirt:Y,shorts:K,socks:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.9},seed:13};
const REF:A.AthleteStyle={...LINE,shirt:K,shorts:K,socks:K,hairStyle:'short',seed:17};
/** a figure on the pitch: ground (x,z) in this world, heading yaw (radians), the pose now and one drawn frame earlier (secondary motion) */
type Body={x:number;z:number;yaw:number;pose:A.Pose;prev:A.Pose;style:A.AthleteStyle;smear?:boolean};
function drawWorld(s:Sheet,c:Cam,bodies:Body[],extra:{depth:number;draw:()=>void}[]=[],detail:'auto'|A.Detail='auto'){
 const pj=projector(c),items:{depth:number;draw:()=>void}[]=[...extra];
 for(const bd of bodies){const g:V3=[bd.x,0,bd.z],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.4*kk)continue;
  const place:A.Place={x:bd.x,z:-bd.z,yaw:bd.yaw},style={...bd.style,detail};
  items.push({depth:d,draw:()=>{if(bd.smear)A.motionSmear(s,bd.prev,bd.pose,pj,style,place);A.drawAthlete(s,bd.pose,pj,style,place,{prev:bd.prev});}});}
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
}
/** the ball: paper with navy panels and a blue shade crescent; squash along a direction; min readable radius */
function ballAt(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 footballPanels(s,0,0,r,{rot:spin,key:K,shadow:duo?Y:B,seed:7});s.restore();}
function ballShadow(s:Sheet,c:Cam,x:number,z:number,h:number){const pts:Pt[]=[],rad=.2+h*.025;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[x+Math.cos(a)*rad,.02,z+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.6-h*.03,.2,.6));}
const BALL_R=.13;// drawn a little over the real .11 m so it reads on a phone
function drawBall3(s:Sheet,c:Cam,p:V3,spin:number,o:{min?:number;sq?:number;dir?:number}={}){const[x,y]=P(c,p),r=Math.max(o.min??14,BALL_R*kAt(c,p));ballAt(s,x,y,r,spin,o);return{x,y,r};}

// ---------------- the narration (script.json mirrors it) and its timing: every scene time below comes from these cues ----------------
/** Authored cue `at`/`seconds` are placeholders: withTiming() swaps in the measured Kokoro word onsets, clip and length from timing.json
 * (cue `words` strings are the match keys — keep them); the scenes re-time themselves from these. */
const CHAPTERS:Chapter[]=withTiming([
 {label:'The cross is coming',narration:'Glasgow, 2002. The Champions League final. Real Madrid and Bayer Leverkusen are level, one each. Roberto Carlos swings a high, looping cross in from the left.',seconds:10.7,
  cues:[{at:0,words:'Glasgow'},{at:.77,words:'The Champions League final'},{at:2.31,words:'Real Madrid'},{at:3.46,words:'Bayer Leverkusen'},{at:4.62,words:'level, one each'},{at:5.77,words:'Roberto Carlos'},{at:6.54,words:'swings'},{at:7.69,words:'looping'},{at:8.08,words:'cross'},{at:8.85,words:'from the left'}]},
 {label:'The ball drops',narration:'Zinedine Zidane waits at the edge of the box. His eyes never leave the ball. Arms out, balanced, he lets it drop.',seconds:9.16,
  cues:[{at:0,words:'Zinedine Zidane'},{at:.77,words:'waits'},{at:1.92,words:'edge of the box'},{at:3.46,words:'His eyes'},{at:4.23,words:'never leave the ball'},{at:5.77,words:'Arms out'},{at:6.54,words:'balanced'},{at:6.92,words:'he lets it'},{at:8.08,words:'drop'}]},
 {label:'The volley',narration:'Then, with his left foot, he volleys it. Straight into the top corner! Real Madrid lead, two goals to one.',seconds:8.39,
  cues:[{at:0,words:'Then'},{at:1.15,words:'left foot'},{at:2.31,words:'volleys'},{at:2.69,words:'it'},{at:3.08,words:'Straight'},{at:4.23,words:'top corner'},{at:5.0,words:'Real Madrid lead'},{at:6.15,words:'two goals'},{at:6.92,words:'to one'}]},
 {label:'What it teaches',narration:'Want to hit a volley like Zidane? Watch the dropping ball, stay balanced, and strike through the middle of it.',seconds:8.39,
  cues:[{at:0,words:'Want to hit a volley'},{at:1.92,words:'like Zidane'},{at:2.69,words:'Watch the dropping ball'},{at:4.23,words:'stay balanced'},{at:5.38,words:'strike'},{at:5.77,words:'through'},{at:6.15,words:'the middle'},{at:6.92,words:'of it'}]},
],timing as NarrationTiming);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`zidane film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;

const BALL_MIN=40;
// ---------------- the play as ONE simulation on a real clock τ (seconds; τ = 0 is Carlos's cross, τ = TF the volley) ----------------
// Every chapter samples the same world: ch1 = the live broadcast camera in real time, ch2–3 = the TV replay (same world, slowed clock,
// low close angle). Positions are our reconstruction from the written accounts (see the header); exact metres are illustrative.
const G=9.81,TF=2.85,SHOT=.45;// cross flight (real ballistics: ~10 m apex) and shot flight
type MKey=[number,number,number];// τ, x, z
type Mover={style:A.AthleteStyle;path:MKey[];keeper?:boolean};
function moverPos(m:{path:MKey[]},tau:number):{x:number;z:number;vx:number;vz:number;dist:number}{
 const p=m.path;let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
const angLerp=(a:number,b:number,u:number)=>{let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*u;};
/** true gait: phase from distance covered (≈ 2.3 m a stride cycle), speed from the path; idle players turn to watch the ball */
function moverState(m:{path:MKey[]},tau:number,ball:V3,idle:()=>A.Pose):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos(m,tau),v=Math.hypot(q.vx,q.vz),w=clamp((v-.3)/1.2),run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 const yaw=angLerp(Math.atan2(ball[2]-q.z,ball[0]-q.x),Math.atan2(q.vz,q.vx),w);return{x:q.x,z:q.z,yaw,pose:A.blendPose(idle(),run,w)};}
const SOLARI:Mover={style:MADRID,path:[[-7.5,-50,19],[-3.4,-44.5,21.6],[-2.35,-43.6,22.2],[-1.6,-42.2,23],[4,-35,24]]};
const CARLOS_M:Mover={style:CARLOS,path:[[-7.5,-47,31],[-3,-35.5,31.6],[0,-22.4,31.05],[.7,-19.8,30.5],[4,-17.6,29.4]]};
const OTHERS:Mover[]=[
 {style:MADRID,path:[[-7.5,-15,-3],[0,-9.2,1.6],[4,-8.2,2.2]]},// two white shirts attacking the box
 {style:MADRID,path:[[-7.5,-22,-11],[0,-13.5,-6],[4,-12,-5]]},
 {style:LEVER,path:[[-7.5,-15,12],[0,-10.6,8.8],[4,-10.8,8]]},// Leverkusen back line dropping into the box
 {style:LEVER,path:[[-7.5,-14,3],[0,-9.8,3.2],[4,-9.6,4]]},
 {style:LEVER,path:[[-7.5,-13,-6],[0,-8.4,-2.6],[4,-8.6,-1.6]]},
 {style:LEVER,path:[[-7.5,-22,25],[0,-16.8,19.5],[4,-15.2,15.5]]},// full-back turning back toward the cross
 {style:LEVER,path:[[-7.5,-31,13],[0,-25,14],[4,-23,14.5]]},// midfield screen
 {style:LEVER,path:[[-7.5,-29,-8],[0,-23,-5],[4,-21,-4]]},
 {style:REF,path:[[-7.5,-46,4],[0,-36.5,7.5],[4,-31,8.5]]},// referee (Urs Meier) following play
];
const ZG:[number,number]=[-15.8,8.2];// Zidane's spot: just inside the left side of the box, level with the edge of the D
const ZID_PATH:MKey[]=[[-7.5,-20,4.5],[-3.5,-17.4,7],[-1.2,-15.9,8.1],[0,-15.8,8.2]];
const KEEP_G:[number,number]=[-1.2,1.3];
const ZBUILD:A.Build={height:1.85};
/** Zidane's heading on the volley: toward the top left corner (his body swivels through it) */
const ZYAW=Math.atan2(3.28-ZG[1],.1-ZG[0]);
const VOLLEY_DUR=1.1;// real seconds for the whole volley move; contact at its middle (library contact t = .5)
const zVolley=(tau:number)=>A.volley(clamp(.5+(tau-TF)/VOLLEY_DUR),{foot:'l',height:.6});
/** the ball on the LEFT boot at contact: solved from the library skeleton, converted back to this world */
const CONTACT:V3=(()=>{const sk=A.solve(zVolley(TF),ZBUILD,{x:ZG[0],z:-ZG[1],yaw:ZYAW}),m=mix3(sk.lAn,sk.lToe,.6);return[m[0],m[1]+.09,-m[2]];})();
const LAUNCH:V3=[-21.7,.11,30.8],CORNER:V3=[.1,2.18,3.28];// CORNER = top left from Zidane (far post, Butt's right)
const VY=(CONTACT[1]-LAUNCH[1]+.5*G*TF*TF)/TF;
/** the cross: straight in x/z, gravity in y — real ball physics */
const crossT=(tau:number):V3=>{const u=clamp(tau/TF);return[lerp(LAUNCH[0],CONTACT[0],u),LAUNCH[1]+VY*tau-.5*G*tau*tau,lerp(LAUNCH[2],CONTACT[2],u)];};
/** the ball on τ: Solari's feet → his pass rolls down the left → Carlos's first-time cross → the volley → the net */
function ballT(tau:number):V3{
 if(tau<-2.35){const q=moverPos(SOLARI,tau),v=Math.hypot(q.vx,q.vz)||1;return[q.x+q.vx/v*.55,.11,q.z+q.vz/v*.55];}
 if(tau<0){const a=ballT(-2.36),s=(tau+2.35)/2.35,u=1-Math.pow(1-s,1.6);return[lerp(a[0],LAUNCH[0],u),.11,lerp(a[2],LAUNCH[2],u)];}
 if(tau<TF)return crossT(tau);
 const s=tau-TF;if(s<SHOT){const u=s/SHOT,p=mix3(CONTACT,CORNER,u);p[1]+=.3*Math.sin(u*Math.PI);return p;}
 const u=clamp((s-SHOT)/.12);if(u<1)return mix3(CORNER,[.95,2.15,3.2],u);
 const d=clamp((s-SHOT-.12)/.6),h=2.15*(1-d*d)+.11*d*d,e=s-SHOT-.72,bounce=d>=1?.16*Math.abs(Math.sin(e*7))*Math.exp(-e*3):0;return[.95+.45*d,Math.max(.11,h)+bounce,3.2-.2*d];}
/** Zidane: arrives, then stands side-on just inside the left of the box with the ball dropping on his LEFT (library volley start: body
 * turned toward the ball, arms out, head on the ball), swivels on the planted RIGHT leg and volleys with the LEFT, follows through. */
function zidaneState(tau:number):{x:number;z:number;yaw:number;pose:A.Pose}{
 const q=moverPos({path:ZID_PATH},tau),v=Math.hypot(q.vx,q.vz),ball=ballT(tau);
 const run=A.runCycle(((q.dist/2.3)%1+1)%1,{speed:clamp(v/8)});
 let pose=A.blendPose(run,zVolley(tau),easeInOutSine(sm(-1.4,-.3,tau)));
 if(tau<TF-.1){// his eyes on the dropping ball: the head tips back with the ball's height
  const el=Math.atan2(ball[1]-1.7,Math.hypot(ball[0]-q.x,ball[2]-q.z)+1);pose={...pose,neckP:pose.neckP-clamp(el,0,.95)*.75*sm(-1,0,tau)};}
 if(tau>TF+.55)pose=A.blendPose(pose,A.stand(),easeInOutSine(sm(TF+.9,TF+1.9,tau)));
 const yaw=angLerp(Math.atan2(q.vz,q.vx),ZYAW,sm(-1.6,-.4,tau));return{x:q.x,z:q.z,yaw,pose};}
/** Carlos: sprints onto Solari's ball and hooks it first time with his LEFT foot (library strike, contact at STRIKE_CONTACT) */
function carlosState(tau:number,ball:V3){const st=moverState(CARLOS_M,tau,ball,A.stand),w=sm(-.8,-.5,tau)*(1-sm(.5,1,tau));
 const hit=A.strike(clamp(A.STRIKE_CONTACT+tau/1.05),{foot:'l',power:.8});return{...st,yaw:angLerp(st.yaw,-.62,w),pose:A.blendPose(st.pose,hit,w)};}
/** Butt: set on his toes, then a full-stretch dive to his RIGHT (the far post, the top left corner from Zidane) — too late */
function keeperState(tau:number){const t0=TF+SHOT-.66,pose=tau<t0?A.keeperSet(((tau*1.4)%1+1)%1):A.keeperDive(clamp((tau-t0)/1.2),{side:'r',height:1});return{x:KEEP_G[0],z:KEEP_G[1],yaw:Math.PI,pose};}
/** everyone at τ, with the pose one drawn frame (dtau of play) earlier for secondary motion */
function worldBodies(tau:number,tp:number,dtau:number):{bodies:Body[];ball:V3}{
 const at=(t:number)=>{const b=ballT(t),out:{x:number;z:number;yaw:number;pose:A.Pose;style:A.AthleteStyle;smear?:boolean}[]=[];
  out.push({...moverState(SOLARI,t,b,A.stand),style:MADRID},{...carlosState(t,b),style:CARLOS});
  for(const m of OTHERS)out.push({...moverState(m,t,b,A.stand),style:m.style});
  out.push({...zidaneState(t),style:ZIDANE,smear:t>TF-.25&&t<TF+.35},{...keeperState(t),style:KEEPER});return out;};
 const now=at(tp),before=at(tp-dtau);
 return{ball:ballT(tau),bodies:now.map((b,i)=>({...b,prev:before[i].pose}))};}

// ---------------- chapter 1 (live, real time): the wide, high, side-on broadcast camera follows the move; the goal goes in ----------------
const ch1T=()=>{const end=SEC(0),TL=Math.max(1,Math.min(T(0,'swings')+.2,end-.45-TF-SHOT));return{TL,end};};
const BCAM:V3=[-23,11,-33];
function ch1Look(tau:number):V3{const b=ballT(tau);
 if(tau<0){const c0=moverPos(CARLOS_M,tau);return[lerp(b[0],c0.x,.4)+2,1.4,lerp(b[2],c0.z,.4)];}
 const w=sm(TF-.1,TF+.5,tau,easeInOutSine),mid:V3=[lerp(b[0],CONTACT[0],.4),b[1]*.62+.9,lerp(b[2],CONTACT[2],.4)];return mix3(mid,[-1.2,1.5,1.5],w);}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-9,6200],[-2.4,6200],[0,5400],[TF-1,5600],[TF-.2,6600],[TF+.5,6000],[TF+1.2,5000],[TF+3,5000]]);return makeCam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){
  const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),w=worldBodies(t-TL,tt-TL,1/12),goalIn=t-TL-TF-SHOT;
  frame(s);
  const net=goalIn>0?netRipple(goalIn):undefined;
  stadium(s,c,{t,lamps:1,cheer:.25+.9*sm(0,.5,goalIn),flash:.3+1.2*sm(0,.4,goalIn),net});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,t-TL,tt,w.ball[1]>1.5?36:18)],'low');
 },
 aperture(t){const c=ch1Cam(t),q=[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]].map(p=>P(c,p as V3));const cx=q.reduce((a,p)=>a+p[0],0)/4,cy=q.reduce((a,p)=>a+p[1],0)/4,r=Math.max(20,Math.min(...q.map(p=>Math.hypot(p[0]-cx,p[1]-cy)))*.55);return apertureDisc(cx,cy,r,12);},
 still:7.6,
};
/** the net ripple: a travelling ring pushed out from where the ball hits (age = real seconds since the ball crossed the line) */
const netRipple=(age:number)=>(p:V3):V3=>{const d=Math.hypot(p[1]-2.2,p[2]-3.2)+Math.abs(p[0]-1)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.35)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.25,p[2]];};
/** the ball as a depth-sorted item: shadow on the grass, stretched along its travel when it is fast (a camera's motion blur) */
function ballItem(s:Sheet,c:Cam,b:V3,tau:number,tt:number,min:number){return{depth:depthOf(c,b),draw:()=>{const a=P(c,ballT(tau-.02)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy);ballShadow(s,c,b[0],b[2],b[1]);drawBall3(s,c,b,tt*8,{min,sq:clamp(sp/(Math.max(min,BALL_R*kAt(c,b))*6),0,.35),dir:Math.atan2(dy,dx)});}};}

// ---------------- chapter 2 (TV replay, slow motion, low and close): the ball hangs and drops; Zidane waits sideways-on, arms out ----------------
const ch2T=()=>({w:T(1,'waits'),e:T(1,'edge of the box'),h:T(1,'His eyes'),n:T(1,'never leave the ball'),a:T(1,'Arms out'),l:T(1,'he lets it'),end:SEC(1)});
const tau2=(t:number)=>TF*(.5+.47*clamp(t/SEC(1)));
function ch2Cam(t:number){const q=ch2T(),b=ballT(tau2(t)),head:V3=[ZG[0],1.7,ZG[1]],w=key(t,mono<[number,number]>([[0,.3],[q.w+.1,.72],[q.h,.64],[q.n+.4,.58],[q.a,.72],[q.end,.72]]) as unknown as Key[]),F=key(t,mono<[number,number]>([[0,1250],[q.w+.2,1400],[q.e,1450],[q.h,1300],[q.a,1450],[q.end,1650]]) as unknown as Key[]);
 // behind-left of him (south-west, looking north-east over his back): his left side and the dropping ball are screen-left
 return makeCam([-22.6,.9+.3*sm(0,q.end,t),2.2+.4*sm(0,q.end,t)],mix3(b,head,w),F);}
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono<T extends number[]>(K0:T[]):T[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)] as T;});}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),c=ch2Cam(t),tau=tau2(t),w=worldBodies(tau,tau2(tt),tau2(tt)-tau2(tt-1/12));
  frame(s);
  stadium(s,c,{t,lamps:1,cheer:.15,flash:.15});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
 },
 aperture(t){const c=ch2Cam(t),p=ballT(tau2(t)),[x,y]=P(c,p),r=Math.max(BALL_MIN,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:7.2,
};
/** a spirit level across two shoulder points (lesson chapter only): yellow bar, navy rim, a paper bubble offset by `bub` that settles */
function levelBar(s:Sheet,a:Pt,b:Pt,lift:number,half:number,th:number,bub:number){
 const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2-lift,ang=Math.atan2(b[1]-a[1],b[0]-a[0]),ca=Math.cos(ang),sa=Math.sin(ang);
 const bar=polyPath([[mx-ca*half-sa*th,my-sa*half+ca*th],[mx+ca*half-sa*th,my+sa*half+ca*th],[mx+ca*half+sa*th,my+sa*half-ca*th],[mx-ca*half+sa*th,my-sa*half-ca*th]],true);
 s.knockout(bar);s.fill(Y,bar,.95);s.stroke(K,bar,Math.max(4,th*.25));
 const o=.4*half*bub;s.knockout(polyPath(Array.from({length:14},(_,i)=>{const q=i/14*TAU;return[mx+ca*o+Math.cos(q)*th*1.2,my+sa*o+Math.sin(q)*th*.75] as Pt;}),true));
 s.stroke(K,polyPath([[mx-sa*th*1.5,my+ca*th*1.5],[mx+sa*th*1.5,my-ca*th*1.5]],false),Math.max(4,th*.2));}
/** a dashed yellow sight line from the eyes toward a target (lesson chapter only), drawn on by `g` */
function sight(s:Sheet,h:Pt,to:Pt,g:number,w:number){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.13)gaps.push([x,x+.055]);s.fill(Y,ribbon([h,[lerp(h[0],to[0],g),lerp(h[1],to[1],g)]],w,{taper:.2,pressure:.2,wobble:1,gaps}),.95);}

// ---------------- chapter 3 (replay continues, slow motion ×3): the swivel and left-foot volley, the whip-pan, Butt beaten, the net ----------------
const SLOW=3;
const ch3T=()=>{const v=T(2,'volleys'),HIT=Math.ceil((v+.25)*12)/12;// on the twos grid so the drawn strike pose meets the ball
 return{lf:T(2,'left foot'),v,HIT,NET:HIT+SLOW*SHOT,tc:T(2,'top corner'),rl:T(2,'Real Madrid lead'),end:SEC(2)};};
const tau3=(t:number)=>{const{HIT}=ch3T();return t<HIT?TF*(.97+.03*easeIn(clamp(t/HIT))):TF+(t-HIT)/SLOW;};
function ch3Cam(t:number){const q=ch3T();
 return camKeysOf(t,mono([[0,-15.3,.8,13.8,-15.1,1.5,8.3,1450],[q.lf,-15.3,.8,13.8,-15.1,1.4,8.3,1550],[q.HIT,-15.2,.7,13.4,-15.0,1.1,8.3,1800],[q.HIT+.9,-15.6,1.0,13.2,.2,1.9,3.2,1700],[q.tc-.2,-15.6,1.0,13.2,.2,1.9,3.2,1750],[q.tc+.35,-15.6,1.0,13.2,.1,2.0,3.3,2200],[q.rl,-15.6,1.0,13.2,.1,2.0,3.3,2200],[q.rl+1.3,-18,5,15,3,6.5,-2,1150],[q.end-1,-18,5,15,3,6.5,-2,1150],[q.end,-18,5,15,20,17,-6,1250]]));}
const ch3:Scene={
 draw(s,t){
  const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),w=worldBodies(tau,tau3(tt),tau3(tt)-tau3(tt-1/12));
  const shake=t>=q.HIT?10*settle(t,q.HIT,{freq:6,decay:6}):0;
  frame(s,1,0,shake,shake*.4);
  const goalIn=tau-TF-SHOT,roar=sm(q.rl,q.rl+.5,tt,easeOut);
  stadium(s,c,{t,lamps:1,cheer:.2+roar*1.1,flash:.2+roar*1.4,glare:roar*.5,net:goalIn>0?netRipple(goalIn):undefined});
  drawWorld(s,c,w.bodies,[ballItem(s,c,w.ball,tau,tt,BALL_MIN)]);
 },
 aperture(t){const c=ch3Cam(t),l:V3=[36,31,0],[x,y]=P(c,l),r=clamp(4.8*kAt(c,l),30,300);return apertureDisc(x,y,r*.6,12);},
 still:4.9,
};
// ---------------- chapter 4 (duotone replay): watch the dropping ball, stay balanced, strike through the middle ----------------
const G4:Pt=[60,450],H4=660,AZ4=-140;// Zidane's ground point and drawn height; seen from BEHIND-LEFT (azimuth −140): the 5 on his back, his LEFT leg on our side
const CAM4=A.figureCam({x:G4[0],y:G4[1],height:H4,azimuth:AZ4,elevation:4});
const ZDUO:A.AthleteStyle={...ZIDANE,skin:[[Y,.75]],shade:[K,.2],detail:'high'};
const ch4T=()=>{const m=T(3,'the middle');return{lz:T(3,'like Zidane'),w:T(3,'Watch the dropping ball'),b:T(3,'stay balanced'),s:T(3,'strike'),th:T(3,'through'),m,CT:m+.12,end:SEC(3)};};
/** the lesson pose at t: stand → head up to the ball (watch) → arms out (balance) → the LEFT-foot volley through the middle (contact at CT) */
function lessonPose(t:number):A.Pose{const q=ch4T(),v0=A.volley(0,{foot:'l',height:.6});
 const arms=clamp(anticipate(q.b-.13,q.b+.42,t,{back:.25,hold:.35}));let p=A.blendPose(A.stand(),v0,Math.max(arms,sm(q.w,q.w+.6,t)*.5));
 p={...p,neckP:p.neckP-.55*sm(q.w,q.w+.5,t)*(1-sm(q.s-.2,q.s+.2,t))};
 const start=q.CT-VOLLEY_DUR/2;if(t>=start-.25)p=A.blendPose(p,A.volley(clamp(.5+(t-q.CT)/VOLLEY_DUR),{foot:'l',height:.6}),sm(start-.25,start,t));
 return p;}
/** where the ball sits on his LEFT boot at contact, and its flight direction, on the sheet */
const LESSON_HIT=(()=>{const sk=A.solve(A.volley(.5,{foot:'l',height:.6}),ZBUILD),m=mix3(sk.lAn,sk.lToe,.6),c:A.V3=[m[0],m[1]+.09,m[2]],a=CAM4.project(c),b=CAM4.project([c[0]+2,c[1]+.35,c[2]]),L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return{p:[a[0],a[1]] as Pt,d:[(b[0]-a[0])/L,(b[1]-a[1])/L] as Pt};})();
const ch4:Scene={
 draw(s,t){
  const q=ch4T(),tt=twos(t),CT=q.CT,cpt=LESSON_HIT.p,dir=LESSON_HIT.d,ang=Math.atan2(dir[1],dir[0]);
  const v=key(t,mono<number[]>([[0,40,-20,.96],[q.lz,60,-110,1.05],[q.w-.1,60,-110,1.05],[q.w+.6,-20,-210,.98],[q.b,40,-40,.95],[q.s,20,-30,.95],[CT,cpt[0]*.6,cpt[1]*.6,1.12],[q.end,cpt[0]*.6+dir[0]*40,cpt[1]*.6,1.16]]) as unknown as Key[],easeIO,true);
  frame(s,v[2],0,v[0],v[1]);
  // the replay stage: navy field, a yellow floodlight pool in three screens, a light cone, the box edge in paper
  s.field(K,.75,.5);
  const pool=(r:number)=>polyPath(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[G4[0]+Math.cos(a)*r*1.5,G4[1]+Math.sin(a)*r*.3] as Pt;}),true);
  s.knockout(pool(560),.6);s.tone(Y,pool(560),.2);s.tone(Y,pool(380),.32);s.tone(Y,pool(220),.45);
  s.tone(Y,polyPath([[-150,-1600],[150,-1600],[860,G4[1]],[-860,G4[1]]],true),.1);
  s.knockout(ribbon([[-520,G4[1]+180],[-260,G4[1]-40],[-150,G4[1]-150]],12,{taper:.6,wobble:1.2}),.9);
  const pose=lessonPose(tt),prev=lessonPose(tt-1/12),hot=.9*sm(q.lz,q.lz+.2,tt)*(1-sm(q.w-.3,q.w,tt));
  if(hot>.02)s.tone(Y,polyPath(Array.from({length:30},(_,i)=>{const a=i/30*TAU;return[G4[0]+Math.cos(a)*260,G4[1]-360+Math.sin(a)*420] as Pt;}),true),.45*hot);
  if(tt>CT-.3&&tt<CT+.4)A.motionSmear(s,prev,pose,CAM4,ZDUO);
  const r=A.drawAthlete(s,pose,CAM4,ZDUO,{},{prev});
  // the ball: hangs high, drops along a dotted arc (watch), meets the LEFT boot on "middle", then flies off
  const start:Pt=[cpt[0]+dir[0]*-120-60,-560],u=sm(q.w,CT,tt,x=>x*x*(1.2-.2*x));
  const at=(k:number):Pt=>[lerp(start[0],cpt[0],k),lerp(start[1],cpt[1],k)-300*Math.sin(Math.min(1,k*1.1)*Math.PI*.5)*(1-k)];
  let bxy=tt<q.w?at(0):at(u),sq=0;
  if(tt>=CT){const f=sm(CT,CT+.45,tt,easeIn);bxy=[cpt[0]+dir[0]*1400*f,cpt[1]+dir[1]*1400*f];sq=.5*(1-sm(CT,CT+.1,tt));}
  if(tt>=q.w&&tt<CT+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const p=at(i/18*Math.min(1,u+.02));dots.moveTo(p[0]+11,p[1]);dots.arc(p[0],p[1],11,0,TAU);}s.fill(Y,dots,.95);}
  const watch=sm(q.w,q.w+.35,tt,easeOut)*(1-sm(CT+.2,CT+.5,tt));
  if(watch>.02)sight(s,r.joints.face,bxy,watch,22);
  const bal=sm(q.b,q.b+.37,tt,easeOutBack)*(1-sm(q.s-.1,q.s+.3,tt));
  if(bal>.02){const a=r.joints.lSh,b=r.joints.rSh,mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;levelBar(s,[mx-10,my],[mx+10,my],60,250*bal,22,settle(tt,q.b+.1,{freq:1.4,decay:2,phase:Math.PI/2}));
   const f=r.joints.rAn;s.stroke(Y,polyPath(Array.from({length:22},(_,i)=>{const a2=i/22*TAU;return[f[0]+Math.cos(a2)*120*bal,f[1]+18+Math.sin(a2)*30*bal] as Pt;}),true),12,.95);}
  const target=sm(q.th-.1,q.th+.25,tt,easeOutBack)*(1-sm(CT+.05,CT+.2,tt)),br=62;
  ballAt(s,bxy[0],bxy[1],br,tt*(tt>=CT?12:1.5),{sq,dir:ang,duo:true});
  if(target>.02){s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[bxy[0]+Math.cos(a)*br*1.4*target,bxy[1]+Math.sin(a)*br*1.4*target] as Pt;}),true),11,.95);
   const dot=polyPath(Array.from({length:12},(_,i)=>{const a=i/12*TAU;return[bxy[0]+Math.cos(a)*18*target,bxy[1]+Math.sin(a)*18*target] as Pt;}),true);s.knockout(dot);s.fill(Y,dot);}
  const thru=sm(q.m-.3,CT,tt,easeOut)*(1-sm(CT+.9,CT+1.3,tt));
  if(thru>.02){const a:Pt=[cpt[0]-dir[0]*360,cpt[1]-dir[1]*360],b:Pt=[cpt[0]+dir[0]*480,cpt[1]+dir[1]*480],e:Pt=[lerp(a[0],b[0],thru),lerp(a[1],b[1],thru)];s.fill(Y,ribbon([a,e],26,{taper:.3,pressure:.3,wobble:1}),.95);
   const ca=dir[0],sa=dir[1];s.fill(Y,polyPath([[e[0]+ca*60,e[1]+sa*60],[e[0]-sa*48,e[1]+ca*48],[e[0]+sa*48,e[1]-ca*48]],true),.95);}
  if(tt>=CT&&tt<CT+.35)sparkBurst(s,Y,cpt[0],cpt[1],140+140*sm(CT,CT+.12,tt,easeOut),{n:10,seed:41,g:1-sm(CT+.15,CT+.35,tt),width:16});
  if(tt>=CT&&tt<CT+.6)speedLines(s,K,bxy[0],bxy[1],ang,{n:5,seed:42,len:240,width:10,cov:.85});
 },
 still:5.0,
};

const story:RisoStory={
 id:'zidane-volley-2002',format:'11v11',title:"Zidane's final volley",
 theme:'Watch the dropping ball, stay balanced, strike through the middle.',
 ageNote:'Champions League final, Real Madrid 2–1 Bayer Leverkusen, Hampden Park, Glasgow, 15 May 2002.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball pops up from the point with a yellow burst and a ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*160,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*120*g,y+Math.sin(q)*36*g] as Pt;}),true),12,.95);
  if(age>0&&age<.5)sparkBurst(s,Y,x+Math.cos(a)*20,y-up,150*g,{n:9,seed,g:1-clamp((age-.25)/.25),width:14});
  ballAt(s,x,y-up,60,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
