/** Iconic play film (signature): Ferenc Puskás, "the deadly left foot" — the drag-back past Billy Wright and the left-foot finish,
 * England 3–6 Hungary, the "Match of the Century", Wembley Stadium, London, 25 November 1953 — Hungary's third goal (Wikipedia 24',
 * The Guardian 22'), England 1–2 → 1–3.
 * WHY THIS MOMENT REPRESENTS THE SIGNATURE: lib/town/iconicPlays.json gives Puskás kind "signature", "the deadly left foot", lesson "Get
 * the ball onto your best foot quickly, then shoot before the defender blocks." This goal is the best-documented example of exactly that:
 * with England's captain sliding in, Puskás pulled the ball back with the sole of his LEFT boot, turned, and hit it with the same left foot
 * into the roof of the net before anyone could block — so the film is a recreation of this one real goal, not an invented composite.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/puskas-drag-back-1953/script.json. The voice is generated later by the lead (local Kokoro). Until
 * then every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter
 * seconds, so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/puskas-drag-back-1953/timing.json exists, replace `null` in `const VOICE` below with the imported timing
 *   import timingJson from '../../../public/plays/narration/puskas-drag-back-1953/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage; cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Match of the Century (1953 England v Hungary football match)" (raw wikitext): date, Wembley, 105,000, referee Leo Horn
 *    (Netherlands), line-ups and shirt numbers, scorers (Puskás 24' and 27'), the kit boxes, and the goal: "as England captain Billy Wright
 *    attempted to tackle him, Puskás dragged back the ball with the sole of his boot an instant before, leaving the English captain chasing
 *    empty space where the ball had been and beating Merrick with a clinical finish".
 *    https://en.wikipedia.org/wiki/Match_of_the_Century_(1953_England_v_Hungary_football_match)
 *  - BBC News Magazine, "England v Hungary – a football match that started a revolution" (23 Nov 2013), quoting The Times' report
 *    (Geoffrey Green): Puskás "bamboozled England's captain Billy Wright by dragging the ball back with the sole of his LEFT boot and, after
 *    a whirling pirouette, smashing it into the ROOF OF THE NET", Wright like "a fire engine rushing to the wrong fire"; Puskás "never used
 *    his right foot"; he was short and stocky.   https://www.bbc.co.uk/news/magazine-25033749
 *  - The Guardian archive, Pat Ward-Thomas, "Hungary's famous victory" (26 Nov 1953): "A move from the RIGHT, a SHORT PASS, and Puskas ...
 *    swivelled like lightning and smashed the ball in from [an angle] which gave him about A FOOT to aim at BETWEEN MERRICK AND THE POST";
 *    "gentle sunshine filtered through the greyness and filled the vast arena with golden light". (This report names Dickinson, not Wright,
 *    as the defender "right upon him"; we follow Wikipedia and The Times for Wright and draw Dickinson close behind.)
 *    https://www.theguardian.com/football/1953/nov/26/newsstory.sport
 *  - Wikipedia, "Ferenc Puskás": ball control "mostly with his left foot"; "one of the most powerful left footed shots in history".
 * CONFIRMED by those accounts: 25 November 1953, afternoon, Wembley, 105,000; Hungary's third goal, by Puskás, in the first half (22'/24'),
 *  England 1–2 before it; the move came from Hungary's RIGHT with a SHORT PASS; Billy Wright (England captain, No. 4, right-half) went in
 *  to tackle; Puskás DRAGGED THE BALL BACK WITH THE SOLE OF HIS LEFT BOOT, turned ("whirling pirouette" / "swivelled like lightning") and
 *  SMASHED it with his LEFT foot INTO THE ROOF OF THE NET, through a gap of about a foot BETWEEN GIL MERRICK AND THE (near) POST. KITS:
 *  England white shirts, navy shorts, navy socks; Hungary red (cherry) shirts, white shorts, green socks (Wikipedia kit boxes). Puskás
 *  wore 10 and captained Hungary; Wright 4, Merrick 1, Dickinson 6; referee Leo Horn.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; which end of Wembley (drawn: the east end, the twin towers
 *  behind the far end) and so the direction of play on screen; the passer (drawn as No. 11 Czibor, who is not named in the narration) and
 *  the exact spot (just outside the right-hand corner of the six-yard box); the side Wright came from (Puskás's front-left) and his lead
 *  leg; the direction of Puskás's turn; Merrick's position and late dive; the other players' positions (Dickinson close behind, Eckersley,
 *  Johnston, Ramsey, Kocsis, Hidegkuti, Bozsik); long sleeves; the keepers' and referee's kits (Merrick drawn in a yellow jersey, Horn in
 *  black); a tan leather ball; the 1953 ground as drawn (roofs over the two side stands only, open end terraces, the greyhound track, no
 *  floodlights, the towers); the crowd, camera positions and lenses; Puskás's modest arms-up celebration. The 4-ink palette prints the
 *  green socks and grass in green ink.
 *
 * STRUCTURE (a 1:1 recreation of the newsreel/TV coverage, only the rendering is riso; never top-down): the play is ONE simulation on a real
 * clock τ (seconds, τ = 0 Puskás stops the pass under his left sole): ch1 = the high main-stand newsreel camera, near real time (short
 * pass, Wright slides in, the ball is gone, the left-foot shot, goal); ch2 = the slow-motion replay from a low camera on the near touchline
 * side (Wright dives in, the sole on the ball, the drag back, Wright slides into empty space); ch3 = the reverse-angle replay, low beside
 * the near post (the quick turn onto the left foot, bang, the roof of the net, a foot inside the post); ch4 = the lesson on a low side
 * camera (best foot, quickly, shoot before the defender blocks). Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts
 * through ONE adapter, drawPlayer(). Inks: yellow (the golden afternoon light, teaching marks), red (Hungary, skin, cinder track), green
 * (grass, Hungary's socks), navy (key line, England's shorts, the dark-coated crowd). A newsreel gate (vignette, flicker, gate scratches)
 * sits over the live and replay chapters. Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,twosIndex,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,keyPoses,blendPose,runCycle,stand,strike,slideTackle,backpedal,celebrate,keeperSet,keeperDive,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',GR='green';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`puskas film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/puskas-drag-back-1953/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Wembley, 1953','Wembley, 1953, England against Hungary. A short pass to Puskás. England\'s captain Billy Wright slides in, but the ball has gone! His left foot... goal!',
  ['Wembley','England against Hungary','A short pass','to Puskás','Billy Wright','slides in','the ball has gone','His left foot','goal']),
 prov('The drag-back','Watch again: Wright dives in, but Puskás drags the ball back with the sole of his left boot. Wright slides into empty space.',
  ['Watch again','Wright dives in','Puskás drags','the ball back','the sole','left boot','Wright slides','empty space']),
 prov('Left foot','One quick turn onto his best foot, and bang! Roof of the net, just inside the post.',
  ['One quick turn','his best foot','bang','Roof of the net','just inside the post']),
 prov('Your turn','Your turn: get the ball onto your best foot quickly, then shoot before the defender blocks.',
  ['Your turn','best foot','quickly','then shoot','before the defender blocks']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`puskas film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Puskás scores in is at x = 0, the pitch runs to x = −105;
// Hungary attack +x, so their RIGHT wing is +z — the near touchline, under the main-stand camera) =================
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
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Wembley, 25 November 1953, mid-afternoon: roofs over the two side stands, open end terraces, the dog track, the twin towers =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(63+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+10.5*b];
type Bowl={low:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],back:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,side=Math.abs(Math.sin((a+b)/2))>.8,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  if(side){o.back.push([rim(a,22,11.6),rim(b,22,11.6),rim(b,22,21.5),rim(a,22,21.5)]);o.roof.push(Q(13,20.6,34,23.5));o.fascia.push(Q(13,19.4,13,20.7));}
  else o.back.push(Q(l1,h1,34,17));// the open end terraces carry on up under the sky
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,19);if(h<.14)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;hats?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,hats=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // "gentle sunshine filtered through the greyness ... golden light": a pale gold sky under a grey (navy screen) overcast, darker overhead
 s.field(Y,.3,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-420],[-Bnd,hz-360]],true),.3);
 towers(s,c);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(const q of BOWL.back)ad(q,back);for(const q of BOWL.low)ad(q,low);for(const q of BOWL.roof)ad(q,roof);for(const q of BOWL.fascia)ad(q,fas);
 s.knockout(back);s.tone(K,back,.55);s.tone(Y,back,.3);
 s.knockout(low);s.tone(K,low,.45);s.tone(Y,low,.3);
 // the crowd, 105,000 in winter coats and hats: pale faces, navy coats, a few red rosettes; hats thrown up on "goal"
 const inks=[new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.5?0:q.h<.9?1:2].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.7);s.fill(K,inks[1],.75);s.fill(R,inks[2],.85);}
 if(hats>0){const hp=new Path2D(),r=rng(900+twosIndex(t));let n=0;for(let i=0;i<Math.round(26*hats);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),z=clamp(c.F*.9/d,3,14),up=z*(2+r()*3);hp.addPath(polyPath([[x-z,y-up],[x+z,y-up],[x+z*.6,y-up-z*.8],[x-z*.6,y-up-z*.8]],true));n++;}if(n)s.fill(K,hp,.9);}
 // the side-stand roofs: dark underside and a pale fascia (no floodlights at Wembley in 1953)
 s.knockout(roof);s.fill(K,roof,.85);
 s.knockout(fas);s.tone(Y,fas,.5);s.tone(K,fas,.2);
}
/** Wembley's twin towers behind the far (west) end: white concrete shafts, domed tops and flagpoles */
function towers(s:Sheet,c:Camera){
 const body=new Path2D(),dome=new Path2D(),win=new Path2D(),pole=new Path2D();let n=0;
 for(const z of[-11,11]){const base:V3=[-152,12,z];if(depthOf(c,base)<30)continue;const k=kAt(c,base),[x,y]=P(c,base);if(Math.abs(x)>s.W*1.2)continue;
  const top=P(c,[-152,31,z])[1],dt=P(c,[-152,39,z])[1],pt=P(c,[-152,45,z])[1],w=3.6*k;
  body.addPath(polyPath([[x-w,y],[x+w,y],[x+w*.9,top],[x-w*.9,top]],true));
  dome.addPath(polyPath([...Array.from({length:13},(_,i)=>{const a=Math.PI*i/12;return[x-Math.cos(a)*w*.86,top-(top-dt)*Math.sin(a)] as Pt;})],true));
  dome.rect(x-w*.95,top-.8*k,w*1.9,1.2*k);
  for(let j=0;j<3;j++){const yy=lerp(y,top,.3+j*.22);win.rect(x-w*.12,yy-1.6*k,w*.24,1.6*k);}
  pole.addPath(ribbon([[x,dt],[x,pt]],Math.max(1.5,.3*k),{taper:0,wobble:0}));n++;}
 if(!n)return;s.knockout(body);s.tone(Y,body,.15);s.knockout(dome);s.tone(K,dome,.2);s.fill(K,win,.7);s.fill(K,pole,.9);
 s.stroke(K,body,3,.6);
}
/** the pitch: cinder dog track (red × navy), sunlit winter grass (green, gold light), mowing stripes, paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(tr);s.fill(R,tr,.5);s.tone(K,tr,.25);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(GR,gp,.8);s.tone(Y,gp,.3);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.15);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.12);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.92);
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a 1950s goal on the line x = X, net 2 m deep toward dir: square wooden posts, a box net on stanchions; `net` displaces the mesh (ripple) */
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-hit[0])*.6,w=.45*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.7,p[1]+w*.5,p[2]];};

/** the newsreel gate over the film: a soft dark vignette, a frame-to-frame flicker and a couple of gate scratches (seeded per drawn frame) */
function newsreel(s:Sheet,t:number,amt=1){
 if(amt<=.02)return;const f=twosIndex(t),r=rng(1953+f);
 // the visible window in current (world) units, read back from the sheet transform
 const inv=s.getTransform().inverse(),a0=inv.transformPoint({x:0,y:0}),a1=inv.transformPoint({x:s.width*s.dpr,y:s.height*s.dpr}),mx=(a0.x+a1.x)/2,my=(a0.y+a1.y)/2,W=Math.abs(a1.x-a0.x)/2,H=Math.abs(a1.y-a0.y)/2;
 s.save();s.translate(mx,my);
 const vig=new Path2D();vig.rect(-W*2,-H*2,W*4,H*4);
 vig.addPath(polyPath(Array.from({length:36},(_,i)=>{const a=i/36*TAU;return[Math.cos(a)*W*1.12,Math.sin(a)*H*1.1] as Pt;}),true));
 s.tone(K,vig,.3*amt,undefined,'evenodd');
 const fl=(hash(f,7)-.5)*2;if(fl>.35){const all=new Path2D();all.rect(-W*2,-H*2,W*4,H*4);s.tone(Y,all,.15*amt);}
 const sc=new Path2D();let n=0;for(let i=0;i<2;i++){if(r()<.45)continue;const x=(r()-.5)*W*1.7,y0=-H*1.1+r()*H*.6,y1=y0+H*(.8+r()*1.3),wob=r()*H*.012;sc.addPath(ribbon([[x,y0],[x+wob,(y0+y1)/2],[x-wob*.5,y1]],H*(.004+r()*.004),{taper:.3,wobble:.6,seed:f*3+i}));n++;}
 for(let i=0;i<3;i++){if(r()<.5)continue;const x=(r()-.5)*W*1.8,y=(r()-.5)*H*1.8,z=H*(.006+r()*.01);sc.addPath(polyPath([[x-z,y],[x,y-z*.6],[x+z*.8,y+z*.2],[x,y+z*.7]],true));n++;}
 if(n)s.knockout(sc,.8*amt);
 s.restore();
}

// ================= the tan leather ball (1953: laced leather; yellow × red tan, navy seams, blue-free) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,.8);s.tone(R,disc,.3);
 s.save();s.clip(disc);
 const sh=new Path2D();sh.arc(r*.35,r*.4,r*1.05,0,TAU);s.tone(K,sh,.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (25 November 1953) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Hungary: red (cherry) shirts, white shorts, green socks (confirmed); long sleeves and paper numbers inferred */
const HUN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:GR,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'long',numberInk:'paper',...o});
/** England: white shirts, navy shorts, navy socks (confirmed); long sleeves and navy numbers inferred */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,trim:K,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:[K,.9],...o});
const PUSKAS_BUILD={height:1.72,bulk:1.13,thighs:1.1};
const PUSKAS:AthleteStyle=HUN({number:10,build:PUSKAS_BUILD,seed:10});
const WRIGHT:AthleteStyle=ENG({number:4,hair:[Y,.85],build:{height:1.74},seed:4});
const MERRICK:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[K,.7],boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:[K,.9],build:{height:1.83},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'long',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Puskás stops the pass under his left sole) =================
type TK=[number,number,number];// τ, x, z
type Role='pus'|'hun'|'eng'|'gk'|'ref'|'wright';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const PASS=-1.05,SLIDE0=.28,SLIDE_D=.95,DRAG0=.42,DRAG1=.72,SHOT=1.2,FLIGHT=.3,IN_NET=SHOT+FLIGHT;
/** where Wright starts his slide (Puskás's front-left, goal side) */
const WSTART:[number,number]=[-6.35,4.35];
/** Positions are Hermite-interpolated between keys. Only Puskás, Wright, Merrick, the short pass from the right and Dickinson close by come
 * from the accounts; the rest is illustrative. */
const ACTORS:Actor[]=[
 {name:'Puskás',role:'pus',style:PUSKAS,key:true,keys:[[-6,-17,9.5],[-4,-13.6,8.4],[-2.2,-10.6,7.4],[-1,-8.7,6.8],[-.35,-7.95,6.45],[0,-7.7,6.35],[DRAG0,-7.68,6.33],[DRAG1,-7.95,6.2],[1,-8.2,6.05],[SHOT,-8.3,6],[1.6,-8.05,5.85],[2.4,-7.2,6.6],[3.6,-6.2,8.6],[6,-5,12]]},
 {name:'Wright',role:'wright',style:WRIGHT,key:true,keys:[[-6,-2.5,-2.5],[-3,-3.9,.4],[-1.2,-5.1,2.5],[-.3,-5.85,3.6],[SLIDE0,WSTART[0],WSTART[1]],[6,WSTART[0],WSTART[1]]]},
 {name:'Merrick',role:'gk',style:MERRICK,key:true,keys:[[-6,-2.4,.6],[-2,-1.9,1.5],[0,-1.4,2.1],[SHOT,-1.2,2.35],[6,-1.2,2.35]]},
 {name:'Czibor',role:'hun',style:HUN({number:11,seed:11}),keys:[[-6,-26,21],[-3.5,-19.5,18],[-1.6,-15.2,15.4],[PASS,-14.2,14.9],[0,-12.5,14.2],[2,-10,12.5],[6,-8,11]]},
 {name:'Dickinson',role:'eng',style:ENG({number:6,seed:6,hair:[K,.8]}),key:true,keys:[[-6,-15,4],[-3,-12,4.6],[-1,-10.2,5],[0,-9.5,5.3],[1,-9.25,5.45],[SHOT,-9.2,5.5],[3,-9,5.6],[6,-9,5.6]]},
 {name:'Eckersley',role:'eng',style:ENG({number:3,seed:3}),keys:[[-6,-20,17],[-3,-16.5,15.5],[-1,-14.5,14],[1,-13,12.5],[6,-12,11]]},
 {name:'Johnston',role:'eng',style:ENG({number:5,seed:5,hairStyle:'balding',hair:[K,.7]}),keys:[[-6,-8,-2],[-2,-5.2,-1],[1,-4.2,.4],[6,-4,1]]},
 {name:'Ramsey',role:'eng',style:ENG({number:2,seed:2}),keys:[[-6,-10,-10],[-2,-7,-7.5],[1,-5.5,-6],[6,-5,-5]]},
 {name:'Kocsis',role:'hun',style:HUN({number:8,seed:8}),keys:[[-6,-12,-5],[-2,-7.5,-3],[1,-4.8,-1.8],[3,-4,-1],[6,-5,4]]},
 {name:'Hidegkuti',role:'hun',style:HUN({number:9,seed:9,hairStyle:'balding',hair:[K,.8]}),keys:[[-6,-22,0],[-2,-17,2],[1,-14,3],[3,-10,5],[6,-7,9]]},
 {name:'Bozsik',role:'hun',style:HUN({number:5,seed:15}),keys:[[-6,-30,6],[-2,-25,6],[2,-21,5],[6,-15,7]]},
 {name:'Horn',role:'ref',style:REF,keys:[[-6,-28,6],[-2,-22,4],[2,-17,3],[6,-13,4]]},
];
const PUSI=0,WRI=1,GKI=2,CZI=3,DICKI=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-6,TB=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- Puskás: the approach, the sole on the ball, the drag back, the swivel, the left-foot strike ----
const NETPT:V3=[.08,2.12,3.3];// "into the roof of the net", about a foot inside the near post (z = 3.66)
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
/** over(): blend channel overrides (degrees) into a pose */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the sole on the ball: left leg forward, toes up so the sole sits on top of the ball, weight on a bent right leg, arms out */
const SOLE=posed({lHipF:36,lKnee:30,lAnk:-24,lHipA:6,rHipF:12,rKnee:40,rAnk:-4,lean:14,pitch:4,lShA:52,rShA:40,lShF:6,rShF:14,lElb:40,rElb:44,neckP:34,squash:-.04});
const HOLD=posed({lHipF:33,lKnee:34,lAnk:-22,lHipA:6,rHipF:10,rKnee:46,lean:12,pitch:3,lShA:60,rShA:46,lElb:36,rElb:40,neckP:24,neckY:14,twist:-6,squash:-.05});
/** the drag: the left sole rolls the ball back under him, hips sink, he starts to swivel away from the tackle */
const DRAGM=posed({lHipF:8,lKnee:54,lAnk:-10,lHipA:4,rHipF:18,rKnee:44,lean:18,pitch:5,twist:12,bend:-6,lShA:70,rShA:34,rShF:22,lElb:30,rElb:44,neckP:38,squash:-.07});
const DRAGE=posed({lHipF:-16,lKnee:66,lAnk:12,rHipF:20,rKnee:36,lean:20,pitch:4,twist:16,bend:-8,lShA:62,rShA:38,rShF:24,lElb:34,rElb:44,neckP:34,squash:-.03});
const APPROACH=runCycle(.1,{speed:.35});
function puskasMove(tau:number):Pose{return keyPoses(tau,[[-.3,APPROACH],[0,SOLE],[DRAG0,HOLD],[DRAG0+.14,DRAGM],[DRAG1,DRAGE]]);}
const SD=.8,S0=SHOT-STRIKE_CONTACT*SD;
/** Puskás's facing: toward the near post, swivelling away (clockwise) through the drag and back round for the shot */
function yawPus(tau:number){const v=velOf(PUSI,tau),[x,z]=posOf(PUSI,tau),toGoal=YAW(NETPT[0]-x,NETPT[2]-z),run=Math.hypot(v[0],v[1])>.5?YAW(v[0],v[1]):toGoal;
 return lerpAng(run,toGoal,sm(-.6,-.1,tau))-38*D2R*bump(DRAG0-.05,S0+.12,tau)*(tau<IN_NET+.2?1:0);}
function posePus(tau:number):{p:Pose;yaw:number}{
 const[x,z]=posOf(PUSI,tau),v=velOf(PUSI,tau),sp=Math.hypot(v[0],v[1]);let yaw=yawPus(tau),p:Pose;
 const run=blendPose(stand(),runCycle(distOf(PUSI,tau)/(2.2+1.4*clamp((sp-2)/5)),{speed:clamp((sp-2)/5)}),clamp((sp-.4)/.8));
 if(tau<-.4)p=run;
 else if(tau<S0)p=blendPose(run,puskasMove(tau),sm(-.4,-.05,tau));
 else p=blendPose(DRAGE,strike(clamp((tau-S0)/SD),{foot:'l',power:.95}),sm(S0,S0+.08,tau));
 if(tau>S0+SD){const cel=celebrate((tau-S0-SD)*1.2,{kind:'arms'});p=blendPose(strike(1,{foot:'l',power:.95}),blendPose(run,cel,.8),sm(S0+SD,S0+SD+.35,tau));
  if(tau>IN_NET+.4){const vv=velOf(PUSI,tau);if(Math.hypot(vv[0],vv[1])>.5)yaw=lerpAng(yaw,YAW(vv[0],vv[1]),sm(IN_NET+.4,IN_NET+1,tau));}}
 return{p,yaw};}
/** a boot's ground spot (middle of toe and heel) for Puskás at τ — the ball sits there through the sole and the drag */
function pusFoot(tau:number,which:'sole'|'toe'='sole'):[number,number]{const{p,yaw}=posePus(tau),[x,z]=posOf(PUSI,tau),sk=solve(p,PUSKAS_BUILD,{x,z,yaw});
 if(which==='toe')return[sk.lToe[0],sk.lToe[2]];return[(sk.lToe[0]*.6+sk.lHeel[0]*.4),(sk.lToe[2]*.6+sk.lHeel[2]*.4)];}
const RECV=pusFoot(.02),DRAG_END=pusFoot(DRAG1),CONTACT=(()=>{const[tx,tz]=pusFoot(SHOT,'toe'),y=yawPus(SHOT);return[tx+Math.cos(y)*.12,tz-Math.sin(y)*.12] as [number,number];})();
const PASS_FROM:[number,number]=(()=>{const[x,z]=posOf(CZI,PASS),v=velOf(CZI,PASS),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.45,z+v[1]/l*.45];})();
const GOALPT:V3=[NETPT[0],NETPT[1],NETPT[2]],REST:V3=[1.5,.14,2.9];
function ballAt(tau:number):V3{
 if(tau<PASS){const[x,z]=posOf(CZI,tau),v=velOf(CZI,tau),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.45,.11,z+v[1]/l*.45];}
 if(tau<0){const u=(tau-PASS)/-PASS,e=u*(1.25-.25*u);return[lerp(PASS_FROM[0],RECV[0],e),.11,lerp(PASS_FROM[1],RECV[1],e)];}
 if(tau<DRAG0){return[RECV[0],.11,RECV[1]];}
 if(tau<DRAG1){const[x,z]=pusFoot(tau);return[x,.11,z];}
 if(tau<SHOT){const u=(tau-DRAG1)/(SHOT-DRAG1),e=1-Math.pow(1-u,2);return[lerp(DRAG_END[0],CONTACT[0],e),.11,lerp(DRAG_END[1],CONTACT[1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/FLIGHT,s=u*(1.1-.1*u);const a:V3=[CONTACT[0],.11,CONTACT[1]];return[lerp(a[0],GOALPT[0],s),a[1]+(GOALPT[1]-a[1])*s+1.1*s*(1-s)*.6,lerp(a[2],GOALPT[2],s)];}
 const u=clamp((tau-IN_NET)/.7);return[lerp(GOALPT[0],REST[0],easeOut(u)),lerp(GOALPT[1],REST[1],u*u),lerp(GOALPT[2],REST[2],easeOut(u))];
}
const NET_HIT:V3=[1.2,2.3,3.2];
/** Wright slides straight at the spot where the ball sat under Puskás's sole. His body travel is on the ground table (the slideTackle root
 * shift dx is zeroed in poseOf), so trails, culling and depth all see where he really is. */
const SLIDE_YAW=YAW(RECV[0]-WSTART[0],RECV[1]-WSTART[1]);
{const a=ACTORS[WRI],ux=Math.cos(SLIDE_YAW),uz=-Math.sin(SLIDE_YAW),at=(d:number):[number,number]=>[WSTART[0]+ux*d,WSTART[1]+uz*d];
 a.keys=[...a.keys.filter(k=>k[0]<SLIDE0),[SLIDE0,...at(0)],[SLIDE0+.2*SLIDE_D,...at(.45)],[SLIDE0+.42*SLIDE_D,...at(1.2)],[SLIDE0+.75*SLIDE_D,...at(2)],[SLIDE0+SLIDE_D,...at(2.25)],[6,...at(2.3)]];
 const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}TABLES[WRI]={X,Z,D};}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===PUSI)return posePus(tau);
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='eng'||a.role==='wright'?READY:stand();
 let p:Pose;
 if(k===WRI){const run=runCycle(distOf(k,tau)/(2.4+2*clamp((sp-2)/5)),{speed:clamp((sp-2)/5)});
  if(tau<SLIDE0-.05)return{p:blendPose(idle,run,clamp((sp-.5)/.9)),yaw:lerpAng(yaw,SLIDE_YAW,sm(-.8,SLIDE0,tau))};
  const u=(tau-SLIDE0)/SLIDE_D;p=blendPose(run,{...slideTackle(clamp(u),{foot:'r'}),dx:0},sm(SLIDE0-.05,SLIDE0+.08,tau));
  if(tau>SHOT)p=over(p,{neckY:-40,neckP:-6},sm(SHOT,SHOT+.4,tau));// he looks round: the ball is behind him
  return{p,yaw:SLIDE_YAW};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);p=idle;
  if(tau>SHOT-.02){const u=(tau-SHOT+.02)/1.05,y0=YAW(CONTACT[0]-x,CONTACT[1]-z);p=keeperDive(clamp(u),{side:'l',height:.85});yaw=y0;
   if(tau>IN_NET+.3)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.3,IN_NET+.9,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===CZI){const D=.8,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>-.2&&u<1.3){yaw=lerpAng(yaw,YAW(RECV[0]-x,RECV[1]-z)+.35,Math.min(sm(-.2,0,u),1-sm(1,1.3,u)));p=blendPose(p,strike(clamp(u),{foot:'r',power:.3}),Math.min(sm(-.2,0,u),1-sm(1,1.3,u)));}}
 if(k===DICKI&&tau>-.5){const[px,pz]=posOf(PUSI,tau);yaw=YAW(px-x,pz-z);}
 if(a.role==='hun'&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lElb:20,rElb:20,neckP:-20},sm(IN_NET+.3,IN_NET+.9,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Puskás with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;skip?:number[]}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{if(o.skip?.includes(k))return;const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===PUSI?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===PUSI||k===WRI);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&(k===PUSI||k===WRI)}));}});});
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
const ballPath=(t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n);return[b[0],b[2]] as [number,number];});
/** Wright's slide on the grass: from his start along the slide line to where his lead boot ends */
const slidePath=(u1:number,n=10):[number,number][]=>Array.from({length:n+1},(_,i)=>{const d=.2+3.1*u1*i/n;return[WSTART[0]+Math.cos(SLIDE_YAW)*d,WSTART[1]-Math.sin(SLIDE_YAW)*d] as [number,number];});
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7,dashed=false){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.04;x<.98;x+=.1)gaps.push([x,x+.05]);
 s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1,gaps}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1,gaps}),cov);}
/** a screen-space ring round a boot (toe + ankle sheet points) */
function bootRing(s:Sheet,toe:Pt,an:Pt,w:number,ink:string,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3)*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2;
 s.fill(ink,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** "about a foot to aim at between Merrick and the post": a yellow bracket in the gap */
function gapMark(s:Sheet,c:Camera,w:number,hand:Pt|null){if(w<=.02)return;const post=P(c,[0,2.1,3.62]),postLo=P(c,[0,1.2,3.62]),a:Pt=hand??P(c,[0,2,2.9]),k=kAt(c,[0,2,3.3]),wd=Math.max(5,.06*k);
 const mid:Pt=[(a[0]+post[0])/2,(a[1]+post[1])/2];
 s.fill(Y,ribbon([a,mid,post],wd,{seed:71,taper:0,wobble:.4}),.95*w);
 s.fill(Y,ribbon([post,postLo],wd,{seed:72,taper:0,wobble:.4}),.95*w);
 sparkBurst(s,Y,mid[0],mid[1],k*.35*w,{n:6,seed:73,g:w,width:6});}

// ================= chapter 1 (live, near real time): the high main-stand newsreel camera; the short pass, the slide, the drag, the shot, goal =================
const tau1=(t:number)=>{const sp=T(0,'A short pass'),fp=T(0,'to Puskás'),bw=T(0,'Billy Wright'),si=T(0,'slides in'),bg=T(0,'the ball has gone'),ps=T(0,'His left foot'),g=T(0,'goal'),E=SEC(0);
 return key(t,mono([[0,-5.2],[sp,PASS-.35],[fp+.2,0],[bw+.1,SLIDE0-.08],[si+.35,.5],[bg+.4,.95],[ps+.2,SHOT],[g,IN_NET+.25],[E+1,IN_NET+.25+(E+1-g)]]),linear);};
const CAM1:V3=[-30,17,78];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<IN_NET)return[b[0]-1,lerp(1,b[1],.3),b[2]*.85];
 const[x,z]=posOf(PUSI,tau);return mix3([b[0]-3,1,b[2]*.85],[x,1,z],sm(IN_NET,IN_NET+1.4,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-5.2,3300],[PASS,4000],[0,5200],[SHOT,5600],[IN_NET,5600],[IN_NET+2.5,6200]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),hats:sm(.1,.5,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:8});
  newsreel(s,t);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(8,BALL_R*kAt(c,p))*1.1,12);},
 still:14,
};

// ================= chapter 2 (TV slow-motion replay, low on the near side): Wright dives in, the sole, the drag back, Wright into empty space =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,-.55],[T(1,'Wright dives in'),SLIDE0-.05],[T(1,'Puskás drags'),DRAG0-.04],[T(1,'the ball back')+.2,DRAG0+.12],[T(1,'the sole')+.3,DRAG0+.2],[T(1,'left boot')+.3,DRAG1-.1],[T(1,'Wright slides')+.4,.95],[T(1,'empty space')+.3,1.05],[E,1.12]]),linear);};
function cam2(t:number){const E=SEC(1),[px,pz]=posOf(PUSI,Math.min(tau2(t),.9)),m:[number,number]=[lerp(px,RECV[0],.4)+.5,lerp(pz,RECV[1],.4)],push=sm(T(1,'Puskás drags')-.5,T(1,'left boot'),t,easeInOutSine),orbit=sm(T(1,'Wright slides')-.4,E,t,easeInOutSine);
 const pos:V3=[m[0]-3.2+2.2*orbit,1.25-.2*push,m[1]+9.5-2.2*push-.8*orbit],look:V3=[m[0]+.2*orbit,.72-.12*push,m[1]-.3];
 return cam(pos,look,2050+500*push);}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),wd=T(1,'Wright dives in'),bb=T(1,'the ball back'),so=T(1,'the sole'),lb=T(1,'left boot'),wp=T(1,'Wright slides'),es=T(1,'empty space');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "Wright dives in": the line of his slide, drawn on the grass ahead of him (red)
  const sw=sm(wd-.2,wd+.9,t,easeOut)*(1-sm(E-.7,E-.3,t));
  groundTrail(s,c,slidePath(1),.16,R,{progress:sw,cov:.9,seed:21});
  // "empty space": a dashed yellow ring where the ball was — Wright's boot arrives there, the ball has gone
  const ew=sm(es-.15,es+.25,t,easeOutBack)*(1-sm(E-.5,E-.2,t));
  groundRing(s,c,RECV[0],RECV[1],.42,.42,.05,Y,.95*clamp(ew),27,true);
  // "the ball back": the ball's short roll back under the sole (red arrow)
  const bw=sm(bb-.1,bb+.7,t,easeOut)*(1-sm(E-.7,E-.3,t));
  groundTrail(s,c,ballPath(DRAG0,DRAG1+.05,10),.09,Y,{progress:bw,seed:23});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  // "the sole of his left boot": a ring round the left boot on top of the ball
  const hero=w.res.get(PUSI),rw=sm(so-.15,so+.25,t,easeOutBack)*(1-sm(lb+.7,lb+1.1,t));
  if(hero)bootRing(s,hero.joints.lToe,hero.joints.lAn,rw,R,29);
  // "slides past": a spark where his boot finds nothing
  const age=t-wp;if(age>-.1&&age<.6){const q=P(c,[RECV[0],.2,RECV[1]]);sparkBurst(s,R,q[0],q[1],kAt(c,[RECV[0],.2,RECV[1]])*.5,{n:8,seed:33,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:8});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:37,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
  newsreel(s,t,.7);
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(8,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse-angle replay, low beside the near post): the quick turn onto the left foot, bang, the roof of the net =================
const tau3=(t:number)=>{const E=SEC(2),qt=T(2,'One quick turn'),bf=T(2,'his best foot'),bg=T(2,'bang'),rn=T(2,'Roof of the net'),jp=T(2,'just inside the post');
 return key(t,mono([[0,.62],[qt+.3,.82],[bf+.2,S0+.1],[bg,SHOT],[rn+.3,IN_NET+.05],[jp+.2,IN_NET+.3],[E,IN_NET+.3+(E-jp-.2)*.8]]),linear);};
function cam3(t:number){const E=SEC(2),tau=tau3(t),[x,z]=posOf(PUSI,tau),toNet=sm(T(2,'bang')-.2,T(2,'Roof of the net')+.2,t,easeInOutSine),back=sm(T(2,'just inside the post')-.4,E,t,easeInOutSine);
 const pos:V3=[lerp(4.2,5,back),lerp(1.3,1.55,toNet),lerp(11.2,12,back)],lookP:V3=[x+.4,.9,z-.2],lookN:V3=[-.3,1.5,3.2],look=mix3(lookP,lookN,.1+toNet*.55);
 return cam(pos,look,key(t,mono([[0,2500],[T(2,'his best foot'),2800],[T(2,'bang'),1850],[E,1550]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),E=SEC(2),bf=T(2,'his best foot'),bg=T(2,'bang'),rn=T(2,'Roof of the net'),jp=T(2,'just inside the post'),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),hats:sm(.1,.6,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "bang": the line of the shot, drawn on the grass under the ball
  if(tau>SHOT-.02){groundTrail(s,c,ballPath(SHOT,Math.min(tau,IN_NET),10),.08,Y,{dashed:true,head:false,cov:.9*(1-sm(E-.8,E-.4,t)),seed:41});}
  const w=drawWorld(s,c,tau,tp,{ballMin:7,hero:true,glow:sm(bg-.15,bg,t)*(1-sm(rn,rn+.5,t))});
  // "his best foot": a ring round his left boot as he turns onto it
  const hero=w.res.get(PUSI),lw=sm(bf-.2,bf+.2,t,easeOutBack)*(1-sm(bg+.2,bg+.6,t));
  if(hero)bootRing(s,hero.joints.lToe,hero.joints.lAn,lw,R,43);
  // "bang": a spark at the boot
  const ag=t-bg;if(hero&&ag>-.05&&ag<.45){const q=hero.joints.lToe;sparkBurst(s,Y,q[0],q[1],kAt(c,[CONTACT[0],.2,CONTACT[1]])*.7,{n:9,seed:45,g:easeOutBack(clamp((ag+.05)/.12))*(1-clamp((ag-.25)/.2)),width:9});}
  // "just inside the post": the foot-wide gap between Merrick's glove and the post
  const gk=w.res.get(GKI),gw=sm(jp-.1,jp+.3,t,easeOut)*(1-sm(E-.5,E-.15,t));
  gapMark(s,c,gw,gk?gk.joints.lHa:null);
  // "the roof of the net": sparks in the top of the net
  const rg=t-rn;if(rg>-.1&&rg<.6){const q=P(c,[1,2.3,3.2]);sparkBurst(s,R,q[0],q[1],kAt(c,[1,2.3,3.2])*.8,{n:9,seed:47,g:easeOutBack(clamp((rg+.1)/.2))*(1-clamp((rg-.35)/.25)),width:9});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:49,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  newsreel(s,t,.6);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(PUSI,tau3(t)),p:V3=[x,1.2,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a low side camera): best foot, quickly, shoot before the defender blocks =================
const tau4=(t:number)=>{const E=SEC(3),yt=T(3,'Your turn'),bf=T(3,'best foot'),qk=T(3,'quickly'),ts=T(3,'then shoot'),db=T(3,'before the defender blocks');
 return key(t,mono([[0,-.35],[yt+.3,-.05],[bf,DRAG0-.02],[qk+.1,DRAG0+.2],[qk+.7,DRAG1+.08],[ts+.2,SHOT],[db+.3,IN_NET],[E,IN_NET+.6]]),linear);};
function cam4(t:number){const E=SEC(3),tau=tau4(t),[px,pz]=posOf(PUSI,Math.min(tau,SHOT)),follow=sm(T(3,'then shoot')-.5,E-.4,t,easeInOutSine),push=sm(T(3,'best foot')-.4,T(3,'quickly'),t,easeInOutSine);
 const look:V3=[lerp(px+1.2,-3.6,follow),.85,lerp(pz-.4,4.2,follow)];
 return cam([look[0]-1.2-1.5*follow,1.5,look[2]+11.5-1.6*push+1*follow],look,1900+300*push-250*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),bf=T(3,'best foot'),qk=T(3,'quickly'),ts=T(3,'then shoot'),db=T(3,'before the defender blocks');frame(s);
  stadium(s,c,{t,cheer:.08+.8*sm(0,.4,tau-IN_NET)});
  ground(s,c,{net:tau>IN_NET?netRipple(tau-IN_NET,NET_HIT):undefined});
  // "quickly": the ball's short drag onto the left foot (yellow)
  const qw=sm(qk-.1,qk+.6,t,easeOut)*(1-sm(ts,ts+.4,t));
  groundTrail(s,c,ballPath(DRAG0,SHOT-.02,10),.1,Y,{progress:qw,seed:53});
  // "then shoot": the shot line to the near post (yellow)
  const sw=sm(ts-.1,ts+.5,t,easeOut)*(1-sm(E-.6,E-.2,t));
  groundTrail(s,c,[[CONTACT[0],CONTACT[1]],[lerp(CONTACT[0],GOALPT[0],.5),lerp(CONTACT[1],GOALPT[2],.5)],[GOALPT[0],GOALPT[2]]],.12,Y,{progress:sw,seed:55});
  // "before the defender blocks": the defender's slide (red) stops short of where the ball now is
  const dw=sm(db-.15,db+.5,t,easeOut)*(1-sm(E-.5,E-.15,t));
  groundTrail(s,c,slidePath(1),.14,R,{progress:dw,seed:57});
  const w=drawWorld(s,c,tau,tp,{ballMin:7,hero:true});
  // "best foot": a ring round the left boot
  const hero=w.res.get(PUSI),bw=sm(bf-.15,bf+.25,t,easeOutBack)*(1-sm(qk+.8,qk+1.2,t));
  if(hero)bootRing(s,hero.joints.lToe,hero.joints.lAn,bw,R,59);
  // "blocks": a red spark on the defender's boot, too late
  const wr=w.res.get(WRI),age=t-db;if(wr&&age>-.1&&age<.6){const q=wr.joints.rToe;sparkBurst(s,R,q[0],q[1],kAt(c,[WSTART[0],.2,WSTART[1]])*.45,{n:7,seed:61,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:8});}
 },
 still:5,
};

const story:RisoStory={
 id:'puskas-drag-back-1953',format:'11v11',title:'Puskás drag-back, 1953',
 theme:'Get the ball onto your best foot quickly, then shoot before the defender blocks.',
 ageNote:'England 3–6 Hungary, the "Match of the Century", Wembley Stadium, London, 25 November 1953. Hungary\'s third goal.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.75,mottle:.55},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a press photographer's flashbulb pops and the leather ball hops from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
