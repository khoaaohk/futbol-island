/** Iconic-play film (signature): "the thunderbolt from distance" — Bobby Charlton's goal v Mexico, 1966 World Cup, Group One,
 * England 2–0 Mexico, Wembley Stadium, London, Saturday 16 July 1966, 38th minute (37' in FIFA's report), 0–0 → 1–0.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Charlton a signature, not a match ("Signature: the thunderbolt from distance",
 * long_range_goal, centre, long, right foot; lesson "Practise shooting with both feet so you can shoot whichever way the ball comes").
 * The sources call him renowned for "ferocious long-range shooting from both left and right foot"; this is his best-documented long-range
 * goal: England's FIRST goal of the 1966 World Cup, a solo run from his own half down the centre and a right-foot "blockbuster" from about
 * 25 yards into the top corner — the signature exactly (centre, long, right foot), described move by move in four written accounts.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/charlton-signature/script.json. The voice is generated later by the lead (local Kokoro). Until
 * then every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter
 * seconds, so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/charlton-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/charlton-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage):
 *  - England Football Online, "England Match No. 405 - Mexico - 16 July 1966" (match reports by Mike Payne, England: The Complete Post-War
 *    Record, 1993; Norman Giller; Glen Isherwood; and the F.A. Yearbook 1967-68 p. 40; colours; line-ups)
 *    http://www.englandfootballonline.com/Seas1960-70/1965-66/M0405Mex1966.html
 *  - Wikipedia, "1966 FIFA World Cup Group 1" (raw wikitext; match box cites FIFA's match report; kit boxes; line-ups)
 *    https://en.wikipedia.org/wiki/1966_FIFA_World_Cup_Group_1
 *  - Wikipedia, "Bobby Charlton" (long-range shooting "from both left and right foot"; Ramsey: "a blistering shot using either foot";
 *    height 5 ft 8 in; scored the first goal in the 2–0 win over Mexico)  https://en.wikipedia.org/wiki/Bobby_Charlton
 * CONFIRMED by those accounts: Saturday 16 July 1966, kick-off 19:30 BST, Wembley, 92,570, referee Concetto Lo Bello (Italy); live on
 *  BBC1 and ITV; "much colder … under grey skies on a Saturday evening"; Mexico sat back with "an eight- or nine-man defence"; 0–0 until
 *  the 38th minute ("just before half-time"): PETERS INTERCEPTED A MEXICAN PASS and moved it on to ROGER HUNT; "a quick switch inside gave
 *  Bobby possession JUST INSIDE HIS OWN HALF"; "with his thinning hair streaming in the wind, he dribbled free DOWN THE CENTRE AT PACE. A JINK
 *  LEFT AND THEN RIGHT, before his RIGHT FOOT exploded a blockbuster into THE TOP CORNER with Calderón hopelessly beaten FROM 25 YARDS"
 *  (Payne); "swerved past two opponents and scored with a thunderbolt shot from outside the penalty-area" (F.A. Yearbook); "one of his
 *  magnificent twenty-five-yard specials" (Giller; Isherwood says 30 yards); Hunt made it 2–0 in the 75th minute. England's first goal of
 *  the tournament. KITS: England the 1965 Umbro home kit — WHITE crew-necked shirts, BLUE (navy) shorts, WHITE socks; Mexico DARK/PLUM-RED
 *  crew-necked shirts, BLUE shorts, dark socks (EFO: blue; Wikipedia kit box: black — drawn dark navy). Numbers: Charlton 9, Hunt 21,
 *  Peters 16, Greaves 8, Paine 19, Stiles 4, Moore 6 (captain), J. Charlton 5, Cohen 2, Wilson 3, Banks 1; Calderón 12, Chaires 2, Peña 3
 *  (captain), Núñez 14, Hernández 15, del Muro 4, Díaz 6, Reyes 19, Borja 20, Jáuregui 5, Padilla 8. Charlton 1.73 m, aged 28.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (the shot is drawn from ~23 m, 25 yards, just right of
 *  centre); which Mexican pass Peters cut out (drawn as del Muro's, meant for Borja) and where; which two opponents he swerved past (drawn as
 *  Díaz and Núñez, never named); the number of touches; WHICH top corner (drawn to Calderón's left; the narration never says which) and how
 *  high; Calderón's position and late dive; which end of Wembley and the direction of play on screen; long sleeves; the keepers' jerseys
 *  (Calderón grey, Banks yellow) and the referee's black; the tan leather ball; the celebration; the other players' runs; Wembley's shape as
 *  drawn (the greyhound track, roofed stands all round, the twin towers behind the far end), the grey evening sky and the crowd's colours.
 *  The lesson's left-foot strike (chapter 4, second half) is a MIRRORED demonstration, not match footage — the narration presents it as
 *  "your turn". The newsreel scratches and vignette are a style choice (1966 was seen on black-and-white TV and newsreel).
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 Charlton's first touch): ch1 = the high main-stand broadcast camera, near real time (the twin towers, the interception,
 * Hunt's switch inside, the run from his own half, the two jinks, the thunderbolt, the net); ch2 = the TV slow-motion replay, low beside
 * him on his kicking side (left, then right, the gap, the right foot, 25 yards to goal); ch3 = the reverse angle from behind the net (the
 * keeper can't reach it, the celebration, either foot); ch4 = the lesson on a low side camera (the real right-foot strike, then a whip-pan
 * to the same strike mirrored with the left foot: both feet).
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (grass with blue, the ball, teaching marks), red
 * (Mexico, skin, arrows), blue (grass, Mexico's shorts, grey sky), navy (England's shorts, key line, stands, newsreel grain).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,mirrorPose,runCycle,dribble,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,solve,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`charlton film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/charlton-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Thunderbolt','Wembley, 1966, World Cup. England against Mexico. Bobby Charlton, in white, picks it up in his own half. Straight down the middle, jinks left, jinks right... boom! A thunderbolt into the top corner!',
  ['Wembley','World Cup','England against Mexico','Bobby Charlton','in white','picks it up','his own half','Straight down the middle','jinks left','jinks right','boom','A thunderbolt','top corner']),
 prov('Left, then right','Watch again, slowly. Left, then right, opening a gap. Then his right foot hits it from twenty-five yards!',
  ['Watch again','slowly','Left','then right','opening a gap','his right foot','twenty-five yards']),
 prov('Either foot','The keeper can\'t reach it! Charlton could strike like that with either foot.',
  ['The keeper','can\'t reach it','Charlton could strike','either foot']),
 prov('Your turn','Your turn: practise shooting with both feet, so you can shoot whichever way the ball comes!',
  ['Your turn','practise shooting','both feet','whichever way','the ball comes']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`charlton film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Charlton scores in is at x = 0, the pitch runs to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/F)/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpAng=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** the lesson's mirror (z → −z about the pitch's long axis): a left-footed copy of the same strike */
const MZ=(p:V3,m?:boolean):V3=>m?[p[0],p[1],-p[2]]:p;
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Wembley, July 1966, a grey Saturday evening: roofed stands all round, the dog track, the twin towers =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(63+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+10.5*b];
type Bowl={low:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],back:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.back.push([rim(a,22,11.6),rim(b,22,11.6),rim(b,22,21.5),rim(a,22,21.5)]);
  o.roof.push(Q(13,20.6,34,23.5));o.fascia.push(Q(13,19.4,13,20.7));
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.14)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number;towers?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // "much colder … under grey skies on a Saturday evening": a flat grey sky (navy screen), a touch of blue, darker overhead
 s.field(K,.16,.7);
 const hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-420],[-Bnd,hz-380]],true),.22);
 towers(s,c,o.towers??0);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.78);
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.34);
 // the crowd: one mark per seat group (white shirts and faces / red rosettes / blue / dark coats), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.44?0:q.h<.58?1:q.h<.76?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.8);s.fill(B,inks[2],.85);s.fill(K,inks[3],.8);}
 // the roof: dark underside, a pale fascia along its front edge
 s.knockout(roof);s.fill(K,roof,.88);
 s.knockout(fas);s.tone(K,fas,.3);
 // photographers' flashbulbs round the ground after the goal
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** Wembley's twin towers behind the far (west) end: white concrete shafts, domed tops and flagpoles; `glow` rings them in yellow */
function towers(s:Sheet,c:Camera,glow=0){
 const body=new Path2D(),dome=new Path2D(),win=new Path2D(),pole=new Path2D();let n=0;
 for(const z of[-11,11]){const base:V3=[-152,16,z];if(depthOf(c,base)<30)continue;const k=kAt(c,base),[x,y]=P(c,base);if(Math.abs(x)>s.W*1.2)continue;
  const top=P(c,[-152,31,z])[1],dt=P(c,[-152,39,z])[1],pt=P(c,[-152,45,z])[1],w=3.6*k;
  body.addPath(polyPath([[x-w,y],[x+w,y],[x+w*.9,top],[x-w*.9,top]],true));
  dome.addPath(polyPath([...Array.from({length:13},(_,i)=>{const a=Math.PI*i/12;return[x-Math.cos(a)*w*.86,top-(top-dt)*Math.sin(a)] as Pt;})],true));
  dome.rect(x-w*.95,top-.8*k,w*1.9,1.2*k);
  for(let j=0;j<3;j++){const yy=lerp(y,top,.3+j*.22);win.rect(x-w*.12,yy-1.6*k,w*.24,1.6*k);}
  pole.addPath(ribbon([[x,dt],[x,pt]],Math.max(1.5,.3*k),{taper:0,wobble:0}));n++;}
 if(!n)return;s.knockout(body);s.tone(B,body,.12);s.knockout(dome);s.tone(B,dome,.22);s.tone(K,dome,.15);s.fill(K,win,.7);s.fill(K,pole,.9);
 s.stroke(K,body,3,.6);
 if(glow>.02){const g=new Path2D();g.addPath(body);g.addPath(dome);s.stroke(Y,g,Math.max(6,kAt(c,[-152,25,0])*1.1),.95*glow);}
}
/** the pitch: cinder dog track (red × navy), grass (yellow × blue), mowing stripes, paper lines, both goals; `half` lights the halfway line */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;half?:number}={}){
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(tr);s.fill(R,tr,.5);s.tone(K,tr,.26);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(Y,gp,.8);s.tone(B,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 if(o.half&&o.half>.02){const h=new Path2D();groundLine(h,c,[-52.5,-34],[-52.5,34],.5);s.fill(Y,h,.95*o.half);}
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a 1960s goal on the line x = X, net 2 m deep toward dir: square posts, a box net on stanchions; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** 1966 newsreel / black-and-white TV: a soft dark vignette, a flicker of vertical scratches and dust (seeded per twelfth of a second) */
function reel(s:Sheet,t:number,w=1){
 if(w<=.02)return;const W=s.W,H=s.H,fr=Math.floor(t*12),r=rng(9300+fr);
 const v=new Path2D();v.rect(-W,-H,W*2,H*2);v.addPath(polyPath(Array.from({length:32},(_,i)=>{const a=i/32*TAU,c=Math.cos(a),sn=Math.sin(a);return[Math.sign(c)*Math.pow(Math.abs(c),.55)*W*.5,Math.sign(sn)*Math.pow(Math.abs(sn),.55)*H*.5] as Pt;}),true));
 s.tone(K,v,.3*w,undefined,'evenodd');
 const sc=new Path2D();for(let i=0;i<2;i++){if(r()<.35)continue;const x=(r()-.5)*W*.9,y0=-H*.6+r()*H*.3;sc.addPath(ribbon([[x,y0],[x+(r()-.5)*8,y0+H*(.5+r()*.6)]],1.6+r()*1.6,{seed:fr+i,taper:.2,wobble:1}));}
 s.stroke(K,sc,1.2,.55*w);
 const dust=new Path2D();for(let i=0;i<3;i++){const x=(r()-.5)*W,y=(r()-.5)*H,z=2+r()*4;dust.rect(x,y,z,z*(.6+r()));}s.knockout(dust,.8*w);
}

// ================= the tan leather ball of 1966 (yellow × red leather, navy panel seams) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,.85);s.tone(R,disc,.3);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (16 July 1966) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_TAN:AthleteStyle['skin']=[[R,.28],[Y,.55]];
/** England, the 1965 Umbro home kit: white crew-necked shirts, blue (navy) shorts, white socks (confirmed); long sleeves inferred */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:[K,.9],...o});
/** Mexico: dark plum-red crew-necked shirts, blue shorts, dark socks (confirmed); long sleeves inferred */
const MEX=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:B,socks:[K,.85],boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,shade:[K,.42],sleeves:'long',numberInk:'paper',...o});
/** Charlton: No. 9, 1.73 m, "his thinning hair streaming in the wind" */
const CHARLTON:AthleteStyle=ENG({number:9,hairStyle:'balding',hair:[K,.6],build:{height:1.73,bulk:1.02,thighs:1.08},seed:9});
const CALDERON:AthleteStyle={shirt:[K,.45],shorts:[K,.88],socks:[K,.6],boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:12,numberInk:'paper',build:{height:1.8},seed:12};
const BANKS:AthleteStyle={shirt:Y,shorts:K,socks:'paper',boots:K,skin:SKIN_LIGHT,hair:K,line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:[K,.9],seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Charlton's first touch) =================
type TK=[number,number,number];// τ, x, z
type Role='ch'|'eng'|'mex'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const MEXPASS=-5.6,INTER=-4.6,PPASS=-3.4,HUNT_IN=-2.6,SWITCH=-1.3,SHOT=4.5;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). England attack toward x = 0. */
const ACTORS:Actor[]=[
 {name:'Charlton',role:'ch',style:CHARLTON,key:true,keys:[[-8,-61,5],[-5,-59.4,4.2],[-3,-57.6,3.1],[-1.5,-56.2,2.1],[-.6,-55.3,1.6],[0,-54.6,1.4],[.5,-51.8,1.3],[1,-48.5,1.2],[1.5,-45,1.05],[2,-41.4,.6],[2.4,-38.6,-.3],[2.8,-35.8,-.8],[3.2,-33,-.4],[3.55,-30.6,.5],[3.9,-28.2,1.15],[4.2,-25.8,1.3],[SHOT,-23.6,1.25],[5,-21,1.25],[5.8,-18.4,1.8],[7,-16.2,3.2],[8.5,-15.4,4.4],[12,-15,5]]},
 {name:'Calderón',role:'gk',style:CALDERON,key:true,keys:[[-8,-4.4,-.8],[-2,-3.8,0],[1,-3.2,.4],[3,-2.8,.6],[SHOT,-2.6,.7],[12,-2.6,.7]]},
 {name:'Díaz',role:'mex',style:MEX({number:6,seed:66}),key:true,keys:[[-8,-35,6],[-3,-36,4.8],[0,-37,3.8],[1.5,-38.4,2.1],[2.2,-38.8,.9],[2.8,-38.4,.3],[3.6,-36,.1],[5,-31,.4],[8,-24,.8],[12,-21,1]]},
 {name:'Núñez',role:'mex',style:MEX({number:14,seed:74}),key:true,keys:[[-8,-26,-6],[-3,-27,-5],[0,-28,-4],[2.5,-30.4,-1.7],[3.35,-31,-.5],[3.9,-30,.1],[5,-26.5,.8],[8,-21,1.4],[12,-18,1.6]]},
 {name:'Peters',role:'eng',style:ENG({number:16,seed:16}),key:true,keys:[[-8,-67,-1],[-6,-64.6,-3.4],[-5,-61.9,-4.7],[INTER,-61,-5.1],[-4,-60.2,-5.2],[PPASS,-59.6,-5.3],[-2,-58.6,-4.4],[2,-51,-2.4],[8,-38,0],[12,-34,.5]]},
 {name:'Hunt',role:'eng',style:ENG({number:21,seed:21}),key:true,keys:[[-8,-58,-15],[-4.5,-56.8,-12.6],[HUNT_IN,-55.9,-10.9],[-2,-55.6,-10.6],[SWITCH,-55.3,-10.4],[0,-53,-9.6],[3,-42,-7.4],[SHOT,-33,-5.6],[8,-26,-4],[12,-22,-3]]},
 {name:'del Muro',role:'mex',style:MEX({number:4,seed:64}),key:true,keys:[[-8,-45.5,-15.5],[-6.4,-47.3,-13.8],[MEXPASS,-48.2,-13],[-4.4,-49.2,-12.1],[0,-47.4,-8.4],[3,-41,-6.2],[6,-33,-4],[12,-28,-3]]},
 {name:'Peña',role:'mex',style:MEX({number:3,seed:63}),keys:[[-8,-17,3],[0,-18,3],[3,-19.8,3.3],[SHOT,-20.6,3.1],[6,-19,3],[12,-15,3]]},
 {name:'Borja',role:'mex',style:MEX({number:20,seed:70}),keys:[[-8,-68,1],[-5.4,-65.4,-1.6],[-4,-63.4,-2.6],[0,-58.6,-.8],[4,-51,1.4],[12,-44,1.6]]},
 {name:'Chaires',role:'mex',style:MEX({number:2,seed:62}),keys:[[-8,-22,-18],[0,-20.5,-14],[SHOT,-17,-9],[12,-12,-7]]},
 {name:'Hernández',role:'mex',style:MEX({number:15,seed:75}),keys:[[-8,-23,17],[0,-21,14],[SHOT,-17.5,9.6],[12,-12,8]]},
 {name:'Jáuregui',role:'mex',style:MEX({number:5,seed:65}),keys:[[-8,-40,-3],[0,-43,-1.6],[3,-44.5,-.6],[12,-40,0]]},
 {name:'Reyes',role:'mex',style:MEX({number:19,seed:79}),keys:[[-8,-48,19],[0,-44,15],[SHOT,-34,11],[12,-26,8]]},
 {name:'Padilla',role:'mex',style:MEX({number:8,seed:68}),keys:[[-8,-53,-25],[0,-47,-20],[SHOT,-37,-14],[12,-29,-10]]},
 {name:'Greaves',role:'eng',style:ENG({number:8,seed:8}),keys:[[-8,-45,-9],[0,-40,-8],[SHOT,-26,-6.5],[8,-19,-4],[12,-17,-3]]},
 {name:'Paine',role:'eng',style:ENG({number:19,seed:19}),keys:[[-8,-47,24],[0,-41,20],[SHOT,-28,13.5],[12,-20,9]]},
 {name:'Stiles',role:'eng',style:ENG({number:4,seed:4,hairStyle:'balding',hair:[K,.7]}),keys:[[-8,-71,9],[0,-66,7],[12,-54,4]]},
 {name:'Moore',role:'eng',style:ENG({number:6,seed:6,hair:[K,.5]}),keys:[[-8,-80,-6],[0,-76,-4],[12,-64,-2]]},
 {name:'J. Charlton',role:'eng',style:ENG({number:5,seed:5,build:{height:1.87}}),keys:[[-8,-82,6],[0,-79,5],[12,-68,4]]},
 {name:'Cohen',role:'eng',style:ENG({number:2,seed:2}),keys:[[-8,-76,23],[0,-72,21],[12,-60,18]]},
 {name:'Wilson',role:'eng',style:ENG({number:3,seed:3}),keys:[[-8,-76,-23],[0,-72,-21],[12,-60,-18]]},
 {name:'Banks',role:'gk',style:BANKS,keys:[[-8,-100.5,0],[12,-98.5,0]]},
 {name:'Lo Bello',role:'ref',style:REF,keys:[[-8,-51,13],[0,-46,10.5],[SHOT,-35,9],[12,-27,8]]},
];
const CH=0,GKI=1,DIAZ=2,NUNEZ=3,PET=4,HUNT=5,DELM=6;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-8,TB=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
/** a ball spot just ahead of a (non-hero) player's boot, along his run */
function bootOf(k:number,tau:number,ahead=.5):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}

// ---- Charlton: the run down the middle, the jinks, the strike (right foot), the celebration ----
const HIT:V3=[0,2.12,2.3];// where the ball crosses the line: the top corner, Calderón's left (inferred which corner)
const CYC=2.9;
function yawCh(tau:number){const v=velOf(CH,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(CH,tau),toGoal=YAW(HIT[0]-x,HIT[2]-z);return lerpAng(run,toGoal,sm(SHOT-.8,SHOT-.35,tau)*(1-sm(SHOT+.7,SHOT+1.3,tau)));}
/** the ball spot at his boot: ahead and a touch to the side of that foot */
function footAt(tau:number,foot:'l'|'r',ahead=.5):[number,number]{const p=posOf(CH,tau),y=yawCh(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=foot==='r'?.1:-.12;return[p[0]+fx*ahead+rx*sd,p[1]+fz*ahead+rz*sd];}
/** the jinks: weight and shoulders thrown to his left, then to his right */
const JINK_L:Partial<Pose>={roll:-12,bend:-15,lean:20,twist:12,lShA:52,rShA:30,neckY:8,squash:-.05};
const JINK_R:Partial<Pose>={roll:12,bend:15,lean:20,twist:-12,rShA:56,lShA:30,neckY:-8,squash:-.05};
const JL=[1.95,2.85] as const,JR=[3.05,3.95] as const;
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const SD=1.05,S_ST=SHOT-STRIKE_CONTACT*SD;
function chPose(tau:number):Pose{
 const v=velOf(CH,tau),sp=Math.hypot(v[0],v[1]);let p:Pose;
 if(tau<-.3){const s=clamp((sp-2)/5);p=blendPose(stand(),runCycle(distOf(CH,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
  p=over(p,{neckP:26,neckY:14,lShA:30},bump(-2,-.1,tau));}// eyes on Hunt's pass
 else{const s=clamp((sp-2)/4.5),dr=dribble(distOf(CH,tau)/CYC,{foot:'r',speed:.5+.45*s});p=blendPose(stand(),dr,clamp((sp-.3)/.8));
  p=over(p,{neckP:4,lean:10},bump(.4,1.6,tau)*.6);}// head up: he looks at the goal between touches
 p=over(p,JINK_L,bump(JL[0],JL[1],tau));
 p=over(p,JINK_R,bump(JR[0],JR[1],tau));
 const u=(tau-S_ST)/SD;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>SHOT+1.1)p=blendPose(p,celebrate((tau-SHOT-1.1)*1.1,{kind:'arms'}),sm(SHOT+1.1,SHOT+1.6,tau));
 return p;}
/** the strike point: his right boot at contact (from the solved skeleton), a touch ahead of the toe, on the grass */
const M:V3=(()=>{const[x,z]=posOf(CH,SHOT),y=yawCh(SHOT),sk=solve(chPose(SHOT),CHARLTON.build,{x,z,yaw:y});return[sk.rToe[0]+Math.cos(y)*.1,.11,sk.rToe[2]-Math.sin(y)*.1];})();
/** his touches: one per dribble stride (right foot) from the first touch until the last one before the strike */
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(CH,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.75;tau+=DT){const ph=distOf(CH,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3)out.push(tau);prev=ph;}
 return out;})();
const TP:V3[]=TOUCHES.map(t=>{const[x,z]=footAt(t,'r');return[x,.11,z];});

// ---- the ball: del Muro's pass, Peters' interception, his pass to Hunt, Hunt's switch inside, the dribble, the thunderbolt, the net ----
const G0=9.81,FL=.85,IN_NET=SHOT+FL,BACKT=IN_NET+.08,BACK:V3=[1.9,1.95,2.3],REST:V3=[1.4,.11,1.9];
const VY=(HIT[1]-M[1]+.5*G0*FL*FL)/FL;
const A0=bootOf(DELM,MEXPASS),A1=bootOf(PET,INTER,.45),A2=bootOf(PET,PPASS),A3=bootOf(HUNT,HUNT_IN,.45),A4=bootOf(HUNT,SWITCH);
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
function ballAt(tau:number):V3{
 if(tau<MEXPASS)return bootOf(DELM,tau);
 if(tau<INTER)return roll(A0,A1,(tau-MEXPASS)/(INTER-MEXPASS));
 if(tau<PPASS)return mix3(A1,A2,easeOut((tau-INTER)/(PPASS-INTER)));
 if(tau<HUNT_IN)return roll(A2,A3,(tau-PPASS)/(HUNT_IN-PPASS));
 if(tau<SWITCH)return mix3(A3,A4,easeOut((tau-HUNT_IN)/(SWITCH-HUNT_IN)));
 if(tau<0)return roll(A4,TP[0],(tau-SWITCH)/-SWITCH);
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const a=TP[k],b=k+1<TOUCHES.length?TP[k+1]:M,t1=k+1<TOUCHES.length?TOUCHES[k+1]:SHOT,u=(tau-TOUCHES[k])/(t1-TOUCHES[k]),e=k+1<TOUCHES.length?1-(1-u)*(1-u):u*(1.4-.4*u);return mix3(a,b,e);}
 if(tau<IN_NET){const s=tau-SHOT;return[lerp(M[0],HIT[0],s/FL),M[1]+VY*s-.5*G0*s*s,lerp(M[2],HIT[2],s/FL)];}
 if(tau<BACKT)return mix3(HIT,BACK,(tau-IN_NET)/(BACKT-IN_NET));
 const u=clamp((tau-BACKT)/.75),y=u<.55?lerp(BACK[1],.11,(u/.55)*(u/.55)):.11+.3*Math.sin(Math.PI*(u-.55)/.45);return[lerp(BACK[0],REST[0],easeOut(u)),y,lerp(BACK[2],REST[2],u)];
}
const NET_HIT:V3=[2,1.95,2.3];

// ---- everyone else ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DIVE_T=SHOT+.3,DIVE_D=1;
/** a pass: the strike blended in round its contact time, facing the target */
function passAt(p:Pose,tau:number,at:number,power:number,D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot:'r',power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===CH)return{p:chPose(tau),yaw:yawCh(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='mex'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(k===GKI&&tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'l',height:.85});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===DELM){if(Math.abs(tau-MEXPASS)<.5)yaw=YAW(A1[0]-x,A1[2]-z);p=passAt(p,tau,MEXPASS,.4);}
 if(k===PET){if(tau>INTER-.6&&tau<INTER+.2){yaw=lerpAng(yaw,YAW(A0[0]-x,A0[2]-z)+.5,bump(INTER-.6,INTER+.2,tau));const u=(tau-(INTER-.6*.8))/.8;p=blendPose(p,lunge(clamp(u),{side:'r'}),bump(INTER-.6,INTER+.3,tau));}
  if(Math.abs(tau-PPASS)<.5)yaw=YAW(A3[0]-x,A3[2]-z);p=passAt(p,tau,PPASS,.4);}
 if(k===HUNT){if(tau>HUNT_IN-.3&&tau<SWITCH+.4)yaw=YAW(TP[0][0]-x,TP[0][2]-z);p=passAt(p,tau,SWITCH,.5);}
 // the two he swerves past: each turns to face him and jabs a leg, too late
 if(k===DIAZ||k===NUNEZ){const[cx,cz]=posOf(CH,tau),at=k===DIAZ?2.25:3.3;if(tau>at-1.4&&tau<at+.6)yaw=lerpAng(yaw,YAW(cx-x,cz-z),Math.min(sm(at-1.4,at-1,tau),1-sm(at+.2,at+.6,tau)));
  const t0=at-.6*.8,u=(tau-t0)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:k===DIAZ?'r':'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(tau>IN_NET+.4&&(k===HUNT||k===PET||k===14))p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Charlton with motion smear + secondary motion;
 * `mir` draws the lesson's mirrored (left-footed) copy of the same simulation */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:number;only?:number[];mir?:boolean}):World{
 const mir=!!o.mir,b=MZ(ballAt(tau),mir),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 const PL=(k:number,tt:number):Place=>{const[x,z]=posOf(k,tt),yaw=poseOf(k,tt).yaw;return mir?{x,z:-z,yaw:-yaw}:{x,z,yaw};};
 const PO=(k:number,tt:number)=>{const p=poseOf(k,tt).p;return mir?mirrorPose(p):p;};
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z0]=posOf(k,tau),z=mir?-z0:z0,g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const pose=PO(k,tp),yaw=PL(k,tp).yaw,px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===CH?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===CH||a.key);
   const prev=big?{pose:PO(k,tp-1/12),place:{...PL(k,tp-1/12),x:posOf(k,tau-1/12)[0],z:(mir?-1:1)*posOf(k,tau-1/12)[1]}}:undefined;
   res.set(k,drawPlayer(s,pose,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===CH}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,MZ(ballAt(tau-.03),mir)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  // the thunderbolt: speed streaks behind the ball in flight
  if(o.trail&&tau>SHOT&&tau<IN_NET+.05){const back=P(c,MZ(ballAt(Math.max(SHOT,tau-.14)),mir));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** the ball's flight in the air (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;dashed?:boolean;seed?:number;head?:boolean;mir?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,dashed=false,seed=81,head=true}=o;if(progress<=.01)return;
 const n=14,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=MZ(ballAt(t0+(t1-t0)*i/n),o.mir),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.06;x<.95;x+=.12)gaps.push([x,x+.06]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.6,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.6,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** a screen-space ring round a joint pair (a boot), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 s.knockout(ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);
 s.fill(ink,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(70,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed:143,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed:143,taper:0,wobble:.8}),.95*w);}
/** the goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}
/** "top corner": a ring in the goal plane round the corner the ball flies into */
function cornerRing(s:Sheet,c:Camera,w:number,sz=1){if(w<=.02)return;const h=HIT,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU,p:V3=[h[0],h[1]+Math.sin(a)*.62*w*sz,h[2]+Math.cos(a)*.8*w*sz];if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const wd=Math.max(5,.1*sz*kAt(c,h)),cv=Math.min(1,w*1.5);s.knockout(ribbon(pts,wd*1.8,{close:true,seed:145,taper:0,wobble:.8}),.7*cv);s.fill(Y,ribbon(pts,wd,{close:true,seed:145,taper:0,wobble:.8}),.95*cv);}
/** the right (or mirrored left) toe's arc through the strike (screen points from solved skeletons), for the follow-through mark */
function toeArc(c:Camera,t0:number,t1:number,mir=false,n=10):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*i/n,[x,z]=posOf(CH,tau),y=yawCh(tau),sk=solve(mir?mirrorPose(chPose(tau)):chPose(tau),CHARLTON.build,mir?{x,z:-z,yaw:-y}:{x,z,yaw:y}),toe=mir?sk.lToe:sk.rToe;if(depthOf(c,toe)<NEAR+.2)continue;out.push(P(c,toe));}return out;}

// ================= chapter 1 (live, near real time): the high main-stand camera; the towers, the interception, the run, the thunderbolt =================
const tau1=(t:number)=>{const bc=T(0,'Bobby Charlton'),pu=T(0,'picks it up'),sd=T(0,'Straight down the middle'),jl=T(0,'jinks left'),jr=T(0,'jinks right'),bm=T(0,'boom'),tc=T(0,'top corner'),E=SEC(0);
 return key(t,mono([[0,-7.6],[bc-.2,-2.3],[pu+.25,0],[sd+.1,1.05],[jl+.1,2.25],[jr+.1,3.35],[bm,SHOT],[tc+.2,IN_NET+.12],[E+1,IN_NET+.12+(E+.8-tc)]]),linear);};
const CAM1:V3=[-42,20,62];
function look1(tau:number):V3{const b=ballAt(tau),[cx,cz]=posOf(CH,tau);
 if(tau<0)return[lerp(b[0],-54,.3),1,lerp(b[2],0,.3)*.7];
 if(tau<IN_NET){const u=sm(SHOT-1,SHOT+.3,tau);return[lerp(lerp(b[0],cx,.3)+4,lerp(b[0],-8,.3),u),1,lerp(b[2],0,.3)*.7];}
 return mix3([-6,1.2,1],[cx,1,cz*.7],sm(IN_NET+.4,IN_NET+2.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const wb=T(0,'Wembley'),ea=T(0,'England against Mexico');
 // wide on Wembley and its twin towers first, then down onto the play
 const up=1-sm(ea-.6,ea+.9,t,easeInOutSine);
 const F=key(t,mono([[0,1500],[wb+1,1650],[ea+.9,4300],[T(0,'Bobby Charlton'),5300],[T(0,'picks it up')+.4,5700],[T(0,'jinks right'),6100],[T(0,'boom'),6300],[T(0,'top corner')+.4,6900],[SEC(0),6300]]),easeInOutSine);
 return cam(CAM1,mix3(look,[-112,17,-14],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,wb=T(0,'Wembley'),ea=T(0,'England against Mexico'),iw=T(0,'in white'),pu=T(0,'picks it up'),oh=T(0,'his own half'),sd=T(0,'Straight down the middle'),jl=T(0,'jinks left'),jr=T(0,'jinks right'),th=T(0,'A thunderbolt'),tc=T(0,'top corner');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn),towers:sm(wb-.1,wb+.4,t)*(1-sm(ea-.4,ea+.2,t))});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,half:sm(oh-.15,oh+.25,t)*(1-sm(oh+1.3,oh+1.8,t))});
  // "straight down the middle": his line to goal on the grass, dashed, drawn ahead of him
  const sw=sm(sd-.2,sd+.8,t,easeOut)*(1-sm(jl-.1,jl+.4,t));
  groundTrail(s,c,[[-51,1.3],[-40,1],[-30,1.1],[-19,1.2]],.5,Y,{progress:sw,dashed:true,cov:.9,seed:91});
  // "jinks left" / "jinks right": the swerve in his run, red, as he makes it
  groundTrail(s,c,pathOf(CH,JL[0]-.2,JL[1]+.1,10),.4,R,{progress:sm(jl-.15,jl+.4,t,easeOut),cov:.95*(1-sm(jr+.8,jr+1.3,t)),seed:93});
  groundTrail(s,c,pathOf(CH,JR[0]-.1,JR[1]+.1,10),.4,R,{progress:sm(jr-.15,jr+.4,t,easeOut),cov:.95*(1-sm(th,th+.5,t)),seed:95});
  airTrail(s,c,SHOT,IN_NET,Y,{progress:clamp((tau-SHOT)/FL),cov:.95*(1-sm(tc+1,tc+1.5,t)),wm:.35,seed:147,head:false});
  const w=drawWorld(s,c,tau,tp,{ballMin:13,trail:1});
  // "in white": a ring round Charlton
  const hero=w.res.get(CH);if(hero)bodyRing(s,hero,Y,sm(iw-.15,iw+.25,t,easeOutBack)*(1-sm(iw+1.4,iw+1.9,t)));
  // "picks it up": a spark as Hunt's pass reaches him
  const ap=tau;if(ap>-.05&&ap<.35){const q=P(c,TP[0]);sparkBurst(s,Y,q[0],q[1],kAt(c,TP[0])*1.8,{n:8,seed:97,g:easeOutBack(clamp((ap+.05)/.1))*(1-clamp((ap-.2)/.15)),width:7});}
  // "boom": a spark at the boot
  const ag=tau-SHOT;if(ag>-.02&&ag<.35){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*2.2,{n:9,seed:99,g:easeOutBack(clamp(ag/.08))*(1-clamp((ag-.2)/.15)),width:8});}
  // "top corner": the corner lights up as it goes in
  cornerRing(s,c,sm(tc-.3,tc+.1,t,easeOutBack)*(1-sm(tc+1.2,tc+1.6,t)),2.2);
  reel(s,t);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, low beside him on his kicking side): left, right, the gap, the right foot, 25 yards =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,1.1],[T(1,'Left'),1.95],[T(1,'then right')+.2,3.1],[T(1,'opening a gap')+.3,3.75],[T(1,'his right foot')+.25,SHOT],[T(1,'twenty-five yards'),SHOT+.3],[E,SHOT+.55]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(CH,clamp(tau,0,SHOT+.3)),push=sm(T(1,'his right foot')-.9,T(1,'his right foot')+.1,t,easeInOutSine),out=sm(T(1,'twenty-five yards')-.4,E,t,easeInOutSine);
 const look:V3=[lerp(x+3.2-1.6*push,-7,out),lerp(.95,.7,out),lerp(z+.2*push,z*.4,out)];
 return cam([x-7.5+2.4*push-2.5*out,lerp(4-1.9*push,3.6,out),z+5.6+.6*push-4.8*out],look,key(t,mono([[0,2100],[T(1,'his right foot')+.1,2300],[E,1500]])));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),le=T(1,'Left'),tr=T(1,'then right'),og=T(1,'opening a gap'),rf=T(1,'his right foot'),ty=T(1,'twenty-five yards');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "Left" / "then right": the zig-zag of his run on the grass, red, each half as he makes it
  groundTrail(s,c,pathOf(CH,JL[0]-.2,JL[1]+.1,10),.14,R,{progress:sm(le-.15,le+.6,t,easeOut),cov:.95*(1-sm(E-.8,E-.4,t)),seed:101});
  groundTrail(s,c,pathOf(CH,JR[0]-.1,JR[1]+.1,10),.14,R,{progress:sm(tr-.15,tr+.6,t,easeOut),cov:.95*(1-sm(E-.8,E-.4,t)),seed:103});
  // "open a gap": the space between the two defenders lights up, and his path through it
  const gw=sm(og-.2,og+.5,t,easeOut)*(1-sm(rf,rf+.5,t));if(gw>.02){const[ax,az]=posOf(DIAZ,tau),[bx,bz]=posOf(NUNEZ,tau);groundRing(s,c,(ax+bx)/2+2,(az+bz)/2,2.2,1.4,.07,Y,.95*gw,105);}
  // "twenty-five yards": a dashed measuring line from the ball to the goal
  const yw=sm(ty-.2,ty+.8,t,easeOut)*(1-sm(E-.5,E-.15,t));groundTrail(s,c,[[M[0],M[2]],[M[0]*.66,M[2]*.8],[M[0]*.33,M[2]*.6],[0,M[2]*.4]],.3,Y,{progress:yw,dashed:true,seed:107});goalMouth(s,c,yw*.8);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(rf-.1,rf+.2,t)*(1-sm(rf+.9,rf+1.3,t)),trail:1});
  const hero=w.res.get(CH);
  if(hero){
   // "his right foot": a yellow ring on the right boot as it meets the ball, then the follow-through arc
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(rf-.15,rf+.2,t,easeOutBack)*(1-sm(ty,ty+.4,t)),109);
   const fw=sm(rf+.2,rf+.8,t,easeOut)*(1-sm(E-.6,E-.2,t));if(fw>.02&&tau>SHOT){const arc=toeArc(c,SHOT-.02,Math.min(SHOT+.5,tau));if(arc.length>2){const wd=Math.max(5,kAt(c,M)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:111,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:111,head:wd*3,cov:.95*fw});}}}
  const ag=tp-SHOT;if(ag>-.03&&ag<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*.9,{n:9,seed:113,g:easeOutBack(clamp((ag+.03)/.08))*(1-clamp((ag-.12)/.13)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:115,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
  reel(s,t,.8);},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse angle from behind the net): the thunderbolt comes at us, the keeper can't reach it, either foot =================
const tau3=(t:number)=>{const E=SEC(2),tk=T(2,'The keeper'),cr=T(2,'can\'t reach it'),cs=T(2,'Charlton could strike');
 return key(t,mono([[0,SHOT-.3],[tk+.2,SHOT+.25],[cr+.55,IN_NET-.02],[cs,IN_NET+1.4],[E,IN_NET+1.4+(E-cs)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(CH,tau),cel=sm(IN_NET+.3,IN_NET+1.6,tau,easeInOutSine);
 const look=mix3([-9,1.5,1.9],[x+1.2,1.1,z],cel);
 return cam([lerp(6.2,4.4,cel),lerp(1.7,1.9,cel),lerp(.8,1.2,cel)],look,key(t,mono([[0,1500],[T(2,'can\'t reach it'),1550],[T(2,'Charlton could strike'),4200],[E,5600]]),easeInOutSine));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_NET,E=SEC(2),tk=T(2,'The keeper'),cr=T(2,'can\'t reach it'),ef=T(2,'either foot');frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "The keeper": a red ring on the grass where he stands
  const gw=sm(tk-.1,tk+.3,t,easeOutBack)*(1-sm(tk+1.1,tk+1.5,t)),[kx,kz]=posOf(GKI,tau);groundRing(s,c,kx,kz,1.1,1.1,.07,R,.95*clamp(gw),117);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  // "can't reach it": the gap between his glove and the ball
  const gk=w.res.get(GKI),cw=sm(cr-.1,cr+.3,t)*(1-sm(cr+1.2,cr+1.6,t));
  if(gk&&cw>.02&&depthOf(c,w.ball)>NEAR){const q=P(c,w.ball),hnd=gk.joints.lHa;laneArrow(s,R,hnd,[lerp(hnd[0],q[0],.8),lerp(hnd[1],q[1],.8)],Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:cw,seed:119,head:12,cov:.95});}
  // "either foot": both of his boots ringed — the right that scored (yellow) and the left he could use just as well (red)
  const hero=w.res.get(CH),ew=sm(ef-.15,ef+.25,t,easeOutBack)*(1-sm(E-.5,E-.15,t));
  if(hero){bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,ew,121);bootRing(s,hero.joints.lToe,hero.joints.lAn,R,ew,123);}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:125,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  reel(s,t,.8);},
 aperture(t){const c=cam3(t),[x,z]=posOf(CH,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a low side camera): the real right-foot strike, a whip-pan, the same strike with the left =================
/** beat A (the real strike, right foot) until the whip at "whichever way"; beat B the mirrored strike (left foot) */
const WHIP=()=>T(3,'whichever way')-.25;
const tau4=(t:number)=>{const E=SEC(3),ps=T(3,'practise shooting'),bf=T(3,'both feet'),tb=T(3,'the ball comes'),wp=WHIP();
 return t<wp?key(t,mono([[0,SHOT-1.25],[ps,SHOT-.5],[bf+.2,SHOT],[wp,SHOT+.45]]),linear):key(t,mono([[wp,SHOT-1.0],[tb+.25,SHOT],[E,SHOT+.55]]),linear);};
function cam4(t:number){const mir=t>=WHIP(),tau=tau4(t),E=SEC(3),[x,z0]=posOf(CH,clamp(tau,SHOT-1.3,SHOT+.7)),z=mir?-z0:z0,sd=mir?-1:1;
 const push=mir?sm(T(3,'whichever way'),T(3,'the ball comes'),t,easeInOutSine):sm(T(3,'practise shooting')-.3,T(3,'both feet'),t,easeInOutSine);
 const follow=mir?sm(T(3,'the ball comes')+.1,E-.3,t,easeInOutSine):0;
 const look:V3=[x+1.2+.9*follow,.9+.15*follow,z-sd*.5*follow];
 return cam([x-1.2+1*push,1.15+.3*follow,z+sd*(6.8-1.4*push+2.5*follow)],look,2200+350*push-1150*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),wp=WHIP(),mir=t>=wp,c=cam4(t),tau=tau4(t),tp=tau4((tt<wp)===(!mir)?tt:t),E=SEC(3),yt=T(3,'Your turn'),bf=T(3,'both feet'),wh=T(3,'whichever way'),tb=T(3,'the ball comes');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  const Mm=MZ(M,mir);
  // "Your turn": a ring on the grass round the ball
  groundRing(s,c,Mm[0],Mm[2],.6,.6,.06,Y,.95*sm(yt-.1,yt+.3,t,easeOutBack)*(1-sm(bf-.2,bf+.2,t)),127);
  // "the ball comes": the line to goal (the other top corner) and the lit goal mouth
  const gw=mir?sm(tb-.1,tb+.7,t,easeOut)*(1-sm(E-.5,E-.15,t)):0;
  airTrail(s,c,SHOT,IN_NET,Y,{progress:gw,wm:.1,seed:129,mir:true});goalMouth(s,c,gw*.85);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1,only:[CH,GKI],mir});
  const hero=w.res.get(CH);
  if(hero){
   // "both feet": both boots ringed (the kicking foot yellow, the other red) — right foot now, left foot after the whip
   const bw=sm(bf-.15,bf+.25,t,easeOutBack)*(1-sm(wp-.25,wp,t));
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,bw,131);bootRing(s,hero.joints.lToe,hero.joints.lAn,R,bw,133);
   // "whichever way": the left boot lit as the same strike comes off the other foot
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,mir?sm(wh,wh+.35,t,easeOutBack)*(1-sm(tb+.6,tb+1,t)):0,135);
   // the follow-through arc of whichever boot struck it
   const fw=mir?sm(tb+.1,tb+.6,t,easeOut)*(1-sm(E-.5,E-.15,t)):sm(bf+.1,bf+.5,t,easeOut)*(1-sm(wp-.3,wp,t));
   if(fw>.02&&tau>SHOT){const arc=toeArc(c,SHOT-.02,Math.min(SHOT+.5,tau),mir);if(arc.length>2){const wd=Math.max(6,kAt(c,Mm)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:137,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:137,head:wd*3,cov:.95*fw});}}}
  const ag=tp-SHOT;if(ag>-.03&&ag<.25){const q=P(c,Mm);sparkBurst(s,Y,q[0],q[1],kAt(c,Mm)*.8,{n:9,seed:139,g:easeOutBack(clamp((ag+.03)/.08))*(1-clamp((ag-.12)/.13)),width:9});}
  // the whip-pan between the two strikes
  const wa=1-clamp(Math.abs(t-wp)/.3);if(wa>.02)speedLines(s,K,0,0,0,{n:14,seed:141,len:1100,spread:600,width:24,cov:.7*wa});
  reel(s,t,.6);},
 still:4,
};

const story:RisoStory={
 id:'charlton-signature',format:'11v11',title:'Charlton\'s thunderbolt, 1966',
 theme:'Shooting from distance: practise with both feet so you can shoot whichever way the ball comes.',
 ageNote:'World Cup group match, England 2–0 Mexico, Wembley Stadium, London, 16 July 1966 (38th minute). England\'s first goal of the tournament; Charlton was 28.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a newsreel flash and the leather ball rockets up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
