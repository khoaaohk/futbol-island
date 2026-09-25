/** Signature film: Khvicha Kvaratskhelia, "the mazy run from the left" (lib/town/iconicPlays.json, kind "signature", template
 * solo_dribble_goal, side left, 3 beaten, right foot). The signature is shown through ONE real, well-documented goal: Napoli 2–0 Atalanta,
 * Serie A matchday 26, Stadio Diego Armando Maradona, Naples, Saturday 11 March 2023, Napoli's first goal (60th minute).
 * WHY THIS MOMENT: it is his best-known slalom. He took Osimhen's lay-off on the left, dribbled into the box twisting and turning past
 * the Atalanta defenders with small touches and shimmies, and hit it with his right foot into the roof of the net. It won Serie A Goal
 * of the Month (March 2023) and Goal of the Season, and Spalletti called it "a Maradona-like goal". The lesson comes from his entry:
 * "Keep the ball close with small touches so defenders can't reach it."
 * A RisoStory (chapters mode) played unchanged by the card window and StoryFilmPlayer. The narration mirrors
 * public/plays/narration/kvaratskhelia-signature/script.json. Every action time comes from cue onsets and chapter seconds, so when the lead
 * voices the film (scripts/plays/kokoro-narrate.py kvaratskhelia-signature → timing.json), `withTiming` re-times it with no scene changes.
 *
 * SOURCES (fetched Sept 2026 with curl, cached in scratchpad/films/src-cache; we could not watch the footage):
 *  - Football Italia, Susy Campanale, "Serie A | Napoli 2-0 Atalanta: Kvaratskhelia makes defenders dizzy" (11 March 2023): "Napoli got
 *    their opener when Andre-Frank Zambo Anguissa won it back in midfield and Osimhen laid off for Kvaratskhelia, who went on a slalom to
 *    twist and turn, leaving defenders dizzy until he could blast it into the roof of the net with his right boot from 12 yards"; TNT
 *    embed "sits down the Atalanta back line with a dazzling run and thumping finish"; the line-ups and substitutions; 17:00 kick-off;
 *    Gollini in goal for Napoli (Meret hurt in the warm-up); Djimsiti off injured at 44' for Demiral.
 *    https://football-italia.net/serie-a-napoli-2-0-atalanta-kvaratskhelia-makes-defenders-dizzy/
 *  - ESPN (Reuters) report, gameId 644875: "in the 60th minute when Osimhen set up Kvaratskhelia, who slalomed inside the box before
 *    putting Napoli in front with a powerful strike into the roof of the net"; earlier "dribbled his way into Atalanta's box from the left
 *    touchline". https://www.espn.com/soccer/report/_/gameId/644875
 *  - The Daily Star (agencies), "Kvaratskhelia goal echoes Maradona genius" (12 March 2023): "slalomed his way into the penalty area and
 *    left defenders floundering before burying a fierce finish into the roof of the net"; "left Atalanta captain Rafael Toloi bamboozled
 *    by his shimmying footwork"; Spalletti: "a Maradona-like goal ... first with Anguissa's great ball recovery, then with Osimhen's
 *    progression"; defenders in trouble "without ever making it clear whether he'll go to the right or to the left, and then he shoots
 *    with precision and power". https://www.thedailystar.net/sports/football/news/kvaratskhelia-goal-echoes-maradona-genius-3269081
 *  - Wikipedia, "Khvicha Kvaratskhelia": Serie A Goal of the Month and Goal of the Season for this goal (2–0 v Atalanta, 11 March); an
 *    inverted left winger who favours cutting inside from the left to shoot with his stronger right foot; nicknamed "Kvaradona".
 *    https://en.wikipedia.org/wiki/Khvicha_Kvaratskhelia
 * CONFIRMED by those accounts: date, venue, score, 60th minute; Anguissa's ball-winning, Osimhen's lay-off (the assist) to Kvaratskhelia;
 *  a slalom into the box; captain Tolói beaten by his shimmies; more than one defender left "dizzy"/"floundering"; RIGHT-foot finish from
 *  about 12 yards into the roof of the net past Juan Musso; his number 77; Kvaratskhelia plays on the left and cuts inside; the nickname.
 * INFERRED / ILLUSTRATIVE: every position and timing in metres and seconds; where exactly he received (just outside the left of the box);
 *  that THREE defenders are beaten (the entry's `beaten: 3`; the sources say "defenders" and name only Tolói) and who the other two are
 *  (drawn as Demiral, on for Djimsiti, and Scalvini; not named in the narration); the order and direction of each shimmy; Musso's late dive;
 *  the exact spot in the roof of the net; the celebration run; the other players' positions; Napoli attacking left-to-right on the main
 *  camera; KITS: Napoli in their sky-blue home shirts with white shorts, Atalanta in white change shirts (not verified for that day, so
 *  neither kit colour is named in the narration); Musso's yellow kit; Osimhen's bleached hair (his protective mask is not drawn); the
 *  ball drawn as a generic white match ball; the stadium drawn as an oval two-tier bowl round a blue running track under a roof ring,
 *  floodlights on at dusk (the goal came around 18:05 local, near sunset); crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (seconds,
 * τ = 0 his first touch of Osimhen's lay-off). ch1 = the high main-stand camera, live (Osimhen's lay-off → the slalom past three → the
 * finish); ch2 = the TV slow-motion replay from a low touchline camera (the ball-close ring, touch ticks, the defender's reach zone
 * meeting only air, the fake and the real cut); ch3 = the replay from behind the goal (the shift onto his right foot, the shot into the
 * roof, then he wheels away); ch4 = the lesson from a low front camera on the Tolói beat. Figures: lib/plays/riso/athlete.ts through ONE
 * adapter, drawPlayer(). Framing: the full sheet on the canvas centre (card window 1.45:1 … square), never sheet.safe. Inks: yellow (grass
 * with blue, floodlights, cue marks), orange (skin, arrows, boards), blue (Napoli sky blue, track, sky), navy (key line, shade). Poses on
 * twos, cameras on ones, all randomness seeded; small wide-shot figures print at 'low' and passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.9 words/s plus sentence pauses (Kokoro reads ~2.9 words/s); replaced by the measured Kokoro onsets once timing.json exists.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.9+(/\.\.\.$/.test(w)?.5:/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`kvaratskhelia film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py kvaratskhelia-signature (writes timing.json next to
 * script.json). Then replace the null with `import timingJson from '../../../public/plays/narration/kvaratskhelia-signature/timing.json'`
 * and pass `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/kvaratskhelia-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The goal, live','Naples, 2023, against Atalanta. Osimhen lays it off to Khvicha Kvaratskhelia on the left. He slaloms past one defender, two, three... bang, into the roof of the net!',
  ['Naples','against Atalanta','Osimhen lays','Khvicha Kvaratskhelia','on the left','He slaloms','one defender','two','three','bang','roof of the net']),
 prov('Watch it again','Watch again. Tiny touches keep the ball close, so no defender can reach it. He shimmies left, then right. Which way?',
  ['Watch again','Tiny touches','keep the ball close','no defender','He shimmies','then right','Which way']),
 prov('The finish','Then a quick shift to his right foot, and a thumping shot, high into the net! Fans call him Kvaradona.',
  ['Then a quick shift','right foot','thumping shot','high into the net','Fans call him','Kvaradona']),
 prov('Your turn','Your turn: keep the ball close with small touches, so defenders can\'t reach it.',
  ['Your turn','keep the ball close','small touches','defenders']),
],VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kvaratskhelia: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',O='orange',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** Full-sheet card-window framing: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's arrival scale is kept, so
 * passages behave as in the stories). (never sheet.safe) */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Napoli attack +X, Atalanta's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so his left wing is −Z. */
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Stadio Maradona: an oval two-tier bowl round a running track, roof ring
const CX=52.5,NS=64;
/** a point on the bowl: angle th round the pitch centre, d metres out from the track's outer edge (a squared-off oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(70+d)*Math.sign(c)*Math.pow(Math.abs(c),.6),y,(48+d)*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
const LOW=(b:number):[number,number]=>[1.5+22*b,1.6+11.5*b],UP=(b:number):[number,number]=>[26+20*b,17.5+16*b];
type Bowl={low:V3[][];band:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number;up:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],band:[],up:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.band.push([rim(a,24,13.1),rim(b,24,13.1),rim(b,26,17.5),rim(a,26,17.5)]);
  o.roof.push([rim(a,29,39),rim(b,29,39),rim(b,50,36.5),rim(a,50,36.5)]);
  o.fascia.push([rim(a,29,37.4),rim(b,29,37.4),rim(b,29,39.4),rim(a,29,39.4)]);
  if(i%2===0)o.lamps.push(rim(a+.5/NS*TAU,28.8,38.2));
  for(const [f,rows,up] of [[LOW,9,false],[UP,7,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),11);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,up});}}
 return o;})();
/** everything behind the pitch: the dusk sky, the bowl, the crowd (roar lifts the seat marks, flash = phone flashes), floodlights */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // a March dusk over Naples: deep blue sky, a warm last glow low down
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.34);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const glow=new Path2D();glow.rect(-1e4,-v.hy*.25,2e4,1e4);s.tone(O,glow,.12);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.band[i],band);add(BOWL.roof[i],roof);add(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(B,low,.5);s.tone(K,low,.12);
 s.knockout(up);s.tone(B,up,.5);s.tone(K,up,.26);
 // the crowd: one mark per seat group, sized by distance; Napoli sky blue, white, navy, a few yellow flags and orange flares of colour
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.72?1:q.h<.86?2:q.h<.95?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(B,inks[1],.7);s.fill(K,inks[2],.8);s.fill(Y,inks[3],.9);s.fill(O,inks[4],.85);
 // the upper tier under the roof's shade; the concourse band and the roof underside print dark
 s.tone(K,up,.16);
 s.knockout(band);s.fill(K,band,.7);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.4);
 s.knockout(fas);s.fill(K,fas,.4);
 // floodlights along the roof edge
 const lp=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lp.addPath(polyPath(blob(g[0],g[1],z,z*.5,7,{amp:.05,n:10}),true));}
 s.knockout(lp);s.fill(Y,lp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=7+12*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track (blue oval), grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the right goal drawn later
 * when it is in front of the players, i.e. from the camera behind it) */
const TRACK:V3[]=Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0));
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const tr=polyP(c,TRACK);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(B,p,.62);s.tone(K,p,.22);}
 const g=polyP(c,[[-7,0,-39],[112,0,-39],[112,0,39],[-7,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // boards: far touchline and behind both goals, orange with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37.5],[109,0,-37.5],[109,.9,-37.5],[-4,.9,-37.5]]),polyP(c,[[109,0,-36],[109,0,36],[109,.9,36],[109,.9,-36]]),polyP(c,[[-4,0,36],[-4,0,-36],[-4,.9,-36],[-4,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-37.45],[x+3.4,.25,-37.45],[x+3.4,.65,-37.45],[x,.65,-37.45]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(O,bd,.95);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-2);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back and the roof out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.3],[O,.2]];
const SKIN_TAN:InkFill[]=[[Y,.38],[O,.32],[K,.08]];
const SKIN_DARK:InkFill[]=[[Y,.3],[O,.5],[K,.34]];
/** Napoli: sky-blue home shirt (blue screen), white shorts, sky-blue socks (inferred for the day) */
const NAP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.62],shorts:'paper',socks:[B,.62],boots:K,trim:'paper',skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Kvaratskhelia: number 77 (confirmed), tall and slender, dark hair worn long */
const KVARA_STYLE=NAP({skin:SKIN,number:77,numberInk:'paper',hairStyle:'long',build:{height:1.83,bulk:.9,thighs:.95,head:1},seed:77});
/** Atalanta: white change shirts, shorts and socks, navy trim (inferred for the day) */
const ATA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:K,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Juan Musso: a yellow goalkeeper kit (inferred) */
const MUSSO:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,gloves:[O,.7],sleeves:'long',trim:K,build:{height:1.91},seed:51};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after his first touch)
type Role='kv'|'nap'|'ata'|'gk';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a short pass (contact at `at`) */
type Move={kind:'lunge'|'dive'|'pass';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Tolói gets the shimmy the accounts give him; Demiral and Scalvini are the
 * inferred second and third defenders; where everyone stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Kvaratskhelia',role:'kv',style:KVARA_STYLE,key:true,keys:[[-4,78,-23.5],[-2,81.8,-21.3],[-.75,84.6,-18.8],[0,86.3,-17.2],[.4,87.3,-16.6],[.8,88.3,-16.1],[1.05,88.7,-16.6],[1.3,89.1,-15.9],[1.55,89.9,-14.5],[1.9,90.9,-13.2],[2.2,91.5,-12.2],[2.45,91.8,-12.5],[2.7,92.2,-11.2],[3,93,-9.4],[3.3,93.6,-8],[3.55,93.9,-7.2],[3.8,94.3,-6.4],[4.3,95.3,-6.1],[5,96.4,-7.8],[6.5,98.2,-12.5],[8.5,99.6,-18],[11,100.3,-23]]},
 {name:'Osimhen',role:'nap',style:NAP({skin:SKIN_DARK,hair:[Y,.9],build:{height:1.86,bulk:1.05},number:9,numberInk:'paper',seed:9}),key:true,moves:[{kind:'pass',at:-.75,dur:.7,side:'r'}],
  keys:[[-4,74,-6],[-2,78.5,-8.5],[-.75,83.3,-11],[0,84.6,-11],[1.5,88,-8],[3,92,-3.5],[4,94.2,-2],[6,96.5,-8],[8.5,98.5,-15.5],[11,99,-20]]},
 {name:'Toloi',role:'ata',style:ATA({seed:31,number:2,build:{height:1.85}}),key:true,engage:[-.6,2],moves:[{kind:'lunge',at:1.25,dur:.8,side:'r'}],
  keys:[[-4,93,-12.5],[-1,91.4,-14.6],[.8,90.2,-15.6],[1.25,89.9,-16],[1.7,89.8,-16.3],[2.5,90.8,-14.8],[3.6,92.4,-11.8],[5,93.3,-9.8],[11,94,-9.3]]},
 {name:'Demiral',role:'ata',style:ATA({seed:32,skin:SKIN_TAN,build:{height:1.9,bulk:1.06}}),key:true,engage:[1.8,3.3],moves:[{kind:'lunge',at:3.02,dur:.8,side:'l'}],
  keys:[[-4,95,-4],[0,94.8,-7.2],[2.2,94.6,-10.4],[2.9,94.1,-10.5],[3.4,94.4,-10.2],[5,95.5,-8.2],[11,96,-7.8]]},
 {name:'Scalvini',role:'ata',style:ATA({seed:33,build:{height:1.94}}),key:true,engage:[3,4.2],moves:[{kind:'lunge',at:3.9,dur:.75,side:'r'}],
  keys:[[-4,95,5],[0,95.6,1],[2.5,96,-2.2],[3.6,95.6,-4.2],[3.9,95.5,-4.6],[5,96.4,-4.2],[11,97,-3.5]]},
 {name:'Musso',role:'gk',style:MUSSO,key:true,moves:[{kind:'dive',at:4.2,dur:.85,side:'r'}],keys:[[-4,103.6,.5],[2,103.8,-.4],[3.5,103.8,-.8],[11,103.8,-.8]]},
 {name:'de Roon',role:'ata',style:ATA({seed:34,hairStyle:'balding'}),keys:[[-4,81,-12],[0,83.5,-17.5],[2,86.5,-19],[4,89.5,-16],[11,92,-13]]},
 {name:'Maehle',role:'ata',style:ATA({seed:35,hair:[Y,.8]}),keys:[[-4,86,-28],[0,88.5,-23],[4,92,-19],[11,95,-17]]},
 {name:'Ederson',role:'ata',style:ATA({seed:36,skin:SKIN_DARK}),keys:[[-4,78,4],[0,86,2],[4,90.5,1],[11,92,-1]]},
 {name:'Ruggeri',role:'ata',style:ATA({seed:37}),keys:[[-4,90,22],[4,96,13],[11,98,9]]},
 {name:'Politano',role:'nap',style:NAP({seed:21}),keys:[[-4,80,20],[0,88,14],[4,95,8],[7,97,-2],[11,98,-12]]},
 {name:'Zielinski',role:'nap',style:NAP({seed:22,hair:[Y,.7]}),keys:[[-4,72,2],[0,82,0],[4,88,2],[11,95,-10]]},
 {name:'Anguissa',role:'nap',style:NAP({seed:23,skin:SKIN_DARK,build:{height:1.84,bulk:1.1}}),keys:[[-4,66,-2],[0,74,-4],[4,80,-4],[11,90,-12]]},
 {name:'Olivera',role:'nap',style:NAP({seed:24}),keys:[[-4,70,-25],[0,79,-27],[4,86,-25],[11,95,-21]]},
 {name:'Di Lorenzo',role:'nap',style:NAP({seed:25}),keys:[[-4,66,22],[11,80,15]]},
];
const KV=0,OSI=1,TOLOI=2,DEMIRAL=3,SCALVINI=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Osimhen's carry and lay-off, small right-foot touches, the finish
/** his dribble stride: one right-foot touch per cycle of CYC metres (the touch lands at the gait's touchPhase) — small touches */
const CYC=2.3,SHOT=3.9,IN_NET=SHOT+.4,PASS=-.75;
/** the touches: every stride from the first touch, plus the cuts past Tolói and Demiral and the shift onto the right foot (inferred) */
const FORCED=[1.32,2.72,3.55];
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(KV,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.3;tau+=DT){const ph=distOf(KV,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.28&&FORCED.every(f=>Math.abs(f-tau)>.26))out.push(tau);prev=ph;}
 return[...out,...FORCED].sort((a,b)=>a-b).concat([SHOT]);})();
const yawKV=(tau:number)=>{const v=velOf(KV,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0;};
/** ball spot for the right foot: ahead and a touch to his right */
const footAt=(k:number,tau:number):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),y=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0,f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)];return[p[0]+f[0]*.46+r[0]*.12,p[1]+f[1]*.46+r[1]*.12];};
const TP=TOUCHES.map(t=>footAt(KV,t));
/** into the roof of the net at the near post (inferred spot), then down behind the line */
const NET:V3=[105.4,2.15,-2.1],REST:V3=[106.4,.11,-1.9];
function ballAt(tau:number):V3{
 if(tau<PASS){const x=footAt(OSI,tau);return[x[0],.11,x[1]];}
 if(tau<0){const x=footAt(OSI,PASS),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.5),to=TP[0];return[lerp(x[0],to[0],e),.11,lerp(x[1],to[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),lerp(.11,NET[1],u)+.45*Math.sin(Math.PI*u),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e*e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the shimmy: shoulders and hips dipped one way (dir +1 = to his right/inside), knees bent, the far arm out for balance */
const SHIMMY=(dir:number):Partial<Pose>=>({roll:12*dir,bend:14*dir,twist:-10*dir,lean:22,lKnee:56,rKnee:54,lShA:dir>0?28:78,rShA:dir>0?78:28,neckY:-8*dir,squash:-.05});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(KV,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===KV)yaw=yawKV(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ata'?READY:stand();
 if(k===KV&&tau>-.2&&tau<SHOT){// small, quick right-foot dribbling strides
  const s=clamp((sp-2)/4.5);p=blendPose(idle,dribble(distOf(KV,tau)/CYC,{foot:'r',speed:.45+.35*s}),clamp((sp-.3)/.8));}
 else if(k===OSI&&tau<PASS+.1)p=blendPose(idle,dribble(distOf(OSI,tau)/2.6,{foot:'r',speed:.55}),clamp((sp-.3)/.8));
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='pass'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='pass'&&u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.25}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.85});}
 if(k===KV){
  // the shimmies: out (−) then in (+) at Tolói, again at Demiral, then the shift onto the right foot
  p=over(p,SHIMMY(-1),bump(.85,1.3,tau));p=over(p,SHIMMY(1),bump(1.2,1.75,tau));
  p=over(p,SHIMMY(-1),bump(2.25,2.65,tau));p=over(p,SHIMMY(1),bump(2.55,3.05,tau));p=over(p,SHIMMY(1),bump(3.35,3.75,tau)*.7);
  const D=.85,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.95}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
 }
 if(k===OSI&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a white match ball (navy panels)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),tri=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr],[cx+Math.cos(b)*pr*.45,cy+Math.sin(b)*pr*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;before?:()=>void;after?:(r:PlayOut)=>void;ring?:number}={}):PlayOut{
 const{minBall=6,hero=false,ring=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlit: soft and short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.4);
 if(ring>0){const m=posOf(KV,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.45+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.1/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===KV?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===KV||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===KV}:{});
  if(e.k===KV)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / a fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** touch ticks: a yellow spark at each touch as it happens, and the trail of touch spots left on the grass (fading) */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number,span=2.4){if(w<=0)return;
 const dots=new Path2D();let any=false;
 TOUCHES.forEach((T,i)=>{const age=tau-T;if(age<0||age>span||T>=SHOT)return;const[x,z]=TP[i],q=toCam(c,[x,0,z]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.12/q[2]*(1-.45*age/span);
  dots.addPath(polyPath(blob(g[0],g[1],r,r*.42,i+3,{amp:.08,n:12}),true));any=true;
  if(age<.28){const b=pr(c,[x,.12,z]);if(b)sparkBurst(s,Y,b[0],b[1],c.F*.42/q[2],{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.1)),width:Math.max(4,c.F*.035/q[2]),cov:.95*w});}});
 if(any){s.knockout(dots,.8*w);s.fill(Y,dots,.9*w);}
}
/** the real cut: an orange arrow on the grass along his path through the change of direction */
function cutArrow(s:Sheet,c:Cam,tc:number,w:number){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=14;i++){const tau=tc-.35+.9*i/14,[x,z]=posOf(KV,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*.11/d;
 s.knockout(ribbon(seg,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(O,ribbon(seg,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,O,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** the fake: a short dashed yellow arrow the way his shoulders dip (outside, toward −Z) — the way he does NOT go */
function fakeArrow(s:Sheet,c:Cam,tf:number,w:number){if(w<=0)return;const[x,z]=posOf(KV,tf),a=pr(c,[x+.2,0,z-.2]),b=pr(c,[x+1.1,0,z-1.9]);if(!a||!b)return;
 const wd=Math.max(4,c.F*.09/toCam(c,[x,0,z])[2]);laneArrow(s,Y,a,b,wd,{dashed:true,progress:w,seed:63,head:wd*2.6,cov:.95});}
/** a defender's reach: a navy ring on the grass round his standing spot — the ball stays outside it */
function reachZone(s:Sheet,c:Cam,k:number,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(k,tau),pts:Pt[]=[];
 for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*1.35*w,0,z+Math.sin(i/36*TAU)*1.35*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const q=toCam(c,[x,0,z]),rr=ribbon(pts,Math.max(4,c.F*.06/q[2]),{close:true,seed:71+k,taper:0,wobble:1});s.tone(K,polyPath(pts,true),.28*w);s.fill(K,rr,.8*w);}
/** the defender's boot arrives too late: an orange spark where the ball was */
function missSpark(s:Sheet,c:Cam,k:number,at:number,age:number){if(age<=-.3||age>=.5)return;const[x,z]=posOf(k,at),m=posOf(KV,at),q=pr(c,[lerp(x,m[0],.55),.2,lerp(z,m[1],.55)]);if(!q)return;
 sparkBurst(s,O,q[0],q[1],c.F*.45/toCam(c,[x,.2,z])[2],{n:8,seed:83+k,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:9});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the slalom between them plays at ~0.6–1.2× real time; the pre-roll is Osimhen's carry) */
const tau1=(t:number)=>{const ro=CUEW(0,'roof');return key(t,[[0,-3.7],[CUEW(0,'Osimhen'),PASS-.1],[CUEW(0,'Khvicha'),0],[CUEW(0,'He slaloms'),.75],[CUEW(0,'one defender'),1.3],[CUEW(0,'two'),2.72],[CUEW(0,'three'),3.55],[CUEW(0,'bang'),SHOT],[ro,IN_NET+.1],[SECS(0)+1,IN_NET+.1+(SECS(0)+1-ro)*.9]],linear);};
const CAM1:V3=[52.5,27,82];
function cam1(t:number):Cam{
 const tau=tau1(t),bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,1.2,(b0[2]+b1[2]+b2[2])/3];
 const m=smooth(KV,tau),cel:V3=[m[0]-1,1.2,m[1]],G=CUEW(0,'roof'),toD=sm(G+.3,G+1.6,t,easeInOutSine),open=1-sm(0,1.6,t,easeInOutSine);
 const goalward=.75*sm(CUEW(0,'three')-.6,CUEW(0,'bang')+.2,t,easeInOutSine)*(1-toD);
 const T=lerp3(lerp3(lerp3(bt,[88,1,-4],open*.5),[100,1,-3.5],goalward),cel,toD);
 const F=key(t,[[0,6200],[CUEW(0,'Osimhen'),8600],[CUEW(0,'Khvicha'),10000],[CUEW(0,'one'),11200],[CUEW(0,'bang'),11200],[G+1.5,12400],[SECS(0),13000]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'bang');
  stadium(s,c,v,t,{roar:sm(G+.2,G+.7,t),flash:sm(G+.3,G+.55,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(KV,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: small touches, Tolói, the shimmy at Demiral
const tau2=(t:number)=>key(t,[[0,-.3],[CUEW(1,'Tiny'),.15],[CUEW(1,'keep'),.6],[CUEW(1,'no defender'),1.22],[CUEW(1,'He shimmies'),2.3],[CUEW(1,'then right'),2.72],[CUEW(1,'Which'),3.05],[SECS(1),3.35]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(KV,tau),open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(1,'Tiny')-.3,CUEW(1,'keep'),t,easeInOutSine)*(1-sm(CUEW(1,'no defender')-.2,CUEW(1,'no defender')+.4,t)),back=sm(CUEW(1,'He shimmies')-.6,CUEW(1,'He shimmies'),t,easeInOutSine);
 const up=sm(CUEW(1,'keep')+.2,CUEW(1,'no defender')-.2,t,easeInOutSine)*(1-back*.5);
 const C:V3=[m[0]-5.2+1.5*open-3.5*up,1.55+.3*open+2.6*up,m[1]+8.2+3*open-2.5*push+1.6*back-2*up],T:V3=[m[0]+1.6,.85-.15*push,m[1]-.4];
 return look(C,T,2700+650*push-300*back-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ti=CUEW(1,'Tiny'),kb=CUEW(1,'keep'),nd=CUEW(1,'no defender'),hs=CUEW(1,'He shimmies'),tr=CUEW(1,'then right'),ww=CUEW(1,'Which'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  touchMarks(s,c,tau,sm(ti-.2,ti+.2,t)*(1-sm(E-1,E-.6,t)),2.2);
  // "no defender can reach it": Tolói's reach ring, his lunge meets only air
  const rz=sm(nd-.4,nd,t,easeOutBack)*(1-sm(hs-.8,hs-.4,t));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,ring:sm(kb-.1,kb+.3,t,easeOutBack)*(1-sm(nd+.3,nd+.8,t)),
   before:()=>{reachZone(s,c,TOLOI,Math.min(tau,1.25),rz);
    // "left, then right": the fake (dashed, outside) and the real cut (inside) at Demiral
    fakeArrow(s,c,2.4,sm(hs-.1,hs+.4,t,easeOut)*(1-sm(E-1,E-.6,t)));
    cutArrow(s,c,2.75,sm(tr-.2,tr+.4,t,easeOut)*(1-sm(E-1,E-.6,t)));},
   after:()=>{missSpark(s,c,TOLOI,1.25,t-nd);missSpark(s,c,DEMIRAL,3.02,t-ww);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the shift, the right-foot shot into the roof, he wheels away
const tau3=(t:number)=>{const fc=CUEW(2,'Fans');return key(t,[[0,2.95],[CUEW(2,'Then'),3.3],[CUEW(2,'right foot'),3.62],[CUEW(2,'thumping'),SHOT+.02],[CUEW(2,'high'),IN_NET+.12],[fc,IN_NET+1.3],[SECS(2),IN_NET+1.3+(SECS(2)-fc)*.8]],linear);};
const swing3=(t:number)=>sm(CUEW(2,'high')+.4,CUEW(2,'Fans')+.8,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(KV,tau),e=sm(SHOT-.2,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'Kvaradona')-.3,SECS(2),t,easeInOutSine);
 const C0:V3=[118,5.5,-6.5+1.2*e],T0:V3=[lerp(m[0],101,e),lerp(.95,1.5,e),lerp(m[1]*.9,-3,e)];
 const C1:V3=[m[0]+7+hold,2.1+.4*hold,m[1]+6.5+1.2*hold],T1:V3=[m[0]-.4,1.2+.5*hold,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3900+300*sm(0,CUEW(2,'right foot'),t),3300-250*hold,u)*(1-.3*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),rf=CUEW(2,'right foot'),hi=CUEW(2,'high'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(hi-.1,hi+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,before:()=>{cutArrow(s,c,3.6,sm(CUEW(2,'Then')-.1,CUEW(2,'Then')+.5,t,easeOut)*(1-sm(CUEW(2,'thumping')-.1,CUEW(2,'thumping')+.3,t)));},
   after:({hero})=>{
    // "right foot": an orange ring round the right boot
    const lw=sm(rf-.15,rf+.25,t,easeOutBack)*(1-sm(CUEW(2,'thumping')+.2,CUEW(2,'thumping')+.5,t));
    if(hero&&lw>0){const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.8]);}
     s.fill(O,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}
    // "thumping shot": the ball's flight line, rising into the roof
    const fw=sm(CUEW(2,'thumping')-.05,CUEW(2,'thumping')+.3,t)*(1-sm(hi+.6,hi+1.1,t));
    if(fw>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,ballAt(SHOT+(Math.min(tau,IN_NET)-SHOT)*i/16));if(q)pts.push(q);}
     if(pts.length>3){const wd=Math.max(4,c.F*.07/toCam(c,[100,1,-4])[2]);s.fill(Y,ribbon(pts,wd,{seed:84,taper:.6,wobble:.5}),.9*fw);}}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(KV,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the Tolói beat
const tau4=(t:number)=>key(t,[[0,.3],[CUEW(3,'keep'),.6],[CUEW(3,'small'),.95],[CUEW(3,'defenders'),1.3],[SECS(3),1.75]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(KV,tau),push=sm(CUEW(3,'keep')-.3,CUEW(3,'keep')+.5,t,easeInOutSine),back=sm(CUEW(3,'defenders')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]-3.8-1.2*back,1.4+.4*back,m[1]+5.8+1.5*back],T:V3=[m[0]+1,.85-.1*push,m[1]-.3];
 return look(C,T,2500+450*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),kb=CUEW(3,'keep'),st=CUEW(3,'small'),df=CUEW(3,'defenders'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  touchMarks(s,c,tau,sm(st-.2,st+.2,t)*(1-sm(E-1,E-.6,t)),1.6);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(kb-.1,kb+.35,t,easeOutBack),
   before:()=>{reachZone(s,c,TOLOI,Math.min(tau,1.25),sm(df-.35,df+.1,t,easeOutBack));},
   after:()=>{missSpark(s,c,TOLOI,1.25,t-df-.1);}});
 },
 still:4,
};

const film:RisoStory={
 id:'kvaratskhelia-signature',format:'11v11',title:'Kvaratskhelia: the mazy run from the left',theme:'Close control: small touches keep the ball away from defenders',
 ageNote:'Serie A, Napoli 2–0 Atalanta, Stadio Diego Armando Maradona, Naples, 11 March 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(O,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
