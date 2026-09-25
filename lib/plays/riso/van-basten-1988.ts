/** Iconic play film: Marco van Basten's volley in the Euro 1988 final, Soviet Union 0–2 Netherlands, Olympiastadion, Munich, 25 June 1988 (54').
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/van-basten-1988/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/van-basten-1988/timing.json exists, replace the `TIMING` constant below with
 *   import timingJson from '../../../public/plays/narration/van-basten-1988/timing.json';  const TIMING:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * SOURCES (read Sept 2026 through web-search result summaries; written accounts only, we cannot watch the footage):
 *  - The Irish Times, "Euro Moments: Van Basten stuns the Soviets with volley heard around the world"
 *    https://www.irishtimes.com/sport/soccer/international/euro-moments-van-basten-stuns-the-soviets-with-volley-heard-around-the-world-1.2645705
 *  - UEFA.com, "Marco van Basten on EURO 1988 and THAT volley" and "Van Basten volley crowns Netherlands' EURO 1988 final win against USSR"
 *    https://www.uefa.com/uefaeuro/history/news/0252-0ce2a8e3dd0f-2b753b1365a3-1000--marco-van-basten-on-euro-1988-and-that-volley/
 *  - ESPN, "Van Basten and the greatest European Championship goal ever scored" https://www.espn.com/soccer/story/_/id/37448020
 *  - RTÉ Sport, "Interview: Meet the man who set up Van Basten's volley" (Arnold Mühren, 2021)
 *    https://www.rte.ie/sport/soccer/2021/0531/1225260-arnold-muhren-interview-rte-euro-88-van-basten-volley/
 *  - GiveMeSport, "Euro 1988: The story behind Marco van Basten's legendary volley"; futbolretro.es, "the impossible volley of the final"
 *  - Wikipedia, "UEFA Euro 1988 final" and "Rinat Dasayev"; museumofjerseys.com, "A look at the Netherlands' European Championship numbering"
 *  - Soccernostalgia interview on the 1988 Netherlands kit (Gavin Hope, Dirk Maas); historicalkits.co.uk "European Championship 1988";
 *    footballkitarchive.com / footballshirtculture.com "Soviet Union 1988 away kit"
 * CONFIRMED by those accounts: 25 June 1988, Olympiastadion, Munich; the Netherlands won 2–0 (Gullit 32', van Basten 54'), their first
 *  major title, so this goal made it 2–0; Adri van Tiggelen intercepted a Soviet pass and slipped the ball to Arnold Mühren (37) on the LEFT
 *  wing, who hit a long, floating/looping cross with his LEFT foot; van Basten, on the right of the box, tracked it towards the back post and,
 *  with the ball dropping towards the byline at a very tight angle (roughly 8 m from goal, 5–6 m from the goal line), volleyed it first
 *  time with his RIGHT foot, over keeper Rinat Dasayev and into the far top corner / just inside the far post; van Basten says he chose to
 *  "take a risk and shoot" rather than control it; Dasayev later said he might have stopped it with one hand instead of two; the ball was an
 *  adidas Tango; van Basten wore No. 12 at Euro 88 (he started the tournament as back-up to John Bosman's No. 9); the Netherlands wore
 *  orange shirts and socks with ORANGE shorts in the final (the away shorts, to avoid a white-shorts clash); the Soviet Union wore their
 *  white away kit (red collar, red CCCP lettering). Van Basten was the tournament's top scorer (5).
 * INFERRED / ILLUSTRATIVE: every position and run in metres (van Basten's spot is set from the "8 m from goal, 5–6 m from the line"
 *  account); flight times, the cross's apex (~7 m) and the shot's arc; that Mühren struck the pass first time; which touchline the main
 *  camera sat on (the covered west stand, so the cross comes from the far side and van Basten is on the near side, as the drawings show);
 *  Dasayev's exact spot off his near post, his two-handed leap and his dark keeper kit; the other players shown and where they stand
 *  (Gullit, Rijkaard, van Tiggelen; four Soviet defenders unnamed); the referee in black; the sunny afternoon; the stadium as drawn (the
 *  tent roof of acrylic panels on a cable net hung from masts over the main stand, the open bowl, the running track round the pitch, the
 *  orange crowd, flags, blank boards); the photographers; the celebration run.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 Mühren's cross): ch1 = the high main-stand broadcast camera in real time (van Tiggelen's pass,
 * the cross, the volley, the net); ch2 = the TV slow-motion replay from low in front of van Basten (eyes on the dropping ball, body over it,
 * the right-foot strike, ×≈5) with the tent roof behind; ch3 = the replay from behind the goal (the tight angle, the loop over Dasayev,
 * the far corner, the celebration); ch4 = the lesson (eyes, body over it, strike through it, then the hard angle works). Seams are forward
 * passages into the ball. Ball physics: the cross is ballistic (g = 9.81); contact points are read from the solved skeleton (right toe)
 * so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer().
 * Inks: yellow (sun, grass with blue), orange (the Dutch, the crowd, the track), blue (sky, roof, grass), navy (key line). Scenes read
 * only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded.
 * Budget: ~150–300 plate ops per frame (4 plates); wide-shot figures forced to 'low' detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,volley,strike,STRIKE_CONTACT,backpedal,celebrate,keeperSet,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult} from './athlete';

const K='navy',O='orange',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet (never sheet.safe): world (dx,dy) lands on the sheet centre. A narrow (square) card gets a slightly wider lens. */
let LENS=1;
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(clamp(s.W/Math.max(1,s.H)/1.45,.6,1),.55);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?…]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`van basten film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** Kokoro timing: null until the lead voices the film (see the header) — then only this line changes. */
import timingJson from '../../../public/plays/narration/van-basten-1988/timing.json';
const TIMING:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The final',"Munich, 1988, the Euro final. The Netherlands, in orange, lead the Soviet Union one-nil. Arnold Mühren floats a long cross from the left, and van Basten volleys it. Goal!",
  ['Munich','the Euro final','The Netherlands','in orange','the Soviet Union','Arnold Mühren','floats','a long cross','from the left','van Basten','volleys it','Goal']),
 prov('Watch again','Watch again, slowly. He watches the ball all the way. He gets over it and strikes first time, with his right foot.',
  ['Watch again','slowly','He watches','all the way','He gets over it','strikes first time','his right foot']),
 prov('Over the keeper','From that tight angle, it loops over Dasayev into the far corner. Two-nil! The Netherlands are champions of Europe!',
  ['From that tight angle','it loops','over Dasayev','into the far corner','The Netherlands','champions of Europe']),
 prov('Your turn','Eyes on the ball, body over it, strike cleanly through it. With perfect technique, even hard angles can work.',
  ['Eyes on the ball','body over it','strike cleanly','through it','With perfect technique','even hard angles','can work']),
],TIMING);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`van basten film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
/** a camera from position, look point and focal length F (sheet units) */
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/F)/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
/** a 3D polyline (near-clipped) into a path, for cables and nets */
function line3(path:Path2D,c:Camera,pts:V3[]){let on=false;for(const p of pts){if(depthOf(c,p)<NEAR+.1){on=false;continue;}const q=P(c,p);if(on)path.lineTo(q[0],q[1]);else path.moveTo(q[0],q[1]);on=true;}}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

// ================= the Olympiastadion: an athletics bowl (track round the pitch), the tent roof over the main stand, an orange crowd =================
const CX=-52.5,OA=79,OB=36.5;// track inner edge: a squared oval round the pitch centre
/** a point on the oval `off` metres outside the track's inner edge at angle θ (θ = 90° is the main stand, +z) */
function oval(th:number,off:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th),e=.5;return[CX+(OA+off)*Math.sign(c)*Math.pow(Math.abs(c),e),y,(OB+off)*Math.sign(s)*Math.pow(Math.abs(s),e)];}
const NS=44;// segments round the bowl
/** the bowl: main (west, +z) stand deeper and taller under the roof; the open east terraces lower */
const standH=(th:number)=>18+12*Math.max(0,Math.sin(th)),standD=(th:number)=>36+18*Math.max(0,Math.sin(th));
const ST_OFF=11;
const standPt=(th:number,v:number):V3=>oval(th,ST_OFF+standD(th)*v,1.2+standH(th)*v);
/** crowd: [θ, v, ink 0 paper / 1 navy / 2 orange / 3 yellow, phase]; the Dutch end and terraces run orange */
const CROWD=(()=>{const r=rng(1988),out:[number,number,number,number][]=[];for(let i=0;i<1700;i++){const th=r()*TAU,v=.05+r()*.88,c=r(),orangeBias=.36+.18*Math.max(0,Math.cos(th));out.push([th,v,c<orangeBias?2:c<orangeBias+.26?0:c<orangeBias+.44?1:3,r()*TAU]);}return out;})();
/** roof: saddle tents over the main stand between masts; front edge cable sags between the tent peaks */
const R_TH0=.16*Math.PI,R_TH1=.84*Math.PI,R_N=5;
const roofPt=(th:number,w:number):V3=>{const u=(th-R_TH0)/(R_TH1-R_TH0),ph=u*R_N,sag=Math.abs(Math.sin(ph*Math.PI)),front=34+7*(1-sag)-2*w,base=oval(th,4+w*64,0);base[1]=front+(1-w)*0+w*(10*sag)-4*w;return base;};
const MASTS:V3[]=Array.from({length:R_N+1},(_,i)=>{const th=R_TH0+(R_TH1-R_TH0)*i/R_N;return oval(th,86,0);});
/** Dutch flags and orange banners along the terrace tops */
const FLAGS:[number,number][]=Array.from({length:22},(_,i)=>[(i/22)*TAU+.07,i%3]);
type Crowd={cheer?:number;t:number;net?:(p:V3)=>V3;roof?:boolean};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.6;
 // June sun: pale sky screen, a deeper band high up, paper cloud puffs
 s.field(B,.18,.7);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.3);
 {const cl=new Path2D(),r=rng(88);for(let i=0;i<6;i++){const x=(r()-.5)*Bnd*1.2,y=hz-300-r()*560,w=200+r()*380;cl.addPath(polyPath(Array.from({length:16},(_,k)=>{const a=k/16*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.2*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.6);}
 // masts and their cables behind the main stand (drawn before the stands so the bowl sits in front)
 const mast=new Path2D(),cable=new Path2D();
 MASTS.forEach((m,i)=>{const top:V3=[m[0]+(i-R_N/2)*2,62,m[2]-6];if(depthOf(c,m)<2||depthOf(c,top)<2)return;const pm=P(c,m),pt=P(c,top);mast.addPath(ribbon([pm,pt],Math.max(3,.9*kAt(c,top)),{taper:.3,wobble:0}));
  const th=R_TH0+(R_TH1-R_TH0)*i/R_N;for(const w of[.15,.55,1])line3(cable,c,[top,roofPt(th,w)]);});
 // the bowl: stands knocked out, a navy screen, stepped tiers
 const stands=new Path2D(),rows=new Path2D(),walls=new Path2D();
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;addPoly(stands,clipPoly(c,[standPt(a,0),standPt(b,0),standPt(b,1),standPt(a,1)]));
  for(let k=0;k<10;k+=2)addPoly(rows,clipPoly(c,[standPt(a,k/10),standPt(b,k/10),standPt(b,(k+1)/10),standPt(a,(k+1)/10)]));
  addPoly(walls,clipPoly(c,[standPt(a,0),standPt(b,0),oval(b,ST_OFF,0),oval(a,ST_OFF,0)]));}
 s.knockout(stands);s.tone(K,stands,.4);s.tone(B,rows,.3);s.tone(K,rows,.18);
 // crowd heads: faces, orange shirts and scarves, navy, yellow; bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[th,v,col,ph] of CROWD){const bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=standPt(th,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.6*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.9);if(seen[2])s.fill(O,heads[2],.95);if(seen[3])s.fill(Y,heads[3],.95);
 s.fill(K,walls,.72);
 // flags on the terrace tops (the Dutch tricolour, orange banners), fluttering
 {const pole=new Path2D(),orng=new Path2D(),blu=new Path2D(),wht=new Path2D();let n=0;
  FLAGS.forEach(([th,kind],i)=>{const b=standPt(th,1);if(depthOf(c,b)<4)return;const top:V3=[b[0],b[1]+5,b[2]],k=kAt(c,b),pb=P(c,b),pt=P(c,top);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;n++;pole.addPath(ribbon([pb,pt],Math.max(2,.14*k),{taper:0,wobble:0}));
   const w=2.8*k,h=1.8*k,wv=(u:number)=>Math.sin(tt*5+i+u*4)*h*.12*u,cloth=(v0:number,v1:number)=>polyPath([[pt[0],pt[1]+h*v0],[pt[0]+w,pt[1]+h*v0+wv(1)],[pt[0]+w,pt[1]+h*v1+wv(1)],[pt[0],pt[1]+h*v1]],true);
   if(kind===0){orng.addPath(cloth(0,.34));wht.addPath(cloth(.33,.67));blu.addPath(cloth(.66,1));}else orng.addPath(cloth(0,1));});
  if(n){s.fill(K,pole,.95);s.knockout(orng);s.fill(O,orng,.95);s.knockout(wht);s.knockout(blu);s.fill(B,blu,.95);}}
 // the tent roof: translucent acrylic panels on a cable net, a heavy edge cable along the front
 if(o.roof!==false){const roof=new Path2D(),net=new Path2D(),edge=new Path2D(),NU=36;
  const poly:V3[]=[];for(let i=0;i<=NU;i++)poly.push(roofPt(lerp(R_TH0,R_TH1,i/NU),0));for(let i=NU;i>=0;i--)poly.push(roofPt(lerp(R_TH0,R_TH1,i/NU),1));
  if(poly.some(p=>depthOf(c,p)>2)){addPoly(roof,clipPoly(c,poly));
   for(let j=1;j<4;j++){const row:V3[]=[];for(let i=0;i<=NU;i++)row.push(roofPt(lerp(R_TH0,R_TH1,i/NU),j/4));line3(net,c,row);}
   for(let i=0;i<=NU;i+=3){const col:V3[]=[];for(let j=0;j<=4;j++)col.push(roofPt(lerp(R_TH0,R_TH1,i/NU),j/4));line3(net,c,col);}
   const fr:V3[]=[];for(let i=0;i<=NU;i++)fr.push(roofPt(lerp(R_TH0,R_TH1,i/NU),0));line3(edge,c,fr);
   s.knockout(roof,.8);s.tone(B,roof,.38);s.tone(K,roof,.2);s.stroke(K,net,2.2,.5);s.stroke(K,edge,8,.95);}}
 s.fill(K,mast,.95);s.stroke(K,cable,3,.8);
 // the running track (brick), the infield grass (yellow × blue), the pitch's mowing stripes and paper lines
 const track=new Path2D(),infield=new Path2D(),NT=48;
 {const inner:V3[]=[],outer:V3[]=[];for(let i=0;i<NT;i++){const a=i/NT*TAU;inner.push(oval(a,0,0));outer.push(oval(a,ST_OFF,0));}
  addPoly(infield,clipPoly(c,inner));for(let i=0;i<NT;i++){const j=(i+1)%NT;addPoly(track,clipPoly(c,[inner[i],inner[j],outer[j],outer[i]]));}}
 s.knockout(track);s.fill(O,track,.7);s.tone(K,track,.2);
 s.knockout(infield);s.fill(Y,infield,.88);s.tone(B,infield,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 boards(s,c,tt);
 goal(s,c,o.net);
}
/** perimeter boards (blank colour blocks, no brands) along the touchlines and behind the goal, plus photographers at the byline */
function boards(s:Sheet,c:Camera,tt:number){
 const inks=[new Path2D(),new Path2D(),new Path2D()],back=new Path2D();let i=0;
 const run=(a:[number,number],b:[number,number],n:number)=>{for(let k=0;k<n;k++){const u0=k/n,u1=(k+.94)/n,p0:[number,number]=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:[number,number]=[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)];
  const q=clipPoly(c,[[p0[0],0,p0[1]],[p1[0],0,p1[1]],[p1[0],.9,p1[1]],[p0[0],.9,p0[1]]]);addPoly(back,q);addPoly(inks[(i++)%3],q);}};
 run([-100,-38],[-4,-38],16);run([-100,38],[-4,38],16);run([5.5,-30],[5.5,30],10);
 s.knockout(back);s.fill(O,inks[0],.85);s.fill(B,inks[1],.85);s.fill(Y,inks[2],.95);s.tone(K,back,.12);
 const coat=new Path2D(),face=new Path2D();let n=0;
 ([[2.8,-10.5],[2.5,-7.8],[2.9,6.8],[2.6,9.8],[3.1,12.9],[2.7,15.4]] as [number,number][]).forEach(([x,z],j)=>{const g:V3=[x,0,z];if(depthOf(c,g)<7)return;const k=kAt(c,g),[gx,gy]=P(c,g);if(Math.abs(gx)>s.W||Math.abs(gy)>s.H)return;
  const bob=Math.sin(tt*3+j)*.02*k;coat.addPath(polyPath([[gx-.35*k,gy],[gx+.35*k,gy],[gx+.3*k,gy-.7*k],[gx-.25*k,gy-.8*k]],true));coat.rect(gx-.3*k,gy-.98*k+bob,.26*k,.18*k);
  face.addPath(polyPath(Array.from({length:10},(_,a)=>[gx+Math.cos(a/10*TAU)*.13*k,gy-.95*k+bob+Math.sin(a/10*TAU)*.14*k] as Pt),true));n++;});
 if(n){s.knockout(face);s.tone(O,face,.3);s.tone(Y,face,.45);s.knockout(coat);s.fill(K,coat,.85);}
}
/** the goal at x = 0: posts, bar, a box net to rear stanchions; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){const col:V3[]=[];for(let j=0;j<=nv;j++)col.push(f(i/nu,j/nv));line3(mesh,c,col);}
  for(let j=0;j<=nv;j++){const row:V3[]=[];for(let i=0;i<=nu;i++)row.push(f(i/nu,j/nv));line3(mesh,c,row);}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[0,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the adidas Tango: a paper ball printed with navy triads (three arcs round a ring), a blue shade =================
const BALL_R=.11;
function tangoBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r,Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.25);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.3:.4);
 // triads turning with the spin: a small ring with three curved arcs round it, foreshortened toward the rim
 const tri=new Path2D();for(let k=0;k<4;k++){const a=spin+k*TAU/4,rr=r*(.2+.5*Math.abs(Math.sin(spin*.6+k*1.7))),cx=Math.cos(a)*rr,cy=Math.sin(a)*rr,f=1-.5*rr/r,rad=r*.2*f;
  tri.moveTo(cx+rad*.55,cy);tri.arc(cx,cy,rad*.55,0,TAU);for(let j=0;j<3;j++){const b=a*1.3+j*TAU/3;tri.moveTo(cx+Math.cos(b-.5)*rad*1.3,cy+Math.sin(b-.5)*rad*1.3);tri.arc(cx,cy,rad*1.3,b-.5,b+.5);}}
 s.stroke(K,tri,Math.max(1.6,r*.09),.9);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r,Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (Euro 88 final) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[O,.2],[Y,.45]],SKIN_DARK:AthleteStyle['skin']=[[O,.45],[Y,.55],[K,.32]];
const NED=(skin:AthleteStyle['skin'],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:O,socks:O,trim:'paper',boots:K,skin,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.28],sleeves:'short',...o});
const URS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:O,boots:K,skin:SKIN_LIGHT,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',...o});
const VB:AthleteStyle=NED(SKIN_LIGHT,{number:12,numberInk:'paper',hair:[K,.55],build:{height:1.88,bulk:.96,thighs:1.02},seed:12});
const MUH:AthleteStyle=NED(SKIN_LIGHT,{hair:[Y,.55],hairStyle:'balding',build:{height:1.78,bulk:.92},seed:8});
const GULLIT:AthleteStyle=NED(SKIN_DARK,{hair:K,hairStyle:'long',build:{height:1.91,bulk:1.05},seed:10});
const KEEPER:AthleteStyle={shirt:[K,.72],shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_LIGHT,hair:[K,.8],line:K,sleeves:'long',gloves:'paper',shade:[K,.26],build:{height:1.86},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'short',seed:33};
/** duotone version of a kit for the lesson chapter (navy + orange + paper) */
const duo=(st:AthleteStyle):AthleteStyle=>({...st,shirt:O,shorts:'paper',socks:O,trim:'paper',skin:[[Y,.55],[O,.18]],hair:K,shade:[K,.24]});
type PrevP={pose:Pose;place:Place};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:PrevP;smear?:boolean;low?:boolean}={}):DrawResult{
 const st=o.low?{...style,detail:'low' as const}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Mühren's cross) =================
const G=9.81,TF=2.45;// cross flight: long and looping (≈7 m apex)
const LAUNCH:V3=[-31.5,.11,-24.5];// Mühren, out on the Dutch left (the far touchline from the main camera)
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}

// ---- van Basten: the volley. His spot: ≈5.5 m from the goal line, ≈8 m from the near post (right side of the box, near the camera) ----
const VBB:Build=VB.build!;
const V_AIM:[number,number]=[-5.5,9.1];
const SHOT_TO:V3=[0,2.12,-3.2];// just inside the far post, high
const VOL=(u:number)=>volley(u,{foot:'r',height:.32});
const YV=YAW(SHOT_TO[0]-V_AIM[0],SHOT_TO[2]-V_AIM[1])+24*D2R;
const VOL_SK=solve(VOL(.5),VBB,{yaw:YV});
const V_HIT:V3=[V_AIM[0],VOL_SK.rToe[1]+.1,V_AIM[1]];
const PV:[number,number]=[V_AIM[0]-VOL_SK.rToe[0],V_AIM[1]-VOL_SK.rToe[2]];
const TV=TF;// the cross is met in the air: contact = end of the cross flight
const TS=.72,T_GOAL=TV+TS;// the shot: a looping top-spin volley over the keeper
const SHOT_BULGE=1.45;
const VB_RUN:MKey[]=[[-9,-24,2.5],[-5,-18,4.5],[-1.5,-11.5,7.2],[TV-1.2,PV[0]-2.2,PV[1]+.4],[TV-.55,PV[0],PV[1]]];
const CELEB:MKey[]=[[TV+.55,PV[0],PV[1]],[TV+1.6,PV[0]-2.4,PV[1]+3.6],[TV+3.2,PV[0]-6,PV[1]+7.2],[TV+5,PV[0]-9,PV[1]+9.5]];
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const VB_SEGS:Seg[]=[
 [-99,t=>{const r=runner(VB_RUN,t,ballAt(t));if(t>TV-1.6){r.place.yaw=lerpAng(r.place.yaw??0,YV,sm(TV-1.3,TV-.6,t));r.pose={...r.pose,neckP:lerp(r.pose.neckP,-20*D2R,sm(TV-1.6,TV-1,t))};}return r;}],
 [TV-.55,t=>({pose:VOL(clamp((t-(TV-.5))/1)),place:{x:PV[0],z:PV[1],yaw:YV}})],
 [TV+.55,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(-3,2.3)}};}],
];
function segAt(segs:Seg[],tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=segs[a][1](tau),Bq=segs[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}
const vbAt=(tau:number)=>segAt(VB_SEGS,tau);

// ---- Mühren: runs onto van Tiggelen's pass and crosses first time with his LEFT foot ----
const YM=YAW(V_AIM[0]-LAUNCH[0],V_AIM[1]-LAUNCH[2])+8*D2R;
const M_SK=solve(strike(STRIKE_CONTACT,{foot:'l'}),MUH.build,{yaw:YM});
const PM:[number,number]=[LAUNCH[0]-M_SK.lToe[0]-Math.cos(YM)*.08,LAUNCH[2]-M_SK.lToe[2]+Math.sin(YM)*.08];
const M_RUN:MKey[]=[[-9,-47,-29],[-4,-40,-27.5],[-.6,PM[0]-Math.cos(YM)*2.2,PM[1]+Math.sin(YM)*2.2]];
const M_SEGS:Seg[]=[
 [-99,t=>runner(M_RUN,t,ballAt(t))],
 [-.6,t=>({pose:strike(clamp((t-(-.52))/1),{foot:'l'}),place:{x:PM[0],z:PM[1],yaw:YM}})],
 [.5,t=>runner([[.5,PM[0],PM[1]],[3,PM[0]+6,PM[1]+4],[8,PM[0]+14,PM[1]+8]],t,ballAt(t))],
];

// ---- the ball ----
const TIGG:MKey[]=[[-9,-64,-4],[-5,-54,-8],[-2.7,-47.5,-11.5]];// van Tiggelen carries it after the interception
const T_PASS=-2.6;
const P_FROM:V3=[-46.8,.11,-12];
function ballAt(tau:number):V3{
 if(tau<T_PASS){const q=pathPos(TIGG,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.35+.25*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
 if(tau<0){const u=easeOut((tau-T_PASS)/-T_PASS)*.92+.08*((tau-T_PASS)/-T_PASS),a=ballAt(T_PASS-1e-4);return[lerp(a[0],LAUNCH[0],u),.11,lerp(a[2],LAUNCH[2],u)];}
 if(tau<TF){const u=tau/TF,vy=(V_HIT[1]-LAUNCH[1]+.5*G*TF*TF)/TF;return[lerp(LAUNCH[0],V_HIT[0],u),LAUNCH[1]+vy*tau-.5*G*tau*tau,lerp(LAUNCH[2],V_HIT[2],u)];}
 const s=tau-TV;
 if(s<TS){const u=s/TS,p=mix3(V_HIT,SHOT_TO,u);p[1]+=SHOT_BULGE*4*u*(1-u)*(1+.25*(1-2*u));return p;}
 const e=s-TS,u=clamp(e/.18);if(u<1)return mix3(SHOT_TO,[1.7,1.75,-3.35],easeOut(u));
 const d=clamp((e-.18)/.6),h=1.75*(1-d*d)+.11*d*d;return[1.7-.25*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.78)*8))*Math.exp(-(e-.78)*3):0),-3.35+.2*d];}
const NET_HIT:V3=[2,1.75,-3.35];
const APEX=(()=>{let m=0;for(let i=0;i<=40;i++)m=Math.max(m,ballAt(TF*i/40)[1]);return m;})();

// ---- Dasayev: covers the near post, steps off his line, leaps with both hands up as the ball loops over ----
const KP:[number,number]=[-1.9,2.1];
const K_LEAP:[number,Pose][]=[
 [0,keeperSet(0)],
 [.28,posed({air:.34,pitch:-10,lean:-8,dx:-.15,lShF:158,rShF:164,lShA:26,rShA:22,lElb:16,rElb:12,lHipF:34,rHipF:22,lKnee:66,rKnee:52,lAnk:40,rAnk:40,neckP:-44,lHand:1,rHand:1})],
 [.46,posed({air:.44,pitch:-18,lean:-16,dx:-.35,lShF:176,rShF:182,lShA:18,rShA:14,lElb:6,rElb:4,lHipF:22,rHipF:12,lKnee:58,rKnee:42,lAnk:44,rAnk:44,neckP:-55,lHand:1,rHand:1})],
 [.78,posed({air:.02,pitch:-8,lean:4,dx:-.6,lShF:110,rShF:116,lShA:30,rShA:30,lElb:30,rElb:30,lHipF:30,rHipF:26,lKnee:46,rKnee:40,neckP:-30,neckY:-40,lHand:.8,rHand:.8})],
 [1,posed({pitch:2,lean:18,dx:-.7,lShF:30,rShF:30,lShA:34,rShA:34,lElb:40,rElb:40,lHipF:34,rHipF:30,lKnee:40,rKnee:36,neckP:-4,neckY:-70,lHand:.5,rHand:.5})],
];
function keeperAt(tau:number,b:V3):{pose:Pose;place:Place}{
 const q=pathPos([[-9,-1.2,-1],[0,-1.3,-.6],[TF-.9,-1.5,1.7],[TV-.1,KP[0],KP[1]]],tau);
 const face=YAW(b[0]-q.x,b[2]-q.z);
 if(tau<TV-.02)return{pose:keeperSet(tau*1.6),place:{x:q.x,z:q.z,yaw:face}};
 return{pose:keyPoses(clamp((tau-(TV-.02))/1.1),K_LEAP),place:{x:KP[0],z:KP[1],yaw:YAW(V_HIT[0]-KP[0],V_HIT[2]-KP[1])}};}

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const ACTORS:Actor[]=[
 {style:MUH,at:t=>segAt(M_SEGS,t)},
 {style:NED(SKIN_LIGHT,{seed:5}),at:(t,b)=>{const r=runner([...TIGG,[T_PASS+1.5,-44,-13.5],[TV+2,-38,-15]],t,b);if(t>T_PASS-.45&&t<T_PASS+.5){const u=clamp((t-(T_PASS-.45))/.95);r.pose=blendPose(r.pose,strike(u,{power:.35}),Math.sin(u*Math.PI));}return r;}},// van Tiggelen
 {style:GULLIT,at:(t,b)=>runner([[-9,-31,-5],[0,-19,-3.2],[TV,-10.5,-.8],[TV+1.5,-8,3.5],[TV+5,-9,10]],t,b)},// Gullit
 mover(NED(SKIN_DARK,{seed:17}),[[-9,-44,3],[0,-36,1],[TV+3,-30,2]]),// Rijkaard
 mover(NED(SKIN_LIGHT,{seed:6}),[[-9,-33,16],[0,-25,15],[TV,-19,13.5]]),// right side
 {style:URS({seed:40,build:{height:1.84}}),at:(t,b)=>{const r=runner([[-9,-15,3],[0,-11.5,4.8],[TV-.2,-8.6,6.3],[TV+1.5,-8.4,5.2]],t,b,backpedal(0));if(t>TV-.4&&t<TV+1){r.place.yaw=YAW(b[0]-(r.place.x??0),b[2]-(r.place.z??0));}return r;}},// closes van Basten, a step late
 mover(URS({seed:41,build:{height:1.86}}),[[-9,-18,-4],[0,-12.5,-3.5],[TV,-9.4,-1.8],[TV+2,-8.8,-.8]],backpedal(0)),// with Gullit
 mover(URS({seed:42}),[[-9,-20,-12],[0,-14,-9],[TV,-10.5,-5.6]],backpedal(0)),
 mover(URS({seed:43}),[[-9,-40,-15],[-2,-35,-20],[TV,-30.5,-21.5]]),// closing Mühren
 mover(URS({seed:44}),[[-9,-34,8],[0,-28,6],[TV,-23,5.5]]),
 {style:KEEPER,at:(t,b)=>keeperAt(t,b)},// Rinat Dasayev
 mover(REF,[[-9,-50,10],[0,-38,9],[TV,-28,9.5]]),
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws van Basten with motion smear + secondary motion; `low` forces wide-shot detail. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;low?:boolean;glow?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[];let vbRes:DrawResult|null=null;
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:PrevP,smear=false,isVB=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear,low:o.low&&!isVB});if(isVB)vbRes=r;}});};
 for(const a of ACTORS)put(a.style,a.at(tp,bp));
 put(VB,vbAt(tp),o.hero?vbAt(tp-1/12):undefined,!!o.hero,true);
 items.push({depth:depthOf(c,ball),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.5,q[1]+Math.sin(i/20*TAU)*r*1.5] as Pt),true),r*.25*o.glow,.95);
  tangoBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,vb:vbRes as DrawResult|null};}

// ================= chapter 1 (live, real time): the high camera in the covered main stand; the cross, the volley, the net =================
const ch1T=()=>{const end=SEC(0),TL=T(0,'volleys it')+.12-TV;return{TL,end};};
const BCAM:V3=[-36,22,62];
function ch1Look(tau:number):V3{const b=ballAt(tau);
 if(tau<0){const w=.15+.35*sm(-2.4,0,tau);return[lerp(b[0],-20,w),1,lerp(b[2],-4,w)];}
 if(tau<TF){const u=sm(0,TF,tau);return mix3([lerp(b[0],-16,.45),1.2,lerp(b[2],-2,.45)],[-6.5,1.2,4.2],u);}
 return mix3([-5.5,1.2,4],[-3.5,1.1,2.5],sm(TV,TV+1.2,tau));}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.25),c=ch1Look(tau-.5),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,6800],[-3,6400],[-.3,4600],[TF-1,5600],[TF-.2,8400],[TV+.8,8400],[TV+2,7200],[TV+6,6600]])*LENS;return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const{TL}=ch1T(),tt=twos(t),goalIn=t-TL-T_GOAL;frame(s);const c=ch1Cam(t);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.5,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,t-TL,tt-TL,{ballMin:14,low:true});},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low in front of van Basten): eyes on the ball, over it, the right-foot strike =================
const ch2T=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),hw:T(1,'He watches'),aw:T(1,'all the way'),go:T(1,'He gets over it'),st:T(1,'strikes first time'),rf:T(1,'his right foot'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,TV-1.55],[q.hw+.2,TV-1.1],[q.aw+.3,TV-.66],[q.go+.35,TV-.3],[q.st+.25,TV],[q.rf+.3,TV+.1],[q.end,TV+.2]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.go,q.end,t,easeIO);
 const ang=YV-(62-38*orbit)*D2R,D=lerp(8.2,6.6,sm(q.w,q.st,t)),pos:V3=[PV[0]+Math.cos(ang)*D,.95,PV[1]-Math.sin(ang)*D];
 const body:V3=[PV[0],1.0,PV[1]],w=key(t,mono([[0,.55],[q.hw,.5],[q.go,.25],[q.st,.12],[q.end,.1]]));
 const F=key(t,mono([[0,1350],[q.hw,1500],[q.go,1750],[q.st,1900],[q.end,1800]]))*LENS;
 return cam(pos,mix3([b[0],Math.min(b[1],4.6),b[2]],body,1-w),F);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1});
  const glow=sm(q.hw-.1,q.hw+.3,tt)*(1-sm(q.st,q.st+.5,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:30,hero:true,glow});
  // eyes on the ball: a dotted sight line from his face to the ball while he watches it all the way down
  const eye=sm(q.hw,q.hw+.4,tt)*(1-sm(q.st+.2,q.st+.6,tt));
  if(eye>.02&&w.vb){const h=w.vb.joints.face??w.vb.joints.head,bb=P(c,w.ball),dots=new Path2D(),n=12;for(let i=1;i<n;i++){const u=i/n,x=lerp(h[0],bb[0],u),y=lerp(h[1],bb[1],u);dots.moveTo(x+6,y);dots.arc(x,y,6,0,TAU);}s.fill(Y,dots,.95*eye);}
  // the strike: a spark where the laces meet the ball, speed lines as it leaves
  if(tp>=TV&&tp<TV+.3){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],110+120*sm(TV,TV+.1,tp,easeOut),{n:10,seed:88,g:1-sm(TV+.12,TV+.3,tp),width:13});}
  if(tp>TV){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:89,len:160,width:7,cov:.8});}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(30,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 (replay from behind the goal, far post side): the tight angle, the loop over Dasayev, the far corner, champions =================
const ch3T=()=>({a:T(2,'From that tight angle'),l:T(2,'it loops'),o:T(2,'over Dasayev'),f:T(2,'into the far corner'),n:T(2,'The Netherlands'),ch:T(2,'champions of Europe'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,TV-.75],[q.l,TV-.02],[q.o+.3,TV+.4],[q.f+.35,T_GOAL+.05],[q.end,T_GOAL+.05+(q.end-q.f-.35)]]),x=>x);};
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),b=ballAt(tau),vb=vbAt(tau).place;
 const early:V3=[lerp(V_AIM[0],-1,.35),1.3,lerp(V_AIM[1],0,.45)];
 const flight=mix3(early,[lerp(b[0],-1.2,.5),clamp(b[1],1.2,2.4)*.8,lerp(b[2],1.5,.4)],sm(q.l-.2,q.o+.2,t));
 const cel=sm(q.f+.6,q.n+.6,t,easeInOutSine),look=mix3(flight,[vb.x??0,1.2,vb.z??0],cel);
 const pos:V3=[lerp(3.4,1.2,cel),lerp(1.5,1.8,cel),lerp(-11.5,-9,cel)];
 const F=key(t,mono([[0,2100],[q.l,2000],[q.o,1800],[q.f+.3,1650],[q.n+.6,2500],[q.end,2900]]))*LENS;return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.f+.35;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.2+1.1*sm(0,.5,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // the tight angle: a paper wedge on the grass from the ball to the two posts — a thin slice of goal to aim at
  const wed=sm(q.a,q.a+.5,tt)*(1-sm(q.o,q.f,tt));if(wed>.02){const wp=new Path2D();addPoly(wp,clipPoly(c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,3.66],[0,.03,-3.66]]));s.knockout(wp,.5*wed);s.fill(Y,wp,.35*wed);
   const ed=new Path2D();line3(ed,c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,-3.66]]);line3(ed,c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,3.66]]);s.stroke(Y,ed,9,.95*wed);}
  const w=drawWorld(s,c,tau,tp,{ballMin:24,hero:true});
  // the loop, drawn as dotted ink behind the ball while it flies
  if(tp>TV&&tp<T_GOAL+.4){const dots=new Path2D();for(let i=0;i<=16;i++){const p=P(c,ballAt(TV+(Math.min(tp,T_GOAL)-TV)*i/16));dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);}s.fill(K,dots,.6);}
  if(tp>=T_GOAL&&tp<T_GOAL+.35){const p=P(c,SHOT_TO);sparkBurst(s,Y,p[0],p[1],160+140*sm(T_GOAL,T_GOAL+.12,tp,easeOut),{n:12,seed:54,g:1-sm(T_GOAL+.15,T_GOAL+.35,tp),width:15});}
  void w;
 },
 aperture(t){const c=ch3Cam(t),p=ballAt(tau3(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5.5,
};

// ================= chapter 4 (lesson): eyes on the ball → body over it → strike through it → the hard angle works =================
const ch4T=()=>({e:T(3,'Eyes on the ball'),b:T(3,'body over it'),s:T(3,'strike cleanly'),th:T(3,'through it'),w:T(3,'With perfect technique'),h:T(3,'even hard angles'),cw:T(3,'can work'),end:SEC(3)});
const PL4=duo(VB);
/** lesson volley phase u (0..1) keyed to the cues: drop in, hold over it, contact, follow through, then land */
const u4=(t:number,q:ReturnType<typeof ch4T>)=>key(t,mono([[0,.05],[q.e+.2,.2],[q.b+.2,.42],[q.s+.25,.5],[q.th+.3,.66],[q.w,.72],[q.h,.95],[q.end,1]]),x=>x);
/** lesson ball: along the real cross's last metres onto the boot, then (from "With perfect technique") the real shot into the far corner */
function ball4(t:number,q:ReturnType<typeof ch4T>):V3{const hit=q.s+.25,u=u4(t,q);
 if(t<hit){const tau=TV-(.5-u)*1.6;return ballAt(Math.min(TV,tau));}
 const f=t<q.w?.02*sm(hit,q.w,t):.02+.98*sm(q.w+.1,q.cw+.05,t,x=>x);return ballAt(TV+f*TS+(t>q.cw+.05?t-q.cw-.05:0));}
function ch4Cam(t:number,q:ReturnType<typeof ch4T>){
 const side=YV-24*D2R-Math.PI/2,near:V3=[PV[0]+Math.cos(side)*5.4,1.05,PV[1]-Math.sin(side)*5.4];
 const wide:V3=[-10.5,3.4,14.5];
 const pull=sm(q.w-.1,q.h+.3,t,easeInOutSine),pos=mix3(near,wide,pull);
 const look=mix3([PV[0],lerp(1.05,.8,sm(q.b,q.s,t)),PV[1]],[-2.8,.9,3.2],pull);
 const F=lerp(key(t,mono([[0,1500],[q.e,1650],[q.b,1850],[q.s,1800],[q.th,1650]])),1650,pull)*LENS;return cam(pos,look,F);}
const ch4:Scene={
 draw(s,t){const q=ch4T(),tt=twos(t);frame(s);const c=ch4Cam(t,q);
  // the stage: a navy print, the grass as a halftone plane, a warm pool under the player, the goal and its lines in paper
  s.field(K,.78,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-40],[12,0,-40],[12,0,40],[-60,0,40]]));s.tone(Y,floor,.3);s.tone(B,floor,.2);
  const ring=(r:number)=>{const pts:V3[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([PV[0]+Math.cos(a)*r,.01,PV[1]+Math.sin(a)*r]);}const pa=new Path2D();addPoly(pa,clipPoly(c,pts));return pa;};
  s.tone(O,ring(3.2),.2);s.tone(O,ring(1.6),.3);
  const lines=new Path2D();groundLine(lines,c,[0,-12],[0,16],.14);groundLine(lines,c,[0,9.16],[-5.5,9.16],.14);groundLine(lines,c,[-5.5,9.16],[-5.5,-9.16],.14);groundLine(lines,c,[0,-9.16],[-5.5,-9.16],.14);s.knockout(lines,.9);
  const hit=q.s+.25,goalIn=t-(q.cw+.05);
  // "even hard angles": the thin wedge from the ball to the posts
  const wed=sm(q.h-.2,q.h+.4,tt);if(wed>.02){const wp=new Path2D();addPoly(wp,clipPoly(c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,3.66],[0,.03,-3.66]]));s.fill(Y,wp,.4*wed);const ed=new Path2D();line3(ed,c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,-3.66]]);line3(ed,c,[[V_AIM[0],.03,V_AIM[1]],[0,.03,3.66]]);s.stroke(Y,ed,9,.95*wed);}
  goal(s,c,goalIn>0?netRipple(goalIn,NET_HIT):undefined);
  const u=u4(tt,q),pose=VOL(u),prev=VOL(u4(tt-1/12,q)),place:Place={x:PV[0],z:PV[1],yaw:YV};
  const res=drawPlayer(s,pose,c,PL4,place,{prev:{pose:prev,place},smear:tt>q.b+.3&&tt<q.th+.5});
  const b=ball4(tt,q),bp=P(c,b),r=Math.max(24,BALL_R*kAt(c,b));
  // 1 eyes: dotted sight line face → ball
  const eye=sm(q.e,q.e+.4,tt)*(1-sm(q.w-.2,q.w+.2,tt));if(eye>.02){const h=res.joints.face??res.joints.head,dots=new Path2D();for(let i=1;i<12;i++){const k=i/12,x=lerp(h[0],bp[0],k),y=lerp(h[1],bp[1],k);dots.moveTo(x+7,y);dots.arc(x,y,7,0,TAU);}s.fill(Y,dots,.95*eye);}
  // 2 body over it: a plumb line from the head down over the standing knee and the ball
  const plumb=sm(q.b,q.b+.35,tt,easeOutBack)*(1-sm(q.w-.2,q.w+.2,tt));if(plumb>.02){const h=res.joints.head,kn=res.joints.lKn,top:Pt=[h[0],h[1]-60],bot:Pt=[h[0],lerp(h[1],kn[1]+(kn[1]-h[1])*.35,plumb)];s.fill(Y,ribbon([top,bot],12,{taper:.1,wobble:1,gaps:[[.3,.36],[.62,.68]]}),.95);s.fill(Y,polyPath(Array.from({length:12},(_,i)=>[bot[0]+Math.cos(i/12*TAU)*14,bot[1]+Math.sin(i/12*TAU)*14] as Pt),true),.95);}
  // 3 strike cleanly through it: the boot's path as a swoosh ribbon through the ball and on
  if(tt>=hit-.3&&tt<q.w+.3){const pts:Pt[]=[];const u0=Math.max(.36,u-.2);for(let i=0;i<=10;i++){const sk=solve(VOL(lerp(u0,u,i/10)),VBB,place);pts.push(P(c,sk.rToe));}const fade=1-sm(q.w,q.w+.3,tt);s.fill(Y,ribbon(pts,22,{taper:.5,pressure:.4,wobble:1}),.9*fade);}
  if(tt>=hit&&tt<hit+.35)sparkBurst(s,Y,bp[0],bp[1],120+120*sm(hit,hit+.1,tt,easeOut),{n:10,seed:12,g:1-sm(hit+.15,hit+.35,tt),width:13});
  // the ball's loop once it goes: dotted trail
  if(tt>q.w+.1){const dots=new Path2D();const f1=clamp((b[0]-V_HIT[0])/(SHOT_TO[0]-V_HIT[0]));for(let i=0;i<=14;i++){const p=P(c,ballAt(TV+TS*f1*i/14));dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);}s.fill(Y,dots,.8);}
  if(goalIn>0&&goalIn<.5){const p=P(c,SHOT_TO);sparkBurst(s,Y,p[0],p[1],150+120*sm(0,.12,goalIn,easeOut),{n:12,seed:7,g:1-sm(.15,.5,goalIn),width:14});}
  ballShadow(s,c,b);tangoBall(s,bp[0],bp[1],r,tt<hit?tt*3:hit*3+(tt-hit)*9,{duo:false});
 },
 still:6,
};

const story:RisoStory={
 id:'van-basten-1988',format:'11v11',title:"Van Basten's Euro 88 volley",
 theme:'Eyes on the ball, body over it, strike cleanly through it.',
 ageNote:'Euro 1988 final, Soviet Union 0–2 Netherlands, Olympiastadion, Munich, 25 June 1988 (54th minute).',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an orange scarf-swirl ring and the Tango hops from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(O,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);sparkBurst(s,Y,x+Math.cos(a)*6,y-up,140*g,{n:9,seed,g:fl,width:12});}
  tangoBall(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
void APEX;void lerp;
export default story;
