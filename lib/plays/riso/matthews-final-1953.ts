/** Iconic play film: "The Matthews Final" — Stanley Matthews beats Ralph Banks, reaches the byline and cuts it back for Bill Perry's
 * winner, 1953 FA Cup final, Blackpool 4–3 Bolton Wanderers, Wembley Stadium, London, 2 May 1953 — the last minute (90+1'/90+2'), 3–3 → 4–3.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/matthews-final-1953/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/matthews-final-1953/timing.json exists, replace `null` in `const VOICE` below with the imported timing
 *   import timingJson from '../../../public/plays/narration/matthews-final-1953/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage):
 *  - Wikipedia, "1953 FA Cup final" (raw wikitext: match summary citing BBC Sport 2001 and fa-cupfinals.co.uk; football box, kit boxes,
 *    line-ups)  https://en.wikipedia.org/wiki/1953_FA_Cup_final
 *  - Wikipedia, "Stanley Matthews" (outside right, 38 years old, "the Matthews final")  https://en.wikipedia.org/wiki/Stanley_Matthews
 *  - Wikipedia, "Bill Perry (footballer)" (outside left; the injury-time winner)
 *  - BBC Sport, "1953 – The Matthews final" (10 May 2001)  http://news.bbc.co.uk/sport2/hi/football/fa_cup/1321960.stm
 *  - The Guardian, "Blackpool 4-3 Bolton Wanderers: 1953 FA Cup final – as it happened" (Scott Murray's 2020 re-run from the footage)
 *    https://www.theguardian.com/football/live/2020/may/02/blackpool-v-bolton-wanderers-1953-fa-cup-final-live
 *  - RetroFootball, "1953 FA Cup Final – Blackpool vs Bolton Wanderers" (archived 2010, incl. a reader's DVD-based correction)
 * CONFIRMED by those accounts: 2 May 1953, Wembley, kick-off 15:00 BST, 100,000; referee Mervyn Griffiths; Bolton led 3–1 (Lofthouse 2',
 *  Moir 39', Bell 55'); Mortensen 68' (from a Matthews cross from the right) and 89' (free kick) made it 3–3; the winner came in stoppage
 *  time (90+1'/90+2'): ERNIE TAYLOR played a first-time diagonal pass to MATTHEWS ON THE RIGHT; Matthews ENTERED THE BOX, DROPPED A
 *  SHOULDER TO EARN A YARD OFF RALPH BANKS (Bolton's left-back, injured and tiring), HEADED FOR THE BYLINE and CUT IT BACK LOW; the ball
 *  PASSED JUST BEHIND MORTENSEN at the near post and BILL PERRY LASHED IT INTO THE BOTTOM LEFT (Guardian: "an unstoppable drive into the
 *  bottom left"). The reader's DVD note: Matthews beat Banks ON THE OUTSIDE with an outside-foot touch, the ball under control throughout.
 *  KITS (Wikipedia kit boxes): Blackpool TANGERINE shirts with a WHITE COLLAR, WHITE shorts, BLACK socks with tangerine tops; Bolton WHITE
 *  shirts, NAVY shorts, navy socks with white hoops. Numbers: Matthews 7, Taylor 8, Mortensen 9, Mudie 10, Perry 11, Fenton 4; Bolton
 *  Hanson 1, Ball 2, Banks 3, Wheeler 4, Barrass 5, Hassall 10. Matthews was 38. First big TV audience for a sporting event (BBC).
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; which end of Wembley and that Blackpool attack toward the
 *  screen-right goal with Matthews on the near touchline; where Banks was beaten and the exact shape of the dummy (a drop of the left
 *  shoulder inside, then the outside of the right boot); Matthews's right foot for the touches and the cut-back (he is not named as
 *  right-footed in these sources); PERRY'S SHOOTING FOOT (drawn left, an outside-left meeting a ball rolling across him; not narrated); the
 *  keeper's dive (Hanson drawn going to his right, too late); where Barrass, Ball, Hassall, Wheeler, Mudie, Fenton and the referee were;
 *  the keeper's dark jersey and the referee's black; the brown leather ball; the long sleeves; tangerine socks drawn plain black (tops
 *  omitted) and Bolton's socks plain navy (hoops omitted); Wembley as drawn in 1953 (roofs over the two long stands only, open end terraces,
 *  no floodlights, the greyhound track, the twin towers behind the west end); a hazy May afternoon; camera placements and lenses. 1953
 *  television had no slow-motion replays: our replays are the film's device, drawn as a newsreel.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 Matthews receives Taylor's pass): ch1 = the high main-stand BBC camera, near real time,
 * printed as a 1953 television picture (rounded 405-line screen, rolling bar, film scratches, a grey-green pitch; only the tangerine
 * keeps its full colour); ch2 = the newsreel slow-motion replay from low behind the winger (the shoulder drop, Banks leans the wrong way,
 * the outside touch, away to the byline); ch3 = the reverse angle, low on the far side of the box (the cut-back, just behind Mortensen, Perry's
 * drive, the net); ch4 = the lesson in full colour from a raised three-quarter camera (take on the full-back, get to the byline, cut it
 * back across goal). Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer().
 * Inks: yellow (sunlight, grass with blue, teaching marks), orange (Blackpool tangerine, skin, the cinder track, the leather ball), blue
 * (sky, grass), navy (key line, Bolton shorts, the television dark). Scenes read only their local t; figures pose on twos, cameras on ones;
 * all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',O='orange',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe region (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9']/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`matthews film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/matthews-final-1953/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Last minute',"Wembley, 1953, the FA Cup final. Blackpool were two goals down; now it's three all, last minute. Stanley Matthews gets it on the right, beats his man, races to the line, cuts it back... Bill Perry scores!",
  ['Wembley','the FA Cup final','Blackpool','two goals down',"three all",'last minute','Stanley Matthews','on the right','beats his man','races to the line','cuts it back','Bill Perry','scores']),
 prov('The shoulder','Slow motion. Matthews drops his shoulder, Banks leans the wrong way, and one touch round the outside takes him to the byline.',
  ['Slow motion','Matthews drops','his shoulder','Banks leans','the wrong way','one touch','round the outside','the byline']),
 prov('The cut-back','From the byline he cuts it back, low, just behind Mortensen. Perry smashes it in!',
  ['From the byline','cuts it back','low','just behind Mortensen','Perry smashes','it in']),
 prov('Your turn','Your turn: take on the full-back, get to the byline, cut it back across goal.',
  ['Your turn','take on the full-back','get to the byline','cut it back','across goal']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`matthews film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Blackpool attack the goal at x = 0, the pitch runs to x = −105;
// Matthews's right wing is +z, the near touchline for the main-stand camera) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
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
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Wembley, May 1953: roofs over the two long stands only, open end terraces, the dog track, the twin towers, no floodlights =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(63+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+10.5*b];
type Bowl={low:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],back:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const side=Math.abs(Math.sin((a+b)/2))>.62;// the long (north/south) stands had roofs in 1953; the end terraces were open
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.back.push([rim(a,22,11.6),rim(b,22,11.6),rim(b,22,side?21.5:14.5),rim(a,22,side?21.5:14.5)]);
  if(side){o.roof.push(Q(13,20.6,34,23.5));o.fascia.push(Q(13,19.4,13,20.7));}
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,19);if(h<.14)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;wave?:number;era:number};
/** era 1 = the 1953 television picture (greys, only the tangerine in colour); era 0 = the lesson's full colour */
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,wave=0,era}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a hazy May afternoon: pale blue, greyed on the television
 s.field(B,lerp(.42,.26,era),.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-520],[-Bnd,hz-440]],true),.1+.14*era);
 towers(s,c);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D(),add2=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add2(BOWL.back[i],back);add2(BOWL.low[i],low);}
 for(const q of BOWL.roof)add2(q,roof);for(const q of BOWL.fascia)add2(q,fas);
 s.knockout(back);s.tone(K,back,.55);s.tone(B,back,.3);
 s.knockout(low);s.tone(B,low,.35);s.tone(K,low,.3);
 // the crowd: one mark per seat group (white shirts, rosettes and faces / tangerine / Bolton navy / dark coats), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),ph=Math.max(0,Math.sin(tt*11+q.h*TAU)),lift=(cheer>0?cheer*z*1.2*ph:0)+(wave>0&&q.h>.42&&q.h<.6?wave*z*.8*ph:0);
  inks[q.h<.42?0:q.h<.6?1:q.h<.78?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(O,inks[1],.9);s.fill(B,inks[2],.8);s.fill(K,inks[3],.78);}
 // the roofs over the long stands: dark underside, a sunlit fascia
 s.knockout(roof);s.fill(K,roof,.85);
 s.knockout(fas);s.tone(Y,fas,.3);s.tone(K,fas,.3);
}
/** Wembley's twin towers behind the west end: white concrete shafts, domed tops and flagpoles, rising over the terrace */
function towers(s:Sheet,c:Camera){
 const body=new Path2D(),dome=new Path2D(),win=new Path2D(),pole=new Path2D();let n=0;
 for(const z of[-11,11]){const base:V3=[-152,12,z];if(depthOf(c,base)<30)continue;const k=kAt(c,base),[x,y]=P(c,base);if(Math.abs(x)>s.W*1.2)continue;
  const top=P(c,[-152,29,z])[1],dt=P(c,[-152,37,z])[1],pt=P(c,[-152,43,z])[1],w=3.6*k;
  body.addPath(polyPath([[x-w,y],[x+w,y],[x+w*.9,top],[x-w*.9,top]],true));
  dome.addPath(polyPath([...Array.from({length:13},(_,i)=>{const a=Math.PI*i/12;return[x-Math.cos(a)*w*.86,top-(top-dt)*Math.sin(a)] as Pt;})],true));
  dome.rect(x-w*.95,top-.8*k,w*1.9,1.2*k);
  for(let j=0;j<3;j++){const yy=lerp(y,top,.3+j*.22);win.rect(x-w*.12,yy-1.6*k,w*.24,1.6*k);}
  pole.addPath(ribbon([[x,dt],[x,pt]],Math.max(1.5,.3*k),{taper:0,wobble:0}));n++;}
 if(!n)return;s.knockout(body);s.tone(K,body,.12);s.knockout(dome);s.tone(B,dome,.2);s.tone(K,dome,.15);s.fill(K,win,.7);s.fill(K,pole,.9);
 s.stroke(K,body,3,.6);
}
/** the pitch: cinder dog track, sunlit grass (grey-green on the television, yellow × blue in the lesson), mowing stripes, paper lines, goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;era:number}){
 const e=o.era;
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(tr);s.fill(O,tr,lerp(.5,.3,e));s.tone(K,tr,lerp(.22,.35,e));
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(Y,gp,lerp(.88,.3,e));s.tone(B,gp,lerp(.62,.45,e));if(e>.05)s.tone(K,gp,.3*e);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
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
/** a 1950s goal on the line x = X, net 2 m deep toward dir: square posts, a box net on stanchions; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

/** The 1953 television picture, printed: a rounded 405-line screen (navy corners), a slow rolling bar and flickering film scratches.
 * Drawn last, in world units derived from the current transform, so it hugs the card edge at every size. */
function newsreel(s:Sheet,amt:number,t:number){
 if(amt<=.02)return;const pw=s.width*s.dpr,ph=s.height*s.dpr,a=s.toWorld(0,0),b=s.toWorld(pw,ph),x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]);
 const w=x1-x0,h=y1-y0,m=Math.min(w,h),r=m*.13*amt,ins=m*.012*amt,tt=twos(t),rr=rng(900+Math.floor(tt*6));
 // the screen: navy outside a rounded rectangle whose sides bulge very slightly (a cathode-ray tube)
 const scr=new Path2D();scr.rect(x0-4,y0-4,w+8,h+8);
 const ix0=x0+ins,ix1=x1-ins,iy0=y0+ins,iy1=y1-ins,bul=m*.01*amt,pts:Pt[]=[];
 const corner=(cx:number,cy:number,a0:number)=>{for(let i=0;i<=5;i++){const q=a0+i/5*Math.PI/2;pts.push([cx+Math.cos(q)*r,cy+Math.sin(q)*r]);}};
 corner(ix1-r,iy0+r,-Math.PI/2);pts.push([ix1+bul,(iy0+iy1)/2]);corner(ix1-r,iy1-r,0);pts.push([(ix0+ix1)/2,iy1+bul]);corner(ix0+r,iy1-r,Math.PI/2);pts.push([ix0-bul,(iy0+iy1)/2]);corner(ix0+r,iy0+r,Math.PI);pts.push([(ix0+ix1)/2,iy0-bul]);
 scr.addPath(polyPath(pts,true));s.fill(K,scr,.92*amt,'evenodd');
 // a soft bar rolling slowly down the picture (mains hum on a 1953 set)
 const by=y0+((t*.11)%1)*h*1.3-h*.15,bar=new Path2D();bar.rect(x0,by,w,h*.09);s.tone(K,bar,.1*amt);
 // film scratches and dust: one or two thin vertical hairlines and a fleck, re-rolled six times a second
 const scratch=new Path2D();const n=rr()<.55?1:2;for(let i=0;i<n;i++){const x=x0+w*(.12+.76*rr()),top=y0+h*rr()*.3,len=h*(.35+.6*rr());scratch.addPath(ribbon([[x,top],[x+(rr()-.5)*m*.02,top+len]],Math.max(1.4,m*.0035),{taper:.3,wobble:.4,seed:i+Math.floor(tt*6)}));}
 const fx=x0+w*rr(),fy=y0+h*rr(),fr=m*.006;scratch.addPath(polyPath([[fx-fr,fy],[fx,fy-fr*.7],[fx+fr*1.2,fy+fr*.2],[fx,fy+fr]],true));
 s.fill(K,scratch,.6*amt);
}

// ================= the brown leather ball (orange × navy, laced panels) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(O,disc,.75);s.tone(K,disc,.3);
 s.save();s.clip(disc);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.06),.85);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (2 May 1953) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[O,.2],[Y,.45]];
/** Blackpool: tangerine shirts with a white collar, white shorts, black socks (confirmed; the tangerine sock tops are omitted, long sleeves inferred) */
const BLK=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:'paper',socks:K,trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'long',numberInk:'paper',...o});
/** Bolton Wanderers: white shirts, navy shorts, navy socks (confirmed; the white sock hoops are omitted) */
const BOL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:K,...o});
const MATTHEWS:AthleteStyle=BLK({number:7,hair:[K,.85],build:{height:1.74,bulk:.92,thighs:.98},seed:7});
const PERRY:AthleteStyle=BLK({number:11,hair:[Y,.6],build:{height:1.75,bulk:1},seed:11});
const HANSON:AthleteStyle={shirt:[K,.72],shorts:[K,.9],socks:[K,.6],boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.8},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'long',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Matthews receives Taylor's pass) =================
type TK=[number,number,number];// τ, x, z
type Role='mat'|'blk'|'bol'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
/** Positions are Hermite-interpolated between keys. Taylor's pass, Matthews, Banks, Mortensen and Perry follow the accounts; the rest are placed. */
const ACTORS:Actor[]=[
 {name:'Matthews',role:'mat',style:MATTHEWS,key:true,keys:[[-10,-38,30],[-5,-33,29],[-1.6,-27.5,27],[-.5,-25.2,25.8],[0,-24.5,25.4],[.8,-22.8,24.4],[1.6,-21,23.2],[2.2,-19.8,22.2],[2.6,-19,21.6],[2.85,-18.6,21.2],[3.05,-18.3,20.9],[3.4,-17.3,21.9],[3.8,-15.6,23.1],[4.3,-12.8,23.1],[4.9,-9.2,21.9],[5.4,-6,19.9],[5.8,-3.6,18.3],[6.05,-2.5,17.3],[6.4,-1.9,16.8],[7,-1.8,16.5],[8.5,-2.6,15.2],[10,-4,13.5],[13,-6,11.5]]},
 {name:'Hanson',role:'gk',style:HANSON,key:true,keys:[[-10,-5,3],[0,-3.2,4.5],[4,-2,5.6],[5.5,-1,5],[6.1,-.8,4.2],[6.8,-1.1,2.4],[7.2,-1.2,1.4],[13,-1.2,1.4]]},
 {name:'Banks',role:'bol',style:BOL({number:3,seed:43,hair:[K,.8]}),key:true,keys:[[-10,-24,26],[-4,-22,25],[-1.6,-20.4,24.4],[0,-19.4,23.6],[1.5,-17.2,22.6],[2.5,-16.1,21.9],[3.05,-15.6,20.8],[3.5,-15.6,20.9],[4.1,-14.6,21.3],[4.9,-11.4,20.9],[5.6,-7.8,19.6],[6.3,-5.2,18.3],[7,-4.3,17.6],[9,-4.6,16.6],[13,-5.5,14]]},
 {name:'Perry',role:'blk',style:PERRY,key:true,keys:[[-10,-32,-22],[-4,-25,-16],[0,-19,-10],[3,-15.5,-5.5],[5,-12.8,-2.6],[6.2,-11.4,-.9],[7,-10.5,.2],[7.35,-10.1,.6],[7.8,-9.4,.9],[8.6,-8,2.6],[10,-6,6.5],[13,-4.2,11]]},
 {name:'Mortensen',role:'blk',style:BLK({number:9,seed:9,hair:[K,.9]}),key:true,keys:[[-10,-44,4],[-4,-30,6],[0,-21,6],[3,-14,7],[5,-9,7.8],[6,-5.6,9],[6.5,-3.7,10.6],[7,-2.6,11.6],[8,-2.3,12],[9.5,-3.6,10],[13,-5.4,11]]},
 {name:'Barrass',role:'bol',style:BOL({number:5,seed:45}),key:true,keys:[[-10,-30,2],[0,-16,4],[3,-11,5.5],[5,-6.5,7.2],[6,-4.2,8.3],[6.5,-2.8,9.4],[7,-2.2,9.8],[8,-2.5,8.4],[13,-3,6]]},
 {name:'Ball',role:'bol',style:BOL({number:2,seed:42}),keys:[[-10,-30,-14],[0,-16,-9],[5,-9,-5],[6.5,-7.4,-3.2],[7.35,-6.9,-2.3],[9,-6,-1],[13,-5,0]]},
 {name:'Taylor',role:'blk',style:BLK({number:8,seed:8,build:{height:1.63,bulk:.95}}),key:true,keys:[[-10,-54,7.5],[-6,-48.5,8.2],[-3,-44,8.6],[-1.6,-41.8,8.8],[0,-40.4,9.6],[4,-33,12],[8,-24,12],[13,-18,11]]},
 {name:'Wheeler',role:'bol',style:BOL({number:4,seed:44}),keys:[[-10,-40,4],[-3,-38,9],[-1.6,-36.5,10.5],[0,-33,13],[4,-25,14],[8,-18,12.5],[13,-15,10]]},
 {name:'Hassall',role:'bol',style:BOL({number:10,seed:50,hairStyle:'balding',hair:[K,.7]}),keys:[[-10,-36,-6],[0,-24,-3],[6,-15,-1.5],[13,-12,0]]},
 {name:'Mudie',role:'blk',style:BLK({number:10,seed:10}),keys:[[-10,-42,-12],[0,-25,-12],[6,-12.5,-9],[8,-9,-6],[13,-6,-1]]},
 {name:'Fenton',role:'blk',style:BLK({number:4,seed:4}),keys:[[-10,-50,16],[0,-43,18],[8,-33,15],[13,-28,13]]},
 {name:'Griffiths',role:'ref',style:REF,keys:[[-10,-46,-4],[0,-33,0],[8,-20,3],[13,-15,4]]},
];
const MATI=0,GKI=1,BANKI=2,PERI=3,MORTI=4,TAYI=7;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-10,TB=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball: Taylor carries it, his first-time diagonal, Matthews's touches, the outside touch past Banks, the cut-back, Perry's drive ----
const PASS=-1.6,OUT=3.1,CUT=6.05,SHOT=7.35,DRIVE=.36,IN_NET=SHOT+DRIVE,CYC=2.6;
const GOALPT:V3=[.25,.32,-2.95],REST:V3=[1.6,.16,-2.5],NET_HIT:V3=[2,.35,-2.8];
/** the facing of actor k along its run */
const runYaw=(k:number,tau:number)=>{const v=velOf(k,tau);return Math.hypot(v[0],v[1])>.35?YAW(v[0],v[1]):0;};
/** the cut-back direction (from the byline toward Perry's shooting spot) */
const CUT_DIR=YAW(-7.8,-16.2);
/** Matthews's heading: along his run, opening his body toward the cut-back as he pulls it back */
function yawMat(tau:number){return lerpAng(runYaw(MATI,tau),CUT_DIR,.62*sm(CUT-.45,CUT-.1,tau)*(1-sm(CUT+.7,CUT+1.4,tau)));}
/** Perry's heading: along his run, square to the far corner as he shoots */
function yawPerry(tau:number){const[x,z]=posOf(PERI,tau),toGoal=YAW(GOALPT[0]-x,GOALPT[2]-z);return lerpAng(runYaw(PERI,tau),toGoal,sm(SHOT-.7,SHOT-.25,tau)*(1-sm(SHOT+.6,SHOT+1.1,tau)));}
/** the ball spot at a boot: ahead and a touch to the side of that foot */
function footAt(k:number,tau:number,foot:'l'|'r',ahead=.48,yaw?:number):[number,number]{const p=posOf(k,tau),y=yaw??(k===MATI?yawMat(tau):k===PERI?yawPerry(tau):runYaw(k,tau)),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=foot==='r'?.1:-.12;return[p[0]+fx*ahead+rx*sd,p[1]+fz*ahead+rz*sd];}
/** Matthews's touches: one per dribble stride (right foot) while he runs at Banks, then the outside touch past him, two running touches, the cut-back */
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(MATI,0)/CYC-touchPhase;
 for(let tau=DT;tau<2.5;tau+=DT){const ph=distOf(MATI,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3)out.push(tau);prev=ph;}
 return[...out,OUT,4.45,5.3,CUT];})();
const TP:[number,number][]=TOUCHES.map(t=>footAt(MATI,t,'r',t===CUT?.3:.48));
const PASS_AT=footAt(TAYI,PASS,'r'),CUT_AT:V3=[TP[TP.length-1][0],.11,TP[TP.length-1][1]];
const SHOT_AT:V3=(()=>{const[x,z]=footAt(PERI,SHOT,'l',.34);return[x,.11,z];})();
function ballAt(tau:number):V3{
 if(tau<PASS){const[x,z]=footAt(TAYI,tau,'r',.45+.12*Math.max(0,Math.sin(tau*TAU*1.1)));return[x,.11,z];}
 if(tau<0){const u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.35);return[lerp(PASS_AT[0],TP[0][0],e),.11,lerp(PASS_AT[1],TP[0][1],e)];}
 if(tau<CUT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=TOUCHES[k]===OUT?1-Math.pow(1-u,1.4):1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<SHOT){const u=(tau-CUT)/(SHOT-CUT),e=u*(1.14-.14*u);return mix3(CUT_AT,SHOT_AT,e);}
 if(tau<IN_NET){const u=(tau-SHOT)/DRIVE;const p=mix3(SHOT_AT,GOALPT,u);p[1]=lerp(.11,GOALPT[1],u)+.25*Math.sin(Math.PI*u);return p;}
 const u=clamp((tau-IN_NET)/.6);return mix3(GOALPT,REST,easeOut(u));
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the shoulder drop: left shoulder dipped inside, weight onto the left leg, arms out, eyes on Banks */
const DROP:Partial<Pose>={roll:-14,bend:-16,lean:20,twist:12,lHipF:28,lKnee:62,lHipA:14,rHipF:16,rKnee:30,rHipA:22,rShA:64,lShA:34,rElb:30,lElb:50,neckP:-2,neckY:10,squash:-.06};
/** the outside touch: the right boot turned in, the ball flicked out with the outside of it, the body pushing off to the right */
const OUTP:Partial<Pose>={roll:10,bend:10,lean:18,twist:-8,rHipF:30,rKnee:30,rAnk:30,rHipR:-34,rHipA:8,lKnee:52,lHipF:12,lShA:58,rShA:30,neckP:26,neckY:-6};
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bol'?READY:stand();
 let p:Pose;
 if(k===MATI){yaw=yawMat(tau);
  if(tau<-.3){const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
   if(tau>-1.4)p=over(p,{neckP:24,neckY:30,lShA:30},bump(-1.4,0,tau));}// eyes on Taylor's pass
  else{const s=clamp((sp-2)/4.5),dr=dribble(distOf(k,tau)/CYC,{foot:'r',speed:.45+.45*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
  p=over(p,DROP,bump(2.45,3.12,tau));
  p=over(p,OUTP,bump(2.95,3.4,tau));
  const D=.8,st=CUT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),Math.min(sm(0,.18,u),1-sm(1.1,1.5,u)));
  if(tau>CUT+.5&&tau<IN_NET+.2)p=over(p,{neckY:28,neckP:4},sm(CUT+.5,CUT+.9,tau));
  if(tau>IN_NET+.2)p=blendPose(p,celebrate((tau-IN_NET-.2)*1.1,{kind:'arms'}),sm(IN_NET+.2,IN_NET+.7,tau));
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  const u=(tau-(SHOT-.12))/.85;if(u>0){const y0=YAW(SHOT_AT[0]-x,SHOT_AT[2]-z);p=keeperDive(clamp(u),{side:'r',height:.08});yaw=y0;
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(k===BANKI&&tau<3.3){const[mx,mz]=posOf(MATI,tau);yaw=YAW(mx-x,mz-z);}
 if(sp>.5&&(k===BANKI&&tau<3.3||along<-.35*sp))p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===BANKI){const D=.7,t0=3.02-.6*D,u=(tau-t0)/D;if(u>0&&u<1.4)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>3.3&&tau<4.2){const[mx,mz]=posOf(MATI,tau);yaw=lerpAng(YAW(mx-x,mz-z),yaw,sm(3.3,4.1,tau));}}
 if(k===TAYI){if(tau<PASS-.3){p=blendPose(idle,dribble(distOf(k,tau)/CYC,{foot:'r',speed:.5}),clamp((sp-.3)/.8));}
  const D=.8,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>-.2&&u<1.4){yaw=lerpAng(yaw,YAW(TP[0][0]-PASS_AT[0],TP[0][1]-PASS_AT[1]),Math.min(sm(-.2,.1,u),1-sm(1,1.4,u)));p=blendPose(p,strike(clamp(u),{foot:'r',power:.55}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u)));}}
 if(k===PERI){yaw=yawPerry(tau);const D=.95,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:1}),Math.min(sm(0,.18,u),1-sm(1.1,1.5,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate((tau-IN_NET-.3)*1.1,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===MORTI){if(tau>6.1&&tau<7.2){const[bx,bz]=[b[0],b[2]];p=over(p,{neckY:clamp(wrapA(YAW(bx-x,bz-z)-yaw)/D2R,-80,80),neckP:18},bump(6.1,7.2,tau));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate((tau-IN_NET-.4)*1.1,{kind:'arms'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Matthews (and Perry) with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:number[];glow?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>(),hero=o.hero??[];
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===MATI?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(hero.includes(k)||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:hero.includes(k)}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*7,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
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
const ballPath=(t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n);return[b[0],b[2]] as [number,number];});
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** the byline beside the goal, lit: a thick yellow band along x = 0 from the six-yard box out to the corner of the penalty box */
function byline(s:Sheet,c:Camera,w:number,seed=71){if(w<=.02)return;groundTrail(s,c,Array.from({length:9},(_,i)=>[-.1,lerp(4,20.5,i/8)] as [number,number]),.3,Y,{progress:clamp(w*1.4),cov:.95*clamp(w),head:false,seed});}
/** the cut-back zone: a soft yellow patch between the penalty spot and the six-yard box, where the ball is rolled "across goal" */
function cutZone(s:Sheet,c:Camera,w:number){if(w<=.02)return;const pts:V3[]=Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[-8.5+Math.cos(a)*3.2,.03,.8+Math.sin(a)*5.2] as V3;});const q=new Path2D();addPoly(q,clipPoly(c,pts));s.tone(Y,q,.45*w);groundRing(s,c,-8.5,.8,3.2,5.2,.08,Y,.9*w,73);}

// ================= chapter 1 (live, near real time): the high main-stand BBC camera, printed as a 1953 television picture =================
const tau1=(t:number)=>{const bl=T(0,'Blackpool'),sm0=T(0,'Stanley Matthews'),gi=T(0,'on the right'),bh=T(0,'beats his man'),rl=T(0,'races to the line'),cb=T(0,'cuts it back'),bp=T(0,'Bill Perry'),sc=T(0,'scores'),E=SEC(0);
 return key(t,mono([[0,-10],[bl,-8.6],[sm0-.3,PASS-.6],[gi,.1],[bh+.2,OUT],[rl+.2,4.6],[cb+.1,CUT],[bp+.1,SHOT-.25],[sc+.25,IN_NET],[E+1,IN_NET+(E+1-sc-.25)*.9]]),linear);};
const CAM1:V3=[-44,21,64];
const TOWER_LOOK:V3=[-140,24,0];
function lookBall(tau:number):V3{const b=ballAt(tau);if(tau<IN_NET)return[b[0],lerp(1,b[1],.3),b[2]*.8];const[x,z]=posOf(PERI,tau);return mix3([b[0]-3,1,b[2]*.8],[x,1,z],sm(IN_NET,IN_NET+1.4,tau));}
function cam1(t:number){const tau=tau1(t),a=lookBall(tau),b=lookBall(tau-.3),c=lookBall(tau-.6),lb:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const pan=sm(T(0,'Blackpool')-.6,T(0,'two goals down')+.4,t,easeInOutSine),look=mix3(TOWER_LOOK,lb,pan);
 const F=lerp(1500,key(tau,[[-9,4600],[PASS,5000],[0,5600],[OUT,6600],[CUT,6800],[SHOT,6400],[IN_NET+2,7600]]),pan);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,bl=T(0,'Blackpool'),ta=T(0,'three all');frame(s);
  stadium(s,c,{t,era:1,cheer:.1+.2*bump(ta-.2,ta+1.4,t)+.9*sm(0,.5,goalIn),wave:sm(bl,bl+.4,t)*(1-sm(bl+2.2,bl+3,t))});
  ground(s,c,{era:1,net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});
  newsreel(s,1,t);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:13,
};

// ================= chapter 2 (newsreel slow-motion replay, low behind the winger): the drop of the shoulder, Banks fooled, the outside touch, away =================
const tau2=(t:number)=>{const E=SEC(1),md=T(1,'Matthews drops'),hs=T(1,'his shoulder'),bl=T(1,'Banks leans'),ww=T(1,'the wrong way'),ot=T(1,'one touch'),ro=T(1,'round the outside'),by=T(1,'the byline');
 return key(t,mono([[0,1.5],[md,2.25],[hs+.3,2.6],[bl+.1,2.85],[ww+.3,3.02],[ot+.1,OUT],[ro+.3,3.55],[by,4.9],[E,5.75]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[mx,mz]=posOf(MATI,tau),[bx,bz]=posOf(BANKI,Math.min(tau,3.6)),by=T(1,'the byline'),swing=sm(by-1,E,t,easeInOutSine);
 const push=sm(T(1,'Matthews drops')-.3,T(1,'Banks leans')+.3,t,easeInOutSine),m:[number,number]=[lerp(lerp(mx,bx,.45),mx+2,swing),lerp(lerp(mz,bz,.45),mz-1,swing)];
 // behind Matthews and a little outside him (from the touchline side), looking along his run to the goal; it lifts and swings as he breaks away
 const pos:V3=[m[0]-8.5+1.6*push+3*swing,1.55+1.2*swing,m[1]+3.2-.4*push+1.5*swing],look:V3=[m[0]+1,.95,m[1]-.5-1.5*swing];
 return cam(pos,look,2050+400*push-500*swing);}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),md=T(1,'Matthews drops'),hs=T(1,'his shoulder'),bl=T(1,'Banks leans'),ww=T(1,'the wrong way'),ot=T(1,'one touch'),ro=T(1,'round the outside'),by=T(1,'the byline');frame(s);
  stadium(s,c,{t,era:.85,cheer:.12});
  ground(s,c,{era:.85});
  // "round the outside": the ball's line past Banks (dashed) and Matthews's run round him (orange)
  const rw=sm(ro-.2,ro+.8,t,easeOut)*(1-sm(E-.9,E-.4,t));
  groundTrail(s,c,ballPath(OUT,4.45),.12,Y,{progress:rw,dashed:true,head:false,seed:23});
  groundTrail(s,c,pathOf(MATI,3,4.9),.17,O,{progress:rw,seed:25});
  // "the byline": the goal line lights up ahead of him
  byline(s,c,sm(by-.2,by+.5,t)*(1-sm(E-.5,E-.1,t)));
  const w=drawWorld(s,c,tau,tp,{ballMin:9,hero:[MATI],glow:sm(ot-.1,ot+.2,t)*(1-sm(ro+.2,ro+.8,t))});
  // "drops his shoulder": a dashed yellow arrow out of his left shoulder — the way he pretends to go (inside)
  const hero=w.res.get(MATI),bk=w.res.get(BANKI);
  const fw=sm(md-.1,hs+.4,t,easeOut)*(1-sm(ot-.3,ot,t));
  if(hero&&fw>.02){const[x,z]=posOf(MATI,tau),y=yawMat(tau),lx=-Math.sin(y),lz=-Math.cos(y),a=hero.joints.lSh,e=P(c,[x+lx*2.3+Math.cos(y)*.9,1.3,z+lz*2.3-Math.sin(y)*.9]),wd=Math.max(6,kAt(c,[x,1,z])*.09);
   s.knockout(ribbon([a,e],wd*1.8,{seed:31,taper:.1}),.6*fw);laneArrow(s,Y,a,e,wd,{dashed:true,progress:fw,seed:31,head:wd*3});}
  // "Banks leans the wrong way": sparks where he commits
  const age=t-ww;if(bk&&t>bl-.2&&age<.6){const h=bk.joints.head;sparkBurst(s,O,h[0],h[1],kAt(c,[-16,1,21])*.6,{n:8,seed:33,g:easeOutBack(clamp((t-bl+.2)/.3))*(1-clamp((age-.35)/.25)),width:9});}
  // "one touch": a spark at the boot as the ball goes the other way
  const ag2=tp-OUT;if(ag2>-.02&&ag2<.3){const k=TOUCHES.indexOf(OUT),q=P(c,[TP[k][0],.15,TP[k][1]]);sparkBurst(s,Y,q[0],q[1],kAt(c,[-17,0,21])*.55,{n:8,seed:35,g:easeOutBack(clamp(ag2/.08))*(1-clamp((ag2-.18)/.12)),width:8});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:37,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
  newsreel(s,.75,t);
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse angle, low on the far side of the box): the cut-back just behind Mortensen, Perry's drive, the net =================
const tau3=(t:number)=>{const E=SEC(2),fb=T(2,'From the byline'),cb=T(2,'cuts it back'),lo=T(2,'low'),jb=T(2,'just behind Mortensen'),ps=T(2,'Perry smashes'),ii=T(2,'it in');
 return key(t,mono([[0,5.35],[fb+.3,5.8],[cb+.1,CUT],[lo+.2,6.35],[jb+.5,6.75],[ps,SHOT-.12],[ii+.1,IN_NET],[E,IN_NET+(E-ii-.1)*.85]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),b=ballAt(Math.min(tau,IN_NET)),[px,pz]=posOf(PERI,tau),[mx,mz]=posOf(MATI,tau),shot=sm(T(2,'just behind Mortensen')-.3,T(2,'Perry smashes')+.2,t,easeInOutSine),cel=sm(T(2,'it in')+.4,E,t,easeInOutSine);
 // the reverse angle: low on the far side of the box, behind Perry's run, looking back at the byline — the cut-back rolls toward us, the goal is lens-left
 const look=mix3(mix3([lerp(mx,b[0],.5),.9,lerp(mz,b[2],.5)],[lerp(px,b[0],.5)+1,.9,lerp(pz,b[2],.5)+2],shot),[lerp(px,-2,.3),1.1,lerp(pz,0,.3)],cel);
 return cam([lerp(-17,-16.5,shot),lerp(3.4,2.8,shot),lerp(-10,-9,shot)],look,lerp(1650,1850,shot)+200*cel);}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),E=SEC(2),cb=T(2,'cuts it back'),lo=T(2,'low'),jb=T(2,'just behind Mortensen'),ps=T(2,'Perry smashes'),ii=T(2,'it in'),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,era:.85,cheer:.12+1*sm(0,.5,goalIn)});
  ground(s,c,{era:.85,net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "cuts it back ... low": the line of the cut-back, dashed on the grass, drawn as the ball goes
  if(tau>CUT-.05){const n=12,pts:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(CUT+(Math.min(tau,SHOT)-CUT)*i/n);pts.push([b[0],b[2]]);}groundTrail(s,c,pts,.1,Y,{dashed:true,head:false,cov:.95*sm(cb-.1,lo,t)*(1-sm(E-.9,E-.4,t)),seed:41});}
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:[PERI,MATI]});
  // "just behind Mortensen": a ring round Mortensen as the ball rolls past behind his heels
  const mo=w.res.get(MORTI),mw=sm(jb-.2,jb+.2,t,easeOutBack)*(1-sm(jb+1.1,jb+1.5,t));
  if(mo&&mw>.02){const h=mo.joints.head,f=mo.joints.lAn,cx=(h[0]+f[0])/2,cy=(h[1]+f[1])/2,r=Math.max(18,Math.abs(f[1]-h[1])*.62)*(.6+.4*mw);
   s.fill(Y,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*.7,cy+Math.sin(i/26*TAU)*r] as Pt),Math.max(3,r*.07),{seed:43,close:true,taper:0,wobble:.8}),.9*mw);}
  // "Perry smashes it in": a ring round his left boot at the strike, sparks off the net
  const pe=w.res.get(PERI),lw=sm(ps-.2,ps+.2,t,easeOutBack)*(1-sm(ps+1,ps+1.4,t));
  if(pe&&lw>.02){const toe=pe.joints.lToe,an=pe.joints.lAn,r=Math.max(10,Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3)*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2;
   s.fill(O,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed:45,close:true,taper:0,wobble:.8}),.95*lw);}
  const ga=t-ii;if(goalIn>0&&ga<.8){const q=P(c,GOALPT);sparkBurst(s,Y,q[0],q[1],kAt(c,GOALPT)*.9,{n:9,seed:47,g:easeOutBack(clamp(goalIn/.15))*(1-clamp((goalIn-.45)/.3)),width:9});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:49,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  newsreel(s,.75,t);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(PERI,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, full colour, a raised three-quarter camera): take on the full-back, byline, cut it back across goal =================
const tau4=(t:number)=>{const E=SEC(3),yt=T(3,'Your turn'),tf=T(3,'take on the full-back'),gb=T(3,'get to the byline'),cb=T(3,'cut it back'),ag=T(3,'across goal');
 return key(t,mono([[0,1.2],[yt+.4,1.6],[tf+.3,2.6],[tf+1.3,OUT+.2],[gb+.5,5.3],[cb+.1,CUT],[ag+.1,6.9],[E-.6,IN_NET+.4],[E,IN_NET+.8]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[mx,mz]=posOf(MATI,Math.min(tau,CUT)),follow=sm(T(3,'cut it back')-.4,E-.4,t,easeInOutSine),push=sm(T(3,'take on the full-back')-.3,T(3,'get to the byline'),t,easeInOutSine);
 const look:V3=[lerp(lerp(mx,-9,.3),-6,follow),.4,lerp(lerp(mz,12,.35),6,follow)];
 return cam([look[0]-15+3*push+2*follow,9.5-1.5*push,look[2]+18-2*push+1*follow],look,1500+200*push-120*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),tf=T(3,'take on the full-back'),gb=T(3,'get to the byline'),cb=T(3,'cut it back'),ag=T(3,'across goal'),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,era:0,cheer:.08+.6*sm(0,.4,goalIn)});
  ground(s,c,{era:0,net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "take on the full-back": a ring holding Matthews and Banks, then his run round the outside (orange arrow)
  const[mx,mz]=posOf(MATI,Math.min(tau,3.2)),[bx,bz]=posOf(BANKI,Math.min(tau,3.2)),ow=sm(tf-.1,tf+.4,t,easeOutBack)*(1-sm(gb-.3,gb+.2,t));
  groundRing(s,c,(mx+bx)/2,(mz+bz)/2,Math.hypot(mx-bx,mz-bz)/2+1.4,2.2,.1,Y,.95*clamp(ow),51);
  groundTrail(s,c,pathOf(MATI,2.6,5.8),.2,O,{progress:sm(tf+.3,gb+.3,t,easeOut)*(1-sm(cb+.4,cb+.9,t)),seed:53});
  // "get to the byline": the goal line lights up where he arrives
  byline(s,c,sm(gb-.1,gb+.5,t)*(1-sm(E-.6,E-.2,t)),55);
  // "cut it back across goal": the yellow arrow back to the zone between the penalty spot and the six-yard box
  const cw=sm(cb-.1,cb+.7,t,easeOut)*(1-sm(E-.5,E-.1,t));
  groundTrail(s,c,[[CUT_AT[0],CUT_AT[2]],[lerp(CUT_AT[0],SHOT_AT[0],.5),lerp(CUT_AT[2],SHOT_AT[2],.5)],[SHOT_AT[0],SHOT_AT[2]]],.16,Y,{progress:cw,seed:57});
  cutZone(s,c,sm(ag-.2,ag+.4,t)*(1-sm(E-.5,E-.1,t)));
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:[MATI]});
  // "the full-back": a spark as Banks is left behind
  const bk=w.res.get(BANKI),age=tp-OUT;if(bk&&age>-.1&&age<.6){const h=bk.joints.head;sparkBurst(s,O,h[0],h[1],kAt(c,[-16,1,21])*.6,{n:8,seed:61,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:9});}
 },
 still:5,
};

const story:RisoStory={
 id:'matthews-final-1953',format:'11v11',title:'The Matthews Final, 1953',
 theme:'Winger: take on the full-back, get to the byline, and cut the ball back across goal.',
 ageNote:'FA Cup final, Blackpool 4–3 Bolton Wanderers, Wembley Stadium, London, 2 May 1953. Matthews was 38.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the old leather ball is cut back along a yellow line from the point. Reduced motion: the ball and the line, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=Math.PI*(.75+.5*r()),g=age<=0?1:easeOutBack(clamp(age/.25)),run=age<=0?0:easeOut(clamp(age/.6))*170;
  const bx=x+Math.cos(a)*run,by=y+Math.sin(a)*run*.4;
  s.fill(Y,ribbon([[x,y],[x+Math.cos(a)*170*g,y+Math.sin(a)*68*g]],12,{seed,taper:.2,wobble:.6,gaps:[[.15,.25],[.4,.5],[.65,.75]]}),.95);
  if(age>0&&age<.45)sparkBurst(s,Y,x,y,120*g,{n:9,seed,g:1-clamp(age/.45),width:12});
  ball(s,bx,by,56,age*9+hash(seed,3)*TAU,{sq:age>0?.14*Math.max(0,1-age*4):0,dir:a});
 },
};
export default story;
