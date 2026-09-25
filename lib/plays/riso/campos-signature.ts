/** Iconic play film (signature move): Jorge Campos, the rushing sweeper-keeper — "Here's how he played" — shown in a real match he played:
 * Mexico 1–1 Bulgaria (after extra time; Bulgaria won 3–1 on penalties), 1994 FIFA World Cup round of 16, Giants Stadium, East Rutherford
 * (New Jersey), 5 July 1994, 16:30 local. A RisoStory (chapters mode) played unchanged by the card window and StoryFilmPlayer.
 * Narration text: public/plays/narration/campos-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/campos-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/campos-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MATCH / HONESTY: lib/town/iconicPlays.json gives Campos a signature ("the rushing sweeper-keeper"; lesson: "Even if you're not the
 * tallest, quick feet and bravery help you win the ball first"), not one match moment. With the research budget allowed (no web search left
 * this session, ≤ 8 slow page fetches) no written source describing ONE specific Campos rush — minute, opponent, outcome — could be found.
 * So, following the brief's fallback, the film recreates the SIGNATURE (the sources describe it) inside a real match he played, and the
 * narration says so plainly ("Here's how he played"). It never claims this particular rush happened at a given minute, names no scoreline for
 * the moment and names no Bulgarian player in it: the long-ball kicker and the chasing striker are unnamed and unnumbered.
 *
 * SOURCES (cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "Jorge Campos" (raw wikitext): "known for his constant play outside the penalty area – often functioning as a sweeper-keeper,
 *    as well as his acrobatic, risky, and flamboyant style of goalkeeping, and his colourful playing attire. His main strengths as a
 *    goalkeeper were his leaping ability, athleticism, and speed when rushing off his line ... which enabled him to overcome his short
 *    stature"; height 1.68 m (worldfootball.net); "His trademark, self-designed bright kits"; started for Mexico at the 1994 World Cup;
 *    also played as a striker (38 career goals).
 *  - Wikipedia (es), "Jorge Campos (futbolista)": the same style ("velocidad al salir corriendo de su línea ... superar su baja estatura").
 *  - Wikipedia, "1994 FIFA World Cup knockout stage" (raw, cached as wiki-1994-wc-knockout.txt): Mexico v Bulgaria, 5 July 1994, 4:30 p.m.
 *    EDT, Giants Stadium, East Rutherford, 71,030; 1–1 a.e.t. (Stoichkov 6', García Aspe 18' pen.), Bulgaria 3–1 on penalties; line-ups
 *    and numbers (Campos 1, Rodríguez 20, Suárez 2, Juan Ramírez 3, Ramón Ramírez 5, Bernal 6, Ambriz 4, García Aspe 8, Galindo 17,
 *    Luis García 10, Alves 11; Bulgaria: Mihaylov 1, Kremenliev 2, Hubchev 5, Yordanov 13, Kiryakov 16, Letchkov 9, Borimirov 11,
 *    Balakov 20, Sirakov 10, Kostadinov 7, Stoichkov 8); the kit templates worn that day: Mexico GREEN shirts, WHITE shorts, RED socks;
 *    Bulgaria WHITE shirts, GREEN shorts, WHITE socks.
 *  - FIFA.com match archive (Wayback, cached fifa-archive-mex-bul-1994): the same line-ups, cautions, the two red cards (Kremenliev 50',
 *    Luis García 57'), Campos saving Balakov's penalty in the shoot-out.
 *  - Wikipedia (es), "México en la Copa Mundial de Fútbol de 1994": Mexico won Group E, went out to Bulgaria on penalties.
 * CONFIRMED: the match, date, stadium, kick-off time and crowd; Mexico green / white / red and Bulgaria white / green / white; Campos No. 1,
 *  1.68 m, short for a keeper; his sweeper-keeper style — speed rushing off his line, playing outside his area, brave and acrobatic;
 *  his bright self-designed kits.
 * INFERRED / ILLUSTRATIVE (the whole moment is an illustration of his signature, not a specific documented play): the long ball, the
 *  bounce, the slide and the clearance; every position, speed and time; which foot he slid with (the right) and which way the ball went;
 *  where Mexico's line stood; the unnamed kicker and striker; which end Mexico defended and where the main camera sat; the colours of
 *  Campos's kit THAT day (his 1994 World Cup kits were loud multi-coloured designs; drawn here as fluorescent yellow with red flashes, navy
 *  shorts, yellow socks, green gloves — the exact design worn v Bulgaria is not verified and is not named in the narration); Campos's hair
 *  (short, dark); the 1994 Adidas Questra ball drawn as a white ball with navy triad arcs; Giants Stadium drawn as an open two-tier concrete
 *  bowl with no roof on a hazy summer afternoon, a mostly green-shirted crowd; the referee is left out of frame.
 *
 * STRUCTURE (never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 the long ball is kicked): ch1 = the live
 * broadcast from the high main-stand camera in real time (the bowl, the teams, Campos close up, the long ball, his sprint, the slide);
 * ch2 = the TV slow-motion replay low behind Campos (he reads it as it is kicked, off his line in a flash); ch3 = the replay low from the
 * side at the meeting point (outside the box: no hands; he slides in bravely, clears it a split second before the striker, who hurdles
 * him); ch4 = a duotone lesson (not the tallest: quick feet and bravery win the ball first). The contact point is read from the solved
 * skeleton (Campos's right toe mid-slide) and the ball's last hop is aimed at it. Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe), a lens that widens for a square window. Inks: yellow (sun
 * haze, grass under green, Campos's shirt, cue marks), red (Mexico's socks, Campos's flashes, Bulgaria's cue rings), green (Mexico, the
 * grass, Bulgaria's shorts), navy (key line, shade, concrete). Scenes read only their local t; drawn objects pose on twos, cameras on ones;
 * randomness is seeded. Budget ≈ 150–300 plate ops per frame; wide-shot figures print 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,keyPoses,posed,runCycle,stand,strike,keeperSet,slideTackle,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',RD='red',Y='yellow',G='green';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/(\.\.\.|[,;:])$/.test(w)?.2:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`campos film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py campos-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/campos-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Giants Stadium',"World Cup 1994, Mexico against Bulgaria. Jorge Campos, in a bright kit he designed himself, was small for a keeper. Here's how he played: Bulgaria go long, Campos sprints off his line to win it first!",
  ['World Cup','Mexico','Bulgaria','Jorge Campos','bright kit','small for a keeper','how he played','go long','sprints','off his line','win it first']),
 prov('Off his line',"Watch again, slowly. He reads the long ball as it's kicked, and he's off his line in a flash.",
  ['Watch again','slowly','reads','long ball','kicked','off his line','flash']),
 prov('Brave and quick',"Outside his box he can't use his hands, so he slides in bravely and clears it, a split second before the striker.",
  ['Outside his box','use his hands','slides in','bravely','clears it','a split second','before the striker']),
 prov('Win it first','Not the tallest? Quick feet and bravery help you win the ball first.',
  ['Not the tallest','Quick feet','bravery','win the ball','first']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`campos film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Mexico's goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
/** a camera from position, look point and focal length F (sheet units; widened by LENS for a square window) */
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/(F*LENS))/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a red mark (Bulgaria's cue colour) knocked through the grass */
function rInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(RD,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a ring on the grass round a ground point, into a path */
function gRing(path:Path2D,c:Camera,x:number,z:number,r:number,w:number){const g=groundRing(c,x,z,r,26);if(g.length>2)path.addPath(ribbon(g,Math.max(4,w*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}
/** a projected 3D polyline (points behind the lens dropped) */
function proj(c:Camera,pts:V3[]):Pt[]{const o:Pt[]=[];for(const p of pts)if(depthOf(c,p)>NEAR+.2)o.push(P(c,p));return o;}
const dashes=(step:number,on:number,from=.03):[number,number][]=>{const g:[number,number][]=[];for(let x=from;x<1;x+=step)g.push([x,x+on]);return g;};

// ================= Giants Stadium from inside: an open two-tier concrete bowl, no roof, a hazy July afternoon, a full house =================
const CX=-52.5;// the centre spot
function ringPt(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),.45),y,b*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
type Lv=[number,number,number];// a, b, y
const BOWL:Lv[]=[[64,44,1.2],[80,60,14],[82,62,18],[99,78,36],[100,79,39.5]];
const NSEG=44;
const lvAt=(l:Lv,th:number)=>ringPt(l[0],l[1],l[2],th);
const band=(l0:Lv,l1:Lv,t0:number,t1:number,v0=0,v1=1):V3[]=>{const m=(t:number,v:number)=>mix3(lvAt(l0,t),lvAt(l1,t),v);return[m(t0,v0),m(t1,v0),m(t1,v1),m(t0,v1)];};
/** crowd: [tier, u round the bowl, v up the tier, ink 0 paper / 1 red / 2 green (Mexico's fans) / 3 navy, phase] */
const CROWD=(()=>{const r=rng(1994),o:[number,number,number,number,number][]=[];for(let i=0;i<1400;i++){const tier=r()<.55?0:1,c=r();o.push([tier,r(),.05+r()*.9,c<.26?0:c<.44?1:c<.8?2:3,r()*TAU]);}return o;})();
type Crowd={cheer?:number;flash?:number;t:number;goals?:number};
function stadium(s:Sheet,c:Camera,o:Crowd,drawIn:()=>void=()=>{}){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,ey=c.eye;
 // a hazy summer afternoon over New Jersey: a light yellow sun screen over the paper, a pale navy haze high up
 s.field(Y,.16,.5);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,hz-700],[-Bnd,hz-600]],true),.14);
 // stands: grey concrete (a navy screen), rows stepped; the mezzanine fascia between the tiers and the top rim darker
 const stands=new Path2D(),rows=new Path2D(),fascia=new Path2D();
 for(let i=0;i<NSEG;i++){const t0=i/NSEG*TAU,t1=(i+1)/NSEG*TAU;
  for(const [l0,l1,isF] of [[0,1,false],[1,2,true],[2,3,false],[3,4,true]] as [number,number,boolean][]){const mid=mix3(lvAt(BOWL[l0],(t0+t1)/2),lvAt(BOWL[l1],(t0+t1)/2),.5),n:V3=[-(mid[0]-CX)/(BOWL[l1][0]**2),1/40,-mid[2]/(BOWL[l1][1]**2)];
   if(dot(n,sub(ey,mid))<=0&&!isF)continue;
   addPoly(isF?fascia:stands,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1)));
   if(!isF)for(let k=0;k<8;k+=2)addPoly(rows,clipPoly(c,band(BOWL[l0],BOWL[l1],t0,t1,k/8,(k+1)/8)));}}
 s.knockout(stands);s.tone(K,stands,.34);s.tone(K,rows,.16);s.knockout(fascia);s.tone(K,fascia,.72);
 // crowd: Mexico's green shirts, white, red, navy — bobbing on the twos when they rise
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[tier,u,v,col,ph] of CROWD){const th=u*TAU,p=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),v);p[1]+=.35+(cheer>0?cheer*.9*Math.abs(Math.sin(ph+tt*9)):0);
  if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,3.5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(RD,heads[1],.9);if(seen[2]){s.knockout(heads[2],.9);s.fill(G,heads[2],.85);}if(seen[3])s.fill(K,heads[3],.85);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(26*flash);i++){const tier=r()<.5?0:1,th=r()*TAU,q=mix3(lvAt(BOWL[tier*2],th),lvAt(BOWL[tier*2+1],th),.1+r()*.8);if(depthOf(c,q)<3)continue;const[x,y]=P(c,q),sz=clamp(.9*kAt(c,q),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // grass: yellow × green, mowing stripes, paper lines (both boxes, the halfway line and circle)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-111,0,-39],[6,0,-39],[6,0,39],[-111,0,39]]));s.knockout(gp);yInk(s,gp,.8);s.tone(G,gp,.64);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(G,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 for(const [g,d] of [[0,-1],[-105,1]] as [number,number][]){Ln([g,-20.16],[g+d*16.5,-20.16]);Ln([g+d*16.5,-20.16],[g+d*16.5,20.16]);Ln([g+d*16.5,20.16],[g,20.16]);
  Ln([g,-9.16],[g+d*5.5,-9.16]);Ln([g+d*5.5,-9.16],[g+d*5.5,9.16]);Ln([g+d*5.5,9.16],[g,9.16]);
  let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=(d<0?Math.PI:0)-.927+i/10*1.854,pt:[number,number]=[g+d*11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=20;i++){const a=i/20*TAU,pt:[number,number]=[CX+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 goal(s,c,0,1);goal(s,c,-105,-1,true);
 if((o.goals??0)>.02){const p=new Path2D();for(const g of [0,-105]){const q=P(c,[g,1.2,0]);if(depthOf(c,[g,1.2,0])<NEAR+1)continue;const k=kAt(c,[g,1.2,0]),r=Math.max(14,4.2*k*o.goals!);p.addPath(ribbon(Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r,q[1]+Math.sin(i/24*TAU)*r*.7] as Pt),Math.max(5,.35*k),{close:true,taper:0,wobble:.6}));}yInk(s,p,.95);}
 drawIn();
}
/** a goal at x = gx whose net runs toward d (+1 = +x): posts, bar, a box net held by stanchions (the far goal frame only) */
function goal(s:Sheet,c:Camera,gx:number,d:number,far=false){
 const W=3.66,H=2.44,Dp=2*d,vol=new Path2D(),mesh=new Path2D();
 if(!far){const back=(u:number,v:number):V3=>[gx+Dp,lerp(H,0,v),lerp(-W,W,u)],top=(u:number,v:number):V3=>[gx+lerp(0,Dp,v),H,lerp(-W,W,u)],side=(z:number)=>(u:number,v:number):V3=>[gx+lerp(0,Dp,u),lerp(H,0,v),z];
  const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
   for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
   for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
  grid(back,14,5);grid(top,14,3);grid(side(-W),3,5);grid(side(W),3,5);
  s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[gx,1,0]),2,9),.75);}
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([gx,0,-W],[gx,H+.06,-W]);bar([gx,0,W],[gx,H+.06,W]);bar([gx,H,-W-.06],[gx,H,W+.06]);
 if(!far){bar([gx+Dp,0,-W],[gx+Dp,H,-W],.06);bar([gx+Dp,0,W],[gx+Dp,H,W],.06);bar([gx,H,-W],[gx+Dp,H,-W],.05);bar([gx,H,W],[gx+Dp,H,W],.05);}
 s.fill(K,edge,.9);s.knockout(frameP);
}

// ================= the ball: the 1994 Adidas Questra — white, navy triad arcs turning with the spin, a navy rim =================
const BALL_R=.11;
function questra(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const arcs=new Path2D();
 for(let k=0;k<3;k++){const a=spin+k*TAU/3,m=Math.cos(spin*.6),cx=Math.cos(a)*r*.55,cy=Math.sin(a)*r*.55*m;
  arcs.addPath(ribbon(Array.from({length:7},(_,i)=>{const q=a+Math.PI*.6+i/6*Math.PI*.8;return[cx+Math.cos(q)*r*.34,cy+Math.sin(q)*r*.34*m] as Pt;}),Math.max(2,r*.16),{taper:.5,wobble:0}));}
 s.fill(K,arcs,.9);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.15,.55));}

// ================= kits (5 July 1994) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.4],[RD,.16]],SKIN_M:AthleteStyle['skin']=[[Y,.45],[RD,.28],[K,.18]],SKIN_D:AthleteStyle['skin']=[[RD,.4],[Y,.45],[K,.34]];
/** Mexico: green shirts, white shorts, red socks (confirmed kit that day); red trim, white numbers */
const MEX=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[G,.88],shorts:'paper',socks:[RD,.9],trim:RD,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:'paper',seed:n,...o});
/** Bulgaria: white shirts, green shorts, white socks (confirmed kit that day); navy numbers */
const BUL=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[G,.75],socks:'paper',trim:[G,.9],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:40+(n??0),...o});
/** Jorge Campos: No. 1, 1.68 m. His loud self-designed kit drawn as fluorescent yellow with red flashes, navy shorts, yellow socks, green
 * gloves (INFERRED: the exact design worn v Bulgaria is not verified) */
const CAMPOS:AthleteStyle={shirt:Y,pattern:'stripes',patternInk:[RD,.85],shorts:[K,.75],socks:Y,trim:G,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',gloves:[G,.9],line:K,shade:[K,.3],sleeves:'short',number:1,numberInk:K,build:{height:1.68,bulk:.97},seed:1};
/** the chasing Bulgarian striker: unnamed, no number (the moment is an illustration, not a documented play) */
const STRIKER:AthleteStyle=BUL(null,{hair:K,build:{height:1.8,bulk:1},seed:77});
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[Y,.95]:[K,.35],pattern:lead?'stripes':undefined,patternInk:lead?[K,.5]:undefined,shorts:lead?[K,.6]:[K,.2],socks:lead?[Y,.9]:[K,.35],trim:lead?K:K,boots:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:K,shade:[K,.2],numberInk:K,gloves:st.gloves?[K,.7]:undefined});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the long ball is kicked) =================
const CB:Build=CAMPOS.build!,AB:Build=STRIKER.build!;
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** idle: a standing body that breathes and looks around (never a frozen hold) */
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** where a player stands so his toe (foot 'l' or 'r') meets a ground ball at `ball` when striking facing `yaw` (read from the solved skeleton) */
function footSpot(ball:[number,number],yaw:number,pose:Pose,build:Build,foot:'l'|'r'):[number,number]{const sk=solve(pose,build,{yaw}),t=foot==='l'?sk.lToe:sk.rToe;return[ball[0]-t[0],ball[1]-t[2]];}

// ---- Campos: set high, well off his line; reads the kick, sprints out of his box, slides in feet first (right foot), clears it, gets up ----
const TB=2.7;// the long ball's flight time to its bounce
const TH=TB+.75;// Campos's boot meets the ball on its last low hop
const SDUR=.95,SC=.45,JUMP0=TH-SC*SDUR;// the slide window; contact at SC
const SP:[number,number]=[-19.2,-12.4];// where the slide starts (the sprint's end)
const CAM_P:MKey[]=[[-4,-9.4,-1.8],[.2,-9.6,-2],[.38,-9.9,-2.3],[1.1,-11.9,-4.5],[JUMP0,SP[0],SP[1]]];
const AY=YAW(SP[0]-CAM_P[3][1],SP[1]-CAM_P[3][2]);// his sprint's heading
/** the contact: Campos's right toe mid-slide, read from the solved skeleton, and the ball just in front of it */
const HIT:V3=(()=>{const sk=solve(slideTackle(SC,{foot:'r'}),CB,{x:SP[0],z:SP[1],yaw:AY}),[fx,fz]=dirOf(AY);return[sk.rToe[0]+fx*.14,.11,sk.rToe[2]+fz*.14];})();
const CAM_SIT=slideTackle(1,{foot:'r'});
function camposAt(tau:number):{pose:Pose;place:Place}{
 if(tau<JUMP0){const b=ballAt(tau),r=runner(CAM_P,tau,b,1,keeperSet(tau*1.4));
  if(tau<.55){const u=sm(-.1,.5,tau);r.pose=blendPose(keeperSet(tau*1.4),r.pose,u);}
  if(tau>JUMP0-.3){const u=sm(JUMP0-.3,JUMP0,tau);r.pose=blendPose(r.pose,slideTackle(0,{foot:'r'}),u);}
  return r;}
 const t=(tau-JUMP0)/SDUR,place:Place={x:SP[0],z:SP[1],yaw:AY};
 if(t<=1)return{pose:slideTackle(t,{foot:'r'}),place};
 // sat on the grass after the slide, then up on his feet, turning to watch the ball go out
 const up=sm(TH+1.6,TH+2.5,tau),p=blendPose(CAM_SIT,{...stand(),dx:2.3},up);p.neckY+=.3*Math.sin(tau*.9)*(1-up);p.lean+=.04*Math.sin(tau*2.1);
 return{pose:p,place:{...place,yaw:lerpAng(AY,YAW(-.4,-1),up)}};
}
// ---- the long ball: a Bulgarian (unnamed) hits it out of defence over Mexico's line; one bounce, then a low hop into Campos's slide ----
const K0:[number,number]=[-80,-5.5];// the kicker's ball
const B1:V3=[lerp(K0[0],HIT[0],.84),.11,lerp(K0[1],HIT[2],.84)];// the bounce, ≈ 9 m in front of the meeting point
const YK=YAW(B1[0]-K0[0],B1[2]-K0[1]);
const KFP=footSpot(K0,YK,strike(STRIKE_CONTACT,{power:1}),{height:1.8},'r');
const [kfx,kfz]=dirOf(YK);
// ---- the striker: level with Mexico's line, chases, arrives a split second late and hurdles Campos's slide, stumbles, recovers ----
const S0=TH-.2,SDUR2=1;
const ATT_P:MKey[]=[[-4,-47,-8.6],[0,-45.6,-9],[.5,-44.6,-9.4],[1.6,-37.4,-11],[2.7,-28.2,-12.8],[S0,HIT[0]-2.2,HIT[2]+.7]];
const SY=YAW(ATT_P[5][1]-ATT_P[4][1],ATT_P[5][2]-ATT_P[4][2]);
const ATT_RUN0=runner(ATT_P,S0-1e-3,[0,0,0],2).pose;
function strikerHurdle(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,ATT_RUN0],
  [.3,posed({dx:.8,air:.34,lHipF:70,lKnee:88,rHipF:-14,rKnee:74,rAnk:30,lShA:60,rShA:56,lShF:30,rShF:-20,lElb:40,rElb:44,lean:10,neckP:-24})],
  [.58,posed({dx:1.9,air:.06,roll:-10,pitch:14,lean:24,twist:16,lHipF:26,lKnee:50,rHipF:56,rKnee:72,lShA:56,rShA:48,lShF:10,rShF:14,lElb:70,rElb:80,lHand:1,rHand:1,neckP:10,neckY:22})],
  [1,posed({dx:2.5,lHipF:58,rHipF:30,lKnee:96,rKnee:70,lAnk:20,rAnk:20,lean:34,pitch:10,lShF:40,rShF:30,lShA:30,rShA:32,lElb:40,rElb:44,lHand:1,rHand:1,neckP:-4,neckY:40})],
 ];
 const p=keyPoses(clamp(t),keys);p.squash=clamp(.05*sm(.1,.3,t)*(1-sm(.3,.5,t))-.07*sm(.55,.65,t)*(1-sm(.65,.85,t)),-.3,.3);return p;
}
const ATT_END=strikerHurdle(1);
function strikerAt(tau:number):{pose:Pose;place:Place}{
 if(tau<S0)return runner(ATT_P,tau,ballAt(tau),2);
 const t=(tau-S0)/SDUR2,place:Place={x:ATT_P[5][1],z:ATT_P[5][2],yaw:SY};
 if(t<=1)return{pose:strikerHurdle(t),place};
 const up=sm(TH+1.5,TH+2.3,tau),p=blendPose(ATT_END,{...stand(),dx:2.5},up);p.lean+=.04*Math.sin(tau*2.3);return{pose:p,place:{...place,yaw:lerpAng(SY,YAW(-.3,-1),up)}};
}
// ---- the ball ----
const KICK_IN:V3=[-88,.11,-2];
const VY0=4.905*TB,DT1=TH-TB,VY1=(HIT[1]-.11+4.905*DT1*DT1)/DT1;
const [afx,afz]=dirOf(AY);
const OUT1:V3=[HIT[0]+afx*4-2.5,.11,HIT[2]+afz*4-6.5],T_O1=TH+.7,VY2=(OUT1[1]-HIT[1]+4.905*.7*.7)/.7;
const OUT2:V3=[OUT1[0]-3,.11,-36.6],T_O2=T_O1+.75,VY3=4.905*.75*.55;
const OUT3:V3=[OUT2[0]-1,.11,-38.8];
/** the moment the ball crosses the touchline (z = −34): cleared */
const T_LINE=T_O1+.75*((-34-OUT1[2])/(OUT2[2]-OUT1[2]));
function ballAt(tau:number):V3{
 if(tau<-.4){const u=easeOut(clamp((tau+3)/2.4));return mix3(KICK_IN,[K0[0],.11,K0[1]],u);}
 if(tau<0)return[K0[0],.11,K0[1]];
 if(tau<TB){const u=tau/TB,p=mix3([K0[0],.11,K0[1]],B1,u);p[1]=.11+VY0*tau-4.905*tau*tau;return p;}
 if(tau<TH){const e=tau-TB,p=mix3(B1,HIT,e/DT1);p[1]=.11+VY1*e-4.905*e*e;return p;}
 if(tau<T_O1){const e=tau-TH,p=mix3(HIT,OUT1,e/.7);p[1]=Math.max(.11,HIT[1]+VY2*e-4.905*e*e);return p;}
 if(tau<T_O2){const e=tau-T_O1,p=mix3(OUT1,OUT2,e/.75);p[1]=.11+VY3*e-4.905*e*e*.55;return p;}
 return mix3(OUT2,OUT3,easeOut(clamp((tau-T_O2)/1.2)));}

// ---- everybody else (Mexico's back line pushed up high, midfield; Bulgaria's midfield) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
const KICKER=BUL(null,{hair:[K,.8],build:{height:1.84},seed:66});
const RODRIGUEZ=MEX(20,{build:{height:1.75}}),SUAREZ=MEX(2,{build:{height:1.8}}),JRAMIREZ=MEX(3,{build:{height:1.78}}),RRAMIREZ=MEX(5,{build:{height:1.74}});
const ACTORS:Actor[]=[
 {style:KICKER,at:(t,b)=>{const p:MKey[]=[[-4,KFP[0]-3,KFP[1]+2.4],[-.62,KFP[0]-kfx*1.1,KFP[1]-kfz*1.1],[.5,KFP[0]+kfx*.5,KFP[1]+kfz*.5],[4,KFP[0]+kfx*4,KFP[1]+kfz*2],[9,KFP[0]+kfx*9,KFP[1]+kfz*3]],r=runner(p,t,b,3);
  if(t<-.62)r.place.yaw=YAW(b[0]-r.place.x!,b[2]-r.place.z!);
  if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2),w=Math.sin(clamp((t+.7)/1.4)*Math.PI);r.pose=blendPose(r.pose,strike(u,{power:1}),w);r.place.yaw=lerpAng(r.place.yaw??0,YK,w);}return r;}},// a Bulgarian (unnamed)
 mover(RODRIGUEZ,[[-4,-46,-22],[0,-44.5,-21.5],[1,-43,-21],[TB,-36,-20.5],[TH+1.2,-29,-22.5],[TH+3,-26.5,-24]],4),// Jorge Rodríguez, right-back
 mover(SUAREZ,[[-4,-45.5,-6],[0,-44,-6.4],[.7,-43.2,-7.4],[TB,-35.5,-10.5],[TH+1,-29.5,-13.6],[TH+3,-27.6,-14.4]],5),// Claudio Suárez
 mover(JRAMIREZ,[[-4,-46,4],[0,-44.4,3.6],[1,-43.6,2],[TB,-38,-3],[TH+1.4,-32.5,-7]],6),// Juan de Dios Ramírez
 mover(RRAMIREZ,[[-4,-46.5,19],[0,-45,17.6],[1.2,-44,16],[TH+1.4,-38,10]],7),// Ramón Ramírez, left-back
 mover(MEX(4,{build:{height:1.76}}),[[-4,-55,-3],[0,-53.5,-2.6],[TH,-47,-7],[TH+3,-43,-9]],8),// Ignacio Ambriz
 mover(MEX(8,{skin:SKIN_L,build:{height:1.77}}),[[-4,-60,9],[0,-58.6,8],[TH+2,-52,3]],9),// Alberto García Aspe
 mover(MEX(6,{build:{height:1.73}}),[[-4,-63,-13],[0,-62,-13],[TH+2,-55,-15]],10),// Marcelino Bernal
 mover(MEX(17,{build:{height:1.74}}),[[-4,-66,20],[0,-65,19],[TH+2,-59,14]],11),// Benjamín Galindo
 mover(BUL(9,{hair:[K,.5],hairStyle:'balding',build:{height:1.8}}),[[-4,-52,5],[0,-50.5,4.4],[TB,-44,0],[TH+2,-39,-4]],12),// Yordan Letchkov
 mover(BUL(11,{build:{height:1.78}}),[[-4,-57,17],[0,-55.5,15.5],[TB,-49,11],[TH+2,-44,8]],14),// Daniel Borimirov
 mover(BUL(20,{build:{height:1.76}}),[[-4,-66,-6],[0,-65,-6],[TH+2,-58,-9]],15),// Krasimir Balakov
 mover(BUL(10,{build:{height:1.8}}),[[-4,-71,6],[0,-70,6],[TH+2,-64,2]],16),// Nasko Sirakov
];
type Item={depth:number;draw:()=>void};
const HEROES=new Set<AthleteStyle>([CAMPOS,STRIKER]);
/** everyone and the ball at τ, depth sorted. `hero` smears Campos and the striker; `prev` gives every figure its secondary motion;
 * `cap` limits figure detail (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prev?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s),dt=1/12,bpp=ballAt(tp-dt);
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const hero=HEROES.has(style),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(hero?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&!hero&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&!hero&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:detail==='low'?undefined:prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach(a=>put(a.style,a.at(tp,bp),o.prev?a.at(tp-dt,bpp):undefined));
 const cmp=camposAt(tp),att=strikerAt(tp);
 put(CAMPOS,cmp,camposAt(tp-dt),!!o.hero);put(STRIKER,att,strikerAt(tp-dt),!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  questra(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,cmp,att};}
/** the long ball's flight as 3D points (τ from a to b) */
const flight=(a:number,b:number,n=24):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(a+(b-a)*i/n));
/** Mexico's 18-yard box as a path of ground ribbons */
function boxPath(c:Camera,w=.3){const p=new Path2D();groundLine(p,c,[0,-20.16],[-16.5,-20.16],w);groundLine(p,c,[-16.5,-20.16],[-16.5,20.16],w);groundLine(p,c,[-16.5,20.16],[0,20.16],w);return p;}
/** a height ruler beside a standing figure: a yellow bar from the grass to `h` metres, with a tick at the top */
function ruler(s:Sheet,c:Camera,x:number,z:number,h:number,u:number,side:[number,number]){
 const g:V3=[x+side[0],0,z+side[1]],top:V3=[g[0],h*u,g[2]];if(depthOf(c,g)<NEAR+.5)return;const a=P(c,g),b=P(c,top),k=kAt(c,g),w=Math.max(4,.05*k),p=ribbon([a,b],w,{taper:0,wobble:.4});
 if(u>.95){const t0=P(c,[top[0]-side[0]*.5,top[1],top[2]-side[1]*.5]),t1=P(c,[top[0]+side[0]*.35,top[1],top[2]+side[1]*.35]);p.addPath(ribbon([t0,t1],w,{taper:0,wobble:.4}));}
 yInk(s,p,.95);}

// ================= chapter 1 (live): the high main-stand camera in real time =================
const ch1q=()=>({wc:T(0,'World Cup'),mx:T(0,'Mexico'),bu:T(0,'Bulgaria'),jc:T(0,'Jorge Campos'),bk:T(0,'bright kit'),sk:T(0,'small for a keeper'),hp:T(0,'how he played'),gl:T(0,'go long'),sp:T(0,'sprints'),ol:T(0,'off his line'),wf:T(0,'win it first'),end:SEC(0)});
/** the lead-in: τ = t − TL. The contact lands on "win it first" when the voice allows; the kick never leaves before "go long". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.wf-TH-.05,q.gl-.3,Math.max(q.gl-.3,Math.min(q.gl+1.8,q.end-TH-1.7)));return{TL,end:q.end};};
const BCAM:V3=[-42,19,50];
function ch1Pos(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-52.5,34,74],[q.wc+.6,-50,30,70],[q.mx,-47,24,62],[q.bu+.4,BCAM[0],BCAM[1],BCAM[2]]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
/** before the kick the director's camera follows the words: the bowl → Mexico's high line → Bulgaria → Campos close up → the space he guards → the kicker */
const C0=CAM_P[0];
function ch1Pre(t:number):V3{const q=ch1q(),{TL}=ch1T(),v=key(t,mono([[0,CX,12,0],[q.wc+.6,CX,1,0],[q.mx,-45,1,-3],[q.bu,-54,1,-2],[q.jc-.05,-50,1,-3],[q.jc+.6,C0[1],1,C0[2]],[q.hp,C0[1],1,C0[2]],[q.hp+.7,-26,1,-7],[TL-1.2,-66,2,-8]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau),n=camposAt(tau).place;
 if(tau<0)return[K0[0]+10,1,K0[1]-2];
 const u=sm(0,TB-.3,tau),play:V3=[lerp(lerp(K0[0]+10,b[0],.7),n.x??0,.55*u),Math.min(b[1],9)*.35+1,lerp(lerp(K0[1],b[2],.7),n.z??0,.55*u)*.9];
 return mix3(play,[HIT[0]-2,1,HIT[2]-6],sm(TH+.2,TH+1.6,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(Math.max(q.hp+.8,TL-1.6),Math.max(q.hp+1.4,TL-.4),t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,1000],[q.wc+.6,1300],[q.mx,2100],[q.bu,2200],[q.jc-.05,2300],[q.jc+.7,13000],[q.bk,15500],[q.sk+.4,15000],[q.hp,9000],[q.hp+.8,2300],[TL-1,2600],[TL+.6,2300],[TL+TB-.8,3600],[TL+TH-.3,5400],[TL+TH+1.4,4600],[q.end,4300]]),easeInOutSine);return cam(ch1Pos(t),look,F);}
/** team rings on "Mexico" / "Bulgaria"; Campos's ring on "Jorge Campos" */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rm=sm(q.mx,q.mx+.3,t,easeOutBack)*(1-sm(q.bu,q.bu+.5,t)),rb=sm(q.bu,q.bu+.3,t,easeOutBack)*(1-sm(q.jc,q.jc+.4,t)),rc=sm(q.jc,q.jc+.3,t,easeOutBack)*(1-sm(q.bk,q.bk+.4,t));
 if(rm<.02&&rb<.02&&rc<.02)return;const bp=ballAt(tp),pm=new Path2D(),pb=new Path2D();
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place,mex=a.style.shirt!=='paper';if(mex&&rm>.02)gRing(pm,c,p.x??0,p.z??0,.95*rm,.14);if(!mex&&rb>.02)gRing(pb,c,p.x??0,p.z??0,.95*rb,.14);});
 const sp=strikerAt(tp).place,np=camposAt(tp).place;
 if(rb>.02)gRing(pb,c,sp.x??0,sp.z??0,.95*rb,.14);
 if(rm>.02)gRing(pm,c,np.x??0,np.z??0,.95*rm,.14);if(rc>.02)gRing(pm,c,np.x??0,np.z??0,1.2*rc,.1);
 yInk(s,pm,.95);rInk(s,pb,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),tau=t-TL,tp=tt-TL,after=tau-TH;
  const shake=tau>=TH?5*settle(tau,TH,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  const goals=sm(q.wc,q.wc+.3,t,easeOutBack)*(1-sm(q.mx-.1,q.mx+.3,t));
  stadium(s,c,{t,goals,cheer:.12+.9*sm(0,.4,after)*(1-sm(1.2,2.4,after)),flash:.15+.3*sm(q.wc,q.wc+.3,t)*(1-sm(q.mx,q.mx+.5,t))+.9*sm(0,.4,after)},()=>{
   teamRings(s,c,tp,t);
   const cp=camposAt(tp).place;
   // "how he played": the space between Mexico's high line and his box — his to sweep — a yellow screen
   const hp=sm(q.hp+.4,q.hp+.9,tt,easeOut)*(1-sm(q.gl+.6,q.gl+1.2,tt));if(hp>.02){const zone=new Path2D();addPoly(zone,clipPoly(c,[[-16.5,0,-30],[lerp(-16.5,-42,hp),0,-30],[lerp(-16.5,-42,hp),0,30],[-16.5,0,30]]));s.knockout(zone,.3*hp);s.tone(Y,zone,.4*hp);}
   // "go long": the ball's flight over the top, dashed yellow, drawn out ahead of the ball
   const gl=sm(q.gl,q.gl+.6,tt,easeOut)*(1-sm(TL+TB,TL+TB+.5,tt));if(gl>.02){const pts=proj(c,flight(0,TB*gl));if(pts.length>1){const k=kAt(c,B1);yInk(s,ribbon(pts,Math.max(5,.16*k),{taper:.2,wobble:.6,gaps:dashes(.07,.035)}),.95);}}
   // "off his line": Mexico's box flashes yellow as he leaves it
   const ob=sm(q.ol,q.ol+.3,tt,easeOutBack)*(1-sm(q.ol+1.2,q.ol+1.8,tt));if(ob>.02)yInk(s,boxPath(c,.3*ob+.1),.95*ob);
   drawWorld(s,c,tau,tp,{ballMin:13,cap:t>q.end-.7});
   const sk=solve(camposAt(tp).pose,CB,cp);
   // "bright kit": a burst of yellow and red sparks round his shirt
   const bk=sm(q.bk,q.bk+.15,tt)*(1-sm(q.bk+.5,q.bk+.9,tt));if(bk>.02&&depthOf(c,sk.chest)>NEAR+.5){const p=P(c,sk.chest),k=kAt(c,sk.chest);sparkBurst(s,Y,p[0],p[1],(.7+.5*sm(q.bk,q.bk+.3,tt,easeOut))*k,{n:10,seed:11,g:bk,width:Math.max(5,.05*k)});sparkBurst(s,RD,p[0],p[1],(.55+.4*sm(q.bk,q.bk+.3,tt,easeOut))*k,{n:7,seed:12,g:bk,width:Math.max(4,.04*k)});}
   // "small for a keeper": a height ruler beside him, 1.68 m
   const sm1=sm(q.sk,q.sk+.5,tt,easeOut)*(1-sm(q.hp+.2,q.hp+.6,tt));if(sm1>.02)ruler(s,c,cp.x??0,cp.z??0,CB.height!,sm1,[.1,.75]);
   // "sprints": speed lines behind him
   const sp=sm(q.sp,q.sp+.2,tt)*(1-sm(q.sp+1.2,q.sp+1.7,tt));if(sp>.02&&depthOf(c,sk.pelvis)>NEAR+.5){const a=P(c,sk.pelvis),b=P(c,add(sk.pelvis,[afx,0,afz]));speedLines(s,K,a[0],a[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:8,len:90*sp,width:5,cov:.8});}
   // "win it first": sparks where his boot meets the ball
   if(tp>=TH&&tp<TH+.3){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],70+60*sm(TH,TH+.1,tp,easeOut),{n:9,seed:3,g:1-sm(TH+.1,TH+.3,tp),width:10});}
   const wf=sm(q.wf,q.wf+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(wf>.02){const p=new Path2D();gRing(p,c,HIT[0],HIT[2],1.3*wf,.16);yInk(s,p,.95);}
  });},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low behind Campos): he reads the long ball as it is kicked, off his line in a flash =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),rd:T(1,'reads'),lb:T(1,'long ball'),kk:T(1,'kicked'),ol:T(1,'off his line'),fl:T(1,'flash'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-1.05],[q.rd,-.5],[q.kk,0],[q.ol+.1,.5],[q.fl+.3,1.25],[q.end,1.7]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),n=camposAt(tau-.3).place,b=ballAt(Math.max(0,tau));
 const pos:V3=[(n.x??0)+6.5-afx*0,2.3-.3*sm(q.kk,q.end,t),(n.z??0)+3.2];
 const ahead:V3=[(n.x??0)-12,.6,(n.z??0)-6],look=mix3(ahead,[lerp(ahead[0],b[0],.35),b[1]*.3+.6,lerp(ahead[2],b[2],.35)],sm(q.kk-.2,q.ol+.8,t,easeInOutSine));
 const F=key(t,mono([[0,1500],[q.rd,1650],[q.kk,1550],[q.ol+.5,1400],[q.end,1450]]),easeInOutSine);return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.08},()=>{
   // "long ball": the flight predicted from the kick, dashed over Mexico's line, and a ring where it will bounce
   const lb=sm(q.lb,q.lb+.6,tt,easeOut)*(1-sm(q.end-.8,q.end-.4,tt));if(lb>.02){const pts=proj(c,flight(0,TB*lb));if(pts.length>1)yInk(s,ribbon(pts,Math.max(5,.14*kAt(c,[-50,4,-10])),{taper:.2,wobble:.6,gaps:dashes(.07,.035)}),.95);
    if(lb>.6){const p=new Path2D();gRing(p,c,B1[0],B1[2],1.2*sm(.6,1,lb,easeOutBack)*(1+.08*Math.sin(tt*9)),.12);yInk(s,p,.95);}}
   const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:true,prev:true,cap:t>q.end-.7});
   const sk=solve(w.cmp.pose,CB,w.cmp.place);
   // "reads": a dashed sight line from his eyes to the ball
   const rd=sm(q.rd,q.rd+.4,tt,easeOut)*(1-sm(q.ol,q.ol+.5,tt));if(rd>.02&&depthOf(c,sk.head)>NEAR+.3){const a=P(c,sk.head),b=P(c,w.ball);yInk(s,ribbon([a,[lerp(a[0],b[0],rd),lerp(a[1],b[1],rd)]],Math.max(4,.035*kAt(c,sk.head)),{taper:0,wobble:.5,gaps:dashes(.06,.03)}),.95);}
   // "kicked": sparks off the kicker's boot
   if(tp>=0&&tp<.25){const p=P(c,[K0[0],.2,K0[1]]);sparkBurst(s,Y,p[0],p[1],40+40*sm(0,.08,tp,easeOut),{n:8,seed:5,g:1-sm(.08,.25,tp),width:7});}
   // "off his line": the edge of his box lights up as he crosses it
   const ol=sm(q.ol,q.ol+.3,tt,easeOutBack)*(1-sm(q.fl+.6,q.fl+1.1,tt));if(ol>.02){const p=new Path2D();groundLine(p,c,[-16.5,-20.16],[-16.5,6],.25+.2*ol);yInk(s,p,.95*ol);}
   // "flash": speed lines streaming back from his boots
   const fl=sm(q.fl,q.fl+.2,tt)*(1-sm(q.end-.9,q.end-.5,tt));if(fl>.02&&depthOf(c,sk.pelvis)>NEAR+.5){const a=P(c,sk.pelvis),b=P(c,add(sk.pelvis,[afx,0,afz]));speedLines(s,K,a[0],a[1]+.5*kAt(c,sk.pelvis),Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:9,len:160*fl,width:6,cov:.8});}
  });},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(14,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay low from the side at the meeting point): outside the box, no hands, the brave slide, cleared first =================
const ch3q=()=>({ob:T(2,'Outside his box'),uh:T(2,'use his hands'),si:T(2,'slides in'),br:T(2,'bravely'),ci:T(2,'clears it'),ss:T(2,'a split second'),bs:T(2,'before the striker'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,JUMP0-1.1],[q.ob+.2,JUMP0-.8],[q.uh+.2,JUMP0-.25],[q.si+.1,JUMP0+.05],[q.ci+.05,TH],[q.ss+.3,TH+.14],[q.bs+.3,TH+.32],[q.end,Math.min(T_LINE+.4,TH+.32+(q.end-q.bs-.3)*.6)]]),x=>x);};
/** the side view: perpendicular to his sprint, from the main-stand side, low */
const SIDE:[number,number]=[-afz,afx];// left of his run
const SIDE_S=SIDE[1]>0?-1:1;
const M0:[number,number]=[HIT[0],HIT[2]];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.max(tau,TH)),n=SIDE_S;
 const at=(d:number,along:number,h:number):V3=>[M0[0]+SIDE[0]*n*d+afx*along,h,M0[1]+SIDE[1]*n*d+afz*along];
 const v=key(t,mono([[0,...at(9,-5,1.9),1200],[q.ob+.6,...at(8.5,-3.6,1.8),1350],[q.uh,...at(7,-1.8,1.35),1800],[q.si,...at(6.6,-.8,1.1),2000],[q.ci,...at(6.4,0,1.1),2100],[q.bs+.2,...at(6.8,.4,1.3),1950],[q.end,...at(8,-.6,1.8),1500]]),easeInOutSine,true);
 const look0:V3=mix3([M0[0]-afx*4,1,M0[1]-afz*4],[M0[0],.8,M0[1]],sm(q.ob+.4,q.si,t,easeInOutSine)),look1:V3=[b[0],clamp(b[1],.4,2),b[2]];
 const cp=camposAt(tau).place;return cam([v[0],v[1],v[2]],mix3(look0,[lerp(cp.x??0,look1[0],.3),.7,lerp(cp.z??0,look1[2],.3)],sm(q.bs,q.end,t,easeInOutSine)*.6),v[3]);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),hitT=q.ci+.05;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.1+.8*sm(TH,TH+.5,tp)*(1-sm(TH+1.5,TH+2.5,tp)),flash:.1+.6*sm(TH,TH+.4,tp)},()=>{
   // "Outside his box": the edge of Mexico's box behind him lights up, a dashed line measures how far out he is
   const ob=sm(q.ob,q.ob+.35,tt,easeOutBack)*(1-sm(q.si,q.si+.5,tt));if(ob>.02){const p=boxPath(c,.35),n=camposAt(tp).place,a=P(c,[-16.5,.02,clamp(n.z??0,-20.16,20.16)]),b=P(c,[n.x??0,.02,n.z??0]);p.addPath(ribbon([a,[lerp(a[0],b[0],ob),lerp(a[1],b[1],ob)]],Math.max(4,.12*kAt(c,[-18,0,-12])),{taper:0,wobble:.5,gaps:dashes(.1,.05)}));yInk(s,p,.95*Math.min(1,ob));}
   const w=drawWorld(s,c,tau,tp,{ballMin:18,hero:true,prev:!(t>q.end-.7),cap:t>q.end-.7});
   const sk=solve(w.cmp.pose,CB,w.cmp.place),sa=solve(w.att.pose,AB,w.att.place);
   // "use his hands": a ring round each glove, struck through in red — not allowed out here
   const uh=sm(q.uh,q.uh+.3,tt,easeOutBack)*(1-sm(q.si-.1,q.si+.3,tt));if(uh>.02){const ring=new Path2D(),bar=new Path2D();for(const j of [sk.lHa,sk.rHa]){if(depthOf(c,j)<NEAR+.3)continue;const p=P(c,j),k=kAt(c,j),r=.2*k*uh,pts:Pt[]=Array.from({length:20},(_,i)=>[p[0]+Math.cos(i/20*TAU)*r,p[1]+Math.sin(i/20*TAU)*r] as Pt);ring.addPath(ribbon(pts,Math.max(4,.03*k),{close:true,taper:0,wobble:.6}));bar.addPath(ribbon([[p[0]-r*.72,p[1]+r*.72],[p[0]+r*.72,p[1]-r*.72]],Math.max(4,.035*k),{taper:0,wobble:.4}));}
    yInk(s,ring,.95);rInk(s,bar,.95);}
   // "slides in": speed lines along the slide, and the slide's track on the grass
   const si=sm(q.si,q.si+.2,tt)*(1-sm(q.ci+.4,q.ci+.9,tt));if(si>.02&&depthOf(c,sk.pelvis)>NEAR+.5){const a=P(c,sk.pelvis),b=P(c,add(sk.pelvis,[afx,0,afz]));speedLines(s,K,a[0],a[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:170*si,width:6,cov:.8});
    const tr=new Path2D();groundLine(tr,c,[SP[0],SP[1]],[sk.pelvis[0],sk.pelvis[2]],.35);s.tone(K,tr,.3*si);}
   // "bravely": a ring round Campos, down among the boots
   const br=sm(q.br,q.br+.3,tt,easeOutBack)*(1-sm(q.ci+.2,q.ci+.6,tt));if(br>.02&&depthOf(c,sk.chest)>NEAR+.3){const p=P(c,sk.chest);yRing(s,p[0],p[1],.7*kAt(c,sk.chest)*br,Math.max(4,.04*kAt(c,sk.chest)));}
   // "clears it": sparks where his boot meets the ball, then a dotted arrow along the clearance, out over the touchline
   if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],90+90*sm(TH,TH+.08,tp,easeOut),{n:10,seed:6,g:1-sm(TH+.08,TH+.25,tp),width:11});}
   const ci=sm(q.ci+.1,q.ci+.5,tt,easeOut)*(1-sm(q.end-.9,q.end-.5,tt));if(ci>.02){const dots=new Path2D();let last:Pt|null=null,prev:Pt|null=null;for(let i=0;i<=16;i++){const tb=TH+.05+i/16*(T_LINE-TH)*ci,p=ballAt(tb);if(depthOf(c,p)<NEAR+.3)continue;const pp=P(c,p),r=Math.max(4,.05*kAt(c,p));dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);prev=last;last=pp;}
    if(last&&prev){const dx=last[0]-prev[0],dy=last[1]-prev[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=22;dots.addPath(polyPath([[last[0]+ux*z*1.4,last[1]+uy*z*1.4],[last[0]-uy*z,last[1]+ux*z],[last[0]+uy*z,last[1]-ux*z]],true));}yInk(s,dots,.95);}
   // "a split second": the gap between the ball on Campos's boot and the striker's boot, dashed
   const sp=sm(q.ss,q.ss+.3,tt,easeOut)*(1-sm(q.bs+.6,q.bs+1,tt));if(sp>.02&&depthOf(c,sa.lToe)>NEAR+.3){const a=P(c,HIT),b=P(c,sa.lToe);yInk(s,ribbon([a,[lerp(a[0],b[0],sp),lerp(a[1],b[1],sp)]],Math.max(4,.03*kAt(c,HIT)),{taper:0,wobble:.5,gaps:dashes(.14,.07)}),.95);}
   // "before the striker": a red ring round the striker on the grass
   const bs=sm(q.bs,q.bs+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(bs>.02){const p=new Path2D();gRing(p,c,sa.pelvis[0],sa.pelvis[2],.9*bs,.07);rInk(s,p,.95);}
  });},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),np=camposAt(tau).place,g:V3=[np.x??0,.5,np.z??0];let x=0,y=0;if(depthOf(c,g)>NEAR+.5)[x,y]=P(c,g);return apertureDisc(x,y,clamp(.35*kAt(c,g),22,160),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): not the tallest — quick feet and bravery win the ball first =================
const ch4q=()=>({nt:T(3,'Not the tallest'),qf:T(3,'Quick feet'),br:T(3,'bravery'),wb:T(3,'win the ball'),fi:T(3,'first'),end:SEC(3)});
/** lesson clock: Campos set on "Not the tallest", the ball is kicked and he is away on "Quick feet", the slide on "bravery", he wins it on "win the ball" */
const tau4=(t:number)=>{const q=ch4q(),wbT=Math.max(q.wb+.2,q.br+.6);return key(t,mono([[0,-.9],[q.qf,.2],[q.br,JUMP0-.1],[wbT,TH],[q.end,TH+.25+(q.end-wbT)*.4]]),x=>x);};
const CAM4=duo(CAMPOS,true),ATT4=duo(STRIKER),DEF4=[RODRIGUEZ,SUAREZ].map(st=>duo(st));
/** lesson camera: low and side-on to his sprint, travelling with him (never top-down) */
function LCAM(t:number){const q=ch4q(),v=key(t,mono([[0,7,1.7,2600],[q.qf,10,2.2,2100],[q.br,9,2,2100],[q.end,9.5,2.1,2000]]),easeInOutSine,true);
 const n=camposAt(tau4(t)-.15).place,w=.3*sm(q.qf,q.br,t,easeInOutSine),lk:V3=[lerp(n.x??0,HIT[0],w),.8,lerp(n.z??0,HIT[2],w)];return cam([lk[0]+SIDE[0]*SIDE_S*v[0]+afx*2,v[1],lk[2]+SIDE[1]*SIDE_S*v[0]+afz*2],lk,v[2]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-80,0,-34],[0,0,-34],[0,0,34],[-80,0,34]]));s.tone(K,floor,.2);
  const lines=new Path2D();groundLine(lines,c,[0,-34],[-80,-34],.2);groundLine(lines,c,[0,-34],[0,34],.2);lines.addPath(boxPath(c,.2));s.knockout(lines,.6);
  const n0=camposAt(tp).place,pool=(r:number)=>{const g=groundRing(c,n0.x??0,n0.z??0,r,36),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};s.knockout(pool(3.2),.22);s.tone(Y,pool(1.6),.25);
  // "Quick feet": his sprint drawn out from where he stood to where he slides
  const qf=sm(q.qf,q.qf+.9,tt,easeOut);if(qf>.02){const pts=proj(c,[...CAM_P.slice(1).map(k=>[k[1],.02,k[2]] as V3),[HIT[0],.02,HIT[2]]]);if(pts.length>1){const n=Math.max(2,Math.ceil(pts.length*qf));yInk(s,ribbon(pts.slice(0,n),Math.max(5,.2*kAt(c,[-14,0,-8])),{taper:.1,wobble:.6,gaps:dashes(.12,.06)}),.95);}}
  const items:Item[]=[];
  const n=camposAt(tp),np=camposAt(tp-1/12),sl=strikerAt(tp),slp=strikerAt(tp-1/12),bpos=ballAt(tau),b0=ballAt(tp);
  items.push({depth:depthOf(c,[n.place.x??0,0,n.place.z??0]),draw:()=>drawPlayer(s,n.pose,c,CAM4,n.place,{prev:np,smear:true})});
  items.push({depth:depthOf(c,[sl.place.x??0,0,sl.place.z??0]),draw:()=>drawPlayer(s,sl.pose,c,ATT4,sl.place,{prev:slp})});
  [RODRIGUEZ,SUAREZ].forEach((st,i)=>{const a=ACTORS.find(x=>x.style===st)!,r=a.at(tp,b0);items.push({depth:depthOf(c,[r.place.x??0,0,r.place.z??0]),draw:()=>drawPlayer(s,r.pose,c,DEF4[i],r.place,{detail:'low'})});});
  items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),rr=Math.max(12,BALL_R*kAt(c,bpos));questra(s,bp[0],bp[1],rr,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(rr*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "Not the tallest": his 1.68 m ruler
  const nt=sm(q.nt,q.nt+.5,tt,easeOut)*(1-sm(q.qf+.3,q.qf+.7,tt));if(nt>.02)ruler(s,c,n.place.x??0,n.place.z??0,CB.height!,nt,[.1,.8]);
  // "bravery": a ring round him as he slides in
  const br=sm(q.br,q.br+.3,tt,easeOutBack)*(1-sm(q.wb+.3,q.wb+.8,tt));if(br>.02){const p=new Path2D();gRing(p,c,n.place.x??0,n.place.z??0,1.3*br,.14);yInk(s,p,.95);}
  // "win the ball": sparks at the contact; "first": a ring round the won ball's spot
  if(tp>=TH&&tp<TH+.25){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],80,{n:10,seed:41,g:1-sm(TH+.08,TH+.25,tp),width:9});}
  const fi=sm(q.fi,q.fi+.3,tt,easeOutBack);if(fi>.02){const p=new Path2D();gRing(p,c,HIT[0],HIT[2],1.1*fi,.14);yInk(s,p,.95);}
 },
 still:6,
};

const story:RisoStory={
 id:'campos-signature',format:'11v11',title:'Campos sweeps it up',
 theme:'Not the tallest? Quick feet and bravery help you win the ball first.',
 ageNote:'Signature move, shown in a real match: Mexico 1–1 Bulgaria (Bulgaria won on penalties), World Cup round of 16, Giants Stadium, East Rutherford, 5 July 1994. Jorge Campos (1.68 m) was famous for racing off his line to win the ball first; this rush is an illustration of how he played, not one filmed moment.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4a5e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball rolls in and is poked away by a sliding boot with a yellow ring and sparks. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=clamp(age/.8),g=age<=0?1:easeOutBack(clamp(age/.25)),side=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*28*g] as Pt;}),true),12,.95);
  const bx=u<.45?x-side*(1-u/.45)*120:x+side*(u-.45)/.55*170,by=u<.45?y-12:y-12-Math.sin((u-.45)/.55*Math.PI)*90;
  if(age>.34&&age<.6)sparkBurst(s,Y,bx,by,100,{n:8,seed,g:1-clamp((age-.34)/.26),width:10});
  questra(s,bx,by,44,age*12+hash(seed,3)*TAU,{sq:age>.34&&age<.46?.2:0,dir:0});
 },
};
export default story;
