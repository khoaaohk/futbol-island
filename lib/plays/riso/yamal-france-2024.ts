/** Iconic play film: Lamine Yamal's curler, Spain 2–1 France, UEFA Euro 2024 semi-final, Munich Football Arena (Allianz Arena), 9 July 2024.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/yamal-france-2024/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/yamal-france-2024/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/yamal-france-2024/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (fetched Sept 2026 with curl, cached in the film scratchpad; the footage itself was not reviewed):
 *  - Wikipedia, "UEFA Euro 2024 knockout stage" (Spain vs France: date, kick-off 21:00, goals Kolo Muani 9', Yamal 21', Olmo 25', venue,
 *    attendance 62,042, referee, line-ups and shirt numbers, both kits drawn from UEFA's line-up sheet)
 *    https://en.wikipedia.org/wiki/UEFA_Euro_2024_knockout_stage
 *  - Wikipedia, "Lamine Yamal" (en + es): youngest scorer in the European Championship finals, Goal of the Tournament, the France goal was
 *    his 3rd international goal (1–1) https://en.wikipedia.org/wiki/Lamine_Yamal
 *  - The Guardian, Jonathan Liew, "Lamine Yamal's wonder goal leads Spain past France and into Euro 2024 final" (9 July 2024)
 *    https://www.theguardian.com/football/article/2024/jul/09/spain-france-euro-2024-semi-final-match-report
 *  - The Guardian, Sid Lowe, "Lamine Yamal's goal for the ages shows best of Spain's generational talent" (9 July 2024)
 *    https://www.theguardian.com/football/article/2024/jul/09/lamine-yamals-goal-for-the-ages-shows-best-of-spains-generational-talent
 *  - Cadena SER, "Lamine Yamal sigue haciendo historia..." (9 July 2024) https://cadenaser.com/nacional/2024/07/09/lamine-yamal-sigue-haciendo-historia-se-convierte-en-el-jugador-mas-joven-en-marcar-en-una-eurocopa-con-esta-obra-de-arte-cadena-ser/
 * CONFIRMED by those accounts: 9 July 2024, Munich, Euro 2024 semi-final; France led through Kolo Muani's 9th-minute header; Yamal equalised
 *  in the 21st minute (1–1) and Olmo scored the winner four minutes later, Spain won 2–1; the move went Olmo → Morata → back to Yamal;
 *  faced by Adrien Rabiot (France midfielder, 14) he "took a step inside" ("forward, to the left, to the right, to the left again") and
 *  curled/bent a LEFT-footed shot from OUTSIDE THE BOX (a "25-yard" strike) into the top corner of Mike Maignan's goal ("arcs towards the
 *  top-left corner", Guardian caption), going in off the post ("entró por la misma escuadra tras impactar con el palo de Maignan", SER);
 *  he sprinted to the bench and skidded to his knees; aged 16 years 362 days he became the youngest scorer at a Euros; Yamal wore 19,
 *  Rabiot 14, Maignan 16, Morata 7, Olmo 10; KITS: Spain red shirts, dark-blue shorts, red socks; France all white.
 * INFERRED / ILLUSTRATIVE: every position and run in metres (Yamal receives ≈ 24 m out, right of centre, shoots from ≈ 23 m); the exact
 *  sequence and timing of his feint; that the ball swung out wide of the far post and bent back in, clipping the INSIDE of the far post
 *  (the corner to Yamal's left, Maignan's right) before dropping into the net; Maignan's dive to his right; Rabiot's late lunge; Spain
 *  attacking left-to-right on the main camera with Yamal on the near (right) side; where the Spain bench was; all other players' positions
 *  (Nico Williams, Fabián Ruiz, Rodri, Navas, Cucurella; Théo Hernandez, Upamecano, Saliba, Koundé, Tchouaméni, Kanté, Mbappé, Dembélé,
 *  Kolo Muani); Spain's yellow numbers and trim, France's blue trim and navy numbers; Maignan's goalkeeper kit colour (drawn yellow; not
 *  named in the narration); hair styles; the ball design (a white 2024 ball with navy and red panels); the arena interior drawn as three
 *  steep tiers with light fascia bands under a closed roof ring, dusk sky; crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 Yamal receives Morata's lay-off): ch1 = the high main-stand broadcast camera, live (Olmo → Morata → Yamal, the feint,
 * the step inside, the curler, the post, the net); ch2 = the TV slow-motion replay, low and close behind Yamal (the open body, the left foot
 * wrapping round the ball, the swerve round Rabiot toward the far post); ch3 = the replay from behind the far post (past Maignan's dive, in
 * off the post, then the sprint and knee slide to the bench); ch4 = a duotone lesson (open your body, curl it round the defender toward the
 * far post). Seams are forward passages into the ball. The curler is a quadratic Bézier on the ground (it starts out left of the far post
 * and bends back in) with a rising-dipping height profile; contact reads the solved skeleton's LEFT toe so ball and boot always meet.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe)
 * with a lens that widens for a square window. Inks: yellow (light, grass with blue, Spain trim), red (Spain, skin), blue (sky, grass,
 * France trim), navy (key line, shorts). Scenes read only their local t; poses on twos, cameras on ones; all randomness is seeded.
 * Budget ≈ 150–260 plate ops per frame (small wide-shot figures print at 'low'). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,blendPose,runCycle,stand,strike,dribble,backpedal,lunge,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() (aperture() reuses the last value) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`yamal film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py yamal-france-2024 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/yamal-france-2024/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Munich, live','Munich, 2024. Spain, in red, are losing to France in the Euro semi-final. Sixteen-year-old Lamine Yamal gets the ball outside the box. A defender blocks his way. One step inside... he shoots... off the post! Goal!',
  ['Munich','Spain, in red','France','Sixteen-year-old','Lamine Yamal','outside the box','A defender','One step inside','he shoots','off the post','Goal']),
 prov('Watch again','Watch again, slowly. He opens his body and wraps his left foot round the ball. It swerves around the defender toward the far post.',
  ['Watch again','slowly','He opens his body','left foot','round the ball','swerves around','the defender','far post']),
 prov('The far post',"From behind: past Maignan's dive, in off the post! The youngest scorer in Euro history!",
  ['From behind',"past Maignan's dive",'off the post','The youngest','Euro history']),
 prov('Your turn','Your turn: open your body, and curl it around the defender toward the far post.',
  ['Your turn','open your body','curl it','around the defender','far post']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`yamal film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
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
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}

// ================= Munich: the arena bowl — three steep tiers on four sides under a closed roof ring, a dusk sky over the opening =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-118,.9,-37.5],[14,.9,-37.5],[14,33,-66],[-118,33,-66]],// far side (across from the TV camera)
 [[8.5,.9,46],[8.5,.9,-46],[37,33,-46],[37,33,46]],// behind the goal Spain attack
 [[14,.9,37.5],[-118,.9,37.5],[-118,33,66],[14,33,66]],// the main stand under the camera
 [[-113.5,.9,-46],[-113.5,.9,46],[-142,33,46],[-142,33,-46]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red / 2 yellow / 3 blue / 4 navy, phase] — Spain's red and yellow, France's blue and white */
const CROWD=(()=>{const r=rng(2024),out:[number,number,number,number,number][]=[];[760,340,620,340].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.03+r()*.93;if(Math.abs(v-.34)<.035||Math.abs(v-.67)<.035)continue;out.push([st,r(),v,c<.26?0:c<.6?1:c<.74?2:c<.92?3:4,r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;post?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // dusk over Munich (kick-off 21:00): a deep blue sky with a warm band low down
 s.field(B,.52,.6);s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true),.22);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.tone(R,polyPath([[-Bnd,hz-160],[Bnd,hz-160],[Bnd,hz+400],[-Bnd,hz+400]],true),.18);
 // three tiers: knocked out, a navy-grey screen, rows; two light fascia bands; the roof ring (navy) with the floodlight line under its edge
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),leds=new Path2D(),lamps=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<18;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/18),bil(q,1,k/18),bil(q,1,(k+1)/18),bil(q,0,(k+1)/18)]));
  const lift:V3=[0,3,0],over=(si===0?[0,0,26]:si===2?[0,0,-26]:si===1?[-24,0,0]:[24,0,0]) as V3;
  addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(add(q[2],lift),over),add(add(q[3],lift),over)]));
  for(const v of[.34,.67]){addPoly(fascia,clipPoly(c,[bil(q,0,v-.03),bil(q,1,v-.03),bil(q,1,v+.03),bil(q,0,v+.03)]));addPoly(leds,clipPoly(c,[bil(q,0,v-.012),bil(q,1,v-.012),bil(q,1,v+.012),bil(q,0,v+.012)]));}
  for(let k=0;k<22;k++){const u=(k+.5)/22,p=add(add(bil(q,u,1),lift),over);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}});
 s.knockout(stands);s.tone(K,stands,.42);s.tone(B,stands,.2);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(K,heads[4],.9);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.tone(K,fascia,.5);s.fill(Y,leds,.7);s.fill(K,roof,.92);s.knockout(lamps,.95);
 // LED boards along the touchlines and behind the goal
 const bB=new Path2D(),bP=new Path2D();for(const z of[-35.4,35.4])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(B,bB,.9);s.fill(R,bP,.8);
 // grass: yellow × blue = green, mowing stripes, paper lines (the box, the D, the six-yard box, the spot)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[5,0,-35],[5,0,35],[-110,0,35]]));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net,o.post??0);
}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple; `post` shivers the far post (z = −3.66) */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3,post=0){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const sh=post>0?.05*post:0;
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[sh,H+.06,-W+sh]);bar([0,0,W],[0,H+.06,W]);bar([sh,H,-W-.06+sh],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (2024: white with navy panels and a red accent — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // swooping bands that turn with the spin (reads as the 2024 ball's curved panels), and one red accent
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3;pan.addPath(ribbon([[Math.cos(a)*r*.15,Math.sin(a)*r*.15],[Math.cos(a+.7)*r*.6,Math.sin(a+.7)*r*.6],[Math.cos(a+1.3)*r*1.05,Math.sin(a+1.3)*r*1.05]],Math.max(2,r*.2),{taper:.4,wobble:0}));}
 const aa=spin*.8+1;acc.addPath(ribbon([[Math.cos(aa)*r*.2,Math.sin(aa)*r*.2],[Math.cos(aa+.9)*r*.5,Math.sin(aa+.9)*r*.5]],Math.max(2,r*.14),{taper:.6,wobble:0}));
 s.fill(K,pan,.9);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (9 July 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Spain: red shirts, dark-blue shorts, red socks (confirmed); yellow numbers and trim (inferred) */
const ESP=(n:number,o:Partial<Kit>={}):Kit=>({shirt:R,shorts:[K,.9],socks:R,trim:Y,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:40+n,...o});
/** France: all white (confirmed); blue trim, navy numbers (inferred) */
const FRA=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:'paper',socks:'paper',trim:B,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:60+n,...o});
const YAMAL:Kit=ESP(19,{skin:SKIN_D,hair:[K,.92],hairStyle:'short',build:{height:1.8,bulk:.86,thighs:.94,head:1.02},seed:19});
const RABIOT:Kit=FRA(14,{hair:[K,.7],hairStyle:'long',build:{height:1.88,bulk:.98},seed:74});
const MAIGNAN:Kit={shirt:[Y,.9],shorts:[K,.85],socks:[Y,.9],trim:K,boots:K,skin:SKIN_D,hair:[K,.9],hairStyle:'short',gloves:[B,.8],line:K,sleeves:'long',shade:[K,.26],number:16,numberInk:K,build:{height:1.91},seed:16};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Yamal receives Morata's lay-off) =================
const YB:Build=YAMAL.build!;
/** the ball's stops: Y0 the lay-off arrives, B1 after his first touch, B1b the shimmy, B2 after the step inside (all inferred) */
const Y0:[number,number]=[-23.6,8.2],B1:[number,number]=[-22.95,7.35],B1b:[number,number]=[-22.75,7.05],B2:[number,number]=[-22.55,5.05];
const T_IN=1.85,T_ROLL=2.45,CONTACT=2.65,TF=1.0,T_GOAL=CONTACT+TF;
/** the curler: from B2 it heads out LEFT of the far post (control point), bends back in and clips the inside of the far post */
const CTRL:[number,number]=[-9.5,-5.2],HIT:V3=[0,2.02,-3.49],POST:V3=[0,2.02,-3.66];
const D1:V3=[1.1,1.72,-2.75],D2:V3=[1.7,.11,-2.45],NET_HIT:V3=[2,1.65,-2.7];
const curl=(u:number):V3=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*B2[0]+b*CTRL[0]+c*HIT[0],lerp(.11,HIT[1],u)+1.25*Math.sin(Math.PI*u)*(1-.25*u),a*B2[1]+b*CTRL[1]+c*HIT[2]];};
/** the body turned open toward the far post at the strike (a little left of the straight line to it) */
const YS=YAW(HIT[0]-B2[0],HIT[2]-B2[1])+10*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.8}),YB,{yaw:YS});
const YP:[number,number]=[B2[0]-SHOT_SK.lToe[0],B2[1]-SHOT_SK.lToe[2]];
const [sfx,sfz]=dirOf(YS);
const SLIDE0=T_GOAL+3.0;// the knee slide by the bench (inferred place)

type Role='hero'|'esp'|'fra'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Yamal',role:'hero',style:YAMAL,key:true,keys:[[-10,-27.5,17],[-4,-26,12.8],[-1.2,-24.5,9.6],[0,-24.05,8.6],[.6,-23.45,7.8],[1.2,-23.35,7.7],[T_IN,-23.2,7.45],[2.25,-23.15,6.4],[CONTACT,YP[0],YP[1]],[CONTACT+.5,YP[0]+sfx*.45,YP[1]+sfz*.45],[T_GOAL+.3,YP[0]+.2,YP[1]+1.2],[T_GOAL+1.3,-25.6,11.5],[T_GOAL+2.2,-28.8,18.6],[SLIDE0,-31,23.6],[T_GOAL+6,-31,23.6]]},
 {name:'Rabiot',role:'fra',style:RABIOT,key:true,keys:[[-10,-24,3.5],[-3,-21.6,5.4],[-1,-20.4,6.9],[0,-20.9,7.6],[1.2,-21.3,7.6],[1.6,-21.4,7.95],[2,-21.3,7.1],[2.4,-21.1,6.4],[CONTACT,-20.95,6.0],[3.5,-20.6,5.5],[8,-20,5]]},
 {name:'Maignan',role:'gk',style:MAIGNAN,key:true,keys:[[-10,-2.6,.8],[0,-2.0,1.0],[CONTACT,-1.7,.55],[8,-1.7,.55]]},
 {name:'Morata',role:'esp',style:ESP(7,{skin:SKIN_L,hair:[K,.8]}),keys:[[-10,-14,1],[-4,-16.6,1.3],[-2.1,-17.6,1.2],[-1.1,-17.55,1.25],[.5,-16,.2],[3,-11.5,-1],[8,-9,-1]]},
 {name:'Olmo',role:'esp',style:ESP(10,{skin:SKIN_L}),keys:[[-10,-35,.5],[-3.2,-27.9,2.4],[-3,-27.6,2.5],[-1,-24.8,1.4],[2,-20.5,-.4],[5,-17,-1],[8,-15,-1]]},
 {name:'Williams',role:'esp',style:ESP(17,{skin:SKIN_D,hair:[K,.9]}),keys:[[-10,-21,-22],[0,-15.5,-19],[4,-11,-14],[8,-10,-12]]},
 {name:'Fabián',role:'esp',style:ESP(8,{hair:[K,.85]}),keys:[[-10,-37,-6],[0,-30.5,-5],[4,-27,-4]]},
 {name:'Rodri',role:'esp',style:ESP(16,{hair:[K,.85]}),keys:[[-10,-43,2],[0,-37.5,1],[4,-35,1]]},
 {name:'Navas',role:'esp',style:ESP(22,{hair:[K,.85]}),keys:[[-10,-38,26],[0,-33,22],[4,-35,18]]},
 {name:'Cucurella',role:'esp',style:ESP(24,{hairStyle:'curly',hair:[K,.75]}),keys:[[-10,-39,-26],[4,-32,-24]]},
 {name:'Hernandez',role:'fra',style:FRA(22,{hair:[K,.8]}),keys:[[-10,-21,16.5],[-2,-20.3,13.2],[1,-19.7,11.4],[4,-18.5,9.5],[8,-18,9]]},
 {name:'Tchouaméni',role:'fra',style:FRA(8,{skin:SKIN_D}),keys:[[-10,-15,0],[-2.1,-16.7,1.0],[0,-17.2,2.4],[3,-15.8,2],[8,-15,2]]},
 {name:'Kanté',role:'fra',style:FRA(13,{skin:SKIN_D,build:{height:1.68}}),keys:[[-10,-27,-3.5],[-3,-23.5,-1.5],[0,-21.4,.8],[3,-19.8,1.2],[8,-19,1]]},
 {name:'Upamecano',role:'fra',style:FRA(4,{skin:SKIN_D,build:{height:1.86,bulk:1.08}}),keys:[[-10,-12,4],[0,-13,3.3],[3,-11,2.4],[8,-10.5,2]]},
 {name:'Saliba',role:'fra',style:FRA(17,{skin:SKIN_D,build:{height:1.92}}),keys:[[-10,-12,-4],[0,-13,-3.4],[3,-11.2,-3],[8,-10.5,-2.6]]},
 {name:'Koundé',role:'fra',style:FRA(5,{skin:SKIN_D,build:{height:1.8}}),keys:[[-10,-15,-13],[0,-14.2,-14.5],[4,-12.8,-13],[8,-12,-12]]},
 {name:'Mbappé',role:'fra',style:FRA(10,{skin:SKIN_D}),keys:[[-10,-41,14],[4,-34,12]]},
 {name:'Dembélé',role:'fra',style:FRA(11,{skin:SKIN_D}),keys:[[-10,-39,-16],[4,-33,-13]]},
 {name:'Kolo Muani',role:'fra',style:FRA(12,{skin:SKIN_D}),keys:[[-10,-45,3],[4,-39,2]]},
];
const YAM=0,RAB=1,GK=2,MOR=3,OLM=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---- the ball: Olmo carries it → Olmo to Morata → Morata lays it back → Yamal's touch, shimmy, step inside → the curler → post → net ----
const OLMO_PASS=-3,MOR_REC=-2.1,LAY=-1.1;
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const OB=fwdBall(OLM,OLMO_PASS,.45);
const MB:[number,number]=(()=>{const m=posOf(MOR,MOR_REC);return[m[0]-.45,m[1]+.05];})();
function ballAt(tau:number):V3{
 if(tau<OLMO_PASS){const f=fwdBall(OLM,tau,.45+.12*Math.sin(tau*5));return[f[0],.11,f[1]];}
 if(tau<MOR_REC){const u=(tau-OLMO_PASS)/(MOR_REC-OLMO_PASS),e=1.5*u-.5*u*u;return[lerp(OB[0],MB[0],e),.11,lerp(OB[1],MB[1],e)];}
 if(tau<LAY)return[MB[0]+.05*Math.sin((tau-MOR_REC)*6),.11,MB[1]];
 if(tau<0){const u=(tau-LAY)/-LAY,e=1.5*u-.5*u*u;return[lerp(MB[0],Y0[0],e),.11,lerp(MB[1],Y0[1],e)];}
 if(tau<.6){const u=tau/.6,e=1-(1-u)*(1-u);return[lerp(Y0[0],B1[0],e),.11,lerp(Y0[1],B1[1],e)];}
 if(tau<T_IN){const u=(tau-.6)/(T_IN-.6);return[lerp(B1[0],B1b[0],u)+.06*Math.sin(u*TAU*1.5),.11,lerp(B1[1],B1b[1],u)+.12*Math.sin(u*TAU)];}
 if(tau<CONTACT){const u=clamp((tau-T_IN)/(T_ROLL-T_IN)),e=1-(1-u)*(1-u);return[lerp(B1b[0],B2[0],e),.11,lerp(B1b[1],B2[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return curl(1.12*u-.12*u*u);}
 const e=s-TF;if(e<.16)return mix3(HIT,D1,easeOut(e/.16));
 const d=clamp((e-.16)/.5),h=D1[1]*(1-d*d)+.11*d*d;return[lerp(D1[0],D2[0],d),Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.66)*8))*Math.exp(-(e-.66)*3):0),lerp(D1[2],D2[2],d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
const RECEIVE:Partial<Pose>={lean:12,lHipF:26,lKnee:34,lAnk:-12,rKnee:30,lShA:40,rShA:36,lElb:40,rElb:40,neckP:30};
/** the shimmy: drop the right shoulder (fake outside), then lean left for the step inside */
const FAKE:Partial<Pose>={bend:14,roll:8,twist:-14,lShA:62,rShA:24,neckY:-12,lKnee:48,rKnee:56,squash:-.05};
const INSIDE:Partial<Pose>={bend:-14,roll:-10,twist:10,rShA:66,lShA:26,neckY:10,lKnee:52,rKnee:46,squash:-.05};
const SD=.95,S_START=CONTACT-STRIKE_CONTACT*SD;
const goalYaw=(x:number,z:number)=>YAW(-x,-.8-z);
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<-.4){p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.1,{speed:clamp(sp/7)}),clamp(sp/1.1));}
  else if(tau<T_GOAL+.2){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.4+.3*clamp(sp/4)});p=blendPose(READY,dr,clamp(sp/.9));
   yaw=sp>.5?lerpAng(YAW(v[0],v[1]),goalYaw(x,z),.45):goalYaw(x,z);
   p=over(p,RECEIVE,bump(-.5,.35,tau));p=over(p,FAKE,bump(.8,1.6,tau));p=over(p,INSIDE,bump(1.55,2.3,tau));
   const u=(tau-S_START)/SD;if(u>-.2){yaw=lerpAng(yaw,YS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.8}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));
    p=over(p,{twist:-12},bump(.25,.8,u));}}
  else if(tau<SLIDE0-.1){p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.2,T_GOAL+.7,tau));}
  else{const u=clamp((tau-SLIDE0+.1)/1.1);p=celebrate(u,{kind:'kneeSlide'});const vv=velOf(k,SLIDE0-.3);yaw=YAW(vv[0],vv[1]);}
 }else if(a.role==='gk'){
  yaw=toBall;const q=keeperSet(tau*1.5),dAt=T_GOAL-.06,dd=.9,t0=dAt-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'r',height:.95}):q;if(u>0)yaw=YAW(1,0)+Math.PI;
 }else{
  const fra=a.role==='fra',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(fra&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(fra?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  if(k===RAB){const lu=(tau-(2.62-.6*.8))/.8;if(lu>0&&lu<1.6)p=blendPose(p,lunge(Math.min(1,lu),{side:'r'}),Math.min(sm(0,.15,lu),1-sm(1,1.6,lu)));
   if(tau<CONTACT+.2)yaw=YAW(posOf(YAM,tau)[0]-x,posOf(YAM,tau)[1]-z);else yaw=lerpAng(yaw,YAW(-x,-3-z),sm(CONTACT+.2,CONTACT+.8,tau));}
  if(k===OLM){const u=(tau-(OLMO_PASS-STRIKE_CONTACT*.8))/.8;if(u>0&&u<1.3){p=blendPose(p,strike(Math.min(1,u),{power:.35}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));yaw=YAW(MB[0]-OB[0],MB[1]-OB[1]);}}
  if(k===MOR){if(tau>-2.6&&tau<-.4)yaw=YAW(-1,0)+(tau>-1.6?lerpAng(0,YAW(Y0[0]-x,Y0[1]-z)-YAW(-1,0),sm(-1.8,-1.4,tau)):0);
   const u=(tau-(LAY-STRIKE_CONTACT*.7))/.7;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{power:.25}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));}
  if(a.role==='esp'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau)*(k===MOR||k===OLM?1:.6));
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Yamal with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. `style` swaps kits (the duotone lesson). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;only?:number[];style?:(k:number)=>Kit;duoBall?:boolean;noBall?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===YAM?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==YAM&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==YAM&&hPx<150)?'low':o.cap?'mid':undefined;
  const style=o.style?o.style(k):a.style,hero=k===YAM&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 if(!o.noBall)items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx),duo:o.duoBall});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, the defender) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** the curler's path on the grass (projected shadow line) or in the air, u ∈ [0, n] */
function curlPath(c:Camera,n:number,air:boolean):Pt[]{const pts:Pt[]=[];for(let i=0;i<=30;i++){const u=i/30*n,p=curl(u),q:V3=air?p:[p[0],.03,p[2]];if(depthOf(c,q)>NEAR)pts.push(P(c,q));}return pts;}
/** "far post": a yellow corner bracket in the angle of the far post and the bar */
function postBracket(s:Sheet,c:Camera,w:number){if(w<=.02)return;const C0:V3=[0,2.44,-3.66];if(depthOf(c,C0)<NEAR+.3)return;const k=kAt(c,C0),a=P(c,[0,2.44-.9*w,-3.66]),m=P(c,C0),b=P(c,[0,2.44,-3.66+.9*w]);yInk(s,ribbon([a,m,b],Math.max(7,.14*k),{taper:.1,wobble:1}),.95);}
/** the post: a spark where the ball clips it */
function postSpark(s:Sheet,c:Camera,tau:number,size=1){const age=tau-T_GOAL;if(age<-.02||age>.3||depthOf(c,POST)<NEAR+.3)return;const p=P(c,POST);sparkBurst(s,Y,p[0],p[1],(60+.9*kAt(c,POST))*size*easeOutBack(clamp((age+.02)/.1)),{n:9,seed:21,g:1-clamp((age-.12)/.18),width:10});}

// ================= chapter 1 (live): the high main-stand camera; Olmo → Morata → Yamal, the shimmy, the step inside, the curler, the post =================
const ch1q=()=>({mu:T(0,'Munich'),sp:T(0,'Spain, in red'),fr:T(0,'France'),sx:T(0,'Sixteen-year-old'),ly:T(0,'Lamine Yamal'),ob:T(0,'outside the box'),de:T(0,'A defender'),st:T(0,'One step inside'),sh:T(0,'he shoots'),po:T(0,'off the post'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: the pre-roll is Spain on the ball, the play runs at 0.7–1.4× real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-9.6],[q.ly,-4.2],[q.ob,-.9],[q.de,0],[q.st,1.6],[q.sh,CONTACT],[q.po,T_GOAL],[q.g,T_GOAL+.55],[q.end,T_GOAL+.55+(q.end-q.g)*.95]]),x=>x);};
const BCAM:V3=[-20,19,50];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),y=posOf(YAM,tau);
 if(tau<CONTACT)return[b[0]+1.5,1,b[2]];
 if(tau<T_GOAL+.6)return mix3([b[0],1.2,b[2]],[-3,1.3,-1.5],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-3,1.3,-1.5],[y[0],1.2,y[1]],sm(T_GOAL+.6,T_GOAL+2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-34,9,-42],look=mix3(wide,av(ch1Look),sm(q.sp-.4,q.ly,t,easeInOutSine));
 const F=key(t,mono([[0,1700],[q.sp,2600],[q.ly,4600],[q.ob,5200],[q.de,6000],[q.sh,5600],[q.po,4800],[q.g+.4,4600],[q.end,5200]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  // team rings: red for Spain on "Spain, in red", navy for France on "France", yellow for Yamal and for the defender
  const ra=sm(q.sp,q.sp+.3,tt,easeOutBack)*(1-sm(q.fr+.2,q.fr+.8,tt)),rf=sm(q.fr,q.fr+.3,tt,easeOutBack)*(1-sm(q.sx,q.sx+.6,tt)),ry=sm(q.ly,q.ly+.3,tt,easeOutBack)*(1-sm(q.ob+.4,q.ob+1,tt)),rd=sm(q.de,q.de+.3,tt,easeOutBack)*(1-sm(q.st+.2,q.st+.7,tt));
  if(ra>.02||rf>.02||ry>.02||rd>.02){const pa=new Path2D(),pf=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if(a.role==='esp'&&ra>.02)ringAt(pa,c,k,tp,ra);if((a.role==='fra'||a.role==='gk')&&rf>.02)ringAt(pf,c,k,tp,rf);});
   if(ra>.02)ringAt(pa,c,YAM,tp,ra);if(ry>.02)ringAt(py,c,YAM,tp,ry*1.2);if(rd>.02)ringAt(py,c,RAB,tp,rd*1.2);
   s.fill(R,pa,.95);s.fill(K,pf,.9);yInk(s,py,.95);}
  // "outside the box": the edge of the box and the D print yellow, dashed, for a beat
  const bx=sm(q.ob,q.ob+.3,tt)*(1-sm(q.de+.3,q.de+.9,tt));if(bx>.02){const pts:Pt[]=[];for(let i=0;i<=24;i++){const z=lerp(-20.16,20.16,i/24),p:V3=[-16.5,.03,z];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   const gaps:[number,number][]=[];for(let x=.04;x<1;x+=.08)gaps.push([x,x+.035]);if(pts.length>1)yInk(s,ribbon(pts,Math.max(6,.22*kAt(c,[-16.5,0,6])),{taper:0,wobble:.6,gaps}),.95*bx);}
  // "One step inside": a yellow arrow on the grass from the ball to where he pushes it
  const si=sm(q.st-.1,q.st+.5,tt,easeOut)*(1-sm(q.sh+.2,q.sh+.6,tt));if(si>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10*si,p:V3=[lerp(B1b[0],B2[0]+.1,u),.03,lerp(B1b[1],B2[1]-.4,u)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(6,.13*kAt(c,[B2[0],0,B2[1]]));yInk(s,ribbon(pts,w,{taper:.1,wobble:.8}),.95);yInk(s,head(pts,w),.95);}}
  drawWorld(s,c,tau,tp,{ballMin:12,cap:t>q.end-.7});
  // "he shoots": a spark off the left boot; "off the post": a spark on the post
  if(tp>=CONTACT&&tp<CONTACT+.25){const b=P(c,[B2[0],.2,B2[1]]);sparkBurst(s,Y,b[0],b[1],70+60*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9});}
  postSpark(s,c,tp,1.2);},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10,
};

// ================= chapter 2 (TV replay, slow motion, low behind Yamal): the open body, the left foot wraps round the ball, the swerve round Rabiot =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),ob:T(1,'He opens his body'),lf:T(1,'left foot'),rb:T(1,'round the ball'),sw:T(1,'swerves around'),de:T(1,'the defender'),fp:T(1,'far post'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,1.0],[q.sl,1.45],[q.ob,2.15],[q.lf,2.5],[q.rb,CONTACT+.04],[q.sw,CONTACT+.3],[q.de,CONTACT+.5],[q.fp,T_GOAL-.08],[q.end,T_GOAL+.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.w,q.lf+.3,t,easeInOutSine),follow=sm(q.rb,q.fp,t,easeInOutSine);
 const hero:V3=[YP[0],.95,YP[1]],a0=100*D2R,a1=168*D2R,ang=lerp(a0,a1,orbit)+YS,[dx,dz]=dirOf(ang),D=lerp(5.2,4.4,orbit)+2.2*follow;
 const pos:V3=[hero[0]+dx*D-1.5*follow,1.05+.5*follow,hero[2]+dz*D+.8*follow];
 const look=mix3(mix3(hero,[b[0],Math.min(b[1],2.2),b[2]],.35),[b[0],clamp(b[1],.8,2.4),b[2]],follow);
 const F=key(t,mono([[0,1500],[q.sl,1700],[q.ob,1850],[q.lf,2100],[q.rb,1900],[q.sw,1700],[q.fp,1900],[q.end,2100]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "He opens his body": a yellow wedge on the grass from his plant foot, turning open toward the far post
  const op=sm(q.ob,q.ob+.6,tt)*(1-sm(q.sw,q.sw+.5,tt));
  if(op>.02){const pts:Pt[]=[],y0=YS-50*D2R,y1=lerp(y0,YS,op);for(let i=0;i<=16;i++){const a=lerp(y0,y1,i/16),[fx,fz]=dirOf(a),p:V3=[YP[0]+fx*1.5,.03,YP[1]+fz*1.5];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(6,.08*kAt(c,[YP[0],0,YP[1]]));yInk(s,ribbon(pts,w,{taper:.1,wobble:.8}),.95*op);yInk(s,head(pts,w),.95*op);
    const [fx,fz]=dirOf(y1),r0=P(c,[YP[0],.03,YP[1]]),r1=P(c,[YP[0]+fx*1.5,.03,YP[1]+fz*1.5]);yInk(s,ribbon([r0,r1],w*.7,{taper:0,wobble:.5,gaps:[[.2,.3],[.5,.6],[.8,.9]]}),.9*op);}}
  // "swerves around" / "far post": the ball's path traced in the air as dots, the ring on Rabiot on "the defender"
  if(tp>CONTACT&&tp<T_GOAL+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.06*kAt(c,p),6,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}yInk(s,dots,.9);}
  const rd=sm(q.de-.1,q.de+.3,tt,easeOutBack)*(1-sm(q.fp+.3,q.fp+.9,tt));if(rd>.02){const pr=new Path2D();ringAt(pr,c,RAB,tp,rd,1);yInk(s,pr,.95);}
  const w=drawWorld(s,c,tau,tp,{ballMin:22,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.ob-.2,q.ob+.2,tt)),cap:t>q.end-.7||t<.6});
  // "left foot": a yellow ring on the left boot; "round the ball": a spin arrow wrapping round the ball at contact
  const lf=sm(q.lf-.1,q.lf+.25,tt,easeOutBack)*(1-sm(q.sw,q.sw+.4,tt));if(lf>.02){const sk=solve(poseOf(YAM,tp).pose,YB,poseOf(YAM,tp).place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*lf;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.lToe)));}
  const rb=sm(q.rb-.1,q.rb+.3,tt)*(1-sm(q.sw+.3,q.sw+.8,tt));if(rb>.02&&depthOf(c,w.ball)>NEAR+.4){const bp=P(c,w.ball),r=Math.max(22,BALL_R*kAt(c,w.ball))*1.9,pts:Pt[]=[];for(let i=0;i<=16;i++){const a=-.4+i/16*4.4*rb;pts.push([bp[0]+Math.cos(a)*r,bp[1]+Math.sin(a)*r*.6]);}
   if(pts.length>2){const ww=Math.max(5,r*.12);yInk(s,ribbon(pts,ww,{taper:.2,wobble:.5}),.95);yInk(s,head(pts,ww),.95);}}
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110+100*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:10,seed:14,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:12});}
  if(tp>=CONTACT&&tp<CONTACT+.6&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:150,width:6,cov:.8});}
  postBracket(s,c,sm(q.fp-.1,q.fp+.3,tt,easeOutBack));postSpark(s,c,tp,1.4);},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(22,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the far post): past Maignan's dive, in off the post, then the sprint and knee slide =================
const ch3q=()=>({fb:T(2,'From behind'),md:T(2,"past Maignan's dive"),po:T(2,'off the post'),yo:T(2,'The youngest'),eh:T(2,'Euro history'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,CONTACT+.15],[q.md,T_GOAL-.35],[q.po,T_GOAL+.02],[q.yo,T_GOAL+1.2],[q.eh,SLIDE0-.1],[q.end,SLIDE0+1.2]]),x=>x);};
const GCAM:V3=[6.8,1.9,-5.6];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),y=posOf(YAM,tau);
 const toBall=sm(0,q.md,t,easeInOutSine),toHero=sm(q.yo-.3,q.yo+1.2,t,easeInOutSine);
 const look0:V3=[B2[0]+4,1.3,B2[1]-2],look1:V3=[b[0],clamp(b[1],1,3),b[2]],look2:V3=[y[0],1.1,y[1]];
 const look=mix3(mix3(look0,look1,toBall),look2,toHero);
 const pos:V3=add(GCAM,[-12*toHero,2.6*toHero,10*toHero]),F=key(t,mono([[0,2400],[q.md,1900],[q.po,1650],[q.po+.8,1700],[q.yo,1700],[q.yo+1.2,3900],[q.end,4300]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.po;
  const shake=t>=hitT?8*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined,post:goalIn>0?settle(goalIn,0,{freq:9,decay:7}):0});
  // the ball's path: dotted ink while it swerves (out past the post, then back in)
  if(tp>CONTACT&&tp<T_GOAL+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),3,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}s.fill(K,dots,.6);}
  // "past Maignan's dive": his reach line — the glove's furthest point — and the ball beyond it
  const reach=sm(q.md,q.md+.35,tt,easeOutBack)*(1-sm(q.yo-.3,q.yo+.2,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:14,hero:t>q.yo,cap:t>q.end-.7||t<.6});
  if(reach>.02){const g=posOf(GK,tp),a=P(c,[g[0],.05,-2.5]),b=P(c,[g[0],.05,lerp(-2.5,-3.3,reach)]),k=kAt(c,[g[0],0,-3]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.25)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.06*k),{taper:0,wobble:0,gaps}),.9*reach);}
  if(tp>CONTACT+.5&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:160,width:7,cov:.8});}
  postSpark(s,c,tp,1.6);
  // "off the post": a yellow ring flashes round the far post where the ball kissed it
  const pf=sm(q.po,q.po+.25,tt,easeOutBack)*(1-sm(q.po+1,q.po+1.5,tt));if(pf>.02&&depthOf(c,POST)>NEAR+.3){const p=P(c,POST);yRing(s,p[0],p[1],.35*kAt(c,POST)*pf,Math.max(5,.05*kAt(c,POST)));}
  // "Euro history": a yellow ring round him as he slides on his knees
  const eh=sm(q.eh,q.eh+.35,tt,easeOutBack);if(eh>.02){const pr=new Path2D();ringAt(pr,c,YAM,tp,eh,1.3);yInk(s,pr,.95);}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(YAM,tau),p:V3=[x,1.1,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): open your body, curl it around the defender toward the far post =================
const ch4q=()=>({yt:T(3,'Your turn'),ob:T(3,'open your body'),ci:T(3,'curl it'),ad:T(3,'around the defender'),fp:T(3,'far post'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,1.5],[q.ob,2.15],[q.ci,CONTACT],[q.ad,CONTACT+.3],[q.fp,T_GOAL-.05],[q.end,T_GOAL+.25]]),x=>x);};
const LCAM=(t:number)=>{const q=ch4q(),v=key(t,mono([[0,-7.4,4.6,2.6,1750],[q.ob,-5.8,4,1.2,2150],[q.ci,-6.2,4.3,1,2000],[q.fp,-7,4.6,.8,1850],[q.end,-7.4,4.8,.8,1800]]),easeInOutSine,true);
 const lk=sm(0,q.ci,t,easeInOutSine);return cam([B2[0]+v[0],v[1],B2[1]+v[2]],[lerp(-17,-14,lk),.4,lerp(5.4,3.2,lk)],v[3]);};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Yamal, the goal in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[4,0,-30],[4,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(B2[0]+.5,B2[1],6),.2);s.tone(Y,pool(B2[0]+.3,B2[1],3.2),.2);s.tone(Y,pool(-1,-1,5),.15);
  goal(s,c,tp>T_GOAL?netRipple(tp-T_GOAL,NET_HIT):undefined,tp>T_GOAL?settle(tp-T_GOAL,0,{freq:9,decay:7}):0);
  // "Your turn": a ring round the ball at his feet
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.ob,q.ob+.4,tt));if(yt>.02){const b=ballAt(tp),g=groundRing(c,b[0],b[2],.55*yt,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,b)),{close:true,taper:0,wobble:.6}),.95);}
  // "open your body": the arc on the grass swinging open from straight-on to the far post
  const op=sm(q.ob,q.ob+.7,tt)*(1-sm(q.ad,q.ad+.5,tt));
  if(op>.02){const y0=YS-55*D2R,y1=lerp(y0,YS,op),pts:Pt[]=[];for(let i=0;i<=16;i++){const a=lerp(y0,y1,i/16),[fx,fz]=dirOf(a),p:V3=[YP[0]+fx*1.7,.03,YP[1]+fz*1.7];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(6,.08*kAt(c,[YP[0],0,YP[1]]));yInk(s,ribbon(pts,w,{taper:.1,wobble:.8}),.95);yInk(s,head(pts,w),.95);}}
  // "around the defender": the straight line is blocked (dashed, crossed out at Rabiot); the curl goes round him
  const ad=sm(q.ad-.2,q.ad+.3,tt)*(1-sm(q.end-.8,q.end-.3,tt));
  if(ad>.02){const a=P(c,[B2[0],.03,B2[1]]),r=posOf(RAB,CONTACT),rb:V3=[r[0],.03,B2[1]+(r[0]-B2[0])*(HIT[2]-B2[1])/(HIT[0]-B2[0])],bb=P(c,rb),k=kAt(c,rb),gaps:[number,number][]=[];for(let x=.1;x<1;x+=.2)gaps.push([x,x+.1]);
   s.fill(Y,ribbon([a,bb],Math.max(4,.05*k),{taper:0,wobble:0,gaps}),.8*ad);const x0=bb,d=Math.max(8,.25*k)*ad;s.fill(Y,ribbon([[x0[0]-d,x0[1]-d],[x0[0]+d,x0[1]+d]],Math.max(4,.06*k),{taper:0,wobble:.4}),.95);s.fill(Y,ribbon([[x0[0]-d,x0[1]+d],[x0[0]+d,x0[1]-d]],Math.max(4,.06*k),{taper:0,wobble:.4}),.95);
   const pr=new Path2D();ringAt(pr,c,RAB,tp,ad,1);yInk(s,pr,.95);}
  // "curl it": the curved path draws itself ahead of the strike, dotted in the air, its shadow on the grass
  const ci=sm(q.ci-.4,q.ci+.6,tt,easeOut);if(ci>.02){const air=curlPath(c,ci,true),gr=curlPath(c,ci,false),dots=new Path2D();air.forEach((p,i)=>{if(i%2)return;dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);});yInk(s,dots,.95);
   if(gr.length>1)s.tone(Y,ribbon(gr,10,{taper:.2,wobble:.6}),.5);}
  postBracket(s,c,sm(q.fp-.1,q.fp+.3,tt,easeOutBack));
  const styleOf=(k:number)=>k===YAM?duo(YAMAL,true):duo(ACTORS[k].style);
  drawWorld(s,c,tau,tp,{ballMin:14,hero:true,only:[YAM,RAB,GK],style:styleOf,duoBall:true});
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:11});}
  postSpark(s,c,tp,1.3);},
 still:5.5,
};

const story:RisoStory={
 id:'yamal-france-2024',format:'11v11',title:"Yamal's curler",
 theme:'Open your body and curl it around the defender toward the far post.',
 ageNote:'UEFA Euro 2024 semi-final, Spain 2–1 France, Munich, 9 July 2024. Aged 16, the youngest scorer in European Championship history.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a curler — the ball swerves away from the point along a yellow bending trail. Reduced motion: the ball and the curve, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),pt=(v:number):Pt=>[x+v*260-Math.sin(v*Math.PI)*120,y-v*150-Math.sin(v*Math.PI)*40];
  const trail:Pt[]=[];for(let i=0;i<=16;i++)trail.push(pt(i/16*Math.max(.15,u)));
  s.fill(Y,ribbon(trail,14,{taper:.6,wobble:1}),.9);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  const b=pt(u);whiteBall(s,b[0],b[1],48,age*12+hash(seed,3)*TAU);
 },
};
export default story;
