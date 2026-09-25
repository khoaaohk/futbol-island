/** Iconic-play film (signature): "the Black Panther's rocket" — Eusébio's first goal v North Korea, 1966 World Cup quarter-final,
 * Portugal 5–3 North Korea, Goodison Park, Liverpool, Saturday 23 July 1966, 27th minute, 0–3 → 1–3.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Eusébio a signature, not a match ("the Black Panther's rocket", long_range_goal,
 * centre, right foot; lesson "Hit it with your laces and follow through toward the goal"). The sources describe him as known for his
 * "right-footed shot"; his most famous match is this quarter-final, where Portugal were 0–3 down after 25 minutes and he scored the next
 * four. The 27th-minute goal is the first of them and the only one of the four struck from open play before half-time (43' and 59' were
 * penalties) — the rocket that started the comeback.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/eusebio-signature-1966/script.json. The voice is generated later by the lead (local Kokoro). Until
 * then every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter
 * seconds, so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/eusebio-signature-1966/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/eusebio-signature-1966/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage):
 *  - Wikipedia, "1966 FIFA World Cup knockout stage" (raw wikitext; match box cites FIFA's match report, kit boxes, line-ups)
 *    https://en.wikipedia.org/wiki/1966_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Eusébio" (the quarter-final paragraph cites Jamie Rainbow, World Soccer, 6 Jan 2014; "right-footed shot" cites the BBC
 *    obituary, 5 Jan 2014)  https://en.wikipedia.org/wiki/Eus%C3%A9bio
 *  - pt.wikipedia, "Portugal no Campeonato do Mundo de Futebol de 1966" (the Magriços' tournament; match boxes)
 *  - The Independent (cached gallery text, World Cup shocks): "after just 25 minutes the Koreans were 3-0 up … He hit back with four goals
 *    before José Augusto made sure of the win with the fifth on 80 minutes"
 *  - The Guardian, "From Africa to posterity: How Eusébio lit up the World Cup", 6 June 2010 (four of his nine 1966 goals v North Korea)
 * CONFIRMED by those accounts: Saturday 23 July 1966, 15:00 BST, Goodison Park, Liverpool, 40,248; referee Menachem Ashkenazi (Israel);
 *  North Korea led 3–0 (Pak Seung-zin 1', Li Dong-woon 22', Yang Seung-kook 25'); EUSÉBIO SCORED 27', 43' (pen.), 56', 59' (pen.), José
 *  Augusto 80'; Portugal won 5–3; Eusébio finished the World Cup top scorer with nine goals; nickname "the Black Panther"; his preferred
 *  foot the RIGHT. KITS (kit boxes): Portugal RED shirts with a GREEN collar and GREEN cuff borders, WHITE shorts (red side stripe), GREEN
 *  socks; North Korea WHITE shirts with a BLUE V-neck and cuffs, WHITE shorts, RED socks. Numbers: Eusébio 13, Coluna 10 (captain), Torres
 *  18, José Augusto 12, Simões 11, Graça 16, Vicente 4, Baptista 20; Li Chan-myung 1 (goalkeeper), Shin Yung-kyoo 3, Ha Jung-won 14, Lim
 *  Zoong-sun 5, Oh Yoon-kyung 13, Im Seung-hwi 6, Pak Seung-zin 8, Pak Doo-ik 7, Li Dong-woon 16, Han Bong-zin 11, Yang Seung-kook 15.
 * INFERRED / ILLUSTRATIVE (the written sources we could reach do not describe the 27' goal move by move): the build-up (Coluna carrying
 *  it through midfield and passing), that Eusébio ran onto a pass and struck it first time, that the shot was with his RIGHT foot and his
 *  laces (his preferred foot; the narration never names the foot for this goal), where he struck it from (drawn ~16 m out, inside-right of
 *  centre, per the signature's "long, centre"), its height and corner (drawn high to the keeper's right), the keeper's late dive, every
 *  other position, run and timing in metres and seconds; which end and the direction of play on screen; Goodison's stands as drawn (four
 *  tight roofed stands right up to the pitch, no running track), the scoreboard on the far roof (illustrative, it shows the score), the
 *  overcast afternoon sky, the crowd's colours; the tan leather ball; short sleeves; the keeper's dark jersey and the referee's black;
 *  the celebration. The newsreel scratches and vignette are a style choice (1966 was seen on black-and-white newsreel and TV).
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 the strike): ch1 = the high main-stand broadcast camera, near real time (0–3 on the board, Coluna carries it, the pass,
 * Eusébio's run, the rocket, the net, 1–3); ch2 = the TV slow-motion replay, low beside him on his kicking side (eyes on the ball, the
 * standing foot, the laces, the follow-through); ch3 = the reverse angle from behind the net (the ball comes at us, the keeper can't reach
 * it, the celebration, four goals); ch4 = the lesson on a low side camera (laces, follow through toward the goal).
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (sun on the grass, the ball, teaching marks), red
 * (Portugal, skin, arrows), green (grass, Portugal's socks and trim — Goodison in daylight), navy (key line, stands, newsreel grain).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',G='green';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`eusebio film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/eusebio-signature-1966/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Three down','Goodison Park, 1966, World Cup quarter-final. Portugal are losing three-nil to North Korea! Eusébio, the Black Panther, in red, races onto the pass, and... bang! A rocket into the net!',
  ['Goodison Park','1966','World Cup quarter-final','Portugal','three-nil','North Korea','Eusébio','the Black Panther','in red','races onto the pass','bang','A rocket','into the net']),
 prov('The rocket','Watch again, slowly. Eyes on the ball, standing foot beside it, laces through the middle... and his leg follows through toward the goal.',
  ['Watch again','slowly','Eyes on the ball','standing foot','beside it','laces','through the middle','follows through','toward the goal']),
 prov('Four goals','The keeper can\'t reach it! Eusébio scores four that day, and Portugal win five-three!',
  ['The keeper','can\'t reach it','Eusébio scores four','that day','Portugal win','five-three']),
 prov('Your turn','Your turn: hit it with your laces, and follow through toward the goal!',
  ['Your turn','hit it','with your laces','follow through','toward the goal']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`eusebio film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Eusébio scores in is at x = 0, the pitch runs to x = −105) =================
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=14):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Goodison Park, July 1966, an overcast afternoon: four tight roofed stands right up to the pitch =================
const CX=-52.5,NS=48;
/** a point on the ground's stands: angle th round the pitch centre, d metres back from the front wall (a near-rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(56+d)*Math.sign(c)*Math.pow(Math.abs(c),.16),y,(37.5+d)*Math.sign(s)*Math.pow(Math.abs(s),.16)];}
const LOW=(b:number):[number,number]=>[.5+13*b,1+6.5*b];
const UP=(b:number):[number,number]=>[7+9*b,9.5+6.5*b];
type Bowl={low:V3[][];up:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],back:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1),[u0,v0]=UP(0),[u1,v1]=UP(1);o.low.push(Q(l0,h0,l1,h1));o.up.push(Q(u0,v0,u1,v1));
  o.back.push([rim(a,16,7),rim(b,16,7),rim(b,16,19.5),rim(a,16,19.5)]);
  o.roof.push(Q(6,18.2,18,20.4));o.fascia.push(Q(6,17.2,6,18.3));
  for(let r=0;r<12;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,23);if(h<.12)continue;const[d,y]=r<8?LOW((r+.5)/8):UP((r-8+.5)/4);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;score?:[number,number];pop?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // an overcast Liverpool afternoon: a pale grey sky, a little warmer low down
 s.field(K,.15,.7);
 const low=new Path2D(),up=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.up[i],up);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.72);
 s.knockout(up);s.tone(K,up,.5);
 s.knockout(low);s.tone(K,low,.3);
 // the crowd: one mark per group (white shirts and faces / red rosettes and scarves / grey coats / dark coats), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<14)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.46?0:q.h<.56?1:q.h<.8?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.8);s.fill(R,inks[1],.8);s.tone(K,inks[2],.5);s.fill(K,inks[3],.85);}
 // the roofs: dark undersides, a pale fascia board along each front
 s.knockout(roof);s.fill(K,roof,.9);
 s.knockout(fas);s.tone(K,fas,.3);
 if(o.score)board(s,c,o.score,o.pop??0);
}
/** the scoreboard on the far roof (illustrative): Portugal's goals as red bars on the left, North Korea's as paper bars on the right */
function board(s:Sheet,c:Camera,[a,b]:[number,number],pop:number){
 const Z=-58,Y0=20.6,Hh=4.2,W=13,corner=(x:number,y:number):V3=>[CX+x,Y0+y,Z];if(depthOf(c,corner(0,0))<20)return;
 const q=[corner(-W/2,0),corner(W/2,0),corner(W/2,Hh),corner(-W/2,Hh)].map(p=>P(c,p)),bd=polyPath(q,true);
 s.knockout(bd);s.fill(K,bd,.95);
 const bar=(x:number,g=1)=>{const p=[corner(x-.32,.7),corner(x+.32,.7),corner(x+.32,.7+2.8*g),corner(x-.32,.7+2.8*g)].map(v=>P(c,v));return polyPath(p,true);};
 const L=new Path2D(),Rt=new Path2D(),dash=polyPath([corner(-.5,1.9),corner(.5,1.9),corner(.5,2.3),corner(-.5,2.3)].map(v=>P(c,v)),true);
 for(let i=0;i<a;i++)L.addPath(bar(-4.8+i*1.2,i===a-1?easeOutBack(clamp(pop)):1));
 if(a===0){const ring=Array.from({length:14},(_,i)=>{const u=i/14*TAU;return P(c,corner(-3.6+Math.cos(u)*.8,2.1+Math.sin(u)*1.3));});s.stroke(Y,polyPath(ring,true),Math.max(2,kAt(c,corner(0,0))*.3),.95);}
 for(let i=0;i<b;i++)Rt.addPath(bar(1.8+i*1.2));
 s.fill(R,L,.95);s.knockout(Rt);s.knockout(dash);
}
/** the pitch: overcast grass (green × yellow), mowing stripes, paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-40],[6,0,-40],[6,0,40],[-111,0,40]]));s.knockout(gp);s.fill(G,gp,.82);s.tone(Y,gp,.5);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.15);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
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
 s.knockout(vol,.3);s.tone(K,vol,.15);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** 1966 newsreel: a soft dark vignette, a flicker of vertical scratches and dust (seeded per twelfth of a second) */
function reel(s:Sheet,t:number,w=1){
 if(w<=.02)return;const W=s.W,H=s.H,fr=Math.floor(t*12),r=rng(9100+fr);
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

// ================= kits (23 July 1966) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]],SKIN_TAN:AthleteStyle['skin']=[[R,.28],[Y,.55]];
/** Portugal: red shirts with green collar and cuffs, white shorts, green socks (confirmed); short sleeves and paper numbers inferred */
const POR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:G,trim:G,boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',...o});
/** North Korea: white shirts with a blue V-neck and cuffs (navy here), white shorts, red socks (confirmed) */
const PRK=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:R,trim:K,boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],...o});
const EUSEBIO:AthleteStyle=POR({number:13,skin:SKIN_DARK,build:{height:1.75,bulk:1.02,thighs:1.1},seed:13});
const LI:AthleteStyle={shirt:[K,.85],shorts:[K,.9],socks:[K,.6],boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.74},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the strike) =================
type TK=[number,number,number];// τ, x, z
type Role='eus'|'por'|'prk'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const PASS=-2.3;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). */
const ACTORS:Actor[]=[
 {name:'Eusébio',role:'eus',style:EUSEBIO,key:true,keys:[[-9,-37,14],[-6,-35,13.5],[-4,-33,12.5],[PASS,-30,10.2],[-1.4,-25.4,7],[-.7,-20.6,3.9],[-.3,-18,2.4],[0,-16.35,1.62],[.35,-15.4,1.3],[1,-14.3,1.1],[2,-12.2,.9],[3.2,-9,.5],[4.6,-5.6,.2],[6.5,-3,0]]},
 {name:'Li Chan-myung',role:'gk',style:LI,key:true,keys:[[-9,-4.5,-1],[-4,-4,.2],[-2,-3.4,.7],[-.6,-2.7,1.05],[0,-2.6,1.1],[8,-2.6,1.1]]},
 {name:'Ha Jung-won',role:'prk',style:PRK({number:14,seed:64}),key:true,keys:[[-9,-17,-3],[-4,-15,-2],[-2,-13.5,-1],[-.8,-12.8,-.2],[0,-12.4,.2],[1,-11.8,.3],[4,-10,.4],[7,-9,.4]]},
 {name:'Shin Yung-kyoo',role:'prk',style:PRK({number:3,seed:63}),key:true,keys:[[-9,-19,7],[-4,-19.5,6],[-2,-20.5,4],[-1,-20.6,2],[0,-19.4,.3],[1,-16.6,0],[3,-11.5,.4],[7,-9,.6]]},
 {name:'Coluna',role:'por',style:POR({number:10,seed:10,skin:SKIN_DARK,build:{height:1.78}}),key:true,keys:[[-9,-58,-9],[-6,-51,-8],[-4,-46,-6.4],[PASS,-41.4,-5.2],[-1.6,-40,-4.6],[0,-37,-3.5],[3,-31,-2],[7,-25,-1]]},
 {name:'Lim Zoong-sun',role:'prk',style:PRK({number:5,seed:65}),keys:[[-9,-24,15],[-4,-21,12],[0,-15.8,7.4],[2,-13,5.5],[7,-10,4]]},
 {name:'Oh Yoon-kyung',role:'prk',style:PRK({number:13,seed:73}),keys:[[-9,-22,-14],[-4,-18,-11],[0,-12,-7],[3,-9,-5],[7,-7,-4]]},
 {name:'Im Seung-hwi',role:'prk',style:PRK({number:6,seed:66}),keys:[[-9,-42,4],[-4,-37,2],[0,-28,.5],[3,-22,.5],[7,-18,.5]]},
 {name:'Pak Seung-zin',role:'prk',style:PRK({number:8,seed:68}),keys:[[-9,-50,-3],[-4,-44,-2],[PASS,-43,-3],[0,-39,-2],[7,-30,-1]]},
 {name:'Torres',role:'por',style:POR({number:18,seed:18,build:{height:1.91}}),keys:[[-9,-20,-8],[-4,-15,-6],[0,-9.6,-4.5],[1.5,-8,-3.5],[4,-9.5,-2],[7,-11,0]]},
 {name:'José Augusto',role:'por',style:POR({number:12,seed:12}),keys:[[-9,-32,24],[-4,-27,21],[0,-19,16],[4,-14,11],[7,-12,7]]},
 {name:'Simões',role:'por',style:POR({number:11,seed:11,hair:[K,.8]}),keys:[[-9,-34,-24],[-4,-29,-21],[0,-22,-17],[4,-17,-12],[7,-14,-9]]},
 {name:'Graça',role:'por',style:POR({number:16,seed:16}),keys:[[-9,-55,8],[-4,-50,6],[0,-44,4],[7,-36,3]]},
 {name:'Vicente',role:'por',style:POR({number:4,seed:4}),keys:[[-9,-66,-6],[0,-60,-4],[7,-54,-2]]},
 {name:'Baptista',role:'por',style:POR({number:20,seed:20,skin:SKIN_DARK}),keys:[[-9,-67,7],[0,-61,6],[7,-55,5]]},
 {name:'Pak Doo-ik',role:'prk',style:PRK({number:7,seed:67}),keys:[[-9,-60,1],[0,-56,2],[7,-50,2]]},
 {name:'Han Bong-zin',role:'prk',style:PRK({number:11,seed:71}),keys:[[-9,-58,16],[0,-52,13],[7,-46,11]]},
 {name:'Ashkenazi',role:'ref',style:REF,keys:[[-9,-48,-15],[-4,-40,-14],[0,-30,-12],[4,-22,-10],[7,-19,-9]]},
];
const EUS=0,GKI=1,HAI=2,SHINI=3,COLI=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-9,TB=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
// ---- Eusébio: the run onto the pass, the strike (right foot, laces), the follow-through, the run to the goal ----
const HIT:V3=[0,2.05,-1.75];// where the ball crosses the line: high, to the keeper's right (inferred)
const SD=1.05,S_ST=-STRIKE_CONTACT*SD;// the strike window: contact at τ = 0
function yawEus(tau:number){const v=velOf(EUS,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(EUS,tau),toGoal=YAW(HIT[0]-x,HIT[2]-z);return lerpAng(run,toGoal,sm(-.8,-.35,tau)*(1-sm(.7,1.3,tau)));}
function eusPose(tau:number):Pose{
 const v=velOf(EUS,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(stand(),runCycle(distOf(EUS,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 if(tau>-1.3&&tau<-.5)p=over(p,{neckP:30,lean:12},bump(-1.3,-.5,tau));// eyes on the rolling ball
 const u=(tau-S_ST)/SD;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>1.1)p=blendPose(p,celebrate((tau-1.1)*1.1,{kind:'run'}),sm(1.1,1.6,tau));
 return p;}
/** the strike point: his right boot at contact (from the solved skeleton), a touch ahead of the toe, on the grass */
const M:V3=(()=>{const[x,z]=posOf(EUS,0),sk=solve(eusPose(0),EUSEBIO.build,{x,z,yaw:yawEus(0)}),y=yawEus(0);return[sk.rToe[0]+Math.cos(y)*.1,.11,sk.rToe[2]-Math.sin(y)*.1];})();

// ---- the ball: Coluna's dribble, his pass (a rolling ball), the first-time strike (ballistic, rising), the net, the drop ----
const G0=9.81,FL=.55,IN_NET=FL,BACKT=FL+.08,BACK:V3=[1.92,1.9,-1.85],REST:V3=[1.45,.11,-1.6];
const VY=(HIT[1]-M[1]+.5*G0*FL*FL)/FL;
function colunaFoot(tau:number):V3{const[x,z]=posOf(COLI,tau),v=velOf(COLI,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(COLI,tau)/1.6,pulse=.12*Math.max(0,Math.sin(ph*TAU));return[x+v[0]/l*(.55+pulse),.11,z+v[1]/l*(.55+pulse)+.1];}
const P0:V3=colunaFoot(PASS);
function ballAt(tau:number):V3{
 if(tau<PASS)return colunaFoot(tau);
 if(tau<0){const u=(tau-PASS)/-PASS,e=u*(1.3-.3*u);return mix3(P0,M,e);}
 if(tau<FL){const s=tau;return[lerp(M[0],HIT[0],s/FL),M[1]+VY*s-.5*G0*s*s,lerp(M[2],HIT[2],s/FL)];}
 if(tau<BACKT)return mix3(HIT,BACK,(tau-FL)/(BACKT-FL));
 const u=clamp((tau-BACKT)/.75),y=u<.55?lerp(BACK[1],.11,(u/.55)*(u/.55)):.11+.3*Math.sin(Math.PI*(u-.55)/.45);return[lerp(BACK[0],REST[0],easeOut(u)),y,lerp(BACK[2],REST[2],u)];
}
const NET_HIT:V3=[2,1.9,-1.85];

const DIVE_T=.1,DIVE_D=1;
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===EUS)return{p:eusPose(tau),yaw:yawEus(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='prk'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'r',height:.75});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:-40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===COLI){if(tau<PASS+.3)yaw=YAW(v[0],v[1]);const D=.9,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>-.2&&u<1.4){yaw=YAW(M[0]-x,M[2]-z);p=blendPose(p,strike(clamp(u),{foot:'r',power:.45}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u)));}}
 if(k===HAI){if(tau>-1.5&&tau<.8)yaw=lerpAng(yaw,YAW(M[0]-x,M[2]-z),Math.min(sm(-1.5,-1,tau),1-sm(.4,.8,tau)));
  const t0=-.1-.6*.8,u=(tau-t0)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(tau>IN_NET+.4&&a.role==='por')p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau)*(k===9?1:.0));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Eusébio with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:number;only?:number[]}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===EUS?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===EUS||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===EUS}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  // the rocket: speed streaks behind the ball in flight
  if(o.trail&&tau>0&&tau<FL+.05){const back=P(c,ballAt(Math.max(0,tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
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
/** the ball's flight in the air (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;dashed?:boolean;seed?:number;head?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,dashed=false,seed=81,head=true}=o;if(progress<=.01)return;
 const n=14,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=ballAt(t0+(t1-t0)*i/n),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
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
/** the goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}
/** the right toe's arc through the strike (screen points from solved skeletons), for the follow-through mark */
function toeArc(c:Camera,t0:number,t1:number,n=10):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*i/n,[x,z]=posOf(EUS,tau),sk=solve(eusPose(tau),EUSEBIO.build,{x,z,yaw:yawEus(tau)});if(depthOf(c,sk.rToe)<NEAR+.2)continue;out.push(P(c,sk.rToe));}return out;}

// ================= chapter 1 (live, near real time): the high main-stand camera; 0–3, Coluna, the pass, the run, the rocket, 1–3 =================
const tau1=(t:number)=>{const nk=T(0,'North Korea'),eu=T(0,'Eusébio'),ro=T(0,'races onto the pass'),bg=T(0,'bang'),nt=T(0,'into the net'),E=SEC(0);
 return key(t,mono([[0,-8.6],[nk+.4,-3.6],[eu,-2.9],[ro,-2.2],[bg,-.02],[nt+.2,IN_NET+.12],[E+1,IN_NET+.12+(E+.8-nt)]]),linear);};
const CAM1:V3=[-36,17,55];
function look1(tau:number):V3{const b=ballAt(tau),[ex,ez]=posOf(EUS,tau);
 if(tau<PASS)return[lerp(b[0],ex,.35),1,lerp(b[2],ez,.35)*.7];
 if(tau<IN_NET){const u=sm(PASS,-.4,tau);return[lerp(lerp(b[0],ex,.35),lerp(b[0],-6,.35),u),1,lerp(b[2],0,.3)*.7];}
 return mix3([-5,1.2,0],[ex,1,ez*.7],sm(IN_NET+.4,IN_NET+2.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const tn=T(0,'three-nil'),nk=T(0,'North Korea');
 // wide on the ground and the board first (0–3), then down onto the play
 const F=key(t,mono([[0,3300],[tn-.2,2600],[nk+.6,3000],[T(0,'Eusébio'),4200],[T(0,'races onto the pass')+.5,4600],[T(0,'bang'),5400],[T(0,'into the net')+.5,5600],[SEC(0),5000]]),easeInOutSine);
 const up=sm(T(0,'Portugal')-.3,tn,t,easeInOutSine)*(1-sm(nk,nk+1.2,t,easeInOutSine));
 return cam(CAM1,[look[0]+(CX-look[0])*up*.6,look[1]+11*up,look[2]+(-40-look[2])*up*.35],F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,tn=T(0,'three-nil'),ir=T(0,'in red'),rk=T(0,'A rocket');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),score:[goalIn>.1?1:0,3],pop:clamp((goalIn-.1)/.35)});
  // "three-nil": the board's three Korean bars wink
  const tw=sm(tn-.1,tn+.2,t)*(1-sm(tn+1.2,tn+1.6,t));if(tw>.02){const[bx,by]=P(c,[CX+3,22.8,-58]);s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>[bx+Math.cos(i/24*TAU)*kAt(c,[CX,22,-58])*4.4,by+Math.sin(i/24*TAU)*kAt(c,[CX,22,-58])*2.6] as Pt),true),Math.max(4,kAt(c,[CX,22,-58])*.5),.95*tw);}
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "races onto the pass": the pass line on the grass, drawn as the ball rolls
  const ro=T(0,'races onto the pass'),pw=sm(ro-.3,ro+.9,t,easeOut)*(1-sm(rk,rk+.6,t));
  groundTrail(s,c,Array.from({length:13},(_,i)=>{const b=ballAt(PASS+(0-PASS)*i/12);return[b[0],b[2]] as [number,number];}),.35,Y,{progress:pw,dashed:true,head:true,cov:.9,seed:91});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,trail:1});
  // "in red": a ring round Eusébio
  const hero=w.res.get(EUS),rw=sm(ir-.15,ir+.25,t,easeOutBack)*(1-sm(ir+1.4,ir+1.9,t));
  if(hero&&rw>.02){const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.abs(f[1]-h[1])*.7+8;s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*rw,cy+Math.sin(i/24*TAU)*ry*rw] as Pt),true),Math.max(4,ry*.08),.95*rw);}
  // "bang": a spark at the boot
  const ag=tau;if(ag>-.02&&ag<.35){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*2.2,{n:9,seed:93,g:easeOutBack(clamp(ag/.08))*(1-clamp((ag-.2)/.15)),width:8});}
  reel(s,t);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:11,
};

// ================= chapter 2 (TV replay, slow motion, low beside him on his kicking side): eyes, standing foot, laces, follow-through =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,-1.55],[T(1,'Eyes on the ball'),-1.1],[T(1,'standing foot'),-.5],[T(1,'beside it')+.25,-.3],[T(1,'laces')+.1,-.08],[T(1,'through the middle')+.3,0],[T(1,'follows through')+.2,.18],[T(1,'toward the goal')+.3,.42],[E,.6]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(EUS,clamp(tau,-1.6,.3)),push=sm(T(1,'standing foot')-.4,T(1,'laces'),t,easeInOutSine),orbit=sm(T(1,'follows through')-.3,E,t,easeInOutSine);
 const look:V3=[lerp(x+.6,x+4,orbit),lerp(.75,1,orbit),lerp(z+.1,z-.4,orbit)];
 return cam([x-3.2+1.2*push-1.5*orbit,1.05+.2*orbit,z+6.6-1.6*push+.5*orbit],look,key(t,mono([[0,2000],[T(1,'laces'),2400],[E,1900]])));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),eb=T(1,'Eyes on the ball'),sf=T(1,'standing foot'),bi=T(1,'beside it'),la=T(1,'laces'),tm=T(1,'through the middle'),ft=T(1,'follows through'),tg=T(1,'toward the goal');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "toward the goal": the ball's rising line to the top corner
  airTrail(s,c,0,FL,Y,{progress:sm(tg-.2,tg+.6,t,easeOut),cov:.95*(1-sm(E-.7,E-.3,t)),wm:.09,seed:95});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(tm-.1,tm+.2,t)*(1-sm(tm+.9,tm+1.3,t)),trail:1});
  const hero=w.res.get(EUS);
  if(hero){
   // "eyes on the ball": a dashed sight line from his eyes to the ball
   const ew=sm(eb-.1,eb+.4,t,easeOut)*(1-sm(sf,sf+.4,t));if(ew>.02){const bq=P(c,w.ball);laneArrow(s,Y,hero.joints.face,bq,Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:ew,seed:97,head:10,cov:.95});}
   // "standing foot beside it": a red ring round the planted left boot
   bootRing(s,hero.joints.lToe,hero.joints.lHeel,R,sm(sf-.1,bi+.2,t,easeOutBack)*(1-sm(la+.2,la+.6,t)),99);
   // "laces": a yellow ring on the top of the right boot as it meets the ball
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(la-.15,la+.2,t,easeOutBack)*(1-sm(ft,ft+.4,t)),101);
   // "follows through": the arc of the right boot, drawn behind it
   const fw=sm(ft-.1,ft+.7,t,easeOut)*(1-sm(E-.6,E-.2,t));if(fw>.02){const arc=toeArc(c,-.02,Math.min(.5,tau));if(arc.length>2){const wd=Math.max(5,kAt(c,w.ball)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:103,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:103,head:wd*3,cov:.95*fw});}}}
  // "through the middle": sparks where the laces meet the ball
  const ag=tp;if(ag>-.03&&ag<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*.9,{n:9,seed:105,g:easeOutBack(clamp((ag+.03)/.08))*(1-clamp((ag-.12)/.13)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:107,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
  reel(s,t,.8);},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse angle from behind the net): the ball comes at us, the keeper can't reach it, four goals =================
const tau3=(t:number)=>{const E=SEC(2),tk=T(2,'The keeper'),cr=T(2,'can\'t reach it'),sf=T(2,'Eusébio scores four');
 return key(t,mono([[0,-.35],[tk+.2,.12],[cr+.4,IN_NET+.05],[sf,IN_NET+1.2],[E,IN_NET+1.2+(E-sf)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(EUS,tau),cel=sm(IN_NET+.4,IN_NET+1.8,tau,easeInOutSine);
 const look=mix3([-8,1.3,.3],[x+1.5,1.2,z],cel);
 return cam([lerp(4.6,3.4,cel),lerp(1.55,1.8,cel),lerp(-2.4,-1.2,cel)],look,key(t,mono([[0,1500],[T(2,'can\'t reach it'),1650],[E,2300]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_NET,E=SEC(2),tk=T(2,'The keeper'),sf=T(2,'Eusébio scores four'),pw=T(2,'Portugal win'),fv=T(2,'five-three');frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "the keeper": a red ring on the grass where he stands, then his reach
  const gw=sm(tk-.1,tk+.3,t,easeOutBack)*(1-sm(tk+1.1,tk+1.5,t)),[kx,kz]=posOf(GKI,tau);groundRing(s,c,kx,kz,1.1,1.1,.07,R,.95*clamp(gw),109);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  // "can't reach it": the gap between his glove and the ball
  const gk=w.res.get(GKI),cr=T(2,'can\'t reach it'),cw=sm(cr-.1,cr+.3,t)*(1-sm(cr+1.2,cr+1.6,t));
  if(gk&&cw>.02&&depthOf(c,w.ball)>NEAR){const q=P(c,w.ball),hnd=gk.joints.rHa;laneArrow(s,R,hnd,[lerp(hnd[0],q[0],.8),lerp(hnd[1],q[1],.8)],Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:cw,seed:111,head:12,cov:.95});}
  // "scores four": four balls pop along the top of the frame, one per goal; "five-three": the fifth
  for(let i=0;i<5;i++){const at=i<4?sf+.25*i:fv,g=easeOutBack(clamp((t-at)/.25))*(1-sm(E-.5,E-.15,t));if(g<=.02)continue;const r=s.H*.045*g,x=(i-2)*s.H*.13,y=-s.H*.36;
   if(i===4){s.stroke(Y,polyPath(Array.from({length:20},(_,k)=>[x+Math.cos(k/20*TAU)*r*1.5,y+Math.sin(k/20*TAU)*r*1.5] as Pt),true),r*.25,.9);}
   ball(s,x,y,r,i*.8);}
  // "Portugal win": red flashes of the crowd's rosettes
  const pwg=sm(pw-.1,pw+.4,t)*(1-sm(E-.5,E-.2,t));if(pwg>.02){const r=rng(500+Math.floor(tt*12)),fp=new Path2D();for(let i=0;i<8;i++){const x=(r()-.5)*s.W*.9,y=(r()-.5)*s.H*.3-s.H*.2,z=8+r()*10;fp.addPath(polyPath([[x,y-z],[x+z*.3,y],[x,y+z],[x-z*.3,y]],true));}s.knockout(fp,pwg);}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:113,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  reel(s,t,.8);},
 aperture(t){const c=cam3(t),[x,z]=posOf(EUS,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a low side camera): hit it with your laces, follow through toward the goal =================
const tau4=(t:number)=>{const E=SEC(3),hi=T(3,'hit it'),wl=T(3,'with your laces'),ft=T(3,'follow through'),tg=T(3,'toward the goal');
 return key(t,mono([[0,-1.1],[hi,-.55],[wl+.3,-.02],[ft,.03],[ft+.5,.2],[tg+.3,.45],[E,.62]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[x,z]=posOf(EUS,clamp(tau,-1.2,.7)),push=sm(T(3,'hit it')-.3,T(3,'with your laces'),t,easeInOutSine),follow=sm(T(3,'follow through')-.3,E-.4,t,easeInOutSine);
 const look:V3=[x+1.2+.9*follow,.9+.15*follow,z-.5*follow];
 return cam([x-1.2+1*push,1.15+.3*follow,z+6.8-1.4*push+2.5*follow],look,2200+350*push-1150*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),hi=T(3,'hit it'),wl=T(3,'with your laces'),ft=T(3,'follow through'),tg=T(3,'toward the goal');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  // "hit it": a ring on the grass round the ball
  groundRing(s,c,M[0],M[2],.6,.6,.06,Y,.95*sm(hi-.1,hi+.3,t,easeOutBack)*(1-sm(wl+.2,wl+.6,t)),115);
  // "toward the goal": the line to goal and the lit goal mouth
  const gw=sm(tg-.2,tg+.6,t,easeOut)*(1-sm(E-.5,E-.15,t));
  airTrail(s,c,0,FL,Y,{progress:gw,wm:.1,seed:117});goalMouth(s,c,gw*.85);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1,only:[EUS,GKI]});
  const hero=w.res.get(EUS);
  if(hero){
   // "with your laces": the top of the boot lit
   bootRing(s,hero.joints.rToe,hero.joints.rAn,Y,sm(wl-.15,wl+.25,t,easeOutBack)*(1-sm(ft,ft+.4,t)),119);
   // "follow through": the boot's arc up and through, red
   const fw=sm(ft-.1,ft+.6,t,easeOut)*(1-sm(E-.5,E-.15,t));if(fw>.02){const arc=toeArc(c,-.02,Math.min(.5,tau));if(arc.length>2){const wd=Math.max(6,kAt(c,w.ball)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:121,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:121,head:wd*3,cov:.95*fw});}}}
  const ag=tp;if(ag>-.03&&ag<.25){const q=P(c,M);sparkBurst(s,Y,q[0],q[1],kAt(c,M)*.8,{n:9,seed:123,g:easeOutBack(clamp((ag+.03)/.08))*(1-clamp((ag-.12)/.13)),width:9});}
  reel(s,t,.6);},
 still:4,
};

const story:RisoStory={
 id:'eusebio-signature-1966',format:'11v11',title:'Eusébio\'s rocket, 1966',
 theme:'Shooting with power: hit it with your laces and follow through toward the goal.',
 ageNote:'World Cup quarter-final, Portugal 5–3 North Korea, Goodison Park, Liverpool, 23 July 1966. Portugal were 3–0 down; Eusébio (24) scored four.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
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
