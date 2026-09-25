/** Pernille Harder — signature: the dribble and shot. Recreated from ONE real, well-documented moment: her equaliser in the UEFA Women's
 * Euro 2017 FINAL, Netherlands 4–2 Denmark, De Grolsch Veste, Enschede, Sunday 6 August 2017 (the 33rd minute; 2–1 to 2–2). An iconic-play
 * riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the dribble and shot"; lesson "Keep the ball close as you run, then shoot
 * before the defender recovers"): it is the best-documented goal of her international career — a goal in a major final, which three
 * written accounts describe the same way: a long ball down the right from a Danish counter-attack, Harder sprinting clear of the Dutch
 * line, carrying the ball into the box and shooting at once, low, before the chasing defence could get back. That IS the lesson.
 * (The iconicPlays template params say side "left" / foot "right"; the accounts say the RIGHT side and a LEFT-foot shot, and this film
 * follows the accounts. "beaten: 2" is shown as the two chasing Dutch defenders.)
 *
 * SOURCES (read Sept 2026; page text fetched with curl, cached in the film scratchpad src-cache/):
 *  - The Guardian live blog, Simon Burnton, "Holland 4-2 Denmark: Euro 2017 final – as it happened" (6 Aug 2017), the 33' entry: "Harder
 *    is just inside her own half when the ball is played down the right, and the Dutch defence trail in her wake with their arms in the
 *    air, hoping for a flag. There is none, and Harder catches up with the ball, cuts into the area and hits a hard, low, left-foot shot
 *    that goes in at the near post!"  https://www.theguardian.com/football/live/2017/aug/06/holland-v-denmark-euro-2017-final-live
 *  - The Guardian match report (6 Aug 2017): "a wonderful individual goal at the end of one of many fine Danish counter-attacks. Having
 *    sprung Holland's offside trap the striker cut in from the right before shooting low just inside a post."
 *    https://www.theguardian.com/football/2017/aug/06/womens-euro-2017-holland-denmark-match-report
 *  - AS (English), match report: "skipper Pernille Harder picked up a long pass on the right wing, took it inside the box and
 *    wrong-footed Dutch keeper Sari van Veenendaal, scoring with a low left-foot shot to her left post"; both starting XIs.
 *  - Wikipedia, "UEFA Women's Euro 2017 Final" (raw wikitext): date, De Grolsch Veste, Enschede, 28,182, scorers and minutes (Nadim 6'
 *    pen, Miedema 10', Martens 28', Harder 33', Spitse 51', Miedema 89'), line-ups with shirt numbers (Harder 10, captain; Nadim 9), the
 *    kit templates: Netherlands orange shirts and shorts; Denmark WHITE shirts, BLACK shorts, WHITE socks (their change kit).
 *  - UEFA.com final review (Harder "rifling in to make it 2-2"; photo caption "Pernille Harder wheels away after scoring"); BBC Sport
 *    report ("Harder slotted in to equalise"); the Guardian live blog's closing line (a stadium "packed with orange-clad fans").
 * CONFIRMED by those accounts: Sunday 6 August 2017, Enschede, the final, 2–1 down → 2–2 in the 33rd minute; a Danish counter-attack;
 * Harder (No. 10, captain) just inside HER OWN HALF when the ball is played; a LONG PASS DOWN THE RIGHT; the Dutch defence trailing
 * her with their arms in the air for offside; no flag (she started in her own half — the reason it cannot be offside is the Law, not a
 * source's opinion); she catches the ball up on the right, cuts into the area, hits a hard, LOW, LEFT-FOOT shot in at the NEAR post (the
 * keeper's LEFT post); Van Veenendaal wrong-footed; she wheels away. Kits as listed above. The crowd mostly in orange.
 * INFERRED (illustrative): the direction of play and the side of the pitch drawn (Denmark attacking +X, the right channel on the near
 * side under the main-stand camera); who played the long ball and from where (an unnamed Dane deep on the right); the ball's flight and
 * bounce; the exact spots of her touches and of the shot (inside the box on the right, ≈ 16 m from the near post); that her first touch
 * was with the right foot; which Dutch defenders chased (drawn as the left-back and the left centre-back — Van Es and Van der Gragt by
 * the line-up — but NOT named in the narration); their raised arms; the keeper stepping toward the middle before the shot; everyone
 * else's positions; hair (Harder's fair hair tied back is drawn from general photos, not a photo of this goal); numbers' ink, trims,
 * both keepers' kits, socks of the Dutch, the ball; De Grolsch Veste as drawn (two roofed tiers, closed corners), the ad boards,
 * the weather, the camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera in real
 * time: the long ball, her sprint, the cut inside, the goal; 2 = slow-motion replay from a low rail camera running beside her: she starts
 * in her own half (the halfway line lights up), the defenders' arms go up, play on, the close touches; 3 = slow-motion replay from behind
 * the goal: the left-foot shot, low at the near post, the keeper going the wrong way, the wheel away; 4 = the lesson from behind her
 * right shoulder: close touches, shoot now, the defender too late. Distinct from the Miedema film of the same match: this film's play
 * runs the other way, down the near touchline. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE
 * adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film.
 *
 * LEAD: when public/plays/narration/harder-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/harder-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional timing (≈2.6 words/s, a beat on punctuation) until the lead records the voice: `at` = the onset of the cue's first word. */
function prov(label:string,text:string,cues:string[]){const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=.37+(/[,.:!…]$/.test(w)?.28:0);}
 let from=0;const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('harder: cue '+c);from=k+c.length;return{at:+on[text.slice(0,k).split(/\s+/).length-1].toFixed(2),words:c};});
 return{label,narration:text,seconds:+(t+1.1).toFixed(2),cues:cs};}
const PROV:Chapter[]=[
 prov('The final, live','Enschede, 2017. The Euro final: the Netherlands against Denmark. A long ball goes down the right. Pernille Harder races after it, cuts into the box... and scores!',
  ['Enschede','The Euro final','the Netherlands','A long ball','goes down the right','Pernille Harder','races after it','cuts into the box','and scores']),
 prov('Watch again','Watch again, slowly. Harder starts in her own half, so she’s not offside. The defenders raise their arms, but play goes on. She keeps the ball close.',
  ['Watch again','Harder starts','in her own half','not offside','The defenders','raise their arms','but play goes on','She keeps','the ball close']),
 prov('Near post','Behind the goal now. A quick left-foot shot, low at the near post. The keeper goes the wrong way!',
  ['Behind the goal','A quick','low at the near post','The keeper','the wrong way']),
 prov('Your turn','Your turn: keep the ball close as you run, then shoot before the defender recovers!',
  ['Your turn','keep the ball close','as you run','then shoot','before the defender','recovers']),
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py harder-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/harder-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(PROV,VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('harder: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',O='orange',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Denmark attack +X; the Dutch goal line at X = 105; halfway at 52.5),
 * Y up, Z across (+34 = the near touchline under the main-stand camera). A Dane facing +X has her right side at +Z, so the right channel
 * is the near side and the NEAR post of Harder's shot is the post at Z = +3.66 — the LEFT post of Van Veenendaal, who faces −X. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- De Grolsch Veste: a closed, roofed two-tier box, packed in orange
const CX=52.5,NS=56;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a box with rounded corners), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.18),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.18)];}
/** the tiers [d, y] at front and back: lower tier, upper tier; the roof edge hangs over the upper tier */
const TIERS:[number,number,number,number][]=[[1.5,1.3,20,10.5],[21,12.5,36,23]];
type Bowl={seats:V3[][][];fascia:V3[][];wall:V3[][];roof:V3[][];crowd:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seats:[[],[]],fascia:[],wall:[],roof:[],crowd:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;
  TIERS.forEach(([d0,y0,d1,y1],k)=>{o.seats[k].push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
   for(let r=0;r<8;r++)for(let j=0;j<3;j++){const h=hash(i*977+r*31+j*7+k*5003,11);if(h<.08)continue;const u=(r+.5)/8;o.crowd.push({P:rim((i+(j+.5+(hash(i+r*13+j+k*71,4)-.5)*.5)/3)/NS*TAU,lerp(d0,d1,u),lerp(y0,y1,u)+.45),h});}});
  o.fascia.push([rim(a,20,10.5),rim(b,20,10.5),rim(b,21,12.5),rim(a,21,12.5)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,1.5,1.3),rim(a,1.5,1.3)]);
  o.roof.push([rim(a,14,27),rim(b,14,27),rim(b,38,29),rim(a,38,29)]);}
 return o;})();
/** everything behind the pitch: the sky, the stands, the orange crowd (roar lifts the marks, flash = flag-waving sparkle) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.24);
 const seats=new Path2D(),fas=new Path2D(),wall=new Path2D(),roof=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=polyP(c,q);if(r.length>2)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.seats[0][i],seats);add(BOWL.seats[1][i],seats);add(BOWL.fascia[i],fas);add(BOWL.wall[i],wall);add(BOWL.roof[i],roof);}
 s.knockout(seats);s.tone(K,seats,.16);s.tone(O,seats,.34);
 // the crowd: "a stadium packed with orange-clad fans" — mostly orange, some white (paper), a little yellow and navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.crowd){const d=toCam(c,q.P);if(d[2]<12)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.62/d[2],2.5,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.62?1:q.h<.8?0:q.h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(O,inks[1],.92);s.fill(Y,inks[2],.9);s.fill(K,inks[3],.75);
 // the roof (the underside in shadow), the fascia between the tiers and the pitch-level wall
 s.knockout(roof);s.fill(K,roof,.55);s.tone(B,roof,.3);
 s.knockout(fas);s.fill(K,fas,.8);s.knockout(wall);s.fill(K,wall,.7);s.tone(B,wall,.35);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.crowd[Math.floor(hash(i*17+T12*101,3)*BOWL.crowd.length)],d=toCam(c,q.P);if(d[2]<12)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the grass surround, the pitch (yellow × blue) with mowing stripes, ad boards, paper lines, the far goal and the corner flags */
function ground(s:Sheet,c:Cam,hl=0){
 const sur=polyP(c,[[-10,0,-41],[115,0,-41],[115,0,41],[-10,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.85);s.tone(B,p,.7);}
 const g=polyP(c,[[-3,0,-37],[108,0,-37],[108,0,37],[-3,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // ad boards: both touchlines and behind the goals (navy, with orange and paper panels)
 const bd=new Path2D(),pn=new Path2D(),po=new Path2D();
 for(const q of [polyP(c,[[-4,0,-38.5],[110,0,-38.5],[110,.9,-38.5],[-4,.9,-38.5]]),polyP(c,[[110.5,0,-36],[110.5,0,36],[110.5,.9,36],[110.5,.9,-36]]),polyP(c,[[-5.5,0,36],[-5.5,0,-36],[-5.5,.9,-36],[-5.5,.9,36]]),polyP(c,[[110,0,38.5],[-4,0,38.5],[-4,.9,38.5],[110,.9,38.5]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.65,-38.45],[x,.65,-38.45]]);if(q.length>2)(k%2?pn:po).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[110.45,.25,z],[110.45,.25,z+3.4],[110.45,.65,z+3.4],[110.45,.65,z]]);if(q.length>2)(k%2?pn:po).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.85);s.knockout(pn,.85);s.knockout(po,.85);s.fill(O,po,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(105,34,1,Math.PI,1.5*Math.PI,5);circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 // "in her own half": the halfway line lit yellow (hl 0..1)
 if(hl>0){const h=new Path2D();seg3(c,[52.5,.01,-2],[52.5,.01,34],.34,h);s.knockout(h,.9*hl);s.fill(Y,h,.95*hl);}
 goal3(s,c,0,-1);
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);const a=pr(c,[105,1.55,z]),b=pr(c,[105,1.4,z-Math.sign(z)*.45]),e=pr(c,[105,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(O,flag,.95);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep. net = paper haze strength. */
const GOAL={x:105,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,X:number,d:number,net=.3,bulge?:{z:number;y:number;k:number}){
 const z0=-3.66,z1=3.66,H=2.44,bx=X+d*2;
 const bb=(z:number,y:number)=>bulge?bx+d*.55*bulge.k*Math.max(0,1-Math.hypot(z-bulge.z,(y-bulge.y)*1.3)/1.8):bx;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const n=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)n.addPath(polyPath(q,true));}
 s.knockout(n,net);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bb(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[bb(z,y0),y0,z],[bb(z,y1),y1,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=lerp(z0,z1,i/4),zb=lerp(z0,z1,(i+1)/4);seg3(c,[bb(za,y),y,za],[bb(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[O,.18]];
/** women footballers: athletic builds, a touch slimmer through the shoulders */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.93,thighs:o.thighs??1.06,head:1.02});
/** Denmark 6 August 2017 (Wikipedia kit template, confirmed): WHITE shirts, BLACK shorts (a heavy navy), WHITE socks; trim and numbers
 * navy (inferred) */
const DEN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:[K,.95],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:K,build:W(1.7),seed:31,...o});
/** Pernille Harder: No. 10, captain (confirmed); fair hair tied back (inferred, general photos); quick, strong legs */
const HARDER:AthleteStyle=DEN({number:10,hair:[Y,.9],hairStyle:'ponytail',build:W(1.7,{bulk:.94,thighs:1.12}),seed:10});
/** Nadia Nadim: No. 9 (confirmed); dark hair tied back (inferred) */
const NADIM:AthleteStyle=DEN({number:9,hair:[K,.85],hairStyle:'ponytail',build:W(1.72),seed:9});
/** the Netherlands (the kit template, confirmed): ORANGE shirts and shorts; orange socks, navy trim and numbers inferred */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,trim:K,shorts:O,socks:O,boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'short',numberInk:K,build:W(1.72),seed:51,...o});
/** the chasing left-back and left centre-back (inferred identities: Van Es No. 5, Van der Gragt No. 3 — not named in the narration) */
const VANES:AthleteStyle=NED({number:5,hair:[Y,.85],seed:5,build:W(1.68)});
const VDG:AthleteStyle=NED({number:3,hair:[K,.7],seed:3,build:W(1.78,{bulk:.96})});
/** Sari van Veenendaal: No. 1; a blue goalkeeper kit (inferred), fair hair tied back */
const GK:AthleteStyle={shirt:[B,.95],trim:K,shorts:[B,.95],socks:[B,.9],boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'long',gloves:[Y,.9],number:1,numberInk:K,build:W(1.77,{bulk:.97}),seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). prev = the pose one drawing earlier (the ponytail and
 * hem trail); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds, T = 0 = the long ball is struck)
const FIG=1.06;// figures 6 % over life size so they read in a small card window
/** the beats: the ball lands in the right channel, her first touch (right foot), the touch into the box (left), the left-foot shot, the net */
const T_LAND=2.7,T_CATCH=4.4,T_TOUCH2=5.1,T_SHOT=5.85,T_GOAL=6.3;
type Role='harder'|'gk'|'passer'|'vanes'|'vdg'|'den'|'ned';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, X, Z]. Harder starts JUST INSIDE HER OWN HALF (X < 52.5) as the ball is played. */
const ACTORS:Actor[]=[
 {name:'Harder',role:'harder',style:HARDER,key:true,keys:[[-5,47,14],[-2,49,15.5],[0,51,17],[1,56.6,18.4],[2,63.6,19.4],[3,71,20],[3.8,77.2,20.2],[4.4,81.6,19.9],[5.1,86.3,17.4],[5.85,90.6,13.8],[6.3,92.6,12.6],[7,94.4,13.4],[8.2,94.6,17.8],[10,92.5,23]]},
 {name:'VanVeenendaal',role:'gk',style:GK,key:true,keys:[[-5,89,-1],[0,91,.5],[2,94.8,1.6],[4,99.6,2.6],[5.1,101.8,2.7],[5.85,102.3,1.0],[6.4,102.35,.9],[10,102.4,1.2]]},
 {name:'passer',role:'passer',style:DEN({number:7,seed:7,hair:[Y,.7]}),key:true,keys:[[-5,33,4],[-1.5,37.5,6.6],[-.4,39.4,7.6],[0,39.8,7.8],[.6,40.2,8],[3,43,9.6],[10,50,11]]},
 {name:'VanEs',role:'vanes',style:VANES,key:true,keys:[[-5,56,13],[0,58,15],[.6,58.6,15.3],[1.4,61.2,15.7],[2.4,67,16],[3.4,73.4,16],[4.4,79.4,15.7],[5.1,84,15],[5.85,88.4,14.4],[6.5,90.6,14],[10,92,15]]},
 {name:'VanDerGragt',role:'vdg',style:VDG,key:true,keys:[[-5,55.5,4],[0,57.5,6],[.6,58.2,6.3],[1.6,61.5,7.4],[2.6,66.8,8.6],[3.6,72.6,9.6],[4.6,78.8,10.2],[5.85,86.2,10.6],[6.6,89,10.4],[10,90.5,9]]},
 {name:'Nadim',role:'den',style:NADIM,keys:[[-5,50,-3],[0,53.5,-2],[2,63.5,-.5],[4,75.5,.6],[5.85,86.5,1.2],[6.8,89.5,3],[10,91.5,9]]},
 {name:'dekker',role:'ned',style:NED({number:4,seed:54,hair:[K,.6],build:W(1.75)}),keys:[[-5,55.5,-5],[0,57.5,-6],[1,59,-5.5],[3,66,-3.4],[5.85,80.5,.8],[10,86,3]]},
 {name:'vanlunteren',role:'ned',style:NED({number:2,seed:52,hair:[Y,.7]}),keys:[[-5,57,-16],[0,59,-17],[3,65.5,-13],[5.85,78,-6],[10,84,-2]]},
 {name:'spitse',role:'ned',style:NED({number:8,seed:58,hair:[Y,.8]}),keys:[[-5,46,-4],[0,48,-5],[3,55,-2],[5.85,66,1],[10,72,4]]},
 {name:'den8',role:'den',style:DEN({seed:38,hair:[K,.7]}),keys:[[-5,44,-10],[0,46,-11],[3,54,-8],[5.85,64,-5],[10,70,-2]]},
];
const H_I=0,GK_I=1,PASS_I=2,VE_I=3,VG_I=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-5,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bumpT=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** her first touch on the run (right foot, a short push forward and inside), the touch into the box (left), the finish (left, full) */
const TOUCH1=(T:number)=>strike(clamp((T-T_CATCH)/.6+STRIKE_CONTACT),{foot:'r',power:.25});
const TOUCH2=(T:number)=>strike(clamp((T-T_TOUCH2)/.6+STRIKE_CONTACT),{foot:'l',power:.3});
const SHOT=(T:number)=>strike(clamp((T-T_SHOT)/.9+STRIKE_CONTACT),{foot:'l',power:1});
/** the near post, low (confirmed: "low", "at the near post", "just inside a post") */
const POST:V3=[105.05,.3,3.15],NET:V3=[106.5,.38,2.9],REST:V3=[106.35,.11,2.6];
const FACE_SHOT=yawOf(POST[0]-90.6,POST[2]-13.8);
function harderYaw(T:number):number{const v=velOf(H_I,T),run=yawOf(v[0],v[1]);
 if(T<T_SHOT-.4)return run;
 if(T<T_SHOT+.4)return lerpA(run,FACE_SHOT,sm(T_SHOT-.4,T_SHOT-.2,T));
 return lerpA(FACE_SHOT,run,sm(T_SHOT+.4,T_SHOT+.8,T));}
/** Van Veenendaal: wrong-footed — a step toward the middle as the shot comes, then a late dive back to her left (the near post) */
const GK_DIVE=(T:number)=>keeperDive(clamp((T-6.42)/.85+.55),{side:'l',height:.12});
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T);
 const[hx,hz]=posOf(H_I,T),b=ballAt(T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(T*1.3):stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='passer'){yaw=lerpA(yaw,PASS_YAW,sm(-1,-.3,T)*(1-sm(.8,1.6,T)));const u=(T+STRIKE_CONTACT)/1.0;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='harder'){yaw=harderYaw(T);
  const w1=sm(T_CATCH-.35,T_CATCH-.18,T)*(1-sm(T_CATCH+.12,T_CATCH+.28,T));if(w1>0)p=blendPose(p,TOUCH1(T),w1);
  const w2=sm(T_TOUCH2-.35,T_TOUCH2-.18,T)*(1-sm(T_TOUCH2+.12,T_TOUCH2+.28,T));if(w2>0)p=blendPose(p,TOUCH2(T),w2);
  const ws=sm(T_SHOT-.5,T_SHOT-.3,T)*(1-sm(T_SHOT+.45,T_SHOT+.7,T));if(ws>0)p=blendPose(p,SHOT(T),ws);
  // "wheels away": the run toward the corner, arms out, then both arms up
  if(T>T_GOAL+.25){const wc=sm(T_GOAL+.25,T_GOAL+.7,T);p=blendPose(p,T<T_GOAL+2.8?celebrate(distOf(k,T)/3.3,{kind:'run'}):celebrate((T-T_GOAL-2.8)*1.1,{kind:'arms'}),wc);}}
 if(a.role==='vanes'||a.role==='vdg'){// arms in the air for offside while they chase (confirmed), then a lunge at the shot, too late
  const wa=sm(.6,1.1,T)*(1-sm(2.5,3.1,T));if(wa>0)p=a.role==='vanes'?over(p,{rShF:168,rShA:18,rElb:12,rHand:1},wa):over(p,{lShF:168,lShA:18,lElb:12,lHand:1},wa);
  if(a.role==='vanes'){const wl=sm(T_SHOT-.3,T_SHOT-.1,T)*(1-sm(T_SHOT+.6,T_SHOT+.9,T));if(wl>0){yaw=lerpA(yaw,yawOf(hx-x,hz-z),wl);p=blendPose(p,lunge(clamp((T-T_SHOT)/.8+.6),{side:'l'}),wl);}}
  if(T>T_GOAL+.3)yaw=lerpA(yaw,yawOf(hx-x,hz-z),sm(T_GOAL+.3,T_GOAL+.8,T));}
 if(a.role==='gk'){yaw=lerpA(Math.PI,yawOf(b[0]-x,b[2]-z),.6);if(T>T_SHOT+.05)p=blendPose(GK_DIVE(T),keeperSet(T*1.3),sm(T_GOAL+1.6,T_GOAL+2.6,T,easeInOutSine));}
 if(a.role==='den'&&T>T_GOAL+.6){p=blendPose(p,celebrate((T-T_GOAL)*1.1+k*.3,{kind:'arms'}),sm(T_GOAL+.6,T_GOAL+1.1,T)*clamp(1-(sp-.8)/1.5));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const PASS_YAW=yawOf(78-39.8,21-7.8);
function skAt(k:number,T:number){const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T);return solve(p,ACTORS[k].style.build,{x,z,yaw},FIG);}
// ballAt is read by poseOf before the contacts exist: until they are solved the ball rests at the passer's feet
let BALL0:V3=[40.1,.11,7.9],CATCH_PT:V3=[82.2,.11,19.6],TOUCH2_PT:V3=[86.8,.11,16.9],SHOT_PT:V3=[91,.12,13.3],SOLVED=false;
/** where the long ball comes down in the right channel, and its one bounce */
const LAND1:V3=[76.5,.11,21.2],BOUNCE:V3=[79.6,.11,20.8],T_BOUNCE=3.25;
/** the ball at play time T: the long ball down the right, a bounce, rolling on until she catches it up, two close touches, the shot */
function ballAt(T:number):V3{
 if(T<0||!SOLVED)return BALL0;
 if(T<T_LAND)return lerp3(BALL0,LAND1,T/T_LAND,7.2);
 if(T<T_BOUNCE)return lerp3(LAND1,BOUNCE,(T-T_LAND)/(T_BOUNCE-T_LAND),.9);
 if(T<T_CATCH)return lerp3(BOUNCE,CATCH_PT,sm(T_BOUNCE,T_CATCH,T,u=>u*(2-u)*.55+u*.45));
 const push=(u:number)=>u*(2-u);// a touch sends it ahead, then it slows as she catches it again
 if(T<T_TOUCH2)return lerp3(CATCH_PT,TOUCH2_PT,push((T-T_CATCH)/(T_TOUCH2-T_CATCH)));
 if(T<T_SHOT)return lerp3(TOUCH2_PT,SHOT_PT,push((T-T_TOUCH2)/(T_SHOT-T_TOUCH2)));
 if(T<T_GOAL)return lerp3(SHOT_PT,POST,(T-T_SHOT)/(T_GOAL-T_SHOT),.12);
 if(T<T_GOAL+.18)return lerp3(POST,NET,(T-T_GOAL)/.18);
 if(T<T_GOAL+.75)return lerp3(NET,REST,sm(T_GOAL+.18,T_GOAL+.75,T,u=>u*u));
 return REST;
}
{const sp=skAt(PASS_I,0);BALL0=[sp.rToe[0],.11,sp.rToe[2]];
 const s1=skAt(H_I,T_CATCH);CATCH_PT=[s1.rToe[0],.11,s1.rToe[2]];
 const s2=skAt(H_I,T_TOUCH2);TOUCH2_PT=[s2.lToe[0],.11,s2.lToe[2]];
 const s3=skAt(H_I,T_SHOT);SHOT_PT=[s3.lToe[0],Math.max(.12,s3.lToe[1]),s3.lToe[2]];SOLVED=true;}

// ---------------------------------------------------------------- the ball print
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:3});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={bg:Pt|null;br:number;harder?:DrawResult;vanes?:DrawResult;vdg?:DrawResult;gk?:DrawResult};
/** everything on the pitch at T (positions on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;near?:number;hero?:boolean;after?:(r:PlayOut)=>void;ghost?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(o.near??3.5))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const hgt=b[1];sh.addPath(polyPath(blob(bground[0],bground[1],br*.9/(1+hgt*.3),br*.28/(1+hgt*.3),2,{amp:.05,n:12}),true));}s.tone(K,sh,.4);
 const out:PlayOut={bg,br};
 type It={d:number;draw:()=>void};const items:It[]=[];
 const behind=c.C[0]>GOAL.x+.5,bk=T>T_GOAL?bumpT(T_GOAL,T_GOAL+.9,T):0;
 items.push({d:behind?-1:depth(c,[106,1.2,0]),draw:()=>goal3(s,c,105,1,behind?.16:.3,bk>0?{z:NET[2],y:NET[1],k:bk}:undefined)});
 if(bg)items.push({d:bq[2],draw:()=>ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11)});
 for(const e of list)items.push({d:e.d,draw:()=>{
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,Tp),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures and extras; during a passage only Harder keeps 'mid'
  const detail=passing?(e.k===H_I?'mid':'low'):px<50||(!a.key&&px<170)?'low':'auto';
  const fast=(e.k===H_I&&((T>T_CATCH-.2&&T<T_CATCH+.2)||(T>T_TOUCH2-.2&&T<T_TOUCH2+.2)||(T>T_SHOT-.25&&T<T_SHOT+.3)))||(e.k===GK_I&&T>T_GOAL-.1&&T<T_GOAL+.5)||(e.k===VE_I&&T>T_SHOT-.2&&T<T_SHOT+.3);
  const prv=big&&!passing?poseOf(e.k,Tprev):null;
  const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prv?{prev:prv.p,prevPlace:{x:e.x,z:e.z,yaw:prv.yaw},smear:hero&&fast}:{});
  if(e.k===H_I)out.harder=r;if(e.k===VE_I)out.vanes=r;if(e.k===VG_I)out.vdg=r;if(e.k===GK_I)out.gk=r;}});
 items.sort((p,q)=>q.d-p.d);
 o.ghost?.(out);
 for(const it of items)it.draw();
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a point, knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,c.F*.07/depth(c,[x,0,z])),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** the ball's path between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=0)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** an arrow on the grass from a to b (world), progress u */
function groundArrow(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.14,seed=70){if(u<=0)return;const p=pr(c,a),q=pr(c,b);if(!p||!q)return;const wd=Math.max(6,c.F*wm/Math.max(1,depth(c,a)));
 s.knockout(ribbon([p,[lerp(p[0],q[0],u),lerp(p[1],q[1],u)]],wd*2,{seed,taper:0,wobble:.6}),.8);laneArrow(s,ink,p,q,wd,{progress:u,seed:seed+1,head:wd*2.6});}
/** a stamped ring round a point on screen, knocked out under */
function screenRing(s:Sheet,p:Pt|null,r:number,w:number,ink=Y){if(!p||w<=0)return;const pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([p[0]+Math.cos(a)*r*(1+.04*Math.sin(a*3)),p[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,r*.16),{close:true,seed:17,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** a raised hand ringed in orange (the offside appeal) */
function handRing(s:Sheet,r:DrawResult|undefined,side:'l'|'r',w:number){if(!r||w<=0)return;const j=r.joints,hd=side==='r'?j.rHa:j.lHa,sh=side==='r'?j.rSh:j.lSh;screenRing(s,hd,Math.hypot(hd[0]-sh[0],hd[1]-sh[1])*.45+6,w,O);}
/** "the ball close": a dotted yellow tether from her nearest boot to the ball, short = close */
function tether(s:Sheet,r:DrawResult|undefined,bg:Pt|null,br:number,w:number){if(!r||!bg||w<=0)return;const j=r.joints,a=Math.hypot(j.lToe[0]-bg[0],j.lToe[1]-bg[1])<Math.hypot(j.rToe[0]-bg[0],j.rToe[1]-bg[1])?j.lToe:j.rToe;
 const L=Math.hypot(bg[0]-a[0],bg[1]-a[1]);if(L<br*1.2)return;const N=Math.max(2,Math.min(8,Math.floor(L/(br*1.1)))),dots=new Path2D(),rr=Math.max(3,br*.32);
 for(let i=1;i<N;i++){const u=i/N;dots.addPath(polyPath(blob(lerp(a[0],bg[0],u),lerp(a[1],bg[1],u),rr,rr,i+3,{amp:.1,n:10}),true));}s.knockout(dots,.8*w);s.fill(Y,dots,.95*w);}
/** the near post, low, lit up as a yellow frame just inside the post */
function gapFrame(s:Sheet,c:Cam,w:number){if(w<=0)return;const q=polyP(c,[[105,0,2.3],[105,.95,2.3],[105,.95,3.62],[105,0,3.62]]);if(q.length<4)return;
 const pts=smoothPts(q,true,4,1);const rr=ribbon(pts,Math.max(5,c.F*.06/depth(c,[105,.5,3])),{close:true,seed:19,taper:0,wobble:.8});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);
 s.tone(Y,polyPath(q,true),.35*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** T from chapter-1 time: real time; the goal lands on "and scores", so the long ball goes as "A long ball goes down the right" is said */
const kick1=()=>CUEW(0,'and scores')-T_GOAL+.1;
const tau1=(t:number)=>clamp(t-kick1(),T0,T1);
const CAM1:V3=[64,21,66];
function cam1(t:number):Cam{
 const T=tau1(t),S=SECS(0),lb=CUEW(0,'A long ball');
 // open wide on the orange stands, settle on the Danish passer, then follow the ball and Harder down the right, and stay on the finish
 const wide:V3=[58,12,-48],pass:V3=[46,.5,10],b=ballAt(T),[hx,hz]=posOf(H_I,T),bt:V3=[lerp(b[0],hx,.5)+1,.6,lerp(b[2],hz,.5)-1],fin:V3=[96,1,7.5];
 const toPass=sm(1.2,lb-.3,t,easeInOutSine),follow=sm(-.3,1.2,T,easeInOutSine),finish=sm(T_TOUCH2-.4,T_SHOT+.1,T,easeInOutSine);
 let tg=lerp3(wide,pass,toPass);tg=lerp3(tg,bt,follow);tg=lerp3(tg,fin,finish);
 const F=key(t,[[0,2600],[lb-.3,4400],[kick1()+1.2,3400],[kick1()+3.4,3500],[kick1()+T_CATCH+.3,4600],[kick1()+T_SHOT,5600],[kick1()+T_GOAL+.8,5400],[S,5300]],easeInOutSine);
 return look(CAM1,tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),tp=tau1(twos(t)),sc=CUEW(0,'and scores');
  stadium(s,c,v,t,{roar:sm(sc-.3,sc+.4,t)*.5,flash:sm(sc-.2,sc+.3,t)*(1-sm(sc+1.6,sc+2.2,t))*.6});
  ground(s,c);
  play(s,c,v,T,tp,tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(H_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:11.6,
};

// ---------------------------------------------------------------- 2 · slow replay: a low rail camera running beside her on the near side
const tau2=(t:number)=>key(t,[[0,-.6],[CUEW(1,'Harder starts'),-.15],[CUEW(1,'in her own half'),.15],[CUEW(1,'not offside'),.5],[CUEW(1,'The defenders'),.95],[CUEW(1,'raise their'),1.45],[CUEW(1,'but play'),2.3],[CUEW(1,'She keeps'),3.9],[CUEW(1,'the ball close'),4.45],[SECS(1),5.35]],linear);
function cam2(t:number):Cam{
 const T=tau2(t),[hx,hz]=posOf(H_I,T),in2=sm(CUEW(1,'She keeps')-.8,CUEW(1,'She keeps')+.4,t,easeInOutSine);
 // beside her at her own height-ish, a little ahead; closing in for the touches
 const C:V3=[hx+2.2-1.2*in2,lerp(2.3,1.8,in2),hz+lerp(12,8.5,in2)];
 const tg:V3=[hx+2.8-.8*in2,1.0,hz-3.2+1.4*in2];
 return look(C,tg,lerp(2150,1900,in2));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),tp=tau2(twos(t)),hs=CUEW(1,'Harder starts'),oh=CUEW(1,'in her own half'),no=CUEW(1,'not offside'),rt=CUEW(1,'raise their'),pg=CUEW(1,'but play'),sk=CUEW(1,'She keeps'),bc=CUEW(1,'the ball close'),E=SECS(1);
  stadium(s,c,v,t);
  // "in her own half": the halfway line lights up
  ground(s,c,sm(hs-.1,oh+.3,t,easeOutBack)*(1-sm(rt-.2,rt+.3,t)));
  play(s,c,v,T,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:2,ghost:()=>{
   // "in her own half": a yellow ring where she stands as the ball is played
   const[sx,sz]=posOf(H_I,0);groundRing(s,c,sx,sz,.8,sm(oh-.1,oh+.3,t,easeOutBack)*(1-sm(rt-.2,rt+.3,t)));
   // "play goes on": a yellow arrow down the right channel ahead of her
   const[hx,hz]=posOf(H_I,T);groundArrow(s,c,[hx+1.2,.01,hz],[hx+9,.01,Math.min(hz+.8,20.5)],sm(pg-.1,pg+.5,t,easeOut)*(1-sm(sk-.3,sk+.1,t)),Y,.16,72);
   // "the ball close": yellow rings stamped where each touch lands
   const bw=sm(sk-.1,sk+.3,t)*(1-sm(E-.9,E-.55,t));if(bw>0){if(T>T_CATCH)groundRing(s,c,CATCH_PT[0],CATCH_PT[2],.45,bw);if(T>T_TOUCH2)groundRing(s,c,TOUCH2_PT[0],TOUCH2_PT[2],.45,bw);}},
   after:({harder,vanes,vdg,bg,br})=>{
    // "not offside": a yellow ring round her as the ball is struck
    if(harder){const j=harder.joints,hd=j.head,an=j.lAn;screenRing(s,[lerp(hd[0],an[0],.5),lerp(hd[1],an[1],.5)],Math.abs(an[1]-hd[1])*.62+8,sm(no-.1,no+.3,t,easeOutBack)*(1-sm(no+1.2,no+1.6,t)));}
    // "raise their arms": orange rings round the defenders' raised hands
    const ra=sm(rt-.1,rt+.3,t,easeOutBack)*(1-sm(pg+.3,pg+.8,t));handRing(s,vanes,'r',ra);handRing(s,vdg,'l',ra);
    // "the ball close": the short tether from boot to ball
    tether(s,harder,bg,br,sm(bc-.1,bc+.3,t)*(1-sm(E-.9,E-.55,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(H_I,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · slow replay from behind the goal: left foot, low at the near post, the keeper wrong-footed
const tau3=(t:number)=>{const bg=CUEW(2,'Behind'),aq=CUEW(2,'A quick'),lo=CUEW(2,'low at'),tk=CUEW(2,'The keeper'),ww=CUEW(2,'the wrong way');
 return key(t,[[0,T_TOUCH2-.35],[bg+.6,T_TOUCH2+.1],[aq+.3,T_SHOT-.15],[lo,T_SHOT+.12],[tk,T_GOAL-.12],[ww+.3,T_GOAL+.12],[SECS(2),T_GOAL+2.2]],linear);};
function cam3(t:number):Cam{
 const T=tau3(t),pan=sm(CUEW(2,'A quick')-.2,CUEW(2,'The keeper')+.2,t,easeInOutSine),end=sm(CUEW(2,'the wrong way')+.4,SECS(2),t,easeInOutSine);
 const C:V3=[111.8,2.1+.5*end,7.6],b=ballAt(Math.min(T,T_GOAL)),[hx,hz]=posOf(H_I,Math.min(T,T_GOAL+2.2));
 // behind the goal line, just outside the near post: a long lens on Harder, panning with the shot to the post, then out to her wheeling away
 const tg0:V3=[lerp(hx+.5,lerp(b[0],103,.3),pan),lerp(1,.7,pan),lerp(hz-.3,lerp(b[2],3,.3),pan)],tg1:V3=[hx+1.5,1.1,hz-.5];
 return look(C,lerp3(tg0,tg1,end),lerp(lerp(4200,1700,pan),3200,end));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),tp=tau3(twos(t)),aq=CUEW(2,'A quick'),lo=CUEW(2,'low at'),tk=CUEW(2,'The keeper'),ww=CUEW(2,'the wrong way'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(ww,ww+.6,t)*.4});
  ground(s,c);
  // "the wrong way": an orange arrow on the grass for the keeper's step toward the middle
  const[kx,kz]=posOf(GK_I,5.1);groundArrow(s,c,[kx+.2,.01,kz],[kx+.2,.01,kz-1.9],sm(tk-.1,tk+.4,t,easeOut)*(1-sm(E-.9,E-.5,t)),O,.12,74);
  play(s,c,v,T,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,near:1.2,after:({harder,gk})=>{
   // "A quick left-foot shot": a spark off her left boot at contact
   const age=T-T_SHOT;if(harder&&age>-.03&&age<.35){const q=harder.joints.lToe;sparkBurst(s,Y,q[0],q[1],c.F*.5/depth(c,SHOT_PT),{n:9,seed:91,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/depth(c,SHOT_PT))});}
   // "low at the near post": the shot's line printed as it flies, and the low near corner lit
   flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(aq,aq+.3,t)*(1-sm(E-.9,E-.5,t)),Y,.09);
   gapFrame(s,c,sm(lo-.1,lo+.3,t,easeOutBack)*(1-sm(E-.9,E-.5,t)));
   // "The keeper": an orange ring round her
   if(gk){const j=gk.joints,hd=j.head,an=j.lAn;screenRing(s,[lerp(hd[0],an[0],.5),lerp(hd[1],an[1],.5)],Math.hypot(an[0]-hd[0],an[1]-hd[1])*.6+8,sm(tk-.1,tk+.3,t,easeOutBack)*(1-sm(ww+.6,ww+1,t)),O);}}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(H_I,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: behind her right shoulder, the goal ahead
const tau4=(t:number)=>{const yt=CUEW(3,'Your turn'),kb=CUEW(3,'keep the ball'),ar=CUEW(3,'as you run'),ts=CUEW(3,'then shoot'),bd=CUEW(3,'before the'),rc=CUEW(3,'recovers');
 return key(t,[[0,3.7],[yt+.2,3.85],[kb+.3,T_CATCH+.05],[ar+.4,T_TOUCH2+.1],[ts+.2,T_SHOT-.12],[bd+.2,T_SHOT+.02],[rc+.3,T_GOAL],[SECS(3),T_GOAL+.5]],linear);};
function cam4(t:number):Cam{
 const T=Math.min(tau4(t),T_SHOT-.1),[hx,hz]=posOf(H_I,T),push=sm(CUEW(3,'then shoot')-.3,CUEW(3,'recovers'),t,easeInOutSine);
 const C:V3=[hx-8.5,3.8+.8*push,hz+5.5+1.5*push];
 const tg:V3=[lerp(hx+7,99,push),.9,lerp(hz-4.5,6.5,push)];
 return look(C,tg,lerp(1750,1650,push));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),T=tau4(t),tp=tau4(twos(t)),kb=CUEW(3,'keep the ball'),ar=CUEW(3,'as you run'),ts=CUEW(3,'then shoot'),bd=CUEW(3,'before the'),rc=CUEW(3,'recovers'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(rc+.3,rc+.8,t)*.4});
  ground(s,c);
  play(s,c,v,T,tp,tau4(twos(t)-1/12),{minBall:6,near:3,hero:true,ghost:()=>{
   // "keep the ball close": the touch spots stamped yellow
   const kw=sm(kb-.1,kb+.3,t)*(1-sm(E-.8,E-.5,t));if(kw>0){groundRing(s,c,CATCH_PT[0],CATCH_PT[2],.45,kw);if(T>T_TOUCH2-.05)groundRing(s,c,TOUCH2_PT[0],TOUCH2_PT[2],.45,kw);}
   // "as you run": her path on the grass (yellow)
   const rw=sm(ar-.1,ar+.5,t,easeOut)*(1-sm(E-.8,E-.5,t));if(rw>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const[x,z]=posOf(H_I,lerp(T_CATCH-.4,T_SHOT,i/14)),q=pr(c,[x,.01,z]);if(q)pts.push(q);}
    if(pts.length>4){const d=depth(c,[86,0,17]),line=partial(smoothPts(pts,false,4,2),rw);if(line.length>1){s.knockout(ribbon(line,Math.max(6,c.F*.1/d),{seed:65,taper:.1,wobble:.6}),.8);s.fill(Y,ribbon(line,Math.max(4,c.F*.055/d),{seed:65,taper:.1,wobble:.6}),.9);}}}
   // "before the defender recovers": an orange arrow for the chasing defender, stopping short of the ball
   const[ex,ez]=posOf(VE_I,T_SHOT-.5);groundArrow(s,c,[ex,.01,ez],[lerp(ex,SHOT_PT[0],.75),.01,lerp(ez,SHOT_PT[2],.75)],sm(bd-.1,bd+.4,t,easeOut)*(1-sm(E-.8,E-.5,t)),O,.13,76);},
   after:({harder,vanes,bg,br})=>{
    tether(s,harder,bg,br,sm(kb-.1,kb+.3,t)*(1-sm(ts-.2,ts+.1,t)));
    // "then shoot": the shot's line into the near post and a burst in the net
    flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(ts-.1,ts+.3,t)*(1-sm(E-.7,E-.4,t)),Y,.12);
    gapFrame(s,c,sm(ts+.1,ts+.5,t,easeOutBack)*(1-sm(E-.8,E-.5,t)));
    // "recovers": too late — an orange ring round the defender
    if(vanes){const j=vanes.joints,hd=j.head,an=j.lAn;screenRing(s,[lerp(hd[0],an[0],.5),lerp(hd[1],an[1],.5)],Math.hypot(an[0]-hd[0],an[1]-hd[1])*.6+8,sm(rc-.1,rc+.3,t,easeOutBack)*(1-sm(E-.7,E-.4,t)),O);}
    const age=T-T_GOAL;if(age>-.03&&age<.5){const q=pr(c,POST);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.7/depth(c,POST),{n:10,seed:93,g:easeOutBack(clamp((age+.03)/.1))*(1-clamp((age-.35)/.15)),width:Math.max(6,c.F*.05/depth(c,POST))});}}});
 },
 still:5,
};

const film:RisoStory={
 id:'harder-signature',format:'11v11',title:"Harder's dribble and shot",theme:'Keep the ball close as you run, then shoot before the defender recovers',
 ageNote:'UEFA Women’s Euro 2017 final, Netherlands v Denmark, De Grolsch Veste, Enschede, 6 August 2017. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a yellow spark and a little burst of white-and-navy confetti where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(g>0)sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age<.9){const u=easeOut(clamp(age/.6)),r=80+160*u;confetti(s,[K,'paper',O],[x-r,y-r*.8+120*age*age,r*2,r*1.4],10,seed+1,{size:18*(1-clamp((age-.6)/.3))+2,cov:.95});}},
};
export default film;
/** Solved contact points (pitch metres; X to the Dutch goal line at 105, Z across; the near post at Z = +3.66) — checked by the test. */
export const FACTS={BALL0,CATCH_PT,TOUCH2_PT,SHOT_PT,LAND1,POST,GOAL,ballAt,T_CATCH,T_TOUCH2,T_SHOT,T_GOAL,
 harderAt:(T:number)=>posOf(H_I,T),vanEsAt:(T:number)=>posOf(VE_I,T),vdgAt:(T:number)=>posOf(VG_I,T),keeperAt:(T:number)=>posOf(GK_I,T),
 keeperHands:(T:number)=>{const sk=skAt(GK_I,T);return[sk.lHa,sk.rHa];},
 harderToes:(T:number)=>{const sk=skAt(H_I,T);return{l:sk.lToe,r:sk.rToe};}};
