/** Raúl's signature — the cool chip over the keeper. Real Madrid 6–1 Real Betis, La Liga matchday 24, Estadio Santiago Bernabéu, Madrid,
 * Saturday 21 February 2009 — Raúl's second goal of the night, 5–1 in the 41st minute, a left-footed chip over Betis keeper Ricardo.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/raul-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/raul-signature/timing.json exists, replace `null` in `const VOICE` below with the imported timing
 *   import timingJson from '../../../public/plays/narration/raul-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the cool chip over the keeper", lesson "When the keeper rushes out, a
 * gentle chip can be the best finish"): Spanish Wikipedia cites exactly this match report for the trait itself — Raúl "was known for his
 * cucharas, a kind of chip, with which he scored some of his most beautiful goals" — and El País's report of the night says the second
 * goal came "from a scoop he has patented so often that it is time it was coined the 'Raulina'". So it is the chip the press named after
 * him. The two moments suggested in the brief do not show a chip: in the 2000 Champions League final he ROUNDED Cañizares (Wikipedia), and
 * the 1998 "aguanís" in Tokyo was a solo dribble (Spanish Wikipedia) — neither is described as a lob by the sources read.
 *
 * SOURCES (read Sept 2026 as text, cached in the session scratchpad films/src-cache/; the footage itself was not reviewed):
 *  - El País, José Sámano, "El Madrid se gana el derecho a creer" (LIGA | REAL MADRID 6 - BETIS 1), 21 Feb 2009
 *    https://elpais.com/deportes/2009/02/21/actualidad/1235204524_850215.html
 *    (line-ups, goals and minutes, referee, 79,500 at a full Bernabéu; "A Raúl no hay quien le angustie ... otras dos dianas y van 311.
 *    El primero, a un toque, soberbio. El segundo, de un cucharazo que de tanto patentarlo ya es hora que se acuñe como 'Raulina'")
 *  - Wikipedia (es), "Raúl González Blanco" (raw): "Es zurdo" (left-footed); "conocido por sus cucharas, una especie de vaselina" citing
 *    the El País report above; wore the 7; captain from 2003
 *  - Wikipedia (en), "Raúl González" (raw): "a left-footed player ... he often scored goals using chips" (citing Marca); 1.80 m; No. 7
 *  - Marca (English), "The art of the chip: Falcao matches Totti, Messi and Raul", 22 Feb 2017 (Raúl among the great chippers)
 *  - Wikipedia (en), "2000 UEFA Champions League final" (raw) — read to rule out the Valencia goal (rounded the keeper, not a chip)
 * CONFIRMED by those accounts: the match, the day, the ground (full, 79,500), the score 6–1 and the goal order (Higuaín 7', Huntelaar 15',
 *  24', Oliveira 30', Raúl 36', RAÚL 41' = 5–1, Ramos 45'); the 41st-minute goal was a CHIP ("cucharazo") and El País proposed calling it the
 *  "Raulina"; Raúl is LEFT-FOOTED and wore 7; Betis's keeper was RICARDO; Madrid that night: Casillas; Ramos, Pepe, Cannavaro, Heinze;
 *  Lass Diarra, Gago, Marcelo; Raúl, Higuaín, Huntelaar — Betis: Ricardo; Nelson, Melli, Arzu, Fernando Vega; Damiá, Juande, Mehmet
 *  Aurelio, Emaná, Mark González; Oliveira; referee Undiano Mallenco.
 * INFERRED / ILLUSTRATIVE (not in any page read): the whole build-up — who played the ball in (drawn as an unnumbered Madrid midfielder's
 *  ground pass through the middle; not named in the narration), where Raúl received, his touch, where he chipped from (~13 m out, left of
 *  centre as he looks) and that he chipped with his LEFT foot (his stronger foot; the narration says "left foot" on that basis); Ricardo
 *  rushing out and spreading (a chip over a keeper implies he was off his line; the narration says he rushes out); every position, path
 *  and timing; the direction of play on screen; the KITS (not stated: drawn as Madrid all white with navy trim and numbers, Betis in
 *  green-and-white stripes, white shorts, green socks; Ricardo in red; the referee in black); night under floodlights (El País filed at
 *  22:16 CET, so an evening kick-off is most plausible); the Bernabéu as drawn (steep three-tier stands, the roof ring of lamps, plain
 *  boards, a small green Betis section); how Raúl celebrated (drawn as a run to the main-stand side with his arms out; his usual ring-kiss is
 *  not narrated); camera placements and lenses.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 the pass in): ch1 = the high main-stand broadcast camera, near real time (the pass, Raúl
 * away, the keeper rushes out, the chip, goal); ch2 = the slow-motion replay low from behind the goal line beside the post (the keeper
 * rushes out, Raúl stays cool, the left foot slides under the ball and lifts it); ch3 = a low replay from behind Raúl (the ball drops into
 * the empty net, the "Raulina"); ch4 = the lesson on a low side camera (the keeper rushes out, a gentle chip). Figures: lib/plays/riso/
 * athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (floodlights, grass under green, teaching marks), red (skin, Ricardo, the
 * keeper's rush), green (grass, Betis), navy (night sky, key line, boards). Scenes read only their local t; figures pose on twos, cameras on
 * ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,backpedal,lunge,celebrate,keeperSet,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult,type InkFill} from './athlete';

const K='navy',R='red',Y='yellow',G='green';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`raul film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/raul-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The Bernabéu, 2009','The Bernabéu, 2009: Real Madrid against Betis. The ball is slipped through, and Raúl is away! Ricardo rushes out, and Raúl scoops it over him! Goal!',
  ['The Bernabéu','Real Madrid','against Betis','The ball is slipped through','Raúl is away','Ricardo rushes out','scoops it','over him','Goal']),
 prov('Stay cool','Watch again, slowly. Ricardo charges out. Raúl stays cool. He slips his left foot under the ball and lifts it softly over the keeper.',
  ['Watch again','slowly','Ricardo charges out','Raúl stays cool','He slips his left foot','under the ball','lifts it softly','over the keeper']),
 prov('The Raulina','It drops into the empty net! A newspaper said this chip needed a name: the Raulina!',
  ['It drops','the empty net','A newspaper','needed a name','the Raulina']),
 prov('Your turn','Your turn: when the keeper rushes out, a gentle chip can be the best finish.',
  ['Your turn','when the keeper rushes out','a gentle chip','the best finish']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`raul film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Betis's goal is at x = 0, the pitch runs to x = −105;
// the main stand, where the broadcast camera sits, is on the −z side) =================
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
/** a 3D bar (width in metres) as a projected ribbon, skipped if an end is behind the camera */
function bar3(path:Path2D,c:Camera,a:V3,b:V3,wm:number,minW=1.2){if(depthOf(c,a)<NEAR+.2||depthOf(c,b)<NEAR+.2)return;const pa=P(c,a),pb=P(c,b),w=Math.max(minW,wm*kAt(c,mix3(a,b,.5)));path.addPath(ribbon([pa,pb],w,{taper:0,pressure:0,wobble:.3}));}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpAng=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= the Bernabéu at night, 2009: steep three-tier stands tight to the pitch, the roof ring of floodlights =================
const CX=-52.5,NS=56,PE=.3;
/** a point on the stand ring: angle th round the pitch centre, d metres out from the inner edge (a squarish superellipse ~6 m outside the lines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD1=32;
/** steep rake: three tiers climbing to ~40 m */
const RAKE=(b:number):[number,number]=>[1+(SD1-1)*b,1.4+38*b];
type Bowl={seg:V3[][];roof:V3[][];lamps:[V3,V3][];tiers:[V3,V3][];seats:{P:V3;h:number;away:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],lamps:[],tiers:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD1-9,y1+2.6),rim(b,SD1-9,y1+2.6),rim(b,SD1+2,y1+4),rim(a,SD1+2,y1+4)]);
  if(i%2===0)o.lamps.push([rim(a,SD1-8.6,y1+2.3),rim(b,SD1-8.6,y1+2.3)]);
  for(const f of[.34,.67]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<9;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,23);if(h<.16)continue;const[d,y]=RAKE((r+.5)/9);
   // a small Betis section high in one corner (inferred)
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away:r>=6&&i>=NS-5});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt)=>Math.abs(p[0])<Bnd&&Math.abs(p[1])<Bnd;
 // a February night in Madrid: a deep printed navy sky
 s.field(K,.78,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q,12);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(G,bowl,.22);s.tone(K,bowl,.45);
 // the crowd: a full house (79,500, confirmed) mostly in Madrid white, navy coats, red faces and scarves; the green Betis corner; bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<14)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.55/d,2.2,14),lift=cheer>0&&!q.away?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.away?(q.h<.8?2:0):q.h<.6?0:q.h<.85?1:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.78);s.fill(K,inks[1],.85);s.fill(G,inks[2],.9);s.fill(R,inks[3],.8);}
 // tier fronts: pale bands that give the steep stands their three tiers
 const tf=new Path2D();for(const[a,b] of BOWL.tiers){if(depthOf(c,a)<14||depthOf(c,b)<14)continue;bar3(tf,c,a,b,.9,1);}s.knockout(tf,.6);s.tone(G,tf,.2);
 s.knockout(roof);s.fill(K,roof,.92);
 // floodlight rails along the roof's front edge: lit lamp strips with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(depthOf(c,a)<NEAR+4||depthOf(c,b)<NEAR+4)continue;bar3(lamp,c,a,b,.9);bar3(glow,c,a,b,3.4);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 // camera flashes round the ground
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<14)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n){s.knockout(fp);s.fill(Y,fp,.9);}}
}
/** the pitch: floodlit grass (yellow × green), mowing stripes, paper lines, plain boards, corner flags, both goals */
const GRASS:V3[]=Array.from({length:64},(_,i)=>rim(i/64*TAU,0,0));
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const gp=new Path2D();addPoly(gp,clipPoly(c,GRASS));s.knockout(gp);s.fill(Y,gp,.8);s.tone(G,gp,.85);
 const stripes=new Path2D();for(let x=-105;x<0;x+=11)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.5,0,-34],[x+5.5,0,34],[x,0,34]]));s.tone(K,stripes,.14);
 // advertising boards behind the goal and along both touchlines (plain navy with paper panels; no brands)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,clipPoly(c,[a,b,add(b,[0,.9,0]),add(a,[0,.9,0])]));
 board([4.4,0,-30],[4.4,0,30]);board([-110,0,-37.5],[3,0,-37.5]);board([-110,0,37.5],[3,0,37.5]);
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,clipPoly(c,[[4.3,.25,z],[4.3,.25,z+3.3],[4.3,.66,z+3.3],[4.3,.66,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,clipPoly(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.66,zz],[x,.66,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(G,pn,.4);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 for(let k=0;k<6;k++){Ln([-k*17.5,-34],[-(k+1)*17.5,-34]);Ln([-k*17.5,34],[-(k+1)*17.5,34]);}
 for(let k=0;k<4;k++){Ln([0,-34+k*17],[0,-34+(k+1)*17]);Ln([-52.5,-34+k*17],[-52.5,-34+(k+1)*17]);Ln([-105,-34+k*17],[-105,-34+(k+1)*17]);}
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,0]);Ln([bx,0],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){bar3(pole,c,[0,0,z],[0,1.55,z],.05);addPoly(flag,clipPoly(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a goal on the line x = X, net 2 m deep toward dir: posts and bar, a box net; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H*.8,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),lerp(H,H*.8,v),lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(lerp(H,H*.8,u),0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.72);
 const frameP=new Path2D(),edge=new Path2D(),post=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 post([0,0,-W],[0,H+.06,-W]);post([0,0,W],[0,H+.06,W]);post([0,H,-W-.06],[0,H,W+.06]);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.4*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the white ball (paper, green shade, navy panels) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (21 February 2009; colours inferred, see the header) and the figure adapter =================
const SKIN:InkFill[]=[[R,.22],[Y,.45]],SKIN_M:InkFill[]=[[R,.3],[Y,.5],[K,.06]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Real Madrid: all white, navy trim and numbers (inferred: the usual home kit at the Bernabéu) */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:K,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],...o});
/** Real Betis: green-and-white striped shirts, white shorts, green socks (inferred: the club's home colours) */
const BET=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[G,.95],pattern:'stripes',patternInk:'paper',shorts:'paper',socks:[G,.95],trim:G,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
/** Raúl: 1.80 m, No. 7 (confirmed), short dark hair, left-footed (confirmed) */
const RAUL:AthleteStyle=RMA({number:7,hair:[K,.9],build:{height:1.8,bulk:.96,thighs:1.02},seed:7});
/** Ricardo, Betis's keeper (confirmed): kit colour inferred (red), long sleeves, gloves */
const RICARDO:AthleteStyle={shirt:[R,.9],shorts:[K,.9],socks:[R,.9],trim:K,boots:K,skin:SKIN,hair:[K,.85],hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.3],build:{height:1.87},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the pass in) =================
type TK=[number,number,number];// τ, x, z
type Role='raul'|'rma'|'bet'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
// ---- ball landmarks: the pass in, Raúl's first touch, the chip ----
const GR=9.81,RCV=1.45,CHIP=2.75,FLIGHT=1.2,IN_NET=CHIP+FLIGHT;
const PS:V3=[-33,.11,-6.5],RC:V3=[-17.6,.11,1.2],CH:V3=[-12.9,.11,2.3],LINE:V3=[0,1.35,.9];
/** where a player stands so his RIGHT boot meets a ball at b while facing f (ball ahead and a touch to the right) */
function standR(b:V3,f:[number,number],ahead=.44):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx;return[b[0]-fx*ahead-rx*.1,b[2]-fz*ahead-rz*.1];}
/** …his LEFT boot (ball ahead and a touch to the left): Raúl is left-footed */
function standL(b:V3,f:[number,number],ahead=.44):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx;return[b[0]-fx*ahead+rx*.1,b[2]-fz*ahead+rz*.1];}
const AIM:[number,number]=[LINE[0]-CH[0],LINE[2]-CH[2]];
const R_RC=standL(RC,[RC[0]-PS[0],RC[2]-PS[2]],.5),R_CH=standL(CH,AIM,.42),M_PS=standR(PS,[RC[0]-PS[0],RC[2]-PS[2]],.44);
/** Positions are Hermite-interpolated between keys. All inferred (see the header): only Raúl and Ricardo are in the accounts of the goal. */
const ACTORS:Actor[]=[
 {name:'Raúl',role:'raul',style:RAUL,key:true,keys:[[-3,-29,-4.2],[-2,-27.6,-3.2],[-1,-25.8,-2],[0,-23.6,-1.1],[.7,-21.2,-.2],[RCV,R_RC[0],R_RC[1]],[1.95,-16.2,1.6],[2.35,-14.5,1.95],[CHIP,R_CH[0],R_CH[1]],[3.1,-12.8,2.25],[3.7,-12.2,2.1],[4.5,-10.6,.8],[5.3,-9,-1.4],[6.1,-7.8,-4],[7,-6.8,-6.8],[8,-6.2,-8.8],[9.5,-6,-9.6]]},
 {name:'Ricardo',role:'gk',style:RICARDO,key:true,keys:[[-3,-1.4,-.4],[0,-1.6,.1],[.8,-2.3,.6],[1.5,-4.1,1.2],[2.15,-6.3,1.8],[2.55,-7.4,2.05],[2.8,-7.7,2.1],[9.5,-7.8,2.1]]},
 {name:'Melli',role:'bet',style:BET({seed:44,hair:[K,.9]}),key:true,keys:[[-3,-22,-3.5],[-1,-21.5,-2.5],[0,-21,-2],[1,-19.5,-1.2],[1.8,-17.2,-.2],[2.5,-15.2,.6],[3.2,-13.8,1.1],[4.5,-12.6,1.3],[9.5,-12,1.2]]},
 {name:'Madrid midfielder',role:'rma',style:RMA({seed:5,hair:[K,.7],hairStyle:'long'}),key:true,keys:[[-3,-38,-8.6],[-1.2,-35,-7.4],[0,M_PS[0],M_PS[1]],[1.2,-31,-5.6],[4,-27,-4],[9.5,-24,-3]]},
 {name:'Huntelaar',role:'rma',style:RMA({seed:11,hair:[Y,.8],build:{height:1.86}}),keys:[[-3,-26,7],[0,-22,6.2],[2,-17,5.6],[4,-12,5],[6,-9,2],[9.5,-8,-2]]},
 {name:'Higuaín',role:'rma',style:RMA({seed:20,skin:SKIN_M,hair:[K,.9]}),keys:[[-3,-27,-12],[0,-23.5,-11],[2.5,-18,-9.5],[5,-13,-8],[9.5,-10,-8.5]]},
 {name:'Marcelo',role:'rma',style:RMA({seed:12,skin:SKIN_D,hairStyle:'curly',hair:[K,.95]}),keys:[[-3,-40,-24],[0,-37,-22],[4,-31,-19],[9.5,-26,-16]]},
 {name:'Arzu',role:'bet',style:BET({seed:45,hair:[K,.8]}),keys:[[-3,-20,4.5],[0,-20.5,3.6],[1.5,-18.5,3.2],[3,-14.8,3.4],[5,-11.5,3],[9.5,-10.5,2.4]]},
 {name:'Nelson',role:'bet',style:BET({seed:42,skin:SKIN_D,hair:[K,.95]}),keys:[[-3,-21,-12.5],[0,-20.5,-11],[2,-17,-9],[4,-14,-7.8],[9.5,-12,-7]]},
 {name:'Vega',role:'bet',style:BET({seed:43}),keys:[[-3,-22,13],[0,-21,11.5],[2.5,-17,9],[9.5,-12,6]]},
 {name:'Damiá',role:'bet',style:BET({seed:46,hair:[K,.7]}),keys:[[-3,-33,2],[0,-30.5,0],[3,-25,1],[9.5,-19,1]]},
 {name:'Juande',role:'bet',style:BET({seed:47}),keys:[[-3,-35,-4],[0,-33,-3.2],[2,-30,-2.4],[9.5,-23,-2]]},
 {name:'Mehmet Aurelio',role:'bet',style:BET({seed:48,skin:SKIN_M}),keys:[[-3,-37,6],[9.5,-28,4]]},
 {name:'Gago',role:'rma',style:RMA({seed:8,hairStyle:'long'}),keys:[[-3,-45,1],[9.5,-36,0]]},
 {name:'Undiano Mallenco',role:'ref',style:REF,keys:[[-3,-42,-10],[0,-38,-11],[4,-30,-11.5],[9.5,-24,-11]]},
];
const RAI=0,GKI=1,MELI=2,MIDI=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-3,TB=9.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*GR*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*GR*s*s,lerp(a[2],b[2],u)];}
/** after the goal line the chip carries on (same velocity) until it lands inside the goal, then settles against the net */
const V_LINE:V3=[(LINE[0]-CH[0])/FLIGHT,(LINE[1]-CH[1]+.5*GR*FLIGHT*FLIGHT)/FLIGHT-GR*FLIGHT,(LINE[2]-CH[2])/FLIGHT];
const S_LAND=(V_LINE[1]+Math.sqrt(V_LINE[1]*V_LINE[1]+2*GR*(LINE[1]-.11)))/GR;
const LAND:V3=[LINE[0]+V_LINE[0]*S_LAND,.11,LINE[2]+V_LINE[2]*S_LAND],REST:V3=[1.7,.11,1.1],NET_HIT:V3=[2,.5,1];
function ballAt(tau:number):V3{
 if(tau<0)return PS;
 if(tau<RCV){const u=tau/RCV;return mix3(PS,RC,u*(1.35-.35*u));}
 if(tau<CHIP){const u=(tau-RCV)/(CHIP-RCV);return mix3(RC,CH,1-(1-u)*(1-u));}
 if(tau<IN_NET)return arc(CH,LINE,FLIGHT,tau-CHIP);
 const s=tau-IN_NET;if(s<S_LAND)return[LINE[0]+V_LINE[0]*s,LINE[1]+V_LINE[1]*s-.5*GR*s*s,LINE[2]+V_LINE[2]*s];
 const u=clamp((s-S_LAND)/.7);return mix3(LAND,REST,easeOut(u));
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** staying cool over the ball: balanced, head UP watching the keeper come */
const COOL:Partial<Pose>={lean:12,pitch:3,lHipF:24,rHipF:30,lKnee:34,rKnee:38,lHipA:8,rHipA:8,lShA:34,rShA:30,lElb:50,rElb:50,neckP:-6,squash:-.02};
/** the chip, LEFT foot: a short stab under the ball, leaning back a touch, the follow-through cut short, the right arm out for balance */
const CHIPP:Partial<Pose>={lean:2,pitch:-3,lKnee:42,lAnk:16,rShA:72,lShA:40};
/** the keeper makes himself big as he comes: low, knees wide, arms spread and down */
const SPREAD=clampPose(posed({lHipF:40,rHipF:40,lHipA:30,rHipA:30,lKnee:70,rKnee:70,lean:26,pitch:6,lShA:70,rShA:70,lShF:20,rShF:20,lElb:20,rElb:20,neckP:-18,lHand:1,rHand:1}));
/** Raúl's heading: along his run; squared up to the aim for the chip; toward the main stand as he celebrates */
function yawRaul(tau:number){const v=velOf(RAI,tau),run=Math.hypot(v[0],v[1])>.45?YAW(v[0],v[1]):YAW(AIM[0],AIM[1]);
 return lerpAng(run,YAW(AIM[0],AIM[1]),sm(2.1,2.45,tau)*(1-sm(3.3,3.8,tau)));}
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bet'?READY:stand();
 let p:Pose;
 if(k===RAI){yaw=yawRaul(tau);
  if(tau<.9||tau>3.5){const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));}
  else{const s=clamp((sp-1.5)/4),dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.4+.4*s});p=blendPose(READY,dr,clamp((sp-.6)/1.4));}
  p=over(p,COOL,sm(2.1,2.4,tau)*(1-sm(2.45,2.55,tau)));// he stays cool: balanced, eyes on the keeper
  const D=.8,st=CHIP-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.3}),Math.min(sm(0,.16,u),1-sm(1.05,1.5,u)));p=over(p,CHIPP,bump(.4,.9,u));}
  if(tau>3&&tau<4.1)p=over(p,{neckP:-18,lShA:36,rShA:30},bump(3,4.1,tau));// watches it drop in
  if(tau>4.1){const c=celebrate((tau-4.1)*.8,{kind:'run'});p=blendPose(p,c,sm(4.1,4.6,tau));}
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  // he spreads as he closes Raúl down, then twists to watch the ball go over and in
  const[rx,rz]=posOf(RAI,Math.min(tau,CHIP));if(tau>1.9){yaw=YAW(rx-x,rz-z);p=blendPose(p,SPREAD,sm(2.2,2.7,tau));}
  if(tau>CHIP+.15){p=over(p,{neckP:-40,lShF:110,rShF:130,lShA:30,rShA:40,lElb:30,rElb:20,lean:4,pitch:-4},sm(CHIP+.15,CHIP+.5,tau));yaw=lerpAng(yaw,YAW(1,-.2)+Math.PI,sm(CHIP+.5,IN_NET+.4,tau)*.8);}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===MIDI){const D=.85,u=(tau-(0-STRIKE_CONTACT*D))/D;if(tau>-.6&&tau<.3)yaw=lerpAng(yaw,YAW(RC[0]-x,RC[2]-z),sm(-.6,-.3,tau));
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.5}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===MELI){const[bx,bz]=posOf(RAI,tau);if(tau>0&&tau<3.6)yaw=lerpAng(yaw,YAW(bx-x,bz-z),Math.min(sm(0,.5,tau),1-sm(3.2,3.6,tau)));
  const u=(tau-(CHIP-.6*.8))/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===RAI?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===RAI||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===RAI}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],spd=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*7,{sq:clamp(spd/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon along projected 3D points (metres), width in metres; progress 0..1; optional arrowhead */
function trail3(s:Sheet,c:Camera,pts:V3[],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01||cov<=.02)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const g of pts.slice(0,n)){const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
const onGround=(p:[number,number][]):V3[]=>p.map(q=>[q[0],.03,q[1]]);
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** the chip's flight through the air, from the boot to where it lands in the net */
const chipArc=(n=18):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(CHIP+(IN_NET+S_LAND-CHIP)*i/n));
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** "stays cool": two calm rings breathing out from the ball on the grass */
function calmRings(s:Sheet,c:Camera,b:V3,t:number,w:number,seed:number){if(w<=.02)return;for(let i=0;i<2;i++){const ph=((t*.7)+i*.5)%1;groundRing(s,c,b[0],b[2],.3+ph*1.1,.3+ph*1.1,.035,Y,w*(1-ph)*.95,seed+i);}}
/** the open goal behind the keeper, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}
/** the space the keeper leaves above his head: a red bracket from his hands up to the chip's height */
function overHead(s:Sheet,c:Camera,x:number,z:number,w:number,seed:number){if(w<=.02)return;const a=P(c,[x,1.3,z]),e=P(c,[x,2.35,z]),wd=Math.max(6,kAt(c,[x,1,z])*.08);
 s.knockout(ribbon([a,e],wd*1.8,{seed,taper:.1}),.6*w);laneArrow(s,R,a,e,wd,{progress:w,seed,head:wd*3});}

// ================= chapter 1 (live, near real time): the high main-stand camera; the pass, Raúl away, the rush, the chip, the net =================
const tau1=(t:number)=>{const bs=T(0,'The ball is slipped through'),ra=T(0,'Raúl is away'),ro=T(0,'Ricardo rushes out'),sc=T(0,'scoops it'),g=T(0,'Goal'),E=SEC(0);
 return key(t,mono([[0,-2.6],[bs,-.25],[ra,.9],[ro-.3,1.55],[ro+.6,2.2],[sc+.1,CHIP],[g,IN_NET],[E+1,IN_NET+(E+1-g)]]),linear);};
const CAM1:V3=[-30,17,-58];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<IN_NET)return[lerp(b[0],-8,.25*sm(1,2.6,tau)),lerp(1,b[1],.3),b[2]*.6];
 const[x,z]=posOf(RAI,tau);return mix3([b[0]-2,1,b[2]*.6],[x,1,z],sm(IN_NET,IN_NET+1.4,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-2.6,3900],[0,4300],[RCV,5000],[2.3,5900],[CHIP,6300],[IN_NET,6200],[IN_NET+3,6800]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>.2?netRipple(goalIn-.2,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:13,
};

// ================= chapter 2 (TV replay, slow motion, low behind the goal line beside the post): the rush, the cool head, the left foot =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,1.1],[T(1,'Ricardo charges out'),1.5],[T(1,'Raúl stays cool'),2.15],[T(1,'He slips his left foot')+.2,2.42],[T(1,'under the ball')+.2,CHIP-.02],[T(1,'lifts it softly')+.3,CHIP+.3],[T(1,'over the keeper')+.4,CHIP+.7],[E,IN_NET-.1]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[dx,dz]=posOf(RAI,tau),[kx,kz]=posOf(GKI,Math.min(tau,2.8)),b=ballAt(tau);
 const push=sm(T(1,'Raúl stays cool')-.3,T(1,'under the ball'),t,easeInOutSine),follow=sm(T(1,'lifts it softly'),E-.3,t,easeInOutSine),early=1-sm(0,T(1,'Ricardo charges out')+.6,t,easeInOutSine);
 const mid:V3=[lerp(dx,kx,.45),.95,lerp(dz,kz,.45)],look=mix3(mid,[lerp(mid[0],b[0],.6),lerp(.95,b[1],.5),lerp(mid[2],b[2],.6)],follow);
 return cam([2.8+.8*early,1.05+.15*early,6.4+.6*early],look,1600+900*push-300*follow-200*early);}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),ro=T(1,'Ricardo charges out'),sc=T(1,'Raúl stays cool'),lf=T(1,'He slips his left foot'),ub=T(1,'under the ball'),ls=T(1,'lifts it softly'),ok=T(1,'over the keeper');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "charges out": the keeper's run off his line, drawn in red on the grass
  trail3(s,c,onGround(pathOf(GKI,0,2.7)),.15,R,{progress:sm(ro-.2,ro+.8,t,easeOut),cov:.95*(1-sm(ub,ub+.5,t)),seed:21});
  // "stays cool": calm rings breathing out from the ball
  const b0=ballAt(tau);calmRings(s,c,b0,t,sm(sc-.1,sc+.3,t)*(1-sm(ls-.2,ls+.1,t)),23);
  // "lifts it softly … over the keeper": the chip's arc drawn through the air, over him and into the net
  const aw=sm(ls-.15,ok+.5,t,easeOut)*(1-sm(E-.7,E-.3,t));
  trail3(s,c,chipArc(),.07,Y,{progress:aw,dashed:true,head:true,seed:25});
  const w=drawWorld(s,c,tau,tp,{ballMin:9,hero:true,glow:sm(lf-.1,lf+.3,t)*(1-sm(ok+.3,ok+.8,t))});
  // "his left foot … under the ball": a yellow spark on the left boot at the stab
  const ra=w.res.get(RAI);const age=t-ub;if(ra&&age>-.1&&age<.8){const f=ra.joints.lToe;if(f)sparkBurst(s,Y,f[0],f[1],kAt(c,CH)*.35,{n:8,seed:29,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.5)/.3)),width:8});}
  // "over the keeper": the space above his head
  const[kx,kz]=posOf(GKI,Math.min(tau,2.8));overHead(s,c,kx,kz,sm(ok-.3,ok+.2,t,easeOut)*(1-sm(E-.8,E-.4,t)),27);
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (replay, low behind Raúl): it drops into the empty net — the "Raulina" =================
const tau3=(t:number)=>{const E=SEC(2),dr=T(2,'It drops'),en=T(2,'the empty net'),np=T(2,'A newspaper');
 return key(t,mono([[0,CHIP-.05],[dr+.3,CHIP+.75],[en+.5,IN_NET+.1],[np+.4,IN_NET+.9],[E,IN_NET+3.4]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(RAI,tau),b=ballAt(tau),fol=sm(T(2,'A newspaper')-.4,T(2,'needed a name'),t,easeInOutSine);
 const look=mix3([lerp(b[0],-1,.35),lerp(1.2,b[1],.45),lerp(b[2],.5,.4)],[x,1.2,z],fol);
 return cam([-21.5+1.2*sm(0,E,t),2.7,-1.8-.6*sm(0,E,t)],look,key(t,mono([[0,1500],[T(2,'the empty net'),1700],[T(2,'A newspaper'),1500],[E,1700]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),dr=T(2,'It drops'),en=T(2,'the empty net'),rn=T(2,'the Raulina'),on=T(2,'needed a name'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>.2?netRipple(goalIn-.2,NET_HIT):undefined});
  // "It drops … the empty net": the goal mouth lit behind the stranded keeper, the arc drawn in
  goalMouth(s,c,sm(en-.3,en+.3,t)*(1-sm(on,on+.6,t)));
  trail3(s,c,chipArc(),.08,Y,{progress:sm(dr-.2,dr+.8,t,easeOut),cov:.9*(1-sm(on-.3,on+.3,t)),dashed:true,seed:41});
  drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  // "the Raulina": his celebration run, yellow on the grass, and sparks round him
  trail3(s,c,onGround(pathOf(RAI,IN_NET,IN_NET+3.2)),.15,Y,{progress:sm(on-.4,rn+.4,t,easeOut),cov:.9*(1-sm(E-.6,E-.25,t)),seed:43});
  const age=t-rn;if(age>-.1&&age<1){const[x,z]=posOf(RAI,tau),q=P(c,[x,1.9,z]);sparkBurst(s,Y,q[0],q[1],kAt(c,[x,1,z])*.9,{n:10,seed:45,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.6)/.4)),width:10});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(RAI,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a low side camera): when the keeper rushes out, a gentle chip =================
const tau4=(t:number)=>{const E=SEC(3),kr=T(3,'when the keeper rushes out'),gc=T(3,'a gentle chip'),bf=T(3,'the best finish');
 return key(t,mono([[0,1.2],[kr,1.5],[kr+1.2,2.45],[gc,2.6],[gc+.6,CHIP+.1],[bf+.3,CHIP+.8],[E,IN_NET+.3]]),linear);};
function cam4(t:number){const E=SEC(3),push=sm(T(3,'Your turn')-.3,T(3,'a gentle chip'),t,easeInOutSine),follow=sm(T(3,'a gentle chip')-.2,E-.5,t,easeInOutSine);
 const pan=sm(0,T(3,'when the keeper rushes out'),t,easeInOutSine),look:V3=[lerp(lerp(-17,-11,pan),-7.5,follow),1,lerp(1.9,1.5,follow)];
 return cam([look[0]+2.5,1.8,look[2]-16.5+1.5*push],look,1600+200*push-250*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),kr=T(3,'when the keeper rushes out'),gc=T(3,'a gentle chip'),bf=T(3,'the best finish');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  // "when the keeper rushes out": his run, red on the grass
  trail3(s,c,onGround(pathOf(GKI,0,2.7)),.14,R,{progress:sm(kr-.1,kr+.7,t,easeOut),cov:.9*(1-sm(bf,bf+.4,t)),seed:53});
  // "a gentle chip": the arc over him into the net; "the best finish": the empty goal lit
  const lw=sm(gc-.1,gc+.9,t,easeOut)*(1-sm(E-.6,E-.2,t));
  trail3(s,c,chipArc(),.13,Y,{progress:lw,seed:55});
  goalMouth(s,c,sm(bf-.2,bf+.3,t)*(1-sm(E-.6,E-.2,t)));
  calmRings(s,c,ballAt(Math.min(tau,CHIP)),t,sm(kr+.4,kr+.9,t)*(1-sm(gc,gc+.3,t)),51);
  drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const[kx,kz]=posOf(GKI,Math.min(tau,2.8));overHead(s,c,kx,kz,sm(gc-.1,gc+.4,t,easeOut)*(1-sm(bf+.4,bf+.9,t)),57);
 },
 still:5,
};

const story:RisoStory={
 id:'raul-signature',format:'11v11',title:'Raúl chips the keeper, 2009',
 theme:'When the keeper rushes out, stay cool: a gentle chip over him can be the best finish.',
 ageNote:'La Liga, Real Madrid 6–1 Real Betis, Estadio Santiago Bernabéu, Madrid, 21 February 2009 (41st minute). Raúl was 31.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a camera flash pops and the white ball is scooped up in a soft arc from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,u=age<=0?0:clamp(age/.9),up=Math.sin(u*Math.PI)*170,side=(r()<.5?-1:1)*u*90,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x+side,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
