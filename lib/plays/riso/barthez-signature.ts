/** Fabien Barthez, signature: "the quick reflex save". The moment: France v Brazil, World Cup final, Stade de France, Saint-Denis,
 * 12 July 1998 (France won 3–0), the 56th minute with France 2–0 up: Rivaldo plays a free-kick short to Roberto Carlos, who runs to the
 * left edge of France's penalty area and crosses; the ball reaches Ronaldo on the right side, who shoots from about six metres, point
 * blank — and Barthez, having closed the angle, stops it and holds it.
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage), printed as
 * a riso sheet. Kind: nobody is blamed; the collision with Ronaldo earlier in the match and Ronaldo's illness are not narrated.
 *
 * WHY THIS MOMENT: Barthez's entry is a signature (a trait, not one match). His best-known stage is the 1998 final, and this is its most
 * clearly described reaction save: a point-blank shot from the world's best striker ("frappe des six mètres, à bout portant. Le but est
 * inévitable et pourtant Barthez bloque impeccablement le ballon" — chroniquesbleues.fr, which adds that the final was probably won morally
 * at that instant). Wikipedia's Barthez article describes him as "extremely agile and possessed excellent reflexes, which enabled him to
 * produce spectacular, acrobatic and decisive reaction saves". His lesson — "stay on your toes before a shot so you can spring either way" —
 * is what the replay shows: set on his toes while the cross comes over, shuffle across, close the angle, then spring.
 *
 * SOURCES (read Sept 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "1998 FIFA World Cup final" (wiki-1998-wc-final.txt): 12 July 1998, Stade de France; "Karembeu was shown a yellow card on
 *    55 minutes for a foul from behind on Cafu. Rivaldo took the resulting free-kick short towards Roberto Carlos, who ran to the left edge
 *    of the penalty area before crossing it in, where it reached Ronaldo. He shot from close range but Barthez saved." Line-ups and numbers
 *    (Barthez 16, Thuram 15, Leboeuf 18, Desailly 8, Lizarazu 3, Deschamps 7, Karembeu 19 (off 57'), Petit 17, Zidane 10, Djorkaeff 6;
 *    Brazil: Roberto Carlos 6, Ronaldo 9, Rivaldo 10, Bebeto 20, Denílson 19 (on 46'), Cafu 2, Dunga 8). Kit (football kit template):
 *    France blue shirts, white shorts, red socks; Brazil yellow shirts, blue shorts, white socks.  https://en.wikipedia.org/wiki/1998_FIFA_World_Cup_final
 *  - Bruno Colombari, "12 juillet 1998 : France-Brésil", chroniquesbleues.fr (chroniquesbleues-fra-bra-1998.txt): "Roberto Carlos centre de
 *    son aile gauche. Le ballon est récupéré par Ronaldo sur le côté droit, qui frappe des six mètres, à bout portant. Le but est inévitable
 *    et pourtant Barthez bloque impeccablement le ballon (56')."  https://www.chroniquesbleues.fr/12-juillet-1998-France-Bresil
 *  - Wikipédia (fr), "Finale de la Coupe du monde de football 1998" (frwiki-finale-cdm-1998.txt): "décalé par une transversale de Roberto
 *    Carlos, Ronaldo se trouve en position de frapper au but quasiment à bout portant. Mais fermant l'angle, Fabien Barthez bloque la frappe".
 *  - Wikipedia, "Fabien Barthez" (wiki-fabien-barthez.txt): number 16 shirt; "usually cut off the sleeves of his goalkeeping jersey";
 *    shaved head ("Le Divin Chauve"); Laurent Blanc kissed his head before matches in the tournament; excellent reflexes, reaction saves;
 *    Yashin Award 1998.
 * CONFIRMED by those pages: match, venue, date, minute (56), France 2–0 up at the time; Rivaldo's short free-kick to Roberto Carlos; Roberto
 *  Carlos on Brazil's LEFT, running to the left edge of the box and crossing across; Ronaldo on the RIGHT side, shooting from about six
 *  metres, point blank; Barthez closed the angle and blocked/held the shot cleanly; the kits; the numbers; Barthez's shaved head and his
 *  habit of short (cut-off) sleeves.
 * INFERRED (illustrative): the direction of play (France defend the left-hand goal, X = 0, in the second half, matching the vieira film's
 *  sides); every position, speed and timing between the beats; where the free-kick was taken; Rivaldo's and Roberto Carlos's kicking feet
 *  (left, their stronger feet) and Ronaldo's (right); Ronaldo's control touch before the shot; how far Barthez came off his line (about two
 *  metres) and his shuffle; the shot's height and that he springs low to his left to meet it and gathers it on the ground; the other players'
 *  positions (Desailly a step late on Ronaldo, Leboeuf with Bebeto, Thuram closing Roberto Carlos); Barthez's grey jersey (as in the vieira
 *  film), his gloves; Ronaldo's shaved head; Brazil's numbers left off; Brazil's green trim printed in blue; the night sky, the stadium as
 *  drawn, the crowd, the camera placements and lenses.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; never top-down): 1 = the high main-stand camera,
 * live, near real time, from the free-kick to the save, with the riso score graphic (2–0); 2 = TV slow-motion replay from a low camera by
 * the byline beside the goal: Barthez on his toes, the cross, the shuffle across, the angle closed; 3 = super-slow replay over Ronaldo's
 * shoulder: the shot, the spring, the block, the hold; 4 = the lesson from a low camera in front of the goal (on your toes, spring either
 * way). Every figure is the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). One simulation on one
 * clock τ (seconds; τ = 0 = Ronaldo's shot). Scenes read only (t); every action keys off cue times, so the recorded voice (VOICE →
 * withTiming) re-times the film; every random value is seeded. Inks: yellow, red, blue, navy. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,glowDisc} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets (≈3 words/s plus pauses), replaced by the measured Kokoro onsets once timing.json exists. `seconds` includes the
 * silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts with a
 * plain word (Kokoro splits contractions and hyphens). */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/3+(/\.\.\.$/.test(w)?.45:/[.!?]$/.test(w)?.32:/[,;:]$/.test(w)?.14:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`barthez film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py barthez-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/barthez-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-barthez-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/barthez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The save, live','World Cup final, 1998. France lead Brazil by two goals. Roberto Carlos races down the left and crosses. Ronaldo shoots from close range... but Fabien Barthez stops it!',
  ['World Cup final','France lead','Roberto Carlos','crosses','Ronaldo shoots','close range','Fabien Barthez','stops it']),
 prov('Watch again','Watch again, slowly. Barthez is up on his toes as the cross comes over. He shuffles across and steps out to close the angle.',
  ['Watch again','on his toes','the cross comes','He shuffles across','steps out','close the angle']),
 prov('Quick reflex','So close! A lightning reflex: he springs, blocks the shot, and holds on tight.',
  ['So close','lightning reflex','he springs','blocks the shot','holds on tight']),
 prov('Your turn','Your turn: before a shot, stay on your toes, so you can spring either way!',
  ['Your turn','before a shot','stay on your toes','spring either way']),
],VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('barthez: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys for key() made strictly increasing in time (the voice can squeeze two cues together) */
const mono=(K:number[][]):number[][]=>{let prev=-1e9;return K.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});};

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's arrival
 * scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number;vx:number;vy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60,vx:s.W/(2*z*s.arrival),vy:s.H/(2*z*s.arrival)});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (France's goal line at 0 in this half — Brazil attack −X — and Brazil's
 * at 105), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at
 * +Z, so Barthez's right is the near side and his left the far side; Brazil (facing −X) have their LEFT on the near side (Roberto Carlos)
 * and their RIGHT on the far side (Ronaldo). */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (the cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=16):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Stade de France at night: one oval bowl (three tiers, a band of boxes) under a floating oval roof
const CX=52.5,NS=60;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
const LOW=(b:number):[number,number]=>[2+19*b,1.6+10*b],MID=(b:number):[number,number]=>[23+11*b,15+9*b],UPP=(b:number):[number,number]=>[36+18*b,27+17*b];
type Bowl={low:V3[][];mid:V3[][];up:V3[][];box:V3[][];roof:V3[][];glass:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],mid:[],up:[],box:[],roof:[],glass:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.mid.push(Q(MID,0,1));o.up.push(Q(UPP,0,1));
  o.box.push([rim(a,21.5,11.8),rim(b,21.5,11.8),rim(b,23,15),rim(a,23,15)]);
  o.glass.push([rim(a,4,47),rim(b,4,47),rim(b,20,47.6),rim(a,20,47.6)]);
  o.roof.push([rim(a,20,47.6),rim(b,20,47.6),rim(b,58,46),rim(a,58,46)]);
  if(i%2===0)o.lamps.push(rim(a+(b-a)*.5,4.6,46.6));
  for(const [f,rows,sd] of [[LOW,7,0],[MID,5,4000],[UPP,7,8000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+sd,23);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** tricolour flags hung on the boxes band (vertical blue / white / red) and a few Brazil flags (yellow with a blue disc) */
const FLAGS:{i:number;kind:0|1}[]=[{i:2,kind:0},{i:6,kind:0},{i:10,kind:1},{i:14,kind:0},{i:18,kind:0},{i:23,kind:0},{i:27,kind:1},{i:32,kind:0},{i:36,kind:0},{i:41,kind:0},{i:46,kind:1},{i:51,kind:0},{i:55,kind:0}];
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = cameras), flags, roof, floodlights */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.5);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.42);
 const low=new Path2D(),mid=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),glass=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.mid[i],mid);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);add(BOWL.glass[i],glass);}
 // phone heat: one knockout for all three tiers, then the tier screens
 const tiers=new Path2D();tiers.addPath(low);tiers.addPath(mid);tiers.addPath(up);s.knockout(tiers);
 s.tone(B,low,.34);s.tone(K,low,.16);s.tone(B,mid,.4);s.tone(K,mid,.26);s.tone(B,up,.45);s.tone(K,up,.36);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,12),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.44?0:q.h<.64?1:q.h<.76?2:q.h<.86?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(B,inks[1],.9);s.fill(R,inks[2],.9);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.8);}
 s.knockout(box);s.fill(K,box,.75);
 const fw=new Path2D(),fb=new Path2D(),fr=new Path2D(),fy=new Path2D();
 for(const F of FLAGS){const a=F.i/NS*TAU,b=(F.i+.7)/NS*TAU,q=(u:number,w:number):V3=>rim(lerp(a,b,u),lerp(21.4,22.9,w),lerp(11.9,14.6,w)),Q=(u0:number,u1:number,w0=0,w1=1)=>quadP(c,[q(u0,w0),q(u1,w0),q(u1,w1),q(u0,w1)],12);
  const all=Q(0,1);if(!all||!inView(v,all[0],200))continue;
  if(F.kind===0){fw.addPath(polyPath(all,true));const l=Q(0,.33),r=Q(.67,1);if(l)fb.addPath(polyPath(l,true));if(r)fr.addPath(polyPath(r,true));}
  else{fw.addPath(polyPath(all,true));fy.addPath(polyPath(all,true));const d=Q(.35,.65,.3,.7);if(d)fb.addPath(polyPath(d,true));}}
 s.knockout(fw);s.fill(Y,fy,.95);s.fill(B,fb,.95);s.fill(R,fr,.95);
 const cover=new Path2D();cover.addPath(glass);cover.addPath(roof);s.knockout(cover);s.tone(B,glass,.25);
 s.tone(K,roof,.66);s.tone(B,roof,.3);
 const lamps=new Path2D(),glows:[Pt,number][]=[];
 for(const P of BOWL.lamps){const d=toCam(c,P);if(d[2]<20)continue;const g=scr(c,d);if(!inView(v,g,200))continue;const w=c.F*2.6/d[2],h=c.F*.7/d[2];lamps.rect(g[0]-w/2,g[1]-h/2,w,h);if(glows.length<4&&!s._passage.pending)glows.push([g,Math.max(8,c.F*1.8/d[2])]);}
 s.knockout(lamps);s.fill(Y,lamps,.95);for(const [g,r] of glows)glowDisc(s,Y,g[0],g[1],r,{steps:2,glow:1,seed:Math.round(g[0])});
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (France's goal at X = 0 is always behind the players
 * in these cameras, so it prints before them) */
function ground(s:Sheet,c:Cam){
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);
 if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);if(g.length>2)p.addPath(polyPath(g,true));s.tone(K,p,.32,undefined,'evenodd');s.tone(B,p,.24,undefined,'evenodd');}
 if(g.length<3)return;const gp=polyPath(g,true);
 s.fill(Y,gp,.95);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // boards: far touchline and behind both goals — navy with paper and red panels
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D();
 for(const q of [polyP(c,[[-4,0,-36],[109,0,-36],[109,.9,-36],[-4,.9,-36]]),polyP(c,[[108.5,0,-34],[108.5,0,34],[108.5,.9,34],[108.5,.9,-34]]),polyP(c,[[-3.5,0,34],[-3.5,0,-34],[-3.5,.9,-34],[-3.5,.9,34]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.22,-35.95],[x+3.6,.22,-35.95],[x+3.6,.68,-35.95],[x,.68,-35.95]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-33+k*6.2;for(const X of [108.45,-3.45]){const q=polyP(c,[[X,.22,z],[X,.22,z+3.6],[X,.68,z+3.6],[X,.68,z]]);if(q.length>2)(k%3?pn:pr2).addPath(polyPath(q,true));}}
 s.knockout(bd);s.fill(K,bd,.9);const pan=new Path2D();pan.addPath(pn);pan.addPath(pr2);s.knockout(pan,.85);s.fill(R,pr2,.95);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const g0=toCam(c,[0,1.2,0]);if(g0[2]>NEAR&&Math.abs(c.F*g0[0]/g0[2])<3000)goal3(s,c,0,-1);
 const g1=toCam(c,[105,1.2,0]);if(g1[2]>NEAR&&Math.abs(c.F*g1[0]/g1[2])<3200)goal3(s,c,105,1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep (direction d) */
function goal3(s:Sheet,c:Cam,X:number,d:number){
 const z0=-3.66,z1=3.66,H=2.44,bk=X+d*2;
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk,1.9,z0],[bk,0,z0]],[[X,0,z1],[X,H,z1],[bk,1.9,z1],[bk,0,z1]],[[X,H,z0],[X,H,z1],[bk,1.9,z1],[bk,1.9,z0]],[[bk,0,z0],[bk,0,z1],[bk,1.9,z1],[bk,1.9,z0]]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bk,1.9,z],.025,mesh);seg3(c,[bk,1.9,z],[bk,0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)seg3(c,[bk,y,zs[i]],[bk,y,zs[i+1]],.025,mesh);seg3(c,[X,y*H/1.9,z0],[bk,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bk,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[R,.75],[Y,.2]];
const SKIN_M:InkFill[]=[[R,.78],[Y,.3]];
const SKIN_D:InkFill[]=[[R,.8],[K,.3]];
/** France in the final: blue shirts, WHITE shorts, red socks (confirmed); red trim and white numbers inferred */
const FRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:R,boots:K,trim:R,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Brazil: yellow shirts, blue shorts, white socks (confirmed); the green trim printed in blue (no green ink); numbers left off (inferred) */
const BRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,trim:B,skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:3,...o,number:null});
/** Fabien Barthez, number 16 (confirmed), shaved head (confirmed), his cut-off SHORT sleeves (his habit, confirmed); the grey jersey,
 * navy shorts and yellow gloves are inferred (as in the vieira film) */
const BARTHEZ_ST:AthleteStyle={shirt:[K,.4],shorts:K,socks:[K,.4],boots:K,skin:SKIN_L,hair:K,hairStyle:'bald',line:K,gloves:[Y,.7],sleeves:'short',trim:K,number:16,numberInk:K,build:{height:1.8},seed:52};
/** Roberto Carlos: short and powerful (1.68 m, big thighs) — build from his listed height; left-footed */
const RC_ST=BRA({seed:6,build:{height:1.68,bulk:1.06,thighs:1.25},hairStyle:'bald',skin:SKIN_D});
/** Ronaldo: 1.83 m, shaved head (inferred) */
const RONALDO_ST=BRA({seed:9,build:{height:1.83,bulk:1.02},hairStyle:'bald',skin:SKIN_M});
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.8],hairStyle:'short',line:K,trim:'paper',build:{height:1.8},seed:12};
/** the lesson's teaching ghosts: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.6],shorts:[Y,.6],socks:[Y,.6],boots:[Y,.6],skin:[[Y,.6]],hair:[Y,.6],gloves:[Y,.6],line:Y,shade:null,shadow:false,sleeves:'short',hairStyle:'bald',build:{height:1.8},seed:52};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose and place one drawing earlier (secondary motion: shirt hem trails); smear = the halftone echo + speed arcs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the simulation: keyed actors, 50 Hz tables, the ball as legs (τ = 0: Ronaldo's shot)
type Role='gk'|'fra'|'bra'|'ref';
type Move={kind:'kick'|'lunge';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean;carry?:[number,number,'l'|'r']};
type Tab={X:number[];Z:number[];P:number[];D:number[]};
type Leg={t0:number;t1:number;a:V3;b:V3;lift?:number;bend?:number;ease?:(u:number)=>number};
const DT=.02,T0=-9,T1=6;
/** the beats (τ, seconds): Rivaldo's short free-kick, Roberto Carlos takes it, the cross, Ronaldo's control, the shot, the block */
const FK=-6.2,FK_IN=-5.3,CROSS=-1.6,CTRL=-.55,SHOT=0,BLOCK=.24;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** Barthez's spot at the shot: about two metres off his line toward his left post, on the line between Ronaldo and the goal (inferred) */
const BAR_SPOT:[number,number]=[2.25,-2.45];
const ACTORS:Actor[]=[
 {name:'Barthez',role:'gk',style:BARTHEZ_ST,key:true,
  keys:[[-9,1,.6],[-6.2,1.05,1],[-4,1.2,1.7],[-2.2,1.45,2.3],[CROSS,1.5,2.25],[-1.05,1.6,.7],[CTRL,1.85,-1],[-.22,2.2,-2.3],[SHOT,BAR_SPOT[0],BAR_SPOT[1]],[6,BAR_SPOT[0],BAR_SPOT[1]]]},
 {name:'Ronaldo',role:'bra',style:RONALDO_ST,key:true,moves:[{kind:'kick',at:CTRL,dur:.5,side:'r',power:.1},{kind:'kick',at:SHOT,dur:.8,side:'r',power:.75}],
  keys:[[-9,14.5,-4.2],[-6,13.4,-4.8],[-4,11.8,-5.6],[CROSS,9,-6.2],[-1,7.6,-5.8],[CTRL,6.7,-5.4],[-.25,6.35,-5.2],[SHOT,6.2,-5.1],[.6,5.6,-4.7],[2,5.2,-4.2],[6,6,-3]]},
 {name:'Roberto Carlos',role:'bra',style:RC_ST,key:true,carry:[FK_IN,CROSS,'l'],moves:[{kind:'kick',at:CROSS,dur:.8,side:'l',power:.7}],
  keys:[[-9,33.4,17.2],[-6.3,32.9,17.6],[FK_IN,31.6,18.2],[-4,27.6,19.2],[-2.8,23,20],[CROSS,18.6,20.6],[-1,16.8,20.4],[SHOT,14.4,19.6],[2,12,18],[6,11,17]]},
 {name:'Rivaldo',role:'bra',style:BRA({seed:10,build:{height:1.86}}),key:true,moves:[{kind:'kick',at:FK,dur:.7,side:'l',power:.3}],
  keys:[[-9,38.2,10.2],[-7,38,10.4],[FK,37.4,10.9],[-5,35,11.5],[-2,27,9],[SHOT,21,6],[2,18,4.5],[6,16,4]]},
 {name:'Bebeto',role:'bra',style:BRA({seed:20,build:{height:1.77},skin:SKIN_D}),keys:[[-9,17,3.5],[-4,14,3.8],[CROSS,11.2,3.4],[SHOT,9.4,2.2],[2,9,2],[6,10,2]]},
 {name:'Denilson',role:'bra',style:BRA({seed:19,skin:SKIN_D}),keys:[[-9,25,-18],[-4,20,-16],[CROSS,16,-14],[SHOT,13.2,-12],[2,12.5,-11],[6,13,-10]]},
 {name:'Dunga',role:'bra',style:BRA({seed:8,hairStyle:'long'}),keys:[[-9,42,3],[-4,37,4],[SHOT,31,4],[6,30,4]]},
 {name:'Sampaio',role:'bra',style:BRA({seed:5,skin:SKIN_D}),keys:[[-9,46,-8],[-4,41,-7.5],[SHOT,36,-7],[6,35,-7]]},
 {name:'Cafu',role:'bra',style:BRA({seed:2,skin:SKIN_D}),keys:[[-9,42,-26],[-4,37,-25],[SHOT,30,-24],[6,29,-23]]},
 // France: Desailly a step late on Ronaldo, Leboeuf with Bebeto, Thuram closing Roberto Carlos, the rest dropping back (all inferred)
 {name:'Desailly',role:'fra',style:FRA({number:8,skin:SKIN_D,hairStyle:'bald',build:{height:1.85,bulk:1.06},seed:8}),key:true,
  keys:[[-9,15.6,-5.4],[-4,12.8,-6],[CROSS,10.2,-5.6],[CTRL,8.3,-4.4],[SHOT,7.8,-3.9],[.5,7.1,-3.6],[2,7,-3.4],[6,8,-3]]},
 {name:'Leboeuf',role:'fra',style:FRA({number:18,hairStyle:'balding',seed:18}),keys:[[-9,15,1.2],[-4,12.5,2],[CROSS,10,2.6],[SHOT,8.4,1.4],[2,8,1],[6,9,1]]},
 {name:'Thuram',role:'fra',style:FRA({number:15,skin:SKIN_D,seed:15}),key:true,moves:[{kind:'lunge',at:CROSS+.05,dur:.8,side:'r'}],
  keys:[[-9,28.5,21.2],[-6,27.4,21.4],[-4,25.4,21.4],[-2.8,21.4,21.3],[CROSS,19.9,21.1],[SHOT,17.4,20.4],[2,15.4,19.6],[6,14,18]]},
 {name:'Lizarazu',role:'fra',style:FRA({number:3,seed:3}),keys:[[-9,18.5,-13],[-4,15,-11.5],[CROSS,12,-10],[SHOT,9.8,-8.6],[2,9,-8],[6,10,-7]]},
 {name:'Deschamps',role:'fra',style:FRA({number:7,seed:7}),keys:[[-9,27,2],[-4,23.5,1.6],[CROSS,20,1],[SHOT,18,0],[2,17,0],[6,18,0]]},
 {name:'Petit',role:'fra',style:FRA({number:17,hair:[Y,.9],hairStyle:'ponytail',build:{height:1.85},seed:17}),keys:[[-9,31,-6],[-4,26,-5.5],[SHOT,21.5,-5],[2,20.5,-5],[6,21,-5]]},
 {name:'Karembeu',role:'fra',style:FRA({number:19,skin:SKIN_D,seed:19}),keys:[[-9,35,13.5],[-4,29,12.8],[CROSS,24.5,12],[SHOT,22,11],[2,21,11],[6,22,11]]},
 {name:'Zidane',role:'fra',style:FRA({number:10,hairStyle:'balding',seed:10}),keys:[[-9,43,-2],[-4,38,-2.5],[SHOT,33,-3],[6,32,-3]]},
 {name:'Djorkaeff',role:'fra',style:FRA({number:6,seed:6}),keys:[[-9,45,12],[-4,40,11],[SHOT,37,10],[6,36,10]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-9,33,-4],[-4,27,-7],[SHOT,20,-9],[6,19,-9]]},
];
const BAR=0,RON=1,RC=2,RIV=3;
/** per-actor tables at 50 Hz: position, gait phase (stride grows with speed: jog ≈ 2.4 m per cycle, sprint ≈ 4.6 m) and distance */
const TABS:Tab[]=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],P:number[]=[],D:number[]=[];let ph=0,d=0,px=0,pz=0;
 for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i){const dd=Math.hypot(x-px,z-pz),sp=dd/DT;ph+=dd/(2.2+2.4*clamp(sp/8));d+=dd;}X.push(x);Z.push(z);P.push(ph);D.push(d);px=x;pz=z;}return{X,Z,P,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABS[k].X,tau),samp(TABS[k].Z,tau)];
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a boot spot: ahead of the body and a touch to the given side (right = +Z when facing +X) */
function bootAt(k:number,tau:number,side:'l'|'r',yaw?:number,ahead=.5):V3{const p=posOf(k,tau),y=yaw??headOf(k,tau),s=side==='r'?1:-1;return[p[0]+Math.cos(y)*ahead+Math.sin(y)*.13*s,.11,p[1]-Math.sin(y)*ahead+Math.cos(y)*.13*s];}
/** Ronaldo squared up to the goal for the control and the shot; Barthez faces the shooter from the set step on */
const RON_SHOT=posOf(RON,SHOT);
const RON_YAW=yawOf(0-RON_SHOT[0],-1.6-RON_SHOT[1]);
const BAR_YAW=yawOf(RON_SHOT[0]-BAR_SPOT[0],RON_SHOT[1]-BAR_SPOT[1]);
/** Rivaldo's free-kick heading: toward Roberto Carlos's first touch */
const RIV_YAW=(()=>{const a=posOf(RIV,FK),b=posOf(RC,FK_IN);return yawOf(b[0]-a[0],b[1]-a[1]);})();

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const MARK=posed({lHipF:38,rHipF:32,lKnee:52,rKnee:48,lHipA:14,rHipA:12,lean:20,pitch:5,lShA:48,rShA:40,lShF:24,rShF:10,lElb:56,rElb:50,neckP:-14});
/** Barthez's reflex: a low spring to his LEFT (inferred side and height), full stretch just after the block; then the gather and the get-up */
const DIVE0=-.04,DIVE_DUR=.54;
const DIVE=(tau:number)=>keeperDive(clamp((tau-DIVE0)/DIVE_DUR),{side:'l',height:.2});
/** the ball pulled into his chest with both arms (on the grass, then standing) */
const GATHER:Partial<Pose>={lShF:62,rShF:62,lShA:22,rShA:22,lShR:34,rShR:34,lElb:118,rElb:118,lHand:.8,rHand:.8,neckP:24};
const HOLD=posed({...GATHER,lHipF:14,rHipF:10,lKnee:18,rKnee:16,lean:10,pitch:3,neckP:8} as Partial<Pose>);
const DIVE_END=DIVE(DIVE0+DIVE_DUR);
const GET_UP=1.9,UP_END=2.8;
/** Barthez at τ: set on his toes (bouncing), the side-shuffle across his area, a small set step as Ronaldo shoots, the spring, the hold */
function barthez(tau:number):{p:Pose;yaw:number;x:number;z:number}{
 const[x,z]=posOf(BAR,tau);
 if(tau<DIVE0){
  const b=ballAt(tau);let yaw=yawOf(b[0]-x,b[2]-z);yaw=lerpA(yaw,BAR_YAW,sm(-.5,-.15,tau));
  let p=keeperSet(tau*1.6);
  // the shuffle: feet in and out (never crossing), a light hop with each step, weight on the toes
  const v=velOf(BAR,tau),sp=Math.hypot(v[0],v[1]),ph=samp(TABS[BAR].D,tau)/.85,sw=Math.sin(TAU*ph);
  p=over(p,{lHipA:16+15*sw,rHipA:16-15*sw,air:.06*Math.abs(sw),lAnk:12,rAnk:12},clamp(sp/1.6));
  // the set step: a tiny hop, landing low and balanced just before the shot
  p=over(p,{air:.07,lKnee:48,rKnee:48},bump(-.36,-.18,tau));p=over(p,{lKnee:70,rKnee:70,lHipF:60,rHipF:60,air:0},bump(-.2,DIVE0+.02,tau));
  return{p,yaw,x,z};}
 let p=DIVE(tau);
 p=over(p,GATHER,sm(BLOCK+.3,BLOCK+.9,tau,easeInOutSine));
 if(tau>GET_UP){const u=sm(GET_UP,UP_END,tau,easeInOutSine),q=blendPose(p,HOLD,u);q.dz=DIVE_END.dz;q.dx=DIVE_END.dx;p=q;}
 return{p,yaw:BAR_YAW,x,z};}
/** the ball in his gloves: between both hands, pushed a little out from the chest */
function inHands(tau:number):V3{const b=barthez(tau),sk=solve(b.p,BARTHEZ_ST.build,{x:b.x,z:b.z,yaw:b.yaw});
 const m:V3=[(sk.lHa[0]+sk.rHa[0])/2,(sk.lHa[1]+sk.rHa[1])/2,(sk.lHa[2]+sk.rHa[2])/2],d=nrm3(sub3(m,sk.chest)),g=sm(BLOCK+.3,BLOCK+.9,tau);
 return[m[0]+d[0]*lerp(.1,.02,g),Math.max(.11,m[1]+d[1]*lerp(.1,.02,g)),m[2]+d[2]*lerp(.1,.02,g)];}
/** where the ball meets his gloves (solved from the body at the block) */
const HANDS=inHands(BLOCK);

// ---------------------------------------------------------------- the ball: the free-kick, Roberto Carlos's carry, the cross, the control, the shot, held
const CYC=3;
/** Roberto Carlos's left-foot touches: one per dribble cycle of CYC metres, from the free-kick to the cross */
const TOUCHES:number[]=(()=>{const out:number[]=[FK_IN];let prev=samp(TABS[RC].D,FK_IN)/CYC-touchPhase;
 for(let tau=FK_IN+DT;tau<CROSS-.3;tau+=DT){const ph=samp(TABS[RC].D,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.34)out.push(tau);prev=ph;}
 return[...out,CROSS];})();
const LEGS:Leg[]=(()=>{
 const fk=bootAt(RIV,FK,'l',RIV_YAW),L:Leg[]=[{t0:FK,t1:FK_IN,a:fk,b:bootAt(RC,FK_IN,'l'),ease:(u:number)=>1-Math.pow(1-u,1.4)}];
 for(let i=0;i+1<TOUCHES.length;i++)L.push({t0:TOUCHES[i],t1:TOUCHES[i+1],a:bootAt(RC,TOUCHES[i],'l'),b:bootAt(RC,TOUCHES[i+1],'l'),ease:easeOut});
 const cr=bootAt(RC,CROSS,'l'),rc=bootAt(RON,CTRL,'r',RON_YAW),sh=bootAt(RON,SHOT,'r',RON_YAW);
 L.push({t0:CROSS,t1:CTRL,a:cr,b:rc,lift:1.3,bend:-1.4,ease:(u:number)=>u*(1.1-.1*u)},{t0:CTRL,t1:SHOT,a:rc,b:sh,lift:.08,ease:easeOut},
  {t0:SHOT,t1:BLOCK,a:sh,b:HANDS,ease:(u:number)=>u*(1.08-.08*u)});
 return L;})();
function ballAt(tau:number):V3{
 if(tau>=BLOCK)return inHands(tau);
 if(tau<LEGS[0].t0)return LEGS[0].a;
 for(let i=0;i<LEGS.length;i++){const g=LEGS[i],next=LEGS[i+1];if(next&&tau>=next.t0)continue;
  if(tau>=g.t1)return g.b;
  const u=clamp((tau-g.t0)/(g.t1-g.t0)),e=(g.ease??linear)(u),dx=g.b[0]-g.a[0],dz=g.b[2]-g.a[2],l=Math.hypot(dx,dz)||1,bw=(g.bend??0)*4*e*(1-e);
  return[lerp(g.a[0],g.b[0],e)+dz/l*bw,lerp(g.a[1],g.b[1],e)+(g.lift??0)*4*e*(1-e),lerp(g.a[2],g.b[2],e)-dx/l*bw];}
 return LEGS[LEGS.length-1].b;}

/** the whole pose of actor k at τ, with its place */
function poseOf(k:number,tau:number):{p:Pose;yaw:number;x:number;z:number}{
 if(k===BAR)return barthez(tau);
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(k===RON)yaw=lerpA(yaw,RON_YAW,sm(-1.1,-.7,tau));
 if(k===RIV&&tau<FK+.4)yaw=RIV_YAW;
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='fra'&&x<20?MARK:a.role==='bra'?READY:stand();
 if(a.carry&&tau>a.carry[0]&&tau<a.carry[1]+.1){const s=clamp((sp-2)/4.5),dr=dribble(samp(TABS[k].D,tau)/CYC,{foot:a.carry[2],speed:.45+.45*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(samp(TABS[k].D,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(samp(TABS[k].P,tau),{speed:a.key?.2+.8*s:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='kick'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='kick'&&u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.5}),Math.min(sm(0,.14,u),1-sm(1.05,1.5,u)));
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 // after the save: Ronaldo's hands to his head (so close), then he turns away
 if(k===RON&&tau>BLOCK+.25)p=over(p,{lShF:150,rShF:150,lShA:40,rShA:40,lElb:120,rElb:120,neckP:-16,lean:-4},bump(BLOCK+.25,3.4,tau));
 return{p,yaw,x,z};
}

// ---------------------------------------------------------------- the ball print: the 1998 "Tricolore" (paper, blue triads with red accents)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),acc=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number,into:Path2D)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.42,cy+Math.sin(b)*pr0*.42]);}into.addPath(polyPath(q,true));};
 tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot,pan);
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a,pan);}
 s.fill(B,pan,.95);
 if(r>9){tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.14,rot,acc);s.fill(R,acc,.95);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;ron?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion). The hero is Barthez.
 * Once he has the ball it prints straight after him (it is in his gloves). */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;only?:number[];before?:()=>void;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.6)&&!inView(v,[g[0],g[1]-h],h*1.6))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tauP>=BLOCK?tauP:tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]),held=tauP>=BLOCK;
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.15,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg&&!held)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=held?false:!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,ronR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&!held&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  // phone heat: during a passage (two scenes on one sheet) the tiny extras are left out
  if(passing&&!a.key&&px<60)continue;
  const{p,yaw}=poseOf(e.k,tauP);
  const detail=passing?(e.k===BAR?'mid':'low'):px<50||(e.k!==BAR&&px<(a.key?72:110))?'low':'auto';
  let prev:{pose:Pose;place:Place}|undefined;
  if(big&&(e.k===BAR||e.h>520)&&!passing){const q=poseOf(e.k,tauPrev);prev={pose:q.p,place:{x:q.x,z:q.z,yaw:q.yaw}};}
  const st:AthleteStyle={...a.style,shadow:e.h<420?false:undefined,detail};
  const fast=e.k===BAR&&tauP>DIVE0&&tauP<BLOCK+.35;
  const r=drawPlayer(s,p,c,st,{x:e.x,z:e.z,yaw},{prev,smear:hero&&fast&&!!prev});
  if(e.k===BAR){heroR=r;if(held){drawBall();ballDone=true;}}
  if(e.k===RON)ronR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,ron:ronR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- the broadcast score graphic (top-left): FRA ▢ 2 – 0 ▢ BRA
function digit(n:number,x:number,y:number,w:number,h:number):Pt[]{
 if(n===1)return[[x+w*.2,y+h*.22],[x+w*.55,y],[x+w*.55,y+h]];
 if(n===2)return[[x,y+h*.25],[x+w*.2,y+h*.03],[x+w*.6,y],[x+w*.95,y+h*.22],[x+w*.8,y+h*.5],[x,y+h],[x+w,y+h]];
 const o:Pt[]=[];for(let i=0;i<=20;i++){const a=i/20*TAU;o.push([x+w/2+Math.sin(a)*w*.48,y+h/2-Math.cos(a)*h*.5]);}return o;}
function scoreBug(s:Sheet,v:View,fra:number,bra:number,w=1){if(w<=0)return;
 const u=Math.min(v.vx,v.vy)*.075,x0=-v.vx+u*.9,y0=-v.vy+u*.9,W=u*6.4,H=u*1.9;
 const plate=polyPath([[x0,y0],[x0+W,y0],[x0+W+u*.35,y0+H],[x0,y0+H]],true);s.knockout(plate,.9*w);s.fill(K,plate,.9*w);
 const fc=rectPath(x0+u*.35,y0+u*.45,u*1,u*1);s.knockout(fc,w);s.fill(B,fc,.95*w);s.fill(R,rectPath(x0+u*1.15,y0+u*.45,u*.2,u),.95*w);
 const bc=rectPath(x0+W-u*1.35,y0+u*.45,u,u);s.knockout(bc,w);s.fill(Y,bc,.95*w);const dc=new Path2D();dc.arc(x0+W-u*.85,y0+u*.95,u*.28,0,TAU);s.fill(B,dc,.95*w);
 const dh=u*1.05,dw=u*.62,cy=y0+(H-dh)/2,st=Math.max(2.5,u*.16);
 s.knockout(ribbon(digit(fra,x0+u*1.75,cy,dw,dh),st,{seed:3,taper:0,wobble:.4}),w);s.knockout(ribbon(digit(bra,x0+W-u*2.4,cy,dw,dh),st,{seed:4,taper:0,wobble:.4}),w);
 s.knockout(ribbon([[x0+W/2-u*.3,y0+H/2],[x0+W/2+u*.3,y0+H/2]],st,{seed:5,taper:0}),w);
}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a ground point (metres), ribbon width in metres */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,wm:number,ink:string,w:number,seed=7){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rx,0,z+Math.sin(i/36*TAU)*rz]);if(q)pts.push(q);}if(pts.length<30)return;
 const q=toCam(c,[x,0,z]);if(q[2]<NEAR)return;const rr=ribbon(pts,Math.max(5,c.F*wm/q[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass along ground points (metres) */
function groundArrow(s:Sheet,c:Cam,pts3:[number,number][],wm:number,ink:string,w:number,seed=61){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const [x,z] of pts3){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}if(pts.length<2)return;
 const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*wm/d;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
const pathOf=(k:number,t0:number,t1:number,n=10):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(t0,t1,i/n)));return o;};
/** the flight of the ball as a dotted line (from τ0 to τ1) */
function flightDots(s:Sheet,c:Cam,t0:number,t1:number,ink:string,w:number,size=.045,minR=3.5){if(w<=0||t1<=t0)return;const dots=new Path2D();let n=0;
 for(let i=0;i<=22;i++){const b=ballAt(t0+(t1-t0)*i/22),q=toCam(c,b);if(q[2]<1)continue;const g=scr(c,q),r=Math.max(minR,c.F*size/q[2]);dots.moveTo(g[0]+r,g[1]);dots.arc(g[0],g[1],r,0,TAU);n++;}
 if(n)s.fill(ink,dots,.85*w);}
/** a ring round a drawn point (a boot, the gloves) */
function jointRing(s:Sheet,p:Pt,r:number,ink:string,w:number,seed=82){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([p[0]+Math.cos(a)*r*1.2,p[1]+Math.sin(a)*r*.85]);}
 s.fill(ink,ribbon(pts,Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** the shooting angle: a halftone wedge on the grass from the shooter's boot to both posts; the part Barthez covers printed solid */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number){if(w<=0)return;
 const q=polyP(c,[[from[0],.02,from[1]],[0,.02,-3.66],[0,.02,3.66]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.55*w);
 const e=new Path2D();seg3(c,[from[0],.02,from[1]],[0,.02,-3.66],.07,e);seg3(c,[from[0],.02,from[1]],[0,.02,3.66],.07,e);s.fill(Y,e,.95*w);}
/** a lightning bolt between two screen points (the reflex) */
function bolt(s:Sheet,a:Pt,b:Pt,wd:number,w:number,seed=5){if(w<=0)return;const r=rng(seed),pts:Pt[]=[a],n=6,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 for(let i=1;i<n;i++){const u=i/n,j=(i%2?1:-1)*(.08+.06*r())*l;pts.push([a[0]+dx*u+nx*j,a[1]+dy*u+ny*j]);}pts.push(b);
 const m=Math.max(2,Math.round(pts.length*clamp(w*1.4))),seg=pts.slice(0,m),rb=ribbon(seg,wd,{seed,taper:.3,wobble:.5});s.stroke(K,rb,3,.8);s.knockout(rb);s.fill(Y,rb,.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, the free-kick to the save
/** τ from chapter time: the free-kick on "France lead", Roberto Carlos on his name, the cross on "crosses", the shot just after "close range",
 * the block on "Fabien Barthez" — about real time from the free-kick on */
const tau1=(t:number)=>{const S=SECS(0),FB=CUEW(0,'Fabien Barthez');return key(t,mono([[0,-8],[CUEW(0,'France lead'),FK-.1],[CUEW(0,'Roberto Carlos'),-3.9],[CUEW(0,'crosses'),CROSS],[CUEW(0,'Ronaldo shoots'),CTRL+.05],[CUEW(0,'close range'),-.12],[FB,BLOCK],[CUEW(0,'stops it'),.8],[S+1,.8+(S+1-CUEW(0,'stops it'))*.9]]),linear);};
const CAM1:V3=[52.5,27,78];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0),cr=CUEW(0,'crosses'),FB=CUEW(0,'Fabien Barthez');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // leads the carry a little toward the box; from the cross on, framed on the goalmouth (Ronaldo and Barthez)
 const follow:V3=[bt[0]-6,1.4,bt[2]*.75],mouth:V3=[4.2,1,-2.6];
 const T=lerp3(follow,mouth,sm(cr-.4,cr+1.1,t,easeInOutSine));
 const F=key(t,mono([[0,4600],[CUEW(0,'France lead'),5000],[CUEW(0,'Roberto Carlos'),5400],[cr,6200],[CUEW(0,'Ronaldo shoots'),7800],[FB,9000],[FB+1.2,9400],[S,9000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),FB=CUEW(0,'Fabien Barthez'),si=CUEW(0,'stops it');
  stadium(s,c,v,t,{roar:sm(FB+.1,FB+.6,t)*.7,flash:sm(FB+.2,FB+.5,t)*.6*(1-sm(si+1,si+1.6,t))});
  ground(s,c);
  const rcq=CUEW(0,'Roberto Carlos'),cr=CUEW(0,'crosses'),rs=CUEW(0,'Ronaldo shoots');
  const[rx,rz]=posOf(RC,tau),[nx,nz]=posOf(RON,tau),[bx,bz]=posOf(BAR,tau);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,before:()=>{
   // "Roberto Carlos": a red ring runs with him down the left
   groundRing(s,c,rx,rz,1.3,1.3,.28,R,sm(rcq-.1,rcq+.3,t,easeOutBack)*(1-sm(cr+.2,cr+.6,t)),13);
   // "crosses": the cross as a dotted line; "Ronaldo shoots": a red ring on him
   flightDots(s,c,CROSS,Math.min(tau,CTRL),Y,sm(cr-.1,cr+.2,t)*(1-sm(FB+.2,FB+.7,t)),.2,6);
   groundRing(s,c,nx,nz,1.2,1.2,.26,R,sm(rs-.1,rs+.3,t,easeOutBack)*(1-sm(FB,FB+.4,t)),17);
   // "Fabien Barthez": a blue ring under the keeper
   groundRing(s,c,bx,bz,1.3,1.3,.28,B,sm(FB-.15,FB+.25,t,easeOutBack),19);}
  ,after:()=>{const age=tau-BLOCK;if(age>-.03&&age<.35){const q=pr(c,HANDS);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.1/Math.max(1,toCam(c,HANDS)[2]),{n:9,seed:57,g:1-sm(.2,.35,age),width:9});}}});
  scoreBug(s,v,2,0,sm(.3,.8,t));
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(BAR,tau1(t)),q=toCam(c,[x,.8,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(6,c.F*.16/q[2]),12);},
 still:8.9,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera by the byline beside the goal: on his toes, the shuffle, the angle closed
const tau2=(t:number)=>{const S=SECS(1);return key(t,mono([[0,-3.3],[CUEW(1,'on his toes'),-2.35],[CUEW(1,'the cross comes'),CROSS],[CUEW(1,'He shuffles'),-1.08],[CUEW(1,'steps out'),-.6],[CUEW(1,'close the angle'),-.2],[S,-.02]]),linear);};
function cam2(t:number):Cam{
 const S=SECS(1),u=sm(0,S,t,easeInOutSine),push=sm(CUEW(1,'He shuffles')-.3,CUEW(1,'close the angle'),t,easeInOutSine);
 const C:V3=[lerp(-2.7,-2.2,u),lerp(2.1,1.85,u),lerp(-13,-12,u)];
 const[bx,bz]=smooth(BAR,tau2(t)),wide=sm(CUEW(1,'the cross comes')-.6,CUEW(1,'the cross comes')+.6,t,easeInOutSine);
 // opens tight on Barthez's feet (on his toes), widens as the cross comes over, pushes in as he closes the angle
 const T:V3=[lerp(bx,lerp(bx+2.4,bx+2,push),wide),lerp(.55,.95,wide),lerp(bz,lerp(bz-1.6,bz-1.4,push),wide)];
 return look(C,T,lerp(4600,lerp(2300,2700,push),wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ot=CUEW(1,'on his toes'),cc=CUEW(1,'the cross comes'),hs=CUEW(1,'He shuffles'),so=CUEW(1,'steps out'),ca=CUEW(1,'close the angle'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const endFade=1-sm(E-.9,E-.6,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "the cross comes over": its flight dotted across the box
   flightDots(s,c,CROSS,Math.min(tau,CTRL),Y,sm(cc-.1,cc+.25,t)*(1-sm(hs+.6,hs+1,t)),.07,4);
   // "He shuffles across": his path as a yellow arrow; "steps out": a ring where he sets; "close the angle": the shooting wedge
   groundArrow(s,c,pathOf(BAR,CROSS,SHOT,10),.1,Y,sm(hs-.1,hs+.9,t,easeOut)*(1-sm(ca,ca+.4,t)),45);
   groundRing(s,c,BAR_SPOT[0],BAR_SPOT[1],.7,.7,.07,B,sm(so-.1,so+.3,t,easeOutBack)*endFade,31);
   angleWedge(s,c,posOf(RON,Math.max(tau,CTRL)),sm(ca-.15,ca+.45,t,easeOut)*endFade);}
  ,after:({hero})=>{
   // "on his toes": red rings on the balls of both feet, pulsing with his bounce
   if(hero){const w=sm(ot-.15,ot+.2,t,easeOutBack)*(1-sm(cc+.4,cc+.8,t));for(const [toe,an,sd] of [[hero.joints.lToe,hero.joints.lAn,84],[hero.joints.rToe,hero.joints.rAn,85]] as [Pt,Pt,number][])
    jointRing(s,[(toe[0]*2+an[0])/3,(toe[1]*2+an[1])/3],Math.hypot(toe[0]-an[0],toe[1]-an[1])*.9+3,R,w,sd);}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(BAR,tau2(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:7.6,
};

// ---------------------------------------------------------------- 3 · super-slow replay over Ronaldo's shoulder: the shot, the spring, the block, the hold
const tau3=(t:number)=>{const S=SECS(2);return key(t,mono([[0,-.5],[CUEW(2,'So close'),-.44],[CUEW(2,'lightning reflex'),SHOT-.02],[CUEW(2,'he springs'),.1],[CUEW(2,'blocks the shot'),BLOCK+.01],[CUEW(2,'holds on tight'),.95],[S,1.9]]),linear);};
function cam3(t:number):Cam{
 const S=SECS(2),push=sm(0,CUEW(2,'blocks the shot'),t,easeInOutSine),settle=sm(CUEW(2,'holds on tight')-.4,S,t,easeInOutSine);
 // behind Ronaldo's right shoulder (he is on the far side, facing the goal), low; a slow push toward the save
 const dx=-Math.cos(RON_YAW),dz=Math.sin(RON_YAW),rx=Math.sin(RON_YAW),rz=Math.cos(RON_YAW);// back (away from the goal) and his right side
 const back=lerp(4.6,3.9,push),side=1.7,C:V3=[RON_SHOT[0]+dx*back+rx*side,lerp(1.75,1.5,push),RON_SHOT[1]+dz*back+rz*side];
 const T:V3=lerp3([BAR_SPOT[0]+.4,.9,BAR_SPOT[1]-.5],[BAR_SPOT[0]-.3,.45,BAR_SPOT[1]-1.3],settle);
 return look(C,T,lerp(2300,2700,push));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sc=CUEW(2,'So close'),lr=CUEW(2,'lightning reflex'),hs=CUEW(2,'he springs'),bs=CUEW(2,'blocks the shot'),ht=CUEW(2,'holds on tight'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(bs,bs+.5,t)*.6,flash:sm(bs+.1,bs+.4,t)*.5*(1-sm(E-1,E-.6,t))});
  ground(s,c);
  const endFade=1-sm(E-.9,E-.55,t);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "So close": a red ring round Ronaldo's boot spot, six metres out
   const[rx,rz]=RON_SHOT;groundRing(s,c,rx,rz,.9,.9,.06,R,sm(sc-.1,sc+.3,t,easeOutBack)*(1-sm(hs,hs+.4,t)),23);}
  ,after:({hero})=>{
   // the shot: a spark at Ronaldo's boot
   const sa=tau-SHOT;if(sa>-.02&&sa<.12){const b=LEGS[LEGS.length-1].a,q=pr(c,b);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.7/Math.max(1,toCam(c,b)[2]),{n:9,seed:59,g:1-sm(.05,.12,sa),width:10});}
   // "lightning reflex": a yellow bolt from the ball to his hands, while it flies
   const bw=sm(lr-.05,lr+.3,t)*(1-sm(bs-.1,bs+.15,t));if(bw>0&&hero){const bq=pr(c,ballAt(Math.min(tau,BLOCK-.01))),ha=hero.joints.lHa,hb=hero.joints.rHa;if(bq){const m:Pt=[(ha[0]+hb[0])/2,(ha[1]+hb[1])/2];bolt(s,bq,m,Math.max(5,c.F*.05/Math.max(1,toCam(c,HANDS)[2])),bw,71);}}
   // "blocks the shot": the spark at the gloves
   const age=tau-BLOCK;if(age>-.02&&age<.3){const q=pr(c,HANDS);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.9/Math.max(1,toCam(c,HANDS)[2]),{n:10,seed:61,g:1-sm(.15,.3,age),width:12});}
   // "holds on tight": a yellow ring round the ball in his arms
   if(tau>=BLOCK){const b=ballAt(tau),q=pr(c,b);if(q){const r=c.F*.11/Math.max(1,toCam(c,b)[2]);jointRing(s,q,r*1.7+4,Y,sm(ht-.15,ht+.2,t,easeOutBack)*endFade,88);}}}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),b=ballAt(tau3(t)),g=pr(c,b)??[0,0];return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/Math.max(1,toCam(c,b)[2])),12);},
 still:4.9,
};

// ---------------------------------------------------------------- 4 · the lesson: a low camera in front of the goal — on your toes, spring either way
const DEMO:[number,number]=[1.4,0],SHOOT_SPOT:V3=[4.6,.11,1.5];
function cam4(t:number):Cam{
 const S=SECS(3),u=sm(0,S,t,easeInOutSine),wide=sm(CUEW(3,'spring either')-.3,CUEW(3,'spring either')+.8,t,easeInOutSine);
 return look([lerp(8.6,8,u)+1.2*wide,lerp(1.4,1.3,u)+.3*wide,lerp(3.8,3.2,u)],[DEMO[0]+.8,.75-.1*wide,DEMO[1]-.1],lerp(2150,2050,u)-200*wide);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),yt=CUEW(3,'Your turn'),bs=CUEW(3,'before a shot'),st=CUEW(3,'stay on'),se=CUEW(3,'spring either'),E=SECS(3),fade=1-sm(E-.8,E-.3,t);
  stadium(s,c,v,t);
  ground(s,c);
  // "before a shot": the ball on a spot in front of him, ringed red, and its line toward the goal
  const bw=sm(bs-.1,bs+.3,t,easeOutBack)*fade;
  groundRing(s,c,SHOOT_SPOT[0],SHOOT_SPOT[2],.55,.55,.07,R,bw,41);
  if(bw>0){const a=pr(c,SHOOT_SPOT),b=pr(c,[DEMO[0]+.6,.3,DEMO[1]]);if(a&&b)laneArrow(s,R,a,b,Math.max(5,c.F*.05/8),{dashed:true,seed:43,progress:clamp(bw),cov:.9});}
  // "spring either way": arrows on the grass both ways, then yellow ghosts of the spring to each side
  const sw=sm(se-.1,se+.5,t,easeOut)*fade;
  groundArrow(s,c,[[DEMO[0],DEMO[1]-.6],[DEMO[0],DEMO[1]-1.6],[DEMO[0],DEMO[1]-2.7]],.12,Y,sw,47);
  groundArrow(s,c,[[DEMO[0],DEMO[1]+.6],[DEMO[0],DEMO[1]+1.6],[DEMO[0],DEMO[1]+2.7]],.12,Y,sw,49);
  const gw=sm(se+.2,se+.9,t,easeOut)*fade;
  if(gw>0&&!s._passage.pending)for(const side of ['l','r'] as const)drawPlayer(s,keeperDive(.2+.3*gw,{side,height:.45}),c,{...GHOST,detail:'mid'},{x:DEMO[0],z:DEMO[1],yaw:0});
  // the demo keeper (Barthez's kit): set, bouncing on his toes, facing the ball
  const tt=twos(t),bounce=keeperSet(tt*1.8),res=drawPlayer(s,bounce,c,{...BARTHEZ_ST,detail:'auto'},{x:DEMO[0],z:DEMO[1],yaw:yawOf(SHOOT_SPOT[0]-DEMO[0],SHOOT_SPOT[2]-DEMO[1])},{prev:{pose:keeperSet((tt-1/12)*1.8),place:{x:DEMO[0],z:DEMO[1],yaw:yawOf(SHOOT_SPOT[0]-DEMO[0],SHOOT_SPOT[2]-DEMO[1])}}});
  const bq=pr(c,SHOOT_SPOT);if(bq)ball(s,bq[0],bq[1],Math.max(5,c.F*.11/Math.max(1,toCam(c,SHOOT_SPOT)[2])),.4);
  // "Your turn": a blue ring under him; "stay on your toes": red rings on the balls of his feet
  groundRing(s,c,DEMO[0],DEMO[1],.9,.9,.08,B,sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(bs,bs+.4,t)),37);
  const tw=sm(st-.15,st+.25,t,easeOutBack)*fade;
  for(const [toe,an,sd] of [[res.joints.lToe,res.joints.lAn,91],[res.joints.rToe,res.joints.rAn,92]] as [Pt,Pt,number][])
   jointRing(s,[(toe[0]*2+an[0])/3,(toe[1]*2+an[1])/3],Math.hypot(toe[0]-an[0],toe[1]-an[1])*.9+3,R,tw,sd);
 },
 still:5.4,
};

const film:RisoStory={
 id:'barthez-signature',format:'11v11',title:'Barthez: the quick reflex save',theme:'Stay on your toes before a shot so you can spring either way',
 ageNote:'World Cup final, France v Brazil, Stade de France, Saint-Denis, 12 July 1998 (56 min, France 2–0 up; they won 3–0). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a keeper's glove-slap spark and a kick of night turf. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
/** solved beats (pitch metres; X from France's goal line, Z across, +Z the near side) — checked by tests/play-film-barthez-signature.cjs */
export const FACTS={HANDS,BAR_SPOT,RON_SHOT,ballAt,SHOT,BLOCK,CROSS};
